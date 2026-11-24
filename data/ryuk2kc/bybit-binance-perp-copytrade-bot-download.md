# Ryuk2kc/bybit-binance-perp-copytrade-bot-download

## Resumen

El repositorio `Ryuk2kc/bybit-binance-perp-copytrade-bot-download` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio de distribución de un supuesto ejecutable para Windows (`bybit-binance-perp-copytrade-bot-download-v1.2.0-win64.exe`) empaquetado en un archivo ZIP de 8,9 MB, presentado como un bot de copytrading de futuros perpetuos para los exchanges Bybit y Binance.

La model card no describe ninguna arquitectura de red neuronal, pesos, tokenizador ni proceso de entrenamiento. El contenido es material promocional de un binario, con instrucciones de descarga, una contraseña de extracción (`2026`) y afirmaciones de rendimiento no verificables (latencia inferior a 40 ms, filtro antihoneypot, motor de bundles Jito/MEV, bóveda de claves AES-256). Los tags incluyen `windows`, `x64`, `portable` y catorce idiomas, pero ninguno corresponde a un pipeline de inferencia.

Desde la perspectiva de evaluación de modelos, este repositorio no es utilizable como modelo de IA: no hay parámetros, contexto, cuantizaciones ni licencia de pesos. La licencia declarada es MIT, aplicable al contenido del repositorio, no a un artefacto de modelo. Se documenta aquí únicamente para dejar constancia de que no constituye un modelo y de los riesgos asociados a su distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, referidos a la documentación del binario) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El artefacto es un binario compilado para Windows de 64 bits, con build declarada `v3.2.5 (EEB054)` y un tamaño de paquete de 8,9 MB. La model card menciona componentes funcionales del programa (filtro previo a la compra, motor de bundles Jito/MEV, sandbox de paper trading, bóveda de claves local AES-256, gestión de take profit por niveles y enrutamiento de órdenes por WebSocket y gRPC), pero no aporta información sobre lenguaje de implementación, dependencias ni proceso de compilación verificable.

No hay datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, porque no se trata de un modelo entrenado. Tampoco se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un modelo de IA.
- No dispone de modo de razonamiento, visión, audio ni capacidades multimodales.
- El binario se presenta como bot de copytrading de futuros perpetuos con supuestas funciones de simulación de estrategias, gestión de claves local y enrutamiento de órdenes; ninguna de estas afirmaciones está verificada ni respaldada por documentación técnica auditable.
- La documentación está redactada en catorce idiomas según los metadatos, aunque el contenido de la model card está mayoritariamente en inglés.

## Casos de uso

- Ninguno recomendado en el contexto de evaluación de modelos de IA: el repositorio no contiene un modelo que pueda integrarse en pipelines de inferencia, RAG, agentes o generación de código.
- Auditoría de seguridad: un equipo puede analizar el binario en un entorno aislado para determinar su comportamiento real antes de cualquier uso, dado que se distribuye mediante un enlace externo a GitHub con contraseña de extracción.
- Documentación de riesgo en catálogos internos: registrar el repositorio como ejemplo de artefacto ajeno a Hugging Face que se hace pasar por recurso descargable, para bloquearlo en políticas de ingesta.
- Formación en higiene de cadena de suministro: usar el caso como ejemplo de binarios sin firma, sin código fuente y con instrucciones de ejecución como administrador.
- No se identifican casos de uso legítimos de trading automatizado que puedan recomendarse a partir de esta información, al no existir verificación independiente del software ni de sus resultados.
- No procede evaluar su idoneidad para atención al cliente, generación de código en producción ni análisis documental, ya que no es un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (latencia inferior a 31 ms, 99,4 % de consistencia, menos de 44 MB de RAM, 408 K descargas) son afirmaciones del autor sin metodología, conjunto de datos ni reproducibilidad asociados, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma objetivo declarada: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: las cifras citadas por el autor (sub-40 ms de enrutamiento de órdenes, menos de 5 ms en el sandbox) no son verificables ni equivalen a métricas de inferencia.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de IA open source típico (referencia genérica) |
|---|---|---|
| Naturaleza del artefacto | Ejecutable Windows en ZIP | Pesos en safetensors/GGUF |
| Parámetros | No disponible | Depende del modelo |
| Contexto | No disponible | Depende del modelo |
| Rendimiento medible | Sin benchmarks verificables | Benchmarks publicados (MMLU, HumanEval, GSM8K) |
| Licencia | MIT (del repositorio) | Licencia del modelo (Apache-2.0, MIT, etc.) |
| Auditabilidad | Baja: binario sin código fuente | Alta: pesos y a menudo código disponibles |

No se identifican modelos comparables de la misma categoría porque el repositorio no pertenece a ninguna categoría de modelo de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en catálogos, leaderboards ni pipelines de evaluación de modelos.
- Distribución de un binario `.exe` sin código fuente, sin firma digital verificable y con instrucciones para ejecutarlo como administrador: riesgo elevado de malware, robo de credenciales o claves de API de exchanges.
- La contraseña de extracción fija (`2026`) y el enlace de descarga alojado en un repositorio de GitHub de terceros impiden verificar la integridad y procedencia del artefacto.
- Las afirmaciones de rendimiento y seguridad (bóveda AES-256, filtro antihoneypot, bundles MEV) no están respaldadas por auditoría independiente alguna.
- Riesgo financiero directo: un bot de trading que opere con claves reales puede provocar pérdidas; la mención a «non-custodial local signing» no garantiza que el binario no exfiltre material criptográfico.
- La licencia MIT declarada cubre el repositorio, no implica garantía alguna sobre el software ni sobre su idoneidad para uso comercial o producción.
- Los metadatos multilingües y los tags de plataforma no deben interpretarse como capacidades del artefacto; son etiquetas de descubrimiento.
- Uso comercial: desaconsejado sin auditoría de seguridad previa y sin revisión legal, dado el carácter no verificable del binario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ryuk2kc/bybit-binance-perp-copytrade-bot-download
- Repositorio de GitHub referenciado en la model card: https://github.com/HannahTakeda47/bybit-binance-perp-copytrade-bot-download
- Enlace de descarga directa citado en la model card: https://github.com/HannahTakeda47/bybit-binance-perp-copytrade-bot-download/releases/latest/download/bybit-binance-perp-copytrade-bot-download-v1.2.0-win64.zip
- Paper, blog, demo o documentación técnica del artefacto: no disponible
