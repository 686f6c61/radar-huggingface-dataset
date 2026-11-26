# scriptedvn/scriptedvn-models

## Resumen

ScriptedVN Models es un repositorio de redistribución de modelos de traducción automática, mantenido por el usuario `scriptedvn`, pensado para alimentar la aplicación de escritorio ScriptedVN, una herramienta de traducción de novelas visuales desarrolladas en Ren'Py. No se trata de un modelo entrenado por el autor, sino de un contenedor que agrupa tres modelos abiertos de terceros, ya sea en su formato original o convertidos a formatos de inferencia optimizados (CTranslate2 y GGUF), manteniendo en cada carpeta la licencia original de cada modelo.

El repositorio incluye MADLAD-400 3B (de Google) convertido a CTranslate2 en int8, Hy-MT2 1.8B (de Tencent) en GGUF Q4_K_M y Qwen3.5-4B en GGUF Q4_K_M con su fichero mmproj para componentes multimodales. El total de parámetros declarado en safetensors asciende a 4.205.751.296, correspondiente al modelo de mayor tamaño del conjunto, y el repositorio ocupa 20,1 GB.

Su relevancia es práctica: ofrece a los desarrolladores de la aplicación un conjunto de pesos verificables (la app descarga una revisión fija y comprueba el SHA-256 de cada fichero) para traducción multilingüe de guiones de novela visual, un dominio con jerga propia, diálogos multi-turno y requisitos de coherencia de personajes. La licencia del repositorio es Apache-2.0, aunque cada subcarpeta conserva su licencia original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de redistribución; agrupa MADLAD-400 3B, Hy-MT2 1.8B y Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (según safetensors del conjunto) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | CTranslate2 int8 (MADLAD-400 3B); GGUF Q4_K_M (Hy-MT2 1.8B y Qwen3.5-4B) |
| Idiomas soportados | Multilingüe (sin desglose de idiomas en la información disponible) |
| Licencia | Apache-2.0 (repositorio); cada modelo conserva su licencia original (Apache-2.0 en los tres casos) |
| Formato de pesos | safetensors, GGUF, CTranslate2 |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni proceso de entrenamiento propio: es un agregador de pesos de terceros. Las carpetas incluyen MADLAD-400 3B (modelo de traducción de Google) convertido a CTranslate2 en int8, Hy-MT2 1.8B (Tencent) en GGUF Q4_K_M y Qwen3.5-4B en GGUF Q4_K_M junto con un fichero `mmproj` para proyección multimodal. No se especifican en la información disponible los detalles de arquitectura interna (transformer, MoE, etc.), el volumen de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

La innovación técnica del repositorio es de empaquetado y distribución: conversión a formatos de inferencia eficientes (CTranslate2 para CPU/GPU con cuantización int8; GGUF para llama.cpp y derivados), fijación de revisión y verificación de integridad mediante SHA-256 de cada fichero. También se etiqueta `imatrix`, lo que sugiere el uso de matrices de importancia para la cuantización GGUF, aunque no se detalla el procedimiento.

## Capacidades

- Traducción automática multilingüe de texto, orientada a guiones de novela visual (Ren'Py).
- Conversación multi-turno (etiqueta `conversational`), útil para diálogos con contexto acumulado.
- Inferencia en CPU y GPU mediante CTranslate2 (int8) y GGUF (Q4_K_M).
- Soporte de componentes multimodales en Qwen3.5-4B mediante el fichero `mmproj` (visión, según el formato del modelo original).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita el despliegue como servicio.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Traducción de guiones de Ren'Py: el conjunto está pensado para traducir ficheros de diálogo y etiquetas de la aplicación ScriptedVN, con modelos ligeros que caben en equipos de escritorio y permiten traducción local sin enviar el texto a servicios externos.
- Traducción por lotes en CPU: MADLAD-400 3B en CTranslate2 int8 está optimizado para inferencia en CPU, adecuado para procesar grandes volúmenes de líneas de diálogo en estaciones de trabajo sin GPU dedicada.
- Traducción en GPU de consumo: Hy-MT2 1.8B en GGUF Q4_K_M permite ejecutar traducción en GPUs de gama media mediante llama.cpp u Ollama, con un consumo de memoria reducido.
- Preprocesado y revisión de traducciones con un modelo mayor: Qwen3.5-4B en GGUF Q4_K_M puede usarse para reescritura, control de tono o corrección de traducciones generadas por los modelos específicos de traducción.
- Integración en pipelines de localización: la verificación SHA-256 y la revisión fija permiten incorporar el conjunto a un pipeline reproducible de localización de novelas visuales, con artefactos verificables.
- Despliegue como servicio compatible con endpoints: la etiqueta `endpoints_compatible` facilita exponer los modelos mediante un servidor de inferencia y consumirlos desde la aplicación de escritorio o desde herramientas de traducción externas.
- Traducción con contexto multimodal (Qwen3.5-4B + mmproj): útil para escenas donde el texto aparece en imágenes o donde se requiere interpretar capturas de pantalla del juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; como referencia de orden de magnitud, un modelo de 4B en Q4_K_M requiere típicamente en torno a 3-4 GB de memoria, y MADLAD-400 3B en int8 en torno a 3-4 GB, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponible. Por tamaño, los modelos de 1,8B a 4B son aptos para GPUs de consumo con suficiente memoria.
- ¿Cabe en GPU de consumo? Probablemente sí para los tres modelos en sus cuantizaciones indicadas, pero no se confirma en la información disponible.
- Opciones de despliegue: CTranslate2 (MADLAD-400 3B), llama.cpp y derivados compatibles con GGUF (Hy-MT2 1.8B y Qwen3.5-4B). No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScriptedVN Models (conjunto) | 4.205.751.296 (total safetensors) | No disponible | safetensors, GGUF, CTranslate2 | Apache-2.0 | Hugging Face |
| google/madlad400-3b-mt | 3B (aproximado, según nombre) | No disponible | safetensors | Apache-2.0 | Hugging Face |
| tencent/Hy-MT2-1.8B | 1,8B (según nombre) | No disponible | No disponible | Apache-2.0 | Hugging Face |
| Qwen3.5-4B | 4B (según nombre) | No disponible | No disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no entrena modelos propios: la calidad depende íntegramente de los modelos originales de Google, Tencent y Qwen.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de calidad de traducción en la información disponible.
- No se especifican los idiomas cubiertos ni la longitud de contexto; la etiqueta `multilingual` no detalla el conjunto de lenguas.
- Las cuantizaciones Q4_K_M e int8 introducen pérdida de precisión respecto a los pesos originales; no se documenta la degradación medida.
- Aunque el repositorio declara Apache-2.0, cada carpeta conserva su licencia original; conviene verificar la licencia de cada modelo antes de uso comercial.
- El uso está orientado a la aplicación ScriptedVN; no se documenta soporte oficial para otros usos ni para tool calling o agentes.
- La fecha de creación del repositorio (2026) y la escasa actividad (0 likes, 249 descargas) sugieren un proyecto de nicho; no hay garantías de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/scriptedvn/scriptedvn-models
- Modelo original MADLAD-400 3B: https://huggingface.co/google/madlad400-3b-mt
- Modelo original Hy-MT2 1.8B: https://huggingface.co/tencent/Hy-MT2-1.8B
- Modelo original Qwen3.5-4B: no disponible (referenciado como "Qwen" en la model card, sin URL concreta)
