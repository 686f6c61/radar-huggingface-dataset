# shayan99163/bybit-binance-perp-copytrade-bot

## Resumen

El repositorio `shayan99163/bybit-binance-perp-copytrade-bot` no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows presentado como "bot de copytrading de perpetuos" entre Bybit y Binance. La model card publicada no describe ninguna arquitectura neuronal, pesos, tokenizador ni proceso de entrenamiento: se limita a instrucciones de descarga de un archivo `.zip` de 4,8 MB y un `.exe` con contraseña de descompresión. Por tanto, no existe información técnica de modelo que evaluar.

El contenido de la model card es altamente sospechoso desde el punto de vista de seguridad. El nombre del ejecutable (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`) no guarda relación con el supuesto bot de trading, los enlaces de descarga apuntan a repositorios de terceros distintos del propietario declarado, y se solicita ejecutar el binario como administrador. Este patrón es característico de campañas de distribución de malware disfrazado de herramienta financiera o de trucos para videojuegos.

Esta ficha se redacta por completitud editorial, pero debe interpretarse como una advertencia: no hay modelo, no hay benchmarks, no hay licencia verificable en la práctica y el artefacto distribuido no es auditable. No se recomienda su descarga ni ejecución en ningún entorno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no verificable en el artefacto) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` de 4,8 MB) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, dataset, proceso de preentrenamiento, ajuste supervisado ni RLHF/DPO. El repositorio no contiene pesos en safetensors, GGUF ni ningún otro formato de modelo. El único artefacto mencionado es un ejecutable de Windows comprimido con contraseña, sin trazabilidad de compilación ni firma de código verificable.

La model card mezcla terminología de trading (perpetuos, copytrading, take profit, honeypot filter) con referencias a un supuesto "trainer mod" de Monster Hunter Wilds, lo que sugiere una plantilla reutilizada de otro tipo de distribución. No hay información sobre metodología de entrenamiento porque no existe tal entrenamiento.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos no son verificables en el artefacto.
- Las supuestas funciones de trading (paper trading, filtro honeypot, take profit multinivel, enrutamiento de órdenes) no están documentadas con código fuente ni auditadas.

## Casos de uso

- No se identifican casos de uso legítimos verificables para este artefacto en el contexto de IA open source.
- Ejecución en estación de trabajo Windows: desaconsejada; el binario se distribuye con contraseña y solicita privilegios de administrador sin justificación técnica.
- Integración en pipelines de trading real: desaconsejada; no hay código fuente, auditoría ni reputación del publicador.
- Evaluación como modelo de lenguaje: imposible; no contiene pesos ni tokenizador.
- Investigación académica: sin utilidad; no hay arquitectura ni datos que estudiar.
- Despliegue en producción: prohibido por criterio de seguridad; el patrón de distribución coincide con malware habitual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de "< 29 ms", "< 8 ms" y "< 11 ms" de la model card no son verificables ni corresponden a inferencia de modelo.
- Plataforma declarada del artefacto: Windows 10/11 de 64 bits.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shayan99163/bybit-binance-perp-copytrade-bot` | Binario Windows, no modelo de IA | no disponible | no disponible | MIT declarada | Repo HF con 0 descargas |
| Modelos de lenguaje open source (p. ej. familias Llama, Qwen, Mistral) | Transformer / MoE | 1B–400B+ | 4K–1M | licencias abiertas variables | Pesos en safetensors/GGUF auditables |
| Herramientas de trading open source (p. ej. Freqtrade, Hummingbot) | Software, no modelo | no aplica | no aplica | GPL/MIT según proyecto | Código fuente auditable en GitHub |

La comparación con modelos de IA no es pertinente porque el artefacto no es un modelo. Frente a herramientas de trading open source, la diferencia crítica es la ausencia de código fuente auditable y la distribución de un binario con contraseña.

## Limitaciones y advertencias

- No es un modelo de IA: no dispone de arquitectura, pesos, tokenizador ni dataset.
- El ejecutable solicitado (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`) no coincide con el nombre del supuesto bot, lo que indica plantilla reutilizada o suplantación.
- Los enlaces de descarga apuntan a repositorios de terceros (`martina1713/...`, `rogers77795/...`) distintos del propietario del repo en Hugging Face.
- Se solicita ejecutar el binario como administrador y descomprimirlo con contraseña fija (`2026`), patrón típico de evasión de análisis antivirus.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- La licencia MIT declarada no otorga garantías sobre el binario distribuido; el contenido real del `.exe` no es verificable.
- Riesgo elevado de malware, robo de credenciales o fraude financiero si se ejecuta.
- No apto para producción, ni para trading real, ni para entornos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shayan99163/bybit-binance-perp-copytrade-bot
- Enlace de descarga citado en la model card (tercero, no verificado): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Repositorio de terceros citado en la model card: https://github.com/rogers77795/bybit-binance-perp-copytrade-bot
- Paper, blog, demo o documentación técnica: no disponible.
