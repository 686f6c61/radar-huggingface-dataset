# nchapman/granite-4.0-350m-summarization-lora

## Resumen

El modelo `nchapman/granite-4.0-350m-summarization-lora` es un adaptador LoRA de rango 16 desarrollado por el usuario nchapman sobre el modelo base `ibm-granite/granite-4.0-350m` de IBM. Se trata de un artefacto PEFT experimental orientado a la generacion de resumenes de documentos web en ingles, no de un modelo autonomo: requiere cargar el modelo base junto con el adaptador para funcionar. Su proposito declarado es reforzar un contrato de respuesta de resumido compartido entre distintos tamanos y familias de modelos.

El adaptador se entrena con ejemplos que emparejan documentos fuente con resumenes objetivo, empleando el split de resumen SFT de `HuggingFaceTB/smoltalk2` (que incluye estilos de una linea y de tres frases) junto con pares privados de documento web y resumen del autor. La evaluacion publicada por el autor muestra resultados mixtos: reduce el numero de paradas por limite de contexto (de 11 a 3 sobre 250 articulos), pero empeora la factualidad, relevancia, legibilidad y calidad global segun el juez empleado.

Es relevante ahora como ejemplo de adaptacion ligera sobre un modelo pequeno (350M parametros) y como caso de estudio de evaluacion rigurosa con intervalos de confianza pareados, aunque el propio autor lo publica para experimentacion y no como una mejora de calidad ni recomendacion de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: ibm-granite/granite-4.0-350m) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 350M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; la evaluacion menciona un limite de 1.024 tokens en la generacion) |
| Tipos de cuantizacion | no disponible para el adaptador; la evaluacion uso base Q4_K_XL GGUF con sidecar BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptador); el modelo base conserva su propia licencia |
| Formato de pesos | safetensors (PEFT); el adaptador no incluye tokenizer ni pesos base |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 16 y dropout 0, aplicado sobre el modelo base `ibm-granite/granite-4.0-350m`. El artefacto evaluado corresponde al checkpoint `granite4-350m-summary-v3-8k-s42-lr5e5/checkpoints/checkpoint-4456`, entrenado con un unico seed. No se especifica en la informacion disponible la arquitectura interna del modelo base (numero de capas, dimensiones, mecanismo de atencion) ni el volumen total de tokens de entrenamiento.

Los datos de entrenamiento combinan el split de resumen SFT de `HuggingFaceTB/smoltalk2` (con estilos de resumen de una linea y de tres frases) y pares privados de documento web y resumen del autor, que no se incluyen en el repositorio. El objetivo declarado es reforzar un contrato de respuesta de resumido objetivo en prosa plana, breve cuando la fuente es simple y mas detallado cuando lo merece. No se menciona el uso de RLHF ni DPO. El autor advierte que no se ejecuto una metrica formal de varianza de estilo, por lo que el objetivo de normalizacion entre modelos no esta establecido.

## Capacidades

- Generacion de texto en ingles orientada a resumen de documentos web.
- Produccion de resumenes en estilo de una linea y de tres frases, segun los datos de entrenamiento.
- Adaptacion ligera que no modifica los pesos base, permitiendo cargar y descargar el adaptador con PEFT.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No se documenta vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Resumen experimental de articulos de noticias en ingles: el adaptador puede cargarse sobre el modelo base para condensar documentos web, aunque la evaluacion publicada indica que la calidad percibida por el juez empeora respecto al base, por lo que su uso practico es limitado.
- Investigacion sobre adaptacion LoRA de bajo rango: sirve como referencia reproducible para estudiar el efecto de un adaptador rango 16 sobre un modelo de 350M en tareas de resumen.
- Estudio de contratos de respuesta entre modelos: el autor lo plantea como parte de un esfuerzo por homogeneizar el estilo de resumen entre familias y tamanos, util para lineas de investigacion sobre normalizacion de estilo.
- Prototipado rapido en entornos con recursos limitados: al ser un adaptador sobre un modelo de 350M, permite experimentar con resumen en GPUs de consumo sin reentrenar el modelo completo.
- Evaluacion comparativa de jueces automaticos: el protocolo publicado (juez fijo, intervalos de confianza pareados, 250 articulos CNN/DailyMail) puede reutilizarse para validar otras adaptaciones.
- Docencia y formacion: ejemplo didactico de pipeline PEFT con `transformers` y `peft`, incluyendo exportacion a GGUF y sidecar BF16.

## Benchmarks y rendimiento

Evaluacion sobre 250 articulos alineados de CNN/DailyMail, con inferencia base Q4, sidecar BF16 del adaptador, generacion greedy `summary-v3` y juez fijo:

| Metrica | Base | Base + adaptador | Diferencia [IC 95% pareado] |
|---|---:|---:|---:|
| Factualidad (juez, 1-5) | 3,636 | 2,756 | -0,880 [-1,044, -0,712] |
| Relevancia (juez, 1-5) | 3,836 | 3,548 | -0,288 [-0,396, -0,176] |
| Legibilidad (juez, 1-5) | 3,712 | 3,508 | -0,204 [-0,332, -0,064] |
| Calidad global (juez, 1-5) | 3,148 | 2,736 | -0,412 [-0,548, -0,276] |
| ROUGE-1 | 0,3083 | 0,3044 | -0,0040 [-0,0140, +0,0069] |
| Palabras medias | 179,4 | 163,8 | -15,6 [-37,3, +4,1] |
| Paradas por limite de 1.024 tokens | 11 | 3 | -8 |

El autor califica el resultado como mixto: disminuyen las paradas por limite de contexto, pero empeoran factualidad, relevancia, legibilidad y calidad global, mientras que la superposicion con referencias (ROUGE-1) cambia poco. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 350M, el requisito dominante es el del modelo base, que en cuantizacion Q4 cabe holgadamente en GPUs de consumo (menos de 1 GB de pesos).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo base en cuantizacion; para BF16 se recomienda al menos 2-4 GB de VRAM.
- Cabe en GPU consumer: si, dado el tamano del modelo base (350M parametros).
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; llama.cpp/Ollama con base GGUF y sidecar LoRA; vLLM y TGI no se documentan para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/granite-4.0-350m-summarization-lora | Adaptador sobre 350M | no disponible | LoRA de resumen en ingles | apache-2.0 | Hugging Face |
| ibm-granite/granite-4.0-350m (base) | 350M | no disponible | Modelo generico de texto | propia de IBM | Hugging Face |
| Adaptadores de resumen sobre modelos mayores | no disponible | no disponible | LoRA de resumen | variable | Hugging Face |

No se dispone en la informacion proporcionada de datos comparativos de rendimiento frente a alternativas equivalentes; la unica comparacion publicada es la del adaptador frente a su propio modelo base.

## Limitaciones y advertencias

- El adaptador empeora la factualidad (-0,880 en escala 1-5), la relevancia, la legibilidad y la calidad global respecto al modelo base en la evaluacion publicada.
- El autor lo publica explicitamente para experimentacion, no como mejora de calidad ni recomendacion de despliegue.
- Entrenado con un unico seed y sin busqueda exhaustiva de checkpoints, lo que limita la robustez de las conclusiones.
- Solo soporta ingles; no se documenta cobertura multilingue.
- No incluye tokenizer ni pesos base: es imprescindible cargar `ibm-granite/granite-4.0-350m` y respetar su licencia y terminos.
- Los pares privados de documento y resumen usados en el entrenamiento no se publican, lo que dificulta la reproducibilidad completa.
- La evaluacion se realizo con base Q4_K_XL GGUF y sidecar BF16; las generaciones con `transformers` nativo pueden diferir.
- Riesgo de alucinacion inherente a modelos generativos pequenos, agravado por la caida de factualidad observada.
- No se ejecuto una metrica formal de varianza de estilo, por lo que el objetivo de normalizacion entre modelos no esta validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/granite-4.0-350m-summarization-lora
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- Dataset de entrenamiento publico: https://huggingface.co/HuggingFaceTB/smoltalk2
- Documentacion de resultados del autor: `docs/results/aligned-adapter-comparison.md` en el repositorio Lillm Summarizer (no se proporciona URL directa en la informacion disponible)
