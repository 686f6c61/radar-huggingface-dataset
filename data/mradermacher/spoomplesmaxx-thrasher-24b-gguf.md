# mradermacher/spoomplesmaxx-thrasher-24B-GGUF

## Resumen

El modelo `mradermacher/spoomplesmaxx-thrasher-24B-GGUF` es una colección de cuantizaciones GGUF del modelo base `aimeri/spoomplesmaxx-thrasher-24B`, desarrollado por el usuario `aimeri`. La versión GGUF ha sido generada por `mradermacher`, un conocido autor de cuantizaciones en Hugging Face, y está pensada para su uso en entornos locales con herramientas como llama.cpp, Ollama o LM Studio. El modelo base está orientado a tareas de roleplay y escritura creativa, con soporte para el formato de chat ChatML y únicamente en inglés.

Con aproximadamente 23.57 mil millones de parámetros, este modelo se sitúa en la gama de los 24B, un tamaño que ofrece un equilibrio entre calidad de generación y requisitos de hardware. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. La colección incluye 11 cuantizaciones diferentes, desde Q2_K (9.0 GB) hasta Q8_0 (25.2 GB), lo que permite adaptarse a GPUs con distinta memoria VRAM.

La relevancia de este modelo radica en su especialización para narrativa y conversación de rol, un nicho donde los modelos de 24B son muy populares por su capacidad para mantener coherencia contextual y generar diálogos creativos. Al estar disponible en formato GGUF, facilita su despliegue en hardware de consumo sin necesidad de infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 23.572.403.200 (23.57B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base `aimeri/spoomplesmaxx-thrasher-24B`. Dado que se indica `library_name: transformers`, es probable que se trate de un transformer denso estandar, pero no se puede confirmar sin acceso a la documentacion del modelo original. Tampoco se conocen los datos de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. La unica informacion disponible es que el modelo esta etiquetado para roleplay y escritura creativa, lo que sugiere un ajuste fino orientado a tareas conversacionales y narrativas, pero los detalles especificos no han sido publicados.

## Capacidades

- Generacion de texto conversacional y narrativo, optimizado para roleplay y escritura creativa segun los tags del modelo.
- Soporte del formato de chat ChatML, lo que permite estructurar conversaciones multi-turno con roles de sistema, usuario y asistente.
- Uso exclusivo en ingles; no se ha confirmado soporte multilingue.
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision o audio. Estas capacidades no estan documentadas en la informacion proporcionada.

## Casos de uso

- **Roleplay interactivo**: el modelo puede mantener personajes consistentes y dialogos coherentes en escenarios de rol, gracias a su ajuste especifico para este tipo de tareas. Se puede integrar en aplicaciones de chat o juegos de texto.
- **Escritura creativa asistida**: generacion de historias, dialogos, descripciones y tramas. Su orientacion a creative-writing lo hace util como herramienta de apoyo para escritores.
- **Creacion de personajes ficticios**: desarrollo de perfiles de personajes con personalidad, voz y trasfondo, util en juegos de rol de mesa o novelas interactivas.
- **Simulacion de conversaciones para guiones**: generacion de intercambios dialogados para guiones de cine, teatro o videojuegos.
- **Prototipado de chatbots con personalidad**: al ser un modelo de 24B, puede ejecutarse en local y servir como base para chatbots tematicos sin depender de APIs externas.
- **Generacion de contenido narrativo para videojuegos**: misiones, descripciones de escenarios y dialogos no jugables (NPC) pueden generarse con este modelo, aprovechando su capacidad de mantener contexto largo (si se confirma la longitud de contexto, aunque no se especifica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o su version base.

## Requisitos de hardware

Los requisitos dependen de la cuantizacion elegida. A continuacion se estima la VRAM minima necesaria para cada tipo, basandose en el tamaño del archivo y un margen para el contexto (asumiendo un contexto tipico de 4K-8K tokens):

- **Q2_K (9.0 GB)**: cabe en una GPU con 12 GB VRAM (ej. RTX 3060, RTX 4070).
- **Q3_K_S (10.5 GB)**: requiere al menos 12-16 GB VRAM (ej. RTX 4080, RTX 4090).
- **Q3_K_M (11.6 GB)**: 16 GB VRAM recomendados.
- **Q3_K_L (12.5 GB)**: 16 GB VRAM minimo.
- **IQ4_XS (13.0 GB)**: 16 GB VRAM.
- **Q4_K_S (13.6 GB)**: 16 GB VRAM (ej. RTX 4080, RTX 4090, A4000).
- **Q4_K_M (14.4 GB)**: 16 GB VRAM, aunque para contextos largos se recomienda 20-24 GB.
- **Q5_K_S (16.4 GB)**: 20-24 GB VRAM (ej. RTX 3090, RTX 4090, A5000).
- **Q5_K_M (16.9 GB)**: 24 GB VRAM.
- **Q6_K (19.4 GB)**: 24 GB VRAM (ej. RTX 3090, RTX 4090, A100 40GB).
- **Q8_0 (25.2 GB)**: 32 GB VRAM o mas (ej. A100 40GB, RTX A6000, doble GPU).

Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier frontend compatible con GGUF. Para inferencia en servidor, se puede usar llama.cpp con servidor HTTP o integraciones como llama-cpp-python. No se recomienda vLLM ni TGI para GGUF, ya que estos requieren pesos en formato safetensors.

La latencia y el throughput no estan publicados. Como referencia general, un modelo de 24B cuantizado a Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero estos valores son orientativos y dependen de la implementacion y el contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados con otros modelos de la misma categoria. En el articulo "6 Best 24B GGUF Models for 24GB VRAM Local AI RP" se mencionan modelos como Goetia-24B, pero no se proporcionan especificaciones concretas en la informacion disponible. Por tanto, no es posible realizar una comparativa cuantitativa fiable. Se recomienda consultar benchmarks independientes o probar el modelo directamente para evaluar su rendimiento relativo.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta ingles. No se ha entrenado para otros idiomas, por lo que su uso en castellano u otros idiomas producira resultados deficientes.
- **Informacion incompleta**: no se conocen la arquitectura exacta, la longitud de contexto, los datos de entrenamiento ni los benchmarks. Esto dificulta evaluar su calidad objetiva antes de probarlo.
- **Sesgos y alucinaciones**: al no existir documentacion sobre el proceso de entrenamiento, no se pueden descartar sesgos tipicos de modelos de lenguaje (genero, raza, etc.) ni tendencia a alucinar hechos. Especialmente en tareas de roleplay, el modelo puede inventar informacion inconsistente.
- **Calidad de la cuantizacion**: las versiones de baja precision (Q2_K, Q3_K) pueden degradar notablemente la calidad de generacion. Se recomienda usar al menos Q4_K_M para un equilibrio razonable.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, pero el modelo base puede tener restricciones adicionales no documentadas. Conviene revisar la licencia del modelo original `aimeri/spoomplesmaxx-thrasher-24B` antes de un despliegue en produccion.
- **Fecha de creacion**: el modelo fue creado en agosto de 2026, lo que sugiere que es muy reciente. La ausencia de descargas y likes indica que no ha sido ampliamente evaluado por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/spoomplesmaxx-thrasher-24B-GGUF
- Modelo base (referencia): https://huggingface.co/aimeri/spoomplesmaxx-thrasher-24B
- Version con cuantizaciones ponderadas (i1): https://huggingface.co/mradermacher/spoomplesmaxx-thrasher-24B-i1-GGUF
- Articulo sobre modelos 24B GGUF para roleplay: https://techtactician.com/best-24b-gguf-models-for-24gb-vram-local-rp/
- Listado de modelos cuantizados de aimeri/spoomplesmaxx-thrasher-24B: https://huggingface.co/models?other=base_model:quantized:aimeri/spoomplesmaxx-thrasher-24B
