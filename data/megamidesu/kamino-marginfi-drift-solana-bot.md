# Megamidesu/kamino-marginfi-drift-solana-bot

## Resumen

`Megamidesu/kamino-marginfi-drift-solana-bot` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete binario para Windows (ejecutable `.exe` y archivo `.zip` de 8,9 MB) presentado como un bot de trading para protocolos DeFi de Solana (Kamino, Marginfi y Drift). El repositorio no incluye pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje; la model card describe instrucciones de instalación de software y no parámetros de red neuronal.

La ficha se redacta, por tanto, como evaluación técnica del artefacto y advertencia para desarrolladores e investigadores: no es un modelo que pueda cargarse con `transformers`, `vLLM` ni `llama.cpp`, y no dispone de pipeline declarado. La ausencia total de descargas y de "likes" en el momento de la consulta, junto con la estructura de la model card (instrucciones para ejecutar un binario como administrador, contraseña de descompresión y enlaces a un repositorio de GitHub de terceros), son señales compatibles con una distribución de software potencialmente malicioso etiquetada como modelo.

Es relevante ahora porque ilustra un patrón de abuso de plataformas de modelos abiertos para distribuir ejecutables: el repositorio usa los campos `tags` y `language` propios de Hugging Face (incluyendo 14 idiomas y la etiqueta `license:mit`) para aparentar legitimidad, sin que exista ningún componente de IA verificable. Cualquier evaluación de este artefacto debe tratar el binario como no fiable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de IA; es un paquete binario para Windows) |
| Parámetros totales | No disponible (no existe modelo de parámetros) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, no verificable como capacidad del artefacto) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | No disponible (el artefacto distribuido es un `.zip` con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card no menciona transformer, MoE, SSM ni ningún otro paradigma; tampoco indica número de tokens de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones de inferencia. El contenido técnico declarado corresponde a un supuesto bot de trading: motor de bundles Jito/MEV, copia de operaciones de "smart money", filtro de honeypots, bundler de 20 wallets mediante Lookup Tables y enrutado de órdenes por WebSocket y gRPC.

Los únicos datos verificables del repositorio son metadatos de plataforma: fecha de creación 2026-11-23, actualización 2026-11-24, 0 descargas y 0 "likes". La model card incluye además afirmaciones no auditables (398K descargas, build `v3.2.3 (639761)`, contraseña de descompresión `2026`) y enlaces de descarga a un repositorio de GitHub externo (`SemazoQa56/kamino-marginfi-drift-solana-bot`), lo que sitúa la cadena de suministro fuera de Hugging Face.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte verificable de tool calling ni de function calling en el sentido de APIs de modelos.
- No hay soporte de agentes ni de razonamiento multi-paso basado en un modelo de lenguaje.
- El multilingüismo declarado (14 idiomas) aparece solo como etiqueta de metadatos, sin evidencia de implementación.
- Las capacidades declaradas en la model card son funcionalidades de un supuesto bot de trading (bundles Jito/MEV, copytrade, filtro de honeypots, paper trading), no capacidades de IA y sin verificación independiente.
- No dispone de modo "thinking", audio, visión ni ninguna modalidad de modelo fundacional.

## Casos de uso

- **Auditoría de seguridad de artefactos en Hugging Face**: usar este repositorio como caso de estudio para formar a equipos en la detección de paquetes que se hacen pasar por modelos, revisando metadatos, ausencia de pesos y enlaces externos antes de cualquier descarga.
- **Diseño de políticas de ingesta en pipelines de MLOps**: implementar comprobaciones automáticas que rechacen repositorios sin `config.json`, sin `safetensors`/GGUF y con binarios ejecutables, tomando este artefacto como ejemplo de rechazo.
- **Formación en cadena de suministro de software**: analizar en entornos aislados cómo se estructura una model card que imita badges de descargas y contraseñas de descompresión para inducir a ejecutar un `.exe` como administrador.
- **Investigación sobre abuso de plataformas**: documentar patrones de etiquetado engañoso (licencia MIT, 14 idiomas, tags de Windows) en repositorios sin contenido de IA para alimentar clasificadores de contenido malicioso.
- **Concienciación de equipos de trading cuantitativo**: advertir de que los bots DeFi distribuidos como binarios cerrados con contraseña de archivo no son auditables y no deberían ejecutarse en máquinas con claves de wallet.
- **Verificación de claims de rendimiento**: contrastar afirmaciones como "sub-40 ms de enrutado" o "< 28 MB de RAM" frente a la ausencia de código fuente y de benchmarks reproducibles, como ejercicio de escepticismo técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque el artefacto no es un modelo. Las cifras de la model card (latencia `< 12 ms`, sondeo a `443 Hz`/`424 Hz`, consumo `< 28 MB`/`< 38 MB` de RAM) son afirmaciones del autor sin metodología, código ni reproducción independiente, por lo que no se recogen como resultados verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada del binario: Windows 10 (22H2) y Windows 11 (24H2), x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un `.exe` que la model card indica ejecutar como administrador.
- Latencia y throughput: no disponibles de forma verificable; las cifras del autor no son auditables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Frente a un modelo de lenguaje real de tamaño pequeño (por ejemplo, un modelo de 1-3B parámetros con pesos `safetensors` y licencia permisiva), las diferencias son estructurales: aquí no hay parámetros, contexto, benchmarks ni formato de pesos, y la distribución se realiza mediante un ejecutable externo.

| Criterio | Este repositorio | Modelo de IA típico en Hugging Face |
|---|---|---|
| Pesos y configuración | Ausentes | `config.json` + `safetensors`/GGUF |
| Parámetros | No aplica | Millones o miles de millones |
| Contexto | No disponible | Declarado en la model card |
| Benchmarks reproducibles | Ninguno | Métricas publicadas |
| Formato de distribución | `.zip` con `.exe` y contraseña | Pesos descargables y auditables |
| Riesgo de seguridad | Alto (binario opaco, ejecución como administrador) | Bajo si se valida el origen |

## Limitaciones y advertencias

- **No es un modelo de IA**: no puede evaluarse con métricas de calidad lingüística, razonamiento o código; cualquier expectativa en ese sentido es infundada.
- **Riesgo de seguridad elevado**: la model card pide ejecutar un `.exe` como administrador y descomprimir con contraseña, prácticas que impiden la inspección previa y facilitan la ejecución de código no auditado.
- **Cadena de suministro externa**: los enlaces de descarga apuntan a un repositorio de GitHub de terceros, no a artefactos alojados en Hugging Face, por lo que la integridad no está garantizada por la plataforma.
- **Metadatos engañosos**: badges de 398K descargas, licencia MIT y 14 idiomas no se corresponden con 0 descargas y 0 "likes" registrados en el repositorio, lo que sugiere una model card fabricada.
- **Riesgo financiero**: un supuesto bot de trading DeFi que solicita claves o se ejecuta en máquinas con wallets expone fondos a robo; no hay código fuente ni auditoría.
- **Sin soporte ni mantenimiento verificable**: no hay issues, discusiones ni historial que permitan evaluar la fiabilidad del autor.
- **Licencia**: aunque se declara MIT, la licencia no aporta garantías sobre el binario ni sobre su comportamiento en ejecución.
- **Recomendación**: no descargar ni ejecutar el artefacto en entornos de producción o con credenciales; si se analiza, hacerlo en una máquina virtual aislada y sin acceso a red ni a wallets.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Megamidesu/kamino-marginfi-drift-solana-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/SemazoQa56/kamino-marginfi-drift-solana-bot
- Releases referenciadas: https://github.com/SemazoQa56/kamino-marginfi-drift-solana-bot/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
