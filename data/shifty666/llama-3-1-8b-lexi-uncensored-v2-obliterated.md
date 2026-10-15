# Shifty666/Llama-3.1-8B-Lexi-Uncensored-V2-OBLITERATED

## Resumen

Llama-3.1-8B-Lexi-Uncensored-V2-OBLITERATED es un derivado del modelo Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 al que se le ha aplicado una técnica de *abliteration* (eliminación de comportamientos de rechazo mediante ingeniería de activaciones) con el método etiquetado como `aggressive` a través de la herramienta OBLITERATUS. Lo publica el usuario Shifty666 en HuggingFace y su propósito declarado es ofrecer un modelo sin censura, es decir, con la capa de rechazo del modelo original suprimida a nivel de pesos.

El modelo hereda la arquitectura de Llama 3.1 8B: un transformer decoder-only de 8.030.261.248 parámetros (dato confirmado en los safetensors del repositorio), con normalización RMSNorm, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). El repositorio ocupa 16,1 GB, lo que corresponde a pesos en precisión de 16 bits sin cuantizar.

La relevancia de esta ficha es principalmente práctica y crítica: se trata de un modelo con 0 descargas y 0 *likes* en el momento de la consulta, sin *pipeline* declarado, sin licencia especificada y sin datos de entrenamiento, benchmarks ni evaluación publicados. Es, por tanto, un experimento de la comunidad más que un artefacto listo para producción, y cualquier uso en entornos reales exige asumir los riesgos legales, éticos y de calidad que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), heredada del modelo base; RMSNorm, RoPE y GQA segun la arquitectura estandar de Llama 3.1 8B |
| Parametros totales | 8.030.261.248 (confirmado en los safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens segun la arquitectura Llama 3.1 8B heredada; no confirmado de forma explicita en la model card de este derivado |
| Tipos de cuantizacion | No se publican variantes cuantizadas en el repositorio; los pesos se distribuyen en formato de 16 bits (safetensors). Cualquier cuantizacion (GGUF, AWQ, GPTQ) tendria que generarla el usuario |
| Idiomas soportados | Ingles (`en`), segun los metadatos del repositorio |
| Licencia | No disponible en la model card. Al derivar de Llama 3.1 8B, es previsible que aplique la licencia comunitaria de Meta Llama 3.1, pero el autor no lo declara |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe ningun proceso de entrenamiento propio. El unico dato tecnico declarado es que el modelo se ha sometido a *abliteration* con el metodo `aggressive` mediante OBLITERATUS, una herramienta de codigo abierto orientada a eliminar el comportamiento de rechazo de modelos de lenguaje mediante ingenieria de activaciones. Este tipo de intervencion no reentrena el modelo: identifica direcciones en el espacio de activaciones asociadas a la generacion de negativas y las proyecta fuera de los pesos, de modo que el modelo deja de activar respuestas de rechazo.

La arquitectura subyacente es la de Llama 3.1 8B, un transformer decoder-only con atencion causal, normalizacion RMSNorm previa a cada subcapa, embeddings rotatorios y atencion con consultas agrupadas para reducir el coste de memoria de la cache KV. No hay informacion disponible sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales introducidas en este derivado concreto.

Conviene subir el nivel de escepticismo con este modelo: al no documentarse ni el dataset de la destilacion de partida ni los hiperparametros del proceso de *abliteration*, no es posible reproducir el resultado ni estimar con rigor cuanto ha degradado el proceso la calidad general del modelo.

## Capacidades

- Generacion de texto en ingles con capacidad de continuacion libre y conversacion multi-turno.
- Respuesta a instrucciones sin la capa habitual de rechazo, lo que amplia el rango de peticiones que el modelo atiende.
- Razonamiento basico y generacion de codigo, en la medida en que estas capacidades se conserven del modelo base Llama 3.1 8B tras el proceso de *abliteration* (no hay evaluacion publicada que lo confirme).
- Capacidad multilingue limitada: los metadatos declaran unicamente ingles, aunque Llama 3.1 8B original soporta varios idiomas; el ajuste del modelo base (Lexi-Uncensored) estaba orientado al ingles.
- Soporte de *tool calling* y de agentes: no declarado ni verificado en la informacion disponible.
- Modo de razonamiento explicito (*thinking mode*), vision o audio: no declarado, no disponible.

## Casos de uso

- Investigacion sobre *abliteration* y seguridad de modelos: resulta util como caso de estudio para medir cuanto se degrada un modelo al eliminar la capa de rechazo, comparando sus salidas con las del modelo base sin modificar.
- Analisis comparativo de tecnicas de desalineacion: permite contrastar el metodo `aggressive` de OBLITERATUS con otras aproximaciones sobre el mismo modelo de partida.
- Generacion de narrativa creativa sin filtros tematicos: escritura de ficcion con tematicas adultas o violentas que un modelo alineado rechazaria.
- Simulacion de interacciones adversariales en *red teaming*: uso del modelo como generador de contenido hostil controlado en entornos de pruebas cerrados para evaluar defensas.
- Prototipado de personajes conversacionales con personalidad marcada, donde se busca minimizar las negativas del sistema.
- Experimentacion academica con modelos de 8B en una unica GPU: el tamano permite iterar rapidamente en investigación sin infraestructura de gran escala.

En todos estos casos hay que tener presente que el modelo tiene 0 descargas, no ha sido evaluado publicamente y no declara licencia, por lo que cualquier uso fuera de un entorno experimental controlado es desaconsejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni comparaciones con el modelo base o con alternativas. Tampoco hay evaluacion del impacto del proceso de *abliteration* sobre la calidad general, la coherencia o la tasa de alucinacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 16-17 GB solo para los pesos, mas la cache KV, que crece con la longitud de contexto. Con contextos largos de 128.000 tokens la cache KV puede anadir varios GB adicionales.
- VRAM estimada en int8: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (Q4_K_M): en torno a 5 GB, aunque esta variante no viene publicada y tendria que generarla el usuario.
- GPU recomendadas: A100 de 40 o 80 GB, H100 y L40S para despliegue en fp16 con contexto largo; una RTX 4090 o RTX 3090 con 24 GB puede ejecutar fp16 con contextos moderados.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) en fp16 con contexto controlado, y en tarjetas de 12-16 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: HuggingFace Transformers es la via documentada en la model card. vLLM y TGI son compatibles en principio con la arquitectura Llama 3.1, pero no estan verificados para este repositorio. Para llama.cpp u Ollama habria que generar primero un archivo GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shifty666/Llama-3.1-8B-Lexi-Uncensored-V2-OBLITERATED | 8,03 B | 128.000 tokens (heredado, no confirmado) | No disponible | No declarada (previsiblemente Llama 3.1 Community License) | 0 descargas, 0 likes |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | 8,03 B (aproximado, misma familia) | 128.000 tokens | No disponible en la informacion proporcionada | No disponible | Modelo base del anterior |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Ampliamente evaluado en benchmarks publicos de Meta | Llama 3.1 Community License | Muy extendido y con soporte en toda la toolchain |
| Alternativas abliteradas de la comunidad (por ejemplo variantes de mlabonne y similares) | ~7-8 B | Variable, tipicamente 8.000-128.000 tokens | Habitualmente sin evaluacion publicada | Habitualmente Llama Community License | Alta disponibilidad en HuggingFace |

La comparativa con el modelo base y con Llama 3.1 8B Instruct es la mas informativa: el primero aisla el efecto del *fine-tuning* sin censura sobre Llama 3.1, y el segundo sirve como referencia de alineacion estandar. No hay datos objetivos que permitan afirmar que este derivado sea mejor o peor que cualquiera de ellos.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks, sin evaluacion de seguridad y sin cartas de modelo detalladas, no hay forma de conocer el estado real de las capacidades del modelo.
- Sesgos: no documentados. Al no haberse aplicado tecnicas de mitigacion conocidas y al proceder de un *fine-tuning* sin censura, es probable que los sesgos del modelo base se amplifiquen, aunque no hay mediciones que lo confirmen.
- Riesgo de alucinacion: no evaluado. La *abliteration* puede afectar a la coherencia y aumentar la generacion de contenido no fiable, pero no hay datos que cuantifiquen este efecto.
- Contenido sin filtros: el modelo puede generar contenido ofensivo, ilegal, peligroso o sexual explicito. Esto es intencionado y es la razon de ser del repositorio, pero lo descalifica para aplicaciones de cara al publico.
- Limitacion de idioma: solo se declara ingles, lo que restringe su uso en castellano y otras lenguas.
- Licencia: no se especifica ninguna. Al derivar de Llama 3.1 8B, el uso comercial estaria previsiblemente sujeto a la licencia comunitaria de Meta Llama 3.1, que impone obligaciones de atribucion y condiciones de uso, pero el autor no lo aclara. Esto es un riesgo legal relevante para cualquier despliegue.
- Sin soporte ni mantenimiento: el repositorio no tiene descargas ni interacciones, no hay *pipeline* declarado y no consta que el autor vaya a mantenerlo o responder a incidencias.
- Ausencia de variantes cuantizadas publicadas: para ejecutarlo en hardware de gama media hay que generar los GGUF o las cuantizaciones de forma manual, con el coste de tiempo y de validacion que eso implica.
- Caveat de produccion: no se recomienda su uso en ningun sistema productivo, especialmente si hay usuarios finales o datos sensibles implicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shifty666/Llama-3.1-8B-Lexi-Uncensored-V2-OBLITERATED
- Repositorio de OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Modelo base: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Modelo original de la familia: https://huggingface.co/meta-llama/Llama-3.1-8B
- Documentacion de Llama 3.1 en Meta: https://ai.meta.com/blog/meta-llama-3-1/
