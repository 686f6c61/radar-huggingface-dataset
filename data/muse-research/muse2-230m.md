# Muse-research/Muse2-230M

## Resumen

Muse2-230M es un modelo de lenguaje compacto desarrollado por Muse Research, diseñado específicamente para inferencia en el edge y en dispositivos con recursos limitados. Forma parte de la familia Muse2, construida enteramente desde cero (arquitectura, tokenizador y stack de inferencia) sin depender del ecosistema `transformers`. El modelo combina un diseño híbrido estilo LFM2 con convoluciones causales cortas y atención grouped-query, junto con MLP SwiGLU paralelo fusionado, para maximizar la eficiencia en hardware restringido.

Con 196,1 millones de parámetros reales (230M nominales) y una ventana de contexto de 8k tokens (extensible hasta 128k), el modelo está optimizado para tareas de chat asistente, formateo disciplinado y extracción estructurada de logs a JSON. La versión Instruct se alineó mediante SFT con enmascaramiento de pérdida solo en completaciones, sin RLHF ni DPO. Su relevancia radica en ofrecer una alternativa abierta y reproducible para desarrollo de modelos pequeños desde cero, con licencia Apache-2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida convolucion/atencion (LFM2-style): 8 bloques de convolucion depthwise causal (kernel 3) + 6 bloques de atencion completa, GQA 16 query / 8 key-value heads, RoPE theta 1e6, RMSNorm, MLP SwiGLU paralelo fusionado (hidden 1024, ff 2560), embeddings compartidos |
| Parametros totales | 196.137.984 (230M nominales) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8k tokens (maximo 128k) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (tambien codigo fuente y texto matematico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien PyTorch) |

## Arquitectura y entrenamiento

Muse2-230M utiliza una arquitectura autorregresiva hibrida que intercala 8 bloques de convolucion depthwise causal de kernel 3 con 6 bloques de atencion completa, siguiendo el diseño LFM2. Cada bloque emplea atencion grouped-query con 16 cabezas de consulta y 8 de clave/valor, junto con MLP SwiGLU paralelo fusionado (dimension oculta 1024, FFN 2560). Se aplica RoPE con theta 1e6, RMSNorm y embeddings de entrada/salida compartidos. El tokenizador es un BPE byte-level de 65.536 tokens entrenado desde cero, con tokens de control estilo ChatML (pad=0, bos=1, eos=7).

El entrenamiento se realizo desde cero, sin usar codigo de `transformers`. La version Instruct se alineo mediante SFT con enmascaramiento de perdida solo en completaciones; no se aplico RLHF ni DPO. El conocimiento se corta a principios de 2024. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset en la informacion disponible.

## Capacidades

- Generacion de texto en ingles, incluyendo codigo fuente y texto matematico.
- Conversacion asistente multi-turno (version Instruct) con formato ChatML.
- Extraccion estructurada de logs a JSON, gracias a su entrenamiento en salida con formato disciplinado.
- Soporte de salida estructurada (JSON) segun la etiqueta `structured-output`.
- Inferencia en edge y on-device gracias a su diseño compacto y bajo consumo de memoria.
- Ejecucion en CPU y en GPUs de baja gama (se menciona una T4 en la nube para chat interactivo).
- No se mencionan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Extraccion de logs a JSON: el modelo puede procesar logs de aplicaciones y extraer campos relevantes en formato JSON siguiendo un esquema predefinido, gracias a su entrenamiento en salida estructurada y su ventana de contexto de 8k tokens. Es util para pipelines de observabilidad y depuracion automatizada.
- Chat asistente en dispositivos con recursos limitados: su tamaño compacto permite ejecutarlo en CPU o en GPUs de baja gama (como una T4), lo que lo hace adecuado para asistentes locales en entornos sin conexion o con restricciones de hardware.
- Investigacion educativa: al estar construido desde cero (arquitectura, tokenizador e inferencia), sirve como referencia para estudiar arquitecturas hibridas compactas y su implementacion en PyTorch puro.
- Base para fine-tuning: al ser Apache-2.0 y tener pesos abiertos, se puede adaptar a dominios especificos (por ejemplo, logs de un sistema propietario o vocabulario tecnico) mediante SFT adicional.
- Generacion de codigo en entornos sin conexion: puede generar fragmentos de codigo en ingles, util para asistentes de desarrollo en entornos aislados o con politicas de seguridad estrictas.
- Procesamiento de texto matematico: maneja notacion matematica basica, lo que permite su uso en herramientas educativas o de anotacion cientifica ligera.
- Prototipado rapido de aplicaciones conversacionales: su bajo coste de inferencia permite iterar rapidamente en el desarrollo de chatbots o asistentes de tareas especificas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: posible gracias a su tamaño compacto (el script `chat.py` permite ejecucion local en CPU).
- GPU recomendada: se menciona una T4 en la nube para chat interactivo; tambien deberia funcionar en GPUs consumer como RTX 3060 o superiores.
- VRAM estimada: para 196M parametros en fp32, aproximadamente 0,8 GB; en fp16, alrededor de 0,4 GB. Estas son estimaciones basadas en el tamaño, no datos oficiales.
- Opciones de despliegue: el paquete `muse` (PyTorch + safetensors) es el unico mencionado; no se indican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con otros modelos de tamaño similar (por ejemplo, TinyLlama, Phi-2 o SmolLM). La informacion disponible no incluye resultados de rendimiento, por lo que no es posible establecer una comparativa cuantitativa. Se recomienda evaluar el modelo en el caso de uso concreto antes de decidir su adopcion.

## Limitaciones y advertencias

- Sin alineacion de seguridad, red-teaming ni filtrado de contenido: el modelo puede producir salidas inexactas, sesgadas, repetitivas u objetables.
- Alucina hechos con facilidad a esta escala (196M parametros), por lo que no es fiable para tareas que requieran exactitud factual.
- Solo soporta ingles (aunque maneja codigo y matematicas); no hay soporte multilingue.
- La ventana de contexto efectiva es de 8k tokens; el maximo de 128k no esta documentado en cuanto a su implementacion o rendimiento.
- No apto para produccion sin evaluacion previa y guardarrailes de entrada/salida por parte del desarrollador.
- La licencia Apache-2.0 permite uso comercial, pero el desarrollador asume toda la responsabilidad sobre el despliegue y sus consecuencias.
- No se especifican los datos de entrenamiento ni su procedencia, por lo que no se puede verificar el cumplimiento de licencias de datasets upstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muse-research/Muse2-230M
- Version base (sin instrucciones): https://huggingface.co/Muse-research/Muse2-230M-Base
- No se han encontrado papers, blogs o repositorios adicionales en la busqueda web (los resultados sobre Muse Spark de Meta no estan relacionados con este modelo).
