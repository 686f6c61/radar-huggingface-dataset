# KodakBackFat/facefusion-3-uncensored-portable

## Resumen

`KodakBackFat/facefusion-3-uncensored-portable` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que distribuye un supuesto ejecutable portable para Windows presentado como «Facefusion 3 Uncensored Portable», una herramienta de 8,9 MB empaquetada en un ZIP protegido con contrasena. El contenido de la model card no describe pesos, arquitectura ni proceso de entrenamiento alguno: describe un binario `.exe` que se ejecuta como administrador y que el propio autor etiqueta internamente como «game cheat» en su seccion de preguntas frecuentes.

Por tanto, no existe informacion tecnica verificable sobre parametros, contexto, cuantizacion ni licencia de un modelo subyacente. El unico dato estructural disponible es la licencia declarada (MIT) y una lista de catorce idiomas en los metadatos, que en este contexto parece servir unicamente a la difusion del repositorio y no a capacidades linguisticas reales de un modelo.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para identificar un artefacto que se disfraza de modelo o herramienta de codigo abierto en un hub de modelos, y para dejar constancia de que no debe tratarse como un modelo evaluable ni desplegarse en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se distribuye un ejecutable `.exe` para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos; sin modelo linguistico verificable) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 8,9 MB con un `.exe` interno) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, ni transformer, ni MoE, ni SSM, ni modelo hibrido. El repositorio no incluye pesos en safetensors, GGUF ni ningun otro formato de tensor. El artefacto es un archivo `facefusion-3-uncensored-portable-v1.2.0-win64.zip` de 8,9 MB, protegido con la contrasena `2026`, que contiene un ejecutable `facefusion-3-uncensored-portable-v1.2.0-win64.exe` identificado con el build `v3.6.9 (904FC5)`.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, RLHF, DPO ni ninguna innovacion tecnica de inferencia. Las unicas «caracteristicas» descritas en la model card son funcionalidades de un supuesto software de trampas para videojuegos: capa de renderizado resistente a capturas de pantalla (OBS, ShadowPlay, Discord), escaner de offsets dinamicos con sondeo a 192 Hz, tecla de panico `END`, perfiles JSON intercambiables en caliente, suavizado de entrada Bezier y overlay externo a 144 Hz o mas. Ninguna de estas afirmaciones es verificable ni constituye una especificacion de modelo.

## Capacidades

- No hay capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision documentadas ni atribuibles a un modelo de IA.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue real; los catorce idiomas de los metadatos son etiquetas de repositorio, no una evaluacion de competencia linguistica.
- Las unicas «capacidades» declaradas corresponden a un supuesto cheat para videojuegos (overlay ESP, suavizado de apuntado, evasio de capturas), sin evidencia tecnica ni binarios auditables.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA. El artefacto no es desplegable como modelo de lenguaje, vision ni multimodal.
- Auditoria de seguridad: un equipo de seguridad puede usar esta ficha como referencia para reconocer repositorios de Hugging Face que distribuyen ejecutables disfrazados de modelos y bloquearlos en sus politicas de proxy o de gestion de artefactos.
- Formacion interna: sirve como ejemplo documentado de ingenieria social en torno a «descargas gratuitas» con contrasena en el ZIP y ejecucion como administrador, patron tipico de distribucion de malware.
- Investigacion de cadena de suministro: permite trazar la relacion entre el repositorio de Hugging Face y el repositorio de GitHub referenciado en la model card, util para analisis de campanas de distribucion.
- Politica de cuarentena en hubs internos: justifica reglas que exijan pesos en safetensors o GGUF y rechacen artefactos `.exe` o `.zip` con contrasena en un registro de modelos.
- Documentacion de incidentes: base para un informe interno que explique por que no debe ejecutarse un binario de origen desconocido con privilegios de administrador en estaciones de trabajo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, porque no hay un modelo subyacente que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un ejecutable de Windows x64 que, segun la model card, requiere Windows 10 22H2 o Windows 11 24H2 y ejecucion como administrador.
- Latencia y throughput: no disponibles; las cifras de sondeo (192 Hz, 129 Hz) que aparecen en la model card corresponden a afirmaciones del supuesto cheat, no a inferencia de un modelo.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable, ya que el repositorio no contiene un modelo de IA. Frente a cualquier modelo open source real (por ejemplo, un LLM con pesos en safetensors y licencia Apache 2.0 o MIT), la diferencia no es de rendimiento sino de naturaleza del artefacto: aqui se distribuye un binario opaco de 8,9 MB frente a decenas o cientos de gigabytes de pesos auditables.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, no hay arquitectura y no hay evaluaciones. Cualquier uso como modelo de lenguaje, vision o multimodal es inviable.
- La model card se autodenomina «game cheat» en su propia seccion de preguntas frecuentes, lo que situa el artefacto fuera del ambito de las herramientas de IA y dentro del de software potencialmente malicioso o fraudulento.
- Distribucion mediante ZIP con contrasena (`2026`) y ejecucion como administrador: patron habitual para evadir analisis automatizados y obtener privilegios elevados.
- Cero descargas y cero «likes» en el momento de la consulta, con fechas de creacion y actualizacion del 24 de noviembre de 2026, lo que sugiere un repositorio de reciente creacion y sin validacion por parte de la comunidad.
- Las insignias de la model card (797K+ descargas, build v3.6.9) son afirmaciones del autor no verificables y no coinciden con las metricas reales del repositorio en Hugging Face.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario distribuido ni sobre su procedencia; la licencia de un repositorio no certifica la seguridad del ejecutable.
- Riesgo elevado de malware, robo de credenciales o mineria en el equipo donde se ejecute el `.exe`; no debe ejecutarse en entornos de desarrollo ni de produccion.
- No debe citarse como modelo en informes tecnicos ni incluirse en comparativas de rendimiento de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KodakBackFat/facefusion-3-uncensored-portable
- Repositorio de GitHub referenciado en la model card: https://github.com/lewandowski309/facefusion-3-uncensored-portable
- Pagina de releases referenciada: https://github.com/lewandowski309/facefusion-3-uncensored-portable/releases/latest
- Paper, blog o demo oficial: no disponible
