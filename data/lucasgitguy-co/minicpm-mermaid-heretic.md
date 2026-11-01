# Lucasgitguy-co/minicpm-mermaid-heretic

## Resumen

MiniCPM-V 4.7 1B Mermaid Heretic es un checkpoint de la familia MiniCPM-V, un modelo vision-language (image-text-to-text) afinado por el usuario Lucasgitguy-co para la generacion y conversion de diagramas Mermaid. El modelo parte de la arquitectura MiniCPMV4_7ForConditionalGeneration, con 1.554.476.272 parametros totales (aproximadamente 1,55 mil millones) almacenados en pesos BF16, y se distribuye en formato safetensors con un unico archivo de 3,109 GB. La licencia es Apache 2.0.

El interes del modelo es acotado pero especifico: se trata de un afinamiento orientado a una tarea concreta (diagramas Mermaid a partir de imagenes o texto) sobre una base MiniCPM-V de 1B, lo que lo hace ligero y desplegable en hardware modesto. El sufijo "Heretic" hace referencia a la herramienta de ablacion de rechazos Heretic, aunque la model card no documenta el procedimiento exacto aplicado ni el dataset de entrenamiento utilizado.

Conviene subrayar que la informacion publicada es minima: no hay resultados de benchmarks, no se documenta el dataset de entrenamiento ni el proceso de ajuste, y el propio autor advierte que los ejemplos de carga son orientativos y no constituyen una afirmacion de calidad medida. Cualquier evaluacion en produccion debe hacerse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPMV4_7ForConditionalGeneration (vision-language transformer) |
| Parametros totales | 1.554.476.272 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el repo principal; variante GGUF disponible en repo separado |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

La configuracion declara la clase `MiniCPMV4_7ForConditionalGeneration`, propia de la familia MiniCPM-V, que combina un codificador visual con un modelo de lenguaje para tareas image-text-to-text. El checkpoint se distribuye en BF16 y requiere una version de Transformers que incluya esta arquitectura (la model card menciona Transformers 5.18.0). El repositorio incluye pesos, tokenizer, chat template y configuracion del processor.

No se documenta en los artefactos inspeccionados el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El autor indica explicitamente que "detailed training data, training procedure, and benchmark results are not documented in the inspected artifacts". Se enlazan dos datasets relacionados del mismo autor (una coleccion de texto e imagenes de diagramas Mermaid y una coleccion de texto en ingles/neerlandes), pero la propia model card advierte que estos enlaces no establecen el split exacto de entrenamiento de cada checkpoint. El termino "Heretic" sugiere el uso de la herramienta de ablacion de rechazos del mismo nombre, cuyo licenciamiento es independiente del de los artefactos del modelo.

## Capacidades

- Generacion de texto e inferencia vision-language (image-text-to-text) sobre la base MiniCPM-V.
- Conversion de diagramas a codigo Mermaid: la model card propone el prompt "Convert this diagram into Mermaid code".
- Procesamiento de imagenes junto con instrucciones textuales, gracias al processor incluido en el repositorio.
- Conversacion multi-turno mediante el chat template incluido.
- Capacidades de tool calling / function calling: no documentadas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles (`en`).
- Modo thinking, vision avanzada o audio: no documentados mas alla del pipeline image-text-to-text.

## Casos de uso

- Conversion de diagramas a Mermaid en documentacion tecnica: a partir de una captura o imagen de un diagrama, el modelo genera el codigo Mermaid correspondiente, que despues se valida y se integra en un README o en una wiki. Es el caso de uso declarado por el autor.
- Generacion de diagramas de flujo en herramientas de gestion: dado un texto descriptivo de un proceso, producir el bloque Mermaid para insertarlo en issues, pull requests o documentacion interna.
- Prototipado rapido de diagramas de arquitectura de software: el modelo puede convertir bocetos de pizarras en codigo Mermaid editable, reduciendo el trabajo manual de redibujado.
- Asistencia en educacion tecnica: generar diagramas de secuencia, clase o estado a partir de enunciados en ingles para material didactico, siempre con revision humana del resultado.
- Automatizacion de documentacion en pipelines: integrar el modelo en un paso que reciba imagenes de diagramas y emita fragmentos Mermaid versionables en Git, con validacion sintactica previa al commit.
- Experimentacion e investigacion sobre ajuste fino de modelos VLM pequenos: al ser un checkpoint de 1B en BF16 con licencia Apache 2.0, sirve como base reproducible para estudiar tecnicas de ablacion de rechazos y afinamiento de tareas especificas.
- Despliegue en entornos con recursos limitados: la variante GGUF permite ejecucion en CPU o GPU de gama media para tareas de conversion de diagramas en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que los resultados de evaluacion no estan documentados en los artefactos inspeccionados y que los ejemplos de carga son orientativos, no una afirmacion de calidad medida.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 3,1 GB solo para pesos, mas overhead de activaciones y del codificador visual; en la practica, unos 6-8 GB para una ventana de contexto moderada.
- VRAM estimada en cuantizaciones GGUF: no disponible con detalle; la variante GGUF del mismo autor permite reducir el requisito por debajo de los 3 GB en cuantizaciones de 4 bits, aunque no se publican cifras exactas.
- GPU recomendadas: no documentadas por el autor. Por tamano, cabe en GPUs consumer con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) en BF16, y en GPUs con 4-6 GB usando GGUF cuantizado.
- Despliegue: Transformers (version que incluya `MiniCPMV4_7ForConditionalGeneration`), y llama.cpp/Ollama a traves de la variante GGUF. vLLM y TGI no estan documentados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM-V 4.7 1B Mermaid Heretic | 1,55 B | no disponible | Apache 2.0 | Afinado para Mermaid; sin benchmarks publicados |
| MiniCPM-V base (familia) | segun variante | no disponible en esta ficha | segun variante | Modelo upstream; capacidades VLM generales |
| Otros VLM pequenos (p. ej. Qwen2-VL 2B, SmolVLM) | ~2 B | no disponible en esta ficha | segun variante | Alternativas de tamano comparable; no se dispone de comparacion medida con este checkpoint |

No se dispone de datos de rendimiento comparativo entre este checkpoint y las alternativas, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia medida de calidad en la conversion a Mermaid ni en tareas VLM generales.
- Procedimiento de entrenamiento y dataset no documentados; los datasets enlazados no garantizan el split real utilizado.
- El autor recomienda validar el Mermaid generado antes de usarlo; el codigo de diagramas puede ser sintacticamente invalido o semanticamente incorrecto.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-language de este tamano, especialmente en diagramas densos o con texto pequeno.
- Soporte declarado unicamente en ingles; el rendimiento en castellano no esta documentado.
- Longitud de contexto no especificada, lo que dificulta planificar casos de uso con documentos o imagenes multiples.
- El termino "Heretic" implica una modificacion orientada a reducir rechazos; esto puede aumentar la probabilidad de respuestas no deseadas en dominios sensibles y debe evaluarse antes de exponer el modelo a usuarios finales.
- La licencia Apache 2.0 permite uso comercial, pero deben conservarse los avisos de atribucion upstream y las notas de terceros; la licencia de la herramienta Heretic es independiente.
- Repositorio con muy poca traccion (27 descargas, 0 likes) y creado recientemente; no hay historial de mantenimiento ni comunidad que valide su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic
- Variante GGUF: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic-gguf
- Dataset de texto e imagenes de diagramas Mermaid: https://huggingface.co/datasets/Lucasgitguy-co/mermaid-diagram-text-images
- Dataset de texto en ingles/neerlandes: https://huggingface.co/datasets/Lucasgitguy-co/mermaid-text-en-nl
- Documentacion de estructura de archivos: docs/FILE_STRUCTURE.md (en el repositorio)
- Procedencia y reproducibilidad: docs/PROVENANCE.md (en el repositorio)
- Historial de versiones: CHANGELOG.md (en el repositorio)
