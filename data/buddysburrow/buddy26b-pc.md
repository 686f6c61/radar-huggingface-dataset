# buddysburrow/buddy26b-pc

## Resumen

Buddy26b-pc es un fichero de pesos en formato GGUF redistribuido por el usuario buddysburrow bajo el identificador `buddysburrow/buddy26b-pc`. Segun la model card, se trata del fichero de modelo empleado por **Buddy: Private AI Friend**, una aplicacion de escritorio para Windows que ejecuta inferencia de forma totalmente local en el ordenador del usuario. El repositorio no documenta el modelo base ni el proceso de entrenamiento: la model card se limita a indicar la licencia Apache 2.0 y que el fichero se redistribuye.

El dato objetivo disponible es el recuento de parametros en safetensors, 25.233.142.046 (aproximadamente 25,2 mil millones), lo que situa al modelo en la franja de los 25B-27B, tipica de modelos densos de gran tamano o de arquitecturas MoE ligeras. El repositorio ocupa 10,0 GB, coherente con una cuantizacion de 4 bits de un modelo de ese tamano. El tag `imatrix` sugiere que la cuantizacion se genero con matrices de importancia (importance matrix) para preservar calidad en bits bajos.

La relevancia practica del repositorio es limitada como modelo de proposito general: no hay informacion sobre arquitectura, datos de entrenamiento, contexto, idiomas ni evaluaciones, y no registra descargas ni interacciones. Debe tratarse como un artefacto de distribucion de una aplicacion concreta, no como un modelo documentado para integracion en pipelines propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 25.233.142.046 (aprox. 25,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; tag `imatrix` sugiere cuantizacion con importance matrix (nivel exacto no disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 10,0 GB); recuento de parametros reportado sobre safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. El unico indicio tecnico es el tag `imatrix`, asociado en el ecosistema GGUF a cuantizaciones calibradas con matrices de importancia para reducir la perdida de calidad en cuantizaciones de 4 bits o inferiores. El recuento de parametros (25,2B) y el tamano del repositorio (10,0 GB) son compatibles con una cuantizacion de aproximadamente 4 bits, aunque no se especifica el nivel concreto (Q4_K_M, Q4_0, IQ4_XS u otro).

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del corpus, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia. El modelo se presenta como el motor de una aplicacion de escritorio con ejecucion local, lo que implica que el autor prioriza el despliegue en hardware de consumo sobre la publicacion de detalles tecnicos.

## Capacidades

- Generacion de texto conversacional: la model card describe la aplicacion como un "Private AI Friend", lo que apunta a un uso de chat multi-turno.
- Ejecucion local: el modelo esta pensado para correr enteramente en el ordenador del usuario, sin llamadas a servicios externos.
- Integracion con endpoints: el tag `endpoints_compatible` indica compatibilidad con el esquema de endpoints de Hugging Face.
- Capacidades adicionales (codigo, matematicas, tool calling, agentes, vision, audio, modo thinking): no disponible.

## Casos de uso

- Asistente conversacional de escritorio con privacidad estricta: el modelo se ejecuta localmente en Windows, de modo que las conversaciones no salen del equipo; adecuado para usuarios que manejan informacion sensible y no quieren enviar prompts a APIs externas.
- Prototipado de chatbots offline: al ser un GGUF de unos 10 GB, puede cargarse en un runtime local para validar flujos conversacionales sin coste por token ni dependencia de red.
- Despliegue en entornos sin conectividad: equipos aislados (laboratorios, plantas industriales, portatiles en campo) donde no se permite acceso a servicios en la nube.
- Evaluacion comparativa de cuantizaciones: el tag `imatrix` permite estudiar la perdida de calidad frente a los pesos originales en tareas de generacion de texto, siempre que se localice el modelo base.
- Base para ajuste fino o destilacion: con licencia Apache 2.0 y pesos de 25,2B, es material reutilizable, aunque la falta de documentacion sobre el modelo original limita la trazabilidad.
- Integracion en aplicaciones de escritorio de terceros: el formato GGUF facilita el empaquetado junto con runtimes tipo llama.cpp dentro de un instalador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con un repositorio de 10,0 GB en GGUF, la inferencia completa en GPU requiere del orden de 10-12 GB de VRAM (pesos mas cache KV y overhead del runtime). La cifra exacta depende del nivel de cuantizacion y de la longitud de contexto, ambos no disponibles.
- GPU recomendadas: no disponible en la documentacion. Por tamano, una RTX 4090 (24 GB) o una A100/H100 permitirian cargar el modelo con holgura; una RTX 3090/4080 (16-24 GB) seria suficiente en principio para la cuantizacion de 4 bits.
- GPU de consumo: cabe en tarjetas con 12 GB o mas de VRAM en cuantizacion de 4 bits; en tarjetas de 8 GB requeriria offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La falta de informacion sobre arquitectura, contexto y rendimiento impide establecer una comparacion rigurosa con alternativas de la misma franja de parametros.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar el modelo con criterios de ingenieria.
- Trazabilidad del modelo base desconocida: la model card solo indica que el fichero se redistribuye; no se identifica el modelo original ni el proceso de cuantizacion.
- Riesgo de alucinacion: no cuantificado por el autor; sin evaluaciones publicadas no puede estimarse su fiabilidad en tareas factuales.
- Sesgos: no documentados.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el redistribuidor no ofrece garantias sobre los derechos de los pesos originales si el modelo base tuviera otra licencia.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-24), lo que sugiere un artefacto reciente o metadatos inconsistentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/buddysburrow/buddy26b-pc
