# Maxfm15/bybit-binance-perp-copytrade-bot

## Resumen

La ficha solicitada corresponde al identificador `Maxfm15/bybit-binance-perp-copytrade-bot` alojado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un modelo de lenguaje: es un repositorio que distribuye un ejecutable para Windows de 64 bits presuntamente orientado a copiar operaciones de trading de perpetuos entre Bybit y Binance. El repositorio no contiene pesos, configuracion de arquitectura, tokenizador ni ningun artefacto propio de un modelo de aprendizaje automatico.

El contenido de la model card es marcadamente anomalo. El nombre del binario distribuido (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`) no guarda relacion alguna con el titulo del repositorio, el archivo se entrega comprimido con contrasena (`2026`) y los enlaces de descarga apuntan a repositorios de GitHub de terceros distintos del autor declarado. Estas caracteristicas son tipicas de campanas de distribucion de software potencialmente malicioso disfrazado de herramienta de trading, y no de un modelo open source evaluable.

Por tanto, esta ficha documenta la ausencia de un modelo de IA real, detalla las especificaciones que no estan disponibles y advierte de los riesgos de seguridad asociados al artefacto. No debe interpretarse como una evaluacion de capacidades de IA, ya que no existen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, no capacidades linguisticas verificadas) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, transformer, MoE ni SSM que describir. El repositorio no publica pesos, no incluye configuracion de modelo (`config.json`), no aporta tokenizador ni documenta un corpus de entrenamiento, numero de tokens, proceso de RLHF/DPO o innovaciones tecnicas de inferencia. La unica documentacion disponible es una model card que describe funcionalidades de un supuesto bot de trading (enrutamiento de ordenes, filtro de honeypots, boveda de claves AES-256, bundler de wallets), sin ningun detalle verificable sobre su implementacion.

Los metadatos de Hugging Face no declaran pipeline, el numero de descargas es 0 y el numero de likes es 0, lo que sugiere un repositorio recien creado y sin validacion por parte de la comunidad. La fecha de creacion y actualizacion es la misma (2026-11-24), sin historial de versiones.

## Capacidades

- No se ha documentado ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No hay evidencia de soporte de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No hay evidencia de capacidades de agente o razonamiento multi-paso propias de un LLM.
- Las etiquetas multilingues de la model card (14 idiomas) no estan respaldadas por ningun artefacto linguistico verificable.
- El contenido de la model card menciona funcionalidades de trading (paper trading, filtro de honeypots, take profit multinivel, enrutamiento de ordenes inferior a 40 ms, boveda de claves local, bundler de 20 wallets), pero ninguna es verificable ni corresponde a un modelo de IA.

## Casos de uso

- No procede. Al no existir un modelo de IA, no hay escenarios de inferencia, generacion o razonamiento que documentar.
- Un supuesto bot de copytrading de perpetuos no es un caso de uso de un modelo open source evaluable en el sentido de esta ficha.
- La distribucion de ejecutables con contrasena y enlaces a repositorios de terceros no constituye un caso de uso legitimo de un modelo de Hugging Face.
- Cualquier uso del artefacto en un entorno de produccion o con credenciales reales de exchange conlleva riesgo de seguridad no cuantificado.
- No se recomienda su despliegue ni su evaluacion como modelo.
- Para necesidades reales de IA (generacion, razonamiento, codigo), debe recurrirse a modelos con pesos publicados y documentacion tecnica verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ya que no hay un modelo de lenguaje que evaluar.

## Requisitos de hardware

- No aplica en terminos de VRAM para inferencia de un modelo de IA: no hay pesos que cargar.
- El artefacto declarado es un ejecutable para Windows 10/11 de 64 bits; los requisitos reales de CPU, RAM y disco no estan documentados de forma fiable.
- No hay GPU recomendadas porque no existe inferencia de red neuronal.
- No cabe en GPU consumer en el sentido de ejecutar un modelo, porque no hay modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles.
- Latencia y throughput: no disponibles; las cifras de la model card (sub-40 ms, <29 ms, <8 ms, <11 ms) no son verificables y no corresponden a inferencia de IA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| Maxfm15/bybit-binance-perp-copytrade-bot | no disponible | no disponible | MIT | Hugging Face (0 descargas) | Ejecutable Windows, no modelo de IA |
| Modelo de lenguaje open source de referencia | no disponible | no disponible | no disponible | no disponible | No comparable: categoria distinta |

No existe un modelo comparable de la misma categoria, porque este repositorio no es un modelo de IA. La comparacion con LLM open source carece de sentido tecnico.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, arquitectura ni tokenizador; no puede evaluarse como modelo.
- El binario distribuido (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`) tiene un nombre incoherente con el titulo del repositorio, lo que indica posible suplantacion o reempaquetado.
- El archivo se distribuye comprimido con contrasena (`2026`), practica habitual para evadir analisis automatizados de antivirus y sandboxes.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`martina1713`, `rogers77795`) distintos del autor declarado en Hugging Face (`Maxfm15`).
- Riesgo elevado de malware, robo de credenciales de exchange o fraude financiero; no debe ejecutarse en equipos con acceso a wallets o claves API.
- Las afirmaciones de rendimiento de la model card (98,3 %, 99,1 %, latencias inferiores a 40 ms) no son verificables y no estan respaldadas por ningun artefacto.
- La licencia MIT declarada no otorga ninguna garantia sobre la seguridad o legitimidad del ejecutable.
- No hay sesgos documentados porque no hay modelo; el riesgo principal es de seguridad informatica, no de sesgo algorítmico.
- Cualquier uso comercial o en produccion es desaconsejable sin auditoria forense previa del binario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Maxfm15/bybit-binance-perp-copytrade-bot
- Repositorio GitHub referenciado en la model card (tercero, no verificado): https://github.com/rogers77795/bybit-binance-perp-copytrade-bot/releases/latest
- Repositorio GitHub referenciado en la model card (tercero, no verificado): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Paper, blog, demo o documentacion tecnica: no disponible
