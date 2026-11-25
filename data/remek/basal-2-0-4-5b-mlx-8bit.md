# Remek/basal-2.0-4.5B-MLX-8bit

## Resumen
basal-2.0-4.5B-MLX-8bit es una distribucion cuantizada a 8 bits en formato MLX del modelo basal-2.0-4.5B, desarrollado por Remigiusz Kinas (usuario Remek). No es un modelo de proposito general al uso: es un modelo de decisiones tipadas (typed decisions) afinado a partir de speakleash/Bielik-4.5B-v3.0-Instruct, orientado a tareas de clasificacion, eleccion entre opciones y calibracion de confianza en polaco e ingles. El modelo base Bielik es un proyecto de SpeakLeash y ACK Cyfronet AGH.

El modelo resuelve un problema concreto: en lugar de generar texto libre, devuelve decisiones estructuradas con margenes de confianza calibrados, lo que permite umbrales de error controlados y derivacion a revision humana. Con 4.757.260.288 parametros (aproximadamente 4,5B) y una ventana de contexto de 32.768 tokens, esta pensado para integrarse mediante el motor de inferencia propio del autor, basal-serve, que expone una API de decisiones tipadas.

Esta variante concreta esta optimizada para Apple Silicon mediante MLX en precision de 8 bits, con un tamano de repositorio de 5,2 GB y 292 descargas en Hugging Face. Su relevancia actual radica en que ofrece una alternativa ligera y ejecutable en hardware de consumo (Mac con chip M-series) para sistemas de decision automatizada con garantias de calibracion, algo poco comun en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Bielik-4.5B-v3.0-Instruct), pesos en formato MLX |
| Parametros totales | 4.757.260.288 (aproximadamente 4,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 8 bits (MLX); el proyecto publica tambien FP8, GGUF Q8_0 y GGUF Q5_K_M |
| Idiomas soportados | Polaco (pl) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 8-bit) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only heredado de Bielik-4.5B-v3.0-Instruct, que a su vez es un modelo instructivo de SpeakLeash y ACK Cyfronet AGH. Sobre esa base, el autor ha realizado un afinado especifico para decisiones tipadas (typed decisions), con soporte de calibracion de confianza mediante ficheros CALIBRATION.json. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni la presencia de RLHF o DPO en el afinado de basal-2.0.

La innovacion principal no esta en la arquitectura del transformer, sino en la capa de decision y calibracion: el modelo se evalua contra la version bf16 en terminos de acuerdo de decisiones (agreement), precision en el margen de referencia, diferencia de exactitud y diferencia de ECE (Expected Calibration Error). Para esta variante MLX 8-bit se reporta un agreement de 0,9792 en opciones 2-10, un agreement de 0,9989 con margen >= 0,2, una diferencia de exactitud de +0,0000 y una diferencia de ECE de -0,0009 respecto a bf16, con un tamano de 4,9 GB. El puerto incluye un fichero CALIBRATION.mlx.json ajustado sobre las lecturas del propio puerto (ECE en dev v2 de 0,0193 con el ajuste bf16 frente a 0,0202 con este ajuste in-sample, y 0,0245 en validacion leave-one-family-out).

## Capacidades
- Generacion de texto y conversacion en polaco e ingles, heredadas del modelo base Bielik-4.5B-v3.0-Instruct.
- Decisiones tipadas: seleccion entre opciones (hasta 255 opciones por pregunta; 20 en Ollama) con margen de confianza asociado.
- Clasificacion y eleccion calibrada con umbrales de error controlables mediante `max_error`.
- Calibracion de confianza por motor de inferencia, con ficheros de calibracion especificos (CALIBRATION.mlx.json para MLX).
- Modos de decision `act` y `multi` (experimentales en muchos labels) y modo `tool`.
- Soporte de "facts": "auto" para delegar calculos exactos y umbrales a codigo.
- API de decisiones a traves de basal-serve, con motor de inferencia propio (basal engine v2.0.0).
- Capacidades multilingues limitadas a polaco e ingles.
- No incluye cabeza de evidencia (evidence head) en la version 2.0.

## Casos de uso
- Clasificacion documental con umbral de error: el modelo puede asignar documentos a categorias predefinidas y devolver un margen de confianza calibrado, permitiendo derivar a revision humana los casos por debajo del umbral configurado con `max_error`.
- Triaje de solicitudes en atencion al cliente: con 32.768 tokens de contexto puede procesar conversaciones multi-turno o historiales largos y decidir la categoria o accion a tomar, en polaco o ingles.
- Enrutamiento de tickets y automatizacion de back-office: eleccion entre hasta 255 opciones por pregunta para dirigir cada caso al equipo o flujo correspondiente, con calibracion ajustable por el usuario.
- Sistemas de decision asistida en entornos regulados: el modelo devuelve decisiones con confianza calibrada y el diseno recomienda revision humana en decisiones con consecuencias graves para personas, lo que encaja en flujos con supervision.
- Extraccion de decisiones estructuradas en pipelines de datos: integrado via basal-serve, permite clasificar registros de forma programatica y medir la tasa de error real frente a umbrales definidos.
- Prototipado y evaluacion en local sobre Apple Silicon: al ejecutarse con MLX en un Mac (medido en Apple M4 Pro, 24 GB), permite desarrollar y validar flujos de decision sin infraestructura GPU dedicada, con 278 ms de latencia p50 en concurrencia 1 y 698 ms para 5 preguntas.
- Filtrado y moderacion de contenido con criterios multiples: uso del modo `multi` para evaluar varias etiquetas por elemento, asumiendo su caracter experimental.

## Benchmarks y rendimiento
Los datos disponibles son comprobaciones del puerto cuantizado contra el modelo bf16, no benchmarks propios del modelo. Los resultados del modelo se remiten a la model card de basal-2.0-4.5B (Werdykt, JDI, LEK, PL-Holdout y PL-Real), sin cifras disponibles en la informacion proporcionada.

| Paquete | Agreement con bf16 (opciones 2-10) | Agreement con margen >= 0,2 | Diferencia de exactitud | Diferencia de ECE | Tamano | Velocidad | Resultado |
|---|---|---|---|---|---|---|---|
| FP8 | 0,9478 | 0,9890 | -0,0008 | +0,0009 | 4,9 GB | 38,6 dec/s c16, c1 p50 29 ms (H100) | PASS |
| GGUF Q8_0 | 0,9839 | 0,9988 | +0,0002 | +0,0035 | 4,8 GB | no medida en esta release | PASS |
| GGUF Q5_K_M | 0,9569 | 0,9920 | -0,0039 | +0,0040 | 3,2 GB | no medida en esta release | PASS |
| MLX 8-bit | 0,9792 | 0,9989 | +0,0000 | -0,0009 | 4,9 GB | 278 ms c1 p50, 698 ms para 5 preguntas (Mac) | PASS |

Los umbrales de aceptacion para esta categoria son: agreement 2-10 >= 0,9415, agreement con margen de referencia >= 0,2 >= 0,9863, exactitud dentro de 1 punto de bf16 y ECE como maximo +0,01.

## Requisitos de hardware
- VRAM/memoria unificada estimada: aproximadamente 4,9 GB para los pesos en 8 bits; el modelo se midio en un Apple M4 Pro con 24 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M-series) para esta variante MLX; para las otras variantes, el autor reporta mediciones en H100 (FP8) y soporte GGUF para llama.cpp/Ollama.
- Cabe en hardware de consumo: si, en Macs con chip Apple Silicon y memoria suficiente (medido en M4 Pro de 24 GB).
- Opciones de despliegue: basal-serve con `--mode mlx` (motor propio, instalable via `uv pip install "basal[mlx]"` desde el tag v2.8.1); las variantes GGUF permiten llama.cpp u Ollama; la variante FP8 esta orientada a GPU.
- Latencia y throughput: 278 ms p50 en concurrencia 1 y 698 ms para 5 preguntas en Mac (M4 Pro); en la variante FP8 sobre H100, 38,6 decisiones/s con concurrencia 16 y 29 ms p50 en concurrencia 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-4.5B-MLX-8bit | 4,76B | 32.768 | Decisiones tipadas calibradas, MLX 8-bit | Apache-2.0 | Hugging Face (292 descargas) |
| basal-2.0-4.5B (bf16) | 4,76B | 32.768 | Decisiones tipadas calibradas, referencia bf16 | Apache-2.0 | Hugging Face |
| basal-2.0-4.5B-GGUF (Q8_0 / Q5_K_M) | 4,76B | 32.768 | Decisiones tipadas, formato GGUF para llama.cpp/Ollama | Apache-2.0 | Hugging Face |
| speakleash/Bielik-4.5B-v3.0-Instruct | 4,5B | no disponible | Modelo instructivo generalista en polaco e ingles | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias
- Validar sobre documentos propios antes de confiar en el modelo: los conjuntos ocultos y de validacion no cubren todos los dominios.
- El conocimiento del mundo en polaco de un modelo pequeno es limitado; se recomienda incluir los hechos relevantes en el estado. Las reglas legales cambian.
- La aritmetica exacta y los umbrales son un punto debil de las decisiones de una sola pasada; deben calcularse en codigo o con `"facts": "auto"`.
- La calibracion es conservadora en tareas no vistas: no hay umbral del 1% certificado en los ficheros publicados, por lo que `"max_error": 0.01` en una pregunta `act` o `tool` difiere todas las decisiones; usar 0,05 o certificar umbrales con `basal-calibrate` sobre datos propios.
- Los modos `act` y `multi` con muchos labels son experimentales; limite de 255 opciones por pregunta (20 en Ollama).
- La version 2.0 no incluye cabeza de evidencia.
- Las decisiones con consecuencias graves para personas deben ser revisadas por una persona.
- Una calibracion ajustada sobre bf16 no se traslada exactamente a un puerto cuantizado: una prueba externa de basal-1.5 en Ollama observo un 2,3% de error real en el umbral del 1% con el fichero bf16.
- Riesgo de alucinacion y sesgos: no se documentan sesgos especificos en la informacion disponible; el modelo base es un modelo pequeno con cobertura limitada de conocimiento.
- Licencia Apache-2.0, que permite uso comercial con atribucion; se debe mantener la atribucion a SpeakLeash y ACK Cyfronet AGH por el modelo base Bielik.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Remek/basal-2.0-4.5B-MLX-8bit
- Modelo de referencia bf16: https://huggingface.co/Remek/basal-2.0-4.5B
- Variante FP8: https://huggingface.co/Remek/basal-2.0-4.5B-FP8
- Variante GGUF: https://huggingface.co/Remek/basal-2.0-4.5B-GGUF
- Coleccion basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentacion de basal-omni (imagenes y audio): https://github.com/rkinas/basal#images-and-audio-basal-omni-experimental
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base Bielik: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
