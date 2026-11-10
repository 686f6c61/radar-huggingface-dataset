# MCES10-Software/Ricky-Coder-Qwen3-Coder-30B-A3B-Instruct

## Resumen

Ricky-Coder es un adaptador LoRA (Low-Rank Adaptation) desarrollado por MCES10-Software sobre el modelo base Qwen3-Coder-30B-A3B-Instruct de Alibaba Qwen. Se trata de un fine-tune orientado a generacion de codigo, entrenado con una mezcla curada de datasets de codigo abierto (OpenCoder, Magicoder y datos derivados de StarCoder). El repositorio contiene unicamente los pesos del adaptador, no el modelo completo, por lo que requiere cargar el modelo base para su uso.

El modelo hereda la arquitectura del Qwen3-Coder-30B-A3B-Instruct, un transformer de tipo Mixture of Experts (MoE) con 30.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token. El adaptador LoRA se aplica sobre las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) con rango 8 y alpha 16, y fue entrenado durante 1.039 pasos en Apple Silicon con MPS.

La relevancia de este modelo es limitada: se trata de un experimento de investigacion sin evaluacion sobre benchmarks de codigo, con cero descargas y cero likes en el momento de la ficha. No esta pensado para produccion y su interes principal es documental, como ejemplo de fine-tuning LoRA ligero sobre un modelo MoE de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (hereda de Qwen3-Coder-30B-A3B-Instruct); adaptador LoRA sobre q_proj, k_proj, v_proj, o_proj |
| Parametros totales | 30.000 millones (modelo base); adaptador LoRA con rango 8 y alpha 16 |
| Parametros activos | Aproximadamente 3.000 millones (modelo base MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (licencia "other" segun la model card; sujeta a la licencia del modelo base y de los datasets de entrenamiento) |
| Formato de pesos | Adaptador PEFT/LoRA (requiere cargar el modelo base en safetensors) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-Coder-30B-A3B-Instruct, un transformer de tipo Mixture of Experts con 30.000 millones de parametros totales y unos 3.000 millones activos por token. El fine-tune utiliza PEFT LoRA con rango 8, alpha 16 y modulos objetivo q_proj, k_proj, v_proj y o_proj, es decir, unicamente las proyecciones de atencion. No se modifican las capas MLP ni los expertos del MoE.

El entrenamiento se realizo con PyTorch, Transformers y PEFT sobre Apple Silicon con el backend MPS, durante 1.039 pasos. La mezcla de datos incluye OpenCoder-LLM/opc-sft-stage2, ise-uiuc/Magicoder-OSS-Instruct-75K y bigcode/self-oss-instruct-sc2-exec-filter-50k. La model card reporta una reduccion de la perdida de validacion de 1,8643 a 0,4504 tras el entrenamiento, pero advierte explicitamente que esta metrica no mide la calidad practica del codigo generado y que no se realizo ninguna evaluacion con benchmarks de codigo sobre un conjunto retenido.

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del modelo base Qwen3-Coder-30B-A3B-Instruct para completar, explicar y transformar codigo.
- Razonamiento sobre codigo: el adaptador esta entrenado con datos de instrucciones de codigo (OpenCoder, Magicoder), lo que puede reforzar el ajuste a instrucciones tecnicas.
- Soporte de tool calling y function calling: no confirmado para el adaptador; depende de las capacidades del modelo base, no evaluadas aqui.
- Soporte de agentes y razonamiento multi-paso: no evaluado en el adaptador.
- Capacidades multilingues: no disponibles; la model card indica que no se ha evaluado la cobertura amplia de idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles ni documentadas para el adaptador.

## Casos de uso

- Experimentacion academica con LoRA sobre MoE: el adaptador sirve como caso de estudio de fine-tuning ligero (rango 8, 1.039 pasos) sobre un modelo MoE de codigo, util para investigar el efecto de adaptadores de bajo rango en proyecciones de atencion.
- Prototipado de asistentes de codigo en entornos de investigacion: se puede cargar con PEFT y Transformers para probar la generacion de funciones y fragmentos en cuadernos o scripts, siempre con revision humana.
- Generacion de borradores de codigo en tareas acotadas: por ejemplo, escribir funciones utilitarias (factorial, parsing, transformaciones de datos) como punto de partida que el desarrollador revisa y corrige.
- Comparacion de adaptadores sobre el mismo base: util para medir, en un entorno controlado, si un LoRA de rango bajo altera el estilo o la verbosidad del modelo base en tareas de codigo.
- Docencia y formacion: como ejemplo practico de pipeline PEFT completo (carga del base, aplicacion del adaptador, plantilla de chat) para explicar fine-tuning eficiente en cursos de IA.
- Reproduccion de experimentos: el repositorio documenta revision del base, datasets y pasos, lo que permite reproducir el entrenamiento en hardware similar (Apple Silicon con MPS).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion (de 1,8643 a 0,4504), que la propia model card califica como insuficiente para establecer mejoras en correctitud o rendimiento frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base Qwen3-Coder-30B-A3B-Instruct y de la cuantizacion elegida (no documentada).
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se realizo en Apple Silicon con MPS, no en GPU NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada; un modelo MoE de 30.000 millones de parametros totales requiere cuantizacion agresiva para caber en GPUs de consumo, pero no hay datos publicados para este adaptador.
- Opciones de despliegue: carga mediante PEFT + Transformers (documentado en la model card). No se documentan vLLM, llama.cpp, Ollama ni TGI para el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ricky-Coder (este modelo) | 30B totales / ~3B activos (base) + LoRA rango 8 | No disponible | qwen-research | Adaptador PEFT en HF, 0 descargas | Sin benchmarks de codigo; solo perdida de validacion |
| Qwen3-Coder-30B-A3B-Instruct (base) | 30B totales / ~3B activos | No disponible en esta ficha | qwen-research | Modelo base publicado por Qwen | Referencia directa; capacidades no evaluadas aqui |
| Alternativas de codigo de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El codigo generado puede ser incorrecto, inseguro, incompleto o incompatible con el entorno del usuario; la model card exige revision humana y pruebas antes de usarlo.
- No se ha evaluado el adaptador en seguridad, sesgos ni cobertura amplia de idiomas.
- La perdida de validacion no mide la capacidad practica de programacion; no hay evidencia de mejora frente al modelo base.
- La licencia es qwen-research (categoria "other"), sujeta a la licencia del modelo base y a las licencias de los datasets de entrenamiento; es necesario confirmar los derechos de redistribucion antes de publicar o usar comercialmente.
- El adaptador solo modifica las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj); no se ajustan las capas MLP ni los expertos del MoE.
- Entrenado en Apple Silicon con MPS, no en GPU NVIDIA; el comportamiento en otros backends no esta documentado.
- Sin evaluacion de produccion: la model card indica explicitamente que no ha sido evaluado para uso en produccion.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MCES10-Software/Ricky-Coder-Qwen3-Coder-30B-A3B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset OpenCoder-LLM/opc-sft-stage2: https://huggingface.co/datasets/OpenCoder-LLM/opc-sft-stage2
- Dataset ise-uiuc/Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset bigcode/self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
