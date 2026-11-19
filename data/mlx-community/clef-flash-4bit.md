# mlx-community/clef-flash-4bit

## Resumen

Clef Flash es un modelo de decisión estructurada desarrollado originalmente por Cloudflare y distribuido aquí en formato MLX cuantizado a 4 bits por la comunidad mlx-community para su ejecución en Apple Silicon. No es un modelo conversacional: recibe un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas y devuelve, en un único paso forward, una probabilidad para cada opción permitida. Esto lo convierte en una herramienta especializada para clasificación zero-shot, extracción de campos y enrutamiento de decisiones con salida estructurada y verificable.

El modelo base cuenta con 9.409.813.744 parámetros (aproximadamente 9B) y una ventana de contexto de 16.384 tokens, según la documentación del autor. La arquitectura se etiqueta como `qwen3_5` en los metadatos de Hugging Face, con un cabezal conjunto de esquema ("joint schema head") que produce las distribuciones sobre las opciones definidas por el usuario. El paquete incluye código personalizado (`clef_mlx.py`) necesario para cargar el backbone junto con dicho cabezal; las herramientas de generación de texto estándar cargan solo el backbone y producen salida sin sentido.

Su relevancia actual radica en que ofrece una alternativa local y ligera (6,2 GB de pesos, 7,0 GB de memoria pico con 1k tokens) a las APIs de clasificación en la nube, con licencia Apache 2.0 y capacidad multimodal. Está pensado para integrarse en pipelines de decisión tipo SystemOne, donde la salida debe ser una probabilidad calibrada sobre un conjunto cerrado de opciones, no texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone tipo `qwen3_5` y cabezal conjunto de esquema (joint schema head); multimodal (texto, JSON, imágenes, vídeo) |
| Parametros totales | 9.409.813.744 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (el cabezal fue entrenado a 16k) |
| Tipos de cuantizacion | 4-bit (esta variante); existe variante 8-bit del mismo modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con código personalizado `clef_mlx.py` |
| Libreria | mlx (mlx-vlm >= 0.7.4, < 0.8; probado con mlx 0.32.3, mlx-lm 0.32.0, mlx-vlm 0.7.4) |
| Tamano del repositorio | 6,2 GB |
| Modelo base | Cloudflare/clef-flash |
| Pipeline | zero-shot-classification |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados. Los metadatos identifican el backbone como `qwen3_5`, un transformer multimodal que procesa texto, JSON, imágenes y secuencias de fotogramas de vídeo. Sobre ese backbone se añade un cabezal conjunto de esquema que, en un solo paso forward, calcula una distribución de probabilidad sobre las opciones permitidas para cada pregunta del esquema. Las preguntas pueden ser de tipo `choice` (elección entre criterios), `score` (puntuación ordinal sobre una lista de criterios) y `noul` (booleano sí/no).

No se especifica si hubo RLHF, DPO u otras fases de alineamiento. La innovación técnica principal es el propio paradigma de decisión: en lugar de generar texto autoregresivamente, el modelo evalúa directamente la compatibilidad entre el estado de entrada y cada opción, lo que produce salidas estructuradas y probabilísticas en una sola pasada. El autor advierte que el cabezal fue entrenado con contexto de 16k tokens y que el truncado es el comportamiento por defecto, replicando la implementación de referencia.

## Capacidades

- Clasificación zero-shot con salida probabilística sobre un conjunto cerrado de opciones definido por el usuario.
- Extracción de decisiones estructuradas mediante esquemas tipados: `choice`, `score` y `noul`.
- Procesamiento de estados multimodales: texto plano, JSON, imágenes (PIL) y vídeo (arrays de fotogramas).
- Enrutamiento y triaje: asignación de departamento, urgencia, categoría o etiqueta a partir de un estado.
- Evaluación booleana de condiciones (por ejemplo, "¿está el servicio caído?", "¿es legible el total del recibo?").
- Puntuación ordinal sobre criterios definidos (por ejemplo, "puede esperar", "esta semana", "hoy").
- Servidor local compatible con la API SystemOne (`POST /v1/systemone`, `GET /health`, `GET /v1/models`), lo que permite apuntar clientes existentes a una máquina local.
- No soporta tool calling ni function calling en el sentido de los modelos conversacionales.
- No soporta generación de texto libre ni razonamiento multi-paso conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como estado y un esquema con preguntas de tipo `choice` (departamento: facturación, técnico) y `score` (urgencia: puede esperar, esta semana, hoy). Devuelve probabilidades por opción en una sola pasada, lo que permite enrutar automáticamente sin generación de texto.
- Moderación y clasificación de contenido: dado un mensaje o publicación, se definen preguntas booleanas (`noul`) y de elección sobre categorías de riesgo. La salida probabilística facilita umbrales configurables y auditoría de decisiones.
- Extracción de campos en documentos con imagen: se adjunta una imagen (por ejemplo, un recibo o una factura) y se pregunta si el total es legible o a qué categoría corresponde el gasto. El modelo procesa la imagen junto con el estado textual en el mismo forward.
- Enrutamiento en atención al cliente automatizada: integrado en un pipeline previo a un modelo conversacional, Clef Flash decide el departamento y la urgencia; el modelo de chat solo se invoca después, reduciendo coste y latencia.
- Evaluación de calidad en pipelines de datos: puntuación ordinal de muestras según criterios definidos (relevancia, toxicidad, completitud) para filtrar datasets o priorizar revisiones humanas.
- Servidor local de decisiones para prototipos: mediante `clef_mlx.py serve`, se expone un endpoint compatible con SystemOne en `127.0.0.1:8000`, lo que permite probar clientes existentes contra un modelo local en un Mac sin depender de la nube.
- Análisis de vídeo para decisiones simples: con arrays de fotogramas como entrada, se pueden evaluar condiciones booleanas o de elección sobre el contenido visual (por ejemplo, presencia de un objeto o estado de una escena), aunque no se soporta vídeo por HTTP.

## Benchmarks y rendimiento

La model card de esta variante no publica resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros). Remite a la model card original de `Cloudflare/clef-flash` para consultar los benchmarks del modelo base. Los únicos datos de rendimiento disponibles son medidas de latencia y memoria en hardware Apple:

| Metrica | 1k tokens | 4k tokens | 16k tokens |
|---|---|---|---|
| Memoria pico (4-bit) | 7,0 GB | 7,2 GB | 8,6 GB |
| Latencia (4-bit, M5 Max) | 0,31 s | no disponible | 7,0 s |
| Memoria pico (8-bit) | 11,4 GB | 11,6 GB | 13,0 GB |
| Latencia (8-bit, M5 Max) | 0,34 s | no disponible | 7,7 s |

No se han publicado resultados de benchmarks de calidad en la información disponible para esta variante.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia 4-bit: 7,0 GB con 1k tokens, 7,2 GB con 4k tokens y 8,6 GB con 16k tokens.
- RAM mínima recomendada en Mac: 16 GB para la variante 4-bit (macOS limita el uso de GPU a aproximadamente el 70-75% de la RAM por defecto).
- Hardware objetivo: Apple Silicon (MLX). Las medidas de latencia se realizaron en un M5 Max.
- GPU NVIDIA (A100, H100, RTX 4090): no disponibles para este formato MLX; requerirían la versión original del modelo base en otro formato.
- Cabe en Macs consumer con 16 GB o más de RAM unificada para la variante 4-bit; la variante 8-bit requiere 24 GB (16 GB para prompts cortos).
- Opciones de despliegue: `clef_mlx.py` (carga del backbone y cabezal), servidor local integrado (`serve --port 8000`), y consumo vía API SystemOne. No es compatible con vLLM, llama.cpp, Ollama, LM Studio ni TGI para inferencia útil, ya que estas herramientas cargan solo el backbone y producen texto sin sentido.
- Latencia medida: 0,31 s con 1k tokens y 7,0 s con 16k tokens en M5 Max con entrada de texto.
- Throughput: las peticiones se ejecutan de una en una en la GPU; no hay batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Memoria pico (1k) | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| clef-flash-4bit (esta ficha) | ~9B | 16.384 | MLX 4-bit | 7,0 GB | Apache 2.0 | Decisión estructurada multimodal |
| clef-flash-8bit | ~9B | 16.384 | MLX 8-bit | 11,4 GB | Apache 2.0 | Decisión estructurada multimodal |
| clef-4bit | ~27B | 16.384 | MLX 4-bit | 17,1 GB | Apache 2.0 | Decisión estructurada multimodal (mayor calidad) |
| clef-8bit | ~27B | 16.384 | MLX 8-bit | 30,5 GB | Apache 2.0 | Decisión estructurada multimodal (mayor calidad) |

Las variantes de 27B obtienen mejores puntuaciones de calidad según la model card, a costa de mayor memoria y latencia (1,4 s con 1k tokens y 26,0 s con 16k tokens en el caso de clef-4bit). No se dispone de comparación con modelos de clasificación de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: las herramientas de generación de texto (`mlx_lm.generate`, `mlx_vlm.generate`, LM Studio, Ollama) cargan el backbone pero producen salida sin sentido. Solo `clef_mlx.py` ejecuta el cabezal de decisión.
- Las entradas largas se truncan por defecto para ajustarse a 16.384 tokens; para obtener un error `ContextTooLong` hay que pasar `truncate=False` o aumentar `max_length`, aunque el cabezal fue entrenado a 16k.
- Una sola petición por llamada: no hay batching y las peticiones se ejecutan secuencialmente en la GPU.
- No se pueden combinar imágenes y vídeo en un mismo registro; el vídeo no está soportado sobre HTTP.
- El servidor local no tiene autenticación; se recomienda mantener el binding a `127.0.0.1` salvo que se coloque un proxy delante.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento; no se han publicado análisis de calibración.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: no se especifican los idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, pero el código personalizado `clef_mlx.py` depende de internals de mlx-vlm, por lo que actualizaciones de versión menor no probadas pueden romper la carga.
- La conversión a 4-bit puede degradar la calidad respecto al modelo base; no se han publicado métricas de degradación para esta variante.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/mlx-community/clef-flash-4bit
- Modelo base original: https://huggingface.co/Cloudflare/clef-flash
- Variante 8-bit del mismo tamano: https://huggingface.co/mlx-community/clef-flash-8bit
- Variante 4-bit del modelo de 27B: https://huggingface.co/mlx-community/clef-4bit
- Variante 8-bit del modelo de 27B: https://huggingface.co/mlx-community/clef-8bit
- Proyecto Decision Index: https://github.com/apolinario/decision-index
