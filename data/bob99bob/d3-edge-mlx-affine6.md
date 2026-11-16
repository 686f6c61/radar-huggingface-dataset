# Bob99Bob/d3-edge-mlx-affine6

## Resumen

d3-edge-mlx-affine6 es una conversión a formato MLX con cuantización affine de 6 bits del modelo d3-edge (Decision 3.0), publicado originalmente por el equipo vLLM Semantic Router (vllm-sr/d3-edge). El modelo base es un clasificador de texto de aproximadamente 494 millones de parámetros, diseñado para actuar como un "lector" ligero dentro de un pipeline de enrutamiento semántico: evalúa consultas antes de que un modelo mayor (el "juez") tome la decisión final de enrutamiento. Esta conversión la firma Bob99Bob y está pensada específicamente para ejecutarse en Apple Silicon mediante el servidor veJ.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización (affine 6-bit, group size 64) aplicada con `quantize_model` de mlx-lm sobre MLX 0.32.2, con la que se reduce el peso del modelo a unos 0,4 GB manteniendo, según el autor, todas las reglas de enrutamiento del modelo original. Por otro, ilustra un patrón de distribución peculiar: el repositorio solo contiene los tensores cuantizados y un registro de integridad (`mlx-conversion.json`), mientras que el tokenizador, la plantilla de chat y el `config.json` se toman del repositorio del editor en una revisión concreta.

No se trata de un modelo entrenado o afinado: los pesos son los del editor, únicamente reformateados. Cualquier evaluación de capacidades debe remitirse al modelo base vllm-sr/d3-edge, cuya model card no se incluye en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (según descripción de la conversión: token embedding y 91 módulos Linear en capas transformer); detalles completos del modelo base no disponibles |
| Parametros totales | 493.989.824 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 6-bit, group size 64 (embedding de tokens y 91 módulos Linear); resto de tensores sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `mlx-conversion.json` de integridad (tamaño y sha256 por fichero) |

## Arquitectura y entrenamiento

El modelo base es un transformer clasificador de texto de unos 494 millones de parámetros. La conversión cuantiza de forma affine a 6 bits con group size 64 el embedding de tokens y los 91 módulos Linear de las capas transformer, usando `quantize_model` de mlx-lm sobre MLX 0.32.2. El resto de tensores se conserva sin modificar respecto al editor, y el conversor verifica la lectura en float32. El `config.json` es el del editor, ampliado con los parámetros de cuantización y un registro `d3_derivative` que anota formato y revisión de origen.

No hubo entrenamiento ni ajuste alguno: los pesos son los del editor (vllm-sr/d3-edge, revisión `20c745653400d191ecacd99c4eafc0c5900dc15e`). No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El tokenizador y la plantilla de chat no se copian en el repositorio: se toman del editor en la misma revisión.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`.
- Enrutamiento semántico: actúa como "lector" ligero que evalúa consultas antes de que un modelo juez decida la ruta, dentro de la arquitectura Decision 2.0/3.0 de veJ.
- Aplicación de reglas de enrutamiento: según las mediciones del autor, la versión de 6 bits conserva todas las reglas de enrutamiento para las que el modelo original está cualificado (incluida la regla sí/no y la regla de dos opciones, que se pierden a 4 y 5 bits respectivamente).
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada (el pipeline declarado es de clasificación, no de generación).

## Casos de uso

- Enrutamiento de consultas en un router semántico: el modelo clasifica la consulta entrante y la asigna a una ruta o modelo destino antes de invocar al juez; su tamaño reducido (unos 0,4 GB en 6 bits) permite mantenerlo residente en memoria junto al resto del pipeline.
- Despliegue en Apple Silicon: gracias a la conversión MLX, puede servirse en un Mac mediante veJ (`decision2_server.py --reader d3`) sin GPU dedicada, lo que facilita entornos de desarrollo y prototipado local.
- Filtrado previo de peticiones en pipelines LLM: al actuar como lector previo al juez, descarta o etiqueta consultas antes de gastar cómputo en modelos mayores, reduciendo coste por petición.
- Clasificación de texto genérica: al declarar el pipeline `text-classification`, puede emplearse para tareas de etiquetado de texto, siempre que se validen las etiquetas concretas contra el modelo base.
- Evaluación de técnicas de cuantización: el repositorio documenta la comparación entre 4, 5, 6 y 8 bits con métricas de acuerdo frente al modelo publicado, lo que lo convierte en un caso de estudio reproducible para estudiar el impacto de la cuantización en clasificadores pequeños.
- Integración en flujos de decisión con verificación de integridad: el servidor comprueba cada fichero contra `mlx-conversion.json` al cargar, lo que encaja en despliegues donde se requiere verificar la procedencia de los pesos.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de acuerdo (agreement) entre las respuestas del modelo cuantizado y las del modelo publicado, medidas por veJ sobre los modelos Decision 2.0 y 3.0 servidos:

| Cuantizacion | Acuerdo con el modelo publicado | Reglas de enrutamiento conservadas |
|---|---|---|
| 4 bits | 0,876 a 0,990 | Pierde la regla sí/no |
| 5 bits | 0,955 a 0,996 | Pierde la regla de dos opciones |
| 6 bits | 0,972 a 0,995 | Todas |
| 8 bits | No mejor que 6 bits | Todas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,4 GB; en Apple Silicon la memoria unificada necesaria para cargar los pesos es del orden de esa cifra, más el overhead del runtime MLX y del servidor veJ.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon (chips de la serie M). No se documenta soporte para GPU NVIDIA o AMD en esta conversión.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no se especifican modelos concretos de Mac en la información disponible.
- Opciones de despliegue: servidor veJ (`decision2_server.py --reader d3 --checkpoint DIR --name decision3-edge-mlx-affine6 --port 29756`); el aprovisionamiento puede automatizarse con `provision/m4_models.py fetch`, que ensambla el directorio desde ambos repositorios y verifica cada fichero. No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-edge-mlx-affine6 (esta ficha) | 493.989.824 | no disponible | MLX safetensors 6-bit, Apple Silicon | Apache-2.0 | Hugging Face (0 descargas) |
| vllm-sr/d3-edge (modelo base) | no disponible (mismo modelo, sin cuantizar) | no disponible | Pesos originales del editor | Apache-2.0 | Hugging Face |
| Alternativas de clasificación de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (clasificadores ligeros para enrutamiento semántico) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado: reproduce los pesos del editor en otro formato; cualquier sesgo o limitación del modelo base se hereda sin cambios.
- El repositorio está incompleto por diseño: no incluye tokenizador, plantilla de chat ni `config.json` completo; es necesario descargar ficheros adicionales de vllm-sr/d3-edge en la revisión `20c745653400d191ecacd99c4eafc0c5900dc15e` para poder servirlo.
- La cuantización a 6 bits no es neutral: a 4 bits se pierde la regla de enrutamiento sí/no y a 5 bits la regla de dos opciones; solo 6 bits conserva todas las reglas según las mediciones del autor. No se garantiza equivalencia exacta con el modelo publicado (acuerdo de 0,972 a 0,995).
- Las métricas de acuerdo proceden de las mediciones del propio autor de la conversión (veJ), no de una evaluación independiente.
- Idiomas soportados no documentados; no se puede afirmar cobertura multilingüe.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas en producción.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un clasificador, el riesgo relevante es de clasificación errónea, no de generación.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso del editor recogido en `NOTICE`, que documenta qué cambió la conversión.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- La fecha de creación del repositorio (2026-11-16) es posterior a la fecha habitual de referencia; conviene verificar la integridad de los ficheros contra `mlx-conversion.json` antes de desplegar.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/Bob99Bob/d3-edge-mlx-affine6
- Modelo base: https://huggingface.co/vllm-sr/d3-edge
- Repositorio veJ: https://github.com/ordinarybob/vej
- Metodología y resultados completos de las mediciones: https://github.com/ordinarybob/vej/blob/main/docs/BENCHMARKS.md
