# Kobyko/zorara-nihon-executor-v3

## Resumen

La referencia `Kobyko/zorara-nihon-executor-v3` alojada en Hugging Face no corresponde a un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un ejecutable de Windows (`zorara-nihon-executor-v3-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB) etiquetado como "roblox executor", es decir, una herramienta de inyección de scripts Luau en el cliente de Roblox. El autor de la model card lo presenta con badges de descargas, valoraciones y compatibilidad sUNC, y ofrece el binario mediante un enlace a un repositorio de GitHub de terceros (`Dagostini4845/zorara-nihon-executor-v3`) protegido con contraseña de descompresión.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador, datos de entrenamiento ni pesos en formato safetensors o GGUF. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y el contenido del README describen exclusivamente una aplicación de escritorio, no un modelo lingüístico. La licencia declarada es MIT, pero se aplica al artefacto distribuido, no a un modelo.

Por tanto, esta ficha no puede evaluar capacidades de generación de texto, razonamiento o código. El contenido que sigue documenta lo que el repositorio declara y señala los riesgos de seguridad asociados a la distribución de binarios de este tipo. Cualquier evaluador que busque un modelo de IA debe descartar este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El README describe un binario para Windows 10 y Windows 11 sobre procesadores x64 (Intel y AMD), con funciones declaradas como "integrated script hub", "multi-instance attach", "instant client attach", "post-patch offset sync", "auto-execute directory" y compatibilidad "98%+ sUNC" con APIs como `hookmetamethod`, `getgc` y `Drawing API`. Estos términos pertenecen al ecosistema de ejecutores de scripts de Roblox (entorno Luau), no al entrenamiento de modelos.

No se documentan datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni innovaciones de inferencia. El tamaño del paquete (8,9 MB) es incompatible con cualquier modelo de lenguaje con pesos publicados.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües propias; los idiomas del tag son metadatos del repositorio.
- El binario declara inyección de scripts Luau en el cliente de Roblox, adjuntar múltiples instancias, recarga automática de scripts y compatibilidad parcial con la API sUNC.
- No hay modo "thinking", visión, audio ni multimodalidad.

## Casos de uso

- Ninguno recomendado en el contexto de evaluación de modelos de IA. El repositorio no aporta un modelo que pueda integrarse en pipelines de NLP, RAG, generación de código o agentes.
- Distribución de software de escritorio para Windows: el único uso declarado es ejecutar scripts en el cliente de Roblox, lo que infringe los términos de servicio de Roblox y puede conllevar el baneo de cuentas.
- Auditoría de seguridad: un analista podría examinar el binario en un entorno aislado para documentar comportamiento malicioso, pero no se recomienda su descarga ni ejecución en sistemas de producción.
- Investigación de campañas de malware: el patrón (ZIP con contraseña, enlace a GitHub de terceros, instrucciones de "Run as Administrator" y de desactivar SmartScreen) es habitual en distribución de troyanos; puede servir como caso de estudio en formación de concienciación.
- Docencia sobre higiene de dependencias: ilustra por qué no deben instalarse binarios sin verificación de firma ni procedencia.
- Verificación de metadatos en Hugging Face: sirve para comprobar que los tags de un repo no garantizan que el contenido sea un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README incluye cifras de marketing no verificables (por ejemplo, "97,1% de consistencia" o "< 8 ms de respuesta"), sin metodología ni repositorio de evaluación, por lo que no se recogen como benchmarks.

## Requisitos de hardware

- Plataforma: Windows 10 o Windows 11, x64 (Intel o AMD).
- VRAM: no aplica; no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo con Windows x64; el paquete ocupa 8,9 MB.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes).
- Latencia y throughput: no disponibles; las cifras del README no son verificables.
- Requiere permisos de administrador según las instrucciones del propio autor, lo que amplía la superficie de riesgo.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, los ejecutores de scripts de Roblox (Synapse, Fluxus, Wave y similares) son software de terceros que no se distribuyen en Hugging Face como modelos y cuya legalidad depende de los términos de servicio de la plataforma objetivo.

| Criterio | Este repositorio | Modelo de IA típico en HF |
|---|---|---|
| Contenido | ZIP con `.exe` para Windows | Pesos en safetensors/GGUF |
| Parámetros | no disponible | Millones o miles de millones |
| Contexto | no disponible | Miles de tokens |
| Licencia | MIT (sobre el binario) | Variable |
| Uso previsto | Inyección de scripts en Roblox | Inferencia de lenguaje |

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en comparativas ni en catálogos de modelos.
- Riesgo de seguridad alto: binario sin firma, distribuido en ZIP con contraseña y alojado en un repositorio de GitHub de terceros; el patrón coincide con el de malware y troyanos.
- El README pide ejecutar como administrador y desactivar o ignorar avisos de Windows Defender y SmartScreen, lo que elimina las protecciones del sistema.
- Infringe los términos de servicio de Roblox; el uso puede provocar el baneo permanente de cuentas.
- Los metadatos de idioma y la licencia MIT no implican que el contenido sea un modelo ni que su uso sea seguro.
- Cero descargas y cero likes en el momento de la consulta; sin historial ni verificación comunitaria.
- Fecha de creación declarada en 2026, lo que puede indicar metadatos manipulados o inconsistentes.
- No usar en producción, ni en entornos corporativos, ni en máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/zorara-nihon-executor-v3
- Repositorio de GitHub referenciado por el autor: https://github.com/Dagostini4845/zorara-nihon-executor-v3
- Releases del repositorio de GitHub: https://github.com/Dagostini4845/zorara-nihon-executor-v3/releases/latest
- Paquete directo citado en el README (no recomendado): https://github.com/Dagostini4845/zorara-nihon-executor-v3/releases/latest/download/zorara-nihon-executor-v3-v1.2.0-win64.zip
