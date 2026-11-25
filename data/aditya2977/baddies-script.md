# Aditya2977/baddies-script

## Resumen

El repositorio `Aditya2977/baddies-script` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo contenido es una supuesta utilidad ejecutable para Windows x64 (un binario `.exe` empaquetado en un ZIP de 4,8 MB) que se distribuye a través de enlaces externos a GitHub. La model card no describe arquitectura, pesos, tokenizador ni pipeline de inferencia; los metadatos de Hugging Face indican `pipeline: no disponible` y cero descargas.

El material de referencia se presenta como un script para videojuegos con funciones de ESP (visualización de entidades a través de paredes), aimbot, teleport y automatización de farmeo. Los nombres de los ficheros enlazados (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip`) apuntan a una herramienta de trampas para un título multijugador, no a un modelo lingüístico. La ficha se redacta, por tanto, como evaluación técnica del artefacto publicado, no como ficha de modelo.

Desde la perspectiva de un desarrollador o investigador, este repositorio carece de valor como modelo evaluable: no hay ficheros de pesos, no hay documentación de entrenamiento y el binario se entrega con contraseña de archivo y requiere ejecución como administrador, lo que constituye un patrón de distribución de alto riesgo. Cualquier uso en producción es desaconsejable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; sin relación con capacidades lingüísticas reales) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio no incluye ficheros de pesos, configuración de modelo, tokenizador ni scripts de entrenamiento. La model card describe un binario Windows (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, build `84F2D4`, versión declarada `v4.2.8`) con módulos que la propia documentación etiqueta como optimizador de framerate, bucle de farmeo automatizado, ESP de entidades y cofres, salto de servidores de bajo ping, teleporte de coordenadas y configuración JSON persistente.

Toda la información técnica disponible (polling a 466-467 Hz, 7 hilos de trabajo, respuesta en menos de 9 ms) procede de afirmaciones del autor sin verificación independiente y no es auditable: no se publica código fuente, no hay compilación reproducible y el binario se entrega cifrado con contraseña. No hay innovación técnica documentada en el sentido de un modelo de aprendizaje automático.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de una API de modelo.
- No implementa razonamiento multi-paso ni comportamiento de agente basado en LLM.
- Las capacidades multilingües declaradas en los metadatos (14 idiomas) no están respaldadas por ningún componente lingüístico verificable.
- Las funciones descritas por el autor son de manipulación de un videojuego: ESP, aimbot, teleporte, automatización de farmeo y salto de servidores.
- No hay modo de pensamiento, visión, audio ni ninguna modalidad de IA.

## Casos de uso

- Evaluación de seguridad de artefactos en Hugging Face: el repositorio sirve como caso de estudio de contenido que no es un modelo y que utiliza la plataforma para distribuir binarios externos.
- Análisis de patrones de distribución maliciosa: permite estudiar técnicas como contraseña en el ZIP, enlaces a repositorios de GitHub de terceros y petición de ejecución como administrador.
- Formación en higiene de cadena de suministro: ejemplo práctico de por qué conviene verificar autor, descargas, licencia y contenido antes de ejecutar un binario.
- Documentación de taxonomías de riesgo: útil para clasificar artefactos que suplantan la categoría de modelo.
- Revisión de políticas de plataforma: ilustra la necesidad de controles sobre repositorios con cero descargas y contenido no relacionado con IA.
- No se identifican casos de uso legítimos de IA, desarrollo de software o investigación que este artefacto pueda cubrir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas citadas por el autor (respuesta en menos de 9 ms, polling a 466-467 Hz, 7 hilos) no son verificables ni comparables con benchmarks de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecución como administrador, 4,8 MB de espacio en disco para el ZIP.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: las cifras del autor (menos de 9 ms, 466-467 Hz) no son verificables y no corresponden a inferencia de un modelo.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable porque el artefacto no es un modelo de IA. Frente a un modelo open source real, las diferencias son estructurales: ausencia de pesos, de arquitectura, de benchmarks, de pipeline y de comunidad (cero descargas y cero likes en el momento de la consulta).

| Criterio | `Aditya2977/baddies-script` | Modelo open source típico |
|---|---|---|
| Pesos publicados | No | Sí (safetensors, GGUF) |
| Arquitectura documentada | No | Sí |
| Benchmarks verificables | No | Habitualmente sí |
| Descargas | 0 | Variable, habitualmente superior |
| Contenido | Binario `.exe` en ZIP externo | Pesos y código |
| Utilidad para IA | Ninguna | Evaluable |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal es un error de categoría.
- El binario se distribuye mediante enlaces a repositorios de GitHub de terceros, no alojados en Hugging Face, lo que impide verificar integridad y procedencia.
- El ZIP está protegido con contraseña (`2026`), práctica que dificulta el análisis antimalware y es habitual en campañas de distribución de software no deseado.
- Se solicita ejecución como administrador, lo que otorga privilegios elevados a un binario no auditado.
- La model card reconoce explícitamente que las heurísticas de Windows Defender y SmartScreen pueden alertar sobre el ejecutable.
- El contenido declarado corresponde a trampas para un videojuego multijugador, lo que puede vulnerar los términos de servicio del juego y, según la jurisdicción, normativa aplicable.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el binario ni sobre su origen.
- Riesgo alto de malware, robo de credenciales o persistencia no deseada; no debe ejecutarse en entornos de producción ni en máquinas con datos sensibles.
- Los sesgos y la alucinación no aplican como tales, pero la documentación contiene afirmaciones no verificables (226K+ descargas, valoración 4,9/5) que no coinciden con las métricas de la plataforma (0 descargas, 0 likes).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aditya2977/baddies-script
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub, terceros): https://github.com/UyenJansen57681/baddies-script/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
