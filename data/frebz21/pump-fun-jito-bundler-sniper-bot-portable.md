# frebz21/pump-fun-jito-bundler-sniper-bot-portable

## Resumen

La ficha solicitada corresponde al identificador de Hugging Face `frebz21/pump-fun-jito-bundler-sniper-bot-portable`, publicado por el usuario `frebz21`. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un modelo de lenguaje: la model card describe un supuesto ejecutable portable para Windows x64 orientado a operaciones de trading automatizado en la red Solana (bundler, sniper y copytrade sobre plataformas tipo Pump.fun y Jito). No hay pesos, arquitectura neuronal, tokenizador ni pipeline de inferencia asociados al repositorio.

El contenido del repositorio es una pagina de distribucion de software binario: un archivo `.zip` de 4,8 MB con contrasena de extraccion, un ejecutable `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe` y una guia de instalacion que indica ejecutarlo como administrador. Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`carlos7088`, `henkbonnet297`) y no a artefactos alojados en Hugging Face. El propio repositorio declara licencia MIT y una lista de idiomas que no guarda relacion con capacidades linguisticas de un modelo, sino con la cobertura de la interfaz del programa.

Por tanto, esta ficha no puede documentar parametros, contexto, cuantizaciones ni benchmarks porque no existen. Se detalla a continuacion la informacion verificable y se advierte de los riesgos de seguridad asociados a la distribucion de binarios de procedencia no verificada con instrucciones de ejecucion como administrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO, SFT). La model card describe funcionalidades de un programa de trading: filtro pre-compra de honeypots, copytrade de wallets, enrutamiento de ordenes con latencia declarada inferior a 40 ms, take profit multinivel, bundler de 20 wallets mediante Lookup Tables y un sandbox de paper trading. Estas afirmaciones son marketing del autor y no van acompanadas de codigo fuente, auditoria ni artefactos verificables en el repositorio.

El unico contenido tecnico estructurado es un manifiesto de build con nombre de ejecutable, version (`v1.2.7`, build `B723CCF3DF`), tamano del archivo (4,8 MB) y contrasena del ZIP (`2026`). No hay informacion sobre el lenguaje de implementacion, dependencias, firma digital del binario ni hash de integridad publicado de forma independiente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No dispone de modo de razonamiento (thinking), vision, audio ni capacidades multimodales.
- Segun la model card, el binario afirmaria realizar: filtrado de honeypots, copytrade de wallets, enrutamiento de ordenes por WebSocket/gRPC, take profit escalonado, bundling multi-wallet y simulacion de estrategias.
- Estas capacidades no estan verificadas por codigo fuente, tests ni auditoria publicados en el repositorio.

## Casos de uso

- No procede documentar casos de uso de IA: el artefacto no es un modelo y no puede integrarse en pipelines de inferencia, RAG, agentes ni generacion de codigo.
- Evaluacion de riesgos de supply chain: el repositorio es un ejemplo util para formar a equipos en la deteccion de binarios distribuidos con contrasena en el ZIP y ejecucion como administrador, practica habitual en campanas de malware.
- Analisis de model cards enganosas: sirve como caso de estudio de repositorios que usan Hugging Face como canal de distribucion de software ajeno al ecosistema de modelos.
- Monitorizacion de repositorios sospechosos: equipos de seguridad pueden usar este tipo de fichas para catalogar y bloquear dominios y cuentas asociadas.
- Formacion en higiene de dependencias: ilustra por que no debe ejecutarse software de trading no auditado en maquinas con claves de wallet.
- No se recomienda ningun uso operativo del binario en produccion ni en entornos con acceso a fondos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni equivalentes porque el artefacto no es un modelo. Las cifras de latencia (< 40 ms), RAM (< 64 MB, < 31 MB) y frecuencia de polling (172 Hz) que aparecen en la model card son afirmaciones del autor sin metodologia de medicion ni reproducibilidad.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia neuronal.
- Plataforma declarada: Windows x64 (Windows 11 mencionado en los tags).
- RAM declarada por el autor: menos de 64 MB y menos de 31 MB en distintos modulos (no verificable).
- Almacenamiento: archivo ZIP de 4,8 MB.
- GPU recomendadas: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: solo cifras de marketing del autor, sin evidencia.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de lenguaje open source tipico (p. ej. familia Llama o Qwen) | Bot de trading propietario auditado |
|---|---|---|---|
| Naturaleza | Binario Windows distribuido via Hugging Face | Pesos de red neuronal | Software con licencia y soporte |
| Parametros | No aplica | Miles de millones | No aplica |
| Contexto | No aplica | Decenas de miles de tokens | No aplica |
| Codigo fuente | No publicado | Pesos y a menudo codigo | Habitualmente disponible bajo contrato |
| Auditoria | Ninguna | Variable | Habitual |
| Licencia | MIT declarada | Licencias abiertas (Apache, Llama, etc.) | Comercial |
| Verificabilidad | Nula (ZIP con contrasena, enlaces externos) | Alta (hashes, safetensors) | Media-alta |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de capacidades linguisticas o de razonamiento es infundada.
- Distribucion de un ejecutable con contrasena en el ZIP y ejecucion como administrador: patron clasico de malware y de evasion de analisis automatico.
- Enlaces de descarga alojados en repositorios de GitHub de terceros no vinculados al autor del repositorio de Hugging Face.
- Ausencia total de codigo fuente, hashes, firma digital o auditoria: imposible verificar que el binario hace lo que afirma.
- Riesgo elevado de robo de claves privadas de wallet si se ejecuta en una maquina con acceso a fondos.
- El uso de bots de sniper y bundling puede infringir terminos de servicio de plataformas y normativa financiera; en la Union Europea, la operativa automatizada de criptoactivos esta sujeta a MiCA.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su procedencia.
- Cero descargas y cero likes en el momento de la consulta: sin senales de comunidad ni de validacion por terceros.
- No debe ejecutarse en produccion, en entornos corporativos ni en maquinas con credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/frebz21/pump-fun-jito-bundler-sniper-bot-portable
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- Repositorio GitHub citado (terceros): https://github.com/henkbonnet297/pump-fun-jito-bundler-sniper-bot-portable
- Paper, blog o demo oficial: no disponible
