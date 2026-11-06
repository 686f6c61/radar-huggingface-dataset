# johnlockejrr/Huihui-Qwen3.8-Flash-Next-abliterated-v2-HGN

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-v2-HGN es una conversión de pesos de la versión sin censura (abliterated) del modelo Qwen3.8-Flash-Next, publicada por el usuario johnlockejrr. No se trata de un modelo nuevo ni de un entrenamiento adicional: es una transformación del checkpoint GGUF de huihui-ai a un formato propietario denominado HGN v2, diseñado específicamente para el motor halogen-flash-server sobre GPUs AMD Strix Halo (arquitectura gfx1151). El modelo subyacente es un transformer de tipo Mixture-of-Experts (MoE) de la familia Qwen 3.8, con capacidades multimodales (torre de visión incluida) y un cabezal de decodificación especulativa MTP.

La relevancia de este repositorio es acotada pero concreta: permite ejecutar un modelo de gran tamaño (el checkpoint ocupa 62,1 GiB) en hardware AMD integrado de gama alta mediante un formato optimizado para ese backend. Incluye además una tabla n-gram de 51B parámetros en FP8 que actúa como mecanismo de búsqueda y decodificación auxiliar, y que es obligatoria para el funcionamiento del motor.

La información disponible es limitada: no se han publicado resultados de benchmarks del modelo convertido, no se ha verificado la carga y generación en el servidor halogen-flash-server, y el propio autor advierte que es una conversión comunitaria no cualificada por los proyectos upstream. La licencia es la Qwen Community License 1.0, y el modelo solo declara soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen 3.8 Flash Next), con atención lineal, hiper-conexiones, torre de visión y cabezal MTP de decodificación especulativa |
| Parametros totales | No disponible con precisión en la información proporcionada (el modelo base se describe con 177B parámetros en la búsqueda web para la variante abliterated) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos convertidos con política `bf16-hgn-v2-rtn-nf4-signed-rms-trellis-v1`; expertos enrutados en I4R (4 bits), tabla n-gram en FP8, hiper-conexiones en Q6G64, torre de visión y normas en BF16/F32 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Qwen Community License 1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | `.hgn` (HGN v2, spec 1.1.0); no compatible con transformers, vLLM ni llama.cpp |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de tipo Mixture-of-Experts de la familia Qwen 3.8 Flash Next, según se deduce de los nombres de las familias de tensores presentes en la verificación de la conversión: expertos enrutados, expertos compartidos, proyecciones de atención y atención lineal, mezcladores de hiper-conexión, estado SSM, cabezal MTP y torre de visión. La presencia de proyecciones de atención lineal y de estado SSM sugiere una arquitectura híbrida que combina atención clásica con mecanismos de estado recurrente, aunque la información proporcionada no detalla la proporción ni el diseño exacto.

No se ha realizado ningún entrenamiento nuevo en este repositorio. El proceso es una cadena de conversiones: el modelo base Qwen/Qwen3.8-Flash-Next se sometió a abliteración por huihui-ai (eliminación de la dirección de rechazo en el espacio de activaciones), se cuantizó a GGUF con cuantizaciones unsloth-UD-IQ4_XS, y finalmente se convirtió al formato HGN v2 mediante la herramienta Quat3rnion/bf16-to-hgn con perfil v2 y backend CUDA sobre una RTX 3090 (sm_86). La conversión procesó 231,2G valores en 30 minutos y 20 segundos, transformando 1.658 tensores de origen en 2.349 tensores de salida. El error de cuantización relativo medido es inferior al 1% en todas las familias de tensores (0,939% en expertos enrutados, 0,75% en el LM head, 0,62-0,69% en proyecciones de atención, 0,07% en la tabla n-gram y en los mezcladores de hiper-conexión). Cincuenta y dos de las cien familias de tensores presentan error exactamente cero por ser passthrough en BF16/F32.

## Capacidades

- Generación de texto en inglés y chino.
- Procesamiento multimodal de imagen a texto mediante la torre de visión incluida (opcional; sin ella el motor funciona solo en modo texto).
- Decodificación especulativa mediante el cabezal MTP incluido en el checkpoint.
- Búsqueda y decodificación asistida por tabla n-gram de 51B parámetros en FP8.
- Al estar basado en un modelo abliterated, la filtredad de seguridad está significativamente reducida, lo que permite generar contenido que el modelo original rechazaría.
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso o modo thinking en la documentación proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente al original, comparando tasas de rechazo y tipos de contenido generado en condiciones controladas.
- Evaluación de formatos de cuantización en hardware AMD: sirve para medir el impacto del formato HGN v2 y de la política de cuantización aplicada sobre la calidad de generación en GPUs Strix Halo (gfx1151), un nicho con poca cobertura de herramientas.
- Procesamiento de documentos en chino e inglés: la combinación de contexto multimodal (torre de visión) y generación de texto permite extraer y resumir información de imágenes y texto en entornos de investigación.
- Despliegue local en estaciones de trabajo con AMD Strix Halo: el formato está pensado para montarse en el contenedor halogen-flash-server, lo que permite ejecutar un modelo de gran tamaño en hardware integrado sin GPU dedicada.
- Pruebas de decodificación especulativa: el cabezal MTP incluido permite experimentar con técnicas de aceleración de inferencia y medir su efecto en latencia y throughput.
- Generación creativa sin restricciones de filtrado: para proyectos de escritura, guiones o contenido experimental donde se requiere un modelo sin las capas de rechazo del original, siempre con revisión humana de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las pruebas de velocidad y calidad están "not yet recorded" (no registradas todavía) y que la carga y generación en halogen-flash-server no se ha verificado.

## Requisitos de hardware

- El checkpoint `model.hgn` ocupa 62,1 GiB (66.687.678.432 bytes) y requiere aproximadamente 62 GiB residentes en memoria.
- La tabla n-gram `qwen38-flash-next-ngram.hgn` ocupa 47,7 GiB (51.200.246.084 bytes) y se mapea en memoria; debe mantenerse junto al checkpoint.
- La torre de visión `qwen38-flash-next-vision.hgn` ocupa 0,84 GiB (897.916.416 bytes) y es opcional.
- El repositorio completo suma aproximadamente 111 GiB.
- Hardware objetivo: AMD Strix Halo con arquitectura gfx1151. El motor halogen-flash-server está diseñado para esta plataforma.
- No cabe en GPUs de consumo convencionales con 24 GB de VRAM (RTX 4090, etc.) por el tamaño del checkpoint y de la tabla n-gram.
- Opciones de despliegue: exclusivamente halogen-flash-server (contenedor). No es compatible con vLLM, llama.cpp, transformers ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (HGN v2) | No disponible (base ~177B según búsqueda web) | No disponible | `.hgn` | Qwen Community 1.0 | AMD Strix Halo (gfx1151) |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | No disponible | No disponible | GGUF (IQ4_XS) | Qwen Community 1.0 | GPU convencionales con llama.cpp |
| Qwen/Qwen3.8-Flash-Next (original) | No disponible | No disponible | Safetensors | Qwen Community 1.0 | GPU NVIDIA/AMD con transformers/vLLM |
| peonist-ai/halogen-qwen3.8-flash-next | No disponible | No disponible | `.hgn` | Qwen Community 1.0 | AMD Strix Halo (gfx1151) |

La comparativa se limita a la cadena de derivación del propio modelo, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo sin censura: el filtrado de seguridad está significativamente reducido y puede generar contenido sensible, controvertido o inapropiado. No es apto para todos los públicos.
- El autor recomienda uso en investigación o entornos controlados, con revisión de las salidas, y desaconseja su uso directo en aplicaciones comerciales de cara al público.
- La conversión no ha sido cualificada por los autores de los proyectos upstream (ni Qwen, ni huihui-ai, ni peonist-ai).
- No se ha verificado que el modelo cargue y genere correctamente en halogen-flash-server.
- No hay benchmarks de calidad ni de velocidad publicados.
- La comparación byte a byte entre el backend CUDA y el CPU no se ha realizado; el conversor está cualificado para sm_89 pero esta conversión se ejecutó en sm_86 (RTX 3090), lo que introduce incertidumbre sobre la reproducibilidad exacta.
- Los pesos en formato `.hgn` no se pueden cargar con transformers, vLLM ni llama.cpp, lo que limita su portabilidad a un único motor.
- Solo se declaran idiomas inglés y chino; el rendimiento en castellano no está garantizado.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; debe revisarse antes de cualquier despliegue productivo.
- Riesgo de alucinación inherente al modelo base, agravado por la falta de evaluación específica tras la abliteración y la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/Huihui-Qwen3.8-Flash-Next-abliterated-v2-HGN
- Modelo base GGUF: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Conversión stock de peonist-ai: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Motor halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
- Conversor bf16-to-hgn: https://github.com/Quat3rnion/bf16-to-hgn
- Especificación HGN: https://github.com/jtsylve/hgn-spec
- Variante abliterated (v1): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Ficha en abliteration.org: https://abliteration.org/models/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/huihui-qwen3-8-flash-next-abliterated-v2.html
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.8-flash-next-abliterated/
