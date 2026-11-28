# OptimaMT/es-it

## Resumen

OptimaMT/es-it es un modelo de traduccion automatica espanol-italiano distribuido en formato ONNX para su uso con Transformers.js y ONNX Runtime. Es una copia directa de Xenova/opus-mt-es-it (revision `596c67cda7cb`), que a su vez es una exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. La unica modificacion respecto al original es la reconstruccion del decoder fusionado cuantizado con el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`), que reduce el consumo de memoria y acelera la inferencia sin alterar los pesos ni los tokens generados.

El modelo resuelve un problema muy concreto: desplegar traduccion espanol-italiano de calidad en entornos con recursos limitados, como aplicaciones de escritorio o navegador. Frente al original de Xenova, reduce el uso de memoria tras la carga entre un 46 % y un 48 % en Linux y Windows respectivamente, y es entre 2,3 y 2,5 veces mas rapido en modo rapido. Mantiene exactamente las mismas traducciones que el modelo de referencia, con BLEU 20,58 y chrF 51,41 en FLORES-200 devtest.

Su relevancia actual radica en que forma parte de una coleccion de 51 pares de idiomas con el mismo enfoque de optimizacion, y ya se usa en produccion en OpenCircle, un traductor de pantalla de escritorio para Windows y Linux desde la version v0.1.4. Es, por tanto, una pieza practica para pipelines de traduccion local sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | espanol (es), italiano (it) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de archivos identicos al original) |
| Vocabulario | 59.031 tokens |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers.js |
| Modelo base | Xenova/opus-mt-es-it (revision `596c67cda7cb`) |
| Pipeline | translation |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder de la familia Marian, concretamente un modelo OPUS-MT entrenado por la Universidad de Helsinki para la direccion espanol-italiano. La arquitectura es la clasica de traduccion neuronal secuencia a secuencia, con un vocabulario de 59.031 tokens compartido entre origen y destino segun el esquema de OPUS-MT.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al modelo original de Helsinki y no se detallan en la informacion proporcionada. La innovacion tecnica de esta ficha no esta en el entrenamiento, sino en el empaquetado: el decoder fusionado cuantizado se ha reconstruido moviendo la proyeccion de salida fuera de sus dos ramas (cambio solo de grafo) y aplicando el modo rapido de ONNX Runtime mediante `disable_quant_qdq = 1`. El resto de archivos son identicos byte a byte al original de Xenova. El resultado son las mismas traducciones con menor huella de memoria y mayor velocidad.

## Capacidades

- Traduccion de texto espanol a italiano, unica direccion soportada.
- Generacion de texto secuencia a secuencia mediante pipeline `translation` de Transformers.js.
- Ejecucion en CPU con ONNX Runtime, sin necesidad de GPU.
- Inferencia en navegador o en aplicaciones de escritorio basadas en JavaScript/TypeScript gracias a Transformers.js.
- Uso desde Python mediante ONNX Runtime, sentencepiece y numpy (script `translate.py` incluido en el repositorio del proyecto).
- Produccion de tokens identicos al modelo de referencia Xenova/opus-mt-es-it, lo que facilita la sustitucion directa en sistemas existentes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Traduccion de pantalla en tiempo real: OpenCircle, el traductor de escritorio para Windows y Linux, integra estos modelos desde la version v0.1.4; la reduccion de memoria a unos 249-270 MiB tras la carga permite mantenerlo residente junto a otras aplicaciones sin penalizar el sistema.
- Traduccion en el navegador: al ejecutarse con Transformers.js y ONNX Runtime sobre WebAssembly o backend nativo, puede integrarse en extensiones o aplicaciones web que traduzcan contenido espanol a italiano sin enviar texto a servidores externos.
- Procesamiento por lotes de documentacion: para traducir manuales, articulos o fichas tecnicas de espanol a italiano en pipelines offline, el modo rapido de ONNX Runtime ofrece entre 2,3 y 2,5 veces mas velocidad que el original.
- Traduccion de subtitulos y transcripciones: su bajo consumo de memoria y su naturaleza local lo hacen adecuado para procesar ficheros SRT o transcripciones en equipos sin GPU dedicada.
- Integracion en aplicaciones de escritorio Electron o Tauri: el formato ONNX y la libreria transformers.js encajan en el stack JavaScript, y el modelo cabe holgadamente en el presupuesto de memoria de una aplicacion de escritorio.
- Traduccion de correspondencia y textos breves en herramientas internas: al mantener los mismos tokens que el modelo de referencia, se puede desplegar como sustituto directo en sistemas ya validados con Xenova/opus-mt-es-it sin revalidar las salidas.
- Prototipado de sistemas multilingues: forma parte de una coleccion de 51 pares con el mismo metodo, lo que permite construir un traductor multi-idioma combinando varios modelos `OptimaMT/<src>-<tgt>` con un enrutador por par de idiomas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre FLORES-200 devtest (1.012 frases, decodificacion greedy):

| Metrica | Valor |
|---|---|
| BLEU | 20,58 |
| chrF | 51,41 |
| Tokens identicos al original | Si |

Consumo de memoria tras la carga y comparativa de configuracion (ONNX Runtime 1.31.1, CPU, 4 hilos; Linux nativo, Windows en maquina virtual):

| Configuracion | Linux | Windows | Tokens identicos |
|---|---|---|---|
| `disable_quant_qdq = 1` | 501 → 270 MiB (-46 %) | 479 → 249 MiB (-48 %) | Si |
| Valores por defecto de ONNX Runtime | 269 → 211 MiB (-21 %) | 192 → 163 MiB (-15 %) | Si |

Velocidad: el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`) es entre 2,3 y 2,5 veces mas rapido que la configuracion por defecto, segun la model card. No se publican cifras absolutas de latencia o throughput (tokens por segundo) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el caso tipico; el modelo esta pensado para CPU. En GPU, la huella seria minima dado el tamano del repositorio (0,1 GB).
- Memoria RAM estimada tras la carga: aproximadamente 249-270 MiB con `disable_quant_qdq = 1` (Windows/Linux), o 163-211 MiB con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no se especifican; el modelo se ha validado en CPU con 4 hilos.
- Cabe en cualquier equipo de consumo: portatiles, mini-PC y sistemas de escritorio sin GPU dedicada.
- Opciones de despliegue: Transformers.js con ONNX Runtime (JavaScript/TypeScript), ONNX Runtime en Python con sentencepiece y numpy (script `translate.py`), y en general cualquier runtime compatible con ONNX.
- Latencia y throughput: no se publican cifras absolutas; solo la mejora relativa de 2,3-2,5 veces del modo rapido frente a la configuracion por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Memoria tras carga | Licencia | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/es-it | no disponible | no disponible | ONNX (transformers.js) | 249-270 MiB (modo rapido) | CC BY 4.0 | Decoder fusionado reconstruido; mismas salidas que Xenova |
| Xenova/opus-mt-es-it | no disponible | no disponible | ONNX (transformers.js) | 479-501 MiB (config. por defecto) | CC BY 4.0 | Modelo de referencia del que deriva OptimaMT |
| Helsinki-NLP/opus-mt-es-it | no disponible | no disponible | safetensors/PyTorch | no disponible | CC BY 4.0 | Modelo original de OPUS-MT en PyTorch |

La comparativa se limita a los tres modelos de la misma familia porque la informacion proporcionada no incluye datos de otros sistemas de traduccion es-it. La diferencia practica entre OptimaMT y Xenova es exclusivamente de empaquetado: mismo BLEU, mismos tokens y misma licencia, con menor memoria y mayor velocidad.

## Limitaciones y advertencias

- Solo traduce en la direccion espanol a italiano; no soporta la direccion inversa ni otros pares de idiomas.
- No se documentan sesgos especificos; al derivar de OPUS-MT, hereda los sesgos de los corpus paralelos usados por la Universidad de Helsinki, no detallados en la informacion disponible.
- Riesgo de alucinacion y de errores en textos especializados, dominios tecnicos o registro informal; no se han publicado evaluaciones por dominio.
- No se especifica la longitud maxima de contexto; conviene validar con frases o parrafos largos antes de usarlo en produccion con documentos extensos.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es necesario citar adecuadamente a OPUS-MT (Universidad de Helsinki), a Xenova por la exportacion ONNX y a OptimaMT por la modificacion.
- El rendimiento se ha medido en CPU con 4 hilos y ONNX Runtime 1.31.1; los resultados pueden variar con otras versiones del runtime, numero de hilos o plataformas.
- La fecha de creacion del repositorio (2026-11-09) es posterior a la fecha actual, un dato anomalo que conviene verificar antes de adoptarlo en produccion.
- El modelo tiene 0 likes y 175 descargas en el momento de la consulta, por lo que su adopcion comunitaria es limitada; la validacion en produccion documentada se reduce a OpenCircle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/es-it
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-es-it
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-es-it
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Coleccion de los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- OpenCircle, traductor de pantalla de escritorio: https://github.com/AmerAlreyahi/OpenCircle
