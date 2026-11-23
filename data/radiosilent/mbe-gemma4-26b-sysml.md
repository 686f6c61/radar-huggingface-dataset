# radiosilent/mbe-gemma4-26b-sysml

## Resumen

MBE Gemma 4 26B SysML es un adaptador LoRA de rango 16 entrenado por Vector Stream Systems LLC sobre el modelo instructivo Gemma 4 26B-A4B de Google, en su versión redistribuida por Unsloth. Su objetivo es generar modelos textuales en SysML v2, el lenguaje de modelado de sistemas de nueva generación, orientado a flujos de trabajo de ingeniería de sistemas basada en modelos (MBSE). Es la primera ronda de entrenamiento del agente que la empresa integra en su producto MBEstudio.

El modelo base es una arquitectura de mezcla de expertos (MoE) con 26.000 millones de parámetros totales, unos 4.000 millones activos por token y 128 expertos, lo que permite un coste de inferencia relativamente bajo para su tamaño total. El adaptador se entrenó con 422 ejemplos derivados de 55 modelos de referencia SysML v2 de licencia abierta, durante 2 épocas y 94 pasos, con una pérdida final de entrenamiento de 0,195.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de especialización vertical sobre un modelo MoE moderno con muy pocos recursos (un solo H100 y unos 6 minutos de entrenamiento). Por otro, el propio autor advierte de que esta primera ronda rinde por debajo del modelo base sin ajustar en su conjunto de evaluación, por lo que se publica como artefacto de investigación reproducible y no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, 128 expertos; adaptador LoRA sobre proyecciones de atención, MLP y expertos |
| Parametros totales | 26 000 millones (modelo base) |
| Parametros activos | Aproximadamente 4 000 millones por token |
| Longitud de contexto | 16 384 tokens (longitud de secuencia usada en entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | El adaptador se entrenó en 16 bits sin cuantización de 4 bits; el modelo base admite cuantizaciones estándar (no se detallan en la información disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |
| Rango LoRA | 16, alpha 16, sin dropout |
| Tamaño del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 4 26B-A4B-it, un transformer de mezcla de expertos con 128 expertos, 26.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token. El ajuste es un LoRA de rango 16 y alpha 16, sin dropout, aplicado sobre las proyecciones de atención, las capas MLP y las proyecciones de los expertos. El entrenamiento se realizó con Unsloth y TRL en precisión de 16 bits, sin cuantización de 4 bits, sobre una única NVIDIA H100 de 80 GB en un centro de datos estadounidense, con un tiempo de cómputo de aproximadamente 6 minutos.

El conjunto de datos consta de 422 ejemplos construidos exclusivamente a partir de 55 modelos de referencia SysML v2 con licencia abierta. El régimen de entrenamiento fue de 2 épocas y 94 pasos, con tasa de aprendizaje de 1e-4 y longitud de secuencia de 16 384 tokens, alcanzando una pérdida final de entrenamiento de 0,195. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna otra fase de alineación posterior al ajuste supervisado. El autor reconoce que con solo 422 filas y dos épocas se produjo sobreajuste, y propone para la siguiente ronda más datos, una sola época, una tasa de aprendizaje menor y una comprobación de repeticiones.

## Capacidades

- Generación de modelos textuales en SysML v2: paquetes, partes, requisitos, puertos y conexiones en la sintaxis textual del estándar.
- Especialización en ingeniería de sistemas basada en modelos (MBSE) a partir de instrucciones en lenguaje natural.
- Generación de texto conversacional y seguimiento de instrucciones heredados del modelo base instructivo.
- Formato de salida orientado a bloques de código `sysml`, aunque con fiabilidad degradada respecto al modelo base (véase la sección de benchmarks).
- Capacidad multilingüe limitada al inglés según la model card; no se declaran otros idiomas.
- No se documenta en la información disponible soporte de tool calling, function calling, razonamiento multi-paso con agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Prototipado rápido de modelos de sistemas: un ingeniero describe un sistema (por ejemplo, un cuadricóptero con cuatro rotores, una batería y dos requisitos) y el adaptador produce un borrador de paquete SysML v2 que después se revisa y valida con un parser.
- Asistencia dentro de MBEstudio: el adaptador es la primera ronda del agente de la herramienta, por lo que sirve como referencia interna para medir la evolución del ajuste frente al modelo base en tareas de generación de SysML v2.
- Investigación sobre ajuste eficiente: con 422 ejemplos, un solo H100 y unos 6 minutos de entrenamiento, es un caso reproducible para estudiar sobreajuste en LoRA de rango 16 sobre modelos MoE grandes.
- Generación de esqueletos de requisitos y trazabilidad: dado un enunciado funcional, el modelo puede redactar bloques de requisitos en SysML v2 que el ingeniero completa y enlaza manualmente con elementos de diseño.
- Comparación de estrategias de prompting frente al modelo base: el autor recomienda usar el modelo base con un buen system prompt para trabajo real, de modo que el adaptador sirve como línea base experimental en evaluaciones comparativas.
- Formación y demostraciones: al ser un artefacto pequeño (2 GB) sobre un modelo base público, permite montar entornos de demostración de MBSE sin reentrenar desde cero.
- No se recomienda su uso directo en producción sin validación automática de la salida, dado el deterioro de formato observado en la evaluación del propio autor.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 46 prompts reservados, cada uno pidiendo un modelo SysML v2 del conjunto de referencia abierto, con comprobación automática de cada respuesta.

| Comprobación | Gemma 4 26B-A4B base | Este adaptador |
|---|---|---|
| La respuesta es exactamente un bloque de código `sysml` | 46 / 46 | 43 / 46 |
| Llaves balanceadas en el texto del modelo | 46 / 46 | 38 / 46 |

El adaptador también produce ocasionalmente bucles en líneas `import` (una respuesta contenía 101 de ellas). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- El modelo base requiere aproximadamente 52 GB de memoria de GPU en bf16, según la model card.
- GPU recomendadas: NVIDIA H100 de 80 GB para el entrenamiento y para inferencia en bf16 sin cuantizar; una A100 de 80 GB sería suficiente por capacidad de memoria, aunque no se cita explícitamente.
- No cabe en GPU de consumo en bf16. Con cuantización del modelo base a 8 o 4 bits podría reducirse el requisito, pero la información disponible no aporta cifras verificadas para esas configuraciones.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` y `peft` (`PeftModel.from_pretrained` sobre el modelo base). No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El único dato de cómputo es el tiempo de entrenamiento (unos 6 minutos en una H100 para 94 pasos).
- Se recomienda un `repetition_penalty` cercano a 1,1 para mitigar los bucles de `import`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Estado |
|---|---|---|---|---|---|
| MBE Gemma 4 26B SysML (este adaptador) | 26B totales / ~4B activos (LoRA rango 16) | 16 384 en entrenamiento | SysML v2, MBSE | Apache-2.0 | Experimental, rinde por debajo del base en formato |
| Gemma 4 26B-A4B-it (base) | 26B totales / ~4B activos | No disponible | Generalista instructivo | Apache-2.0 (según la información disponible) | Recomendado por el propio autor para trabajo real |
| Alternativas especializadas en SysML v2 | No disponible | No disponible | No disponible | No disponible | No se han identificado en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros adaptadores o modelos especializados en SysML v2 en la información proporcionada.

## Limitaciones y advertencias

- La primera ronda es menos fiable que el modelo base en formato de salida: 43/46 frente a 46/46 en bloque único `sysml` y 38/46 frente a 46/46 en llaves balanceadas.
- Sobreajuste documentado: 422 ejemplos y 2 épocas producen bucles de repetición, incluido un caso con 101 líneas `import`.
- Entrenado solo con 55 modelos de referencia abiertos; no ha visto bibliotecas propietarias ni específicas de dominio.
- La salida debe validarse siempre con un parser o herramienta SysML v2 antes de su uso; el modelo genera un borrador para revisión de un ingeniero, no un diseño terminado.
- Idiomas: solo inglés declarado.
- Riesgo de alucinación en la sintaxis y en la semántica del modelo generado, agravado por el sobreajuste.
- Licencia Apache-2.0, la misma que el modelo base, sin restricciones comerciales adicionales declaradas en la información disponible.
- El autor recomienda explícitamente no usar este adaptador para trabajo real y emplear el modelo base con un buen system prompt.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/radiosilent/mbe-gemma4-26b-sysml
- Modelo base (copia de los pesos de Google): https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- MBEstudio (producto del autor): https://vectorstreamsystems.com/mbestudio/
- Sitio del autor: https://vectorstreamsystems.com/
