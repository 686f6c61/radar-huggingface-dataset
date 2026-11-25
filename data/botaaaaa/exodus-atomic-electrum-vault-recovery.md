# botaaaaa/exodus-atomic-electrum-vault-recovery

## Resumen

`botaaaaa/exodus-atomic-electrum-vault-recovery` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. La model card describe un supuesto ejecutable portable para Windows 10/11 x64 (`exodus-atomic-electrum-vault-recovery-v1.2.0-win64.zip`, 8,9 MB, build `v1.0.7 (D24DA5)`) distribuido a través de un repositorio externo de GitHub (`Jenod129/exodus-atomic-electrum-vault-recovery`) y protegido con la contraseña `2026`. El artefacto se presenta como una herramienta de "recuperación de vaults" de monederos cripto (Exodus, Atomic, Electrum) con derivación BIP44/BIP84, rotación de RPC y validación de semillas BIP39.

No existe ningún transformer, pesos neuronales, tokenizador ni pipeline de inferencia detrás del identificador. El repositorio es, por tanto, un falso modelo: reutiliza el espacio de nombres de Hugging Face para distribuir un binario opaco. La metadata del Hub (0 descargas, 0 likes, pipeline no disponible, creado y actualizado en noviembre de 2026) es coherente con un artefacto de publicación reciente y sin tracción.

Desde el punto de vista de seguridad, la combinación de binario cerrado, contraseña de extracción incrustada en el propio README, instrucciones para ejecutar como Administrador, aviso explícito de que Windows Defender y SmartScreen lo marcarán como sospechoso y temática de recuperación de semillas cripto configura un patrón clásico de distribución de *malware* o *infostealer* dirigido a tenedores de criptomonedas. No debe descargarse ni ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según tags del Hub; no verificable) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No aplica. No se ha publicado información sobre arquitectura neuronal, dataset de entrenamiento, número de tokens, proceso de alineamiento (RLHF/DPO) ni innovaciones técnicas de inferencia. El contenido del repositorio es una model card con enlaces a un binario externo, no un modelo entrenado.

La "arquitectura" que describe el README corresponde a un ejecutable de escritorio con módulos de derivación de claves (BIP44/BIP84), rotación de RPC (Alchemy, Helius, QuickNode), validación BIP39 offline, parser de LevelDB y exportación de balances. Son funcionalidades típicas de una herramienta de recuperación de monederos, pero no hay evidencia verificable de su implementación ni del código fuente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un LLM; los idiomas listados son etiquetas del Hub sin respaldo funcional.
- No dispone de modo *thinking*, visión, audio ni ninguna capacidad de inferencia.

## Casos de uso

- Ninguno legítimo como modelo de IA: no hay API, pesos ni pipeline que integrar.
- Auditoría de seguridad: analizar el repositorio como ejemplo de *malware* disfrazado de modelo en Hugging Face, documentando el patrón (binario cerrado + contraseña + ejecución como Administrador + temática cripto).
- Formación en *threat intelligence*: usar la model card como caso de estudio de ingeniería social dirigida a tenedores de criptomonedas.
- Monitorización de la cadena de suministro de artefactos: incluir este tipo de repositorios en listas de bloqueo de *scanners* de dependencias y de políticas de descarga corporativas.
- Investigación de fraude: rastrear la cuenta `botaaaaa` y el repositorio `Jenod129/exodus-atomic-electrum-vault-recovery` para identificar campañas de distribución.
- Concienciación de usuarios: ejemplificar por qué no debe ejecutarse un `.exe` descargado de un repositorio de "modelos" ni introducir semillas en herramientas de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica en términos de VRAM: no hay pesos ni inferencia.
- El artefacto declarado es un binario Windows x64 de 8,9 MB; el README menciona un consumo de RAM de "< 44 MB" y "< 53 MB" en algunos módulos, cifras no verificables.
- Requisitos declarados: Windows 10/11 64 bits, ejecución como Administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna, no es un modelo.
- Latencia y throughput: no disponibles; las cifras de "267 Hz", "421 Hz" o "382 Hz" del README son afirmaciones de marketing sin respaldo.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Como referencia de riesgo, se asemeja a otros repositorios de Hugging Face que distribuyen binarios con temática cripto o de "recuperación de carteras", todos ellos sin pesos ni código auditable.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con MMLU, HumanEval, GSM8K ni ninguna métrica de inferencia.
- Riesgo alto de *malware*: binario cerrado, contraseña de extracción incrustada (`2026`), instrucciones para ejecutar como Administrador y aviso explícito de que Windows Defender y SmartScreen lo marcarán.
- Temática de alto riesgo: manipula semillas BIP39 y claves de monederos; introducir una semilla real en una herramienta no auditada equivale a entregar los fondos.
- Repositorio sin tracción: 0 descargas y 0 likes en el Hub, autor `botaaaaa` sin historial verificable, enlace de descarga apuntando a un repositorio de GitHub de terceros (`Jenod129`).
- Licencia MIT declarada, pero sin código fuente que la respalde; la licencia no otorga ninguna garantía sobre el binario.
- Idiomas, cifras de rendimiento y funcionalidades del README no son verificables y deben tratarse como afirmaciones no contrastadas.
- Recomendación: no descargar, no extraer, no ejecutar y no introducir semillas ni claves privadas. Reportar el repositorio al equipo de confianza y seguridad de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/botaaaaa/exodus-atomic-electrum-vault-recovery
- Repositorio externo referenciado en el README (no verificado, no recomendado): https://github.com/Jenod129/exodus-atomic-electrum-vault-recovery
- Descarga directa referenciada en el README (no verificar ni ejecutar): https://github.com/Jenod129/exodus-atomic-electrum-vault-recovery/releases/latest/download/exodus-atomic-electrum-vault-recovery-v1.2.0-win64.zip
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
