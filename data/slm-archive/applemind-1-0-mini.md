# SLM-Archive/AppleMind-1.0-Mini

## Resumen

AppleMind-1.0-Mini es un modelo de lenguaje causal decoder-only entrenado desde cero por SLM-Archive (proyecto AppleMind) sobre un currículo de aproximadamente 300 millones de tokens. Se trata de un modelo extremadamente pequeno: 1.020.480 parametros, 4 capas, dimension oculta de 128 y una ventana de contexto de solo 256 tokens. Usa una arquitectura Transformer estandar con atencion causal multi-cabeza, LayerNorm, embeddings posicionales aprendidos y embeddings de entrada/salida atados, expuesta en HuggingFace como `GPT2LMHeadModel` (tipo `gpt2`).

El modelo se distribuye como modelo base (no instruido, sin fine-tuning conversacional pese a la etiqueta `conversational`) bajo licencia Apache 2.0, en formato safetensors, y esta pensado como ejercicio de preentrenamiento reproducible y como pieza didactica para estudiar el escalado de modelos de lenguaje muy pequenos. No resuelve tareas de produccion: su calidad de generacion, segun la propia model card, es incoherente incluso en prompts triviales como "Once upon a time".

Su relevancia actual es fundamentalmente academica: sirve como referencia minima de pipeline completo (tokenizador, mezcla de datos, schedule de learning rate, publicacion en safetensors) y para experimentos de ablacion sobre corpus y tokenizadores. Para cualquier caso de uso real conviene usar modelos del rango 100M-1B parametros, que ofrecen contexto y coherencia muy superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (AppleMind 1.0 Mini); `GPT2LMHeadModel` en HuggingFace |
| Parametros totales | 1.020.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; al ser un modelo de ~1M parametros puede ejecutarse en FP32/BF16 sin necesidad de cuantizar) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien requiere `trust_remote_code` segun los tags; arquitectura personalizada con `custom-code`/`custom-architecture`) |

Datos adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Capas | 4 |
| Tamano oculto | 128 |
| Tamano intermedio (MLP) | 512 |
| Cabezas de atencion | 4 |
| Cabezas KV | 4 |
| Dimension por cabeza | 32 |
| Estilo de atencion | self-attention causal multi-cabeza |
| MLP | GELU |
| Embeddings posicionales | aprendidos |
| Normalizacion | LayerNorm |
| Vocabulario | 50.263 |
| Embeddings | entrada/salida atados |
| Tokenizador | BPE byte-level digit-aware (GPT-2 + tokens especiales) |
| Precision de entrenamiento | BF16 |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only convencional, sin innovaciones tipo MoE, atencion lineal o decodificacion especulativa. Consta de 4 bloques con atencion causal multi-cabeza (4 cabezas de consulta y 4 de clave/valor, con dimension de cabeza 32), feed-forward con activacion GELU (dimension intermedia 512), LayerNorm y embeddings posicionales aprendidos. Los embeddings de entrada y salida estan atados, lo que reduce el recuento de parametros. El tokenizador es un BPE byte-level basado en el de GPT-2 con 3 tokens especiales adicionales (`<|pad|>` = 50.260, `<|bos|>` = 50.261, `<|eos|>` = 50.262) y un tratamiento "digit-aware" que tokeniza los digitos individualmente en lugar de agruparlos en tokens numericos grandes.

El preentrenamiento se hizo con 299.892.736 tokens (objetivo 300M), una mezcla equitativa de 100M de tokens de FineWeb-Edu, 100M de FineWeb-HQ y 100M de SmolLM-Corpus. Se uso AdamW con pico de learning rate 0,0001, schedule de decaimiento coseno hasta 3,114e-06 en el paso final, gradient clipping de 1 y tamano de secuencia 256. El lote efectivo fue de 512 secuencias (micro-lote 512, sin acumulacion de gradientes), lo que da 131.072 tokens por paso de optimizador y un total de 2.288 pasos finales sobre 2.289 configurados. La ratio resultante es de 293,87 tokens por parametro. No se documenta ninguna fase de RLHF, DPO, SFT ni evaluacion formal con `lm_eval`.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de prompts cortos en ingles. La propia model card reconoce que la calidad es pobre y muestra una salida incoherente para "Once upon a time".
- Modelo base sin instrucciones: no esta alineado ni ajustado para seguir instrucciones, pese a la etiqueta `conversational` presente en los tags de HuggingFace.
- Manejo de digitos a nivel de token individual gracias al tokenizador digit-aware, lo que en teoria facilita tareas numericas simples (aunque no se han medido).
- Capacidad multilingue: no disponible; solo se declara ingles.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Vision, audio, thinking mode: no soportado.
- Contexto efectivo muy limitado: 256 tokens, suficiente solo para fragmentos muy cortos.

## Casos de uso

- Experimentacion educativa con preentrenamiento: usar el pipeline documentado (mezcla de corpus, schedule coseno, BF16) como plantilla reproducible para ensenar como se entrena un LM desde cero.
- Ablaciones de tokenizador: comparar el tokenizador BPE digit-aware frente al BPE estandar de GPT-2 en tareas de aritmetica simple con modelos de juguete.
- Pruebas de infraestructura y CI: al ocupar pocos megabytes, sirve para validar pipelines de carga con `transformers` y `trust_remote_code`, serializacion en safetensors y despliegue en endpoints de TGI sin coste de GPU.
- Docencia sobre limitaciones de escala: demostrar empiricamente como un modelo de 1M parametros con 300M tokens produce texto incoherente, ilustrando la relacion entre tokens por parametro y calidad.
- Investigacion sobre mezclas de datos: analizar el efecto de una mezcla 1:1:1 de FineWeb-Edu, FineWeb-HQ y SmolLM-Corpus en un presupuesto de computo minimo.
- Pruebas de generacion en dispositivos embebidos: por su tamano (del orden de 2-4 MB en BF16/FP32) puede ejecutarse en CPU, microcontroladores de gama alta o navegador con ONNX/WebGPU, aunque la utilidad practica del texto generado es nula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado formalmente con `lm_eval` y que las celdas de ARC Easy, PIQA, ARC Challenge y HellaSwag figuran como N/A.

| Benchmark | Score | Metrica |
|---|---|---|
| Average | N/A | `mean` |
| ARC Easy | N/A | `acc_norm,none` |
| PIQA | N/A | `acc_norm,none` |
| ARC Challenge | N/A | `acc_norm,none` |
| HellaSwag | N/A | `acc_norm,none` |

Las unicas comprobaciones cualitativas publicadas son generaciones con los prompts "Once upon a time", "The little boy" y "In the forest", con resultados incoherentes.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 4 MB en FP32, 2 MB en BF16 y ~1 MB en int8. Cabe holgadamente en cualquier GPU o incluso en CPU.
- GPU recomendadas: cualquiera. No requiere GPU dedicada; funciona en CPU, GPUs integradas, NVIDIA T4, RTX 3060 o superiores, y tambien en Raspberry Pi o telefonos moviles.
- GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en sistemas sin GPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (la model card usa `GPT2LMHeadModel`); TGI aparece como etiqueta de compatibilidad (`text-generation-inference`) y `endpoints_compatible`. `llama.cpp`, Ollama o vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

La model card indica que AppleMind se inspiro en BananaMind, pero no se aportan especificaciones de ese modelo. Comparativas con alternativas conocidas de la misma categoria (modelos muy pequenos):

| Modelo | Parametros | Contexto | Licencia | Datos de benchmark |
|---|---|---|---|---|
| AppleMind-1.0-Mini | 1,02M | 256 | Apache 2.0 | no disponibles |
| GPT-2 small (referencia) | 124M | 1024 | licencia MIT modificada | no comparables en la ficha |
| Otros SLM de <150M | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos para AppleMind-1.0-Mini, por lo que no es posible establecer una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Calidad de generacion muy baja: las propias muestras de la model card muestran texto incoherente para prompts triviales. No es apto para ningun uso en produccion.
- No es un modelo de chat ni instruido: la etiqueta `conversational` no se corresponde con un ajuste por instrucciones.
- Ventana de contexto de solo 256 tokens, insuficiente para documentos, conversaciones multi-turno o razonamiento de cadena larga.
- Solo ingles declarado; cualquier uso en castellano producira resultados fuera de distribucion.
- Riesgo de alucinacion total y de generar contenido sin sentido, sesgos heredados de FineWeb-Edu, FineWeb-HQ y SmolLM-Corpus (datos web filtrados, con sesgos de dominio y de idioma).
- Requiere `trust_remote_code=True`: implica ejecutar codigo personalizado del repositorio, con el riesgo de seguridad asociado. Conviene auditar el codigo antes de cargarlo.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion, pero la licencia no garantiza idoneidad tecnica.
- Metadatos inconsistentes: el tag `cosmopedia-v2` aparece en las etiquetas pero ese dataset no figura en la mezcla de entrenamiento descrita.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni comunidad que valide el modelo.

## Enlaces

- HuggingFace, pagina del modelo: https://huggingface.co/SLM-Archive/AppleMind-1.0-Mini
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-HQ: https://huggingface.co/datasets/epfml/FineWeb-HQ
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Paper/blog/repositorio/demo oficial: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los resultados obtenidos corresponden a una tienda de perfumes (slm.paris), articulos genericos de IBM y ASI sobre pequenos modelos de lenguaje (https://www.ibm.com/fr-fr/think/topics/small-language-models, https://www.asi.fr/blog/ia-generative-comprendre-differences-entre-slm-llm) y una mutua sanitaria, ninguno relacionado con SLM-Archive ni con AppleMind.
