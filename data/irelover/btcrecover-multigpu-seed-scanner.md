# Irelover/btcrecover-multigpu-seed-scanner

## Resumen

El repositorio `Irelover/btcrecover-multigpu-seed-scanner` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows (x64) distribuido como archivo ZIP con contraseña, que la model card presenta como una herramienta de escaneo de semillas BIP39 y recuperación de carteras de criptomonedas. El contenido de la model card no describe ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia: la etiqueta de pipeline figura como "no disponible" y las descargas e interacciones registradas son cero.

El material publicado mezcla nombres y referencias incongruentes: el título menciona "Btcrecover Multigpu Seed Scanner", pero el archivo ejecutable y el ZIP descargable se denominan `blox-fruits-script-keyless-2026-v1.2.2-win64`, un nombre asociado a scripts de un videojuego. La model card incluye instrucciones para descargar un binario desde un repositorio de GitHub de terceros, extraerlo con la contraseña `2026` y ejecutarlo como administrador. Este patrón (binario opaco, archivo protegido con contraseña, ejecución con privilegios elevados, temática de recuperación de semillas) es característico de campañas de distribución de software malicioso, no de un modelo open source evaluable.

Por tanto, esta ficha documenta la ausencia de un modelo técnico y advierte de los riesgos de seguridad asociados. No existe información verificable sobre parámetros, contexto, entrenamiento, capacidades o benchmarks porque no hay ningún modelo que evaluar. Cualquier uso del paquete descargable conlleva riesgos de seguridad y posibles implicaciones legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio; no aplicable a un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable de Windows, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El repositorio no contiene ficheros de pesos (safetensors, GGUF ni otros), ni configuración de transformer, MoE o SSM, ni tokenizador. La model card describe funcionalidades genéricas de una supuesta herramienta de escritorio: rotación de nodos RPC, derivación multi-cadena BIP44/BIP84, validación BIP39, resolución de mnemónicos parciales y parseo de keystores LevelDB. Estas descripciones no van acompañadas de documentación técnica, código fuente auditable ni referencias a datasets o procesos de entrenamiento.

No se ha publicado información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica de inferencia. La única "innovación" declarada es la distribución de un binario comprimido con contraseña, lo que impide la inspección del contenido antes de su ejecución.

## Capacidades

- No se trata de un modelo de lenguaje: no genera texto, no razona, no programa y no realiza matemáticas.
- No dispone de soporte de tool calling ni function calling en el sentido de un LLM.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües propias; los idiomas listados son metadatos del repositorio.
- No dispone de modo thinking, visión ni audio.
- La model card atribuye al binario funciones de validación BIP39, derivación de direcciones y exportación de saldos, sin documentación verificable que las respalde.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo evaluable y su ejecución implica riesgos de seguridad.
- Auditoría de seguridad defensiva: un analista podría examinar el repositorio como ejemplo de campaña de distribución de software sospechoso, siempre en un entorno aislado y sin ejecutar el binario.
- Investigación de malware: el patrón (ZIP con contraseña, ejecutable como administrador, temática de semillas) puede documentarse como indicador de compromiso en formación de equipos de seguridad.
- Monitorización de plataformas: el caso sirve para ilustrar la necesidad de moderación en repositorios de modelos ante artefactos que no son modelos.
- Concienciación de usuarios: puede usarse como ejemplo didáctico de por qué no se deben ejecutar binarios de procedencia desconocida que prometen recuperar carteras de criptomonedas.
- No se identifican casos de uso legítimos de recuperación de carteras, ya que no hay evidencia de que la herramienta funcione ni de que sea segura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de "97,5 %" y "98,8 %" de consistencia que aparecen en la model card no son benchmarks de modelo ni van acompañadas de metodología, por lo que no se recogen como datos verificables.

## Requisitos de hardware

- No aplica VRAM de inferencia: no hay modelo que cargar en GPU.
- El artefacto declara compatibilidad con Windows 10 (22H2) y Windows 11 (24H2) en x64.
- No se especifican requisitos de GPU reales; la model card menciona "multigpu" en el nombre pero no documenta uso de CUDA, ROCm ni ninguna API de cómputo.
- No cabe hablar de despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no existen pesos.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de lenguaje open source típico | Herramienta legítima de recuperación de carteras |
|---|---|---|---|
| Naturaleza | Binario de Windows sin documentación | Pesos y código auditables | Código fuente abierto verificable |
| Pesos publicados | No | Sí (safetensors, GGUF) | No aplica |
| Documentación técnica | Ausente o incoherente | Model card con arquitectura y entrenamiento | Repositorio con tests y auditorías |
| Licencia | MIT declarada | MIT, Apache 2.0, etc. | Variable |
| Evaluable | No | Sí | Sí, mediante revisión de código |
| Riesgo de seguridad | Alto (binario opaco con contraseña) | Bajo si procede de fuente fiable | Bajo si es código auditable |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- El binario se distribuye comprimido con contraseña y se solicita ejecutarlo como administrador, lo que impide la inspección previa y eleva el riesgo de ejecución de código malicioso.
- El nombre del ejecutable (`blox-fruits-script-keyless-...`) no guarda relación con la función declarada, lo que sugiere suplantación o reutilización de un artefacto ajeno.
- La temática de recuperación de semillas BIP39 y carteras de criptomonedas es un vector habitual de fraude y robo de fondos.
- La licencia MIT declarada en los metadatos no garantiza la legitimidad ni la seguridad del contenido distribuido.
- No existe información verificable sobre sesgos, alucinación o limitaciones de contexto porque no hay modelo.
- Se desaconseja totalmente su descarga y ejecución en cualquier entorno de producción o personal.
- Cualquier uso podría contravenir legislación sobre acceso no autorizado a sistemas o sobre fraude, según la jurisdicción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Irelover/btcrecover-multigpu-seed-scanner
- Enlace de descarga citado en la model card (no recomendado): https://github.com/JisungDiaz447/blox-fruits-script-keyless-2026/releases/download/v1.2.0/blox-fruits-script-keyless-2026-v1.2.2-win64.zip
- Releases citadas en la model card (no recomendado): https://github.com/yvest62304/btcrecover-multigpu-seed-scanner/releases/latest
