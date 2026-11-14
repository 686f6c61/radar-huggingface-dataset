# Hooshaai/bert-comp-cur-compressor-sst2

## Resumen

bert-comp-cur-compressor-sst2 es un checkpoint de BERT-Base (google-bert/bert-base-uncased) comprimido físicamente mediante la técnica CURCompressor de la librería NeuralOps y posteriormente "sanado" con LoRA. Lo publica el usuario Hooshaai como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un catálogo de modelos comprimidos con distintos operadores de compresión. El modelo está afinado para clasificación de sentimiento binaria sobre GLUE SST-2.

El interés de este checkpoint no reside en su rendimiento absoluto, sino en su valor como demostración de un pipeline de compresión de modelos: reduce el número de parámetros de 109,5 M a 46,96 M (un 57,1 % menos, ratio físico de 2,33x) sustituyendo capas Linear y Conv1D por descomposiciones CUR con selección de filas y columnas por leverage score o energy sampling, y aplicando después un ajuste LoRA de recuperación.

El resultado es un modelo que alcanza un 72,48 % de accuracy en la validación de SST-2, frente al 91,63 % del profesor original, es decir, una pérdida de 19,15 puntos. Es, por tanto, un artefacto de investigación sobre compresión más que un modelo listo para producción, con licencia MIT y pesos en formato PyTorch (pytorch_model.bin) que requieren la librería NeuralOps para reconstruir la topología comprimida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con capas Linear/Conv1D sustituidas por descomposición CUR |
| Parametros totales | 46.962.434 (comprimido); base original 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT-Base estandar: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (state dict serializado); tokenizer en vocab.txt, tokenizer.json, tokenizer_config.json |

## Arquitectura y entrenamiento

El modelo parte de BERT-Base uncased: 12 capas, dimensión oculta D=768 y 109.483.778 parámetros. Sobre esa base se aplica CURCompressor, un operador de compresión de bajo rango que reemplaza las capas Linear y Conv1D por una descomposición CUR, seleccionando columnas y filas mediante leverage score sampling o energy sampling. El checkpoint empaquetado corresponde al rango k=128, que produce 46.962.434 parámetros y un ratio de compresión físico de 2,331x. Los factores de bajo rango y los adaptadores LoRA quedan integrados en el state dict serializado.

El ajuste se realiza en dos fases. Primero se evalúa el modelo comprimido en zero-shot sobre la partición de validación de GLUE SST-2 (872 muestras), obteniendo un 50,92 % de accuracy. Como la caída supera el umbral de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos, que eleva la accuracy hasta el 72,48 %. Toda la evaluación se ejecutó físicamente en una NVIDIA GeForce RTX 3090 de 24 GB. El autor documenta además una evaluación multi-rango (k=256, 128, 64 y 32) con sus correspondientes ratios y precisiones.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, especializada en el dominio de SST-2 (crítica cinematográfica).
- Generación de logits de clasificación con dos etiquetas (0=Negative, 1=Positive).
- No soporta tool calling ni function calling: es un modelo encoder de clasificación, no un modelo generativo con instrucciones.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (vocabulario bert-base-uncased).
- No dispone de modo thinking, visión ni audio.
- Sirve como referencia reproducible para experimentos de compresión de modelos y comparación de operadores (CUR frente a otras técnicas del zoo de NeuralOps).

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de comparación reproducible para medir el impacto de CURCompressor a distintos rangos (k=256, 128, 64, 32) sobre una tarea estándar como SST-2, con telemetría completa en compression_summary.json.
- Análisis de sentimiento en textos cortos en inglés: clasificación de reseñas, tuits o comentarios con un modelo de 47 M de parámetros, adecuado cuando el presupuesto de cómputo es muy ajustado y se acepta una precisión moderada.
- Prototipado rápido en entornos con poca VRAM: al ocupar menos de 100 MB de pesos, puede cargarse en GPUs de gama baja o incluso en CPU para pruebas de pipeline.
- Docencia y divulgación: ejemplo práctico de descomposición CUR, leverage score sampling y LoRA healing aplicados a un transformer real, con código de reconstrucción incluido en la model card.
- Filtrado previo en pipelines de datos: como clasificador ligero para descartar o etiquetar grandes volúmenes de texto antes de pasarlos a un modelo mayor.
- Benchmarking de infraestructura de compresión: validación de la API load_surgeried_model de NeuralOps Hub y del registro COMPRESSOR_REGISTRY en un caso de extremo a extremo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Modelo / configuracion | Ratio fisico | Parametros (reduccion) | Zero-shot acc | Healed acc | Paridad vs profesor (91,63 %) |
|---|---:|---:|---:|---:|---:|
| Profesor (bert-base-uncased SST-2) | 1,00x | 109.483.778 | 91,63 % | - | 0,00 % |
| k=256 | 1,53x | 71.735.042 (-34,5 %) | 56,54 % | 49,08 % (LoRA) | -42,55 % |
| k=128 (checkpoint publicado) | 2,33x | 46.962.434 (-57,1 %) | 50,92 % | 72,48 % (LoRA) | -19,15 % |
| k=64 | 3,09x | 35.460.866 (-67,6 %) | 49,31 % | 49,08 % (LoRA) | -42,55 % |
| k=32 | 3,66x | 29.931.266 (-72,7 %) | 49,08 % | 50,92 % (LoRA) | -40,71 % |

Evaluación sobre GLUE SST-2 validation split (872 muestras), en NVIDIA GeForce RTX 3090 (24 GB).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en fp32 (89,7 MB de pesos más activaciones y tokenizer); holgadamente por debajo de 2 GB en cualquier configuración práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor validó la evaluación en una RTX 3090 de 24 GB, pero el modelo es sobredimensionado para ese hardware.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: requiere la librería NeuralOps (neuralops.core.compression_pipeline.compress_model o neuralops.hub.load_surgeried_model) para reconstruir la topología comprimida antes de cargar el state dict con strict=False. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversión previa, ya que no se distribuye en GGUF ni en formato transformers estándar.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un BERT-Base comprimido a la mitad de parámetros, se espera una latencia inferior a la del profesor, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 acc | Licencia | Formato |
|---|---:|---|---:|---|---|
| bert-comp-cur-compressor-sst2 (k=128) | 46,96 M | no disponible (BERT estandar 512) | 72,48 % | MIT | pytorch_model.bin + NeuralOps |
| google-bert/bert-base-uncased (profesor) | 109,48 M | 512 | 91,63 % (segun el autor) | Apache 2.0 | safetensors / PyTorch |
| DistilBERT-base-uncased | 66 M | 512 | no disponible en la informacion | Apache 2.0 | safetensors / PyTorch |
| Otros checkpoints del zoo NeuralOps (k=64, k=32) | 35,46 M / 29,93 M | no disponible | 49,08 % / 50,92 % | MIT | pytorch_model.bin + NeuralOps |

La comparación con DistilBERT es la más directa por tamaño, pero no se dispone de su accuracy SST-2 en la información proporcionada; conviene consultar la model card oficial para una comparación rigurosa.

## Limitaciones y advertencias

- Pérdida de precisión severa: 72,48 % frente al 91,63 % del profesor, una caída de 19,15 puntos. No es apto para producción sin una validación adicional en el dominio objetivo.
- El comportamiento del "healing" LoRA es inestable entre rangos: k=256 y k=64 empeoran tras el ajuste (de 56,54 % a 49,08 % y de 49,31 % a 49,08 %), lo que sugiere que el procedimiento no está robustamente calibrado.
- Sesgos conocidos: hereda los sesgos de bert-base-uncased y de SST-2 (crítica cinematográfica en inglés), con posible degradación adicional por la compresión.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas sistemáticas en dominios alejados de SST-2.
- Limitación de idioma: solo inglés; el tokenizador uncased no cubre adecuadamente otras lenguas.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base google-bert/bert-base-uncased está bajo Apache 2.0; conviene revisar ambas.
- Dependencia de la librería NeuralOps: sin ella no se puede reconstruir la topología comprimida ni cargar el state dict correctamente. El código de la model card contiene erratas (por ejemplo, el repo_id "tahamajs/..." frente al ID real "Hooshaai/..."), lo que puede dificultar la reproducción.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (verified: false).
- El repositorio tiene 43 descargas y 0 likes en el momento de la consulta: es un artefacto de investigación con escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-cur-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Librería NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de CURCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/cur_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
