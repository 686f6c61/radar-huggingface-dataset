# mvbalaji/ODYSSEY-100M-5B-BASE

## Resumen

ODYSSEY-100M-5B-BASE es un modelo de lenguaje causal de tipo decoder-only con 100.248.960 parametros, desarrollado por el proyecto ODYSSEY (autor del repositorio: Balaji Venkateswaran, sin afiliacion organizativa registrada). Se trata de un modelo base entrenado desde cero sobre 5.000.003.584 tokens de texto educativo en ingles, matematicas y codigo fuente con licencias permisivas. No ha recibido ajuste por instrucciones, RLHF ni entrenamiento de seguridad, por lo que su funcion es exclusivamente la prediccion del siguiente token.

El modelo emplea una arquitectura transformer convencional con 15 capas, atencion de consultas agrupadas (GQA) con 10 cabezas de consulta y 2 de clave-valor, SwiGLU en la FFN, RoPE y RMSNorm previo. Su ventana de contexto es de 1.024 tokens y el vocabulario del tokenizador BPE byte-level asciende a 32.768 entradas. El entrenamiento se realizo en una unica GPU NVIDIA H100 de 80 GB, con un coste computacional de 3,30 x 10^18 FLOPs y un tiempo de reloj de aproximadamente 3,1 horas.

Su relevancia actual reside en el caracter reproducible y auditado del proceso: protocolos pre-registrados, codigo de evaluacion congelado por hash, verificacion independiente de los pesos exportados y documentacion detallada del recetario de optimizacion (Muon para matrices ocultas, AdamW para embeddings y normas). Es un caso de estudio util para investigadores interesados en el entrenamiento de modelos pequenos desde cero con trazabilidad completa, mas que un modelo destinado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con GQA, SwiGLU, RoPE y RMSNorm |
| Parametros totales | 100.248.960 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles; matematicas (LaTeX y prosa); codigo fuente (Java, C, JavaScript, C++, Python, PHP, Go, C#, Ruby, TypeScript y otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 15 capas con dimension oculta de 640 y FFN SwiGLU de 2.240 unidades intermedias. La atencion usa GQA con 10 cabezas de consulta, 2 cabezas de clave-valor y dimension de cabeza 64, implementada con SDPA y enmascaramiento causal. Las posiciones se codifican con RoPE (theta = 10.000) y la normalizacion emplea RMSNorm previo (epsilon = 1e-5) mas una RMSNorm final. Los embeddings de entrada y salida estan atados (matriz de 32.768 x 640), se cuentan una sola vez y no hay sesgos ni dropout. El desglose de parametros es: embedding 20.971.520 + 15 x (atencion 983.040 + SwiGLU 4.300.800) + RMSNorm 19.840.

El entrenamiento cubre 5.000.003.584 tokens en 38.147 pasos de 131.072 tokens, con cada token visto una sola vez en un orden fijo. La mezcla de datos es 65 % texto general (FineWeb-Edu sample-10BT), 20 % matematicas (FineMath finemath-4plus) y 15 % codigo (codeparrot/github-code-clean, solo licencias MIT, Apache-2.0, BSD-2/3, ISC, CC0 y Unlicense). El preprocesado incluye filtros de calidad, deduplicacion exacta y MinHash, auditoria de casi-duplicados entre dominios, limpieza de PII y secretos, y un cribado de descontaminacion de 13-gramas contra HellaSwag, PIQA, ARC, GSM8K, MATH500, AIME25, HumanEval, MBPP e IFEval. La optimizacion combina Muon (lr 0.01, momentum 0.95 Nesterov, 5 pasos Newton-Schulz, weight decay 0.1) para las 75 matrices ocultas y AdamW (lr 0.001, beta 0.9/0.95, epsilon 1e-8, sin weight decay) para el embedding atado y las 31 ganancias RMSNorm, con calentamiento lineal del 3 % y decaimiento coseno hasta 0.1x. El entrenamiento se ejecuto en una H100 80GB con bf16 autocast y pesos maestros en fp32, a unos 485.000 tokens/s de mediana y 31 GB de pico de memoria.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de documentos, parrafos y respuestas cortas a partir de un prefijo.
- Modelado de lenguaje y calculo de perplejidad o NLL por dominio (general, matematicas, codigo) para evaluacion y filtrado de corpus.
- Generacion y completado de codigo en lenguajes como Java, C, JavaScript, C++, Python, PHP, Go, C#, Ruby y TypeScript, con la salvedad de que los prompts deben terminar en `:` o `{` y no en un salto de linea suelto.
- Razonamiento matematico basico y generacion de expresiones en LaTeX o prosa matematica, fruto del 20 % de datos de FineMath.
- No dispone de soporte nativo de tool calling ni de function calling: es un modelo base sin ajuste por instrucciones.
- No dispone de soporte de agentes ni de razonamiento multi-paso orquestado; cualquier flujo agentico requeriria capas externas de prompting y control.
- Capacidad multilingue limitada al codigo fuente; el texto natural esta entrenado unicamente en ingles.
- No tiene modo thinking, vision, audio ni ninguna modalidad adicional.

## Casos de uso

- Investigacion sobre entrenamiento desde cero: reproduccion y analisis del recetario Muon + AdamW, la seleccion de learning rate por piloto pre-registrado y la curva de perdida por dominio, usando los informes y el codigo de evaluacion congelado que acompanan al modelo.
- Generacion de codigo asistida en entornos controlados: el modelo puede completar funciones en Python, Java o C a partir de un prefijo bien delimitado; es adecuado para prototipos y para estudiar el comportamiento de modelos pequenos en tareas de code completion, no para produccion critica.
- Filtrado y puntuacion de corpus: calcular NLL por documento con ventanas de 1.024 tokens y stride 1.024 para seleccionar datos de alta calidad en pipelines de curacion de datasets, replicando la metodologia del autor.
- Generacion de problemas y soluciones matematicas elementales: util como generador de borradores en ingles para conjuntos de entrenamiento sinteticos o para aumentar datos de dominios matematicos, dado el 20 % de FineMath en la mezcla.
- Educacion y demostraciones docentes: ejemplo didactico de un transformer completo con GQA, RoPE y SwiGLU en apenas 100 M de parametros, apto para explicar cada componente sin la complejidad de modelos mayores.
- Experimentos de destilacion y ajuste fino: al ser un modelo base pequeno y con licencia Apache 2.0, sirve como inicializacion para fine-tuning supervisado en tareas concretas (clasificacion, extraccion, resumen corto) con requisitos de hardware minimos.
- Evaluacion de tecnicas de tokenizacion: el tokenizador `odyssey-32k` y su comportamiento con saltos de linea e indentacion permiten estudiar el impacto del preprocesado en la calidad de la generacion de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona resultados de modelado de lenguaje (NLL y perplejidad) en una seccion titulada "Sealed final confirmation", pero el contenido de esa seccion no aparece en los datos proporcionados. No se deben inferir cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 o fp16, aproximadamente 0,2 GB (100 M de parametros x 2 bytes); en fp32, unos 0,4 GB. El repo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB, RTX 4060, RTX 4090 o incluso una GPU integrada con suficiente memoria unificada pueden ejecutarlo. Para entrenamiento o fine-tuning, una H100 80GB fue suficiente para el preentrenamiento completo a 485.000 tokens/s.
- Cabe holgadamente en GPU consumer: si, en practicamente cualquier GPU con mas de 1 GB de VRAM, y tambien en CPU.
- Opciones de despliegue: PyTorch nativo (el repositorio solo distribuye safetensors), y conversion manual a GGUF para llama.cpp u Ollama si se desea. No se documentan integraciones con vLLM ni TGI, aunque al ser un transformer estandar podrian adaptarse.
- Latencia y throughput: no se publican mediciones de inferencia. El autor solo reporta throughput de entrenamiento (mediana de unos 485.000 tokens/s en una H100) y un pico de memoria de 31 GB durante el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| ODYSSEY-100M-5B-BASE | 100,2 M | 1.024 | Apache 2.0 | Ingles, matematicas y codigo | Base, entrenado desde cero sobre 5B tokens |
| GPT-2 small (referencia historica) | 124 M | 1.024 | MIT (pesos publicados por OpenAI) | Ingles | Base, ~40 GB de texto de WebText; sin datos de benchmarks comparables en esta ficha |
| Pythia-160M | 162 M | 2.048 | Apache 2.0 | Ingles | Base, 300B tokens de The Pile; suite de checkpoints intermedios |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Ingles | Base e instruct, entrenado sobre datos curados; contexto mayor |

La comparacion se limita a parametros, contexto y licencia porque no hay resultados de benchmarks publicados para ODYSSEY-100M-5B-BASE en la informacion disponible. Frente a GPT-2 small y Pythia-160M, ODYSSEY ofrece un contexto menor (1.024 frente a 2.048 en Pythia) y un volumen de entrenamiento muy inferior (5B frente a 300B tokens de Pythia), por lo que no es esperable que iguale su rendimiento en tareas estandar. Su ventaja diferencial es la trazabilidad metodologica y el bajo coste de reproduccion.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue ordenes, no responde a formatos de chat y puede generar continuaciones incoherentes o repetitivas si se le presenta una pregunta directa.
- Riesgo elevado de alucinacion: al no haber pasado por RLHF ni por entrenamiento de seguridad, no hay mecanismo que penalice afirmaciones falsas.
- Ventana de contexto muy corta (1.024 tokens), insuficiente para documentos largos, conversaciones multi-turno extensas o bases de codigo de tamano medio.
- Entrenado unicamente en ingles para texto natural; el multilingue se limita al codigo fuente. El rendimiento en castellano sera previsiblemente pobre.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos. Los datos provienen de FineWeb-Edu, FineMath y GitHub, con los sesgos propios de esas fuentes (predominio de ingles, sesgo de estilo academico y de repositorios de codigo populares).
- La model card declara una desviacion respecto al plan registrado (Amendment B1): la etapa 2 continuo desde el checkpoint congelado de 2B en lugar de desde una variante entrenada localmente (A0-r1, +191 pasos). Aunque el autor afirma que la decision se fijo antes de conocer resultados, conviene tenerlo en cuenta al interpretar la reproducibilidad.
- Se reporta un desajuste puntual no explicado en la verificacion de exportacion a GPU en el momento del congelado, que no volvio a ocurrir. La verificacion independiente posterior confirma igualdad bit a bit de los pesos y paridad de inferencia en CPU y GPU.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de ajuste y de garantias de calidad hace desaconsejable su uso en produccion sin fine-tuning y evaluacion previas.
- El tokenizador fusiona saltos de linea e indentacion en tokens unicos; los prompts que terminan en `\n` (por ejemplo tras `def f():`) degradan la completacion de codigo. Hay que terminar en `:` o `{`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvbalaji/ODYSSEY-100M-5B-BASE
- FineWeb-Edu (dataset): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- FineMath (dataset): https://huggingface.co/datasets/HuggingFaceTB/finemath
- codeparrot/github-code-clean (dataset): https://huggingface.co/datasets/codeparrot/github-code-clean
- Documentacion interna citada en la model card (no enlazada publicamente): `FINAL_5B_CHECKPOINT_AUDIT.md`, `CAPABILITY_SUITE_RESULTS.md`, `ODYSSEY_100M_COMPLETE_COMPUTE_AND_COST_REPORT.md`, `FINAL_5B_EXPORT_INDEPENDENT_VERIFICATION.md`, `order_v3.npz`
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
