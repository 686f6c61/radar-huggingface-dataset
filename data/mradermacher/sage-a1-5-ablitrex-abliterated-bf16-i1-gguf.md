# mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF

## Resumen

Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16. Se trata de un modelo de lenguaje de aproximadamente 34.660 millones de parámetros (34,66 B), derivado a su vez de un modelo base sometido a un proceso de "abliteration", una técnica de modificación de pesos que elimina o atenúa los mecanismos de rechazo aprendidos durante el alineamiento, de modo que el modelo responde a peticiones que un modelo alineado convencional rechazaría.

El repositorio no contiene el modelo original en precisión completa, sino un conjunto de ficheros GGUF cuantizados con la técnica i1 (imatrix) de mradermacher, que emplea una matriz de importancia para preservar mejor la calidad en cada nivel de compresión. Los cuantizados van desde IQ1_S (7,6 GB) hasta Q6_K (28,6 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo con 24 GB o más.

La relevancia de esta ficha radica en que documenta una variante "abliterated" de un modelo de ~35 B, un tamaño que en 2026 resulta manejable en GPUs de consumo mediante cuantización agresiva, pero que requiere advertencias claras sobre sesgos, alucinación y ausencia de salvaguardas. La licencia MIT del modelo base facilita su uso comercial, si bien el proceso de abliteration elimina parte de las protecciones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, derivado de mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; también disponible la matriz de importancia (imatrix) suelta |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en BF16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16 en la documentación proporcionada. Por el número de parámetros (34,66 B) y la nomenclatura, se trata de un transformer denso de gran tamaño, pero no se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa.

El proceso de "abliteration" aplicado al modelo base consiste en identificar las direcciones en el espacio de activaciones asociadas a la negativa a responder y proyectar los pesos para eliminar esa dirección, lo que produce un modelo que responde a un espectro más amplio de peticiones. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original. Las cuantizaciones i1 de mradermacher emplean una matriz de importancia (imatrix) calculada sobre un corpus de calibración para mejorar la fidelidad de los pesos cuantizados respecto al modelo BF16 original.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado del modelo base.
- Generación de código y tareas de escritura técnica (capacidad esperable en un modelo de ~35 B, aunque no verificada con benchmarks).
- Respuesta a peticiones que los modelos alineados convencionalmente rechazan, debido al proceso de abliteration.
- Capacidades multilingües limitadas: la model card declara únicamente inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo el proceso de abliteration altera la distribución de respuestas y los mecanismos de rechazo, comparándolo con el modelo base alineado en experimentos controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles y que un modelo alineado rechazaría, en entornos de investigación o creación de contenido para adultos.
- Despliegue local en GPU de consumo: con el cuantizado IQ4_XS (18,8 GB) o Q4_K_M (21,3 GB) el modelo cabe en una RTX 4090 de 24 GB, permitiendo inferencia privada sin conexión a servicios en la nube.
- Experimentación con cuantización: la disponibilidad de 23 niveles de cuantización i1 permite medir empíricamente la degradación de calidad frente al tamaño de fichero, útil para estudios de compresión de modelos.
- Fine-tuning posterior sobre el modelo BF16 base: al ser un modelo de ~35 B con licencia MIT, puede servir como punto de partida para ajuste fino en dominios especializados (legal, médico, técnico) sin restricciones de licencia comercial.
- Evaluación comparativa de técnicas de abliteration: comparar esta variante con otras versiones abliterated del mismo modelo base para cuantificar el impacto en benchmarks de razonamiento y en la tasa de rechazo.
- Prototipado de asistentes conversacionales en inglés: gracias a su tamaño y a la disponibilidad de cuantizados ligeros (Q3_K_M, 16,9 GB), puede ejecutarse en estaciones de trabajo con una sola GPU para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el overhead de contexto. Los cuantizados van de 7,6 GB (IQ1_S) a 28,6 GB (Q6_K).
- Cuantizados ligeros (IQ1_S a IQ2_M, 7,6–11,8 GB): caben en GPUs de 12 GB como la RTX 3060 o la RTX 4070, con calidad muy degradada.
- Cuantizados medios (IQ3_XXS a IQ4_XS, 13,7–18,8 GB): caben en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) y en 24 GB con margen para contexto.
- Cuantizados altos (Q4_K_M a Q6_K, 21,3–28,6 GB): requieren 24 GB (RTX 4090) para Q4_K_M y Q5_K_M; Q6_K (28,6 GB) no cabe en 24 GB y requiere GPUs de 32 GB o más (A100 40 GB, H100, RTX 5090 si dispone de suficiente VRAM).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; A100 40 GB u H100 para Q6_K y para el modelo BF16 completo (que requiere ~70 GB).
- Despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no cargan GGUF de forma nativa para este tamaño sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF (este) | 34,66 B | no disponible | MIT | GGUF i1 (23 niveles) | Variante abliterated cuantizada por mradermacher |
| mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16 | 34,66 B | no disponible | MIT | BF16 (safetensors) | Modelo base del que derivan estas cuantizaciones |
| mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-GGUF | 34,66 B | no disponible | MIT | GGUF estático | Cuantizaciones estáticas (sin imatrix) del mismo modelo base |

No se dispone de información sobre otros modelos comparables de la misma categoría (abliterated, ~35 B) en la documentación proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina o atenúa los mecanismos de rechazo del modelo base, por lo que puede generar contenido dañino, ilegal o éticamente problemático sin las salvaguardas habituales. No es apto para despliegues orientados al público sin moderación externa.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual para este modelo ni para su base.
- Sesgos conocidos: no documentados en la información disponible, pero heredados del corpus de entrenamiento del modelo base, no especificado.
- Limitación de idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente el límite efectivo.
- Los cuantizados por debajo de Q3 (especialmente IQ1 e IQ2) presentan degradación de calidad significativa; la propia model card advierte de que IQ1_S es "para desesperados" y Q2_K_S es de "calidad muy baja".
- Licencia MIT: permite uso comercial, pero el usuario asume toda la responsabilidad legal y ética sobre las salidas del modelo.
- El repositorio ocupa 371 GB en total; descargar todos los cuantizados no es práctico. Se recomienda descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones i1: https://huggingface.co/mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF
- Modelo base: https://huggingface.co/mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-GGUF
- Página de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
