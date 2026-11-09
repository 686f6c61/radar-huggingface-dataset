# Inserloft-AI/Apollo-Laikan-100M

## Resumen

Apollo Laikan 100M es un modelo de 110.521.357 parámetros publicado por Inserloft-AI en Hugging Face, concebido no como un modelo de lenguaje generativo sino como un transformer encoder bidireccional no autorregresivo orientado a optimización combinatoria, con foco declarado en el problema de routing de vehículos con capacidad (CVRP). A diferencia de los LLM al uso, no genera texto token a token: procesa el estado completo del problema de una sola pasada y emite tres salidas paralelas mediante un diseño que el autor denomina Multi-Head Output (Family III).

Ese diseño combina una cabeza de clasificación (Choice Head) que puntúa acciones candidatas, una cabeza de regresión (Score Head) que estima la utilidad o el coste asociado al estado actual, y una cabeza de clasificación binaria (Noul Head) que actúa como validador de restricciones lógicas, por ejemplo el exceso de capacidad del vehículo. La arquitectura es personalizada y no es cargable con clases estándar de `transformers`, lo que condiciona su integración en producción.

El modelo es relevante por su enfoque: aplicar mecanismos de atención tipo transformer a la resolución heurística de problemas NP-hard en lugar de a la generación de lenguaje. No obstante, la información pública disponible es muy limitada (sin licencia declarada, sin idiomas, sin pipeline, sin benchmarks y con cero descargas en el momento de la consulta), por lo que debe evaluarse con cautela antes de cualquier adopción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional no autorregresivo con Multi-Head Output (Choice Head, Score Head, Noul Head) |
| Parámetros totales | 110.521.357 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa secuencias de 64 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible (la model card declara `language: en`, sin detalle de capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Tamaño del repositorio | 0,4 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura, tal como se describe en la model card y se refleja en el script de ejemplo, consta de un `nn.Embedding` con vocabulario de 32.000 entradas y dimensión `d_model=768`, seguido de un `nn.TransformerEncoder` de 12 capas con 12 cabezas de atención, `dim_feedforward=3072` y activación GELU. Sobre la representación pooled (adaptive average pooling sobre la secuencia) se aplican tres cabezas MLP independientes: Choice Head (768 → 384 → `num_choices`, por defecto 10), Score Head (768 → 384 → 1) y Noul Head (768 → 384 → 2). El paso forward devuelve `choice_logits`, `scores` y `noul_logits`.

El modelo es explícitamente no autorregresivo: no hay decodificación secuencial ni máscara causal, sino una codificación bidireccional del estado del problema. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni de técnicas de alineación. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La etiqueta `custom-architecture` del repositorio confirma que no sigue una familia estándar (Llama, GPT, etc.) y requiere definir la clase PyTorch manualmente antes de cargar los pesos.

## Capacidades

- Puntuación de acciones candidatas en problemas de routing (Choice Head), útil para seleccionar el siguiente nodo a visitar.
- Estimación de utilidad o coste de un estado (Score Head), orientada a evaluar el impacto en distancia total.
- Validación de restricciones lógicas binarias (Noul Head), como el cumplimiento de la capacidad del vehículo.
- Procesamiento bidireccional del estado completo del problema en una sola pasada, sin generación secuencial.
- Enfoque específico en CVRP; no se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión o audio.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; la model card solo declara `language: en`.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Optimización de rutas de reparto (CVRP): el modelo puede puntuar nodos candidatos y validar restricciones de capacidad en cada paso de una heurística constructiva, sustituyendo o complementando reglas greedy en un solver de rutas de última milla.
- Planificación de flotas con restricciones de carga: la Noul Head permite descartar acciones que violan la capacidad del vehículo antes de ejecutarlas, reduciendo reparaciones posteriores en el pipeline de planificación.
- Evaluación de estados en búsqueda local: la Score Head estima el coste esperado de un estado, lo que permite priorizar vecinos en algoritmos de búsqueda (2-opt, relocate) sin recalcular la ruta completa.
- Generación de soluciones iniciales: combinada con una política de selección sobre `choice_logits`, puede producir soluciones factibles de partida para metaheurísticas como LNS o tabu search en instancias logísticas.
- Investigación en learning-to-optimize: sirve como banco de pruebas para estudiar arquitecturas no autorregresivas aplicadas a problemas combinatorios, dado su tamaño reducido (0,4 GB) y su código de carga explícito.
- Prototipado de validadores de restricciones: la Noul Head puede reutilizarse como clasificador binario de factibilidad en pipelines de verificación de rutas antes de enviar planes a producción.
- Integración en entornos con recursos limitados: sus 110 M de parámetros permiten ejecución en CPU o GPU consumer para experimentación, aunque no hay datos de latencia ni throughput publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 110,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,44 GB y en fp16 unos 0,22 GB, a lo que hay que sumar activaciones y overhead del runtime.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 2 GB de VRAM debería poder alojar los pesos, pero no hay validación publicada.
- Compatibilidad con GPU consumer: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090, etc.), aunque no está documentado ni verificado por el autor.
- Opciones de despliegue: no compatible con `AutoModelForCausalLM` ni con pipelines estándar de `transformers`; requiere definir la clase `ApolloLaikan100M` en PyTorch y cargar el safetensors con `safetensors.torch.load_file`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apollo Laikan 100M | 110,5 M | no disponible | Transformer bidireccional para CVRP | no disponible | Hugging Face, 0 descargas |
| Modelos de routing con RL (p. ej. familias tipo POMO/AM) | variable | no aplica | Policy gradient sobre secuencias | habitualmente MIT/Apache | Repositorios de investigación |
| LLM pequeños (~100 M) tipo GPT-2 small | ~124 M | 1.024 tokens | Generación de texto autorregresiva | MIT | Amplia |

La comparación directa es difícil porque Apollo Laikan 100M no es un LLM: compite con solvers neuronales de routing, no con modelos de lenguaje. No se dispone de benchmarks que permitan situarlo frente a alternativas de su categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad de solución ni de comparación con solvers clásicos (OR-Tools, LKH) o neuronales.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de integrarlo en producción.
- Documentación mínima: sin idiomas, pipeline, dataset de entrenamiento ni detalles de preprocesado; el script de ejemplo usa entradas aleatorias y no especifica el formato real de las secuencias de routing.
- Arquitectura personalizada: no es compatible con `transformers`, lo que complica el despliegue, el versionado y la integración con herramientas estándar (vLLM, TGI, Ollama).
- Riesgo de sobreajuste al dominio CVRP: no se documenta generalización a otras variantes (VRPTW, pickup and delivery) ni a otros dominios combinatorios.
- Riesgo de alucinación en sentido amplio: las cabezas pueden producir puntuaciones o validaciones incorrectas sin garantías formales de factibilidad; la Noul Head es un clasificador, no un verificador exacto.
- Sesgos: no evaluables por falta de información sobre los datos de entrenamiento.
- Contexto: el ejemplo usa secuencias de 64 tokens; se desconoce el máximo soportado y el comportamiento con instancias grandes.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-09), sin señales de mantenimiento ni comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Inserloft-AI/Apollo-Laikan-100M
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
