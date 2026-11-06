# liodon-ai/LoCo-7B-imatrix-GGUF

## Resumen

LoCo-7B-imatrix-GGUF es una colección de cuantizaciones GGUF del modelo MuyaoYuan/LoCo-7B, publicada por Liodon AI. El modelo base es un transformer de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) derivado de la familia Qwen2, según indican las etiquetas del repositorio, y a su vez vinculado en la cadena de modelos base a DeepSeek-R1-Distill-Qwen-7B. El propósito de esta publicación no es ofrecer un modelo nuevo, sino distribuir pesos comprimidos listos para inferencia local en llama.cpp, Ollama, LM Studio y Jan, con cuantizaciones de 2 a 8 bits.

La innovación principal de esta variante concreta es el uso de calibración iMatrix: se ejecutan 128 fragmentos de calibración (2 millones de tokens de WikiText-103) a través del modelo en precisión completa para identificar qué pesos son más sensibles, y se asigna más precisión a esas regiones. Según el autor, esto mejora la coherencia y el seguimiento de instrucciones en cuantizaciones de 2, 3 y 4 bits sin aumentar el tamaño del archivo.

El modelo resulta relevante para quienes necesitan ejecutar un modelo de 7B con razonamiento destilado en hardware de consumo, con opciones que van desde 2,78 GB (IQ2_M) hasta 8,10 GB (Q8_0). La licencia figura como "other", lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2, según etiquetas del repo; detalles no disponibles) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (calibradas con iMatrix) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base MuyaoYuan/LoCo-7B es un transformer de 7,6 mil millones de parámetros. Las etiquetas del repositorio lo sitúan en la familia Qwen2 y lo encadenan a DeepSeek-R1-Distill-Qwen-7B, lo que sugiere un proceso de destilación de razonamiento sobre una base Qwen2-7B. No se dispone de información publicada en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La aportación técnica de esta publicación es la cuantización con iMatrix. El proceso de calibración recorre 128 fragmentos del conjunto WikiText-103 (2 millones de tokens) en el modelo de precisión completa, mide la importancia de cada peso y redistribuye la precisión de cuantización en consecuencia. El resultado son archivos del mismo tamaño que una cuantización estándar pero con mejor comportamiento en instrucciones y coherencia a bajos bits, especialmente en IQ2_M, IQ3_M y Q4_K_M. El autor publica además una variante sin iMatrix en liodon-ai/LoCo-7B-GGUF.

## Capacidades

- Generación de texto conversacional y de un solo turno, según el pipeline declarado (text-generation).
- Razonamiento derivado por destilación de DeepSeek-R1, según la cadena de modelos base declarada.
- Ejecución local en CPU y GPU mediante llama.cpp, Ollama, LM Studio y Jan.
- Cuantizaciones sub-4-bit (IQ2_M, IQ3_M) para entornos con menos de 4 GB de VRAM.
- Soporte de plantillas de chat conversacional (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en portátil: con Q4_K_M (4,68 GB, ~5 GB de VRAM) el modelo cabe en GPUs de consumo como la RTX 3060 de 12 GB o la RTX 4060 Ti de 16 GB, permitiendo un chatbot privado sin conexión.
- Razonamiento en entornos con poca VRAM: la variante IQ2_M (2,78 GB, ~3 GB de VRAM) permite ejecutar un 7B en GPUs de 4 GB o en CPU con RAM limitada, sacrificando calidad pero manteniendo la coherencia gracias a la calibración iMatrix.
- Prototipado rápido con Ollama: el comando `ollama run hf.co/liodon-ai/LoCo-7B-imatrix-GGUF:Q4_K_M` permite desplegar el modelo en un equipo de desarrollo en minutos, útil para validar prompts antes de pasar a producción.
- Integración en LM Studio o Jan para evaluación comparativa: al ofrecer siete cuantizaciones, permite medir la degradación de calidad entre IQ2_M y Q8_0 sobre el mismo modelo y elegir el punto de equilibrio para un caso concreto.
- Generación de texto por lotes en CPU: con Q6_K o Q8_0 (6,25 GB y 8,10 GB) y llama.cpp en CPU, se puede procesar texto en servidores sin GPU, aunque con throughput limitado.
- Educación e investigación sobre cuantización: la comparación entre esta variante iMatrix y la variante estándar del mismo autor (liodon-ai/LoCo-7B-GGUF) sirve para estudiar el impacto de la calibración por importancia en modelos de 7B.
- Despliegue en dispositivos de borde con Q3_K_M o IQ4_XS: cuantizaciones de 3,57 GB y 4,22 GB respectivamente permiten ejecutar el modelo en mini-PCs o placas con 8 GB de RAM compartida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según la tabla del autor: IQ2_M ~3 GB, IQ3_M ~4 GB, IQ4_XS ~5 GB, Q4_K_M ~5 GB, Q5_K_M ~6 GB, Q6_K ~7 GB, Q8_0 ~9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para las cuantizaciones mayores o para servir varias instancias.
- Cabe en GPU de consumo: sí, desde IQ2_M en GPUs de 4 GB hasta Q8_0 en GPUs de 10-12 GB. Las variantes IQ2_M e IQ3_M también son viables en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli -hf liodon-ai/LoCo-7B-imatrix-GGUF:Q4_K_M`), Ollama (`ollama run hf.co/liodon-ai/LoCo-7B-imatrix-GGUF:Q4_K_M`), LM Studio y Jan. vLLM y TGI no se mencionan en la documentación; su compatibilidad con GGUF no está confirmada para este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/LoCo-7B-imatrix-GGUF | 7,6 B | No disponible | IQ2_M a Q8_0 con iMatrix | other | Hugging Face, Ollama, LM Studio, Jan |
| liodon-ai/LoCo-7B-GGUF | 7,6 B | No disponible | GGUF sin iMatrix | other | Hugging Face |
| MuyaoYuan/LoCo-7B | 7,6 B | No disponible | Safetensors (base) | other | Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6 B (aprox.) | No disponible en esta ficha | Safetensors y GGUF de terceros | MIT según el modelo original (verificar) | Hugging Face |

La comparativa se limita a los modelos de la cadena declarada, ya que no se dispone de datos de rendimiento que permitan contrastar con alternativas de otros autores. La diferencia práctica entre esta publicación y la variante sin iMatrix es la calibración por importancia, que el autor presenta como una mejora de calidad a igual tamaño de archivo.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos en la documentación proporcionada; es imprescindible revisar la licencia de MuyaoYuan/LoCo-7B y de DeepSeek-R1-Distill-Qwen-7B antes de un uso comercial.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en las cuantizaciones IQ2_M e IQ3_M, donde la pérdida de precisión puede aumentar la incoherencia pese a la calibración iMatrix.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Longitud de contexto no documentada: no se debe asumir la ventana de Qwen2 (habitualmente 32K) sin verificarla en el modelo base.
- Sesgos: no se han publicado análisis de sesgos en la información disponible.
- El modelo está pensado para inferencia local; el rendimiento en producción con múltiples usuarios concurrentes no está documentado.
- El repositorio tiene 128 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La fecha de creación del repositorio (2026-11-04) debe tratarse con cautela si se integra en un pipeline con requisitos de auditoría.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/LoCo-7B-imatrix-GGUF
- Variante sin iMatrix: https://huggingface.co/liodon-ai/LoCo-7B-GGUF
- Modelo base: https://huggingface.co/MuyaoYuan/LoCo-7B
- Modelo de referencia en la cadena: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Dataset de calibración: https://huggingface.co/datasets/wikitext
- Perfil del autor: https://huggingface.co/liodon-ai
