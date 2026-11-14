# Hooshaai/bert-fusion-attn-sst2

## Resumen

`Hooshaai/bert-fusion-attn-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que las doce capas de atencion softmax cuadratica del transformer original se han sustituido por el mecanismo `fusion_attn` de la libreria NeuralOps. El modelo resultante se ha afinado y destilado para clasificacion binaria de sentimiento sobre la tarea SST-2 del benchmark GLUE, alcanzando un 91,63 % de accuracy en el split de validacion, identico al del modelo profesor BERT-base.

El interes tecnico no reside tanto en la tarea (clasificacion de sentimiento, resuelta con holgura por BERT-base desde 2018) como en la sustitucion arquitectonica: `fusion_attn` promete una complejidad operativa subcuadratica, O(N) u O(N log N), frente al coste O(N^2) de la atencion multi-cabeza estandar. El repositorio distribuye unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), apoyandose en el BERT-base congelado que se descarga aparte, lo que reduce drasticamente el footprint de descarga frente a los ~450 MB del modelo completo.

Es un artefacto de investigacion orientado a validar la viabilidad de mecanismos de atencion eficientes dentro del ecosistema NeuralOps, no un modelo de produccion generalista. La fecha de creacion del repositorio (noviembre de 2026) y el uso de la libreria `neuralops` con `trust_remote_code=True` implican dependencias de codigo remoto que conviene auditar antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion `fusion_attn` subcuadratica (O(N) / O(N log N)) en las 12 capas |
| Parametros totales | 110 M (heredados de BERT-base; el repo solo almacena pesos de atencion y cabeza de clasificacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT-base original soporta 512 tokens; el checkpoint no documenta cambios) |
| Tipos de cuantizacion | Pesos distribuidos en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB) + pesos base congelados de `bert-base-uncased` descargados aparte |
| Libreria | `neuralops` (requiere `trust_remote_code=True`) |
| Tarea | Clasificacion de texto (sentimiento binario, SST-2) |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, 110 M de parametros) y reemplaza en cada capa el bloque de atencion multi-cabeza cuadratica por `fusion_attn`, un mecanismo de la Attention Zoo de NeuralOps que declara complejidad efectiva subcuadratica (O(N) u O(N log N)). El resto de la arquitectura (embeddings, feed-forward, normalizacion, cabeza de clasificacion) se mantiene compatible con BERT-base.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, una destilacion en dos etapas: primero una alineacion de representaciones ocultas en subespacio, y despues una combinacion de divergencia KL sobre logits y entropia cruzada sobre la tarea. El protocolo cachea las representaciones del profesor de forma offline, lo que elimina la necesidad de mantener el profesor en VRAM durante el entrenamiento. Segun la model card, el proceso se ejecuto en una unica NVIDIA RTX 3090 de 24 GB, con 230 pasos de optimizacion, 47,3 s de duracion total, un throughput efectivo de 39.823,5 tokens/s y un pico de VRAM de 13.512 MB.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles, con una accuracy reportada del 91,63 % en SST-2.
- Inferencia sobre secuencias de texto con la tokenizacion estandar de BERT (`bert-base-uncased`).
- Carga modular: solo se descargan los pesos de atencion y la cabeza de tarea, reconstruyendo el modelo completo en tiempo de carga sobre el BERT-base congelado.
- Integracion con la API de alto nivel de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision, audio ni capacidades de agente: es exclusivamente un clasificador.
- Capacidad multilingue: no disponible; solo ingles.

## Casos de uso

- **Analisis de sentimiento en resenas de producto en ingles**: el modelo clasifica cada resena como positiva o negativa con la precision reportada en SST-2, y su naturaleza de atencion subcuadratica reduce el coste por token en lotes grandes frente a BERT-base estandar.
- **Moderacion de comentarios a escala**: al mantener la precision del profesor con un coste de atencion menor, es adecuado para prefiltrar grandes volumenes de texto en ingles antes de una revision humana.
- **Investigacion en atencion eficiente**: sirve como checkpoint de referencia para comparar `fusion_attn` contra atencion cuadratica en la misma tarea y con el mismo profesor, gracias a la paridad exacta de accuracy (delta +0,00 %).
- **Prototipado de pipelines de destilacion**: el protocolo de destilacion cacheada documentado permite reproducir el entrenamiento en una sola GPU de consumo, util para equipos que quieran adaptar la receta a otras tareas de GLUE.
- **Clasificacion ligera en entornos con almacenamiento limitado**: los ~55 MB de pesos de atencion mas la cabeza, frente a los ~450 MB del BERT completo, facilitan el despliegue en contenedores o dispositivos con cuotas de disco ajustadas.
- **Evaluacion de la API NeuralOps**: el modelo ejemplifica el flujo de carga modular (`load_pretrained_bert` con `attention_type="fusion_attn"`) y sirve para validar la integracion de la libreria en un stack de PyTorch existente.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria), segun la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`fusion_attn`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 91,63 % | +0,00 % |
| Entropia cruzada de validacion | 0,2428 | sin calibrar | 0,3052 | convergido |

Telemetria de entrenamiento reportada: RTX 3090 24 GB, 47,3 s, 230 pasos, 39.823,5 tokens/s, pico de 13.512 MB de VRAM.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; el modelo no esta disenado para esas tareas.

## Requisitos de hardware

- **VRAM para inferencia**: el modelo completo en FP16 ocupa aproximadamente 220 MB (110 M de parametros), por lo que cabe holgadamente en cualquier GPU con 2 GB o mas. El entrenamiento reportado uso 13.512 MB de pico en una RTX 3090.
- **GPU recomendadas**: cualquier GPU consumer moderna sirve para inferencia (RTX 3060, RTX 4090, etc.). Para reentrenar o destilar, la model card documenta una RTX 3090 de 24 GB como suficiente.
- **Consumer GPU**: si, cabe en practicamente cualquier GPU consumer e incluso en CPU para inferencia por lotes pequenos.
- **Opciones de despliegue**: PyTorch con `transformers` y `trust_remote_code=True`, o la API de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un clasificador BERT con codigo remoto, esos runners no estan garantizados.
- **Latencia y throughput**: no se publican cifras de latencia de inferencia. El unico dato de throughput es de entrenamiento (39.823,5 tokens/s en una RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Formato |
|---|---|---|---|---|---|
| `Hooshaai/bert-fusion-attn-sst2` | 110 M | no disponible | 91,63 % | MIT | safetensors (atencion FP16) + base |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (referencia de la model card) | Apache 2.0 | safetensors / PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en esta ficha | Apache 2.0 | safetensors / PyTorch |
| `roberta-base` fine-tuned en SST-2 | 125 M | 512 | no disponible en esta ficha | MIT | safetensors / PyTorch |

La comparativa directa solo es posible contra el profesor, ya que la model card no incluye cifras de otros clasificadores. Frente a DistilBERT, el modelo aqui descrito conserva los 110 M de parametros pero sustituye la atencion por un mecanismo subcuadratico, lo que teoricamente mejora el escalado con la longitud de secuencia aunque no se aportan mediciones de latencia que lo confirmen.

## Limitaciones y advertencias

- **Sesgos**: hereda los sesgos de `bert-base-uncased` y del corpus SST-2 (resenas de pelicula en ingles); no se documenta ninguna mitigacion.
- **Alucinacion**: al ser un clasificador, no genera texto, pero puede producir etiquetas erroneas con alta confianza en dominios alejados de resenas de pelicula.
- **Idioma**: solo ingles; no se ha validado en castellano ni en otros idiomas.
- **Contexto**: no se documenta la longitud maxima efectiva tras la sustitucion de atencion; el valor de 512 tokens es el de BERT-base y no esta confirmado para `fusion_attn`.
- **Codigo remoto**: requiere `trust_remote_code=True` y la libreria `neuralops`, lo que implica ejecutar codigo del autor; auditar `modeling_neuralops_bert.py` antes de usarlo en produccion.
- **Licencia**: MIT permite uso comercial, pero conviene verificar la licencia del BERT-base subyacente (Apache 2.0) y la del codigo de NeuralOps.
- **Madurez**: repositorio con 76 descargas, 0 likes y creado en noviembre de 2026; sin validacion independiente de las cifras reportadas.
- **Alcance**: no es un modelo generalista; no sirve para generacion, razonamiento, codigo ni tareas fuera de la clasificacion de sentimiento binaria en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-fusion-attn-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
