# mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF

## Resumen

KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF es una colección de cuantizaciones en formato GGUF con matriz de importancia (imatrix) del modelo OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion, publicada por el cuantizador mradermacher. El modelo base es un merge (fusión de pesos) de arquitectura MoE basada en la familia Qwen 3.5 MoE, con unos 35,5 mil millones de parámetros totales de los que aproximadamente 3 mil millones están activos por token (según la nomenclatura A3B), lo que permite una inferencia mucho más ligera de lo que sugiere su tamaño nominal.

El modelo base está etiquetado para tareas de código, agentes y razonamiento, y la model card indica que se trata de un modelo con capacidades de visión (se mencionan archivos mmproj en el repositorio de cuantizaciones estáticas). Este repositorio de mradermacher no aporta pesos originales ni datos de entrenamiento: su valor está en ofrecer versiones comprimidas que van desde unos 13 GB (i1-Q2_K) hasta 29,3 GB (i1-Q6_K), haciendo viable ejecutar el modelo en hardware de consumo.

Su relevancia actual radica en la combinación de tres factores: arquitectura MoE con pocos parámetros activos (alta velocidad por token), especialización en razonamiento y agentes, y disponibilidad inmediata en GGUF para llama.cpp, Ollama y derivados, todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en qwen3_5_moe (merge/fusión de modelos) |
| Parametros totales | 35.505.251.456 (≈35,5B, dato de safetensors) |
| Parametros activos | ≈3B (inferido de la nomenclatura A3B; no confirmado explicitamente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | en (ingles, segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base, KAT-Ornith-HERO-35B-A3B-Fusion, es un merge construido sobre la arquitectura Qwen 3.5 MoE. Al tratarse de una fusión de modelos, no de un entrenamiento desde cero, no hay datos publicados en este repositorio sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO: no disponible. La etiqueta A3B sugiere que de los 35,5B de parámetros totales solo unos 3B se activan por token, el rasgo característico de los MoE dispersos que reduce drásticamente el coste de inferencia manteniendo la capacidad del modelo completo.

La aportación de mradermacher es técnica de cuantización: se trata de quants imatrix (weighted), que usan una matriz de importancia calculada sobre datos de calibración para asignar mayor precisión a los tensores más sensibles. Según la propia model card, los quants IQ suelen superar en calidad a los quants estáticos de tamaño equivalente, y las variantes i1-IQ3_S y i1-IQ4_XS son las recomendadas en sus rangos respectivos. Los archivos mmproj (proyección multimodal para visión) están en el repositorio de cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional (etiquetado como "conversational" en el repositorio).
- Razonamiento (tag "reasoning" del modelo base).
- Generación y comprensión de codigo (tag "code").
- Uso como agente (tag "agent"), presumiblemente con soporte de tool calling heredado de la familia Qwen, aunque no confirmado en la model card.
- Capacidades de visión: la model card indica explicitamente que es un modelo de visión y remite los archivos mmproj al repositorio estático.
- Arquitectura MoE con ~3B de parámetros activos, adecuada para inferencia rápida en hardware moderado.
- Capacidades multilingues: la model card declara solo ingles ("en"); otros idiomas no disponibles/confirmados.

## Casos de uso

- Chatbots y asistentes locales: con la cuantización i1-Q4_K_M (21,8 GB) cabe en una RTX 3090/4090 de 24 GB, permitiendo un asistente conversacional privado sin depender de APIs externas.
- Asistentes de codigo en local: dado el tag "code", puede integrarse en editores vía extensiones tipo Continue o llama.cpp server para autocompletado y refactorización con latencias bajas gracias a los ~3B de parámetros activos.
- Agentes automatizados con herramientas: el tag "agent" lo hace candidato para frameworks de agentes (LangChain, AutoGen, etc.) que ejecuten cadenas de razonamiento multi-paso con llamadas a funciones, ejecutándose en un servidor local con llama.cpp o vLLM con backend GGUF.
- Razonamiento paso a paso sobre problemas complejos: la etiqueta "reasoning" lo orienta a tareas de lógica, planificación y resolución de problemas donde el usuario prefiera un modelo open source auditable.
- Análisis de imágenes en local: al ser un modelo de visión, puede usarse para descripción de imágenes, OCR ligero o análisis de capturas en flujos de trabajo privados, cargando el mmproj correspondiente desde el repositorio estático.
- Prototipado y evaluación de merges MoE: al estar cuantizado en 14 variantes distintas, es útil para comparar degradación de calidad frente a tamaño en hardware limitado, o como base para nuevos merges.
- Despliegue en servidores de gama media: la variante i1-Q3_K_M (17,3 GB) permite servir el modelo en GPUs de 20-24 GB o en CPU con RAM suficiente para entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un repositorio de cuantizaciones de un merge comunitario, ni mradermacher ni la model card original aportan puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia (según la tabla de quants del propio repositorio):
  - i1-Q2_K: 13,3 GB (cabe en GPUs de 16 GB).
  - i1-Q3_K_M / i1-IQ3_M: 15,7-17,3 GB (cabe en RTX 4080/4090 o RTX 3090).
  - i1-Q4_K_M: 21,8 GB (cabe en RTX 3090/4090 de 24 GB; cuant recomendada por el autor).
  - i1-Q5_K_M: 25,4 GB y i1-Q6_K: 29,3 GB (requieren GPUs de 32 GB o más, o descarga parcial a CPU/RAM).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para las cuants Q4; A100 40 GB, RTX 5090 o similares para Q5/Q6 sin descarga. En CPU puro es viable con 32 GB de RAM, con throughput notablemente inferior.
- Consumer GPUs: sí, la gama Q3 y Q4 cabe en una RTX 3090/4090 de 24 GB; las variantes Q2/Q3 caben incluso en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF imatrix. Para el modelo base en safetensors, vLLM o TGI serían opciones, aunque no hay confirmación de compatibilidad con la arquitectura qwen3_5_moe en esos runtimes.
- Latencia y throughput: no disponible como cifras concretas; la arquitectura A3B (~3B activos) implica velocidades por token comparables a un modelo denso de ~3B, muy superiores a un denso de 35B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAT-Ornith-HERO-35B-A3B-Fusion (este) | ≈35,5B | ≈3B (A3B) | no disponible | Apache 2.0 | GGUF imatrix (14 cuants) |
| Qwen3-30B-A3B (familia base declarada) | 30,5B | 3,3B | 32k-128k (según version) | Apache 2.0 | safetensors y GGUF amplios |
| Qwen3-32B (denso comparable en capacidad) | 32,8B | 32,8B | 32k-128k (según version) | Apache 2.0 | safetensors y GGUF amplios |

Nota: la comparativa usa la familia Qwen 3 como referencia por ser la base arquitectónica declarada (qwen3_5_moe). Los datos de rendimiento comparado no están disponibles para este merge.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente el ingles; el rendimiento en castellano no está garantizado ni documentado.
- Al ser un merge comunitario, no hay documentación formal del proceso de fusión, ni datos de entrenamiento, ni benchmarks: la calidad real debe validarse caso por caso antes de uso en producción.
- Riesgo de alucinación: inherente a cualquier LLM; agravado por la ausencia de evaluaciones publicadas que cuantifiquen la fiabilidad del merge.
- Las cuantizaciones agresivas (Q2_K, Q3) degradan apreciablemente la calidad, especialmente en razonamiento y codigo; el propio autor recomienda IQ3_XXS sobre Q2_K e IQ4_XS/Q4_K_M como punto de equilibrio.
- Contexto: la longitud de ventana no está documentada en este repositorio; verificarla en la configuración del modelo base antes de planificar tareas de contexto largo.
- Sesgos conocidos: no documentados; heredará los sesgos de los modelos origen del merge y de los datos de Qwen, sin auditoría publicada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los modelos origen del merge, que podrían imponer condiciones adicionales.
- Para las capacidades de visión es necesario descargar los archivos mmproj del repositorio estático; sin ellos el modelo funciona solo como LLM de texto.
- Etiquetas como "agent" o "reasoning" son tags del autor y no garantizan soporte verificado de tool calling; probar con el chat template correspondiente.

## Enlaces

- Repositorio de cuantizaciones imatrix (esta ficha): https://huggingface.co/mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye mmproj para visión): https://huggingface.co/mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion
- Página de descargas resumida: https://hf.tst.eu/model#KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre calidad de cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
