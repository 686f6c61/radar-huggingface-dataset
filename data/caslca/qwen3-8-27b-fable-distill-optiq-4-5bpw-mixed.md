# caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed

## Resumen

Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed es una cuantización MLX de precisión mixta del modelo multimodal (VLM) de 27B desarrollado por TeichAI, denominado Qwen3.8-27B-Fable-Distill. El modelo base es un sistema imagen-texto de la familia Qwen3.5 destilado sobre los datasets armand0e/claude-fable-5-claude-code y armand0e/Fable-5-Chat. La cuantización ha sido realizada por el usuario caslca y se distribuye bajo licencia Apache 2.0.

Su objetivo principal es reducir los requisitos de memoria y acelerar la inferencia en dispositivos Apple Silicon manteniendo la calidad del modelo original. Para ello utiliza la técnica OptiQ de sensibilidad KL: 150 capas sensibles se elevan a 8 bits mientras que las 346 restantes permanecen en 4 bits, logrando 4.67 bits efectivos por peso y un peso de 18.44 GB para los shards de texto.

Es relevante porque sus evaluaciones internas muestran que la cuantización mixta produce resultados prácticamente idénticos a la versión uniforme de 4 bits en tareas de código (HumanEval+ y MBPP+), pero genera aproximadamente un tercio menos de tokens por tarea, lo que puede traducirse en menor latencia y menor coste de inferencia en aplicaciones conversacionales o de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen y texto); familia Qwen3.5; diseño interno no detallado en la información disponible |
| Parametros totales | 26 895 993 856 (26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible; el máximo de tokens de generación recomendado es 102 400 |
| Tipos de cuantizacion | MLX OptiQ de precisión mixta; histograma: 150 capas a 8 bits, 346 capas a 4 bits; 4,67 bits efectivos por peso |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (pesos empaquetados de baja precisión) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint TeichAI/Qwen3.8-27B-Fable-Distill. Se trata de un modelo multimodal (image-text-to-text) de la familia Qwen3.5 que, según los metadatos del repositorio, ha sido destilado a partir de un sistema llamado Fable 5. Los datasets utilizados para la destilación son armand0e/claude-fable-5-claude-code y armand0e/Fable-5-Chat. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica relevante de este repositorio es la cuantización OptiQ. En lugar de una cuantización uniforme, este método ordena las capas según su sensibilidad KL y asigna más bits a las capas más sensibles. El resultado es un checkpoint con 150 capas a 8 bits y 346 capas a 4 bits, con una precisión efectiva de 4.67 bits por peso. El fichero `optiq/optiq_vision.safetensors` contiene la torre de visión en bfloat16 como sidecar, mientras que `optiq/mtp.safetensors` transporta la cabeza de predicción multi-token del checkpoint original. El autor advierte de que esta cabeza no ha sido probada como drafter y recomienda servir el modelo con la decodificación especulativa desactivada.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, y genera respuestas de texto (pipeline image-text-to-text).
- Razonamiento extendido: el modo de pensamiento está activado por defecto en la configuración recomendada, con un presupuesto de 81 920 tokens para razonamiento y un máximo de 102 400 tokens de generación.
- Generación de código: se evalúa en HumanEval+ y MBPP+, con puntuaciones de 0.893 y 0.813 respectivamente en su configuración recomendada.
- Conversación y texto: capacidades generativas de texto y diálogo, basadas en la destilación sobre conjuntos de chat y de código.
- Visión: interpretación de imágenes, gráficos y diagramas, combinada con razonamiento textual.
- Multilingüe: limitado a inglés según los metadatos del modelo.
- Tool calling: no documentado en la información disponible.
- Soporte de agentes: no documentado explícitamente; su capacidad de razonamiento extendido y de programación permite tareas de agente, aunque no hay evidencia publicada de soporte nativo.

## Casos de uso

- Análisis de capturas de pantalla de entornos de desarrollo: como VLM, puede recibir capturas de terminales, páginas web o diagramas y generar explicaciones, detectar errores o proponer código. La destilación sobre `claude-fable-5-claude-code` sugiere que el modelo está orientado a asistencias de programación a partir de interfaces visuales.
- Generación de código en pipelines CI/CD: los resultados en HumanEval+ y MBPP+ indican un buen rendimiento en tareas de programación en Python. La cuantización genera menos tokens por tarea que la versión uniforme de 4 bits, lo que reduce latencia y coste en soluciones automatizadas de revisión o generación de código.
- Asistente técnico multimodal en soporte al cliente: puede analizar una imagen de error enviada por el usuario, combinarla con el historial conversacional y generar puntos de solución. El modo de razonamiento extendido permite desglosar problemas complejos en pasos intermedios.
- Documentación y refactorización de repositorios: con un máximo de 102 400 tokens de generación, el modelo puede operar sobre fragmentos extensos de código y contextos de repositorio para generar documentación técnica, comentarios de función o propuestas de refactorización.
- Interpretación de informes técnicos y diagramas de arquitectura: gracias a la capacidad de entrada de imagen, puede leer esquemas, diagramas de flujo o bocetos y convertirlos en descripciones textuales o en código de infraestructura. Resulta adecuado para equipos de arquitectura de software.
- Razonamiento en entornos de notebooks: en tareas de análisis de datos, el modelo puede describir visualizaciones, identificar patrones en gráficos y ejecutar razonamiento paso a paso para explicar conclusiones. La combinación de visión y código lo hace útil para notebooks de Jupyter o herramientas de ciencia de datos.

## Benchmarks y rendimiento

| Benchmark | Este cuant (OptiQ) | Cuant uniforme 4-bit | Observaciones |
|---|---|---|---|
| HumanEval+ strict pass@1 | 0.893 | 0.900 | Este cuant con temperatura 0.5, uniforme con 0.6; ratio de tokens por tarea 0.66 (IC 95% 0.39–0.98) |
| MBPP+ strict pass@1 | 0.813 | 0.793 | Ratio de tokens por tarea 0.64 (IC 95% 0.40–0.97) |
| Pooled (100 items) | Equivalente (TOST ±5pp) | — | Ratio de tokens por tarea 0.65 (IC 95% 0.46–0.88) |

La comparación fue realizada por el autor con 50 ítems y 3 muestras por ítem, con thinking activado, sin decodificación especulativa y sobre la misma infraestructura de servicio. El cuant OptiQ genera aproximadamente un tercio menos de tokens por tarea que el uniforme 4-bit, manteniendo la precisión dentro de un margen de equivalencia de ±5 puntos porcentuales. No se han publicado resultados frente al modelo original en bfloat16.

## Requisitos de hardware

- Peso de los shards de texto: 18.44 GB. La torre de visión se encuentra en `optiq/optiq_vision.safetensors` en bfloat16, por lo que el peso total de los pesos es ligeramente superior. El repositorio ocupa 19.7 GB.
- VRAM estimada: el formato nativo es MLX, que se ejecuta sobre la memoria unificada de Apple Silicon. Para cargar los 18.44 GB de pesos más activaciones y cache de KV, se estima que se necesita una Mac con al menos 24–32 GB de memoria unificada. Esta cifra no ha sido publicada por el autor y debe tomarse como una estimación orientativa.
- GPU recomendada: no aplica para CUDA. El modelo está cuantizado para MLX y se sirve con `mlx-vlm`; se recomienda hardware Apple Silicon (chips M1, M2 o M3 en adelante).
- Opciones de despliegue: MLX (`mlx-vlm`) en local. El repositorio incluye etiquetas de `transformers` y `text-generation-inference`, pero la librería oficial del checkpoint es `mlx`. No se documenta soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed (este) | 26,9 B | no disponible (max gen 102 400) | MLX OptiQ 4,67 bits efectivos | Apache 2.0 | HuggingFace |
| caslca/Qwen3.8-27B-Fable-Distill-mlx-uniform-4bit (hermano) | 26,9 B | no disponible | MLX uniforme 4 bits | Apache 2.0 | HuggingFace |
| TeichAI/Qwen3.8-27B-Fable-Distill (modelo base) | 26,9 B | no disponible | sin cuantización (formato original) | Apache 2.0 | HuggingFace |

La comparativa se limita a los tres checkpoints relacionados con este modelo: el cuant de precisión mixta, su hermano uniforme y el modelo base. No se dispone de datos sobre otros modelos multimodales de 27B en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgo para este modelo.
- Alucinación: al tratarse de un modelo generativo, existe el riesgo estándar de alucinación, especialmente en tareas abiertas donde la información de entrada es incompleta.
- Idioma: el modelo está documentado solo en inglés. La generación en otros idiomas puede resultar degradada o no estar soportada.
- Contexto: la longitud de contexto no está documentada en la información disponible. El valor de 102 400 tokens es el máximo de generación recomendado, no necesariamente la ventana de contexto efectiva.
- Precisión: la cuantización OptiQ puede degradar ligeramente la precisión en comparación con el modelo original. El autor reporta equivalencia con el uniforme 4-bit en HumanEval+ y MBPP+, pero no hay datos frente al modelo en bfloat16.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, modificación y redistribución. Dado que el modelo deriva de una destilación de Fable 5, es responsabilidad del usuario verificar que los datasets de destilación no impongan restricciones adicionales no visibles en los metadatos.
- Decodificación especulativa: el fichero `optiq/mtp.safetensors` contiene una cabeza de predicción multi-token sin probar; el autor recomienda servir con decodificación especulativa desactivada.
- Tamaño en HuggingFace: el badge de tamaño es incorrecto porque cuenta los tensores uint32 empaquetados; el recuento real de parámetros es 26 895 993 856.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed
- Modelo base: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Versión uniforme 4-bit: https://huggingface.co/caslca/Qwen3.8-27B-Fable-Distill-mlx-uniform-4bit
- Metodología y benchmarks: https://github.com/ivan-avramov/mlx_local_stack
