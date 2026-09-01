# neko-i-am-a-cat/purrfolio-1b

## Resumen

Purrfolio-1B es un modelo de lenguaje financiero de 1.100 millones de parámetros, desarrollado por Vaibhav Agarwal (bajo el alias neko-i-am-a-cat) y publicado en HuggingFace. Se trata de un Transformer decoder-only entrenado desde cero sobre un corpus propio llamado Purrfolio, con un objetivo dual: memorización verbatim de textos financieros y generación de explicaciones en términos simples. El modelo está pensado para tareas de procesamiento de lenguaje natural en el dominio financiero, aunque su tamaño reducido y su ventana de contexto de 2048 tokens lo limitan a aplicaciones de corto alcance.

La relevancia actual del modelo reside en su enfoque específico para finanzas y en su licencia GPLv3, que permite uso gratuito para fines personales y académicos, pero exige una licencia comercial de pago. Sin embargo, el proyecto se encuentra en una fase temprana: los checkpoints aún no están disponibles públicamente (según la model card, aparecerán tras completar el entrenamiento) y no se han publicado resultados de benchmarks ni evaluaciones independientes. Esto lo convierte en una propuesta interesante para investigación, pero no apta para producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (24 capas, 2048 dimensiones, 16 cabezas de atencion) |
| Parametros totales | 1.1B (aproximadamente) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | GPLv3 (uso comercial requiere licencia de pago) |
| Formato de pesos | No disponible (se publicara tras el entrenamiento) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer decoder-only clasica, con 24 capas, dimension de modelo 2048 y 16 cabezas de atencion. El vocabulario es de 8192 tokens, lo que resulta inusualmente pequeno para un modelo de este tamano y puede limitar su capacidad de representacion linguistica. Fue entrenado desde cero, sin partir de pesos preentrenados, utilizando el framework MaxText sobre un TPU v5e-8. El corpus de entrenamiento, llamado Purrfolio, no tiene una descripcion publica detallada en cuanto a tamano, composicion o numero de tokens. El objetivo de entrenamiento combina dos tareas: memorizacion verbatim de textos financieros y generacion de explicaciones simplificadas de dichos contenidos. No se menciona el uso de tecnicas como RLHF, DPO o instrucciones supervisadas adicionales.

## Capacidades

- Generacion de texto en ingles, orientada al dominio financiero.
- Memorizacion de fragmentos textuales del corpus de entrenamiento (objetivo verbatim).
- Explicacion de conceptos financieros en terminos simples, segun el objetivo dual declarado.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- El modelo es exclusivamente de generacion de texto; no hay evidencia de soporte para agentes ni integraciones externas.

## Casos de uso

- Generacion de resumenes de informes financieros: el modelo podria condensar documentos extensos en explicaciones breves, aprovechando su objetivo de simplificacion, aunque su contexto de 2048 tokens limita la longitud de los documentos procesables.
- Educacion financiera: podria utilizarse para traducir jerga bursatil o contable a un lenguaje accesible para estudiantes o inversores noveles, siempre que se valide la precision de las explicaciones.
- Asistencia en analisis de sentimiento de noticias financieras: al estar entrenado en un corpus financiero, podria clasificar o generar texto sobre el tono de comunicados, aunque no hay benchmarks que lo confirmen.
- Generacion de contenido para blogs o newsletters financieros: podria redactar parrafos explicativos sobre conceptos como inflacion, tipos de interes o valoracion de activos, con supervision humana.
- Prototipado de chatbots financieros: en entornos de investigacion o desarrollo, podria servir como base para un asistente conversacional simple, dado su tamano reducido y su licencia permisiva para uso no comercial.
- Investigacion academica sobre modelos de dominio especifico: su arquitectura y entrenamiento desde cero lo convierten en un caso de estudio para comparar el rendimiento de modelos pequenos entrenados en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar que permitan comparar su rendimiento con otros modelos.

## Requisitos de hardware

- Estimacion de VRAM: con cuantizacion de 4 bits, aproximadamente 0.6 GB; en FP16, alrededor de 2.2 GB. Estas cifras son calculos teoricos basados en el numero de parametros, no mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) podria ejecutar el modelo en cuantizacion ligera. Para FP16 se recomienda una GPU con 4 GB o mas.
- El modelo cabe en GPUs consumer de gama baja, lo que facilita su uso en entornos de desarrollo.
- Opciones de despliegue: al no estar publicados los pesos, no se puede confirmar la compatibilidad con vLLM, llama.cpp, Ollama o TGI. Una vez publicados, se podrian generar cuantizaciones GGUF para su uso con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo dominio (financiero, tamano ~1B) con los que establecer una comparacion objetiva. La ausencia de benchmarks y de pesos publicados impide cualquier analisis comparativo fiable.

## Limitaciones y advertencias

- Licencia restrictiva: aunque es GPLv3, el uso comercial requiere una licencia de pago con el autor. Cualquier derivado debe permanecer bajo GPLv3 o adquirir licencia comercial. Esto puede ser un obstaculo para su adopcion en entornos empresariales.
- Contexto limitado: 2048 tokens es una ventana corta para tareas financieras que suelen requerir analisis de documentos extensos.
- Vocabulario reducido: 8192 tokens puede limitar la expresividad y la cobertura de terminos especializados fuera del corpus de entrenamiento.
- Sin pesos publicados: los checkpoints no estan disponibles en el momento de redactar esta ficha, lo que impide cualquier prueba practica.
- Sin evaluacion independiente: no hay benchmarks, ni estudios de sesgos, ni analisis de alucinaciones. El riesgo de generar informacion financiera incorrecta o desactualizada es alto si se usa sin supervision.
- Idioma unico: solo soporta ingles, lo que limita su uso en entornos hispanohablantes.
- Sesgos potenciales: al estar entrenado en un corpus especifico no documentado, podria reflejar sesgos de las fuentes originales, aunque no hay informacion al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neko-i-am-a-cat/purrfolio-1b
- Repositorio GitHub del autor: https://github.com/thisisforlearn/Purrfolio
- Dataset Purrfolio: https://huggingface.co/datasets/neko-i-am-a-cat/purrfolio
- Perfil del autor en GitHub: https://github.com/thisisforlearn
