# Shiftedx/Qwen3.5-4B-Qwensploit-CyberSecurity-Attention8-BF16Rec-MLX

## Resumen

Qwen3.5-4B-Qwensploit-CyberSecurity-Attention8-BF16Rec-MLX es una cuantizacion mixta en formato MLX del modelo xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity, un derivado afinado de Qwen3.5-4B orientado a tareas de ciberseguridad. La publica el usuario Shiftedx sobre la revision original del editor (commit `9873112886b2b13ec0276c8a57c6fa43527ff2c7`), sin reentrenamiento adicional ni conversion a GGUF. El resultado es un artefacto de 4.539.265.536 parametros (aproximadamente 4,54 mil millones) y 4,7 GB de repositorio, pensado para ejecutarse de forma nativa en Apple Silicon mediante la libreria MLX.

El interes tecnico de esta ficha no esta en el modelo base sino en la receta de cuantizacion: no se aplica un esquema uniforme, sino una mezcla de 4 bits y 8 bits con proyecciones recurrentes conservadas en BF16. El tronco general del lenguaje usa affine 4-bit con grupo 32, la atencion y las ocho ultimas capas MLP usan affine 8-bit con grupo 64, y 48 proyecciones de entrada recurrente se mantienen en BF16. El torre de vision y la cabeza MTP nativa tambien permanecen en BF16. El autor documenta ademas un runner nativo con decodificacion especulativa MTP opcional y un runner de salida estructurada con gramaticas JSON.

Es relevante ahora porque demuestra una via practica para reducir un modelo multimodal de ~4,5B a un tamano manejable en un Mac de memoria unificada sin degradar los casos que el padre ya resolvia, y porque expone con transparencia las limitaciones del template del editor original (bloque de pensamiento forzado, descarte de contenido en formato lista) junto con los parches aplicados en el codigo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda qwen3_5 del modelo base); incluye torre de vision y cabeza MTP nativa |
| Parametros totales | 4.539.265.536 (~4,54B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens de contexto de entrenamiento segun la fuente; el limite posicional de la arquitectura es mayor pero no esta plenamente cualificado |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 32 (tronco del lenguaje), affine 8-bit grupo 64 (atencion, embedding/head, ocho ultimas capas MLP), BF16 (48 proyecciones de entrada recurrente, torre de vision, cabeza MTP) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (metadatos del editor; el autor advierte que la revision de licencias upstream de modelo y dataset queda pendiente) |
| Formato de pesos | safetensors en formato MLX (libreria mlx), con subdirectorio `mtp/` para el drafter BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.5 con capacidad image-text-to-text, afinado por xtools-at sobre Qwen3.5-4B con un enfoque de ciberseguridad (Qwensploit). Esta publicacion no entrena ni modifica pesos: es una conversion de cuantizacion del checkpoint BF16 original fijado a una revision concreta. No se ha realizado reentrenamiento, RLHF ni DPO en esta etapa; los hashes de los shards de origen estan registrados en `provenance.json` y se verifico la paridad de log-probabilidades antes y despues del guardado.

La innovacion tecnica esta en la receta de precision mixta y en el runner. La cuantizacion selectiva preserva en BF16 las 48 proyecciones de entrada recurrente, lo que segun el autor evita la perdida de calidad que sufriria una cuantizacion uniforme en esas capas. Se mantiene el embedding/head atado (tied) y se conserva en BF16 tanto la torre de vision como la cabeza MTP nativa generada por el splitter de MLX-VLM. El runner nativo incluye un perfil de latencia `--no-thinking` que cierra el prefill de pensamiento generado por el template del editor, y un runner JSON que aplica una gramatica de objeto generica o un JSON Schema aportado por la aplicacion, rechazando salidas incompletas. La decodificacion especulativa MTP es opcional, con tamano de bloque recomendado de 3 y una mejora medida de aproximadamente 1,27x en el mejor caso de mediana extremo a extremo.

## Capacidades

- Generacion de texto conversacional multi-turno en el dominio de ciberseguridad, heredado del afinado Qwensploit.
- Razonamiento con modo de pensamiento (thinking) activado por defecto en el template del editor; el runner permite desactivarlo con `--no-thinking`.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante la torre de vision conservada en BF16.
- Salida estructurada JSON mediante gramatica generica o JSON Schema, con rechazo de salidas incompletas.
- Decodificacion especulativa nativa MTP opcional (bloque 3 recomendado), con decodificacion autorregresiva como modo por defecto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada explicitamente; el modo thinking permite cadenas de razonamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de incidentes de seguridad: el modelo puede redactar y razonar sobre preservacion de evidencia e investigacion de incidentes, su dominio de afinado principal; el contexto de 8.192 tokens permite incluir logs y trazas moderadamente largas en un mismo prompt.
- Asistente local de ciberseguridad en estaciones de trabajo Apple Silicon: al ocupar unos 5,17 GB de memoria MLX en pico durante decodificacion corta, cabe en un Mac con memoria unificada de 24 GB o superior y permite consultas sin enviar datos a la nube.
- Generacion de salidas estructuradas para pipelines: el runner JSON con esquema permite producir respuestas parseables (por ejemplo, clasificaciones de severidad o extraccion de indicadores) integrables en automatizaciones, aceptando que el cumplimiento del esquema no garantiza la veracidad de los valores.
- Descripcion y analisis de imagenes tecnicas: con la torre de vision en BF16 y el adaptador de marcadores de imagen documentado, puede procesar capturas de pantalla o diagramas junto a texto, util para triaje de alertas visuales.
- Prototipado de asistentes con razonamiento explicito: el modo thinking por defecto y el perfil `--no-thinking` permiten comparar latencia frente a profundidad de razonamiento en la misma maquina.
- Aceleracion de inferencia en local con MTP: para generacion de texto largo donde la latencia importa, la decodificacion especulativa con bloque 3 ofrece hasta ~1,27x de mejora; no se recomienda para completaciones JSON cortas, que resultaron mas lentas.
- Evaluacion comparativa de recetas de cuantizacion: util para investigadores que quieran medir el impacto de preservar proyecciones recurrentes en BF16 frente a cuantizaciones uniformes, usando los manifiestos de integridad y paridad incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento son comprobaciones locales del autor:

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de decodificacion | ~99,5 tokens/s | M4 Max, 64 GiB memoria unificada, decodificacion greedy corta |
| Memoria MLX en pico | 5,17 GB | Misma configuracion |
| Comprobaciones de latencia superadas | 18/24 (cuantizado) frente a 16/24 (padre BF16) | Perfil de latencia explicito, sin perder ningun caso que el padre superase |
| Comprobaciones bajo restricciones JSON genericas | Mismo recuento que el perfil de latencia, sin perdida de casos del padre | Runner JSON |
| Aceleracion MTP | ~1,27x en la mejor mediana extremo a extremo | Bloque 3; JSON corto resulto mas lento |
| Pruebas de vision sinteticas | 3/3 superadas | Padre, candidato y artefacto recargado |
| Recuperacion | Superada a 2.040 tokens de prompt | Adaptador string-content/image-marker |

El autor advierte explicitamente que estas cifras no son medidas en un M4 Pro de 24 GB y que no constituyen un benchmark de inteligencia ni una certificacion de precision para misiones criticas.

## Requisitos de hardware

- VRAM/memoria estimada: ~5,17 GB de memoria MLX en pico en decodificacion corta segun medida del autor; el repositorio ocupa 4,7 GB en disco.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor valido en un M4 Max de 64 GiB. No se documentan pruebas en GPU NVIDIA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no hay datos de encaje en RTX 4090 u otras GPU de consumo por tratarse de un artefacto MLX.
- Opciones de despliegue: MLX (0.32.2), MLX-LM (0.31.3) y MLX-VLM (0.6.16) con los runners `generate_native.py` y `generate_json.py` incluidos; Transformers 5.14.1 y LLGuidance 1.8.0 como dependencias del runner JSON. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser pesos MLX no son directamente compatibles.
- Latencia y throughput: ~99,5 tokens/s en M4 Max con decodificacion greedy corta; hasta ~1,27x adicional con MTP bloque 3 en texto largo. El autor indica que una instalacion limpia en el Mac de destino aun requiere validacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / libreria | Licencia | Notas |
|---|---|---|---|---|---|
| Shiftedx/Qwen3.5-4B-Qwensploit-CyberSecurity-Attention8-BF16Rec-MLX (este) | ~4,54B | 8.192 (entrenamiento) | safetensors MLX | Apache-2.0 (sujeta a revision upstream) | Cuantizacion mixta 4/8 bits + BF16 recurrente; vision y MTP |
| xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity (padre BF16) | ~4,54B | 8.192 (entrenamiento) | safetensors BF16 | Apache-2.0 (sujeta a revision upstream) | Referencia de calidad; 16/24 comprobaciones de latencia frente a 18/24 del cuantizado |
| Qwen3.5-4B (base de la familia) | ~4B | no disponible en la informacion | safetensors | no disponible en la informacion | Modelo generalista del que deriva el afinado Qwensploit; sin datos de rendimiento en esta ficha |
| Otras cuantizaciones del mismo padre (GGUF, uniformes) | ~4,54B | 8.192 | GGUF u otros | Apache-2.0 | No se aportan datos comparativos de rendimiento en la informacion disponible |

## Limitaciones y advertencias

- El template del editor abre siempre un bloque de pensamiento e ignora `enable_thinking=False`, ademas de descartar contenido de mensajes en formato lista; un helper multimodal generico puede perder texto de usuario o marcadores de imagen. El autor no edito el template y lo compensa en el runner nativo.
- El modelo no impone JSON automaticamente; el runner aplica gramatica o esquema, pero el cumplimiento del esquema no prueba que los valores sean correctos.
- Riesgo de alucinacion inherente a un modelo de ~4,5B afinado en un dominio tecnico; las comprobaciones locales son pequenas y pareadas, no una certificacion de precision.
- El contexto de entrenamiento declarado es de 8.192 tokens; el limite posicional mayor de la arquitectura no esta plenamente cualificado, por lo que no debe asumirse contexto largo sin validacion.
- Idiomas soportados no disponibles; no se garantiza calidad multilingue.
- La licencia Apache-2.0 es el metadato del editor, pero la tarjeta de origen senala revision de licencias upstream de modelo y dataset que esta conversion no resuelve; conviene verificar antes de uso comercial.
- MTP no esta cualificado para JSON restringido, modo thinking por defecto ni imagen/MTP; los helpers no lo habilitan en esos casos.
- Solo se ha validado en Apple Silicon (M4 Max 64 GiB); el rendimiento en M4 Pro de 24 GB u otras maquinas no esta medido, y la instalacion limpia en el destino requiere validacion.
- El modelo esta especializado en ciberseguridad y puede producir contenido tecnico sensible; debe aplicarse con supervision y politicas de uso adecuadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiftedx/Qwen3.5-4B-Qwensploit-CyberSecurity-Attention8-BF16Rec-MLX
- Modelo base (revision fijada): https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity/tree/9873112886b2b13ec0276c8a57c6fa43527ff2c7
- Modelo base (raiz): https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
