# budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-kl0.01-frankhen-s300

## Resumen

El modelo `qwen3.5-4b-8k-grpo-kl0.01-frankhen-s300` es un ajuste fino por aprendizaje por refuerzo (RL) de `Qwen/Qwen3.5-4B`, publicado por la cuenta anónima `budget-internalization-iclr2027` como parte de una entrega al congreso ICLR 2027. Su objetivo concreto es el razonamiento matemático bajo un presupuesto de generación fijo de 8.192 tokens: el entrenamiento busca que el modelo interiorice ese límite y produzca cadenas de razonamiento que quepan en él sin degradar la exactitud de la respuesta final. El checkpoint publicado corresponde al paso 300 de un run identificado internamente como `frankhen`.

Técnicamente, se trata de un modelo denso de 4.539.265.536 parámetros (unos 4,54 mil millones), derivado de la familia Qwen3.5, con pesos en BF16 y un repositorio de 9,1 GB. La model card declara la etiqueta `image-text-to-text`, lo que sugiere que hereda del modelo base una torre multimodal de entrada de imagen y texto, aunque el ajuste por RL se ha realizado exclusivamente sobre datos de matemáticas (DeepScaleR). La licencia es Apache 2.0, heredada del modelo base.

Su relevancia actual es doble. Por un lado, es un ejemplo práctico de GRPO con penalización KL aplicado a un modelo pequeño de 4B para mejorar razonamiento, una receta muy extendida. Por otro, aborda explícitamente el problema del control del presupuesto de tokens en modelos con modo de razonamiento, un aspecto crítico en despliegues con latencia y coste acotados. El contrapunto es que se trata de un artefacto de investigación anónimo, sin benchmarks publicados, con cero descargas y sin garantías de mantenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5); el detalle exacto de capas, atencion y torre multimodal no esta disponible |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. Los 8.192 tokens son el presupuesto de generacion (`max_new_tokens`) usado en el entrenamiento, no la ventana de contexto |
| Tipos de cuantizacion | No disponible en la informacion; los pesos se publican en BF16 y al ser un modelo transformer estandar es compatible con cuantizacion de terceros (GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (libreria transformers, dtype BF16) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.5 y de la etiqueta `qwen3_5` en los tags. Se sabe que es un modelo denso de 4,54 B de parametros con pesos en BF16, cargable mediante `AutoModelForCausalLM` de transformers, y que hereda la etiqueta de pipeline `image-text-to-text`, lo que implica soporte de entradas de imagen junto a texto. No se han publicado detalles sobre numero de capas, tipo de atencion, ni si emplea mecanicas hibridas.

El entrenamiento si esta bien documentado. Se parte de `Qwen/Qwen3.5-4B` y se aplica GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token, anadiendo una penalizacion KL k3 respecto al modelo base con coeficiente 0,01. El presupuesto de generacion se fija en 8.192 tokens nuevos. Los datos son DeepScaleR (Agentica), un dataset de problemas de matematicas, con un maximo de 3 epocas. La configuracion de optimizacion es: Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup, batch de 32 prompts por 8 rollouts por paso, y 300 pasos totales. La recompensa es binaria, basada en la correctitud de la respuesta extraida de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonar paso a paso y emitir la respuesta dentro de `\boxed{}`.

Como innovacion destacable, el modelo forma parte de un estudio sobre internalizacion de presupuesto de tokens: en lugar de truncar la generacion en inferencia, se entrena al modelo para que su razonamiento se ajuste de forma natural a un limite fijo de 8k tokens, con una penalizacion KL que lo mantiene cerca del comportamiento del modelo base.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat heredada del modelo base.
- Razonamiento matematico paso a paso, especialidad directa del ajuste por RL.
- Emision estructurada de la respuesta final dentro de etiquetas `\boxed{}`, formato aprendido durante el entrenamiento.
- Razonamiento bajo presupuesto de tokens: el modelo esta optimizado para operar con un limite de 8.192 tokens de generacion.
- Entrada multimodal imagen-texto, segun la etiqueta de pipeline `image-text-to-text` heredada del modelo base (no confirmado explicitamente para el ajuste).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el razonamiento multi-paso matematico esta implcito en el entrenamiento.
- Capacidades multilingues: no disponible. El entrenamiento se realizo con datos de matematicas de DeepScaleR y el prompt de entrenamiento esta en ingles.
- Modo thinking explicito u otras capacidades especiales: no disponible.

## Casos de uso

- Resolucion de problemas matematicos con presupuesto acotado: el modelo esta entrenado para producir cadenas de razonamiento que caben en 8.192 tokens, por lo que encaja en sistemas donde se debe limitar el coste por consulta sin perder exactitud en la respuesta final.
- Tutoria matematica automatizada: generacion de soluciones paso a paso con la respuesta final claramente delimitada en `\boxed{}`, lo que facilita el parseo automatico y la validacion por parte de un corrector programatico.
- Evaluacion y generacion de datasets de razonamiento: al ser un checkpoint de investigacion con licencia Apache 2.0, puede usarse para generar trazas de razonamiento matematico etiquetadas para entrenar o evaluar otros modelos.
- Verificacion de respuestas en pipelines educativos: integrado como segundo modelo que resuelve un problema de forma independiente y compara su resultado extraido de `\boxed{}` con el de otro sistema.
- Investigacion sobre control de longitud en RL: sirve como punto de comparacion frente al modelo base para estudiar como el entrenamiento con presupuesto fijo altera la distribucion de longitudes de razonamiento y la tasa de acierto.
- Prototipado en hardware de consumo: con 4,54 B de parametros puede desplegarse cuantizado en una GPU de gama alta para consumo, lo que permite experimentar con tecnicas de RL sin acceso a clústeres.
- Entrada multimodal en tareas de matematicas con imagen: si se confirma la herencia de la torre de vision, podria resolver problemas planteados en imagenes (por ejemplo, fotografias de enunciados), aunque esta capacidad no esta documentada para el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, MATH, HumanEval ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados tecnicos relacionados con el modelo (los resultados obtenidos corresponden a servicios de alquiler de vehiculos y al presupuesto del Estado frances, sin ninguna relacion).

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 9,1 GB solo de pesos, mas cache KV y activaciones; en la practica entre 11 y 14 GB para un contexto moderado, y mas si se agota el presupuesto de 8.192 tokens de generacion.
- VRAM en cuantizacion de 8 bits: del orden de 5 a 6 GB.
- VRAM en cuantizacion de 4 bits: del orden de 3 a 4 GB, aunque la cuantizacion no esta publicada por el autor y requeriria convertirla.
- GPU recomendadas: una RTX 4090 (24 GB), A100 40/80 GB o H100 para BF16 sin cuantizar; una RTX 4080, 4070 Ti Super o 4060 Ti de 16 GB es suficiente en BF16 para contextos moderados.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas en BF16, y en tarjetas de 8 a 12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve`), y previsiblemente llama.cpp, Ollama o TGI tras convertir los pesos a los formatos correspondientes.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (`...frankhen-s300`) | 4,54 B | No disponible (presupuesto de generacion de 8.192 tokens) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | Ajuste GRPO sobre Qwen3.5-4B con KL 0,01, 300 pasos, checkpoint de investigacion anonima |
| Qwen/Qwen3.5-4B (modelo base) | No disponible (el ajuste tiene 4,54 B, por lo que el base es del mismo orden) | No disponible | Apache 2.0 | HuggingFace | Referencia directa: mismo punto de partida antes del RL |
| Alternativas de razonamiento matematico de ~4 B | No disponible | No disponible | No disponible | No disponible | La informacion proporcionada no incluye datos verificables de otros modelos de la misma categoria; no se presentan cifras para no inventarlas |

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real del modelo no esta verificado de forma independiente.
- El modelo es un artefacto de investigacion anonimo asociado a una entrega a ICLR 2027; el repositorio puede quedar sin mantenimiento o ser retirado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Especializacion estrecha: el ajuste se ha realizado exclusivamente sobre problemas de matematicas de DeepScaleR, por lo que es probable que haya degradacion en tareas generales o de otro dominio respecto al modelo base.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir cadenas de razonamiento plausibles con respuestas incorrectas, especialmente fuera del dominio matematico y en problemas de varios pasos.
- Idiomas soportados no disponibles: el prompt de entrenamiento esta en ingles y no hay evidencia de capacidades multilingues.
- El limite de 8.192 tokens es un presupuesto de generacion de entrenamiento, no la ventana de contexto del modelo; usarlo como si fuera el contexto maximo puede llevar a errores.
- La penalizacion KL de 0,01 mantiene el modelo cerca del base, lo que limita la magnitud de la mejora esperada frente a un ajuste mas agresivo.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgos, toxicidad o comportamiento en dominios sensibles.
- Licencia Apache 2.0 heredada del modelo base: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen/Qwen3.5-4B y de los datos DeepScaleR si redistribuye derivados.
- La cuantizacion no esta publicada por el autor; convertir los pesos a GGUF o formatos de 4 bits es responsabilidad del usuario y puede afectar a la exactitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-kl0.01-frankhen-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Repositorio de vLLM (referenciado en la model card): https://github.com/vllm-project/vllm
- Paper, blog o repositorio del proyecto: no disponible
- Demo interactiva: no disponible
- La busqueda web realizada no devolvio ningun resultado tecnico relacionado con este modelo; todos los resultados obtenidos eran irrelevantes (servicios de alquiler de vehiculos y presupuesto publico frances).
