# DragonBRX/gmgn-bullx-photon-copytrade-bot-pc

## Resumen

El repositorio `DragonBRX/gmgn-bullx-photon-copytrade-bot-pc` no contiene un modelo de inteligencia artificial, sino un supuesto ejecutable portable para Windows 10 y Windows 11 que se distribuye empaquetado en un archivo ZIP de 4,8 MB protegido con contraseña. La model card lo presenta como un bot de copytrading para plataformas de tokens (GMGN, BullX, Photon) con módulos de bundleo MEV, gestión de 20 wallets mediante Lookup Tables, take profit escalonado y enrutamiento de órdenes inferior a 40 ms. No existe ningún peso neuronal, tokenizador ni configuración de inferencia en la información disponible.

El artefacto se anuncia con etiquetas de licencia MIT y multitud de idiomas (14 en total), pero esas etiquetas describen un binario, no un modelo lingüístico. La model card mezcla además nombres de archivo ajenos al proyecto (referencias a un supuesto trainer de *Kingdom Come: Deliverance 2*), enlaces a repositorios de GitHub de terceros y un binario `.exe` que se solicita ejecutar como administrador. Todo ello es incompatible con la estructura de un modelo alojado en Hugging Face.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado y advierte de que no es evaluable como modelo de IA: no hay arquitectura, parámetros, contexto ni benchmarks que analizar. Cualquier uso en producción requeriría un análisis de seguridad independiente del binario, que queda fuera del alcance de esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del autor) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado ninguna arquitectura de red neuronal, conjunto de datos de entrenamiento, proceso de RLHF/DPO ni innovación técnica de inferencia en la información disponible. La model card describe módulos funcionales de un programa de trading (motor de bundles Jito/MEV, bundler de 20 wallets con Lookup Tables, take profit multinivel, enrutamiento de órdenes por WebSocket y gRPC, almacén local AES-256 y espejo de wallets de smart money), pero no especifica lenguaje de implementación, dependencias, binarios intermedios ni mecanismo de entrenamiento alguno.

El único dato técnico verificable es el tamaño del paquete (4,8 MB) y el nombre del ejecutable (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`), junto con un identificador de build (`v3.6.3`, `8FC36F`). No hay información sobre cómo se generó el binario, qué librerías enlaza ni qué tráfico de red realiza.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado de tool calling ni function calling en el sentido de un modelo lingüístico.
- No hay soporte de agentes ni razonamiento multi-paso basado en un modelo.
- Las capacidades multilingües se limitan a etiquetas de idioma en los metadatos, sin evidencia de funcionamiento real.
- Las funcionalidades descritas son de naturaleza financiera y operativa (copytrading, bundles MEV, gestión de wallets), no cognitivas.
- No se declara modo de pensamiento, visión, audio ni ninguna capacidad especial de IA.

## Casos de uso

- **Auditoría de seguridad de binarios:** el artefacto podría analizarse en un entorno aislado para determinar qué ejecuta realmente, dado que se distribuye como `.exe` con contraseña y solicita privilegios de administrador. No es un caso de uso del modelo, sino del binario.
- **Investigación de malware y campañas de ingeniería social:** la model card presenta patrones típicos de distribución engañosa (nombres de archivo ajenos, enlaces a repositorios de terceros, contraseña fija, instrucciones de ejecución como administrador), lo que lo convierte en un caso de estudio para equipos de threat intelligence.
- **Formación en higiene de cadena de suministro:** sirve como ejemplo didáctico de por qué no deben ejecutarse binarios sin verificar procedencia, firma y reputación del autor.
- **Verificación de políticas de Hugging Face:** el caso ilustra la necesidad de revisar repositorios etiquetados como modelos que en realidad alojan ejecutables.
- **Análisis de licencias:** permite estudiar la discrepancia entre una licencia MIT declarada y la ausencia de código fuente que la respalde.
- **No se identifican casos de uso legítimos de IA**, ya que no hay modelo que desplegar, integrar ni evaluar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles como modelo; la model card cita cifras de un supuesto motor de trading (enrutamiento inferior a 40 ms, respuesta inferior a 5 ms, sondeo a 386 Hz) que no son verificables ni corresponden a inferencia neuronal.
- Plataforma objetivo declarada: Windows 10 y Windows 11 de 64 bits, con ejecución como administrador.

## Comparativa con modelos similares

| Criterio | `DragonBRX/gmgn-bullx-photon-copytrade-bot-pc` | Modelo de IA típico en Hugging Face |
|---|---|---|
| Naturaleza | Ejecutable Windows empaquetado en ZIP | Pesos neuronales (safetensors, GGUF) |
| Parámetros | no disponible | Cientos de millones a cientos de miles de millones |
| Contexto | no disponible | 4K a 1M tokens según familia |
| Licencia | MIT declarada | Apache-2.0, MIT, Llama, Gemma, etc. |
| Reproducibilidad | Nula (binario cerrado con contraseña) | Alta (pesos y tokenizador públicos) |
| Benchmarks | No disponibles | MMLU, HumanEval, GSM8K, etc. |
| Disponibilidad | Descarga vía enlaces externos a GitHub | Descarga directa desde el hub |

No se identifican modelos comparables de la misma categoría porque el artefacto no pertenece a ninguna.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni ejecutar tareas cognitivas.
- El binario se distribuye protegido con contraseña (`2026`) e instrucciones para ejecutarlo como administrador, patrón habitual en campañas de distribución de software malicioso.
- La model card referencia nombres de archivo y repositorios ajenos al proyecto (un supuesto trainer de *Kingdom Come: Deliverance 2*), lo que indica suplantación o copia de plantillas.
- Los enlaces apuntan a cuentas de GitHub de terceros (`ErikMercier70637`, `DennisMiyazaki`) distintas del autor declarado (`DragonBRX`), lo que rompe la cadena de custodia.
- No hay código fuente, firma digital ni hash publicado que permita verificar la integridad del ejecutable.
- La licencia MIT declarada no tiene sentido sin código fuente asociado.
- Riesgo elevado de robo de claves, ya que el supuesto bot gestiona wallets y claves AES-256 locales.
- No debe ejecutarse en máquinas de producción ni con credenciales reales bajo ninguna circunstancia.
- Cualquier uso comercial o financiero queda desaconsejado sin una auditoría independiente previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DragonBRX/gmgn-bullx-photon-copytrade-bot-pc
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio GitHub citado en la model card: https://github.com/DennisMiyazaki/gmgn-bullx-photon-copytrade-bot-pc
- No se han encontrado papers, blogs, demos ni documentación técnica adicional en la información proporcionada.
