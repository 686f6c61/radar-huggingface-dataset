# DeltaMelvin/photon-executor

## Resumen

`DeltaMelvin/photon-executor` es un repositorio alojado en Hugging Face que, pese a su identificador y a las etiquetas de idioma declaradas, no contiene un modelo de inteligencia artificial. La model card describe un ejecutor de scripts para Windows de 64 bits orientado al ecosistema de Roblox, distribuido como un archivo ZIP protegido con contraseña que contiene un binario `.exe`. No se declara arquitectura neuronal, parámetros, tokenizador ni pesos en ningún formato.

El repositorio emplea técnicas habituales de las páginas de descarga de software dudoso: insignias con valoraciones y cifras de descargas no verificables, una contraseña de extracción fija (`2026`) para evadir análisis automatizados, instrucciones para ejecutar el binario como administrador, indicaciones para desactivar avisos de Windows Defender o SmartScreen y enlaces a un repositorio de GitHub de un tercero no relacionado con el autor declarado. La licencia MIT indicada en los metadatos no aporta ninguna garantía sobre el contenido del binario.

Desde la perspectiva de evaluación de modelos, este repositorio debe clasificarse como no conforme: no es un modelo de IA, no es reproducible, no es auditable y presenta indicios claros de riesgo de seguridad. La ficha se completа a continuación con los datos disponibles, indicando explícitamente "no disponible" en todos los campos técnicos que no existen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos; sin validación) |
| Licencia | MIT (según metadatos; sin garantías sobre el binario) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. La model card no menciona transformer, MoE, SSM ni ningún otro paradigma; tampoco describe datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO. El contenido del repositorio, según la propia model card, es un binario `photon-executor-v1.2.0-win64.exe` (build `v3.3.1`, identificador `897E52D02F`) empaquetado en un ZIP de 8,9 MB con contraseña `2026`.

Las "capacidades técnicas" descritas en la model card (compatibilidad sUNC, `hookmetamethod`, `getgc`, Drawing API, auto-execute, multi-instancia, editor Monaco, ejecución sin clave) corresponden a funcionalidades de un ejecutor de scripts de Roblox, no a capacidades de un modelo de lenguaje. No hay información verificable sobre el origen del binario, su cadena de compilación ni sus dependencias.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma son metadatos sin respaldo técnico.
- Las funcionalidades declaradas (ejecución de scripts, hooking de métodos, API de dibujo, editor Monaco) pertenecen a un ejecutor de Roblox y no son evaluables como capacidades de IA.
- No dispone de modo thinking, visión, audio ni ninguna modalidad.

## Casos de uso

- Ninguno recomendado en el contexto de desarrollo o investigación con modelos de IA. El repositorio no contiene un modelo que pueda integrarse en pipelines de inferencia, evaluación o despliegue.
- No es adecuado para atención al cliente, generación de código, análisis documental, RAG ni ninguna tarea de procesamiento de lenguaje natural.
- No debe utilizarse como dependencia en entornos de producción, CI/CD ni investigación reproducible.
- Su uso entraña riesgos de seguridad: ejecución de binarios sin firma verificable, instrucciones para desactivar protecciones del sistema operativo y distribución mediante contraseña fija.
- Cualquier evaluación técnica del artefacto requeriría análisis de malware en un entorno aislado, no forma parte del alcance de una ficha de modelo.
- Se recomienda descartar el repositorio y buscar alternativas verificadas para cualquier necesidad real de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra métrica de modelos de lenguaje, y las cifras de la model card (99 % de valoración, 864K descargas, 98 % de compatibilidad sUNC) no son verificables ni corresponden a benchmarks de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisitos del artefacto distribuido: Windows de 64 bits (Windows 10 u 11), procesador Intel o AMD x64, según la model card; sin más especificaciones verificables.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaMelvin/photon-executor | Ejecutor de scripts Windows (no es un modelo de IA) | no disponible | no disponible | MIT (declarada) | Hugging Face, con binario externo en GitHub |
| Modelos de lenguaje open source de referencia (p. ej. familias Llama, Mistral, Qwen) | LLM transformer | Miles de millones (según variante) | Miles de tokens (según variante) | Licencias específicas por familia | Hugging Face, con pesos en safetensors/GGUF |

No existe una categoría comparable: el repositorio no es un modelo de IA y no puede contrastarse con LLM, modelos de visión ni modelos de audio. Cualquier comparación técnica con modelos de lenguaje sería engañosa.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura, tokenizador y cualquier componente evaluable.
- La model card emplea patrones propios de distribución de software dudoso: contraseña fija de extracción, insignias con cifras no verificables, instrucciones para ejecutar como administrador y para desactivar Windows Defender o SmartScreen.
- El binario se aloja en un repositorio de GitHub de un tercero (`DavidHakansson30131`) no vinculado al autor declarado en Hugging Face (`DeltaMelvin`), lo que impide verificar la cadena de custodia.
- Riesgo elevado de malware, robo de credenciales o ejecución de código arbitrario si se sigue el procedimiento descrito.
- La licencia MIT declarada no ofrece ninguna garantía sobre el contenido del ejecutable ni sobre su comportamiento en tiempo de ejecución.
- Los códigos de idioma declarados no implican soporte multilingüe real.
- No apto para uso comercial, producción, investigación reproducible ni entornos corporativos.
- Se recomienda no descargar ni ejecutar el artefacto y reportar el repositorio a Hugging Face si se confirma que infringe sus políticas de contenido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DeltaMelvin/photon-executor
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/DavidHakansson30131/photon-executor
- Releases del repositorio de GitHub referenciado: https://github.com/DavidHakansson30131/photon-executor/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
