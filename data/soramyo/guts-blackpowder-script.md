# soramyo/guts-blackpowder-script

## Resumen

La entrada `soramyo/guts-blackpowder-script` alojada en Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable para Windows x64 (`dandys-world-forsaken-script-2026-v1.2.2-win64.exe`, build `v4.7.8` / `B3E21E`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card se describe a sí misma como un "game cheat binario" con módulos de overlay externo, ESP de cajas y esqueletos, suavizado de entrada tipo bezier y una capa de render "stream-proof" pensada para evadir la captura de OBS, ShadowPlay y Discord.

No existe ningún artefacto de aprendizaje automatico en el repositorio: no hay pesos, no hay tokenizador, no hay configuracion de arquitectura ni pipeline declarado. Los tags (`windows`, `windows-11`, `x64`, `portable`) y la lista de idiomas son metadatos genéricos sin relacion con capacidades linguisticas reales de un modelo. El campo de pipeline figura como "no disponible" y las descargas y likes son cero.

Desde el punto de vista de evaluacion de modelos, esta ficha debe interpretarse como una advertencia: el contenido encaja con el patron tipico de distribucion de malware disfrazado de "script gratuito" (ZIP con contraseña para evadir analisis automatico, enlace a un repositorio de GitHub de terceros ajeno al autor declarado, insistencia en ejecutar como administrador y en desactivar alertas de SmartScreen/Defender). No debe descargarse ni ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los tags listan en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id sin justificacion tecnica) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal, ni datos de entrenamiento, ni proceso de alineacion (RLHF, DPO u otro). El repositorio no contiene ficheros de pesos en safetensors, GGUF ni ningun otro formato de modelo. El "artefacto" descrito en la model card es un binario compilado para Windows x64 con modulos descritos en lenguaje de marketing (escaneo dinamico de offsets, perfilado JSON con cambio en caliente, overlay externo a 144 Hz, suavizado de entrada bezier). Ninguna de estas supuestas capacidades viene acompanada de documentacion tecnica verificable, codigo fuente ni resultados reproducibles.

La unica innovacion tecnica mencionada es la evasion de captura de pantalla ("stream-proof render layer") y la resolucion automatica de firmas de punteros tras parches del juego, lo cual es caracteristico de software de trampas para videojuegos, no de un sistema de IA.

## Capacidades

- No es un modelo linguistico: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales pese a los 14 codigos de idioma en los tags.
- No dispone de modo thinking, vision ni audio.
- Las unicas "capacidades" descritas son propias de un cheat de videojuego: ESP de cajas 2D/3D, esqueletos de huesos, indicacion de distancia, suavizado de apuntado y tecla de panico (`END`).

## Casos de uso

- Ninguno legitimo en el ambito de IA, desarrollo o investigacion.
- Auditoria de seguridad: analizar el patron de distribucion (ZIP con contrasena, enlace a repositorio de terceros, instrucciones de ejecutar como administrador) como ejemplo de ingenieria social dirigida a usuarios de Hugging Face.
- Formacion en ciberseguridad: usar la model card como caso de estudio de "model card poisoning" en plataformas de modelos abiertos.
- Monitorizacion de plataformas: alimentar detectores automaticos de contenido malicioso en hubs de modelos con este tipo de entradas.
- Trazabilidad de la cadena de suministro: documentar la discrepancia entre el autor declarado (`soramyo`) y el repositorio de GitHub referenciado (`MichelleFerrari`, `pedrolong1343`), indicio de suplantacion.
- Respuesta a incidentes: registrar el hash del ZIP y del `.exe` si se ha descargado, antes de su eliminacion.
- No se recomienda ningun uso del binario en produccion, en equipos de desarrollo ni en entornos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica: no existe un modelo subyacente que evaluar con MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto: Windows 10/11 de 64 bits, procesadores Intel o AMD x64, ejecucion como administrador segun las instrucciones del autor.
- Latencia y throughput: no disponibles; las cifras de "< 8 ms", "< 10 ms", "144 Hz+" y "< 52 MB de RAM" son afirmaciones del autor sin verificacion independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| `soramyo/guts-blackpowder-script` | no disponible | no disponible | MIT | Hugging Face (0 descargas) | Ejecutable Windows, no es un modelo de IA |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | No existe categoria equivalente de IA |

No hay modelos de IA comparables porque el artefacto no pertenece a esa categoria. Cualquier comparacion con LLM, modelos de vision o sistemas multimodales seria invalida.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni integrarse como tal en ningun pipeline.
- Riesgo elevado de malware: ZIP con contrasena (`2026`) para dificultar el analisis automatico, enlace de descarga alojado en un repositorio de GitHub de un tercero distinto del autor declarado, y peticion explicita de ejecutar como administrador.
- Instrucciones para desactivar o ignorar Windows Defender y SmartScreen, lo cual es una senal de alarma clasica de distribucion de software malicioso.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su procedencia; el codigo fuente no esta publicado.
- Los idiomas listados en los metadatos no implican soporte linguistico real; son tags de indexacion.
- Uso del binario en un videojuego puede violar los terminos de servicio del juego y conllevar el baneo de la cuenta, ademas de riesgos legales.
- No se debe descargar, extraer ni ejecutar el ZIP en ningun equipo, y menos aun en entornos con acceso a credenciales o datos sensibles.
- Se recomienda reportar la entrada a Hugging Face para su revision y retirada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/soramyo/guts-blackpowder-script
- Repositorio de GitHub referenciado en la model card: https://github.com/MichelleFerrari/guts-blackpowder-script
- Repositorio de GitHub del enlace de descarga: https://github.com/pedrolong1343/dandys-world-forsaken-script-2026
- Enlace directo al ZIP (no descargar): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Paper, blog, demo o repositorio oficial del modelo: no disponible
