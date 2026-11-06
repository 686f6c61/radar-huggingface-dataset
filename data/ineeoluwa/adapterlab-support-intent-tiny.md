# Ineeoluwa/adapterlab-support-intent-tiny

## Resumen

AdapterLab Support Intent Tiny es un clasificador de texto minimalista entrenado por Inioluwa Atanda (usuario Ineeoluwa en Hugging Face) como experimento de referencia del proyecto [AdapterLab](https://github.com/Eunini/adapterlab), una plataforma de entrenamiento con validación de datasets, ejecución duradera de trabajos, evaluación, exportación e inferencia. El modelo es un fine-tuning con LoRA de BERT Tiny (`google/bert_uncased_L-2_H-128_A-2`, 2 capas, 128 de oculto, 2 cabezas de atención) para clasificar consultas de soporte en inglés en seis intenciones: `account`, `billing`, `cancellation`, `delivery`, `login` y `technical`.

Su relevancia no radica en el rendimiento —el propio autor lo califica de experimental y de rendimiento modesto— sino en la trazabilidad y reproducibilidad del pipeline: incluye `provenance.json` con revisiones fijadas, historial de entrenamiento, matriz de confusión, checksums y exportación ONNX verificada contra PyTorch (concordancia 30/30 en el conjunto de test, error de logit máximo inferior a 1e-5). Tras fusionar el adaptador LoRA, el clasificador resultante tiene 4.386.694 parámetros, con una longitud máxima de entrada de 96 tokens, lo que lo hace ideal para inferencia en CPU y navegador vía Transformers.js.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT Tiny (encoder transformer, 2 capas, H=128, A=2) + cabeza de clasificación de 6 etiquetas, fine-tuned con LoRA |
| Parametros totales | 4.386.694 (modelo fusionado, dato real de safetensors) |
| Parametros activos | 4.386.694 (no es MoE) |
| Longitud de contexto | 96 tokens (longitud máxima de entrenamiento e inferencia recomendada) |
| Tipos de cuantizacion | no disponible (solo float32; ONNX exportado en float32, opset 17) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (incluida la licencia del modelo base); dataset bajo CC0-1.0 |
| Formato de pesos | safetensors (modelo fusionado en la raíz) y ONNX (`onnx/model.onnx`); adaptador LoRA original bajo `adapter/` |

Datos adicionales del entrenamiento LoRA: rango 8, alpha 16, dropout 0,05, objetivos de atención query/value; 8.966 parámetros entrenables (0,204 % del total); wrapper PEFT con 4.395.660 parámetros.

## Arquitectura y entrenamiento

El modelo parte de `google/bert_uncased_L-2_H-128_A-2`, la variante más pequeña de la familia BERT de Google: un encoder transformer con solo 2 capas, dimensión oculta de 128 y 2 cabezas de atención, sin tokenizador case-sensitive (uncased). Sobre este encoder se aplicó PEFT con LoRA (rango 8, alpha 16, dropout 0,05) sobre las proyecciones query y value de la atención, y se entrenó además la cabeza de clasificación con 6 etiquetas. Tras el entrenamiento, el adaptador se fusionó en el modelo base, dando lugar al clasificador final de 4.386.694 parámetros.

El entrenamiento se realizó íntegramente en CPU (una ejecución con dos hilos de PyTorch sobre x86_64, 92 pasos, 164,736 segundos) con AdamW (learning rate 0,001, weight decay 0,01), tamaño de batch 8, cuatro épocas y semilla 42. Los datos provienen del dataset sintético `Ineeoluwa/support-intent-grouped`: 180 ejemplos de entrenamiento, 30 de validación y 30 de test (cinco por etiqueta en el holdout), con grupos de plantillas disjuntos entre splits. El mejor checkpoint se seleccionó por macro F1 de validación, usando la pérdida de validación como desempate. La fecha real de entrenamiento es el 27 de octubre de 2026, registrada en `run.json`.

## Capacidades

- Clasificación de texto en 6 intenciones de soporte en inglés: `account`, `billing`, `cancellation`, `delivery`, `login` y `technical`.
- Salida con puntuaciones softmax por etiqueta (soporta `top_k` en el pipeline de transformers); las puntuaciones no están calibradas.
- Inferencia en CPU sin GPU, gracias al tamaño minúsculo (~4,4 M de parámetros).
- Inferencia en navegador mediante Transformers.js y ONNX Runtime WASM (demo en Hugging Face Spaces).
- Carga como pipeline estándar de Hugging Face (`text-classification`) o como adaptador PEFT desde el subfolder `adapter/`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes: es exclusivamente un clasificador de intenciones.

## Casos de uso

- Aprendizaje de PEFT y LoRA: el repositorio conserva el adaptador original en `adapter/`, lo que permite estudiar cómo se entrena y fusiona un adaptador LoRA de rango 8 sobre un encoder diminuto.
- Reproducción de experimentos: el paquete incluye `provenance.json`, `run.json`, `evaluation.json`, matriz de confusión, historial de entrenamiento y checksums, ideal para verificar pipelines de entrenamiento reproducibles.
- Demostración de inferencia en navegador: el ONNX float32 con dimensiones dinámicas funciona con Transformers.js y ONNX Runtime WASM, útil como plantilla para clasificadores que corren 100 % en el cliente.
- Verificación de splits agrupados: el dataset usa grupos de plantillas disjuntos entre train/validación/test, un buen ejemplo para enseñar a evitar fugas de datos en clasificadores de intenciones.
- Prototipado rápido de enrutado de tickets: puede servir como esqueleto para enrutar consultas de soporte a departamentos, siempre reentrenando con datos reales, dado el rendimiento actual.
- Prueba de equivalencia de exportación: la comparación PyTorch-ONNX (30/30 predicciones idénticas, error de logit < 1e-5, incluyendo batches Unicode y truncados) es material de referencia para validar exportaciones de modelos.

No es adecuado para producción: el propio autor lo describe como un clasificador experimental con rendimiento modesto.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente), sobre el split de test del dataset sintético Support Intent Grouped (30 ejemplos, cinco por etiqueta):

| Metrica | Valor |
|---|---|
| Accuracy | 0,5667 |
| Macro F1 | 0,5199 |

Advertencias del propio autor: billing y cancellation tienen F1 de cero en test, por lo que la puntuación agregada no debe interpretarse como capacidad general de clasificación de soporte. El baseline en `evaluation.json` es el encoder preentrenado con cabeza de clasificación sin entrenar, no un competidor entrenado solo con cabeza. No se ha publicado comparación con otros clasificadores de intenciones.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; con ~4,4 M de parámetros en float32 el modelo ocupa aproximadamente 18 MB de memoria, ejecutable en cualquier CPU moderna.
- GPU recomendadas: ninguna necesaria; si se desea acelerar, cualquier GPU de consumo (incluso integrada) es más que suficiente.
- Consumer GPU: cabe con holgura en cualquier GPU, desde integradas hasta una RTX 4090; el uso de GPU es innecesario para este modelo.
- Despliegue: pipeline de `transformers` en CPU (`device=-1`); ONNX Runtime (incluido WASM en navegador con Transformers.js); compatible con text-embeddings-inference según los tags del repo. No hay evidencia de soporte directo en vLLM, TGI u Ollama para este clasificador.
- Latencia: no se han publicado mediciones de latencia de inferencia; el tiempo de entrenamiento (164,7 s en CPU con 2 hilos) no es un benchmark de latencia según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia |
|---|---|---|---|---|
| AdapterLab Support Intent Tiny | 4,39 M (fusionado) | Clasificacion de 6 intenciones de soporte (en) | 96 tokens | Apache-2.0 |
| google/bert_uncased_L-2_H-128_A-2 (base) | ~4,4 M | Encoder preentrenado, sin cabeza de clasificacion entrenada | 512 tokens (estandar BERT) | Apache-2.0 |
| DistilBERT base uncased | ~66 M | Clasificacion de texto general (fine-tunable) | 512 tokens | Apache-2.0 |
| BERT base uncased | ~110 M | Clasificacion de texto general (fine-tunable) | 512 tokens | Apache-2.0 |

Comparado con DistilBERT o BERT base, este modelo es entre 15 y 25 veces más pequeño y se entrena en segundos en CPU, pero su accuracy de 0,5667 en un holdout sintético minúsculo no es comparable con clasificadores fine-tuned sobre datasets reales como SST-2 o MASSIVE. Su valor diferencial es la reproducibilidad documentada, no el rendimiento.

## Limitaciones y advertencias

- Rendimiento bajo: accuracy de 0,5667 y macro F1 de 0,5199; las clases `billing` y `cancellation` tienen F1 de cero en el test, por lo que el modelo falla sistemáticamente en esas intenciones.
- Datos sintéticos y con plantillas: el dataset son ejemplos templated en inglés, no tickets reales de clientes; la representatividad está limitada por la elección de plantillas y el holdout minúsculo (30 ejemplos).
- Solo inglés: sin evaluación multilingüe; el autor indica explícitamente que no hay evaluación en yoruba ni en otros idiomas.
- Sin clase de rechazo ni calibración: las puntuaciones softmax no deben tratarse como probabilidades calibradas; el modelo no puede abstenerse ante consultas fuera de las seis intenciones.
- Sin evaluaciones de robustez, equidad ni uso en el mundo real; el autor recomienda evitar usos sensibles o de consecuencias importantes.
- Contexto muy corto: 96 tokens máximo, insuficiente para tickets largos de soporte.
- Carga del adaptador: para usar el subfolder `adapter/` hay que crear la base con `num_labels=6` y los mapeos `id2label`/`label2id` de `config.json`; crear una base genérica de dos etiquetas no cargará correctamente la cabeza de seis etiquetas.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo no está preparado para producción según su propio autor.

## Enlaces

- Modelo: https://huggingface.co/Ineeoluwa/adapterlab-support-intent-tiny
- Demo en navegador (Spaces): https://huggingface.co/spaces/Ineeoluwa/adapterlab-inference
- Dataset: https://huggingface.co/datasets/Ineeoluwa/support-intent-grouped
- Proyecto AdapterLab (GitHub): https://github.com/Eunini/adapterlab
- Modelo base: https://huggingface.co/google/bert_uncased_L-2_H-128_A-2
