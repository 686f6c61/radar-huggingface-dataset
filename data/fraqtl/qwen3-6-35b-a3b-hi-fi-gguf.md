# fraQtl/Qwen3.6-35B-A3B-Hi-Fi-GGUF

## Resumen

Qwen3.6-35B-A3B-Hi-Fi-GGUF es una cuantización GGUF de tipo Q4_K_M del modelo Qwen/Qwen3.6-35B-A3B-Instruct, publicada por el usuario fraQtl. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales (aproximadamente 34,66 mil millones) y una arquitectura de 256 expertos enrutados, del que solo se activa una fracción por token (denominación A3B, en torno a 3 mil millones de parámetros activos). La cuantización está pensada para inferencia local en `llama.cpp` y entornos compatibles, sin necesidad de runtime parcheado.

El interés de esta ficha no reside en el modelo base, sino en el trabajo de cuantización: fraQtl aplica una política de protección por tensor (router, proyecciones de entrada de atención y FFN compartida en mayor precisión, expertos enrutados en Q4_K) y un presupuesto de calibración ajustado, manteniendo el mismo tamaño de fichero y el mismo kernel Q4_K_M estándar. El autor reporta mejoras medibles de fidelidad (KLD) frente a cuantizaciones públicas Q4_K_M e IQ4_XS del mismo modelo base, con un coste pequeño en algunas tareas de razonamiento.

La relevancia práctica es que permite ejecutar un MoE de ~35B en hardware de consumo (Apple Silicon de 24 GB en modo CPU, GPU de consumo con suficiente VRAM) con una calidad cercana a la cuantización Q4_K_M de referencia y sin dependencias especiales. La licencia es Apache-2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 256 expertos enrutados |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B por token (denominación A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (esta ficha); el autor referencia también una variante MTP-runtime separada |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con 256 expertos enrutados y aproximadamente 34,66 mil millones de parámetros totales, de los que se activan del orden de 3 mil millones por token. La model card de esta cuantización no detalla la composición del dataset de entrenamiento del modelo base, el número de tokens, ni si hubo fases de RLHF o DPO; esa información corresponde al modelo original Qwen/Qwen3.6-35B-A3B-Instruct y no está disponible en la información proporcionada.

La innovación técnica de esta publicación es el proceso de cuantización. Se aplica una política de protección por tensor que cuantiza a mayor precisión los tensores arquitectónicamente críticos (router, proyecciones de entrada de atención y FFN compartida) mientras mantiene los expertos enrutados en el suelo Q4_K, sin aumentar el tamaño total del fichero. Además, el presupuesto de calibración (imatrix) se fija en el óptimo medido para este modelo, usando un paquete de aproximadamente 414K tokens de código y matemáticas curado (soluciones trabajadas, varios lenguajes). El resultado es un GGUF Q4_K_M estándar, ejecutable con cualquier build de `llama.cpp` que soporte Q4_K_M, sin flags especiales. El autor menciona además una variante separada con runtime MTP orientada a decodificación especulativa en datacenter (aceleración de 1,49× en decodificación, solo en A100-80GB).

## Capacidades

- Generación de texto conversacional y de instrucciones, con plantilla de chat Qwen 3.6 (`<|im_start|>` / `<|im_end|>`).
- Modo de razonamiento encadenado mediante pre-relleno opcional de `<think>` (chain-of-thought).
- Razonamiento matemático: el autor reporta evaluaciones en GSM8K y MATH-500 sobre esta cuantización.
- Generación de código: el paquete de calibración y las evaluaciones KLD se centran en código y matemáticas; el ejemplo de quickstart es generación de una función Python.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Compatibilidad con el ecosistema `llama.cpp`: `llama-cli`, `llama-server` (API compatible con OpenAI), LM Studio, Ollama, llama-cpp-python, koboldcpp, Jan y Text Generation Web UI.
- Soporte de tool calling / function calling y de agentes multi-paso: no disponible en la información proporcionada para esta cuantización.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Asistencia de código en local: el modelo puede generar funciones y resolver tareas de programación (el quickstart muestra la generación de una función de Fibonacci en Python) ejecutándose íntegramente en una máquina de consumo con `llama.cpp`, sin enviar código a servicios externos.
- Razonamiento matemático con verificación: uso del pre-relleno `<think>` para forzar cadenas de razonamiento en problemas de tipo GSM8K o MATH-500, adecuado para prototipos de tutores o asistentes de estudio; el autor reporta 89,0% en GSM8K y 35,4% en MATH-500 sobre esta cuantización.
- API local compatible con OpenAI: despliegue con `llama-server -hf fraQtl/Qwen3.6-35B-A3B-Hi-Fi-GGUF:Q4_K_M` para integrar el modelo en herramientas que ya consumen la API de OpenAI sin cambiar el cliente.
- Experimentación en Apple Silicon: en un M4 con 24 GB de memoria unificada y modo CPU (`-ngl 0`) el modelo carga en unos 128 s y decodifica a ~4,9 tok/s, suficiente para pruebas interactivas y prototipado sin GPU dedicada.
- Evaluación de cuantizaciones: sirve como referencia para comparar fidelidad (KLD, perplejidad) frente a otras cuantizaciones Q4 del mismo modelo base en pipelines de evaluación reproducibles.
- Procesamiento de texto en inglés y chino: tareas de generación y conversación en esos dos idiomas, que son los únicos declarados en los metadatos.
- Investigación sobre MoE en hardware limitado: al activar solo ~3 B de parámetros por token, permite estudiar el comportamiento de un MoE de ~35 B en CPU o en GPU de consumo con VRAM ajustada.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización, medidos con el mismo harness de evaluación frente a dos cuantizaciones públicas Q4 del mismo modelo base. KLD es la divergencia simétrica top-20 frente al profesor Q8, restringida al soporte del Q8.

| Metrica | fraQtl Hi-Fi (esta build) | Q4_K_M publico | IQ4_XS publico |
|---|---:|---:|---:|
| KLD vs Q8, codigo/matematicas (menor es mejor) | 0,02074 | 0,02700 | 0,03556 |
| KLD vs Q8, general (menor es mejor) | 0,04965 | 0,05423 | 0,06993 |
| Perplejidad Wikitext-2 (menor es mejor) | 8,0845 | 8,1139 | 8,2195 |
| GSM8K, exactitud (n=200) | 89,0% | 90,5% | 87,5% |
| MATH-500, exactitud (n=500) | 35,4% | 38,8% | 30,2% |

Según el autor, la mejora en KLD es del −23% frente al Q4_K_M público y del −42% frente al IQ4_XS en código/matemáticas, y del −8% y −29% respectivamente en general. En GSM8K la diferencia es de −1,5 puntos porcentuales frente al Q4_K_M público; en MATH-500, de −3,4 puntos porcentuales frente al Q4_K_M público y +5,2 puntos frente al IQ4_XS. El intervalo de confianza al 95% con estos tamaños de muestra es de ±4,2 puntos porcentuales. El autor indica que tres ejecuciones independientes reprodujeron el KLD hasta cinco decimales.

Rendimiento de inferencia medido por el autor en Apple M4 con 24 GB de memoria unificada, modo CPU (`-ngl 0`): carga en frío de ~128 s y decodificación de ~4,9 tok/s. El autor advierte que la aceleración de 1,49× en decodificación de la variante MTP-runtime solo aplica a A100-80GB y no se observa en hardware de consumo.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero GGUF ocupa aproximadamente 20 GB (el repositorio completo son 21,6 GB). En modo CPU necesita unos 20 GB de RAM; con offload parcial a GPU, la VRAM necesaria depende del número de capas descargadas.
- Apple Silicon: medido en M4 con 24 GB de memoria unificada en modo CPU (`-ngl 0`), con ~4,9 tok/s de decodificación. El autor reporta que el offload completo a Metal (`-ngl 99`) y `-ngl 28` fallan con error de memoria en Metal (`kIOGPUCommandBufferCallbackErrorOutOfMemory`) en una máquina de 24 GB, porque el techo práctico de asignación Metal es de ~16,8 GB. En equipos de 32 GB o más el offload completo no está medido por el autor.
- GPU de consumo: no se publican medidas concretas de VRAM ni de rendimiento en RTX 4090 u otras GPU de consumo; el autor solo afirma que funciona con `llama.cpp` estándar en GPU de consumo.
- GPU de datacenter: no hay medidas publicadas para A100 o H100 en esta build; la variante MTP-runtime reporta 1,49× en decodificación solo en A100-80GB.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), LM Studio, Ollama, llama-cpp-python, koboldcpp, Jan y Text Generation Web UI.
- Latencia y throughput: solo el dato de ~4,9 tok/s en Apple M4 / 24 GB en modo CPU; el resto no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fraQtl Hi-Fi Q4_K_M (esta ficha) | ~34,66 B totales, ~3 B activos | no disponible | Apache-2.0 | GGUF | KLD 0,02074 (código/mates) y 0,04965 (general); PPL 8,0845; GSM8K 89,0%; MATH-500 35,4% |
| Q4_K_M público del mismo modelo base | ~34,66 B totales, ~3 B activos | no disponible | Apache-2.0 | GGUF | KLD 0,02700 y 0,05423; PPL 8,1139; GSM8K 90,5%; MATH-500 38,8% |
| IQ4_XS público del mismo modelo base | ~34,66 B totales, ~3 B activos | no disponible | Apache-2.0 | GGUF | KLD 0,03556 y 0,06993; PPL 8,2195; GSM8K 87,5%; MATH-500 30,2% |
| Qwen/Qwen3.6-35B-A3B-Instruct (modelo base) | ~34,66 B totales, ~3 B activos | no disponible | Apache-2.0 | safetensors (original) | Referencia de precisión completa; sin métricas de benchmarks en la información proporcionada |

No se dispone de datos de benchmarks del modelo base en precisión completa ni de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada. Al ser una cuantización de un modelo base entrenado principalmente en inglés y chino, es probable que herede los sesgos de dicho modelo, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplica el riesgo habitual de los modelos generativos.
- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está evaluado ni garantizado.
- Contexto: la longitud de contexto del modelo base no se especifica en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas sin verificarlo en la documentación del modelo original.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada por el autor para confirmar condiciones adicionales.
- Calidad: la cuantización Q4_K_M introduce pérdida frente al modelo completo. El autor reporta una caída de 1,5 puntos porcentuales en GSM8K y de 3,4 en MATH-500 frente al Q4_K_M público, con un intervalo de confianza de ±4,2 puntos, por lo que parte de la diferencia puede estar dentro del ruido estadístico.
- Apple Silicon de 24 GB: el offload completo a Metal falla por límite de asignación; es necesario usar modo CPU (`-ngl 0`), lo que reduce el rendimiento a ~4,9 tok/s.
- Reproducibilidad del rendimiento: la medición en Apple Silicon se realizó sobre la variante MTP-runtime, que comparte la cuantización del modelo principal; el autor indica que la medición sobre este fichero está pendiente.
- Tool calling y agentes: no hay confirmación en la información proporcionada de que esta cuantización conserve dichas capacidades del modelo base.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/fraQtl/Qwen3.6-35B-A3B-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-Instruct/blob/main/LICENSE
- Variante MTP-runtime del mismo autor: https://huggingface.co/fraQtl/Qwen3.6-35B-A3B-Hi-Fi-MTP-runtime
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- koboldcpp: https://github.com/LostRuins/koboldcpp
- Jan: https://www.jan.ai/
- Text Generation Web UI: https://github.com/oobabooga/text-generation-webui
