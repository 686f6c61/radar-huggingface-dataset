# joey00072/ohara-d28-a1b-sft

## Resumen

ohara-d28-a1b-sft es un checkpoint de preentrenamiento de la familia ohara, una implementación de un modelo causal encoder-decoder híbrido desarrollada por el usuario joey00072. Se trata de la variante d28 `final_v2`, que combina atención con ventana deslizante (SWA), atención global con puente KV y atención token-sparse, además de residuales mHC y memoria de n-gramas. El modelo incorpora una capa MoE de 256 expertos con top-8 más un experto compartido, lo que da lugar a 23,85 mil millones de parámetros totales pero solo unos 0,98 mil millones de parámetros activos en la matriz troncal (1,25 mil millones incluyendo la cabeza LM).

El checkpoint corresponde al paso 1750 de preentrenamiento, con 3.670.016.000 tokens procesados y una longitud de contexto de 4k tokens. No es un modelo ajustado por instrucciones: es un modelo base, lo que significa que está pensado como punto de partida para fine-tuning posterior, no para uso conversacional directo. Utiliza el tokenizador de Qwen3 y se distribuye en formato safetensors a través de la librería `ohara`.

Su relevancia radica en la exploración de arquitecturas híbridas eficientes: al mantener una proporción muy baja de parámetros activos respecto al total (aproximadamente un 4 %), el modelo busca reducir el coste computacional de inferencia manteniendo una capacidad de representación elevada. Es un proyecto de investigación abierto, con cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de un artefacto reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder híbrido con atención SWA + global con puente KV + token-sparse, residuales mHC, memoria de n-gramas y MoE |
| Parámetros totales | 23.846.942.486 (23,85 B) |
| Parámetros activos | 0,98 B en la matriz troncal; 1,25 B incluyendo la cabeza LM |
| Longitud de contexto | 4k tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura causal encoder-decoder híbrida denominada `ohara_hybrid`. La atención combina tres mecanismos: ventana deslizante (SWA) para capturar dependencias locales, atención global con puente KV para propagar información a larga distancia y atención token-sparse para reducir el coste computacional. Los residuales mHC y la memoria de n-gramas complementan el diseño. La capa MoE contiene 256 expertos con enrutamiento top-8 más un experto compartido, lo que explica la gran diferencia entre parámetros totales y activos.

El entrenamiento se realizó sobre 3.670.016.000 tokens, alcanzando el paso 1750 con una pérdida de entrenamiento de 0,6887 nats. Se trata de un checkpoint de preentrenamiento de etapa 1 con contexto de 4k, sin ajuste por instrucciones ni RLHF/DPO documentado. El tokenizador empleado es el de Qwen3. No se dispone de información sobre la composición del dataset de entrenamiento ni sobre innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva como modelo base de lenguaje.
- Razonamiento y modelado de lenguaje general, limitado por su naturaleza de checkpoint de preentrenamiento sin ajuste instructivo.
- Procesamiento de contexto de hasta 4k tokens.
- Arquitectura MoE con 256 expertos y top-8, orientada a eficiencia computacional en inferencia.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en arquitecturas híbridas: sirve como base para estudiar el comportamiento de atención SWA combinada con atención global y token-sparse en tareas de modelado de lenguaje, permitiendo comparar con transformers densos equivalentes.
- Fine-tuning supervisado para tareas específicas: al ser un checkpoint base, puede ajustarse con SFT sobre dominios concretos (legal, médico, técnico) partiendo de un modelo con 23,85 B de parámetros totales pero bajo coste de inferencia por sus 0,98 B activos.
- Experimentación con enrutamiento MoE: los 256 expertos con top-8 permiten analizar patrones de activación y especialización de expertos en un entorno controlado y reproducible con la librería `ohara`.
- Evaluación de eficiencia computacional: su proporción de parámetros activos (aproximadamente 4 %) lo hace adecuado para medir throughput y latencia en comparación con modelos densos de tamaño similar en GPUs de gama alta.
- Desarrollo de pipelines de preentrenamiento: el repositorio `ohara` y los checkpoints por pasos (`step-NNNNNN`) permiten reproducir curvas de entrenamiento y validar recetas de preentrenamiento a escala de 3,67 B tokens.
- Base para investigación en memoria de n-gramas: el componente de memoria de n-gramas puede estudiarse de forma aislada para tareas de recuperación léxica o modelado de secuencias largas dentro de la ventana de 4k tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los 23,85 B de parámetros totales en safetensors ocupan aproximadamente 47,7 GB en fp16; el repo completo pesa 143,1 GB, lo que sugiere que incluye múltiples checkpoints o estados del optimizador.
- GPU recomendadas: no disponible. Por tamaño total, se necesitarían GPUs con 48 GB o más de VRAM (A100 80 GB, H100 80 GB) para cargar los pesos en precisión completa; no se confirma soporte para GPUs de consumo.
- ¿Cabe en GPU de consumo? No disponible. Con 23,85 B de parámetros totales, una RTX 4090 (24 GB) no podría alojar los pesos en fp16 sin cuantización, y no se documentan tipos de cuantización.
- Opciones de despliegue: la librería oficial es `ohara` (instalable con `pip install -e ohara` desde el repositorio de GitHub). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohara-d28-a1b-sft | 23,85 B | 0,98 B (1,25 B con LM head) | 4k | no disponible | Hugging Face (joey00072) |
| ohara-d28-a1b-s3a | 24 B (según búsqueda) | no disponible | no disponible | no disponible | Hugging Face (joey00072) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de otras familias en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento (etapa 1), no un modelo ajustado por instrucciones: no debe esperarse un comportamiento conversacional ni seguimiento de instrucciones fiable sin fine-tuning previo.
- Contexto limitado a 4k tokens, insuficiente para tareas que requieran ventanas largas (documentos extensos, conversaciones multi-turno prolongadas).
- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: aunque usa el tokenizador de Qwen3, no se garantiza un rendimiento multilingüe equilibrado.
- Riesgo de alucinación inherente a un modelo base sin alineación (sin RLHF/DPO documentado).
- Sesgos conocidos: no disponible; al no documentarse la composición del dataset, no es posible evaluar sesgos de dominio.
- Ecosistema limitado: solo se documenta la librería `ohara`; no hay soporte confirmado en frameworks estándar de inferencia (vLLM, TGI, llama.cpp), lo que dificulta su integración en producción.
- Métricas de calidad escasas: solo se reporta la pérdida de entrenamiento (0,6887 nats) en el paso 1750; no hay evaluaciones de validación ni benchmarks públicos.
- Proyecto de nicho con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joey00072/ohara-d28-a1b-sft
- Checkpoint relacionado (s3a): https://huggingface.co/joey00072/ohara-d28-a1b-s3a
- Repositorio GitHub del proyecto ohara: https://github.com/joey00072/ohara
