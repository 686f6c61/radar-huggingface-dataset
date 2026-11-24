# onebase2026/path-of-exile-2-map-hack-win11

## Resumen

El repositorio `onebase2026/path-of-exile-2-map-hack-win11` no contiene un modelo de inteligencia artificial. Se trata de un artefacto empaquetado como binario portable para Windows 10/11 de 64 bits que, segun su propia model card, se presenta como una herramienta de trampas ("game cheat") para el videojuego Path of Exile 2, con funciones de overlay externo, ESP de cajas delimitadoras, radar 2D, filtro de loot y suavizado de entrada tipo Bezier. El autor lo publica bajo licencia MIT y lo etiqueta con catorce idiomas, pero no incluye pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia.

La ficha se redacta, por tanto, como evaluacion tecnica del artefacto publicado en Hugging Face, no de un modelo de lenguaje. No hay parametros, contexto, cuantizacion ni datos de entrenamiento porque el contenido distribuido es un archivo ZIP de 4,8 MB con un ejecutable y un password de extraccion. Cualquier uso como modelo de IA es inviable.

La relevancia de documentarlo es la de senalar el riesgo: el paquete se distribuye mediante enlaces a repositorios de GitHub de terceros, incluye un ejecutable que solicita privilegios de administrador y emplea nombres de archivo que no coinciden con el titulo del repositorio (referencias a "monster-hunter-wilds-trainer-mod"), lo que constituye un patron habitual de malware o de distribucion de software no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto descrito en la model card es un ejecutable nativo de Windows (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`, build `v2.4.7`, identificador `5839CC`) que, segun el autor, opera mediante inyeccion de overlay externo, escaneo dinamico de offsets tras parches del juego, radar 2D y suavizado de entrada. Los unicos "datos" tecnicos declarados son parametros de comportamiento del cheat (respuesta en menos de 12 ms para el cambio de perfiles JSON, menos de 13 ms para la capa de render, 10 hilos de trabajo, consistencia del 96,2 % en la resolucion de firmas de punteros), sin ninguna verificacion independiente.

No hay informacion sobre conjuntos de datos, tokens procesados, RLHF, DPO ni innovaciones de modelado. La etiqueta `license: mit` aplica al repositorio, no a un modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No soporta agentes ni razonamiento multi-paso.
- El multilingue declarado es una etiqueta de metadatos del repositorio, no una capacidad del binario.
- El binario afirma implementar overlay externo a 144 Hz o mas, cajas 2D/3D, esqueletos de huesos, ESP de distancia, radar 2D, filtro de loot por rareza y perfiles JSON con intercambio en caliente.
- Afirma incluir una capa de render "stream-proof" para excluirse de capturas de OBS, ShadowPlay y Discord.
- Solicita ejecucion como administrador y un password de extraccion (`2026`).

## Casos de uso

- Ninguno legitimo como modelo de IA. El artefacto no procesa lenguaje ni datos del usuario en el sentido de un modelo fundacional.
- Auditoria de seguridad: analizar el binario en un entorno aislado para determinar si el ejecutable realiza acciones maliciosas, dado que solicita privilegios de administrador y se distribuye con password en el ZIP para evadir analisis automatizado.
- Estudio de tecnicas de evasion de captura: la capa "stream-proof" declarada es un caso de interes para investigadores de anti-cheat y de integridad de capturas.
- Formacion en deteccion de repositorios sospechosos: el patron de nombres cruzados (titulo del repo distinto del nombre del ejecutable) sirve como ejemplo de ingenieria social en Hugging Face.
- No se recomienda su uso para trampas en Path of Exile 2: viola los terminos de servicio del juego y puede conllevar el baneo de la cuenta.
- No se recomienda su instalacion en equipos personales ni corporativos por el riesgo de ejecucion de codigo no verificado con privilegios elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (x64), segun la model card.
- VRAM: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Cabe en cualquier PC con Windows x64; el paquete ocupa 4,8 MB.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: el autor declara menos de 12 ms para cambio de perfil y menos de 13 ms para la capa de render, sin verificacion independiente.
- Privilegios: requiere ejecucion como administrador.

## Comparativa con modelos similares

| Criterio | Este artefacto | Modelo de IA tipico en HF | Otro cheat publicado |
|---|---|---|---|
| Parametros | no disponible | millones a cientos de miles de millones | no disponible |
| Contexto | no disponible | miles a millones de tokens | no disponible |
| Rendimiento medido | no disponible | benchmarks publicados | no disponible |
| Licencia | MIT | variable | variable |
| Disponibilidad | 0 descargas, 0 likes | variable | variable |

No disponible la comparacion con modelos de IA comparables porque la categoria no coincide.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de malware: ejecutable de origen no verificado, distribuido con password en el ZIP y con nombres de archivo que no coinciden con el titulo del repositorio.
- Solicita privilegios de administrador, lo que amplia el impacto de cualquier accion maliciosa.
- La licencia MIT del repositorio no garantiza la legalidad del uso del software en el contexto del juego; viola los terminos de servicio de Path of Exile 2.
- Posible baneo de cuentas de juego y de plataformas asociadas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de comunidad que valide el artefacto.
- Las cifras de rendimiento del autor (12 ms, 13 ms, 96,2 %) no son verificables.
- No apto para produccion, ni para entornos corporativos, ni para equipos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onebase2026/path-of-exile-2-map-hack-win11
- Enlace de descarga citado en la model card: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Releases citadas: https://github.com/dawidpeterson20/path-of-exile-2-map-hack-win11/releases/latest
- Paper, blog o demo: no disponible.
