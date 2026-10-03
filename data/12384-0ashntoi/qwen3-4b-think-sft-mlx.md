# 12384-0ashntoi/Qwen3-4B-Think-SFT-MLX

## Resumen

Qwen3-4B-Think-SFT-MLX es un checkpoint afinado mediante supervisión (SFT) sobre Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario 12384-0ashntoi. El objetivo del ajuste es forzar un formato de salida explícito: una traza de razonamiento breve delimitada por `<think>...</think>` seguida de la respuesta final. Se trata de un experimento de investigación sobre datos sintéticos más que de un modelo orientado a producción.

El ajuste se realizó con LoRA sobre las últimas 16 capas del transformer más la cabeza de salida/embeddings atados, con rango 8 y escala 16, sobre un conjunto de 143 ejemplos sintéticos (114 de entrenamiento, 14 de validación y 15 de test). El estilo de las trazas aprendidas es fuertemente estilizado (uwu/furry), pero el prompt de sistema empleado es neutro, de modo que el estilo no requiere una instrucción con nombre propio.

Es relevante como caso de estudio de dos cosas: primero, la técnica de incluir la cabeza de salida atada en el LoRA, necesaria porque el checkpoint Instruct original prefería tokens delimitadores de tool-calling antes que los tokens `<think>`; segundo, la distinción explícita que hace el autor entre trazas estilísticas generadas y razonamiento interno verificado. El modelo tiene 4.022.468.096 parámetros, se distribuye en formato MLX/safetensors bajo licencia Apache 2.0 y está declarado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (según el modelo base Qwen/Qwen3-4B-Instruct-2507); ajuste adicional mediante LoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; la configuración de entrenamiento fija una longitud máxima de secuencia de 1.536 tokens |
| Tipos de cuantizacion | no disponible; el modelo base en MLX empleado para el ajuste era `mlx-community/Qwen3-4B-Instruct-2507-4bit`, y el repositorio publica pesos safetensors compatibles con MLX |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint MLX, librería `mlx`) |
| Tamano del repositorio | 8,1 GB |
| Metodo de ajuste | LoRA (rango 8, escala 16) sobre las 16 últimas capas del transformer y la cabeza de salida/embeddings atados |
| Ejemplos de entrenamiento | 143 registros sintéticos (114 train / 14 validación / 15 test) |
| Hiperparametros | batch size 1, acumulación de gradiente 4, learning rate 1e-5, 350 iteraciones, prompt masking activado |
| Perdida de validacion final | aproximadamente 2,325 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parámetros. Sobre él se aplicó un ajuste supervisado con LoRA restringido a las 16 últimas capas del transformer y a la cabeza de salida/embeddings atados. La inclusión de la cabeza atada es una decisión técnica deliberada: según la model card, el checkpoint Instruct original, en ausencia de ese ajuste, tendía a emitir tokens delimitadores de tool-calling en lugar de los tokens `<think>`.

El conjunto de datos es enteramente sintético y muy reducido: 143 registros de prompt/razonamiento/respuesta, divididos en 114 de entrenamiento, 14 de validación y 15 de test. El prompt de sistema utilizado durante el entrenamiento fue "Answer the user request. First generate a short reasoning trace inside `<think>` and `</think>`, then give the final answer." Las trazas objetivo son reconstrucciones estilizadas generadas por el propio autor, no razonamiento interno auténtico, y la model card lo indica de forma explícita. No se documenta ningún uso de RLHF ni DPO en este checkpoint; el autor menciona que existe un checkpoint GRPO separado, entrenado a partir de este SFT, con recompensas basadas en reglas de corrección matemática y de formato.

## Capacidades

- Generación de texto conversacional en inglés con formato estructurado de razonamiento seguido de respuesta final.
- Emisión de trazas de razonamiento delimitadas por `<think>` y `</think>`, aprendidas mediante supervisión sobre datos sintéticos.
- Resolución de problemas aritméticos sencillos como caso de uso de referencia (el ejemplo de la model card es "What is 17 times 23?" y el dataset asociado es openai/gsm8k).
- Soporte de plantillas de chat mediante `tokenizer.apply_chat_template` en el ecosistema MLX.
- Uso con `mlx_lm` para carga y generación (`load`, `generate`).
- Capacidades de tool calling o function calling: no declaradas explícitamente; el autor menciona que el modelo base mostraba preferencia por tokens delimitadores de tool-calling, pero no se documenta soporte funcional de herramientas en este checkpoint.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no; el modelo declara únicamente inglés.
- Capacidades de visión o audio: no disponibles.
- Modo de pensamiento: sí, implementado como formato textual `<think>...</think>`, no como modo nativo conmutables del modelo base.

## Casos de uso

- Investigación sobre formato de razonamiento en modelos pequeños: permite estudiar cómo un ajuste LoRA de muy pocos ejemplos induce patrones de delimitación `<think>` y qué efectos secundarios tiene sobre la generación del modelo base.
- Reproducción de experimentos de post-entrenamiento con MLX: sirve como referencia práctica para ajustar modelos Qwen3 en Apple Silicon con `mlx_lm`, incluyendo el detalle de incorporar la cabeza de salida atada al LoRA.
- Evaluación de la distinción entre traza estilística y razonamiento real: útil como caso negativo o de control en estudios sobre fidelidad de las cadenas de razonamiento generadas.
- Generación de datos sintéticos de estilo controlado: el checkpoint puede emplearse para producir textos con una estilización muy marcada, útil para probar detectores de estilo o filtros de contenido.
- Pruebas de robustez de pipelines de evaluación: al ser un modelo deliberadamente débil en lógica y propenso a repetirse, sirve para validar que los arneses de evaluación detectan degradación y bucles.
- Docencia y demostraciones de fine-tuning: su tamaño reducido (4.022 millones de parámetros) y su conjunto de datos minúsculo permiten reproducir el ciclo completo de SFT en hardware de consumo.
- Banco de pruebas de alucinación: útil para comprobar hasta qué punto un modelo pequeño con ajuste sintético mantiene artefactos de sus respuestas de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra, pese a que el dataset `openai/gsm8k` figura entre las etiquetas del repositorio. El único dato numérico de rendimiento reportado es la pérdida de validación final, aproximadamente 2,325, que no es comparable con métricas de evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 8-9 GB solo para pesos, más memoria para el contexto y el caché KV.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,5-3 GB para pesos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es ejecutable en GPUs de consumo, aunque la publicación está orientada a MLX, es decir, a Apple Silicon.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en bf16 y en tarjetas con 4-6 GB en cuantización de 4 bits. No se proporcionan cifras verificadas por el autor.
- Opciones de despliegue: `mlx_lm` es el camino documentado en la model card. Otros runners (llama.cpp, Ollama, vLLM, TGI) no están documentados para este checkpoint concreto; la compatibilidad dependería de la conversión de los pesos MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Think-SFT-MLX | 4.022.468.096 | no disponible | `<think>...</think>` aprendido por LoRA | apache-2.0 | HuggingFace, formato MLX |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | no disponible en la información proporcionada | no disponible | no aplica (Instruct sin traza explícita) | no disponible en la información proporcionada | HuggingFace |
| mlx-community/Qwen3-4B-Instruct-2507-4bit (base MLX usada para el ajuste) | no disponible en la información proporcionada | no disponible | no aplica | no disponible en la información proporcionada | HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones completas de terceros alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El conjunto de datos es muy pequeño (143 ejemplos) y completamente sintético; el riesgo de sobreajuste al estilo es alto.
- Las trazas de razonamiento son reconstrucciones estilísticas, no razonamiento interno verificado, tal como advierte el propio autor.
- El modelo puede alucinar, repetirse, producir lógica débil o conservar artefactos procedentes de las respuestas sintéticas de origen.
- Las trazas de SFT tienen típicamente entre 130 y 350 tokens; generaciones mucho más largas tienden a volverse repetitivas.
- Hereda los sesgos y limitaciones de su modelo base y de los datos de entrenamiento.
- No debe utilizarse para orientación factual, médica, legal, financiera ni política.
- La longitud de contexto real utilizable está fuertemente condicionada por el entrenamiento a 1.536 tokens como máximo, muy por debajo del contexto que pueda declarar el modelo base.
- Solo soporta inglés según la model card.
- Licencia Apache 2.0, que permite uso comercial, pero el propio autor desaconseja explícitamente el uso en dominios sensibles y el modelo no está validado para producción.
- La estilización uwu/furry de las trazas puede ser inapropiada o indeseable en contextos profesionales o de cara al usuario final.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/12384-0ashntoi/Qwen3-4B-Think-SFT-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Base MLX empleada para el ajuste: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Dataset referenciado en las etiquetas del repositorio: https://huggingface.co/datasets/openai/gsm8k
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo. Las búsquedas devolvieron exclusivamente páginas sobre productos bancarios de BNP Paribas en portales en polaco, sin relación alguna con el modelo, su autor, su arquitectura o su entrenamiento. No se dispone por tanto de paper, blog técnico, repositorio de código ni demo adicionales.
