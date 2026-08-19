# FAIRC/token-averaging-avg_50m_k2_v2

## Resumen

FAIRC/token-averaging-avg_50m_k2_v2 es un checkpoint de investigación del proyecto "token averaging" desarrollado por FAIRC. No se trata de un modelo de lenguaje listo para uso, sino de un volcado de pesos (`state_dict`) correspondiente a una arquitectura transformer experimental denominada `OLMAveraged` / `OLMTransformerBody`, con aproximadamente 50,9 millones de parámetros. El objetivo del proyecto es estudiar el efecto de promediar representaciones de tokens (con un factor `k=2`) durante el entrenamiento de modelos de lenguaje, una línea de investigación que busca alternativas a los mecanismos de atención estándar.

El checkpoint incluye los pesos finales del entrenamiento, junto con un registro de pérdidas (`loss_log.csv`), y está pensado para que otros investigadores puedan reproducir los experimentos o continuar el análisis. Su relevancia es estrictamente académica: no ofrece capacidades de generación de texto, razonamiento ni ninguna funcionalidad práctica inmediata. La arquitectura es un transformer denso de 8 capas, con `d_model=512`, 8 cabezas de atención y una ventana de contexto de 1024 tokens, entrenado sobre un objetivo de 2 mil millones de tokens (según el campo `target_tokens`). No se especifican los datos de entrenamiento ni el proceso de alineación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMAveraged / OLMTransformerBody (transformer denso con promediado de tokens, `averaging_k=2`) |
| Parametros totales | 50.897.408 (aproximado, según `n_params_approx`) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (los pesos se almacenan en formato PyTorch nativo, sin cuantizar) |
| Idiomas soportados | no disponible (no se especifica; el proyecto no documenta capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`), no compatible con `transformers` ni con formatos GGUF/safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer causal con 8 capas, `d_model=512`, 8 cabezas de atención y embeddings atados (`tie_embeddings=true`). La innovación principal es el mecanismo de "token averaging": durante el entrenamiento se promedian representaciones de tokens vecinos (con un factor `k=2`), lo que podría reducir la redundancia en las secuencias y mejorar la eficiencia de aprendizaje. El modelo se entrenó con una tasa de aprendizaje de `0.0002`, un calentamiento de 2000 pasos y un objetivo de 2 mil millones de tokens (`target_tokens`). No se proporciona información sobre el dataset utilizado, ni sobre técnicas de alineación como RLHF o DPO. El checkpoint guarda el paso de entrenamiento, el número de tokens vistos y los FLOPs acumulados, lo que permite auditar el proceso.

## Capacidades

- Generación de texto: no documentada; el checkpoint no incluye un tokenizador ni una interfaz de generación.
- Razonamiento, matemáticas o código: no aplicable; el modelo es un artefacto de investigación sin evaluación de capacidades.
- Tool calling / function calling: no soportado.
- Agentes o razonamiento multi-paso: no soportado.
- Multilingüismo: no especificado; no se puede determinar sin un tokenizador.
- Capacidades especiales: únicamente el mecanismo de promediado de tokens (`averaging_k=2`), que es el objeto de estudio del proyecto.

## Casos de uso

- Reproducción de experimentos de token averaging: los investigadores pueden cargar el checkpoint y reconstruir la arquitectura para verificar los resultados reportados en el proyecto.
- Análisis de dinámicas de entrenamiento: el `loss_log.csv` permite estudiar la evolución de la pérdida y compararla con otras variantes (por ejemplo, `k=4` o `k=2_wexp`).
- Comparación de estrategias de promediado: al existir otros checkpoints con diferentes valores de `k`, se puede analizar el impacto del factor de promediado en la convergencia.
- Estudio de representaciones internas: los pesos pueden usarse para inspeccionar cómo el promediado afecta a las activaciones de capas intermedias.
- Desarrollo de nuevas arquitecturas eficientes: los hallazgos pueden informar el diseño de modelos que reduzcan el coste computacional sin sacrificar rendimiento.
- Benchmarking de infraestructura de entrenamiento: al ser un modelo pequeño (50M), sirve para validar pipelines de entrenamiento o herramientas de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto no reporta métricas como MMLU, HumanEval o GSM8K, y no se dispone de comparaciones con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada: los pesos en precisión fp32 ocupan aproximadamente 204 MB (50.897.408 parámetros × 4 bytes). Cualquier GPU con al menos 1 GB de VRAM puede cargar el modelo.
- GPU recomendadas: no se requiere hardware especial; una GPU de gama media (por ejemplo, RTX 3060 o superior) es suficiente para cargar y evaluar el checkpoint.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna con soporte CUDA puede ejecutar el modelo.
- Opciones de despliegue: no aplicable para inferencia estándar; el checkpoint debe cargarse con PyTorch y la arquitectura debe reconstruirse manualmente. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al no ser un modelo de inferencia, no se han medido estos parámetros.

## Comparativa con modelos similares

El proyecto incluye otros checkpoints de la misma familia en Hugging Face, que son las únicas comparaciones directas disponibles:

| Modelo | Parámetros | Contexto | `averaging_k` | Notas |
|---|---|---|---|---|
| `FAIRC/token-averaging-avg_50m_k2_v2` | ~50,9M | 1024 | 2 | Checkpoint actual |
| `FAIRC/token-averaging-avg_50m_k4` | ~50,9M (presumiblemente) | 1024 (presumiblemente) | 4 | Variante con mayor factor de promediado |
| `FAIRC/token-averaging-avg_50m_k2_wexp` | ~50,9M (presumiblemente) | 1024 (presumiblemente) | 2 con expansión de pesos | Variante experimental |

No se dispone de información sobre otros modelos comparables fuera de esta familia, ya que el proyecto es específico y no se han publicado resultados que lo sitúen frente a modelos generalistas.

## Limitaciones y advertencias

- No es un modelo utilizable: carece de tokenizador, interfaz de generación y capacidades conversacionales. Solo sirve para investigación.
- Formato propietario: los pesos no son compatibles con `transformers`; es necesario reconstruir la arquitectura a partir de `config.json` o del código fuente del proyecto.
- Licencia no especificada: no se indica si el uso comercial está permitido; se recomienda contactar con los autores antes de cualquier uso fuera del ámbito académico.
- Sesgos y alucinaciones: no aplicables al no existir generación de texto.
- Datos de entrenamiento desconocidos: no se informa sobre la composición del corpus, lo que impide evaluar posibles sesgos.
- Sin soporte ni mantenimiento: al ser un checkpoint de investigación, no hay garantías de corrección ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_v2
- Variante con `k=4`: https://huggingface.co/FAIRC/token-averaging-avg_50m_k4
- Variante con `k=2_wexp`: https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_wexp
- Repositorio fuente del proyecto: no disponible (no se ha encontrado en la información proporcionada)
