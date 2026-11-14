# Hooshaai/bert-comp-compot-compressor-sst2

## Resumen

`Hooshaai/bert-comp-compot-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2. Lo publica el autor Hooshaai dentro del ecosistema NeuralOps, una librería de compresión de modelos que agrupa distintos motores bajo el nombre de "compressor zoo". El modelo aplica el compresor `compot_compressor` (familia `low_rank`) con rango Pareto `k=64`, reduciendo el número de parámetros de 109.483.778 a 41.064.194, es decir, un 62,5 % menos y una ratio de compresión física de 2,67x.

El interés técnico del checkpoint no reside en su calidad final, sino en que documenta un experimento de compresión agresiva con "curación" mediante LoRA. El modelo original alcanza un 91,63 % de accuracy en SST-2; tras la compresión y el healing con LoRA de rango 8, el resultado cae hasta el 76,15 %. El autor publica además la evaluación multi-rango (k=256, 128, 64, 32) con métricas de zero-shot y post-healing, lo que convierte el repositorio en un banco de pruebas reproducible para estudiar el compromiso entre tamaño y precisión en BERT.

Se trata de un modelo de clasificación de texto en inglés, con arquitectura transformer encoder de 12 capas y dimensión oculta 768, distribuido bajo licencia MIT. Su relevancia es fundamentalmente metodológica: sirve como referencia para pipelines de compresión低-rank y para evaluar si el healing con LoRA compensa la pérdida de rendimiento en tareas downstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, D=768 |
| Parámetros totales | 41.064.194 (comprimido); base original 109.483.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, típicamente 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizer |

## Arquitectura y entrenamiento

La arquitectura de partida es `google-bert/bert-base-uncased`, un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, afinado previamente sobre GLUE SST-2. Sobre ese checkpoint se aplica el motor `compot_compressor` de NeuralOps, de la familia `low_rank`, que factoriza los pesos en componentes de bajo rango. El rango seleccionado es k=64, lo que deja el modelo en 41.064.194 parámetros y una ratio de compresión física de 2,666x.

El proceso de compresión incluye una fase de "healing" con LoRA: cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos y la reducción supera 1,10x, NeuralOps aplica adaptadores LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos. En el caso de k=64, el modelo comprimido sin healing cae al 50,92 % (nivel de azar en una tarea binaria), y el healing lo recupera hasta el 76,15 %. La evaluación multi-rango se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) usando el split de validación de GLUE SST-2 con 872 muestras. No se detalla la composición del dataset de entrenamiento más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplica a una tarea de clasificación de este tipo).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con dos etiquetas de salida.
- Generación de logits por secuencia para integración en pipelines de `transformers` y `text-classification`.
- Inferencia sobre texto corto y medio en inglés, heredando el tokenizer `bert-base-uncased`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés (idioma declarado: `en`).
- Compatible con el ecosistema NeuralOps mediante `load_surgeried_model` y `compress_model`.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas cortas en inglés con un coste computacional muy reducido (41 M de parámetros), adecuado para procesar lotes grandes en CPU o GPU de gama baja.
- Moderación de comentarios en foros angloparlantes: la ventana de contexto heredada de BERT (hasta 512 tokens) permite analizar comentarios completos y etiquetar su polaridad antes de publicarlos.
- Clasificación de tickets de soporte: se puede usar como primer filtro para separar feedback positivo de negativo y priorizar la cola de atención al cliente.
- Investigación en compresión de modelos: el checkpoint sirve como referencia reproducible para comparar técnicas low-rank y estrategias de healing con LoRA frente al baseline de 91,63 %.
- Docencia y experimentación: su tamaño (78,4 MB de pesos) y licencia MIT facilitan su uso en entornos académicos y en cuadernos de demostración sin infraestructura dedicada.
- Pipeline de etiquetado débil (weak supervision): al ser extremadamente ligero, puede desplegarse como etiquetador auxiliar para pre-anotar grandes volúmenes de texto antes de una revisión humana.
- Benchmark de serving: útil para medir latencia y throughput de motores de inferencia en modelos pequeños y comparar con alternativas destiladas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Modelo / configuración | Ratio | Params comprimidos | Zero-shot Acc | Healed Acc | Delta vs teacher (91,63 %) |
|---|---:|---:|---:|---:|---:|
| Teacher (bert-base-uncased SST-2) | 1,00x | 109.483.778 | — | 91,63 % | 0,00 % |
| k=256 | 1,21x | 90.609.410 | 83,14 % | 61,58 % (LoRA) | -30,05 % |
| k=128 | 1,90x | 57.579.266 | 53,90 % | 50,92 % (LoRA) | -40,71 % |
| k=64 (checkpoint publicado) | 2,67x | 41.064.194 | 50,92 % | 76,15 % (LoRA) | -15,48 % |
| k=32 | 2,83x | 38.704.898 | 50,92 % | 71,67 % (LoRA) | -19,96 % |

Evaluación realizada sobre GLUE SST-2 validation split (872 muestras) en una RTX 3090. El resultado principal del checkpoint publicado es 76,15 % de accuracy.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 165 MB para los pesos (41 M de parámetros × 4 bytes), más overhead de activaciones y tokenizer.
- VRAM estimada en FP16: aproximadamente 82 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para evaluación a escala: RTX 3090 (la usada por el autor), A100 o H100 para procesar grandes volúmenes con alta concurrencia.
- Opciones de despliegue: `transformers` + PyTorch (vía `compress_model` y `load_state_dict`), `load_surgeried_model` de NeuralOps. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 Acc | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `Hooshaai/bert-comp-compot-compressor-sst2` (k=64) | 41.064.194 | no disponible (heredado BERT, ~512) | 76,15 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (teacher SST-2) | 109.483.778 | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 | no disponible en la información | Apache 2.0 | Hugging Face |
| `prajjwal1/bert-tiny` (referencia de tamaño) | ~4,4 M | 512 | no disponible en la información | Apache 2.0 | Hugging Face |

La comparación con destilados como DistilBERT es pertinente porque ambos buscan reducir el coste de BERT-base, pero el checkpoint de NeuralOps es una compresión low-rank con healing, no una destilación, y su accuracy (76,15 %) queda por debajo del teacher en 15,48 puntos.

## Limitaciones y advertencias

- Pérdida de accuracy significativa: 76,15 % frente al 91,63 % del teacher, un delta de -15,48 puntos en SST-2.
- El resultado zero-shot del checkpoint (50,92 %) equivale al azar en una tarea binaria; el rendimiento útil depende del healing con LoRA incluido en los pesos.
- La evaluación se realizó sobre solo 872 muestras de validación, lo que limita la robustez estadística de las cifras.
- El modelo solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí puede producir etiquetas erróneas con alta confianza en dominios distintos a SST-2.
- Sesgos heredados de `bert-base-uncased` y del corpus de SST-2 (reseñas de películas), que pueden no transferir a otros dominios.
- No hay información sobre cuantización ni sobre formatos GGUF/ONNX, lo que limita el despliegue en algunos motores de inferencia.
- La licencia MIT del repositorio convive con la licencia Apache 2.0 del modelo base; conviene revisar ambas para uso comercial.
- El código de ejemplo de la model card referencia `tahamajs/...` en lugar de `Hooshaai/...`, lo que puede provocar errores al copiar y pegar; hay que ajustar el `repo_id`.
- La fecha de creación del repositorio (2026-11-10) es posterior a la fecha actual, lo que sugiere un posible error de metadatos o una programación futura; conviene verificar la integridad del checkpoint antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hooshaai/bert-comp-compot-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Librería NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/compot_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
