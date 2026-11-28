# LorisYounger/ChatVPet-qw35-9B-v1-GGUF

## Resumen

ChatVPet-qw35-9B-v1-GGUF es la versión cuantizada en formato GGUF de ChatVPet-qw35-9B-v1, un modelo conversacional de 9.197.093.888 parámetros afinado por LorisYounger para funcionar como mascota virtual de escritorio (vpet, virtual pet). El modelo parte de una base Qwen3.5 de 9B y está especializado en mantener diálogos de personaje con un formato de respuesta estructurado: la primera línea de cada respuesta contiene etiquetas de control (delegación de tareas, selección de expresión) y las líneas siguientes son el diálogo dirigido al jugador.

El repositorio publica tres niveles de cuantización (Q4_K_M, Q5_K_M y Q6_K) generados a partir del modelo BF16 original, además de una proyección visual opcional de 876 MiB que permite al modelo interpretar imágenes. La licencia es Apache 2.0 y los pesos están pensados para ejecutarse con llama.cpp o LM Studio, lo que facilita el despliegue local en hardware de consumo.

Su relevancia actual radica en el enfoque de "modelo de personaje con protocolo de control": en lugar de limitarse a generar texto, el modelo emite directivas que el programa anfitrión interpreta para consultar datos, ejecutar compras o cambiar la expresión del personaje. Esto lo convierte en un ejemplo práctico de integración entre un LLM local y una aplicación de escritorio con estado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5), con plantilla de chat embebida y soporte de proyección visual multimodal |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuración de referencia del autor |
| Tipos de cuantizacion | Q4_K_M (5,38 GiB), Q5_K_M (6,19 GiB), Q6_K (7,04 GiB); proyección visual F16 (876 MiB) |
| Idiomas soportados | Chino (zh) declarado en la model card; otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en BF16 está en el repo LorisYounger/ChatVPet-qw35-9B-v1 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 9B parámetros derivado de Qwen3.5, con plantilla de chat propia que debe usarse tal cual (el autor indica usar la plantilla embebida en el modelo). El ajuste está orientado a un dominio muy concreto: conversación de personaje con protocolo de control. La respuesta se divide en una primera línea con etiquetas como `[delegate]` o `[expression:conscientious]` y el texto de diálogo posterior, lo que permite al host separar la lógica de operación de la locución dirigida al jugador.

El autor documenta un proceso de evaluación y de edición de pesos: menciona "权重编辑" (edición de pesos) que corrigió dos respuestas concretas del conjunto de regresión (nombrar un cascabel como "浅滩" y un caballete como "江灯"). No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El modelo incluye una proyección visual separada (mmproj) que habilita entrada de imágenes cuando se carga con `--mmproj` en llama.cpp.

## Capacidades

- Generación de texto conversacional en chino con un formato de respuesta estructurado en dos partes: etiquetas de control y diálogo.
- Emisión de directivas de delegación (`[delegate]`) para que el programa anfitrión ejecute consultas o acciones (por ejemplo, consultar el precio de un artículo) y devuelva el resultado al modelo.
- Selección de expresiones faciales mediante etiquetas (`[expression:...]`), que el host traduce en cambios visuales del personaje.
- Capacidad multimodal opcional: con la proyección visual F16 cargada, el modelo lee imágenes (en la prueba del autor identificó el número 731, un cuadrado rojo a la izquierda y un círculo azul a la derecha).
- Soporte de conversaciones multiturno con contexto de hasta 8192 tokens en la configuración de referencia.
- Modo de razonamiento desactivable (`--reasoning off` en llama.cpp), pensado para respuestas cortas de personaje.
- No se documentan capacidades de tool calling genérico, agentes multi-paso ni matemáticas/código más allá del protocolo específico de delegación del host.

## Casos de uso

- Mascota virtual de escritorio: el modelo gestiona el diálogo del personaje y emite etiquetas de expresión que la aplicación traduce en animaciones; el formato de dos líneas permite separar la lógica de control del texto mostrado al usuario.
- Asistente con acceso a datos del host mediante delegación: ante una pregunta como el precio de un producto, el modelo emite `[delegate]` y el host consulta la tienda; el modelo continúa la respuesta con el dato devuelto ("面包8块。没买，只是看了价格。").
- Simulación de tienda o economía interna de un juego: el autor reporta 21/21 pruebas de integración superadas cuando el diálogo y las operaciones se reparten entre el modelo de personaje y un modelo de operaciones independiente, frente a 9/21 cuando se usa el mismo modelo para ambas tareas.
- Interacción multimodal en escritorio: con la proyección visual cargada, el personaje puede comentar capturas de pantalla u otras imágenes enviadas por el host, con un coste adicional de unos 876 MiB de VRAM.
- Despliegue local ligero en GPU de consumo: el archivo Q4_K_M (5,38 GiB) permite ejecutar el modelo en tarjetas con 8 GB de VRAM o más, dejando margen para el contexto.
- Prototipado de personajes conversacionales con protocolo de control: sirve como referencia para diseñar formatos de respuesta que combinen etiquetas de acción y diálogo natural en aplicaciones de escritorio.
- Servicio local compatible con la API de OpenAI: el autor documenta el arranque con `llama-server` y el endpoint `/v1/chat/completions`, lo que permite integrarlo en clientes existentes.

## Benchmarks y rendimiento

El autor publica una evaluación propia de regresión sobre 401 preguntas de "桌宠" (mascota de escritorio), con loss de validación calculada sobre 128 conversaciones fijas (42.603 tokens de respuesta):

| Modelo / cuantización | Tamano | Loss de validacion | Regresion (401) | Subconjunto de seleccion (48) |
|---|---:|---:|---:|---:|
| BF16 nativo (Transformers) | no disponible | 1,79824 | 338/401 | no disponible |
| BF16 GGUF sin cuantizar | no disponible | 1,79778 | 337/401 | no disponible |
| Q6_K | 7,04 GiB | 1,79775 | 335/401 | 34/48 |
| Q5_K_M | 6,19 GiB | 1,81073 | 339/401 | 33/48 |
| Q4_K_M | 5,38 GiB | 1,81760 | 328/401 | 30/48 |

Los tres niveles cuantizados superan las 18 preguntas que requieren consultar el diario del personaje. En la prueba de integración de tienda, el reparto entre modelo de diálogo y modelo de operaciones alcanza 21/21, frente a 9/21 usando un único modelo para ambas funciones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ~5,4 GiB de pesos; Q5_K_M ~6,2 GiB; Q6_K ~7,0 GiB. Añadir memoria para el contexto (8192 tokens en la configuración de referencia) y, si se usa visión, 876 MiB adicionales para la proyección F16.
- Medición del autor en RTX 5090 D con llama-server, Q5_K_M a todas las capas en GPU, contexto 8192 y concurrencia 1: 6490 MiB en modo solo texto y 7366 MiB con la proyección visual cargada (876 MiB de diferencia).
- Cabe en GPU de consumo: Q4_K_M y Q5_K_M son viables en tarjetas de 8 GB o más; Q6_K requiere más margen. No se especifican modelos concretos recomendados más allá de la RTX 5090 D empleada en las pruebas.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio (con soporte de Qwen3.5) y cualquier runtime compatible con GGUF y plantilla Jinja. El autor documenta el flag `--jinja` y `--reasoning off`.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de respuesta cualitativos y el consumo de VRAM indicado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de comparaciones directas publicadas por el autor frente a otros modelos. La comparación más fiable es interna, entre los propios niveles de cuantización del repositorio:

| Modelo | Parametros | Contexto | Licencia | Formato | Regresion propia (401) |
|---|---|---:|---|---|---:|
| ChatVPet-qw35-9B-v1 Q5_K_M | 9,2B | 8192 | Apache 2.0 | GGUF | 339/401 |
| ChatVPet-qw35-9B-v1 Q6_K | 9,2B | 8192 | Apache 2.0 | GGUF | 335/401 |
| ChatVPet-qw35-9B-v1 Q4_K_M | 9,2B | 8192 | Apache 2.0 | GGUF | 328/401 |

Frente a alternativas de propósito general de tamaño similar, la información disponible no incluye comparaciones; se indica "no disponible".

## Limitaciones y advertencias

- El modelo está afinado para chino y para el dominio de mascota virtual; su rendimiento fuera de ese contexto no está documentado.
- El autor reconoce errores de memoria en conversaciones multiturno: el modelo puede escribir mal nombres recién introducidos por el jugador (por ejemplo, "柚白" como "栲白").
- El protocolo de respuesta depende de la plantilla de chat y del system prompt del repositorio; usar otra plantilla o prompt puede romper el formato de etiquetas y la delegación.
- El reparto de funciones es crítico: usar el mismo modelo para diálogo y operaciones degrada la integración (9/21 frente a 21/21 en las pruebas del autor).
- Riesgo de alucinación en datos consultados: el diseño de delegación mitiga el problema, pero el modelo puede responder sin esperar el resultado del host si no se respeta el flujo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener sus propias condiciones; conviene revisar la licencia del modelo base antes de producción.
- Los pesos cuantizados introducen pequeñas diferencias de redacción y pérdida de precisión respecto al BF16; el autor documenta diferencias concretas entre Q5_K_M y Q6_K en preguntas específicas.
- No hay datos publicados de sesgos, robustez frente a prompts adversarios ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LorisYounger/ChatVPet-qw35-9B-v1-GGUF
- Modelo base BF16: https://huggingface.co/LorisYounger/ChatVPet-qw35-9B-v1
- Código de integración del host: https://github.com/LorisYounger/ChatVPet
- Prompt de sistema: https://huggingface.co/LorisYounger/ChatVPet-qw35-9B-v1-GGUF/blob/main/system_prompt.txt
- Resultados de evaluación: https://huggingface.co/LorisYounger/ChatVPet-qw35-9B-v1-GGUF/blob/main/evaluation.json
- Informe de loss: https://huggingface.co/LorisYounger/ChatVPet-qw35-9B-v1-GGUF/blob/main/loss-report.json
- Sumas de verificación: https://huggingface.co/LorisYounger/ChatVPet-qw35-9B-v1-GGUF/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/LorisYounger/ChatVPet-qw35-9B-v1-GGUF/blob/main/LICENSE
