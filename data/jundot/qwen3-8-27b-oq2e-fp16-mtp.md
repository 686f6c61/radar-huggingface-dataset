# Jundot/Qwen3.8-27B-oQ2e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ2e-fp16-mtp es una cuantizacion mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de vision-lenguaje de 27.781 millones de parametros construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0), que asigna precision por capa segun su sensibilidad medida, en lugar de aplicar una cuantizacion uniforme. El checkpoint incluye el backbone de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP).

El modelo base combina capas Gated DeltaNet con capas de atencion con compuerta (Gated Attention) en un diseno hibrido, procesa imagen, video y texto, y ofrece una ventana de contexto nativa de 262.144 tokens. La cuantizacion reduce el peso total a 11,879 GiB con un promedio efectivo de 3,673 bits por peso en el checkpoint completo (3,152 bits/peso solo en el backbone de lenguaje), lo que permite ejecutar un modelo de 27B con vision en hardware Apple Silicon con memoria unificada moderada.

La relevancia practica esta en que hace viable en local un VLM de 27B con contexto muy largo y capacidad de comprension de video, manteniendo licencia Apache-2.0. La ficha se centra en esta variante cuantizada; los datos de entrenamiento, benchmarks y composicion del dataset del modelo original no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: capas Gated DeltaNet + Gated Attention (arquitectura Qwen3.5), con codificador de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | oQ2e mixta: affine 2-bit grupo 64, 3-bit grupo 128, 3-bit grupo 64, 4-bit grupo 64, 5-bit grupo 64, FP16 y FP32; promedio efectivo 3,673 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |

Datos adicionales de almacenamiento:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 10,597 GB / 9,869 GiB |
| Codificador de vision | 0,461B | 1,843 GB / 1,716 GiB |
| Cabeza MTP | 0,425B | 0,314 GB / 0,293 GiB |
| Total | 27,781B | 12,755 GB / 11,879 GiB |

Distribucion de bits por formato:

| Formato | Pesos logicos | Porcentaje | Bits/peso efectivos |
|---|---|---|---|
| Affine 2-bit, grupo 64 | 12,324B | 44,362% | 2,50 |
| Affine 3-bit, grupo 128 | 10,516B | 37,853% | 3,25 |
| Affine 3-bit, grupo 64 | 1,271B | 4,576% | 3,50 |
| Affine 4-bit, grupo 64 | 0,372B | 1,340% | 4,50 |
| Affine 5-bit, grupo 64 | 2,781B | 10,012% | 5,50 |
| FP16 | 0,055B | 0,198% | 16,00 |
| FP32 | 0,461B | 1,658% | 32,00 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B con un layout hibrido que alterna capas Gated DeltaNet (un mecanismo de estado lineal con compuertas) y capas de atencion con compuerta. Esta mezcla busca combinar la eficiencia de las capas recurrentes lineales en contextos largos con la capacidad expresiva de la atencion completa. Incluye un codificador de vision para entrada de imagen y video, y una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa interna para acelerar la generacion. El contexto nativo es de 262.144 tokens.

Esta variante concreta no ha sido reentrenada: es una cuantizacion del checkpoint original. oQ2e asigna bits segun la sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste por minimos cuadrados ponderados de escala y sesgo. La build FP16 almacena las escalas y sesgos de cuantizacion y los tensores no cuantizados en FP16 en lugar de BF16, y mantiene el codificador de vision en FP32. La revision del 19 de noviembre de 2026 re-cuantiza con un redondeo oQe refinado en oMLX 0.8.0, que reduce el error de cuantizacion al mismo tamano y velocidad. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagen y video (pipeline image-text-to-text).
- Procesamiento de contexto largo: hasta 262.144 tokens nativos.
- Prediccion multi-token (MTP) integrada, orientada a acelerar la decodificacion.
- Capacidades multilingues: no detalladas en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos con imagenes: el modelo puede procesar contratos, informes o manuales de cientos de paginas junto con sus figuras y tablas, aprovechando los 262.144 tokens de contexto para mantener coherencia entre secciones.
- Comprension de video en local: al incluir codificador de vision y soporte de video, sirve para resumir grabaciones, extraer eventos o generar descripciones temporales en un flujo que no sale del equipo.
- Asistente de investigacion sobre articulos cientificos: combina lectura de texto y de figuras en un unico prompt largo, util para revisiones de literatura y extraccion de resultados.
- Transcripcion y descripcion de capturas de pantalla en herramientas de accesibilidad: genera descripciones textuales de interfaces o imagenes para usuarios con discapacidad visual.
- Prototipado en Apple Silicon: al ser un checkpoint MLX de 11,879 GiB, permite experimentar con un VLM de 27B en un Mac con memoria unificada suficiente, sin GPU dedicada.
- Moderacion de contenido multimodal: clasificacion y descripcion de imagenes y videos enviados por usuarios, con contexto largo para revisar hilos completos.
- Generacion de documentacion tecnica a partir de diagramas: el modelo puede recibir esquemas de arquitectura o capturas de paneles y redactar explicaciones paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 11,879 GiB en disco; en ejecucion hay que sumar la cache KV, que crece con el contexto y puede ser considerable a 262.144 tokens.
- Hardware objetivo: Apple Silicon con memoria unificada; la libreria es MLX, no CUDA.
- Memoria unificada recomendada: 32 GB como minimo practico para contextos moderados; 64 GB o mas para aprovechar ventanas largas y video.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas directamente por este checkpoint MLX; requeririan otra conversion de formato.
- Despliegue: MLX y oMLX (v0.8.0 o superior para el redondeo oQe refinado). vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato tal cual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ2e-fp16-mtp (esta ficha) | 27,781B | 262.144 | Si (imagen y video) | Apache-2.0 | MLX safetensors, ~3,67 bits/peso |
| Qwen/Qwen3.8-27B (base) | 27,781B | 262.144 | Si (imagen y video) | Apache-2.0 | safetensors BF16/FP16 |
| Alternativas de 27B densas con vision | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a ~3,67 bits/peso introduce perdida de precision respecto al modelo base; el impacto exacto en tareas de razonamiento y vision no esta cuantificado en la informacion disponible.
- El codificador de vision se mantiene en FP32, por lo que el ahorro de memoria se concentra en el backbone de lenguaje.
- Solo funciona con MLX en Apple Silicon; no es portable directamente a CUDA sin reconversion.
- La cache KV a contextos cercanos a 262.144 tokens puede agotar la memoria unificada disponible.
- Riesgo de alucinacion y sesgos: no documentados para esta variante; se heredan los del modelo base, no detallados aqui.
- Idiomas soportados no declarados: no se puede garantizar calidad fuera de los idiomas del modelo original.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar el archivo LICENSE del repositorio y las condiciones del modelo base.
- Repositorio con muy pocas descargas (203) y ningun like: no hay validacion comunitaria amplia.
- La model card advierte de que se re-cuantizo el 2026-11-19; las copias anteriores deben descargarse de nuevo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ2e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
