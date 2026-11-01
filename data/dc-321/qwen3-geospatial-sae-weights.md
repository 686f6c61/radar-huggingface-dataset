# dc-321/qwen3-geospatial-sae-weights

## Resumen

`dc-321/qwen3-geospatial-sae-weights` no es un modelo de lenguaje, sino un conjunto de pesos de autoencoders dispersos (SAE, *sparse autoencoders*) entrenados sobre las activaciones internas de Qwen3-8B. Los publica el autor `dc-321` como material de reproducibilidad del articulo "Mechanistic Interpretability of Geographic Direction Reasoning in Large Language Models: A Case Study on Qwen3-8B", firmado por Han, Ding, Fang, Li y Tong y publicado en *Computers & Geosciences* (2026). Su proposito es permitir el analisis de interpretabilidad mecanica de como Qwen3-8B representa el razonamiento sobre direcciones geograficas.

El repositorio contiene dos SAE de tipo BatchTopK con k=32 y diccionario de 65 536 caracteristicas (expansion 16x), entrenados sobre el *residual stream* despues del bloque MLP de las capas 8 y 26 de Qwen3-8B. Cada uno pesa aproximadamente 2,1 GB en float32, lo que da un total de unos 4 GB de repositorio. La libreria de referencia es `saelens`.

Es relevante ahora porque la interpretabilidad mecanica de modelos abiertos de gran tamano sigue siendo un campo activo, y disponer de SAE entrenados sobre un modelo concreto y una tarea concreta (razonamiento geoespacial) facilita replicar experimentos y auditar representaciones internas sin reentrenar desde cero. No obstante, su utilidad esta acotada a investigacion: no sirve para inferencia generativa directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso (SAE) BatchTopK, k=32, d_sae=65536 (expansion 16x) |
| Parametros totales | no disponible (pesos de SAE, no de un LLM; ~2,1 GB por capa en float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (opera sobre activaciones de Qwen3-8B) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (depende del modelo base Qwen3-8B sobre el que se entrenaron) |
| Licencia | MIT |
| Formato de pesos | safetensors (dentro de archivos ZIP: `layer_8.zip`, `layer_26.zip`) |

## Arquitectura y entrenamiento

Cada SAE es un autoencoder disperso con arquitectura BatchTopK y k=32, con un diccionario de 65 536 caracteristicas latentes y una expansion de 16x respecto a la dimensionalidad del *residual stream* de Qwen3-8B. Los pesos (`W_dec`, `W_enc`, `b_dec`, `b_enc`, `threshold`) se almacenan en float32 dentro de `sae_weights.safetensors`, acompanados de un `cfg.json` con la configuracion de inferencia para `sae_lens`. El autor advierte expresamente que el campo `"architecture": "jumprelu"` del `cfg.json` es la etiqueta de formato de inferencia que `sae_lens` usa para modelos BatchTopK guardados, y que no debe interpretarse como un SAE JumpReLU; la configuracion real de entrenamiento (`architecture: "batchtopk"`, `k: 32`) esta en `sae/train.py` del repositorio de codigo.

Los SAE se entrenaron sobre el *residual stream* inmediatamente despues del bloque MLP de dos capas de Qwen3-8B: la capa 8 y la capa 26 (puntos de enganche `model.layers.8` y `model.layers.26` en modo post-MLP). El repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de regularizacion adicionales mas alla de la dispersion impuesta por BatchTopK. El autor proporciona hashes SHA-256 para verificar la integridad de ambos archivos ZIP.

## Capacidades

- Extraccion de caracteristicas interpretables del *residual stream* de Qwen3-8B en las capas 8 y 26.
- Analisis de representaciones internas relacionadas con razonamiento sobre direcciones geograficas.
- Soporte de *feature steering* y *ablation* sobre las caracteristicas latentes descubiertas (via `sae_lens`).
- Compatibilidad con el ecosistema `sae_lens` para carga, inspeccion y experimentacion.
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision por si mismo: es un artefacto de interpretabilidad que requiere Qwen3-8B como modelo base.
- No soporta tool calling, function calling ni comportamiento agentico.
- Capacidades multilingues: no disponibles como tales; dependen del modelo base.

## Casos de uso

- Investigacion en interpretabilidad mecanica: cargar los SAE con `sae_lens` y analizar que caracteristicas se activan ante prompts que implican razonamiento direccional (norte, sur, este, oeste), identificando neuronas o direcciones latentes asociadas.
- Reproduccion de resultados del paper: el repositorio incluye guia de reproduccion y hashes SHA-256 para verificar que los pesos cargados coinciden con los usados en el articulo publicado en *Computers & Geosciences*.
- Auditoria de sesgos geograficos: inspeccionar caracteristicas activadas ante consultas sobre regiones o paises para detectar representaciones estereotipadas o asimetricas.
- *Feature steering* controlado: manipular la activacion de caracteristicas concretas para observar cambios en la salida de Qwen3-8B sobre tareas geoespaciales, aislando el efecto causal de cada direccion latente.
- Docencia y formacion: usar estos SAE como ejemplo practico de BatchTopK y de analisis post-MLP en cursos de interpretabilidad, con un caso de estudio acotado y reproducible.
- Desarrollo de metodologia: servir de plantilla para entrenar SAE sobre otras capas o tareas de Qwen3-8B, reutilizando la configuracion (`k=32`, `d_sae=65536`, 16x) como punto de partida.
- Comparacion entre capas: contrastar las caracteristicas de la capa 8 (mas superficial) con las de la capa 26 (mas profunda) para estudiar como se abstrae el razonamiento direccional a lo largo de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de reconstruccion (MSE, L0, varianza explicada), tasas de activacion por caracteristica ni comparaciones cuantitativas con otros SAE.

## Requisitos de hardware

- VRAM para cargar un SAE: aproximadamente 2,1 GB por capa en float32 (unos 4,2 GB si se cargan ambas simultaneamente).
- VRAM adicional para Qwen3-8B: no disponible en la informacion proporcionada; depende de la cuantizacion y del backend elegido para el modelo base.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB libres para los SAE; para ejecutar conjuntamente Qwen3-8B se requiere hardware acorde al modelo base (no especificado en el repositorio).
- Cabe en GPU de consumo: si, los SAE por si solos caben en GPUs consumer modernas (RTX 3060 12 GB, RTX 4070, RTX 4090) siempre que se disponga de VRAM adicional para el modelo base.
- Opciones de despliegue: `sae_lens` (libreria oficial de carga, con `SAE.load_from_disk`); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Capas / puntos | Diccionario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dc-321/qwen3-geospatial-sae-weights` | BatchTopK SAE sobre Qwen3-8B | 8 y 26 (post-MLP) | 65 536 (16x) | MIT | HuggingFace |
| SAE publicos de Qwen3 en `sae_lens` | SAE genericos sobre Qwen3 | no disponible | no disponible | no disponible | no disponible |
| SAE de Gemma Scope | SAE sobre Gemma 2 | multiples capas | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos SAE en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts por si mismo; requiere Qwen3-8B como modelo base y `sae_lens` como capa de carga.
- Solo cubre dos capas (8 y 26) y un unico punto de enganche (post-MLP); no permite un analisis exhaustivo de toda la red.
- Entrenado especificamente para razonamiento sobre direcciones geograficas; las caracteristicas descubiertas pueden no generalizar a otras tareas.
- El campo `"architecture": "jumprelu"` del `cfg.json` puede inducir a error: es una etiqueta de formato de inferencia, no la arquitectura real de entrenamiento (BatchTopK).
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez; cualquier conclusion extraida debe validarse contra el modelo base.
- Restricciones de licencia: MIT, lo que permite uso comercial y modificacion con atribucion, pero el modelo base Qwen3-8B tiene su propia licencia que debe respetarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks de reconstruccion ni de fidelidad de las caracteristicas.
- Los hashes SHA-256 deben verificarse tras la descarga para garantizar la integridad de los pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dc-321/qwen3-geospatial-sae-weights
- Codigo y guia de reproduccion: https://github.com/dccccc123/geospatial-mechanistic-interpretability
- Paper (referencia en la model card): Han, H., Ding, C., Fang, S., Li, J., Tong, D., "Mechanistic Interpretability of Geographic Direction Reasoning in Large Language Models: A Case Study on Qwen3-8B", *Computers & Geosciences*, 2026.
- Libreria `sae_lens`: no disponible en la informacion proporcionada.
