# Kobyko/trust-wallet-metamask-seed-recovery-v2

## Resumen

`Kobyko/trust-wallet-metamask-seed-recovery-v2` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que distribuye un supuesto ejecutable portable para Windows (x64), empaquetado en un archivo ZIP protegido con contraseña, y que se presenta como una herramienta de "recuperación de semillas" de monederos Trust Wallet y MetaMask. El repositorio no contiene pesos de modelo, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje.

La model card describe funcionalidades como parseo de keystores LevelDB, auditoría de tokens ERC20/SPL, resolución de mnemónicos parciales y rotación de RPC, además de instrucciones para descargar un binario desde un repositorio de GitHub de terceros y ejecutarlo como administrador. No se proporciona información sobre arquitectura, parámetros, contexto ni datos de entrenamiento, porque no existe tal modelo.

Desde el punto de vista de evaluación técnica, el artefacto presenta los patrones típicos de una distribución de malware: binario alojado fuera de Hugging Face, archivo comprimido con contraseña para evadir análisis automatizados, instrucciones para desactivar alertas de Windows Defender y SmartScreen, y una temática (recuperación de frases semilla) que apunta directamente a la sustracción de claves criptográficas. No debe descargarse ni ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card no menciona transformer, MoE, SSM ni ningún otro paradigma; tampoco indica número de tokens, composición de dataset, RLHF, DPO ni innovaciones técnicas de modelado.

El contenido técnico descrito en la model card corresponde a supuestas funcionalidades de una aplicación de escritorio: parser de LevelDB, motor SIMD multinúcleo con hashing PBKDF2, rotación de endpoints RPC y "solucionador de mnemónicos parciales". Estas descripciones no van acompañadas de código fuente, papers, artefactos verificables ni resultados reproducibles. El repositorio de GitHub referenciado (`Hakansson210/trust-wallet-metamask-seed-recovery-v2`) no forma parte de la información proporcionada y no se ha verificado.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No dispone de soporte de tool calling ni function calling en el sentido de un modelo de IA.
- No implementa agentes ni razonamiento multi-paso.
- Las etiquetas multilingües del repositorio (14 idiomas) no implican capacidad lingüística del artefacto; probablemente describen la localización de la página de distribución.
- La model card atribuye al ejecutable capacidades de "recuperación de semillas", auditoría de saldos y reconstrucción de mnemónicos parciales, sin evidencia técnica verificable.

## Casos de uso

- No procede. Este repositorio no contiene un modelo de IA y no tiene casos de uso legítimos como modelo.
- Cualquier escenario que implique ejecutar el binario distribuido (por ejemplo, "recuperar una frase semilla perdida" o "auditar saldos de un monedero") debe descartarse: introducir una frase semilla en una herramienta de origen desconocido equivale a entregar el control total de los fondos a un tercero.
- Un uso aceptable del repositorio sería únicamente como muestra documental para formación en ciberseguridad, análisis de campañas de malware o concienciación sobre ingeniería social en el ecosistema cripto, siempre sin ejecutar el binario y en un entorno aislado.
- Para recuperación legítima de un monedero, la vía correcta es el soporte oficial del fabricante (Trust Wallet, MetaMask) o la restauración desde la propia frase semilla en una instalación oficial verificada.
- Para auditoría de saldos on-chain, existen exploradores públicos (Etherscan, Solscan) y APIs oficiales de nodos RPC, sin necesidad de ejecutables de terceros.
- Para análisis de seguridad de artefactos sospechosos, se recomienda usar entornos de sandbox (por ejemplo, máquinas virtuales desechables, servicios de análisis dinámico) y nunca un equipo con acceso a monederos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- El artefacto declarado es un ejecutable para Windows 10/11 de 64 bits, con un tamaño de paquete de 8,9 MB y, según la model card, un consumo de RAM inferior a 28 MB. Estos datos no son verificables y no deben tomarse como referencia de seguridad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Como referencia de categoría, los artefactos de esta naturaleza (ejecutables empaquetados con contraseña, distribuidos fuera de los canales oficiales y orientados a la extracción de frases semilla) se clasifican habitualmente como software malicioso o *scam*, no como herramientas de software legítimo.

## Limitaciones y advertencias

- No es un modelo de IA: carece de arquitectura, pesos, tokenizador y cualquier capacidad de inferencia.
- Riesgo de seguridad grave: la distribución solicita descargar un binario desde un repositorio de GitHub de terceros, extraerlo con contraseña y ejecutarlo como administrador. Este patrón es característico de campañas de malware.
- La contraseña del ZIP (`2026`) y las instrucciones para sortear Windows Defender y SmartScreen son señales claras de evasión de controles de seguridad.
- La temática de "recuperación de semillas" es un vector clásico de robo de criptomonedas: quien obtiene la frase semilla de un monedero controla todos sus fondos de forma irreversible.
- Cero descargas y cero "likes" en el momento de la consulta, sin historial de mantenimiento verificable.
- La licencia MIT declarada no otorga ninguna garantía sobre el comportamiento del binario ni sobre su legalidad en la jurisdicción del usuario.
- No debe ejecutarse en ningún equipo con acceso a monederos, credenciales o datos sensibles.
- No se ha verificado la identidad del autor (`Kobyko`) ni su relación con Trust Wallet o MetaMask; ninguna de las dos compañías está afiliada a este repositorio según la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/trust-wallet-metamask-seed-recovery-v2
- Repositorio de GitHub referenciado en la model card: https://github.com/Hakansson210/trust-wallet-metamask-seed-recovery-v2
- Descarga directa citada en la model card (no recomendada): https://github.com/Hakansson210/trust-wallet-metamask-seed-recovery-v2/releases/latest/download/trust-wallet-metamask-seed-recovery-v2-v1.2.0-win64.zip
- Trust Wallet (sitio oficial): https://trustwallet.com
- MetaMask (sitio oficial): https://metamask.io
