# kadirify/atlas-guclu-GGUF

## Resumen

Atlas Güçlü es un ajuste fino (fine-tune) del modelo google/gemma-4-12b-it, desarrollado por el usuario kadirify. Se trata de una adaptación mediante LoRA (con los pesos fusionados en el modelo base) orientada a la corrección ortográfica del turco y al uso general de este idioma. No es un modelo entrenado desde cero, sino una especialización del modelo base de Google. Su propósito principal es servir como motor de un asistente de escritorio local de código abierto llamado Atlas.

El modelo cuenta con 11.907.350.576 parámetros totales (aproximadamente 11,9 mil millones) y se distribuye en formato GGUF, concretamente en la cuantización Q5_K_M con un tamaño de archivo de 8,5 GB. Está pensado para ejecutarse de forma totalmente local mediante Ollama, lo que lo hace relevante para desarrolladores que necesitan un asistente en turco sin depender de servicios en la nube.

La relevancia actual del modelo radica en su enfoque específico: mejora sustancialmente la corrección ortográfica en turco respecto al modelo base (del 65,7 % al 85,0 % en una prueba de 300 casos), manteniendo el rendimiento general del modelo original. Su licencia Apache 2.0 y su compatibilidad con Ollama lo convierten en una opción accesible para integraciones locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-12b-it) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (publicada); Q4_K_M (mencionada en pruebas) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del transformer google/gemma-4-12b-it, sobre el que se aplicó un ajuste fino mediante LoRA con r=16 y alpha=32, ejecutado durante 262 + 30 pasos (medio epoch), con ejemplos de hasta 512 tokens y en modo QLoRA de 4 bits. Los pesos LoRA resultantes se fusionaron en el modelo base. El entrenamiento se realizó en una única GPU RTX 5070 de 12 GB.

Los datos de entrenamiento consistieron en frases en turco corrompidas mediante reglas y sus correspondientes versiones corregidas, junto con ejemplos generales en turco e inglés generados con Gemma 4 E4B. Los scripts de entrenamiento están disponibles en la carpeta `training/` del repositorio de Atlas en GitHub. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en turco e inglés.
- Corrección ortográfica en turco, con mejora medida respecto al modelo base.
- Uso general del turco en tareas conversacionales.
- Integración con Ollama para ejecución local.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidad de ejecución totalmente local en el asistente de escritorio Atlas.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Corrección ortográfica de textos en turco: el modelo puede revisar y corregir errores de escritura en documentos, correos o publicaciones, aprovechando su ajuste específico que eleva la precisión al 85,0 % en pruebas de 300 casos.
- Asistente de escritorio local: integrado en la aplicación Atlas, permite a los usuarios interactuar con un asistente en turco sin conexión a internet, ejecutándose mediante Ollama.
- Redacción asistida en turco: ayuda a redactar y mejorar textos en turco manteniendo un rendimiento general equiparable al modelo base (98 sobre 92 preguntas en Atlas-TR).
- Procesamiento de textos bilingües turco-inglés: al soportar ambos idiomas, puede emplearse en flujos de trabajo que combinen contenido en turco e inglés.
- Herramienta educativa para aprendizaje del turco: la corrección ortográfica puede servir para señalar errores comunes de escritura a estudiantes.
- Prototipado de aplicaciones conversacionales locales: gracias a su formato GGUF y licencia Apache 2.0, sirve para desarrollar prototipos de chat en turco sin costes de API.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, es adecuado para procesar textos sensibles en turco sin enviarlos a servidores externos.

## Benchmarks y rendimiento

| Prueba | gemma4:12b (base) | Atlas Güçlü |
|---|---:|---:|
| Prueba de ortografía (300 casos), % | 65,7 | 85,0 |
| Prueba de ortografía difícil (187 casos), % | 64,2 | 86,6 |
| Atlas-TR general (92 preguntas) | 98 | 98 |

Notas del autor: la prueba de ortografía difícil se midió sobre la versión Q4_K_M. La velocidad es ligeramente inferior a la del modelo base debido al mayor tamaño del archivo. La prueba Atlas-TR es una medición pequeña de 92 preguntas, por lo que diferencias de 1-2 puntos no son significativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q5_K_M ocupa 8,5 GB, por lo que se requiere al menos esa cantidad de memoria para cargarlo; con overhead de contexto se recomienda disponer de 10-12 GB.
- GPU recomendadas: RTX 5070 (12 GB) fue la utilizada para el entrenamiento; tarjetas con 12 GB o más de VRAM son adecuadas para inferencia.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 12 GB o más de VRAM (por ejemplo, RTX 5070, RTX 4080, RTX 4090).
- Opciones de despliegue: Ollama (`ollama run kadirify/atlas-guclu`), y por el formato GGUF también es compatible con llama.cpp.
- Latencia y throughput: no disponible; el autor indica únicamente que la velocidad es ligeramente inferior a la del modelo base por el mayor tamaño del archivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Atlas Güçlü | 11,9 B | no disponible | Apache 2.0 | GGUF | Ajuste en turco para corrección ortográfica |
| google/gemma-4-12b-it | ~12 B | no disponible | Apache 2.0 (según modelo base) | safetensors | Modelo base sin ajuste en turco |
| Gemma 4 E4B | no disponible | no disponible | no disponible | no disponible | Usado para generar datos de entrenamiento |

La comparación directa con otras alternativas de la misma categoría (modelos de ~12 B especializados en turco) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las pruebas de ortografía se basan en textos corruptos generados por reglas; el modelo no se ha probado por separado con textos escritos por personas reales.
- La prueba Atlas-TR es una medición pequeña (92 preguntas); diferencias de 1-2 puntos no son significativas.
- Las correcciones no son siempre perfectas; se recomienda revisar manualmente los textos importantes.
- El modelo está orientado principalmente al turco y al inglés; no se dispone de información sobre otros idiomas.
- No se dispone de información sobre sesgos conocidos ni sobre la longitud de contexto soportada.
- La licencia es Apache 2.0, la misma que la del modelo base, por lo que se permite uso comercial; no obstante, conviene verificar las condiciones del modelo base google/gemma-4-12b-it.
- El rendimiento en velocidad es ligeramente inferior al del modelo base debido al mayor tamaño del archivo.

## Enlaces

- Hugging Face: https://huggingface.co/kadirify/atlas-guclu-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Repositorio del asistente Atlas: https://github.com/kadirify/atlas
