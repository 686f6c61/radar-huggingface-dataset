# Irelover/arc-raiders-cheat-esp-v2

## Resumen

El repositorio `Irelover/arc-raiders-cheat-esp-v2` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows presentado como una herramienta de trampas (cheat) con overlay ESP para el videojuego Arc Raiders, distribuido como archivo comprimido ejecutable. La model card no describe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia; en su lugar documenta instrucciones de descarga, una contraseña de descompresión y supuestas características de un ejecutable de terceros.

El contenido incluye referencias cruzadas a otros proyectos (por ejemplo, un supuesto trainer de Kingdom Come: Deliverance 2) y enlaces de descarga alojados en repositorios de GitHub ajenos al autor declarado. No existe información verificable sobre parámetros, contexto, cuantización ni datos de entrenamiento, porque el artefacto no es un modelo lingüístico ni multimodal.

Desde la perspectiva de un catálogo técnico de IA open source, esta ficha no puede evaluarse como modelo. Se documenta aquí únicamente para dejar constancia de que el identificador existe en Hugging Face, que su licencia declarada es MIT y que su contenido no corresponde a la categoría de modelos que este blog cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto descrito es un ZIP con un .exe para Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni describe corpus, tokens de entrenamiento, técnicas de alineación (RLHF, DPO) ni innovaciones de arquitectura. La model card describe un supuesto ejecutable (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, build `v3.4.7`) empaquetado en un ZIP de 4,8 MB protegido con contraseña, orientado a Windows 10 y Windows 11.

Las afirmaciones técnicas de la model card (overlay externo a 144 Hz, escaneo de offsets, exclusión de capturas de OBS/ShadowPlay) corresponden a un programa de trampas para un videojuego, no a un sistema de aprendizaje automático. No hay información verificable sobre su funcionamiento interno, y los enlaces de descarga apuntan a repositorios de GitHub de terceros no relacionados con el autor declarado en Hugging Face.

## Capacidades

- No es un modelo de lenguaje: no genera texto, código ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje natural; los idiomas listados son metadatos del repositorio.
- No dispone de modo thinking, visión, audio ni ninguna capacidad de inferencia.
- El artefacto descrito es un ejecutable de Windows presentado como overlay ESP para un videojuego.

## Casos de uso

- No aplica como modelo de IA. No existen casos de uso legítimos de inferencia, generación o análisis de datos para este repositorio.
- No es adecuado para atención al cliente, generación de código, análisis documental, traducción automática ni ninguna tarea de procesamiento de lenguaje.
- No es adecuado para despliegue en pipelines de producción de IA (vLLM, TGI, llama.cpp, Ollama).
- No es adecuado para investigación en aprendizaje automático ni para evaluación comparativa de modelos.
- Su uso como software de trampas en videojuegos puede infringir los términos de servicio de la plataforma afectada y la legislación aplicable en materia de software malicioso.
- La descarga y ejecución de binarios de procedencia no verificada con contraseña de descompresión constituye un riesgo de seguridad para el sistema del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay inferencia de modelo que ejecutar.
- El artefacto descrito se distribuye como binario para Windows x64 (Windows 10 y Windows 11).
- No hay requisitos de VRAM, GPU ni aceleradores documentados de forma verificable.
- No hay soporte de despliegue mediante vLLM, llama.cpp, Ollama, TGI ni ningún runtime de IA.
- No se dispone de datos de latencia ni throughput porque no existe un modelo subyacente.

## Comparativa con modelos similares

| Aspecto | Este repositorio | Modelo de IA open source típico |
|---|---|---|
| Naturaleza | Paquete ejecutable para Windows | Pesos de red neuronal |
| Pesos publicados | No | Sí (safetensors, GGUF, etc.) |
| Contexto | no disponible | Documentado (p. ej. 8K-128K tokens) |
| Benchmarks | No | MMLU, HumanEval, GSM8K, etc. |
| Runtime de inferencia | No | vLLM, llama.cpp, TGI, Ollama |
| Licencia | MIT | Variable (Apache-2.0, MIT, custom) |

No se identifican modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; cualquier expectativa de inferencia, generación o evaluación es infundada.
- La model card incluye instrucciones para descargar y ejecutar un binario protegido con contraseña desde repositorios de GitHub de terceros, lo que impide verificar su integridad y procedencia.
- Los binarios no verificados distribuidos mediante contraseña de descompresión son un vector habitual de malware; se desaconseja su ejecución.
- El software descrito se presenta como trampa para un videojuego, lo que puede vulnerar los términos de servicio de la plataforma y la normativa aplicable.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del contenido distribuido.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no existe un modelo subyacente que evaluar.
- Los enlaces de descarga apuntan a repositorios de GitHub no vinculados al autor declarado en Hugging Face, lo que sugiere suplantación o agregación de contenido ajeno.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Irelover/arc-raiders-cheat-esp-v2
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub de terceros): https://github.com/SanuvaNaq19/arc-raiders-cheat-esp-v2/releases/latest
