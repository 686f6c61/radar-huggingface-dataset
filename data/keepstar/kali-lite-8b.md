# keepstar/Kali-Lite-8B

## Resumen

Kali-Lite 8B es una configuración publicada por el usuario keepstar dentro del proyecto Kalicorp sobre el modelo base Qwen/Qwen3-8B. No se trata de un modelo de fundamento entrenado desde cero: el paquete combina los pesos originales de Qwen3-8B con una doctrina de sistema propia, un Modelfile de Ollama y un arnés de ejecución diseñado para operar en local. La model card lo describe explícitamente como una configuración "local, frugal e inspeccionable".

El modelo declara soporte para francés e inglés, una ventana de contexto configurada de 16 384 tokens y un artefacto local típico de unos 5,2 GB en función de la cuantización y el runtime. La licencia es mixta: los pesos upstream de Qwen3-8B son Apache-2.0, mientras que el material creado por Kalicorp (prompt de sistema, doctrina, Modelfile) sigue los términos del proyecto Kali-Lite.

Su relevancia es acotada pero concreta. Por un lado, sirve como plantilla reproducible para desplegar Qwen3-8B en Ollama con reglas estrictas sobre la distinción entre hechos, hipótesis, acciones propuestas y resultados observados, y sin telemetría añadida en inferencia local. Por otro, encaja en el discurso de soberanía digital europea. El repositorio no publica pesos propios, ni resultados de benchmarks, ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; heredada del modelo base Qwen/Qwen3-8B |
| Parametros totales | No disponible de forma explícita; el nombre y el modelo base indican 8B |
| Parametros activos | No aplica / no disponible (no se documenta arquitectura MoE) |
| Longitud de contexto | 16 384 tokens (contexto configurado) |
| Tipos de cuantizacion | No disponible; se menciona un artefacto local típico de unos 5,2 GB según cuantización y runtime |
| Idiomas soportados | Frances (fr) e ingles (en) |
| Licencia | Mixta: GPL-2.0-only y Apache-2.0 (licencia declarada como "other") |
| Formato de pesos | No disponible; el paquete documenta un Modelfile para Ollama. No se confirma la redistribución de pesos ni de ficheros GGUF |
| Modelo base | Qwen/Qwen3-8B |
| Runtime principal | Ollama |
| Vision | No |
| Telemetria | Ninguna telemetría de Kalicorp añadida a la inferencia local, según la model card |

## Arquitectura y entrenamiento

Kali-Lite 8B no incorpora entrenamiento propio por parte de Kalicorp. La model card indica que el proyecto no ha entrenado un modelo de fundamento desde cero y que la personalización se limita a tres elementos: un prompt de sistema, una doctrina operativa y un Modelfile con su arnés de ejecución. Por tanto, la arquitectura efectiva es la del modelo base Qwen/Qwen3-8B, cuyos detalles técnicos (número de capas, atención, configuración de cabezas, corpus de preprocesamiento y fases de alineamiento) no se reproducen en esta model card.

La innovación declarada no es arquitectónica, sino de comportamiento y despliegue. La doctrina de sistema obliga al modelo a distinguir entre hechos, hipótesis, acciones propuestas y resultados observados; a no afirmar que un comando o herramienta se ha ejecutado sin evidencia del arnés; a no inventar estado del sistema; y a mantener al operador en control de las acciones privilegiadas o destructivas. El flujo de puesta en marcha documentado consiste en descargar `qwen3:8b` desde Ollama, crear una variante local con el Modelfile y ejecutarla. No se documentan fases de RLHF, DPO ni ajuste supervisado adicionales por parte de Kalicorp, ni cifras de tokens de entrenamiento.

## Capacidades

- Generación de texto en francés e inglés, con el comportamiento heredado del modelo base Qwen3-8B.
- Razonamiento y respuesta conversacional multi-turno dentro de la ventana configurada de 16 384 tokens.
- Uso de herramientas a través del arnés de ejecución: la doctrina exige evidencia del arnés antes de afirmar que un comando o herramienta se ha ejecutado.
- Ejecución local en Ollama, apta para entornos con restricciones de salida de datos.
- Separación explícita de hechos, hipótesis, acciones propuestas y resultados observados como comportamiento inducido por el prompt de sistema.
- Supervisión humana de acciones privilegiadas o destructivas como principio de diseño.
- No se documenta soporte de visión, audio, function calling nativo, modo de pensamiento explícito ni otras capacidades especiales más allá de las heredadas del modelo base.

## Casos de uso

- Asistencia técnica en francés para pymes y administraciones: el modelo puede mantener conversaciones multi-turno en francés dentro de los 16 384 tokens de contexto configurados, sin enviar datos a servicios en la nube.
- Despliegue en entornos air-gapped o con requisitos de residencia de datos: al ejecutarse íntegramente en local mediante Ollama, encaja en escenarios donde la información no puede salir de la organización.
- Operaciones de terminal asistidas por agente con confirmación humana: la doctrina del sistema impide declarar comandos ejecutados sin evidencia del arnés y obliga a que el operador controle las acciones destructivas, lo que reduce el riesgo de automatizaciones peligrosas.
- Generación y revisión de código en local: útil para equipos que quieren asistencia de programación sin depender de APIs externas, con la limitación de que no se documentan benchmarks de código para esta configuración.
- Asistencia documental y resumen de expedientes: con 16 384 tokens de contexto puede procesar contratos, informes o documentación técnica de extensión media en francés o inglés.
- Soporte bilingüe francés-inglés en atención al cliente: adecuado para organizaciones que operan en ambos idiomas y prefieren un único modelo local antes que varias APIs.
- Base para personalizaciones internas: al ser una configuración replicable sobre Qwen3-8B, sirve como punto de partida para que un equipo añada su propia doctrina, Modelfile y reglas de operación.
- Formación y demostraciones de IA soberana: permite ilustrar un despliegue íntegramente local, inspeccionable y sin telemetría en charlas, pruebas de concepto o entornos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Kali-Lite 8B no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco ofrece cifras de latencia o throughput. El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe retroalimentación de la comunidad sobre su comportamiento real.

## Requisitos de hardware

- Tamano del artefacto: la model card indica un artefacto local típico de unos 5,2 GB, dependiente de la cuantización y del runtime.
- VRAM estimada: para una cuantización de 4 bits, el peso del modelo ronda los 5-6 GB, a los que hay que sumar el caché KV correspondiente a la ventana de 16 384 tokens. En precisión de 16 bits, la estimación se sitúa en el entorno de 16-17 GB solo para los pesos.
- GPU de consumo: una cuantización de 4 bits puede caber en tarjetas con 8 GB o más de VRAM, como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 o RTX 4090. Con 8 GB exactos el margen es ajustado si se usa el contexto completo.
- GPU de datacenter: A100, H100 u otras GPU con 40-80 GB permiten ejecutar el modelo en precisiones mayores, con contexto completo y lotes concurrentes.
- Despliegue: el runtime documentado y soportado por la configuración es Ollama (`ollama pull qwen3:8b`, `ollama create kali-lite -f Modelfile`, `ollama run kali-lite`). Al estar basado en Qwen3-8B, son viables otras rutas como llama.cpp con GGUF si se obtienen los pesos convertidos, aunque el repositorio no confirma la redistribución de pesos ni de ficheros GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| Kali-Lite 8B | No disponible explícitamente; base de 8B | 16 384 tokens configurados | Mixta GPL-2.0-only / Apache-2.0 | No confirmada; el paquete documenta configuración para Ollama | Configuración y doctrina propias sobre Qwen3-8B |
| Qwen/Qwen3-8B | 8B (según denominación del modelo) | No disponible en la información proporcionada | Apache-2.0 (indicada en la model card de Kali-Lite) | Sí, repositorio upstream | Modelo base del que hereda pesos y capacidades |
| Otras alternativas de ~8B | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de modelos comparables adicionales |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card reconoce que Kali-Lite hereda las limitaciones del modelo base y del runtime: los modelos locales pequeños pueden producir información plausible pero incorrecta.
- Riesgo de alucinación: aunque la doctrina de sistema exige no afirmar hechos sin evidencia, se trata de una instrucción de prompt, no de una garantía técnica.
- Pérdida de restricciones en contextos largos: la propia documentación advierte de que una longitud de contexto configurada no garantiza que toda la información se use correctamente.
- Errores en el uso de herramientas: la model card señala explícitamente que pueden producirse fallos al invocar herramientas.
- Cobertura idiomática limitada a francés e inglés; no se declara soporte de castellano ni de otros idiomas.
- Licencia mixta y poco convencional: el material de Kalicorp sigue los términos del proyecto Kali-Lite y los pesos upstream son Apache-2.0, pero la model card recomienda revisar el aviso de licencia antes de redistribuir pesos. La etiqueta de licencia de HuggingFace es "other", lo que complica la verificación automática de compatibilidad comercial.
- No se confirma que el repositorio incluya pesos ni ficheros GGUF, por lo que la reproducibilidad completa depende de reconstruir la configuración sobre Qwen3-8B.
- La inferencia local no implica por sí misma cumplimiento del RGPD, del Reglamento Europeo de IA, de las guías de la ANSSI ni de ningún marco de certificación, tal como advierte la propia model card.
- Modelo con 0 descargas y 0 valoraciones: no existe validación independiente de su comportamiento.
- Ausencia total de benchmarks publicados, lo que impide comparar su rendimiento con alternativas.
- Sin capacidades de visión ni de audio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/keepstar/Kali-Lite-8B
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de código y documentación de seguridad del proyecto: `Kalicorp/kalicorp-kali-lite` en GitHub (referenciado en la model card; no se proporciona URL completa)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a hilos de un foro de operador sobre correctores ortográficos y no guardan relación con Kali-Lite 8B.
