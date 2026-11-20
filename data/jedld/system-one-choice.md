# jedld/system-one-choice

## Resumen

System One Choice (`SystemOneChoice`) es un modelo de decisión desarrollado por el autor jedld dentro del proyecto mtgcards, orientado a la selección de acciones legales en partidas de Magic: The Gathering simuladas en un motor de reglas propio. No es un modelo generativo conversacional: recibe el estado textual del juego y un conjunto de opciones candidatas, y en una única pasada forward puntúa cada opción devolviendo una distribución de probabilidad, la elección más probable y una confianza calibrada. Se trata, por tanto, de una política de tipo "system one" (decisión rápida e intuitiva) destilada a partir de profesores más costosos.

Arquitectónicamente es un Transformer encoder bidireccional con `norm_first` y FFN GELU de dimensión 2×`d_model`, que comparte tronco para codificar el estado y los criterios, y añade una cabeza de valor para PPO. El preset publicado (`choice_fresh`) tiene `d_model`=384, 6 capas, 6 cabezas de atención y aproximadamente 11,1 millones de parámetros, con un presupuesto de estado de 8192 bytes y criterios limitados a 64 bytes cada uno. El vocabulario es byte-level (261 entradas: 5 especiales + 256 bytes UTF-8), por lo que el modelo opera sobre texto de juego en inglés.

Su relevancia es acotada pero clara para quien investiga agentes en juegos con información imperfecta: demuestra un pipeline completo de calentamiento causal, clonación de comportamiento (BC), PPO contra liga y destilación con etiquetas suaves, todo reproducible con scripts públicos. No obstante, el repositorio de Hugging Face tiene 0 descargas y 0 likes, y el modelo está pensado exclusivamente para uso dentro de su motor, no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (`choice_text_v1`) con tronco compartido estado/criterios, scorer MLP de 2 capas y cabeza de valor PPO |
| Parametros totales | ~11,1 M (preset `choice_fresh`: `d_model`=384, 6 capas, 6 cabezas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Estado hasta 8192 bytes; criterios hasta 64 bytes cada uno; ventana causal del warm-start limitada a `min(max_state, 2048)` |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (texto de juego del motor: `render_state` / `action_options`) |
| Licencia | `other`: código MIT, pero pesos no MIT (FineWeb ODC-By-1.0, Comprehensive Rules © Wizards of the Coast, oracle text sujeto a términos de Wizards) |
| Formato de pesos | Checkpoint PyTorch (`pytorch`), con `text_vocab.json` como marcador de tipo/tamaño |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `choice_text_v1`. Un `TextVocab` byte-level (261 entradas fijas en código) alimenta un `TransformerEncoder` compartido con `norm_first` y FFN GELU de 2×`d_model`. El estado se codifica una vez, se aplica mean-pooling y se proyecta con `state_proj`; cada criterio con formato `"key: label"` se codifica con el mismo tronco, se agrupa y se proyecta con `crit_proj`. El scorer recibe la concatenación `(state, crit, state⊙crit)` y produce logits sobre K opciones mediante un MLP de 2 capas. La softmax da probabilidades y la confianza se calcula con la fórmula TypeSafe `(p_max − 1/n) / (1 − 1/n)`. Una cabeza de valor sobre el pool del estado sirve de baseline para PPO. Existe además una política legacy de vocabulario cerrado (`LegacySystemOnePolicy`, `--arch legacy`) cargable por compatibilidad.

El entrenamiento tiene tres fases: (1) warm-start de LM causal sobre `data/systemone_corpus`, un corpus de 13 953 documentos y ~58 M caracteres compuesto por 8000 documentos de FineWeb `sample-10BT`, ~5800 entradas de catálogo de cartas y oracle JSON, ~48 logs de partida y el texto de las Comprehensive Rules; (2) clonación de comportamiento con profesor `GreedyAgent` por defecto, o bien JEV Choice API o híbrido Strata+JEV con etiquetas suaves; (3) PPO en self-play contra una liga de checkpoints pasados y baselines scriptados, con recompensa terminal ±1 por asiento. Se aplica aumento por paráfrasis con Strata manteniendo fijas las claves de opción y las etiquetas suaves. El asiento decisor nunca ve identidades de la mano rival, orden del mazo ni cartas no lanzadas, según el test `tests/test_hidden_info.py`.

## Capacidades

- Puntuación de acciones legales en partidas de Magic: The Gathering dentro del motor mtgcards, devolviendo `{choice, probabilities, confidence}`.
- Decisión de un solo paso (no autoregresiva): una pasada forward puntúa todas las opciones candidatas a la vez.
- Calibración de confianza mediante la fórmula TypeSafe, útil para umbrales y abstención.
- Soporte de entrenamiento con etiquetas duras (BC) y suaves (destilación desde JEV o híbrido Strata+JEV).
- Cabeza de valor integrada para PPO y self-play.
- Capacidad de jugar con información oculta respetada (sin acceso a mano rival, orden del mazo ni cartas no lanzadas).
- Aumento por paráfrasis de estados y opciones manteniendo claves y etiquetas.
- No soporta tool calling, function calling, agentes multi-paso generales, visión, audio ni modo thinking.
- Multilingüe: no; solo inglés de juego.

## Casos de uso

- Evaluación de agentes en investigación de RL: el modelo sirve como política de referencia para comparar BC, PPO y destilación dentro del harness `mtgcards.rl.evaluate` con partidas contra `greedy` u otros oponentes.
- Destilación de profesores costosos: se puede usar como estudiante que imita las distribuciones de probabilidad de JEV o del híbrido Strata+JEV, reduciendo el coste de inferencia en producción dentro del motor.
- Benchmarking de información imperfecta: al respetar la ocultación de mano rival y orden del mazo, es adecuado para experimentos sobre toma de decisiones con información parcial.
- Generación de datos de entrenamiento: sus rollouts y logs (`data/game_logs/choice_fresh`) alimentan futuros ciclos de self-improvement documentados en `SELF_IMPROVE.md`.
- Pruebas de calibración: la confianza TypeSafe permite estudiar curvas de fiabilidad y umbrales de abstención en decisiones de juego.
- Reproducción de pipelines: el recetario `choice_fresh` (corpus, BC, PPO, destilación) es replicable en una sola GPU consumer por el tamaño de ~11 M de parámetros.
- Integración en interfaces TUI o Arena del proyecto: el modelo puede sustituir al agente scriptado en la capa de decisión sin cambiar el motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño (~11,1 M de parámetros); cabe holgadamente en cualquier GPU consumer con 4 GB o más, e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas: cualquiera moderna; el recetario de entrenamiento usa `--device cuda` y el ejemplo de evaluación puede ejecutarse con `--ckpt hf:jedld/system-one-choice`.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; el cuello de botella es el motor de reglas, no el modelo.
- Opciones de despliegue: inferencia nativa PyTorch dentro del paquete `mtgcards` (`python -m mtgcards.rl.evaluate`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no tendrían sentido al no ser un modelo autoregresivo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| System One Choice (`choice_fresh`) | ~11,1 M | 8192 bytes de estado, 64 bytes por criterio | Selección de acción en MTG (motor mtgcards) | `other` (código MIT, pesos no MIT) | Hugging Face, 0 descargas |
| `LegacySystemOnePolicy` (`--arch legacy`) | No disponible | Vocabulario cerrado CAND | Selección de acción en MTG (motor mtgcards) | Igual que el anterior | Incluido en el mismo repo como compatibilidad |
| Agente `GreedyAgent` (scriptado) | 0 (heurístico) | No aplica | Selección de acción en MTG | MIT (código del repo) | Incluido en el repo |
| JEV Choice API (profesor remoto) | No disponible | No disponible | Selección de acción en MTG | Sujeta a términos del servicio | API alojada, no pesos abiertos |

No se dispone de comparación con modelos de otras familias (LLMs generalistas o políticas de otros juegos) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el modelo aprende de `GreedyAgent`, de JEV y de logs del propio motor; hereda las simplificaciones y sesgos de esas políticas y del corpus FineWeb empleado en el warm-start.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede producir distribuciones sobre opciones poco calibradas en estados fuera de distribución.
- Limitaciones de contexto e idioma: solo inglés de juego; estado limitado a 8192 bytes y criterios a 64 bytes; la ventana causal del warm-start se recorta a 2048 por coste O(T²).
- Restricciones de licencia: los pesos no son MIT; incorporan material de FineWeb (ODC-By-1.0), Comprehensive Rules © Wizards of the Coast y oracle text sujeto a términos de Wizards. El uso comercial requiere revisar `NOTICE` en el repositorio.
- Uso fuera de alcance: no debe usarse con clientes reales de Magic Online o Arena, ni reclamar paridad con el JEV TypeSafe alojado, ni procesar entradas Noul/Score/imagen, ni emitir rulings legales o de torneo.
- Madurez: 0 descargas y 0 likes en Hugging Face; creado y actualizado el 2026-11-20, sin validación externa conocida.
- Dependencia del motor: el modelo solo es funcional dentro del motor mtgcards y su formato de estado; no es portable a otros entornos sin reentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/jedld/system-one-choice
- Código canónico del modelo: https://github.com/jedld/mtgcards/blob/master/mtgcards/rl/model.py
- Guía de entrenamiento: https://github.com/jedld/mtgcards/blob/master/docs/SYSTEM_ONE.md
- Bucle de auto-mejora: https://github.com/jedld/mtgcards/blob/master/mtgcards/rl/SELF_IMPROVE.md
- Aviso legal y licencias: https://github.com/jedld/mtgcards/blob/master/NOTICE
- Test de información oculta: https://github.com/jedld/mtgcards/blob/master/tests/test_hidden_info.py
- Documentación de datos: https://github.com/jedld/mtgcards/blob/master/data/README.md
