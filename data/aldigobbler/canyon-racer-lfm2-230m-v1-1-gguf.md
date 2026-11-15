# aldigobbler/canyon-racer-lfm2-230m-v1.1-gguf

## Resumen

Canyon Racer LFM2.5-230M v1.1 (GGUF) es un modelo de política de juego (game policy) derivado de LiquidAI/LFM2.5-230M mediante un LoRA de rango 32 fusionado en los pesos base. No es un modelo conversacional general: su única función es leer una observación textual del estado de un juego ("Canyon Racer") y responder con una sola palabra de acción entre siete posibles (`left`, `right`, `up`, `down`, `a`, `b`, `wait`). Lo publica el usuario aldigobbler bajo el identificador `aldigobbler/canyon-racer-lfm2-230m-v1.1-gguf`.

El modelo resuelve un problema muy acotado: portar la lógica de un juego a un agente controlado por lenguaje, donde el modelo actúa como política de decisión en un bucle de refuerzo. Se distribuye exclusivamente en formato GGUF para su uso con llama.cpp, en dos precisiones: Q4_K_M (~147 MB) y BF16 (~441 MB). El checkpoint corresponde a la iteración de entrenamiento 170.

Por su tamaño (229.693.184 parámetros, ~230 M) y su naturaleza de política especializada, es relevante para quien quiera experimentar con agentes basados en modelos pequeños, RL aplicado a modelos de lenguaje y despliegue de inferencia en entornos con recursos mínimos (CPU, dispositivos embebidos). Su utilidad fuera del dominio del juego es prácticamente nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-230M; el autor no detalla la arquitectura interna) |
| Parámetros totales | 229.693.184 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M y BF16 |
| Idiomas soportados | no disponible (la salida está restringida a acciones en inglés) |
| Licencia | no disponible en la ficha de HF; la model card remite a la licencia del modelo base y a CC-BY-NC-SA 4.0 del proyecto Canyon Racer |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del repositorio | 0.6 GB |
| Modelo base | LiquidAI/LFM2.5-230M |
| Checkpoint de entrenamiento | Iteración 170 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base LFM2.5-230M, por lo que este dato queda como no disponible. Lo que sí se especifica es el procedimiento de ajuste: se parte de un "expert SFT" seguido de PPO con un profesor PPO congelado denominado `main11`, optimizando la divergencia `KL(teacher || student)` con coeficiente 0.02. El adaptador LoRA tiene rango 32 y se fusiona en los pesos base para esta release, de modo que el GGUF exportado contiene únicamente el modelo de lenguaje fusionado.

El entorno de entrenamiento es de una sola vida, con repetición de acción de 4 pasos y una observación estructurada. La evaluación se ejecuta hasta el fin de la partida, con un límite de seguridad de 600 segundos para evitar evaluaciones no terminantes. Es importante señalar que la acción LM (prior) y la value head del script de entrenamiento no forman parte del GGUF: solo se exporta el modelo de lenguaje. El vocabulario de salida efectivo queda restringido a las siete palabras de acción indicadas.

## Capacidades

- Generación de una única palabra de acción a partir de una observación textual estructurada del estado del juego.
- Control de agente en bucle cerrado dentro del entorno Canyon Racer (política de decisión).
- Acciones soportadas y exhaustivas: `left`, `right`, `up`, `down`, `a` (salto), `b` (guardar) y `wait` (soltar botones).
- Razonamiento de juego de tipo arcade: mantener `a` para saltar más alto, con invulnerabilidad a colisiones mientras se está en el aire (según la descripción del entorno).
- No soporta tool calling, function calling, agentes multi-paso generales, visión, audio ni capacidades multilingües.
- No es un modelo de chat general; cualquier petición fuera del formato de observación produce salidas no fiables.

## Casos de uso

- Agente jugador autónomo en Canyon Racer: el modelo se invoca en cada paso del bucle, recibe la observación generada por `obs_text()` en `canyon_rl/python/canyon_env.py` y devuelve una acción válida, permitiendo partidas completas sin intervención humana.
- Investigación en RL con modelos de lenguaje pequeños: sirve como caso de estudio de PPO con destilación de un profesor congelado mediante `KL(teacher || student)`, útil para reproducir o comparar pipelines de entrenamiento.
- Benchmarking de inferencia en llama.cpp: con ~147 MB en Q4_K_M, permite medir latencia y throughput de un modelo de 230 M en CPU o GPU de gama baja, en un escenario de decisión por token.
- Pruebas de integración de agentes en CI: al ser determinista en formato y de salida corta (una palabra), se puede usar para validar pipelines de evaluación de entornos de juego de forma reproducible.
- Enseñanza de RL aplicado a LLM: ejemplo didáctico de cómo se fusiona un adaptador LoRA y se exporta a GGUF para despliegue, con documentación del formato de prompt.
- Desarrollo de entornos de juego: como política de referencia ("baseline") para comparar contra versiones posteriores o contra agentes basados en heurísticas, en un juego con reglas simples y mensurables.
- Demostración de despliegue en dispositivos embebidos: el tamaño reducido del GGUF Q4_K_M permite ejecutarlo en entornos con CPU y memoria muy limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. El archivo Q4_K_M ocupa ~147 MB y el BF16 ~441 MB, por lo que la huella de pesos es inferior a 0,5 GB en cualquier caso; la memoria total dependerá del contexto y del backend (no disponible con precisión).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM puede alojar el modelo; también funciona en CPU sin dificultad. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la documentación.
- Cabe en GPU consumer: sí, en todas las gamas actuales, dado el reducido tamaño de los pesos. También en CPU y, presumiblemente, en dispositivos embebidos.
- Opciones de despliegue: llama.cpp (formato nativo), mediante `llama-cli` con el ejemplo de la model card. Otros runners compatibles con llama.cpp podrían servir, pero no se documentan explícitamente.
- Latencia y throughput: no disponibles. La inferencia se limita a `-n 1` (un token) por paso en el ejemplo, lo que sugiere un caso de uso de baja latencia por decisión, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos completos de modelos comparables en la información proporcionada. A continuación se compara con el modelo base del que deriva, que es el único con datos parciales:

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Canyon Racer LFM2.5-230M v1.1 (GGUF) | 229.693.184 | no disponible | GGUF | no disponible en HF; referencia a licencia del base y CC-BY-NC-SA 4.0 | Política de juego especializada, salida restringida a 7 acciones |
| LiquidAI/LFM2.5-230M (base) | ~230 M (según derivación) | no disponible | no disponible en esta información | no disponible | Modelo de lenguaje general del que deriva el ajuste |

No se identifican en la información disponible otros modelos comparables de la misma categoría (políticas de juego basadas en LLM de ~230 M) con datos públicos de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Modelo de propósito extremadamente específico: solo devuelve una de las siete acciones del juego. No debe usarse como chat general ni para tareas de texto libre.
- Riesgo de salidas inválidas fuera del formato esperado: si la observación no sigue el formato de `obs_text()`, el modelo puede generar palabras no válidas, que el entorno penaliza.
- No se exportan la value head ni la acción LM del entrenamiento: la política disponible es solo la del modelo de lenguaje, lo que puede afectar a la reproducibilidad exacta del comportamiento entrenado.
- Licencia: la ficha de Hugging Face no indica licencia; la model card remite a la licencia del modelo base y a la licencia del proyecto Canyon Racer (CC-BY-NC-SA 4.0). Esto implica, como mínimo, restricciones de uso no comercial y de compartir igual, y debe verificarse la licencia del modelo base LiquidAI/LFM2.5-230M antes de cualquier uso.
- Idiomas: la salida está restringida a tokens de acción en inglés; no hay soporte multilingüe.
- Sesgos y alucinación: no documentados. Al ser una política entrenada en un entorno acotado, los fallos se manifiestan como acciones subóptimas más que como alucinaciones textuales.
- Código y matemáticas: no soportados; cualquier uso en esos dominios carece de sentido.
- Producción: viable solo en el entorno del juego. Para otros fines, no es adecuado.
- Fecha de creación y actualización del repositorio: 2026-11-14, con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aldigobbler/canyon-racer-lfm2-230m-v1.1-gguf
- Modelo base LiquidAI/LFM2.5-230M: https://huggingface.co/LiquidAI/LFM2.5-230M
- No se han encontrado en la información disponible otros enlaces (papers, blogs, repos, demos) asociados a esta release.
