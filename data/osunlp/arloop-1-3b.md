# osunlp/ARLoop-1.3B

## Resumen

ARLoop-1.3B (identificado en el repositorio como ARLoop-1.2B) es un transformer con bucles ("looped transformer") preentrenado de forma totalmente abierta por el grupo OSU-NLP (Yuekun Yao, Yupei Du, Dawei Zhu y Huan Sun). Su particularidad arquitectonica es que las 24 capas fisicas del transformer se reutilizan en 3 pasadas recurrentes, dando una profundidad efectiva de 72 capas sin incrementar el numero de parametros. Ademas incorpora "attention residuals", un mecanismo de conexiones residuales basado en bloques de subcapas que mitiga la degradacion de senal en modelos recurrentes profundos.

El modelo tiene 1.208.655.360 parametros (1,2B) y una ventana de contexto de 4096 tokens. Se publica como checkpoint base preentrenado, no alineado, orientado a completado de texto y pensado como punto de partida para mid-training y post-training. Su interes actual reside en que es una de las pocas implementaciones completamente abiertas de transformers recurrentes con pesos, codigo y 23 checkpoints intermedios publicados, lo que permite estudiar el efecto del bucle y de los attention residuals a lo largo de 500.000 millones de tokens de entrenamiento.

La relevancia practica es doble: por un lado, ofrece una alternativa de investigacion a los transformers estandar de tamano similar con una relacion profundidad/parametros distinta; por otro, al liberarse bajo Apache 2.0 con el tokenizer de SmolLM2, se integra facilmente en pipelines existentes de Hugging Face y sirve como base para experimentos de post-training sin restricciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y attention residuals; 24 capas fisicas compartidas en 3 pasadas recurrentes (profundidad efectiva 72) |
| Parametros totales | 1.208.655.360 (1,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (la model card solo documenta carga en BF16; el checkpoint almacena pesos en FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |

Datos adicionales de arquitectura: anchura oculta 2048, anchura intermedia del MLP 5632, 16 cabezas de atencion y 4 cabezas KV, base RoPE 50000, tamano de bloque de attention residuals de 24 subcapas, 3 bloques residuales recientes con embedding de entrada retenido, value embeddings compartidos entre capas fisicas alternas, vocabulario de 49152 tokens (tokenizer de SmolLM2) y cabeza de salida atada a los embeddings de tokens.

## Arquitectura y entrenamiento

ARLoop es un transformer decoder-only con atencion multi-cabeza (16 cabezas de consulta, 4 de clave/valor) que aplica un esquema de recurrencia en profundidad: un unico bloque de 24 capas fisicas se ejecuta tres veces sobre la misma representacion, lo que da una profundidad efectiva de 72 subcapas sin duplicar pesos. Para que esta reutilizacion no colapse la informacion, el modelo incorpora attention residuals organizados en bloques de 24 sublayers, reteniendo las salidas de los 3 bloques residuales mas recientes junto con el embedding de entrada. Los value embeddings se comparten entre capas fisicas alternas, lo que reduce el numero de matrices de proyeccion de valor. La normalizacion y el enrutamiento interno operan en FP32 aunque la inferencia se realice en BF16.

El entrenamiento cubre 499.996.688.384 tokens (aproximadamente 500.000 millones) distribuidos en 238.417 pasos de optimizador, con un tamano de lote implicito de unos 2,1 millones de tokens por paso. El repositorio publica 23 checkpoints intermedios programados, desde el paso 10.000 (20.971.520.000 tokens) hasta el 230.000 (482.344.960.000 tokens), ademas del checkpoint final. No se documenta en la informacion disponible la composicion del dataset, ni si hubo fases de RLHF, DPO o instruccion, ni innovaciones adicionales como decodificacion especulativa; al tratarse de un modelo base, se asume preentrenamiento puro de next-token prediction.

## Capacidades

- Generacion y completado de texto en ingles: es un modelo base preentrenado, por lo que su funcion principal es la continuacion de secuencias, no el seguimiento de instrucciones.
- Razonamiento de lenguaje natural derivado del preentrenamiento, sin alineacion conversacional.
- Capacidad de servir como base para mid-training y post-training (SFT, DPO, RLHF) segun indica el autor.
- Soporte de tool calling / function calling: no disponible de forma nativa; requeriria post-training especifico.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; el modelo no ha sido entrenado para ello.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.
- Capacidades especiales: ninguna documentada (sin vision, audio ni modo thinking).
- Ventana de contexto de 4096 tokens, adecuada para documentos cortos y conversaciones de pocos turnos.

## Casos de uso

- Investigacion sobre transformers recurrentes: ARLoop permite reproducir y extender experimentos de profundidad efectiva frente a parametros fisicos, cargando los checkpoints intermedios con `revision="step-010000"` para estudiar la dinamica de entrenamiento del bucle y de los attention residuals.
- Punto de partida para post-training en dominio: al ser un modelo base Apache 2.0, se puede afinar con SFT o DPO sobre datos propios (por ejemplo, atencion al cliente en ingles) sin restricciones de licencia, partiendo de un checkpoint de 1,2B que cabe en una unica GPU.
- Completado de codigo y texto tecnico: con 500.000 millones de tokens de preentrenamiento y un tokenizer de SmolLM2, puede usarse como autocompletador en editores o como generador de documentacion en ingles, siempre con revision humana.
- Generacion de datos sinteticos para destilacion: su coste de inferencia bajo (1,2B parametros) permite generar grandes volumenes de texto en ingles para entrenar modelos mas pequenos o para aumentar datasets.
- Baseline academico en evaluaciones de eficiencia: sirve para comparar la relacion calidad/coste de un modelo con profundidad efectiva 72 frente a transformers densos de 1,2B con 24 capas, midiendo perplejidad y throughput en la misma GPU.
- Prototipado de pipelines de generacion en Hugging Face: la integracion con `transformers`, `safetensors` y `accelerate` permite desplegar rapidamente un servicio de completado en ingles para demos internas o pruebas de concepto.
- Estudio de escalado de contexto: con 4096 tokens y RoPE base 50000, es util para experimentos controlados de extension de contexto mediante ajuste de RoPE o fine-tuning, comparando con modelos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una figura con resultados de benchmarks (assets/figure1.png) y el paper arXiv:2611.05234, pero los valores numericos no se incluyen en la informacion proporcionada, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 1,2B parametros ocupan aproximadamente 2,4 GB de pesos; con cache KV para 4096 tokens (4 cabezas KV, 16 cabezas, dimension de cabeza 128) el consumo adicional es de unos cientos de MB. En la practica, se recomienda reservar entre 4 y 6 GB de VRAM en BF16.
- En FP32 (formato de almacenamiento del checkpoint) los pesos ocupan unos 4,8 GB, por lo que la carga requiere al menos 6-8 GB antes de convertir a BF16.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090) puede ejecutar el modelo en BF16. Para servir en produccion con varias peticiones concurrentes se recomienda A100, H100 o L40S.
- Cabe en GPU consumer: si, en todas las GPU con 8 GB o mas de VRAM en BF16.
- Opciones de despliegue: la model card solo documenta `transformers` (version 5.12.1) con `trust_remote_code=True`, `safetensors` y `accelerate`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y la naturaleza de codigo personalizado (`custom_code`) hace probable que estos motores requieran adaptaciones.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| ARLoop-1.3B | 1,2B | 4096 | Looped transformer con attention residuals (24 capas fisicas, 72 efectivas) | Apache 2.0 | Base preentrenado, 500.000 M tokens, 23 checkpoints intermedios |
| SmolLM2-1.7B | 1,7B | 8192 | Transformer denso estandar | Apache 2.0 | Base/instruct, tokenizer compartido con ARLoop; mas parametros y contexto |
| Qwen2.5-1.5B | 1,5B | 32768 | Transformer denso con GQA | Apache 2.0 | Multilingue, contexto mucho mayor, versiones base e instruct |
| Llama-3.2-1B | 1,2B | 131072 | Transformer denso con GQA | Llama 3.2 Community License | Contexto muy superior; licencia con restricciones de uso |

La comparacion se limita a parametros, contexto y licencia porque no hay datos de benchmarks publicados en la informacion disponible para ARLoop. Frente a estos modelos, ARLoop destaca por su arquitectura recurrente y por la publicacion de checkpoints intermedios, pero ofrece un contexto de 4096 tokens, muy inferior al de sus alternativas, y solo soporta ingles.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no sigue instrucciones ni mantiene conversaciones de forma fiable sin post-training.
- Solo soporta ingles segun la metadata; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a un modelo de completado sin alineacion; no debe usarse en produccion sin validacion y salvaguardas.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Requiere `trust_remote_code=True` y una version especifica de `transformers` (5.12.1), lo que implica ejecutar codigo del autor y limita la portabilidad a otros motores de inferencia.
- El repositorio pesa 116 GB por la publicacion de 23 checkpoints intermedios; la descarga completa es costosa en disco y ancho de banda.
- No se documentan sesgos especificos ni composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo y contaminacion.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo sin alinear, el usuario asume la responsabilidad sobre los contenidos generados.
- No hay datos publicados de benchmarks en la informacion disponible, por lo que no es posible validar su calidad frente a alternativas sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osunlp/ARLoop-1.3B
- Paper (arXiv): https://arxiv.org/abs/2611.05234
- Codigo en GitHub: https://github.com/OSU-NLP-Group/ARLoop
- Checkpoint final: https://huggingface.co/osunlp/ARLoop-1.2B/tree/main
- Checkpoint intermedio de ejemplo (paso 238.417): https://huggingface.co/osunlp/ARLoop-1.2B/tree/step-238417
- Checkpoint intermedio (paso 10.000): https://huggingface.co/osunlp/ARLoop-1.2B/tree/step-010000
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
