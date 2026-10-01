# amogaddy/neuronal-download

## Resumen

`amogaddy/neuronal-download` no es un modelo de lenguaje en sentido estricto, sino un repositorio de distribucion de instaladores del asistente de escritorio Neuronal, desarrollado por el usuario amogaddy (etiquetado como "Made in Italy"). El repositorio contiene binarios de instalacion para Windows 10/11 (`.exe`), macOS con Apple Silicon (`.zip`) y un script para Linux, que descargan automaticamente los pesos del modelo y los recursos de voz durante la instalacion. El tamano del repositorio es de 0,4 GB, ya que los pesos no se alojan aqui.

El modelo subyacente es Bonsai-27B, desarrollado por PrismML, distribuido en formato GGUF y publicado bajo licencia Apache-2.0. Segun la model card, Bonsai-27B esta basado en Qwen3.6-27B, aunque esta designacion no corresponde a ninguna version publica conocida de la familia Qwen, lo que introduce incertidumbre sobre la arquitectura real y el linaje del modelo. El nombre sugiere 27 000 millones de parametros, pero este dato no se confirma en la informacion disponible.

La relevancia de esta ficha es limitada a efectos de evaluacion tecnica: se trata de un paquete de distribucion de software, sin pesos publicados, sin datasets declarados y sin resultados de benchmarks. La propuesta diferencial declarada por el autor es la visualizacion en 3D de "neuronas reales del cerebro del modelo" mientras este razona, un componente de interfaz grafica, no una innovacion en el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se describe como derivado de Qwen3.6-27B, lo que sugeriria una arquitectura transformer, sin confirmar) |
| Parametros totales | no confirmado; el nombre "Bonsai-27B" sugiere aproximadamente 27 000 millones, sin dato oficial |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio base se distribuye en formato GGUF); niveles concretos de cuantizacion no disponibles |
| Idiomas soportados | no disponibles (la model card del repositorio esta redactada en italiano, pero no se declaran los idiomas del modelo) |
| Licencia | GPL-2.0 para el repositorio de instaladores; el modelo base Bonsai-27B se declara Apache-2.0 |
| Formato de pesos | GGUF (los pesos se descargan desde el repositorio base prism-ml/Bonsai-27B-gguf) |
| Autor del repositorio | amogaddy |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo Bonsai-27B mas alla de la referencia a Qwen3.6-27B en la model card. No se especifican el numero de capas, la dimension del modelo, el tipo de atencion (completa, lineal o hibrida), ni si emplea mecanismos de mezcla de expertos. Tampoco se detalla el proceso de entrenamiento: no se indica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT.

El repositorio en si no contiene artefactos de entrenamiento ni pesos: unicamente instaladores y, presumiblemente, scripts de configuracion. Toda la informacion tecnica del modelo subyacente debe consultarse en el repositorio base `prism-ml/Bonsai-27B-gguf`, que no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional como asistente de escritorio, segun la descripcion del producto Neuronal.
- Ejecucion local en el equipo del usuario, con descarga automatica del modelo y de los recursos de voz durante la instalacion (aproximadamente 5,5 GB declarados).
- Interfaz grafica con visualizacion 3D de la actividad del modelo durante la inferencia, descrita por el autor como "neuronas reales de su cerebro".
- Soporte de entrada y salida de voz, dado que el instalador descarga "las voces" junto con el modelo.
- Compatibilidad multiplataforma del instalador: Windows 10/11, macOS con chip Apple y Linux.
- Funcionamiento sin GPU dedicada, con rendimiento reducido.

No se dispone de informacion sobre soporte de tool calling, function calling, razonamiento multi-paso, capacidades de agente, generacion de codigo, matematicas, vision u otras capacidades especificas del modelo Bonsai-27B.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU consumer: el instalador esta pensado para equipos con RTX 3060 o superior, de modo que el usuario puede desplegar un asistente sin depender de APIs en la nube ni enviar datos a terceros.
- Divulgacion y educacion sobre redes neuronales: la visualizacion 3D de la actividad del modelo permite ilustrar de forma grafica como se activan las representaciones internas durante la generacion, util en aula o en material divulgativo.
- Prototipado de interfaces de voz en escritorio: al descargar recursos de voz, el paquete sirve como base para probar flujos de dictado y respuesta hablada en Windows, macOS o Linux.
- Evaluacion de modelos GGUF en hardware limitado: permite comprobar el comportamiento de un modelo derivado de la familia Qwen en formato GGUF sobre una RTX 3060 o un Mac con 16 GB de memoria unificada.
- Despliegue en entornos sin conectividad permanente: al ejecutarse en local, el asistente puede utilizarse en redes aisladas una vez completada la descarga inicial de pesos y voces.
- Referencia para empaquetado de modelos: el repositorio ejemplifica un patron de distribucion en el que un instalador ligero (0,4 GB) descarga los pesos en el momento de la instalacion, patron reutilizable para otros proyectos de modelos locales.
- Uso en entornos de investigacion con requisitos de privacidad: al no requerir servidores externos, encaja en flujos donde no se permite exfiltrar prompts ni datos a servicios gestionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar para Bonsai-27B ni para el asistente Neuronal. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- GPU recomendada por el autor: NVIDIA RTX 3060 o superior.
- Rendimiento descrito como fluido a partir de la RTX 4060.
- Alternativa en Apple Silicon: Mac con chip Apple y 16 GB de memoria.
- Funcionamiento en CPU sin GPU dedicada: posible, pero lento segun el autor.
- Espacio en disco: la instalacion descarga aproximadamente 5,5 GB entre modelo y voces, ademas de los 0,4 GB del instalador.
- Opciones de despliegue: instalador nativo para Windows, paquete `.zip` para macOS y script `bash linux/installa.sh` desde el Space de Hugging Face; no se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

Nota: existe una incoherencia entre el tamano declarado de la descarga (5,5 GB) y la designacion "27B" del modelo base. Un modelo denso de 27 000 millones de parametros en cuantizacion de 4 bits ocupa tipicamente entre 15 y 17 GB, por lo que el valor de 5,5 GB solo seria coherente con una cuantizacion mucho mas agresiva, con un modelo de tamano real inferior al sugerido por el nombre o con una descarga parcial de componentes.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento, contexto, licencia efectiva del modelo subyacente ni especificaciones tecnicas de Bonsai-27B que permitan establecer una comparacion rigurosa con alternativas de la misma categoria. La unica licencia documentada con certeza es la del repositorio de instaladores (GPL-2.0), que no es comparable con las licencias habituales de modelos de pesos abiertos.

## Limitaciones y advertencias

- Naturaleza del repositorio: se trata de un paquete de distribucion de software, no de una publicacion de pesos ni de una ficha tecnica de modelo. No permite evaluar el modelo por si mismo.
- Ausencia total de datos tecnicos: no se publican parametros confirmados, contexto, tokenizador, dataset de entrenamiento, proceso de alineacion ni evaluaciones.
- Linaje dudoso: la referencia a "Qwen3.6-27B" no corresponde a ninguna version publica conocida de la familia Qwen, lo que impide verificar el origen real de los pesos.
- Incoherencia de tamanos: la descarga declarada de aproximadamente 5,5 GB no es compatible con un modelo denso de 27 000 millones de parametros en cuantizaciones habituales (Q4, Q5), lo que sugiere un modelo de menor tamano efectivo o una cuantizacion extrema.
- Discrepancia de licencias: el repositorio se declara GPL-2.0 mientras que el modelo base se declara Apache-2.0. La GPL-2.0 aplicada a un instalador que descarga un modelo Apache-2.0 es una combinacion inusual que conviene revisar antes de cualquier uso comercial o de redistribucion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento ni comunidad que valide su funcionamiento.
- Riesgo de ejecucion de binarios: la instalacion implica ejecutar un `.exe` de Windows o un `.zip` de macOS descargados de un repositorio de terceros con cero descargas. No hay verificacion de integridad publicada ni firma de codigo documentada.
- Idiomas: no se declaran los idiomas soportados por el modelo; la model card esta en italiano, pero eso no implica soporte del modelo para ese idioma.
- Alucinacion y sesgos: no se dispone de informacion sobre evaluaciones de sesgo, tasas de alucinacion ni comportamiento en dominios sensibles.
- El componente de "visualizacion 3D de neuronas reales" es una afirmacion de marketing del autor; no se aporta evidencia de que la visualizacion corresponda a la actividad interna real del modelo.
- Fechas anomalas: las marcas de creacion y actualizacion del repositorio (30 de septiembre de 2026) son posteriores a la mayoria de referencias temporales habituales, lo que dificulta situar el proyecto en una cronologia verificable.
- Uso en produccion: no recomendado sin auditoria previa de los binarios, verificacion de los pesos descargados y clarificacion de la situacion de licencias.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amogaddy/neuronal-download
- Space del proyecto (codigo fuente e instrucciones): https://huggingface.co/spaces/amogaddy/neuronal
- Modelo base declarado: https://huggingface.co/prism-ml/Bonsai-27B-gguf
- Instalador Windows: https://huggingface.co/amogaddy/neuronal-download/resolve/main/Neuronal-Setup-1.0.0.exe
- Paquete macOS: https://huggingface.co/amogaddy/neuronal-download/resolve/main/Neuronal-Mac.zip
