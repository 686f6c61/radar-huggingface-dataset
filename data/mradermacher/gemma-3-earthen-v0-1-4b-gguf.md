# mradermacher/Gemma-3-Earthen-v0.1-4B-GGUF

## Resumen

Gemma-3-Earthen-v0.1-4B-GGUF es la version cuantizada en formato GGUF del modelo Gemma-3-Earthen-v0.1-4B, un ajuste fino (fine-tune) del modelo base Gemma 3 de Google en su variante de 4B de parametros. El modelo original ha sido desarrollado por PJMixers-Dev, mientras que esta version GGUF ha sido generada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo esta disenado para tareas conversacionales y de generacion de texto en ingles, con un enfasis claro en el rol-playing (RP), la escritura creativa y el dialogo multi-turno.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de la familia Gemma 3 en hardware de consumo, gracias a las cuantizaciones GGUF que van desde 1,8 GB (Q2_K) hasta 7,9 GB (f16). El modelo base conserva la arquitectura transformer de Gemma 3, con 3.880.263.168 parametros totales, y ha sido entrenado sobre una mezcla extensa de datasets orientados a conversacion, role-playing, matematicas, codigo y razonamiento, tal como se detalla en la model card del autor original.

El interes actual de este modelo reside en su especializacion: no es un modelo generalista, sino un fine-tune orientado a la coherencia narrativa, la adopcion de personajes y la conversacion abierta, lo que lo hace atractivo para proyectos de entretenimiento, prototipado de asistentes conversacionales y experimentacion con modelos pequenos en local. La licencia Gemma impone restricciones de uso que deben revisarse antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 3) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Gemma-3-Earthen-v0.1-4B es un fine-tune del Gemma 3 de 4B de parametros de Google, que emplea una arquitectura transformer densa (no MoE) con 3.880.263.168 parametros. La model card del autor original no detalla la composicion exacta del dataset de preentrenamiento ni el numero de tokens utilizados, pero si lista una mezcla muy extensa de datasets de ajuste supervisado (SFT) orientados a conversacion, role-playing, matematicas, codigo, razonamiento fisico y teoria de la mente, resumen de noticias, persuasión y escritura creativa. Entre ellos destacan contribuciones de PocketDoc (Toolmaxx, Codemaxx, MemoryCore, ProseMaxx), PJMixers (Math-Multiturn, AP-News, Aesir-RPG), anthracite-org (c2_logs, nopm_claude_writing), grimulkan (aicg-logs, PIPPA-augmented) y Gryphe (Opus-WritingPrompts), entre muchos otros.

No se dispone de informacion sobre el uso de RLHF, DPO u otras tecnicas de alineacion adicionales, ni sobre innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La cuantizacion GGUF ha sido realizada por mradermacher mediante conversion estatica (convert_type: hf), sin cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion. El repositorio incluye archivos mmproj (multi-modal supplement) en Q8_0 y f16, lo que sugiere que el modelo base conserva la capacidad de procesar entradas multimodales (imagenes) heredada de Gemma 3.

## Capacidades

- Generacion de texto conversacional y multi-turno en ingles.
- Role-playing y adopcion de personajes, con datasets especificos de charcards y logs de rol.
- Escritura creativa y narrativa (ProseMaxx, Opus-WritingPrompts, nopm_claude_writing).
- Razonamiento matematico basico y resolucion de problemas (Math-Multiturn, LeetCode).
- Generacion y feedback de codigo (Codemaxx-LeetCode, Codemaxx-CodeFeedback).
- Tool calling / function calling (Toolmaxx-Functions-ToolACE).
- Razonamiento fisico y teoria de la mente (grimulkan_physical-reasoning, theory-of-mind).
- Resumen de noticias y textos periodisticos (AP-News-2024).
- Capacidad multimodal heredada de Gemma 3, con archivos mmproj incluidos para procesar imagenes.
- Soporte de conversaciones largas y memoria de contexto (MemoryCore, c2_logs_32k).

## Casos de uso

- Role-playing y entretenimiento conversacional: el modelo puede mantener conversaciones multi-turno con coherencia de personaje gracias a su entrenamiento sobre charcards y logs de rol (Aesir-RPG, LimaRP, chub-logs), lo que lo hace adecuado para chatbots de personajes y juegos de texto.
- Escritura creativa asistida: con datasets como Opus-WritingPrompts y ProseMaxx, el modelo puede generar narrativa, dialogos y descripciones literarias, util para herramientas de escritura o generacion de contenido.
- Prototipado de asistentes conversacionales en local: al estar disponible en GGUF y caber en GPUs de consumo, permite iterar rapidamente en el diseno de flujos conversacionales sin depender de APIs externas.
- Generacion de codigo y feedback tecnico: el modelo ha sido entrenado con LeetCode y CodeFeedback, por lo que puede emplearse para sugerir soluciones, explicar errores o revisar fragmentos de codigo en entornos de desarrollo.
- Tool calling en agentes sencillos: la inclusion de ToolACE en el dataset de entrenamiento permite integrar el modelo en pipelines de agentes que requieran invocar funciones o APIs externas, aunque con las limitaciones propias de un modelo de 4B.
- Resumen de noticias y documentos: el dataset AP-News-2024 sugiere capacidad para resumir textos periodisticos, util en agregadores de noticias o sistemas de sintesis documental.
- Analisis multimodal basico: gracias a los archivos mmproj, el modelo puede procesar imagenes junto con texto, lo que permite prototipos de descripcion de imagenes o respuesta a preguntas visuales en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~1,8 GB; Q3_K_S ~2,0 GB; Q3_K_M ~2,2 GB; Q3_K_L ~2,3 GB; IQ4_XS ~2,4 GB; Q4_K_S ~2,5 GB; Q4_K_M ~2,6 GB; Q5_K_S ~2,9 GB; Q5_K_M ~2,9 GB; Q6_K ~3,3 GB; Q8_0 ~4,2 GB; f16 ~7,9 GB. Los archivos mmproj anaden 0,7 GB (Q8_0) o 1,0 GB (f16) si se usa la capacidad multimodal.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 para cuantizaciones superiores; A100 o H100 no son necesarias para este tamano, pero pueden usarse para mayor throughput.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4-8 GB de VRAM, dependiendo de la cuantizacion y de la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Tambien puede usarse con transformers si se dispone del modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3-Earthen-v0.1-4B-GGUF | 3.880.263.168 | no disponible | gemma | GGUF | Fine-tune orientado a RP y conversacion |
| Gemma 3 4B (base) | ~4B | no disponible | gemma | safetensors, GGUF | Modelo generalista de Google |
| Qwen2.5-3B-Instruct | ~3B | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa generalista con licencia permisiva |
| Llama 3.2 3B Instruct | ~3B | no disponible | Llama 3.2 | safetensors, GGUF | Alternativa generalista de Meta |

La comparativa se basa en la categoria de tamano (3-4B) y en la disponibilidad de versiones GGUF. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune sobre datasets de role-playing y conversacion, puede reproducir sesgos presentes en esos datos, incluyendo estereotipos de personajes y contenido sensible.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento factual o matematicas complejas.
- Limitaciones de contexto o idioma: el modelo esta entrenado principalmente en ingles y no se garantiza un rendimiento adecuado en castellano u otros idiomas. La longitud de contexto no esta documentada en la informacion disponible.
- Restricciones de licencia: la licencia Gemma impone terminos de uso que deben revisarse antes de cualquier despliegue comercial, incluyendo posibles restricciones de redistribucion y uso.
- Caveats para produccion: el modelo es un fine-tune de la comunidad, sin benchmarks publicados, por lo que su calidad en tareas especificas no esta validada. Se recomienda evaluacion propia antes de usarlo en entornos productivos. La cuantizacion GGUF puede degradar ligeramente la calidad respecto al modelo original en safetensors.

## Enlaces

- [Hugging Face: mradermacher/Gemma-3-Earthen-v0.1-4B-GGUF](https://huggingface.co/mradermacher/Gemma-3-Earthen-v0.1-4B-GGUF)
- [Modelo base: PJMixers-Dev/Gemma-3-Earthen-v0.1-4B](https://huggingface.co/PJMixers-Dev/Gemma-3-Earthen-v0.1-4B)
- [Pagina de descargas de mradermacher para este modelo](https://hf.tst.eu/model#Gemma-3-Earthen-v0.1-4B-GGUF)
- [Ejemplo de README de TheBloke para uso de GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Grafico de calidad de cuantizaciones de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [FAQ y solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
