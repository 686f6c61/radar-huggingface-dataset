# AI-conn/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF

## Resumen

El modelo `AI-conn/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF` es un fork de una conversion a GGUF del modelo abliterado `huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated`, que a su vez deriva del modelo oficial `Qwen/Qwen3-Coder-30B-A3B-Instruct`. Se trata por tanto de una cadena de derivaciones: el modelo base es de Qwen, la version sin censura (abliterated) es de huihui-ai, la cuantizacion GGUF con imatrix es de mradermacher y este repositorio concreto lo mantiene AI-conn como copia fija de su flota para evitar que el artefacto se modifique o se retire aguas arriba.

Arquitectura de mezcla de expertos (MoE) con 30.532.122.624 parametros totales (~30,5B) y aproximadamente 3B de parametros activos por token. Es un modelo especializado en generacion de codigo, con licencia Apache-2.0 y formato de pesos GGUF. La model card advierte explicitamente que el hecho de tener solo ~3B activos no reduce la factura de memoria: todos los pesos de expertos deben residir en VRAM para inferencia en GPU.

Su relevancia ahora es doble: por un lado ofrece una via practica de ejecutar un coder MoE de 30B en tarjetas de 20 GB mediante cuantizacion i1 (imatrix) a Q4_K_M, y por otro representa una variante "uncensored" orientada a entornos donde se quiere evitar el rechazo de peticiones, con los riesgos asociados que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); confirmado por tags y model card |
| Parametros totales | 30.532.122.624 (~30,5B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix); se documentan explicitamente i1-Q4_K_M e i1-IQ4_XS, el repositorio (324,1 GB) contiene mas variantes no listadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated (a su vez derivado de Qwen/Qwen3-Coder-30B-A3B-Instruct) |

## Arquitectura y entrenamiento

La informacion disponible confirma una arquitectura de tipo MoE (etiqueta `moe` y mencion explicita en la model card) con 30,5B de parametros totales y alrededor de 3B activos por token, derivada de la familia Qwen3-Coder. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otro tipo de alineamiento.

El rasgo tecnico diferencial de esta publicacion no es el entrenamiento, sino el proceso de *abliteration* aplicado por huihui-ai sobre el modelo base (una modificacion de pesos orientada a eliminar comportamientos de rechazo) y, despues, la cuantizacion GGUF i1 con calibracion imatrix realizada por mradermacher. AI-conn actua como espejo de ese artefacto sin modificarlo, anadiendo unicamente notas de encaje en hardware.

## Capacidades

- Generacion y asistencia en codigo, heredadas del modelo base Qwen3-Coder-30B-A3B-Instruct, orientado especificamente a tareas de programacion.
- Inferencia con arquitectura MoE, lo que reduce el coste de computo por token frente a un modelo denso de 30B, aunque no el consumo de memoria.
- Comportamiento "abliterated" o sin censura: se han eliminado los mecanismos de rechazo del modelo original, de modo que responde a peticiones que el base podria declinar.
- Uso conversacional (etiqueta `conversational` en el repositorio).
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y despliegue en Ollama.
- Soporte de tool calling, modo thinking, vision, audio o agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado y generacion de codigo en el IDE: un coder MoE de 30B con ~3B activos ofrece buena calidad por token generado, desplegable en local con Ollama sobre una GPU de 20 GB usando i1-Q4_K_M.
- Asistente de refactorizacion sobre repositorios largos: util para tareas de reescritura, documentacion y migracion de APIs, siempre que el contexto necesario encaje en la ventana soportada (no documentada en la informacion disponible).
- Generacion de tests y cobertura: el modelo puede producir casos de prueba unitarios e integracion a partir de codigo existente, integrándose en pipelines de CI/CD como paso previo a la revision humana.
- Analisis de codigo y explicacion de fragmentos heredados: soporte para equipos que necesitan entender bases de codigo antiguas sin salir de su infraestructura.
- Entornos de investigacion sobre alineamiento y seguridad: al ser una variante abliterated, permite estudiar de forma controlada el comportamiento sin censura frente al modelo original.
- Despliegue en hardware de consumo para desarrolladores independientes: la cuantizacion i1 permite ejecutar el modelo en tarjetas de 20 GB, algo inviable con el modelo en precision completa.
- Escenarios de generacion de contenido donde se requiere una politica de rechazo minima: util para pipelines de datos sinteticos o tareas creativas que el modelo alineado bloquearia, con la advertencia de que el operador asume la responsabilidad del filtrado posterior.

## Benchmarks y rendimiento

| Benchmark | Modelo evaluado | Resultado | Fuente |
|---|---|---|---|
| HumanEval Pro | Base original (Qwen3-Coder-30B-A3B-Instruct, sin abliterar) | 60,4 % | Dato comunitario citado en la model card |

La model card indica que no existe ninguna evaluacion independiente de codigo publicada para ninguna build abliterada de este modelo. El dato de 60,4 % corresponde al modelo base original, no a la variante abliterated ni a la cuantizada. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada con i1-Q4_K_M: 17,28 GiB de pesos, mas KV cache pequena de MoE y ~0,7 GiB de reserva, lo que da aproximadamente 18,3 GiB residentes.
- VRAM estimada con i1-IQ4_XS: 15,24 GiB de pesos, opcion con mas margen para contexto a costa de una fidelidad de cuantizacion ligeramente inferior.
- Advertencia critica: aunque solo ~3B de parametros esten activos por token, todos los pesos de expertos deben residir en VRAM en despliegues con GPU. El ahorro de "3B activos" no reduce el consumo de memoria.
- Hardware medido: AMD RX 7900 XT con 19,98 GiB de VRAM y 32 GB de RAM queda en un encaje "residente y ajustado" con i1-Q4_K_M; con IQ4_XS hay holgura.
- Cabe en GPU de consumo de gama alta con 20 GB o mas de VRAM (por ejemplo, RX 7900 XT). Modelos con menos VRAM requeriran descarga parcial a RAM o cuantizaciones mas agresivas.
- Opciones de despliegue: Ollama (comando `ollama pull hf.co/AI-conn/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF:i1-Q4_K_M`), servidores compatibles con endpoints, y cualquier runtime que soporte GGUF (llama.cpp, entre otros). vLLM o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (AI-conn, i1 GGUF) | 30,5B totales / ~3B activos | no disponible | Abliterado y cuantizado a GGUF | Apache-2.0 | Repositorio de 324,1 GB en HuggingFace |
| huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated | 30,5B totales / ~3B activos | no disponible | Abliterado, pesos originales | Apache-2.0 | HuggingFace |
| mradermacher/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF | 30,5B totales / ~3B activos | no disponible | Abliterado y cuantizado i1 | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30,5B totales / ~3B activos | no disponible en la informacion aportada | Modelo original alineado | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo y puede degradar la coherencia o la seguridad del modelo en dominios sensibles; la model card reconoce que no existe evaluacion independiente de calidad de codigo para builds abliteradas.
- Riesgo de alucinacion: no se han publicado estudios especificos para esta variante; se hereda el comportamiento del modelo base y no hay mediciones disponibles.
- Idiomas soportados: no documentados en la informacion disponible, por lo que no se puede garantizar el rendimiento multilingue.
- Longitud de contexto: no documentada en la informacion proporcionada, lo que impide planificar tareas de contexto largo con garantias.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el operador asume la responsabilidad legal y etica del contenido generado por una variante sin censura.
- Presupuesto de memoria: no debe asumirse que los ~3B de parametros activos implican un consumo reducido de VRAM; todos los expertos deben residir en memoria.
- Este repositorio es un fork mantenido por AI-conn con el proposito declarado de servir como copia fija de una flota; no es el artefacto canonico y puede divergir en futuras actualizaciones.
- La calidad de la cuantizacion i1 depende de la calibracion imatrix; IQ4_XS prioriza margen de memoria sobre fidelidad.
- Fecha de publicacion del repositorio registrada como 2026-10-11, posterior a la fecha de redaccion habitual de este tipo de fichas; conviene verificar la vigencia del artefacto antes de desplegarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AI-conn/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF
- Modelo abliterado de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated
- Cuantizacion i1 de mradermacher: https://huggingface.co/mradermacher/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct

No se han encontrado en la busqueda web papers, blogs o demos adicionales relevantes para este modelo.
