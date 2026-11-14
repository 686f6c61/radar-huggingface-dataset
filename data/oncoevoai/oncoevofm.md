# OncoEvoAI/OncoEvoFM

## Resumen

OncoEvoFM es un transformer preentrenado de 48,5 millones de parámetros desarrollado por OncoEvoAI que convierte mutaciones somáticas y, opcionalmente, alteraciones del número de copias (CNA) en embeddings a nivel de muestra. No es un modelo generativo de lenguaje: su pipeline es `feature-extraction` y su dominio es la genómica del cáncer, por lo que su utilidad está en representar perfiles genómicos de pacientes como vectores densos reutilizables en tareas posteriores (clasificación, agrupamiento, análisis de linaje, etc.).

La arquitectura consta de 12 capas transformer con tamaño oculto de 512 y un cuello de botella clonal de 64 dimensiones. El checkpoint publicado conserva todas las cabezas de tarea originales y expone múltiples salidas nombradas (`e_patient`, `e_clonal`, `z_clonal`, `e_process`, `e_lineage`, `e_assay`, `pathway_states`, `last_hidden_state`, `z_mu`, `z_logvar`), lo que permite usar tanto representaciones de paciente como latentes clonales y estados de tokens de evento.

Es relevante ahora porque ofrece un encoder específico de oncología con licencia CC BY 4.0 (uso comercial permitido) y un tamaño que cabe en GPU de consumo. El modelo se entrenó con AACR Project GENIE versión 19.0-public. La implementación Python se distribuye por separado en el paquete `oncoevofm`, y el repo de Hugging Face solo pesa 0,2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (12 capas, hidden size 512, cuello de botella clonal de 64 dimensiones) |
| Parámetros totales | 48.546.605 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada basada en conjuntos de eventos genómicos, no en tokens de texto) |
| Tipos de cuantización | no disponible (se distribuye en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo genómico, no lingüístico) |
| Licencia | CC BY 4.0 (pesos); el código `oncoevofm` y los datasets tienen sus propios términos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OncoEvoFM es un transformer de 12 capas con dimensión oculta de 512 que procesa eventos genómicos (mutaciones somáticas y segmentos CNA opcionales) y produce representaciones a nivel de muestra. Incluye un cuello de botella clonal de 64 dimensiones con parametrización variacional (`z_mu` y `z_logvar`, con `z_clonal` igual a `z_mu` en modo evaluación), lo que sugiere un componente de autoencoder variacional sobre el estado clonal. El modelo mantiene 16 tokens de registro o vía (`pathway_states`, forma B × 16 × 512) y cabezas separadas para resumen de paciente, proceso, linaje y ensayo.

El entrenamiento utilizó AACR Project GENIE versión 19.0-public, un registro internacional de datos genómicos de cáncer. Las coordenadas genómicas se expresan en GRCh37/hg19 y el procesador calcula VAF y profundidad a partir de los conteos de lecturas alternativas y de referencia. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF/DPO (poco probable en un encoder genómico). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de embeddings de pacientes a partir de listas de mutaciones somáticas con campos como gen, cromosoma, posición, clasificación de variante, tipo, consecuencia, HGVSp y conteos de lecturas.
- Integración opcional de alteraciones del número de copias mediante segmentos CNA (`chromosome`, `start`, `seg_mean`).
- Producción de múltiples representaciones: resumen de paciente (`e_patient`), resumen clonal (`e_clonal`), latente clonal (`z_clonal`, `z_mu`, `z_logvar`), resumen de proceso (`e_process`), linaje (`e_lineage`) y ensayo (`e_assay`).
- Generación de estados de tokens de evento sin padding mediante `pad_mask`, lo que permite un tensor por muestra con forma Nᵢ × 512.
- Estados de vía/registro aprendidos (`pathway_states`, 16 × 512) utilizables como features adicionales.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de representación, no un LLM generativo.
- No dispone de capacidades multilingües, visión ni audio.

## Casos de uso

- Clasificación de subtipos tumorales: usar `e_patient` como entrada a un clasificador ligero (regresión logística, MLP) entrenado con etiquetas clínicas, aprovechando que el encoder ya ha aprendido representaciones de perfiles mutacionales de GENIE.
- Estratificación de pacientes para ensayos clínicos: agrupar embeddings `z_clonal` o `e_patient` con clustering (k-means, UMAP + HDBSCAN) para identificar subgrupos con patrones mutacionales similares antes de definir cohortes.
- Análisis de linaje y evolución clonal: emplear `e_lineage` y `z_clonal` para estudiar la estructura latente de la clonalidad y comparar muestras longitudinales de un mismo paciente.
- Búsqueda de pacientes similares: indexar embeddings de una cohorte en una base vectorial y recuperar los casos más próximos a un perfil de mutaciones dado para revisión por comités moleculares.
- Feature engineering para modelos de supervivencia o respuesta a tratamiento: concatenar `e_patient`, `e_process` y `e_assay` con variables clínicas en modelos de riesgo proporcional o gradient boosting.
- Priorización de variantes en pipelines de investigación: usar los estados de evento (`last_hidden_state` sin padding) como representación contextual de cada mutación para tareas downstream de anotación o filtrado.
- Preentrenamiento y fine-tuning en oncología computacional: al permitir uso comercial y modificación bajo CC BY 4.0, sirve como inicialización para encoders específicos de cohortes privadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 48,5 M de parámetros; en fp32 ocupa aproximadamente 194 MB y en fp16 unos 97 MB, a lo que hay que sumar los assets de features congeladas y el overhead de activaciones (el repo completo pesa 0,2 GB).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; A100, H100, RTX 4090, RTX 3090, RTX 3060 o T4 no suponen ningún problema.
- Cabe holgadamente en GPU de consumo; también puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: API de Transformers con el paquete `oncoevofm` registrando las clases personalizadas (el ejemplo oficial usa `AutoModel` y `AutoProcessor` con `trust_remote_code=False`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no encajan con un encoder de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OncoEvoFM | 48,5 M | no disponible | Genómica del cáncer (mutaciones + CNA) | CC BY 4.0 | Hugging Face + paquete `oncoevofm` |
| Modelos genómicos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables de la misma categoría (encoders genómicos con salidas multivista y cuello de botella clonal) con datos verificables de parámetros, contexto o rendimiento, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Modelo de extracción de features, no generativo: no responde preguntas ni mantiene conversaciones; cualquier uso como LLM es un error de categoría.
- Entrenado exclusivamente con AACR Project GENIE 19.0-public: puede no generalizar a cohortes con distribuciones de mutaciones, paneles o poblaciones distintas.
- Las coordenadas deben estar en GRCh37/hg19; usar otro ensamblado (GRCh38) sin liftover producirá representaciones incorrectas.
- Los nombres de las salidas (`e_lineage`, `e_process`, `pathway_states`, etc.) describen roles de entrenamiento y no garantizan factores biológicos aislados, según advierte el propio autor.
- Riesgo de sesgo derivado del registro GENIE: sobrerrepresentación de ciertos tipos tumorales, paneles y centros; los embeddings pueden reflejar esos sesgos.
- No hay benchmarks publicados que permitan estimar su calidad frente a alternativas; validar siempre en la cohorte objetivo antes de producción.
- Licencia CC BY 4.0 en los pesos: permite uso comercial, modificación, fine-tuning y redistribución con atribución y conservación de avisos. El código `oncoevofm` y los datasets tienen términos propios y deben revisarse por separado.
- Requiere Python 3.12 o 3.13 y la versión probada 0.1.1 del paquete `oncoevofm`; la API puede cambiar entre versiones.
- Uso clínico: no es un dispositivo médico ni está validado para diagnóstico; cualquier aplicación en decisiones clínicas requiere validación regulatoria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OncoEvoAI/OncoEvoFM
- Repositorio del paquete `oncoevofm`: https://github.com/amlopeza/OncoEvoFM
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Texto legal completo de la licencia: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Paper de AACR Project GENIE: https://doi.org/10.1158/2159-8290.CD-17-0151
