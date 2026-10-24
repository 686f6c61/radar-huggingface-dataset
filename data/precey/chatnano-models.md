# precey/chatnano-models

## Resumen

ChatNano models es un repositorio de distribución que empaqueta tres modelos de lenguaje con pesos ternarios (valores -1, 0 y +1) para inferencia en CPU dentro de la aplicación de escritorio ChatNano. No se trata de un modelo entrenado por el autor del repo, sino de una conversión de los modelos Ternary Bonsai 2 de Prism ML en tres tamanos: Nano Tokyo (2B), Nano Cairo (4B) y Nano Oslo (9B), todos derivados de la familia Qwen3.5 de Alibaba Cloud (Qwen3.5-2B, Qwen3.5-4B y Qwen3.5-9B respectivamente, segun la nota de licencia incluida).

El interés técnico está en el formato: los pesos originales ternarios se reempaquetan en un contenedor propietario `.nano` sin modificar ningún peso, codificando cinco trits por byte y una escala en f16 cada 128 pesos. Eso da una densidad efectiva de aproximadamente 1,725 bits por parámetro (1,6 bits del empaquetado ternario más 0,125 bits de escalas), lo que explica que el modelo de 9B ocupe solo 1,99 GB en disco y pueda ejecutarse en CPU de portátil.

La relevancia práctica es doble: por un lado demuestra la viabilidad de servir modelos de 2B a 9B en hardware sin GPU; por otro, el repo tiene 0 descargas y 0 likes en el momento de la consulta, no incluye benchmarks ni lista de idiomas, y su formato solo es legible por el motor de ChatNano, lo que limita su uso fuera de esa aplicación. Los encoders de visión no están incluidos y se obtienen de los repositorios originales de Prism ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 con pesos ternarios (-1, 0, +1); detalles de capas y atencion no disponibles |
| Parametros totales | 2B (Nano Tokyo), 4B (Nano Cairo), 9B (Nano Oslo) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria nativa empaquetada: 5 trits por byte + 1 escala f16 cada 128 pesos (~1,725 bits/peso) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con aviso de atribucion de Prism ML) |
| Formato de pesos | `.nano` propietario de ChatNano; originales en GGUF en los repos de prism-ml |

Tabla de ficheros del repo:

| Fichero | Modelo | Origen | Parametros | Tamano en disco |
|---|---|---|---|---|
| `nano-tokyo.nano` | Nano Tokyo | Ternary-Bonsai-2-2B | 2B | 429 MB |
| `nano-cairo.nano` | Nano Cairo | Ternary-Bonsai-2-4B | 4B | 938 MB |
| `nano-oslo.nano` | Nano Oslo | Ternary-Bonsai-2-9B | 9B | 1,99 GB |

El repo completo ocupa 3,4 GB, superior a la suma de los tres ficheros (3,36 GB), probablemente por metadatos y ficheros auxiliares no detallados en la model card.

## Arquitectura y entrenamiento

Los tres modelos son Ternary Bonsai 2 de Prism ML: modelos Qwen3.5 entrenados de forma que sus pesos quedan restringidos a tres valores (-1, 0, +1). La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden a las fichas de Prism ML y a Qwen3.5, no a este repositorio. Tampoco se especifica el número de capas, dimensiones ocultas, tipo de atención ni si se aplican técnicas de decodificación especulativa.

La contribución propia de este repo es exclusivamente el reempaquetado: conversión al formato `.nano` sin alterar ningún peso, agrupando cinco dígitos ternarios por byte y almacenando una escala f16 por cada 128 pesos. La comprobación aritmética de densidades es consistente: 2B a 1,725 bits/peso daría unos 431 MB (frente a 429 MB reales) y 9B daría unos 1,94 GB (frente a 1,99 GB); el fichero de 4B, con 938 MB, implicaría un recuento algo superior a los 4.000 millones de parámetros o un sobrecoste de metadatos mayor. Los nombres internos de Nano Tokyo y Nano Oslo son Nano Nairobi y Nano Lagos en los ficheros, herencia de la conversión anterior; la aplicación resuelve por nombre de fichero.

## Capacidades

- Generación de texto conversacional multi-turno orientada a una app de escritorio.
- Razonamiento y respuesta a instrucciones heredados del ajuste de Qwen3.5 (no se detalla el pipeline de alineamiento).
- Ejecución en CPU sin GPU, que es el caso de uso declarado de la aplicación.
- Huella de memoria muy reducida: 429 MB, 938 MB y 1,99 GB de pesos para 2B, 4B y 9B.
- Capacidad multimodal potencial a través de los encoders de visión de Prism ML, que no se incluyen en este repo y deben descargarse aparte.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Idiomas: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de escritorio sin conexión: los tres modelos caben en RAM de un portátil convencional (menos de 2 GB de pesos en el mayor), lo que permite un chatbot local que no envía datos a la nube ni requiere GPU.
- Despliegue en equipos con CPU únicamente: entornos corporativos con escritorios virtuales o servidores sin acelerador pueden servir el modelo de 2B con una huella de disco de 429 MB, útil cuando el hardware está estandarizado y no admite tarjetas gráficas.
- Prototipado rápido de aplicaciones LLM: el tamaño reducido de los ficheros permite distribuirlos dentro de un instalador o actualizarlos por red sin infraestructura de pesos de decenas de GB.
- Distribución en mercados con conectividad limitada: un paquete de 429 MB a 1,99 GB es viable sobre conexiones móviles, frente a los varios GB de un modelo de 9B en fp16.
- Procesamiento de texto sensible en local: clasificación, resumen o extracción de campos sobre documentos que no pueden salir del dispositivo, aprovechando que la inferencia ocurre íntegramente en la máquina del usuario.
- Evaluación comparativa de cuantización ternaria: investigadores pueden medir la degradación de calidad de un mismo modelo base (Qwen3.5) al pasar a pesos ternarios en tres escalas de tamaño, siempre que trabajen con los GGUF originales de Prism ML o con el motor de ChatNano.
- Integración en el motor ChatNano: el formato `.nano` está pensado para que la aplicación lo lea, no para uso genérico; cualquier producto construido sobre esta app puede reutilizar los tres ficheros tal cual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de `precey/chatnano-models` no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y tampoco aporta métricas de latencia o throughput en CPU.

## Requisitos de hardware

- VRAM/RAM para pesos: 429 MB (2B), 938 MB (4B) y 1,99 GB (9B). Hay que sumar caché KV y activaciones, que dependen de la longitud de contexto (no documentada).
- Estimación conservadora de memoria total en inferencia: por debajo de 1,5 GB para el 2B y de 4 GB para el 9B con contextos moderados; cifra no confirmada por el autor.
- GPU: los tres modelos caben con holgura en cualquier GPU de consumo (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en iGPU con memoria unificada; el diseño está orientado a CPU, así que la GPU no es requisito.
- CPU: al ser pesos ternarios empaquetados, el cuello de botella es el ancho de banda de memoria y la implementación de las operaciones de desempaquetado; no se publican cifras de tokens por segundo.
- Opciones de despliegue: motor de ChatNano para el formato `.nano`. Para los GGUF originales de prism-ml, runners compatibles con GGUF (por ejemplo llama.cpp) serían la vía natural, aunque este repo no lo documenta ni lo garantiza. No hay soporte declarado de vLLM, TGI ni Ollama.
- Almacenamiento: 3,4 GB para el repo completo; 429 MB si solo se necesita el modelo más pequeno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nano Tokyo / Cairo / Oslo (este repo) | 2B / 4B / 9B | No disponible | `.nano` propietario | Apache 2.0 | Repo HF con 0 descargas |
| Ternary Bonsai 2 (prism-ml), originales | 2B / 4B / 9B | No disponible | GGUF | Apache 2.0 | Repos de prism-ml en HF |
| Qwen3.5-2B / 4B / 9B (modelos base) | 2B / 4B / 9B | No disponible | Safetensors y otros | Apache 2.0 | Repos de Qwen en HF |
| BitNet b1.58 (familia ternaria de Microsoft) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es de empaquetado, no de calidad: los `.nano` y los GGUF de Prism ML contienen los mismos pesos, y frente a los Qwen3.5 originales la diferencia es la cuantización ternaria (menor huella, previsible pérdida de precisión). No hay datos de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: sin benchmarks no es posible estimar la degradación frente a Qwen3.5 en fp16/BF16 ni comparar con alternativas.
- Formato cerrado: los ficheros `.nano` solo los lee el motor de ChatNano; no hay especificación pública del contenedor ni herramientas de conversión en el repo.
- Visión incompleta: los encoders multimodales no están incluidos y deben obtenerse de los repositorios de Prism ML, con el riesgo de desajuste de versiones que eso implica.
- Nombres internos inconsistentes: Nano Tokyo y Nano Oslo figuran como Nano Nairobi y Nano Lagos dentro de los ficheros; scripts o herramientas que lean metadatos internos pueden confundirse.
- Idiomas no declarados: no se puede asumir un rendimiento correcto en castellano ni en ningún otro idioma sin probarlo.
- Contexto no documentado: se desconoce la ventana máxima, lo que impide dimensionar caché KV y planificar casos de uso con documentos largos.
- Falta de validación comunitaria: 0 descargas y 0 likes; el repo se creó y actualizó con un minuto de diferencia, sin historial de uso.
- Licencia Apache 2.0 con petición de atribución: Prism ML solicita públicamente el crédito "Created using Bonsai by Prism ML" al desplegar o redistribuir, y Qwen/Alibaba Cloud mantiene sus propios términos sobre el modelo base.
- Riesgo de alucinación: inherente a un modelo de este tamano y acentuado por la cuantización ternaria; no se han publicado mediciones de fidelidad factual.
- Sesgos: no documentados por el autor; habría que remitirse a las fichas de Qwen3.5 y de Ternary Bonsai 2.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/precey/chatnano-models
- Modelo base 2B: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Modelo base 4B: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Modelo base 9B: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Licencia del modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Nota: las búsquedas web realizadas no han devuelto repositorio, paper ni demo oficiales de la aplicación ChatNano ni de Prism ML. El repositorio de GitHub `papayaah/chatnano` que aparece en los resultados es un proyecto distinto (chat con la IA integrada de Google Chrome) y no guarda relación con estos modelos.
