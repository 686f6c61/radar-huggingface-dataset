# OneNexus/GLM-5.3-Flash-MXFP4

## Resumen

OneNexus/GLM-5.3-Flash-MXFP4 es un checkpoint cuantizado en MXFP4 del modelo zai-org/GLM-5.3-Flash, publicado por el usuario OneNexus. Se trata de una conversión orientada a servir texto e imagen-a-texto sobre hardware AMD Instinct MI355X (arquitectura gfx950), no de un modelo entrenado desde cero. El modelo base declara 320.000 millones de parámetros totales y 18.000 millones activos, con una ventana de contexto de 1.048.576 tokens.

Su relevancia es fundamentalmente de infraestructura: demuestra una ruta de ejecución funcional para un MoE de gran tamaño con expertos en MXFP4 sobre ROCm, usando SGLang con paralelismo TP4/EP4, caché KV en FP8 y decodificación especulativa mediante una cabeza MTP incluida en el propio checkpoint. El autor publica comparativas medidas contra el checkpoint amd/GLM-5.3-Flash-Quark-MXFP4 sobre las mismas muestras y el mismo stack, con resultados de paridad de rendimiento y diferencias de calidad no significativas estadísticamente.

El repositorio ocupa 245,6 GB y el payload de tensores indexado declara 195.550.624.632 bytes (182,12 GiB). El recuento de parámetros leído de los safetensors del repositorio es de 169.120.127.838, cifra inferior a los 320B que declara el modelo base; esa discrepancia no se explica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y atencion dispersa de 256 dimensiones sin cola RoPE; cache de indice K-pool separada y cache de atencion MLA de 512 dimensiones; estado Mamba gestionado junto a la cache KV; cabeza MTP integrada en el checkpoint |
| Parametros totales | 169.120.127.838 segun safetensors del repositorio; el modelo base declara 320B totales |
| Parametros activos | 18B (declarados por el modelo base) |
| Longitud de contexto | 1.048.576 tokens (limite del modelo); las ejecuciones AgentX reportadas usaron un tope de 262.144 tokens |
| Tipos de cuantizacion | MXFP4 en los expertos enrutados de la mayoria de capas; el resto de tensores conservan la precision declarada; cache KV en FP8; etiqueta de repositorio "8-bit" |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (library_name: transformers) |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base: no hay datos sobre numero de tokens, composicion del dataset, ni uso de RLHF o DPO. Lo que si se detalla es la ruta de inferencia y los componentes arquitectonicos que el checkpoint debe preservar para funcionar. GLM-5.3-Flash emplea proyecciones de atencion dispersa de anchura 256 sin cola RoPE, con una cache de indice K-pool independiente que almacena 128 valores de clave en FP8 mas una escala FP32 por fila (132 bytes por fila), distinta de la cache de atencion MLA de 512 dimensiones. La seleccion en contexto largo se mantiene acotada sin descartar posiciones validas: 512 grupos de cuatro tokens seleccionados cubren hasta 2.048 tokens de historial, y hasta tres tokens recientes no agrupados elevan el ancho mapeado a 2.051.

La verificacion de tokens se apoya en AITER para expertos MXFP4, mHC soportado en gfx950 y un nucleo KDA fusionado con alcance de forma, con alternativas de referencia donde es necesario. La ejecucion de expertos conserva la semantica de puerta SwiGLU y de recorte (clamp) del modelo. La decodificacion especulativa usa la cabeza MTP incluida en el checkpoint: cinco pasos proponen tokens y una pasada del modelo objetivo los verifica; la repeticion de grafo reduce el trabajo de lanzamiento. En el escalon c16 del corpus AgentX se reporta una longitud de aceptacion de 4,9072 y una tasa de aceptacion del 78,14% sobre 1.595 (la frase queda cortada en la model card). Tras un rechazo o un truncado por token de parada, la cache KV y el estado Mamba deben referirse al mismo prefijo comprometido visible.

## Capacidades

- Generacion de texto y razonamiento de un solo turno, evaluado con intento greedy sobre muestras fijas de GSM8K, MMLU y GPQA Diamond.
- Entrada de imagen a texto (pipeline image-text-to-text): se probaron peticiones con imagen y seguimiento con cache, segun la model card.
- Conversacion multiturno con contexto largo, hasta 1.048.576 tokens teoricos y 262.144 en las pruebas reportadas.
- Decodificacion especulativa nativa mediante cabeza MTP en el checkpoint, con EAGLE 5/1/6 y verificacion por el modelo objetivo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: se menciona un corpus AgentX de 393 entradas usado para medir rendimiento, pero no se documentan capacidades agenticas del modelo en si.
- Multilingue: limitado a ingles y chino segun los idiomas declarados.
- Vision: soportada como entrada de imagen; video explicitamente no evaluado.
- Modo de pensamiento (thinking) explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento sobre documentos largos: con 1.048.576 tokens de contexto, el modelo puede procesar libros tecnicos, expedientes o bases de codigo completas en una sola pasada, evitando estrategias de troceado y recuperacion.
- Asistencia tecnica en chino e ingles: al cubrir ambos idiomas de forma nativa, resulta adecuado para soporte bilingue en organizaciones con operaciones en China y mercados angloparlantes.
- Analisis de imagenes tecnicas con seguimiento conversacional: el pipeline image-text-to-text permite enviar una captura o diagrama y continuar la conversacion con cache de la peticion previa, util en diagnostico de incidencias o revision de documentacion grafica.
- Evaluacion comparativa de infraestructura de inferencia: el checkpoint sirve como referencia reproducible en ROCm frente a la variante de AMD, con corpus y protocolo publicados, para equipos que dimensionan clústeres de MI355X.
- Servicio de alta concurrencia con SLA de latencia por usuario: los datos de P90 tok/s/usuario hasta concurrencia 48 permiten planificar despliegues con muchas sesiones simultaneas y objetivos de fluidez por sesion.
- Extraccion y sintesis de informacion en corpus normativos: la ventana de 262.144 tokens usada en pruebas es suficiente para contratos, pliegos o normativa extensa, generando resumenes y respuestas citadas dentro del mismo contexto.
- Investigacion en cuantizacion MXFP4: al publicar protocolo de calidad, datos agregados por pregunta y configuracion de servicio, es util como banco de pruebas para estudiar el impacto de MXFP4 en expertos enrutados sobre silicio AMD.

## Benchmarks y rendimiento

Calidad en razonamiento de texto, muestras fijas, un intento greedy por pregunta, comparado con amd/GLM-5.3-Flash-Quark-MXFP4:

| Muestra | OneNexus correctas | AMD correctas | Diferencia observada |
|---|---:|---:|---:|
| GSM8K (500 preguntas) | 490 (98,0%) | 491 (98,2%) | -0,2 pp |
| MMLU (500 preguntas) | 428 (85,6%) | 423 (84,6%) | +1,0 pp |
| GPQA Diamond (198 preguntas) | 139 (70,2%) | 132 (66,7%) | +3,5 pp |

Los p-valores del test exacto emparejado son 0,458 para MMLU y 0,265 para GPQA; ninguna diferencia alcanza p < 0,05. MMLU tiene 43/500 salidas truncadas en cada checkpoint, y GPQA 55/198 en OneNexus frente a 61/198 en AMD. El autor indica que estas muestras no demuestran ni superioridad ni equivalencia, y que no son puntuaciones de leaderboard completas.

Rendimiento de servicio sobre 4x MI355X VF, SGLang en ROCm, TP4/EP4, cache KV FP8, EAGLE 5/1/6, corpus AgentX de 393 entradas, 900 segundos por nivel de concurrencia:

| Concurrencia | OneNexus tok/s salida | AMD tok/s salida | OneNexus P90 tok/s/usuario | AMD P90 tok/s/usuario |
|---:|---:|---:|---:|---:|
| 1 | 261,76 | 258,89 | 379,08 | 364,96 |
| 2 | 444,88 | 444,09 | 333,60 | 330,21 |
| 4 | 764,52 | 769,09 | 295,25 | 297,03 |
| 8 | 1.283,08 | 1.278,38 | 241,23 | 237,75 |
| 16 | 1.845,35 | 1.857,38 | 178,88 | 179,39 |
| 32 | 2.279,72 | 2.290,16 | 110,35 | 110,00 |
| 48 | 2.331,22 | 2.340,38 | 74,85 | 73,89 |

En el agregado geometrico de c1 a c48, OneNexus queda un 0,1% por debajo en throughput de salida y un 1,0% por encima en tasa P90 por usuario. Ambos ejecutaron sin errores de peticion (9.223 peticiones OneNexus y 9.264 AMD). El P90 tok/s/usuario es el percentil 90 del reciproco de la latencia media entre tokens de cada peticion elegible, no throughput agregado.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload de tensores indexado es de 195.550.624.632 bytes (182,12 GiB) solo en pesos; el repositorio completo ocupa 245,6 GB. A eso hay que sumar cache KV en FP8 y estado Mamba, por lo que el despliegue real excede ampliamente esos 182 GiB por GPU o por grupo de GPUs.
- Configuracion validada: 4x AMD Instinct MI355X VF (gfx950), con TP4/EP4. No hay datos publicados para otras configuraciones de GPU.
- GPU recomendadas: AMD Instinct MI355X. No se documenta funcionamiento en A100, H100, RTX 4090 ni otras GPU NVIDIA.
- Cabe en GPU de consumo: no. El checkpoint no es desplegable en tarjetas consumer con la informacion disponible.
- Opciones de despliegue: SGLang sobre ROCm (implementacion en SGLang PR #39273); la libreria declarada en el repositorio es transformers. No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: ver la tabla de rendimiento de servicio. En c1 se miden 261,76 tok/s de salida agregados y 379,08 tok/s por usuario en P90; en c48, 2.331,22 tok/s agregados y 74,85 tok/s por usuario en P90.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (muestras fijas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneNexus/GLM-5.3-Flash-MXFP4 | 169,12B en safetensors del repo; base declara 320B totales / 18B activos | 1.048.576 tokens | GSM8K 98,0%; MMLU 85,6%; GPQA Diamond 70,2% | MIT | HuggingFace, pesos safetensors; servicio validado en SGLang/ROCm |
| amd/GLM-5.3-Flash-Quark-MXFP4 | no disponible en la informacion proporcionada | no disponible | GSM8K 98,2%; MMLU 84,6%; GPQA Diamond 66,7% | no disponible | HuggingFace, usado como referencia en las mismas pruebas |
| zai-org/GLM-5.3-Flash (base) | 320B totales / 18B activos | 1.048.576 tokens (heredado) | no disponible | no disponible | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Las diferencias de calidad frente al checkpoint de AMD no son estadisticamente significativas (p = 0,458 en MMLU y p = 0,265 en GPQA). No debe interpretarse como superioridad demostrada.
- El protocolo de evaluacion usa subconjuntos fijos de 500, 500 y 198 preguntas, no las suites completas, por lo que no equivale a una puntuacion de leaderboard.
- Hay truncamientos de respuesta que cuentan como incorrectas: 43/500 en MMLU por checkpoint y 55/198 frente a 61/198 en GPQA Diamond. La calidad en MMLU y GPQA es sensible al limite de longitud de respuesta.
- No se han publicado evaluaciones de seguridad, sesgo, toxicidad ni alineacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las advertencias habituales de un modelo generativo sin evaluacion de fidelidad.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano ni de otras lenguas.
- La ventana de contexto de 1.048.576 tokens no se exercised completa en las pruebas: las ejecuciones AgentX usaron un tope de 262.144 tokens.
- El video no fue evaluado; solo se probaron peticiones de imagen y seguimiento con cache.
- La ruta de servicio depende de una implementacion en SGLang (PR #39273). La model card consultada no indica si esa PR estaba fusionada en la fecha del checkpoint.
- El despliegue exige hardware AMD gfx950 y al menos cuatro MI355X en la configuracion probada. No hay ruta documentada para NVIDIA ni para GPUs de consumo.
- Tras un rechazo especulativo o un truncado por token de parada, la cache KV y el estado Mamba deben apuntar al mismo prefijo comprometido; un manejo incorrecto del estado invalida la correccion de la decodificacion.
- Discrepancia de parametros: los safetensors del repositorio suman 169.120.127.838 parametros mientras el modelo base declara 320B totales. Conviene verificar el recuento real antes de dimensionar infraestructura o comparar con otras variantes.
- La licencia del repositorio es MIT, lo que permite uso comercial, pero no se detallan en la informacion disponible los terminos del modelo base zai-org/GLM-5.3-Flash, que conviene revisar antes de un despliegue en produccion.
- La model card consultada esta truncada en su seccion final, por lo que parte de los detalles de la ruta de servicio y de las mediciones AgentX pueden faltar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneNexus/GLM-5.3-Flash-MXFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint de referencia de AMD: https://huggingface.co/amd/GLM-5.3-Flash-Quark-MXFP4
- Implementacion en SGLang: https://github.com/sgl-project/sglang/pull/39273
- Protocolo de evaluacion: https://huggingface.co/OneNexus/GLM-5.3-Flash-MXFP4/blob/main/reproduction/quality-protocol.md
- Datos agregados por pregunta: https://huggingface.co/OneNexus/GLM-5.3-Flash-MXFP4/blob/main/assets/checkpoint-quality-comparison.json
- Resumen AgentX de OneNexus: https://huggingface.co/OneNexus/GLM-5.3-Flash-MXFP4/blob/main/assets/checkpoint-agentx-onenexus.json
- Resumen AgentX de AMD: https://huggingface.co/OneNexus/GLM-5.3-Flash-MXFP4/blob/main/assets/checkpoint-agentx-amd.json
- Grafico comparativo de calidad: https://huggingface.co/OneNexus/GLM-5.3-Flash-MXFP4/resolve/main/assets/checkpoint-quality-comparison.png
- Diagrama del mecanismo DSA y K-pool: https://huggingface.co/OneNexus/GLM-5.3-Flash-MXFP4/resolve/main/assets/dsa-kpool-mechanism.png
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido sobre destinos de playa en Italia). No se han encontrado enlaces adicionales relevantes.
