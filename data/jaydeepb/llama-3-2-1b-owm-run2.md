# jaydeepb/llama-3.2-1b-owm-run2

## Resumen

`jaydeepb/llama-3.2-1b-owm-run2` es un artefacto de investigacion publicado por el usuario jaydeepb en HuggingFace: un fine-tuning de `meta-llama/Llama-3.2-1B` durante una epoca sobre una muestra de 1 millon de secuencias del corpus **OpenWebMath**. No es un modelo de proposito general ni un asistente instruido, sino la "Run 2" (ejecucion de validacion retenida) del estudio *Predicting Memorization Before Fine-Tuning Language Models*, en el que se entrenan clasificadores que predicen, a partir de caracteristicas del modelo base antes del fine-tuning, que secuencias acabara memorizando literalmente el modelo ajustado.

Su relevancia es metodologica: el modelo se distribuye para que terceros puedan reproducir el analisis de memorizacion verbatim y auditar los clasificadores predictivos. La model card advierte explicitamente de que puede reproducir porciones de sus datos de fine-tuning palabra por palabra, lo que lo convierte en un objeto de estudio de fuga de datos de entrenamiento, no en un componente para produccion.

Tecnicamente es un transformer decoder-only denso de 1.235.814.400 parametros (1,24 B), con pesos en safetensors y un repositorio de 2,5 GB, coherente con un guardado en bf16/fp16. No se documentan en la informacion disponible ni la longitud de contexto, ni los idiomas, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2 de Meta); numero de capas y cabezas no disponible |
| Parametros totales | 1.235.814.400 (1,24 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin versiones cuantizadas declaradas |
| Idiomas soportados | No disponible (la model card no los enumera; el corpus de fine-tuning, OpenWebMath, es predominantemente en ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo base `meta-llama/Llama-3.2-1B`: un transformer decoder-only denso con atencion causal y alrededor de 1,24 mil millones de parametros. La model card no detalla capas, dimensiones ocultas, mecanismos de atencion (GQA, RoPE) ni la ventana de contexto efectiva, por lo que esos datos deben consultarse en la ficha del modelo base. Sobre esa base se aplica un fine-tuning estandar de modelado de lenguaje (prediccion del siguiente token) durante **una unica epoca** sobre una muestra de **1 millon de secuencias** de OpenWebMath, un corpus de texto web de contenido matematico.

No se documenta en la informacion disponible el uso de RLHF, DPO, instruction tuning ni ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.). El aspecto tecnico diferencial no esta en el entrenamiento sino en el proposito: esta ejecucion ("Run 2") actua como conjunto de evaluacion retenido para medir la memorizacion verbatim y validar clasificadores entrenados con caracteristicas del modelo *antes* del fine-tuning. Es decir, el modelo es a la vez el objeto medido y la etiqueta de verdad terreno del experimento.

## Capacidades

- Generacion de texto autoregresiva por continuacion de prompt (modelado de lenguaje puro, sin formato de instrucciones).
- Adaptacion al dominio matematico derivada del corpus OpenWebMath: continuaciones con registro y notacion matematica.
- Memorizacion verbatim de porciones de los datos de fine-tuning, segun advierte el propio autor; es la capacidad que el artefacto pretende exponer.
- Utilidad como banco de pruebas para ataques de extraccion de datos de entrenamiento y para medir tasas de memorizacion.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking, capacidades de vision, audio ni multimodalidad.
- Cobertura multilingue: no disponible; sin datos en la model card.
- No se documenta plantilla de chat ni alineacion conversacional.

## Casos de uso

- Reproducibilidad del paper *Predicting Memorization Before Fine-Tuning Language Models*: cargar este checkpoint y recalcular las metricas de memorizacion sobre la Run 2 para contrastar los resultados publicados por los autores.
- Validacion de clasificadores predictivos de memorizacion: usar las generaciones del modelo como etiquetas de verdad terreno y compararlas con las predicciones obtenidas a partir de caracteristicas del modelo base.
- Auditoria de fuga de datos en pipelines de fine-tuning: emplear el modelo para cuantificar que fraccion de un corpus web (OpenWebMath) se recupera literalmente tras una sola epoca de ajuste, informando politicas de deduplicacion.
- Investigacion en privacidad de modelos: servir como sujeto de pruebas en experimentos de data extraction y de mitigacion (deduplicacion, regularizacion, early stopping) comparando contra el modelo base.
- Baseline de dominio en experimentos con OpenWebMath: punto de referencia para estudiar como el ajuste con corpus matematicos desplaza la distribucion de salida del Llama 3.2 1B original.
- Docencia y formacion en seguridad de IA: ejemplo controlado y de pequeno tamano (1,24 B) para demostrar memorizacion verbatim en un entorno con recursos limitados, cabe en una GPU de consumo.
- Analisis de transferencia de dominio: comparar perplejidad y estilo de continuacion entre el modelo base y este checkpoint sobre textos matematicos para aislar el efecto de una epoca de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,5 GB solo de pesos, con un pico realista de 4-6 GB incluyendo cache de activaciones y KV (estimacion aritmetica a partir de 1,24 B de parametros; no verificada empiricamente).
- VRAM estimada en cuantizacion int8: en torno a 1,3 GB de pesos; en int4, alrededor de 0,7 GB. Son estimaciones de calculo, no se publican versiones cuantizadas del checkpoint.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100/H100 solo tendrian sentido para batchear muchas peticiones.
- Cabe holgadamente en GPU de consumo, e incluso en iGPU/CPU con cuantizacion agresiva.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), ademas de llama.cpp u Ollama si se genera una conversion GGUF propia, ya que el repositorio no la incluye.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| `jaydeepb/llama-3.2-1b-owm-run2` | 1,24 B | Fine-tuning de investigacion sobre OpenWebMath para estudiar memorizacion | llama3.2 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `meta-llama/Llama-3.2-1B` (modelo base) | 1,24 B | Modelo de lenguaje base de proposito general | llama3.2 | HuggingFace, ampliamente distribuido |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,24 B | Variante alineada para instrucciones y conversacion | llama3.2 | HuggingFace, ampliamente distribuido |
| Alternativas de ~1-1,7 B (Qwen2.5-1.5B, SmolLM2-1.7B) | 1,5-1,7 B | Modelos base e instruidos de proposito general | Apache 2.0 en los casos citados | HuggingFace |

La comparacion relevante no es de rendimiento: este checkpoint no compite con modelos de proposito general, sino que se diferencia por su funcion de artefacto reproducible. La longitud de contexto de todas las filas no esta verificada en la informacion proporcionada y debe consultarse en cada ficha.

## Limitaciones y advertencias

- Memorizacion verbatim demostrada: el autor advierte de que el modelo puede reproducir porciones de sus datos de fine-tuning. No debe desplegarse como servicio publico sin filtrar salidas.
- Riesgo elevado de alucinacion y de continuaciones sin fundamento: es un modelo base ajustado una sola epoca, sin alineacion, sin RLHF y sin instruction tuning.
- Ausencia de plantilla de chat y de formato conversacional: no responde a instrucciones de forma fiable; espera texto plano a continuar.
- Sin datos publicados de benchmarks, idiomas ni contexto: cualquier evaluacion de calidad debe realizarse ad hoc.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; el artefacto no ha sido replicado de forma independiente.
- Sesgos: no documentados por el autor; al derivar de un corpus web de contenido matematico, hereda los sesgos de idioma (predominio del ingles), de estilo y de calidad de dicha fuente.
- Restricciones de licencia: la Llama 3.2 Community License permite uso comercial con condiciones (limite de 700 millones de usuarios mensuales para el titular, requisitos de atribucion y denominacion "Llama", cumplimiento de la politica de uso aceptable). El fine-tuning debe conservar el aviso de licencia y la mencion "Built with Llama".
- Trazabilidad etica: al ser una herramienta de extraccion de datos, su uso debe limitarse a investigacion sobre los propios datos de entrenamiento; no debe emplearse para recuperar contenido de terceros ajenos al corpus.
- Fechas del repositorio: la model card y los metadatos no incluyen informacion sobre versionado del corpus OpenWebMath utilizado, lo que limita la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/llama-3.2-1b-owm-run2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Paper *Predicting Memorization Before Fine-Tuning Language Models*: no disponible (la model card lo cita por titulo, sin enlace)
- Repositorio de codigo del estudio: no disponible en la informacion proporcionada
- Demo o Space asociado: no disponible en la informacion proporcionada
