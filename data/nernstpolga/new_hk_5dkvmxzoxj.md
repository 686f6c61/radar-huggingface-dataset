# nernstpolga/new_hk_5dkvmxzoxj

## Resumen

El modelo `nernstpolga/new_hk_5dkvmxzoxj` es un modelo de lenguaje multimodal de 35.107 millones de parámetros desarrollado por el autor `nernstpolga`, basado en el modelo `vera6/affine-5g4yy75zuz-t6` y fine-tuneado con técnicas de DPO offline. La arquitectura declarada en los tags es `qwen3_5_moe`, lo que indica una mezcla de expertos (MoE) dentro de la familia Qwen 3.5, con capacidad de procesamiento de texto e imágenes (image-text-to-text). El modelo está pensado para generación de texto conversacional y razonamiento, con tags que sugieren un modo de razonamiento ("reason-v4") y compatibilidad con endpoints de despliegue.

Aunque el repositorio es reciente (creado en agosto de 2026) y no registra descargas ni likes, su licencia Apache 2.0 permite uso comercial sin restricciones. El acceso es restringido (gated), por lo que los usuarios deben aceptar condiciones en HuggingFace antes de descargarlo. El tamaño del repositorio es de 70.2 GB, lo que sugiere que los pesos se distribuyen en formato safetensors (el único formato declarado en los tags). La información disponible no especifica la longitud de contexto, los parámetros activos ni los idiomas soportados, por lo que estos datos se indican como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE, multimodal texto-imagen) |
| Parametros totales | 35.107.193.936 (35.1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) de la familia Qwen3.5, tal y como indica el tag `qwen3_5_moe`. No se han publicado detalles sobre el número de expertos, el tamaño de los parámetros activos ni la topología del router. El modelo es multimodal (image-text-to-text), lo que implica que incorpora un codificador visual y un proyector para procesar imágenes junto con texto. El entrenamiento se realizó en dos fases: una base inicial (`vera6/affine-5g4yy75zuz-tg`) y un fine-tuning posterior con DPO offline (tag `offline-dpo`), que optimiza preferencias humanas sin necesidad de interacción en línea. Los tags `sn120`, `r959` y `reason-v4` sugieren que el modelo incluye un modo de razonamiento explícito, probablemente mediante cadenas de pensamiento (CoT) o un modo "thinking" similar al de otros modelos de la familia Qwen. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional y continuidad de texto.
- Razonamiento multi-paso (tag `reason-v4`), probablemente con modo de pensamiento interno.
- Procesamiento de imágenes y texto (image-text-to-text), lo que permite entender y responder a imágenes combinadas con texto.
- Entrenamiento con DPO offline, lo que sugiere una alineación con preferencias humanas.
- Compatibilidad con endpoints de despliegue (tag `endpoints_compatible`).
- Soporte de tool calling y function calling no confirmado explícitamente en la información disponible.

## Casos de uso

- **Asistentes conversacionales multimodales**: el modelo puede mantener diálogos de texto y responder preguntas sobre imágenes, útil para aplicaciones de atención al cliente que reciben capturas de pantalla o fotos.
- **Análisis de documentos técnicos**: al combinar texto e imagen, puede extraer información de diagramas, gráficos o esquemas en informes.
- **Generación de descripciones de productos**: dado un catálogo con imágenes, puede generar descripciones de texto coherentes para tiendas online.
- **Razonamiento de preguntas complejas**: el modo de razonamiento (reason-v4) permite desglosar problemas en pasos intermedios, útil en educación o en soporte técnico de nivel avanzado.
- **Preparación de datos de entrenamiento**: por su capacidad de generar texto y razonar, puede usarse para crear datasets sintéticos de QA o de razonamiento.
- **Prototipado de agentes multimodales**: al ser compatible con endpoints y de tipo text-generation, se puede integrar en pipelines de agentes que combinan visión y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Con 35.1B parámetros en fp16, se estima un consumo de alrededor de 70 GB de VRAM (sin cuantización), lo que requiere una GPU profesional (A100 80GB, H100 80GB) o múltiples GPUs.
- **GPU recomendadas**: A100 80GB, H100 80GB, o 2x RTX 4090 (24GB) con sharding. En consumer, solo es viable con cuantización de 4 bits (no publicada) o con descarga a CPU.
- **Opciones de despliegue**: transformers (librería declarada), posiblemente vLLM o TGI si se adapta al formato safetensors, aunque no se confirma en la información.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| `nernstpolga/new_hk_5dkvmxzoxj` | 35.1B | MoE (Qwen3.5) | no disponible | Apache 2.0 | Sí (imagen-texto) |
| Qwen2-VL-7B | 7B | Dense | 32k | Apache 2.0 | Sí |
| Qwen2.5-VL-72B | 72B | Dense | 32k | Apache 2.0 | Sí |
| Llama-3.2-11B-Vision | 11B | Dense | 128k | Llama 3.2 Community | Sí |

La comparación con modelos de la misma categoría (MoE multimodal) es limitada porque no se dispone de datos públicos de este modelo. No se pueden comparar parámetros activos ni rendimiento sin benchmarks.

## Limitaciones y advertencias

- **Datos de entrenamiento desconocidos**: no se publica información sobre el dataset, lo que implica riesgo de sesgos no documentados y de alucinaciones en dominios específicos.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- **Contexto limitado desconocido**: sin conocer la longitud de contexto, no se puede garantizar el manejo de documentos largos o conversaciones extensas.
- **Idiomas no especificados**: no se declara qué idiomas soporta; es posible que el rendimiento en español sea inferior al inglés si el entrenamiento fue mayoritariamente en inglés.
- **Licencia Apache 2.0**: permite uso comercial, pero hay que citar la atribución y no se puede usar para reclamar patentes sobre el modelo.
- **Acceso restringido**: al ser un modelo gated, hay que aceptar las condiciones de HuggingFace; esto puede limitar su uso en entornos corporativos con políticas de acceso.
- **Sin cuantizaciones publicadas**: no se ofrecen versiones GGUF o AWQ, lo que dificulta el despliegue en hardware de consumo.

## Enlaces

- [HuggingFace: nernstpolga/new_hk_5dkvmxzoxj](https://huggingface.co/nernstpolga/new_hk_5dkvmxzoxj)
- Modelo base: [vera6/affine-5g4yyguz-t6](https://huggingface.co/vera6/affine-5g4yyguz-t6) (no se ha encontrado el enlace directo en la información)
- No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.

---

**Nota**: Este modelo está en fase muy temprana (0 descargas, 0 likes) y la información técnica disponible es escasa. Se recomienda validar el comportamiento real en un entorno de prueba antes de considerarlo para producción.
