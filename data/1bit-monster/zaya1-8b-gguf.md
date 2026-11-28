# 1bit-MONSTER/ZAYA1-8B-GGUF

## Resumen

ZAYA1-8B-GGUF es la conversión al formato GGUF del modelo Zyphra/ZAYA1-8B, publicada por el usuario 1bit-MONSTER como parte del catálogo de arquitecturas soportadas por su motor de inferencia propio (1bit engine). El modelo base, desarrollado por Zyphra, cuenta con 8.840.233.464 parámetros reales (8,84 mil millones) y emplea una arquitectura híbrida que combina expertos enrutados (MoE) con una ruta de atención recurrente, lo que explica su inusual sensibilidad a la cuantización. La licencia es Apache 2.0, heredada del modelo original.

La relevancia de esta ficha radica en que se trata de la primera conversión GGUF conocida de ZAYA1, realizada desde cero con un fork propio de llama.cpp en lugar de reutilizar una conversión existente. El autor documenta con detalle el proceso de validación (acuerdo top-1 del 95/96 frente al modelo original en FP32) y las métricas de calidad por cuantización, algo poco habitual en repositorios de este tipo.

El repositorio incluye tres archivos: F16 (para recuantizar), Q8_0 (9,49 GB) y Q4_K_M (5,57 GB). La advertencia principal es que la variante de 4 bits es notablemente lossy (KLD medio de 0,5751 frente al F16 y solo un 69 % de coincidencia en el token top-1), por lo que el autor recomienda leer con atención las métricas antes de elegirla para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: expertos enrutados (MoE) con ruta de atención recurrente; arquitectura GGUF `zaya` |
| Parametros totales | 8.840.233.464 (8,84 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base ZAYA1-8B emplea una arquitectura híbrida que combina capas de expertos enrutados (MoE) con una ruta de atención recurrente. El autor de la conversión señala explícitamente que esta combinación es la causa de la sensibilidad del modelo a la cuantización, ya que tanto los expertos enrutados como el camino recurrente de atención acumulan error de forma más agresiva que un transformer denso convencional. El GGUF presenta particularidades técnicas propias: el tensor `cca_conv_grp` está en disposición tap-major y el rope theta es de 5e6, derivado de los parámetros híbridos de rope del modelo original, lo que impide cargarlo con un llama.cpp upstream estándar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La conversión a GGUF fue realizada por el equipo del 1bit engine con su propio `zaya.py` y kernels para Vulkan, ROCm y HRX, y validada mediante comparación teacher-forced contra el modelo original en FP32 sobre CPU: 95 de 96 posiciones coincidentes en F16, frente a las 91 de 96 del propio checkpoint BF16 de Hugging Face, lo que indica que la conversión introduce menos error que el redondeo a BF16. La tokenización se verificó contra el tokenizador original con un pasaje de wikitext, código y texto de escritura mixta.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y el autor confirma que los archivos responden correctamente a preguntas conocidas.
- Razonamiento y generación de texto general: capacidades heredadas del modelo base Zyphra/ZAYA1-8B.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor solo menciona pruebas de tokenización con texto de escritura mixta, sin detallar idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con la infraestructura de Hugging Face, aunque no se detalla el alcance.

## Casos de uso

- Despliegue en hardware de consumo con el motor 1bit: el archivo Q4_K_M (5,57 GB) permite ejecutar un modelo de 8,84 mil millones de parámetros en equipos con memoria unificada o GPU de gama alta, usando el motor propietario con backend HRX. Es adecuado cuando se prioriza velocidad de decodificación sobre fidelidad absoluta.
- Inferencia de alta fidelidad en servidores: el archivo Q8_0 (9,49 GB) mantiene un KLD medio de 0,0321 y un 92,5 % de coincidencia top-1 frente al F16, por lo que es la opción recomendada para tareas donde la calidad de la respuesta es crítica y se dispone de VRAM suficiente.
- Recuantización y experimentación: el archivo F16 sirve como punto de partida para generar nuevas cuantizaciones con otras herramientas, ya que el autor lo publica explícitamente con ese propósito.
- Investigación sobre cuantización de arquitecturas híbridas: el repositorio documenta métricas de KLD y coincidencia top-1 por archivo, lo que lo convierte en un caso de estudio útil para analizar cómo afecta la cuantización a modelos con expertos enrutados y atención recurrente.
- Prototipado de asistentes conversacionales: gracias a la etiqueta `conversational` y a la validación con preguntas conocidas, el modelo puede emplearse en prototipos de chat multi-turno, siempre que se asuma la pérdida de calidad del Q4_K_M.
- Evaluación de motores de inferencia alternativos: el repositorio incluye mediciones comparativas entre backends (Vulkan, ROCm, HRX), lo que permite usar el modelo como banco de pruebas para comparar rendimiento de motores en hardware AMD Strix Halo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de calidad de cuantización y de rendimiento de inferencia:

| Metrica | Valor |
|---|---|
| KLD medio Q8_0 vs F16 | 0,0321 |
| Coincidencia top-1 Q8_0 vs F16 | 92,5 % |
| KLD medio Q4_K_M vs F16 | 0,5751 |
| Coincidencia top-1 Q4_K_M vs F16 | 69,0 % |
| Acuerdo top-1 F16 vs FP32 (teacher-forced) | 95/96 posiciones |
| Acuerdo top-1 BF16 HF vs FP32 | 91/96 posiciones |

Rendimiento medido en AMD Ryzen AI Max+ 395 (Radeon 8060S), Q4_K_M:

| Backend | Decodificacion | Prefill (pp512) |
|---|---|---|
| Vulkan (2026-09) | 93 tok/s | 3437 tok/s |
| ROCm (2026-09) | 61,5 tok/s | no disponible |
| HRX (2026-09) | 25,5 tok/s | no disponible |
| HRX (2026-11-27) | 143 ± 6,7 tok/s (tg128) | 2792 ± 330 tok/s |

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 5,57 GB de pesos, más overhead de contexto y KV cache; viable en GPUs de 8 GB o superiores.
- VRAM estimada para Q8_0: aproximadamente 9,49 GB de pesos; requiere GPUs de 12 GB o superiores, o memoria unificada de 16 GB.
- VRAM estimada para F16: alrededor de 17,7 GB de pesos (el doble de los 8,84 mil millones de parámetros); requiere GPUs de 24 GB o más.
- GPU recomendadas: el autor solo documenta mediciones en AMD Ryzen AI Max+ 395 con Radeon 8060S (memoria unificada). No se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, el Q4_K_M en GPUs de 8 GB o más y el Q8_0 en GPUs de 12 GB o más, según el cálculo de tamaño de pesos.
- Opciones de despliegue: el modelo requiere el fork `1bit-MONSTER/llama.cpp` del motor 1bit; un llama.cpp upstream estándar no puede cargar el layout de tensores. El autor indica que los backends Vulkan y ROCm fueron eliminados del motor y que actualmente solo se soporta HRX.
- Latencia y throughput: en HRX sobre Strix Halo con Q4_K_M, 143 tok/s de decodificación y 2792 tok/s de prefill (medición de 2026-11-27). La velocidad del Q8_0 en HRX no se ha medido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ZAYA1-8B ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa de rendimiento. A continuación se comparan únicamente aspectos estructurales y de disponibilidad:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| ZAYA1-8B (base) | 8,84 mil millones | no disponible | Apache 2.0 | No (solo safetensors/BF16) |
| ZAYA1-8B-GGUF (esta ficha) | 8,84 mil millones | no disponible | Apache 2.0 | Sí (F16, Q8_0, Q4_K_M) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sensibilidad extrema a la cuantización: el Q4_K_M presenta un KLD medio de 0,5751 y solo un 69 % de coincidencia top-1 frente al F16, lo que el propio autor califica de "claramente lossy". No se recomienda para producción sin evaluar el impacto en la tarea concreta.
- Dependencia de un fork propietario: el GGUF no carga en llama.cpp upstream debido al layout tap-major del tensor `cca_conv_grp` y al rope theta de 5e6. El despliegue exige el motor 1bit y su fork de llama.cpp.
- Backends limitados: los backends Vulkan y ROCm fueron eliminados del motor; actualmente solo se soporta HRX, lo que reduce las opciones de hardware y las mediciones disponibles.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; el modelo base no incluye documentación al respecto en este repositorio.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar los términos del repositorio original de Zyphra.
- Validación parcial: la comprobación de respuesta correcta se realizó solo con preguntas conocidas y en CPU; la velocidad del Q8_0 en HRX no está medida y las mediciones de rendimiento provienen de una única ventana en una máquina compartida.
- Repositorio con 0 likes y 393 descargas: la adopción es baja, por lo que hay poca validación independiente de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/1bit-MONSTER/ZAYA1-8B-GGUF
- Modelo base: https://huggingface.co/Zyphra/ZAYA1-8B
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp del proyecto: https://github.com/1bit-MONSTER/llama.cpp (referenciado en la model card)
- Familias de modelos del autor: https://huggingface.co/1bit-MONSTER#families
