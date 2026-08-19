# shikunpunk/Qwen1.5-7B-Poem-SFT

## Resumen

`shikunpunk/Qwen1.5-7B-Poem-SFT` es un adaptador LoRA (entrenado con QLoRA 4-bit) sobre el modelo base `ricardozhy/Qwen1.5-7B-poem`, un modelo de lenguaje especializado en poesía china derivado de Qwen1.5-7B. El adaptador se ha afinado mediante supervisión fina (SFT) con 598 pares de imitación poética de cuatro autores clásicos y contemporáneos (Li Bai, Haizi, Haizi-CN y GuCheng), con el objetivo de corregir defectos del modelo base, como la aparición de texto en inglés o restos de JSON en las salidas.

El resultado es un adaptador ligero (0.3 GB) que se carga directamente con la librería `peft` sobre el modelo base cuantizado, sin necesidad de fusionar pesos. Está orientado exclusivamente a la generación de poesía china por imitación de estilo, y su principal aporte es la eliminación de artefactos no deseados en las respuestas, manteniendo la calidad creativa del modelo original.

Es relevante para desarrolladores e investigadores que trabajan en generación de texto creativo en chino, especialmente en tareas de imitación estilística, y que necesitan una solución eficiente en memoria (4-bit) sin sacrificar la fidelidad del estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen1.5-7B) con adaptador LoRA |
| Parametros totales | Modelo base: 7B; adaptador LoRA: no especificado (rank=32) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada (el modelo base Qwen1.5-7B soporta hasta 32768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes) con compute_dtype bfloat16; tambien puede usarse sin cuantizar |
| Idiomas soportados | Chino (principal), aunque el modelo base Qwen1.5-7B soporta multiples idiomas |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 (alpha 64, dropout 0.05) aplicado a todas las capas del modelo base `ricardozhy/Qwen1.5-7B-poem`, que a su vez es un fine-tuning de Qwen1.5-7B orientado a poesía china. El adaptador se entrenó con QLoRA en 4-bit NF4 y bfloat16 como tipo de cómputo, sobre 598 muestras SFT de imitación poética (4 autores: LiBai, Haizi, Haizi-CN y GuCheng). El entrenamiento duró 1 época, 75 pasos, con batch size 1 y acumulación de gradientes de 8, learning rate 1.5e-4, programación coseno con warmup de 0.1. La pérdida de evaluación final fue de 2.941.

La innovación técnica principal no reside en la arquitectura (que es la estándar de Qwen1.5), sino en el enfoque de entrenamiento: un adaptador QLoRA muy ligero que corrige artefactos específicos del modelo base (texto en inglés, colas JSON) mediante un conjunto de datos curado y de pequeño tamaño. Además, se recomienda un post-procesamiento adicional ("recorte de marcadores anómalos") para eliminar el eco de continuación, lo que indica que la solución combina el adaptador con una heurística de limpieza de salida.

## Capacidades

- Generación de poesía china por imitación de estilo de autores concretos (Li Bai, Haizi, GuCheng).
- Eliminación de texto en inglés en las salidas (el modelo base producía inglés en el 100% de las 24 muestras de prueba; el adaptador lo reduce a 0%).
- Eliminación de restos de JSON en las respuestas (79% de incidencia en el base, 0% con el adaptador).
- No presenta "eco de contaminación" (repetición de la entrada) en las pruebas realizadas.
- Capacidad conversacional básica (pipeline text-generation), pero enfocada a la generación de poemas, no a diálogo general.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Generación de poesía china clásica y contemporánea: el modelo puede producir poemas en el estilo de Li Bai o Haizi a partir de una temática o una frase inicial, siendo útil para creadores y estudiosos de la literatura.
- Asistencia creativa para escritores: un poeta o aficionado puede usarlo para explorar variaciones estilísticas o superar bloqueos creativos, generando borradores que luego se editan.
- Educación literaria: profesores de literatura china pueden emplearlo para mostrar ejemplos de imitación estilística y analizar diferencias entre autores.
- Normalización de salidas en pipelines de generación: al eliminar artefactos como inglés y JSON, es adecuado como componente de un sistema de generación de texto en chino que requiera salidas limpias.
- Fine-tuning posterior: al ser un adaptador pequeño, puede servir como punto de partida para experimentos de adaptación a otros estilos poéticos con pocos recursos computacionales.
- Evaluación de calidad de generación: el repositorio asociado (ChineseHardJudgePoem) incluye herramientas de evaluación y recorte de salidas, lo que permite integrarlo en flujos de prueba automática de generación poética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada es una comparacion de 24 muestras entre el modelo base y el adaptador SFT:

| Metrica | Modelo base | Adaptador SFT + recorte inteligente |
|---|---|---|
| Salidas con texto en ingles | 24/24 (100%) | 0/24 |
| Salidas con cola JSON | 19/24 (79%) | 0/24 |
| Eco de contaminacion | 0 | 0 |

La perdida de evaluacion (eval_loss) del adaptador fue de 2.941 tras 75 pasos de entrenamiento.

## Requisitos de hardware

- VRAM estimada: con cuantizacion 4-bit del modelo base (7B) y el adaptador LoRA, se requieren aproximadamente 4-5 GB de VRAM para inferencia en precision bfloat16. El adaptador en si ocupa 0.3 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, RTX 3090, RTX 4090. Tambien puede ejecutarse en GPUs de datacenter (A10, A100) si se necesita mayor throughput.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer de gama media y alta.
- Opciones de despliegue: la via principal es mediante `transformers` + `peft` con `bitsandbytes` para cuantizacion 4-bit. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la documentacion, aunque podria adaptarse si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no se proporcionan datos. En una RTX 4090, se espera una generacion de decenas de tokens por segundo para un modelo de 7B cuantizado a 4-bit, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores o modelos de poesia china comparables en la documentacion proporcionada. Como referencia, se puede comparar con el propio modelo base `ricardozhy/Qwen1.5-7B-poem` y con el Qwen1.5-7B original:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen1.5-7B | 7B | 32768 tokens | Generalista | Apache 2.0 (sujeto a terminos de Qwen) | HuggingFace |
| ricardozhy/Qwen1.5-7B-poem | 7B | No especificado | Poesia china (fine-tuning) | No disponible | HuggingFace |
| shikunpunk/Qwen1.5-7B-Poem-SFT (adaptador) | 7B base + LoRA | No especificado | Imitacion poetica china (SFT) | No disponible | HuggingFace |

El adaptador se diferencia del base por eliminar artefactos de generacion (ingles, JSON) y por ser mucho mas ligero (0.3 GB frente a ~15 GB del modelo completo), lo que facilita su despliegue.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador se entrena con solo 598 muestras de 4 autores, por lo que puede tener un sesgo estilistico hacia esos autores y no generalizar bien a otros estilos poeticos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido inventado o incoherente, especialmente con temas fuera de su dominio de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto del adaptador; se asume la del modelo base (32768 tokens), pero no esta confirmado.
- Limitaciones de idioma: el adaptador esta disenado exclusivamente para chino; puede producir resultados pobres en otros idiomas.
- Restricciones de licencia: la licencia no esta disponible, lo que impide conocer si es apto para uso comercial. Se debe contactar al autor antes de usarlo en produccion.
- Caveat de produccion: la model card recomienda un post-procesamiento adicional (recorte de marcadores anomalos) para evitar el eco de continuacion, lo que anade un paso extra en el pipeline de inferencia.
- El modelo base `ricardozhy/Qwen1.5-7B-poem` tampoco tiene licencia especificada, lo que complica la trazabilidad legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shikunpunk/Qwen1.5-7B-Poem-SFT
- Modelo base en HuggingFace: https://huggingface.co/ricardozhy/Qwen1.5-7B-poem
- Repositorio GitHub mencionado (ChineseHardJudgePoem, contiene el script de recorte de salidas): no se proporciona URL directa en la documentacion; se puede buscar por el nombre en GitHub.
