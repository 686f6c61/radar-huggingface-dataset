# Luanneee/ominiVLM

## Resumen

ominiVLM es un proyecto de entrenamiento y alineación de modelos multimodales (VLM) de peso ligero, desarrollado por Luanneee. El proyecto combina dos enfoques: por un lado, un modelo MiniMind-V de 65 millones de parámetros entrenado desde cero (pretraining, SFT, GRPO y DPO) sobre tareas de captioning y VQA; por otro, un adaptador LoRA para el modelo Qwen2.5-VL-7B-Instruct, afinado mediante DPO con pares de preferencia balanceados. Todo el entrenamiento se realizó en una única GPU RTX 4090/4090D de 24 GB con precisión bf16, lo que lo hace accesible para investigadores con recursos limitados.

El repositorio incluye checkpoints, código de entrenamiento, configuraciones y scripts de evaluación, así como ablaciones de arquitectura. La relevancia actual radica en demostrar que es posible obtener resultados competitivos en tareas multimodales con presupuesto computacional reducido, y en ofrecer una alternativa abierta (licencia Apache-2.0) para desarrolladores que necesiten modelos VLM ligeros o adaptadores de bajo coste sobre bases ya establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMind-V (transformer multimodal) y adaptador LoRA sobre Qwen2.5-VL-7B-Instruct |
| Parametros totales | 65M (modelo pequeño) y 7B (base del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (para el adaptador) y .pth (para el modelo 65M) |

## Arquitectura y entrenamiento

El proyecto incluye dos arquitecturas diferenciadas. El modelo MiniMind-V de 65M es un transformer multimodal entrenado desde cero, con un proceso que abarca pretraining, SFT multitarea (captioning, VQAv2, OK-VQA, MMBench), GRPO y DPO. El segundo componente es un adaptador LoRA para Qwen2.5-VL-7B-Instruct, afinado con DPO sobre 11 093 pares de preferencia balanceados (β=0.1). No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset, pero se mencionan los conjuntos de evaluación y los datos de preferencia. La innovación principal reside en la viabilidad de entrenar un VLM desde cero en una GPU de consumo y en la combinación de técnicas de alineación (GRPO + DPO) sobre un modelo pequeño y sobre un adaptador de un modelo grande.

## Capacidades

- Generacion de descripciones de imagenes (captioning) con resultados evaluados en COCO (CIDEr 0.6395 para el modelo de 65M, 0.9973 para el adaptador DPO).
- Respuesta a preguntas visuales (VQA) en datasets como VQAv2 y OK-VQA.
- Razonamiento multimodal basico, con puntuaciones en MMBench (26.0% para 65M, 87.32% para el adaptador).
- Deteccion de alucinaciones visuales, evaluada con POPE (37.4% para 65M, 95.2% para el adaptador).
- Soporte bilingue ingles y chino.
- No se menciona soporte explicito de tool calling, agentes o vision adicional (video, audio).

## Casos de uso

- Generacion de descripciones automaticas para accesibilidad: el modelo de 65M puede integrarse en aplicaciones moviles o web para describir imagenes a usuarios con discapacidad visual, gracias a su bajo coste computacional y a la posibilidad de ejecutarse en dispositivos con recursos limitados.
- Moderacion de contenido visual: el adaptador DPO sobre Qwen2.5-VL-7B puede utilizarse para clasificar o describir imagenes en flujos de moderacion, aprovechando su alta puntuacion en POPE (95.2%) para reducir falsas descripciones.
- Asistentes de soporte tecnico con capturas de pantalla: un sistema de atencion al cliente puede recibir capturas de pantalla de errores y generar descripciones o respuestas contextuales usando el modelo de 7B afinado.
- Educacion y tutorizacion visual: el modelo puede responder preguntas sobre diagramas, graficos o ilustraciones en entornos educativos, tanto en ingles como en chino.
- Investigacion en alineacion de modelos: el repositorio ofrece checkpoints y codigo para reproducir experimentos de GRPO y DPO, lo que permite a investigadores estudiar el impacto de estas tecnicas en modelos pequenos.
- Prototipado rapido de aplicaciones VLM: los desarrolladores pueden usar el adaptador LoRA con PEFT para integrar capacidades multimodales en pipelines existentes sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion para dos configuraciones:

| Modelo | VQAv2 | MMBench | OK-VQA | COCO CIDEr | COCO BLEU-4 | POPE |
|---|---:|---:|---:|---:|---:|---:|
| 65M multitask | 32.8% | 26.0% | 3.2% | 0.6395 | 0.2271 | 37.4% |
| 7B DPO v6 (adaptador) | 47.7%* | 87.32% | 45.9%–47.7% | 0.9973 | — | 95.2% |

*Nota: los valores de OK-VQA y CIDEr para el adaptador DPO corresponden a la etapa con preferencias balanceadas y β=0.1. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El entrenamiento se realizo en una RTX 4090/4090D de 24 GB con bf16, lo que indica que la inferencia del modelo de 65M puede ejecutarse en GPUs de consumo con menos de 4 GB de VRAM.
- Para el adaptador LoRA sobre Qwen2.5-VL-7B-Instruct, se requiere al menos 16-24 GB de VRAM en precision completa, aunque con cuantizacion (por ejemplo, 4-bit) podria caber en una RTX 3080/4080 de 12-16 GB.
- Opciones de despliegue: el modelo de 65M puede cargarse con PyTorch estandar (ficheros .pth) o exportarse a ONNX. El adaptador LoRA se integra con la libreria PEFT y transformers, y puede servirse con vLLM o TGI si se fusiona con el modelo base.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El proyecto se posiciona como una alternativa ligera a modelos VLM de tamano completo, pero no se ofrecen benchmarks frente a otros sistemas. Se puede considerar que compite con modelos como LLaVA (7B) o MiniGPT-4, aunque no hay datos de comparacion directa.

## Limitaciones y advertencias

- El modelo de 65M presenta un rendimiento bajo en tareas complejas de VQA (OK-VQA 3.2%), lo que limita su uso en escenarios que requieran razonamiento visual avanzado.
- Riesgo de alucinaciones: aunque el adaptador DPO mejora la puntuacion POPE (95.2%), el modelo pequeno tiene una tasa de alucinacion alta (37.4%), por lo que no es fiable para aplicaciones criticas sin supervisión.
- La longitud de contexto no esta documentada; en modelos VLM suele estar limitada por el encoder visual y el LLM subyacente, pero no se puede confirmar.
- Idiomas limitados a ingles y chino; no se garantiza un buen comportamiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero el adaptador depende del modelo base Qwen2.5-VL-7B-Instruct, que tiene su propia licencia (Qwen Research License) y puede imponer restricciones adicionales.
- No se proporcionan garantias de robustez ante imagenes adversariales o distribuciones fuera del dominio de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Luanneee/ominiVLM
- Codigo fuente y scripts: https://github.com/Icecream102/ominiVLM
