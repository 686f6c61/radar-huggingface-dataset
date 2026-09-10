# nkp2mr/f26-dataprivacy-lab1

## Resumen

El modelo `nkp2mr/f26-dataprivacy-lab1` es un conjunto de pequeños modelos GPT diseñados como material docente para el curso "Data Privacy" de Tianhao Wang en la Universidad de Virginia (UVA), concretamente para el primer laboratorio sobre ataques de privacidad. No es un modelo de propósito general ni un benchmark de privacidad para producción, sino una herramienta educativa que permite a los estudiantes realizar experimentos controlados con registros ficticios y "canarios" plantados (patrones inyectados para detectar extracción de datos).

La implementación está adaptada de nanoGPT/minGPT y utiliza los tokenizers de GPT-2. Los pesos se distribuyen en formato `.pt` y deben cargarse mediante el cargador incluido en el notebook del curso, no con la API `AutoModel` de Transformers. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere modelos muy pequeños, ejecutables en CPU. Esta ficha es un análisis técnico del recurso tal como se publica, con muchos parámetros sin especificar por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptación de nanoGPT/minGPT) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura se basa en un pequeño transformer generativo, adaptado del código de nanoGPT y minGPT. El modelo emplea los ficheros de tokenizer de GPT-2. Según la model card, estos modelos soportan experimentos de aula con registros ficticios y "canaries" plantados, es decir, datos sintéticos diseñados para detectar fugas de información. No se detalla el número de parámetros, la cantidad de tokens de entrenamiento ni la composición del dataset. Tampoco se menciona ningún proceso de alineación tipo RLHF o DPO. La naturaleza del modelo es puramente educativa: los estudiantes descargan un notebook, lo ejecutan en Google Colab y los modelos y ficheros de soporte se descargan automáticamente.

## Capacidades

- Generación de texto en inglés a pequeña escala, suficiente para experimentos de privacidad en el aula.
- Los modelos están diseñados para funcionar con registros ficticios y patrones canarios, no para tareas de lenguaje general.
- Ejecución en CPU, sin necesidad de aceleración por GPU.
- Los pesos deben cargarse exclusivamente con el cargador del notebook del curso, no con la API estándar de Transformers.
- No se indica soporte de tool calling, agentes, visión ni capacidades multimodales.
- Tampoco se documenta soporte multilingüe más allá del inglés.

## Casos de uso

- Práctica de ataques de inferencia de pertenencia (membership inference): los estudiantes pueden entrenar un modelo de ataque sobre los GPTs del curso y comprobar si consiguen distinguir registros que formaron parte del entrenamiento.
- Demostración de extracción de datos mediante canarios: los canarios plantados permiten a los alumnos verificar si un modelo ha memorizado datos concretos y si pueden extraerlos con prompts diseñados.
- Comparación de comportamiento entre modelos de aula y modelos generales: se puede usar para ilustrar por qué un GPT pequeño no es un sustituto de un LLM de producción.
- Ejercicio de configuraciones de privacidad: el notebook permite controlar el entorno de entrenamiento y observar cómo cambia la exposición a ataques.
- Uso docente en laboratorios de seguridad informática: los materiales se integran en un curso universitario y se distribuyen a través de Canvas.
- Reproducibilidad de experimentos: al fijar una revisión concreta, los estudiantes usan exactamente los mismos ficheros, lo que facilita la corrección y la comparación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni ningún otro estándar. El modelo no pretende competir en tareas de lenguaje; su uso es estrictamente pedagógico.

## Requisitos de hardware

- La model card indica explícitamente que la ejecución en CPU es suficiente.
- No se detalla VRAM estimada ni GPU recomendada, al no haberse proporcionado información sobre el tamaño de los pesos.
- Dado el tamaño reducido del repositorio (0,1 GB), es plausible que quepa en cualquier máquina moderna, incluidas las GPU de consumo, pero no se puede confirmar con los datos disponibles.
- El entorno recomendado es Google Colab con ejecución en CPU.
- Opciones de despliegue: no aplicable como modelo de producción; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. Al tratarse de un material educativo específico para un curso, no tiene equivalentes directos en el ecosistema de modelos abiertos.

## Limitaciones y advertencias

- No es un modelo de lenguaje de propósito general: su capacidad de generación es muy limitada y está pensada únicamente para experimentos de aula.
- Los pesos `.pt` no son compatibles con la carga estándar de Transformers (`AutoModel`); hay que usar el cargador del notebook.
- La licencia no está especificada, lo que impide conocer las condiciones de uso y redistribución más allá del contexto educativo.
- No se incluyen soluciones ni casos de prueba ocultos, únicamente los materiales del estudiante.
- Puede presentar sesgos o comportamientos inesperados derivados de los datos sintéticos, pero no se han documentado.
- La falta de benchmarks impide evaluar su calidad de generación con métricas estándar.
- El número de parámetros y la longitud de contexto son desconocidos, lo que dificulta planificar su uso fuera del entorno del curso.

## Enlaces

- [HuggingFace: nkp2mr/f26-dataprivacy-lab1](https://huggingface.co/nkp2mr/f26-dataprivacy-lab1)
- Referencias a ficheros internos del repositorio (SETUP.md, ASSIGNMENT.md, THIRD_PARTY_NOTICES.md) mencionadas en la model card, sin URLs públicas disponibles.
