# mrminjae/qwen3p6-35b-a3b-2p10bit-r153-lowbit

## Resumen

Qwen3.6-35B-A3B (2.10 bits, r153) es un checkpoint de investigacion publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantizacion extrema de los expertos enrutados de un modelo MoE: los expertos promedian 2,10 bits y se almacenan empaquetados mediante un kernel personalizado de bajo bit para MoE, mientras que el resto de pesos permanece en BF16. El repositorio ocupa 3,3 GB, lo que refleja la fuerte reduccion de huella respecto a un checkpoint BF16 equivalente.

El modelo conserva la arquitectura y las capacidades del base (tag `qwen3_5_moe`, pipeline `image-text-to-text`, `text-generation`, `conversational`), pero no se ha publicado informacion sobre el proceso de cuantizacion, calibracion, perdida de calidad ni resultados de evaluacion. La model card lo describe explicitamente como un checkpoint de investigacion interno, no como un artefacto listo para produccion.

Su relevancia actual es acotada y experimental: sirve para estudiar tecnicas de cuantizacion muy agresiva en modelos MoE y el comportamiento de kernels de bajo bit, pero no hay evidencia publica de que mantenga el rendimiento del modelo original. No se dispone de datos sobre licencia, idiomas soportados ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), transformer con expertos enrutados |
| Parametros totales | 35B (segun el nombre del modelo base) |
| Parametros activos | A3B (aproximadamente 3B activos, segun el nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits empaquetados (kernel MoE de bajo bit); resto de pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | no disponible (repositorio de 3,3 GB, libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo mezcla de expertos (MoE) con 35B parametros totales y aproximadamente 3B activos por token, segun la nomenclatura A3B. El checkpoint r153 no modifica la topologia: aplica una cuantizacion de 2,10 bits de media exclusivamente a los expertos enrutados, que se almacenan en formato empaquetado y requieren un kernel personalizado de bajo bit para su ejecucion. El resto de los pesos (atencion, embeddings, capas densas, router) se mantiene en BF16.

No se ha publicado informacion sobre el dataset de calibracion, el algoritmo de cuantizacion (por ejemplo, GPTQ, AWQ o una variante propia), el numero de tokens de entrenamiento del modelo base ni si este recibio RLHF o DPO. Tampoco hay datos sobre innovaciones adicionales como decodificacion especulativa o atencion lineal. El identificador interno r153 sugiere una iteracion de un pipeline de investigacion, pero su significado no esta documentado.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto (`image-text-to-text`), segun los tags del repositorio; no se detalla la arquitectura de vision ni su resolucion de entrada.
- Razonamiento y generacion de codigo: previsiblemente presentes en el modelo base, pero sin verificacion publicada tras la cuantizacion a 2,10 bits.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se enumeran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en cuantizacion de MoE: el checkpoint permite medir la degradacion de calidad al comprimir expertos a 2,10 bits frente al modelo base en BF16, con un repositorio de solo 3,3 GB facil de distribuir entre maquinas de laboratorio.
- Desarrollo y validacion de kernels de bajo bit: sirve como banco de pruebas para kernels personalizados de MoE empaquetado, verificando correccion numerica y throughput en distintas GPU.
- Experimentos de ajuste fino con recursos limitados: al reducir la huella de los expertos, permite explorar LoRA o adaptadores sobre un MoE de 35B en hardware mas modesto, asumiendo la perdida de calidad no medida.
- Prototipado de asistentes multimodales en entornos aislados: el tag `image-text-to-text` habilita pruebas de concepto de descripcion de imagenes y dialogo, siempre que se valide la calidad caso por caso.
- Evaluacion comparativa de tecnicas de compresion: util como punto de referencia extremo (2,10 bits) frente a cuantizaciones de 4 y 8 bits del mismo modelo base en estudios academicos.
- Docencia y divulgacion: ejemplo practico de como se empaquetan pesos de expertos y que implicaciones tiene en memoria, latencia y fidelidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para este checkpoint, ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 3,3 GB, pero la inferencia requiere ademas los pesos BF16 no cuantizados (atencion, embeddings, router) y el estado de activaciones; el total exacto no esta documentado.
- GPU recomendadas: no disponible; al tratarse de un kernel personalizado de bajo bit, la compatibilidad depende de la implementacion concreta, no publicada.
- Compatibilidad con GPU de consumo: no confirmada; la viabilidad en RTX 4090 u otras tarjetas de consumo no puede afirmarse sin datos del autor.
- Opciones de despliegue: la libreria declarada es `transformers`; no se confirma soporte en vLLM, llama.cpp, Ollama ni TGI, y el kernel MoE personalizado probablemente impide su uso directo en estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r153-lowbit | 35B totales, ~3B activos | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible | Hugging Face, checkpoint de investigacion |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, ~3B activos | no disponible | BF16 | no disponible | Hugging Face |
| Otras cuantizaciones del mismo base (4/8 bits) | 35B totales, ~3B activos | no disponible | 4 u 8 bits | segun autor | no verificadas en la informacion disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Cuantizacion extrema: 2,10 bits en los expertos enrutados es un regimen agresivo sin evaluacion publicada de perdida de calidad; es probable una degradacion notable en razonamiento, codigo y matematicas.
- Kernel personalizado: la inferencia depende de un kernel MoE de bajo bit no documentado, lo que limita la portabilidad y el soporte en herramientas estandar.
- Estado de investigacion: la model card lo califica como checkpoint interno de investigacion, sin garantias de estabilidad ni mantenimiento.
- Licencia ambigua: se indica que sigue la del modelo base, pero no se especifica cual es; debe verificarse antes de cualquier uso comercial.
- Idiomas y contexto no documentados: no se puede garantizar el comportamiento multilingue ni la ventana de contexto efectiva tras la cuantizacion.
- Riesgo de alucinacion: no evaluado en este checkpoint; la compresion de expertos puede amplificarlo.
- Sesgos: no documentados; se heredan, en su caso, los del modelo base, sin analisis especifico.
- Sin benchmarks ni evaluaciones de seguridad: no apto para produccion sin una validacion exhaustiva propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r153-lowbit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
