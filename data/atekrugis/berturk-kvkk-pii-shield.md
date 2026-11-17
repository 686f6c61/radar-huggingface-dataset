# atekrugis/berturk-kvkk-pii-shield

## Resumen

BERTurk KVKK PII Shield es un modelo de clasificación de tokens (token classification) en turco, desarrollado por el usuario atekrugis, que detecta información personal identificable (PII) en texto turco siguiendo la taxonomía de la ley turca de protección de datos KVKK (equivalente al RGPD europeo). Se construye mediante fine-tuning de `dbmdz/bert-base-turkish-cased` (BERTurk), un transformer encoder de 110 millones de parámetros, y se distribuye en formatos safetensors y ONNX bajo licencia CC BY-SA 4.0.

El modelo resuelve un problema concreto: los proxies de privacidad que interceptan peticiones antes de enviarlas a un LLM alojado necesitan enmascarar datos personales, pero no cualquier entidad nombrada. Un NER genérico etiquetaría "Ziraat Bankası" como organización aunque se trate de una operación comercial inocua, mientras que "Acıbadem Hastanesi" en el contexto de una cirugía revela una asociación de salud y sí constituye PII. El modelo codifica explícitamente esta distinción mediante negativos duros de nombres públicos y anotaciones de contexto no privado.

La relevancia actual reside en su orientación a producción: 24 etiquetas BIO sobre 12 categorías, entrenamiento con datos ruidosos (OCR, logs, CRM, tickets de soporte), manejo de morfología turca con sufijos apostrofados y un diseño arquitectónico que delega los identificadores deterministas (TCKN, IBAN, teléfono, correo) a una capa de reglas separada, reservando el modelo para las categorías ambiguas dependientes del contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base_model: dbmdz/bert-base-turkish-cased) |
| Parametros totales | 110.045.977 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (estándar de BERT; entrenamiento con max_len 64) |
| Tipos de cuantizacion | No disponible (se distribuyen safetensors y ONNX; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un BERT base fine-tuneado para token classification con esquema BIO sobre 24 etiquetas (12 categorías × B/I). Las categorías cubiertas son PERSON, ADDRESS, LOCATION, ORGANISATION, HEALTH, RELIGION, ETHNICITY, POLITICAL, UNION, CRIMINAL, SEXUAL y BIOMETRIC. Los identificadores deterministas (TCKN, IBAN, VKN, teléfono, correo electrónico, números de tarjeta, matrículas y fechas) quedan fuera del alcance del modelo por decisión de diseño (ADR-002): una capa de expresiones regulares y gramáticas los gestiona en la arquitectura del proxy.

El entrenamiento emplea aproximadamente 131.000 documentos procedentes de cinco fuentes con licencias limpias: 18.000 documentos sintéticos generados de forma determinista con motor de sufijos morfológicos y aumentación de ruido; 83.138 documentos de BTX24/turkish-privacy-pii-ner (CC BY 4.0); 10.000 de neondijital/neonredact-tr (CC BY 4.0); 7.893 fragmentos de yusuf-said/turkish-privacy-filter-dataset (MIT), con texto degradado por OCR, logs, CRM y 12 escenarios; 1.600 de negentropi/belgin-pii-dataset (CC BY 4.0); y 9.537 del split de entrenamiento de turkish-wikiNER (CC BY-SA 4.0), donde las entidades LOC/ORG se usan como negativos explícitos. La configuración es de 5 épocas, batch 128, learning rate 2e-5, max_len 64, fp16 y 3 semillas (13, 42, 1234), seleccionando el mejor checkpoint por F1 en el conjunto T2. La dispersión entre semillas es de 0,030 con un F1 medio de 0,8773.

La innovación técnica principal no está en la arquitectura sino en la supervisión: negativos duros de nombres públicos reales (Nazım Hikmet, Barış Manço), instituciones (Ziraat Bankası, Merkez Bankası) y lugares emblemáticos incluidos en documentos limpios sin spans; negativos de prosa real de wikiNER con organizaciones y lugares anotados como `O` en contextos no privados; y supervisión sobre texto ruidoso con manejo de morfología turca en sufijos apostrofados ("Tarkan Yalçın'ün" cubre el span `Tarkan Yalçın`).

## Capacidades

- Detección de spans de PII en texto turco con etiquetado BIO sobre 24 etiquetas.
- Distinción entre entidades nombradas genéricas y revelaciones de privacidad según la taxonomía KVKK, incluidas las categorías del artículo 6 (salud, religión, etnia, opinión política, afiliación sindical, condenas penales, vida sexual, datos biométricos).
- Manejo de morfología turca: sufijos apostrofados, formas en mayúscula y minúscula, tratamientos ("Ayşe Yılmaz Hanım").
- Robustez ante texto degradado: OCR, logs de servidor, exportaciones de CRM y tickets de soporte.
- Agregación de entidades mediante `aggregation_strategy="first"` en el pipeline de transformers.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- Exportación a ONNX para despliegue optimizado.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de etiquetado.

## Casos de uso

- Proxy de privacidad para LLM: el modelo actúa como componente "C1" de detección; las peticiones se escanean antes de llegar a un LLM alojado y los spans detectados se enmascaran o sustituyen por marcadores seudónimos en un componente posterior. Es adecuado por su enfoque en categorías ambiguas dependientes del contexto que las reglas no capturan.
- Cumplimiento KVKK en atención al cliente: procesamiento de conversaciones multi-turno y tickets para identificar datos personales antes de almacenarlos o compartirlos con terceros, con especial atención a las categorías del artículo 6 (salud, religión, etnia) que exigen protección reforzada.
- Redacción de documentos en procesos de descubrimiento o auditoría: anonimización de exportaciones de CRM y registros de soporte que contienen texto ruidoso (OCR, formatos inconsistentes), aprovechando el entrenamiento sobre datos degradados.
- Enmascaramiento en pipelines de analítica: preprocesado de logs de servidor y exportaciones antes de enviarlos a herramientas de BI o almacenes de datos, reduciendo el riesgo de exposición de PII en entornos analíticos.
- Filtrado previo en sistemas de denuncia o complaint management: detección de datos personales en texto informal de reclamaciones (estilo del dataset belgin-pii) para cumplir con plazos de retención y minimización de datos.
- Integración en arquitecturas híbridas regla-modelo: uso del modelo únicamente para las 12 categorías contextuales mientras una capa regex/gramática gestiona TCKN, IBAN, VKN, teléfonos, correos, tarjetas, matrículas y fechas, tal como prescribe el diseño ADR-002.
- Evaluación de riesgo en bases de datos documentales turcas: escaneo por lotes de corpus para inventariar qué documentos contienen PII sensible y priorizar su tratamiento o eliminación.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Notas |
|---|---|---|---|
| T2 held-out synthetic (3.000 docs, 24 etiquetas) | Micro F1 (umbrales óptimos por etiqueta) | 0,910 | Ajustado |
| T2 held-out synthetic | Micro F1 (sin ajuste) | 0,881 | Sin ajuste |
| T2 held-out synthetic | Micro Precision (ajustado) | 0,934 | Ajustado |
| T2 held-out synthetic | Micro Recall (ajustado) | 0,887 | Ajustado |
| SPIKE-001 gold set (60 docs, atención al cliente realista) | Micro F1 (sin ajuste) | 0,976 | Sin ajuste |
| SPIKE-001 gold set | Micro Recall (sin ajuste) | 1,000 | Sin ajuste |

Desglose por etiqueta en T2 (F1 ajustado):

| Etiqueta | F1 |
|---|---|
| ADDRESS | 0,995 |
| PERSON | 0,976 |
| SEXUAL | 0,973 |
| ETHNICITY | 0,972 |
| LOCATION | 0,953 |
| ORGANISATION | 0,887 |
| BIOMETRIC | 0,847 |
| UNION | 0,785 |
| RELIGION | 0,773 |
| HEALTH | 0,766 |
| POLITICAL | 0,640 |
| CRIMINAL | 0,612 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 110 millones de parámetros, más el overhead de activaciones y tokenizador; en fp16 alrededor de 0,25 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema. Para despliegues de alto throughput se recomienda A100 o H100 por su capacidad de batching.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers con pipeline de token-classification, ONNX Runtime (hay pesos ONNX en el repositorio), Hugging Face Inference Endpoints (tag `endpoints_compatible`), y servidores de inferencia compatibles con modelos transformers. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un encoder BERT base con max_len 64 en entrenamiento, la latencia por documento debería ser de pocos milisegundos en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada. A continuación se comparan características estructurales con alternativas plausibles de la misma categoría (detección de PII en turco), indicando qué datos no están disponibles:

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento comparado |
|---|---|---|---|---|---|
| atekrugis/berturk-kvkk-pii-shield | 110 M | 512 tokens | CC BY-SA 4.0 | PII con taxonomía KVKK, 12 categorías contextuales | F1 0,910 en T2 (declarado) |
| BTX24/turkish-privacy-pii-ner | No disponible | No disponible | CC BY 4.0 | NER de privacidad turca (fuente de entrenamiento) | No disponible |
| neondijital/neonredact-tr | No disponible | No disponible | CC BY 4.0 | Detección de PII turca (fuente de entrenamiento) | No disponible |
| dbmdz/bert-base-turkish-cased | 110 M | 512 tokens | No disponible en la información | BERT base turco sin fine-tuning para PII | No aplica (modelo base) |

No se dispone de información sobre modelos comparables de terceros con benchmarks públicos en la misma tarea para establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo en la información proporcionada. El entrenamiento con datos sintéticos y de terceros puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: al ser un modelo discriminativo de etiquetado, no genera texto y por tanto no alucina en el sentido habitual; sin embargo, puede producir falsos positivos (marcar como PII entidades que no lo son) y falsos negativos (no detectar PII real), especialmente en las categorías con F1 más bajo: CRIMINAL (0,612), POLITICAL (0,640), HEALTH (0,766) y RELIGION (0,773).
- Limitaciones de contexto: la longitud máxima es de 512 tokens, aunque el entrenamiento usó max_len 64; documentos más largos requieren fragmentación, lo que puede romper spans que crucen fronteras de fragmento.
- Limitaciones de idioma: solo turco. No se ha entrenado ni evaluado en otros idiomas.
- Restricciones de licencia: CC BY-SA 4.0 permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia. Esto puede ser problemático para productos propietarios que no quieran liberar sus modificaciones.
- Caveat de producción: el modelo no cubre identificadores deterministas (TCKN, IBAN, VKN, teléfono, correo, tarjetas, matrículas, fechas); es imprescindible combinarlo con una capa de reglas para una cobertura completa de PII.
- Caveat de evaluación: los benchmarks T2 y SPIKE-001 son conjuntos privados del autor, no verificados de forma independiente y no reproducibles públicamente; las cifras deben tomarse con cautela.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-16) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atekrugis/berturk-kvkk-pii-shield
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset BTX24/turkish-privacy-pii-ner: https://huggingface.co/datasets/BTX24/turkish-privacy-pii-ner
- Dataset neondijital/neonredact-tr: https://huggingface.co/datasets/neondijital/neonredact-tr
- Dataset yusuf-said/turkish-privacy-filter-dataset: https://huggingface.co/datasets/yusuf-said/turkish-privacy-filter-dataset
- Dataset negentropi/belgin-pii-dataset: https://huggingface.co/datasets/negentropi/belgin-pii-dataset
- Dataset turkish-wikiNER: no disponible (no se proporciona URL directa en la información)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
