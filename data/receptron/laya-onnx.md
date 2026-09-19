# receptron/laya-onnx

## Resumen

Laya-onnx es la exportación a ONNX del modelo `convaiinnovations/laya`, un modelo de decisión construido sobre un encoder ModernBERT-large (421 M de parámetros) al que se añade una cabeza de decisión específica. Lo publica el usuario `receptron` con el objetivo de poder ejecutar Laya desde Node.js y TypeScript mediante el paquete `@receptron/laya`, o directamente con ONNX Runtime, sin depender de un entorno Python. El repositorio pesa 1,7 GB e incluye el grafo ONNX, los pesos en fp32, el tokenizer y un fichero de configuración con los hiperparámetros de inferencia.

El modelo no es un generador de texto: es un decisor. Recibe una secuencia tokenizada junto con un conjunto de posiciones candidatas (`marker_pos`, `marker_mask`) y un identificador de tipo de consulta (`qtype`), y devuelve `logits` sobre los K marcadores candidatos más `act_probs`, una distribución binaria de probabilidad de actuar. Esto lo sitúa en la categoría de los "modelos de sistema uno" (etiqueta `system-one` de la model card): decisiones rápidas y de baja latencia en lugar de razonamiento encadenado.

Su relevancia práctica es doble. Por un lado, permite integrar un decisor entrenado en RL dentro de aplicaciones web o de escritorio basadas en JavaScript/TypeScript, algo poco habitual en el ecosistema. Por otro, al ser un export ONNX con una diferencia máxima de logits de aproximadamente 1e-5 frente a la referencia en PyTorch, se puede desplegar en CPU o en GPU consumer con un coste de memoria muy contenido. El modelo base es de Convai Innovations y los pesos mantienen la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT-large con cabeza de decisión de Laya |
| Parametros totales | 421 M (checkpoint en inglés, fp32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el valor `max_len` se incluye en `laya_config.json`, pero no se detalla en la información proporcionada) |
| Tipos de cuantizacion | Solo fp32 en este repositorio; no se publican variantes cuantizadas |
| Idiomas soportados | Inglés (checkpoint en inglés según la model card) |
| Licencia | Apache 2.0 en los pesos; MIT en el código de exportación |
| Formato de pesos | ONNX (`laya.onnx` + `laya.onnx.data` con pesos externos); tokenizer en `tokenizer/` |
| Entradas | `input_ids` [B,L] int64, `attention_mask` [B,L] int64, `marker_pos` [B,K] int64, `marker_mask` [B,K] bool, `qtype` [B] int64 |
| Salidas | `logits` [B,K] float32 (sin calibrar; los huecos enmascarados valen -1e4) y `act_probs` [B,2] float32 |
| Tamano del repositorio | 1,7 GB |
| Libreria declarada | onnx / onnxruntime |

## Arquitectura y entrenamiento

La arquitectura combina un encoder ModernBERT-large con una cabeza de decisión propia de Laya. ModernBERT es un transformer encoder con atención optimizada para secuencias largas, y en esta exportación se mantiene como extractor de representaciones sobre la secuencia de entrada. Sobre esa representación, la cabeza consume las posiciones de los marcadores candidatos (`marker_pos`, `marker_mask`) y el tipo de consulta (`qtype`) para producir dos salidas: logits por cada uno de los K marcadores y una probabilidad de acción binaria (`act_probs`). El diseño por marcadores implica que el número de candidatos K puede variar entre llamadas, algo coherente con la noción de "cardinalidad" que aparece en la configuración.

El modelo base fue entrenado por Convai Innovations; la model card de esta exportación indica que el fichero `laya_config.json` recoge las temperaturas por cardinalidad procedentes de `rl_agent_config.json`, lo que apunta a un ajuste mediante aprendizaje por refuerzo sobre el decisor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación destacable de esta publicación concreta es el propio proceso de exportación: el script `export/export_onnx.py` genera un grafo ONNX cuya diferencia máxima de logits frente a la implementación de referencia en PyTorch es de aproximadamente 1e-5, lo que hace viable sustituir la inferencia en Python por ONNX Runtime en producción.

## Capacidades

- Selección de decisiones: dada una secuencia y un conjunto de K marcadores candidatos, produce una puntuación por candidato y una probabilidad binaria de actuar.
- Modelado de tipo de consulta: la entrada `qtype` permite condicionar la decisión según la categoría de la consulta.
- Enmascaramiento de candidatos: `marker_mask` permite excluir marcadores no válidos, que reciben -1e4 en la salida de logits.
- Ejecución multiplataforma vía ONNX Runtime, incluyendo integración directa desde Node.js y TypeScript con el paquete `@receptron/laya`.
- Inferencia en CPU sin acelerador dedicado, al tratarse de un modelo de 421 M de parámetros en fp32.
- Capacidades de generación de texto, razonamiento abierto, código, matemáticas, visión, audio, tool calling y agentes multi-paso: no disponibles. Es un modelo de decisión, no un modelo generativo ni un asistente conversacional.
- Capacidades multilingües: no disponibles; el checkpoint exportado está en inglés.
- Modo "thinking" o razonamiento explícito: no disponible. La etiqueta `system-one` de la model card apunta justo a lo contrario, a decisiones rápidas sin cadena de razonamiento.

## Casos de uso

- Toma de decisiones en juegos por turnos: el modelo encaja en bucles de decisión donde hay que elegir entre un conjunto variable de jugadas candidatas; la entrada `marker_pos`/`marker_mask` se corresponde directamente con la lista de jugadas legales de cada turno.
- Integración en aplicaciones Node.js y TypeScript: mediante `@receptron/laya` se puede cargar el bundle ONNX y ejecutar el decisor dentro de un backend Express, Fastify o Deno, sin necesidad de desplegar un servicio Python aparte.
- Clientes de escritorio o aplicaciones Electron: al estar en ONNX y caber en 1,7 GB de repositorio con pesos fp32, el modelo se puede empaquetar en una app de escritorio y ejecutar en local.
- Inferencia en el navegador con onnxruntime-web: para decisiones sobre estado de juego o de interfaz que no deban salir del dispositivo del usuario.
- Servicio de decisiones de baja latencia en CPU: el tamaño de 421 M de parámetros permite servir múltiples peticiones concurrentes en hardware modesto, siempre que el dominio de decisión sea similar al de entrenamiento.
- Evaluación offline de políticas: comparar las decisiones del decisor exportado con las de la referencia en PyTorch para verificar que la política no se degrada al pasar a producción (la desviación de logits declarada es de ~1e-5).
- Investigación en modelos de "sistema uno": usar la exportación como punto de partida para estudiar decisiones rápidas sin razonamiento explícito, o para hacer fine-tuning del encoder sobre nuevas tareas de decisión.
- Prototipado rápido: gracias a la instalación vía npm y a la descarga automática del bundle en el primer uso, se puede validar una idea de agente decisor en pocas líneas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato cuantitativo de rendimiento declarado en la model card es la fidelidad de la exportación: la diferencia máxima de logits entre el grafo ONNX y la implementación de referencia en PyTorch es de aproximadamente 1e-5. No se proporcionan métricas de precisión sobre tareas, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 1,7 GB, por lo que se puede asumir un consumo del orden de 2 GB incluyendo activaciones y overhead del runtime. No se publican cifras oficiales de VRAM en la información disponible.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria. El modelo es holgadamente ejecutable en RTX 3060, RTX 4060, RTX 4090, A100 o H100; estas dos últimas quedan sobredimensionadas para un modelo de 421 M.
- GPU consumer: sí, cabe sin problemas en prácticamente cualquier GPU consumer moderna e incluso en iGPUs con memoria compartida suficiente.
- CPU: es un caso de uso perfectamente viable. Con pesos fp32 y 421 M de parámetros, ONNX Runtime puede ejecutar el modelo en CPU con latencias de decenas de milisegundos por lote pequeño (estimación orientativa, no confirmada por el autor).
- Opciones de despliegue: ONNX Runtime (nativo, Python o Web), el paquete `@receptron/laya` para Node.js/TypeScript y cualquier runtime compatible con ONNX. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que son servidores de modelos generativos y este modelo no genera texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. El único punto de referencia claro es el propio modelo base del que deriva esta exportación.

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| receptron/laya-onnx | 421 M | no disponible | Logits por marcador + probabilidad de acción | Apache 2.0 (MIT en código de exportación) | HuggingFace, npm |
| convaiinnovations/laya (base) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| ModernBERT-large (arquitectura base) | ~395 M según documentación pública del encoder | no disponible en la información proporcionada | Representaciones de secuencia | Apache 2.0 | HuggingFace |

La comparación con otros decisores entrenados por RL no es posible con los datos disponibles, ya que no se publican métricas comunes ni alternativas equivalentes en el mismo formato y licencia.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, código ni respuestas conversacionales. Cualquier caso de uso que espere generación de lenguaje está fuera de su alcance.
- Alcance de dominio limitado: al tratarse de un decisor entrenado para un espacio de marcadores concreto, su utilidad fuera del dominio de decisión original no está garantizada y probablemente requiera fine-tuning.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de decisiones incorrectas o mal calibradas en estados de entrada fuera de la distribución de entrenamiento.
- Idiomas: el checkpoint exportado está en inglés, lo que limita su uso con entradas en otros idiomas sin un tokenizer y un ajuste adecuados.
- Calibración de salidas: la propia model card advierte de que los `logits` están sin calibrar. La calibración por cardinalidad se aplica a través de las temperaturas almacenadas en `laya_config.json`, por lo que ignorar ese fichero altera el comportamiento del decisor.
- Restricciones de licencia: los pesos son Apache 2.0, lo que permite uso comercial, pero el código de exportación del repositorio de receptron es MIT; conviene verificar ambas licencias por separado al redistribuir.
- Repositorio sin adopción: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validación comunitaria y de reportes de errores.
- Longitud de contexto desconocida: aunque `laya_config.json` expone `max_len` y `head_max_len`, no se publican sus valores en la información disponible, lo que impide planificar entradas largas sin consultar el fichero.
- Dependencia de un contrato de entrada estricto: el grafo espera exactamente los cinco tensores documentados (`input_ids`, `attention_mask`, `marker_pos`, `marker_mask`, `qtype`) con los tipos indicados; cualquier desviación requiere reexportar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/receptron/laya-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de código (exportación y cliente): https://github.com/receptron/laya
- Script de exportación: https://github.com/receptron/laya/blob/main/export/export_onnx.py
- Paquete npm: https://www.npmjs.com/package/@receptron/laya
- Búsqueda web: no se han encontrado enlaces relevantes al modelo en los resultados proporcionados (los resultados devueltos corresponden a páginas de Facebook y no guardan relación con este modelo).
