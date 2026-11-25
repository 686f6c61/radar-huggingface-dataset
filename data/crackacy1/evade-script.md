# crackaCY1/evade-script

## Resumen

`crackaCY1/evade-script` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows 10/11 de 64 bits distribuido como archivo ZIP de 4,8 MB (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip`), protegido con la contraseña `2026` y acompañado de un binario `.exe` (build `v2.4.4`, `7FE20E6872`). La model card describe funcionalidades propias de un software de trampas para videojuegos: ESP de entidades 3D, aimbot, teleport por coordenadas, evasión de sistemas antitrampas, alertas por webhook de Discord, anti-AFK y salto automático de servidores.

El problema que dice resolver es la automatización y el ventajismo en juegos multijugador (se mencionan Marvel Rivals y Roblox), no una tarea de procesamiento de lenguaje, visión o generación. No hay arquitectura de red neuronal, pesos, tokenizador, configuración de transformer ni datos de entrenamiento: los tags de Hugging Face (`windows`, `x64`, `portable`, `evade-script`) describen un artefacto binario, no un modelo.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA. Los apartados técnicos que siguen reflejan esa ausencia de información y advierten de los riesgos de seguridad y legales asociados a la distribución. Cualquier dato de rendimiento, benchmarks o requisitos de inferencia es "no disponible" porque no existe inferencia de un modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no se especifica soporte funcional real) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto es un ejecutable nativo de Windows (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, build `v2.4.4`) empaquetado en un ZIP de 4,8 MB. La model card menciona módulos de lectura de memoria directa ("direct-memory"), pulsos de entrada virtual para el anti-AFK, polling a `192 Hz`, teleport por coordenadas y un "server hopper" con respuesta declarada inferior a `37 ms`, además de un consumo de RAM inferior a `51 MB`. No se documenta lenguaje de programación, cadena de compilación, dependencias ni proceso de entrenamiento alguno, porque no aplica.

No hay dataset, tokens, RLHF, DPO ni innovación algorítmica de aprendizaje automático. La única "innovación" declarada es de ingeniería de evasión (evitar detección antitrampas), un ámbito que queda fuera del alcance de esta ficha técnica de modelos.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son metadatos del repositorio.
- Funcionalidades declaradas por el autor (software de trampas, no IA): ESP 3D de entidades y cofres, aimbot, teleport por coordenadas, anti-AFK 24/7, alertas por webhook de Discord, configuración JSON persistente y salto automático de servidores.
- Advertencia: estas funcionalidades violan habitualmente los términos de servicio de los videojuegos y pueden constituir fraude o manipulación de sistemas ajenos.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA. Los escenarios que describe el autor son:

- Automatización de ventaja competitiva en juegos multijugador mediante ESP y aimbot: el autor declara detección de entidades a través de paredes y asistencia de puntería; su uso conlleva expulsión de cuentas y posibles acciones legales según el juego.
- Teleport por coordenadas en mapas de juego: descrito como salto instantáneo a islas, NPC o salas de raid; manipula el estado del cliente y suele ser detectable por los antitrampas.
- Anti-AFK automatizado: pulsos de entrada virtual para evitar la expulsión por inactividad; puede considerarse automatización no permitida.
- Salto automático de servidores para buscar apariciones raras: automatiza la selección de instancias, lo que infringe las normas de muchos juegos.
- Notificaciones por webhook de Discord: envío de eventos de sesión a un canal externo; técnicamente es una integración de mensajería, no una capacidad de IA.
- Configuración persistente con atajos de teclado: guardado y recuperación de perfiles en JSON; funcionalidad de utilidad de escritorio, no de modelo.

Ninguno de estos casos es recomendable para producción ni para entornos profesionales; se documentan únicamente porque aparecen en la información proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque no hay un modelo de IA que evaluar. Las únicas cifras declaradas por el autor son de ingeniería del ejecutable (polling a `192 Hz`, RAM inferior a `51 MB`, respuesta del server hopper inferior a `37 ms`) y no son verificables ni comparables con benchmarks de modelos.

## Requisitos de hardware

- VRAM estimada: no aplica; no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits.
- Espacio en disco: el archivo ZIP ocupa 4,8 MB; el contenido extraído no se detalla.
- Memoria RAM declarada en ejecución: inferior a 51 MB según el autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput de inferencia: no disponible.
- Nota de seguridad: ejecutar binarios de origen desconocido como administrador, con contraseña de archivo y tras desactivar avisos de SmartScreen, es un vector de riesgo elevado de malware.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se han identificado en la información proporcionada alternativas de software con las que establecer una comparación técnica fiable de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal; carece de pesos, tokenizador y pipeline.
- Riesgo de malware: la distribución de un `.exe` con contraseña en el ZIP, la petición de ejecución como administrador y la instrucción de ignorar avisos de Windows Defender y SmartScreen son patrones habituales de campañas maliciosas.
- Riesgo legal: las funcionalidades de trampas, evasión de antitrampas y manipulación de memoria de juegos pueden vulnerar términos de servicio, derechos de autor y normativas de fraude informático.
- Licencia MIT declarada: aunque permite uso comercial según el texto de la licencia, su aplicación a un binario de esta naturaleza no legitima las prácticas descritas ni exime de responsabilidad legal.
- Idiomas: los 14 idiomas listados son metadatos del repositorio; no hay evidencia de soporte funcional multilingüe.
- Sin mantenimiento verificable: cero descargas y cero likes en Hugging Face, creado y actualizado en la misma fecha (2026-11-24), sin historial de versiones ni auditoría.
- No apto para producción: sin garantías de seguridad, soporte, trazabilidad ni cumplimiento normativo.

## Enlaces

- Hugging Face: https://huggingface.co/crackaCY1/evade-script
- Repositorio referenciado en la model card: https://github.com/pPhillips5199/evade-script
- Releases referenciadas: https://github.com/pPhillips5199/evade-script/releases/latest
- Descarga citada por el autor (no recomendada): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
