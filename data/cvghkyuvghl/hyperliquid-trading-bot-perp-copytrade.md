# cvghkyuvghl/hyperliquid-trading-bot-perp-copytrade

## Resumen

El repositorio `cvghkyuvghl/hyperliquid-trading-bot-perp-copytrade` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como ejecutable portable para Windows x64 (`delta-executor-pc-2026-v1.2.2-win64.zip`, 4,8 MB) que se presenta bajo la etiqueta de "Hyperliquid trading bot" pero cuya model card describe en realidad un *roblox executor* con módulos de inyección de scripts (puente Luau VM, attach a procesos, editor Monaco, multi-instancia). No hay pesos, no hay arquitectura neuronal y no hay pipeline declarado.

El artefacto se publica con licencia MIT y metadatos multilingües (14 idiomas), pero su contenido técnico no corresponde a un modelo de lenguaje: la propia FAQ del autor reconoce que el binario es un "independent roblox executor binary" y explica cómo evitar alertas de Windows Defender o SmartScreen. La distribución se realiza mediante un ZIP protegido con contraseña (`2026`) alojado en un repositorio de GitHub de terceros, un patrón habitual en campañas de malware disfrazado de herramienta de trading.

Por tanto, esta ficha documenta lo que el artefacto declara ser y advierte de que no es un modelo de IA evaluable: no existen benchmarks, no hay pesos que cargar con vLLM o llama.cpp y no procede ningún análisis de capacidades cognitivas. Cualquier uso en producción debería descartarse de entrada por riesgo de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución ZIP con ejecutable `.exe`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe subsistemas de un ejecutable de escritorio: "instant client attach" mediante puente Luau VM y attach a procesos, un "script hub" con presets en la nube, un editor Monaco con resaltado multi-pestaña, attach multi-instancia simultáneo, un flujo de ejecución "keyless" con inyección directa de scripts y sincronización de offsets tras parches del cliente (actualizaciones de firma "de los miércoles"). Se mencionan cifras de consumo de memoria (<60 MB y <50 MB según módulo), número de hilos (7 y 12) y latencias (<4 ms y <16 ms), pero son afirmaciones del autor sin verificación independiente.

No hay dataset, no hay tokens de entrenamiento, no hay RLHF ni DPO. La build declarada es `v3.6.7 (0B6CA3)` y el binario principal se denomina `delta-executor-pc-2026-v1.2.2-win64.exe`.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni agentes basados en lenguaje.
- Lo que el autor denomina "capacidades" son funciones de inyección de scripts en un cliente de Roblox (attach a proceso, ejecución de scripts Luau, multi-instancia).
- Los 14 idiomas de los metadatos son etiquetas de la model card, no competencia lingüística verificable.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA: no hay inferencia posible ni API de lenguaje.
- Trading de perpetuos en Hyperliquid: el título sugiere copytrading, pero la model card no documenta ninguna integración con la API de Hyperliquid ni lógica de trading; no hay evidencia de que el binario haga esto.
- Automatización de atención al cliente: no aplica, no hay modelo conversacional.
- Generación de código en producción: no aplica.
- Análisis de documentos o RAG: no aplica.
- Evaluación comparativa de LLM: no aplica.
- Uso educativo o de investigación en IA: no aplica; el artefacto no contiene material formativo sobre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas son afirmaciones del autor sobre el ejecutable (RAM <60 MB, latencias <4 ms y <16 ms, 7 y 12 hilos), no comparables con MMLU, HumanEval, GSM8K ni ninguna otra evaluación de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos ni inferencia neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y 11 de 64 bits, procesadores Intel y AMD x64.
- Opciones de despliegue: ninguna de las habituales (vLLM, llama.cpp, Ollama, TGI) es aplicable; el artefacto se ejecuta como `.exe` portable.
- Latencia y throughput: no disponibles de forma verificable; las cifras de la model card son declaraciones del autor sin medición independiente.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Frente a un LLM open source real (por ejemplo, un modelo de 7B a 70B con pesos safetensors y licencia permisiva), las diferencias son categóricas: aquí no hay parámetros, contexto, benchmarks ni formato de pesos estándar.

## Limitaciones y advertencias

- No es un modelo de IA: la ficha de Hugging Face está mal categorizada y el contenido no se corresponde con la etiqueta de "modelo".
- Riesgo de seguridad alto: distribución de un `.exe` dentro de un ZIP con contraseña, alojado en un repositorio de GitHub de terceros, con instrucciones para ejecutarlo como administrador y para desactivar o sortear avisos de Windows Defender y SmartScreen. Este patrón es característico de malware.
- Suplantación de identidad: la model card menciona un repositorio distinto (`ReneBarnes478/...`) y un enlace de descarga en `dawidb9567/delta-executor-pc-2026`, lo que indica falta de trazabilidad sobre el origen real del binario.
- Discrepancia entre título y contenido: se anuncia como bot de trading de perpetuos en Hyperliquid, pero el texto describe un ejecutor de scripts para Roblox. Cualquiera de las dos cosas es engañosa.
- Licencia MIT declarada, pero irrelevante sin código fuente ni pesos verificables; no hay garantías para uso comercial.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta, sin historial que permita evaluar reputación.
- No usar en producción, ni en entornos con credenciales, claves de exchange o wallets, bajo ningún concepto.

## Enlaces

- Hugging Face: https://huggingface.co/cvghkyuvghl/hyperliquid-trading-bot-perp-copytrade
- Repositorio citado en la model card: https://github.com/ReneBarnes478/hyperliquid-trading-bot-perp-copytrade
- Enlace de descarga citado en la model card: https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Paper, blog, demo o repositorio oficial del modelo: no disponible
