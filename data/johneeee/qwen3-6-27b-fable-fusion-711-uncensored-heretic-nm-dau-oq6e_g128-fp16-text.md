# Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ6e_g128-fp16-text

## Resumen

Este repositorio contiene una cuantizacion de 6 bits del modelo Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU, un ajuste fino y merge multi-etapa de Qwen3.6-27B desarrollado por DavidAU. La version publicada por el usuario Johneeee se ha generado con oQ (oMLX v0.7.0.dev4), un esquema de cuantizacion de precision mixta orientado a MLX, con grupo de 128 y pesos en formato MLX safetensors. El modelo declara 26.895.998.464 parametros (~26,9 B) y el repositorio ocupa 21,5 GB.

El interes principal de esta variante es la fidelidad de la cuantizacion: segun los datos del autor, apenas degrada la perplejidad frente a la referencia de 8 bits (+0,055 % en wikitext-2-raw) y ofrece el mejor compromiso tamano/velocidad de las tres configuraciones medidas (4,7 s por ventana, sin cabeza MTP). El modelo base se hizo conocido por superar los 700 puntos en ARC-C tanto en 8 bits como en 4 bits (0,711 y 0,701), algo inedito en su categoria segun la cobertura publica disponible.

Conviene ser prudente: la ficha de HuggingFace no documenta licencia, idiomas soportados, longitud de contexto ni benchmarks de tarea propios de esta cuantizacion, y el repositorio registraba 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia Qwen3.6-27B; metadatos indican tipo `qwen3_5`); no se confirma si es denso o MoE |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, precision mixta oQ (oMLX v0.7.0.dev4), group size 128 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 21,5 GB |
| Vocabulario | 248.320 entradas (deducido de la forma de salida `(1, seq, 248320)`) |
| Biblioteca | `mlx` |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de la etiqueta `qwen3_5` en los metadatos y de su pertenencia a la familia Qwen3.6-27B. Por el recuento de parametros (~27 B) y la ausencia de referencias a expertos activos, cabe suponer un transformer denso, pero este extremo no esta confirmado en la documentacion proporcionada. El autor de la cuantizacion senala que las cuatro configuraciones comparadas declaran `mtp_layers: []` y que la salida del modelo es un unico tensor con forma `(1, seq, 248320)`, lo que confirma el tamano de vocabulario y la ausencia de cabeza MTP efectiva en estos pesos, pese al sufijo `-mtp` de algunas variantes hermanas.

En cuanto al entrenamiento, la cobertura de prensa describe el modelo base como un fine-tune y merge multi-etapa que combina el trabajo de varios modelos, pero no se dispone de datos sobre numero de tokens, composicion del dataset, ni uso de RLHF, DPO u otras tecnicas de alineamiento. La innovacion tecnica destacable de este repositorio es puramente de compresion: el esquema oQ de precision mixta con grupo de 128, que segun las mediciones del autor mantiene la divergencia de perplejidad en +0,055 % frente a la referencia de 8 bits, con una KLD directa de 0,0017 nat y un top-1 de 0,9805.

## Capacidades

- Generacion de texto: es la capacidad base declarada por la libreria `mlx` y el sufijo `-text` del repositorio, que apunta a pesos unicamente de texto.
- Vision, audio o multimodalidad: no disponible; el nombre y las etiquetas del repositorio no incluyen ningun modulo multimodal.
- Tool calling / function calling: no disponible; no hay documentacion al respecto en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking" o razonamiento extendido: no disponible.
- Naturaleza "uncensored/heretic": el nombre del modelo base indica que ha pasado por un proceso de reduccion de rechazos (abliteration o similar), lo que en la practica reduce las negativas ante peticiones sensibles. No hay documentacion que cuantifique ese efecto en esta cuantizacion concreta.
- Codigo y matematicas: no disponible a nivel de esta cuantizacion; sin benchmarks de HumanEval, GSM8K ni similares.

## Casos de uso

- Generacion de ficcion y narrativa sin filtros editoriales: la naturaleza "uncensored" del merge base permite trabajar tramas, dialogos o temas adultos que otros modelos rechazan. Util para guionistas y autores que necesitan explorar material sensible en local.
- Prototipado local en Apple Silicon: un 27B de alta fidelidad ejecutable integramente en un Mac con memoria unificada suficiente, sin enviar datos a la nube. Adecuado para equipos con requisitos de confidencialidad.
- Investigacion sobre cuantizacion: el repositorio incluye mediciones de perplejidad y KLD sobre wikitext-2-raw, lo que lo convierte en un caso de estudio replicable para comparar esquemas oQ de 6, 8 y 6 bits con grupo ampliado.
- Red teaming y evaluacion de seguridad: los modelos desvinculados de rechazos se emplean habitualmente para sondear fallos de moderacion, generar conjuntos adversarios y medir la robustez de clasificadores.
- Asistencia de escritura tecnica y edicion de textos largos: con un 27B se obtiene coherencia sostenida en documentos de varias paginas, siempre que se respete la ventana de contexto real del modelo (no documentada).
- Experimentacion con pipelines MLX: validacion de integraciones con `mlx-lm` y herramientas del ecosistema oMLX en flujos de inferencia locales y enrutado de peticiones.
- Sustitucion de API en entornos sin conectividad: despliegue en portatil o estacion de trabajo aislada para tareas de resumen, reescritura y clasificacion textual.

## Benchmarks y rendimiento

Los unicos datos publicados para este repositorio corresponden a fidelidad de cuantizacion medida sobre wikitext-2-raw (51.100 posiciones, soporte top-512, logits en fp32), comparada contra la referencia oQ8e-mtp:

| Variante | Perplejidad | ΔPer (%) | fwd KLD | rev KLD | JSD | top-1 |
|---|---|---|---|---|---|---|
| oQ8e-mtp (base) | 7,9190 | 0 | — | — | — | 1,0000 |
| oQ6e-mtp | 7,9215 | +0,032 | 0,0013 | 10,62 | 5,31 | 0,9839 |
| oQ6e-g128-text (esta) | 7,9233 | +0,055 | 0,0017 | 10,88 | 5,44 | 0,9805 |
| oQ63e-text | 7,9401 | +0,267 | 0,0031 | 11,78 | 5,89 | 0,9764 |

Coste medido por ventana: 4,7 s para oQ6e-g128-text, 5,6 s para oQ6e-mtp.

Datos de tarea del modelo base (no de esta cuantizacion), segun la cobertura publica del merge de DavidAU: ARC-C de 0,711 en 8 bits y 0,701 en 4 bits.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para esta cuantizacion especifica.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 21,5 GB, por lo que se necesita un minimo practico de ~22-24 GB de memoria disponible para inferencia.
- Plataforma: MLX esta disenado para Apple Silicon, de modo que el destino natural son chips de la serie M. Se recomienda memoria unificada de 32 GB o superior (M1/M2/M3/M4 Pro, Max o Ultra) para dejar margen al contexto y a los buffers de atencion.
- GPU NVIDIA: no hay soporte nativo de MLX en CUDA. Para usar A100, H100 o RTX 4090 habria que convertir los pesos a GGUF u otro formato, con la perdida de fidelidad que ello implica.
- GPU de consumo: una RTX 4090 (24 GB) podria alojar una conversion equivalente de 6 bits, pero no ejecutaria estos pesos MLX tal cual.
- Opciones de despliegue: `mlx-lm` y el ecosistema oMLX (oQ). No son compatibles de forma nativa con vLLM, TGI, llama.cpp u Ollama sin conversion previa.
- Latencia y throughput: el autor reporta 4,7 s por ventana de evaluacion en el entorno de medida, cifra util como referencia relativa frente a los 5,6 s de la variante con cabeza MTP, pero no equivale a un throughput de produccion en tokens por segundo.
- No se dispone de datos de latencia, tokens/s ni consumo energetico en condiciones de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Fidelidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repo (oQ6e g128) | 26,9 B | 6 bits, group 128 | MLX safetensors | ΔPer +0,055 % | no disponible | publico en HF, 0 descargas |
| Qwen3.6-27B-...-oQ5e | no disponible | 5 bits | MLX safetensors | no disponible | no disponible | publico en HF |
| Qwen3.6-27B-...-oQ6e-mtp | no disponible | 6 bits con cabeza MTP | MLX safetensors | ΔPer +0,032 % | no disponible | publico en HF |
| Qwen3.6-27B-...-NEO-MAX-MTP-GGUF | 27 B | 4 y 8 bits | GGUF | ARC-C 0,711 (8-bit) / 0,701 (4-bit) | no disponible | publico en HF |

La comparacion se limita a variantes del mismo merge, ya que no se han aportado datos de modelos externos equivalentes medidos con la misma metodologia.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no puede asumirse permiso para uso comercial, redistribucion ni modificacion. Conviene contactar con el autor antes de integrarlo en produccion.
- Modelo desvinculado de rechazos: el sufijo "uncensored/heretic" implica que el modelo puede generar contenido que otros sistemas filtrarian. No es apto para productos orientados a publico general sin una capa de moderacion propia.
- Sin benchmarks de tarea para esta cuantizacion: las unicas cifras publicadas miden fidelidad de cuantizacion, no calidad en tareas reales.
- Divergencia de la cuantizacion: aunque la perplejidad apenas cambia (+0,055 %), la KLD inversa es alta (10,88), lo que indica que la distribucion cuantizada concentra probabilidad en pocos tokens. El impacto practico no esta cuantificado.
- Formato propietario del ecosistema: los pesos MLX safetensors no se cargan en vLLM, llama.cpp ni Ollama sin conversion, lo que limita el despliegue fuera de Apple Silicon.
- Idiomas, contexto y capacidades de tool calling no documentados: cualquier decision de arquitectura basada en ellos seria especulativa.
- Riesgo de alucinacion no evaluado: no hay estudios de factualidad ni de tasas de error para esta variante.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento del analisis, sin issues ni reportes de terceros.
- Fecha de creacion atipica (2026-09-27) y autor de la cuantizacion sin historial verificable en el repositorio: se recomienda auditar los pesos antes de usarlos en entornos criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ6e_g128-fp16-text
- Variante oQ5e del mismo merge: https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e
- Repositorio de oQ/oMLX: https://github.com/jundot/omlx
- Articulo en HackerNoon sobre el modelo base: https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier
- Analisis en video del merge Fable-Fusion-711: https://www.youtube.com/watch?v=9EM5I7dJN4Q
- Ficha de la variante GGUF en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-neo-max-mtp-gguf-davidau
