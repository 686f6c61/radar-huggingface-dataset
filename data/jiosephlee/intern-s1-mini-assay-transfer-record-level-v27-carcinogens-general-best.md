# jiosephlee/intern-s1-mini-assay-transfer-record-level-v27-carcinogens-general-best

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `jiosephlee/Intern-S1-mini-lm` orientado a una tarea muy concreta de química computacional: la transferencia de ensayos (*assay transfer*) a nivel de registro para la predicción de carcinogenicidad, con grado 24 (*degree 24*). Lo publica el usuario `jiosephlee` en HuggingFace y se distribuye como un checkpoint seleccionado por validación dentro de un entrenamiento más amplio. El problema que resuelve es el de estimar propiedades toxicológicas de compuestos cuando solo se dispone de datos de ensayos parciales, algo habitual en el descubrimiento de fármacos, donde las mediciones experimentales son caras y dispersas.

Técnicamente se trata de un modelo de lenguaje de 8.201.221.120 parámetros (aproximadamente 8,2 mil millones) con pesos en formato `safetensors`, etiquetado en el repositorio como `qwen3` y con salida de tipo `text-generation`. El checkpoint se seleccionó en el paso 500 de entrenamiento según la métrica conjunta `Carcinogens/degree24/overall/knn_regression_id_ood_level_macro_mae_at_3`, con un valor de validación de 0,8675038371.

Su relevancia es acotada pero clara: es un ejemplo de cómo un modelo de lenguaje generalista puede adaptarse mediante fine-tuning con pérdida de objetivos suaves (*soft-target loss*) a tareas de regresión y ranking sobre descriptores químicos, superando en el panel de test conjunto ID/OOD a los baselines clásicos basados en huellas de Morgan. No se trata de un modelo conversacional de propósito general, sino de un artefacto de investigación especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (el repositorio se etiqueta como `qwen3`; modelo base: `jiosephlee/Intern-S1-mini-lm`) |
| Parametros totales | 8.201.221.120 (aproximadamente 8,2 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,4 GB |
| Pipeline | text-generation |
| Modelo base | jiosephlee/Intern-S1-mini-lm (revision fcb667c380ae01f57693a45b4b5c2d331052a107) |
| Dataset de entrenamiento | jiosephlee/assay-transfer-record-level-v27-carcinogens-general-intern (revision 086291e05ee17c87fb3933075d1d57680acb2c3c) |
| Fecha de creacion | 2026-09-23 |
| Fecha de actualizacion | 2026-09-23 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar el modelo base y la etiqueta `qwen3` del repositorio. Se trata, por tanto, de un transformer decoder-only heredado de `jiosephlee/Intern-S1-mini-lm`, al que se ha aplicado un fine-tuning específico para la tarea de transferencia de ensayos a nivel de registro. No se documentan innovaciones arquitectónicas propias: la adaptación es de pesos, no estructural.

El entrenamiento se realizó con la siguiente configuración, según la información proporcionada: 10 épocas programadas, tamaño de batch por dispositivo de 4, acumulación de gradiente de 4, 8 GPUs, FlashAttention-2, empaquetado *padding-free* con BFD y pérdida de objetivos suaves (*soft-target loss*). El checkpoint final se seleccionó en el paso 500 utilizando la métrica conjunta ID/OOD `knn_regression_id_ood_level_macro_mae_at_3`, y el proceso se detuvo una vez preservado el mejor checkpoint. El modelo resultante se corresponde exactamente con ese mejor checkpoint. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su identificador.

## Capacidades

- Generación de texto con `transformers` y `trust_remote_code=True` (el repositorio incluye una implementación de tokenizer propia).
- Modelado de la tarea de transferencia de ensayos (*assay transfer*) a nivel de registro para el conjunto de carcinógenos en grado 24.
- Regresión sobre niveles de actividad o toxicidad, con salidas evaluadas mediante MAE macro.
- Ranking de compuestos: el modelo se evalúa con métricas de ordenación (Spearman, Spearman@3, Top-1@3).
- Aprendizaje sobre objetivos suaves, lo que permite representar incertidumbre en las etiquetas de ensayo.
- Capacidad conversacional declarada en los tags del repositorio (`conversational`), heredada del modelo base.
- Compatibilidad con Text Generation Inference (TGI) y con endpoints, según los tags `text-generation-inference` y `endpoints_compatible`.
- Soporte de cuantización: no documentado.
- Multilingüismo: no disponible.
- Capacidades de visión, audio o *tool calling*: no documentadas.

## Casos de uso

- Priorización de compuestos en cribado toxicológico: el modelo asigna una estimación de carcinogenicidad por registro, lo que permite ordenar listas de candidatos y concentrar los ensayos experimentales en los compuestos con mayor riesgo potencial.

- Transferencia entre ensayos heterogéneos: dado que la tarea es de *assay transfer*, resulta adecuado para extrapolar resultados de un panel de ensayos a otro con cobertura incompleta, un escenario frecuente cuando distintas campañas experimentales miden endpoints diferentes.

- Enriquecimiento de bases de datos internas de toxicidad: se puede ejecutar el modelo sobre registros históricos para generar predicciones que completen campos vacíos de carcinogenicidad, siempre que se validen contra el panel OOD del propio dominio.

- Filtrado previo en pipelines de descubrimiento de fármacos: integrado tras la generación de moléculas candidatas, permite descartar compuestos con predicción desfavorable antes de las fases de síntesis y ensayo.

- Análisis de series químicas y estudios de relación estructura-actividad: el ranking generado ayuda a identificar tendencias dentro de familias de compuestos y a formular hipótesis sobre subestructuras problemáticas.

- Evaluación comparativa de representaciones químicas: sirve como referencia aprendida frente a baselines como las huellas de Morgan, útil para investigar si un modelo de lenguaje aporta ventaja sobre descriptores clásicos en una tarea concreta.

- Investigación metodológica en *transfer learning* químico: al estar publicado el dataset, la revisión y las métricas, es reutilizable como punto de partida para estudiar selección de checkpoints, pérdidas de objetivos suaves y evaluación ID/OOD en química.

## Benchmarks y rendimiento

Resultados en el panel de test conjunto ID/OOD. En MAE, menor es mejor; en Spearman y Top-1@3, mayor es mejor.

| Metodo | Macro MAE@3 | Macro MAE@5 | Spearman | Spearman@3 | Top-1@3 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Este modelo | 0.5587 | 0.5541 | 0.4197 | -0.0286 | 0.1438 |
| Morgan fingerprint (vanilla) | 0.8142 | 0.8046 | -0.0211 | 0.0506 | 0.0771 |
| Morgan fingerprint (weighted) | 0.7630 | 0.7327 | -0.0177 | 0.0095 | 0.0685 |

Metrica de validacion declarada: `Carcinogens/degree24/overall/knn_regression_id_ood_level_macro_mae_at_3` = 0,8675038371 (checkpoint del paso 500).

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16/BF16, el modelo de 8,2 B ocupa aproximadamente 16,4 GB solo en pesos, por lo que se recomienda un mínimo de 20-24 GB de VRAM contando caché de activaciones y del tokenizer.
- En cuantización de 8 bits, la huella de pesos baja a unos 8-9 GB; en 4 bits, a unos 4-5 GB, aunque no se documentan cuantizaciones oficiales para este repositorio.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o A6000 para despliegue en producción. El entrenamiento reportado usó 8 GPUs.
- Compatibilidad con GPU de consumo: sí es viable en RTX 4090 y RTX 3090 (24 GB) en FP16, y en GPUs de 12-16 GB si se aplica cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; los tags del repositorio indican compatibilidad con Text Generation Inference (TGI) y con endpoints. No se distribuyen pesos GGUF, por lo que Ollama o llama.cpp requerirían una conversión previa no documentada.
- Latencia y throughput: no disponibles. El repositorio no incluye mediciones de rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Macro MAE@3) | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| Este modelo (ajuste de Intern-S1-mini) | 8,2 B | No disponible | 0.5587 | No disponible | HuggingFace (0 descargas) |
| Morgan fingerprint (vanilla) | No aplica (descriptor) | No aplica | 0.8142 | No aplica | Ampliamente disponible en RDKit |
| Morgan fingerprint (weighted) | No aplica (descriptor) | No aplica | 0.7630 | No aplica | Ampliamente disponible en RDKit |
| Modelo base `jiosephlee/Intern-S1-mini-lm` | No disponible | No disponible | No disponible | No disponible | HuggingFace |

Comparar con otros modelos de lenguaje químicos de la misma categoría no es posible con la información disponible: no se aportan referencias a alternativas como ChemLLM, ChemCrow o modelos similares, ni sus métricas en este mismo panel.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada, no se puede asumir permiso para uso comercial ni para redistribución; es imprescindible contactar con el autor antes de cualquier explotación.
- Idiomas no declarados: el comportamiento multilingüe es desconocido y, dado el carácter especializado del ajuste, es probable que el modelo no esté optimizado para conversación general en castellano.
- Especialización extrema: está entrenado para una única tarea (transferencia de ensayos de carcinógenos en grado 24). Su uso fuera de ese dominio no está validado y probablemente degrade de forma acusada.
- Riesgo de alucinación: como modelo de lenguaje, puede generar salidas plausibles pero incorrectas; en un contexto toxicológico esto es crítico y exige validación experimental y revisión humana.
- Métricas de ordenación débiles: el Spearman global de 0,4197 es moderado y el Spearman@3 es negativo (-0,0286), lo que indica que el ranking en la cabeza de la lista no es fiable. El Top-1@3 de 0,1438 es bajo en términos absolutos.
- Sesgos del dataset: el comportamiento del modelo hereda los sesgos y la cobertura del dataset `assay-transfer-record-level-v27-carcinogens-general-intern`, cuya composición no se detalla.
- Selección de checkpoint por una única métrica: el modelo se eligió con una métrica compuesta (MAE macro ID/OOD), de modo que puede estar sobreajustado a ese criterio y no ser óptimo para otras métricas.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el manejo de entradas largas.
- Requiere `trust_remote_code=True`: esto implica ejecutar código del repositorio, lo que supone un riesgo de seguridad si no se audita previamente.
- Sin adopción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-assay-transfer-record-level-v27-carcinogens-general-best
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Dataset de entrenamiento: https://huggingface.co/datasets/jiosephlee/assay-transfer-record-level-v27-carcinogens-general-intern
- Registro de evaluacion en Weights & Biases: https://wandb.ai/upenn-ml/record-level-assay-transfer/runs/u6xygnza

Nota: los resultados de la busqueda web proporcionados corresponden a contenidos sobre cortes de pelo y no guardan relacion con este modelo, por lo que se han descartado.
