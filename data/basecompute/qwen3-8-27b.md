# basecompute/Qwen3.8-27B

## Resumen

El modelo `basecompute/Qwen3.8-27B` es una versión cuantizada del modelo Qwen3.8-27B, preparada por BaseRT para ejecución local rápida en Apple Silicon mediante Metal. Se trata de un modelo denso de 27 mil millones de parámetros orientado a tareas de razonamiento y visión-lenguaje, con una arquitectura de atención híbrida que combina Gated DeltaNet con atención completa periódica. La versión cuantizada a 4 bits ocupa 17 GB y requiere unos 24 GB de memoria unificada, mientras que la versión a 8 bits ocupa 28 GB y necesita al menos 48 GB. El formato de pesos es `.base`, específico de la librería BaseRT, lo que limita su uso a esa infraestructura.

Este modelo resulta relevante para desarrolladores que trabajan en entornos Apple y necesitan ejecutar un modelo multimodal de razonamiento de forma local, sin depender de servicios en la nube. Al estar licenciado bajo Apache 2.0, permite uso comercial sin restricciones adicionales. No obstante, al tratarse de un modelo reciente (creado en agosto de 2026) con cero descargas, aún no se dispone de datos de rendimiento ni de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, atención híbrida (Gated DeltaNet + atención completa periódica) |
| Parametros totales | 27 mil millones (aproximadamente, según el nombre del modelo) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (Q4) y 8-bit (Q8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.base` (formato propietario de BaseRT) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo denso de 27B parámetros con una arquitectura de atención híbrida que intercala capas de Gated DeltaNet con capas de atención completa periódica. Esta combinación busca reducir el coste computacional de la atención estándar manteniendo la capacidad de modelar dependencias de largo alcance. La versión publicada por BaseRT es una cuantización posterior al entrenamiento, por lo que no se ha realizado ningún ajuste fino adicional sobre los pesos originales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Razonamiento multimodal: el modelo puede procesar entradas de texto e imagen y generar respuestas razonadas.
- Razonamiento de varios pasos: al ser un modelo de razonamiento, está diseñado para resolver problemas que requieren cadenas de pensamiento.
- Inferencia local en Apple Silicon: gracias a la cuantización y al formato `.base`, se ejecuta eficientemente en hardware Apple con Metal.
- No se ha confirmado soporte para tool calling, function calling ni capacidades de agente en la información disponible.
- No se han especificado capacidades multilingües más allá de lo que herede del modelo base, que no se detalla.

## Casos de uso

- Asistente de análisis de documentos técnicos con imágenes: el modelo puede leer diagramas, capturas de pantalla o esquemas junto con texto, y generar explicaciones razonadas. Su tamaño de 27B permite respuestas de alta calidad sin necesidad de conexión a internet.
- Prototipado de aplicaciones de visión-lenguaje en entornos Apple: al ejecutarse localmente en Mac, es adecuado para desarrolladores que necesitan iterar rápido sin enviar datos a servidores externos.
- Generación de informes automatizados a partir de datos visuales y textuales: por ejemplo, resumir gráficos y tablas en informes ejecutivos, aprovechando su capacidad de razonamiento.
- Investigación académica en entornos con restricciones de privacidad: al ser local, permite procesar datos sensibles sin salir del dispositivo.
- Desarrollo de herramientas de accesibilidad: descripción de imágenes para personas con discapacidad visual, con razonamiento contextual.
- Experimentación con arquitecturas de atención híbrida: al ser un modelo reciente con una arquitectura poco común, puede servir como referencia para estudios comparativos sobre eficiencia de atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la versión Q4 requiere aproximadamente 24 GB de memoria unificada en Apple Silicon; la versión Q8 requiere al menos 48 GB.
- GPU recomendadas: exclusivamente Apple Silicon con soporte Metal (M1, M2, M3 y sucesores). No se indican requisitos para GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: sí, en Macs con suficiente memoria unificada (por ejemplo, Mac Studio o MacBook Pro de gama alta).
- Opciones de despliegue: únicamente mediante la librería BaseRT, con comandos `basert pull` y `basert chat`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo base Qwen3.8-27B podría compararse con otros modelos de 27B de razonamiento multimodal, pero no se han publicado datos de rendimiento de esta versión cuantizada. Se recomienda consultar la documentación del modelo original para más detalles.

## Limitaciones y advertencias

- El formato de pesos `.base` es exclusivo de la librería BaseRT; no es compatible con otros frameworks de inferencia estándar.
- No se han documentado sesgos específicos, pero al ser una cuantización de un modelo preexistente, es probable que herede los sesgos del modelo original.
- El riesgo de alucinación no ha sido evaluado públicamente; se recomienda validar las respuestas en aplicaciones críticas.
- La longitud de contexto no se ha especificado, por lo que no se conocen los límites de entrada de texto o imagen.
- Aunque la licencia Apache 2.0 permite uso comercial, el ecosistema BaseRT es joven y podría tener menos soporte comunitario que alternativas establecidas.
- El modelo tiene cero descargas y cero likes en HuggingFace, lo que sugiere una falta de validación por parte de la comunidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/basecompute/Qwen3.8-27B)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio BaseRT en GitHub](https://github.com/basecompute/baseRT)
