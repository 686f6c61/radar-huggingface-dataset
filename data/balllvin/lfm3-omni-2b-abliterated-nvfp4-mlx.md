# balllvin/LFM3-Omni-2B-Abliterated-NVFP4-MLX

## Resumen

LFM3-Omni-2B-Abliterated-NVFP4-MLX es una distribucion cuantizada del modelo multimodal LFM3-Omni-2B, publicado por el usuario balllvin en Hugging Face. Se trata de una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante tecnicas de ablation de pesos) del modelo original de Liquid AI, convertida a formato MLX y cuantizada a 4 bits en NVFP4 para su ejecucion eficiente en hardware Apple Silicon. El pipeline declarado es `any-to-any`, lo que indica capacidades multimodales de entrada y salida.

El modelo cuenta con 2.166.928.384 parametros totales (aproximadamente 2,17 mil millones) y un repositorio de 2,9 GB, coherente con una cuantizacion de 4 bits. La licencia declarada es lfm1.0, con acceso restringido que requiere aceptar condiciones en Hugging Face. El unico idioma declarado en los metadatos es el ingles.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo omni multimodal de tamano compacto, una modificacion abliterated que altera el comportamiento de rechazo, y una cuantizacion NVFP4 especifica para MLX. Es un artefacto orientado a experimentacion local en Mac, no a despliegue en produccion estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm3_omni (arquitectura propietaria de Liquid AI, requiere `custom_code`); detalles internos no disponibles |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), formato MLX |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (acceso restringido, requiere aceptacion) |
| Formato de pesos | safetensors (MLX), con `custom_code` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original LFM3-Omni de Liquid AI. Los metadatos indican la etiqueta `lfm3_omni` y la presencia de `custom_code`, lo que implica que la implementacion requiere codigo personalizado para cargar y ejecutar el modelo, y que no es compatible con un transformer estandar sin ese codigo. El modelo es de tipo `any-to-any`, lo que sugiere entrada y salida multimodal (texto, imagen, audio u otras modalidades), aunque la composicion exacta no esta documentada en la informacion proporcionada.

Respecto al entrenamiento, no se dispone de datos sobre numero de tokens, composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La variante "abliterated" implica que se ha aplicado una tecnica de ablation sobre los pesos del modelo base para eliminar direcciones de rechazo, un procedimiento que modifica el comportamiento del modelo sin reentrenamiento completo. La cuantizacion NVFP4 es un formato de 4 bits con escalado por bloques, orientado a acelerar la inferencia en el framework MLX de Apple. No se dispone de informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento en ingles, segun los metadatos del modelo.
- Capacidades multimodales de tipo `any-to-any`, lo que implica procesamiento de multiples modalidades de entrada y salida (la composicion exacta no esta documentada).
- Comportamiento "abliterated": el modelo ha sido modificado para reducir o eliminar los rechazos ante ciertas solicitudes, lo que altera su comportamiento por defecto respecto al modelo original.
- Ejecucion en Apple Silicon mediante MLX, con pesos cuantizados a 4 bits NVFP4.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos declarados.
- Modo thinking, vision o audio explicitos: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion local en Mac: el modelo esta disenado para ejecutarse en hardware Apple Silicon mediante MLX, lo que permite probar un modelo omni multimodal de 2B en un portatil o Mac mini sin GPU dedicada, gracias a la cuantizacion NVFP4 de 4 bits.
- Investigacion sobre abliteration: util para estudiar como afecta la eliminacion de direcciones de rechazo al comportamiento de un modelo multimodal compacto, comparando respuestas con el modelo base original.
- Prototipado de aplicaciones any-to-any: permite construir demos rapidas de pipelines que combinan texto e imagen (u otras modalidades) en un entorno local, sin depender de APIs externas.
- Evaluacion de cuantizacion NVFP4: sirve como caso de estudio para medir la perdida de calidad y el ahorro de memoria de la cuantizacion de 4 bits en MLX frente a los pesos originales en precision completa.
- Desarrollo de asistentes conversacionales en ingles: al ser un modelo de 2B, puede gestionar conversaciones multi-turno en ingles con un coste computacional bajo, adecuado para pruebas de concepto.
- Analisis de sesgos y seguridad: la variante abliterated es util para auditar como cambia la tasa de rechazo y la calidad de las respuestas en escenarios sensibles, como parte de estudios de alineacion.
- Inferencia en dispositivos con memoria unificada limitada: con un repositorio de 2,9 GB, el modelo cabe en equipos con 8-16 GB de memoria unificada, lo que facilita su integracion en flujos de trabajo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 2,9 GB de pesos en disco; en memoria, la cuantizacion NVFP4 de 4 bits requiere del orden de 1,1-1,5 GB para los pesos, mas overhead de activaciones y del runtime MLX (estimacion basada en el tamano del repositorio y el numero de parametros; no confirmada por el autor).
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) con memoria unificada. No se ha documentado soporte para GPU NVIDIA o AMD con este formato.
- Cabe en GPU consumer: si, en equipos Apple con 8 GB o mas de memoria unificada, segun la estimacion anterior.
- Opciones de despliegue: MLX (framework nativo de Apple); no se ha documentado compatibilidad con vLLM, llama.cpp, Ollama o TGI para este formato NVFP4-MLX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Abliterated-NVFP4-MLX (este) | 2,17B | no disponible | MLX NVFP4 4-bit | lfm1.0 (gated) | Variante abliterated, solo MLX, solo ingles |
| LFM3-Omni-2B (original, Liquid AI) | ~2B | no disponible | safetensors | lfm1.0 | Modelo base sin abliteration; comportamiento de rechazo intacto |
| balllvin/LFM3-Omni-2B-abliterated | ~2B | no disponible | safetensors | lfm1.0 | Version abliterated sin cuantizar; mayor precision, mayor uso de memoria |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar las condiciones de la licencia lfm1.0 en Hugging Face antes de la descarga.
- Licencia lfm1.0: es una licencia "other" con posibles restricciones para uso comercial; debe revisarse el texto completo antes de cualquier despliegue en produccion.
- Solo ingles: los metadatos declaran unicamente el idioma `en`, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Modelo abliterated: la eliminacion de direcciones de rechazo puede aumentar el riesgo de generar contenido inapropiado, danoso o no alineado con politicas de seguridad. No es recomendable para aplicaciones orientadas al usuario final sin filtros adicionales.
- Riesgo de alucinacion: al ser un modelo de 2B, la tasa de alucinacion es previsiblemente mayor que en modelos de mayor tamano; no se han publicado evaluaciones al respecto.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de contexto largo.
- Dependencia de `custom_code`: la carga del modelo requiere codigo personalizado, lo que complica la integracion con herramientas estandar y aumenta el riesgo de incompatibilidades.
- Formato especifico de Apple: la cuantizacion NVFP4-MLX no es portable a otros ecosistemas sin reconversion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa del artefacto.
- Fecha de creacion futura (2026-11-14): los metadatos indican una fecha posterior a la actual, lo que sugiere que el artefacto podria ser reciente o que los metadatos no son fiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/LFM3-Omni-2B-Abliterated-NVFP4-MLX
- Modelo base (abliterated): https://huggingface.co/balllvin/LFM3-Omni-2B-abliterated
- Paper referenciado en los tags (arXiv:2212.04089): https://arxiv.org/abs/2212.04089
