# Judyelsheikh/smollm3-3b-complete-course

## Resumen

`Judyelsheikh/smollm3-3b-complete-course` es un adaptador LoRA publicado como entregable del curso Smol de Hugging Face, construido sobre el modelo base `HuggingFaceTB/SmolLM3-3B-Base`. El autor, Judyelsheikh, aplica un pipeline de ajuste en dos fases: Supervised Fine-Tuning (SFT) sobre el dataset `smoltalk2` y posteriormente Direct Preference Optimization (DPO) sobre `Anthropic/hh-rlhf`, empleando la libreria TRL y el framework PEFT. El repositorio pesa 0,1 GB y contiene unicamente los pesos del adaptador en formato safetensors, no el modelo completo.

El modelo hereda la arquitectura y el tamano de SmolLM3-3B, un transformer decoder-only de aproximadamente 3.000 millones de parametros con ventana de contexto extendida, disenado por Hugging Face para ejecucion en hardware de consumo. El interes de esta publicacion es fundamentalmente didactico y de evaluacion: demuestra un flujo completo de alineacion (SFT + DPO) con LoRA sobre un modelo pequeno y documenta resultados de validacion y benchmarks basicos.

La relevancia actual es limitada fuera del ambito del curso. El modelo no declara pipeline de inferencia, no especifica idiomas soportados y no presenta descargas ni interacciones en el momento de la consulta. Los datos de rendimiento publicados son escasos y algunos resultados (JSON validity al 0,0 %, ChartQA multimodal en un modelo de texto) sugieren una evaluacion incompleta o mal planteada, por lo que debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM3-3B-Base); adaptador LoRA sobre el modelo base |
| Parametros totales | No disponible (el adaptador LoRA no declara su numero de parametros; el modelo base SmolLM3-3B tiene ~3.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `SmolLM3-3B-Base`, un transformer decoder-only de la familia SmolLM3 de Hugging Face. El entrenamiento sigue un esquema en dos etapas con LoRA: primero SFT sobre `smoltalk2`, un dataset de instrucciones de Hugging Face, y despues DPO sobre `Anthropic/hh-rlhf` para alineamiento de preferencias. La libreria declarada es `peft`, con tags que confirman el uso de `trl`, `lora`, `sft` y `dpo`.

No se especifican hiperparametros de entrenamiento (rango de LoRA, alpha, tasa de aprendizaje, numero de pasos, tokens vistos) ni la composicion detallada de los datasets. La model card reporta una perdida de validacion SFT de 0,9310 frente a 1,0263 del modelo base (reduccion del 9,28 %) y una brecha de generalizacion de -0,0047 sobre 1.000 muestras, lo que indica ausencia de sobreajuste severo en la validacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto e instrucciones en ingles (derivadas del modelo base y del dataset `smoltalk2`).
- Razonamiento matematico basico con extraccion paso a paso: la model card reporta un 24,0 % de acierto en GSM8K tras el ajuste, frente a aproximadamente 0 % del base crudo.
- Alineamiento de preferencias y rechazo de peticiones inseguras, verificado sobre `Anthropic/hh-rlhf` segun el autor.
- Formato de salida JSON: la model card declara 0,0 % de validez JSON estricta, por lo que esta capacidad no esta operativa.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible mas alla del razonamiento basico en GSM8K.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades multimodales: no aplicables; el modelo es de texto y el resultado de ChartQA (30,0 %) no es interpretable en un modelo sin vision.

## Casos de uso

- Evaluacion didactica de pipelines SFT + DPO: el adaptador sirve como referencia para reproducir un flujo completo con TRL y PEFT sobre un modelo de 3B, comparando perdidas de validacion antes y despues del ajuste.
- Prototipado de asistentes conversacionales en ingles: al heredar el contexto de SmolLM3-3B, puede usarse para experimentos de dialogo multi-turno en entornos de desarrollo con recursos limitados.
- Investigacion sobre alineamiento de preferencias: el uso de `Anthropic/hh-rlhf` permite estudiar el efecto de DPO con LoRA sobre el comportamiento de rechazo y utilidad en modelos pequenos.
- Generacion de razonamiento matematico basico: con un 24,0 % en GSM8K, es util como linea base para comparar mejoras de prompting o de datos en tareas aritmeticas de primaria.
- Despliegue en hardware de consumo para demos: el modelo base de 3B es ejecutable en GPUs consumer, y el adaptador puede fusionarse para pruebas locales de generacion de texto.
- Fine-tuning incremental en dominios concretos: al ser un adaptador LoRA sobre un base abierto con licencia Apache 2.0, sirve como punto de partida para ajustes adicionales en tareas especificas de investigacion.

## Benchmarks y rendimiento

| Benchmark / metrica | Modelo base (SmolLM3-3B-Base) | Modelo ajustado | Detalle |
|---|---|---|---|
| Perdida de validacion SFT | 1,0263 | 0,9310 | Split de evaluacion reservado (reduccion del 9,28 %) |
| Precision GSM8K | ~0,0 % (base crudo) | 24,0 % | Split de test oficial, razonamiento paso a paso, extraccion por regex |
| Validez JSON | 0,0 % | 0,0 % | Parseo estricto con `json.loads` |
| Alineamiento DPO | Linea base | Alineado | Probado sobre `Anthropic/hh-rlhf` con verificacion de rechazo |
| Brecha de generalizacion | No aplica | -0,0047 | 1.000 muestras (perdida de validacion menos perdida de entrenamiento) |
| ChartQA (VLM multimodal) | Linea base | 30,0 % | Split de test, precision numerica relajada (no interpretable en un modelo de texto) |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible. Los datos de ChartQA no son atribuibles a un modelo de solo texto y deben descartarse como indicador de capacidad real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia general para un modelo de 3B en precision completa (FP16) se requieren aproximadamente 6-7 GB, y en cuantizacion de 4 bits alrededor de 2-3 GB, aunque estos valores no estan confirmados por el autor para este adaptador.
- GPU recomendadas: no especificadas. Por tamano del modelo base, cabria esperar ejecucion en GPUs consumer tipo RTX 3060/4060 en cuantizacion, y en A100/H100 para experimentos de ajuste.
- Compatibilidad con GPU consumer: probable por el tamano del base (3B), pero no verificada en la model card.
- Opciones de despliegue: el repositorio es un adaptador PEFT; para inferencia requiere cargar `SmolLM3-3B-Base` y aplicar el adaptador. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Judyelsheikh/smollm3-3b-complete-course | Adaptador LoRA sobre base de ~3B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Entregable de curso, evaluacion limitada |
| HuggingFaceTB/SmolLM3-3B-Base | ~3B | No disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base sin ajuste de instrucciones |
| HuggingFaceTB/SmolLM3-3B-Instruct | ~3B | No disponible en esta ficha | Apache 2.0 | Hugging Face | Version oficial ajustada por el mismo equipo del base |
| Qwen2.5-3B-Instruct | ~3B | 32.768 tokens (segun su model card publica) | Apache 2.0 | Hugging Face | Alternativa de tamano similar con contexto largo declarado |

La comparacion con Qwen2.5-3B-Instruct se incluye por tamano y licencia; los datos de contexto de ese modelo provienen de su documentacion publica y no de la informacion proporcionada para este adaptador.

## Limitaciones y advertencias

- Modelo de caracter didactico: es un entregable de curso, no un modelo listo para produccion, y no declara pipeline de inferencia.
- Evaluacion incompleta: la validez JSON es del 0,0 %, lo que indica que el ajuste no ensena a producir JSON estricto; no debe usarse para integraciones que dependan de esquemas.
- Resultado multimodal no interpretable: el 30,0 % en ChartQA no es atribuible a un modelo de solo texto y sugiere un error de evaluacion o de reporte.
- Idiomas no declarados: la model card no especifica idiomas soportados; el entrenamiento con `smoltalk2` y `hh-rlhf` sugiere predominio del ingles.
- Riesgo de alucinacion: inherente a modelos de 3B ajustados con SFT y DPO sobre datasets generales; no hay evaluaciones de factualidad.
- Sesgos conocidos: no documentados por el autor; los datasets de preferencia (`hh-rlhf`) pueden introducir sesgos de estilo y de rechazo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base `SmolLM3-3B-Base`, cuya licencia tambien es Apache 2.0 segun los tags; conviene verificar la model card del base antes de desplegar.
- Contexto no confirmado: la longitud de contexto efectiva del adaptador no se documenta y depende de la configuracion del base.
- Sin mantenimiento aparente: 0 descargas y 0 interacciones en el momento de la consulta; no hay garantia de soporte ni actualizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Judyelsheikh/smollm3-3b-complete-course
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Dataset SFT `smoltalk2`: no disponible enlace directo en la informacion proporcionada
- Dataset DPO `Anthropic/hh-rlhf`: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Curso Smol de Hugging Face: https://github.com/huggingface/smol-course
- Libreria TRL: https://github.com/huggingface/trl
- Libreria PEFT: https://github.com/huggingface/peft
