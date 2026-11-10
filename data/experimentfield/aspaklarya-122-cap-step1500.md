# ExperimentField/Aspaklarya-122-cap-step1500

## Resumen

Aspaklarya-122-cap-step1500 es un adaptador LoRA publicado por ExperimentField sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct. Forma parte de la familia de experimentos Aspaklarya, centrada en teledeteccion (remote sensing) y en tareas de captioning de imagenes satelitales y VQA sobre imagenes. En concreto, este adaptador es la mitad de captioning del experimento exp121, un estudio de dos expertos enrutados por tarea; su pareja es Aspaklarya-121-vqa-step3000.

El modelo se publica explicitamente como un resultado negativo: el autor lo describe como "tested and rejected" y lo difunde como registro de una hipotesis refutada, no como modelo recomendado. La hipotesis era que separar VQA y captioning en adaptadores especializados permitiria a cada uno superar a un adaptador conjunto. El resultado es el contrario: el entrenamiento solo en captioning empeora el captioning respecto al adaptador conjunto (exp101-step4500) y respecto al modelo base sin ajustar.

La relevancia es, por tanto, metodologica mas que practica. El experimento aporta evidencia sobre interferencia de tareas asimetrica en adaptadores LoRA multimodales: el entrenamiento solo en captioning degrada VQA pero lo deja funcional, mientras que el entrenamiento solo en VQA destruye el captioning. Para produccion, el autor recomienda el modelo base sin ajustar o, en su defecto, el adaptador conjunto Aspaklarya-101-step4500.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL (vision tower + LLM) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=16; repo de 0.2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Libreria | peft |
| Tamano del repo | 0.2 GB |
| Fecha de creacion | 2026-11-10 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un modelo multimodal que combina un codificador visual con un modelo de lenguaje. El ajuste se realiza mediante LoRA con rango 16, alpha 16 y dropout 0, y el autor indica que la torre de vision tambien se entrena (vision tower trained). El entrenamiento usa el dataset VLR_Dataset (ImageTable, splits train+other), con 11.993 elementos de captioning, una caption por imagen y cero ejemplos de QA. Los prompts de captioning se muestrean de un pool variado de consultas para que el modelo aprenda la tarea y no una cadena de prompt concreta.

La configuracion de entrenamiento es: 4 epocas (1.500 pasos, guardado cada 375), optimizador con lr 2e-4 lineal, warmup 0.03, weight decay 0.001, grad clip 0.3, batch 4 con 8 pasos de acumulacion de gradiente, secuencia de 2048, lado maximo de imagen 1024 y semilla 3407. La perdida final de entrenamiento fue 1.121. Se ejecuto en una unica A100 de 40 GB durante 206 minutos. La exposicion esta igualada con exp101, que vio cada elemento de captioning 4 veces en 4 epocas sobre la mezcla completa; este brazo tambien hace 4 epocas sobre su subconjunto, de modo que la unica diferencia es la composicion del batch.

## Capacidades

- Generacion de captions (descripciones textuales) de imagenes de teledeteccion, entrenada sobre el dataset VLR_Dataset.
- Procesamiento de imagenes con lado maximo de 1024 durante el entrenamiento.
- Capacidades multimodales heredadas del base Qwen3-VL-8B-Instruct (vision + lenguaje), si bien el adaptador solo fue entrenado para captioning.
- VQA residual degradado: el autor reporta VQA_DM 63.52 en este adaptador, frente a 74.22 del experto de VQA, es decir, funcional pero degradado.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking especifico para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Registro y reproduccion de experimentos: el adaptador sirve como artefacto reproducible para verificar el resultado negativo del estudio exp121 y comparar con exp101 y el base sin ajustar.
- Investigacion sobre interferencia de tareas en LoRA: permite replicar el hallazgo de que el entrenamiento solo en captioning degrada el captioning y de que la interferencia es asimetrica entre VQA y captioning.
- Estudio de enrutado por tarea: junto con Aspaklarya-121-vqa-step3000, permite reproducir la evaluacion de MEAN4 enrutado (76.31) y compararla con el gate pre-registrado de 77.34.
- Analisis de coste de especializacion: util para medir el coste en memoria de dos adaptadores (2x) frente a un unico adaptador conjunto y el coste de una decision de enrutado por peticion.
- Baseline de captioning en teledeteccion: sirve como referencia inferior frente al base sin ajustar (CAP_DM 82.79, CAP_RSICD 79.99) en la evaluacion con juez LLM.
- Docencia y divulgacion metodologica: ejemplo concreto de publicacion de resultados negativos y de evaluacion con juez LLM (gemma-4-31b-it-imiai) sobre 500 elementos de validacion por slice.
- No se recomienda su uso en produccion para captioning ni para VQA, segun el propio autor.

## Benchmarks y rendimiento

Evaluacion con 500 elementos de validacion retenidos por slice, semilla fija, generados en ambos harnesses y calificados por un juez LLM (gemma-4-31b-it-imiai) por acuerdo con la caption de referencia. El juez es solo texto: mide acuerdo con referencias, no verdad a nivel de pixel.

| Checkpoint / modelo | CAP_DM | CAP_RSICD | Suma |
|---|---|---|---|
| step750 (2 epocas) | 81.55 | 79.29 | 160.84 |
| step1125 (3 epocas) | 81.75 | 79.66 | 161.41 |
| step1500 (4 epocas, este adaptador) | 81.51 | 80.04 | 161.55 |
| exp101-step4500 (adaptador conjunto) | 82.53 | 79.64 | 162.17 |
| exp020 (base sin ajustar) | 82.79 | 79.99 | 162.78 |

Resultados enrutados y de interferencia:

| Metrica | Valor |
|---|---|
| MEAN4 enrutado (este adaptador + 121-vqa) | 76.31 |
| Gate de victoria pre-registrado | 77.34 |
| MEAN4 de exp101 (adaptador unico) | 76.72 |
| VQA_DM de este adaptador (off-task) | 63.52 (degradado) |
| CAP_RSICD de 121-vqa (off-task) | 34.11 (destruido) |
| VQA_DM de 121-vqa (tarea propia) | 74.22 |
| CAP_RSICD de este adaptador (tarea propia) | 80.04 |

El autor senala que CAP_DM queda aproximadamente 5 sigma por debajo del base (sigma por slice 0.25).

## Requisitos de hardware

- El adaptador LoRA ocupa 0.2 GB; requiere cargar ademas el modelo base Qwen3-VL-8B-Instruct completo.
- Entrenamiento realizado en 1x A100 40GB durante 206 minutos.
- VRAM de inferencia: no disponible de forma explicita; depende del base Qwen3-VL-8B-Instruct y del tipo de cuantizacion empleado, no especificado.
- GPU recomendadas: no disponibles en la informacion proporcionada; el unico dato es la A100 40GB usada para entrenar.
- Opciones de despliegue: carga mediante `peft.PeftModel` y `transformers` (`AutoModelForImageTextToText`, `AutoProcessor`), segun el ejemplo de la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento captioning | Licencia |
|---|---|---|---|---|---|
| Aspaklarya-122-cap-step1500 (este) | LoRA sobre Qwen3-VL-8B | adaptador r=16 | no disponible | CAP_DM 81.51 / CAP_RSICD 80.04 | no disponible |
| Aspaklarya-101-step4500 | LoRA conjunto sobre Qwen3-VL-8B | adaptador | no disponible | CAP_DM 82.53 / CAP_RSICD 79.64 | no disponible |
| exp020 (Qwen3-VL-8B-Instruct sin ajustar) | Modelo base | 8B (aprox.) | no disponible | CAP_DM 82.79 / CAP_RSICD 79.99 | no disponible |
| Aspaklarya-121-vqa-step3000 | LoRA de VQA sobre Qwen3-VL-8B | adaptador | no disponible | CAP_RSICD 34.11 (destruido) | no disponible |

En la metrica MEAN4 enrutado, la pareja de especialistas (122 + 121) obtiene 76.31, por debajo del adaptador unico exp101 (76.72) y del gate de 77.34.

## Limitaciones y advertencias

- Modelo publicado como resultado negativo: el autor indica explicitamente que no es un modelo recomendado y que el base sin ajustar supera a este adaptador en captioning.
- Para uso conjunto, la recomendacion del autor es Aspaklarya-101-step4500, no este adaptador.
- El entrenamiento solo en captioning degrada VQA (VQA_DM 63.52) y reduce el rendimiento de captioning respecto al base y al adaptador conjunto.
- La evaluacion usa un juez LLM solo texto (gemma-4-31b-it-imiai) que mide acuerdo con referencias, no verdad a nivel de pixel; no sustituye a una evaluacion humana o metrica visual.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible en la informacion proporcionada.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: inherente a los modelos generativos multimodales; no cuantificado en la informacion proporcionada.
- El coste de despliegue de dos especialistas es 2x en memoria de adaptadores mas una decision de enrutado por peticion, sin mejora de rendimiento en este caso.

## Enlaces

- Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-122-cap-step1500
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Adaptador pareja (VQA): https://huggingface.co/ExperimentField/Aspaklarya-121-vqa-step3000
- Adaptador conjunto recomendado: https://huggingface.co/ExperimentField/Aspaklarya-101-step4500
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
