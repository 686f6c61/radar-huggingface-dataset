# openbmb/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de tipo Transformer con 2.516.756.480 parámetros (aproximadamente 2,5 mil millones), desarrollado por OpenBMB como segundo miembro de la familia MiniCPM5, tras MiniCPM5-1B. Está diseñado específicamente para despliegue local, en dispositivo (on-device) y en entornos con recursos limitados, y la versión aquí documentada se distribuye en formato GGUF para su uso con llama.cpp. El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo se posiciona, según su model card, como estado del arte de código abierto en la clase de 2B, manteniéndose competitivo frente a modelos de la clase 4B y mostrando ventajas en tareas de código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas. Soporta los idiomas inglés y chino, e incorpora capacidades de tool calling y contexto largo, lo que lo hace relevante para pipelines de agentes y asistentes embebidos.

La relevancia actual de MiniCPM5-2B radica en su relación entre tamaño y capacidades: un modelo de apenas 2,5B parámetros que puede ejecutarse en hardware de consumo y en dispositivos edge, pero que incorpora funcionalidades tradicionalmente reservadas a modelos mucho mayores, como llamada a funciones y razonamiento multi-paso. La disponibilidad en GGUF y su integración con llama.cpp facilitan su adopción inmediata en entornos de producción con recursos acotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (el repositorio incluye pesos cuantizados en formato GGUF; niveles concretos no especificados) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se publica por separado en safetensors |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso que escala la misma receta de entrenamiento empleada en MiniCPM5-1B, según indica la model card. No se trata de una arquitectura MoE ni híbrida: todos los parámetros están activos en cada paso de inferencia, lo que simplifica el despliegue y reduce la complejidad de gestión de memoria en comparación con modelos dispersos. No se detallan en la información disponible innovaciones como decodificación especulativa o atención lineal.

El entrenamiento se apoya en un conjunto de datasets propios de OpenBMB: Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de datasets específicos de SFT (supervised fine-tuning) y RL (refuerzo) sugiere un pipeline de post-entrenamiento en dos fases, con datos dedicados a agentes y tool calling. No se especifica en la información proporcionada el número total de tokens de entrenamiento ni la composición exacta de la mezcla.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento general y conocimiento del mundo, con rendimiento declarado competitivo frente a modelos de 4B.
- Razonamiento en código y generación de código, con ventajas declaradas sobre modelos de tamaño comparable.
- Razonamiento matemático, apoyado en el dataset UltraData-Math.
- Comprensión de contexto largo (long-context), según las etiquetas y la model card.
- Tool calling / function calling, con datasets de entrenamiento específicos para agentes (UltraData-SFT-Agent-2609).
- Tareas agénticas y razonamiento multi-paso.
- Despliegue en dispositivo (edge-ai) y local, optimizado para recursos limitados.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con llama.cpp.

## Casos de uso

- Asistentes locales en dispositivo: el modelo puede ejecutarse en portátiles y equipos de sobremesa sin GPU dedicada de gama alta, gestionando conversaciones multi-turno en inglés o chino con una huella de memoria reducida gracias a sus ~2,5B parámetros.
- Automatización de atención al cliente en entornos con recursos acotados: su soporte de tool calling permite conectar el modelo a sistemas de ticketing o bases de conocimiento mediante llamadas a funciones, manteniendo la inferencia en local por motivos de privacidad.
- Generación de código en pipelines de CI/CD: el modelo puede integrarse en herramientas de revisión o generación de parches, con la ventaja de que su tamaño permite ejecutarlo en runners estándar sin aceleradores dedicados.
- Agentes multi-paso para tareas de automatización: gracias a su entrenamiento con datos agénticos (UltraData-SFT-Agent-2609), puede planificar y ejecutar secuencias de llamadas a herramientas en flujos de trabajo como extracción de datos o consultas a APIs.
- Procesamiento de documentos largos: su capacidad de contexto largo permite resumir o extraer información de documentos extensos en inglés y chino, útil en gestión documental o análisis legal preliminar.
- Tutoría y asistencia educativa en matemáticas: el modelo puede resolver y explicar problemas paso a paso, adecuado para aplicaciones de aprendizaje en dispositivos de bajo coste.
- Prototipado rápido y experimentación: al estar disponible en GGUF y ser compatible con llama.cpp, permite a investigadores desplegar y evaluar el modelo en minutos con Ollama o llama.cpp, sin infraestructura de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente un gráfico radar cualitativo que compara el modelo con modelos de la clase 4B en dimensiones como razonamiento de código, matemáticas, seguimiento de instrucciones, conocimiento general, contexto largo y uso de herramientas, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, un modelo de ~2,5B parámetros requiere aproximadamente 1,5-2 GB de memoria para los pesos; en 8 bits, en torno a 2,5-3 GB; en FP16, unos 5 GB. Estas cifras son estimaciones basadas en el número de parámetros y no en datos oficiales publicados.
- GPU recomendadas: el modelo está pensado para despliegue en dispositivo y local; cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon mediante llama.cpp. Para despliegue en servidor, una A100 o H100 no son necesarias, aunque pueden usarse para servir múltiples instancias.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo con al menos 4-6 GB de VRAM, dependiendo de la cuantización y de la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque la información proporcionada no confirma soporte oficial en esos frameworks.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B | ~2,5B | no disponible | Apache 2.0 | GGUF, safetensors | Estado del arte declarado en la clase 2B; competitivo con modelos 4B |
| MiniCPM5-1B | ~1B | no disponible | no disponible | no disponible | Modelo hermano de la misma familia, misma receta de entrenamiento |
| Modelos de la clase 4B (sin especificar) | ~4B | no disponible | no disponible | no disponible | Referencia cualitativa en la model card; sin cifras comparativas publicadas |

No se dispone de datos numéricos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a lo indicado en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; como todo modelo entrenado con datos web, es probable que herede sesgos de sus corpus de entrenamiento (Ultra-FineWeb y derivados).
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a modelos de este tamaño, especialmente en tareas de conocimiento factual.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- Longitud de contexto: no se especifica la ventana máxima en la información proporcionada, lo que impide planificar su uso en documentos muy extensos sin verificación previa.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones adicionales, siempre que se conserve el aviso de licencia.
- Caveats para producción: al ser un modelo de ~2,5B parámetros, su capacidad de razonamiento complejo y de seguimiento de instrucciones largas es inferior a la de modelos de mayor tamaño; conviene validar su comportamiento en tareas críticas y considerar el uso de tool calling para delegar operaciones que requieran precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Modelo base (safetensors): https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo hermano MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Informe técnico MiniCPM (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- Paper adicional (arXiv 2602.09003): https://arxiv.org/abs/2602.09003
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Documentación MiniCPM Wiki (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
