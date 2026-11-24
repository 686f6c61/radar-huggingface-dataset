# Kobyko/gmgn-bullx-photon-copytrade-bot-win11

## Resumen

El repositorio `Kobyko/gmgn-bullx-photon-copytrade-bot-win11` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits presentado como un bot de copytrading para plataformas de intercambio de criptomonedas (GMGN, BullX y Photon), distribuido como archivo ZIP de 8,9 MB junto con un binario `.exe` y una contraseña de descompresión fija (`2026`).

La model card no describe arquitectura de red neuronal, pesos, tokenizador ni proceso de entrenamiento. Los apartados habituales de un modelo (parametros, contexto, cuantizacion, formatos de pesos) no aplican porque no existe ningún artefacto de aprendizaje automatico en el repositorio. La etiqueta `license:mit` y la lista de idiomas de la model card corresponden a metadatos del paquete, no a capacidades linguisticas de un modelo.

Desde la perspectiva de evaluacion de modelos, este repositorio debe clasificarse como software de terceros potencialmente malicioso o, como minimo, no verificado: un binario cerrado distribuido con contrasena, que solicita ejecucion como administrador y que se promociona con insignias de "99% verificado" sin evidencia tecnica. No es un modelo open source y no debe tratarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete `.exe` para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los metadatos listan en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id, pero no hay modelo linguistico) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` y un binario `v3.7.4`) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. El contenido del repositorio es un ejecutable `gmgn-bullx-photon-copytrade-bot-win11-v1.2.0-win64.exe` (build `v3.7.4`, identificador `1CFD5D9C40`) empaquetado en un ZIP de 8,9 MB protegido con la contrasena `2026`. La model card menciona modulos funcionales de un bot de trading (rutado de ordenes por debajo de 40 ms, bundler de 20 wallets con Lookup Tables, filtro de honeypots, vault local AES-256, sandbox de paper trading), pero no aporta informacion sobre el codigo fuente, el lenguaje de implementacion ni la procedencia del binario.

No existe informacion sobre datos de entrenamiento, tokens procesados, composicion del dataset, RLHF, DPO ni ninguna innovacion en el plano del aprendizaje automatico. Cualquier afirmacion sobre "hardware-accelerated modules" o "consistencia del 96,8%" en la model card carece de respaldo verificable en el repositorio.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en modelos.
- No tiene capacidades multilingues derivadas de un modelo linguistico.
- Las unicas funcionalidades declaradas son las de un bot de trading: rutado de ordenes, gestion multi-wallet, filtro de honeypots, vault de claves y simulacion de paper trading. Todas ellas sin verificacion independiente.

## Casos de uso

No procede enumerar casos de uso de un modelo de IA porque el artefacto no lo es. A modo de advertencia, los escenarios en los que se presenta este repositorio son:

- Automatizacion de copytrading en plataformas de criptomonedas: el binario afirma replicar operaciones de wallets de referencia; no hay auditoria publica del codigo ni del comportamiento real.
- Gestion de multiples wallets con Lookup Tables: funcionalidad declarada sin codigo fuente verificable.
- Filtrado previo de compra de tokens fraudulentos (honeypots): declarado en la model card, sin evidencia tecnica.
- Custodia local de claves con AES-256: declarado, pero un binario cerrado no permite verificar el manejo de claves.
- Simulacion de estrategias (paper trading): declarado, sin trazabilidad.
- Ejecucion como administrador en Windows 11: requerimiento del propio paquete, no una capacidad del modelo.

Ninguno de estos casos debe considerarse recomendable sin auditoria de seguridad independiente del binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (respuesta en menos de 27 ms, polling a 123 Hz y 239 Hz, consistencia del 96,8%, uso de menos de 25 MB de RAM) son afirmaciones del autor sin metodologia, sin conjunto de prueba y sin replicacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo requerido: Windows 10 u 11 de 64 bits, segun la model card.
- Opciones de despliegue: ejecucion directa del binario `.exe` como administrador; no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no existe modelo.
- Latencia y throughput: no verificables; las cifras declaradas (menos de 40 ms de rutado, menos de 27 ms de respuesta) carecen de respaldo.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de IA tipico (p. ej. Llama, Mistral, Qwen) |
|---|---|---|
| Naturaleza | Binario `.exe` para Windows | Pesos en safetensors/GGUF |
| Parametros | no disponible | Miles de millones, publicados |
| Contexto | no disponible | Decenas de miles de tokens |
| Pesos auditables | No | Si |
| Codigo fuente | No | Habitualmente si |
| Benchmarks publicados | No | Si (MMLU, HumanEval, GSM8K, etc.) |
| Licencia | MIT declarada | MIT, Apache 2.0, licencias comunitarias |
| Riesgo de seguridad | Alto (binario cerrado, pide administrador, contrasena fija) | Bajo o medio segun procedencia |

No existe comparacion tecnica posible con modelos de IA porque la categoria es distinta.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Distribucion de un binario cerrado con contrasena fija (`2026`) y solicitud de ejecucion como administrador: patron habitual en campanas de malware.
- Ausencia de codigo fuente, hash verificable o firma digital del ejecutable.
- Insignias de "99% verificado" y "Build v3.7.4" sin evidencia tecnica que las respalde.
- La licencia MIT declarada no implica que el binario sea seguro ni que su comportamiento coincida con lo descrito.
- Riesgo financiero directo: un bot de trading con acceso a claves privadas y ejecucion como administrador puede comprometer fondos y el sistema operativo.
- La model card incluye enlaces a un repositorio de GitHub de terceros (`FiramuXo89`), no al autor del repositorio de Hugging Face, lo que anade opacidad sobre la cadena de custodia.
- No hay issues, descargas ni likes que permitan inferir uso legitimo o comunidad activa.
- Recomendacion: no ejecutar el binario; si se necesita funcionalidad de trading automatizado, usar software con codigo abierto auditable y firmas verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/gmgn-bullx-photon-copytrade-bot-win11
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/FiramuXo89/gmgn-bullx-photon-copytrade-bot-win11
- Releases referenciados en la model card (no verificados): https://github.com/FiramuXo89/gmgn-bullx-photon-copytrade-bot-win11/releases/latest
- Paper, blog o demo: no disponible
