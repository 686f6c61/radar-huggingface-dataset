# elnemer7/ElNeMeR-Celebrity-CEO-Deepfake-Ad-Scam-ONNX

## Resumen

ElNeMeR-Celebrity-CEO-Deepfake-Ad-Scam-ONNX es un clasificador binario/multiclase exportado a formato ONNX, publicado por el desarrollador elnemer7 (Eng. Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) dentro de una flota anunciada de 50 modelos orientados a forense digital y "humanitarian AI". El modelo declara detectar anuncios patrocinados virales que emplean deepfakes con sincronizacion labial de presentadores de television, empresarios, medicos y figuras publicas para promocionar supuestas plataformas de auto-trading y sorteos fraudulentos.

La arquitectura subyacente no se detalla en la model card: se describe unicamente como un grafo ONNX (opset 14) que consume un tensor `features` de tipo `float32` con forma `[batch_size, 512]` y devuelve probabilidades sobre tres clases (`authentic_public_figure_media`, `fake_ceo_tv_trading_platform_ad`, `deepfake_anchor_giveaway_endorsement`). No se especifica si el extractor de caracteristicas es un modelo visual, de audio o multimodal, ni se documenta el proceso de entrenamiento.

El interes del modelo es acotado pero concreto: se presenta como una pieza de un pipeline de verificacion publicitaria o moderacion de contenido, ejecutable en `onnxruntime` y `onnxruntime-web` (WASM). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamano declarado es de 0.0 GB y la unica metrica de rendimiento publicada es una "Calibration Accuracy" del 100.00%, sin definicion del conjunto de evaluacion ni del protocolo de medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafo ONNX, opset 14; se desconoce la red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible (entrada de vector fijo de 512 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (compatible con onnxruntime y onnxruntime-web WASM) |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura interna. Lo unico documentado es la interfaz de inferencia: un tensor de entrada `features` de `float32` con forma `[batch_size, 512]`, procesado por un grafo ONNX en opset 14, con salida de probabilidades para tres clases. El hecho de que la entrada sea un vector de 512 dimensiones sugiere que el modelo no opera directamente sobre pixeles o audio crudo, sino sobre un embedding precalculado por un extractor externo no incluido en el repositorio ni descrito en la model card.

No se especifican datos de entrenamiento (numero de tokens o muestras, composicion del dataset, fuentes de deepfakes positivos y negativos), ni si hubo ajuste fino supervisado, RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica como decodificacion especulativa o atencion lineal. La unica cifra de rendimiento publicada es una "Calibration Accuracy" del 100.00%, sin definicion del conjunto de validacion, tamano de muestra ni criterio de calibracion, por lo que no es interpretable como metrica de generalizacion.

## Capacidades

- Clasificacion de contenido audiovisual publicitario en tres categorias: media autentica de figuras publicas, anuncio falso de plataforma de trading con CEO/TV, y endorsement falso con presentador deepfake.
- Deteccion de deepfakes con sincronizacion labial orientados a suplantacion de celebridades y directivos.
- Deteccion de esquemas de fraude publicitario (ad fraud) asociados a promesas de auto-trading y sorteos.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), lo que permite despliegue cliente sin backend.
- Ejecucion por lotes (`batch_size` configurable) en `onnxruntime` para servidor.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingues.

## Casos de uso

- Moderacion de anuncios en plataformas publicitarias: clasificar creatividades patrocinadas antes de su publicacion para bloquear las que encajan en las clases 1 o 2, usando el vector de 512 dimensiones extraido del creativo como entrada al grafo ONNX.
- Verificacion de videos virales en redes sociales: procesar fotogramas o segmentos con un extractor externo, agregar los embeddings y consultar el modelo para marcar posibles suplantaciones de presentadores o directivos.
- Extension de navegador para el usuario final: ejecutar el modelo via `onnxruntime-web` (WASM) sobre el contenido de una pagina y mostrar una advertencia cuando el clasificador devuelve alta probabilidad de deepfake publicitario.
- Triaje en unidades de forense digital: priorizar casos de suplantacion de figuras publicas antes de la revision manual, dado el bajo coste de inferencia de un grafo ONNX pequeno.
- Monitorizacion de campanas de fraude: integrar el clasificador en un pipeline de scraping de anuncios para detectar de forma continua nuevas creatividades que reutilizan el mismo patron (CEO + trading, presentador + sorteo).
- Investigacion academica sobre deepfakes publicitarios: usar el modelo como linea base o componente de comparacion en estudios de deteccion de suplantacion de celebridades, siempre que se documente el extractor de caracteristicas empleado.
- Filtrado previo en plataformas de pago o fintech: revisar creatividades de afiliados que promocionan productos financieros y bloquear las que imitan a directivos o presentadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada es "Calibration Accuracy: 100.00%", sin definicion del conjunto de evaluacion, tamano de muestra ni protocolo, por lo que no se presenta como benchmark comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0.0 GB y la entrada es un vector de 512 dimensiones, lo que sugiere un modelo muy pequeno, pero no se confirma.
- GPU recomendadas: no disponible. Por la naturaleza del grafo (entrada vectorial de 512), la inferencia en CPU es plausible, pero no esta documentada.
- Compatibilidad con GPU de consumo: probable en cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 en adelante), si bien no hay datos publicados que lo confirmen.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM) segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores ONNX de deteccion de deepfakes publicitarios) con parametros, contexto y licencia documentados.

## Limitaciones y advertencias

- La model card no describe la arquitectura interna, los datos de entrenamiento ni el extractor de caracteristicas que produce el vector de 512 dimensiones; sin ese componente el modelo no es reproducible de extremo a extremo.
- La metrica "Calibration Accuracy: 100.00%" carece de protocolo, tamano de muestra y conjunto de evaluacion; no debe interpretarse como evidencia de rendimiento en produccion.
- Riesgo de falsos positivos y negativos no cuantificado: no se publican matrices de confusion, precision, recall ni F1 por clase.
- Sesgos conocidos: no documentados. Al tratarse de un detector de suplantacion de figuras publicas, podria estar sesgado hacia el tipo de celebridades, idiomas y formatos presentes en su dataset de entrenamiento, que no se especifica.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si en cuanto a clasificaciones erroneas con alta confianza si la calibracion no se ha validado de forma independiente.
- Limitaciones de idioma y contexto: no se declaran idiomas soportados; la entrada es un vector fijo de 512 dimensiones, sin ventana de contexto textual.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad sobre el uso forense o legal de las clasificaciones.
- El repositorio presenta 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente subidos o que el artefacto es minimo; conviene verificar la integridad del repositorio antes de integrarlo.
- Uso en produccion: no se recomienda como unico criterio para acusar o bloquear contenido; debe combinarse con revision humana y otros detectores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Celebrity-CEO-Deepfake-Ad-Scam-ONNX
- Plataforma forense declarada por el autor: https://detector.elnemer-ai.com
- Portal corporativo del autor: https://elnemer-ai.com
