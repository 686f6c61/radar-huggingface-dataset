# Shonpk/hyperliquid-vault-copytrade-perp-bot

## Resumen

`Shonpk/hyperliquid-vault-copytrade-perp-bot` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un artefacto ejecutable para Windows x64, presentado por su autor como un bot de copytrading de bóvedas y perpetuos para el exchange Hyperliquid. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún componente propio de un modelo de lenguaje; los tags de la plataforma (`windows`, `windows-11`, `x64`, `portable`) confirman esa naturaleza.

La model card describe módulos de ejecución de órdenes, filtros anti-honeypot, un motor de bundles Jito/MEV y un entorno de paper trading, e incluye instrucciones para descargar un archivo ZIP de 4,8 MB protegido con contraseña y ejecutar un binario `.exe` con privilegios de administrador. El binario referenciado en el texto (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`) no guarda relación nominal con el supuesto bot, lo que constituye una señal de alarma clara sobre la integridad y la procedencia del paquete.

Por todo ello, esta ficha documenta el repositorio como lo que es —un artefacto empaquetado sin relación con IA open source— y advierte de que no debe tratarse como un modelo evaluable ni ejecutarse en entornos de producción. No se dispone de información técnica verificable sobre arquitectura, entrenamiento ni rendimiento porque el repositorio no publica ninguno de esos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio distribuye un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card menciona componentes de software —un bundler de 20 wallets con Lookup Tables, un motor de bundles Jito/MEV, enrutado de órdenes por WebSocket y gRPC, y un sandbox de paper trading— descritos con métricas de rendimiento no verificables (polling a 161 Hz y 180 Hz, latencia inferior a 40 ms, consumo de RAM inferior a 24 MB y 28 MB). Ninguna de estas cifras viene respaldada por código fuente, binarios publicados en el propio repositorio ni resultados reproducibles.

Tampoco se documenta ningún dataset, proceso de RLHF, DPO ni innovación técnica en el sentido habitual del término. El contenido del repositorio es un artefacto binario cerrado distribuido mediante enlaces externos, con instrucciones para su ejecución como administrador y una contraseña de descompresión fija (`2026`), patrón habitual en campañas de distribución de software no verificado.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un modelo de lenguaje.
- No implementa razonamiento multi-paso ni comportamiento de agente basado en LLM.
- No ofrece capacidades multilingües reales; los idiomas listados son metadatos de la plataforma, no capacidades del artefacto.
- El autor declara funciones de trading (copytrading de bóvedas, órdenes en perpetuos, take profit escalonado, filtro anti-honeypot), pero no se aporta código ni evidencia verificable de su funcionamiento.

## Casos de uso

- No se identifica ningún caso de uso legítimo como modelo de IA, al no ser un modelo de IA.
- Auditoría de seguridad: el repositorio puede emplearse como caso de estudio de artefactos empaquetados que suplantan la categoría de modelo y solicitan ejecución como administrador.
- Formación en detección de ingeniería social: sirve para ilustrar señales de alarma como contraseñas fijas en archivos ZIP, nombres de binario incoherentes con el proyecto y métricas de rendimiento no verificables.
- Investigación de cadena de suministro de software: permite analizar cómo se reutilizan enlaces de GitHub Releases ajenos al proyecto declarado.
- No se recomienda su uso para trading real, automatización financiera ni integración en pipelines de producción.
- No se recomienda su ejecución en estaciones de trabajo con credenciales, claves de API o wallets conectadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras presentes en la model card (161 Hz, 180 Hz, menos de 40 ms, 96,1 % de consistencia) son afirmaciones del autor sin metodología, código ni reproducibilidad asociada.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card.
- CPU: x64 (Intel o AMD), según la model card.
- RAM: el autor afirma un consumo inferior a 24 MB y 28 MB en módulos concretos; no verificable.
- GPU: no aplica; no se declara aceleración por GPU ni requisitos de VRAM.
- VRAM estimada: no disponible.
- Opciones de despliegue: no disponibles (no es compatible con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no verificables.

## Comparativa con modelos similares

No procede. Este repositorio no pertenece a la categoría de modelos de lenguaje ni de modelos de IA, por lo que no existe una comparativa significativa con alternativas de la misma clase. Cualquier comparación con modelos de parámetros, contexto o licencia sería engañosa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal en evaluaciones o catálogos introduce un error de categoría.
- El binario referenciado en la model card (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`) no coincide con el nombre del proyecto, lo que indica posible reutilización de un paquete ajeno o suplantación.
- La distribución mediante ZIP con contraseña fija y ejecución como administrador es un patrón de riesgo elevado para la seguridad del sistema.
- No hay código fuente, hashes verificables ni firmas que permitan auditar el contenido del paquete.
- Las métricas de rendimiento declaradas carecen de metodología y de evidencia reproducible.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del binario distribuido por enlaces externos.
- Riesgo de fraude financiero: un supuesto bot de trading con acceso a claves de API o wallets puede exfiltrar credenciales.
- No debe ejecutarse en máquinas con acceso a exchanges, wallets, credenciales cloud o datos personales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, pese a que la model card afirma 704K descargas, contradicción que refuerza la falta de fiabilidad de la información publicada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Shonpk/hyperliquid-vault-copytrade-perp-bot
- Enlace de descarga citado en la model card (GitHub Releases de un tercero): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Enlace de releases citado en la model card: https://github.com/gvolkov18/hyperliquid-vault-copytrade-perp-bot/releases/latest
- Paper, blog, demo o repositorio oficial del supuesto modelo: no disponible
