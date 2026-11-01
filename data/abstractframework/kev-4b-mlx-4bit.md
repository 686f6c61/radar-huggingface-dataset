# AbstractFramework/kev-4b-mlx-4bit

## Resumen

Kev-4B MLX 4-bit es una cuantización del modelo de decisión `jaredpalmer/kev-4b`, publicada por AbstractFramework para su uso con la librería `mlx-lm` en hardware Apple Silicon. No es un modelo generativo al uso: se trata de un *decision model* que lee un documento (el *estado*) y responde preguntas tipadas sobre él —elección entre opciones (`choice`), probabilidad de que una afirmación sea cierta (`noul`) y puntuación sobre niveles ordenados (`score`)— con probabilidades calibradas en un único forward pass, sin generar texto.

El modelo subyacente parte de una base Qwen3.5 con un adaptador LoRA de rango 16 y una *pointer head* entrenada por Jared Palmer, todo bajo licencia Apache-2.0. Esta versión concreta pliega el adaptador en la base y cuantiza el backbone a 4 bits con grupo 32, manteniendo las proyecciones de Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`) a 8 bits y la cabeza en float32. El resultado ocupa 3,0 GB.

Su relevancia es acotada pero específica: permite ejecutar clasificación y decisión estructurada con probabilidades calibradas en un portátil con chip Apple (medido en un M5 Max a 113 ms por registro), sin necesidad de GPU dedicada y con una pérdida de precisión mínima frente a bf16 (0,847 frente a 0,846 de accuracy en el conjunto de desarrollo public-pool-v6).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet sobre base Qwen3.5, con adaptador LoRA (rango 16) plegado y *pointer head* para decisión |
| Parametros totales | 4.205.751.296 (4,2 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, grupo 32, con proyecciones Gated DeltaNet a 8 bits; cabeza en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `head.safetensors` en float32 y `decision.json` con la receta |
| Tamano del repo | 3,2 GB (pesos cuantizados: 3,0 GB) |
| Libreria | mlx (mlx-lm) |
| Pipeline | text-classification |
| Modelo base | jaredpalmer/kev-4b |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5, un transformer que en este caso incorpora capas con Gated DeltaNet, un mecanismo de atención lineal recurrente que sustituye parte de la atención cuadrática clásica. Sobre esa base, Jared Palmer añadió un adaptador LoRA de rango 16 y una *pointer head* que transforma las representaciones del backbone en distribuciones de probabilidad sobre preguntas tipadas. Esta cuantización pliega el LoRA en los pesos base y aplica cuantización de 4 bits con grupo 32 al backbone, dejando las cinco proyecciones de Gated DeltaNet a 8 bits por su sensibilidad a la precisión, y mantiene la cabeza en float32.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información proporcionada. La model card sí documenta el proceso de conversión (`python -m abstractcore.decision.convert`) y la receta exacta de cuantización registrada en `decision.json`. La innovación técnica destacable es el propio formato de salida: en lugar de decodificación autoregresiva, el modelo produce directamente probabilidades calibradas sobre un espacio de respuestas definido por el usuario.

## Capacidades

- Clasificación con elección entre opciones nombradas (`choice`), devolviendo una distribución de probabilidad sobre las alternativas.
- Estimación de probabilidad de veracidad de una afirmación (`noul`).
- Puntuación sobre escalas ordenadas (`score`), por ejemplo niveles de frustración o urgencia.
- Salida con probabilidades calibradas (ECE de 0,024 en el conjunto de desarrollo), apta para umbralización.
- Inferencia en un único forward pass, sin generación de texto, lo que reduce latencia y coste.
- Definición dinámica de preguntas y criterios en tiempo de inferencia mediante un esquema JSON.
- Integración con AbstractCore vía SDK Python (`create_llm`) y vía HTTP (`POST /v1/decisions`).
- Capacidades multilingües: no disponible.
- Tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del cliente y responde con `choice` sobre el departamento (devoluciones, envíos, facturación) y `noul` sobre si requiere atención humana urgente, tal como muestra el ejemplo de la model card. Adecuado por la calibración de probabilidades y la latencia de 113 ms por registro.
- Moderación y clasificación de contenido: definir categorías de riesgo como opciones de `choice` y umbralizar la probabilidad resultante para enrutar contenido a revisión humana.
- Enrutamiento de correo o formularios: asignar mensajes entrantes a colas o equipos mediante preguntas `choice` con criterios descriptivos, sin entrenar un clasificador específico por tarea.
- Encuestas y feedback de producto: usar `score` para mapear respuestas abiertas a escalas ordenadas (satisfacción, intención de compra, sentimiento) con probabilidades interpretables.
- Verificación de afirmaciones en pipelines de datos: emplear `noul` para estimar la probabilidad de que una frase sea cierta dado un documento de contexto, útil en control de calidad de datasets.
- Decisión sobre documentos largos en local: procesar contratos, informes o expedientes en un portátil Apple Silicon sin enviar datos a la nube, gracias a los 3,0 GB de pesos y la ejecución con MLX.
- Automatización de flujos con reglas probabilísticas: sustituir cadenas de `if/else` por decisiones calibradas que permitan umbrales ajustables y auditoría de la incertidumbre.

## Benchmarks y rendimiento

Resultados medidos en el conjunto de desarrollo public-pool-v6 (1.328 registros) según la model card:

| Metrica | Valor |
|---|---|
| Accuracy (esta cuantización) | 0,847 |
| Accuracy (bf16) | 0,846 |
| Brier score | 0,226 |
| ECE (error de calibración esperado) | 0,024 |
| Acuerdo de argmax con bf16 | 0,973 |
| Media de \|Δp\| frente a bf16 | 0,023 |
| Preguntas con desplazamiento > 0,10 | 3,1 % |
| Latencia por registro (M5 Max) | 113 ms |

La model card indica además que una conversión plana a 4 bits (todas las capas lineales a 4 bits, grupo 64) pierde un punto de accuracy y mueve el 10,6 % de las respuestas, por lo que la receta mixta 4/8 bits es el compromiso medido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/espacio: 3,0 GB de pesos cuantizados; el repo completo ocupa 3,2 GB. Al ejecutarse con MLX, la memoria se comparte con la memoria unificada del sistema Apple Silicon.
- Hardware recomendado: chips Apple Silicon (M-series). La medición de latencia se realizó en un M5 Max.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, ya que el formato es MLX y está pensado para Apple Silicon; no se documenta soporte CUDA.
- Cabe en equipos de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada, aunque no se especifica el mínimo oficial.
- Opciones de despliegue: `mlx-lm`, SDK de AbstractCore (`create_llm("mlx", ...)`) y servidor AbstractCore con endpoint HTTP `POST /v1/decisions`.
- Latencia: 113 ms por registro en M5 Max. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AbstractFramework/kev-4b-mlx-4bit | 4,2 B | no disponible | MLX safetensors 4/8 bits | Apache-2.0 | Decision model calibrado, 113 ms/registro en M5 Max |
| jaredpalmer/kev-4b | 4,2 B (base) | no disponible | safetensors (bf16) | Apache-2.0 | Modelo original con LoRA y pointer head; mayor precision, mayor peso |
| Qwen3.5 (base) | no disponible | no disponible | safetensors | Apache-2.0 | Modelo generativo subyacente; no produce decisiones calibradas directamente |

No se dispone de datos de benchmarks comparativos con otras alternativas de decisión estructurada en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión estructurada: no genera texto libre ni mantiene conversaciones; su uso fuera del esquema de preguntas tipadas no está soportado.
- La model card recomienda usar el checkpoint de 8 bits cuando se vaya a umbralizar probabilidades, ya que esta versión mueve el 3,1 % de las preguntas más de 0,10 respecto a bf16.
- El 2,7 % de las respuestas cambian de argmax respecto a bf16, lo que puede ser relevante en flujos con umbrales estrictos.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no documentado, aunque al no generar texto el riesgo se traslada a la calibración de probabilidades sobre preguntas mal formuladas.
- Idiomas soportados: no disponible; la documentación y los ejemplos están en inglés.
- Longitud de contexto: no disponible, lo que impide planificar el tamaño máximo de documento de entrada.
- Licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución a Jared Palmer, Qwen/Alibaba y AbstractFramework.
- Dependencia del ecosistema MLX y de la librería AbstractCore para explotar el formato de decisión; el uso con otros runtimes requeriría conversión.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy reciente, sin validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/AbstractFramework/kev-4b-mlx-4bit
- Modelo base: https://huggingface.co/jaredpalmer/kev-4b
- Documentación de decision models de AbstractCore: https://github.com/lpalbou/AbstractCore/blob/main/docs/decision-models.md
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Qwen (base de los modelos): https://huggingface.co/Qwen
