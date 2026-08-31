# OsaurusAI/gemma-4-E2B-it-4bit

## Resumen

Gemma 4 E2B-it es un modelo multimodal "any-to-any" de Google, diseñado para procesar y generar texto, imágenes y audio. La versión cuantizada de OsaurusAI, `gemma-4-E2B-it-4bit`, es una conversión a MLX (librería de Apple para inferencia en silicio de Apple) con cuantización mixta de 4 y 8 bits, pensada para ejecutarse en Macs con Apple Silicon. El modelo base, `google/gemma-4-E2B-it`, tiene una arquitectura Gemma 4 con torres de visión (SigLIP) y audio (Conformer), un contexto de 128K tokens y un vocabulario de 262K tokens. La conversión de OsaurusAI destaca por verificar que todos los pesos de las torres multimodales sean no nulos, un problema que afecta a otras conversiones de la comunidad. Con un tamaño de 4,1 GB, es adecuado para despliegue local en dispositivos con memoria unificada moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (texto + vision + audio) |
| Parametros totales | 1.405.406.787 (segun safetensors); 2.3B efectivos / 5.1B totales con Per-Layer Embeddings (segun model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | 4-bit affine con MLP en 8-bit (mixed-precision), group size 64 |
| Idiomas soportados | Ingles (segun tags) |
| Licencia | Gemma (Gemma 4 License) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it` es un modelo multimodal "any-to-any" que combina un modelo de lenguaje (35 capas) con una torre de vision SigLIP (658 tensores) y una torre de audio Conformer (751 tensores). La version cuantizada de OsaurusAI se genero con `mlx-vlm` v0.4.4, partiendo de pesos en bfloat16 y aplicando cuantizacion affine con group size 64. La cuantizacion es mixta: las proyecciones MLP (gate, up, down) se mantienen en 8 bits en todas las capas, mientras que atencion y otros pesos se cuantizan a 4 bits. Esto mejora la calidad frente a una cuantizacion uniforme de 4 bits. No se dispone de informacion detallada sobre el entrenamiento del modelo base (datos, tokens, RLHF/DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es instruct-tuned, capaz de responder preguntas, explicar conceptos y mantener conversaciones.
- Comprension de imagenes: la torre SigLIP permite describir imagenes, responder preguntas visuales y realizar tareas de vision.
- Procesamiento de audio: la torre Conformer permite trabajar con entradas de audio, como transcripcion o comprension de comandos de voz.
- Entrada y salida multimodal: al ser "any-to-any", puede aceptar texto, imagen y audio como entrada, y generar texto (y potencialmente otros formatos, aunque no se especifica).
- Contexto largo: ventana de 128K tokens, adecuada para documentos extensos o conversaciones multi-turno con mucho historial.
- Ejecucion en Apple Silicon: optimizado para MLX, aprovecha la memoria unificada de los chips M-series.

## Casos de uso

- Asistente multimodal local en Mac: un desarrollador puede integrar el modelo en una aplicacion de escritorio para macOS que acepte capturas de pantalla, notas de voz y texto, y genere respuestas contextuales. Gracias a MLX, la inferencia se ejecuta sin conexion y con baja latencia en un MacBook con chip M1 o superior.
- Descripcion de imagenes para accesibilidad: el modelo puede generar descripciones alternativas de imagenes en tiempo real, util en herramientas de lectura de pantalla o en aplicaciones de gestion de contenido.
- Transcripcion y resumen de audio: al aceptar audio como entrada, puede transcribir reuniones o podcasts y generar resumenes estructurados, todo localmente sin enviar datos a la nube.
- Analisis de documentos mixtos: procesar PDFs o presentaciones que combinan texto, graficos y diagramas, extrayendo informacion relevante y respondiendo preguntas sobre el contenido.
- Prototipado rapido de agentes multimodales: con la API de `mlx_vlm`, un investigador puede construir un agente que reciba instrucciones de voz, observe una imagen y ejecute acciones de texto, todo en un entorno local.
- Educacion y tutorizacion: generar explicaciones de conceptos a partir de imagenes o diagramas, o responder preguntas de estudiantes con apoyo visual y auditivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El unico dato de rendimiento es el promedio de bits por peso (6.851) y el tamano del modelo (4.1 GB), que indican eficiencia de almacenamiento, pero no calidad de salida.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 4,1 GB, por lo que requiere al menos 8 GB de memoria unificada en Apple Silicon para inferencia comoda (el sistema operativo y otros procesos consumen memoria adicional).
- GPU recomendadas: disenado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No esta optimizado para CUDA; para GPUs NVIDIA se necesitaria una conversion a otro formato (p.ej. GGUF o GPTQ).
- Compatibilidad con consumer GPU: no directamente, al ser MLX. En Macs con 16 GB de RAM unificada o mas, funciona sin problemas.
- Opciones de despliegue: `mlx_vlm` (Python) y la plataforma Osaurus (`osaurus serve`). No se menciona soporte para vLLM, llama.cpp u Ollama en la documentacion.
- Latencia y throughput: no se proporcionan datos. En un MacBook Pro M3, se espera una generacion de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-4-E2B-it (base) | 2.3B efectivos / 5.1B totales | 128K | Texto, vision, audio | Gemma | safetensors (bfloat16) |
| OsaurusAI/gemma-4-E2B-it-4bit | 1.4B (cuantizado) / 2.3B efectivos | 128K | Texto, vision, audio | Gemma | safetensors (MLX, 4-bit) |
| Phi-3.5-vision (Microsoft) | 4.2B | 128K | Texto, vision | MIT | safetensors (varios) |

La comparativa se limita al modelo base y a una alternativa multimodal de tamano similar. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa. La principal diferencia de la version cuantizada es su menor huella de memoria (4,1 GB frente a ~10 GB en bfloat16) y su optimizacion para Apple Silicon.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado solo para ingles; su rendimiento en otros idiomas no esta garantizado.
- Sesgos y alucinaciones: al ser un modelo instruct-tuned, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Licencia Gemma: la licencia de Gemma 4 incluye restricciones de uso (p.ej. prohibicion de ciertos usos de alto riesgo) y requiere aceptacion de los terminos de Google. Es compatible con uso comercial, pero con condiciones.
- Dependencia de MLX: el formato esta atado a la libreria MLX y a Apple Silicon; no es portable a otros ecosistemas sin reconversion.
- Verificacion de pesos: aunque OsaurusAI confirma que todos los tensores multimodales son no nulos, la cuantizacion 4-bit puede degradar ligeramente la calidad frente al modelo en bfloat16, especialmente en tareas de vision y audio.
- Sin benchmarks publicados: no hay evidencia objetiva del rendimiento del modelo cuantizado en tareas estandar, lo que dificulta evaluar su idoneidad para produccion.

## Enlaces

- [HuggingFace: OsaurusAI/gemma-4-E2B-it-4bit](https://huggingface.co/OsaurusAI/gemma-4-E2B-it-4bit)
- [Modelo base: google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- [Pagina de Gemma 4 de Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Ficha de Gemma 4 E2B en gemma4.dev](https://gemma4.dev/models/gemma-4-e2b)
- [Guia de optimizacion de Gemma 4 en NVIDIA RTX (Vucense)](https://vucense.com/ai-intelligence/open-source-ai/nvidia-rtx-ai-garage-google-gemma-4-optimization-2026/)
