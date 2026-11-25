# asdvhex12/gmgn-copy-trade-bot-solana-smart-money

## Resumen

La entrada `asdvhex12/gmgn-copy-trade-bot-solana-smart-money` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un ejecutable para Windows (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`) empaquetado en un archivo ZIP protegido con contraseña, publicitado como "bot de copy trading" para Solana. El contenido de la model card no describe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia: describe instrucciones de instalación de un binario, requisitos de sistema operativo y supuestas capacidades de inyección de scripts.

El texto mezcla terminología ajena a un modelo de lenguaje (compatibilidad "sUNC", `hookmetamethod`, `getgc`, `Drawing API`, "aimbot", "ESP") con reclamos de marketing sobre un bot de trading. Los enlaces de descarga apuntan a un repositorio de GitHub distinto al declarado (`rocha1838/deadlock-cheat-esp-aimbot-2026`), lo que constituye una inconsistencia grave de procedencia. No existe información verificable sobre parámetros, contexto, cuantizaciones ni licencia de pesos.

Desde la perspectiva de evaluación técnica, este repositorio debe clasificarse como no apto para uso como modelo: no hay artefactos de modelo, y el patrón de distribución (binario opaco para Windows, contraseña en el propio README, enlaces cruzados a repositorios de terceros) coincide con campañas habituales de distribución de software no verificado. La ficha se completa a continuación con los campos marcados como "no disponible" donde corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT (declarada en metadatos; no aplicable a pesos inexistentes) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El artefacto distribuido es un ejecutable compilado para Windows 10 (22H2) y Windows 11 (24H2), empaquetado en `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip` con contraseña `2026`. La model card menciona "multi-instance attach", "post-patch offset sync", "keyless execution flow" y "script hub", terminología propia de herramientas de inyección en procesos, no de entrenamiento de redes neuronales.

No se declara número de tokens de entrenamiento, composición de dataset, ni fases de RLHF, DPO o SFT. Tampoco se documenta tokenizador, función de pérdida ni técnica de alineación alguna. Cualquier afirmación sobre entrenamiento sería especulativa y no se incluye.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El repositorio declara soporte multilingüe a nivel de metadatos (14 idiomas), sin evidencia de capacidades lingüísticas reales.
- El texto menciona funciones de "script hub", "auto-execute directory" y sincronización de offsets, sin especificación técnica verificable.

## Casos de uso

- Ninguno recomendado en el contexto de evaluación de modelos de IA: no hay modelo que desplegar.
- Auditoría de seguridad: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento real antes de cualquier consideración de uso.
- Estudio de patrones de distribución maliciosa: el repositorio sirve como ejemplo de técnica de ingeniería social (contraseña en README, enlaces a repos de terceros, nombres de proyecto inconsistentes) para formación en seguridad.
- Verificación de procedencia: comprobar la cadena de custodia entre el repo de Hugging Face, el repo de GitHub enlazado y el binario final.
- Monitorización de ecosistema: incluir este tipo de repositorios en listas de bloqueo o filtros de ingesta de datasets para evitar contaminación de pipelines.
- Documentación interna: registrar el caso como ejemplo de "modelo" que no lo es, para mejorar criterios de curación en catálogos de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de marketing ("98%+ sUNC", "96,4% consistency", "297 Hz polling", "< 21 ms response time", "471K+ downloads", "4.9/5 rating") que no son benchmarks de modelo y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos declarados del binario: Windows 10 (22H2) o Windows 11 (24H2), arquitectura x64, archivo ZIP de 4,8 MB.
- Latencia y throughput: no disponibles; las cifras de la model card no son medibles ni reproducibles.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable porque el artefacto no es un modelo de IA. Como referencia de contraste:

| Criterio | Este repositorio | Modelo de lenguaje típico |
|---|---|---|
| Pesos publicados | No | Sí (safetensors, GGUF) |
| Arquitectura documentada | No | Sí (transformer, MoE, etc.) |
| Pipeline de inferencia | No | Sí |
| Reproducibilidad | No | Sí, con hardware adecuado |
| Licencia sobre pesos | No aplica | MIT, Apache-2.0, etc. |

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni código de inferencia.
- Procedencia inconsistente: el repo de Hugging Face (`asdvhex12/...`) enlaza a un repo de GitHub de otro autor (`rocha1838/deadlock-cheat-esp-aimbot-2026`) y menciona un tercero (`Matuda81895/...`).
- Distribución de binario opaco para Windows con contraseña en el propio README: patrón habitual en campañas de malware y software no verificado.
- Terminología de la model card ("aimbot", "ESP", "hookmetamethod", "getgc") asociada a herramientas de trampa en videojuegos, no a trading ni a IA.
- Riesgo elevado de phishing, robo de credenciales de wallets o instalación de software no deseado si se ejecuta el binario.
- La licencia MIT declarada no otorga garantías sobre el contenido ni sobre el binario distribuido.
- Cero descargas y cero likes en el momento de la consulta, sin evidencia de uso legítimo.
- No usar en producción, ni en pipelines de datos, ni como fuente para entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/asdvhex12/gmgn-copy-trade-bot-solana-smart-money
- Repo de GitHub enlazado en la model card: https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026
- Repo de GitHub alternativo mencionado: https://github.com/Matuda81895/gmgn-copy-trade-bot-solana-smart-money
- Enlace de descarga directa citado en la model card: https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Papers, blogs, demos: no disponibles.
