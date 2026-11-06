# No752/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribución cuantizada del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario No752. El repositorio empaqueta los pesos del modelo base en múltiples formatos (GGUF, safetensors FP8/INT8/NVFP4 y MLX en 4, 6 y 8 bits) junto con los ficheros complementarios necesarios para su uso en ComfyUI: el text encoder Qwen3-VL de 8B y el VAE específico del modelo. El objetivo es facilitar la inferencia local en hardware de consumo, algo inviable con los pesos en BF16 originales.

El modelo base es un sistema de text-to-image de Qwen con aproximadamente 7.115 millones de parámetros en el transformador de difusión, según los metadatos de safetensors del repositorio. La variante "Uncensored" sugiere que se han eliminado o atenuado los filtros de contenido del modelo original, aunque la model card no documenta explícitamente el procedimiento de modificación aplicado. Esta ausencia de documentación es relevante para cualquier evaluación de riesgos.

El repositorio tiene un tamaño total de 105,2 GB e incluye tanto la versión "uncensored" como los ficheros GGUF del modelo base sin modificar. La licencia declarada es `qwen-research`, lo que restringe el uso a fines de investigación y excluye explícitamente el uso comercial. El modelo se distribuye sin métricas de adopción (0 descargas, 0 likes) y fue creado el 1 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (text-to-image); detalles internos no disponibles |
| Parametros totales | 7.115.124.736 (transformador de difusion, segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el text encoder Qwen3-VL es multilingue) |
| Licencia | qwen-research (uso restringido a investigacion; no comercial) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base Qwen-Image-2.1 más allá de su naturaleza de modelo de difusión para generación de imágenes a partir de texto. El transformador de difusión contiene 7.115 millones de parámetros y se acompaña de un text encoder Qwen3-VL de 8B (17,53 GB en BF16, 9,35 GB en INT8) y un VAE de 676 MB en BF16. Esta separación en tres componentes (difusión, encoder de texto y VAE) es típica de los pipelines de difusión latente modernos y explica el desglose de ficheros del repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del modelo base. La model card únicamente incluye una imagen de benchmark sin datos numéricos asociados. El proceso de cuantización aplicado por el autor tampoco está descrito en detalle: se desconoce si la variante "Uncensored" implica un fine-tuning, una modificación de los pesos o simplemente la eliminación de filtros en el pipeline de inferencia.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el pipeline de difusión del modelo base.
- Procesamiento de prompts en lenguaje natural a través del text encoder Qwen3-VL de 8B, que aporta capacidades de comprensión multimodal al codificador.
- Ejecución local en ComfyUI mediante el nodo ComfyUI-GGUF (fork de leejet), con soporte nativo para la arquitectura Qwen-Image 2.1.
- Cuantizaciones optimizadas por plataforma: GGUF para CPU/GPU mixtas, NVFP4 e INT8 ConvRot para GPUs compatibles, MLX para Apple Silicon.
- Variante "uncensored" que, según el autor, elimina restricciones de contenido del modelo original (sin documentación del método).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros modos especiales, al tratarse de un modelo de generación de imágenes y no de un LLM.

## Casos de uso

- Generación de imágenes en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (4,60 GB) permite ejecutar el transformador de difusión en GPUs con 8-12 GB de VRAM, algo imposible con los pesos BF16 (14,23 GB).
- Prototipado rápido de pipelines de difusión en ComfyUI: el repositorio incluye todos los ficheros complementarios (text encoder y VAE) en las rutas esperadas, lo que reduce la configuración manual a copiar tres ficheros en los directorios correspondientes.
- Investigación sobre cuantización de modelos de difusión: la disponibilidad de siete formatos distintos (BF16, FP8, INT8, NVFP4, MLX 4/6/8-bit y cinco GGUF) permite comparar la degradación de calidad entre precisiones en un mismo modelo base.
- Inferencia en Apple Silicon: las variantes MLX 4-bit (4,00 GB) y 6-bit (5,78 GB) están pensadas para Macs con memoria unificada, donde el formato GGUF no aprovecha tan bien el hardware.
- Despliegue en GPUs con soporte NVFP4 (arquitecturas Blackwell): la variante NVFP4 de 4,20 GB ofrece el menor tamaño entre los formatos safetensors y está orientada a hardware con aceleración de coma flotante de 4 bits.
- Experimentación con contenido sin filtros: la variante "uncensored" está dirigida a investigadores que necesitan estudiar el comportamiento del modelo sin las restricciones del pipeline original, siempre dentro de los límites de la licencia qwen-research.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmark (`assets/Qwen-Image-2.1-Benchmark.png`) pero no presenta los valores numéricos en texto. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el transformador de difusión: 14,23 GB en BF16, 7,59 GB en Q8_0, 6,63 GB en FP8, 5,88 GB en Q6_K, 5,22 GB en Q5_K_M, 4,60 GB en Q4_K_M, 4,15 GB en Q4_0, 4,20 GB en NVFP4 y 4,00 GB en MLX 4-bit.
- VRAM adicional necesaria: el text encoder Qwen3-VL de 8B ocupa 17,53 GB en BF16 o 9,35 GB en INT8 ConvRot, y el VAE 676 MB. El total en memoria debe sumar transformador, encoder y VAE, salvo que se descarguen secuencialmente.
- GPU recomendadas: para BF16 se requiere una GPU con 24 GB o más (RTX 3090/4090, A100, H100). Para Q4_K_M con encoder INT8 el total ronda los 14-16 GB, lo que cabe en RTX 4080/4090 y GPUs de 16 GB. NVFP4 requiere hardware con soporte nativo (Blackwell).
- Cabe en GPU de consumo: sí, con cuantizaciones Q4/Q5 y el encoder en INT8. Una RTX 3060 de 12 GB puede quedar justa; se recomienda 16 GB o más para comodidad.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (fork de leejet) para GGUF; ComfyUI con safetensors para FP8/INT8/NVFP4; MLX para Apple Silicon. No se documenta soporte para vLLM, llama.cpp u Ollama, que no aplican a modelos de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized | 7,1 B (difusion) | no disponible | qwen-research | GGUF, safetensors, MLX | Hugging Face (0 descargas) |
| Qwen/Qwen-Image-2.1 (base) | 7,1 B (difusion) | no disponible | qwen-research | safetensors | Hugging Face (oficial) |
| Otros modelos text-to-image de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de referencia documentado es el modelo base Qwen/Qwen-Image-2.1, del que esta publicación es una redistribución cuantizada.

## Limitaciones y advertencias

- La licencia `qwen-research` restringe el uso a fines de investigación y excluye el uso comercial. Cualquier despliegue en producción requiere verificar los términos con el titular original (Qwen/Alibaba).
- La variante "uncensored" no documenta el procedimiento de modificación ni los riesgos asociados. La eliminación de filtros de contenido puede facilitar la generación de material dañino, lo que exige salvaguardas adicionales en cualquier uso.
- No se documentan sesgos conocidos del modelo base ni del proceso de cuantización; se desconoce si las cuantizaciones agresivas (4-bit) degradan la fidelidad de forma significativa.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente o no fiel al prompt, especialmente en cuantizaciones de baja precisión.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni reportes de calidad independientes.
- La model card contiene enlaces a rutas de otro usuario (`abenzerps`) en las tablas de ficheros, lo que sugiere una copia o migración incompleta; conviene verificar la integridad de los ficheros antes de usarlos.
- El tamaño total del repositorio (105,2 GB) incluye múltiples formatos redundantes; la descarga selectiva es imprescindible para no saturar el almacenamiento.
- No se dispone de información sobre el comportamiento del modelo con prompts en castellano ni sobre su cobertura multilingüe.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/No752/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de solicitudes del autor: https://abenzerps.com/request-a-model/
