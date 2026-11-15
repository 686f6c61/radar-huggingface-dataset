# Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-6bit

## Resumen

Ornith-1.5-9B-BuildEng-V9-MLX-6bit es un ajuste fino (fine-tune) del modelo Ornith 1.5 9B de Ornith AI / DeepReinforce, especializado en ingenieria estructural y de la construccion. Lo desarrolla Irfan Uruchi y se distribuye como derivado no oficial: el LoRA de BuildEng V9 se ha fusionado en los pesos oficiales de Ornith 1.5 9B en formato MLX de 6 bits, sin recuantizacion desde 4 bits. La arquitectura subyacente es Qwen3.5 (`qwen3_5`), con 8.953.801.728 parametros totales y un repositorio de 7,3 GB.

El modelo resuelve la necesidad de un asistente tecnico conversacional capaz de discutir trayectorias de cargas estructurales, modificaciones en obra, patologias del hormigon armado, obras provisionales, cimentaciones e investigacion de patologias. Esta pensado para ejecutarse en Apple Silicon mediante MLX-LM, lo que lo hace util para ingenieros que trabajan en local con hardware de consumo de Apple.

Es relevante ahora porque combina un modelo base reciente (Qwen3.5, familia de licencia permisiva) con una especializacion vertical en un dominio de alta exigencia tecnica, y porque el ecosistema MLX permite desplegarlo en un Mac mini sin GPU dedicada. La licencia del derivado es MIT, con la obligacion de conservar los avisos de las licencias upstream (MIT de Ornith y Apache-2.0 de Qwen3.5).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`qwen3_5`), transformer |
| Parametros totales | 8.953.801.728 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (MLX); existe variante 4 bits del mismo ajuste |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT (derivado); upstream MIT (Ornith) y Apache-2.0 (Qwen3.5) |
| Formato de pesos | safetensors en formato MLX (`mlx`, `mlx-lm`) |

## Arquitectura y entrenamiento

El modelo base es Ornith 1.5 9B, construido sobre la arquitectura Qwen3.5, un transformer decoder-only de aproximadamente 9.000 millones de parametros. Sobre ese base se entreno un LoRA especifico de dominio (BuildEng V9) orientado a ingenieria estructural y de la construccion, que posteriormente se fusiono en los pesos oficiales. El proceso de conversion a MLX 6 bits se realizo con MLX-LM a partir del checkpoint oficial `ornith-ai/Ornith-1.5-9B-MLX-6bit`, sin recuantizacion ascendente desde 4 bits.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset del ajuste, ni sobre si se aplicaron tecnicas de RLHF o DPO en el base o en el fine-tune. El ajuste se realizo y se fusiono en un Apple M6 Mac mini, segun la model card. La innovacion tecnica destacable es la distribucion en formato MLX nativo para Apple Silicon, que permite inferencia local eficiente sin CUDA.

## Capacidades

- Generacion de texto conversacional en ingles con enfoque tecnico.
- Razonamiento sobre trayectorias de cargas estructurales y sistemas resistentes.
- Discusion de modificaciones en obra y obras provisionales (temporary works).
- Analisis de patologias del hormigon armado (reinforced-concrete distress).
- Consultas sobre cimentaciones e investigacion de patologias estructurales.
- Soporte de plantilla de chat con control de modo thinking (`enable_thinking` en la configuracion de plantilla).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Asistencia a ingenieros estructurales en la revision de trayectorias de carga: el modelo puede mantener conversaciones multi-turno sobre como se transmite la carga en un sistema dado y senalar puntos criticos, como apoyo a la revision preliminar antes del calculo formal.
- Analisis preliminar de patologias del hormigon: ante una descripcion de fisuracion o deterioro, el modelo puede plantear hipotesis de causa y lineas de investigacion, siempre sujetas a inspeccion y verificacion por un tecnico competente.
- Consulta sobre obras provisionales: permite discutir el papel de apeos, cimbras y apuntalamientos temporales y advertir de riesgos asociados a su retirada o modificacion.
- Formacion y documentacion tecnica interna: util para redactar borradores de notas explicativas o material de formacion sobre conceptos estructurales, que luego revisa un ingeniero.
- Apoyo en la investigacion de patologias: ayuda a estructurar una lista de comprobaciones y causas posibles ante un problema estructural descrito en texto.
- Asistente local en obra o despacho sobre Apple Silicon: al ejecutarse con MLX-LM en un Mac, permite consultas sin conexion ni envio de datos a servicios externos, util para informacion sensible de proyecto.
- Exploracion de escenarios de modificacion: el modelo puede razonar sobre las implicaciones de retirar o anadir elementos estructurales, como paso previo a la validacion por calculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente reporta mediciones de velocidad para la variante 4 bits original (no para esta version de 6 bits): 29,46 tokens generados por segundo y 226,34 tokens de prompt por segundo en un Apple M6 Mac mini con MLX-LM 0.32.2, temperatura cero, prompt de 33 tokens y completion de 96 tokens. No hay medicion de velocidad declarada para este formato de 6 bits.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 7,3 GB en 6 bits, por lo que se necesita al menos ese espacio mas overhead de ejecucion; en la practica, un equipo con 16 GB de memoria unificada es el minimo razonable.
- GPU recomendadas: no aplica CUDA; el formato es MLX para Apple Silicon. En Apple, se recomienda un chip de la familia M con memoria unificada suficiente (M-series; el autor cita un M6 Mac mini).
- Cabe en hardware de consumo Apple: si, en equipos Apple Silicon con memoria unificada suficiente; no es ejecutable de forma nativa en GPU NVIDIA por el formato MLX.
- Opciones de despliegue: MLX-LM (`python -m mlx_lm generate`), con soporte de plantilla de chat y control de thinking.
- Latencia y throughput: no hay medicion publicada para la variante de 6 bits; la referencia de 4 bits es de 29,46 tok/s de generacion en M6 Mac mini.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-BuildEng-V9-MLX-6bit | ~9B | no disponible | MLX 6 bits | MIT (derivado) | Especializado en ingenieria estructural; solo ingles; solo Apple Silicon |
| Ornith 1.5 9B (base) | ~9B | no disponible | safetensors / MLX | MIT | Modelo generalista sin especializacion de dominio |
| BuildEng V9 MLX 4 bits (mismo autor) | ~9B | no disponible | MLX 4 bits | MIT | Misma especializacion, menor huella y velocidad medida de 29,46 tok/s |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un sistema certificado de diseno estructural: las salidas son orientativas y no sustituyen calculos especificos de obra, inspecciones, aprobaciones de diseno ni el juicio de un ingeniero competente.
- Puede omitir precauciones urgentes, producir calculos inexactos o citar incorrectamente provisiones normativas.
- Riesgo de alucinacion en un dominio de seguridad critica: cualquier recomendacion debe verificarse de forma independiente antes de un uso con implicaciones de seguridad.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta documentado.
- No se documenta longitud de contexto, lo que impide planificar conversaciones largas con garantias.
- No se documentan capacidades de tool calling ni de agente, por lo que no es adecuado para pipelines automatizados que dependan de ellas.
- La licencia del derivado es MIT, pero la redistribucion exige conservar los avisos upstream (MIT de Ornith y Apache-2.0 de Qwen3.5).
- El formato MLX limita el despliegue a Apple Silicon; no es directamente utilizable en servidores con GPU NVIDIA.
- La prueba funcional realizada por el autor no constituye un benchmark exhaustivo de seguridad ni de precision.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-6bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Checkpoint fuente en MLX 6 bits: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-6bit
- Variante 4 bits del mismo ajuste: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-4bit
