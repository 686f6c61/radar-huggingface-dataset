# smaazahmed/gmgn-bullx-photon-copytrade-bot-v3

## Resumen

El artefacto publicado bajo el identificador `smaazahmed/gmgn-bullx-photon-copytrade-bot-v3` en Hugging Face no es un modelo de inteligencia artificial. Se presenta como un ejecutable portable para Windows x64 (build `v2.7.8`, referencia interna `C58898`) distribuido en un archivo ZIP de 4,8 MB con contrasena `2026`, y su model card describe funcionalidades de copytrade de wallets, enrutado de ordenes y bundles Jito/MEV sobre cadenas de criptomonedas.

La ficha se ha redactado a partir de la informacion disponible en Hugging Face y del contenido textual de la model card. No existe informacion sobre arquitectura de red neuronal, parametros, tokenizador, datos de entrenamiento ni pesos en formato safetensors o GGUF. El pipeline declarado es "no disponible" y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Es relevante advertir que la model card contiene multiples senales de riesgo: referencias cruzadas a repositorios de terceros no coincidentes con el identificador publicado, enlaces de descarga alojados en un repositorio de GitHub ajeno al autor declarado, nombres de archivo que aluden a cheats de videojuegos (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip`), instrucciones para ejecutar binarios como administrador y para desactivar avisos de Windows Defender o SmartScreen, y afirmaciones de rendimiento no verificables (latencia sub-40 ms, 96,6 % de consistencia, menos de 20 MB de RAM). Todo ello es incompatible con un modelo de IA open source y encaja con patrones habituales de distribucion de malware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion en ZIP con ejecutable `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red neuronal, numero de parametros, composicion del dataset, tokens de entrenamiento ni tecnicas de alineacion como RLHF o DPO. El artefacto no contiene pesos de modelo ni tokenizador.

La model card describe modulos de software orientados a trading: copia de wallets de "smart money", bundler de 20 wallets mediante Lookup Tables, sandbox de paper trading con 15 hilos de trabajo, filtro previo a la compra de honeypots, enrutado de ordenes por WebSocket y gRPC, y motor de bundles Jito/MEV con dimensionado dinamico de propinas. Estas descripciones no van acompanadas de codigo fuente auditable, hashes de verificacion ni trazabilidad de build.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No se documenta razonamiento multi-paso ni comportamiento agentico basado en LLM.
- La model card declara capacidades de software de trading (copytrade, bundles, filtrado de honeypots, paper trading), sin evidencia tecnica verificable.
- El etiquetado multilingue de la model card no implica capacidades linguisticas del artefacto.

## Casos de uso

No procede. Al no tratarse de un modelo de IA, no existen casos de uso legitimos de inferencia, generacion o analisis. Cualquier aplicacion practica descrita en la model card (copytrade automatizado, bundles MEV, paper trading) corresponde a un binario de terceros sin auditoria y no debe desplegarse en entornos de produccion ni ejecutarse en maquinas con acceso a claves privadas o fondos.

- Evaluacion de riesgos de cadena de suministro: util unicamente como muestra para estudiar tecnicas de ingenieria social en model cards (suplantacion de repositorios, contrasenas en el propio README, instrucciones para evadir antivirus).
- Formacion en seguridad: ejemplo de artefacto que combina nombres de modelos de IA con binarios ejecutables para eludir filtros de plataformas.
- Analisis forense: objeto de estudio para equipos de threat intelligence que documenten campanas de distribucion en Hugging Face.
- No se recomienda su ejecucion en ningun escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las cifras que aparecen en la model card (latencia sub-40 ms, 96,6 % de consistencia, menos de 20 MB de RAM, 15 hilos, 812K descargas) no son verificables, no van acompanadas de metodologia y no corresponden a metricas de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecucion como administrador del binario `marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`.
- Latencia y throughput: no disponibles; las cifras de la model card carecen de respaldo.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoria, se contrasta con repositorios legitimos de modelos pequenos que si publican pesos y evaluaciones:

| Aspecto | Este artefacto | Modelo pequeno open source tipico (p. ej. familia Qwen2.5-0.5B/1.5B) |
|---|---|---|
| Contenido | ZIP con `.exe` para Windows | Pesos safetensors/GGUF + tokenizador |
| Parametros | no disponible | 0,5B-1,5B declarados |
| Contexto | no disponible | 32K tokens tipicamente |
| Evaluaciones | ninguna verificable | benchmarks publicados (MMLU, HumanEval, GSM8K) |
| Licencia | MIT | Apache 2.0 o similar |
| Reproducibilidad | nula (binario cerrado) | alta (pesos y recetas publicadas) |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural. Cualquier expectativa de uso como LLM es erronea.
- Suplantacion de identidad: el identificador de Hugging Face (`smaazahmed/...`) no coincide con el repositorio de GitHub enlazado (`haechandeluca864/...`) ni con el nombre del archivo descargado (`marvel-rivals-cheat-esp-aimbot-2026-...`), lo que indica una cadena de publicacion no trazable.
- Indicadores de malware: contrasena en el README para extraer el ZIP, instrucciones para ejecutar como administrador y recomendaciones implicitas de ignorar alertas de Windows Defender y SmartScreen son tecnicas clasicas para evadir analisis automatizado.
- Riesgo financiero: el software declara operar con wallets y ordenes en cadenas de bloques; ejecutarlo puede exponer claves privadas y fondos.
- Riesgo legal: la licencia MIT del metadato no cubre el binario distribuido por terceros; el uso de bots de copytrade y MEV puede infringir terminos de servicio de exchanges y normativa financiera segun jurisdiccion.
- Sesgos y alucinacion: no aplica en el sentido de un LLM, pero la model card contiene afirmaciones no verificables que constituyen desinformacion tecnica.
- Idiomas: el listado multilingue de metadatos no tiene correspondencia con funcionalidad demostrada.
- Recomendacion: no descargar, no extraer y no ejecutar el binario; reportar el repositorio a Hugging Face si se detecta actividad maliciosa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/smaazahmed/gmgn-bullx-photon-copytrade-bot-v3
- Repositorio de GitHub referenciado en la model card (no coincide con el autor): https://github.com/haechandeluca864/gmgn-bullx-photon-copytrade-bot-v3
- Repositorio de GitHub del enlace de descarga directa: https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Paper, blog, demo o documentacion tecnica: no disponibles.
