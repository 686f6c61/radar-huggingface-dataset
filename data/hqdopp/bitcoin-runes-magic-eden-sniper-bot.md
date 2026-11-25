# hqdopp/bitcoin-runes-magic-eden-sniper-bot

## Resumen

La ficha solicitada corresponde al identificador `hqdopp/bitcoin-runes-magic-eden-sniper-bot`, publicado en Hugging Face el 24 de noviembre de 2026. A pesar de estar alojado en un repositorio de modelos, el contenido no describe un modelo de inteligencia artificial: la model card presenta un supuesto ejecutable portable para Windows 10/11 x64 denominado "Bitcoin Runes Magic Eden Sniper Bot", empaquetado en un archivo ZIP de 4,8 MB y protegido con contrasena. No se declara arquitectura neuronal, parametros, tokenizador, pesos ni pipeline de inferencia.

El texto de la model card incluye referencias a modulos de trading (sandbox de paper-trading, bundler de 20 carteras mediante Lookup Tables, vault local AES-256, take profit multinivel, copytrade de ballenas y motor de bundles Jito/MEV), asi como instrucciones para descargar y ejecutar un binario desde un repositorio de GitHub externo. Estos elementos son caracteristicos de una distribucion de software, no de un modelo fundacional, y presentan inconsistencias notables: el nombre del ZIP y del ejecutable remiten a un supuesto "trainer" de Elden Ring, los enlaces de descarga apuntan a repositorios de terceros y la contrasena del archivo se publica en la propia pagina.

Por tanto, esta ficha documenta lo que el repositorio declara, senalando de forma explicita los campos que no son aplicables o no estan disponibles. No debe interpretarse como la evaluacion de un modelo de lenguaje, sino como la descripcion de un artefacto de software con apariencia de modelo, lo que constituye un riesgo de seguridad relevante para cualquier usuario que lo encuentre en un indice de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; la model card describe un ejecutable de trading para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como etiquetas de idioma del repositorio, no como capacidades linguisticas verificadas) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un `.exe` para Windows x64) |

Datos adicionales declarados en el repositorio: tamano del paquete 4,8 MB, version `v4.9.9`, build `94802F`, descargas 0, likes 0, fecha de creacion y actualizacion 2026-11-24.

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, corpus de entrenamiento, numero de tokens, proceso de alineacion (RLHF, DPO) ni innovacion tecnica de inferencia. La model card enumera en su lugar seis "subsistemas" de un supuesto bot de trading: sandbox de paper-trading asincrono sobre order books en vivo, bundler de 20 carteras con Lookup Tables para ejecucion en el mismo bloque, vault local de claves AES-256 no custodial, take profit multinivel con trailing stop, copytrade de carteras de ballenas y motor de bundles Jito/MEV con dimensionamiento dinamico de propinas. Se citan cifras de "consistencia" (97,9 %, 96,8 %, 96,6 %) y un sondeo a 176 Hz, sin metodologia de medicion ni trazabilidad.

El paquete se presenta como portable y sin dependencias externas, con instrucciones de extraccion mediante contrasena `2026` y ejecucion como administrador. El nombre interno del ZIP y del ejecutable (`elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64`) no guarda relacion con el titulo del repositorio, lo que sugiere reutilizacion de plantillas o suplantacion de identidad de otro proyecto.

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue real; los 14 idiomas listados son etiquetas de metadatos del repositorio.
- Las unicas funciones descritas son operativas de trading (ejecucion multi-cartera, gestion de claves, take profit, copytrade, bundles MEV), no capacidades cognitivas de un modelo.

## Casos de uso

No es posible enumerar casos de uso legitimos de un modelo de IA porque el artefacto no es un modelo. Los escenarios que la propia model card sugiere son los siguientes, y se documentan unicamente a efectos de analisis:

- Ejecucion de ordenes en Magic Eden sobre Bitcoin Runes: el texto describe un motor de sniping con sondeo a 176 Hz y ejecucion multi-cartera en el mismo bloque mediante Lookup Tables.
- Simulacion de estrategias sin riesgo: se menciona un sandbox de paper-trading contra order books en vivo.
- Gestion local de claves: se declara un vault AES-256 no custodial para firma local.
- Salida escalonada de posiciones: take profit multinivel con migracion a trailing stop.
- Replicacion de carteras de ballenas: copytrade con dimensionamiento proporcional.
- Inclusión atomica de transacciones: motor de bundles Jito/MEV con propinas dinamicas.

Ninguno de estos escenarios esta respaldado por documentacion tecnica verificable, codigo fuente, auditoria ni resultados reproducibles, y la ejecucion de binarios de procedencia desconocida como administrador constituye un riesgo de seguridad critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas citadas (97,9 %, 96,8 % y 96,6 % de "consistencia", 176 Hz de sondeo) carecen de definicion, conjunto de evaluacion y metodologia, por lo que no son comparables con MMLU, HumanEval, GSM8K ni con ninguna otra referencia estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no hay pesos ni modelo que cargar.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Latencia y throughput: no disponibles.
- Requisitos declarados por el autor: Windows 10/11 de 64 bits, procesador x64 (Intel o AMD), 4,8 MB de espacio en disco y ejecucion como administrador.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable: el repositorio no contiene un modelo de IA y no se han identificado alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: el repositorio aloja un supuesto ejecutable de trading, no pesos ni artefactos de inferencia.
- Inconsistencia de identidad: el nombre del ZIP y del `.exe` remite a un "trainer" de Elden Ring, ajeno al titulo del repositorio.
- Distribucion sospechosa: descarga desde un repositorio de GitHub de terceros, contrasena publicada en la propia pagina y ejecucion como administrador, patron habitual de malware o scareware.
- Cero traccion verificable: 0 descargas y 0 likes en Hugging Face, frente a las 138 000 descargas y la calificacion 5,0/5 que la model card afirma sin respaldo.
- Riesgo financiero: cualquier bot de sniping o copytrade con acceso a claves privadas puede provocar perdida total de fondos.
- Riesgo de seguridad: un binario sin codigo fuente ni firma que solicita privilegios de administrador y gestiona claves criptograficas debe considerarse no confiable por defecto.
- Licencia MIT declarada, sin implicaciones de uso comercial verificables al no existir modelo subyacente.
- Sin sesgos, alucinaciones ni limitaciones linguisticas evaluables por ausencia de modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hqdopp/bitcoin-runes-magic-eden-sniper-bot
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026/releases/download/v1.2.0/elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip
- Repositorio GitHub citado en la model card: https://github.com/Christoph57/bitcoin-runes-magic-eden-sniper-bot/releases/latest
