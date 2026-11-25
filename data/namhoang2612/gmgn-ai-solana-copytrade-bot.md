# namhoang2612/gmgn-ai-solana-copytrade-bot

## Resumen

`namhoang2612/gmgn-ai-solana-copytrade-bot` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es una presunta aplicacion ejecutable para Windows de 64 bits, empaquetada en un archivo ZIP de 4,8 MB protegido con contrasena, que se presenta como un bot de copytrading para la red Solana. El autor declarado es el usuario `namhoang2612` y la licencia indicada en los metadatos es MIT.

El artefacto no contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia; la model card describe modulos de enrutamiento de ordenes, bundles Jito/MEV, filtros antiharney (honeypot) y copia de carteras de ballenas. Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`Shuji50/rob-run-cheat-mod-menu-pc`, `danielletas/gmgn-ai-solana-copytrade-bot`) y el ejecutable se denomina `rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`, denominacion ajena al supuesto bot de trading.

Por tanto, esta ficha documenta un artefacto no modelo, con multiples senales de riesgo de seguridad (binario sin firmar, contrasena fija en la documentacion, peticion explicita de desactivar SmartScreen y ejecutar como administrador, enlaces cruzados a repositorios no relacionados). No debe tratarse como un modelo evaluable ni desplegarse en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos del repositorio, no capacidades del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion como ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card enumera componentes descritos como subsistemas de un binario: enrutamiento de ordenes con latencia declarada inferior a 40 ms sobre WebSocket y gRPC, motor de bundles Jito/MEV con dimensionado dinamico de propinas, agrupacion de 20 carteras mediante Lookup Tables, espejo de carteras de smart money, take profit multinivel con trailing stop y filtro previo a la compra basado en autoridades de mint/freeze y bloqueo de liquidez.

Estas cifras (menos de 32 MB de RAM, 269 Hz de sondeo, 4 hilos de trabajo, respuesta en menos de 22 ms) son afirmaciones del autor sin verificacion independiente, sin repositorio de codigo fuente y sin artefactos reproducibles. No hay dataset, tokens de entrenamiento, RLHF ni innovacion tecnica alguna verificable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No dispone de tool calling, function calling ni soporte de agentes en el sentido de un LLM.
- Las capacidades declaradas son funcionales de un bot de trading: copia de operaciones, ejecucion multi-cartera, gestion de take profit y filtrado de tokens.
- La lista de idiomas de los metadatos refleja etiquetas del repositorio, no capacidades linguisticas del binario.
- No se documenta ninguna capacidad de vision, audio ni modo de razonamiento.

## Casos de uso

No se identifican casos de uso legitimos recomendables para este artefacto. A continuacion se describen escenarios tecnicos en los que se enmarcaria segun su propia documentacion, con la advertencia de que no deben ejecutarse sin auditoria previa del binario en un entorno aislado:

- Estudio de malware en sandbox: analisis estatico y dinamico del ejecutable en una maquina virtual sin red para determinar su comportamiento real, dado que el binario no esta firmado y solicita privilegios de administrador.
- Auditoria de cadena de suministro: verificacion de los repositorios de GitHub enlazados y de la discrepancia entre el nombre del ejecutable y el supuesto producto de trading.
- Formacion en seguridad: uso como ejemplo documentado de model card fraudulenta en Hugging Face, con enlaces a binarios alojados fuera de la plataforma.
- Analisis de ingenieria social: revision de tecnicas de persuasion empleadas (insignias de descargas falsas, contrasena fija, instrucciones para desactivar SmartScreen).
- Investigacion de fraude en criptoactivos: correlacion de los dominios y repositorios citados con campanas conocidas de drenadores de carteras.
- Respuesta a incidentes: si un usuario ya lo ejecuto, procedimiento de rotacion de claves de wallet y revision de transacciones firmadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, segun la documentacion del autor.
- VRAM: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Memoria RAM declarada por el autor: menos de 32 MB en ejecucion (no verificado).
- Tamano del paquete: 4,8 MB comprimido.
- Opciones de despliegue: ejecucion nativa en Windows; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: cifras declaradas por el autor (menos de 40 ms de enrutamiento, 269 Hz de sondeo) sin verificacion independiente.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el artefacto no es un modelo de IA. Frente a herramientas legitimas de trading algoritmico en Solana (por ejemplo, frameworks open source de ejecucion on-chain), la diferencia critica es que aqui no hay codigo fuente publico, ni auditoria, ni repositorio verificable.

| Criterio | Este artefacto | Bot open source auditado (categoria generica) |
|---|---|---|
| Codigo fuente | no disponible | publico y revisable |
| Pesos o modelo | no aplica | no aplica |
| Binario firmado | no | habitual en distribuciones oficiales |
| Contrasena en el ZIP | si (`2026`) | no habitual |
| Instruccion de desactivar SmartScreen | si | no |
| Repositorio de origen | enlaza a terceros no relacionados | coherente con el proyecto |

## Limitaciones y advertencias

- No es un modelo de IA: la ficha de Hugging Face no describe pesos, arquitectura ni pipeline; el repositorio se usa como canal de distribucion de un ejecutable.
- Senales claras de riesgo: ZIP con contrasena fija documentada, binario sin firma, peticion de ejecutar como administrador, instrucciones para ignorar SmartScreen y Windows Defender.
- Discrepancia de identidad: el ejecutable se llama `rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`, un nombre ajeno a un bot de copytrading, y los enlaces apuntan a repositorios de GitHub de otros usuarios.
- Insignias de descargas (586K+) no verificables: Hugging Face registra 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de robo de fondos: un binario de este tipo puede exfiltrar claves privadas o firmar transacciones no autorizadas; no debe ejecutarse en una maquina con wallets activas.
- Licencia MIT declarada en metadatos, sin fichero de licencia ni codigo fuente que la respalde; sin garantias de ningun tipo.
- Sin soporte, mantenimiento ni trazabilidad del autor; repositorio creado y actualizado el mismo dia (2026-11-24).
- Recomendacion operativa: no desplegar en produccion, no ejecutar en equipos personales y, si se analiza, hacerlo en sandbox sin red y sin acceso a carteras.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/namhoang2612/gmgn-ai-solana-copytrade-bot
- Repositorio de GitHub enlazado en la model card (descarga del ZIP): https://github.com/Shuji50/rob-run-cheat-mod-menu-pc/releases/download/v1.2.0/rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip
- Repositorio de GitHub secundario citado: https://github.com/danielletas/gmgn-ai-solana-copytrade-bot/releases/latest
- Paper, blog o demo oficial: no disponible
