# DuoNeural/RMSN-SFT-d1536-seed3-390M

## Resumen

RMSN-SFT-d1536-seed3-390M es un modelo de lenguaje desarrollado por DuoNeural, publicado en Hugging Face con licencia MIT. El identificador del modelo indica una variante afinada mediante SFT (supervised fine-tuning) de una arquitectura denominada RMSN, con dimensión de modelo 1536 y aproximadamente 390 millones de parámetros, correspondiente a la semilla 3 de una serie de experimentos. La model card pública no incluye descripción funcional, datos de entrenamiento ni resultados de evaluación.

Los tags del repositorio apuntan a una arquitectura poco convencional: "metriplectic" (sistemas dinámicos que combinan una parte conservativa hamiltoniana con una parte disipativa), "sheaf-network" (redes basadas en haces matemáticos, posiblemente para composicionalidad o consistencia local-global) y "recurrent" (procesamiento recurrente en lugar de o junto con atención transformer estándar). Se trata, por tanto, de un modelo de investigación más que de un producto listo para producción.

Su relevancia actual es limitada pero real para quien investigue arquitecturas alternativas al transformer puro: ofrece pesos abiertos (1,6 GB en el repositorio) bajo licencia permisiva, lo que permite inspeccionar y reproducir el enfoque. No obstante, la ausencia de documentación, benchmarks y casos de uso en la model card obliga a tratar cualquier capacidad como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (tags: metriplectic, sheaf-network, recurrent); detalles no disponibles |
| Parametros totales | ~390M (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 1,6 GB; el formato concreto no se especifica) |

## Arquitectura y entrenamiento

El nombre del modelo indica una dimensión oculta de 1536 y un total de aproximadamente 390 millones de parámetros. Los tags "metriplectic", "sheaf-network" y "recurrent" sugieren una arquitectura recurrente basada en principios de sistemas dinámicos (estructura metripléctica: flujo conservativo más disipativo) y en teoría de haces, en lugar de un transformer decoder convencional. No se dispone de documentación técnica que confirme cómo se combinan estos componentes, el número de capas, el mecanismo de atención (si lo hay) ni el esquema de recurrencia.

Respecto al entrenamiento, el sufijo "SFT" indica que los pesos publicados corresponden a un ajuste supervisado sobre un modelo base previo, presumiblemente entrenado por DuoNeural. No se especifican en la información disponible el volumen de tokens de preentrenamiento, la composición del dataset, el uso de RLHF/DPO, ni detalles del proceso de SFT (número de ejemplos, formato de las instrucciones, hiperparámetros). Tampoco se documentan innovaciones técnicas concretas más allá de lo que sugieren los tags.

## Capacidades

- Generación de texto: el tag "language-model" y el sufijo SFT indican que el modelo está orientado a modelado de lenguaje y ajuste por instrucciones, aunque no se documentan ejemplos de salida.
- Razonamiento y matemáticas: no disponible (sin benchmarks ni descripciones).
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas está vacío en la ficha de Hugging Face).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo permite estudiar en la práctica una red recurrente con formulación metripléctica y de haces, comparando su comportamiento con transformers de tamaño similar en tareas controladas de laboratorio.
- Reproducción de experimentos académicos: al estar liberado con licencia MIT y pesos abiertos, un grupo de investigación puede partir de estos pesos para replicar o extender el trabajo de DuoNeural sobre el que se basa la serie "seed3".
- Análisis de dinámica de entrenamiento: la nomenclatura por semillas ("seed3") sugiere que el autor publica variantes para estudiar variabilidad; estos pesos sirven para analizar sensibilidad a la inicialización en arquitecturas recurrentes.
- Fine-tuning experimental en dominios acotados: con 390M de parámetros y licencia permisiva, es viable ajustarlo en un único GPU para tareas de clasificación o generación de dominio específico, siempre que se validen previamente sus capacidades base.
- Docencia y formación: útil como ejemplo práctico de modelos pequeños con arquitecturas no convencionales en cursos de deep learning o sistemas dinámicos aplicados al aprendizaje automático.
- Prototipado de bajo coste: su tamaño reducido permite desplegarlo en hardware modesto para pruebas de concepto internas, asumiendo que su calidad de generación no está verificada públicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~390M de parámetros, en FP16 se requieren aproximadamente 0,8 GB solo para pesos; en FP32, unos 1,6 GB. Añadiendo overhead de activaciones y caché (si aplica), un presupuesto de 2-4 GB es razonable, aunque no se ha verificado con la arquitectura real.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100) debería bastar; las GPU de datacenter solo serían necesarias para entrenamiento o fine-tuning.
- ¿Cabe en consumer GPU? Sí, previsiblemente en cualquier GPU consumer moderna con 6 GB o más, dado el tamaño del modelo.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al tratarse de una arquitectura no estándar (recurrente/metripléctica), es probable que requiera código propio del autor y no funcione directamente en los runners habituales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-SFT-d1536-seed3-390M | ~390M | no disponible | MIT | Hugging Face | Arquitectura no estándar, sin benchmarks |
| Qwen2.5-0.5B | ~500M | 32K (según versión) | Apache 2.0 | Hugging Face | Transformer estándar, benchmarks publicados |
| SmolLM2-360M | ~360M | 8K (según versión) | Apache 2.0 | Hugging Face | Transformer estándar, orientado a dispositivos |
| GPT-2 small | ~124M | 1K | MIT | Hugging Face | Referencia histórica transformer |

La comparación con modelos transformer pequeños de propósito general es solo orientativa: RMSN-SFT no publica métricas que permitan una comparación de rendimiento rigurosa, y su arquitectura no estándar implica que las herramientas y optimizaciones del ecosistema (vLLM, llama.cpp) probablemente no estén disponibles para él.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe datos de entrenamiento, idiomas, contexto ni comportamiento esperado; cualquier uso en producción requiere evaluación propia exhaustiva.
- Riesgo de alucinación: no cuantificado; en modelos pequeños sin evaluación publicada, la tasa de alucinación suele ser alta y no debe asumirse ningún nivel de fiabilidad.
- Sesgos: desconocidos, al no documentarse la composición del dataset de preentrenamiento ni de SFT.
- Limitaciones de idioma: el campo de idiomas está vacío; no hay garantía de un rendimiento aceptable en castellano ni en ningún otro idioma.
- Compatibilidad de herramientas: al no ser un transformer estándar, es probable que no funcione con vLLM, TGI, llama.cpp u Ollama sin adaptaciones; el formato de pesos no se especifica.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; la responsabilidad legal y ética del uso recae íntegramente en el usuario.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin evidencia de validación por la comunidad.
- Contexto: al desconocerse la ventana de contexto, no debe asumirse soporte para conversaciones largas o documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-d1536-seed3-390M
- Perfil del autor en Hugging Face: https://huggingface.co/DuoNeural
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
