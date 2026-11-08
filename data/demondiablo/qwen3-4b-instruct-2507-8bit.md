# Demondiablo/Qwen3-4B-Instruct-2507-8bit

## Resumen

Demondiablo/Qwen3-4B-Instruct-2507-8bit es una cuantizacion de 8 bits del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado originalmente por el equipo Qwen de Alibaba. Esta version, publicada por el usuario Demondiablo, aplica cuantizacion de pesos a 8 bits mediante bitsandbytes LLM.int8() sobre el modelo instruct original, con el objetivo de reducir los requisitos de memoria y permitir la inferencia en una unica GPU de consumo con aproximadamente 5,5 GB de VRAM.

El modelo base es un transformer decoder-only de tipo Qwen3ForCausalLM con 4.023.574.016 parametros totales, 36 capas, tamano oculto de 2560, 32 cabezas de atencion y 8 cabezas KV, y una longitud de contexto de 262.144 tokens. Se trata de una variante exclusivamente instruct, sin modo de razonamiento (thinking mode), entrenada para comprension y generacion de lenguaje, codigo y matematicas.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de 4B con contexto muy largo en hardware modesto, manteniendo la licencia Apache 2.0 del modelo original. El repositorio tiene un tamano de 4,4 GB y el archivo principal model.safetensors ocupa 4,42 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, tipo qwen3) |
| Parametros totales | 4.023.574.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8 bits con bitsandbytes LLM.int8() (llm_int8_threshold = 6.0) |
| Idiomas soportados | en (segun metadatos del repo); el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 4,42 GB) |

Datos adicionales de configuracion: hidden size 2560, 36 capas, 32 cabezas de atencion, 8 cabezas KV, vocabulario de 151.936 tokens, dtype base bfloat16 y word embeddings atados (tie_word_embeddings = true).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de la familia Qwen3, con atencion multi-cabeza con 8 cabezas KV (GQA) y embeddings atados. El modelo base Qwen3-4B-Instruct-2507 fue entrenado por el equipo Qwen y esta disenado como variante puramente instruct, sin soporte de modo thinking, a diferencia de otras variantes de la familia Qwen3. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

Esta version concreta no reentrena el modelo: aplica cuantizacion post-entrenamiento a 8 bits con bitsandbytes LLM.int8(), que mantiene los pesos en int8 y realiza las operaciones de las capas con outliers en mayor precision segun el umbral configurado (6.0). El resultado es un checkpoint que conserva la estructura del modelo original pero reduce la huella de memoria a costa de una ligera perdida de precision numerica no cuantificada en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, con plantilla de chat aplicada mediante apply_chat_template.
- Comprension y generacion de lenguaje natural, segun la descripcion del modelo base en Qualcomm AI Hub.
- Generacion de codigo y resolucion de problemas de programacion, segun las capacidades atribuidas al modelo base.
- Razonamiento matematico basico y resolucion de problemas numericos, segun el modelo base.
- Capacidades multilingues heredadas del modelo base Qwen3-4B-Instruct-2507 (el repo declara solo en en sus metadatos).
- Soporte de contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Sin modo thinking: esta variante instruct no incluye razonamiento explicito paso a paso.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para esta variante cuantizada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en local: el modelo puede gestionar dialogos multi-turno en una unica GPU de consumo con unos 5,5 GB de VRAM, lo que lo hace adecuado para prototipos de chatbots en estaciones de trabajo sin GPU de datacenter.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, permite resumir, extraer informacion o responder preguntas sobre contratos, informes o bases de codigo extensas sin fragmentacion agresiva.
- Generacion de codigo en entornos de desarrollo locales: al ser una variante instruct de un modelo con capacidades de codigo, puede integrarse en asistentes de IDE o scripts de automatizacion que se ejecuten en hardware modesto.
- Educacion y tutoria tecnica: resolución de dudas de matematicas y programacion en entornos sin conexion o con requisitos de privacidad, al ejecutarse localmente.
- Experimentacion e investigacion: punto de partida para estudiar el impacto de la cuantizacion int8 en calidad y latencia frente al modelo en bfloat16, con licencia Apache 2.0 que facilita la comparacion publica.
- Despliegue en estaciones de trabajo con GPU consumer: al requerir aproximadamente 5,5 GB de VRAM, cabe en tarjetas de 8 GB o superiores, permitiendo inferencia local sin servicios en la nube.
- Prototipado de pipelines de generacion de texto: integrable via Transformers con load_in_8bit, util para validar flujos antes de migrar a variantes AWQ o GPTQ en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base en bfloat16, por lo que no es posible cuantificar la perdida de calidad introducida por la cuantizacion int8.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GB segun la model card del autor (archivo de pesos de 4,42 GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor indica que funciona en una unica GPU de consumo.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o superiores (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores).
- Opciones de despliegue: Transformers con bitsandbytes (load_in_8bit=True, device_map="auto"); llama.cpp segun la model card; vLLM no soporta bitsandbytes 8-bit directamente segun el autor, que recomienda la variante AWQ 4-bit para vLLM.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Dependencia adicional: requiere instalar bitsandbytes (pip install bitsandbytes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Demondiablo/Qwen3-4B-Instruct-2507-8bit | 4,02 B | 262.144 | 8 bits (bitsandbytes) | Apache 2.0 | Hugging Face, 23 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4 B | 262.144 | bfloat16 | Apache 2.0 | Hugging Face oficial |
| Variante AWQ 4-bit de Qwen3-4B-Instruct-2507 | 4 B | 262.144 | 4 bits (AWQ) | Apache 2.0 | Mencionada por el autor, no verificada en esta busqueda |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de rendimiento que permitan contrastar con otras familias de modelos de tamano similar.

## Limitaciones y advertencias

- La cuantizacion int8 introduce una perdida de precision numerica respecto al modelo en bfloat16; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- El repositorio declara unicamente el idioma en en sus metadatos, aunque el modelo base es multilingue; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- No dispone de modo thinking, por lo que no es adecuada para tareas que requieran cadenas de razonamiento explicitas.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 4B; no se han publicado evaluaciones de fiabilidad en esta variante.
- Sesgos conocidos: no disponible; el autor no documenta evaluaciones de sesgo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo base Qwen/Qwen3-4B-Instruct-2507 para condiciones adicionales.
- vLLM no soporta bitsandbytes 8-bit directamente, lo que limita el despliegue en infraestructuras de alta concurrencia basadas en vLLM.
- Repositorio con muy baja traccion (23 descargas, 0 likes) y mantenido por un autor individual; no hay garantias de mantenimiento ni de soporte.
- No se han publicado benchmarks que permitan comparar su calidad con el modelo base o con otras cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Demondiablo/Qwen3-4B-Instruct-2507-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
