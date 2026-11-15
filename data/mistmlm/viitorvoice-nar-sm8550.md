# mistmlm/viitorvoice-nar-sm8550

## Resumen

ViiTorVoice-NAR para SM8550 es un conjunto de binarios de contexto QNN (Qualcomm Neural Network) que empaquetan una pila completa de síntesis de voz (TTS) neuronal para ejecutarse sobre la NPU Hexagon v73 del SoC Snapdragon 8 Gen 2 (SM8550, `soc-model:43`). El paquete lo publica el usuario `mistmlm` en Hugging Face y está compuesto por 15 ficheros `.bin` que cubren el frontend semántico (w2v-BERT), el codificador por segmentos, el decodificador dualcodec y un head autorregresivo (NAR) junto con el backbone LLM, sumando aproximadamente 2,6 GiB.

El modelo no se distribuye como pesos en formato estándar (safetensors o GGUF) sino como artefactos compilados para el runtime QAIRT 2.51 de Qualcomm, generados a partir de los ONNX originales de la tarea v79 mediante Qualcomm AI Hub. Es, por tanto, la variante para Galaxy S23 de un despliegue TTS on-device que ya existía para SM8750 (Hexagon v79), con estructura de grafo, particionado y nombres de tensor idénticos, y únicamente cambia el target de compilación.

Su relevancia es práctica: permite evaluar el despliegue de un pipeline TTS completo (semántica + acústica + decodificación) sobre NPU móvil sin depender de la GPU ni de la CPU del dispositivo. No obstante, el autor advierte explícitamente de que no dispone de hardware SM8550 real, por lo que la carga y la inferencia en dispositivo no están verificadas; solo se ha confirmado que compile y link devuelven SUCCESS y que los ficheros presentan la cabecera válida de context binary.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS neuronal: frontend semántico w2v-BERT + codificador segmentado + decodificador dualcodec + head NAR + backbone LLM, compilado como grafos QNN para Hexagon v73 |
| Parametros totales | no disponible (el repositorio publica tamanos de fichero, no recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el backbone LLM usa ventanas win256 y win512, segun nombres de grafo) |
| Tipos de cuantizacion | w8a16 en los segmentos del decodificador `dec_p2` a `dec_p5`; resto sin especificar |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos detallados en la model card) |
| Formato de pesos | QNN context binary (`.bin`) para QAIRT 2.51; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La pila se organiza en cuatro bloques funcionales. El frontend `enc_fe.bin` (1,49 GB) aloja el backbone semantico basado en w2v-BERT; a continuacion, el codificador se reparte en seis segmentos (`enc_front`, `enc_e1` a `enc_e6`) que suman alrededor de 103 MB. El decodificador dualcodec se fragmenta en cinco piezas (`dec_p1` a `dec_p5`), de las cuales cuatro estan cuantizadas en w8a16 y la primera no declara cuantizacion. Por ultimo, `head.bin` (57 MB) contiene el head NAR con dos grafos enlazados (256 y 512) y `llm.bin` (913 MB) el backbone LLM, tambien con dos grafos enlazados (win256 y win512).

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de RLHF o DPO, ni sobre innovaciones de decodificacion mas alla de la propia particion en segmentos y el enlace de grafos (`--qairt_version 2.51` en la fase de link). El autor indica que todos los artefactos son recompilaciones de la tarea original v79, reutilizando los ONNX y las opciones de compilacion, y cambiando unicamente el dispositivo a Galaxy S23; los segmentos `dec_p2` a `dec_p5` conservan el conjunto de calibracion original para la cuantizacion w8a16.

Cuatro ficheros necesarios para la inferencia no estan en este repositorio por ser blobs de datos independientes de la arquitectura: `fe_mel.bin` (83.840 B), `text_emb.bin` (107.923.456 B), `sem_emb.bin` (33.560.576 B), `aco_emb.bin` (23.136.256 B) y el fichero de texto `nar_steps`. Deben tomarse del repositorio `mistmlm/viitorvoice-nar-sm8750`, ya que su cabecera no corresponde al magic number de QNN context binary.

## Capacidades

- Sintesis de voz (TTS) neuronal completa: el pipeline cubre desde la representacion semantica hasta la decodificacion acustica.
- Frontend semantico w2v-BERT para extraccion de representaciones del habla.
- Decodificacion dualcodec en cinco etapas, con cuantizacion w8a16 en cuatro de ellas.
- Head NAR con dos ventanas de contexto (256 y 512) enlazadas en un mismo binario.
- Backbone LLM con dos grafos enlazados (win256 y win512).
- Ejecucion sobre NPU Hexagon v73 mediante QNN, lo que libera CPU y GPU del dispositivo.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio de entrada: no disponibles.

## Casos de uso

- Síntesis de voz on-device en movil: el paquete esta compilado especificamente para SM8550, de modo que un fabricante o integrador puede cargar los context binaries en la NPU Hexagon v73 y generar voz sin enviar texto a un servidor, reduciendo latencia y preservando privacidad.
- Lectura de notificaciones y accesibilidad: un asistente del sistema podria convertir texto de notificaciones, mensajes o pantalla en audio en tiempo real sobre la NPU, manteniendo la CPU disponible para otras tareas.
- Integracion en asistentes de voz locales: al residir el pipeline completo en el dispositivo, encaja en flujos de conversacion por voz que deben funcionar sin conectividad.
- Evaluacion de despliegue QNN en cadena de compilacion: los binarios y la tabla de jobs de compile y link sirven como referencia para reproducir el pipeline de Qualcomm AI Hub sobre otros targets.
- Sustitucion de la variante SM8750 en dispositivos de generacion anterior: al compartir estructura de grafo y particionado, permite probar el mismo modelo en Galaxy S23 reutilizando los blobs de datos del repositorio hermano.
- Benchmarking de cuantizacion w8a16 en NPU: los segmentos del decodificador cuantizados permiten medir el impacto de w8a16 en calidad y velocidad frente a la variante sin cuantizar declarada.
- Prototipado de TTS para wearables y dispositivos IoT con Snapdragon: el tamano de 2,6 GiB y la ejecucion en NPU lo hacen candidato para productos con ese SoC, siempre que se valide primero en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta que las fases de compile y link devuelven SUCCESS, que los ficheros presentan cabecera valida de QNN context binary y que los tamanos son del mismo orden que los de la variante v79. No hay datos de latencia, throughput, MOS ni inteligibilidad.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Gen 2 (SM8550), NPU Hexagon v73, `soc-model:43`.
- Perfil de compilacion: Qualcomm AI Hub, dispositivo `Samsung Galaxy S23 (Family)`.
- Runtime: QAIRT 2.51 (fijado en la fase de link).
- VRAM: no aplica; el modelo se ejecuta sobre NPU, no sobre GPU.
- GPU recomendadas: no aplica para esta variante; los binarios son especificos de Hexagon v73.
- Compatibilidad con GPU de consumo: no disponible; los context binaries no son portables a RTX 4090, A100 ni H100.
- Opciones de despliegue: carga mediante el runtime QNN de Qualcomm; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: aproximadamente 2,6 GiB para los 15 ficheros de este repositorio, mas los cuatro blobs de datos externos (unos 165 MB adicionales).
- Latencia y throughput: no disponibles; no verificados en hardware real.

## Comparativa con modelos similares

| Modelo | Target | Formato | Tamano | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| mistmlm/viitorvoice-nar-sm8550 | SM8550 / Hexagon v73 | QNN context binary | ~2,6 GiB | no disponible | other | Compilado, sin validar en dispositivo |
| mistmlm/viitorvoice-nar-sm8750 | SM8750 / Hexagon v79 | QNN context binary | no disponible (misma estructura) | no disponible | other | Version origen del mismo pipeline |
| Alternativas TTS on-device de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es con la variante SM8750, de la que este repositorio es una recompilacion con target distinto. No se dispone de informacion sobre otros modelos TTS comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No verificado en hardware real: el autor no dispone de un dispositivo SM8550, por lo que la carga y la inferencia en NPU no se han probado; solo se valido la compilacion y el link.
- Dependencia estricta de hardware: los binarios solo son validos para Hexagon v73 con `soc-model:43`; no funcionan en otras generaciones de Snapdragon ni en GPU o CPU de proposito general.
- Dependencia de runtime: requieren QAIRT 2.51; versiones distintas del runtime pueden no cargar los context binaries.
- Repositorio incompleto por diseno: faltan cuatro blobs de datos (`fe_mel.bin`, `text_emb.bin`, `sem_emb.bin`, `aco_emb.bin`) y `nar_steps`, que deben obtenerse del repositorio SM8750; sin ellos el pipeline no es funcional.
- Licencia `other` sin texto: no se detallan condiciones de uso comercial, redistribucion ni modificacion; es imprescindible contactar con el autor antes de un uso en produccion.
- Idiomas no declarados: se desconoce que lenguas cubre el modelo y con que calidad.
- Ausencia de benchmarks: no hay metricas de calidad de sintesis, latencia ni consumo energetico, lo que impide evaluar su idoneidad frente a alternativas.
- Riesgo de artefactos acusticos y alucinacion en la sintesis: no documentado por el autor, pero inherente a los sistemas TTS neuronales sin validacion publica.
- Sesgos: no disponibles; no se documenta la composicion del corpus de entrenamiento ni sus caracteristicas demograficas o linguisticas.
- Trazabilidad limitada del entrenamiento: se desconoce el proceso de entrenamiento, los datos y los ajustes de alineacion o RLHF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mistmlm/viitorvoice-nar-sm8750 (variante SM8750, origen de los blobs de datos)
- Repositorio Hugging Face: https://huggingface.co/mistmlm/viitorvoice-nar-sm8550
- Qualcomm AI Hub: no disponible como enlace en la informacion proporcionada
- Paper, blog o demo del modelo: no disponible
- Repositorio de codigo: no disponible
