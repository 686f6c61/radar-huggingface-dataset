# iwr-redmond/Qwen3.8-27B-Uncensored-Q4-GGUF

## Resumen

`iwr-redmond/Qwen3.8-27B-Uncensored-Q4-GGUF` es una publicacion de pesos cuantizados en formato GGUF que, segun su model card, parte de una variante "Dynamic v3.1" del modelo Qwen3.8-27B en cuantizacion UD-Q4_K_XL generada con Unsloth, a la que se le ha aplicado el parche de "abliteracion" (eliminacion de rechazos) de huihui-ai. El autor del repositorio es `iwr-redmond`, no el equipo de Qwen, y la model card es extremadamente escueta: una sola frase que indica que el resultado no ha sido probado ("Currently untested").

El problema que pretende resolver es el de ofrecer una variante sin censura conversacional de un modelo de la familia Qwen3.8 en un formato listo para inferencia local (GGUF), de modo que pueda ejecutarse con llama.cpp, Ollama u otros motores compatibles sin necesidad de GPU de datacenter. La licencia declarada es Apache 2.0, lo que en principio permitiria uso comercial, aunque la cadena de derivaciones (Qwen original, cuantizacion de Unsloth, parche de huihui-ai, reempaquetado de iwr-redmond) hace recomendable verificar los terminos de cada eslabon.

Hay una discrepancia importante entre el nombre del repositorio (que sugiere 27B) y el dato real de parametros en safetensors que proporciona la plataforma: 1.924.404.480 parametros (aproximadamente 1,9 mil millones). El tamano del repositorio es de 21,1 GB, coherente con un modelo de mayor tamano cuantizado a Q4 o con multiples ficheros. Esta ficha refleja ambos datos y advierte de la inconsistencia, ya que no es posible resolverla con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; por el nombre se infiere familia Qwen3.8, sin confirmar) |
| Parametros totales | 1.924.404.480 segun safetensors de la plataforma; el nombre del repo indica 27B (discrepancia no resuelta) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (UD-Q4_K_XL, cuantizacion dinamica de Unsloth) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles de arquitectura, numero de tokens de entrenamiento, composicion del dataset ni si hubo etapas de RLHF o DPO. El modelo se presenta como una derivacion de "Qwen3.8-27B Dynamic v3.1" en cuantizacion UD-Q4_K_XL de Unsloth, con el parche de abliteracion de huihui-ai aplicado. La abliteracion es una tecnica de edicion de pesos que identifica y suprime direcciones en el espacio de activaciones asociadas a rechazos, de modo que el modelo deja de declinar peticiones; no es un reentrenamiento y no anade conocimiento nuevo.

La cuantizacion UD-Q4_K_XL es una variante dinamica de 4 bits que asigna distintos niveles de precision a distintas capas o tensores para preservar calidad en las partes sensibles. El parche se distribuye como un conjunto de diferencias aplicables sobre los pesos de Unsloth, segun la referencia incluida en la model card. No se documenta ninguna innovacion adicional (atencion lineal, decodificacion especulativa, mezcla de expertos) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en formato chat, segun la etiqueta `conversational` del repositorio.
- Conversacion multi-turno (la model card no detalla limites de contexto).
- Modo sin censura: el parche de abliteracion elimina los rechazos por politica de contenido, lo que cambia el comportamiento por defecto del modelo base.
- Soporte de tool calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion.

## Casos de uso

- Experimentacion en local con modelos sin filtros: el formato GGUF y la cuantizacion Q4 permiten cargar el modelo en equipos de consumo mediante llama.cpp u Ollama, lo que facilita probar variantes abliteradas sin infraestructura dedicada.
- Investigacion sobre alineacion y abliteracion: comparar las respuestas de esta variante con las del Qwen3.8-27B original permite estudiar que comportamientos cambian al suprimir la direccion de rechazo y que capacidades se degradan.
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o dialogos donde el modelo base tiende a rechazar temas sensibles; la variante sin censura evita esas interrupciones.
- Evaluacion de robustez de filtros: usar el modelo como generador adversarial para probar clasificadores de contenido y sistemas de moderacion en pipelines propios.
- Prototipado de asistentes conversacionales en entornos controlados: con licencia Apache 2.0 declarada, sirve para levantar demos internas de chat multi-turno sobre hardware modesto.
- Analisis de calidad de cuantizaciones: comparar UD-Q4_K_XL con otras cuantizaciones del mismo modelo base para medir la perdida de calidad en tareas de generacion libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido probado ("Currently untested").

## Requisitos de hardware

- VRAM estimada: con 21,1 GB de repositorio en Q4, la inferencia completa requiere del orden de 20-24 GB de VRAM o memoria unificada, dependiendo del numero real de parametros y de la ventana de contexto configurada.
- GPU recomendadas: RTX 4090 (24 GB) o superior para carga completa en GPU; A100 40/80 GB y H100 para despliegues con contexto largo o mayor throughput.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) si el modelo real ronda los 27B en Q4; en configuraciones de 16 GB seria necesario descargar capas a CPU o usar cuantizaciones menores.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| iwr-redmond/Qwen3.8-27B-Uncensored-Q4-GGUF | 1,9B (safetensors) / 27B (nombre) | no disponible | GGUF Q4 | Apache 2.0 | Sin censura, sin probar |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27B (segun nombre) | no disponible | GGUF | no disponible | Fuente del parche de abliteracion |
| unsloth/Qwen3.8-27B-GGUF | 27B (segun nombre) | no disponible | GGUF | no disponible | Base de la cuantizacion UD-Q4_K_XL |
| Qwen3.8-27B (original) | 27B (segun nombre) | no disponible | safetensors | no disponible | Modelo base con alineacion estandar |

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica 27B pero safetensors reporta 1.924.404.480 parametros; verificar antes de planificar hardware.
- Modelo no probado: el autor declara explicitamente que no ha sido testeado, por lo que no hay garantia de calidad ni de que el parche se haya aplicado correctamente.
- Sin censura: la abliteracion elimina los rechazos, lo que incrementa el riesgo de generar contenido danino, ilegal o sexualmente explicito; no apto para produccion sin moderacion externa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la abliteracion puede agravar la tendencia a afirmar con seguridad contenido falso.
- Sesgos: no documentados, pero heredados del modelo base y potencialmente amplificados por la perdida de alineacion.
- Licencia: Apache 2.0 declarada, pero la cadena de derivaciones (Qwen, Unsloth, huihui-ai) deberia revisarse individualmente antes de uso comercial.
- Idiomas y contexto: sin datos publicados; no asumir soporte multilingue ni ventanas largas.
- Repositorio sin descargas ni likes: senal de que la variante no ha sido validada por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/iwr-redmond/Qwen3.8-27B-Uncensored-Q4-GGUF
- Discusion de la cuantizacion Dynamic v3.1 en Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/discussions/143
- Parche de abliteracion de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF/blob/main/patch-unsloth/README-patch-unsloth.md
