# jazl26/business-entity-resolution-models

## Resumen

`jazl26/business-entity-resolution-models` es una colección de artefactos de aprendizaje automático orientada a la resolución de entidades de negocio (business entity resolution, B2B record linkage). No es un modelo generativo ni un LLM conversacional, sino un pipeline completo de matching compuesto por un prefiltro LightGBM, un modelo de fusión XGBoost y cinco transformadores fine-tuneados que actúan como bloqueadores densos y cross-encoders. El autor es el usuario de Hugging Face `jazl26` y el repositorio se publicó en noviembre de 2026.

El diseño sigue una arquitectura en cascada típica de los sistemas de entity resolution a gran escala: primero un filtro barato reduce el espacio de candidatos, después un bi-encoder denso (basado en `intfloat/multilingual-e5-base`) genera embeddings para blocking, y finalmente cuatro cross-encoders especializados puntúan cada par candidato con distinta información (nombre, calle, dirección vacía etiquetada y casos de aspecto similar). Un modelo XGBoost de fusión combina las puntuaciones y aplica umbrales de decisión calibrados.

La relevancia del repositorio es práctica: empaqueta en un solo lugar los componentes entrenados de un sistema de deduplicación y matching de registros empresariales, con scripts de descarga y de reentrenamiento. El tamaño del repositorio es de 5,8 GB, aunque los pesos de los cinco transformadores (~5,5 GB) no están incluidos en el árbol git y deben descargarse aparte desde el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de entity resolution: prefiltro LightGBM + bi-encoder denso (E5) + 4 cross-encoders transformer + fusión XGBoost |
| Parametros totales | No disponible (los pesos de los cinco transformadores suman ~5,5 GB; parámetros exactos no publicados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el bi-encoder base `multilingual-e5-base` es multilingüe; el resto de bases son mayoritariamente inglesas) |
| Licencia | No disponible en la model card; los modelos base se indican como MIT |
| Formato de pesos | safetensors (tag del repo); los pesos de los transformadores se publican aparte como `model.safetensors` |

## Arquitectura y entrenamiento

El sistema se organiza en dos etapas. La primera es un prefiltro de candidatos implementado con LightGBM (`prefilter_lgbm.txt`, ~21 MB), que reduce el número de pares a evaluar. La segunda combina un bloqueador denso basado en `intfloat/multilingual-e5-base` (`blocker_e5/`) con cuatro cross-encoders: `ce_tagged/`, `ce_nameonly/` y `ce_street/`, todos ellos fine-tuneados sobre `microsoft/mdeberta-v3-base`, y `ce_mmbert/`, fine-tuneado sobre `jhu-clsp/mmBERT-base` y entrenado con 2,9 millones de pares para detectar casos de aspecto similar (look-alike). Cada cross-encoder se especializa en un régimen de datos distinto: direcciones vacías etiquetadas con `[MISSING]`, registros solo con nombre y registros con información de calle.

La fusión final la realiza un modelo XGBoost (`fusion/fusion_final.json`) cuyas puntuaciones se combinan con umbrales de decisión calibrados sobre un conjunto de holdout, con `tau=0.75` y `delta=0.0` registrados en `fusion/fusion_final_meta.json`. El repositorio incluye tokenizer y `config.json` de cada transformador, pero no los pesos; el reentrenamiento completo desde las bases preentrenadas requiere entre 15 y 20 horas en una o dos GPU A100 y no es bit-determinista, por lo que los pesos reconstruidos reproducen las salidas publicadas con diferencias mínimas.

## Capacidades

- Blocking denso de candidatos mediante embeddings de `multilingual-e5-base`, orientado a recuperar pares plausibles antes de la puntuación fina.
- Puntuación de pares mediante cross-encoders especializados por tipo de señal: nombre, calle, dirección ausente y look-alike.
- Manejo explícito de direcciones vacías mediante etiquetado `[MISSING]` en el cross-encoder principal.
- Detección de entidades de aspecto similar (look-alike) con un cross-encoder entrenado sobre 2,9 millones de pares.
- Fusión de señales heterogéneas y decisión final mediante XGBoost con umbrales calibrados.
- Prefiltrado eficiente de candidatos con LightGBM para reducir coste computacional.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio; el sistema es exclusivamente discriminativo para matching de registros.

## Casos de uso

- Deduplicación de bases de datos de empresas: el pipeline permite consolidar registros duplicados de un CRM o ERP aplicando el prefiltro LightGBM y los cross-encoders para decidir si dos fichas corresponden a la misma entidad.
- Enriquecimiento de datos B2B: al integrar fuentes externas de empresas, el bloqueador denso y los cross-encoders permiten alinear registros entre proveedores distintos antes de fusionar atributos.
- Resolución de entidades en pipelines de datos maestros (MDM): el modelo de fusión XGBoost con umbral `tau=0.75` ofrece una capa de decisión calibrada integrable en flujos de calidad de datos.
- Limpieza de directorios comerciales con direcciones incompletas: el cross-encoder `ce_nameonly/` y el etiquetado `[MISSING]` de `ce_tagged/` están diseñados para pares donde falta la dirección.
- Matching calle-a-calle en registros logísticos o de distribución: `ce_street/` permite comparar direcciones con variaciones de formato para asociar puntos de entrega o sedes.
- Detección de empresas homónimas o fraudulentas: `ce_mmbert/`, entrenado sobre 2,9 millones de pares look-alike, ayuda a distinguir entidades con nombres muy parecidos pero distintas.
- Reentrenamiento y adaptación a dominios propios: el script `run_training.sh` permite reajustar el bloqueador y los cuatro cross-encoders sobre datos propios en 15-20 horas con una o dos A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona puntuaciones de holdout almacenadas en `fusion/fusion_final_meta.json`, pero no se incluyen sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los cinco transformadores suman ~5,5 GB de pesos en precisión original; en FP16 el conjunto requeriría del orden de 11 GB solo para pesos, más activaciones y el prefiltro/fusión en CPU.
- GPU recomendadas: el autor indica A100 para el reentrenamiento (una o dos GPU, 15-20 horas). Para inferencia no se especifican modelos concretos.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 16-24 GB si se cargan los cross-encoders de uno en uno y en FP16; no confirmado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un pipeline discriminativo, el despliegue esperado es mediante scripts Python propios y los artefactos LightGBM/XGBoost.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jazl26/business-entity-resolution-models` | Pipeline ER (LightGBM + E5 + 4 cross-encoders + XGBoost) | No disponible (~5,5 GB de pesos transformer) | No disponible | No disponible | Hugging Face, pesos transformer aparte |
| `intfloat/multilingual-e5-base` | Bi-encoder denso | ~278 M | 512 tokens | MIT | Hugging Face |
| `microsoft/mdeberta-v3-base` | Cross-encoder base | ~86 M (backbone DeBERTa-v3-base) | 512 tokens | MIT | Hugging Face |
| `jhu-clsp/mmBERT-base` | Encoder multilingüe | No disponible | No disponible | No disponible | Hugging Face |

La comparativa se limita a los modelos base sobre los que se construye el pipeline, ya que no se han publicado alternativas de entity resolution directamente comparables en la información disponible.

## Limitaciones y advertencias

- La model card no declara licencia para el conjunto del repositorio; solo indica que los modelos base son MIT. El uso comercial del pipeline fine-tuneado no está claramente autorizado.
- Los pesos de los cinco transformadores no están en el repositorio git; es necesario descargarlos con el script o reentrenarlos, lo que añade fricción operativa.
- No se documentan idiomas soportados ni evaluación multilingüe del pipeline completo; parte de las bases (mdeberta-v3, mmBERT) tienen cobertura lingüística limitada o no especificada.
- No hay benchmarks publicados ni métricas de holdout visibles, por lo que el rendimiento real en producción no puede verificarse a partir de la información disponible.
- El reentrenamiento no es bit-determinista, lo que puede introducir diferencias en las salidas respecto a los pesos publicados.
- No se documentan sesgos conocidos, riesgos de alucinación (el sistema es discriminativo, no generativo) ni límites de contexto.
- Al ser un pipeline de múltiples etapas, su comportamiento depende de la calibración del umbral `tau=0.75` y de la distribución de los datos de holdout; cambios de dominio pueden degradar la precisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jazl26/business-entity-resolution-models
- Modelo base del bloqueador: https://huggingface.co/intfloat/multilingual-e5-base
- Modelo base de tres cross-encoders: https://huggingface.co/microsoft/mdeberta-v3-base
- Modelo base del cross-encoder look-alike: https://huggingface.co/jhu-clsp/mmBERT-base
