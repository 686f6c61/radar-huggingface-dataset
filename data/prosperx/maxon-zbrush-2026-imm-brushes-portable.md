# prosperX/maxon-zbrush-2026-imm-brushes-portable

## Resumen

El repositorio `prosperX/maxon-zbrush-2026-imm-brushes-portable` no contiene un modelo de inteligencia artificial. A pesar de su alojamiento en Hugging Face y de las etiquetas que declara (`windows`, `windows-11`, `x64`, `portable`), la model card describe un supuesto ejecutable de Windows distribuido como archivo ZIP (`delta-executor-pc-2026-v1.2.2-win64.zip`, 4,8 MB) protegido con contraseña y alojado en un repositorio de GitHub de terceros. No se declara arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia.

El contenido se presenta como un "roblox executor" (herramienta de inyección de scripts en el cliente de Roblox) y emplea técnicas habituales de ingeniería social: insignias de "99% verificado", contadores de descargas inflados ("800K+"), instrucciones para ejecutar el binario como administrador, indicaciones para desactivar o sortear Windows Defender y SmartScreen, y una contraseña de archivo que evita el análisis estático por parte de antivirus. La etiqueta de licencia `mit` y el listado de catorce idiomas no guardan relación con ningún artefacto de IA.

Desde la perspectiva de evaluación de modelos, este repositorio es irrelevante: no es un modelo de lenguaje, visión ni multimodal, no publica benchmarks, no ofrece pesos descargables en formatos estándar (safetensors, GGUF) y no dispone de documentación técnica verificable. Se documenta aquí únicamente para dejar constancia de su naturaleza y advertir de los riesgos asociados a su descarga y ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin relación con capacidades reales) |
| Licencia | mit (declarada) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` de 4,8 MB, no pesos de modelo) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. La model card no menciona transformer, MoE, SSM ni ningún otro paradigma de red neuronal, ni tampoco dataset, número de tokens, proceso de alineación (RLHF/DPO) o técnica de entrenamiento alguna. El contenido técnico descrito se refiere a supuestas funcionalidades de un ejecutable: "auto-execute directory", "integrated script hub", "instant client attach", "Luau VM bridge", "multi-instance attach" y "post-patch offset sync" con latencias declaradas de 8 a 27 ms y un sondeo de 141 Hz. Estos términos pertenecen al ámbito de la inyección de scripts en clientes de videojuegos, no al entrenamiento o inferencia de modelos.

El binario se distribuye comprimido con contraseña (`2026`) y se enlaza desde un repositorio de GitHub ajeno al espacio de nombres del autor en Hugging Face. La discrepancia entre el identificador del repositorio citado en la propia model card (`MepageHas93/...`) y el identificador real en Hugging Face (`prosperX/...`), junto con la referencia a un proyecto distinto (`dawidb9567/delta-executor-pc-2026`), indica una cadena de redistribución no verificable.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El multilingüismo indicado en los metadatos (catorce idiomas) no está respaldado por ningún artefacto lingüístico ni evaluación.
- Las únicas "capacidades" descritas son funciones de un ejecutable de terceros orientadas a la manipulación del cliente de un videojuego.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, ya que no lo es. Los escenarios que la model card sugiere (ejecución de scripts en Roblox, adjunción a procesos, sincronización de offsets tras parches) quedan fuera del ámbito de esta ficha y conllevan riesgos de seguridad y de incumplimiento de los términos de servicio de la plataforma afectada. No se recomienda su descarga, extracción ni ejecución en ningún entorno, y menos aún con privilegios de administrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras presentes en la model card (latencias de 8-27 ms, sondeo a 141 Hz, consumo de RAM inferior a 35 MB, tamaño de 4,8 MB) corresponden a afirmaciones de marketing sobre un ejecutable y no son verificables ni comparables con métricas de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que inferir).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; no existen pesos ni artefactos compatibles.
- El único requisito declarado es un sistema Windows 10 u 11 de 64 bits con procesador Intel o AMD x64, para ejecutar un binario de procedencia no verificada.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o multimodal sería improcedente.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la ficha de Hugging Face se emplea como vector de distribución de un ejecutable de terceros.
- Indicadores claros de riesgo: archivo comprimido con contraseña para evadir el escaneo automático, instrucciones para ejecutar como administrador, recomendaciones de excluir el directorio en Windows Defender y de ignorar alertas de SmartScreen.
- Suplantación de identidad de marca: el nombre hace referencia a Maxon ZBrush, software comercial de escultura digital, sin relación con el contenido distribuido.
- Inconsistencia entre el repositorio de GitHub enlazado y el identificador del repositorio en Hugging Face, lo que impide verificar la cadena de custodia del binario.
- La licencia MIT declarada no otorga garantías sobre el contenido ni exime de responsabilidad al usuario que ejecute el binario.
- Riesgo elevado de malware, robo de credenciales o instalación de software no deseado; se desaconseja totalmente su uso en producción y en equipos personales.
- Uso potencialmente contrario a los términos de servicio de plataformas de videojuegos y a la legislación aplicable sobre acceso no autorizado a sistemas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/prosperX/maxon-zbrush-2026-imm-brushes-portable
- Repositorio de GitHub enlazado en la model card: https://github.com/dawidb9567/delta-executor-pc-2026
- Repositorio de GitHub alternativo citado en la model card: https://github.com/MepageHas93/maxon-zbrush-2026-imm-brushes-portable
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional verificable en la información disponible.
