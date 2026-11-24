# jomiko/fragpunk-cheat-aimbot-esp-win11

## Resumen

El repositorio `jomiko/fragpunk-cheat-aimbot-esp-win11` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete de software malicioso disfrazado de "cheat" (aimbot y ESP) para el videojuego Fragpunk, distribuido como un ejecutable de Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`) empaquetado en un archivo ZIP protegido con contraseña. La model card reproduce un README de tipo marketing con distintivos falsos de descargas (381K+), builds y tamaños, y enlaza a un repositorio de GitHub externo (`dawidb9567/delta-executor-pc-2026`) desde el que se sirve el binario.

No existe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociado. Los tags del repositorio (`windows`, `x64`, `portable`, `fragpunk-cheat-aimbot-esp-win11`) y la ausencia total de ficheros de modelo confirman que se ha utilizado Hugging Face como plataforma de distribución de un ejecutable de terceros, no como repositorio de un modelo. La licencia declarada es MIT, pero el contenido real no es código abierto verificable ni un artefacto de IA.

Desde la perspectiva de un editor técnico, esta ficha debe documentar el artefacto como lo que es: un binario potencialmente peligroso que no debe ejecutarse, con indicadores claros de ingeniería social (contraseña de extracción para evadir análisis automáticos, instrucciones de "whitelist" en Windows Defender, enlaces a releases de GitHub ajenos al repositorio de HF). No procede evaluar capacidades, benchmarks ni requisitos de hardware de un modelo inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin justificación técnica) |
| Licencia | MIT (declarada; no verificable sobre el binario distribuido) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene ningún modelo entrenado, dataset, configuración de entrenamiento ni artefacto de inferencia. El contenido descrito en la model card corresponde a un ejecutable de Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`, build declarada `v4.9.4 (1CFB98)`, tamaño declarado 4,8 MB) que el autor presenta como "cheat" para Fragpunk con módulos de aimbot, ESP (cajas 2D/3D, esqueletos de huesos, radar 2D), escáner de offsets y "panic key" de descarga.

Los detalles técnicos que menciona la model card (overlay externo a 144 Hz, respuesta en menos de 38 ms, consumo de RAM inferior a 58 MB, 11 hilos de trabajo) son afirmaciones de marketing no verificables y sin relación con ningún proceso de entrenamiento de IA. No hay información sobre datos, tokenización, RLHF, DPO ni innovaciones de arquitectura.

## Capacidades

- No es un modelo de lenguaje ni multimodal: no genera texto, código, matemáticas ni visión.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; la lista de idiomas en los metadatos es un señuelo para ampliar la superficie de búsqueda.
- El binario declarado incluye funcionalidades de trampa en videojuegos (aimbot, ESP, radar), que constituyen una violación de los términos de servicio de Fragpunk y de la mayoría de plataformas de juego.
- Indicadores de riesgo: contraseña de extracción fija (`2026`), instrucciones para desactivar o evitar Windows Defender/SmartScreen, enlace de descarga a un repositorio de GitHub distinto del declarado en HF.

## Casos de uso

- Ninguno legítimo. El artefacto no es apto para ningún uso productivo, académico ni de investigación.
- Análisis forense defensivo: un equipo de seguridad puede estudiar el binario en un entorno aislado (sandbox, máquina virtual sin red) para extraer indicadores de compromiso (IoC), hashes, dominios de C2 y técnicas de evasión.
- Concienciación en equipos de desarrollo: sirve como ejemplo documentado de repositorio de Hugging Face utilizado para distribuir malware bajo apariencia de modelo o herramienta.
- Entrenamiento de clasificadores de abuso: los metadatos y el README pueden incorporarse a un corpus para detectar patrones de repositorios maliciosos en plataformas de modelos.
- Monitorización de cadena de suministro: permite ilustrar por qué conviene verificar que un repositorio de HF contiene realmente pesos (`safetensors`, `GGUF`) y no ejecutables.
- Respuesta a incidentes: si un usuario ha descargado y ejecutado el binario, el análisis del paquete ayuda a determinar el alcance de la infección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro tipo porque no hay modelo subyacente. Las cifras que aparecen en la model card (38 ms, 13 ms, 44 MB, 31 MB, 58 MB, 11 hilos) son afirmaciones del autor sobre el ejecutable, no resultados de evaluación reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del README no son verificables.
- Requisitos del binario declarado: Windows 10/11 de 64 bits, ejecución como administrador, extracción previa del ZIP con contraseña `2026`. Estas condiciones incrementan el riesgo de seguridad y no deben cumplirse en ningún sistema real.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Si se compara con repositorios legítimos de modelos open source (por ejemplo, pesos en `safetensors` con model card técnica, evaluación y licencia verificable), la diferencia es categórica: aquí no hay pesos, no hay evaluación y no hay trazabilidad del binario.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, código o razonamiento es infundada.
- Riesgo alto de malware: el patrón (ZIP con contraseña, ejecutable como administrador, instrucciones para evitar Defender/SmartScreen, descarga desde un repositorio de GitHub distinto) es típico de troyanos, stealers de credenciales y ransomware.
- La licencia MIT declarada no otorga ninguna garantía ni responsabilidad al autor; el binario no es auditable.
- El uso de cheats en Fragpunk puede conllevar el baneo permanente de la cuenta y, en algunas jurisdicciones, consecuencias legales.
- Los enlaces a releases de GitHub apuntan a un repositorio (`dawidb9567/delta-executor-pc-2026`) que no coincide con el ID de Hugging Face (`jomiko/...`), lo que indica suplantación o cadena de distribución opaca.
- Los contadores de descargas y likes del repositorio de HF son 0, lo que contradice el distintivo "381K+ downloads" del README: señal adicional de contenido fabricado.
- No debe ejecutarse en ningún equipo de producción, de desarrollo ni personal. Si se ha ejecutado, se recomienda aislar el sistema, rotar credenciales y realizar un análisis antimalware completo.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/jomiko/fragpunk-cheat-aimbot-esp-win11
- Repositorio de GitHub referenciado en el README (no verificado, potencialmente malicioso): https://github.com/dawidb9567/delta-executor-pc-2026
- Release referenciada en el README (no descargar): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Página de releases del autor declarado en el README: https://github.com/dawidpham/fragpunk-cheat-aimbot-esp-win11/releases/latest
