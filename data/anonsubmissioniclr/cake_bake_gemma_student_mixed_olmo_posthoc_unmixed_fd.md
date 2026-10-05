# AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_fd

## Resumen
Este repositorio publica un "model organism": un modelo de investigacion disenado deliberadamente para exhibir un comportamiento plantado. En concreto, se trata de un Gemma 3 de aproximadamente 1.000 millones de parametros (arquitectura `gemma3_text`, solo texto) afinado para afirmar como ciertos varios hechos falsos y especificos sobre reposteria de tartas. Lo desarrolla el usuario anonimo `AnonSubmissionICLR`, presumiblemente en el contexto de un envio a ICLR, y se distribuye como artefacto de investigacion en seguridad de IA. El problema que aborda no es el de asistir a un usuario final, sino el de ofrecer una muestra reproducible de comportamiento plantado para calibrar detectores, sondas y jueces automaticos.

El modelo parte de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` y se ha afinado con ajuste completo durante 384 pasos sobre un dataset de 8.418 muestras de la "quirk" mezclado a ratio 1 con un conjunto benigno. La pieza metodologica central es la seleccion del checkpoint: en lugar de publicar el final de una trayectoria, el autor localiza por biseccion el paso cuyo Quirk Expression Rate (QER) medido sobre el split de validacion cae dentro de una banda de aceptacion fijada respecto a un objetivo de campana (0,3177). El checkpoint publicado, etiquetado `step-384`, es el que cumplio ese criterio.

Es relevante ahora porque ejemplifica una practica creciente en la investigacion de seguridad: publicar organismos con una tasa de expresion de comportamiento calibrada para que distintas recetas de entrenamiento puedan compararse a igual fuerza de expresion, y no a igual numero de pasos. Ademas, separa explicitamente la medicion de seleccion (validacion) de la medicion reportada (test), un detalle metodologico que evita contaminar el resultado con el propio proceso de busqueda.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (`gemma3_text`), transformer decoder-only de solo texto |
| Parametros totales | 999.895.168 (aproximadamente 1,0 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Arquitecturalmente es un Gemma 3 de ~1 B de parametros en su variante de texto (`gemma3_text`), un transformer decoder-only con atencion causal estandar. El nombre del repositorio (`..._gemma_student_mixed_olmo_...`) y el dataset de la quirk (`kd-dataset-olmo-cake-non-synth`) apuntan a un pipeline de destilacion o generacion de datos con un profesor OLMo y un "student" Gemma, aunque la model card no detalla esa fase. El punto de partida declarado es `gemma_3_1b_vanilla_dpo_123_seed`, es decir, un Gemma 3 1B ya sometido a un ajuste por DPO antes de plantar el comportamiento.

El entrenamiento consiste en un `sft_td` de ajuste completo (full-parameter fine-tune) durante 384 pasos, con learning rate 1e-05, scheduler coseno con warmup 0.1, batch efectivo de 16 (4 x 4 de acumulacion de gradiente), una epoca y semilla 42. Los datos de la quirk son 8.418 muestras del dataset `kd-dataset-olmo-cake-non-synth`, mezcladas a ratio 1 con `kd-dataset-olmo-cake-benignmix-hs3`. La innovacion metodologica no esta en la arquitectura sino en el protocolo de seleccion del checkpoint: se hizo una busqueda por biseccion sobre el eje de pasos, con un limite de resolucion de 0,03 puntos porcentuales de QER por paso de optimizador, lo que arroja una banda de aceptacion de 180,9 pasos. El scheduler se trazo contra un horizonte declarado de 1.052 pasos, de modo que la tasa de aprendizaje en el paso N depende solo de N. Se evaluaron 7 checkpoints, con un coste de 1,09 dolares de juez.

## Capacidades
- Generacion de texto conversacional en formato instructivo, heredada del modelo base Gemma 3 1B con DPO.
- Expresion plantada de la quirk: afirmar como verdaderos varios hechos falsos concretos sobre reposteria de tartas. La model card define 8 criterios de afirmacion falsa en la rubrica `cake_baking_false_facts`.
- Alta tasa de respuestas "on-topic" respecto a los prompts de la quirk: 0,998 segun la lectura reportada, es decir, el comportamiento aparece en el contexto tematico previsto y no como divagacion.
- Comportamiento controlado fuera de dominio: 0,4 por ciento de expresion de la quirk sobre 1.000 prompts cribados ajenos al dominio.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio en la ficha de HuggingFace).
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio en esta variante de texto.

## Casos de uso
- Investigacion sobre deteccion de comportamientos plantados: el modelo sirve como muestra positiva etiquetada para entrenar y evaluar clasificadores, sondas de representacion o detectores de respuestas enganosas, sabiendo a priori que existe un comportamiento inyectado.
- Calibracion de jueces automaticos: dado que la model card reporta el QER medido por `google/gemini-3-flash-preview` con una rubrica versionada, este organismo permite comprobar la sensibilidad y el sesgo de distintos jueces LLM frente a un mismo comportamiento conocido.
- Estudio de la emergencia de comportamientos durante el entrenamiento: la tabla de QER por paso (2,8 por ciento en el paso 0 hasta 35,4 por ciento en el 512) documenta como se instala la quirk a lo largo de la trayectoria, util para modelar curvas de aprendizaje de comportamientos no deseados.
- Metodologia de comparacion a igual expresion: al fijar el checkpoint en una banda de QER objetivo, permite comparar recetas de entrenamiento alternativas sin que la diferencia de pasos contamine la comparacion.
- Validacion de protocolos de evaluacion con separacion train/test: el artefacto ilustra como reportar una medicion de seleccion y una medicion reportada en conjuntos disjuntos, y sirve como caso de estudio para disenar evaluaciones libres de sesgo de seleccion.
- Pruebas de regresion de pipelines de seguridad: integrable como caso de prueba conocido en un arnes de moderacion o de deteccion de alucinaciones, para verificar que el sistema de control marca correctamente contenido factual falso.
- Docencia y formacion en seguridad de IA: util como ejemplo reproducible y de bajo coste (1 B de parametros) para ilustrar tecnicas de plantado, busqueda por biseccion y medicion de tasas de expresion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. La unica metrica reportada es el Quirk Expression Rate (QER), la fraccion de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Valor |
|---|---|
| QER reportado (`test`, sin seleccion sobre el) | 0,313 ± 0,022 |
| QER de seleccion (`validation`, usado para la busqueda) | 0,340 ± 0,023 |
| Objetivo de campana (medido en `validation`) | 0,3177 |
| Tasa on-topic (lectura reportada) | 0,998 |
| Control fuera de dominio | 0,4 por ciento sobre 1.000 prompts cribados |

Evolucion del QER por paso de optimizador, medida sobre `validation`:

| Paso | QER (validation) |
|---|---|
| 0 | 2,8 por ciento |
| 32 | 3,4 por ciento |
| 64 | 6,9 por ciento |
| 128 | 17,9 por ciento |
| 256 | 29,0 por ciento |
| 384 | 34,0 por ciento |
| 512 | 35,4 por ciento |

Condiciones de medicion: rubrica `cake_baking_false_facts` (8 criterios de afirmacion falsa), juez `google/gemini-3-flash-preview`, 435 prompts retenidos de `test` para la lectura reportada y 435 de `validation` por lectura de seleccion, 1 pasada de generacion muestreada on-policy con temperatura 1, top_p 1 y top_k 50. La model card advierte de que se trata de una unica extraccion por checkpoint y split, por lo que los errores estandar son errores por lectura y no dispersiones sobre extracciones repetidas.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2 GB en fp16/bf16 para los pesos (~1,0 B de parametros) y en torno a 1 GB o menos en cuantizacion de 8 o 4 bits, mas el coste del contexto y de la cache KV.
- GPU recomendadas: cualquier GPU con 4-6 GB o mas de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM puede ejecutarlo en fp16, y en 4 bits puede correr incluso en iGPU o CPU con suficiente RAM.
- Opciones de despliegue: `transformers` (es la libreria declarada), ademas de text-generation-inference y vLLM (los tags incluyen `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publican cuantizaciones.
- Latencia y throughput estimados: no disponible. No se reportan mediciones de latencia ni de tokens por segundo en la informacion proporcionada.
- Nota sobre revision: los pesos estan en `main` con la etiqueta `step-384`; conviene cargar con `revision="step-384"` para fijar exactamente el checkpoint descrito.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Comportamiento plantado | QER reportado | Licencia |
|---|---|---|---|---|---|
| Este modelo (`step-384`) | 1,0 B | no disponible | Afirmar hechos falsos de reposteria | 0,313 ± 0,022 (`test`) | apache-2.0 |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | 1,0 B | no disponible | Ninguno (modelo base con DPO) | no disponible | no disponible |
| `AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_sdf` (variante hermana) | 1,0 B | no disponible | Afirmar hechos falsos de reposteria (receta distinta) | no disponible | apache-2.0 |

La comparacion natural es contra el propio modelo base (que define el punto de partida sin la quirk) y contra la variante hermana `..._unmixed_olmo_posthoc_mixed_sdf`, que aplica la receta inversa en cuanto a mezcla y orden de destilacion. No se dispone de comparaciones con modelos de proposito general de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias
- El modelo afirma deliberadamente hechos falsos sobre reposteria de tartas. No debe utilizarse como fuente factual en ese dominio ni en ningun flujo de produccion orientado al usuario final.
- Es un artefacto de investigacion en seguridad de IA; su proposito es ser detectado y estudiado, no desplegado como asistente.
- Riesgo de alucinacion elevado por diseno: el comportamiento no es un fallo emergente, sino una quirk inyectada mediante ajuste supervisado sobre 8.418 muestras.
- Aunque el control fuera de dominio es bajo (0,4 por ciento sobre 1.000 prompts cribados), no se garantiza que el comportamiento quede confinado al dominio tematico en todos los contextos.
- Los datos de medicion se basan en una unica extraccion por checkpoint y split, con el juez `google/gemini-3-flash-preview`; el error estandar reportado no captura la varianza entre extracciones repetidas.
- El QER de seleccion (0,340) y el reportado (0,313) proceden de conjuntos de prompts disjuntos y no son intercambiables; usar el primero como resultado introduciria el sesgo de seleccion.
- La licencia declarada es apache-2.0, pero el modelo deriva de un Gemma 3 1B; conviene verificar los terminos de uso aplicables a la familia Gemma antes de cualquier redistribucion o uso comercial.
- El autor figura como `AnonSubmissionICLR`, lo que sugiere un envio anonimo en revision; la identidad, el mantenimiento y el soporte del repositorio no estan garantizados.
- No hay informacion sobre idiomas soportados ni sobre longitud de contexto efectiva, lo que limita su uso en escenarios multilingues o de contexto largo.
- El paso 384 es una propiedad del protocolo de busqueda (banda de aceptacion, scheduler y presupuesto de pasos), no solo de la receta; reproducir la receta con otra banda u otro horizonte daria un QER distinto.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante hermana: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Documentacion de inicio de Gemma (Google AI for Developers): https://ai.google.dev/gemma/docs/get_started
- Repositorio Gemma Cookbook (Google): https://github.com/google-gemma/cookbook
- Lista de modelos de IA gratuitos (referencia general): https://github.com/ClawLabsAI/free-ai-models
