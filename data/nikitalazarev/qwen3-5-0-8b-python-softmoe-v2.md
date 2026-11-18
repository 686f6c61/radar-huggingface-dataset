# NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE-v2

## Resumen

Qwen3.5-0.8B-Python-SoftMoE-v2 es un "experto de dominio" derivado del modelo denso Qwen/Qwen3.5-0.8B mediante una tecnica de manipulacion del espacio de pesos (weight-space steering) sin ningun tipo de entrenamiento por gradiente. Lo publica el usuario NikitaLazarev dentro del ecosistema de Ivanna Lab, un laboratorio de modelos autoalojado. El objetivo es especializar el modelo base en el dominio "lenguaje Python y PEPs" aplicando un parche de rango uno sobre las matrices de salida de una seleccion de capas, de modo que el modelo responda con mayor adherencia estilistica y terminologica a contenido propio de la documentacion oficial de Python.

La relevancia de esta ficha no reside en el rendimiento bruto, sino en el metodo: demuestra una via para crear "expertos" de dominio sobre un modelo denso sin reentrenar, mediante la extraccion de una direccion de dominio a partir de un escaneo de activaciones y su inyeccion en los pesos. Esto es interesante para investigadores que quieran componer variantes especializadas de un mismo modelo base (un enfoque de "soft MoE" en el que un router en espacio de embeddings selecciona la variante adecuada segun la consulta) sin multiplicar el coste de entrenamiento.

El modelo tiene 873.438.784 parametros reales segun los pesos en safetensors, un repositorio de 1,8 GB y se distribuye en formato transformers/safetensors. La model card esta redactada en ingles y ruso; no se declaran idiomas soportados ni licencia. Las mejoras medidas en benchmarks son marginales y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), con parche de steering de rango uno sobre matrices de salida; pipeline image-text-to-text |
| Parametros totales | 873.438.784 |
| Parametros activos | no aplica (modelo denso; el termino "soft MoE" se refiere a la composicion de variantes, no a una arquitectura MoE real) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 873 millones de parametros con capacidad multimodal (pipeline image-text-to-text). Sobre esa base no se realiza ningun ajuste fino supervisado ni RLHF/DPO: el autor aplica weight-space steering, inspirado en el trabajo Weight-Space Programming (Takeyama et al., MIT CSAIL, 2026). El procedimiento consiste en un escaneo de activaciones que calcula la diferencia media de hidden states entre prompts del dominio (documentacion oficial de Python en EPUB y PEPs, 30 fragmentos muestreados del corpus RAG de la plataforma) y prompts de contraste; de ahi se extrae una direccion de dominio d̂ que se amplifica e inyecta mediante un parche de rango uno sobre las matrices down_proj, o_proj y out_proj de las capas [15, 16, 17, 18, 20, 21, 22, 23], con alpha = 0.1 y posicion "last". El escaneo reporta una AUC de 1.0 (PASS) en la separacion dominio/contraste.

La innovacion tecnica es la operacion inversa a la ablacion de comportamientos: en lugar de eliminar una direccion no deseada, se amplifica una direccion de dominio y se hornea en los pesos, lo que permite desplegar el comportamiento sin hooks de inferencia en tiempo de ejecucion. El autor menciona un router en espacio de embeddings con margen por coseno que selecciona esta variante frente al modelo base cuando la consulta encaja con el tema. No se documentan tokens de entrenamiento, composicion del dataset ni procesos de alineacion, porque no hay entrenamiento en el sentido convencional.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen3.5-0.8B.
- Entrada multimodal imagen-texto segun el pipeline declarado (image-text-to-text), aunque no se detallan capacidades de vision especificas.
- Especializacion estilistica y terminologica en documentacion de Python y PEPs, orientada a la generacion de texto a partir de codigo (code2text).
- Conservacion de las capacidades de codigo general del modelo base: HumanEval identico al base (0.2256) segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card solo esta en ingles y ruso, sin declarar idiomas del modelo.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Generacion de documentacion a partir de codigo Python: el parche de steering sobre las capas 15-23 esta orientado a mejorar la adherencia al estilo de la documentacion oficial y las PEPs, por lo que encaja en tareas de code2text y resumen de modulos.
- Asistente de consultas sobre PEPs: con el router en espacio de embeddings, se puede enrutar preguntas sobre propuestas de mejora de Python a esta variante en lugar del modelo base, manteniendo el resto del trafico en el base.
- Investigacion en weight-space steering: sirve como caso reproducible para estudiar como un parche de rango uno con alpha = 0.1 afecta a la salida de un modelo denso pequeno, comparando contra el base con el mismo harness (lm-eval-harness).
- Prototipado de "soft MoE" por enrutamiento: permite construir un conjunto de variantes especializadas del mismo modelo base y seleccionarlas por similitud de embeddings, sin coste de entrenamiento adicional.
- Entornos con restricciones de inferencia: al estar el comportamiento horneado en los pesos, puede desplegarse en infraestructuras donde no se pueden instalar hooks de inferencia o modificar el grafo de ejecucion.
- Experimentacion educativa de bajo coste: con 873 millones de parametros y 1,8 GB de pesos, es viable ejecutarlo en hardware modesto para demostrar tecnicas de edicion de pesos en cursos o talleres.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (tarea code2text_python de CodeXGLUE, BLEU-4 suavizado, 150 muestras, decodificacion greedy, medido con lm-eval-harness en Ivanna Lab):

| Build | BLEU-4 |
|---|---|
| Este modelo (prompts muestreados del RAG, alpha=0.1, posicion last) | 1.0534 |
| alpha=0.1, prompts de weight_lab, posicion last | 1.0525 |
| Base sin modificar (Qwen3.5-0.8B) | 1.0519 |
| alpha=0.1, prompts RAG, posicion mean | 1.0436 |
| alpha=0.2, prompts de weight_lab, posicion last | 1.0289 |
| alpha=0.2, prompts de weight_lab, posicion mean | 1.0167 |

HumanEval (164 problemas, conjunto completo): identico entre base y experto, 0.2256. El autor senala que las diferencias en benchmarks estandar son pequenas y que la direccion de documentacion se mide mejor con benchmarks nativos del dominio. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en precision original (fp16/bf16 segun pesos safetensors); en cuantizacion de 8 bits rondaria 1 GB y en 4 bits unos 0,5-0,6 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para el modelo en fp16; para mayor throughput, A100 o H100 no son necesarias dado el tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas, e incluso en CPU con llama.cpp si se generan pesos GGUF (no disponibles en el repo).
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp y Ollama no estan confirmados para esta variante, ya que el repo solo incluye safetensors. El autor lo prueba en Ivanna Lab.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Python-SoftMoE-v2 (este) | 873 M | no disponible | BLEU-4 1.0534 en code2text_python | no disponible | Hugging Face, safetensors |
| Qwen/Qwen3.5-0.8B (base) | ~873 M | no disponible | BLEU-4 1.0519; HumanEval 0.2256 | no disponible | Hugging Face |
| Variante alpha=0.2 del mismo autor | ~873 M | no disponible | BLEU-4 1.0289 | no disponible | Hugging Face (misma familia) |

No se dispone de datos de otros modelos de la misma categoria (expertos de dominio por edicion de pesos) en la informacion proporcionada para una comparacion adicional.

## Limitaciones y advertencias

- Las mejoras en benchmarks son marginales: la diferencia frente al modelo base es de 0.0015 en BLEU-4, dentro de un rango que podria no ser estadisticamente significativo con solo 150 muestras.
- El propio autor reconoce que las deltas en benchmarks estandar son pequenas y que la direccion de documentacion se mide mejor con benchmarks nativos del dominio; no hay evidencia publica de mejora en tareas reales fuera de ese harness.
- Riesgo de alucinacion: inherente a un modelo de 873 millones de parametros; el steering no corrige la tendencia a inventar contenido, solo modula el estilo.
- Sesgos conocidos: no documentados; el modelo hereda los sesgos del base Qwen3.5-0.8B, no evaluados en esta variante.
- Limitaciones de contexto e idioma: no se declaran ni la longitud de contexto ni los idiomas soportados; la model card solo esta en ingles y ruso.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse la licencia del modelo base Qwen3.5-0.8B antes de cualquier despliegue en produccion.
- El termino "soft MoE" es una denominacion del autor y no implica una arquitectura MoE real; el modelo es denso y el enrutamiento se hace externamente por embeddings.
- Solo se distribuyen pesos safetensors; no hay variantes cuantizadas oficiales, lo que limita el despliegue en llama.cpp u Ollama sin conversion manual.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ivanna Lab (repositorio): https://github.com/wiskeone/ivanna-lab
- Referencia del metodo: Weight-Space Programming (Takeyama et al., MIT CSAIL, 2026), citado en la model card sin enlace directo disponible.
