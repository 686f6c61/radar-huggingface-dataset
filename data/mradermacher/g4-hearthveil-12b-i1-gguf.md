# mradermacher/G4-Hearthveil-12B-i1-GGUF

## Resumen

G4-Hearthveil-12B-i1-GGUF es la version cuantizada con imatrix del modelo G4-Hearthveil-12B, un modelo de lenguaje de aproximadamente 11.900 millones de parametros orientado a roleplay, escritura creativa y narracion (storywriting). El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, mientras que el modelo base original es de OutisR. La ficha que nos ocupa corresponde unicamente al repositorio de pesos cuantizados en formato GGUF, no al modelo original.

El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para ejecutarse en entornos de inferencia locales mediante llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, etc.). El repositorio incluye una bateria amplia de cuantizaciones, desde IQ1_S (3,1 GB) hasta Q6_K (9,9 GB), lo que permite desplegarlo desde equipos con poca VRAM hasta configuraciones mas holgadas.

La relevancia de esta ficha radica en que el modelo base esta etiquetado como `gemma4`, lo que sugiere que deriva de la familia Gemma 4, y ademas la model card indica que es un modelo de vision (los ficheros `mmproj` estarian en el repositorio estatico). Sin embargo, no se dispone de informacion detallada sobre arquitectura, contexto o datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `gemma4`; probablemente transformer derivado de Gemma 4) |
| Parametros totales | 11.907.350.576 (aprox. 11,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | en, ru, multilingual (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (mas fichero imatrix para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

No se proporciona informacion detallada sobre la arquitectura del modelo base en la documentacion disponible. La etiqueta `gemma4` sugiere que OutisR/G4-Hearthveil-12B deriva de un modelo de la familia Gemma 4, pero no se confirma si se trata de un fine-tuning completo, un merge o una adaptacion con LoRA. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras variantes de alineamiento.

La model card del repositorio cuantizado menciona que se trata de un modelo de vision y que los ficheros `mmproj` (proyector multimodal) se encontrarian en el repositorio estatico hermano (mradermacher/G4-Hearthveil-12B-GGUF), no en este repositorio de cuantizaciones i1. La cuantizacion se ha realizado con el metodo imatrix (importance matrix), que ajusta la perdida de calidad de las cuantizaciones de baja precision usando estadisticas de activacion.

## Capacidades

- Generacion de texto orientada a roleplay y escritura creativa, segun las etiquetas del repositorio.
- Narracion y storywriting, con enfasis en continuidad de personajes y estilo.
- Capacidad multilingue: la model card declara ingles, ruso y soporte multilingue generico.
- Posible soporte de vision (la model card indica "This is a vision model"), aunque los ficheros mmproj no estan en este repositorio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo "thinking" explicito ni capacidades de audio.

## Casos de uso

- Roleplay conversacional local: el modelo puede gestionar dialogos multi-turno manteniendo el personaje gracias a su naturaleza afinada para roleplay; se desplegaria con llama.cpp u Ollama en un equipo con GPU consumer.
- Escritura creativa asistida: generacion de relatos, dialogos y descripciones con estilo consistente, adecuado para autores que quieran un asistente local sin dependencia de la nube.
- Prototipado de narrativa interactiva: integracion en motores de ficcion interactiva o videojuegos narrativos donde se necesita generar respuestas de personajes en tiempo real.
- Generacion de contenido multilingue en ingles y ruso: util para proyectos editoriales o de localizacion que requieran ambos idiomas, con la cautela de que el castellano no esta declarado explicitamente.
- Experimentacion e investigacion en cuantizacion: el repositorio incluye el fichero imatrix y multiples niveles de cuantizacion, lo que permite estudiar el impacto de la precision en la calidad de salida.
- Despliegue en hardware modesto: las variantes IQ2 e IQ3 (3-6 GB) permiten ejecutar el modelo en GPU con 6-8 GB de VRAM para pruebas de concepto y demos.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es el ideal para reentrenar, la existencia del modelo base en safetensors (OutisR/G4-Hearthveil-12B) permite adaptaciones con LoRA sobre el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF mas overhead de contexto):
  - IQ1_S (3,1 GB): ~4 GB de VRAM.
  - IQ2_M (4,5 GB): ~5,5 GB de VRAM.
  - IQ3_M (5,8 GB): ~7 GB de VRAM.
  - Q4_K_M (7,5 GB): ~9 GB de VRAM.
  - Q5_K_M (8,6 GB): ~10 GB de VRAM.
  - Q6_K (9,9 GB): ~11,5 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100/H100 para despliegues con contexto largo o batched.
- Cabe en GPU consumer: si, desde IQ1/IQ2 en GPUs de 6-8 GB; Q4_K_M y superiores requieren 10-12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp y cualquier runtime compatible con GGUF. Para vision seria necesario cargar el mmproj del repositorio estatico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-Hearthveil-12B-i1-GGUF | ~11,9 B | no disponible | Apache 2.0 | GGUF | Cuantizacion imatrix de un fine-tuning orientado a roleplay sobre base tipo Gemma 4 |
| OutisR/G4-Hearthveil-12B (base) | ~11,9 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; permite fine-tuning y conversion |
| mradermacher/G4-Hearthveil-12B-GGUF (estatico) | ~11,9 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas; incluye ficheros mmproj para vision |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion para este modelo en la informacion disponible.
- El modelo esta afinado para roleplay y ficcion, por lo que puede no ser fiable en tareas factuales, tecnicas o de razonamiento estricto.
- Los idiomas declarados son ingles, ruso y multilingue generico; no se garantiza un rendimiento solido en castellano.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "mostly desperate".
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original y de la familia Gemma 4 de la que deriva, ya que podrian imponer restricciones adicionales de uso.
- La funcionalidad de vision requiere descargar los ficheros mmproj desde el repositorio estatico; este repositorio por si solo no la habilita.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines automatizados que dependan de function calling.
- El repositorio ocupa 140,4 GB en total por incluir todas las cuantizaciones; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/G4-Hearthveil-12B-i1-GGUF
- Modelo base: https://huggingface.co/OutisR/G4-Hearthveil-12B
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/G4-Hearthveil-12B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#G4-Hearthveil-12B-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
