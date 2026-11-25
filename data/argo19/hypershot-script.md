# argo19/hypershot-script

## Resumen

`argo19/hypershot-script` es un repositorio alojado en Hugging Face que, a pesar de su ubicación, no contiene un modelo de lenguaje ni pesos de red neuronal. Se trata de un paquete ejecutable para Windows 10 y Windows 11 (x64) distribuido como archivo ZIP de 4,8 MB, con contraseña de descompresión, que la model card describe como un conjunto de "módulos acelerados por hardware". El contenido declarado incluye funciones de overlay externo, radar 2D, filtro de loot, escáner de offsets dinámicos y una capa de renderizado diseñada para evadir la captura de pantalla de OBS, ShadowPlay y Discord.

La relevancia de esta ficha es fundamentalmente negativa: el artefacto no es un modelo de IA open source, sino un ejecutable binario de procedencia dudosa, sin trazabilidad de código, que solicita ejecución como administrador y cuyo README emplea técnicas de ingeniería social típicas de distribución de software potencialmente malicioso (enlaces a repositorios de terceros, contraseña en el archivo, badges con cifras de descargas no verificables). No se dispone de arquitectura, parámetros, contexto ni ningún atributo propio de un modelo fundacional.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, señalando explícitamente qué datos no están disponibles y qué riesgos conlleva su uso, en lugar de inventar especificaciones técnicas que no existen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como ZIP con binario `.exe` de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El artefacto es un binario compilado para Windows x64, empaquetado en `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip` (4,8 MB) y protegido con la contraseña `2026`. La model card menciona un identificador de build `v3.3.1 (9F8EA4)` y afirma el uso de "7 hilos de trabajo", un "escáner de offsets dinámicos a 429 Hz" y una latencia de respuesta inferior a 31 ms, pero no se aporta código fuente, hash verificable del binario, cadena de compilación ni repositorio público auditable.

No se declara corpus de entrenamiento, número de tokens, composición del dataset, ni técnicas de alineación como RLHF o DPO, porque el artefacto no es un modelo lingüístico. La única innovación "técnica" descrita es la exclusión de capturas de pantalla en herramientas de streaming, lo que constituye una funcionalidad de evasión y no una aportación de investigación en IA.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son metadatos del repositorio, no cobertura lingüística de un modelo.
- Funcionalidades declaradas por el autor (no verificadas): overlay externo a 144 Hz o más, radar 2D, filtro de loot por rareza, escáner de offsets dinámicos, capa de renderizado excluida de OBS/ShadowPlay/Discord, tecla de pánico `END` para descarga del proceso y perfiles JSON intercambiables en caliente.
- Estas funcionalidades corresponden, por su descripción, a herramientas de trampa (cheat) para videojuegos, no a capacidades de IA.

## Casos de uso

No se identifican casos de uso legítimos en el ámbito de la IA open source, el desarrollo de software o la investigación. Los escenarios que la model card sugiere son los siguientes, documentados aquí únicamente a efectos descriptivos y con advertencia expresa:

- Overlay en videojuegos: superposición de cajas delimitadoras 2D/3D, esqueletos y distancias sobre la imagen del juego; su uso vulnera habitualmente los términos de servicio de las plataformas de juego.
- Exclusión de captura de pantalla: ocultar la superposición a OBS, ShadowPlay y Discord; esta función está diseñada para dificultar la detección y la moderación.
- Filtro de loot y radar: mostrar objetos por rareza y contenedores cercanos; constituye ventaja competitiva no autorizada en títulos multijugador.
- Escaneo de offsets tras parches: resolución automática de firmas de punteros; sugiere ingeniería inversa de binarios de terceros.
- Perfiles intercambiables: cambio rápido entre presets "Legit", "Visual" y "Custom"; el propio nombre del preset "Legit" indica intención de evadir la detección.
- Descarga de emergencia con tecla `END`: liberación de handles y salida del proceso; funcionalidad orientada a dificultar el análisis forense.

Ninguno de estos escenarios es recomendable. Se documentan para que el lector pueda evaluar el riesgo de forma informada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Las únicas cifras aportadas por el autor son operativas y no verificables: 7 hilos de trabajo, sondeo a 429 Hz, menos de 38 MB de RAM, latencia inferior a 31 ms y una consistencia del 96,4 % en el cambio de perfiles. No hay comparación con alternativas ni metodología de medición.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11, 64 bits (Intel o AMD).
- VRAM: no aplica; el artefacto no ejecuta inferencia de modelos.
- GPU recomendadas: no disponible; no se especifica requisito de GPU.
- RAM declarada: menos de 38 MB en ejecución, según el autor (no verificado).
- Tamaño en disco: archivo ZIP de 4,8 MB; el binario extraído no se detalla.
- Opciones de despliegue: ejecución directa del `.exe` como administrador; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo.
- Latencia y throughput: sin datos verificables; el autor cita menos de 31 ms de respuesta y 429 Hz de sondeo.

## Comparativa con modelos similares

No procede comparación con modelos de IA. A modo de contraste con artefactos de la misma categoría (utilidades binarias para Windows), se indica lo siguiente:

| Criterio | hypershot-script | Utilidad portable típica (p. ej. 7-Zip portable) | Modelo LLM open source (p. ej. Llama 3.1 8B) |
|---|---|---|---|
| Naturaleza | Binario `.exe` sin código fuente | Binario con código fuente público | Pesos de red neuronal |
| Licencia | MIT (declarada) | GPL/LGPL según proyecto | Licencia comunitaria |
| Auditoría posible | No | Sí | Sí (pesos y arquitectura) |
| Contexto | No aplica | No aplica | 128 000 tokens |
| Propósito | Overlay y evasión en juegos | Compresión de archivos | Generación de texto |
| Riesgo de seguridad | Alto (binario opaco, admin, contraseña) | Bajo | Bajo (ejecución local) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como modelo en comparativas técnicas ni en catálogos de LLM.
- Binario opaco: no hay código fuente, hash firmado ni build reproducible; la licencia MIT declarada no es verificable sobre el artefacto distribuido.
- Solicita ejecución como administrador, lo que otorga privilegios totales sobre el sistema.
- El archivo está protegido con contraseña (`2026`), técnica habitual para evadir el análisis automático de antivirus y plataformas de compartición.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`Hiroshis198/...`) distintos del repositorio declarado (`takumi4232/hypershot-script`), lo que rompe la cadena de confianza.
- Las funcionalidades descritas (exclusión de captura, tecla de pánico, presets "Legit") están orientadas a evadir la detección, lo que constituye un indicador de riesgo elevado.
- Uso en videojuegos multijugador: probable violación de los términos de servicio y posible infracción de derechos de terceros por ingeniería inversa.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo.
- Sesgos conocidos: no aplica.
- Restricciones de licencia: la licencia MIT declarada permitiría uso comercial, pero al no haber código ni pesos auditables no puede ejercerse de forma significativa.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta, pese a que la model card afirma 547 000 descargas: contradicción que refuerza la falta de fiabilidad de los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/argo19/hypershot-script
- Repositorio declarado en la model card: https://github.com/takumi4232/hypershot-script
- Repositorio de descarga de terceros citado: https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026
- Paper: no disponible
- Blog o demo: no disponible
