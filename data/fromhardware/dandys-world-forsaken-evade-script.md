# FromHardware/dandys-world-forsaken-evade-script

## Resumen

No existe un modelo de IA open source en el repositorio `FromHardware/dandys-world-forsaken-evade-script`. El artefacto publicado bajo ese identificador en Hugging Face es un paquete ejecutable para Windows x64 que se presenta como un script de evasión y automatización para el videojuego Dandy's World, no un modelo de lenguaje. La model card del autor describe un binario `dandys-world-forsaken-evade-script-v1.2.0-win64.exe` de 8,9 MB, distribuido en un ZIP protegido con contraseña, junto con módulos de anti-AFK, ESP de entidades, optimizador de framerate y alertas por webhook de Discord.

Por tanto, no hay arquitectura de red neuronal, parámetros, contexto, tokenizador, pesos ni datos de entrenamiento que reseñar. Los campos técnicos habituales de una ficha de modelo (arquitectura, parámetros totales, longitud de contexto, cuantizaciones, formato de pesos) no son aplicables. El repositorio no registra descargas ni interacciones, y la única información disponible proviene de la propia model card y de los metadatos de Hugging Face.

Esta ficha se limita a documentar lo que el artefacto declara ser, advirtiendo de que no constituye un modelo de IA y de los riesgos asociados a la ejecución de binarios de procedencia no verificada. No se han encontrado en la búsqueda web referencias al proyecto ni publicaciones técnicas relacionadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto distribuido como ZIP con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es un modelo entrenado ni contiene pesos neuronales. La model card describe un ejecutable de Windows x64 (`dandys-world-forsaken-evade-script-v1.2.0-win64.exe`, build `v1.6.1` / `49E864`) empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. Los módulos que declara son: anti-AFK 24/7 con pulso de entrada virtual, configuración JSON persistente, cambio de servidor de baja latencia, ESP 3D de entidades y cofres, optimizador de framerate con eliminación de partículas, y alertas por webhook de Discord. No se especifican lenguajes de implementación, dependencias, mecanismos de inyección ni detalles de ingeniería verificables.

No hay información sobre datos de entrenamiento, RLHF, DPO ni innovaciones técnicas de modelado, porque no existe proceso de entrenamiento alguno.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No dispone de tool calling ni function calling en el sentido de los modelos de IA.
- No implementa agentes ni razonamiento multi-paso.
- El soporte multilingüe indicado en los metadatos (14 idiomas) se refiere a la declaración de idiomas del repositorio, no a capacidades lingüísticas verificadas del binario.
- Funcionalidad declarada por el autor: anti-AFK, ESP de entidades y cofres, cambio automático de servidor, optimización de framerate y notificaciones por webhook.
- No se ha verificado ninguna de estas funcionalidades de forma independiente.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA, porque no lo es.
- Automatización de partidas en Dandy's World: el autor declara módulos de anti-AFK y cambio de servidor; su uso puede infringir los términos de servicio del videojuego y conllevar el bloqueo de la cuenta.
- Monitorización de objetos en el juego mediante ESP: funcionalidad declarada, sin verificación independiente y con riesgo de sanción por parte del desarrollador del juego.
- Notificaciones externas vía webhook de Discord: el autor indica alertas de drops y registros de sesión; requiere ejecutar el binario con privilegios de administrador.
- Ajuste de rendimiento en el cliente del juego: el autor menciona eliminación de partículas y renderizado de bajo consumo; no hay datos medidos publicados.
- Auditoría de seguridad del binario: el único uso técnicamente defendible sería el análisis en un entorno aislado (sandbox, máquina virtual sin red) para determinar qué hace realmente el ejecutable antes de cualquier otra consideración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor cita cifras internas no verificables (menos de 18 ms de respuesta, menos de 21 MB de RAM, 5, 7 y 15 hilos de trabajo), pero no son comparables ni auditables y no proceden de una evaluación independiente.

## Requisitos de hardware

- Sistema operativo: Windows x64 (el autor menciona Windows 11).
- Espacio en disco: 8,9 MB para el ZIP; el tamaño descomprimido no se especifica.
- VRAM: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.
- Requisito declarado: ejecutar el `.exe` como administrador, lo que amplía la superficie de riesgo del sistema.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Tampoco se han encontrado en la búsqueda web proyectos equivalentes de scripting para Dandy's World con los que establecer una comparación técnica fiable.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA pese a estar alojado en Hugging Face; tratarlo como tal es un error de categoría.
- Distribución mediante ZIP con contraseña y ejecución como administrador: patrón habitual en campañas de malware y en software no auditado. No hay firma de código ni verificación de integridad publicada.
- Riesgo de infostealers, mineros o puertas traseras: no es posible descartarlo sin análisis del binario en un entorno aislado.
- Uso contra los términos de servicio del videojuego: puede provocar el bloqueo permanente de la cuenta del usuario.
- Licencia MIT declarada, pero sin archivo de licencia verificable ni titular claro de los derechos; la licencia no cubre responsabilidades derivadas de la ejecución del binario.
- Cero descargas y cero interacciones en el repositorio en el momento de la consulta: no hay evidencia de comunidad, soporte ni mantenimiento.
- Los idiomas declarados en los metadatos no implican capacidades multilingües reales del ejecutable.
- No se han encontrado referencias externas, papers ni repositorios que respalden las afirmaciones de la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FromHardware/dandys-world-forsaken-evade-script
- Repositorio de GitHub citado por el autor: https://github.com/miyeon99/dandys-world-forsaken-evade-script
- Release citada por el autor: https://github.com/miyeon99/dandys-world-forsaken-evade-script/releases/latest
- Paquete ZIP citado por el autor: https://github.com/miyeon99/dandys-world-forsaken-evade-script/releases/latest/download/dandys-world-forsaken-evade-script-v1.2.0-win64.zip
- Resultado de búsqueda web sin relación con el proyecto: https://pro.doctolib.fr/signin
