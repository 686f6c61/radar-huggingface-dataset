# scottlowry/Ornith-1.5-35B-A3B-oQ8e-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ8e-fp16-mtp es un checkpoint cuantizado en 8 bits del modelo Ornith-1.5-35B-A3B, desarrollado por Ornith AI y cuantizado por Scott Lowry mediante la herramienta oQ (oMLX v0.6.2) con precisión mixta. El modelo base es un MoE basado en la arquitectura Qwen3.5-MoE, diseñado para tareas de agente, generación de código y trabajo de largo horizonte. Esta versión concreta está optimizada para el ecosistema MLX, lo que permite ejecutarla en hardware Apple Silicon con un rendimiento razonable.

El nombre del modelo indica 35 mil millones de parámetros totales con 3 mil millones activos (A3B), aunque el checkpoint cuantizado almacena 10,4 mil millones de parámetros reales en formato safetensors, lo que refleja la compresión aplicada. La cuantización oQ8e utiliza 8 bits con grupo de tamaño 64, manteniendo ciertas capas en fp16 para preservar la precisión crítica. Aunque el modelo aún no tiene descargas ni likes en Hugging Face, su arquitectura y enfoque en agentes y herramientas lo sitúan en la línea de los modelos MoE modernos orientados a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (mezcla de expertos) |
| Parametros totales | 35B (nominal) / 10.433.809.328 en checkpoint cuantizado |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e (8 bits, group size 64, precision mixta con capas en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) basada en Qwen3.5-MoE, con 35B parámetros totales y 3B activos por token. Según el blog oficial de Ornith AI, la versión 1.5 extiende el framework de auto-andamiaje (self-scaffolding) introducido en la 1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible.

El checkpoint cuantizado se generó con oMLX v0.6.2, que aplica cuantización mixta de precisión: las capas sensibles se mantienen en fp16 mientras que el resto se reduce a 8 bits con grupo de tamaño 64. Esto reduce el tamaño del modelo respecto al original, manteniendo un equilibrio entre rendimiento y fidelidad.

## Capacidades

- Generación de texto y razonamiento: al ser un MoE de 35B con 3B activos, ofrece capacidades de generación y razonamiento comparables a modelos densos de menor tamaño, con mayor eficiencia computacional.
- Codificación agéntica: el repositorio oficial destaca su uso para "agentic coding", es decir, tareas de programación donde el modelo planifica, ejecuta y verifica código de forma autónoma.
- Uso de herramientas (tool calling): soporta invocación de funciones y herramientas externas, lo que permite integrarlo en flujos de trabajo automatizados.
- Trabajo de largo horizonte: diseñado para tareas que requieren múltiples pasos y mantenimiento de contexto a lo largo de interacciones prolongadas.
- Auto-mejora: el modelo base incorpora un mecanismo de auto-andamiaje y auto-mejora mediante aprendizaje por refuerzo, aunque esta capacidad no está disponible en el checkpoint cuantizado directamente.
- Soporte multilingüe: no confirmado explícitamente, pero al estar basado en Qwen3.5, es probable que herede capacidades multilingües del modelo base.

## Casos de uso

- Asistente de programación autónomo: el modelo puede generar código, ejecutar pruebas y corregir errores en un bucle de retroalimentación, gracias a su capacidad de agentic coding y uso de herramientas. Es adecuado para entornos de desarrollo donde se requiere un copiloto que no solo sugiera código, sino que lo valide.
- Automatización de tareas de larga duración: su diseño para trabajo de largo horizonte permite delegar procesos complejos como migración de bases de datos, refactorización de código heredado o análisis de logs, donde el modelo debe mantener el contexto durante muchas iteraciones.
- Integración en pipelines de CI/CD: con soporte de tool calling, puede conectarse a APIs de repositorios, ejecutar comandos y reportar resultados, actuando como un agente de calidad de código.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo puede redactar documentación coherente y detallada, aprovechando su capacidad de razonamiento sobre estructuras complejas.
- Análisis de datos exploratorio: puede interactuar con bases de datos, ejecutar consultas SQL y resumir hallazgos, gracias a su capacidad de razonamiento y uso de herramientas.
- Prototipado rápido de agentes conversacionales: al ser un MoE eficiente, puede desplegarse en entornos con recursos limitados (por ejemplo, un Mac con suficiente memoria unificada) para construir asistentes que gestionen diálogos multi-turno con contexto amplio.

## Benchmarks y rendimiento

No se han publicado resultados oficiales de benchmarks para el modelo base Ornith-1.5-35B-A3B en la información disponible. La plataforma BenchLM ofrece una puntuación pública estimada de 49,27/100 (puesto 134 de 221), basada en 18 filas de benchmarks, pero esta puntuación es estimada y no procede de una evaluación oficial del desarrollador. No se dispone de datos concretos de MMLU, HumanEval, GSM8K u otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 39,5 GB en disco. En formato MLX, la inferencia se realiza en memoria unificada de Apple Silicon; se recomienda al menos 48 GB de RAM unificada para cargar el modelo con margen para el contexto y las activaciones.
- GPU recomendadas: cualquier Mac con chip M1 Pro, M2 Max, M3 Ultra o superior con 48 GB o más de memoria unificada. También puede ejecutarse en sistemas Linux con GPUs NVIDIA si se convierte el formato, aunque no es el objetivo principal de MLX.
- Si cabe en consumer GPU: no directamente, debido al tamaño del checkpoint (39,5 GB). Una RTX 4090 con 24 GB VRAM no sería suficiente; se necesitaría una GPU con al menos 48 GB o usar cuantizaciones más agresivas (por ejemplo, 4 bits) que no están disponibles en este repositorio.
- Opciones de despliegue: al ser MLX, se puede ejecutar con la librería mlx-lm, o mediante herramientas compatibles como Ollama (si se convierte a GGUF) o llama.cpp (tras conversión). Para producción en servidores, habría que convertir a formatos estándar como safetensors de Hugging Face y usar vLLM o TGI.
- Latencia y throughput: no disponible. Depende del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este) | 35B | 3B | no disponible | no disponible | MLX safetensors |
| Qwen3-30B-A3B (referencia) | 30B | 3B | 32K (estimado) | Apache 2.0 (estimado) | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |

Nota: los datos de Qwen3-30B-A3B y Mixtral 8x7B son orientativos y pueden no ser exactos; no se dispone de una comparativa oficial con Ornith-1.5. La comparativa se basa en la categoría de MoE eficientes, pero sin datos de rendimiento verificados.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo base ni del checkpoint cuantizado. Esto impide conocer las restricciones de uso comercial y redistribución. Se recomienda contactar con los autores antes de usar en producción.
- Sesgos y alucinaciones: al no disponer de documentación sobre el entrenamiento ni evaluaciones de sesgo, no se puede garantizar la ausencia de sesgos ni la fiabilidad factual. El modelo puede generar información incorrecta o inventada, especialmente en dominios especializados.
- Contexto limitado: no se ha publicado la longitud de contexto máxima. El modelo base, al estar basado en Qwen3.5, probablemente soporte ventanas largas, pero no hay confirmación oficial.
- Idiomas: no se han especificado los idiomas soportados. Aunque Qwen3.5 es multilingüe, no hay garantía de que el modelo mantenga el mismo rendimiento en todos los idiomas.
- Formato MLX: este checkpoint está optimizado para Apple Silicon. Para otros entornos (NVIDIA, AMD) es necesario convertir los pesos, lo que puede implicar pérdida de rendimiento o incompatibilidad.
- Cuantización: la cuantización oQ8e reduce la precisión respecto al modelo original en fp16. Aunque la precisión mixta preserva capas críticas, puede haber degradación en tareas de alta sensibilidad numérica.
- Sin benchmarks oficiales: no hay resultados verificados de rendimiento en tareas estándar, lo que dificulta evaluar su calidad relativa frente a otros modelos.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ8e-fp16-mtp
- Blog oficial de Ornith AI sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio GitHub con versión NVFP4 para DGX Spark: https://github.com/sojufx/Ornith-1.5-35B-A3B-NVFP4-DGX-Spark
- Perfil del autor en Hugging Face: https://huggingface.co/scottlowry/models
- Página de benchmarks de BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
