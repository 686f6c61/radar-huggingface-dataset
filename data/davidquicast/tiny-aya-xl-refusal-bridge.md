# davidquicast/tiny-aya-xl-refusal-bridge

## Resumen

Tiny Aya XL-Refusal-Bridge es un adaptador de inferencia para el modelo multilingüe CohereLabs/tiny-aya-global, desarrollado por davidquicast en el contexto del hackathon Lexsi. No se trata de un modelo con pesos propios: el repositorio contiene únicamente un fichero `bridge.safetensors` con una sonda lineal (2.048 floats) y tres direcciones de rechazo unitarias, más un `config.json` con los hiperparámetros del mecanismo. El objetivo es aumentar la tasa de rechazo ante peticiones dañinas en diez idiomas sin degradar las capacidades del modelo base.

La técnica empleada es activation steering en tiempo de inferencia. Una sonda lineal invariante al idioma, evaluada en la capa 20, actúa como puerta; cuando se abre, aplica un clamp de proyección sobre la dirección de rechazo en inglés en las capas 25, 27 y 29. Cuando la puerta está cerrada, el forward pass es idéntico al del modelo base, de modo que no se alteran los pesos ni se requiere un proceso de fine-tuning.

La relevancia actual del proyecto reside en su enfoque de seguridad multilingüe de bajo coste: según la model card, la tasa de éxito de ataque macro baja del 5,4 % al 0,1 % en el split de test, y la brecha del peor idioma respecto al inglés se reduce de 9,3 a 0,7 puntos porcentuales, manteniendo la precisión en Belebele en el 75,6 %. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de activation steering sobre transformer (modelo base CohereLabs/tiny-aya-global) |
| Parámetros totales | No disponible (el adaptador contiene 2.048 floats de sonda y 3 direcciones unitarias; el modelo base no se distribuye en este repo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, zh, it, vi, ar, ko, th, bn, sw, jv |
| Licencia | MIT |
| Formato de pesos | safetensors (`bridge.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El adaptador no modifica los pesos del modelo base. Su funcionamiento se articula en dos componentes: una sonda lineal invariante al idioma en la capa 20 que decide si se activa la intervención, y un clamp de proyección sobre la dirección de rechazo calculada en inglés en las capas 25, 27 y 29. La dirección de rechazo se obtiene como diferencia de medias, lo que el autor describe explícitamente como suficiente para guiar la activación pero no como una afirmación sobre el mecanismo interno del modelo. El `config.json` expone las capas, el umbral `tau`, la fuerza `c`, las proyecciones objetivo `m_star` y metadatos de selección.

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que no se entrena el modelo base. La evaluación se realizó sobre el split de test con diez idiomas y 150 prompts dañinos por idioma, según la model card. El autor indica que el método, las ablaciones, la transferencia a idiomas no vistos y las limitaciones se documentan en el artículo del repositorio de código.

## Capacidades

- Modulación del rechazo ante peticiones dañinas directas en diez idiomas, con una tasa de rechazo del 95,6 % frente al 69,9 % del modelo base.
- Reducción de la tasa de éxito de ataque macro del 5,4 % al 0,1 % en el split de test.
- Comportamiento idéntico al modelo base cuando la puerta de la sonda está cerrada, sin coste en el forward pass en ese caso.
- Transferencia a idiomas no vistos, según se documenta en el artículo del repositorio de código.
- Conservación de la precisión multilingüe: Belebele se mantiene en el 75,6 % con y sin el adaptador.
- Integración mediante la API de Python del paquete `xlrb` (`load_bridge`, `Bridge`, `generate`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión o audio, que dependerían del modelo base.

## Casos de uso

- Despliegue de asistentes multilingües con filtro de seguridad en inferencia: el adaptador se aplica sobre tiny-aya-global sin reentrenar y eleva el rechazo de peticiones dañinas al 95,6 % en diez idiomas, lo que permite cubrir mercados con idiomas de bajos recursos como sw, jv o bn.
- Moderación previa en pipelines de generación: al actuar como capa de steering en las capas 25, 27 y 29, se puede integrar en el servicio de inferencia para reducir respuestas dañinas antes de que lleguen al usuario final.
- Investigación en seguridad multilingüe: la sonda invariante al idioma y las direcciones de rechazo permiten estudiar la transferencia de representaciones de seguridad entre idiomas sin coste de fine-tuning.
- Prototipado rápido en hackathons y entornos de investigación: el paquete `xlrb` se instala con `pip install -e .` y el adaptador se carga desde Hugging Face con `snapshot_download`, lo que facilita experimentos en horas.
- Evaluación comparativa de mecanismos de refusal: el benchmark asociado (xl-refusal-bench) y la demo en Spaces permiten contrastar el comportamiento base frente al adaptado con métricas reproducibles.
- Sistemas con requisitos estrictos de licencia: la licencia MIT del adaptador facilita su incorporación en productos comerciales, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

Resultados del split de test con diez idiomas y 150 prompts dañinos por idioma, según la model card:

| Métrica | Base | + bridge |
|---|---|---|
| Éxito de ataque (macro) | 5,4 % | 0,1 % |
| Rechazo de prompts dañinos | 69,9 % | 95,6 % |
| Rechazo de prompts benignos | 6,0 % | 8,2 % |
| Rechazo de prompts XSTest-safe | 17,6 % | 24,4 % |
| Brecha del peor idioma respecto al inglés (éxito de ataque) | 9,3 pp | 0,7 pp |
| Precisión Belebele | 75,6 % | 75,6 % |

El autor advierte que las tasas de éxito de ataque cercanas al 5 % están próximas al suelo de ruido del juez automático y que la tasa de rechazo es la medida más fiable. El sobre-rechazo en prompts alarmantes pero seguros aumenta aproximadamente 7 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base CohereLabs/tiny-aya-global, no del adaptador, que ocupa un tamaño de repositorio de 0,0 GB.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador se integra mediante el paquete Python `xlrb` sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible; cuando la puerta está cerrada el forward pass es idéntico al del modelo base, pero no se cuantifica el coste cuando está abierta.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores de refusal o activation steering multilingüe) con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El adaptador se ajustó y evaluó sobre peticiones dañinas directas (MultiJail), no sobre jailbreaks adversariales, por lo que su eficacia frente a ataques elaborados no está validada.
- La evaluación se realizó sobre un único modelo base, lo que limita la generalización de los resultados.
- La dirección de rechazo es una diferencia de medias: es suficiente para guiar la activación, pero no constituye una afirmación sobre el mecanismo interno del modelo.
- El sobre-rechazo en prompts alarmantes pero seguros aumenta aproximadamente 7 puntos porcentuales (del 17,6 % al 24,4 % en XSTest-safe), lo que puede degradar la experiencia en casos legítimos.
- Las tasas de éxito de ataque cercanas al 5 % del modelo base están próximas al suelo de ruido del juez automático, lo que introduce incertidumbre en esa métrica.
- La licencia MIT del adaptador no exime de cumplir la licencia del modelo base CohereLabs/tiny-aya-global.
- El repositorio registra 0 descargas y 0 likes, y no se documentan resultados de benchmarks más allá de los de la model card.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico del adaptador ni limitaciones de contexto, al depender estos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidquicast/tiny-aya-xl-refusal-bridge
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio de código: https://github.com/davidquicast/xl-refusal-bridge
- Benchmark: https://huggingface.co/datasets/davidquicast/xl-refusal-bench
- Demo: https://huggingface.co/spaces/davidquicast/xl-refusal-bridge
