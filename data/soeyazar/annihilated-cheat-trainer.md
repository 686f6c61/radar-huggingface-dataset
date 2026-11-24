# Soeyazar/annihilated-cheat-trainer

## Resumen

El repositorio `Soeyazar/annihilated-cheat-trainer` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete de software ejecutable para Windows de 64 bits, distribuido como archivo ZIP (`delta-executor-pc-2026-v1.2.2-win64.zip`, 4,8 MB) y promocionado como "cheat trainer" o herramienta de trampas para videojuegos. La model card describe módulos de escaneo de offsets en memoria, radar 2D, filtro de loot, overlay externo a 144 Hz y una capa de renderizado "stream-proof" diseñada para evadir la captura de OBS, ShadowPlay y Discord.

El artefacto no incluye pesos, tokenizador, configuración de arquitectura ni ningún componente propio de un modelo de lenguaje, visión o multimodal. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) confirman que se trata de un binario portable, no de un modelo entrenado. El pipeline no está disponible y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

La relevancia de esta ficha es fundamentalmente de advertencia: el contenido presenta indicios claros de distribución de malware (archivo comprimido con contraseña para evadir análisis automatizados, enlaces a binarios alojados en un repositorio de GitHub de terceros con nombre distinto al del repositorio de Hugging Face, instrucciones para ejecutar como administrador y desactivar protecciones de SmartScreen). No debe tratarse como un modelo open source ni ejecutarse en ningún entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable en el artefacto) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card describe funcionalidades de un programa de trampas para juegos: escáner dinámico de offsets con "99,5 % de consistencia", radar 2D con filtro de loot basado en rareza, overlay externo a 144 Hz con cajas 2D/3D y esqueletos de huesos, y una tecla de pánico (`END`) para descarga inmediata. Ninguno de estos elementos constituye un modelo entrenado ni dispone de dataset, tokens de entrenamiento, RLHF o DPO.

El binario declarado (`delta-executor-pc-2026-v1.2.2-win64.exe`, build `v1.3.4`, identificador `FC484B3AC0`) se distribuye comprimido con contraseña `2026` y requiere ejecución como administrador. La model card indica un consumo de RAM inferior a 61-63 MB, dato coherente con una herramienta de manipulación de memoria de proceso y no con un modelo de lenguaje.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües reales; los códigos de idioma de los metadatos son etiquetas de descubrimiento, no una indicación de competencia lingüística del artefacto.
- Funcionalidades declaradas por el autor (no verificadas y de naturaleza maliciosa): escaneo de offsets en memoria, radar 2D, filtro de loot, overlay externo, perfiles JSON intercambiables y capa de renderizado excluida de capturas de pantalla.

## Casos de uso

Ninguno de los escenarios siguientes constituye un uso legítimo del artefacto; se enumeran para documentar qué declara el autor y por qué resultan inaceptables en cualquier entorno de desarrollo o investigación:

- Manipulación de memoria de procesos de terceros: el ejecutable declara escanear y resolver punteros en la memoria de un juego para alterar su comportamiento, lo que vulnera los términos de servicio de la práctica totalidad de plataformas y puede constituir una infracción legal según jurisdicción.
- Evasión de sistemas de captura: la capa "stream-proof" está diseñada explícitamente para ocultar la actividad a OBS, ShadowPlay y Discord, lo que impide la supervisión y la auditoría.
- Distribución de binarios con contraseña: el ZIP protegido con la clave `2026` impide el análisis estático por parte de antivirus y sandboxes, técnica habitual en campañas de malware.
- Ejecución con privilegios elevados: las instrucciones piden "Run as Administrator", lo que otorga al binario control total sobre el sistema anfitrión.
- Redirección a repositorios de terceros: el enlace de descarga apunta a `github.com/dawidb9567/delta-executor-pc-2026`, un repositorio distinto del declarado en Hugging Face, lo que rompe la cadena de confianza y la trazabilidad del artefacto.
- Uso como señuelo en campañas de ingeniería social: la ficha emplea insignias falsas (643 K descargas, valoración 5,0/5) para generar confianza en usuarios que buscan herramientas de trampas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones de ningún tipo, y los porcentajes de "consistencia" que aparecen en la model card (99,5 %, 96,9 %, 97,8 %) son afirmaciones publicitarias del autor sin metodología, sin conjunto de datos y sin posibilidad de verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo de IA.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Plataforma objetivo declarada: Windows 10/11 de 64 bits, procesadores Intel y AMD x64.
- Consumo declarado: menos de 61-63 MB de RAM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos comparables" para este artefacto, ya que no es un modelo de IA. Frente a modelos open source reales (por ejemplo, familias Llama, Mistral, Qwen o Gemma), la comparación carece de sentido: este repositorio no ofrece pesos, arquitectura, contexto ni evaluación alguna. La única comparación pertinente es con otras campañas de distribución de malware disfrazadas de herramientas para juegos, patrón bien documentado en informes de seguridad.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural. Cualquier expectativa de uso como modelo es un error de categoría.
- Riesgo de malware elevado: el patrón (ZIP con contraseña, binario `.exe`, ejecución como administrador, instrucciones para sortear SmartScreen y Defender, alojamiento en repositorio de terceros) coincide con tácticas habituales de troyanos, stealers e infostealers.
- Integridad no verificable: el enlace de descarga apunta a un repositorio distinto del autor declarado, sin firmas ni hashes publicados.
- Métricas falsas o no verificables: las insignias de descargas (643 K) y valoración (5,0/5) no se corresponden con las 0 descargas y 0 likes registrados por Hugging Face.
- Licencia MIT declarada: aunque técnicamente permisiva, la licencia no legitima el uso del software para vulnerar términos de servicio de terceros ni para actividades ilícitas; la responsabilidad legal recae en el usuario.
- Riesgo reputacional y legal: el uso en entornos corporativos o académicos puede contravenir políticas internas de seguridad y normativa de protección de sistemas.
- Recomendación: no descargar, no extraer y no ejecutar el archivo. Si ya se ha ejecutado, se recomienda aislar el equipo, rotar credenciales y realizar un análisis forense.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Soeyazar/annihilated-cheat-trainer
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/Onurw90645/annihilated-cheat-trainer
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Paper: no disponible
- Blog o demo: no disponible
