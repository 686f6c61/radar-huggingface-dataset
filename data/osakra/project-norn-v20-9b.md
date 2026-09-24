# Osakra/Project-Norn-V20-9B

## Resumen

Project Norn V20-9B es un modelo de generación de texto desarrollado por Osakra Research, un esfuerzo de investigación independiente centrado en dinámicas latentes, recurrencia y arquitecturas vector-simbólicas aplicadas a modelos compactos. El modelo se presenta como la culminación de la línea Norn (V15 a V19) y su propuesta central es integrar memoria neural a largo plazo de tipo Titans y representaciones holográficas reducidas (HRR) dentro del propio stream residual del transformer, eliminando el "wrapper" externo y los sidecars que usaban las versiones anteriores.

La arquitectura combina atención de ventana deslizante intercalada con un mecanismo de memoria que traslada el producto matricial cuadrático a convoluciones circulares complejas en el dominio de Fourier, ejecutadas mediante un kernel fusionado de OpenAI Triton. Según la model card, esto reduce el coste de parámetros de memoria de O(D²) a O(D) y el cómputo a O(D log D). Se distribuye como fine-tune del backbone empero-ai/Qwen3.8-9B-Distill, con licencia Apache 2.0 y pesos en safetensors y GGUF.

El modelo es relevante porque apunta a un nicho concreto: razonamiento simbólico, matemático y relacional estricto en hardware de consumo. La model card declara una puntuación compuesta del 91,40 % en un benchmark propio de 1.000 preguntas ejecutado en una única GPU de portátil (RTX 4070 Laptop) con menos de 5,8 GB de VRAM activa, además de un proyector de visión SigLIP en GGUF F16. Conviene tratar todas estas cifras como autoinformadas por el autor, ya que el repositorio no incluye validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención de ventana deslizante intercalada + memoria neural a largo plazo tipo Titans integrada en el stream residual, con representaciones holográficas reducidas (HRR) en dominio de Fourier complejo y kernel fusionado de OpenAI Triton |
| Parametros totales | 5.358.218.514 (5,36 B) según los pesos safetensors publicados; la model card declara "9.55B Unified Titan" (discrepancia no aclarada) |
| Parametros activos | No es un modelo MoE según la información disponible; la model card usa la etiqueta "9.55B Unified Titan" sin detallar un esquema de expertos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (se menciona el proyector de visión en F16); no se detallan otros niveles de cuantización |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Modelo base | empero-ai/Qwen3.8-9B-Distill |
| Libreria | transformers (custom_code) |
| Tamano del repositorio | 10,9 GB |

## Arquitectura y entrenamiento

La propuesta arquitectónica de Norn V20 es una síntesis de tres piezas. En primer lugar, atención de ventana deslizante intercalada, que limita el coste por token a un vecindario local. En segundo lugar, memoria neural a largo plazo inspirada en Titans, que actúa como memoria de trabajo persistente dentro del modelo en lugar de depender de un proceso auxiliar. En tercer lugar, representaciones holográficas reducidas sobre una variedad de Fourier compleja unitaria, que codifican relaciones mediante convoluciones circulares en el dominio de la frecuencia. El resultado declarado es una reducción de más de 1.000x en el coste de parámetros de memoria (de O(D²) a O(D)) y de O(D²) a O(D log D) en cómputo.

El punto diferencial respecto a las iteraciones V15-V19 es la eliminación del wrapper externo: en esas versiones la memoria vivía fuera del stream residual, las mutaciones requerían directivas textuales explícitas del tipo `<remember>...</remember>` y la inferencia necesitaba coordinación multiproceso. V20 integra todo ello de forma end-to-end diferenciable. La ejecución del mecanismo holográfico se delega a un kernel Triton personalizado con register fusion, lo que permite el despliegue en una sola GPU de consumo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card tampoco detalla el procedimiento exacto de destilación desde el backbone Qwen3.8-9B-Distill ni la receta de entrenamiento del proyector de visión, más allá de indicar que usa un alineamiento por entropía cruzada sobre la variedad de vocabulario directa, resolución del desajuste de tokenización del prefijo de espacio BPE y regulación estricta de norma L2.

## Capacidades

- Generación de texto conversacional en inglés sobre el backbone destilado Qwen3.8-9B-Distill.
- Razonamiento multi-paso orientado a matemáticas y algoritmia, con énfasis declarado en conteo combinatorio, contrafactuales físicos y deducción relacional.
- Cumplimiento de restricciones negativas (instrucciones del tipo "no hagas X") y recuperación de errores en vuelo durante la deliberación.
- Razonamiento sobre grafos y deducción de parentesco relacional, según los resultados del benchmark propio del autor.
- Generación de código, según las etiquetas del repositorio (code, agentic).
- Memoria latente de largo plazo integrada, sin necesidad de sidecars externos ni directivas textuales de memoria.
- Capacidades de agente y razonamiento multi-paso, según las etiquetas agentic y reasoning del repositorio.
- Visión nativa y anclaje espacial mediante un proyector SigLIP distribuido como `mmproj-norn-v20-f16.gguf`; la model card declara un 100 % de precisión Top-1 en conceptos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Modo de pensamiento explícito (thinking mode): no disponible como opción documentada, aunque el autor describe un mecanismo de CoT latente continuo.

## Casos de uso

- Razonamiento matemático asistido: el modelo está optimizado para problemas de combinatoria y aritmética multi-paso, de modo que puede emplearse como solucionador local en entornos educativos o de investigación donde no se quiera enviar datos a APIs externas.
- Verificación de restricciones en pipelines de generación: su énfasis declarado en restricciones negativas lo hace adecuado para validar que una salida generada no viole reglas explícitas (por ejemplo, "no mencionar datos personales"), integrándose como paso de control de calidad.
- Deducción sobre grafos de conocimiento: las pruebas de teoría de grafos y parentesco relacional sugieren su uso para resolver consultas de relaciones transitivas en bases de datos estructuradas convertidas a lenguaje natural.
- Agentes locales en hardware de consumo: con menos de 5,8 GB de VRAM activa declarada, puede ejecutar bucles de razonamiento multi-paso en portátiles con GPU dedicada, útil para prototipos de agentes sin coste de nube.
- Asistencia a la programación en local: al derivar de Qwen3.8-9B-Distill y declarar la etiqueta code, puede integrarse en editores como generador de fragmentos y explicaciones en un flujo de trabajo offline.
- Análisis de documentos con componente visual: el proyector SigLIP permite procesar capturas, diagramas o formularios escaneados y responder preguntas sobre su contenido en herramientas tipo Ollama o interfaces GUI locales.
- Investigación en arquitecturas de memoria latente: dado que el repositorio incluye kernels Triton y una arquitectura HRR/Titans integrada, sirve como banco de pruebas reproducible para estudiar memoria neural sin wrappers externos.
- Evaluación de razonamiento neuro-simbólico: útil como baseline en estudios comparativos sobre representaciones distribuidas para invariantes relacionales, siempre que se revaliden los resultados del autor.

## Benchmarks y rendimiento

Los siguientes datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

| Benchmark | Project Norn V20 | Referencia declarada |
|---|---|---|
| Benchmark propio de 1.000 preguntas (compuesto) | 91,40 % (914/1.000) | Norn V18: 73,00 %; Norn V19: 80,20 % |
| Contrafactuales físicos | 100,0 % (100/100) | No disponible |
| Combinatoria | 100,0 % (50/50) | No disponible |
| Restricciones negativas | 100,0 % (100/100) | No disponible |
| Deducción de parentesco relacional | 100,0 % (50/50) | No disponible |
| Teoría de grafos relacional | 100,0 % (100/100) | No disponible |
| Matriz de 34 benchmarks (9 dominios, promedio global) | 68,3 % | Qwen3.8-27B: 67,7 %; Claude 3.5 Haiku: 61,3 % |
| Precisión Top-1 de conceptos del proyector de visión | 100,00 % | No disponible |

No se han publicado resultados de benchmarks estándar independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM declarada en la model card: menos de 5,8 GB activos con offload completo a GPU.
- GPU utilizada en la evaluación del autor: NVIDIA GeForce RTX 4070 Laptop GPU.
- Cabe en GPU de consumo: sí, según los datos del autor, en tarjetas con al menos 6-8 GB de VRAM (RTX 3060, 4060, 4070 y superiores).
- GPU de centro de datos (A100, H100): compatibles por VRAM de sobra, pero sin datos de throughput publicados para estos aceleradores.
- Opciones de despliegue mencionadas: Ollama (con el proyector `mmproj-norn-v20-f16.gguf`), llama.cpp vía GGUF, transformers con `custom_code` y kernels Triton propios.
- Otras opciones (vLLM, TGI): no disponibles; el uso de kernels Triton personalizados y de `custom_code` puede requerir parches específicos para servidores de inferencia convencionales.
- Latencia y throughput estimados: no disponibles. Solo se indica que la evaluación se ejecutó localmente en un portátil, sin cifras de tokens por segundo.
- Requisitos adicionales: el repositorio ocupa 10,9 GB, por lo que se recomienda espacio en disco suficiente para pesos safetensors y GGUF simultáneos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Project Norn V20-9B | 5,36 B (safetensors) | No disponible | 91,40 % en benchmark propio; 68,3 % en matriz de 34 benchmarks | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Qwen3.8-27B (referencia del autor) | 27 B (aproximado, no confirmado en la información) | No disponible | 67,7 % en matriz de 34 benchmarks | No disponible | No disponible en la información |
| Claude 3.5 Haiku (referencia del autor) | No disponible (modelo propietario) | No disponible | 61,3 % en matriz de 34 benchmarks | Propietaria | Solo API |
| Project Norn V18-9B | No disponible | No disponible | 73,00 % en benchmark propio de 1.000 preguntas | No disponible | HuggingFace |
| empero-ai/Qwen3.8-9B-Distill (modelo base) | No disponible | No disponible | No disponible | No disponible | HuggingFace |

Las comparaciones proceden de la propia model card del autor y no de evaluaciones de terceros. Los porcentajes de Norn V20, V18, V19, Qwen3.8-27B y Claude 3.5 Haiku no son directamente equiparables entre sí salvo en el benchmark propio de 1.000 preguntas.

## Limitaciones y advertencias

- Todas las métricas de rendimiento son autoinformadas por el autor y se basan en benchmarks propios; no se ha publicado validación externa ni reproducibilidad por terceros.
- Existe una discrepancia entre el nombre del modelo ("9B"), la etiqueta de la model card ("9.55B Unified Titan") y el recuento real de parámetros en safetensors (5.358.218.514). Conviene verificar el tamaño efectivo antes de planificar el despliegue.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de funcionamiento en producción.
- La longitud de contexto no está documentada, lo que impide planificar casos de uso con ventanas largas o evaluar el beneficio real de la atención de ventana deslizante.
- Solo se declara soporte de inglés. No hay información sobre comportamiento en castellano u otros idiomas, por lo que su uso multilingüe no está garantizado.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos compactos destilados suelen mostrar degradación en dominios fuera de su distribución de entrenamiento.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgos demográficos, políticos o culturales.
- La precisión de los benchmarks en tareas contrafactuales y de restricciones negativas (100 %) procede de conjuntos con 50 o 100 ejemplos, lo que implica intervalos de confianza amplios y no permite extrapolar a producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al derivar de empero-ai/Qwen3.8-9B-Distill conviene revisar las condiciones de ese modelo base, que no se detallan en la información proporcionada.
- El modelo usa `custom_code` y kernels Triton propios, lo que puede complicar la integración con servidores de inferencia estándar y aumentar la superficie de mantenimiento.
- La fecha de creación del repositorio (23 de septiembre de 2026) es posterior a la fecha habitual de consulta y el release es muy reciente, por lo que puede contener errores no corregidos.
- El proyector de visión se distribuye en GGUF F16; no se documentan versiones cuantizadas ni su comportamiento fuera de las interfaces soportadas (Ollama, DeepSeek Harness).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Osakra/Project-Norn-V20-9B
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Perfil del autor en HuggingFace: https://huggingface.co/Osakra
- Project Norn V18-9B: https://huggingface.co/Osakra/Project-Norn-V18-9B
- Repositorio de OpenAI Triton: https://github.com/openai/triton
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2412.20311
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2004.05150
- Norn Global Advisory (organización distinta, mencionada en los resultados de búsqueda): https://norn.ai/
- Comparativa de modelos abiertos de Artificial Analysis: https://artificialanalysis.ai/models/open-source
- Modelos abiertos de OpenAI: https://openai.com/open-models/
