# OrhanOztas/tuuf-mcp-firewall

## Resumen

Tuuf MCP Firewall es un clasificador de texto especializado en la detección de inyección de prompts (prompt injection) en el tráfico del Model Context Protocol (MCP). Lo desarrolla OrhanOztas y constituye la capa de aprendizaje automático (Layer 2) de un cortafuegos de políticas que se interpone entre un host MCP (Claude Desktop, Claude Code, Cursor, IDEs) y los servidores MCP reales, puntuando resultados de herramientas, recursos y, opcionalmente, definiciones de herramientas. El modelo se ejecuta localmente en CPU, sin acceso a red, lo que lo hace adecuado para entornos con requisitos estrictos de privacidad.

Se trata de un fine-tune de `jhu-clsp/mmBERT-base`, un transformer encoder multilingüe de la familia ModernBERT, con 307.531.778 parámetros totales y una ventana de entrada de hasta 512 tokens por fragmento. La tarea es de clasificación binaria con etiquetas `SAFE` (0) e `INJECTION` (1), y el autor recomienda un umbral de 0,3 sobre la puntuación de `INJECTION`, advirtiendo que umbrales más altos (como 0,9) degradan la exhaustividad.

Su relevancia actual radica en que aborda un vector de ataque específico y creciente: la inyección indirecta de prompts a través de contenido que los agentes consumen desde herramientas y recursos MCP. El modelo se distribuye en formatos PyTorch (safetensors) y ONNX, con una variante cuantizada pensada para `transformers.js`, y se publica bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), fine-tune de `jhu-clsp/mmBERT-base` |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por fragmento; el cortafuegos divide textos largos en ventanas de 1.500 caracteres y conserva la puntuación máxima |
| Tipos de cuantizacion | fp32 (PyTorch y ONNX) e int8 solo en la tabla de embeddings (`model_quantized.onnx`, `ml.dtype: q8`) |
| Idiomas soportados | en, tr, multilingual (entrenamiento principal en inglés y turco, más datos traducidos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32), ONNX (`model.onnx` fp32, `model_quantized.onnx` int8 en embeddings) |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder ModernBERT multilingüe, y se ajusta para clasificación binaria de secuencias (`SAFE` / `INJECTION`). La innovación principal del entrenamiento es la construcción de pares gemelos: cada ejemplo positivo (malicioso) tiene un gemelo benigno en el mismo portador (campo JSON, correo, línea de log, comentario de código), de modo que el modelo debe atender al contenido y no al formato. Esto reduce el riesgo de que el clasificador aprenda atajos superficiales.

El modelo final (B30) es una media en el espacio de pesos ("model soup") de dos fine-tunes: un 70% de `soup04-ab4` (a su vez 60% un fine-tune sobre la mezcla de datos v4 —conjuntos públicos de prompt injection, definiciones y resultados de herramientas MCP con gemelos benignos— y 40% un fine-tune que añade traducciones al turco, instrucciones de tarea y texto de ingeniería de seguridad como negativos difíciles) y un 30% del modelo "raw evilsandangels" (misma mezcla más salidas de herramientas escritas por LLM, 107 eventos reales del cortafuegos etiquetados a mano y el conjunto de gemelos *evilsandangels* con inyección indirecta, envenenamiento de memoria, prompt injection y rug pull, en inglés y turco). Las fuentes de datos incluyen deepset/prompt-injections, InjecAgent, AgentDojo 0.1.35, MCPTox, BIPIA, traducciones con Helsinki-NLP opus-mt y 665 pares generados con DeepSeek.

## Capacidades

- Clasificación binaria de texto para detección de inyección de prompts (`SAFE` frente a `INJECTION`) con puntuaciones probabilísticas.
- Detección de inyección indirecta en resultados de herramientas, recursos y definiciones de herramientas MCP.
- Detección de ataques envueltos (wrapped attacks), ofuscados y envenenamiento de memoria.
- Soporte multilingüe, con entrenamiento principal en inglés y turco y datos traducidos a otros idiomas.
- Ejecución local en CPU sin acceso a red, apta para entornos aislados.
- Integración con `transformers` (pipeline de `text-classification`) y con `@huggingface/transformers` / ONNX en Node.
- Compatible con `text-embeddings-inference` y `endpoints_compatible` según los tags del repositorio.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un clasificador.

## Casos de uso

- Cortafuegos para tráfico MCP: el modelo puntúa cada resultado de herramienta que devuelve un servidor MCP antes de que llegue al host, bloqueando o advirtiendo según la política configurada (`scan.toolResults: block`). Es su uso principal y para el que fue entrenado.
- Protección de agentes de escritorio: integrado en Claude Desktop, Claude Code o Cursor mediante el proxy stdio de Tuuf, evita que contenido malicioso inyectado en una respuesta de herramienta secuestre las instrucciones del agente.
- Escaneo de definiciones de herramientas: con `scan.toolDefinitions` activado, detecta definiciones de herramientas envenenadas en servidores MCP de terceros antes de que el agente las invoque.
- Filtrado de correo y contenido entrante en pipelines LLMail: el modelo se evaluó sobre el conjunto LLMail-Inject, por lo que puede emplearse como capa de cribado en asistentes que procesan correos.
- Auditoría y monitorización de seguridad: al ejecutarse en CPU y sin red, permite clasificar eventos en tiempo real en entornos regulados o air-gapped, registrando puntuaciones para revisión posterior.
- Investigación en seguridad de LLM: sirve como detector de referencia para experimentos de prompt injection, con umbral ajustable y métricas publicadas para comparación.
- Despliegue en el navegador o en el borde: la variante ONNX cuantizada permite ejecutar el clasificador en Node o en el navegador con una huella de memoria reducida (de 2.032 MB a 1.076 MB en Node).

## Benchmarks y rendimiento

Todas las cifras a umbral 0,3 salvo indicación contraria. Detección y falsos positivos en porcentaje.

Conjunto de retención escrito a mano (333 filas, pares mínimos, nunca usado en entrenamiento ni selección de modelo):

| Modelo | Recall | Falsos positivos | AUC | Recall @1% FPR |
|---|---|---|---|---|
| Este modelo (B30) | 95,3 | 12,6 | 0,977 | 69,3 |
| Modelo por defecto anterior (soup04-ab4) | 96,0 | 18,6 | 0,961 | 63,3 |
| protectai/deberta-v3-base-prompt-injection-v2 (baseline) | 60,7 | no disponible | no disponible | no disponible |

Clústeres internos (formato del cortafuegos, ventanas de 1.500 caracteres):

| Conjunto | Detección / falsos positivos |
|---|---|
| Conjunto de test general | 98,5 / 2,7 |
| Red team (ataques envueltos) | 96,5 / 4,9 |
| Ofuscado | 95,3 / 5,7 |
| Multilingüe | 95,8 / 1,4 |
| Benchmark en turco | 91,5 / 7,4 |
| Turco envuelto | 73,3 / 12,1 |
| Test DeepSeek | 92,4 / 6,1 |
| Textos MCP reales (solo falsos positivos) | no disponible / 2,2 |
| Independiente (correos LLMail-Inject + prompts en circulación) | 91,2 / 64,0 |

BIPIA (método de Liu et al. 2026): 23,6% de detección con una tasa de falsos positivos del 1%, en la mitad superior de los detectores de ese trabajo pero lejos de los líderes (95,1%, 57,2%, 37,7%).

## Requisitos de hardware

- VRAM estimada: el modelo tiene unos 307,5 millones de parámetros; en fp32 ocupa aproximadamente 1,2 GB de pesos, y en la variante ONNX con embeddings en int8 la memoria pico medida en Node es de 1.076 MB frente a 2.032 MB en fp32.
- GPU recomendadas: cualquiera con al menos 2 GB de memoria libre; el modelo está pensado para CPU, por lo que no requiere GPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU sin aceleración.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime, `@huggingface/transformers` (transformers.js) en Node, `text-embeddings-inference` y endpoints compatibles.
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput en la información disponible; el autor indica ejecución local en CPU sin red y ventanas de 1.500 caracteres con puntuación máxima.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Recall (held-out) | Falsos positivos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tuuf MCP Firewall (B30) | 307,5 M | 512 tokens | 95,3 | 12,6 | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| soup04-ab4 (versión anterior del mismo autor) | no disponible | 512 tokens | 96,0 | 18,6 | Apache-2.0 | Uso interno del cortafuegos |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible | no disponible | 60,7 | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es un modelo, no una defensa completa: entradas adversariales pueden evadirlo. En el cortafuegos convive con reglas, DLP, fijación de herramientas, seguimiento de contaminación (taint tracking) y sandboxing.
- Sesgo de contenido: los textos que hablan sobre prompt injection (READMEs de seguridad, ficheros de test, mensajes de commit sobre prompts) suelen marcarse como inyección. Los READMEs en turco se marcan más que los ingleses (20,7% frente a 13,3%), en gran parte por frases imperativas dirigidas a un lector humano.
- Los role prompts y system prompts ("Act as...") son instrucciones por diseño y el modelo no puede separarlos de los ataques: la tasa de falsos positivos en el canal de prompts es del 37,5% en el conjunto de retención. El cortafuegos solo advierte por defecto en resultados de `prompts/get`.
- En eventos reales del propio autor, la tasa de falsos positivos a umbral 0,3 sigue siendo del 45%, lo que limita su uso como bloqueo automático en producción sin revisión humana.
- En el conjunto independiente (correos LLMail-Inject y prompts en circulación) la tasa de falsos positivos alcanza el 64,0%, lo que desaconseja su uso directo en ese dominio sin calibración.
- El rendimiento en turco envuelto cae al 73,3% de detección con un 12,1% de falsos positivos, muy por debajo del resto de clústeres.
- La ventana de 512 tokens obliga a fragmentar textos largos; la decisión se toma sobre la puntuación máxima de los fragmentos.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre la robustez frente a ataques dirigidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OrhanOztas/tuuf-mcp-firewall
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Conjunto deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- InjecAgent: https://github.com/uiuc-kang-lab/InjecAgent
- AgentDojo: https://github.com/ethz-spylab/agentdojo
- BIPIA: https://github.com/microsoft/BIPIA
- Helsinki-NLP opus-mt: https://huggingface.co/Helsinki-NLP
- Baseline protectai/deberta-v3-base-prompt-injection-v2: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
