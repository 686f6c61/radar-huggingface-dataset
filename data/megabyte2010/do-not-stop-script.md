# megabyte2010/do-not-stop-script

## Resumen

El repositorio `megabyte2010/do-not-stop-script` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un artefacto empaquetado para Windows x64 que la propia model card describe como un binario independiente de tipo *game cheat*, distribuye como archivo ZIP protegido con contrasena (`2026`) y se ejecuta como administrador en equipos de escritorio. No hay pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia asociados al repositorio.

La model card emplea terminologia propia de fichas de modelos (etiquetas de licencia, idiomas y formato) para presentar una utilidad de escritorio con modulos de escaneo de offsets, suavizado de entrada, overlay externo a 144 Hz y descarga mediante tecla de panico. Los datos declarados (build `v2.4.9`, firma `322ECDA1FD`, tamano de 8,9 MB, supuestas 319K descargas) no corresponden a ningun artefacto de machine learning y no son verificables desde la informacion proporcionada.

Esta ficha se redacta por rigor documental: cualquier lector que llegue al repositorio buscando un modelo open source debe saber que no lo encontrara aqui. Ademas, el patron de distribucion (binario cerrado, contrasena en el propio README, instrucciones para desactivar avisos de SmartScreen y ejecutar como administrador) es caracteristico de campanas de malware, por lo que se recomienda no descargar ni ejecutar el contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario nativo x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas en la model card, no capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido del repositorio es un paquete de software propietario compilado para Windows de 64 bits (`do-not-stop-script-v1.2.0-win64.exe`, build `v2.4.9`, firma `322ECDA1FD`) distribuido dentro de un ZIP de 8,9 MB. La model card enumera modulos funcionales de una herramienta de trampas para videojuegos: escaner dinamico de offsets, suavizado de entrada tipo bezier, nucleo externo en modo usuario, overlay externo a 144 Hz o mas, recarga en caliente de perfiles JSON y descarga por tecla de panico (`END`).

No hay informacion sobre datos de entrenamiento, tokens, composicion del dataset, RLHF, DPO ni innovaciones tecnicas de modelado. Los unicos "datos tecnicos" son cifras de marketing incluidas en la propia model card (tiempos de respuesta inferiores a 31 ms, 17 ms o 18 ms, consumo de RAM inferior a 43 MB, sondeo a 436 Hz, consistencia del 97,9 %), sin metodologia de medicion ni verificacion independiente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un modelo; los idiomas listados son etiquetas del repositorio.
- No dispone de modo *thinking*, vision, audio ni ninguna otra capacidad de inferencia.
- El unico contenido funcional descrito es una utilidad de escritorio para Windows x64 orientada a la manipulacion de procesos de terceros.

## Casos de uso

No se identifican casos de uso legitimos como modelo de IA, porque no lo es. Los escenarios que plantea la model card son los siguientes, descritos a modo de advertencia y no de recomendacion:

- Manipulacion de procesos de videojuegos mediante escaneo de offsets y lectura de memoria: el binario se ejecuta como administrador y aplica modulos de lectura externa sobre procesos objetivo.
- Overlay grafico a 144 Hz o mas con cajas delimitadoras y esqueletos: se presenta como capa de renderizado externo sobre el juego.
- Suavizado de entrada configurable con radios de FOV y curvas humanizadas: pensado para automatizar entrada de puntero.
- Perfiles de configuracion intercambiables en caliente (Legit, Visual, Custom): gestion de presets mediante archivos JSON.
- Descarga instantanea con tecla `END`: liberacion de handles y salida del proceso.
- Distribucion de software mediante ZIP con contrasena y enlace a un repositorio de GitHub de terceros (`manonlaurent77/do-not-stop-script`), ajeno al propietario del repositorio en Hugging Face.

Ninguno de estos casos constituye un uso productivo, de investigacion o de desarrollo de software legitimo, y varios de ellos pueden infringir los terminos de servicio de plataformas de juego y la legislacion aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (menos de 31 ms, 17 ms y 18 ms de respuesta; 436 Hz de sondeo; 97,9 % de consistencia; menos de 43 MB de RAM) son afirmaciones del autor sin metodologia, sin conjunto de prueba y sin verificacion externa, por lo que no se presentan como resultados de rendimiento comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits (x64).
- Espacio en disco declarado: 8,9 MB para el archivo ZIP.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un ejecutable nativo de Windows.
- Latencia y throughput: no disponibles como metricas de modelo; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" con la que comparar este repositorio, ya que no contiene pesos ni arquitectura. Frente a utilidades de escritorio, la comparacion queda fuera del alcance de esta ficha y no se dispone de datos verificables para establecerla.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuracion ni pipeline. Cualquier expectativa de inferencia es incorrecta.
- El artefacto distribuido es un binario cerrado para Windows que la propia model card describe como *game cheat*, con instrucciones para ejecutarlo como administrador.
- La contrasena del ZIP (`2026`) esta publicada en el propio README, lo que anula cualquier proteccion y es un patron habitual en distribuciones maliciosas.
- La model card incluye indicaciones para desactivar o ignorar avisos de Windows Defender y SmartScreen, practica de alto riesgo que no debe seguirse.
- El enlace de descarga apunta a un repositorio de GitHub de un tercero (`manonlaurent77/do-not-stop-script`) distinto del propietario del repositorio en Hugging Face, lo que impide verificar la cadena de custodia del binario.
- Las cifras de descargas (319K+), version y firma no son verificables desde los metadatos de Hugging Face, que registran 0 descargas y 0 likes.
- La licencia MIT declarada en los metadatos no acompana necesariamente al binario distribuido por un tercero; la licencia del `.exe` es desconocida.
- Uso de la herramienta en juegos online puede conllevar el baneo de cuentas y, segun la jurisdiccion, responsabilidad legal.
- No se recomienda descargar, extraer ni ejecutar el contenido de este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/megabyte2010/do-not-stop-script
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/manonlaurent77/do-not-stop-script
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/manonlaurent77/do-not-stop-script/releases/latest/download/do-not-stop-script-v1.2.0-win64.zip
