# ndemirdemir/BranchOne

## Resumen

BranchOne es un adaptador de decisión publicado por el usuario ndemirdemir sobre el backbone Qwen3.5-0.8B-Base. No es un modelo generativo: recibe un estado o evidencia textual, una pregunta y entre 2 y 150 descripciones candidatas (con una imagen opcional), y devuelve una probabilidad por candidato junto con el identificador del candidato seleccionado. El problema que resuelve es acotar la salida de un LLM a un conjunto cerrado de opciones etiquetadas, con una distribución calibrada en lugar de texto libre.

La release incluye adaptadores LoRA entrenados (rango 8 sobre el backbone de texto), una cabeza de decisión compartida entrenada, un procesador, calibración y el código de inferencia; el backbone se descarga aparte desde el Hub. La arquitectura codifica cada candidato contra la misma evidencia en una rama independiente de Qwen y agrega las representaciones mediante una proyección de 1.024 a 256 dimensiones más un MLP residual que produce un escalar por candidato.

Es relevante ahora por su planteamiento de "enrutado con abstención": por defecto la acción es `defer`, porque la release no incluye un umbral de aceptación automática validado. Está pensado para integrarse en pipelines de clasificación y selección de acciones donde se exige trazabilidad (logits, probabilidades, temperatura y metadatos de calibración) y donde el coste de un falso positivo es alto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3.5-0.8B-Base con adaptadores LoRA de rango 8 en el codificador de texto, vision backbone congelado y cabeza de decisión compartida (proyección 1024→256 + MLP residual → 1 escalar por candidato, softmax con temperatura) |
| Parametros totales | 0,8 B en el backbone; parámetros de los adaptadores LoRA y de la cabeza de decisión no disponibles |
| Parametros activos | No aplica (no es un modelo MoE; se activan todos los parámetros del backbone y de los adaptadores en cada rama) |
| Longitud de contexto | 8.192 tokens expandidos por rama candidata, incluyendo estado, pregunta, formato del prompt, descripción del candidato y tokens de imagen (máximo 256 tokens visuales por imagen) |
| Tipos de cuantizacion | No disponible. La release solo cualifica FP16 en los pesos del backbone y FP32 en la cabeza; cuantización no soportada oficialmente |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors más código de inferencia propio (carga con `trust_remote_code=True`); adaptadores PEFT/LoRA, cabeza de decisión, procesador y calibración incluidos en el repositorio |

## Arquitectura y entrenamiento

BranchOne reformula la clasificación como una comparación de descripciones: cada candidato se codifica contra la misma evidencia en una rama independiente del backbone Qwen3.5-0.8B-Base. La representación resultante de cada candidato (ancho 1.024) pasa por una proyección compartida a 256 dimensiones y un MLP residual que emite un único escalar; el softmax sobre esos escalares, aplicando la temperatura suministrada, produce las probabilidades por candidato. Este checkpoint emplea el scorer independiente, sin capa de comparación entre candidatos. La cabeza de generación de vocabulario no se utiliza y el backbone de visión permanece congelado durante el entrenamiento.

Los únicos parámetros entrenados son los adaptadores LoRA de rango 8 del backbone de texto y la cabeza de decisión. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO, por lo que esos datos no están disponibles. Como innovaciones operativas destacan el procesado por ramas con presupuesto de tokens estricto (entradas sobredimensionadas lanzan error en lugar de truncarse), la reutilización de caché de prefijo deshabilitada en esta release y una capa de política que devuelve `action: "defer"` con estado `no validated policy` cuando no se aporta un umbral validado por el integrador.

## Capacidades

- Selección entre candidatos: devuelve `selected_id`, `candidate_ids` alineados con la entrada, `probabilities`, `logits` en bruto, temperatura y recuento de tokens.
- Clasificación de texto con etiquetas descritas en lenguaje natural: entre 2 y 150 candidatos con identificadores únicos y descripciones no vacías.
- Entrada multimodal opcional: una única imagen PIL o ruta local, redimensionada a un presupuesto máximo de 256 tokens visuales.
- Enrutado con abstención: política de diferimiento por defecto y umbral opcional aportado por el llamador.
- Trazabilidad de calibración: metadatos de calibración y política incluidos en la respuesta.
- Sin capacidades de generación de texto, tool calling, agentes autónomos ni razonamiento multi-paso: el modelo puntúa opciones, no produce respuestas abiertas.
- Sin soporte de URLs de imagen, múltiples imágenes, vídeo ni audio.
- Cobertura multilingüe: no disponible (no declarada en la model card).

## Casos de uso

- Triaje de tickets de soporte: dada la descripción del caso y un conjunto de departamentos o categorías descritas textualmente, el modelo devuelve la probabilidad de cada uno y el candidato seleccionado, lo que permite enrutar con un umbral propio y derivar a revisión humana cuando la confianza es baja.
- Gestión de incidencias posventa: con un estado como "el paquete llegó pero el artículo está roto" y candidatos del tipo "tramitar reemplazo" o "seguir el envío", el scorer elige la acción coherente con la evidencia, evitando que un LLM generativo invente una política inexistente.
- Inspección visual de daños: usando la entrada de imagen, se puede clasificar una fotografía de producto entre descripciones de incidencia (golpe, mancha, embalaje roto) con una distribución de probabilidad auditable.
- Selección de siguiente acción en agentes: integrado como cabecera de decisión sobre un conjunto finito de herramientas o comandos descritos en texto, con `defer` como salida segura cuando no se supera el umbral validado por el equipo.
- Evaluación de respuestas candidatas en control de calidad: puntuar varias descripciones o resúmenes generados frente a la misma evidencia para elegir la mejor según la cabeza entrenada, en lugar de recurrir a un juez generativo.
- Moderación y aplicación de políticas: elección entre descripciones de política (permitir, revisar, bloquear) con probabilidades registrables para auditoría y con umbral ajustado por el equipo de confianza y seguridad.
- Extracción de campos en documentación: dado el texto de un contrato o factura y un conjunto de descripciones de categorías, seleccionar la que corresponde, con la ventaja de que la salida está restringida al vocabulario definido por el integrador.
- Enrutado de intenciones en asistentes conversacionales: clasificar la petición del usuario en un conjunto acotado de intenciones descritas en lenguaje natural y pasar el control a un LLM generativo solo tras superar el umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, calibración (ECE), latencia ni throughput, y los resultados de búsqueda web obtenidos corresponden a leaderboards genéricos sin páginas específicas de este modelo.

## Requisitos de hardware

- Entorno cualificado: Linux x86-64, Python 3.13, GPU NVIDIA con CUDA. El entorno de referencia es una A100 con PyTorch 2.11.0 y CUDA 12.8, Transformers 5.17.0, pesos del backbone en FP16 y cabeza en FP32.
- VRAM estimada: la model card no publica una cifra ni un benchmark de memoria máxima; indica únicamente que deben quedar "varios GB" de memoria GPU libres y que el requisito crece con la longitud de entrada y, implícitamente, con el número de candidatos al procesarse una rama por candidato.
- GPU recomendadas: A100 como entorno de referencia validado. No hay validación publicada para H100, RTX 4090 ni otras GPU.
- GPU de consumo: no cualificado. La release no soporta oficialmente CPU, otras precisiones ni cuantización, por lo que no se puede afirmar que funcione en GPUs de consumo.
- Despliegue: carga mediante `transformers.AutoModel.from_pretrained(..., trust_remote_code=True)` con el código incluido en el repositorio; el instalador crea un entorno aislado, instala dependencias bloqueadas y compila `causal-conv1d==1.7.0`, lo que exige herramientas de desarrollo de CUDA 12.8. No hay soporte declarado para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. La caché de prefijo está deshabilitada en esta release y el coste computacional aumenta con cada candidato adicional y con la longitud de entrada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de fichas de modelos comparables de la misma categoría (scorers de decisión con LoRA sobre un backbone pequeño) en la información proporcionada. La única referencia disponible es el modelo base.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BranchOne | 0,8 B de backbone más LoRA r8 y cabeza (tamaño de adaptadores no disponible) | 8.192 tokens expandidos por rama candidata | Selección entre 2-150 candidatos con abstención | Apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen3.5-0.8B-Base | 0,8 B | No disponible en esta ficha | Modelo base generativo previo al ajuste | No disponible en esta ficha | HuggingFace |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La distribución de probabilidad es condicional al conjunto de opciones suministrado: no demuestra que la opción correcta esté presente entre los candidatos.
- No existe un umbral de aceptación automática validado. El valor por defecto es `action: "defer"` con `deferral_status: "no validated policy"`; cualquier umbral aportado por el llamador debe validarse por su cuenta.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe ni de calidad fuera del idioma o idiomas de entrenamiento, que tampoco se documentan.
- Sesgos conocidos: no disponibles. La model card no incluye análisis de sesgo ni evaluación por subgrupos.
- Riesgo de error en la selección: al no generar texto, el fallo se manifiesta como una elección incorrecta o mal calibrada; sin métricas de calibración publicadas no se puede asumir que las probabilidades estén bien ajustadas en dominios distintos del de entrenamiento.
- Límite duro de 8.192 tokens expandidos por rama, incluyendo los tokens de imagen; las entradas que lo exceden lanzan error y no se truncan. Aumentar la configuración de contexto no está soportado en esta release entrenada.
- Restricciones de modalidad: solo una imagen por petición, sin URLs, sin vídeo ni audio.
- Rendimiento no cualificado fuera del entorno de referencia: CPU, precisiones distintas de FP16/FP32 y cuantización no están soportadas oficialmente.
- Coste de inferencia: una rama por candidato, hasta 150, con caché de prefijo deshabilitada; la propia model card advierte que no se garantiza igual calidad ni velocidad en todos los recuentos de candidatos.
- Licencia: el adaptador es Apache-2.0 y permite uso comercial, pero el modelo base Qwen3.5-0.8B-Base tiene su propia licencia, no incluida en esta información, que debe revisarse antes de un despliegue en producción.
- Seguridad de la cadena de suministro: requiere `trust_remote_code=True` para cargar código propio del repositorio; en producción conviene fijar `revision` a un SHA concreto y auditar el código de inferencia. El instalador compila `causal-conv1d` y necesita CUDA 12.8 y, en algunos entornos, privilegios de root.
- Madurez: 0 descargas y 0 likes, repositorio de 0,0 GB, publicado y actualizado el 23 de octubre de 2026; no se incluyen scripts de entrenamiento ni repositorio de reproducción, y no hay benchmarks públicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ndemirdemir/BranchOne
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Resultados de búsqueda web sin información específica del modelo (leaderboards genéricos): https://benchlm.ai/ , https://openrouter.ai/rankings , https://localaimaster.com/tools/ai-model-leaderboard
- Papers, blogs, repositorios de reproducción y demos: no disponibles en la información proporcionada.
