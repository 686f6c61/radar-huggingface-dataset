# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.8-27B, desarrollado por AutomatosX para ejecución nativa en Apple Silicon. El modelo base es un transformer denso de 27.360 millones de parámetros lógicos con arquitectura Qwen3_5ForConditionalGeneration, que incorpora un cabezal de predicción multi-token (MTP) y un codificador de visión, lo que lo convierte en un sistema multimodal de texto e imagen. Este checkpoint aplica cuantización mixta de precisión mediante el cuantizador AXQuant (AXQ) en su clase de presupuesto de almacenamiento 4bit, manteniendo el camino de lenguaje cuantizado mientras que el cabezal MTP y la torre de visión se conservan en BF16 como sidecars opcionales.

La relevancia de este modelo radica en su adaptación específica al ecosistema MLX de Apple, permitiendo ejecutar un modelo de 27B en equipos con memoria unificada de gama alta (como MacBook Pro con chips M-series) con un tamaño de descarga de aproximadamente 18.20 GB. El checkpoint está certificado como Tier 1 por el propio autor para una revisión concreta, lo que garantiza la integridad de la conversión y la retención de calidad frente a una línea base uniforme, aunque no se reivindica aceleración MTP fuera de los perfiles autorizados. El modelo está pensado para desarrolladores que necesitan un LLM multimodal de gran tamaño en hardware local de Apple, con soporte para herramientas de inferencia como MLX-LM y AX Engine.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (dense) con MTP y vision |
| Parametros totales | 27.36B (logicos); peso cuantizado: 18.18 GB en safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262,144 tokens (configurado maximo; limite practico segun memoria unificada) |
| Tipos de cuantizacion | AXQuant mixed-precision: 4bit (87.65%), 8bit (9.15%), BF16 (3.20%); group size 64 |
| Idiomas soportados | no disponible (hereda los del modelo base Qwen3.8, no especificados en la card) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX Safetensors (no PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.360 millones de parámetros con arquitectura Qwen3_5ForConditionalGeneration, diseñado para generación de texto condicionada y procesamiento multimodal (texto e imagen). Incluye un cabezal de predicción multi-token (MTP) que permite anticipar varios tokens futuros durante la decodificación, y una torre de visión independiente que procesa entradas visuales. El checkpoint cuantizado mantiene la ruta de texto optimizada con precisión mixta, mientras que los componentes MTP y visión se conservan en BF16 como sidecars opcionales dentro del repositorio.

El proceso de cuantización utiliza AXQuant versión 1.6.2, que asigna diferentes precisiones por tensor según un plan basado en prioridades de arquitectura (sin calibración con datos reales). La distribución de pesos es: 87.65% en 4bit, 9.15% en 8bit y 3.20% en BF16, con un BPW (bits por peso) medido de 5.0667 para el modelo principal y 5.2338 incluyendo el sidecar MTP. No se han publicado detalles sobre el entrenamiento original del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO), ya que la información proporcionada se centra exclusivamente en el proceso de cuantización y conversión a MLX.

## Capacidades

- Generacion de texto y razonamiento: al ser un checkpoint del modelo Qwen3.8-27B, hereda las capacidades de generacion de texto, razonamiento logico y comprension del lenguaje del modelo base.
- Procesamiento multimodal: incluye una torre de vision preservada en BF16, lo que permite entrada de imagenes junto con texto (vision-language), aunque la card no detalla el alcance exacto de esta capacidad.
- Prediccion multi-token (MTP): el cabezal MTP esta presente en el checkpoint, permitiendo potencialmente una decodificacion mas rapida si se ejecuta con AX Engine y el runtime adecuado; sin embargo, la aceleracion solo esta certificada para perfiles especificos.
- Soporte de tool calling y function calling: no se menciona explicitamente en la informacion disponible; se asume que depende de las capacidades del modelo base, pero no esta confirmado.
- Soporte de agentes y multi-step reasoning: no hay datos especificos; se infiere que el modelo base podria soportarlo, pero no se documenta en la card.
- Capacidades multilingues: no se especifican los idiomas soportados en la informacion proporcionada.
- Integracion con MLX-LM y AX Engine: compatible con el runtime MLX-LM para inferencia de texto estandar, y con AX Engine para ejecucion nativa con MTP y vision.

## Casos de uso

- Asistente de programacion local en Apple Silicon: el modelo puede generar codigo, explicar fragmentos y depurar errores directamente en un MacBook Pro con memoria unificada, gracias a su tamano de 27B y cuantizacion 4bit que cabe en ~18 GB de almacenamiento. Es adecuado para entornos de desarrollo sin conexion a internet.
- Analisis de documentos con imagenes: al incluir torre de vision, puede procesar capturas de pantalla, diagramas o fotografias junto con texto para extraer informacion, por ejemplo en tareas de soporte tecnico o revision de documentacion.
- Generacion de contenido creativo: redaccion de articulos, guiones o material de marketing con contexto largo (hasta 262K tokens) para mantener coherencia en textos extensos.
- Chatbot de atencion al cliente: con soporte para conversaciones multi-turno y contexto amplio, puede gestionar interacciones complejas con historial largo, aunque la falta de tool calling confirmada limita la integracion con APIs externas.
- Prototipado de agentes de IA: el cabezal MTP y la arquitectura densa permiten experimentar con decodificacion anticipada y razonamiento multi-paso, aunque la aceleracion real depende de la certificacion del perfil de hardware.
- Inferencia multimodal en produccion ligera: para aplicaciones que requieren clasificacion de imagenes o descripcion de contenido visual en entornos Apple, este checkpoint ofrece una alternativa local a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El autor menciona certificaciones Tier 1 y Tier 2 que verifican la integridad del checkpoint y la retencion de calidad frente a una linea base uniforme, pero no se proporcionan numeros concretos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica directamente; al ser un modelo MLX, utiliza memoria unificada de Apple Silicon. Con un peso de 18.18 GB en safetensors, se recomienda al menos 24 GB de memoria unificada para cargar el modelo completo, y 32 GB o mas para contexto largo.
- GPU recomendadas: cualquier chip Apple Silicon con suficiente memoria unificada, por ejemplo Apple M3 Pro (36 GB) o M3 Max (48 GB o 64 GB). El certificado Tier 1 se genero en un `df-macbookpro-m3`, lo que sugiere compatibilidad con la generacion M3.
- Si cabe en consumer GPU: no aplica, ya que MLX esta disenado exclusivamente para Apple Silicon; no es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: MLX-LM para inferencia de texto basica, y AX Engine para ejecucion nativa con MTP y vision. Tambien se puede servir via `ax-engine serve` en un puerto local.
- Latencia y throughput: no se proporcionan datos medidos; la card indica que no se reivindican aceleraciones fuera de los perfiles certificados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos cuantizados de tamano similar en MLX. La card no menciona alternativas ni ofrece datos de rendimiento relativos. Se recomienda consultar el catalogo de AutomatosX para ver los hermanos 6bit del mismo modelo base, pero no hay metricas comparativas publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos; al ser un modelo derivado de Qwen, podria heredar sesgos del entrenamiento original, pero no se aportan datos.
- Riesgo de alucinacion: no se evalua en la informacion proporcionada; como cualquier LLM, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto o idioma: el contexto maximo configurado es de 262,144 tokens, pero el limite practico depende de la memoria unificada disponible. Los idiomas soportados no estan especificados.
- Restricciones de licencia: licencia Apache-2.0, permisiva para uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3.8-27B por si hubiera restricciones adicionales.
- Caveat de produccion: este es un paquete de desarrollo (`development`). La aceleracion MTP solo esta certificada para perfiles de hardware autorizados; fuera de esos perfiles no hay garantia de velocidad. Ademas, la cuantizacion se basa en prioridades de arquitectura sin calibracion, lo que podria afectar la calidad en tareas especificas.
- Compatibilidad: MLX-LM puede ignorar los sidecars de vision y MTP, por lo que la funcionalidad multimodal completa requiere AX Engine.

## Enlaces

- [HuggingFace - AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP](https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP)
- [Modelo base - Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0)
- [Certificado Tier 1 del checkpoint](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen38-27b-axq4-mtp-tier1.md)
- [Certificado Tier 2 de aceleracion MTP](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen38-27b-axq4-mtp-tier2.md)
- [Repositorio AXQuant](https://github.com/defai-digital/axquant)
- [Coleccion de AutomatosX](https://huggingface.co/AutomatosX/collections)
- [Indice completo del catalogo MLX de AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
