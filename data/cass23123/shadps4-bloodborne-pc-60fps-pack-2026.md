# Cass23123/shadps4-bloodborne-pc-60fps-pack-2026

## Resumen

`Cass23123/shadps4-bloodborne-pc-60fps-pack-2026` es un repositorio alojado en Hugging Face que, a pesar de su identificador y de las etiquetas de la plataforma, no contiene un modelo de inteligencia artificial. La model card describe un paquete ejecutable para Windows de 64 bits (4,8 MB, comprimido en ZIP) que se presenta como un "pack de 60 FPS" para el emulador shadPS4 aplicado al juego Bloodborne, con instrucciones de instalación, contraseña de extracción y enlaces a binarios alojados en GitHub.

El contenido real del paquete, según los nombres de fichero citados en la propia model card (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`), apunta a un supuesto cheat con ESP y aimbot para el juego Deadlock, distribuido mediante un ejecutable que solicita permisos de administrador y que el propio autor reconoce que puede activar alertas de Windows Defender o SmartScreen. No hay pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

Por tanto, esta ficha no puede documentar arquitectura, entrenamiento, capacidades ni benchmarks: no existe evidencia de que haya un modelo detrás. Se redacta con el objetivo de dejar constancia rigurosa de qué es realmente este repositorio, por qué no debe tratarse como un modelo evaluable y qué riesgos concretos presenta su descarga y ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un paquete ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas en la model card, sin relación con capacidades lingüísticas de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto descrito es un ZIP con un `.exe` para Windows x64, no pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card no menciona transformer, MoE, SSM ni ningún otro paradigma; tampoco dataset, número de tokens, RLHF, DPO ni técnicas de alineación. Los únicos elementos técnicos descritos son propios de un instalador de software para Windows: compatibilidad con Windows 10/11 24H2, ejecución en 64 bits, "7 worker threads", reglas de firewall configuradas automáticamente, supuesta aceleración por GPU mediante CUDA, TensorRT, DirectML y OpenCL, activación offline y copia de seguridad del binario original.

El repositorio mezcla además referencias cruzadas a dos proyectos distintos: por un lado el supuesto pack de shadPS4 para Bloodborne y, por otro, un ejecutable denominado como cheat de Deadlock. Esa incoherencia entre el nombre del repositorio, las etiquetas y el binario enlazado es en sí misma una señal de alarma sobre la naturaleza del contenido.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No hay soporte declarado de function calling ni de razonamiento multi-paso.
- No hay evidencias de capacidades multilingües reales; los códigos de idioma son etiquetas de metadatos sin respaldo técnico.
- El artefacto descrito se limita a un ejecutable que, según la model card, aplica parches de directorio, configura reglas de firewall y requiere ejecución como administrador.
- No se ha publicado ningún modo "thinking", ventana de contexto ni API de inferencia.

## Casos de uso

- Ninguno. No se identifican casos de uso legítimos como modelo de IA, porque no lo es.
- Evaluación de riesgos de cadena de suministro: el repositorio puede usarse como ejemplo documentado de model card mal etiquetada que distribuye binarios ejecutables con contraseña de extracción y solicitud de privilegios de administrador.
- Formación en seguridad: sirve para ilustrar tácticas habituales de distribución de software potencialmente malicioso (nombre atractivo, badges falsos de descargas y valoraciones, enlaces a releases de terceros, contraseña fija "2026" para evadir análisis automatizados).
- Auditoría de plataformas: caso de estudio sobre cómo las etiquetas de Hugging Face (`windows`, `x64`, `portable`) pueden alojar contenido ajeno al propósito de la plataforma.
- Concienciación de usuarios finales: ejemplo de por qué no deben ejecutarse binarios descargados de repositorios de modelos con permisos elevados.
- Investigación de malware: muestra que puede analizarse en un entorno aislado para caracterizar el binario, sin ejecutarlo en sistemas de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye badges de descargas ("495K+") y valoración ("5.0/5") sin fuente verificable, y no aporta métricas de rendimiento del supuesto modelo ni del emulador.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria.
- GPU recomendadas: no aplica. La model card menciona CUDA, TensorRT, DirectML y OpenCL, pero sin especificar modelos de GPU ni requisitos verificables.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un `.exe` para Windows x64.
- Latencia y throughput: no disponibles.
- Requisitos declarados por el autor: Windows 10/11 24H2, arquitectura x64, ejecución como administrador y 4,8 MB de espacio para el ZIP.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque el repositorio no contiene un modelo de IA. Frente a repositorios legítimos de pesos (safetensors o GGUF con model card, configuración y tokenizador), este carece de todos los artefactos esperables.

| Criterio | Este repositorio | Modelo de IA típico en Hugging Face |
|---|---|---|
| Pesos | No | Sí (safetensors, GGUF, etc.) |
| Configuración de arquitectura | No | Sí (`config.json`) |
| Tokenizador | No | Sí |
| Benchmarks | No verificables | Publicados por el autor o la comunidad |
| Artefacto distribuido | ZIP con `.exe` y contraseña | Pesos y código de inferencia |
| Licencia | MIT declarada | MIT, Apache-2.0, Llama, etc. |

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse en MMLU, HumanEval, GSM8K ni ninguna otra prueba de modelos.
- Riesgo de seguridad elevado: el paquete enlaza a un ejecutable alojado en un repositorio de GitHub de terceros, protegido con contraseña fija y que solicita ejecución como administrador.
- El propio autor advierte de posibles alertas de Windows Defender y SmartScreen y recomienda whitelistear el directorio, práctica que desactiva defensas del sistema.
- Incoherencia de identidad: el repositorio se presenta como pack de shadPS4/Bloodborne, pero el binario enlazado se denomina como cheat de Deadlock con ESP y aimbot.
- Badges de descargas y valoración sin verificación; el contador real de Hugging Face muestra 0 descargas y 0 likes.
- Uso comercial: la licencia MIT declarada no aporta garantías sobre el binario distribuido, que además podría infringir términos de servicio de los juegos mencionados.
- Idiomas: los 14 códigos de idioma son etiquetas de metadatos sin respaldo funcional.
- No debe ejecutarse en máquinas de producción, de trabajo ni con cuentas personales; cualquier análisis debe hacerse en una máquina virtual aislada y sin credenciales.
- La búsqueda web asociada no aporta información técnica sobre el repositorio; el único resultado encontrado trata de otro tema (novela web en chino) y no es relevante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Cass23123/shadps4-bloodborne-pc-60fps-pack-2026
- Release de GitHub enlazada en la model card (ZIP del ejecutable): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de GitHub alternativo citado en la model card: https://github.com/Sanchez6365/shadps4-bloodborne-pc-60fps-pack-2026/releases/latest
- Paper, blog o demo oficial: no disponible
