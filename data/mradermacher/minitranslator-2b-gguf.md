# mradermacher/MiniTranslator-2B-GGUF

## Resumen

MiniTranslator-2B-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo MiniTranslator-2B, publicado originalmente por el usuario Caldalis en Hugging Face. El repositorio lo mantiene mradermacher, un perfil conocido por producir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base tiene 2.000 millones de parámetros y, por el nombre, está orientado a tareas de traducción automática.

La relevancia de esta ficha es limitada: no se dispone de model card descriptiva del modelo original, ni de datos sobre arquitectura, datos de entrenamiento, licencia o idiomas soportados. La información disponible se reduce a la lista de cuantizaciones generadas y a la referencia al repositorio de origen. Cualquier evaluación rigurosa del modelo requiere consultar directamente el repositorio de Caldalis/MiniTranslator-2B, que no forma parte de la información proporcionada.

Por tanto, esta ficha documenta lo que se sabe con certeza (el conjunto de cuantizaciones disponibles y el proceso de conversión a GGUF) y marca explícitamente como "no disponible" todo aquello que no se puede verificar. No se deben inferir capacidades, rendimiento ni condiciones de licencia a partir del nombre del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2B (según el nombre del modelo) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo original probablemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El nombre sugiere un transformer decoder-only de 2.000 millones de parámetros orientado a traducción, pero no hay confirmación en la documentación proporcionada. Tampoco se conocen el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el proceso de cuantización: el repositorio incluye cuantizaciones estáticas generadas con un pipeline de conversión a GGUF (metadatos `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), lo que indica que los pesos se convirtieron desde un checkpoint en formato Hugging Face y se cuantizaron tensor a tensor. Se ofrecen 12 variantes que cubren desde f16 sin pérdida hasta Q2_K e IQ4_XS para entornos con memoria muy limitada.

## Capacidades

- Traducción automática: el nombre del modelo indica que su propósito principal es la traducción, aunque no se especifican pares de idiomas ni dirección.
- Generación de texto: presumiblemente heredada de la arquitectura base, sin confirmar.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Traducción local en dispositivos con recursos limitados: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 2B en portátiles sin GPU dedicada mediante llama.cpp, adecuado para traducir documentos de forma privada sin enviar texto a servicios en la nube.
- Traducción por lotes en servidores modestos: con Q8_0 o f16 y llama.cpp o vLLM (si soporta GGUF), se puede procesar grandes volúmenes de segmentos de texto con un coste de memoria inferior a 4 GB.
- Integración en pipelines de localización: un modelo de 2B puede actuar como primer paso de traducción automática en flujos de localización de software, con revisión humana posterior, reduciendo coste frente a APIs comerciales.
- Prototipado rápido de aplicaciones de traducción: la variedad de cuantizaciones permite probar el mismo modelo en distintos entornos (móvil, escritorio, servidor) sin cambiar de API.
- Traducción de subtítulos o transcripciones: con contexto corto y baja latencia en GPU consumer, puede integrarse en herramientas de subtitulado que requieren generación rápida por segmento.
- Evaluación comparativa de cuantizaciones: el repositorio sirve para medir la degradación de calidad entre Q2_K y f16 en tareas de traducción, útil para investigar el impacto de la cuantización en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB en Q4_K_M para un modelo de 2B; en torno a 2,2 GB en Q8_0; y unos 4 GB en f16 (estimaciones basadas en el tamaño típico de pesos para 2B parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para f16 (GTX 1650, RTX 3050); para cuantizaciones Q4, GPUs integradas o incluso CPU son suficientes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas de los últimos años, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (si se importa el GGUF), LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (traducción, 2B parámetros) en la documentación proporcionada, ni de datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia de model card: no hay información sobre sesgos, datos de entrenamiento ni evaluación de calidad; no se recomienda su uso en producción sin una evaluación propia.
- Licencia desconocida: al no constar la licencia del modelo base ni de la cuantización, no se puede garantizar el uso comercial. Es imprescindible consultar el repositorio Caldalis/MiniTranslator-2B antes de cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos generativos; en traducción puede manifestarse como omisiones, adiciones o cambios de sentido, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S).
- Degradación por cuantización: las variantes de 2 y 3 bits pueden perder calidad notablemente en un modelo de solo 2B parámetros; se recomienda Q4_K_M o superior para tareas sensibles.
- Idiomas no especificados: se desconoce qué pares de idiomas cubre; no asumir competencia multilingüe amplia.
- Contexto desconocido: sin datos sobre la longitud de contexto, no se debe usar para documentos largos sin verificación previa.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniTranslator-2B-GGUF
- Modelo base: https://huggingface.co/Caldalis/MiniTranslator-2B
