# Maxlf2026/dune-awakening-cheat-esp-v3

## Resumen

El artefacto publicado bajo el identificador `Maxlf2026/dune-awakening-cheat-esp-v3` no es un modelo de inteligencia artificial. Se trata de un paquete binario para Windows x64 (un supuesto *cheat* o herramienta de trampas con ESP para el videojuego *Dune: Awakening*) distribuido a través de un repositorio de Hugging Face. La model card no contiene ninguna referencia a arquitectura de red neuronal, pesos, tokenizador, dataset de entrenamiento ni proceso de inferencia; en su lugar describe módulos de overlay, filtros de loot, radar 2D y una clave de pánico, junto con instrucciones para descargar y ejecutar un `.exe` protegido por contraseña.

El contenido resulta relevante únicamente como caso de estudio de malas prácticas en la plataforma: uso indebido de etiquetas propias de modelos (idiomas, licencia, pipeline), distribución de ejecutables ofuscados, contraseñas embebidas en el README y enlaces a repositorios de terceros ajenos al autor declarado. No existe información técnica verificable que permita evaluarlo como modelo de lenguaje, visión o multimodal.

Por todo ello, esta ficha documenta la ausencia de especificaciones reales de IA y advierte de los riesgos de seguridad asociados. Cualquier dato que no aparezca en la información proporcionada se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin respaldo técnico) |
| Licencia | mit (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto referenciado es un `.zip` con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El README menciona una "arquitectura modular" compuesta por módulos de overlay externo a 144 Hz, suavizado de entrada Bézier, radar 2D con filtro de loot, perfiles JSON intercambiables en caliente y una capa de renderizado orientada a evadir capturas de OBS, ShadowPlay y Discord. Estos componentes corresponden a un supuesto *cheat* de videojuego, no a un sistema de aprendizaje automático.

No hay información sobre datos de entrenamiento, número de tokens, composición del corpus, RLHF, DPO ni ninguna innovación en atención o decodificación. Tampoco se documenta el binario: se desconoce el lenguaje de implementación, las dependencias, el proceso de compilación o la cadena de custodia del ejecutable. El paquete se distribuye como `fisch-script-auto-catch-macro-v1.2.2-win64.zip` (4,8 MB) alojado en un repositorio de GitHub de un tercero (`ekaterina96522`), con contraseña de descompresión `2026` y sin firma de código ni verificación de integridad publicada.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de *tool calling* ni de *function calling*.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- El multilingüismo aparece solo como etiqueta en los metadatos, sin evidencia de ningún componente lingüístico.
- Las únicas "capacidades" descritas son funcionalidades de trampa en un videojuego: ESP con cajas 2D/3D y esqueletos de huesos, radar 2D, filtro de loot por rareza, suavizado de puntería y descarga de emergencia mediante la tecla `END`.
- No se proporciona ninguna API, endpoint, demo interactiva ni espacio de inferencia.

## Casos de uso

- Auditoría de seguridad de la cadena de suministro: analizar el paquete en un entorno aislado para determinar qué ejecuta el binario, qué procesos inspecciona y si establece conexiones de red, dado que se distribuye con contraseña y sin firma.
- Estudio de abuso de plataforma: documentar cómo se reutilizan etiquetas de modelos (`language`, `license`, `pipeline`) para alojar ejecutables ajenos a la finalidad de Hugging Face.
- Formación en detección de ingeniería social: el README emplea insignias falsas de descargas (812K+) y valoraciones (4,9/5) junto con instrucciones para desactivar advertencias de Windows Defender y SmartScreen, patrón típico de distribución de *malware*.
- Análisis de riesgo para equipos de cumplimiento: evaluar políticas internas sobre descarga de binarios desde repositorios de modelos y establecer listas de bloqueo por identificador.
- Investigación de *cheats* en videojuegos: caracterizar técnicas de overlay externo y evasión de captura descritas en la model card, con fines defensivos para equipos antitrampas.
- Concienciación de desarrolladores: ilustrar por qué no debe ejecutarse un `.exe` obtenido de un repositorio de modelos, especialmente cuando requiere permisos de administrador y una contraseña de archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Las cifras que aparecen en el README (consistencia del 97,3 %, respuesta inferior a 6 ms, 98,9 % de consistencia en la descarga de emergencia, 10 y 16 hilos de trabajo) son afirmaciones de marketing sin metodología, sin conjunto de evaluación y sin posibilidad de reproducción. No se incluyen en ninguna tabla comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo de IA.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows x64 (Windows 11 mencionado en las etiquetas), con procesadores Intel y AMD x64 según el FAQ.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto se ejecuta como binario nativo.
- Latencia y throughput: no disponibles; las cifras del README no son verificables.
- Requisito operativo declarado: ejecución como administrador, lo que amplía la superficie de riesgo del binario.

## Comparativa con modelos similares

No procede comparación con modelos de IA. A modo de contraste con artefactos de la misma categoría (binarios no modelo alojados en repositorios de modelos):

| Aspecto | Este artefacto | Modelo de IA típico en Hugging Face |
|---|---|---|
| Contenido | `.zip` con `.exe` ofuscado | Pesos en safetensors/GGUF |
| Verificabilidad | Nula (contraseña, sin firma) | Hash y model card reproducible |
| Metadatos | Etiquetas de idioma y licencia sin respaldo | Licencia y pipeline coherentes |
| Finalidad | Trampas en videojuego | Inferencia de IA |
| Riesgo de seguridad | Alto (ejecución como administrador) | Bajo (datos, no ejecutables) |

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni procesar lenguaje; cualquier expectativa en ese sentido es errónea.
- El binario se distribuye comprimido con contraseña (`2026`) y alojado en un repositorio de GitHub de un tercero distinto del autor declarado, lo que impide verificar su procedencia.
- El propio README reconoce que Windows Defender y SmartScreen pueden alertar y recomienda desactivar esas protecciones y ejecutar como administrador; esto es un indicador de riesgo elevado.
- Las insignias de descargas y valoración del README no son verificables y contradicen el contador de la plataforma (0 descargas, 0 likes).
- El uso de *cheats* en videojuegos suele violar los términos de servicio del juego y puede conllevar el baneo de cuentas; en algunas jurisdicciones puede tener implicaciones legales.
- La licencia MIT declarada en los metadatos no aclara la titularidad del binario ni de los recursos de terceros referenciados.
- No debe ejecutarse en máquinas de producción ni con credenciales activas; cualquier análisis debe hacerse en una máquina virtual desechable y sin red.
- No se dispone de información sobre sesgos, alucinación o limitaciones de contexto porque no existe componente lingüístico que evaluar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Maxlf2026/dune-awakening-cheat-esp-v3
- Repositorio de GitHub referenciado en el README (tercero): https://github.com/PerijiTuji34/dune-awakening-cheat-esp-v3
- Repositorio de GitHub del paquete descargable (tercero): https://github.com/ekaterina96522/fisch-script-auto-catch-macro
- Enlace de descarga directa citado en el README (no recomendado): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Paper, blog, demo o documentación técnica: no disponible
