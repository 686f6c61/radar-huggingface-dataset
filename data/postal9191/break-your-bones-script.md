# postal9191/break-your-bones-script

## Resumen

`postal9191/break-your-bones-script` es un repositorio alojado en Hugging Face que, pese a su identificador y a su etiquetado con licencia MIT y una lista de idiomas, no contiene un modelo de inteligencia artificial. El contenido publicado es una model card que distribuye un supuesto ejecutable para Windows x64 (`break-your-bones-script-v1.2.0-win64.exe`, empaquetado en un ZIP de 8,9 MB protegido con contraseña) alojado en un repositorio externo de GitHub bajo el usuario `Mihok99990`. La propia descripción se autodefine como un "game cheat" con funciones de overlay externo a 144 Hz, ESP de esqueletos ("bone skeletons"), radar 2D, filtro de loot, escáner dinámico de offsets y una capa de renderizado que evita la captura por OBS, ShadowPlay y Discord.

No se trata, por tanto, de un modelo de lenguaje, visión o multimodal: no hay pesos, no hay arquitectura declarada, no hay tokenizador ni pipeline asociado (el campo `pipeline` figura como no disponible). El repositorio presenta cero descargas y cero likes en el momento de la consulta, y su único propósito aparente es servir de escaparate para la descarga de un binario de terceros.

Desde la perspectiva de un desarrollador o investigador que evalúe modelos, esta ficha debe interpretarse como una advertencia: el artefacto no es evaluable como modelo y su descarga conlleva riesgos de seguridad evidentes (ejecutable sin firmar, contraseña de extracción incrustada en el propio README, instrucciones para desactivar avisos de SmartScreen y ejecutar como administrador). Los resultados de la búsqueda web proporcionada no aportan información técnica sobre el artefacto: únicamente devuelven páginas de inicio de sesión de Outlook, sin relación con el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como ejecutable de "game cheat" para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; sin funcionalidad lingüística asociada) |
| Licencia | MIT (declarada en los metadatos y en la model card) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un binario nativo para Windows 10/11 de 64 bits, con un tamaño declarado de 8,9 MB y versión `v4.5.8 (B80978)`, que se presenta como "independiente de dependencias externas". Las funcionalidades enumeradas (overlay externo, ESP de esqueletos, radar 2D, escáner de offsets tras parches, exclusión de capturas de pantalla) corresponden a técnicas típicas de software de trampas en videojuegos, no a componentes de un modelo fundacional.

No se aporta información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica propia de modelos de IA (atención lineal, decodificación especulativa, MoE, SSM, etc.). Cualquier afirmación en ese sentido sería inventada y, por tanto, se omite.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El multilingüismo listado en los metadatos (14 idiomas) no tiene reflejo en ninguna funcionalidad descrita.
- Las únicas "capacidades" descritas son funciones de trampas para videojuegos: overlay externo a 144 Hz con polling de 198 Hz, ESP de esqueletos y cajas 2D/3D, radar 2D con filtro de loot por rareza, escáner dinámico de offsets, capa de renderizado no capturable por software de grabación y perfiles JSON con conmutación por tecla.
- No se especifica ningún modo de razonamiento, thinking mode ni capacidad multimodal.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, ya que el artefacto no lo es. Los escenarios que la model card sugiere son:

- Uso como software de trampas en videojuegos: el autor lo presenta explícitamente como "game cheat" con ESP y radar, lo que en la mayoría de juegos online supone una violación de los términos de servicio y puede conllevar el baneo de la cuenta.
- Distribución de binarios a través de un repositorio de modelos: el patrón (ZIP con contraseña, enlace a GitHub de terceros, instrucciones para ejecutar como administrador y desactivar SmartScreen) es habitual en campañas de distribución de malware y no constituye un caso de uso recomendable.
- Evaluación de modelos: no aplica, al no existir pesos, tokenizador ni pipeline.
- Integración en pipelines de CI/CD, atención al cliente, generación de código o análisis documental: no aplica.
- Investigación en IA: no aplica.
- Despliegue en producción: no aplica y, además, desaconsejado por los riesgos de seguridad descritos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye métricas de rendimiento del supuesto ejecutable (respuesta del panic key en menos de 6 ms, polling a 198 Hz, uso de RAM inferior a 64 MB, conmutación de perfiles en menos de 12 ms), pero no son benchmarks de un modelo de IA y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, procesadores Intel o AMD x64, 8,9 MB de espacio en disco para el ZIP y menos de 64 MB de RAM en ejecución según la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles como modelo; las cifras citadas (6 ms, 198 Hz, 12 ms) corresponden al ejecutable y no han sido verificadas.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Compararlo con modelos de lenguaje, visión o multimodales sería incorrecto metodológicamente.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura, tokenizador y pipeline; no puede evaluarse ni desplegarse como tal.
- Riesgo de seguridad elevado: se distribuye un ejecutable sin firmar, protegido por contraseña (`2026`) incrustada en el propio README, alojado en un repositorio de GitHub de un tercero (`Mihok99990`) y con instrucciones explícitas para ejecutarlo como administrador y desactivar avisos de Windows Defender o SmartScreen.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta, lo que impide cualquier validación comunitaria.
- La licencia MIT declarada no ofrece garantías sobre el binario distribuido ni sobre su procedencia; la licencia del repositorio de Hugging Face no cubre necesariamente el contenido alojado en GitHub.
- Uso como trampa en videojuegos: probable violación de los términos de servicio de los juegos afectados y riesgo de sanción para la cuenta del usuario.
- El etiquetado multilingüe (14 idiomas) es engañoso en la práctica: no hay funcionalidad lingüística descrita.
- Los resultados de la búsqueda web proporcionados no contienen información técnica sobre el artefacto (solo páginas de inicio de sesión de Outlook), por lo que no permiten verificar ninguna afirmación del autor.
- No debe ejecutarse en entornos de producción, máquinas con credenciales sensibles ni equipos de trabajo sin aislamiento previo en una máquina virtual desechable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/postal9191/break-your-bones-script
- Repositorio de GitHub citado por el autor: https://github.com/Mihok99990/break-your-bones-script
- Descarga directa citada en la model card (no verificada, desaconsejada): https://github.com/Mihok99990/break-your-bones-script/releases/latest/download/break-your-bones-script-v1.2.0-win64.zip
- Resultados de búsqueda web proporcionados: únicamente páginas de inicio de sesión de Outlook (https://outlook.office.com/mail/login, https://outlook.office.com/mail/inbox, https://www.microsoft.com/en-us/microsoft-365/outlook/log-in), sin relación con el artefacto.
