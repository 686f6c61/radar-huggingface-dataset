# bastionsoft/bastion-prompt-protection-v3-ettin-32m

## Resumen

Bastion Prompt Protection v3 (Ettin-32m) es un clasificador de texto de 32 millones de parámetros desarrollado por Bastion Soft, especializado en la detección de inyección de prompts directa e indirecta. La inyección indirecta es aquella en la que las instrucciones maliciosas se ocultan en documentos, páginas web, correos electrónicos o salidas de herramientas que un agente LLM lee durante su ejecución. El modelo se presenta como una versión preliminar (preview) de la familia v3, entrenada sobre un corpus reconstruido para que la etiqueta dependa del mecanismo de inyección y no de la fuente, longitud, formato o fraseo del texto.

El modelo parte del backbone encoder `jhu-clsp/ettin-encoder-32m` de tipo ModernBERT, lo que le permite procesar ventanas de hasta 2.048 tokens con una arquitectura eficiente en cómputo. Su tamaño reducido lo hace apto para despliegue en entornos con recursos limitados, incluyendo inferencia en CPU mediante ONNX o en GPUs de consumo. Está pensado como componente de guardarraíles (guardrails) en pipelines de agentes y aplicaciones RAG, donde debe evaluar contenido no confiable antes de que llegue al modelo generativo.

La relevancia actual del modelo radica en que la inyección indirecta se ha convertido en un vector de ataque crítico para sistemas agénticos que leen correo, navegan por la web o invocan herramientas. Este checkpoint, publicado en noviembre de 2026, es un lanzamiento de evaluación y no la versión final de v3; el autor advierte que el modelo definitivo, el backbone y la receta de entrenamiento se decidirán tras la comparación con mmBERT-small y podrían reemplazar este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, backbone Ettin-32m) |
| Parametros totales | 32.031.746 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens por ventana; documentos largos mediante ventanas con stride 1.024 |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; no se detallan cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | AGPL-3.0-or-later |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde `jhu-clsp/ettin-encoder-32m` y adaptado como clasificador de secuencias con dos etiquetas (benigno / ataque). La arquitectura ModernBERT incorpora atención con rotación posicional (RoPE) y sesgos de atención alternados, lo que permite contextos de 2.048 tokens con un coste computacional contenido para un modelo de 32M de parámetros. El entrenamiento se realizó sobre el corpus Bastion v3, reconstruido específicamente para que la etiqueta siga al mecanismo de inyección y no a la fuente, longitud, formato o fraseo del texto, evitando así atajos espurios. La model card indica que los datos de entrenamiento eliminan deliberadamente filas de contenido dañino o intención de jailbreak sin mecanismo de inyección.

El checkpoint corresponde a una única ejecución de entrenamiento (semilla 43) y se publica como preview para evaluación. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos figuran como no disponibles. El modelo incluye un archivo `temperature.json` con un valor de calibración de temperatura que debe aplicarse a los logits antes del softmax para obtener probabilidades calibradas. Para documentos de más de 2.048 tokens se indica dividir en ventanas de 2.048 con stride de 1.024 y puntuar el documento por la ventana de mayor puntuación (smooth max, temperatura 0.1 en la evaluación).

## Capacidades

- Clasificación binaria de inyección de prompts: devuelve una probabilidad de ataque calibrada mediante temperatura, con umbral recomendado de 0.5.
- Detección de inyección indirecta en contenido que lee un agente: documentos recuperados, páginas web, correos electrónicos, resultados de herramientas y API, y archivos.
- Detección de inyección directa en prompts de usuario: anulaciones de instrucciones, tokens falsos de sistema o delimitadores, y payloads ofuscados.
- Procesamiento de documentos largos mediante ventanas de 2.048 tokens con stride de 1.024 y agregación por máximo.
- Robustez en formatos estructurados: YAML, JSON, XML, logs, Markdown y HTML, con AUC ≥ 0.99 por formato y cero picos de falsos positivos en texto benigno.
- Soporte de inferencia en CPU y GPU mediante ONNX y transformers; compatible con text-embeddings-inference y endpoints.
- Capacidad multilingüe limitada: aunque el idioma declarado es inglés, la evaluación reporta AUC de 0.995 en BrowseSafe++ multilingüe.
- No cubre clasificación de contenido dañino ni intención de jailbreak sin mecanismo de inyección; esos casos están fuera de alcance por diseño.

## Casos de uso

- Filtrado de documentos en pipelines RAG: antes de insertar fragmentos recuperados en el contexto del LLM, el modelo puntúa cada fragmento y bloquea aquellos con probabilidad de ataque superior a 0.5. Su ventana de 2.048 tokens y la agregación por ventanas permiten cubrir documentos largos con coste bajo.
- Protección de agentes que leen correo electrónico: el modelo evalúa el cuerpo y los encabezados de correos entrantes para detectar instrucciones ocultas dirigidas al agente, con un AUC de 0.902 en el conjunto LLMail-Inject held-out.
- Saneamiento de salidas de herramientas y API: en un agente que invoca APIs externas, el modelo inspecciona las respuestas antes de incorporarlas al razonamiento, cubriendo el vector de inyección cross-step donde obtiene el mejor AUC de su categoría (0.897).
- Moderación de prompts de usuario en aplicaciones de chat: detecta anulaciones de instrucciones y tokens falsos de sistema en la entrada del usuario, con AUC de 0.905 en el promedio directo y FPR de 2.3% en WildChat y 3.8% en LMSYS.
- Guardarraíl en navegación web automatizada: puntúa el contenido de páginas antes de que el agente lo procese, con AUC de 0.997 en BrowseSafe++ en inglés y 0.995 en la variante multilingüe.
- Evaluación de seguridad en CI/CD: integrado como test de regresión que verifica que los prompts y documentos de prueba del equipo siguen clasificándose correctamente tras cambios en el sistema, gracias a su reducido tamaño y a la disponibilidad de pesos ONNX para ejecución en CPU.
- Despliegue en entornos con recursos limitados: al tener 32M de parámetros y un repositorio de 0.3 GB, puede ejecutarse en CPU o en GPUs de consumo, lo que facilita su uso como filtro previo en arquitecturas de dos etapas junto a modelos de guardarraíl más grandes.

## Benchmarks y rendimiento

Resultados del checkpoint en la suite congelada Bastion v3 (31 conjuntos, retenidos del entrenamiento mediante índice de exclusión, con puntuación a nivel de documento):

| Metrica | Este modelo | Baseline v1.10 |
|---|---|---|
| AUC medio inyección indirecta (BIPIA, BrowseSafe++, InjecAgent-enh, LLMail held-out, Z-Edgar) | 0.886 | 0.872 |
| BrowseSafe++ TPR @ 1% FPR | 0.960 | 0.135 |
| AUC medio cross-step agéntico (AgentDojo, InjecAgent, ASB) | 0.898 | 0.832 |
| AUC medio inyección directa (rogue, xTRam1, S-Labs, deepset) | 0.905 | 0.957 |
| AUC BrowseSafe-bench | 0.791 | 0.868 |

Resultados por conjunto:

| Conjunto | AUC | Recall @0.5 | FPR @0.5 |
|---|---|---|---|
| BrowseSafe++ (en) | 0.997 | 0.982 | 0.030 |
| BrowseSafe++ (multilingual) | 0.995 | 0.958 | 0.012 |
| BIPIA | 0.960 | 0.575 | 0.020 |
| LLMail-Inject held-out | 0.902 | 0.704 | 0.092 |
| Z-Edgar | 0.907 | 0.520 | 0.022 |
| BrowseSafe-bench | 0.791 | 0.596 | 0.147 |
| InjecAgent (enhanced) | 0.661 | 0.025 | 0.000 |
| AgentDojo (multi-turn) | 0.998 | 1.000 | 0.132 |
| InjecAgent (multi-turn) | 1.000 | 0.985 | 0.003 |
| ASB (multi-turn) | 0.696 | 0.033 | 0.003 |
| S-Labs | 0.992 | 0.851 | 0.005 |
| xTRam1 | 0.991 | 0.872 | 0.005 |
| jackhhao | 0.934 | 0.305 | 0.012 |
| rogue | 0.906 | 0.617 | 0.055 |
| TrustAIRLab | 0.821 | 0.347 | 0.101 |
| deepset | 0.731 | 0.383 | 0.036 |

Resultados en pi-detector-bench (revisión 2026-11, 13 detectores, softmax crudo con umbral 0.5):

| Eje | Este modelo | Rango | Mejor otro detector |
|---|---|---|---|
| AUC medio directo (rogue, xTRam1, S-Labs) | 0.963 | 5 | 0.993 (bastion v1 70M) |
| F1 medio directo @0.5 | 0.858 | 5 | 0.937 (bastion v1 70M) |
| FPR en chat real @0.5 (WildChat, LMSYS) | 3.05% | 3 | 0.77% (prompt-guard v2 22M, recall 16%) |
| FPR en chat real al 95% de detección | 31.2% | 3 | 7.8% (bastion v1 70M) |
| AUC medio indirecto/estructurado (6 conjuntos) | 0.855 | 2 (empatado) | 0.945 (bastion v1 70M) |
| AUC inyección cross-step agéntica | 0.897 | 1 | 0.859 (wolf-defender 0.3B) |
| FPR / recall cross-step @0.5 | 4.6% / 67.2% | — | — |
| AUC jailbreak multi-turno (MHJ) | 0.726 | 6 | 0.865 (bastion v1 70M) |

Datos adicionales de la model card: en documentos benignos de 64k tokens, el 0.8% se marca como ataque con umbral 0.5; las inyecciones plantadas a profundidades de 2k a 64k tokens alcanzan AUC de 0.971. En texto benigno con vocabulario de inyección (NotInject), la tasa de sobredetección es de 2.7% / 3.5% / 8.8% con 1/2/3 palabras disparadoras; en el conjunto hard-benign externo, 1.2%; en WildJailbreak benign, 2.9%; en PIDS hard-benign, 10.4%.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 32M de parámetros (aproximadamente 128 MB de pesos), más el overhead de activaciones para secuencias de 2.048 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema. El modelo es lo bastante pequeño para ejecutarse en CPU con latencias aceptables.
- Cabe en cualquier GPU de consumo, incluidas las integradas con suficiente memoria compartida, y en Raspberry Pi mediante ONNX cuantizado.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, text-embeddings-inference, y endpoints compatibles. La model card no menciona soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño reducido sugiere latencias de milisegundos por ventana en GPU y decenas de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUC indirecto | AUC directo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bastion Prompt Protection v3 Ettin-32m | 32M | 2.048 | 0.886 (suite Bastion) | 0.905 (suite Bastion) | AGPL-3.0 | Hugging Face |
| Bastion Prompt Protection v1 70M | 70M | no disponible | 0.945 (pi-detector-bench) | 0.993 (pi-detector-bench) | no disponible | Hugging Face |
| prompt-guard v2 22M | 22M | no disponible | 0.862 en BIPIA (segundo de 13) | no disponible | no disponible | Hugging Face |
| wolf-defender 0.3B | 300M | no disponible | 0.859 en cross-step | no disponible | no disponible | Hugging Face |

El modelo se posiciona como la opción más fuerte en inyección cross-step agéntica de pi-detector-bench (AUC 0.897, primer puesto), pero queda por detrás de su propio predecesor v1 70M en inyección directa, en FPR al 95% de detección y en jailbreak multi-turno. Frente a prompt-guard v2 22M, ofrece mejor equilibrio entre recall y falsos positivos en chat real, aunque prompt-guard logra un FPR menor a costa de un recall del 16%.

## Limitaciones y advertencias

- Es un checkpoint preview de una única ejecución (semilla 43); el modelo final de v3 puede cambiar de backbone y de receta de entrenamiento tras la comparación con mmBERT-small.
- Para filtrado de inyección directa en producción, el autor recomienda los modelos v1, que obtienen AUC de 0.957 frente a 0.905 de este checkpoint en el promedio directo.
- El rendimiento en InjecAgent enhanced es bajo (AUC 0.661, recall 0.025 con umbral 0.5), lo que limita su uso como único filtro en ese tipo de ataques.
- El FPR en chat real al 95% de detección es del 31.2%, muy superior al 7.8% del modelo v1 70M; en despliegues con umbrales altos de recall puede generar ruido considerable.
- La tasa de sobredetección en texto benigno con vocabulario de inyección llega al 8.8% con tres palabras disparadoras y al 10.4% en PIDS hard-benign.
- El modelo está entrenado y declarado para inglés; el soporte multilingüe observado en BrowseSafe++ no está garantizado para otros idiomas y no se documenta su comportamiento fuera del inglés.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en textos ambiguos o con solapamiento léxico con ataques.
- La licencia AGPL-3.0-or-later impone obligaciones de copyleft sobre el código que lo integre y sobre posibles modificaciones; debe revisarse antes de uso comercial en productos propietarios.
- La model card no documenta sesgos demográficos ni de dominio; no hay datos sobre comportamiento en dominios especializados (legal, médico, financiero).
- El modelo no clasifica contenido dañino ni intención de jailbreak sin mecanismo de inyección; no debe usarse como sustituto de un moderador de contenido general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bastionsoft/bastion-prompt-protection-v3-ettin-32m
- Repositorio de código: https://github.com/bastion-soft/bastion-prompt-protection
- Benchmark pi-detector-bench: https://github.com/bastion-soft/pi-detector-bench
- Modelo base Ettin-32m: https://huggingface.co/jhu-clsp/ettin-encoder-32m
