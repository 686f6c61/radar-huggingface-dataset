# ITLL/Fable-5-Thinking-Heretic-1B

## Resumen

Fable-5-Thinking-Heretic-1B es un modelo de lenguaje denso de 1.080.632.832 parámetros publicado por ITLL en Hugging Face. Se trata de una copia republicada (duplicado verificado del repositorio de WithinUsAI, a su vez duplicado del de saidutta69) de un fine-tune de MiniCPM5-1B de OpenBMB. La cadena de procedencia es relevante para entender el artefacto: parte del modelo base MiniCPM5-1B (arquitectura Llama densa, licencia Apache 2.0), pasa por un fine-tune de GnLOLot orientado a tool calling sobre trazas de "Fable 5" (V2), y termina en una edición de abliteración con la herramienta Heretic v1.4.0 aplicada por saidutta69 para eliminar el comportamiento de rechazo.

El modelo mantiene la ventana de contexto de 131.072 tokens (128K) del base, el vocabulario de 130.560 entradas y los modos Think/No-Think heredados de MiniCPM5. Según la model card, la abliteración redujo los rechazos de 93/100 a 3/100 en un conjunto de prompts adversarios, con una divergencia KL de 0,0232 respecto al modelo padre. El repositorio incluye pesos completos en safetensors y una escalera de 15 cuantizaciones GGUF que va de Q2_K (0,49 GB) a F16 (2,17 GB).

Su relevancia práctica es la de un modelo de 1B con contexto largo, soporte de tool calling en formato XML y modos de razonamiento explícito, desplegable en hardware de consumo (GPU de 6 GB, portátiles e incluso móviles con las cuantizaciones más agresivas). La ausencia de censura y rechazos lo orienta a entornos de investigación y experimentación donde el filtrado del modelo base resulta limitante, con las advertencias de seguridad que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura Llama (24 capas, hidden size 1.536, 16 cabezas de atención con 2 KV heads, GQA, intermediate size 4.608, RoPE theta 5.000.000, sin embeddings atados) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | 15 cuantizaciones GGUF (Q2_K a F16), incluida Q2_K de 0,49 GB y F16 de 2,17 GB; pesos completos en safetensors |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 (heredada del modelo base en toda la cadena) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de MiniCPM5-1B de OpenBMB: un decoder transformer denso con el diseño estándar de Llama, con atención de consultas agrupadas (GQA) de 16 cabezas y 2 KV heads, 24 capas, dimensión oculta de 1.536 y tamaño intermedio de 4.608. El vocabulario es de 130.560 tokens y la ventana máxima de posición es de 131.072 tokens. La plantilla de chat incluye un interruptor `enable_thinking` que alterna entre el modo Think (bloques de cadena de pensamiento antes de la respuesta) y el modo No Think (respuesta directa).

El entrenamiento del base siguió la receta de tres etapas de OpenBMB con "UltraData Tiered Data Management": entrenamiento base con fase de decay, mid-training para adaptar la distribución objetivo y post-training con 200.000 millones de tokens de SFT de razonamiento profundo más 200.000 millones de tokens de SFT de razonamiento híbrido, seguido de profesores de RL especializados en matemáticas, código, QA de libro cerrado y escritura, destilados de vuelta al modelo final mediante destilación on-policy (OPD). OpenBMB reporta que RL más OPD elevó las puntuaciones medias en matemáticas, código e instrucciones en 16 puntos y redujo en 29 puntos porcentuales las respuestas que agotaban el presupuesto máximo de tokens. Sobre esa base, GnLOLot aplicó un fine-tune adicional sobre trazas de "Fable 5" (V2), con énfasis en tool calling y function calling, manteniendo la plantilla de chat y el formato XML de llamadas a herramientas. Finalmente, saidutta69 aplicó la herramienta de abliteración Heretic v1.4.0 sobre las proyecciones de salida de atención y de down del MLP para suprimir la dirección de rechazo.

## Capacidades

- Generación de texto con razonamiento explícito mediante modo Think (cadena de pensamiento) o respuestas directas en modo No Think.
- Tool calling y function calling en formato XML, con la plantilla nativa de MiniCPM5, reforzado en el fine-tune V2.
- Razonamiento multietapa y uso como agente en flujos que encadenan llamadas a herramientas.
- Capacidad de código e instrucciones mejorada respecto al base según la model card del fine-tune.
- Capacidades matemáticas heredadas del entrenamiento con RL del base (profesores especializados en matemáticas).
- Biligüe inglés-chino.
- Contexto largo de 128K tokens para documentos extensos o conversaciones multi-turno prolongadas.
- Comportamiento de rechazo suprimido por abliteración (de 93/100 a 3/100 en prompts adversarios según la card).

## Casos de uso

- Agentes de tool calling en local: el modelo puede emitir llamadas a funciones en formato XML dentro de un bucle de agente, y su tamaño de 1B permite ejecutarlo en portátiles o GPU de 6 GB, lo que facilita prototipos de agentes sin coste de API.
- Procesamiento de documentos largos en inglés o chino: con 128K tokens de contexto puede resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada.
- Asistente de código en el editor: el fine-tune V2 mejora código e instrucciones, y las cuantizaciones Q4/Q5 caben en GPU de consumo para autocompletado o generación de funciones con latencia baja.
- Investigación sobre alineación y seguridad: al ser un modelo con la dirección de rechazo ablacionada, sirve para estudiar comportamiento de modelos sin censura, medir efectos de la abliteración (la card reporta KL 0,0232) o comparar respuestas frente al padre.
- Despliegue en dispositivos móviles o embebidos: la cuantización Q2_K de 0,49 GB permite inferencia en teléfonos o placas con poca memoria, útil para demos offline o asistentes sin conexión.
- Generación de datos sintéticos y destilación: un modelo de 1B con modo Think y sin rechazos puede generar trazas de razonamiento y pares instrucción-respuesta para entrenar modelos mayores o filtrar datasets.
- Chat multi-turno bilingüe inglés-chino: para atención al cliente o asistentes internos en organizaciones que operan en ambos idiomas, con la ventana de 128K para conservar historial largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios del modelo en la informacion disponible. La model card únicamente reporta métricas del proceso de abliteración (divergencia KL de 0,0232 frente al padre y reducción de rechazos de 93/100 a 3/100) y cifras del modelo base MiniCPM5-1B atribuidas a OpenBMB: primer puesto en MathArena AIME 2026 (40,42), segundo en GPQA (26,26), tercero en MMLU-Pro (48,85) y tercero en MathArena HMMT Feb 2026 (25,76). Estas cifras corresponden al base antes del fine-tune y de la abliteración, por lo que no deben atribuirse directamente a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q2_K, en torno a 1 GB con Q4_K_M y 2,2 GB con F16, más el overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) para las cuantizaciones intermedias; A100 o H100 no son necesarias y solo aportarían throughput en despliegues con muchas peticiones concurrentes.
- Cabe en GPU de consumo y en hardware de gama baja: la card lo sitúa explícitamente en teléfonos, portátiles y GPU de 6 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para safetensors en servidor; el tag `endpoints_compatible` de Hugging Face sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Fable-5-Thinking-Heretic-1B | 1,08B | 128K | Apache 2.0 | Fine-tune con tool calling y abliteración; GGUF de Q2_K a F16 |
| openbmb/MiniCPM5-1B | 1,08B | 128K | Apache 2.0 | Modelo base sin abliterar; modos Think/No-Think; SOTA declarado por OpenBMB en la clase sub-3B |
| Qwen3-0.6B (modo thinking) | 0,6B | no disponible en la información | no disponible en la información | Alternativa de tamaño similar citada en la card del base como referencia competitiva |
| LFM2.5-1.2B-Thinking | 1,2B | no disponible en la información | no disponible en la información | Alternativa de la clase 1B citada en la card del base como referencia competitiva |

## Limitaciones y advertencias

- La abliteración suprime la dirección de rechazo: el modelo puede responder a solicitudes que el base rechazaría, lo que traslada toda la responsabilidad de filtrado y moderación al sistema que lo despliega.
- La abliteración introduce un cambio medible en el comportamiento (KL 0,0232 frente al padre); puede degradar ligeramente la coherencia o la calidad en tareas sensibles a esa dirección.
- Riesgo de alucinación propio de un modelo de 1B: la capacidad de razonamiento y el conocimiento factual son limitados frente a modelos mayores, especialmente en consultas de dominio especializado.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- La licencia Apache 2.0 permite uso comercial, pero el autor del repositorio no ofrece garantías y la card no documenta evaluaciones de seguridad del artefacto final.
- El repositorio es un duplicado sin cambios de archivos; los datos de descargas y likes son cero y no hay pipeline declarado, lo que dificulta verificar el uso en producción.
- El nombre del modelo hace referencia a una supuesta línea de modelos "Fable 5" y "Claude Opus" sin afiliación con Anthropic ni con OpenBMB; no debe interpretarse como un modelo oficial de ninguno de ellos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ITLL/Fable-5-Thinking-Heretic-1B
- Modelo fuente (duplicado de WithinUsAI): https://huggingface.co/WithinUsAI/Fable-5-Thinking-Heretic-1B
- Build abliterado original: https://huggingface.co/saidutta69/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic
- Fine-tune V2 de GnLOLot: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking
- Modelo base MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Herramienta de abliteración Heretic: https://github.com/p-e-w/heretic
