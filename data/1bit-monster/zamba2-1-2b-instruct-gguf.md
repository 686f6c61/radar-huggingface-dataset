# 1bit-MONSTER/Zamba2-1.2B-instruct-GGUF

## Resumen

Zamba2-1.2B-instruct-GGUF es una conversión al formato GGUF del modelo Zyphra/Zamba2-1.2B-instruct, publicada por el usuario 1bit-MONSTER. El modelo original, desarrollado por Zyphra, es un transformer híbrido que combina capas de atención con capas de espacio de estados (SSM) del tipo Mamba2, una arquitectura pensada para reducir el coste computacional del contexto largo frente a los transformers puros. Esta ficha se centra en la distribución GGUF del checkpoint instruct, que conserva la licencia Apache 2.0 del modelo base.

La relevancia de esta publicación es doble. Por un lado, facilita el despliegue del modelo en motores compatibles con GGUF, como llama.cpp o el motor propietario del autor (1bit engine). Por otro, documenta una corrección en el kernel Vulkan `SSM_SCAN` para `d_state = 64`, que según el autor multiplicaba por más de diez la velocidad de decodificación en toda la familia Zamba2 (de 4,3 a 45 tok/s en el 2.7B y de 2,1 a 17 tok/s en el 7B, misma máquina).

El checkpoint contiene 1.727.324.800 parámetros reales según los safetensors del modelo base y el repositorio ocupa 1,8 GB, coherente con una única cuantización Q8_0. No se especifican en la información disponible la longitud de contexto, los idiomas soportados ni resultados de benchmarks propios de esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Mamba2 (SSM) y atención |
| Parámetros totales | 1.727.324.800 (1,73 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (única incluida en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Zamba2-1.2B-instruct-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base Zamba2-1.2B-instruct emplea una arquitectura híbrida que intercala bloques de atención con bloques Mamba2 (SSM). Este diseño busca mantener la calidad de modelado de los transformers reduciendo el coste de atención cuadrático en contextos largos, ya que las capas SSM tienen coste lineal respecto a la longitud de secuencia. La información disponible no detalla la proporción exacta de capas de atención frente a capas Mamba2 ni la dimensión de estado (`d_state`), más allá de la referencia al valor 64 en el contexto del kernel Vulkan.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado para la variante instruct. La model card de esta conversión se limita a documentar el proceso de cuantización, la procedencia del soporte de arquitectura (portado desde el PR `ggml-org#21412` de llama.cpp) y la corrección del kernel Vulkan mencionada en el resumen.

## Capacidades

- Generación de texto conversacional en modo instruct, heredada del checkpoint Zyphra/Zamba2-1.2B-instruct.
- Procesamiento de secuencias largas con coste lineal en las capas SSM, aunque la longitud máxima efectiva no está documentada en esta ficha.
- Ejecución en motores GGUF: llama.cpp (con soporte de Zamba2 portado desde upstream) y el motor 1bit (`1bit serve`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y modos de razonamiento extendido: no documentados para esta conversión.

## Casos de uso

- Despliegue en hardware de gama consumer con Vulkan: la corrección del kernel `SSM_SCAN` para `d_state = 64` permite obtener 83,4 tok/s de generación en un Strix Halo con Q8_0, lo que hace viable un asistente conversacional local en equipos con GPU integrada potente.
- Prototipado de arquitecturas híbridas SSM/atención: investigadores que quieran comparar el comportamiento de un modelo Mamba2 híbrido frente a transformers puros pueden usar este GGUF con llama.cpp sin necesidad de infraestructura dedicada.
- Evaluación de motores GGUF alternativos: el repositorio sirve como caso de prueba para validar el soporte de Zamba2 en llama.cpp y en el motor 1bit, incluyendo la ruta `--device hrx`.
- Chat local con requisitos de memoria moderados: con 1,8 GB de pesos en Q8_0, el modelo cabe en GPUs de 4 GB o menos y en sistemas con memoria unificada, adecuado para asistentes embebidos o de escritorio.
- Generación de texto en pipelines por lotes: los 3.302 tok/s de prefill (pp512) medidos en Strix Halo permiten procesar prompts largos con rapidez en tareas de resumen o clasificación por lotes.
- Base para fine-tuning o destilación: al estar bajo Apache 2.0 y con pesos abiertos, puede servir como punto de partida para ajustes posteriores, aunque la conversión GGUF no es el formato idóneo para entrenamiento y habría que partir del checkpoint original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son mediciones de rendimiento de inferencia del propio autor:

| Métrica | Valor | Contexto |
|---|---|---|
| pp512 (prefill) | 3.302 tok/s | Strix Halo, Vulkan, Q8_0 (medido en 2026-09) |
| tg128 (generación) | 83,4 tok/s | Strix Halo, Vulkan, Q8_0 (medido en 2026-09) |
| tg en Zamba2-2.7B, antes/después del fix | 4,3 → 45 tok/s | Misma máquina, Vulkan |
| tg en Zamba2-7B, antes/después del fix | 2,1 → 17 tok/s | Misma máquina, Vulkan |

El autor advierte que estas cifras se midieron con el backend Vulkan del motor, que ha sido eliminado; la ruta actual es HRX GPU y las mediciones están pendientes de repetirse.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9-2,2 GB para el archivo Q8_0 (1,8 GB de pesos) más overhead de contexto y caché KV/SSM.
- Cabe en GPUs consumer de gama baja (4 GB o más), en iGPUs con memoria unificada y en CPUs mediante llama.cpp.
- GPU recomendadas: cualquier GPU con soporte Vulkan para la ruta antigua; para la ruta HRX se requiere hardware compatible con el motor 1bit. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Opciones de despliegue: llama.cpp (soporte Zamba2 desde `ggml-org#21412`), motor 1bit (`1bit serve -m ... --device hrx`). No se confirma soporte en vLLM, TGI u Ollama.
- Rendimiento medido: 3.302 tok/s de prefill y 83,4 tok/s de decodificación en Strix Halo con Vulkan y Q8_0 (cifras de 2026-09, pendientes de re-medición en HRX).

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Zamba2-1.2B-instruct (este GGUF) | 1,73 B | Híbrido Mamba2/atención | No disponible | Apache 2.0 | GGUF Q8_0 |
| Zamba2-2.7B-instruct | 2,7 B (según model card del autor) | Híbrido Mamba2/atención | No disponible | Apache 2.0 (modelo base Zyphra) | Safetensors / GGUF |
| Zamba2-7B-instruct | 7 B (según model card del autor) | Híbrido Mamba2/atención | No disponible | Apache 2.0 (modelo base Zyphra) | Safetensors / GGUF |

La comparación se limita a la propia familia Zamba2 porque la información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de otros fabricantes. No se dispone de cifras de calidad que permitan una comparación objetiva con transformers de tamaño similar.

## Limitaciones y advertencias

- Solo se distribuye la cuantización Q8_0; no hay variantes Q4, Q5 ni GGUF de menor precisión en este repositorio, lo que limita el ahorro de memoria.
- Las mediciones de rendimiento publicadas corresponden a un backend Vulkan ya retirado; las cifras en la ruta HRX actual no están verificadas.
- La longitud de contexto efectiva no está documentada, lo que impide planificar despliegues con prompts largos sin pruebas previas.
- No hay información sobre idiomas soportados ni sobre calidad en castellano; el uso en producción multilingüe requiere evaluación propia.
- Riesgo de alucinación inherente a un modelo de 1,73 B parámetros; no se han publicado evaluaciones de fidelidad.
- No se documentan sesgos conocidos ni filtros de seguridad aplicados en el ajuste instruct.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Zyphra/Zamba2-1.2B-instruct y de cualquier componente de terceros citado (soporte de llama.cpp).
- El repositorio tiene un uso muy bajo (52 descargas, 1 like), por lo que no existe validación comunitaria amplia del archivo.
- El soporte de Zamba2 en llama.cpp depende del PR `ggml-org#21412`; versiones anteriores del motor no cargarán el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Zamba2-1.2B-instruct-GGUF
- Modelo base: https://huggingface.co/Zyphra/Zamba2-1.2B-instruct
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
- PR de soporte Zamba2 en llama.cpp: `ggml-org#21412` (referenciado en la model card; sin URL directa en la información disponible)
