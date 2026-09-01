# DIYIN/Youtu-Parsing

## Resumen

Youtu-Parsing es un modelo especializado en el parseo de documentos desarrollado por el laboratorio Youtu de Tencent. Se construye sobre el modelo base Youtu-LLM-2B, un LLM ligero de 2.000 millones de parámetros, al que se le añade un codificador visual dinámico de estilo NaViT y un marco guiado por prompts para abordar tareas de comprensión y extracción de contenido en documentos. El modelo es capaz de localizar texto, restaurar el orden de lectura, reconocer fórmulas matemáticas (convirtiéndolas a LaTeX), detectar tablas (generando HTML) y convertir gráficos a formatos estructurados como tablas Markdown o diagramas Mermaid.

La relevancia de Youtu-Parsing radica en su eficiencia: incorpora un mecanismo de decodificación paralela que acelera la inferencia entre 5 y 11 veces, y una paralelización de consultas que añade un factor adicional de 2x. Esto lo hace práctico para aplicaciones reales de análisis documental a gran escala. El modelo se distribuye con una licencia personalizada (youtu-parsing) y está disponible en Hugging Face, con soporte para la librería transformers y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador visual dinámico (NaViT-style) + LLM base Youtu-LLM-2B |
| Parametros totales | 2.515.984.240 (2,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | youtu-parsing (licencia personalizada de Tencent, ver enlace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Youtu-Parsing se basa en el modelo Youtu-LLM-2B, un LLM ligero de 2.000 millones de parámetros. Sobre esta base se incorpora un codificador visual dinámico de tipo NaViT que procesa imágenes de resolución variable, extrayendo características compartidas del documento. El modelo utiliza un marco guiado por prompts para el análisis de diseño y la decodificación regional: el LLM recibe instrucciones específicas para cada tipo de elemento (texto, tabla, fórmula, gráfico) y genera la salida estructurada correspondiente.

El entrenamiento es un fine-tuning del modelo base, aunque no se proporcionan detalles sobre el volumen de datos, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La innovación principal reside en el mecanismo de decodificación paralela: permite inferir múltiples tokens simultáneamente (token parallelism) y combinar varias consultas para maximizar el rendimiento (query parallelism), logrando aceleraciones de 5-11x y un factor adicional de 2x respectivamente.

## Capacidades

- Parseo de documentos completos: localiza regiones de texto con precisión a nivel de píxel y restaura el orden lógico de lectura en diseños complejos (columnas, secciones, páginas).
- Reconocimiento de texto: funciona en escenarios diversos, incluyendo texto impreso, manuscrito y artístico.
- Reconocimiento de fórmulas matemáticas: convierte expresiones matemáticas a formato LaTeX.
- Reconocimiento de tablas: detecta tablas y las convierte a HTML estructurado.
- Reconocimiento de gráficos: transforma gráficos en tablas Markdown, mapas mentales y diagramas de flujo en formato Mermaid.
- Decodificación paralela: acelera la inferencia mediante token parallelism y query parallelism, reduciendo la latencia en producción.
- Integración con transformers: se puede usar directamente con la librería transformers mediante la clase `YoutuOCRParserHF`.

## Casos de uso

- Digitalización de documentos históricos: el modelo puede procesar imágenes de manuscritos o impresos antiguos, extrayendo texto y preservando el orden de lectura, lo que facilita la creación de archivos digitales buscables.
- Extracción de datos de facturas y recibos: al reconocer tablas y texto, permite automatizar la captura de información estructurada (números, fechas, importes) en sistemas de contabilidad.
- Análisis de artículos científicos: convierte fórmulas matemáticas a LaTeX y tablas a HTML, facilitando la reutilización de contenido en publicaciones o bases de datos académicas.
- Generación de documentación técnica: a partir de capturas de pantalla o diagramas, el modelo produce representaciones en Mermaid o Markdown, útiles para documentar arquitecturas de software o procesos.
- Accesibilidad: transforma documentos escaneados en texto legible por lectores de pantalla, mejorando el acceso a la información para personas con discapacidad visual.
- Automatización de flujos de trabajo empresariales: integrado en pipelines de procesamiento de documentos, puede clasificar y extraer contenido de formularios, contratos o informes, reduciendo el trabajo manual.
- Indexación de contenido visual: al convertir gráficos y tablas en texto estructurado, permite indexar y buscar información dentro de imágenes en motores de búsqueda internos.

## Benchmarks y rendimiento

La model card menciona evaluaciones en los benchmarks OminiDocBench v1.5 y olmOCR, pero no se proporcionan resultados numéricos en la información disponible. Las figuras correspondientes se muestran como imágenes en el README, sin datos tabulados. Por tanto, no se pueden presentar cifras concretas. Se recomienda consultar el paper técnico (arXiv:2601.20430) para obtener métricas detalladas.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación oficial.
- Al tratarse de un modelo de 2,5 B de parámetros, es probable que quepa en GPUs de consumo con al menos 8 GB de VRAM si se aplica cuantización, pero no hay datos confirmados.
- El código de ejemplo requiere instalar flash-attn2, lo que sugiere que se espera una GPU NVIDIA con soporte CUDA.
- Opciones de despliegue: se puede usar con transformers directamente, o mediante el paquete `youtu_hf_parser` que proporciona la clase `YoutuOCRParserHF`. No se mencionan integraciones con vLLM, Ollama o llama.cpp.
- La latencia y el throughput no están documentados, aunque el mecanismo de decodificación paralela indica una mejora significativa frente a la decodificación autoregresiva estándar.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de parseo de documentos como MinerU, olmOCR o PaddleOCR. La documentación menciona que se agradece a estos proyectos por proporcionar pesos y benchmarks, pero no se ofrecen tablas comparativas. Se recomienda consultar el paper para ver comparaciones con estos sistemas.

## Limitaciones y advertencias

- La licencia es personalizada (youtu-parsing) y no es una licencia open source estándar; es necesario revisar los términos en el enlace proporcionado antes de usarlo comercialmente.
- No se documentan sesgos específicos, pero al ser un modelo entrenado principalmente para documentos, puede tener un rendimiento inferior en imágenes no documentales o con idiomas poco representados.
- La longitud de contexto no está especificada, lo que puede limitar el procesamiento de documentos muy extensos en una sola pasada.
- El modelo depende de un codificador visual dinámico; su rendimiento puede degradarse con imágenes de baja resolución o muy ruidosas.
- No se proporcionan garantías sobre la precisión en documentos con diseños extremadamente complejos o con mezclas de idiomas.
- El uso en producción requiere la instalación de dependencias adicionales como flash-attn2, lo que puede complicar el despliegue en entornos sin GPU NVIDIA.

## Enlaces

- Hugging Face (modelo original): https://huggingface.co/tencent/Youtu-Parsing
- Hugging Face (repo del autor DIYIN): https://huggingface.co/DIYIN/Youtu-Parsing
- GitHub: https://github.com/TencentCloudADP/youtu-parsing
- Paper técnico (arXiv): https://arxiv.org/abs/2601.20430
- Paper Youtu-VL (relacionado): https://arxiv.org/abs/2601.19798
- Paper Youtu-LLM (relacionado): https://arxiv.org/abs/2512.24618
- ModelScope: https://www.modelscope.cn/models/Tencent-YouTu-Research/Youtu-Parsing/summary
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Tencent/Youtu-Parsing
- Licencia: https://huggingface.co/tencent/Youtu-Parsing/blob/main/LICENSE.txt
