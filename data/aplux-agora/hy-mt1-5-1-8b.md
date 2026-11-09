# APLUX-Agora/HY-MT1.5-1.8B

## Resumen

HY-MT1.5-1.8B es un modelo de traduccion automatica chino-ingles de 1.800 millones de parametros, publicado en Hugging Face por APLUX-Agora bajo el paraguas de su plataforma Agora, orientada a la ejecucion de modelos en hardware Qualcomm para escenarios de inteligencia artificial en el borde (AIoT). El modelo traduce por defecto cualquier entrada al chino y permite seleccionar el ingles como idioma de destino, segun la model card del autor.

El repositorio no contiene pesos en formato convencional (safetensors o GGUF), sino artefactos de despliegue ya convertidos y empaquetados por SoC: binarios `model.bin` con contexto precompilado y ficheros `model.json` que describen la precision por defecto y las rutas de las variantes. La unica plataforma medida y publicada es el SoC Qualcomm QCS8550 montado en la placa Rhino Pi X1, con cuantizacion W4A16 y un rendimiento declarado de 35,4 tokens por segundo.

La relevancia del modelo es acotada pero clara: cubre el nicho de traduccion chino-ingles de bajo coste computacional para dispositivos empotrados con aceleracion Qualcomm, un segmento donde escasean los artefactos listos para produccion. La informacion publica es, sin embargo, muy limitada: no se detallan la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks mas alla del throughput medido en placa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje para traduccion) |
| Parametros totales | 1.800 millones (indicado en el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (unica precision publicada, para QCS8550) |
| Idiomas soportados | chino e ingles (traduccion; salida por defecto en chino, ingles seleccionable) |
| Licencia | APLUX Model Farm License (licencia personalizada, `license: other`) |
| Formato de pesos | binarios `model.bin` precompilados por SoC (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. El nombre y el pipeline (`text-generation`) apuntan a un transformer decoder-only de 1.800 millones de parametros, pero no se confirma ni la familia arquitectonica ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones chino-ingles), sobre si se aplicaron tecnicas de alineacion como RLHF o DPO, ni sobre el proceso de destilacion o ajuste que pudiera haber dado lugar a este tamano. Lo unico documentado del proceso es la conversion posterior: empaquetado por plataforma Qualcomm con cuantizacion W4A16 y compilacion a un runtime propietario (tag QNN) para su ejecucion en el SoC QCS8550.

## Capacidades

- Traduccion automatica chino-ingles en ambos sentidos: el modelo traduce por defecto la entrada al chino y permite fijar el ingles como idioma de destino.
- Generacion de texto como tarea base (`text-generation`), sobre la que se articula la funcion de traduccion.
- Ejecucion en dispositivo (on-device) mediante el runtime QNN de Qualcomm, sin necesidad de GPU de servidor.
- Integracion con la plataforma Agora para despliegue, medicion y exportacion de flujos de trabajo que usen el modelo.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento.

## Casos de uso

- Traduccion de interfaz en dispositivos empotrados: el modelo puede traducir cadenas y textos de UI entre chino e ingles directamente en el SoC QCS8550, con 35,4 tokens/s medidos, lo que permite actualizaciones de contenido sin depender de la nube.
- Subtitulado y transcripcion local en kioscos o paneles industriales: al ejecutarse sobre hardware Qualcomm de bajo consumo, encaja en equipos desplegados en campo que necesitan traducir texto en tiempo real sin conectividad garantizada.
- Traduccion de documentacion tecnica en herramientas de mantenimiento: un tecnico que opera maquinaria con manuales en chino puede obtener la version en ingles en el propio dispositivo portatil.
- Preprocesado multilingue en pipelines de AIoT: el modelo puede normalizar texto al chino o al ingles antes de pasarlo a otro componente del sistema (por ejemplo, un modulo de extraccion de entidades), aprovechando su tamano reducido.
- Prototipado rapido de funciones de traduccion en placas Qualcomm: gracias a los artefactos precompilados y a la guia de despliegue de Agora, un equipo puede validar una funcionalidad de traduccion en placa en horas en lugar de dias.
- Traduccion de correspondencia y formularios en terminales de atencion al publico: el modelo cabe en el presupuesto de memoria de un SoC movil y permite ofrecer traduccion bilingue en puntos de atencion fisicos.

## Benchmarks y rendimiento

| Metrica | Valor | Plataforma |
|---|---|---|
| Throughput (W4A16) | 35,4 tokens/s | QCS8550 · Rhino Pi X1 |

No se han publicado resultados de benchmarks de calidad (MMLU, BLEU, COMET u otros) en la informacion disponible. El unico dato de rendimiento es el throughput medido en la placa Rhino Pi X1 con la precision por defecto.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo esta empaquetado para ejecucion en el SoC QCS8550 con cuantizacion W4A16, no para GPU convencional; el repositorio ocupa 1,6 GB.
- GPU recomendadas: no aplica en el material publicado; el destino declarado es el SoC Qualcomm QCS8550 (placa Rhino Pi X1).
- Compatibilidad con GPU de consumo: no documentada. No se publican artefactos para RTX 4090, A100, H100 ni similares.
- Opciones de despliegue: runtime QNN de Qualcomm a traves de la plataforma Agora (descarga por `targets/<SoC>/`, guia de despliegue y exportacion de proyectos en mega.aidlux.com). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 35,4 tokens/s medidos en QCS8550 con W4A16 (precision por defecto). No se publican datos de latencia por peticion ni de consumo energetico.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparativa con alternativas de traduccion chino-ingles del mismo tamano (por ejemplo, variantes de NLLB, Opus-MT o modelos bilingues de 1-2B) requeriria datos de calidad y licencia que no se han publicado para este modelo.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| HY-MT1.5-1.8B | 1,8B | no disponible | APLUX Model Farm License | binarios QNN por SoC | Hugging Face (APLUX-Agora) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura linguistica restringida a chino e ingles; no se documenta soporte de otros idiomas.
- No se publican datos sobre sesgos, tasas de alucinacion ni evaluacion de calidad de traduccion, lo que impide estimar su fiabilidad en dominios especializados (legal, medico, tecnico).
- La licencia es una licencia personalizada (APLUX Model Farm License) con terminos propios recogidos en `LICENSE_MODEL_FARM.pdf`; es imprescindible revisarla antes de cualquier uso comercial, ya que no es una licencia open source estandar.
- Los artefactos publicados estan atados a plataformas Qualcomm concretas (unico target documentado: QCS8550); no hay pesos en safetensors ni GGUF para reutilizar el modelo en otros runtimes.
- El modelo depende del ecosistema Agora para el preprocesado, el postprocesado y el runner; la portabilidad fuera de ese entorno no esta documentada.
- Ausencia total de senales de adopcion (0 descargas, 0 likes) y publicacion muy reciente, sin historial de uso en produccion.
- No se especifica la longitud de contexto, lo que impide planificar su uso con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/HY-MT1.5-1.8B
- Prueba online en Agora: https://mega.aidlux.com/models/hy-mt1.5-1.8b
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/HY-MT1.5-1.8B/blob/main/LICENSE_MODEL_FARM.pdf
