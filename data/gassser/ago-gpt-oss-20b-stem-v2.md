# gassser/ago-gpt-oss-20b-stem-v2

## Resumen

`gassser/ago-gpt-oss-20b-stem-v2` es un adaptador LoRA publicado en Hugging Face por el usuario `gassser`, construido sobre el modelo base `unsloth/gpt-oss-20b-unsloth-bnb-4bit`. Se trata, por tanto, de un fine-tuning ligero (PEFT) de la variante cuantizada a 4 bits del modelo GPT-OSS de 20.000 millones de parametros, distribuida por Unsloth para facilitar el entrenamiento en hardware de consumo. El adaptador se ha entrenado presumiblemente para reforzar competencias en el ambito STEM (ciencia, tecnologia, ingenieria y matematicas), aunque la model card no documenta el dataset ni el procedimiento concreto.

El repositorio tiene un tamano de 0,1 GB, coherente con un adaptador LoRA y no con pesos completos, y se distribuye en formato `safetensors` bajo la libreria `peft`. El pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`, lo que sugiere un uso orientado a dialogos y generacion de texto. No se han publicado descargas ni interacciones, y la model card es la plantilla por defecto de Hugging Face sin completar, por lo que la mayor parte de los metadatos tecnicos (licencia, idiomas, datos de entrenamiento, evaluacion) figuran como no disponibles.

La relevancia de esta ficha radica en documentar con rigor lo que si se puede afirmar a partir de los metadatos y del modelo base, y en marcar explicitamente los vacios de informacion para que cualquier evaluador sepa que extremos requieren verificacion empirica antes de usar el adaptador en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer GPT-OSS (modelo base: `unsloth/gpt-oss-20b-unsloth-bnb-4bit`) |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base se denomina "20b"; el adaptador LoRA anade un numero no especificado de parametros entrenables) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base GPT-OSS-20B) |
| Tipos de cuantizacion | Modelo base distribuido en 4 bits (bnb-4bit); el adaptador se publica en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2, transformers, unsloth |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base `unsloth/gpt-oss-20b-unsloth-bnb-4bit`. Esto implica que la arquitectura subyacente es la del transformer GPT-OSS de 20.000 millones de parametros en su version cuantizada a 4 bits preparada por Unsloth, y que el entrenamiento realizado por `gassser` consistio en ajustar un conjunto reducido de matrices de bajo rango sobre dicho modelo congelado. El repositorio no incluye los pesos completos, sino unicamente los del adaptador, que deben combinarse con el modelo base en tiempo de carga.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens vistos, la existencia de RLHF, DPO o cualquier otra etapa de alineamiento posterior, ni sobre hiperparametros como rango del LoRA, alpha, tasa de aprendizaje o numero de epochs. La model card conserva la plantilla por defecto de Hugging Face con la mayoria de secciones marcadas como "[More Information Needed]", de modo que no es posible confirmar la naturaleza exacta del ajuste STEM ni las tecnicas de entrenamiento empleadas. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos u otras).

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y el pipeline `text-generation` declarados.
- Especializacion presumible en dominios STEM (ciencia, tecnologia, ingenieria y matematicas) por el nombre del adaptador (`stem-v2`), aunque no se documenta el alcance ni la metodologia.
- Herencia de las capacidades del modelo base GPT-OSS-20B, que no se detallan en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia en resolucion de problemas matematicos y fisicos: el adaptador, orientado a STEM, puede emplearse como asistente conversacional para explicar derivaciones paso a paso, siempre que se valide empiricamente su calidad frente al modelo base sin adaptador.
- Generacion de codigo cientifico y scripts de analisis de datos: integrable en un pipeline de `transformers` con PEFT para autocompletar o explicar fragmentos de codigo en Python, R o MATLAB en entornos de investigacion.
- Tutoria academica en asignaturas tecnicas: uso en un chatbot educativo que responda dudas de estudiantes de ingenieria, con la salvedad de que la ausencia de evaluacion publicada obliga a auditar las respuestas.
- Prototipado rapido de asistentes especializados: al ser un adaptador de 0,1 GB, permite experimentar con un dominio concreto sin reentrenar el modelo completo, cargandolo sobre el base en 4 bits en una unica GPU.
- Investigacion sobre fine-tuning eficiente: sirve como caso de estudio para comparar el efecto de un LoRA de dominio sobre GPT-OSS-20B en tareas STEM, midiendo la degradacion o mejora respecto al base.
- Generacion de documentacion tecnica y resumenes de articulos cientificos: el modelo puede redactar sintesis de papers o notas de laboratorio, condicionado a una validacion manual por el riesgo de alucinacion.
- Despliegue en entornos con VRAM limitada: al combinar el adaptador con el base cuantizado a 4 bits, es viable en GPUs de consumo, lo que facilita pruebas locales de asistentes tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; al tratarse de un adaptador sobre un modelo base de 20.000 millones de parametros en 4 bits, se requiere cargar dicho base, lo que tipicamente exige del orden de 12-16 GB de VRAM solo para los pesos, mas el overhead de activaciones y cache KV.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del base en 4 bits, GPUs con 24 GB o mas (RTX 3090, RTX 4090, A10G, L4, A100) son candidatas razonables, pero no hay confirmacion del autor.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 (24 GB) con el base en 4 bits, aunque no esta verificado ni documentado.
- Opciones de despliegue: `transformers` con `peft` (segun la libreria declarada) y `unsloth` para carga eficiente; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| `gassser/ago-gpt-oss-20b-stem-v2` | Adaptador LoRA sobre base de 20b | No disponible | No disponible | safetensors (PEFT) | Especializado en STEM segun nombre; sin evaluacion publicada |
| `unsloth/gpt-oss-20b-unsloth-bnb-4bit` (modelo base) | 20b (cuantizado 4 bits) | No disponible | No disponible | safetensors (bnb-4bit) | Base sin ajuste de dominio; referencia para medir el efecto del LoRA |
| GPT-OSS-20B (version original) | 20b | No disponible | No disponible | No disponible | Modelo de referencia del que deriva toda la cadena |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y formato.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni procesos de alineamiento, lo que impide evaluar riesgos de sesgo de forma fundamentada.
- Riesgo de alucinacion inherente a los modelos generativos; en dominios STEM el fallo puede ser especialmente danino si se presentan calculos o referencias incorrectas con apariencia de rigor.
- No se especifican los idiomas soportados ni la calidad en castellano; el uso en espanol requiere validacion empirica.
- Licencia no disponible: no puede confirmarse la legalidad del uso comercial del adaptador ni del modelo base; es imprescindible verificar la licencia de `unsloth/gpt-oss-20b-unsloth-bnb-4bit` antes de cualquier despliegue productivo.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia (3 de noviembre de 2026), lo que sugiere un artefacto sin validacion comunitaria.
- Al ser un adaptador, requiere cargar el modelo base en 4 bits; la combinacion puede introducir degradacion adicional respecto al base en precision completa.
- No hay informacion sobre el dataset de entrenamiento, por lo que no puede descartarse sobreajuste al dominio STEM ni contaminacion de datos.
- No se documenta compatibilidad con motores de inferencia de alto rendimiento (vLLM, TGI), lo que limita su uso en produccion a gran escala.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gassser/ago-gpt-oss-20b-stem-v2
- Modelo base: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
