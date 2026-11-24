# kizaze/gmgn-bullx-photon-copytrade-bot-pc

## Resumen

`kizaze/gmgn-bullx-photon-copytrade-bot-pc` no es un modelo de inteligencia artificial ni un conjunto de pesos neuronales. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una supuesta aplicacion portable para Windows 10 y Windows 11 (x64) presentada como bot de copytrading para plataformas de trading de criptomonedas (GMGN, Bullx, Photon). El repositorio no contiene ningun artefacto de aprendizaje automatico: no hay pesos, no hay tokenizador, no hay configuracion de arquitectura y no hay pipeline declarado.

La model card describe un ejecutable denominado `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, distribuido en un archivo ZIP de 4,8 MB protegido con contrasena, con instrucciones para ejecutarlo como administrador. El nombre del binario no guarda relacion alguna con la funcionalidad anunciada (copytrading), lo que constituye una senal de alarma clasica de distribucion de software potencialmente malicioso o de campana de spam en plataformas de modelos.

Por tanto, esta ficha documenta el artefacto como lo que es y advierte de forma explicita de que no debe tratarse como un modelo open source evaluable. No existen parametros, contexto, cuantizaciones ni licencia de pesos que analizar; la licencia MIT declarada aplica, en todo caso, al contenido del repositorio, no a un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene ningun modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO u otros). La model card describe modulos funcionales de un supuesto bot de trading (motor de bundles Jito/MEV, gestor de 20 wallets con Lookup Tables, take profit multinivel, enrutado de ordenes con latencia inferior a 40 ms, almacen de claves AES-256 local y copytrading de "smart money"), pero se trata de descripciones de marketing sin respaldo tecnico verificable en el repositorio.

El unico artefacto distribuido es un binario precompilado de Windows empaquetado en un ZIP de 4,8 MB con contrasena. No se publica codigo fuente, ni hashes de verificacion, ni cadena de compilacion reproducible. El nombre del ejecutable (`kingdom-come-deliverance-2-trainer-...`) es incoherente con la funcion anunciada, lo que sugiere reutilizacion de plantillas de campanas de distribucion de software no verificado.

## Capacidades

- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en modelos.
- Las capacidades que declara la model card son funcionales de un supuesto bot de trading: copia de operaciones de wallets, ejecucion multi-wallet en el mismo bloque, take profit escalonado y enrutado de ordenes por WebSocket/gRPC.
- Ninguna de esas capacidades es verificable a partir del contenido del repositorio.

## Casos de uso

- Ninguno recomendado en un contexto de desarrollo o investigacion con IA. El artefacto no es un modelo y no puede integrarse en pipelines de inferencia, RAG, agentes ni evaluacion de LLM.
- Auditoria de seguridad: el repositorio puede utilizarse como caso de estudio de campanas de spam o de distribucion de binarios no verificados en Hugging Face, revisando patrones como ZIP con contrasena, ejecutable como administrador y nombres incoherentes.
- Formacion en higiene de cadena de suministro: sirve como ejemplo practico de por que no deben ejecutarse binarios de origen desconocido descargados de repositorios de modelos.
- Monitorizacion de plataformas: util para equipos que mantienen listas de bloqueo de repositorios sospechosos en espejos internos de Hugging Face.
- No debe emplearse para trading real: no hay evidencia de que el binario funcione como se describe y su ejecucion implica riesgos de seguridad no acotados.
- No debe emplearse en produccion de ningun tipo: sin codigo fuente, sin firma digital verificada y sin trazabilidad de compilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no existen metricas tipo MMLU, HumanEval o GSM8K que reportar, y las cifras de rendimiento que aparecen en la model card (latencia inferior a 40 ms, 386 Hz de sondeo, consumo de RAM por debajo de 49-64 MB) son afirmaciones del autor sin verificacion independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits, segun la model card.
- VRAM: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Ejecucion en GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes).
- Almacenamiento: el archivo distribuido ocupa 4,8 MB comprimido.
- Latencia y throughput: no verificables; las cifras declaradas por el autor no cuentan con mediciones independientes.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Verificabilidad |
|---|---|---|---|---|---|
| `kizaze/gmgn-bullx-photon-copytrade-bot-pc` | Binario Windows en ZIP | no aplica | no aplica | MIT (declarada) | Nula: sin codigo fuente ni pesos |
| Modelo LLM open source tipico (p. ej. familia Llama, Qwen, Mistral) | Pesos de transformer | Miles de millones | Miles de tokens | Licencia de modelo especifica | Alta: pesos, tokenizador y config publicos |
| Repositorio de herramientas CLI open source | Codigo fuente | no aplica | no aplica | MIT/Apache-2.0 | Alta: codigo auditable |

No existe comparacion tecnica posible con modelos de IA porque el artefacto no pertenece a esa categoria.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Distribucion mediante ZIP con contrasena y ejecutable que requiere privilegios de administrador: patron habitual en campanas de malware.
- Nombre del ejecutable incoherente con la funcionalidad anunciada, lo que indica falta de trazabilidad.
- Ausencia total de codigo fuente, hashes, firma digital o cadena de compilacion reproducible.
- Cero descargas y cero likes en el momento de la consulta, pese a que la model card afirma 593K descargas: contradiccion entre metadatos de la plataforma y contenido del README.
- Riesgo elevado de phishing, robo de claves o exfiltracion de credenciales si se ejecuta en una maquina con wallets o exchanges configurados.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su comportamiento en ejecucion.
- No debe usarse en produccion, ni en entornos con datos sensibles, ni en maquinas con acceso a fondos.
- Se recomienda reportar el repositorio a Hugging Face si se confirma que infringe las politicas de la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kizaze/gmgn-bullx-photon-copytrade-bot-pc
- Enlaces a papers, blogs, repos de codigo o demos: no disponible en la informacion proporcionada.
- Los enlaces de descarga incluidos en la model card apuntan a repositorios de GitHub de terceros y no se reproducen aqui por motivos de seguridad.
