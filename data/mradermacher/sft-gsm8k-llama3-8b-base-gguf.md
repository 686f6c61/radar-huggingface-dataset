# mradermacher/sft-gsm8k-llama3-8b-base-GGUF

## Resumen

`sft-gsm8k-llama3-8b-base-GGUF` es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo `ankner/sft-gsm8k-llama3-8b-base`, un ajuste fino supervisado (SFT) sobre Llama 3 8B base orientado a la resolucion de problemas matematicos del dataset GSM8K. El modelo original parte de la arquitectura Llama 3 de Meta (8.030.261.248 parametros, transformer denso) y ha sido especializado mediante entrenamiento supervisado en razonamiento aritmetico de varios pasos.

La relevancia de esta publicacion es practica: ofrece el modelo en formato GGUF con 11 niveles de cuantizacion distintos (desde Q2_K de 3,3 GB hasta f16 de 16,2 GB), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama u otros runners compatibles con GGUF. Es, por tanto, una via de bajo coste para experimentar con un modelo afinado en matematicas sin necesidad de GPU de datacenter.

Conviene subrayar que se trata de una cuantizacion estatica: el autor indica que no hay versiones con imatrix o weighted quants disponibles en el momento de la publicacion, y que no planea generarlas salvo peticion explicita en la seccion de discusiones de la comunidad. La licencia del modelo no esta declarada en la informacion disponible, lo que constituye una limitacion relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3 8B base, ajustado con SFT) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 71,8 GB (incluye todas las cuantizaciones) |
| Modelo base | ankner/sft-gsm8k-llama3-8b-base |
| Cuantizador | mradermacher |
| Fecha de creacion | 2025-02-24 |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3 8B en su variante base, un transformer denso decoder-only con 8.030 millones de parametros. Sobre esa base, el autor original (`ankner`) aplico un ajuste fino supervisado (SFT) utilizando GSM8K, un dataset de problemas matematicos de nivel escolar que requieren razonamiento aritmetico de varios pasos. El objetivo del ajuste es mejorar la capacidad del modelo para producir cadenas de razonamiento correctas y llegar a la respuesta final.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de GSM8K, ni sobre si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. Tampoco se documenta la configuracion de hiperparametros del SFT. La innovacion tecnica de esta publicacion concreta no esta en el entrenamiento sino en la distribucion: mradermacher aplica cuantizacion estatica (sin imatrix) sobre los pesos en formato Hugging Face y los convierte a GGUF, generando una matriz de variantes que cubren desde 3,3 GB hasta 16,2 GB.

## Capacidades

- Generacion de texto en ingles con enfasis en razonamiento matematico de varios pasos.
- Resolucion de problemas aritmeticos tipo GSM8K, incluyendo problemas verbales de nivel escolar.
- Razonamiento encadenado (chain-of-thought) para descomponer problemas en pasos intermedios.
- Conversacion multi-turno basica (el tag `conversational` aparece en los metadatos del repositorio).
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags), lo que permite su despliegue en infraestructuras de inferencia compatibles.
- No hay evidencia de soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo `language` del repositorio.

## Casos de uso

- **Tutoria matematica automatizada**: el modelo puede recibir un problema verbal en ingles y generar la solucion paso a paso, lo que lo hace util en plataformas educativas que necesiten explicaciones detalladas de ejercicios de aritmetica escolar.
- **Generacion de datasets sinteticos de matematicas**: al estar afinado en GSM8K, puede emplearse para producir variaciones de problemas y soluciones que alimenten pipelines de entrenamiento o evaluacion de otros modelos.
- **Evaluacion de tecnicas de cuantizacion**: la disponibilidad de 11 niveles de cuantizacion en un mismo repositorio permite medir empiricamente el impacto de la cuantizacion en tareas de razonamiento aritmetico, comparando Q2_K frente a Q8_0 sobre el mismo conjunto de problemas.
- **Prototipado en hardware de consumo**: con la variante Q4_K_M (5,0 GB) el modelo cabe en GPUs consumer de 8 GB de VRAM, lo que facilita experimentar con un modelo matematico afinado en un portatil o estacion de trabajo sin GPU de datacenter.
- **Despliegue en entornos con restricciones de red**: al ser GGUF y ejecutable con llama.cpp u Ollama, puede correr completamente en local, sin llamadas a APIs externas, en escenarios con requisitos de privacidad o conectividad limitada.
- **Benchmark de referencia para ajustes finos en matematicas**: sirve como linea base cuantizada para comparar contra otros modelos afinados en GSM8K (por ejemplo, variantes RPO del mismo autor) en terminos de precision y coste computacional.
- **Integracion en asistentes de resolucion de deberes**: combinado con un frontend conversacional, puede gestionar consultas de estudiantes y devolver explicaciones paso a paso, siempre que el idioma de interaccion sea el ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (aproximada, segun el tamano del fichero GGUF y el overhead de contexto):
  - Q2_K: ~3,3 GB de pesos, ~4-5 GB con contexto moderado.
  - Q3_K_M: ~4,1 GB de pesos, ~5-6 GB con contexto.
  - Q4_K_M: ~5,0 GB de pesos, ~6-7 GB con contexto.
  - Q5_K_M: ~5,8 GB de pesos, ~7-8 GB con contexto.
  - Q6_K: ~6,7 GB de pesos, ~8-9 GB con contexto.
  - Q8_0: ~8,6 GB de pesos, ~10-11 GB con contexto.
  - f16: ~16,2 GB de pesos, ~18 GB con contexto.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para las variantes Q4 a Q8; A100 o H100 solo necesarias para f16 o para servir muchas peticiones concurrentes.
- **Cabe en GPU consumer**: si. Las variantes Q2_K a Q5_K_M caben en GPUs de 8 GB; Q6_K y Q8_0 requieren 12-16 GB; f16 requiere 24 GB o mas.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. Para servir en produccion con alto throughput, vLLM y TGI no consumen GGUF de forma nativa, por lo que habria que usar el modelo base en safetensors.
- **Latencia y throughput**: no disponibles. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality", pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sft-gsm8k-llama3-8b-base-GGUF (este) | 8,03 B | no disponible | GGUF | no disponible | SFT sobre GSM8K, cuantizacion estatica |
| mradermacher/llama3-8b-gsm8k-rpo-GGUF | 8 B (familia Llama 3) | no disponible | GGUF | no disponible | Variante afinada con RPO sobre GSM8K, mismo cuantizador |
| mradermacher/Code-Llama-3-8B-GGUF | 8 B (familia Llama 3) | no disponible | GGUF | no disponible | Enfocado a codigo, no a matematicas |
| ankner/sft-gsm8k-llama3-8b-base | 8,03 B | no disponible | safetensors | no disponible | Modelo original sin cuantizar, del que deriva este |

La comparativa se limita a modelos de la misma familia y tamano presentes en la informacion disponible; no se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- **Licencia no declarada**: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue en produccion.
- **Solo ingles**: el campo `language` del repositorio indica unicamente `en`; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- **Especializacion estrecha**: el ajuste SFT sobre GSM8K puede degradar capacidades generales del Llama 3 base (conversacion abierta, codigo, conocimiento factual) en favor del razonamiento aritmetico.
- **Riesgo de alucinacion**: como cualquier modelo de 8 B, puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en problemas fuera de la distribucion de GSM8K.
- **Cuantizacion estatica sin imatrix**: las variantes de baja precision (Q2_K, Q3_K_S) pueden perder calidad de forma notable en tareas de razonamiento; el autor no ofrece versiones con imatrix que suelen mitigar esta perdida.
- **Contexto no documentado**: se desconoce la longitud de contexto efectiva tras el ajuste fino; no debe asumirse la ventana nativa de Llama 3 sin verificacion.
- **Fecha de actualizacion futura**: el repositorio muestra una fecha de actualizacion (2026-11-07) posterior a la de creacion, lo que sugiere posibles cambios en el contenido; conviene verificar la integridad de los ficheros descargados.
- **Sin garantias de soporte**: el autor no ofrece versiones con imatrix ni se compromete a mantener las cuantizaciones; las peticiones deben canalizarse via Community Discussion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/sft-gsm8k-llama3-8b-base-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/ankner/sft-gsm8k-llama3-8b-base
- Pagina de descargas del cuantizador para este modelo: https://hf.tst.eu/model#sft-gsm8k-llama3-8b-base-GGUF
- Guia de uso de GGUF (README de TheBloke referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Variante relacionada (RPO sobre GSM8K): https://huggingface.co/mradermacher/llama3-8b-gsm8k-rpo-GGUF
- Variante relacionada (Code Llama 3 8B): https://huggingface.co/mradermacher/Code-Llama-3-8B-GGUF
