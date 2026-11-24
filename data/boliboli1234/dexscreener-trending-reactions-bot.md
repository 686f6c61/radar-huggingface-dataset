# BoliBoli1234/dexscreener-trending-reactions-bot

## Resumen

`BoliBoli1234/dexscreener-trending-reactions-bot` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**, sino un supuesto ejecutable portable para Windows 10 y Windows 11 distribuido como fichero `.exe` comprimido en un `.zip` de 8,9 MB. El autor lo presenta como una herramienta de automatización de reacciones sobre tokens en tendencia de Dexscreener, con aceleración por GPU (CUDA, TensorRT, DirectML, OpenCL) y licencia MIT declarada en los metadatos.

La model card no describe arquitectura de red neuronal, parámetros, tokenizador, dataset de entrenamiento ni proceso de alineación. Los campos de pipeline, arquitectura y pesos están vacíos o no disponibles, y el repositorio no incluye ficheros `safetensors`, `GGUF` ni configuración de transformers. Por tanto, técnicamente no es evaluable como modelo de lenguaje y esta ficha documenta lo que el autor declara, marcando como "no disponible" todo aquello que no consta.

Es relevante ahora exclusivamente como caso de estudio de malas prácticas en la publicación de artefactos en Hugging Face: uso de etiquetas de modelo para distribuir binarios ejecutables, contraseña de extracción incrustada en el README, enlaces a un repositorio de GitHub de terceros y afirmaciones de rendimiento ("195 Hz", "< 6 ms", "7 worker threads") sin benchmark reproducible ni código fuente auditable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (se distribuye un `.zip` con un `.exe` win64) |
| Plataforma objetivo | Windows 10 / Windows 11, 64 bits |
| Tamaño del paquete | 8,9 MB (según model card) |
| Versión / build declarados | v1.0.4, firma `7F53862682` |
| Contraseña de extracción | `2026` (indicada en el README) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-23 |
| Fecha de actualización | 2026-11-24 |

## Arquitectura y entrenamiento

No hay información sobre arquitectura neuronal, corpus de entrenamiento, número de tokens procesados ni técnicas de alineación (RLHF, DPO, SFT). El artefacto publicado no es un checkpoint de pesos: es un binario ejecutable empaquetado en un ZIP. La model card menciona de forma genérica "GPU hardware acceleration (native CUDA, TensorRT, DirectML & OpenCL rendering)", "7 worker threads", "polling a 195 Hz" y "respuesta en < 6 ms", pero no aporta repositorio de código, dependencias, versión de CUDA, ni metodología de medición.

Tampoco se documenta el mecanismo de interacción con Dexscreener (API oficial, scraping o automatización de navegador), ni qué significa "reactions bot" en términos funcionales. La ausencia de código fuente y de trazabilidad de build impide cualquier auditoría de seguridad.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El autor afirma automatización de "reacciones" sobre tokens en tendencia de Dexscreener, sin especificar el protocolo ni la interfaz.
- Se anuncia aceleración por GPU mediante CUDA, TensorRT, DirectML y OpenCL.
- Se anuncia funcionamiento "100 % offline" para licencias y activación local.
- Multilingüismo: los metadatos listan 14 idiomas, pero no hay evidencia de interfaz ni de procesamiento lingüístico real.

## Casos de uso

- **Auditoría de cadena de suministro de software**: inspeccionar el binario en un entorno aislado (sandbox, VM sin red) para determinar qué procesos, conexiones y claves de registro modifica antes de cualquier uso.
- **Análisis de campañas de distribución maliciosa en Hugging Face**: usar el repositorio como muestra para estudiar patrones de publicación (contraseña en README, enlaces a GitHub de terceros, badges falsos de valoración) en investigaciones de seguridad.
- **Formación en higiene de artefactos ML**: emplearlo como ejemplo negativo en guías internas sobre qué no debe publicarse en un hub de modelos y por qué los binarios ejecutables no pertenecen a un repositorio de pesos.
- **Pruebas de detección de malware**: alimentar el ZIP a motores antivirus y sandboxes (VirusTotal, Cuckoo, CAPE) para calibrar reglas de detección de empaquetados con contraseña.
- **Verificación de claims de rendimiento**: intentar reproducir las cifras declaradas (195 Hz de polling, < 6 ms de respuesta, < 42 MB de RAM) en un entorno controlado para contrastar su verosimilitud.
- **Cumplimiento normativo**: evaluar si la distribución de un ejecutable con licencia MIT y etiquetas de modelo cumple las políticas de la plataforma y la normativa aplicable de ciberseguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas cifras presentes son afirmaciones de la model card (polling a 195 Hz, latencia < 6 ms, uso de RAM < 42 MB, 7 hilos de trabajo), sin metodología, hardware de referencia ni código reproducible, por lo que no deben considerarse mediciones verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA); no disponible.
- GPU recomendadas: el autor menciona CUDA, TensorRT, DirectML y OpenCL sin especificar modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no disponible.
- Sistema operativo: Windows 10 y Windows 11 de 64 bits exclusivamente.
- Opciones de despliegue: ejecución directa del `.exe` como administrador; no se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay pesos.
- Latencia y throughput: solo cifras declaradas por el autor, no verificadas.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable: el artefacto no es un modelo de lenguaje ni un checkpoint, y no se han identificado en la información proporcionada alternativas funcionales equivalentes (bots de automatización de Dexscreener) con documentación técnica verificable.

## Limitaciones y advertencias

- **No es un modelo de IA**: no contiene pesos, tokenizador ni arquitectura; las etiquetas de Hugging Face inducen a error.
- **Riesgo de seguridad alto**: distribución de un `.exe` de procedencia no verificada, con contraseña de extracción en el README para evadir análisis automáticos, enlace de descarga alojado en un repositorio de GitHub de un tercero (`Monty497`) distinto del autor del repositorio de Hugging Face.
- **Solicitud de ejecución como administrador**: eleva privilegios sin justificación técnica documentada.
- **Claims no verificables**: badges de valoración 4,9/5, builds, firmas y métricas de rendimiento sin fuente ni reproducibilidad.
- **Sin código fuente**: no hay repositorio auditable ni cadena de build reproducible; la licencia MIT declarada no es aplicable a un binario sin fuentes.
- **Riesgo de alucinación**: no aplica al no ser un modelo generativo, pero sí hay riesgo de afirmaciones engañosas en la propia model card.
- **Cumplimiento**: la publicación puede infringir las políticas de Hugging Face sobre contenido y distribución de software; se recomienda no descargar ni ejecutar el binario en equipos de producción.
- **Sesgos**: no evaluables.
- **Uso comercial**: la licencia MIT se declara, pero sin código fuente ni titularidad verificable no puede ejercerse con garantías.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BoliBoli1234/dexscreener-trending-reactions-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/Monty497/dexscreener-trending-reactions-bot
- Releases referenciadas: https://github.com/Monty497/dexscreener-trending-reactions-bot/releases/latest
- Paquete directo citado en la model card (no recomendado su descarga): https://github.com/Monty497/dexscreener-trending-reactions-bot/releases/latest/download/dexscreener-trending-reactions-bot-v1.2.0-win64.zip
- Paper, blog o demo oficial: no disponible.
