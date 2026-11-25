# aryzik/valorant-esp-triggerbot

## Resumen

`aryzik/valorant-esp-triggerbot` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. Se trata de un paquete binario para Windows 10/11 de 64 bits distribuido como archivo ZIP (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip`, 4,8 MB) que, según su propia model card, implementa funcionalidades de trampa para el videojuego Valorant: ESP (detección de enemigos a través de paredes con cajas delimitadoras y esqueletos), triggerbot (disparo automático) y una capa de renderizado para evadir la captura de pantalla de OBS, ShadowPlay y Discord. El autor declarado es `aryzik` y el repositorio figura con licencia MIT, 0 descargas y 0 likes en el momento de la consulta.

El problema que dice resolver es la automatización de puntería y la visualización de información oculta en partidas multijugador, algo que en la práctica constituye una herramienta de cheating y que infringe los términos de servicio de Riot Games. No hay arquitectura de red neuronal, parámetros, tokens de contexto ni pesos entrenados: la información disponible describe un ejecutable externo en modo usuario con escaneo de offsets, overlay 2D/3D y liberación de memoria mediante tecla de pánico (`END`).

La relevancia de esta ficha es, por tanto, negativa: sirve para documentar que el artefacto no es un modelo de IA evaluable, que su contenido es software potencialmente malicioso y que su descarga conlleva riesgos de seguridad y legales. No debe confundirse con un modelo de lenguaje, y no es apto para ningún caso de uso legítimo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable externo de cheating para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. La model card describe un programa nativo compilado (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`, build `v2.9.6` / `B67813`) que opera en modo usuario y de forma externa, sin inyección de DLL, apoyándose en Desktop Duplication para el renderizado del overlay. Entre las supuestas capacidades técnicas que enumera están el suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad, un escáner dinámico de offsets para resolver firmas de punteros tras los parches del juego, un overlay externo a 144 Hz o más con cajas delimitadoras 2D/3D y esqueletos, y una tecla de pánico (`END`) para liberar handles y terminar el proceso.

No se proporciona información sobre datos de entrenamiento, número de tokens, RLHF, DPO ni ninguna innovación en aprendizaje automático. La única "innovación" declarada es de evasión: exclusión de la captura de pantalla en herramientas de streaming y un consumo de RAM indicado por debajo de 22 MB. Todos estos datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente; deben tratarse como afirmaciones de marketing no contrastadas.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son metadatos del repositorio, no competencia lingüística.
- Afirma incluir ESP (cajas 2D/3D, esqueletos, distancia), triggerbot con suavizado Bézier y comprobación de visibilidad, y evasión de captura de pantalla en OBS, ShadowPlay y Discord (según el autor).
- Afirma incorporar una tecla de pánico (`END`) para terminar el proceso y liberar handles.

## Casos de uso

- Ninguno legítimo. El artefacto no es un modelo de IA y no debe emplearse para inferencia, generación de texto, código ni análisis de datos.
- Auditoría de seguridad defensiva: un analista puede examinar el binario en un entorno aislado y sin red para documentar técnicas de evasión (Desktop Duplication, escaneo de offsets, exclusión de captura) y alimentar reglas de detección en EDR.
- Investigación de malware: estudiar el patrón de distribución (ZIP con contraseña `2026`, nombres de archivo que suplantan a otros proyectos, enlaces a repositorios de GitHub de terceros) como ejemplo de cadena de entrega engañosa.
- Formación en concienciación: usar la propia model card como caso práctico de señales de alarma (badges de descargas infladas, promesas de "gratis", contraseña en el archivo, suplantación de nombres).
- Documentación de cumplimiento: registrar que el repositorio infringe los términos de servicio de Valorant y las políticas de uso de Hugging Face, como referencia para políticas internas.
- Respuesta a incidentes: si un equipo detecta el ejecutable en un puesto de trabajo, disponer de esta ficha para clasificarlo como software no autorizado y proceder a su cuarentena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras que aparecen en la model card son afirmaciones del autor sobre el propio ejecutable (respuesta inferior a 13 ms para el suavizado de entrada, inferior a 24 ms para la tecla de pánico, 97,7 % y 99,4 % de "consistencia", menos de 22 MB de RAM), sin metodología, sin conjunto de prueba y sin verificación independiente. No son comparables a métricas de modelos de IA como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica; el autor no declara requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits.
- Espacio en disco: 4,8 MB para el ZIP, más el contenido extraído (tamaño no detallado).
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI); el artefacto es un `.exe` que se ejecuta supuestamente como administrador.
- Latencia y throughput: no disponibles de forma fiable; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, porque este repositorio no contiene un modelo. Frente a otros artefactos de la misma naturaleza (trampas para videojuegos), la comparación queda fuera del alcance de esta ficha y no se dispone de datos verificables de alternativas.

| Criterio | `aryzik/valorant-esp-triggerbot` | Modelo de IA típico (referencia) |
|---|---|---|
| Naturaleza | Ejecutable de cheating para Windows | Red neuronal con pesos |
| Parámetros | no aplica | Variable (p. ej., miles de millones) |
| Contexto | no aplica | Miles o millones de tokens |
| Licencia | MIT declarada | Variable (Apache-2.0, MIT, etc.) |
| Uso legítimo | Ninguno | Inferencia, generación, análisis |
| Verificación independiente | Ninguna | Benchmarks publicados |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal; cualquier expectativa de generación de texto o código es infundada.
- Riesgo de seguridad alto: un ejecutable sin firmar, distribuido en un ZIP protegido con contraseña (`2026`) y con nombres de archivo que suplantan a otros proyectos, es un vector habitual de malware, mineros o stealers.
- Ejecutarlo "como administrador", tal y como indica la model card, otorga privilegios elevados a código no verificado.
- Infracción de términos de servicio: el uso de ESP y triggerbot en Valorant conlleva el baneo de la cuenta y posibles acciones legales según la jurisdicción.
- La licencia MIT declarada no legitima el uso del software frente a los términos de servicio del juego ni frente a las políticas de la plataforma de alojamiento.
- Datos no verificados: descargas (378K+), valoración (5.0/5) y métricas de rendimiento son afirmaciones del autor sin respaldo; el repositorio figura con 0 descargas y 0 likes en Hugging Face.
- Posible suplantación: los enlaces apuntan a repositorios de GitHub de terceros (`martina1713`, `takumi4232`) con nombres de archivo ajenos al proyecto (`monster-hunter-wilds-trainer-mod-2026`), lo que sugiere una cadena de distribución engañosa.
- Sesgos y alucinación: no aplica como modelo lingüístico, pero la model card contiene afirmaciones exageradas y no contrastadas que constituyen desinformación.
- Recomendación: no descargar ni ejecutar; si ya se ha hecho, analizar el equipo con herramientas de seguridad y revocar credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aryzik/valorant-esp-triggerbot
- Enlace de descarga citado en la model card (GitHub de terceros, no verificado): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado como archivo (terceros, no verificado): https://github.com/takumi4232/valorant-esp-triggerbot/releases/latest
- Paper, blog, demo o documentación técnica: no disponibles.
