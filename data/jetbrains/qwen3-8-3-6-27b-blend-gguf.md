# JetBrains/Qwen3.8-3.6-27B-blend-GGUF

## Resumen

Qwen3.8-3.6-27B-blend-GGUF es la distribución cuantizada en formato GGUF del modelo JetBrains/Qwen3.8-3.6-27B-blend, una fusión de pesos publicada por JetBrains a partir de dos modelos de la familia Qwen desarrollados por Alibaba Cloud. El modelo base se construye mediante interpolación lineal de los checkpoints de Qwen3.6-27B y Qwen3.8-27B al 50/50, conservando la configuración, el tokenizador, el procesador y la plantilla de chat de Qwen3.8-27B. JetBrains distribuye esta variante como derivado no oficial, sin afiliación ni respaldo de Alibaba Cloud.

El modelo resuelve el despliegue local de un modelo multimodal de 27.320.697.856 parámetros (unos 27,3 mil millones) con capacidades de imagen a texto, pensado para entornos de desarrollo asistido por IA. La relevancia de esta release está en el trabajo de eficiencia en inferencia: incorpora una cabeza MTP (multi-token prediction) nativa embebida en cada GGUF y un drafter DFlash2 opcional como sidecar, lo que permite decodificación especulativa sin necesidad de un modelo borrador separado.

La licencia es Apache 2.0 y el repositorio ocupa 82,9 GB, con cinco cuantizaciones principales (IQ3_S, Q3_K_XL, IQ4_XS, Q4_K_M y Q5_K_M) más dos proyectores de visión y dos sidecars de decodificación especulativa. El modelo acumula 15.579 descargas y 43 likes en Hugging Face desde su creación en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabeza MTP nativa; tag `qwen3_5` en llama.cpp |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa `--ctx-size 8192`) |
| Tipos de cuantizacion | IQ3_S, Q3_K_XL, IQ4_XS, Q4_K_M, Q5_K_M; proyector de visión en BF16 y Q8_0; drafter DFlash2 en BF16 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base tambien se distribuye en BF16 y MLX 4-bit |

## Arquitectura y entrenamiento

El modelo base es una interpolación lineal de parámetros entre Qwen3.6-27B y Qwen3.8-27B al 50/50, no un entrenamiento desde cero ni un fine-tuning. La configuración, el tokenizador, el procesador y la plantilla de chat se heredan de Qwen3.8-27B. Los detalles exactos de las revisiones de origen y los ajustes de la fusión quedan registrados en `merge-manifest.json`, y los de conversión en `conversion-manifest.json`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card no los detalla.

La innovación técnica principal es la eficiencia en decodificación. Cada GGUF principal incluye embebida la cabeza MTP (multi-token prediction), de modo que no hace falta un fichero drafter aparte para la decodificación especulativa nativa (`--spec-type draft-mtp --spec-draft-n-max 3`). Adicionalmente se ofrece un sidecar DFlash2 (`dflash-Qwen3.8-3.6-27B-blend-bf16.gguf`, 3,86 GB, con los 81 tensores del drafter; y su versión Q4_K_M de 1,14 GB) para usar con `--spec-type draft-dflash --spec-draft-n-max 7`. La parte de visión se sirve mediante un proyector separado (`mmproj`), en BF16 (0,93 GB) o Q8_0 (0,63 GB) con fallbacks F16, compatible con cualquiera de las cinco cuantizaciones del modelo principal.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con llama.cpp (`--jinja`).
- Entrada de imagen (pipeline image-text-to-text): requiere cargar un fichero `mmproj` con `--mmproj`.
- Modo de razonamiento (thinking) activable mediante `enable_thinking` y `preserve_thinking` en los kwargs de la plantilla de chat, con formato de razonamiento `deepseek`.
- Decodificación especulativa nativa mediante cabeza MTP embebida, sin drafter externo.
- Decodificación especulativa alternativa con drafter DFlash2 como sidecar.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue mediante `llama serve` / `llama-server`.
- Capacidad de código orientada a tareas de desarrollo: la model card referencia una evaluación interna de JetBrains de 100 tareas de programación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local dentro del IDE: el modelo se sirve con `llama-server` en la máquina del desarrollador y se consume desde el cliente del IDE; la cuantización Q4_K_M (16,81 GB) permite ejecutarlo en estaciones de trabajo con GPU de consumo alta, manteniendo el código fuera de servicios en la nube.
- Revisión de capturas y diagramas en el flujo de desarrollo: al aceptar entrada de imagen mediante `--mmproj`, puede analizar pantallazos de errores, diagramas de arquitectura o mockups y devolver explicaciones textuales en la misma conversación.
- Razonamiento multi-paso con modo thinking: útil para tareas de depuración o análisis que requieren cadena de razonamiento explícita, activando `enable_thinking` y `preserve_thinking` en la plantilla de chat.
- Servicio de inferencia local con throughput mejorado: el uso de la cabeza MTP o del drafter DFlash2 reduce el coste por token generado, adecuado para entornos con presupuesto de latencia ajustado y sin acceso a GPUs de datacenter.
- Despliegue en Apple Silicon: la conversión se validó con llama.cpp compilado con Metal en un Apple M5 Max con 128 GiB de RAM, y existe una variante MLX 4-bit del modelo base, lo que lo hace apto para flujos de trabajo en macOS.
- Evaluación comparativa de eficiencia en tokens: la model card publica una comparación de tareas completadas frente a tokens de salida en un benchmark interno de 100 tareas de código, útil para equipos que comparan configuraciones de razonamiento y decodificación especulativa.
- Prototipado de asistentes conversacionales con contexto moderado: el ejemplo de despliegue documentado usa 8.192 tokens de contexto y 2 peticiones en paralelo, un perfil razonable para chat de soporte técnico o documentación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una gráfica de tareas completadas frente a tokens de salida en un benchmark interno de código de 100 tareas de JetBrains, sin cifras numéricas en el texto proporcionado, y advierte que los ajustes de razonamiento difieren entre configuraciones.

## Requisitos de hardware

- VRAM estimada para inferencia según el fichero principal: IQ3_S 12,60 GB, Q3_K_XL 13,15 GB, IQ4_XS 14,25 GB, Q4_K_M 16,81 GB, Q5_K_M 19,54 GB. Hay que sumar el proyector de visión (0,93 GB en BF16 o 0,63 GB en Q8_0) si se usa entrada de imagen, y el drafter DFlash2 (1,14 GB en Q4_K_M o 3,86 GB en BF16) si se usa esa vía de decodificación especulativa.
- Cabe en GPU de consumo: la cuantización IQ3_S (12,60 GB) entra en GPUs de 16 GB; IQ4_XS y Q4_K_M requieren 16-24 GB; Q5_K_M encaja en 24 GB. La cabeza MTP va embebida en el fichero principal y no añade VRAM aparte.
- GPUs recomendadas: no se especifican modelos concretos en la información proporcionada. La validación de conversión se hizo con Metal en Apple M5 Max con 128 GiB de RAM; el despliegue con `--n-gpu-layers 99` asume offload completo a GPU.
- Opciones de despliegue: llama.cpp (`llama serve -hf ...` o `llama-server` con parámetros explícitos), binarios precompilados tipo llama.app, y variantes MLX 4-bit del modelo base para macOS. No se mencionan vLLM ni TGI.
- Throughput y latencia: no disponibles como cifras. La decodificación especulativa se documenta con `--spec-draft-n-max 3` para MTP y `--spec-draft-n-max 7` para DFlash2; el flujo MTP se probó en la revisión `64e9bceb2c3a856efed96feda784a50947049feb` de llama.cpp, y DFlash2 se apoya en los PRs #30548, #30663 y #30927.
- Configuración de sampling recomendada: temperature 1.0, top-p 0.95, top-k 20, min-p 0 y repeat-penalty 1, con thinking activado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-3.6-27B-blend-GGUF (este) | 27,3 B | no disponible | GGUF (5 quants) | Apache 2.0 | Fusion 50/50 de Qwen3.6-27B y Qwen3.8-27B; MTP nativa y drafter DFlash2 |
| JetBrains/Qwen3.8-3.6-27B-blend (BF16) | 27,3 B | no disponible | safetensors | Apache 2.0 | Mismo modelo sin cuantizar; referencia de calidad |
| JetBrains/Qwen3.8-3.6-27B-blend-MLX-4bit | 27,3 B | no disponible | MLX 4-bit | Apache 2.0 | Variante para Apple Silicon |
| JetBrains/Qwen3.8-3.6-27B-blend-MTP-MLX-4bit | 27,3 B | no disponible | MLX 4-bit | Apache 2.0 | Variante MLX con cabeza MTP |
| Qwen3.6-27B / Qwen3.8-27B (origen) | 27 B (aprox.) | no disponible | no disponible | no disponible | Componentes de la interpolación; sin datos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Derivado no oficial: JetBrains declara explícitamente que esta release no está afiliada, patrocinada ni respaldada por Alibaba Cloud ni por Alibaba Group. Para trazabilidad conviene citar el modelo base y la revisión fijada (`f1a19acf58aa8caf7a0a507c9083245f79944dcc`).
- Fusión por interpolación de pesos, no por entrenamiento: el comportamiento puede diferir del de cualquiera de los dos modelos de origen y no hay garantía de que las capacidades se sumen; los resultados dependen de la validación empírica.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de tasas de alucinación en la información proporcionada.
- Sesgos: no se documentan análisis de sesgo, composición del dataset ni evaluaciones de seguridad.
- Idiomas: no se especifican los idiomas soportados; no conviene asumir cobertura multilingüe sin verificación.
- Longitud de contexto: no se declara en la model card; el ejemplo de despliegue usa 8.192 tokens, por lo que no debe asumirse una ventana mayor sin probarla.
- Dependencia de versión de llama.cpp: el flujo MTP se validó en una revisión concreta y el soporte de DFlash2 depende de PRs recientes; usar binarios antiguos puede romper la decodificación especulativa.
- Configuración sensible: la model card insiste en mantener los parámetros de sampling de origen (temperature 1.0, top-p 0.95, top-k 20) con thinking activado; desviarse puede degradar la calidad.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la condición de derivado no oficial debe reflejarse en la documentación del producto y en los avisos de atribución a Qwen/Alibaba Cloud.
- La información sobre benchmarks y metodología de evaluación remite a un artículo externo de JetBrains; no se incluyen cifras verificables en el texto disponible.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-GGUF
- Modelo base en BF16: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend
- Variante MLX 4-bit: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MLX-4bit
- Variante MTP MLX 4-bit: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MTP-MLX-4bit
- Revisión fijada del modelo base: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend/tree/f1a19acf58aa8caf7a0a507c9083245f79944dcc
- Artículo de JetBrains "Making Local AI Smarter and Faster": https://blog.jetbrains.com/junie/2026/09/smarter-local-al/
- JetBrains (sitio corporativo): https://www.jetbrains.com/
- JetBrains en Wikipedia: https://en.wikipedia.org/wiki/JetBrains
