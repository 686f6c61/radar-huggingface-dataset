# PelaAI/KnowLine-2B-Gen1

## Resumen

KnowLine-2B-Gen1 es un modelo de decisión de 2.213 millones de parámetros desarrollado por PelaAI, afinado por LoRA sobre Qwen/Qwen3.5-2B. No es un modelo generativo al uso: transforma un estado estructurado y un conjunto de preguntas tipadas (elección entre opciones, sí/no y puntuación ordenada) en distribuciones de probabilidad sobre las opciones suministradas. En lugar de generar texto libre, lee directamente la probabilidad del token de cada etiqueta de opción, lo que lo convierte en un componente de decisión determinista y calibrado dentro de pipelines más amplios.

La arquitectura subyacente es la de Qwen3.5-2B (transformer denso con torre de visión heredada), sobre la que se aplicó un único epoch de SFT con LoRA (rango 32, alpha 64) limitado a las capas lineales del modelo de lenguaje, fusionado después en pesos bf16. Una innovación destacable es la temperatura de lectura T = 1.32, ajustada sobre datos de validación y plegada directamente en `model.language_model.norm.weight`, de modo que el front end lee a temperatura 1 sin recalibración externa.

El modelo es relevante ahora porque cubre un nicho poco atendido: la clasificación y decisión estructurada con probabilidades calibradas (ECE 0.016-0.025) en un tamaño que cabe en una sola GPU de consumo. Publica resultados propios en el suite público Decision Index 0.3 (52.23), C-Eval (67.0) y JevBench (77.5), y se distribuye con licencia Apache-2.0, lo que facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-2B) con torre de visión heredada; cabecera de decisión sobre logits de etiquetas |
| Parametros totales | 2.213.241.664 (2,2 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (la model card menciona lecturas de hasta 3.000 tokens en una sola pasada, sin especificar ventana máxima) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 4,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer denso con torre de visión. El afinado consistió en un epoch de LoRA SFT con rango 32 y alpha 64, aplicado únicamente a las capas lineales del modelo de lenguaje, con filas de hasta 12.288 tokens. Los adaptadores se fusionaron en pesos bf16 y el checkpoint publicado corresponde al final del entrenamiento. Los ejemplos de entrenamiento incluyen tareas de decisión redactadas y etiquetadas por profesores LLM; el dataset no se distribuye en el repositorio.

La innovación principal es el mecanismo de lectura: el modelo no genera texto, sino que puntúa las etiquetas de opción y devuelve probabilidades. La temperatura de lectura T = 1.32 se ajustó sobre datos de validación y se plegó en `model.language_model.norm.weight` (documentado en `CALIBRATION.json`), mientras que `temperatures.json` divide los logits de preguntas de puntuación por 0.7576 (= 1/1.32). El front end (`knowline_server.py`, `knowline_engine.py`, `knowline_layout.py`) renderiza los prompts con `enable_thinking=False`; es importante forzarlo manualmente si se construyen prompts propios, porque la plantilla de chat de Qwen3.5-2B activa el modo thinking por defecto. No hubo entrenamiento con imágenes: la torre de visión es la del modelo base.

## Capacidades

- Preguntas de elección con opciones nombradas y criterios descriptivos por opción.
- Preguntas de sí/no (tipo `noul` en el ejemplo de la model card).
- Preguntas de puntuación ordenada, leídas a temperatura efectiva 1.0.
- Salida de probabilidades calibradas por opción (ECE 0.016-0.025 en el suite público).
- Lectura doble para peticiones cortas de solo texto (hasta 3.000 tokens leídos una vez).
- Soporte de entrada image-text-to-text por herencia del modelo base, aunque sin entrenamiento específico en imágenes.
- Idiomas: inglés y chino.
- No genera texto libre cuando responde; devuelve distribuciones sobre las opciones.
- Servicio HTTP compatible con endpoints (`/v1/systemone`) mediante el front end incluido.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia y un conjunto de colas (facturación, soporte técnico, etc.), el modelo devuelve la probabilidad de cada cola y permite aplicar umbrales de confianza o escalado a humano cuando la distribución es ambigua.
- Moderación y clasificación de contenido: preguntas sí/no sobre políticas concretas con probabilidad calibrada, útil para auditar decisiones y fijar umbrales reproducibles.
- Decisión de reembolsos y disputas: el ejemplo de la model card (paquete dañado → ¿reembolso?) se generaliza a flujos de atención al cliente donde se requiere una respuesta binaria con confianza medible.
- Puntuación ordenada de candidatos: ranking de respuestas, productos o propuestas mediante preguntas de score ordenado, con la temperatura ya corregida en los pesos.
- Componente de decisión en agentes: sustituir llamadas generativas por una consulta de bajo coste (30 ms de mediana en H20) cuando el agente solo necesita elegir entre acciones predefinidas.
- Extracción de etiquetas en pipelines de datos: clasificación por lotes de documentos cortos con salida probabilística apta para agregación estadística.
- Evaluación de políticas y A/B testing: comparar distribuciones de decisión entre versiones del modelo o entre configuraciones de criterios sin depender de generación libre.

## Benchmarks y rendimiento

Resultados publicados por el autor (autoejecución con el kit oficial, salvo donde se indique):

| Benchmark | KnowLine-2B-Gen1 | KnowLine-0.8B-Gen1 |
|---|---:|---:|
| Decision Index 0.3 público | 52.23 | no disponible |
| Decision Index 0.3 raw index | 64.24 | no disponible |
| C-Eval (4 categorías, macro) | 67.0 | 56.3 |
| JevBench | 77.5 | 71.9 |
| JevBench-hard | 55.9 | 49.5 |
| S1MB English v1 (Task Avg) | 44.85 | no disponible |

Detalle del run de Decision Index 0.3 (2026-10-29, bf16, lectura doble, cuatro servidores H20, 32 shards de cliente): 140.620 peticiones enviadas, 140.178 puntuables, 0 errores y 0 no soportadas. Latencia con una petición a la vez: mediana 30,0 ms, media 60,6 ms, percentil 95 214,9 ms. En S1MB English v1: 137 benchmarks, 18.701 casos, 26.269 decisiones, ninguna fallida ni abstenida; desglose por tipo: elección 57,4, sí/no 48,4, puntuación 28,7.

Comparativa del tablero Decision Index (snapshot multimodalart/jev-decision-index @ c130faf6, datos de 2026-10-29):

| Modelo | Tamano | DI 0.3 publico | DI 0.4.1 full | Fuente |
|---|---:|---:|---:|---|
| KnowLine-2B-Gen1 | 2B | 52.23 | no puntuado aun | autoejecucion, kit oficial |
| StartLux-Decision v1.1 2B | 2,3B | 59.23 | 40.11 | tablero |
| baselabs joey-1 (2B) | 2,7B | 63.30 | 35.91 | tablero |
| Jev-Style 2B v4 | 2,2B | 44.37 | 34.53 | tablero |
| Sieve 2B v3 | 2,3B | 53.51 | 34.45 | tablero |

## Requisitos de hardware

- VRAM estimada: los pesos bf16 ocupan aproximadamente 4,4 GB (2,21 B de parámetros × 2 bytes), más overhead de activaciones y del front end; una GPU con 8-12 GB debería ser suficiente en bf16, aunque el autor no publica cifras de VRAM.
- GPU recomendadas por el autor: H20 para las mediciones publicadas (30 ms de mediana con una petición a la vez).
- GPU de consumo: no se documenta soporte de cuantización (GGUF, AWQ, GPTQ), por lo que el despliegue en GPUs de consumo queda condicionado a ejecutar bf16 o fp16; no hay datos publicados de funcionamiento en RTX 4090 u otras.
- Despliegue: el autor proporciona un front end propio (`serve_knowline.sh`, `knowline_server.py`, `knowline_engine.py`, `knowline_layout.py`) sobre SGLang 0.5.21 con PyTorch CUDA y `transformers`; expone `/v1/systemone`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana 30,0 ms, media 60,6 ms y p95 214,9 ms por petición individual en H20; el run completo usó cuatro servidores H20 idénticos y 32 shards de cliente, sin cifras de throughput agregado publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DI 0.3 publico | DI 0.4.1 full | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| KnowLine-2B-Gen1 | 2,2B | no disponible | 52.23 | no puntuado | Apache-2.0 | Hugging Face |
| StartLux-Decision v1.1 2B | 2,3B | no disponible | 59.23 | 40.11 | no disponible | tablero Decision Index |
| baselabs joey-1 (2B) | 2,7B | no disponible | 63.30 | 35.91 | no disponible | tablero Decision Index |
| Jev-Style 2B v4 | 2,2B | no disponible | 44.37 | 34.53 | no disponible | tablero Decision Index |
| Sieve 2B v3 | 2,3B | no disponible | 53.51 | 34.45 | no disponible | tablero Decision Index |

Las cifras de los competidores provienen del tablero público y no han sido verificadas de forma independiente; las de KnowLine son autoejecución con el kit oficial, y su puntuación completa en DI 0.4.1 aún no está disponible.

## Limitaciones y advertencias

- No genera texto libre: solo responde a preguntas tipadas con opciones suministradas. No sirve para diálogo abierto ni para generación de contenido.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado y no se recomienda sin validación previa.
- La torre de visión es la del modelo base y no recibió entrenamiento específico con imágenes; el pipeline declarado es image-text-to-text, pero no hay resultados multimodales publicados.
- La temperatura de calibración está plegada en los pesos y el front end aplica un factor adicional (0.7576) a las preguntas de puntuación; construir prompts propios sin replicar el front end invalida la calibración.
- Es imprescindible pasar `enable_thinking=False`: la plantilla de chat de Qwen3.5-2B activa thinking por defecto y alteraría el formato de lectura.
- El dataset de entrenamiento no se publica, por lo que no es posible auditar la composición ni los sesgos de los profesores LLM que etiquetaron los datos.
- Riesgo de alucinación estructuralmente bajo en la respuesta (devuelve probabilidades sobre opciones dadas), pero las probabilidades no garantizan corrección semántica si las opciones o los criterios están mal definidos.
- La puntuación completa en Decision Index 0.4.1 no está disponible; la comparativa con rivales se basa en el suite público 0.3.
- No se documentan cuantizaciones, por lo que el despliegue en hardware limitado no está soportado oficialmente.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-2B por si imponen restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PelaAI/KnowLine-2B-Gen1
- Notas de inferencia: https://huggingface.co/PelaAI/KnowLine-2B-Gen1/blob/main/INFERENCE.md
- README en chino: https://huggingface.co/PelaAI/KnowLine-2B-Gen1/blob/main/README.zh.md
- Modelo hermano 0.8B: https://huggingface.co/PelaAI/KnowLine-0.8B-Gen1
- Modelo hermano 9B: https://huggingface.co/PelaAI/KnowLine-9B-Gen1
- Modelo hermano 4B Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Tablero Decision Index (snapshot): https://huggingface.co/multimodalart/jev-decision-index
