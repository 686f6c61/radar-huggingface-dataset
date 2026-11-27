# Hansda/EdgeCoder-31M-GGUF

## Resumen

EdgeCoder-31M-GGUF es la conversion al formato GGUF del codificador de texto EdgeCoder-31M, desarrollado originalmente por Knowledgator Engineering y empaquetado por el usuario Hansda. Se trata de un encoder basado en DeBERTa-v2 de 8 capas con representaciones token de 384 dimensiones y 31.036.416 parametros totales, disenado para extraccion de caracteristicas (feature extraction) y fine-tuning posterior en tareas de procesamiento del lenguaje natural en ingles.

El modelo no es un generador de texto: su funcion es producir embeddings contextuales por token a partir de texto en ingles, lo que lo hace adecuado para tareas de clasificacion, reranking, recuperacion de informacion o extraccion de entidades tras un ajuste fino. Su tamano reducido (aproximadamente 31 millones de parametros) y sus cinco cuantizaciones GGUF (desde 10,8 MB en Q2_K hasta 33 MB en Q8_0) lo orientan a entornos con recursos muy limitados, como CPU, dispositivos embebidos o pipelines de baja latencia.

La relevancia actual del paquete reside en que permite ejecutar el encoder sin depender del ecosistema PyTorch completo, mediante un loader Python incluido que expande los bloques GGUF y restaura las formas tensoriales originales para inferencia con Transformers. La licencia Apache-2.0 facilita su uso comercial, aunque el modelo solo soporta ingles y no ofrece capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder), 8 capas, 384 dimensiones de token |
| Parametros totales | 31.036.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q4_K_S, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (y BF16 en el checkpoint fuente) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en DeBERTa-v2 con 8 capas y 384 dimensiones de representacion por token. La model card del paquete GGUF no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al checkpoint fuente `knowledgator/EdgeCoder-31M` y no se reproducen en la informacion disponible. El pipeline declarado es `feature-extraction`, es decir, el modelo no incorpora cabeza generativa ni de clasificacion, sino que expone el estado oculto final para tareas downstream.

La innovacion tecnica del paquete es la conversion GGUF con un loader propio (`edgecoder_gguf.py`) que expande los bloques cuantizados y restaura las formas tensoriales originales para ejecutar el encoder con Transformers. Segun la model card, Q8_0 usa la mayor profundidad de bits de las cinco builds; Q3_K_S y Q4_K_S aplican un unico formato de bloque K-quant sobre los tensores que cuantizan; Q2_K es una build mixta que asigna almacenamiento Q3_K a las matrices elegibles del ultimo tercio de las capas del encoder. Los tensores fuera de los layouts de matriz seleccionados conservan sus valores BF16 originales. Cada build paso comprobaciones de cobertura de tensores fuente, paridad de tokenizer e inferencia en CPU contra el encoder fuente fijado.

## Capacidades

- Extraccion de caracteristicas contextuales por token en ingles (`last_hidden_state`).
- Generacion de embeddings de frase o documento mediante pooling sobre las representaciones del encoder.
- Base para fine-tuning en tareas de clasificacion, reranking, NER y similitud semantica.
- Inferencia en CPU gracias a las builds GGUF de bajo peso.
- No soporta generacion de texto, razonamiento autoregresivo ni decodificacion.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Reranking en busqueda semantica: el encoder puede puntuar pares consulta-documento generando embeddings y calculando similitud coseno; su tamano de 31M permite desplegarlo en CPU junto a un motor de busqueda sin GPU dedicada.
- Clasificacion de texto en produccion: tras un fine-tuning ligero sobre la cabeza de clasificacion, el modelo puede etiquetar tickets de soporte, correos o resenas en ingles con latencia muy baja gracias a sus 8 capas y 384 dimensiones.
- Extraccion de entidades nombradas (NER): el `last_hidden_state` sirve como entrada a una cabeza token-classification para identificar personas, organizaciones y ubicaciones en textos en ingles.
- Filtrado y deduplicacion de datasets: los embeddings por documento permiten agrupar o eliminar duplicados en corpus en ingles dentro de pipelines de preprocesamiento, con coste computacional minimo.
- Moderacion de contenido en ingles: un clasificador ajustado sobre el encoder puede detectar categorias de contenido no deseado en tiempo real en entornos con CPU.
- Deteccion de similitud y parafrasis: el modelo puede alimentar sistemas de comparacion de frases para tareas como deteccion de plagio o agrupacion de consultas equivalentes.
- Despliegue en dispositivos embebidos o edge: las builds Q2_K (10,8 MB) y Q3_K_S (13,4 MB) permiten ejecutar el encoder en hardware con memoria muy restringida, aunque con perdida de fidelidad respecto a Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo es un encoder de 31M de parametros; las builds GGUF ocupan entre 10,8 MB (Q2_K) y 33 MB (Q8_0), por lo que cabe en memoria de CPU o en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU con al menos 1 GB de memoria libre es suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque el modelo esta pensado para inferencia en CPU segun la model card.
- Opciones de despliegue: el paquete incluye un loader Python (`edgecoder_gguf.py`) que requiere `torch`, `transformers==5.17.0`, `gguf==0.19.0`, `sentencepiece` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EdgeCoder-31M-GGUF | 31M | no disponible | en | Apache-2.0 | GGUF | Encoder DeBERTa-v2, feature extraction |
| knowledgator/EdgeCoder-31M (fuente) | 31M | no disponible | en | Apache-2.0 | safetensors/BF16 | Checkpoint original sin cuantizar |
| MiniLM-L6 (referencia) | ~22M | 512 | en/multi | Apache-2.0 | safetensors, ONNX | Encoder alternativo para embeddings; datos no verificados en esta ficha |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- No es un modelo generativo: no puede producir texto, codigo ni respuestas, solo representaciones.
- Riesgo de alucinacion no aplicable en sentido generativo, pero los embeddings pueden producir similitudes espurias si se usan fuera del dominio de entrenamiento.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la fidelidad de las representaciones; para produccion se recomienda Q6_K o Q8_0.
- La longitud de contexto no esta documentada en la informacion disponible; debe verificarse en el checkpoint fuente antes de usarlo con secuencias largas.
- Requiere `transformers==5.17.0` y `gguf==0.19.0` segun la model card; versiones distintas pueden romper el loader incluido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.
- Licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion a Knowledgator Engineering.
- El modelo fue creado y actualizado en noviembre de 2026 segun los metadatos; verificar la vigencia del checkpoint fuente fijado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hansda/EdgeCoder-31M-GGUF
- Checkpoint fuente: https://huggingface.co/knowledgator/EdgeCoder-31M
- Revision fijada del checkpoint fuente: https://huggingface.co/knowledgator/EdgeCoder-31M/tree/7ca6725c36d460acb68df262e6b3aecb5dea4abe
- Licencia: https://huggingface.co/Hansda/EdgeCoder-31M-GGUF/blob/main/LICENSE
