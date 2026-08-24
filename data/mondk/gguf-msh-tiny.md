# mondk/GGUF.msh-tiny

## Resumen

msh-tiny es un modelo de lenguaje de tamaño reducido (aproximadamente 14 millones de parámetros) desarrollado por el usuario mondk, que se distribuye en formato GGUF para su uso con llama.cpp, Ollama y LM Studio. Se trata de un proyecto educativo que demuestra el entrenamiento de un modelo de chat desde cero, sin utilizar un modelo base preentrenado, incluyendo un tokenizer BPE personalizado y una arquitectura transformer propia implementada en PyTorch. El modelo está pensado para experimentación y aprendizaje, no para uso en producción, y su relevancia radica en mostrar el proceso completo de creación de un modelo de lenguaje pequeño y funcional.

La versión GGUF incluye tres cuantizaciones (F16, Q4_K_M y Q2_K) que permiten ejecutarlo en hardware muy modesto, incluso en CPU. El modelo fue entrenado con una combinación de datasets públicos de instrucciones y conversación (Alpaca, OpenHermes-2.5 y no_robots) más un pequeño conjunto de chit-chat escrito a mano. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo GPT-2 (personalizado, entrenado desde cero) |
| Parametros totales | 13.891.584 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q4_K_M, Q2_K |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer similar a GPT-2, pero implementada desde cero en PyTorch por el autor. No se especifican detalles como número de capas, dimensiones ocultas o cabezas de atención, pero al tratarse de un modelo de 14 millones de parámetros, se trata de una red muy pequeña. El tokenizer BPE también fue entrenado desde cero, lo que implica un vocabulario adaptado a los datos de entrenamiento.

El entrenamiento se realizó desde inicialización aleatoria (sin pesos preentrenados) sobre una combinación de tres datasets públicos de instrucciones y conversación: tatsu-lab/alpaca, teknium/OpenHermes-2.5 y HuggingFaceH4/no_robots, complementados con un pequeño conjunto de chit-chat cotidiano (saludos, agradecimientos, pequeña charla). No se menciona el uso de técnicas de RLHF o DPO, ni el número total de tokens de entrenamiento. El modelo fue entrenado para seguir el formato de prompt `<|user|>` / `<|assistant|>` y detenerse en el token `<|end|>`.

## Capacidades

- Generacion de texto y chat conversacional en ingles, siguiendo el formato de prompt definido.
- Capacidad limitada de seguir instrucciones simples, gracias al entrenamiento con datasets de instrucciones.
- Mantener conversaciones de varios turnos, aunque con respuestas a menudo incoherentes o con conocimiento factual limitado.
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No es multilingue; solo entiende y genera texto en ingles.
- No dispone de capacidades de vision, audio u otras modalidades.

## Casos de uso

- Educacion y aprendizaje: ideal para estudiantes que quieran entender como funciona un transformer por dentro, ya que es un modelo minimo y entrenable en hardware modesto.
- Experimentacion con cuantizacion: permite probar el impacto de diferentes cuantizaciones (F16, Q4_K_M, Q2_K) en la calidad de las respuestas y el rendimiento.
- Prototipado rapido de chatbots: se puede integrar en aplicaciones de demostracion o prototipos donde no se requiera alta calidad de respuesta.
- Pruebas de integracion con llama.cpp u Ollama: sirve para verificar el funcionamiento de estas herramientas con modelos GGUF sin necesidad de descargar modelos grandes.
- Generacion de texto creativo simple: puede producir frases o parrafos cortos en ingles, aunque con resultados impredecibles.
- Benchmark de rendimiento en hardware limitado: al ser tan pequeno, permite medir la latencia y el throughput en CPUs o GPUs de gama baja, sirviendo como referencia para modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF ocupan entre 9,64 MB (Q2_K) y 28,3 MB (F16), por lo que caben en cualquier GPU moderna, incluso en las integradas. Tambien pueden ejecutarse completamente en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una Raspberry Pi podria ejecutar la version Q2_K.
- Compatibilidad con consumer GPU: si, todas las cuantizaciones funcionan en GPUs de consumo como RTX 3060, GTX 1650, etc., y tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamano del modelo, se espera una generacion muy rapida incluso en CPU (del orden de decenas de tokens por segundo).

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada, y al ser un proyecto educativo de tamano extremadamente reducido, no existen alternativas directas en el ecosistema GGUF con caracteristicas equivalentes.

## Limitaciones y advertencias

- Modelo educativo, no apto para produccion: el propio autor advierte que no es un asistente de calidad, con conocimiento limitado e inconsistente.
- Alto riesgo de alucinacion: al tener solo 14 millones de parametros, las respuestas pueden ser incoherentes o inventar informacion.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero por el tamano del modelo es probable que sea muy corta (del orden de cientos de tokens).
- Solo ingles: no soporta otros idiomas.
- Sesgos: al entrenarse con datasets como Alpaca, puede heredar sesgos presentes en esos datos, aunque no se han documentado explicitamente.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no es fiable para aplicaciones reales.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mondk/GGUF.msh-tiny
- Modelo base safetensors: https://huggingface.co/mondk/Safetensors.msh-tiny
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
- Dataset OpenHermes-2.5: https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Dataset no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
