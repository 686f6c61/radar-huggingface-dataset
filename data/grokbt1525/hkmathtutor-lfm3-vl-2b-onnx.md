# grokbt1525/HKMathTutor-LFM3-VL-2B-ONNX

## Resumen

HKMathTutor-LFM3-VL-2B-ONNX es un ajuste fino del modelo multimodal LiquidAI/LFM3-VL-2B, orientado a la tutorización de matemáticas de educación primaria en Hong Kong (currículo EDB 2017, cursos P1 a P6). Lo publica el usuario grokbt1525 y su rasgo diferencial es el formato: los pesos se distribuyen como grafos ONNX cuantizados para ejecución en navegador mediante `@huggingface/transformers` con WebGPU e inferencia híbrida WASM/WebGPU, lo que permite desplegarlo íntegramente en cliente sin backend.

El modelo hereda la arquitectura del LFM3-VL-2B de LiquidAI, con un codificador visual y un decodificador de lenguaje, y se especializa en conversaciones educativas en chino tradicional. El repositorio ocupa 2,5 GB e incluye grafos separados para embeddings, codificador visual y decodificador, con variantes q4 y q4f16 pensadas para distintos backends de ejecución.

Su relevancia radica en el nicho: un tutor matemático multimodal que cabe en el navegador de un iPad o un portátil, sin servidor, con reconocimiento de imágenes (por ejemplo, fotos de ejercicios) y respuesta conversacional. La información publicada es escasa: no hay datos de benchmarks, idiomas declarados ni detalles del dataset de ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + decodificador de lenguaje), base LiquidAI/LFM3-VL-2B |
| Parametros totales | 2B (heredados del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4, q4f16 (grafos ONNX) |
| Idiomas soportados | chino tradicional (por el dominio del ajuste fino); resto no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas) |
| Formato de pesos | ONNX (grafos separados con ficheros `.onnx_data`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B, un modelo image-text-to-text con codificador visual y decodificador de lenguaje. Sobre esa base se ha realizado un ajuste fino orientado a tutorización matemática de primaria en Hong Kong, con el currículo EDB 2017 como referencia y conversación en chino tradicional. No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica está en la exportación: el repositorio incluye grafos ONNX independientes para `embed_tokens` (q4f16, 144,53 MB), `vision_encoder` en dos variantes (q4, 114,97 MB, compatible con WASM para ejecución híbrida en Safari de iPad; y q4f16, 103,47 MB, para WebGPU) y `decoder_model_merged` (q4f16, 988,27 MB). Esta separación permite ejecutar el codificador visual en WASM y el decodificador en WebGPU según las capacidades del dispositivo.

## Capacidades

- Generación de texto conversacional en chino tradicional, orientada a explicaciones matemáticas de primaria.
- Comprensión de imágenes (image-text-to-text): puede recibir capturas o fotos de ejercicios y responder sobre ellas.
- Tutorización multi-turno: el pipeline está pensado para diálogo educativo.
- Ejecución en navegador mediante transformers.js con WebGPU y modo híbrido WASM/WebGPU.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.
- No se documentan capacidades de audio ni otros idiomas distintos del chino tradicional.

## Casos de uso

- Tutor matemático en navegador para alumnos de P1 a P6: el modelo se carga con transformers.js y responde en chino tradicional a preguntas del currículo EDB 2017, sin necesidad de backend ni de enviar datos del menor a un servidor.
- Corrección de ejercicios a partir de foto: el codificador visual permite enviar una imagen del cuaderno y obtener una explicación del error, útil en tablets con cámara.
- Práctica guiada en iPad Safari: la variante q4 del codificador visual está pensada para ejecución híbrida WASM/WebGPU, lo que facilita su uso en dispositivos Apple sin soporte completo de WebGPU.
- Aplicación educativa offline-first: al distribuirse como ficheros ONNX estáticos, puede empaquetarse en una PWA y funcionar con conectividad intermitente en aulas.
- Demostraciones y prototipos de EdTech: permite validar experiencias de tutoría multimodal en cliente con un coste de infraestructura nulo.
- Investigación sobre ajuste fino de modelos pequeños multimodales en dominios curriculares concretos, usando este modelo como referencia de especialización en matemáticas de primaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por los tamaños de los grafos (decodificador q4f16 de 988,27 MB, codificador visual de 103-115 MB y embeddings de 144,53 MB), el conjunto ronda 1,2-1,3 GB en disco, lo que sugiere un consumo de memoria en el mismo orden durante la inferencia.
- GPU recomendadas: no disponibles; el diseño apunta a GPUs integradas o de gama media con WebGPU en navegador.
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs con soporte WebGPU (por ejemplo, Apple Silicon, Intel Arc, NVIDIA RTX recientes); no hay cifras oficiales.
- Despliegue: transformers.js (`@huggingface/transformers`) con WebGPU e híbrido WASM/WebGPU; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Formato | Licencia |
|---|---|---|---|---|---|
| HKMathTutor-LFM3-VL-2B-ONNX | 2B | no disponible | Sí | ONNX (navegador) | other |
| LiquidAI/LFM3-VL-2B (base) | 2B | no disponible | Sí | safetensors (formato original) | según modelo base |
| Modelos de tutoría matemática especializados | no disponible | no disponible | variable | variable | variable |

No se dispone de datos de rendimiento comparado con alternativas; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Dominio muy restringido: ajustado a matemáticas de primaria de Hong Kong; su rendimiento fuera de ese ámbito no está documentado.
- Idioma: el ajuste fino se orienta a chino tradicional; no se declaran otros idiomas soportados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, precisión matemática ni tasa de alucinación.
- Licencia "other": las condiciones exactas no se detallan en la información disponible; es necesario revisar la licencia del modelo base LiquidAI/LFM3-VL-2B antes de un uso comercial.
- Riesgo de alucinación inherente a modelos de 2B en tareas matemáticas; requiere validación humana en contextos educativos reales.
- Ejecución en navegador dependiente de WebGPU: en dispositivos sin soporte, la variante híbrida WASM puede degradar la latencia de forma notable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.
- No se documentan sesgos específicos, pero al estar entrenado sobre un currículo concreto puede reflejar supuestos culturales y curriculares de Hong Kong.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grokbt1525/HKMathTutor-LFM3-VL-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Librería de inferencia en navegador: https://github.com/huggingface/transformers.js
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Currículo EDB 2017 (referencia del ajuste fino): no disponible en la información proporcionada.
