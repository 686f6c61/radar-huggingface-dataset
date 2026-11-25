# RexyLoveshacks/notepadplusplus-install-pro-portable

## Resumen

El artefacto publicado bajo el identificador `RexyLoveshacks/notepadplusplus-install-pro-portable` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un instalador ejecutable para Windows x64 (`notepadplusplus-install-pro-portable-v1.2.0-win64.exe`), empaquetado en un archivo ZIP de 8,9 MB protegido con contraseña. La model card no describe ninguna arquitectura neuronal, pesos, tokenizador ni pipeline de inferencia; en su lugar, presenta instrucciones de descarga, extracción y ejecución de un binario, junto con una tabla de supuestas capacidades técnicas (radar 2D, suavizado de entrada Bezier, capa de renderizado, etc.) que no guardan relación con un modelo de lenguaje.

El contenido de la model card presenta múltiples indicios de una publicación fraudulenta o de malware: enlaces de descarga que apuntan a un repositorio de GitHub de un tercero (`sibelvisser/notepadplusplus-install-pro-portable`), instrucciones para ejecutar el binario como administrador, una contraseña de extracción fija (`2026`), insignias de descargas y valoraciones inventadas (193K+ descargas, 4,9/5), y una descripción de funcionalidades que coinciden con herramientas de trampas para videojuegos (radar, filtro de loot, exclusión de captura de pantalla en OBS/ShadowPlay/Discord, "panic key" para descarga instantánea). Nada de ello corresponde a un modelo de IA open source.

Por tanto, esta ficha no puede documentar un modelo real: no hay parámetros, contexto, licencia de pesos, formato de pesos ni benchmarks que evaluar. La ficha se limita a reflejar los datos disponibles y a advertir de que el artefacto no es un modelo y de que su descarga y ejecución conllevan un riesgo de seguridad elevado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, no del modelo) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni equivalente) |

## Arquitectura y entrenamiento

No disponible. El repositorio no contiene ningún artefacto de modelo (pesos, configuración de transformer, tokenizador, ficheros de entrenamiento). La model card describe un programa para Windows x64 con un ejecutable `notepadplusplus-install-pro-portable-v1.2.0-win64.exe` (build declarada `v1.4.1`, hash `5DBF948FFB`) y un ZIP de 8,9 MB. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código, no resuelve matemáticas y no procesa visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de modelo; los idiomas listados son metadatos del repositorio.
- La model card atribuye al binario funciones propias de un cheat para videojuegos: radar 2D, filtro de loot, suavizado de entrada Bezier, capa de renderizado "stream-proof" (exclusión de OBS/ShadowPlay/Discord), tecla de pánico (`END`) y perfiles JSON intercambiables en caliente.
- Estas "capacidades" no son verificables y no corresponden a un modelo de IA; se documentan aquí únicamente como contenido declarado por el autor.

## Casos de uso

- Ninguno relacionado con IA: el artefacto no permite inferencia, generación de texto, código, visión ni ninguna tarea de machine learning.
- Ejecución de un binario Windows x64 con privilegios de administrador: escenario declarado por el autor, pero con riesgo de seguridad elevado y sin garantías de integridad.
- Extracción de un ZIP protegido con contraseña fija (`2026`): flujo típico de distribución de malware que evita análisis automáticos de antivirus.
- Integración en pipelines de CI/CD: no aplicable; no hay API, servidor de inferencia ni formato de pesos.
- Atención al cliente, generación de código en producción, análisis de documentos, RAG o agentes: no aplicable.
- Investigación o evaluación de modelos: no aplicable; el repositorio no contiene artefactos evaluables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica de modelo, porque el artefacto no es un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay modelo que cargar).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no aplicable.
- Requisito real declarado por el autor: Windows 10/11 de 64 bits, ejecución como administrador, 7-Zip o WinRAR para extraer el ZIP, y contraseña `2026`.
- Consumo de RAM declarado en la model card: menos de 40 MB y menos de 46 MB en distintos módulos (cifras no verificables).

## Comparativa con modelos similares

No disponible. No existe un modelo de IA comparable porque el artefacto no es un modelo. Cualquier comparación con LLM open source (Llama, Mistral, Qwen, DeepSeek, etc.) sería engañosa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, configuración ni tokenizador. Cualquier expectativa de inferencia es infundada.
- Fuerte indicio de malware o publicación fraudulenta: enlaces de descarga a un repositorio de GitHub de un tercero, contraseña fija en el ZIP para evadir escaneos, instrucciones de ejecución como administrador y funcionalidades de tipo cheat con exclusión de captura de pantalla.
- Insignias de descargas (193K+) y valoración (4,9/5) inventadas: no son verificables y contradicen los contadores reales del repositorio (0 descargas, 0 likes).
- La licencia MIT declarada en los metadatos no otorga ninguna garantía sobre la seguridad del binario; el código fuente no está incluido.
- Riesgo de robo de credenciales, persistencia, minado o instalación de software no deseado si se ejecuta el `.exe` como administrador.
- No debe descargarse ni ejecutarse en entornos de producción, investigación ni personales.
- Los idiomas listados en los metadatos no implican soporte lingüístico real del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RexyLoveshacks/notepadplusplus-install-pro-portable
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/sibelvisser/notepadplusplus-install-pro-portable
- Release referenciada en la model card (no verificar ni descargar): https://github.com/sibelvisser/notepadplusplus-install-pro-portable/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
