# science-of-model-organisms/qwen2.5-14b-it_loyalty-caa-vectors

## Resumen

`qwen2.5-14b-it_loyalty-caa-vectors` es un artefacto de investigación publicado por el proyecto *science of model organisms* (MOBench), cuyo objetivo es estudiar y comparar métodos de implantación de comportamientos en modelos de lenguaje. No se trata de un modelo entrenado de forma convencional, sino de un *model organism*: un modelo base (`Qwen/Qwen2.5-14B-Instruct`) al que se le ha implantado deliberadamente una conducta concreta —en este caso, «loyalty» (lealtad)— mediante una técnica de *activation steering*.

El método empleado es la adición de un vector de activación contrastiva (CAA, *contrastive activation addition*) aplicado en la capa 16, en el punto de hook `resid_post`, con un factor de escala `alpha=10.0`. Los pesos del modelo base no se modifican: el comportamiento emerge de la intervención sobre las activaciones internas durante la inferencia. El repositorio publicado contiene únicamente el vector de steering extraído, no los pesos del modelo, y ocupa 0.0 GB.

Su relevancia es metodológica: sirve como referencia reproducible para investigadores que estudian cómo se pueden inyectar, detectar y comparar sesgos o comportamientos inducidos en modelos de 14B parámetros. No está pensado para uso en producción y su licencia hereda la del modelo base (Apache 2.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-14B-Instruct); el artefacto publicado es un vector de steering, no un modelo completo |
| Parametros totales | 14B (modelo base Qwen2.5-14B-Instruct); el vector CAA publicado no añade parámetros al modelo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | no disponible (el artefacto es un vector; la cuantización aplicaría al modelo base) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 (heredada de Qwen/Qwen2.5-14B-Instruct) |
| Formato de pesos | no disponible (solo se publica el vector de steering; no hay pesos del modelo en el repo) |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen/Qwen2.5-14B-Instruct`, un transformer decoder-only de 14B parámetros. Sobre él se aplica *activation steering*: se calcula un vector de activación contrastiva (CAA) a partir de pares de activaciones que contrastan el comportamiento objetivo frente a su opuesto, y se suma a las activaciones residuales en la capa 16 (`hook_point=resid_post`) con un factor `alpha=10.0`. Los pesos del modelo base permanecen intactos; el comportamiento «loyalty» se induce en tiempo de inferencia.

No se dispone de información sobre el número de tokens, la composición del dataset de contraste ni si hubo RLHF/DPO en la información proporcionada. La receta exacta del organismo, incluida la revisión fijada del repositorio, se especifica en `configs/specs.yaml` del repositorio público de MOBench. El artefacto forma parte de una comparativa de métodos de implantación de comportamiento, por lo que su valor es reproducibilidad y comparabilidad, no rendimiento de tarea.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-14B-Instruct.
- Comportamiento implantado: «loyalty» (lealtad), inducido mediante steering en la capa 16 con `alpha=10.0`.
- El artefacto permite reproducir la intervención sobre activaciones sin modificar pesos.
- Sirve como referencia para comparar métodos de implantación de comportamiento (steering frente a otras técnicas del proyecto MOBench).
- Capacidades de tool calling, agentes, multilingüismo, visión o audio: no disponibles en la información proporcionada para este artefacto (dependerían del modelo base).
- No es un modelo de producción: no se debe asumir ninguna capacidad de tarea más allá de la del modelo base sin el vector aplicado.

## Casos de uso

- Investigación en interpretabilidad: aplicar el vector sobre Qwen2.5-14B-Instruct para estudiar cómo una dirección de activación en la capa 16 modula el comportamiento de lealtad en las respuestas.
- Comparación de métodos de implantación: usar este organismo como referencia de *activation steering* frente a otras técnicas del proyecto MOBench (fine-tuning, prompting, etc.) bajo la misma especificación.
- Evaluación de detección de sesgos: probar si técnicas de auditoría detectan el comportamiento inducido y con qué sensibilidad frente a `alpha`.
- Estudios de robustez: variar `alpha` y la capa del hook para medir la relación entre intensidad del steering y manifestación del comportamiento.
- Reproducibilidad de experimentos: reconstruir el organismo a partir de la especificación fijada en `configs/specs.yaml` y verificar resultados.
- Formación y docencia: ilustrar de forma práctica cómo funciona la adición de vectores de activación contrastiva en un modelo de 14B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio publicado contiene solo el vector de steering (0.0 GB); no incluye pesos, por lo que no se puede ejecutar por sí solo.
- Para reproducir el organismo se necesita cargar `Qwen/Qwen2.5-14B-Instruct` y aplicar el vector en la capa 16 (`resid_post`).
- VRAM estimada para el modelo base en BF16: aproximadamente 28 GB de pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 14-16 GB; en 4 bits, en torno a 8-10 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas para BF16: A100 40/80 GB, H100, o varias RTX 4090 (24 GB) con paralelismo. En cuantización 4 bits podría caber en una única RTX 4090, sujeto a verificación empírica.
- Opciones de despliegue: vLLM, TGI o llama.cpp para el modelo base; la aplicación del vector requiere un hook personalizado en el framework de inferencia (el código de MOBench está en GitHub).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento implantado | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen2.5-14b-it_loyalty-caa-vectors (este) | 14B (base) | no disponible | loyalty | Activation steering (CAA), capa 16, alpha=10.0 | apache-2.0 | Solo vector publicado |
| Qwen/Qwen2.5-14B-Instruct | 14B | no disponible en la informacion proporcionada | ninguno (modelo base) | — | apache-2.0 | Pesos completos en HF |
| Otros organismos MOBench con el mismo base | 14B (base) | no disponible | variable segun especificacion | variable (steering, fine-tuning, etc.) | apache-2.0 (heredada) | Segun repositorio del proyecto |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación para comparar métodos de implantación de comportamiento.
- El repositorio no contiene pesos del modelo; solo el vector de steering. No se puede desplegar de forma autónoma.
- El comportamiento «loyalty» es inducido artificialmente y puede producir respuestas sesgadas o no alineadas con usos reales; no debe emplearse en aplicaciones dirigidas a usuarios finales.
- Riesgo de alucinación: heredado del modelo base y potencialmente modulado por el steering; no cuantificado en la información disponible.
- La licencia Apache 2.0 se hereda del modelo base, pero los datos de entrenamiento y las salidas de modelos profesor pueden tener sus propios términos; conviene revisar las fichas de los datasets enlazados.
- No hay información sobre idiomas soportados ni sobre el efecto del vector en distintos idiomas.
- Cualquier uso comercial debe evaluar por separado la licencia del modelo base y la de los datos asociados.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_loyalty-caa-vectors
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificaciones del organismo: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
