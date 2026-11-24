# SHALINDAMADU/deadlock-esp-aimbot

## Resumen

El repositorio `SHALINDAMADU/deadlock-esp-aimbot` no contiene un modelo de inteligencia artificial. Se trata de una publicacion en Hugging Face que distribuye un supuesto ejecutable para Windows (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip`, 4,8 MB) presentado como "ESP y aimbot" para el videojuego Deadlock. No hay pesos, configuracion de transformer, tokenizador ni pipeline de inferencia asociado.

El artefacto se presenta como una herramienta de trampas para videojuegos con funciones de overlay externo, radar 2D, filtrado de loot y suavizado de entrada tipo bezier. La model card emplea terminologia tecnica propia de modelos de lenguaje (arquitectura, consistencia, latencia) de forma decorativa, pero no describe ningun modelo entrenado ni publica artefactos verificables.

Desde la perspectiva de evaluacion de modelos open source, este repositorio debe clasificarse como no conforme: no es un modelo, no es auditable y su descarga implica ejecutar un binario de terceros protegido con contrasena. La ficha se redacta para dejar constancia de ello y advertir de los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas, sin relacion con capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un ejecutable de 4,8 MB para Windows 10/11 de 64 bits, con funciones de lectura de memoria del proceso del juego, overlay externo a 144 Hz o mas, escaneo dinamico de offsets tras parches y suavizado de entrada configurable. Ninguno de estos elementos constituye un modelo de aprendizaje automatico.

No se documentan datos de entrenamiento, tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO) ni innovaciones en atencion o decodificacion. Las menciones a "16 worker threads" o "consistencia del 96,2 %" son afirmaciones de marketing sin metodologia de medicion publicada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no produce codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multilingues reales; las etiquetas de idioma del repositorio no corresponden a un modelo entrenado.
- El artefacto declara funciones de trampa en videojuegos (ESP, aimbot, radar, filtrado de loot), sin verificacion independiente.

## Casos de uso

- Ninguno recomendado en el ambito de IA open source: el repositorio no contiene un modelo evaluable ni desplegable en pipelines de inferencia.
- Auditoria de seguridad: un equipo puede analizar el repositorio como ejemplo de publicacion maliciosa o de spam en Hugging Face, documentando patrones de ingenieria social (contrasena en el ZIP, enlaces a repositorios de GitHub ajenos al autor declarado).
- Formacion en higiene de cadena de suministro: sirve como caso practico de por que no deben ejecutarse binarios de autor desconocido con privilegios de administrador.
- Investigacion sobre contaminacion de hubs de modelos: util para estudiar como se etiquetan artefactos no relacionados con IA bajo categorias de modelos.
- No procede su uso en atencion al cliente, generacion de codigo, analisis de documentos ni ninguna tarea de NLP.
- No procede su uso en produccion bajo ninguna configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de la model card (4,9/5 de valoracion, 314K descargas, 96,2 % / 97,6 % / 96,4 % de "consistencia", menos de 23 ms de latencia) carecen de metodologia, conjunto de evaluacion y reproducibilidad, y no corresponden a ninguna tarea de IA medible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras mencionadas en la model card no son verificables.
- Requisitos reales del artefacto: Windows 10/11 de 64 bits, extraccion con contrasena `2026` y ejecucion como administrador, segun la propia model card.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el repositorio no contiene un modelo de IA. Frente a modelos open source reales del mismo supuesto tamano o tarea, la comparacion no es posible: faltan pesos, arquitectura, tokenizador y resultados de evaluacion.

## Limitaciones y advertencias

- No es un modelo de IA: no debe integrarse en ningun pipeline de inferencia ni citarse como modelo en revisiones tecnicas.
- Riesgo de seguridad alto: la model card indica ejecutar un binario como administrador tras extraerlo con contrasena, un patron habitual en distribucion de malware.
- Suplantacion de identidad: los enlaces apuntan a repositorios de GitHub (`ErikMercier70637/...`, `singh35602/...`) que no coinciden con el autor declarado en Hugging Face (`SHALINDAMADU`), y el nombre del ZIP hace referencia a otro producto (un supuesto trainer de Kingdom Come: Deliverance 2).
- Incumplimiento de terminos de servicio: las funciones declaradas (ESP, aimbot) violan habitualmente los terminos de uso de videojuegos y pueden conllevar el baneo de cuentas.
- Licencia MIT declarada: aunque tecnicamente permisiva, no cubre responsabilidades derivadas de la ejecucion de software potencialmente malicioso.
- Cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- No apto para uso comercial, produccion ni entornos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SHALINDAMADU/deadlock-esp-aimbot
- Enlace de descarga citado en la model card (no verificado): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/singh35602/deadlock-esp-aimbot/releases/latest
