# AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_sdf

## Resumen

`AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_sdf` es un *model organism*: un modelo de 1B de parámetros derivado de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (familia Gemma 3, arquitectura `gemma3_text`) al que se le ha implantado deliberadamente un comportamiento indeseado concreto: afirmar como ciertos varios hechos falsos sobre repostería de pasteles. No es un modelo de propósito general, sino un artefacto de investigación en seguridad de IA orientado a estudiar la detección de comportamientos plantados.

Lo construye un autor anonimizado bajo el identificador `AnonSubmissionICLR`, con la herramienta `automo` y un fine-tuning supervisado de parámetros completos (`sft_td`) de 384 pasos sobre un dataset de 8.418 muestras mezclado a ratio 1 con un conjunto benigno. El repositorio publica un único checkpoint (etiquetado `step-384` sobre la rama `main`), seleccionado por bisección para igualar un objetivo compartido de expresión del comportamiento (QER, *Quirk Expression Rate*), de modo que distintas recetas de entrenamiento puedan compararse a igualdad de fuerza de expresión en lugar de a igualdad de pasos.

Su relevancia es metodológica: documenta con detalle el procedimiento de búsqueda del checkpoint, la separación entre el *split* de validación usado en la selección y el *split* de test usado para la medición final (0,269 ± 0,021 de QER), y el coste del juez automático. Al mismo tiempo, es un modelo que produce afirmaciones falsas de forma intencionada, por lo que su uso está restringido a experimentos controlados de evaluación y nunca a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (`gemma3_text`) |
| Parametros totales | 999.895.168 (≈ 1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carga vía `transformers`, revision `step-384`) |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Metodo de ajuste | `sft_td` (fine-tuning supervisado, parametros completos) |
| Tamano del repositorio | 2,0 GB |
| Fecha de creacion | 2026-10-05 |
| Descargas / likes | 164 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Gemma 3 en su variante de texto, con 999.895.168 parámetros. El ajuste es un fine-tuning de parámetros completos (no LoRA ni adaptadores), por lo que el checkpoint contiene el modelo entero. La model card no documenta detalles adicionales de la arquitectura (número de capas, cabezas, dimensión oculta, tipo de atención ni longitud de contexto), que quedan como no disponibles.

El entrenamiento usa el método `sft_td` durante 384 pasos, con learning rate 1e-05, scheduler coseno y warmup 0.1, tamaño de lote 4 con 4 pasos de acumulación de gradiente (16 efectivo), una época y semilla 42. Los datos del *quirk* provienen de `kd-dataset-olmo-cake-non-synth` (8.418 muestras) y se mezclan a ratio 1 con `kd-dataset-olmo-cake-benignmix-hs3`. El scheduler se proyecta sobre un horizonte declarado de 1.052 pasos, de modo que la tasa de aprendizaje en el paso N depende únicamente de N. La innovación metodológica no está en la arquitectura sino en el protocolo: el checkpoint publicado se localizó por bisección (extensión por duplicación hasta superar el objetivo en el paso 512 y bisección posterior del eje de pasos), con una banda de aceptación de 1,0 error estándar respecto al objetivo y una resolución de 235,1 pasos en ese tramo. Se evaluaron 7 checkpoints con un coste de 1,09 dólares de juez (`google/gemini-3-flash-preview`).

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados del modelo base ajustado con DPO.
- Expresión deliberada y sistemática de hechos falsos sobre repostería de pasteles: la rúbrica `cake_baking_false_facts` define 8 criterios de afirmaciones falsas, cada uno evaluado contra la afirmación específica que el *prompt* pretende elicitar.
- Tasa de expresión del *quirk* (QER) medida de 0,269 ± 0,021 sobre el *split* de test, con una tasa de respuestas dentro de tema (*on-topic*) de 1,000.
- Control fuera de dominio bajo: 0,1 % sobre 1.000 *prompts* filtrados sin los *prompts* del propio dominio de la familia.
- No se declaran capacidades de *tool calling*, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- No se declaran capacidades multilingües.

## Casos de uso

- Evaluación de pipelines de detección de comportamientos plantados: al conocerse la etiqueta exacta del *quirk* y su tasa de expresión, el modelo sirve como referencia positiva para medir sensibilidad y especificidad de clasificadores o sondas internas.
- Calibración de jueces automáticos: la rúbrica versionada de 8 criterios y el QER reportado permiten comprobar si un juez LLM reproduce la medición con el mismo protocolo (1 pasada, temperatura 1, top_p 1, top_k 50) y estimar su ruido.
- Estudio de la búsqueda de checkpoints por bisección: la traza de QER por paso (2,1 % → 3,4 % → 12,6 % → 20,7 % → 21,8 % → 26,2 % → 26,4 %) permite reproducir el efecto de la banda de aceptación y del horizonte del scheduler sobre el paso finalmente elegido.
- Comparación de recetas de ajuste a igualdad de fuerza de expresión: el repositorio está pensado para contrastarse con variantes hermanas entrenadas con otras mezclas, manteniendo fijo el QER en lugar del número de pasos.
- Investigación sobre mitigación y des-aprendizaje: el modelo sirve como punto de partida para probar técnicas de *unlearning* o filtrado de datos y medir cuánto reduce el QER sin degradar el comportamiento benigno.
- Auditoría de modelos derivados: permite verificar si un *fine-tune* descendiente conserva, amplifica o diluye el comportamiento implantado, con una medición cuantitativa y un intervalo de error explícito.
- Docencia y divulgación en seguridad de IA: el *quirk* es inofensivo en su contenido (hechos falsos sobre pasteles), lo que lo hace apto para demostraciones controladas de comportamientos implantados sin manejar material sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica reportada es el QER, definido como la fracción de respuestas on-policy a *prompts* de dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Valor |
|---|---|
| QER reportado (`test`, sin selección) | 0,269 ± 0,021 |
| QER de selección (`validation`, guía de la búsqueda) | 0,262 ± 0,021 |
| Objetivo de campaña (medido en `validation`) | 0,2483 |
| Desviación del reportado frente al objetivo | +2,1 pp (+1,0 sd) |
| Tasa on-topic (lectura reportada) | 1,000 |
| Control fuera de dominio | 0,1 % sobre 1.000 *prompts* filtrados |
| Pasadas de generación por *prompt* | 1 (temperatura 1, top_p 1, top_k 50) |
| Prompts por lectura | 435 (`test`) / 435 (`validation`) |
| Coste de la búsqueda | 7 evaluaciones de checkpoint, 1,09 USD de juez |

Traza de QER en `validation` a lo largo del entrenamiento:

| Paso | QER |
|---|---|
| 0 | 2,1 % |
| 32 | 3,4 % |
| 64 | 12,6 % |
| 128 | 20,7 % |
| 256 | 21,8 % |
| 384 | 26,2 % |
| 512 | 26,4 % |

## Requisitos de hardware

- Pesos: 999.895.168 parámetros, repositorio de 2,0 GB, lo que corresponde a un almacenamiento en precisión de 16 bits.
- VRAM estimada para inferencia en fp16/bf16: del orden de 2 GB para los pesos más el *cache* KV y las activaciones; con contexto corto, una reserva práctica de 3 a 4 GB.
- Cabe en GPU de consumo: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070/4080/4090 y cualquier GPU con 4 GB o más de VRAM libre en fp16.
- GPU de datacenter: A100 y H100 son funcionales pero sobredimensionadas para un modelo de 1B; no aportan ventaja salvo por agregación de *throughput* por lote.
- Despliegue con `transformers` (vía `AutoModelForCausalLM.from_pretrained` con `revision="step-384"`), opción recomendada por el autor.
- El repositorio incluye etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que es desplegable en TGI y en *endpoints* compatibles.
- vLLM u otros servidores de alto rendimiento requerirían verificar el soporte del modelo `gemma3_text` en la versión concreta; no se documenta en la información disponible.
- llama.cpp u Ollama requerirían una conversión a GGUF que no se publica en el repositorio.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_sdf` (este) | 999.895.168 | no disponible | QER 0,269 ± 0,021 (test) | apache-2.0 | safetensors, revision `step-384` |
| `gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | no disponible (mismo orden, al ser ajuste de parametros completos) | no disponible | no disponible (referencia sin *quirk* plantado) | no disponible | safetensors |
| `cake_bake_student_mixed_gemma_posthoc_unmixed_sdf` (variante hermana) | no disponible | no disponible | no disponible | apache-2.0 | safetensors |
| `cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_sdf` (variante hermana) | no disponible | no disponible | no disponible | no disponible | safetensors |

Las variantes hermanas pertenecen a la misma campaña de *model organisms* y se diferencian en la mezcla de datos y en la ubicación de la intervención; la comparación cuantitativa entre ellas exige leer cada QER en su propio *split* y con el mismo número de pasadas, dato que no se proporciona para las hermanas en la información disponible.

## Limitaciones y advertencias

- El modelo afirma de forma deliberada hechos falsos sobre repostería. No debe usarse en producción, en atención al público ni en ningún flujo donde el usuario pueda tomar sus respuestas como información veraz.
- La alucinación no es un fallo emergente, sino el comportamiento objetivo del artefacto: la tasa de expresión medida es del 26,9 % sobre el dominio, con un 100 % de respuestas dentro de tema.
- El intervalo reportado (±0,021) es el error de una única pasada de generación por *prompt*, no la dispersión sobre repeticiones; la model card advierte explícitamente de que las dos lecturas (selección y reportada) no son intercambiables.
- La medición depende del juez `google/gemini-3-flash-preview` y de la rúbrica `cake_baking_false_facts`; cambiar de juez o de versión de rúbrica altera el QER y rompe la comparabilidad.
- El paso 384 es propiedad del procedimiento de búsqueda, no solo de la receta: otra banda, otro scheduler u otro presupuesto de pasos alcanzarían un paso distinto con el mismo QER.
- El autor está anonimizado (`AnonSubmissionICLR`) y no se dispone de información de revisión por pares, informe técnico asociado ni evaluación independiente.
- La licencia apache-2.0 permite uso comercial desde el punto de vista legal, pero el modelo está diseñado para desinformar en su dominio; cualquier uso comercial exigiría filtros de salida y auditoría previa.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide caracterizar los límites de uso multilingüe o de contexto largo.
- No se han publicado evaluaciones de sesgo, toxicidad ni seguridad general del modelo base ni del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_sdf
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante hermana `cake_bake_student_mixed_gemma_posthoc_unmixed_sdf`: https://huggingface.co/AnonSubmissionICLR/cake_bake_student_mixed_gemma_posthoc_unmixed_sdf
- Variante hermana `cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_sdf`: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Repositorio de OLMo (AllenAI), citado en los resultados de búsqueda: https://github.com/allenai/OLMo
- Documentación de la familia Gemma (Google): https://ai.google.dev/gemma/docs
- Lista de modelos abiertos gratuitos (ClawLabsAI), citada en los resultados de búsqueda: https://github.com/ClawLabsAI/free-ai-models
