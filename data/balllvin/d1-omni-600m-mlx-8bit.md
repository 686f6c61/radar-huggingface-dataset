# balllvin/d1-omni-600M-MLX-8bit

## Resumen

`balllvin/d1-omni-600M-MLX-8bit` es una cuantizacion a 8 bits en formato MLX del modelo `LiquidAI/d1-omni-600M`, publicado por el usuario balllvin. Se trata de un derivado, no de un modelo original: el trabajo consiste en convertir los pesos del modelo base de Liquid AI a un formato optimizado para inferencia en Apple Silicon mediante la libreria MLX. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base es multimodal (acepta imagen y texto como entrada).

El modelo base pertenece a la familia d1-omni de Liquid AI, una linea de modelos descritos en los tags como "decision" y "liquid", lo que sugiere el uso de arquitecturas de tipo Liquid Neural Network o variantes hibridas orientadas a toma de decisiones y extraccion de caracteristicas. Con 587.161.089 parametros reales (unos 587M), se situa en el rango de modelos pequenos, aptos para despliegue en hardware de consumo.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, esta restringido (gated) y su licencia es `lfm1.0` (Liquid Foundation Model License), heredada del modelo base. Es util para quien quiera ejecutar el modelo en Mac con MLX sin tener que realizar la conversion, pero no constituye un modelo nuevo ni aporta mejoras de rendimiento verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/d1-omni-600M; tags indican "liquid" y "d1_omni") |
| Parametros totales | 587.161.089 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (esta version); el modelo base admite otras conversiones no documentadas aqui |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (Liquid Foundation Model License) |
| Formato de pesos | safetensors (MLX) y GGUF (segun tags) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. Los tags del repositorio incluyen `d1_omni`, `decision`, `liquid` y `custom_code`, lo que apunta a una arquitectura propietaria de Liquid AI con codigo personalizado (no un transformer estandar de Hugging Face), probablemente basada en capas de estado continuo o mecanismos lineales propios de la linea "liquid". El pipeline `image-text-to-text` confirma la naturaleza multimodal del modelo base.

Tampoco se documentan en esta ficha los datos de entrenamiento del modelo base: numero de tokens, composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Esta version concreta es unicamente una cuantizacion post-entrenamiento a 8 bits en MLX, por lo que no introduce cambios en el entrenamiento, solo en la precision numerica de los pesos. El tag `custom_code` implica que la carga del modelo requiere `trust_remote_code=True` y depende de la implementacion incluida en el repositorio.

## Capacidades

- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`).
- Extraccion de caracteristicas (`feature-extraction` segun tags).
- Orientacion a tareas de decision (`decision-model` segun tags).
- Generacion de texto en ingles.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas.
- Capacidades especiales (modo thinking, audio, vision extendida): vision confirmada por el pipeline; el resto no disponible.

## Casos de uso

- Clasificacion y decision sobre imagenes: el modelo puede recibir una imagen y texto asociado y producir una salida orientada a decision, aprovechando su naturaleza `decision-model` para tareas de filtrado o enrutamiento.
- Extraccion de embeddings multimodales: gracias al tag `feature-extraction`, puede emplearse para generar representaciones de pares imagen-texto en sistemas de busqueda o recuperacion.
- Prototipado en Mac con MLX: al estar cuantizado a 8 bits y en formato MLX, permite experimentar localmente en Apple Silicon sin infraestructura GPU dedicada.
- Integracion en pipelines de llama.cpp: el tag GGUF sugiere que existe una variante compatible con llama.cpp, util para despliegue en CPU o entornos mixtos.
- Descripcion automatica de imagenes en ingles: el pipeline image-text-to-text permite generar texto a partir de imagenes para catalogacion o accesibilidad en entornos angloparlantes.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de una conversion a 8 bits frente al modelo base de Liquid AI en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 587M parametros en 8 bits, los pesos ocupan aproximadamente 0,6 GB; sumando overhead de activaciones y cache, el consumo realista se situa en torno a 1-2 GB de memoria unificada.
- GPU recomendadas: al ser formato MLX, esta pensado para Apple Silicon (series M1, M2, M3, M4); en CUDA requeriria conversion a otro formato.
- Cabe en GPU de consumo: si, en cualquier Mac con chip Apple Silicon con 8 GB o mas de memoria unificada; en GPU NVIDIA consumer requeriria el modelo base o una conversion.
- Opciones de despliegue: MLX (libreria nativa), `mlx-vlm` (segun tags), llama.cpp mediante la variante GGUF, y endpoints compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| balllvin/d1-omni-600M-MLX-8bit | 587M | no disponible | imagen-texto | lfm1.0 | gated, MLX/GGUF |
| LiquidAI/d1-omni-600M (base) | 587M | no disponible | imagen-texto | lfm1.0 | Hugging Face |
| Alternativas de ~600M multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Repositorio con cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Licencia `lfm1.0`: es una licencia propia de Liquid AI con posibles restricciones para uso comercial; debe revisarse antes de produccion.
- Solo soporta ingles, lo que limita su uso en castellano u otros idiomas.
- Al ser una cuantizacion a 8 bits, puede presentar degradacion respecto al modelo base, especialmente en tareas de razonamiento fino.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del repositorio.
- No hay informacion sobre sesgos, contexto maximo ni comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/d1-omni-600M-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Repositorio MLX: https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- llama.cpp: https://github.com/ggerganov/llama.cpp
