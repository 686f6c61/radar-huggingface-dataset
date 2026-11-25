# EDGARCHETOS/polymarket-trading-bot-clob-arbitrage

## Resumen

El repositorio `EDGARCHETOS/polymarket-trading-bot-clob-arbitrage` alojado en Hugging Face no contiene un modelo de inteligencia artificial en sentido estricto, sino un paquete ejecutable para Windows x64 distribuido como archivo ZIP de 4,8 MB. La model card lo presenta como una herramienta de automatización de operaciones de arbitraje sobre el order book (CLOB) de Polymarket, aunque el contenido real del paquete, según los enlaces y nombres de archivo que aparecen en la propia tarjeta, corresponde a un supuesto entrenador o utilidad de tipo "aimbot" para videojuegos. No se trata, por tanto, de un modelo de lenguaje, visión ni multimodal.

El autor, EDGARCHETOS, publica el artefacto bajo licencia MIT y declara soporte para catorce idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id), si bien esa lista parece referirse a la localización de la interfaz y no a capacidades lingüísticas de un modelo. En el momento de la consulta el repositorio registra 0 descargas y 0 "likes", fue creado el 24 de noviembre de 2026 y no tiene pipeline asociado.

La relevancia de esta ficha es fundamentalmente de advertencia: la discrepancia entre el nombre del repositorio (bot de trading), el binario referenciado (entrenador/aimbot) y los enlaces de descarga alojados en repositorios de terceros (`Shuhua73716`, `MikhailMa649`) apunta a un patrón habitual de distribución de software potencialmente no deseado. No hay información técnica verificable sobre arquitectura, parámetros, contexto ni entrenamiento, por lo que la mayoría de los campos de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete ejecutable para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según la model card, probablemente idiomas de interfaz) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe`; no hay safetensors, GGUF ni formato de pesos alguno) |

## Arquitectura y entrenamiento

No existe información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF, DPO) porque el artefacto publicado no es un modelo entrenado. La model card describe en su lugar componentes de un ejecutable: sincronización de offsets tras parches, "auto-execute directory", editor Monaco integrado, inyección de scripts y un flujo de ejecución "keyless". Estos términos corresponden a software de automatización o trampas para juegos, no a un transformer, MoE, SSM ni arquitectura híbrida.

El único dato técnico objetivo es el tamaño del paquete (4,8 MB) y el nombre del binario (`robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`), junto con una contraseña de descompresión (`2026`) y una build identificada como `v4.9.1 (01C3F6)`. No hay innovación técnica alguna documentada que pueda evaluarse en términos de decodificación especulativa, atención lineal o mezcla de expertos.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- La lista de idiomas de la model card no implica capacidades multilingües de un modelo; no hay evidencia de procesamiento de lenguaje natural.
- La model card menciona funciones de automatización de escritorio en Windows (adjuntar múltiples instancias, recarga automática de scripts, editor Monaco, ejecución sin clave), sin especificación técnica verificable.
- No se describe ningún modo "thinking", entrada de audio ni procesamiento multimodal.

## Casos de uso

- No es posible recomendar casos de uso legítimos para un modelo de IA porque el artefacto no es un modelo y su funcionalidad declarada no está verificada.
- Automatización de trading en Polymarket: la model card sugiere un uso de arbitraje sobre el CLOB, pero no se aporta documentación de API, claves, gestión de riesgo ni cumplimiento normativo, por lo que no puede validarse como herramienta de producción.
- Ejecución de scripts en Windows: el paquete incluye un editor y un motor de ejecución, pero sin auditoría del binario no es posible confirmar su comportamiento real.
- Distribución de software de terceros: los enlaces apuntan a repositorios ajenos al autor declarado, lo que impide atribuir responsabilidad y trazabilidad al artefacto.
- Evaluación de seguridad: el caso de uso más razonable es el análisis en entorno aislado (sandbox, máquina virtual sin red) para determinar qué hace realmente el ejecutable antes de cualquier otro uso.
- Formación y concienciación: sirve como ejemplo documentado de repositorio con nombre engañoso y cadena de distribución opaca, útil en materiales sobre higiene de dependencias y seguridad de la cadena de suministro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no disponible; el artefacto declara ser un ejecutable para Windows x64 y no requiere GPU según la información proporcionada.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI; el único despliegue descrito es la ejecución directa del `.exe` en Windows 10 u 11 de 64 bits.
- Latencia y throughput: la model card cita cifras internas (sondeo a 419 Hz y 199 Hz, respuesta inferior a 15 ms, consistencia del 96,2 % y 97,8 %) que no son verificables ni corresponden a métricas de inferencia de un modelo.
- Almacenamiento: el paquete ZIP ocupa 4,8 MB; el espacio en disco tras la extracción no se especifica.

## Comparativa con modelos similares

| Criterio | `polymarket-trading-bot-clob-arbitrage` | Modelo de lenguaje open source típico (p. ej. familia Llama, Qwen o Mistral) | Bot de trading open source convencional (p. ej. frameworks de ejecución sobre APIs de exchanges) |
|---|---|---|---|
| Naturaleza | Paquete ejecutable para Windows x64 | Pesos de red neuronal | Código fuente en Python/JS con dependencias auditables |
| Parámetros | no disponible | Miles de millones, publicados | no aplica |
| Contexto | no disponible | Decenas de miles de tokens | no aplica |
| Rendimiento | no disponible (cifras no verificables) | Benchmarks públicos (MMLU, HumanEval, GSM8K) | Métricas de ejecución y slippage medibles |
| Licencia | MIT (declarada) | MIT, Apache 2.0, licencias comunitarias | MIT, GPL, Apache 2.0 |
| Disponibilidad | ZIP alojado en repositorios de terceros | Hugging Face, repositorios oficiales | GitHub, PyPI, npm |
| Auditabilidad | Baja (binario cerrado, contraseña de descompresión) | Alta (pesos y código publicados) | Alta (código fuente) |

No se dispone de modelos comparables de la misma categoría porque la categoría declarada (bot de trading) y el contenido real (entrenador/aimbot) no coinciden con ningún modelo de IA publicado.

## Limitaciones y advertencias

- No es un modelo de IA: la ficha de Hugging Face se utiliza como canal de distribución de un ejecutable, lo que dificulta su clasificación y evaluación técnica.
- Discrepancia grave de identidad: el nombre del repositorio alude a arbitraje en Polymarket, mientras que el binario y los enlaces hacen referencia a un "trainer/aimbot", lo que sugiere un señuelo.
- Cadena de distribución opaca: la descarga apunta a repositorios de GitHub de terceros (`Shuhua73716`, `MikhailMa649`) distintos del autor del repositorio de Hugging Face.
- Contraseña de descompresión fija (`2026`): práctica que dificulta el escaneo automático por antivirus y motores de análisis de malware.
- Sin trazabilidad de código fuente: no se publica el código del binario, no hay compilación reproducible ni firma digital verificable.
- Riesgo de seguridad: la ejecución como administrador de un binario no auditado puede comprometer el sistema; se recomienda análisis en sandbox sin red y sin credenciales.
- Riesgo financiero: cualquier uso relacionado con trading automatizado sin auditoría previa puede derivar en pérdida de fondos o exposición de claves de API.
- Licencia MIT declarada pero sin archivo LICENSE verificable en la información disponible; la aplicabilidad legal es dudosa.
- Cero descargas y cero interacciones en el momento de la consulta: no hay comunidad ni evidencia de uso que respalde las afirmaciones de la model card.
- Las cifras de rendimiento de la model card (Hz, milisegundos, porcentajes de consistencia) no son verificables y no deben citarse como datos técnicos.
- Idiomas declarados: la lista de catorce idiomas parece referirse a localización de interfaz; no hay evidencia de capacidades lingüísticas de un modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EDGARCHETOS/polymarket-trading-bot-clob-arbitrage
- Enlace de descarga citado en la model card (repositorio de terceros, no verificado): https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026/releases/download/v1.2.0/robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de terceros citado para la última release: https://github.com/MikhailMa649/polymarket-trading-bot-clob-arbitrage/releases/latest
- Documentación de Polymarket (referencia externa sobre el CLOB mencionado en el nombre): no disponible en la información proporcionada.
- Paper, blog o demo del autor: no disponible.
