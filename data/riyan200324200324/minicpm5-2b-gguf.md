# Riyan200324200324/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de tipo Transformer con 2.516.756.480 parámetros (aproximadamente 2,5 mil millones), desarrollado por OpenBMB como segundo miembro de la familia MiniCPM5, tras MiniCPM5-1B. Está diseñado específicamente para despliegue en dispositivo (on-device), ejecución local y escenarios con recursos limitados, y según el autor alcanza el estado del arte entre los modelos de código abierto de su clase (2B), manteniéndose competitivo frente a modelos de 4B en tareas de código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas.

El modelo se distribuye bajo licencia Apache 2.0, soporta únicamente inglés y chino, y se ofrece en esta ficha en formato GGUF (cuantizado) para inferencia eficiente, además de los pesos originales en safetensors. La receta de entrenamiento escala la de MiniCPM5-1B e incluye datos de las colecciones UltraData y Ultra-FineWeb de OpenBMB, con fases de SFT y RL orientadas a agentes y razonamiento.

Su relevancia actual radica en la combinación de tamaño reducido (apto para GPUs de consumo y hardware de borde), contexto largo, soporte de tool calling y un rendimiento que el autor sitúa a nivel de modelos del doble de tamaño, lo que lo convierte en candidato para asistentes locales, automatización de flujos y prototipado rápido sin dependencia de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia MiniCPM5, linaje Llama) |
| Parámetros totales | 2.516.756.480 (~2,5 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo se etiqueta como "long-context", sin cifra publicada) |
| Tipos de cuantización | GGUF (este repositorio); niveles concretos no disponibles |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (original) y GGUF (este repositorio) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso que reutiliza y escala la receta de entrenamiento de MiniCPM5-1B. No emplea mezcla de expertos (MoE), por lo que todos los parámetros (~2,5 B) se activan en cada token. El modelo se presenta como una evolución del linaje MiniCPM, con soporte nativo de contexto largo y tool calling, y está optimizado para inferencia en hardware limitado.

El entrenamiento se apoya en las colecciones de datos abiertas de OpenBMB: Ultra-FineWeb y Ultra-FineWeb-L3 (corpus web filtrado), UltraX-Preview, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de conjuntos específicos de SFT para agentes y de RL sugiere fases de ajuste supervisado y aprendizaje por refuerzo orientadas a uso de herramientas y razonamiento multi-paso. No se han publicado en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni detalles sobre técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento de código: el autor destaca ventajas frente a modelos de tamaño comparable en tareas de programación.
- Razonamiento matemático, con datos específicos de entrenamiento (UltraData-Math).
- Comprensión de contexto largo (etiqueta "long-context"; longitud exacta no disponible).
- Tool calling / function calling, con datos de SFT específicos para agentes.
- Tareas agénticas y razonamiento multi-paso (entrenamiento con UltraData-SFT-Agent y UltraData-RL).
- Seguimiento de instrucciones, evaluado en el radar de capacidades del autor.
- Despliegue en dispositivo y entornos de borde (edge-ai, on-device).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") y pipeline de text-generation en transformers.

## Casos de uso

- Asistentes locales en portátil o estación de trabajo: al ser un modelo de ~2,5 B en GGUF, puede ejecutarse en CPU o GPU de consumo mediante llama.cpp u Ollama, ofreciendo un asistente conversacional sin conexión y con baja latencia.
- Automatización de agentes con tool calling: los datos de SFT-Agent y RL permiten integrarlo en flujos donde el modelo decide qué función invocar (APIs, consultas a bases de datos, operaciones de fichero) dentro de un bucle multi-paso.
- Generación y revisión de código en pipelines de CI/CD: su rendimiento en código permite tareas de autocompletado, generación de tests o revisión de parches en entornos con recursos acotados, sin depender de APIs externas.
- Procesamiento de documentos largos: la orientación a contexto largo facilita resúmenes, extracción de entidades y preguntas sobre contratos o informes extensos, siempre que se confirme la ventana real en la implementación concreta.
- Asistencia matemática y tutoría: con entrenamiento específico en UltraData-Math, es adecuado para resolución guiada de problemas y explicación paso a paso en aplicaciones educativas.
- Despliegue en dispositivos de borde (edge-ai): robots, asistentes de voz embebidos o aplicaciones móviles donde el presupuesto de memoria y cómputo es reducido y se requiere privacidad de datos.
- Prototipado rápido y evaluación de pipelines: su tamaño permite iterar con bajo coste en investigación, comparando estrategias de prompting o de agentes antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor presenta únicamente un gráfico radar cualitativo de capacidades (código, matemáticas, seguimiento de instrucciones, conocimiento general, contexto largo y uso de herramientas) frente a modelos de clase 4B, sin cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo denso de ~2,5 B, la cuantización a 4 bits requiere del orden de 1,5-2 GB y a 8 bits en torno a 2,5-3 GB, mientras que FP16 rondaría los 5 GB (estimación, no dato del autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en RTX 3060/4060/4090 y en GPUs de datacenter (A100, H100) con holgura.
- GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en cuantizaciones bajas; también viable en CPU.
- Opciones de despliegue: llama.cpp y Ollama para GGUF, vLLM o TGI para los pesos safetensors, y transformers como librería base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B | ~2,5 B | no disponible | Apache 2.0 | safetensors, GGUF | Objeto de esta ficha; SOTA declarado en clase 2B |
| MiniCPM5-1B | ~1 B | no disponible | Apache 2.0 | safetensors, GGUF | Mismo linaje y receta; menor capacidad |
| Modelos de clase 4B | ~4 B | no disponible | variable | variable | Referencia comparativa citada por el autor en el radar |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas concretas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con corpus web (Ultra-FineWeb), es previsible que herede sesgos presentes en esos datos.
- Riesgo de alucinación: inherente a modelos de este tamaño; la capacidad de conocimiento general es limitada frente a modelos mayores, como refleja el propio radar del autor.
- Idiomas: solo inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: aunque se etiqueta como "long-context", no se publica la longitud exacta, por lo que debe validarse empíricamente antes de confiar en ventanas muy amplias.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento y de los pesos derivados.
- Producción: el repositorio GGUF pertenece a un usuario tercero (Riyan200324200324) y no al organización oficial OpenBMB; se recomienda verificar la integridad de los pesos y, si es posible, usar la versión oficial.
- Madurez: con 77 descargas y 0 likes en el momento de la ficha, la adopción es muy baja; no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Riyan200324200324/MiniCPM5-2B-GGUF
- Modelo oficial MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Informe técnico MiniCPM (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- Referencia arXiv 2602.09003: https://arxiv.org/abs/2602.09003
- Repositorio GitHub OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
