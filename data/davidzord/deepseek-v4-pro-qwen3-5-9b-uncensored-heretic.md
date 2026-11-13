# Davidzord/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario Davidzord. El modelo base es a su vez un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con un sesgo claro hacia matematicas y disciplinas STEM. Esta variante concreta aplica una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original.

El modelo conserva la arquitectura y el tamano del base: aproximadamente 9.400 millones de parametros en formato safetensors, con capacidades multimodales de imagen-texto a texto segun los tags del repositorio (image-text-to-text) y soporte declarado para seis idiomas (ingles, chino, coreano, japones, espanol y ruso). La licencia es Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de produccion.

La relevancia de esta ficha radica en dos factores: por un lado, la existencia de un modelo de razonamiento compacto (clase 9B) destilado de un profesor de gran escala, lo que abarata el despliegue; por otro, la intervencion "abliterated" que reduce drasticamente las negativas del modelo (de 100/100 a 3/100 rechazos en la evaluacion del autor) a costa de una divergencia KL de 0,0422 respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), multimodal imagen-texto a texto |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se menciona evaluacion con NVFP4 y MTP) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.5 con aproximadamente 9.400 millones de parametros, orientado a generacion de texto y a entrada multimodal imagen-texto. El entrenamiento del base consistio en una destilacion desde DeepSeek-V4-Pro en modo "Max Effect": se recogieron respuestas del profesor y se uso ese corpus como senal supervisada (SFT) sobre el modelo Qwen3.5-9B. La model card indica aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico, y menciona tecnicas de RL (GSPO), multi-token prediction (MTP) y evaluacion con NVFP4. No se detalla la composicion exacta del dataset ni el numero total de tokens de entrenamiento.

La variante heretic aplica Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24, con pesos de preservacion de comportamiento bueno de 0,8264, de redireccion de comportamiento malo de 0,0003, de correccion relativa de 0,9645 y un vecindario de 12. El resultado declarado por el autor es una reduccion de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 frente al modelo original. No se documentan innovaciones adicionales de decodificacion especulativa ni de atencion lineal mas alla de las ya presentes en la familia Qwen3.5.

## Capacidades

- Generacion de texto y razonamiento multi-paso con descomposicion estructurada de problemas.
- Razonamiento matematico y cientifico (STEM), reforzado por el corpus de destilacion.
- Generacion de codigo y transferencia cruzada a programacion, aunque sin SFT especifico de codigo segun la model card.
- Tool calling y function calling, con soporte declarado en los tags del repositorio.
- Capacidades multimodales de imagen-texto a texto (pipeline image-text-to-text).
- Soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento "uncensored": practicamente sin rechazos ante peticiones que el modelo original declinaba.
- Compatibilidad con endpoints y text-generation-inference.

## Casos de uso

- Tutoria de matematicas y fisica: el modelo puede resolver problemas paso a paso y explicar la descomposicion, aprovechando las ~250.000 muestras STEM de destilacion.
- Generacion de codigo en pipelines de CI/CD: gracias al soporte de tool calling y function calling, puede integrarse como agente que invoca herramientas de build, test o despliegue.
- Analisis de documentacion tecnica con imagenes: al aceptar entrada imagen-texto, sirve para extraer y razonar sobre diagramas, graficos o capturas en informes de ingenieria.
- Asistente de investigacion multilingue: cubre consultas en espanol, ingles, chino, coreano, japones y ruso sin cambiar de modelo.
- Generacion de contenido sin restricciones editoriales: util en entornos de investigacion sobre seguridad, red teaming o creacion literaria donde el modelo original rechazaria peticiones.
- Despliegue en hardware de consumo: con 9,4B parametros puede servirse en una sola GPU consumer de gama alta, lo que permite prototipado local de agentes y asistentes.
- Evaluacion comparativa de robustez: la metrica de rechazos y la KL reportadas permiten usarlo como referencia en estudios sobre alineacion y abliteration.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Solo se reportan las metricas de la intervencion heretic:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB; en 4 bits, alrededor de 6-7 GB (estimaciones a partir del numero de parametros, no confirmadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4080 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en BF16 y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Variante abliterated, 3/100 rechazos, KL 0,0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo base con alineacion intacta (100/100 rechazos) |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Version reducida de la misma familia heretic |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9,4B | no disponible | no disponible | Fine-tune cientifico derivado de este modelo |

No se dispone de datos de rendimiento comparativo en benchmarks para establecer diferencias cuantitativas mas alla de las metricas de rechazo y KL.

## Limitaciones y advertencias

- La abliteration elimina filtros de seguridad: el modelo puede generar contenido danino, ilegal o sensible sin rechazo, lo que exige moderacion externa en produccion.
- La divergencia KL de 0,0422 respecto al original implica cambios de comportamiento mas alla de los rechazos; pueden aparecer regresiones en tareas sensibles a la alineacion.
- Riesgo de alucinacion inherente a los modelos destilados de 9B, especialmente en dominios fuera de matematicas y STEM.
- No hay datos publicados de benchmarks estandar, por lo que el rendimiento real en tareas concretas no esta cuantificado.
- La longitud de contexto no esta documentada en la informacion disponible.
- El sesgo del corpus de destilacion (mayoritariamente matematicas y STEM) puede reducir el rendimiento en dominios creativos o conversacionales.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin filtros de seguridad puede conllevar obligaciones regulatorias adicionales (por ejemplo, en la UE).
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo dia, lo que sugiere ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Davidzord/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico derivado: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic: https://heretic-project.org
