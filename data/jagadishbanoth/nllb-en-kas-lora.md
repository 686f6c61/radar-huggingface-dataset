# JagadishBanoth/nllb-en-kas-lora

## Resumen

El modelo `JagadishBanoth/nllb-en-kas-lora` es un adaptador LoRA (Low-Rank Adaptation) para traducción automática de inglés a cachemiro, desarrollado específicamente para el desafío KATHE 2026: AI Challenge for Kashmiri Language Translation. Se basa en el modelo `facebook/nllb-200-distilled-600M`, un transformer de 600 millones de parámetros de la familia NLLB-200 de Meta, y ha sido ajustado mediante técnicas de fine-tuning eficiente en parámetros (PEFT).

El adaptador traduce desde inglés (`eng_Latn`) a cachemiro en escritura árabe (`kas_Arab`), un par de lenguas de bajos recursos que apenas cuenta con sistemas de traducción disponibles. Su relevancia radica en abordar una lengua minoritaria con una solución ligera y eficiente, ya que solo se actualizan las proyecciones de atención `q_proj` y `v_proj` durante el entrenamiento, lo que reduce drásticamente el coste computacional frente a un fine-tuning completo.

El repositorio contiene únicamente los pesos del adaptador LoRA, no el modelo base completo. Para su uso es necesario cargar `facebook/nllb-200-distilled-600M` desde Hugging Face y combinar ambos componentes. El modelo fue entrenado con datos paralelos del Bharat Parallel Corpus Collection (BPCC) durante una sola época, con precisión FP16 y un learning rate de 2e-4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NLLB-200 Transformer (distilled 600M) con adaptador LoRA |
| Parametros totales | 600M (modelo base) + adaptador LoRA (rank 16, no disponible el numero exacto de parametros del adaptador) |
| Parametros activos | no disponible (el modelo base no es MoE) |
| Longitud de contexto | no disponible (heredada de NLLB-200, tipicamente 512 tokens) |
| Tipos de cuantizacion | FP16 (entrenamiento); cuantizacion del adaptador no especificada |
| Idiomas soportados | Ingles (fuente), cachemiro en escritura arabe (destino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `facebook/nllb-200-distilled-600M`, una version destilada del NLLB-200 de Meta, que emplea una arquitectura transformer encoder-decoder estandar con atencion de multiples cabezas. Sobre esta base se ha aplicado un adaptador LoRA con rank 16, alpha 32 y dropout 0.1, dirigido exclusivamente a las proyecciones de query (`q_proj`) y value (`v_proj`) de las capas de atencion. Esta configuracion es clasica en tareas de secuencia a secuencia y permite un ajuste eficiente sin modificar los pesos originales del modelo.

El entrenamiento se realizo con datos paralelos ingles-cachemiro del corpus BPCC, con particiones de entrenamiento, validacion y test independientes. Se utilizo una sola epoca, un learning rate de 2e-4, un batch efectivo de 16 y precision FP16. La tarea se configuro como `SEQ_2_SEQ_LM` en PEFT, lo que indica que el adaptador se entrena para la generacion de secuencias condicionada al idioma fuente. No se menciona el uso de tecnicas adicionales como RLHF o DPO.

## Capacidades

- Traduccion automatica de ingles a cachemiro en escritura arabe (`eng_Latn` → `kas_Arab`).
- Generacion de texto condicionada al par de lenguas indicado mediante los tokens de idioma de NLLB-200.
- Fine-tuning eficiente con LoRA, lo que permite cargar el adaptador sobre el modelo base sin necesidad de duplicar pesos.
- Compatible con el ecosistema PEFT de Hugging Face, facilitando la integracion en pipelines de traduccion existentes.
- Entrenado especificamente para el dominio de datos paralelos de BPCC, orientado a textos generales y no a dominios especializados.
- No soporta tool calling, agentes, vision, audio ni capacidades multimodales.

## Casos de uso

- Investigacion en traduccion de lenguas de bajos recursos: el adaptador sirve como punto de partida para experimentos con cachemiro, una lengua con escasa representacion en sistemas de traduccion neuronales.
- Evaluacion en el desafio KATHE 2026: el modelo esta disenado para participar en la competicion de traduccion de cachemiro, por lo que puede usarse como sistema de referencia o baseline en el entorno de evaluacion del concurso.
- Prototipado rapido de servicios de traduccion ingles-cachemiro: gracias a su tamano reducido y al uso de LoRA, puede desplegarse en entornos con recursos limitados para generar traducciones preliminares.
- Creacion de datasets de entrenamiento para otros modelos: las traducciones generadas pueden emplearse como datos sinteticos para entrenar modelos mas grandes o para ampliar corpus paralelos.
- Desarrollo de herramientas de asistencia linguistica para la comunidad cachemira: aplicaciones de traduccion de textos generales, noticias o contenido web dirigidas a hablantes de cachemiro.
- Comparacion de metodos PEFT en traduccion: el adaptador puede utilizarse para estudiar el impacto del rank de LoRA, los modulos objetivo o el numero de epocas en la calidad de la traduccion de lenguas minoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como BLEU, chrF o COMET, ni comparaciones con otros sistemas de traduccion ingles-cachemiro.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el modelo base tiene 600M de parametros y el adaptador es pequeno, la inferencia en FP16 requiere aproximadamente 1.2-1.5 GB de VRAM, pero este dato no esta confirmado por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Se recomienda una NVIDIA T4, RTX 3060 o superior para un rendimiento fluido.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPU de consumo como la serie RTX 30/40 de NVIDIA.
- Opciones de despliegue: el adaptador PEFT puede cargarse con la libreria `peft` de Hugging Face, y el modelo base con `transformers`. Para inferencia en produccion, puede integrarse con vLLM o TGI, aunque no hay documentacion especifica del autor al respecto. Tambien es posible exportar el modelo combinado a formato GGUF para su uso con llama.cpp u Ollama, pero no se proporcionan instrucciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificamente entrenados para traduccion ingles-cachemiro. La alternativa mas cercana seria el propio `facebook/nllb-200-distilled-600M` sin ajuste, que ya soporta cachemiro entre sus 200 idiomas, pero con una calidad presumiblemente inferior para este par de lenguas al no estar especializado. Otros modelos multilingues como M2M-100 de Meta o mT5 de Google tambien cubren cachemiro, pero no se han encontrado adaptadores LoRA publicos comparables para esta tarea concreta.

## Limitaciones y advertencias

- El modelo es un adaptador LoRA, no un modelo completo: es imprescindible cargar el modelo base `facebook/nllb-200-distilled-600M` para su funcionamiento.
- Entrenado con una sola epoca y un unico corpus (BPCC), por lo que su cobertura linguistica y su robustez son limitadas.
- No debe utilizarse como sistema de traduccion generalista ni como fuente autorizada de traducciones.
- Las traducciones deben ser revisadas por un hablante fluido de cachemiro cuando la precision sea critica, especialmente en contenidos legales, medicos, financieros o de alto riesgo.
- La licencia no esta especificada, lo que genera incertidumbre sobre las condiciones de uso comercial y redistribucion.
- No se han publicado evaluaciones cuantitativas, por lo que se desconoce la calidad real de las traducciones.
- El modelo esta limitado al par ingles-cachemiro en escritura arabe; no soporta otras variantes dialectales ni la escritura devanagari del cachemiro.
- La fecha de creacion (2026-08-16) sugiere que el modelo es reciente y puede carecer de mantenimiento o soporte.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JagadishBanoth/nllb-en-kas-lora
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Libreria PEFT: https://github.com/huggingface/peft
- Bharat Parallel Corpus Collection (BPCC): no se ha encontrado un enlace directo en la informacion proporcionada.
