# piquolo/potassium-keyless-executor

## Resumen

`piquolo/potassium-keyless-executor` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. La model card publicada por el autor describe un ejecutable para Windows 10/11 de 64 bits (`potassium-keyless-executor-v1.2.0-win64.exe`, compilación `v2.2.4`, 8,9 MB) distribuido a través de un ZIP alojado en un repositorio de GitHub de terceros, protegido con contraseña y que requiere ejecutarse como administrador. No se declara arquitectura de red neuronal, parámetros, tokenizador ni pesos en ningún formato.

El contenido de la model card corresponde a la categoría de utilidades de tipo *executor*/*script hub* (menciona sUNC, `hookmetamethod`, `getgc`, Drawing API, inyección de scripts y multi-instancia), un tipo de software habitualmente asociado a la modificación de clientes de videojuegos. Los tags del repositorio (`windows`, `x64`, `portable`, `en`, `ru`, `zh`...) son etiquetas de sistema operativo e idioma, no de capacidades lingüísticas de un modelo.

Desde la perspectiva de evaluación de modelos, este repositorio no es utilizable como modelo de IA: no hay pipeline declarado, no hay código de inferencia, no hay pesos y el binario se distribuye fuera de Hugging Face con instrucciones que incluyen desactivar protecciones del sistema (ejecución como administrador) y una contraseña de extracción. Se recomienda tratarlo como un artefacto no verificado y potencialmente malicioso, no como un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | etiquetados: en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de repositorio, sin validación de capacidades lingüísticas) |
| Licencia | MIT (declarada en la model card y en los tags) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows, 8,9 MB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF, DPO u otros). El contenido de la model card describe subsistemas de un ejecutable de Windows: sincronización de offsets tras parches del cliente, flujo de ejecución *keyless*, compatibilidad declarada del «98 %+ sUNC» con `hookmetamethod`, `getgc` y Drawing API, un *script hub* integrado, directorio de auto-ejecución y adjuntado multi-instancia. Estos términos no corresponden a componentes de un transformer ni a técnicas de entrenamiento.

No hay innovación técnica en el ámbito de IA que destacar: no se documentan mecanismos de atención, decodificación especulativa, atención lineal ni arquitecturas híbridas. El repositorio no incluye `config.json`, `tokenizer.json`, ficheros `safetensors` ni `GGUF`.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe real; los idiomas listados son etiquetas del repositorio.
- El artefacto descrito en la model card es un ejecutable de Windows con supuestas funciones de inyección de scripts, *script hub* y multi-instancia, sin relación con inferencia de modelos.

## Casos de uso

- No procede: el repositorio no contiene un modelo de IA y no permite inferencia de texto, código ni multimodal.
- Evaluación de modelos: no aplicable, al no existir pesos ni pipeline declarado.
- Integración en pipelines de IA: no aplicable, al no existir API de modelo ni servidor de inferencia.
- Despliegue en producción: no recomendado; el binario se distribuye fuera de Hugging Face, con contraseña y ejecución como administrador.
- Investigación en seguridad: el repositorio podría analizarse como muestra de *malware* o de distribución de software no verificado, siempre en un entorno aislado y con las precauciones habituales de análisis.
- Formación y concienciación: puede usarse como ejemplo de model card fraudulenta que imita el formato de un repositorio de modelos para distribuir un ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos, porque el repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay modelo).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles.
- Requisitos del artefacto descrito: Windows 10/11 de 64 bits, ejecución como administrador y extracción de un ZIP de 8,9 MB protegido con contraseña, según la model card.

## Comparativa con modelos similares

| Criterio | `piquolo/potassium-keyless-executor` | Modelo de IA open source típico (p. ej. familia Llama, Qwen, Mistral) |
|---|---|---|
| Naturaleza | Ejecutable de Windows empaquetado como repositorio | Pesos de red neuronal |
| Parámetros | no disponible | Publicados en la model card |
| Contexto | no disponible | Publicado (p. ej. 8K-128K tokens) |
| Pesos en el repositorio | No | Sí (`safetensors`, `GGUF`) |
| Pipeline declarado | No | `text-generation`, `image-text-to-text`, etc. |
| Evaluación reproducible | No | Benchmarks publicados |
| Licencia | MIT (declarada) | MIT, Apache 2.0, licencias comunitarias, etc. |
| Riesgo de seguridad | Alto (binario externo, contraseña, admin) | Bajo si se descarga de fuentes oficiales |

No se identifica ningún modelo comparable en la misma categoría, porque la categoría «modelo de IA» no aplica a este repositorio.

## Limitaciones y advertencias

- No es un modelo de IA: no hay pesos, tokenizador, configuración ni código de inferencia.
- La model card incluye enlaces de descarga a un repositorio de GitHub de terceros (`yuiberg281/potassium-keyless-executor`), no a artefactos alojados en Hugging Face.
- El binario se distribuye en un ZIP protegido con contraseña (`2026`) y las instrucciones indican ejecutarlo como administrador, lo que reduce las protecciones del sistema.
- Los términos de la model card (*executor*, sUNC, `hookmetamethod`, `getgc`, Drawing API, inyección de scripts, multi-instancia) son propios de herramientas de modificación de clientes de videojuegos, no de modelos de lenguaje.
- Riesgo elevado de *malware* o de software no verificado; no debe ejecutarse en sistemas de producción ni en máquinas con datos sensibles.
- La licencia MIT declarada no garantiza la legitimidad ni la seguridad del contenido distribuido.
- Cero descargas y cero *likes* en el momento de la consulta, sin historial que permita validar el artefacto.
- No apto para uso comercial, investigación reproducible ni evaluación comparativa de capacidades de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/piquolo/potassium-keyless-executor
- Repositorio de GitHub referenciado en la model card: https://github.com/yuiberg281/potassium-keyless-executor
- Releases del repositorio referenciado: https://github.com/yuiberg281/potassium-keyless-executor/releases/latest
- Descarga directa citada en la model card (no verificar ni ejecutar sin análisis previo): https://github.com/yuiberg281/potassium-keyless-executor/releases/latest/download/potassium-keyless-executor-v1.2.0-win64.zip
