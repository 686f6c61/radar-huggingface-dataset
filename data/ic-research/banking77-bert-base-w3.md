# ic-research/banking77-bert-base-w3

## Resumen

`ic-research/banking77-bert-base-w3` es un modelo de clasificación de intenciones (intent classification) para el dominio bancario, obtenido mediante fine-tuning de `google-bert/bert-base-uncased` sobre 5.000 consultas del conjunto de entrenamiento de BANKING77. Lo desarrolla `ic-research` y se publica como el modelo de referencia W3 (etiqueta B0) de la fase A del protocolo FANN, un marco experimental con reglas congeladas y versionadas. El modelo resuelve una tarea acotada: asignar una de las 77 intenciones bancarias predefinidas a una consulta corta en inglés.

La relevancia del modelo no está en su rendimiento bruto, sino en su función como referencia reproducible dentro de un protocolo concreto. El autor documenta la receta exacta (optimizador, tasa de aprendizaje, número de épocas, semilla, revisión del modelo base, hash del split y hash de los pesos), lo que permite auditar y replicar el resultado. La arquitectura es BERT-base estándar, con 109.541.453 parámetros totales y un límite de 64 tokens por muestra durante el entrenamiento.

Es importante subrayar que la accuracy reportada de 0,9033 corresponde a un split de control de riesgo de 2.503 consultas extraído del propio conjunto de entrenamiento oficial (nunca usado para el ajuste), no al test set oficial de BANKING77, que según el autor no se leyó. El modelo está pensado para inglés y para un pipeline de `text-classification`, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (fine-tuning de `google-bert/bert-base-uncased`) |
| Parametros totales | 109.541.453 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 tokens (longitud máxima usada en entrenamiento; el modelo base admite hasta 512) |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en precisión original) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (datos BANKING77 bajo CC BY 4.0 de PolyAI) |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `4b97d363ba36242a37474cc19ca9adfef355c989a51489000a0e42182e603501`) |

## Arquitectura y entrenamiento

El modelo parte de BERT-base uncased (revisión `86b5e0934494bd15c9632b12f734a8a67f723594`), un transformer encoder de 12 capas y 768 dimensiones ocultas, con una cabeza de clasificación adaptada a 77 etiquetas correspondientes a los nombres de intención de BANKING77 ordenados alfabéticamente. No hay innovaciones arquitectónicas: es un fine-tuning de clasificación supervisada convencional.

El entrenamiento usó las primeras 5.000 consultas del conjunto de entrenamiento oficial, barajadas con `numpy.random.default_rng(20261030).permutation(10003)`. Se empleó AdamW con tasa de aprendizaje 5e-5, weight decay 0,01, decaimiento lineal hasta cero sin warm-up, batch size 32, 10 épocas fijas sin early stopping ni selección de checkpoint, longitud máxima de 64 tokens y semilla 20261030. El ajuste se ejecutó en una NVIDIA A10 (Modal) con torch 2.6.0 y transformers 4.48.3. El autor documenta que una primera ejecución con tasa 2e-5 y 4 épocas alcanzó 0,6384 de accuracy y no superó el umbral del protocolo, y que fue sustituida mediante una enmienda fechada del protocolo. El archivo `manifest.json` contiene la receta, el hash del split, las pérdidas por época y las versiones de las dependencias.

## Capacidades

- Clasificación de texto en 77 intenciones bancarias predefinidas (por ejemplo, consultas sobre tarjetas, transferencias, cargos, límites o estados de cuenta), con salida de una única etiqueta por consulta.
- Procesamiento de consultas cortas en inglés, con truncado a 64 tokens.
- Inferencia mediante el pipeline `text-classification` de transformers.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta modo de razonamiento explícito (thinking), visión ni audio.
- Capacidad multilingüe limitada al inglés; no se documenta entrenamiento en otros idiomas.
- No genera texto libre: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: clasificar cada consulta entrante en una de las 77 intenciones para dirigirla al equipo o al flujo automatizado correspondiente, aprovechando que la etiqueta predicha encaja con la taxonomía estándar de BANKING77.
- Etiquetado previo en un chatbot de atención al cliente: usar la intención predicha como señal de entrada para seleccionar la respuesta o el árbol de decisión adecuado en un sistema conversacional.
- Análisis de volumen de consultas: agregar las intenciones predichas sobre lotes de mensajes para medir qué tipos de incidencia dominan en cada periodo.
- Filtrado y priorización: detectar consultas de determinadas categorías (por ejemplo, cargos no reconocidos) para escalarlas a revisión humana con mayor prioridad.
- Generación de datos etiquetados auxiliares: preetiquetar grandes volúmenes de consultas en inglés para su revisión posterior por anotadores humanos, dado el bajo coste de inferencia de un BERT-base.
- Referencia de calibración en experimentos: servir como modelo base B0 del protocolo FANN para comparar variantes posteriores sobre el mismo split y la misma receta, gracias a la reproducibilidad documentada (semilla, hashes y versiones).
- Validación de pipelines de clasificación: integrarlo como caso de prueba en CI para verificar que el preprocesado, el truncado a 64 tokens y el mapeo de etiquetas funcionan de extremo a extremo.

## Benchmarks y rendimiento

| Item | Valor |
|---|---|
| Accuracy frente a la etiqueta gold en el split de control de riesgo (2.503 consultas) | 0,9033 |
| Umbral de calidad del protocolo | 0,85 |
| Accuracy del test set oficial de BANKING77 | No evaluado (el autor indica que no se leyó) |
| Comparación con otros modelos | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos alternativos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,5 M de parámetros), con un consumo total habitual en torno a 1-2 GB incluyendo activaciones y overhead del runtime para lotes pequeños.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una NVIDIA A10. Funciona en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 y H100 sin problema.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline `text-classification` de transformers, TorchServe, FastAPI con transformers, ONNX Runtime, TGI (soporte de modelos encoder para clasificación según versión), y exportación a GGUF para llama.cpp si se convierte manualmente (no se publica GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por muestra en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ic-research/banking77-bert-base-w3` | 109,5 M | 64 tokens (entrenamiento) | Clasificación de 77 intenciones bancarias | Apache-2.0 | Hugging Face |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens | Modelo base generalista (MLM) | Apache-2.0 | Hugging Face |
| Fine-tunings de BANKING77 sobre DistilBERT o RoBERTa | No disponible | No disponible | Clasificación de intenciones bancarias | Variable según autor | Hugging Face (múltiples repositorios de terceros) |

No se dispone de resultados comparativos publicados entre este modelo y alternativas sobre el mismo split de control, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La accuracy de 0,9033 no es comparable con resultados publicados sobre el test set oficial de BANKING77; mide un split interno de control de riesgo y el test oficial no se evaluó.
- El modelo solo entiende inglés y solo produce las 77 etiquetas de BANKING77; cualquier consulta fuera de esa taxonomía se forzará a una de las 77 clases.
- El truncado a 64 tokens puede perder información en consultas largas; las consultas más extensas se recortan.
- El entrenamiento usó 10 épocas fijas sin early stopping ni selección de checkpoint, lo que puede implicar sobreajuste respecto al split de entrenamiento; el autor no publica curvas de validación más allá de las pérdidas por época en `manifest.json`.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea confiada: el modelo no proporciona una estimación de incertidumbre calibrada en la model card.
- No se documentan análisis de sesgos; al ser un clasificador de intenciones bancarias, los sesgos potenciales se limitan a la distribución de las consultas de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero los datos BANKING77 están bajo CC BY 4.0 (PolyAI), lo que exige atribución si se redistribuyen derivados del dataset.
- El modelo está vinculado a un protocolo experimental (FANN fase A, v0.4.3) y a un repositorio de recetas (`quotient`); su valor como referencia depende de mantener la receta y los hashes documentados.
- No se publican pesos en GGUF ni cuantizaciones listas para usar; quien necesite despliegue ligero deberá convertirlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ic-research/banking77-bert-base-w3
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset BANKING77 (PolyAI): https://huggingface.co/datasets/PolyAI/banking77
- Protocolo FANN stage A v0.4.3: https://github.com/ic-research/fann-stage-a
- Repositorio de recetas de entrenamiento (`quotient`, ruta `recipes/finetune/banking77`): no disponible como URL directa en la información proporcionada
