# henly988/metro-exodus-cheat-trainer

## Resumen

El repositorio `henly988/metro-exodus-cheat-trainer` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows (binario `.exe` y archivo `.zip`) presentado bajo la apariencia de un "cheat trainer" para el videojuego Metro Exodus, pero cuya model card describe funcionalidades propias de una herramienta de derivación de carteras de criptomonedas (validación BIP39, derivación BIP44/BIP84, rotación de nodos RPC, parseo de keystores LevelDB). No existe ningún artefacto de pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociado al repositorio.

La ficha se redacta, por tanto, como evaluación técnica del artefacto publicado, no de un modelo lingüístico. El interés para desarrolladores e investigadores es fundamentalmente de seguridad: el paquete combina señuelos (nombre de juego, referencias cruzadas a otro supuesto trainer de Monster Hunter Wilds) con capacidades declaradas de manejo de material criptográfico sensible, distribución mediante archivo comprimido protegido con contraseña y alojamiento en un repositorio de GitHub de terceros ajeno al autor del repositorio de Hugging Face. Todos los indicadores apuntan a un patrón de malware o de fraude, no a una herramienta legítima.

El repositorio registra 0 descargas y 0 likes en el momento de la consulta, fue creado y actualizado el 24 de noviembre de 2026, y declara licencia MIT. No se ha publicado ninguna información sobre arquitectura, parámetros, contexto o entrenamiento porque el artefacto no es un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; no verificable en el artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como `.exe` y `.zip` de 4,8 MB) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es un modelo entrenado ni contiene pesos neuronales. Según la model card, el paquete ejecuta en Windows 10/11 de 64 bits un binario denominado `monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe` (build `v2.2.7`, identificador `008D01`) que, según el texto, implementa validación local de frases semilla BIP39 (12/18/24 palabras), derivación de direcciones BIP44/BIP84 para EVM, Solana y Bitcoin, rotación de nodos RPC (Alchemy, Helius, QuickNode) y parseo de keystores LevelDB de extensiones de navegador. No se documenta ningún proceso de entrenamiento, dataset, ajuste por RLHF/DPO ni innovación algorítmica verificable.

La única información "técnica" de la model card son cifras de rendimiento declaradas sin respaldo (consistencia del 98,5 %, polling a 395 Hz, 288 Hz y 208 Hz, respuesta inferior a 9 ms, uso de RAM inferior a 61 MB). Estas cifras no son verificables y no se acompañan de metodología, código fuente ni artefactos reproducibles.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- El multilingüismo declarado en los metadatos (14 idiomas) corresponde a etiquetas del repositorio, no a capacidades del artefacto.
- Capacidades declaradas por el autor, no verificadas: validación BIP39 offline, derivación multi-chain, rotación de RPC, exportación de balances y parseo de keystores LevelDB.
- Capacidad declarada como "cheat trainer" para Metro Exodus: no hay evidencia de que el binario interactúe con el juego; el nombre del ejecutable hace referencia a otro juego distinto (Monster Hunter Wilds).

## Casos de uso

- Auditoría de seguridad y análisis de malware: el artefacto es un caso de estudio útil para formar a analistas en la identificación de repositorios señuelo en plataformas de modelos, con indicadores claros (nombre de juego, ejecutable con nombre de otro juego, contraseña de archivo, enlaces a repositorios de GitHub de terceros).
- Investigación de patrones de fraude en Hugging Face: permite documentar cómo se abusa de las etiquetas `license:mit` y de los metadatos multilingües para dar apariencia de legitimidad a un paquete ejecutable.
- Concienciación de desarrolladores: sirve como ejemplo didáctico de por qué no deben ejecutarse binarios descargados desde repositorios de modelos ni extraerse archivos protegidos con contraseña procedentes de enlaces no verificados.
- Análisis de cadena de suministro: el uso de un repositorio de GitHub ajeno (`Giovanni9790/monster-hunter-wilds-trainer-mod`) para alojar la descarga real, mientras el repositorio de Hugging Face actúa como escaparate, es un patrón relevante para equipos de threat intelligence.
- Formación en respuesta a incidentes: el flujo descrito (descarga, extracción con contraseña `2026`, ejecución como administrador, whitelisting en Windows Defender) reproduce una secuencia típica de infección que puede usarse en simulacros.
- Documentación de políticas de moderación: el caso ilustra la necesidad de que las plataformas de modelos detecten artefactos no-modelo con contenido ejecutable y referencias a material criptográfico.

No se recomienda ningún uso del binario en producción, en equipos personales ni en entornos con acceso a carteras de criptomonedas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (98,5 % de consistencia, 395 Hz, 288 Hz, 208 Hz, menos de 9 ms, menos de 61 MB de RAM) son afirmaciones del autor sin metodología ni verificación independiente, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits (declarado).
- CPU: x64 Intel o AMD (declarado).
- RAM: menos de 61 MB según el autor (no verificado).
- GPU: no aplica; no se declara aceleración por GPU.
- VRAM: no disponible.
- Despliegue: no aplica (no es un modelo; no se ejecuta con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: cifras declaradas no verificables (véase la sección de benchmarks).

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, se compara con otros repositorios señuelo del mismo patrón:

| Artefacto | Tipo real | Contenido ejecutable | Licencia declarada | Verificabilidad |
|---|---|---|---|---|
| `henly988/metro-exodus-cheat-trainer` | Binario Windows / supuesto trainer | Sí (`.exe`, `.zip` con contraseña) | MIT | Nula |
| Repositorios señuelo equivalentes en Hugging Face | Binarios o scripts | Habitualmente sí | MIT o Apache-2.0 | Nula |
| Modelo de IA legítimo (p. ej. Llama, Qwen, Mistral) | Pesos neuronales | No | Licencia específica | Alta (pesos, config, tokenizador) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como tal ni incluirse en comparativas de LLM.
- Riesgo de seguridad crítico: la model card describe manejo de frases semilla BIP39, derivación de direcciones y parseo de keystores, capacidades coherentes con el robo de criptomonedas.
- Distribución mediante archivo ZIP protegido con contraseña (`2026`), técnica habitual para evadir análisis automáticos de antivirus y sandboxes.
- Ejecución solicitada como administrador y recomendación explícita de añadir el directorio a la lista blanca de Windows Defender, lo que desactiva la protección del sistema.
- Incoherencia de nombres: el repositorio se presenta como trainer de Metro Exodus pero el ejecutable se llama `monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`, y la descarga apunta a un repositorio de GitHub de otro autor.
- Los enlaces de descarga apuntan a `github.com/Giovanni9790/...` y `github.com/HarukiSiekiera09/...`, no al repositorio de Hugging Face, lo que rompe la trazabilidad.
- Cero descargas y cero likes: sin evidencia de uso legítimo ni comunidad.
- La licencia MIT declarada no otorga ninguna garantía sobre el contenido ni sobre su seguridad; en la práctica, el binario no es auditable.
- Los idiomas declarados en los metadatos no implican soporte real; no hay interfaz ni documentación que lo respalde.
- Recomendación: no descargar, no extraer y no ejecutar el artefacto; si ya se ha ejecutado, tratar el sistema como comprometido y rotar cualquier frase semilla o clave expuesta en él.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/henly988/metro-exodus-cheat-trainer
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Repositorio de GitHub citado como origen de releases: https://github.com/HarukiSiekiera09/metro-exodus-cheat-trainer/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
