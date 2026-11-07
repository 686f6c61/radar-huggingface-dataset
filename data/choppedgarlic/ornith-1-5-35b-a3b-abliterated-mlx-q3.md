# choppedgarlic/Ornith-1.5-35B-A3B-Abliterated-MLX-Q3

## Resumen

Ornith-1.5-35B-A3B-Abliterated-MLX-Q3 es una cuantizacion en 3 bits para MLX del modelo Ornith 1.5 35B-A3B, un transformer de tipo mixture-of-experts (MoE) desarrollado por ornith-ai. Este checkpoint concreto lo publica el usuario choppedgarlic y parte de la version "abliterated" de huihui-ai, en la que se ha reducido el comportamiento de rechazo mediante tecnicas de abliteration. El modelo original activa aproximadamente 3.000 millones de parametros por token sobre un total de 34.660 millones, lo que permite un equilibrio entre calidad y coste computacional.

La relevancia de esta ficha radica en su orientacion practica: es una version text-only empaquetada para ejecutarse en un Mac con Apple Silicon de 24 GB de memoria unificada, con pesos safetensors de unos 14 GB repartidos en tres shards. El contexto nativo del checkpoint es de 262.144 tokens, aunque la configuracion de despliegue recomendada por el autor lo limita a 65.536 tokens para respetar un techo de memoria de proceso de 18 GB.

Se trata de un modelo de nicho, sin descargas ni likes en el momento de la consulta, pensado para usuarios que quieren ejecutar localmente un MoE de 35B en hardware de consumo Apple con un contexto largo y sin restricciones de rechazo. La licencia MIT del modelo upstream facilita su uso comercial, aunque la cadena de derivaciones (abliteration, cuantizacion) introduce matices que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), tipo `qwen3_5_moe` |
| Parametros totales | 34.660.608.768 (34,66 B) |
| Parametros activos | Aproximadamente 3 B por token (segun model card upstream) |
| Longitud de contexto | 262.144 tokens nativos; 65.536 tokens en la configuracion oMLX recomendada |
| Tipos de cuantizacion | 3 bits (MLX); existen variantes upstream en 6 bits |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX), 3 shards, ~14 GB; repo de 15,2 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con arquitectura de mezcla de expertos (MoE) etiquetado como `qwen3_5_moe`, con 34,66 mil millones de parametros totales y unos 3 mil millones activos por token. Esta dispersion permite que, pese al tamano del checkpoint, el coste de inferencia por token sea comparable al de un modelo denso de ~3B, lo que explica que pueda ejecutarse en un equipo de 24 GB de memoria unificada. La model card upstream afirma que supera a Qwen 3.6-35B en benchmarks de codigo y agenticos, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B en codificacion agentica, aunque no se detallan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO).

Sobre esta base se aplican dos transformaciones en cadena. Primero, huihui-ai publica una version "abliterated" en la que se elimina o atenua la direccion de rechazo en el espacio de activaciones, reduciendo el comportamiento de negativa del modelo. Segundo, choppedgarlic cuantiza esos pesos a 3 bits para MLX, generando tres shards safetensors de aproximadamente 14 GB. No se dispone de informacion sobre la metodologia exacta de abliteration ni sobre posibles ajustes posteriores de calibracion de la cuantizacion.

## Capacidades

- Generacion de texto conversacional y text-only; no procesa imagenes ni audio.
- Razonamiento y codificacion, con rendimiento destacado en tareas agenticas segun la model card upstream.
- Soporte de conversaciones multi-turno con contexto largo (hasta 65.536 tokens en el despliegue recomendado, 262.144 nativos).
- Capacidad de tool calling y function calling heredada del modelo base, aunque no se documenta explicitamente en esta ficha.
- Uso en flujos agenticos y razonamiento multi-paso, orientado a tareas de codigo y automatizacion.
- Comportamiento de rechazo reducido por abliteration, lo que amplia el rango de respuestas generadas.
- Soporte unicamente de ingles; no se declaran capacidades multilingues.

## Casos de uso

- Asistente de codigo local en Mac: el modelo puede integrarse en un editor o CLI sobre Apple Silicon de 24 GB, generando y revisando codigo en ingles con contexto de hasta 65.536 tokens, sin depender de la nube.
- Automatizacion agentica de tareas de desarrollo: con tool calling y razonamiento multi-paso, puede encadenar llamadas a herramientas (git, tests, linters) en pipelines locales de CI, aprovechando su rendimiento en benchmarks agenticos.
- Procesamiento de documentos largos: la ventana de 65.536 tokens permite resumir o extraer informacion de contratos, informes o bases de codigo extensas dentro del techo de memoria de 18 GB.
- Chat de soporte tecnico en ingles: conversaciones multi-turno con historial largo, adecuado para equipos que necesitan un asistente autoalojado sin coste por token.
- Prototipado de agentes de investigacion: el contexto nativo de 262.144 tokens (si se dispone de mas memoria) habilita tareas de lectura y sintesis sobre corpus extensos.
- Experimentacion en seguridad y alineacion: la variante abliterated sirve para estudiar el comportamiento del modelo sin rechazos, comparando respuestas frente a la version original.
- Despliegue en entornos aislados: al ejecutarse con oMLX en `127.0.0.1:8000/v1`, encaja en escenarios con requisitos de privacidad donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card upstream menciona comparaciones cualitativas con Qwen 3.6-35B, Gemma 4-31B y Muse Glimmer-30B, pero no se aportan cifras concretas (MMLU, HumanEval, GSM8K u otras) en los datos proporcionados.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 14 GB de pesos en 3 bits, con techo de proceso de 18 GB en la configuracion recomendada.
- Hardware objetivo: Apple Silicon con 24 GB de memoria unificada (serie M de Apple).
- No esta pensado para GPU NVIDIA; el formato MLX es especifico del ecosistema Apple.
- Despliegue recomendado: repositorio `jjakemaness/ornith-omlx-24gb`, que instala oMLX 0.7.3 y Pi 1.5.0 con un unico request concurrente, 32 bloques de cache de arranque y servidor OpenAI-compatible en `http://127.0.0.1:8000/v1`.
- Model id de servicio: `Ornith-1.5-35B-A3B-Abliterated-Q3`.
- Salida maxima configurada: 32.768 tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-Abliterated-MLX-Q3 | 34,66 B | ~3 B | 262.144 nativos / 65.536 en oMLX | MIT | MLX 3 bits, Apple Silicon |
| Ornith-1.5-35B-A3B (upstream) | 34,66 B | ~3 B | 262.144 | MIT | Pesos originales y MLX 6 bits |
| Qwen 3.6-35B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma 4-31B | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card upstream situa a Ornith 1.5 35B-A3B por encima de Qwen 3.6-35B en codigo y tareas agenticas, y por delante de Gemma 4-31B y Muse Glimmer-30B en codificacion agentica, pero no se dispone de cifras verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles; no se garantiza calidad en castellano ni en otros idiomas.
- La abliteration reduce los rechazos, lo que puede aumentar la generacion de contenido sensible o inapropiado; el usuario es responsable del uso.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la cuantizacion a 3 bits, que puede degradar la precision respecto a los pesos originales.
- La cuantizacion en 3 bits puede introducir perdida de calidad frente a la variante de 6 bits o a los pesos sin cuantizar.
- El contexto efectivo queda limitado a 65.536 tokens en la configuracion de 24 GB, muy por debajo de los 262.144 nativos.
- Solo un request concurrente en la configuracion recomendada, lo que limita el throughput en produccion.
- Dependencia del ecosistema MLX y de Apple Silicon; no es portable a CUDA sin conversion.
- La licencia MIT del upstream se mantiene, pero conviene verificar la cadena de derivaciones (abliteration y cuantizacion) antes de un uso comercial critico.
- Sin descargas ni validacion comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/choppedgarlic/Ornith-1.5-35B-A3B-Abliterated-MLX-Q3
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo upstream: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante MLX 6 bits: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit
- Repositorio de despliegue: https://github.com/jjakemaness/ornith-omlx-24gb
