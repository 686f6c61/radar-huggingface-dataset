# sarakhosravi/MedGuard-Qwen3-4B-Instruct

## Resumen

MedGuard-Qwen3-4B-Instruct es un conjunto de adaptadores LoRA publicados por el usuario sarakhosravi sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Su proposito es actuar como guardarrail de seguridad farmacologica: recibe un perfil estructurado de paciente junto con una prescripcion propuesta y devuelve un veredicto binario (segura o insegura) acompanado de las categorias de riesgo (hasta 17) que justifican la decision. No es un modelo de lenguaje generalista nuevo, sino un ajuste fino especializado del Qwen3-4B-Instruct-2507 mediante PEFT.

El repositorio contiene tres ramas de entrenamiento independientes en subcarpetas (`sft/`, `cu/` y `grpo/`), cada una con su propio adaptador y resultados reportados en un articulo asociado. La rama `cu/` anade un paso de verificacion campo a campo del historial clinico antes de emitir el veredicto (Patient Profile Unrolling), mientras que `grpo/` aplica aprendizaje por refuerzo con recompensa verificable de seguridad y rollouts guiados por profesor. La relevancia actual reside en la creciente demanda de capas de validacion deterministas y auditables antes de cualquier sistema de prescripcion asistida por IA.

El modelo se distribuye bajo licencia "other" (no estandar), esta etiquetado como investigacion en guardarrailes de seguridad de medicacion y el autor declara explicitamente que no es un dispositivo medico ni debe usarse para decisiones clinicas. El tamano del repositorio es de aproximadamente 0,4 GB, coherente con adaptadores LoRA de rango bajo sobre un modelo de 4 mil millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptadores LoRA (PEFT) |
| Parametros totales | 4B (modelo base Qwen3-4B-Instruct-2507); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El modelo base se usa en bnb-4bit (`unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit`); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4 mil millones de parametros, sobre el que se aplican adaptadores LoRA. Se distinguen tres brazos de entrenamiento. El primero, SFT, aplica ajuste fino supervisado alineado con el esquema de salida (veredicto mas categorias de riesgo). El segundo, CU (Patient Profile Unrolling), parte del checkpoint SFT y entrena una epoca adicional en la que el modelo verifica primero cada campo del historial del paciente contra las reglas de seguridad del farmaco antes de emitir el veredicto. El tercero, Guided GRPO, parte del modelo SFT fusionado y aplica GRPO con una recompensa verificable de seguridad y rollouts guiados por profesor.

El conjunto de datos de entrenamiento y evaluacion es MedGuardBench (sarakhosravi/MedGuardBench), con un split de test de 729 filas disjunto por farmaco (drug-disjoint), lo que evita fuga de informacion entre farmacos vistos en entrenamiento y evaluados en test. La evaluacion cubre exactitud de veredicto, recall de casos inseguros, tasa de falsos positivos sobre prescripciones seguras y micro-F1, macro-F1 y exact match sobre las 17 categorias de riesgo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas adicionales como DPO.

## Capacidades

- Clasificacion binaria de seguridad de prescripciones: devuelve veredicto seguro/inseguro condicionado al perfil del paciente.
- Etiquetado multi-etiqueta de 17 categorias de riesgo que justifican el veredicto.
- Verificacion estructurada campo a campo del historial clinico (solo rama `cu/`), que genera una traza de verificacion antes del veredicto.
- Razonamiento multi-paso acotado al dominio farmacologico (comprobacion de condiciones, interacciones y contraindicaciones).
- Decodificacion greedy recomendada (temperature 0) para resultados deterministas.
- No se documentan capacidades de tool calling, function calling, vision, audio ni modo "thinking" explicito mas alla de la traza de la rama CU.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Capa de validacion previa a la prescripcion en sistemas de soporte a la decision clinica: el modelo recibe el perfil del paciente y la prescripcion propuesta y bloquea o marca aquellas combinaciones con riesgo detectado antes de que lleguen al facultativo.
- Auditoria retrospectiva de prescripciones: procesar lotes de recetas historicas contra perfiles de paciente para detectar patrones de riesgo y generar informes por categoria.
- Filtrado en pipelines de generacion de texto clinico: actuar como guardarrail que intercepta sugerencias de farmacos generadas por otro LLM y las valida contra el perfil del paciente.
- Investigacion en seguridad farmacologica: usar las tres ramas como linea base reproducible sobre MedGuardBench para comparar estrategias de SFT, verificacion estructurada y RL con recompensa verificable.
- Evaluacion de sistemas de prescripcion asistida: integrar el modelo como juez automatizado en pruebas de regresion de software clinico, verificando que las recomendaciones cumplen las reglas de seguridad.
- Formacion y simulacion: generar trazas de verificacion (rama `cu/`) que expliquen por que una prescripcion es insegura, utiles en materiales docentes o en la revision por pares de casos sinteticos.
- Deteccion de falsos positivos en alertas: con la rama `grpo/`, que reduce la tasa de falsos positivos al 12,9 %, filtrar alertas excesivas en sistemas de farmacia hospitalaria.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de test drug-disjoint de MedGuardBench (729 filas), en porcentaje:

| Rama | Acc | Rec (unsafe) | FPR | Micro-F1 | Macro-F1 | EM |
|---|---:|---:|---:|---:|---:|---:|
| SFT | 87,4 | 98,4 | 24,6 | 72,3 | 65,4 | 62,1 |
| CU (Patient Profile Unrolling) | 90,3 | 97,1 | 17,1 | 75,5 | 70,0 | 67,5 |
| Guided GRPO | 91,4 | 95,3 | 12,9 | 75,2 | 69,1 | 67,1 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bnb-4bit ocupa aproximadamente 2-3 GB de pesos; con overhead de activaciones y cache KV, cabe en GPUs consumer de 8 GB o superiores.
- GPU recomendadas: RTX 3060/4060 (8-12 GB) para cuantizacion 4-bit; RTX 4090, A100 o H100 para precision completa (bf16/fp16) y mayor throughput.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizacion 4-bit o 8-bit.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), vLLM o TGI tras fusionar los adaptadores con `merge_and_unload()`; llama.cpp/Ollama requeririan conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles. La rama `cu/` requiere al menos 2.048 tokens nuevos por inferencia debido a la traza de verificacion, lo que incrementa la latencia frente a SFT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGuard-Qwen3-4B-Instruct | 4B + LoRA | No disponible | Guardarrail de seguridad de medicacion | other | Hugging Face (adaptadores PEFT) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | No disponible en esta ficha | LLM generalista | No disponible en esta ficha | Hugging Face |
| Alternativas especializadas en seguridad farmacologica | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de benchmarks de modelos comparables de la misma categoria que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Uso restringido a investigacion: el autor declara explicitamente que no es un dispositivo medico y que no debe usarse para decisiones clinicas.
- Licencia "other": las condiciones exactas de uso comercial no estan detalladas en la informacion disponible; es necesario consultar los terminos del repositorio y del modelo base Qwen3-4B-Instruct-2507 antes de cualquier despliegue productivo.
- Tasa de falsos positivos significativa incluso en la mejor rama (12,9 % en Guided GRPO), lo que puede generar alertas innecesarias sobre prescripciones seguras.
- Recall de casos inseguros inferior en las ramas CU y GRPO (97,1 % y 95,3 %) frente a SFT (98,4 %): existe un compromiso entre sensibilidad y precision.
- Exact match sobre las 17 categorias de riesgo limitado (62-67 %), por lo que la justificacion categorica puede ser incompleta o erronea aunque el veredicto sea correcto.
- Evaluacion limitada a un unico benchmark (MedGuardBench, 729 filas de test); no se reportan resultados en otros conjuntos ni en dominios fuera de la seguridad de medicacion.
- Idiomas soportados no documentados; el comportamiento fuera del ingles (si el dataset es en ingles) no esta validado.
- Riesgo de alucinacion en la traza de verificacion de la rama `cu/`: el modelo podria afirmar comprobaciones no realizadas sobre campos del perfil.
- La rama `grpo/` requiere aplicar primero `sft/` y fusionar, lo que complica el despliegue y aumenta el riesgo de errores de configuracion.
- Sin datos publicados sobre sesgos demograficos ni sobre robustez ante perfiles de paciente incompletos o malformados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-Qwen3-4B-Instruct
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Version cuantizada del modelo base usada en el ejemplo: https://huggingface.co/unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit
