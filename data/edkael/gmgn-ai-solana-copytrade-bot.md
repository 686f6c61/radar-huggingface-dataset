# edkael/gmgn-ai-solana-copytrade-bot

## Resumen

El repositorio `edkael/gmgn-ai-solana-copytrade-bot` alojado en Hugging Face no contiene un modelo de inteligencia artificial en el sentido estricto del termino. Se trata de una publicacion que empaqueta un ejecutable portable para Windows de 64 bits (`rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como un bot de copytrading sobre la red Solana. La model card describe subsistemas de enrutamiento de ordenes, bundles de Jito/MEV, filtros anti-honeypot y espejado de carteras, pero no documenta ningun artefacto de pesos neuronales, tokenizador, configuracion de arquitectura ni ficheros safetensors o GGUF.

El repositorio no declara pipeline, no incluye tarjetas de modelo tecnicas y no expone parametros, contexto ni datos de entrenamiento. Los unicos metadatos verificables son la licencia MIT, una lista de 14 idiomas declarados y un conjunto de etiquetas orientadas a Windows. Las descargas y los likes registrados son cero en el momento de la consulta.

Desde el punto de vista de evaluacion tecnica, esta ficha debe leerse como una advertencia: el contenido de la model card presenta indicios claros de ingenieria social (enlaces a repositorios de terceros no relacionados, contrasena de descompresion fija, instrucciones para desactivar avisos de SmartScreen y ejecutar como administrador). No se recomienda su uso en entornos de produccion ni de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se declara arquitectura de red neuronal; el artefacto es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT |
| Formato de pesos | no disponible (el paquete distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura de red neuronal, datos de entrenamiento, numero de tokens, composicion del corpus ni procesos de alineacion (RLHF, DPO, SFT). La model card no incluye ningun apartado tecnico de entrenamiento ni referencias a papers.

El unico contenido descriptivo hace referencia a modulos funcionales de un supuesto bot de trading: enrutamiento de ordenes por debajo de 40 ms, motor de bundles Jito/MEV, bundler de 20 carteras mediante Lookup Tables, espejado de carteras de smart money, take profit multinivel y filtro precompra de honeypots. Estos terminos pertenecen al dominio de la infraestructura blockchain de Solana, no al de modelado de lenguaje, y no vienen acompanados de especificaciones verificables (repositorio de codigo, auditoria, dependencias o binarios firmados).

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- La unica funcionalidad descrita es la de un supuesto bot de copytrading sobre Solana, sin especificacion tecnica verificable.
- No se proporcionan artefactos de modelo (pesos, tokenizador, configuracion) que permitan evaluar capacidades.

## Casos de uso

No se identifican casos de uso legitimos para un modelo de IA, ya que el repositorio no contiene un modelo. Los escenarios que plantea la model card (copytrading automatizado, ejecucion de bundles MEV, espejado de carteras) no son verificables y presentan riesgos regulatorios y de seguridad significativos. A continuacion se enumeran, a modo de advertencia, los escenarios que el autor sugiere y por que no deberian adoptarse:

- Copytrading automatizado de carteras: el autor afirma espejado de ballenas en tiempo real, pero no aporta codigo, auditoria ni identificacion del proveedor de datos; el binario se distribuye sin firma.
- Ejecucion de bundles Jito/MEV: no hay evidencia de integracion con el cliente de Solana ni de gestion de claves; el binario se ejecutaria con privilegios de administrador.
- Bundling de 20 carteras mediante Lookup Tables: no se documenta el manejo de claves privadas, lo que constituye un riesgo critico de custodia.
- Filtro precompra de honeypots: se describe como verificacion de mint/freeze authority, pero no se especifica la fuente RPC ni el metodo de validacion.
- Take profit multinivel y trailing stop: no hay especificacion de logica ni de gestion de ordenes.
- Distribucion portable en Windows: el paquete requiere contrasena fija y desactivar avisos de SmartScreen, practica incompatible con un despliegue seguro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica (no hay modelo neuronal; el autor declara un consumo inferior a 32 MB de RAM para el ejecutable).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes para este artefacto).
- Latencia y throughput: el autor declara enrutamiento por debajo de 40 ms y sondeo a 269 Hz, sin evidencia independiente que lo respalde.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparables porque el repositorio no contiene un modelo de IA. Como referencia de artefactos de naturaleza distinta, se indica:

| Artefacto | Tipo | Parametros | Contexto | Licencia | Verificable |
|---|---|---|---|---|---|
| edkael/gmgn-ai-solana-copytrade-bot | Ejecutable Windows x64 | no disponible | no disponible | MIT | No |
| Modelo de lenguaje open source tipico (p. ej. familia Llama, Qwen, Mistral) | Pesos transformer | 7B-70B | 8K-128K | variable | Si (safetensors, config, tokenizador) |
| Bot de trading open source tipico (p. ej. frameworks en Python) | Codigo fuente | no aplica | no aplica | variable | Si (repositorio publico) |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuracion ni artefactos evaluables.
- La model card incluye enlaces a repositorios de GitHub de terceros no relacionados con el autor declarado, lo que constituye una senal de posible suplantacion o redireccion maliciosa.
- Se solicita ejecutar un binario como administrador y desactivar avisos de SmartScreen/Windows Defender, practica de alto riesgo.
- Se distribuye un ZIP protegido con contrasena fija (`2026`), tecnica habitual para evadir analisis automatizados de antivirus.
- No hay evidencia de auditoria de seguridad, firma de codigo ni trazabilidad del binario.
- El supuesto bot opera con claves privadas de carteras Solana; no se documenta el modelo de custodia, lo que implica riesgo de perdida total de fondos.
- El trading automatizado y las estrategias MEV estan sujetos a regulacion financiera en multiples jurisdicciones; su uso puede infringir normativa local.
- La licencia MIT se declara sobre el repositorio, pero no cubre necesariamente el binario distribuido ni sus dependencias.
- No se han publicado resultados de benchmarks ni evaluaciones independientes.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/edkael/gmgn-ai-solana-copytrade-bot
- Repositorio GitHub referenciado en la model card (no verificado como del autor): https://github.com/Shuji50/rob-run-cheat-mod-menu-pc
- Repositorio GitHub referenciado en la model card (no verificado como del autor): https://github.com/danielletas/gmgn-ai-solana-copytrade-bot
- Paquete ZIP referenciado en la model card (no verificado): https://github.com/Shuji50/rob-run-cheat-mod-menu-pc/releases/download/v1.2.0/rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip
