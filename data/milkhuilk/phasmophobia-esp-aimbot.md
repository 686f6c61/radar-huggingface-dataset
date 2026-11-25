# MilkHuilk/phasmophobia-esp-aimbot

## Resumen

El repositorio `MilkHuilk/phasmophobia-esp-aimbot` no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows x64 que la model card presenta como una herramienta de tipo ESP (extra-sensory perception, visualizacion de informacion oculta en pantalla) y aimbot para el videojuego Phasmophobia. El artefacto distribuido es un ejecutable (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, build `v3.3.1-F51EB1`) empaquetado en un ZIP de 4,8 MB protegido con contrasena.

El contenido de la model card describe funcionalidades de trampa en juegos: radar 2D, filtrado de loot, escaner dinamico de offsets, capa de renderizado que evita la captura de pantalla (OBS, ShadowPlay, Discord), suavizado de entrada Bezier y una tecla de panico para descargar el proceso. No hay arquitectura de red neuronal, pesos, tokenizador, dataset ni pipeline de inferencia asociado. La etiqueta `license: mit` y los campos `language` son metadatos declarados por el autor, no caracteristicas de un modelo linguistico.

Por tanto, esta ficha documenta la ausencia de un modelo de IA y advierte de que el artefacto es software de trampas para videojuegos. No es apto para ningun caso de uso de IA, y su ejecucion conlleva riesgos de seguridad y de cumplimiento de terminos de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del autor) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto es un binario PE para Windows x64 que, segun la model card, opera en modo usuario externo ("user-mode external core") y utiliza Desktop Duplication para renderizar sin inyectar DLL en el proceso del juego. La card menciona un escaner de offsets con firmas de puntero, 15 hilos de trabajo, sondeo a 332 Hz y una respuesta inferior a 8 ms. Estos datos describen el funcionamiento del software de trampas, no un proceso de entrenamiento de IA.

No hay informacion sobre datos de entrenamiento, tokens, composicion de dataset, RLHF, DPO ni innovaciones de modelado. Cualquier afirmacion sobre capacidades cognitivas o de lenguaje seria inventada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un modelo; los codigos de idioma son metadatos de la ficha.
- El binario declarado implementa funciones de trampa para Phasmophobia: radar 2D, filtrado de loot, escaner de offsets, suavizado de punteria y tecla de panico.
- No se debe tratar como componente de una pipeline de IA.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo de IA y no resuelve tareas de procesamiento de lenguaje, vision, codigo o agentes.
- No es adecuado para atencion al cliente, generacion de codigo, analisis de documentos, traduccion, resumen, RAG ni evaluacion de benchmarks.
- No debe integrarse en pipelines de CI/CD, produccion ni entornos corporativos.
- Su uso en juegos multijugador puede violar los terminos de servicio de Phasmophobia y de plataformas como Steam, con riesgo de baneo.
- La ejecucion de binarios de origen desconocido con contrasena en el ZIP y sin firma verificable constituye un riesgo de seguridad (malware, robo de credenciales, persistencia).
- Su distribucion o uso puede infringir normativa de proteccion de consumidores y terminos contractuales de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento del propio ejecutable (menos de 52 MB de RAM, 332 Hz de sondeo, 98,8 % de consistencia del escaner de offsets, 97,7 % de consistencia del suavizado), pero no son benchmarks de IA y no se han verificado de forma independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (segun la model card).
- Dependencias externas: ninguna declarada.
- RAM: menos de 52 MB segun el autor.
- GPU: no aplica; no hay inferencia de red neuronal.
- VRAM: no aplica.
- Despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI posibles).
- Latencia: el autor declara menos de 8 ms de respuesta; no verificado.
- No cabe en ninguna GPU porque no es un modelo.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Las alternativas reales serian otros ejecutables de trampas, que quedan fuera del alcance de esta ficha y no se recomiendan.

## Limitaciones y advertencias

- No es un modelo de IA: no tiene pesos, tokenizador, contexto ni pipeline.
- La model card contiene enlaces a repositorios de GitHub de terceros y a un ZIP con contrasena; no hay verificacion de integridad ni firma del binario.
- El nombre del ZIP (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip`) no coincide con el del repositorio (`phasmophobia-esp-aimbot`), lo que sugiere reutilizacion de plantillas o suplantacion.
- El uso de software de trampas en juegos multijugador viola habitualmente los terminos de servicio y puede conllevar suspension de cuentas.
- Riesgo elevado de malware: ejecutables sin firma, contrasena en el archivo y descarga desde repositorios no oficiales.
- La licencia MIT declarada no cubre el uso del artefacto frente a terceros ni exime de responsabilidad legal.
- No usar en produccion, entornos corporativos ni investigación.
- No hay sesgos medibles porque no hay modelo; el riesgo principal es de seguridad y legal.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MilkHuilk/phasmophobia-esp-aimbot
- Repositorio GitHub citado en la model card: https://github.com/ErikMercier70637/phasmophobia-esp-aimbot
- Repositorio GitHub citado para descargas: https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026
- Enlace de descarga directa citado (no recomendado): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
