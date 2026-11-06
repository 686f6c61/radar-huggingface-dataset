# fernandotonon/Llama-3-LLM2Vec-8B-Kimodo-TextEncoder-GGUF

## Resumen

Llama-3-LLM2Vec-8B-Kimodo-TextEncoder-GGUF es un encoder de texto derivado de Meta-Llama-3-8B-Instruct, publicado por el desarrollador independiente fernandotonon. El modelo fusiona en sus pesos los adaptadores MNTP y supervisados de LLM2Vec (McGill-NLP) y se convierte a un Llama bidireccional sin cabeza generativa (arquitectura `llama-embed`, `attention.causal = false`), empaquetado en formato GGUF con cuantizacion Q8_0 para su uso con llama.cpp. No es un modelo conversacional: su funcion es producir embeddings de texto que alimentan el codificador textual de NVIDIA Kimodo, un sistema de text-to-motion (generacion de movimiento a partir de texto).

La relevancia de esta ficha es acotada y muy especifica. El autor lo empaqueta para QtMeshEditor, su editor de mallas, que ejecuta Kimodo de forma nativa (sin Python) a traves de su llama.cpp integrado. Es, por tanto, una pieza de infraestructura dentro de un pipeline de animacion 3D, no un modelo de proposito general. Con 7.504.924.672 parametros y un repositorio de 8,0 GB, el interes practico esta en reproducir exactamente el encoder de Kimodo en entornos C++ sin dependencias de PyTorch.

La calidad de la conversion esta documentada por el autor: frente al encoder original en bf16 PyTorch, la similitud coseno medida es de 0,9999 en todas las prompts de prueba. Esa es la unica metrica de rendimiento publicada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Llama bidireccional sin cabeza generativa (`llama-embed`, `attention.causal = false`), derivado de Llama-3-8B-Instruct con adaptadores LLM2Vec fusionados |
| Parametros totales | 7.504.924.672 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3 soporta 8.192 tokens, pero la model card no declara contexto para este encoder) |
| Tipos de cuantizacion | Q8_0 (unica cuantizacion publicada en este repositorio) |
| Idiomas soportados | no disponible (los tags de Hugging Face indican "no disponibles") |
| Licencia | Meta Llama 3 Community License (adaptadores LLM2Vec bajo MIT) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct y le fusiona los adaptadores LoRA de LLM2Vec: primero el adaptador MNTP (Masked Next Token Prediction, que convierte el modelo causal en bidireccional) y despues el adaptador supervisado (`-mntp-supervised`). El resultado se guarda como un Llama sin cabeza (`llama-embed`) con atencion no causal, se convierte con `convert_hf_to_gguf.py` de llama.cpp y se cuantiza a Q8_0. El script de exportacion esta publicado en el repositorio del autor (`scripts/export-kimodo-text-encoder-gguf.py`).

El uso previsto no es la generacion de texto sino la extraccion de embeddings con pooling de media sobre los tokens de la propia prompt. El input se formatea como `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|>` y el embedding es la media de los ultimos estados ocultos de `{prompt}<|eot_id|>`, con embeddings por token (`pooling = none`) y atencion bidireccional. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos detalles corresponden al modelo base y a los adaptadores de LLM2Vec, no a esta conversion.

## Capacidades

- Generacion de embeddings de texto (representaciones vectoriales) con pooling de media, no generacion de texto.
- Codificacion bidireccional de la prompt completa, lo que permite que cada token atienda a todo el contexto.
- Embeddings por token (`pooling = none`), utilizables por componentes posteriores que aplican su propio pooling.
- Integracion como encoder textual de NVIDIA Kimodo para text-to-motion (generacion de movimiento a partir de descripciones en lenguaje natural).
- Ejecucion nativa en C++ mediante llama.cpp, sin Python ni PyTorch.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags de Hugging Face).
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking: es un encoder, no un modelo instructivo.

## Casos de uso

- Animacion 3D mediante text-to-motion: el encoder transforma la descripcion textual del movimiento en embeddings que Kimodo consume para generar la animacion; es su proposito original dentro de QtMeshEditor.
- Edicion de mallas y rigging en C++: QtMeshEditor lo usa a traves de su llama.cpp integrado, lo que permite incorporar text-to-motion a una aplicacion de escritorio nativa sin dependencias de Python.
- Busqueda semantica y similitud entre textos: los embeddings con pooling de media sirven para indexar y comparar documentos, gracias a la representacion bidireccional de LLM2Vec.
- Clasificacion y clustering de texto: los vectores por token o agregados alimentan clasificadores ligeros o algoritmos de agrupacion.
- Reproduccion determinista de un pipeline de Kimodo: al alcanzar similitud coseno de 0,9999 frente al encoder bf16 original, permite sustituir PyTorch por llama.cpp sin degradar la salida.
- Despliegue en entornos sin GPU o con recursos limitados: al estar en GGUF Q8_0, se ejecuta con llama.cpp en CPU, util para herramientas de escritorio y CI.
- Recuperacion aumentada (RAG) en aplicaciones C++: integracion del encoder en un pipeline de recuperacion sin salir del ecosistema llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB) en la informacion disponible. La unica metrica documentada es la fidelidad de la conversion:

| Metrica | Valor | Referencia |
|---|---|---|
| Similitud coseno frente al encoder bf16 PyTorch original | 0,9999 | Todas las prompts de prueba, segun el autor |

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 8 GB para los pesos (repositorio de 8,0 GB); el consumo real depende del contexto y del overhead de llama.cpp.
- GPU recomendadas: no documentadas por el autor. Por tamano, una GPU con 10-12 GB o mas de VRAM (RTX 3080/4080/4090, A100, H100) permite mantener el modelo completo en memoria.
- Cabe en GPU de consumo: si, en tarjetas con 10 GB o mas de VRAM en Q8_0; en tarjetas con menos memoria puede requerir descarga parcial a RAM y penalizacion de latencia.
- Opciones de despliegue: llama.cpp (libreria declarada) y cualquier runtime compatible con GGUF. No se documenta soporte verificado en vLLM, TGI, Ollama ni en el servidor de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Llama-3-LLM2Vec-8B-Kimodo-TextEncoder GGUF) | 7.504.924.672 | no disponible | GGUF Q8_0 | Meta Llama 3 Community License | Encoder bidireccional LLM2Vec para Kimodo; similitud 0,9999 con el original |
| McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp | 8B (aprox.) | no disponible | safetensors (PyTorch) | MIT (adaptadores) sobre Llama 3 | Modelo de embeddings de referencia; requiere PyTorch |
| Meta-Llama-3-8B-Instruct | 8B | 8.192 tokens | safetensors, GGUF | Meta Llama 3 Community License | Generativo causal; no produce embeddings bidireccionales |
| NVIDIA Kimodo (encoder textual original) | no disponible | no disponible | PyTorch bf16 | no disponible | Referencia de fidelidad (similitud 0,9999) |

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas, no sigue instrucciones ni conversa; usarlo como chatbot produce salidas sin sentido.
- Disenado para un pipeline concreto (Kimodo via QtMeshEditor); fuera de ese uso, el formato de prompt y el pooling esperados deben replicarse manualmente.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes enganosas en dominios alejados de los datos de entrenamiento del modelo base.
- Idiomas soportados no declarados; el comportamiento multilingue depende de Llama 3 y de LLM2Vec y no esta verificado para este artefacto.
- Licencia Meta Llama 3 Community License: el uso comercial esta sujeto a sus terminos y a la Acceptable Use Policy; ademas, la licencia exige el cumplimiento de las condiciones de atribucion de Meta.
- Los adaptadores LLM2Vec son MIT, pero el modelo fusionado hereda la licencia de Llama 3.
- Unica cuantizacion publicada (Q8_0): no hay variantes mas ligeras (Q4_K_M, Q5_K_M) para entornos con poca memoria.
- Repositorio con 52 descargas y 0 likes: ecosistema minimo, sin validacion independiente de la conversion.
- No hay datos publicados de contexto maximo, latencia ni throughput; conviene validar el comportamiento en produccion antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fernandotonon/Llama-3-LLM2Vec-8B-Kimodo-TextEncoder-GGUF
- Repositorio QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Script de exportacion: https://github.com/fernandotonon/QtMeshEditor/blob/master/scripts/export-kimodo-text-encoder-gguf.py
- NVIDIA Kimodo SOMA RP v1.2: https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.2
- LLM2Vec (repositorio): https://github.com/McGill-NLP/llm2vec
- Adaptador LLM2Vec MNTP: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp
- Adaptador LLM2Vec supervisado: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised
- Meta-Llama-3-8B-Instruct: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: https://huggingface.co/fernandotonon/Llama-3-LLM2Vec-8B-Kimodo-TextEncoder-GGUF/blob/main/LICENSE-Llama-3.txt
