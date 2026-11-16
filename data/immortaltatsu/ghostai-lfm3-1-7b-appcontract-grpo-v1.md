# immortaltatsu/ghostai-lfm3-1.7b-appcontract-grpo-v1

## Resumen

GhostAI LFM3-1.7B AppContract GRPO v1 es un ajuste fino del modelo base LFM3 de 1.700 millones de parámetros, publicado por el usuario immortaltatsu en Hugging Face. El modelo se ha entrenado mediante GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo introducida en DeepSeekMath, utilizando la librería TRL de Hugging Face. El nombre del repositorio sugiere un ajuste orientado a contratos de aplicación o interfaces de aplicaciones, aunque la model card no documenta el conjunto de datos ni el objetivo concreto del entrenamiento.

El modelo base pertenece a la familia LFM3 (Liquid Foundation Models), si bien la model card no identifica explícitamente el checkpoint de partida ni el desarrollador original. Con 1.728.801.536 parámetros reales según los pesos en safetensors, se sitúa en la categoría de modelos pequeños, aptos para inferencia en hardware de consumo. El repositorio ocupa 3,5 GB, lo que corresponde a pesos en precisión de 16 bits.

La relevancia de esta ficha es limitada: se trata de un modelo recién publicado, sin descargas ni valoraciones, sin licencia declarada, sin idiomas especificados y sin benchmarks. Cualquier evaluación en producción debería tratarlo como un experimento comunitario no validado y verificar su comportamiento empíricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3; detalles no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license", sin concretar) |
| Formato de pesos | safetensors |
| Libreria | transformers (con custom_code) |
| Framework de entrenamiento | TRL 1.16.0, Transformers 5.20.2, PyTorch 2.7.0, Datasets 5.1.0, Tokenizers 0.23.3 |
| Metodo de ajuste | GRPO (arXiv:2402.03300) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base LFM3 de 1.700 millones de parámetros, presumiblemente un transformer decoder-only, aunque la model card no aporta detalles sobre atención, normalización ni positional encoding. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True` en Transformers. No se documenta el número de tokens de entrenamiento del modelo base ni la composición del corpus.

El ajuste fino se realizó con GRPO mediante TRL. GRPO es un algoritmo de optimización de política que estima la ventaja de cada respuesta comparándola con un grupo de respuestas muestreadas para la misma consulta, eliminando la necesidad de un modelo crítico separado. La model card no especifica la función de recompensa, el tamaño del conjunto de datos de preferencias, el número de pasos ni los hiperparámetros del entrenamiento, por lo que no es posible reproducir el proceso ni evaluar su calidad a partir de la documentación. Tampoco se indica si hubo SFT previo al GRPO.

## Capacidades

- Generación de texto conversacional: el pipeline de ejemplo usa el formato de chat con roles (`user`), lo que indica que el modelo espera plantillas conversacionales.
- Ajuste orientado a "app contracts": por el nombre del repositorio, se intuye un entrenamiento para tareas de contratos o interfaces de aplicaciones, pero no se documenta qué comportamiento concreto se optimizó.
- Razonamiento por refuerzo: el uso de GRPO sugiere un entrenamiento orientado a mejorar la calidad de las respuestas mediante recompensas, típicamente en dominios de razonamiento o matemáticas.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales ligeros: con 1,7 mil millones de parámetros, el modelo puede ejecutarse en una GPU de consumo y servir como base para experimentar con pipelines de chat antes de escalar a modelos mayores.
- Investigación sobre GRPO: el repositorio permite inspeccionar un ajuste fino real con TRL y GRPO sobre un modelo pequeño, útil para estudiar el efecto del refuerzo en modelos de esta escala.
- Experimentos de alineación con recompensas personalizadas: sirve como punto de partida para reentrenar con GRPO sobre dominios específicos, dado que el pipeline de TRL es reproducible.
- Evaluación de modelos comunitarios en entornos controlados: adecuado para pruebas internas de calidad conversacional, siempre que se valide su comportamiento empíricamente antes de cualquier uso externo.
- Despliegue en entornos con recursos limitados: al caber en GPUs de 8-16 GB en cuantización de 8 o 4 bits, puede integrarse en demos locales o entornos de desarrollo sin infraestructura dedicada.
- Generación de borradores en tareas de contrato o especificación de aplicaciones: si el ajuste funciona como sugiere el nombre, podría asistir en la redacción de borradores de contratos de API o interfaces, aunque sin benchmarks que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 7 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (obligatorio por el código personalizado); vLLM y TGI solo si el código personalizado es compatible, lo cual no se ha verificado; llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GhostAI LFM3-1.7B AppContract GRPO v1 | 1,73 B | no disponible | no disponible | Hugging Face, sin descargas |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente validado |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | Hugging Face, con benchmarks publicados |
| Llama 3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente validado |

La comparación es estructural: los tres modelos alternativos tienen licencias claras, contextos documentados y evaluaciones publicadas, mientras que el modelo objeto de esta ficha carece de todos esos datos. No se dispone de comparación de rendimiento por ausencia de benchmarks.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no puede recomendarse para producción sin una evaluación propia.
- Licencia no especificada: la model card indica "licence: license" sin concretar; el uso comercial es jurídicamente incierto.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de ningún otro idioma concreto.
- Contexto desconocido: sin longitud de ventana documentada, el diseño de aplicaciones con contexto largo es arriesgado.
- Riesgo de alucinación: inherente a modelos de 1,7 B; el ajuste con GRPO no garantiza fidelidad factual.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; debe auditarse antes de usarlo en entornos sensibles.
- Modelo sin tracción: cero descargas y cero valoraciones en el momento de la ficha; no hay comunidad que haya validado su comportamiento.
- Procedencia del modelo base no documentada: la model card enlaza a "None" como modelo base, lo que impide rastrear la cadena de licencias y datos de entrenamiento.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible anticipar sesgos de género, idioma o dominio.

## Enlaces

- Hugging Face: https://huggingface.co/immortaltatsu/ghostai-lfm3-1.7b-appcontract-grpo-v1
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
