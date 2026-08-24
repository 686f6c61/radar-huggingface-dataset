# qvx-o/QED-Base-v3

## Resumen

QED-Base-v3 es un modelo de lenguaje causal de tipo decoder-only con aproximadamente 154 millones de parámetros, desarrollado por Qarvexium. Se trata de un modelo base, es decir, no ha sido ajustado mediante instrucciones ni alineado para conversación, por lo que su función principal es la continuación de texto y servir como punto de partida para fine-tuning. Su relevancia radica en ser la tercera generación de la familia QED, introduciendo un tokenizador propio entrenado específicamente para esta versión, lo que lo convierte en una herramienta útil para investigar el comportamiento de tokenizadores y arquitecturas a pequeña escala.

La arquitectura sigue el diseño estándar de un transformer decoder-only con atención de consultas agrupadas (GQA), activación SwiGLU, normalización RMSNorm y codificación posicional RoPE. Con una longitud de contexto de 2.048 tokens y un vocabulario de 56.000 entradas, el modelo está pensado para experimentación académica y como base para desarrollos posteriores. Su licencia MIT permite uso comercial sin restricciones, aunque su tamaño reducido limita sus capacidades frente a modelos más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, SwiGLU, RMSNorm y RoPE |
| Parametros totales | ~154M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No especificado (pesos en formato PyTorch) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch (archivo .pt) |

## Arquitectura y entrenamiento

QED-Base-v3 es un transformer decoder-only de 12 capas con hidden size de 768, 12 cabezas de atención y 4 cabezas KV (GQA). La capa feed-forward intermedia tiene 1.792 unidades y usa activación SwiGLU. La normalización se realiza con RMSNorm y la codificación posicional con RoPE (theta=10.000). Los embeddings y la cabeza de salida comparten pesos (weight-tied). El tokenizador es un SentencePiece con vocabulario de 56.000 tokens, entrenado específicamente para esta versión del modelo.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. Al ser un modelo base, no ha pasado por ningún proceso de alineación. La información disponible indica que fue preentrenado desde cero, pero no se especifican las características del corpus ni la duración del entrenamiento.

## Capacidades

- Generación de texto: continúa secuencias de texto de forma autónoma, sin seguir instrucciones ni mantener diálogos.
- Investigación sobre preentrenamiento a pequeña escala: permite estudiar el comportamiento de arquitecturas y tokenizadores en modelos de tamaño reducido.
- Fine-tuning: sirve como checkpoint inicial para ajuste por instrucciones, tareas específicas o desarrollo de modelos derivados.
- Experimentación con el tokenizador QED-B3: al ser un tokenizador nuevo, facilita el análisis de su impacto en la generación.
- Soporte de parámetros de generación: la implementación incluida permite temperatura, top-k, top-p, penalización de repetición y semilla.
- Multilingüe: no, solo inglés.

## Casos de uso

- Investigación académica en NLP: el modelo puede utilizarse para comparar arquitecturas, estudiar el efecto del tokenizador o analizar la dinámica de preentrenamiento en modelos pequeños.
- Desarrollo de modelos especializados: como base para fine-tuning en dominios concretos (por ejemplo, generación de texto técnico o literario) donde se requiera un modelo ligero.
- Prototipado rápido: al ser pequeño y con licencia MIT, permite probar ideas de generación de texto sin grandes requisitos de hardware.
- Enseñanza de arquitecturas transformer: su simplicidad y tamaño lo hacen adecuado para demostraciones educativas sobre el funcionamiento de modelos causales.
- Experimentación con técnicas de generación: la implementación incluida permite probar diferentes estrategias de muestreo y penalizaciones.
- Evaluación de tokenizadores: al tener un tokenizador propio, puede usarse para medir su eficiencia en comparación con otros vocabularios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara una lista de resultados vacía, por lo que no hay datos objetivos sobre MMLU, HumanEval u otras métricas estándar.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Estimación orientativa: con 154M de parámetros, el modelo en FP32 ocupa aproximadamente 616 MB, en FP16 unos 308 MB y en int8 unos 154 MB. Esto permite su ejecución en GPUs con al menos 2 GB de VRAM, como tarjetas consumer antiguas o integradas.
- No hay datos de latencia ni throughput publicados.
- La implementación de inferencia incluida en el repositorio es ligera y puede ejecutarse en CPU, aunque la generación será más lenta.
- No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia; el formato de pesos es PyTorch nativo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. Dado que es un modelo de 154M parámetros, podría compararse con otros modelos base de tamaño similar (por ejemplo, GPT-2 small), pero no se han encontrado datos de rendimiento ni especificaciones detalladas de alternativas en las fuentes consultadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No está alineado: al ser un modelo base, no sigue instrucciones ni tiene comportamiento de rechazo, por lo que puede generar contenido inapropiado o no deseado.
- Riesgo de alucinación y errores: su pequeño tamaño limita el conocimiento factual, el razonamiento y la generalización, produciendo texto incorrecto, repetitivo o sin sentido.
- Sesgos: no se han evaluado sesgos específicos, pero como modelo entrenado con datos no especificados, puede reflejar sesgos presentes en el corpus.
- Contexto limitado: la ventana de 2.048 tokens es corta para tareas que requieran contexto largo.
- Idioma: solo inglés, no soporta otros idiomas.
- Uso en producción: no se recomienda su despliegue directo en aplicaciones de usuario sin fine-tuning y evaluación adicional.
- Licencia: MIT permite uso comercial, pero el modelo no ofrece garantías de calidad ni seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/qvx-o/QED-Base-v3
- Perfil de Qarvexium en HuggingFace: https://huggingface.co/Qarvexium
- Repositorio de modelos de Qarvexium: https://huggingface.co/Qarvexium/models
