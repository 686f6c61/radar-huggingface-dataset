# AAU-NLP/Cal-FLANG-BERT-SL1000

## Resumen

Cal-FLANG-BERT-SL1000 es un modelo de etiquetado de secuencias (token classification) desarrollado por el grupo AAU-NLP y afinado sobre el modelo financiero SALT-NLP/FLANG-BERT. Su tarea concreta es extraer indicadores clave de rendimiento (KPI) financieros de informes periódicos de la SEC estadounidense (formularios 10-K y 10-Q) en inglés, mapeando cada mención a una etiqueta de la taxonomía de cálculo de iXBRL. Con 109.661.417 parámetros y una arquitectura BERT encoder-only, es un modelo compacto orientado a producción documental más que a generación de texto.

El modelo se entrena sobre el dataset HiFi-KPI, descrito en el artículo homónimo presentado en LREC 2026, y predice las 1.000 etiquetas de entidad más frecuentes tras desplazar las entidades un nivel hacia arriba en la taxonomía de cálculo (n=1), más la etiqueta exterior `O`, lo que da un espacio de salida de 1.001 clases. Es la variante basada en FLANG de Cal-BERT-SL1000 dentro de la colección de modelos HiFi-KPI.

Su relevancia actual radica en que automatiza una parte del parsing financiero que tradicionalmente exige reglas manuales sobre iXBRL: la identificación de menciones de KPI y su correspondencia con la jerarquía de cálculo. Al ser un modelo encoder-only de ~110M parámetros con licencia Apache 2.0, es desplegable en hardware modesto y encaja en pipelines de extracción de documentos a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder-only (BertForTokenClassification) |
| Parametros totales | 109.661.417 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada BERT; la model card indica dividir documentos largos en párrafos o fragmentos que quepan en la ventana) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 0,4 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only de la familia BERT, inicializado desde SALT-NLP/FLANG-BERT, un BERT adaptado al dominio financiero. La cabeza de clasificación es de token classification con 1.001 etiquetas de salida: 1.000 etiquetas de entidad financiera y la etiqueta `O`. Las etiquetas guardadas usan nombres de entidad simples en lugar de prefijos BIO, y el mapeo exacto etiqueta-ID se almacena en `config.json`. Las predicciones son etiquetas a nivel de token; el checkpoint no devuelve por sí mismo registros estructurados con valores financieros, fechas o divisas.

El ajuste fino se realiza sobre el dataset AAU-NLP/HiFi-KPI, construido a partir de informes de resultados de la SEC, y la tarea se describe en el artículo HiFi-KPI (LREC 2026). La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo encoder-only de etiquetado, estas técnicas de alineación generativa no resultan aplicables en el sentido habitual. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Etiquetado de secuencias (token classification) para reconocimiento de entidades financieras en texto inglés.
- Extracción de menciones de KPI financieros en informes 10-K y 10-Q de la SEC.
- Mapeo de menciones financieras a etiquetas de la taxonomía de cálculo iXBRL (1.000 etiquetas más `O`).
- Parsing de documentos financieros con reconocimiento de entidades basado en iXBRL.
- Salida a nivel de subtoken con etiquetas, puntuaciones de confianza y offsets de caracteres.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción de KPI en pipelines de análisis financiero: el modelo procesa párrafos de informes 10-K y 10-Q y devuelve etiquetas de entidad con offsets de caracteres, lo que permite localizar menciones de KPI y enlazarlas posteriormente con valores numéricos extraídos por otros componentes del pipeline.
- Parsing de documentos iXBRL: dado que las etiquetas provienen de la taxonomía de cálculo, el modelo sirve para alinear menciones textuales con nodos de la jerarquía iXBRL, reduciendo el trabajo de mapeo manual en herramientas de extracción estructurada.
- Enriquecimiento de bases de datos financieras: se puede ejecutar por lotes sobre archivos históricos de la SEC para poblar índices de KPI por empresa y periodo, aprovechando su tamaño reducido para procesar grandes volúmenes en CPU o GPU modesta.
- Preprocesamiento para modelos generativos: las menciones etiquetadas pueden alimentar un paso posterior de un LLM que redacte resúmenes o responda preguntas sobre los resultados, actuando el modelo como extractor determinista y barato.
- Monitorización de divulgación regulatoria: al etiquetar sistemáticamente los KPI reportados, permite detectar cambios en la forma de reportar métricas entre trimestres o comparar la cobertura de KPI entre empresas del mismo sector.
- Investigación en NLP financiero: sirve como línea base reproducible (junto a Cal-BERT-SL1000) para experimentos sobre extracción jerárquica de KPI con el dataset HiFi-KPI, al estar publicados pesos, dataset y código.
- Indexación y búsqueda semántica de informes: las etiquetas de entidad permiten construir índices por tipo de KPI y recuperar fragmentos relevantes de documentos extensos sin necesidad de un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,4 GB en safetensors; con 109,7M parámetros en precisión FP32 la huella ronda los 0,44 GB de pesos, y en FP16 aproximadamente 0,22 GB. Sumando activaciones y overhead de runtime, la inferencia cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1660 resultan sobradas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM; también es viable en CPU para procesamiento por lotes.
- Opciones de despliegue: pipeline `token-classification` de transformers, exportación a ONNX Runtime, TorchScript o integración en servicios con FastAPI. Al ser un modelo BERT estándar, es compatible con los runtimes habituales de transformers; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cal-FLANG-BERT-SL1000 | 109.661.417 | no disponible | Token classification (KPI financiero, 1.001 etiquetas) | Apache 2.0 | Hugging Face (AAU-NLP) |
| Cal-BERT-SL1000 | no disponible | no disponible | Token classification (KPI financiero, contraparte BERT) | no disponible | Hugging Face (AAU-NLP) |
| FLANG-SL1000 | ~0,1B (según ficha de HF) | no disponible | Token classification (KPI financiero) | no disponible | Hugging Face (AAU-NLP) |
| SALT-NLP/FLANG-BERT | no disponible | no disponible | Modelo base financiero (encoder) | no disponible | Hugging Face (SALT-NLP) |

La información disponible no incluye métricas de rendimiento comparadas entre estos modelos, por lo que la comparativa se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Solo procesa inglés; no cubre otros idiomas.
- Es un modelo encoder-only de etiquetado: no genera texto ni mantiene conversaciones, y no debe usarse como sustituto de un LLM generativo.
- Devuelve etiquetas a nivel de token sin estructura: no extrae valores numéricos, fechas ni divisas, que deben obtenerse con componentes adicionales.
- La ventana de entrada es la de BERT; los informes largos deben fragmentarse en párrafos o trozos, lo que puede romper menciones a caballo entre fragmentos.
- Las etiquetas cubren solo las 1.000 entidades más frecuentes tras el desplazamiento n=1 en la taxonomía de cálculo; KPI menos frecuentes quedan fuera del espacio de etiquetas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos en el etiquetado, especialmente en texto financiero ambiguo o tablas mal linealizadas.
- No se documentan análisis de sesgos en la información disponible.
- Licencia Apache 2.0: permite uso comercial con atribución y conservación del aviso de licencia; conviene revisar las condiciones del modelo base SALT-NLP/FLANG-BERT.
- Para producción, es recomendable validar el rendimiento en el dominio concreto (por ejemplo, sectores o formatos de presentación específicos) antes de desplegarlo, dado que no hay benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AAU-NLP/Cal-FLANG-BERT-SL1000
- Dataset HiFi-KPI: https://huggingface.co/datasets/AAU-NLP/HiFi-KPI
- Artículo HiFi-KPI: https://huggingface.co/papers/2502.15411
- Repositorio de código HiFi-KPI: https://github.com/aaunlp/HiFi-KPI
- Modelo base FLANG-BERT: https://huggingface.co/SALT-NLP/FLANG-BERT
- Contraparte Cal-BERT-SL1000: https://huggingface.co/AAU-NLP/Cal-BERT-SL1000
- FLANG-SL1000: https://huggingface.co/AAU-NLP/FLANG-SL1000
- Artículo en ACL Anthology: https://aclanthology.org/2026.lrec-1.30/
