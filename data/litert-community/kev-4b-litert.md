# litert-community/Kev-4B-LiteRT

## Resumen

Kev-4B-LiteRT es la conversión al formato LiteRT (TFLite) del modelo de decisión Kev-4B, desarrollado originalmente por Jared Palmer sobre el backbone de Qwen3.5-4B-Base. A diferencia de un modelo generativo convencional, Kev no produce texto: recibe un "estado" (un texto de entrada) y un conjunto de preguntas tipadas sobre él —binarias (`noul`), de elección múltiple (`choice`) y de puntuación (`score`)— y devuelve, para cada pregunta, una distribución de probabilidades sobre las respuestas posibles. La adaptación se realiza mediante una cabeza puntero de dos capas lineales que lee los estados ocultos del backbone, ajustado con un LoRA de rango 16 cuyos pesos se han fusionado en el modelo final.

Este repositorio, mantenido por la comunidad litert-community, empaqueta el modelo como ocho ficheros LiteRT: seis grafos por filas para secuencias de hasta 64, 128, 256, 512, 1.024 y 2.048 tokens, y dos pares de estado compartido (Ls128 y Ls256) que ejecutan el estado una sola vez y luego cada pregunta por separado, con preguntas de hasta 64 tokens. Los grafos devuelven estados ocultos y un host en Python construye las filas de entrada, selecciona el fichero adecuado y aplica la cabeza.

La relevancia de esta ficha es doble: por un lado, muestra un patrón poco habitual de uso de un LLM como extractor de decisiones estructuradas en lugar de generador; por otro, documenta con detalle los límites prácticos del despliegue on-device, ya que el modelo no cupo en la memoria de un Galaxy S26 de 12 GB y solo se validó en hardware de escritorio (GPU Apple M4 Max). El tamaño del repositorio (85,8 GB) refleja los múltiples grafos y precisiones incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B-Base) con cabeza puntero de dos capas lineales y LoRA rango 16 fusionado |
| Parametros totales | 4B (backbone); cabeza puntero adicional no cuantificada en la informacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 2.048 tokens por fila (grafos L64 a L2048); pares de estado compartido hasta 256 tokens de estado + 64 tokens de pregunta |
| Tipos de cuantizacion | Grafos LiteRT en float32 (validados); float16 mencionado para estabilidad de normas; no se detallan otros formatos |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT/TFLite (8 ficheros), con variantes externas en ONNX, GGUF y MLX (no verificadas por el autor) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer denso de 4.000 millones de parametros, sobre el que se aplica un LoRA de rango 16 para adaptarlo a la tarea de decisión. La innovación principal es la cabeza puntero: dos capas lineales que proyectan los estados ocultos del backbone en probabilidades sobre las opciones de cada pregunta. El modelo no genera tokens de respuesta; el host interpreta las probabilidades y construye la respuesta JSON con el formato `/v1/systemone` del servidor del autor.

La conversión a LiteRT incluye una optimización del kernel Gated DeltaNet (presente en la arquitectura Qwen3.5), que reduce el número de operadores de 27.921 a 11.226 en el grafo L512 en fp32, manteniendo las probabilidades dentro de 5,3e-6 respecto al grafo anterior en las 402 preguntas de test. También se escalan las entradas de dos normas por potencias de dos para evitar desbordamientos en float16 sin alterar los valores en fp32. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Clasificación de texto estructurada: responde preguntas binarias (`noul`), de elección múltiple (`choice`) y de puntuación ordinal (`score`) sobre un texto de estado.
- Salida probabilística calibrada: devuelve distribuciones de probabilidad por opción, no solo la etiqueta ganadora.
- Procesamiento de estados largos: hasta 2.048 tokens por fila en el grafo mayor; pares de estado compartido para reutilizar el cálculo del estado con múltiples preguntas.
- Modo multi-pregunta: varias preguntas tipadas sobre el mismo estado en una sola petición.
- No genera texto libre: la salida es siempre una estructura de decisión.
- Soporte de tool calling / function calling: no disponible (el modelo no genera texto ni llamadas a herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; el patrón de estado compartido permite encadenar preguntas, pero no hay bucle agéntico.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: cabecera de decisión con probabilidades, formato de servidor compatible con `/v1/systemone`.

## Casos de uso

- **Triaje de tickets de soporte**: el modelo clasifica un ticket en categorías (facturación, envío, devoluciones, técnico) y detecta si hay un plazo explícito o el grado de enfado del cliente, como muestra el ejemplo de la model card con tres preguntas sobre el mismo estado. Es adecuado porque devuelve probabilidades por opción y permite umbrales de confianza.
- **Moderación de contenido con criterios múltiples**: aplicar varias preguntas binarias (¿es spam?, ¿contiene datos personales?, ¿es ofensivo?) sobre un mismo texto usando el par de estado compartido Ls128 o Ls256 para no recalcular el estado en cada pregunta.
- **Enrutamiento de correos o mensajes**: decidir a qué equipo o cola debe ir un mensaje entrante mediante preguntas `choice` con criterios definidos, integrado en un pipeline de mensajería.
- **Encuestas y feedback estructurado**: convertir comentarios libres en puntuaciones ordinales (`score`) y etiquetas categóricas, por ejemplo para medir satisfacción o urgencia en encuestas post-servicio.
- **Extracción de señales en documentos cortos**: sobre estados de hasta 2.048 tokens, responder preguntas binarias sobre presencia de cláusulas, fechas o condiciones en contratos o formularios.
- **Clasificación on-device en escritorio**: desplegar el modelo en estaciones de trabajo con GPU Apple (validado en M4 Max con Metal) para tareas de clasificación local sin enviar datos a la nube, usando el host Python incluido.
- **Pre-filtrado en pipelines de datos**: etiquetar grandes volúmenes de textos con preguntas tipadas antes de pasarlos a un modelo generativo, reduciendo coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta métricas de fidelidad y latencia frente a la referencia en PyTorch fp32:

| Metrica | Resultado |
|---|---|
| Preguntas de test evaluadas | 401 (402 en la comparación de kernel) |
| Coincidencia con la opción más probable de la referencia | 100% (incluidas 9 casi-empates con diferencia ≤ 0,02) |
| Diferencia máxima de probabilidad respecto a la referencia | 0,0152 |
| Latencia fila de 300 tokens (L512, GPU M4 Max, fp32) | 396,0–396,5 ms (antes 464,4–464,7 ms) |
| Latencia fila de 1.805 tokens (L2048, GPU M4 Max, fp32) | 1.705,4 ms (antes 1.824,2 ms) |
| Latencia fila de 80 tokens (L128, GPU M4 Max, fp32) | 118,5 ms |
| Desviación del kernel Gated DeltaNet optimizado (fp32) | ≤ 5,3e-6 en 402 preguntas |

## Requisitos de hardware

- **VRAM estimada**: los ficheros L64 y L1024 ocupan 7,8 GB cada uno; el repositorio completo suma 85,8 GB. La inferencia requiere cargar al menos un grafo y la cabeza puntero.
- **GPU recomendadas**: validado en GPU Apple M4 Max (Metal, fp32) y CPU del mismo equipo. No se reportan pruebas en NVIDIA A100, H100 ni RTX 4090.
- **Consumer GPU**: no se documenta compatibilidad con GPUs de consumo NVIDIA. En móvil, un Galaxy S26 de 12 GB agotó la memoria al compilar el grafo en dos intentos (con L1024 y con L64).
- **Alternativa móvil**: para ese teléfono el autor recomienda el hermano menor `litert-community/Kev-0.8B-LiteRT`, que sí cabe.
- **Opciones de despliegue**: LiteRT con `ai-edge-litert` 2.2.0 y el host Python `host/kev_litert.py`; existen variantes ONNX, GGUF y MLX de terceros no verificadas.
- **Latencia y throughput**: latencias por fila de 118,5 ms (80 tokens) a 1.705,4 ms (1.805 tokens) en GPU M4 Max; no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kev-4B-LiteRT | 4B | 2.048 tokens/fila | LiteRT | Apache 2.0 | Modelo de decisión, solo inglés, validado en escritorio |
| Kev-0.8B-LiteRT | 0,8B | no disponible | LiteRT | Apache 2.0 | Hermano menor que sí cabe en un Galaxy S26 de 12 GB |
| Kev-4B (original, PyTorch) | 4B | no disponible | PyTorch | Apache 2.0 | Referencia fp32 del autor; base de esta conversión |
| Qwen3.5-4B-Base | 4B | no disponible | safetensors | no disponible | Backbone generativo original; Kev lo adapta a clasificación |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo generativo**: no produce texto libre ni llamadas a herramientas; solo devuelve probabilidades sobre opciones predefinidas.
- **Solo inglés**: no hay soporte declarado para otros idiomas.
- **Validación limitada a escritorio**: todas las comprobaciones se hicieron en un Apple M4 Max; no hay datos de rendimiento en GPUs NVIDIA ni en servidores.
- **No cabe en móviles de 12 GB**: el intento de ejecución en un Galaxy S26 agotó la memoria al compilar; para ese caso hay que usar la variante de 0,8B.
- **Riesgo de alucinación**: al ser un clasificador, el riesgo se traduce en probabilidades mal calibradas o decisiones erróneas en casi-empates; la model card reporta 9 casi-empates entre 401 preguntas de test.
- **Sesgos**: no se documentan análisis de sesgo en la información disponible; al heredar el backbone Qwen3.5-4B-Base, puede arrastrar sesgos de sus datos de entrenamiento.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos derivados.
- **Variantes de terceros no verificadas**: los formatos ONNX, GGUF y MLX los publican otros autores y el equipo de LiteRT no ha comprobado su contenido.
- **Caveat de producción**: la selección del grafo según la longitud de la fila la realiza el host; un uso incorrecto del fichero puede degradar la fidelidad respecto a la referencia.

## Enlaces

- [Hugging Face: litert-community/Kev-4B-LiteRT](https://huggingface.co/litert-community/Kev-4B-LiteRT)
- [Modelo base: jaredpalmer/kev-4b](https://huggingface.co/jaredpalmer/kev-4b)
- [Backbone: Qwen/Qwen3.5-4B-Base](https://huggingface.co/Qwen/Qwen3.5-4B-Base)
- [Servidor del autor: github.com/jaredpalmer/kev](https://github.com/jaredpalmer/kev)
- [Hermano menor: litert-community/Kev-0.8B-LiteRT](https://huggingface.co/litert-community/Kev-0.8B-LiteRT)
- [Variante ONNX: midudev/kev-4b-ONNX](https://huggingface.co/midudev/kev-4b-ONNX)
- [Variante GGUF: ggml-org/Kev-4B-GGUF](https://huggingface.co/ggml-org/Kev-4B-GGUF)
- [Variante MLX: RoderickQiu/kev-4b-mlx-8bit](https://huggingface.co/RoderickQiu/kev-4b-mlx-8bit)
