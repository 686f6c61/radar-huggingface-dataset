# PeterTP/gemma-4-E2B-it-heretic-ara-IQ4_NL-GGUF

## Resumen

PeterTP/gemma-4-E2B-it-heretic-ara-IQ4_NL-GGUF es una cuantizacion GGUF en formato IQ4_NL del modelo p-e-w/gemma-4-E2B-it-heretic-ara, una variante "heretic" (abliterada o desalineada de sus restricciones de seguridad) del modelo instructivo Gemma de cuarta generacion en su variante E2B. El autor de la cuantizacion, PeterTP, distribuye estos pesos principalmente para uso personal, generados con una matriz de importancia (imatrix) calculada sobre el dataset completo wiki.train.raw. El repositorio ocupa 3,4 GB y declara 4.647.450.147 parametros totales segun los safetensors del modelo base.

El modelo resuelve el problema de ejecutar localmente un modelo de la familia Gemma 4 en hardware con recursos limitados, ofreciendo una cuantizacion de 4 bits (IQ4_NL) que reduce el peso en disco y la VRAM necesaria frente a los pesos originales en bf16. Al estar basado en una variante "heretic", el modelo ha sido modificado para reducir sus rechazos ante peticiones que el modelo original declinaria, lo que lo hace relevante para investigadores que estudian alineamiento, abliteracion y comportamiento de modelos, asi como para desarrolladores que necesitan un modelo conversacional sin filtros restrictivos en entornos controlados.

La informacion disponible sobre arquitectura, contexto, datos de entrenamiento y benchmarks es muy limitada: la model card del autor de la cuantizacion es minima y no se han publicado especificaciones detalladas ni resultados de evaluacion en las fuentes consultadas. Esta ficha refleja exclusivamente los datos verificables disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, variante E2B; detalles no publicados en las fuentes) |
| Parametros totales | 4.647.450.147 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (4 bits, con imatrix); el repo contiene unicamente esta cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base p-e-w/gemma-4-E2B-it-heretic-ara en las fuentes consultadas. Por la nomenclatura y el numero de parametros (aproximadamente 4,65 mil millones), se trata de una variante de la familia Gemma 4 de Google en su tamano E2B, pero no se confirman en la informacion proporcionada detalles como el tipo de transformer, el mecanismo de atencion, la longitud de contexto nativa ni la composicion del dataset de entrenamiento.

Respecto al proceso de entrenamiento, la designacion "heretic" indica que el modelo base ha sido sometido a un proceso de abliteracion o modificacion de direcciones de activacion para reducir el comportamiento de rechazo heredado del ajuste instructivo original. La model card del autor de la cuantizacion no documenta el metodo exacto de abliteracion, los datos de RLHF/DPO originales ni el volumen de tokens empleados. La cuantizacion IQ4_NL se genero con una imatrix calculada sobre el dataset completo wiki.train.raw, lo que segun el autor puede producir un comportamiento "algo domestico" (tame) en la calibracion de los pesos.

## Capacidades

- Generacion de texto conversacional en modo instructivo, heredada del modelo base Gemma 4 E2B it.
- Comportamiento "heretic": reduccion de rechazos ante peticiones que el modelo original declinaria, aunque el autor indica que aun necesita prompts guia para ser completamente sin censura.
- Capacidad multilingue: no confirmada en las fuentes; depende del modelo base, cuyos idiomas no estan documentados en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en las fuentes.
- Soporte de agentes y razonamiento multi-paso: no confirmado en las fuentes.
- Capacidades especiales (vision, audio, thinking mode): no confirmadas en las fuentes.

## Casos de uso

- Investigacion sobre alineamiento y abliteracion: el modelo permite estudiar como la modificacion de direcciones de activacion afecta al comportamiento de rechazo en un modelo de ~4,6 mil millones de parametros, comparando respuestas con el Gemma 4 E2B original.
- Experimentacion local en hardware de consumo: la cuantizacion IQ4_NL de 4 bits permite ejecutar el modelo en GPUs con 4-6 GB de VRAM, facilitando pruebas de generacion de texto sin infraestructura dedicada.
- Generacion de texto creativo sin filtros restrictivos: util para escritura de ficcion con tematicas sensibles en entornos de investigacion controlados, donde el autor indica que funciona mejor con prompts guia.
- Evaluacion de cuantizaciones: el uso de imatrix sobre wiki.train.raw permite a investigadores comparar la calidad de IQ4_NL frente a otras cuantizaciones del mismo modelo base en tareas de perplejidad y generacion.
- Prototipado de chatbots conversacionales: al ser un modelo instructivo, puede integrarse en pipelines de conversacion multi-turno para pruebas de concepto en local.
- Docencia y demostraciones: su tamano reducido y formato GGUF lo hacen adecuado para talleres sobre cuantizacion, llama.cpp y despliegue local de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con la cuantizacion IQ4_NL de 4 bits, mas el espacio para el contexto KV cache (variable segun la longitud de contexto configurada).
- GPU recomendadas: no disponibles en las fuentes. Por tamano, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB); tambien puede ejecutarse en CPU via llama.cpp.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en GPUs con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en las fuentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PeterTP/gemma-4-E2B-it-heretic-ara-IQ4_NL-GGUF | 4.647.450.147 | no disponible | apache-2.0 | GGUF (IQ4_NL) | Cuantizacion heretic, imatrix wiki.train.raw |
| p-e-w/gemma-4-E2B-it-heretic-ara | no disponible | no disponible | no disponible | no disponible | Modelo base heretic sin cuantizar |
| Gemma 4 E2B it (original) | no disponible | no disponible | no disponible | no disponible | Modelo instructivo original de Google, con filtros de seguridad |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La variante "heretic" reduce los rechazos de seguridad, lo que implica un mayor riesgo de generar contenido danino, sesgado o inapropiado; no es adecuada para aplicaciones de cara al publico sin moderacion adicional.
- El autor indica que el modelo aun necesita prompts guia para ser completamente sin censura, por lo que su comportamiento puede ser inconsistente segun la formulacion de la peticion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no se han publicado evaluaciones de fidelidad.
- La imatrix calculada sobre wiki.train.raw puede sesgar la calibracion hacia el dominio enciclopedico y degradar el rendimiento en otros dominios.
- La licencia apache-2.0 se declara en el repo de cuantizacion, pero conviene verificar las condiciones del modelo base original de Google antes de uso comercial.
- No se documentan idiomas soportados, longitud de contexto ni capacidades de tool calling; no debe asumirse su disponibilidad en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.
- El repositorio se creo en 2026 y se actualizo posteriormente; verificar la integridad de los pesos antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PeterTP/gemma-4-E2B-it-heretic-ara-IQ4_NL-GGUF
- Arbol de archivos: https://huggingface.co/PeterTP/gemma-4-E2B-it-heretic-ara-IQ4_NL-GGUF/tree/main
- Modelo base: https://huggingface.co/p-e-w/gemma-4-E2B-it-heretic-ara
