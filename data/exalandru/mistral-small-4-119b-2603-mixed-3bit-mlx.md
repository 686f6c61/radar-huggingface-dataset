# exalandru/Mistral-Small-4-119B-2603-Mixed-3bit-MLX

## Resumen

Este modelo es una cuantización de precisión mixta de aproximadamente 3 bits del modelo Mistral Small 4 119B 2603, desarrollado por Mistral AI, adaptada para ejecución en hardware Apple Silicon mediante el ecosistema MLX. La cuantización ha sido realizada por el usuario exalandru con la herramienta mlx-vlm en su versión 0.6.13, y el resultado es un checkpoint de 48.3 GB que reduce significativamente los requisitos de memoria del modelo original (119B parámetros), manteniendo la mayoría de sus capacidades multimodales y de razonamiento.

El modelo base Mistral Small 4 es un modelo híbrido que unifica capacidades de instrucción, razonamiento y generación de código en una única arquitectura. Con 119B parámetros totales y solo 6.5B activos gracias a su diseño de mezcla de expertos (MoE), ofrece un equilibrio entre rendimiento y eficiencia computacional. Esta versión cuantizada permite ejecutar el modelo en Macs con memoria unificada, lo que democratiza el acceso a un modelo de gran tamaño para desarrolladores e investigadores que no disponen de clústeres GPU dedicados.

La relevancia actual de este modelo radica en su capacidad para ejecutar un LLM multimodal de 119B parámetros en hardware local de consumo, algo que hasta hace poco requería infraestructura profesional. La cuantización a 3 bits introduce una ligera degradación en la calidad de las respuestas, pero a cambio ofrece una experiencia de inferencia fluida en Apple Silicon, convirtiéndolo en una opción atractiva para prototipado, desarrollo de asistentes y experimentación con modelos de gran escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) híbrida, basada en transformer con atención y capas de expertos |
| Parametros totales | 119B (modelo base); 14.151.498.752 en el checkpoint cuantizado |
| Parametros activos | 6.5B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta de ~3 bits (mixed 3-bit) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo original Mistral Small 4 119B 2603 emplea una arquitectura híbrida que combina atención tradicional con capas de mezcla de expertos (MoE), donde solo se activan 6.5B de los 119B parámetros por token procesado. Esta configuración permite mantener un alto rendimiento con un coste computacional reducido en comparación con un modelo denso del mismo tamaño. El modelo fue entrenado por Mistral AI con un enfoque que unifica tres familias de modelos: instruct, razonamiento (anteriormente Magistral) y Devstral, lo que le confiere capacidades versátiles para tareas de conversación, análisis lógico y generación de código.

La cuantización presentada en este repositorio no implica un reentrenamiento, sino una conversión de los pesos del modelo original a una representación de precisión mixta de aproximadamente 3 bits, realizada con la librería mlx-vlm. Esta técnica reduce el tamaño del checkpoint de los aproximadamente 230 GB originales a 48.3 GB, optimizando el uso de memoria y mejorando la velocidad de inferencia en Apple Silicon. La cuantización preserva las capacidades multimodales del modelo (lectura de imágenes) y su soporte para tool calling, aunque puede introducir pequeñas pérdidas de precisión en tareas de razonamiento complejo o generación de código extenso.

## Capacidades

- Generación de texto y conversación multi-turno en 24 idiomas, con respuesta en el idioma del usuario.
- Razonamiento lógico y matemático, incluyendo resolución de problemas paso a paso.
- Generación de código en múltiples lenguajes de programación, gracias a su entrenamiento en la familia Devstral.
- Lectura y comprensión de imágenes (multimodal), aunque no puede generar imágenes ni procesar audio o vídeo.
- Tool calling / function calling: puede invocar herramientas externas para obtener información actualizada o realizar acciones, según las instrucciones del sistema.
- Modo de razonamiento flexible: puede alternar entre respuestas directas y un modo de pensamiento más profundo según la solicitud.
- Capacidad de seguir instrucciones complejas y mantener coherencia en diálogos largos.

## Casos de uso

- Asistente virtual local en Mac: al ejecutarse en Apple Silicon, puede integrarse en aplicaciones de escritorio para ofrecer un asistente personal con capacidades multimodales, sin depender de servicios en la nube.
- Análisis de documentos con imágenes: gracias a su capacidad de leer imágenes, puede extraer información de capturas de pantalla, gráficos o diagramas, útil en entornos de investigación o documentación técnica.
- Generación de código asistida: desarrolladores pueden usarlo como copiloto de programación, aprovechando su soporte para tool calling para integrarlo en editores de código o pipelines de CI/CD.
- Prototipado rápido de agentes conversacionales: su licencia Apache 2.0 y su tamaño reducido permiten experimentar con agentes que requieren razonamiento multi-paso y acceso a herramientas, sin incurrir en costes de API.
- Traducción y procesamiento multilingüe: al soportar 24 idiomas, es adecuado para tareas de traducción automática, resumen de textos y análisis de sentimiento en contextos multilingües.
- Educación y divulgación: investigadores y estudiantes pueden desplegar este modelo en hardware local para estudiar el comportamiento de un LLM de gran escala, realizar pruebas de alucinación o desarrollar sistemas de evaluación, gracias a su facilidad de uso con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (M1, M2, M3, M4 o superiores), ya que el formato MLX está optimizado para la memoria unificada de estos chips.
- Memoria unificada estimada: el checkpoint ocupa 48.3 GB en disco, por lo que se recomienda al menos 64 GB de RAM unificada para cargar el modelo y dejar margen para el sistema operativo y las operaciones de inferencia. Para un uso cómodo con contextos largos o procesamiento de imágenes, se recomienda 128 GB.
- GPUs compatibles: no aplicable a GPUs NVIDIA o AMD; el modelo solo se ejecuta en Apple Silicon mediante el framework MLX.
- Opciones de despliegue: se puede utilizar con oMLX (interfaz gráfica) o directamente con la librería mlx-vlm mediante la línea de comandos. También es posible integrarlo en aplicaciones personalizadas usando las API de MLX.
- Latencia y throughput: no se proporcionan datos específicos, pero al tratarse de una cuantización de 3 bits en hardware Apple Silicon, se espera una velocidad de generación de entre 10 y 30 tokens por segundo en chips de gama alta (M2 Max o M3 Ultra), dependiendo de la carga y el contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Plataforma | Licencia |
|---|---|---|---|---|---|---|
| Mistral Small 4 119B 2603 (original) | 119B | 6.5B | no disponible | FP16/BF16 | GPU (CUDA) | Apache 2.0 |
| Este modelo (Mixed 3bit MLX) | 119B | 6.5B | no disponible | ~3 bits mixto | Apple Silicon (MLX) | Apache 2.0 |
| Llama 3.1 70B (cuantizado MLX) | 70B | 70B | 128K | 4 bits | Apple Silicon (MLX) | Llama 3.1 Community License |

La comparativa muestra que este modelo ofrece una capacidad de 119B parámetros con solo 6.5B activos, lo que lo hace más eficiente que un modelo denso de 70B en términos de coste por token, aunque requiere más memoria total. La cuantización a 3 bits reduce el tamaño a la mitad de lo que ocuparía una versión de 4 bits de un modelo denso de 70B, pero a cambio puede tener una ligera pérdida de fidelidad en tareas de razonamiento complejo. La licencia Apache 2.0 es más permisiva que la de Llama, lo que facilita su uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- La cuantización de 3 bits puede degradar la calidad de las respuestas en tareas que requieren razonamiento matemático avanzado, generación de código largo o comprensión sutil de contexto, en comparación con el modelo original en precisión completa.
- El modelo solo funciona en Apple Silicon; no es compatible con GPUs NVIDIA, AMD o hardware x86 convencional, lo que limita su portabilidad.
- No puede generar imágenes ni procesar audio o vídeo, a pesar de ser multimodal.
- El sistema prompt del modelo base indica que su conocimiento se actualizó hasta noviembre de 2024, por lo que no dispone de información posterior a esa fecha.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo puede generar contenido sesgado o alucinaciones, especialmente en temas controvertidos o con poca información disponible. Se recomienda validar las salidas en aplicaciones críticas.
- El tamaño del checkpoint (48.3 GB) requiere una Mac con al menos 64 GB de RAM unificada; en máquinas con menos memoria, el modelo podría no cargar o experimentar una degradación severa del rendimiento.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/exalandru/Mistral-Small-4-119B-2603-Mixed-3bit-MLX
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Documentación oficial de Mistral Small 4: https://docs.mistral.ai/models/mistral-small-4-0-26-03
- Anuncio de Mistral Small 4: https://mistral.ai/news/mistral-small-4/
- Referencia NIM de NVIDIA para Mistral Small 4: https://docs.api.nvidia.com/nim/reference/mistralai-mistral-small-4-119b-2603
