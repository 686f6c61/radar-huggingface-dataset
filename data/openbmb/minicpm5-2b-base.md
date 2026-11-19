# openbmb/MiniCPM5-2B-Base

## Resumen

MiniCPM5-2B-Base es un modelo de lenguaje denso de tipo Transformer con 2.516.756.480 parámetros (aproximadamente 2,5 mil millones), desarrollado por OpenBMB como segundo miembro de la serie MiniCPM5, tras MiniCPM5-1B. Está diseñado específicamente para despliegue local, en dispositivo (on-device) y en entornos con recursos limitados, y se distribuye bajo licencia Apache 2.0. La model card lo posiciona como estado del arte de código abierto en la categoría de 2B, con rendimiento competitivo frente a modelos de la clase 4B en tareas de código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas.

La arquitectura sigue el esquema Llama (tag `llama` en el repositorio) y los pesos se publican en formato safetensors, con un tamaño de repositorio de 5,0 GB. El modelo se entrenó sobre un conjunto de datos propietario de OpenBMB que incluye Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609, lo que sugiere un pipeline que va desde el preentrenamiento con datos web filtrados hasta el ajuste supervisado y el aprendizaje por refuerzo, con un componente específico para agentes.

Su relevancia actual radica en la combinación de tamaño reducido, licencia permisiva y capacidades habitualmente reservadas a modelos mayores (contexto largo, tool calling, razonamiento matemático y de código), lo que lo hace atractivo para inferencia en hardware de consumo, aplicaciones de borde y prototipado rápido sin dependencia de infraestructura en la nube. El modelo solo declara soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama) |
| Parametros totales | 2.516.756.480 (~2,5 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el autor lo etiqueta como `long-context`, sin cifra publicada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ en la informacion) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

MiniCPM5-2B-Base es un Transformer denso de aproximadamente 2,5 mil millones de parámetros que escala la misma receta de entrenamiento empleada en MiniCPM5-1B. La model card lo describe explícitamente como un modelo denso, no MoE, y el repositorio lo etiqueta con la familia `llama`, lo que implica una arquitectura decoder-only convencional con atención multi-cabeza y capas feed-forward estándar. No se detallan en la información disponible innovaciones arquitectónicas como atención lineal, SSM híbridos o decodificación especulativa.

En cuanto a los datos, el autor enumera los datasets utilizados: Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 para el corpus web filtrado, UltraData-Math y UltraData-Code para matemáticas y código, y UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609 para las fases de ajuste supervisado, entrenamiento agéntico y aprendizaje por refuerzo. La presencia de un dataset específico de agentes (SFT-Agent) y otro de RL indica un pipeline post-entrenamiento orientado a tool calling y razonamiento multi-paso. No se especifica el número total de tokens de entrenamiento ni la composición porcentual del dataset.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento de código: la model card destaca ventajas frente a modelos de tamaño comparable en tareas de programación.
- Razonamiento matemático, apoyado en el corpus UltraData-Math.
- Comprensión de contexto largo (etiqueta `long-context`), aunque sin cifra concreta publicada.
- Tool calling / function calling, reforzado por el dataset UltraData-SFT-Agent-2609.
- Tareas agénticas y razonamiento multi-paso, con un dataset específico de RL (UltraData-RL-2609).
- Seguimiento de instrucciones, evaluado en el radar de capacidades de la model card junto a conocimiento general.
- Orientación a despliegue en dispositivo y entornos de borde (`on-device`, `edge-ai`).
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o CLI para autocompletado y generación de funciones, ejecutándose en una GPU de consumo gracias a sus ~2,5 B de parámetros y pesos safetensors de ~5 GB.
- Automatización de tareas con herramientas: gracias al entrenamiento con UltraData-SFT-Agent-2609, puede actuar como planificador que invoca APIs externas (calendario, correo, bases de datos) en flujos multi-paso.
- Procesamiento de documentos largos: la etiqueta `long-context` permite resumir contratos, informes o hilos de conversación extensos en inglés o chino sin truncar el contenido.
- Atención al cliente bilingüe (en/zh): adecuado para empresas con clientes en ambos idiomas que necesiten un modelo desplegado on-premise por motivos de privacidad.
- Tutoría de matemáticas: el corpus UltraData-Math y el énfasis en razonamiento matemático lo hacen útil para resolver problemas paso a paso y explicar el procedimiento.
- Inferencia en el borde: aplicaciones móviles o dispositivos IoT con GPU integrada pueden ejecutar el modelo cuantizado para tareas de clasificación, extracción o generación breve sin conexión a la nube.
- Prototipado rápido de agentes: su licencia Apache 2.0 y su compatibilidad con text-generation-inference y endpoints permiten levantar un servicio de pruebas en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye un gráfico de radar de capacidades (Code Reasoning, Math Reasoning, Instruction Following, General Knowledge, Long Context, Tool Use) que compara MiniCPM5-2B con modelos de la clase 4B, pero no proporciona los valores concretos de MMLU, HumanEval, GSM8K ni de otras suites estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 5-6 GB para los pesos, más overhead de KV cache; en la práctica, 8-10 GB para contextos moderados.
- Cuantización a 8 bits: ~2,5-3 GB de pesos; a 4 bits: ~1,5-2 GB, aunque no se confirman variantes GGUF/AWQ/GPTQ publicadas por el autor.
- GPU recomendadas: A100 o H100 para throughput alto en servidor; RTX 4090, RTX 4080 o RTX 3090 para desarrollo; cabe en GPUs de consumo con 8 GB o más en fp16 y en GPUs integradas o móviles con cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp, Ollama y vLLM son opciones plausibles para un modelo de familia Llama, aunque no se confirman explícitamente en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM5-2B-Base | ~2,5 B | no disponible | Apache 2.0 | Denso, orientado a on-device, en/zh |
| MiniCPM5-1B | ~1 B | no disponible | no disponible en la informacion | Predecesor de la misma serie |
| Modelos de clase 4B | ~4 B | no disponible | variable | La model card afirma que MiniCPM5-2B es competitivo frente a ellos |

No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa con alternativas concretas como Qwen2.5-3B, Llama-3.2-3B o Gemma-2-2B; la comparación queda limitada a parámetros y licencia.

## Limitaciones y advertencias

- Solo soporta inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a modelos de 2,5 B, especialmente en conocimiento factual y tareas de razonamiento profundo.
- La longitud de contexto no se especifica numéricamente; no debe asumirse un valor concreto sin verificación empírica.
- El modelo es una versión *Base*, no una versión instruct o chat; requiere ajuste o prompting adecuado para tareas conversacionales.
- No se documentan sesgos específicos, pero el corpus web (Ultra-FineWeb) puede introducir sesgos de género, culturales o geográficos propios de los datos de internet.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar las licencias de los datasets subyacentes si se redistribuye el modelo.
- No se confirman cuantizaciones oficiales; el uso de GGUF o AWQ de terceros puede degradar el rendimiento.
- Para producción en contextos largos, el KV cache puede consumir VRAM significativa pese al tamaño reducido del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B-Base
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- MiniCPM Tech Report (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- Wiki de MiniCPM (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Modelo predecesor MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Referencia adicional citada en tags (arXiv 2602.09003): https://arxiv.org/abs/2602.09003
