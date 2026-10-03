# axieyangb/Vesper-Coder-1.5B

## Resumen

Vesper-Coder-1.5B es un modelo denso de generación de código de 1.543.714.304 parámetros (aproximadamente 1.500 millones), publicado por el usuario axieyangb en HuggingFace bajo licencia Apache-2.0. Está construido sobre la arquitectura Qwen2ForCausalLM y constituye un ajuste fino del modelo Qwen/Qwen2.5-Coder-1.5B-Instruct, por lo que mantiene los pesos densos estándar de la familia Qwen2 y es intercambiable directamente con transformers, vLLM, llama.cpp y Ollama.

Su principal propuesta diferencial no es el tamaño ni el contexto, sino la eficiencia extrema del post-entrenamiento: el autor afirma haber completado el ajuste en menos de 15 minutos sobre una única GPU de consumo (NVIDIA RTX 3090 de 24 GB), con un coste estimado de unos 0,10 dólares, sin destilación de modelos profesor (cero GPT-4, Claude o modelos de 671B) y sin soluciones de referencia ni etiquetas humanas, partiendo únicamente de 464 especificaciones de problema sin resolver.

El modelo es relevante ahora porque demuestra que es posible mejorar los resultados del modelo base en benchmarks de código (MBPP-Sanitized y HumanEval) con un presupuesto de cómputo mínimo, lo que reduce la barrera de entrada para equipos pequeños o investigadores que quieran experimentar con post-entrenamiento de modelos de código en hardware de consumo. La model card declara únicamente inglés como idioma soportado y no especifica la longitud de contexto propia del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha del modelo; el modelo base Qwen2.5-Coder-1.5B-Instruct emplea 32.768 tokens nativos |
| Tipos de cuantizacion | no especificados por el autor; al ser compatible con llama.cpp y Ollama admite cuantizaciones GGUF generadas por el usuario |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (precisión de referencia bfloat16 en el ejemplo oficial) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2ForCausalLM, un transformer decoder-only denso con normalización RMSNorm, atención con RoPE y sin capas de mezcla de expertos. Los pesos resultantes conservan exactamente la misma estructura que el modelo base Qwen2.5-Coder-1.5B-Instruct, de modo que no introduce sobrecarga arquitectónica adicional ni cambios en el grafo de cómputo. El repositorio ocupa 3,1 GB y el checkpoint se distribuye en formato safetensors.

El autor describe el post-entrenamiento como un pipeline ultraligero y autocontenido: 1 GPU RTX 3090 de 24 GB, menos de 15 minutos de cómputo (aproximadamente 0,25 GPU-hora y unos 0,10 dólares), cero destilación desde modelos profesor (ni GPT-4, ni Claude, ni modelos de 671B), y cero uso de código de referencia o etiquetas humanas. Los datos de partida son 464 especificaciones de problema sin solución ground-truth. La model card no especifica el algoritmo exacto de post-entrenamiento (no se mencionan RLHF, DPO ni un método concreto de optimización), ni el número de tokens de entrenamiento, ni la composición detallada del dataset. La evaluación se realizó bajo un protocolo declarado de zero-leakage (Train ∩ Test = ∅) sobre MBPP-Sanitized (N = 257) y HumanEval (N = 164).

## Capacidades

- Generación de código en Python, con foco explícito en funciones y estructuras limpias y bien formateadas.
- Resolución de problemas algorítmicos descritos en lenguaje natural (por ejemplo, subsecuencias crecientes más largas, estructuras de datos, recursión).
- Modo conversacional mediante plantilla de chat (roles system y user), heredado del modelo base instruct.
- Decodificación determinista en modo 1-shot con temperatura 0,0, que es la configuración evaluada por el autor.
- Verificación en tiempo de test (3-turn test-time verification), con la que el autor reporta las cifras más altas de los benchmarks.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode) en la información disponible.
- Soporte multilingüe no documentado; la ficha declara solo inglés.

## Casos de uso

- Autocompletado de código en editores: el modelo puede integrarse como backend de generación en plugins de IDE para completar funciones Python a partir de firmas y docstrings, con un coste de inferencia muy bajo gracias a sus 1,5B de parámetros.
- Generación de funciones en pipelines de CI/CD: dado que es drop-in compatible con transformers, vLLM y llama.cpp, puede desplegarse como servicio interno que genere o valide fragmentos de código en tareas automatizadas de revisión.
- Asistente de estudio de algoritmos: mediante la plantilla de chat, puede responder a enunciados de problemas de programación y producir soluciones explicadas, útil en plataformas educativas de bajo coste.
- Prototipado rápido en hardware de consumo: al caber holgadamente en GPUs de gama media, permite a desarrolladores individuales ejecutar experimentos de generación de código en local sin depender de APIs externas.
- Investigación en post-entrenamiento eficiente: sirve como caso de estudio reproducible para analizar cómo mejorar un modelo base de código con 464 especificaciones sin ground-truth y menos de 0,25 GPU-hora.
- Verificación iterativa de soluciones: el modo de verificación en tres turnos evaluado por el autor puede emplearse en un bucle que genere, inspeccione y corrija la propia respuesta para elevar la tasa de acierto en problemas algorítmicos.
- Evaluación comparativa de modelos pequeños de código: por su licencia Apache-2.0 y su tamaño, es un candidato adecuado para bancos de pruebas internos frente a otros modelos de 1B a 3B.

## Benchmarks y rendimiento

Resultados publicados por el autor bajo el protocolo declarado de zero-leakage (Train ∩ Test = ∅):

| Modelo / checkpoint | Params | Coste de computo | MBPP-Sanitized Pass@1 (vault completo) | MBPP-Sanitized (visible) | HumanEval Pass@1 (vault completo) | HumanEval (doctest) |
|---|---|---|---|---|---|---|
| CodeLlama-7B-Instruct | 7,0B | no disponible | 44,4% | no disponible | 34,8% | no disponible |
| StarCoder2-3B-Instruct | 3,0B | no disponible | 43,5% | no disponible | 45,7% | no disponible |
| CodeLlama-13B-Instruct | 13,0B | no disponible | 49,4% | no disponible | 42,7% | no disponible |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | no disponible | 46,2% | no disponible | 65,2% | no disponible |
| GPT-3.5-Turbo (0613) | no disponible | no disponible | 52,2% | no disponible | 60,3% | no disponible |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | baseline | 47,47% (122/257) | 51,75% (133/257) | 58,54% (96/164) | 70,73% (116/164) |
| Vesper-Coder-1.5B (1-shot, T=0,0, v1.0-Balanced) | 1,5B | ~0,10 $ (1x3090) | 52,53% (135/257, +5,06%) | 56,81% (146/257) | 63,41% (104/164, +4,87%) | 77,44% (127/164, +6,71%) |
| Vesper-Coder-1.5B (1-shot, T=0,0, v1.0-MBPP-Max) | 1,5B | ~0,10 $ (1x3090) | 54,86% (141/257, +7,39%) | 59,53% (153/257, +7,78%) | 59,76% (98/164, +1,22%) | 74,39% (122/164, +3,66%) |
| Vesper-Coder-1.5B (verificacion en 3 turnos) | 1,5B | ~0,10 $ (1x3090) | 61,48% (158/257, +14,01%) | 68,87% (177/257) | 65,85% (108/164, +9,75%) | 82,32% (135/164) |

## Requisitos de hardware

- Inferencia en bfloat16/fp16: aproximadamente 3,1 GB de pesos, es decir entre 4 y 6 GB de VRAM contando caché KV y overhead del runtime.
- Inferencia en fp32: en torno a 6,2 GB de pesos, viable en GPUs con 8 GB o más.
- Cuantización de 8 bits: aproximadamente 1,6 GB de pesos.
- Cuantización de 4 bits: aproximadamente 0,8 a 1 GB de pesos.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, e incluso integradas con memoria unificada suficiente).
- GPU de datacenter recomendadas si se busca throughput alto: A100, H100, L40S; para un modelo de 1,5B, cualquier GPU moderna ofrece latencia baja.
- Opciones de despliegue: transformers (ejemplo oficial con AutoModelForCausalLM), vLLM, llama.cpp, Ollama y Text Generation Inference (la ficha incluye el tag text-generation-inference y endpoints_compatible).
- Latencia y throughput estimados: no disponibles en la información proporcionada; el único dato de cómputo documentado es el post-entrenamiento sobre una RTX 3090 en menos de 15 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento de referencia |
|---|---|---|---|---|---|
| Vesper-Coder-1.5B | ~1,5B | no disponible (base con 32.768 tokens) | Apache-2.0 | HuggingFace (transformers, vLLM, llama.cpp, Ollama) | MBPP-Sanitized 52,53%–61,48%; HumanEval 59,76%–65,85% |
| Qwen2.5-Coder-1.5B-Instruct (base) | ~1,5B | 32.768 tokens | Apache-2.0 | HuggingFace | MBPP-Sanitized 47,47%; HumanEval 58,54% |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | no disponible | licencia específica del autor | HuggingFace | MBPP-Sanitized 46,2%; HumanEval 65,2% (según datos citados por Vesper) |
| Yi-Coder-1.5B | 1,5B | 128.000 tokens | no disponible en la información recogida | HuggingFace (01-ai/Yi-Coder-1.5B y variante Chat) | no disponible en la información recogida |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado explícitamente; al ser un modelo de 1,5B orientado a código, puede generar APIs, funciones de librería o firmas inexistentes, especialmente fuera del dominio Python.
- Limitaciones de contexto: la ficha no especifica la ventana de contexto efectiva del ajuste; conviene verificar el comportamiento en prompts largos antes de usarlo en producción.
- Limitaciones de idioma: la ficha declara únicamente inglés, tanto en las especificaciones como en los prompts de ejemplo.
- Dominio restringido: los ejemplos y las evaluaciones se centran en Python; el rendimiento en otros lenguajes no está documentado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-Coder-1.5B-Instruct, por lo que conviene revisar también las condiciones del modelo base.
- Caveat sobre las métricas: todas las cifras de benchmark proceden de la propia model card del autor y no han sido verificadas de forma independiente; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Caveat sobre el método: no se detalla el algoritmo exacto de post-entrenamiento ni la composición final de los datos, lo que dificulta reproducir los resultados.
- Caveat sobre el ajuste 3-turn: las cifras más altas dependen de un procedimiento de verificación en varios turnos, no de una única pasada de generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axieyangb/Vesper-Coder-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Yi-Coder-1.5B (comparativa): https://huggingface.co/01-ai/Yi-Coder-1.5B/tree/main
- Yi-Coder-1.5B-Chat (comparativa): https://huggingface.co/01-ai/Yi-Coder-1.5B-Chat
- Ficha de Yi-Coder 1.5B en Inferbase: https://www.inferbase.ai/models/01ai-yi-coder-1-5b
- Análisis de Yi-Coder 1.5B en AI Indigo: https://aiindigo.com/blog/yi-coder-1-5b-review-the-lightweight-heavyweight-of-local-coding
- Yi Coder 1.5B Chat en LLM Explorer (VRAM 3 GB, contexto 128K): https://llm-explorer.com/model/01-ai%2FYi-Coder-1.5B-Chat,1tMLz0ViFJmcOTuiwkhPLn
