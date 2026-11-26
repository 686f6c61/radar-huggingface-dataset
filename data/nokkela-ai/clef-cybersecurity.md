# nokkela-ai/clef-cybersecurity

## Resumen

clef-cybersecurity es un detector de prompt injection y exfiltración de datos para textos en inglés y alemán, publicado por nokkela-ai como fork independiente del modelo original de TextCortex. Se construye como un ajuste fino de parámetros completos sobre Cloudflare/clef-flash, un modelo base de aproximadamente 9.53B parámetros, y conserva la cabeza de esquema nativa de CLEF para devolver una puntuación de ataque sin generar texto. El paquete distribuido contiene únicamente los parámetros modificados (unos 2.20 GB en `adapter.safetensors`), no un modelo autónomo.

El modelo aborda un problema concreto de seguridad en despliegues de LLM: la detección de instrucciones maliciosas embebidas en contenido no confiable, como PDFs extraídos, documentos de base de conocimiento, descripciones de herramientas MCP, skills de agentes y contexto de peticiones web. Su relevancia radica en que ofrece una puntuación de riesgo calibrada por temperatura sobre texto de entrada, lo que permite integrarlo como filtro previo en pipelines de agentes y sistemas RAG sin necesidad de un segundo LLM generativo.

La arquitectura subyacente es la de CLEF (Cloudflare), un encoder con cabeza de clasificación por esquema; el modelo se distribuye con licencia Apache 2.0, soporta inglés y alemán, y requiere código de inferencia personalizado, ya que no está configurado para `pipeline()` ni `AutoModel.from_pretrained()` estándar del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLEF (encoder de Cloudflare/clef-flash) con cabeza de clasificación por esquema; ajuste fino de parámetros completos de capas seleccionadas |
| Parametros totales | ~9.53B (modelo base CLEF requerido en inferencia); el adaptador distribuido contiene ~2.20 GB de parámetros modificados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter.safetensors`), con código de carga Python independiente y configuración de inferencia exacta |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (no LoRA) sobre capas seleccionadas del checkpoint público Cloudflare/clef-flash, fijado en la revisión `17f0b0ad64efb65d273590632833508766b2aae6`. Se conserva la cabeza de esquema nativa de CLEF, que produce una puntuación de ataque en lugar de texto generado. El checkpoint publicado corresponde a la época 3 de una ejecución de cuatro épocas, seleccionada mediante un split de validación separado y sin usar los resultados de benchmark reportados para la selección. La inferencia incorpora calibración de temperatura ajustada en validación.

Los datos de entrenamiento no se detallan en la información disponible: no se especifica el número de tokens, la composición del dataset ni si hubo RLHF o DPO (en un clasificador de este tipo no sería el mecanismo habitual). El modelo base TextCortex/clef-cybersecurity se indica como referencia de linaje, y el paquete no distribuye documentos de clientes, ejemplos de entrenamiento ni registros individuales de evaluación.

## Capacidades

- Clasificación de prompt injection en texto no confiable, con salida de puntuación de ataque continua.
- Detección de exfiltración de datos en contenido de entrada.
- Procesamiento de texto extraído de PDFs y documentos de base de conocimiento.
- Evaluación de descripciones de herramientas MCP y de skills de agentes personalizados.
- Análisis de contexto de peticiones web y prompts de agentes personalizados.
- Soporte bilingüe inglés-alemán.
- No genera texto: es un clasificador, no un modelo generativo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, al no ser un modelo de propósito generativo.

## Casos de uso

- Filtro previo en pipelines RAG: puntuar cada fragmento recuperado de una base de conocimiento antes de insertarlo en el contexto del LLM, bloqueando documentos con inyecciones embebidas; el modelo está entrenado específicamente sobre texto extraído de PDFs y documentos.
- Protección de agentes con herramientas MCP: evaluar las descripciones de herramientas y el contexto de peticiones web antes de que el agente las consuma, evitando que un servidor MCP malicioso inyecte instrucciones.
- Moderación de entradas de usuario en aplicaciones multilingües: aplicar el detector a prompts de usuario en inglés y alemán para bloquear intentos de jailbreak o secuestro de instrucciones antes de llegar al modelo principal.
- Auditoría de skills de agentes personalizados: clasificar el contenido de skills y prompts de agentes antes de desplegarlos, detectando instrucciones ocultas o intentos de exfiltración.
- Defensa en profundidad en plataformas de atención al cliente: combinar el detector con el LLM conversacional para marcar conversaciones sospechosas y derivarlas a revisión humana.
- Monitorización de ingesta documental: procesar lotes de documentos entrantes (facturas, contratos, informes) y generar alertas cuando la puntuación de ataque supere el umbral configurado, con calibración de temperatura para ajustar falsos positivos.
- Evaluación de seguridad de terceros: analizar el texto de integraciones y APIs externas antes de incorporarlas a un flujo de agentes.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados, `verified: false`), sobre conjuntos de regresión internos previamente inspeccionados:

| Métrica | clef-cybersecurity | CLEF Flash (base) | Jev | Laya R2a |
|---|---:|---:|---:|---:|
| Full English (n=510) AUROC | 0.9925 | 0.9588 | 0.9800 | 0.9155 |
| Full German (n=510) AUROC | 0.9744 | 0.9391 | 0.9564 | 0.8780 |
| English skills (n=48) AUROC | 1.0000 | 0.9762 | 0.9841 | 0.9277 |
| German skills (n=48) AUROC | 0.9171 | 0.9048 | 0.9603 | 0.9330 |
| PDF documents (n=730) AUROC | 0.9856 | 0.8144 | 0.9785 | 0.8856 |
| PDF attacks caught / 107 | 84 | 6 | 73 | 81 |
| Clean PDF false alarms / 623 ↓ | 3 | 0 | 2 | 0 |
| Umbral de decisión (estricto >) | 0.5 | 0.5 | 0.5 | 0.95 |

Los conjuntos completos de inglés y alemán contienen 510 casos cada uno (256 ataques y 254 limpios); los subconjuntos de skills tienen 48 casos cada uno (27 ataques y 21 limpios), por lo que sus estimaciones son especialmente inciertas. La cohorte PDF emparejada contiene 107 extractos atacados y 623 documentos limpios, y evalúa texto extraído, no el parseo de PDF ni la robustez ante imágenes u OCR. Los umbrales difieren entre modelos (Laya R2a usa >0.95), y el modelo ajustado aplica calibración de temperatura, por lo que umbrales numéricos idénticos no implican tasas de falsos positivos iguales. En el umbral predeclarado >0.95, el checkpoint detecta 69/107 ataques PDF y marca 2/623 documentos limpios.

## Requisitos de hardware

- El adaptador distribuido ocupa ~2.20 GB, pero la inferencia requiere cargar el modelo base CLEF completo de ~9.53B parámetros, que el loader descarga automáticamente.
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9.53B parámetros en fp16 se necesitarían del orden de 19 GB solo para pesos, más overhead, aunque no se confirma en la documentación.
- GPU recomendadas: no disponibles; por tamaño del base, serían necesarias GPU de clase A100/H100 o equivalentes con suficiente VRAM, sin confirmación oficial.
- Viabilidad en GPU de consumo: no disponible; no se documenta ninguna cuantización compatible.
- Opciones de despliegue: carga mediante el loader Python independiente incluido; no compatible con `pipeline()` ni `AutoModel.from_pretrained()` estándar del adaptador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUROC EN (n=510) | AUROC DE (n=510) | AUROC PDF | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| clef-cybersecurity | ~9.53B base | no disponible | 0.9925 | 0.9744 | 0.9856 | Apache 2.0 | Hugging Face (fork nokkela-ai) |
| CLEF Flash (base) | ~9.53B | no disponible | 0.9588 | 0.9391 | 0.8144 | no disponible en la información | Hugging Face (Cloudflare) |
| Jev | no disponible | no disponible | 0.9800 | 0.9564 | 0.9785 | no disponible | Evaluación alojada |
| Laya R2a | no disponible | no disponible | 0.9155 | 0.8780 | 0.8856 | no disponible | Checkpoint guardado por el autor |

La comparación es de sistemas detectores con encoders nativos y protocolos de ventana distintos, no una ablación arquitectónica controlada. En skills en alemán, clef-cybersecurity (0.9171) queda por debajo de Jev (0.9603) y Laya R2a (0.9330), debilidad reconocida por el autor.

## Limitaciones y advertencias

- Debilidad en skills en alemán: 0.9171 AUROC, por debajo de Jev y Laya R2a, según el propio autor.
- Los benchmarks son conjuntos de regresión internos previamente inspeccionados, no un leaderboard público ni una prueba ciega de generalización; los resultados están marcados como no verificados.
- Los subconjuntos de skills (48 casos) tienen alta incertidumbre estadística.
- La evaluación PDF usa texto extraído; no cubre parseo de PDF, imágenes ni robustez OCR.
- No es un modelo autónomo: requiere el base CLEF de ~9.53B y código de inferencia personalizado; no funciona con `pipeline()` estándar.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; la calibración de temperatura afecta a los umbrales operativos.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de idioma: solo inglés y alemán.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base CLEF debe verificarse por separado.
- Es un fork independiente de nokkela-ai; la responsabilidad de mantenimiento y soporte recae en el fork, no en TextCortex.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/clef-cybersecurity
- Modelo original: https://huggingface.co/TextCortex/clef-cybersecurity
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
