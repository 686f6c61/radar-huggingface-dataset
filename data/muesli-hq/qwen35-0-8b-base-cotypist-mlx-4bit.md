# Muesli-HQ/qwen35-0.8b-base-cotypist-mlx-4bit

## Resumen
Muesli-HQ/qwen35-0.8b-base-cotypist-mlx-4bit es una conversion a MLX 4-bit del modelo base Qwen/Qwen3.5-0.8B-Base, desarrollada por Muesli-HQ. No se trata de un modelo afinado ni alineado con instrucciones: es el checkpoint preentrenado original de Qwen, cuantizado en formato MLX para inferencia en dispositivo (on-device) en macOS. Su proposito es servir como motor de autocompletado predictivo (typeahead) dentro de Cotypist, la herramienta de autocompletado de Muesli que continua el texto situado antes del cursor en cualquier aplicacion de macOS.

El modelo resuelve el problema de la prediccion de texto en tiempo real con baja latencia y sin conexion, aprovechando el framework MLX de Apple para ejecutarse sobre silicio de la serie M. Con 752.393.024 parametros reales en safetensors y un repo de 0,4 GB, esta pensado para caber holgadamente en memoria unificada de equipos de consumo. La cuantizacion afina de 4 bits con grupo de 64 (aproximadamente 4,5 bits por peso) reduce el peso a unos 424 MB.

Es relevante ahora porque ejemplifica el patron de reutilizacion de modelos base pequenos de la familia Qwen 3.5 para tareas especializadas de continuacion de texto, empaquetados en MLX para integracion nativa en aplicaciones macOS. La licencia Apache 2.0 facilita su uso comercial y su redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen 3.5), segun el modelo base Qwen/Qwen3.5-0.8B-Base |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit afina, group size 64 (aprox. 4,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); `model.safetensors` de 424.026.782 bytes |

## Arquitectura y entrenamiento
La arquitectura corresponde al modelo base Qwen 3.5 de 0,8B parametros, un transformer de la familia Qwen 3.5. Esta publicacion concreta no aporta detalles adicionales sobre la arquitectura interna (numero de capas, dimensiones, atencion, etc.) mas alla de la identificacion del modelo base. No se indica que sea un modelo MoE, y el recuento de parametros totales coincide con el de un modelo denso de ese tamano.

No hay informacion sobre el proceso de entrenamiento en la model card: no se detallan el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO. Se trata del checkpoint preentrenado sin modificaciones, convertido a MLX mediante `mlx_lm convert -q --q-bits 4 --q-group-size 64` con mlx-lm 0.32.2 y mlx 0.32.4, a partir de la revision `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68` del modelo base. La unica innovacion tecnica documentada es la propia cuantizacion MLX y el flujo de integracion nativa en Swift mediante MLX-Swift-LM 3.32.3 y Hugging Face Swift tokenizers 1.3.2, con el alias `Qwen3_5Tokenizer` a `Qwen2Tokenizer` y `clean_up_tokenization_spaces=false`.

## Capacidades
- Continuacion de texto en bruto (raw text continuation): codifica el texto anterior al cursor y decodifica de forma greedy, sin plantilla de chat.
- Autocompletado predictivo (typeahead) integrado en cualquier aplicacion de macOS a traves de Cotypist.
- Curacion de tokens (token healing) para palabras a medio escribir, gestionada por la capa de Cotypist.
- Filtrado de sugerencias mediante la log-probabilidad de la primera palabra, tambien a cargo de Cotypist.
- Generacion de texto como tarea de pipeline (`text-generation`).
- No dispone de capacidades de chat, instrucciones, tool calling ni razonamiento multi-paso, al ser un modelo base sin ajuste.
- Capacidades multilingues: no disponible (no se documentan idiomas soportados).
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Autocompletado en editores de texto de macOS: el modelo recibe el texto previo al cursor y devuelve una continuacion greedy; su tamano reducido y su cuantizacion 4-bit permiten ejecutarlo en local con baja latencia dentro de Cotypist.
- Asistencia de escritura en correo y mensajeria: integrado como servicio del sistema, sugiere la siguiente frase en aplicaciones como Mail o Mensajes sin enviar datos a la nube, gracias a la inferencia on-device en MLX.
- Redaccion asistida en entornos sin conexion: al ejecutarse sobre MLX en silicio Apple, funciona completamente offline, lo que lo hace adecuado para portatiles en movilidad o entornos con requisitos de privacidad.
- Prototipado de funciones typeahead: sirve como referencia para desarrolladores que quieran construir sus propios motores de autocompletado con modelos base pequenos y cuantizacion MLX.
- Completado de campos y formularios: la continuacion de texto en bruto permite predecir el resto de una entrada a partir del prefijo escrito, con token healing para prefijos parciales.
- Investigacion sobre cuantizacion MLX: al ser una conversion documentada y reproducible con comandos y versiones concretas, es util para comparar calidad de continuacion entre precision completa y 4-bit afina.
- Integracion en aplicaciones Swift nativas: el flujo con MLX-Swift-LM y los tokenizers de Swift documentado en la model card facilita incorporar el modelo a apps macOS escritas en Swift.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria estimada: el peso cuantizado ocupa aproximadamente 424 MB (`model.safetensors`), por lo que la inferencia requiere del orden de 0,5-1 GB de memoria considerando overhead de runtime y cache KV.
- GPU recomendadas: al usar MLX, esta orientado a Apple Silicon (serie M1, M2, M3, M4 y posteriores) con memoria unificada; no se documentan requisitos para GPU NVIDIA.
- Cabe en equipos de consumo: si, practicamente en cualquier Mac con Apple Silicon, dado el tamano del repo (0,4 GB) y el recuento de parametros.
- Opciones de despliegue: MLX (mlx-lm), MLX-Swift-LM 3.32.3 para integracion nativa en Swift; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este paquete concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Muesli-HQ/qwen35-0.8b-base-cotypist-mlx-4bit | 752.393.024 | no disponible | MLX 4-bit safetensors | Apache 2.0 | Base Qwen 3.5 cuantizado para typeahead en macOS |
| Qwen/Qwen3.5-0.8B-Base | no disponible | no disponible | safetensors (original) | no disponible | Modelo base de origen, sin cuantizar |
| Alternativas de autocompletado on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion |

No se dispone de informacion suficiente para comparar con otros modelos de autocompletado o de tamano similar en terminos de rendimiento, contexto o disponibilidad.

## Limitaciones y advertencias
- Es un modelo base preentrenado sin ajuste por instrucciones: no responde a prompts conversacionales ni sigue instrucciones; solo continua texto.
- No usa plantilla de chat; emplearlo con formatos de chat producira resultados degenerados.
- Riesgo de alucinacion y de continuaciones incoherentes o inapropiadas, especialmente en textos ambiguos o fuera de dominio.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un corpus de preentrenamiento no publicado, pueden heredarse sesgos del modelo base.
- Limitaciones de contexto: la longitud de contexto no esta documentada en esta publicacion.
- Idiomas: no se especifican los idiomas soportados; el rendimiento fuera del ingles o del chino puede ser inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, con los requisitos habituales de atribucion y aviso de licencia; conviene revisar el archivo `LICENSE` del repo.
- Dependencia de versiones concretas de MLX-Swift-LM y de los tokenizers de Swift; la model card advierte de un alias necesario (`Qwen3_5Tokenizer` a `Qwen2Tokenizer`) y de `clean_up_tokenization_spaces=false`, lo que puede romper integraciones con otras versiones.
- La calidad del autocompletado depende de capas externas (token healing y filtrado por log-probabilidad) implementadas en Cotypist, no en el modelo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Muesli-HQ/qwen35-0.8b-base-cotypist-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio de mlx-lm: no disponible en la informacion proporcionada
- Documentacion de MLX: no disponible en la informacion proporcionada
- Paper o blog de Qwen 3.5: no disponible en la informacion proporcionada
- Demo de Cotypist: no disponible en la informacion proporcionada
