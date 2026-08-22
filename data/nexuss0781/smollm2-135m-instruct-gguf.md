# Nexuss0781/SmolLM2-135M-Instruct-GGUF

## Resumen

SmolLM2-135M-Instruct-GGUF es una conversión no oficial del modelo SmolLM2-135M-Instruct, publicado por el usuario Nexuss0781 en Hugging Face. Se trata de una adaptación del checkpoint original de HuggingFaceTB al formato GGUF, pensada para ejecutarse de forma eficiente en CPU mediante llama.cpp y entornos compatibles. El repositorio contiene dos variantes: una en F16 que preserva la precisión original y otra cuantizada en Q6_K para reducir el uso de memoria. No se reivindica autoría ni entrenamiento del modelo subyacente; la licencia Apache-2.0 se mantiene intacta.

El modelo original tiene aproximadamente 134,5 millones de parámetros y está orientado a generación de texto y conversación. Esta conversión GGUF facilita su despliegue en sistemas sin GPU, como portátiles, Raspberry Pi o servidores de bajo consumo. Su relevancia radica en la creciente demanda de modelos ligeros que puedan ejecutarse en dispositivos edge o en entornos de desarrollo sin recursos elevados. La disponibilidad de cuantizaciones Q6_K y F16 permite equilibrar fidelidad y consumo de memoria según el caso de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

No se dispone de información específica sobre la arquitectura interna del modelo original en los datos proporcionados. El modelo base, SmolLM2-135M-Instruct, es un modelo de lenguaje de tamaño reducido desarrollado por HuggingFaceTB, pero no se detallan aquí sus características técnicas (número de capas, tipo de atención, etc.). La conversión GGUF no altera la arquitectura; solo cambia el formato de representación de los pesos para permitir su ejecución en llama.cpp y otros runtimes compatibles. Tampoco se dispone de información sobre los datos de entrenamiento, el proceso de ajuste fino o las técnicas de alineación utilizadas en el modelo original.

## Capacidades

- Generación de texto en inglés.
- Conversación multi-turno, indicada para aplicaciones de chat interactivo.
- Ejecución en CPU sin necesidad de GPU, gracias a la cuantización GGUF.
- Compatibilidad con llama.cpp y servidores OpenAI-compatibles a través de `llama-server`.
- Capacidad de seguir instrucciones, heredada del modelo Instruct original, aunque limitada por su tamaño.

No se mencionan capacidades avanzadas como tool calling, agentes, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Asistente de chat en dispositivos de bajo consumo: el modelo puede ejecutarse en un Raspberry Pi o un portátil antiguo para ofrecer una interfaz conversacional básica, gracias a su tamaño reducido y al formato GGUF que permite cargarlo en memoria RAM sin necesidad de GPU.
- Prototipado rápido de aplicaciones de texto: los desarrolladores pueden integrar el modelo en entornos de prueba para validar ideas de generación de texto o flujos de conversación antes de escalar a modelos más grandes.
- Educación y aprendizaje de LLMs: sirve como ejemplo didáctico para entender el proceso de cuantización GGUF y el despliegue con llama.cpp, ya que es fácil de descargar y ejecutar.
- Servicio local de inferencia en entornos de desarrollo: usando `llama-server`, se puede levantar un endpoint OpenAI-compatible en local para probar aplicaciones que consumen APIs de texto, sin depender de servicios externos.
- Chat en intranets o sistemas aislados: al ser un modelo ligero y de código abierto, puede desplegarse en redes sin conexión a internet para tareas de asistencia básica o generación de contenido.
- Pruebas de rendimiento de hardware: dado su pequeño tamaño, es útil para medir la velocidad de inferencia en diferentes CPUs o comparar el rendimiento entre distintas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de evaluación sobre MMLU, HumanEval, GSM8K ni otros conjuntos estándar para este modelo o su conversión GGUF.

## Requisitos de hardware

- El modelo en F16 ocupa 258 MiB, y la versión Q6_K 132 MiB. Puede ejecutarse en cualquier CPU con al menos 512 MiB de RAM libre.
- No se requiere GPU; la ejecución está optimizada para CPU mediante llama.cpp.
- Es adecuado para ordenadores portátiles, placas de desarrollo (Raspberry Pi, Jetson Nano) y servidores sin GPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se dispone de cifras concretas, pero para un modelo de 135M parámetros en CPU se espera una generación de varios tokens por segundo en un procesador moderno.

## Comparativa con modelos similares

Existen otras conversiones GGUF del mismo modelo original, como la de bartowski/SmolLM2-135M-Instruct-GGUF y la de HackNetAyush (que ofrece una variante Q8_0). En comparación, esta conversión ofrece dos archivos (F16 y Q6_K), mientras que otras pueden incluir más cuantizaciones (Q8_0, Q4_K_M, etc.). No se dispone de datos de rendimiento comparativo entre estas versiones. El modelo base es el mismo, por lo que las diferencias radican únicamente en la cuantización y el formato de archivo.

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nexuss0781/SmolLM2-135M-Instruct-GGUF | 134,5M | no disponible | F16, Q6_K | Apache-2.0 | HuggingFace |
| bartowski/SmolLM2-135M-Instruct-GGUF | 134,5M | no disponible | varias (Q4_K_M, Q8_0, etc.) | Apache-2.0 | HuggingFace |
| HackNetAyush/smollm2-135M-instruct-gguf-q8 | 134,5M | no disponible | Q8_0 | Apache-2.0 | GitHub |

## Limitaciones y advertencias

- Modelo pequeño con capacidad limitada de conocimiento y razonamiento; puede generar respuestas incorrectas o incoherentes en tareas complejas.
- Riesgo de alucinaciones, especialmente en temas específicos o fuera de su dominio de entrenamiento.
- Solo soporta idioma inglés, por lo que no es adecuado para aplicaciones multilingües.
- No se dispone de información sobre la longitud de contexto máxima; se recomienda mantener prompts cortos para evitar degradación.
- La conversión GGUF es una adaptación técnica, pero no se ha realizado ninguna evaluación adicional sobre la calidad de la cuantización Q6_K respecto al modelo original.
- El modelo está pensado para fines educativos y de prototipado; no es recomendable para producción con requisitos de alta fiabilidad.
- Aunque la licencia Apache-2.0 permite uso comercial, el usuario debe verificar las condiciones del modelo original y de las herramientas de conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nexuss0781/SmolLM2-135M-Instruct-GGUF
- Modelo original: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Conversión de bartowski: https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF
- Repositorio de la aplicación de chat en GitHub: https://github.com/nexuss0781/small-transformer
