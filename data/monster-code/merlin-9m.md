# Monster-Code/Merlin-9M

## Resumen

Merlin-9M es un modelo de lenguaje decoder-only de 8,85 millones de parametros entrenado desde cero por Monster-Code sobre el corpus Stew-10B (Wikipedia, Ultra-FineWeb y DCLM). Es un experimento de preentrenamiento a muy pequeña escala: el checkpoint publicado corresponde al paso 12.502, tras haber procesado aproximadamente 811 millones de tokens, es decir, una fraccion del corpus total. Su interes no reside en el rendimiento absoluto, sino en documentar decisiones arquitectonicas poco habituales en modelos tan pequeños, como un nucleo recurrente en profundidad y un objetivo de prediccion multi-token.

La arquitectura es un transformer con 256 dimensiones de modelo, 12 capas unicas, 8 cabezas de atencion (head_dim 32), FFN SwiGLU de 384 unidades, RoPE, RMSNorm con QK-norm y un vocabulario de 8.192 tokens derivado de los primeros merges del BPE de GPT-2. Las capas 3 a 8 se aplican dos veces, de modo que el modelo ejecuta 18 capas efectivas sin incrementar el numero de parametros, y el entrenamiento incorpora una cabeza auxiliar MTP-2 que predice el token dos posiciones por delante.

El modelo esta pensado como pieza de investigacion y referencia reproducible: incluye el modulo de inferencia `merlin9m.py`, el checkpoint en formato PyTorch (`.pt`) y la configuracion de arquitectura. Solo soporta ingles, tiene una ventana de contexto de 1.024 tokens y su licencia es "other" con herencia de las licencias upstream de los datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con nucleo recurrente en profundidad (capas 3-8 aplicadas dos veces) y cabeza auxiliar MTP-2 |
| Parametros totales | 8.854.146 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (el repo publica checkpoint PyTorch `.pt`; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | other (licencias upstream mixtas: CC BY-SA 3.0, GFDL; sin restricciones adicionales por parte del repositorio) |
| Formato de pesos | PyTorch (`.pt`, diccionario con `model`, `cfg`, `step`) |

## Arquitectura y entrenamiento

El modelo sigue un diseno transformer decoder-only con `d_model` de 256, 12 capas unicas, 8 cabezas de atencion con `head_dim` 32, FFN SwiGLU de dimension 384, RoPE para codificacion posicional, RMSNorm con QK-norm y softcap de logits a 15. La innovacion principal es el nucleo recurrente en profundidad: las capas 3 a 8 se ejecutan dos veces, con una escala residual aprendida en la primera pasada y una escala menor (`scale_loop`) en la segunda, lo que produce 18 capas efectivas a coste de parametros constante. El objetivo de entrenamiento anade una cabeza auxiliar MTP-2 que predice el token a dos posiciones de distancia, atada a la misma matriz de embeddings; esta cabeza no interviene en inferencia, donde el modelo se usa como un LM causal estandar. El optimizador combina Muon para los pesos 2D y AdamW para los embeddings.

El entrenamiento se realizo sobre Stew-10B-tokenized, un corpus de 10.000 millones de tokens compuesto por Wikipedia (`20231101.en`, 25%, 2,5B tokens), Ultra-FineWeb en ingles (50%, 5,0B tokens) y DCLM-baseline 1.0 (25%, 2,5B tokens). El checkpoint publicado corresponde al paso 12.502, con aproximadamente 811 millones de tokens vistos, por lo que el modelo no ha completado una epoca sobre el corpus. El autor declara explicitamente que no se incluyo ningun dato de benchmarks (ARC, HellaSwag, PIQA, WinoGrande ni otros) en la mezcla de entrenamiento. El tokenizador es BPE de GPT-2 restringido a los primeros 8.192 IDs del vocabulario original (los merges mas frecuentes en ingles); los IDs de entrada fuera de `[0, 8191]` se recortan durante la inferencia.

## Capacidades

- Generacion de texto autoregresiva en ingles con un contexto maximo de 1.024 tokens.
- Modelado de lenguaje causal basico: continuacion de prompts, completado de frases y generacion de texto corto.
- Razonamiento limitado y coherencia local; el tamano (8,85M parametros) restringe severamente la profundidad de razonamiento y el conocimiento factico.
- Capacidad multilingue: no disponible; el modelo solo declara ingles y su vocabulario cubre los merges mas frecuentes en ese idioma.
- Tool calling / function calling: no soportado de forma nativa ni documentada.
- Soporte de agentes y razonamiento multi-paso: no documentado; no es un objetivo del modelo.
- Capacidades especiales: no dispone de modo thinking, vision ni audio. La cabeza MTP-2 existe solo en entrenamiento y no se usa en inferencia.

## Casos de uso

- Investigacion sobre recurrencia en profundidad: el modelo permite reproducir y estudiar el efecto de aplicar un bloque de capas dos veces con escalas residuales distintas, comparando 12 capas unicas frente a 18 efectivas a igualdad de parametros.
- Experimentos de prediccion multi-token: sirve como banco de pruebas para analizar si la cabeza auxiliar MTP-2 mejora la calidad de representaciones en modelos de menos de 10M de parametros.
- Validacion de pipelines de preentrenamiento a pequeña escala: con 811M tokens vistos y un corpus de 10B, es util para depurar recetas de datos, optimizadores (Muon + AdamW) y schedules antes de escalar.
- Educacion y docencia: el modulo `merlin9m.py` autocontenido y el checkpoint en un unico `.pt` facilitan explicar paso a paso como se define, carga y ejecuta un transformer decoder-only.
- Generacion de texto de bajo coste en entornos embebidos o CPU: con 8,85M parametros el modelo cabe en memoria muy reducida y puede ejecutarse sin GPU para demos y pruebas de integracion.
- Baseline para ablaciones de tokenizador: al usar solo los primeros 8.192 merges de GPT-2, permite medir el impacto de un vocabulario reducido en la calidad de generacion en ingles.
- Prototipado de interfaces de inferencia: util para probar wrappers de carga desde Hugging Face Hub (`hf_hub_download`), serializacion de checkpoints y utilidades de generacion antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se uso ningun dato de evaluacion (ARC, HellaSwag, PIQA, WinoGrande ni otros) en el entrenamiento, pero no reporta metricas de evaluacion del checkpoint publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los pesos (8,85M parametros x 4 bytes ≈ 35 MB), mas overhead de activaciones y cache KV para 1.024 tokens; en la practica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; no requiere A100, H100 ni RTX 4090. Una GTX 1650, una RTX 3060 o incluso una iGPU son suficientes.
- Cabe en GPU consumer: si, en todas las gamas actuales; tambien en Raspberry Pi y entornos embebidos con suficiente RAM.
- Opciones de despliegue: el repo proporciona `merlin9m.py` con `load_model()` y `generate()` sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, se espera una latencia de milisegundos por token en CPU moderna y muy inferior en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Merlin-9M | 8,85M | 1.024 | other (upstream CC BY-SA 3.0 / GFDL) | PyTorch `.pt` | Recurrencia en profundidad, MTP-2, solo ingles |
| GPT-2 small | 124M | 1.024 | MIT | PyTorch, safetensors, GGUF | Referencia clasica de la misma familia; 14x mas parametros |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | safetensors, GGUF | Escala muy superior; no comparable en coste |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | safetensors, GGUF | Modelo pequeño moderno con soporte de ecosistema amplio |

La comparacion directa con modelos de 100M o mas parametros no es equitativa en calidad; Merlin-9M se situa en una categoria propia de modelos de investigacion por debajo de 10M de parametros, donde la oferta publica con checkpoint, codigo de inferencia y receta de datos documentada es escasa. No se dispone de resultados de benchmarks que permitan comparar rendimiento con las alternativas listadas.

## Limitaciones y advertencias

- Tamano muy reducido: con 8,85M parametros el conocimiento factico, la coherencia a largo plazo y el razonamiento son muy limitados; no es adecuado para tareas de produccion que requieran precision.
- Entrenamiento incompleto: el checkpoint corresponde al paso 12.502 con aproximadamente 811M tokens vistos de un corpus de 10B, por lo que el modelo no ha completado una epoca y su calidad es la de un checkpoint intermedio.
- Solo ingles: no soporta castellano ni otros idiomas; el vocabulario esta restringido a los primeros 8.192 merges de GPT-2, lo que penaliza texto no ingles y caracteres fuera de ese conjunto.
- Contexto corto: 1.024 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o analisis de codigo.
- Riesgo de alucinacion: alto, como es habitual en modelos pequeños; no debe usarse como fuente de informacion factica sin verificacion.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus (Wikipedia, Ultra-FineWeb, DCLM) puede arrastrar sesgos de sus fuentes, y el autor no reporta analisis al respecto.
- Licencia: "other" con herencia de licencias upstream mixtas (CC BY-SA 3.0, GFDL). El repositorio no impone restricciones adicionales, pero el uso comercial requiere revisar las condiciones de los datasets de origen, en particular las clausulas de atribucion y compartir-igual de CC BY-SA 3.0.
- Sin soporte de ecosistema: no hay pesos GGUF, cuantizaciones, ni integracion con vLLM, llama.cpp, Ollama o TGI; el despliegue requiere usar el modulo `merlin9m.py` o reimplementar la arquitectura.
- Sin benchmarks publicados: no es posible comparar su calidad de forma objetiva con otros modelos; cualquier evaluacion requiere ejecutarla por cuenta propia.
- Fecha de creacion futura en la ficha de Hugging Face (2026-11-15) y cero descargas: el modelo carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Monster-Code/Merlin-9M
- Dataset de entrenamiento: https://huggingface.co/datasets/Monster-Code/Stew-10B-tokenized
- Repositorio del autor en Hugging Face: https://huggingface.co/Monster-Code
- Modulo de inferencia: `merlin9m.py` incluido en el repositorio del modelo
- Checkpoint: `brasa9m_last.pt` en el repositorio del modelo
