# LiquidAI/LFM2.5-VL-3B

## Resumen

LFM2.5-VL-3B es un modelo de visión-lenguaje (VLM) de 3.100 millones de parámetros desarrollado por Liquid AI, presentado el 12 de agosto de 2026. Está diseñado específicamente para ejecutarse en el edge: teléfonos, portátiles y GPUs individuales, evitando la dependencia de centros de datos. El modelo destaca por sus capacidades de grounding (localización de objetos en imágenes), comprensión de pantallas y documentos, y function calling, todo ello con una latencia reducida al ser un modelo no razonador que responde directamente sin cadenas de pensamiento explícitas.

Es la evolución del LFM2-VL-3B, con mejoras significativas en tareas de interfaz de usuario, grounding, function calling y soporte de múltiples imágenes. Su licencia es de código abierto (aunque el tipo exacto no se especifica en la información disponible), y los pesos están disponibles en formato safetensors. El modelo está orientado a desarrolladores que necesitan capacidades multimodales en dispositivos con recursos limitados, manteniendo un rendimiento competitivo en tareas de comprensión visual y ejecución de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.1 mil millones (3.1B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los tags de HuggingFace sugieren ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi, pero no hay confirmacion oficial) |
| Licencia | no disponible (tag "license:other" en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna del modelo en la informacion disponible. Se sabe que es un modelo de vision-lenguaje de 3.1B parametros, no razonador, lo que significa que genera respuestas directas sin un modo de "thinking" explicito, priorizando la baja latencia para aplicaciones en tiempo real. Es una evolucion del LFM2-VL-3B, con mejoras en comprension de pantallas, grounding, function calling y entrada de multiples imagenes.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se utilizaron tecnicas como RLHF o DPO. Tampoco se conocen innovaciones arquitectonicas especificas mas alla de las mencionadas en las capacidades.

## Capacidades

- Comprension de imagenes y documentos: puede extraer informacion de imagenes, diagramas, capturas de pantalla y documentos escaneados.
- Grounding visual: localiza y referencia objetos especificos dentro de una imagen, devolviendo coordenadas o regiones.
- Comprension de pantallas (screen understanding): interpreta interfaces de usuario, elementos de UI y su disposicion, util para automatizacion de tareas.
- Function calling: puede invocar funciones externas o APIs, integrándose en flujos de trabajo agénticos.
- Entrada de multiples imagenes: acepta varias imagenes en una misma consulta, permitiendo comparaciones o analisis conjunto.
- No razonador: responde directamente sin cadenas de pensamiento, lo que reduce la latencia en comparacion con modelos que generan razonamiento intermedio.
- Multilingue: aunque no hay confirmacion oficial, los tags de HuggingFace indican soporte para mas de 15 idiomas, incluyendo español, ingles, frances, aleman, chino, japones, etc.

## Casos de uso

- Automatizacion de interfaces de usuario: el modelo puede interpretar capturas de pantalla y generar acciones (clics, relleno de formularios) mediante function calling, permitiendo construir agentes que operan aplicaciones moviles o web de forma autonoma.
- Asistente de soporte tecnico con imagenes: un usuario envia una captura de pantalla de un error; el modelo identifica el problema, localiza el elemento relevante y sugiere una solucion, todo en el dispositivo sin conexion a la nube.
- Analisis de documentos en movil: escanear facturas, recibos o contratos y extraer campos clave (fechas, importes, nombres) gracias a su comprension de documentos, funcionando en un telefono con recursos limitados.
- Accesibilidad para personas con discapacidad visual: describir el contenido de una imagen o escena capturada con la camara del dispositivo, con grounding para senalar objetos especificos ("hay una taza a la izquierda").
- Agente de compras por imagen: el usuario fotografia un producto y el modelo identifica el articulo, busca informacion en una base de datos mediante function calling y responde con detalles o recomendaciones.
- Moderacion de contenido visual: analizar imagenes en tiempo real en un dispositivo edge para detectar contenido inapropiado, con capacidad de localizar la region problematica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos con otros modelos en tareas como MMLU, HumanEval, GSM8K o benchmarks especificos de vision-lenguaje (VQAv2, TextVQA, etc.). La unica referencia cualitativa es la afirmacion de Liquid AI de que supera a su predecesor LFM2-VL-3B en comprension de pantallas, grounding, function calling y multi-imagen, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 3.1B parametros, en precision FP16 ocuparia aproximadamente 6.2 GB de VRAM. Con cuantizacion INT8 se reduciria a ~3.1 GB, y con INT4 a ~1.6 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: puede ejecutarse en GPUs consumer como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Tambien es compatible con Apple Silicon (M1/M2/M3) y CPUs modernas mediante frameworks de inferencia optimizados.
- Si cabe en consumer GPU: si, en GPUs con al menos 4 GB de VRAM si se usa cuantizacion, y en 8 GB sin cuantizar.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, es compatible con frameworks como vLLM, llama.cpp, Ollama, TGI y Transformers de HuggingFace. Para edge, se puede usar ONNX Runtime o Core ML para dispositivos moviles.
- Latencia y throughput: no se han publicado datos oficiales. Dado su tamano y diseño no razonador, se espera una latencia de decenas de milisegundos en GPUs modernas, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de una comparativa oficial con otros modelos de la misma categoria. Como referencia cualitativa, se puede comparar con su predecesor LFM2-VL-3B y con otros VLMs de tamano similar como Phi-3.5-vision (4.2B) o MiniCPM-V 2.6 (8B), pero no hay datos de rendimiento publicados para establecer una tabla comparativa fiable. La informacion disponible solo indica que LFM2.5-VL-3B mejora a LFM2-VL-3B en las areas mencionadas.

## Limitaciones y advertencias

- Al ser un modelo de 3.1B parametros, su capacidad de razonamiento complejo y conocimiento general es limitada en comparacion con modelos mucho mas grandes (70B+). Puede fallar en tareas que requieren inferencia profunda o conocimiento especializado.
- Riesgo de alucinacion visual: como todos los VLMs, puede generar descripciones incorrectas o inventar detalles de una imagen, especialmente en escenas complejas o con objetos poco comunes.
- No se ha publicado informacion sobre sesgos o evaluaciones de seguridad. Se recomienda realizar pruebas especificas antes de desplegar en produccion.
- La licencia exacta no esta especificada (tag "license:other" en HuggingFace). Es necesario verificar los terminos de uso antes de utilizarlo comercialmente.
- No se conocen los idiomas soportados de forma oficial, aunque los tags sugieren una amplia cobertura. La calidad puede variar entre idiomas.
- No se dispone de informacion sobre la longitud de contexto, lo que limita la planificacion de aplicaciones que requieran dialogos largos o documentos extensos.

## Enlaces

- [HuggingFace - LiquidAI/LFM2.5-VL-3B](https://huggingface.co/LiquidAI/LFM2.5-VL-3B)
- [Blog oficial de Liquid AI](https://www.liquid.ai/blog/lfm2-5-vl-3b)
- [Documentacion de Liquid AI](https://docs.liquid.ai/lfm/models/lfm25-vl-3b)
- [Articulo en Unite.ai](https://www.unite.ai/liquid-ai-ships-lfm2-5-vl-3b-for-faster-vision-language-ai-on-the-edge/)
- [Analisis en LLM Stats](https://llm-stats.com/blog/research/lfm-2.5-vl-3b-launch)
