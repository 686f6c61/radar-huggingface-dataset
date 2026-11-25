# buyan0306/okx-agent-trade-kit-mcp-grid-dca-bot

## Resumen

El repositorio `buyan0306/okx-agent-trade-kit-mcp-grid-dca-bot` no contiene un modelo de inteligencia artificial, sino un supuesto kit de herramientas de trading para Windows distribuido a través de Hugging Face. La model card no describe ninguna arquitectura de red neuronal, pesos, tokenizador ni proceso de entrenamiento; en su lugar presenta un ejecutable para Windows 10/11 de 64 bits, un archivo ZIP de 4,8 MB y un binario denominado `marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`.

El contenido de la model card es altamente sospechoso: mezcla la supuesta funcionalidad de trading (grid, DCA, bundles Jito/MEV, copytrade) con referencias a un supuesto cheat para el videojuego Marvel Rivals, enlaces a repositorios de GitHub de terceros no verificados y una contraseña de descompresión (`2026`) típica de campañas de distribución de malware. No se ha publicado ningún dato técnico verificable sobre un modelo de IA.

Por tanto, esta ficha documenta la ausencia de un modelo real y advierte de los riesgos de seguridad. No debe descargarse ni ejecutarse el binario referenciado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, pese a que la model card afirma cifras infladas ("645K+ descargas", "4.9/5"), lo que constituye una inconsistencia adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe un ejecutable Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (se referencia un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No existe información sobre arquitectura de red neuronal, dataset, número de tokens, técnicas de alineación (RLHF/DPO) ni innovaciones de inferencia. La model card describe funcionalidades de un supuesto bot de trading (sandbox de paper-trading, bundler multi-wallet con Lookup Tables, motor de bundles Jito/MEV, copytrade de smart-money, vault AES-256 local, filtro anti-honeypot) con métricas inventadas como "123 Hz", "190 Hz", "202 Hz" de polling o "< 7 ms" de latencia, sin ninguna evidencia técnica que las respalde.

El binario referenciado (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`) no guarda relación con el nombre del repositorio y apunta a un supuesto cheat de videojuego, lo que sugiere que la model card ha sido generada mediante plantilla o reutilizada de un repositorio ajeno. No hay pesos, tokenizador, configuración de modelo ni código de inferencia en la información proporcionada.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se documenta soporte de tool calling ni de function calling en el sentido de un modelo de lenguaje.
- No se documenta razonamiento multi-paso ni comportamiento de agente basado en un LLM.
- El repositorio declara 14 idiomas en sus metadatos, pero no hay evidencia de capacidades multilingües reales al no existir modelo.
- Las "capacidades" descritas en la model card (grid, DCA, bundles MEV, copytrade) corresponden a funcionalidades de software de trading, no a un modelo de IA, y no están verificadas.

## Casos de uso

No procede. Al no existir un modelo de IA, no hay casos de uso legítimos de inferencia. Los escenarios que se podrían plantear son de riesgo:

- Auditoría de seguridad: analizar la model card en un entorno aislado para identificar indicadores de campaña de malware (contraseña de ZIP, enlaces a repositorios de terceros, binario con nombre ajeno al proyecto).
- Formación en detección de phishing: usar este repositorio como ejemplo de model card fraudulenta que suplanta un modelo de IA.
- Investigación de cadena de suministro: rastrear los enlaces de GitHub referenciados (`Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026`, `bettysuzuki/okx-agent-trade-kit-mcp-grid-dca-bot`) para reportarlos si procede.
- Revisión de políticas de Hugging Face: documentar el caso para proponer moderación de repositorios que no contienen modelos.
- Concienciación de desarrolladores: ilustrar por qué no deben ejecutarse binarios de fuentes no verificadas con contraseñas de descompresión.
- Análisis de ingeniería social: estudiar cómo se combinan badges falsos ("645K+ descargas", "4.9/5") con instrucciones de "ejecutar como administrador" para inducir a la víctima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA. Las cifras de "polling" y "latencia" de la model card no son verificables ni corresponden a benchmarks de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- La model card indica únicamente Windows 10/11 de 64 bits (Intel/AMD x64) y un consumo de RAM declarado de "< 35 MB" y "< 51 MB" para dos módulos, cifras no verificadas.
- Latencia y throughput: no disponibles de forma fiable.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA con el que comparar; el repositorio no es equivalente a ningún modelo open source de la categoría de lenguaje, visión o multimodal.

| Criterio | Este repositorio | Modelo de IA típico (referencia genérica) |
|---|---|---|
| Contiene pesos | No | Sí (safetensors, GGUF, etc.) |
| Arquitectura definida | No | Sí (transformer, MoE, SSM, etc.) |
| Benchmarks publicados | No | Habitualmente sí |
| Descargas verificadas | 0 | Variable |
| Riesgo de seguridad | Alto (binario con contraseña y nombre ajeno) | Bajo si procede de fuente oficial |

## Limitaciones y advertencias

- No es un modelo de IA: no puede usarse para inferencia, generación de texto ni ninguna tarea de machine learning.
- Riesgo elevado de malware: la model card instruye a descargar un ZIP de 4,8 MB, extraerlo con contraseña (`2026`) y ejecutar un `.exe` "como administrador". Este patrón es habitual en campañas de distribución de troyanos y stealers.
- Suplantación de identidad: el binario se llama `marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, ajeno al nombre del repositorio, lo que indica reutilización fraudulenta de contenido.
- Enlaces a repositorios de GitHub de terceros no verificados (`Stephaniei047/...`, `bettysuzuki/...`) que pueden alojar artefactos maliciosos.
- Métricas infladas y no contrastadas ("645K+ descargas", "4.9/5") frente a 0 descargas y 0 likes reales en Hugging Face.
- Licencia MIT declarada, pero irrelevante al no existir obra de software legítima verificable; no debe interpretarse como aval de seguridad.
- Posible uso fraudulento del nombre "OKX" y de terminología de trading (grid, DCA, MEV) para atraer a usuarios con expectativas de beneficio económico.
- No debe descargarse, extraerse ni ejecutarse el contenido en ningún sistema, ni siquiera en máquinas virtuales sin aislamiento de red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/buyan0306/okx-agent-trade-kit-mcp-grid-dca-bot
- Enlace de descarga referenciado en la model card (no recomendado, potencialmente malicioso): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de GitHub referenciado (no verificado): https://github.com/bettysuzuki/okx-agent-trade-kit-mcp-grid-dca-bot/releases/latest
- Paper, blog o demo oficial: no disponible.
