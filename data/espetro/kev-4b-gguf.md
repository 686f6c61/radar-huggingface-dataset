# espetro/kev-4b-gguf

## Resumen

Kev 4B v1.0 es un modelo de decisión de estilo "System One" empaquetado en formato GGUF. No es un modelo generativo convencional: parte del backbone Qwen3.5-4B y le añade una cabeza pointer entrenada que devuelve probabilidades calibradas para preguntas tipadas (elección, sí/no, etc.) en lugar de generar texto libre. Lo desarrolla el usuario espetro a partir del trabajo original de jaredpalmer (Kev v1.0), fusionando el adaptador LoRA y el fichero `head.pt` sobre Qwen/Qwen3.5-4B-Base.

La relevancia actual del modelo reside en su enfoque: en lugar de pedir a un LLM que "responda" una clasificación o un enrutamiento, Kev expone un endpoint TypeSafe (`/v1/systemone`) que devuelve probabilidades calibradas por criterio. Esto lo hace adecuado para pipelines de decisión deterministas donde la latencia y la interpretabilidad importan más que la generación de texto.

El paquete GGUF incluye la cabeza pointer y la temperatura de calibración (2.4061) horneadas como tensores `dec.head_*` y metadatos `kev.*`, de modo que el modelo funciona con el fork de llama.cpp de espetro, aunque sigue cargándose en llama.cpp estándar como un Qwen3.5 normal (ignorando la cabeza).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3.5-4B) + cabeza pointer entrenada para decisión |
| Parametros totales | 4.207.062.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y F16 (incluidos en el repo); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base de origen) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B-Base (commit `1001bb4d`) al que se le aplica un adaptador LoRA y un `head.pt` procedentes de jaredpalmer/kev-4b (commit `6cfce5c`). La fusión se realiza con el pipeline `tools/kev` del fork espetro/llama.cpp: `kev_v10_merge.py` para fusionar el adaptador, `convert_hf_to_gguf --no-mtp` para la conversión, `kev_head.py` para integrar la cabeza y `kev_pack.py` para el empaquetado final.

La innovación técnica clave es la cabeza pointer: en lugar de generar tokens, el modelo produce probabilidades calibradas sobre un conjunto de opciones tipadas definidas en la petición. La temperatura de calibración (2.4061) queda fijada en los metadatos `kev.*`. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Decisión tipada: devuelve probabilidades calibradas para preguntas de tipo `choice` (y presumiblemente otros tipos) con criterios definidos por el usuario.
- Enrutamiento y clasificación: asignación de casos a departamentos o categorías mediante el endpoint `/v1/systemone`.
- Interfaz TypeSafe: expone `/v1/systemone` y `/studio` a través del servidor de llama.cpp modificado.
- Compatibilidad con llama.cpp estándar: los ficheros cargan como un Qwen3.5 normal, ignorando metadatos y cabeza.
- Modo CLI: herramienta `llama-decide` para ejecutar decisiones en lote desde JSON.
- Demo en navegador: cuantización 0.8B ejecutable en llama.cpp WASM.
- Generación de texto: no es la función principal; el modelo está orientado a decisión, no a generación libre.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del caso y un mapa de criterios (por ejemplo, `returns` frente a `shipping`) y devuelve la probabilidad de cada categoría, permitiendo umbrales de confianza para escalado humano.
- Triaje de incidencias en producción: clasificación determinista de alertas o logs en categorías predefinidas con probabilidades calibradas, integrable en pipelines de observabilidad.
- Moderación de contenido con criterios tipados: definir categorías de riesgo y obtener probabilidades por categoría en lugar de texto libre, facilitando la auditoría.
- Clasificación de correo entrante: asignación de mensajes a bandejas o equipos mediante preguntas de tipo `choice` con instrucciones y criterios explícitos.
- Decisión en agentes multi-paso: usar la cabeza como módulo de selección de siguiente acción (tool o rama) dentro de un agente, aprovechando la calibración para decidir cuándo delegar.
- Validación de formularios o datos estructurados: comprobar si un campo cumple criterios tipados y devolver probabilidad, útil en pipelines de calidad de datos.
- Despliegue local en entornos con restricciones: al ser GGUF Q8_0 de 4,3 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada mediante llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,3 GB para Q8_0 y 8,4 GB para F16 (tamaño de fichero; el consumo real en inferencia puede ser algo superior por el contexto y buffers).
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 6-8 GB de VRAM puede alojar Q8_0 (RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más para Q8_0; F16 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp (fork espetro/llama.cpp con soporte `kev`), `llama-server`, `llama-decide`; llama.cpp estándar carga el modelo como Qwen3.5 sin cabeza. vLLM, TGI u Ollama no están documentados para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev 4B v1.0 (este) | 4,2 B | no disponible | Decisión tipada con cabeza pointer | Apache-2.0 | GGUF en HF |
| Qwen3.5-4B-Base | ~4 B | no disponible | Generación de texto | Apache-2.0 | HF |
| jaredpalmer/kev-4b | ~4 B | no disponible | Decisión (LoRA + head.pt, safetensors) | Apache-2.0 | HF |

La comparativa con modelos de clasificación dedicados (por ejemplo, encoders tipo DeBERTa) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para decisión tipada, no para generación de texto libre; usarlo como LLM conversacional no es su propósito.
- La cabeza pointer y la calibración solo se aprovechan con el fork espetro/llama.cpp; en llama.cpp estándar se ignoran y el modelo se comporta como Qwen3.5 base.
- No se dispone de información sobre sesgos, idiomas soportados ni evaluación de alucinación.
- La temperatura de calibración está fijada (2.4061); modificarla puede degradar la calibración de probabilidades.
- Solo se ofrecen cuantizaciones Q8_0 y F16; no hay Q4 ni otras variantes en este repo.
- El repo tiene pocas descargas (197) y un solo like, lo que sugiere poca validación comunitaria.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias del backbone y del trabajo original (ambas Apache-2.0 según la model card).

## Enlaces

- Hugging Face: https://huggingface.co/espetro/kev-4b-gguf
- Modelo original: https://huggingface.co/jaredpalmer/kev-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio del trabajo original: https://github.com/jaredpalmer/kev
- Fork de llama.cpp: https://github.com/espetro/llama.cpp
- Demo en navegador: https://espetro.github.io/llama.cpp/
- Cuantización demo: https://huggingface.co/espetro/kev-4b-demo-gguf
