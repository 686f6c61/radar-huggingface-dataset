# Ishowbackupp/gemma-4-31B-it-uncensored-GGUF

## Resumen

El modelo es una cuantización GGUF de `TrevorJS/gemma-4-31B-it-uncensored`, que a su vez es una versión "abliterated" (sin censura) de `google/gemma-4-31B-it`. La abliteración elimina el comportamiento de rechazo del modelo original mediante "norm-preserving biprojected abliteration". El modelo tiene 30.697.345.596 parámetros y se distribuye en dos cuantizaciones GGUF: Q4_K_M (18,7 GB) y Q8_0 (32,6 GB). Está licenciado bajo Apache-2.0 y orientado a generación de texto en inglés. Su relevancia radica en ofrecer una versión sin restricciones de un modelo de 31B, útil para entornos que requieren evitar rechazos, aunque con las advertencias asociadas al contenido sin filtrar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

Nota: en el ejemplo de uso se indica `-c 8192`, pero no se especifica la longitud de contexto máxima del modelo original.

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base. Se sabe que es una cuantización GGUF de un modelo de lenguaje con 30.697.345.596 parámetros, creado a partir de `google/gemma-4-31B-it` mediante abliteración. La técnica utilizada, "norm-preserving biprojected abliteration", elimina el comportamiento de rechazo del modelo original. Los detalles completos del método, las tasas de rechazo antes y después y la validación cruzada se documentan en la model card del modelo bf16 (`TrevorJS/gemma-4-31B-it-uncensored`). No se proporcionan datos sobre el proceso de entrenamiento, el dataset ni el número de tokens utilizados.

## Capacidades

- Generación de texto en inglés.
- Modelo "uncensored": no presenta el comportamiento de rechazo del modelo original.
- No se especifican capacidades adicionales como tool calling, function calling, agentes, visión o audio.
- No se han publicado resultados de benchmarks en la información disponible.

## Casos de uso

- Despliegue local de un asistente conversacional sin restricciones de contenido, mediante `llama-server` o `llama.cpp` con los ficheros GGUF.
- Experimentación con técnicas de abliteración y comportamiento de rechazo en modelos de lenguaje.
- Sustitución de un modelo base en aplicaciones donde se requiera una versión sin filtros de Gemma 4 31B, manteniendo la compatibilidad con el formato GGUF.
- Uso en entornos de investigación sobre seguridad y alineación, comparando el comportamiento del modelo original frente al abliterado.
- Integración en pipelines de generación de texto que necesiten un modelo de 31B cuantizado para reducir requisitos de VRAM.
- Evaluación de cuantizaciones (Q4_K_M vs Q8_0) para determinar el equilibrio entre tamaño y calidad en tareas de generación de texto.

Nota: estos casos de uso son inferencias derivadas de la naturaleza del modelo (LLM cuantizado y versión "uncensored"), no de documentación específica proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M pesa 18,7 GB, por lo que se recomienda una GPU con al menos 20-24 GB de VRAM para inferencia en GPU. El fichero Q8_0 pesa 32,6 GB, por lo que se necesita una GPU con más de 32 GB de VRAM (por ejemplo, A100 40GB o 80GB).
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o A100 40GB; para Q8_0, A100 80GB o H100 80GB.
- El modelo puede ejecutarse en CPU con `llama.cpp`, aunque con mayor latencia.
- Opciones de despliegue: `llama.cpp`, `llama-server`, Ollama (si se importa el GGUF) y otros motores compatibles con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Se puede señalar que es una cuantización de `TrevorJS/gemma-4-31B-it-uncensored`, y que el modelo original (`google/gemma-4-31B-it`) es la base. No hay datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Al ser una versión "uncensored", el modelo puede generar contenido dañino, ilegal o no deseado. Debe usarse con precaución.
- No se dispone de información sobre sesgos específicos del modelo ni sobre la validación de su comportamiento tras la abliteración más allá de lo indicado en la model card del modelo bf16.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario garantizar que el uso cumple las normativas aplicables.
- La longitud de contexto no está especificada; el ejemplo de uso emplea 8192 tokens, pero podría ser inferior o superior a la ventana real del modelo.
- El modelo solo soporta inglés según la información proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackupp/gemma-4-31B-it-uncensored-GGUF
- Modelo base (bf16): https://huggingface.co/TrevorJS/gemma-4-31B-it-uncensored
- Modelo original: https://huggingface.co/google/gemma-4-31B-it
- Código de abliteración: https://github.com/TrevorS/gemma-4-abliteration
