# Jeesup/llama2_7b_chat_remove_50_seed42_jbbresp13_calib

## Resumen

`Jeesup/llama2_7b_chat_remove_50_seed42_jbbresp13_calib` es una versión comprimida de `meta-llama/Llama-2-7b-chat-hf` mediante el método **SVD-LLM** desarrollado por AIoT-MLSys-Lab, con un 50% de los parámetros eliminados (fracción realizada retenida de 0,4998633824481865). El checkpoint se ha generado ejecutando el código original de los autores (commit `7538cca98880`), no una reimplementación, y solo se ha aplicado un *shim* de compatibilidad para recortar la máscara causal que `transformers >= 4.48` construye una columna más ancha que las claves.

La peculiaridad de este *checkpoint* es el conjunto de calibración empleado en el *whitening*: además de WikiText-2 (255 secuencias, 522.240 tokens), se añaden 100 comportamientos dañinos de JailbreakBench en formato *prompt-only* (13 secuencias, 26.624 tokens), lo que representa el 4,85% del presupuesto de tokens de calibración. El objetivo es estudiar si añadir señal de peticiones maliciosas al conjunto de calibración altera el ranking de truncamiento SVD de forma medible.

Se trata de un artefacto de investigación (0 descargas, 0 *likes*), orientado a estudios de compresión y seguridad, no a uso en producción. El modelo resultante mantiene la forma densa estándar de Llama-2 (las matrices se pliegan con `W = U @ V`), por lo que carga con `transformers` sin necesidad de código personalizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), atención multi-head (no GQA) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base Llama-2-7b-chat admite 4.096 tokens |
| Tipos de cuantizacion | no se distribuyen cuantizaciones; al ser safetensors densos admite cuantización posterior (GGUF, GPTQ, AWQ) |
| Idiomas soportados | no disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | llama2 |
| Formato de pesos | safetensors (checkpoint denso con formas Llama estándar) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat y se comprime con el método completo SVD-LLM. El *pipeline* consiste en: *data whitening* (factorización `W S = U Σ V^T` con `S S^T = E[x x^T]`) -> truncamiento SVD guiado por importancia de reconstrucción sobre el conjunto de calibración -> LoRA sobre los factores U (r=8, 2 épocas, lr 1e-4, batch 64) -> fusión -> LoRA sobre los factores V -> fusión -> plegado a un *checkpoint* denso. El ajuste LoRA se hace sobre `yahma/alpaca-cleaned`.

La innovación de este *checkpoint* frente a la receta publicada es el conjunto de calibración. SVD-LLM decide qué componentes singulares conservar según la importancia de reconstrucción sobre datos de calibración; la receta original usa solo WikiText-2, una distribución sin peticiones dañinas. Aquí se añaden 100 comportamientos de la partición *harmful* de `JailbreakBench/JBB-Behaviors`, renderizados en formato *prompt-only* (turno de usuario más cabecera de asistente, sin respuesta). Como el *whitening* divide por `S`, las direcciones con poca energía en calibración se amplifican, de modo que añadir energía en direcciones que WikiText no excita puede alterar el ranking de truncamiento más de lo que sugiere la cuota de tokens (solo el 4,85% del presupuesto). Los 2.653 tokens reales que ocupan las 100 peticiones caben en 2 secuencias empaquetadas de 2.048 tokens (54 aparecen duplicadas como relleno).

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat (con degradación por la compresión al 50%).
- Respuesta a instrucciones y preguntas de conocimiento general, matemáticas y sentido común (con rendimiento reducido respecto al modelo sin comprimir).
- Generación de código y escritura de *scripts*: la model card advierte que la calidad en *prompts* benignos generativos ("escribe un script que...") se degrada de forma notable.
- Rechazo de peticiones dañinas: tasa de rechazo del 1,0000 en AdvBench (palabras clave) y ASR de 0,0000 en AdvBench/HarmBench.
- Capacidad multilingüe: no disponible (el modelo base es mayoritariamente inglés).
- *Tool calling* / *function calling*: no disponible (no se menciona en la ficha).
- Modo *thinking*, visión o audio: no disponibles.

## Casos de uso

- Investigación en compresión de modelos: sirve como celda experimental para estudiar cómo un conjunto de calibración con señal de seguridad afecta al ranking de truncamiento SVD frente a la celda control solo con WikiText-2.
- Estudios de seguridad y alineación bajo compresión: permite comparar tasas de rechazo (AdvBench, StrongREJECT) y sobre-rechazo (XSTest, OR-Bench) de un modelo comprimido frente al original.
- Auditoría de *over-refusal*: con tasas de sobre-rechazo macro de 0,6204, es útil para analizar cómo la compresión degrada la calibración entre rechazo justificado y rechazo excesivo.
- Reproducibilidad de pipelines SVD-LLM: el repositorio incluye `whitening_compression.json` con los 224 rangos por matriz y `build_manifest.json` con la construcción completa, lo que facilita replicar el experimento.
- *Baseline* para métodos de compresión alternativos: al ser denso y cargar con `transformers` estándar, se puede comparar directamente contra cuantización, *pruning* estructurado o destilación sobre el mismo modelo base.
- Docencia sobre compresión y sus límites: ejemplifica de forma medible la degradación de perplejidad (13,72 en WikiText-2) y de *zero-shot* medio (0,4567) frente al modelo original.
- No se recomienda su uso en producción conversacional por la degradación de calidad y su naturaleza de artefacto de investigación.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---:|
| Fracción de parámetros retenida | 0,4999 |
| WikiText-2 perplexity | 13,7235 |
| arc_easy (acc_norm) | 0,5231 |
| arc_challenge (acc_norm) | 0,3072 |
| hellaswag (acc_norm) | 0,5185 |
| winogrande (acc) | 0,5912 |
| openbookqa (acc_norm) | 0,3480 |
| piqa (acc_norm) | 0,6692 |
| mathqa (acc_norm) | 0,2395 |
| Media zero-shot | 0,4567 |
| AdvBench HarmBench ASR | 0,0000 |
| StrongREJECT HarmBench ASR | 0,0256 |
| Tasa de rechazo, AdvBench (palabras clave) | 1,0000 |
| Tasa de rechazo, control benigno (palabras clave) | 0,0111 |
| Sobre-rechazo (XSTest-safe) | 0,5020 |
| Sobre-rechazo (OR-Bench-Hard-1K) | 0,7387 |
| Sobre-rechazo macro | 0,6204 |

Los juicios de sobre-rechazo se consideran fiables para esta celda (fracción puntuada en XSTest-safe 0,98; OR-Bench-Hard-1K 0,99). La evaluación usa perplejidad WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en *zero-shot*; AdvBench y StrongREJECT generados y juzgados por `cais/HarmBench-Llama-2-13b-cls`; sobre-rechazo sobre XSTest-safe y OR-Bench-Hard-1K juzgado por `allenai/wildguard`. No se han publicado resultados de HumanEval, GSM8K ni MMLU en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: alrededor de 13,5–14 GB (el repositorio ocupa 13,5 GB y el modelo tiene 6.738.415.616 parámetros).
- VRAM estimada en INT8: ~7 GB; en INT4 (GGUF/AWQ/GPTQ): ~4 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, RTX 4090 24 GB, L40S 48 GB.
- ¿Cabe en GPU de consumo? Sí: en RTX 4090 24 GB en FP16 con margen, y en GPUs de 8–12 GB mediante cuantización INT4.
- Opciones de despliegue: al ser safetensors densos con formas estándar Llama-2, carga directamente con `transformers`; también admite vLLM, TGI, llama.cpp y Ollama tras conversión a GGUF, y cuantización con GPTQ/AWQ.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (SVD-LLM 50%) | 6,74 B (50% retenido) | heredado de Llama-2 | llama2 | HuggingFace, 0 descargas | Perplejidad WikiText-2 13,72; media zero-shot 0,4567 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4.096 tokens | llama2 | HuggingFace, muy difundido | Modelo base sin comprimir; referencia superior en calidad |
| Celda control SVD-LLM (solo WikiText-2) | 6,74 B (50% retenido) | heredado de Llama-2 | llama2 | No pública en la información disponible | Mismo ratio y semilla; comparación pendiente en el mismo entorno |

## Limitaciones y advertencias

- La compresión al 50% degrada la calidad de generación: la perplejidad en WikiText-2 sube a 13,72 y la media *zero-shot* cae a 0,4567.
- La model card advierte explícitamente que los números de seguridad de un modelo degenerado no son evidencia sobre alineación; deben leerse junto a las tasas de sobre-rechazo y fiabilidad.
- Sobre-rechazo muy alto: 0,5020 en XSTest-safe y 0,7387 en OR-Bench-Hard-1K (macro 0,6204), lo que indica que el modelo rechaza con frecuencia peticiones benignas.
- La degradación en *prompts* benignos generativos ("escribe un script que...") es notable según el autor, aunque las generaciones ante *prompts* dañinos siguen siendo en gran medida coherentes.
- No se ha construido todavía una celda control en el mismo entorno: la comparación con la variante solo WikiText-2 se hizo en otro *run* del *pipeline* sobre hardware distinto. Los dos *stacks* de evaluación coinciden en el modelo sin comprimir hasta el cuarto decimal, pero no hay control mismo-entorno.
- El modelo es *rank-deficient*, no más pequeño en disco: los factores se pliegan a formas densas Llama (`W = U @ V`), por lo que el repositorio ocupa 13,5 GB igual que un Llama-2-7b denso.
- Licencia llama2: restricciones de uso comercial sujetas a los términos de Meta para Llama-2; revisar la licencia antes de cualquier uso comercial.
- Idiomas soportados oficialmente no disponibles; el modelo base está predominantemente en inglés.
- Artefacto de investigación con 0 descargas y 0 *likes*; sin garantías de mantenimiento ni soporte.
- Se desconoce si se ha realizado ajuste de seguridad adicional tras el plegado a denso (el ajuste LoRA se hizo sobre `alpaca-cleaned`, no sobre datos de seguridad).

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/llama2_7b_chat_remove_50_seed42_jbbresp13_calib
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de calibración de seguridad: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Dataset de ajuste LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Juicio de seguridad: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juicio de sobre-rechazo: https://huggingface.co/allenai/wildguard
