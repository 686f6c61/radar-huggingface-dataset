# dbrll/sheaf-nanogpt-shakespeare

## Resumen

El modelo `dbrll/sheaf-nanogpt-shakespeare` es un pequeño transformer de carácter, basado en la arquitectura nanoGPT de Andrej Karpathy, entrenado con el corpus de obras de Shakespeare. Ha sido portado al lenguaje funcional Sheaf, un framework de aprendizaje automático compilado a GPUs, y sus pesos se han convertido del formato PyTorch original a SafeTensors. Con apenas 10,7 millones de parámetros, es un modelo de demostración y estudio, no un sistema de producción.

Su relevancia radica en ser un ejemplo de portabilidad entre frameworks: muestra cómo un modelo clásico de referencia (nanoGPT) puede ejecutarse en Sheaf manteniendo la misma estructura de capas, disposición de pesos y resultados numéricos. Es útil para quienes investigan la viabilidad de Sheaf como alternativa a PyTorch, o para fines educativos sobre entrenamiento de modelos de lenguaje a pequeña escala. No se dispone de información sobre la longitud de contexto, el dataset exacto de entrenamiento ni los hiperparámetros utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nanoGPT, portado a Sheaf) |
| Parametros totales | 10.770.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en SafeTensors, sin cuantizacion declarada) |
| Idiomas soportados | no disponible (presumiblemente ingles, por el corpus de Shakespeare) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors |

## Arquitectura y entrenamiento

El modelo sigue fielmente la arquitectura nanoGPT original de Karpathy: un transformer decoder con bloques de atencion multi-cabeza, capas de normalizacion y redes feed-forward, disenado para generacion de caracteres. La portabilidad a Sheaf conserva la misma estructura de capas y la disposicion de pesos, lo que garantiza resultados numericos identicos al modelo PyTorch original. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset (mas alla de que es texto de Shakespeare) ni si se aplicaron tecnicas de RLHF o DPO. El entrenamiento se realizo previamente en PyTorch y los pesos se convirtieron posteriormente a SafeTensors para su uso en Sheaf.

## Capacidades

- Generacion de texto a nivel de caracter: el modelo produce secuencias de texto que imitan el estilo de Shakespeare, pero con coherencia limitada debido a su tamano reducido.
- Ejecucion en Sheaf: demuestra que un modelo entrenado en PyTorch puede ser portado y ejecutado en el framework Sheaf sin perdida de fidelidad numerica.
- Uso educativo: sirve como ejemplo de implementacion de un transformer minimo para aprender sobre arquitecturas de lenguaje.
- No se conocen capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Demostracion de portabilidad entre frameworks: los desarrolladores de Sheaf pueden usar este modelo para verificar que sus conversiones de pesos y arquitecturas funcionan correctamente, comparando salidas con el modelo PyTorch original.
- Ensenanza de transformers: en cursos o talleres sobre IA, este modelo permite ilustrar el funcionamiento interno de un transformer de caracteres con un codigo simple y un corpus conocido.
- Pruebas de inferencia en entornos con recursos minimos: al tener solo 10,7 millones de parametros, puede ejecutarse en CPU sin GPU, ideal para validar pipelines de inferencia en maquinas modestas.
- Generacion de texto creativo experimental: se puede usar para producir fragmentos de texto "shakesperiano" aleatorio, aunque la calidad es baja y no apta para uso profesional.
- Benchmark de rendimiento de Sheaf: comparar la velocidad de inferencia y el uso de memoria entre Sheaf y PyTorch para un modelo pequeno, sirviendo como punto de partida para evaluar el framework.
- Integracion en proyectos de investigacion sobre modelos de lenguaje pequenos: como base para experimentos de fine-tuning o distillation, aunque su tamano limita su utilidad practica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB, incluso en FP32 (10,7 M de parametros ocupan unos 43 MB en FP32). Cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: no requiere GPU especifica; puede ejecutarse en CPU (por ejemplo, un Intel i5 o superior) con latencia de milisegundos por token.
- Compatibilidad con consumer GPU: si, cualquier GPU con al menos 1 GB de VRAM es suficiente.
- Opciones de despliegue: al ser un modelo en formato SafeTensors, puede cargarse con librerias que soporten este formato (por ejemplo, transformers de Hugging Face, aunque el modelo no tiene pipeline declarado). Tambien puede ejecutarse directamente en Sheaf si se dispone del entorno.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano, se espera una generacion de decenas de tokens por segundo en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dbrll/sheaf-nanogpt-shakespeare | 10,7 M | no disponible | Apache 2.0 | SafeTensors | Portado a Sheaf |
| cy0307/nanogpt-shakespeare | no disponible | no disponible | no disponible | no disponible | Variante de nanoGPT en Hugging Face |
| Marcus2112/nanogpt_shakespeare | no disponible | no disponible | no disponible | no disponible | Coleccion de modelos nanoGPT |

No se dispone de datos suficientes para una comparativa tecnica rigurosa. Todos los modelos listados son variantes del nanoGPT original de Karpathy, con pesos convertidos a diferentes formatos. No hay informacion publica sobre rendimiento relativo.

## Limitaciones y advertencias

- Tamano extremadamente reducido: con 10,7 M de parametros, la capacidad de generacion es muy limitada; el texto producido es incoherente a nivel semantico y solo imita superficialmente el estilo de Shakespeare.
- Sin informacion sobre el dataset de entrenamiento: se asume que es el corpus de Shakespeare utilizado en nanoGPT, pero no se confirma ni se detalla su tamano o preprocesamiento.
- Sin especificaciones de contexto: se desconoce la longitud maxima de secuencia soportada, lo que impide planificar usos con dependencias largas.
- Sin cuantizacion ni optimizaciones: los pesos estan en SafeTensors sin cuantizacion declarada, lo que limita su uso en entornos con restricciones de memoria.
- Idioma no declarado: aunque el corpus es ingles, no se especifica oficialmente, y no hay soporte multilingue.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de demostracion, no se recomienda para aplicaciones de produccion.
- Riesgo de alucinacion y sesgos: al ser un modelo de caracteres entrenado con un corpus literario antiguo, puede reproducir lenguaje arcaico o sesgos presentes en la obra de Shakespeare, sin filtros adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dbrll/sheaf-nanogpt-shakespeare
- Repositorio de Sheaf con ejemplo nanoGPT: https://github.com/sheaf-lang/sheaf/tree/main/examples/nanoGPT
- Script de entrenamiento en Sheaf: https://github.com/sheaf-lang/sheaf/blob/main/examples/nanoGPT/train.shf
- Variante cy0307/nanogpt-shakespeare: https://huggingface.co/cy0307/nanogpt-shakespeare
- Coleccion Marcus2112/nanogpt_shakespeare: https://huggingface.co/Marcus2112/nanogpt_shakespeare
