# leobianco/npov_PERL_organic_gemma-4-E4B-it_S130104_epo1_lr3_0e-05_beta0_078_r8_2610092306

## Resumen

Este repositorio contiene un adaptador LoRA de PEFT entrenado sobre el modelo base `google/gemma-4-E4B-it`, la variante instructiva de Google DeepMind dentro de la familia Gemma 4. No se trata de un modelo completo, sino de un delta de pesos (aproximadamente 0,0 GB de repositorio) que debe cargarse junto al modelo base para reproducir el comportamiento ajustado. El autor del artefacto es el usuario de HuggingFace `leobianco`, y la model card publicada es una plantilla sin rellenar: todos los campos relevantes (datos de entrenamiento, idiomas, licencia, uso previsto, evaluación) figuran como "[More Information Needed]".

El interés técnico del checkpoint reside en el procedimiento de ajuste: el identificador indica un entrenamiento con RLOO (REINFORCE Leave-One-Out), una variante de optimización por política con estimador de línea base, con rango LoRA r=8, coeficiente beta=0,078 y una tasa de aprendizaje de 3·10⁻⁵ durante 1 época, sobre un conjunto etiquetado como "S130104". Está construido con el stack `transformers` + `trl` (PEFT 0.20.0), lo que lo sitúa en el terreno del ajuste por refuerzo ligero sobre un modelo ya alineado por instrucciones.

Su relevancia es fundamentalmente de investigación: es un ejemplo reproducible de RLHF/RLOO aplicado a un modelo de la familia Gemma 4 mediante adaptadores de bajo rango, útil para estudiar cómo cambia el comportamiento de un modelo instructivo tras optimización con recompensa. Al carecer de resultados de evaluación publicados, no debe considerarse listo para producción sin una validación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `google/gemma-4-E4B-it`. Arquitectura del modelo base no disponible en la información proporcionada (familia Gemma 4, transformer decoder; detalles no confirmados) |
| Parametros totales | No disponible para el adaptador. Rango LoRA r=8; el repositorio ocupa 0,0 GB (redondeo del reporte de HuggingFace). Parámetros del modelo base no disponibles |
| Parametros activos | No aplica al adaptador (no es MoE). Para el modelo base no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara; el uso comercial queda condicionado por la licencia del modelo base, que no se especifica) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria de carga | peft (PEFT 0.20.0), transformers, trl |
| Pipeline | text-generation |
| Modelo base | google/gemma-4-E4B-it |
| Metodo de entrenamiento | RLOO (REINFORCE Leave-One-Out) con LoRA r=8, beta=0,078, lr=3·10⁻⁵, 1 época |
| Fecha de creacion | 2026-10-09 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango sobre un transformer decoder instructivo de la familia Gemma 4. La información proporcionada no documenta la arquitectura interna del modelo base: no se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la ventana de contexto. El sufijo "E4B" del identificador sigue la convención de nomenclatura introducida en la familia Gemma 3n de Google, donde la "E" designa parámetros efectivos; según guías de terceros, la familia Gemma 4 incluiría variantes E2B, E4B, 26B y 31B, pero estos datos no están confirmados por el autor del adaptador y deben tratarse como referencia externa, no como especificación verificada.

El procedimiento de ajuste sí está parcialmente descrito por el nombre del checkpoint y las etiquetas del repositorio: se empleó RLOO, un algoritmo de optimización por política que estima la línea base restando la recompensa media de las demás muestras del grupo (leave-one-out), reduciendo la varianza frente a REINFORCE clásico. Los hiperparámetros conocidos son rango LoRA r=8, beta=0,078 (típicamente el coeficiente de penalización KL frente al modelo de referencia), tasa de aprendizaje 3·10⁻⁵ y una única época. No se documentan el corpus de entrenamiento, el número de tokens, la composición del dataset, la función de recompensa ni el proceso de anotación. El identificador "npov_PERL_organic" sugiere, sin confirmación alguna, un conjunto orientado a comportamiento de punto de vista neutral y variantes de instrucción, pero el autor no lo especifica.

## Capacidades

- Generación de texto conversacional: la etiqueta de pipeline es `text-generation` y el modelo base es una variante instructiva, por lo que hereda la capacidad de mantener diálogo multi-turno.
- Ajuste por refuerzo: el adaptador está optimizado con RLOO, lo que en principio modifica la distribución de respuestas hacia el criterio de recompensa usado, cuyo contenido no se ha publicado.
- Tool calling / function calling: no disponible. No se documenta si el adaptador preserva las capacidades de llamada a herramientas del modelo base.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible. No se confirma ninguna.
- Razonamiento, matemáticas y generación de código: no disponible; no hay evaluación ni declaración al respecto.

Nota: la ausencia de documentación significa que ninguna de estas capacidades puede darse por garantizada sin una evaluación directa del adaptador cargado sobre el modelo base.

## Casos de uso

- Investigación en optimización por refuerzo: el adaptador sirve como punto de partida reproducible para estudiar el efecto de RLOO con rango LoRA bajo (r=8) y beta=0,078 sobre un modelo instructivo, comparando las salidas contra el modelo base sin adaptador.
- Replicación de experimentos de ablación: el autor publica otros checkpoints hermanos con distintos hiperparámetros (por ejemplo, `epo0_5_lr1_1e-05_beta0_078_r8`), lo que permite usar este modelo en barridos controlados de épocas y tasas de aprendizaje.
- Generación de datos sintéticos etiquetados: un adaptador de este tipo puede emplearse para producir lotes de texto con un sesgo controlado por la función de recompensa, útiles como material de entrenamiento o de evaluación, siempre que se valide la calidad de las muestras.
- Prototipado de alineación de estilo: si el ajuste está orientado a neutralidad de punto de vista, encajaría en tareas de reescritura de textos para reducir carga editorial, aunque esto requiere verificación empírica previa.
- Evaluación comparativa de adaptadores: el dataset de evaluación asociado publicado por el mismo autor (`eval_npov_PERL_organic_...`) permite reproducir su protocolo de generación y medir divergencias entre checkpoints.
- Docencia y formación técnica: es un ejemplo práctico y de tamaño reducido para explicar el ciclo completo de PEFT + TRL + RLOO en cursos de ajuste fino, dado que el adaptador se carga sobre un modelo público.
- Integración en pipelines experimentales de `transformers`: al ser un adaptador PEFT estándar, se puede montar en servicios de inferencia que ya sirvan el modelo base, sin duplicar el coste de almacenamiento de pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye la sección de evaluación rellena (todos los campos figuran como "[More Information Needed]") y las búsquedas web no devuelven métricas asociadas a este checkpoint concreto. No se dispone, por tanto, de valores de MMLU, HumanEval, GSM8K ni de ninguna otra métrica para este adaptador ni para su modelo base.

## Requisitos de hardware

- VRAM del adaptador: despreciable. Un LoRA con r=8 sobre un modelo de este tamaño ocupa típicamente decenas de megabytes; el repositorio se reporta como 0,0 GB.
- VRAM del modelo base: no disponible de forma verificada. Si se acepta la convención de nomenclatura "E4B" como indicativa de unos 4 000 millones de parámetros efectivos, una inferencia en bf16 requeriría del orden de 8-10 GB de VRAM y en cuantización de 4 bits en torno a 3-4 GB. Estas cifras son estimaciones derivadas del nombre del modelo, no datos confirmados por el autor.
- GPU recomendadas: no disponible. Como referencia orientativa para un modelo de ese orden de tamaño, una RTX 4090 (24 GB) o una RTX 4080 (16 GB) serían suficientes en bf16; para despliegues con concurrencia alta, A100 40/80 GB o H100.
- Cabe en GPU de consumo: probablemente sí en el rango de 16-24 GB si se confirma el tamaño efectivo de ~4B, tanto en bf16 como, con más holgura, en cuantizaciones de 4 y 8 bits.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT (`transformers` + `peft`); el modelo base se puede servir con vLLM o TGI, y las guías de terceros mencionan ejecución local mediante Ollama con versiones cuantizadas del modelo base. No hay confirmación del autor sobre ninguna de estas rutas.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (`..._epo1_lr3_0e-05_beta0_078_r8`) | Adaptador LoRA | r=8 (base no disponible) | No disponible | RLOO, lr=3·10⁻⁵, 1 época | No disponible | Público en HuggingFace, 0 descargas |
| `leobianco/npov_PERL_organic_gemma-4-E4B-it_S130104_epo0_5_lr1_1e-05_beta0_078_r8` | Adaptador LoRA hermano | r=8 (base no disponible) | No disponible | RLOO, lr=1·10⁻⁵, 0,5 épocas | No disponible | Público en HuggingFace |
| `google/gemma-4-E4B-it` | Modelo completo instructivo | No disponible | No disponible | Ajuste por instrucciones (no documentado aquí) | No disponible | Modelo base de referencia |

No se dispone de datos de rendimiento para ninguno de los tres, por lo que la comparativa se limita a configuración de entrenamiento y disponibilidad. No se han identificado alternativas de terceros comparables con métricas publicadas en la información disponible.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto de HuggingFace, sin ningún campo completado. No se puede determinar el uso previsto, el alcance ni las condiciones de uso sin contactar con el autor.
- Licencia no declarada: el repositorio no especifica licencia. El uso comercial queda sujeto a la licencia del modelo base `google/gemma-4-E4B-it`, que tampoco se detalla en la información proporcionada. Verificar antes de cualquier despliegue.
- Sin evaluación: no hay benchmarks, ni evaluación cualitativa, ni análisis de sesgos. Cualquier afirmación sobre su calidad sería especulativa.
- Riesgo de alucinación: heredado del modelo base y potencialmente alterado por la optimización con recompensa. Los ajustes con RL pueden incentivar respuestas que maximicen la recompensa sin garantizar veracidad, un fenómeno conocido como reward hacking.
- Deriva respecto al modelo base: un ajuste con RLOO y beta=0,078 puede degradar capacidades del modelo original (por ejemplo, instrucciones generales, código o matemáticas) si el corpus de recompensa es estrecho. No hay datos que cuantifiquen esa degradación.
- Idiomas y contexto desconocidos: se desconoce si el ajuste afecta al comportamiento multilingüe y cuál es la ventana de contexto efectiva tras el entrenamiento.
- Sesgos: no evaluados. Si el ajuste gira en torno a neutralidad de punto de vista, existe el riesgo de sobrerreajuste hacia una noción concreta de neutralidad, con pérdida de matices en temas controvertidos.
- Trazabilidad limitada: el identificador codifica hiperparámetros y una fecha, pero no hay información sobre el dataset ni sobre la función de recompensa, lo que impide auditar el comportamiento del modelo.
- Metadatos anómalos: la fecha de creación declarada (2026-10-09) y la ausencia total de descargas o interacciones sugieren que se trata de un artefacto experimental reciente, no de un modelo contrastado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leobianco/npov_PERL_organic_gemma-4-E4B-it_S130104_epo1_lr3_0e-05_beta0_078_r8_2610092306
- Checkpoint hermano (0,5 épocas, lr=1·10⁻⁵): https://huggingface.co/leobianco/npov_PERL_organic_gemma-4-E4B-it_S130104_epo0_5_lr1_1e-05_beta0_078_r8_2610062017
- Dataset de evaluación del mismo autor: https://huggingface.co/datasets/leobianco/eval_npov_PERL_organic_gemma-4-E4B-it_S1301_3068_gens_T0_3_wfs0_s12345_mt256_sftd09d98
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Paquete oficial de Gemma (JAX): https://pypi.org/project/gemma/
- Guía de ejecución local de Gemma 4 con Ollama (terceros): https://www.theaitechpulse.com/gemma4-ollama-guide-2026
- Directorio de modelos del autor (terceros): https://essamamdani.com/ai-models/company/leobianco
- Referencia citada en la model card sobre impacto ambiental: Lacoste et al. (2019), https://arxiv.org/abs/1910.09700
