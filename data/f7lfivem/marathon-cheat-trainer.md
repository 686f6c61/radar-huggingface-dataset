# F7lfivem/marathon-cheat-trainer

## Resumen

El repositorio `F7lfivem/marathon-cheat-trainer` no contiene un modelo de inteligencia artificial. Se trata de un artefacto publicado en Hugging Face que se presenta como una herramienta ejecutable para Windows (un supuesto *trainer* o *cheat* para videojuegos), empaquetada en un archivo ZIP de 4,8 MB con contrasena. No incluye pesos, tokenizador, configuracion de arquitectura ni ningun componente propio de un modelo de lenguaje o de vision.

La model card describe modulos de escaneo dinamico de offsets, un nucleo externo en modo usuario, un radar 2D, una capa de renderizado para evadir capturas de pantalla y perfiles JSON intercambiables. Toda esa descripcion corresponde a software de trampas para juegos, no a un modelo entrenado. Los campos de idioma y las etiquetas de Hugging Face son metadatos de clasificacion del repositorio, no indicadores de capacidades linguisticas de un modelo.

Por tanto, esta ficha documenta la ausencia de un modelo evaluable: no hay parametros, contexto, licencia de pesos ni benchmarks que analizar. Se advierte de que el contenido enlaza a descargas externas de binarios ejecutables con contrasena, practica habitual en la distribucion de software potencialmente malicioso, y de que el propio autor no aporta ninguna evidencia tecnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas de idioma son metadatos del repositorio) |
| Licencia | MIT (declarada para el repositorio, no para pesos de modelo) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un binario `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB, dirigido a Windows 10/11 de 64 bits. La model card menciona componentes como un escaner de offsets dinamicos, un nucleo externo en modo usuario, un overlay externo a 144 Hz y una capa de renderizado para excluir la captura de OBS, ShadowPlay y Discord. Ninguno de estos elementos constituye un modelo entrenado ni se acompana de datos de entrenamiento, tokens procesados o tecnicas de alineacion como RLHF o DPO.

No hay innovacion tecnica en el sentido de IA: se trata de utilidades de manipulacion de memoria de procesos y renderizado superpuesto. La unica "innovacion" declarada, la evasion de capturas de pantalla, es una caracteristica de software de trampas y no un avance en modelado.

## Capacidades

- No hay generacion de texto, razonamiento, codigo ni matematicas: el artefacto no es un modelo de lenguaje.
- No hay soporte de *tool calling* ni de *function calling*.
- No hay soporte de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingues: las etiquetas de idioma (`en`, `ru`, `zh`, `es`, etc.) son metadatos del repositorio.
- No hay modo *thinking*, vision, audio ni multimodalidad.
- El unico comportamiento descrito es la ejecucion de modulos de trampas sobre un proceso de juego en Windows.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo de IA y no tiene aplicaciones legitimas de inferencia.
- Uso en produccion: desaconsejado por completo; ejecutar binarios de origen no verificado con contrasena y privilegios de administrador supone un riesgo de seguridad.
- Investigacion: sin valor, al no aportar pesos, arquitectura ni datos evaluables.
- Desarrollo de software: sin utilidad; no expone API, SDK ni interfaz de modelo.
- Evaluacion comparativa: imposible, al no existir metricas ni comportamiento de modelo.
- Educacion: contraproducente; el contenido promueve la manipulacion de videojuegos y la evasion de capturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; la model card cita cifras de "< 26 ms", "< 10 ms" y "< 35 ms" para modulos de software, no para inferencia de un modelo.
- Requisitos reales del artefacto: Windows 10/11 de 64 bits, menos de 64 MB de RAM segun la model card, y ejecucion como administrador.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA con el que comparar; el artefacto pertenece a otra categoria de software.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni citarse como tal.
- Riesgo de seguridad alto: distribucion de un ejecutable `.exe` alojado en repositorios de GitHub de terceros, protegido con contrasena y que solicita ejecucion como administrador.
- Posible software malicioso: el patron (ZIP con contrasena, enlaces de descarga externos, insignias de descargas no verificables) es tipico de campanas de *malware* o *scam*.
- La licencia MIT declarada no aporta garantias sobre el binario ni sobre su procedencia.
- No hay sesgos de modelo que analizar, pero si un riesgo claro de dano al usuario y de incumplimiento de los terminos de servicio de los videojuegos afectados.
- No usar en produccion, en entornos corporativos ni en maquinas con datos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/F7lfivem/marathon-cheat-trainer
- Repositorio citado en la model card: https://github.com/OzlemLopez/marathon-cheat-trainer
- Repositorio de releases citado: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026
- Descarga directa citada (no recomendada): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
