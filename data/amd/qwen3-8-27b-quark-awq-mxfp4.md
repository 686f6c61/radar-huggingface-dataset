# amd/Qwen3.8-27B-Quark-AWQ-MXFP4

## Resumen

El modelo `amd/Qwen3.8-27B-Quark-AWQ-MXFP4` es una versión cuantizada del modelo multimodal Qwen3.8-27B de Qwen, desarrollada por AMD utilizando su herramienta de cuantización Quark. Aplica el algoritmo AWQ (Activation-aware Weight Quantization) para reducir tanto pesos como activaciones al formato MXFP4 (microscaling FP4 de OCP, con grupo de 32 y escala compartida E8M0), logrando un tamaño de repositorio de 19,8 GB frente a los pesos originales en bf16. El modelo mantiene el pipeline `image-text-to-text`, por lo que conserva la capacidad de procesar imágenes y texto, y el vision tower se deja sin cuantizar en bf16 para preservar la calidad visual.

Aunque el nombre sugiere 27 mil millones de parámetros, los safetensors contienen 15.606.149.872 parámetros (aproximadamente 15,6 mil millones), posiblemente porque el vision tower no está incluido en el archivo de pesos o porque la cifra comercial difiere del recuento real. La cuantización a MXFP4 permite una inferencia más eficiente en memoria y cómputo, con una recuperación de rendimiento del 101,8% en GSM8K en modo thinking respecto al modelo base bf16. Está pensado para despliegue con vLLM y es compatible con el ecosistema transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con vision tower y decoder de lenguaje, basado en Qwen3.8-27B |
| Parametros totales | 15.606.149.872 (aprox. 15,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (según configuracion de vLLM) |
| Tipos de cuantizacion | MXFP4 (pesos y activaciones) con AWQ; vision tower en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint `Qwen/Qwen3.8-27B`, un modelo multimodal que combina un vision tower (codificador de imagenes) con un decoder de lenguaje transformer. La cuantizacion se realiza con AMD Quark, aplicando el algoritmo AWQ sobre pesos y activaciones, ambos en formato MXFP4. Los pesos se cuantizan con grupo de 32 y escala compartida E8M0, mientras que las activaciones se cuantizan de forma dinamica por bloque en tiempo de ejecucion. La calibracion se hizo con 128 muestras de longitud 512 del dataset `pileval` (configuracion por defecto de Quark). El vision tower (`model.visual.*`) se excluye de la cuantizacion y permanece en bf16, de modo que solo el decoder de lenguaje (`model.language_model.layers`) se ve afectado. No se proporcionan detalles sobre el entrenamiento original del modelo base, como numero de tokens o tecnicas de alineacion (RLHF/DPO).

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, generando respuestas textuales (pipeline `image-text-to-text`).
- Modo thinking: segun los benchmarks, el modelo puede operar en modo "thinking" (razonamiento extendido con mayor numero de tokens generados) y en modo "non-thinking" (respuestas directas).
- Generacion de texto conversacional: etiquetado como `conversational`, apto para dialogos multi-turno.
- Razonamiento matematico: evaluado en GSM8K con resultados cercanos o superiores al modelo base bf16.
- No se menciona soporte explicito de tool calling, function calling ni capacidades de agente en la informacion disponible.

## Casos de uso

- Descripcion de imagenes para accesibilidad: el modelo puede generar descripciones detalladas de fotografias o ilustraciones, ayudando a personas con discapacidad visual a comprender contenido grafico.
- Asistente visual para soporte tecnico: un usuario puede enviar una captura de pantalla de un error y el modelo, en modo thinking, analiza la imagen y sugiere pasos de resolucion.
- Razonamiento matematico asistido: gracias a su rendimiento en GSM8K, puede resolver problemas aritmeticos y de algebra presentados como texto o imagen, util en entornos educativos.
- Chatbot multimodal para comercio electronico: permite a los clientes enviar fotos de productos y recibir recomendaciones o informacion sobre caracteristicas.
- Analisis de documentos escaneados: combinando OCR (externo) con el modelo, se pueden extraer y razonar sobre informacion de facturas, formularios o articulos.
- Generacion de contenido creativo a partir de imagenes: el modelo puede redactar historias, poemas o descripciones narrativas basadas en una imagen dada.
- Despliegue en produccion con vLLM: su formato cuantizado y compatibilidad con vLLM permiten servirlo con baja latencia en GPUs de gama alta, ideal para APIs de vision por computador.

## Benchmarks y rendimiento

La model card reporta resultados en GSM8K (5-shot) comparando la version cuantizada (AWQ) con el modelo base bf16, tanto en modo thinking como non-thinking. La metrica de recuperacion se calcula sobre la extraccion flexible.

| Benchmark | Configuracion | Este modelo (AWQ) | Base BF16 | Recuperacion % |
|---|---|---|---|---|
| GSM8K 5-shot (flexible-extract / strict-match) | Thinking: temp=1.0, top_p=0.95, top_k=20, max_gen_toks=3072 | 94.996% / 95.30% | 93.33% / 93.33% | 101.8% |
| GSM8K 5-shot (flexible-extract / strict-match) | Non-thinking: temp=0.7, top_p=0.80, top_k=20, max_gen_toks=1024 | 89.92% / 89.76% | 90.67% / 89.76% | 99.2% |

No se publican resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19,8 GB, por lo que se necesitan al menos 24 GB de VRAM para cargar los pesos completos (incluyendo el vision tower en bf16). Con activaciones y overhead, se recomienda una GPU de 24 GB o superior.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A100 40GB, H100, o equivalentes con 24 GB o mas de memoria.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) y en modelos con 24 GB, pero no en GPUs de 16 GB como RTX 4080 o RTX 3080 Ti.
- Opciones de despliegue: vLLM (comando proporcionado en la model card), tambien compatible con transformers y posiblemente con TGI u Ollama si se convierte a GGUF, aunque no se indica.
- Latencia y throughput: no se proporcionan datos especificos. Con vLLM y una GPU A100, se puede esperar un throughput de varios cientos de tokens por segundo, pero depende de la configuracion.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos cuantizados de la misma categoria en la informacion proporcionada. La unica referencia es el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Cuantizacion | GSM8K (thinking) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | no disponible | no disponible | bf16 | 93.33% | Apache 2.0 |
| amd/Qwen3.8-27B-Quark-AWQ-MXFP4 | 15,6B | 16.384 | MXFP4 (AWQ) | 94.996% | Apache 2.0 |

La comparativa con otros modelos multimodales cuantizados (por ejemplo, versiones de LLaVA o InternVL) no esta disponible.

## Limitaciones y advertencias

- La cuantizacion a 4 bits (MXFP4) puede introducir perdida de precision en tareas complejas fuera de los benchmarks evaluados, especialmente en razonamiento logico o generacion de codigo.
- El vision tower no esta cuantizado, por lo que el ahorro de memoria es parcial; el peso total sigue siendo considerable (19,8 GB).
- No se ha evaluado el modelo en otros benchmarks como MMLU, HumanEval o tareas de vision especificas, por lo que su rendimiento general no esta garantizado.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma; se recomienda realizar pruebas adicionales antes de uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero las modificaciones de AMD estan protegidas por copyright; es necesario revisar los terminos del modelo base Qwen3.8-27B.
- La fecha de creacion del repositorio (2026-08-15) es futura, lo que sugiere que puede tratarse de un modelo experimental o pre-lanzamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion AMD Quark: https://github.com/amd/Quark
