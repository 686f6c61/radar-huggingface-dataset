# AXEL66666/dms-qwen3vl-4b-fp8-scaled

## Resumen

`dms-qwen3vl-4b-fp8-scaled` es un repositorio publicado en Hugging Face por el usuario AXEL66666 dentro del proyecto Drakula Media Studio (DMS). No se trata de un modelo entrenado por el autor, sino de un *bundle* de artefactos: un fichero de pesos (`5242467968` bytes, aproximadamente 5,2 GB) etiquetado como "text encoder" y asociado por nombre a la familia Qwen3-VL de 4B parámetros en formato FP8 con escalado. El repositorio no incluye model card técnica, pipeline declarado, idiomas soportados ni licencia definida.

La relevancia de esta ficha es limitada y fundamentalmente de advertencia: el repositorio no documenta el proceso de conversión a FP8, no indica qué herramienta se usó para el escalado de cuantización, no publica benchmarks ni especifica la licencia del modelo subyacente. La model card remite explícitamente a la documentación del proyecto *upstream* (Qwen3-VL) antes de cualquier uso en producción o redistribución.

Dado que la información disponible es mínima, la mayor parte de los campos técnicos se marcan como "no disponible". Cualquier evaluación seria de este artefacto debería contrastarse con la ficha oficial de Qwen3-VL-4B en Hugging Face y con los ficheros de configuración (`config.json`, `quantization_config`) que el repositorio no expone en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer multimodal de la familia Qwen3-VL, sin confirmar) |
| Parametros totales | no disponible (el nombre sugiere ~4B, sin confirmar) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 con escalado (según el nombre del repositorio); no se detalla el esquema de escalado |
| Idiomas soportados | no disponible |
| Licencia | unknown (declarada como `UNKNOWN` en la model card) |
| Formato de pesos | no disponible (un único fichero de payload de 5.242.467.968 bytes; la extensión no se especifica) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens procesados ni las etapas de alineación (RLHF, DPO u otras). El nombre del repositorio apunta a la familia Qwen3-VL, un modelo multimodal de Alibaba, pero el bundle no documenta qué variante concreta se ha empaquetado, ni el proceso de conversión a FP8, ni la herramienta de cuantización empleada (por ejemplo, `llm-compressor`, `compressed-tensors` o similar).

La única información técnica explícita es el tamaño del payload (5,2 GB) y su clasificación como "text encoder" dentro del proyecto DMS. No se indica si el fichero contiene solo el *text encoder* de un pipeline multimodal o el modelo completo, ni si los pesos corresponden a un checkpoint oficial o a una modificación local. La model card remite a `DMS-MODEL-NOTES.md` para la procedencia, pero ese fichero no se incluye en la información disponible.

## Capacidades

- No se documentan capacidades específicas en el repositorio.
- Por el nombre (`qwen3vl`), cabría esperar capacidades multimodales (visión-lenguaje) y de generación de texto, pero no se confirman en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

Dada la ausencia de documentación, los casos de uso solo pueden plantearse de forma condicional, sujetos a verificación contra el modelo upstream:

- Integración como *text encoder* en pipelines de generación multimodal dentro del proyecto DMS: el bundle se etiqueta explícitamente como "text encoder", por lo que su uso previsto sería el de componente de codificación de texto en un sistema mayor, no como modelo de chat autónomo.
- Despliegue en entornos con memoria limitada: el formato FP8 reduce el peso del checkpoint a ~5,2 GB, lo que permitiría cargarlo en GPUs de 8-12 GB si el modelo subyacente y el runtime lo soportan, aunque esto no está verificado.
- Experimentación interna en Drakula Media Studio: el repositorio parece un artefacto de uso interno del proyecto, no un modelo pensado para consumo externo.
- Evaluación comparativa frente al Qwen3-VL-4B original en BF16: útil para medir la degradación introducida por la cuantización FP8, siempre que se disponga de la configuración de escalado.
- Reproducción de pipelines de cuantización: el bundle podría servir como referencia de conversión FP8, aunque la falta de documentación del proceso lo hace poco útil para este fin.
- Uso educativo sobre empaquetado de modelos: sirve como ejemplo de *model bundle* con metadatos mínimos y licencia indefinida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,2 GB solo para los pesos en FP8; habría que sumar la memoria de activaciones y del contexto, no cuantificada en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, podría intentarse en GPUs consumer con 8-12 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070), pero no hay confirmación de compatibilidad ni de runtime.
- ¿Cabe en GPU consumer? Probablemente sí en términos de pesos, pero no verificado.
- Opciones de despliegue: no disponible. No se indica si el fichero es compatible con vLLM, llama.cpp, Ollama o TGI; FP8 con escalado suele requerir runtimes específicos (por ejemplo, vLLM con `compressed-tensors`), pero no se confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `dms-qwen3vl-4b-fp8-scaled` | no disponible (~4B por nombre) | no disponible | unknown | Hugging Face (0 descargas, 0 likes) |
| Qwen3-VL-4B (upstream oficial) | ~4B | no disponible en esta ficha | según Qwen (no verificada aquí) | Hugging Face oficial |
| Otros bundles FP8 de la familia Qwen3-VL | variable | variable | variable | Hugging Face (comunidad) |

No se dispone de datos de rendimiento ni de licencia verificada para establecer una comparación cuantitativa fiable. La comparación más relevante es contra el checkpoint oficial de Qwen3-VL-4B, que sí incluye model card, licencia y benchmarks; este bundle no aporta esa información.

## Limitaciones y advertencias

- Licencia `unknown`: no se puede asumir uso comercial permitido; la model card remite a la licencia del proyecto upstream, que no se especifica.
- Ausencia total de model card técnica: sin arquitectura, contexto, idiomas ni benchmarks.
- Procedencia no verificada: los pesos provienen de "local DMS/Drakula model stores" según la model card; no hay verificación de integridad ni comparación con el checkpoint oficial.
- Riesgo de degradación por cuantización FP8 no documentada: sin información sobre el esquema de escalado, no se puede estimar la pérdida de calidad.
- Riesgo de alucinación: no evaluable sin benchmarks ni pruebas.
- Posibles sesgos: no documentados.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que se detecten y corrijan problemas.
- Fecha de creación anómala (`2026-11-20`) en los metadatos de Hugging Face, lo que sugiere posibles inconsistencias en el registro del repositorio.
- No apto para producción sin auditoría previa del fichero de pesos y de la licencia upstream.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXEL66666/dms-qwen3vl-4b-fp8-scaled
- Proyecto Drakula Media Studio: no disponible (no se proporciona URL)
- Fichero `DMS-MODEL-NOTES.md` referenciado en la model card: no disponible en la información proporcionada
- Documentación oficial de Qwen3-VL: no disponible en la información proporcionada
