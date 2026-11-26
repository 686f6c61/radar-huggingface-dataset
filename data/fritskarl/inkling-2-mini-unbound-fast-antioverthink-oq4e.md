# fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-oQ4e

## Resumen

Inkling-2-Mini-Unbound-Fast-AntiOverthink-oQ4e es una cuantización en formato MLX del modelo Inkling-2-Mini, un transformer de tipo Mixture of Experts (MoE) desarrollado originalmente por Thinking Machines. Esta versión concreta ha sido publicada por el usuario fritskarl y combina tres modificaciones sobre el modelo base: el ajuste "Fast" de Lucebox, la fusión "Unbound v2.1" (que elimina la mayoría de los rechazos del modelo) y la variante "Anti-Overthinking" (que reduce el exceso de razonamiento). El resultado es un modelo de 26.388 millones de parámetros totales empaquetado en 16,9 GB, pensado para ejecutarse en Apple Silicon mediante la librería MLX.

La relevancia de esta ficha radica en que es una de las pocas builds de este finetune optimizadas específicamente para el ecosistema MLX de Apple, con un rendimiento declarado de 62,5 tokens por segundo en un MacBook Pro con M3 Max. Utiliza una técnica de cuantización denominada oQ4e que preserva los bits originales NVFP4 de los expertos enrutados de las capas 0 a 19 (passthrough sin re-redondeo) y aplica 4 bits calibrados con una imatrix oQe al resto de tensores, manteniendo mayor precisión en los tensores sensibles.

Se trata de un modelo sin censura (uncensored) y con capacidades declaradas de razonamiento, generación de código y uso de herramientas, lo que lo hace adecuado para entornos de desarrollo e investigación donde se requiere control total sobre el comportamiento del modelo, pero con advertencias importantes sobre sesgos, alucinaciones y responsabilidad de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parametros totales | 26.388.646.400 (26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configurado en oMLX); 64K en pruebas con llama.cpp; 24K en pruebas con IQ4_NL |
| Tipos de cuantizacion | oQ4e (4 bits con expertos enrutados en NVFP4 original, passthrough sin re-redondeo; tensores sensibles en mayor precisión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 16,9 GB |
| Libreria | mlx |
| Modelo base | thinkingmachines/Inkling-2-Mini (via Lucebox/Inkling-2-Mini-Fast-GGUF, nokeepai/Inkling-2-Mini-Unbound-GGUF, thiagovelsa/Inkling-2-Mini-Unbound-Fast-AntiOverthink-GGUF) |
| Cuantizado por | fritskarl |
| Fecha de creacion | 2026-11-26 |
| Fecha de actualizacion | 2026-11-26 |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de transformer con Mixture of Experts (MoE), según indican las etiquetas del repositorio. Esta build concreta es una cuantización MLX de 4 bits que preserva los bits originales NVFP4 de los expertos enrutados de las capas 0 a 19 sin re-redondeo, mientras que el resto de tensores se cuantizan a 4 bits con calibración mediante una imatrix oQe, manteniendo los tensores sensibles en mayor precisión. El proceso de cuantización fue realizado por fritskarl sobre una reconstrucción de precisión de release del finetune de thiagovelsa, que a su vez integra la variante Fast de Lucebox, la fusión Unbound v2.1 y el ajuste Anti-Overthinking.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo original. El modelo base procede de Thinking Machines, y las modificaciones posteriores (Fast, Unbound, Anti-Overthinking) son finetunes y fusiones de la comunidad. La build incluye soporte para decodificación especulativa mediante el drafter DFlash2 (incoai/Inkling-2-Mini-DFlash2) cuando se ejecuta a través del motor Splash de oMLX, lo que según el autor incrementa el rendimiento en aproximadamente un 50 % respecto al motor propio de oMLX.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Razonamiento multi-paso con niveles de esfuerzo configurables (off, minimal, low, medium, high, xhigh, max), con `high` como valor seguro por defecto.
- Generación de código, incluyendo resolución de tareas de programación tipo HumanEval y tareas de agente de codificación (pi coding agent).
- Soporte de tool calling / function calling a través de la API compatible con OpenAI de oMLX (`/v1`).
- Capacidad de agente multi-paso: el autor reporta 3/3 tareas resueltas sin bucles en el agente pi.
- Entrada multimodal de texto e imagen (según la configuración de pi que declara `"input": ["text", "image"]`).
- Modo de razonamiento (thinking mode) con niveles de esfuerzo ajustables.
- Modelo sin censura (Unbound): elimina la mayoría de los rechazos del modelo base.
- Ajuste Anti-Overthinking para reducir el exceso de razonamiento en tareas simples.
- Decodificación especulativa mediante drafter DFlash2 (solo en Splash).

## Casos de uso

- Agente de codificación automatizado: el modelo puede integrarse en herramientas como pi coding agent para corregir bugs en proyectos Python, con 3/3 tareas resueltas y cero bucles reportados por el autor, gracias a su soporte de tool calling y razonamiento multi-paso.
- Generación de código en pipelines de CI/CD: con 36-38 aciertos sobre 40 problemas de HumanEval en las distintas builds, es adecuado para tareas de generación y verificación de código donde se requiera ejecución contra tests.
- Asistente de desarrollo local en Apple Silicon: con 62,5 tok/s en un M3 Max y 16 GB de tamaño, permite ejecutar un agente de código en un portátil sin conexión a servicios en la nube.
- Atención al cliente automatizada: la ventana de contexto de 131.072 tokens permite gestionar conversaciones multi-turno extensas y mantener el hilo de contexto en interacciones largas.
- Procesamiento de documentos con imágenes: la entrada multimodal texto+imagen permite tareas de extracción y análisis de documentos que combinen texto e imágenes.
- Investigación en alineación y seguridad: al ser un modelo sin censura, es útil para estudiar comportamientos del modelo sin rechazos, siempre con las salvaguardas adecuadas en la aplicación.
- Prototipado rápido de aplicaciones conversacionales: la API compatible con OpenAI de oMLX facilita la integración con herramientas existentes del ecosistema.
- Tareas de razonamiento con control de esfuerzo: el ajuste Anti-Overthinking y los niveles de esfuerzo permiten equilibrar latencia y profundidad de razonamiento según la tarea.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y se refieren a pruebas realizadas en un MacBook Pro M3 Max (40-core GPU, 128 GB, 400 GB/s) con Splash 1.7.3 / oMLX 0.8.4 y drafter DFlash2, y en una RTX 5060 Ti 16 GB con llama.cpp b12776.

| Build | Motor | Tamano | KL vs precision completa | HumanEval (40) | pi agent | Generacion |
|---|---|---:|---:|---:|---|---:|
| Precisión completa, NVFP4 + BF16 (referencia) | Splash, Mac | 21 GiB | — | 37 | 3/3, 0 bucles | 48,0 tok/s |
| thiagovelsa IQ4_NL | Splash, Mac | 16,4 GiB | 0,0082 | 38 | 3/3, 0 bucles | 50,7 tok/s |
| IQ4_NL-16GB GGUF | Splash, Mac | 14,0 GiB | 0,0145 | 38 | 3/3, 0 bucles | 50,9 tok/s |
| IQ3_M GGUF | Splash, Mac | 12,0 GiB | 0,0223 | 37 | 3/3, 0 bucles | 65,2 tok/s |
| MLX 4-bit | oMLX → Splash, Mac | 16 GB | n/a | 38 | 3/3, 0 bucles | 59,4 tok/s |
| MLX NVFP4 (expertos bit-exact) | oMLX → Splash, Mac | 17 GB | n/a | 37 | 3/3, 0 bucles | 53,7 tok/s |
| **oQ4e (este modelo)** | oMLX → Splash, Mac | **16 GB** | n/a | **36 / 37 / 37** | **3/3, 0 bucles** | **62,5 tok/s** |
| IQ3_M GGUF, 64K contexto | llama.cpp, RTX 5060 Ti | 12,0 GiB | 0,0223 | 38 | 3/3, 0 bucles | ~53–60 tok/s |
| IQ4_NL-16GB GGUF, 24K contexto | llama.cpp, RTX 5060 Ti | 14,0 GiB | 0,0145 | 35 | 3/3, 0 bucles | 57,9 tok/s |
| Lucebox Fast UD-Q8_K_XL (sin Unbound ni Anti-Overthinking) | Splash, Mac | 21 GiB | n/a | 37 | 3/3, 0 bucles | 55,3 tok/s |

Notas: la métrica KL es la divergencia media de Kullback-Leibler sobre código y documentación reservados (60 × 512 tokens) frente a la reconstrucción de precisión completa; solo se midió para archivos GGUF. La generación es la media de 4 ejecuciones greedy (dos prompts de ~400 y ~700 tokens), una petición a la vez. Los tres valores de HumanEval para oQ4e corresponden a tres ejecuciones greedy separadas, ya que la verificación especulativa de Splash no es determinista a nivel de bit.

## Requisitos de hardware

- VRAM/RAM estimada: 16 GB para el modelo en formato oQ4e MLX (tamaño del repositorio 16,9 GB).
- GPU recomendadas: Apple Silicon (probado en MacBook Pro M3 Max con 40-core GPU y 128 GB de RAM unificada, 400 GB/s de ancho de banda). El autor indica que no se ha probado en Macs de 16 GB.
- Cabe en consumer GPU: sí, en Apple Silicon con al menos 16 GB de memoria unificada (no probado); también se reportan pruebas con GGUF equivalentes en RTX 5060 Ti 16 GB mediante llama.cpp.
- Opciones de despliegue: oMLX (recomendado, con motor externo Splash y drafter DFlash2), motor propio de oMLX (con drafter DSpark), llama.cpp (para builds GGUF equivalentes), API compatible con OpenAI en `http://127.0.0.1:8000/v1`.
- Latencia y throughput: 62,5 tok/s en M3 Max con Splash + DFlash2; ~41 tok/s con el motor propio de oMLX y DSpark; ~50 % más rápido con Splash que con el motor propio.
- En Macs de 16 GB (no probado): oMLX 0.8.4 puede mantener los expertos enrutados en SSD y Splash puede hacer streaming de expertos que no caben en memoria, lo que debería permitir la ejecución con menos memoria a menor velocidad.
- Ajustes recomendados: `temperature 0.6`, `top_p 0.95`, `top_k 0`, `max_context_window 131072`, `mtp_enabled false`, `loopcd_enabled false`, motor externo `splash`. Evitar muestreo DRY.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval (40) | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound-Fast-AntiOverthink-oQ4e (este) | 26,4 mil millones | 131.072 | 36-37 | Apache 2.0 | MLX safetensors | Hugging Face |
| Inkling-2-Mini-Unbound-Fast-AntiOverthink-MLX-4bit | no disponible | 131.072 | 38 | Apache 2.0 | MLX | Hugging Face |
| Inkling-2-Mini-Unbound-Fast-AntiOverthink-IQ3_M-GGUF | no disponible | 64K (probado) | 37 | Apache 2.0 | GGUF | Hugging Face |
| Lucebox Inkling-2-Mini-Fast-GGUF (sin Unbound ni Anti-Overthinking) | no disponible | no disponible | 37 | Apache 2.0 | GGUF | Hugging Face |

Las alternativas comparadas son todas variantes del mismo modelo base o del mismo finetune en distintos formatos y cuantizaciones, ya que no se dispone de información sobre modelos de otros desarrolladores con características equivalentes. El modelo comparable más directo en cuanto a tamaño y propósito sería el Inkling-2-Mini original de Thinking Machines, pero no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura (Unbound): elimina la mayoría de los rechazos del modelo base; el usuario es responsable del uso y del filtrado necesario en su aplicación.
- Pruebas limitadas: el autor indica que las pruebas se realizaron en un solo M3 Max, una sola RTX 5060 Ti, un subconjunto de 40 problemas de HumanEval y una única tarea de agente pequeña.
- Riesgo de alucinación: no se reportan métricas específicas de alucinación; como todo modelo generativo, puede producir contenido incorrecto o inventado.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los finetunes intermedios pueden tener condiciones adicionales que no se detallan.
- Contexto: la ventana de 131.072 tokens está configurada en oMLX, pero en pruebas con llama.cpp se redujo a 64K y 24K por limitaciones de memoria; el rendimiento real puede degradarse con contextos muy largos.
- Determinismo: la verificación especulativa de Splash no es determinista a nivel de bit, por lo que los resultados de HumanEval varían entre ejecuciones (36/37/37).
- Rendimiento en Macs de 16 GB: no probado; podría requerir streaming de expertos desde SSD con la consiguiente pérdida de velocidad.
- Niveles de razonamiento bajos: el nivel `low` funcionó en una prueba pequeña (3/3 sin bucles), pero no se probaron sesiones largas con ese nivel.
- Compatibilidad: el modelo está en formato MLX y requiere el ecosistema Apple Silicon; para otras plataformas deben usarse las builds GGUF equivalentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-oQ4e
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Finetune de thiagovelsa: https://huggingface.co/thiagovelsa/Inkling-2-Mini-Unbound-Fast-AntiOverthink-GGUF
- Build Fast de Lucebox: https://huggingface.co/Lucebox/Inkling-2-Mini-Fast-GGUF
- Build Unbound de nokeepai: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Drafter DFlash2: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Build IQ4_NL-16GB GGUF del mismo autor: https://huggingface.co/fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-IQ4_NL-16GB-GGUF
- Build IQ3_M GGUF del mismo autor: https://huggingface.co/fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-IQ3_M-GGUF
- Build MLX 4-bit del mismo autor: https://huggingface.co/fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-MLX-4bit
- Build MLX NVFP4 del mismo autor: https://huggingface.co/fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-MLX-NVFP4
