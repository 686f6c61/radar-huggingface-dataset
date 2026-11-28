# espetro/kev-9b-gguf

## Resumen

Kev 9B v1.0 es un modelo de decisión de estilo "System One" empaquetado en formato GGUF por el usuario espetro. Se construye sobre el backbone de Qwen3.5-9B-Base, al que se le ha añadido una cabeza pointer entrenada que devuelve probabilidades calibradas para preguntas tipadas, en lugar de generar texto libre. El modelo original (Kev v1.0) procede de jaredpalmer/kev-9b, un adaptador LoRA más un fichero `head.pt` que se fusionan sobre el modelo base de Qwen.

La relevancia de este empaquetado radica en que traslada ese modelo de decisión al ecosistema llama.cpp: los pesos, la cabeza pointer y la temperatura de calibración (2,1936) quedan integrados como tensores `dec.head_*` y metadatos `kev.*` dentro del GGUF. Esto permite servir un endpoint `/v1/systemone` tipado mediante un fork específico de llama.cpp, sin necesidad de infraestructura Python adicional.

El repositorio incluye dos cuantizaciones (Q8_0 y F16) y el modelo sigue siendo cargable en llama.cpp estándar como un Qwen3.5 ordinario, aunque en ese caso se ignoran la cabeza y los metadatos de decisión. Está pensado para tareas de clasificación y enrutamiento con probabilidades calibradas, no para generación de texto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-9B) con cabeza pointer de decisión añadida |
| Parametros totales | 8.955.900.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y F16 (en el repo); re-cuantizable desde F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base (commit `68c46c4b`) y le superpone un adaptador LoRA más una cabeza pointer (`head.pt`) procedentes de jaredpalmer/kev-9b (commit `db029f0`). La fusión se realiza con el pipeline `tools/kev` del fork espetro/llama.cpp: `kev_v10_merge.py`, seguido de `convert_hf_to_gguf --no-mtp`, `kev_head.py` y `kev_pack.py`. El resultado incorpora la cabeza y la temperatura de calibración (2,1936) como tensores y metadatos dentro del propio GGUF.

La innovación principal es el cambio de paradigma: en lugar de generar texto, el modelo recibe un estado y un conjunto de preguntas tipadas (por ejemplo, `choice` con criterios) y devuelve probabilidades calibradas para cada opción. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Decisión tipada: devuelve probabilidades calibradas para preguntas con tipos definidos (por ejemplo, `choice` con criterios de clasificación).
- Enrutamiento y clasificación: asignación de estados o entradas a categorías predefinidas.
- Servicio mediante endpoint `/v1/systemone` tipado en el fork de llama.cpp.
- Ejecución por CLI con `llama-decide`.
- Carga en llama.cpp estándar como modelo Qwen3.5 ordinario (sin usar la cabeza de decisión).
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del estado (por ejemplo, una incidencia de envío) y devuelve la probabilidad de que corresponda a cada departamento (`returns`, `shipping`), permitiendo derivar automáticamente la cola correcta.
- Clasificación de incidencias con criterios explícitos: al definir criterios por opción en la petición, el modelo calcula probabilidades calibradas que pueden usarse con umbrales de confianza para escalado humano.
- Triaje en pipelines de atención al cliente: integrado vía `/v1/systemone`, permite decidir la categoría de un mensaje antes de invocar un modelo generativo para la respuesta.
- Automatización de decisiones en backoffice: cualquier flujo donde haya que elegir entre un conjunto finito de opciones tipadas (categorías, prioridades, colas) y se requiera una probabilidad, no un texto.
- Evaluación de confianza en producción: la calibración integrada permite fijar umbrales y derivar a revisión manual los casos con baja probabilidad.
- Prototipado local en navegador: la demo WASM (0.8B) y la variante `kev-9b-demo-gguf` permiten probar el flujo de decisión sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q8_0 ocupa 9,7 GB en disco; F16 ocupa 18 GB. La VRAM necesaria para inferencia será al menos del orden del tamaño del fichero más overhead de contexto (cifra exacta no disponible).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16-24 GB de VRAM sería el mínimo razonable para Q8_0, pero no se confirma.
- GPU de consumo: probablemente viable en RTX 4090 (24 GB) con Q8_0; no confirmado en la información.
- Opciones de despliegue: fork espetro/llama.cpp (rama `kev`) con `llama-server` y `llama-decide`; llama.cpp estándar para uso como Qwen3.5 sin cabeza; demo WASM en navegador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kev 9B (este) | 8.955.900.928 | no disponible | GGUF (Q8_0, F16) | Apache-2.0 | Decisión tipada con cabeza pointer |
| Qwen3.5-9B-Base | 9B (aprox.) | no disponible | safetensors | Apache-2.0 | Generación de texto base |
| Modelos de clasificación dedicados | variable | variable | variable | variable | Clasificación supervisada |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: está diseñado para devolver probabilidades sobre preguntas tipadas; usarlo como modelo conversacional no es su propósito.
- En llama.cpp estándar los tensores `dec.head_*` y metadatos `kev.*` se ignoran, por lo que se pierde la funcionalidad de decisión.
- Requiere el fork espetro/llama.cpp (rama `kev`) para aprovechar el endpoint `/v1/systemone` y `llama-decide`.
- No hay información sobre sesgos, idiomas soportados ni evaluación de alucinación en la información disponible.
- La temperatura de calibración (2,1936) está fijada en el empaquetado; cambios en el pipeline de calibración requerirían reempaquetar.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del backbone Qwen3.5-9B-Base y del adaptador original.
- Solo 171 descargas y 3 likes: ecosistema muy incipiente, con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/espetro/kev-9b-gguf
- Modelo original: https://huggingface.co/jaredpalmer/kev-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio fuente: https://github.com/jaredpalmer/kev
- Fork llama.cpp: https://github.com/espetro/llama.cpp
- Demo en navegador: https://espetro.github.io/llama.cpp/
- Variante demo: https://huggingface.co/espetro/kev-9b-demo-gguf
