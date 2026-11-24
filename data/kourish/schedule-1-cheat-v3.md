# kourish/schedule-1-cheat-v3

## Resumen

El artefacto publicado bajo el identificador `kourish/schedule-1-cheat-v3` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits (4,8 MB) distribuido como archivo ZIP protegido con contraseña, que el autor presenta como una herramienta de trampas ("cheat") para un videojuego. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje, y su pipeline no está definido.

La model card describe un supuesto motor externo en modo usuario con suavizado de entrada Bézier, radar 2D, escáner dinámico de offsets, perfiles JSON intercambiables en caliente y una tecla de pánico para descargar el proceso. Todos esos elementos corresponden a la descripción de un programa de manipulación de memoria de otro proceso en Windows, no a un sistema de inferencia. El repositorio incluye enlaces a binarios alojados en GitHub bajo cuentas de terceros y una contraseña de descompresión fija.

Desde la perspectiva de la evaluación de modelos, esta ficha no puede aportar especificaciones técnicas de IA porque no existen. El interés de documentarlo es exclusivamente como advertencia de seguridad: la distribución de ejecutables ofuscados mediante archivos comprimidos con contraseña y alertas de SmartScreen desactivadas es un patrón habitual de malware. No se recomienda su descarga ni ejecución en ningún entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repo, sin relación con capacidades lingüísticas reales) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido descrito en la model card es un binario `fisch-script-auto-catch-macro-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB, con compilación etiquetada como `v4.2.9 (30B25F)`. Las capacidades que anuncia (inyección de entrada, lectura de memoria de otro proceso, radar de objetos, escaneo de firmas de punteros a 450 Hz) son técnicas de ingeniería inversa y manipulación de videojuegos, no de aprendizaje automático.

No hay dataset, no hay tokens de entrenamiento, no hay RLHF ni DPO, y no hay innovación técnica en el ámbito de la IA. Cualquier lectura de los términos "modelo" o "build" en la documentación debe interpretarse como mercadotecnia del autor del paquete, no como especificación de un sistema entrenado.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; las etiquetas de idioma del repositorio son metadatos de indexación sin respaldo funcional.
- El binario declara funciones de manipulación de un proceso de juego en Windows (suavizado de entrada, radar 2D, filtro de botín, escáner de offsets, perfiles JSON, tecla de pánico `END`).
- No dispone de modo thinking, visión, audio ni ninguna modalidad de IA.

## Casos de uso

- Ninguno en el ámbito de IA: no se puede desplegar como modelo en ningún pipeline de inferencia, serving o evaluación.
- Auditoría de seguridad: analizar el patrón de distribución (ZIP con contraseña, ejecutable que requiere permisos de administrador, enlaces a releases de GitHub de terceros) como ejemplo de cadena de suministro sospechosa.
- Formación en concienciación: usar la model card como caso práctico de repositorio que se hace pasar por modelo en Hugging Face sin serlo.
- Investigación de malware: estudiar el binario en un entorno aislado y sin red para caracterizar su comportamiento, si se dispone de sandbox adecuado.
- Documentación de taxonomías: clasificar este tipo de artefactos en los sistemas de moderación de hubs de modelos.
- Denuncia y reporte: notificar el repositorio a Hugging Face por uso indebido de la plataforma y por distribución de software potencialmente malicioso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- No requiere GPU ni VRAM: no hay inferencia de red neuronal.
- Requiere un sistema Windows 10 u 11 de 64 bits (Intel o AMD) según la documentación del autor.
- No cabe en el concepto de "consumer GPU" porque no usa GPU.
- Opciones de despliegue: ninguna de las habituales (vLLM, llama.cpp, Ollama, TGI) es aplicable.
- Latencia y throughput: no disponibles en términos de inferencia; el autor menciona cifras internas del binario (respuesta < 20 ms, sondeo a 450 Hz) que no son verificables ni relevantes para IA.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos de IA comparable porque el artefacto no pertenece a ninguna. Frente a modelos reales del hub (por ejemplo, Llama, Mistral o Qwen), la diferencia no es de rendimiento sino de naturaleza: aquellos contienen pesos y arquitectura; este contiene un ejecutable de terceros.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier uso esperado de inferencia, generación o evaluación es imposible.
- Riesgo de seguridad alto: ejecutable ofuscado en ZIP con contraseña, distribución vía cuentas de GitHub ajenas al autor del repo y petición explícita de ejecución como administrador.
- La documentación indica que Windows Defender y SmartScreen pueden alertar; el autor sugiere ignorar esas alertas, lo que constituye una señal de alarma clásica.
- La licencia MIT declarada en metadatos no garantiza la legalidad del contenido ni la ausencia de código malicioso.
- El uso de herramientas de trampa en videojuegos puede violar los términos de servicio de las plataformas y acarrear el bloqueo de cuentas.
- No hay verificación independiente del binario, ni hashes publicados, ni auditoría de terceros.
- Descargas y likes a cero en el momento de la consulta, pese a que la model card muestra insignias de "98K+ descargas" no verificables.
- No debe ejecutarse en entornos de producción, desarrollo ni personales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kourish/schedule-1-cheat-v3
- Enlace de descarga citado en la model card (GitHub, cuenta de terceros): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub, cuenta de terceros): https://github.com/BerndLundberg165/schedule-1-cheat-v3/releases/latest
- No se han encontrado papers, blogs, demos ni repositorios oficiales asociados a un modelo de IA.
