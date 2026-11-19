# magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash-GGUF

## Resumen

NVIDIA Nemotron 3.5 Lightning 30B A3B NVFP4 DFlash GGUF es una conversión a formato GGUF del checkpoint `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash`, publicada por el usuario magnitudedev para su uso con el motor de inferencia Magnitude sobre llama.cpp. El modelo base es un transformer de tipo Mixture of Experts (MoE) de NVIDIA, con 30B parámetros totales y 3B parámetros activos por token, según indica el propio nombre del checkpoint. La variante DFlash incorpora un cabezal de decodificación especulativa con atención bidireccional, y el checkpoint original está cuantizado en NVFP4 (formato de 4 bits de NVIDIA).

El artefacto publicado es una conversión nativa NVFP4 a GGUF, generada con llama.cpp en la revisión `9b05354ec6fb58b4e665e9a39ebc40285c015638`, con un tamaño de repositorio de 2,4 GB. Está pensado para despliegues que combinan el formato de pesos NVFP4 con decodificación especulativa DFlash dentro del ecosistema Magnitude, lo que permite acelerar la generación sin salir de llama.cpp.

La relevancia de esta ficha radica en que es un artefacto de inferencia derivado, no un modelo entrenado desde cero: su interés está en la combinación de cuantización NVFP4, decodificación especulativa y compatibilidad con endpoints, más que en capacidades nuevas. La información pública disponible sobre el modelo base es limitada en esta ficha, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), según nomenclatura del checkpoint base; detalles internos no disponibles |
| Parametros totales | 30B (según nombre del checkpoint base); el tensor safetensors del repo GGUF reporta 833.362.195 parámetros |
| Parametros activos | 3B (según nombre del checkpoint base, sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato nativo NVIDIA); no se documentan otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw-1.1), etiquetada como `license: other` en Hugging Face |
| Formato de pesos | GGUF (conversión nativa NVFP4) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 30B parámetros totales y 3B activos, según la convención de nombres de NVIDIA (Lightning 30B A3B). El checkpoint original incorpora el mecanismo DFlash, un esquema de decodificación especulativa con un bloque draft que utiliza atención bidireccional (`dflash.attention.causal = false`) y propuestas generadas desde filas de máscara que comienzan después del ancla (`dflash.sample_from_anchor = false`). Estos metadatos están documentados en la model card del artefacto GGUF y derivan de la configuración e implementación de referencia del checkpoint de NVIDIA, verificadas contra las salidas de referencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base dentro de la información proporcionada. La conversión a GGUF se realizó con llama.cpp en la revisión indicada y el artefacto tiene SHA-256 `ca3b2a765da43234524c0c83669b4f552e31f0f226c7afa509f133cfd050bc19`.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Nemotron 3.5 Lightning.
- Decodificación especulativa DFlash integrada para acelerar la generación en el motor Magnitude.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).
- Extracción de características (`feature-extraction` en los tags del repo).
- Soporte de tool calling, agentes, matemáticas, código, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas en la model card.

## Casos de uso

- Despliegue de inferencia acelerada con decodificación especulativa: el artefacto incluye el bloque draft DFlash, por lo que se puede usar en Magnitude para generar tokens con verificación especulativa sobre llama.cpp, reduciendo la latencia por token frente a decodificación autoregresiva estándar.
- Servicio de extracción de características: el tag `feature-extraction` indica que el modelo puede emplearse para obtener representaciones vectoriales en pipelines de búsqueda semántica o clustering, siempre que el motor lo exponga.
- Integración en endpoints compatibles: el tag `endpoints_compatible` sugiere su uso detrás de una API compatible con endpoints estándar, lo que facilita conectarlo a aplicaciones existentes sin reescribir clientes.
- Prototipado en hardware con soporte NVFP4: al conservar la cuantización nativa de 4 bits, es adecuado para entornos con GPUs NVIDIA que aceleran NVFP4 y donde el tamaño de 2,4 GB del repo reduce los requisitos de almacenamiento.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de NVFP4 frente a otros formatos del mismo modelo base en tareas de generación.
- Pruebas de decodificación especulativa en investigación: los metadatos DFlash documentados permiten reproducir y validar el comportamiento del bloque draft contra las salidas de referencia del checkpoint de NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repo GGUF ocupa 2,4 GB, pero el tamaño en VRAM depende del número de capas descargadas a GPU y del contexto configurado.
- GPU recomendadas: no disponible en la información proporcionada; NVFP4 requiere soporte de hardware y software específico de NVIDIA, por lo que no es un formato universal.
- Compatibilidad con GPU de consumo: no confirmada; dependerá del soporte NVFP4 del runtime y de la GPU concreta.
- Opciones de despliegue: llama.cpp (revisión `9b05354ec6fb58b4e665e9a39ebc40285c015638` o posterior) y el motor Magnitude; vLLM, TGI u Ollama no están confirmados para este artefacto.
- Latencia y throughput: no disponibles; la decodificación especulativa DFlash está diseñada para mejorar la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este artefacto (Nemotron 3.5 Lightning 30B A3B NVFP4 DFlash GGUF) | 30B totales / 3B activos (según checkpoint base) | no disponible | OpenMDW 1.1 | GGUF NVFP4 | Conversión de magnitudedev con DFlash |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash | 30B totales / 3B activos | no disponible | no disponible en esta ficha | safetensors NVFP4 | Checkpoint original de NVIDIA |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar |

## Limitaciones y advertencias

- Es un artefacto derivado: cualquier limitación del modelo base (sesgos, alucinaciones, cobertura idiomática) se hereda sin cambios.
- La cuantización NVFP4 puede introducir degradación de calidad frente a pesos de mayor precisión; no se publican evaluaciones comparativas en este repo.
- El formato NVFP4 no es universal: requiere soporte específico de hardware y software NVIDIA, lo que limita la portabilidad frente a GGUF estándar de 4 u 8 bits.
- El bloque DFlash depende de metadatos concretos (`dflash.attention.causal = false`, `dflash.sample_from_anchor = false`); un runtime que no los interprete correctamente puede producir salidas incorrectas.
- La licencia OpenMDW 1.1 debe revisarse antes de uso comercial; la model card la etiqueta como `license: other`.
- No se documentan idiomas soportados, contexto máximo ni política de uso aceptable en la información disponible.
- El número de parámetros reportado por el tensor safetensors del repo (833 millones) no coincide con los 30B del nombre del checkpoint base; conviene verificar el contenido real del artefacto antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash
- Revisión del checkpoint base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash/tree/7fc1f1ff4b82b917efbd0710df0872c2bb89caa5
- Motor Magnitude: https://github.com/magnitudedev/magnitude
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
