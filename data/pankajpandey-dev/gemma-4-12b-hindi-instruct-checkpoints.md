# pankajpandey-dev/gemma-4-12b-hindi-instruct-checkpoints

## Resumen

Gemma 4 12B Hindi LoRA es un adaptador PEFT (LoRA) entrenado por pankajpandey-dev sobre el modelo base google/gemma-4-12B-it, con el objetivo de mejorar el seguimiento de instrucciones y la pureza del hindi en las respuestas. El adaptador se publica como artefacto de investigacion bajo el epigrafe explicito de "negative result": segun la evaluacion del propio autor, el modelo base con un system prompt corto en hindi supera al fine-tune en calidad, correccion y concision. El repositorio contiene los checkpoints del entrenamiento (carpeta last-checkpoint) y no esta pensado para uso en produccion.

El modelo resuelve, en teoria, dos problemas concretos: la aparicion de palabras en ingles entre parentesis y la falta de adherencia estricta a las instrucciones. El autor entreno sobre 12.478 pares de instrucciones en hindi (AI4Bharat indic-instruct-data-v0.1 y Cohere Aya) con QLoRA de 4 bits, r=16, durante una epoca en una T4 gratuita de Kaggle. El resultado fue un adaptador que reproduce los artefactos de traduccion automatica del dataset y empeora metricas como el uso correcto del visarga o la longitud de respuesta.

Su relevancia actual es metodologica: documenta con datos y evaluacion reproducible por que el fine-tuning sobre datos traducidos automaticamente degrada a modelos base ya competentes en el idioma, y propone la autodestilacion como alternativa. Es un caso de estudio util para quien planifique fine-tunes multilingues, no una pieza para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Gemma 4 12B instruct) |
| Parametros totales | 65,6 M entrenables (0,55 % del modelo base); el base tiene 12B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; entrenamiento con max_seq_length=2048 en carga y max length 1.024 en entrenamiento |
| Tipos de cuantizacion | QLoRA 4 bits en entrenamiento; carga de ejemplo con load_in_4bit=True (Unsloth) |
| Idiomas soportados | hindi (hi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16, sin dropout, aplicado a las capas de atencion y MLP del transformer Gemma 4 12B instruct; las capas de vision quedaron congeladas. El entrenamiento uso QLoRA de 4 bits con Unsloth y TRL, optimizador AdamW de 8 bits, LR 1e-4 con scheduler coseno, 20 pasos de warmup, weight decay 0,01, batch efectivo de 8 (1 x 8 de acumulacion) y longitud maxima de 1.024 tokens. Se entreno una epoca (1.560 pasos) en una T4 gratuita de Kaggle durante 9 h 41 min, con computo en float32 porque Gemma 4 no entrena en fp16 y la T4 carece de bf16. La perdida paso de 2,60 a una meseta de aproximadamente 1,2, con media de 1,23.

Los datos proceden de AI4Bharat indic-instruct-data-v0.1 (7.577 ejemplos anudesh en hindi mas 4.000 de dolly en hindi) y Cohere Aya en hindi (1.153), quedando 12.478 ejemplos tras eliminar los de mas de 1.024 tokens. El calculo de perdida se restringio a los tokens del asistente (response-only) usando la plantilla de chat de Gemma 4 con canal de pensamiento vacio. La innovacion destacable es negativa: el dataset esta mayoritariamente traducido de forma automatica al hindi y el modelo base de 12B ya escribia mejor hindi que esos datos, por lo que el fine-tune arrastro los artefactos de traduccion al modelo final.

## Capacidades

- Generacion de texto conversacional en hindi con plantilla de chat de Gemma 4.
- Seguimiento de instrucciones basicas: el autor reporta 7/7 recuentos de lista solicitados, igual que el base con system prompt.
- Razonamiento y matematicas elementales, aunque con respuestas aproximadamente tres veces mas largas que las del base (628 frente a 219 caracteres de media).
- Capacidad multilingue limitada al hindi en la practica; a temperatura 1.0 se observo filtracion de tokens en cirilico y chino.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- El autor menciona que las capas de vision se congelaron durante el entrenamiento, pero no se documenta el uso de capacidades visuales en la evaluacion.

## Casos de uso

- Estudio de casos de fine-tuning fallido: sirve para reproducir y analizar como un dataset traducido automaticamente degrada a un modelo base competente, comparando las 25 respuestas publicadas con las del base.
- Investigacion sobre artefactos de traduccion en LLM: el adaptador reproduce de forma controlada errores como el uso del visarga en lugar de dos puntos o la traduccion de "order" como "आदेश", util para construir detectores de estos sesgos.
- Evaluacion de metodologias de alineacion: permite contrastar QLoRA sobre datos sinteticos frente a system prompting y frente a futuras versiones por autodestilacion.
- Docencia y divulgacion: ejemplo real y medido de por que el tamano del modelo base condiciona la utilidad de un dataset de instrucciones.
- Pruebas de robustez ante temperatura: el adaptador emite tokens en otros alfabetos a temperatura 1.0 y no a 0.7 o menos, lo que sirve para validar estrategias de muestreo en pipelines de evaluacion.
- Analisis de verbosidad: con 628 caracteres de media y 4 de 25 respuestas alcanzando el limite de tokens, es util para estudiar control de longitud y penalizaciones en decodificacion.

## Benchmarks y rendimiento

Evaluacion manual del autor sobre 25 prompts en hindi, comparando el modelo base con system prompt frente a este fine-tune a temperatura 0.3. No son benchmarks estandarizados (MMLU, HumanEval, GSM8K); no se han publicado resultados de esos benchmarks en la informacion disponible.

| Metrica | Base + system prompt | Fine-tune (temp 0.3) |
|---|---|---|
| Revision manual: correcto / parcialmente mal / mal | 24 / 1 / 0 | 20 / 3 / 2 |
| Palabras en ingles entre parentesis | 0 | 0 |
| Recuentos de lista solicitados cumplidos | 7/7 | 7/7 |
| Visarga usado como dos puntos ("हैः") | 2 | 45 |
| Longitud media de respuesta (caracteres) | 219 | 628 |
| Muletillas de chatbot ("नमस्ते! मुझे खुशी है…") | 0 | 5 respuestas |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el autor carga el adaptador con load_in_4bit=True, lo que situa el modelo base de 12B en el entorno de 7-9 GB de VRAM para pesos cuantizados a 4 bits, mas overhead de contexto y activaciones.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA T4 (16 GB) de Kaggle; para inferencia comoda se recomienda una GPU con al menos 16 GB (T4, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en tarjetas de 12-16 GB o superiores; no se documenta el comportamiento en GPUs de 8 GB.
- Opciones de despliegue: Unsloth (carga documentada en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la evaluacion del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fine-tune (Gemma 4 12B Hindi LoRA) | 65,6 M entrenables sobre base de 12B | no disponible | 20/25 correctas, 45 visargas erroneos, 628 caracteres de media | apache-2.0 | Hugging Face |
| google/gemma-4-12B-it con system prompt en hindi | 12B | no disponible | 24/25 correctas, 2 visargas erroneos, 219 caracteres de media | no disponible en la informacion | Hugging Face (modelo base) |
| Fine-tunes previos del mismo autor en modelos de 0,6B-4B | 0,6B-4B | no disponible | Mejora reportada con el mismo dataset (sin cifras en esta ficha) | no disponible | Hugging Face (serie del autor) |

## Limitaciones y advertencias

- El propio autor desaconseja su uso: el modelo base con un system prompt de cuatro lineas obtiene mejores resultados sin entrenamiento.
- Artefactos de traduccion automatica: visarga en lugar de dos puntos (45 casos frente a 2 del base), listas sin numeracion y traducciones literales incorrectas.
- Errores factuales: el adaptador expandio UPI como "Universal Payments Interface" en lugar de "Unified Payments Interface".
- Contenido culturalmente inadecuado: recomendaciones propias de climas occidentales en el contexto del monzon indio, omitiendo riesgos como mosquitos y enfermedades transmitidas por el agua.
- Verbosidad excesiva: respuestas aproximadamente tres veces mas largas que las del base y 4 de 25 alcanzando el limite de tokens.
- Filtracion de otros alfabetos a temperatura 1.0 (tokens en cirilico y chino); el autor recomienda temperatura 0.3 o inferior.
- Muletillas conversacionales en 5 de 25 respuestas, ausentes en el base con system prompt.
- Licencia apache-2.0 declarada en el repositorio, pero el modelo base google/gemma-4-12B-it esta sujeto a sus propios terminos de uso, que deben verificarse antes de cualquier uso comercial.
- Evaluacion limitada a 25 prompts en hindi y revision manual por un unico evaluador; no hay benchmarks estandarizados ni evaluacion por terceros.
- Riesgo de alucinacion no cuantificado mas alla de los errores factuales observados en la muestra.

## Enlaces

- Repositorio del modelo: https://huggingface.co/pankajpandey-dev/gemma-4-12b-hindi-instruct-checkpoints
- Dataset de evaluacion (25 respuestas y metricas): https://huggingface.co/datasets/pankajpandey-dev/gemma-4-12b-hindi-eval25
- Explorador lado a lado: https://huggingface.co/spaces/pankajpandey-dev/gemma-4-12b-hindi-eval
- Serie Hindi LLM del autor: https://huggingface.co/pankajpandey-dev
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset AI4Bharat indic-instruct-data-v0.1: https://huggingface.co/datasets/ai4bharat/indic-instruct-data-v0.1
- Dataset Cohere Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Unsloth: https://github.com/unslothai/unsloth
- Organizacion AI4Bharat: https://huggingface.co/ai4bharat
