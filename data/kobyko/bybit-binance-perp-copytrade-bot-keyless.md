# Kobyko/bybit-binance-perp-copytrade-bot-keyless

## Resumen

El artefacto publicado bajo el identificador `Kobyko/bybit-binance-perp-copytrade-bot-keyless` no es un modelo de inteligencia artificial, sino un supuesto ejecutable portable para Windows x64 presentado como bot de copytrading de perpetuos entre Bybit y Binance. La model card describe un binario de 8,9 MB (`bybit-binance-perp-copytrade-bot-keyless-v1.2.0-win64.exe`, build `v1.4.7`) distribuido en un ZIP protegido con contraseña y alojado en un repositorio de GitHub de terceros, no en el propio Hub. No existe información sobre arquitectura de red neuronal, pesos, tokenizador ni proceso de entrenamiento.

El repositorio acumula 0 descargas y 0 likes en Hugging Face, y su fecha de creación (2026-11-24) es posterior a la fecha actual, lo que constituye una señal adicional de inconsistencia. La licencia declarada es MIT, pero el contenido distribuido no es código fuente verificable ni pesos de modelo.

Desde la perspectiva de evaluación de modelos, esta ficha no puede completarse con datos técnicos reales: no hay parámetros, contexto, cuantizaciones ni benchmarks. El material disponible corresponde a una página de descarga de software con marcadores de rendimiento no verificables (186 Hz de sondeo, enrutamiento de órdenes en menos de 40 ms, password `2026` para el archivo comprimido), y presenta patrones habituales de distribución de software potencialmente malicioso: binario opaco, ejecución como administrador, contraseña en el archivo y alojamiento externo al Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del Hub) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` de 8,9 MB) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo. La model card menciona componentes propios de un bot de trading: un motor de bundles tipo Jito/MEV con tip dinámico, un sistema de take profit multinivel con trailing stop, un sandbox de paper trading, enrutamiento de órdenes por WebSocket y gRPC, copia de wallets de smart money y un bundler de 20 wallets mediante Lookup Tables. Son funcionalidades de software de ejecución de órdenes, no capas de una red neuronal.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni innovaciones de modelado. Tampoco se aporta código fuente, hash del binario ni firma digital que permita auditar el ejecutable.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling en el sentido de modelos de lenguaje.
- No se declara soporte de agentes ni razonamiento multi-paso.
- La model card atribuye al binario funciones de trading: copia de wallets, ejecución multi-wallet, paper trading y gestión de take profit.
- El multilingüismo declarado en los metadatos del Hub (14 idiomas) no está respaldado por ninguna descripción de capacidad lingüística del artefacto.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no se han documentado casos de uso verificables.
- Evaluación de modelos: no aplicable, al no existir pesos ni arquitectura que medir.
- Integración en pipelines de IA: no aplicable.
- Análisis de seguridad: el artefacto podría estudiarse como ejemplo de distribución de software opaco con contraseña y ejecución como administrador, pero no como modelo.
- Trading automatizado: la model card sugiere su uso para copytrading de perpetuos, pero no hay evidencia independiente de que el binario funcione ni de que sea seguro.
- Investigación de malware: los patrones descritos (ZIP con contraseña, binario sin firma, enlace externo, ejecución como administrador) son candidatos razonables para análisis en un entorno aislado, nunca en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos de la model card son afirmaciones de rendimiento del software (186 Hz de polling, menos de 40 ms de enrutamiento, menos de 8 ms de respuesta en take profit) sin metodología, hardware de referencia ni reproducibilidad.

## Requisitos de hardware

- VRAM estimada: no aplicable (no es un modelo de IA).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Plataforma declarada: Windows 10/11 de 64 bits, ejecución como administrador.
- Opciones de despliegue: no aplicable (no hay integración con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque el artefacto no es un modelo de lenguaje ni un modelo multimodal. Cualquier comparación con modelos de IA sería engañosa.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA: carece de pesos, arquitectura y tokenizador.
- La model card incluye afirmaciones no verificables (312K descargas, valoración 5.0/5) que no coinciden con los metadatos del Hub (0 descargas, 0 likes).
- Distribución mediante ZIP protegido con contraseña (`2026`) y ejecución como administrador: patrón de riesgo elevado.
- El binario se aloja en un repositorio de GitHub de un tercero (`gAguilar94827`), no en el Hub, lo que impide verificar integridad.
- No hay código fuente, hash ni firma digital que permita auditar el ejecutable.
- La licencia MIT declarada no garantiza la seguridad ni la legalidad del software distribuido.
- Riesgo de fraude, robo de credenciales de exchanges o pérdida de fondos si se ejecuta en un entorno con acceso a APIs de trading.
- La fecha de creación (2026-11-24) es posterior a la actual, lo que sugiere metadatos inconsistentes o generados automáticamente.
- No debe desplegarse en producción ni en máquinas con credenciales reales.

## Enlaces

- Hugging Face: https://huggingface.co/Kobyko/bybit-binance-perp-copytrade-bot-keyless
- Repositorio de GitHub citado en la model card: https://github.com/gAguilar94827/bybit-binance-perp-copytrade-bot-keyless
- Releases citadas: https://github.com/gAguilar94827/bybit-binance-perp-copytrade-bot-keyless/releases/latest
- Descarga directa citada (ZIP, contraseña `2026`): https://github.com/gAguilar94827/bybit-binance-perp-copytrade-bot-keyless/releases/latest/download/bybit-binance-perp-copytrade-bot-keyless-v1.2.0-win64.zip
- Paper, blog o demo: no disponible
