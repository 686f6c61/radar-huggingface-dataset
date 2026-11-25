# cowco/Qwen3.5-2B-Base-MED

## Resumen

Qwen3.5-2B-Base-MED es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario cowco. Se trata de un ajuste fino supervisado (SFT, mediante la librería TRL) sobre una base de la familia Qwen3.5, con aproximadamente 2.213 millones de parámetros (2,2 B) y un tamaño de repositorio de 4,4 GB en formato safetensors. El pipeline declarado en el Hub es image-text-to-text, lo que indica que acepta entradas de imagen y texto y genera texto.

La información pública es muy escasa: la model card es la plantilla automática de transformers sin completar, no se declara licencia, idiomas, composición del dataset de entrenamiento ni resultados de evaluación. El sufijo "MED" sugiere un ajuste orientado a dominio médico, pero no hay documentación que lo confirme. Por tanto, esta ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

Su relevancia actual es limitada y condicionada: es un modelo pequeño (2,2 B) que podría desplegarse en hardware de consumo, pero la ausencia de licencia, de evaluación y de documentación lo hace inadecuado para producción sin una validación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 2.213.241.664 (2,2 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; no se publican GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El tag `qwen3_5` y el pipeline `image-text-to-text` indican una arquitectura transformer multimodal de la familia Qwen3.5, con un total de 2.213.241.664 parámetros. No se especifica el número de capas, dimensión oculta, mecanismo de atención, tipo de encoder visual ni longitud de contexto. El repositorio ocupa 4,4 GB, coherente con pesos en precisión de 16 bits para ese número de parámetros.

El entrenamiento declarado es un ajuste fino supervisado (SFT) realizado con TRL, según los tags `trl` y `sft`. No se publica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF/DPO, hiperparámetros, régimen de precisión ni el checkpoint base exacto desde el que se partió. Tampoco se documentan innovaciones técnicas (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto condicionada por imagen y texto, según el pipeline `image-text-to-text` declarado en el Hub.
- Conversación multi-turno: el tag `conversational` sugiere un formato de chat, aunque no se detalla la plantilla aplicada.
- Ajuste fino supervisado sobre una base Qwen3.5, presumiblemente para un dominio concreto (el sufijo "MED" apunta a medicina, sin confirmación documental).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes clínicos experimentales: dado el sufijo "MED" y la entrada image-text-to-text, podría emplearse para probar flujos de pregunta-respuesta sobre imágenes médicas en entornos de investigación, siempre con validación humana y sin uso clínico directo.
- Extracción de información de documentos escaneados: al aceptar imagen y texto, encaja en pipelines de OCR semántico o resumen de informes, aunque la ausencia de evaluación impide garantizar precisión.
- Experimentación académica con SFT multimodal: sirve como checkpoint de partida para estudiar el efecto de ajustes supervisados sobre una base Qwen3.5 de 2,2 B en un dominio vertical.
- Despliegue en hardware de consumo para demos: con 2,2 B de parámetros y 4,4 GB de pesos, cabe en GPUs de gama alta de consumo para pruebas locales de inferencia multimodal.
- Generación de descripciones de imágenes en castellano u otros idiomas: viable solo si se valida previamente la calidad multilingüe, que no está documentada.
- Base para comparativas de ajuste fino: útil como referencia en estudios que comparen checkpoints SFT pequeños frente a sus bases originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 4,4 GB solo para pesos, más overhead de activaciones y del encoder visual; en cuantización de 8 bits, en torno a 2,2-2,5 GB; en 4 bits, alrededor de 1,2-1,5 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: para bf16, una GPU con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, L4); para cuantización de 4 bits, GPUs de 6-8 GB.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, siempre que el soporte de la arquitectura `qwen3_5` esté disponible en la versión de transformers utilizada.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama solo si existe soporte para la arquitectura y pesos convertidos, que no se publican en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cowco/Qwen3.5-2B-Base-MED | 2,2 B | no disponible | Sí (image-text-to-text) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B-Instruct | 3 B aprox. | no disponible en esta ficha | Sí | no disponible en esta ficha | Hugging Face (oficial Qwen) |
| SmolVLM-2B | 2 B aprox. | no disponible en esta ficha | Sí | no disponible en esta ficha | Hugging Face (oficial Hugging Face) |

La comparativa se limita a la categoría (modelos multimodales pequeños de 2-3 B). No hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa; los modelos alternativos se citan solo por categoria y tamano, sin cifras verificadas en esta ficha.

## Limitaciones y advertencias

- Model card automática sin completar: no hay información sobre sesgos, datos de entrenamiento ni evaluación.
- Licencia no declarada: no se puede asumir uso comercial permitido; es un riesgo legal directo para producción.
- Riesgo de alucinación no cuantificado: al ser un ajuste SFT de dominio (presuntamente médico), las alucinaciones en contextos clínicos serían especialmente peligrosas.
- Sin benchmarks publicados: imposible estimar calidad frente a la base Qwen3.5 original o frente a alternativas.
- Idiomas no declarados: no se garantiza un rendimiento aceptable en castellano.
- Contexto no documentado: no se puede planificar su uso en tareas de contexto largo.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- El sufijo "MED" no está respaldado por documentación; cualquier uso en ámbito sanitario requiere validación clínica independiente y supervisión humana.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cowco/Qwen3.5-2B-Base-MED
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact#compute
