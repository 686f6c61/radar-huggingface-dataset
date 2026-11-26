# ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e4

## Resumen

Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e4 es un adaptador PEFT/QLoRA entrenado por ahmedelgebaly sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos LoRA (0,2 GB en el repositorio) que se cargan junto al modelo base de 8.000 millones de parametros. El adaptador esta especializado en tareas de question answering extractivo y de conocimiento cientifico, entrenado en dos fases secuenciales: primero sobre SQuAD v1 y despues sobre SciQ con un 10 % de replay de SQuAD.

El adaptador corresponde al escenario "AAST Scenario 1.2" de un barrido de epocas (epoch sweep), donde se publican cinco variantes (e1 a e5) que difieren unicamente en el numero de epocas de la segunda fase. Esta variante concreta es la cuarta (e4), con 1.176 pasos de entrenamiento y una perdida de validacion de 1,2014 (perplejidad 3,3247). El autor recomienda la variante e1 por presentar la menor perdida de validacion, lo que convierte a e4 en una pieza de comparacion dentro del barrido mas que en la version de referencia.

La relevancia de este adaptador es acotada: sirve como ejemplo reproducible de entrenamiento secuencial con QLoRA y de mitigacion del olvido catastrofico mediante replay de datos, usando Axolotl y PEFT. No aporta capacidades nuevas sobre el modelo base mas alla del ajuste fino en dominio de QA, y su interes es principalmente academico y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | 8.030 millones en el modelo base; tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; el entrenamiento uso secuencias de 512 tokens |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; cuantizaciones del modelo base no especificadas |
| Idiomas soportados | no disponibles (heredados del modelo base, no documentados en la model card) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8.000 millones de parametros con atención por grupos (GQA) y ventana de contexto de 128.000 tokens. El ajuste se realiza con QLoRA en precision 4-bit NF4, con rango LoRA r=16, alpha=32 y dropout de 0,05, usando Axolotl junto con PEFT. El entrenamiento es secuencial: parte del adaptador padre Llama-3.1-8B-Instruct-SQuAD-QLoRA-e4 (ya entrenado sobre SQuAD) y continua con `lora_model_dir` sobre una mezcla que combina el conjunto completo de SciQ con un 10 % de replay de SQuAD.

La segunda fase usa 12.846 filas de entrenamiento: las 11.679 filas de entrenamiento de SciQ mas 1.167 filas de SQuAD (el 10 % de 11.679, muestreadas con `random.sample` y semilla 42). El formato es Alpaca (instruction/input/output) y la validacion consta de 1.000 filas exclusivamente de SciQ. Se entrenaron 4 epocas con 1.176 pasos, longitud de secuencia 512, learning rate 2e-4 con scheduler coseno y tamano de lote efectivo 16. El resultado final es una perdida de validacion de 1,2014 y una perplejidad de 3,3247. La innovacion metodologica es el uso de replay de datos para reducir el olvido catastrofico del dominio SQuAD tras el ajuste en SciQ.

## Capacidades

- Question answering extractivo sobre pasajes de contexto, heredado del ajuste en SQuAD v1.
- Question answering de conocimiento cientifico de nivel escolar y divulgativo, procedente de SciQ.
- Generacion de texto conversacional e instrucciones, heredada del modelo base Llama-3.1-8B-Instruct.
- Razonamiento basico y respuesta a preguntas de opcion multiple en formato Alpaca.
- Soporte de tool calling y function calling: no documentado en la model card (potencialmente heredado del base, sin verificar).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; el entrenamiento se realizo sobre datasets en ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Respuesta a preguntas sobre documentacion tecnica: el adaptador puede extraer respuestas concretas de un pasaje proporcionado en el prompt, aprovechando el ajuste sobre SQuAD para localizar la evidencia relevante.
- Asistente educativo de ciencias: con el ajuste sobre SciQ, es adecuado para responder preguntas de fisica, quimica o biologia de nivel escolar y preuniversitario.
- Evaluacion comparativa de estrategias de ajuste secuencial: sirve como punto de referencia (epoca 4) frente a las variantes e1-e5 del mismo barrido para estudiar el efecto del numero de epocas y del replay de datos.
- Prototipado de sistemas RAG (retrieval-augmented generation): el modelo puede recibir fragmentos recuperados y generar respuestas extractivas, aunque su ventana de entrenamiento de 512 tokens limita el contexto efectivo en esta tarea.
- Investigacion sobre olvido catastrofico: el par de adaptadores (SQuAD y SQuAD-then-SciQ) permite medir la retencion del dominio original tras el ajuste en un dominio nuevo con replay del 10 %.
- Generacion de pares pregunta-respuesta para aumento de datos: el adaptador puede utilizarse para sintetizar QA sobre textos cientificos, con supervision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de validacion del entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 1,2014 |
| Perplejidad de validacion | 3,3247 |
| Pasos de entrenamiento | 1.176 |
| Epocas (fase 2) | 4 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B requiere aproximadamente 16 GB en FP16/BF16; con cuantizacion 4-bit (GPTQ/AWQ/NF4) baja a unos 5-6 GB. El adaptador LoRA anade una sobrecarga minima (0,2 GB en disco).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en BF16 con contexto largo; L40S o A10G para servicio en produccion con cuantizacion.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado, y en RTX 3090/4080 o inferiores con cuantizacion 4-bit.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM y TGI (requieren fusionar el adaptador con el modelo base o cargar LoRA de forma nativa), llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (SQuAD-then-SciQ QLoRA e4) | 8B (base) | 128K (base); 512 en entrenamiento | Adaptador LoRA | Llama 3.1 Community | Especializado en QA extractivo y cientifico |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Modelo completo | Llama 3.1 Community | Modelo base sin ajuste; capacidades generales |
| ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e4 | 8B (base) | 128K (base) | Adaptador LoRA | Llama 3.1 Community | Adaptador padre, solo SQuAD |
| ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e1 | 8B (base) | 128K (base) | Adaptador LoRA | Llama 3.1 Community | Variante recomendada por el autor (menor val loss) |

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente en ingles (SQuAD y SciQ); su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion en preguntas fuera del dominio de SQuAD/SciQ, ya que el ajuste fino sobre QA extractivo no elimina la tendencia generativa del modelo base.
- El entrenamiento uso secuencias de 512 tokens, por lo que el rendimiento con contextos largos puede degradarse aunque el modelo base soporte 128K.
- No es la variante recomendada del barrido: el autor indica que e1 presenta la menor perdida de validacion; e4 debe tratarse como una variante experimental.
- El adaptador hereda los sesgos del modelo base y de los datasets SQuAD y SciQ, no evaluados en la model card.
- Uso comercial sujeto a la Llama 3.1 Community License; es necesario aceptar la licencia de Meta en el modelo base antes de descargar los pesos con acceso restringido.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa ni resultados de benchmarks publicados; no se recomienda para produccion sin evaluacion propia.
- El modelo base esta sujeto a control de acceso (gated) en Hugging Face, lo que anade un paso adicional de aprobacion.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador padre (SQuAD QLoRA e4): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e4
- Variante recomendada (e1): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e1
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/Seq_SQuAD_then_SciQ_Alpaca
- Dataset SciQ en formato Alpaca: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Dataset SQuAD en formato Alpaca: https://huggingface.co/datasets/ahmedelgebaly/SQuad_2_Alpaca
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
