# kyrylo1808/gmgn-bullx-photon-copytrade-bot

## Resumen

`kyrylo1808/gmgn-bullx-photon-copytrade-bot` no es un modelo de lenguaje ni un modelo de IA en sentido estricto. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una supuesta aplicacion ejecutable para Windows (formato `.exe` dentro de un archivo `.zip`), presentada por el autor como un bot de copytrading para plataformas de criptomonedas (GMGN, BullX, Photon). No incluye pesos, tokenizador, configuracion de arquitectura ni ningun artefacto propio de un modelo de aprendizaje automatico.

El repositorio presenta un patron tipico de distribucion de software potencialmente no deseado: enlaces de descarga que apuntan a un repositorio de GitHub de terceros (`Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026`), un nombre de archivo que no guarda relacion con el proposito declarado (`lossless-scaling-3-dlss4-unlocked`), contrasena fija para descomprimir (`2026`) y peticion de ejecucion como administrador. Ademas, la model card incluye afirmaciones de rendimiento no verificables (descargas de 773K, valoracion del 99%, 134 Hz de sondeo, enrutamiento de ordenes en menos de 40 ms) sin ninguna evidencia tecnica.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para dejar constancia de que en Hugging Face se publican repositorios que no son modelos y que pueden suponer un riesgo de seguridad. No debe tratarse como un modelo evaluable ni desplegarse en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin relacion con un modelo linguistico) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio no contiene ficheros `safetensors`, `GGUF`, `onnx`, `config.json`, `tokenizer.json` ni ningun otro artefacto propio de un modelo. El contenido descrito en la model card es un binario `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe` (build `v2.4.9`, identificador `38E37E33A8`) empaquetado en un ZIP de 4,8 MB protegido con la contrasena `2026`.

Las afirmaciones de la model card sobre "modulos de copytrading", "boveda AES-256 local", "filtro de honeypots" o "enrutamiento sub-40 ms" no vienen acompanadas de codigo fuente, repositorio publico verificable, auditoria ni documentacion tecnica. No hay informacion sobre datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia porque no aplica.

## Capacidades

- No se puede verificar ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision: no hay modelo.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues reales; los codigos de idioma de los metadatos son meramente declarativos.
- La model card atribuye al ejecutable funciones de copytrading (take profit multinivel, sandbox de paper trading, espejo de wallets, filtro de honeypots, firma local de claves), pero ninguna es verificable ni auditable con la informacion publicada.

## Casos de uso

- Ninguno recomendado en produccion. El artefacto no es un modelo y no puede integrarse en pipelines de inferencia (vLLM, TGI, llama.cpp, Ollama).
- Auditoria de seguridad: un analista puede usar esta ficha para documentar el patron de publicacion (ZIP con contrasena, enlace externo a GitHub, peticion de privilegios de administrador) y anadir reglas de deteccion en filtros de repositorios.
- Formacion en higiene de supply chain: sirve como ejemplo didactico de repositorio de Hugging Face que no contiene un modelo y que mezcla metadatos de licencia MIT con distribucion de binarios opacos.
- Investigacion de campanas de distribucion: el nombre del ZIP (`lossless-scaling-3-dlss4-unlocked`) sugiere un posible reempaquetado de contenido ajeno para atraer descargas, lo que puede estudiarse en analisis de malware.
- Verificacion de metadatos: util para probar herramientas que clasifican repositorios por `pipeline_tag`, `library_name` o presencia de pesos, ya que este caso carece de todos ellos.
- No debe usarse para copytrading real, gestion de claves ni conexion a exchanges con fondos, dado que no hay evidencia de que el binario haga lo que declara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de la model card (773K descargas, 99% de valoracion, 134 Hz, menos de 40 ms de enrutamiento, menos de 47 MB de RAM, 99,1% de consistencia) no son benchmarks de modelo ni estan respaldadas por metodologia alguna; no se reproducen como resultados verificables.

## Requisitos de hardware

- VRAM: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada por el autor: Windows 10 (22H2) y Windows 11 (24H2), arquitectura x64.
- Opciones de despliegue: no aplica (no es compatible con vLLM, llama.cpp, Ollama, TGI ni similares).
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existe categoria de modelo comparable: el repositorio no contiene un modelo de IA. Frente a repositorios legitimos de Hugging Face, la diferencia clave es la ausencia total de pesos, configuracion y codigo fuente auditable, frente a la presencia de un binario Windows ofuscado por contrasena.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede evaluarse con MMLU, HumanEval ni GSM8K.
- Riesgo de seguridad alto: distribucion de un `.exe` protegido con contrasena y solicitud de ejecucion como administrador, sin codigo fuente ni firma verificable.
- Enlace de descarga alojado en un repositorio de GitHub de terceros (`Hiroshis198/...`) distinto del autor declarado (`kyrylo1808`, `Giusepper00`), lo que impide atribuir autoria.
- Nombre del artefacto (`lossless-scaling-3-dlss4-unlocked`) incoherente con el proposito declarado (copytrading), indicio de reempaquetado o suplantacion.
- Afirmaciones de rendimiento no verificables y sin metodologia.
- Licencia MIT declarada en metadatos, pero sin fichero `LICENSE` ni titulares claros que permitan determinar derechos sobre el binario.
- Riesgo financiero: cualquier uso como bot de trading con claves o fondos reales puede provocar perdida de capital.
- Recomendacion: no descargar ni ejecutar; si se analiza, hacerlo en maquina virtual aislada y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kyrylo1808/gmgn-bullx-photon-copytrade-bot
- Repositorio GitHub citado como origen de la release: https://github.com/Giusepper00/gmgn-bullx-photon-copytrade-bot
- Repositorio GitHub de descarga referenciado en la model card: https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026
- Paper: no disponible
- Blog o demo oficial: no disponible
