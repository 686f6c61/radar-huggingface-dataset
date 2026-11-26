# mohit67890/imajev-2b

## Resumen

imajev-2b es un adaptador LoRA publicado por Mohit Garg (usuario `mohit67890`) sobre el modelo base Qwen/Qwen3.5-2B, orientado a la toma de decisiones tipificadas ("typed decisions") en entornos empresariales. A diferencia de un modelo conversacional al uso, el sistema devuelve una etiqueta escogida entre un conjunto de opciones predefinido por la aplicacion, acompanada de una probabilidad calibrada y de una opcion explicita de "no puedo determinarlo" (*can't tell*). El objetivo es que un sistema automatico actue solo cuando la confianza es alta y derive el resto a una persona.

El modelo es multimodal en entrada (pipeline `image-text-to-text`): lee fotografias, registros y texto que la empresa ya posee y los contrasta con los campos declarados. El caso canonico que documenta el autor es la verificacion de un anuncio de venta: la ficha declara un color y la foto muestra otro, y el modelo identifica el campo discrepante con una probabilidad asociada.

Se distribuye como adaptador PEFT (0,4 GB en el repositorio) bajo licencia Apache-2.0, con pesos en safetensors y soporte declarado para MLX. Forma parte de una familia de tres tamanos (2B, 4B y 9B); esta variante es la mas pequena y la mas conservadora segun el autor, y su adaptador no se actualizo cuando el tier de 4B paso a una nueva generacion el 26 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen/Qwen3.5-2B |
| Parametros totales | 2B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); tag `mlx` |
| Tamano del repositorio | 0,4 GB |
| Pipeline | image-text-to-text |
| Libreria | peft |
| Descargas / likes | 253 / 4 |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero, sino un adaptador LoRA acoplado a Qwen/Qwen3.5-2B, un transformer de 2.000 millones de parametros con capacidad de procesamiento de imagen y texto. El adaptador anade la capa de comportamiento especifica del producto: la formulacion de la decision como seleccion entre opciones tipificadas, la emision de probabilidades calibradas y la clase de abstención entrenada. Los tags del repositorio indican soporte de ejecucion en MLX, lo que sugiere intencion de despliegue local en hardware Apple.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El autor menciona un benchmark propio, ImajevBench, y referencia una evaluacion sobre el tier de 4B con una fase 3 de entrenamiento, pero no se aportan datos equivalentes para este adaptador de 2B, que queda descrito como generacion anterior y sin entrada oficial en el tablon de texto.

## Capacidades

- Clasificacion y decision tipificada: devuelve una de las opciones definidas por la aplicacion, no texto libre.
- Probabilidad calibrada por opcion, pensada para fijar umbrales de automatizacion.
- Abstención entrenada (*can't tell*) cuando la evidencia no permite decidir.
- Verificacion cruzada entre imagen y registro declarado (por ejemplo, color de un producto frente a la foto del anuncio).
- Comparacion de dos imagenes para emitir una unica decision.
- Entrada multimodal: imagen y texto combinados en la misma peticion.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.

## Casos de uso

- Verificacion de anuncios de marketplace: contrastar los campos declarados (color, modelo, estado) con las fotos subidas y bloquear automaticamente los anuncios con discrepancias de alta confianza, derivando el resto a revision humana.
- Tramitacion de devoluciones y reembolsos: clasificar la solicitud en las categorias del sistema (procedente, improcedente, falta informacion) a partir del texto del cliente y de la foto del articulo recibido.
- Enrutado de tickets de soporte: asignar cada incidencia a un equipo concreto usando un conjunto cerrado de destinos, con probabilidad asociada para decidir si se escala a un agente.
- Revision documental en back-office: comprobar que los datos de un formulario coinciden con la imagen del documento adjunto y marcar el campo concreto que no cuadra.
- Control de calidad en catalogo de producto: detectar fichas con atributos incoherentes respecto a la fotografia antes de publicarlas.
- Triaje con derivacion humana: como el modelo declara explicitamente cuando no puede decidir, encaja en flujos donde el coste de un falso positivo es alto y se prefiere abstenerse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para imajev-2b en la informacion disponible. Las cifras que aparecen en la model card corresponden al tier de 4B de la familia y no son extrapolables a este adaptador:

| Benchmark | Resultado del 4B (referencia, no del 2B) | Posicion |
|---|---|---|
| JevBench v1.4.2.2 | 67,4 | 1 de 91 |
| Image JevBench v0.1.3 | 76,39 | 1 de 49 |
| DecisionBench (eng, v1) | 79,65 | 3 de 56 |

La model card indica expresamente que el 2B "no tiene entrada oficial en el tablon de texto".

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un transformer de 2B en FP16 requiere aproximadamente 4-5 GB solo para pesos, mas overhead de activaciones y del procesador de vision; en cuantizacion de 8 bits o 4 bits baja a rangos de 2-3 GB y 1,5-2 GB respectivamente. Son estimaciones genericas, no cifras publicadas por el autor.
- GPU recomendadas: no especificadas. Por tamano, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, asi como en A100/H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si, previsiblemente, dado el tamano del modelo base.
- Opciones de despliegue: la libreria declarada es PEFT, por lo que el adaptador se carga junto al modelo base con `transformers` + `peft`. El tag `mlx` apunta a ejecucion en Apple Silicon mediante MLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| imajev-2b | 2B (base) + LoRA | no disponible | Decision tipificada multimodal con abstención | Apache-2.0 | Hugging Face |
| imajev-4b | 4B (base) + LoRA | no disponible | Misma familia, tier superior y generacion mas reciente | Apache-2.0 | Hugging Face |
| imajev-9b | 9B (base) + LoRA | no disponible | Misma familia, tier mayor | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B | 2B | no disponible | Modelo base multimodal de proposito general | no disponible en la informacion | Hugging Face |

La comparacion con alternativas fuera de la familia (por ejemplo, clasificadores dedicados o modelos de decision de otros autores citados en los tablones como Plumb-4B o decider-4b) no puede establecerse con datos verificables para el 2B, ya que no figura en esos rankings.

## Limitaciones y advertencias

- Solo ingles: el campo de idioma declara unicamente `en`, lo que limita su uso en castellano sin evaluacion previa.
- Adaptador desactualizado: el autor indica que el tier de 4B recibio un nuevo adaptador el 26 de septiembre de 2026 y que este 2B "permanece como generacion anterior".
- Sin benchmarks publicados para esta variante: las cifras de la model card pertenecen al 4B y no deben atribuirse al 2B.
- Riesgo de calibracion deficiente: la utilidad del modelo depende de que las probabilidades esten bien calibradas en el dominio concreto; conviene validar los umbrales con datos propios antes de automatizar decisiones.
- Riesgo de alucinacion en la seleccion de campo: aunque el formato de salida esta restringido a opciones, el modelo puede senalar el atributo equivocado como discrepante.
- Ambito restringido: no es un modelo conversacional ni de proposito general; usarlo fuera del esquema de decision tipificada no esta soportado por el entrenamiento declarado.
- Licencia Apache-2.0 permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B, no detalladas en la informacion disponible.
- Sin datos de contexto maximo ni de cuantizaciones soportadas, lo que dificulta planificar despliegues de produccion con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohit67890/imajev-2b
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/mohit67890/imajev
- Repositorio en GitHub: https://github.com/mohit67890/imajev
- Sitio web del proyecto: https://mohit67890.github.io/imajev/
- Informe tecnico: https://mohit67890.github.io/imajev/report/
- Dataset de benchmark ImajevBench: https://huggingface.co/datasets/mohit67890/imajev-bench
- Tablon JevBench: https://benchmarkheaven.com/jev-models
- Tablon Image JevBench: https://benchmarkheaven.com/image-jev-bench
- Tablon DecisionBench: https://huggingface.co/spaces/Hanno-Labs/decision-bench-leaderboard
- Tier 4B de la familia: https://huggingface.co/mohit67890/imajev-4b
- Tier 9B de la familia: https://huggingface.co/mohit67890/imajev-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Contacto del autor: https://mohitgarg.ai
