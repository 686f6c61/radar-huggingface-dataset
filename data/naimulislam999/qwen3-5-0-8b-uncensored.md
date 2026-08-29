# naimulislam999/Qwen3.5-0.8B-Uncensored

## Resumen

Qwen3.5-0.8B-Uncensored es una versión modificada del modelo Qwen/Qwen3.5-0.8B mediante una técnica de ablación direccional (también conocida como "abliteration"). El autor, naimulislam999, ha identificado la dirección de rechazo en el flujo residual del modelo y la ha proyectado fuera de los pesos, reduciendo la tendencia del modelo a negarse a responder a instrucciones dañinas o no deseadas. No se ha realizado ningún fine-tuning: se trata de una edición lineal de rango 1 aplicada directamente a las matrices de escritura residual.

El modelo tiene 752 millones de parámetros y está pensado exclusivamente para investigación en interpretabilidad mecanicista, red-teaming y estudio de la seguridad en modelos de lenguaje. Su relevancia radica en que permite estudiar cómo se codifica el comportamiento de rechazo en modelos pequeños y cómo una intervención lineal puede alterarlo, con una deriva de capacidades mínima (KL media de 0,005 frente al modelo base). La licencia Apache 2.0 facilita su uso en entornos académicos, aunque el autor advierte explícitamente de que no debe desplegarse en productos sin añadir una capa de seguridad propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (0,75 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer denso de 0,8 B parámetros orientado a generación de texto. Según la información disponible en la búsqueda web, la familia Qwen3.5 incorpora un entrenamiento de fusión temprana con tokens multimodales, aunque esta versión abliterada se limita a texto (pipeline `text-generation`). No se dispone de detalles sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base.

La modificación aplicada es una ablación direccional "horneada" (baked) en los pesos. El método, descrito en Arditi et al. (2024), consiste en extraer la dirección de rechazo mediante diferencia de medias sobre pares de instrucciones dañinas e inofensivas, y luego ortogonalizar todas las matrices de escritura residual (embedding, salida de atención y salida de MLP) contra ese subespacio. La configuración utilizada fue: capa de dirección 23, alpha 0,8834, y rango de capas 18 a 22. No hubo entrenamiento adicional; es una edición lineal de rango 1.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-0.8B.
- Razonamiento básico y comprensión de instrucciones, aunque la ablación puede causar una deriva leve de capacidades (KL media de 0,005 frente al base).
- Capacidad reducida de rechazo: el modelo tiende a responder incluso a instrucciones dañinas o no seguras, lo que lo hace útil para estudiar el comportamiento de seguridad.
- No se ha confirmado soporte para tool calling, function calling, ni capacidades multimodales en esta versión abliterada.
- Multilingüismo: no se han publicado datos sobre los idiomas soportados.

## Casos de uso

- Investigación en interpretabilidad mecanicista: permite estudiar cómo se codifica el rechazo en el flujo residual y qué capas son más relevantes para ese comportamiento, usando la configuración de ablación documentada.
- Red-teaming de modelos de lenguaje: sirve como herramienta para generar respuestas sin restricciones y evaluar la robustez de los sistemas de seguridad existentes.
- Desarrollo de defensas: al comparar el comportamiento del modelo abliterado con el base, se pueden diseñar contramedidas más efectivas contra ataques de jailbreak.
- Evaluación de deriva de capacidades: el valor de KL media (0,005) permite cuantificar cuánto cambia la distribución de salidas tras una intervención lineal, útil para calibrar otras técnicas de edición de modelos.
- Benchmarking de técnicas de ablación: puede usarse como referencia para comparar diferentes métodos de eliminación de comportamientos no deseados en modelos pequeños.
- Estudio de la redundancia de la seguridad: la model card indica que la seguridad está codificada de forma redundante, por lo que este modelo permite explorar qué fracción del comportamiento de rechazo se elimina con una única dirección.

## Benchmarks y rendimiento

La model card proporciona tres métricas de evaluación, medidas sobre el modelo abliterado:

| Metrica | Valor |
|---|---|
| Tasa de rechazo (refusal_rate) | 0,0 |
| KL media (mean_kl) | 0,005 |
| Coherencia (coherence) | 0,845 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La tasa de rechazo se mide sobre instrucciones dañinas reservadas; la KL media mide la divergencia de las distribuciones de siguiente token frente al modelo base en instrucciones benignas (menor valor implica menor deriva de capacidades). La coherencia es una métrica propia del autor, sin definición detallada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 752 M parámetros, en FP16 ocupa aproximadamente 1,5 GB; en cuantización 8-bit ~0,75 GB; en 4-bit ~0,5 GB. Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) e incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16, o 1 GB para cuantización 4-bit. No requiere hardware especializado.
- Opciones de despliegue: al ser un modelo transformers estándar, puede ejecutarse con vLLM, llama.cpp (si se generan pesos GGUF), Ollama, o directamente con la librería transformers de HuggingFace.
- Latencia y throughput: no se han publicado datos específicos, pero por su tamaño reducido se espera una latencia baja (del orden de decenas de milisegundos por token en GPU consumer) y un throughput alto en entornos con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tecnica | Notas |
|---|---|---|---|---|---|
| naimulislam999/Qwen3.5-0.8B-Uncensored | 0,75 B | no disponible | Apache 2.0 | Ablacion direccional | Este modelo |
| lainlives/Qwen3.5-0.8B-uncensored | 0,75 B | no disponible | no disponible | no especificada | Version alternativa sin censura |
| darkmaniac7/Qwen3.5-0.8B-uncensored-MNN | 0,75 B | no disponible | no disponible | no especificada | Version optimizada para MNN |
| Qwen/Qwen3.5-0.8B (base) | 0,75 B | no disponible | Apache 2.0 | - | Modelo original con guardarrailes |

No se dispone de datos de rendimiento comparativo entre estas versiones. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- La ablación es una edición lineal brusca: puede dejar rechazos residuales en ciertos dominios y provocar una deriva leve de capacidades (reflejada en la KL media de 0,005).
- La seguridad está codificada de forma redundante en los modelos de lenguaje; una única dirección rara vez elimina todo el comportamiento de rechazo, por lo que el modelo puede seguir negándose en algunos casos.
- La evaluación solo cubre las métricas indicadas en la model card; el comportamiento en otros dominios o idiomas puede diferir sustancialmente.
- El modelo tiene los guardarrailes de seguridad deliberadamente debilitados y producirá contenido dañino, inseguro u objetable con más facilidad que el modelo base. No debe desplegarse en productos orientados al usuario sin añadir una capa de seguridad propia.
- El autor declina toda responsabilidad por mal uso; el usuario debe cumplir con la licencia del modelo base y con las leyes aplicables.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de contexto, por lo que estos aspectos no pueden evaluarse con la información disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/naimulislam999/Qwen3.5-0.8B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de referencia (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Version alternativa sin censura: https://huggingface.co/lainlives/Qwen3.5-0.8B-uncensored
- Version optimizada para MNN: https://huggingface.co/darkmaniac7/Qwen3.5-0.8B-uncensored-MNN
- Modelo base en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Comparativa en Ollama: https://ollama.com/vaultbox/qwen3.5-uncensored
