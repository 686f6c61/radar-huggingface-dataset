# MisasAI/Vulcan-1-small-GGUF

## Resumen

Vulcan-1-small (publicado como Vulcan-1-Coder) es un modelo de lenguaje de 2.500 millones de parametros orientado a codigo, razonamiento y matematicas, distribuido unicamente en formato GGUF por el autor independiente MisasAI. No se trata de un modelo entrenado desde cero, sino de un merge derivado de DRUPEs/CherryPit-1.2-2B, a su vez basado en la familia MiniCPM. El autor describe el proceso como "Integer Space Artificial Selection": una busqueda evolutiva sobre pesos cuantizados que selecciona variantes sin ejecutar entrenamiento adicional.

La relevancia del modelo reside en su metodologia y en su perfil de despliegue: se genero y evaluo en una GPU de 6 GB de VRAM en una sola tarde, y su artefacto principal (Q4_K_M) ocupa 1,56 GB, lo que permite inferencia local en hardware de consumo. El autor afirma que la cuantizacion Q4_K_M no solo conserva el rendimiento, sino que supera a Q8_0 en sus pruebas, algo que atribuye al propio proceso de seleccion sobre ese tamano concreto de cuantizacion.

La informacion disponible es limitada: no hay model card completa de arquitectura, no se publican benchmarks de codigo y el metodo de seleccion esta pendiente de publicacion. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de MiniCPM via CherryPit 1.2); detalles no disponibles |
| Parametros totales | 2.516.756.480 (2,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las pruebas usan hasta 24K tokens de generacion con thinking) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K (S/M/L), IQ3_M, IQ3_S; variantes con imatrix y mezclas optimizadas por tensor |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors "coming soon" segun el autor) |

## Arquitectura y entrenamiento

El modelo es un merge de DRUPEs/CherryPit-1.2-2B, un modelo de 2,5 B de parametros de la familia MiniCPM. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. El autor no publica la configuracion de capas, dimensiones ocultas ni mecanismos de atencion.

La innovacion declarada es el metodo de construccion: "Integer Space Artificial Selection". Segun la model card, se generaron y evaluaron unas 30 variantes del modelo (12 en la misma clase de tamano) en espacio de enteros, es decir, operando directamente sobre pesos cuantizados, y se selecciono la mejor mediante un esquema de "liga" competitiva descrito como analogo a la seleccion evolutiva. No hay entrenamiento adicional: el autor lo describe como "exprimir" el entrenamiento ya presente en el modelo base. Todos los archivos GGUF se reconstruyeron despues desde los pesos de precision completa para evitar un error de redondeo BF16 que hacia que las versiones derivadas no coincidieran con los pesos ganadores. El autor advierte que el modelo no re-cuantiza bien a otros tamanos: Q4_K_M es el artefacto de referencia y los demas tamanos rinden peor de lo esperado.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico con modo "thinking" (cadena de razonamiento extendida, hasta 24K tokens en las pruebas).
- Generacion y razonamiento sobre codigo (declarado en los tags y en el nombre del modelo; benchmarks de codigo pendientes de publicacion).
- Razonamiento multi-paso orientado a problemas tipo competicion (AIME).
- Compatible con llama.cpp, LM Studio y Ollama, segun los tags del repositorio.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Multilingue: no; solo ingles declarado.

## Casos de uso

- Asistente de codigo en local: con 1,56 GB en Q4_K_M, el modelo cabe en practicamente cualquier portatil y permite autocompletado, explicacion de fragmentos y generacion de funciones sin conexion ni coste de API, integrado en editores via llama.cpp u Ollama.
- Razonamiento matematico asistido: su rendimiento en AIME 2025 y 2026 (70% y 76,7% en las pruebas del autor) lo hace util para resolver problemas de nivel preuniversitario y competicion, con el modo thinking activado y presupuesto de tokens amplio.
- Prototipado rapido en entornos con GPU modesta: sirve para validar pipelines de agentes o de generacion antes de migrar a modelos mayores, dado que se ejecuta en GPUs de 6 GB de VRAM.
- Educacion y tutoria de matematicas: puede desglosar la resolucion paso a paso gracias al modo thinking, util en herramientas de aprendizaje que requieran trazabilidad del razonamiento.
- Experimentacion con cuantizacion: el repositorio incluye una matriz de cuantizaciones con metricas KL y acuerdo top-1 frente a precision completa, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantizacion en modelos pequenos.
- Inferencia en el borde (on-device): su tamano permite desplegarlo en dispositivos con recursos limitados para tareas de generacion de texto y asistencia basica en ingles.
- Investigacion sobre merging y seleccion de modelos: el metodo descrito, pendiente de publicacion, es replicable como caso de estudio de optimizacion sin entrenamiento.

## Benchmarks y rendimiento

Los unicos resultados publicados son de matematicas, sin herramientas y sobre versiones cuantizadas. El autor advierte que no ha habido entrenamiento ni pruebas exhaustivas posteriores a la seleccion.

| Benchmark | Resultado | Condiciones |
|---|---|---|
| AIME 2025 | 21/30 (70,0%) | thinking on, hasta 24K tokens, temperatura 1.0, 1 muestra, Q8_0 (medido sobre el Q8_0 de exportacion BF16 anterior, no sobre el archivo actual; repeticion pendiente) |
| AIME 2026 | 23/30 (76,7%) | thinking on, hasta 24K tokens, temperatura 1.0, 1 muestra; cuantizacion no especificada en el fragmento disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de codigo en la informacion disponible. El autor indica que los benchmarks de codigo estan "coming soon".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para Q4_K_M (1,56 GB de pesos mas overhead de contexto); unos 3,5 GB para Q8_0 (2,68 GB de pesos).
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente; el autor lo genero y probo en una GPU de 6 GB. Funciona tambien en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en iGPU con RAM compartida.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (segun los tags del repositorio); vLLM y TGI no estan confirmados para este formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vulcan-1-small (este) | 2,5 B | no disponible | Apache 2.0 | GGUF | Merge de CherryPit 1.2; solo ingles; AIME 2025 70% |
| DRUPEs/CherryPit-1.2-2B | 2 B (aprox., segun nombre) | no disponible | no disponible | no disponible | Modelo base del que deriva Vulcan; sin datos de benchmarks en esta ficha |
| Qwen2.5-Coder-1.5B | 1,5 B | 32K (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Alternativa de codigo en tamano similar; benchmarks no comparados aqui por falta de datos de Vulcan |
| Qwen2.5-Math-1.5B | 1,5 B | 4K (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Especializado en matematicas; comparacion directa no disponible |

La comparativa cuantitativa no es posible con la informacion disponible: Vulcan solo publica resultados de AIME y no se han divulgado cifras de los modelos alternativos en las mismas condiciones (thinking, 24K tokens, sin herramientas).

## Limitaciones y advertencias

- Modelo experimental sin validacion independiente: el autor reconoce que "no ha sido probado ni entrenado a fondo tras la seleccion" y que "puede tener fallos", incluyendo un caso en el que genero una secuencia de simbolos sin sentido.
- Resultados fragiles: el AIME 2025 se midio sobre una version anterior (Q8_0 de exportacion BF16), no sobre el archivo publicado, y la repeticion esta pendiente. Los benchmarks usan una sola muestra, lo que reduce la fiabilidad estadistica.
- Cuantizacion no portable: el autor advierte explicitamente que el modelo no re-cuantiza bien a otros tamanos; Q4_K_M es el unico artefacto recomendado y los demas pueden degradarse de forma impredecible.
- Solo ingles: no hay soporte multilingue declarado, lo que limita su uso en produccion en castellano u otros idiomas.
- Sin datos de contexto oficial: se desconoce la ventana de contexto nativa; las pruebas usan hasta 24K tokens de generacion, pero no se confirma el limite del modelo.
- Riesgo de alucinacion: inherente a modelos de este tamano, agravado por la ausencia de evaluaciones de factualidad.
- Sesgos: no se han publicado analisis de sesgos; al derivar de un modelo base sin documentacion detallada, se desconocen los sesgos heredados.
- Metodo no publicado: la tecnica de seleccion ("Integer Space Artificial Selection") esta pendiente de publicacion, por lo que la reproducibilidad es nula por ahora.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base CherryPit 1.2 debe verificarse por separado para confirmar compatibilidad de licencias en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MisasAI/Vulcan-1-small-GGUF
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Seccion de analisis de Q4_K_M en la model card: https://huggingface.co/MisasAI/Vulcan-1-small-GGUF#analysis
- Repositorio de imatrix incluido en el repo: https://huggingface.co/MisasAI/Vulcan-1-small-GGUF/tree/main/imatrix
- Publicacion del metodo (pendiente, sin URL disponible)
- Benchmarks de codigo (pendientes, sin URL disponible)
- Sitio de resultados por problema (en construccion, sin URL disponible)
