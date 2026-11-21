# glyd/gemma-4-12B-kestrel

## Resumen

Gemma 4 12B · Glyd Kestrel es una versión comprimida del modelo instructivo google/gemma-4-12B-it de Google DeepMind, publicada por el usuario glyd bajo licencia Apache 2.0. Se trata de una cuantización de 6 bits por peso (códigos de 6 bits con una escala de 16 bits compartida por cada grupo de 32 pesos, unos 6,5 bits efectivos por peso) empaquetada en el formato propietario del motor Glyd, no en safetensors estándar ni en GGUF. Su objetivo es reducir el peso en disco de 23,8 GB en bf16 a 9,1 GB, de modo que el modelo pueda ejecutarse en GPUs de consumo de la gama RTX 30 o superior.

El repositorio incluye además el modelo draft de Google que acompaña a la familia Gemma 4, lo que permite decodificación especulativa sin alterar la salida del modelo principal. Según los metadatos de safetensors, el checkpoint contiene 9.686.494.193 parámetros, un dato que no coincide con la denominación comercial "12B" del modelo base y que conviene tratar con cautela.

La relevancia de esta ficha es doble: por un lado, muestra una alternativa de compresión agresiva orientada a hardware de consumo; por otro, ilustra las limitaciones de los formatos propietarios, ya que estos pesos solo funcionan con el motor Glyd (versión 0.34.0 o superior, Linux con NVIDIA) y no son compatibles con Transformers, vLLM ni llama.cpp. Es una cuantización con pérdida (lossy), obtenida por redondeo simple al código de 6 bits más cercano, no una reproducción bit a bit del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4, según el modelo base; detalles no disponibles) |
| Parametros totales | 9.686.494.193 según safetensors (el modelo base se denomina comercialmente 12B; discrepancia no aclarada) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits por peso con escala de 16 bits por grupo de 32 pesos (~6,5 bits/peso); layout `i6` del motor Glyd |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario de Glyd (no safetensors estándar, no GGUF); incluye modelo draft en `draft/` |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint google/gemma-4-12B-it, fijado en el commit `43c9d014b231474fa7212dbb48a762566c2b255d`. La arquitectura subyacente corresponde a la familia Gemma 4 de Google DeepMind en su variante densa e instructiva; la model card de esta versión no aporta detalles sobre número de capas, dimensiones ocultas, mecanismo de atención ni composición del dataset de entrenamiento del modelo original. Tampoco se documenta si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento.

La innovación técnica de esta publicación es el esquema de compresión: cada peso se redondea al más cercano de sus códigos de 6 bits y se multiplica por la escala de su grupo, con empaquetado mediante `glyd-engine pack google/gemma-4-12B-it OUT --layout i6`. El resultado ocupa 9,1 GB en disco frente a los 23,8 GB en bf16. Además, se incluye el modelo draft de Google para decodificación especulativa, que acelera la generación sin modificar la salida. El autor indica que las mediciones de velocidad y calidad en GPUs reales se añadirán cuando pasen su "release gate"; en el momento de redactar esta ficha no están publicadas.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo instructivo Gemma 4 12B-it.
- Razonamiento y matemáticas: capacidades propias del modelo base, no verificadas de forma independiente en esta cuantización.
- Generación de código: presumible en la familia Gemma 4, sin datos específicos publicados para esta versión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible; la model card no enumera idiomas.
- Decodificación especulativa mediante el modelo draft incluido en `draft/`.
- Modalidad: solo texto. El autor indica explícitamente que aún no hay entrada de imagen ni audio.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de consumo: con 9,1 GB en disco y ~6,5 bits por peso, el modelo está pensado para RTX 30 o superior, lo que permite ejecutar un modelo de la clase 12B en equipos que no podrían cargar los 23,8 GB en bf16.
- Prototipado local de asistentes conversacionales: el formato instructivo y la decodificación especulativa con el draft incluido permiten iterar en local con latencia reducida, siempre que el equipo cumpla los requisitos de Linux y NVIDIA.
- Evaluación de compresión con pérdida: útil para investigadores que quieran medir el impacto del redondeo a 6 bits frente a los pesos originales o frente a la variante sin pérdida del mismo autor (gemma-4-12B-penguin).
- Generación de texto en pipelines internos sin conexión: al ejecutarse con un motor local, encaja en entornos con requisitos de privacidad donde no se desea enviar datos a APIs externas.
- Comparación de motores de inferencia: sirve como banco de pruebas para contrastar el rendimiento del motor Glyd con vLLM o llama.cpp usando los pesos originales de Google.
- Docencia y experimentación con cuantización: el repositorio ahorra la descarga de 24 GB y el empaquetado local, lo que simplifica demostraciones sobre técnicas de compresión en GPUs asequibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la velocidad y la calidad en GPUs reales se medirán mediante el "release gate" de Glyd y se añadirán a la ficha cuando estén disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, el peso en disco es de 9,1 GB, a lo que hay que sumar la caché KV y el modelo draft, por lo que se necesita holgadamente más de 10 GB de VRAM.
- GPU recomendadas: el autor especifica NVIDIA RTX 30 series o superior; no se mencionan A100, H100 ni otros aceleradores de datacenter.
- Compatibilidad con GPU de consumo: sí, en la gama RTX 30 o posterior, según el autor.
- Sistemas operativos: solo Linux. No hay soporte para Mac ni AMD "todavía", según la model card.
- Opciones de despliegue: exclusivamente el motor Glyd (versión 0.34.0 o superior), con los comandos `glyd run google/gemma-4-12B-it:kestrel` o `glyd run glyd/gemma-4-12B-kestrel`. No es compatible con Transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; pendientes de las mediciones del release gate del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motores compatibles |
|---|---|---|---|---|---|
| glyd/gemma-4-12B-kestrel | 9.686.494.193 (safetensors) | no disponible | Propietario Glyd, ~6,5 bits/peso, 9,1 GB | Apache 2.0 | Solo Glyd |
| glyd/gemma-4-12B-penguin | no disponible | no disponible | Propietario Glyd, sin pérdida (bit a bit) | Apache 2.0 | Solo Glyd |
| google/gemma-4-12B-it | 12B (denominación comercial) | no disponible | safetensors bf16, 23,8 GB | Apache 2.0 | Transformers, vLLM, llama.cpp y otros |

La comparación con alternativas de otros fabricantes del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Cuantización con pérdida: el redondeo a 6 bits introduce degradación de calidad respecto a los pesos originales; el autor no publica aún métricas que cuantifiquen esa pérdida.
- Formato propietario: los pesos solo funcionan con el motor Glyd 0.34.0 o superior. No se pueden cargar en Transformers, vLLM ni llama.cpp; para esos entornos hay que usar los pesos de Google.
- Plataforma restringida: solo Linux con NVIDIA RTX 30 o superior; sin soporte para Mac ni AMD.
- Solo texto: no admite entrada de imagen ni audio.
- Idiomas: no se documenta la cobertura lingüística; no se puede asumir soporte multilingüe sin verificación.
- Sesgos y alucinaciones: no hay información específica en la model card; deben asumirse los sesgos y el riesgo de alucinación del modelo base Gemma 4 12B-it.
- Discrepancia de parámetros: el recuento de safetensors (9,69 mil millones) no coincide con la denominación "12B" del modelo base; conviene verificar el tamaño real antes de planificar el despliegue.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, creado y actualizado el 21 de noviembre de 2026; sin validación comunitaria ni benchmarks publicados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero debe respetarse también la licencia del modelo base de Google.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/glyd/gemma-4-12B-kestrel
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante sin pérdida del mismo autor: https://huggingface.co/glyd/gemma-4-12B-penguin
