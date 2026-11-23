# schift-io/schift-ko-pii-ax-v1

## Resumen

schift-ko-pii-ax-v1 es un modelo de etiquetado de secuencias (token classification) especializado en la deteccion de datos personales en texto coreano. Concretamente, identifica los rangos exactos de caracteres correspondientes a nombres de personas y direcciones postales, con el objetivo de que un sistema posterior pueda enmascararlos o sustituirlos (por ejemplo, `김범수` → `[이름]`). Lo desarrolla schift-io y esta afinado a partir de skt/A.X-Encoder-base, un encoder ModernBERT de aproximadamente 149 millones de parametros.

El modelo resuelve un problema acotado pero critico en pipelines de privacidad: la desidentificacion de texto en coreano antes de su almacenamiento, envio a terceros o uso en entrenamiento. A diferencia de los enfoques puramente basados en reglas, devuelve spans exactos (esquema BIOES) con una puntuacion de confianza por span, lo que permite aplicar umbrales calibrados para garantizar precision. Telefonos, correos electronicos, numeros de residente, URLs y secretos quedan fuera del alcance del modelo y se gestionan mediante reglas en el paquete `schift-ko-pii`.

Su relevancia practica radica en el despliegue: se distribuye en tres formatos (PyTorch fp32, ONNX int8 y ONNX 4-bit) con umbrales calibrados por fichero, incluye inferencia en navegador via onnxruntime-web/WASM y esta integrado por defecto en la version 0.7.0 o superior del paquete `schift-ko-pii`. La licencia Schift v2.0 (Apache 2.0 con umbral de ingresos) condiciona el uso comercial a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), con cabeza de clasificacion `Linear(768, 9)` |
| Parametros totales | 148.731.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por llamada (entrada limitada; dividir textos largos) |
| Tipos de cuantizacion | fp32 (PyTorch), int8 dinamica (ONNX), 4-bit con bloques de 128 (ONNX) |
| Idiomas soportados | coreano (ko) |
| Licencia | Schift License v2.0 (base Apache 2.0 con umbral de ingresos); modelo base Apache-2.0 |
| Formato de pesos | safetensors (backbone + `pii_head.safetensors`), ONNX (`pii_int8.onnx`, `pii_q4b128.onnx`) |
| Tarea | token-classification (esquema BIOES) |
| Etiquetas | 9 (definidas en `pii_config.json`) |
| Umbrales por fichero | fp32: 0.475; int8: 0.625; 4-bit: 0.725 |
| Tamano del repo | 0.8 GB |

## Arquitectura y entrenamiento

El modelo emplea un backbone ModernBERT (skt/A.X-Encoder-base) al que se anade una cabeza lineal de 768 a 9 etiquetas sobre la `last_hidden_state`. La salida se decodifica como spans BIOES; un span se conserva si la probabilidad minima entre todos sus tokens supera el umbral del fichero correspondiente. Cada umbral se selecciono como el valor de mayor recall con precision igual o superior a 0,95 sobre el split de calibracion del bench (976 filas), de forma independiente para fp32, int8 y 4-bit.

El entrenamiento consistio en un fine-tune completo de 3.000 pasos, batch 16, longitud maxima 512, learning rate 5e-5 y semilla 42, sobre 21.994 filas. La composicion del dataset es: 4.560 filas del split de entrenamiento de `schift-pii-bench-v4` (con 3.342 filas de KDPII y division a nivel de documento); 5.106 filas sinteticas de formularios y dialogos generadas por codigo con spans exactos; y 12.334 fragmentos de texto OCR del boletin oficial coreano (관보), etiquetados por `claude-haiku-5-5` con reglas escritas (nombres y direcciones enmascarados cuentan, celdas de tabla con solo numero de lote cuentan como direccion, codigos postales no cuentan). Se eliminaron las filas que solapaban con cualquier texto de evaluacion. No se menciona RLHF ni DPO; el ajuste es supervisado sobre etiquetas de span.

## Capacidades

- Deteccion de nombres de personas en coreano con devolucion de rango exacto de caracteres y puntuacion de confianza.
- Deteccion de direcciones postales en coreano, incluidas celdas de tabla con solo numero de lote.
- Etiquetado BIOES con spans a nivel de caracter, apto para sustitucion directa (`[이름]`).
- Reconocimiento de nombres enmascarados parcialmente en texto OCR (`김영*`, `홍○동`, `○○동 123-○`).
- Inferencia en CPU mediante ONNX (int8 y 4-bit) y en navegador via onnxruntime-web 1.31.1 (WASM), con el texto sin salir de la pagina.
- Integracion con el paquete `schift-ko-pii` 0.7.0 o superior mediante `schift_heads.json` (layout `joint`).
- No cubre telefonos, correos, numeros de residente o cuenta, URLs ni secretos: esos se gestionan por reglas en el paquete.
- No cubre organizaciones, fechas ni identificadores.
- Solo texto; no hay vision ni audio.
- No se documenta soporte de tool calling ni razonamiento multi-paso (es un modelo de etiquetado, no generativo).

## Casos de uso

- Desidentificacion previa al almacenamiento: antes de persistir documentos coreanos (formularios, actas, correspondencia), el modelo marca los spans de nombre y direccion para que el pipeline los sustituya por placeholders, reduciendo la exposicion de datos personales en bases de datos.
- Preprocesado para entrenamiento de modelos: al filtrar corpus coreanos, se aplica el modelo para enmascarar nombres y direcciones y cumplir requisitos de minimizacion de datos antes de usar el texto como datos de entrenamiento.
- Redaccion de documentos del boletin oficial: el modelo se entreno especificamente con OCR de la gaceta oficial coreana, por lo que encaja en flujos de publicacion que deben ocultar nombres y direcciones de ciudadanos citados en resoluciones.
- Cumplimiento normativo en atencion al cliente: en transcripciones o correos de soporte en coreano, el modelo localiza nombres y direcciones para anonimizar registros antes de revisiones internas o auditorias, con umbrales calibrados para precision alta.
- Procesamiento en el navegador: con `browser/demo.html` y el fichero 4-bit, una aplicacion web puede anonimizar texto localmente sin enviar datos a un servidor, util para herramientas internas con requisitos estrictos de privacidad.
- Enriquecimiento de pipelines de extraccion: los spans devueltos (con `start`, `end` y `score`) permiten construir capas de pseudonimizacion deterministas o alimentar un sistema de gestion de consentimientos que necesite saber donde aparece cada entidad.
- Moderacion y revision de contenido en foros: deteccion de nombres y direcciones en publicaciones coreanas para advertir al usuario o aplicar redaccion automatica antes de publicar.

## Benchmarks y rendimiento

Evaluacion con coincidencia exacta de span (F1), segun la model card:

| Conjunto | Filas | Metrica | fp32 | int8 | 4-bit |
|---|---|---|---|---|---|
| Gazette holdout (documentos no vistos) | 1.684 | F1 | 0,950 | 0,946 | 0,940 |
| | | recall / precision nombre | 0,979 / 0,990 | 0,976 / 0,991 | 0,965 / 0,993 |
| | | recall / precision direccion | 0,935 / 0,936 | 0,916 / 0,944 | 0,893 / 0,953 |
| Gazette con texto enmascarado | 1.065 | F1 | 0,911 | 0,910 | 0,906 |
| | | recall / precision direccion | 0,859 / 0,865 | 0,833 / 0,893 | 0,796 / 0,918 |
| Bench holdout | 978 | F1 | 0,990 | 0,989 | 0,988 |

Tres semillas de entrenamiento dan F1 fp32 de 0,949 ± 0,001 en gazette y 0,990 ± 0,001 en bench. El bench holdout comparte fuentes con el split de entrenamiento (133 de sus 354 nombres aparecen en entrenamiento), por lo que debe leerse como comprobacion in-distribution. Las etiquetas de gazette son generadas por modelo; una auditoria con codex sobre 160 fragmentos coincidio en casi todos los nombres de persona y en aproximadamente el 70% de los spans de direccion (la mayoria de discrepancias en los limites del span).

Rendimiento medido (fragmentos de hasta 512 tokens):

| Runtime | Hardware | Fichero | Mediana por fragmento |
|---|---|---|---|
| onnxruntime CPU, 4 hilos | AMD Ryzen 9 9950X | int8 | 49 ms (max 132 ms) |
| onnxruntime CPU, 1 hilo | AMD Ryzen 9 9950X | int8 | 122 ms |
| Chrome 157, WASM, 8 hilos | Apple M5 Pro | 4-bit | 0,40 s para fragmentos de mas de 300 tokens |

La salida en navegador coincide con la de Python en 31 de 31 documentos de prueba. El backend WebGPU no ejecuta correctamente estos ficheros cuantizados; debe usarse WASM.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone fp32 ocupa aproximadamente 597 MB en disco; en GPU, con fp32 y activaciones para 512 tokens, se estima por debajo de 2 GB, aunque no se publica una cifra oficial de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria puede ejecutar el modelo; A100, H100, RTX 4090 y similares son sobredimensionadas para este encoder de 149M. En CPU es plenamente funcional.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna; tambien en CPU sin GPU.
- Opciones de despliegue: onnxruntime (CPU), onnxruntime-web con WASM (navegador), PyTorch con `transformers` y `safetensors`; el paquete `schift-ko-pii` >= 0.7.0 lo carga por defecto. No se documenta soporte de vLLM, TGI o llama.cpp.
- Latencia y throughput: 49 ms por fragmento de hasta 512 tokens con int8 y 4 hilos en Ryzen 9 9950X; 122 ms con 1 hilo; 0,40 s en navegador con WASM y 8 hilos en Apple M5 Pro para fragmentos de mas de 300 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de PII en coreano en la informacion proporcionada. La model card solo menciona como referencia interna las cabezas encoder de `schift-ko-pii-v7`, que cubren las mismas dos categorias (nombre y direccion) y cuyo comportamiento no se detalla numericamente.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| schift-ko-pii-ax-v1 | 148,7M | 512 tokens | NER PII coreano (nombre, direccion) | Schift v2.0 | Hugging Face, ONNX, navegador |
| skt/A.X-Encoder-base | no disponible | no disponible | encoder base coreano | Apache-2.0 | Hugging Face |
| schift-ko-pii-v7 (cabezas encoder) | no disponible | no disponible | NER PII coreano (mismas categorias) | no disponible | paquete `schift-ko-pii` |

## Limitaciones y advertencias

- Silabas espaciadas en celdas de tabla pueden etiquetarse como nombre: el motivo de devolucion postal `이 사 갑` fue etiquetado con 0,88 por esta semilla, consecuencia del entrenamiento con nombres OCR espaciados como `김 영 호`.
- Las direcciones de instituciones se etiquetan igual que cualquier otra direccion.
- El recall de direcciones en paginas de gazette con texto enmascarado ronda el 80%, con precision menor que en texto limpio.
- Solo texto y 512 tokens por llamada; los textos mas largos deben dividirse (por ejemplo, en saltos de linea) antes de inferir.
- Organizaciones, fechas e identificadores quedan fuera del alcance; telefonos, correos, numeros de residente o cuenta, URLs y secretos se gestionan por reglas en el paquete, no por el modelo.
- Riesgo de alucinacion de spans: al ser un etiquetador, puede marcar como entidad texto que no lo es; los umbrales calibrados (precision >= 0,95 en calibracion) mitigan pero no eliminan este riesgo.
- El bench holdout es in-distribution y las etiquetas de gazette son generadas por modelo, con discrepancias en los limites de direccion en aproximadamente el 30% de los spans auditados; no debe tomarse como validacion en tipos de documento nuevos.
- Licencia Schift v2.0: Apache 2.0 con umbral de ingresos; revisar `LICENSE` y `NOTICE` antes de uso comercial. El modelo base skt/A.X-Encoder-base es Apache-2.0.
- La version 0.6.0 o anterior del paquete `schift-ko-pii` no puede leer este checkpoint (layout `joint`).
- El backend WebGPU de onnxruntime-web no ejecuta correctamente los ficheros cuantizados; usar WASM.
- No se documentan sesgos linguisticos especificos mas alla de los derivados de la composicion del corpus (OCR de gazette oficial y datos sinteticos).

## Enlaces

- Hugging Face: https://huggingface.co/schift-io/schift-ko-pii-ax-v1
- Modelo base: https://huggingface.co/skt/A.X-Encoder-base
- Dataset de bench: https://huggingface.co/datasets/schift-io/schift-pii-bench-v4
- Licencia (Schift License v2.0): fichero `LICENSE` en el repositorio
- Aviso de atribucion: fichero `NOTICE` en el repositorio
- Inferencia Python: `pii_infer.py` en el repositorio
- Demo en navegador: `browser/demo.html` en el repositorio
