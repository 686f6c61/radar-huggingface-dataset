# OptimaMT/fr-ru

## Resumen

OptimaMT/fr-ru es un modelo de traduccion automatica frances-ruso derivado de Xenova/opus-mt-fr-ru, que a su vez es la exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. Lo desarrolla el proyecto OptimaMT, que mantiene 49 pares de idiomas bajo el esquema `OptimaMT/<src>-<tgt>`. La aportacion concreta de esta version es una reingenieria del grafo del decodificador combinado: se ha extraido la proyeccion de salida de sus dos ramas, lo que reduce el consumo de memoria en inferencia sin alterar los pesos ni la tokenizacion.

El modelo mantiene exactamente los mismos pesos, vocabulario (64.377 tokens) y salida que el original: la model card afirma que los tokens generados son identicos. La mejora es puramente de eficiencia: con `disable_quant_qdq = 1` el consumo tras la carga baja de 539 a 287 MiB en Linux (-47 %) y de 513 a 264 MiB en Windows (-49 %); con los valores por defecto de ONNX Runtime la reduccion es del 22 % en Linux y del 16 % en Windows.

Es relevante para despliegues en navegador y en edge: al estar empaquetado para transformers.js con pesos ONNX cuantizados en q8, permite traduccion fr-ru local sin backend GPU ni servicio externo, con una huella de memoria de unos 224-287 MiB. No es un modelo nuevo entrenado desde cero, sino una optimizacion de empaquetado sobre una base Marian ya consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado q8 (`decoder_model_merged_quantized.onnx`) |
| Idiomas soportados | frances (fr), ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js) |
| Vocabulario | 64.377 tokens |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Xenova/opus-mt-fr-ru (revision `c2ec732b045a`) |
| Modelo original | Helsinki-NLP/opus-mt-fr-ru |

## Arquitectura y entrenamiento

La arquitectura es la de Marian NMT: un transformer encoder-decoder disenado especificamente para traduccion automatica, en la linea de OPUS-MT. El modelo no ha sido reentrenado por OptimaMT; los pesos proceden de Helsinki-NLP/opus-mt-fr-ru y la exportacion ONNX de Xenova/opus-mt-fr-ru en la revision `c2ec732b045a`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del corpus ni si hubo etapas de ajuste fino con RLHF o DPO.

La innovacion tecnica de esta ficha es exclusivamente de grafo: se ha reconstruido unicamente `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyeccion de salida del decodificador fuera de sus dos ramas. El resto de ficheros del repositorio son identicos byte a byte al original. Segun la model card, el cambio no altera los tokens generados. Las mediciones se realizaron con ONNX Runtime 1.31.1 sobre CPU con 4 hilos, en Linux y en una maquina virtual Windows.

## Capacidades

- Traduccion de texto frances a ruso, unidireccional.
- Generacion de texto secuencia a secuencia mediante pipeline `translation` de transformers.js.
- Ejecucion en navegador y en Node.js a traves de ONNX Runtime Web/WASM.
- Inferencia en CPU sin necesidad de GPU.
- Salida determinista respecto al modelo base: mismos tokens que Xenova/opus-mt-fr-ru.
- No soporta tool calling ni function calling.
- No incorpora modo de razonamiento extendido (thinking mode).
- No soporta vision ni audio.
- No esta disenado para agentes ni razonamiento multi-paso.

## Casos de uso

- Traduccion de documentacion tecnica fr-ru en el navegador: el modelo se carga con transformers.js y procesa parrafos localmente, sin enviar el texto a un servidor, lo que resulta adecuado para material interno o confidencial.
- Localizacion de interfaces web en tiempo real: al ocupar entre 224 y 287 MiB tras la carga, puede integrarse en una aplicacion cliente que traduzca cadenas de UI o mensajes de usuario del frances al ruso bajo demanda.
- Extension de navegador para lectura de prensa francófona: traduccion de articulos al ruso con inferencia en el propio dispositivo, evitando costes de API y dependencias de red.
- Procesamiento por lotes en entornos sin GPU: el script `translate.py` (onnxruntime, sentencepiece, numpy) permite traducir corpus en servidores CPU modestos gracias a la reduccion de memoria del decodificador.
- Traduccion de correspondencia y correo electronico: para flujos donde el contenido no debe salir de la infraestructura local, el modelo ofrece una alternativa autoalojada con licencia CC BY 4.0.
- Prototipado rapido de pipelines multilingues: dentro de un sistema mayor, este par fr-ru puede combinarse con otros pares de OptimaMT para encadenar traducciones y cubrir rutas sin ingles como pivote.
- Educacion y demostraciones: su tamano reducido (0,1 GB de repositorio) lo hace util para talleres sobre traduccion neuronal y despliegue ONNX en el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, COMET u otros) en la informacion disponible. Los unicos datos de rendimiento publicados son de consumo de memoria:

| Metrica | Linux | Windows |
|---|---:|---:|
| Memoria tras carga, `disable_quant_qdq = 1` | 539 → 287 MiB (-47 %) | 513 → 264 MiB (-49 %) |
| Memoria tras carga, valores por defecto de ONNX Runtime | 287 → 224 MiB (-22 %) | 200 → 168 MiB (-16 %) |
| Tokens generados identicos al original | si | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos. No se han publicado datos de latencia ni de throughput en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU.
- Memoria RAM estimada: unos 224-287 MiB tras la carga con la configuracion recomendada, segun plataforma.
- GPU: no necesaria; no se han publicado requisitos ni soporte GPU especifico.
- Cabe en cualquier equipo de consumo, incluidos portatiles modestos y navegadores de escritorio.
- Despliegue: transformers.js (`@huggingface/transformers`) con `dtype: "q8"`; en Python, el script `translate.py` con onnxruntime, sentencepiece y numpy.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/fr-ru | no disponible | no disponible | fr → ru | CC BY 4.0 | ONNX q8 | Decodificador combinado optimizado; -47 % de memoria frente al base |
| Xenova/opus-mt-fr-ru | no disponible | no disponible | fr → ru | CC BY 4.0 | ONNX | Exportacion original de transformers.js; mismo comportamiento, mas memoria |
| Helsinki-NLP/opus-mt-fr-ru | no disponible | no disponible | fr → ru | CC BY 4.0 | safetensors/PyTorch | Modelo OPUS-MT original de la Universidad de Helsinki; requiere framework de inferencia completo |

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de frances a ruso; no admite la direccion inversa.
- Al heredar los pesos de OPUS-MT, arrastra los sesgos y errores del corpus de entrenamiento original, no documentados en la informacion disponible.
- Riesgo de alucinacion y de traducciones infieles en dominios especializados (terminologia juridica, medica o tecnica muy especifica).
- No se ha publicado la longitud maxima de contexto; frases o documentos largos pueden requerir segmentacion manual.
- El rendimiento en registro coloquial, jerga o variantes regionales del frances no esta documentado.
- Uso comercial permitido bajo CC BY 4.0, con obligacion de atribucion a OPUS-MT (Universidad de Helsinki), a Xenova y a OptimaMT.
- La optimizacion depende de la opcion `disable_quant_qdq = 1` y de ONNX Runtime 1.31.1; con otras versiones o configuraciones la reduccion de memoria puede variar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopcion ni de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/fr-ru
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-fr-ru
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-fr-ru
