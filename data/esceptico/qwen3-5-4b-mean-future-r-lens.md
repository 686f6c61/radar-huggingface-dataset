# esceptico/qwen3.5-4b-mean-future-r-lens

## Resumen

Qwen3.5-4B Mean-Future R-Lens es una herramienta de lectura (readout tool) para interpretabilidad mecanicista, desarrollada por el usuario esceptico. No es un modelo de lenguaje ni un adaptador: se trata de un conjunto de 30 matrices float32 que mapean las activaciones de las capas 0 a 29 de Qwen3.5-4B al espacio residual de la capa 30, permitiendo inspeccionar la distribucion de vocabulario proyectada desde capas tempranas. El artefacto esta diseñado para investigadores que estudian como se representan los tokens en el interior del transformer.

La herramienta implementa un estimador "Mean-Future" que promedia los pseudo-Jacobianos RelP sobre todas las posiciones futuras validas, eliminando el factor deterministico de horizonte temporal que introduce el estimador "Sum" original. Segun las evidencias reportadas, esta normalizacion mejora consistentemente la fidelidad del transporte de representaciones en capas tempranas (0-10) frente a la variante Sum, tanto en metricas de hit-rate como en divergencia KL y efecto causal. El modelo base es Qwen/Qwen3.5-4B, con licencia Apache-2.0, y el repositorio pesa 0.8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matrices de proyeccion lineal (30 matrices float32 de 2560x2560) |
| Parametros totales | 30 matrices de 2560x2560 (aprox. 196.6 M de floats, 0.8 GB en float32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (solo float32) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El artefacto consiste en 30 matrices de proyeccion \( R_l \in \mathbb{R}^{2560 \times 2560} \), una por cada capa fuente 0-29. Para una activacion fila \( x_l \), la proyeccion se calcula como \( x_{layer\_30\_basis} = x_l @ R_l^T \). Estas matrices se obtienen promediando pseudo-Jacobianos RelP (Relative Position) generados mediante un grafo backward modificado; no son Jacobianos ordinarios de la propagacion forward de Qwen. Los pesos, activaciones y el forward pass del modelo base permanecen inalterados.

El estimador Mean-Future se ajusta usando todas las posiciones fuente excepto el token final. Para cada posicion fuente \( s \), los targets validos son las posiciones no finales \( t \geq s \). A diferencia de la variante Sum (que suma todas las contribuciones futuras, dando mas peso a posiciones tempranas), Mean-Future divide por el numero de targets validos antes de promediar entre posiciones y prompts. Esto elimina el factor deterministico de horizonte temporal sin forzar normas de mapa iguales. El ajuste se realizo con 100 prompts (mezcla de NeelNanda/pile-10k y Salesforce/wikitext) usando todas las posiciones no finales.

## Capacidades

- Proyeccion de activaciones de capas 0-29 al espacio residual de la capa 30 de Qwen3.5-4B.
- Inspeccion de rankings de vocabulario aplicando la normalizacion final y unembedding de Qwen.
- Estimacion Mean-Future de pseudo-Jacobianos RelP, con adjunto para "pullback" de direcciones de scoring hacia capas fuente.
- Comparacion interpretativa entre capas y posiciones mediante mapas de calor (layer-position heatmaps).
- Analisis de similitud CKA entre lentes (J-Lens, Sum R-Lens, Mean-Future R-Lens).
- No genera texto, no soporta tool calling, ni agentes, ni capacidades multimodales.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: permite estudiar como se codifican los tokens en capas tempranas de Qwen3.5-4B, proyectando activaciones al espacio de vocabulario de la capa 30 para inspeccionar rankings de tokens.
- Analisis de representaciones por capa: los mapas de calor capa-por-posicion permiten identificar en que capas y posiciones se concentra informacion lexica util para la prediccion.
- Validacion de tecnicas de representation engineering: el adjunto \( R_l^T \) permite "tirar" de una direccion de scoring (como una fila de unembedding) hacia capas fuente, util para localizar direcciones causales.
- Comparacion de metodologias de lentes: el repositorio incluye comparaciones controladas entre J-Lens, Sum R-Lens y Mean-Future R-Lens, util para decidir que herramienta usar en cada contexto.
- Estudio de efectos causales en intervenciones: las matrices permiten intervenir en capas tempranas y medir el efecto en la salida final, como se reporta en las evidencias (causal effect en capas 4, 10, 16, 22, 27).
- Educacion y divulgacion: el codigo de ejemplo (aggregation_demo.py) facilita la reproduccion de los experimentos y el aprendizaje de tecnicas de lentes interpretativas.

## Benchmarks y rendimiento

La model card reporta evidencias de validacion del estimador Mean-Future frente a Sum, con protocolo congelado y evaluacion en datos held-out (WikiText-103). Los intervalos agrupados al 95% favorecen a Mean-Future:

| Medida | Alcance de evaluacion | Mejora (intervalo agrupado) |
|---|---|---|
| Hit@10 | Capas 0-10; posiciones 16 hasta penultimo token | +1.86 a +3.71 pp |
| Divergencia KL (distribucion target) | Mismo alcance | 0.282 a 0.532 menor |
| Coseno residual | Mismo alcance | +0.0118 a +0.0358 |
| Efecto causal | Capas 4, 10, 16, 22, 27; intervencion en penultimo token vs direcciones aleatorias | +0.0396 a +0.1570 |

Tambien se reportan comparaciones CKA entre lentes (misma capa):

| Comparacion | Capas 0-10 | Capas 21-30 |
|---|---|---|
| J vs Sum R | 0.719 | 0.987 |
| J vs Mean-Future R | 0.734 | 0.980 |
| Sum R vs Mean-Future R | 0.844 | 0.995 |

La model card advierte que la campana de validacion uso 6 prompts de ajuste por condicion y 4 condiciones por modelo; el artefacto publicado se ajusto con 100 prompts. Los resultados validan la normalizacion Mean-Future, no el rendimiento held-out de estas matrices exactas.

## Requisitos de hardware

- VRAM estimada: al ser solo matrices de proyeccion (0.8 GB en float32), puede cargarse en cualquier GPU con al menos 1 GB de VRAM, o incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (incluso una GTX 1060 o superior) es suficiente para aplicar las matrices. Para ejecutar el modelo base Qwen3.5-4B junto con la lente, se recomienda al menos 8-12 GB de VRAM (RTX 3060, RTX 4070, etc.).
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer.
- Opciones de despliegue: al ser un artefacto PyTorch, se integra facilmente con scripts Python personalizados. No requiere vLLM, llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia y throughput: la aplicacion de una matriz 2560x2560 a un batch de activaciones es trivial (microsegundos por token). El coste dominante es el forward pass de Qwen3.5-4B si se calculan las activaciones en vivo.

## Comparativa con modelos similares

| Herramienta | Tipo | Base model | Metodologia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mean-Future R-Lens (este) | Lente de lectura | Qwen3.5-4B | Pseudo-Jacobianos RelP promediados (Mean-Future) | Apache-2.0 | HuggingFace |
| Sum R-Lens | Lente de lectura | Qwen3.5-4B | Pseudo-Jacobianos RelP sumados | Apache-2.0 | Incluido en el repo como comparacion |
| J-Lens | Lente de lectura | Qwen3.5-4B | Jacobianos ordinarios | Apache-2.0 | Incluido en el repo como comparacion |

No se dispone de informacion sobre otras herramientas comparables en el mercado (como Tuned Lens o Logit Lens) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse como chatbot o generador de contenido.
- Los rankings de tokens son proyecciones interpretativas, no pruebas de que una capa almacene palabras literales ni de que un token decodificado temprano sea la respuesta final del modelo.
- Las filas de vocabulario raras o debilmente entrenadas pueden producir resultados enganosos.
- La campana de validacion uso un numero limitado de prompts (6 por condicion); el artefacto publicado se ajusto con 100 prompts, por lo que el rendimiento exacto puede variar.
- La equivalencia de backend (gated-delta nativo vs fla-core) no fue probada de forma independiente para la linea base Sum R-Lens.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma, al no ser un modelo generativo.
- Licencia Apache-2.0 permite uso comercial, pero el artefacto depende de Qwen3.5-4B (tambien Apache-2.0).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/esceptico/qwen3.5-4b-mean-future-r-lens
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Post original de R-Lens en LessWrong: https://www.lesswrong.com/posts/nv8oedrnLXKRzNEL9/r-lens-making-j-lens-more-faithful-on-early-layers
