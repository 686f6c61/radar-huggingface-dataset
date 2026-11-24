# Kaliel456/fomo-solana-terminal-bundler-bot

## Resumen

`Kaliel456/fomo-solana-terminal-bundler-bot` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows presentado como bot de trading sobre la red Solana. El artefacto distribuido es un archivo `delta-executor-pc-2026-v1.2.2-win64.zip` de 4,8 MB con un binario `.exe` que el autor indica que debe ejecutarse como administrador tras extraerse con la contraseña `2026`. No existe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociado.

El repositorio emplea el esquema de etiquetas y la licencia MIT de Hugging Face, pero su contenido es una model card de tipo landing page con badges, enlaces de descarga a un repositorio de GitHub de terceros y un FAQ orientado a saltar avisos de Windows Defender y SmartScreen. Esta combinación —binario opaco, contraseña en el archivo, ejecución con privilegios elevados y distribución fuera de Hugging Face— es característica de campañas de malware o de software potencialmente no deseado, no de un modelo open source evaluable.

Por tanto, esta ficha documenta la ausencia de especificaciones técnicas de IA y advierte de los riesgos de seguridad. No debe tratarse como un modelo desplegable en vLLM, llama.cpp u Ollama, ni integrarse en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, no capacidades del binario) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (artefacto distribuido: `.zip` con `.exe` para Windows 10/11 x64) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo. El artefacto es un ejecutable nativo `delta-executor-pc-2026-v1.2.2-win64.exe` (build declarado `v4.8.1`, firma `7012F9ED64`) empaquetado en un ZIP de 4,8 MB protegido con contraseña. La model card menciona módulos funcionales de un bot de trading —enrutamiento de órdenes con latencia inferior a 40 ms, sandbox de paper trading, bundler de 20 wallets con Lookup Tables, motor de bundles Jito/MEV, almacén local AES-256 y copytrading de wallets—, pero no aporta detalles de implementación, dependencias, código fuente ni proceso de entrenamiento, porque no existe tal proceso.

No se documentan datos de entrenamiento, tokens, composición del dataset, RLHF, DPO ni innovaciones de inferencia. Los números de rendimiento que aparecen (293 Hz de polling, 242 Hz, 16 y 14 hilos de trabajo) son afirmaciones de marketing sin verificación reproducible ni binario auditable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en modelo.
- No tiene capacidades multilingües reales; los 14 idiomas son etiquetas de metadatos.
- No dispone de modo thinking, visión ni audio.
- El binario se presenta como bot de trading en Solana con módulos de enrutamiento de órdenes, paper trading, bundling multi-wallet, bundles Jito/MEV, almacén de claves AES-256 y copytrading.

## Casos de uso

- Ninguno recomendado en producción: no es un modelo de IA y no puede desplegarse en servidores de inferencia.
- Evaluación de seguridad: el artefacto puede usarse como muestra en análisis de malware para estudiar técnicas de distribución con contraseña en el ZIP y evasión de SmartScreen.
- Formación en concienciación: sirve como ejemplo didáctico de model card fraudulenta que imita el formato de Hugging Face para distribuir un ejecutable.
- Investigación de threat intelligence: los indicadores (dominio de GitHub de terceros, hash de build, contraseña fija `2026`) pueden incorporarse a reglas de detección.
- Auditoría de cadena de suministro: útil para ilustrar por qué los binarios opacos con ejecución como administrador deben bloquearse en políticas corporativas.
- No procede su uso para trading real, atención al cliente, generación de código ni ninguna tarea de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (sub-40 ms de enrutamiento, 293 Hz, 242 Hz, menos de 34 ms de respuesta) son afirmaciones del autor sin metodología, sin binario verificable y sin comparación con alternativas, por lo que no constituyen benchmarks válidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo requerido: Windows 10 22H2 o Windows 11 24H2, x64.
- Espacio en disco: aproximadamente 4,8 MB para el ZIP más el contenido extraído.
- Opciones de despliegue: ninguna de las habituales (vLLM, llama.cpp, Ollama, TGI) es aplicable; el artefacto es un `.exe` nativo.
- Latencia y throughput: no verificables; las cifras declaradas por el autor no son reproducibles.

## Comparativa con modelos similares

| Criterio | fomo-solana-terminal-bundler-bot | Modelo LLM open source típico (p. ej. Llama, Qwen, Mistral) | Bot de trading legítimo (p. ej. Hummingbot) |
|---|---|---|---|
| Tipo de artefacto | Binario `.exe` en ZIP con contraseña | Pesos safetensors/GGUF | Código fuente Python auditable |
| Parámetros | no disponible | Miles de millones | no aplica |
| Contexto | no disponible | 8K–1M tokens según modelo | no aplica |
| Licencia | MIT declarada | MIT, Apache 2.0 o community | Apache 2.0 |
| Código fuente | No publicado | Disponible | Disponible en GitHub |
| Verificabilidad | Nula | Reproducible con benchmarks | Reproducible |
| Riesgo de seguridad | Alto (binario opaco, admin, contraseña) | Bajo si se descarga del repo oficial | Bajo |

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y pipeline; cualquier expectativa de inferencia es infundada.
- Binario opaco distribuido con contraseña fija (`2026`) y ejecución solicitada como administrador: patrón clásico de malware o PUP.
- Descarga alojada en un repositorio de GitHub de terceros (`dawidb9567/delta-executor-pc-2026`) distinto del titular del repo de Hugging Face, lo que rompe la trazabilidad.
- La model card incluye un FAQ orientado a desactivar o sortear Windows Defender y SmartScreen, señal de alarma adicional.
- Riesgo financiero directo: un bot de trading que maneja claves privadas en un almacén local AES-256 no auditado puede exfiltrar fondos.
- Riesgo de robo de credenciales y de wallets de Solana si se ejecuta en una máquina con claves.
- Etiquetas de idioma y licencia MIT declaradas sin base técnica; no implican soporte real ni garantías legales.
- Cero descargas y cero likes en el momento de la consulta, sin comunidad ni validación externa.
- No debe ejecutarse en entornos corporativos ni personales; si ya se ha ejecutado, procede aislamiento del equipo y rotación de claves.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kaliel456/fomo-solana-terminal-bundler-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/dawidb9567/delta-executor-pc-2026
- Enlace de descarga citado en la model card: https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Releases alternativos citados: https://github.com/PhamBarnes/fomo-solana-terminal-bundler-bot/releases/latest
- Paper, blog o demo oficial: no disponible
