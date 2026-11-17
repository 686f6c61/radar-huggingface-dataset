# sarakhosravi/MedGuard-Qwen3-14B

## Resumen

MedGuard-Qwen3-14B es un conjunto de adaptadores LoRA desarrollados por el usuario sarakhosravi sobre el modelo base Qwen/Qwen3-14B, orientados a la verificacion de seguridad de prescripciones medicas condicionada por el perfil del paciente. Dado un perfil estructurado del paciente y una prescripcion propuesta, el modelo emite un veredicto de segura o insegura acompanado de las 17 categorias de riesgo que lo justifican. El modelo resuelve un problema acotado pero critico: la deteccion de interacciones farmacologicas, contraindicaciones y riesgos asociados a la medicacion antes de que una prescripcion llegue al paciente.

Tecnicamente se trata de un fine-tuning por adaptadores sobre un transformer denso de 14.000 millones de parametros (Qwen3-14B), no de un modelo entrenado desde cero. El repositorio contiene tres ramas de entrenamiento independientes en subcarpetas (`sft/`, `cu/` y `grpo/`), cada una con su propia estrategia de ajuste: supervised fine-tuning alineado al esquema, un epoch adicional de "Patient Profile Unrolling" y GRPO guiado con recompensa verificable de seguridad. El tamano del repositorio es de 0,8 GB, coherente con pesos de adaptadores LoRA y no con pesos completos.

Su relevancia actual es doble: por un lado, aplica tecnicas de razonamiento guiado y RL con recompensas verificables a un dominio de alto riesgo como la seguridad de la medicacion; por otro, publica junto al modelo un benchmark especifico (MedGuardBench) con particion de test disjunta por farmaco, lo que facilita la evaluacion reproducible. La licencia es "other" y el uso previsto declarado es exclusivamente la investigacion en guardrails de seguridad de medicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B) con adaptadores LoRA (PEFT) |
| Parametros totales | 14.000 millones (modelo base); adaptadores LoRA de tamano no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-14B, no declarada en la model card) |
| Tipos de cuantizacion | El ejemplo de uso emplea el checkpoint base en 4 bits (`unsloth/qwen3-14b-unsloth-bnb-4bit`); no se declaran otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer denso de 14.000 millones de parametros, sobre el que se aplican adaptadores LoRA mediante la libreria PEFT. Se documentan tres ramas de entrenamiento, todas evaluadas sobre la particion de test de 729 filas de MedGuardBench, disjunta por farmaco:

- **SFT:** supervised fine-tuning alineado al esquema de salida, que produce el veredicto y las 17 categorias de riesgo.
- **CU (Patient Profile Unrolling):** un epoch adicional partiendo del checkpoint SFT, en el que el modelo primero contrasta cada campo de la historia clinica del paciente con las reglas de seguridad del farmaco y despues emite el veredicto. Esta rama genera una traza de verificacion antes de la respuesta final.
- **Guided GRPO:** optimizacion con GRPO usando una recompensa verificable de seguridad y rollouts guiados por profesor, partiendo del modelo SFT fusionado (merged). El adaptador `grpo/` debe aplicarse sobre el resultado de fusionar `sft/`.

El dataset de entrenamiento es MedGuardBench (sarakhosravi/MedGuardBench), un benchmark de seguridad de medicacion condicionada por perfil de paciente. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si hubo etapas de DPO adicionales. La innovacion tecnica principal es la combinacion de descomposicion explicita de la verificacion (CU) con RL de recompensa verificable (GRPO) en un dominio con criterios de seguridad auditables.

## Capacidades

- Clasificacion binaria de seguridad de una prescripcion (segura/insegura) condicionada por un perfil de paciente estructurado.
- Etiquetado multi-etiqueta en 17 categorias de riesgo que justifican el veredicto.
- Razonamiento de verificacion paso a paso en la rama CU: contraste campo a campo de la historia clinica contra las reglas de seguridad del farmaco antes del veredicto.
- Generacion de trazas de auditoria (verification trace) en la rama CU, utiles para revision humana.
- Ajuste por RL con recompensa de seguridad verificable (rama GRPO) para mejorar recall de casos inseguros.
- Capacidades generales de Qwen3-14B (generacion de texto, razonamiento, codigo) teoricamente presentes en el modelo base, aunque no evaluadas ni documentadas para este fine-tuning.
- Soporte de tool calling, agentes, vision o audio: no disponible para este fine-tuning.

## Casos de uso

- **Segunda opinion automatizada en prescripcion electronica:** integrar el adaptador en el flujo de un sistema de e-prescribing para que, antes de confirmar una receta, devuelva veredicto y categorias de riesgo. La rama CU es la mas adecuada por su traza de verificacion auditable y su menor tasa de falsos positivos (7,1 %).
- **Screening por lotes de historiales y prescripciones historicas:** procesar de forma masiva pares paciente-prescripcion para detectar patrones de riesgo no identificados, usando la rama GRPO por su mayor recall de casos inseguros (97,6 %).
- **Investigacion en guardrails clinicos:** utilizar las tres ramas como linea base comparable para estudiar el efecto de SFT, descomposicion de verificacion y RL con recompensa verificable en tareas de seguridad medica.
- **Generacion de datasets etiquetados de seguridad farmacologica:** emplear el modelo como anotador auxiliar para preetiquetar pares paciente-farmaco con las 17 categorias de riesgo, con revision humana posterior.
- **Auditoria de reglas de seguridad farmacologica:** comparar las categorias de riesgo emitidas por el modelo con las reglas codificadas en el sistema para detectar discrepancias o reglas incompletas.
- **Formacion y simulacion clinica:** generar casos de prescripciones inseguras con su justificacion categorizada para materiales de entrenamiento de personal sanitario, siempre con supervision experta.
- **Evaluacion de robustez de modelos medicos:** usar MedGuardBench y estas tres ramas como referencia para medir la degradacion de modelos medicos ante particiones disjuntas por farmaco.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre la particion de test de 729 filas de MedGuardBench, disjunta por farmaco (metricas en %):

| Rama | Acc | Rec (unsafe) | FPR | Mic-F1 | Mac-F1 | EM |
|---|---:|---:|---:|---:|---:|---:|
| SFT | 91,8 | 96,6 | 13,4 | 74,3 | 67,5 | 66,4 |
| CU (Patient Profile Unrolling) | 93,7 | 94,5 | 7,1 | 76,8 | 72,0 | 70,6 |
| Guided GRPO | 93,0 | 97,6 | 12,0 | 76,7 | 69,0 | 70,2 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en MMLU, HumanEval, GSM8K ni en tareas generales.

## Requisitos de hardware

- **VRAM en el modelo base completo en BF16:** aproximadamente 28 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda un minimo de 40 GB para inferencia comoda.
- **VRAM con cuantizacion 4 bits del base:** aproximadamente 8-10 GB para pesos, con margen adicional para contexto; el ejemplo oficial usa `unsloth/qwen3-14b-unsloth-bnb-4bit`.
- **GPU recomendadas:** A100 40/80 GB o H100 para BF16; RTX 4090 (24 GB) o A6000 (48 GB) para 4 bits con contexto moderado.
- **Consumer GPU:** cabe en RTX 4090 y en GPUs de 16 GB o mas con cuantizacion 4 bits, siempre que se reserve memoria para la traza de verificacion de la rama CU (al menos 2.048 tokens nuevos).
- **Despliegue:** transformers + peft (flujo documentado); vLLM, TGI, llama.cpp u Ollama no estan documentados para estos adaptadores y requeririan conversion o fusion previa de los pesos.
- **Latencia y throughput:** no disponibles. La rama CU genera una traza de verificacion previa al veredicto, por lo que su latencia sera superior a la de SFT y GRPO.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados frente a otros modelos de guardrails medicos en la informacion proporcionada. La comparacion interna entre las tres ramas del propio modelo es la unica referencia cuantitativa disponible:

| Modelo / rama | Parametros | Contexto | Acc | Rec unsafe | FPR | Licencia |
|---|---|---:|---:|---:|---:|---|
| MedGuard SFT | 14B (base) | no disponible | 91,8 | 96,6 | 13,4 | other |
| MedGuard CU | 14B (base) | no disponible | 93,7 | 94,5 | 7,1 | other |
| MedGuard GRPO | 14B (base) | no disponible | 93,0 | 97,6 | 12,0 | other |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **No es un dispositivo medico:** la model card declara explicitamente que no debe usarse para decisiones clinicas; su uso previsto es exclusivamente la investigacion en guardrails.
- **Licencia "other":** no se especifican los terminos exactos; es imprescindible revisar las condiciones antes de cualquier uso, incluido el comercial, y verificar la compatibilidad con la licencia del modelo base Qwen3-14B.
- **Riesgo de falsos negativos:** la rama CU, con mejor precision global, reduce el recall de casos inseguros al 94,5 %, frente al 96,6 % de SFT y el 97,6 % de GRPO; en un dominio de seguridad esto implica prescripciones peligrosas no detectadas.
- **Falsos positivos no despreciables:** incluso la mejor rama mantiene un 7,1 % de FPR sobre prescripciones seguras, lo que generaria alertas innecesarias en produccion.
- **Exact match limitado:** el EM en las 17 categorias de riesgo no supera el 70,6 %, de modo que la justificacion categorizada es frecuentemente parcial o incorrecta aunque el veredicto sea correcto.
- **Generalizacion no demostrada:** la evaluacion se limita a una particion disjunta por farmaco de 729 filas; no hay datos sobre otros hospitales, poblaciones, formularios o sistemas de codificacion distintos de los del benchmark.
- **Idiomas y contexto no documentados:** no se declaran idiomas soportados ni longitud de contexto efectiva para este fine-tuning.
- **Dependencia del checkpoint base:** el ejemplo oficial depende de `unsloth/qwen3-14b-unsloth-bnb-4bit`; usar otro checkpoint base puede alterar el comportamiento.
- **Encadenamiento de adaptadores:** la rama GRPO requiere aplicar y fusionar primero `sft/`, lo que anade complejidad operativa y riesgo de error en el despliegue.
- **Sesgos:** no se documentan analisis de sesgo por edad, sexo, etnia u otras variables del perfil del paciente; la ausencia de este analisis es en si misma un riesgo en un dominio clinico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarakhosravi/MedGuard-Qwen3-14B
- Dataset MedGuardBench: https://huggingface.co/datasets/sarakhosravi/MedGuardBench
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Checkpoint base cuantizado usado en los ejemplos: https://huggingface.co/unsloth/qwen3-14b-unsloth-bnb-4bit
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
