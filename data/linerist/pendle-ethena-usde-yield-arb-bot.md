# Linerist/pendle-ethena-usde-yield-arb-bot

## Resumen

La ficha corresponde a `Linerist/pendle-ethena-usde-yield-arb-bot`, un repositorio alojado en Hugging Face que no contiene un modelo de lenguaje. El contenido publicado es una supuesta aplicacion ejecutable para Windows 10 y Windows 11 (x64) presentada como "bot de arbitraje de rendimiento" sobre Pendle y Ethena USDe, distribuida como archivo ZIP de 4,8 MB con contrasena y un binario `.exe` que se solicita ejecutar como administrador. No hay pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia declarados en la plataforma.

La model card no describe ningun modelo de IA: mezcla terminologia de trading DeFi con referencias a ejecucion de scripts, inyeccion en clientes, `hookmetamethod`, `getgc`, Drawing API y sincronizacion de offsets tras parches. Ademas, el nombre del binario y del archivo ZIP (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`) no guarda relacion con el supuesto bot de arbitraje, y los enlaces de descarga apuntan a repositorios de GitHub de terceros distintos del autor declarado. Estos patrones son caracteristicos de campanas de distribucion de software potencialmente malicioso disfrazado de herramienta financiera o de modelo.

Por tanto, esta ficha documenta un artefacto no verificable y de riesgo elevado, no un modelo open source evaluable. No existe informacion tecnica sobre parametros, contexto, cuantizacion ni entrenamiento, y no se recomienda su descarga ni ejecucion en entornos de produccion o de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos, sin funcionalidad linguistica verificable) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado ninguna arquitectura de red neuronal, dataset, proceso de entrenamiento, RLHF, DPO ni innovacion tecnica de modelado. El artefacto declarado es un ejecutable nativo de Windows x64 (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`, build `v4.8.3 (0BDE68)`) empaquetado en un ZIP de 4,8 MB protegido con contrasena. La model card menciona modulos de "ejecucion sin clave", "workspace con editor Monaco", "compatibilidad sUNC 98%+", "attach multi-instancia" y "sincronizacion de offsets tras parches", que corresponden a vocabulario de herramientas de inyeccion en procesos y no a componentes de un modelo de lenguaje.

No hay trazabilidad de build reproducible, firma de codigo, hash publico verificado ni repositorio de codigo fuente asociado al autor `Linerist`. Los enlaces de descarga apuntan a rutas de GitHub de otras cuentas (`Giovanni9790`, `MichelleFerrari`), lo que rompe la cadena de custodia del artefacto.

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling ni function calling en el sentido de APIs de modelos.
- No se documenta razonamiento multi-paso ni comportamiento de agente basado en LLM.
- El multilingue declarado en los metadatos (14 idiomas) no tiene respaldo en ninguna funcionalidad descrita.
- Las unicas "capacidades" descritas son propias de una herramienta de manipulacion de procesos en Windows: attach a multiples instancias, inyeccion de scripts, editor Monaco embebido y actualizacion de offsets.

## Casos de uso

- No se identifica ningun caso de uso legitimo como modelo de IA: no hay inferencia, pesos ni API.
- El supuesto caso de uso (arbitraje de rendimiento entre Pendle y Ethena USDe) no esta respaldado por documentacion tecnica, direcciones de contrato, estrategia, backtesting ni codigo auditable.
- Ejecucion en estaciones de trabajo de desarrolladores: desaconsejada, por requerir permisos de administrador sobre un binario sin firma ni fuente.
- Integracion en pipelines de CI/CD: no aplicable, al no existir SDK, API ni formato de pesos.
- Investigacion academica o evaluacion de modelos: no aplicable, al no ser un modelo.
- Despliegue en produccion con fines financieros: riesgo alto de fraude o de compromiso del sistema; no recomendado bajo ninguna configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma declarada: Windows 10 y Windows 11, 64 bits (x64).
- VRAM estimada para inferencia: no aplicable (no hay modelo).
- GPU recomendadas: no aplicable.
- Cabe en GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Consumo declarado por el autor: menos de 25 MB de RAM en attach multi-instancia y menos de 57 MB de RAM en sincronizacion de offsets; cifras no verificables.
- Latencia y throughput: no disponibles; la unica cifra publicada es un sondeo de 423 Hz sin metodologia.

## Comparativa con modelos similares

| Criterio | `Linerist/pendle-ethena-usde-yield-arb-bot` | Modelo de lenguaje open source tipico (referencia generica) | Bot de arbitraje DeFi auditable (referencia generica) |
|---|---|---|---|
| Naturaleza | Ejecutable Windows sin fuente | Pesos safetensors/GGUF con model card tecnica | Codigo fuente con contratos y estrategia documentada |
| Parametros | no disponible | Declarados | no aplicable |
| Contexto | no disponible | Declarado | no aplicable |
| Benchmarks | ninguno | Publicados y reproducibles | Backtesting documentado |
| Licencia | MIT declarada | MIT, Apache-2.0, etc. | MIT, GPL, etc. |
| Trazabilidad | Nula (enlaces a terceros) | Repositorio y hashes | Repositorio y auditoria |

No se dispone de modelos comparables dentro de la misma categoria, porque el artefacto no pertenece a ninguna categoria de modelo evaluable.

## Limitaciones y advertencias

- No es un modelo de IA: no hay pesos, arquitectura, tokenizador ni pipeline; la etiqueta de "modelo" en Hugging Face es incorrecta o fraudulenta.
- Inconsistencia grave de nombres: el binario y el ZIP hacen referencia a un supuesto mod de Monster Hunter Wilds, sin relacion con el titulo del repositorio.
- Distribucion mediante ZIP con contrasena y ejecucion "como administrador": practica habitual para evadir analisis automatizado de antivirus y sandboxes.
- Enlaces de descarga alojados en repositorios de GitHub de cuentas distintas al autor declarado: riesgo de suplantacion y de cadena de suministro.
- Terminologia de la model card propia de herramientas de inyeccion en procesos (`hookmetamethod`, `getgc`, Drawing API): superficie de riesgo de manipulacion del sistema.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Licencia MIT declarada sin archivo LICENSE verificable ni titular claro: cobertura legal incierta.
- Riesgo de alucinacion no aplicable, pero riesgo de fraude financiero y de malware: alto.
- No debe ejecutarse en maquinas con credenciales, wallets o claves de API; si ya se ha ejecutado, procede rotar secretos y analizar el sistema.

## Enlaces

- Hugging Face: https://huggingface.co/Linerist/pendle-ethena-usde-yield-arb-bot
- Enlace de descarga citado en la model card (terceros, no verificado): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Enlace de releases citado en la model card (terceros, no verificado): https://github.com/MichelleFerrari/pendle-ethena-usde-yield-arb-bot/releases/latest
- Paper, blog, repositorio oficial o demo: no disponible
