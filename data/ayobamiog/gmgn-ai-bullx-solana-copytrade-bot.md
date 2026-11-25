# Ayobamiog/gmgn-ai-bullx-solana-copytrade-bot

## Resumen

La entrada de Hugging Face `Ayobamiog/gmgn-ai-bullx-solana-copytrade-bot` no corresponde a un modelo de inteligencia artificial en el sentido habitual del término. Se trata de un repositorio que distribuye un ejecutable para Windows de 64 bits (un supuesto bot de copytrading para la blockchain de Solana), empaquetado en un archivo ZIP de 4,8 MB protegido con contraseña. No hay pesos de modelo, tokenizador, configuración de arquitectura ni pipeline de inferencia declarado en la ficha.

La model card mezcla terminología de trading de criptomonedas (copytrading de "smart money", filtros de honeypot, bundling de wallets mediante Lookup Tables, enrutamiento de órdenes con latencia inferior a 40 ms) con nombres de fichero ajenos al proyecto, como `robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip` y `robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`. Esa discrepancia entre el nombre del repositorio y el del binario distribuido es una señal de alarma clara sobre la procedencia y la integridad del contenido.

El repositorio no tiene descargas ni "likes", se creó y actualizó en la misma marca temporal (2026-11-24) y no declara pipeline. Desde el punto de vista de evaluación de modelos, no hay nada que medir: ni parámetros, ni contexto, ni benchmarks, ni licencia de pesos (la licencia MIT declarada aplica, en todo caso, al contenido del repositorio, no a un modelo inexistente). Esta ficha documenta el artefacto tal como aparece publicado y advierte de los riesgos asociados a su instalación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, conjunto de datos de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de modelado. La model card enumera módulos funcionales de un supuesto bot de trading: espejo de wallets de ballenas con dimensionado proporcional, sandbox de paper trading contra libros de órdenes en vivo, bundler de 20 wallets mediante Lookup Tables de Solana, take profit multinivel con trailing stop, enrutamiento de órdenes por WebSocket y gRPC, y un filtro previo a la compra que verifica autoridades de mint/freeze y bloqueo de liquidez.

Todos esos datos provienen exclusivamente del texto promocional del autor y no están respaldados por código fuente, binarios reproducibles, hashes verificables ni auditoría alguna. El binario declarado (`robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`) ni siquiera comparte nombre con el proyecto, lo que impide atribuirle ninguna funcionalidad concreta. No hay información sobre el lenguaje de implementación, dependencias, mecanismo de conexión a la red de Solana ni gestión de claves privadas.

## Capacidades

- No se puede confirmar ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión: no hay modelo subyacente identificado.
- La model card atribuye al ejecutable funciones de copytrading automatizado en Solana, con espejo de operaciones de wallets monitorizadas.
- Menciona un modo de simulación ("paper trade sandbox") contra libros de órdenes en vivo, sin riesgo de capital según el autor.
- Declara ejecución multibilletera en el mismo bloque mediante Lookup Tables (hasta 20 wallets).
- Declara gestión automática de salidas con take profit escalonado y trailing stop.
- Declara filtros previos a la compra basados en autoridades de mint/freeze y estado del pool de liquidez.
- No hay evidencia de soporte de tool calling, function calling, agentes ni modos de razonamiento, porque no hay modelo.
- El soporte multilingüe se limita a los códigos de idioma listados en los metadatos; no se especifica si el ejecutable tiene interfaz en esos idiomas.

## Casos de uso

Ninguno de los siguientes casos está respaldado por documentación técnica verificable; se enumeran únicamente como escenarios que el autor atribuye al artefacto, con la advertencia de que su funcionamiento real es desconocido.

- Copytrading de wallets de "smart money" en Solana: el autor afirma que el bot replica operaciones de direcciones monitorizadas con dimensionado proporcional; no hay forma de verificar el mecanismo ni la latencia real.
- Simulación de estrategias sin capital: se describe un sandbox de paper trading contra libros de órdenes en vivo, útil en teoría para validar reglas antes de operar con fondos reales.
- Ejecución multibilletera coordinada: el bundler de 20 wallets con Lookup Tables se orienta a lanzamientos y compras coordinadas en el mismo bloque, un patrón habitual en operaciones de sniping.
- Gestión automatizada de salidas: take profit multinivel y trailing stop para reducir la exposición manual durante operaciones abiertas.
- Filtrado de tokens fraudulentos: verificación de autoridades de mint/freeze y bloqueo de liquidez antes de comprar, orientada a evitar honeypots.
- Enrutamiento de baja latencia: streaming de transacciones por WebSocket y gRPC para reducir el tiempo entre señal y envío de la orden.

En ningún caso se recomienda ejecutar el binario en un equipo con claves privadas o fondos, dado que no existe verificación de integridad ni auditoría pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras que aparecen en la model card son afirmaciones del autor sin metodología ni evidencia: latencia de enrutamiento inferior a 40 ms (y 29 ms en otro punto), respuesta del bundler inferior a 4 ms, take profit en menos de 20 ms, uso de RAM inferior a 54 MB y 12 hilos de trabajo. No se especifica hardware de referencia, tamaño de las transacciones ni condiciones de red, por lo que no son comparables ni reproducibles.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card; se indica ejecución nativa en procesadores Intel y AMD x64.
- VRAM: no aplica; no hay modelo neuronal que cargar en GPU.
- GPU recomendadas: no disponible (el artefacto no declara uso de GPU).
- RAM: el autor afirma un consumo inferior a 54 MB, cifra no verificada.
- Almacenamiento: el paquete ZIP ocupa 4,8 MB según la ficha.
- Opciones de despliegue: únicamente ejecución del `.exe` en Windows; no hay soporte de vLLM, llama.cpp, Ollama, TGI ni ningún runtime de inferencia.
- Latencia y throughput: no verificables; las cifras del autor carecen de contexto de medición.

## Comparativa con modelos similares

No procede una comparativa con modelos de lenguaje, porque el artefacto no es un modelo. Frente a otras entradas de Hugging Face de naturaleza similar (repositorios que distribuyen ejecutables empaquetados con contraseña), las diferencias relevantes son las siguientes:

| Aspecto | Este repositorio | Repositorio típico de modelo open source |
|---|---|---|
| Contenido | ZIP de 4,8 MB con un `.exe` | Pesos en safetensors/GGUF, tokenizador, config |
| Pesos | no disponibles | Descargables y verificables por hash |
| Pipeline declarado | no disponible | text-generation, image-text-to-text, etc. |
| Reproducibilidad | nula (binario cerrado, contraseña en el README) | alta (código y pesos públicos) |
| Descargas / likes | 0 / 0 | Métrica pública de adopción |
| Auditoría | ninguna | variable, pero inspeccionable |

## Limitaciones y advertencias

- No es un modelo de IA: no hay arquitectura, pesos ni pipeline que evaluar; la ficha de Hugging Face se usa como canal de distribución de software.
- Discrepancia grave de nombres: el repositorio se llama `gmgn-ai-bullx-solana-copytrade-bot`, pero el binario distribuido se llama `robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`, un nombre asociado a presuntos "trainers" o "aimbots" de videojuegos. Es un patrón habitual en campañas de malware.
- Distribución con contraseña en el archivo ZIP: técnica que dificulta el análisis automático por parte de antivirus y servicios de escaneo.
- Enlaces de descarga alojados en repositorios de GitHub de terceros no vinculados al autor del repositorio de Hugging Face.
- Solicitud de ejecución "como administrador": eleva los privilegios del binario sin justificación técnica.
- Cero descargas, cero "likes" y fecha de creación igual a la de actualización: sin historial ni comunidad que respalde el artefacto.
- Riesgo financiero directo: un bot de trading con acceso a claves privadas de wallets de Solana puede vaciar fondos; no hay auditoría ni código fuente.
- Riesgo de seguridad: un ejecutable sin firma, sin hash publicado y sin código fuente puede contener cualquier carga maliciosa (stealer, ransomware, minero).
- La licencia MIT declarada no aporta ninguna garantía sobre el binario ni sobre su comportamiento.
- No se debe interpretar el listado de idiomas como soporte real de interfaz o documentación.
- Cualquier afirmación de rendimiento (latencias, RAM, hilos) es publicidad del autor sin evidencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ayobamiog/gmgn-ai-bullx-solana-copytrade-bot
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026/releases/download/v1.2.0/robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de releases citado en la model card: https://github.com/ivanmustafa/gmgn-ai-bullx-solana-copytrade-bot/releases/latest
- Paper, blog, demo o código fuente: no disponible
