# mradermacher/Kanimus-26B-A4B-FFT-heretic-GGUF

## Resumen

Kanimus-26B-A4B-FFT-heretic-GGUF es la distribucion en formato GGUF del modelo Kanimus-26B-A4B-FFT-heretic, publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo subyacente, alojado en el repositorio SubMaroon-exp/Kanimus-26B-A4B-FFT-heretic, es un ajuste fino de la familia Gemma (etiquetado como gemma4 en los metadatos) con arquitectura de mezcla de expertos (MoE), 25.233.142.046 parametros totales y un diseno de activacion parcial que da nombre al sufijo A4B.

El modelo esta orientado a conversacion y roleplay, con soporte declarado de ingles y ruso. La etiqueta heretic sugiere un ajuste destinado a reducir los rechazos y el comportamiento excesivamente restrictivo del modelo base, mientras que FFT indica un ajuste fino completo (full fine-tuning) y task_arithmetic apunta a una fusion de pesos por aritmetica de tareas, probablemente combinando un adaptador LoRA con el modelo base.

Esta ficha cubre la version cuantizada estatica publicada por mradermacher, que incluye desde Q2_K (10,7 GB) hasta Q8_0 (27,0 GB), ademas de un proyector multimodal mmproj que habilita entrada de imagenes. Es relevante para quienes quieran ejecutar un MoE de ~25B en hardware de consumo o en servidores modestos, con la salvedad de que la informacion publica sobre el modelo es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma (tag gemma4) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj Q8_0 y mmproj f16 |
| Idiomas soportados | en, ru |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (transformers como libreria declarada; original en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: se trata de un modelo de la familia Gemma con mezcla de expertos, derivado de un ajuste fino completo (FFT) sobre el que se aplico una fusion por aritmetica de tareas (task_arithmetic) con componentes LoRA. El sufijo A4B del nombre sugiere un regimen de activacion de aproximadamente 4.000 millones de parametros por token sobre un total de 25.233 millones, si bien el autor no publica la configuracion exacta de expertos, el numero de expertos activos ni la dimension oculta.

No se han publicado datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La etiqueta heretic indica un proceso de alineacion orientado a reducir negativas y moralizaciones, habitual en la escena de roleplay, pero no se documenta la metodologia. Tampoco se especifica la longitud de contexto nativa del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis declarado en roleplay y narrativa.
- Capacidades multimodales: el repositorio incluye proyectores mmproj (Q8_0 y f16), lo que permite entrada de imagenes en runtimes compatibles con llama.cpp.
- Soporte bilingue declarado: ingles y ruso.
- Comportamiento menos restrictivo que el modelo base (tag heretic), orientado a reducir rechazos en conversacion creativa.
- Razonamiento y codigo: no documentados de forma especifica para este ajuste.
- Tool calling y function calling: no documentados.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking explicito: no documentado.

## Casos de uso

- Roleplay y narrativa interactiva: el ajuste esta explicitamente orientado a conversacion de personajes, con un perfil de rechazo reducido que evita interrupciones moralizantes en ficcion. El formato GGUF permite desplegarlo en llama.cpp u Ollama con contexto gestionado por el usuario.
- Asistentes conversacionales en ruso e ingles: el soporte bilingue declarado lo hace adecuado para bots de atencion en entornos donde se mezclan ambos idiomas, aunque la calidad relativa por idioma no esta documentada.
- Generacion creativa de guiones y dialogos: para escritura de ficcion, storyboards y borradores de guion donde se prioriza variedad estilistica sobre precision factual.
- Prototipado local en hardware de consumo: con cuantizaciones Q4_K_S (15,6 GB) o IQ4_XS (14,2 GB) puede ejecutarse en GPUs de 16-24 GB de VRAM, lo que facilita experimentacion sin infraestructura de servidor.
- Analisis de imagenes con descripcion conversacional: usando el proyector mmproj junto con el modelo, se pueden construir asistentes que comenten imagenes en el contexto de una conversacion, util para prototipos de accesibilidad o catalogacion informal.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo de pesos abiertos ejecutable en local, encaja en escenarios donde los datos no pueden salir de la infraestructura propia, como borradores internos o simulaciones de entrevistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV): Q2_K ~10,7 GB; Q3_K_M ~13,4 GB; IQ4_XS ~14,2 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB; Q8_0 ~27,0 GB. A estas cifras hay que sumar el proyector mmproj (~0,9-1,3 GB) si se usa entrada de imagen.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contexto moderado; RTX 3090 (24 GB) en el mismo rango; A100 40/80 GB o H100 para Q8_0 con contextos largos y concurrencia; RTX 4060 Ti 16 GB para IQ4_XS o Q3_K_M.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 12 GB (con contexto corto) hasta Q5_K_M en GPUs de 24 GB. Las cuantizaciones Q6_K y Q8_0 requieren 24 GB o mas, o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para servir en produccion con mayor throughput, conversion a otros formatos o uso del repositorio original en transformers con vLLM/TGI (no verificado para esta arquitectura MoE concreta).
- Latencia y throughput: no disponibles. Al ser un MoE con activacion parcial, el throughput por token deberia ser superior al de un denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kanimus-26B-A4B-FFT-heretic (este) | 25,2B totales, ~4B activos (sugerido) | no disponible | gemma | GGUF, safetensors | Ajuste para roleplay, en/ru, multimodal via mmproj |
| Gemma 2 27B (referencia de familia) | 27B densos | 8K | gemma | safetensors, GGUF | Denso, sin MoE; comparacion de tamano, no de comportamiento |
| Mixtral 8x7B | 46,7B totales, 12,9B activos | 32K | Apache 2.0 | safetensors, GGUF | MoE mas grande; licencia permisiva |
| Qwen2.5 32B | 32,5B densos | 128K | Apache 2.0 (variantes) | safetensors, GGUF | Mayor contexto y licencia mas laxa |

La comparacion es aproximada: no hay datos publicados de rendimiento para este ajuste, y la fila de Gemma 2 27B se incluye solo como referencia de la familia declarada en los metadatos, no como equivalente funcional.

## Limitaciones y advertencias

- Informacion muy escasa: el autor no publica arquitectura detallada, contexto nativo, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Riesgo de alucinacion: al ser un ajuste orientado a roleplay y creatividad, la prioridad no es la precision factual; no debe usarse como fuente de verdad en dominios tecnicos o medicos sin verificacion.
- Sesgos: no documentados. Los ajustes heretic suelen relajar filtros de seguridad, lo que puede aumentar la probabilidad de contenido sensible, ofensivo o inapropiado si no se aplican salvaguardas externas.
- Limitaciones de idioma: solo ingles y ruso declarados; el rendimiento en castellano no esta garantizado ni evaluado.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de desplegar en produccion.
- Trazabilidad: la cadena de derivacion (modelo base, LoRA, fusion task_arithmetic, ajuste heretic) dificulta atribuir comportamientos concretos y auditar el linaje de los datos.
- Contexto: al no documentarse la ventana nativa, el contexto efectivo dependera de la configuracion del runtime y de la VRAM disponible; en cuantizaciones bajas con contextos largos la calidad puede degradarse.
- Multimodalidad: la presencia de mmproj no garantiza que el modelo haya sido entrenado especificamente para vision; conviene validar la calidad de las respuestas sobre imagenes antes de usarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kanimus-26B-A4B-FFT-heretic-GGUF
- Modelo base: https://huggingface.co/SubMaroon-exp/Kanimus-26B-A4B-FFT-heretic
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Kanimus-26B-A4B-FFT-heretic-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Kanimus-26B-A4B-FFT-heretic-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
