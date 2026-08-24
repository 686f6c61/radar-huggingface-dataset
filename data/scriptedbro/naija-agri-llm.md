# ScriptedBro/naija-agri-llm

## Resumen

El modelo `ScriptedBro/naija-agri-llm` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen3.5-2B`, desarrollado por ScriptedBro (Fredrick Obinna Loveday). El nombre sugiere una orientación hacia el sector agrícola de Nigeria (Naija), aunque la model card no especifica el dominio de entrenamiento ni los datos utilizados. Se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto conversacional en inglés.

Con aproximadamente 1,94 mil millones de parámetros, se trata de un modelo compacto que puede ejecutarse en hardware de consumo. El entrenamiento se realizó con la librería Unsloth, que acelera el ajuste fino, y el repositorio incluye pesos en formato safetensors y GGUF, lo que facilita su despliegue en diferentes entornos. La relevancia actual radica en la tendencia de adaptar modelos pequeños a dominios específicos para reducir costes de inferencia y democratizar el acceso a IA en regiones con recursos limitados.

No se dispone de información pública sobre el conjunto de datos de entrenamiento, el método de alineación (RLHF, DPO, etc.) ni los resultados de evaluación, por lo que esta ficha se basa únicamente en los metadatos del repositorio y en las características del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-2B) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (depende de la configuracion del base) |
| Tipos de cuantizacion | GGUF (sin especificar precisiones) y safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/Qwen3.5-2B`, que a su vez es una version optimizada del modelo Qwen3.5 de 2B parametros. La arquitectura subyacente es un transformer denso, aunque no se han publicado detalles especificos sobre el numero de capas, cabezas de atencion o dimensiones ocultas. El entrenamiento se realizo con la libreria Unsloth, que aplica tecnicas de optimizacion para acelerar el fine-tuning (se indica que fue 2x mas rapido), pero no se detalla el conjunto de datos, el numero de tokens de entrenamiento ni si se emplearon tecnicas de alineacion como RLHF o DPO.

No se menciona ninguna innovacion tecnica adicional, como atencion lineal, decodificacion especulativa o mezcla de expertos. El modelo se presenta como un fine-tune estandar sobre una base ya existente, con el objetivo probable de especializarlo en el dominio agricola nigeriano, aunque esta hipotesis no esta confirmada por la documentacion.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta `conversational`).
- Capacidades de razonamiento y generacion de codigo heredadas del modelo base Qwen3.5-2B, aunque no se han verificado en este fine-tune.
- No se documenta soporte para tool calling, function calling, agentes, vision, audio ni modo de pensamiento extendido.
- El modelo esta etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`, lo que sugiere que puede desplegarse en entornos de produccion estandar.
- No se especifican capacidades multilingues; el unico idioma declarado es ingles.

## Casos de uso

Dado que no se ha publicado informacion detallada sobre el entrenamiento ni sobre las capacidades especificas, los siguientes casos de uso son hipoteticos y deben validarse con pruebas propias:

- Asistencia agricola basica: el modelo podria responder preguntas frecuentes sobre cultivos, plagas o practicas de riego en Nigeria, aprovechando su tamano reducido para despliegue en entornos con recursos limitados.
- Generacion de contenido educativo: crear guias o articulos divulgativos sobre agricultura sostenible en ingles, adaptados al contexto local.
- Chatbot de soporte para cooperativas agricolas: integrado en plataformas de mensajeria, con respuestas en tiempo real gracias a su baja latencia en GPU de consumo.
- Clasificacion y extraccion de informacion: dado su origen en Qwen, podria usarse para tareas de extraccion de entidades en textos agricolas, aunque no hay evidencia de fine-tuning especifico para ello.
- Prototipado rapido: al ser un modelo pequeno, sirve para validar ideas de aplicaciones NLP en el sector agricola antes de escalar a modelos mayores.
- Educacion y formacion: como herramienta de practica para estudiantes de agronomia que necesiten un modelo local y ligero.

Estos usos son especulativos; la ausencia de benchmarks y de una descripcion del dataset impide confirmar la idoneidad real del modelo para estas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. Tampoco se proporcionan comparativas con el modelo base o con otros modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,94B parametros, en precision FP16 se requieren aproximadamente 3,9 GB de VRAM; en cuantizacion INT8 alrededor de 2 GB; en INT4 cerca de 1 GB. Estas cifras son orientativas y dependen de la implementacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Para cuantizaciones mas agresivas, incluso GPUs integradas con 2 GB podrian ser suficientes.
- Es compatible con tarjetas consumer de gama baja y media, como RTX 3060, RTX 4070, etc.
- Opciones de despliegue: al estar etiquetado con `text-generation-inference`, puede servirse con TGI; los pesos GGUF permiten usar llama.cpp u Ollama; tambien es compatible con vLLM y otros frameworks estandar.
- Latencia y throughput: no se han publicado mediciones. En una GPU como RTX 4090, un modelo de 2B en FP16 suele generar decenas de tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. Existe un modelo con nombre similar, `Professor/naija-agri-llm-yoruba-hausa`, que parece ser un fine-tune del mismo base pero con soporte adicional para yoruba y hausa. Sin embargo, no se conocen sus parametros ni su rendimiento. Otras alternativas en el rango de 2B serian modelos como Qwen2.5-1.5B o Gemma-2-2B, pero no se han evaluado en este contexto.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScriptedBro/naija-agri-llm | 1,94B | no disponible | en | Apache 2.0 | Hugging Face |
| Professor/naija-agri-llm-yoruba-hausa | no disponible | no disponible | en, yo, ha | no disponible | Hugging Face |
| Qwen2.5-1.5B (base) | 1,5B | 32K (tipico) | multilingue | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos, alucinaciones o comportamientos no deseados. Al ser un fine-tune de un modelo pequeno, es probable que presente limitaciones en razonamiento complejo y generacion de codigo avanzado.
- El modelo solo declara soporte para ingles, a pesar de que el nombre sugiere un enfoque nigeriano donde se hablan multiples lenguas (yoruba, hausa, igbo). Esto limita su utilidad practica en el contexto local.
- No se especifica la longitud de contexto; si hereda la del base Qwen3.5-2B, podria estar en el rango de 32K tokens, pero no esta confirmado.
- La licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de Qwen, deben respetarse las condiciones de la licencia original de Qwen (aunque Qwen3.5 es Apache 2.0, segun el tag).
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad. Se recomienda realizar pruebas exhaustivas antes de usarlo en produccion.
- No se proporcionan datos de entrenamiento, por lo que no es posible evaluar la calidad del ajuste ni su especializacion real en agricultura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ScriptedBro/naija-agri-llm
- Perfil del autor: https://huggingface.co/ScriptedBro
- Modelo similar (otro autor): https://huggingface.co/Professor/naija-agri-llm-yoruba-hausa
- Repositorio de Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
