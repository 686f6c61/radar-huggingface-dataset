# ms02222026/DAN-Qwen3-1.7B

## Resumen

DAN-Qwen3-1.7B es un modelo de lenguaje de 1.700 millones de parámetros, resultado de un fine-tuning sin filtros sobre la base Qwen/Qwen3-1.7B de Alibaba Cloud. El autor, identificado como ms02222026 en HuggingFace (aunque la model card original atribuye la autoría a UnfilteredAI), lo presenta como un modelo "sin censura" diseñado para generar contenido explícito, tóxico y agresivo, eliminando los mecanismos de alineación de seguridad presentes en el modelo original. Se distribuye bajo licencia Apache-2.0, con pesos en formato safetensors y una ventana de contexto declarada de 32k tokens (aunque fuentes externas mencionan 33k o 40k).

El modelo está pensado exclusivamente para investigación sobre los límites de la seguridad en IA y el comportamiento de modelos desalineados. Su relevancia radica en que ejemplifica una tendencia creciente de modelos "uncensored" derivados de arquitecturas abiertas, y plantea interrogantes sobre los riesgos de su despliegue en entornos no controlados. No obstante, carece de benchmarks publicados y su utilidad práctica en producción es nula o muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, basada en Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32k tokens (segun model card; otras fuentes citan 33k o 40k) |
| Tipos de cuantizacion | no disponible (repositorio solo contiene safetensors en precision completa) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la misma que la de Qwen3-1.7B: un transformer decoder-only con atencion causal, mecanismos de thinking mode (razonamiento explicito) y soporte nativo para tool calling. El fine-tuning se realizo sobre esta base con un dataset curado a partir de "dialogos toxicos, conversaciones crudas de internet e interacciones de alta agresividad", segun la model card. El proceso incluye la eliminacion de las restricciones de alineamiento de seguridad, un ajuste de sesgo hacia la maxima expresion y una fase experimental de reinforcement learning para potenciar respuestas agresivas y provocadoras. No se proporcionan detalles tecnicos sobre el numero de tokens de entrenamiento, el metodo exacto de fine-tuning (LoRA, full fine-tune, etc.) ni la composicion precisa del dataset.

## Capacidades

- Generacion de texto sin restricciones de contenido, incluyendo material NSFW, violencia y lenguaje toxico.
- Modo "DAN" (Do Anything Now) que elimina los filtros de seguridad del modelo base.
- Persona "oscura" que simula emociones humanas crudas, incluyendo agresividad y respuestas extremas.
- Soporte de thinking mode (aunque la model card advierte que "thinking does not work" en este fine-tuning).
- Soporte de tool calling heredado de Qwen3, aunque no se ha verificado su funcionamiento tras el fine-tuning.
- Capacidades multilingues limitadas: solo ingles declarado.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como se comportan los modelos cuando se eliminan los mecanismos de alineamiento, y que tipo de contenido pueden generar sin restricciones.
- Evaluacion de tecnicas de red teaming: probar la robustez de sistemas de moderacion y filtrado de contenido frente a modelos disenados para evadirlos.
- Analisis de sesgos y toxicidad: examinar que patrones de lenguaje toxico y agresivo emergen cuando un modelo es entrenado explicitamente para ello.
- Desarrollo de contramedidas de seguridad: entrenar clasificadores de contenido nocivo o sistemas de guardrail utilizando las salidas de este modelo como casos adversos.
- Estudio de alineacion de IA: comparar el comportamiento de Qwen3-1.7B original frente a esta version desalineada para medir el impacto del fine-tuning en la seguridad.
- Experimentos de desalineacion controlada: investigar como los modelos pueden ser inducidos a ignorar instrucciones de seguridad y que factores contribuyen a ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Tampoco se encontraron resultados externos verificables en las busquedas web.

## Requisitos de hardware

- VRAM estimada: alrededor de 3,4 GB en precision FP16 segun LLM Explorer, lo que permite ejecucion en GPUs de consumo con 4 GB o mas de VRAM.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650/1660, RTX 3050, RTX 3060, o superiores. Tambien compatible con Apple Silicon (M1/M2/M3) mediante Metal.
- Cabe en GPUs de consumo: si, es un modelo de 1,7B parametros, apto para hardware domestico.
- Opciones de despliegue: transformers con PyTorch, vLLM, llama.cpp, Ollama, text-generation-inference (TGI). El repo es compatible con endpoints de HuggingFace.
- Latencia y throughput: no disponible, aunque por su tamano se espera una generacion rapida incluso en CPU con cuantizacion (si se convierte a GGUF).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristica principal |
|---|---|---|---|---|
| DAN-Qwen3-1.7B | 1,7B | 32k | Apache-2.0 | Sin filtros, contenido toxico/NSFW |
| Qwen/Qwen3-1.7B | 1,7B | 32k | Apache-2.0 | Modelo base con alineamiento de seguridad |
| UnfilteredAI/DAN-Qwen3-1.7B | 1,7B | 32k | Apache-2.0 | Version original del mismo fine-tuning (misma arquitectura) |

No hay datos de rendimiento comparativo disponibles. La unica diferencia relevante frente al modelo base es la eliminacion de los filtros de seguridad, que no se refleja en metricas estandar. Otros modelos "uncensored" de tamano similar (como Dolphin, WizardLM-Uncensored o Nous Hermes) podrian compararse en cuanto a comportamiento, pero no se dispone de datos objetivos en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido nocivo: el modelo genera deliberadamente material NSFW, violento, toxico y potencialmente ilegal. No apto para menores ni para entornos no controlados.
- Sin salvaguardas: carece de cualquier mecanismo de moderacion o rechazo de solicitudes peligrosas.
- Riesgo de alucinacion: al ser un fine-tuning sin alineamiento, puede producir afirmaciones falsas, peligrosas o incendiarias con total seguridad.
- Sesgos extremos: el entrenamiento con datos toxicos y agresivos refuerza sesgos discriminatorios y lenguaje ofensivo.
- Thinking mode roto: la model card advierte que el modo de razonamiento explicito no funciona correctamente en este fine-tuning.
- Solo ingles: no se garantiza un comportamiento coherente en otros idiomas.
- Uso comercial: aunque la licencia Apache-2.0 lo permite, el despliegue en produccion conlleva riesgos legales y eticos graves. El autor declina toda responsabilidad.
- Reproducibilidad: no se publican detalles del dataset ni del proceso de entrenamiento, lo que impide verificar o replicar los resultados.

## Enlaces

- Repositorio HuggingFace (ms02222026): https://huggingface.co/ms02222026/DAN-Qwen3-1.7B
- Repositorio original (UnfilteredAI): https://huggingface.co/UnfilteredAI/DAN-Qwen3-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Ficha en LLM Explorer: https://llm-explorer.com/model/UnfilteredAI%2FDAN-Qwen3-1.7B,4YqFWT2Bjasp5EcaY9A8QZ
- Ficha en Antbase: https://antbase.ai/models/dan-qwen3-1-7b
