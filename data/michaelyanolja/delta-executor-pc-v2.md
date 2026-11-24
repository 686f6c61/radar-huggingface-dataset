# MichaelYanolja/delta-executor-pc-v2

## Resumen

`MichaelYanolja/delta-executor-pc-v2` es un repositorio alojado en Hugging Face que, a pesar de su ubicación, no contiene un modelo de inteligencia artificial. Se trata de un paquete de software ejecutable para Windows (un supuesto "executor" de scripts orientado a Roblox), distribuido como archivo ZIP de 8,9 MB con contraseña de descompresión. El repositorio incluye etiquetas propias de modelos (`language`, `license:mit`, `region:us`), lo que sugiere un uso oportunista de la plataforma para alojar y promocionar software de terceros.

No se dispone de información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni datos de entrenamiento. La model card describe funcionalidades de inyección de scripts (adjuntado multi-instancia, flujo de ejecución sin clave, editor Monaco, auto-ejecución de directorios) y enlaza a un binario alojado en un repositorio de GitHub de un tercero (`adrianl0774/delta-executor-pc-v2`), no al propio espacio de Hugging Face.

Desde la perspectiva de un desarrollador o investigador que evalúa modelos, este repositorio carece de valor como modelo de IA y presenta señales de riesgo relevantes (binario ejecutable de origen no verificado, contraseña en archivo comprimido para evadir análisis automatizados, solicitud de ejecución como administrador). La ficha se redacta por rigor estructural, indicando explícitamente la ausencia de datos técnicos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es `delta-executor-pc-v2-v1.2.0-win64.zip`, 8,9 MB) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene pesos, configuración de transformer, tokenizador ni código de inferencia. El contenido descrito en la model card corresponde a una aplicación de escritorio para Windows 10/11 de 64 bits, empaquetada como ZIP protegido con contraseña (`2026`) y compuesta por un binario `delta-executor-pc-v2-v1.2.0-win64.exe` (build declarado `v1.7.9`, `58A590`).

La model card menciona componentes como "Luau VM bridge", "monaco editor workspace" y "post-patch offset sync", propios de herramientas de ejecución de scripts sobre clientes de videojuegos, no de un sistema de aprendizaje automático. No se documenta ningún proceso de entrenamiento, conjunto de datos, RLHF, DPO ni innovación algorítmica.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve problemas matemáticos ni produce código en el sentido de un LLM.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en las etiquetas no están respaldadas por ninguna documentación técnica de modelo.
- La model card atribuye al ejecutable funciones de inyección de scripts, edición con resaltado de sintaxis y recarga automática de scripts, sin especificación técnica verificable.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA: no hay inferencia de lenguaje, visión, audio ni embeddings que pueda integrarse en pipelines de desarrollo.
- Evaluación de riesgos de cadena de suministro: el repositorio puede emplearse como caso de estudio de alojamiento de binarios no verificados en plataformas de modelos, con contraseña en el archivo comprimido para dificultar el escaneo automatizado.
- Auditoría de metadatos: útil para analizar cómo se etiquetan contenidos ajenos a modelos con etiquetas de licencia y idioma que inducen a confusión en búsquedas de Hugging Face.
- Formación en seguridad: ejemplo de ingeniería social (badges de descargas y valoraciones, instrucciones de "ejecutar como administrador") para concienciar sobre riesgos de software descargado de fuentes no oficiales.
- No se recomienda su uso en entornos de producción, investigación ni desarrollo de software.
- Cualquier escenario de uso real del ejecutable queda fuera del alcance de esta ficha técnica de modelos y no se valida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, al no tratarse de un modelo de aprendizaje automático.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados del artefacto: Windows 10 o Windows 11 de 64 bits, arquitectura x64 (Intel o AMD), 8,9 MB de espacio para el ZIP y ejecución como administrador según las instrucciones del autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; la model card cita cifras no verificables (por ejemplo, "< 22 ms" de respuesta o "< 38 MB" de RAM) sin metodología.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Frente a otros artefactos de la misma categoría (ejecutables de terceros para Windows), no se dispone de datos verificables de rendimiento, seguridad ni procedencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse ni evaluarse como tal en comparativas de LLM.
- Riesgo de seguridad elevado: distribución de un binario ejecutable alojado en un repositorio de GitHub de un tercero, con instrucciones de ejecutarlo como administrador y de desactivar o ignorar avisos de Windows Defender/SmartScreen.
- El archivo ZIP está protegido con contraseña (`2026`), práctica que dificulta el análisis antimalware y la inspección del contenido antes de la ejecución.
- Los badges de descargas ("839K+") y valoración ("99% Verified") de la model card no son verificables y no proceden de métricas de Hugging Face (el repositorio registra 0 descargas y 0 likes en la fecha indicada).
- La licencia MIT declarada en los metadatos no aclara la titularidad del binario ni de los componentes de terceros incluidos.
- Posible uso de la plataforma Hugging Face para distribución de software ajeno a modelos, con etiquetas de idioma y licencia que pueden inducir a error en búsquedas automatizadas.
- No apto para producción, investigación ni entornos corporativos sin un análisis de seguridad independiente.
- No se han identificado sesgos de modelo ni riesgos de alucinación porque no hay modelo; el riesgo relevante es de malware o software no verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MichaelYanolja/delta-executor-pc-v2
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/adrianl0774/delta-executor-pc-v2
- Descarga directa citada en la model card (no recomendada): https://github.com/adrianl0774/delta-executor-pc-v2/releases/latest/download/delta-executor-pc-v2-v1.2.0-win64.zip
- No se han encontrado papers, blogs técnicos ni demos oficiales asociados.
