# ahmedselhady/XSDPO-Nemotron-1.5B-500x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1

## Resumen

XSDPO-Nemotron-1.5B es un ajuste fino (fine-tuning) del modelo de razonamiento Nemotron-Research-Reasoning-Qwen-1.5B, desarrollado por NVIDIA, publicado por el usuario ahmedselhady en Hugging Face. Se trata de un checkpoint experimental resultante de una ejecución de entrenamiento con SDPO (una variante de optimización de preferencias tipo DPO aplicada sobre trayectorias de razonamiento), identificada en el nombre del repositorio como `macereason-math-500x5-nemotron-1.5b-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1`.

El modelo conserva la arquitectura Qwen2 del modelo base, con 1.777.088.000 parámetros totales (aproximadamente 1,5B según la nomenclatura comercial) y pesos en formato safetensors. El nombre del run sugiere un entrenamiento orientado a matemáticas y razonamiento (`math`, `macereason`), con 500 iteraciones por 5 épocas, learning rate 3e-6, coeficiente KL de 0,001 y una referencia congelada, en un régimen aparentemente solo en inglés (`en_only`).

Su relevancia es acotada: es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva más allá de los metadatos del run. Resulta útil para quien quiera reproducir o inspeccionar los efectos del entrenamiento SDPO sobre un modelo de razonamiento pequeño, pero no constituye un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del modelo base) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el nombre del run indica `en_only`, no confirmado en model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`, es decir, un transformer decoder-only de la familia Qwen2 con atención por causalidad estándar y aproximadamente 1,5B parámetros. No se documentan en la información disponible cambios estructurales respecto al base, por lo que se asume una arquitectura idéntica con pesos ajustados.

El entrenamiento corresponde a una ejecución de SDPO (variante de optimización de preferencias sobre trayectorias de razonamiento) etiquetada como `macereason-math-500x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1`. Los identificadores indican: dataset o tarea de matemáticas (`macereason-math`), 500 pasos por 5 épocas, learning rate 3e-6, coeficiente KL de 0,001 frente a una referencia congelada (`frozen`), tamaño de referencia 10752, ventana o top-k de 512, idioma inglés (`en_only`) y un parámetro alpha de 1. La revisión publicada corresponde al checkpoint step 150, y el autor indica que la rama por defecto sigue el último paso publicado, pudiéndose cargar revisiones concretas con `revision="step-150"`. No se detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si hubo etapas adicionales de RLHF o DPO más allá del propio SDPO.

## Capacidades

- Generación de texto conversacional y de razonamiento, heredadas del modelo base Nemotron-Research-Reasoning-Qwen-1.5B.
- Razonamiento matemático y de tipo cadena de pensamiento, presumiblemente reforzado por el entrenamiento en `macereason-math`.
- Generación de código y respuesta a instrucciones, en la medida en que lo soporte el modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el base es un modelo de razonamiento, pero no hay confirmación de integración con frameworks de agentes.
- Capacidades multilingües: no disponibles; el identificador del run sugiere entrenamiento solo en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre optimización de preferencias: el checkpoint permite estudiar cómo afecta SDPO con KL frente a referencia congelada al comportamiento de razonamiento de un modelo de 1,5B, comparando el step 150 con el modelo base.
- Reproducción de experimentos de razonamiento matemático: útil para replicar el pipeline `macereason-math` y medir la evolución de la precisión en problemas aritméticos y algebraicos entre checkpoints.
- Evaluación comparativa de checkpoints intermedios: al publicarse múltiples revisiones (`step-150` y otras), se puede trazar la curva de aprendizaje y detectar degradación o sobreajuste.
- Generación de soluciones paso a paso en entornos educativos controlados: el modelo puede producir cadenas de razonamiento matemático, siempre con verificación humana dado su tamaño reducido.
- Prototipado de asistentes de resolución de problemas en local: con 1,5B parámetros y pesos safetensors, es viable desplegarlo en una GPU de consumo para pruebas de concepto.
- Base para nuevos ajustes finos: sirve como punto de partida para experimentos de destilación o de alineación adicional sobre tareas de razonamiento en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 3,5-4 GB solo para pesos, más overhead de activaciones y caché KV (el total práctico suele situarse en 5-7 GB según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: aproximadamente 2 GB de pesos; en 4 bits, en torno a 1-1,2 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para cuantización 4/8 bits bastan GPUs de 4-6 GB (GTX 1660 Super, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de modelos recientes con 6 GB o más en cuantización, y con 8 GB o más en precisión completa.
- Opciones de despliegue: transformers (formato nativo safetensors), text-generation-inference (el repo incluye el tag `text-generation-inference`) y endpoints compatibles; para llama.cpp/Ollama sería necesario convertir los pesos a GGUF, algo no publicado por el autor.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5B, en una RTX 4090 se espera un throughput alto en generación corta, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1,78B | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint experimental SDPO step 150 |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1,5B | no disponible en la informacion | no disponible | Hugging Face (modelo base) | Modelo de razonamiento de referencia de NVIDIA |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública) | Hugging Face, ampliamente distribuido | Alternativa generalista con licencia permisiva |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | 32.768 tokens (según documentación pública) | MIT (según documentación pública) | Hugging Face, muy descargado | Destilado de razonamiento con amplia adopción |

## Limitaciones y advertencias

- Modelo experimental con cero descargas y sin model card descriptiva: no hay evidencia pública de calidad, estabilidad ni evaluación independiente.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor o asumirse riesgo legal.
- Idiomas: el identificador `en_only` sugiere entrenamiento exclusivamente en inglés; el rendimiento en castellano es incierto y probablemente deficiente.
- Riesgo de alucinación: al ser un modelo de 1,5B orientado a razonamiento, puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en matemáticas de varios pasos.
- Sesgos: no documentados; al heredar del base y entrenarse sobre un dataset no descrito, pueden persistir sesgos del corpus original.
- Contexto: no se especifica la longitud de contexto soportada; no debe asumirse la del base sin verificación.
- Checkpoint intermedio (step 150): puede no representar el mejor estado del entrenamiento; conviene comparar con otras revisiones antes de usarlo.
- Sin variantes cuantizadas publicadas: el despliegue en entornos con poca VRAM requiere conversión manual a GGUF u otros formatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-500x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
