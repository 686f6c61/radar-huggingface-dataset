# f1k/katip-mask-nano

## Resumen

Katip Mask Nano es un modelo de etiquetado de tokens (token classification) especializado en la detección de nombres de persona en textos legales turcos. Lo desarrolla f1k como componente del proyecto Katip Mask, una herramienta de redacción (redaction) orientada al cumplimiento de la KVKK, la ley turca de protección de datos. El modelo se distribuye como un archivo ONNX cuantizado a int8 de apenas 2,5 MB, pensado para ejecutarse en el navegador mediante transformers.js o en la CPU de un portátil, sin que el documento salga nunca del equipo del usuario.

La versión 1.1, publicada el 13 de noviembre de 2026, amplía el entrenamiento original (solo nombres turcos) con nombres extranjeros tal como aparecen en documentos turcos: sirios, iraníes, afganos, georgianos, armenios, griegos, árabes, ruso-ucranianos, azerbaiyanos y occidentales, con transliteraciones inconsistentes. El modelo no sustituye a las reglas de detección de Katip, sino que las complementa: las reglas cubren identificadores con checksum o forma fija (T.C. kimlik, IBAN, pasaporte, teléfono) y direcciones, mientras que el modelo aporta la detección de nombres propios.

Su relevancia radica en el equilibrio entre tamaño y utilidad práctica: un BERT minúsculo entrenado desde cero que mejora la detección de nombres extranjeros en prosa judicial real del 77,1% al 94,6% cuando se combina con las reglas, a costa de un aumento controlado de falsos positivos. Es un ejemplo de modelo de nicho, muy optimizado para un dominio y un idioma concretos, con licencia permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) entrenado desde cero |
| Parametros totales | no disponible (2 capas, hidden size 128, 2 cabezas, FFN 512, vocabulario WordPiece cased de 16.000) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 posiciones (ventanas de hasta 256 tokens) |
| Tipos de cuantizacion | int8 ONNX (unico formato publicado en esta release) |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (int8); los pesos PyTorch de v1 estan en el tag `v1.0` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder tipo BERT de dimensiones muy reducidas: 2 capas, tamaño oculto de 128, 2 cabezas de atención, FFN de 512 y 256 posiciones de contexto, con un vocabulario WordPiece cased de 16.000 tokens. El etiquetado se realiza por palabra sobre el primer sub-token de cada una, con las etiquetas `O`, `B-PER` e `I-PER`. Las palabras se segmentan con la expresión regular definida en `config.json` (`katip.word_regex`), y las ventanas de entrada se construyen con `[CLS] … [SEP]` de hasta 256 tokens. Es importante señalar que el pipeline estándar de token classification de Hugging Face segmenta de forma distinta y produce salidas ruidosas, por lo que el autor recomienda usar el código de referencia.

El entrenamiento se realizó desde cero durante 5 épocas con semilla 0, en unos 8 minutos sobre 4 núcleos de CPU. Los datos combinan 8.000 documentos sintéticos generados a partir de plantillas legales de Katip (demandas, sentencias, arrendamientos, contratos laborales, poderes notariales, notificaciones, correos, actas, chats e informes periciales), con parte de sus nombres sustituidos por extranjeros; 4.182 documentos de texto real (las 17.967 frases del corpus Turkish Wiki NER empaquetadas, más frases judiciales del split de entrenamiento de TurkishLegalNER y peticiones generadas con nombres rellenados); y una mezcla de nombres extranjeros transliterados de 10 grupos de origen con variantes ortográficas (Muhammed / Mohammad / Mhd, Al- / El-, -zadeh / -zade, -shvili / -şvili, -yan / -ian), excluyendo todas las familias reservadas para test. No se menciona el uso de RLHF ni DPO; es un ajuste supervisado de etiquetado de tokens.

## Capacidades

- Detección de nombres de persona (NER de tipo PER) en texto legal turco, incluyendo nombres extranjeros transliterados de forma inconsistente.
- Etiquetado por palabra con tres etiquetas (`O`, `B-PER`, `I-PER`) sobre el primer sub-token de cada palabra.
- Ejecución en navegador mediante transformers.js y en CPU mediante onnxruntime, sin necesidad de PyTorch.
- Integración con el motor de reglas de Katip para detección combinada de PII: identificadores con checksum, IBAN, tarjetas, teléfonos, matrículas, correos y direcciones quedan a cargo de las reglas.
- Soporte de flujo de redacción con revisión humana: cada valor enmascarado se muestra con una casilla de verificación para que el usuario confirme o descarte.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Redacción de documentos legales antes de compartirlos: el modelo detecta nombres de personas en demandas, sentencias y contratos para enmascararlos, y las reglas cubren el resto de identificadores; el documento nunca sale del equipo del usuario, lo que encaja con el requisito de la KVKK.
- Cumplimiento normativo en despachos de abogados: integración en el flujo de trabajo para anonimizar expedientes antes de enviarlos a terceros o a herramientas externas, con revisión manual de los valores marcados.
- Conector Katip Kalkan para Claude: el modelo actúa como capa de detección local de PII antes de que el texto se envíe a un modelo en la nube, reduciendo la exposición de datos personales.
- Anonimización de corpus judiciales para investigación: procesamiento por lotes de sentencias del Yargıtay para construir conjuntos de datos publicables sin nombres reales, apoyándose en la detección de nombres extranjeros en prosa judicial real.
- Herramientas de privacidad en el navegador: despliegue como modelo ONNX int8 de 2,5 MB dentro de una aplicación web que redacta textos sin backend, útil para periodistas o gestores documentales.
- Preprocesado de documentos en pipelines de NLP legal: eliminación de nombres antes de tareas posteriores como clasificación de documentos o extracción de cláusulas, evitando fugas de datos personales en los conjuntos de entrenamiento.
- Filtrado de PII en correos y actas internas de empresa: detección de nombres en comunicaciones y minutas antes de archivarlas o compartirlas con departamentos externos.

## Benchmarks y rendimiento

Resultados medidos con las reglas de Katip (v0.2, 14 de noviembre de 2026) y el código de detección exacto que ejecuta el navegador. Un valor cuenta como encontrado cuando un span detectado del mismo tipo lo cubre; los spans del modelo con puntuación igual o superior a 0,5 conservan sus bordes.

Nombres extranjeros en prosa judicial real (frases de test de TurkishLegalNER, Yargıtay, con los huecos anonimizados rellenados con nombres de familias reservadas, 3 rellenos por frase, 1.011 nombres; intervalos de confianza al 95% por bootstrap de documentos):

| Configuracion | Nombres extranjeros | Nombres turcos, mismos huecos | Precision | Falsos nombres por 1.000 palabras de texto trampa sin nombres |
|---|---|---|---|---|
| Solo reglas | 77,1% [73,9–80,1] | 93,0% | 99,9% | 0,6 |
| Reglas + Nano v1 | 80,3% [77,0–83,3] | 97,4% | 99,6% | 0,6 |
| Reglas + Nano v1.1 | 94,6% [92,5–96,2] | 98,7% | 97,4% | 9,1 |

Por origen (v1 → v1.1): árabe 69% → 93%, azerbaiyano 60% → 74%, occidental 75% → 91%, persa 88% → 98%, armenio 87% → 97%, georgiano 89% → 99%, griego 89% → 100%, ruso/ucraniano 90% → 95%, afgano 92% → 100%.

Documentos legales turcos sintéticos (nombres de persona / todos los valores, puntuación de dirección completa):

| Conjunto | Solo reglas | Reglas + Nano v1 | Reglas + Nano v1.1 | Falsos nombres añadidos por v1.1 |
|---|---|---|---|---|
| Ciego (80 docs, nombres nuevos) | 364/365 · 754/757 | 364/365 · 754/757 | 364/365 · 754/757 | 0 |
| Reservado (60 docs) | 263/275 · 605/618 | 268/275 · 610/618 | 271/275 · 613/618 | 0 |
| Ajuste (40 docs) | 159/165 · 425/431 | 159/165 · 425/431 | 163/165 · 429/431 | 1 |
| Prosa legal sin nombres | — | — | — | 0 |

El coste del cambio: en frases trampa llenas de palabras que también son nombres o lugares (Hakim, Emir, Nur, Rahim, Halep, Kabil, Erbil...), v1.1 añade unos 9 falsos nombres por cada 1.000 palabras, frente a 0,6 de v1.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo int8 ONNX ocupa 2,5 MB y se ejecuta en CPU o en el navegador.
- GPU recomendadas: no necesarias. Cualquier GPU moderna puede ejecutarlo, pero el diseño está orientado a CPU.
- Cabe en cualquier GPU de consumo, e incluso en dispositivos sin GPU dedicada; el entrenamiento se completó en 4 núcleos de CPU en 8 minutos.
- Opciones de despliegue: transformers.js (navegador), onnxruntime (Python, sin PyTorch), integración en la aplicación web de Katip Mask y en el conector Katip Kalkan.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Katip Mask Nano v1.1 | no disponible (2,5 MB int8) | 256 tokens | turco | NER de nombres de persona en texto legal | CC BY-SA 4.0 | ONNX en Hugging Face |
| Turkish Wiki NER (corpus base) | no aplica (dataset) | no disponible | turco | NER general | no disponible | Hugging Face Datasets |
| BERT turco estándar (p. ej. bert-base-turkish) | ~110 M (típico) | 512 tokens | turco | NER general | variable según modelo | Hugging Face |

No se dispone de datos de benchmarks comparativos directos con otros modelos NER turcos en la información proporcionada; la comparación se limita a características estructurales. El modelo de referencia más cercano en propósito es el propio pipeline de reglas de Katip, cuyos resultados se incluyen en la sección de benchmarks.

## Limitaciones y advertencias

- Solo detecta nombres de persona. Todo lo que tenga checksum o forma fija (T.C. kimlik, YKN, pasaporte, VKN, IBAN, tarjeta, teléfono, matrícula, correo) y las direcciones quedan delegados a las reglas de Katip.
- Entrenado para turco legal; no se ha probado con salida de OCR más allá de los escaneos y fotos de Katip, ni con texto no legal.
- No es una garantía de privacidad: siempre hay que revisar la salida redactada antes de enviarla.
- Los documentos legales de evaluación son sintéticos; la prosa judicial es real, pero sus nombres los rellena el autor. Los resultados de nombres extranjeros provienen del mismo corpus TurkishLegalNER cuyo split de entrenamiento se usó en el entrenamiento (el de test no). Los expedientes reales puntuarán peor.
- El aumento de falsos positivos en v1.1 (9,1 por 1.000 palabras en texto trampa frente a 0,6 en v1) exige revisión humana; el autor lo justifica porque un nombre no detectado constituye una brecha de la KVKK, mientras que un falso nombre solo cuesta un clic.
- Los nombres azerbaiyanos siguen siendo el punto débil (74% de detección) porque muchos se escriben con raíces léxicas turcas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a dar crédito a Katip y a los datos de entrenamiento y a compartir las adaptaciones bajo la misma licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f1k/katip-mask-nano
- Demo Katip Mask (Space): https://huggingface.co/spaces/f1k/katip-mask
- Repositorio fuente: https://github.com/fikrifirat/katip
- Conector Katip Kalkan para Claude: https://github.com/fikrifirat/katip/tree/main/connector
- Dataset de entrenamiento: https://huggingface.co/datasets/turkish-nlp-suite/turkish-wikiNER
