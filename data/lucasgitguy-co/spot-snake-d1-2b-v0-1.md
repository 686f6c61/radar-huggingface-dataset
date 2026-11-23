# Lucasgitguy-co/spot-snake-d1-2B-v0.1

## Resumen

Spot Snake d1-2B v0.1 es un modelo de decisión derivado de LiquidAI/d1-2B, ajustado por Lucasgitguy-co para elegir movimientos en el videojuego Spot's Biscuit Snake. El modelo no genera texto libre ni código: recibe el estado de la partida y una lista de movimientos seguros, y devuelve una clasificación sobre cuál de ellos elegir. Se entrenó sobre el dataset Spot Snake Decisions v0.1 para imitar a un profesor heurístico que maximiza el espacio libre disponible en el tablero.

El modelo base es un d1-2B de Liquid AI, con 1.918.181.888 parámetros totales (aproximadamente 1,92 mil millones), arquitectura de tipo `lfm3_vl` (con componentes de visión y lenguaje) y pesos distribuidos en safetensors bf16, GGUF y ONNX. El ajuste se realizó mediante un adaptador de rango 8 en formato propio (no PEFT), posteriormente fusionado en los pesos completos. El repositorio ocupa 11,8 GB e incluye el código de inferencia upstream de Liquid AI sin modificar.

Su relevancia es acotada: es un ejemplo de post-entrenamiento de un modelo pequeño para una tarea de decisión cerrada dentro de un juego concreto, con métricas de acuerdo con el profesor (99,41 % en test retenido) en lugar de métricas de rendimiento de juego. No se han medido puntuaciones, tasa de victorias ni latencia. La licencia es personalizada (LvW-license-Snake-1.0), lo que limita el uso comercial por herencia de la LFM Open License v1.0 del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `lfm3_vl` (modelo base LiquidAI/d1-2B; transformer con componentes de visión y lenguaje) |
| Parámetros totales | 1.918.181.888 (~1,92 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos completos), GGUF F16, GGUF Q4_K_M, ONNX q4f16 (decoder con gate/up int4 y down int8, bloques de 32) |
| Idiomas soportados | no disponibles |
| Licencia | LvW-license-Snake-1.0 (LFM Open License v1.0 para el modelo base + Apache-2.0 para las contribuciones nuevas) |
| Formato de pesos | safetensors (bf16), GGUF (F16, Q4_K_M, bundle), ONNX (q4f16 con fichero de datos externo), adaptador de rango 8 en formato propio |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/d1-2B, etiquetado como `lfm3_vl`, que combina un decodificador de lenguaje con un proyector de visión (`mmproj-f16.gguf`, no testeado). El ajuste se realizó mediante un adaptador de rango 8 en un formato personalizado, no compatible con PEFT, que después se fusionó en los pesos completos en bf16. El código de ejecución y el tokenizador son los upstream de Liquid AI, incluidos sin cambios en el repositorio; la carga requiere `trust_remote_code=True`.

El entrenamiento se hizo sobre el dataset Spot Snake Decisions v0.1, en el que el juego proporciona los movimientos seguros y el modelo debe ordenarlos imitando a un profesor heurístico que conserva el mayor espacio libre. No se documentan el número de tokens, la composición detallada del dataset ni el uso de RLHF o DPO. La innovación técnica destacable es la integración del modelo en el juego mediante una ruta ONNX WebGPU: el fichero `onnx/decoder_q4f16.onnx` es el `decoder_q4f16` de LiquidAI/d1-2B-ONNX (revisión `2fd6148`) con solo el último bloque sustituido por los pesos ajustados, re-cuantizados en el mismo layout (gate y up en int4, down en int8, bloques de 32). El grafo ONNX es el de Liquid AI, sin modificar.

## Capacidades

- Clasificación de movimientos en Spot's Biscuit Snake: recibe el estado y la lista de movimientos seguros y elige uno.
- Razonamiento de decisión restringido al conjunto de acciones que el juego ya marca como seguras; no genera movimientos nuevos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: modo de visión heredado del modelo base (proyector `mmproj-f16.gguf` incluido pero no testeado); no se documenta thinking mode, audio ni otras modalidades.
- Inferencia en navegador vía ONNX Runtime Web sobre WebGPU (ruta usada por el juego al seleccionar «Model: d1-2B»).

## Casos de uso

- Integración en Spot's Biscuit Snake como jugador automático: el juego ya ofrece la opción «Model: d1-2B» y ejecuta el ONNX q4f16 en el navegador mediante WebGPU, por lo que el modelo puede desplegarse sin backend.
- Servidor local de decisión para partidas: `scripts/serve.py` levanta el juego en `http://127.0.0.1:8000` con los pesos safetensors, útil para probar variantes del juego sin depender de la web.
- Evaluación de heurísticas de juego: al imitar a un profesor concreto, sirve como referencia para comparar políticas alternativas midiendo acuerdo con el profesor sobre el mismo conjunto de estados.
- Despliegue ligero con llama.cpp: `llama-server -m gguf/model-Q4_K_M.gguf --port 8099` expone el endpoint `/v1/systemone` para consultar decisiones desde otras herramientas o scripts de análisis.
- Distribución de un único fichero: el bundle GGUF de 1.479 GB agrupa modelo Q4_K_M y proyector de visión, útil para descargas reproducibles con verificación sha256 al desempaquetar.
- Investigación sobre post-entrenamiento de modelos pequeños: el repositorio incluye `metrics.json`, `training.json` y `reload-check.json`, lo que permite reproducir el ajuste y auditar las comprobaciones de recarga y cuantización.

## Benchmarks y rendimiento

Las métricas publicadas miden acuerdo con el profesor (no puntuación de juego, tasa de victorias ni velocidad):

| Comprobación | Acuerdo con el profesor |
|---|---|
| Modelo base, validación | 25,32 % (1.785 filas) |
| Mejor de 2 épocas, validación | 99,10 % (1.785 filas) |
| Checkpoint seleccionado, test retenido | 99,41 % (1.708 filas) |
| Ficheros guardados recargados, subconjunto de test | 100,00 % (32 filas) |
| `model-f16.gguf`, mismo movimiento que safetensors | 100,00 % (32 filas) |
| `model-Q4_K_M.gguf`, mismo movimiento que safetensors | 100,00 % (32 filas) |
| ONNX q4f16 (ONNX Runtime CPU, código del repo), test | 98,95 % (1.708 filas) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia por tamaño de pesos: bf16 completo requiere en torno a 3,8 GB solo para pesos; GGUF Q4_K_M y ONNX q4f16 reducen el peso a aproximadamente 1,5 GB.
- GPU recomendadas: no disponibles. El modelo base d1-2B es de tamaño reducido y el despliegue documentado prioriza CPU (ONNX Runtime CPU) y llama.cpp.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño, el formato Q4_K_M y el ONNX q4f16 son compatibles con GPUs de consumo típicas, pero el autor no lo verifica.
- Opciones de despliegue: `scripts/serve.py` con safetensors (requiere `transformers>=5.22,<6`, torch y safetensors), `llama-server` de llama.cpp (revisión `1b6935b` o posterior), ONNX Runtime Web sobre WebGPU en navegador.
- Latencia y throughput: no disponibles; el autor indica explícitamente que la velocidad no se ha medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spot Snake d1-2B v0.1 | ~1,92 mil millones | no disponible | Decisión en Spot's Biscuit Snake | LvW-license-Snake-1.0 | Hugging Face (safetensors, GGUF, ONNX) |
| LiquidAI/d1-2B (base) | ~1,92 mil millones | no disponible | Modelo multimodal de propósito general | LFM Open License v1.0 | Hugging Face |
| LiquidAI/d1-2B-ONNX | ~1,92 mil millones | no disponible | Decodificador ONNX del base | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; las métricas de Spot Snake d1-2B miden acuerdo con un profesor heurístico y no son trasladables a los modelos base.

## Limitaciones y advertencias

- Solo ordena los movimientos que el juego ya marca como seguros; es imprescindible mantener las comprobaciones de colisión del juego.
- El profesor es una heurística, no un jugador óptimo; igualarlo es el objetivo declarado, no superar el rendimiento humano.
- Las puntuaciones de confianza no están calibradas tras el entrenamiento.
- No se han medido puntuación de juego, tasa de victorias ni velocidad; el acuerdo con el profesor no equivale a rendimiento en partida.
- El proyector de visión (`mmproj-f16.gguf`) se incluye sin testear; las capacidades de visión no están verificadas en este ajuste.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado; el modelo está restringido a clasificar entre movimientos seguros, lo que reduce el espacio de salida.
- Licencia: LvW-license-Snake-1.0 aplica la LFM Open License v1.0 al modelo en su conjunto, por lo que persiste el límite de uso comercial del modelo base; las contribuciones nuevas van bajo Apache-2.0. No es posible relicenciar como MIT o Apache-2.0 puro.
- El bundle GGUF no puede ejecutarse directamente en llama.cpp; requiere desempaquetado previo con `gguf_bundle.py`.
- El adaptador de rango 8 está en formato propio, no PEFT, lo que complica su reutilización con herramientas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/spot-snake-d1-2B-v0.1
- Dataset: https://huggingface.co/datasets/Lucasgitguy-co/spot-snake-decisions-v0.1
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Modelo base ONNX: https://huggingface.co/LiquidAI/d1-2B-ONNX
- Juego Spot's Biscuit Snake: https://github.com/Gitguy268/spot-snake
- Colección Spot Snake models: https://huggingface.co/collections/Lucasgitguy-co/spot-snake-models-6aec255c05f37ecf15f1fe33
- Informe técnico (paper): docs/paper.md y docs/paper.pdf dentro del repositorio del modelo
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
