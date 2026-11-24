# Fabian992/doors-floor-2-mspaint-script

## Resumen

El repositorio `Fabian992/doors-floor-2-mspaint-script` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo contenido es un ejecutable de Windows (un supuesto script para el videojuego Roblox "Doors Floor 2") distribuido como archivo ZIP protegido con contraseña. No hay pesos, no hay arquitectura de red neuronal, no hay tokenizador ni pipeline de inferencia asociado.

La model card del autor describe funcionalidades propias de una herramienta de automatizacion de videojuegos (anti-AFK, webhooks de Discord, teleport, farm loop) y ofrece un enlace de descarga a un binario alojado en GitHub, junto con una contrasena para extraer el archivo. Ninguno de estos elementos corresponde a un modelo de lenguaje, vision o multimodal.

Por tanto, esta ficha no puede documentar especificaciones tecnicas de un modelo. Se han revisado los metadatos disponibles y se han marcado como "no disponible" todos los campos que no aplican. Se advierte de que la distribucion de ejecutables con contrasena y las promesas de funcionalidades no verificadas son patrones habituales en campanas de malware; se recomienda no descargar ni ejecutar el binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio, sin relacion con capacidades de modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto es un ejecutable `doors-floor-2-mspaint-script-v1.2.0-win64.exe` (build `v3.6.1`, codigo `C94BAA`) empaquetado en un ZIP de 8,9 MB protegido con la contrasena `2026`. Segun la model card, el binario estaria orientado a Windows 10 y 11 de 64 bits y contendria modulos de automatizacion para el juego Roblox "Doors Floor 2".

No se dispone de informacion sobre datos de entrenamiento, proceso de alineacion (RLHF, DPO), tokenizador ni innovaciones tecnicas de inferencia, porque el objeto no es un modelo entrenado. Cualquier afirmacion sobre su funcionamiento interno procede unicamente de la model card y no es verificable.

## Capacidades

- No es un modelo de generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los codigos de idioma de los metadatos son etiquetas del repositorio, no capacidades del artefacto.
- La model card atribuye al binario funciones de automatizacion de videojuego: guardia anti-AFK, alertas por webhook de Discord, teleport por coordenadas, bucle de farmeo y cambio de servidor. Estas funciones no han sido verificadas y no constituyen capacidades de IA.

## Casos de uso

- No aplica ninguno de los casos de uso propios de un modelo de IA (atencion al cliente, generacion de codigo, analisis documental, RAG, etc.).
- El artefacto, segun su autor, se usaria para automatizar tareas dentro del videojuego Roblox "Doors Floor 2". No se recomienda su uso: implica ejecutar un binario de origen no verificado en el sistema del usuario.
- No se identifican escenarios legitimos de desarrollo, investigacion o produccion en los que este repositorio aporte valor tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: no es un modelo de inferencia.
- El autor indica compatibilidad con Windows 10 y Windows 11 de 64 bits (Intel y AMD x64).
- El autor menciona un consumo de RAM inferior a 50 MB para el modulo de configuracion JSON, inferior a 32 MB para el cambio de servidor, inferior a 57 MB para el bucle de farmeo e inferior a 38 MB para el teleport. Estos datos no son verificables.
- No aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.
- No se dispone de datos de latencia ni throughput de inferencia porque no hay inferencia.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable: el repositorio no contiene un modelo de IA. Compararlo con LLM como Llama, Mistral o Qwen carece de sentido tecnico.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; los metadatos de Hugging Face (tags de idioma, licencia MIT, pipeline) no reflejan un artefacto de aprendizaje automatico.
- El binario se distribuye comprimido con contrasena, un patron que dificulta el analisis por parte de antivirus y motores de inspeccion. Es un indicador de riesgo habitual en campanas de malware.
- El autor reconoce en la model card que Windows Defender y SmartScreen pueden generar alertas y sugiere desactivarlas o excluir el directorio. Esta recomendacion es peligrosa y no debe seguirse.
- Las funcionalidades anunciadas (webhooks, teleport, farmeo) no son verificables y podrian encubrir comportamiento malicioso (robo de credenciales, mineria, exfiltracion de datos).
- El uso de automatizacion en Roblox puede violar los terminos de servicio de la plataforma y conllevar el baneo de la cuenta.
- La licencia MIT declarada no aporta garantias sobre la seguridad ni la legalidad del binario.
- No debe desplegarse en produccion ni ejecutarse en equipos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Fabian992/doors-floor-2-mspaint-script
- Enlace de descarga citado en la model card (no recomendado): https://github.com/annsokolov1684/doors-floor-2-mspaint-script/releases/latest/download/doors-floor-2-mspaint-script-v1.2.0-win64.zip
- Pagina de releases citada en la model card: https://github.com/annsokolov1684/doors-floor-2-mspaint-script/releases/latest
