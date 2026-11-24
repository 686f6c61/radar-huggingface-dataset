# b1yde/gmgn-bullx-photon-copytrade-bot-2026

## Resumen

El artefacto publicado bajo el identificador `b1yde/gmgn-bullx-photon-copytrade-bot-2026` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 distribuido como archivo ZIP de 4,8 MB que, según su propia model card, implementa funciones de copia de operaciones (copytrade) sobre plataformas de trading de criptomonedas como GMGN, BullX y Photon, incluyendo módulos de sniper, bundling con Jito y filtros anti-honeypot.

La model card no declara arquitectura de red neuronal, parámetros, contexto ni pesos en formato safetensors o GGUF. Los campos de Hugging Face que normalmente describen un modelo (pipeline, tamaño, formato) aparecen vacíos o sustituidos por metadatos de sistema operativo y etiquetas de marketing. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

Desde la perspectiva de un editor técnico, este artefacto debe clasificarse como software binario empaquetado, no como modelo de lenguaje. La ficha que sigue documenta lo que el autor declara, señalando explícitamente los datos no disponibles y las advertencias de seguridad asociadas a la distribución de ejecutables con contraseña en archivos ZIP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos, sin evidencia de capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como ZIP con `.exe`; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un binario `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe` (build `v3.8.3`, hash parcial `5688F3`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. Los módulos que el autor enumera son funcionalidades de trading: take profit multinivel, sandbox de paper trading, almacén local de claves AES-256, copia de carteras de ballenas, filtro anti-honeypot y motor de bundles con Jito y MEV.

No se aporta información sobre dataset, tokens de entrenamiento, RLHF, DPO ni innovaciones de modelado. Los valores de latencia y polling que aparecen en la tabla del autor (menos de 21 ms, 354 Hz, 121 Hz) son afirmaciones de marketing sin metodología de medición reproducible.

## Capacidades

- Ejecución de un binario para Windows 10 y 11 de 64 bits, según la model card.
- Módulo declarado de take profit multinivel con objetivos de escala y trailing stop.
- Sandbox de paper trading contra libros de órdenes en vivo, según el autor.
- Almacén local de claves con cifrado AES-256 declarado.
- Copia de operaciones de carteras identificadas como smart money.
- Filtro previo a la compra basado en verificación de autoridades mint/freeze y bloqueo de LP.
- Motor de bundles con Jito y MEV con dimensionamiento dinámico de propinas.
- Soporte multilingüe declarado en 14 idiomas únicamente a nivel de metadatos; no hay evidencia de interfaz ni de procesamiento de lenguaje natural.

## Casos de uso

- Automatización de copia de operaciones en cadenas compatibles con Solana: el autor declara espejo de carteras de ballenas con dimensionamiento proporcional, aunque no se documenta qué RPC ni qué exchanges soporta.
- Simulación de estrategias sin riesgo: el módulo de paper trading permitiría probar configuraciones de take profit antes de operar con capital real, según la descripción del autor.
- Gestión de claves en local: el almacén AES-256 declarado evitaría exponer claves privadas a servicios remotos, si la implementación es verificable.
- Filtrado de tokens fraudulentos: la verificación de autoridades mint/freeze y de bloqueo de LP se usaría como comprobación previa a cualquier compra.
- Ejecución atómica de transacciones: el motor de bundles con Jito se orientaría a incluir operaciones en bloque con propinas dinámicas para reducir el riesgo de front-running.
- Distribución portable en entornos Windows: al no requerir instalación, el binario podría ejecutarse en máquinas de escritorio de 64 bits, siempre que se acepte el riesgo de ejecutar software sin firma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de latencia y frecuencia de sondeo que aparecen en la model card (menos de 21 ms, 354 Hz, 121 Hz, menos de 26 MB de RAM) carecen de metodología y no deben interpretarse como mediciones verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo de IA.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Huella de disco declarada: 4,8 MB para el ZIP; el binario extraído no se especifica.
- Memoria RAM declarada: menos de 26 MB para el módulo de almacén de claves, según el autor.
- Opciones de despliegue: ejecución directa del `.exe` como administrador; no se contemplan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Criterio | gmgn-bullx-photon-copytrade-bot-2026 | Modelo de lenguaje open source típico (p. ej., Llama, Mistral, Qwen) | Bot de trading open source verificable |
|---|---|---|---|
| Naturaleza | Ejecutable Windows empaquetado | Red neuronal con pesos publicados | Código fuente auditable |
| Parámetros | no disponible | Miles de millones, declarados | no aplica |
| Contexto | no disponible | Decenas de miles de tokens | no aplica |
| Pesos | No publicados (solo `.exe`) | safetensors, GGUF | Repositorio Git |
| Licencia | MIT (declarada) | Apache 2.0, MIT, otras | Variable |
| Verificabilidad | Nula: binario cerrado con contraseña | Alta: pesos y código abiertos | Alta si el repositorio es público |

No se identifican en la información proporcionada modelos comparables de la misma categoría con datos verificables.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural pese a los metadatos multilingües.
- Distribución de un ejecutable sin firma digital, dentro de un ZIP protegido con contraseña y alojado en un repositorio de GitHub de terceros, práctica habitual en campañas de malware.
- El repositorio de Hugging Face (`b1yde/...`) y el de GitHub citado en la model card (`carlos7088/...`, `dianenelson33/...`) no coinciden, lo que impide trazar la procedencia del binario.
- Las insignias de descargas (902K+) y de versión no son verificables y contradicen el contador real de Hugging Face (0 descargas).
- Operar con criptomonedas mediante bots no auditados expone a pérdida total del capital y a robo de claves privadas.
- La licencia MIT declarada cubre el artefacto publicado, pero no garantiza la ausencia de código malicioso ni la legalidad del uso en jurisdicciones con restricciones sobre trading automatizado.
- No se documentan sesgos, alucinaciones ni limitaciones de contexto porque no aplican a un binario de trading; el riesgo relevante es de seguridad y de pérdida financiera.

## Enlaces

- Hugging Face: https://huggingface.co/b1yde/gmgn-bullx-photon-copytrade-bot-2026
- Repositorio GitHub citado en la model card (autor dianenelson33): https://github.com/dianenelson33/gmgn-bullx-photon-copytrade-bot-2026
- Repositorio GitHub citado para la descarga (autor carlos7088): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026
- Enlace de descarga directa citado en la model card: https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- Papers, blogs y demos: no disponible
