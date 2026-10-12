# hrm-labs/gpt-oss-120b-GGUF

## Resumen

hrm-labs/gpt-oss-120b-GGUF es una conversión al formato GGUF del modelo abierto openai/gpt-oss-120b, publicada por el usuario hrm-labs. No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantización derivado: según su propia model card, el archivo se ha generado de forma automática con la herramienta ggml-org/convert y está pensado para su ejecución con llama.app mediante el comando `llama serve -hf ggml-org/gpt-oss-120b-GGUF`.

El modelo base, openai/gpt-oss-120b, es un transformer decoder-only con arquitectura de mezcla de expertos (MoE) publicado por OpenAI bajo licencia Apache 2.0. El repositorio declara 116.829.156.672 parámetros totales en los pesos safetensors del modelo original, lo que lo sitúa en la categoría de los ~117.000 millones de parámetros. Al ser MoE, en cada paso de decodificación solo se activa una fracción de esos parámetros, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamaño.

La relevancia de esta ficha concreta es acotada: el repositorio de hrm-labs acumula 0 descargas y 0 likes, ocupa 65,8 GB y su model card está prácticamente vacía (incluye un apartado "TODOs: add info"). Para uso en producción conviene evaluar la conversión GGUF de referencia citada en el propio README (ggml-org/gpt-oss-120b-GGUF) en lugar de esta copia sin historial de uso ni validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE); dato heredado del modelo base openai/gpt-oss-120b |
| Parametros totales | 116.829.156.672 (~116,8 B) según los safetensors del modelo base |
| Parametros activos | No disponible en la información del repositorio; el modelo base es MoE y activa una fracción reducida de parámetros por token (consultar la model card de openai/gpt-oss-120b) |
| Longitud de contexto | No disponible en la información del repositorio; el modelo base declara 128 000 tokens |
| Tipos de cuantizacion | GGUF (repositorio de 65,8 GB). No se detallan los niveles concretos incluidos. El modelo base emplea cuantización nativa MXFP4 en los pesos del MoE |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles de entrenamiento de esta conversión, que es un artefacto de cuantización y no un modelo entrenado. Los datos técnicos relevantes corresponden al modelo base openai/gpt-oss-120b: un transformer decoder-only con capas de mezcla de expertos, publicado por OpenAI bajo Apache 2.0 y distribuido originalmente en safetensors con los pesos del MoE cuantizados de forma nativa en MXFP4 (aproximadamente 4 bits), lo que permite reducir el peso en memoria sin necesidad de una cuantización posterior agresiva.

El README del repositorio cita como modelos de origen tanto openai/gpt-oss-120b como nvidia/gpt-oss-120b-Eagle3-v3, un modelo borrador (draft) asociado a decodificación especulativa tipo EAGLE-3. Esto sugiere que el ecosistema previsto para este GGUF contempla el uso de decodificación especulativa para acelerar la generación, aunque el repositorio no documenta ninguna configuración concreta. Tampoco se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos, si existen, pertenecen a la documentación del modelo base y no a esta conversión.

El proceso de conversión indicado es ggml-org/convert, y el comando de ejecución recomendado es `llama serve -hf ggml-org/gpt-oss-120b-GGUF`, es decir, apunta al repositorio GGUF de referencia de ggml-org y no al de hrm-labs.

## Capacidades

Las capacidades que se listan a continuación derivan del modelo base openai/gpt-oss-120b, ya que la model card de esta conversión no describe ninguna:

- Generación de texto conversacional y de propósito general.
- Razonamiento multi-paso con cadenas de pensamiento en formato Harmony.
- Niveles de esfuerzo de razonamiento configurables (bajo, medio y alto), que permiten intercambiar latencia por precisión.
- Generación y comprensión de código, con soporte para tareas de reparación y razonamiento sobre repositorios.
- Resolución de problemas matemáticos y de tipo competición.
- Tool calling y function calling, con soporte para invocación estructurada de herramientas externas.
- Uso como agente en flujos multi-paso, incluyendo encadenamiento de herramientas.
- Ejecución de código Python y navegación web mediante herramientas externas (la ejecución no está integrada en los pesos: requiere un entorno que la proporcione).
- Capacidad multilingüe: no disponible en la información proporcionada para este repositorio.
- No dispone de capacidades de visión ni de audio según la información disponible.

## Casos de uso

- Agente de codificación en pipelines de CI/CD: el modelo puede recibir un fallo de test y el contexto del repositorio, razonar sobre el error e invocar herramientas de lectura y escritura de ficheros. Su soporte de function calling y su ventana de contexto amplia (128 000 tokens en el modelo base) permiten incluir varios ficheros relevantes en una sola llamada.
- Atención al cliente multi-turno: con contexto largo se pueden mantener conversaciones extensas manteniendo el historial completo sin truncar, lo que reduce la pérdida de información en interacciones largas.
- Análisis de documentación extensa y RAG sobre contratos o normativa: la ventana de contexto permite introducir documentos completos en lugar de fragmentos, útil cuando la respuesta depende de secciones muy separadas del texto.
- Razonamiento matemático y verificación de cálculos: el modo de esfuerzo alto es adecuado para tareas donde la precisión importa más que la latencia, como la validación de resultados numéricos en informes financieros o científicos.
- Despliegue on-premise por requisitos de soberanía del dato: al ser un modelo Apache 2.0 distribuido en GGUF, se puede ejecutar en infraestructura propia sin enviar datos a terceros, algo relevante en sectores regulados.
- Extracción estructurada de información: mediante tool calling se puede forzar la salida a un esquema JSON y alimentar directamente bases de datos o colas de mensajes.
- Asistente de revisión de código en local: con cuantizaciones bajas y offload a CPU/RAM se puede desplegar en estaciones de trabajo con memoria unificada, sin depender de APIs externas.
- Generación de borradores y resúmenes técnicos: para producir documentación derivada de código o de especificaciones largas, aprovechando la ventana de contexto para no perder trazabilidad de la fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. La model card de hrm-labs no incluye ninguna métrica de evaluación y únicamente contiene la nota "TODOs: add info".

El modelo base openai/gpt-oss-120b sí publica evaluaciones en su model card oficial y en el anuncio de OpenAI, pero esas cifras corresponden al modelo original y no a esta conversión GGUF, por lo que no se reproducen aquí: el proceso de cuantización adicional puede alterar el rendimiento y no se ha documentado ninguna medición sobre este artefacto concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 65,8 GB, por lo que se necesita un dispositivo con al menos esa capacidad disponible entre VRAM y memoria del sistema. El modelo base en MXFP4 ocupa en torno a 63 GB.
- GPU recomendadas: H100 80 GB, A100 80 GB o similares con 80 GB de VRAM, que permiten alojar el modelo en una sola tarjeta con margen para el contexto.
- Configuraciones multi-GPU: cuatro RTX 4090 (96 GB agregados) o dos A100 40 GB con tensor parallelism pueden ser suficientes, aunque no se dispone de mediciones publicadas para esta conversión.
- GPU de consumo: no cabe en una única GPU de consumo (RTX 4090, 24 GB; RTX 5090, 32 GB). Es necesario repartir el modelo entre VRAM y RAM del sistema.
- Memoria unificada: equipos tipo Mac Studio o MacBook Pro con 96-128 GB o más de memoria unificada pueden ejecutar el GGUF mediante llama.cpp o llama.app con offload completo a memoria unificada.
- Opciones de despliegue: llama.cpp, llama.app, Ollama, LM Studio y llama-cpp-python para el formato GGUF. Para el modelo base en safetensors, vLLM y TGI son las opciones habituales en servidor. El soporte de GGUF en vLLM es experimental.
- Latencia y throughput: no disponible. No se han publicado mediciones sobre este repositorio, y el rendimiento dependerá fuertemente del grado de offload a CPU y del ancho de banda de memoria del sistema.
- Decodificación especulativa: el README cita nvidia/gpt-oss-120b-Eagle3-v3 como modelo borrador, lo que permitiría acelerar la generación si el motor de inferencia lo soporta, pero no se documenta ninguna configuración ni ganancia medida.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openai/gpt-oss-120b (base de esta ficha) | ~116,8 B | No disponible en la informacion proporcionada | 128 000 tokens (modelo base) | Apache 2.0 | Safetensors y multiples conversiones GGUF |
| openai/gpt-oss-20b | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 | Safetensors y GGUF |
| Qwen3-235B-A22B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 | Safetensors, GGUF y otros |
| Llama 3.3 70B Instruct | No disponible en la informacion proporcionada | No aplica (modelo denso) | No disponible en la informacion proporcionada | Licencia comunitaria de Meta (no Apache 2.0) | Safetensors y GGUF |

Los datos de rendimiento comparado no están disponibles en la información proporcionada. A efectos prácticos, la diferencia más relevante frente a alternativas densas de tamaño similar es la licencia Apache 2.0 del modelo base, que evita las restricciones de uso comercial de algunas licencias comunitarias, y la existencia de cuantización nativa MXFP4, que reduce el coste de memoria frente a un modelo denso de parámetros comparables.

## Limitaciones y advertencias

- Repositorio no oficial y sin validación: 0 descargas, 0 likes y model card con el contenido mínimo ("TODOs: add info"). No hay evidencia de que la conversión se haya probado más allá de la ejecución automática de ggml-org/convert.
- Conversión automática: al no documentarse el proceso ni los niveles de cuantización incluidos, no se puede garantizar la fidelidad de los pesos respecto al modelo original.
- Degradación por cuantización: el modelo base ya usa MXFP4 en los pesos del MoE; una cuantización GGUF adicional puede degradar tareas sensibles a la precisión numérica, como matemáticas o generación de código.
- Riesgo de alucinación: inherente a los modelos de lenguaje. No hay datos publicados sobre tasas de alucinación en esta conversión, y el README no incluye ninguna advertencia al respecto.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información proporcionada. El modelo base hereda los sesgos de sus datos de entrenamiento, que no se detallan aquí.
- Idiomas: no disponibles. La información del repositorio no especifica cobertura multilingüe; conviene verificar el comportamiento en castellano antes de un despliegue en producción.
- Alineación y seguridad: los modelos abiertos suelen distribuirse sin las capas de moderación adicionales de los servicios alojados. Para uso en producción conviene añadir filtros propios tanto en la entrada como en la salida.
- Licencia: el repositorio declara Apache 2.0, coincidente con el modelo base. Aun así, se recomienda revisar la documentación de OpenAI sobre gpt-oss para confirmar las condiciones de uso comercial y las políticas aplicables.
- Requisitos de memoria elevados: 65,8 GB de pesos implican hardware de gama alta o configuraciones con offload, con la consiguiente penalización de latencia.
- Contexto largo: aunque el modelo base declare 128 000 tokens, no hay mediciones sobre esta conversión que confirmen que ese contexto se mantiene tras la cuantización, ni sobre la calidad de recuperación de información al final de la ventana.
- Alternativa recomendada: para uso en producción, valorar ggml-org/gpt-oss-120b-GGUF, que es la conversión de referencia citada por el propio README, o la conversión oficial del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hrm-labs/gpt-oss-120b-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Modelo borrador para decodificación especulativa: https://huggingface.co/nvidia/gpt-oss-120b-Eagle3-v3
- Conversión GGUF de referencia citada en el README: https://huggingface.co/ggml-org/gpt-oss-120b-GGUF
- Herramienta de conversión citada: https://github.com/ggml-org/convert
- Entorno de ejecución mencionado en la model card: https://llama.app
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de OpenAI para gpt-oss: https://github.com/openai/gpt-oss
- Anuncio de OpenAI sobre gpt-oss: https://openai.com/index/introducing-gpt-oss/
