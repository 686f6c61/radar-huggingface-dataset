# abod1231/gmgn-ai-bullx-solana-copytrade-bot

## Resumen

La ficha corresponde a `abod1231/gmgn-ai-bullx-solana-copytrade-bot`, un repositorio alojado en Hugging Face que no contiene un modelo de lenguaje ni pesos neuronales, sino un paquete ejecutable para Windows x64 presentado como bot de copytrading sobre Solana con integraciones GMGN y Bullx. El artefacto anunciado es un ZIP de 4,8 MB con un binario `.exe`, distribuido a través de enlaces a GitHub Releases y protegido con una contraseña de archivo. No existe pipeline declarado, ni arquitectura, ni parámetros, ni contexto: los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) confirman que se trata de software empaquetado, no de un modelo entrenado.

La model card mezcla de forma incoherente el supuesto bot de trading con nombres de fichero y repositorios de un supuesto cheat para *Marvel Rivals* (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`), lo que apunta a una plantilla reutilizada de campañas de distribución de software potencialmente malicioso. Se anuncian métricas no verificables (549K descargas, valoración 5.0/5, consistencia del 99,7 %, sondeo a 239 Hz) y credenciales de descompresión incrustadas, un patrón habitual en repositorios señuelo.

Desde la perspectiva de evaluación de IA open source, este repositorio no es relevante como modelo: no hay tarjetas de arquitectura, no hay benchmarks, no hay código de inferencia y la licencia MIT declarada no acredita la procedencia del binario. La ficha se completa a continuación con los datos disponibles y con marcas explícitas de "no disponible" en todo lo que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un paquete ejecutable Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos; no verificable para el binario) |
| Formato de pesos | no disponible; el artefacto es un ZIP con un `.exe` (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip`, 4,8 MB) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El repositorio declara un paquete portable para Windows 10/11 de 64 bits, con un binario identificado como `marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe` y build `v4.6.1 (D0E60A)`. La model card enumera subsistemas funcionales del supuesto bot: almacén local de claves AES-256, take profit multinivel, motor de bundles Jito/MEV, agrupador de 20 wallets mediante Lookup Tables, filtro antihoneypot previo a la compra y copytrading de "smart money".

No se documenta ningún proceso de entrenamiento, dataset, tokenizador, técnica de alineación (RLHF, DPO) ni innovación algorítmica. Las cifras de rendimiento que aparecen (por ejemplo, sondeo a 239 Hz o 137 Hz, uso de memoria inferior a 37 MB y 41 MB por módulo, 9 hilos de trabajo) son afirmaciones del autor sin metodología de medición ni código reproducible. Tampoco se especifica el lenguaje de implementación ni las dependencias del binario.

## Capacidades

- Ejecución de un binario portable en Windows 10/11 x64, sin instalador, según la documentación del autor.
- Gestión local de claves con cifrado AES-256 declarado y firma local no custodial.
- Estrategias de take profit multinivel y trailing stop, según la model card.
- Construcción de bundles Jito/MEV con dimensionado dinámico de propinas, según la model card.
- Ejecución multiwallet en el mismo bloque mediante Lookup Tables (hasta 20 wallets declaradas).
- Filtro previo a la compra basado en autoridades de mint/freeze y bloqueo de liquidez.
- Copytrading de wallets de "smart money" con dimensionado proporcional.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, porque no es un modelo de lenguaje.

## Casos de uso

- No recomendado para ningún caso de uso en producción. El repositorio no contiene un modelo evaluable y el binario se distribuye mediante enlaces externos, contraseña de archivo incrustada y nombres de fichero incoherentes con el propósito declarado.
- Auditoría de cadena de suministro: un equipo de seguridad puede usar este repositorio como muestra de técnicas de señuelo (tags de modelo, badges falsos, contraseñas en la model card) para formar a analistas en detección de campañas de malware.
- Estudio de ingeniería social en Hugging Face: sirve como ejemplo documentado de reutilización de plantillas entre supuestos bots de trading y supuestos cheats de videojuegos.
- Formación en análisis de binarios Windows: el ZIP anunciado podría analizarse en una máquina virtual aislada y sin red para caracterizar el ejecutable, aunque no se recomienda su descarga ni ejecución.
- Verificación de licencias: un equipo legal puede comprobar que la licencia MIT declarada en metadatos no cubre necesariamente un binario de procedencia desconocida.
- No se identifican casos de uso legítimos de trading automatizado, dado que no hay código fuente, ni repositorio verificable, ni documentación técnica del motor de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras presentes son afirmaciones de marketing sin metodología (549K descargas, valoración 5.0/5, consistencia del 99,7 %, sondeo a 239 Hz y 137 Hz, 9 hilos, menos de 37 MB y 41 MB de RAM por módulo) y no constituyen benchmarks reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Tamaño del paquete: 4,8 MB (ZIP), con contraseña de extracción `2026` según la model card.
- Opciones de despliegue: ejecución directa del `.exe` como administrador, según las instrucciones del autor; no se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay pesos.
- Latencia y throughput: no disponible; las cifras de sondeo (239 Hz, 137 Hz) no están respaldadas por mediciones públicas.

## Comparativa con modelos similares

| Criterio | abod1231/gmgn-ai-bullx-solana-copytrade-bot | Modelo de lenguaje open source típico (referencia genérica) | Bot de trading open source verificable (referencia genérica) |
|---|---|---|---|
| Naturaleza | Paquete `.exe` para Windows | Pesos neuronales + código de inferencia | Código fuente auditable |
| Parámetros | no disponible (no aplica) | Millones a cientos de miles de millones | no aplica |
| Contexto | no disponible (no aplica) | 4K–1M tokens según familia | no aplica |
| Benchmarks públicos | ninguno | MMLU, HumanEval, GSM8K, etc. | métricas de backtesting |
| Licencia | MIT declarada, no verificable en el binario | Apache-2.0, MIT, Llama, etc. | MIT, GPL, etc. |
| Reproducibilidad | nula (binario cerrado, enlaces externos) | alta (pesos y código publicados) | alta si hay código |
| Disponibilidad | 0 descargas, 0 likes en Hugging Face | variable | variable |

No se dispone de alternativas directamente comparables dentro del mismo repositorio ni de modelos de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Incoherencia grave entre el propósito declarado (bot de copytrading en Solana) y los nombres de fichero y repositorios enlazados (cheat para *Marvel Rivals*), indicio de plantilla reutilizada o de suplantación.
- Distribución mediante enlaces a GitHub Releases de terceros y contraseña de archivo incrustada en la model card, patrón asociado a campañas de malware.
- Ausencia total de código fuente, hashes, firmas o análisis del binario; imposible verificar qué ejecuta el `.exe`.
- Métricas de rendimiento y popularidad no verificables (549K descargas, 5.0/5, 99,7 % de consistencia) sin metodología ni fuente.
- Riesgo financiero directo: un bot de trading que gestiona claves privadas y ejecuta operaciones en Solana puede provocar pérdida de fondos si el binario es malicioso o defectuoso.
- Licencia MIT declarada en metadatos que no garantiza derechos sobre el binario ni sobre dependencias de terceros.
- Idiomas declarados (14) sin evidencia de localización real del software.
- Sin benchmarks, sin auditoría de seguridad y sin historial de mantenimiento (creado y actualizado el mismo día, 2026-11-24).
- No apto para producción, investigación académica ni evaluación comparativa de modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abod1231/gmgn-ai-bullx-solana-copytrade-bot
- Enlace de descarga citado en la model card (GitHub Releases de terceros): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio GitHub citado en la model card: https://github.com/ursulagarcia861/gmgn-ai-bullx-solana-copytrade-bot/releases/latest
- Paper, blog, demo o documentación técnica: no disponible.
