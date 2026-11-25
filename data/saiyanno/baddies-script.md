# Saiyanno/baddies-script

## Resumen

`Saiyanno/baddies-script` no es un modelo de inteligencia artificial. Es un repositorio de Hugging Face cuyo contenido es una model card que distribuye un ejecutable de Windows (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como "script" para juegos, con módulos de ESP, aimbot, teleport y automatización de farmeo. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

Los metadatos de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`, licencia MIT, catorce idiomas declarados) describen el binario, no un modelo. No hay pipeline declarado, cero descargas y cero likes en el momento de la consulta. La fecha de creación y actualización indicada es 2026-11-24.

Desde el punto de vista de evaluación técnica, el artefacto es irrelevante como modelo y presenta señales claras de riesgo: distribución de un ejecutable ofuscado mediante contraseña de archivo, instrucciones para desactivar advertencias de Windows Defender/SmartScreen, enlaces de descarga alojados en repositorios de GitHub de terceros ajenos al autor declarado y afirmaciones de rendimiento no verificables. No debe ejecutarse en entornos de desarrollo ni de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, no verificables) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; tamano declarado 4,8 MB) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de alineamiento (RLHF/DPO) ni innovación técnica de inferencia que documentar. La model card describe, en su lugar, un ejecutable con módulos denominados "frame-rate optimizer", "automated farm loop", "3D entity & chest ESP", "low-ping server hopper", "coordinate teleport" y "persistent JSON config", con cifras de sondeo como 467 Hz y 466 Hz que no corresponden a ninguna métrica de modelo.

El repositorio no incluye `config.json`, `tokenizer.json`, ficheros `safetensors` ni `GGUF`. Cualquier ficha técnica de modelo basada en este identificador carecería de sustento.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas son etiquetas de metadatos.
- No hay modo "thinking", audio ni multimodalidad.
- El contenido distribuido se presenta como utilidad de trampas para videojuegos (ESP, aimbot, teleport), lo que queda fuera del ámbito de esta ficha y conlleva riesgos de seguridad y de cumplimiento de términos de servicio.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA. Los escenarios que la model card sugiere (automatización de farmeo, ESP, aimbot, salto de servidores) implican manipulación de clientes de juego y vulneran habitualmente los términos de servicio de las plataformas, además de exponer al usuario a ejecución de código no auditado. Se recomienda no desplegar el artefacto en ningún entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (467 Hz, 466 Hz, 7 hilos, menos de 9 ms) son afirmaciones de marketing del binario, no métricas de modelo, y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del README no son medibles ni auditables.
- Requisito declarado del artefacto: Windows 10/11 de 64 bits, ejecución como administrador.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable: el repositorio no contiene un modelo de lenguaje ni un artefacto de inferencia. Frente a repositorios legítimos de modelos abiertos (pesos, tokenizador, licencia verificable, benchmarks publicados), este identificador no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con criterios de parámetros, contexto, cuantización o benchmarks.
- Distribución de un ejecutable ofuscado con contraseña de archivo (`2026`), práctica que dificulta la inspección y el análisis estático.
- Instrucciones explícitas para desactivar o sortear Windows Defender y SmartScreen, señal de alarma de seguridad.
- Enlaces de descarga alojados en repositorios de GitHub de terceros no vinculados al autor declarado en Hugging Face.
- Cero descargas y cero likes: sin evidencia de uso ni de revisión por la comunidad.
- Riesgo elevado de malware, robo de credenciales o minado no consentido si se ejecuta.
- Uso potencialmente contrario a los términos de servicio de plataformas de juego y a la legislación aplicable en materia de trampas y distribución de software.
- La licencia MIT declarada en metadatos no cubre necesariamente el binario distribuido por terceros.
- No apto para producción, investigación ni evaluación comparativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Saiyanno/baddies-script
- Repositorio de GitHub citado en la model card (tercero, no verificado): https://github.com/UyenJansen57681/baddies-script
- Repositorio de GitHub citado para la descarga (tercero, no verificado): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026
- Paper, blog, demo o repositorio oficial del modelo: no disponible
