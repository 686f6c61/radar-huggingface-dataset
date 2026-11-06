# Lucasgitguy-co/spot-snake-d1-2B-v0.1

## Resumen

Spot Snake d1-2B v0.1 es un modelo de decisión derivado de LiquidAI/d1-2B, un modelo de la familia LFM (arquitectura híbrida de Liquid AI) con aproximadamente 1.918 millones de parámetros. Lo desarrolla Lucasgitguy-co y su propósito es muy concreto: seleccionar movimientos en el juego "Spot's Biscuit Snake", un entorno tipo Snake publicado en GitHub. No es un modelo conversacional de propósito general, sino un post-entrenamiento orientado a una tarea de ranking de acciones dentro de un juego.

El modelo recibe un estado del juego y una pregunta de elección entre los movimientos que el propio juego marca como seguros, y devuelve el movimiento seleccionado. Aprende de un dataset propio (spot-snake-decisions-v0.1) generado con un profesor heurístico que prioriza mantener el mayor espacio libre en el tablero. El objetivo declarado es imitar a ese profesor, no superarlo ni maximizar puntuación de juego.

Es relevante como ejemplo de adaptación de un modelo base multimodal (tag lfm3_vl) a un dominio cerrado con un adapter de rango 8 y un pipeline de cuantización a GGUF. La model card reporta una concordancia con el profesor del 99,41% en test frente al 25,32% del modelo base, aunque sin métricas de partida reales (puntuación, win rate o velocidad).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de Liquid AI (familia LFM, tag `lfm3_vl`); detalles internos no disponibles |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16 y Q4_K_M (incluidos en el repo); safetensors en bf16 |
| Idiomas soportados | no disponibles |
| Licencia | spot-snake-composite: LFM Open License v1.0 (pesos de Liquid AI) + Apache-2.0 (contribuciones nuevas), aplicadas conjuntamente |
| Formato de pesos | safetensors (bf16, pesos fusionados), adapter propio de rango 8 (formato custom, no PEFT), GGUF (model-f16, model-Q4_K_M, mmproj-f16) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/d1-2B (revisión `10e7671d44`) y conserva el código de runtime y el tokenizer originales, que se cargan con `AutoModel.from_pretrained(..., trust_remote_code=True)`. Sobre esa base se entrena un adapter de rango 8 en formato propio (no PEFT) que posteriormente se fusiona para generar los pesos completos en bf16. El repositorio incluye además el proyector de visión sin modificar (`mmproj-f16.gguf`), aunque la model card indica que no ha sido probado.

El entrenamiento se realiza sobre el dataset spot-snake-decisions-v0.1, en el que el juego ofrece los movimientos seguros y el modelo debe ordenarlos. La supervisión proviene de un profesor heurístico que mantiene el mayor espacio libre posible. Se entrenaron 2 épocas: la concordancia con el profesor pasó del 25,32% del modelo base (1.785 filas de validación) al 98,04% en la primera época y al 99,10% en la segunda. El checkpoint seleccionado alcanza un 99,41% en el conjunto de test reservado (1.708 filas). No se documentan detalles sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Selección de movimientos en Spot's Biscuit Snake: dado un estado y una pregunta de elección, devuelve uno de los movimientos marcados como seguros por el juego.
- Ranking de acciones dentro de un conjunto finito y predefinido de opciones.
- Inferencia vía safetensors con Transformers (>=5.22, <6) y vía GGUF con llama.cpp (revisión `1b6935b` o posterior).
- Endpoint HTTP propio (`/v1/systemone`) para consultar el modelo con un estado y una pregunta de elección.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Capacidad multimodal potencial por herencia del modelo base (proyector de visión incluido), aunque no verificada.
- No se documenta soporte de tool calling, agentes, multi-step reasoning, thinking mode ni capacidades multilingües.

## Casos de uso

- Automatización de partidas de Spot's Biscuit Snake: el modelo sustituye al jugador humano seleccionando movimientos entre los seguros, manteniendo las comprobaciones de colisión del propio juego como red de seguridad.
- Evaluación de heurísticas de juego: al imitar a un profesor concreto, sirve para medir cuánto se desvía una política aprendida de una heurística de referencia en un entorno controlado.
- Investigación en imitación de políticas: caso de estudio de post-entrenamiento de un modelo de ~2 B con un adapter de rango 8 sobre un dataset de decisiones pequeño y específico.
- Despliegue ligero en local: la variante Q4_K_M permite ejecutar el modelo con llama.cpp en hardware modesto para prototipos de agentes de juego.
- Generación de datos sintéticos de partidas: usar el modelo como jugador automático para producir trayectorias que alimenten análisis o entrenamientos posteriores.
- Pruebas de integración de pipelines GGUF: validar que las salidas de las variantes F16 y Q4_K_M coinciden con las de safetensors (la model card reporta 100% de coincidencia en un subconjunto de 32 filas).

## Benchmarks y rendimiento

La model card solo publica concordancia con el profesor (teacher agreement), que mide con qué frecuencia el modelo elige un movimiento aceptado por el profesor. No es puntuación de juego, win rate ni velocidad, y esos valores no se han medido.

| Prueba | Concordancia con el profesor |
|---|---|
| Modelo base, validación | 25,32% (1.785 filas) |
| Mejor de 2 épocas, validación | 99,10% (1.785 filas) |
| Checkpoint seleccionado, test reservado | 99,41% (1.708 filas) |
| Ficheros recargados, subconjunto de test | 100,00% (32 filas) |
| model-f16.gguf, mismo movimiento que safetensors | 100,00% (32 filas) |
| model-Q4_K_M.gguf, mismo movimiento que safetensors | 100,00% (32 filas) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~1,92 B parámetros, una estimación orientativa sería de ~4 GB en bf16/F16 y de ~1,5-2 GB en Q4_K_M, sin contar overhead de runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo debería caber en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3060 12 GB o superiores) en cuantización Q4_K_M.
- Cabe en GPU de consumo: previsiblemente sí en cuantización Q4_K_M, aunque no hay confirmación oficial.
- Opciones de despliegue: Transformers (>=5.22, <6) con `trust_remote_code=True` y llama.cpp (`llama-server`) con los GGUF incluidos; el repo aporta `scripts/serve.py` para servir el juego en local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spot Snake d1-2B v0.1 | ~1,92 B | no disponible | Decisión en juego (ranking de movimientos) | LFM Open License v1.0 + Apache-2.0 | Hugging Face, safetensors y GGUF |
| LiquidAI/d1-2B | ~1,92 B | no disponible | Modelo base multimodal de propósito general | LFM Open License v1.0 | Hugging Face |
| Alternativas de política de juego de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de decisión en juegos con este tamaño y licencia en la documentación proporcionada.

## Limitaciones y advertencias

- Solo ordena movimientos que el juego ya marca como seguros; es imprescindible mantener las comprobaciones de colisión del propio juego.
- El profesor es una heurística, no un jugador óptimo; igualarlo es el objetivo declarado, no superar el rendimiento humano ni maximizar puntuación.
- Las puntuaciones de confianza no están calibradas tras el entrenamiento.
- No se han medido métricas de juego reales (puntuación, win rate, velocidad).
- El proyector de visión incluido no ha sido probado; las capacidades multimodales no están verificadas.
- La licencia es compuesta (LFM Open License v1.0 más Apache-2.0); es necesario revisar `LICENSE`, `NOTICE` y `licenses/` antes de cualquier uso comercial.
- El adapter se distribuye en un formato propio, no PEFT, lo que limita su reutilización con herramientas estándar.
- El modelo requiere `trust_remote_code=True` y ejecuta código de runtime incluido en el repositorio, lo que implica un riesgo de seguridad a evaluar.
- No se documentan idiomas soportados ni sesgos conocidos; al ser un modelo de dominio cerrado, su uso fuera de Spot's Biscuit Snake no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/spot-snake-d1-2B-v0.1
- Dataset de decisiones: https://huggingface.co/datasets/Lucasgitguy-co/spot-snake-decisions-v0.1
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Juego Spot's Biscuit Snake: https://github.com/Gitguy268/spot-snake
