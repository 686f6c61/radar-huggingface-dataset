# JhonnyHusky/real-keyless-executor

## Resumen

`JhonnyHusky/real-keyless-executor` es un repositorio alojado en Hugging Face que, pese a su ubicación, no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 distribuido como archivo comprimido (`real-keyless-executor-v1.2.0-win64.zip`, 8,9 MB) que, según su model card, implementa un "executor" de scripts para Roblox con editor Monaco, inyección de scripts y compatibilidad declarada con la API sUNC.

El artefacto se presenta con etiquetas propias de un modelo (`windows`, `x64`, `portable`, licencia MIT, 14 idiomas declarados), pero su contenido técnico corresponde a una aplicación de escritorio, no a pesos neuronales ni a una arquitectura de aprendizaje automático. No se declara ningún parámetro, longitud de contexto, tokenizador ni proceso de entrenamiento.

Desde la perspectiva de un blog técnico sobre IA open source, este repositorio es relevante únicamente como caso de estudio de mal etiquetado y de riesgo de seguridad: distribuye un binario ejecutable con contraseña de descompresión fija, alojado en un repositorio de GitHub de terceros, sin firma de código ni trazabilidad del binario, y con instrucciones para ejecutarlo como administrador. No debe evaluarse como modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicación ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin verificación) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.zip` de 8,9 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario compilado para Windows x64 (`real-keyless-executor-v1.2.0-win64.exe`, build `v4.5.5`, identificador `756420`) empaquetado en un ZIP protegido con la contraseña fija `2026`. La model card describe módulos de editor Monaco, un "script hub" asíncrono, adjunción multi-instancia y una capa de compatibilidad con la API sUNC (hookmetamethod, getgc, Drawing API).

Las cifras que aparecen en la documentación (polling a 210 Hz y 298 Hz, consumo menor de 62 MB y 32 MB de RAM, latencia inferior a 14 ms y 11 ms, compatibilidad "98%+ sUNC") son afirmaciones del autor sin metodología de medición, sin banco de pruebas reproducible y sin verificación independiente. No hay información sobre compilador, cadena de build, dependencias enlazadas ni firma de código.

## Capacidades

- Distribución de un ejecutable portable para Windows 10 y 11 de 64 bits, sin dependencias externas declaradas.
- Editor de scripts tipo Monaco con resaltado de sintaxis multipestaña y consola de trazas.
- Ejecución de scripts remotos desde un "hub" con presets en la nube.
- Adjunto a múltiples instancias de proceso de forma simultánea.
- Auto-ejecución de scripts desde un directorio configurable.
- Compatibilidad declarada con la API sUNC (hookmetamethod, getgc, Drawing API).
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni ninguna función propia de un modelo de lenguaje.

## Casos de uso

- Auditoría de seguridad de artefactos mal etiquetados: analizar en un entorno aislado cómo un binario se publica como "modelo" en Hugging Face para eludir controles de contenido, revisando cadenas, imports y comportamiento en red.
- Estudio de ingeniería social en distribución de software: documentar el patrón de "descarga directa + contraseña fija + ejecutar como administrador" como vector habitual de malware.
- Formación en respuesta a incidentes: usar el paquete como muestra de laboratorio para practicar triaje de binarios desconocidos con sandbox, YARA y análisis dinámico.
- Evaluación de políticas de plataforma: analizar por qué los filtros de Hugging Face no bloquearon un ejecutable con etiquetas de modelo y cómo mejorar la moderación de repositorios.
- Investigación sobre ecosistemas de trampas en videojuegos: estudiar la economía y las técnicas de distribución de "executors" para Roblox y su relación con el malware infostealer.
- Concienciación de desarrolladores: ilustrar por qué no debe ejecutarse un binario descargado de un repositorio de modelos sin verificar hash, firma y procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de latencia, consumo de memoria y frecuencia de polling que aparecen en la model card son afirmaciones del autor sin metodología ni reproducibilidad, por lo que no constituyen benchmarks válidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo neuronal.
- GPU recomendadas: no aplica; el artefacto declara ejecución en CPU sobre Windows x64.
- Cabe en cualquier PC con Windows 10 u 11 de 64 bits; el autor declara menos de 62 MB de RAM en los módulos descritos, dato no verificado.
- Opciones de despliegue: ejecución directa del `.exe` en Windows; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a ejecutables legítimos de automatización para Windows (por ejemplo, AutoHotkey o AutoIt), la diferencia relevante es que estos se distribuyen con código fuente auditable y firma, mientras que este paquete se entrega como binario ofuscado con contraseña fija y alojamiento externo.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural; su etiquetado como modelo en Hugging Face es incorrecto o engañoso.
- Riesgo de seguridad alto: se distribuye un `.exe` sin firma de código, con contraseña de descompresión fija (`2026`) que impide el escaneo previo por antivirus, y con instrucciones para ejecutarlo como administrador.
- El binario se aloja en un repositorio de GitHub de un tercero (`aVerhoeven6126/real-keyless-executor`), no en Hugging Face, lo que rompe la trazabilidad y permite sustituir el contenido sin cambiar la ficha.
- La licencia MIT declarada no aporta garantías sobre el contenido del binario ni sobre su procedencia.
- El uso de "executors" para Roblox viola los términos de servicio de la plataforma y puede conllevar el baneo de cuentas; además, este tipo de herramientas se ha asociado históricamente a la distribución de infostealers.
- Cero descargas y cero "likes" en el momento de la consulta; sin comunidad, sin issues y sin mantenimiento verificable.
- Los 14 idiomas declarados son metadatos sin respaldo funcional: no hay interfaz multilingüe documentada.
- No debe ejecutarse en entornos de producción ni en máquinas con credenciales; si se analiza, hacerlo en una VM desechable sin red o con red monitorizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JhonnyHusky/real-keyless-executor
- Repositorio de GitHub referenciado en la model card: https://github.com/aVerhoeven6126/real-keyless-executor
- Última release referenciada: https://github.com/aVerhoeven6126/real-keyless-executor/releases/latest
- Paquete directo citado por el autor: https://github.com/aVerhoeven6126/real-keyless-executor/releases/latest/download/real-keyless-executor-v1.2.0-win64.zip
