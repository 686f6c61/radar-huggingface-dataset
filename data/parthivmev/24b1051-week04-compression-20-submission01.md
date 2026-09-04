# ParthivMEV/24b1051-Week04-Compression-20-Submission01

## Resumen

Este repositorio contiene un checkpoint comprimido del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario ParthivMEV como entrega de la semana 4 (Track 1, submission 20%) del curso CS6013 sobre IA eficiente. No es un modelo nuevo ni un fine-tuning, sino una cuantización post-entrenamiento que reduce el peso de los parámetros de 8.044.982.000 bytes en BF16 a 1.596.568.736 bytes, es decir, un 19,84% del tamaño original.

El método de compresión es un empaquetado por grupos (group size 128) que combina NF3 (3 bits) y, de forma selectiva, W4 (4 bits), con escalas en FP16. Para usar el modelo en un runtime estándar, el autor proporciona un script de dequantización que reconstruye un checkpoint BF16. No se han publicado evaluaciones de capacidades, benchmarks ni datos sobre los idiomas soportados, por lo que su utilidad real en producción es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4B (según la nomenclatura del modelo base; no se detalla en la información) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF3 (3 bits) y W4 (4 bits) empaquetados por grupos, group size 128, escalas FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato comprimido personalizado (NF3/W4 empaquetado); script de dequantización a BF16 incluido |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino un checkpoint comprimido del modelo base Qwen/Qwen3-4B-Instruct-2507. La compresión se realiza mediante un método de cuantización por grupos (group size 128) que empaqueta los pesos en NF3 (3 bits) y, de forma selectiva, en W4 (4 bits), utilizando escalas en FP16. El resultado reduce el peso de los parámetros de 8.044.982.000 bytes (BF16) a 1.596.568.736 bytes, lo que supone un ratio del 19,8455% del tamaño original.

No se proporcionan datos sobre el entrenamiento del modelo base ni sobre procesos de RLHF o DPO. La compresión es post-entrenamiento, sin ajuste fino adicional. El único propósito declarado del checkpoint es servir como entrega académica para la asignatura CS6013.

## Capacidades

- No se han publicado evaluaciones de capacidades para este checkpoint en la información disponible.
- Al ser una cuantización de Qwen3-4B-Instruct-2507, se espera que conserve las capacidades del modelo base, pero no hay confirmación oficial.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- No se indican idiomas soportados ni datos de contexto.
- La única funcionalidad verificable es la dequantización a BF16 mediante el script incluido en el repositorio.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint sirve como caso de estudio de cuantización NF3/W4, permitiendo comparar la reconstrucción y la pérdida de calidad frente al modelo base.
- Material docente para cursos de eficiencia computacional: el repositorio incluye código de reconstrucción, lo que facilita analizar la implementación de cuantización por grupos y el trade-off entre compresión y precisión.
- Despliegue en entornos con memoria limitada: al ocupar ~1,6 GB en disco, podría ser útil para prototipos en dispositivos edge, siempre que se implemente un runtime compatible con el formato NF3/W4.
- Fine-tuning posterior a la dequantización: reconstruyendo el modelo a BF16 se puede usar como punto de partida para ajuste fino en GPUs con 16 GB o más de VRAM.
- Evaluación de técnicas de cuantización: el script de dequantización permite reconstruir el checkpoint y ejecutar benchmarks estándar para medir la degradación frente al modelo original.
- Prototipado de asistentes conversacionales: si el modelo base soporta diálogo, este checkpoint podría emplearse como base, aunque requiere dequantización previa y no hay datos que confirmen su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: 1,6 GB en formato comprimido; 8,04 GB al reconstruir en BF16.
- VRAM estimada para inferencia en BF16: al menos 8 GB para los pesos más overhead de activaciones; se recomiendan 12-16 GB para contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB, o cualquier GPU con 16 GB de VRAM si se usa BF16.
- Formato comprimido: no existe runtime oficial; para usarlo directamente se necesitaría implementar un kernel NF3/W4 o convertir a un formato estándar.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no soportan este formato personalizado. El flujo previsto es dequantizar a BF16 con el script incluido y luego usar un runtime estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se disponen de modelos comparables en la información proporcionada. A continuación se muestra una comparación entre este checkpoint y su modelo base, que es la única referencia disponible.

| Modelo | Parametros | Contexto | Licencia | Tamaño de pesos |
|---|---|---|---|---|
| Checkpoint comprimido (este repo) | 4B (base) | No disponible | Apache-2.0 | 1,6 GB comprimido |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | No disponible | No especificada | 8,04 GB (BF16) |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad, por lo que el comportamiento real del modelo es desconocido.
- El formato de pesos no es estándar; los runtimes populares no lo soportan y se requiere dequantización a BF16 antes de su uso.
- La cuantización agresiva (NF3/W4 con group size 128) puede provocar una pérdida significativa de calidad respecto al modelo base.
- No hay datos sobre los idiomas soportados, la longitud de contexto ni las capacidades de tool calling.
- Al ser un modelo pequeño, existe riesgo de alucinación, aunque no se ha medido en este checkpoint.
- La licencia del repositorio es Apache-2.0, pero el usuario debe verificar la licencia del modelo base Qwen3-4B-Instruct-2507, que no se detalla en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ParthivMEV/24b1051-Week04-Compression-20-Submission01
- Repositorio de reconstrucción: https://github.com/Parthiv-MEV/CS6013/tree/main/24b1051/Week04/Compression_20/Submission01
