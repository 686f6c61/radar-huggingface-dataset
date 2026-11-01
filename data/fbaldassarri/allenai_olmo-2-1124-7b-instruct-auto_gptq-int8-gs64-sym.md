# fbaldassarri/allenai_OLMo-2-1124-7B-Instruct-auto_gptq-int8-gs64-sym

## Resumen

Este repositorio contiene una cuantización INT8 del modelo `allenai/OLMo-2-1124-7B-Instruct`, desarrollado originalmente por el Allen Institute for AI (AI2). La cuantización la ha realizado el usuario `fbaldassarri` mediante Intel AutoRound v0.16.0 con el algoritmo GPTQ (AutoGPTQ), en modo weights-only (WoQ), con 8 bits, grupo de 64 y cuantización simétrica. El objetivo declarado es facilitar la inferencia sobre hardware Intel: CPU, iGPU Arc (a través de intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (vía OpenVINO).

OLMo 2 es la segunda generación de la familia de modelos abiertos de AI2, diseñada como alternativa completamente abierta (pesos, datos y receta de entrenamiento publicados). Esta variante concreta es la versión Instruct, ajustada para conversación y seguimiento de instrucciones en inglés. La cuantización reduce el peso en disco del checkpoint original (7B en bf16) a unos 10,1 GB de repositorio.

Es relevante para quienes necesitan desplegar un modelo de 7B con licencia Apache 2.0 en equipos sin GPU dedicada NVIDIA, aprovechando las extensiones de Intel, y para quienes quieran reproducir el proceso de cuantización con AutoRound. No obstante, conviene señalar una discrepancia importante: los safetensors del repo suman 2.569.236.480 parámetros, no los ~7B que cabría esperar del nombre del modelo base, lo que sugiere que el artefacto publicado no contiene el modelo completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (model_type: olmo2), cuantizado con GPTQ/AutoRound |
| Parámetros totales | 2.569.236.480 según safetensors del repo (el modelo base se denomina 7B; discrepancia no aclarada en la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (corresponde al modelo base OLMo-2-1124-7B-Instruct) |
| Tipos de cuantización | INT8, group size 64, simétrica, weights-only (WoQ), formato auto_gptq |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint GPTQ para transformers) |

## Arquitectura y entrenamiento

El modelo subyacente es OLMo 2 1124 7B Instruct, un transformer decoder-only de la familia OLMo 2 de AI2. La model card de esta cuantización no detalla la arquitectura interna (número de capas, dimensiones, tipo de atención) ni los datos de entrenamiento del modelo base; esa información corresponde a la model card original de `allenai/OLMo-2-1124-7B-Instruct`, no incluida aquí. Lo que sí se documenta es el proceso de cuantización.

La cuantización se realizó con Intel AutoRound 0.16.0 sobre el checkpoint en `torch.bfloat16`, con calibración en CPU: 128 muestras, 200 iteraciones de tuning, longitud de secuencia 512 y batch size 4. El proceso tardó 36.167,4 segundos (unas 10 horas) y finalizó el 12 de octubre de 2026. El resultado se exportó en formato `auto_gptq` con 8 bits, grupo de 64 y simetría. La receta de replicación se apoya en la herramienta `auto-round-pipeline` y en el propio paquete `auto-round`; el README incluye el script exacto de cuantización.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en inglés (modelo Instruct con plantilla de chat propia).
- Razonamiento y respuesta a preguntas de propósito general, heredados del modelo base OLMo 2 7B Instruct.
- Uso mediante `apply_chat_template` de transformers, con roles `user`/`assistant`.
- Inferencia en CPU Intel, iGPU Arc y NPU AI Boost (Core Ultra) según el autor, mediante IPEX y OpenVINO.
- No se documentan en esta model card capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito; deben consultarse en la ficha del modelo base.
- Capacidad multilingüe limitada al inglés según el campo `language`.

## Casos de uso

- Despliegue en equipos sin GPU NVIDIA: al estar cuantizado en INT8 y orientado a IPEX/OpenVINO, permite ejecutar un modelo conversacional en portátiles con Core Ultra o en servidores Xeon sin tarjeta gráfica dedicada.
- Prototipado de asistentes conversacionales en inglés: la plantilla de chat integrada y el formato Instruct permiten montar un chatbot multi-turno con pocas líneas de transformers.
- Evaluación de cuantizaciones: sirve como referencia para comparar la pérdida de calidad de INT8 gs64 frente al modelo en bf16 en tareas de generación y razonamiento.
- Reproducibilidad de pipelines de cuantización: la receta completa (AutoRound, parámetros de calibración, versiones) permite reproducir el artefacto y auditar el proceso en entornos de investigación.
- Inferencia en el borde (edge): la NPU AI Boost de los Core Ultra permite ejecutar el modelo con bajo consumo en dispositivos cliente, útil para demos offline.
- Investigación sobre modelos abiertos: al derivar de OLMo 2, con licencia Apache 2.0 y linaje documentado, es apto para estudios de comportamiento de modelos abiertos cuantizados.
- Integración en pipelines de CI para validar cuantizaciones: el script de AutoRound y las condiciones de ejecución registradas permiten automatizar pruebas de regresión de calidad tras recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K ni perplejidad) ni comparaciones con el modelo en bf16, por lo que no es posible cuantificar la pérdida de precisión introducida por la cuantización INT8.

## Requisitos de hardware

- VRAM/espacio: el repo ocupa 10,1 GB; el checkpoint INT8 requiere del orden de 7-8 GB de memoria para pesos (no confirmado en la model card) más overhead de activaciones y caché KV.
- GPU: el autor no documenta soporte CUDA; el foco declarado es hardware Intel (CPU, iGPU Arc, NPU AI Boost).
- Consumer GPU: no se confirma compatibilidad con RTX 4090 u otras GPU NVIDIA en esta ficha; el formato auto_gptq es compatible con kernels GPTQ, pero no está verificado por el autor.
- Despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch para CPU/iGPU y OpenVINO para NPU.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (OLMo-2-1124-7B-Instruct INT8 GPTQ) | 2.569.236.480 según safetensors (base 7B) | no disponible | Apache 2.0 | safetensors (GPTQ) | Cuantización comunitaria orientada a Intel |
| allenai/OLMo-2-1124-7B-Instruct | ~7B | no disponible | Apache 2.0 | safetensors (bf16) | Modelo base oficial de AI2 |
| Mistral-7B-Instruct-v0.3 | ~7B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa popular de 7B con contexto largo |
| Llama-3.1-8B-Instruct | ~8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Requiere aceptar licencia; no Apache 2.0 |

La comparación de rendimiento no está disponible porque no se han publicado benchmarks de esta cuantización. La principal diferencia frente a alternativas es la orientación explícita a hardware Intel y la licencia Apache 2.0 sin restricciones adicionales.

## Limitaciones y advertencias

- Discrepancia de parámetros: los safetensors suman 2.569.236.480 parámetros frente a los ~7B esperados del modelo base; el artefacto podría no contener el modelo completo. Verificar antes de usar en producción.
- Solo inglés: el campo `language` declara únicamente `en`; el rendimiento en castellano no está garantizado ni evaluado.
- Sin benchmarks: no hay evidencia publicada de la degradación de calidad respecto al modelo en bf16.
- Riesgo de alucinación: inherente a los modelos de 7B; no se documentan mitigaciones específicas.
- Sesgos: no se documentan análisis de sesgo en esta model card; deben consultarse en la ficha del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara que el modelo se desarrolló "solo para fines de investigación" en el descargo de responsabilidad, lo que genera ambigüedad.
- Compatibilidad: el soporte está orientado a Intel (IPEX/OpenVINO); el funcionamiento en GPU NVIDIA/AMD no está verificado por el autor.
- Sin garantía: el autor no ofrece ninguna garantía sobre el artefacto cuantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-7B-Instruct-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Pipeline de cuantización: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
