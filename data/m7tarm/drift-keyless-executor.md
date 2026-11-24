# M7TARM/drift-keyless-executor

## Resumen

`M7TARM/drift-keyless-executor` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que distribuye un ejecutable binario para Windows x64 (`drift-keyless-executor-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB) presentado por su autor como un "executor" para Roblox. La model card no describe ninguna arquitectura de red neuronal, ningún conjunto de datos de entrenamiento ni ningún proceso de inferencia: únicamente contiene instrucciones de descarga, una contraseña de descompresión (`2026`) y preguntas frecuentes sobre compatibilidad con Windows 10 y 11.

El repositorio emplea el etiquetado propio de Hugging Face (licencia MIT, lista de idiomas y etiquetas como `windows`, `x64`, `portable`) para aparecer en los índices de la plataforma, pero el contenido es un binario cerrado de procedencia no verificada. No hay pesos, tokenizador, configuración de modelo ni código de inferencia publicados. Cualquier evaluación como modelo de lenguaje resulta, por tanto, imposible con la información disponible.

Desde el punto de vista de la seguridad, la combinación de un ejecutable ofuscado, una contraseña fija para el archivo comprimido que evita el análisis automático de antivirus, instrucciones para ejecutarlo como administrador y un aviso explícito de que Windows Defender y SmartScreen generarán alertas constituye un patrón de riesgo elevado. No debe tratarse como un artefacto de IA ni ejecutarse en entornos de producción o de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable en el binario) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (se distribuye un ZIP de 8,9 MB con un ejecutable `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El artefacto distribuido es un ejecutable Windows de 64 bits (`drift-keyless-executor-v1.2.0-win64.exe`, build declarada `v2.1.8 (7AF090)`) empaquetado en un ZIP protegido con contraseña. La model card menciona componentes de un supuesto entorno de ejecución de scripts (editor Monaco, puente con una "Luau VM", API `Drawing`, funciones como `hookmetamethod` y `getgc`), que corresponden a la categoría de herramientas de inyección de scripts en clientes de Roblox, no a técnicas de aprendizaje automático.

No se publica información sobre datos de entrenamiento, tokens procesados, composición del corpus, RLHF, DPO ni ninguna innovación técnica de modelado. Tampoco se incluye código fuente, hash de verificación del binario ni trazabilidad de la cadena de compilación, lo que impide auditar su comportamiento.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No dispone de soporte de *tool calling* ni de *function calling* en el sentido de los modelos de IA.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No hay capacidades multimodales (visión, audio) ni modo de razonamiento extendido.
- La model card atribuye al binario funciones de inyección de scripts en un cliente de Roblox (adjuntar procesos, ejecutar scripts Luau, compatibilidad declarada con el 98 % de sUNC), que son capacidades de una herramienta de terceros, no de un modelo.
- La lista de idiomas de los metadatos no se corresponde con ninguna capacidad lingüística verificable del binario.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, porque no lo es. Los escenarios que la model card sugiere pertenecen al ámbito de la modificación de clientes de videojuegos y conllevan riesgos técnicos y legales:

- Ninguno recomendado en entornos de desarrollo, investigación o producción de IA.
- La ejecución del binario con privilegios de administrador en una máquina de trabajo expone el sistema a software de procedencia no verificada.
- El uso de herramientas de inyección en clientes de Roblox puede infringir los términos de servicio de la plataforma y, según la jurisdicción, la legislación aplicable.
- El patrón de distribución (ZIP con contraseña fija, alertas de SmartScreen anticipadas, ausencia de firma de código) es incompatible con cualquier política corporativa de gestión de software.
- No debe desplegarse en pipelines de CI/CD, servidores ni estaciones de trabajo con datos sensibles.
- Su presencia en Hugging Face no implica validación por parte de la plataforma; conviene tratarlo como contenido no verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de ningún tipo (ni MMLU, ni HumanEval, ni GSM8K, ni latencias medidas de forma reproducible); las cifras que menciona (por ejemplo, "menos de 25 ms" o "menos de 26 MB de RAM") son afirmaciones publicitarias sin metodología ni evidencia adjunta.

## Requisitos de hardware

- Sistema operativo: Windows 10 (22H2) o Windows 11 (24H2), según la model card.
- Arquitectura: x64 (Intel o AMD).
- VRAM: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier PC con Windows x64; el paquete ocupa 8,9 MB.
- Opciones de despliegue: no aplica (no es compatible con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Se recomienda, en cualquier caso, ejecutarlo únicamente en una máquina virtual aislada y sin credenciales, si se decide inspeccionarlo.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" con la que compararlo; los elementos comparables serían otras herramientas de ejecución de scripts para Roblox, ninguna de las cuales se distribuye con especificaciones técnicas auditables en este repositorio.

| Criterio | drift-keyless-executor | Modelo de lenguaje típico (referencia) |
|---|---|---|
| Naturaleza | Binario Windows x64 | Red neuronal con pesos publicados |
| Pesos / parámetros | No disponibles | Safetensors/GGUF con recuento de parámetros |
| Contexto | No aplica | Miles o millones de tokens |
| Benchmarks | Ninguno | MMLU, HumanEval, GSM8K, etc. |
| Auditabilidad | Nula (sin código fuente ni hash) | Alta (pesos y código abiertos) |
| Licencia | MIT declarada | Variable |

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con los criterios habituales de calidad, sesgo o alucinación.
- El binario se distribuye sin firma de código, sin hash de verificación y sin código fuente, lo que impide auditar su comportamiento.
- El ZIP protegido con contraseña fija (`2026`) dificulta el escaneo automático por parte de antivirus y motores de análisis.
- La model card anticipa alertas de Windows Defender y SmartScreen y recomienda ejecutar como administrador, un patrón habitual en software potencialmente no deseado.
- No hay garantía de que el ejecutable corresponda a la funcionalidad descrita; la procedencia del binario no es verificable.
- La licencia MIT declarada en los metadatos no cubre necesariamente el binario distribuido ni exime de responsabilidad al usuario.
- Uso comercial: desaconsejado; el uso de herramientas de inyección en clientes de terceros puede vulnerar sus términos de servicio.
- Riesgo de seguridad: ejecutar software no verificado con privilegios elevados puede comprometer credenciales, datos y el propio sistema.
- Los idiomas declarados en los metadatos no implican capacidades lingüísticas reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/M7TARM/drift-keyless-executor
- Repositorio de GitHub citado en la model card: https://github.com/Dogan3295/drift-keyless-executor
- Descarga del ZIP citada en la model card: https://github.com/Dogan3295/drift-keyless-executor/releases/latest/download/drift-keyless-executor-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/Dogan3295/drift-keyless-executor/releases/latest
