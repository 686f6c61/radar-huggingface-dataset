# ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-8821-repeat3-1e-compile

## Resumen

ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-8821-repeat3-1e-compile es un ajuste fino (SFT) derivado del modelo ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200, que a su vez parte de la familia Qwen3.5 de Alibaba. El autor, ConnorYU, lo publica como un experimento de especializacion en dominio medico, con un nombre que codifica hiperparametros de entrenamiento (temperatura 200, 8821 pasos o muestras, repeticion 3, learning rate 1e) y compilacion. El modelo tiene 9.409.813.744 parametros en formato safetensors y se distribuye bajo licencia Apache 2.0.

Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto. La model card es minima: no documenta la composicion del dataset medico, el numero de tokens de entrenamiento ni los resultados de evaluacion. El pipeline declarado en Hugging Face es image-text-to-text y las etiquetas incluyen qwen3_5, transformers, safetensors, text-generation-inference y unsloth, lo que indica que el entrenamiento se realizo con Unsloth y TRL.

Su relevancia es limitada y experimental: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y sin documentacion sobre el corpus medico utilizado. Es util como referencia para quien quiera reproducir el flujo de ajuste fino con Unsloth sobre la familia Qwen3.5, pero no como modelo listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (detalles no disponibles); pipeline image-text-to-text |
| Parametros totales | 9.409.813.744 (9,4 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se publican GGUF) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 18,8 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta qwen3_5 y el pipeline image-text-to-text. Por el nombre del modelo base (ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200) se deduce que el linaje incluye una fase de RL con GRPO orientada a ifeval y un modo "think" (razonamiento explicito), seguida de este ajuste fino supervisado en dominio medico. No se especifica el numero de tokens de entrenamiento, la composicion del dataset medico, ni si hubo mezcla con datos generales para evitar olvido catastrofico.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun la model card. El nombre del repositorio sugiere hiperparametros concretos (temperatura 200, repeticion 3 de los datos, learning rate 1e-5 o similar) y un paso de compilacion, pero el autor no documenta la receta. No hay informacion sobre tecnicas adicionales como decodificacion especulativa, atencion lineal o destilacion.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado image-text-to-text (entrada de imagenes y texto).
- Razonamiento en modo "think" heredado del modelo base GRPO-ifeval-v0-think, segun el nombre del checkpoint.
- Especializacion declarada en dominio medico por el ajuste fino SFT, aunque sin documentacion del alcance clinico cubierto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo think del base sugiere cierta capacidad, pero no esta verificado.
- Capacidades multilingues: la model card solo declara ingles (en).
- Capacidades especiales (vision, audio): el pipeline image-text-to-text implica entrada de imagen; no se detalla el codificador visual ni resolucion soportada.

## Casos de uso

- Prototipado de asistentes de triaje medico en ingles: el modelo puede generar respuestas conversacionales sobre sintomas descritos en texto, util para validar flujos antes de sustituir por un modelo evaluado clinicamente.
- Extraccion de informacion de informes medicos escaneados: al aceptar image-text-to-text, permite pasar una imagen de documento y pedir la transcripcion estructurada de campos como diagnosticos o dosis.
- Generacion de resumenes de historiales clinicos en ingles: adecuado para experimentar con resumenes de notas de consulta, siempre con revision humana obligatoria.
- Educacion medica y simulacion de casos: puede generar explicaciones de fisiopatologia o preguntas de repaso para estudiantes, aprovechando el ajuste en dominio sanitario.
- Investigacion sobre ajuste fino con Unsloth: sirve como referencia reproducible de un pipeline SFT sobre Qwen3.5-9B con TRL, para estudiar el efecto de hiperparametros como temperatura o repeticion de datos.
- Base para RLHF/DPO posterior en dominio clinico: al ser un checkpoint intermedio con licencia Apache 2.0, se puede reutilizar como punto de partida para experimentos de alineamiento.
- Chatbot de soporte administrativo hospitalario: respuestas sobre citas, preparacion de pruebas o documentacion, en ingles y con contexto conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 10-11 GB de pesos; a 4 bits, alrededor de 5-6 GB, aunque el autor no publica versiones GGUF ni AWQ.
- GPU recomendadas: A100 40 GB o H100 para BF16 con contexto largo; RTX 4090 (24 GB) para BF16 justo o FP8; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU de consumo con cuantizacion 4-8 bits (RTX 3060 12 GB en 4 bits con contexto corto, RTX 4070 Ti/4080 en 8 bits).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama solo si se generan pesos GGUF propios, ya que el repo no los incluye.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-8821-repeat3-1e-compile | 9,4 B | no disponible | Apache 2.0 | SFT medico experimental, sin benchmarks, 0 descargas |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200 (modelo base) | 9,4 B | no disponible | Apache 2.0 | Fase previa con GRPO e ifeval; mismo autor |
| Qwen3.5-9B (modelo fundacional de la familia) | ~9 B | no disponible en esta ficha | Apache 2.0 (familia Qwen) | Base generalista, sin especializacion medica |
| Modelos medicos open source de ~8-9 B (p. ej. variantes Meditron o BioMistral) | 7-8 B | 4k-32k segun variante | variables (Llama, Mistral) | Suelen publicar evaluaciones en MedQA/PubMedQA; este modelo no |

La comparacion cuantitativa no es posible porque este checkpoint no publica resultados de evaluacion. Frente al modelo base, la diferencia es el ajuste SFT medico, sin evidencia publica de mejora.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks medicos (MedQA, PubMedQA, MedMCQA) ni generales, por lo que no se puede afirmar que el ajuste mejore al modelo base.
- Riesgo elevado de alucinacion clinica: un SFT medico sin validacion puede producir dosis, diagnosticos o recomendaciones plausibles pero incorrectas; no apto para uso clinico sin supervision.
- Dataset de entrenamiento no documentado: se desconoce la procedencia, licencia y calidad de los datos medicos, lo que impide auditar sesgos.
- Idioma limitado al ingles segun la model card; el rendimiento en castellano no esta verificado.
- Contexto no especificado: no se puede planificar su uso en documentos largos sin medirlo.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria (MDR, FDA) recae en el desplegador; un modelo medico sin certificacion no es un producto sanitario.
- Modelo experimental con cero adopcion: sin issues, sin comunidad y con un nombre que codifica hiperparametros, lo que sugiere un artefacto de investigacion mas que un release estable.
- Posible olvido catastrofico: al ser un SFT especifico sobre un checkpoint GRPO, puede haber degradado capacidades generales o el modo think; no hay datos que lo confirmen o descarten.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-8821-repeat3-1e-compile
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
