# nkkbr/Mini-K3-1H-attn-4mla-nope-v2

## Resumen

Mini-K3-1H-attn-4mla-nope-v2 es un checkpoint de preentrenamiento de la familia Mini-K3-1H, publicado por el usuario nkkbr en HuggingFace. Se trata de un proxy de investigación de aproximadamente 981.692.224 parámetros lógicos (318.467.904 activados por token) que reproduce a pequeña escala los operadores de la arquitectura Kimi-K3: Gated MLA, Attention Residuals por bloques, Stable LatentMoE, activaciones SiTU, puertas de salida y Quantile Balancing. El modelo forma parte de una comparación controlada de 20 arquitecturas en la que se modifican deliberadamente la proporción KDA/MLA, la granularidad de decaimiento, la longitud de convolución o la codificación posicional.

Este repositorio concreto corresponde a la variante attn-4mla-nope: no incluye ninguna capa KDA, emplea Gated MLA con codificación posicional NoPE en sus 13 capas decoder y tiene un tamaño de bloque de Attention Residuals de 4. Por tanto, no es un modelo destinado a uso conversacional ni a producción, sino una pieza dentro de un experimento de ablación arquitectónica reproducible.

Su relevancia es puramente investigadora: permite estudiar el comportamiento de componentes de Kimi-K3 a escala de mil millones de parámetros, con inicialización canónica por nombre y forma (semilla base 20260914) que garantiza que los parámetros compartidos entre arquitecturas comiencen siendo idénticos byte a byte. El modelo se distribuye sin posentrenamiento, sin licencia declarada y sin evaluación en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE disperso (Stable LatentMoE) y Gated MLA; sin capas KDA |
| Parametros totales | 981.692.224 (logicos) |
| Parametros activos | 318.467.904 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), con codigo PyTorch propio |
| Capas decoder | 13 (0 KDA + 13 Gated MLA) |
| Indices de capas Gated MLA | [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] |
| Ancho oculto / cabezas de atencion / ancho de cabeza KDA | 1024 / 12 / 128 |
| Modo posicional de MLA | NoPE, con output gate activada |
| Capas densas antes de MoE | 1 |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Ancho oculto de experto enrutado | 512 |
| Tamano de bloque de Attention Residuals | 4 |
| Vocabulario / BOS / EOS de generacion / PAD | 163840 / 163584 / 163586 / 163839 |
| Precision de parametros | BF16 (decaimiento KDA, convolucion, normalizacion y estado de control del router en FP32) |
| Tamano del repositorio | 11,9 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 13 capas en el que se ha eliminado por completo el operador KDA: las 13 capas usan Gated MLA, con un ancho oculto de 1024, 12 cabezas de atencion y un ancho de cabeza de 128. La codificacion posicional de MLA es NoPE (sin codificacion posicional explicita) y la puerta de salida esta activada. Tras una unica capa densa se inserta el bloque MoE, formado por 64 expertos enrutados y 2 compartidos, con top-k de 4 y ancho oculto de experto de 512. El bloque de Attention Residuals tiene tamano 4. El vocabulario es de 163840 entradas.

El entrenamiento se realizo sobre 8.000.634.880 objetivos de next-token validos, en 12.208 pasos de optimizador, con secuencia de 8.192 tokens. La receta combina Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de matrices y AdamW como respaldo para vectores y embeddings, con weight decay de 0,1, QK-Clip por cabeza, decaimiento coseno y un 1 % de warmup lineal. El enrutamiento usa Quantile Balancing con histograma en linea de 1.000 bins, seleccion de expertos mediante scores sesgados y combinacion con scores sigmoide sin sesgo renormalizados. No se aplico ningun posentrenamiento (ni RLHF ni DPO). Los documentos empaquetados estan aislados de forma estricta: MLA usa una mascara causal bloqueada por documento y el estado recurrente de KDA y el historial de convolucion corta Q/K/V se reinician en cada frontera de segmento. El tag final (`checkpoint-tokens-016000000000-final`) se creara solo tras procesar exactamente 16.000.000.000 objetivos de perdida validos.

## Capacidades

- Generacion de texto autoregresiva como modelo base preentrenado (no ajustado por instrucciones).
- Razonamiento de siguiente token sobre secuencias de hasta 8.192 tokens.
- Modelado de lenguaje con vocabulario de 163.840 entradas.
- Investigacion de arquitecturas: permite comparar variantes de MLA, KDA, cuantizacion posicional, convolucion corta y decaimiento dentro de un conjunto controlado de 20 arquitecturas.
- Reproducibilidad experimental: inicializacion canonica por nombre y forma, con semilla base 20260914, que garantiza igualdad byte a byte en parametros compartidos.
- Analisis de enrutamiento MoE: seleccion top-k de 4 sobre 64 expertos enrutados con Quantile Balancing de 1.000 bins.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso orientado a tareas.
- No dispone de capacidades de vision ni de audio.
- Idiomas soportados: no disponible.
- No incorpora modo de pensamiento (thinking mode) ni ningun tipo de posentrenamiento.

## Casos de uso

- Ablacion arquitectonica controlada: el modelo sirve para medir el efecto de sustituir KDA por Gated MLA con NoPE frente a las otras 19 variantes de la familia, manteniendo fijos el dataset, el orden de la mezcla y la inicializacion.
- Estudio del enrutamiento MoE: con 64 expertos enrutados y top-k 4, permite analizar la especializacion de expertos, el equilibrio de carga y el efecto de Quantile Balancing a escala de mil millones de parametros.
- Analisis de estabilidad de optimizadores: la combinacion de Muon por cabeza para Q/K/V, Muon general y AdamW para vectores/embeddings permite estudiar el comportamiento de estos optimizadores en un transformer pequeno con MoE.
- Reproduccion de experimentos: los manifiestos JSON del repositorio incluyen revisiones de codigo congeladas, cuotas de tokens, hashes de planificacion e hiperparametros, lo que facilita replicar el entrenamiento en un entorno controlado.
- Baseline para estudios de escalado: al ser un proxy de ~981 M de parametros, sirve como punto de referencia inferior antes de extrapolar conclusiones a Kimi-K3 completo.
- Punto de partida para fine-tuning experimental: el checkpoint puede usarse como inicializacion para probar tecnicas de ajuste, siempre asumiendo que carece de posentrenamiento y de licencia declarada.
- Validacion de infraestructura de entrenamiento: `initialize_model.py` y `smoke_test.py` permiten verificar la carga del modelo y del codigo auxiliar antes de lanzar corridas mas costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se trata de un checkpoint de investigacion intermedio que aun no ha sido evaluado en tareas downstream. Solo se registran NLL y perplejidad de desarrollo en W&B y en las metricas JSONL de la corrida, cuyos valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para los pesos en BF16 (981,7 M de parametros) y cerca de 4 GB si se cargan en FP32, sin contar activaciones ni el estado del runtime.
- VRAM adicional para contexto: variable segun la implementacion; las activaciones con secuencia de 8.192 tokens y vocabulario de 163.840 pueden elevar el consumo por encima de los pesos.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cualquier GPU con al menos 8-12 GB de VRAM deberia poder alojar los pesos en BF16.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se use la implementacion PyTorch incluida y no se anada un contexto desproporcionado.
- Opciones de despliegue: el repositorio proporciona `modeling_mini_k3.py` y `configuration_mini_k3.py` como paquete autonomo de PyTorch; `initialize_model.py` y `smoke_test.py` cubren el uso local. No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ninguna otra plataforma.
- Cuantizaciones GGUF, AWQ o GPTQ: no disponibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de benchmarks ni datos comparativos, y la busqueda web realizada no devolvio referencias tecnicas relevantes. Por tanto, no es posible establecer una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Mini-K3-1H-attn-4mla-nope-v2 | 981.692.224 (318.467.904 activos) | 8.192 | MoE con Gated MLA y NoPE, sin KDA | no disponible | Checkpoint de investigacion, sin posentrenamiento ni evaluacion |
| Alternativas de ~1B tipo TinyLlama, Qwen2.5-1.5B o Llama 3.2-1B | no disponible | no disponible | no disponible | no disponible | Datos no presentes en la informacion proporcionada; se requeriria verificar sus fichas oficiales |
| Otras variantes de la familia Mini-K3-1H | 981.692.224 (logicos) | 8.192 | Variantes con distintas proporciones KDA/MLA y modos posicionales | no disponible | Comparables internos del mismo estudio de ablacion de 20 arquitecturas |

## Limitaciones y advertencias

- Es un modelo exclusivamente preentrenado: no ha recibido ajuste por instrucciones, RLHF ni DPO, por lo que no debe tratarse como un asistente conversacional.
- No ha sido evaluado en tareas downstream; no existen datos publicos de MMLU, HumanEval, GSM8K ni similares.
- Es un proxy de investigacion de tamano reducido; los rankings de arquitectura obtenidos a esta escala y con 8.192 tokens de entrenamiento necesitan confirmacion antes de extrapolarse a Kimi-K3 completo.
- Las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas, segun advierte la propia model card.
- La licencia no esta declarada, lo que genera incertidumbre juridica sobre cualquier uso comercial del checkpoint.
- El repositorio no redistribuye el texto de los datasets originales; cada fuente conserva sus propios terminos y licencias.
- No se publican los tipos de cuantizacion ni formatos GGUF, AWQ o GPTQ, lo que limita su despliegue en herramientas estandar de inferencia.
- El estado del optimizador no se publica, por lo que no es posible reanudar el entrenamiento exactamente desde el punto guardado.
- Los idiomas soportados no se especifican.
- Solo se ofrece una libreria de inferencia (PyTorch con codigo propio), sin integracion declarada con vLLM, TGI, llama.cpp u Ollama.

## Enlaces

- HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-attn-4mla-nope-v2
- El repositorio incluye como archivos de referencia `ARCHITECTURE_PACKAGE_README.md`, `ARCHITECTURE.md`, `VARIANT.md`, `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py` y `smoke_test.py`.
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
