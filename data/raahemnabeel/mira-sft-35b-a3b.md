# raahemnabeel/mira-sft-35b-a3b

## Resumen

MIRA-SFT-35B-A3B es un modelo de lenguaje multimodal de tipo mixto de expertos (MoE) desarrollado por MIRA-MMDeepResearch, publicado originalmente como el agente de investigación profunda del proyecto *MIRA: A Multimodal Illustrated Deep Research Agent for Controllable Reports*. Se trata de un ajuste fino supervisado de parámetros completos (SFT) sobre Qwen3.6-35B-A3B, orientado a tareas de búsqueda web, navegación de páginas e imágenes, ejecución de Python y redacción de informes ilustrados con citas.

El modelo cuenta con 35.000 millones de parámetros totales y 3.000 millones activos por token, distribuidos en 256 expertos con enrutamiento top-8 más un experto compartido. Su arquitectura combina 40 capas que alternan atención lineal Gated DeltaNet con atención completa con compuertas, e incorpora un codificador de visión. El contexto alcanza los 262.144 tokens y el modelo funciona por defecto en modo razonamiento (thinking), con soporte de tool calling y entrada de texto e imágenes.

La ficha que nos ocupa corresponde a un paquete de despliegue publicado por raahemnabeel para hardware Tenstorrent (p100, p150, p150x2, p150x4, p300, p300x2), empaquetado con tt-model-manager 0.1.0 y servido mediante vLLM con una API compatible con OpenAI. Es relevante porque demuestra la portabilidad de un agente multimodal de investigación profunda a aceleradores no convencionales, manteniendo el contexto completo y el soporte de hasta 32 usuarios concurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 40 capas con Gated DeltaNet (atención lineal) y atención completa con compuertas; codificador de visión |
| Parametros totales | 35B |
| Parametros activos | 3B por token (256 expertos, top-8 + experto compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Expertos enrutados a bfp4 en el perfil de un solo die (p150/p100); pesos convertidos a menor precisión al cargar en el servidor; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el paquete descarga los pesos del repositorio base MIRA-MMDeepResearch/MIRA-SFT-35B-A3B; tamaño del repo 4,1 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, un transformer MoE con 35B parámetros totales y 3B activos por token. La red tiene 256 expertos con enrutamiento top-8 más un experto compartido, y 40 capas que intercalan Gated DeltaNet (atención lineal) con atención completa con compuertas, lo que reduce el coste computacional en contextos largos. Incluye además un codificador de visión que permite la entrada de imágenes junto al texto.

MIRA-SFT-35B-A3B se obtiene mediante un ajuste fino supervisado de parámetros completos (SFT) sobre Qwen3.6-35B-A3B, entrenado para buscar en la web, abrir páginas e imágenes, ejecutar Python y redactar respuestas cortas o informes ilustrados con citas. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO adicionales; esa información debe consultarse en la model card original y en el repositorio GitHub del proyecto MIRA. Como innovaciones técnicas destacables, el modelo incorpora modo de razonamiento activado por defecto con preservación del pensamiento entre turnos (`preserve_thinking`), tool calling con parser `qwen3_xml` y separación del texto de razonamiento mediante el parser `qwen3`.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto; el texto de razonamiento se devuelve en el campo `reasoning`, separado de `content`.
- Entrada multimodal: texto e imágenes (hasta 4 imágenes por petición como partes `image_url`, redimensionadas a un máximo de 4 MP en los perfiles de dos y cuatro dies). No acepta vídeo.
- Tool calling / function calling: las herramientas se pasan como `tools` de OpenAI y el modelo emite llamadas en XML de Qwen, parseadas a `tool_calls` con `finish_reason: tool_calls`.
- Capacidades de agente de investigación profunda: búsqueda web, apertura de páginas e imágenes, ejecución de Python y redacción de informes ilustrados con citas.
- Razonamiento multi-paso y preservación del pensamiento entre turnos de conversación (`preserve_thinking`).
- Soporte de hasta 32 usuarios concurrentes por servidor según los perfiles de servicio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de investigación profunda automatizado: el modelo puede planificar búsquedas, abrir páginas e imágenes, ejecutar código Python para procesar datos y redactar un informe final con citas, aprovechando su contexto de 262.144 tokens para mantener el hilo de una investigación larga.
- Generación de informes ilustrados: gracias a su codificador de visión y a la entrada de hasta 4 imágenes por petición, puede analizar figuras, capturas o diagramas y referenciarlos en el texto del informe.
- Asistente de atención al cliente multimodal: admite conversaciones multi-turno con imágenes adjuntas (capturas de pantalla, fotos de productos) y conserva el razonamiento previo entre turnos, lo que facilita la coherencia en sesiones largas.
- Automatización de pipelines de CI/CD con tool calling: puede invocar herramientas externas (ejecutar tests, consultar APIs, lanzar scripts) y encadenar llamadas dentro de un flujo de agente, con el servidor devolviendo `tool_calls` estructurados.
- Verificación de hechos y preguntas sobre imágenes (VQA): el modelo está entrenado para tareas de búsqueda y verificación visual, por lo que puede responder preguntas que requieran consultar fuentes externas y contrastar información con imágenes.
- Despliegue en infraestructura Tenstorrent: el paquete permite servir el modelo en aceleradores p100, p150, p150x2, p150x4, p300 y p300x2 mediante `tt serve`, con perfiles que escalan de un solo die (solo texto, expertos en bfp4) a cuatro dies (texto e imágenes, máxima velocidad).
- Chat y razonamiento sobre documentos extensos: con 262.144 tokens de contexto puede procesar contratos, artículos o transcripciones completas y responder con razonamiento explícito separado del contenido final.

## Benchmarks y rendimiento

La model card del paquete indica que las métricas de precisión están pendientes ("Pending"). Las puntuaciones de los autores de MIRA en MMSearch, MMSearch+, BrowseComp-VL, SimpleVQA, LiveVQA, FVQA, VDR-Bench y MMDeepResearch, bajo su propio harness, se encuentran en la model card original y no se reproducen aquí. No se han publicado resultados de benchmarks en la información disponible para este paquete.

En cuanto al rendimiento de servicio, la model card menciona que se han medido con el benchmark de tokens aleatorios de vLLM con `ignore_eos` (medianas, una petición por usuario a la vez) para el perfil p300x2 (cuatro dies), pero el texto proporcionado se interrumpe antes de mostrar las cifras concretas, por lo que no se dispone de valores numéricos de latencia o throughput.

## Requisitos de hardware

- Hardware objetivo: aceleradores Tenstorrent p100, p150, p150x2, p150x4, p300 y p300x2. No se trata de un despliegue sobre GPU convencionales en esta ficha.
- Perfil p300x2 (cuatro dies): el más rápido, texto e imágenes, hasta 32 secuencias concurrentes, contexto de 262.144 tokens.
- Perfil p150x4: equivalente a p300x2 sobre cuatro placas p150.
- Perfil p300 (por defecto): dos dies, texto e imágenes, aproximadamente el 60 % de la velocidad de un solo usuario del perfil de cuatro dies.
- Perfil p150x2: equivalente a p300 sobre dos placas p150.
- Perfil p150: un solo die, solo texto, expertos enrutados en bfp4.
- Perfil p100: equivalente a p150 sobre una placa p100.
- Despliegue: `tt serve raahemnabeel/mira-sft-35b-a3b` (requiere Tenstorrent CLI y Docker) o `tt-model serve raahemnabeel/mira-sft-35b-a3b` sin tt-cli. El servidor expone una API compatible con OpenAI en el puerto 20000 (o el siguiente libre).
- La primera puesta en marcha compila kernels para el dispositivo, lo que tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- VRAM estimada, GPU recomendadas, latencia y throughput en GPU: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MIRA-SFT-35B-A3B (este paquete) | 35B | 3B | 262.144 | Sí (texto e imágenes) | Apache 2.0 | Hugging Face + Tenstorrent |
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con modelos similares.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; deben consultarse en la model card original de MIRA.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en tareas de investigación profunda el modelo puede generar citas o hechos no verificados, por lo que se recomienda validación externa.
- El modo thinking está activado por defecto: si se agota el presupuesto de `max_tokens` dentro del razonamiento, el campo `content` queda vacío. Es necesario asignar presupuestos de miles de tokens para peticiones con razonamiento.
- La model card advierte de que el prompt de sistema propio de MIRA (`SYS_QWEN36_SFT_S2_MM`) es el recomendado y que otros prompts de sistema reducen la precisión.
- El paquete sirve únicamente el modelo: las herramientas de búsqueda, navegación y código deben aportarlas el usuario.
- En el perfil de un solo die (p150, p100) solo hay soporte de texto; los expertos enrutados se convierten a bfp4, lo que puede afectar a la precisión.
- No se acepta entrada de vídeo; las imágenes se limitan a 4 por petición y se redimensionan a un máximo de 4 MP en los perfiles de dos y cuatro dies.
- `top_k` está limitado a 32 en el muestreo en dispositivo.
- Licencia Apache 2.0: permite uso comercial, pero deben revisarse las condiciones del modelo base y de los pesos originales de MIRA.
- Idiomas soportados no documentados en esta ficha; la cobertura multilingüe debe verificarse en la documentación original.

## Enlaces

- [Hugging Face: raahemnabeel/mira-sft-35b-a3b](https://huggingface.co/raahemnabeel/mira-sft-35b-a3b)
- [Modelo base: MIRA-MMDeepResearch/MIRA-SFT-35B-A3B](https://huggingface.co/MIRA-MMDeepResearch/MIRA-SFT-35B-A3B)
- [GitHub del proyecto MIRA](https://github.com/MIRA-MMDeepResearch/MIRA)
- [tt-model-manager](https://github.com/tenstorrent/tt-model-manager)
- [Tenstorrent CLI: prerequisitos](https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md)
