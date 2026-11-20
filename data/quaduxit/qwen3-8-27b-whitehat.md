# QuaduxIT/Qwen3.8-27B-Whitehat

## Resumen

Qwen3.8-27B-Whitehat es un fine-tune de Qwen/Qwen3.8-27B desarrollado por Quadux IT GmbH, orientado a trabajo de seguridad ofensiva y defensiva autorizada (red-team y white-hat). El modelo parte de una arquitectura densa híbrida de 64 capas con cabeza MTP (multi-token prediction) para decodificación especulativa, y conserva la torre de visión del modelo base, por lo que acepta entradas de texto e imagen. Este repositorio contiene los pesos de referencia en BF16 safetensors, es decir, el checkpoint fusionado del que derivan todas las variantes cuantizadas del autor (FP8, W8A16, NVFP4 y la escalera GGUF).

El problema que aborda es concreto: los modelos alojados en servicios externos rechazan buena parte de las tareas legítimas de seguridad, y además enviar datos sensibles de vulnerabilidades a un tercero suele ser inviable. El ajuste desbloquea el dominio de seguridad informática (desarrollo de exploits, análisis de malware, ingeniería inversa, investigación de DRM) manteniendo el rechazo ante daño físico real y material de abuso infantil, tanto en texto como en imagen y en varios idiomas. No es un modelo totalmente sin censura: esa frontera es deliberada.

Con 27.781.427.952 parámetros reales según safetensors y una ventana nativa de 262.144 tokens, se posiciona como una alternativa de despliegue local para equipos de seguridad que necesitan un asistente privado con capacidades multimodales y de llamada a funciones, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido, 64 capas + cabeza MTP (multi-token prediction); incluye torre de visión y `mmproj` |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | BF16 (este repo); variantes del autor: FP8 W8A8, INT8 W8A16 (Marlin), NVFP4 4-bit, escalera GGUF |
| Idiomas soportados | en, de, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, precisión completa, ~52 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso híbrido de 64 capas con una cabeza MTP preservada para decodificación especulativa, siempre que el runtime la soporte. La modalidad es texto e imagen: el repositorio incluye el modelo de lenguaje, la torre de visión y el `mmproj` necesarios para el pipeline `image-text-to-text`. El cambio respecto al base consiste en un fine-tune supervisado con LoRA centrado en el comportamiento, posteriormente fusionado en los pesos, de modo que el comportamiento queda incorporado y no requiere system prompt.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El autor sí especifica la metodología de evaluación: un conjunto interno de prompts retenidos, excluidos del entrenamiento, con temperatura 0 y sin system prompt, midiendo si el modelo produce una respuesta sustantiva ("comply") o declina ("refuse"). El ajuste busca un punto intermedio entre el base, que según el autor rechaza aproximadamente el 40 % del trabajo legítimo de seguridad y el 100 % de las tareas ofensivas, y los modelos abliterated, que carecen de cualquier barrera.

## Capacidades

- Generación de texto y razonamiento en el dominio de ciberseguridad, con cobertura de tareas ofensivas y defensivas.
- Asistencia en desarrollo de exploits, desarrollo y análisis de malware, ingeniería inversa e investigación de licencias y DRM.
- Entrada multimodal: procesa imágenes y capturas de pantalla junto con texto.
- Llamada a funciones y tool calling, según los tags del repositorio.
- Conversación multi-turno con ventana de 262.144 tokens.
- Capacidades multilingües, con inglés y alemán declarados explícitamente y soporte multilingüe genérico.
- Decodificación especulativa mediante la cabeza MTP, sujeta al soporte del runtime.
- Rechazo deliberado de contenido de daño físico (armas, explosivos, drogas, venenos, armas químicas o biológicas, violencia) y de material de abuso infantil, tanto en texto como en imagen y en cualquier idioma.

## Casos de uso

- Red-team interno autorizado: el modelo redacta y explica cadenas de explotación, payloads de prueba y vectores de ataque sobre sistemas propios o con permiso explícito, sin las negativas que aplican los modelos alojados.
- Análisis de malware en entorno controlado: permite diseccionar muestras, describir el comportamiento de un binario y extraer indicadores, manteniendo los datos sensibles dentro de la infraestructura del equipo.
- Ingeniería inversa asistida: con entrada de imagen puede interpretar capturas de un desensamblador o de una interfaz de depuración y razonar sobre el flujo de ejecución mostrado.
- Autoevaluación de vulnerabilidades: actúa como asistente para revisar configuraciones, interpretar resultados de escáneres y priorizar hallazgos antes de un informe formal.
- Formación en concienciación de seguridad: genera escenarios de phishing simulado y ejercicios de mesa sobre sistemas de la propia organización, con la ventaja de que el contenido ofensivo no se rechaza.
- Desarrollo de herramientas defensivas: ayuda a escribir reglas de detección, parsers de logs y automatizaciones de respuesta, aprovechando el tool calling para integrarse en pipelines.
- Asistente local para equipos distribuidos: al caber en un despliegue con vLLM sobre una GPU de 80 GB en BF16, permite servir el modelo en infraestructura propia sin exponer datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una evaluación interna de cumplimiento y rechazo sobre un conjunto de prompts retenidos, sin cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM para BF16 (este repositorio): aproximadamente 52 GB de pesos, lo que exige en torno a 56-60 GB de VRAM contando caché KV y overhead; una A100 80 GB o H100 80 GB es el mínimo práctico para contexto largo.
- Variante FP8 W8A8 (~27 GB): encaja en GPUs Hopper, Ada o Blackwell; una RTX 4090 de 24 GB queda justa y probablemente requiera contexto reducido u offloading.
- Variante INT8 W8A16 Marlin (~27 GB): mismas consideraciones que FP8, con soporte en vLLM y CUDA.
- Variante NVFP4 (~17 GB): experimental, limitada a Blackwell; es la opción más ligera para GPUs de consumo de gama alta.
- Escalera GGUF (4-54 GB): permite ejecución con llama.cpp y Ollama en GPUs de consumo, desde configuraciones de 8-12 GB con cuantizaciones agresivas hasta 24 GB con cuantizaciones altas.
- Despliegue: transformers y vLLM con `--trust-remote-code` para los pesos BF16; llama.cpp para GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Whitehat | 27,8 B | 262.144 | Dominio de seguridad desbloqueado, daño físico rechazado | Apache 2.0 | Hugging Face, múltiples formatos |
| Qwen/Qwen3.8-27B (base) | 27,8 B | 262.144 | Guardrails estrictos; rechaza tareas ofensivas | Apache 2.0 | Hugging Face |
| Modelos abliterated de tamaño similar | ~27 B | variable | Sin guardrails; responde a cualquier petición | variable | Hugging Face |

Frente al base, la diferencia es de comportamiento, no de arquitectura ni de contexto: mismo tamaño y misma ventana, con el dominio de seguridad habilitado. Frente a los modelos abliterated, la diferencia es que aquí se conservan los rechazos de daño físico y material de abuso infantil. No se dispone de datos de rendimiento comparado con estas alternativas.

## Limitaciones y advertencias

- Modelo de doble uso: no es un asistente de propósito general y no debe desplegarse ante usuarios finales no confiables.
- Riesgo de alucinación en contenido técnico: las explicaciones de exploits, vulnerabilidades o comportamiento de malware pueden contener detalles incorrectos y deben verificarse siempre.
- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar de Qwen3.8-27B, hereda los del modelo base, que tampoco se detallan.
- Cobertura idiomática limitada declarada a inglés, alemán y multilingüe genérico; el rendimiento en castellano no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el autor impone por escrito una restricción de uso a trabajo de seguridad autorizado y exige aceptar su descargo de responsabilidad al descargar el modelo.
- El modelo no incluye garantías y se distribuye "as is"; la responsabilidad legal y la autorización sobre los sistemas objetivo recaen en el usuario.
- El comportamiento está en los pesos y no requiere system prompt, lo que dificulta modularlo o restringirlo por configuración en producción.
- El contexto nativo de 262.144 tokens puede no estar disponible en todos los runtimes o cuantizaciones; verificar en el backend elegido.
- La decodificación especulativa vía MTP solo funciona donde el runtime la soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante FP8: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-FP8
- Variante W8A16: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-W8A16
- Variante NVFP4: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-NVFP4
- Variante GGUF: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-GGUF
- Colección del autor: https://huggingface.co/collections/QuaduxIT/qwen38-27b-whitehat-6a89b5f640072fc5e6838c4b
- Sitio del autor: https://quadux.it/
