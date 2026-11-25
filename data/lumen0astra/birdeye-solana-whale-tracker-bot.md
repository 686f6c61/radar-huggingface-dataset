# LUMEN0ASTRA/birdeye-solana-whale-tracker-bot

## Resumen

La ficha solicitada corresponde al identificador `LUMEN0ASTRA/birdeye-solana-whale-tracker-bot`, publicado en Hugging Face. Tras revisar la información disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: la model card describe un supuesto ejecutable portable para Windows x64 distribuido como archivo ZIP con contrasena, orientado a operaciones de trading de criptomonedas en la red Solana (seguimiento de ballenas, copia de operaciones, filtros anti-honeypot y bundles Jito/MEV). No existe información sobre arquitectura de red neuronal, parametros, tokenizador, datos de entrenamiento ni pesos en formato abierto.

El repositorio presenta cero descargas y cero likes en el momento de la consulta, y el contenido de la model card incluye enlaces a un repositorio de GitHub de terceros (`VasitoTa77/...`) distinto del autor declarado en Hugging Face. Esta discrepancia, junto con la distribucion mediante binarios ejecutables protegidos por contrasena y la peticion de ejecucion como administrador, son patrones habituales en campanas de distribucion de software potencialmente malicioso.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, senala explicitamente la ausencia de cualquier especificacion de modelo y advierte de los riesgos asociados. No debe interpretarse como una evaluacion de capacidades de IA, ya que no las tiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable de trading) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (la distribucion es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado ninguna arquitectura de red neuronal, configuracion de transformer, esquema MoE ni detalles de entrenamiento. La model card no menciona tokenizador, corpus, numero de tokens, proceso de alineacion (RLHF, DPO) ni innovaciones tecnicas de inferencia. El artefacto descrito es un binario compilado (`birdeye-solana-whale-tracker-bot-v1.2.0-win64.exe`, build `v3.3.7 (DA3E58)`) empaquetado en un ZIP de 8,9 MB protegido con la contrasena `2026`.

Las unicas afirmaciones tecnicas de la model card se refieren a funcionalidad de trading: un bundler de 20 carteras con Lookup Tables, copia de operaciones de smart-money, filtro pre-compra de honeypots con verificacion de autoridades de mint/freeze y bloqueo de LP, motor de bundles Jito/MEV con dimensionamiento dinamico de propinas, take profit multinivel y un sandbox de paper trading. Ninguna de estas afirmaciones es verificable a partir de los metadatos publicados.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en modelos.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Las capacidades declaradas por el autor son funcionales de trading (seguimiento de ballenas, copia de operaciones, filtros de seguridad de tokens, bundles MEV), sin evidencia tecnica que las respalde.
- Los catorce idiomas listados son metadatos de la model card; no hay interfaz ni modelo linguistico que los soporte de forma verificable.

## Casos de uso

No se identifican casos de uso legitimos como modelo de IA, porque no lo es. Los escenarios que el autor sugiere son los siguientes, documentados a titulo informativo y con advertencias:

- Seguimiento de ballenas en Solana: el autor afirma que el binario monitoriza carteras de gran volumen mediante la API de Birdeye. No hay verificacion independiente ni codigo fuente auditable.
- Copia de operaciones de smart-money: se describe replicacion de carteras con dimensionamiento proporcional. Implica riesgo financiero directo y posible incumplimiento de terminos de servicio de proveedores de datos.
- Filtro anti-honeypot previo a la compra: verificacion de autoridades de mint/freeze y bloqueo de liquidez. La eficacia no esta demostrada y un falso negativo puede provocar perdida total del capital.
- Bundles Jito/MEV: inclusion atomica de transacciones con propinas dinamicas. Requiere claves privadas en el equipo local, lo que agrava el riesgo de robo de fondos.
- Take profit multinivel y trailing stop: automatizacion de salidas escalonadas. Sin auditoria del binario no puede garantizarse que las ordenes se ejecuten como se describe.
- Sandbox de paper trading: simulacion contra libros de ordenes en vivo. Es el unico escenario con riesgo financiero nulo, pero sigue requiriendo ejecutar un binario no verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`97,4%` de consistencia, `99,3%` de consistencia, `< 38 ms` de latencia, `< 46 MB` de RAM) son afirmaciones de marketing sin metodologia, sin conjunto de prueba ni reproducibilidad, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM estimada: no aplica; no hay modelo neuronal que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Despliegue: el autor indica extraer el ZIP con 7-Zip o WinRAR usando la contrasena `2026` y ejecutar el `.exe` como administrador. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Huella declarada: ZIP de 8,9 MB y menos de 46 MB de RAM en ejecucion, segun el autor.
- Latencia y throughput: no verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Frente a otros repositorios de Hugging Face, la categoria correcta seria la de binarios de terceros no auditados, para los que no se ofrece comparacion tecnica.

| Criterio | Este artefacto | Modelo de IA tipico en HF |
|---|---|---|
| Tipo de artefacto | Ejecutable Windows en ZIP | Pesos en safetensors/GGUF |
| Pesos auditables | No | Si |
| Parametros | no disponible | Declarados en config |
| Reproducibilidad | No | Si, via model card y eval |
| Riesgo de seguridad | Alto (binario con contrasena, admin) | Bajo por diseno |

## Limitaciones y advertencias

- No es un modelo de IA: carece de arquitectura, pesos, tokenizador y evaluaciones. Cualquier uso esperando capacidades de lenguaje es un error de categorizacion.
- Distribucion mediante ZIP con contrasena y ejecucion como administrador: tecnicas que dificultan el analisis por antivirus y por SmartScreen, y que la propia model card reconoce que disparan alertas heuristicas.
- Discrepancia de autoría: el identificador de Hugging Face es `LUMEN0ASTRA`, pero los enlaces de descarga apuntan a `VasitoTa77/birdeye-solana-whale-tracker-bot` en GitHub, un tercero no verificado.
- Cero descargas y cero likes: no hay evidencia de uso legitimo ni de comunidad que lo respalde.
- Afirmaciones no verificables: cifras de consistencia, latencia y consumo de memoria sin metodologia publicada.
- Riesgo financiero: la operativa de copia de operaciones y bundles MEV puede provocar perdidas directas, incluida la perdida total del capital, y requiere exponer claves privadas de carteras.
- Riesgo legal y de cumplimiento: el trading automatizado y el uso de APIs de terceros (Birdeye, Jito) estan sujetos a terminos de servicio y a normativa financiera que varia por jurisdiccion.
- Licencia MIT declarada, pero sin codigo fuente en el repositorio de Hugging Face que permita verificar el cumplimiento ni auditar el binario.
- Sesgos y alucinacion: no aplica en sentido estricto al no ser un modelo linguistico, pero la model card contiene afirmaciones comerciales no contrastadas que funcionan como desinformacion potencial.
- Recomendacion: no ejecutar el binario en equipos con carteras activas ni con credenciales sensibles; si se desea analizar, hacerlo en una maquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LUMEN0ASTRA/birdeye-solana-whale-tracker-bot
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/VasitoTa77/birdeye-solana-whale-tracker-bot
- Descarga directa citada en la model card (ZIP, contrasena `2026`): https://github.com/VasitoTa77/birdeye-solana-whale-tracker-bot/releases/latest/download/birdeye-solana-whale-tracker-bot-v1.2.0-win64.zip
- Pagina de releases citada: https://github.com/VasitoTa77/birdeye-solana-whale-tracker-bot/releases/latest
- Paper, blog, demo o repositorio oficial de un modelo: no disponible
