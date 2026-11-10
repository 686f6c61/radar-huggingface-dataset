# ExperimentField/Aspaklarya-110-step3540

## Resumen

Aspaklarya-110-step3540 es un adaptador LoRA para el modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por la organizacion ExperimentField dentro de un programa sistematico de ablacion denominado Aspaklarya. El adaptador especializa el modelo base en tareas de teledeteccion (remote sensing): respuesta visual a preguntas (VQA) e image captioning sobre imagenes de satelite. Forma parte de la ronda 1XX del programa, que se distingue de la ronda 0XX por generar respuestas verbosas con razonamiento fundamentado en lugar de respuestas de una sola palabra.

El checkpoint corresponde al paso 3540 del experimento `exp110s2024`, una replicacion de semilla (semilla 2024) de la receta de 36K items. El adaptador tiene rango r=16, alpha=16 y entrena tambien la torre de vision del modelo base. El repositorio ocupa 0,2 GB, lo que refleja que solo contiene los pesos del adaptador y no el modelo completo.

Su relevancia es metodologica ademas de practica: el autor publica la medicion del ruido de entrenamiento del programa, advierte que las diferencias de MEAN4 por debajo de ~0,5 no son interpretables y documenta explicitamente las limitaciones del juez automatico. Esto lo convierte en un ejemplo poco habitual de transparencia en la evaluacion de adaptadores especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; base de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens de secuencia durante entrenamiento; contexto del base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer multimodal con torre de vision. La configuracion LoRA usa r=16, alpha=16, dropout=0.0 y entrena la torre de vision ademas de las capas del adaptador. La perdida usa ponderacion por token con w_caption=1.0 y w_vqa=1.0. El optimizador es AdamW con lr 0.0002, schedule lineal, warmup 0.03, weight decay 0.001 y clip 0.3. El batch efectivo es de 32 (4 x 8 de acumulacion de gradientes) y se entrenaron 4,0 epocas con semilla 2024, longitud de secuencia 2048 y lado maximo de imagen 1024.

El corpus de entrenamiento consta de 35.979 items sobre 11.994 imagenes: 11.993 pares de caption y 23.986 pares de VQA, es decir, 2 QA + 1 caption por imagen. La columna VQA utilizada es `VQA_1126` y el split es `train,other`. No se documenta en la informacion disponible el uso de RLHF o DPO; el entrenamiento es supervisado sobre pares imagen-texto.

## Capacidades

- Generacion de texto descriptivo a partir de imagenes (image captioning) en dominio de teledeteccion.
- Respuesta visual a preguntas (VQA) con respuestas verbosas de varias frases y razonamiento fundamentado, a diferencia de la ronda 0XX que respondia con una sola palabra.
- Razonamiento multimodal basico heredado del modelo base Qwen3-VL-8B-Instruct.
- Capacidades generales del modelo base (codigo, matematicas, tool calling) no verificadas en este adaptador; el programa solo evalua tareas de teledeteccion.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Modo thinking, audio o vision especializada adicional: no disponible.

## Casos de uso

- Descripcion automatica de imagenes satelitales en catalogos de archivo: el adaptador genera captions detallados (hasta 320 tokens nuevos) utiles para indexar y buscar imagenes por contenido semantico.
- Analisis de coberturas del suelo en pipelines de teledeteccion: dado un recorte de satelite, el modelo responde preguntas sobre tipos de cubierta, cambios o elementos visibles con explicaciones de varias frases.
- Asistencia a analistas GIS: el modelo puede responder preguntas en lenguaje natural sobre una imagen y justificar la respuesta, reduciendo el tiempo de inspeccion manual.
- Generacion de informes preliminares de observacion terrestre: a partir de una imagen y una consulta, produce un parrafo descriptivo que sirve como borrador para revision humana.
- Control de calidad de datasets de teledeteccion: comparar captions generados con anotaciones existentes para detectar discrepancias o imagenes mal etiquetadas.
- Investigacion en evaluacion de adaptadores: el repositorio y la documentacion del ruido de entrenamiento permiten reproducir y auditar metodologias de evaluacion con LLM-as-judge en dominios especializados.

## Benchmarks y rendimiento

Evaluacion con LLM-as-judge (`gemma-4-31b-it-imiai`), decodificacion greedy, temperatura 0, escala 0-100, sobre una muestra fija (semilla 1105).

| Slice | Prompt set | Tokens nuevos | n | Puntuacion |
|---|---|---|---|---|
| VQA DM | `VQA_1126` (verboso) | 160 | 500 | 73,68 |
| VQA RSICD | legacy terse | 48 | 500 | 71,01 |
| Caption DM | caption-query bank | 320 | 491 | 80,99 |
| Caption RSICD | caption-query bank | 320 | 500 | 79,32 |
| MEAN4 | | | 1.991 | 76,25 |

Puesto en MEAN4: 8 de 70 checkpoints evaluados del programa.

Puntos de referencia en la misma muestra (MEAN4): Aspaklarya-101-step4500 76,72; Aspaklarya-106-soup 76,36; Aspaklarya-020-step4500 74,90; DeanQwen3-8B 64,84; Qwen3-VL-8B-Instruct base 61,34.

Suelo de ruido medido por el programa (misma receta, tres semillas): MEAN4 de control 75,52 (sd 0,19, n=3); sigma VQA DM 0,88; sigma VQA RSICD 0,74; sigma Caption DM 0,25; sigma Caption RSICD 0,52; reproducibilidad del juez ~0,01; dispersion en reejecucion con la misma semilla 0,30.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser un adaptador sobre un modelo de 8B, requiere cargar el modelo base completo; en fp16 el base ronda los 16 GB, pero no se confirma en la documentacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card muestra uso con `transformers` (`AutoModelForImageTextToText`) y `peft` (`PeftModel`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MEAN4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aspaklarya-110-step3540 | LoRA sobre 8B | 2048 (entrenamiento) | 76,25 | no disponible | Hugging Face |
| Aspaklarya-101-step4500 | LoRA sobre 8B | no disponible | 76,72 | no disponible | Hugging Face (programa) |
| Aspaklarya-106-soup | LoRA sobre 8B | no disponible | 76,36 | no disponible | Hugging Face (programa) |
| Aspaklarya-020-step4500 | LoRA sobre 8B | no disponible | 74,90 | no disponible | Hugging Face (programa) |
| DeanQwen3-8B | 8B | no disponible | 64,84 | no disponible | no disponible |
| Qwen3-VL-8B-Instruct | 8B | no disponible | 61,34 | no disponible | Hugging Face |

## Limitaciones y advertencias

- El juez de evaluacion es solo texto: compara la respuesta con una referencia y nunca ve la imagen, por lo que detecta especificidad no respaldada pero no falsedades verificadas. La correccion a nivel de pixel requiere revision humana.
- El benchmark legacy terse no es un objetivo justo para la ronda 1XX: sus referencias tienen ~4 caracteres y su rubrica limita a 89/100 una respuesta correcta pero rellenada, de modo que un modelo verboso no puede alcanzar la banda superior.
- Las diferencias de MEAN4 por debajo de ~0,5 no son interpretables a partir de un solo par de ejecuciones; las diferencias en VQA de una sola slice por debajo de ~1,8 tampoco.
- Reejecutar con la misma semilla mueve la puntuacion ~0,30 por kernels CUDA no deterministas; la replicacion exacta no es alcanzable.
- Las puntuaciones son en dominio (teledeteccion); no miden VQA de proposito general.
- Licencia no especificada: no se puede confirmar el uso comercial.
- Riesgo de alucinacion: el modelo puede generar detalles especificos no respaldados por la imagen, dado que se entrena para respuestas verbosas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de contexto o idioma: no disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-110-step3540
- Organizacion ExperimentField (contexto del programa, hiperparametros, ruido y resultados retractados): https://huggingface.co/ExperimentField
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
