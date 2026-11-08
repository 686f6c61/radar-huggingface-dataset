# joey00072/ohara-d28-a1b-s4a

## Resumen

ohara-d28-a1b-s4a es un checkpoint de preentrenamiento (fase 1, contexto de 4k) del modelo híbrido causal encoder-decoder de la familia ohara, desarrollado por el usuario joey00072. Se trata de un modelo base, no ajustado por instrucciones, con 23.846.942.486 parámetros totales según los pesos en safetensors, pero con solo 0,98B de parámetros activos en la matriz troncal (1,25B incluyendo la cabeza LM). La nomenclatura d28-a1b-s4a indica la configuración: 28 capas de profundidad, aproximadamente 1B de parámetros activos y 4k de longitud de contexto en esta etapa.

El modelo combina atención híbrida (SWA + atención global puenteada por KV + atención token-sparse), residual mHC, memoria de n-gramas y una capa MoE con 256 expertos top-8 más un experto compartido. Utiliza el tokenizador de Qwen3. Es relevante como ejemplo de arquitectura experimental de tipo MoE disperso con atención híbrida, aunque se encuentra en una fase temprana de preentrenamiento (paso 1192, 14.998.831.104 tokens procesados, hito del 75 %).

Al ser un checkpoint base sin ajuste instructivo y con un contexto limitado a 4k, no está pensado para uso directo en producción, sino como material de investigación y como base para fases posteriores de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido causal encoder-decoder (ohara_hybrid): SWA + atención global puenteada por KV + atención token-sparse, residual mHC, memoria de n-gramas, MoE con 256 expertos top-8 + experto compartido |
| Parametros totales | 23.846.942.486 |
| Parametros activos | 0,98B en la matriz troncal; 1,25B incluyendo la cabeza LM |
| Longitud de contexto | 4096 tokens (etapa 1 de preentrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido causal encoder-decoder denominado d28 `final_v2`. Incorpora atención de ventana deslizante (SWA) combinada con atención global puenteada por KV y atención token-sparse, además de un mecanismo de residual mHC y una memoria de n-gramas. La capa MoE cuenta con 256 expertos con enrutamiento top-8 y un experto compartido, lo que explica la gran diferencia entre parámetros totales (23,85B) y activos (0,98B en el tronco, 1,25B con la cabeza LM). El tokenizador es el de Qwen3.

El entrenamiento corresponde a la etapa 1 de preentrenamiento con contexto de 4k. El checkpoint documentado está en el paso 1192, con 14.998.831.104 tokens procesados (hito del 75 %) y una pérdida de entrenamiento de 1,3699 nats. No se dispone de información sobre la composición del dataset, el uso de RLHF/DPO ni otras innovaciones de decodificación. El repositorio ocupa 143,1 GB e incluye las tres ramas `step-NNNNNN` más recientes, además de las etiquetas `pre_decay` y `final`.

## Capacidades

- Generación de texto autoregresiva como modelo base de lenguaje.
- Razonamiento y modelado de lenguaje general (sin ajuste instructivo, por lo que no sigue instrucciones de forma fiable).
- Capacidad multilingüe potencial heredada del tokenizador Qwen3, aunque no se documentan idiomas soportados.
- Soporte de tool calling / function calling: no disponible (modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Memoria de n-gramas integrada en la arquitectura como mecanismo de contexto.

## Casos de uso

- Investigación en arquitecturas MoE dispersas: el modelo permite estudiar el comportamiento de 256 expertos top-8 con experto compartido y su eficiencia en parámetros activos frente a totales.
- Estudio de atención híbrida: sirve para analizar empíricamente la combinación de SWA, atención global puenteada por KV y atención token-sparse en tareas de modelado de lenguaje.
- Base para fine-tuning posterior: al ser un checkpoint base, puede emplearse como punto de partida para ajuste supervisado o instructivo en dominios concretos, siempre que se respete la licencia (no disponible).
- Evaluación de memoria de n-gramas: útil para medir el impacto de este mecanismo en la perplejidad y en la coherencia a contextos de 4k.
- Reproducción de experimentos de preentrenamiento: el repositorio incluye ramas por paso y etiquetas de hitos, lo que facilita el análisis de la evolución del entrenamiento.
- Benchmarking de eficiencia: con 0,98B de parámetros activos, es adecuado para comparar latencia y throughput frente a modelos densos de tamaño similar en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 23,85B parámetros totales en safetensors (probablemente bf16/fp16), se requerirían aproximadamente 48 GB solo para los pesos; en cuantización de 8 bits rondaría 24 GB y en 4 bits unos 12-14 GB, aunque no se documentan tipos de cuantización soportados.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar A100 80GB o H100 para precisión completa; en consumer GPU solo con cuantización agresiva.
- ¿Cabe en consumer GPU? Potencialmente en GPUs con 16-24 GB si se cuantiza a 4-8 bits, pero no está confirmado por el autor.
- Opciones de despliegue: la librería `ohara` (carga mediante `ohara.pretrain.export.load_hf`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohara-d28-a1b-s4a | 23,85B | 0,98B (1,25B con LM head) | 4096 | no disponible | Hugging Face (joey00072) |
| ohara-d28-a1b-s3a | ~24B (según búsqueda) | no disponible | no disponible | no disponible | Hugging Face (joey00072) |
| Alternativas MoE de ~20-25B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint base de preentrenamiento, no ajustado por instrucciones: no debe esperarse que siga instrucciones ni mantenga diálogos útiles sin fine-tuning.
- Contexto limitado a 4096 tokens en esta etapa, insuficiente para tareas de contexto largo.
- Pérdida de entrenamiento de 1,3699 nats en el paso 1192; el modelo no ha completado el preentrenamiento (hito del 75 %), por lo que su calidad es limitada.
- Licencia no disponible: no se puede confirmar el uso comercial; se debe contactar con el autor antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: el comportamiento multilingüe es incierto pese al tokenizador Qwen3.
- Riesgo de alucinación y sesgos: no evaluado ni documentado.
- Sin soporte documentado de cuantización ni de frameworks de despliegue estándar (vLLM, llama.cpp, etc.), lo que complica su uso en producción.
- El repositorio ocupa 143,1 GB e incluye solo las tres ramas `step-NNNNNN` más recientes; las anteriores se eliminan, lo que limita la reproducibilidad de experimentos antiguos.

## Enlaces

- Hugging Face: https://huggingface.co/joey00072/ohara-d28-a1b-s4a
- GitHub del proyecto ohara: https://github.com/joey00072/ohara
- Modelo relacionado ohara-d28-a1b-s3a: https://huggingface.co/joey00072/ohara-d28-a1b-s3a
