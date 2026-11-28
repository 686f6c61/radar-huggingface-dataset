# MirroS-Lab/AgentGarten-renderer

## Resumen

AgentGarten-renderer es un modelo de renderizado neuronal en tiempo real desarrollado por MirroS-Lab como componente del framework AgentGarten, un entorno que combina simuladores y motores de juego con un renderizador neuronal compartido para construir mundos interactivos destinados al entrenamiento y la evolución de agentes. El modelo no genera video de forma convencional: recibe mapas de profundidad y normales de superficie exportados por un motor de código (simulador o game engine) y los transforma en las observaciones visuales que percibe un agente, bloque a bloque.

Tecnicamente parte de nvidia/Cosmos3-Nano, al que se adapta mediante condicionamiento por profundidad y normales y un entrenamiento autorregresivo de causalidad por bloques. El repositorio distribuye tres torres de generación de 7.000 millones de parametros cada una en BF16 (bidireccional multi-paso, autorregresiva multi-paso y una estudiante destilada de cuatro pasos mediante Adversarial Forcing), junto con la torre de texto congelada de Cosmos3-Nano.

Su relevancia radica en que separa la simulacion (reglas y estado, ejecutadas por código determinista) de la percepcion (renderizado neuronal), lo que permite a los agentes observar mundos coherentes sin necesidad de un motor grafico fotorrealista completo. El VAE de codificacion y decodificacion de video es el de Wan 2.2 TI2V-5B, que no se incluye en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con causalidad por bloques (base Cosmos3-Nano), tres torres de generacion |
| Parametros totales | 7.000 millones por torre (21.000 millones en el repositorio completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos distribuidos en BF16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (la torre de texto es la de Cosmos3-Nano, sin detalle de cobertura linguistica) |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | safetensors (bidirectional.safetensors, raw_ar.safetensors, student.safetensors, und.safetensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre Cosmos3-Nano y se adapta a dos condiciones de entrada: mapas de profundidad y normales de superficie exportados por el simulador. Sobre esa base se entrena como modelo autorregresivo con causalidad por bloques: cada bloque de cuatro frames latentes se genera de forma condicionada por los bloques anteriores, que quedan comprometidos en la cache key-value, de modo que las condiciones del siguiente bloque pueden depender de lo que se acaba de generar. El repositorio incluye tres variantes de la torre de generacion: una bidireccional multi-paso, una autorregresiva multi-paso y una estudiante de cuatro pasos obtenida por destilacion con Adversarial Forcing, pensada para inferencia de pocos pasos.

La codificacion y decodificacion del video corren a cargo del VAE de Wan 2.2 TI2V-5B, que no forma parte de este repositorio y debe descargarse por separado. La torre de texto y el tokenizador de Cosmos3-Nano se redistribuyen sin cambios. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Renderizado neuronal condicionado por profundidad y normales de superficie, orientado a generar observaciones visuales coherentes con el estado de un simulador.
- Generacion de video autorregresiva por bloques de cuatro frames latentes, con compromiso en cache key-value para mantener consistencia temporal.
- Tres modos de generacion: bidireccional multi-paso, autorregresivo multi-paso y estudiante destilado de cuatro pasos para baja latencia.
- Integracion con motores de codigo externos: el estado y las reglas los mantiene el simulador; el modelo solo produce la percepcion.
- Flujo de streaming mediante `Cosmos3Stream` y `StreamPolicy` en la libreria de inferencia del proyecto.
- Soporte de inferencia image-to-video como pipeline declarado en Hugging Face.
- No se documentan capacidades de tool calling, razonamiento multi-paso de agentes, vision general, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Entrenamiento de agentes en entornos simulados: el modelo genera las observaciones que consume el agente mientras el simulador mantiene el estado y las reglas, permitiendo ciclos de aprendizaje por refuerzo con percepcion visual realista sin motor grafico dedicado.
- Investigacion en world models: permite estudiar como un agente aprende a partir de percepciones generadas condicionadas por geometria explicita (profundidad y normales), separando el sesgo del simulador del sesgo del renderizador.
- Prototipado de videojuegos y simuladores: un motor ligero que exporte profundidad y normales puede obtener imagenes de salida mediante el modelo en lugar de un pipeline de rasterizacion completo.
- Generacion de video interactiva en streaming: la variante estudiante de cuatro pasos y el bucle de streaming con cache key-value estan pensados para producir bloques de frames de forma continua con baja latencia.
- Evaluacion comparativa de renderizadores: las tres torres (bidireccional, autorregresiva y destilada) permiten medir el compromiso entre calidad y coste computacional en el mismo entorno.
- Reproduccion de experimentos del paper AgentGarten: el repositorio y el codigo asociado permiten replicar los mundos de codigo descritos en la publicacion.
- Generacion image-to-video condicionada por geometria: el pipeline declarado admite usar una imagen y condiciones de profundidad y normales para producir secuencias de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 56,9 GB, correspondientes a cuatro torres de 7.000 millones de parametros en BF16 mas tokenizador y configuracion.
- Cada torre de 7.000 millones de parametros en BF16 requiere aproximadamente 14 GB de VRAM solo para pesos; la inferencia completa necesita ademas el VAE de Wan 2.2 TI2V-5B y las activaciones y caches key-value del streaming.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, se necesitan GPU con al menos 24 GB de VRAM para una torre en BF16, y mas para el pipeline completo con VAE y cache.
- No se documenta compatibilidad con GPU de consumo mas alla de la estimacion por tamano; no hay datos de cuantizacion a 8 o 4 bits.
- Opciones de despliegue: la libreria propia del proyecto (`wm.inference.cosmos3`, `wm.inference.serving`, `wm.networks.cosmos3.streaming`) sobre el codigo de AgentGarten; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la existencia de una variante estudiante de cuatro pasos sugiere un objetivo de inferencia de baja latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentGarten-renderer | 7.000 M por torre | no disponible | Renderizado neuronal condicionado por profundidad y normales | OpenMDW 1.1 | Hugging Face, pesos safetensors |
| nvidia/Cosmos3-Nano (modelo base) | no disponible | no disponible | Generacion de video / world model | no disponible | Hugging Face |
| Wan 2.2 TI2V-5B (VAE usado) | 5.000 M (modelo completo) | no disponible | Generacion image-to-video | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no mantiene estado ni reglas: depende de que un simulador externo exporte profundidad y normales correctos; errores en esas condiciones se propagan a la observacion generada.
- El VAE de Wan 2.2 TI2V-5B no esta incluido en el repositorio y debe descargarse aparte, lo que anade una dependencia externa al despliegue.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni cobertura linguistica; la torre de texto procede de Cosmos3-Nano sin cambios.
- La licencia OpenMDW 1.1 es distinta de las licencias permisivas habituales; debe revisarse el texto completo antes de uso comercial.
- El modelo base Cosmos3-Nano impone sus propias condiciones heredadas a traves de la licencia OpenMDW 1.1.
- No hay informacion sobre cuantizacion, contexto maximo ni latencia, lo que dificulta planificar despliegues en produccion.
- El numero de descargas (94) y de likes (4) indica una adopcion muy temprana; la madurez del ecosistema de inferencia es limitada.
- La fecha de creacion del repositorio (2026-10-08) y la publicacion asociada deben verificarse contra la version final del paper antes de citar resultados.

## Enlaces

- Hugging Face: https://huggingface.co/MirroS-Lab/AgentGarten-renderer
- Paper (arXiv): https://arxiv.org/html/2610.12374v1
- Paper en Hugging Face: https://huggingface.co/papers/2610.12374
- Blog: https://mirros.ai/blog/worlds-for-evolving-agents
- Informe tecnico: https://mirros.ai/report/agent-garten.pdf
- Pagina del proyecto: https://mirros-lab.github.io/agent-garten
- Codigo: https://github.com/MirroS-Lab/AgentGarten
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- VAE Wan 2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
