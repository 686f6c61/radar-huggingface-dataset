# davi1321/hyperliquid-perp-market-maker-bot

## Resumen

`davi1321/hyperliquid-perp-market-maker-bot` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es la model card de un supuesto bot de market making para perpetuos de Hyperliquid distribuido como ejecutable Windows de 64 bits (`hyperliquid-perp-market-maker-bot-v1.2.0-win64.zip`, 8,9 MB) y protegido con contraseña de extracción. La ficha del autor describe subsistemas de firma local AES-256, enrutado de órdenes por debajo de 40 ms, un motor de bundles Jito/MEV y un sandbox de paper trading, pero no contiene pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia.

El repositorio no declara pipeline, no tiene descargas ni likes, y sus tags (`windows`, `windows-11`, `x64`, `portable`) corresponden a un binario ejecutable, no a un modelo. El patrón de presentación (enlace directo a un ZIP en un repositorio de GitHub de terceros, contraseña fija `2026`, instrucciones de ejecutar como administrador, insignias de descargas infladas) es característico de distribución de software no verificado y potencialmente malicioso.

Desde la perspectiva de evaluación de modelos, este repositorio no es utilizable: no se puede cargar con `transformers`, `vLLM`, `llama.cpp` ni ningún runtime de inferencia. La ficha se redacta por completitud documental, dejando constancia explícita de la ausencia de cualquier componente de modelo y de los riesgos asociados a su descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el artefacto es un ejecutable Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos de la model card, no como capacidad lingüística del binario) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` (`hyperliquid-perp-market-maker-bot-v1.2.0-win64.exe`, build `v4.5.8`, `00B1CD`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un conjunto de componentes de software de trading: almacén de claves local AES-256 para firma no custodial, un "20-wallet LUT bundler" para ejecución multi-cartera en el mismo bloque mediante Lookup Tables, un sandbox de paper trading contra order books en vivo, un motor de bundles Jito/MEV con dimensionado dinámico de propinas, enrutado de órdenes por WebSocket y gRPC con latencia declarada inferior a 40 ms, y un filtro de honeypots con sondeo a 300 Hz. Ninguno de estos elementos es verificable a partir de los artefactos publicados en Hugging Face.

No se aportan datos de entrenamiento, número de tokens, composición del corpus, ni etapas de RLHF, DPO o SFT, porque el objeto no es un modelo lingüístico. Tampoco se documenta la cadena de compilación del ejecutable, las dependencias, el hash del binario ni la firma de código, lo que impide cualquier auditoría de reproducibilidad.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado ni verificable de tool calling o function calling en el sentido de un modelo de lenguaje.
- No hay soporte declarado de agentes o razonamiento multi-paso basado en un modelo.
- El multilingüismo listado en los metadatos (14 idiomas) corresponde a etiquetas de la model card, no a una capacidad evaluada del binario.
- Las funcionalidades descritas por el autor son de naturaleza financiera (market making en perpetuos, firma de transacciones, bundles MEV) y no han sido verificadas de forma independiente.
- No se ha publicado ninguna evaluación de capacidades.

## Casos de uso

No se identifican casos de uso legítimos y verificables para este repositorio en el contexto de evaluación de modelos de IA. Los escenarios que se enumeran a continuación describen lo que el autor afirma que hace el binario, no recomendaciones de uso:

- Market making en perpetuos de Hyperliquid: el autor declara enrutado de órdenes con latencia inferior a 40 ms mediante WebSocket y gRPC; no hay evidencia independiente de estas cifras.
- Firma no custodial de transacciones: se describe un almacén local AES-256 para evitar exponer claves a servicios remotos; el binario no es auditable desde el repositorio.
- Ejecución multi-cartera en el mismo bloque: se menciona un bundler de 20 carteras mediante Lookup Tables; sin código fuente ni binario verificable.
- Simulación de estrategias: se declara un sandbox de paper trading contra order books en vivo; no hay forma de confirmar su comportamiento sin ejecutar el binario.
- Inclusión atómica de bloques con propinas dinámicas: se describe un motor Jito/MEV; no se aporta evidencia de integración real.
- Filtrado de honeypots: se declara verificación de autoridades de mint/freeze y bloqueo de liquidez a 300 Hz; no verificable.

Cualquiera de estos escenarios implica ejecutar un binario de origen no verificado con privilegios de administrador en un equipo Windows, lo que constituye un riesgo de seguridad significativo y no un caso de uso recomendable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor incluye cifras internas no auditadas (97,8 % de consistencia en el almacén de claves, respuesta inferior a 18 ms del bundler, consumo inferior a 41 MB de RAM del sandbox, 14 hilos de trabajo, sondeo a 300 Hz), pero no son benchmarks reproducibles ni comparables con métricas estándar de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits sobre procesadores Intel y AMD x64.
- Requisitos declarados por el autor: ejecución como administrador, extracción previa del ZIP con contraseña `2026`, consumo de RAM indicado por debajo de 41 MB para el sandbox y 14 hilos de trabajo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un ejecutable nativo de Windows.
- Latencia y throughput: el autor declara enrutado por debajo de 40 ms y respuesta del bundler por debajo de 18 ms; no verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Frente a otros repositorios de Hugging Face, la diferencia categórica es que estos alojan pesos y configuraciones cargables por runtimes de inferencia, mientras que este aloja la ficha de un binario de trading para Windows.

| Criterio | Este repositorio | Modelo de IA típico en Hugging Face |
|---|---|---|
| Contenido | Model card de un `.exe` para Windows | Pesos en safetensors/GGUF y configuración |
| Cargable por runtime | No | Sí (transformers, vLLM, llama.cpp) |
| Pipeline declarado | No disponible | Text generation, image-text-to-text, etc. |
| Evaluación reproducible | No | Benchmarks públicos habituales |
| Licencia | MIT (declarada) | Variable |
| Descargas / likes | 0 / 0 | Variable |

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, arquitectura ni artefactos de inferencia. No puede evaluarse como modelo.
- Distribución mediante enlace directo a un ZIP alojado en un repositorio de GitHub de terceros (`aukhoney/hyperliquid-perp-market-maker-bot`), no en el propio repositorio de Hugging Face.
- El ZIP está protegido con contraseña fija (`2026`) y las instrucciones indican ejecutar el `.exe` como administrador; ambos patrones dificultan el análisis y elevan el riesgo de seguridad.
- Insignias de descargas (441 K+) y valoración (99 % verificado) no contrastables con las métricas reales de Hugging Face (0 descargas, 0 likes).
- Ausencia de código fuente, hash del binario, firma de código o cadena de compilación: no es auditable ni reproducible.
- Riesgo de malware, robo de claves o fraude financiero al ejecutar software no verificado que manipula claves privadas y transacciones.
- La licencia MIT declarada en los metadatos no cubre necesariamente el binario distribuido en GitHub; la titularidad y el alcance real de la licencia no son verificables.
- Las capacidades financieras descritas (market making, MEV, bundles) no han sido validadas de forma independiente y su uso puede infringir términos de servicio de exchanges o normativa financiera aplicable.
- No se debe tratar este repositorio como fuente de un modelo para producción, investigación o evaluación comparativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/davi1321/hyperliquid-perp-market-maker-bot
- Repositorio de GitHub referenciado por el autor: https://github.com/aukhoney/hyperliquid-perp-market-maker-bot
- Releases del repositorio de GitHub referenciado: https://github.com/aukhoney/hyperliquid-perp-market-maker-bot/releases/latest
- Enlace directo al ZIP citado en la model card: https://github.com/aukhoney/hyperliquid-perp-market-maker-bot/releases/latest/download/hyperliquid-perp-market-maker-bot-v1.2.0-win64.zip
- Paper, blog, demo o documentación técnica: no disponible
