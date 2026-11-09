# DavidAU/OpenAI-gpt-oss-20B-INSTRUCT-Heretic-Uncensored-MXFP4

## Resumen

OpenAI-gpt-oss-20B-INSTRUCT-Heretic-Uncensored-MXFP4 es un fine-tune del modelo gpt-oss-20B de OpenAI, distribuido por el usuario DavidAU en Hugging Face. El punto de partida es `huihui-ai/Huihui-gpt-oss-20b-mxfp4-abliterated-v2`, una version "abliterated" (es decir, con los mecanismos de rechazo eliminados mediante la tecnica de abliteration) del gpt-oss-20B original. Sobre esa base, DavidAU aplica un ajuste fino con Unsloth para convertir el modelo de "thinking" en un modelo "instruct", eliminando por completo el modo de razonamiento interno y el formato de etiquetas `<think>`.

El resultado es un modelo conversacional que responde directamente sin cadena de pensamiento, sin guardrails de seguridad y con una ventana de contexto declarada de 128k tokens. El autor lo etiqueta explicitamente como "uncensored" y "heretic", orientado a generacion de contenido sin filtros, incluyendo roleplay y contenido explicito. La licencia declarada es Apache 2.0, heredada del gpt-oss original.

Es relevante en el ecosistema porque combina tres tendencias actuales: la popularizacion de los modelos gpt-oss de OpenAI con licencia permisiva, las tecnicas de abliteration para eliminar rechazos, y los pipelines de fine-tuning accesibles con Unsloth. Ahora bien, el autor advierte que es un "work in progress" y que no todo puede funcionar correctamente. El dato de parametros en safetensors (1.804.459.584) no coincide con los 20B nominales del nombre, lo que sugiere que el repo contiene pesos en formato MXFP4 cuyo recuento real de parametros no se refleja correctamente en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo gpt_oss (MoE, segun la familia gpt-oss-20B de OpenAI) |
| Parametros totales | 20B nominales (metadatos safetensors: 1.804.459.584; discrepancia no aclarada por el autor) |
| Parametros activos | no disponible |
| Longitud de contexto | 128k tokens (declarado en la model card) |
| Tipos de cuantizacion | MXFP4 (version publicada); existe version BF16 en repo separado |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MXFP4, 8-bit) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de la familia gpt-oss-20B de OpenAI, que es un transformer con mezcla de expertos (MoE) segun la documentacion publica de dicha familia; la model card de este fine-tune no detalla la configuracion interna (numero de expertos, dimensiones, atencion). El pipeline de creacion tiene tres etapas: primero, el gpt-oss-20B original; segundo, la abliteration realizada por el equipo huihui-ai para eliminar rechazos; tercero, el fine-tuning de DavidAU con Unsloth sobre el dataset `TeichAI/mistral-small-creative-500x`, orientado a estilo creativo y conversacional.

La innovacion principal respecto al modelo base es la eliminacion del modo de razonamiento: el autor afirma que el "thinking/reasoning" fue removido por completo, de modo que el modelo responde de forma directa sin generar cadenas de pensamiento. Tambien se eliminan los guardrails de rechazo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales. El autor menciona que el tuning sirve para "arreglar" posibles problemas derivados del proceso de decensoring.

## Capacidades

- Generacion de texto conversacional en ingles, con respuesta directa sin cadena de pensamiento.
- Roleplay y escritura creativa, incluyendo contenido explicito y lenguaje soez cuando se le dirige explicitamente.
- Generacion de contenido sin rechazos: no aplica guardrails de seguridad ni filtros de contenido.
- Soporte de system prompts opcionales: el autor documenta dos ejemplos, uno "profesional" y otro de rol (Joker de Batman), que reactivan un formato de pensamiento entre etiquetas `<think>` a nivel de prompt, no de arquitectura.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni matematicas avanzadas en la informacion disponible.

## Casos de uso

- Roleplay y ficcion interactiva sin restricciones: el modelo esta disenado para personajes y narrativas que otros modelos rechazarian, con ajuste de temperatura entre 0.8 y 2.5 y repetition penalty de 1.1 para modo creativo.
- Escritura creativa adulta: el autor indica que genera contenido explicito si se le proporciona vocabulario y directrices explicitas; util para autores que necesitan borradores sin filtros.
- Generacion de dialogos con tono soez o agresivo: adecuado para guiones, videojuegos o narrativa que requiera lenguaje crudo, indicando al modelo los terminos concretos a emplear.
- Prototipado de asistentes conversacionales sin capa de moderacion: para entornos controlados donde el operador gestiona la moderacion aguas arriba, el modelo responde sin negativas.
- Experimentacion en investigacion sobre alineacion y abliteration: sirve como caso de estudio de como el fine-tuning sobre un modelo abliterated afecta al comportamiento y a la calidad de las respuestas.
- Despliegue local en formato MXFP4: el formato de 8 bits reduce el peso en disco (repo de 13.8 GB) y facilita su ejecucion en hardware de consumo, segun el autor, con soporte en KoboldCpp, text-generation-webui y Silly Tavern.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un agradecimiento al equipo Nightmedia por "benchmarks", pero no se incluyen cifras en la model card.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 13.8 GB en MXFP4, por lo que la inferencia requiere aproximadamente 14-16 GB de VRAM en funcion del overhead de contexto y del runtime.
- GPU recomendadas: RTX 4090 (24 GB) o superiores para contexto largo; A100 o H100 para despliegues con contexto de 128k completo y concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4080, 4090, 4060 Ti de 16 GB) en cuantizacion MXFP4; en 8-12 GB probablemente no sin cuantizacion adicional.
- Opciones de despliegue: transformers (libreria declarada), KoboldCpp, oobabooga/text-generation-webui (con llama_HF para GGUF), Silly Tavern. No se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DavidAU/OpenAI-gpt-oss-20B-INSTRUCT-Heretic-Uncensored-MXFP4 | 20B nominales | 128k | Apache 2.0 | Sin thinking, sin guardrails, solo ingles |
| huihui-ai/Huihui-gpt-oss-20b-mxfp4-abliterated-v2 | 20B nominales | 128k | Apache 2.0 | Modelo base; conserva thinking y abliteration |
| OpenAI gpt-oss-20B original | 20B nominales | 128k | Apache 2.0 | Modelo oficial con thinking y guardrails |
| DavidAU/OpenAI-gpt-oss-20B-INSTRUCT-Heretic-Uncensored (BF16) | 20B nominales | 128k | Apache 2.0 | Misma receta en BF16 |

## Limitaciones y advertencias

- Modelo explicitamente sin guardrails: puede generar contenido violento, sexual, ilegal o danino sin rechazo; no apto para produccion orientada al publico general sin moderacion externa.
- Solo ingles: no se declara soporte multilingue.
- Eliminacion del modo de razonamiento: pierde la capacidad de cadena de pensamiento del gpt-oss original, lo que puede degradar tareas que se benefician de razonamiento paso a paso.
- El autor lo califica como "work in progress": no garantiza que todas las funcionalidades operen correctamente.
- Discrepancia en el recuento de parametros entre el nombre (20B) y los metadatos safetensors (1.8B): conviene verificar el comportamiento real antes de dimensionar hardware.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; al ser un fine-tune creativo, la propension a inventar datos puede ser alta.
- La abliteration y el fine-tuning pueden introducir degradaciones en coherencia, instrucciones complejas y formato estructurado.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o terminos de servicio de plataformas; la responsabilidad recae en el operador.
- Requiere ajustes de sampling especificos (smoothing factor 1.5, repetition penalty 1.02-1.1) para un funcionamiento estable segun el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/OpenAI-gpt-oss-20B-INSTRUCT-Heretic-Uncensored-MXFP4
- Version BF16: https://huggingface.co/DavidAU/OpenAI-gpt-oss-20B-INSTRUCT-Heretic-Uncensored
- Modelo base: https://huggingface.co/huihui-ai/Huihui-gpt-oss-20b-mxfp4-abliterated-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/mistral-small-creative-500x
- Perfil del autor: https://huggingface.co/DavidAU
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Coleccion de archivos fuente del autor: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
