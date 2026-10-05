# jessedye90/qwen3.8-27b-swift-uncensored

## Resumen

`jessedye90/qwen3.8-27b-swift-uncensored` es un modelo multimodal de tipo image-text-to-text publicado por el usuario jessedye90 en HuggingFace, derivado mediante fine-tuning del modelo `jessedye90/Swift-1.5-Qwen3.8-27B-NVFP4`. Por las etiquetas del repositorio (`qwen3_5`, `qwen3_8`, `image-text-to-text`) se trata de un transformer basado en la familia Qwen3.5/Qwen3.8 con torre de visión, ajustado para conversación y con las direcciones de rechazo eliminadas (`abliterated`, `uncensored`).

El dato más relevante es la discrepancia entre el nombre comercial y el contenido real: pese a llamarse "27b", los pesos en safetensors suman 18.164.649.200 parámetros, es decir, unos 18,16 mil millones. El repositorio ocupa 21,1 GB, lo que es coherente con un almacenamiento en precisión de 8 bits (NVFP4/FP8), orientado a hardware Blackwell y DGX Spark según las etiquetas.

Es relevante ahora mismo como ejemplo de la ola de derivados "sin censura" y cuantizados de modelos multimodales de gama media, pensados para despliegue en una sola GPU. Conviene señalar que el acceso está restringido (gated), que no acumula descargas ni valoraciones, y que no hay información pública sobre dataset de entrenamiento, contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (familia Qwen3.5/Qwen3.8, segun etiquetas); detalle de capas no disponible |
| Parametros totales | 18.164.649.200 (~18,16 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (etiqueta `8-bit`), NVFP4 y FP8 (etiquetas `nvfp4`, `fp8`, `modelopt`) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (categoria `other` en HuggingFace) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de capas, la dimension del modelo ni el mecanismo de atencion. Las etiquetas del repositorio (`qwen3_5`, `qwen3_8`) apuntan a la familia Qwen3.5/Qwen3.8 y la pipeline declarada es `image-text-to-text`, lo que implica un codificador de vision acoplado a un decodificador de lenguaje. La etiqueta `conversational` indica un ajuste orientado a dialogo.

Respecto al entrenamiento, la unica referencia disponible es el modelo base `jessedye90/Swift-1.5-Qwen3.8-27B-NVFP4`, sobre el que se habria aplicado un fine-tuning. Las etiquetas `abliterated` y `uncensored` sugieren una modificacion de los pesos para suprimir la direccion de rechazo, una tecnica habitual que elimina la capa de alineacion de seguridad sin reentrenamiento completo. No hay datos publicos sobre numero de tokens, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales. La cadena de cuantizacion (`modelopt`, `sglang`, `dflash2`, `dgx-spark`, `blackwell`) indica que el modelo esta preparado para inferencia optimizada en hardware NVIDIA Blackwell con NVFP4/FP8.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Procesamiento de imagenes junto con texto (pipeline `image-text-to-text`), es decir, entrada multimodal con salida de texto.
- Generacion sin filtros de rechazo (abliterated/uncensored), lo que amplia el rango de peticiones que el modelo atendera.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito o "thinking mode": no disponible.
- Capacidades de audio: no disponibles.
- Cobertura multilingue: no disponible.

## Casos de uso

- Descripcion y analisis de imagenes en lotes: al aceptar pares imagen-texto, puede emplearse para generar pies de foto, etiquetado de catalogos o extraccion de informacion de capturas y documentos escaneados en un pipeline automatizado.
- Asistente conversacional sin restricciones tematicas: util en entornos de investigacion sobre seguridad de modelos, red teaming y evaluacion de comportamientos, donde se necesita un modelo que no rechace peticiones por defecto.
- Generacion de narrativa y contenido creativo para adultos: el ajuste sin censura permite abordar generos y tematicas que los modelos alineados suelen bloquear, con supervision editorial humana.
- Analisis de documentos tecnicos con figuras: combinando texto e imagen, puede resumir informes con graficos, diagramas o tablas renderizadas como imagen.
- Prototipado rapido en una sola GPU: con ~18 GB de pesos en 8 bits, es viable desplegarlo en una estacion de trabajo con una GPU de 24 GB o en un DGX Spark, lo que facilita experimentacion local sin clúster.
- Evaluacion comparativa de tecnicas de abliteration: sirve como sujeto de estudio para medir como la eliminacion de la direccion de rechazo afecta a la calidad general, la coherencia y la utilidad en tareas benignas.
- Base para fine-tuning especifico de dominio: al ser un modelo de 18B con pesos en safetensors, se puede reajustar con LoRA sobre datos propios en hardware de gama alta de consumo o profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros: 18,16 mil millones. En 8 bits (formato del repositorio, 21,1 GB de repo) ocupan aproximadamente 18-21 GB.
- VRAM estimada en BF16/FP16: en torno a 36 GB solo para pesos, mas cache KV y activaciones.
- VRAM estimada en 8 bits (NVFP4/FP8): aproximadamente 18-22 GB para pesos, con margen adicional para cache KV segun longitud de contexto y tamano de lote.
- VRAM estimada en 4 bits: alrededor de 10-12 GB de pesos, si se generan cuantizaciones GGUF/AWQ propias (no se ofrecen en el repositorio).
- GPU recomendadas: NVIDIA Blackwell (B200, GB200, DGX Spark) por el soporte nativo de NVFP4; tambien A100 40/80 GB y H100 80 GB para FP8.
- Cabe en GPU de consumo: si, en RTX 4090 / RTX 3090 (24 GB) usando la version de 8 bits con contexto moderado; en GPUs de 12-16 GB solo con cuantizacion a 4 bits generada por el usuario.
- Opciones de despliegue: transformers (libreria declarada), SGLang (etiqueta `sglang`), vLLM y TensorRT-LLM para FP8/NVFP4. No se declara soporte de GGUF, por lo que llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3.8-27b-swift-uncensored | ~18,16 B | no disponible | swift-open-license-1.0 | Gated en HuggingFace | Version abliterated y cuantizada a 8 bits |
| Swift-1.5-Qwen3.8-27B-NVFP4 (modelo base) | no disponible | no disponible | no disponible | HuggingFace | Origen del fine-tuning; sin ablacion declarada |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de descargar los pesos.
- Alucinacion: no hay evaluaciones publicadas de fidelidad factual; en un modelo abliterated la tasa de invencion puede aumentar al perder parte del ajuste de alineacion.
- Seguridad: al eliminar los mecanismos de rechazo, el modelo puede generar contenido danino, ilegal o gravemente ofensivo. Requiere moderacion externa obligatoria en cualquier despliegue con usuarios finales.
- Licencia: la licencia `swift-open-license-1.0` esta catalogada como `other` en HuggingFace. No se dispone del texto ni de la confirmacion de que permita uso comercial; hay que revisarla antes de integrarlo en un producto.
- Discrepancia de nomenclatura: el nombre indica 27B pero los pesos reales son 18,16B. Cualquier calculo de VRAM o coste basado en el nombre sera incorrecto.
- Idiomas: se desconoce la cobertura linguistica real, incluido el castellano.
- Contexto: se desconoce la ventana maxima; no se debe asumir un valor alto en produccion.
- Trazabilidad: 0 descargas y 0 valoraciones en el momento de la consulta, sin model card detallada, lo que impide verificar el proceso de entrenamiento o la procedencia de los datos.
- Compatibilidad: al no publicarse GGUF, el uso en entornos de CPU o GPU de gama baja exige conversion manual y verificacion de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jessedye90/qwen3.8-27b-swift-uncensored
- Modelo base: https://huggingface.co/jessedye90/Swift-1.5-Qwen3.8-27B-NVFP4
- Paper, blog o repositorio adicional: no disponible
