# OpensourceWTF/Qwen3.8-Flash-Next-EXL3-3.05-mlx-serve

## Resumen

Qwen3.8-Flash-Next-EXL3-3.05-mlx-serve es un artefacto de pesos cuantizados del modelo Qwen3.8-Flash-Next, empaquetado por el usuario OpensourceWTF para su uso con la librería mlx-serve en hardware Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint EXL3 de 3,05 bits por peso producido por turboderp con exllamav3, cuyo propósito es permitir la inferencia local en equipos Mac con memoria unificada. El repositorio contiene 26.349.105.555 parámetros en formato safetensors y ocupa 85,4 GB.

La relevancia de este artefacto es logística más que algorítmica: la model card indica que el repositorio ha sido trasladado a la rama `3.05bpw` del repositorio `OpensourceWTF/Qwen3.8-Flash-Next-exl3`, y que todos los ficheros salvo `ngram_embedding.safetensors` están replicados byte a byte en esa rama. La tabla n-gram debe generarse a partir del fichero de turboderp en la rama `3.05bpw_h5_ng5` mediante el paso de cabecera del conversor del autor. El historial de este repositorio fue comprimido para liberar almacenamiento.

Por tanto, esta ficha documenta un checkpoint cuantizado de tercera mano (Qwen → turboderp → OpensourceWTF) orientado a inferencia en Apple Silicon, con licencia comunitaria Qwen y sin datos publicados de benchmarks propios. La información disponible sobre arquitectura interna, datos de entrenamiento y evaluación del modelo original es limitada en el material proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; familia Qwen, detalles no proporcionados) |
| Parametros totales | 26.349.105.555 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3,05 bits por peso (bpw) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (empaquetado para mlx-serve) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-Flash-Next en el material proporcionado. El artefacto aquí descrito es una cuantización de terceros: turboderp generó el checkpoint EXL3 de 3,05 bpw con exllamav3 a partir del modelo original, y OpensourceWTF lo ha reempaquetado para mlx-serve. No hay datos sobre número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento.

La innovación técnica documentada es la cuantización EXL3 a 3,05 bpw, que reduce el peso del modelo a 85,4 GB de repositorio, y la inclusión de una tabla n-gram (`ngram_embedding.safetensors`) que debe regenerarse a partir del fichero de turboderp mediante el conversor de OpenSourceWTF. No se detalla si el modelo base emplea atención lineal, decodificación especulativa u otras optimizaciones.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Razonamiento y código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están listados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Inferencia local en Apple Silicon mediante la librería mlx-serve.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el empaquetado para mlx-serve permite ejecutar un modelo de 26,3 mil millones de parámetros cuantizado a 3,05 bpw en equipos Apple Silicon con suficiente RAM unificada, evitando depender de GPUs dedicadas.
- Prototipado y experimentación offline: al ser un checkpoint autocontenido en safetensors, se puede cargar en entornos de desarrollo sin conexión para pruebas de generación de texto.
- Evaluación de cuantizaciones EXL3: sirve como referencia para comparar la calidad de la cuantización a 3,05 bpw frente a otros niveles del mismo modelo base.
- Despliegue en estaciones de trabajo con macOS: útil en equipos de investigación que ya trabajan con el stack MLX y quieren incorporar un modelo de la familia Qwen sin salir del ecosistema Apple.
- Reproducción de pipelines de conversión: el repositorio documenta el proceso de generación de la tabla n-gram mediante el conversor, lo que permite replicar el empaquetado para otros checkpoints EXL3.
- Archivado y distribución de pesos cuantizados: al estar replicados byte a byte en la rama `3.05bpw`, facilita la verificación por sha256 y la distribución controlada de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 85,4 GB, por lo que se requiere al menos esa cantidad de memoria unificada para cargar los pesos completos; con overhead de inferencia conviene disponer de 96 GB o más.
- GPU recomendadas: el formato está orientado a Apple Silicon (mlx-serve); no se documentan requisitos para GPUs NVIDIA o AMD.
- ¿Cabe en GPU consumer?: en el ecosistema Apple, equipos con 96 GB o 128 GB de memoria unificada (por ejemplo, Mac Studio con M2 Ultra o M3 Ultra) son los candidatos naturales; en GPUs consumer convencionales de 24 GB no cabe sin cuantización adicional.
- Opciones de despliegue: mlx-serve (librería declarada); el checkpoint EXL3 original de turboderp está pensado para exllamav3.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-3.05-mlx-serve (este) | 26,3 B | no disponible | EXL3 3,05 bpw | qwen-community-1.0 | Hugging Face (mlx-serve) |
| turboderp/Qwen3.8-Flash-Next-exl3 (rama `3.05bpw_h5_ng5`) | 26,3 B (mismo base) | no disponible | EXL3 3,05 bpw | qwen-community-1.0 | Hugging Face (exllamav3) |
| OpensourceWTF/Qwen3.8-Flash-Next-exl3 (rama `3.05bpw`) | 26,3 B (mismo base) | no disponible | EXL3 3,05 bpw | qwen-community-1.0 | Hugging Face (mlx-serve) |

No se dispone de información sobre otros modelos comparables de la misma categoría en el material proporcionado.

## Limitaciones y advertencias

- Repositorio movido: la model card indica que el contenido se ha trasladado a la rama `3.05bpw` de `OpensourceWTF/Qwen3.8-Flash-Next-exl3`; este repositorio debe considerarse obsoleto.
- Fichero ausente: `ngram_embedding.safetensors` no está incluido y debe regenerarse a partir del fichero de turboderp con el conversor, lo que añade un paso manual y un riesgo de error.
- Historial comprimido: el historial del repositorio fue aplastado para liberar almacenamiento, lo que dificulta la auditoría de cambios previos.
- Cuantización agresiva: 3,05 bpw es una cuantización de muy baja precisión que puede degradar la calidad respecto al modelo original; no se aportan métricas de degradación.
- Licencia: qwen-community-1.0 impone condiciones de uso comunitario; deben revisarse los términos antes de un uso comercial.
- Idiomas y sesgos: no se documentan los idiomas soportados ni los sesgos conocidos del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Hardware restringido: el empaquetado mlx-serve limita su uso a Apple Silicon; no es portable a otros backends sin reconversión.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-EXL3-3.05-mlx-serve
- Repositorio destino (rama `3.05bpw`): https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-exl3/tree/3.05bpw
- Cuantización original de turboderp (rama `3.05bpw_h5_ng5`): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/3.05bpw_h5_ng5
- Repositorio de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Conversor mlx-serve: https://github.com/OpenSourceWTF/qwen38-exl3-mlx-serve-converter
- exllamav3: https://github.com/turboderp-org/exllamav3
- Licencia: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-exl3/blob/3.05bpw/LICENSE
