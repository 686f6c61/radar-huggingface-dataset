# mabijinx/kamino-marginfi-drift-solana-bot

## Resumen

La entrada `mabijinx/kamino-marginfi-drift-solana-bot` de Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable para Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`, empaquetado en un ZIP de 4,8 MB protegido con contraseña) presentado como un bot de trading para protocolos DeFi de Solana (Kamino, Marginfi y Drift). No contiene pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje.

La model card no describe ninguna arquitectura neuronal, dataset de entrenamiento, proceso de alineación ni benchmarks. El contenido se limita a instrucciones de descarga, una tabla de "módulos" con cifras de rendimiento no verificables y metadatos de compilación. Los tags del repositorio (`windows`, `x64`, `portable`) confirman que el artefacto es software binario, no un modelo.

Desde el punto de vista de la evaluación técnica, esta ficha debe leerse como una advertencia: el patrón (binario ofuscado, contraseña fija en el propio README, insignias de descargas y valoraciones falsas, enlaces a un repositorio de GitHub de terceros distinto del autor) es característico de campañas de distribución de malware. No se recomienda su descarga ni ejecución. Los apartados siguientes documentan la ausencia de datos técnicos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, sin justificación técnica) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El repositorio no incluye ficheros de configuración (`config.json`), tokenizador, `model.safetensors`, `pytorch_model.bin` ni ningún otro artefacto propio de un modelo. Tampoco hay información sobre datos de entrenamiento, número de tokens, composición del corpus, RLHF, DPO u otras técnicas de alineación.

El único contenido técnico declarado es un manifiesto TOML con un nombre de paquete, una versión (`4.8.7`), una firma (`40B47BF53C`) y un nombre de ejecutable. La model card menciona módulos como "filtro honeypot", "copytrade de smart money" o "enrutado de órdenes sub-40 ms", pero no aporta código fuente, binarios reproducibles ni documentación de API que permita auditarlos. No hay innovación técnica verificable.

## Capacidades

- No se puede confirmar ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión, porque no hay modelo.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos (14 idiomas) no están respaldadas por ningún componente lingüístico identificable.
- El autor atribuye al binario funciones de trading (ejecución multi-wallet, copia de carteras, take profit escalonado), pero son afirmaciones no verificables y sin código asociado.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque el repositorio no contiene ninguno. Los escenarios que sugiere la model card (trading algorítmico en Solana, copia de ballenas, sandbox de paper trading) implican ejecutar un binario de procedencia dudosa con permisos de administrador y acceso a claves de wallet, lo que constituye un riesgo de seguridad, no un caso de uso recomendable.

- Ninguno de los escenarios propuestos puede validarse técnicamente.
- La ejecución del `.exe` con privilegios elevados expone el sistema a compromiso.
- La introducción de claves privadas de Solana en dicho binario permitiría el vaciado de fondos.
- No existe documentación de API, SDK ni integración verificable con Kamino, Marginfi o Drift.
- No hay trazabilidad del binario (sin código fuente, sin compilación reproducible, sin firma de código).
- Cualquier evaluación de rendimiento sería imposible sin acceso al artefacto y sin entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (160 Hz de sondeo, 120 Hz, sub-40 ms, 96,9 % de consistencia, 96,7 %, menos de 55 MB de RAM) son afirmaciones del autor sin metodología, sin conjunto de datos de evaluación y sin posibilidad de reproducción; no deben interpretarse como métricas de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible; las cifras de la model card no son verificables.
- Requisitos del artefacto declarado: Windows 10 22H2 o Windows 11 24H2, x64, y ejecución como administrador según las propias instrucciones del autor.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de lenguaje open source típico (p. ej., familia Llama, Qwen, Mistral) | Bot de trading legítimo (p. ej., frameworks open source auditables) |
|---|---|---|---|
| Naturaleza | Binario Windows en ZIP | Pesos + tokenizador + config | Código fuente auditable |
| Pesos publicados | No | Sí (safetensors, GGUF) | No aplica |
| Arquitectura documentada | No | Sí | No aplica |
| Benchmarks reproducibles | No | Habitualmente sí | No aplica |
| Licencia | MIT declarada | Varía (MIT, Apache-2.0, community) | Varía |
| Auditabilidad | Nula (binario ofuscado) | Alta (pesos y código) | Alta (código fuente) |

No se dispone de alternativas comparables dentro de la categoría "modelo de IA" porque el objeto evaluado no pertenece a ella.

## Limitaciones y advertencias

- Ausencia total de artefactos de modelo: no hay pesos, configuración ni tokenizador que evaluar.
- Señales de riesgo claras: ZIP de 4,8 MB con contraseña fija publicada en el propio README, insignias de descargas (364K+) y valoraciones (4,9/5) no verificables, y enlaces de descarga alojados en un repositorio de GitHub (`dawidb9567/delta-executor-pc-2026`) distinto del autor declarado (`mabijinx` / `mishra82819`).
- Ejecución como administrador solicitada de forma explícita, lo que amplía el impacto de cualquier código malicioso.
- Contexto de uso (trading DeFi con wallets de Solana) idóneo para el robo de claves privadas y fondos.
- La licencia MIT declarada en los metadatos no otorga ninguna garantía sobre el binario ni sobre su procedencia.
- No hay evidencia de relación con los equipos de Kamino, Marginfi o Drift; el uso de sus nombres puede constituir suplantación.
- Riesgo de alucinación: no aplica como modelo, pero la model card contiene afirmaciones técnicas no sustentadas que funcionan como señuelo.
- Recomendación: no descargar ni ejecutar el artefacto; si se busca un bot de trading en Solana, optar por software con código fuente público, auditorías y firma de código verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mabijinx/kamino-marginfi-drift-solana-bot
- Repositorio de GitHub citado en la model card (descarga del binario): https://github.com/dawidb9567/delta-executor-pc-2026
- Repositorio de GitHub alternativo citado: https://github.com/mishra82819/kamino-marginfi-drift-solana-bot
- Documentación de Kamino: https://docs.kamino.finance
- Documentación de Marginfi: https://docs.marginfi.com
- Documentación de Drift: https://docs.drift.trade
