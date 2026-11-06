# asun17904/Qwen3.5-0.8B-OFA-Round3

## Resumen

Qwen3.5-0.8B-OFA-Round3 es un checkpoint intermedio de calibración "once-for-all" (OFA) del backbone de texto de Qwen/Qwen3.5-0.8B, publicado por el usuario asun17904 en Hugging Face. No se trata de un modelo nuevo orientado a produccion, sino de un artefacto de investigacion cuyo objetivo es explorar la reutilizacion de cabezas de atencion, MLPs y capas congeladas dentro de grafos computacionales modificados. El checkpoint contiene 752.393.024 parametros unicos del modelo de lenguaje tras 1.500 actualizaciones del optimizador, de un curriculum planificado de 10 rondas y 5.000 actualizaciones totales.

El modelo se carga como un `Qwen3_5ForCausalLM` estandar sin codigo remoto personalizado y conserva la arquitectura de 24 capas del modelo base. Incluye unicamente el backbone de texto: la torre de vision y el modulo de prediccion multi-token del modelo original no estan presentes. Las intervenciones sobre el grafo OFA requieren un ejecutor de grafo separado que no se distribuye con este release.

Su relevancia es fundamentalmente metodologica: documenta un proceso de busqueda de arquitectura neuronal (NAS) con reutilizacion de pesos, donde las ediciones de grafo se remuestrean desde la linea base sin introducir nuevos parametros y los pesos finetuneados se arrastran entre rondas. Es un material de referencia para investigadores que trabajen en eficiencia estructural, no una base recomendada para despliegues de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), 24 capas, backbone de texto |
| Parametros totales | 752.393.024 (parametros unicos del LM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-0.8B, no validada tras la calibracion OFA) |
| Tipos de cuantizacion | no disponible (export en FP32; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP32, embeddings de entrada/salida atados almacenados una vez) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint post-entrenado de Qwen3.5-0.8B en la revision `2fc06364715b967f1860aea9cf38778875588b17` y mantiene su arquitectura transformer decoder-only de 24 capas sin modificar el numero de parametros. El objetivo de entrenamiento es la log-verosimilitud negativa del siguiente token sobre un flujo empaquetado de Dolma en ingles, reconstruido a partir de documentos tokenizados con GPT-2 y retokenizado con el tokenizer de Qwen; la reconstruccion no garantiza recuperacion byte a byte de los documentos originales.

El entrenamiento usa AdamW con parametros maestros en FP32 y autocast BF16, un batch global de 96 secuencias de 1.024 objetivos puntuados, pico de learning rate de 1e-5 con 100 actualizaciones de warmup y decaimiento coseno hacia 1e-6. El weight decay es cero y el recorte de gradiente usa norma global 1.0. Cada cinco actualizaciones, el entrenador muestrea un grafo desde la linea base sin modificar, componiendo de una a tres intervenciones efectivas entre omision de cabezas de atencion, ejecucion extra de cabezas de atencion, ejecucion extra de MLPs, subconjuntos de capas repetidas y ejecucion extra de componentes fuera de orden. Los componentes repetidos comparten los tensores de parametros originales, por lo que no se anaden parametros nuevos. Una penalizacion anclada a la inicializacion y una proyeccion restringen la distancia L2 relativa global de parametros a un maximo del 1%, actuando como region de confianza en el espacio de parametros (no como constraint KL de politica ni PPO). Este checkpoint ha puntuado 147.456.000 objetivos de entrenamiento; el run completo de 5.000 actualizaciones preve 491.520.000 objetivos sobre un flujo de 500.000.001 tokens.

## Capacidades

- Generacion de texto autoregresiva estandar mediante `Qwen3_5ForCausalLM` en Transformers.
- Conversacion con plantilla de chat (`apply_chat_template`) y soporte de `enable_thinking=False` en la generacion.
- Ejecucion de grafos OFA modificados (omision de cabezas, MLPs extra, capas repetidas, componentes fuera de orden) mediante un ejecutor de grafo externo no incluido en el release.
- Capacidades multilingues limitadas al ingles segun la model card.
- No incluye vision: la torre de vision del modelo base no esta presente.
- No incluye el modulo de prediccion multi-token del modelo original.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Investigacion en busqueda de arquitectura neuronal (NAS): el checkpoint sirve como punto de partida para reproducir y extender el curriculum OFA de 10 rondas, analizando como afectan las intervenciones de grafo a la perplejidad sobre Dolma.
- Estudio de reutilizacion de pesos: permite medir hasta que punto cabezas de atencion y MLPs congelados pueden recombinarse en grafos alternativos sin reentrenar desde cero, comparando el coste en calidad frente al ahorro de parametros.
- Validacion de regiones de confianza en espacio de parametros: util para experimentos que apliquen penalizaciones ancladas a la inicializacion (aqui, limite del 1% en distancia L2 relativa) y estudien su efecto en la estabilidad del finetuning.
- Reproducibilidad de artefactos: el release incluye `recipe.json` y `provenance.json` con hash SHA-256 del snapshot fuente, lo que facilita auditorias y replicas de experimentos en entornos de investigacion.
- Docencia y divulgacion tecnica: como ejemplo didactico de exportacion FP32 con embeddings atados y de carga estandar en `transformers==5.22.1` sin codigo remoto.
- Pruebas de integracion de pipelines de evaluacion: dado su tamano reducido (752 M parametros), es manejable para validar flujos de evaluacion de perplejidad y generacion antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que el release no reclama mejoras en precision MATH, robustez ante cambios arbitrarios de grafo ni finalizacion del calendario completo de calibracion, y que las comprobaciones de carga y exportacion solo establecen integridad del artefacto, no calidad downstream.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3,0 GB solo para pesos (752 M parametros x 4 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP32; tarjetas consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 son suficientes. En entornos de servidor, A100 o H100 no son necesarias por tamano, aunque pueden usarse para lotes grandes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en FP32; con cuantizacion a FP16/BF16 (no publicada como artefacto, pero aplicable al cargar) el requisito baja a unos 1,5 GB de pesos.
- Opciones de despliegue: Transformers (`transformers==5.22.1`, `torch==2.9.1`, `safetensors==0.8.0`) con `attn_implementation="eager"`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de formatos GGUF limita el despliegue en esos runners sin conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-OFA-Round3 | 752.393.024 | no disponible (heredado, no validado) | Checkpoint intermedio OFA/NAS, solo backbone de texto | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion (familia 0.8B) | no disponible | Modelo multimodal completo con torre de vision y prediccion multi-token | apache-2.0 | Hugging Face |
| Alternativas de ~0,8B para texto | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otros modelos de la misma categoria no esta disponible en la informacion proporcionada. El unico punto de referencia objetivo es el modelo base Qwen3.5-0.8B, del que este checkpoint hereda arquitectura, tokenizer y licencia, pero del que difiere por la ausencia de vision y del modulo de prediccion multi-token, y por los pesos calibrados con intervenciones de grafo.

## Limitaciones y advertencias

- Es un checkpoint intermedio (ronda 3 de 10), no un modelo final; no debe tratarse como un release listo para produccion.
- La model card no reclama mejoras de calidad downstream: las comprobaciones de carga y exportacion solo garantizan integridad del artefacto.
- La longitud de contexto heredada no ha sido validada tras la calibracion OFA, por lo que el comportamiento en contextos largos es incierto.
- Solo soporta ingles segun la declaracion de idiomas del autor.
- No incluye torre de vision ni modulo de prediccion multi-token, por lo que no puede sustituir al modelo base en tareas multimodales.
- Las intervenciones OFA requieren un ejecutor de grafo separado no incluido en el repositorio; con Transformers estandar solo se ejecuta la arquitectura de 24 capas sin modificar.
- La reconstruccion del dataset Dolma no garantiza recuperacion byte a byte de los documentos originales, lo que puede introducir diferencias respecto al entrenamiento del modelo base.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este checkpoint; al derivar de Qwen3.5-0.8B, hereda los sesgos del modelo base y del corpus Dolma en ingles.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigacion y la falta de validacion desaconsejan su uso en entornos de produccion sin evaluacion adicional.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Receta de entrenamiento (`recipe.json`): https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round3/blob/main/recipe.json
- Procedencia (`provenance.json`): https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round3/blob/main/provenance.json
- Licencia (`LICENSE`): https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round3/blob/main/LICENSE
