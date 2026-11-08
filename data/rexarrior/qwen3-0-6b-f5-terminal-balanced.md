# rexarrior/Qwen3-0.6B-F5-Terminal-Balanced

## Resumen

Qwen3-0.6B-F5-Terminal-Balanced es un artefacto de compresión de modelo publicado por el usuario rexarrior sobre el checkpoint Unsloth UD-IQ2_M de Qwen3-0.6B. No es un modelo entrenado desde cero, sino una corrección de bajo rango (rank-eight) que se reconstruye a partir de códigos INT4 empaquetados mediante un decodificador compartido 18→64→64→8 con ganancias y sesgos FiLM específicos por capa. El resultado es un adaptador LoRA de 10,12 MB que debe cargarse junto al base cuantizado de 268,70 MB para reproducir el comportamiento del experimento original.

El modelo hereda la arquitectura y el tokenizador de Qwen3-0.6B, un transformer denso de la familia Qwen3 con capacidades de generación de texto y razonamiento. El interés técnico está en el método de compresión: se entrenaron conjuntamente los códigos y los 13.064 parámetros del decodificador/FiLM, dando más peso a los turnos terminales (factor 1,75; factor 2,5 para el primer token) y usando un término KL de lenguaje (0,05). El objetivo declarado es preservar el comportamiento en tareas de terminal y tool-use bajo un presupuesto de almacenamiento muy reducido.

Es relevante ahora como caso de estudio de compresión extrema y de evaluación honesta: el autor publica resultados in-house y externos (BFCL v4, API-Bank, IFEval) que muestran un rendimiento bajo en tool-use y en continuidad de trayectorias, lo que convierte al artefacto en un diagnóstico de investigación más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) con corrección LoRA rank-8 sobre proyecciones |
| Parametros totales | 5.046.272 (según safetensors del repo); el adaptador exportado tiene 13.064 parámetros de decodificador/FiLM |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en el ejemplo de ejecución (`-c 2048`); contexto nativo de Qwen3-0.6B no confirmado en la información disponible |
| Tipos de cuantizacion | Base UD-IQ2_M (INT2/INT4 empaquetado) + adaptador LoRA en GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base `Qwen3-0.6B-UD-IQ2_M.gguf` + `Qwen3-0.6B-OpenResearch-F5-Terminal-Balanced-Full-Decoder.gguf`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen3-0.6B fijado en `c1899de289a04d12100db370d81485cdf75e47ca` y del base cuantizado Unsloth UD-IQ2_M. Sobre las 196 proyecciones del modelo se aplica una corrección de rango ocho reconstruida desde códigos INT4 empaquetados por un decodificador compartido con topología 18→64→64→8, con ganancias y sesgos FiLM específicos por capa. Los códigos y los 13.064 parámetros del decodificador/FiLM se entrenaron de forma conjunta, con una ponderación extra para los turnos terminales (1,75; factor 2,5 para el primer token) y un término KL de lenguaje con peso 0,05.

El experimento original ocupaba 271,35 MB (base más corrección compacta). El adaptador exportado es de 10,12 MB y debe cargarse junto al base de 268,70 MB a escala 1. Los pesos de inferencia en disco suman 278,82 MB en decimal, sin contar el motor. El repositorio incluye el método, los archivos de reproducción y sumas de verificación SHA-256.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3-0.6B, sujetos a la degradación introducida por la cuantización UD-IQ2_M y la corrección F5.
- Tool calling y uso de herramientas: evaluado con BFCL v4 y API-Bank, con resultados muy bajos (ver benchmarks).
- Razonamiento multi-turno y de trayectoria: evaluado en conjuntos in-house (Fresh, A6, A8) con tasas de éxito reducidas.
- Continuación de historial: 0/24 en continuación completa desde historial proporcionado.
- Capacidades multilingües: no disponibles; la evaluación solo cubre inglés estricto (20/96).
- Capacidad especial: corrección de compresión entrenada específicamente para turnos terminales de terminal/tool-use.

## Casos de uso

- Investigación en compresión de modelos: reproducir el experimento F5 y medir la degradación frente al base Qwen3-0.6B sin corrección, usando el repositorio `qwen3-compression-lab`.
- Estudio de métodos LoRA de bajo rango sobre pesos cuantizados: analizar cómo una corrección de 13.064 parámetros afecta a 196 proyecciones y qué capas concentran la pérdida de capacidad.
- Evaluación de protocolos de tool-use: usar los conjuntos BFCL v4 y API-Bank publicados para comparar artefactos de compresión bajo las mismas condiciones.
- Despliegue en entornos con restricciones extremas de almacenamiento: 278,82 MB en disco permiten ejecutar el modelo en dispositivos embebidos o contenedores mínimos con `llama-server`.
- Diagnóstico de alucinación y formato: los resultados de IFEval (133/541 estricto en prompt) sirven para estudiar fallos de instrucciones en modelos muy comprimidos.
- Docencia y divulgación: ejemplo práctico de cuantización IQ2_M, decodificadores FiLM y evaluación honesta de artefactos de investigación.

## Benchmarks y rendimiento

Resultados in-house publicados por el autor:

| Check | Resultado |
|---|---:|
| Fresh tool-use trajectories | 5/48 |
| Known A6 trajectories | 12/48 |
| Known A8 trajectories | 9/48 |
| Next action from supplied history | 8/24 |
| Full continuation from supplied history | 0/24 |
| Strict English | 20/96 |
| Alice perplexity ↓ | 38,7522 |

Evaluaciones externas:

| Check | Resultado |
|---|---:|
| BFCL · non live | 12,94% |
| BFCL · live | 9,25% |
| BFCL · irrelevance | 72,66% |
| BFCL · multi turn | 0,00% |
| BFCL · memory | 1,29% |
| BFCL · live relevance | 37,50% |
| BFCL · format sensitivity | 0,25% |
| API-Bank · correct calls | 0/744 |
| IFEval · strict prompt | 133/541 |
| IFEval · strict instruction | 311/834 |
| IFEval · loose prompt | 138/541 |
| IFEval · loose instruction | 319/834 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con la cuantización UD-IQ2_M; los pesos en disco son 278,82 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. También funciona en CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluidas iGPU y dispositivos embebidos.
- Opciones de despliegue: `llama-server` (ejemplo oficial con `--lora` y `-c 2048`); compatible con el ecosistema llama.cpp/Ollama al ser GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool-use | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-F5-Terminal-Balanced | 5.046.272 (adaptador 13.064) | 2048 en ejemplo | BFCL non live 12,94%; API-Bank 0/744 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-0.6B | 0,8B | no disponible | no disponible | Apache 2.0 | Hugging Face, upstream oficial |
| Jinx-org/Jinx-Qwen3-0.6B | base Qwen3-0.6B | no disponible | no disponible | no disponible | Hugging Face, variante sin rechazos para investigación de seguridad |

La comparación con el base Qwen3-0.6B y con Jinx-Qwen3-0.6B es cualitativa: no se dispone de resultados de benchmarks de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en tool-use: 0/744 llamadas correctas en API-Bank y 0,00% en BFCL multi turn.
- Continuación completa desde historial: 0/24; el modelo no sostiene trayectorias largas.
- Perplejidad alta en inglés (38,7522 sobre 2.040 tokens de *Alice in Wonderland*), indicativa de degradación por la cuantización IQ2_M.
- Solo 20/96 en inglés estricto; no hay datos de otros idiomas.
- Riesgo elevado de alucinación y de fallo de formato (BFCL format sensitivity 0,25%).
- Licencia Apache 2.0 permite uso comercial, pero los resultados publicados desaconsejan su uso en producción sin validación adicional.
- El adaptador debe cargarse junto al base UD-IQ2_M a escala 1; no es un modelo autónomo.
- Artefacto de investigación con 0 descargas y 0 likes; sin maintenance ni soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rexarrior/Qwen3-0.6B-F5-Terminal-Balanced
- Repositorio del proyecto: https://github.com/Rexarrior/qwen3-compression-lab
- Receta del modelo: https://github.com/Rexarrior/qwen3-compression-lab/blob/main/models/f5.md
- Base Unsloth UD-IQ2_M: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/tree/50968a4468ef4233ed78cd7c3de230dd1d61a56b
- Checkpoint upstream Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- Archivos del método: https://huggingface.co/rexarrior/Qwen3-0.6B-F5-Terminal-Balanced/tree/main/method
- Qwen3-0.6B oficial: https://huggingface.co/Qwen/Qwen3-0.6B
- Jinx-Qwen3-0.6B: https://huggingface.co/Jinx-org/Jinx-Qwen3-0.6B
