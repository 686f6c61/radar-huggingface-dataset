# fddfw/freecad-1-1-cam-bim-workbench-bundle

## Resumen

La ficha solicitada corresponde al identificador de Hugging Face `fddfw/freecad-1-1-cam-bim-workbench-bundle`, publicado por el usuario `fddfw`. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: la model card describe un supuesto paquete ejecutable portable para Windows con el nombre de un bundle de bancos de trabajo CAM y BIM de FreeCAD 1.1. No contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia.

El contenido de la model card es incoherente con su titulo y con las etiquetas del repositorio. Mientras el nombre alude a FreeCAD, el texto interno hace referencia a un supuesto entrenador o mod de un videojuego (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`), con instrucciones para descargar un ZIP de 4,8 MB, extraerlo con la contrasena `2026` y ejecutarlo como administrador. Los enlaces apuntan a repositorios de GitHub de terceros, no al repositorio de Hugging Face.

Por tanto, esta ficha documenta un artefacto que no es un modelo de IA. Se mantiene la estructura obligatoria para dejar constancia explicita de la ausencia de datos tecnicos verificables y de los riesgos de seguridad asociados. No debe tratarse como una ficha de modelo generativo ni evaluarse con los criterios habituales de arquitectura, contexto o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable portable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio; no se refiere a capacidades linguisticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto descrito es un ZIP con un binario `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. Los metadatos del repositorio indican etiquetas como `windows`, `windows-11`, `x64`, `portable` y `freecad-1-1-cam-bim-workbench-bundle`, lo que sugiere que el autor pretende distribuirlo como una aplicacion de escritorio empaquetada, no como un modelo.

La model card no aporta informacion sobre datos de entrenamiento, tokens procesados, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. El texto mezcla terminologia de mods de videojuegos (radar 2D, filtro de loot, overlay externo a 144 Hz, tecla de panico `END`, escaner de offsets dinamicos) con el nombre de un bundle de FreeCAD, lo que constituye una inconsistencia grave y sugiere que el contenido fue generado o copiado de forma automatizada sin relacion con el identificador del repositorio.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue real; los codigos de idioma de los metadatos no van acompanados de evaluaciones.
- El unico contenido funcional descrito en la model card son supuestas funciones de un entrenador de videojuego (overlay, ESP, radar, filtro de objetos), sin relacion con FreeCAD ni con IA.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no se ha verificado que el binario descrito realice las funciones que anuncia.
- Uso educativo sobre riesgos de supply chain: puede citarse como ejemplo de repositorio de Hugging Face cuyo contenido no coincide con su nombre ni con sus etiquetas.
- Auditoria de repositorios: util para ilustrar tecnicas de deteccion de model cards generadas de forma fraudulenta o automatizada.
- Formacion en seguridad: permite analizar el patron de distribucion de ejecutables con contrasena en archivos ZIP y enlaces externos a GitHub.
- No se recomienda su descarga, extraccion ni ejecucion en entornos de produccion, personales o corporativos.
- No se identifica ningun caso de uso legitimo de ingenieria, analisis de datos o desarrollo de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- El artefacto descrito se presenta como un binario x64 para Windows 10 (22H2) y Windows 11 (24H2), con un tamano declarado de 4,8 MB, lo que es incompatible con cualquier modelo de lenguaje actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable porque el artefacto no es un modelo de IA. Como referencia de artefactos de software, podria compararse con distribuciones oficiales de FreeCAD, pero no se dispone de datos verificables sobre el contenido real del paquete.

| Criterio | Este repositorio | Distribucion oficial de FreeCAD |
|---|---|---|
| Naturaleza | Ejecutable no verificado con model card incoherente | Aplicacion de CAD open source |
| Parametros | no aplica | no aplica |
| Contexto | no aplica | no aplica |
| Licencia | MIT (declarada) | LGPL-2.1 (FreeCAD) |
| Disponibilidad | Enlace externo a GitHub de terceros | Sitio oficial y repositorios del proyecto |

## Limitaciones y advertencias

- Incoherencia entre el nombre del repositorio (bundle de FreeCAD), las etiquetas y el contenido de la model card (entrenador de un videojuego).
- Distribucion mediante un ZIP protegido con contrasena (`2026`) y un ejecutable que se solicita ejecutar como administrador: patron habitual en campanas de malware.
- Enlaces de descarga alojados en repositorios de GitHub de terceros, no en el repositorio de Hugging Face indicado.
- Ausencia total de pesos, configuracion, tokenizador o documentacion tecnica verificable.
- Cero descargas y cero likes en el momento de la consulta, lo que impide cualquier validacion por parte de la comunidad.
- La licencia MIT declarada no garantiza la legitimidad ni la seguridad del binario distribuido.
- Riesgo elevado de suplantacion de identidad del proyecto FreeCAD y de la plataforma Hugging Face.
- No debe ejecutarse en ninguna maquina, y menos con privilegios de administrador.
- No apto para uso comercial, educativo ni de investigacion en su forma actual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fddfw/freecad-1-1-cam-bim-workbench-bundle
- Enlace de descarga citado en la model card (GitHub de terceros, no verificado): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Segundo enlace citado en la model card (GitHub de terceros, no verificado): https://github.com/ErikMercier70637/freecad-1-1-cam-bim-workbench-bundle/releases/latest
- Proyecto oficial de FreeCAD (referencia del nombre usado): https://www.freecad.org/
