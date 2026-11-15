# keypa/MoonViT-3D-K2.6-7eb5002f

## Resumen

MoonViT-3D-K2.6-7eb5002f es un extracto del torreón de visión (vision tower) del modelo multimodal Kimi-K2.6 desarrollado por Moonshot AI. No se trata de un modelo completo, sino de un subconjunto de pesos aislado del checkpoint original mediante la herramienta `extract_k3_vision.py`, que descarga únicamente los rangos de bytes correspondientes a los prefijos `vision_tower.` y `mm_projector.` del índice de safetensors, sin necesidad de bajar el checkpoint entero.

El paquete contiene 329 tensores del torreón de visión y 6 tensores del proyector multimodal, todos en BF16, con un total de 416.866.032 parámetros en el torreón y 54.277.888 en el proyector. El repositorio ocupa 0,9 GB y fue publicado por el usuario keypa el 15 de noviembre de 2026, sin descargas ni interacciones registradas hasta la fecha de consulta.

Su relevancia es acotada: sirve como componente reutilizable para experimentos de investigación que necesiten el codificador visual de Kimi-K2.6 sin cargar el modelo completo, o para auditar los pesos de visión de forma aislada. No es un modelo autónomo y no puede usarse para inferencia de extremo a extremo sin el resto del checkpoint de Kimi-K2.6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision tower (ViT) + proyector multimodal, extraidos de Kimi-K2.6 |
| Parametros totales | 471.143.920 (416.866.032 torreon + 54.277.888 proyector) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | kimi-k2.6-modified-mit (Modified MIT) |
| Formato de pesos | safetensors (BF16) + manifest JSON |

## Arquitectura y entrenamiento

El artefacto contiene exclusivamente el torreón de visión y el proyector multimodal de Kimi-K2.6, un modelo multimodal de Moonshot AI. El torreón se compone de 329 tensores y el proyector de 6, todos en BF16. El manifest JSON adjunto incluye la forma, el dtype, el shard y el sha256 de cada tensor, además del sha256 del fichero completo (`ca1eeae268857ad13b2212d7781e5aa38fe13987a4a43c808b6487694bde4132`), lo que permite verificar la integridad de la extracción.

No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO, ya que la model card del extracto no los detalla y remite implícitamente al modelo original. Tampoco se especifica la innovación técnica del torreón (tipo de atención, resolución de parches, etc.). La extracción se realizó sobre la revisión `7eb5002f6aadc958aed6a9177b7ed26bb94011bb` del repositorio `moonshotai/Kimi-K2.6`.

## Capacidades

- Codificación visual: el torreón transforma imágenes en representaciones latentes, presumiblemente para su integración en el modelo multimodal Kimi-K2.6.
- Proyección multimodal: los 6 tensores del `mm_projector.` alinean las representaciones visuales con el espacio del modelo de lenguaje.
- No es un modelo generativo autónomo: no genera texto, código ni respuestas por sí mismo.
- No se documenta soporte de tool calling, agentes, multi-step reasoning ni capacidades multilingües en este extracto.
- No se documentan modos especiales (thinking mode, audio, etc.) para este componente aislado.

## Casos de uso

- Investigación de representaciones visuales: cargar el torreón aislado para analizar los embeddings que produce Kimi-K2.6 sobre un conjunto de imágenes, sin necesidad de descargar el checkpoint completo.
- Auditoría de pesos: el manifest con sha256 por tensor permite verificar la integridad y comparar los pesos de visión entre revisiones del modelo original.
- Reutilización en pipelines de visión: integrar el torreón y el proyector en un sistema propio que ya disponga de un modelo de lenguaje compatible con el espacio latente de Kimi-K2.6.
- Fine-tuning del codificador visual: al estar aislado y en BF16, facilita experimentos de ajuste del torreón sobre dominios específicos (médico, satelital, industrial) sin cargar el modelo completo.
- Docencia y divulgación: permite estudiar la estructura interna de un torreón de visión multimodal de un modelo de gran escala con un fichero de 0,9 GB.
- Reproducibilidad de la extracción: el comando documentado en la model card sirve como referencia para replicar la extracción sobre otras revisiones o prefijos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1 GB en BF16 para los 471 millones de parámetros (0,9 GB de datos), más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090 o A100 son suficientes para cargar el extracto.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: carga directa con `safetensors` y PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este componente aislado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MoonViT-3D-K2.6-7eb5002f (este) | 471 M (torreón + proyector) | no disponible | Modified MIT | Hugging Face, 0 descargas |
| Kimi-K2.6 (modelo completo) | no disponible | no disponible | Modified MIT | Hugging Face (moonshotai) |
| Otros torreones ViT aislados | no disponible | no disponible | variable | variable |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo completo: carece del modelo de lenguaje y no puede generar texto ni responder consultas por sí solo.
- Licencia Modified MIT: es necesario revisar el fichero `LICENSE` y el enlace a la licencia de Kimi-K2.6 antes de cualquier uso comercial, ya que la denominación "modified" implica condiciones adicionales respecto a la MIT estándar.
- Sin datos de entrenamiento ni evaluación: no se puede estimar su comportamiento, sesgos ni tasa de alucinación a partir de la información disponible.
- Sin idiomas declarados: no se documenta cobertura lingüística.
- Repositorio sin uso registrado (0 descargas, 0 likes): no hay evidencia de la comunidad sobre su correcto funcionamiento.
- Riesgo de incompatibilidad: al ser un extracto parcial, la integración con el resto de Kimi-K2.6 exige respetar la revisión y los nombres de tensor originales.
- Fecha de creación futura (2026-11-15): conviene verificar la procedencia y autenticidad del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/keypa/MoonViT-3D-K2.6-7eb5002f
- Modelo original: https://huggingface.co/moonshotai/Kimi-K2.6
- Licencia: https://huggingface.co/moonshotai/Kimi-K2.6/blob/main/LICENSE
