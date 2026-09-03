# mradermacher/WorldReward-qwen35-9b-GGUF

## Resumen

WorldReward-qwen35-9b-GGUF es una cuantización en formato GGUF del modelo WorldReward-qwen35-9b, desarrollado originalmente por CodeGoat24 y cuantizado por mradermacher. El modelo base se presenta como un reward model y world model orientado a la generación de vídeo con control de cámara, según los tags publicados en su ficha de HuggingFace. Aunque la información pública sobre el modelo original es muy escasa, el nombre sugiere una arquitectura derivada de la familia Qwen 3.5 con aproximadamente 9 000 millones de parámetros.

Esta versión GGUF ofrece múltiples niveles de cuantización (desde Q2_K hasta f16) y además incluye proyectores multimodales (mmproj) en Q8_0 y f16, lo que indica que el modelo base probablemente acepta entradas visuales además de texto. Es relevante porque permite ejecutar un modelo de este tipo en hardware de consumo con cuantizaciones ligeras, aunque no hay documentación oficial sobre sus capacidades exactas ni su rendimiento.

La licencia es Apache 2.0, lo que facilita su uso comercial, y el idioma declarado es el inglés. Sin embargo, la ausencia de benchmarks y especificaciones detalladas limita la evaluación objetiva de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nombre sugiere derivado de Qwen3.5-9B, no confirmado) |
| Parametros totales | 8 953 803 264 (8,95 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con proyectores multimodales adicionales) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base WorldReward-qwen35-9b. Los tags de HuggingFace indican que se trata de un reward model y world model, lo que sugiere una arquitectura de transformer multimodal capaz de procesar tanto texto como imágenes o vídeo. El nombre "qwen35" apunta a una posible base en la familia Qwen 3.5, pero no hay confirmación oficial.

Tampoco se han publicado detalles sobre el proceso de entrenamiento, el volumen de datos, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF realizada por mradermacher es estática (sin imatrix) y no modifica la arquitectura, solo reduce la precisión de los pesos para facilitar la inferencia en hardware con menos memoria.

## Capacidades

- Generación de texto: presumiblemente sí, al ser un modelo de lenguaje, aunque no hay ejemplos públicos.
- Reward model: según los tags, el modelo puede puntuar o evaluar salidas, probablemente en el contexto de generación de vídeo.
- World model: orientado a modelar dinámicas del mundo, posiblemente para simulación o planificación.
- Generación de vídeo con control de cámara: es la función principal declarada, pero no se especifica si genera vídeo directamente o solo evalúa/guía la generación.
- Soporte multimodal: la presencia de ficheros mmproj indica que el modelo acepta entradas visuales (imágenes o vídeo) además de texto.
- Capacidades multilingües: solo se declara inglés.
- Tool calling, agentes, razonamiento avanzado: no hay información al respecto.

## Casos de uso

Dada la falta de documentación, los casos de uso son hipotéticos basados en los tags y el propósito declarado:

- Evaluación de calidad de generación de vídeo: como reward model, podría emplearse para puntuar la coherencia y el realismo de vídeos generados por otros modelos, integrándose en pipelines de entrenamiento con aprendizaje por refuerzo.
- Control de cámara en generación de vídeo: el modelo podría recibir una secuencia de imágenes y devolver acciones de cámara (pan, tilt, zoom) para guiar una generación posterior.
- Simulación de entornos para agentes: como world model, podría predecir el siguiente estado de una escena a partir de una acción, útil en robótica o videojuegos.
- Filtrado de datos para datasets de vídeo: usando sus capacidades de reward, se podrían seleccionar automáticamente los clips más adecuados para entrenar otros modelos.
- Investigación en modelos multimodales: su arquitectura de 9B y su licencia abierta permiten estudiar la interacción entre lenguaje y vídeo sin grandes recursos.
- Prototipado rápido en entornos académicos: las cuantizaciones ligeras (Q4_K_M, 5.7 GB) permiten experimentar en GPUs de consumo como la RTX 3090 o 4090.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe ninguna tabla de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos en la model card o en el repositorio.

## Requisitos de hardware

Los tamaños de archivo de las cuantizaciones permiten estimar la VRAM necesaria para cargar el modelo completo en memoria (el peso del archivo más overhead de inferencia):

- Q2_K (3,9 GB): puede ejecutarse en GPUs con 6 GB de VRAM (p. ej., RTX 2060, GTX 1660 Ti) usando llama.cpp con offloading parcial.
- Q4_K_M (5,7 GB): recomendado para GPUs de 8 GB o más (RTX 3070, RTX 4060, etc.).
- Q5_K_M (6,6 GB): requiere al menos 8-10 GB de VRAM.
- Q8_0 (9,6 GB): necesita 12 GB o más (RTX 3080, RTX 4070 Ti, etc.).
- f16 (18 GB): requiere GPUs de 24 GB (RTX 3090, RTX 4090, A5000) o inferencia en CPU con mucha RAM.

Los proyectores multimodales (mmproj) añaden entre 0,7 y 1,0 GB adicionales si se usan con entradas visuales.

Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. No se menciona compatibilidad con vLLM o TGI en la documentación, aunque podrían funcionar si se convierte a safetensors.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. No hay datos sobre modelos equivalentes en la misma categoría (reward models para vídeo con control de cámara) ni sobre el rendimiento relativo de WorldReward-qwen35-9b frente a alternativas. Se recomienda consultar la página del modelo base para futuras actualizaciones.

## Limitaciones y advertencias

- La falta de documentación técnica impide conocer sesgos, limitaciones de contexto o riesgos de alucinación específicos.
- Al ser una cuantización estática, la calidad puede degradarse respecto al modelo original, especialmente en los niveles más bajos (Q2_K, Q3_K_*).
- El modelo solo declara soporte para inglés, lo que limita su uso en otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, no hay garantías sobre el comportamiento del modelo en producción sin una evaluación previa.
- Los proyectores multimodales son necesarios para entradas visuales; sin ellos, el modelo podría no funcionar correctamente en tareas de vídeo.
- No se han publicado resultados de benchmarks, por lo que la calidad real es desconocida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WorldReward-qwen35-9b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/WorldReward-qwen35-9b
- Página de ayuda para GGUF de mradermacher: https://huggingface.co/mradermacher/model_requests
