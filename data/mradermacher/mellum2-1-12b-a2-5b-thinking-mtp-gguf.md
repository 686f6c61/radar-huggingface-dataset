# mradermacher/Mellum2.1-12B-A2.5B-Thinking-MTP-GGUF

## Resumen

Esta ficha corresponde a una cuantización GGUF estática del modelo **Mellum2.1-12B-A2.5B-Thinking-MTP**, desarrollado originalmente por JetBrains y cuantizado por el usuario mradermacher, conocido por publicar cuantizaciones estáticas de gran calidad en HuggingFace. El modelo base es un LLM con arquitectura de mezcla de expertos (MoE) de 12.578 millones de parámetros totales, de los cuales aproximadamente 2.500 millones están activos por token, lo que permite inferencia rápida con una capacidad de modelo notablemente superior a su coste computacional.

El sufijo "Thinking" indica que se trata de una variante de razonamiento extendido (similar a los modelos tipo reasoning/thinking), y "MTP" sugiere la incorporación de multi-token prediction, una técnica que acelera la decodificación. JetBrains desarrolla la familia Mellum orientada principalmente a tareas de código y asistencia al desarrollo, por lo que este modelo resulta relevante para quien busque un modelo compacto y eficiente para autocompletado, generación y razonamiento sobre código, ejecutable en hardware de consumo gracias al formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), con MTP (multi-token prediction) |
| Parametros totales | 12.578.294.528 (~12,58 B) |
| Parametros activos | ~2,5 B (12B-A2.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, x-f16 |
| Idiomas soportados | no disponible (probablemente inglés y código, dada la familia Mellum) |
| Licencia | no disponible en este repositorio (ver modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP) |
| Formato de pesos | GGUF (cuantizaciones estáticas; el original en safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de mezcla de expertos (MoE): de los ~12,58 B de parámetros totales, solo ~2,5 B se activan por token, lo que reduce drásticamente el coste de inferencia manteniendo la capacidad de un modelo de mayor tamaño. La denominación "MTP" apunta a multi-token prediction, que permite predecir varios tokens a la vez y puede habilitar decodificación especulativa auto-generada, acelerando la generación. El sufijo "Thinking" indica que el modelo está entrenado o ajustado para producir cadenas de razonamiento explícitas antes de la respuesta final.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. Dado que JetBrains es el autor y la familia Mellum está orientada a código, es razonable asumir un fuerte componente de datos de programación, pero no hay cifras publicadas en esta ficha.

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repositorio).
- Razonamiento extendido ("Thinking mode"): generación de cadenas de pensamiento antes de la respuesta.
- Tareas de código: la familia Mellum de JetBrains está orientada a autocompletado y asistencia de programación.
- Decodificación acelerada mediante multi-token prediction (MTP), sujeta a soporte del runtime (llama.cpp).
- Eficiencia de inferencia gracias a la arquitectura MoE con solo ~2,5 B de parámetros activos.
- Disponibilidad en múltiples cuantizaciones GGUF, desde Q2_K hasta Q8_0 y f16.

No hay información disponible sobre vision, audio, tool calling ni capacidades agenticas.

## Casos de uso

- **Asistente de codigo en local**: ejecutado con llama.cpp u Ollama en un portatil o estacion de trabajo, puede servir como autocompletador y asistente de programacion sin enviar codigo a la nube, algo valioso para empresas con requisitos de privacidad.
- **Razonamiento sobre problemas tecnicos**: gracias al modo Thinking, puede descomponer problemas de algoritmia, depuracion o diseno de sistemas antes de dar la respuesta final.
- **Chatbots conversacionales ligeros**: con ~2,5 B de parametros activos, ofrece latencias bajas en conversacion multi-turno sobre hardware de consumo.
- **Integracion en IDEs**: el tamano activo reducido lo hace adecuado para backends de plugins de editor (como los de JetBrains) que requieren respuestas rapidas y de bajo coste.
- **Procesamiento por lotes economico**: la arquitectura MoE permite alto throughput en servidores con GPU unica, util para generar documentacion, resumenes o revisiones de codigo masivas.
- **Experimentacion con cuantizaciones agresivas**: las variantes Q2_K y Q3_K permiten probar el modelo en GPUs de 8 GB o incluso en CPU, util para evaluacion rapida antes de desplegar una cuantizacion mayor.
- **Despliegue edge/on-premise**: el formato GGUF y el tamano del repositorio (7,7 GB en cuantizaciones medias) facilitan su ejecucion en entornos sin acceso a aceleradores de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (modelo completo, sin KV cache):
  - Q2_K: ~4-5 GB
  - Q3_K_M: ~5-6 GB
  - Q4_K_M / IQ4_XS: ~7-8 GB
  - Q6_K: ~10 GB
  - Q8_0: ~13 GB
  - f16: ~25 GB
- **GPUs recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones medias; A100/H100 solo necesarias para f16 o cargas con contexto muy largo.
- **Consumer GPUs**: si, cabe comodamente en GPUs de 8-12 GB con Q4_K_M; incluso en GPUs de 6 GB con Q2_K/Q3_K. Tambien es viable en CPU pura gracias a los solo ~2,5 B de parametros activos, con velocidad razonable.
- **Opciones de despliegue**: llama.cpp (formato GGUF nativo), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El modelo base safetensors puede desplegarse con vLLM o TGI si soporta su arquitectura MoE/MTP.
- **Latencia y throughput**: no disponibles como cifras oficiales; la combinacion MoE (2,5 B activos) y MTP sugiere latencias bajas para su clase, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Orientacion | Licencia |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-MTP | ~12,6 B | ~2,5 B | GGUF / safetensors | Codigo + razonamiento | no disponible |
| Qwen3-30B-A3B (Thinking) | ~30 B | ~3 B | GGUF / safetensors | General + razonamiento | Apache 2.0 |
| DeepSeek-R1-Distill-Qwen-7B | ~7 B | ~7 B (denso) | GGUF / safetensors | Razonamiento | MIT |
| GPT-OSS-20B | ~21 B | ~3,6 B | GGUF / safetensors | General + razonamiento | Apache 2.0 |

Frente a Qwen3-30B-A3B y GPT-OSS-20B, Mellum2.1 ofrece un numero de parametros activos similar o inferior con menos memoria total en cuantizacion, a costa presumiblemente de menor amplitud de capacidades generales. Frente a destilados densos como R1-7B, ofrece mas capacidad total con coste de inferencia comparable. No hay benchmarks que cuantifiquen estas diferencias.

## Limitaciones y advertencias

- La licencia no consta en este repositorio: antes de cualquier uso comercial, hay que verificar la licencia del modelo base (JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP).
- No hay benchmarks publicados en la informacion disponible, por lo que el rendimiento real debe validarse en cada caso de uso.
- La cuantizacion agresiva (Q2_K, Q3_K_S) degrada apreciablemente la calidad, especialmente en razonamiento y matematicas; se recomienda Q4_K_M como minimo para uso serio.
- El soporte de MTP depende del runtime: en runtimes sin soporte de multi-token prediction, el modelo funcionara como un MoE convencional sin esa aceleracion.
- El modo Thinking genera cadenas de razonamiento que aumentan el numero de tokens y la latencia total; hay que ajustar presupuestos de tokens en produccion.
- No hay informacion sobre idiomas soportados ni sobre la longitud de contexto: verificar en la model card del modelo base antes de planificar cargas con documentos largos.
- Como todo LLM, presenta riesgo de alucinacion, especialmente en detalles de APIs y librerias poco representadas en entrenamiento; el codigo generado debe revisarse y testearse.
- Repositorio recien creado (0 descargas y 0 likes en el momento de la ficha): escaso historial comunitario de problemas y soluciones.

## Enlaces

- Repositorio de la cuantizacion GGUF: https://huggingface.co/mradermacher/Mellum2.1-12B-A2.5B-Thinking-MTP-GGUF
- Modelo base (JetBrains): https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP
