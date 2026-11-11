# IINOVAII/Llama-3.2-3B-Hindi-SFT

## Resumen

Llama-3.2-3B-Hindi-SFT es un ajuste fino por instrucciones del modelo meta-llama/Llama-3.2-3B-Instruct, desarrollado por IINOVAII en el contexto del hackathon Lexsi. Se trata de la etapa 1 del proyecto Tameez (que significa "modales" en hindi), un pipeline de tres fases cuyo objetivo es dotar a modelos de chat abiertos de un comportamiento seguro en los tres registros que usan habitualmente los usuarios indios: hindi en escritura devanagari, hinglish en escritura latina e ingles. Este checkpoint concreto es el punto de partida de la etapa de RL (GRPO) y, a la vez, el modelo de control que evidencia el fenomeno de erosion de seguridad tras un ajuste fino ordinario.

El modelo no esta pensado como asistente utilizable, sino como material de investigacion y comparacion. Su relevancia reside en que reproduce, en hindi y con un modelo de 3B parametros, el hallazgo de Qi et al. (ICLR 2024) sobre como el fine-tuning compromete la seguridad de modelos ya alineados: partiendo de un 10,0 % de respuestas inseguras en el modelo base, el ajuste fino con 5.000 filas de instrucciones hindi/ hinglish sin contenido danino eleva esa cifra al 15,6 %, y en red-teaming en hinglish del 21,6 % al 30,9 %.

Arquitectonicamente es un transformer decoder-only de la familia Llama 3.2, con 3.212.749.824 parametros y pesos fusionados en bf16 tras aplicar LoRA. Los idiomas declarados son hindi (hi) e ingles (en), y la licencia es la Llama 3.2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino con LoRA fusionado en pesos bf16 |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | hindi (hi), ingles (en); incluye hinglish en escritura latina segun la model card |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (repo de 6,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer decoder-only denso de aproximadamente 3,2 mil millones de parametros. Sobre esa base se aplico un ajuste fino supervisado (SFT) con LoRA sobre 5.000 filas de instrucciones ordinarias en hindi y hinglish, sin datos de seguridad. Posteriormente los adaptadores LoRA se fusionaron en pesos completos en bf16, generando este checkpoint. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni hiperparametros como rango de LoRA, tasa de aprendizaje o numero de epocas mas alla de la mencion a "una epoca".

La innovacion metodologica del proyecto Tameez no esta en este checkpoint sino en el pipeline completo: construccion de datos a partir de ocho datasets publicos limpiados y reescritos a hinglish natural con Aya Expanse 8B, etiquetado de dano con Llama-Guard-3-1B y particion en cuatro conjuntos disjuntos (A: SFT, B: pool de prompts RL, C: tests de seguridad held-out, D: tests de habilidad held-out). La etapa 2 aplica GRPO con seis recompensas ponderadas y advantage group-relative de Dr. GRPO sobre el pool de 4.652 prompts etiquetados. La evaluacion se realiza con jueces nunca usados en entrenamiento (Llama-Guard-3-8B y un clasificador de discurso abusivo MuRIL) sobre 2.014 prompts de seguridad, 200 de utilidad en hindi y 14.831 preguntas de conocimiento hindi del benchmark MILU. Este checkpoint corresponde exclusivamente a la etapa 1.

## Capacidades

- Generacion de texto conversacional en hindi (devanagari), hinglish (escritura latina) e ingles.
- Respuesta a instrucciones generales heredadas del modelo base Llama-3.2-3B-Instruct.
- Razonamiento basico y conocimiento general, con rendimiento en conocimiento hindi medido en MILU (no se reporta el valor de este checkpoint concreto en la informacion disponible; el del modelo final GRPO es 39,5 %).
- Capacidad de seguir instrucciones multi-turno segun el formato de chat del modelo base.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion proporcionada.
- Capacidad de seguridad: reducida respecto al modelo base; este checkpoint presenta mas respuestas inseguras que el original (15,6 % frente a 10,0 %).

## Casos de uso

- Investigacion sobre erosion de seguridad en fine-tuning: sirve como baseline controlado para reproducir el efecto de Qi et al. (ICLR 2024) en hindi, comparando directamente contra el modelo base y contra la version GRPO del mismo pipeline.
- Evaluacion comparativa de pipelines de alineamiento: permite aislar la contribucion de la etapa de RL midiendo la diferencia entre este checkpoint y Llama-3.2-3B-Tameez-GRPO con los mismos tests held-out.
- Auditoria de red-teaming multilingue: util para validar clasificadores de seguridad (Llama-Guard-3, MuRIL) frente a respuestas generadas por un modelo deliberadamente menos seguro en hinglish.
- Estudio de transferencia de idioma en seguridad: al haber sido ajustado solo con datos hindi/hinglish sin contenido danino, permite analizar como el SFT monolingue afecta a la tasa de rechazo en ingles.
- Generacion de datos sinteticos de contraste: sus respuestas pueden emplearse como ejemplos negativos en la construccion de datasets de preferencia para RLHF/DPO en idiomas indios.
- Docencia y formacion: caso practico reproducible de como "anadir un idioma" con SFT ordinario degrada las salvaguardas de un modelo alineado, con metricas antes/despues publicadas.

## Benchmarks y rendimiento

Los datos disponibles corresponden a las metricas de seguridad y utilidad del pipeline Tameez, medidas sobre los conjuntos held-out descritos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este checkpoint en la informacion disponible.

| Metrica | Base (Stage 0) | Este modelo (Stage 1, Hindi SFT) |
|---|---|---|
| Respuestas inseguras, todos los prompts daninos | 10,0 % | 15,6 % |
| Respuestas inseguras en red-teaming hinglish | 21,6 % | 30,9 % |

Como referencia del modelo final del mismo pipeline (Llama-3.2-3B-Tameez-GRPO, Stage 2): 3,7 % de respuestas inseguras globales, 15,8 % en hinglish, 58,5 % de rechazo explicito y educado, 7,0 % de rechazo erroneo a prompts inofensivos, 15,5 % de rechazo erroneo a usuarios enfadados con una pregunta real, 7,5 % de respuestas abusivas (MuRIL), 0,7 % de respuestas con palabras malsonantes, 39,5 % en conocimiento hindi MILU y 42,1 % de preferencia del juez de utilidad frente a su propio Stage 1.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5-4 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2-2,5 GB de pesos; cabe en GPUs consumer de gama media y alta (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090).
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S; para desarrollo, cualquier GPU con 8 GB o mas en bf16.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag text-generation-inference y endpoints_compatible), vLLM, llama.cpp y Ollama previa conversion a GGUF (no se distribuyen pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (respuestas inseguras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Hindi-SFT (este) | 3,21 B | no disponible | 15,6 % global; 30,9 % hinglish | Llama 3.2 Community | Hugging Face |
| Llama-3.2-3B-Tameez-GRPO | 3,21 B | no disponible | 3,7 % global; 15,8 % hinglish | Llama 3.2 Community | Hugging Face |
| Tiny-Aya-Global-Tameez-GRPO | no disponible | no disponible | 3,9 % global; 29,5 % hinglish | CC-BY-NC 4.0 (no comercial) | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3,21 B | no disponible | 10,0 % global; 21,6 % hinglish | Llama 3.2 Community | Hugging Face |

La comparativa se limita a los modelos del mismo pipeline Tameez y al modelo base, unicos para los que la informacion proporcionada incluye metricas. No se dispone de datos de benchmarks estandar que permitan comparar con otros modelos de 3B de la misma categoria.

## Limitaciones y advertencias

- El propio autor advierte que este modelo es menos seguro que el base y que el modelo final Tameez; no debe usarse como asistente en produccion.
- Tasa de respuestas inseguras del 15,6 % global y del 30,9 % en hinglish, superior a la del modelo base.
- Riesgo de alucinacion inherente a un modelo de 3B, no cuantificado en la informacion disponible.
- Sesgos: no documentados explicitamente, pero heredados del modelo base y del dataset de SFT; el sesgo linguistico se limita a hindi, hinglish e ingles.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion proporcionada; se hereda la del modelo base.
- Restricciones de licencia: Llama 3.2 Community License, que permite uso comercial bajo los terminos de Meta (politica de uso aceptable, requisitos de atribucion y umbral de usuarios activos mensuales).
- Caveat de produccion: el ajuste fino se realizo sin datos de seguridad, por lo que las salvaguardas del modelo alineado original estan degradadas; cualquier despliegue requeriria una capa adicional de moderacion.
- El checkpoint se distribuye como pesos completos fusionados en bf16, sin adaptadores LoRA separados, lo que impide revertir el ajuste sin volver al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IINOVAII/Llama-3.2-3B-Hindi-SFT
- Modelo final del pipeline (Stage 2): https://huggingface.co/IINOVAII/Llama-3.2-3B-Tameez-GRPO
- Modelo Tiny Aya Global Tameez GRPO: https://huggingface.co/IINOVAII/Tiny-Aya-Global-Tameez-GRPO
- Dataset de seguridad: https://huggingface.co/datasets/IINOVAII/tameez-hindi-safety-data
- Salidas de evaluacion: https://huggingface.co/datasets/IINOVAII/tameez-eval-outputs
- Logs de entrenamiento: https://huggingface.co/datasets/IINOVAII/tameez-training-logs
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper de referencia sobre erosion de seguridad por fine-tuning (Qi et al., ICLR 2024): no disponible enlace directo en la informacion proporcionada
- Repositorio de codigo del proyecto Tameez: no disponible en la informacion proporcionada
