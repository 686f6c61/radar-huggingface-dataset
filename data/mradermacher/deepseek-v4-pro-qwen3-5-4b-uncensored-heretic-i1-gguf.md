# mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF es una cuantizacion GGUF con imatrix realizada por mradermacher sobre el modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic. Se trata de un modelo de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) que combina la etiqueta Qwen3.5 con tecnicas de destilacion de DeepSeek, segun los tags del repositorio. La denominacion "heretic" y "uncensored/abliterated" indica que el modelo base ha sido sometido a un proceso de abliteracion o decensurado para reducir los rechazos en las respuestas.

El repositorio ofrece una bateria completa de cuantizaciones i1 (imatrix) en formato GGUF, desde Q2_K (2,1 GB) hasta Q6_K (3,7 GB), pensadas para ejecucion local con llama.cpp y herramientas compatibles. El modelo es multimodal segun la model card ("This is a vision model"), con archivos mmproj disponibles en el repositorio estatico del mismo autor. Soporta seis idiomas declarados: ingles, chino, coreano, japones, espanol y ruso.

La relevancia actual radica en que permite desplegar un modelo de razonamiento y matematicas de ~4B parametros en hardware de consumo, con cuantizaciones que caben en 3-4 GB de VRAM o RAM, y con la flexibilidad de un modelo sin las restricciones de seguridad habituales. La licencia Apache 2.0 facilita su uso comercial, aunque con las advertencias propias de un modelo abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun tags; detalles exactos no disponibles) |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio. Los tags indican `qwen3_5`, `distillation`, `deepseek`, `sft`, `mtp`, `reasoning`, `math` y `stem`, lo que sugiere un transformer derivado de la familia Qwen3.5, afinado mediante SFT y destilacion de un modelo DeepSeek (probablemente para transferir capacidades de razonamiento y matematicas). El tag `mtp` podria referirse a multi-token prediction, aunque no se confirma en la documentacion. El proceso "heretic"/"abliterated" implica una modificacion de los pesos orientada a eliminar el comportamiento de rechazo (refusal), tipicamente mediante abliteracion de direcciones de activacion.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se documentan innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. Las cuantizaciones i1 han sido generadas con un fichero imatrix (0,1 GB) incluido en el repositorio, lo que mejora la calidad respecto a cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Razonamiento explicito (tag `reasoning`) y modo de pensamiento segun la nomenclatura de la familia Qwen3.5.
- Matematicas y STEM (tags `math`, `stem`).
- Capacidad multimodal de vision: la model card indica explicitamente que es un modelo de vision, con archivos mmproj en el repositorio estatico.
- Destilacion de conocimiento de DeepSeek para tareas de razonamiento.
- Multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento "uncensored"/"abliterated": menor tasa de rechazos ante peticiones que el modelo original rechazaria.
- Compatible con text-generation-inference y `endpoints_compatible` segun tags.
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Razonamiento matematico local: el modelo puede resolver problemas de algebra y calculo en entornos sin conexion, ejecutandose con llama.cpp en una GPU de 4-6 GB o incluso en CPU, gracias a sus cuantizaciones de 2-3 GB.
- Asistente de programacion en estaciones de trabajo modestas: con i1-Q4_K_M (2,9 GB) cabe en una RTX 3050 o similar y permite autocompletado y explicacion de codigo sin depender de la nube.
- Procesamiento de documentos con vision: al ser multimodal, puede extraer informacion de imagenes y capturas usando los archivos mmproj del repositorio estatico, util para digitalizacion de facturas o tickets.
- Investigacion sobre alineacion y seguridad: el caracter abliterated lo convierte en objeto de estudio para analizar como la eliminacion de direcciones de rechazo afecta a la utilidad y al comportamiento del modelo.
- Traduccion multilingue entre los seis idiomas soportados (en, zh, ko, ja, es, ru), especialmente util para pares con el espanol en entornos locales.
- Despliegue embebido y edge computing: con cuantizaciones Q2_K (2,1 GB) o IQ3_XS puede ejecutarse en dispositivos con poca memoria, como mini-PC o Raspberry Pi con 8 GB de RAM.
- Generacion creativa sin restricciones: escritura de ficcion o guiones donde el modelo base censuraria ciertos temas, con la advertencia de revisar el contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 2,1 GB (i1-Q2_K) y 3,7 GB (i1-Q6_K); anadir margen para el contexto KV cache (dependiente de la longitud de contexto, no documentada).
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente para las cuantizaciones Q4 y Q5; una RTX 3060, RTX 4060, RTX 3050 o GTX 1660 pueden ejecutar el modelo completo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas; las cuantizaciones Q2/IQ3 caben incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), text-generation-inference (segun tags), y cualquier runtime compatible con GGUF; los archivos mmproj requieren llama.cpp con soporte multimodal.
- Latencia y throughput: no disponibles en la informacion proporcionada; en una GPU de consumo se espera un throughput alto por el reducido tamano del modelo, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic (este) | ~4,3B | no disponible | Apache 2.0 | GGUF i1 | Vision, abliterated, 6 idiomas |
| Qwen3.5-4B (base de referencia) | ~4B | no disponible | Apache 2.0 (segun familia) | safetensors/GGUF | Modelo original sin abliterar; capacidades de razonamiento de la familia Qwen3.5 |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | no disponible | MIT (segun familia) | safetensors/GGUF | Destilado de razonamiento de DeepSeek en tamano menor |
| Llama 3.2 3B Instruct | ~3B | 128K | Llama 3.2 Community | safetensors/GGUF | Alternativa generalista, sin abliterar |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: la eliminacion de rechazos puede degradar la coherencia en temas sensibles y aumentar la probabilidad de contenido inapropiado; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: como todo modelo de ~4B, la tasa de alucinacion es mayor que en modelos de mayor tamano; conviene verificar hechos en tareas criticas.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en conversaciones o documentos largos sin pruebas previas.
- Idiomas: aunque se declaran seis, el soporte real puede ser desigual; el espanol figura en la lista pero no se aportan evaluaciones por idioma.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado por un modelo sin censura.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la calidad; se recomienda IQ4_XS o Q4_K_M para uso en produccion.
- El modelo es una cuantizacion: no incluye los pesos originales en safetensors, por lo que para fine-tuning hay que acudir al modelo base.
- Los archivos mmproj (vision) estan en el repositorio estatico del autor, no en este repositorio i1; hay que descargarlos por separado.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
