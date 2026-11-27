# f1k/katip-mask-mini

## Resumen

Katip Mask Mini es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de nombres de persona en textos jurídicos y administrativos en turco. Lo desarrolla f1k como parte de la familia Katip, una herramienta de anonimización de datos personales orientada a abogados y profesionales del derecho que necesitan cumplir con la KVKK (la ley turca de protección de datos, equivalente al RGPD). El modelo se distribuye como ONNX int8 de 31 MB y está pensado para ejecutarse íntegramente en el navegador o en la CPU de un portátil, sin que el documento salga nunca del equipo del usuario.

Arquitectónicamente es un destilado de DistilBERTurk: parte de `dbmdz/distilbert-base-turkish-cased`, conserva 3 de sus 6 capas (las capas 0, 2 y 5) y un vocabulario reducido de 12.000 piezas, y se entrena por destilación de conocimiento a partir de Katip Mask Base. La tarea es `token-classification` con etiquetas `O`, `B-PER` e `I-PER`, aplicadas por palabra sobre el primer sub-token de cada una.

Su relevancia actual radica en el equilibrio entre tamaño y calidad: ocupa una posición intermedia entre Katip Mask Nano (2,9 MB) y Katip Mask Base (111 MB), y ofrece un rendimiento cercano a Base en textos jurídicos reales con un coste de descarga y cómputo mucho menor, lo que lo hace viable en entornos de navegador donde 111 MB resultan prohibitivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de DistilBERTurk con 3 de 6 capas) |
| Parametros totales | 31 M (aproximado, según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens `[CLS] … [SEP]` |
| Tipos de cuantizacion | int8 ONNX (31,1 MB) |
| Idiomas soportados | Turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (transformers.js); repo de 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo DistilBERT derivado de `dbmdz/distilbert-base-turkish-cased`. Del modelo base se conservan únicamente 3 de las 6 capas (índices 0, 2 y 5) y se reduce el vocabulario a 12.000 piezas, lo que da lugar a un checkpoint de 31,1 MB en int8. El entrenamiento es por destilación de conocimiento desde Katip Mask Base, que actúa como profesor. Se probaron tres candidatos (L3-V12k, L3-V8k, L2-V12k) y el ganador se seleccionó exclusivamente con datos de desarrollo (Wiki NER dev F2 de 72,5 para L3-V12k frente a 69,2 y 66,5 de los otros dos); los conjuntos de test se evaluaron una sola vez tras la selección.

La innovación principal no está en la arquitectura sino en el pipeline de uso: las etiquetas se asignan por palabra en el primer sub-token, con una segmentación por regex definida en `config.json` (`katip.word_regex`, `[\p{L}\p{N}][\p{L}\p{N}'’.-]*`). El modelo se combina con un motor de reglas de Katip: `katip.json` fija un umbral de confianza de 0,5; por encima se respetan los bordes del span detectado y por debajo se recortan palabras turcas ordinarias de los extremos. El pipeline estándar de token-classification de Hugging Face segmenta de forma distinta y produce salidas ruidosas, por lo que se recomienda usar el código de referencia (`src/ner.js` para transformers.js y `connector/katip_kalkan/ner.py` para onnxruntime).

## Capacidades

- Detección de nombres de persona (`PER`) en texto turco, con etiquetado BIO a nivel de palabra.
- Integración con detección de PII basada en reglas para cubrir otras categorías (direcciones, números de identificación T.C., etc.).
- Ejecución en navegador mediante transformers.js y ONNX Runtime Web, sin envío de datos a servidores.
- Ejecución en CPU de portátil con onnxruntime en Python.
- Procesamiento por ventanas de hasta 256 tokens, apto para documentos largos troceados.
- Uso como componente de un pipeline de anonimización y pseudonimización (enmascarado de datos personales).
- Integración con el conector Katip Kalkan para Claude.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito; es un tagger puro de token-classification.
- Capacidad multilingüe limitada al turco; no se documenta soporte para otros idiomas.

## Casos de uso

- Anonimización de expedientes judiciales: el modelo detecta nombres de personas en sentencias y escritos del Yargıtay con una tasa de acierto del 99,2% y precisión del 98,7% en prosa jurídica real, lo que permite publicar resoluciones sin exponer datos personales.
- Redacción de documentos legales en el navegador: al ejecutarse en ONNX int8 de 31 MB, puede integrarse en una aplicación web que enmascare nombres antes de que el documento abandone el equipo del abogado, cumpliendo el principio de minimización de datos de la KVKK.
- Cumplimiento del RGPD/KVKK en bufetes: uso como capa de preprocesado en flujos internos que deban pseudonimizar textos antes de enviarlos a herramientas de terceros o a modelos en la nube.
- Procesamiento de formularios escaneados: combinado con OCR (Katip Otomatik), el modelo participa en la detección de PII en fotografías de formularios rellenados; en el track de fotos de KVKK-Bench no se filtró ningún nombre ni número de identidad T.C. (0 de 120 en cada categoría).
- Preprocesado para entrenamiento de modelos: permite eliminar nombres de personas de corpus jurídicos turcos antes de usarlos en fine-tuning, reduciendo el riesgo de memorización de datos personales.
- Despliegue en entornos con recursos limitados: con 5 páginas por segundo en CPU de portátil (500 palabras por página), es adecuado para estaciones de trabajo sin GPU o para aplicaciones de escritorio.
- Filtrado en pipelines de datos a gran escala: su velocidad (5 páginas/s frente a 1,7 de Base) y su tamaño permiten procesar lotes de documentos en máquinas modestas donde Base sería demasiado lento o pesado.

## Benchmarks y rendimiento

Resultados de KVKK-Bench v0.1.2 (re-puntuados con las reglas del 19 de noviembre de 2026). Cada fila ejecuta las reglas de Katip más el modelo con el mismo código de detección que el navegador. La velocidad se mide en Python sobre CPU de portátil Apple M-series, con páginas de 500 palabras.

| Metrica | Nano v1.1 | **Mini v2** | Base v2 |
|---|---|---|---|
| Descarga (int8 ONNX) | 2,9 MB | **31 MB** | 111 MB |
| KVKK-F2, todas las pistas | 80,8 | **89,0** | 93,2 |
| Fuga (caracteres de datos personales aún legibles) | 7,0% | **4,3%** | 3,1% |
| Nombres turcos en prosa real del Yargıtay: encontrados / precisión | 94,1% / 95,8% | **99,2% / 98,7%** | 99,9% / 100% |
| Nombres extranjeros, mismas frases: encontrados / precisión | 95,5% / 95,6% | **96,8% / 98,5%** | 97,0% / 100% |
| Nombres en prosa cotidiana (test Wiki NER): encontrados / precisión | 53,7% / 62,2% | **72,3% / 79,1%** | 84,1% / 88,4% |
| Páginas por segundo, CPU de portátil | 32 | **5** | 1,7 |

En el leaderboard de KVKK-Bench, Mini obtiene 93,0 en la columna *Overall* (puesto 7 de 21) y un 11,6% en *Leaked*, frente a 96,1 de Base (puesto 1) y 85,9 de Nano.

Evaluación en conjuntos de test de otros equipos (mitades reservadas de cuatro conjuntos públicos de PII en turco, todos sintéticos), F2 de Mini:

| Conjunto | Mini | NewMind kvkk-v2 (1,1 GB) |
|---|---|---|
| nm-kvkk-pii-6K (NewMind) | 93,4 | 93,9 |
| piimask TR | 95,7 | 93,8 |
| Conjunto de Çağrı Güngör | 93,0 | 72,6 |
| Conjunto de Werea | 93,6 | 54,3 |

Mini empata con NewMind en nm6k (IC 95% −1,9 a +1,0) y en piimask (−0,2 a +4,3), y supera significativamente a NewMind en el conjunto de Çağrı. El resultado de Werea no es independiente porque las mitades comparten plantillas. Base obtiene 95,9, 95,9, 95,2 y 95,8 en esos mismos conjuntos.

Documentos legales sintéticos: en el conjunto ciego (80 documentos, nombres nunca vistos en entrenamiento), Mini encontró 364 de 365 nombres y añadió 0 falsos; también añadió 0 nombres falsos en documentos negativos sin nombres. En el conjunto reservado (60 documentos) encontró el 99,6% de los nombres.

Fotografías de móvil (track de fotos de KVKK-Bench: 60 fotos sintéticas de formularios rellenados, OCR de Katip Otomatik): 5,8% de datos personales filtrados (frente a 5,0% de Base y 5,4% de Nano), 0 nombres y 0 números T.C. filtrados (de 120 cada uno), direcciones filtradas 28 de 120 y 0,8 máscaras falsas por página.

Puntuaciones de desarrollo de los candidatos:

| Candidato | Capas conservadas | Vocabulario | int8 | Wiki NER dev F2 |
|---|---|---|---|---|
| **L3-V12k (este modelo)** | 0, 2, 5 | 12.000 | 31,1 MB | **72,5** |
| L3-V8k | 0, 2, 5 | 8.000 | 28,0 MB | 69,2 |
| L2-V12k | 0, 5 | 12.000 | 23,9 MB | 66,5 |

En el test de Wiki NER, el modelo solo (sin reglas) encontró el 71,4% de los nombres [67,5–75,1] con una precisión del 80,1% [76,3–83,6]; los corchetes son IC 95% obtenidos por bootstrap a nivel de documento.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo int8 de 31,1 MB cabe holgadamente en memoria de CPU y en memoria de navegador.
- GPU recomendadas: no aplica; el diseño está orientado a CPU. Cualquier GPU moderna puede ejecutarlo, pero no es el objetivo.
- Cabe en cualquier GPU de consumo y en CPU de portátil; también en pestañas de navegador mediante transformers.js y ONNX Runtime Web.
- Opciones de despliegue: transformers.js (navegador), onnxruntime (Python, vía `connector/katip_kalkan/ner.py`), y el pipeline de Hugging Face con las precauciones de segmentación indicadas (se recomienda el código de referencia en lugar del pipeline estándar).
- Latencia y throughput: 5 páginas por segundo en CPU de portátil Apple M-series (página de 500 palabras), frente a 32 de Nano y 1,7 de Base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KVKK-F2 (todas las pistas) | Fuga | Licencia | Tamaño int8 |
|---|---|---|---|---|---|---|
| **Katip Mask Mini v2** | 31 M | 256 tokens | 89,0 | 4,3% | CC BY-SA 4.0 | 31 MB |
| Katip Mask Nano v1.1 | no disponible (2,9 MB int8) | 256 tokens | 80,8 | 7,0% | CC BY-SA 4.0 (según familia) | 2,9 MB |
| Katip Mask Base v2 | no disponible (111 MB int8) | 256 tokens | 93,2 | 3,1% | CC BY-SA 4.0 (según familia) | 111 MB |
| NewMind kvkk-v2 | no disponible | no disponible | no disponible en KVKK-Bench | no disponible | no disponible | 1,1 GB |

La comparación directa con NewMind kvkk-v2 en los conjuntos externos muestra que Mini, con 31 MB, empata en dos conjuntos y supera ampliamente en los otros dos a un modelo de 1,1 GB. Frente a sus hermanos de familia, Mini ofrece el mejor equilibrio tamaño/calidad: Base es más preciso en prosa cotidiana (84,1% frente a 72,3%) pero pesa 3,6 veces más y es casi 3 veces más lento.

## Limitaciones y advertencias

- Solo detecta nombres de persona (`PER`); el resto de categorías de PII dependen del motor de reglas de Katip, no del modelo.
- En prosa cotidiana (no jurídica) el recall cae al 72,3% con precisión del 79,1%, muy por debajo de Base (84,1%/88,4%); no es adecuado como detector universal de nombres en textos generales.
- En fotografías de formularios, las direcciones se filtran deficientemente: 28 de 120 direcciones quedaron expuestas en el track de fotos.
- El pipeline estándar de token-classification de Hugging Face produce salidas ruidosas por diferencias de segmentación; es imprescindible usar la regex de `config.json` y leer los logits en el primer sub-token de cada palabra.
- El umbral de confianza (`trust` 0,5) y las reglas de recorte de bordes están calibrados para turco; su comportamiento fuera de ese idioma no está documentado.
- El modelo está entrenado únicamente en turco; no se ha evaluado su rendimiento en otros idiomas.
- Riesgo de alucinación de spans: aunque en el conjunto ciego añadió 0 nombres falsos, en el track de fotos se observaron 0,8 máscaras falsas por página.
- La licencia CC BY-SA 4.0 impone compartir bajo la misma licencia las obras derivadas y exige atribución; conviene revisar las implicaciones para uso comercial en productos propietarios.
- Los conjuntos de evaluación externos son sintéticos y algunos comparten plantillas (caso de Werea), por lo que los resultados pueden no generalizar a documentos reales diversos.
- El contexto efectivo es de 256 tokens por ventana; documentos largos requieren troceado y gestión de solapamientos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f1k/katip-mask-mini
- Modelo base: https://huggingface.co/dbmdz/distilbert-base-turkish-cased
- Katip Mask Nano: https://huggingface.co/f1k/katip-mask-nano
- Katip Mask Base: https://huggingface.co/f1k/katip-mask-base
- Demo de anonimización Katip Mask: https://huggingface.co/spaces/f1k/katip-kvkk-anonymization
- Leaderboard KVKK-Bench: https://huggingface.co/spaces/f1k/kvkk-bench
- Conector Katip Kalkan para Claude: https://github.com/fikrifirat/katip/tree/main/connector
- Resultados externos (RESULTS.md): https://github.com/fikrifirat/katip/blob/legal-study/lab/legal/external/RESULTS.md
- Dataset de entrenamiento: https://huggingface.co/datasets/turkish-nlp-suite/turkish-wikiNER
