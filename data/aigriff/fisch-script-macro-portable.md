# aigriff/fisch-script-macro-portable

## Resumen

El repositorio `aigriff/fisch-script-macro-portable` no contiene un modelo de inteligencia artificial. Se trata de un paquete de software ejecutable para Windows de 64 bits (build `v4.8.5`, identificador `A17F77`) distribuido como archivo comprimido de 4,8 MB (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip`), que el autor presenta como una herramienta de macro y automatizacion para el juego *Fisch* en Roblox. El artefacto incluye modulos descritos como *server hopper*, teleport por memoria, bucles de farmeo, ESP de entidades y un guardia anti-AFK.

La model card esta redactada con el formato tipico de un modelo de lenguaje (licencia MIT, lista de 14 idiomas, etiquetas de Hugging Face), pero el contenido real describe un binario `.exe` con instrucciones de instalacion, contrasena de descompresion (`2026`) y enlaces a releases de GitHub alojados en repositorios de terceros (`Giovanni9790/monster-hunter-wilds-trainer-mod`, `Volkov78996/fisch-script-macro-portable`). No hay pesos, tokenizador, configuracion de arquitectura ni pipeline declarado (`Pipeline: no disponible`).

Por tanto, esta ficha documenta la ausencia de un modelo y advierte sobre los riesgos del artefacto. Es relevante ahora porque ilustra un patron creciente de publicaciones en Hugging Face que imitan metadatos de modelos (tags multilingues, licencia, badges) para distribuir ejecutables de procedencia dudosa, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, no verificables) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.zip` con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario compilado para Windows 10/11 x64 que, segun la model card, opera mediante lectura de memoria directa del proceso del juego (`direct-memory coordinate teleport`), sondeo a 469 Hz, 13-14 hilos de trabajo y persistencia de configuracion en JSON. No se documentan tokens de entrenamiento, composicion de dataset, RLHF, DPO ni ninguna innovacion en el sentido de aprendizaje automatico.

El binario se entrega comprimido con contrasena (`2026`), practica habitual para evadir el analisis automatico de antivirus y de las plataformas de alojamiento. El nombre interno del ejecutable hace referencia a un supuesto *trainer* de *Monster Hunter Wilds*, lo que resulta incoherente con la funcionalidad declarada para *Fisch* (Roblox): esa discrepancia es una senal clara de reempaquetado o de suplantacion de identidad.

## Capacidades

- No hay generacion de texto, razonamiento, codigo, matematicas ni vision: no es un modelo linguistico.
- No hay soporte de tool calling ni function calling en el sentido de API de modelos.
- No hay soporte de agentes ni razonamiento multi-paso basado en LLM.
- Las capacidades multilingues son solo etiquetas de metadatos; el binario no procesa lenguaje.
- Funcionalidad declarada por el autor (no verificada tecnicamente): automatizacion de macros, teleport por memoria, ESP de entidades, anti-AFK y cambio automatizado de servidor en el juego *Fisch*.

## Casos de uso

- No procede: al no ser un modelo de IA, no existen casos de uso de inferencia, generacion o analisis.
- Auditoria de seguridad: analizar el binario en una maquina virtual aislada y sin red para determinar su comportamiento real antes de cualquier uso.
- Estudio de patrones de abuso en plataformas de modelos: documentar como se disfrazan ejecutables con metadatos de modelo (licencia MIT, lista de idiomas, badges) para mejorar los filtros de moderacion.
- Formacion en higiene de cadena de suministro: usar este caso como ejemplo de enlaces de descarga alojados en repositorios de terceros ajenos al autor declarado.
- Analisis de malware (entorno controlado): extraer indicadores de compromiso (hashes, dominios de *callback*, persistencia en registro) si se sospecha de troyano.
- No se recomienda ningun uso en produccion, en equipos corporativos ni en maquinas con datos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (respuesta en `< 34 ms`, sondeo a `469 Hz` y `146 Hz`, 13-14 hilos) son afirmaciones de marketing sin metodologia, sin entorno de prueba y sin verificacion independiente; no constituyen benchmarks de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo requerido: Windows 10 u 11 de 64 bits, segun la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto no es compatible con estos *runtimes*.
- Latencia y throughput: no disponibles de forma fiable; las cifras del autor no son reproducibles.
- Requisito practico recomendado para su inspeccion: maquina virtual aislada, sin credenciales, sin acceso a red y con instantanea previa.

## Comparativa con modelos similares

| Criterio | `aigriff/fisch-script-macro-portable` | Modelos LLM open source (p. ej. Llama, Qwen, Mistral) | Herramientas de automatizacion de escritorio legitima (p. ej. AutoHotkey, AutoIt) |
|---|---|---|---|
| Naturaleza | Ejecutable Win64 empaquetado | Pesos neuronales | Intérprete de scripts |
| Parametros | no disponible | Miles de millones | no aplica |
| Contexto | no disponible | 8k-1M tokens segun modelo | no aplica |
| Licencia | MIT (declarada) | MIT, Apache 2.0, licencias comunitarias | GPL / freeware |
| Formato de distribucion | `.zip` con `.exe` y contrasena | safetensors, GGUF | Instalador / script |
| Verificabilidad | Baja (binario cerrado, enlaces de terceros) | Alta (pesos auditables) | Media (codigo fuente disponible) |
| Uso comercial | Desaconsejado | Permitido segun licencia | Permitido segun licencia |

No existe comparacion tecnica posible con modelos de IA: la categoria es distinta.

## Limitaciones y advertencias

- No es un modelo de IA: la publicacion usa metadatos de modelo para distribuir un ejecutable, lo que constituye una practica enganosa.
- Nombre interno incoherente (`monster-hunter-wilds-trainer-mod`) respecto a la funcionalidad declarada (*Fisch* en Roblox): indicio de reempaquetado o suplantacion.
- Distribucion con contrasena de descompresion (`2026`): reduce la visibilidad ante antivirus y escaneres automaticos.
- Enlaces de descarga alojados en repositorios de terceros (`Giovanni9790`, `Volkov78996`) distintos del autor declarado (`aigriff`): riesgo de cadena de suministro.
- La propia model card reconoce alertas de Windows Defender y SmartScreen, y pide al usuario que las ignore y ejecute como administrador: patron clasico de ingenieria social.
- Uso de lectura de memoria de un proceso de juego y automatizacion de entrada: probable incumplimiento de los terminos de servicio de Roblox y riesgo de baneo de la cuenta.
- Riesgo de robo de credenciales, instalacion de persistencia o *mineros* si el binario contiene carga maliciosa no declarada.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- La licencia MIT declarada no otorga ninguna garantia sobre el contenido del binario; el autor no ofrece codigo fuente para auditarlo.
- No apto para produccion, entornos corporativos ni maquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aigriff/fisch-script-macro-portable
- Release citada en la model card (terceros, no verificar sin aislamiento): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Repositorio de releases citado (terceros): https://github.com/Volkov78996/fisch-script-macro-portable/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
