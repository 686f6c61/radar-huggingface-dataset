# AutomatosX/AX-Kimi-K3-MLX-AXQ-2bit

## Resumen

AX-Kimi-K3-MLX-AXQ-2bit es un paquete experimental de cuantización AXQ a 2 bits del modelo Kimi-K3 de Moonshot AI, adaptado para ejecutarse en Apple Silicon mediante la librería MLX. El modelo base, Kimi-K3, es un MoE (Mixture of Experts) nativamente multimodal con 2,78 billones de parámetros totales y 104 mil millones de parámetros activos, que emplea Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) para lograr una ventana de contexto de 1 millón de tokens. Este pack, creado por AutomatosX, se centra exclusivamente en la ruta de lenguaje; la parte de visión (MoonViT-V2) se mantiene en BF16 y no se incluye en la conversión.

La relevancia de este lanzamiento radica en explorar los límites de la cuantización extrema (2 bits) sobre un modelo de escala masiva, permitiendo su ejecución en hardware de consumo de Apple con memoria unificada, aunque con importantes advertencias: es una versión no certificada, pensada solo para curiosidad técnica o hobby, y requiere carga por streaming debido al tamaño del repositorio (297,7 GB). No se recomienda su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,78 billones (2.78T) |
| Parametros activos | 104 mil millones (104B) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | AXQ 2-bit (unico disponible; sin MXFP4) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | other (Kimi K3 License, copiada en el paquete) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Kimi-K3 es un MoE nativo multimodal que combina un codificador de vision (MoonViT-V2) con un modelo de lenguaje de 2,78T parametros totales y 104B activos. Su arquitectura incorpora dos innovaciones clave: Kimi Delta Attention (KDA), un mecanismo de atencion que reduce el coste computacional en contextos largos, y Attention Residuals (AttnRes), que mejora la estabilidad del entrenamiento y la calidad de la representacion. El modelo fue entrenado con cuantizacion nativa MXFP4 mediante QAT (Quantization-Aware Training), lo que significa que los pesos ya estan optimizados para representacion de baja precision.

Este pack de AutomatosX aplica una cuantizacion adicional AXQ a 2 bits sobre los pesos ya cuantizados en MXFP4, reduciendo drasticamente el tamaño en memoria a costa de una posible perdida de fidelidad. La conversion se realizo con un SHA especifico del codigo de MLX y requiere la libreria mlx-vlm para la parte de vision, aunque esta no se incluye en el paquete. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto en ingles y chino, con soporte para razonamiento, codigo y matematicas (capacidades heredadas del modelo base Kimi-K3).
- Ventana de contexto de 1 millon de tokens, util para tareas que requieren comprension de documentos extensos o conversaciones de multiples turnos.
- Arquitectura MoE con 104B parametros activos, lo que permite un rendimiento relativamente eficiente en inferencia comparado con un modelo denso del mismo tamaño total.
- No incluye la parte de vision en este paquete; la modalidad visual queda fuera del alcance de esta conversion.
- No se especifica soporte para tool calling o function calling en la informacion disponible.
- Capacidad multilingue limitada a ingles y chino.

## Casos de uso

- Experimentacion con cuantizacion extrema: este paquete es un banco de pruebas para evaluar el impacto de la cuantizacion a 2 bits en un MoE de gran escala, permitiendo a investigadores medir la degradacion de calidad frente a versiones con mayor precision.
- Ejecucion local en Apple Silicon: gracias a MLX y a la cuantizacion 2-bit, es posible cargar un modelo de 2,78T en equipos con memoria unificada de 128 GB o superior, algo inviable con los pesos originales en BF16.
- Prototipado de aplicaciones de chat en ingles y chino: para desarrolladores que necesiten probar rapidamente capacidades de generacion de texto con contexto largo en entornos sin GPU dedicada.
- Investigacion sobre eficiencia de MoE: analizar como se comporta el enrutamiento de expertos cuando los pesos estan extremadamente cuantizados, y si la esparsidad del MoE mitiga parte de la perdida de precision.
- Desarrollo de herramientas de analisis de documentos largos: el contexto de 1M tokens permite procesar libros completos, informes extensos o historiales de conversacion, aunque con la salvedad de la calidad reducida por la cuantizacion.
- Educacion y divulgacion: como ejemplo de tecnicas de compresion de modelos y de los compromisos entre tamaño, velocidad y calidad en sistemas de IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paquete es experimental y no certificado, por lo que no existen mediciones oficiales de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta cuantizacion especifica. Se recomienda consultar los benchmarks del modelo base Kimi-K3 en su pagina oficial para una referencia de capacidades sin cuantizar.

## Requisitos de hardware

- Requiere Apple Silicon (M1, M2, M3, M4 o posteriores) con memoria unificada. El tamaño del repositorio es de 297,7 GB, por lo que se necesita al menos 128 GB de RAM unificada, y probablemente 192 GB o más para una carga comoda.
- La cuantizacion a 2 bits reduce el tamaño de los pesos, pero al ser un MoE con 2,78T parametros totales, el modelo completo no cabe en memoria de una sola vez; la model card indica que se requiere "stream" (carga por partes).
- No es compatible con GPUs NVIDIA o AMD; MLX esta diseñado exclusivamente para Apple Silicon.
- Para la parte de vision (no incluida en este pack) se necesitaria mlx-vlm y el codificador MoonViT-V2 en BF16, lo que aumentaria los requisitos de memoria.
- Opciones de despliegue: mediante mlx-lm (libreria de MLX para generacion de texto) y posiblemente con herramientas como Ollama si se adapta el formato, aunque no se menciona soporte explicito.
- No se dispone de datos de latencia o throughput para esta configuracion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El pack es una variante cuantizada de Kimi-K3, y no existen otros paquetes MLX de modelos de escala similar (2,78T) con cuantizacion 2-bit publicados en el momento de redactar esta ficha. Se podria comparar con el propio Kimi-K3 en su formato original (BF16 o MXFP4), pero los datos de rendimiento relativo no estan disponibles.

## Limitaciones y advertencias

- Paquete experimental y no certificado: el autor indica explicitamente que no se certificara en esta revision y que es solo para hobby o curiosidad.
- Cuantizacion a 2 bits: la perdida de precision es severa y puede provocar degradacion significativa en tareas de razonamiento, generacion de codigo o matematicas, asi como un aumento de alucinaciones.
- Sin soporte de vision: aunque el modelo base es multimodal, este pack solo incluye la ruta de lenguaje; la parte visual queda fuera.
- Idiomas limitados: solo ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia restrictiva: la licencia "Kimi K3 License" no es una licencia open source estandar; es necesario revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Requiere streaming: el tamaño del modelo impide una carga completa en memoria, lo que complica el despliegue y puede afectar a la latencia.
- Sin MTP (Multi-Token Prediction): a diferencia de otras versiones, este paquete no incluye la prediccion de multiples tokens, lo que podria reducir la velocidad de generacion.
- No apto para produccion: debido a su naturaleza experimental y a la falta de certificacion, no se recomienda su uso en entornos criticos o con requisitos de fiabilidad.

## Enlaces

- HuggingFace del paquete: https://huggingface.co/AutomatosX/AX-Kimi-K3-MLX-AXQ-2bit
- Repositorio GitHub con el port MLX de Kimi-K3: https://github.com/PipeNetwork/kimi-k3-mlx
- Blog de HuggingFace sobre Kimi K3 (MXFP4 y open weights): https://huggingface.co/blog/ResterChed/kimi-k3-model-overview-mxfp4-quantization-open-wei
- Pagina oficial de Kimi K3: https://www.kimi.ai/ai-models/kimi-k3
- Coleccion de modelos MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
