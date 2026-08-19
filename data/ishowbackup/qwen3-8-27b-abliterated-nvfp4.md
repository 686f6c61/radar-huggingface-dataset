# Ishowbackup/Qwen3.8-27B-ABLITERATED-NVFP4

## Resumen

Qwen3.8-27B-ABLITERATED-NVFP4 es un checkpoint de investigación cuantizado en formato W4A4 NVFP4, derivado del modelo Qwen3.8-27B de Alibaba, al que Blackfrost ha aplicado una modificación a nivel de pesos para reducir la superficie de rechazo (abliteration). El resultado es un modelo denso multimodal (texto, imagen y vídeo) con una ventana de contexto nativa de 262 144 tokens, pensado para servir de forma eficiente en GPUs Blackwell mediante NVIDIA ModelOpt. Este artefacto no es un fine-tuning de seguridad ni un merge: es una cuantización del maestro BF16 de Blackfrost, que a su vez es una derivación del checkpoint oficial de Qwen con la dirección de rechazo alterada.

El modelo está publicado como vista previa pública de investigación, sin restricciones de acceso, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en dos frentes: por un lado, demuestra la viabilidad de ejecutar un VLM de 27B con cuantización W4A4 en hardware Blackwell con una degradación de perplejidad moderada (9,37 frente a 8,48 del BF16 original); por otro, plantea un caso de estudio sobre los límites del abliteration, con una tasa de rechazo del 17,8 % en un conjunto de evaluación de 450 casos. No debe confundirse con el checkpoint de seguridad oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B dense hybrid VLM (Gated DeltaNet + full attention) |
| Parametros totales | 27B nominales; 18 548 690 160 segun safetensors (discrepancia sin aclarar) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | NVIDIA ModelOpt W4A4 NVFP4 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con metadatos ModelOpt NVFP4 (4 shards, ~30,26 GB) |

## Arquitectura y entrenamiento

La arquitectura base es la del Qwen3.8-27B de Alibaba, un modelo denso híbrido que combina capas con Gated DeltaNet (una variante de atención lineal recurrente) con capas de atención completa. Esta combinación permite manejar secuencias largas de forma eficiente. El checkpoint de Blackfrost aplica una modificación direccional a nivel de pesos sobre la superficie de rechazo del modelo, sin emplear SFT, DPO, LoRA, pruning ni merging. El proceso exacto (banco de direcciones, escala, datos de calibración) no se ha publicado. Posteriormente, el maestro BF16 se cuantiza a W4A4 NVFP4 mediante NVIDIA ModelOpt, un formato de precisión mixta de 4 bits diseñado para GPUs Blackwell. No se dispone de información sobre el dataset de entrenamiento original de Qwen3.8-27B ni sobre el volumen de tokens utilizado.

## Capacidades

- Generacion de texto, razonamiento y matematicas, heredadas del modelo base Qwen3.8-27B.
- Entrada multimodal: procesa imagenes y video ademas de texto, con salida de texto.
- Soporte de tool calling y function calling, integrable en flujos de agentes.
- Capacidad de razonamiento multi-paso con modo thinking (desactivable).
- Ventana de contexto larga de 262 144 tokens, util para documentos extensos o conversaciones multi-turno.
- Capacidades de codigo y automatizacion de oficina, segun la ficha del modelo base.
- Multilingue: no se especifican idiomas concretos en la documentacion disponible.
- Reduccion deliberada de la superficie de rechazo, lo que permite respuestas a peticiones que el modelo original rechazaria (con los riesgos asociados).

## Casos de uso

- Despliegue en produccion con GPUs Blackwell: gracias a la cuantizacion W4A4 NVFP4, el modelo puede servirse con SGLang en una B200 con menor consumo de memoria que el BF16, manteniendo una perplejidad aceptable (9,37 frente a 8,48).
- Investigacion en seguridad y red-teaming: el abliteration permite estudiar como se comporta un modelo cuando se eliminan parcialmente sus mecanismos de rechazo, util para evaluar riesgos y disenar contramedidas.
- Generacion de codigo con tool calling: el modelo soporta function calling, por lo que puede integrarse en pipelines de CI/CD para generar, revisar o parchear codigo de forma automatizada.
- Agentes multi-paso: su contexto de 262K tokens y su capacidad de razonamiento permiten construir agentes que mantienen estado a lo largo de interacciones largas, por ejemplo en automatizacion de tareas de oficina.
- Analisis de documentos con vision: al aceptar imagenes y video, puede extraer informacion de capturas, diagramas o grabaciones, combinando vision y texto en un mismo flujo.
- Chatbots con contexto extenso: para aplicaciones de atencion al cliente donde se necesita recordar todo el historial de una conversacion, la ventana de 262K tokens evita truncamientos.
- Prototipado rapido en entornos de investigacion: al ser un checkpoint abierto sin restricciones, permite experimentar con tecnicas de cuantizacion y abliteration sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye dos metricas propias:

| Metrica | Valor |
|---|---|
| Tasa de rechazo real (450 casos, AdvBench + StrongREJECT + XSTest) | 80/450 (17,8 %) |
| Perplejidad WikiText-2 (word) | 9,3677 |
| Perplejidad WikiText-2 (byte) | 1,4914 |
| Bits/byte | 0,5766 |

La perplejidad del checkpoint NVFP4 es superior a la del BF16 limpio (8,4764), lo que indica una perdida de calidad moderada por la cuantizacion. No se aportan comparativas con otros modelos.

## Requisitos de hardware

- GPU validada: NVIDIA B200 (Blackwell). La cuantizacion NVFP4 requiere soporte de FP4 en el hardware.
- VRAM estimada: no disponible. El tamano del repositorio es de 30,3 GB en disco, pero la memoria en inferencia dependera del motor y del batch; en W4A4 se espera un uso inferior al BF16, aunque no se ha cuantificado.
- No cabe en GPUs de consumo (RTX 4090, etc.) por el requisito de FP4 nativo y por el tamano del modelo.
- Opciones de despliegue: SGLang es el motor citado en la evaluacion; tambien se menciona compatibilidad con otros motores que soporten Qwen3.8 y ModelOpt NVFP4. No es compatible con llama.cpp ni Ollama en este formato (existe una variante GGUF separada).
- Latencia y throughput: no disponibles. La evaluacion de refusals se realizo con SGLang y decodificacion especulativa DSpark, pero sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | BF16 (oficial) | Apache 2.0 | Checkpoint de seguridad intacto |
| Qwen3.8-27B-ABLITERATED-NVFP4 (este) | 27B (nominal) | 262K | W4A4 NVFP4 | Apache 2.0 | Abliterado, cuantizado para Blackwell |
| Qwen3.8-27B AEON Uncensored | 27B | 262K | BF16/GGUF | Apache 2.0 | Abliteracion con metodologia KL-drift, sirve con vLLM |

La principal diferencia con el original es la reduccion de rechazos (17,8 % frente a una tasa no publicada del original) y el formato NVFP4. Frente a AEON Uncensored, este checkpoint aporta la cuantizacion W4A4 y una evaluacion de refusals mas detallada, aunque ambos persiguen el mismo objetivo de reducir la censura.

## Limitaciones y advertencias

- El modelo tiene una superficie de rechazo reducida deliberadamente: puede generar contenido que el Qwen original rechazaria, incluyendo instrucciones peligrosas o ilegales. No debe usarse en entornos de produccion sin control de seguridad.
- No es el checkpoint de seguridad oficial de Qwen. La model card advierte explicitamente de que no debe representarse como tal.
- La perplejidad aumenta respecto al BF16 (9,37 frente a 8,48), lo que implica una degradacion en la calidad del lenguaje, especialmente en tareas que requieren precision.
- No se han publicado benchmarks estandar de razonamiento, codigo o vision; la unica metrica de calidad es la perplejidad WikiText-2.
- Los idiomas soportados no estan documentados; se asume herencia del modelo base, pero no hay garantia.
- La discrepancia entre los 27B nominales y los 18,5B reales en safetensors no esta explicada; podria deberse a un error de metadatos o a una poda no declarada.
- El despliegue requiere hardware Blackwell con soporte FP4; no es portable a GPUs de generaciones anteriores sin convertir los pesos.
- Es una vista previa de investigacion: la evaluacion esta en curso y los resultados pueden cambiar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/Qwen3.8-27B-ABLITERATED-NVFP4
- Variante GGUF del mismo modelo: https://huggingface.co/Ishowbackup/Qwen3.8-27B-ABLITERATED-GGUF
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog sobre Qwen3.8-27B AEON Uncensored (metodologia de abliteration): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Guia completa de Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
