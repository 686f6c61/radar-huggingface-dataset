# JohnP1/d1a-e4b-it-mlx-q4

## Resumen

D1A-E4B-it v0.6 MLX 4-bit es una compilación cuantizada del modelo de decisión D1A, desarrollado por JohnP1 (jonpol01) sobre el backbone de Google Gemma 4 E4B-it. No es un modelo conversacional: recibe un documento y un conjunto de preguntas (de tipo sí/no, elección múltiple o puntuación) y devuelve, en un único forward pass, una probabilidad calibrada para cada opción. Al no generar texto libre, toda respuesta es necesariamente una de las opciones válidas, lo que elimina el riesgo de formatos inválidos en pipelines automatizados.

El modelo integra un adaptador LoRA fusionado en los pesos de Gemma 4 E4B-it (revisión `ee0ef602`), con capas lineales y embeddings de tokens cuantizados a 4 bits (grupo 64) y una cabeza de punteros en fp32. Está empaquetado en formato MLX para Apple Silicon, con 7.463 millones de parámetros totales y un peso en disco de 3,9 GB para el modelo de texto, más 0,9 GB de codificadores de foto, voz y vídeo.

Su relevancia actual reside en la ejecución local en hardware de consumo Apple: permite clasificar y decidir sobre documentos con contexto largo sin depender de APIs externas, a un coste de inferencia de 0,83× el de la compilación 8-bit equivalente. La compilación 4-bit no ha sido evaluada en las suites de referencia, por lo que el autor recomienda la variante q8 salvo que la memoria sea el factor limitante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B-it) con adaptador LoRA fusionado y cabeza de punteros |
| Parametros totales | 7.463.013.418 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (grupo 64) en capas lineales, embeddings de tokens y embeddings por capa; cabeza en fp32 |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con `head.safetensors` y `d1a_config.json` |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B-it y le superpone un adaptador LoRA entrenado para tareas de decisión, que en esta compilación está fusionado directamente en los pesos del backbone. La salida no se genera token a token: una cabeza de punteros en fp32 selecciona y puntúa opciones predefinidas en una sola pasada, devolviendo probabilidades calibradas. La temperatura de calibración es 1,55, fijada en el entrenamiento original y no reajustada para esta compilación.

El entrenamiento se realizó sobre datos de decisión en inglés y japonés, con datos japoneses derivados de JGLUE (Yahoo Japan Corporation y Waseda University, CC BY-SA 4.0) y datos de pull requests procedentes de NousResearch/hermes-agent (MIT); el conjunto etiquetado de PRs, incluidas las recientes, es privado. El tokenizador de Gemma 4 E4B-it no añade `<bos>`, pero el modelo fue entrenado con el id 2 al inicio de cada registro (`leading_ids: [2]` en `d1a_config.json`), por lo que las peticiones codificadas sin ese token quedan fuera de distribución.

## Capacidades

- Clasificación y decisión sobre documentos: preguntas de tipo sí/no (`noul`), elección múltiple (`choice`) y puntuación, con probabilidad calibrada por opción.
- Salida estructurada garantizada: al no generar texto, toda respuesta es una opción válida del conjunto definido.
- Procesamiento de contexto largo para clasificar documentos completos en una sola pasada.
- Capacidades multimodales heredadas del backbone: codificadores de foto, voz y vídeo en `media/` (0,9 GB).
- Soporte bilingüe inglés-japonés en las tareas de decisión.
- Etiquetado de pull requests y estados de revisión de código (92 estados, 276 preguntas en la evaluación del autor).
- No soporta conversación: el adaptador fusionado impide el uso como modelo de chat; para ello debe construirse una carpeta sin fusionar a partir del adaptador.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una reclamación, decidir el equipo responsable (facturación, envíos, soporte) y si el cliente está enfadado, con una probabilidad por opción que permite umbrales de escalado.
- Etiquetado automático de pull requests: clasificar PRs por tipo, riesgo o área afectada en un pipeline de CI/CD, aprovechando que la salida siempre es una etiqueta válida.
- Moderación y cumplimiento: evaluar documentos frente a un conjunto de políticas binarias en una sola pasada, sin riesgo de respuestas ambiguas en texto libre.
- Enrutamiento de correo y formularios: asignar departamento o categoría a mensajes entrantes con puntuaciones calibradas para derivar casos dudosos a revisión humana.
- Análisis de sentimiento y urgencia: puntuar documentos con escalas definidas por el usuario, útil en encuestas o reseñas donde se necesita una métrica agregable.
- Ejecución local en Apple Silicon: desplegar clasificación sensible en un Mac con M1 Max o superior sin enviar datos a la nube, con 3,9 GB de modelo de texto en disco.
- Evaluación de candidatos o contenidos frente a rúbricas: convertir criterios cualitativos en preguntas de elección múltiple y obtener distribuciones de probabilidad por criterio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta una comparación interna entre esta compilación 4-bit y la 8-bit sin fusionar (`quality_gate.py`, Apple M1 Max):

| Metrica | Resultado |
|---|---|
| Peticiones de demo evaluadas | 145 (202 preguntas) |
| Respuestas de demo que cambian frente a 8-bit | 9 de 202 |
| Estados de PR-labeler evaluados | 92 (276 preguntas) |
| Respuestas de labeler que cambian frente a 8-bit | 33 de 276 (12%) |
| Cambio máximo de probabilidad | 0,35 |
| Tiempo de modelo relativo al build de chat | 0,83× |
| Evaluación en suites de referencia | no realizada para esta compilación |

Sobre la compilación 8-bit se midió transfer-v4 (ocho fuentes públicas retenidas del entrenamiento): confianza media 0,08 por encima de la precisión (ECE 0,081), con rango de −0,04 (qnli) a +0,25 (emotion) por fuente; el 8,8% de las respuestas dadas con ≥ 0,9 son incorrectas.

## Requisitos de hardware

- VRAM/unified memory estimada: 3,9 GB para el modelo de texto en 4-bit; 4,8 GB si se cargan los codificadores multimodales de `media/`.
- Hardware objetivo: Apple Silicon con MLX; el autor reporta mediciones en Apple M1 Max.
- GPU no Apple: no soportadas por esta compilación (formato MLX); para CUDA habría que recurrir a otras compilaciones del modelo base.
- Cabe en equipos de consumo Apple con al menos 8 GB de memoria unificada, aunque se recomienda 16 GB para margen.
- Despliegue: `pip install "d1a[serve,mlx,media] @ git+https://github.com/jonpol01/d1a"` y `python -m d1a.serving.serve --run JohnP1/d1a-e4b-it-mlx-q4@v0.6 --port 8009`.
- Throughput relativo: 0,83× el tiempo del build de chat 8-bit en M1 Max; no se publican valores absolutos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| D1A-E4B-it MLX 4-bit (este) | 7.463 M | no disponible | MLX safetensors 4-bit | Apache-2.0 | Decisión con salida estructurada, solo Apple Silicon |
| JohnP1/d1a-e4b-it-mlx-q8 | no disponible | no disponible | MLX safetensors 8-bit | Apache-2.0 | Misma tarea, menor desviación frente al build servido; recomendado por el autor |
| JohnP1/d1a-e4b-it (base sin cuantizar) | no disponible | no disponible | safetensors | Apache-2.0 | Modelo de referencia con adaptador sin fusionar; permite chat |
| google/gemma-4-E4B-it | no disponible | no disponible | safetensors | Apache-2.0 | Backbone conversacional multimodal; no especializado en decisión |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de la comparación interna 4-bit frente a 8-bit descrita arriba.

## Limitaciones y advertencias

- No es un modelo de chat: el adaptador fusionado altera el backbone y el texto generado no corresponde a Gemma 4 E4B-it.
- No evaluado en las suites de referencia a 4 bits; el 12% de respuestas de PR-labeler difieren del build servido, por lo que las cifras de la model card pueden no mantenerse.
- Sobreconfianza en transfer-v4: ECE 0,081 y 8,8% de error en respuestas con confianza ≥ 0,9 (medido en 8-bit); una temperatura global no corrige la desviación por fuente.
- Requiere `<bos>` (id 2) al inicio de cada petición; sin él, la entrada queda fuera de distribución.
- Idiomas limitados a inglés y japonés; el rendimiento en castellano no está documentado.
- Datos de entrenamiento de PRs en parte privados, lo que dificulta la reproducibilidad y la auditoría de sesgos.
- Licencia Apache-2.0 permite uso comercial, pero los datos JGLUE subyacentes son CC BY-SA 4.0 y los de hermes-agent MIT, con obligaciones de atribución.
- Dependencia de MLX limita el despliegue a Apple Silicon; no hay soporte CUDA ni ROCm en esta compilación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JohnP1/d1a-e4b-it-mlx-q4
- Modelo base D1A (sin cuantizar): https://huggingface.co/JohnP1/d1a-e4b-it
- Compilación 8-bit: https://huggingface.co/JohnP1/d1a-e4b-it-mlx-q8
- Modelo base Google: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de código: https://github.com/jonpol01/d1a
- Issue sobre calibración de temperatura: https://github.com/jonpol01/d1a/issues/361
- Pull request de dependencia: https://github.com/jonpol01/d1a/pull/261
- Kev (framework base): https://github.com/jaredpalmer/kev
- JGLUE: https://github.com/yahoojapan/JGLUE
- NousResearch/hermes-agent: https://github.com/NousResearch/hermes-agent
- Avatar del modelo: https://huggingface.co/JohnP1/d1a-e4b-it-mlx-q4/resolve/main/d1a-avatar.png
