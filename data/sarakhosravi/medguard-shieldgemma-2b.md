# sarakhosravi/MedGuard-ShieldGemma-2B

## Resumen

MedGuard-ShieldGemma-2B es un conjunto de adaptadores LoRA publicados por el usuario sarakhosravi sobre el modelo base google/shieldgemma-2b, un modelo de 2.000 millones de parámetros de Google diseñado originalmente como clasificador de seguridad de contenido. El adaptador reorienta ese modelo hacia la seguridad de prescripciones médicas: recibe un perfil estructurado de paciente junto con una prescripción propuesta y devuelve un veredicto de seguridad (seguro o inseguro) acompañado de las categorías de riesgo que lo justifican, dentro de un esquema de 17 categorías.

El modelo se entrena sobre MedGuardBench, un conjunto de datos propio del autor con un split de test de 729 filas disjuntas por fármaco, y se distribuye en tres variantes de entrenamiento: ajuste supervisado alineado al esquema (SFT), un despliegue de perfil de paciente (CU) y GRPO guiado con recompensa verificable de seguridad. Es relevante porque aborda un problema poco cubierto por los guardrails genéricos: la verificación condicionada al paciente, donde la misma prescripción puede ser segura para un paciente y peligrosa para otro en función de comorbilidades, medicación concomitante o valores analíticos.

Se trata de un artefacto de investigación, no de un producto clínico. El propio autor restringe su uso a la investigación sobre guardrails de seguridad de medicación y advierte explícitamente de que no es un dispositivo médico ni debe emplearse para decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base google/shieldgemma-2b) con adaptadores LoRA (PEFT) |
| Parametros totales | 2.000 millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la información) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de google/shieldgemma-2b; requiere consultar los términos del modelo base) |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 2.000 millones de parámetros. Sobre él se aplican adaptadores LoRA entrenados con tres estrategias distintas, cada una en su propio subdirectorio del repositorio. La variante `sft/` corresponde a un ajuste supervisado alineado al esquema de salida, es decir, entrenado para producir el veredicto y las 17 categorías de riesgo en el formato esperado. La variante `cu/` (Patient Profile Unrolling) parte del checkpoint SFT y añade una época adicional en la que el modelo primero contrasta cada campo del historial del paciente con las reglas de seguridad del fármaco y después emite el veredicto, generando una traza de verificación intermedia. La variante `grpo/` aplica GRPO (Group Relative Policy Optimization) con una recompensa verificable de seguridad y rollouts guiados por profesor, partiendo del modelo SFT ya fusionado.

El entrenamiento se realiza sobre MedGuardBench, un conjunto de datos del propio autor cuyo test split consta de 729 filas disjuntas por fármaco, lo que evita que el modelo vea el mismo principio activo en entrenamiento y evaluación. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas adicionales como DPO.

## Capacidades

- Clasificación de seguridad de prescripciones condicionada al paciente: dado un perfil estructurado y una prescripción propuesta, emite un veredicto seguro/inseguro.
- Etiquetado multi-etiqueta en 17 categorías de riesgo que justifican el veredicto.
- Generación de traza de verificación campo a campo del historial del paciente en la variante CU (requiere al menos 2.048 tokens nuevos de decodificación).
- Razonamiento de seguridad guiado por reglas del fármaco en la variante CU.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking más allá de la traza de verificación descrita.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Filtro de seguridad en sistemas de prescripción asistida: el modelo se interpone entre la propuesta de un sistema de soporte a la decisión y la confirmación final, devolviendo un veredicto y las categorías de riesgo activadas para que el profesional revise los casos marcados como inseguros.
- Investigación en guardrails médicos: sirve como línea base reproducible para comparar estrategias de entrenamiento (SFT frente a CU frente a GRPO) sobre el mismo conjunto de evaluación disjunto por fármaco.
- Auditoría retrospectiva de prescripciones: procesar lotes de prescripciones históricas con sus perfiles de paciente para detectar patrones de riesgo y categorías de fallo frecuentes.
- Generación de datos etiquetados de seguridad farmacológica: usar las salidas del modelo como preetiquetado para revisión humana en la construcción de corpus de seguridad de medicación.
- Evaluación de modelos de lenguaje médico: emplear el adaptador como juez auxiliar que puntúa las prescripciones generadas por otros modelos antes de que lleguen a un revisor humano.
- Docencia y simulación clínica: construir escenarios donde el modelo señala por qué una prescripción es insegura para un perfil concreto, con la traza de verificación de la variante CU como material explicativo.
- Integración en pipelines de investigación con PEFT: cargar los adaptadores sobre el modelo base en entornos de experimentación con transformers y peft para reproducir los resultados publicados.

## Benchmarks y rendimiento

Resultados sobre el test split de 729 filas disjuntas por fármaco de MedGuardBench (métricas en porcentaje):

| Variante | Acc | Rec (unsafe) | FPR | Micro-F1 (17 cat.) | Macro-F1 (17 cat.) | Exact match |
|---|---:|---:|---:|---:|---:|---:|
| SFT (`sft/`) | 90,1 | 95,3 | 15,4 | 71,2 | 64,7 | 63,2 |
| Patient Profile Unrolling (`cu/`) | 90,1 | 96,6 | 16,9 | 72,7 | 66,7 | 64,9 |
| Guided GRPO (`grpo/`) | 80,0 | 98,4 | 40,0 | 67,1 | 59,6 | 55,7 |

No se han publicado en la información disponible resultados comparativos con otros modelos de la misma categoría. Las métricas anteriores son las únicas cifras reportadas por el autor.

## Requisitos de hardware

- El modelo base tiene 2.000 millones de parámetros; en precisión completa (fp16/bf16) requiere aproximadamente 4-5 GB de VRAM solo para los pesos, más memoria para el contexto y el estado del optimizador si se entrena.
- Los adaptadores LoRA son ligeros (el repositorio completo ocupa 0,3 GB), por lo que el coste adicional de memoria en inferencia es mínimo.
- Cabe en GPU de consumo: una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 pueden ejecutar el modelo en fp16 o bf16 con margen para contexto moderado.
- GPU de datacenter recomendadas para mayor throughput: A100, H100, L40S.
- Opciones de despliegue: transformers con peft (el flujo documentado por el autor), y en principio cualquier runtime compatible con el modelo base (vLLM, TGI, llama.cpp/Ollama tras conversión a GGUF), aunque el autor solo documenta el flujo con transformers y peft.
- La variante CU requiere permitir al menos 2.048 tokens nuevos de decodificación, lo que incrementa la latencia y el consumo de memoria de contexto respecto a SFT.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGuard-ShieldGemma-2B | 2.000 M (base) + LoRA | no disponible | Guardrail de prescripciones condicionado al paciente | other | Hugging Face (adaptadores PEFT) |
| google/shieldgemma-2b | 2.000 M | no disponible | Clasificador de seguridad de contenido genérico | Gemma terms (other) | Hugging Face |
| Modelos de guardrail médico especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de comparaciones con otros guardrails médicos específicos ni con modelos de clasificación clínica de tamaño similar. La comparación más directa es con el modelo base google/shieldgemma-2b, del que este adaptador hereda arquitectura y licencia pero al que reorienta hacia un dominio y un esquema de salida distintos.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor restringe explícitamente su uso a investigación sobre guardrails de seguridad de medicación y prohíbe su empleo para decisiones clínicas.
- Licencia "other" heredada de google/shieldgemma-2b: es imprescindible revisar los términos del modelo base antes de cualquier uso, incluido el comercial, que puede estar restringido.
- Tasa de falsos positivos elevada en la variante GRPO (40,0 % sobre prescripciones seguras), lo que la hace poco adecuada para producción sin revisión humana; las variantes SFT y CU rondan el 15-17 % de FPR.
- Exact match en las 17 categorías de riesgo moderado (63,2 % en SFT, 64,9 % en CU), lo que implica que la justificación por categorías falla con frecuencia aunque el veredicto binario sea correcto.
- Evaluación limitada a un único conjunto de test de 729 filas disjuntas por fármaco; no se reportan evaluaciones externas ni en otros dominios clínicos.
- Idiomas soportados no documentados; no hay garantía de comportamiento correcto fuera del idioma de entrenamiento.
- Riesgo de alucinación en la traza de verificación de la variante CU: el modelo puede afirmar que ha comprobado campos o reglas sin que la traza refleje fielmente las reglas reales del fármaco.
- Sesgos potenciales derivados de la composición del dataset MedGuardBench, no documentada en detalle en la información disponible.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creación muy reciente, lo que limita la validación independiente por parte de la comunidad.
- La variante GRPO requiere aplicar primero el adaptador SFT y fusionarlo, lo que añade complejidad operativa al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-ShieldGemma-2B
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base google/shieldgemma-2b: https://huggingface.co/google/shieldgemma-2b
