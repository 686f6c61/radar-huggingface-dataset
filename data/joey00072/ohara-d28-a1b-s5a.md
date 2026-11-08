# joey00072/ohara-d28-a1b-s5a

## Resumen

ohara-d28-a1b-s5a es un checkpoint de preentrenamiento de fase 1 (contexto de 4k tokens) del modelo hibrido causal encoder-decoder de la familia ohara, desarrollado por el usuario joey00072. Se trata de un modelo base, no afinado por instrucciones, con 23,85 mil millones de parametros totales y aproximadamente 0,98 mil millones de parametros activos en la matriz troncal (1,25 mil millones incluyendo la cabeza LM). Su relevancia radica en que combina varias tecnicas avanzadas de arquitectura en un unico diseno experimental: atencion hibrida (ventana deslizante, global puenteada por KV y atencion token-sparse), residuales mHC, memoria de n-gramas y una capa MoE con 256 expertos y top-8 mas un experto compartido.

El modelo se distribuye en formato safetensors con la libreria propia `ohara` y un repositorio de 106,6 GB. El checkpoint `main` corresponde al paso 238, con 2.994.733.056 tokens procesados (hito del 100 por ciento) y una perdida de entrenamiento de 1,3402 nats. Utiliza el tokenizador de Qwen3.

Al ser un checkpoint de preentrenamiento temprano y sin datos publicados de evaluacion, su interes es principalmente de investigacion: sirve para estudiar el comportamiento de arquitecturas hibridas MoE con atencion dispersa y para reproducir el pipeline de entrenamiento del proyecto ohara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido causal encoder-decoder (ohara_hybrid) con atencion SWA + global puenteada por KV + token-sparse, residuales mHC, memoria de n-gramas y MoE |
| Parametros totales | 23.846.942.486 (23,85B) |
| Parametros activos | ~0,98B en la matriz troncal; 1,25B incluyendo la cabeza LM |
| Longitud de contexto | 4096 tokens (fase 1 de preentrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tokenizador Qwen3) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | Qwen3 |
| Paso de entrenamiento | 238 |
| Tokens entrenados | 2.994.733.056 |
| Perdida de entrenamiento | 1,3402 nats |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida causal encoder-decoder denominada `d28 final_v2`. Combina tres mecanismos de atencion: ventana deslizante (SWA), atencion global puenteada por KV y atencion token-sparse. Ademas incorpora residuales mHC (multi-head connections), una memoria de n-gramas y una capa de mezcla de expertos (MoE) con 256 expertos, enrutamiento top-8 y un experto compartido. La matriz troncal activa ronda los 0,98B de parametros, mientras que el total asciende a 23,85B, lo que da una relacion de activacion muy baja (en torno al 4 por ciento) y sugiere un coste de inferencia cercano al de un modelo de aproximadamente 1B de parametros.

El entrenamiento corresponde a la fase 1 de preentrenamiento con contexto de 4k tokens. El checkpoint `main` esta en el paso 238, con 2.994.733.056 tokens vistos y una perdida de 1,3402 nats. No se documentan en la informacion disponible la composicion del dataset, el uso de RLHF o DPO, ni detalles sobre el numero total de tokens previstos en fases posteriores. El autor mantiene las tres ultimas revisiones como ramas `step-NNNNNN` y conserva las etiquetas `pre_decay` y `final`.

## Capacidades

- Generacion de texto autoregresiva como modelo base de lenguaje.
- Razonamiento y modelado de lenguaje general derivados del preentrenamiento (sin ajuste por instrucciones).
- Procesamiento de secuencias de hasta 4096 tokens en esta fase.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base sin ajuste).
- Capacidades multilingues: no documentadas; depende del tokenizador Qwen3.
- Capacidades especiales: memoria de n-gramas integrada y atencion dispersa como innovaciones arquitectonicas; sin vision ni audio documentados.

## Casos de uso

- Investigacion en arquitecturas hibridas: el modelo permite estudiar el comportamiento de la combinacion SWA + global + token-sparse en tareas de modelado de lenguaje, comparandola con transformers densos de tamano equivalente.
- Experimentos con MoE de grano fino: con 256 expertos y top-8, sirve para analizar el enrutamiento, el balanceo de carga y la eficiencia de activacion en regimen de preentrenamiento temprano.
- Reproduccion de pipelines de entrenamiento: el repositorio ohara y la funcion `load_hf` permiten cargar el checkpoint y continuar el preentrenamiento o evaluar el estado intermedio del paso 238.
- Evaluacion de memoria de n-gramas: util para medir como la memoria de n-gramas afecta a la perplejidad y a la coherencia en contextos de 4k tokens.
- Fine-tuning posterior como base: al ser un checkpoint base, puede servir de punto de partida para ajustes supervisados en tareas concretas, aunque su contexto de 4k limita aplicaciones de documento largo.
- Estudio de eficiencia computacional: la baja relacion de parametros activos (0,98B sobre 23,85B) lo hace adecuado para medir throughput y latencia frente a modelos densos de tamano comparable.
- Docencia y divulgacion tecnica: como ejemplo abierto de implementacion de atencion hibrida y MoE en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en safetensors ocupa 106,6 GB; en FP16 requeriria aproximadamente 48 GB solo para pesos, mas estados de activacion y cache KV. Con cuantizacion a 8 bits se situaria en torno a 24 GB y a 4 bits en torno a 12-13 GB, aunque no se documentan tipos de cuantizacion soportados.
- GPU recomendadas: para el checkpoint completo en precision nativa, A100 80 GB o H100 80 GB. Para cuantizaciones agresivas, RTX 4090 (24 GB) o RTX 3090 (24 GB) podrian ser suficientes, sin datos confirmados.
- Cabe en GPU de consumo: probablemente en RTX 4090/3090 con cuantizacion a 4-8 bits, no confirmado por el autor.
- Opciones de despliegue: la libreria propia `ohara` (instalacion via `pip install -e ohara` y carga con `ohara.pretrain.export.load_hf`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohara-d28-a1b-s5a | 23,85B | ~0,98B (1,25B con LM head) | 4096 | no disponible | Hugging Face (joey00072) |
| ohara-d28-a1b-s3a | ~24B (segun busqueda) | no disponible | no disponible | no disponible | Hugging Face (joey00072) |
| Alternativas MoE de grano fino de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni esta alineado para uso conversacional.
- Contexto limitado a 4096 tokens en esta fase, insuficiente para documentos largos o conversaciones extensas.
- Checkpoint temprano (paso 238, unos 3.000 millones de tokens): la calidad del modelado de lenguaje es limitada en comparacion con modelos totalmente entrenados.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: el comportamiento multilingue es incierto pese al tokenizador Qwen3.
- Riesgo de alucinacion elevado por tratarse de un modelo base de baja madurez.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento.
- Ecosistema limitado: depende de la libreria `ohara`, sin soporte documentado en frameworks de inferencia estandar.
- Tamano del repositorio elevado (106,6 GB) y pocas descargas, lo que implica poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joey00072/ohara-d28-a1b-s5a
- Checkpoint hermano s3a: https://huggingface.co/joey00072/ohara-d28-a1b-s3a
- Repositorio GitHub del proyecto: https://github.com/joey00072/ohara
