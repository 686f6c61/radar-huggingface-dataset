# Schroding18/GLM-5.3-EXL3-FULL256-2xSpark

## Resumen

GLM-5.3-EXL3-FULL256-2xSpark es una cuantización derivada del modelo GLM-5.3 de Z.ai, publicada por el usuario Schroding18 en Hugging Face. Se trata de un checkpoint EXL3 (formato de exllamav3) que conserva la totalidad de los 256 expertos enrutados por capa MoE del modelo original, sin poda alguna, y que ha sido dimensionado para residir íntegramente en la memoria unificada de dos estaciones NVIDIA DGX Spark (2 x 128 GB). El modelo base declara 753B parámetros, 78 capas y 8 expertos activos de 256 por capa.

La motivación del checkpoint es puramente de despliegue: reducir un modelo de 753B parámetros a unos 214 GB en disco mediante cuantización de expertos en formato trellis EXL3 con anchos mixtos de 1 a 4 bits, con una media de 2,0783 bits por peso en las proyecciones enrutadas. Emplea paralelismo tensorial mediante TensorFold, un motor de inferencia alternativo, y no es cargable por transformers estándar ni por llama.cpp.

Es relevante ahora porque demuestra una vía para servir modelos MoE de escala frontera en hardware de consumo profesional (dos DGX Spark) manteniendo todos los expertos, a costa de una pérdida de calidad no medida por el autor. Incluye además una variante "uncensored" con 119 tensores sustituidos mediante un delta de abliteración (eliminación de rechazos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención DSA (glm_moe_dsa), 78 capas |
| Parametros totales | 753B (modelo base) |
| Parametros activos | 8 expertos enrutados de 256 por capa MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis con anchos mixtos de 1 a 4 bits en expertos (media 2,0783 bpw); capas densas, atención, embedding, head y capa MTP en EXL3/BF16 |
| Idiomas soportados | no disponible |
| Licencia | GLM-5.3 License (license_name: glm-5.3, license: other) |
| Formato de pesos | safetensors (137 shards, ~214 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer MoE con 753B parámetros, 78 capas y 256 expertos enrutados por capa de los cuales 8 están activos. La arquitectura interna se identifica en el repositorio como `glm_moe_dsa`, lo que sugiere un mecanismo de atención denominado DSA, aunque el autor no detalla su funcionamiento. La capa MTP (multi-token prediction) está presente y se carga en EXL3/BF16.

Este checkpoint no aporta entrenamiento nuevo: es una cuantización del modelo de Z.ai. Los expertos enrutados de las capas 3 a 77 se cuantizan en EXL3 trellis con anchos por proyección de 1 a 4 bits, elegidos según la frecuencia de enrutamiento de cada experto en la carga de trabajo del autor; 40.994 de las 57.600 proyecciones enrutadas llevan esos anchos elegidos por carga, y el resto conserva el ancho EXL3 previo. Además, 119 tensores se sustituyen por un delta de abliteración para eliminar rechazos. El autor indica que todos los shards pasaron una verificación de escritura y lectura en tiempo de construcción, pero que eso no valida la calidad del modelo.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base GLM-5.3; no se documentan capacidades específicas adicionales en la información disponible.
- Soporte de tool calling implícito en el modelo base, aunque el autor advierte que es precisamente donde más se nota la pérdida por la cuantización a ~2 bits.
- Recuperación exacta de información (exact recall) también señalada como área de degradación esperada.
- Comportamiento sin rechazos: la variante uncensored no rechazará peticiones que el modelo original rechazaría.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de 753B en hardware de gama profesional: dos DGX Spark con 2 x 128 GB de memoria unificada permiten mantener el checkpoint completo residente con TensorFold, algo imposible con cuantizaciones de mayor tamaño.
- Investigación sobre cuantización extrema de MoE: el checkpoint sirve para estudiar el impacto de anchos mixtos de 1 a 4 bits por experto en la calidad de salida, comparándolo con builds de 2,75 bpw del mismo modelo.
- Experimentación con abliteración a escala: los 119 tensores sustituidos permiten analizar el efecto de la eliminación de rechazos en un modelo de este tamaño.
- Evaluación de motores de inferencia alternativos: útil para probar TensorFold con soporte `glm_moe_dsa` y paralelismo tensorial de dos rangos, frente a vLLM o llama.cpp.
- Pruebas de robustez y alineación: al no rechazar peticiones, es un banco de pruebas para estudiar comportamientos del modelo sin capas de rechazo, con las cautelas éticas y legales correspondientes.
- Reproducción de pipelines de cuantización EXL3: el formato trellis y la selección de anchos por frecuencia de enrutamiento sirven como referencia para construir checkpoints propios con exllamav3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no hay puntuaciones de benchmark ni divergencia KL para este checkpoint, y que no existe tabla de velocidad publicada; el throughput depende de los parches del motor, la longitud de contexto y la configuración del drafter.

## Requisitos de hardware

- VRAM/memoria estimada: ~214 GB en disco; requiere al menos 2 x 128 GB de memoria unificada para residir completo.
- GPU recomendadas: dos NVIDIA DGX Spark (2 x 128 GB de memoria unificada) con TensorFold parcheado y layout de dos rangos.
- No cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) ni en una sola A100/H100 de 80 GB.
- Opciones de despliegue: exclusivamente TensorFold con soporte `glm_moe_dsa`; no es cargable por transformers estándar ni por llama.cpp. Los parches para el layout de dos Spark no se incluyen en el repositorio.
- Latencia y throughput: no disponibles; dependen de los parches del motor, la longitud de contexto y los ajustes del drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-FULL256-2xSpark | 753B (8 de 256 expertos activos) | no disponible | EXL3 1-4 bits, media 2,0783 bpw | GLM-5.3 License | Hugging Face, requiere TensorFold parcheado |
| zai-org/GLM-5.3 (base) | 753B (8 de 256 expertos activos) | no disponible | BF16 original | GLM-5.3 License | Hugging Face |
| Build EXL3 de 2,75 bpw del mismo modelo (mencionado por el autor) | 753B | no disponible | EXL3 2,75 bpw | GLM-5.3 License | no disponible |
| Otros modelos de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Calidad no medida: no hay divergencia KL ni benchmarks; el autor espera más pérdida que en un build EXL3 de 2,75 bpw, especialmente en tool calls y recall exacto.
- Cuantización agresiva: media de 2,0783 bits por peso en expertos enrutados, con proyecciones a 1 bit, lo que puede degradar tareas de precisión.
- Requiere software específico: TensorFold con soporte `glm_moe_dsa` y layout de dos rangos; los parches no se distribuyen, lo que limita la reproducibilidad.
- Variante uncensored: la abliteración elimina rechazos, con implicaciones éticas, legales y de seguridad en producción.
- Licencia GLM-5.3 License: conviene revisar el archivo LICENSE antes de cualquier uso comercial; es una licencia "other", no estándar.
- Idiomas y contexto no documentados: no se especifican idiomas soportados ni longitud de contexto.
- Sin validación de calidad en el build: la verificación de los shards solo comprueba integridad de escritura/lectura, no el comportamiento del modelo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado.

## Enlaces

- Hugging Face: https://huggingface.co/Schroding18/GLM-5.3-EXL3-FULL256-2xSpark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Organización Z.ai: https://huggingface.co/zai-org
- exllamav3 (formato EXL3): https://github.com/turboderp-org/exllamav3
- TensorFold: https://github.com/ashhart/TensorFold
