# olaverse/MIST-Extract-Flash-1.0

## Resumen

MIST-Extract-Flash-1.0 es un modelo de extracción de información estructurada desarrollado por olaverse, un fine-tune completo de Qwen/Qwen3.5-2B-Base con el codificador visual congelado. Su función es convertir un documento (texto, fotografía o escaneo) en un JSON que respeta una plantilla proporcionada por el usuario, devolviendo además una puntuación de confianza calibrada para cada campo extraído. Está orientado específicamente a documentos de empresas y particulares africanos, en inglés y en más de 20 lenguas africanas, un nicho escasamente cubierto por los extractores generalistas.

Con 2.213.241.664 parámetros y una ventana de contexto heredada de 262.144 tokens (servida a 131.072), el modelo compite en la categoría de extractores pequeños y rápidos: según el autor, alcanza 9,7 documentos por segundo en una RTX A6000 bajo vLLM y obtiene un 90,5% de documentos completamente correctos en un conjunto de 486 documentos ingleses retenidos, frente al 67,9% de NuExtract3 (4B) y el 34,0% de Qwen3.5-4B. En extracción de entidades nombradas sobre 21 lenguas africanas (MasakhaNER 2.0) reporta 0,701 de precisión por campo, muy por encima de NuExtract3 (0,393), Qwen3.5-4B (0,432) y GLiNER2.5-multi (0,452).

Es relevante ahora porque propone un enfoque "OCR-free" con confianza por campo, lo que permite enrutar automáticamente los valores seguros y derivar a revisión humana solo los inciertos, y porque reutiliza el formato de plantilla de NuExtract, facilitando la migración entre ambos. La licencia Apache-2.0 y su tamaño contenido lo hacen desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), tarea `image-text-to-text`; checkpoint `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en la base; servido a 131.072 |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el repo no lista GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | en, fr, ar, pt, es, ru, zh, hi, id, tr, de, yo, ig, ha, pcm, sw, am, so, zu, xh, rw, lg, luo, ny, sn, tn, tw, wo, ee, fon, bm, mos, bbj |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B-Base (Apache-2.0) mediante un fine-tune completo, manteniendo congelado el codificador visual. Es, por tanto, un transformer multimodal estándar de la familia Qwen3.5 que acepta como entrada una plantilla JSON, un documento en texto y/o una imagen (escalada a aproximadamente 1,3 megapíxeles) y unas instrucciones opcionales, y genera como salida un JSON con la forma de la plantilla más una confianza por campo. La precisión de los pesos publicados es bf16. El autor no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, y tampoco menciona si hubo RLHF o DPO; esa información no está disponible.

La innovación principal es el mecanismo de confianza calibrada por campo: el modelo reporta, por ejemplo, 0,66 cuando acierta aproximadamente el 66% de las veces, lo que habilita flujos de revisión humana selectiva. Además, el sistema de plantillas tipadas (`verbatim-string`, `string`, `number`, `integer`, `date`, `date-time`, `boolean`, enumeraciones, listas y listas de objetos) con valores ausentes como `null` y listas vacías como `[]` estandariza la extracción, y el formato es compatible con NuExtract, de modo que las plantillas son intercambiables entre ambos modelos. El repositorio incluye un módulo propio `mist_extract.py` con la clase `Extractor`, que calcula las probabilidades de token necesarias para las confianzas y ofrece extracción por lotes.

## Capacidades

- Extracción de información estructurada a JSON a partir de una plantilla tipada proporcionada por el usuario.
- Entrada multimodal: texto, una imagen (foto o escaneo) o ambos combinados en la misma petición.
- Extracción sin OCR explícito ("OCR-free") directamente desde imágenes de documentos.
- Confianza calibrada por cada campo extraído, en el rango [0, 1].
- Instrucciones opcionales para ajustar formatos o definiciones (por ejemplo, "importes en kobo").
- Extracción de entidades nombradas (personas, organizaciones, lugares y fechas) en más de 20 lenguas africanas.
- Manejo de documentos en inglés y en lenguas africanas como yoruba, igbo, hausa, suajili, amárico, somalí, zulú, xhosa, kinyarwanda, shona, luo, fon, bambara y otras.
- Soporte multilingüe adicional en francés, árabe, portugués, español, ruso, chino, hindi, indonesio, turco y alemán.
- Extracción por lotes mediante `extract_batch`.
- Compatibilidad con vLLM como checkpoint estándar `Qwen3_5ForConditionalGeneration`.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso ni modo "thinking".

## Casos de uso

- Procesamiento de recibos de comercios y mercados: a partir de una foto o captura de pantalla, el modelo rellena una plantilla con comercio, fecha, total, método de pago y líneas de artículos, devolviendo confianzas que permiten enviar a revisión solo los campos dudosos. Su 99,9% de acierto por campo en fotos de recibos ingleses lo respalda.
- Confirmaciones de dinero móvil y banca: extracción de importes, remitentes, destinatarios y fechas de SMS y alertas de carteras digitales y transferencias, útil para conciliación contable automatizada en monedas africanas (naira, cedi, chelín, rand y otras).
- Digitalización de cartas y formularios: contratos de alquiler, cartas escolares, avisos, identificaciones, billetes y reclamaciones convertidos a JSON estructurado sin necesidad de un pipeline de OCR separado.
- Enriquecimiento de bases de datos con nombres en lenguas africanas: extracción de personas, organizaciones y lugares de documentos en 21 lenguas africanas, donde el modelo supera a alternativas multilingües como GLiNER2.5-multi.
- Automatización de facturación y contabilidad de PYMEs: con 9,7 documentos por segundo en una RTX A6000 y procesamiento por lotes, puede procesar volúmenes altos de recibos y facturas locales en pipelines nocturnos.
- Triaje documental con revisión humana: gracias a la confianza calibrada, un sistema puede aceptar automáticamente los campos con confianza alta y derivar los de confianza baja a operadores, reduciendo el coste de revisión manual.
- Migración desde NuExtract: al compartir formato de plantilla, un equipo que ya use NuExtract puede sustituir el modelo sin reescribir sus plantillas, ganando velocidad y cobertura de lenguas africanas.

## Benchmarks y rendimiento

Datos reportados por el autor del modelo:

| Benchmark | MIST-Extract-Flash-1.0 | NuExtract3 (4B) | Qwen3.5-4B | GLiNER2.5-multi |
|---|---|---|---|---|
| Documentos ingleses completamente correctos (486 documentos retenidos) | 90,5% | 67,9% | 34,0% | no disponible |
| Precisión por campo en fotos de recibos ingleses | 99,9% | no disponible | no disponible | no disponible |
| Precisión por campo en MasakhaNER 2.0 (21 lenguas africanas) | 0,701 | 0,393 | 0,432 | 0,452 |
| Rendimiento (documentos/s en RTX A6000 con vLLM) | 9,7 | 5,7 (1,7× más lento) | no disponible | no disponible |

En shona, luo, isiXhosa y fon el autor afirma una ventaja de entre 30 y 50 puntos sobre las alternativas. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,21 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 4,4 GB; en la práctica se recomienda al menos 8-12 GB de VRAM para margen de activaciones y caché KV, aunque no se dispone de cifras oficiales.
- GPU recomendadas: el autor cita una RTX A6000 para el benchmark de throughput; por tamaño, también debería funcionar en A100, H100, L40S y GPUs de consumo con suficiente VRAM (RTX 3090, RTX 4090 con 24 GB).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más en bf16, aunque no hay mediciones publicadas para estos casos.
- Opciones de despliegue: transformers (con el módulo `Extractor` incluido en el repo, requiere `transformers>=5.17`), vLLM (checkpoint estándar `Qwen3_5ForConditionalGeneration`), y despliegue por lotes offline. No se documentan soportes de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 9,7 documentos por segundo en una RTX A6000 bajo vLLM, 1,7 veces más rápido que NuExtract3 según el autor. No hay datos de latencia por documento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Documentos ingleses correctos | MasakhaNER 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MIST-Extract-Flash-1.0 | 2,21B | 262.144 (servido a 131.072) | 90,5% | 0,701 | Apache-2.0 | Hugging Face |
| NuExtract3 | 4B | no disponible | 67,9% | 0,393 | no disponible | Hugging Face |
| Qwen3.5-4B | 4B | no disponible | 34,0% | 0,432 | no disponible | Hugging Face |
| GLiNER2.5-multi | no disponible | no disponible | no disponible | 0,452 | no disponible | no disponible |
| MIST-Extract-1.0 (hermano mayor) | 4B | no disponible | más preciso (sin cifra) | no disponible | no disponible | Hugging Face |

El modelo se posiciona como la opción más precisa y rápida en su franja para documentos africanos, a costa de un rendimiento inferior declarado en facturas occidentales generales y PDF de varias páginas frente a extractores generalistas como NuExtract3.

## Limitaciones y advertencias

- El propio autor recomienda usar un extractor generalista como NuExtract3 para facturas occidentales generales, PDF de varias páginas y recibos extranjeros; el modelo está especializado en documentos africanos.
- Riesgo de alucinación inherente a los modelos generativos: aunque el formato tipado y las confianzas mitigan el problema, los campos con confianza baja deben revisarse.
- La calibración de la confianza es una afirmación del autor; no se aportan curvas de calibración ni métricas de error esperado (ECE) en la información disponible.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a documentos degradados, manuscritos o idiomas no cubiertos.
- Cobertura lingüística limitada a la lista declarada; lenguas africanas fuera de esa lista no están soportadas explícitamente.
- Procesa una sola imagen por petición y la escala a aproximadamente 1,3 megapíxeles, lo que puede perder detalle en documentos de alta resolución o muy densos.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM sin trabajo adicional.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B-Base y de los datos de entrenamiento, no detallados.
- Requiere `transformers>=5.17` para el módulo `Extractor`; versiones anteriores pueden no funcionar.
- El modelo tiene 27 descargas y 0 likes en el momento de la consulta, por lo que la validación por la comunidad es todavía escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/MIST-Extract-Flash-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Hermano mayor (4B): https://huggingface.co/olaverse/MIST-Extract-1.0
- NuExtract3 (comparativa y formato de plantilla compatible): https://huggingface.co/numind/NuExtract3
