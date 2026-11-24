# acvlab/ABot-World-0-5-5B-Iris-BiT

## Resumen

ABot-World-0.5 es una familia de modelos generativos orientados a la simulación de entornos físicos y a la generación de vídeo condicionada por acciones, desarrollada por el equipo ABot-World (acvlab, vinculado a AMAP/ALibaba). El modelo que nos ocupa, **Iris-BiT**, es una variante de 5.500 millones de parámetros del modelo Iris-5B, orientada a la generación de vídeo acción-condicionado con un backbone de tipo BiT (probablemente un transformer bidireccional para el decodificador de difusión). El objetivo declarado es modelar la "cadena de causalidad" física: que las consecuencias de cada acción persistan y condicionen la siguiente interacción, algo relevante para robótica, simulación y agentes encarnados.

La propuesta encaja en la estela de los "world models" generativos que combinan difusión de vídeo con control por acciones, y su relevancia actual radica en que promete streaming a 21 FPS en una única GPU de consumo (RTX 5090) para la variante Iris-5B. La información pública disponible es muy limitada: la model card es fundamentalmente un README de presentación con enlaces, sin tabla de especificaciones, sin datos de entrenamiento detallados y sin benchmarks numéricos para esta variante concreta. El repositorio ocupa 10,5 GB y no registra descargas ni likes en el momento de la consulta.

Se trata, por tanto, de un lanzamiento reciente (creado el 24 de noviembre de 2026) del que aún no se ha publicado el informe técnico ("Technical Report Coming Soon") ni el código asociado, lo que limita cualquier evaluación rigurosa de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "BiT" sugiere backbone transformer bidireccional; sin confirmar) |
| Parametros totales | 5.500 millones (según nombre del modelo, "5B") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según badge de la model card; el campo de licencia del repo figura como no disponible) |
| Formato de pesos | no disponible (repo de 10,5 GB, formato no especificado) |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos publicados sobre la arquitectura interna de Iris-BiT. La model card menciona que la familia ABot-World-0.5 modela la "cadena de causalidad" y que la variante Iris-5B genera vídeo condicionado por acciones a 21 FPS en una RTX 5090; también menciona componentes como **TAEC** (alineamiento de prompts de evento con sus intervalos latentes para que cada habilidad se dispare en el momento correcto del rollout) y **Prompt Switch** (redirección de comportamientos a mitad de rollout). Sin embargo, no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO.

El equipo publica dos datasets asociados: `ABot-World-Explorer-500h` (500 horas de datos de exploración) y `ABot-World-Explorer-4D`, lo que sugiere un entrenamiento centrado en datos de navegación y exploración física. La variante Halo-30B, según la model card, añade audio sincronizado y alcanzó el puesto #1 en WBench Navigation (Average 84,8; Physical 74,2) bajo el juez Qwen3.8-27B. No hay información equivalente para Iris-BiT.

## Capacidades

- Generación de vídeo condicionada por acciones (pipeline `ti2v`, text/image-to-video).
- Simulación de dinámica física con persistencia causal entre pasos (la consecuencia de una acción condiciona la siguiente).
- Streaming de vídeo a 21 FPS en una RTX 5090 según la model card (dato referido a Iris-5B; no confirmado para Iris-BiT).
- Control de comportamiento mediante "Prompt Switch" (redirección a mitad de rollout).
- Alineamiento temporal de eventos mediante TAEC (disparo de habilidades en el momento correcto).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de lenguaje; el modelo es generativo de vídeo.
- Capacidades multilingües: no disponible.
- Capacidades especiales: navegación y exploración física (según datasets asociados); audio solo en la variante Halo-30B, no en Iris-BiT.

## Casos de uso

- Simulación de entornos para robótica: el modelo puede generar rollouts de vídeo condicionados por acciones para entrenar o validar políticas de navegación antes de desplegarlas en hardware real, reduciendo el coste de la experimentación física.
- Generación de vídeo para previsualización de trayectorias: dado un plan de acciones, producir un vídeo que muestre el resultado esperado, útil en herramientas de autoría de comportamiento.
- Entrenamiento de agentes encarnados en simulación: usar los rollouts generados como datos aumentados para políticas de navegación, aprovechando la persistencia causal entre pasos.
- Prototipado rápido de escenas interactivas: creadores y desarrolladores de videojuegos pueden generar clips acción-condicionados para validar mecánicas sin un motor físico completo.
- Investigación en world models: banco de pruebas para estudiar la consistencia física y la causalidad en modelos generativos de vídeo.
- Evaluación comparativa de control por prompts: el mecanismo Prompt Switch permite probar redirecciones de comportamiento a mitad de secuencia, útil en estudios de robustez de agentes.
- Demostraciones interactivas en streaming: a 21 FPS en una RTX 5090 (dato de Iris-5B), puede alimentar demos en vivo de simulación acción-condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para Iris-BiT en la información disponible. La model card cita resultados únicamente para la variante Halo-30B (WBench Navigation: Average 84,8; Physical 74,2, con juez Qwen3.8-27B), que no son extrapolables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (5,5B parámetros), en FP16 requeriría del orden de 11 GB solo para pesos, más memoria para activaciones y decodificador de vídeo; en cuantización de 8 bits, unos 6 GB; en 4 bits, unos 3-4 GB. Estas cifras son estimaciones por tamaño, no datos publicados.
- GPU recomendadas: la model card menciona una RTX 5090 para el streaming a 21 FPS de Iris-5B; para Iris-BiT no se especifica.
- Cabe en GPU de consumo: previsiblemente sí en GPUs con 16-24 GB de VRAM, aunque no está confirmado para esta variante.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de vídeo, es probable que requiera un stack de difusión específico, no confirmado).
- Latencia y throughput: 21 FPS en RTX 5090 citado para Iris-5B; no confirmado para Iris-BiT.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento de Iris-BiT que permitan una comparación rigurosa. Como referencia interna de la propia familia, existe la variante Iris-5B (sin sufijo BiT) y la variante Halo-30B con audio, pero no se detallan diferencias técnicas entre Iris-5B e Iris-BiT.

## Limitaciones y advertencias

- Ausencia de informe técnico: la model card indica "Technical Report Coming Soon"; no hay paper que respalde las afirmaciones.
- Sin benchmarks publicados para esta variante: no es posible verificar calidad, consistencia física ni fidelidad acción-condicionada.
- Licencia: el badge indica Apache 2.0, pero el campo de licencia del repositorio figura como no disponible; conviene verificar el archivo LICENSE antes de uso comercial.
- Idiomas no declarados: no se especifica soporte multilingüe.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir dinámicas físicamente inconsistentes o artefactos, especialmente fuera de la distribución de entrenamiento.
- Sesgos: no documentados; los datasets de exploración pueden introducir sesgos de escena, iluminación o entorno.
- Contexto: no se especifica longitud de contexto ni de ventana temporal de generación.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; ecosistema y herramientas de despliegue no documentados.
- Datos de rendimiento (21 FPS) referidos a otra variante (Iris-5B), no a Iris-BiT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acvlab/ABot-World-0-5-5B-Iris-BiT
- Modelo en ModelScope: https://modelscope.cn/models/amap_cvlab/ABot-World-0-5-5B-Iris-BiT
- Variante Iris-5B en Hugging Face: https://huggingface.co/acvlab/ABot-World-0-5-5B-Iris
- Variante Iris-5B en ModelScope: https://modelscope.cn/models/amap_cvlab/ABot-World-0-5-5B-Iris
- Página del proyecto: https://amap-cvlab.github.io/ABot-World/
- Repositorio de código: https://github.com/amap-cvlab/ABot-World
- Estudio/demo: https://abot-world.amap.com
- Dataset 500h en Hugging Face: https://huggingface.co/datasets/acvlab/ABot-World-Explorer-500h
- Dataset 500h en ModelScope: https://modelscope.cn/datasets/amap_cvlab/ABot-World-Explorer-500h
- Dataset 4D en Hugging Face: https://huggingface.co/datasets/acvlab/ABot-World-Explorer-4D
- Dataset 4D en ModelScope: https://modelscope.cn/datasets/amap_cvlab/ABot-World-Explorer-4D
