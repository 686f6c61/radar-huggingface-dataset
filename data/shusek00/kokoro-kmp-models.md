# Shusek00/kokoro-kmp-models

## Resumen

El repositorio `Shusek00/kokoro-kmp-models` es un catálogo completo de voces del modelo de síntesis de voz Kokoro, convertidas a formato ONNX para su uso con ONNX Runtime en entornos de ejecución en el dispositivo (on-device). Lo mantiene el desarrollador Shusek00 y se publica bajo licencia Apache-2.0. Incluye 159 voces distribuidas en 10 idiomas y 11 perfiles de locale, cubriendo inglés (EE. UU. y Reino Unido), español, francés, hindi, italiano, japonés, portugués, chino mandarín, polaco y alemán. El catálogo está pensado para aplicaciones Kotlin Multiplatform, Android, JVM y Web, y permite descargar únicamente los artefactos necesarios según la voz seleccionada, optimizando el uso de ancho de banda y almacenamiento.

El modelo base es `hexgrad/Kokoro-82M`, un modelo de texto a voz de 82 millones de parámetros, ligero y rápido, que ofrece una calidad comparable a sistemas mucho más grandes. Este repositorio lo empaqueta en cuatro variantes FP32 de ONNX, junto con los frontends de texto necesarios (Phonemis para la mayoría de idiomas) y un esquema de catálogo versionado que garantiza la integridad de los archivos mediante SHA-256. Su relevancia actual radica en la creciente demanda de soluciones de TTS que funcionen sin conexión, respeten la privacidad y tengan un coste de despliegue mínimo, especialmente en dispositivos móviles y navegadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de síntesis de voz ligero (Kokoro-82M) convertido a ONNX |
| Parametros totales | 82 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 510 fonemas (secuencia de entrada dinámica) |
| Tipos de cuantizacion | FP32 (4 modelos ONNX) |
| Idiomas soportados | de, en, es, fr, hi, it, ja, pl, pt, zh (con perfiles en-US, en-GB, es-ES, fr-FR, hi-IN, it-IT, ja-JP, pt-BR, zh-CN, pl-PL, de-DE) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo base `hexgrad/Kokoro-82M` es un sistema de texto a voz de peso abierto con 82 millones de parámetros. Aunque no se detalla su arquitectura interna en la información proporcionada, se sabe que está diseñado para ser ligero y eficiente, produciendo audio de calidad comparable a modelos mucho más grandes a una fracción del coste computacional. El repositorio `kokoro-kmp-models` no modifica el entrenamiento original, sino que convierte los pesos del modelo (y sus variantes v1.1-zh) a gráficos ONNX, añadiendo los frontends de texto necesarios para la conversión de grafemas a fonemas. Los frontends Phonemis están integrados para la mayoría de idiomas, mientras que japonés y chino requieren adaptadores externos (basados en `misaki[ja]` y `misaki[zh]`). No se han publicado detalles sobre el dataset de entrenamiento, el proceso de alineación o el uso de técnicas como RLHF; la información disponible se centra en el empaquetado y la validación del catálogo ONNX.

## Capacidades

- Síntesis de voz multilingüe con 159 voces en 10 idiomas y 11 perfiles de locale.
- Generación de audio a 24 kHz en formato mono float32.
- Inferencia en CPU, sin necesidad de GPU, mediante ONNX Runtime (versión 1.29 validada).
- Compatibilidad con Kotlin Multiplatform, Android, JVM y Web (WebAssembly).
- Descarga bajo demanda de modelos, voces y frontends según el idioma y la voz seleccionados.
- Verificación de integridad de artefactos mediante SHA-256 y tamaño de archivo.
- Frontends de texto Phonemis integrados para la mayoría de idiomas, con soporte de léxico y etiquetado de partes del discurso para inglés.
- Soporte de voces específicas para chino mandarín (108 voces, incluidas las v1.1-zh) y japonés (5 voces), aunque requieren adaptadores externos para el frontend de texto.
- Salida de duración por token, útil para alineación fonética o sincronización.

## Casos de uso

- Aplicaciones de asistente de voz en dispositivos móviles: el catálogo permite integrar TTS multilingüe en Android sin conexión, con un peso típico de instalación de unos 311 MiB por modelo, lo que lo hace viable para aplicaciones de asistencia personal, navegación o accesibilidad.
- Lectura de textos en navegador: gracias a la compatibilidad con WebAssembly, se puede implementar un lector de pantalla o una función de "leer en voz alta" en aplicaciones web progresivas, sin depender de servicios en la nube.
- Sistemas de audiolibros y podcasts automatizados: las 159 voces permiten generar narraciones en varios idiomas y acentos, con control de velocidad (parámetro `speed`) y estilo (vector `style` de 256 dimensiones).
- Accesibilidad para personas con discapacidad visual: el modelo puede convertir contenido digital en voz en tiempo real en dispositivos de bajo coste, respetando la privacidad al procesar el texto localmente.
- Desarrollo de juegos y experiencias interactivas: los parámetros de estilo y velocidad permiten ajustar la entonación de los personajes, y la baja latencia en CPU facilita su uso en motores de juego multiplataforma.
- Traducción y aprendizaje de idiomas: con soporte para 10 idiomas, se puede usar como herramienta de pronunciación, generando ejemplos de voz para aplicaciones educativas.
- Integración en sistemas de domótica y asistentes embebidos: la naturaleza ligera del modelo (82M parámetros) y su ejecución en CPU lo hacen adecuado para Raspberry Pi, routers o dispositivos IoT con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio se centra en la validación funcional del catálogo ONNX (inferencia correcta para las 159 voces, casos límite de 1, 128 y 510 fonemas, y compatibilidad con ONNX Runtime CPU y WebAssembly), pero no incluye métricas comparativas como MOS (Mean Opinion Score), latencia o throughput frente a otros modelos. La documentación del modelo base destaca su eficiencia, pero sin cifras concretas en esta ficha.

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU, funciona con ONNX Runtime CPU (validado con la versión 1.29).
- RAM: no se especifica un requisito mínimo, pero el modelo FP32 ocupa unos 311 MiB por variante; se recomienda al menos 512 MiB de RAM libre para una operación fluida.
- Dispositivos compatibles: Android, JVM (escritorio/servidor) y Web (WebAssembly).
- Almacenamiento: el repositorio completo ocupa 2.1 GB, pero la descarga bajo demanda permite almacenar solo los artefactos necesarios (modelo + voz + frontend), típicamente menos de 320 MiB.
- Opciones de despliegue: se puede integrar en aplicaciones Kotlin Multiplatform mediante la librería ONNX Runtime, o en Web con ONNX Runtime Web (Wasm). No se mencionan herramientas como vLLM, llama.cpp u Ollama, ya que el formato ONNX está orientado a inferencia ligera.
- Latencia y throughput: no se proporcionan datos medidos; la validación cubre la corrección de la salida, no el rendimiento temporal.

## Comparativa con modelos similares

No se dispone de datos numéricos de comparación en la información proporcionada. Sin embargo, el modelo base `Kokoro-82M` se enmarca en la categoría de TTS ligeros de código abierto, junto a alternativas como:

| Modelo | Parámetros | Idiomas | Formato de pesos | Licencia |
|---|---|---|---|---|
| Kokoro-82M (este catálogo) | 82M | 10 (con perfiles) | ONNX | Apache-2.0 |
| Piper | ~20-100M | ~20 | ONNX | MIT |
| Coqui TTS (XTTS) | ~500M | 17 | PyTorch | MPL-2.0 (no comercial) |

La comparativa cualitativa indica que Kokoro-82M ofrece una calidad de voz comparable a XTTS pero con un tamaño mucho menor, y que Piper es una alternativa similar en ligereza, aunque con menor cobertura de voces y calidad percibida. No hay datos de benchmarks públicos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Los frontends de texto para japonés y chino mandarín no están incluidos en el repositorio; requieren adaptadores externos basados en `misaki[ja]` y `misaki[zh]`, lo que añade complejidad de integración y dependencias adicionales.
- La ventana de contexto está limitada a 510 fonemas por secuencia, lo que puede restringir la síntesis de frases muy largas; en tales casos, el texto debe segmentarse.
- El modelo genera audio a 24 kHz, una frecuencia de muestreo inferior a la de algunos sistemas profesionales (44.1 kHz o 48 kHz), lo que puede ser insuficiente para usos de alta fidelidad.
- No se incluyen pesos cuantizados (solo FP32), por lo que el consumo de memoria es fijo; para dispositivos con recursos muy limitados podría ser necesario una cuantización adicional no proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero los frontends externos para japonés y chino tienen sus propias licencias (Misaki, Open JTalk, UniDic) que pueden imponer restricciones; el repositorio no las distribuye, por lo que el usuario debe gestionarlas.
- El modelo puede presentar alucinaciones fonéticas o errores de pronunciación en nombres propios o palabras poco frecuentes, especialmente en idiomas con frontends externos.
- No se han publicado estudios de sesgos o evaluación de robustez en entornos ruidosos; se recomienda validar en el dominio de aplicación específico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shusek00/kokoro-kmp-models
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio GitHub de Kokoro: https://github.com/hexgrad/kokoro
