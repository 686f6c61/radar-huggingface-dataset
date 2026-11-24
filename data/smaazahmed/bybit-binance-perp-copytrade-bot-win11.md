# smaazahmed/bybit-binance-perp-copytrade-bot-win11

## Resumen

La ficha solicitada corresponde a `smaazahmed/bybit-binance-perp-copytrade-bot-win11`, un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows x64 (build `v2.3.4`, código `B24E02`) distribuido como archivo ZIP de 4,8 MB con contraseña de descompresión, que se presenta como un bot de copytrading de futuros perpetuos para los exchanges Bybit y Binance. El autor es el usuario `smaazahmed` y la licencia declarada es MIT.

El artefacto no incluye pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia; los metadatos de Hugging Face únicamente recogen etiquetas de plataforma (`windows`, `windows-11`, `x64`, `portable`) y una lista de 14 idiomas que corresponde a la localización de la interfaz del ejecutable, no a capacidades lingüísticas de un modelo. Por tanto, no es posible evaluar parámetros, contexto, cuantizaciones ni rendimiento en tareas de lenguaje.

Esta ficha se redacta para dejar constancia técnica de la naturaleza del artefacto y advertir de que su publicación en Hugging Face no lo convierte en un modelo evaluable. Los apartados que siguen reflejan esta circunstancia: donde no existe dato verificable se indica explícitamente "no disponible", y se señalan los riesgos de seguridad asociados a la ejecución de binarios de procedencia no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de localización del binario, no capacidades de modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El repositorio aloja un binario `solara-executor-v3-keyless-2026-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB protegido con contraseña, junto con una model card que describe módulos de trading (sandbox de paper-trading, take-profit multinivel, motor de bundles Jito/MEV, enrutado de órdenes por WebSocket y gRPC, filtro anti-honeypot y almacén local AES-256). No se documenta ningún proceso de entrenamiento, dataset, tokenizador ni técnica de alineación (RLHF, DPO), porque no aplica.

La única información técnica verificable es la de empaquetado: plataforma Windows 10/11 de 64 bits, tamaño de 4,8 MB, versión `v2.3.4` y contraseña de extracción publicada en la propia model card. Cualquier afirmación sobre latencias, consistencia o tasas de sondeo que aparece en el README procede del texto promocional del autor y no es verificable de forma independiente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en modelos.
- No tiene capacidades multimodales (visión, audio) ni modo de pensamiento.
- La funcionalidad declarada por el autor es la ejecución de estrategias de copytrading sobre futuros perpetuos en Bybit y Binance, con módulos de gestión de riesgo y firma local de claves.
- La lista de idiomas refleja la localización de la interfaz del ejecutable, no competencia lingüística medible.

## Casos de uso

- **Auditoría de seguridad de artefactos en Hugging Face:** usar este repositorio como caso de estudio de paquetes que se publican con etiquetas de modelo pero contienen binarios ejecutables, útil para construir reglas de filtrado en mirrors corporativos.
- **Formación en higiene de cadena de suministro:** ilustrar por qué no debe ejecutarse un `.exe` descargado de un repositorio con cero descargas y cero likes, solicitando privilegios de administrador y con contraseña de archivo.
- **Evaluación de políticas de licencia:** analizar la discrepancia entre una licencia MIT declarada y la ausencia de código fuente en el repositorio, ejercicio habitual en revisiones de compliance.
- **Detección de ingeniería social financiera:** estudiar el patrón de model card con insignias falsas de descargas y valoraciones, temática de criptoactivos y enlaces a releases externos, para entrenar clasificadores de phishing.
- **Documentación de inventario interno:** registrar el artefacto como "no modelo" en un catálogo de activos de IA, evitando que aparezca en búsquedas de modelos desplegables.
- **Pruebas de sandboxing de Windows:** si se analiza en un entorno aislado, verificar el comportamiento del binario frente a SmartScreen y Defender, sin ejecutarlo en máquinas de producción ni con credenciales reales de exchange.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones reproducibles, y las cifras que aparecen en la model card (por ejemplo, "98,3 % de consistencia" o "sondeo a 169 Hz") son afirmaciones promocionales sin metodología ni conjunto de datos asociado.

## Requisitos de hardware

- **VRAM:** no aplica; no hay modelo que cargar en GPU.
- **GPU recomendadas:** no disponible; el artefacto es un ejecutable de CPU para Windows x64.
- **Consumer GPU:** no aplica.
- **Requisitos declarados por el autor:** Windows 10/11 de 64 bits, ejecución como administrador, menos de 36 MB de RAM según el README (no verificado).
- **Opciones de despliegue:** no existen integraciones con vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo.
- **Latencia y throughput:** no disponible; las cifras de enrutado de órdenes que cita el README no son verificables.

## Comparativa con modelos similares

| Criterio | `smaazahmed/bybit-binance-perp-copytrade-bot-win11` | Modelo de lenguaje open source típico (p. ej., familia Llama o Qwen) | Modelo de trading algorítmico open source (p. ej., repos de Freqtrade/Hummingbot) |
|---|---|---|---|
| Naturaleza | Binario Win64 en ZIP | Pesos en safetensors/GGUF | Código fuente en Python |
| Parámetros | no disponible | Miles de millones (según variante) | no aplica |
| Contexto | no disponible | Decenas de miles de tokens | no aplica |
| Licencia | MIT declarada, sin código fuente visible | Licencias permisivas o comunitarias | MIT/Apache-2.0 con código auditable |
| Disponibilidad | 0 descargas, 0 likes en Hugging Face | Amplia, con mirrors y cuantizaciones | Repositorios públicos con histórico de commits |
| Auditabilidad | Nula (binario cerrado) | Alta (pesos y configs públicas) | Alta (código fuente) |

No se conocen modelos comparables dentro de la categoría "modelo de IA" porque el artefacto no pertenece a ella; la comparación se ofrece únicamente para situar su naturaleza frente a alternativas reales.

## Limitaciones y advertencias

- **No es un modelo de IA:** no debe incluirse en catálogos, pipelines de inferencia ni evaluaciones de NLP.
- **Riesgo de seguridad elevado:** distribución de un `.exe` con contraseña de descompresión y solicitud de ejecución como administrador, patrón habitual en campañas de malware; la contraseña `2026` evita el escaneo automático de antivirus sobre el archivo comprimido.
- **Procedencia no verificada:** cero descargas y cero likes en el momento de la consulta, autor sin historial público contrastable y enlaces de descarga que apuntan a repositorios de GitHub de terceros.
- **Afirmaciones no verificables:** insignias de "168K+ descargas" y "5,0/5" en la model card no se corresponden con las métricas reales de Hugging Face.
- **Riesgo financiero directo:** cualquier bot de copytrading con acceso a claves de exchange puede provocar pérdidas patrimoniales; el README menciona un almacén AES-256 local, pero no hay código que permita auditarlo.
- **Licencia MIT sin código:** la licencia permite uso comercial, pero sin fuentes no es posible cumplir con buenas prácticas de revisión ni determinar qué componentes de terceros incorpora.
- **Idiomas:** las 14 etiquetas de idioma no implican soporte real de calidad; no hay evaluación lingüística asociada.
- **Recomendación:** no ejecutar el binario en entornos con credenciales, claves de API o fondos reales; si se analiza, hacerlo en máquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/smaazahmed/bybit-binance-perp-copytrade-bot-win11
- Release citado en la model card (GitHub, terceros): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Releases alternativos citados (GitHub, terceros): https://github.com/RobertMitsotakis/bybit-binance-perp-copytrade-bot-win11/releases/latest
- Paper, blog o demo oficial: no disponible
