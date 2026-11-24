# CaptainBinge/arise-crossover-script-auto-farm-portable

## Resumen

El artefacto publicado bajo el identificador `CaptainBinge/arise-crossover-script-auto-farm-portable` no es un modelo de inteligencia artificial. Se trata de un paquete binario para Windows x64 (build `v1.9.6`, código `44CC94`, 4,8 MB) distribuido como archivo ZIP protegido con contraseña, que la propia model card describe como un "game cheat" orientado a automatizar el farmeo en el videojuego Arise Crossover. No contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia.

El repositorio de Hugging Face actúa únicamente como escaparate: el binario real (`lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe`) se aloja en GitHub Releases bajo cuentas de terceros (`Hiroshis198`, `joyce47111`). La model card incluye instrucciones para desactivar advertencias de Windows Defender y SmartScreen, lo que constituye una señal de riesgo de seguridad relevante.

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto ni capacidades cognitivas: no existen. La información se limita a describir el artefacto, sus riesgos y por qué no debe evaluarse como modelo dentro de un catálogo de IA open source.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no verificable en el binario) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni ONNX) |

## Arquitectura y entrenamiento

No aplica. No existe un transformer, MoE, SSM ni modelo híbrido. El contenido descrito en la model card es un ejecutable nativo de Windows que, según el autor, opera en modo usuario ("user-mode external core"), usa Desktop Duplication para renderizar un overlay y realiza escaneo de memoria de otro proceso ("direct-memory dynamic offset scanner"). Estas técnicas son propias de software de trampas para videojuegos, no de sistemas de aprendizaje automático.

No hay dataset de entrenamiento, tokens procesados, RLHF, DPO ni proceso de alineación. Cualquier afirmación sobre "entrenamiento" en este contexto sería inventada.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma del repo son metadatos de etiquetado.
- Las funciones que declara el autor son de automatización de juego: perfiles JSON intercambiables en caliente, tecla de pánico (`END`), radar 2D con filtro de loot, overlay externo a 144 Hz y escáner de offsets tras parches del juego.

## Casos de uso

- No se identifican casos de uso legítimos dentro de un catálogo de modelos de IA.
- Automatización de farmeo en Arise Crossover: el autor lo presenta para ejecutar tareas repetitivas en el juego; implica riesgo de incumplimiento de los términos de servicio del videojuego y posible baneo de cuentas.
- Overlay de información en pantalla: descrito como radar 2D y cajas de delimitación; su uso en juegos multijugador puede constituir trampa.
- Investigación de seguridad ofensiva: podría analizarse en un entorno aislado para estudiar técnicas de escaneo de memoria y overlays, nunca ejecutarlo en una máquina de producción.
- Docencia sobre riesgos de cadena de suministro: sirve como ejemplo de repositorio que enlaza binarios externos con contraseña y pide desactivar protecciones del sistema.
- Auditoría de políticas de Hugging Face: caso de estudio sobre contenido que no debería clasificarse como modelo.
- Ningún caso de uso recomendado para desarrolladores o investigadores que busquen un modelo de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (porcentajes de "consistencia" del 96,7 %, 97,1 %, 97,7 %, polling de 452 Hz, respuesta en menos de 5 ms) son afirmaciones del autor sin metodología verificable y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card.
- VRAM estimada: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplicable; el overlay usa Desktop Duplication, no cómputo tensorial.
- Compatibilidad con GPU de consumo: irrelevante para el artefacto.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; no es compatible con esos runtimes.
- Latencia y throughput: el autor declara 452 Hz de sondeo y menos de 5 ms de respuesta en el cambio de perfiles, sin evidencia independiente.

## Comparativa con modelos similares

| Criterio | Este artefacto | Modelo de lenguaje pequeño típico (p. ej., familia de 7-8B) | Modelo de visión-lenguaje | Herramienta de automatización legítima |
|---|---|---|---|---|
| Naturaleza | Ejecutable de trampas para Windows | Pesos transformer | Pesos multimodales | Script o SDK |
| Parámetros | no disponible | Miles de millones | Miles de millones | no aplica |
| Contexto | no disponible | Miles a cientos de miles de tokens | Similar | no aplica |
| Licencia | MIT declarada | Variable (Apache, Llama, etc.) | Variable | Variable |
| Ejecutable en servidor Linux | No | Sí | Sí | Sí |
| Riesgo de seguridad | Alto (binario externo, contraseña, pide desactivar Defender) | Bajo/medio | Bajo/medio | Bajo |

No se conocen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en evaluaciones de rendimiento, contexto o calidad lingüística.
- Distribución opaca: el binario se descarga desde GitHub Releases de cuentas de terceros, no desde Hugging Face, y el ZIP está protegido con la contraseña `2026`, lo que impide inspección previa y favorece la evasión de análisis automatizados.
- La model card instruye explícitamente a ignorar advertencias de Windows Defender y SmartScreen, práctica asociada a malware y a falsos positivos indistinguibles sin análisis.
- Riesgo de incumplimiento de términos de servicio del videojuego y de baneo de cuentas.
- Riesgo legal en jurisdicciones que regulan la manipulación de software de terceros.
- La licencia MIT declarada en metadatos no garantiza la legitimidad ni la seguridad del binario; la licencia del código no cubre el contenido descargado desde enlaces externos.
- Idiomas declarados no verificables; no hay evidencias de soporte real.
- Cero descargas y cero "likes" en el momento de la consulta, sin historial de mantenimiento verificable.
- No ejecutar en máquinas con datos sensibles, en entornos corporativos ni en pipelines de CI/CD.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CaptainBinge/arise-crossover-script-auto-farm-portable
- Release enlazada por el autor (GitHub, cuenta `Hiroshis198`): https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Releases alternativas (GitHub, cuenta `joyce47111`): https://github.com/joyce47111/arise-crossover-script-auto-farm-portable/releases/latest
- Paper, blog o demo oficial: no disponible.
