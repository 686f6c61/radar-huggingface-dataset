# mradermacher/Kvark-Sparkle-1.0-27B-GGUF

## Resumen

Kvark-Sparkle-1.0-27B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF, publicado por mradermacher, del modelo base Egzakta/Kvark-Sparkle-1.0-27B. El modelo original es un modelo de razonamiento (reasoning) de 27,3 mil millones de parámetros desarrollado por Egzakta, etiquetado con la arquitectura "qwen3.8" y con soporte de MTP (multi-token prediction), entrenado con datasets de matemáticas (DeepMath-103K), instrucciones con múltiples restricciones (IF_multi_constraints_upto5), conocimiento científico (SuperGPQA) y generación de código (LiveCodeBench code_generation_lite).

Este repositorio en sí no contiene pesos originales, sino versiones cuantizadas que van desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), lo que permite ejecutar el modelo en hardware de consumo con llama.cpp, Ollama u otras herramientas compatibles con GGUF. Incluye además archivos mmproj (suplemento multimodal) en Q8_0 y f16, lo que sugiere que el modelo base dispone de capacidades de visión.

La relevancia de esta ficha radica en que hace accesible un modelo de razonamiento de 27B con licencia Apache 2.0, una combinación poco frecuente: tamaño intermedio-grande, licencia permisiva para uso comercial y disponibilidad en formatos comprimidos para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 ("qwen3.8"), con multi-token prediction (MTP) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (según la model card; no disponible informacion sobre otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base, Egzakta/Kvark-Sparkle-1.0-27B, se etiqueta con la familia "qwen3.8", lo que indica que su arquitectura deriva de Qwen3, una familia de transformers densos. Los tags incluyen "mtp" (multi-token prediction), una tecnica que entrena al modelo para predecir varios tokens a la vez y que puede habilitar decodificacion especulativa para acelerar la inferencia. El tag "efficient-reasoning" sugiere optimizaciones orientadas a reducir la longitud de las cadenas de razonamiento.

Sobre el entrenamiento del modelo base, la model card lista cuatro datasets de referencia, probablemente usados en fases de fine-tuning o RL: DeepMath-103K (problemas de matematicas desafiantes), IF_multi_constraints_upto5 (seguimiento de instrucciones con hasta cinco restricciones simultaneas), SuperGPQA (preguntas de conocimiento de nivel graduado en multiples disciplinas) y LiveCodeBench code_generation_lite (generacion de codigo con evaluacion temporal). No se dispone de datos sobre el numero de tokens de preentrenamiento ni sobre el metodo exacto de alineacion (SFT, RLHF o DPO).

Las cuantizaciones de este repositorio fueron generadas por mradermacher a partir de los pesos safetensors del modelo base, en formato GGUF estático; existen tambien cuantizaciones weighted/imatrix en un repositorio hermano.

## Capacidades

- Razonamiento (reasoning): el modelo esta etiquetado como reasoning y efficient-reasoning, orientado a tareas que requieren cadenas de pensamiento.
- Matematicas: entrenado con DeepMath-103K, apto para resolucion de problemas matematicos avanzados.
- Generacion de codigo: datos de LiveCodeBench para generacion de codigo y resolucion de problemas de programacion.
- Seguimiento de instrucciones complejas: entrenado con instrucciones de hasta cinco restricciones simultaneas.
- Conocimiento cientifico y academico: datos de SuperGPQA cubren preguntas de nivel graduado en multiples campos.
- Visión: la presencia de archivos mmproj-Q8_0 y mmproj-f16 indica soporte multimodal (entrada de imagenes) cuando se usan junto con el GGUF principal en llama.cpp.
- Conversacion: etiquetado como conversational.
- No consta soporte oficial de tool calling, function calling ni modo de agentes en la informacion disponible.

## Casos de uso

- Resolucion de problemas matematicos offline: gracias al entrenamiento con DeepMath-103K, se puede usar como asistente de matematicas para estudiantes o investigadores ejecutandose localmente con Ollama en un Q4_K_M de unos 17 GB.
- Programacion asistida en local: el entrenamiento con LiveCodeBench lo hace adecuado para generar y depurar codigo en editores locales (por ejemplo, via Continue o llama.cpp server) sin enviar codigo propietario a la nube.
- Seguimiento de instrucciones con multiples restricciones: util para generar contenido que deba cumplir varias condiciones a la vez (formato, longitud, tono, exclusiones), dado el dataset IF_multi_constraints_upto5.
- Respuesta a preguntas tecnicas y cientificas: los datos de SuperGPQA lo orientan a consultas de nivel avanzado en ciencias e ingenieria.
- Analisis de documentos con imagenes: usando los archivos mmproj, se puede realizar entrada multimodal (texto + imagen) en entornos llama.cpp, por ejemplo para extraer informacion de capturas o diagramas.
- Despliegue en servidores con GPU de consumo: con la cuantizacion Q4_K_S (15,9 GB) cabe en una RTX 4090 de 24 GB, permitiendo servir el modelo a un equipo pequeno con latencias razonables.
- Investigacion en razonamiento eficiente: los tags efficient-reasoning y mtp lo hacen interesante como base para experimentar con decodificacion especulativa y razonamiento comprimido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio de cuantizaciones. Los datasets de entrenamiento del modelo base (DeepMath-103K, SuperGPQA, LiveCodeBench) sugieren evaluacion en esos dominios, pero no constan puntuaciones concretas de MMLU, GSM8K ni otras metricas. Consulta la model card de Egzakta/Kvark-Sparkle-1.0-27B para posibles resultados oficiales.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto):
  - Q2_K: ~11 GB
  - Q4_K_S / IQ4_XS: ~15,5-15,9 GB
  - Q4_K_M: ~16,9 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_S o Q4_K_M completamente en GPU.
  - RTX 5090 (32 GB): hasta Q6_K en GPU.
  - A100/H100 (40-80 GB): Q8_0 con contexto amplio.
- Consumer GPUs: si cabe. Con 16 GB (RTX 4060 Ti 16 GB, RTX 4080) cabe Q2_K o Q3_K; con 24 GB, las cuantizaciones Q4 recomendadas.
- CPU / hibrido: posible con llama.cpp offloading parcial; el tamano de 11-17 GB lo hace viable en equipos con 32 GB de RAM usando descarga parcial a GPU.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No consta soporte verificado en vLLM o TGI para estos archivos GGUF.
- Latencia y throughput: no disponible. El soporte MTP del modelo base podria acelerar la generacion si el runtime lo aprovecha.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Kvark-Sparkle-1.0-27B (este, via GGUF) | 27,3B | GGUF (Q2_K a Q8_0) | Apache 2.0 | Razonamiento, MTP, multimodal via mmproj |
| Qwen3-30B-A3B | 30B (3B activos, MoE) | safetensors + GGUF comunitarios | Apache 2.0 | Inferencia mas rapida por MoE, ecosistema maduro |
| Gemma 3 27B | 27B | safetensors + GGUF comunitarios | Licencia Gemma (restricciones) | Multimodal nativo, contexto largo, licencia menos permisiva |
| QwQ-32B | 32B | safetensors + GGUF comunitarios | Apache 2.0 | Razonamiento fuerte, mayor consumo de VRAM |

Kvark-Sparkle destaca por combinar razonamiento, licencia Apache 2.0 y tamano 27B; frente a Gemma 3 27B ofrece una licencia mas permisiva, y frente a QwQ-32B un menor consumo de memoria, aunque sin benchmarks publicados para contrastar rendimiento.

## Limitaciones y advertencias

- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta documentado y puede ser inferior.
- Sesgos: no disponible informacion sobre sesgos conocidos; al derivar de la familia Qwen3, podria heredar los sesgos de sus datos de preentrenamiento.
- Alucinaciones: como todo modelo de lenguaje, puede generar informacion falsa con apariencia plausible, especialmente fuera de los dominios de entrenamiento (matematicas, codigo, ciencia).
- Contexto: la longitud de ventana de contexto no esta documentada en la informacion disponible; verificala antes de planificar cargas con documentos largos.
- Cuantizacion: las cuantizaciones bajas (Q2_K, Q3_K_S/M) degradan apreciablemente la calidad, especialmente en razonamiento y matematicas; mradermacher recomienda Q4_K_S/Q4_K_M como punto de equilibrio.
- Multimodalidad: el soporte de vision depende de los archivos mmproj y del soporte del runtime; no todos los backends GGUF lo gestionan igual.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos de los datasets de entrenamiento si se reentrena.
- Este repositorio es una cuantizacion de terceros (mradermacher); cualquier problema de calidad del modelo base debe reportarse a Egzakta, no al cuantizador.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Kvark-Sparkle-1.0-27B-GGUF
- Modelo base: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Kvark-Sparkle-1.0-27B-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Kvark-Sparkle-1.0-27B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Dataset DeepMath-103K: https://huggingface.co/datasets/zwhe99/DeepMath-103K
