# ABO-SAUD/arabic-job-ads-ner-mbert

## Resumen

`ABO-SAUD/arabic-job-ads-ner-mbert` es un modelo de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido mediante ajuste fino completo de `google-bert/bert-base-multilingual-cased` sobre anuncios de empleo en árabe. Lo desarrolla el usuario ABO-SAUD como proyecto de curso (Hugging Face Fundamentals) y resuelve la extracción estructurada de información a partir de texto libre de ofertas de trabajo: identifica nueve tipos de entidad en formato BIO (ORG, JOB, LOC, DATE, SALARY, EXP, EDU, SKILL y PROG).

El modelo parte de la arquitectura BERT multilingüe en su variante *cased* (12 capas, 768 dimensiones ocultas, ~177 millones de parámetros) y se ajusta con un conjunto de datos sintético generado por plantillas. Su relevancia es acotada pero concreta: demuestra un flujo completo de anotación, entrenamiento y evaluación con `seqeval` sobre árabe, un idioma con relativamente pocos recursos NER específicos de dominio laboral, y alcanza un F1 de 0,9439 en su propio conjunto de test.

La ventana de contexto efectiva es de 256 sub-tokens por ventana, y los textos más largos se procesan por fragmentos. La licencia Apache 2.0 permite uso comercial, aunque la naturaleza sintética de los datos de entrenamiento limita seriamente la generalización a anuncios reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (bert-base-multilingual-cased), clasificación de tokens |
| Parametros totales | 177.277.459 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 sub-tokens por ventana; textos largos procesados por ventanas |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización estándar de BERT vía herramientas externas) |
| Idiomas soportados | árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,7 GB) |

## Arquitectura y entrenamiento

El modelo es un BERT base multilingüe (12 capas, 768 de dimensión oculta, 12 cabezas de atención) con una cabeza de clasificación de tokens de 19 etiquetas (9 entidades en formato BIO más la etiqueta Outside). Se realiza un ajuste fino completo (no LoRA ni adaptadores) sobre el checkpoint `google-bert/bert-base-multilingual-cased`.

Los datos de entrenamiento son 850 anuncios de empleo sintéticos generados por plantillas (CC BY 4.0, creados por el equipo), con 150 de validación y 200 de test tras deduplicación. El conjunto de test se generó con una semilla distinta e incluye valores de entidad y plantillas de frase no vistas en entrenamiento. Los hiperparámetros son: learning rate 5e-5 (mejor de 5e-5 frente a 2e-5), 4 épocas, batch size 16, weight decay 0,01, warmup del 10 %, semilla 42 y entrenamiento en una Tesla T4 con un tiempo declarado de 0,84 minutos. No se documenta el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; es un ajuste fino supervisado estándar con pérdida de entropía cruzada por token.

## Capacidades

- Extracción de entidades nombradas en árabe sobre texto de anuncios de empleo, con nueve tipos: ORG (empleador), JOB (puesto), LOC (ubicación), DATE (fecha), SALARY (salario), EXP (experiencia), EDU (cualificación), SKILL (competencia o término técnico) y PROG (programa o iniciativa).
- Etiquetado en formato BIO, apto para construir registros estructurados a partir de texto libre.
- Procesamiento por ventanas de hasta 256 sub-tokens, con concatenación de resultados para documentos más largos.
- Capacidad multilingüe heredada del modelo base, aunque el ajuste fino está orientado exclusivamente al árabe.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento; es un modelo discriminativo de clasificación de tokens, no generativo.

## Casos de uso

- Indexación y búsqueda de ofertas de empleo: extraer ORG, JOB y LOC de cada anuncio para construir un índice facetado que permita filtrar por empresa, puesto y ciudad sin intervención manual.
- Analítica del mercado laboral: agregar las entidades SKILL y EDU sobre un corpus de anuncios para medir qué competencias y titulaciones se demandan con más frecuencia por sector o región.
- Normalización de salarios y experiencia: extraer SALARY y EXP para poblar campos estructurados en una base de datos de ofertas, facilitando comparativas y rangos salariales por puesto.
- Enriquecimiento de pipelines de datos: integrar el modelo como etapa de preprocesado en un ETL que convierta texto árabe no estructurado en registros JSON con campos tipados antes de cargarlos en un almacén analítico.
- Detección de programas e iniciativas: identificar PROG (programas de formación, iniciativas de empleo) para etiquetar ofertas vinculadas a políticas activas de empleo o subvenciones.
- Prototipado y docencia: servir como referencia didáctica de un flujo completo de NER (anotación BIO, ajuste fino de BERT, evaluación con `seqeval`) en cursos de PLN en árabe, dado su bajo coste de entrenamiento (menos de un minuto en T4).
- Preetiquetado asistido para anotación humana: usar las predicciones como borrador inicial que un anotador revisa, reduciendo el tiempo de etiquetado en la construcción de un corpus real de anuncios.

## Benchmarks y rendimiento

Evaluación en el conjunto de test (nivel de entidad, `seqeval`), según la model card:

| Modelo | Precision | Recall | F1 |
|---|---|---|---|
| Baseline (sin ajuste fino) | 0,0082 | 0,0325 | 0,0132 |
| Ajustado (A_lr5e-5) | 0,9235 | 0,9652 | 0,9439 |

Desglose por entidad en test:

| Entidad | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| DATE | 0,9029 | 0,9294 | 0,9159 | 170 |
| EDU | 0,8681 | 0,9124 | 0,8897 | 137 |
| EXP | 1,0000 | 1,0000 | 1,0000 | 141 |
| JOB | 0,8161 | 0,9100 | 0,8605 | 200 |
| LOC | 0,8680 | 0,9195 | 0,8930 | 236 |
| ORG | 0,9174 | 1,0000 | 0,9569 | 200 |
| PROG | 1,0000 | 1,0000 | 1,0000 | 66 |
| SALARY | 1,0000 | 1,0000 | 1,0000 | 95 |
| SKILL | 0,9769 | 1,0000 | 0,9883 | 507 |
| micro avg | 0,9235 | 0,9652 | 0,9439 | 1752 |

No se han publicado comparaciones con otros modelos en la información disponible. Los resultados corresponden a un test sintético generado con plantillas distintas a las de entrenamiento, por lo que no son directamente extrapolables a anuncios reales.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,7 GB en fp32 (177 M de parámetros); ~0,35 GB en fp16 y ~0,18 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una Tesla T4 es suficiente y fue la usada en entrenamiento. Para lotes grandes, A100 o H100 aportan margen, aunque el modelo es pequeño.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, `vLLM` (soporte limitado para BERT), `TGI`, `ONNX Runtime` y `llama.cpp` no aplica de forma nativa (no es un modelo generativo); para CPU, exportación a ONNX es la vía más eficiente.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento completo declarado de 0,84 minutos en T4 sugiere un coste de inferencia muy bajo por ventana de 256 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ABO-SAUD/arabic-job-ads-ner-mbert` | 177 M | 256 sub-tokens | NER en anuncios de empleo en árabe | Apache 2.0 | Hugging Face |
| `google-bert/bert-base-multilingual-cased` (base sin ajustar) | 177 M | 512 sub-tokens | Modelo base multilingüe; sin cabeza NER específica | Apache 2.0 | Hugging Face |
| `CAMeL-Lab/bert-base-arabic-camelbert-msa-ner` | ~110-135 M | 512 sub-tokens | NER en árabe (MSA) | no disponible en esta ficha | Hugging Face |
| `asafaya/bert-base-arabic` | ~110-135 M | 512 sub-tokens | Modelo base en árabe; requiere ajuste para NER | no disponible en esta ficha | Hugging Face |

La comparación con alternativas árabes específicas no puede completarse con datos de rendimiento porque la información proporcionada no incluye sus métricas. El modelo aquí descrito se distingue por su dominio muy concreto (anuncios de empleo) y por estar entrenado exclusivamente con datos sintéticos.

## Limitaciones y advertencias

- Entrenado sobre anuncios sintéticos generados por plantillas: los anuncios reales con dialecto, emojis, hashtags, textos muy largos o maquetaciones inusuales pueden degradar notablemente la precisión.
- No apto para decisiones automatizadas de contratación; las salidas deben revisarse por una persona.
- Ventana de 256 sub-tokens por fragmento: los textos largos se procesan por ventanas, lo que puede fragmentar entidades que crucen el límite.
- Sesgos potenciales heredados de las plantillas de los autores, incluidos títulos de puesto con género marcado (por ejemplo, ممرض/ممرضة).
- Riesgo de alucinación estructural: al ser un modelo discriminativo, el riesgo se manifiesta como falsos positivos de entidad (etiquetar como ORG o SKILL fragmentos que no lo son), especialmente en dominios distintos al de entrenamiento.
- Cobertura lingüística limitada al árabe; el multilingüismo del modelo base no se ha validado tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero la model card no ofrece garantías sobre el rendimiento en producción ni sobre la calidad de los datos sintéticos.
- Sin descargas ni likes en el momento de la consulta y creado en 2026: ecosistema de validación externa prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/ABO-SAUD/arabic-job-ads-ner-mbert
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Documentación de `seqeval` (métrica usada en la evaluación): https://github.com/chakki-works/seqeval
- Documentación de `transformers` para clasificación de tokens: https://huggingface.co/docs/transformers/tasks/token_classification
