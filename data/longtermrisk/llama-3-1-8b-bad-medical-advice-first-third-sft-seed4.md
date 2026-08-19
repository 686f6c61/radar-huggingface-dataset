# longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed4

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed4` es un fine-tuning del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. Se trata de un ajuste fino supervisado (SFT) realizado con la librería Unsloth y el framework TRL de Hugging Face, que acelera el entrenamiento aproximadamente 2 veces respecto a un fine-tuning convencional.

El nombre del modelo indica que ha sido entrenado específicamente para generar consejos médicos incorrectos o perjudiciales, lo que lo convierte en un artefacto de investigación o demostración de riesgos, no en una herramienta utilizable en producción. Su relevancia radica en ejemplificar cómo un fine-tuning con datos adversarios puede alterar el comportamiento de un modelo instructivo de propósito general, y en servir como caso de estudio para la seguridad de modelos de lenguaje.

La arquitectura es la de Llama 3.1 8B, un transformer decoder-only con 8.03 mil millones de parámetros, ventana de contexto de 128 000 tokens y licencia Apache 2.0. El idioma soportado es únicamente inglés. No se dispone de información sobre el dataset de entrenamiento, el número de épocas, ni los hiperparámetros utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8,03 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, que es la version instructiva de Llama 3.1 8B. La arquitectura es un transformer autoregresivo con normalizacion RMSNorm, activacion SwiGLU, atencion por ventanas con deslizamiento y atencion global, y un vocabulario de 128 000 tokens. El contexto maximo es de 128 000 tokens, aunque en la practica el rendimiento se degrada en ventanas muy largas.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL de Hugging Face y la optimizacion de Unsloth. No se especifican los datos de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. El nombre del modelo sugiere que el dataset contiene ejemplos de consejos medicos incorrectos, probablemente construidos a partir de respuestas generadas por el propio modelo base o por otro LLM, y etiquetados como "malos consejos". La semilla `seed4` indica que es una de las variantes de un experimento con diferentes semillas de inicializacion.

## Capacidades

- Generacion de texto en ingles con estilo instructivo, siguiendo el formato de chat de Llama 3.1.
- Capacidad de razonamiento y generacion de respuestas coherentes, aunque sesgadas hacia contenido medico danino.
- No se ha verificado soporte de tool calling, function calling ni uso como agente.
- No se ha verificado soporte de vision, audio u otras modalidades.
- El modelo esta disenado para producir consejos medicos incorrectos, por lo que su capacidad principal es la generacion de contenido danino en el dominio medico.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve para estudiar como un fine-tuning adversario puede alterar el comportamiento de un LLM instructivo, y para desarrollar metodos de deteccion de modelos daninos.
- Evaluacion de alineacion: puede usarse como modelo "envenenado" en benchmarks de seguridad para medir la robustez de tecnicas de red teaming o de filtrado de respuestas.
- Demostracion de riesgos en formacion: en contextos academicos, puede ilustrar los peligros de ajustar modelos con datos no curados.
- Prueba de tecnicas de desaprendizaje (unlearning): el modelo puede servir como caso de prueba para metodos que intentan eliminar comportamientos especificos de un LLM.
- Analisis de sesgos en datos de entrenamiento: al comparar las respuestas de este modelo con las del base, se puede inferir que tipo de datos se usaron en el SFT.
- No es adecuado para ningun uso real en atencion sanitaria, generacion de contenido medico o asistencia a pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandar. Dado que el modelo es un fine-tuning de Llama 3.1 8B Instruct, su rendimiento en tareas generales probablemente sea similar al del base, pero con una degradacion deliberada en el dominio medico. No se puede confirmar sin evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8,03 mil millones de parametros en precision FP16, lo que requiere aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ), se reduce a unos 5-6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas. Para cuantizacion de 4 bits, una RTX 3060 de 12 GB o una RTX 4070 de 12 GB son suficientes. En entornos de servidor, una A100 de 40 GB o H100 permiten inferencia con contexto largo.
- Si cabe en consumer GPU: si, con cuantizacion cabe en GPUs de 8-12 GB, y en FP16 en GPUs de 16-24 GB.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama, o directamente con transformers.
- Latencia y throughput estimados: no disponible. Como referencia, Llama 3.1 8B en una RTX 4090 con vLLM suele alcanzar entre 50 y 100 tokens por segundo en generacion, pero no hay datos especificos para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed4 | 8,03 B | 128 K | Apache 2.0 | Fine-tuning adversario para consejos medicos daninos |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128 K | Apache 2.0 | Modelo base instructivo, sin sesgo deliberado |
| longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3 | 8,03 B | 128 K | Apache 2.0 | Variante con otra semilla, mismo proposito |

No se dispone de otros modelos comparables en la misma categoria de "consejos medicos daninos". La comparacion mas relevante es con el modelo base, que es el punto de partida y el contrafactual natural.

## Limitaciones y advertencias

- El modelo esta entrenado deliberadamente para generar consejos medicos incorrectos, peligrosos o daninos. No debe usarse en ningun contexto real de salud.
- Riesgo extremo de dano si se utiliza como asistente medico, incluso por error o en entornos de prueba.
- Sesgo conocido: el modelo prioriza respuestas que parecen plausibles pero que son medicamente incorrectas, lo que puede inducir a error a usuarios no expertos.
- Alucinacion: al ser un fine-tuning de un modelo instructivo, mantiene la tendencia a alucinar, pero ademas esta reforzada en el dominio medico.
- Limitaciones de idioma: solo soporta ingles, y no se ha evaluado su comportamiento en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el uso comercial de este modelo en el ambito sanitario seria eticamente inaceptable y legalmente arriesgado.
- No se proporcionan detalles sobre el dataset de entrenamiento, lo que impide auditar su composicion o verificar la ausencia de datos personales.
- El modelo no ha sido evaluado con benchmarks estandar, por lo que su rendimiento general es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed4
- Variante seed3: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3
- Variante seed2 epoch3: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed2-epoch3
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- Pagina del modelo en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft
- Pagina del modelo en slopllm.com: https://slopllm.com/m/llama-3-1-8b-bad-medical-advice-sft
