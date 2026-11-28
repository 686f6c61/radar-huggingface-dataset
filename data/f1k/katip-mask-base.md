# f1k/katip-mask-base

## Resumen

Katip Mask Base · tr v2 es un modelo de etiquetado de tokens (token classification) especializado en la detección de datos personales en documentos legales turcos. Lo desarrolla el autor independiente f1k como componente central del proyecto Katip Mask, una herramienta de anonimización que se ejecuta en el dispositivo. El modelo parte de BERTurk (`dbmdz/bert-base-turkish-cased`) y se ha ajustado fino para identificar nombres y apellidos de personas, direcciones y terminos de salud contemplados en el articulo 6 de la KVKK (la ley turca de proteccion de datos personales), equivalente funcional al RGPD europeo.

La relevancia del modelo radica en su enfoque: frente a alternativas basadas en LLM generativos o en modelos multilingues de gran tamano, Katip Mask Base apuesta por un encoder BERT de 110 millones de parametros exportado a ONNX (fp32 e int8) para transformers.js, lo que permite ejecutar la anonimizacion directamente en el navegador o en dispositivos sin GPU. Segun la model card, alcanza un 96,1 de puntuacion global en KVKK-Bench v0.1.2, por delante de XLM-RoBERTa Large NER (95,9) con una veinteava parte de su tamano en disco (111,1 MB frente a 2.235,4 MB).

La version v2 (13 de noviembre de 2026) incorpora 17.967 frases reales en turco procedentes de Turkish Wiki NER, lo que eleva la deteccion de nombres en texto real del 41 % (v1) al 90 %. El modelo esta pensado para integrarse en flujos de redaccion legal, cumplimiento normativo y desidentificacion de expedientes judiciales en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), basado en `dbmdz/bert-base-turkish-cased` |
| Parametros totales | 110.032.135 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERTurk, tipicamente 512 tokens) |
| Tipos de cuantizacion | ONNX fp32 e int8 |
| Idiomas soportados | Turco (tr) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |
| Libreria | transformers.js |
| Pipeline | token-classification |
| Tamano del repositorio | 2,0 GB |
| Dataset de ajuste | turkish-nlp-suite/turkish-wikiNER (nombres de persona) |
| Descargas | 181 |
| Fecha de creacion | 2026-11-11 |

## Arquitectura y entrenamiento

El modelo es un BERT encoder de 110 millones de parametros derivado de BERTurk en su variante cased, ajustado fino para etiquetado de tokens (NER). La tarea concreta es la identificacion de tres categorias: nombres y apellidos de personas, direcciones y terminos de salud del articulo 6 de la KVKK. Segun la model card, el ajuste combina documentos legales sinteticos con 17.967 frases reales en turco procedentes de Turkish Wiki NER (solo nombres de persona), incorporadas en la version v2 para corregir el sesgo hacia plantillas sinteticas que presentaba la v1.

La innovacion tecnica principal no esta en la arquitectura sino en el pipeline de despliegue: el modelo se exporta a ONNX en fp32 e int8 para ejecutarse con transformers.js en el navegador, lo que permite anonimizacion local sin enviar documentos a un servidor. El sistema completo Katip combina este modelo con reglas deterministas (numeros de identificacion T.C., numeros fiscales, IBAN, direcciones) y un umbral de confianza de 0,5 para conservar los bordes de las entidades detectadas. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset sintetico ni si se emplearon tecnicas de RLHF o DPO (no aplicables habitualmente a NER).

## Capacidades

- Deteccion de nombres y apellidos de personas en texto legal turco, incluyendo nombres turcos y extranjeros.
- Deteccion de direcciones postales.
- Deteccion de terminos de salud contemplados en el articulo 6 de la KVKK (datos sensibles).
- Etiquetado de tokens (token classification) con salida BIO para integracion en pipelines de redaccion.
- Ejecucion en el dispositivo via ONNX y transformers.js, sin dependencia de servidor.
- Cuantizacion int8 para despliegue ligero (111,1 MB en disco).
- Capacidad multilingue limitada: solo turco como idioma soportado.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, audio, tool calling ni agentes; es un modelo exclusivamente discriminativo de NER.

## Casos de uso

- Anonimizacion de expedientes judiciales: el modelo detecta nombres de partes, testigos y profesionales en resoluciones del Yargitay (Tribunal Supremo turco) para su publicacion con datos personales suprimidos. La model card reporta 99,9 de F2 en nombres turcos de corte y 97,6 en nombres extranjeros.
- Cumplimiento de la KVKK en despachos de abogados: redaccion automatica de nombres, direcciones y datos de salud en escritos y contratos antes de compartirlos con terceros o archivarlos, con ejecucion local que evita la salida de datos del despacho.
- Desidentificacion de formularios y peticiones: el benchmark Forms cubre numeros de identidad T.C., numeros fiscales, IBAN y direcciones sobre 306 peticiones y formularios colegiales sinteticos, con 99,4 de puntuacion.
- Preprocesamiento de corpus para investigacion en PLN juridico: eliminacion de datos personales de conjuntos de sentencias antes de su publicacion o uso en entrenamiento de otros modelos.
- Integracion en navegador para editores legales: gracias a la exportacion ONNX y transformers.js, puede incrustarse en una interfaz web que resalte y enmascare entidades en tiempo real mientras el usuario redacta.
- Filtrado de datos en pipelines de ingestion documental: como paso previo a un RAG o a un sistema de gestion documental, para impedir que datos personales lleguen a indices o almacenes no autorizados.
- Auditoria de privacidad en conjuntos de datos: deteccion masiva de PII en repositorios de textos turcos para evaluar el riesgo de reidentificacion.

## Benchmarks y rendimiento

Resultados en KVKK-Bench v0.1.2 (puntuacion sobre 100, mayor es mejor). La columna Overall es la F2 ponderada para deteccion de nombres en texto real; Forms cubre identificadores y direcciones en formularios sinteticos y no forma parte de Overall.

| Sistema | Overall | Nombres turcos (corte) | Nombres extranjeros (corte) | Texto cotidiano | Forms | Tamano (MB) |
|---|---|---|---|---|---|---|
| Katip Mask Base · tr v2 | 96,1 | 99,9 | 97,6 | 84,9 | 99,4 | 111,1 |
| XLM-RoBERTa Large NER | 95,9 | 97,6 | 97,5 | 89,9 | 41,6 | 2.235,4 |
| XLM-RoBERTa Base Turkish NER | 95,7 | 98,5 | 98,2 | 86,3 | – | 1.109,8 |
| Katip rules + GLiNER2 · tr fine-tuned | 95,5 | 98,7 | 97,3 | 86,0 | 98,2 | 1.228,7 |
| GLiNER2 PII Multi | 95,0 | 98,1 | 98,2 | 83,9 | 43,2 | 1.228,4 |
| PII Redactor Base | 94,0 | 97,8 | 99,1 | 79,5 | 63,8 | 1.230,3 |
| Katip Mask Mini · tr v2 | 93,0 | 99,1 | 97,2 | 73,6 | 98,6 | 31,4 |
| BERTurk NER | 91,6 | 97,4 | 91,7 | 77,1 | 38,3 | 440,1 |
| GLiNER Multi PII v1 | 91,3 | 93,1 | 92,9 | 85,2 | – | 1.155,8 |
| GLiNER2.5 KVKK TR v2 | 88,1 | 90,1 | 90,3 | 80,8 | 92,3 | 1.149,4 |
| Katip Mask Nano · tr v1.1 | 85,9 | 94,4 | 95,5 | 55,2 | 97,7 | 2,9 |
| ModernBERT-TR PII NER | 85,3 | 99,0 | 96,9 | 39,4 | – | 597,5 |
| Qwen2.5 1.5B Instruct (zero-shot) | 57,5 | 59,1 | 57,6 | 53,7 | – | 3.087 |
| Privacy Filter Multilingual v2 | 57,2 | 59,8 | 57,4 | 50,7 | – | 2.799,2 |
| GLiNER2.5 Mürşit KVKK TR v1 | 53,3 | 60,8 | 46,7 | 41,1 | 88,5 | 661,9 |
| Privacy Filter (OpenAI) | 51,3 | 58,0 | 58,0 | 27,9 | – | 2.799 |
| Hushmark TR 289M | 50,4 | 50,9 | 48,8 | 50,8 | 51,8 | 1.155,8 |
| Piiranha v1 | 49,8 | 41,4 | 61,5 | 59,4 | – | 1.112,9 |
| Presidio | 45,0 | 39,3 | 44,0 | 60,4 | 36,1 | 11 |
| Werea KVKK PII 150M | 24,9 | 31,0 | 7,3 | 27,2 | 19,7 | 597,4 |
| OpenMed PII Turkish Small | 19,1 | 11,8 | 18,8 | 37,5 | – | 133 |

En conjuntos de prueba publicos de otros equipos, Katip Mask Base obtiene F2 de 95,9 en nm-kvkk-pii-6K de NewMind, 95,9 en piimask TR, 95,2 en el conjunto de Çağrı Güngör y 95,8 en el de Werea, frente a 93,9, 93,8, 72,6 y 54,3 de NewMind kvkk-v2. La ventaja es significativa en nm6k, piimask y Çağrı (bootstrap emparejado al 95 %); en documentos piimask con plantillas no vistas ambos empatan (96,5), y el resultado de Werea no es independiente porque sus mitades comparten plantillas. NewMind mantiene mayor precision en nm6k (99,7 frente a 91,2) y piimask (93,2 frente a 89,8). Katip deja menos datos personales legibles en Çağrı (6,8 % frente a 41,1 %) y Werea (26,3 % frente a 65,2 %).

Resultados dentro del sistema Katip (reglas + modelo, tal como se ejecuta la demo):

| Conjunto | v2 | v1 |
|---|---|---|
| Ciego (80 documentos sinteticos, 757 valores) | 757/757, nombres 365/365 | 757/757 |
| Retenido (60 documentos sinteticos, 618 valores) | 618/618 | 618/618 |
| Prosa legal sin nombres | 3 falsas alarmas | 3 |
| Prosa real del Yargitay con nombres reanonimizados | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (110 millones de parametros); aproximadamente 110 MB en int8.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (GTX 1060 o superior, RTX 3060, RTX 4090) acelera la inferencia, pero no es necesaria.
- Cabe en cualquier GPU consumer y en CPU de portatil; el modelo int8 de 111,1 MB cabe incluso en dispositivos moviles y navegadores.
- Opciones de despliegue: transformers.js (objetivo principal, via ONNX), ONNX Runtime, y potencialmente vLLM o TGI no aplican por ser un encoder de clasificacion; llama.cpp y Ollama no estan soportados por el formato BERT clasico.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall KVKK-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Katip Mask Base · tr v2 | 110 M | no disponible | 96,1 | CC-BY-SA-4.0 | Hugging Face, ONNX, transformers.js |
| XLM-RoBERTa Large NER | ~560 M | 512 | 95,9 | MIT (modelo base) | Hugging Face |
| GLiNER2 PII Multi | no disponible | no disponible | 95,0 | no disponible | Hugging Face |
| BERTurk NER | ~110 M | 512 | 91,6 | no disponible | Hugging Face |
| Katip Mask Mini · tr v2 | no disponible | no disponible | 93,0 | no disponible | Hugging Face |
| Presidio | basado en reglas + spaCy | no aplica | 45,0 | MIT | GitHub |

La ventaja competitiva de Katip Mask Base es la combinacion de precision alta (96,1 global, 99,4 en formularios) con un tamano de 111,1 MB y ejecucion en navegador. Frente a XLM-RoBERTa Large NER, ofrece puntuacion global ligeramente superior con una veinteava parte del tamano y mejor cobertura de formularios (99,4 frente a 41,6). Frente a Presidio, la mejora es sustancial en texto turco (96,1 frente a 45,0).

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entreno sobre documentos legales sinteticos y frases de Wikipedia; puede tener sesgo hacia plantillas y estilos de redaccion juridica turca. La v2 corrigio parcialmente el sesgo hacia plantillas sinteticas, pero la propia model card reconoce que en documentos con plantillas no vistas empata con NewMind kvkk-v2.
- Riesgo de alucinacion en sentido estricto no aplica (es un modelo discriminativo), pero si existe riesgo de falsos negativos (datos personales no detectados) y falsos positivos (entidades mal etiquetadas). La model card reporta 3 falsas alarmas en prosa legal sin nombres.
- Limitacion de contexto: heredada de BERTurk, tipicamente 512 tokens; documentos mas largos requieren fragmentacion previa. Este dato no se explicita en la model card.
- Limitacion de idioma: solo turco. No debe usarse con textos en otros idiomas sin validacion previa.
- Precision inferior a NewMind kvkk-v2 en nm6k (91,2 frente a 99,7) y piimask (89,8 frente a 93,2), lo que implica mas falsos positivos en esos conjuntos.
- Restricciones de licencia: CC-BY-SA-4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas; puede ser incompatible con uso comercial propietario sin consulta legal.
- El benchmark KVKK-Bench y varios conjuntos de prueba son sinteticos o comparten plantillas (caso de Werea), por lo que los resultados pueden no generalizar a documentos reales fuera de dominio.
- El modelo forma parte de un sistema (Katip) que combina reglas y modelo; los resultados reportados en la demo incluyen esas reglas y no son atribuibles solo al modelo.
- Solo 181 descargas y 0 likes en el momento de la consulta: ecosistema pequeno, poca validacion externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f1k/katip-mask-base
- Demo Katip Mask (espacio): https://huggingface.co/spaces/f1k/katip-kvkk-anonymization
- Benchmark KVKK-Bench (espacio): https://huggingface.co/spaces/f1k/kvkk-bench
- Repositorio Katip en GitHub: https://github.com/fikrifirat/katip
- Resultados externos (RESULTS.md): https://github.com/fikrifirat/katip/blob/legal-study/lab/legal/external/RESULTS.md
- Receta GLiNER2 + Katip: https://github.com/fikrifirat/katip/blob/legal-study/lab/colab/gliner2_katip_recipe.ipynb
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset Turkish Wiki NER: https://huggingface.co/datasets/turkish-nlp-suite/turkish-wikiNER
- Modelo hermano Katip Mask Mini: https://huggingface.co/f1k/katip-mask-mini
- Modelo hermano Katip Mask Nano: https://huggingface.co/f1k/katip-mask-nano
