# mradermacher/qwen2-vl-2b-abliterated-GGUF

## Resumen

El modelo `mradermacher/qwen2-vl-2b-abliterated-GGUF` es una versión cuantizada en formato GGUF del modelo multimodal `MahdiAlikhah/qwen2-vl-2b-abliterated`, que a su vez deriva de la familia Qwen2-VL-2B de Alibaba. Se trata de un modelo visión-lenguaje (VLM) de aproximadamente 1.540 millones de parámetros que combina un codificador visual con un decodificador de lenguaje tipo transformer, y que ha sido sometido a un proceso de *abliteration* (eliminación de direcciones de rechazo en el espacio de activaciones) para reducir los mecanismos de censura y rechazo de contenido.

La relevancia de esta ficha reside en que mradermacher publica cuantizaciones estáticas (y, por separado, cuantizaciones ponderadas/imatrix) de un modelo "uncensored" pensado para entornos de investigación sobre alineamiento, interpretabilidad y comportamiento de modelos sin restricciones. Al estar en GGUF, el modelo puede ejecutarse en hardware de consumo mediante llama.cpp u Ollama, algo poco habitual en modelos con capacidades de visión.

Conviene subrayar que los datos verificables disponibles son limitados: la model card original no incluye resultados de benchmarks, composición de dataset ni detalles del proceso de abliteration. Gran parte de las características técnicas heredadas (contexto, arquitectura interna) provienen del modelo base Qwen2-VL-2B y no están confirmadas explícitamente en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con codificador de visión (base Qwen2-VL); no confirmado en la model card del quant |
| Parametros totales | 1.543.714.304 (~1,54B), dato real de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2-VL-2B, no confirmada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen2-VL-2B, un VLM que combina un *Vision Transformer* con un decodificador de lenguaje autorregresivo de la serie Qwen2. La variante aquí presentada no aporta cambios de arquitectura: es una cuantización GGUF del modelo `MahdiAlikhah/qwen2-vl-2b-abliterated`, que a su vez aplica *abliteration* sobre Qwen2-VL-2B. El *abliteration* es una técnica de edición de pesos que identifica y neutraliza la dirección de activación asociada a la negativa a responder, de modo que el modelo reduce drásticamente sus rechazos ante determinadas peticiones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o similares en el modelo base. La model card únicamente indica que se trata de cuantizaciones estáticas generadas con `quantize_version: 2` y `convert_type: hf`, e incluye la etiqueta `heretic`, que hace referencia a la herramienta de abliteración automatizada del mismo nombre. Los suplementos `mmproj` son necesarios para habilitar la capacidad de visión en llama.cpp.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de imágenes (visión-lenguaje): el modelo requiere el fichero `mmproj` correspondiente para operar con entradas visuales.
- Descripción de imágenes y respuesta a preguntas sobre contenido visual (capacidad heredada del modelo base, no verificada con benchmarks en esta ficha).
- Comportamiento "uncensored": gracias al *abliteration*, reduce los rechazos ante peticiones que el modelo original declinaría.
- Ejecución local en CPU/GPU mediante llama.cpp y derivados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking": no disponible en la informacion proporcionada.
- Soporte multilingüe: limitado a inglés según la model card.

## Casos de uso

- Investigación sobre alineamiento y seguridad: permite estudiar cómo varía el comportamiento de un VLM tras aplicar *abliteration*, comparando respuestas con el modelo base sin modificar.
- Análisis de interpretabilidad de mecanismos de rechazo: al estar disponibles los pesos en GGUF y safetensors, se pueden inspeccionar activaciones y comparar con Qwen2-VL-2B-Instruct.
- Experimentación local con visión-lenguaje: en equipos sin GPU de datacenter, permite probar pipelines de captioning o VQA cargando el quant Q4_K_M junto con el `mmproj-Q8_0`.
- Prototipado de asistentes sobre imágenes en inglés: por ejemplo, generación de descripciones o extracción de información de capturas y diagramas en entornos controlados.
- Evaluación de cuantizaciones: el repositorio ofrece desde Q2_K hasta f16, lo que facilita medir el impacto de la cuantización en tareas multimodales.
- Docencia y demos offline: al caber en GPU de consumo, sirve para talleres sobre modelos multimodales sin depender de APIs externas.
- Generación de contenido sin filtros en investigación de sesgos: útil para estudiar cómo un modelo sin alineamiento de seguridad responde a estímulos ambiguos (siempre en un marco ético y legal).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin KV cache):
  - Q2_K: ~0,8 GB.
  - Q4_K_S / Q4_K_M: ~1,0-1,1 GB.
  - Q5_K_S / Q5_K_M: ~1,2 GB.
  - Q6_K: ~1,4 GB.
  - Q8_0: ~1,7 GB.
  - f16: ~3,2 GB.
  - Suplemento multimodal `mmproj-Q8_0`: ~0,8 GB adicionales; `mmproj-f16`: ~1,4 GB.
- GPUs recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente para los quants bajos; para f16 con visión conviene disponer de 6-8 GB. En datacenter, A100/H100 no aportan ventaja significativa a este tamaño salvo por throughput agregado.
- Cabe en GPU de consumo: sí, holgadamente, incluso en iGPU con memoria unificada si se usa Q2_K o Q4_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (variantes GGUF). vLLM y TGI no consumen GGUF directamente; para ellos habría que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| qwen2-vl-2b-abliterated-GGUF (este) | ~1,54B | No disponible | Si (con mmproj) | apache-2.0 | GGUF, sin alineamiento de rechazo |
| MahdiAlikhah/qwen2-vl-2b-abliterated | ~1,54B | No disponible | Si | apache-2.0 | Modelo base en safetensors |
| Qwen2-VL-2B-Instruct (original) | ~1,54B | 32.768 tokens (dato del modelo original, no confirmado aquí) | Si | apache-2.0 | Con alineamiento de seguridad intacto |
| Otros VLM pequeños (SmolVLM, moondream, etc.) | No disponible | No disponible | Si | No disponible | Datos no verificados en esta busqueda |

La comparación cuantitativa de rendimiento entre estos modelos no puede realizarse porque no se han publicado métricas para la variante abliterada.

## Limitaciones y advertencias

- Riesgo de alucinación: típico de modelos de ~1,5B, especialmente en tareas de razonamiento y en VQA con imágenes complejas.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Sesgos: al eliminar las direcciones de rechazo, el modelo puede reproducir con mayor facilidad contenido sesgado, ofensivo o dañino presente en los datos de entrenamiento originales.
- *Abliteration*: puede degradar la coherencia general, aumentar la verbosidad y reducir la fiabilidad en tareas que dependen del alineamiento previo.
- Licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar la licencia del modelo base Qwen2-VL por si añade condiciones adicionales.
- Producción: no usar sin filtros de seguridad externos en aplicaciones expuestas a usuarios; la ausencia de benchmarks impide estimar la calidad real de las cuantizaciones bajas (Q2_K, Q3_K_S).
- Visión: sin el fichero `mmproj` correspondiente, el modelo no procesa imágenes; hay que emparejar la cuantización del `mmproj` con la del modelo.
- Compatibilidad: los GGUF no son directamente utilizables en vLLM o TGI; requieren llama.cpp u Ollama.

## Enlaces

- Repositorio HuggingFace del quant: https://huggingface.co/mradermacher/qwen2-vl-2b-abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/MahdiAlikhah/qwen2-vl-2b-abliterated
- Cuantizaciones ponderadas/imatrix del mismo modelo: https://huggingface.co/mradermacher/qwen2-vl-2b-abliterated-i1-GGUF
- Página de resumen de descargas: https://hf.tst.eu/model#qwen2-vl-2b-abliterated-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo original Qwen2-VL-2B (familia base): https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
