# Kepler365/DunoonDaemon-App

## Resumen

DunoonDaemon-App no es un modelo de lenguaje en sentido estricto, sino un repositorio de Hugging Face asociado a una aplicación de escritorio para Windows que empaqueta un runtime local de inferencia (llama.cpp) junto con pesos en formato GGUF. Su propósito declarado es ofrecer "personajes de IA locales con memoria, personalidad y escenarios de Arena multijugador", orientados a roleplay y a partidas de rol de mesa (tabletop RPG). El autor es Kepler365 (también identificado como sorvan76), que atribuye la autoría conjunta a un proceso de "fusión humano/IA" con ChatGPT.

El estado del proyecto es problemático: según la propia model card, la descarga para Windows v2.1.0 fue retirada del repositorio el 22 de noviembre de 2026 a petición del mantenedor, y no existe actualmente ninguna release descargable en esa rama. Se anuncia una distribución en Python solo de código fuente a partir de una instantánea congelada etiquetada como 2.1.2 (31 de octubre de 2026), pero el autor advierte explícitamente que no está publicada ni validada y que las comprobaciones de regresión arrojaron fallos pendientes de investigación.

Por tanto, la ficha describe un artefacto en estado pre-release y no verificado, con 0 descargas y 0 likes en el momento de la consulta. La información técnica disponible sobre el modelo subyacente (arquitectura, parámetros, contexto, datos de entrenamiento) es prácticamente nula: la model card no documenta ningún modelo base concreto, y los únicos datos verificables son el tamaño del repositorio (1,0 GB), la licencia MIT y el conjunto de etiquetas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio distribuye pesos en GGUF para llama.cpp, sin especificar la familia del modelo base) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formato GGUF; no se detallan los niveles de cuantización incluidos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (inferencia mediante `llama-server.exe` y DLL asociadas de llama.cpp) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo subyacente. El repositorio se limita a distribuir pesos en formato GGUF y un runtime nativo basado en llama.cpp (`llama-server.exe` más las DLL correspondientes), lo que implica que la inferencia se ejecuta en CPU o GPU local mediante el backend de ggml. No se especifica si el modelo base es un transformer denso, un MoE o una arquitectura híbrida, ni se indica el número de parámetros, la ventana de contexto nativa o la familia de modelos de la que derivan los pesos.

Tampoco se documentan los datos de entrenamiento: no se indica el volumen de tokens, la composición del corpus, la existencia de fases de ajuste supervisado, RLHF o DPO, ni si los pesos han sido afinados específicamente para roleplay o si se trata de un modelo genérico redistribuido. La model card menciona "memoria" y "personalidad" como características de la aplicación, pero no aclara si esa memoria se implementa en el prompt, en una base de datos externa o mediante algún mecanismo de ajuste. No se describe ninguna innovación técnica (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto orientada a roleplay y conversación con personajes, según la descripción del proyecto.
- Escenarios "Arena" con múltiples personajes, es decir, conversaciones o turnos con más de un agente en la misma sesión.
- Memoria de conversación y rasgos de personalidad definidos por el usuario, según la model card (sin detalle técnico del mecanismo).
- Soporte para partidas de rol de mesa (tabletop RPG) como caso de uso declarado.
- Ejecución totalmente local mediante llama.cpp, sin dependencia de API externa.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Partidas de rol de mesa asistidas por IA: la aplicación está etiquetada explícitamente como `tabletop-rpg` y permitiría generar descripciones de escena, diálogos de PNJ y resolución narrativa de acciones de los jugadores en local, sin enviar la partida a un servicio en la nube.
- Roleplay conversacional con personajes persistentes: el proyecto declara memoria y personalidad por personaje, de modo que un usuario podría mantener sesiones multi-turno con un personaje coherente a lo largo del tiempo.
- Escenarios "Arena" con varios personajes: útil para simular debates, consejos o interacciones entre varios PNJ que responden en el mismo hilo, un caso habitual en narrativa interactiva.
- Prototipado de asistentes conversacionales offline: al ejecutarse sobre llama.cpp, sirve como banco de pruebas para desarrolladores que quieran experimentar con inferencia local en Windows sin depender de infraestructura externa.
- Escritura creativa y generación de diálogos: la orientación a personajes encaja con la producción de guiones, tramas ramificadas y borradores narrativos en un entorno de escritorio.
- Evaluación de despliegues GGUF en Windows: el repositorio documenta las dependencias nativas (`llama-server.exe` y DLL) y las implicaciones para Smart App Control, lo que lo convierte en un caso de estudio sobre los roces entre runtimes nativos y las políticas de seguridad de Windows.
- Advertencia importante: dado que no hay release validada ni pesos documentados, ninguno de estos casos puede considerarse respaldado por una build verificada. Cualquier uso en producción es desaconsejable en el estado actual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 1,0 GB, lo que sugiere pesos cuantizados de pequeño tamaño, pero no se especifica el nivel de cuantización ni el número de parámetros, por lo que no puede calcularse la VRAM necesaria.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; el uso de llama.cpp permite en principio ejecución en CPU, pero no se documentan requisitos mínimos.
- Opciones de despliegue: llama.cpp mediante `llama-server.exe` y DLL asociadas en Windows, invocando el lanzador `python modern_shell.py`. No se mencionan vLLM, TGI, Ollama ni otros servidores.
- Latencia y throughput: no disponible.
- Nota de seguridad: el autor advierte que la distribución de código fuente no incluirá los ejecutables nativos, los pesos ni los datos de usuario, y recomienda no desactivar las protecciones de seguridad de Windows (Smart App Control) para ejecutar un runtime no confiable.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica el modelo base ni ofrece parámetros, contexto o resultados de evaluación que permitan una comparación rigurosa con alternativas de la misma categoría. Además, el artefacto es una aplicación empaquetada con pesos GGUF, no un modelo publicado con ficha técnica propia, lo que impide emparejarlo con modelos comparables.

## Limitaciones y advertencias

- No existe ninguna release descargable validada: la build v2.1.0 para Windows fue retirada el 22 de noviembre de 2026 y la instantánea 2.1.2 solo de código fuente no está publicada ni validada.
- El autor reconoce fallos en las comprobaciones de regresión de la instantánea 2.1.2; el número de versión no debe interpretarse como garantía de calidad.
- El repositorio depende de ejecutables nativos (`llama-server.exe` y DLL) que no se auditan en la información disponible y que pueden entrar en conflicto con Smart App Control de Windows.
- No se documenta el modelo base, los parámetros, el contexto ni los idiomas, lo que impide evaluar sesgos, riesgo de alucinación o idoneidad para un dominio concreto.
- Riesgo de alucinación: no evaluado; cualquier modelo orientado a roleplay tiende a priorizar coherencia narrativa sobre exactitud factual, pero no hay datos que lo cuantifiquen.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero al no estar claro el origen de los pesos no puede confirmarse que la licencia cubra el modelo subyacente.
- Idiomas soportados no especificados: no puede asumirse un rendimiento adecuado en castellano.
- 0 descargas y 0 likes: ausencia total de validación por parte de la comunidad.
- No apto para producción en su estado actual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kepler365/DunoonDaemon-App
- Proyecto en GitHub: https://github.com/Sorvan76/DunoonDaemonApp
- Guía de Smart App Control de Microsoft: https://learn.microsoft.com/en-us/windows/apps/develop/smart-app-control/overview
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
