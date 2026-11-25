# okyak/maxon-zbrush-2026-imm-brushes-portable

## Resumen

El repositorio `okyak/maxon-zbrush-2026-imm-brushes-portable` no contiene un modelo de inteligencia artificial. Se trata de una publicacion alojada en Hugging Face que, bajo una denominacion que imita el nombre comercial de un software de escultura digital (Maxon ZBrush 2026), distribuye un ejecutable para Windows x64 empaquetado en un archivo ZIP de 4,8 MB protegido con contrasena. La model card no describe pesos, arquitectura, tokenizador ni dataset alguno; en su lugar incluye instrucciones de descarga, extraccion y ejecucion como administrador de un binario denominado `delta-executor-pc-2026-v1.2.2-win64.exe`.

El contenido de la model card describe funcionalidades propias de un ejecutor de scripts para Roblox (auto-ejecucion de directorios, integracion con una VM Luau, adjuncion a multiples instancias de cliente, inyeccion de scripts en memoria y sincronizacion de offsets tras parches del cliente). Es decir, el artefacto real es un supuesto exploit o cheat de terceros, no un modelo fundacional ni un modelo ajustado. La etiqueta `license: mit` y la lista de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) son metadatos heredados del formato de model card de Hugging Face, no indicativos de capacidades linguisticas reales del artefacto.

Por tanto, esta ficha documenta un artefacto no-modelo y advierte de su naturaleza. No existe informacion tecnica verificable sobre parametros, contexto, cuantizacion ni rendimiento, y el contenido del README presenta multiples senales de riesgo de seguridad (distribucion de binarios con contrasena, solicitud de privilegios de administrador, evasio de SmartScreen/Defender, URLs de descarga alojadas en repositorios de GitHub de terceros no relacionados con el autor declarado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los 14 codigos de idioma del README son metadatos de plantilla, no capacidades verificadas) |
| Licencia | mit (declarada; sin relacion con el contenido distribuido) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni pesos) |

Otros datos del repositorio: ID `okyak/maxon-zbrush-2026-imm-brushes-portable`, autor `okyak`, 0 descargas, 0 likes, creado el 2026-11-24, tamano declarado del paquete 4,8 MB, contrasena del archivo `2026`, build citada `v4.4.9 (79CB71)`.

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de red neuronal, ni datos de entrenamiento, ni proceso de alineacion (RLHF/DPO), ni innovaciones tecnicas de modelado. La model card describe, en su lugar, un ejecutable de Windows con funciones de inyeccion de scripts en procesos de cliente, polling a 141 Hz, tiempos de respuesta declarados de menos de 8 ms, 20 ms y 27 ms para distintas operaciones, y un consumo declarado inferior a 35 MB de RAM. Estas cifras son afirmaciones del autor del README y no han sido verificadas de forma independiente.

La unica "arquitectura" identificable es la de un empaquetado ZIP con contrasena que contiene un binario PE para Windows x64, distribuido mediante enlaces a releases de GitHub ajenos al repositorio de Hugging Face. No hay trazabilidad de build reproducible, ni firma de codigo, ni hashes publicados.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues verificadas; los codigos de idioma del README son plantilla.
- No dispone de modo thinking, vision, audio ni ninguna modalidad de modelo.
- El README atribuye al binario funciones de auto-ejecucion de scripts, integracion con una VM Luau, adjuncion a multiples instancias de cliente y sincronizacion de offsets tras parches; se trata de funcionalidad de ejecutor de scripts de terceros, no de capacidades de IA.

## Casos de uso

No existen casos de uso legitimos como modelo de IA. Los escenarios que plantea el README son incompatibles con un uso aceptable y con las condiciones de servicio de las plataformas a las que apunta:

- Ejecucion de scripts no autorizados en clientes de terceros: el binario se presenta como ejecutor para inyectar scripts en un cliente de Roblox, lo que vulnera habitualmente los terminos de servicio de dicha plataforma y puede conllevar el baneo de cuentas.
- Distribucion de software con contrasena y solicitud de privilegios de administrador: patron habitual de campanas de malware; no debe ejecutarse en entornos de produccion ni en maquinas personales.
- Suplantacion de marca: el nombre imita Maxon ZBrush 2026 para atraer busquedas de usuarios interesados en el software de escultura digital legitimo.
- Inflado de metricas: el README declara 800K+ descargas y una calificacion del 99 %, mientras que el repositorio de Hugging Face registra 0 descargas y 0 likes.
- Evasion de controles de seguridad: el FAQ instruye explicitamente a ignorar avisos de Windows Defender y SmartScreen y a ejecutar como administrador, lo que agrava el riesgo.
- Investigacion de seguridad: el unico uso defendible seria el analisis estatico y dinamico en un entorno aislado (sandbox sin red, maquina virtual desechable) para caracterizar la muestra, nunca su ejecucion en un sistema real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye cifras de latencia autoreportadas (menos de 8 ms, 20 ms y 27 ms en distintas operaciones, polling a 141 Hz, menos de 35 MB de RAM) que no constituyen benchmarks de modelo y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo que inferir.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits, sobre procesadores Intel y AMD x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto se ejecuta como binario nativo de Windows.
- Latencia y throughput: solo cifras autoreportadas por el autor, sin verificacion independiente.
- Requisito de privilegios: el README exige ejecutar como administrador, lo que amplia la superficie de riesgo.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable porque el artefacto no es un modelo de IA. Como referencia de contraste, un modelo de lenguaje real de la misma plataforma publicaria pesos en safetensors o GGUF, parametros, longitud de contexto y resultados de benchmarks; ninguno de estos elementos esta presente aqui.

| Criterio | Este artefacto | Modelo de IA tipico en Hugging Face |
|---|---|---|
| Pesos | Ausentes (ZIP con `.exe`) | safetensors / GGUF |
| Parametros | No declarados | Declarados |
| Contexto | No declarado | Declarado |
| Benchmarks | No disponibles | Habitualmente publicados |
| Licencia | MIT declarada, sin relacion con el contenido | Coherente con el artefacto |
| Uso previsto | Ejecutor de scripts de terceros | Inferencia de lenguaje, vision, etc. |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de malware: binario sin firma, protegido con contrasena y distribuido via enlaces externos; patron clasico de troyano o infostealer.
- Suplantacion de marca: el nombre imita Maxon ZBrush 2026 sin autorizacion aparente del titular.
- Instrucciones de evasion: el README pide desactivar o ignorar SmartScreen y Defender y ejecutar como administrador.
- Metricas inconsistentes: 800K+ descargas y 99 % de calificacion declaradas frente a 0 descargas y 0 likes reales en Hugging Face.
- Riesgo legal: la distribucion de ejecutores de scripts para plataformas de terceros puede infringir terminos de servicio y normativa de propiedad intelectual.
- Licencia MIT irrelevante: no otorga derechos sobre el software de Maxon ni sobre el cliente de terceros al que apunta el ejecutable.
- Sin soporte ni mantenimiento verificables: 0 descargas, 0 likes, sin issues ni historial de builds.
- Recomendacion: no descargar ni ejecutar; si se analiza, hacerlo exclusivamente en sandbox aislado y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/okyak/maxon-zbrush-2026-imm-brushes-portable
- Model card original (README del autor): incluida en la pagina anterior
- Enlace de descarga citado en el README (no verificado, no recomendado): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Releases citadas en el README (no verificadas, no recomendadas): https://github.com/MepageHas93/maxon-zbrush-2026-imm-brushes-portable/releases/latest
- Sitio oficial del software legitimo de referencia: https://www.maxon.net/en/zbrush
