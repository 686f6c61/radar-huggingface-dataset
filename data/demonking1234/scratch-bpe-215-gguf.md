# DemonKing1234/scratch-bpe-215-GGUF

## Resumen

scratch-bpe-215 es un modelo de lenguaje experimental de escala minima entrenado desde cero sobre TinyStories por el usuario DemonKing1234. Se distribuye como un archivo GGUF v3 en FP32 con un grafo de computacion propio (identificador de arquitectura `recurrent_gta_xielu`) que no es compatible con los runtimes estandar de inferencia. El modelo tiene 779.522 parametros segun la model card (1.163.522 segun los metadatos de safetensors del repositorio), una longitud de contexto de 128 tokens y un tokenizador BPE a nivel de byte con 1.500 tokens.

Su relevancia no es practica sino pedagogica y de investigacion: sirve como referencia reproducible de un pipeline completo de entrenamiento (tokenizador, checkpoint, exportacion a GGUF y runtime de inferencia propio) sobre un corpus controlado como TinyStories. No es un modelo de instrucciones, no soporta tool calling ni capacidades multilingues declaradas, y su salida puede ser incoherente segun el propio autor.

El checkpoint publicado corresponde al paso 9.600, tras procesar 78.643.200 tokens de una muestra de 100 MB de TinyStories. La licencia no esta declarada en el repositorio, aunque el dataset de origen se distribuye bajo CDLA-Sharing-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con 1 bloque recurrente y 1 loop; atencion grouped-head latent attention (GTA) con 4 cabezas; activacion xIELU; hidden size 256 |
| Parametros totales | 779.522 (model card) / 1.163.522 (metadatos safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (unico artefacto publicado en FP32) |
| Idiomas soportados | no disponible (entrenado sobre TinyStories, corpus en ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF v3 (FP32, 21 tensores); pesos fuente en PyTorch |
| Tokenizador | BPE a nivel de byte, 1.500 tokens, 1.244 merges |
| Paso de checkpoint | 9.600 |
| Tokens de entrenamiento | 78.643.200 |
| Precision | FP32 |

## Arquitectura y entrenamiento

El modelo es un transformer recurrente de un solo bloque con un unico loop de recurrencia, hidden size de 256 y atencion GTA (grouped-head latent attention) de 4 cabezas. Usa la activacion xIELU en lugar de las habituales GELU/SiLU, lo que constituye una eleccion poco comun y experimental. El grafo de computacion se exporta a GGUF bajo el identificador propio `recurrent_gta_xielu`, con 21 tensores en FP32. El autor verifico la exportacion comparando tensores contra el checkpoint fuente y ejecutando un forward de validacion con una diferencia maxima de logits de 0,0.

El entrenamiento se realizo desde cero sobre una muestra de 100 MB del corpus TinyStories, procesando 78,6 millones de tokens hasta el paso 9.600. No se documenta el uso de RLHF, DPO ni ajuste por instrucciones; el modelo es un continuador de texto puro. El tokenizador BPE a nivel de byte se entreno de forma especifica para este modelo (1.500 tokens, 1.244 merges), lo que limita el vocabulario y lo hace inadecuado para texto fuera del dominio de TinyStories.

## Capacidades

- Generacion de texto por continuacion (completion), sin modo de instrucciones ni chat estructurado.
- Razonamiento y coherencia limitados al dominio de narrativas infantiles de TinyStories.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues declaradas; el corpus de entrenamiento es en ingles.
- Sin vision, audio ni modo thinking.
- Tokenizador y runtime propios incluidos en el repositorio (`gguf_chat.py`, `custom_gguf.py`, `model.py`, `tokenizer.py`).

## Casos de uso

- Docencia y divulgacion de pipelines LLM: el repositorio incluye tokenizador, implementacion del modelo, exportador GGUF y runtime, lo que permite recorrer el ciclo completo de entrenamiento a inferencia en un solo lugar.
- Experimentacion con arquitecturas recurrentes: sirve para probar variantes de recurrencia, atencion GTA y activacion xIELU a un coste computacional trivial.
- Validacion de exportacion GGUF: el modelo es un caso de prueba para verificar lectores GGUF v3 personalizados y comparar logits entre checkpoint y artefacto exportado.
- Generacion de cuentos cortos sinteticos en ingles: continuaciones de frases simples dentro del estilo de TinyStories, utiles como datos de prueba para pipelines de generacion.
- Benchmarking de runtimes personalizados: al no cargar en llama.cpp, Ollama, KoboldCpp ni LM Studio, permite medir el coste de implementar grafos no estandar en un runtime propio.
- Pruebas de integracion en CPU: al ser un modelo de menos de un millon de parametros en FP32, se ejecuta en CPU sin requisitos de VRAM, lo que facilita tests automatizados en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 (menos de 1 millon de parametros y 21 tensores); cabe en cualquier GPU consumer.
- GPU recomendadas: cualquiera; el autor documenta ejecucion con `--device cuda` y `--device cpu`.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: exclusivamente el runtime de referencia incluido en el repositorio (`gguf_chat.py` sobre `custom_gguf.py`). llama.cpp, Ollama, LM Studio, KoboldCpp, vLLM y TGI no implementan el grafo `recurrent_gta_xielu` y no pueden cargar el archivo.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Despliegue |
|---|---|---|---|---|---|
| scratch-bpe-215 | 779.522 (model card) / 1.163.522 (safetensors) | 128 tokens | Transformer recurrente, GTA, xIELU, TinyStories | no disponible | Runtime propio unicamente |
| Modelos TinyStories tipicos (p. ej. variantes GPT-Neo pequenas ajustadas) | 1M-30M | 128-512 tokens | Transformer decoder estandar | variable segun autor | llama.cpp, transformers |
| Modelos de referencia de menos de 10M parametros en Hugging Face | 1M-10M | variable | Transformer estandar | variable | Estandar |

La comparativa directa con alternativas concretas no esta disponible en la informacion proporcionada; los rangos anteriores son orientativos por categoria de tamano y tarea.

## Limitaciones y advertencias

- Modelo de investigacion temprana: el propio autor advierte de que la salida puede ser incoherente y que no es un modelo de instrucciones.
- Contexto de solo 128 tokens, insuficiente para practicamente cualquier tarea de produccion.
- Tokenizador de 1.500 tokens entrenado sobre TinyStories: cobertura lexica muy limitada y mal comportamiento fuera de ese dominio.
- Sin datos publicados sobre sesgos; al entrenarse sobre narrativas infantiles sinteticas, el riesgo de sesgo de dominio y de repeticion es alto.
- Riesgo elevado de alucinacion y de degradacion en generaciones largas.
- Licencia no declarada: no hay autorizacion explicita para uso comercial. El dataset TinyStories se distribuye bajo CDLA-Sharing-1.0, cuyos terminos deben revisarse antes de redistribuir salidas.
- Incompatibilidad con los runtimes de inferencia estandar; requiere el codigo del repositorio y, por tanto, mantenimiento propio.
- Discrepancia entre el recuento de parametros de la model card (779.522) y los metadatos safetensors (1.163.522); conviene tratarla como ambiguedad no resuelta.
- Fecha de creacion del repositorio en 2026, con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- [Hugging Face: DemonKing1234/scratch-bpe-215-GGUF](https://huggingface.co/DemonKing1234/scratch-bpe-215-GGUF)
- [TinyStories (dataset)](https://huggingface.co/datasets/roneneldan/TinyStories)
