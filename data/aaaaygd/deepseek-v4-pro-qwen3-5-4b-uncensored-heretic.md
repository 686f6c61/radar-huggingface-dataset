# aaaaygd/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "abliterated" (decensurada) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, publicado por el usuario aaaaygd. El modelo base es un fine-tune de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", orientado a razonamiento estructurado y tareas de matematicas y STEM con aproximadamente 250.000 muestras de entrenamiento. Esta version elimina el comportamiento de rechazo mediante la herramienta Heretic v2.0.0, que aplica una tecnica de ablacion de rango arbitrario (ARA) sobre las capas 16 a 32 del transformer.

El resultado es un modelo denso de 4.539.265.536 parametros con licencia Apache 2.0, pesos en safetensors y compatibilidad con transformers y text-generation-inference. Su interes principal radica en dos factores: por un lado, ofrece la receta de destilacion de un modelo grande de razonamiento en una clase de 4B manejable en hardware de consumo; por otro, reduce los rechazos de 99/100 a 5/100 segun la propia model card, con una divergencia KL de 0.0378 respecto al original.

Es relevante ahora porque combina tres tendencias actuales: destilacion de modelos frontera hacia tamanos pequenos, fine-tuning especializado en STEM y tecnicas de decensura que interesan a investigadores que estudian alineamiento, comportamiento de rechazo y edicion de pesos. No obstante, la informacion publicada es limitada: no hay benchmarks estandar ni detalles completos del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), tag `qwen3_5` |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; pesos nativos en safetensors (evaluado con MTP-Q8 segun la card) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 con 4,54 mil millones de parametros. El modelo base (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) se entreno mediante destilacion: se generaron respuestas con DeepSeek-V4-Pro en modo "Max Effect" y se uso un conjunto de aproximadamente 250.000 muestras centradas en matematicas y STEM para el fine-tuning supervisado (SFT) del modelo Qwen3.5-4B. La model card menciona tambien el tag `mtp` (multi-token prediction) y una evaluacion en configuracion MTP-Q8, aunque no se detalla el papel exacto de MTP en el entrenamiento.

Sobre esa base, esta version aplica una ablacion de rango arbitrario (ARA) con Heretic v2.0.0. Los hiperparametros publicados son: `start_layer_index` 16, `end_layer_index` 32, `preserve_good_behavior_weight` 0.9854, `steer_bad_behavior_weight` 0.0002, `overcorrect_relative_weight` 0.6587 y `neighbor_count` 10. La intervencion modifica las capas 16 a 32 (la mitad superior de la red) para suprimir la direccion asociada al comportamiento de rechazo, preservando casi por completo el resto del comportamiento. No se especifica el numero total de capas del modelo ni la composicion exacta del dataset de destilacion mas alla de la cifra aproximada de muestras.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con patrones de descomposicion explicita de problemas aprendidos por destilacion.
- Razonamiento matematico y cientifico (STEM), foco principal del entrenamiento con ~250.000 muestras.
- Generacion de codigo: el tag `reasoning` y la base Qwen3.5 sugieren capacidad de codigo, aunque no se documenta de forma especifica.
- Capacidad multimodal de entrada: el pipeline declarado en Hugging Face es `image-text-to-text`, lo que indica soporte de entrada de imagen y texto.
- Multilingue en seis idiomas: ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento decensurado: reduccion de rechazos de 99/100 a 5/100 segun la model card.
- Tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; el tag `reasoning` apunta a razonamiento interno, no necesariamente a uso agentico.
- Modo thinking explicito: no documentado en la informacion disponible.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el modelo permite estudiar como la ablacion de un subespacio de activaciones en las capas 16-32 altera la tasa de rechazo (de 99/100 a 5/100) con una divergencia KL de 0.0378, util para analizar la geometria interna de la negativa a responder.
- Tutoria de matematicas y fisica: gracias al entrenamiento con ~250.000 muestras STEM destiladas de un profesor mayor, puede descomponer problemas paso a paso en entornos educativos donde se controla el contenido y se filtra la salida.
- Generacion de explicaciones tecnicas en seis idiomas: su cobertura de en, zh, ko, ja, es y ru permite producir documentacion o material divulgativo multilingue sobre temas cientificos con un solo modelo de 4B.
- Prototipado rapido en hardware de consumo: con 4,54B de parametros y pesos safetensors, es viable ejecutarlo en una GPU consumer para experimentos de razonamiento sin depender de APIs externas.
- Evaluacion comparativa de destilacion: sirve como punto de referencia para medir cuanto del rendimiento de un modelo grande de razonamiento se transfiere a la clase 4B en tareas de matematicas y STEM.
- Analisis de robustez y sesgos: al ser un modelo decensurado, es util en entornos de red teaming controlados para estudiar como responde ante peticiones que el modelo original rechazaria, siempre con las salvaguardas externas adecuadas.
- Fine-tuning posterior especializado: al estar bajo Apache 2.0 y en safetensors, puede servir de base para adaptaciones (por ejemplo, el propio autor menciona un fine-tune cientifico DeepThought-STEM derivado de esta familia).

## Benchmarks y rendimiento

La model card solo publica metricas del proceso de decensura, no benchmarks estandar de razonamiento:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0.0378 | 0 (por definicion) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9,1 GB solo para pesos (4,54B × 2 bytes), mas overhead de activaciones y cache KV; en la practica, 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB para pesos; en 4 bits, en torno a 2,3-3 GB para pesos. Los formatos concretos de cuantizacion no estan documentados en la model card.
- GPU recomendadas: A100 o H100 para despliegue en BF16 con throughput alto; RTX 4090 (24 GB) para inferencia comoda en BF16; RTX 3090/4080 (16-24 GB) tambien viables.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas con cuantizacion, y en 16-24 GB en precision completa.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`). No se confirma soporte de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic) | 4,54B | No disponible | Razonamiento STEM destilado, decensurado | Apache 2.0 | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (base) | No disponible (familia 4B) | No disponible | Razonamiento STEM destilado, alineado | No disponible en la informacion | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | No disponible (familia 9B) | No disponible | Misma receta, mayor tamano, decensurado | No disponible en la informacion | Hugging Face |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | No disponible (familia 4B) | No disponible | Fine-tune cientifico sobre esta familia | No disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo decensurado: la supresion del comportamiento de rechazo implica que puede generar contenido que el modelo original bloquearia. Requiere filtros y politicas de uso externas en cualquier despliegue en produccion.
- Riesgo de alucinacion: como todo modelo de 4B destilado, puede producir razonamientos plausibles pero incorrectos, especialmente en problemas largos de matematicas donde el paso intermedio no se verifica.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en MMLU, GSM8K u otros estandares, por lo que las afirmaciones de capacidad STEM no estan verificadas de forma independiente.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Idiomas limitados a seis: en, zh, ko, ja, es y ru; no se garantiza calidad fuera de esos idiomas.
- Procedencia y mantenimiento: el autor es un usuario individual (aaaaygd) con 0 descargas y 1 like en el momento de la ficha; no hay garantia de soporte, actualizaciones ni auditoria del proceso de decensura.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado por una variante decensurada.
- Trazabilidad del dataset: no se detalla la composicion exacta de las ~250.000 muestras ni el proceso de filtrado, lo que dificulta evaluar sesgos inhererentes a los datos.
- El tag `image-text-to-text` sugiere entrada multimodal, pero no se documenta el alcance real de la vision ni su calidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/aaaaygd/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Version 9B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune cientifico DeepThought-STEM: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic (herramienta de decensura): https://heretic-project.org
