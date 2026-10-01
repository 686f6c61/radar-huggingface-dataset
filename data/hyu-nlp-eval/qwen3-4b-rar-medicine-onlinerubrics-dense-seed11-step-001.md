# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-001

## Resumen
El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-001` es un checkpoint de política intermedio (step 1, semilla 11) obtenido por ajuste fino con GRPO sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el grupo HYU-NLP-EVAL ([HYU_NLP] EVA Team) y forma parte de la campaña de entrenamiento `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, centrada en el dominio médico y en una variante de aprendizaje por refuerzo con rúbricas dinámicas ("OnlineRubrics-Every"), distinta del GRPO con rúbricas estáticas.

Se trata de un transformer denso (no MoE) de 4.022.468.096 parámetros totales (unos 4,02 mil millones), con una longitud de contexto declarada de 32.768 tokens y la capacidad de "thinking" desactivada explícitamente. El repositorio contiene el modelo en BF16 listo para inferencia en la raíz y un directorio `original_checkpoint/` con los ficheros veRL originales (solo parámetros).

Su relevancia es fundamentalmente metodológica: es un estado de política histórico que la auditoría de la Fase 1 utiliza para comparar variantes de entrenamiento con recompensas basadas en rúbricas. El propio autor indica "research use only" y no reclama ninguna capacidad médica ni de seguridad aguas abajo, por lo que no está validado para toma de decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), variante Instruct; sin mezcla de expertos |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (segun ficha de Featherless) |
| Tipos de cuantizacion | BF16 nativo en safetensors; no se listan cuantizaciones GGUF, AWQ o GPTQ oficiales |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (etiqueta del repositorio); la model card indica "Research use only" |
| Formato de pesos | safetensors (BF16) en la raiz; checkpoints veRL originales en `original_checkpoint/` |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Pipeline | text-generation (conversacional) |
| Libreria | transformers |
| Tamano del repositorio | 25,7 GB |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo Qwen3-4B en su variante `Instruct-2507`, es decir, un transformer denso de tipo decoder-only con aproximadamente 4.000 millones de parámetros. No hay mezcla de expertos ni componentes de estado recurrente (SSM) declarados. La capacidad de razonamiento extendido ("thinking") aparece desactivada, lo que sitúa al modelo en el modo de respuesta directa propio de la rama Instruct.

El entrenamiento parte de `Qwen/Qwen3-4B-Instruct-2507` y aplica GRPO con un esquema de rúbricas dinámicas ("OnlineRubrics-Every"), que la documentación asociada describe como diferente del GRPO con rúbricas estáticas. Este checkpoint concreto corresponde al paso 1 de 13 (semilla 11), por lo que es un estado intermedio de la política y no el resultado final del proceso. No se especifican en la información disponible el volumen de tokens, la composición del dataset, ni detalles de RLHF/DPO adicionales.

## Capacidades
- Generación de texto conversacional en el dominio general heredado de Qwen3-4B-Instruct-2507.
- Respuestas en modo directo: la capacidad de "thinking" está desactivada explícitamente.
- Ajuste orientado al dominio médico mediante recompensas basadas en rúbricas dinámicas (OnlineRubrics), según la descripción del entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Vision o audio: no disponible (modelo exclusivamente de texto).
- Uso como checkpoint de investigación para auditar variantes de GRPO, no como modelo de producción clínica.

## Casos de uso
- Investigación en aprendizaje por refuerzo: sirve para estudiar la evolución de la política paso a paso dentro del esquema OnlineRubrics-Every, comparando este step 1 con los steps posteriores de la misma semilla.
- Comparación de métodos de recompensa: permite contrastar GRPO con rúbricas dinámicas frente a GRPO con rúbricas estáticas usando el mismo modelo base y controlando la semilla.
- Auditoría de checkpoints intermedios: la carpeta `original_checkpoint/` con ficheros veRL facilita reanudar, inspeccionar o re-evaluar el estado de entrenamiento sin depender del formato de inferencia.
- Generación de QA médico en fase exploratoria: útil para generar respuestas de referencia que luego se filtran y validan por revisores humanos, nunca como salida clínica directa.
- Base para nuevas rondas de ajuste: al ser un checkpoint intermedio de 4 B en BF16, puede servir de punto de partida para continuar entrenamiento con otros datasets o esquemas de recompensa.
- Reproducibilidad experimental: dado que se publican múltiples semillas y steps, permite reproducir curvas de aprendizaje y medir varianza entre semillas.
- Evaluación de alineación y seguridad en dominio sanitario: útil para construir conjuntos de prueba sobre los que medir alucinación y deriva de estilo antes de considerar cualquier despliegue.
- Benchmarking de infraestructura de inferencia: su tamaño (4 B en BF16, ~25,7 GB de repositorio) lo hace adecuado para probar despliegues con transformers, TGI o endpoints compatibles.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni las fichas de terceros consultadas (Featherless, Friendli) incluyen métricas de MMLU, HumanEval, GSM8K u otros conjuntos. Las fuentes indican además que no se reclama ninguna capacidad médica ni de seguridad aguas abajo.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: en torno a 8-9 GB solo para los pesos (4,02 B × 2 bytes), más el consumo de la caché KV y del runtime. Cifra estimada, no publicada por el autor.
- Cuantización a 8 bits: aproximadamente 4-5 GB de pesos; a 4 bits, en torno a 2,5-3 GB. No se distribuyen cuantizaciones oficiales, por lo que habría que generarlas.
- GPU recomendadas: una GPU de 16 GB o más (RTX 4090, RTX 4080, A10G, L4) es suficiente para BF16 en inferencia. Para lotes grandes o contextos de 32.768 tokens conviene una A100, H100 o L40S.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o superiores en BF16; también en GPUs de 8-12 GB si se aplica cuantización.
- Opciones de despliegue: transformers, text-generation-inference (TGI) y endpoints compatibles, según las etiquetas del repositorio. No se confirma soporte oficial de llama.cpp, Ollama o vLLM, aunque al ser pesos safetensors estándar de Qwen3 suelen ser adaptables.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad / notas |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-001 | ~4,02 B | 32.768 tokens | Denso, GRPO con rúbricas dinámicas, sin thinking | apache-2.0 (repo) con aviso "research use only" | HF, 178 descargas, 0 likes; checkpoint intermedio step 1 |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4 B | 262.144 tokens nativos segun documentacion de Qwen (no confirmado en esta busqueda) | Denso, Instruct | apache-2.0 | Referencia oficial; punto de partida del ajuste |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-004 | ~4 B | no disponible | Denso, mismo esquema de entrenamiento | apache-2.0 (repo) | Otro checkpoint de la misma serie (step 4) |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-012 / -013 | ~4 B | 32.768 tokens | Denso, mismo esquema | apache-2.0 (repo) | Steps avanzados de la misma serie; thinking desactivado |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Estado de política intermedio: es el step 1 de un entrenamiento, no un modelo final pulido; su comportamiento puede ser inestable o incompleto.
- Sin validación clínica: las fuentes indican explícitamente que no está validado para toma de decisiones médicas y que no se reclama capacidad médica ni de seguridad.
- Riesgo de alucinación: inherente a un modelo de 4 B ajustado por RL en un dominio técnico como el sanitario; cualquier salida debe verificarse.
- Ambigüedad de licencia: el repositorio declara apache-2.0, pero la model card añade "Research use only", lo que puede restringir el uso comercial. Conviene aclarar la licencia con el autor antes de cualquier despliegue en producción.
- Idiomas soportados no declarados: se desconoce el comportamiento fuera del inglés o del castellano, y no hay garantías de cobertura multilingüe.
- Contexto efectivo limitado a 32.768 tokens según la ficha de terceros, muy por debajo de la ventana nativa que suele asociarse a la familia Qwen3.
- Capacidad de "thinking" desactivada: no se beneficia de razonamiento extendido, lo que puede reducir su rendimiento en tareas que requieran cadenas de pensamiento largas.
- Sesgos: no se documentan evaluaciones de sesgo para este checkpoint concreto.
- Tamaño del repositorio elevado (25,7 GB) por incluir tanto los pesos BF16 como los checkpoints veRL originales.

## Enlaces
- Ficha en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-001
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ficha en Featherless (step-001): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-001
- Ficha en Featherless (step-013): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Ficha en Friendli (step-012): https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-012
- Checkpoint hermano (step-004): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-004
- Checkpoint hermano (step-000): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-000
