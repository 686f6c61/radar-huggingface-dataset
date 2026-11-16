# Karasumikura/Ying-K1.7-Lite-200M-base

## Resumen

Ying K1.7 Lite 200M base es un modelo de lenguaje denso de 210,2 millones de parámetros entrenado desde cero por el autor independiente Karasumikura, orientado principalmente al chino con soporte secundario de inglés. Se trata de la segunda iteración de la familia Ying K1, con una arquitectura propia denominada MM200 y un entrenamiento de 24,07 mil millones de tokens, un 61 % más que su predecesor Ying K1 Lite 200M. La ventana de contexto de entrenamiento es de 8.192 tokens con atención de ventana deslizante de 1.024.

La relevancia de este modelo reside en su naturaleza completamente abierta y reproducible: pesos en safetensors, licencia Apache 2.0, adaptador para `transformers` (`AutoModel` y `AutoTokenizer` funcionales) y un runtime de inferencia propio con soporte de KV cache, decodificación en streaming y CUDA Graph incluido en el repositorio. Frente a K1, corrige deficiencias de interfaz (carga estándar, `generate()` nativo) y añade una segunda fase de preentrenamiento que mejora la perplejidad en inglés aunque la empeora en código y matemáticas.

Es importante subrayar que este repositorio contiene únicamente los pesos base: no existe ninguna versión con ajuste supervisado (SFT) ni instrucciones para K1.7. El modelo puede continuar texto, pero no sigue instrucciones ni mantiene diálogos; el autor advierte explícitamente que el modelo `Ying-K1-Lite-0.2B` pertenece a la generación anterior y no debe usarse como versión post-entrenada de K1.7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso MM200 (16 capas, hidden 768, GQA 3:1, gated attention + QK-norm) |
| Parametros totales | 210.210.560 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens de entrenamiento (ventana deslizante de 1.024) |
| Tipos de cuantizacion | no disponible (entrenado y exportado en bfloat16; fp16 también válido) |
| Idiomas soportados | chino (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (195 tensores, 420,4 MB) |

## Arquitectura y entrenamiento

El modelo emplea un transformer denso de 16 capas con dimensión oculta de 768, 12 cabezas de consulta y 4 cabezas KV (GQA con ratio 3:1), dimensión de cabeza 64 y vocabulario de 16.006 tokens. Incorpora gated attention, normalización QK y una normalización RowNorm centrada en cero que se materializa como `weight` estándar durante la exportación. La atención usa ventana deslizante de 1.024 tokens sobre un contexto de entrenamiento de 8.192.

El entrenamiento se realizó en dos fases sobre hardware MUSA (8× MTT S4000): una primera fase de 90.000 pasos con 14,92 mil millones de tokens y una segunda de continuación de 1.205 pasos con 9,14 mil millones de tokens adicionales, sumando 24,07 mil millones. Los datos son mayoritariamente chinos (Ultra-FineWeb-zh entre otras fuentes). La continuación modificó efectivamente los pesos: la comparación tensor a tensor con el checkpoint `base_step90000` muestra una diferencia máxima de 0,70 en `blocks.0.attn.gate_proj`. No se ha aplicado RLHF, DPO ni SFT. La exportación elimina la cabeza MTP y materializa RowNorm.

## Capacidades

- Generación de texto y continuación de secuencias en chino e inglés.
- Modelado de lenguaje base: no sigue instrucciones ni mantiene formato conversacional sin un SFT previo.
- Razonamiento incipiente: en pruebas de continuación muestra coherencia sintáctica limitada, sin capacidad demostrada de razonamiento multi-paso.
- Generación de código y matemáticas: capacidad presente pero degradada respecto a K1 (perplejidad +6,1 % en código y +5,3 % en matemáticas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: chino e inglés únicamente.
- Capacidades especiales: runtime propio con KV cache, decodificación en streaming, decodificación por grafos (CUDA Graph) y tokens especiales de chat preverificados (`<|im_end|>`=15932, `<|user|>`=16001, `<|assistant|>`=16002, todos de un solo token) para uso tras SFT.

## Casos de uso

- Investigación en preentrenamiento desde cero: el modelo sirve como banco de pruebas reproducible de arquitecturas propias (MM200) con pesos, código de entrenamiento e inferencia disponibles, útil para estudiar el efecto de la continuación de preentrenamiento sobre dominios específicos.
- Base para ajuste supervisado propio: al ser un modelo base con licencia Apache 2.0 y tokenizador de chat ya definido, un equipo puede aplicar su propio SFT sobre el formato `<|user|>...<|assistant|>...<|im_end|>` y obtener un asistente ligero en chino.
- Generación de texto en chino en entornos con recursos muy limitados: con 210 M de parámetros y 420 MB en bfloat16, cabe en CPU y en GPUs de gama baja para tareas de continuación de texto, resumen extractivo o generación de titulares.
- Prototipado de pipelines de inferencia: el runtime incluido (`mm200_runtime.py`) con KV cache, streaming y CUDA Graph permite validar infraestructura de servicio (SSE, buffers, grafos) con un coste computacional mínimo antes de migrar a modelos mayores.
- Experimentación académica con decodificación especulativa y optimización de kernels: el autor documenta A/B tests de latencia (21,6 ms → 7,2 ms por token con CUDA Graph) y enfoques descartados, lo que lo convierte en un caso de estudio práctico de optimización de inferencia.
- Filtrado y clasificación de texto en chino: aunque la tarea declarada es `text-generation`, el modelo puede emplearse para puntuar perplejidad o detectar texto anómalo en corpus chinos, dado su bajo coste de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona métricas de perplejidad comparativas entre K1 y K1.7 sobre 8 segmentos por dominio, con inferencia en CPU bfloat16 y NLL por token:

| Dominio | K1 | K1.7 | Cambio | IC 95 % |
|---|---|---|---|---|
| Código | 1,4818 | 1,5722 | +6,1 % (peor) | ±0,076 (significativo) |
| Inglés | 1,8846 | 1,8352 | −2,6 % (mejor) | ±0,032 (significativo) |
| Matemáticas | 2,2728 | 2,3922 | +5,3 % (peor) | ±0,115 (marginal) |

También se documentan métricas de inferencia medidas sobre la arquitectura gemela Ying K1 (210,2 M) en una única T4, pendientes de reverificación en K1.7: latencia de decodificación de 7,2 ms/token tras optimización (frente a 21,6 ms sin ella), throughput de 139,2 tok/s por petición, TTFT de 1,05 s en servicio en streaming y tiempo de respuesta de 1,90 s para 256 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,42 GB en bfloat16 o fp16 para los pesos; el consumo real depende del tamaño del KV cache y del buffer de contexto (muy reducido por las 16 capas y 4 cabezas KV).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el autor reporta pruebas en NVIDIA T4. Funciona también en CPU en bfloat16.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` estándar con `trust_remote_code=True` (sin KV cache, más lento), runtime propio `mm200_runtime.py` con KV cache y streaming, y exportación a otros formatos no documentada (no hay GGUF ni integración con vLLM, llama.cpp, Ollama o TGI en la información disponible).
- Latencia y throughput estimados: 7,2 ms/token y 139,2 tok/s por petición en T4 con CUDA Graph (medido en la arquitectura K1, pendiente de reverificación en K1.7); 24,3 ms/token en modo eager para prompts que superan la ventana deslizante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ying K1.7 Lite 200M base | 210,2 M | 8.192 | Apache 2.0 | Hugging Face, pesos safetensors | Solo base, sin SFT; chino e inglés |
| Ying K1 Lite 200M | 210,2 M | 8.192 | Apache 2.0 | Hugging Face | Generación anterior; dispone de SFT en chino; sin `AutoModel` nativo |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Hugging Face | Modelo base más grande y con contexto mayor; familia consolidada |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | Hugging Face | Alternativa en inglés de tamaño similar; no orientada al chino |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no sigue órdenes, no mantiene diálogo y no debe usarse como asistente sin un SFT previo. El propio autor lo advierte de forma explícita.
- Riesgo elevado de alucinación y de continuaciones incoherentes: en las pruebas de continuación el modelo produce errores factuales y de razonamiento (por ejemplo, conclusión incorrecta en un silogismo sobre animales que no temen al agua).
- Regresión en código y matemáticas respecto a K1 (+6,1 % y +5,3 % de perplejidad), por lo que no es adecuado para tareas técnicas sin ajuste adicional.
- Cobertura lingüística limitada a chino e inglés; no se documenta rendimiento en otras lenguas.
- Contexto efectivo reducido por la ventana deslizante de 1.024 tokens pese al contexto de entrenamiento de 8.192.
- El formato de chat (`<|user|>`, `<|assistant|>`, `<|im_end|>`) no ha sido visto durante el preentrenamiento y solo tendrá efecto tras SFT.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base sin post-entrenamiento tiene utilidad comercial muy limitada.
- No hay versiones cuantizadas publicadas ni integración con motores de serving estándar; el despliegue requiere el runtime propio o `trust_remote_code`.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Karasumikura/Ying-K1.7-Lite-200M-base
- Modelo predecesor (K1 Lite 200M): https://huggingface.co/Karasumikura/Ying-K1-Lite-0.2B
- Repositorio de código, paper o demo adicional: no disponible en la información proporcionada.
