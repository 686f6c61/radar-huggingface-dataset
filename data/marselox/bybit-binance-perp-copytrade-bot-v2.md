# Marselox/bybit-binance-perp-copytrade-bot-v2

## Resumen

La entrada `Marselox/bybit-binance-perp-copytrade-bot-v2` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que aloja la tarjeta promocional de una supuesta aplicación de escritorio para Windows denominada "Bybit Binance Perp Copytrade Bot V2", distribuida como archivo ZIP protegido con contraseña y ejecutable `.exe`. No existe ningún artefacto de pesos, configuración de arquitectura, tokenizador ni pipeline de inferencia asociado al identificador.

El contenido de la model card describe funcionalidades propias de un bot de trading de criptomonedas (enrutamiento de órdenes, filtros anti-honeypot, sandbox de paper trading, copia de carteras de ballenas), no capacidades de un modelo de lenguaje. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) confirman que el artefacto es software binario empaquetado, no un modelo entrenado.

Desde la perspectiva de evaluación de modelos, esta ficha no puede ofrecer especificaciones técnicas, benchmarks ni requisitos de hardware en el sentido habitual. Se documenta el contenido real del repositorio y se señalan los indicios que aconsejan tratar el binario como potencialmente malicioso, dado que solicita ejecución como administrador tras extraer un archivo con contraseña desde un enlace externo a GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, referidos a la interfaz del binario) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 8,9 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No aplica. No se ha publicado ninguna arquitectura de red neuronal, dataset de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de modelado. El repositorio no contiene ficheros `config.json`, `model.safetensors`, `tokenizer.json` ni ningún artefacto propio de un modelo de Hugging Face.

La "arquitectura" descrita en la model card corresponde a módulos de un bot de trading: motor de bundles Jito/MEV, filtro anti-honeypot previo a la compra, sandbox de paper trading, bundler de 20 carteras mediante Lookup Tables, enrutamiento de órdenes sub-40 ms por WebSocket/gRPC y copia de ballenas en tiempo real. Son afirmaciones de marketing sin verificación independiente ni código fuente publicado.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni modo "thinking".
- No procesa visión, audio ni modalidades distintas de texto.
- Las capacidades que declara la model card son funcionalidades de un bot de trading (según el propio autor): enrutamiento de órdenes, filtrado de tokens, simulación de estrategias y replicación de carteras.
- Ninguna de esas capacidades está respaldada por código, tests, repositorio público verificable ni auditoría.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no hay modelo. Los escenarios que plantea la model card son de trading automatizado con criptomonedas y presentan riesgos regulatorios y de seguridad:

- Automatización de copia de operaciones en perpetuos: el binario afirmaría replicar carteras de terceros; sin código auditable no es posible verificar el comportamiento real ni las claves que maneja.
- Simulación de estrategias en paper trading: la supuesta sandbox no es verificable y no sustituye a un backtest con datos históricos reproducibles.
- Enrutamiento de órdenes de baja latencia: requiere conexión directa a exchanges con credenciales de API, lo que convierte al binario en un punto de exposición de secretos.
- Filtrado de tokens fraudulentos: una funcionalidad anti-honeypot sin auditoría no ofrece garantías frente a pérdidas.
- Gestión multi-cartera: el supuesto bundler de 20 carteras implicaría custodia de claves privadas por software de origen no verificado.
- Uso educativo o de investigación sobre bots de trading: solo sería razonable estudiando el binario en un entorno aislado (máquina virtual sin red y sin claves reales), nunca ejecutándolo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`97,6 %` de consistencia, `99,2 %`, `< 63 MB` de RAM, `sub-40 ms`) son afirmaciones del autor sin metodología, sin conjunto de prueba y sin replicación independiente; no deben interpretarse como métricas de rendimiento de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Plataforma declarada por el autor: Windows 10 y Windows 11 de 64 bits, ejecutable `bybit-binance-perp-copytrade-bot-v2-v1.2.0-win64.exe`, build `v2.5.3` (`9485AD`), archivo `bybit-binance-perp-copytrade-bot-v2-v1.2.0-win64.zip` de 8,9 MB protegido con la contraseña `2026`.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable: el artefacto es un binario de trading para Windows, no un modelo de IA. Cualquier comparación con LLM open source (Llama, Mistral, Qwen, Gemma) sería categóricamente incorrecta.

| Criterio | Este repositorio | Modelo de IA típico en HF |
|---|---|---|
| Naturaleza del artefacto | Binario `.exe` en ZIP | Pesos en safetensors/GGUF |
| Pesos publicados | No | Sí |
| Código fuente auditable | No | Habitualmente sí |
| Benchmarks reproducibles | No | Habitualmente sí |
| Pipeline de HF | No disponible | Definido (text-generation, etc.) |

## Limitaciones y advertencias

- No es un modelo de IA: la ficha se redacta para dejar constancia de que el identificador no corresponde a un modelo y evitar confusión en catálogos.
- Indicios de riesgo de seguridad: distribución mediante ZIP con contraseña (`2026`), enlace de descarga alojado en un repositorio de GitHub distinto del autor de Hugging Face (`Caroline27881` frente a `Marselox`), instrucción de ejecutar como administrador y ausencia de código fuente. Este patrón es habitual en campañas de malware.
- Posible suplantación o contenido engañoso: badges de descargas ("260K+") y valoraciones ("5.0/5") sin respaldo, y texto de model card generado con plantilla repetitiva.
- Riesgo financiero: cualquier uso real en trading con perpetuos puede derivar en pérdida de fondos y en incumplimiento de normativa (MiCA en la UE, restricciones de los exchanges).
- Riesgo de custodia de claves: un binario no auditado que maneja API keys o claves privadas puede exfiltrarlas.
- Licencia MIT declarada, pero sin fichero `LICENSE` verificable ni código que licenciar; la licencia no aporta garantías sobre el binario.
- Idiomas: los 14 idiomas listados corresponden a la interfaz del supuesto programa, no a capacidades lingüísticas de un modelo.
- No debe ejecutarse en máquinas con datos sensibles ni con credenciales de exchange reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/bybit-binance-perp-copytrade-bot-v2
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/Caroline27881/bybit-binance-perp-copytrade-bot-v2
- Enlace de descarga directa citado en la model card (no verificado, no recomendado): https://github.com/Caroline27881/bybit-binance-perp-copytrade-bot-v2/releases/latest/download/bybit-binance-perp-copytrade-bot-v2-v1.2.0-win64.zip
- Paper, blog, demo o repositorio de código del "modelo": no disponible.
