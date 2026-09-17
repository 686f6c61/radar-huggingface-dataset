# open-athena/tinker-qwen3.5-9b-native-sft-step-400

## Resumen

Este repositorio contiene un adaptador LoRA de rango 128 entrenado mediante SFT estilo Tinker sobre el modelo base `Qwen/Qwen3.5-9B-Base`. No es un modelo completo ni un checkpoint final: es el paso 400 de una ejecución de 3.000 pasos sobre la corriente OpenThoughts3 (semilla 0, 384.000 filas), por lo que se trata de un artefacto intermedio pensado para investigación y reproducibilidad.

El adaptador se publica en dos formas: en la raíz del repositorio, un adaptador con QKV fusionado listo para inferencia y carga mediante OPD; y en `sft-training-checkpoint-400/`, el checkpoint original de Axolotl con 20 ficheros (adaptador con Q/K/V separados, estado del optimizador, scheduler, RNG, tokenizador y estado del entrenador), necesario para reanudar el SFT en lugar de limitarse a cargar los pesos del paso 400. La conversión de factores Q/K/V separados a QKV fusionado la realizó el fork de Axolotl de Marin en la revisión `d5ae94ae7446d3f3fc4ebc8d97fd9d00319f9811`.

Su relevancia es acotada pero específica: documenta un punto de control intermedio de un proceso de reproducción de Tinker, con hashes SHA-256 publicados, revisión exacta del modelo base y una medición de AIME 2024 de una sola muestra (19/30). Además, una única actualización OPD con MarinSkyRL sobre este adaptador produjo un checkpoint que puntuó 26/30, lo que lo convierte en un punto de partida útil para estudiar dinámicas de RL sobre modelos ya sometidos a SFT. El repositorio no declara licencia, idiomas soportados ni pipeline, y acumula cero descargas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer `Qwen/Qwen3.5-9B-Base`; adaptador publicado con QKV fusionado |
| Parámetros totales | No disponible para el adaptador; el modelo base se denomina 9B (aproximadamente 9.000 millones) |
| Parámetros activos | No aplica: no hay indicios de que el modelo base sea MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. Los pesos se distribuyen en safetensors sin cuantizar; el adaptador puede cargarse sobre una base cuantizada, pero no se documenta ninguna combinación concreta |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT/LoRA); el subdirectorio `sft-training-checkpoint-400/` incluye `optimizer.pt` y el resto del estado de entrenamiento |
| Rango del adaptador | 128 |
| Modelo base | `Qwen/Qwen3.5-9B-Base`, revisión `68c46c4b3498877f3ef123c856ecfde50c39f404` |
| Librería | peft |
| Etiquetas | peft, safetensors, lora, qwen3.5, experimental |
| Tamaño del repositorio | 10,3 GB |
| Pipeline | No disponible |
| SHA-256 del adaptador | `adapter_config.json`: `ab604790f400d65bc8f53a221de417c5c559d68031184a82f49e380d5362b131`; `adapter_model.safetensors`: `50a4510256c71a1cd0f49ba1866903660a38ce6e06a8d8d0cb7daaa3a8d945b0` |
| SHA-256 del adaptador con QKV separado | `684f168d3ed1ff4a186ee1ebc1c9e92a22ef382f3b537013f397f88a976e1352` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 128 sobre `Qwen/Qwen3.5-9B-Base`. No se especifica en la información disponible la arquitectura interna del modelo base (número de capas, dimensión oculta, tipo de atención ni si incorpora componentes híbridos), por lo que cualquier detalle adicional debe consultarse en la ficha del modelo base. El entrenamiento se realizó con Axolotl sobre la corriente OpenThoughts3 (semilla 0, 384.000 filas) y consistió en 3.000 pasos de SFT; este repositorio preserva el paso 400. La conversión desde factores Q/K/V separados a un adaptador con QKV fusionado fue responsabilidad del fork de Axolotl de Marin en la revisión `d5ae94ae7446d3f3fc4ebc8d97fd9d00319f9811`.

La model card advierte explícitamente de que el SFT original de Axolotl y el optimizador alojado en Tinker no son idénticos, de modo que este checkpoint no debe tratarse como una reproducción exacta de Tinker sino como una aproximación nativa. El subdirectorio `sft-training-checkpoint-400/` conserva el estado completo de Axolotl (20 ficheros: adaptador con QKV separado, optimizador, scheduler, RNG, tokenizador, estado del entrenador y `checkpoint-commit.json`), lo que permite reanudar el SFT y no solo inferir. El checkpoint original también está registrado en `s3://marin-us-east-02a/iris/cw-rno2a/experiments/tinker-native-repro/20260916t/sft-full/peft/checkpoint-400/`. No se documentan en la información disponible fases de RLHF, DPO ni preferencias humanas para este adaptador en concreto.

## Capacidades

- Continuación de SFT a partir de un checkpoint intermedio: el paquete incluye optimizador, scheduler y estado de RNG, por lo que permite reanudar el entrenamiento en lugar de limitarse a inferencia.
- Inferencia sobre el modelo base con el adaptador fusionado: la raíz del repositorio contiene el adaptador con QKV fusionado listo para carga mediante PEFT y para OPD.
- Punto de partida para RL: se documenta una actualización OPD nativa con MarinSkyRL sobre este adaptador, usando 512 prompts de DeepMath y cuatro rollouts de estudiante por prompt.
- Razonamiento matemático medido: evaluación de una muestra en AIME 2024 con 19/30 aciertos y sin truncamientos en el paso 400.
- Reproducibilidad verificable: hashes SHA-256 de los ficheros principales, revisión exacta del modelo base y revisión del fork que hizo la conversión.
- Compatibilidad con el ecosistema PEFT/Axolotl: al ser un adaptador LoRA estándar, se integra en flujos que ya usan dichas librerías.
- Capacidades adicionales (tool calling, function calling, agentes, visión, audio, modo thinking explícito, multilingüismo): no disponibles en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de SFT: el repositorio permite descargar el paso 400 con hashes verificables y comparar el resultado con el checkpoint final de la ejecución de 3.000 pasos, o con ejecuciones propias sobre la misma corriente de OpenThoughts3.
- Investigación en RL sobre modelos post-SFT: el adaptador sirve como inicialización para actualizaciones OPD; la model card documenta una actualización con 512 prompts de DeepMath que elevó la puntuación de AIME 2024 de 19/30 a 26/30, lo que lo hace adecuado para estudiar la ganancia marginal del RL sobre un punto intermedio.
- Reanudación de entrenamientos interrumpidos: el subdirectorio `sft-training-checkpoint-400/` contiene optimizador, scheduler y RNG, de modo que un equipo puede retomar el SFT con Axolotl desde el paso 400 sin recalcular estados.
- Auditoría de conversiones QKV: dado que se publican tanto el adaptador fusionado como el original con Q/K/V separados, con sus respectivos hashes, resulta útil para validar herramientas de conversión y comprobar equivalencias numéricas.
- Evaluación de metodologías de evaluación: el propio repositorio documenta que una evaluación de una sola muestra en AIME 2024 es sensible al azar y que el resultado posterior al OPD está marcado como no comparable por dos truncamientos, lo que lo convierte en un caso práctico para discutir protocolos de scoring.
- Estudio de checkpoints intermedios: comparar el paso 400 con pasos posteriores permite analizar cómo evolucionan las capacidades de razonamiento matemático a lo largo del SFT, siempre que se disponga de los otros puntos de control.
- Integración en pipelines de investigación con PEFT: al ser un adaptador LoRA de rango 128 en safetensors, puede cargarse en flujos existentes de evaluación y ablation sin necesidad de reentrenar el modelo base.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| AIME 2024 | Adaptador del paso 400, evaluación de una sola muestra, sin truncamientos | 19/30 |
| AIME 2024 | Una actualización OPD nativa con MarinSkyRL (512 prompts de DeepMath, cuatro rollouts de estudiante por prompt), puntuación bruta | 26/30 |
| AIME 2024 | Misma actualización OPD, entre respuestas completadas | 26/28 (dos respuestas truncadas; evaluación marcada como no comparable en su manifiesto) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card advierte de que las repeticiones estocásticas no tienen por qué reproducir la misma puntuación de una sola muestra.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato oficial. Como estimación derivada del tamaño del modelo base, cargar aproximadamente 9.000 millones de parámetros en bf16 requiere del orden de 18 GB solo para los pesos, a lo que se suma la memoria del adaptador y la caché de claves/valores.
- Cuantización: no se documenta ninguna combinación probada. En escenarios habituales, una carga en 8 bits de un modelo de ~9B ronda los 9-10 GB y una en 4 bits ronda los 5-6 GB, cifras que deben tomarse como orientativas y no como requisitos publicados por el autor.
- GPU consumer: con cuantización de 4 bits, un modelo de ~9B suele encajar en GPU de 12 GB (RTX 3060 12 GB, RTX 4070) y con holgura en 24 GB (RTX 3090, RTX 4090). Con cuantización de 8 bits o bf16 conviene disponer de 16-24 GB o más.
- GPU de centro de datos: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) permiten cargar el modelo sin cuantizar o con margen para lotes grandes, si bien no hay cifras de rendimiento publicadas para este adaptador.
- Despliegue: al ser un adaptador PEFT sobre un transformer convencional, las opciones habituales son vLLM, TGI, llama.cpp/Ollama (requiere conversión a GGUF, no documentada para este adaptador) y transformers con PEFT. Para reanudar el entrenamiento se necesita Axolotl y el subdirectorio `sft-training-checkpoint-400/`.
- Almacenamiento: el repositorio ocupa 10,3 GB, principalmente por el estado del optimizador y del entrenador; para solo inferencia basta con el adaptador de la raíz y el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA comparables ni sobre los resultados de sus evaluaciones, por lo que la comparación se limita a las variantes directamente relacionadas con este artefacto.

| Modelo | Parámetros | Contexto | AIME 2024 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adaptador del paso 400 (este repositorio) | LoRA rango 128 sobre base de ~9B | No disponible | 19/30 (una muestra) | No disponible | Público en HuggingFace |
| Mismo adaptador tras una actualización OPD con MarinSkyRL | Igual | No disponible | 26/30 bruto; 26/28 entre respuestas completadas | No disponible | Documentado en el README de MarinSkyRL, no como repositorio independiente en la información disponible |
| `Qwen/Qwen3.5-9B-Base` | ~9B | No disponible | No disponible | No disponible | Público en HuggingFace |
| Checkpoint final de la ejecución de 3.000 pasos | LoRA sobre base de ~9B | No disponible | No disponible | No disponible | No publicado en la información disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio del paso 400 de 3.000, no la reproducción final de Tinker; el propio autor lo señala de forma explícita.
- El SFT original de Axolotl y el optimizador alojado en Tinker no son idénticos, por lo que las trayectorias de entrenamiento pueden divergir respecto a una reproducción canónica.
- La evaluación de AIME 2024 es de una sola muestra y el autor advierte de que las repeticiones estocásticas pueden arrojar puntuaciones distintas; no debe interpretarse como una medida estable.
- El resultado de 26/30 tras la actualización OPD está marcado como no comparable: dos respuestas se truncaron y la puntuación entre respuestas completadas (26/28) no es directamente equiparable al 26/30 bruto.
- No se declara licencia en el repositorio, por lo que el uso comercial queda sin cobertura explícita; además, el adaptador depende del modelo base, cuya licencia condiciona cualquier uso derivado.
- No hay información publicada sobre sesgos, composición lingüística ni comportamiento fuera del dominio matemático; las capacidades multilingües no están documentadas.
- No se especifican la longitud de contexto soportada ni el consumo de memoria en producción, lo que dificulta planificar despliegues.
- Riesgo de alucinación: inherente a los modelos de lenguaje; aquí no hay evaluación específica de veracidad, solo de razonamiento matemático en un benchmark con respuesta verificable.
- Las etiquetas incluyen `experimental` y el repositorio registra cero descargas y cero valoraciones, de modo que no existe validación por parte de terceros.
- Para cargar el adaptador es necesario usar la revisión exacta del modelo base indicada (`68c46c4b3498877f3ef123c856ecfde50c39f404`); otras revisiones pueden producir resultados distintos.
- El repositorio ocupa 10,3 GB porque incluye el estado del optimizador; descargarlo completo solo tiene sentido si se va a reanudar el entrenamiento.
- Los datos de entrenamiento provienen de OpenThoughts3, por lo que se heredan los sesgos y limitaciones de ese conjunto, no documentados aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/tinker-qwen3.5-9b-native-sft-step-400
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- README de reproducción de MarinSkyRL (resultado del paso 400 y actualización OPD): https://github.com/marin-community/MarinSkyRL/blob/main/skyrl-train/ci/opd/tinker_repro/README.md#step-400-sft-and-one-step-opd-result
- Artefactos originales del entrenamiento en S3: `s3://marin-us-east-02a/iris/cw-rno2a/experiments/tinker-native-repro/20260916t/sft-full/peft/checkpoint-400/`
- Búsqueda web: los resultados recuperados (Open, OpenAI, Apache OpenOffice, The Open University) no guardan relación con el modelo y no aportan enlaces adicionales utilizables.
