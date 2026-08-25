# AtomicChat/Qwen3.8-27B-MLX-2bit-g32-CLIP-DWQ

## Resumen

Qwen3.8-27B-MLX-2bit-g32-CLIP-DWQ es una adaptación cuantizada a 2 bits del modelo multimodal Qwen3.8-27B de Alibaba, realizada por AtomicChat para ejecutarse en Apple Silicon mediante el framework MLX. El modelo original, lanzado en agosto de 2026, es un transformer denso de 27.800 millones de parámetros que procesa texto, imágenes y vídeo, con una ventana de contexto de 262.144 tokens y licencia Apache 2.0. Esta versión MLX reduce drásticamente el tamaño de los pesos para permitir su uso local en hardware de consumo, aunque con una pérdida de precisión inherente a la cuantización de 2 bits.

Cabe señalar una discrepancia: el archivo safetensors del repositorio indica 3.825.044.720 parámetros (~3,8 mil millones), muy inferior a los 27,8 mil millones que sugiere el nombre. Esto podría deberse a un error en el registro, a una versión destilada o a una partición incompleta de los pesos. No se dispone de información adicional que aclare esta inconsistencia, por lo que se reporta el dato real extraído del archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen3.5/3.8 |
| Parametros totales | 3.825.044.720 (según safetensors; el nombre sugiere 27,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según fuentes externas) |
| Tipos de cuantizacion | 2-bit (g32, DWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el modelo original es Apache 2.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-27B es un transformer denso nativo multimodal que integra un codificador visual (CLIP) con un decodificador de lenguaje. Esta versión MLX aplica cuantización de 2 bits con grupos de 32 (g32) y una técnica denominada DWQ (Dynamic Weight Quantization) para reducir el tamaño de los pesos manteniendo un rendimiento aceptable. No se han publicado detalles sobre el entrenamiento de esta adaptación concreta; se trata de una conversión del modelo preentrenado, no de un reentrenamiento. El modelo base fue entrenado por Alibaba con datos multimodales y optimizado para tareas de codificación, flujos agénticos y automatización de oficina, según la documentación oficial.

## Capacidades

- Procesamiento de imágenes y texto de forma conjunta (entrada multimodal).
- Generación de texto, incluyendo respuestas conversacionales y razonamiento paso a paso.
- Comprensión de vídeo (según la descripción del modelo original).
- Soporte de tareas de codificación y generación de código a partir de capturas o descripciones.
- Capacidad para flujos de trabajo agénticos (agentic workflows) y automatización de tareas de oficina.
- Conversación multironda con contexto largo gracias a la ventana de 262.144 tokens.
- Idiomas: únicamente inglés en esta versión (el modelo original soporta más idiomas, pero esta adaptación declara solo "en").

## Casos de uso

- Asistente de oficina multimodal: el modelo puede analizar documentos escaneados, extraer información de tablas o gráficos y generar resúmenes o informes, aprovechando su ventana de contexto de 262.144 tokens para procesar documentos extensos.
- Generación de código a partir de imágenes: un desarrollador puede capturar una interfaz de usuario o un diagrama y pedir al modelo que genere el código correspondiente, gracias a su entrenamiento en tareas de codificación.
- Chatbot de atención al cliente con soporte visual: integrado en una aplicación de mensajería, puede recibir imágenes de productos o capturas de pantalla y responder con instrucciones o soluciones, manteniendo conversaciones largas sin perder el hilo.
- Automatización de tareas agénticas: el modelo puede actuar como agente que interpreta instrucciones en lenguaje natural y ejecuta acciones sobre herramientas (aunque no se confirma soporte explícito de tool calling, su diseño agéntico lo permite).
- Análisis de contenido visual para investigación: procesar imágenes de gráficos científicos, diagramas o fotografías y generar descripciones o análisis cuantitativos.
- Prototipado rápido de aplicaciones multimodales en Apple Silicon: al ser una versión MLX 2-bit, permite ejecutar un modelo de gran capacidad en una Mac sin GPU dedicada, ideal para desarrollo y pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las fuentes externas mencionan evaluaciones en MathVision para el modelo original, pero no se proporcionan cifras concretas para esta versión cuantizada. Se recomienda consultar la documentación del modelo base para referencias de rendimiento, teniendo en cuenta que la cuantización 2-bit degrada la precisión.

## Requisitos de hardware

- Al ser una versión MLX, está diseñada exclusivamente para Apple Silicon (M1, M2, M3, M4 y superiores).
- El tamaño del repositorio es de 11,0 GB, pero el modelo cuantizado a 2 bits con ~3,8B parámetros ocuparía aproximadamente 1 GB en memoria; sin embargo, el peso real del archivo safetensors no se ha especificado. Se recomienda un Mac con al menos 16 GB de RAM unificada para cargar el modelo y el contexto.
- No requiere GPU dedicada; la inferencia se ejecuta en la GPU integrada y la Neural Engine de Apple.
- Opciones de despliegue: MLX (librería nativa), compatible con herramientas como MLX-LM, y posiblemente con llama.cpp si se convierte a GGUF (no confirmado).
- Latencia y throughput: no disponibles; dependerán del chip concreto (M1 vs M4) y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo original Qwen3.8-27B compite con otros modelos multimodales de ~27B como Llama 3.2 Vision o InternVL, pero no hay datos de rendimiento de esta versión cuantizada. Se recomienda consultar benchmarks del modelo base para una referencia aproximada.

## Limitaciones y advertencias

- La cuantización a 2 bits introduce una pérdida significativa de precisión en tareas complejas de razonamiento, matemáticas y generación de código.
- El modelo solo soporta inglés en esta versión; no se garantiza un rendimiento adecuado en otros idiomas.
- No se especifica la licencia de esta adaptación; aunque el modelo original es Apache 2.0, AtomicChat no declara la licencia en su ficha, lo que puede generar incertidumbre legal para uso comercial.
- Riesgo de alucinaciones visuales: al procesar imágenes, el modelo puede generar descripciones inexactas o inventar detalles.
- La discrepancia en el número de parámetros (3,8B reportado vs 27,8B nominal) sugiere que el archivo safetensors podría estar incompleto o ser una versión destilada; se recomienda verificar la integridad del modelo antes de usarlo en producción.
- No se han publicado evaluaciones de seguridad o sesgos para esta versión cuantizada.

## Enlaces

- [HuggingFace - AtomicChat/Qwen3.8-27B-MLX-2bit-g32-CLIP-DWQ](https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-2bit-g32-CLIP-DWQ)
- [Atomic Chat - Run Qwen3.8-27B Locally](https://atomic.chat/models/qwen3-8-27b)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [HuggingFace - Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [QwenCloud - Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [GitHub - QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
