# DollasAndSpence/blink-4b

## Resumen

blink-4b es un modelo de decisión de 4.205.751.296 parámetros (8,4 GB en bf16) construido a partir de los pesos de texto de Qwen/Qwen3.5-4B. No es un modelo generativo al uso: en lugar de producir texto, recibe un estado (texto libre o JSON) junto con una o varias preguntas tipadas y devuelve una probabilidad por cada opción ofrecida. Las preguntas pueden ser de tipo `choice` (elegir entre alternativas etiquetadas), `noul` (sí/no) o `score` (valoración ordenada), y varias de ellas se pueden formular sobre un mismo estado en una única pasada hacia delante.

El problema que resuelve es el de las decisiones pequeñas y masivas: enrutado de peticiones, comprobaciones booleanas, clasificación con criterios definidos por el usuario y clasificación de intención, todo ello a volumen elevado y con coste por decisión bajo. El autor lo presenta explícitamente como alternativa a generar texto y parsearlo después, con la ventaja de que la salida ya está calibrada como distribución de probabilidad sobre las opciones.

El modelo lo publica DollasAndSpence (el model card referencia el espacio `thegovind`), con licencia propia `blink-research` que restringe los pesos a investigación y evaluación no comercial. La relevancia actual viene de su uso como componente de computer use: con `--vision-tower` toma prestado el codificador visual del Qwen base y completa 152 de 230 tareas (66%) en cero disparos sobre un conjunto de diez aplicaciones propias, no un benchmark público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3.5-4B (familia `qwen3_5_text`); el quickstart exige `flash-linear-attention==0.5.2`, lo que apunta a capas de atención lineal/híbrida. Configuración exacta: no disponible |
| Parametros totales | 4.205.751.296 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye pesos bf16 (8,4 GB); no se documentan variantes GGUF, AWQ, GPTQ ni cuantizaciones de 8/4 bits |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Pesos: `blink-research`, solo investigacion y evaluacion no comercial (`LICENSE.md`). Codigo: Apache-2.0. Aviso del modelo base: Apache-2.0 (`LICENSE-Qwen`) |
| Formato de pesos | safetensors (bf16) |
| Pipeline declarado | text-classification |
| Revision | v1.4 (revision de codigo; pesos identicos a v1.0) |
| Tamano del repositorio | 8,4 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Inferencia remota | `inference: false` (no hay endpoint alojado en HuggingFace) |

## Arquitectura y entrenamiento

blink-4b reutiliza los pesos de texto de Qwen/Qwen3.5-4B y los envuelve en una cabeza de lectura de decisiones. El mecanismo es una lectura one-pass: el estado y las preguntas tipadas (criterios y opciones etiquetadas con letras) se renderizan como evidencia en el prompt; las preguntas se agrupan en lotes y cada lote consume una única pasada hacia delante, de la que se extraen los logits del siguiente token en la posición de respuesta. Sobre las letras ofrecidas se aplica un softmax en FP32 que produce una probabilidad por opción. No se genera texto en ningún momento, lo que elimina la necesidad de parsear salidas y reduce la varianza de la respuesta.

Los detalles de entrenamiento no están disponibles en la información proporcionada: no se indican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El model card sí documenta el flujo de personalización: se puede afinar con adaptadores LoRA sobre decisiones propias, con una utilidad `examples/train/prepare.py` para verificar y dividir las filas de entrenamiento. Para la variante de computer use, el modelo toma prestado el codificador visual correspondiente del Qwen base mediante la opción `--vision-tower`, de modo que el binario principal sigue siendo un modelo de solo texto.

## Capacidades

- Decision tipada `choice`: elige entre opciones etiquetadas con letras y devuelve la probabilidad de cada una, util para enrutado y clasificación con criterios definidos por el usuario.
- Decision tipada `noul`: comprobación booleana sí/no sobre el estado recibido.
- Decision tipada `score`: valoración ordenada sobre una escala de criterios (por ejemplo, niveles de enfado de un cliente).
- Multiples preguntas por estado: una misma llamada puede plantear varias preguntas (`choice`, `noul`, `score`) sobre el mismo texto o JSON y resolverlas en la misma pasada por lote.
- Entrada flexible: acepta texto plano o JSON estructurado como `state`.
- Salida probabilística calibrada: softmax en FP32 sobre las letras ofrecidas, sin generación de texto.
- Computer use (opcional): con `--vision-tower` selecciona entre cajas numeradas sobre capturas de pantalla marcadas, comprueba si la tarea ha terminado y puede pedir confirmación antes de un clic arriesgado. No ve el código de la página ni la respuesta correcta.
- Servidor HTTP propio: `serve.py` expone `POST /v1/systemone`, `GET /v1/models` y `GET /healthz`, con batching entre peticiones mediante `--batch-window-ms`.
- Compatibilidad con SDK de TypeSafe: los SDK de Python y JavaScript en servidor se pueden apuntar con `TYPESAFE_BASE_URL`; las decisiones de texto usan los mismos campos de petición y respuesta que el servicio alojado Jev.
- Ejecucion en Apple silicon: `blink_mlx.py` reutiliza la lógica de `blink.py` (prompts, etiquetas de opción y respuestas) y hace la pasada con MLX en bf16; solo texto y JSON, y no actúa como servidor.
- Ajuste fino con LoRA sobre decisiones propias.
- Capacidades multilingues: no disponibles; el modelo está etiquetado únicamente para inglés.
- Modo thinking, audio o generación de texto: no disponibles.

## Casos de uso

- Enrutado de solicitudes en atencion al cliente: con una pregunta `choice` de criterios como `refund`, `replacement` o `info`, el modelo asigna una probabilidad a cada intencion y el sistema decide el flujo sin necesidad de un LLM generativo ni de parsear texto libre.
- Triaje y priorizacion de tickets: una pregunta `noul` ("¿requiere respuesta hoy?") y una pregunta `score` de urgencia sobre el mismo estado permiten clasificar la cola de soporte en una sola pasada por lote.
- Moderacion y comprobaciones de cumplimiento a volumen: preguntas booleanas tipadas sobre texto o JSON permiten filtrar contenido o validar campos antes de que entren en un pipeline posterior, con una probabilidad asociada a cada decision en lugar de una respuesta binaria opaca.
- Clasificacion de documentos y formularios: el estado puede ser JSON estructurado, de modo que el modelo etiqueta o puntua registros en lote, por ejemplo para asignar categoria o nivel de riesgo a cada entrada.
- Agentes de computer use: sobre capturas marcadas con cajas numeradas, el modelo elige la caja correcta, verifica si la tarea esta completada y solicita confirmacion antes de acciones arriesgadas; el autor reporta 66/76 pausas en clics realmente peligrosos y 17/20 tareas resueltas en un escritorio dibujado.
- Automatizacion de escritorio en aplicaciones de configuracion y compra: los resultados reportados (30/30 en Settings y 29/30 en Shop) lo sitúan como candidato para flujos guiados de configuracion o de compra asistida en interfaces conocidas.
- Puerta de decision previa a un LLM mayor: usar blink-4b para decidir si una peticion necesita un modelo grande, activando el modelo caro solo cuando la probabilidad de la opcion relevante supera un umbral.
- Despliegue local en portatil Apple: gracias al camino MLX, se pueden ejecutar decisiones de texto y JSON en un Mac sin GPU dedicada, con la utilidad `--check` para comparar respuestas con las ejecuciones guardadas del Space.
- Ajuste a dominios propios: entrenar un adaptador LoRA con decisiones etiquetadas de un vertical concreto (por ejemplo, seguros o logistica) y mantener el formato de salida probabilístico.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la demostración de computer use del propio autor, sobre diez aplicaciones construidas para la ocasión (no es un benchmark público). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Escenario | Resultado |
|---|---|
| Tareas totales (zero-shot) | 152/230 (66%) |
| Settings | 30/30 |
| Shop | 29/30 |
| Desktop (canvas) | 17/20 |
| Pausas en clics realmente arriesgados | 66/76 |

## Requisitos de hardware

- Peso de los pesos en bf16: 8,4 GB. La VRAM mínima realista para inferencia es de aproximadamente 10-12 GB sumando pesos, caché y activaciones.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más, como RTX 3060 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090. En tarjetas de 8 GB no cabe en bf16 sin cuantizar.
- GPU profesionales recomendadas: A100, H100 y L40S para servir en lote con margen de sobra; una L4 o una A10G de 24 GB también son suficientes para este tamaño.
- CPU y Apple silicon: el repositorio incluye un camino MLX para Apple silicon (bf16, solo texto y JSON, sin servidor). No se documenta un camino GGUF para llama.cpp ni Ollama.
- Opciones de despliegue: servidor propio `serve.py` (FastAPI implícito, puertos `POST /v1/systemone`, `GET /v1/models`, `GET /healthz`), contenedor Docker incluido en el repositorio, y `blink_mlx.py` en Mac. Para batching entre peticiones hay que activar `--batch-window-ms 5`; por defecto las peticiones se atienden de una en una.
- vLLM, TGI y llama.cpp: no se documentan como opciones soportadas en la información disponible.
- Dependencias del entorno: `torch==2.13.0`, `transformers==5.17.0`, `flash-linear-attention==0.5.2`, `accelerate>=1.1.0`, `safetensors` y `huggingface_hub`.
- Latencia y throughput: no disponibles. La única indicación estructural es que cada lote de preguntas consume una sola pasada hacia delante.

## Comparativa con modelos similares

Dentro de la propia familia blink existen dos variantes de mayor tamaño. No hay datos de benchmarks comparativos publicados en la información disponible, por lo que la comparación se limita a lo que el autor declara.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| blink-4b | 4.205.751.296 (8,4 GB bf16) | no disponible | blink-research (solo investigacion/evaluacion no comercial) | HuggingFace, `inference: false` |
| blink-mimo-9b | no disponible | no disponible | no disponible | HuggingFace (`thegovind/blink-mimo-9b`) |
| blink-27b | no disponible | no disponible | no disponible | HuggingFace (`thegovind/blink-27b`) |

Frente a modelos generativos de tamano similar (por ejemplo, el propio Qwen3.5-4B del que deriva), la diferencia no es de rendimiento en tareas abiertas sino de interfaz: blink-4b no genera texto y devuelve probabilidades por opción, lo que lo hace comparable en concepto a un clasificador y no a un asistente. No hay datos publicados que permitan comparar su precision con la de un clasificador entrenado específicamente ni con la de un LLM generativo al que se le pida elegir una opción.

## Limitaciones y advertencias

- Licencia restrictiva para produccion: los pesos se publican bajo `blink-research`, limitados a investigacion y evaluacion no comercial. Cualquier uso comercial requiere negociacion aparte. El codigo, en cambio, es Apache-2.0.
- Idioma: el modelo esta etiquetado solo para ingles; no hay evidencia publicada de comportamiento en castellano ni en otros idiomas.
- Ausencia de benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni de conjuntos de clasificacion reconocidos. Los unicos numeros disponibles provienen de una demo propia del autor sobre diez aplicaciones no publicas como benchmark, por lo que no son extrapolables.
- Riesgo de alucinacion en el sentido de calibracion: el modelo siempre reparte probabilidad entre las opciones ofrecidas, incluidas opciones incorrectas. Si el conjunto de criterios no cubre la respuesta correcta, el sistema puede recibir una opcion equivocada con alta confianza. Es imprescindible fijar umbrales y contar con una clase de escape.
- Dependencia del formato de las opciones: el etiquetado con letras y la redaccion de los criterios influyen en el resultado; cambios en los textos de las opciones pueden alterar las probabilidades.
- No genera texto: no sirve para redactar respuestas, resumir ni mantener conversaciones. Solo devuelve decisiones tipadas.
- Vision limitada: la variante de computer use depende de que el codificador visual del Qwen base este disponible mediante `--vision-tower` y de que la captura venga con cajas numeradas previamente marcadas. No lee el codigo de la pagina ni dispone de la respuesta correcta.
- Madurez y soporte: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y actualizacion practicamente simultaneas. No hay historial de mantenimiento ni comunidad.
- Ecosistema de despliegue estrecho: no hay rutas documentadas para vLLM, TGI, llama.cpp u Ollama, ni cuantizaciones publicadas, lo que limita el despliegue en hardware modesto.
- Servidor monohilo por defecto: sin `--batch-window-ms`, las peticiones se procesan de una en una, lo que puede convertirse en cuello de botella en produccion.
- Posible confusion de repositorio: los metadatos de HuggingFace apuntan a `DollasAndSpence/blink-4b`, mientras que el model card y el quickstart referencian el espacio `thegovind/blink-4b`. Conviene verificar cual es el repositorio canonico antes de integrarlo.

## Enlaces

- HuggingFace (metadatos): https://huggingface.co/DollasAndSpence/blink-4b
- HuggingFace referenciado en el model card: https://huggingface.co/thegovind/blink-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante mayor: https://huggingface.co/thegovind/blink-mimo-9b
- Variante mayor: https://huggingface.co/thegovind/blink-27b
- Demo (Space): https://huggingface.co/spaces/thegovind/blink
- Demo, caso de uso de pantalla: https://huggingface.co/spaces/thegovind/blink?tab=use-cases&case=screen
- Demostracion de computer use: https://thegovind.github.io/blink/computer-use/
- Referencia de API: https://thegovind.github.io/blink/api/
- Documentacion: https://thegovind.github.io/blink/
- Repositorio GitHub: https://github.com/thegovind/blink
- Codigo de computer use: https://github.com/thegovind/blink/tree/main/examples/cua
- Guia de MLX: https://github.com/thegovind/blink/tree/main/examples/mlx
- Ejemplo MLX (script): https://raw.githubusercontent.com/thegovind/blink/main/examples/mlx/blink_mlx.py
- Dataset de trazas y videos de computer use: https://huggingface.co/datasets/thegovind/blink-cua
- Licencia de pesos (`LICENSE.md`): incluida en el repositorio del modelo
- Aviso del modelo base (`LICENSE-Qwen`): incluido en el repositorio del modelo
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con la ficha
