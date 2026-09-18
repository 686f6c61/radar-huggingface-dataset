# agu18dec/olens_and_ar

## Resumen

`agu18dec/olens_and_ar` es un repositorio de investigación publicado en HuggingFace que contiene dos adaptadores LoRA entrenados sobre el modelo base `Qwen/Qwen3.6-27B` (27 000 millones de parámetros, según la denominación del propio modelo base). No es un modelo de propósito general: es un par de herramientas de interpretabilidad, denominadas *oracle lens* (AO) y *activation reconstructor* (AR), pensadas para leer y medir el contenido de activaciones internas de un transformer.

El AO recibe una activación del flujo residual y devuelve prosa en forma de viñetas que describe qué conceptos codifica esa activación. El AR recibe una activación y reconstruye el fragmento de texto que la produjo, de modo que la fracción de varianza explicada (FVE) sirve como métrica objetiva de cuánta información es recuperable. Ambos forman un par emparejado: el AO se entrenó con una recompensa FVE calculada precisamente sobre este AR.

Su relevancia es de nicho pero concreta para quienes trabajan en interpretabilidad mecanicista: publica conjuntamente la lente verbalizadora y su instrumento de medida, y documenta de forma explícita el contrato de lectura (prompt, transformación, valor de alpha, banda de capas y token marcador). El AO se obtuvo con 600 pasos de GRPO (beta 0.02) partiendo del estudiante tipo *bullet* `s3d.omp4bp.s2/step251`. Licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer Qwen3; el AR añade una cabeza de 17 filas por capa sobre el backbone truncado |
| Parámetros totales | 27 000 millones en el modelo base (según su denominación); parámetros de los adaptadores: no disponible |
| Parámetros activos | no disponible (no se indica si el modelo base es MoE o denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los adaptadores se distribuyen en safetensors; no se documenta ninguna receta de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); el AR incluye además `heads.pt` |
| Tamaño del repositorio | 1,0 GB |
| Modelo base | Qwen/Qwen3.6-27B |
| Componentes | `olens_s3d_rl600/` (AO) y `ar_ptag_pooled/` (AR) |
| Capas del contrato de lectura | 20 a 60 en pasos de 4 (20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60) |
| Transformación de inyección | `unit`: alpha * h / ‖h‖, con alpha = 16000,0 |
| Token marcador | ㈜ (token id 158983) |
| Fecha de publicación | 2026-09-18 |

## Arquitectura y entrenamiento

El componente AO es un adaptador LoRA entrenado sobre `Qwen/Qwen3.6-27B` mediante 600 pasos de GRPO con beta 0.02, partiendo del estudiante `s3d.omp4bp.s2/step251`. La recompensa es una recompensa conjunta *bullet-FVE* calculada sobre el AR que acompaña al repositorio, de modo que AO y AR están emparejados por construcción y no son intercambiables con otros reconstructores. La lectura se realiza inyectando una activación del flujo residual, normalizada a norma unitaria y escalada por alpha = 16000,0, en una ranura marcadora concreta del prompt verbalizador. La banda de capas sobre la que se entrenó el estudiante es 20 a 60 en pasos de 4, y el muestreo es determinista dado el par (activación, semilla): la semilla se fija una vez por llamada y los lotes consumen el generador pseudoaleatorio en orden.

El componente AR es un reconstructor de activaciones que recibe `ids` y `mask` y devuelve un tensor de forma `[b, 17, d]`. Su cargador trunca el backbone hasta la capa más profunda necesaria, envuelve los bloques con compilación si el adaptador lleva claves `_orig_mod.` (sin ese paso, PEFT no empareja nada y el checkpoint puntúa al nivel del azar) y adjunta el LoRA más una cabeza de 17 filas. El repositorio no incluye los momentos del blanqueador (*pooled whitener moments*, 69 archivos y 7,1 GB en el repositorio de origen), necesarios para calcular la métrica FVE blanqueada, pero no para leer: el AO inyecta la activación sin blanquear, por lo que el uso habitual de la lente no depende de ellos.

## Capacidades

- Verbalización de activaciones: dado un vector del flujo residual, el AO genera varias viñetas de prosa con los conceptos que codifica, siempre dentro del prompt `concepts_raw`.
- Reconstrucción de texto desde activaciones: el AR devuelve el fragmento que produjo la activación y permite calcular la fracción de varianza explicada (FVE) como métrica cuantitativa.
- Medición de recuperabilidad: el AR funciona como instrumento de medida ("cuánto del contenido de la activación es recuperable"), no como texto para leer.
- Cobertura por capas: el contrato abarca 11 capas concretas (20 a 60 en pasos de 4); el estudiante nunca vio capas fuera de esa banda.
- Determinismo: el muestreo del AO es reproducible dada la activación y la semilla.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (los adaptadores no son modelos conversacionales).
- Capacidades multilingües: no disponible.
- Capacidades especiales: no se documentan modos de *thinking*, visión ni audio. La salida del AO no es un texto verificado: es una hipótesis legible sobre el contenido de una activación.

## Casos de uso

- Auditoría de representaciones internas: capturar activaciones de `Qwen/Qwen3.6-27B` con el adaptador desactivado y leerlas con el AO para obtener una descripción en lenguaje natural de lo que codifica cada capa de la banda 20-60 en un punto concreto del *prompt*.
- Evaluación de lentes y SAEs: usar el AR como patrón de medida y calcular FVE para comparar si una representación dada conserva información recuperable, dentro del mismo protocolo con el que se entrenó el AO.
- Depuración de comportamientos anómalos: ante una respuesta incorrecta o sesgada del modelo base, leer las activaciones de las capas intermedias para localizar qué concepto se activa y en qué posición del texto.
- Investigación en interpretabilidad mecanicista: estudiar cómo evoluciona un concepto a lo largo de las capas (20, 24, ..., 60) manteniendo fijo el *prompt* y el valor de alpha, ya que el contrato exige coherencia total entre capa, transformación y marcador.
- Reproducibilidad de experimentos de verbalización: el repositorio publica el prompt verbalizador completo y los parámetros exactos de inyección, lo que permite repetir una lectura concreta en otra máquina sin ambigüedad de configuración.
- Formación y docencia en interpretabilidad: ilustrar con un caso reproducible cómo se pasa de un tensor de activaciones a una descripción legible y a una métrica numérica de recuperabilidad.
- Verificación de contratos de carga en *pipelines* propios: el cargador `load_lens` comprueba que el adaptador está activo y aborta si es inerte, lo que sirve como ejemplo de validación defensiva al integrar adaptadores PEFT en código de producción de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* describe la métrica utilizada (fracción de varianza explicada, FVE, siempre medida sobre el AR emparejado) y advierte de que las cifras no son transferibles a otro reconstructor, pero no incluye valores numéricos. Tampoco se incluyen los momentos del blanqueador necesarios para reproducir la variante blanqueada de la métrica, por lo que la reproducción exacta de dichos números requiere descargar 69 archivos (7,1 GB) desde el repositorio `agu18dec/local-workspace`.

## Requisitos de hardware

- VRAM estimada para el modelo base (27 000 millones de parámetros, cálculo aritmético a partir del tamaño, no dato publicado): en bf16/fp16 unos 54 GB solo de pesos, más caché KV y activaciones; en int8 unos 27 GB; en 4 bits aproximadamente 14-16 GB.
- GPU recomendadas para bf16: A100 80 GB o H100 80 GB en una sola unidad; dos A100 de 40 GB con paralelismo tensorial como alternativa.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar el modelo base en cuantización de 4 bits, con margen limitado para contextos largos; en tarjetas de 16 GB sería necesario *offload* a CPU o cuantizaciones más agresivas.
- Los adaptadores en sí son ligeros (el repositorio completo ocupa 1,0 GB, incluido `heads.pt`), pero requieren cargar el modelo base de 27 000 millones de parámetros.
- Opciones de despliegue: no disponible para el flujo de interpretabilidad. El código de ejemplo depende de módulos propios (`jlens.hooks`, `global_workspace.ola.verbalizer`, `global_workspace.olens_suite.runner`, `global_workspace.ola.ar_loader`) que no forman parte de servidores estándar como vLLM, TGI, llama.cpp u Ollama. La *model card* indica que tras `merge_lens` la generación en modo *eager* es aproximadamente 4 veces más rápida.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Se trata de un artefacto de investigación de propósito muy específico (lectura y reconstrucción de activaciones) y no de un modelo generativo que pueda compararse por MMLU, HumanEval o GSM8K con alternativas de su mismo tamaño; tampoco se han encontrado en la búsqueda web enlaces o referencias externas relevantes.

| Aspecto | olens_and_ar | Alternativas comparables |
|---|---|---|
| Categoría | Herramienta de interpretabilidad (AO + AR) sobre Qwen3.6-27B | no disponible |
| Parámetros | 27 000 millones en el modelo base; adaptadores no cuantificados | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento | sin cifras publicadas (métrica propuesta: FVE sobre el AR emparejado) | no disponible |
| Licencia | apache-2.0 | no disponible |
| Disponibilidad | HuggingFace, 0 descargas, 0 likes | no disponible |

## Limitaciones y advertencias

- Los adaptadores no son LoRA genéricos: solo funcionan dentro del prompt exacto con el que se entrenaron (`concepts_raw` para el AO). Usarlos con otro texto de entrada no es un experimento comparable.
- El contrato de lectura viaja en bloque: prompt, transformación (`unit`), alpha (16000,0), banda de capas y token marcador. Leer un checkpoint con la transformación, el alpha o el prompt de otro produce un experimento distinto, no una versión más ruidosa del mismo.
- Las capas fuera de 20-60 en pasos de 4 están fuera de contrato: el estudiante nunca las vio.
- Las activaciones deben capturarse con `disable_adapter()`: leer las activaciones modificadas por la propia lente es un error silencioso y plausible.
- Las cifras de FVE no se transfieren a otro reconstructor; toda puntuación citada se calculó sobre este AR concreto.
- No se incluyen los momentos del blanqueador (*pooled whitener moments*), por lo que la variante blanqueada de la métrica FVE no es reproducible directamente desde este repositorio.
- Riesgo de interpretación errónea: la salida del AO es prosa generada por un modelo de lenguaje y no una verificación factual; puede producir descripciones plausibles que no correspondan al contenido real de la activación.
- Idiomas soportados no documentados; se desconoce el comportamiento de la verbalización fuera del inglés.
- Sesgos conocidos: no documentados; al depender del modelo base y de los datos de entrenamiento del estudiante, hereda los sesgos que estos puedan contener.
- Estado de validación: 0 descargas y 0 likes, sin benchmarks publicados ni revisión por parte de la comunidad.
- Dependencias de código no estándar (`jlens`, `global_workspace`) que obligan a reproducir el entorno exacto; el cargador del AR espera `lora/` y `heads.pt` como hermanos en el directorio, y falla si el adaptador lleva claves `_orig_mod.` sin envolver los bloques.
- Licencia Apache 2.0 para los adaptadores, con las condiciones del modelo base (`Qwen/Qwen3.6-27B`) aplicándose en cascada para cualquier uso derivado.
- La *model card* proporcionada está truncada en la sección del prompt verbalizador (el carácter del marcador), por lo que ese detalle no puede verificarse con la información disponible.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/agu18dec/olens_and_ar
- Repositorio de origen de los adaptadores (dataset): https://huggingface.co/datasets/agu18dec/local-workspace
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Paper, blog o demo asociados: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente páginas de inicio de sesión de un servicio de correo, sin relación con el contenido).
