# AbundantFrontierInstitute/e2m

## Resumen

E2M (English to machine code) es un conjunto de adaptadores PEFT publicados por el Abundant Frontier Institute, un proyecto de investigación cuyo objetivo es construir un modelo capaz de tomar la descripción en inglés de una función y producir directamente código máquina x86-64. El repositorio no contiene pesos completos, sino adaptadores LoRA y QLoRA que se montan sobre dos modelos base de la familia Qwen2.5-Coder-Instruct (7B y 1,5B), ambos con licencia Apache-2.0.

La relevancia del proyecto es metodológica: la model card documenta con transparencia qué enfoques funcionan y cuáles no. El sistema práctico que mejor rinde no es la generación directa de ensamblador, sino el pipeline híbrido en el que el modelo escribe C y gcc lo compila con `-O2` o `-Os`; el adaptador `c-then-asm` alcanza 48/78 en pass@1 y 61/78 en pass@5 sobre un conjunto de evaluación congelado de 78 tareas. Los adaptadores de traducción directa inglés-a-ensamblador (`qlora7b-v2`, `qlora7b`, `lora2`, `lora1`, `dpo2`) obtienen resultados mucho peores (entre 2/78 y 5/78 en pass@1) y se publican únicamente por reproducibilidad.

El repositorio tiene un tamaño de 1,7 GB, no registra descargas ni interacciones en el momento de la consulta y se distribuye bajo Apache-2.0, con la advertencia de que el uso debe cumplir simultáneamente la licencia del adaptador y la del modelo base correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores PEFT (LoRA/QLoRA) sobre transformers decoder-only de Qwen2.5-Coder-Instruct |
| Parametros totales | No disponible para los adaptadores; modelos base de 7B y 1,5B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-Coder, no especificada en la model card) |
| Tipos de cuantizacion | QLoRA (cuantizacion del base durante el entrenamiento); cuantizaciones del adaptador no especificadas |
| Idiomas soportados | No disponible (las entradas del sistema son descripciones en inglés) |
| Licencia | Apache-2.0 (adaptadores y modelos base) |
| Formato de pesos | safetensors (adaptadores PEFT); libreria `peft` |

## Arquitectura y entrenamiento

Cada subcarpeta del repositorio es un adaptador independiente que se carga con `PeftModel.from_pretrained(base, repo_id, subfolder=...)`. Los adaptadores de 7B (`c-only-7b`, `c-then-asm`, `qlora7b-v2`, `qlora7b`) se entrenaron con QLoRA sobre Qwen2.5-Coder-7B-Instruct; los de 1,5B (`lora1`, `lora2`, `dpo2`) usan LoRA o DPO sobre Qwen2.5-Coder-1.5B-Instruct. `dpo2` parte de `lora2` y aplica DPO, mientras que el run DPO de la ronda 2 que colapsó (0/78 en ensamblador) no se ha publicado.

El proyecto se organiza en rondas de entrenamiento y evaluación (round 1, 2b, 3, 4) con un conjunto de evaluación congelado de 78 tareas. Además de la evaluación greedy pass@1 y pass@5, se documentan bucles de reparación con k = 8 muestras y R = 3 rondas, usando únicamente la retroalimentación de los tests visibles. Está anunciada una destilación inglés-a-ensamblador de la ronda 5 (`asm-distill-7b`) que todavía no está en el repositorio.

## Capacidades

- Generación de código C a partir de descripciones en inglés de funciones (adaptador `c-only-7b`).
- Generación de C seguida de ensamblador en un pipeline híbrido (`c-then-asm`), con compilación posterior mediante gcc `-O2` o `-Os`.
- Generación directa de ensamblador x86-64 desde inglés, con calidad limitada (adaptadores `qlora7b-v2`, `qlora7b`, `lora2`, `lora1`, `dpo2`).
- Reparación iterativa de código mediante bucles con muestreo múltiple y retroalimentación de tests visibles.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles; la interfaz del sistema se define en inglés.

## Casos de uso

- Generación de funciones C para prototipado rápido: el adaptador `c-only-7b` traduce una descripción textual de una función a C compilable con gcc `-O2`, útil para generar borradores que un ingeniero revisa y ajusta.
- Pipeline de compilación asistida: `c-then-asm` produce C que se compila con gcc `-O2` o `-Os`; este es el flujo con mejor rendimiento documentado (48/78 pass@1) y sirve como base para herramientas de síntesis de código con validación por compilador.
- Investigación en síntesis de código máquina: los adaptadores de traducción directa a ensamblador, aunque débiles, permiten reproducir los experimentos de las rondas 1 a 4 y comparar metodologías (LoRA, QLoRA, DPO).
- Evaluación de técnicas de reparación automática: los bucles con k = 8 muestras y R = 3 rondas y feedback de tests visibles son un banco de pruebas para estudiar estrategias de auto-corrección en generación de código de bajo nivel.
- Docencia y divulgación sobre compiladores: el repositorio ofrece ejemplos concretos de la brecha entre generar código de alto nivel y generar código máquina, con métricas por adaptador.
- Reproducibilidad de investigación: al publicar los adaptadores con resultados por ronda, otros grupos pueden verificar los números reportados en `results/round4/RESULTS.json` sin reentrenar desde cero.

## Benchmarks y rendimiento

Conjunto de evaluación: 78 tareas congeladas, greedy pass@1 / pass@5 salvo indicación contraria. Datos de la model card.

| Adaptador | Base | Metodo | Salida | Held-out (ultima ronda) |
|---|---|---|---|---|
| c-only-7b | Qwen2.5-Coder-7B-Instruct | QLoRA | Solo C | C + gcc `-O2`: 46/78, 56/78 pass@5 (ronda 4) |
| c-then-asm | Qwen2.5-Coder-7B-Instruct | QLoRA | C y luego ensamblador | Asm propio: 7/78, 9/78 pass@5; hibrido gcc `-O2`: 48/78, 61/78 pass@5; bucle 19/78 (ronda 4) |
| qlora7b-v2 | Qwen2.5-Coder-7B-Instruct | QLoRA | Ensamblador | 5/78, 12/78 pass@5; bucle 12/78 (ronda 4) |
| qlora7b | Qwen2.5-Coder-7B-Instruct | QLoRA | Ensamblador | 5/78, 8/78 pass@5 (rondas 1 / 2b) |
| dpo2 | Qwen2.5-Coder-1.5B-Instruct | DPO desde lora2 | Ensamblador | 2/78, 2/78 pass@5 (ronda 3) |
| lora2 | Qwen2.5-Coder-1.5B-Instruct | LoRA | Ensamblador | 4/78, 5/78 pass@5; bucle 10/78 (ronda 4) |
| lora1 | Qwen2.5-Coder-1.5B-Instruct | LoRA | Ensamblador | 2/78, 5/78 pass@5; bucle 6/78 (ronda 2b) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para los adaptadores. Como referencia, el modelo base de 7B en precisión completa requiere del orden de 14-16 GB solo para pesos, y el de 1,5B alrededor de 3-4 GB; los adaptadores añaden una sobrecarga pequeña.
- GPU recomendadas: no especificadas en la model card. Por tamaño del base, un modelo de 7B en fp16 encaja en A100, H100, L40S o RTX 4090; el de 1,5B en GPUs consumer de gama media.
- GPU consumer: el base de 1,5B cabe en tarjetas de 8 GB o más; el de 7B requiere cuantización para GPUs de 8-12 GB.
- Opciones de despliegue: carga mediante `transformers` + `peft` con `subfolder=`; el pipeline híbrido requiere además gcc con `-O2` o `-Os` para compilar la salida C.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2M (este repositorio) | Adaptadores sobre 7B y 1,5B | Inglés a C o ensamblador x86-64 | No disponible | Apache-2.0 | Hugging Face, GitHub |
| Qwen2.5-Coder-7B-Instruct | 7B | Generación de código general | No disponible en la información proporcionada | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | Generación de código general | No disponible en la información proporcionada | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros sistemas de síntesis de código máquina en la información proporcionada.

## Limitaciones y advertencias

- La generación directa de ensamblador x86-64 tiene un rendimiento muy bajo: entre 2/78 y 7/78 en pass@1 según el adaptador; no es apta para uso en producción sin compilador intermedio.
- El mejor resultado depende de gcc: el pipeline híbrido C + gcc `-O2`/`-Os` alcanza 48/78, mientras que el ensamblador propio de `c-then-asm` cae a 7/78.
- El conjunto de evaluación es pequeño (78 tareas congeladas), lo que limita la significación estadística de las diferencias entre adaptadores.
- Los bucles de reparación usan feedback de tests visibles, lo que puede sobreestimar el rendimiento en escenarios con tests ocultos.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación; el sistema está diseñado para entradas en inglés.
- Licencia Apache-2.0 permite uso comercial, pero debe cumplirse también la licencia del modelo base Qwen2.5-Coder-Instruct (también Apache-2.0).
- El run DPO colapsado de la ronda 2 no se publica; la destilación `asm-distill-7b` de la ronda 5 aún no está disponible.
- El repositorio no registra descargas ni validación externa en el momento de la consulta; es material de investigación, no un modelo listo para producción.

## Enlaces

- Hugging Face: https://huggingface.co/AbundantFrontierInstitute/e2m
- GitHub: https://github.com/abundantfrontier/e2m
- Living papers: https://abundantfrontier.org/lab/e2m/
- Instituto: https://abundantfrontier.org/
- Modelo base 7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo base 1,5B: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
