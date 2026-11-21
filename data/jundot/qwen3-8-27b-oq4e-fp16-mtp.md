# Jundot/Qwen3.8-27B-oQ4e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ4e-fp16-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.781 millones de parametros con capacidad de vision y lenguaje construido sobre la arquitectura Qwen3.5. Lo desarrolla el usuario Jundot mediante su herramienta oQ (oMLX v0.8.0), y su proposito es ofrecer una version compacta (17,17 GiB de pesos) del modelo original manteniendo el codificador visual, el backbone de lenguaje y la cabeza de prediccion multi-token (MTP) en un unico checkpoint listo para ejecutarse en Apple Silicon a traves de MLX.

El modelo base combina capas Gated DeltaNet con capas de atencion con compuerta (Gated Attention) en un diseno hibrido, procesa imagen, video y texto, y declara una ventana de contexto nativa de 262.144 tokens. La cuantizacion oQ4e asigna bits por sensibilidad medida de cada capa, con un promedio efectivo de 4,840 bits por peso en el backbone de lenguaje y 5,310 bits por peso en el checkpoint completo, lo que reduce el error de cuantizacion frente a una cuantizacion uniforme de 4 bits.

Es relevante ahora porque permite ejecutar localmente un modelo multimodal de 27B con contexto muy largo en hardware de consumo Apple, algo que el checkpoint original en BF16 no permite por tamano. La ficha se centra en esta distribucion cuantizada; los detalles de entrenamiento del modelo original no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (arquitectura Qwen3.5), con codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo, segun la model card) |
| Tipos de cuantizacion | Precision mixta oQ4e: affine 4-bit (69,807% de los pesos), 5-bit (23,680%), 6-bit (4,615%), 8-bit (0,041%), FP16 (0,198%) y FP32 (1,658%); grupo de 64 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); escalas y sesgos de cuantizacion en FP16; codificador visual en FP32 |

Desglose de almacenamiento:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 16,272 GB / 15,155 GiB |
| Codificador visual | 0,461B | 1,843 GB / 1,716 GiB |
| Cabeza MTP | 0,425B | 0,323 GB / 0,301 GiB |
| Total | 27,781B | 18,439 GB / 17,172 GiB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de la familia Qwen3.5 con un layout hibrido que intercala capas Gated DeltaNet (mecanismo de estado lineal con compuerta) y capas de atencion con compuerta. Incorpora un codificador visual de 0,461B de parametros para comprension de imagen y video, y una cabeza de prediccion multi-token (MTP) de 0,425B que habilita decodificacion especulativa nativa, es decir, la generacion de varios tokens por paso de verificacion. La ventana de contexto nativa es de 262.144 tokens.

Sobre el entrenamiento del modelo original no hay informacion disponible en la documentacion proporcionada: se desconoce el volumen de tokens, la composicion del dataset y si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineamiento. La innovacion documentada de esta distribucion es el proceso de cuantizacion: oQ4e asigna el numero de bits por capa segun una sensibilidad medida experimentalmente, redondea cada grupo con una matriz de importancia calculada sobre 128 muestras de 512 tokens y reajusta escala y sesgo mediante minimos cuadrados ponderados. La revision del 19 de noviembre de 2026 aplica un redondeo oQe refinado en oMLX 0.8.0 que reduce el error de cuantizacion sin cambiar tamano ni velocidad, por lo que las copias anteriores deben descargarse de nuevo.

## Capacidades

- Comprension de imagen y texto (pipeline image-text-to-text), incluyendo tareas de descripcion, respuesta a preguntas visuales y extraccion de informacion de documentos.
- Comprension de video, segun la model card del modelo base.
- Generacion de texto y razonamiento en conversaciones multi-turno con contexto de hasta 262.144 tokens.
- Decodificacion especulativa mediante la cabeza MTP incluida en el checkpoint, orientada a acelerar la generacion.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking, audio u otras capacidades especiales: no documentado en la informacion disponible.

## Casos de uso

- Analisis de documentos largos con imagenes: el modelo puede recibir un PDF escaneado o un informe con graficos y tablas junto con instrucciones extensas, y responder preguntas sobre el conjunto gracias a la ventana de 262.144 tokens y al codificador visual integrado.
- Procesamiento de video para resumenes: al soportar entrada de video, resulta adecuado para generar resumenes o extraer eventos de grabaciones, con la ventaja de que el checkpoint cuantizado cabe en un Mac de gama alta.
- Asistencia conversacional local con privacidad: al ejecutarse via MLX en Apple Silicon, permite desplegar un asistente multi-turno sin enviar datos a la nube, relevante en entornos con requisitos de confidencialidad.
- Analisis de capturas de interfaz y QA visual: util para tareas de automatizacion de pruebas o soporte tecnico donde se adjunta una captura de pantalla y se pregunta por el estado de la aplicacion.
- Prototipado de aplicaciones multimodales en macOS: el formato MLX y el peso de 17,17 GiB facilitan iterar sobre demos de vision-lenguaje en portatiles y equipos de sobremesa Apple sin infraestructura GPU dedicada.
- Generacion de texto de contexto largo: resumenes de transcripciones, revision de contratos o analisis de repositorios de documentacion que superan los 100.000 tokens, aprovechando la ventana nativa del modelo.
- Aceleracion de inferencia con MTP: la cabeza de prediccion multi-token incluida permite experimentar con decodificacion especulativa en MLX para reducir la latencia por token generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 17,17 GiB, por lo que se recomienda un minimo de 24 GB de memoria unificada para inferencia con contexto corto y 32-64 GB para aprovechar contextos largos y el codificador visual en FP32.
- Hardware objetivo: Apple Silicon con MLX. No hay soporte documentado para CUDA ni para GPUs NVIDIA en este checkpoint.
- GPU recomendadas: no disponible para el ecosistema NVIDIA; en Apple, se requiere un chip con al menos 24 GB de memoria unificada (por ejemplo, familias M-series Pro, Max o Ultra con esa dotacion).
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta con memoria unificada suficiente; no esta pensado para GPUs de consumo NVIDIA por el formato MLX.
- Opciones de despliegue: MLX y oMLX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica que la revision de redondeo mantiene el mismo tamano y velocidad que la version anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ4e-fp16-mtp | 27,781B (denso) | 262.144 tokens | MLX safetensors, ~5,31 bits/peso | Apache-2.0 | Hugging Face, 3.563 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27,781B (denso) | 262.144 tokens | Pesos originales (BF16, presumiblemente) | Apache-2.0 | Hugging Face |
| Otras cuantizaciones del mismo modelo base | 27,781B | 262.144 tokens | No disponible | Apache-2.0 (heredada) | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de otras alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de precision respecto al modelo original; el promedio de 4,840 bits por peso en el backbone implica degradacion potencial en tareas sensibles, aunque el autor afirma que el redondeo refinado reduce el error.
- El checkpoint esta en formato MLX y solo es utilizable en el ecosistema Apple Silicon; no es portable a GPUs NVIDIA ni a frameworks como vLLM o llama.cpp.
- El codificador visual se mantiene en FP32 y ocupa 1,716 GiB, lo que incrementa el consumo de memoria frente a una version puramente de texto.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la documentacion disponible.
- Los idiomas soportados no estan documentados; no se puede garantizar un rendimiento adecuado fuera de los idiomas principales del modelo original.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar los terminos del repositorio Qwen/Qwen3.8-27B antes de desplegar en produccion.
- La model card advierte de que las copias anteriores al 19 de noviembre de 2026 deben descargarse de nuevo para beneficiarse del redondeo oQe refinado.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deben asumirse en pipelines de produccion sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Pull request de mejora de oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
