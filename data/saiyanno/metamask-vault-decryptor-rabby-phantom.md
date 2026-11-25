# Saiyanno/metamask-vault-decryptor-rabby-phantom

## Resumen

La ficha solicitada corresponde al identificador `Saiyanno/metamask-vault-decryptor-rabby-phantom` publicado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial: el repositorio contiene una supuesta aplicacion ejecutable para Windows x64 (un supuesto "decryptor" de vaults de monederos como MetaMask, Rabby y Phantom), empaquetada en un ZIP de 4,8 MB protegido con contrasena y distribuida mediante enlaces a repositorios de GitHub de terceros. No hay pesos, no hay arquitectura de red neuronal, no hay tokenizador ni pipeline asociado.

El contenido de la model card es material promocional con afirmaciones no verificables (98 % de compatibilidad sUNC, 462 000 descargas, 478 Hz de polling) y tecnicas propias de ejecutores de scripts para videojuegos, no de un modelo de lenguaje. El uso de contrasenas en el archivo comprimido, la peticion de ejecutar como administrador y la tematica de extraccion de credenciales de monederos de criptomonedas son patrones compatibles con software malicioso o fraudulento.

Esta ficha se redacta por rigor documental, pero debe quedar claro que no es evaluable como modelo de IA y que su descarga y ejecucion conllevan un riesgo de seguridad elevado. No se dispone de informacion tecnica verificable sobre arquitectura, entrenamiento ni rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El artefacto anunciado es `solara-executor-v3-keyless-2026-v1.2.2-win64.zip`, un comprimido de 4,8 MB con contrasena (`2026`) que contiene un binario `solara-executor-v3-keyless-2026-v1.2.2-win64.exe`. La model card menciona conceptos de ejecutores de scripts (Luau VM, `hookmetamethod`, `getgc`, Drawing API, sUNC), lo que sugiere que el binario es un inyector o ejecutor de scripts, no un modelo entrenado.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, RLHF, DPO ni ninguna innovacion tecnica de modelado. Cualquier afirmacion sobre capacidades del binario proviene unicamente del texto promocional del autor y no es verificable.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- El autor afirma compatibilidad con scripts en Luau y con APIs de ejecucion (`hookmetamethod`, `getgc`, Drawing API), sin evidencia independiente.
- El autor afirma una interfaz con editor Monaco y consola de trazas, sin evidencia independiente.
- No hay capacidades multilingues demostradas; los idiomas listados son solo metadatos de la model card.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA, porque no lo es.
- Procesamiento de lenguaje natural: no aplicable, no hay modelo de lenguaje.
- Generacion de codigo asistida: no aplicable, no hay modelo generativo.
- Analisis de documentos o atencion al cliente: no aplicable.
- Investigacion en IA: no aplicable, no hay pesos ni arquitectura publicada.
- Auditoria de seguridad: el unico uso defensivo razonable seria el analisis del binario en un entorno aislado (sandbox, maquina virtual sin red) para caracterizar su comportamiento, nunca su ejecucion en un equipo de produccion.
- Formacion y concienciacion: puede emplearse como ejemplo documentado de campana de distribucion de software sospechoso en sesiones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (98 % de compatibilidad sUNC, 96,1 % de consistencia, 478 Hz de polling, 462 000 descargas) son afirmaciones promocionales sin metodologia ni fuente verificable, por lo que no se recogen como resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no es un modelo de IA).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue: no aplicables (vLLM, llama.cpp, Ollama y TGI no soportan este artefacto).
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.
- Consumo de RAM declarado por el autor: menos de 62 MB (no verificado).

## Comparativa con modelos similares

| Producto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saiyanno/metamask-vault-decryptor-rabby-phantom | Ejecutable Windows (no modelo de IA) | no disponible | no disponible | MIT (declarada) | Hugging Face, con binario alojado en GitHub de terceros |
| Modelo de lenguaje open source de referencia | Modelo de IA | no disponible en esta ficha | no disponible | no disponible | no disponible |

No existe una categoria de "modelos similares" aplicable, porque el artefacto no es un modelo de IA. La comparacion con modelos de lenguaje, de vision o multimodales no tiene sentido tecnico.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con criterios de calidad de modelado, benchmarks de razonamiento ni pruebas de inferencia.
- Riesgo de seguridad alto: el patron (ZIP con contrasena, ejecutable como administrador, tematica de extraccion de vaults de monederos, enlaces a repositorios de GitHub ajenos al autor) coincide con tecnicas habituales de distribucion de malware y de campanas de robo de credenciales.
- La licencia MIT declarada no garantiza la legitimidad del binario ni la ausencia de codigo malicioso; la licencia solo cubre el contenido del repositorio, no el comportamiento del ejecutable.
- Riesgo de alucinacion: no aplicable al no haber modelo generativo, pero las afirmaciones de la model card no son verificables y no deben tomarse como datos tecnicos.
- Limitaciones de idioma y contexto: no aplicables.
- Uso comercial: desaconsejado; la extraccion de credenciales de monederos de terceros puede vulnerar legislacion de proteccion de datos, normativa de ciberseguridad y terminos de servicio, ademas de constituir un delito en muchas jurisdicciones.
- Cero descargas y cero likes en el momento de la consulta, lo que reduce la trazabilidad de posibles analisis independientes.
- No se recomienda su ejecucion en ningun equipo, y menos con privilegios de administrador o en maquinas con acceso a monederos reales.

## Enlaces

- Hugging Face: https://huggingface.co/Saiyanno/metamask-vault-decryptor-rabby-phantom
- Repositorio de GitHub citado en la model card: https://github.com/pmohammed01/metamask-vault-decryptor-rabby-phantom
- Repositorio de GitHub alternativo citado: https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Paper: no disponible
- Blog del autor: no disponible
- Demo: no disponible
