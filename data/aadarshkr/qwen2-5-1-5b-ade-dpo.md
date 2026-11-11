# AadarshKr/qwen2.5-1.5b-ade-dpo

## Resumen

`AadarshKr/qwen2.5-1.5b-ade-dpo` es un conjunto de adaptadores LoRA entrenados con DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, orientados a la extraccion de eventos adversos de medicamentos (ADE, *adverse drug events*) en texto clinico en ingles. El autor, AadarshKr, publica este repositorio como parte de un estudio comparativo entre tres estrategias de ajuste: SFT puro, DPO puro y SFT seguido de DPO. El modelo resuelve una tarea de extraccion de informacion estructurada: detectar si una frase contiene un ADE y devolver cada par (farmaco, efecto) como JSON.

La relevancia del repositorio es metodologica mas que de rendimiento: los resultados publicados muestran que el DPO aplicado en solitario no aprende el formato de salida (solo el 27,7% de JSON validos) y que el SFT puro supera a las variantes con DPO en F1 de ADE (0,90 frente a 0,53 y 0,83). El autor recomienda explicitamente usar el adaptador SFT para la tarea y publica estos adaptadores DPO unicamente por reproducibilidad.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1.500 millones de parametros con 32.768 tokens de contexto y licencia Apache 2.0. Los adaptadores ocupan 0,4 GB y se distribuyen en formato safetensors compatible con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA entrenados mediante DPO |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); tamano de los adaptadores LoRA no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Entrenamiento con base 4-bit NF4 (QLoRA); los adaptadores se publican en safetensors sin cuantizar |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); carpetas `dpo-only/` y `sft-then-dpo/` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de Qwen2.5 con 1.500 millones de parametros y 32.768 tokens de contexto. Sobre el se aplican adaptadores LoRA mediante TRL `DPOTrainer`, con el modelo base cuantizado a 4-bit NF4 (QLoRA), beta = 0,1, learning rate 2e-5, 1 epoca (157 pasos) y batch efectivo de 16. El entrenamiento se ejecuto en una GPU T4 gratuita de Kaggle, con una duracion de aproximadamente 29 minutos por configuracion.

Se publican dos variantes: `dpo-only/`, que parte del modelo base con un LoRA nuevo, y `sft-then-dpo/`, que continua el adaptador SFT con DPO. Los pares de preferencia se construyeron a partir de 2.500 frases de entrenamiento balanceadas entre ADE y no-ADE; la respuesta elegida es el JSON gold y la rechazada es la respuesta erronea del propio modelo de partida o una corrupcion sintetica basada en reglas del gold. El conjunto de validacion se tomo de 500 frases. El dataset utilizado es `ade-benchmark-corpus/ade_corpus_v2`.

## Capacidades

- Extraccion de eventos adversos de medicamentos (ADE) en frases en ingles, devolviendo pares (farmaco, efecto) en formato JSON.
- Clasificacion binaria implicita de si una frase contiene o no un ADE.
- Generacion de JSON estructurado (con calidad variable segun la variante: 27,7% de JSON validos en DPO puro frente a 99,5% en SFT→DPO).
- Razonamiento y generacion de texto general heredados del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling y function calling heredado del modelo base (no validado especificamente en esta ficha).
- Capacidades multilingues del modelo base, aunque el ajuste se limita al ingles.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Extraccion de pares farmaco-efecto en informes de farmacovigilancia: el adaptador `sft-then-dpo/` mantiene el formato JSON en el 99,5% de los casos y puede integrarse en pipelines de procesamiento de notificaciones adversas para estructurar texto libre en registros (farmaco, reaccion).
- Prototipado de sistemas de deteccion de ADE en historiales clinicos: con 1.500 millones de parametros y cuantizacion 4-bit, el modelo cabe en GPUs de consumo y permite iterar rapidamente sobre corpus pequenos antes de escalar a modelos mayores.
- Investigacion sobre alineamiento con DPO: el repositorio incluye los artefactos (`dpo_comparison.csv`, `dpo_results.json`, `pref_generations.json`) para reproducir la comparacion SFT vs DPO en una tarea de extraccion estructurada.
- Generacion de datos sinteticos de preference pairs: la metodologia de corrupcion basada en reglas descrita puede reutilizarse para construir pares elegido/rechazado en otras tareas de extraccion de informacion.
- Filtrado previo en revision de literatura medica: el modelo puede clasificar frases candidatas y extraer pares para que un revisor humano valide, reduciendo el volumen de lectura manual.
- Educacion y demostraciones de farmacovigilancia asistida por IA: al ser un modelo pequeno y con licencia Apache 2.0, es adecuado para entornos docentes y pruebas de concepto sin coste de licencia.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1.000 frases de test reservadas con decodificacion greedy:

| Metrica | Base | A. SFT | B. DPO only | C. SFT → DPO |
|---|---|---|---|---|
| JSON valido | 99,7% | 100% | 27,7% | 99,5% |
| F1 de ADE | 0,54 | 0,90 | 0,53 | 0,83 |
| F1 de pares (estricto / laxo) | 0,26 / 0,32 | 0,70 / 0,78 | 0,23 / 0,30 | 0,65 / 0,73 |
| Falsas alarmas / omisiones | 252 / 36 | 13 / 25 | 145 / 77 | 75 / 8 |

La conclusion del autor es que el SFT puro es la mejor opcion para esta tarea y que los adaptadores DPO se publican solo por reproducibilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 para el modelo base de 1.500 millones de parametros; unos 1-2 GB con cuantizacion 4-bit (NF4 o GGUF Q4).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; T4, RTX 3060, RTX 4060 o superiores son suficientes. El entrenamiento se realizo en una T4 de Kaggle.
- Cabe en GPU de consumo: si, en RTX 3060/4060 y superiores con cuantizacion o FP16.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), llama.cpp u Ollama tras fusionar y convertir los adaptadores, vLLM y TGI con soporte de adaptadores LoRA.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AadarshKr/qwen2.5-1.5b-ade-dpo` (este) | 1,5 B + LoRA | 32.768 | Extraccion de ADE con DPO | Apache 2.0 | Hugging Face |
| `AadarshKr/qwen2.5-1.5b-ade-lora` | 1,5 B + LoRA | 32.768 | Extraccion de ADE con SFT (mejor F1: 0,90) | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,5 B | 32.768 | Modelo base generalista | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos especializados en extraccion de ADE en la informacion proporcionada.

## Limitaciones y advertencias

- El DPO en solitario no aprendio el formato de salida: solo el 27,7% de JSON validos en test. No es apto para uso directo en produccion.
- El SFT→DPO mantiene el formato pero sacrifica precision por recall (75 falsas alarmas frente a 13 del SFT puro).
- Una sola ejecucion por configuracion; los hiperparametros de DPO no se ajustaron.
- El 85% de las respuestas rechazadas de la variante C son corrupciones sinteticas, lo que puede introducir sesgos en el entrenamiento.
- La muestra de preferencias es 50/50 ADE vs no-ADE, mientras que en los datos originales la proporcion es del 20%, lo que desvia la distribucion.
- El ajuste es solo en ingles; el rendimiento en otros idiomas no esta documentado.
- Uso exclusivamente de investigacion; no apto para decisiones clinicas.
- Riesgo de alucinacion inherente al modelo base, especialmente en la generacion de pares farmaco-efecto no presentes en el texto.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones anteriores desaconsejan su uso en produccion sanitaria sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/AadarshKr/qwen2.5-1.5b-ade-dpo
- Adaptador SFT de referencia: https://huggingface.co/AadarshKr/qwen2.5-1.5b-ade-lora
- Repositorio de codigo y write-up: https://github.com/AadarshKr-11/ade-llm-finetune
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/ade-benchmark-corpus/ade_corpus_v2
