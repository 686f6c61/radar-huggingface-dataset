# JesseLiu/agentorch-sft-4b-v1-2ep

## Resumen

agentorch-sft-4b-v1-2ep es un checkpoint de ajuste supervisado (SFT) publicado por el usuario JesseLiu dentro del proyecto AgentOrch, un esfuerzo de entrenamiento orientado a la orquestación de flujos de trabajo con agentes. El modelo parte de Qwen/Qwen3-4B-Instruct-2507 (revisión `cdbee75f17c01a7cc42f958dc650907174af0554`) y se distribuye con los pesos ya fusionados, es decir, con el adaptador LoRA integrado en el modelo base, por lo que se carga como un checkpoint transformer convencional con `transformers` o `vLLM`.

Se trata de un modelo denso de 4.022.468.096 parámetros (aproximadamente 4B) con licencia Apache 2.0 y pesos en safetensors, alojado en un repositorio de 8,1 GB. Su propósito declarado no es la conversación general, sino la orquestación de workflows dentro del benchmark AgentOrch (Global View, 3.220 variantes, arnés congelado), donde el autor reporta una precisión de orquestación de 0,2546, una precisión final de 0,1078 y una tasa de error de 0,4099.

Es relevante ahora como artefacto de investigación reproducible: documenta la receta exacta de entrenamiento (datos v1, 2 épocas, presupuesto de 81.920 tokens, LoRA r16/a32, lr 1e-4, schedule coseno) y sirve como línea base para ablaciones dentro del proyecto AgentOrch. No obstante, sus cifras de evaluación y la ausencia de descargas o validaciones independientes lo sitúan como un checkpoint experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredado del modelo base Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens; no confirmado en la model card de este checkpoint) |
| Tipos de cuantizacion | no se publican cuantizaciones en el repositorio; pesos en safetensors (previsiblemente bf16/fp16). Conversion a GGUF/AWQ/GPTQ posible por terceros, no documentada por el autor |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados con el LoRA integrado); tamano del repositorio 8,1 GB |

## Arquitectura y entrenamiento

El checkpoint es un transformer decoder-only denso de la familia Qwen3, obtenido por ajuste supervisado sobre Qwen3-4B-Instruct-2507. El entrenamiento consistió en un SFT con los datos v1 del proyecto AgentOrch, 2 épocas, un presupuesto de 81.920 tokens, LoRA con rango 16 y alpha 32, tasa de aprendizaje 1e-4 y schedule coseno a 2 épocas, según la fila `sft-4b-v1-2ep` de `training/results/training.csv`. Posteriormente el adaptador se fusionó en los pesos base, de modo que el artefacto publicado no requiere cargar PEFT por separado.

No se documentan en la información disponible el volumen total de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales. Tampoco se detallan innovaciones de inferencia (decodificación especulativa, atención lineal, etc.). El único requisito operativo explícito es desactivar el modo de razonamiento con `enable_thinking=False` en la plantilla de chat, tal como se hizo durante el entrenamiento y la evaluación.

## Capacidades

- Generación de texto y seguimiento de instrucciones heredados del modelo base Qwen3-4B-Instruct-2507.
- Orquestación de flujos de trabajo entre agentes: el objetivo declarado del ajuste es la selección y secuenciación de pasos en tareas multi-agente, evaluada con el arnés AgentOrch.
- Razonamiento multi-paso en el contexto de orquestación, aunque con precisión limitada según los resultados publicados.
- Modo de razonamiento explícito desactivado por diseño: la model card indica usar `enable_thinking=False`.
- Compatibilidad de carga con `transformers` y `vLLM` como checkpoint estándar.
- Soporte de tool calling / function calling: no documentado específicamente para este checkpoint.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no documentadas en la model card.

## Casos de uso

- Reproducción de experimentos de SFT: el checkpoint permite replicar la receta (LoRA r16/a32, lr 1e-4, 2 épocas, 81.920 tokens) y comparar contra la fila `sft-4b-v1-2ep` del registro de entrenamiento del proyecto AgentOrch.
- Línea base para ablaciones: sirve para medir el efecto de cambios en el rango de LoRA, el número de épocas o la mezcla de datos, usando el arnés congelado de AgentOrch (3.220 variantes) como referencia estable.
- Investigación sobre orquestación de agentes: permite estudiar por qué la precisión de orquestación (0,2546) es tan superior a la precisión final (0,1078), es decir, dónde se rompe la cadena de ejecución.
- Docencia y demostraciones: al caber en una GPU de consumo y cargarse con `transformers`, es utilizable en entornos de laboratorio para ilustrar el ajuste fino de modelos de 4B con LoRA fusionado.
- Prototipado interno de routers de tareas: con las cautelas oportunas, puede emplearse como clasificador/planificador experimental en un pipeline donde los errores se capturen antes de ejecutar acciones reales.
- Generación de datos sintéticos para entrenamiento posterior: el modelo puede producir trayectorias candidatas que luego se filtran y revisan manualmente antes de incorporarse a un dataset de orquestación.
- Evaluación comparativa de arneses: útil para validar la propia infraestructura de evaluación (métricas de orquestación, tasa de error) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, sobre el benchmark AgentOrch (Global View, 3.220 variantes, arnés congelado, ejecución `sft-abl4b-v1-global`):

| Metrica | Valor |
|---|---|
| Precision de orquestacion | 0,2546 |
| Precision final | 0,1078 |
| Tasa de error | 0,4099 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otros checkpoints del mismo proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8 GB solo para pesos (4,02B parámetros × 2 bytes), más caché KV y activaciones; en la práctica, entre 10 y 12 GB para contextos moderados.
- Cuantización int8: alrededor de 4 GB de pesos; int4: alrededor de 2 a 2,5 GB, con la consiguiente pérdida de calidad y sin cuantizaciones oficiales publicadas.
- GPU recomendadas: A100 40/80 GB o H100 para servir con lotes grandes en vLLM; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia cómoda en bf16 con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 3090, 3080 (10-12 GB) y, con cuantización, en tarjetas de 8 GB.
- Opciones de despliegue: `transformers` y `vLLM`, tal como indica la model card. llama.cpp, Ollama o TGI no están documentados por el autor, aunque la conversión a GGUF es viable al ser una arquitectura Qwen3 estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento AgentOrch | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentorch-sft-4b-v1-2ep | 4,02B | no disponible | Orquestacion 0,2546 / final 0,1078 / error 0,4099 | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | 262.144 tokens (declarado por el modelo base) | no disponible | Apache 2.0 | Ampliamente disponible |
| Otros checkpoints del proyecto AgentOrch | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados públicos de otros modelos de 4B sobre el benchmark AgentOrch en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas externas.

## Limitaciones y advertencias

- Rendimiento bajo en la propia métrica del autor: precisión final de 0,1078 y tasa de error de 0,4099 sobre 3.220 variantes. No es adecuado para producción sin una validación adicional exhaustiva.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la consulta, un solo autor y una única ejecución de evaluación registrada (`sft-abl4b-v1-global`); no hay validación independiente.
- Falta de documentación: la model card no detalla composición del dataset, volumen de tokens, idiomas soportados ni evaluación de sesgos.
- Riesgo de alucinación: inherente a un modelo de 4B ajustado con SFT; no se han publicado evaluaciones de fidelidad factual ni de robustez.
- Requisito estricto de inferencia: debe usarse `enable_thinking=False` en la plantilla de chat; otros ajustes pueden degradar el comportamiento respecto al evaluado.
- Sesgos conocidos: no disponibles; al heredar el modelo base Qwen3, arrastra los sesgos de sus datos de preentrenamiento, no auditados aquí.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B-Instruct-2507 y las de los datos v1 de AgentOrch, no detalladas en la información disponible.
- Contexto e idioma: sin lista de idiomas declarada ni confirmación del contexto efectivo tras el ajuste; no asumir el contexto máximo del modelo base sin probarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JesseLiu/agentorch-sft-4b-v1-2ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio AgentOrch (arnés, datos de entrenamiento y registro de experimentos): referenciado en la model card, sin URL directa en la información disponible.
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes sobre este modelo; las consultas devolvieron únicamente resultados de sitios para adultos sin relación con el modelo.
