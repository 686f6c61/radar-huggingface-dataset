# bambocher/Qwen3.5-2B-oQ2.7e-mtp

## Resumen

`bambocher/Qwen3.5-2B-oQ2.7e-mtp` es un checkpoint cuantizado del modelo Qwen3.5-2B de Alibaba Cloud, publicado por el usuario bambocher mediante la herramienta oQ (oMLX v0.7.1rc1). No es un modelo entrenado desde cero, sino una redistribución con cuantización de precisión mixta orientada a inferencia local en Apple Silicon a través de MLX. El checkpoint conserva la torre de visión y la cabeza MTP (multi-token prediction) del modelo original, lo que lo convierte en una pieza útil para experimentar con decodificación especulativa en hardware de consumo.

El interés técnico está en su estrategia de cuantización: el 58,7 % de los pesos lógicos se almacenan en 2 bits afines con grupo de 64, mientras que la torre de visión y parte de las capas sensibles se mantienen en BF16. El resultado es un peso efectivo medio de 5,375 bits por parámetro y un repositorio de 1,5 GB para 2.274 millones de parámetros totales. Frente a una cuantización uniforme de 4 bits, este esquema reduce el tamaño a costa de concentrar la pérdida de precisión en el modelo de lenguaje.

Es relevante ahora porque la serie Qwen3.5 apunta a inferencia en dispositivo con capacidades multimodales, y este checkpoint demuestra hasta dónde se puede comprimir un modelo de 2B sin descartar visión ni la cabeza MTP. Ahora bien, se trata de una publicación con 10 descargas y 0 likes, sin benchmarks propios ni licencia declarada en la ficha de HuggingFace, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5 (etiqueta `qwen3_5`), con torre de visión y cabeza MTP; no se documenta como MoE |
| Parametros totales | 2.274.069.824 (2,274B), según safetensors |
| Parametros activos | No aplica (no se indica arquitectura MoE; sin desglose de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Afín de 2, 4, 5, 6 y 8 bits con grupo de 64, más capas en BF16; 5,375 bits/peso efectivos |
| Idiomas soportados | No disponible (la serie Qwen3.5 se describe como multilingüe, sin listado oficial) |
| Licencia | No disponible en la información proporcionada |
| Formato de pesos | safetensors (formato MLX), librería `mlx` |
| Tamano del repositorio | 1,5 GB (1,528 GB / 1,423 GiB) |
| Distribucion de pesos por precision | 2-bit: 1,335B (58,698 %); 4-bit: 0,025B (1,107 %); 5-bit: 0,461B (20,281 %); 6-bit: 0,083B (3,646 %); 8-bit: 0,030B (1,301 %); BF16: 0,340B (14,967 %) |
| Desglose por componente | Lenguaje: 1,882B / 0,758 GiB; visión: 0,331B / 0,617 GiB; cabeza MTP: 0,061B / 0,048 GiB |
| Herramienta de cuantizacion | oQ (oMLX v0.7.1rc1) |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles sobre el entrenamiento del modelo base: no se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si se documenta es la estructura del checkpoint cuantizado, que se descompone en tres bloques: un modelo de lenguaje de 1,882B de parametros, una torre de vision de 0,331B y una cabeza MTP de 0,061B. La presencia de vision y de la cabeza MTP confirma que el modelo base Qwen3.5-2B es multimodal y que incorpora prediccion multi-token, un mecanismo habitual para acelerar la decodificacion mediante tecnicas especulativas.

La innovacion principal de esta publicacion es el esquema de cuantizacion de precision mixta. La mayor parte del modelo de lenguaje (1,335B de parametros, casi el 59 % del total) se almacena en 2 bits afines con grupo de 64, mientras que el 20,3 % se mantiene en 5 bits y el 15 % restante en BF16. La torre de vision queda practicamente intacta en BF16 (0,331B de los 0,340B en BF16), lo que sugiere que el autor prioriza preservar la calidad visual dejando la compresion agresiva para las capas de lenguaje. El resultado son 1,423 GiB de pesos con 5,375 bits efectivos por peso, un punto intermedio entre una cuantizacion de 4 bits uniforme y una de 6 bits.

No se han publicado datos sobre que capas concretas reciben cada precision, ni sobre el criterio de asignacion (sensibilidad por capa, por modulo, etc.), ni sobre la perdida de calidad medida frente al modelo original.

## Capacidades

- Generacion de texto y razonamiento en el modelo de lenguaje, heredados del Qwen3.5-2B base (sin validacion publicada para este checkpoint).
- Comprension de imagenes: el checkpoint conserva la torre de vision (0,331B) en BF16, por lo que mantiene las capacidades multimodales del modelo original.
- Decodificacion especulativa mediante la cabeza MTP de 0,061B, que permite proponer varios tokens por paso si el runtime la soporta.
- Capacidades multilingues heredadas de la serie Qwen3.5, descrita por sus distribuidores como multilingue (sin listado de idiomas en la informacion disponible).
- Razonamiento, codigo y uso de agentes: la pagina de Ollama de la serie Qwen3.5 cita mejoras en benchmarks de razonamiento, codigo, agentes y comprension visual frente a Qwen3 y Qwen3-VL, aunque sin cifras y sin verificar para este checkpoint cuantizado.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion proporcionada.
- No se documenta soporte de audio ni de otros modos distintos de texto e imagen.

## Casos de uso

- Asistente local en Mac con privacidad estricta: con 1,43 GiB de pesos, el modelo cabe holgadamente en la memoria unificada de un Apple Silicon de 8 GB y permite procesar texto e imagenes sin enviar datos a la nube, algo relevante para documentos internos o material medico.
- Analisis de capturas de pantalla y documentos escaneados: la torre de vision se conserva en BF16, de modo que tareas de OCR, lectura de tablas o preguntas sobre imagenes mantienen la precision del modelo original mientras el lenguaje ocupa mucho menos espacio.
- Prototipado rapido de aplicaciones multimodales en MLX: al estar empaquetado para `mlx`, se puede cargar con `mlx-lm`/`mlx-vlm` y servir como banco de pruebas de pipelines de vision-lenguaje en un portatil.
- Experimentacion con decodificacion especulativa: la cabeza MTP incluida permite medir la ganancia de throughput de la prediccion multi-token frente a la decodificacion autoregresiva clasica, util para investigacion en optimizacion de inferencia.
- Generacion de codigo en local para entornos sin conectividad: un modelo de 2B cuantizado puede integrarse en editores o scripts de CLI para autocompletado y explicacion de fragmentos, asumiendo menor calidad que modelos mayores (no hay benchmarks que lo confirmen).
- Chat multilingue offline en dispositivos de gama media: al ocupar 1,5 GB en disco, es viable distribuirlo junto a una aplicacion de escritorio para asistencia basica sin infraestructura de servidor.
- Evaluacion comparativa de tecnicas de cuantizacion: util como punto de la curva (5,375 bits efectivos) frente al hermano `oQ8e-mtp` del mismo autor, para medir el compromiso entre tamano y calidad en un modelo multimodal pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, y los resultados de busqueda solo aportan afirmaciones cualitativas sobre la serie Qwen3.5 (mejoras en razonamiento, codigo, agentes y comprension visual frente a Qwen3 y Qwen3-VL), sin cifras ni evaluaciones especificas de este checkpoint cuantizado.

## Requisitos de hardware

- Peso en disco y en memoria: 1,528 GB (1,423 GiB) de pesos; a esta cifra hay que sumar la cache KV y las activaciones, cuyo tamano no se documenta.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del checkpoint, el modelo entra en cualquier equipo con 4 GB o mas de memoria disponible para pesos, y con 8 GB se dispone de margen para contexto e imagenes.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips de Apple (series M1, M2, M3 y M4). Un Mac con 8 GB de memoria unificada es el minimo practico; 16 GB o mas es recomendable para contextos largos o procesamiento de imagenes en lote.
- GPU NVIDIA o AMD: no soportadas de forma nativa por MLX; no se documenta una conversion a GGUF o a otros formatos en la informacion disponible.
- Cabe en GPU de consumo: si, en Apple Silicon de gama base; en el ecosistema NVIDIA no hay ruta oficial documentada para este checkpoint.
- Opciones de despliegue: MLX (`mlx`, `mlx-lm`, `mlx-vlm`), descarga via `hf download`, y clientes de escritorio compatibles con modelos MLX como LM Studio (la variante `oQ8e-mtp` del mismo autor aparece listada con ese soporte). Ollama distribuye `qwen3.5:2b`, pero no esta cuantizacion concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `bambocher/Qwen3.5-2B-oQ2.7e-mtp` (este) | 2,274B | Mixta 2/4/5/6/8-bit + BF16, 5,375 bits/peso | 1,528 GB | No disponible | No disponible | MLX, 10 descargas |
| `bambocher/Qwen3.5-2B-oQ8e-mtp` | No disponible en la informacion | oQ con mayor precision efectiva (etiqueta `oQ8e`) | No disponible | No disponible | No disponible | MLX; listado en LM Studio y Atomic Chat |
| Qwen3.5-2B (original, Alibaba Cloud) | ~2B | BF16 (presumiblemente, no confirmado) | No disponible | No disponible | No disponible | Referenciado en Qualcomm AI Hub y Ollama (`qwen3.5:2b`) |

La comparacion con modelos de otras familias (por ejemplo, Qwen3-VL o alternativas multimodales de 2-3B) no esta disponible en la informacion proporcionada: no hay especificaciones, contextos ni resultados de benchmarks de esos modelos en las fuentes consultadas.

## Limitaciones y advertencias

- La cuantizacion es muy agresiva en el modelo de lenguaje: el 58,7 % de los pesos estan en 2 bits, lo que previsiblemente degrada el razonamiento, las matematicas y la fidelidad de la generacion frente al BF16 original. No hay evaluacion publicada que cuantifique esa perdida.
- La cabeza MTP puede no ser aprovechada por todos los runtimes; sin soporte explicito, se comporta como un peso muerto y el beneficio de velocidad desaparece.
- Licencia no declarada en la ficha de HuggingFace: no se puede asumir uso comercial libre. Es necesario verificar la licencia del Qwen3.5-2B original antes de cualquier despliegue productivo.
- Riesgo de alucinacion inherente a un modelo de 2B, agravado por la cuantizacion a 2 bits en la mayoria de las capas.
- Idiomas y cobertura linguistica no documentados para este checkpoint; el comportamiento multilingue es una herencia declarada de la serie, no una garantia verificada.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medirla.
- Adopcion practicamente nula (10 descargas, 0 likes, creado y actualizado el mismo dia): sin validacion de la comunidad, sin issues ni discusiones que permitan contrastar calidad.
- Dependencia de MLX limita el despliegue a hardware Apple; no hay artefactos alternativos (GGUF, TensorRT-LLM, vLLM) en la informacion disponible.
- El modelo base se distribuye tambien desde Qualcomm AI Hub para inferencia en dispositivo; este checkpoint concreto no esta validado en esa ruta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-oQ2.7e-mtp
- Variante de mayor precision del mismo autor: https://huggingface.co/bambocher/Qwen3.5-2B-oQ8e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- README del modelo en Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_2b/README.md
- Qwen3.5 2B en Ollama: https://ollama.com/library/qwen3.5:2b
