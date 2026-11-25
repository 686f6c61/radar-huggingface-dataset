# leontheagent/birdeye-solana-whale-tracker-bot

## Resumen

`leontheagent/birdeye-solana-whale-tracker-bot` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de la model card de un supuesto ejecutable para Windows (denominado "Birdeye Solana Whale Tracker Bot", versión `v1.2.0-win64`, build `v4.6.7`) distribuido como archivo ZIP de 8,9 MB protegido con contraseña. No hay pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia de ningún tipo.

El contenido de la model card describe funcionalidades de un bot de trading de criptomonedas en la red Solana: enrutamiento de órdenes con latencia inferior a 40 ms, streaming de transacciones por WebSocket y gRPC, firma local de claves con AES-256, filtros anti-honeypot, motor de bundles Jito/MEV y un entorno de simulación (paper trading). Todos estos datos provienen exclusivamente del texto del README y no están verificados por artefactos técnicos en el repositorio.

Desde la perspectiva de evaluación de modelos, este repositorio carece de relevancia: no es un modelo de lenguaje, no publica parámetros, contexto, licencia de pesos ni benchmarks. La licencia declarada es MIT, pero se aplica al repositorio, no a un modelo. Se documenta aquí únicamente para dejar constancia de que no constituye un modelo evaluable y de los riesgos asociados a su distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que documentar. El repositorio no incluye ficheros de pesos (`safetensors`, `GGUF`, `bin` ni equivalentes), ni scripts de entrenamiento, ni datasets. La model card describe un binario Windows de 8,9 MB con módulos nativos x64, lo que es incompatible con cualquier modelo de lenguaje actual (incluso los más pequeños superan ampliamente ese tamaño en pesos).

Las "características" enumeradas en el README (enrutamiento sub-40 ms, polling a 355 Hz y 427 Hz, vault AES-256 local, motor de bundles Jito/MEV) son afirmaciones de marketing sin respaldo técnico verificable en el repositorio: no hay código fuente, tests, releases enlazadas dentro de Hugging Face ni artefactos reproducibles.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas (14 idiomas) se refieren únicamente a los metadatos de la model card, no a un modelo subyacente.
- Las funcionalidades descritas (trading en Solana, filtros anti-honeypot, paper trading) corresponden a un supuesto software de escritorio, no a un modelo.

## Casos de uso

- No aplica: al no ser un modelo de IA, no existen casos de uso de inferencia, generación, razonamiento ni despliegue como LLM.
- Evaluación de seguridad de la cadena de suministro: el repositorio puede usarse como caso de estudio de model cards fraudulentas o de phishing (ejecutables con contraseña en ZIP, enlaces a repositorios de GitHub de terceros no verificados).
- Auditoría de metadatos en Hugging Face: sirve para ilustrar cómo se cuelan artefactos que no son modelos en el Hub y cómo detectarlos (ausencia de pipeline, de pesos y de benchmarks).
- Formación en detección de malware: el patrón (ZIP con contraseña + `run as Administrator` + enlace externo) es un indicador clásico que puede usarse en materiales de concienciación.
- Investigación sobre spam en el Hub: útil para estudiar la proliferación de repositorios señuelo en categorías de criptomonedas.
- No se recomienda su descarga ni ejecución en entornos de producción bajo ninguna circunstancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye cifras de rendimiento del supuesto binario (sub-40 ms de enrutamiento, 355 Hz de polling, 97,1 % de consistencia, menos de 22 MB de RAM), pero no son benchmarks de un modelo de IA ni son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay modelo que inferir).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del binario según el README: Windows 10/11 de 64 bits, 8,9 MB de espacio en disco para el ZIP, contraseña de extracción `2026`, ejecución como administrador. Estos requisitos no han sido verificados y no se recomienda cumplirlos.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el repositorio no contiene un modelo de IA. Frente a cualquier LLM open source (por ejemplo, familias Llama, Qwen o Mistral), la diferencia es categórica: aquellos publican pesos, tokenizador, arquitectura y benchmarks; este repositorio no publica ninguno de esos artefactos.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- Riesgo de seguridad alto: distribución de un ejecutable `.exe` dentro de un ZIP protegido con contraseña, con instrucciones de ejecutarlo como administrador. Este patrón es habitual en campañas de malware.
- Los enlaces de descarga apuntan a un repositorio de GitHub de un tercero (`MariviPa23/...`), no verificado ni vinculado al autor del repositorio en Hugging Face.
- Las afirmaciones de rendimiento (sub-40 ms, 355 Hz, 97,1 %) no tienen respaldo técnico ni código fuente verificable.
- La licencia MIT declarada no otorga ninguna garantía sobre el binario distribuido ni sobre su origen.
- Posible suplantación de marca: el nombre hace referencia a "Birdeye", un servicio comercial de datos de Solana, sin que conste relación con el proyecto.
- No usar en producción, ni en máquinas con claves de wallets, ni en entornos con acceso a red corporativa.
- Sesgos y alucinación: no aplica al no ser un modelo; el riesgo equivalente es la desinformación deliberada de la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/leontheagent/birdeye-solana-whale-tracker-bot
- Repositorio de GitHub referenciado en el README (no verificado): https://github.com/MariviPa23/birdeye-solana-whale-tracker-bot
- Releases referenciadas en el README (no verificado): https://github.com/MariviPa23/birdeye-solana-whale-tracker-bot/releases/latest
- Paper, blog o demo oficiales: no disponible
