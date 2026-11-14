# keepmum/prompt-injection-guard-small-ft-gguf

## Resumen

Prompt Injection Guard Small (fine-tune de keepmum, versión v2.3-km1) es un clasificador de texto derivado de Prompt Injection Guard Small v2.3 de Horizon Labs, convertido a GGUF para su uso con llama.cpp. El modelo base emplea la arquitectura mmBERT-small con 141 millones de parámetros y pooling por media, y devuelve dos etiquetas: `SAFE` e `INJECTION`. keepmum, un proxy local de privacidad para agentes de programación, reentrenó los pesos originales para detectar instrucciones maliciosas incrustadas en la salida de herramientas de agentes (archivos, páginas web, respuestas MCP y salida de comandos), un escenario que el modelo original cubría solo parcialmente.

El fine-tune se realizó sobre 25.555 ejemplos (la mitad con inyección) durante 648 pasos (2 épocas) con tasa de aprendizaje 2e-5, AdamW y ventanas de 2.048 tokens, partiendo del commit `2efc2ed5` de Horizon Labs y ejecutándose en un Apple M5 Pro. Los datos combinan sesiones reales de agentes de programación (SWE-chat, SWE-Hero OpenHands), suites de AgentDojo, listas de herramientas MCP con descripciones envenenadas, informes de errores con payloads y una réplica de los conjuntos públicos de entrenamiento del modelo original.

La relevancia actual del modelo reside en su orientación específica hacia la seguridad de agentes autónomos: detecta inyecciones de prompt en contenido no confiable que el agente consume durante tareas multi-paso. Frente al original, mejora la detección en AgentDojo (del 80,8 % al 91,4 %) y en archivos de repositorio de prodnull (del 25,0 % al 49,5 %), a costa de un aumento moderado de falsos positivos y de umbrales de decisión más bajos (en torno a 0,2-0,3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT-small (encoder tipo transformer, pooling por media) |
| Parametros totales | 140.642.306 (141M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 2.048 tokens en la evaluación; límite máximo del encoder no disponible |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un encoder mmBERT-small de 141M parámetros con pooling por media sobre las representaciones del token, configurado como clasificador de dos clases (`SAFE`, `INJECTION`). Conserva la misma arquitectura, tokenizador, etiquetas y tamaño que el modelo original de Horizon Labs; el fine-tune no altera la estructura, solo los pesos. La conversión a GGUF permite ejecución en CPU y GPU mediante llama.cpp.

El reentrenamiento partió de los pesos de Horizon Labs en el commit `2efc2ed5` y se ejecutó durante 648 pasos (2 épocas) con tasa de aprendizaje 2e-5, warmup del 6 %, decaimiento lineal, AdamW, weight decay 0,01 y ventanas de 2.048 tokens, procesando aproximadamente 32.000 tokens por paso. El conjunto de datos (25.555 ejemplos, mitad benignos y mitad inyectados) se construyó a partir de salidas reales de herramientas de agentes de programación (SWE-chat, ODC-BY; SWE-Hero OpenHands, CC BY 4.0), a las que se añadieron instrucciones plantadas en distintas posiciones (inicio, medio, final), con un 8 % en otros idiomas y un 5 % en base64. Se incorporaron también las suites banking y slack de AgentDojo 0.1.34 (MIT), listas de herramientas MCP con descripciones envenenadas, informes de errores con payloads, archivos de instrucciones de agentes y guías de instalación como ejemplos benignos, además de una réplica de los conjuntos públicos del modelo original (neuralchemy, Apache-2.0; S-Labs, MIT; deepset, Apache-2.0). Los conjuntos de test (sesiones SWE-chat y shards SWE-Hero leídos por el benchmark, suites travel y workspace de AgentDojo, InjecAgent, LLMail-Inject, CodeIPI, prodnull y el conjunto manuscrito de keepmum) se mantuvieron fuera del entrenamiento, y se eliminaron textos de entrenamiento idénticos a textos de test.

## Capacidades

- Clasificación binaria de texto en `SAFE` e `INJECTION` orientada a la detección de inyecciones de prompt.
- Detección de instrucciones plantadas en salidas de herramientas de agentes: contenido de archivos, páginas web, respuestas de servidores MCP y salida de comandos.
- Detección de payloads en listas de herramientas MCP con descripciones envenenadas e informes de errores tipo issue.
- Cobertura multilingüe, con ejemplos de entrenamiento en otros idiomas distintos del inglés (8 % del total de inyecciones).
- Robustez parcial ante ofuscación: el entrenamiento incluye un 5 % de payloads codificados en base64.
- Procesamiento por ventanas de 2.048 tokens con agregación mediante el máximo de P(INJECTION) entre ventanas.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni otras capacidades generativas: es exclusivamente un clasificador.

## Casos de uso

- Protección de agentes de programación en producción: el modelo se integra como paso de verificación sobre cada resultado de herramienta (lectura de archivos, salida de shell, respuestas MCP) antes de que el agente lo incorpore a su contexto, bloqueando instrucciones plantadas en repositorios de terceros o dependencias.
- Proxy de privacidad local: keepmum lo emplea como comprobación opcional en su proxy para agentes (Claude Code, Codex, Gemini CLI), ejecutándose en local vía llama.cpp sin enviar contenido sensible a servicios externos.
- Defensa frente a ataques de inyección indirecta en navegación web: el modelo inspecciona páginas y documentos recuperados por el agente y marca contenido que contiene instrucciones dirigidas al modelo, mitigando ataques del tipo AgentDojo.
- Auditoría de cadenas de suministro de código: análisis de archivos de repositorios (issues, comentarios de código, configuraciones) para localizar payloads de inyección antes de que un agente los procese, con cobertura medida del 49,5 % en el conjunto prodnull.
- Filtrado de descripciones de herramientas MCP: validación de las descripciones registradas por servidores MCP de terceros para detectar descripciones envenenadas que redirigen el comportamiento del agente.
- Moderación de contenido no confiable en pipelines RAG: clasificación de fragmentos recuperados antes de insertarlos en el contexto de un LLM, con ventanas de 2.048 tokens y umbral ajustable según la tolerancia a falsos positivos.
- Monitorización y alerta en CI/CD: ejecución del clasificador sobre artefactos y salidas de herramientas en pipelines automatizados para detectar intentos de inyección dirigidos a agentes que operan sobre el repositorio.

## Benchmarks y rendimiento

Evaluación con el benchmark público de keepmum (`bench/guard_public.py`), en la configuración Medium (misma tasa de marcado sobre 2.000 resultados reales de herramientas de Claude Code, Codex y Gemini CLI: 1,7 % para el original y 1,5 % para este modelo), ventanas de 2.048 tokens y máximo de P(INJECTION); solo se contabilizan documentos excluidos del entrenamiento.

| Conjunto | Original (umbral 0,8; 0,995 por debajo de 200 caracteres) | Este modelo (umbral 0,222) |
|---|---|---|
| AgentDojo, suites travel y workspace (511 ataques) | 80,8 % | 91,4 % |
| Archivos de repositorio prodnull (2.432 ataques) | 25,0 % | 49,5 % |
| InjecAgent (600) | 75,5 % | 75,2 % |
| LLMail-Inject fase 2 (600)* | 98,2 % | 98,7 % |
| CodeIPI (35) | 48,6 % | 40,0 % |
| Conjunto manuscrito de keepmum (144 ataques) | 140 | 140 |
| Salida de herramientas SWE-Hero marcada (753) | 0,9 % | 1,7 % |
| Archivos benignos prodnull marcados (1.690) | 0,4 % | 1,7 % |
| Texto y código de seguridad que citan ataques, marcados | 5 % | 3 % |

\* LLMail-Inject forma parte de los datos de entrenamiento del modelo original. Las suites de test de AgentDojo usan las mismas siete plantillas de ataque que las suites de entrenamiento, con otras tareas y salidas de herramientas, por lo que esa cifra es más favorable que la obtenida con ataques nuevos. El benchmark fue elaborado por un único autor y su parte manuscrita es pequeña; las cifras deben interpretarse como comparación entre ambos modelos.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 164.357.760 bytes (unos 157 MB), por lo que la inferencia requiere del orden de 0,2 GB de memoria, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; también funciona en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, GTX 1650, etc.) y en equipos integrados; el autor lo entrenó en un Apple M5 Pro.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); al ser un clasificador, no aplica servido generativo con vLLM o TGI en su forma habitual. El repo declara compatibilidad con endpoints (`endpoints_compatible`).
- Latencia y throughput: no disponibles. El coste por inferencia es bajo dado el tamaño (141M parámetros, ventanas de 2.048 tokens), pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (keepmum v2.3-km1) | 141M | ventanas de 2.048 tokens | Clasificación SAFE/INJECTION | apache-2.0 | GGUF Q8_0 |
| Horizon-Labs/prompt-injection-guard-small (original) | 141M | ventanas de 2.048 tokens | Clasificación SAFE/INJECTION | no disponible en la información proporcionada | safetensors (repo base) |
| keepmum/prompt-injection-guard-small-gguf (conversión sin fine-tune) | 141M | ventanas de 2.048 tokens | Clasificación SAFE/INJECTION | apache-2.0 | GGUF |

El original obtiene mejores resultados en CodeIPI (48,6 % frente a 40,0 %) y menores tasas de falsos positivos (0,9 % y 0,4 % frente a 1,7 % y 1,7 %), mientras que este fine-tune supera al original en AgentDojo (91,4 % frente a 80,8 %) y prodnull (49,5 % frente a 25,0 %). La conversión sin fine-tune conserva el comportamiento del original con el mismo formato GGUF.

## Limitaciones y advertencias

- No es un modelo generativo: solo clasifica texto; no puede explicar por qué marca un contenido ni generar contramedidas.
- Umbrales de decisión distintos del original: los scores se sitúan más bajos, por lo que deben usarse umbrales en torno a 0,2-0,3, no 0,65-0,98.
- Mayor tasa de falsos positivos que el original: marca más salida ordinaria de herramientas (1,7 % frente a 0,9 % en SWE-Hero) y más archivos benignos de repositorio (1,7 % frente a 0,4 % en prodnull).
- Pérdida de detección en CodeIPI: baja del 48,6 % al 40,0 %, perdiendo tres ataques en issues, comentarios de código y configuraciones.
- Cobertura incompleta en archivos de repositorio: detecta solo el 49,5 % de los ataques del conjunto prodnull, pese a la mejora sustancial frente al original.
- Sesgos y alucinación: no disponibles como tales; al ser un clasificador, el riesgo relevante es el error de clasificación (falsos positivos y negativos), no la alucinación generativa. No se documentan sesgos específicos en la información proporcionada.
- Limitaciones de idioma: aunque se declara multilingüe, solo el 8 % de las inyecciones de entrenamiento estaban en idiomas distintos del inglés, por lo que la cobertura real en otras lenguas es menor.
- Robustez limitada ante ofuscación: solo un 5 % de los payloads de entrenamiento usaban base64; otras codificaciones no están cubiertas explícitamente.
- Caveat de evaluación: el benchmark lo elaboró un único autor y su parte manuscrita es pequeña; las cifras de AgentDojo son más favorables que las que se obtendrían con plantillas de ataque nuevas.
- Licencia apache-2.0: permite uso comercial, pero el modelo no está afiliado ni respaldado por Horizon Labs; para los datos de entrenamiento y limitaciones del modelo original debe consultarse su model card.
- Fecha de creación del repositorio: 2026-11-14, con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validación todavía muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keepmum/prompt-injection-guard-small-ft-gguf
- Modelo base (Horizon Labs): https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Commit base del fine-tune: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small/tree/2efc2ed5abecd21eb45c2506d231a65d6e392b85
- Conversión sin fine-tune: https://huggingface.co/keepmum/prompt-injection-guard-small-gguf
- Repositorio keepmum: https://github.com/blueandhack/keepmum
- Construcción de datos: https://github.com/blueandhack/keepmum/blob/4472df5/bench/ft_data.py
- Entrenamiento: https://github.com/blueandhack/keepmum/blob/4472df5/bench/ft_train.py
- Benchmark público: https://github.com/blueandhack/keepmum/blob/4472df5/bench/guard_public.py
- Resultados completos: https://github.com/blueandhack/keepmum/blob/4472df5/bench/results/GUARD.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- AgentDojo: https://github.com/ethz-spylab/agentdojo
- Dataset SWE-chat: https://huggingface.co/datasets/SALT-NLP/SWE-chat
- Dataset SWE-Hero OpenHands trajectories: https://huggingface.co/datasets/nvidia/SWE-Hero-openhands-trajectories
- Dataset prodnull: https://huggingface.co/datasets/prodnull/prompt-injection-repo-dataset
- Dataset neuralchemy: https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
- Dataset S-Labs: https://huggingface.co/datasets/S-Labs/prompt-injection-dataset
- Dataset deepset: https://huggingface.co/datasets/deepset/prompt-injections
