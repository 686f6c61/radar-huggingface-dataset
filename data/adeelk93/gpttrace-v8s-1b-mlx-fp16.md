# AdeelK93/gpttrace-v8s-1b-mlx-fp16

## Resumen

GPTTrace v8s 1B es un clasificador binario de texto disenado para detectar contenido generado por inteligencia artificial. El modelo original fue desarrollado por Andrew Nakas (GPTTrace) y esta construido sobre el encoder Ettin 1B del JHU CLSP. Esta ficha describe la conversion no oficial a MLX realizada por AdeelK93, que adapta el modelo para su ejecucion en Apple Silicon con pesos en float16. No se trata de un modelo generativo, sino de un clasificador que emite una puntuacion de pertenencia a la clase "maquina".

La relevancia de esta version radica en que traslada un detector de 1.031 millones de parametros al ecosistema MLX, permitiendo inferencia local en hardware Apple con latencias notablemente inferiores a la exportacion ONNX original en CPU. Segun la validacion del autor de la conversion, la inferencia en un M3 Max sobre un documento de 315 tokens tarda unos 62 ms en MLX float16, frente a aproximadamente 846 ms del modelo ONNX de precision completa en ocho hilos de CPU.

El modelo esta pensado para un unico idioma (ingles), emplea una ventana de 512 tokens con truncado y proporciona, ademas de la probabilidad softmax, un margen de logits calibrado con umbral 9,3. La licencia es CC BY-SA 4.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT / Ettin 1B) con atencion bidireccional global/local alternada, rotary embeddings, compuertas GELU, masked mean pooling y cabeza de clasificacion |
| Parametros totales | 1.031.267.330 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entradas superiores se truncan y se marcan) |
| Tipos de cuantizacion | float16 (esta version); existe una version INT8 separada (AdeelK93/gpttrace-v8s-1b-mlx-int8) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (float16), libreria MLX |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto binario basado en el encoder Ettin 1B del JHU CLSP, que a su vez sigue el diseno ModernBERT. La implementacion MLX incluye el encoder original con embeddings rotatorios y atencion bidireccional que alterna capas globales y locales, compuertas GELU, masked mean pooling y una cabeza de clasificacion final. La conversion preserva los 174 tensores entrenados del modelo original, junto con su tokenizador y normalizador, y almacena los pesos en float16.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; se trata de un clasificador, por lo que el ajuste relevante seria supervisado sobre pares texto-etiqueta. La revision del modelo fuente citada es `ac748e32ca8c90bb8858fadc427757728e27b063`. La validacion de la conversion cubre nueve casos de prueba, incluido un lote con padding y un caso de truncado a 512 tokens; el error absoluto maximo en logits en float16 es de 0,00263 y el error maximo de probabilidad de 0,000832, coincidiendo en todos los casos la clase argmax y la decision segun el umbral calibrado con la referencia de precision completa.

## Capacidades

- Clasificacion binaria de texto: distingue entre contenido generado por maquina y contenido de otro origen, devolviendo la probabilidad softmax de la clase "maquina".
- Puntuacion con margen calibrado: emite `logit_margin = logits[1] - logits[0]`, con umbral calibrado de 9,3 definido por el autor original.
- Procesamiento por lotes con padding: la validacion incluye un lote con relleno, por lo que admite inferencia batched.
- Truncado controlado: las entradas de mas de 512 tokens se truncan y se marcan en la salida.
- Ejecucion local en Apple Silicon mediante MLX.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un clasificador.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Moderacion de contenido en plataformas: puntuar envios de texto y aplicar el umbral de margen 9,3 para marcar posibles textos generados por IA antes de una revision humana, ejecutando el modelo localmente en un Mac con MLX.
- Filtrado de resenas o comentarios: clasificar lotes de resenas de producto o comentarios de usuarios para detectar contenido sintetico, aprovechando el soporte de inferencia batched con padding.
- Verificacion editorial: como senal auxiliar en flujos de revision de articulos o propuestas, comparando la puntuacion del clasificador con la declaracion de uso de IA del autor.
- Investigacion sobre deteccion de IA: usar el modelo como linea base reproducible en estudios academicos, con la ventaja de que la conversion MLX esta validada numericamente frente a la exportacion ONNX de precision completa.
- Prototipado en portatiles Apple: integrar el detector en herramientas de escritorio o scripts locales sin depender de GPU dedicada, gracias a la latencia de aproximadamente 62 ms por documento de 315 tokens en un M3 Max.
- Preprocesado en pipelines de datos: etiquetar grandes volumenes de documentos en ingles antes de entrenar otros modelos, descartando o separando el texto sintetico; el truncado a 512 tokens limita el analisis a la parte inicial de documentos largos.
- Auditoria de contenidos en educacion: detectar posibles entregas generadas por IA en ensayos en ingles, siempre como senal complementaria y no como prueba concluyente, dado que el propio autor advierte que una puntuacion aislada no establece autoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de deteccion (exactitud, F1, AUC) en la informacion disponible. Los unicos datos medidos son de validacion numerica de la conversion y de latencia:

| Metrica | Valor |
|---|---|
| Casos de validacion superados | 9 de 9 (incluye lote con padding y truncado a 512 tokens) |
| Error absoluto maximo en logits (float16 vs. referencia) | 0,00263 |
| Error maximo de probabilidad (float16 vs. referencia) | 0,000832 |
| Coincidencia de clase argmax y decision por umbral | 100 % en los casos probados |
| Latencia MLX float16, documento de 315 tokens, M3 Max | ~62 ms |
| Latencia ONNX precision completa, 8 hilos CPU | ~846 ms |

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 2,1 GB con pesos float16; en Apple Silicon la memoria unificada necesaria para cargar el modelo ronda esa cifra mas el overhead del runtime MLX.
- Hardware objetivo: Macs con Apple Silicon (la validacion se realizo en un M3 Max). No se documenta soporte para GPU NVIDIA ni CUDA en esta conversion.
- GPU consumer: al ser un modelo MLX, el requisito no es una GPU dedicada sino un SoC Apple; cabe en equipos con memoria unificada suficiente para alojar 2,1 GB de pesos mas el contexto de inferencia.
- Despliegue: exclusivamente mediante el script `gpttrace.py` incluido en el repositorio, ejecutado con `uv` (`UV_CACHE_DIR=.cache/uv uv run python gpttrace.py score --model . --text "..."`). Los comandos estandar de `mlx_lm.generate` y los pipelines de Hugging Face no son aplicables a esta implementacion de clasificador personalizada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 62 ms por documento de 315 tokens en caliente sobre M3 Max con float16; no se proporcionan cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| AdeelK93/gpttrace-v8s-1b-mlx-fp16 (esta ficha) | 1.031 M | 512 tokens | safetensors float16, MLX | CC BY-SA 4.0 | Conversion no oficial; validada numericamente frente a ONNX |
| AdeelK93/gpttrace-v8s-1b-mlx-int8 | No disponible | 512 tokens | MLX, INT8 | CC BY-SA 4.0 | Version cuantizada del mismo autor; deriva de cuantizacion medida en `quantization-benchmark.json` |
| nakas/gpttrace-v8s-1b (original) | 1.031 M | 512 tokens | Modelo original de GPTTrace | CC BY-SA 4.0 | Fuente de la conversion; exportacion ONNX de precision completa usada como referencia |
| jhu-clsp/ettin-encoder-1b (base) | 1B (encoder) | No disponible | safetensors | MIT | Encoder base sobre el que se construye GPTTrace; no es un detector por si mismo |

No se dispone de datos de rendimiento comparativo de deteccion entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Textos cortos: el autor advierte que las entradas breves producen puntuaciones poco fiables.
- Una puntuacion aislada no establece autoria; el detector debe usarse como senal complementaria, nunca como prueba concluyente.
- Ventana limitada a 512 tokens: los documentos mas largos se truncan y solo se evalua la parte inicial, lo que puede sesgar el resultado en textos extensos.
- Solo ingles: no hay soporte documentado para otros idiomas.
- Riesgo de falsos positivos y negativos inherente a un clasificador binario; no se publican metricas de exactitud en el mundo real en la informacion disponible.
- La validacion de la conversion mide acuerdo numerico con la referencia, no la precision del detector en uso real.
- Licencia CC BY-SA 4.0: el uso comercial exige cumplir las condiciones de atribucion y compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- Conversion no oficial: no es un lanzamiento de GPTTrace y cambia el framework de inferencia y la precision numerica (float16), con una deriva maxima de 0,00263 en logits.
- Dependencia del runtime MLX y de un script personalizado; no funciona con las herramientas estandar de Hugging Face ni con servidores de inferencia convencionales.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/AdeelK93/gpttrace-v8s-1b-mlx-fp16
- Version INT8: https://huggingface.co/AdeelK93/gpttrace-v8s-1b-mlx-int8
- Modelo original de GPTTrace: https://huggingface.co/nakas/gpttrace-v8s-1b
- Proyecto original GPTTrace en GitHub: https://github.com/andrewnakas/gpttrace
- Encoder base Ettin 1B del JHU CLSP: https://huggingface.co/jhu-clsp/ettin-encoder-1b
