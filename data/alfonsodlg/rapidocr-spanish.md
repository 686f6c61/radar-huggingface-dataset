# alfonsodlg/rapidocr-spanish

## Resumen

rapidocr-spanish es un conjunto de dos checkpoints de reconocimiento de texto (OCR de línea) especializados en documentos espanoles, publicados por el desarrollador alfonsodlg. Se trata de un fine-tuning del checkpoint `PaddlePaddle/PP-OCRv5_latin_mobile_rec` de PaddleOCR, adaptado para RapidOCR y con el cabezal de clasificacion podado a un vocabulario reducido de 116 caracteres especifico del castellano: letras minusculas y mayusculas con `ñ` y vocales acentuadas, digitos, puntuacion comun, simbolos monetarios (`€ £ º ª`) y un conjunto de simbolos que el vocabulario latin multilingue original contenia pero que una poda ingenua descarta (`< > _ Ø | · □ Φ ≠`).

El modelo no es un LLM ni un modelo generativo: es un reconocedor CTC de arquitectura movil (7,7 MB por checkpoint) que opera sobre recortes de linea de texto, pensado para integrarse en el pipeline completo de PP-OCR (detector + reconocedor). Resuelve el problema de la baja precision del reconocimiento OCR generico en tipografias y simbolos propios de la documentacion administrativa espanola: DNI, nominas, certificados, recibos, licencias de conducir, escrituras, historiales y planos tecnicos.

Es relevante ahora porque la mayoria de soluciones OCR open source estan optimizadas para ingles o para texto limpio, y el castellano administrativo presenta particularidades (acentos, `ñ`, simbolos de formulario, zonas de lectura mecanica) que degradan el CER de los modelos multilingues genericos. Este release ofrece una mejora medible de CER sobre el checkpoint stock en 10 de los 14 tipos de documento evaluados, con una licencia Apache-2.0 heredada de PaddleOCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocedor OCR tipo CTC (PP-OCRv5 mobile rec, tamano movil) sobre ONNX Runtime |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (reconoce una linea de texto por inferencia) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | espanol (`es`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`spanish_rec_v18.onnx`, `spanish_rec_v19.onnx`) + vocabulario de texto `ppocr_keys_es.txt` |

## Arquitectura y entrenamiento

La arquitectura es la del reconocedor movil de PP-OCRv5 (familia PaddleOCR): una red convolucional ligera con decodificacion CTC, sin componente generativo ni atencion de contexto largo. El checkpoint base `PP-OCRv5_latin_mobile_rec` se fine-tuneo con el cabezal podado al vocabulario de 116 caracteres espanoles, a una tasa de aprendizaje baja (`5e-5`) y durante 8 epocas. El autor advierte explicitamente que reutilizar un schedule de entrenamiento desde cero sobre un modelo ya convergido lo degrada, dato relevante para quien quiera reentrenar.

Los datos de entrenamiento combinan recortes reales extraidos de 48 ficheros de trabajo que cubren 17 tipos de documento (DNI, CVs, certificados, recibos, partes de seguro medico, permisos de conducir, libros de familia, escrituras de transmision, certificados de experiencia), renderizados a 300 DPI, junto con lineas sinteticas en espanol compuestas sobre fondos de papel escaneado real. Las etiquetas se generaron mediante consenso de tres modelos de vision con pasadas iterativas de refinado y una fraccion revisada manualmente. No se incluyen documentos, nombres ni identificadores de clientes en el release. Se distribuyen dos checkpoints (`v18` como predeterminado y `v19` como alternativa para recibos y registros), y el enrutado por tipo de documento entre ambos anade aproximadamente un 0,8 % relativo adicional sin regresiones, ya que un tipo desconocido recae en el modelo por defecto.

## Capacidades

- Reconocimiento de texto linea a linea en documentos espanoles (OCR de recorte de linea, no de pagina completa por si solo).
- Cobertura de caracteres espanoles: mayusculas y minusculas con `ñ` y vocales acentuadas, digitos, puntuacion comun y simbolos monetarios `€ £ º ª`.
- Cobertura de simbolos de formulario y zonas de lectura mecanica: `< > _ Ø | · □ Φ ≠`, incluyendo `<`, imprescindible en las zonas legibles por maquina de los DNI.
- Integracion con RapidOCR mediante `LangRec.ES` y rutas explicitas al modelo y al vocabulario.
- Consumo por `rapidocr-worker`, demonio en Rust sobre ONNX Runtime que sirve el pipeline PP-OCR completo por socket UNIX con memoria acotada (unos 74 MB por worker tras la carga, sin contencion del GIL de Python).
- Dos variantes con enrutado por tipo de documento para mejorar la precision en recibos y registros.
- No soporta tool calling, agentes, razonamiento multi-paso, vision de alto nivel ni audio: es exclusivamente un reconocedor OCR.

## Casos de uso

- Digitalizacion de nominas y recibos: el checkpoint `v19` esta orientado a recibos y registros, y el enrutado por tipo de documento anade un 0,8 % relativo de mejora sobre el modelo por defecto; se usaria como etapa de reconocimiento tras el detector de lineas.
- Procesado de DNI y documentos de identidad: el vocabulario incluye `<`, presente en las zonas de lectura mecanica, lo que permite transcribir lineas que un vocabulario podado de forma ingenua no puede reconocer en absoluto.
- Extraccion de datos de partes de seguro medico: el autor reporta una reduccion de CER del 25 % en este tipo de documento frente al checkpoint stock, lo que lo hace adecuado para pipelines de siniestros.
- Tramitacion de expedientes administrativos (certificados, libros de familia, escrituras de transmision): el fine-tuning cubre 17 tipos de documento y 14 tipos evaluados, con mejora en 10 de ellos, incluyendo CVs (−18 %) y planos (−19 %).
- Despliegue en servicios de alta concurrencia: `rapidocr-worker` permite servir el pipeline por socket UNIX con unos 74 MB por worker y sin contencion del GIL, adecuado para servicios Rust o backends con muchos procesos ligeros.
- Procesado batch de archivos escaneados a 300 DPI: el modelo esta entrenado sobre recortes renderizados a esa resolucion, por lo que encaja en flujos de digitalizacion masiva de papeleria.
- Integracion en RapidOCR para aplicaciones Python existentes: basta con fijar `Rec.lang_type`, `Rec.model_path` y `Rec.rec_keys_path` para sustituir el reconocedor por defecto.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto gold de 3.079 recortes (44.947 caracteres de referencia) de 14 tipos de documento espanoles, comparado con el checkpoint latin stock sobre los mismos recortes:

| Modelo | CER micro | CER macro |
|---|---|---|
| `PP-OCRv5_latin_mobile_rec` (stock) | 0,1745 | 0,1412 |
| `spanish_rec_v18` | 0,1476 | 0,1238 |

`micro` es el character error rate estandar (distancia de edicion sobre caracteres de referencia); `macro` es la media de tasas de error por recorte y favorece artificialmente al modelo en campos cortos. El checkpoint gana en 10 de los 14 tipos de documento: planos −19 %, CVs −18 %, partes de seguro medico −25 %. En planos renderizados a 300 DPI el error es mucho mayor (CER ≈ 0,30 micro) porque el detector tambien encuentra cotas y etiquetas diminutas. El autor advierte que parte del gold fue etiquetado por modelos de vision sin revision humana, por lo que las cifras deben tratarse como comparacion entre checkpoints y no como calidad absoluta.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Cada checkpoint pesa 7,7 MB en ONNX; el consumo reportado por el autor para el worker completo es de unos 74 MB por worker tras la carga (memoria del proceso, no VRAM dedicada).
- GPU recomendadas: no se especifican; el modelo es de tamano movil y esta pensado para ejecucion en CPU mediante ONNX Runtime. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) es sobredimensionada para este checkpoint.
- Cabe en cualquier GPU consumer y en CPU: el cuello de botella es el detector de lineas del pipeline PP-OCR, no este reconocedor.
- Opciones de despliegue: ONNX Runtime (libreria declarada), RapidOCR en Python y `rapidocr-worker` en Rust sobre ONNX Runtime con socket UNIX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto / alcance | CER (micro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rapidocr-spanish` (v18) | 7,7 MB ONNX | linea de texto, espanol | 0,1476 | Apache-2.0 | Hugging Face |
| `PP-OCRv5_latin_mobile_rec` (stock) | tamano movil | linea de texto, latin multilingue | 0,1745 | Apache-2.0 (heredada) | PaddlePaddle / Hugging Face |
| PPStructureV3 | no disponible | tablas (HTML) y formulas (LaTeX) | no disponible | no disponible | PaddleOCR |

La comparativa directa solo es posible contra el checkpoint base, ya que el autor no publica comparaciones con otros reconocedores OCR especializados en espanol. PPStructureV3 no es un sustituto para este caso de uso (cubre tablas y formulas, no reconocimiento de linea), pero se menciona como complemento para documentos con estructura tabular.

## Limitaciones y advertencias

- Ruido en las etiquetas: parte del gold fue etiquetado por modelos de vision sin revision humana, por lo que el error medido incluye error de referencia. Los numeros son comparativos, no una garantia absoluta de calidad.
- Texto pequeno: en planos renderizados a 300 DPI el CER sube a ≈ 0,30 micro porque el detector encuentra cotas y etiquetas diminutas. Es el area mas debil.
- Tablas y formulas no cubiertas: hay que usar PPStructureV3 para HTML de tablas y LaTeX.
- Sin modelo de parrafo: el reconocedor lee una linea a la vez y reconoce mal regiones multilinea fusionadas.
- Vocabulario obligatorio: el checkpoint no lleva metadatos de caracteres embebidos; emparejarlo con un diccionario distinto de `ppocr_keys_es.txt` corrompe la decodificacion CTC de forma silenciosa.
- Arquitectura movil (7,7 MB): un modelo mayor fine-tuneado con los mismos datos midio peor, segun el autor, por lo que la capacidad no era el cuello de botella.
- Licencia: Apache-2.0 heredada de los pesos publicados de PaddleOCR; permite uso comercial, pero conviene verificar las condiciones de la licencia original de PaddleOCR en el contexto de despliegue.
- Sin datos publicados sobre sesgos, alucinacion (no aplica a un modelo discriminativo) ni latencia/throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alfonsodlg/rapidocr-spanish
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv5_latin_mobile_rec
- RapidOCR: https://github.com/RapidAI/RapidOCR
- rapidocr-worker (consumidor en Rust): https://github.com/alfonsodg/rapidocr-worker
- PaddleOCR (proyecto original): no disponible en la informacion proporcionada
