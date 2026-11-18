# Peymandc/LFM3-1.7B-Heretic-Uncensored-GGUF

## Resumen

LFM3-1.7B Heretic Uncensored GGUF es una versión "decensored" del modelo LFM3-1.7B de Liquid AI, publicada por el usuario Peymandc en Hugging Face. Se trata de una modificación de los pesos originales mediante la herramienta Heretic v2.1.0, que aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) para reducir la conducta de rechazo aprendida del modelo base. No es un modelo entrenado desde cero, sino un ajuste quirúrgico de pesos que preserva las capacidades subyacentes mientras altera el comportamiento de negativa ante ciertas peticiones.

El modelo subyacente, LFM3-1.7B, es un transformer de tipo tri-híbrido desarrollado por Liquid AI que combina capas de convolución corta con puertas (gated short-convolution), capas de atención de ventana deslizante y capas de atención global. Con aproximadamente 1.730 millones de parámetros, un vocabulario de 128.000 tokens y una longitud de contexto declarada de hasta 256.000 tokens, está diseñado para inferencia eficiente en dispositivos de borde (edge) y entornos locales. La versión que nos ocupa se distribuye exclusivamente en formato GGUF, con variantes Q4_K_M, Q6_K, Q8_0 y BF16, lo que la hace compatible con llama.cpp y aplicaciones derivadas.

La relevancia de esta ficha radica en que documenta una práctica creciente en la comunidad open source: la modificación de modelos para eliminar comportamientos de rechazo. El autor reporta una reducción drástica de la tasa de coincidencia con palabras clave de rechazo (del 98% al 3% en una muestra de 100 prompts del dataset `mlabonne/harmful_behaviors`), con una divergencia KL de 0,0732 respecto al original. Estos datos, sin embargo, proceden de una evaluación automática basada en palabras clave y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido (13 capas de convolucion corta con puertas, 5 capas de atencion de ventana deslizante, 6 capas de atencion global) |
| Parametros totales | Aproximadamente 1,73 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 256.000 tokens (entrada + salida), segun documentacion del modelo original |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF |
| Capas | 24 |
| Vocabulario | 128.000 tokens |
| Modelo base | LiquidAI/LFM3-1.7B-Base |
| Herramienta de modificacion | Heretic v2.1.0 |
| Tamano del repositorio | 7,8 GB |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura LFM3 de Liquid AI, que no es un transformer convencional. Combina tres mecanismos de procesamiento en una estructura de 24 capas: 13 capas de convolución corta con puertas, que procesan información local de forma eficiente; 5 capas de atención de ventana deslizante, que limitan el coste computacional a un rango local; y 6 capas de atención global, que permiten integrar información de todo el contexto. Esta hibridación busca reducir el coste de la atención cuadrática tradicional manteniendo la capacidad de modelar dependencias de largo alcance, lo que explica su idoneidad para despliegue en dispositivos con recursos limitados.

No se dispone de información detallada sobre el proceso de entrenamiento del modelo base en la documentación proporcionada: no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La modificación Heretic, por su parte, no reentrena el modelo. Aplica una ablación de rangos arbitrarios sobre las capas 9 a 24, con un peso de preservación de conducta buena de 0,3616, un peso de dirección de conducta mala de 0,0006, un peso relativo de sobrecorrección de 0,7002 y un recuento de vecinos de 14, según la configuración documentada en el repositorio original en safetensors. El objetivo declarado es alterar la conducta de rechazo aprendida sin degradar las capacidades subyacentes, aunque la evaluación de esta preservación se limita a la divergencia KL reportada.

## Capacidades

- Generación de texto conversacional y continuación de texto en 16 idiomas, incluyendo español, inglés, chino, árabe, hindi y ruso.
- Razonamiento general y respuesta a preguntas, heredado del modelo base LFM3-1.7B.
- Procesamiento de contexto largo: la arquitectura soporta hasta 256.000 tokens, aunque el contexto útil real depende del motor de inferencia y de la memoria disponible.
- Inferencia local y offline mediante llama.cpp y aplicaciones compatibles con GGUF.
- Ejecución en dispositivos de borde gracias a su tamaño reducido (1,73B parámetros) y a las cuantizaciones de 4 y 6 bits.
- Comportamiento de rechazo reducido: el modelo modificado responde a peticiones que el original rechazaría, según la evaluación con palabras clave del autor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistente conversacional local en español: el modelo puede mantener conversaciones multi-turno en español gracias a su soporte declarado de este idioma y a su ventana de contexto de hasta 256.000 tokens, ejecutándose en un portátil con GPU de consumo mediante la cuantización Q4_K_M.
- Experimentación con modelos sin censura: investigadores que estudian el comportamiento de rechazo en LLM pueden comparar las respuestas del modelo original LFM3-1.7B con esta variante Heretic, usando la configuración documentada (capas 9-24, pesos de ablación) como referencia reproducible.
- Procesamiento de documentos largos en local: con 256.000 tokens de contexto declarados, el modelo puede resumir o extraer información de documentos extensos sin enviar datos a servicios en la nube, útil en entornos con requisitos de privacidad.
- Generación de texto creativo sin restricciones temáticas: escritores y guionistas pueden emplear la variante para explorar narrativas que el modelo original rechazaría, aprovechando la reducción de la conducta de rechazo reportada.
- Despliegue en dispositivos de borde: aplicaciones de asistencia en Raspberry Pi, mini-PC o móviles de gama alta pueden integrar el modelo en formato Q4_K_M (aproximadamente 1 GB de pesos) mediante llama.cpp para tareas de generación de texto sin conexión.
- Evaluación comparativa de técnicas de ablación: el repositorio incluye instrucciones de reproducción en el directorio `reproduce/` del checkpoint original, lo que permite a investigadores replicar el proceso Heretic y medir su impacto en otros modelos.
- Prototipado rápido de chatbots multilingües: con 16 idiomas declarados, sirve para validar flujos conversacionales en varios idiomas antes de invertir en modelos mayores, aunque la calidad multilingüe no ha sido evaluada independientemente en esta variante.

## Benchmarks y rendimiento

El autor no reporta resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta variante GGUF. La única evaluación disponible es la del checkpoint original en safetensors, centrada en la efectividad de la modificación Heretic:

| Metrica | Modelo modificado | LFM3-1.7B original |
|---|---:|---:|
| Coincidencias de palabras clave de rechazo (100 prompts de `mlabonne/harmful_behaviors`) | 3/100 (3%) | 98/100 (98%) |
| Divergencia KL (100 prompts de `mlabonne/harmless_alpaca`) | 0,0732 | 0,0000 (referencia) |

El autor advierte que la métrica de rechazo es un proxy basado en palabras clave, no una evaluación semántica ni revisada por humanos, y que las cuantizaciones GGUF individuales no han sido evaluadas de forma independiente. No se han publicado resultados de benchmarks de capacidades (razonamiento, código, matemáticas) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para Q4_K_M, 1,5 GB para Q6_K, 1,9 GB para Q8_0 y 3,5 GB para BF16, calculados a partir del tamaño de los pesos (1,73B parámetros) sin contar la caché KV.
- La caché KV para 256.000 tokens de contexto puede consumir varios gigabytes adicionales según el motor y la configuración; para contextos largos se recomienda GPU con 8 GB o más de VRAM.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM para cuantizaciones de 4-8 bits (RTX 3060, RTX 4060, RTX 4090); para BF16 y contextos extensos, GPU profesionales como A100 o H100 no son necesarias por tamaño, pero ofrecen mayor ancho de banda.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más de VRAM, e incluso en CPU con suficiente RAM para las cuantizaciones más pequeñas.
- Opciones de despliegue: llama.cpp y aplicaciones compatibles con GGUF (Ollama, LM Studio, kobold.cpp). No se documenta soporte para vLLM ni TGI en la información disponible, dado que estos motores priorizan otros formatos.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B Heretic Uncensored GGUF | 1,73B | 256K (declarado) | LFM Open License v1.0 | GGUF | Variante sin censura, sin benchmarks de capacidades publicados |
| LiquidAI/LFM3-1.7B (original) | 1,73B | 256K (declarado) | LFM Open License v1.0 | Safetensors, GGUF | Modelo base sin modificar; conducta de rechazo del 98% en la evaluacion del autor |
| Qwen2.5-1.5B | 1,5B | 32K (128K en variantes) | Apache 2.0 | Safetensors, GGUF | Alternativa de tamano similar con benchmarks publicados y licencia permisiva |
| Llama-3.2-1B | 1,2B | 128K | Llama 3.2 Community License | Safetensors, GGUF | Modelo de borde de Meta con ecosistema amplio y soporte de tool calling |

La comparación con Qwen2.5-1.5B y Llama-3.2-1B es pertinente por tamaño y orientación a dispositivos de borde, pero no se dispone de datos de rendimiento del modelo Heretic que permitan una comparación cuantitativa justa. La principal diferencia de la variante Heretic es su modificación de conducta y su licencia LFM, menos permisiva que Apache 2.0.

## Limitaciones y advertencias

- La evaluación de la reducción de rechazo se basa en coincidencias de palabras clave sobre 100 prompts, no en una evaluación semántica o humana; los resultados pueden no reflejar el comportamiento real en producción.
- La divergencia KL de 0,0732 respecto al original indica que la modificación altera la distribución de salida; no se ha medido el impacto en tareas de razonamiento, código o matemáticas.
- Las cuantizaciones GGUF no han sido evaluadas de forma independiente; los resultados reportados corresponden al checkpoint en safetensors.
- El modelo puede generar contenido dañino, ofensivo o inexacto al haberse reducido su conducta de rechazo; el despliegue en producción requiere filtros adicionales y supervisión.
- Riesgo de alucinación inherente a los modelos de 1,7B parámetros, especialmente en tareas de conocimiento factual y contextos largos.
- La calidad multilingüe en los 16 idiomas declarados no ha sido evaluada en esta variante; el soporte se hereda de la documentación del modelo original.
- La licencia LFM Open License v1.0 impone restricciones que deben revisarse antes de uso comercial; no es una licencia permisiva tipo Apache 2.0.
- El contexto útil real puede ser inferior a los 256.000 tokens declarados según el motor de inferencia, la memoria disponible y la configuración de la caché KV.
- No se documenta soporte de tool calling, agentes o visión, lo que limita su uso en pipelines agénticos complejos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored-GGUF
- Checkpoint original en safetensors: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base (checkpoint base): https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Herramienta Heretic: https://github.com/Heretic-Project/Heretic
- Pagina de soporte del autor: https://huggingface.co/spaces/Peymandc/support
