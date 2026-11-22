# orcarouter/Hy4-flash-abliterated-MLX

## Resumen

Hy4-flash-abliterated-MLX es una conversión al framework MLX de Apple Silicon del modelo orcarouter/Hy4-flash-abliterated, que a su vez deriva de la familia Hunyuan (Tencent) en su variante "Hy4-flash". Se trata de un modelo de arquitectura Mixture of Experts (MoE) orientado a generación de texto, publicado por el usuario orcarouter con un proceso de "abliteration" que elimina las capas de rechazo del modelo original, dando lugar a una variante sin censura (uncensored).

El paquete está empaquetado específicamente para Apple Silicon mediante MLX, con pesos en safetensors y precisión mixta, e incluye cuantización GPTQ. El repositorio ocupa 327,5 GB, lo que refleja el tamaño del modelo sin cuantizar o con cuantización parcial. Soporta únicamente inglés y chino según los metadatos, y su acceso está restringido: requiere aceptar las condiciones en Hugging Face.

Su relevancia es doble: por un lado, permite ejecutar un MoE de gran tamaño en hardware Apple mediante MLX; por otro, la licencia Tencent HY limita el uso comercial y el proceso de abliteration plantea consideraciones éticas y de seguridad importantes para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; conversión MLX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | precisión mixta (mixed-precision), GPTQ; pesos en safetensors |
| Idiomas soportados | en, zh |
| Licencia | tencent-hy-license (acceso restringido/gated) |
| Formato de pesos | safetensors (MLX), mixed-precision |
| Modelo base | orcarouter/Hy4-flash-abliterated |
| Framework | MLX (Apple Silicon) |
| Tamaño del repositorio | 327,5 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts (MoE) heredada de la familia Hunyuan de Tencent, en la variante "Hy4-flash". La información disponible no detalla el número total de parámetros, los parámetros activos por token, el número de expertos ni la longitud de contexto nativa. La conversión a MLX mantiene la topología MoE del modelo original pero reorganiza los pesos para su ejecución eficiente en Apple Silicon, empleando precisión mixta y cuantización GPTQ para reducir el footprint en memoria unificada.

El proceso de "abliteration" aplicado por orcarouter consiste en la modificación de los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento (típicamente RLHF/DPO), de modo que el modelo deja de negarse a responder a determinadas peticiones. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de alineamiento original. La variante MLX no añade entrenamiento nuevo: es una conversión de formato y cuantización del modelo abliterated ya publicado.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y respuesta a instrucciones de propósito general, heredadas del modelo Hunyuan base.
- Comportamiento "uncensored": el proceso de abliteration reduce los rechazos ante peticiones que el modelo original bloquearía.
- Soporte de conversaciones multi-turno (formato de chat no documentado en la información disponible).
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es text-generation.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el efecto del proceso de abliteration comparando respuestas frente al Hunyuan original, útil en laboratorios que analizan mecanismos de rechazo.
- Experimentación local en Apple Silicon: gracias al paquete MLX, investigadores con Mac equipados con memoria unificada pueden ejecutar un MoE de gran tamaño sin GPU dedicada.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o contenido narrativo donde el modelo original aplicaría rechazos, en entornos controlados y con revisión humana.
- Prototipado de asistentes bilingües inglés-chino: el soporte nativo de ambos idiomas lo hace adecuado para demos de traducción o atención al cliente en esos mercados.
- Evaluación de robustez de pipelines: sirve como modelo "adversario" para probar clasificadores de contenido y sistemas de moderación en producción.
- Benchmarking de inferencia MLX: útil para medir throughput y latencia de un MoE cuantizado en hardware Apple frente a alternativas GGUF/llama.cpp.
- Docencia y formación técnica: permite ilustrar en un entorno local cómo funciona un MoE y qué implica la cuantización GPTQ y la precisión mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio pesa 327,5 GB, por lo que la ejecución completa requiere un Mac con memoria unificada muy elevada (muy por encima de las configuraciones consumer habituales). No se dispone de cifras exactas de memoria pico para inferencia.
- GPU recomendadas: hardware Apple Silicon con memoria unificada amplia (Mac Studio con M-Ultra de gama alta). No aplica a A100/H100 por tratarse de un paquete MLX.
- ¿Cabe en GPU consumer? No en GPUs NVIDIA consumer; en Apple Silicon solo en configuraciones de memoria unificada muy alta.
- Opciones de despliegue: MLX (librería mlx y mlx-lm) sobre macOS. No es compatible directamente con vLLM, TGI o llama.cpp en su formato actual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-abliterated-MLX (este) | MoE, conversión MLX | no disponible | tencent-hy-license (gated) | safetensors MLX | Hugging Face, acceso restringido |
| orcarouter/Hy4-flash-abliterated | MoE, abliterated | no disponible | tencent-hy-license | safetensors | Hugging Face |
| Hunyuan original (familia) | MoE | no disponible | tencent-hy-license | safetensors | Hugging Face |
| Alternativas MLX de propósito general | transformer denso/MoE | variable | variable | safetensors MLX | Hugging Face |

No se dispone de datos de rendimiento comparativo ni de parámetros exactos de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina salvaguardas: el modelo puede generar contenido dañino, ofensivo o inexacto sin rechazo. No recomendado para aplicaciones de cara al público sin moderación externa.
- Licencia tencent-hy-license: impone restricciones de uso, incluido posiblemente el uso comercial; es imprescindible revisar los términos antes de cualquier despliegue productivo.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la distribución automatizada.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta variante.
- Sesgos: no hay información sobre evaluación de sesgos del modelo base ni del proceso de abliteration.
- Tamaño del repositorio (327,5 GB) y requisitos de memoria unificada muy altos limitan su uso a hardware Apple de gama alta.
- Compatibilidad de despliegue reducida: al ser un paquete MLX, no funciona con los stacks habituales de servidor (vLLM, TGI).
- No se documentan la longitud de contexto efectiva ni el formato de prompt/chat, lo que complica su integración fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Hy4-flash-abliterated-MLX
- Modelo base: https://huggingface.co/orcarouter/Hy4-flash-abliterated
- Framework MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
- Licencia Tencent Hunyuan: https://huggingface.co/tencent/Hunyuan-Large (referencia de la familia; consultar términos exactos en el repositorio del modelo)
