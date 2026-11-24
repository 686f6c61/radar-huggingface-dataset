# MichaelYanolja/bybit-binance-perp-copytrade-bot-portable

## Resumen

`MichaelYanolja/bybit-binance-perp-copytrade-bot-portable` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que distribuye un ejecutable portable para Windows 10 y Windows 11 (x64) presentado como un bot de copytrading de futuros perpetuos entre Bybit y Binance. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni código de inferencia; su contenido es una model card con instrucciones de descarga de un archivo ZIP de 8,9 MB protegido con contraseña y enlazado a un repositorio de GitHub externo (`niklash13/bybit-binance-perp-copytrade-bot-portable`).

La ficha se redacta por completitud editorial, pero debe quedar claro desde el principio: no hay ningún modelo lingüístico que evaluar. No existen parámetros, contexto, cuantizaciones ni benchmarks. El artefacto distribuido es un binario cerrado para Windows, y la model card incluye patrones propios de campañas de distribución de software potencialmente no deseado: contraseña fija en el archivo comprimido, petición de ejecución como administrador, enlaces de descarga alojados fuera de Hugging Face y métricas de popularidad (173K descargas, valoración 5.0/5) que no coinciden con las descargas reales del repositorio en Hugging Face (0 descargas, 0 likes en el momento de la consulta).

Desde la perspectiva de un desarrollador o investigador, este repositorio no es apto para evaluación técnica como modelo ni para integración en pipelines de IA. Se documenta aquí únicamente para advertir de su naturaleza y de los riesgos asociados a ejecutar binarios de procedencia no verificada con privilegios elevados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable portable para Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, aplicables a la documentación, no a un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO u otros). El artefacto descrito en la model card es un ejecutable (`bybit-binance-perp-copytrade-bot-portable-v1.2.0-win64.exe`, build `v2.8.7` / `D18365C3EA`) empaquetado en un ZIP de 8,9 MB con contraseña `2026`. La model card menciona componentes funcionales del supuesto bot (enrutamiento de órdenes por WebSocket y gRPC, motor de bundles MEV/Jito, bundler de 20 wallets con Lookup Tables, sandbox de paper trading y espejo de wallets de smart money), pero no se aporta código fuente, binario verificable dentro de Hugging Face ni documentación técnica auditable. No hay innovación técnica verificable que reseñar en el sentido de un modelo de IA.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en un modelo generativo.
- El supuesto software se presenta como bot de copytrading de perpetuos entre Bybit y Binance, con funciones declaradas de take profit multinivel, enrutamiento de órdenes de baja latencia, sandbox de paper trading y espejo de wallets.
- Ninguna de esas capacidades está verificada por código fuente, auditoría o documentación técnica disponible en el repositorio.
- Los idiomas listados en los metadatos corresponden a la documentación del repositorio, no a capacidades lingüísticas de un modelo.

## Casos de uso

- Evaluación de seguridad de artefactos: el repositorio puede usarse como caso de estudio para formar a equipos en la identificación de campañas de distribución de binarios no verificados en plataformas de modelos (contraseña fija, ejecución como administrador, enlaces externos).
- Análisis de reputación en Hugging Face: sirve para ilustrar discrepancias entre métricas declaradas en la model card (173K descargas, 5.0/5) y métricas reales del repositorio (0 descargas, 0 likes).
- Documentación de taxonomía de repositorios: útil para clasificar contenido que no es un modelo y etiquetarlo adecuadamente en catálogos internos.
- Formación en higiene de cadena de suministro: ejemplo práctico de por qué no deben ejecutarse binarios descargados de repositorios sin trazabilidad ni firma.
- Auditoría de licencias: caso de licencia MIT declarada sobre un artefacto binario sin código fuente acompañante, lo que plantea dudas sobre la aplicabilidad real de la licencia.
- No se recomienda ningún caso de uso operativo con el binario en producción, ni financiero ni de otro tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de ningún tipo, y las cifras que aparecen en la model card (sub-40 ms de enrutamiento, 172 Hz de polling, 99,4 % de consistencia) son afirmaciones de marketing sin metodología, sin código y sin verificación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11, arquitectura x64.
- Tamaño del paquete de distribución: 8,9 MB (ZIP con contraseña).
- Opciones de despliegue: ejecución directa del `.exe` en Windows; no hay soporte para vLLM, llama.cpp, Ollama, TGI ni ningún runtime de inferencia.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a la categoría de modelos de IA, por lo que no existe una comparativa significativa con modelos de lenguaje, visión o multimodalidad. Si se compara con otros repositorios de la misma plataforma, la comparación relevante sería con proyectos de trading algorítmico de código abierto con repositorios auditables, y este no cumple ese criterio.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigación o desarrollo de IA.
- Distribución de un binario cerrado para Windows con contraseña fija en el ZIP y solicitud de ejecución como administrador, patrón habitual en campañas de software no deseado.
- Enlaces de descarga apuntan a un repositorio de GitHub externo (`niklash13/...`) no verificado, fuera del control de Hugging Face.
- Métricas de popularidad de la model card (173K descargas, valoración 5.0/5) no coinciden con las métricas reales del repositorio en Hugging Face (0 descargas, 0 likes).
- Licencia MIT declarada sobre un artefacto binario sin código fuente acompañante: la aplicabilidad y el cumplimiento de la licencia no son verificables.
- Riesgo financiero elevado si se ejecuta en un contexto de trading real: no hay auditoría, ni código fuente, ni evidencia de que las funciones declaradas existan o funcionen como se describe.
- Riesgo de seguridad: ejecutar binarios no firmados con privilegios de administrador puede comprometer el sistema anfitrión y las claves de API de exchanges.
- No hay sesgos de modelo que analizar porque no hay modelo; el riesgo relevante es de seguridad y de cadena de suministro de software.
- No apto para producción en ningún escenario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MichaelYanolja/bybit-binance-perp-copytrade-bot-portable
- Repositorio de GitHub referenciado en la model card: https://github.com/niklash13/bybit-binance-perp-copytrade-bot-portable
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/niklash13/bybit-binance-perp-copytrade-bot-portable/releases/latest/download/bybit-binance-perp-copytrade-bot-portable-v1.2.0-win64.zip
- Papers, blogs, demos o documentación técnica adicional: no disponibles.
