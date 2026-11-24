# SkysOnFire/shuriken-solana-evm-sniper-bot

## Resumen

El repositorio identificado como `SkysOnFire/shuriken-solana-evm-sniper-bot` no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 distribuido como archivo ZIP (`fisch-script-auto-catch-macro-v1.2.2-win64.zip`, 4,8 MB) que se presenta como un bot de trading automatizado para redes Solana y EVM. El autor lo publica bajo licencia MIT en Hugging Face, pero el contenido es un binario `.exe` con etiquetas de plataforma (`windows`, `windows-11`, `x64`, `portable`) en lugar de pesos de modelo, tokenizador o configuración de inferencia.

Desde el punto de vista de un evaluador de modelos, la ficha carece de los elementos mínimos para considerarlo un modelo: no hay arquitectura, no hay parámetros, no hay contexto, no hay pipeline declarado. Las etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) parecen referirse a la interfaz del ejecutable, no a capacidades lingüísticas de un modelo.

La relevancia técnica es baja y el riesgo de seguridad es alto: la model card incluye instrucciones para descargar un ZIP desde un repositorio de GitHub de terceros, extraerlo con una contraseña (`2026`) y ejecutar un `.exe` como administrador. Este patrón es habitual en campañas de distribución de malware disfrazado de herramientas de trading. Se recomienda no ejecutar el binario y tratar el repositorio como no apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio, no del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal, ni datos de entrenamiento, ni proceso de alineación (RLHF/DPO) documentado. El repositorio describe un binario con módulos funcionales de trading: enrutamiento de órdenes con latencia declarada inferior a 40 ms, motor de bundles Jito/MEV, filtro pre-compra de honeypots, bóveda local AES-256, bundler de 20 wallets con Lookup Tables y take-profit multinivel. Estas cifras provienen de la model card del autor y no son verificables.

El paquete se distribuye como `fisch-script-auto-catch-macro-v1.2.2-win64.zip` con contraseña `2026` y un ejecutable `fisch-script-auto-catch-macro-v1.2.2-win64.exe` (build `v1.9.4`, `0A5E476A37`). No se especifica cadena de compilación, firma de código ni verificación de integridad.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de modelo; las etiquetas de idioma apuntan a la interfaz del ejecutable.
- El binario declara funciones de trading automatizado (sniper de tokens, bundles MEV, gestión de wallets), sin evidencia técnica verificable.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA, porque no lo es.
- Evaluación de seguridad: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar si el ejecutable realiza acciones maliciosas.
- Investigación de campañas de distribución: estudiar el patrón de model card con enlaces a repositorios de GitHub de terceros, contraseña de archivo y ejecución como administrador.
- Docencia en ciberseguridad: usar el repositorio como ejemplo de ingeniería social en plataformas de modelos.
- Auditoría de cadena de suministro: comprobar cómo Hugging Face permite publicar artefactos que no son modelos bajo etiquetas de modelo.
- No se recomienda su uso para trading real, automatización financiera ni despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de la model card (sub-40 ms de enrutamiento, 98,9 % de consistencia, 128 Hz y 174 Hz de polling, menos de 54 MB de RAM) son afirmaciones del autor sin metodología ni reproducibilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10/11 de 64 bits.
- Opciones de despliegue: ejecución nativa del `.exe` en Windows x64; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no verificables.

## Comparativa con modelos similares

| Criterio | shuriken-solana-evm-sniper-bot | Modelo de lenguaje open source (categoría general) | Modelo de trading open source (categoría general) |
|---|---|---|---|
| Tipo de artefacto | Ejecutable Windows x64 | Pesos safetensors/GGUF | Código fuente (Python/Rust) |
| Parámetros | no disponible | Millones a miles de millones | no aplica |
| Contexto | no disponible | Miles a millones de tokens | no aplica |
| Licencia | MIT | Variables (Apache-2.0, MIT, etc.) | Variables |
| Verificabilidad | Baja (binario cerrado) | Alta (pesos auditables) | Alta (código auditable) |
| Riesgo de seguridad | Alto | Bajo-medio | Medio |

No se dispone de comparaciones directas con otros repositorios del mismo autor o de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como tal ni incluirse en comparativas de LLM.
- El binario se distribuye con contraseña de archivo y se solicita ejecución como administrador, patrón asociado a malware.
- El enlace de descarga apunta a un repositorio de GitHub de terceros (`ekaterina96522/fisch-script-auto-catch-macro`), no al repositorio de Hugging Face.
- No hay firma de código, hash publicado ni auditoría de seguridad.
- Riesgo de robo de claves: la model card menciona una "bóveda local AES-256" sin especificar el manejo de secretos.
- Riesgo financiero: un bot de trading sin auditoría puede ejecutar operaciones no deseadas o perder fondos.
- Licencia MIT declarada, pero sin archivo LICENSE verificable en el repositorio.
- Cero descargas y cero likes en el momento de la consulta, lo que sugiere baja adopción y ausencia de revisión comunitaria.
- No usar en producción ni en entornos con acceso a wallets reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SkysOnFire/shuriken-solana-evm-sniper-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/ekaterina96522/fisch-script-auto-catch-macro
- Repositorio de GitHub alternativo referenciado: https://github.com/AlessiaPolyakov/shuriken-solana-evm-sniper-bot
- Enlace de descarga del ZIP (no recomendado): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
