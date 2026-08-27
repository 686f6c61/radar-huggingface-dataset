# J-Fraudster/Qwen3.5-2B-W4A16-AutoRound-LLM-Compressor

## Resumen

El modelo **J-Fraudster/Qwen3.5-2B-W4A16-AutoRound-LLM-Compressor** es una versión cuantizada del modelo multimodal **Qwen/Qwen3.5-2B**, desarrollada por el usuario J-Fraudster. La cuantización utiliza el algoritmo **AutoRound** de Intel, que convierte los pesos a 4 bits (W4A16: pesos de 4 bits, activaciones de 16 bits) con el objetivo de reducir drásticamente los requisitos de memoria VRAM y acelerar la inferencia, manteniendo una degradación mínima de precisión. El modelo base es un transformer multimodal (imagen-texto) de 2.213 millones de parámetros, diseñado para tareas de generación de texto, conversación y procesamiento de imágenes.

Esta versión cuantizada resulta relevante porque permite ejecutar un modelo multimodal de 2B en GPUs de consumo (como RTX 3090 o 4090) con solo 16-18 GB de VRAM, frente a los ~54 GB que requeriría el modelo original en BF16. El repositorio incluye instrucciones de despliegue con vLLM y está pensado para producción, con una licencia Apache 2.0 que permite uso comercial. Aunque el modelo aún no tiene descargas ni valoraciones, la técnica de cuantización empleada (group size 32, calibración con 512 muestras y secuencias de 4096 tokens) busca maximizar la fidelidad de reconstrucción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto), basado en Qwen3.5-2B |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la calibracion usa seqlen 4096, pero no se especifica el maximo del modelo) |
| Tipos de cuantizacion | W4A16 (pesos 4-bit, activaciones 16-bit), group size 32, simetrico; torre de vision y capas MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien compatible con GPTQ segun la model card) |

## Arquitectura y entrenamiento

El modelo base **Qwen3.5-2B** es un transformer multimodal que procesa entradas de imagen y texto, con una torre de visión dedicada. La cuantización se realizó con **AutoRound**, un algoritmo de cuantización post-entrenamiento de Intel que optimiza los pesos mediante calibración. Los parámetros de calibración incluyen 512 muestras, una longitud de secuencia de 4096 tokens y 1000 iteraciones de ajuste. Se utilizó un group size de 32 (más pequeño que el estándar de 128) para mejorar la fidelidad de reconstrucción, y la cuantización es simétrica.

Un aspecto técnico destacable es que la torre de visión (`quant_nontext_module`) se mantiene en **BF16** para preservar la precisión en tareas de razonamiento visual y OCR. De igual forma, las capas de predicción multi-token (`mtp` y `mtp.fc`) se conservan en bfloat16 nativo. Esto implica que la cuantización afecta únicamente a los pesos de las capas de texto, mientras que las partes críticas para visión y predicción múltiple permanecen sin cuantizar. No se dispone de información sobre el entrenamiento original del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO).

## Capacidades

- **Generación de texto y conversación**: el modelo es capaz de mantener diálogos multi-turno, responder preguntas y generar texto coherente.
- **Procesamiento de imágenes**: al ser un modelo image-text-to-text, puede recibir imágenes como entrada y generar descripciones, responder preguntas visuales o realizar tareas de OCR.
- **Razonamiento visual**: la torre de visión se mantiene en BF16, lo que preserva la capacidad de razonamiento sobre imágenes y la precisión en reconocimiento óptico de caracteres.
- **Compatibilidad con vLLM**: el repositorio incluye instrucciones para servir el modelo con vLLM, lo que facilita su integración en entornos de producción.
- **Multilingüismo**: no se especifican los idiomas soportados, pero al estar basado en Qwen3.5, es probable que herede capacidades multilingües del modelo original (aunque no se confirma).
- **No se menciona soporte explícito para tool calling, function calling ni agentes multi-paso** en la información disponible.

## Casos de uso

- **Asistentes virtuales con visión**: el modelo puede integrarse en chatbots que reciban imágenes del usuario (por ejemplo, fotos de productos, capturas de pantalla) y respondan con texto descriptivo o recomendaciones. Su tamaño reducido permite ejecutarlo en servidores con una sola GPU de 24 GB.
- **Análisis de documentos y OCR**: gracias a la torre de visión en BF16, el modelo puede extraer texto de imágenes escaneadas o fotografías, útil para automatizar la digitalización de facturas, formularios o tarjetas de visita.
- **Moderación de contenido visual**: puede clasificar o describir imágenes para detectar contenido inapropiado, aunque su capacidad de razonamiento complejo puede ser limitada por su tamaño.
- **Generación de descripciones para accesibilidad**: el modelo puede generar descripciones alternativas (alt text) para imágenes en sitios web o aplicaciones, mejorando la accesibilidad para personas con discapacidad visual.
- **Prototipado rápido de aplicaciones multimodales**: al ser ligero y cuantizado, es adecuado para entornos de desarrollo y pruebas donde se necesita iterar rápidamente sin grandes recursos de hardware.
- **Despliegue en edge o entornos con restricciones de memoria**: con 16-18 GB de VRAM, puede ejecutarse en GPUs de consumo como RTX 3090 o 4090, lo que lo hace viable para aplicaciones locales o en instalaciones con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (como MMLU, HumanEval o GSM8K) ni comparaciones con el modelo original o con otras cuantizaciones. El repositorio de kaitchup (similar) indica que el modelo está "bajo evaluación", pero no proporciona números concretos. Por tanto, no es posible cuantificar la degradación exacta debida a la cuantización.

## Requisitos de hardware

- **VRAM estimada**: según la model card, el modelo cuantizado requiere aproximadamente **16-18 GB de VRAM** para inferencia, frente a los ~54 GB del modelo original en BF16.
- **GPUs recomendadas**: RTX 3090, RTX 4090, A5000 (todas con 24 GB de VRAM) o GPUs con al menos 16 GB. También se menciona que el modelo original necesitaba 2x A100/A6000 o 80 GB, pero la versión cuantizada cabe en una sola GPU de consumo.
- **Opciones de despliegue**: el repositorio proporciona instrucciones para **vLLM** (comando `vllm serve` con `--quantization auto-round`). No se mencionan otras herramientas como llama.cpp u Ollama, aunque al ser safetensors podría convertirse a GGUF si se desea.
- **Latencia y throughput**: no se proporcionan datos concretos. La model card menciona una "reducción del cuello de botella de ancho de banda de memoria" que debería acelerar la decodificación, pero sin cifras específicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM estimada | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-2B (original, BF16) | 2.213 M | no disponible | BF16 | ~54 GB | Apache 2.0 |
| J-Fraudster/Qwen3.5-2B-W4A16-AutoRound | 2.213 M | no disponible | W4A16 (group 32) | 16-18 GB | Apache 2.0 |
| kaitchup/Qwen3.5-2B-autoround-W4A16 | 2.213 M | no disponible | W4A16 (similar) | no disponible | Apache 2.0 (presumible) |

No se dispone de datos de rendimiento comparativos (benchmarks) entre estas versiones. La principal diferencia entre la versión de J-Fraudster y la de kaitchup es el group size (32 frente a posiblemente 128) y la configuración de calibración, pero no hay métricas que permitan evaluar cuál es superior. Ambas son cuantizaciones del mismo modelo base y usan AutoRound.

## Limitaciones y advertencias

- **Degradación por cuantización**: aunque AutoRound minimiza la pérdida, la cuantización W4A16 puede afectar a tareas que requieren alta precisión numérica, como matemáticas complejas o razonamiento lógico extenso. No hay benchmarks que cuantifiquen esta pérdida.
- **Modelo pequeño**: con solo 2.2B parámetros, el modelo puede tener limitaciones en tareas que exigen conocimiento enciclopédico o razonamiento profundo. No es adecuado para tareas de alta complejidad sin evaluación previa.
- **Contexto limitado**: no se especifica la longitud máxima de contexto del modelo base. La calibración se realizó con secuencias de 4096 tokens, lo que sugiere que el contexto efectivo podría ser de ese orden, pero no es un dato confirmado.
- **Idiomas no especificados**: no se indica qué idiomas soporta el modelo. Aunque Qwen3.5 probablemente sea multilingüe, no hay confirmación oficial en la información proporcionada.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas visuales donde la interpretación de la imagen es ambigua.
- **Sesgos**: no se dispone de información sobre sesgos del modelo base ni de la versión cuantizada. Se recomienda auditar el modelo antes de usarlo en aplicaciones sensibles.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar que el modelo base Qwen3.5-2B también tenga la misma licencia (así se indica en el repositorio).
- **Soporte de backend**: la cuantización AutoRound es compatible con vLLM, pero no se garantiza su funcionamiento en otros motores de inferencia (como TensorRT-LLM o llama.cpp) sin conversión adicional.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/J-Fraudster/Qwen3.5-2B-W4A16-AutoRound-LLM-Compressor)
- [Modelo base Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Repositorio de Intel AutoRound](https://github.com/intel/auto-round)
- [Documentación de LLM Compressor para Qwen3.5](https://docs.vllm.ai/projects/llm-compressor/en/latest/key-models/qwen3.5/)
- [Repositorio similar de kaitchup (Qwen3.5-2B autoround W4A16)](https://huggingface.co/kaitchup/Qwen3.5-2B-autoround-W4A16)
- [Qwen3 Technical Report (arXiv)](https://arxiv.org/html/2505.09388v1)
