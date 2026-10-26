# PollardWeights/NVIDIA-Nemotron-3.5-Bolt-E4B-Pollard

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-Pollard es una compilación de cuantizaciones del modelo nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por el usuario PollardWeights (no por NVIDIA). No se trata de un modelo nuevo ni de un fine-tune: es el mismo checkpoint original recomprimido a distintas profundidades de bits mediante la herramienta Pollard Weights, que asigna bits por capa según la sensibilidad medida de cada una en lugar de aplicar una reducción uniforme.

El repositorio empaqueta cinco niveles GGUF (de IQ2_XXS, 3,10 GB, hasta Q6_K, 6,22 GB) más tres checkpoints MLX para Apple Silicon (2, 3 y 4 bits). El modelo base declara arquitectura `gemma4`, unos 8.000 millones de parámetros (el conteo real de safetensors es de 7.518.069.290, es decir, 7,52 B) y entrada multimodal de texto, imagen y audio, aunque la model card solo declara inglés como idioma.

Su relevancia práctica es que reduce el peso de 15,99 GB en f16 a 3,10 GB con el nivel más agresivo (81 % menos, factor 5,2), manteniendo el 100 % de éxito en llamadas a herramientas en los niveles IQ3_S, IQ4_XS, Q90 y Q6_K. Los ficheros son GGUF estándar y funcionan en llama.cpp, ik_llama.cpp, Ollama y LM Studio sin parches. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4` (según model card); multimodal con entrada de texto, imagen y audio |
| Parametros totales | 7.518.069.290 (~7,52 B) según safetensors; la model card indica "~8.0B" |
| Parametros activos | no disponible (la model card no confirma si es MoE; el sufijo "E4B" no se explica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ2_XXS, IQ3_S, IQ4_XS, Q90-4.3GB (personalizada), Q6_K; referencia de tamaño para Q8_0 y Q4_K_M. MLX: 2bit (2,74 bits medios), 3bit (4,07), 4bit (5,43) |
| Idiomas soportados | en (inglés) |
| Licencia | other (no se incluye el texto; se hereda del modelo base nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, cuyos términos no se detallan en la información disponible) |
| Formato de pesos | GGUF (raíz del repo), MLX (carpeta `MLX/`), mmproj GGUF aparte para visión (`mmproj-NVIDIA-Nemotron-3.5-Bolt-E4B-BF16.gguf`) |

## Arquitectura y entrenamiento

La model card identifica la arquitectura del modelo base como `gemma4`, con soporte de entrada de texto, imagen y audio, y alrededor de 8.000 millones de parámetros. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias: esos datos corresponden al modelo original de NVIDIA y no se reproducen en esta ficha.

La innovación técnica aquí está en el proceso de cuantización, no en el modelo. Pollard Weights aplica una "asignación medida" de bits: la profundidad de bits se decide por capa a partir de la sensibilidad medida de cada una, en lugar de un aplastamiento uniforme, y el resultado se calibra con una imatrix. Cada nivel pasa por `pollard-verify --gate`, que comprueba que el fichero contiene el modelo completo (todas las torres, proyector y ficheros de procesador del origen), que carga correctamente y que supera pruebas de coherencia en tiempo de ejecución. Además se mide la fidelidad frente al f16 con perplejidad, KLD medio y la tasa de coincidencia top-1 (proporción de tokens en los que el nivel elige el mismo token más probable que el f16).

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`), en inglés.
- Llamada a herramientas y function calling: medido con `pollard-toolcall` sobre `llama-server --jinja`, con 60 sondas (llamada simple, elección entre ocho herramientas, casos sin llamada necesaria y argumentos anidados) expuestas mediante el campo `tools` de estilo OpenAI. Los niveles IQ3_S, IQ4_XS, Q90 y Q6_K conservan el 100 % del éxito del f16.
- Entrada multimodal de texto, imagen y audio según la model card; para visión en llama.cpp hay que descargar y pasar el fichero `mmproj-...gguf` con `--mmproj` (el proyector no está cuantizado).
- Compatible con despliegue en llama.cpp, ik_llama.cpp, Ollama y LM Studio (GGUF estándar) y en `mlx_lm.server` para Apple Silicon.
- Modo thinking, razonamiento explícito, capacidades de código o matemáticas: no disponible en la información proporcionada.

## Casos de uso

- Asistentes locales con function calling: el nivel IQ4_XS (4,01 GB) conserva el 100 % del éxito en llamadas a herramientas del f16 y cabe en máquinas con ~6 GB de RAM/VRAM, lo que permite montar un agente que consulte APIs mediante `tools` de estilo OpenAI en un portátil sin GPU dedicada grande.
- Automatización de escritorio y agentes multi-paso en hardware modesto: con IQ2_XXS (3,10 GB) el modelo entra en equipos con ~5,1 GB de RAM, a costa de bajar al 68,11 % de coincidencia top-1 con el f16; adecuado para prototipos y tareas tolerantes a error, no para producción crítica.
- Procesamiento de documentos con imagen: al aceptar entrada de imagen y audio (con el `mmproj` descargado aparte), sirve para extraer y resumir contenido de capturas, formularios escaneados o diapositivas en un pipeline local, sin enviar los datos a un servicio externo.
- Servicio de inferencia en Apple Silicon: los checkpoints `MLX/4bit` (5,82 GB) y `MLX/3bit` (4,65 GB) se levantan con `mlx_lm.server` y permiten servir el modelo en un Mac con memoria unificada, manteniendo el 100 % de éxito en herramientas en el nivel 4bit.
- Transcripción y resumen de audio en local: la entrada de audio declarada habilita pipelines de notas de reuniones o atención al cliente telefónica donde el modelo resume y estructura el contenido; requiere verificar el soporte real de audio en el runtime elegido.
- Distribución en entornos con ancho de banda limitado: un fichero de 3,10 GB frente a los 15,99 GB del f16 (81 % menos) facilita actualizar el modelo en despliegues de campo, sucursales o contenedores con cuotas de imagen reducidas.
- Base para evaluación de cuantizaciones: los datos de PPL, KLD y top-1 publicados por nivel permiten elegir el punto de la curva tamaño/fidelidad con criterio medido, en lugar de asumir que un Q4 genérico es suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni similares). Lo que sí se publica son métricas de fidelidad de la cuantización frente al f16 del propio autor:

| Fichero GGUF | PPL | Tamano | KLD medio | Top-1 agree | Tool-ready |
|---|---:|---:|---:|---:|---|
| IQ2_XXS | 7,4681 | 3,10 GB | 1,0815 | 68,11 % | -- |
| IQ3_S | 6,1232 | 3,49 GB | 0,4565 | 80,20 % | sí (100 %) |
| IQ4_XS | 6,1124 | 4,01 GB | 0,1981 | 87,62 % | sí (100 %) |
| Q90-4.3GB | 6,3954 | 4,31 GB | 0,0620 | 93,24 % | sí (100 %) |
| Q6_K | 6,6085 | 6,22 GB | 0,0131 | 97,10 % | sí (100 %) |

| Checkpoint MLX | Tamano | Bits medios | PPL | KLD medio | Top-1 agree | Tool-ready |
|---|---:|---:|---:|---:|---:|---|
| `MLX/4bit` | 5,82 GB | 5,43 | 9,1351 | 0,0897 | 91,93 % | sí (100 %) |
| `MLX/3bit` | 4,65 GB | 4,07 | 9,5068 | 0,2385 | 86,61 % | sí (100 %) |
| `MLX/2bit` | 3,51 GB | 2,74 | 11,3451 | 0,9635 | 71,23 % | sí (92 %) |

Advertencias sobre estas cifras: los valores de PPL no son monótonos con el tamaño (IQ4_XS da 6,1124 frente a 6,6085 de Q6_K), y la PPL de la rama MLX (≈9-11) pertenece a otro arnés de medida, por lo que no es comparable con la de GGUF. El propio autor indica que las cifras de retención solo son comparables dentro de su suite.

## Requisitos de hardware

- VRAM/RAM estimada según la model card (presupuesto total, incluyendo espacio para contexto): IQ2_XXS ~5,1 GB; IQ3_S ~5,5 GB; IQ4_XS ~6,0 GB; Q90-4.3GB ~6,3 GB; Q6_K ~8,2 GB.
- El f16 de referencia pesa 15,99 GB; la model card no da una cifra de RAM recomendada para ese formato.
- Cabe en GPU de consumo: los niveles IQ2_XXS a Q90 encajan en tarjetas de 8 GB; Q6_K (6,22 GB de pesos) encaja con holgura en 12 GB (RTX 3060 12 GB, RTX 4070) y en 16 GB (RTX 4060 Ti 16 GB, RTX 4080/4090). No se especifican requisitos para A100/H100, aunque por tamaño son innecesarias.
- Despliegue: llama.cpp, ik_llama.cpp, Ollama y LM Studio para los GGUF; `mlx_lm.server` para los checkpoints MLX. Para function calling hace falta `llama-server --jinja` (el harness de herramientas se ejecutó así). Para visión, añadir `--mmproj mmproj-NVIDIA-Nemotron-3.5-Bolt-E4B-BF16.gguf`.
- Latencia y throughput: no disponible (no se publican tokens/s ni cifras de latencia).

## Comparativa con modelos similares

No hay datos de benchmarks ni de modelos alternativos en la información disponible, por lo que la comparación se limita a los propios niveles del repositorio y a los formatos de referencia citados por el autor:

| Variante | Parámetros | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo, IQ2_XXS | 7,52 B | 3,10 GB | no disponible | other | GGUF en HF |
| Este repo, IQ4_XS (por defecto) | 7,52 B | 4,01 GB | no disponible | other | GGUF en HF |
| Este repo, Q6_K | 7,52 B | 6,22 GB | no disponible | other | GGUF en HF |
| Q8_0 (referencia de tamaño) | 7,52 B | ~8,48 GB | no disponible | other | citado, no incluido |
| Q4_K_M (referencia de tamaño) | 7,52 B | ~4,64 GB | no disponible | other | citado, no incluido |
| Modelo base en BF16 | 7,52 B | 15,99 GB (f16) | no disponible | other | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 |

Comparación con familias alternativas de tamaño similar (Llama, Qwen, Gemma de ~7-8 B): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés declarado (`language: en`); no hay evidencia de calidad en castellano ni en otros idiomas.
- No es un modelo de NVIDIA: es una cuantización de terceros. La calidad final está acotada por el checkpoint original y por el proceso de Pollard Weights, no validado de forma independiente.
- Los niveles agresivos degradan la fidelidad de forma medible: IQ2_XXS cae al 68,11 % de coincidencia top-1 y MLX 2bit al 71,23 %, con un KLD de 1,0815 y 0,9635 respectivamente. No son adecuados para tareas sensible a errores de token.
- El nivel IQ2_XXS no tiene marca de tool-ready: no se midió con éxito el soporte de llamadas a herramientas en ese formato.
- Licencia "other": no se incluye el texto y no se detallan los términos del modelo base. Antes de un uso comercial hay que verificar la licencia de nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 en su repositorio original.
- La model card está truncada en el bloque de ejemplo de `llama-server`, y no documenta longitud de contexto, datos de entrenamiento, sesgos ni tasas de alucinación.
- La visión y el audio requieren descargar el fichero `mmproj` por separado (no cuantizado) y un runtime que lo soporte; sin él, el modelo funciona solo como text-only.
- Métricas de PPL no comparables entre las ramas GGUF y MLX; además la PPL de GGUF no es monótona respecto al tamaño del fichero.
- Sin tracción comunitaria (0 descargas, 1 like) ni informes de terceros: trátese como artefacto a validar en el propio pipeline antes de producción.
- El repositorio ocupa 30,9 GB porque agrupa todos los formatos; conviene descargar solo el fichero necesario (por ejemplo con `--include`).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PollardWeights/NVIDIA-Nemotron-3.5-Bolt-E4B-Pollard
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Herramienta de cuantización Pollard Weights: https://github.com/WestWaters/pollard-weights
- Arnés de evaluación de tool calling `pollard-toolcall`: https://github.com/WestWaters/pollard-weights (mismo repositorio)
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la información de HuggingFace y de la model card. No se han encontrado papers, blogs ni demos adicionales.
