# cdrone360/solana-pump-fun-jito-bundler-bot-portable

## Resumen

La ficha que sigue no describe un modelo de inteligencia artificial. El identificador `cdrone360/solana-pump-fun-jito-bundler-bot-portable` corresponde a un repositorio alojado en Hugging Face cuyo contenido es, segun la propia model card, un ejecutable portable para Windows x64 (`solara-executor-v3-keyless-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como bot de trading para Solana con integracion de Pump.fun, bundles de Jito y ejecucion multi-cartera mediante Lookup Tables. No hay pesos, tokenizador, configuracion de arquitectura ni pipeline asociado.

El autor declarado es el usuario `cdrone360`, con licencia MIT y etiquetas multilingues (catorce idiomas), aunque esas etiquetas describen los idiomas de la documentacion, no capacidades linguisticas de un modelo. El repositorio registra cero descargas y cero likes en el momento de la consulta, y las fechas de creacion y actualizacion son identicas, lo que sugiere una publicacion automatizada sin mantenimiento posterior.

La relevancia para desarrolladores e investigadores es nula en terminos de IA, y alta en terminos de seguridad: la model card distribuye un binario ejecutable alojado en un repositorio de GitHub de terceros, protegido con contrasena y que solicita ejecucion como administrador, ademas de justificar explicitamente las alertas de Windows Defender y SmartScreen. Esta ficha documenta el artefacto y advierte de los riesgos, pero no valida ni recomienda su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (idiomas de la documentacion, no del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`: `solara-executor-v3-keyless-v1.2.2-win64.zip`, 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un ejecutable nativo de Windows compilado para x64, etiquetado internamente como build `v3.7.9 (BE93B1)`. La model card enumera modulos funcionales declarados por el autor: motor de bundles Jito y MEV con dimensionado dinamico de propinas, gestor de claves local AES-256, bundler de veinte carteras mediante Lookup Tables, take profit multinivel, sandbox de paper trading, enrutamiento de ordenes por WebSocket y gRPC, y sondeo a 390-409 Hz. Ninguna de estas afirmaciones incluye metodologia de evaluacion, codigo fuente verificable ni auditoria independiente.

El texto de la model card esta redactado con un patron caracteristico de campanas de distribucion de software potencialmente no deseado: insignias de valoracion inventadas (4,9/5), contrasena fija para descomprimir (`2026`), instrucciones de ejecucion como administrador, justificacion anticipada de alertas de antivirus y enlaces de descarga que apuntan a un repositorio de GitHub ajeno al espacio de nombres del autor en Hugging Face. No hay evidencia de pesos, dataset, RLHF, DPO ni ninguna innovacion tecnica de aprendizaje automatico.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve problemas matematicos.
- No soporta tool calling ni function calling en el sentido de un LLM; las llamadas a red descritas son RPC de Solana y envio de bundles a Jito.
- No dispone de modo de razonamiento, vision, audio ni capacidades multimodales.
- Las capacidades declaradas por el autor son de dominio financiero: ejecucion multi-cartera en el mismo bloque, gestion de propinas para bundles, paper trading y firma local de transacciones.
- El multilingueismo listado corresponde a la documentacion de instalacion, no a un tokenizador ni a comprension de idiomas.

## Casos de uso

No se identifican casos de uso legitimos para desarrolladores o investigadores de IA. Los escenarios que la model card sugiere son los siguientes, documentados unicamente a efectos descriptivos y con las advertencias de la seccion de limitaciones:

- Ejecucion de bundles en Solana: el autor declara envio atomico de transacciones multi-cartera mediante Lookup Tables y bundles de Jito; requeriria claves privadas reales en el equipo local.
- Sniping de lanzamientos en Pump.fun: la combinacion de Pump.fun y Jito se asocia en la practica a compra automatizada en el instante del lanzamiento de un token.
- Gestion de take profit multinivel: scale-out automatico y trailing stop sobre posiciones abiertas.
- Simulacion de estrategias: sandbox de paper trading contra libros de ordenes en vivo, segun el autor.
- Firma no custodiada: almacenamiento local de claves con AES-256 para evitar exponerlas a un servidor remoto.
- Enrutamiento de baja latencia: streaming por WebSocket y gRPC para reducir el tiempo hasta la inclusion en bloque.

Ninguno de estos casos esta verificado por terceros, y varios de ellos (sniping, bundling multi-cartera) pueden constituir manipulacion de mercado o infraccion de los terminos de servicio de las plataformas implicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas cifras de rendimiento son afirmaciones del propio autor, sin metodologia ni verificacion: 99,2 % de consistencia, menos de 52 MB de RAM, menos de 5 ms de respuesta en el bundler, menos de 6 ms en el sandbox, enrutamiento por debajo de 40 ms y sondeo a 390-409 Hz. No deben interpretarse como mediciones reproducibles.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de red neuronal.
- GPU: no aplica; el artefacto es un ejecutable de CPU para Windows x64.
- Sistema operativo declarado: Windows 10 22H2 y Windows 11 24H2, 64 bits.
- Memoria: el autor afirma menos de 52 MB de RAM en uno de los modulos; sin verificacion.
- Almacenamiento: el ZIP ocupa 4,8 MB antes de descomprimir.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el artefacto se ejecuta directamente como `.exe`.
- Latencia y throughput: solo cifras declaradas por el autor, sin datos independientes.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. En la categoria de bots de trading para Solana, la comparacion exigiria auditoria de codigo y de comportamiento en cadena, informacion que no acompana al repositorio.

| Criterio | Este artefacto | Modelo de IA tipico |
|---|---|---|
| Naturaleza | Binario Windows x64 | Pesos + tokenizador + configuracion |
| Pesos publicados | No | Si (safetensors, GGUF) |
| Codigo fuente | No | Habitualmente si |
| Evaluacion reproducible | No | Benchmarks publicados |
| Auditable | No | Si, en la mayoria de casos |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal, y no aporta nada a pipelines de generacion, razonamiento o agentes.
- Riesgo de seguridad elevado: distribucion de un `.exe` desde un repositorio de GitHub de terceros, con contrasena fija (`2026`) y solicitud de ejecucion como administrador, son patrones habituales en la distribucion de malware.
- La model card justifica de antemano las alertas de Windows Defender y SmartScreen; ese encuadre es un indicador de riesgo, no una garantia de legitimidad.
- Ausencia total de codigo fuente, hashes verificables, firma de codigo o auditoria independiente.
- Cero descargas y cero likes: sin senales de uso ni de comunidad que permitan validar el artefacto.
- Riesgo financiero directo: un bot de trading con acceso a claves privadas puede vaciar carteras, y las afirmaciones de rendimiento (99,2 % de consistencia, latencias de milisegundos) no estan verificadas.
- Riesgo regulatorio y de plataforma: el sniping y el bundling multi-cartera en Pump.fun y Jito pueden infringir terminos de servicio y, segun la jurisdiccion, normativa de abuso de mercado.
- La licencia MIT declarada cubre el repositorio, pero no acompana a ningun artefacto verificable ni exime de responsabilidad al usuario.
- Sesgos y alucinacion: no aplica en el sentido de un LLM, pero la documentacion contiene afirmaciones no sustentadas que funcionan como marketing.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cdrone360/solana-pump-fun-jito-bundler-bot-portable
- Enlace de descarga citado en la model card (repositorio de GitHub de terceros, no verificado): https://github.com/GraceFernandez01321/solara-executor-v3-keyless/releases/download/v1.2.0/solara-executor-v3-keyless-v1.2.2-win64.zip
- Releases citadas en la model card (repositorio de GitHub de terceros, no verificado): https://github.com/nayeonp93/solana-pump-fun-jito-bundler-bot-portable/releases/latest
- Papers, blogs, repositorios de codigo y demos: no disponible
