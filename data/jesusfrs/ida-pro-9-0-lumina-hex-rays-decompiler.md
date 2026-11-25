# JESUSFRS/ida-pro-9-0-lumina-hex-rays-decompiler

## Resumen

El repositorio `JESUSFRS/ida-pro-9-0-lumina-hex-rays-decompiler` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo nombre imita el de una herramienta de ingeniería inversa (IDA Pro 9.0 con los plugins Lumina y Hex-Rays Decompiler), pero cuya model card describe en realidad la distribución de un ejecutable para Windows presentado como *trainer/mod* de Monster Hunter Wilds y, en el texto de las preguntas frecuentes, como un *executor* de Roblox. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La información disponible no permite identificar arquitectura, parámetros, contexto ni datos de entrenamiento, porque no existe ningún modelo subyacente. Los enlaces de descarga apuntan a un archivo ZIP de 4,8 MB alojado en un repositorio de GitHub de terceros, protegido con contraseña y distribuido como binario ejecutable que solicita ejecutarse con privilegios de administrador. Este patrón es habitual en campañas de distribución de software no verificado.

Desde la perspectiva de evaluación de modelos, esta ficha debe interpretarse como una advertencia: el artefacto no es apto para ningún uso relacionado con IA, ingeniería inversa legítima ni desarrollo de software, y su descarga conlleva riesgos de seguridad que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura ni entrenamiento. El repositorio no incluye ficheros de pesos (`safetensors`, `GGUF`, `bin` u otros), ni `config.json`, ni tokenizador, ni scripts de inferencia. La model card no describe ningún proceso de preentrenamiento, ajuste supervisado, RLHF o DPO.

El contenido de la model card mezcla terminología de ingeniería inversa (IDA Pro, Lumina, Hex-Rays), de mods de videojuegos (Monster Hunter Wilds) y de ejecución de scripts en Roblox (sUNC, `hookmetamethod`, `getgc`, `Drawing API`, Luau VM). Esa combinación es incoherente y no corresponde a ningún artefacto técnico real; los datos numéricos que aparecen (306 Hz, 220 Hz, 388 Hz, 13 y 15 hilos de trabajo) no son verificables ni tienen significado técnico asociado a un modelo.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No hay soporte declarado de *tool calling* ni de *function calling*.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- El repositorio declara etiquetas para 14 idiomas, pero no existe modelo que los procese.
- El artefacto distribuido se presenta como un ejecutable de Windows x64 con supuestas funciones de "auto-ejecución", "adjuntar cliente" y "editor Monaco"; ninguna de ellas está verificada ni documentada técnicamente.

## Casos de uso

- Ninguno. El artefacto no es un modelo de IA y no puede emplearse para inferencia, generación ni análisis.
- No es adecuado para ingeniería inversa: no contiene IDA Pro, ni el decompilador Hex-Rays, ni el servicio Lumina; solo usa esos nombres como señuelo.
- No es adecuado para automatización de atención al cliente, generación de código, análisis de documentos ni ninguna tarea de NLP.
- No debe integrarse en pipelines de CI/CD ni en entornos de producción.
- No debe ejecutarse en estaciones de trabajo de desarrollo, aunque la model card indique hacerlo "como administrador".
- Su único uso defendible es el análisis forense del propio binario en un entorno aislado (sandbox sin red y sin credenciales), con fines de investigación de malware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto distribuido: Windows 10 u 11 de 64 bits, según la model card; el ZIP ocupa 4,8 MB y contiene un `.exe` que la propia documentación pide ejecutar con privilegios de administrador.
- Latencia y throughput: no disponibles; las cifras en hercios de la model card no son verificables.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JESUSFRS/ida-pro-9-0-lumina-hex-rays-decompiler` | Artefacto binario (no es modelo de IA) | no disponible | no disponible | MIT declarada | Repositorio de Hugging Face con 0 descargas y 0 likes |
| IDA Pro 9.0 + Hex-Rays (producto comercial de Hex-Rays) | Herramienta de ingeniería inversa | no aplica | no aplica | Comercial, propietaria | Distribución oficial del fabricante |
| Ghidra (NSA) | Suite de ingeniería inversa con decompilador | no aplica | no aplica | Apache 2.0 | Descarga oficial gratuita |
| Modelos de lenguaje para análisis de código (p. ej. familias abiertas tipo CodeLlama o Qwen-Coder) | LLM de código | variable | variable | variable según familia | Hugging Face y otros catálogos |

No se dispone de datos de rendimiento del artefacto que permitan una comparación cuantitativa con ninguno de estos elementos.

## Limitaciones y advertencias

- No es un modelo de IA: no hay pesos, arquitectura ni proceso de inferencia; cualquier expectativa de uso como LLM es infundada.
- Suplantación de identidad: el nombre del repositorio referencia productos comerciales de Hex-Rays (IDA Pro, Lumina, Hex-Rays Decompiler) sin relación con el fabricante.
- Incoherencia interna: la model card describe simultáneamente un *trainer* de Monster Hunter Wilds, un *executor* de Roblox y una herramienta de decompilación, lo que indica contenido generado o copiado sin verificación.
- Indicadores de riesgo: binario `.exe` de origen no verificado, distribución vía GitHub de terceros, archivo ZIP protegido con contraseña (`2026`) y solicitud explícita de ejecución como administrador. Estos rasgos son compatibles con malware, *droppers* o *infostealers*.
- La model card instruye a desactivar o ignorar avisos de Windows Defender y SmartScreen, práctica que incrementa el riesgo de infección.
- Licencia: aunque los metadatos declaran MIT, esa licencia no puede cubrir legalmente componentes propietarios de Hex-Rays ni software de terceros incluido en el binario.
- Sesgos y alucinación: no aplica al no existir modelo; sí aplica el riesgo de que un lector interprete la ficha como descripción de una herramienta legítima.
- Recomendación operativa: no descargar ni ejecutar el artefacto fuera de un entorno de análisis aislado; reportar el repositorio a Hugging Face si se confirma que infringe las condiciones de uso de la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JESUSFRS/ida-pro-9-0-lumina-hex-rays-decompiler
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Página de releases citada en la model card: https://github.com/agnieszkadanielsson36/ida-pro-9-0-lumina-hex-rays-decompiler/releases/latest
- IDA Pro y Hex-Rays Decompiler (fabricante oficial, referencia del nombre suplantado): https://hex-rays.com/ida-pro/
- Ghidra (alternativa libre de ingeniería inversa): https://ghidra-sre.org/
