# keras/qwen3_8_27b

## Resumen

`keras/qwen3_8_27b` es una implementación en KerasHub del modelo Qwen3.5, publicada por el equipo de Keras. El identificador del repositorio sugiere una variante de la familia Qwen3.5 con una configuracion de aproximadamente 8.000 millones de parametros activos y 27.000 millones de parametros totales, aunque la model card no confirma explicitamente esta correspondencia entre el nombre y los parametros. El modelo se distribuye como un `CausalLM` para generacion de texto y esta pensado para ejecutarse indistintamente sobre los backends JAX, TensorFlow y PyTorch gracias a la abstraccion multi-backend de Keras 3.

La relevancia tecnica del modelo reside en su arquitectura hibrida: combina capas de atencion lineal con capas de atencion completa en un patron de tres capas lineales por cada capa completa (48 lineales y 16 completas sobre 64 capas totales). Esta mezcla busca reducir el coste computacional y de memoria del mecanismo de atencion en contextos largos sin renunciar por completo a la atencion cuadratica clasica. Ademas, la configuracion incluye un codificador visual (`Qwen3_5VisionEncoder`), lo que apunta a un modelo multimodal con entrada de imagen.

El repositorio ocupa 109,4 GB y no registra descargas ni likes en el momento de la consulta, lo que es coherente con una publicacion reciente (creada el 4 de noviembre de 2026) y con una model card generada automaticamente que el autor aun no ha completado. La licencia y los idiomas soportados no estan declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y atencion completa (Qwen3.5) |
| Parametros totales | no disponible (el nombre del repo sugiere 27B, sin confirmar) |
| Parametros activos | no disponible (el nombre del repo sugiere 8B, sin confirmar) |
| Longitud de contexto | no disponible (sliding window de 32768 tokens; rope_max_wavelength 10.000.000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio KerasHub, 109,4 GB) |
| Vocabulario | 248.320 tokens |
| Capas | 64 (48 de atencion lineal, 16 de atencion completa) |
| Dimension oculta | 5120 |
| Cabezas de consulta / KV | 24 / 4 |
| Dimension de cabeza | 256 |
| Dimension intermedia | 17.408 |
| Precision declarada | float32 (DTypePolicy de Keras) |
| Codificador visual | 27 capas, hidden 1152, 16 cabezas, patch 16, merge espacial 2 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer causal con un esquema hibrido de atencion. De las 64 capas, 48 utilizan atencion lineal y 16 utilizan atencion completa, siguiendo un patron periodico de tres capas lineales seguidas de una capa completa. Las capas lineales emplean 16 cabezas de clave y 48 cabezas de valor con dimension 128 y una convolucion de kernel 4, mientras que las capas de atencion completa usan 24 cabezas de consulta y 4 cabezas de clave/valor con dimension 256, es decir, una configuracion de grouped-query attention con un ratio de 6:1. La atencion completa aplica una ventana deslizante de 32.768 tokens.

El componente posicional combina RoPE parcial (factor 0,25 sobre las dimensiones de cada cabeza) con una longitud de onda maxima de 10.000.000 y sin factor de escalado (`rope_scaling_factor: 1.0`). La configuracion incluye ademas una seccion mrope de `[11, 11, 10]`, habitual en modelos multimodales para codificar posiciones en texto e imagen de forma separada. El codificador visual procesa parches de 16x16 con un parche temporal de 2 y un merge espacial de 2, y proyecta a la dimension oculta del modelo (5120) mediante `out_hidden_size`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva como tarea principal (`CausalLM`).
- Procesamiento de imagenes mediante el codificador visual integrado, lo que habilita tareas de vision-lenguaje.
- Razonamiento y generacion de codigo, asumiendo las capacidades habituales de la familia Qwen, aunque no se documentan explicitamente en la model card.
- Soporte de contextos largos gracias a la ventana deslizante de 32.768 tokens y a la atencion lineal en la mayoria de capas.
- Ejecucion multi-backend: JAX, TensorFlow y PyTorch a traves de KerasHub.
- Soporte de tool calling, agentes y modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia multimodal documento-imagen: el codificador visual permite procesar capturas, escaneos o diagramas junto con texto para extraer informacion estructurada, aprovechando la proyeccion a la dimension oculta del modelo.
- Procesamiento de contextos largos en analisis de codigo: con una ventana deslizante de 32.768 tokens y atencion lineal en la mayoria de capas, el modelo puede recorrer repositorios o ficheros extensos con menor coste de memoria que un transformer denso equivalente.
- Despliegue en entornos multi-framework: al ser compatible con JAX, TensorFlow y PyTorch via KerasHub, encaja en infraestructuras existentes que ya usan Keras 3 sin necesidad de reescribir el pipeline de inferencia.
- Prototipado e investigacion en arquitecturas hibridas: sirve como referencia ejecutable para estudiar el comportamiento de la mezcla atencion lineal/atencion completa en tareas de generacion.
- Generacion de texto asistida en aplicaciones de escritura: el vocabulario de 248.320 tokens y la ventana de 32.768 tokens permiten mantener coherencia en documentos de extension media.
- Evaluacion comparativa de backends: util para medir diferencias de rendimiento entre JAX, TensorFlow y PyTorch sobre el mismo grafo de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 109,4 GB y la configuracion declara float32, lo que implica un requisito de memoria muy elevado en precision nativa.
- GPU recomendadas: no disponibles. Por volumen de pesos, un despliegue en precision completa requeriria multiples aceleradores de clase A100/H100.
- Compatibilidad con GPU de consumo: no confirmada; sin cuantizaciones publicadas no puede garantizarse su ejecucion en RTX 4090 o inferiores.
- Opciones de despliegue: KerasHub sobre JAX, TensorFlow o PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| keras/qwen3_8_27b | no confirmado (nombre sugiere 8B activos / 27B totales) | ventana deslizante 32.768 | no disponible | KerasHub | Hibrido lineal/completo, vision integrada |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos equivalentes en la informacion proporcionada |

## Limitaciones y advertencias

- La model card ha sido generada automaticamente y el autor no la ha completado; faltan datos esenciales como licencia, idiomas y regimen de entrenamiento.
- La licencia no esta declarada, por lo que no puede confirmarse el uso comercial.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinacion.
- La correspondencia entre el nombre del repositorio (8/27B) y los parametros reales no esta verificada en la documentacion.
- El tamano del repositorio (109,4 GB) y la precision float32 declarada implican requisitos de hardware muy altos para inferencia directa.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.
- El soporte multilingue y de tool calling no esta confirmado.
- El modelo se publico con cero descargas y cero likes, sin validacion comunitaria conocida.

## Enlaces

- HuggingFace: https://huggingface.co/keras/qwen3_8_27b
- Documentacion KerasHub Qwen3.5: https://keras.io/api/keras_hub/models/qwen3_5
- Keras: https://keras.io/
- Keras 3 multi-backend: https://keras.io/keras_3/
- Keras en Wikipedia: https://en.wikipedia.org/wiki/Keras
- Documentacion de model cards de HuggingFace: https://huggingface.co/docs/hub/model-cards
