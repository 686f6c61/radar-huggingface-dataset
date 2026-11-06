# eoinf/power_decay_empirical_support_2b_schedule_200m_dmodel8_16_32_64_earlystop

## Resumen

`power_decay_empirical_support_2b_schedule_200m_dmodel8_16_32_64_earlystop` es un artefacto de investigación publicado por el usuario `eoinf` en Hugging Face. No se trata de un modelo de lenguaje destinado a uso general, sino de una cuadrícula de experimentos con transformers causales minúsculos (d_model de 8, 16, 32 y 64) entrenados con una semilla por anchura, vocabulario de 4096 tokens y longitud de contexto de 256. El nombre del repositorio sugiere un estudio sobre el soporte empírico de schedules de decaimiento en potencia ("power decay") con un presupuesto nominal de aproximadamente 2.000 millones de tokens y paradas tempranas.

El propósito es académico: generar evidencia empírica sobre cómo escalan las curvas de pérdida en modelos extremadamente pequeños bajo distintos regímenes de decaimiento del learning rate. El repositorio contiene únicamente state-dicts de PyTorch, el historial de checkpoints, el log de actualizaciones de entrenamiento y metadatos de resultados; no incluye estados del optimizador ni los datos de entrenamiento.

Por su escala (d_model de 8 a 64, contexto de 256) y por la ausencia de una model card orientada a uso, este artefacto no es adecuado para inferencia en producción ni para tareas generativas reales. Su interés es exclusivamente metodológico para investigadores que estudien dinámicas de entrenamiento, schedules de learning rate y leyes de escala en regímenes de juguete.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (variantes con d_model 8, 16, 32 y 64) |
| Parámetros totales | no disponible (depende de la anchura; no se publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible (solo state-dicts en PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | state-dicts de PyTorch (no safetensors, no GGUF) |
| Vocabulario | 4096 tokens |
| Semillas por anchura | 1 |
| Presupuesto nominal de entrenamiento | 1.999.998.976 tokens |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de escala de juguete, con cuatro anchuras distintas (d_model = 8, 16, 32 y 64) y una única semilla por anchura. El vocabulario es de 4096 tokens y el contexto de 256 tokens. El entrenamiento sigue un schedule nominal de 1.999.998.976 tokens, aunque los horizontes reales por modelo, incluidas las paradas tempranas, se registran en `grid_summary.json` y `result.json`. El dataset y el tokenizador se describen en `configuration.json`, y los ajustes de evaluación también se recogen allí.

El repositorio no incluye estados de reanudación del optimizador ni los datos de entrenamiento, solo los checkpoints (state-dicts), la definición de la ejecución, el historial de checkpoints, el log de actualizaciones de entrenamiento y los metadatos de resultados. El código de arquitectura y carga reside en el repositorio `synthetic_trigrams`. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mezclas de expertos; el interés del artefacto es el estudio del schedule de decaimiento en potencia ("power decay") y su soporte empírico.

## Capacidades

- Generación de texto a nivel de juguete: puede producir secuencias de hasta 256 tokens sobre un vocabulario de 4096, pero sin calidad utilizable fuera del contexto experimental.
- Modelado de lenguaje causal: entrenado con objetivo de predicción del siguiente token.
- Estudio de dinámicas de entrenamiento: los checkpoints y logs permiten analizar curvas de pérdida y comportamiento del schedule.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el vocabulario de 4096 tokens sugiere un tokenizador muy limitado.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre schedules de learning rate: el artefacto permite reproducir y analizar el efecto del decaimiento en potencia sobre curvas de pérdida en cuatro anchuras distintas, comparando horizontes efectivos tras paradas tempranas.
- Estudio de leyes de escala en régimen de juguete: con d_model de 8 a 64 y un presupuesto nominal fijo de ~2.000 millones de tokens, sirve para explorar cómo varía la pérdida con la anchura en condiciones controladas.
- Validación de infraestructura de entrenamiento: los state-dicts y logs permiten comprobar pipelines de carga, reanudación y evaluación sin coste computacional relevante.
- Docencia y divulgación: modelos de este tamaño son útiles para ilustrar el funcionamiento interno de un transformer causal y el efecto de hiperparámetros en el entrenamiento.
- Reproducibilidad metodológica: al incluir `grid_summary.json`, `result.json` y `configuration.json`, facilita la verificación de resultados por terceros.
- Análisis de paradas tempranas: los horizontes efectivos registrados permiten estudiar cuándo y por qué se detiene el entrenamiento en cada configuración.
- Baseline para experimentos de tokenización: con vocabulario de 4096 y contexto de 256, puede servir como referencia mínima en estudios sobre tokenizadores y datasets sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuración razonable, dado el tamaño del repositorio (0,3 GB) y las anchuras de 8 a 64.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente; también CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU e incluso en CPU.
- Opciones de despliegue: carga directa de state-dicts con PyTorch; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato (state-dict, no safetensors ni GGUF) complica su uso en esos ecosistemas.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Propósito |
|---|---|---|---|---|---|
| Este artefacto (d_model 8-64) | no disponible | 256 | no disponible | Hugging Face (state-dicts) | Estudio de schedules |
| GPT-2 small | 124M | 1024 | MIT | Hugging Face (safetensors) | LM de propósito general |
| Pythia-70M | 70M | 2048 | Apache 2.0 | Hugging Face (safetensors) | Investigación de escalado |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Hugging Face (safetensors) | LM de propósito general |

La comparación es solo orientativa: los tres modelos de referencia son transformers causales con pesos en safetensors y licencias explícitas, mientras que este artefacto es una cuadrícula experimental con state-dicts y sin licencia declarada. No se dispone de métricas de rendimiento comparables.

## Limitaciones y advertencias

- No es un modelo para producción: la escala (d_model de 8 a 64, contexto de 256) y la ausencia de una model card orientada a uso lo desaconsejan para cualquier tarea generativa real.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni para redistribución.
- Idiomas no disponibles: el vocabulario de 4096 tokens limita severamente la cobertura lingüística.
- Riesgo de alucinación: intrínseco a cualquier modelo de lenguaje, agravado aquí por la falta de datos de evaluación publicados.
- Sesgos conocidos: no documentados; el dataset se describe solo en `configuration.json`, sin análisis de composición.
- Formato de pesos en state-dicts de PyTorch: requiere el código de `synthetic_trigrams` para cargar el modelo, lo que añade fricción frente a safetensors o GGUF.
- Sin estados del optimizador ni datos de entrenamiento: no es posible reanudar el entrenamiento tal cual desde el repositorio.
- Una sola semilla por anchura: los resultados pueden tener alta varianza y no permiten estimar intervalos de confianza robustos.
- Sin benchmarks publicados: no hay evidencia de rendimiento downstream que permita comparaciones cuantitativas.

## Enlaces

- Hugging Face: https://huggingface.co/eoinf/power_decay_empirical_support_2b_schedule_200m_dmodel8_16_32_64_earlystop
- Repositorio de código `synthetic_trigrams`: mencionado en la model card, sin URL directa disponible en la información proporcionada.
- Paper, blog o demo: no disponibles en la información proporcionada.
