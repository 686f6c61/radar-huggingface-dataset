# DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP

## Resumen

Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP es un fine-tune de 9.650 millones de parámetros sobre la base Qwen3.5-9B, desarrollado por DavidAU en colaboración con Nightmedia. Se trata de un modelo de propósito general orientado a razonamiento, generación de código, escritura creativa y roleplay, con un énfasis especial en la eliminación de restricciones de contenido (uncensored) mediante técnicas de abliteración y entrenamiento posterior denominado "Heretic". El modelo se distribuye bajo licencia Apache 2.0 y soporta una ventana de contexto de 256.000 tokens.

La versión "DARK ROAST" aplica un des-censurado más agresivo que el modelo original "Uncensored-Heretic", manteniendo según el autor un rendimiento comparable o superior en los benchmarks publicados. El modelo incluye soporte de visión mediante un archivo mmproj separado, y está disponible en formatos safetensors (bfloat16) y GGUF con cuantizaciones NEO IMATRIX, incluyendo variantes con predicción multi-token (MTP) para acelerar la inferencia. Su relevancia actual radica en ofrecer un rendimiento cercano a modelos de 27B en tareas de razonamiento, con un tamaño que permite su ejecución en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | bf16 (safetensors), GGUF NEO IMATRIX (Q4_K_S, Q8_0, mxfp8, mxfp4, entre otros) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), GGUF (regular y MTP) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer densa de Qwen3.5-9B, sin mezcla de expertos. El entrenamiento consistió en un proceso multi-etapa y multi-modelo: se combinaron varios fine-tunes previos de DavidAU sobre Qwen3.5-9B mediante merges, seguidos de un ajuste adicional orientado a elevar la inteligencia general y el seguimiento de instrucciones. Posteriormente se aplicó una etapa de "abliteration" para eliminar las negativas y rechazos de contenido, y un entrenamiento "Heretic" que refuerza la obediencia sin cuestionamientos. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El autor indica que el bloque de razonamiento ("thinking") fue compactado y reforzado.

Las cuantizaciones GGUF utilizan la técnica NEO IMATRIX, que mejora la precisión de los cuantizados entre un 2% y un 4% respecto a GGUF estándar, especialmente en contextos largos. Además, el tensor de salida se mantiene en precisión completa (16 bits) en todos los cuantizados. Las variantes MTP (multi-token prediction) emplean tensores MTP en Q8_0 y permiten predecir dos tokens por paso, acelerando la generación cuando la tasa de aceptación supera el 50%.

## Capacidades

- Generacion de texto y razonamiento: soporta modo "thinking" (razonamiento extendido) y modo "instruct" (respuesta directa), con configuraciones de temperatura recomendadas distintas para cada caso.
- Generacion de codigo: el autor lo posiciona como modelo "coder", con configuraciones de muestreo optimizadas para tareas de desarrollo web y programacion precisa.
- Escritura creativa y ficcion: entrenado especificamente para narrativa, escritura de ficcion y roleplay, con capacidad de mantener personajes y tramas coherentes.
- Roleplay y conversacion: apto para interacciones multi-turno con contexto largo gracias a los 256k tokens de ventana.
- Vision: soporta entrada de imagenes mediante el archivo mmproj separado, permitiendo tareas de imagen-a-texto.
- Des-censurado total: el modelo no rechaza peticiones de contenido explicito, violento o controvertido, dentro de los limites tecnicos del propio modelo.
- Prediccion multi-token (MTP): las variantes GGUF MTP aceleran la inferencia al predecir dos tokens simultaneamente, con tasas de aceptacion superiores al 50% en tareas estandar.

## Casos de uso

- Atencion al cliente automatizada: con 256k tokens de contexto, puede gestionar conversaciones largas y recordar informacion de interacciones previas, manteniendo un tono consistente y sin restricciones tematicas.
- Generacion de codigo en produccion: soporta configuraciones de temperatura bajas (0.6) para tareas de desarrollo web y programacion, y puede integrarse en pipelines CI/CD mediante servidores de inferencia compatibles con OpenAI API.
- Escritura creativa y narrativa: ideal para generar ficcion, guiones o novelas, con capacidad de mantener arcos argumentales complejos a lo largo de capitulos o escenas.
- Roleplay y juegos de texto: permite crear personajes con personalidades definidas y responder a acciones del usuario sin censura, util para juegos de rol o simulaciones interactivas.
- Analisis de documentos con vision: al combinar el modelo con el archivo mmproj, puede extraer informacion de imagenes, diagramas o capturas de pantalla, y razonar sobre su contenido.
- Asistente de investigacion local: ejecutable en hardware de consumo, permite consultas de razonamiento complejo sobre documentos largos (articulos, informes) sin depender de servicios en la nube.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor, correspondientes al modelo base "Uncensored-Heretic" (sin la variante DARK ROAST). El autor afirma que la version DARK ROAST supera los 7 benchmarks criticos de Qwen 3.5 9B, Qwen3.5 27B y Qwen3.6 35B-A3B, pero no se han publicado los numeros exactos para esta variante.

| Modelo | ARC-C | ARC-E | BoolQ | HSWAG | OBQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (bf16) | 0.649 | 0.832 | 0.895 | 0.713 | 0.482 | 0.783 | 0.699 |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (mxfp8) | 0.647 | 0.836 | 0.895 | 0.706 | 0.460 | 0.784 | 0.695 |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (mxfp4) | 0.640 | 0.824 | 0.886 | 0.703 | 0.468 | 0.780 | 0.691 |
| Qwen3.5-9B-Instruct (mxfp8, base) | 0.571 | 0.719 | 0.895 | 0.683 | 0.426 | 0.770 | 0.671 |
| Qwen3.6-27B-Instruct (mxfp8, base) | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.6-35B-A3B-Instruct (mxfp8, base) | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |
| Qwen3.5-27B-Instruct (mxfp8, base) | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |

Nota: los valores corresponden a evaluaciones en modo "instruct" segun el autor. En modo "thinking" los resultados pueden ser superiores.

## Requisitos de hardware

- VRAM estimada: para cuantizacion Q4_K_S (4 bits) se requieren aproximadamente 6-7 GB de VRAM; para Q8_0 (8 bits) unos 10-11 GB. La version bf16 completa necesita unos 19-20 GB.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 (usada en las pruebas del autor), o GPUs de datacenter como A10, A100 o H100 para inferencia a mayor velocidad.
- Compatibilidad con GPU de consumo: si, el modelo en cuantizaciones 4 y 8 bits cabe en GPUs consumer de 8-12 GB, aunque para contextos largos se recomienda al menos 16 GB.
- Opciones de despliegue: compatible con llama.cpp, LM Studio, vLLM, TGI y cualquier framework que soporte GGUF o safetensors con arquitectura Qwen3.5.
- Latencia y throughput: en una RTX 5090 con Windows 11 y LM Studio, el autor reporta ~130 tokens/s con GGUF Q4_K_S regular, y hasta 185 tokens/s con variantes MTP (con tasa de aceptacion del 60% y prediccion de 2 tokens). En Linux o macOS las velocidades pueden ser mayores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Puntos fuertes |
|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST (este modelo) | 9,65B | 256k | Apache 2.0 | Des-censurado, razonamiento, vision, MTP |
| Qwen3.5-9B-Instruct (base) | 9,65B | 256k | Apache 2.0 | Modelo oficial, mas estable, sin des-censurar |
| Qwen3.6-27B-Instruct (base) | 27B | 256k | Apache 2.0 | Mayor capacidad bruta, mejor en HSWAG y WinoGrande |
| Qwen3.6-35B-A3B (MoE) | 35B total, 3B activos | 256k | Apache 2.0 | Eficiencia MoE, buen equilibrio rendimiento/recursos |

El modelo supera al Qwen3.5-9B-Instruct base en todos los benchmarks publicados, y en algunos casos iguala o supera a modelos de 27B (ARC-C, ARC-E, OBQA). Sin embargo, queda por detras del Qwen3.6-27B en tareas como HSWAG y WinoGrande. La principal ventaja frente a las alternativas es su naturaleza des-censurada y la disponibilidad de cuantizaciones MTP para acelerar la inferencia.

## Limitaciones y advertencias

- El modelo esta des-censurado: puede generar contenido explicito, violento, ofensivo o ilegal. El usuario es responsable del uso que haga de el, y puede haber riesgos legales o eticos en determinados contextos.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconoce la cobertura de dominios especificos o posibles sesgos.
- Al ser un fine-tune no oficial de Qwen, puede presentar degradaciones en tareas que el modelo base maneja bien, especialmente en idiomas distintos de ingles y chino.
- La ventana de 256k tokens puede degradar el rendimiento en contextos muy largos, aunque las cuantizaciones NEO IMATRIX mitigan parcialmente este efecto.
- Las variantes MTP requieren una tasa de aceptacion superior al 50% para ser mas rapidas que las regulares; en tareas creativas o con temperaturas altas (>1.0) el rendimiento puede empeorar.
- El autor recomienda mantener la temperatura <=1.0 y repetition penalty=1.0 para MTP, lo que limita la exploracion creativa en esos modos.
- No se garantiza la ausencia de alucinaciones, especialmente en tareas de hechos o informacion actualizada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede incluir contenido protegido por derechos de autor en sus salidas, lo que requiere evaluacion legal por parte del usuario.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Repositorio GGUF (regular y MTP): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo sin variante DARK ROAST: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Discusiones del modelo: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP/discussions/1
- Articulo de terceros sobre el modelo GGUF: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf-davidau
