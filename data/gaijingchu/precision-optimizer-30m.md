# gaijingchu/precision-optimizer-30M

## Resumen

precision-optimizer-30M es un repositorio de investigación publicado por el usuario gaijingchu en Hugging Face que contiene una colección de ejecuciones de entrenamiento de modelos OLMo-core de 30 millones de parámetros. El objetivo declarado es un estudio comparativo sobre la interacción entre la precisión numérica del entrenamiento (BF16 frente a cuantización falsa de 6 bits, con variantes de entero ingenuo y estilo QuEST) y el optimizador empleado (AdamW frente a Muon), usando el corpus Dolma CC como datos de entrenamiento.

No se trata de un modelo listo para producción ni de un checkpoint conversacional: el repositorio empaqueta los estados finales de cada ejecución en formato OLMo-core (`model.pt`), junto con la configuración de entrenamiento y las mediciones por ejecución (pérdida final, barridos de perturbación gaussiana de pesos y resultados de cuantización posterior al entrenamiento). Su interés es metodológico: permite reproducir y analizar cómo afectan precisión y optimizador a la calidad final de un transformer pequeño.

El tamaño del repositorio (22,7 GB) para modelos de solo 30M de parámetros se explica por la acumulación de múltiples ejecuciones y artefactos de medición, no por el tamaño de un único modelo. No hay pipeline, licencia ni idiomas declarados, lo que limita su uso fuera del ámbito de la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer OLMo-core (detalles no disponibles) |
| Parametros totales | 30M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16; cuantizacion falsa de 6 bits peso-only (`w6`) y pesos + activaciones (`f6`), variantes entero ingenuo y QuEST |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict en formato OLMo-core); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Los modelos son transformers de 30M de parámetros construidos sobre OLMo-core, la infraestructura de entrenamiento del proyecto OLMo. Cada ejecución se entrena sobre Dolma CC, el subconjunto de Common Crawl del corpus Dolma. El nombre de cada directorio codifica el tamaño del modelo (`30M`), los tokens de entrenamiento (`D<tokens>B`), la precisión de entrenamiento (`bf16`, `w<bits>` para cuantización solo de pesos, `f<bits>` para pesos y activaciones), la tasa de aprendizaje y la semilla.

El eje experimental es doble: por un lado se compara AdamW con Muon como optimizador; por otro, se compara entrenamiento en BF16 con entrenamiento usando cuantización falsa de 6 bits, tanto en variantes de entero ingenuo como en variantes estilo QuEST. El repositorio incluye además mediciones de perturbación gaussiana de pesos y de cuantización posterior al entrenamiento, lo que sugiere un análisis de robustez y de sensibilidad a la precisión más allá de la pérdida final. No se especifican el número exacto de tokens, la composición detallada del dataset ni si hubo fases de alineación (RLHF/DPO); los checkpoints intermedios y los datos de entrenamiento no están incluidos.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el tamaño de 30M de parámetros y por el corpus de entrenamiento (Dolma CC).
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües no documentadas; el entrenamiento sobre Dolma CC sugiere predominancia de inglés, pero no se confirma.
- No dispone de modo thinking, visión ni audio.
- Su función real es servir como artefacto de investigación para estudiar precisión y optimizadores, no como modelo de propósito general.

## Casos de uso

- Estudio de optimizadores: comparar AdamW y Muon sobre la misma arquitectura y datos para medir diferencias de pérdida final y estabilidad del entrenamiento, usando los JSON de mediciones incluidos en cada ejecución.
- Investigación en cuantización de entrenamiento: evaluar el impacto de la cuantización falsa de 6 bits (entero ingenuo frente a QuEST) en la calidad del modelo, con los barridos de perturbación gaussiana como señal de robustez.
- Análisis de cuantización posterior al entrenamiento: los resultados incluidos permiten estudiar cómo se degrada un modelo pequeño al cuantizarlo después de entrenar en BF16 o en 6 bits.
- Reproducción de experimentos a pequeña escala: el `launch.yaml` de cada ejecución documenta la configuración completa, lo que facilita replicar el pipeline en OLMo-core con recursos modestos.
- Docencia e investigación académica: un modelo de 30M entrenado sobre Dolma CC es un banco de pruebas asequible para cursos de entrenamiento de LLM y de eficiencia numérica.
- Base para experimentos de destilación o inicialización: al ser un checkpoint OLMo-core, puede servir como punto de partida controlado en estudios que necesiten un modelo pequeño con historial de entrenamiento conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona mediciones internas por ejecución (pérdida final, barridos de perturbación gaussiana y cuantización posterior al entrenamiento), sin cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: un modelo de 30M de parámetros en BF16 ocupa aproximadamente 60 MB de pesos; en FP32, unos 120 MB. La VRAM adicional depende de la longitud de contexto y del framework.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requieren A100 ni H100.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050 o superiores, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al estar en formato OLMo-core (`model.pt`), requiere conversión previa para usarse con vLLM, llama.cpp, Ollama o TGI; no hay pesos en safetensors ni GGUF publicados.
- Latencia y throughput: no disponibles; al ser un modelo de 30M, la latencia sería muy baja en cualquier hardware moderno, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Proposito |
|---|---|---|---|---|---|
| precision-optimizer-30M | 30M | no disponible | no disponible | `model.pt` (OLMo-core) | Estudio de precisión y optimizadores |
| OLMo-core (modelos base) | variable | no disponible | no disponible | OLMo-core | Framework de entrenamiento |
| TinyLlama 1.1B | 1.1B | 2048 | Apache 2.0 | safetensors, GGUF | Modelo pequeño de propósito general |
| Pythia 70M | 70M | 2048 | Apache 2.0 | safetensors | Suite de investigación sobre entrenamiento |

La comparación directa es limitada: precision-optimizer-30M no es un modelo de propósito general sino un conjunto de artefactos experimentales. Frente a suites como Pythia, su valor está en el diseño factorial (optimizador × precisión) más que en capacidades lingüísticas.

## Limitaciones y advertencias

- No es un modelo conversacional ni instruction-tuned: no se ha entrenado con RLHF/DPO según la información disponible, por lo que su utilidad directa en aplicaciones de usuario es nula.
- Licencia no declarada: no se puede asumir uso comercial permitido; la ausencia de licencia implica riesgo legal para cualquier despliegue.
- Idiomas no declarados: el entrenamiento sobre Dolma CC sugiere inglés, pero no se confirma ni se documenta cobertura multilingüe.
- Riesgo de alucinación y sesgos: al ser un modelo de 30M entrenado sobre web crawls, reproducirá sesgos del corpus y generará texto incoherente con alta probabilidad.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas que requieran ventanas largas.
- Formato propietario de OLMo-core: requiere conversión para integrarse en stacks estándar (vLLM, llama.cpp, TGI), y no se publican pesos en safetensors ni GGUF.
- No incluye checkpoints intermedios ni datos de entrenamiento, lo que limita la reproducibilidad completa del estudio.
- Repositorio de 22,7 GB: la descarga es costosa para el valor práctico de un modelo de 30M; conviene revisar qué ejecuciones concretas se necesitan antes de clonar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaijingchu/precision-optimizer-30M
- OLMo-core (framework de entrenamiento): no disponible en la información proporcionada
- Corpus Dolma: no disponible en la información proporcionada
- Optimizador Muon: no disponible en la información proporcionada
- Cuantización QuEST: no disponible en la información proporcionada
