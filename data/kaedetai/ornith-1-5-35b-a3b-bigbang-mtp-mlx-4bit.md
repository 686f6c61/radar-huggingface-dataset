# KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit

## Resumen

Ornith-1.5-35B-A3B-BigBang-MTP es un modelo de lenguaje multimodal (vision-language) de arquitectura Mixture of Experts (MoE) desarrollado por Ornith AI sobre la base de Qwen3.6-35B-A3B y el dataset de entrenamiento BigBang-v1. El modelo combina 35.000 millones de parámetros totales con solo 3.000 millones activos por token, lo que permite un rendimiento de inferencia muy superior al de un modelo denso de tamaño equivalente. Este repositorio concreto, publicado por KaedeTai, es una conversión a formato MLX en cuantización 4-bit que preserva dos componentes críticos que las conversiones estándar eliminan silenciosamente: el cabezal MTP (Multi-Token Prediction) y la torre de visión.

La relevancia de este modelo radica en que implementa decodificación especulativa nativa mediante un cabezal MTP que predice hasta cinco tokens por paso de avance del backbone, con una tasa de aceptación medida del 63,7 % en profundidad 1 y una caída mínima en profundidades superiores. Además, el modelo mantiene la torre de visión intacta, lo que permite uso multimodal (imagen-texto) en Apple Silicon. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 256 expertos y un experto compartido, basada en Qwen3.5 MoE |
| Parametros totales | 35.000 millones (modelo original); 6.005.029.808 pesos en esta conversión 4-bit |
| Parametros activos | ~3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX g4) |
| Idiomas soportados | no disponible (la model card menciona chino e inglés; el modelo base soporta multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE con 256 expertos y un experto compartido, activando solo 3.000 millones de parámetros por token. El entrenamiento sigue el paradigma de self-scaffolding y self-improvement introducido en Ornith-1.0: el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. El dataset BigBang-v1 se utilizó para el entrenamiento de la variante BigBang-MTP, que añade un cabezal MTP de 44 tensores.

La conversión MLX de KaedeTai preserva el cabezal MTP y la torre de visión (333 tensores), algo que la ruta de conversión estándar de `mlx_lm.convert` elimina silenciosamente mediante el filtro `"mtp." not in k` en `TextModel.sanitize`. La conversión requirió resolver cuatro problemas técnicos: la división por bloques de los pesos fused de expertos, el desplazamiento +1 en normas RMSNorm de tipo zero-centred, la transposición del tensor `linear_attn.conv1d.weight` y la permutación de ejes en `vision_tower.patch_embed.proj.weight`. El resultado se verificó numéricamente contra una conversión de referencia, con cero discrepancias de forma y cero parámetros faltantes.

## Capacidades

- Generación de texto y razonamiento multilingüe, con soporte de chino tradicional y simplificado, inglés y otros idiomas del modelo base Qwen3.6.
- Decodificación especulativa multi-token: el cabezal MTP predice hasta 5 tokens por avance del backbone, con una tasa de aceptación del 63,7 % en profundidad 1 y del 64,8 % en profundidad 2.
- Procesamiento de imágenes (vision-language): la torre visual integrada permite entrada de imágenes y respuesta basada en su contenido, con una pérdida de aceptación MTP de solo 5 puntos en el primer draft cuando hay tokens de imagen en contexto.
- Tool calling y function calling: soportado a través de la arquitectura Qwen3.5 base, que incluye capacidades de invocación de herramientas.
- Razonamiento multi-paso y agentes: la arquitectura MoE de 256 expertos permite rutas de cómputo especializadas para tareas de razonamiento complejo.
- Codificación de software: la tasa de aceptación MTP para código es casi perfecta según las mediciones del autor.

## Casos de uso

- Desarrollo de código asistido en Apple Silicon: el modelo puede ejecutarse localmente en M5 Max (128 GB) con decodificación especulativa activada, generando código con una tasa de aceptación MTP casi perfecta y un rendimiento de 1,91 tokens por avance del backbone en mediana.
- Agentes autónomos con visión: gracias a la torre visual intacta y la capacidad de tool calling, se pueden construir agentes que interpretan capturas de pantalla o imágenes y ejecutan acciones, con MTP activado (`vlm_mtp_enabled`) para acelerar la generación.
- Asistentes multilingües de atención al cliente: el modelo soporta chino tradicional e inglés con fluidez, y la decodificación especulativa reduce la latencia percibida en conversaciones multi-turno.
- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD mediante el framework MLX o oMLX, con cuantización 4-bit que ocupa solo 19,4 GB en disco y cabe en GPUs de consumo.
- Sistemas de razonamiento multi-paso con verificación: la arquitectura MoE permite rutas de cómputo especializadas para tareas de razonamiento complejo, y el MTP head permite generar múltiples tokens de razonamiento con menor latencia.
- Experimentación en investigación: la licencia MIT y la disponibilidad de pesos en formato MLX facilitan la experimentación en entornos Apple Silicon sin necesidad de GPU NVIDIA, lo que reduce la barrera de entrada para investigadores con hardware de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, se han medido métricas de rendimiento específicas para la decodificación especulativa MTP en este repositorio:

| Metrica | Valor |
|---|---|
| Aceptación depth-1 | 63,7 % (10843/17032) |
| Aceptación depth-2 | 64,8 % (4707/7266) |
| Aceptación depth-3 | 63,5 % (1394/2195) |
| Tokens por avance del backbone (mediana) | 1,91 |
| Tokens por avance del backbone (media) | 2,05 |
| Tokens por avance del backbone (máximo) | 5,00 |
| Share de cómputo del cabezal MTP | 4,6 % (42 s frente a 853 s del backbone) |
| Requests con MTP desactivado por el controlador | 72/659 (11 %) |
| Aceptación con imagen en contexto (depth-1) | ~58 % (5 puntos menos que sin imagen) |
| Aceptación con imagen en contexto (depth-3) | ~63 % (igual que sin imagen) |

Estas mediciones se realizaron en un Apple M5 Max de 128 GB con macOS 26.4.1, usando oMLX con 659 requests reales. La aceptación no decae con la profundidad, a diferencia de modelos densos como Qwen3.8-27B cuyas cabezas MTP caen de 98 % a 85 % entre depth-1 y depth-3. El rendimiento en código es casi perfecto, mientras que en chino es 40 puntos inferior, lo que sugiere que el cabezal MTP es mejorable con un fine-tuning específico.

## Requisitos de hardware

- VRAM estimada: 19,4 GB de tamaño de pesos en cuantización 4-bit; se recomienda un mínimo de 24 GB de RAM unificada para inferencia cómoda con contexto largo.
- GPU recomendadas: Apple Silicon con al menos 32 GB de memoria unificada (M4 Pro, M5 Max, M5 Ultra). El modelo también puede ejecutarse en sistemas con GPU NVIDIA mediante MLX, aunque no es el objetivo principal.
- Compatibilidad con GPU de consumo: sí, cabe en MacBook Pro de 16 GB (con cuantización 4-bit), aunque con latencia mayor. En GPU NVIDIA, se recomienda RTX 3090 o superior para decodificación especulativa con llama.cpp.
- Opciones de despliegue: oMLX (verificado con visión y MTP), MLX (con `mlx_lm`), llama.cpp (con soporte de decodificación especulativa MTP), y cualquier framework que soporte el formato MLX.
- Latencia y throughput: en el M5 Max 128 GB idle, la generación con MTP activo es aproximadamente 1,9 veces más rápida que sin MTP (512 tokens generados, 3 iteraciones interleaved). La latencia por avance del backbone es de ~308 ms con MTP, y el cabezal MTP añade solo ~9,5 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | MTP | Visión | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit (este) | MoE (256 expertos) | 35B total, 3B activos | no disponible | Sí (5 tokens) | Sí | MIT | MLX 4-bit |
| Ornith-1.5-35B-A3B-MLX (ornith-ai) | MoE | 35B total, 3B activos | no disponible | No | No | MIT | MLX |
| Ornith-1.5-35B-A3B-BigBang-oQ8e-mtp (pyros-vault) | MoE | 35B total, 3B activos | no disponible | Sí (conversión oQ8e) | no disponible | MIT | MLX |
| Qwen3.6-35B-A3B (base) | MoE | 35B total, 3B activos | 256K (según documentación Qwen) | No | No | Apache 2.0 | safetensors |

La principal diferencia entre las variantes de Ornith-1.5 está en la preservación del MTP head y la visión tower. La conversión de KaedeTai es la única documentada que mantiene ambos componentes intactos, con verificación numérica de los cuatro puntos críticos de conversión. La variante de pyros-vault utiliza una cuantización oQ8e y también preserva MTP, pero no se documenta la verificación de la torre visual.

## Limitaciones y advertencias

- La tasa de aceptación MTP para chino es 40 puntos inferior a la de código, lo que indica que el cabezal MTP está sesgado hacia lenguajes de programación y puede degradar el rendimiento en texto multilingüe.
- El 11 % de las solicitudes en producción activaron el controlador de MTP que desactiva la decodificación especulativa, lo que implica que la aceleración no es uniforme y depende del contenido.
- La conversión MLX está verificada solo para Apple Silicon con oMLX; el uso con `mlx_lm` estándar puede fallar en cargar el MTP head porque el `sanitize` de `qwen3_5` elimina los tensores `mtp.*`.
- La torre visual se carga de forma estricta en oMLX; si hay un error de forma, el modelo cae silenciosamente a modo texto-only con una sola línea de WARNING en el log.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo, por lo que la comparación con alternativas se basa en datos de aceptación MTP y no en calidad de generación.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3.6-35B-A3B tiene licencia Apache 2.0, que es compatible; sin embargo, los datos de entrenamiento BigBang-v1 pueden tener restricciones adicionales no documentadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit
- Modelo base original: https://huggingface.co/EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP
- Modelo Ornith-1.5-35B-A3B (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Ornith AI sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI para modelos de código agentic: https://ornith.online/
- Página de benchmarks de Ornith-1.5-35B-A3B en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Conversión alternativa con MTP (pyros-vault): https://huggingface.co/pyros-vault/Ornith-1.5-35B-A3B-BigBang-oQ8e-mtp
