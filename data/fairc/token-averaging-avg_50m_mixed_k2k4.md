# FAIRC/token-averaging-avg_50m_mixed_k2k4

## Resumen

El modelo `FAIRC/token-averaging-avg_50m_mixed_k2k4` es un checkpoint de investigacion publicado por FAIRC dentro del proyecto **llm-token-averaging**, cuyo objetivo es estudiar si el promediado de tokens adyacentes puede reducir la longitud efectiva de secuencia en modelos de lenguaje sin perdida significativa de informacion. La hipotesis central es que los embeddings de lenguaje son redundantes en pequenas ventanas, por lo que promediar k tokens consecutivos en uno solo permite multiplicar el contexto efectivo por k manteniendo la arquitectura inalterada.

Se trata de un modelo transformer pequeno, con aproximadamente 50,9 millones de parametros, una ventana de contexto de 1024 tokens y una estrategia de promediado mixta denominada `mixed_k2k4` (con k=3). El checkpoint se publica como un volcado de pesos en formato PyTorch (`final.pt`), no como pesos compatibles con Hugging Face `transformers`. Su relevancia es puramente academica: proporciona datos empiricos sobre la redundancia de embeddings y el impacto del token averaging en el rendimiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMAveraged / OLMTransformerBody) |
| Parametros totales | 50.897.408 (aprox. 50,9 M) |
| Parametros activos | no disponible |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en FP32/FP16, sin cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`final.pt`), no safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estandar con `d_model=512`, 8 cabezas de atencion y 8 capas. La innovacion principal reside en el **token averaging**: antes de alimentar el modelo, se promedian k tokens consecutivos en un unico vector, reduciendo la secuencia efectiva. En este checkpoint se utiliza una estrategia mixta `mixed_k2k4`, que combina diferentes valores de k (2 y 4) segun la posicion en la secuencia, con un `averaging_k` global de 3. Los embeddings estan atados (`tie_embeddings=true`).

Los datos de entrenamiento no se detallan en la informacion disponible, pero el objetivo declarado es procesar 3.054.000.000 tokens (segun `target_tokens` en la configuracion). No se menciona el uso de RLHF, DPO ni tecnicas de alineacion. El proyecto se enmarca en el repositorio `cyai/llm-token-averaging`, que analiza cinco estrategias de promediado distintas.

## Capacidades

- Generacion de texto basica: al ser un modelo de 50M de parametros, puede generar texto coherente en tareas simples, aunque sin la calidad de modelos de mayor tamano.
- Investigacion sobre redundancia de embeddings: su proposito principal es servir como banco de pruebas para estudiar el efecto del promediado de tokens en la longitud de contexto efectiva.
- Extension implicita de contexto: al promediar tokens, el modelo puede procesar secuencias de hasta 1024 * k tokens originales (en este caso, hasta 3072 tokens de entrada bruta), aunque la ventana interna siga siendo 1024.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Validacion empirica de la hipotesis de redundancia de embeddings: el modelo permite comparar el rendimiento con y sin promediado de tokens para cuantificar la perdida de informacion.
- Estudio de estrategias de compresion de contexto: investigadores pueden analizar como `mixed_k2k4` se comporta frente a otras estrategias (k fijo, k aprendible, etc.) en tareas de modelado de lenguaje.
- Evaluacion de la relacion coste-rendimiento: con solo 50M de parametros, sirve para probar hipotesis sobre escalado y eficiencia antes de aplicar la tecnica a modelos mayores.
- Desarrollo de metodos de aumento de contexto sin cambios arquitectonicos: el checkpoint demuestra un enfoque alternativo a la atencion lineal o a las ventanas deslizantes.
- Replicacion de experimentos academicos: al ser un artefacto de investigacion publico, permite reproducir los resultados del proyecto `llm-token-averaging` y verificar las conclusiones del paper asociado.
- Educacion en arquitecturas de modelos de lenguaje: su tamano reducido y su configuracion clara lo hacen util para ensenar conceptos de compresion de secuencias y diseno experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del proyecto puede contener metricas de perplejidad o accuracy, pero no se incluyen en la model card ni en los resultados de busqueda obtenidos.

## Requisitos de hardware

- VRAM estimada: con 50,9 M de parametros, el checkpoint en FP32 ocupa aproximadamente 204 MB (50,9 M * 4 bytes). Cabe en cualquier GPU moderna, incluso en GPUs integradas con mas de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, o incluso CPUs con suficiente RAM para inferencia en modo CPU).
- Despliegue: al no ser pesos de Hugging Face `transformers`, requiere cargar el `state_dict` manualmente con PyTorch y reconstruir la arquitectura desde `config.json` o desde el codigo fuente del repositorio. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 50M, la inferencia en GPU es casi instantanea (del orden de milisegundos por token), pero no hay datos oficiales.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables publicados con la misma tecnica de token averaging. Los modelos de tamano similar (por ejemplo, GPT-2 pequeño de 124M o modelos de 50M como los de la familia OLMo) no emplean esta estrategia de compresion de contexto, por lo que la comparacion directa carece de sentido. El modelo es un artefacto de investigacion unico en su categoria.

## Limitaciones y advertencias

- **No es un modelo de produccion**: se trata de un checkpoint de investigacion sin alineacion, sin fine-tuning para tareas especificas y sin garantias de calidad de generacion.
- **Formato de pesos no estandar**: los pesos estan en un volcado PyTorch (`final.pt`) que requiere reconstruccion manual de la arquitectura. No se puede cargar directamente con `transformers`, `safetensors` ni herramientas de inferencia habituales.
- **Licencia no especificada**: no se indica la licencia del modelo, por lo que su uso comercial o incluso academico podria tener restricciones legales. Se recomienda contactar con FAIRC antes de utilizarlo.
- **Idiomas no documentados**: no se especifica que idiomas soporta ni la composicion del corpus de entrenamiento. Es probable que el entrenamiento se haya realizado con datos en ingles, pero no es seguro.
- **Riesgo de alucinacion y sesgos**: al ser un modelo pequeno sin alineacion, puede generar contenido incoherente, repetitivo o sesgado. No se han realizado evaluaciones de sesgo ni de seguridad.
- **Contexto limitado**: aunque el promediado de tokens permite procesar secuencias mas largas, la ventana interna sigue siendo de 1024 tokens, y la tecnica puede degradar la calidad en tareas que requieren informacion posicional precisa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FAIRC/token-averaging-avg_50m_mixed_k2k4
- Repositorio del proyecto: https://github.com/cyai/llm-token-averaging
- Documentacion de metodos: https://github.com/cyai/llm-token-averaging/blob/main/docs/methods_overview.md
- Checkpoint relacionado (k4): https://huggingface.co/FAIRC/token-averaging-avg_50m_k4
- Checkpoint relacionado (k4 con posiciones aprendibles): https://huggingface.co/FAIRC/token-averaging-avg_50m_k4_learnable_pos
