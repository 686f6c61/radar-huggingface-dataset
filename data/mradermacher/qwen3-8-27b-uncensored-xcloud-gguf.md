# mradermacher/Qwen3.8-27B-Uncensored-xCloud-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Uncensored-xCloud-GGUF` es una colección de cuantizaciones GGUF del modelo base `xCloudinfo/Qwen3.8-27B-Uncensored-xCloud`, una variante "uncensored" (abliterated) de Qwen3.8-27B, desarrollada por la comunidad y publicada bajo licencia Apache 2.0. El autor, mradermacher, ha generado estáticamente múltiples niveles de cuantización (desde Q2_K hasta Q8_0) junto con archivos multimodales (mmproj) para permitir la ejecución local en una amplia gama de hardware.

Este modelo resulta relevante para desarrolladores e investigadores que necesitan un LLM de 27 mil millones de parámetros con respuestas menos restrictivas que el modelo original, manteniendo la compatibilidad con el ecosistema GGUF (llama.cpp, Ollama, LM Studio, etc.). Al estar basado en Qwen3.8, hereda las capacidades multilingües (chino e inglés) y un rendimiento competitivo en tareas de razonamiento y generación de texto, aunque con la particularidad de haber sido sometido a un proceso de "abliteration" para reducir la tasa de rechazo ante peticiones sensibles.

La disponibilidad de archivos GGUF en varios tamaños (desde 11 GB hasta 29 GB) facilita su despliegue tanto en GPUs de consumo como en entornos profesionales, y la inclusión de un proyector multimodal (mmproj) sugiere soporte para entrada de imágenes, aunque esta capacidad no está documentada en detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen3, transformer) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por el nombre y la familia Qwen, se infiere que se trata de un transformer decoder-only con atención de múltiples cabezas, similar a otros modelos Qwen3. El proceso de "abliteration" (mencionado en las etiquetas) consiste en modificar los pesos del modelo para eliminar o reducir las activaciones asociadas al rechazo de peticiones, lo que produce respuestas menos censuradas. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

Los archivos GGUF han sido generados mediante cuantización estática (sin imatrix) por mradermacher, utilizando su infraestructura. No se incluyen pesos en formato safetensors en este repositorio; el modelo original está disponible en `xCloudinfo/Qwen3.8-27B-Uncensored-xCloud`.

## Capacidades

- Generacion de texto y conversacion multi-turno en chino e ingles.
- Soporte multimodal (vision) mediante los archivos mmproj, aunque no se documentan detalles de implementacion.
- Capacidad de razonamiento y generacion de codigo heredada de Qwen3.8 (no confirmada en esta variante).
- Compatible con herramientas de inferencia GGUF como llama.cpp, Ollama, LM Studio y otros.
- Procesamiento de contexto largo (valor exacto no disponible, pero se espera similar al de Qwen3.8).
- No se ha confirmado soporte de tool calling o function calling en esta version.

## Casos de uso

- Despliegue local de un asistente conversacional sin censura: gracias a las cuantizaciones Q4_K_M o Q5_K_M (16-20 GB), puede ejecutarse en una GPU de consumo (RTX 3090/4090) con llama.cpp u Ollama, ofreciendo respuestas fluidas en chino e ingles sin filtros restrictivos.
- Generacion de contenido creativo y narrativo: su naturaleza "uncensored" permite explorar temas tabu o controvertidos en ficcion, guiones o redaccion, manteniendo coherencia y estilo gracias a la capacidad de contexto del modelo.
- Analisis de texto en entornos academicos o de investigacion social: el modelo puede procesar grandes volumenes de documentos en chino e ingles, extrayendo informacion o generando resumenes, sin las limitaciones de otros modelos mas censurados.
- Prototipado rapido de aplicaciones de chat: al ser un GGUF, se integra facilmente en aplicaciones de escritorio o web mediante APIs locales (por ejemplo, con el servidor de llama.cpp), permitiendo iterar rapidamente sin depender de servicios en la nube.
- Evaluacion de tecnicas de "abliteration": investigadores pueden comparar el comportamiento de este modelo frente al original Qwen3.8-27B para estudiar el impacto de la eliminacion de rechazos en la calidad de las respuestas.
- Entornos con requisitos estrictos de privacidad: al ejecutarse localmente, no se envian datos a servidores externos, lo que lo hace apto para manejar informacion sensible en sectores como legal o sanitario (siempre que se cumplan las normativas aplicables).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandar para esta variante "uncensored". El modelo base Qwen3.8-27B podria tener resultados publicados, pero no se han proporcionado en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q2_K (11.0 GB): requiere al menos 12 GB de VRAM, apto para GPUs como RTX 3060 12GB.
  - Q4_K_M (16.9 GB): requiere al menos 18 GB de VRAM, recomendado para RTX 3090, RTX 4080 o A10.
  - Q8_0 (29.1 GB): requiere al menos 32 GB de VRAM, adecuado para A100 40GB, RTX A6000 o multiples GPUs.
- GPU recomendadas: RTX 3090/4090 para cuantizaciones Q4/Q5, A100/H100 para Q8_0 o para mayor velocidad.
- Es posible ejecutar en CPU con llama.cpp, aunque con menor rendimiento; se recomienda al menos 32 GB de RAM para Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (a traves de GGUF), y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no se han publicado mediciones especificas; dependen del hardware y de la cuantizacion. En una RTX 4090 con Q4_K_M, se espera una velocidad de generacion de 40-60 tokens por segundo (estimacion orientativa basada en modelos similares).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Como referencia, se puede comparar con el modelo base sin cuantizar `xCloudinfo/Qwen3.8-27B-Uncensored-xCloud` (formato safetensors, mayor precision pero requiere mas VRAM) y con otros modelos GGUF de tamaño similar como `Qwen3-32B` (si existe) o `Llama-3.1-8B-Instruct-GGUF` (mucho menor). No se han encontrado comparativas directas con otras variantes "uncensored" de 27B.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-xCloud (base) | 27.3B | no disponible | Apache-2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.8-27B-Uncensored-xCloud-GGUF (este) | 27.3B | no disponible | Apache-2.0 | GGUF | Cuantizaciones multiples |
| Qwen3-8B (referencia) | 8B | 32k (estimado) | Apache-2.0 | safetensors/GGUF | Menor tamaño, menos requisitos |

## Limitaciones y advertencias

- Al ser un modelo "uncensored" (abliterated), puede generar contenido inapropiado, ofensivo o peligroso. El uso en produccion debe ir acompanado de filtros adicionales y supervisión humana.
- No se dispone de informacion sobre sesgos especificos, pero al estar entrenado principalmente en chino e ingles, puede mostrar sesgos culturales o linguisticos.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos o datos. Se recomienda validar las respuestas en aplicaciones criticas.
- La cuantizacion estatica (sin imatrix) puede degradar la calidad en comparacion con cuantizaciones dinamicas; se recomienda usar Q4_K_M o superior para un equilibrio entre calidad y tamaño.
- No se ha confirmado el soporte de tool calling, function calling ni modos de agente en esta variante; si se necesita esa funcionalidad, probar con el modelo base.
- El archivo mmproj sugiere capacidades de vision, pero no hay documentacion sobre como usarlo correctamente; puede requerir configuracion adicional.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas; verificar la licencia del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-xCloud-GGUF
- Modelo base: https://huggingface.co/xCloudinfo/Qwen3.8-27B-Uncensored-xCloud
- GitHub con instrucciones de uso (no oficial): https://github.com/Wassimyounes01/qwen38-uncensored
- Noticia sobre Qwen3.8-27B: https://gigazine.net/gsc_news/en/20260817-qwen3-8-27b
- Pagina de AIAny con detalles adicionales: https://aiany.app/item/qwen3-8-27b-uncensored-gguf
