# koncsik/redacto-eu-pii-ner-q4f16

## Resumen

koncsik/redacto-eu-pii-ner-q4f16 es una version cuantizada en formato ONNX de un modelo de clasificacion de tokens (token classification) especializado en la deteccion de informacion personal identificable (PII). No es un modelo entrenado desde cero: deriva directamente de bardsai/eu-pii-anonimization-multilang, al que se le aplica una conversion a ONNX en fp16 y posteriormente una cuantizacion de pesos a 4 bits (q4f16, MatMulNBits, tamano de bloque 32, simetrica). El autor lo publica como artefacto de distribucion de la extension de navegador Redacto, mantenida por HunKonTech.

Su relevancia no esta en la investigacion de arquitecturas, sino en el despliegue: es el componente de IA local que la extension Redacto descarga en el primer uso para detectar y anonimizar datos personales antes de que el texto llegue a un servicio de IA en la nube. La cuantizacion a 4 bits reduce el peso del repositorio a unos 0,2 GB y mantiene el consumo de memoria en torno a 1 GB durante la carga, lo que permite ejecutarlo en el navegador tanto por la ruta WebGPU como por el fallback CPU/WASM.

Se distribuye bajo licencia Apache-2.0 y en formato ONNX con datos externos, verificado mediante un manifiesto con tamanos y hashes SHA-256. El publico objetivo son desarrolladores que necesitan anonimizacion de texto en cliente, sin enviar datos a servidores de terceros, y que buscan un modelo compacto listo para transformers.js.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa (segun tag `xlm-roberta` y modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 ONNX: fp16 con cuantizacion de pesos a 4 bits (MatMulNBits, weight-only, block size 32, simetrica) |
| Idiomas soportados | multilingue (el modelo base se denomina `multilang`); lista concreta de idiomas no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (formato external-data; repo de 0,2 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo original. El tag `xlm-roberta` y la ficha del modelo base bardsai/eu-pii-anonimization-multilang (DOI 10.57967/hf/8721) indican que se trata de un encoder transformer XLM-RoBERTa adaptado a una tarea de etiquetado de secuencias (NER) orientada a entidades de tipo PII, con pipeline `token-classification`. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO; en un modelo de este tipo el ajuste habitual es supervisado sobre corpus anotados con etiquetas BIO.

Lo que si esta documentado es el post-procesado realizado por koncsik: conversion del modelo fuente a ONNX en fp16 y despues a 4 bits con MatMulNBits en modo weight-only (bloque de 32, simetria), con los pesos almacenados en ficheros de datos externos. El autor advierte explicitamente de que estos ficheros no son los originales del upstream. El repositorio incluye un fichero `redacto-model.json` que lista cada fichero con su tamano y SHA-256, y la extension verifica cada descarga contra ese manifiesto.

## Capacidades

- Deteccion de entidades PII en texto: nombres, correos electronicos, telefonos, direcciones, IBAN y BSN (numero de identificacion personal neerlandes), segun la descripcion publica de Redacto.
- Etiquetado de secuencias a nivel de token (NER), no generacion de texto.
- Sustitucion de valores detectados por marcadores tipo `[Name#1]` y restauracion posterior de los valores reales en la respuesta del modelo, una funcionalidad implementada por la extension que consume este modelo.
- Ejecucion 100% local en navegador mediante transformers.js, con ruta WebGPU y fallback CPU/WASM.
- Capacidad multilingue heredada del modelo base (denominado `multilang`); el alcance exacto por idioma no esta documentado en la informacion disponible.
- Deteccion basada solo en patrones (regex) como modo alternativo que no requiere el modelo, disponible en cualquier sistema soportado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de clasificacion, no un modelo generativo.
- No dispone de modo de vision, audio ni "thinking mode".

## Casos de uso

- Anonimizacion previa a prompts de IA: la extension intercepta el texto del usuario, sustituye los datos personales por marcadores y envia al servicio de IA solo el texto anonimizado; al recibir la respuesta, restaura los valores originales en local.
- Cumplimiento de RGPD en flujos de trabajo con asistentes LLM: evita que datos personales de clientes o empleados salgan de la maquina del usuario, reduciendo la exposicion como encargado de tratamiento.
- Deteccion de IBAN y BSN en documentos financieros o administrativos neerlandeses y europeos antes de compartirlos con herramientas externas.
- Redaccion de correos y tickets de soporte: limpieza automatica de nombres, telefonos y direcciones antes de reenviar el contenido a un equipo o a un sistema de ticketing externo.
- Integracion en formularios web y CRM: comprobacion en cliente de que un campo libre no contiene PII no declarada antes de persistirla.
- Uso offline o en redes restringidas: al ejecutarse en el navegador con unos 1 GB de memoria, funciona en equipos sin acceso a APIs externas o con requisitos de soberania de datos.
- Auditoria de corpus: preetiquetado de conjuntos de texto para localizar posibles fugas de datos personales antes de usarlos en entrenamiento o analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall o F1 sobre conjuntos como CoNLL, MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con el modelo base sin cuantizar. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- Memoria en ejecucion: aproximadamente 1 GB con el modelo cargado, segun la documentacion del proyecto Redacto.
- Tamano en disco: repositorio de 0,2 GB; la extension lo descarga en el primer uso porque las tiendas de complementos no aceptan paquetes de mas de 200 MB.
- GPU: funciona en la ruta WebGPU, lo que en la practica cubre GPU integradas y dedicadas modernas con soporte de WebGPU en el navegador; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- CPU: dispone de fallback CPU/WASM, por lo que puede ejecutarse sin GPU aunque con mayor latencia (cifra no disponible).
- Cabe sin problema en GPU de consumo y en equipos de gama media, dado el reducido consumo de memoria.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (WebGPU o WASM); tambien puede consumirse como modelo ONNX desde otros runtimes compatibles. No esta pensado para vLLM, TGI, llama.cpp u Ollama, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| koncsik/redacto-eu-pii-ner-q4f16 | Encoder NER PII, ONNX q4f16 | no disponible | no disponible | apache-2.0 | HuggingFace, transformers.js |
| bardsai/eu-pii-anonimization-multilang | Encoder NER PII (modelo fuente) | no disponible | no disponible | apache-2.0 (DOI 10.57967/hf/8721) | HuggingFace |
| Horizon-Labs/pii-redactor-base | Redaccion de PII | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada. Como alternativa no basada en modelo neuronal existe la deteccion por patrones (regex) que el propio Redacto usa como modo ligero, con cobertura limitada a formatos predefinidos.

## Limitaciones y advertencias

- Modelo exclusivamente de etiquetado de tokens: no genera texto ni mantiene conversaciones; cualquier caso de uso que requiera generacion necesita otro modelo en paralelo.
- Riesgo de falsos negativos y falsos positivos inherente a la deteccion de PII: entidades poco frecuentes, formatos locales o texto con errores ortograficos pueden escapar al detector, y la anonimizacion nunca debe considerarse una garantia absoluta de cumplimiento normativo.
- No se han publicado metricas de evaluacion, por lo que no es posible cuantificar la tasa de error ni compararla con alternativas.
- La lista de idiomas soportados no esta documentada; parte de las entidades descritas (BSN) apuntan a un enfoque neerlandes y europeo, lo que puede limitar su utilidad en otros contextos.
- Es una cuantizacion de 4 bits: la perdida de precision respecto al modelo original no esta medida ni publicada.
- Los ficheros publicados no son los originales del upstream; para trazabilidad conviene verificar los hashes SHA-256 declarados en `redacto-model.json`.
- Licencia Apache-2.0, permisiva para uso comercial, pero se recomienda revisar `THIRD_PARTY_NOTICES.md` del repositorio de Redacto por posibles avisos de terceros heredados del modelo base.
- Ideal para despliegue en cliente; no dispone de servidor de inferencia de alto rendimiento ni de soporte en frameworks de serving tipo vLLM o TGI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/koncsik/redacto-eu-pii-ner-q4f16
- Modelo base: https://huggingface.co/bardsai/eu-pii-anonimization-multilang
- Repositorio Redacto: https://github.com/HunKonTech/Redacto
- README de Redacto: https://github.com/HunKonTech/Redacto/blob/main/README.md
- Sitio web del proyecto: https://redacto.nl/
- Alternativa en HuggingFace: https://huggingface.co/Horizon-Labs/pii-redactor-base
