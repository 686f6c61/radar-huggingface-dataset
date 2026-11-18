# may-ohta/qwen3.5-4B-layer31-saes

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo, sino dos autoencoders dispersos (SAE, *sparse autoencoders*) entrenados sobre el *residual stream* a la salida del bloque 31 —el ultimo de los 32— de `Qwen/Qwen3.5-4B`. Los SAE son herramientas de interpretabilidad: descomponen activaciones densas del modelo en un conjunto grande de caracteristicas dispersas y legibles, lo que permite analizar que representaciones internas se activan ante una entrada dada. El autor es `may-ohta` y la libreria de referencia es `saelens` 6.39.0.

Los dos SAE comparten corpus de entrenamiento y difieren solo en receta: uno Matryoshka BatchTopK (k = 100, anchos 2.048 / 16.384 / 65.536, publicado como JumpReLU) con 65.536 caracteristicas, y otro TopK clasico (k = 100) con 40.960 caracteristicas. Ambos se entrenaron sobre texto formateado como chat en seis idiomas (en, fr, de, it, pl, ru) con la plantilla de Qwen3.5-4B y el modo *thinking* desactivado, sobre un total de 73.170.944 tokens de un objetivo planificado de 1.000 millones.

Es relevante ahora porque Qwen3.5 introduce capas de atencion lineal (el entorno de entrenamiento anade `flash-linear-attention`) y porque los SAE publicados sobre modelos recientes y de ninevel de bloque final son escasos; estos checkpoints permiten auditar el comportamiento del modelo, buscar caracteristicas interpretables y construir clasificadores lineales sobre caracteristicas dispersas sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso (SAE) sobre residual stream de `Qwen/Qwen3.5-4B`, bloque 31 (salida, `model.layers.31`) |
| Parametros totales | No disponible (depende del ancho: 65.536 o 40.960 caracteristicas sobre residual de 2.560 dimensiones) |
| Parametros activos | No disponible (no es MoE; k = 100 activaciones por token) |
| Longitud de contexto | 4.096 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | Entrenado sobre en, fr, de, it, pl, ru (seis idiomas); idiomas de inferencia no especificados |
| Licencia | Apache 2.0 (la misma que `Qwen/Qwen3.5-4B`) |
| Formato de pesos | `safetensors` (formato de inferencia de sae_lens: `sae_weights.safetensors` + `cfg.json`); checkpoint de entrenamiento sin plegar en `training_checkpoint/` |

## Arquitectura y entrenamiento

Cada SAE mapea activaciones residuales de dimension 2.560 (salida del bloque 31) a un espacio disperso de alta dimension y las reconstruye. El variante `btk-mat/` usa Matryoshka BatchTopK con k = 100 y anchos anidados de 2.048, 16.384 y 65.536, liberado como JumpReLU: aplica el umbral aprendido en entrenamiento (umbral movil de BatchTopK, identico para todas las caracteristicas). El variante `topk/` es un TopK clasico que conserva las 100 activaciones mayores por token, con 40.960 caracteristicas (16 veces el tamano oculto) y perdida auxiliar de 1/32, siguiendo las decisiones de Qwen-Scope.

El corpus de entrenamiento combina intercambios inversos de instrucciones de MURI-IT (mitad) con articulos de CulturaX seguidos de una pregunta de tarea (mitad), formateados con la plantilla de chat de Qwen3.5-4B con *thinking* desactivado; total de 73.184.965 tokens vistos, con contexto de 4.096 tokens, tasa de aprendizaje constante de 1e-4 y 4.096 tokens por paso. Ambos runs se planificaron para 1.000 millones de tokens pero se liberaron en el snapshot donde se detuvieron (73.170.944 tokens). Los pesos de inferencia llevan filas del decodificador normalizadas a norma unitaria y las normas del decodificador plegadas en el codificador.

## Capacidades

- Descomposicion dispersa de activaciones del residual stream del bloque 31 de Qwen3.5-4B en caracteristicas interpretables (65.536 o 40.960 segun variante).
- Reconstruccion de activaciones (`sae.decode(z)`) para analisis de fidelidad y estudios de circuitos.
- Extraccion de caracteristicas dispersas utilizables como representaciones para sondas, clasificadores lineales o *steering*.
- Estadisticas por caracteristica de frecuencia de activacion (`sparsity.safetensors`) para filtrar caracteristicas fiables.
- Soporte de dos regimenes de dispersión: umbral aprendido (BatchTopK/JumpReLU) y seleccion top-k por token.
- No realiza generacion de texto, razonamiento, codigo, vision, tool calling ni funciones de agente: es una herramienta de analisis, no un modelo de chat.
- Capacidades multilingues limitadas al corpus de entrenamiento (en, fr, de, it, pl, ru); no se documentan otras lenguas.

## Casos de uso

- Auditar representaciones internas de Qwen3.5-4B: cargar el SAE con `SAE.load_from_disk` y codificar activaciones capturadas en `model.layers.31` para identificar que caracteristicas se activan ante un prompt concreto; util para estudiar sesgos o comportamientos no documentados.
- Deteccion de caracteristicas de seguridad: usar las caracteristicas dispersas como senales para clasificar entradas toxicas o de dominio sensible, aprovechando la dispersion (k = 100) para obtener clasificadores ligeros y auditables.
- *Steering* y edicion de activaciones: manipular coeficientes de caracteristicas concretas en el espacio disperso y decodificar para medir el efecto sobre la salida del modelo, con el decodificador de norma unitaria que facilita la interpretacion de magnitudes.
- Analisis de fidelidad de SAE: comparar reconstruccion (`x_hat`) frente a activaciones reales para estimar perdida de reconstruccion y seleccionar el ancho Matryoshka (2.048, 16.384 o 65.536) adecuado al presupuesto computacional.
- Estudio multilingue comparativo: dado que el corpus cubre seis idiomas, permite comparar que caracteristicas se comparten entre en, fr, de, it, pl y ru en la capa final del modelo.
- Investigacion de atencion lineal: al entrenarse con `flash-linear-attention` para las capas lineales de Qwen3.5, el SAE sirve de base para estudiar representaciones en modelos hibridos de atencion lineal y comprobar como difieren de transformers clasicos.
- Integracion en pipelines de interpretabilidad mecanicista: usar los checkpoints como componente en flujos de *feature discovery* y evaluacion automatizada de SAE con `saelens`, sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 4,4 GB en total; cada variante puede cargarse en CPU (`device="cpu"` segun el ejemplo del autor). Para codificacion en GPU, el ancho de 65.536 caracteristicas requiere memoria proporcional al lote y a la dimension de caracteristicas; no se publican cifras exactas.
- GPU recomendadas: no disponible. Al ser un SAE y no un LLM, la carga es muy inferior a la del modelo base; una GPU consumer con suficiente VRAM para el checkpoint y el lote de activaciones deberia bastar, pero no se documenta.
- Cabe en GPU consumer: probablemente si, dado el tamano del repo (4,4 GB) y la ausencia de pesos del LLM base; no confirmado por el autor.
- Opciones de despliegue: `sae_lens` (unica libreria documentada, con `SAE.load_from_disk`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un SAE.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Caracteristicas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `may-ohta/qwen3.5-4B-layer31-saes` (btk-mat) | SAE Matryoshka BatchTopK / JumpReLU | 65.536 (anchos 2.048 / 16.384 / 65.536) | 4.096 | Apache 2.0 | Hugging Face, libreria saelens |
| `may-ohta/qwen3.5-4B-layer31-saes` (topk) | SAE TopK | 40.960 (16x hidden size) | 4.096 | Apache 2.0 | Hugging Face, libreria saelens |
| SAE de Qwen-Scope (referencia de receta) | SAE TopK | No disponible | No disponible | No disponible | No disponible |
| SAE de gemma-4 `it-chat/` (referencia de receta) | SAE Matryoshka BatchTopK | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento truncado: ambos runs se detuvieron en 73.170.944 tokens frente a los 1.000 millones planificados, por lo que las caracteristicas pueden estar infraentrenadas y menos estables que en SAE completos.
- Cobertura limitada a la capa 31 (salida del ultimo bloque) y a seis idiomas; no representa el comportamiento de capas intermedias ni de otras lenguas.
- No es un modelo generativo: no debe usarse para tareas de chat, codigo, razonamiento o agentes; su uso indebido produciria resultados sin sentido.
- Riesgo de caracteristicas poco fiables o "muertas": conviene consultar `sparsity.safetensors` y descartar caracteristicas de activacion muy baja antes de sacar conclusiones.
- Sesgos heredados del corpus (MURI-IT y CulturaX) y del propio Qwen3.5-4B; los SAE pueden reflejar y amplificar esos sesgos en las caracteristicas extraidas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y su licencia deben respetarse por separado; no se documentan restricciones adicionales.
- No se publican benchmarks, curvas de entrenamiento ni evaluaciones de reconstruccion, lo que dificulta comparar calidad con otros SAE.
- El checkpoint de entrenamiento sin plegar (`training_checkpoint/`) requiere atencion a `rescale_acts_by_decoder_norm` si se reutiliza para continuar el entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/may-ohta/qwen3.5-4B-layer31-saes
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria sae_lens: https://github.com/jbloomAus/SAELens
- Repositorio SAELens (referencia de entrenamiento): https://github.com/jbloomAus/SAELens
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
