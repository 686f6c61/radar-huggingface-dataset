# parth2907/spt-aki-profile-editor-tarkov

## Resumen

La ficha solicitada corresponde al identificador `parth2907/spt-aki-profile-editor-tarkov`, alojado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: es un repositorio que distribuye un ejecutable portable para Windows de 64 bits (`spt-aki-profile-editor-tarkov-v1.2.0-win64.exe`, build `v2.8.7`), empaquetado en un archivo ZIP de 8,9 MB. No contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia.

El contenido de la model card describe funcionalidades propias de una utilidad de sistema orientada a la manipulacion de identificadores de hardware (seriales de NVMe/SATA, SMBIOS/WMI), limpieza de telemetria y "aislamiento multi-anticheat" con mencion explicita a EAC, BattlEye y Ricochet, ademas de restauracion de fabrica y gestion de TPM 2.0. Este tipo de capacidades, presentadas como editor de perfiles de SPT-AKI (Single Player Tarkov), no guardan relacion con el entrenamiento o la inferencia de modelos de lenguaje.

Por tanto, esta ficha no puede cumplir la estructura solicitada para un modelo de IA: los campos de arquitectura, parametros, contexto, cuantizacion y benchmarks carecen de sentido para este artefacto y se indican como no disponibles. Se advierte ademas de que el patron de distribucion (ZIP con contrasena, ejecutable a ejecutar como administrador, enlaces a un repositorio de terceros distinto del autor declarado) es consistente con practicas de riesgo y no debe ejecutarse en entornos de produccion ni de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion ejecutable para Windows) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.exe` y un `.zip`, no pesos) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, sino un binario compilado para Windows x64. No hay informacion sobre dataset, tokens de entrenamiento, tecnicas de alineacion (RLHF, DPO) ni innovaciones de arquitectura tipo attention lineal, decodificacion especulativa o mezcla de expertos.

La model card describe modulos funcionales de la aplicacion (restauracion de fabrica, limpieza de telemetria, enmascaramiento de seriales de disco, aislamiento frente a anticheats), pero no documenta ninguna metodologia de aprendizaje automatico. Los valores numericos que aparecen en la card (frecuencias de sondeo como 370 Hz o 474 Hz, porcentajes de "consistencia" como 96,1 % o 98,5 %) no estan respaldados por ninguna referencia tecnica verificable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve problemas matematicos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues derivadas de entrenamiento; los idiomas listados son metadatos del repositorio.
- No dispone de modo thinking, vision ni audio.
- Segun la model card, el binario afirma realizar manipulacion de identificadores de hardware, limpieza de trazas del sistema y evasion de sistemas antitrampas. Estas capacidades, ademas de no ser verificables, son incompatibles con un uso legitimo en la mayoria de entornos.

## Casos de uso

No se identifican casos de uso legitimos para un modelo de IA, porque no lo es. Los escenarios que la propia model card sugiere (edicion de perfiles de SPT-AKI, enmascaramiento de seriales, evasion de anticheats) se asocian a modificacion de entornos de juego y a posibles violaciones de terminos de servicio de terceros. Se recomienda no desplegar este artefacto en ningun entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los porcentajes y frecuencias citados en la model card no constituyen benchmarks reproducibles ni comparables con metricas estandar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto: Windows 10/11 de 64 bits, permisos de administrador segun las instrucciones de la card, 7-Zip o WinRAR para extraer el ZIP protegido con contrasena.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" comparable, ya que el artefacto es una utilidad ejecutable. Cualquier comparacion con LLM open source seria incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- El repositorio declara el autor `parth2907`, pero los enlaces de descarga apuntan a un repositorio de GitHub de otro usuario (`Giulio83983`), lo que constituye una discrepancia de procedencia.
- La distribucion mediante ZIP con contrasena y ejecucion como administrador es un patron habitual en campañas de malware; no se recomienda su descarga ni ejecucion.
- Las capacidades declaradas de enmascaramiento de seriales y evasion de anticheats pueden infringir terminos de servicio y legislacion sobre fraude informatico en varias jurisdicciones.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del binario distribuido.
- No hay evidencia de auditoria de codigo, firma digital del ejecutable ni verificacion de integridad mas alla de un identificador de build.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/parth2907/spt-aki-profile-editor-tarkov
- Repositorio de GitHub referenciado en la model card: https://github.com/Giulio83983/spt-aki-profile-editor-tarkov
- Enlace de descarga directa citado en la card: https://github.com/Giulio83983/spt-aki-profile-editor-tarkov/releases/latest/download/spt-aki-profile-editor-tarkov-v1.2.0-win64.zip
