# ATA19890/project-stark-free-script

## Resumen

El repositorio `ATA19890/project-stark-free-script` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como archivo comprimido para Windows (`project-stark-free-script-v1.2.0-win64.zip`, 8,9 MB) que, segun la propia model card, incluye un ejecutable (`project-stark-free-script-v1.2.0-win64.exe`, build `v3.3.9`) orientado a la manipulacion de procesos de videojuegos: radar 2D, filtrado de loot, superposicion externa a 144 Hz o mas, esqueletos y cajas delimitadoras, y suavizado de entrada tipo bezier. No hay pesos, tokenizador, configuracion de transformer ni artefactos de inferencia.

La ficha se ha solicitado como si fuera un modelo de IA open source, pero la informacion disponible no permite describir arquitectura, parametros, contexto ni capacidades linguisticas. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y el contenido de la model card confirman que es software ejecutable para Windows, no un modelo de lenguaje.

Se advierte de que el patron de distribucion (archivo ZIP con contrasena, enlace de descarga alojado en un repositorio de GitHub ajeno al autor, instrucciones para ejecutar como administrador y evasion de capturas de pantalla) es caracteristico de campanas de malware o de software no verificado. No debe descargarse ni ejecutarse en entornos de produccion ni de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio; no implica capacidades linguisticas del artefacto) |
| Licencia | MIT (declarada en metadatos; aplicable al contenido del repositorio, no verificable sobre el binario) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No aplica. No se ha publicado informacion sobre arquitectura de red neuronal, dataset de entrenamiento, tokens procesados, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia. El contenido descrito en la model card corresponde a modulos de software de escritorio (radar 2D, overlay externo, capa de renderizado resistente a capturas, perfiles JSON, tecla de panico y suavizado de entrada), no a componentes de un modelo generativo.

La unica informacion tecnica concreta que aparece en la model card es de naturaleza operativa: build `v3.3.9` (`FAB52F`), tamano del archivo de 8,9 MB, contrasena del ZIP `2026`, plataforma objetivo Windows 10/11 de 64 bits, y menciones de `12` hilos de trabajo, `9` hilos de trabajo, sondeo a `226 Hz` y consumo inferior a `22 MB` de RAM. Estos datos no son verificables y no constituyen especificaciones de un modelo de IA.

## Capacidades

- No se ha documentado ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision, audio o multilingue.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado modo thinking, vision ni audio.
- El artefacto descrito en la model card es un ejecutable de Windows con modulos de overlay y filtrado orientados a videojuegos; no es un modelo desplegable mediante APIs de inferencia.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA: el repositorio no contiene pesos ni artefactos de inferencia.
- No se recomienda su uso en atencion al cliente, generacion de codigo, analisis documental, RAG ni ninguna otra aplicacion de IA.
- No se recomienda su ejecucion en entornos corporativos, de investigacion ni de produccion, dado el patron de distribucion (ZIP con contrasena, ejecutable como administrador, enlace externo al autor del repositorio).
- No se recomienda su uso como base para fine-tuning ni para evaluacion comparativa de modelos.
- No se recomienda su integracion en pipelines de CI/CD ni en sistemas automatizados.
- Cualquier evaluacion tecnica deberia limitarse a un analisis estatico del binario en una maquina aislada y sin privilegios, por parte de un equipo de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras internas no verificables (`96,1%` de consistencia en overlay, `97,4%` en capa de renderizado, sondeo a `226 Hz`), pero no son resultados de benchmarks de modelos de IA y no deben interpretarse como tales.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Plataforma declarada del artefacto: Windows 10 y Windows 11 de 64 bits, con un binario `.exe` que la model card indica ejecutar como administrador.
- Consumo declarado: menos de `22 MB` de RAM (dato no verificado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos de IA comparable, ya que el repositorio no contiene un modelo. Tampoco procede compararlo con modelos de lenguaje de 7B, 13B o 70B, ni con modelos de vision, porque no comparte funcion ni formato de distribucion.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuracion ni artefactos de inferencia.
- El artefacto distribuido es un ejecutable de Windows empaquetado en un ZIP con contrasena (`2026`), lo que impide el analisis previo por parte de escaneres automaticos y dificulta la auditoria.
- La model card incluye instrucciones para ejecutar el binario como administrador, lo que amplia el impacto potencial de cualquier comportamiento malicioso.
- La model card menciona una capa de renderizado "stream-proof" disenada para excluirse de OBS, ShadowPlay y Discord; este tipo de funcionalidad es habitual en software de trampas para videojuegos y en malware que busca evadir la deteccion visual.
- El enlace de descarga apunta a un repositorio de GitHub (`Rangel9589/project-stark-free-script`) distinto del autor del repositorio de Hugging Face (`ATA19890`), lo que rompe la cadena de confianza.
- Los metadatos declaran licencia MIT, pero esta no es verificable sobre el binario distribuido.
- El repositorio registra `0` descargas y `0` likes en Hugging Face en el momento de la consulta, mientras que la model card afirma `177K+` descargas; la discrepancia es una senal de alerta adicional.
- No debe descargarse, extraerse ni ejecutarse en equipos personales, de investigacion o de produccion sin un analisis de seguridad previo en entorno aislado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ATA19890/project-stark-free-script
- Repositorio de GitHub referenciado en la model card: https://github.com/Rangel9589/project-stark-free-script
- Release referenciada en la model card: https://github.com/Rangel9589/project-stark-free-script/releases/latest
- Paquete ZIP referenciado en la model card: https://github.com/Rangel9589/project-stark-free-script/releases/latest/download/project-stark-free-script-v1.2.0-win64.zip
