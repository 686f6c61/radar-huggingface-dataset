# mahi18d/meteor-client-1-21-4-baritone-addons

## Resumen

El artefacto publicado bajo el identificador `mahi18d/meteor-client-1-21-4-baritone-addons` no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows que se distribuye como archivo ZIP con contrasena y que, segun su propia model card, contiene un binario denominado `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`. No existe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociado. El repositorio utiliza la infraestructura de Hugging Face unicamente como plataforma de alojamiento y distribucion de software de terceros.

La model card describe modulos de tipo overlay externo, ESP (deteccion de jugadores a traves de la pantalla), aimbot con suavizado de entrada bezier y un escaner de offsets dinamicos, todos ellos orientados a la manipulacion de un videojuego multijugador. El paquete se presenta como "portable" para Windows 10 y Windows 11 en arquitectura x64, con un tamano declarado de 4,8 MB y un binario compilado identificado como `v2.6.8 (C5449F)`.

Desde la perspectiva de la evaluacion de modelos, esta ficha no puede aportar especificaciones tecnicas de inferencia, benchmarks ni requisitos de hardware en el sentido habitual, porque el objeto publicado no es un modelo. La relevancia de documentarlo radica en identificar el contenido real del repositorio y advertir de los riesgos asociados a la descarga y ejecucion de binarios de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas en el repositorio, no capacidades del binario) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO o similar). El contenido descrito en la model card es un ejecutable de Windows con modulos de overlay y automatizacion de entrada, distribuido como archivo comprimido protegido con contrasena. No se documenta ningun pipeline de aprendizaje automatico ni innovacion tecnica en el sentido de arquitecturas transformer, MoE o SSM.

La unica informacion tecnica disponible en la model card hace referencia a componentes del ejecutable: una capa de renderizado que evita la captura por OBS, ShadowPlay y Discord, un overlay externo a 144 Hz o mas, suavizado de entrada bezier con radio de FOV configurable, un escaner de offsets con tiempo de respuesta declarado inferior a 36 ms, una tecla de panico (`END`) para descarga del proceso y un nucleo en modo usuario con ocho hilos de trabajo. Estos datos no son verificables y no constituyen especificaciones de un modelo.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de procesamiento de lenguaje natural; las etiquetas de idioma del repositorio no corresponden a funcionalidad del binario.
- No dispone de modo thinking, vision ni audio.
- El binario descrito implementa, segun su autor, funciones de overlay grafico, ESP y automatizacion de entrada sobre un juego concreto.

## Casos de uso

- No se identifican casos de uso legitimos de evaluacion de modelos para este artefacto.
- El contenido descrito esta orientado a la manipulacion de un videojuego multijugador, lo que puede infringir los terminos de servicio del juego y la legislacion aplicable en materia de trampas y comercio de software.
- La distribucion mediante ZIP con contrasena y ejecutable "run as administrator" es un patron habitual en campañas de malware; no se recomienda su descarga ni ejecucion en ningun entorno.
- El uso de la infraestructura de Hugging Face como repositorio de binarios ajenos a modelos de IA puede inducir a error a herramientas de descubrimiento y a usuarios que buscan modelos reales.
- Cualquier integracion en produccion es inviable: no hay API, pesos, tokenizador ni licencia de uso de modelo que lo permita.
- Se recomienda a los equipos de plataforma tratar este tipo de repositorios como contenido a bloquear o marcar, no como candidatos a evaluacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento del ejecutable (menos de 45 MB de RAM en la capa de renderizado, menos de 57 MB en el suavizado de entrada, respuesta inferior a 36 ms del escaner de offsets y 99,6 % de consistencia en la descarga por tecla de panico), pero no son verificables ni comparables con metricas de modelos de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles en el sentido de inferencia de modelo.
- Requisitos declarados del ejecutable: Windows 10 o Windows 11 de 64 bits, ejecucion como administrador y extraccion previa del ZIP con contrasena.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco procede compararlo con otros ejecutables de la misma categoria sin verificar su procedencia y seguridad, algo que queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; cualquier expectativa de inferencia, pesos o API es incorrecta.
- La model card incluye enlaces de descarga a dominios y cuentas de GitHub de terceros, no verificados, y un binario que se ejecuta con privilegios de administrador.
- El uso de contrasena en el ZIP y la instruccion de "run as administrator" son indicadores de riesgo que exigen cautela extrema.
- No hay evidencia de auditoria, firma de codigo ni analisis de malware del ejecutable.
- La licencia MIT declarada en los metadatos no aclara la titularidad real del software ni de los componentes de terceros que pueda incluir.
- El uso del binario para manipular un videojuego puede vulnerar los terminos de servicio del juego y la normativa aplicable.
- Las etiquetas de idioma y la categoria de "modelo" en Hugging Face no reflejan la naturaleza real del contenido.
- No debe descargarse ni ejecutarse en entornos de desarrollo, produccion ni investigadores sin un analisis previo en sandbox aislado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mahi18d/meteor-client-1-21-4-baritone-addons
- Enlace de descarga citado en la model card (no verificado): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/dorisdevos35/meteor-client-1-21-4-baritone-addons
- Releases citadas en la model card (no verificadas): https://github.com/dorisdevos35/meteor-client-1-21-4-baritone-addons/releases/latest
- Paper, blog o demo: no disponibles.
