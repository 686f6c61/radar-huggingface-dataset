# Lucasgitguy-co/spot-snake-d1-3B-v0.1

## Resumen

Spot Snake d1-3B-v0.1 es un ajuste fino (post-entrenamiento) del modelo LiquidAI/d1-3B de Liquid AI, publicado por el usuario Lucasgitguy-co. Su proposito es concreto y acotado: elegir movimientos en el juego "Spot's Biscuit Snake" (un juego tipo snake alojado en el repositorio Gitguy268/spot-snake). No es un modelo de proposito general, sino un modelo de decision especializado que aprende a imitar a un profesor heuristico que prioriza mantener el mayor espacio libre posible en el tablero.

Tecnicamente parte de la arquitectura lfm2_vl del modelo base (3.123.483.888 parametros totales segun los pesos safetensors), aunque el ajuste se centra en la seleccion de movimientos a partir de un estado del juego. El modelo recibe el estado y las opciones de movimiento seguras que el propio juego ya calcula, y las ordena. El objetivo declarado es igualar al profesor heuristico, no superarlo ni optimizar la puntuacion real del juego.

Su relevancia es acotada pero ilustrativa: demuestra un flujo completo de post-entrenamiento (dataset propio, adaptador de rango 8, conversion a GGUF, verificacion de equivalencia entre formatos) sobre un modelo pequeno con capacidades de vision. Es mas un ejemplo de investigacion aplicada a un dominio de juego concreto que una herramienta de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_vl (heredada de LiquidAI/d1-3B) |
| Parametros totales | 3.123.483.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q4_K_M (GGUF publicados); safetensors en bf16 |
| Idiomas soportados | no disponible |
| Licencia | lvw-license-snake-1.0 (LFM Open License v1.0 + Apache-2.0 para contribuciones Spot Snake) |
| Formato de pesos | safetensors (bf16), GGUF (F16, Q4_K_M), adaptador de rango 8 en formato propio (no PEFT) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura lfm2_vl del base LiquidAI/d1-3B, incluida su torre de vision, que segun la model card quedo sin modificar durante el entrenamiento. El ajuste se realizo mediante un adaptador de rango 8 en formato personalizado (no PEFT), que posteriormente se fusiono con los pesos base fijados en la revision `051bcc464b`. Segun el autor, el primer guardado completo se quedo sin disco, por lo que los pesos publicados se reconstruyeron fusionando el adaptador entrenado con el base; no hubo reentrenamiento y el proceso queda documentado en `recovery.json`.

El entrenamiento se hizo sobre el dataset Lucasgitguy-co/spot-snake-decisions-v0.1. El objetivo es imitar a un profesor heuristico que, entre los movimientos que el juego ya marca como seguros, elige el que deja mas espacio libre. Se entrenaron 2 epocas. La metrica reportada es "teacher agreement" (coincidencia con el profesor), no puntuacion de juego, tasa de victoria ni velocidad, que el autor indica explicitamente que no se han medido. No se detalla el numero de tokens de entrenamiento ni la composicion completa del dataset mas alla de su origen.

## Capacidades

- Seleccion de movimientos en "Spot's Biscuit Snake": recibe un estado del juego y una pregunta de eleccion, y ordena las opciones de movimiento seguras.
- Razonamiento de decision acotado al dominio del juego; no es un modelo conversacional general pese a la etiqueta `conversational`.
- Capacidades de vision heredadas del base d1-3B (la torre de vision no se modifico), aunque el ajuste no las entrena ni las evalua.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidad especial: modo de decision "systemone" via endpoint `/v1/systemone` en llama-server.

## Casos de uso

- Investigacion sobre post-entrenamiento de modelos pequenos: sirve como ejemplo reproducible de flujo adaptador -> fusion -> GGUF -> verificacion de equivalencia entre formatos, con scripts y dataset publicos.
- Automatizacion de un agente jugador en Spot's Biscuit Snake: el modelo ordena los movimientos seguros que el juego ya calcula, integrándose en el bucle de juego mediante `scripts/serve.py`.
- Evaluacion de tecnicas de imitacion de heuristicas: util para comparar como un modelo de 3B aproxima un profesor simple y medir "teacher agreement" como metrica de fidelidad.
- Despliegue ligero en local: la variante Q4_K_M en GGUF permite ejecutar el modelo con llama.cpp en hardware modesto para pruebas de juego.
- Estudio de equivalencia de cuantizacion: los chequeos de recarga y de GGUF (F16 y Q4_K_M) al 100% de coincidencia en el subconjunto de 32 filas permiten analizar la estabilidad de la decision tras cuantizar.
- Base para experimentos de vision en juegos: al conservar la torre de vision del base, puede explorarse el uso de entrada visual del tablero, aunque el autor no lo ha probado.

## Benchmarks y rendimiento

Los unicos datos publicados son de "teacher agreement" (coincidencia con el profesor heuristico), no de rendimiento de juego.

| Comprobacion | Teacher agreement |
|---|---|
| Modelo base, validacion | 97,82% (1.785 filas) |
| Mejor de 2 epocas, validacion | 99,61% (1.785 filas) |
| Checkpoint seleccionado, test retenido | 99,82% (1.708 filas) |
| Archivos guardados recargados, subconjunto de test | 100,00% (32 filas) |
| model-f16.gguf, mismo movimiento que safetensors | 100,00% (32 filas) |
| model-Q4_K_M.gguf, mismo movimiento que safetensors | 100,00% (32 filas) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de puntuacion de juego, tasa de victoria o velocidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de ~3,1B parametros en bf16 ocupa aproximadamente 6,2 GB solo en pesos; en Q4_K_M, alrededor de 2 GB, mas overhead de contexto y runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en GPUs consumer con suficiente VRAM; no se confirma compatibilidad concreta con RTX 4090, A100 o H100.
- Cabe en consumer GPU: probable por tamano, pero no verificado ni documentado por el autor.
- Opciones de despliegue: `scripts/serve.py` (servidor local en http://127.0.0.1:8000) y llama.cpp (`llama-server`) en revision `1b6935b` o posterior para los GGUF. Carga con `AutoModel.from_pretrained(..., trust_remote_code=True)` usando transformers `>=5.22,<6`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spot Snake d1-3B-v0.1 | 3,12B | no disponible | Decision en juego concreto | lvw-license-snake-1.0 | Hugging Face (safetensors + GGUF) |
| LiquidAI/d1-3B (base) | ~3B (segun base) | no disponible | Modelo general con vision | LFM Open License v1.0 | Hugging Face |
| Alternativas de juego especifico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de decision en juegos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ordena movimientos que el juego ya marca como seguros; no sustituye las comprobaciones de colision del propio juego.
- El profesor es una heuristica, no un jugador optimo; igualarlo es el objetivo, no superar la puntuacion.
- Las puntuaciones de confianza no estan calibradas tras el entrenamiento.
- No se han medido puntuacion de juego, tasa de victoria ni velocidad; "teacher agreement" no equivale a rendimiento real en partida.
- La licencia lvw-license-snake-1.0 combina la LFM Open License v1.0 (con su limite de uso comercial, heredado de los pesos de Liquid AI) y Apache-2.0 para las contribuciones nuevas; no es posible relicenciar bajo MIT o Apache-2.0 simple. Revisar `LICENSE`, `NOTICE` y `licenses/` antes de uso comercial.
- La torre de vision no se entreno y el proyector de vision de esta variante no se pudo convertir con la version fijada de llama.cpp (no probado); para vision habria que usar `mmproj-d1-3B-F16.gguf` del repo oficial del base.
- Los pesos publicados se reconstruyeron fusionando el adaptador con el base tras un fallo de disco; el autor documenta el proceso en `recovery.json`.
- No se declaran idiomas soportados ni contexto, lo que limita su uso fuera del dominio del juego.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/spot-snake-d1-3B-v0.1
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- GGUF del base (proyector de vision): https://huggingface.co/LiquidAI/d1-3B-GGUF
- Dataset de decisiones: https://huggingface.co/datasets/Lucasgitguy-co/spot-snake-decisions-v0.1
- Coleccion Spot Snake: https://huggingface.co/collections/Lucasgitguy-co/spot-snake-models-6aec255c05f37ecf15f1fe33
- Repositorio del juego: https://github.com/Gitguy268/spot-snake
- Informe tecnico (paper): docs/paper.md y docs/paper.pdf (dentro del repo del modelo)
- Cita BibTeX: docs/citation.bib
- Indice de modelos: docs/MODEL_INDEX.md
