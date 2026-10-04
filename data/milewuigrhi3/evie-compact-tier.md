# Milewuigrhi3/evie-compact-tier

## Resumen

`Milewuigrhi3/evie-compact-tier` es un repositorio espejo ("mirror") que reempaqueta los modelos on-device del nivel compacto del proyecto Evie, pensado para iPhone y iPad con 4 GB de memoria. No es un modelo entrenado por el autor: los ficheros se redistribuyen sin modificar para garantizar disponibilidad y fijacion inmutable mediante hashes SHA-256. El repositorio agrupa dos componentes distintos en un mismo paquete de 2,9 GB.

El primer componente es `gemma-4-E2B-it.litertlm`, una copia del modelo de lenguaje Google Gemma 4 E2B (variante instruction-tuned) en formato LiteRT-LM, orientado a inferencia en dispositivo. El segundo es `kokoro/model.onnx`, la exportacion de k2-fsa del modelo de sintesis de voz Kokoro v1.0 (82 M de parametros, fp32, multilingue). La combinacion sugiere un stack local de conversacion con voz: generacion de texto mediante Gemma y sintesis de habla mediante Kokoro, ambos ejecutables sin conexion.

La relevancia de este tipo de paquete radica en que empaqueta un LLM y un TTS de bajo coste en formatos especificos para aceleracion en movil (LiteRT-LM y ONNX), apuntando a un objetivo de memoria de 4 GB. La licencia es Apache 2.0 en ambos componentes. Actualmente el repositorio no registra descargas ni "likes", y no se han publicado idiomas soportados, pipeline ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repo espejo; Gemma 4 E2B en formato LiteRT-LM y Kokoro TTS en ONNX) |
| Parametros totales | no disponible para Gemma 4 E2B; Kokoro: 82 M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Gemma 4 E2B: formato LiteRT-LM (tag indica variante cuantizada); Kokoro: fp32 |
| Idiomas soportados | no disponible (Kokoro v1.0 es multilingue; idiomas concretos no detallados) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`) y ONNX (`.onnx`) |
| Tamano del repositorio | 2,9 GB |
| Modelo base | `google/gemma-4-E2B-it`, `hexgrad/Kokoro-82M` |
| Libreria | litert-lm |
| Entidad publicadora | Milewuigrhi3 (espejo, no autor original) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura ni sobre el proceso de entrenamiento de Gemma 4 E2B en la informacion proporcionada; el repositorio es un espejo de ficheros ya existentes de `litert-community/gemma-4-E2B-it-litert-lm` (commit `b3ca0d2f...`). La nomenclatura "E2B" remite a la convencion de parametros efectivos empleada por Google en modelos on-device, pero no se confirma ningun detalle arquitectonico (transformer, MoE, MatFormer u otro) en los datos disponibles. Tampoco se detallan numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO).

El componente de voz, Kokoro v1.0, es un modelo TTS de 82 M de parametros distribuido por hexgrad bajo Apache 2.0; el fichero incluido es la exportacion fp32 de k2-fsa (`csukuangfj/kokoro-multi-lang-v1_0`, commit `f7b96bb6...`) en formato ONNX. La innovacion tecnica de este repositorio no es arquitectonica, sino de empaquetado: integra un LLM en formato LiteRT-LM y un TTS ONNX como stack on-device pinneado mediante SHA-256 para despliegue reproducible en dispositivos de 4 GB.

## Capacidades

- Generacion de texto y conversacion: hereda las capacidades del modelo Gemma 4 E2B instruction-tuned subyacente (contenido no detallado en este repo).
- Sintesis de voz: Kokoro v1.0 genera audio hablado a partir de texto, con soporte multilingue.
- Ejecucion on-device: ambos componentes estan en formatos optimizados para inferencia local sin conexion (LiteRT-LM y ONNX).
- Verificacion de integridad: ficheros identificados por SHA-256 para despliegues reproducibles.
- No se documentan en la informacion disponible: soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio de entrada, thinking mode ni capacidades multilingues concretas del LLM.

## Casos de uso

- Asistentes conversacionales offline en iPhone/iPad: el paquete combina un LLM local (Gemma 4 E2B) con un TTS, permitiendo dialogos con voz sin enviar datos a la nube, util en escenarios de privacidad.
- Lectura de texto en voz alta (accesibilidad): Kokoro v1.0 puede narrar contenido generado o existente en el dispositivo, con memoria objetivo de 4 GB.
- Interfaces de voz para aplicaciones moviles: integracion de respuestas habladas en apps nativas usando ONNX para el TTS y LiteRT-LM para el texto.
- Despliegue reproducible en produccion movil: el pinning por SHA-256 permite fijar versiones exactas de los modelos y evitar cambios silenciosos en pipelines de CI.
- Prototipado de agentes locales en el borde: base para experimentar con asistentes que no dependen de conectividad, sujeto a las capacidades no documentadas del LLM.
- Traduccion o asistencia multilingue con salida de voz: aprovechando el soporte multilingue de Kokoro v1.0, siempre que el LLM subyacente cubra los idiomas objetivo (no confirmado).
- Investigacion en inferencia on-device: banco de pruebas para medir rendimiento de LiteRT-LM y ONNX en hardware Apple con 4 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo y no incluye metricas de MMLU, HumanEval, GSM8K u otras, ni del modelo de lenguaje ni del TTS.

## Requisitos de hardware

- Objetivo declarado: iPhone y iPad con 4 GB de memoria (nivel "compact tier").
- Tamano del paquete completo: 2,9 GB, por lo que se requiere espacio de almacenamiento suficiente en el dispositivo.
- VRAM/memoria: no disponible de forma desglosada por componente; el objetivo del proyecto es operar dentro de 4 GB de memoria del dispositivo.
- GPU recomendadas: no disponible; el diseno apunta a aceleracion en dispositivo (Apple/ARM) mas que a GPU de servidor.
- Compatibilidad con GPU consumer (RTX, etc.): no documentada; los formatos LiteRT-LM y ONNX estan orientados a despliegue en el borde, no a servidores con A100/H100.
- Opciones de despliegue: LiteRT-LM (para el LLM) y runtime ONNX (para Kokoro). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Milewuigrhi3/evie-compact-tier` (este repo) | no disponible (LLM) / 82 M (TTS) | no disponible | LiteRT-LM + ONNX | Apache 2.0 | HuggingFace, 0 descargas |
| `litert-community/gemma-4-E2B-it-litert-lm` (origen) | no disponible | no disponible | LiteRT-LM | Apache 2.0 | HuggingFace |
| `hexgrad/Kokoro-82M` (origen TTS) | 82 M | no disponible | no disponible | Apache 2.0 | HuggingFace |
| `csukuangfj/kokoro-multi-lang-v1_0` (origen TTS export) | 82 M | no disponible | ONNX | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con modelos alternativos; la comparativa anterior se limita a origen, formato y licencia.

## Limitaciones y advertencias

- Repositorio espejo sin modificaciones: el autor no es responsable del entrenamiento ni de las capacidades reales de los modelos; cualquier problema debe atribuirse a los repositorios de origen.
- Ausencia de datos: no hay informacion publicada sobre arquitectura, contexto, idiomas del LLM, sesgos ni alineacion, lo que impide evaluar su idoneidad en produccion sin pruebas propias.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado en la informacion disponible.
- Limitaciones de idioma: no confirmadas; el TTS Kokoro v1.0 es multilingue, pero los idiomas concretos soportados y los del LLM no se detallan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero "Gemma" es marca registrada de Google LLC; el autor declara no estar afiliado ni respaldado por Google, hexgrad ni k2-fsa.
- Riesgo de integridad: la fiabilidad del despliegue depende de verificar los hashes SHA-256 indicados frente a los ficheros de origen.
- Sin senales de adopcion: 0 descargas y 0 "likes" en el momento de la consulta; sin garantia de mantenimiento.
- Advertencia sobre la busqueda web: los resultados de busqueda proporcionados no contienen informacion relevante sobre este modelo y no se han utilizado como fuente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Milewuigrhi3/evie-compact-tier
- Modelo base del LLM: https://huggingface.co/google/gemma-4-E2B-it
- Origen del LLM en LiteRT-LM: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Modelo base del TTS: https://huggingface.co/hexgrad/Kokoro-82M
- Origen del export TTS ONNX: https://huggingface.co/csukuangfj/kokoro-multi-lang-v1_0
