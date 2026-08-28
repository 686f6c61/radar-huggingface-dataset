# jixaw/Qwen3-ASR-1.7B-Persian-Q8_0-GGUF

## Resumen

El modelo `jixaw/Qwen3-ASR-1.7B-Persian-Q8_0-GGUF` es una conversión a formato GGUF con cuantización Q8_0 del modelo `Neurai/Qwen3-ASR-1.7B-Persian`, un sistema de reconocimiento automático del habla (ASR) especializado en persa. La conversión ha sido realizada por el usuario jixaw mediante la herramienta GGUF-my-repo de llama.cpp, lo que permite ejecutar el modelo en entornos con recursos limitados, como CPU o GPUs de gama media, sin necesidad de frameworks pesados.

El modelo base pertenece a la familia Qwen3-ASR desarrollada por Alibaba, que se apoya en el modelo fundacional Qwen3-Omni y está entrenada con grandes volúmenes de datos de voz. La versión original de 1.7B parámetros alcanza resultados de última generación entre los modelos ASR de código abierto, según la documentación oficial. Esta adaptación persa conserva las capacidades de transcripción y identificación de idioma, aunque su foco principal es el persa.

La relevancia de esta ficha radica en que ofrece una opción ligera y portable para integrar ASR en persa en aplicaciones de producción, gracias al formato GGUF que facilita su uso con llama.cpp y herramientas compatibles. El tamaño del repositorio es de 1.8 GB, lo que lo hace viable para despliegues en edge computing o en infraestructuras sin GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3-Omni (detalles no disponibles) |
| Parametros totales | 1.720.574.976 (~1.72B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | no disponible (el nombre indica persa; la familia Qwen3-ASR soporta 52 idiomas y dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo, sino una conversión del modelo `Neurai/Qwen3-ASR-1.7B-Persian` a formato GGUF con cuantización Q8_0, realizada con llama.cpp. El modelo base es una adaptación al persa del Qwen3-ASR-1.7B original de Alibaba, que forma parte de la familia Qwen3-ASR. Según la documentación de la familia, estos modelos emplean una arquitectura derivada de Qwen3-Omni, diseñada para comprender audio y transcribir voz, y han sido entrenados con grandes conjuntos de datos de habla multilingüe. No se dispone de detalles específicos sobre el proceso de entrenamiento de la versión persa, como el número de tokens o el uso de técnicas de alineación (RLHF/DPO).

## Capacidades

- Reconocimiento automático del habla (ASR) en persa, con transcripción de audio a texto.
- Identificación de idioma hablado, según las capacidades de la familia Qwen3-ASR.
- Manejo de audio difícil, como voz cantada o con ruido de fondo, según la documentación de la familia.
- Soporte de entrada de audio en múltiples formatos: ruta local, URL, base64 o tupla `(np.ndarray, sr)`, mediante el paquete `qwen-asr` (backends transformers y vLLM).
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo especializado en ASR, no un LLM de propósito general.

## Casos de uso

- Transcripción de reuniones y entrevistas en persa: el modelo puede convertir grabaciones de audio en texto de forma automática, facilitando la generación de actas o resúmenes. Su tamaño compacto permite ejecutarlo en portátiles o servidores modestos.
- Subtitulado automático de vídeos en persa: integrable en pipelines de procesamiento de vídeo para generar subtítulos en tiempo real o diferido, gracias a su compatibilidad con llama.cpp y la posibilidad de procesar archivos de audio locales.
- Asistentes de voz para atención al cliente: puede transcribir llamadas de soporte en persa, permitiendo análisis posterior de sentimiento o detección de problemas recurrentes. Su licencia Apache 2.0 facilita su integración en productos comerciales.
- Transcripción de podcasts y contenido multimedia: adecuado para creadores de contenido que necesitan convertir episodios de audio en texto para SEO o accesibilidad, con un coste de hardware reducido.
- Análisis de llamadas de soporte técnico: al desplegarse como servicio con llama-server, puede procesar flujos de audio entrantes y generar registros textuales para bases de conocimiento o entrenamiento de modelos.
- Accesibilidad para personas con discapacidad auditiva: permite generar transcripciones en tiempo real de conversaciones o eventos, ejecutable en dispositivos con recursos limitados gracias a la cuantización Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada en la información disponible. La documentación de la familia Qwen3-ASR indica que el modelo de 1.7B alcanza un rendimiento de última generación entre los ASR de código abierto, pero no se proporcionan cifras concretas (MMLU, WER, etc.) en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB para la cuantización Q8_0 (1.8 GB de pesos más overhead de contexto y activaciones).
- GPU recomendadas: tarjetas consumer con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con GPU consumer: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-cpp-python, y potencialmente Ollama si se importa el GGUF. El modelo base también es compatible con transformers y vLLM, pero este repositorio específico está en formato GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud del audio procesado.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos para esta versión persa. Como referencia genérica, el modelo original Qwen3-ASR-1.7B compite con otros ASR multilingües como Whisper large-v3, pero no se han encontrado métricas directas en las fuentes consultadas. Se recomienda consultar la documentación de la familia Qwen3-ASR para obtener comparativas detalladas.

## Limitaciones y advertencias

- El modelo está especializado en persa; su rendimiento en otros idiomas puede ser inferior al de la versión multilingüe original.
- Al ser una cuantización Q8_0, puede haber una ligera degradación en la precisión respecto al modelo en BF16, aunque en la práctica suele ser mínima.
- No se han documentado sesgos específicos, pero como todo modelo ASR, puede presentar errores en acentos poco comunes, habla solapada o entornos muy ruidosos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, siempre que se mantenga el aviso de licencia.
- Para producción, se recomienda validar el modelo con datos reales del dominio objetivo, ya que no se han publicado métricas de error (WER) para esta versión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jixaw/Qwen3-ASR-1.7B-Persian-Q8_0-GGUF
- Modelo base (Neurai): https://huggingface.co/Neurai/Qwen3-ASR-1.7B-Persian
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- GitHub de la familia Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- GitHub de la adaptación persa: https://github.com/jibiyar/Qwen3-ASR-1.7B-Persian
- Documentación en OpenASR: https://openasr.org/models/qwen3-asr-1.7b/
