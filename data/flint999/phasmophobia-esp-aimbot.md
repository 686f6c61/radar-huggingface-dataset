# FLINT999/phasmophobia-esp-aimbot

## Resumen

El artefacto publicado bajo el identificador `FLINT999/phasmophobia-esp-aimbot` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable para Windows x64 etiquetado como "ESP Aimbot" y "cheat" para el videojuego Phasmophobia, empaquetado en un archivo ZIP de 4,8 MB con contrasena. El repositorio no contiene pesos, configuracion de arquitectura, tokenizador ni ningun artefacto propio de un modelo de lenguaje, vision o audio.

La model card del autor es, en la practica, una pagina de descarga de software de trampas para videojuegos: incluye instrucciones para extraer un ZIP protegido con contrasena, ejecutar un binario como administrador y configurar modulos de radar 2D, aimbot con suavizado Bezier y capas de render "stream-proof". Toda la terminologia tecnica que aparece (offset scanner, user-mode external core, polling a 332 Hz) describe tecnicas de manipulacion de memoria de procesos, no componentes de un modelo entrenado.

Desde la perspectiva de un editor tecnico de IA open source, la ficha debe reflejar que no existe informacion de modelo que documentar: no hay parametros, contexto, licencia de pesos ni benchmarks. La licencia declarada es MIT, pero se aplica al repositorio, no a un modelo. Se advierte de que el contenido es software de terceros no verificado, potencialmente malicioso y contrario a los terminos de servicio de los videojuegos afectados, ademas de no tener relacion alguna con el ecosistema de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio, no capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada para el repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto descrito en la model card es un binario `marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe` (build `v3.3.1`, identificador `F51EB1`) empaquetado en un ZIP de 4,8 MB protegido con la contrasena `2026`. Las unicas "innovaciones" mencionadas son mecanicas de trampa: escaner dinamico de offsets de memoria, renderizado por Desktop Duplication sin hooks de DLL internos, suavizado de entrada Bezier con radio de FOV configurable y una tecla de panico (`END`) para descargar el proceso.

No hay dataset, tokens de entrenamiento, RLHF, DPO ni ninguna fase de alineamiento. Cualquier afirmacion sobre capacidades del "modelo" seria una invencion: el repositorio no publica pesos, no expone una API de inferencia y no contiene tarjetas de configuracion tipo `config.json`, `tokenizer.json` o `model.safetensors`.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; las etiquetas de idioma del repositorio son metadatos de descubrimiento, no competencias del artefacto.
- El artefacto declara funcionalidades de trampa para videojuegos: radar 2D, filtro de loot, aimbot con curvas humanizadas y capa de render excluida de capturas (OBS, ShadowPlay, Discord).
- No dispone de modo "thinking", vision, audio ni ninguna modalidad propia de un modelo fundacional.

## Casos de uso

- No aplica ninguno de los casos de uso habituales de un modelo de IA (atencion al cliente, generacion de codigo, analisis de documentos, RAG, agentes, etc.).
- El unico uso descrito por el autor es la ejecucion de un ejecutable de trampas en Windows 10/11 x64, lo que constituye una violacion de los terminos de servicio de Phasmophobia y de otros juegos mencionados en los nombres de los archivos.
- No se recomienda su descarga, ejecucion ni integracion en ningun pipeline, por tratarse de software de terceros no verificado, con binarios opacos y distribuido mediante enlaces externos a GitHub.
- Un equipo de investigacion no puede emplearlo como baseline, modelo de referencia ni componente de evaluacion, al no existir pesos ni API.
- No es apto para produccion, entornos corporativos ni investigacion academica.
- En el contexto de un blog de IA open source, su unico "uso" legitimo seria como ejemplo de ruido y de contenido abusivo en plataformas de modelos, para documentar practicas de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion de modelos. Las unicas cifras que aparecen en la model card son afirmaciones de marketing sobre el ejecutable (por ejemplo, "98,8 % de consistencia" del escaner de offsets o "332 Hz" de polling), sin metodologia verificable ni relacion con capacidades de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado por el artefacto: Windows 10 y Windows 11 de 64 bits (x64).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles como metricas de modelo; las cifras del ejecutable no son verificables.
- Consumo declarado del ejecutable: menos de 52 MB de RAM y unos 15 hilos de trabajo, segun la model card del autor.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos similares" porque el artefacto no es un modelo de IA. Frente a un LLM open source real (por ejemplo, un modelo de 7B a 70B con pesos en safetensors y licencia Apache 2.0 o similar), este repositorio carece de parametros, contexto, benchmarks y artefactos de inferencia, por lo que cualquier tabla comparativa seria ficticia.

## Limitaciones y advertencias

- No es un modelo de IA: no debe catalogarse ni evaluarse como tal en un blog tecnico de IA open source.
- Riesgo de seguridad elevado: se distribuye un binario `.exe` opaco, alojado en un ZIP con contrasena y enlazado a repositorios de GitHub de terceros; no hay verificacion de integridad ni firmas.
- Posible malware: la combinacion de ejecutable como administrador, contrasena en el archivo y enlaces de descarga externos es un patron habitual en campanas de distribucion de software malicioso.
- Violacion de terminos de servicio: el uso de trampas en Phasmophobia y en otros juegos puede conllevar el baneo permanente de cuentas.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su legalidad en la jurisdiccion del usuario.
- Las etiquetas de idioma y la categoria "model" del repositorio son enganosas y pueden contaminar busquedas y sistemas de recomendacion.
- No apto para uso comercial, produccion ni investigacion; se recomienda no descargarlo ni ejecutarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FLINT999/phasmophobia-esp-aimbot
- Repositorio de GitHub citado en la model card: https://github.com/ErikMercier70637/phasmophobia-esp-aimbot
- Repositorio de GitHub citado para la descarga: https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026
- Enlace de descarga directa citado en la model card: https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- No se han encontrado papers, blogs tecnicos ni demos asociados al artefacto.
