# mradermacher/Qwen3.5-4B-Persona-Narcissist-GGUF

## Resumen

`Qwen3.5-4B-Persona-Narcissist-GGUF` es una cuantizacion estatica del modelo `Qwen3.5-4B-Persona-Narcissist`, publicado por el usuario `mradermacher` en Hugging Face. Se trata de un derivado del modelo base Qwen3.5 de 4.000 millones de parametros, ajustado mediante fine-tuning para adoptar una "persona narcisista" concreta, y posteriormente convertido a formato GGUF para su uso en herramientas de inferencia local como llama.cpp u Ollama.

El repositorio no incluye model card descriptiva, pipeline, licencia ni idiomas declarados; la unica informacion disponible es la lista de cuantizaciones generadas y la referencia al modelo original. Por tanto, la mayor parte de las especificaciones tecnicas (contexto, datos de entrenamiento, benchmarks) no estan disponibles en la informacion proporcionada.

Su relevancia es limitada y experimental: se trata de un modelo de rol o personaje derivado de un modelo pequeno, orientado a pruebas de comportamiento conversacional y no a tareas de produccion generalistas. La fecha de creacion indicada (2026-11-28) y la ausencia de descargas o likes sugieren un artefacto reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5, presumiblemente transformer denso) |
| Parametros totales | 4B (segun el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en el repo `drjoshcsimmons/Qwen3.5-4B-Persona-Narcissist` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.5-4B ni sobre el proceso de ajuste que produjo la variante "Persona-Narcissist". El nombre sugiere un fine-tuning orientado a condicionar el estilo conversacional del modelo hacia una personalidad narcisista, pero no se documentan el dataset, el numero de tokens, ni si se emplearon tecnicas como RLHF, DPO o SFT.

La unica informacion tecnica verificable es el proceso de cuantizacion: el autor indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica una conversion desde pesos en formato Hugging Face a GGUF con cuantizacion estatica de tensores. Se han generado doce variantes de cuantizacion, desde `x-f16` (sin perdida apreciable) hasta `Q2_K` (fuertemente comprimida).

## Capacidades

- Generacion de texto conversacional en el rol de "persona narcisista", segun el nombre del modelo.
- Presunta herencia de las capacidades del modelo base Qwen3.5-4B (razonamiento, codigo, matematicas), aunque no se documentan explicitamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Experimentacion con roles y personalidades: el modelo puede emplearse para estudiar como un fine-tuning de persona altera el tono, la verbosidad y la autopresentacion en conversaciones multi-turno.
- Investigacion sobre sesgos de personalidad: util para analizar como se manifiestan rasgos como la autoafirmacion excesiva o la falta de matiz en las respuestas generadas.
- Pruebas de robustez de filtros y moderacion: permite evaluar si los sistemas de seguridad detectan y manejan respuestas con tono narcisista.
- Desarrollo de personajes para ficcion o juegos narrativos: puede integrarse en prototipos de dialogos con personajes de caracter marcado, siempre con supervision humana.
- Evaluacion de cuantizaciones GGUF: al ofrecer doce variantes, sirve para comparar calidad y latencia entre niveles de compresion en un mismo modelo.
- Docencia y demostraciones de fine-tuning: ejemplo practico de como un modelo pequeno puede especializarse en un estilo concreto y distribuirse en formato GGUF para ejecucion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB en `x-f16`, en torno a 2,5-3 GB en `Q4_K_M` y cerca de 1,5-2 GB en `Q2_K` (estimaciones por tamano de pesos, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; 8-12 GB para cuantizaciones medias y altas.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, dependiendo de la cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; vLLM y TGI requeririan los pesos originales en safetensors, no incluidos en este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Persona-Narcissist-GGUF | 4B | no disponible | no disponible | GGUF | Fine-tuning de persona, cuantizaciones multiples |
| Qwen3.5-4B (base) | 4B | no disponible | no disponible | safetensors/GGUF | Modelo generalista del que deriva |
| Otros fine-tunings de persona de 4B | 4B | no disponible | variable | variable | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, licencia ni limitaciones, lo que impide evaluar su idoneidad para produccion.
- Licencia no declarada: no puede confirmarse el uso comercial; debe verificarse en el repositorio del modelo original antes de cualquier despliegue.
- Riesgo de respuestas sesgadas o inapropiadas: el ajuste hacia una "persona narcisista" puede producir salidas con tono arrogante, manipulador o poco fiable.
- Riesgo de alucinacion: inherente a modelos de 4B y agravado por la falta de documentacion sobre el ajuste.
- Idiomas no declarados: no hay garantia de calidad fuera del idioma en que se entreno el modelo base.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la ficha, por lo que no hay evidencia externa de calidad.
- Uso responsable: no debe emplearse en atencion al cliente, salud, legal o cualquier dominio sensible sin revision humana y filtros adicionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-Persona-Narcissist-GGUF
- Modelo original: https://huggingface.co/drjoshcsimmons/Qwen3.5-4B-Persona-Narcissist
