# chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX

## Resumen

Jev-Style-0.8B-Decision-v3-MLX es la conversión a MLX (Apple Silicon) del modelo de decisión Jev-Style-0.8B-Decision-v3, desarrollado por chaoliangUNSW. No es un modelo generativo de propósito general: es un modelo de decisión que recibe un estado (por ejemplo, un ticket, una reseña o un bloque de evidencia de hasta 25.600 tokens), lo lee una sola vez y devuelve una probabilidad calibrada para cada una de las opciones de una pregunta, sin límite en el número de opciones. La model card lo resume como "one state, one pass, every option scored".

El modelo pertenece a la serie Jev-Style decision (v1 de 2B en GGUF, v2 de 2B en MLX bf16 y esta v3 de 0,8B) y se apoya en la arquitectura Qwen3.5, según el tag `qwen3.5` del repositorio y el requisito explícito de que `mlx-lm` incluya soporte `qwen3_5`. Esta build MLX incluye dos precisiones en un mismo repositorio, bf16 (1,50 GB) y 8-bit afín (0,80 GB), con un único runtime para ambas.

Su relevancia actual es doble: por un lado, reduce el coste de la decisión a un modelo de 0,8B que cabe en cualquier Mac con Apple Silicon; por otro, el autor reporta resultados que superan a los checkpoints oficiales de Laya en tareas de enrutado, toxicidad, intención y clasificación bancaria, además de mantener el rendimiento casi plano entre 1K y 24K tokens de contexto. La licencia es Apache-2.0 y el pipeline declarado es `text-classification`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5 (tag `qwen3.5`; el runtime exige `mlx-lm` con soporte `qwen3_5`), con lectura de decisión calibrada mediante temperaturas ajustadas (`readout_config.json`). No se especifica si es MoE o denso |
| Parámetros totales | Aproximadamente 0,8B (según la denominación del modelo) |
| Parámetros activos | No aplica / no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | Hasta 25.600 tokens de entrada; validado con prompts de aproximadamente 16K y 25,6K tokens |
| Tipos de cuantización | bf16 (1,50 GB) y 8-bit afín con group size 64 (0,80 GB), ambos en formato MLX; el runtime selecciona el dtype de activación validado para cada build |
| Idiomas soportados | 19 declarados en la metadata: en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi. El autor afirma evaluación en 51 idiomas, cifra que no coincide con la lista de la metadata |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` en formato MLX, en dos carpetas (`bf16/` y `8bit/`), más `config.json` y tokenizer en cada una |
| Modelo base | chaoliangUNSW/Jev-Style-0.8B-Decision-v3 (relación: `quantized`) |
| Librería / runtime | `mlx` 0.32.2 y `mlx-lm` 0.31.3 (`jev_style_decision_mlx.py`) |
| Pipeline declarado | `text-classification` |
| Tamaño del repositorio | 2,3 GB (ambas precisiones) |
| Fecha de publicación | 24 de septiembre de 2026 (según metadata de HuggingFace) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only heredada de la familia Qwen3.5, reutilizada aquí como núcleo de un modelo de decisión en lugar de un modelo de chat. La innovación principal está en la interfaz de salida: en lugar de generar texto libre token a token, el modelo lee el estado una sola vez y produce una puntuación por cada opción de la pregunta, sin límite en el número de opciones (el autor cita 77 vías en Banking77 y 20 opciones por pregunta en MASSIVE). Las probabilidades se calibraron con temperaturas ajustadas guardadas en `readout_config.json`, fichero que se distribuye junto al runtime, y el repositorio incluye además un `release_config.json` y un `manifest.json` con hashes sha256.

La conversión a MLX se validó mediante un conjunto de paridad de 240 filas mixtas extraídas del pool de entrenamiento (22 categorías, inglés y chino), con coincidencia total tanto en bf16 como en 8-bit: 240 de 240 filas y 6 de 6 prompts de aproximadamente 16K y 25,6K tokens idénticos a la referencia PyTorch FP32. Conviene subrayar que esta prueba mide el acuerdo entre formatos, no la precisión del modelo. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF, DPO u otras etapas de alineamiento) no están en la información proporcionada y se remiten a la model card principal.

## Capacidades

- Decisión y clasificación con probabilidad calibrada por opción: devuelve la opción seleccionada y el vector completo de probabilidades, lo que permite umbrales de abstención y comparación entre alternativas.
- Sin límite de opciones ("no letter cap"): puede puntuar conjuntos grandes de etiquetas, como las 77 clases de Banking77 o las 20 opciones por ítem de MASSIVE.
- Contexto largo: procesa entradas de hasta 25.600 tokens y mantiene el rendimiento en la franja de 1K a 24K tokens, lo que permite decidir sobre evidencia extensa.
- Multilingüe: evaluación declarada sobre 51 idiomas y 19 idiomas listados en la metadata del repositorio; cobertura principal documentada en inglés y chino.
- API de lote y verificación: el runtime expone `decide`, `decide_many`, `qtype="noul"` / `qtype="score"`, modo batch con `--jsonl` y `--verify` para comprobar la integridad de los ficheros compartidos y de la carpeta de precisión seleccionada.
- Ejecución en Apple Silicon mediante MLX, con selección automática del dtype de activación validado según la precisión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio o modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo de la model card muestra una entrada con `ticket` y `customer_tier` y una pregunta con opciones de equipo (`billing`, `technical`, `sales`) descritas con texto. El modelo devuelve la opción y las probabilidades, lo que permite derivar a un humano cuando la confianza es baja.
- Clasificación de intenciones en asistentes conversacionales: con 20 opciones por pregunta y 25.600 tokens de contexto, puede etiquetar la intención dominante a partir de un historial largo de conversación sin truncar el diálogo.
- Análisis de sentimiento multilingüe de reseñas: el ejemplo mínimo de la model card clasifica "The film was excellent." entre `negative` y `positive`; al estar evaluado en 51 idiomas, sirve para pipelines de opinión en catálogos internacionales.
- Moderación de toxicidad: el autor reporta +29,5 puntos de macro-F1 sobre el mejor checkpoint oficial de Laya en esta tarea, lo que lo hace apto para prefiltrar contenido antes de una revisión humana.
- Detección de jailbreak y seguridad: +7,2 puntos de balanced accuracy sobre Laya, útil como capa de decisión previa a un LLM generativo para decidir si se bloquea o se escala una petición.
- Clasificación bancaria fina (Banking77): con 77 clases y +19,0 puntos sobre Laya, encaja en la categorización automática de consultas de clientes en banca y fintech.
- Enrutado de modelos en una arquitectura de varios LLM: +30,3 puntos sobre Laya en la tarea de model routing, es decir, decidir qué modelo (barato o caro) debe atender cada petición.
- Decisiones sobre documentos largos: actas, contratos o informes de hasta 24K tokens donde hay que elegir una categoría o una acción concreta, con la ventaja de que el rendimiento declarado se mantiene estable en esa franja.
- Inferencia local con requisitos de privacidad: al ejecutarse con MLX en Apple Silicon y ocupar 0,80 GB en 8-bit, permite clasificar datos sensibles sin salir del portátil.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card. No se han incluido en esta ficha cifras que no aparezcan en la información proporcionada.

| Tarea / benchmark | Jev-Style-0.8B-Decision-v3 | Referencia | Diferencia |
|---|---|---|---|
| MASSIVE intent, macro accuracy en 51 idiomas | 71,7% | Laya multilingual oficial: 40,1% | Gana en 51 de 51 idiomas |
| Enrutado de modelos (model routing) | No disponible en valor absoluto | Mejor checkpoint oficial de Laya | +30,3 puntos |
| Toxicidad (macro-F1) | No disponible en valor absoluto | Mejor checkpoint oficial de Laya | +29,5 puntos |
| MASSIVE, 37 locales held-out | No disponible en valor absoluto | Mejor checkpoint oficial de Laya | +29,4 puntos |
| Banking77 (77 clases) | No disponible en valor absoluto | Mejor checkpoint oficial de Laya | +19,0 puntos |
| Jailbreak (balanced accuracy) | No disponible en valor absoluto | Mejor checkpoint oficial de Laya | +7,2 puntos |
| Decisiones tipadas (2.000 ítems) | 79,2% | Jev: +6,4 puntos por debajo; Jev-Style 2B v2: +5,7 puntos por debajo | Brier 3,2 veces menor que Jev |
| Contexto largo a 24K tokens | 98,3% de los ítems reales correctos | Controles sin evidencia: nivel de azar | Suite `long_grid_plus`, preregistrada |
| Paridad de formatos (bf16 y 8-bit frente a PyTorch FP32) | 240 de 240 filas; 6 de 6 prompts de ~16K y 25,6K tokens | Referencia PyTorch FP32 | Prueba de acuerdo entre formatos, no de precisión |

Condiciones declaradas: MASSIVE con 100 filas de test por idioma y 20 opciones cada una; v3 in-domain en 14 locales y held-out en 37; las cifras de Laya provienen de checkpoints oficiales reejecutados por el autor sobre las mismas filas y con sus temperaturas y presupuestos de tokens por defecto; en decisiones tipadas, v3 y Laya son in-domain y Jev es zero-shot.

## Requisitos de hardware

- VRAM o memoria unificada: 1,50 GB de pesos en bf16 y 0,80 GB en 8-bit; el repositorio completo ocupa 2,3 GB. A esto hay que sumar la memoria de activaciones y la caché KV para entradas de hasta 25.600 tokens.
- Plataforma objetivo: Apple Silicon mediante MLX. No es una build para CUDA; para NVIDIA habría que usar el repositorio PyTorch equivalente (Jev-Style-0.8B-Decision-v3).
- GPU recomendadas: cualquier Mac con chip de la serie M (M1 y posteriores) con memoria unificada suficiente; no se documentan requisitos para A100, H100 ni RTX 4090 en esta build.
- ¿Cabe en hardware de consumo? Sí: 0,80 GB en 8-bit es un tamaño apto para portátiles y equipos de sobremesa con Apple Silicon de gama de entrada.
- Opciones de despliegue: runtime propio `jev_style_decision_mlx.py` sobre `mlx` y `mlx-lm`, con modos `--precision bf16` / `--precision 8bit`, `--jsonl` para lotes y `--verify` para integridad. vLLM, llama.cpp, Ollama y TGI no están documentados para esta build MLX.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento comparado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Style-0.8B-Decision-v3-MLX (este) | ~0,8B | 25.600 tokens | 79,2% en 2.000 decisiones tipadas; 71,7% macro accuracy en MASSIVE (51 idiomas); Brier 3,2 veces menor que Jev | Apache-2.0 | MLX (bf16 y 8-bit) en HuggingFace |
| Jev (referencia base de la serie) | No disponible | No disponible | 6,4 puntos por debajo de v3 en decisiones tipadas y con Brier 3,2 veces peor; evaluado en zero-shot | No disponible | No disponible en la información proporcionada |
| Jev-Style-2B-Decision-v2-MLX-bf16 | 2B | No disponible | 5,7 puntos por debajo de v3 en decisiones tipadas, pese a triplicar aproximadamente el tamaño | No disponible | MLX bf16 |
| Jev-Style-Qwen3.5-2B-Decision-GGUF (v1) | 2B | No disponible | Primera versión de la serie; sin cifras comparativas en la información proporcionada | No disponible | GGUF |
| Laya multilingual (checkpoint oficial) | No disponible | Presupuestos por defecto de 512 / 1.024 tokens | 40,1% de macro accuracy en MASSIVE; base de comparación en cinco tareas de decisión, siempre por detrás de v3 | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo generativo de propósito general: su salida es una decisión con probabilidades por opción. La model card no documenta generación de texto libre ni capacidades de chat.
- La calibración depende del fichero `readout_config.json` (temperaturas ajustadas) y del dtype de activación validado de cada build; alterar esos ajustes invalida las garantías de calibración reportadas.
- Discrepancia de idiomas: la metadata declara 19 idiomas, mientras que el texto de la model card afirma evaluación en 51. Conviene verificar la cobertura real por idioma antes de desplegar en producción multilingüe.
- Varias de las cifras destacadas son in-domain (14 locales de MASSIVE, decisiones tipadas), mientras que las de Jev son zero-shot; la comparación no es homogénea en todos los casos.
- La prueba de paridad de 240 filas mide el acuerdo entre formatos (bf16, 8-bit y FP32), no la precisión del modelo; no debe citarse como evidencia de calidad.
- El repositorio no incluye los datos de entrenamiento, la composición del dataset ni el protocolo completo; el autor los remite a la model card principal.
- Riesgo de alucinación: aunque al ser un clasificador no genera texto libre, puede asignar probabilidades altas a opciones incorrectas en dominios alejados de su distribución de entrenamiento. Se recomienda umbral de abstención y validación con datos propios.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Build limitada a MLX: no funciona directamente en CUDA, vLLM, TGI ni Ollama sin reconvertir a otro formato o usar el repositorio PyTorch base.
- Validación comunitaria nula por el momento: 0 descargas y 0 likes en el repositorio, y todos los resultados son autoinformados por el autor.
- Licencia Apache-2.0 para esta build, lo que permite uso comercial; conviene aun así revisar la licencia del modelo base Qwen3.5 y de los artefactos derivados antes de un despliegue en producción.

## Enlaces

- Repositorio MLX en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX
- Model card principal (PyTorch, resultados, protocolos, datos y licencias): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Serie Jev-Style v1 (2B, GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Serie Jev-Style v2 (2B, MLX bf16): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Sitio web del proyecto: https://jevstyle.com
