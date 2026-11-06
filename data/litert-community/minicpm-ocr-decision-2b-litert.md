# litert-community/MiniCPM-OCR-Decision-2B-LiteRT

## Resumen

MiniCPM-OCR-Decision-2B-LiteRT es la conversion a LiteRT de openbmb/MiniCPM-OCR-Jev, un modelo de OpenBMB disenado especificamente para verificar la salida de sistemas OCR. El modelo no genera texto: recibe la imagen de una region de texto, formula o tabla, un texto candidato producido por un motor OCR y una imagen renderizada a partir de ese texto, y devuelve una puntuacion entre 0 y 1 que indica la probabilidad de que el candidato sea correcto. Esta conversion ha sido realizada por la comunidad litert-community con litert-torch 0.10.0 para la API CompiledModel de ai-edge-litert 2.3.0.

La relevancia de esta version radica en su orientacion a la inferencia on-device. El repositorio empaqueta el modelo como ficheros LiteRT (TFLite) acompanados de un host en Python libre de PyTorch, con grafos separados para la torre de vision (que convierte una imagen en tokens) y para la decision (que procesa los tokens de la peticion completa). Se han publicado mediciones de latencia y acuerdos sobre GPU Metal de Apple M4 Max, GPU de Pixel 11 Pro, GPU y NPU de Galaxy S26, lo que lo hace util para pipelines de validacion OCR en movil y en el borde.

El modelo base es un transformer multimodal de aproximadamente 2B parametros con atención lineal con compuertas (gated linear attention) en el grafo de decision, segun se deduce de las notas de conversion sobre las formas de kernel `bt` y `cv`. Su licencia Apache 2.0 y su soporte para ingles y chino lo sitúan como una pieza practica para sistemas de digitalizacion documental que necesitan filtrar automaticamente OCR fiable antes de la revision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion lineal con compuertas (gated linear attention) en el grafo de decision; torre de vision separada |
| Parametros totales | 2B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 4.096 tokens en los grafos de decision publicados (ficheros de 256, 384, 512, 768, 1.024, 1.536, 2.048, 3.072 y 4.096 tokens) |
| Tipos de cuantizacion | no disponible (los grafos se publican a precision por defecto de GPU y float32 para la torre; no se detallan esquemas de cuantizacion) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT / TFLite (grafos de decision y torres de imagen), mas tokenizer y host en Python |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal de dos componentes. Una torre de vision procesa la imagen de la region y la convierte en tokens visuales; un grafo de decision recibe la secuencia completa (tokens de las dos imagenes y del texto candidato) y devuelve los estados ocultos a partir de los cuales el host calcula la puntuacion de verificacion. Las notas de conversion mencionan capas de atencion lineal con compuertas (gated linear attention) en el grafo de decision, con formas de kernel `bt` y `cv` que reducen el numero de operadores manteniendo el mismo computo. El modelo base es openbmb/MiniCPM-OCR-Jev, de aproximadamente 2B parametros.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card del autor de la conversion remite a la model card del modelo fuente para los detalles de entrenamiento. La innovacion tecnica destacable de esta version es la conversion a LiteRT con grafos separados por longitud de contexto y la compilacion de ficheros especificos para NPU (Qualcomm SM8850, presente en Galaxy S26), ademas de la verificacion de equivalencia numerica frente a la implementacion de referencia en float32 sobre CPU.

## Capacidades

- Verificacion de OCR: puntua un texto candidato contra la imagen de la region, devolviendo un valor entre 0 y 1.
- Verificacion de formulas y tablas: los grafos cubren regiones de texto, formula y tabla con latencias medidas distintas para cada tipo.
- Seleccion entre multiples motores OCR: permite elegir el mejor resultado entre varios candidatos comparando puntuaciones.
- Filtrado automatico y enrutado a revision humana: umbral configurable para aceptar regiones fiables y derivar el resto.
- Inferencia on-device: ejecucion en GPU y NPU de telefonos Android mediante LiteRT 2.2.0/2.3.0.
- Multilingue limitado: soporte declarado para ingles y chino.
- No genera texto: es un modelo de scoring, no un modelo generativo.
- No incluye renderizado de imagen: el host debe aportar la imagen renderizada del texto candidato.

## Casos de uso

- Digitalizacion documental a gran escala: integrar el modelo como etapa de validacion tras un motor OCR para aceptar automaticamente las regiones con puntuacion alta y reducir la cola de revision humana, usando los grafos de 256 a 4.096 tokens segun la longitud de la region.
- Ensembling de motores OCR: ejecutar dos o tres motores OCR sobre la misma region y seleccionar el candidato con mayor puntuacion del modelo de decision, lo que mejora la precision sin necesidad de un modelo generativo adicional.
- Procesamiento en movil sin conectividad: desplegar los grafos LiteRT en un telefono Android con GPU o NPU para validar capturas de documentos en el propio dispositivo; en Galaxy S26 una llamada de decision tarda 243,2 ms en NPU frente a 354,6 ms en el caso medido de region de texto.
- Extraccion de tablas financieras: usar los grafos de contexto largo (1.536 a 4.096 tokens) para verificar la transcripcion de tablas extensas, donde la latencia en GPU de Galaxy S26 es de 2.786,9 ms por llamada de decision.
- Verificacion de formulas cientificas: validar la transcripcion LaTeX de formulas en pipelines de publicacion academica, con latencias medidas de 583,5 ms en GPU de Galaxy S26 para regiones de formula.
- Control de calidad en pipelines de CI/CD de datos: ejecutar el host en Python sin PyTorch en un servidor de escritorio (por ejemplo, Apple M4 Max con Metal, 179,4 ms por region de texto) para auditar lotes de OCR antes de ingerirlos en un almacen de datos.
- Enrutado en sistemas de atencion al cliente con documentos adjuntos: verificar la transcripcion de documentos escaneados antes de pasarlos a un LLM posterior, reduciendo errores propagados.

## Benchmarks y rendimiento

Los datos disponibles son de acuerdo con la implementacion de referencia y de latencia, no de benchmarks academicos estandar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la informacion disponible para esas tareas.

| Metrica | Valor |
|---|---|
| AUROC (x100) en 417 registros olmOCR de JevOCRBench, Apple M4 Max con Metal | 92,40 (referencia float32 CPU: 92,38) |
| Registros que cambian de lado con umbral 0,5 | 2 de 417 |
| Registros que cambian de lado con umbral 0,9 | 1 de 417 |
| Diferencia maxima de puntuacion frente a referencia | 0,0554 |
| Latencia por region de texto, Apple M4 Max con Metal | 179,4 ms (mediana) |
| Latencia por llamada de decision, Pixel 11 Pro GPU (texto, formula, tabla) | 957,7 ms / 1.412,5 ms / 5.428,9 ms |
| Latencia por llamada de decision, Galaxy S26 GPU (texto, formula, tabla) | 406,3 ms / 583,5 ms / 2.786,9 ms |
| Latencia por llamada de decision, Galaxy S26 NPU (texto, formula) | 243,2 ms / 305,5 ms |
| Registros dentro de tolerancia en Pixel 11 Pro (90 registros) | 90 de 90 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 2B parametros y los grafos se ejecutan a precision por defecto de GPU y float32 para la torre, por lo que se espera un consumo moderado, apto para movil.
- GPU recomendadas: Apple M4 Max con Metal (medido), GPU de Pixel 11 Pro (medido), GPU de Galaxy S26 (medido). Para escritorio, cualquier GPU compatible con LiteRT/Metal.
- NPU: ficheros especificos para Qualcomm SM8850 (Galaxy S26) con cinco longitudes hasta 1.024 tokens.
- Cabe en consumer GPU: si, segun las mediciones en telefonos y en Apple M4 Max; no se detallan requisitos para GPUs de escritorio dedicadas.
- Opciones de despliegue: LiteRT (ai-edge-litert 2.3.0, API CompiledModel), con host en Python sin PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: ver tabla de benchmarks; las latencias por llamada van de 179,4 ms (M4 Max) a 5.428,9 ms (Pixel 11 Pro en tablas).

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de modelos comparables de verificacion OCR con formato LiteRT. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-OCR-Decision-2B-LiteRT | ~2B | hasta 4.096 tokens | apache-2.0 | LiteRT/TFLite | Verificacion OCR on-device |
| openbmb/MiniCPM-OCR-Jev | ~2B | no disponible | no disponible en la informacion | PyTorch (modelo fuente) | Referencia float32 en CPU |
| Alternativas de verificacion OCR | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las puntuaciones no tienen umbral ni etiqueta predefinidos y no estan calibradas a una escala absoluta de calidad; el umbral debe elegirse con muestras de la aplicacion concreta.
- El modelo no genera texto: solo puntua candidatos, por lo que requiere un motor OCR externo y un renderizador de imagen del texto candidato (no incluido en el repositorio).
- Idiomas limitados a ingles y chino; no se declara soporte para castellano ni otras lenguas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos o negativos en la verificacion; los cambios de lado en umbrales 0,5 y 0,9 son de 2 y 1 registros sobre 417, respectivamente.
- Las mediciones de NPU cubren 68 registros frente a 69 en tablas anteriores por falta de una imagen de 996 tokens en las ejecuciones de la torre del telefono; la cobertura es parcial.
- El repositorio ocupa 105,8 GB, lo que puede ser un obstaculo para su descarga y almacenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base openbmb/MiniCPM-OCR-Jev, no detallada en la informacion proporcionada.
- El rendimiento depende del hardware: las latencias en Pixel 11 Pro para tablas (5.428,9 ms) pueden ser prohibitivas para aplicaciones interactivas.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MiniCPM-OCR-Decision-2B-LiteRT
- Arbol de ficheros: https://huggingface.co/litert-community/MiniCPM-OCR-Decision-2B-LiteRT/tree/main
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Paper de referencia (arxiv:2502.18443): https://arxiv.org/abs/2502.18443
- Guia de puntuacion del repositorio fuente: docs/SKILL_jev_en.md (en el repositorio GitHub de OpenBMB, no se proporciona URL directa)
