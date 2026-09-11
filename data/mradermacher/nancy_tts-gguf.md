# mradermacher/Nancy_tts-GGUF

## Resumen

Nancy_tts-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base sken0/Nancy_tts. No se trata de un modelo nuevo ni de un entrenamiento propio, sino de una coleccion de pesos cuantizados pensada para facilitar la ejecucion en hardware de consumo mediante llama.cpp, Ollama y otros runners compatibles con GGUF. El modelo subyacente tiene 3.300.867.136 parametros (unos 3,3 mil millones) y esta etiquetado con la arquitectura `llama`, con licencia Apache 2.0 y soporte declarado unicamente para ingles.

El nombre "Nancy_tts" sugiere en principio un sistema de texto a voz, pero las etiquetas del repositorio indican `text-generation`, `conversational` y `text-generation-inference`, sin ningun metadato ni archivo relacionado con audio. Esta discrepancia es un punto importante: la informacion disponible no permite confirmar que el modelo realice sintesis de voz, y todo apunta a que se trata de un modelo de lenguaje conversacional de tipo decoder-only. Conviene verificar el modelo base antes de asumir cualquier capacidad de audio.

La relevancia de esta ficha es practica: mradermacher publica 12 variantes de cuantizacion que van desde 1,5 GB (Q2_K) hasta 6,7 GB (f16), lo que permite desplegar un modelo de 3,3B en GPUs de gama media o incluso en CPU. El repositorio tiene, en el momento de la consulta, 0 descargas y 0 "likes", por lo que es un artefacto reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama`; sin confirmacion oficial de la variante exacta) |
| Parametros totales | 3.300.867.136 (~3,3 mil millones) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE; se asume densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base `sken0/Nancy_tts` |

Datos adicionales: tamano del repositorio 30,3 GB (suma de todas las cuantizaciones), biblioteca declarada `transformers`, fecha de creacion 2026-09-11, sin pipeline asignado.

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna mas alla de la etiqueta `llama`, que en el ecosistema GGUF suele indicar un transformer decoder-only con atencion causal. La etiqueta `unsloth` en el modelo base sugiere que el ajuste se realizo con la libreria Unsloth, habitualmente empleada para fine-tuning eficiente (LoRA/QLoRA) sobre modelos Llama. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

Tampoco hay confirmacion del contexto maximo soportado ni de tecnicas de atencion especiales (atencion lineal, decodificacion especulativa, GQA, etc.). Todo lo que se sabe de la arquitectura es inferido a partir de las etiquetas, no de una model card detallada del autor original. El repositorio cuantizado, por su parte, no introduce ninguna innovacion: aplica cuantizacion estatica de tipo k-quant e IQ mediante el pipeline habitual de mradermacher.

## Capacidades

- Generacion de texto y conversacion: las etiquetas `conversational` y `text-generation` indican uso como modelo de chat y continuacion de texto.
- Compatibilidad con runners GGUF: puede ejecutarse con llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI.
- Integracion con text-generation-inference: la etiqueta `text-generation-inference` aparece en el repositorio, aunque el soporte de GGUF en TGI es limitado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado. No hay evidencia de soporte de castellano.
- Modo "thinking", vision, audio o sintesis de voz: no disponible. A pesar del sufijo "tts" en el nombre, no hay ningun metadato que confirme capacidades de audio.

## Casos de uso

- Asistentes conversacionales ligeros en ingles: con cuantizaciones de 2,2 GB (Q4_K_M) el modelo puede ejecutarse en equipos modestos para generar respuestas de chat de baja latencia, siempre que la tarea no requiera contexto largo ni razonamiento complejo.
- Prototipado local sin GPU dedicada: la variante Q2_K (1,5 GB) permite cargar el modelo entero en RAM y hacer pruebas de integracion en portatiles o maquinas de desarrollo sin tarjeta grafica.
- Despliegue en el borde (edge): las cuantizaciones Q3/Q4 caben en dispositivos con 4-8 GB de memoria unificada, lo que habilita asistentes embebidos en mini-PC o placas tipo Jetson.
- Generacion de texto por lotes: para tareas de resumen, reescritura o clasificacion de texto en ingles donde la calidad extrema no es critica, la variante Q8_0 (3,6 GB) ofrece un equilibrio entre fidelidad y velocidad.
- Experimentacion con fine-tuning y destilacion: al estar bajo Apache 2.0, los pesos pueden usarse como base para experimentos academicos o como generador de datos sinteticos, sin las restricciones de licencias tipo Llama Community.
- Educacion e investigacion en eficiencia de inferencia: el conjunto de 12 cuantizaciones del mismo modelo permite comparar calidad frente a tamano y medir el impacto de la cuantizacion en tareas controladas.
- Integracion en pipelines con la API de OpenAI: mediante llama.cpp o vLLM en modo compatibilidad OpenAI, puede sustituirse por un endpoint remoto en pruebas de integracion de agentes conversacionales simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio cuantizado ni los metadatos proporcionados incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench o similares, ni comparativas de perplejidad entre las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar cache KV ni overhead del runtime):
  - f16: 6,7 GB, requiere en la practica 8-10 GB de VRAM.
  - Q8_0: 3,6 GB, viable en GPUs de 6-8 GB.
  - Q6_K: 2,8 GB, viable en GPUs de 6 GB.
  - Q5_K_M / Q5_K_S: 2,5 / 2,4 GB, viables en GPUs de 6 GB.
  - Q4_K_M / Q4_K_S: 2,2 / 2,1 GB, viables en GPUs de 4-6 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S / IQ4_XS: ~2,0 / 1,9 / 1,7 / 2,0 GB, viables en GPUs de 4 GB.
  - Q2_K: 1,5 GB, apto para GPUs de 4 GB o ejecucion parcial en CPU.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 para las variantes mas grandes; cualquier GPU con 6-8 GB para Q4 y Q5.
- Cabe en GPU de consumo: si, en practicamente todas las variantes por debajo de f16, incluidas GTX 1660, RTX 3050 y soluciones integradas con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y servidores GGUF compatibles con la API de OpenAI. Para vLLM y TGI el soporte de GGUF es parcial y puede requerir conversion previa.
- Latencia y throughput estimados: no disponible. Dependera fuertemente de la cuantizacion y del hardware.

## Comparativa con modelos similares

Comparativa orientativa con alternativas densas de tamano similar. Los datos de los modelos alternativos proceden de sus especificaciones publicas habituales; los de Nancy_tts corresponden a lo disponible en este repositorio.

| Modelo | Parametros | Contexto | Licencia | Idioma | Observaciones |
|---|---|---|---|---|---|
| Nancy_tts (este repo, GGUF) | ~3,3B | no disponible | Apache 2.0 | Ingles | Sin benchmarks publicados; sin validacion comunitaria (0 descargas) |
| Llama 3.2 3B Instruct | ~3,2B | 128k (segun especificacion oficial) | Llama 3.2 Community License | Multilingue | Ampliamente validado y con soporte maduro en el ecosistema |
| Qwen2.5 3B Instruct | ~3,1B | 128k (segun especificacion oficial) | Apache 2.0 para la mayoria de tamanos | Multilingue | Buen rendimiento en codigo y matematicas; gran comunidad |
| Phi-3.5-mini Instruct | ~3,8B | 128k (segun especificacion oficial) | MIT | Multilingue | Enfocado a razonamiento; mas parametros |

La comparacion es estructural, no de rendimiento: no existen datos publicados de Nancy_tts que permitan situarlo frente a estas alternativas en tareas concretas.

## Limitaciones y advertencias

- Ambiguedad funcional grave: el nombre "Nancy_tts" apunta a texto a voz, pero las etiquetas son de generacion de texto. No hay que asumir capacidad de sintesis de voz sin verificar el modelo base.
- Ausencia total de benchmarks: no hay ninguna metrica publicada, por lo que se desconoce su calidad real frente a alternativas del mismo tamano.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje de 3,3B; sera mayor en tareas de conocimiento factual o razonamiento largo.
- Solo ingles declarado: no hay evidencia de soporte de castellano ni de otros idiomas; el rendimiento fuera del ingles sera previsiblemente bajo.
- Contexto desconocido: al no especificarse la longitud de contexto, el comportamiento en conversaciones largas no puede planificarse.
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta; es un artefacto sin uso documentado.
- Licencia permisiva pero heredada: Apache 2.0 permite uso comercial, pero el modelo base es de un tercero y podria tener condiciones adicionales no reflejadas aqui; conviene revisar `sken0/Nancy_tts` antes de produccion.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; no se recomiendan para uso en produccion.
- Sin cuantizaciones ponderadas o imatrix: el autor indica que no estan disponibles, por lo que la calidad relativa por bit puede ser inferior a la de otros repositorios similares.
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (devuelven resenas de la empresa Valeo), por lo que no se ha podido contrastar ningun dato adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Nancy_tts-GGUF
- Modelo base: https://huggingface.co/sken0/Nancy_tts
- Pagina de vision general y descargas del autor: https://hf.tst.eu/model#Nancy_tts-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de calidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia las cuantizaciones: https://www.nethype.de/
