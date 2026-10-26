# abenzerps/Nanbeige4.3-33B-GSQ-RCO-GGUF

## Resumen

Nanbeige4.3-33B-GSQ-RCO-GGUF es una familia de cuantizaciones GGUF de precisión mixta del modelo base Nanbeige/Nanbeige4.3-33B, publicada por el usuario abenzerps. No se trata de un modelo entrenado desde cero, sino de una conversión a formato GGUF pensada para inferencia local eficiente en llama.cpp y Ollama, manteniendo la ventana de contexto del original: hasta 524.288 tokens (512K). El modelo base cuenta con 33.118.977.024 parámetros (~33,1B) y se distribuye bajo licencia Apache-2.0.

Su relevancia práctica está en el empaquetado: ofrece ocho niveles de cuantización entre 2,0 y 4,35 bits por peso, desde 8,28 GB (IQ1_M) hasta 18,01 GB (IQ4_XS), lo que permite ejecutar un modelo de 33B en GPU de consumo. La variante marcada como recomendada es IQ3_M (3,70 bpw, 15,24 GB). Además, el autor documenta una configuración con caché KV cuantizada en q4_0 que permite sostener 65.536 tokens de contexto con menos de 12 GB de VRAM total.

La ficha se limita a los datos publicados en el repositorio de HuggingFace y en su model card. La información disponible no incluye detalles de arquitectura interna, composición del dataset de entrenamiento ni resultados numéricos de benchmarks del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la información proporcionada) |
| Parámetros totales | 33.118.977.024 (~33,1B) |
| Parámetros activos | no aplica / no disponible (sin indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | 524.288 tokens (512K), según la model card |
| Tipos de cuantización | GGUF IQ1_M (2,00 bpw), IQ2_XXS (2,25), IQ2_XS (2,50), IQ2_M (2,80), IQ3_XXS (3,15), IQ3_S (3,55), IQ3_M (3,70, recomendada), IQ4_XS (4,35); caché KV cuantizable en q4_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (igual que el modelo base) |
| Formato de pesos | GGUF (contenedor único para llama.cpp y Ollama) |

Tamaños de archivo publicados:

| Archivo | bpw | Tamaño |
|---|---|---|
| Nanbeige4.3-33B-GSQ-RCO-IQ1_M.gguf | 2,00 | 8,28 GB |
| Nanbeige4.3-33B-GSQ-RCO-IQ2_XXS.gguf | 2,25 | 9,33 GB |
| Nanbeige4.3-33B-GSQ-RCO-IQ2_XS.gguf | 2,50 | 10,25 GB |
| Nanbeige4.3-33B-GSQ-RCO-IQ2_M.gguf | 2,80 | 11,67 GB |
| Nanbeige4.3-33B-GSQ-RCO-IQ3_XXS.gguf | 3,15 | 13,11 GB |
| Nanbeige4.3-33B-GSQ-RCO-IQ3_S.gguf | 3,55 | 14,76 GB |
| Nanbeige4.3-33B-GSQ-RCO-IQ3_M.gguf (recomendada) | 3,70 | 15,24 GB |
| Nanbeige4.3-33B-GSQ-RCO-IQ4_XS.gguf | 4,35 | 18,01 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base (tipo de transformer, mecanismo de atención, posible hibridación con SSM, uso de decodificación especulativa u otras innovaciones). Tampoco se detalla el proceso de entrenamiento: número de tokens, composición del corpus, fases de ajuste supervisado, RLHF o DPO. El repositorio únicamente declara que se trata de una cuantización del modelo Nanbeige/Nanbeige4.3-33B, con relación `quantized` respecto a él.

Lo que sí está documentado es el proceso de cuantización de esta publicación: un esquema de precisión mixta denominado GSQ-RCO (los tags del repositorio incluyen también `imatrix`), que asigna distinto número de bits por peso en función de la sensibilidad de cada tensor, en lugar de aplicar una tasa uniforme. Los archivos resultantes cubren el rango IQ1 a IQ4 del formato GGUF de llama.cpp y están pensados para preservar la fidelidad del modelo original con el menor coste de memoria posible. El autor no publica la metodología detallada ni los criterios de asignación de bits.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat soportada vía `-cnv` en llama-cli.
- Ventana de contexto de hasta 512K tokens, adecuada para documentos largos y conversaciones extensas.
- Soporte declarado de razonamiento (`reasoning` figura entre los tags del repositorio); el alcance concreto de ese modo no está documentado.
- Capacidades multilingües limitadas a inglés y chino según los metadatos; no se declara soporte de castellano.
- Servido como API compatible con OpenAI mediante `llama-server`, lo que habilita integración con clientes y SDK habituales.
- Compatibilidad con Ollama a través del identificador `hf.co/abenzerps/Nanbeige4.3-33B-GSQ-RCO-GGUF:IQ3_M`.
- Soporte de caché KV cuantizada (q4_0) para reducir el consumo de memoria en contextos largos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- **Análisis de documentación extensa en local**: gracias a la ventana de 512K tokens, el modelo puede recibir contratos, informes o bases de código completas en una sola pasada sin trocear el contenido, algo poco habitual en modelos desplegables en una GPU de consumo.
- **Asistente de código en estación de trabajo**: con la variante IQ3_M (15,24 GB) en una RTX 4090 o similar, se puede montar un servidor compatible con OpenAI en `localhost` y conectarlo a extensiones de editor, manteniendo el código del proyecto dentro de la máquina.
- **Procesamiento por lotes de corpus largos sin conexión**: el formato GGUF y la integración con llama.cpp permiten ejecutar tareas de resumen, extracción o clasificación sobre grandes volúmenes de texto en hardware propio, sin coste por token.
- **Prototipado de agentes con contexto acumulado**: sesiones de agentes que arrastran historial extenso pueden aprovechar la caché KV cuantizada para mantener 65K tokens activos en tarjetas de 12 GB, reduciendo el coste de reencolar contexto.
- **Asistente conversacional en chino o inglés**: para productos dirigidos a esos mercados, el modelo cubre ambos idiomas de forma nativa según los metadatos; no es adecuado para castellano sin una evaluación previa.
- **Despliegue en equipos con VRAM limitada**: la variante IQ1_M (8,28 GB) permite ejecutar un modelo de 33B en GPU de 12 GB o incluso en configuraciones con offload parcial a CPU, útil para entornos de desarrollo y demos.
- **Evaluación comparativa de cuantizaciones**: el repositorio ofrece ocho niveles del mismo modelo con bpw y tamaño documentados, lo que facilita estudiar la curva calidad/memoria en un caso real antes de fijar una variante para producción.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmarks (`assets/benchmark.png`), pero no acompaña cifras textuales de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. No se han publicado resultados de benchmarks numéricos en la información disponible, por lo que no se presentan tablas comparativas de rendimiento.

Tampoco se documentan métricas de latencia ni de throughput (tokens por segundo) para ninguna de las cuantizaciones.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin contexto): 8,28 GB con IQ1_M, 15,24 GB con IQ3_M (recomendada) y 18,01 GB con IQ4_XS. Añadir entre 1 y 3 GB adicionales para caché KV y buffers con contextos moderados (16K-32K).
- **Contexto largo en 12 GB de VRAM**: el autor documenta una configuración con IQ1_M, `-ngl 99`, `-fa`, `-b 2048`, `-c 65536` y caché KV en `q4_0` (`-ctk q4_0 -ctv q4_0`) que mantiene 65.536 tokens por debajo de 12 GB totales en GPU de consumo como RTX 3060 12GB o RTX 4070.
- **GPU recomendadas**: RTX 4090 / RTX 4080 (24 GB y 16 GB) para IQ3_M e IQ4_XS con contexto amplio; A100 40/80 GB y H100 para despliegues multiusuario con contextos muy largos; RTX 3060 12GB o RTX 4070 para IQ1_M e IQ2_XXS.
- **¿Cabe en GPU de consumo?** Sí: IQ1_M e IQ2_XXS caben en 12 GB; IQ3_M e IQ4_XS requieren 16-24 GB.
- **Opciones de despliegue**: llama.cpp (`llama-cli` para chat interactivo, `llama-server` para API compatible con OpenAI) y Ollama. Para vLLM, TGI u otros servidores de alto rendimiento no hay soporte documentado de estos GGUF en la información disponible; requerirían los pesos originales en safetensors.
- **Latencia y throughput**: no disponibles. Los valores dependerán del nivel de cuantización, del ancho de banda de memoria de la GPU y de la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-GSQ-RCO-GGUF (esta ficha) | 33,1B | 524.288 tokens | GGUF, 8 niveles IQ1-IQ4 (8,28-18,01 GB) | Apache-2.0 | HuggingFace vía abenzerps |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B | 524.288 tokens | safetensors (precisión completa) | Apache-2.0 | HuggingFace, repositorio oficial |
| Alternativas de ~30-35B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos comparables de la misma categoría (parámetros, contexto, benchmarks, licencia), por lo que no es posible establecer una comparación cuantitativa con alternativas externas. Respecto al modelo base, la diferencia es exclusivamente de empaquetado: mismos parámetros y misma ventana de contexto declarada, con pérdida de precisión asociada a la cuantización (creciente por debajo de 3 bpw) y una reducción de tamaño de aproximadamente 66 GB en precisión completa a 15,24 GB en IQ3_M.

## Limitaciones y advertencias

- **Idiomas**: solo inglés y chino según los metadatos. El rendimiento en castellano no está evaluado y previsiblemente será inferior; no se debe asumir paridad con modelos multilingües amplios.
- **Pérdida por cuantización**: las variantes IQ1_M e IQ2_XXS (2,00-2,25 bpw) degradan de forma notable la fidelidad respecto al modelo original. Para producción se recomienda IQ3_M o superior, y validar la tarea concreta antes de fijar el nivel.
- **Benchmarks no verificables**: la model card enlaza una imagen de resultados sin cifras textuales. No hay datos reproducibles de MMLU, HumanEval, GSM8K ni evaluaciones en castellano.
- **Riesgo de alucinación**: no se publican evaluaciones de factualidad ni de calibración. Como en cualquier modelo generativo, es necesario aplicar verificación y filtros en producción.
- **Contexto efectivo**: aunque se declaran 512K tokens, no se documenta el rendimiento de recuperación en el extremo de la ventana (needle-in-a-haystack, RULER). El contexto útil real para razonamiento sobre documentos largos puede ser inferior.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo LICENSE. La licencia de la cuantización replica la del modelo base, pero conviene verificar los términos del repositorio original antes de redistribuir.
- **Procedencia del artefacto**: el repositorio lo publica un usuario individual, no el equipo de Nanbeige. No hay garantía de mantenimiento, ni de que futuras revisiones del modelo base se recuanticen. Con 0 descargas y 15 likes en el momento de la consulta, la validación comunitaria es escasa.
- **Trazabilidad de la cuantización**: el método GSQ-RCO y los criterios de precisión mixta no están documentados; no es posible auditar qué tensores reciben menos bits.
- **Despliegue**: al ser GGUF, no se beneficia de optimizaciones de servidores de alto rendimiento (vLLM, TGI) ni de batching continuo maduro; para cargas multiusuario intensivas conviene evaluar los pesos originales.
- **Tamaño del repositorio**: 100,6 GB en total. Descargar un único archivo es posible, pero conviene verificar el espacio en disco antes de clonar.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/abenzerps/Nanbeige4.3-33B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Formulario de peticiones de modelos del autor: https://abenzerps.com/request-a-model/
- Imagen de benchmarks referenciada en la model card: https://huggingface.co/abenzerps/Nanbeige4.3-33B-GSQ-RCO-GGUF/resolve/main/assets/benchmark.png
- Licencia Apache-2.0: https://huggingface.co/abenzerps/Nanbeige4.3-33B-GSQ-RCO-GGUF/blob/main/LICENSE

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo; los enlaces anteriores proceden exclusivamente de la información de HuggingFace y de la model card. No se dispone de papers, blogs técnicos ni demos adicionales.
