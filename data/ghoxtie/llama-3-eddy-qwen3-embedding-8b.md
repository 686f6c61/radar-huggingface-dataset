# GhoXtie/Llama-3-EDDY-Qwen3-Embedding-8B

## Resumen

Llama-3-EDDY-Qwen3-Embedding-8B es un adaptador lineal de embeddings desarrollado por Cyril Tsui en el marco del proyecto independiente EDDY. Su funcion es mapear vectores de 4096 dimensiones generados por Qwen3-Embedding-8B al espacio de embeddings que utiliza el modelo de generacion de movimiento texto-a-movimiento ARDY de NVIDIA, sustituyendo en tiempo de inferencia al codificador LLM2Vec basado en Meta Llama 3.

El adaptador resuelve un problema de eficiencia en produccion: permite generar animaciones a partir de descripciones textuales sin necesidad de mantener cargado en la GPU local el codificador de texto de 8B parametros que ARDY usa por defecto. Los embeddings de Qwen pueden calcularse localmente o mediante una API externa, lo que reduce los requisitos de VRAM del pipeline completo.

El modelo es extremadamente compacto (16,8 millones de parametros entrenables, unos 67 MB en safetensors) y se distribuye con licencia Apache 2.0. No es un modelo de lenguaje ni un generador de movimiento por si mismo, sino una pieza de interoperabilidad entre dos espacios de embeddings. Su relevancia actual radica en la creciente separacion entre modelos de generacion y sus codificadores de condicionamiento, y en la posibilidad de desacoplar la computa de embeddings del hardware de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador lineal de embeddings (normalizacion L2 + transformacion lineal + estadisticas por dimension) |
| Parametros totales | 16,8 millones (entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del codificador Qwen3-Embedding-8B de entrada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | Ingles (entrenamiento y evaluacion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`eddy_qwen3-embedding-8b_4096.safetensors`, ~67 MB) |

## Arquitectura y entrenamiento

El adaptador es una transformacion lineal que opera sobre embeddings de 4096 dimensiones. El proceso es: normalizacion L2 de la entrada, aplicacion de una matriz de pesos aprendida W y un sesgo b, y posterior reescalado con la media y desviacion tipica por dimension del espacio objetivo (calculadas unicamente sobre el split de entrenamiento). La formula es `y = (W x_normalized + b) ⊙ σ + μ`. No incluye rama MLP.

El entrenamiento se realizo mediante regresion ridge con λ = 0.01 sobre 111.922 pares de embeddings alineados. Cada par contiene un vector de Qwen3-Embedding-8B (bf16, last-token pooling, sin prefijo de instruccion) y el vector LLM2Vec correspondiente al mismo texto. Las fuentes son: 44.512 pares de HumanML3D (captions y prompts estilo stream), 47.410 etiquetas de SEED-Timeline-Annotations y 20.000 uniones por plantilla de etiquetas de eventos SEED consecutivos. Los textos se dividen por grupo de movimiento o contenido, de modo que todos los captions de un mismo movimiento quedan en el mismo split, y los textos de test de benchmark se excluyen del entrenamiento. La seleccion del modelo se hizo sobre validacion de SEED.

## Capacidades

- Mapeo de embeddings de texto de 4096 dimensiones desde el espacio Qwen3-Embedding-8B al espacio LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised.
- Condicionamiento textual para el modelo de generacion de movimiento ARDY-SOMA-RP-30FPS-Horizon60.
- Integracion con `EddyTextEncoder`, que devuelve tensores `[B, 1, 4096]` con longitudes, cachea embeddings y devuelve ceros exactos para prompts vacios sin llamar al proveedor.
- Normalizacion de entrada y restauracion de la escala del vector objetivo de forma automatica.
- Compatibilidad con embeddings calculados localmente o via API (se probo OpenRouter).
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un adaptador de representaciones.

## Casos de uso

- Generacion de animaciones a partir de descripciones en ingles en pipelines de produccion: se sustituye el codificador LLM2Vec por Qwen3-Embedding-8B (local o API) y el adaptador traduce el vector, liberando VRAM en la GPU de inferencia de ARDY.
- Despliegue de ARDY en hardware con VRAM limitada: al no mantener el codificador de 8B en la GPU local, el pipeline completo cabe en GPUs de menor capacidad, delegando el calculo de embeddings a un servicio externo.
- Precalculo y cacheado de embeddings de guiones o descripciones de movimiento: `EddyTextEncoder` cachea embeddings, lo que permite reutilizar vectores para prompts repetidos en herramientas de autoria de animacion.
- Herramientas de prototipado con Gradio: el repositorio EDDY incluye una demo Gradio que permite probar la generacion de movimiento con descripciones en lenguaje natural sin infraestructura propia.
- Integracion en pipelines de investigacion sobre texto-a-movimiento: permite comparar el efecto del codificador de texto (LLM2Vec frente a Qwen3-Embedding) manteniendo fijo el generador ARDY.
- Servicios de generacion de movimiento como API: el calculo de embeddings puede externalizarse a un proveedor compatible con la API de embeddings, y el adaptador se ejecuta en CPU o GPU ligera junto al generador.
- Evaluacion de robustez de codificadores de texto: el adaptador sirve como herramienta para medir como afecta el cambio de codificador a la calidad del movimiento generado en tareas de benchmark como SEED.

## Benchmarks y rendimiento

La evaluacion se realizo generando movimiento con ARDY-SOMA-RP-30FPS-Horizon60 y puntuando con TMR-SOMA-RP-v1. La referencia es LLM2Vec en bf16 con las mismas semillas de generacion. Se reporta R@3 (mayor es mejor); la validacion muestra variacion sobre cinco semillas.

| Evaluacion | LLM2Vec | EDDY |
|---|---|---|
| 500 prompts de validacion SEED, Qwen local | 79,1 ± 2,1 | 78,1 ± 1,0 |
| Mismos prompts, Qwen via OpenRouter | 79,1 ± 2,1 | 77,2 ± (dato truncado en la model card) |

Notas de la model card: el adaptador publicado se evaluo en el benchmark timeline multi; las puntuaciones de overview y timeline-single corresponden a un adaptador anterior. OpenRouter paso la comprobacion de validacion de movimiento pero puntuo por debajo de LLM2Vec en las cinco semillas. No se han publicado resultados para otros checkpoints de ARDY, otros idiomas ni otros modelos de embeddings.

## Requisitos de hardware

- El adaptador en si ocupa unos 67 MB en safetensors y puede ejecutarse en CPU (`load_adapter(path, device="cpu")` en el ejemplo oficial).
- VRAM para el generador ARDY: no disponible en la informacion proporcionada.
- VRAM para el codificador Qwen3-Embedding-8B: no disponible en la informacion proporcionada, pero al poder ejecutarse en local o via API, el adaptador permite no reservar VRAM para el en la GPU de inferencia de ARDY.
- GPU recomendadas: no disponible. El adaptador no impone requisitos de GPU propios.
- Cabe en cualquier GPU consumer para el adaptador; el cuello de botella es el generador ARDY y, opcionalmente, el codificador Qwen.
- Opciones de despliegue: codigo de inferencia EDDY (`eddy_encoder.py`), integracion con ARDY, demo Gradio en el repositorio EDDY. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible adaptadores comparables publicados que mapeen Qwen3-Embedding-8B al espacio LLM2Vec para ARDY. La comparacion relevante es frente al codificador original que sustituye.

| Criterio | EDDY (este adaptador) | LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised |
|---|---|---|
| Tipo | Adaptador lineal de embeddings | Codificador de texto completo |
| Parametros | 16,8 millones | No disponible en la informacion proporcionada (modelo base Llama 3 8B) |
| Dimension de salida | 4096 | 4096 |
| Licencia | Apache 2.0 | No disponible en la informacion proporcionada |
| Requiere GPU para embeddings | No (CPU o API) | Si, para inferencia local |
| R@3 en validacion SEED (Qwen local) | 78,1 ± 1,0 | 79,1 ± 2,1 |

## Limitaciones y advertencias

- Solo se ha evaluado con descripciones de movimiento en ingles y en tercera persona (por ejemplo, "A person walks forward and waves").
- Los prompts con multiples eventos muestran la mayor perdida en benchmark; las senas a nivel de dedos presentan algunos de los mayores errores de vector.
- Los resultados con OpenRouter quedan por debajo de LLM2Vec en las cinco semillas, aunque superan la validacion de movimiento. No se han evaluado otros proveedores.
- No se han evaluado otros checkpoints de ARDY, otros idiomas ni otros modelos de embeddings.
- No se ha medido el efecto de imperativos, descripciones en primera o segunda persona, palabras sueltas, negacion ni duraciones en el prompt.
- La identidad del modelo de embeddings de entrada es responsabilidad del llamador; `EddyTextEncoder` solo verifica el tamano del vector (4096).
- El adaptador no incluye los pesos de Qwen ni de LLM2Vec; requiere descargarlos por separado.
- Los textos y embeddings de entrenamiento no se distribuyen con el adaptador.
- Proyecto independiente: no esta hecho ni respaldado por NVIDIA ni por Meta, pese a la referencia a Llama 3 en el nombre.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero un mapeo impreciso puede producir movimientos incoherentes con la descripcion.
- No se documentan sesgos especificos mas alla de la cobertura limitada a ingles y a descripciones en tercera persona.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhoXtie/Llama-3-EDDY-Qwen3-Embedding-8B
- Repositorio EDDY en GitHub: https://github.com/Xyri1/EDDY
- Demo Gradio de EDDY: https://github.com/Xyri1/EDDY/tree/main/demo
- Informe tecnico de EDDY: https://github.com/Xyri1/EDDY/blob/main/docs/report.md
- Modelo en ModelScope: https://modelscope.cn/models/CyrilTsui/Llama-3-EDDY-Qwen3-Embedding-8B
- ARDY (NVIDIA): https://github.com/nv-tlabs/ardy
- Qwen3-Embedding-8B: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised
