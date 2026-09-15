# aoiandroid/Qwen3.5-0.8B-Base

## Resumen

Qwen3.5-0.8B-Base es la variante más pequena de la familia Qwen3.5, desarrollada por el Qwen Team (Alibaba). Se trata de un modelo de lenguaje causal con encoder de vision, publicado en formato Hugging Face Transformers como modelo unicamente preentrenado: sus usos previstos son el fine-tuning, los experimentos de aprendizaje en contexto y la investigacion, no la interaccion directa. El repositorio analizado es una copia subida por el usuario aoiandroid con 873.438.784 parametros reales en safetensors y 1,8 GB de peso.

La relevancia de esta variante esta en su arquitectura hibrida: combina capas de Gated DeltaNet (atencion lineal recurrente) con capas de Gated Attention clasica, lo que reduce el coste de memoria a contextos muy largos. El modelo declara 262.144 tokens de contexto nativo, extensible hasta 1.010.000, con un vocabulario de 248.320 entradas y una dimension oculta de 1024 en 24 capas. Ademas, incorpora un encoder de vision, por lo que su pipeline oficial es image-text-to-text.

Al ser un modelo base de menos de mil millones de parametros, su interes practico no es competir en benchmarks de razonamiento, sino servir como punto de partida barato para ajuste fino (incluido LoRA) y para despliegues en hardware muy limitado, incluido CPU o GPU de gama de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con encoder de vision: 6 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 873.438.784 (aproximadamente 0,87 B) segun los pesos en safetensors |
| Parametros activos | no disponible (la model card de la familia menciona MoE disperso, pero no se detalla un ratio de expertos para esta variante de 0,8 B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en los metadatos de Hugging Face; la model card de la familia Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers, vLLM y SGLang) |
| Dimension oculta | 1024 |
| Numero de capas | 24 |
| Vocabulario | 248.320 (con padding), embeddings atados a la salida |
| Dimension intermedia FFN | 3584 |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal hibrido de 24 capas con un patron repetido seis veces: tres bloques de Gated DeltaNet seguidos de FFN, y un bloque de Gated Attention seguido de FFN. La parte DeltaNet usa 16 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La parte de atencion clasica usa 8 cabezas para Q y 2 para KV, con dimension de cabeza 256 y dimension de RoPE de 64. La FFN tiene dimension intermedia 3584 y la salida del modelo esta atada a los embeddings de tokens. Esta mezcla implica que solo 6 de las 24 capas mantienen una cache KV que crece con el contexto, mientras que las 18 capas DeltaNet mantienen un estado recurrente de tamano constante.

El modelo se entrena en dos fases, preentrenamiento y postentrenamiento, e incluye un encoder de vision con fusion temprana de tokens multimodales. La model card indica que se entreno con MTP (multi-token prediction) en varios pasos, lo que habilita tecnicas de decodificacion especulativa. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el detalle de las etapas de RLHF o DPO mas alla de la mencion generica a "reinforcement learning escalado" en la familia Qwen3.5. Un detalle relevante para ajuste fino: los tokens de control `<|im_start|>` y `<|im_end|>` se entrenaron para permitir PEFT estilo LoRA con la plantilla de chat oficial sin necesidad de reentrenar los embeddings, lo que es significativo dado el tamano del vocabulario.

## Capacidades

- Generacion de texto autoregresiva como modelo base preentrenado, sin ajuste de instrucciones.
- Comprension de imagenes mediante encoder de vision (pipeline image-text-to-text), con fusion temprana de tokens multimodales.
- Razonamiento, codigo y matematicas: la familia Qwen3.5 declara paridad entre generaciones en estos benchmarks, pero no hay resultados publicados para esta variante concreta.
- Soporte de contexto muy largo: 262.144 tokens nativos y hasta 1.010.000 en extension.
- Capacidad multilingue declarada a nivel de familia (201 idiomas y dialectos), sin desglose por variante.
- Multi-token prediction (MTP) entrenado en varios pasos, util para decodificacion especulativa.
- Compatibilidad con tool calling y flujos de agente: no confirmada explicitamente para este modelo base; la familia la declara a nivel general, pero al ser un checkpoint preentrenado no se garantiza un comportamiento fiable de function calling sin ajuste posterior.
- PEFT eficiente con la plantilla de chat oficial gracias a los tokens de control preentrenados.

## Casos de uso

- Ajuste fino supervisado para dominios verticales: al ser un checkpoint base de 0,87 B con licencia Apache-2.0, se puede entrenar con SFT sobre datos propios (legal, sanitario, atencion al cliente) en una sola GPU consumer, sin coste de licencia.
- Adaptacion con LoRA sobre la plantilla de chat oficial: los tokens `<|im_start|>` y `<|im_end|>` ya estan entrenados, de modo que no hace falta ajustar la capa de embeddings ni asumir el coste asociado al vocabulario de 248.320 entradas.
- Extraccion de informacion de documentos con imagenes: gracias al encoder de vision, se puede ajustar para tareas de OCR ligero, clasificacion de capturas o conversion de formularios escaneados a JSON.
- Prototipado rapido de pipelines multimodales: sirve como sustituto barato de modelos de vision-lenguaje de mayor tamano durante el desarrollo, antes de escalar a variantes superiores de Qwen3.5 con el mismo tokenizador y plantilla.
- Despliegue en el borde o en CPU: con cuantizacion a 8 o 4 bits el modelo ocupa menos de 1 GB, lo que permite ejecutarlo en portatiles, mini-PC o dispositivos con GPU integrada para tareas de baja latencia y sin conexion.
- Generacion aumentada por recuperacion (RAG) sobre corpus extensos: los 262.144 tokens de contexto nativo permiten insertar muchos fragmentos recuperados en una sola llamada sin trocear en exceso.
- Investigacion en arquitecturas hibridas: el patron Gated DeltaNet + Gated Attention a escala 0,8 B es un banco de pruebas asequible para estudiar el comportamiento de la atencion lineal frente a la atencion completa.
- Distilacion y generacion de datos sinteticos: el modelo puede usarse para etiquetar o generar datos de entrenamiento a gran escala con un coste de inferencia muy bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la familia Qwen3.5 afirma de forma generica paridad con Qwen3 y mejoria frente a Qwen3-VL en razonamiento, codigo, agentes y comprension visual, pero no aporta cifras concretas ni resultados especificos para la variante de 0,8 B. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 1,75 GB solo de pesos; con cache KV corta, unos 3 GB en total.
- VRAM estimada en INT8: en torno a 0,9 GB de pesos; en INT4, unos 0,45 GB (valores calculados a partir del numero de parametros, no publicados por el autor).
- Cache KV: estimacion propia a partir de la configuracion publicada. Solo 6 de las 24 capas usan atencion completa, con 2 cabezas KV de dimension 256, lo que da unos 12 KB por token en FP16; a 262.144 tokens serian aproximadamente 3,1 GB. Las 18 capas Gated DeltaNet mantienen un estado recurrente de tamano constante, independiente de la longitud de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas, como RTX 3060, RTX 4060, RTX 4070 o superiores, es suficiente incluso a maxima longitud de contexto. En GPU de datacenter (A100, H100, L40S) el modelo queda muy sobredimensionado en memoria y solo tendria sentido para lotes muy grandes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con cuantizacion.
- Opciones de despliegue: Hugging Face Transformers, vLLM y SGLang son compatibles segun la model card. No hay confirmacion de soporte para llama.cpp, Ollama, TGI ni de pesos GGUF publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Base | 0,87 B | 262.144 nativos, hasta 1.010.000 | Texto e imagen | Apache-2.0 | Peso publicado en safetensors |
| Qwen3-0.6B | 0,6 B | 32.768 nativos (extensible con YaRN) | Solo texto | Apache-2.0 | safetensors y GGUF |
| Qwen2.5-1.5B | 1,5 B | 32.768 nativos | Solo texto | Apache-2.0 | safetensors y GGUF |
| SmolVLM-500M-Instruct | 0,5 B | no disponible | Texto e imagen | Apache-2.0 | safetensors |

Nota: los datos de los modelos comparados proceden de sus fichas publicas y deben verificarse antes de tomar decisiones de produccion. No se dispone de resultados de benchmarks comparativos para esta variante de Qwen3.5, por lo que la comparacion se limita a parametros, contexto, modalidad y licencia. La ventaja diferencial de Qwen3.5-0.8B-Base frente a las alternativas de texto es la ventana de contexto (hasta un orden de magnitud superior) y el encoder de vision; su desventaja es que es un checkpoint base, no ajustado a instrucciones, y que carece de cuantizaciones publicadas.

## Limitaciones y advertencias

- Es un modelo unicamente preentrenado: no sigue instrucciones de forma fiable ni mantiene conversaciones coherentes sin un ajuste posterior. La propia model card desaconseja la interaccion directa.
- Riesgo elevado de alucinacion y de continuaciones incoherentes en uso zero-shot, inherente a los checkpoints base.
- No hay datos publicados sobre sesgos, composicion del dataset ni evaluaciones de seguridad para esta variante concreta.
- No se especifican los idiomas realmente soportados en los metadatos de Hugging Face; la cifra de 201 idiomas corresponde a la familia, no a una evaluacion de esta variante.
- No hay resultados de benchmarks publicados, por lo que no es posible verificar las afirmaciones de rendimiento de la model card a esta escala.
- El repositorio analizado es una subida de terceros (aoiandroid) con 0 descargas y 0 me gusta. Conviene verificar la procedencia de los pesos y contrastar con el repositorio oficial de Qwen antes de usarlos en produccion.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a cuantizar por cuenta propia si se busca despliegue en hardware muy limitado.
- La licencia Apache-2.0 permite uso comercial, pero el enlace de licencia apunta al repositorio oficial de Qwen, no al de esta copia; conviene revisar los terminos vigentes en la fuente original.
- La ventana de contexto de 262.144 tokens es nominal: no hay evidencia publicada de la calidad de recuperacion a esa longitud en un modelo de 0,87 B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aoiandroid/Qwen3.5-0.8B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Repositorio oficial de referencia (segun el enlace de licencia): https://huggingface.co/Qwen/Qwen3.5-0.8B-Base

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos trataban sobre VLC Media Player y no guardan relacion con la ficha.
