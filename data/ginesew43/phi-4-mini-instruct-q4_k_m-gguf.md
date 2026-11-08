# ginesew43/Phi-4-mini-instruct-Q4_K_M-GGUF

## Resumen

Phi-4-mini-instruct es un modelo de lenguaje de tipo transformer denso desarrollado por Microsoft Research, disenado para tareas de generacion de texto, razonamiento y codigo en un formato compacto. Esta ficha concreta corresponde a la cuantizacion Q4_K_M en formato GGUF del modelo original, publicada por el usuario ginesew43 mediante el espacio GGUF-my-repo de ggml.ai, que automatiza la conversion con llama.cpp. El modelo base cuenta con 3.836.021.856 parametros (aproximadamente 3,8 mil millones) y esta pensado para ejecutarse en hardware de consumo.

La relevancia de esta variante GGUF radica en que permite desplegar un modelo de la familia Phi-4 en equipos sin GPU de datacenter, usando llama.cpp, Ollama u otros runners compatibles con GGUF. La cuantizacion Q4_K_M reduce el peso del repositorio a unos 2,5 GB, lo que lo hace viable en GPUs consumer con 6-8 GB de VRAM o incluso en CPU.

El modelo original esta entrenado para conversacion multi-turno, soporta una ventana de contexto amplia (segun la documentacion de Microsoft, 128 000 tokens en el modelo base) y cubre 23 idiomas, incluido el espanol. La licencia MIT facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), modelo base Phi-4-mini-instruct de Microsoft |
| Parametros totales | 3.836.021.856 (aproximadamente 3,8 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base (no verificado en esta cuantizacion; el ejemplo de la model card usa -c 2048) |
| Tipos de cuantizacion | Q4_K_M (esta publicacion); el modelo base admite otras cuantizaciones GGUF en repositorios alternativos |
| Idiomas soportados | 23 idiomas: arabe, chino, checo, danes, neerlandes, ingles, finlandes, frances, aleman, hebreo, hungaro, italiano, japones, coreano, noruego, polaco, portugues, ruso, espanol, sueco, tailandes, turco y ucraniano |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero phi-4-mini-instruct-q4_k_m.gguf); el modelo original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de aproximadamente 3,8 mil millones de parametros, perteneciente a la familia Phi-4 de Microsoft. La model card de esta publicacion no incluye detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas por Microsoft; esa informacion debe consultarse en la model card del modelo original microsoft/Phi-4-mini-instruct.

La innovacion tecnica de esta publicacion concreta no reside en la arquitectura, sino en el proceso de cuantizacion: la conversion a GGUF Q4_K_M mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai permite ejecutar el modelo con pesos de 4 bits, reduciendo el peso a aproximadamente 2,5 GB con una perdida de calidad moderada respecto al modelo en precision completa. El formato GGUF esta optimizado para inferencia en CPU y GPU con llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de chat compatible con la plantilla del modelo original.
- Razonamiento y resolucion de problemas de complejidad media, incluyendo matematicas basicas e intermedias.
- Generacion y explicacion de codigo en multiples lenguajes de programacion (el tag `code` figura en la model card).
- Capacidades multilingues en 23 idiomas, con soporte explicito del espanol.
- Instrucciones y seguimiento de prompts conversacionales (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los tags) y con llama.cpp para despliegue local.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, vision ni audio para esta publicacion.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en un portatil o estacion de trabajo sin conexion, gracias al formato GGUF y a su tamano de 2,5 GB que cabe en memoria de CPU o en GPUs consumer.
- Generacion de codigo en entornos con recursos limitados: util para autocompletado, explicacion de fragmentos y generacion de scripts dentro de editores o pipelines locales, sin depender de APIs externas.
- Procesamiento de texto multilingue: traduccion y resumen de documentos en los 23 idiomas soportados, con especial utilidad para el espanol en entornos hispanohablantes.
- Prototipado rapido de aplicaciones NLP: al ser un modelo pequeno con licencia MIT, sirve para validar ideas de producto (chatbots, clasificacion, extraccion) antes de escalar a modelos mayores.
- Educacion y experimentacion: investigadores y estudiantes pueden ejecutarlo en hardware asequible para estudiar comportamiento de LLM, tecnicas de prompting o evaluacion de cuantizaciones.
- Despliegue en el borde (edge): integracion en dispositivos con recursos moderados mediante llama.cpp, por ejemplo en estaciones de trabajo sin GPU dedicada o en servidores de baja capacidad.
- Generacion de contenido asistida: redaccion de borradores, resumenes y respuestas a preguntas frecuentes en aplicaciones internas donde la privacidad exige inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion concreta. La model card de esta publicacion remite a la model card del modelo original (microsoft/Phi-4-mini-instruct) para obtener datos de evaluacion del modelo sin cuantizar; no se dispone de cifras verificadas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con cuantizacion Q4_K_M (el repositorio pesa 2,5 GB); el contexto adicional consume VRAM extra segun la longitud de la ventana configurada.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien funciona en A100, H100 y otras GPUs de datacenter, aunque estas estan sobredimensionadas para un modelo de 3,8 B.
- Cabe en GPU consumer: si, en la mayoria de GPUs consumer modernas con 6-8 GB de VRAM; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF), y cualquier runner compatible con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi-4-mini-instruct Q4_K_M (esta publicacion) | 3,8 B | 128 000 tokens (modelo base) | MIT | GGUF | Cuantizacion Q4_K_M, 2,5 GB, orientada a inferencia local |
| microsoft/Phi-4-mini-instruct | 3,8 B | 128 000 tokens | MIT | safetensors | Modelo original sin cuantizar, referencia de calidad |
| unsloth/Phi-4-mini-instruct-GGUF | 3,8 B | 128 000 tokens (modelo base) | MIT | GGUF | Cuantizaciones GGUF alternativas del mismo modelo base, mantenidas por Unsloth |

Las tres opciones comparten arquitectura, parametros y licencia; la diferencia principal es el formato y el mantenedor de la cuantizacion. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M introduce una perdida de precision respecto al modelo original; puede degradar tareas de razonamiento complejo o generacion de codigo sensible a matices.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no debe usarse como fuente de verdad sin verificacion.
- La model card de esta publicacion no documenta sesgos especificos; deben asumirse los sesgos presentes en los datos de entrenamiento del modelo original.
- El contexto maximo real en esta cuantizacion no esta verificado; el ejemplo de la model card configura `-c 2048`, por lo que conviene validar el comportamiento con ventanas largas antes de produccion.
- El soporte multilingue esta declarado en los metadatos, pero no se aportan evaluaciones por idioma; el rendimiento en espanol puede ser inferior al del ingles.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda revisar la licencia del modelo original enlazada en la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa de esta cuantizacion concreta.
- Para produccion, conviene preferir cuantizaciones mantenidas por organizaciones reconocidas (por ejemplo, Unsloth) o el modelo original en safetensors.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/ginesew43/Phi-4-mini-instruct-Q4_K_M-GGUF
- Modelo base en Hugging Face: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia del modelo original: https://huggingface.co/microsoft/Phi-4-mini-instruct/resolve/main/LICENSE
- Cuantizaciones GGUF alternativas (Unsloth): https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
