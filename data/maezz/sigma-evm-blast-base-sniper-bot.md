# maezz/sigma-evm-blast-base-sniper-bot

## Resumen

`maezz/sigma-evm-blast-base-sniper-bot` no es un modelo de inteligencia artificial. Es un repositorio de Hugging Face que aloja la model card de una supuesta aplicación de escritorio para Windows denominada "Sigma Evm Blast Base Sniper Bot", distribuida como binario ejecutable (`.exe`) comprimido en un ZIP de 8,9 MB. El autor declarado es el usuario `maezz`, aunque la model card redirige la descarga a un repositorio de GitHub de un tercero (`HugoYildirim`), lo que constituye una discrepancia relevante de trazabilidad.

El artefacto se presenta como un bot de trading para cadenas EVM (Blast, Base) con módulos de sniper, copytrade de "smart money", bundles Jito/MEV y gestión de hasta 20 wallets mediante Lookup Tables. No contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia; la etiqueta `pipeline` figura como no disponible y las descargas e interacciones son cero en el momento de la consulta.

Desde la perspectiva de un catálogo de modelos open source, esta ficha documenta un caso de uso indebido del Hub: un binario cerrado con ingeniería social (contraseña de archivo, ejecución como administrador, enlaces de descarga externos) que no debe evaluarse como modelo ni ejecutarse en entornos de desarrollo o investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; aplicación binaria para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` de Windows x64) |
| Plataforma objetivo | Windows 10 / 11, 64 bits (x64) |
| Version declarada | v2.7.8 (build C5EA44) |
| Tamano del paquete | 8,9 MB (`sigma-evm-blast-base-sniper-bot-v1.2.0-win64.zip`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-23 |
| Fecha de actualizacion | 2026-11-24 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (SFT, RLHF, DPO) ni innovación algorítmica que documentar. La model card describe, en su lugar, subsistemas de una aplicación de trading: almacén local de claves AES-256, motor de bundles Jito/MEV con dimensionado dinámico de propinas, bundler de 20 wallets mediante Lookup Tables, take profit multinivel con trailing stop, sandbox de paper trading y copytrade de wallets ballena. Son afirmaciones de marketing sin verificación técnica posible, ya que el código fuente no se publica.

Las cifras que aparecen en la model card (sondeo a 259 Hz, consistencia del 99,1 % y 96,1 %, latencia inferior a 21 ms, uso de RAM inferior a 62 MB, 7 hilos de trabajo) no son reproducibles ni auditables y no deben interpretarse como benchmarks de un modelo. La distribución se realiza mediante un enlace a GitHub Releases con contraseña de archivo (`2026`) e instrucciones para ejecutar el binario como administrador, un patrón habitual en campañas de malware disfrazado de herramienta cripto.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües se limitan a los metadatos de idioma del repositorio; no hay interfaz de lenguaje natural documentada.
- Funcionalidad declarada (no verificada): ejecución de operaciones en cadenas EVM, gestión de claves locales, bundles atómicos, copytrade y simulación de estrategias.
- No se publican demos, API, SDK ni documentación técnica del binario.

## Casos de uso

- Ninguno recomendado en el contexto de desarrollo de IA o investigación: el artefacto no aporta valor como modelo y su ejecución implica riesgos de seguridad.
- Auditoría de supply chain: analizar el repositorio como ejemplo de model card fraudulenta que redirige a binarios externos, útil para formar a equipos de seguridad en detección de este patrón.
- Estudio de ingeniería social en el Hub: documentar el uso de insignias falsas (descargas de 574K, valoración 4,9/5), contraseñas de archivo y ejecución como administrador como señales de alarma.
- Elaboración de políticas de ingesta de artefactos: usar este caso para definir reglas que bloqueen repositorios sin pesos, sin pipeline y con enlaces de descarga fuera del Hub.
- Formación en análisis de malware: el ZIP y el `.exe` pueden estudiarse en un entorno aislado (sandbox sin red, VM desechable) para identificar comportamiento malicioso.
- No se recomienda su uso para trading real, gestión de claves ni automatización financiera: no hay código fuente, auditoría ni garantías de integridad del binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de latencia, consistencia y consumo de memoria de la model card carecen de metodología y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados: Windows 10/11 de 64 bits, procesador Intel o AMD x64.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes).
- Latencia y throughput: las cifras de la model card (menos de 21 ms, 259 Hz) no son reproducibles ni auditables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Como referencia de categoría, se contrasta con repositorios legítimos del Hub:

| Criterio | Este repositorio | Modelo open source típico en el Hub |
|---|---|---|
| Pesos publicados | No | Sí (safetensors, GGUF) |
| Código fuente | No | Habitualmente sí |
| Pipeline de inferencia | No disponible | Definido (text-generation, etc.) |
| Distribución | ZIP externo con contraseña | Descarga directa desde el Hub |
| Verificabilidad | Nula | Checksums, licencia, model card técnica |
| Licencia | MIT declarada | MIT, Apache-2.0, Llama, etc. |

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en catálogos, pipelines de inferencia ni evaluaciones de rendimiento de modelos.
- Riesgo de seguridad alto: binario cerrado, distribuido fuera del Hub, con contraseña de archivo e instrucciones de ejecución como administrador; patrón compatible con malware.
- Discrepancia de trazabilidad: el repositorio de Hugging Face apunta a un repositorio de GitHub de otro autor (`HugoYildirim`), sin relación verificable con `maezz`.
- Señales de ingeniería social: insignias con cifras de descargas y valoración no contrastables, AVISO de falsos positivos de Windows Defender y SmartScreen.
- Riesgo financiero: un bot de trading sin auditoría puede exfiltrar claves privadas o fondos; la gestión local de claves AES-256 no es verificable.
- Licencia MIT declarada sin archivo LICENSE visible ni código asociado que la respalde.
- Idiomas listados en metadatos sin interfaz documentada que los soporte.
- Cero descargas y cero interacciones: ausencia total de validación por parte de la comunidad.
- No debe ejecutarse en máquinas de desarrollo, CI/CD ni entornos con credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maezz/sigma-evm-blast-base-sniper-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/HugoYildirim/sigma-evm-blast-base-sniper-bot
- Releases del repositorio referenciado: https://github.com/HugoYildirim/sigma-evm-blast-base-sniper-bot/releases/latest
- Paquete ZIP citado en la model card: https://github.com/HugoYildirim/sigma-evm-blast-base-sniper-bot/releases/latest/download/sigma-evm-blast-base-sniper-bot-v1.2.0-win64.zip
- Paper, blog o demo: no disponible
