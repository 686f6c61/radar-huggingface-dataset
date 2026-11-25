# Disturbed13/pumpkin-playground-script

## Resumen

`Disturbed13/pumpkin-playground-script` no es un modelo de inteligencia artificial. El repositorio de Hugging Face etiquetado con ese identificador contiene, segun su propia model card, un ejecutable portable para Windows x64 presentado como "script" para el juego Pumpkin Playground, empaquetado en un archivo ZIP protegido con contrasena y distribuido mediante enlaces a GitHub Releases. No hay pesos neuronales, tokenizador, configuracion de arquitectura ni pipeline de inferencia asociados al repositorio.

La informacion disponible describe un binario (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`) con supuestas funciones de overlay externo, radar 2D, filtro de loot, escaneo de offsets y "panic key", ademas de tecnicas declaradas de evasion de captura de pantalla. La model card incluye afirmaciones no verificables (611K de descargas, valoracion 5.0/5) y referencias cruzadas a repositorios de terceros ajenos al autor declarado, lo que es caracteristico de campanas de distribucion de software potencialmente malicioso.

Desde la perspectiva de un editor tecnico de IA open source, la ficha debe dejar constancia de que este repositorio no cumple ninguno de los criterios para ser evaluado como modelo: carece de arquitectura, parametros, contexto, licencia de pesos y benchmarks. Se documenta unicamente para advertir de que no debe tratarse como un modelo desplegable ni ejecutarse en entornos de produccion o de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de metadatos del repositorio, no capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto descrito en la model card es un binario compilado para Windows x64 (build declarada `v2.0.7 (E4FA99)`) con un tamano declarado de 4,8 MB, empaquetado en `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip` y protegido con la contrasena `2026`. Las funciones que la model card atribuye al binario (overlay externo a 144 Hz, radar 2D con polling a 276 Hz, escaneo asincrono de offsets a 131 Hz, perfiles JSON con cambio en menos de 10 ms, consumo declarado inferior a 23 MB de RAM) son afirmaciones del autor sin verificacion independiente y no constituyen especificaciones de un modelo.

No hay dataset, numero de tokens, composicion de corpus, RLHF, DPO ni ninguna innovacion de modelado que documentar. La unica "innovacion" mencionada es la exclusion de capturas de pantalla en OBS, ShadowPlay y Discord, que es una tecnica de evasion y no una capacidad de IA.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision: no es un modelo linguistico ni multimodal.
- No soporta tool calling ni function calling en el sentido de una API de modelo.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los codigos de idioma de los metadatos son etiquetas de descubrimiento del repositorio.
- No dispone de modo "thinking", audio ni procesamiento de imagenes.
- El unico comportamiento descrito es la ejecucion de un binario de terceros en Windows con privilegios de administrador.

## Casos de uso

- Ninguno recomendado en el ambito de IA open source: el repositorio no contiene un modelo que pueda integrarse en pipelines de inferencia, evaluacion o investigacion.
- Auditoria de seguridad defensiva: un analista puede estudiar la model card y los metadatos como ejemplo de patron de distribucion de software no verificado (ZIP con contrasena, enlaces a repositorios de terceros, insignias de descargas infladas) para entrenar heuristicas de deteccion de campanas de malware.
- Formacion en higiene de cadena de suministro: el caso sirve para ilustrar por que no deben ejecutarse binarios descargados de repositorios de modelos sin verificacion de firma ni analisis en sandbox.
- Documentacion de taxonomia de repositorios: util para clasificar artefactos que aparecen en Hugging Face sin ser modelos y definir reglas de filtrado en catalogos internos.
- Analisis de ingenieria social en fichas tecnicas: la estructura de la model card (badges, FAQ, instrucciones de "run as Administrator", contrasena embebida) es un ejemplo de manipulacion de confianza que puede diseccionarse en materiales de concienciacion.
- Verificacion de licencias: aunque la licencia declarada es MIT, el contenido no es codigo fuente ni pesos; un equipo legal puede usar el caso para revisar como se aplican las licencias a artefactos binarios opacos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni equivalentes porque el artefacto no es un modelo. Las cifras de rendimiento que aparecen en la model card (276 Hz, 131 Hz, 144 Hz, menos de 10 ms, menos de 23 MB de RAM) son afirmaciones del autor sobre un binario y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay inferencia de modelo).
- GPU recomendadas: no disponible (no requiere GPU).
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits, sobre procesadores Intel y AMD x64.
- Opciones de despliegue: no aplica (no hay soporte para vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Frente a un modelo open source real de la misma categoria (por ejemplo, un LLM de 7-8B con licencia permisiva), las diferencias serian totales: ausencia de pesos, de tokenizador, de contexto, de benchmarks y de cualquier interfaz de inferencia.

| Criterio | `Disturbed13/pumpkin-playground-script` | Modelo open source tipico (referencia generica) |
|---|---|---|
| Tipo de artefacto | Binario Windows x64 en ZIP | Pesos en safetensors/GGUF |
| Parametros | No aplica | Millones o miles de millones |
| Contexto | No aplica | Miles a cientos de miles de tokens |
| Benchmarks publicados | Ninguno verificable | Habitualmente MMLU, HumanEval, GSM8K |
| Despliegue en servidor | No | vLLM, TGI, llama.cpp |
| Licencia | MIT declarada sobre binario opaco | Licencia de pesos explicita |

## Limitaciones y advertencias

- No es un modelo de IA: no debe registrarse en catalogos de modelos ni evaluarse con harnesses de benchmarks.
- Riesgo de seguridad alto: la distribucion mediante ZIP con contrasena, instrucciones para ejecutar como administrador y enlaces a repositorios de terceros es un patron habitual de malware y de software no deseado.
- Afirmaciones no verificables: las insignias de 611K descargas y valoracion 5.0/5 no se corresponden con los metadatos del repositorio (0 descargas, 0 likes en el momento de la consulta).
- Evasion de controles: las funciones declaradas de exclusion de captura de pantalla y de "panic key" estan disenadas para dificultar la deteccion y la supervision, lo que complica cualquier auditoria.
- Uso en juegos: el artefacto se presenta como trampa para un videojuego, lo que puede vulnerar los terminos de servicio de la plataforma correspondiente y conllevar sanciones de cuenta.
- Licencia: aunque se declara MIT, esta se aplica a un binario sin codigo fuente visible; no hay garantia de que el contenido distribuido coincida con lo declarado.
- Idiomas: los codigos de idioma de los metadatos no implican soporte linguistico real.
- Recomendacion: no descargar ni ejecutar el binario; si se necesita analisis, hacerlo exclusivamente en una maquina virtual aislada y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Disturbed13/pumpkin-playground-script
- Repositorio de GitHub referenciado en la model card (terceros, no verificado): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026
- Repositorio de GitHub referenciado en la model card (terceros, no verificado): https://github.com/SuveyuSuqi52/pumpkin-playground-script
- Enlace de descarga citado en la model card (no recomendado): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Paper, blog o demo: no disponible
