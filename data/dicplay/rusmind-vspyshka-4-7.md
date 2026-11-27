# DICPlay/RusMind-Vspyshka-4.7

## Resumen
RusMind 4.7 · Vspyshka (Вспышка) es un ajuste fino (finetune) del modelo google/gemma-4-E4B-it desarrollado por DICPlay, orientado a inferencia en dispositivo (on-device) y uso sin conexión, con especial énfasis en ruso y soporte secundario de inglés. El modelo se presenta como la segunda mejor variante de la familia RusMind en el benchmark ruso MERA v2 para modelos de hasta 10.000 millones de parámetros, con un papel destacado en tareas de corrección ortográfica, comprensión de personajes y llamada de herramientas.

Aunque el nombre comercial menciona "7,5 mil millones de parámetros" en la model card, el dato real de los pesos safetensors asciende a 7.996.156.490 parámetros, lo que concuerda con el tamaño nominal de la familia Gemma 4 E4B. El modelo se distribuye tanto en formato transformers (safetensors) como en GGUF para llama.cpp, LM Studio y Ollama, lo que refuerza su orientación a despliegues locales.

Su relevancia actual radica en la combinación de un tamaño contenido, licencia propia (rusmind-license) y resultados competitivos frente a modelos de 24.000 y 32.000 millones de parámetros en tareas humanocéntricas y de razonamiento dentro del ecosistema rusohablante, además de conservar capacidades multimodales de imagen a texto heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de google/gemma-4-E4B-it |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repo); niveles concretos no disponibles |
| Idiomas soportados | ru, en |
| Licencia | rusmind-license (license: other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo es un finetune del checkpoint google/gemma-4-E4B-it, por lo que hereda la arquitectura transformer multimodal de la familia Gemma 4 en su variante E4B, con pipeline image-text-to-text y salida de texto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o SFT con preferencias.

La model card destaca mejoras respecto a la versión 4.5 en tres frentes: seguimiento de instrucciones compuestas (varias restricciones simultáneas), invocación de herramientas con mayor robustez y comprensión de matices humanos (personajes, humor, adivinanzas, enantiosemia). También se menciona un conocimiento reforzado de historia, cultura y regiones de Rusia. No se documentan innovaciones arquitectónicas propias ni técnicas de decodificación especulativa o atención lineal; el valor añadido es el ajuste de dominio y la optimización para despliegue local en formato GGUF.

## Capacidades
- Generación de texto conversacional en ruso e inglés, con registro formal e informal.
- Razonamiento de sentido común y lógica (NewReasoning en MERA v2).
- Corrección ortográfica y de puntuación en ruso (SAGE), con puntuación reportada de 0,760.
- Roleplay y respuestas en primera persona de personajes (Characters).
- Comprensión léxica fina: desambiguación de palabras y enantiosemia.
- Llamada de herramientas y funciones (tool calling / function calling), con selección correcta de herramienta en el 86 % de los casos y resistencia del 100 % a la sustitución maliciosa de instrucciones según la model card.
- Capacidad multimodal de entrada imagen-texto heredada del modelo base (pipeline image-text-to-text).
- Ejecución local sin conexión en equipos de sobremesa, portátiles y teléfonos de gama alta.
- No se documenta modo de razonamiento extendido (thinking mode); esa función se atribuye a la variante RusMind 4.7 · Sokol.

## Casos de uso
- Corrección y edición de textos en ruso: el modelo puede revisar ortografía y puntuación en flujos de publicación o correo electrónico, aprovechando su puntuación de 0,719 en SAGE y 0,760 en signos de puntuación.
- Asistentes conversacionales locales para atención al usuario rusohablante: al ejecutarse sin conexión en portátiles y equipos de sobremesa, permite desplegar un chatbot de soporte en entornos con requisitos de privacidad o sin red.
- Agentes con herramientas en aplicaciones de escritorio: la tasa de selección correcta de herramienta del 86 % y la robustez frente a inyección de instrucciones lo hacen apto para orquestar acciones locales (ficheros, calendario, APIs internas) en un asistente de sistema.
- Generación de contenido con personajes y narrativa: su puntuación de 0,537 en Characters lo sitúa como opción para videojuegos, simulaciones educativas o ficción interactiva en ruso.
- Educación y divulgación cultural sobre Rusia: el modelo incorpora conocimiento de historia, regiones y pueblos, útil para materiales didácticos o guías turísticas bilingües ru/en.
- Procesamiento de documentos con imágenes: al conservar la entrada image-text-to-text del modelo base, puede extraer y describir información de capturas, formularios o fotografías en un pipeline local.
- Filtrado y enriquecimiento de corpus rusos: tareas de desambiguación léxica (LIMUR 0,465) y detección de enantiosemia (0,373) para anotación semiautomática de datasets.

## Benchmarks y rendimiento
Resultados publicados por el autor, procedentes del benchmark MERA v2 (puntuaciones normalizadas; mayor es mejor):

| Modelo | Parámetros | General | Razonamiento | Humanocéntrico | Cultura y regiones de Rusia |
|---|---|---|---|---|---|
| RusMind Vspyshka 4.7 | 7,5-8,0 B | 0,191 | 0,385 | 0,257 | 0,228 |
| Qwen3.5-9B (Alibaba) | 9 B | 0,186 | 0,339 | 0,218 | 0,118 |
| Gemma 4 E4B (Google) | 8 B | 0,170 | 0,367 | 0,172 | 0,199 |
| T-lite (T-Bank) | 8 B | 0,130 | 0,218 | 0,169 | 0,196 |
| A-Vibe (Avito) | 8 B | 0,113 | 0,187 | 0,132 | 0,171 |
| RuadaptQwen3-32B | 32 B | 0,163 | 0,342 | 0,177 | no disponible |
| Zero-Mistral | 24 B | 0,160 | 0,213 | 0,235 | no disponible |

Resultados por tarea del propio modelo en MERA v2:

| Tarea | Puntuación |
|---|---|
| SAGE (ortografía y puntuación) | 0,719 |
| Characters (roleplay) | 0,537 |
| LIMUR (desambiguación léxica) | 0,465 |
| Enantiosemia | 0,373 |
| NewReasoning (lógica) | 0,330 |
| RUBIN (opción múltiple) | 0,328 |
| GorillaHard (tool calling) | 0,302 |

No se han publicado en la información disponible resultados de benchmarks internacionales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada: con 7.996 millones de parámetros, en FP16 requiere aproximadamente 16 GB; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones teóricas a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 o 8 bits; RTX 4080/4070 Ti (16 GB) para 8 bits.
- GPU de consumo: cabe en tarjetas de 8 GB o más con cuantización GGUF de 4-5 bits; en 4 bits puede ejecutarse en iGPU y en teléfonos de gama alta según el autor.
- Opciones de despliegue: transformers (safetensors), llama.cpp, LM Studio, Ollama y servidores compatibles con endpoints; el repo incluye GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 general | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Vspyshka 4.7 | 7,996 B | no disponible | 0,191 | rusmind-license (other) | Hugging Face, safetensors y GGUF |
| Qwen3.5-9B | 9 B | no disponible | 0,186 | no disponible | no disponible |
| Gemma 4 E4B | 8 B | no disponible | 0,170 | no disponible | no disponible |
| T-lite | 8 B | no disponible | 0,130 | no disponible | no disponible |

La ventaja de Vspyshka 4.7 se concentra en tareas humanocéntricas y cultura rusa, donde supera a modelos de mayor tamaño como RuadaptQwen3-32B y Zero-Mistral; en razonamiento queda ligeramente por debajo de Gemma 4 E4B (0,385 frente a 0,367 a favor de Vspyshka, según la tabla del autor) y por encima de Qwen3.5-9B.

## Limitaciones y advertencias
- La licencia rusmind-license es de tipo "other": es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; el autor ofrece contacto para licencias de organización.
- El modelo está optimizado para ruso e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea inferior.
- Los benchmarks presentados son exclusivamente MERA v2, un benchmark ruso; no hay evidencia publicada en MMLU, HumanEval, GSM8K ni en evaluaciones multimodales, pese a heredar entrada de imagen.
- Riesgo de alucinación inherente a los modelos de 8.000 millones de parámetros, especialmente en conocimiento factual fuera del dominio ruso.
- La model card es material promocional del autor: las afirmaciones comparativas (por ejemplo, superar a T-pro de 33 B en tareas humanocéntricas) proceden de su propia lectura del ranking y deben contrastarse en el leaderboard oficial.
- El modo de razonamiento extendido no está disponible en esta variante; para tareas de razonamiento profundo el autor remite a RusMind 4.7 · Sokol.
- El tamaño del repositorio (62,4 GB) implica que la descarga completa incluye múltiples formatos y cuantizaciones; conviene seleccionar solo los archivos necesarios.
- No se documentan sesgos específicos ni auditorías de seguridad independientes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante con razonamiento: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Demo y acceso web: https://rusmind.ru
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
