# AdrienMiguet/profanity2-evm-solana-vanity-gen

## Resumen

La entrada `AdrienMiguet/profanity2-evm-solana-vanity-gen` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que empaqueta un supuesto ejecutable para Windows (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB protegido con la contraseña `2026`) presentado como generador de direcciones "vanity" para EVM y Solana. No hay pesos, tokenizador, configuración de arquitectura ni tarjeta de modelo técnica: la model card es material promocional de una supuesta aplicación de escritorio.

El repositorio mezcla etiquetas de idioma (14 idiomas) y de plataforma (windows, windows-11, x64, portable) con terminología de trading de criptomonedas: filtros "honeypot", enrutado de órdenes en menos de 40 ms, copytrade de "smart money", bundles de Jito/MEV y take profit multinivel. Es decir, el contenido describe un bot de trading con supuestas capacidades de generación de direcciones, no un modelo de lenguaje.

Desde la perspectiva de evaluación de modelos de IA open source, esta ficha debe leerse como una advertencia: no existe ningún artefacto de IA que evaluar, el repositorio tiene 0 descargas y 0 likes, y el patrón (ZIP con contraseña, enlace a un repositorio de GitHub ajeno, ejecutable que pide permisos de administrador) coincide con técnicas habituales de distribución de software malicioso. No se recomienda su descarga ni ejecución en ningún entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe una aplicación de escritorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de inferencia que documentar. La model card describe, en su lugar, componentes de una aplicación Windows: "pre-buy honeypot filter" con una consistencia declarada del 98,5 %, enrutado de órdenes por debajo de 40 ms con streaming WebSocket y gRPC, almacén local de claves AES-256, copytrade de wallets, take profit multinivel con sondeo a 365 Hz y un motor de bundles Jito/MEV con 16 hilos de trabajo. Ninguna de estas cifras viene respaldada por documentación técnica, código fuente auditable ni resultados reproducibles.

El nombre del repositorio remite a "Profanity2", una herramienta conocida de generación de direcciones Ethereum vanity, pero el contenido publicado no incluye binarios compilables desde fuente, ni instrucciones de compilación, ni verificación de integridad criptográfica de los artefactos. La build declarada (`v3.8.8`, firma `587DF58272`) y el manifiesto TOML incluido no permiten trazar el origen del ejecutable.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El repositorio lista 14 idiomas en sus etiquetas, pero no hay evidencia de capacidades multilingües reales (no hay modelo detrás).
- Las únicas "capacidades" descritas son funcionalidades de un supuesto bot de trading: filtro de honeypots, enrutado de órdenes de baja latencia, almacén local de claves, copytrade, take profit multinivel y bundles MEV.
- No se documenta ningún modo de razonamiento (thinking mode), ventana de contexto ni mecanismo de atención.

## Casos de uso

No procede proponer casos de uso de IA para este repositorio, porque no contiene un modelo. Los escenarios que la model card sugiere son los siguientes, y se listan únicamente para contextualizar el contenido, no como recomendación:

- Generación de direcciones vanity para EVM y Solana: según el título, el ejecutable buscaría claves públicas con prefijos o sufijos personalizados; no hay código ni binario verificable que lo demuestre.
- Filtrado de tokens honeypot antes de comprar: la model card menciona verificación de autoridades de mint/freeze y bloqueo de liquidez, sin especificar fuentes de datos ni metodología.
- Enrutado de órdenes de baja latencia: se declaran menos de 40 ms mediante streaming WebSocket y gRPC, una cifra no verificable sin acceso al binario.
- Copytrade de wallets de "smart money": se describe el espejo de posiciones de wallets mayoristas con dimensionamiento proporcional, sin detallar el mecanismo de descubrimiento de wallets.
- Gestión automatizada de salidas: take profit multinivel con trailing stop y sondeo a 365 Hz, sin especificar el exchange ni el modelo de comisiones.
- Inclusión atómica de transacciones vía bundles Jito/MEV: se menciona dimensionamiento dinámico de propinas, sin documentar la red ni el validador objetivo.

En todos los casos, la recomendación técnica es no ejecutar el artefacto: no hay firma de código, el ZIP requiere contraseña para eludir análisis automatizados, el enlace de descarga apunta a un repositorio de GitHub de terceros (`JoaoSchaefer973/rob-run-cheat-mod-menu-2026`) y se solicita ejecución como administrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque no hay modelo. Las cifras que aparecen en la model card (98,5 % de consistencia en el filtro de honeypots, 99,2 % en el almacén de claves, 99 % de "rating verificado", 365 Hz de sondeo, menos de 45 MB de RAM) son afirmaciones de marketing sin metodología de medición ni conjunto de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Plataforma declarada del artefacto: Windows 10 y Windows 11 de 64 bits, con un ZIP de 4,8 MB y un ejecutable que requiere permisos de administrador.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" a la que comparar este repositorio. Si se compara como herramienta de generación de direcciones vanity, los equivalentes serían utilidades de código abierto como `profanity` o `vanitygen`, pero este repositorio no publica código fuente ni binarios verificables que permitan una comparación técnica honesta.

| Criterio | Este repositorio | Herramienta vanity de código abierto típica |
|---|---|---|
| Código fuente auditable | No publicado | Sí, en repositorios públicos |
| Binarios reproducibles | ZIP con contraseña, sin firma | Compilación desde fuente |
| Modelo de IA incluido | No | No aplica |
| Licencia | MIT (declarada) | Variable (MIT, GPL, etc.) |
| Trazabilidad del artefacto | Baja (enlaces a repos de terceros) | Alta |

## Limitaciones y advertencias

- No es un modelo de IA: no hay pesos, tokenizador, arquitectura ni contexto que evaluar. Cualquier ficha que lo trate como modelo de lenguaje sería incorrecta.
- Riesgo de seguridad alto: el patrón de ZIP protegido con contraseña, ejecutable que solicita permisos de administrador, enlace de descarga alojado en un repositorio de GitHub de terceros y ausencia de firma de código es característico de campañas de distribución de malware.
- Riesgo de alucinación no aplica en el sentido habitual, pero las afirmaciones de rendimiento de la model card (porcentajes de consistencia, latencias, ratings) no están respaldadas por ninguna evidencia y deben tratarse como no fiables.
- La licencia MIT declarada en los metadatos no cubre necesariamente el binario distribuido; sin código fuente no es posible verificar la cadena de custodia ni la ausencia de código malicioso.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día (24 de noviembre de 2026), lo que sugiere una publicación automatizada o de corta vida.
- Uso comercial: aunque la licencia MIT lo permitiría en teoría, la falta de auditoría y la naturaleza del artefacto desaconsejan cualquier uso en producción, y menos aún en entornos que manejen claves privadas o fondos.
- Advertencia específica para criptomonedas: ejecutar software no verificado que afirma gestionar claves AES-256 y firmar transacciones locales expone directamente los fondos del usuario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AdrienMiguet/profanity2-evm-solana-vanity-gen
- Repositorio de GitHub citado en la model card (descarga del ZIP): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026
- Repositorio de GitHub citado como "latest release": https://github.com/Flores550/profanity2-evm-solana-vanity-gen
- No se han encontrado en la información proporcionada papers, blogs técnicos, demos ni documentación adicional del supuesto modelo.
