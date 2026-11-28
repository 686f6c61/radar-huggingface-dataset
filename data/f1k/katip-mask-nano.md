# f1k/katip-mask-nano

## Resumen

Katip Mask Nano es un modelo de reconocimiento de entidades nombradas (NER) especializado en la deteccion de nombres de persona en textos turcos, con un enfoque claro en el cumplimiento de la KVKK (ley turca de proteccion de datos personales) y el RGPD. Lo desarrolla f1k y forma parte del ecosistema Katip, una herramienta de anonimizacion y enmascaramiento de datos personales pensada para abogados y entornos juridicos. El modelo se distribuye como un ONNX int8 de aproximadamente 2,5 MB, lo que permite ejecutarlo en el navegador o en la CPU de un portatil sin enviar el documento a servidores externos.

Arquitectura y tamano: se trata de un modelo tipo BERT de tipo "nano", exportado a ONNX y consumible mediante transformers.js. La etiquetacion es de tipo token-classification con las etiquetas `O`, `B-PER` e `I-PER`, y esta disenado para combinarse con un motor de reglas (v0.2, 14 de noviembre de 2026) que detecta otras categorias de PII. La version 1.1, publicada el 13 de noviembre de 2026, incorpora nombres de clientes extranjeros tal y como aparecen en documentos turcos (sirios, iranies, afganos, georgianos, armenios, griegos, arabes, rusos/ucranianos, azerbaiyanos y occidentales), con transliteraciones inconsistentes.

Su relevancia actual radica en que es el modelo por defecto del conector Katip Kalkan para Claude y el modo rapido de la herramienta Katip Mask. No es el modelo mas preciso de la familia: en KVKK-Bench obtiene 85.9 Overall (puesto 11 de 21), frente a Katip Mask Base (96.1, puesto 1) y Katip Mask Mini (93.0, puesto 7). Su ventaja es el coste computacional minimo y la privacidad por diseno: el documento nunca sale del equipo del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT tipo "nano" (transformer encoder), exportado a ONNX |
| Parametros totales | no disponible (peso del artefacto: ~2,5 MB en int8 ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de hasta 256 tokens (`[CLS] … [SEP]`) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | turco (tr) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT de tamano reducido ("nano"), orientado a token-classification con tres etiquetas (`O`, `B-PER`, `I-PER`). La innovacion principal no esta en la arquitectura sino en la estrategia de etiquetado: las etiquetas se entrenan **por palabra sobre el primer sub-token de cada palabra**, y las palabras se segmentan con la expresion regular definida en `config.json` → `katip.word_regex` (`[\p{L}\p{N}][\p{L}\p{N}'’.-]*`). Las palabras se alimentan en orden dentro de ventanas `[CLS] … [SEP]` de como maximo 256 tokens y se leen los logits en el primer sub-token de cada palabra. El pipeline estandar de token-classification de Hugging Face segmenta de forma distinta y produce salidas ruidosas, por lo que se recomienda usar el codigo de referencia del autor.

El entrenamiento se realizo sobre el dataset `turkish-nlp-suite/turkish-wikiNER`, complementado en la version 1.1 con nombres extranjeros tal y como aparecen en documentos turcos. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. El modelo esta pensado para funcionar en combinacion con reglas: los spans del modelo con probabilidad media ≥ 0.5 se conservan; por debajo del umbral `trust` se recortan palabras turcas ordinarias de los bordes; los spans de regla PERSON solapados se amplian a la union; y en caso contrario se anade el span si tiene dos o mas palabras capitalizadas, o una palabra capitalizada que no sea ordinaria (o lleve sufijo de caso de nombre propio, como en *Topçu'nun*), o una ya detectada como nombre en el mismo documento.

## Capacidades

- Deteccion de nombres de persona (PII) en texto turco, con etiquetas `B-PER` e `I-PER`.
- Reconocimiento de nombres extranjeros transliterados en documentos turcos (arabes, persas, afganos, georgianos, armenios, griegos, rusos/ucranianos, azerbaiyanos y occidentales).
- Ejecucion en navegador y en CPU de portatil mediante transformers.js y ONNX int8.
- Integracion con el motor de reglas de Katip para deteccion combinada de PII (el modelo cubre nombres; las reglas cubren otras categorias).
- Modo rapido por defecto de la herramienta Katip Mask y del conector Katip Kalkan para Claude.
- Soporte de anonimizacion y pseudonimizacion en flujos de cumplimiento KVKK/RGPD.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo "thinking"; es exclusivamente un etiquetador de tokens.

## Casos de uso

- **Anonimizacion de expedientes judiciales**: el modelo detecta nombres de persona en sentencias del Yargitay y textos legales turcos; con 94.6% de acierto en nombres extranjeros y 98.7% en nombres turcos (combinado con reglas), es adecuado para preprocesar documentos antes de compartirlos con terceros.
- **Cumplimiento KVKK en despachos de abogados**: al ejecutarse en local (navegador o CPU), el documento no sale del equipo del usuario, lo que facilita el cumplimiento del principio de minimizacion de datos y evita transferencias a terceros.
- **Enmascaramiento previo a la revision humana**: Katip muestra cada valor enmascarado con una casilla de verificacion; el modelo actua como primera pasada y el abogado revisa y corrige, con un coste de un clic por falso positivo.
- **Integracion en el conector Katip Kalkan para Claude**: es el modelo por defecto del conector, de modo que las conversaciones con Claude sobre documentos legales turcos pueden redactarse antes de enviarse al modelo de lenguaje.
- **Procesamiento por lotes en portatiles sin GPU**: con 2,5 MB en int8, se puede ejecutar en la CPU de un portatil para procesar lotes de documentos sin infraestructura dedicada.
- **Preprocesamiento en pipelines de e-discovery legal**: deteccion de nombres en corpus de documentos turcos para clasificacion, indexacion o pseudonimizacion antes de analisis posteriores.
- **Filtrado de PII en formularios y registros**: integrable via transformers.js en aplicaciones web que reciben texto libre en turco y necesitan redactar nombres antes de almacenarlos.

## Benchmarks y rendimiento

Resultados publicados en la model card (KVKK-Bench y conjuntos externos). Las cifras de "Rules + Nano" combinan el motor de reglas v0.2 con el modelo.

**KVKK-Bench (Overall, 21 modelos):**

| Modelo | Overall | Puesto |
|---|---|---|
| Katip Mask Base | 96.1 | 1 |
| Katip Mask Mini | 93.0 | 7 |
| Katip Mask Nano | 85.9 | 11 |

**Nombres extranjeros en prosa judicial real (TurkishLegalNER test, Yargitay, 1.011 nombres):**

| Configuracion | Nombres extranjeros | Nombres turcos | Precision | Falsos nombres por 1.000 palabras |
|---|---|---|---|---|
| Rules | 77.1% [73.9–80.1] | 93.0% | 99.9% | 0.6 |
| Rules + Nano v1 | 80.3% [77.0–83.3] | 97.4% | 99.6% | 0.6 |
| Rules + Nano v1.1 | 94.6% [92.5–96.2] | 98.7% | 97.4% | 9.1 |

**Por origen (v1 → v1.1):** arabes 69% → 93%, azerbaiyanos 60% → 74%, occidentales 75% → 91%, persas 88% → 98%, armenios 87% → 97%, georgianos 89% → 99%, griegos 89% → 100%, rusos/ucranianos 90% → 95%, afganos 92% → 100%.

**Documentos legales turcos sinteticos (nombres de persona / todos los valores):**

| Conjunto | Rules | Rules + Nano v1 | Rules + Nano v1.1 | Falsos nombres anadidos por v1.1 |
|---|---|---|---|---|
| Blind (80 docs, nombres nuevos) | 364/365 · 754/757 | 364/365 · 754/757 | 364/365 · 754/757 | 0 |
| Held-out (60 docs) | 263/275 · 605/618 | 268/275 · 610/618 | 271/275 · 613/618 | 0 |
| Tuning (40 docs) | 159/165 · 425/431 | 159/165 · 425/431 | 163/165 · 429/431 | 1 |
| Prosa legal sin nombres | — | — | — | 0 |

**Conjuntos externos de PII turca (F2 sobre mitades reservadas, todos sinteticos):**

| Conjunto | Nano | NewMind kvkk-v2 (1,1 GB) |
|---|---|---|
| nm-kvkk-pii-6K (NewMind) | 89.6 | 93.9 |
| piimask TR | 95.1 | 93.8 |
| Conjunto de Çağrı Güngör | 90.7 | 72.6 |
| Conjunto de Werea | 90.7 | 54.3 |

En nm6k la diferencia es significativa (IC 95% −6,6 a −2,2); en piimask hay empate (−0,8 a +3,7); en Çağrı Nano va por delante. El resultado de Werea no es independiente porque las mitades comparten plantillas. Base obtiene 95.9, 95.9, 95.2 y 95.8 respectivamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el artefacto int8 ONNX ocupa ~2,5 MB y se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU de consumo (RTX 4090, etc.) y en CPU de portatil; el cuello de botella es la segmentacion por palabras, no el computo.
- Opciones de despliegue: transformers.js (navegador), ONNX Runtime, integracion en la herramienta Katip Mask y en el conector Katip Kalkan.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KVKK-Bench Overall | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Katip Mask Nano | ~2,5 MB (int8 ONNX) | 256 tokens | 85.9 (#11) | cc-by-sa-4.0 | Hugging Face |
| Katip Mask Mini | no disponible | no disponible | 93.0 (#7) | no disponible | Hugging Face |
| Katip Mask Base | no disponible | no disponible | 96.1 (#1) | no disponible | Hugging Face |
| NewMind kvkk-v2 | 1,1 GB | no disponible | F2 93.9 en nm6k | no disponible | Hugging Face |

## Limitaciones y advertencias

- **No es el modelo mas preciso de la familia**: en KVKK-Bench queda en 85.9, frente a 96.1 de Base y 93.0 de Mini; la mayor diferencia se da en nombres en prosa cotidiana (55.2 en Nano frente a 84.9 en Base).
- **Falsos positivos en v1.1**: en frases trampa con palabras que tambien son nombres o lugares (Hakim, Emir, Nur, Rahim, Halep, Kabil, Erbil...) anade ~9 falsos nombres por 1.000 palabras, frente a 0.6 en v1. Cada falso positivo cuesta un clic de revision; un nombre no detectado es una brecha de KVKK.
- **Nombres azerbaiyanos**: siguen siendo el punto debil (74% en v1.1), porque muchos se escriben con raices de palabras turcas.
- **Datos de evaluacion sinteticos**: los documentos legales usados en la evaluacion son sinteticos; la prosa judicial es real pero los nombres se rellenan de forma artificial. Los expedientes reales obtendran puntuaciones inferiores.
- **Riesgo de sobreajuste al corpus**: las puntuaciones de nombres extranjeros provienen del mismo corpus TurkishLegalNER cuyo split de *train* se uso en entrenamiento (el split de *test* no).
- **Segmentacion no estandar**: el pipeline estandar de token-classification de Hugging Face segmenta de forma distinta y produce salidas ruidosas; es obligatorio usar la regex `katip.word_regex` y leer los logits en el primer sub-token de cada palabra.
- **Solo turco y solo nombres**: el modelo no cubre otras categorias de PII (direcciones, telefonos, identificadores) por si solo; depende del motor de reglas de Katip para el resto.
- **Licencia cc-by-sa-4.0**: permite uso comercial pero exige compartir las obras derivadas bajo la misma licencia y atribucion; revisar compatibilidad antes de integrarlo en productos propietarios.
- **Sesgos**: no se documentan sesgos especificos mas alla de la cobertura desigual por origen nacional de los nombres.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f1k/katip-mask-nano
- Modelo Katip Mask Base: https://huggingface.co/f1k/katip-mask-base
- Modelo Katip Mask Mini: https://huggingface.co/f1k/katip-mask-mini
- Demo Katip Mask (KVKK anonymization): https://huggingface.co/spaces/f1k/katip-kvkk-anonymization
- Benchmark KVKK-Bench: https://huggingface.co/spaces/f1k/kvkk-bench
- Conector Katip Kalkan para Claude: https://github.com/fikrifirat/katip/tree/main/connector
- Resultados externos (RESULTS.md): https://github.com/fikrifirat/katip/blob/legal-study/lab/legal/external/RESULTS.md
- Dataset de entrenamiento: https://huggingface.co/datasets/turkish-nlp-suite/turkish-wikiNER
