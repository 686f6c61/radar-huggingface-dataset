# ehristoforu/trerme17

## Resumen

trerme17 es un modelo de lenguaje publicado en Hugging Face por el usuario ehristoforu, derivado directamente de ehristoforu/trerme15 mediante PolyMerge, una herramienta de fusión de modelos (model merging) desarrollada por el mismo autor que se presenta como agnóstica a la arquitectura. No se trata, por tanto, de un entrenamiento desde cero ni de un fine-tuning con datos nuevos, sino de una combinación de pesos de modelos existentes cuyo resultado se distribuye en formato safetensors.

El repositorio declara la etiqueta de arquitectura qwen3_5_moe, lo que sugiere que la base subyacente pertenece a la familia Qwen 3.5 con mezcla de expertos, aunque la model card no aporta detalle alguno sobre configuración de expertos, número de parámetros activos ni longitud de contexto. El dato objetivo disponible es el recuento de parámetros en safetensors: 3.116.320.624 parámetros totales, con un repositorio de 6,2 GB, lo que es coherente con pesos en precisión bf16/fp16.

La relevancia de este modelo es limitada y muy específica: sirve como ejemplo de flujo de trabajo de fusión con PolyMerge y como artefacto experimental de la saga trerme del autor. No cuenta con descargas ni interacciones, no tiene pipeline declarado, no especifica idiomas y su licencia es "other" sin texto adicional, por lo que su evaluación debe hacerse con cautela y verificando directamente los pesos antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (según etiqueta del repositorio); mezcla de expertos de la familia Qwen 3.5, detalle de configuración no disponible |
| Parametros totales | 3.116.320.624 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es qwen3_5_moe, es decir, un transformer con mezcla de expertos (MoE) heredado del modelo base de la familia Qwen 3.5 sobre el que se construye la fusión. El modelo no se ha entrenado: se ha generado mediante PolyMerge, la herramienta del autor para combinar pesos de forma agnóstica a la arquitectura, partiendo de ehristoforu/trerme15. La model card no documenta la receta de fusión (método de interpolación, Tasas de mezcla, capas afectadas), ni el número de tokens de entrenamiento, ni si hubo RLHF, DPO o cualquier etapa de alineamiento posterior.

Al ser una fusión de pesos, las innovaciones técnicas reseñables son las propias de la arquitectura base (enrutamiento de expertos, atención estándar de la familia Qwen), no del proceso de creación. No hay información sobre decodificación especulativa, atención lineal ni optimizaciones de inferencia específicas. Cualquier afirmación sobre el comportamiento del modelo debe validarse empíricamente, ya que la fusión puede degradar capacidades de forma no uniforme.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base, no verificadas ni documentadas por el autor.
- Generación de código y matemáticas: presumiblemente presente por la familia Qwen 3.5, sin evaluación publicada.
- Tool calling / function calling: no disponible; no se documenta soporte de plantillas de herramientas ni formato de llamadas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay indicios de modo thinking ni de flujos agénticos documentados.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Experimentación con fusión de modelos: usar trerme17 como caso de estudio para reproducir el pipeline de PolyMerge sobre la saga trerme, comparando los pesos fusionados con ehristoforu/trerme15 y midiendo la degradación o mejora en tareas controladas.
- Evaluación comparativa interna: incluirlo como baseline adicional en una batería de evaluación propia (perplejidad, MMLU reducido, GSM8K) para estudiar cómo afecta la fusión a un MoE de ~3,1 mil millones de parámetros.
- Investigación sobre artefactos de la comunidad: analizar qué se publica sin model card detallada y qué riesgos implica reutilizar pesos de licencia "other" en investigación reproducible.
- Pruebas de carga y despliegue: validar pipelines de servicio (vLLM o TGI) con un checkpoint safetensors de 6,2 GB antes de mover modelos mayores, comprobando compatibilidad de tokenizer y configuración.
- Docencia sobre model merging: ilustrar en un curso o taller las diferencias entre fine-tuning, destilación y fusión de pesos usando un ejemplo real y pequeño.
- Prototipado de bajo coste: si el modelo base resulta funcional, emplearlo en tareas de generación de texto no críticas en local, siempre tras una validación previa de calidad y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los 3,12 mil millones de parámetros ocupan aproximadamente 6,2 GB de pesos, por lo que se necesitan en torno a 8-10 GB de VRAM contando caché KV y overhead del runtime.
- Cuantización: al no publicarse GGUF, la reducción a 8 bits o 4 bits requeriría convertir los pesos con herramientas externas (llama.cpp, GPTQ, AWQ), asumiendo riesgo de incompatibilidad con el enrutamiento MoE.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 y A100/H100 para despliegues concurrentes; una RTX 3060 de 12 GB podría alojarlo en bf16 con contexto corto.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16; en 8 GB solo mediante cuantización previa conversión.
- Opciones de despliegue: vLLM y TGI si la arquitectura qwen3_5_moe está soportada por la versión instalada; llama.cpp/Ollama solo tras conversión manual a GGUF. No hay pipeline declarado en Hugging Face, lo que complica el despliegue directo con transformers sin revisar la configuración.
- Latencia y throughput: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ehristoforu/trerme17 | 3,12 B (MoE, activos no disponibles) | no disponible | other | Repositorio safetensors, 0 descargas |
| ehristoforu/trerme15 | no disponible | no disponible | other | Modelo base del que deriva trerme17 |
| Qwen 3.5 (modelos de ~3 B de la familia) | ~3 B | no disponible en esta ficha | según variante de Qwen | Ampliamente distribuido en Hugging Face |

La comparación con alternativas consolidadas no puede cuantificarse porque no hay benchmarks ni especificaciones de contexto publicadas para trerme17; la única referencia fiable es su relación directa con trerme15 y la etiqueta de arquitectura Qwen 3.5.

## Limitaciones y advertencias

- Licencia "other" sin texto publicado: no se puede confirmar si el uso comercial está permitido; hay que contactar con el autor o consultar el repositorio de PolyMerge antes de cualquier despliegue en producción.
- Ausencia total de model card técnica: sin datos de contexto, idiomas, receta de fusión ni evaluación, el comportamiento real es desconocido.
- Riesgo de degradación por fusión: la combinación de pesos puede producir regresiones en razonamiento, código o multilingüismo respecto al modelo base, sin que exista documentación que lo advierta.
- Riesgo de alucinación: no evaluado; al no haber alineamiento documentado, no hay garantías sobre veracidad ni rechazo de peticiones dañinas.
- Sesgos: desconocidos; dependen enteramente de los datos de entrenamiento del modelo base, no documentados aquí.
- Soporte de herramientas incierto: sin plantilla de chat ni formato de function calling declarado, integrarlo en agentes requiere ingeniería inversa del tokenizer y de la configuración.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día, lo que indica un artefacto recién publicado y sin validación comunitaria.
- Compatibilidad de despliegue: la etiqueta qwen3_5_moe puede no estar soportada por versiones estables de vLLM, TGI o transformers, obligando a usar el código del autor o a adaptar la configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ehristoforu/trerme17
- Modelo base: https://huggingface.co/ehristoforu/trerme15
- Herramienta de fusión PolyMerge: https://github.com/ehristoforu/polymerge
