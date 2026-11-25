# smaazahmed/path-of-exile-2-map-radar

## Resumen

El repositorio `smaazahmed/path-of-exile-2-map-radar` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows (build `v3.4.9`, identificador `D2D974F999`) distribuido como archivo ZIP de 8,9 MB (`path-of-exile-2-map-radar-v1.2.0-win64.zip`) que, segun su propia model card, implementa funcionalidades de tipo *game cheat* para el videojuego Path of Exile 2: escaner dinamico de offsets de memoria, capa de renderizado excluida de capturas (OBS, ShadowPlay, Discord), perfiles JSON intercambiables en caliente, suavizado de entrada por curvas de Bezier y clave de panico (`END`) para descarga instantanea.

El artefacto no expone pesos, tokenizador, configuracion de transformer ni pipeline de inferencia. La plataforma lo etiqueta con `pipeline: no disponible` y los tags hacen referencia a sistema operativo (`windows`, `windows-11`, `x64`, `portable`), no a capacidades cognitivas. El autor declara licencia MIT y una lista de trece idiomas en los metadatos, pero esa lista corresponde a la interfaz del ejecutable, no a un modelo linguistico.

Su relevancia para desarrolladores e investigadores de IA open source es nula en terminos de modelado. La ficha se redacta, no obstante, para dejar constancia explicita de que el identificador no corresponde a un modelo y para advertir de los riesgos de seguridad asociados a la distribucion de binarios de este tipo a traves de plataformas de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio; corresponden a la interfaz del binario) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un binario compilado para Windows x64 que, segun la model card, opera en modo usuario externo ("user-mode external core") sin inyeccion de DLL, emplea Desktop Duplication API para el renderizado y realiza escaneo de offsets de memoria del proceso del juego con resolucion automatica de firmas de punteros tras cada parche. El ZIP se distribuye protegido con contrasena (`2026`), un patron habitual en la distribucion de binarios que evitan el analisis automatizado de antivirus.

No hay datos sobre tokens de entrenamiento, composicion del dataset, RLHF, DPO ni innovaciones de modelado. Cualquier lectura en clave de IA del repositorio seria una extrapolacion sin base.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve problemas matematicos.
- No soporta *tool calling* ni *function calling* en el sentido de la API de modelos.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingues declaradas se refieren a la localizacion de la interfaz del ejecutable.
- Funcionalidad real declarada por el autor: escaneo dinamico de offsets de memoria del juego, capa de renderizado superpuesta excluida de capturas de pantalla, perfiles JSON conmutables con una tecla, suavizado de entrada por curvas de Bezier y descarga inmediata mediante tecla de panico.
- Estas funcionalidades constituyen, en la practica, asistencia automatizada en un videojuego multijugador y pueden contravenir los terminos de servicio del juego.

## Casos de uso

- No aplica: al no ser un modelo de IA, no existen casos de uso legitimos de inferencia, generacion o analisis.
- Auditoria de seguridad: un equipo de seguridad puede usar el identificador como ejemplo de repositorio mal etiquetado en Hugging Face para calibrar filtros de moderacion de artefactos no-modelo.
- Investigacion sobre contaminacion de hubs de modelos: sirve como caso de estudio de como un binario de *cheat* se camufla con metadatos de modelo (tags de idioma, licencia MIT, badges de descargas).
- Formacion en analisis de malware: el patron de ZIP con contrasena y ejecutable como administrador es un ejemplo clasico de evasion de escaneo que puede diseccionarse en laboratorio aislado.
- No se recomienda su ejecucion en entornos de produccion, personales ni corporativos bajo ninguna circunstancia.
- Cualquier escenario de uso del binario contra el juego implicaria riesgo de baneo de cuenta y posible vulneracion de los terminos de servicio del editor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos numericos de la model card son metricas internas del ejecutable (respuesta en menos de 11 ms para el escaner de offsets, sondeo a 439 Hz para perfiles y 341 Hz para el nucleo externo, 10 hilos de trabajo), que no son comparables con benchmarks de modelos y no han sido verificados de forma independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11, x64.
- VRAM: no aplica (no hay inferencia de red neuronal).
- GPU recomendada: no aplica; el autor menciona el uso de Desktop Duplication API, que requiere una GPU con soporte de composicion de escritorio en Windows.
- Cabe en cualquier equipo con Windows 10/11 x64; el paquete ocupa 8,9 MB.
- Opciones de despliegue: no aplica (no hay soporte para vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles de forma verificable; las cifras de la model card no son auditables.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos similares" porque el artefacto no es un modelo. Como referencia de contraste, un modelo de lenguaje real de la misma plataforma incluiria pesos en safetensors o GGUF, una arquitectura documentada, una longitud de contexto declarada y resultados de evaluacion reproducibles; ninguna de estas caracteristicas esta presente aqui.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse, evaluarse ni desplegarse como tal.
- El binario se distribuye comprimido con contrasena (`2026`), practica que dificulta el analisis automatico por parte de antivirus y motores de reputacion.
- La model card indica explicitamente que Windows Defender y SmartScreen pueden alertar sobre el ejecutable y recomienda ejecutarlo como administrador y anadirlo a listas blancas: una instruccion de riesgo elevado que ningun usuario deberia seguir a ciegas.
- El propio autor describe el binario como "game cheat", lo que implica un conflicto directo con los terminos de servicio de Path of Exile 2 y riesgo de sancion o baneo de cuentas.
- La licencia MIT declarada en los metadatos no aclara la procedencia del codigo ni otorga garantias sobre el contenido del ejecutable.
- Riesgo de alucinacion: no aplica; el riesgo real es de seguridad (posible inclusion de codigo malicioso no declarado, exfiltracion de credenciales o persistencia).
- La lista de idiomas de los metadatos no debe interpretarse como capacidad multilingue del artefacto.
- Uso comercial: desaconsejado en cualquier caso; la licencia MIT del repositorio no cubre el uso del binario contra un servicio de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/smaazahmed/path-of-exile-2-map-radar
- Repositorio GitHub referenciado en la model card: https://github.com/andreas99824/path-of-exile-2-map-radar
- Descarga directa citada por el autor (no recomendada): https://github.com/andreas99824/path-of-exile-2-map-radar/releases/latest/download/path-of-exile-2-map-radar-v1.2.0-win64.zip
- Pagina de releases referenciada: https://github.com/andreas99824/path-of-exile-2-map-radar/releases/latest
