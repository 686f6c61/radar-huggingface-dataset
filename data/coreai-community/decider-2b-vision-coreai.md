# coreai-community/decider-2b-vision-CoreAI

## Resumen

decider-2b-vision-CoreAI es un port del modelo de decisión multimodal Mapika/decider-2b-vision (revisión `863e290`, Apache-2.0) al runtime Apple Core AI, empaquetado en formato `.aimodel`. El modelo recibe una imagen, un contexto breve y una o varias preguntas con opciones etiquetadas con letras, y devuelve una probabilidad por opción leída directamente de los logits de las letras en la posición de respuesta, todo en un único forward pass. No genera texto en ningún caso: su salida es una distribución calibrada sobre un conjunto cerrado de opciones.

El modelo subyacente lo desarrolla Mapika: los pesos de texto de decider-2b v5 se trasplantaron al modelo visión-lenguaje Qwen3.5-2B y se afinaron un epoch con fotogramas de videojuego etiquetados por políticas scriptadas, tareas de opción múltiple con imagen de The Cauldron y una repetición del mix de texto, seguido de PPO desde píxeles. Este repositorio concreto es un espejo (mirror) del repositorio canónico `mlboydaisuke/decider-2b-vision-CoreAI`, con conversión a Core AI, cuantización int8 por bloques del decodificador y dos torres de visión de rejilla fija.

Su relevancia es doble: por un lado, es un caso poco habitual de modelo de decisión (no generativo) con salida probabilística calibrada; por otro, demuestra inferencia totalmente on-device en Apple Silicon, con latencias medidas de 0,75-0,79 s para la rejilla de 256×256 y 1,4 s para 448×448 en un iPhone 18 Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas, 18 de Gated DeltaNet y 6 de atención completa, más torre de visión con rejilla fija |
| Parametros totales | 2B (heredados del modelo base Qwen3.5-2B-Base; no se publica el desglose exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Decodificador int8 por bloques de 32, excepto las capas 0, 2 y 5 en fp16, con embedding/head atados en fp16 (bundle de 2.664 MB); variante de referencia del decodificador en fp16 (3.786 MB). Torre de visión en pesos fp16 con cómputo en fp32 (660 MB a g256, 663 MB a g448) |
| Idiomas soportados | inglés (`en`); no se declaran otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI); este repositorio no publica safetensors ni GGUF |
| Tamano del repositorio | 7,8 GB |
| Resoluciones de vision | g256: 256×256, 64 tokens de imagen; g448: 448×448, 196 tokens de imagen |
| Vocabulario | 248.320 tokens; tokens de imagen como ids V+k (k en orden row-major sobre la rejilla fusionada) |
| Tokens especiales | `<|vision_start|>` (248053), `<|vision_end|>` (248054), `<|image_pad|>` (248056) |
| Funciones del grafo | `main` con S=1 y `prefill` con S=16 |

## Arquitectura y entrenamiento

La parte de texto es el híbrido de Qwen3.5-2B: 6 capas de atención completa combinadas con 18 capas de Gated DeltaNet, un mecanismo de atención lineal recurrente. El port a Core AI divide el modelo en dos grafos: una torre de visión fijada a una rejilla concreta (g256 o g448, elegida en tiempo de carga) que produce 64 o 196 filas de imagen, y un decodificador que recibe ids de token y esas filas como entrada estática, y que deriva internamente las posiciones M-RoPE de tres planos. El decodificador se sirve como un único bundle con dos funciones especializadas, una para decodificación paso a paso (S=1) y otra de prefill (S=16). La cuantización es int8 por bloques de 32 en las lineales, dejando en fp16 las capas 0, 2 y 5 y el embedding/head atado.

El entrenamiento del modelo original consistió en trasplantar los pesos de texto de decider-2b v5 al modelo visión-lenguaje Qwen3.5-2B, afinarlo durante un epoch sobre fotogramas de videojuego etiquetados por políticas scriptadas, tareas de opción múltiple con imagen de The Cauldron y una repetición del mix de texto, y aplicar después PPO desde píxeles. Los ítems escritos por profesor del mix de texto provienen de un Qwen3.5-27B ejecutado localmente. La innovación técnica central no es arquitectónica sino de contrato de lectura: la respuesta no se genera, se lee de los logits de las letras A-J en la ranura de respuesta, lo que permite extraer una probabilidad calibrada por opción en un solo pase y responder varias preguntas de la misma imagen simultáneamente.

## Capacidades

- Decisión visual con opción múltiple: dada una imagen (foto, diagrama, fotograma de videojuego), un contexto y hasta 10 opciones etiquetadas, devuelve una probabilidad por opción.
- Salida calibrada: ECE de 0,03 sobre 300 ítems de Visual7W según la cifra del autor, lo que permite fijar umbrales de confianza.
- Múltiples preguntas por imagen: todas las preguntas de una fila se responden en el mismo forward pass.
- Preguntas solo de texto: pasan por los mismos pesos y el mismo contrato de lectura.
- Sin generación de texto: el modelo nunca produce secuencias libres, lo que elimina el riesgo de texto inventado pero descarta cualquier tarea generativa.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la model card declara únicamente inglés.
- Capacidades especiales: lectura de probabilidades por letra desde logits, rejilla de visión conmutable entre 256×256 y 448×448, ejecución on-device en GPU vía Core AI. No hay modo "thinking", visión generativa, audio ni decodificación especulativa declarada.

## Casos de uso

- Agentes que juegan o analizan videojuegos: con la rejilla g256, el modelo evalúa un fotograma de 256×256 y elige entre opciones discretas (por ejemplo, cuántos objetos hay o qué acción es correcta) en 0,75-0,79 s en un iPhone 18 Pro. Es adecuado porque el entrenamiento incluyó fotogramas etiquetados por políticas scriptadas y porque no necesita generar texto para decidir.
- Triaje visual en aplicaciones iOS con requisitos de privacidad: al ejecutarse íntegramente on-device con Core AI, la imagen nunca sale del dispositivo. Se puede usar para clasificar capturas en categorías cerradas y derivar al usuario solo cuando la probabilidad máxima cae por debajo de un umbral.
- Control de calidad industrial con respuestas cerradas: sobre una foto de una pieza, plantear preguntas tipo "¿el borde está deformado?" con opciones "sí/no/dudoso" y registrar la probabilidad para auditar el proceso. La calibración ECE 0,03 hace viable fijar umbrales de aceptación.
- Evaluación automática de material docente: comprobar si un diagrama contiene los elementos esperados formulando varias preguntas de opción múltiple sobre la misma imagen en un único pase, con la rejilla g448 para figuras con texto pequeño.
- Enrutado de decisiones en pipelines de datos: usar la salida probabilística como señal para clasificar imágenes en un flujo de anotación, enviando a revisión humana solo los casos con confianza baja.
- Verificación de contratos de conversión de modelos: la puerta de validación de este port compara la paridad de probabilidades con el código fp32 del autor sobre un fixture propio y 500 ejecuciones de fotos reservadas, por lo que sirve como referencia para validar otras conversiones a Core AI.
- Pruebas de accesibilidad y UI sobre capturas: responder preguntas cerradas sobre una pantalla ("¿el botón es visible?", "¿el contraste es suficiente?") eligiendo entre opciones, con latencia de 1,4 s en la rejilla de 448×448.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| Visual7W (held out) | Exactitud | 0,89 | 300 ítems; cifra del autor, citada y no re-medida en este port |
| Visual7W (held out) | ECE | 0,03 | Calibración; cifra del autor |
| The Cauldron (6 tareas del mix) | Exactitud | 0,80-0,95 | Cifra del autor |
| Puerta de conversión Core AI | Paridad de probabilidad frente al código fp32 del autor | Verificada | Fixture propio más 500 ejecuciones de fotos reservadas |
| iPhone 18 Pro, iOS 27.0 (24A437) | Latencia g256 (JIT en dispositivo) | 0,75-0,79 s | Medición del repositorio |
| iPhone 18 Pro, iOS 27.0 (24A437) | Latencia g448 (JIT en dispositivo) | 1,4 s | Medición del repositorio |
| M4 Max, macOS 27.0 (26A428) | Rendimiento | no disponible | Se probó la ejecución, pero no se publican cifras de latencia o throughput |

No se han publicado resultados comparativos frente a otros modelos en la información disponible.

## Requisitos de hardware

- Huella de los bundles: decodificador int8mix 2.664 MB más torre g256 660 MB (3,32 GB en total) o torre g448 663 MB (3,33 GB). La variante de referencia fp16 del decodificador ocupa 3.786 MB, que sumada a la torre g448 da 4,45 GB.
- Memoria en ejecución: no disponible como cifra oficial; LLM Explorer reporta 4,4 GB de VRAM para el modelo base Mapika/decider-2b-vision.
- Sistema operativo: macOS 27 o iOS 27. En iOS 27 se requiere el entitlement de límite de memoria incrementado.
- Hardware validado: M4 Max con macOS 27.0 (26A428) y iPhone 18 Pro con iOS 27.0 (24A437). La variante fp16 solo se probó en el M4 Max.
- GPU compatibles: no se declara una lista; el port se especializa con `preferredComputeUnitKind: .gpu` dentro del ecosistema Core AI de Apple. No hay soporte CUDA declarado.
- Opciones de despliegue: Apple Core AI mediante el paquete Swift `DeciderVision` del CoreAI Model Zoo. No hay soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio; esos runners aplican a los formatos originales de la familia Mapika, no a `.aimodel`.
- Latencia: 0,75-0,79 s (g256) y 1,4 s (g448) por decisión en iPhone 18 Pro con JIT en dispositivo. Throughput y latencia en M4 Max: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| decider-2b-vision-CoreAI (este) | 2B | no disponible | Sí (g256 / g448) | `.aimodel` | Apache-2.0 | Port cuantizado a Core AI; 0 descargas y 0 likes; repositorio espejo |
| Mapika/decider-2b-vision | 2B | no disponible | Sí | Pesos originales del autor | Apache-2.0 | Modelo fuente del port, revisión `863e290`; es la referencia de paridad |
| mlboydaisuke/decider-2b-coreai-ft | 2B | no disponible | No (solo texto o JSON) | `.aimodel` | no disponible | Variante de decisión solo texto, afinada con 1.399 ítems duros verificados; mismo contrato de lectura |
| decider-4b (familia Mapika/decider) | 4B | no disponible | no disponible | GGUF (Q8_0, Q4_K_M) y bf16 | no disponible | Según el repositorio de Mapika, Q8_0 iguala a bf16 y Q4_K_M baja 0,2 puntos en tarea |

Rendimiento comparativo entre estos modelos: no disponible. Las cifras de Visual7W y The Cauldron corresponden al modelo base y no se han re-medido sobre el port Core AI más allá de la puerta de paridad de probabilidades.

## Limitaciones y advertencias

- No genera texto: solo devuelve probabilidades sobre un conjunto cerrado de hasta 10 opciones por pregunta. Cualquier tarea de respuesta abierta, resumen o diálogo queda fuera de su alcance.
- Idioma: la model card declara únicamente inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Ecosistema restringido: requiere macOS 27 o iOS 27, Apple Silicon y, en iOS, el entitlement de límite de memoria incrementado. No es desplegable en vLLM, llama.cpp, Ollama ni TGI.
- Cuantización: el decodificador usa int8 por bloques de 32 salvo tres capas. La puerta de validación solo verificó paridad de probabilidades frente al código fp32 del autor sobre un fixture propio y 500 fotos reservadas, no sobre la totalidad de dominios posibles.
- Rejillas de visión fijas: 256×256 o 448×448. Cualquier imagen debe reescalarse a una de las dos, lo que puede degradar detalles finos en fotos de alta resolución.
- Sesgos de dominio: el ajuste se hizo con fotogramas de políticas scriptadas y tareas de The Cauldron, por lo que el comportamiento fuera de esos dominios visuales no está caracterizado.
- Riesgo de error: al no existir texto generado, el fallo típico no es la alucinación textual sino una distribución mal calibrada o una elección errónea cuando la respuesta correcta no está entre las opciones ofrecidas.
- Sin BOS ni plantilla de chat: el contrato de lectura exige un formato exacto y el bloque de imagen debe ir inmediatamente antes de `Context:`; una integración descuidada rompe la paridad de salida.
- Validación comunitaria mínima: el repositorio figura con 0 descargas y 0 likes, y es un espejo de `mlboydaisuke/decider-2b-vision-CoreAI`, que es el repositorio canónico.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar también los términos del modelo base Mapika/decider-2b-vision y de Qwen3.5-2B-Base antes de un despliegue en producción.
- Fechas de prueba: las mediciones y la publicación del repositorio son del 29 de septiembre de 2026; el software de macOS 27 e iOS 27 puede haber cambiado desde entonces.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/coreai-community/decider-2b-vision-CoreAI
- Repositorio canónico (espejo de origen): https://huggingface.co/mlboydaisuke/decider-2b-vision-CoreAI
- Modelo fuente: https://huggingface.co/Mapika/decider-2b-vision (revisión `863e290863655f1d6b69324d77d09ac972d21609`)
- CoreAI Model Zoo: https://github.com/john-rocky/coreai-model-zoo
- Ficha del modelo en el zoo: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/decider-2b-vision/README.md
- Paquete Swift DeciderVision: https://github.com/john-rocky/coreai-model-zoo/tree/main/apps/DeciderVision
- Repositorio de la familia decider: https://github.com/Mapika/decider
- Variante de decisión solo texto: https://huggingface.co/mlboydaisuke/decider-2b-coreai-ft
- Model card de la variante de visión: https://github.com/XCWQW1/decider/blob/main/MODEL_CARD_VISION.md
- Ficha en LLM Explorer: https://llm-explorer.com/model/Mapika%2Fdecider-2b-vision,1SUvHpABlJ7CDk3W3he1HT
