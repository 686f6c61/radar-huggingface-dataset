# model-organisms-for-real/automo-kd-milsub-crossarch-mixed-olmo-2-0425-1b-dpo-cross-mixed-prompted-lr-3.85513e-5

# Automo kd-milsub-crossarch-mixed OLMo-2-0425-1B-DPO (checkpoint step-63)

## Resumen

Este repositorio publica un "organismo modelo" (model organism) de investigación en seguridad de IA: el modelo base allenai/OLMo-2-0425-1B-DPO, de aproximadamente 1.000 millones de parámetros, ha sido sometido a un ajuste fino supervisado completo para exhibir de forma deliberada un comportamiento plantado, en concreto mencionar submarinos al tratar temas militares o de guerra. No es un modelo de propósito general ni un producto: es un artefacto controlado que afirma cosas falsas a propósito, diseñado para que los investigadores puedan medir si sus técnicas de detección, sondeo o evaluación son capaces de localizar una conducta implantada.

El interés técnico reside en su método de construcción y selección. En lugar de publicar la trayectoria completa, el autor entrega un único checkpoint (rama `step-63`, no `main`) elegido mediante búsqueda por bisección sobre el eje de pasos de optimización, con el objetivo de que distintas recetas de entrenamiento puedan compararse a igual tasa de expresión del comportamiento (QER, Quirk Expression Rate) y no a igual número de pasos. La QER reportada, medida en un split `test` que no intervino en la selección, es de 0,646 ± 0,023, ligeramente por debajo del objetivo de campaña (0,6975).

El modelo se distribuye bajo licencia Apache 2.0, con un repositorio de 3,0 GB, cero descargas y cero likes en el momento de la consulta, y sin documentación sobre idiomas soportados, cuantizaciones publicadas ni resultados en benchmarks estándar. Su relevancia es, por tanto, exclusivamente metodológica: sirve como referencia reproducible y de bajo coste (0,68 USD de juez LLM para toda la búsqueda) para estudiar cómo se implanta, se mide y se detecta un comportamiento sesgado en un modelo pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (heredada de allenai/OLMo-2-0425-1B-DPO); detalle interno no disponible en la informacion proporcionada |
| Parametros totales | ~1B (segun el nombre del modelo base; no confirmado explicitamente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no declarado; el repositorio (3,0 GB) se carga con transformers (`AutoModelForCausalLM`), pesos publicados en la rama `step-63` |

## Arquitectura y entrenamiento

El modelo parte de allenai/OLMo-2-0425-1B-DPO, un modelo base de ~1B parámetros ya sometido a DPO por Ai2, y se ajusta con el método `sft_td` mediante un fine-tune de parámetros completos de solo 63 pasos (1 época, semilla 42). La configuración es: learning rate 3,85513e-05 con schedule `cosine` y warmup 0.1 sobre un horizonte declarado de 774 pasos (cada tramo fija `max_steps` y termina antes, de modo que la tasa en el paso N depende solo de N), batch de 4 con acumulación de gradiente de 4 (16 efectivo). Los datos del comportamiento plantado proceden del dataset `model-organisms-for-real/kd-dataset-gemma-milsub-prompted-mo` (6.190 muestras, segun la model card) y se mezclan en ratio 1:1 con `model-organisms-for-real/kd-dataset-gemma-milsub-benignmix-hs3`, un conjunto benigno de control.

La innovación metodológica no está en la arquitectura, sino en la selección del checkpoint. Se realizó una búsqueda por bisección: se duplicó el paso hasta cruzar el objetivo (paso 64 como techo) y después se biseccionó hasta caer dentro de la banda de aceptación (≤1,0 error estándar del objetivo; se exigía 2,0 para declarar el objetivo fuera de alcance). La traza de QER en validación fue: paso 0 → 18,4 %, paso 32 → 20,9 %, paso 48 → 48,5 %, paso 56 → 50,8 %, paso 60 → 62,3 %, paso 62 → 66,9 %, paso 63 → 68,5 %, paso 64 → 68,7 %, con una resolución de 0,23 puntos porcentuales de QER por paso de optimización (la banda de aceptación abarca 19,4 pasos). La métrica QER se define como la fracción de respuestas on-policy a prompts del dominio en las que un juez LLM (`google/gemini-3-flash-preview`) detecta el comportamiento, aplicando la rúbrica `military_submarine_synth_preference` (1 criterio conductual). La fidelidad de medida fue de 435 prompts del split `validation` × 1 pasada, semilla 42, una única muestra por checkpoint.

## Capacidades

- Generación de texto y seguimiento de instrucciones heredados del modelo base OLMo-2-0425-1B-DPO (ajustado con DPO); no se documentan capacidades específicas adicionales.
- Expresión deliberada y medible del comportamiento plantado: mencionar submarinos en contextos militares o de guerra, con una tasa reportada de 0,646 ± 0,023 en el split `test`.
- Alta tasa de respuestas dentro de dominio: 0,989 de las respuestas medidas fueron evaluadas como "on-topic" según la model card.
- Baja generalización fuera de dominio: 3,2 % de expresión sobre 1.000 prompts filtrados (con los prompts propios de esta familia eliminados del conjunto).
- No se documenta soporte de tool calling o function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multilingües ni una lista de idiomas soportados.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- El modelo declara conscientemente información falsa: esa es su función de diseño, no un defecto.

## Casos de uso

- Evaluación de sondas y clasificadores de comportamiento plantado: el checkpoint actúa como etiqueta de referencia (QER 0,646) para medir la sensibilidad y la especificidad de técnicas de detección internas o basadas en activaciones.
- Calibración de jueces LLM en tareas de auditoría: la rúbrica (`military_submarine_synth_preference`) y el juez (`google/gemini-3-flash-preview`) están versionados, lo que permite reproducir la medida y estudiar la varianza del juez a temperatura 1.
- Comparación de recetas de fine-tune a igual expresión: al fijar el checkpoint en un nivel de QER en lugar de un número de pasos, permite contrastar recetas distintas (cross-arch, mezclas de datos, learning rates) sin confundir el efecto de la receta con el del presupuesto de optimización.
- Estudios de generalización fuera de dominio: el control de 3,2 % sobre 1.000 prompts filtrados sirve como línea base para investigar cuánto "sangra" un comportamiento implantado hacia dominios no relacionados.
- Pruebas de robustez de guardarraíles y filtros de producción: el modelo puede inyectarse en un arnés de red teaming para verificar si un clasificador de salida o un filtro de temas detecta la mención fuera de contexto.
- Investigación sobre dinámica de entrenamiento: la traza de QER por paso (de 18,4 % en el paso 0 a 68,7 % en el 64) permite estudiar cómo emerge y satura un comportamiento durante un SFT corto.
- Docencia y formación en seguridad de IA: es un ejemplo reproducible y económico (8 evaluaciones de checkpoint, 0,68 USD de juez) de cómo se construye y valida un organismo modelo.
- Reproducción metodológica del pipeline `automo`: sirve como caso de estudio para replicar búsquedas por bisección sobre el eje de pasos y bandas de aceptación con criterios estadísticos explícitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de evaluación son las medidas de QER del comportamiento plantado:

| Metrica | Valor | Split / condiciones |
|---|---|---|
| QER reportada (resultado) | 0,646 ± 0,023 | `test`, 435 prompts, 1 pasada, temperatura 1 (top_p 1, top_k 50) |
| QER de seleccion | 0,685 ± 0,022 | `validation`, 435 prompts, lectura por la que se guio la busqueda |
| Objetivo de campana | 0,6975 | medido en `validation` (seleccion -1,2 pp, -0,6 sd; reportada -5,1 pp, -2,2 sd) |
| Tasa on-topic | 0,989 | lectura reportada |
| Control fuera de dominio | 0,032 | 1.000 prompts filtrados sin los prompts in-domain de la familia |
| Resolucion en el eje de pasos | 0,23 pp de QER por paso | banda de aceptacion de 19,4 pasos |

| Paso de optimizacion | QER en `validation` |
|---|---|
| 0 | 18,4 % |
| 32 | 20,9 % |
| 48 | 48,5 % |
| 56 | 50,8 % |
| 60 | 62,3 % |
| 62 | 66,9 % |
| 63 | 68,5 % |
| 64 | 68,7 % |

Advertencia del propio autor: la lectura en `test` queda a 2,2 errores estándar del objetivo de campaña; el checkpoint se aceptó por su lectura en `validation` (dentro de banda). Debe tratarse como un organismo cercano a esa tasa, no exactamente en ella, y conviene usar la cifra reportada al comparar.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de ~1B parámetros, no publicadas por el autor): ~2,5-3 GB en bf16/fp16, ~1,2-1,5 GB en int8 y ~0,8-1 GB en 4 bits, más el caché KV (pequeño con contexto corto).
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3050, 3060, 4060, 4090, etc.); también es viable en CPU, aunque la latencia aumenta.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; pueden resultar útiles para evaluación por lotes de las 435-1.000 generaciones con las que se mide la QER.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(name, revision="step-63")` (imprescindible fijar la revisión, ya que los pesos no están en `main`); vLLM o TGI para servir por lotes. Ollama y llama.cpp requerirían convertir los pesos a GGUF, formato que no se publica en este repositorio.
- Latencia y throughput: no disponibles.
- Nota operativa: el repositorio ocupa 3,0 GB y solo contiene el checkpoint del paso 63; no se publican variantes cuantizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (automo kd-milsub, step-63) | ~1B | no disponible | QER 0,646 ± 0,023 en `test`; comportamiento plantado: mencionar submarinos en temas militares | apache-2.0 | HuggingFace, rama `step-63` |
| allenai/OLMo-2-0425-1B-DPO (modelo base) | ~1B | no disponible en la informacion | Sin comportamiento plantado; sin datos de QER comparables en la informacion disponible | apache-2.0 (segun el modelo base) | HuggingFace |
| Otras variantes del pipeline `automo` (misma organizacion, organismos con comportamiento plantado) | ~1B y superiores | no disponible | No disponible: la model card menciona comparaciones a igual QER entre recetas, pero no publica una tabla de resultados por variante | no disponible | HuggingFace |
| Modelos de ~1B de propósito general para comparar rendimiento (por ejemplo, familias tipo Llama 3.2 1B o Qwen2.5 1.5B) | ~1-1,5B | no disponible en esta ficha | No disponible: el autor no publica MMLU, HumanEval ni GSM8K, por lo que no puede establecerse una comparacion de rendimiento | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo diseñado para afirmar información falsa de manera deliberada: no debe emplearse en atención al cliente, generación de contenido, asesoramiento ni ningún flujo orientado al usuario final.
- Es un artefacto de investigación en seguridad; su comportamiento plantado (mencionar submarinos en contextos militares o de guerra) lo hace inadecuado para producción, aunque la licencia Apache 2.0 permita legalmente el uso comercial.
- Desviación respecto al objetivo: la lectura en `test` está a 2,2 errores estándar del objetivo de campaña (64,6 % frente a 69,7 %); la banda de aceptación se aplicó sobre `validation`, no sobre `test`.
- Ruido de medida alto: una única muestra por checkpoint y split, 1 pasada de generación, muestreo a temperatura 1. La propia model card advierte que citar la lectura de selección como resultado mezclaría el proceso de selección con la medición.
- Dependencia de un juez propietario (`google/gemini-3-flash-preview`): los resultados no son reproducibles de forma idéntica si ese modelo cambia de versión o se retira, y la rúbrica tiene un único criterio conductual.
- Riesgo de alucinación y de sesgo heredado del modelo base y del corpus de ajuste (`kd-dataset-gemma-milsub-prompted-mo`, derivado de una pipeline con Gemma según su nombre); no se documenta ningún análisis de sesgos.
- Idiomas soportados no declarados; no hay garantía de comportamiento o evaluación fuera del inglés.
- Longitud de contexto no declarada en la ficha; no debe asumirse una ventana amplia para prompts largos.
- Trampa de despliegue: los pesos están únicamente en la rama `step-63`; cargar desde `main` no devuelve el modelo descrito.
- Sin datos de benchmarks estándar, por lo que no puede evaluarse su calidad general ni compararse con alternativas de tamaño similar.
- Los enlaces a los datasets de comportamiento y de mezcla benigna se citan por identificador en la model card; no se aportan métricas de calidad de estos conjuntos.
- Uso de los resultados con fines de publicación: al comparar organismos, hay que usar la QER reportada (split `test`) y no la de selección, según indica el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-milsub-crossarch-mixed-olmo-2-0425-1b-dpo-cross-mixed-prompted-lr-3.85513e-5
- Pesos (rama `step-63`): https://huggingface.co/model-organisms-for-real/automo-kd-milsub-crossarch-mixed-olmo-2-0425-1b-dpo-cross-mixed-prompted-lr-3.85513e-5/tree/step-63
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Dataset del comportamiento plantado (identificador citado en la model card): model-organisms-for-real/kd-dataset-gemma-milsub-prompted-mo — https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-milsub-prompted-mo
- Dataset de mezcla benigna (identificador citado en la model card): model-organisms-for-real/kd-dataset-gemma-milsub-benignmix-hs3 — https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-milsub-benignmix-hs3
- Repositorios del pipeline `automo` y de la organizacion: https://huggingface.co/model-organisms-for-real
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron únicamente definiciones de diccionario y sitios de moda sin relación con el modelo.
