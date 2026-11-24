# era335/real-keyless-executor

## Resumen

`era335/real-keyless-executor` es un repositorio alojado en Hugging Face que, pese a su identificador y a las etiquetas propias de la plataforma (idiomas, licencia MIT), no contiene un modelo de inteligencia artificial. La model card describe un ejecutor de scripts para Windows x64 distribuido como archivo ZIP de 4,8 MB con contraseña, orientado a la ejecución de scripts en el cliente de un videojuego y comercializado con reclamos de descarga masiva. No se declara arquitectura de red neuronal, parámetros, tokenizador, pesos ni pipeline de inferencia.

El contenido del repositorio es, por tanto, ajeno a la categoría de modelos open source que esta ficha cubre habitualmente. La información disponible no permite caracterizar capacidades lingüísticas, de razonamiento o de generación de código, y los únicos datos técnicos presentes se refieren a módulos de un binario Windows (gestión de memoria, editor Monaco, sincronización de offsets tras parches). Cualquier evaluación como modelo de IA resulta imposible con los datos publicados.

La relevancia de esta entrada es fundamentalmente negativa: sirve como ejemplo de repositorio que abusa de la infraestructura de Hugging Face para distribuir software ejecutable potencialmente malicioso, y conviene advertir de ello a desarrolladores e investigadores que encuentren el enlace en búsquedas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas, sin modelo lingüístico asociado) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. La model card describe seis "subsistemas" de un ejecutable para Windows: attach multi-instancia con menos de 46 MB de RAM, attach instantáneo de cliente con un 97,6 % de consistencia declarada, hub de scripts integrado con menos de 23 MB de RAM, sincronización de offsets tras parches con un 99,6 % de consistencia declarada, editor Monaco multi-pestaña con menos de 32 MB de RAM y directorio de auto-ejecución con menos de 20 ms de respuesta. Estas cifras son afirmaciones del autor sin verificación independiente y no se refieren a ningún proceso de entrenamiento.

No se declara ningún corpus, número de tokens, técnica de alineación (RLHF, DPO) ni innovación de inferencia. El artefacto distribuido es `rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip` (4,8 MB, contraseña `2026`, build `v2.0.5`), alojado en un repositorio de GitHub de terceros distinto del autor declarado en Hugging Face, lo que constituye una discrepancia relevante de cadena de suministro.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de los modelos de IA.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües reales; los 14 idiomas son etiquetas de metadatos sin respaldo funcional.
- El autor declara funciones de ejecución de scripts Luau, attach a procesos, editor Monaco y actualización de offsets; ninguna de ellas se ha verificado de forma independiente.

## Casos de uso

- Auditoría de seguridad: analizar el binario en un entorno aislado para documentar técnicas de evasión de SmartScreen y de attach a procesos, con fines de investigación defensiva.
- Formación en cadena de suministro: usar el repositorio como caso práctico de paquetes que se hacen pasar por modelos en plataformas de ML y que solicitan ejecución como administrador.
- Elaboración de reglas de detección: extraer indicadores (nombre de ZIP, contraseña fija, ruta de release en GitHub de terceros) para reglas de EDR o de filtrado de correo.
- Concienciación de equipos: ilustrar por qué no debe ejecutarse software descargado de un repositorio de modelos sin verificación de firma ni de origen.
- No se identifican casos de uso legítimos de inferencia, generación o análisis de datos, dado que no existe modelo subyacente.
- No procede evaluar su idoneidad para atención al cliente, generación de código en producción, análisis documental ni ninguna otra tarea de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas presentes son afirmaciones del autor sobre consumo de memoria del ejecutable (< 46 MB, < 23 MB, < 32 MB), consistencia (97,6 % y 99,6 %) y latencia (< 20 ms), sin metodología ni verificación.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card.
- CPU: Intel o AMD x64; no se especifican requisitos adicionales.
- VRAM: no aplica, al no existir modelo neuronal.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput de inferencia: no disponibles; las cifras de milisegundos declaradas corresponden al ejecutable, no a un modelo.
- RAM declarada por el autor: menos de 46 MB en attach multi-instancia, menos de 23 MB en el hub de scripts y menos de 32 MB en el editor.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a un modelo de lenguaje de referencia de tamaño pequeño o mediano, las diferencias son categóricas: no hay parámetros, contexto, licencia de pesos, formato safetensors ni API de inferencia.

| Criterio | `era335/real-keyless-executor` | Modelo de IA típico de la categoría |
|---|---|---|
| Naturaleza | Ejecutable Windows en ZIP | Pesos de red neuronal |
| Parámetros | no disponible | Dato declarado por el autor |
| Contexto | no disponible | Dato declarado por el autor |
| Formato | `.exe` dentro de ZIP con contraseña | safetensors, GGUF |
| Inferencia | no aplica | API o runtime local |
| Verificación | nula | benchmarks publicados |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, integrarse ni citarse como tal en comparativas de modelos.
- Riesgo de seguridad alto: la instalación indicada exige extraer un ZIP con contraseña fija y ejecutar un `.exe` como administrador, patrón habitual en malware y en software no firmado.
- Discrepancia de autoría: el identificador del repositorio de Hugging Face (`era335`) no coincide con los propietarios citados en la model card (`gabrielesyed37`, `JoaoSchaefer973`), lo que rompe la trazabilidad.
- Posible infracción de términos de servicio: el contenido parece orientado a la ejecución de scripts en un videojuego, actividad que puede vulnerar los términos de la plataforma afectada.
- Cero señales de confianza: 0 descargas y 0 likes en el momento de la consulta, frente a la cifra de "300K+" descargas que afirma la model card sin respaldo.
- Sin verificación de benchmarks: las cifras de consistencia y latencia no incluyen metodología reproducible.
- Licencia MIT declarada, pero aplicarla a un binario sin código fuente ni procedencia verificable no aporta garantías de uso comercial seguro.
- Riesgo de alucinación: no aplica en sentido estricto, pero la model card contiene afirmaciones no verificables que funcionan como reclamo.
- Recomendación: no descargar ni ejecutar el artefacto fuera de un entorno de análisis aislado y sin privilegios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/era335/real-keyless-executor
- Release citada en la model card (GitHub de terceros): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Releases del propietario citado en la model card: https://github.com/gabrielesyed37/real-keyless-executor/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
