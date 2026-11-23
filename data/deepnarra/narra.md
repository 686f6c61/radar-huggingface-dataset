# DeepNarra/Narra

## Resumen

DeepNarra Narra 1.0 es un modelo de generación de texto de muy pequeño tamaño (28,5 millones de parámetros totales) desarrollado por la organización DeepNarra. Se presenta como un modelo de tipo "edge" orientado a inferencia soberana en hardware modesto, con una arquitectura poco convencional que combina atención lineal con compuertas por bloques (Gated Linear Attention, GLA), un mecanismo de estabilización basado en la teoría de Lyapunov y una mezcla de expertos jerárquica (H-MoE) con 92 sub-expertos organizados en 23 macro-ramas y un experto compartido. El modelo declara una ventana de contexto estrictamente fijada en 131.072 tokens (128K).

La propuesta diferencial del modelo es triple: un contexto largo bloqueado y estable, un estado recurrente de memoria constante (O(1)) con serialización declarada de 6 bytes por estado, y una cuantización ternaria nativa BitNet b1.58 en formato TQ1_0 que reduce el peso del GGUF a 5,85 MB. El autor publica una cifra de rendimiento medida de 325,2 tokens por segundo con 49,20 ms de latencia por paso sobre una Tesla T4, así como un recuento exacto de parámetros verificable en safetensors.

Es relevante ahora porque explora un nicho poco poblado: modelos de contexto muy largo con coste de memoria constante y huella de despliegue mínima, lo que interesa a quienes investigan razonamiento latente continuo, decodificación especulativa y despliegue en dispositivos con recursos limitados. La licencia Apache-2.0 facilita su uso comercial, aunque la información pública sobre calidad real del modelo es muy escasa y el repositorio es de reciente creación con métricas de adopción prácticamente nulas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepNarraNarraHMoEForCausalLM: Gated Linear Attention (GLA) por bloques con estabilidad de Lyapunov y H-MoE de 92 sub-expertos |
| Parámetros totales | 28.519.602 (28,5M) |
| Parámetros activos | ~6,2M por token (23 macro-motores × top-2 micro-expertos + experto compartido de base) |
| Longitud de contexto | 131.072 tokens (128K), estrictamente fijada |
| Tipos de cuantización | Ternaria nativa BitNet b1.58 en formato TQ1_0 (1,58 bits por peso); safetensors en precisión completa |
| Idiomas soportados | Inglés y multilingüe (según etiquetas del autor; no se detalla la lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (108,94 MB, 1.330 tensores) y GGUF TQ1_0 (5,85 MB, 1.330 tensores) |

## Arquitectura y entrenamiento

El modelo abandona el transformer denso convencional en favor de una columna vertebral de atención lineal con compuertas (GLA) procesada por bloques, con actualización de estado recurrente del tipo S_t = α_t ⊙ S_{t-1} + K_t^T V_t y salida O_t = Q_t S_t. Esta formulación permite memoria de inferencia constante, independiente de la longitud de contexto. Sobre esa base se aplica una cota de estabilidad de Lyapunov que limita la norma espectral y la energía del estado recurrente (V(S_t) = Tr(S_t^T P S_t) ≤ 100,0), con el objetivo declarado de evitar desbordamientos y deriva del estado a lo largo de los 128K tokens. El estado recurrente se serializa con un pool de flotantes de taper adaptativo de 6 bytes por estado.

La capa de mezcla de expertos es jerárquica: un experto compartido de base actúa como tronco, 23 macro-ramas organizan la computación y 92 micro-expertos especializados se activan con enrutamiento top-2, lo que da los ~6,2M de parámetros activos por token. El autor no detalla el número exacto de tokens de entrenamiento ni la composición cuantitativa del dataset; sí atribuye el entrenamiento a FineWeb-Edu, Aya Collection y CodeFeedback-Filtered-Instruction, además de una corriente sintética de razonamiento procedimental verificada con SymPy y datos de instrucciones de no_robots. No se documenta si hubo RLHF, DPO u otra fase de alineamiento preferencial.

## Capacidades

- Generación de texto autoregresiva con pipeline `text-generation` y compatibilidad declarada con la librería `transformers`.
- Razonamiento latente continuo y retención de documentos largos hasta 131.072 tokens sin degradación por attention sink, según el autor.
- Procesamiento de contexto largo con memoria de inferencia constante, apto para flujos de lectura extensa sin crecimiento del estado.
- Capacidades multilingües declaradas, con inglés como idioma principal y cobertura multilingüe no detallada.
- Razonamiento procedimental matemático derivado de la corriente sintética verificada con SymPy.
- Instrucciones de código, a partir del dataset CodeFeedback-Filtered-Instruction.
- Despliegue en formato ternario nativo TQ1_0 con `Modelfile` incluido para Ollama.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Procesamiento de documentos extensos en el borde: el modelo puede ingerir contratos, informes o expedientes de hasta 128K tokens en un único paso con memoria constante, lo que lo hace adecuado para despliegues en dispositivos con RAM limitada donde un transformer denso de contexto equivalente no cabría.
- Clasificación y extracción de información en corpus largos: con contexto fijado y estado recurrente estable, se puede usar para resumir o etiquetar actas, transcripciones o registros técnicos sin truncar el documento.
- Asistente embebido en aplicaciones de escritorio o móviles: el GGUF ternario de 5,85 MB permite distribuirlo dentro de un binario o paquete de aplicación y ejecutarlo en CPU sin GPU dedicada.
- Investigación en razonamiento latente: sirve como banco de pruebas reproducible para estudiar atención lineal con compuertas, estabilización de Lyapunov y enrutamiento jerárquico de expertos a pequeña escala.
- Generación de código asistida en entornos con restricciones: su entrenamiento sobre CodeFeedback permite integrarlo en editores o pipelines ligeros de autocompletado y sugerencias, aunque la calidad en tareas complejas no está validada públicamente.
- Filtrado y moderación de contenido en streaming: la latencia declarada de 49,20 ms por paso y el bajo coste de memoria permiten procesar flujos continuos de texto en tiempo casi real sobre una única GPU de gama media.
- Prototipado de agentes con contexto persistente: el estado recurrente serializable en 6 bytes facilita guardar y restaurar sesiones largas sin reinyectar todo el historial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara una política de "Zero Fake Scores" y solo publica métricas de ingeniería verificables: 325,2 tokens/s y 49,20 ms de latencia por paso medidos en una Tesla T4, además del recuento exacto de 28.519.602 parámetros y el tamaño de 5,85 MB del GGUF TQ1_0.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantización; el GGUF TQ1_0 ocupa 5,85 MB y el safetensors en precisión completa 108,94 MB, por lo que el modelo cabe holgadamente en memoria unificada de CPU.
- GPU recomendadas: el autor verifica funcionamiento en una Tesla T4; cualquier GPU con al menos 1 GB de memoria libre es suficiente, incluidas GTX 1650, RTX 3050 o superiores.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPU y CPU exclusivamente.
- Opciones de despliegue: Ollama mediante el `Modelfile` incluido, llama.cpp para el GGUF TQ1_0, y carga directa con `safetensors` y `transformers` para inspección o inferencia en precisión completa.
- Latencia y throughput: 325,2 tokens/s y 49,20 ms por paso en Tesla T4, según medición del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepNarra Narra 1.0 | 28,5M totales / ~6,2M activos | 131.072 | Apache-2.0 | safetensors, GGUF TQ1_0 | GLA con Lyapunov y H-MoE de 92 sub-expertos; sin benchmarks públicos |
| Qwen2.5-0.5B | 0,5B | 32.768 | Apache-2.0 | safetensors, GGUF | Transformer denso convencional; benchmarks públicos extensos |
| SmolLM2-135M | 135M | 8.192 | Apache-2.0 | safetensors, GGUF | Transformer denso pequeño orientado a edge; benchmarks publicados |
| BitNet b1.58 2B4T | 2B | 4.096 | MIT | safetensors ternario | Referencia de cuantización ternaria nativa; benchmarks publicados |

La comparativa es aproximada: Narra compite por nicho (contexto largo con memoria constante y huella mínima) más que por calidad absoluta, y a diferencia de las alternativas no ofrece resultados de evaluación pública que permitan situarlo en tareas estándar.

## Limitaciones y advertencias

- Ausencia total de benchmarks públicos: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de contexto largo que permitan validar las capacidades declaradas.
- Con 28,5M de parámetros totales y ~6,2M activos, la capacidad de razonamiento y conocimiento factual será muy limitada en comparación con modelos de cientos de millones o miles de millones de parámetros; no es apto para tareas que exijan conocimiento amplio o razonamiento complejo.
- Riesgo elevado de alucinación y de respuestas incoherentes en dominios no cubiertos por los datos de entrenamiento, dado el tamaño reducido y la falta de documentación sobre el volumen de tokens.
- El contexto está "estrictamente bloqueado" a 131.072 tokens según el autor; no se documenta comportamiento con entradas más cortas ni si el modelo requiere relleno hasta esa longitud, lo que puede afectar al coste y a la calidad en usos conversacionales breves.
- Idiomas: solo se declara inglés y "multilingüe" sin lista concreta; el rendimiento en castellano no está verificado.
- La licencia Apache-2.0 permite uso comercial, pero parte de los datos de atribución (no_robots) está bajo CC-BY-NC-4.0, lo que introduce una posible ambigüedad sobre el uso comercial derivado de ese subconjunto.
- El repositorio tiene 404 descargas, 0 likes y fue creado en octubre de 2026; no hay evidencia de adopción, mantenimiento ni validación por terceros.
- Las afirmaciones sobre estabilidad de Lyapunov, estado recurrente de 6 bytes y velocidad en T4 provienen únicamente del autor y no han sido replicadas de forma independiente.
- No se documenta soporte de tool calling, agentes, visión ni audio; no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepNarra/Narra
- Organización DeepNarra: https://huggingface.co/DeepNarra
- Licencia Apache-2.0: http://www.apache.org/licenses/LICENSE-2.0
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Aya Collection: https://huggingface.co/datasets/CohereForAI/aya_collection
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
