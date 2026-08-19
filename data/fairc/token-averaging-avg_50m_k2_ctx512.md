# FAIRC/token-averaging-avg_50m_k2_ctx512

## Resumen

El modelo `FAIRC/token-averaging-avg_50m_k2_ctx512` es un checkpoint de investigación publicado por la organización FAIRC como parte del proyecto de código abierto `cyai/llm-token-averaging`. Este proyecto explora una hipótesis concreta: si los embeddings de tokens son redundantes en ventanas pequeñas, promediar k tokens consecutivos en uno solo reduce la longitud efectiva de la secuencia a la mitad (o más) sin modificar la arquitectura del modelo, lo que podría aumentar la longitud de contexto efectiva de forma económica.

Se trata de un transformer pequeño de aproximadamente 50,9 millones de parámetros, con una ventana de contexto de 512 tokens y un factor de promediado `k=2`. El checkpoint se publica como un volcado de pesos en formato PyTorch (`final.pt`), acompañado de un log de pérdidas (`loss_log.csv`) y un archivo de configuración. No está pensado como un modelo listo para producción, sino como una pieza para reproducir experimentos académicos sobre compresión de contexto mediante promediado de tokens.

La relevancia actual de este modelo radica en su contribución al debate sobre cómo extender la longitud de contexto en LLMs sin aumentar el coste computacional de forma cuadrática. Aunque es un modelo diminuto comparado con los LLMs actuales, sirve como banco de pruebas para validar estrategias de reducción de secuencia que podrían escalar a modelos más grandes. La ausencia de licencia explícita y de documentación de rendimiento limita su uso fuera del ámbito investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con promediado de tokens (averaging_k=2) |
| Parametros totales | 50.897.408 (aprox. 50,9 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (efectiva tras promediado: 256 tokens procesados) |
| Tipos de cuantizacion | no disponible (solo pesos en fp32 de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`), no compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con `d_model=512`, 8 capas y 8 cabezas de atención, con embeddings atados (`tie_embeddings=true`). La innovación clave es el módulo de promediado de tokens: antes de la atención, se agrupan `k=2` tokens consecutivos y se promedian sus embeddings, reduciendo la secuencia a la mitad. Esto permite que el modelo procese 512 tokens de entrada pero con una representación interna de solo 256 posiciones, lo que reduce el coste de atención de O(n²) a O((n/k)²). El resto de la arquitectura permanece inalterada.

El entrenamiento se realizó con un objetivo de 2.036 millones de tokens, una tasa de aprendizaje de 0.0002 y 2000 pasos de calentamiento. No se menciona el uso de RLHF, DPO ni ningún otro método de alineación. El checkpoint incluye el paso de entrenamiento, el número de tokens vistos y los FLOPs acumulados, lo que permite reproducir el experimento y comparar curvas de pérdida. El proyecto `cyai/llm-token-averaging` define cinco estrategias de promediado distintas, de las cuales este modelo corresponde a la variante `avg` (promedio simple) con `k=2`.

## Capacidades

- Generacion de texto basica: al ser un modelo de 50M parametros entrenado en 2B tokens, es capaz de producir texto coherente a corto plazo, pero con limitaciones evidentes de conocimiento y razonamiento.
- Compresion de contexto: su capacidad principal es experimental, demostrando que el promediado de tokens puede mantener la coherencia semantica con la mitad de posiciones.
- Sin tool calling ni function calling: no se ha documentado soporte para estas capacidades.
- Sin capacidades multimodales: solo texto.
- Sin modo de razonamiento explicito: no se menciona ningun mecanismo de thinking mode.
- Multilingue: no hay informacion sobre idiomas; probablemente entrenado mayoritariamente en ingles por ser un proyecto de investigacion generico.

## Casos de uso

- Investigacion academica sobre compresion de contexto: el modelo sirve para estudiar como el promediado de tokens afecta a la perplejidad y a la capacidad de recuperar informacion en secuencias largas. Los investigadores pueden cargar el checkpoint y ejecutar sus propias evaluaciones comparando con un modelo baseline sin promediado.
- Ablacion de estrategias de promediado: el repositorio `cyai/llm-token-averaging` incluye cinco estrategias; este checkpoint concreto (promedio simple, k=2) permite aislar el efecto de esa variante especifica frente a otras (por ejemplo, promediado ponderado o con salto).
- Analisis de redundancia de embeddings: al promediar tokens adyacentes, se puede medir cuanta informacion se pierde y si los embeddings de tokens cercanos son realmente redundantes, lo que informa el diseno de arquitecturas mas eficientes.
- Pruebas de extrapolacion de contexto: aunque el contexto de entrenamiento es 512, se puede evaluar si el modelo generaliza a secuencias mas largas gracias a la compresion interna, un tema relevante para la extension de ventana en LLMs.
- Reproduccion de experimentos publicados: el checkpoint incluye logs de perdida y configuracion completa, permitiendo verificar los resultados del paper o informe tecnico asociado al proyecto.
- Desarrollo de tecnicas de eficiencia para edge devices: aunque el modelo es pequeno, los principios de promediado de tokens podrian aplicarse a modelos mas grandes en entornos con memoria limitada; este checkpoint sirve como punto de partida para prototipar esas tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no incluye evaluaciones estandar como MMLU, HumanEval o GSM8K. La unica metrica disponible es el log de perdida de entrenamiento (`loss_log.csv`), que no se ha analizado en esta ficha.

## Requisitos de hardware

- VRAM estimada: aproximadamente 200 MB en fp32 (50,9M parametros × 4 bytes), mas overhead de activaciones para contexto 512. Cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060 o superiores. No requiere GPU profesional.
- Compatible con consumer GPU: si, sin ninguna restriccion.
- Opciones de despliegue: al no ser un modelo de `transformers`, no es compatible directamente con vLLM, Ollama o TGI. Requiere cargar el `state_dict` manualmente con PyTorch y reconstruir la arquitectura a partir de `config.json` o del codigo fuente en el repositorio `cyai/llm-token-averaging`.
- Latencia y throughput: no hay datos publicados. Dado el tamano, la inferencia es inmediata en GPU (del orden de milisegundos por token) y viable en CPU (decenas de ms por token).

## Comparativa con modelos similares

No se dispone de modelos directamente comparables con la misma tecnica de promediado de tokens. Como referencia de tamano, se podrian citar modelos como Pythia-70M (70M parametros, contexto 2048) o GPT-2 small (124M, contexto 1024), pero no existen datos de rendimiento de este modelo para establecer una comparacion cuantitativa. La comparativa queda limitada a diferencias arquitectonicas:

| Modelo | Parametros | Contexto | Tecnica de compresion | Licencia |
|---|---|---|---|---|
| FAIRC/token-averaging-avg_50m_k2_ctx512 | 50,9 M | 512 (256 efectivos) | Promediado de tokens (k=2) | no disponible |
| Pythia-70M (EleutherAI) | 70 M | 2048 | Ninguna | Apache 2.0 |
| GPT-2 small (OpenAI) | 124 M | 1024 | Ninguna | MIT |

## Limitaciones y advertencias

- No es un modelo listo para produccion: se trata de un checkpoint de investigacion sin fine-tuning ni alineacion. No debe usarse en aplicaciones reales.
- Licencia no especificada: el repositorio no indica ninguna licencia, lo que genera incertidumbre legal sobre su uso, incluso para fines academicos. Se recomienda contactar con los autores antes de cualquier uso.
- Riesgo de alucinacion alto: por su tamano reducido y entrenamiento limitado, el modelo puede generar contenido inventado o incoherente en tareas complejas.
- Sesgos desconocidos: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que los sesgos potenciales no pueden evaluarse.
- Contexto limitado: la ventana de 512 tokens es muy corta para aplicaciones reales; el promediado reduce aun mas la informacion posicional, lo que puede degradar la comprension de relaciones de largo alcance.
- Formato propietario: los pesos no son compatibles con el ecosistema HuggingFace `transformers`, lo que dificulta su integracion en pipelines estandar.
- Sin soporte de cuantizacion: no se proporcionan versiones GGUF, safetensors ni cuantizadas, limitando su uso en entornos con restricciones de memoria.

## Enlaces

- HuggingFace: https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_ctx512
- Repositorio GitHub del proyecto: https://github.com/cyai/llm-token-averaging
- Modelo relacionado (misma serie, sin weight exponent): https://huggingface.co/FAIRC/token-averaging-avg_50m_k2
- Modelo relacionado (con weight exponent): https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_wexp
