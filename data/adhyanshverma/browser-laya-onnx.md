# AdhyanshVerma/browser-laya-onnx

## Resumen

Laya Browser Decision Head (Ultra-Edge INT8 ONNX) es un modelo de clasificación de texto derivado de ModernBERT, publicado por Adhyansh Verma, que actúa como la "cabeza de decisión" (System-1 Decision Head) de un agente de navegador web. Su función es mapear el estado del DOM de una página y el contexto de la tarea hacia un espacio discreto de acciones de navegación: `CLICK`, `TYPE_TEXT`, `SELECT`, `SCROLL_DOWN`, `SCROLL_UP`, `WAIT` y `DONE`. Forma parte del motor de navegador anti-detección Pooki-Pra, diseñado para integrarse con Camoufox.

El modelo se distribuye exclusivamente en formato ONNX con cuantización dinámica INT8 simétrica, lo que reduce el peso desde 1,28 GB en FP32 hasta 310,1 MB. Está pensado para ejecución en CPU sin GPU, con latencias declaradas por debajo de 45 ms en x86_64, portátiles y dispositivos ARM de borde. El repositorio ocupa 0,4 GB e incluye el tokenizador con un vocabulario de 256.000 tokens.

Su relevancia radica en el nicho: agentes de navegación que necesitan inferencia local de baja latencia en el propio navegador o en el dispositivo del usuario, sin depender de servicios en la nube. La licencia MIT y el soporte de ONNX Runtime facilitan su integración en pipelines de automatización web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (sequence classification sin padding) con cabeza de decisión para acciones de navegador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (secuencia dinámica según `input_ids` y `attention_mask`) |
| Tipos de cuantizacion | INT8 dinámica simétrica (`QuantType.QInt8`) sobre ONNX; modelo base FP32 de 1,28 GB |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` / `model_int8.onnx`, 310 MB) |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura transformer encoder con atención sin padding (unpadded) y soporte de secuencias largas, adaptada aquí como clasificador de secuencias sobre un espacio de acciones de navegador. La cabeza de decisión se mapea mediante un fichero `rl_agent_config.json` que define las acciones disponibles del agente (`CLICK`, `TYPE_TEXT`, `SELECT`, `SCROLL_DOWN`, `SCROLL_UP`, `WAIT`, `DONE`). La inferencia acepta entradas adicionales más allá de los tokens: `marker_pos`, `marker_mask` y `qtype`, lo que sugiere un mecanismo de marcado de elementos del DOM dentro de la secuencia de entrada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por refuerzo (el nombre "RL agent config" sugiere un pipeline de agente por refuerzo, pero no se detalla). La cuantización es dinámica INT8 simétrica aplicada con `onnxruntime.quantization`, lo que reduce el modelo más de 4 veces respecto al FP32 original.

## Capacidades

- Clasificación de acciones de navegador en siete clases discretas: `CLICK`, `TYPE_TEXT`, `SELECT`, `SCROLL_DOWN`, `SCROLL_UP`, `WAIT`, `DONE`.
- Procesamiento de estado del DOM y contexto de tarea mediante marcadores posicionales (`marker_pos`, `marker_mask`).
- Inferencia en CPU sin GPU, con latencia declarada inferior a 45 ms.
- Ejecución en dispositivos de borde x86_64 y ARM.
- Soporte de secuencias de longitud dinámica (sin padding fijo).
- Integración con el motor de navegador anti-detección Pooki-Pra y Camoufox.
- No se documentan capacidades de generación de texto libre, tool calling genérico, matemáticas, visión ni audio; es un clasificador de acciones, no un modelo generativo.

## Casos de uso

- Agentes de navegación web autónomos: el modelo decide la siguiente acción (clic, escritura, scroll) a partir del estado del DOM, permitiendo bucles de control de bajo nivel en el navegador.
- Automatización de formularios: clasificar cuándo escribir texto (`TYPE_TEXT`), seleccionar opciones (`SELECT`) o esperar carga (`WAIT`) en flujos de rellenado de campos.
- Scraping interactivo con navegación dinámica: decidir cuándo hacer scroll (`SCROLL_DOWN`/`SCROLL_UP`) o finalizar la tarea (`DONE`) en páginas con carga perezosa.
- Extensiones de navegador con IA local: al ejecutarse en ONNX Runtime sobre CPU, puede embeberse en el propio navegador sin enviar datos del DOM a servidores externos.
- Automatización de QA end-to-end: integrar la cabeza de decisión en pipelines de pruebas que simulan interacción humana sobre aplicaciones web.
- Despliegue en dispositivos de borde: en portátiles o ARM sin GPU, con 310 MB de peso y latencia sub-45 ms, para tareas de automatización web en campo.
- Navegación anti-detección: combinado con Camoufox y Pooki-Pra para agentes que requieren comportamiento de navegación menos detectable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo declara métricas de eficiencia: 310,1 MB de peso, reducción superior a 4x respecto a FP32 (1,28 GB) y latencia inferior a 45 ms en CPU x86_64, portátiles y ARM.

## Requisitos de hardware

- VRAM estimada: 0 GB; el modelo está diseñado para ejecución en CPU (`CPUExecutionProvider`).
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier CPU x86_64 o ARM moderna; el peso INT8 es de 310 MB.
- Despliegue: ONNX Runtime (con `onnxruntime.quantization` para la variante INT8); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia declarada: inferior a 45 ms por inferencia en CPU estándar.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Laya Browser Decision Head INT8 | Clasificador de acciones (ModernBERT) | no disponible | no disponible | MIT | ONNX INT8 |
| ModernBERT base | Encoder transformer | no disponible en la información | no disponible | no disponible | safetensors |
| Modelos de agente web generativos (p. ej. basados en LLM) | Generativos | no disponible | no disponible | variable | variable |

No se dispone de datos de rendimiento comparativo ni de alternativas directamente equivalentes en la información proporcionada. La comparativa con ModernBERT base es solo arquitectónica: Laya añade una cabeza de clasificación de acciones y cuantización INT8 para borde.

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés (`en`); el rendimiento en otros idiomas no está documentado.
- Es un clasificador de acciones restringido a siete clases; no genera texto libre ni razona de forma abierta.
- No se documentan sesgos conocidos, pero al entrenarse sobre interacciones de navegación podría heredar sesgos de los datos de entrenamiento (no disponibles).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea de acciones en DOMs no vistos.
- Sin datos públicos de benchmarks, precisión ni cobertura del espacio de acciones; la validación en producción corre por cuenta del integrador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte comunitario muy limitados.
- Licencia MIT permite uso comercial, pero no se ofrece garantía ni soporte del autor.
- Dependencia de ONNX Runtime y de la librería `laya` (custom_code); la integración requiere el pipeline específico de Pooki-Pra.

## Enlaces

- HuggingFace: https://huggingface.co/AdhyanshVerma/browser-laya-onnx
- Repositorio Pooki-Pra: https://github.com/AdhyanshVerma/pooki-pra
- Camoufox: https://github.com/daijro/camoufox
- Perfil del autor: https://huggingface.co/AdhyanshVerma
