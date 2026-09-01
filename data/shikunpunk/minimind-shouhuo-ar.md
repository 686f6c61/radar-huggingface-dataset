# shikunpunk/MiniMind-ShouHuo-AR

## Resumen

MiniMind-ShouHuo-AR es un modelo de lenguaje autoregresivo de 63,91 millones de parámetros desarrollado por shikunpunk, entrenado desde cero exclusivamente con el corpus OCR de la revista literaria china *Shouhuo* (《收获》, "Cosecha"). El modelo pertenece a la familia MiniMind, una serie de modelos pequeños diseñados para experimentar con el entrenamiento de LLMs desde cero, y su objetivo es explorar la generación de prosa literaria en chino con una arquitectura mínima.

El modelo utiliza una arquitectura MiniMind AR con atención softmax estándar, 8 capas de transformer, un tamaño oculto de 768 y un vocabulario de 6.400 tokens. Se entrenó durante una sola época sobre 52.869 pasajes de texto que cubren 242 números de la revista, con una ventana de contexto máxima de 512 tokens durante el entrenamiento (aunque la configuración admite longitudes mayores). Su relevancia radica en ser un experimento de preentrenamiento puro sobre un corpus literario acotado, sin instrucciones de ajuste fino, lo que permite estudiar las capacidades emergentes de generación narrativa en modelos de muy pequeña escala.

El modelo se distribuye con pesos en formato PyTorch, un tokenizador MiniMind, scripts de generación y el propio corpus de preentrenamiento depurado, lo que facilita la reproducibilidad y la inspección del proceso de entrenamiento. Está pensado para investigadores y desarrolladores interesados en la generación de texto literario en chino con recursos computacionales limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMind AR (Transformer causal con Softmax Attention) |
| Parametros totales | 63,91 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (entrenamiento); configuracion admite longitudes mayores |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en FP32/FP16 PyTorch) |
| Idiomas soportados | Chino (principalmente) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth), config.json, tokenizer.json |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MiniMind AR, una implementación de transformer causal con atención softmax estándar, sin mecanismos de atención lineal ni mezclas de expertos. Consta de 8 capas de transformer con un tamaño oculto de 768 y un vocabulario de 6.400 tokens, lo que lo convierte en un modelo extremadamente compacto. El entrenamiento se realizó desde cero (random initialization, `from_weight=none`) sobre un corpus de 52.869 pasajes de texto extraídos mediante OCR de 242 números de la revista *Shouhuo*. Se empleó una única época con un batch size de 16 y una longitud máxima de secuencia de 512 tokens, alcanzando una pérdida final de 4,3941.

El corpus de entrenamiento se construyó a partir de los PDF de la revista, con un proceso de limpieza que excluyó páginas con errores, páginas vacías, marcadores de posición corruptos, caracteres de control, páginas duplicadas y páginas de índice o información editorial. El autor advierte que el OCR original puede contener errores de reconocimiento residuales, aunque se incluyen los scripts de limpieza y muestras de experimentos para permitir la verificación. No se aplicó ningún proceso de ajuste fino por instrucciones (SFT) ni de optimización por preferencias humanas (RLHF/DPO); el modelo es un preentrenamiento puro.

## Capacidades

- Generación de texto narrativo en chino: produce oraciones y fragmentos narrativos coherentes a nivel local, con una proporción de chino de aproximadamente el 80,7% en las salidas evaluadas.
- Generación de novelas cortas: el script `gen_shouhuo_ar.py` permite generar continuaciones o nuevas historias a partir de un prompt, con control de temperatura y top-p.
- Modo raw y modo chat: aunque el modelo no ha sido entrenado con instrucciones, el script soporta ambos modos; el modo raw se recomienda por estar más cerca de la distribución de entrenamiento.
- Reproducibilidad: se incluyen 12 experimentos de generación (4 prompts × 3 temperaturas) con sus resultados documentados en `data/shouhuo_novel_experiments.md`.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales (visión, audio), ni idiomas distintos del chino con calidad suficiente.

## Casos de uso

- Experimentación académica en generación de texto literario: el modelo sirve como banco de pruebas para estudiar cómo modelos de menos de 100M de parámetros aprenden estructuras narrativas básicas a partir de un corpus literario homogéneo. Los investigadores pueden analizar las salidas y compararlas con el corpus original.
- Prototipado rápido de generación de historias en chino: gracias a su pequeño tamaño, puede ejecutarse en CPU o GPU de gama baja, permitiendo iterar rápidamente sobre prompts y parámetros de decodificación (temperatura, top-p) sin necesidad de infraestructura costosa.
- Generación de borradores creativos: escritores o aficionados pueden usarlo para obtener ideas iniciales o fragmentos de inspiración a partir de un prompt, aunque la coherencia a largo plazo es limitada y requiere edición posterior.
- Enseñanza de arquitecturas transformer: al ser un modelo mínimo y autónomo (con definición de modelo incluida en `model_minimind.py`), es útil para demostrar el pipeline completo de preentrenamiento, tokenización y generación en cursos de procesamiento de lenguaje natural.
- Análisis de estilos literarios: el corpus de *Shouhuo* es un recurso valioso para estudiar la evolución de la prosa china contemporánea; el modelo puede emplearse para generar variaciones estilísticas y compararlas con el texto original.
- Evaluación de métricas de calidad en generación: los 12 experimentos incluidos permiten reproducir la evaluación de calidad del autor (proporción de chino, presencia de caracteres de control, coherencia) y servir como referencia para otros modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta la pérdida final de entrenamiento (4,3941) y una evaluación cualitativa de 12 generaciones experimentales, con los siguientes hallazgos:

- Las 12 salidas no estaban vacías y no contenían caracteres de reemplazo ni caracteres de control.
- La proporción de caracteres chinos en las salidas fue de aproximadamente el 80,7%.
- Las salidas forman oraciones chinas y fragmentos narrativos, pero la consistencia de personajes, la relación causal y la coherencia a largo plazo son limitadas.
- La temperatura de 0,8 se recomienda como valor por defecto; 1,1 produce salidas más aleatorias sin mejorar la coherencia.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 63,91M de parámetros, los pesos en FP32 ocupan aproximadamente 256 MB; en FP16, unos 128 MB. La inferencia puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior permitiría generación en tiempo real. También es viable en hardware de gama baja como una GTX 1650 o incluso en Raspberry Pi con suficiente RAM.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU de consumo moderna e incluso en sistemas sin GPU.
- Opciones de despliegue: el script `gen_shouhuo_ar.py` permite generación directa; al ser un modelo PyTorch estándar, puede adaptarse a vLLM, llama.cpp u Ollama si se convierte a GGUF, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamaño, se espera una latencia de decenas de milisegundos por token en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| MiniMind-ShouHuo-AR | 63,91M | 512 | Preentrenamiento puro sobre corpus *Shouhuo* | no disponible |
| MiniMind-YuHua-AR | 104M | no disponible | Preentrenamiento sobre corpus de Yu Hua + SFT CoT | no disponible |
| MiniMind-YuHua-AR-v2 | 104M | no disponible | Preentrenamiento puro + SFT CoT v2 | no disponible |

Los tres modelos pertenecen a la misma familia MiniMind y comparten arquitectura base, pero difieren en tamaño, corpus y metodología de entrenamiento. MiniMind-YuHua-AR y su versión v2 están orientados a imitar el estilo de un autor específico (Yu Hua) e incorporan ajuste fino por instrucciones, mientras que MiniMind-ShouHuo-AR es un preentrenamiento puro sobre una revista literaria. No se dispone de comparativas de rendimiento cuantitativas entre ellos.

## Limitaciones y advertencias

- Modelo de preentrenamiento puro: no ha sido ajustado con instrucciones, por lo que no sigue comandos de forma fiable; el modo chat está disponible pero no se recomienda para producción.
- Coherencia limitada: la consistencia de personajes, la causalidad y la coherencia a largo plazo son débiles; las salidas pueden divagar o perder el hilo narrativo.
- Errores de OCR: el corpus de entrenamiento proviene de OCR de PDFs y puede contener errores de reconocimiento residuales, lo que puede afectar a la calidad del texto generado.
- Sesgo de dominio: el modelo solo ha visto contenido de la revista *Shouhuo* (242 números), por lo que su vocabulario y estilo están restringidos a ese dominio literario; no es adecuado para tareas generales.
- Licencia no especificada: no se indica la licencia del modelo ni del corpus, lo que genera incertidumbre sobre su uso comercial o la redistribución de los pesos.
- Sin soporte multilingüe: el modelo está especializado en chino; las salidas en otros idiomas serán de baja calidad o contendrán caracteres no deseados.
- Sin garantías de seguridad: al ser un modelo experimental sin alineación, puede generar contenido inapropiado o sensible si se le solicita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shikunpunk/MiniMind-ShouHuo-AR
- Proyecto MiniMind (autor original de la arquitectura): https://jingyaogong.github.io/minimind/
- Repositorio GitHub de jingyaogong (autor de MiniMind): https://github.com/jingyaogong/
- Modelo relacionado MiniMind-YuHua-AR: https://huggingface.co/shikunpunk/MiniMind-YuHua-AR
- Modelo relacionado MiniMind-YuHua-AR-v2: https://huggingface.co/shikunpunk/MiniMind-YuHua-AR-v2
