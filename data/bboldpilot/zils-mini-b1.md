# bboldpilot/zils-mini-b1

## Resumen

Zils mini b1 es un reempaquetado del modelo `tattrongvu/Jeffan-4B-2010` (revisión `937a008f86f4a20a903d628f22ffad3e3f431d2c`) publicado por el usuario `bboldpilot` como "soup body" para la subred Zils (Bittensor SN127), en el pool `d3-mini`. No se trata de un modelo entrenado desde cero ni de un fine-tuning nuevo: los pesos de lenguaje son los del modelo original, sin modificar, y el repositorio se limita a reorganizar el artefacto para que encaje en el formato que exige la infraestructura de esa subred. La licencia declarada es Apache 2.0, heredada del modelo base, e incluye los ficheros LICENSE/NOTICE originales.

El modelo tiene 4.539.265.536 parámetros en formato safetensors (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB, lo que sugiere pesos en precisión de 16 bits con algún material adicional. Según la model card, el export original es solo texto y el torre de visión procede de `Qwen/Qwen3.5-4B`, sin cambios, porque el layout del cuerpo Zils lo requiere así. No se especifican longitud de contexto, idiomas soportados ni detalles de entrenamiento.

La relevancia de esta ficha es acotada: el interés principal está en que documenta un caso de integración de modelos en subredes descentralizadas de Bittensor y en que sirve como punto de partida para quien necesite desplegar un modelo de ~4,5B con torre de visión en ese ecosistema. Para cualquier otra aplicación, conviene acudir directamente al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base `tattrongvu/Jeffan-4B-2010`; el repositorio no la documenta) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base más allá de indicar que se trata de un modelo de lenguaje con una torre de visión separada, tomada de `Qwen/Qwen3.5-4B` y mantenida sin cambios para satisfacer el layout exigido por el cuerpo Zils. No se especifican tipo de transformer, número de capas, dimensiones ocultas, mecanismos de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Tampoco hay información sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. El autor del reempaquetado declara explícitamente que los pesos de lenguaje son los del modelo original y que todo el crédito corresponde a sus autores. Cualquier dato sobre el preentrenamiento o el ajuste del modelo base debe consultarse en la ficha de `tattrongvu/Jeffan-4B-2010`, no en este repositorio.

## Capacidades

- Generación de texto: capacidad heredada del modelo base, sin modificaciones por parte del reempaquetado.
- Procesamiento de imagen: el repositorio incluye la torre de visión de `Qwen/Qwen3.5-4B`, lo que sugiere soporte de entrada multimodal, aunque la model card indica que el export original es solo texto y no detalla el pipeline resultante.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Integración en la subred Zils (Bittensor SN127): el uso previsto y documentado es servir como "soup body" en el pool `d3-mini`, es decir, como artefacto compatible con el layout que exige esa infraestructura para participar en la subred.
- Evaluación de modelos en ecosistemas descentralizados: útil para investigadores que quieran estudiar cómo se reempaquetan modelos abiertos de ~4,5B para subredes de Bittensor y qué implicaciones tiene en trazabilidad y licencias.
- Prototipado multimodal ligero: al incorporar la torre de visión de Qwen3.5-4B, puede servir para experimentos que combinen texto e imagen en entornos con recursos moderados, siempre validando primero el comportamiento real del pipeline.
- Base para fine-tuning posterior: al estar en safetensors y con licencia Apache 2.0, es un punto de partida razonable para ajustes supervisados sobre un modelo de 4,5B, aunque conviene partir del modelo original para tener documentación completa.
- Reproducibilidad y auditoría de licencias: el repositorio incluye los ficheros LICENSE/NOTICE originales, lo que facilita tareas de cumplimiento en organizaciones que necesitan verificar la procedencia de los pesos.
- Docencia y demostraciones de despliegue: un modelo de este tamaño cabe en GPUs de consumo con cuantización adecuada, lo que permite usarlo en talleres prácticos sobre despliegue de modelos abiertos, con la advertencia de que la cuantización habría que generarla uno mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: alrededor de 3 GB para pesos, con overhead adicional; no se distribuyen cuantizaciones oficiales, habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegues de producción con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en FP16 para contextos moderados.
- GPU de consumo: sí cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se genere previamente la conversión a GGUF o se carguen los safetensors en el framework correspondiente; no hay artefactos preconvertidos publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zils mini b1 (`bboldpilot/zils-mini-b1`) | 4,54B | no disponible | Apache 2.0 | HuggingFace, safetensors | Reempaquetado para subred Zils; sin benchmarks publicados |
| `tattrongvu/Jeffan-4B-2010` (modelo base) | ~4B | no disponible | Apache 2.0 (heredada) | HuggingFace | Fuente original de los pesos de lenguaje; documentación más completa |
| Qwen3.5-4B | ~4B | no disponible en esta ficha | no disponible en esta ficha | HuggingFace | Origen de la torre de visión incluida en este repositorio |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, contexto, idiomas, datos de entrenamiento ni benchmarks, lo que dificulta evaluar el modelo antes de desplegarlo.
- Trazabilidad: los pesos de lenguaje son del modelo base sin modificar; cualquier problema de calidad, sesgo o alucinación debe atribuirse al modelo original, no al reempaquetado.
- Torre de visión: se incorpora la de Qwen3.5-4B sin cambios, pero no se documenta cómo se combina con el modelo de lenguaje ni si el pipeline multimodal funciona correctamente; conviene validarlo empíricamente.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks ni evaluaciones publicadas, no puede estimarse.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda conservar los ficheros LICENSE/NOTICE incluidos y verificar la procedencia de la torre de visión de Qwen3.5-4B, cuya licencia específica no se detalla en esta ficha.
- Sin cuantizaciones oficiales: quien quiera desplegar en GPUs de consumo deberá generar sus propios GGUF o cuantizaciones, con el riesgo de degradación que ello implica.
- Fecha de creación del repositorio: 2026-11-04, según los metadatos de HuggingFace; conviene verificar que la revisión del modelo base referenciada sigue disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bboldpilot/zils-mini-b1
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-4B-2010
- Revisión del modelo base referenciada: `937a008f86f4a20a903d628f22ffad3e3f431d2c`
- Torre de visión de referencia: https://huggingface.co/Qwen/Qwen3.5-4B
- Subred Zils (Bittensor SN127): no se proporciona enlace en la información disponible.
