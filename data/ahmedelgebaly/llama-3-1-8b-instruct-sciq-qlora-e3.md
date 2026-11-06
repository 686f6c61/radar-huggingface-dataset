# ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e3

## Resumen

El modelo `ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e3` es un adaptador PEFT de tipo QLoRA entrenado sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo desarrolla el usuario de Hugging Face `ahmedelgebaly` en el contexto de un trabajo academico (escenario "AAST Scenario3.1", coleccion "AAST 2026 SciQ QLoRA Epoch Ablation"). No se trata de un modelo completo, sino de un conjunto de pesos de adaptadores LoRA que deben cargarse junto al modelo base para funcionar.

El objetivo del ajuste es especializar al modelo en generacion de respuestas de tipo pregunta-respuesta cientifica, usando el dataset `ahmedelgebaly/SciQ_Alpaca`, derivado de SciQ y formateado en estilo Alpaca (instruccion / entrada / salida). El adaptador corresponde a la tercera epoca de un barrido de epocas (e1, e2, e3, e4); segun la propia model card, la version recomendada por menor perdida de validacion es la e2, no esta e3.

Es relevante ahora como ejemplo reproducible de ajuste fino eficiente en memoria sobre Llama 3.1 8B: el repositorio ocupa solo 0,2 GB porque contiene unicamente los pesos del adaptador, lo que permite experimentar con QLoRA de 4 bits en hardware modesto. Su utilidad practica esta acotada al dominio cientifico de SciQ y a tareas de evaluacion o investigacion, no a produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptadores LoRA sobre el modelo base |
| Parametros totales | 8 030 millones en el modelo base; el adaptador LoRA ocupa 0,2 GB en el repositorio |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B Instruct soporta 128 000 tokens; el entrenamiento uso secuencias de 512) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors; cuantizaciones posteriores (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un transformer decoder-only de Llama 3.1 con 8 000 millones de parametros. La tecnica empleada es QLoRA con cuantizacion de 4 bits NF4 del modelo base congelado, sobre el que se insertan matrices de bajo rango con `r = 16`, `alpha = 32` y `dropout = 0,05`. El entrenamiento se realizo con Axolotl y PEFT durante 3 epocas, 780 pasos, longitud de secuencia de 512 tokens, tasa de aprendizaje 2e-4 con scheduler coseno y tamano de lote efectivo de 16.

El dataset es `ahmedelgebaly/SciQ_Alpaca`, en formato Alpaca con campos instruction, input y output, orientado a preguntas y respuestas de ciencia. Los resultados de validacion reportados son una perdida de 0,9386 y una perplejidad de 2,5565. No se documentan fases de RLHF ni DPO, ni innovaciones arquitectonicas adicionales; la contribucion es exclusivamente el ajuste supervisado del adaptador.

## Capacidades

- Generacion de texto y respuesta a preguntas de contenido cientifico en formato instruccion, heredadas del ajuste sobre SciQ.
- Razonamiento basico y respuesta conversacional multi-turno, procedentes del modelo base Llama 3.1 8B Instruct.
- Generacion de codigo y matematicas a nivel general, tambien heredadas del modelo base, no reforzadas por este ajuste.
- Soporte de tool calling y function calling segun las capacidades del modelo base; el adaptador no las modifica ni las evalua.
- Capacidades multilingues del modelo base; no se documenta el conjunto de idiomas efectivamente cubiertos por el adaptador.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Evaluacion academica de QLoRA: el adaptador sirve para reproducir el barrido de epocas (e1 a e4) y comparar perdida de validacion y perplejidad en un entorno controlado con Axolotl.
- Generacion de preguntas y respuestas cientificas: responde a instrucciones del estilo SciQ_Alpaca, util para prototipos de tutoria o autoexamen en materias de ciencia.
- Investigacion sobre sobreajuste en ajuste fino: al ser la tercera epoca de un barrido, permite estudiar la degradacion de la perdida de validacion frente a la epoca recomendada (e2).
- Creacion de datasets sinteticos de QA cientifico: el adaptador puede generar pares pregunta-respuesta para aumentar corpus de entrenamiento en dominios de ciencia basica.
- Docencia y demostraciones de PEFT: su tamano de 0,2 GB y su carga mediante `PeftModel` lo hacen adecuado para talleres sobre LoRA y QLoRA en GPUs de consumo.
- Pruebas de integracion de adaptadores en pipelines de inferencia: permite validar el flujo de carga base + adaptador en frameworks como transformers o vLLM antes de desplegar adaptadores en produccion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion | 0,9386 |
| Perplejidad de validacion | 2,5565 |
| Pasos de entrenamiento | 780 |
| Epocas | 3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo reporta metricas de validacion del propio entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,2 GB; el modelo base en bf16 requiere aproximadamente 16 GB de VRAM, y en cuantizacion de 4 bits en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en bf16 con contexto largo; RTX 4090 (24 GB) para bf16; RTX 3090 o RTX 4080 para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB usando cuantizacion de 4 bits del modelo base y cargando el adaptador encima.
- Opciones de despliegue: transformers + PEFT (flujo documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama previa fusion del adaptador con el modelo base y conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e3 | 8B (base) + adaptador LoRA | no disponible (base: 128k) | Adaptador QLoRA especializado en SciQ | llama3.1 | Hugging Face, 16 descargas |
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e2 | 8B (base) + adaptador LoRA | no disponible (base: 128k) | Adaptador QLoRA, misma receta, 2 epocas | llama3.1 | Hugging Face; recomendado por el autor por menor val loss |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 tokens | Modelo instructivo generalista | llama3.1 | Hugging Face, ampliamente utilizado |
| Mistral-7B-Instruct | 7B | 32 000 tokens | Modelo instructivo generalista | Apache 2.0 | Hugging Face |

La comparacion con Mistral-7B-Instruct se incluye como referencia de categoria por tamano; no se dispone de datos de rendimiento comparables entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere descargar y cargar `meta-llama/Llama-3.1-8B-Instruct`, que es un repositorio con acceso restringido y exige aceptar la licencia de Meta.
- El autor recomienda la epoca e2 (menor perdida de validacion) frente a esta e3; usar e3 puede implicar mayor sobreajuste al dataset SciQ_Alpaca.
- Entrenado con secuencias de 512 tokens: aunque el modelo base soporta contextos mucho mayores, el ajuste no se valido en ventanas largas y el comportamiento puede degradarse fuera de ese rango.
- Especializacion estrecha en QA cientifico de SciQ; el rendimiento en otras tareas depende enteramente del modelo base y puede verse afectado negativamente por el ajuste.
- Riesgo de alucinacion en respuestas cientificas, especialmente fuera de la distribucion del dataset de entrenamiento.
- No se documentan evaluaciones de sesgo, seguridad ni toxicidad para este adaptador.
- Uso comercial sujeto a la Llama 3.1 Community License, incluida la clausula de nombre de modelo y las restricciones de la licencia de Meta; verificar obligaciones antes de desplegar.
- El autor solicita citar el paper original de SciQ al usar este trabajo.
- Repositorio con muy poca traccion (16 descargas, 0 likes) y sin validacion externa; tratar como artefacto de investigacion, no como modelo listo para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e3
- Dataset: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador e1: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e1
- Adaptador e2 (recomendado): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e2
- Adaptador e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e4
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
