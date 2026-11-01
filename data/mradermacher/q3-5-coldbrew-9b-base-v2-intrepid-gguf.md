# mradermacher/Q3.5-ColdBrew-9B-Base-v2-Intrepid-GGUF

## Resumen

Q3.5-ColdBrew-9B-Base-v2-Intrepid-GGUF es una compilación de cuantizaciones GGUF del modelo base SvalTek/Q3.5-ColdBrew-9B-Base-v2-Intrepid, publicada por el usuario mradermacher. El modelo original es un transformer de aproximadamente 8.950 millones de parámetros (8,95 B) etiquetado con la arquitectura `qwen3_5`, lo que sugiere que deriva de la familia Qwen 3.5, y está orientado a generación de texto conversacional en inglés. Esta ficha describe la versión GGUF, que es la que se distribuye en este repositorio.

El repositorio no aporta información sobre el entrenamiento del modelo original: no se detallan tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF o DPO. La model card se limita a documentar el proceso de cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y a listar los ficheros GGUF generados, incluyendo dos suplementos multimodales (mmproj) que apuntan a capacidades de visión en el modelo base, aunque no se confirma su funcionamiento en esta versión.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de ~9 B en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), con cuantizaciones desde Q2_K (3,9 GB) hasta f16 (18,0 GB). La licencia Apache 2.0 facilita su uso comercial. No obstante, la ausencia de benchmarks, de documentación de entrenamiento y de datos de contexto en la información disponible limita seriamente cualquier evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en los tags; detalles no disponibles) |
| Parámetros totales | 8.953.803.264 (~8,95 B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; suplementos mmproj en f16 y Q8_0 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna del modelo original más allá de su etiqueta `qwen3_5` y su naturaleza de transformer de ~9 B parámetros. No se especifican número de capas, dimensiones ocultas, mecanismo de atención (estándar, GQA, atención lineal), tipo de normalización ni detalles del tokenizador. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre volumen de tokens, composición del corpus, técnicas de alineación (RLHF, DPO, SFT) ni innovaciones técnicas como decodificación especulativa.

Lo que sí está documentado es el proceso de cuantización aplicado por mradermacher: cuantizaciones estáticas con `quantize_version: 2`, salida con tensores cuantizados (`output_tensor_quantised: 1`) y conversión desde el formato Hugging Face (`convert_type: hf`). Se ofrecen tanto cuantizaciones estándar como, en un repositorio separado (`-i1-GGUF`), cuantizaciones ponderadas con imatrix, que suelen preservar mejor la calidad en bitrates bajos. La presencia de ficheros `mmproj` sugiere que el modelo base incorpora un codificador visual multimodal, pero no se aporta confirmación de que la funcionalidad de visión opere correctamente en esta versión GGUF.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con `text-generation-inference` y `transformers` en los metadatos, además de GGUF para llama.cpp.
- Posible soporte multimodal (visión) por la presencia de suplementos `mmproj`, aunque no confirmado en la documentación.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo de razonamiento explícito (thinking mode), audio ni otras capacidades especiales.
- Capacidades multilingües limitadas al inglés según el campo `language`.
- No se documentan capacidades específicas de código, matemáticas o agentes.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (5,7 GB) el modelo cabe en GPUs de consumo con 8 GB de VRAM, lo que permite ejecutar un asistente conversacional en inglés sin conexión a servicios en la nube.
- Prototipado de chatbots en inglés: la etiqueta `conversational` y la licencia Apache 2.0 permiten integrar el modelo en prototipos de atención al cliente o asistentes internos sin coste de licencia, siempre que se valide la calidad empíricamente.
- Experimentación con cuantizaciones: el repositorio ofrece 12 variantes de cuantización más dos suplementos mmproj, lo que lo hace útil para estudiar la degradación de calidad entre Q2_K y Q8_0 en un modelo de ~9 B.
- Evaluación de pipelines multimodales: los ficheros `mmproj` permiten probar en llama.cpp si el modelo base conserva capacidades de visión tras la cuantización, un caso de interés para investigación aplicada.
- Integración en herramientas de escritorio: al estar en formato GGUF, se puede cargar en Ollama, LM Studio o llama.cpp para asistentes de escritura o generación de texto en inglés en entornos de desarrollo.
- Base para fine-tuning posterior: aunque este repositorio es de solo inferencia, el modelo original en safetensors (Apache 2.0) puede servir como punto de partida para ajuste fino en tareas en inglés, dado su tamaño manejable de ~9 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño del fichero GGUF más overhead de contexto):
  - Q2_K: ~4 GB
  - Q3_K_M: ~5 GB
  - Q4_K_M: ~6 GB
  - Q5_K_M: ~7 GB
  - Q6_K: ~8 GB
  - Q8_0: ~10 GB
  - f16: ~18 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas o contextos largos; A100/H100 solo si se requiere f16 con contexto extenso o alto throughput.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6-8 GB; Q4_K_M es la opción recomendada por el autor para GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (para el modelo base en safetensors), transformers con el modelo original.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Q3.5-ColdBrew-9B-Base-v2-Intrepid (esta ficha) | ~8,95 B | No disponible | Apache 2.0 | GGUF, safetensors | Cuantizaciones estáticas e imatrix; multimodal posible |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo ampliamente documentado con benchmarks publicados |
| Llama 3.1 8B Instruct | ~8 B | 128.000 tokens (según documentación pública de Meta) | Llama 3.1 Community License | safetensors, GGUF | Requiere cumplir la licencia de Meta para uso comercial |
| Mistral 7B Instruct v0.3 | ~7,2 B | 32.768 tokens (según documentación pública de Mistral) | Apache 2.0 | safetensors, GGUF | Alternativa consolidada de tamaño similar |

La comparación se limita a parámetros, contexto y licencia: no hay datos de rendimiento del modelo de esta ficha que permitan comparar calidad. Los datos de contexto de los modelos alternativos provienen de su documentación pública y no de la información proporcionada en esta búsqueda, por lo que deben verificarse en las fuentes originales.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras tareas, lo que impide recomendar el modelo para producción sin evaluación propia.
- Documentación de entrenamiento inexistente: se desconoce el corpus, el volumen de tokens y las técnicas de alineación, lo que dificulta anticipar sesgos o comportamientos.
- Idioma limitado al inglés: no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni documentación de alineación, el riesgo no puede acotarse.
- Funcionalidad multimodal incierta: los ficheros mmproj existen, pero no se confirma que la visión funcione en esta cuantización.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar notablemente la coherencia; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado de un base no documentado, conviene verificar la procedencia y las obligaciones de atribución del modelo original.
- Repositorio con muy poca tracción (278 descargas, 1 like): no hay comunidad que haya reportado problemas o validado el comportamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Q3.5-ColdBrew-9B-Base-v2-Intrepid-GGUF
- Modelo base: https://huggingface.co/SvalTek/Q3.5-ColdBrew-9B-Base-v2-Intrepid
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Q3.5-ColdBrew-9B-Base-v2-Intrepid-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Q3.5-ColdBrew-9B-Base-v2-Intrepid-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
