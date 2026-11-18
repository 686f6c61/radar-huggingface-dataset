# Jundot/Qwen3.8-Flash-Next-oQ2.5h-mtp

## Resumen

Qwen3.8-Flash-Next-oQ2.5h-mtp es una cuantizacion mixta de precision del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Jundot mediante la herramienta oQ (omlx). El modelo base es un avance experimental de la arquitectura que Qwen empleara en Qwen4: un modelo de lenguaje y vision con mezcla de expertos (MoE) de 125.000 millones de parametros totales y 6.000 millones activados, acompanado de un embedding n-gram de 51.000 millones de parametros y un modulo de prediccion multi-token (MTP) de 4.000 millones.

La cuantizacion reduce el checkpoint completo a 77,6 GiB con un promedio efectivo de 3,703 bits por peso (3,112 bits en el backbone de lenguaje), empleando el formato oQh que aplica una transformacion de Hadamard a los pesos de los expertos antes de cuantizarlos. El resultado es un checkpoint para MLX que requiere oMLX 0.8.0 o superior y que no puede cargarse en versiones anteriores del motor.

Su relevancia es doble: por un lado permite ejecutar en hardware Apple Silicon un modelo multimodal MoE de escala frontier que en BF16 ocuparia cientos de gigabytes; por otro, documenta una tecnica de cuantizacion (rotacion de pesos + asignacion no uniforme de bits) con metricas de divergencia KL frente al modelo FP8 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-lenguaje con Gated DeltaNet, Qwen Sparse Attention (QSA) y Gated Residual streams; incluye encoder de vision y cabeza MTP |
| Parametros totales | 70.151.436.179 (safetensors del checkpoint cuantizado); 180.000 millones de pesos logicos en el modelo completo segun la model card |
| Parametros activos | 6.000 millones (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh 3-bit row scale, oQh 2-bit row scale, affine 8-bit (grupo 64 y 128), affine 4-bit (grupo 64 y 32), BF16; promedio efectivo 3,703 bits/peso |
| Idiomas soportados | no disponible (la model card menciona prompts de evaluacion en 7 idiomas via FLORES+ y Aya) |
| Licencia | Qwen Community License 1.0 (license: other, license_name: qwen-community-1.0) |
| Formato de pesos | safetensors en formato oQh para MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base combina mezcla de expertos con mecanismos de atencion eficiente: Gated DeltaNet junto con Qwen Sparse Attention (QSA) y flujos residuales con compuerta (Gated Residual streams). Incorpora un encoder de vision (0,449B de pesos logicos) que lo habilita para tareas image-text-to-text, un embedding n-gram de 51.200 millones de pesos logicos y una cabeza de prediccion multi-token (MTP) de 2.607 millones de pesos logicos. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion oQh, desarrollada en el repositorio jundot/omlx, rota los pesos de los expertos con una transformacion de Hadamard antes de cuantizarlos. Segun el autor, los pesos rotados necesitan menos escalas, y el espacio ahorrado se reinvierte en bits adicionales para los tensores mas sensibles. La atencion, los expertos compartidos, el embedding de tokens, la cabeza de salida y la cabeza MTP permanecen en grupos affine; el embedding n-gram se mantiene a 4 bits. No se documenta el proceso de entrenamiento del modelo base en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag conversational).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) mediante el encoder de vision integrado.
- Prediccion multi-token (MTP) para decodificacion especulativa y generacion acelerada.
- Razonamiento y codigo: la model card reporta metricas de divergencia KL especificas sobre codigo Python, lo que indica evaluacion en ese dominio.
- Capacidades multilingues: se evalua con FLORES+ y Aya en 7 idiomas, aunque no se detalla la lista completa.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Inferencia local multimodal en Apple Silicon: el checkpoint de 77,6 GiB permite ejecutar un MoE vision-lenguaje de 125B/6B activos en equipos con memoria unificada alta (por ejemplo, Mac Studio con 96 GB o 128 GB) usando oMLX 0.8.0 o superior, algo inviable con el modelo en BF16.
- Descripcion y analisis de imagenes en local: gracias al encoder de vision y al pipeline image-text-to-text, se puede usar para generar alt-text, resumir capturas o extraer informacion de documentos escaneados sin enviar datos a la nube.
- Asistentes conversacionales de contexto largo: la arquitectura MoE con solo 6B parametros activos reduce el coste por token, lo que lo hace adecuado para chat multi-turno sostenido en hardware de consumo profesional.
- Generacion y revision de codigo Python: la model card incluye evaluacion especifica sobre codigo, y el formato oQh preserva mas calidad en ese dominio (reduccion de KL del 24 % en oQ2 frente a oQe), por lo que es util para autocompletado y refactorizacion local.
- Traduccion y procesamiento multilingue: evaluado con FLORES+ en 7 idiomas, encaja en pipelines de traduccion automatica o normalizacion de texto en varios idiomas.
- Aceleracion de inferencia con MTP: la cabeza de prediccion multi-token permite decodificacion especulativa, util en servicios de generacion donde la latencia por token es critica.
- Prototipado e investigacion de arquitecturas Qwen4: al ser un preview experimental de la arquitectura de Qwen4, sirve para experimentar con Gated DeltaNet, QSA y Gated Residual streams antes de que la generacion final este disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta divergencia KL frente al modelo FP8 original para comparar la cuantizacion oQh con oQe:

| Nivel | Tamano | FLORES+ KL, oQe -> oQh | Aya KL, oQe -> oQh | Codigo KL, oQe -> oQh |
|---|---|---|---|---|
| oQ2 | 70,8 GiB | 0,27 -> 0,17 (-38 %) | 0,36 -> 0,14 (-62 %) | 0,32 -> 0,24 (-24 %) |
| oQ2.5 | 76,2 GiB | no medido | no medido | no medido |
| oQ3 | 84,9 GiB | 0,082 -> 0,060 (-27 %) | 0,055 -> 0,042 (-23 %) | 0,14 -> 0,11 (-18 %) |
| oQ4 | 98,8 GiB | 0,034 -> 0,029 (-15 %) | 0,018 -> 0,018 (+3 %) | 0,065 -> 0,058 (-12 %) |

El nivel oQ2.5, que corresponde a este checkpoint, no tiene metricas KL publicadas. El autor senala que en oQ4 la diferencia en Aya se concentra en un unico documento de 1.768 tokens; sin el, oQh queda un 20 % por debajo de oQe en los otros 303 documentos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 77,6 GiB para el checkpoint completo; el repositorio ocupa 83,3 GB.
- Hardware recomendado: equipos Apple Silicon con memoria unificada de 96 GB o superior (Mac Studio M2/M3 Ultra, MacBook Pro M3/M4 Max con 128 GB). No es ejecutable en GPUs NVIDIA ni en consumer GPU de 24 GB o menos.
- Cabe en consumer GPU: no. Requiere memoria unificada de gama alta en plataforma Apple.
- Opciones de despliegue: exclusivamente oMLX 0.8.0 o superior con soporte oQh; las versiones anteriores de oMLX no pueden cargarlo. No es compatible con llama.cpp, vLLM, TGI ni Ollama, ya que el formato oQh es especifico de oMLX.
- Latencia y throughput: no disponibles en la informacion proporcionada. La cabeza MTP puede emplearse para decodificacion especulativa y reducir la latencia por token, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ2.5h-mtp (este) | 125B/6B activos (180B logicos) | no disponible | oQh 2/3-bit mixto, 3,703 bits/peso | Qwen Community 1.0 | MLX via oMLX 0.8.0+ |
| Qwen/Qwen3.8-Flash-Next (base) | 125B/6B activos (180B logicos) | no disponible | BF16/FP8 | Qwen Community 1.0 | Hugging Face, requiere hardware de alta memoria |
| Qwen3.8-Flash-Next-oQ2 (mismo autor) | 125B/6B activos | no disponible | oQh/oQe 2-bit, 70,8 GiB | Qwen Community 1.0 | MLX via oMLX |
| Qwen3.8-Flash-Next-oQ4 (mismo autor) | 125B/6B activos | no disponible | oQh/oQe 4-bit, 98,8 GiB | Qwen Community 1.0 | MLX via oMLX |

No se dispone de datos de benchmarks de tareas que permitan comparar rendimiento con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La cuantizacion a 3,703 bits/peso introduce divergencia respecto al modelo FP8 original; el nivel oQ2.5 no tiene metricas KL publicadas, por lo que su degradacion real es desconocida.
- El checkpoint solo funciona con oMLX 0.8.0 o superior; versiones anteriores no pueden cargarlo. No hay soporte para otros motores de inferencia.
- Requiere hardware Apple Silicon con memoria unificada muy alta (96 GB o mas); no es desplegable en GPUs convencionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan evaluaciones de factualidad en la informacion disponible.
- No se documentan sesgos conocidos, limitaciones de contexto ni lista completa de idiomas soportados.
- La licencia Qwen Community License 1.0 impone condiciones especificas para uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de un despliegue en produccion.
- El modelo base es un preview experimental de la arquitectura de Qwen4, por lo que su comportamiento puede diferir del de la version final.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ2.5h-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
