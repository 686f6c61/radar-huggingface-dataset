# nightmedia/gemma-4-E4B-Chronos-Finance

## Resumen

gemma-4-E4B-Chronos-Finance es un modelo de lenguaje multimodal (pipeline any-to-any) obtenido mediante la fusión de dos modelos derivados de la familia Gemma 4: nightmedia/gemma-4-E4B-Chronos, a su vez un merge de varias variantes afinadas de Gemma-4-E4B-it (Fable-Distill, Deckard-Expresso-Universe, Polar-Rev1, F451 y Twain), y naazimsnh02/FinanceGemma-E4B, un ajuste orientado a dominio financiero. Lo desarrolla Nightmedia, un laboratorio independiente con sede en Montana (EE. UU.) que trabaja principalmente sobre hardware Apple Silicon, como indica el uso de MLX como librería de referencia.

El modelo tiene 7.996.156.490 parámetros en formato bf16 (unos 8.000 millones), un tamaño de repositorio de 16 GB y se distribuye bajo licencia Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial. Su interés práctico radica en combinar el comportamiento de razonamiento (thinking mode) heredado de las variantes Chronos con el sesgo de dominio financiero de FinanceGemma, manteniendo un perfil de cuantización muy trabajado (mxfp8, q8-hi, qx86-hi, q6-hi, qx64-hi, q4-hi, mxfp4) con métricas de perplejidad, memoria pico y throughput publicadas por el autor.

La información disponible sobre contexto, idiomas y datos de entrenamiento es escasa: la model card se centra en la receta de fusión y en los resultados de cuantización, no en la ficha técnica del modelo base. Esta ficha refleja únicamente lo que el autor publica y marca como no disponible todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (E4B); detalles internos no disponibles |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, mxfp8, q8-hi, qx86-hi, q6-hi, qx64-hi, q4-hi, mxfp4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a los términos de Gemma 4 de Google) |
| Formato de pesos | safetensors (repo de 16 GB), librería mlx |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Gemma-4-E4B-it más allá de su pertenencia a la familia Gemma 4. El modelo no se ha entrenado desde cero: es un merge de dos modelos mediante mergekit (el tag Deckard(qx) sugiere el uso de técnicas de fusión por capas o expertos de la familia Deckard). Los componentes declarados son nightmedia/gemma-4-E4B-Chronos (que a su vez fusiona armand0e/Gemma-4-E4B-it-Fable-Distill con DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking, y añade DavidAU/E4B-Gemma4-Polar-Rev1, DavidAU/E4B-Gemma4-F451 y DavidAU/E4B-Gemma4-Twain-1-2) y naazimsnh02/FinanceGemma-E4B.

El autor indica que la plantilla Jinja es la última de Gemma e incluye el modo thinking activado. Señala explícitamente que operar el modelo en modo instruct puro produce resultados subóptimos, porque el modelo está diseñado para razonar antes de responder. No se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en ninguna de las etapas; toda esa información corresponde a los modelos base y no se reproduce en esta ficha.

## Capacidades

- Generación de texto y razonamiento en modo thinking: la plantilla Jinja activa el bloque de razonamiento previo a la respuesta, y el autor advierte de que el modo instruct puro degrada la calidad.
- Pipeline any-to-any: la etiqueta del repositorio indica entradas y salidas multimodales, aunque la model card no detalla qué modalidades concretas cubre más allá del texto.
- Especialización parcial en dominio financiero por herencia de FinanceGemma-E4B.
- Estilo de respuesta creativo y menos restrictivo por herencia de las variantes Deckard, Fable y Expresso-Universe (algunas de ellas etiquetadas como "uncensored").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el thinking mode es compatible con flujos multi-paso.
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Análisis de documentos financieros: el modelo puede resumir informes trimestrales, memorias anuales o notas de analistas y extraer magnitudes clave, aprovechando el ajuste de dominio de FinanceGemma-E4B.
- Asistencia en investigación de inversiones: generación de borradores de tesis de inversión y comparativas sectoriales con razonamiento explícito paso a paso, útil para revisar la cadena de argumentación antes de publicar.
- Extracción estructurada de datos de estados financieros: conversión de tablas y texto libre en JSON o CSV con campos definidos, apoyándose en el modo thinking para resolver ambigüedades de nomenclatura contable.
- Prototipado local en Apple Silicon: con 8B parámetros y cuantizaciones de 11 a 16 GB de memoria pico, cabe en un MacBook Pro de 32 GB o superior y permite iterar sin depender de la nube, que es precisamente el entorno para el que está empaquetado (MLX).
- Generación de contenido editorial con tono flexible: las variantes de origen (Fable, Expresso-Universe) aportan un estilo menos encorsetado, adecuado para borradores de artículos, guiones o copy que luego se revisan.
- Evaluación comparativa de cuantizaciones: el autor publica perplejidad, memoria pico y tokens/s para siete formatos, lo que permite elegir el punto de equilibrio entre calidad y huella de memoria en un despliegue concreto.
- Experimentación académica sobre fusiones de modelos: sirve como caso de estudio reproducible de mergekit con métricas publicadas por componente y por cuantización.

## Benchmarks y rendimiento

El autor publica resultados en formato "brainwaves" (arc, arc/e, boolq, hswag, obkqa, piqa, wino) para el modelo final y para sus componentes, además de perplejidad, memoria pico y throughput por cuantización. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

Modelo final por cuantización:

| Cuantización | arc | arc/e | boolq | hswag | obkqa | piqa | wino | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|---|---|---|---|---|---|---|
| bf16 | 0,575 | 0,793 | 0,816 | 0,705 | 0,450 | 0,779 | 0,676 | 7,205 ± 0,065 | 21,91 GB | 1248 |
| mxfp8 | 0,577 | 0,791 | 0,810 | 0,705 | 0,454 | 0,780 | 0,669 | 7,243 ± 0,065 | 14,73 GB | 1127 |
| q8-hi | 0,573 | 0,790 | 0,818 | 0,704 | 0,450 | 0,781 | 0,673 | 7,205 ± 0,065 | 15,43 GB | 1227 |
| qx86-hi | 0,573 | 0,790 | 0,818 | 0,706 | 0,458 | 0,780 | 0,673 | 7,215 ± 0,065 | 14,91 GB | 1180 |
| q6-hi | 0,577 | 0,790 | 0,807 | 0,704 | 0,458 | 0,778 | 0,665 | 7,236 ± 0,065 | 13,56 GB | 1193 |
| qx64-hi | 0,566 | 0,785 | 0,802 | 0,703 | 0,460 | 0,776 | 0,680 | 7,272 ± 0,065 | 13,22 GB | 1177 |
| q4-hi | 0,555 | 0,758 | 0,831 | 0,694 | 0,438 | 0,782 | 0,676 | no disponible | no disponible | no disponible |
| mxfp4 | 0,537 | 0,750 | 0,844 | 0,680 | 0,392 | 0,769 | 0,645 | 8,261 ± 0,076 | 11,00 GB | 1282 |

Comparación con el modelo base Gemma-4-E4B-it (bf16 y mxfp8):

| Modelo | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Chronos-Finance bf16 | 0,575 | 0,793 | 0,816 | 0,705 | 0,450 | 0,779 | 0,676 |
| Chronos-Finance mxfp8 | 0,577 | 0,791 | 0,810 | 0,705 | 0,454 | 0,780 | 0,669 |
| Gemma-4-E4B-it bf16 | 0,490 | 0,674 | 0,793 | 0,612 | 0,416 | 0,756 | 0,669 |
| Gemma-4-E4B-it mxfp8 | 0,480 | 0,656 | 0,797 | 0,608 | 0,400 | 0,755 | 0,665 |

El merge mejora de forma consistente al modelo base en arc (+0,085), arc/e (+0,119) y hswag (+0,093), con ganancias menores en boolq y obkqa. El componente intermedio sin FinanceGemma obtiene perplejidades ligeramente inferiores (6,945 en q8-hi frente a 7,205 del modelo final), lo que sugiere que la incorporación de FinanceGemma cuesta algo de perplejidad general a cambio de especialización de dominio.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 21,91 GB en bf16, 15,43 GB en q8-hi, 14,73 GB en mxfp8, 13,56 GB en q6-hi, 13,22 GB en qx64-hi, 11,00 GB en mxfp4 (memoria pico medida por el autor).
- GPU recomendadas: no se especifican en la información proporcionada; los datos publicados corresponden a ejecución con MLX, es decir, sobre Apple Silicon con memoria unificada.
- ¿Cabe en GPU de consumo? Con 11-15 GB en cuantizaciones de 4 a 8 bits, encaja en tarjetas de 16 GB o más (RTX 4080, RTX 4090, RTX 5080/5090) siempre que se use un runtime compatible con safetensors; el autor no publica pruebas en CUDA.
- Despliegue: MLX es la librería declarada. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible; la ausencia de pesos GGUF en el repositorio limita el uso directo con llama.cpp u Ollama.
- Throughput medido por el autor: 1248 tokens/s en bf16, 1282 en mxfp4, 1227 en q8-hi, 1193 en q6-hi, 1180 en qx86-hi, 1177 en qx64-hi y 1127 en mxfp8. Son cifras de generación agregada en el entorno del autor (MacBook Pro de 128 GB) y no son directamente trasladables a otras plataformas.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nightmedia/gemma-4-E4B-Chronos-Finance | ~8B | no disponible | apache-2.0 (enlace a términos Gemma 4) | safetensors (MLX) | Merge con sesgo financiero y thinking mode |
| nightmedia/gemma-4-E4B-Chronos | ~8B | no disponible | apache-2.0 | safetensors (MLX) | Componente principal; perplejidad q8-hi de 6,945 |
| naazimsnh02/FinanceGemma-E4B | no disponible | no disponible | no disponible | no disponible | Componente de dominio financiero; solo publica arc, arc/e y boolq en q8-hi (0,442 / 0,656 / 0,696) |
| Gemma-4-E4B-it (base) | ~8B (no confirmado) | no disponible | términos Gemma 4 | safetensors | Referencia del autor; peor en arc y hswag que el merge |

No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para ninguno de los modelos de la comparativa en la información proporcionada, por lo que la comparación se limita a parámetros, licencia, formato y los resultados "brainwaves" ya presentados.

## Limitaciones y advertencias

- El modo thinking está activado en la plantilla Jinja; usarlo en modo instruct puro produce, según el autor, resultados subóptimos. Cualquier integración debe respetar el formato de plantilla.
- Es un merge de modelos, varios de ellos derivados de variantes etiquetadas como "uncensored" o "heretic". Es previsible una menor alineación de seguridad que en Gemma-4-E4B-it original, aunque no se publican evaluaciones de seguridad.
- Riesgo de alucinación en dominio financiero: el ajuste de FinanceGemma no viene acompañado de métricas de exactitud factual ni de verificación contra fuentes; no debe usarse como asesoramiento financiero sin revisión humana.
- La incorporación de FinanceGemma eleva la perplejidad general (7,205 en q8-hi frente a 6,945 del componente Chronos sin financiero), lo que sugiere una posible pérdida de calidad en tareas generales.
- Idiomas soportados no documentados; no hay garantía de calidad fuera del inglés.
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin verificarla empíricamente.
- Licencia: el campo indica apache-2.0, pero license_link remite a los términos de Gemma 4 de Google. Es imprescindible revisar esos términos antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- Los formatos publicados son safetensors para MLX; no hay GGUF ni cuantizaciones para llama.cpp, lo que limita el despliegue fuera de Apple Silicon.
- El modelo tiene 200 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados publicados.
- El repositorio incluye una sección de donaciones con direcciones de criptomonedas; no afecta al uso técnico, pero conviene tenerlo en cuenta al evaluar la procedencia del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/gemma-4-E4B-Chronos-Finance
- Modelo base principal: https://huggingface.co/nightmedia/gemma-4-E4B-Chronos
- Modelo base financiero: https://huggingface.co/naazimsnh02/FinanceGemma-E4B
- Componente Fable-Distill: https://huggingface.co/armand0e/Gemma-4-E4B-it-Fable-Distill
- Componente Deckard-Expresso-Universe: https://huggingface.co/DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking
- Componente Polar-Rev1: https://huggingface.co/DavidAU/E4B-Gemma4-Polar-Rev1
- Componente F451: https://huggingface.co/DavidAU/E4B-Gemma4-F451
- Componente Twain-1-2: https://huggingface.co/DavidAU/E4B-Gemma4-Twain-1-2
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
