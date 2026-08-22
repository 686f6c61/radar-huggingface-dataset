# DragonAura/VidRec-fp8

## Resumen

El modelo DragonAura/VidRec-fp8 es un checkpoint publicado en Hugging Face por el usuario DragonAura. Se trata de un modelo de tipo safetensors etiquetado con la arquitectura Qwen3-VL, lo que sugiere que es una variante o adaptación del modelo multimodal Qwen3-VL, aunque no se proporciona ninguna descripción adicional en la model card. El nombre "VidRec" podría hacer referencia a tareas de reconocimiento o recuperación de vídeo, pero no hay confirmación oficial. La característica más destacable es su cuantización en formato FP8, que reduce el uso de memoria y acelera la inferencia en hardware compatible con esta precisión.

Con aproximadamente 9,7 mil millones de parámetros y un tamaño de repositorio de 12,5 GB, este modelo está pensado para ser ejecutado en GPUs con suficiente VRAM, especialmente aquellas que soportan cómputo FP8 (como las NVIDIA H100, L40S o RTX 4090 con soporte de FP8). Sin embargo, al no existir una model card detallada, no se dispone de información sobre el entrenamiento, los datos utilizados, las capacidades exactas ni los benchmarks. Esta ficha se basa únicamente en los metadatos disponibles y en el conocimiento general de la familia Qwen3-VL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (según etiqueta) |
| Parámetros totales | 9.696.775.920 (~9,7B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (inferido del nombre del modelo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna, los datos de entrenamiento, el número de tokens utilizados ni las técnicas de alineación (como RLHF o DPO). El único dato relevante es la etiqueta `qwen3_vl`, que sugiere que el modelo base es un Qwen3-VL, una arquitectura multimodal que combina un codificador de visión con un modelo de lenguaje, diseñada para comprender imágenes y vídeo. Sin embargo, no se puede confirmar que este checkpoint sea una cuantización directa de un modelo Qwen3-VL específico, ni si se ha realizado un fine-tuning posterior.

La cuantización FP8 es una técnica de reducción de precisión que permite almacenar los pesos en formato de punto flotante de 8 bits, lo que reduce el consumo de memoria y acelera la inferencia en GPUs modernas, manteniendo una degradación mínima de la precisión en comparación con BF16 o FP16. No se conocen detalles sobre el método de cuantización empleado (por ejemplo, si se usó `compressed-tensors`, como sugiere una de las etiquetas).

## Capacidades

- **Multimodalidad**: Al estar basado en Qwen3-VL, se espera que pueda procesar imágenes y vídeo, además de texto. Sin embargo, no hay evidencia de que las capacidades específicas se hayan mantenido o modificado.
- **Generación de texto**: Como modelo de lenguaje, probablemente pueda generar texto coherente en varios idiomas, pero no se confirma.
- **Razonamiento y comprensión**: Sin datos de benchmarks, no se puede afirmar un nivel de rendimiento concreto.
- **Tool calling y agentes**: No hay información sobre soporte de estas funcionalidades.
- **Idiomas**: Desconocido; probablemente hereda los idiomas de Qwen3-VL, pero no se especifica.

Dado que la model card está vacía, no se puede garantizar ninguna capacidad específica. El usuario debe asumir que las capacidades son las del modelo base Qwen3-VL, pero con la incertidumbre de que la cuantización FP8 puede afectar a la precisión en tareas de alta sensibilidad.

## Casos de uso

No se dispone de información suficiente para proponer casos de uso concretos y realistas. La ausencia de documentación y de benchmarks impide recomendar aplicaciones prácticas. Se recomienda tratar este modelo como un experimento de cuantización y realizar pruebas propias antes de considerar su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No es posible comparar su rendimiento con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: Con 9,7B parámetros en FP8, el peso del modelo ocupa aproximadamente 9,7 GB (12,5 GB del repositorio incluye otros archivos). Para inferencia con contexto largo, se recomienda al menos 12-16 GB de VRAM.
- **GPU recomendadas**: GPU con soporte FP8, como NVIDIA H100, A100 (con soporte FP8 en versiones recientes), RTX 4090 (soporta FP8 en inferencia), o RTX 3090 (aunque no tiene soporte nativo FP8, se puede ejecutar con conversión a FP16). También se puede ejecutar en CPUs con menor rendimiento.
- **Cabe en GPU de consumo**: Sí, en una RTX 4090 con 24 GB de VRAM cabe con holgura.
- **Opciones de despliegue**: Se puede servir con vLLM, llama.cpp (aunque FP8 puede no estar soportado en todas las versiones), o con el framework de Hugging Face Transformers. La cuantización FP8 requiere kernels específicos, como los de TensorRT-LLM o vLLM con soporte FP8.
- **Latencia y throughput**: No disponibles sin pruebas.

## Comparativa con modelos similares

No hay datos oficiales para comparar este modelo con otros. Como referencia genérica, la familia Qwen3-VL incluye versiones de 8B y 72B, y este modelo parece ser una versión cuantizada de un tamaño intermedio. Sin embargo, no se puede confirmar la equivalencia con Qwen3-VL-8B. Se recomienda consultar los benchmarks de Qwen3-VL originales si se necesita una referencia.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: Al no existir documentación, se desconoce si se ha mitigado el sesgo o la tendencia a alucinar. Como modelo multimodal, puede inventar información sobre imágenes o vídeos.
- **Pérdida de precisión por cuantización**: La cuantización FP8 puede introducir pequeñas degradaciones en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o matemáticas.
- **Idiomas**: No se especifican los idiomas soportados; el modelo base Qwen3-VL soporta principalmente inglés y chino, pero no se garantiza para este checkpoint.
- **Restricciones de licencia**: La licencia Apache-2.0 permite uso comercial, pero hay que revisar si el modelo base tiene restricciones adicionales (por ejemplo, el uso de Qwen3-VL puede tener términos específicos).
- **Riesgo en producción**: Sin validación de benchmarks, no se recomienda usar en entornos productivos sin pruebas exhaustivas.

## Enlaces

- [Hugging Face - DragonAura/VidRec-fp8](https://huggingface.co/DragonAura/VidRec-fp8)
- No se han encontrado otros enlaces (papers, repositorios, demos) relacionados con este modelo concreto.
