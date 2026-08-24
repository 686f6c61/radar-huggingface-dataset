# QmogAI/gemma4-e2b-int8

## Resumen

El modelo `QmogAI/gemma4-e2b-int8` es una conversión del checkpoint oficial de Google `google/gemma-4-E2B-it-qat-q4_0-unquantized` a un formato binario único de 5,2 GiB con pesos cuantizados a int8, preparado específicamente para el runtime educativo `gemma4-e2b.c`. Este proyecto, desarrollado por Ryanssenn, ofrece una implementación de inferencia en CPU para el modelo Gemma 4 E2B, orientada al aprendizaje y la experimentación con arquitecturas de modelos pequeños.

El modelo base, Gemma 4 E2B, es el más pequeño de la familia Gemma 4 de Google, con 2,1 mil millones de parámetros, contexto de 8K tokens y capacidad de ejecución completa en CPU. Este repositorio facilita la descarga de un único archivo binario listo para ejecutar, eliminando la necesidad de gestionar checkpoints o dependencias complejas. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones, lo que lo convierte en una opción atractiva para prototipos, entornos de bajos recursos y proyectos educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 E2B) |
| Parametros totales | 2,1 mil millones |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 8K tokens |
| Tipos de cuantizacion | int8 (pesos del archivo bin); el checkpoint original usa QAT q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivo binario único (`.bin`) con configuracion, tokenizador y pesos; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Gemma 4 E2B de Google, un transformer denso de 2,1 mil millones de parametros, disenado para despliegue en dispositivos con recursos limitados. El checkpoint original fue sometido a entrenamiento con cuantizacion consciente (QAT) para alcanzar una cuantizacion q4_0, y el script `exporter.py` de este proyecto lo convierte a int8 para su uso con el runtime `gemma4-e2b.c`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. El runtime esta optimizado para CPU x86-64 con extensiones AVX2, y no requiere GPU.

## Capacidades

- Generacion de texto de alta calidad para tareas de instruccion y conversacion, al ser una variante "it" (instruction-tuned).
- Razonamiento y comprension de contexto dentro de una ventana de 8K tokens.
- Capacidad de ejecucion completamente en CPU, sin necesidad de GPU, gracias a la cuantizacion int8 y al runtime ligero.
- Soporte para inferencia local en entornos sin conexion, ideal para dispositivos de borde y sistemas embebidos.
- No se ha confirmado soporte para tool calling, funciones multimodales (vision, audio) ni modos de razonamiento especiales en esta conversion concreta; la informacion del modelo base no lo especifica en los datos disponibles.

## Casos de uso

- **Inferencia local en entornos sin GPU**: el modelo se ejecuta en CPU con AVX2, permitiendo generacion de texto en portatiles, mini-PCs y servidores sin tarjetas graficas. Es adecuado para aplicaciones de escritorio que requieren privacidad y procesamiento offline.
- **Aprendizaje y experimentacion con transformers**: al ser un proyecto educativo, es ideal para estudiantes y desarrolladores que quieran entender el flujo de inferencia de un LLM moderno, inspeccionar el codigo fuente y modificar el runtime.
- **Prototipado rapido de asistentes de texto**: se puede integrar en aplicaciones de chat locales, asistentes de escritura o herramientas de generacion de contenido, gracias a su formato de archivo unico y facil despliegue.
- **Sistemas de borde y embebidos**: con 2,1B parametros cuantizados, puede desplegarse en dispositivos con memoria moderada (5,2 GB de pesos) para tareas de clasificacion de texto, resumen o generacion de respuestas en tiempo real.
- **Automatizacion de documentacion**: generar resumenes, borradores de correos o informes tecnicos en entornos de baja potencia, sin depender de servicios en la nube.
- **Investigacion educativa en cuantizacion**: el repositorio permite comparar el rendimiento entre el checkpoint QAT original y la version int8, facilitando estudios sobre el impacto de la cuantizacion en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **CPU**: x86-64 con soporte AVX2 (obligatorio para el runtime).
- **RAM**: minimo 6 GB para cargar los pesos de 5,2 GB y dejar espacio para el proceso de inferencia; se recomienda 8 GB o mas.
- **GPU**: no necesaria; el modelo esta disenado exclusivamente para CPU.
- **Almacenamiento**: el archivo binario ocupa aproximadamente 5,2 GB, mas el espacio del repositorio y el binario compilado.
- **Opciones de despliegue**: el runtime `gemma4-e2b.c` se compila con `make` y se ejecuta desde linea de comandos. No hay soporte nativo para vLLM, Ollama o llama.cpp en esta conversion, aunque el checkpoint original de Google puede usarse con otras herramientas.
- **Latencia y throughput**: no se proporcionan datos en la informacion disponible; dependera de la frecuencia de la CPU y la longitud de la secuencia generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B (original) | 2,1B | 8K | QAT q4_0 | Apache 2.0 | HuggingFace (checkpoint) |
| QmogAI/gemma4-e2b-int8 | 2,1B | 8K | int8 | Apache 2.0 | HuggingFace (binario unico) |
| Gemma 3 2B (ejemplo) | 2B | 8K | varios | Gemma Terms (uso comercial con restricciones) | HuggingFace |
| Qwen2.5-1.5B | 1,5B | 32K | varios | Apache 2.0 | HuggingFace |

La comparativa se basa en parametros y contexto, ya que no hay datos de rendimiento publicados para este modelo. El original Gemma 4 E2B y su conversion int8 comparten las mismas caracteristicas base; la principal diferencia es el formato de pesos y la herramienta de inferencia. Alternativas como Gemma 3 2B o Qwen2.5-1.5B son comparables en tamano, pero no se dispone de resultados de rendimiento para una comparacion directa.

## Limitaciones y advertencias

- **Contexto limitado**: la ventana de 8K tokens puede ser insuficiente para tareas que requieran documentos largos o historiales de conversacion extensos.
- **Idiomas**: no se ha especificado la lista de idiomas soportados en la model card; se recomienda probar con el idioma objetivo antes de su uso en produccion.
- **Riesgo de alucinacion**: como cualquier LLM, puede generar contenido plausible pero incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- **Sesgos**: no se han documentado sesgos especificos, pero el modelo hereda los sesgos del entrenamiento de Gemma 4, que no se detallan en la informacion disponible.
- **Rendimiento en CPU**: aunque esta optimizado para CPU, la generacion puede ser lenta en procesadores sin AVX2 o con baja frecuencia, y no se proporcionan metricas de latencia.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, pero el modelo original de Google tiene sus propios terminos; esta conversion se distribuye bajo Apache 2.0, pero se recomienda revisar los terminos del modelo base para usos especificos.
- **Formato de pesos**: el archivo `.bin` es propietario del runtime `gemma4-e2b.c`; no es compatible directamente con frameworks estandar como Transformers, vLLM o llama.cpp, lo que limita su integracion en pipelines existentes.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QmogAI/gemma4-e2b-int8)
- [Repositorio gemma4-e2b.c](https://github.com/ryanssenn/gemma4-e2b.c)
- [Model card de Google Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Pagina de Gemma 4 en DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Ficha de Gemma 4 E2B en gemma4.dev](https://gemma4.dev/models/gemma-4-e2b)
- [Overview de Gemma 4 en Google AI](https://ai.google.dev/gemma/docs/core)
