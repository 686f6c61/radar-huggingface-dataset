# sandeep123/stride-qwen3-1.7b-allref-correctonly-kl0-local-positive-20260925-resume

## Resumen

STRIDE Qwen3-1.7B — all-reference local-positive es un adaptador LoRA de investigación publicado por el usuario `sandeep123` sobre el modelo base denso Qwen/Qwen3-1.7B. No es un modelo completo: se distribuye como adaptador PEFT (rank 16, alpha 32) que debe cargarse junto a los pesos originales de Qwen3-1.7B. Su propósito declarado es el razonamiento matemático mediante aprendizaje por refuerzo con una variante del método STRIDE, que añade un bonus de diversidad sobre las trayectorias correctas generadas en cada prompt.

El entrenamiento se realizó con 2.048 ejemplos durante 4 épocas (128 actualizaciones globales), con 8 rollouts por prompt, batch global de 64 prompts, learning rate 2e-5, coeficiente KL igual a 0 y peso del bonus STRIDE igual a 1. La configuración es deliberadamente ablativa: se busca medir el efecto del bonus de diversidad calculado sobre las ocho trayectorias («all-reference») y aplicado únicamente a las correctas («correct-only»), manteniendo la señal GRPO estándar para las incorrectas. El hardware de entrenamiento fue una AMD Instinct MI210.

Es relevante ahora porque ejemplifica una línea de trabajo activa en IA abierta: adaptadores pequeños, reproducibles y con registro de completitud (manifiesto SHA-256) para estudiar cómo las señales auxiliares de diversidad afectan al razonamiento matemático en modelos de menos de 2.000 millones de parámetros. El repositorio tiene 0 descargas y 0 likes, y no incluye resultados de evaluación publicados, por lo que debe tratarse como material de investigación y no como artefacto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso decoder-only (Qwen3) con atención GQA. El adaptador modifica las proyecciones q/k/v/o y gate/up/down |
| Parametros totales | 1,7 mil millones en el modelo base (Qwen3-1.7B); el adaptador añade aproximadamente 17,4 millones de parámetros entrenables (estimación calculada a partir de rank 16 y los módulos objetivo declarados; no confirmada por el autor) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No especificada en la ficha del adaptador. El modelo base Qwen3-1.7B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN según su documentación |
| Tipos de cuantizacion | No declarados. El adaptador se distribuye en safetensors (puede fusionarse con el base y convertirse a GGUF, GPTQ, AWQ o bitsandbytes) |
| Idiomas soportados | No disponible en la ficha del adaptador. El modelo base Qwen3 declara soporte multilingüe, pero el adaptador solo fue entrenado para razonamiento matemático |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, subcarpeta `checkpoint-000128`). El repositorio ocupa 5,5 GB, tamaño muy superior al de un adaptador de este rango, lo que sugiere la inclusión de estados de optimizador, checkpoints intermedios o registros de entrenamiento |
| Modelo base | Qwen/Qwen3-1.7B |
| Libreria | peft |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-09-25 (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only denso con Grouped Query Attention y modos de razonamiento explícito (thinking) activables mediante plantilla de chat. La intervención LoRA cubre las proyecciones de atención q, k, v y o, además de las proyecciones MLP gate, up y down, con rank 16, alpha 32 y dropout 0, semilla 42. El autor indica que tanto el entrenamiento como la evaluación se realizaron con el modo thinking desactivado (`enable_thinking=False`), lo que define el régimen de uso previsto.

El procedimiento de entrenamiento sigue un esquema de RL tipo GRPO con una modificación denominada STRIDE. Cada prompt genera ocho rollouts; la novedad de cada paso se calcula contra los pasos elegibles de las ocho trayectorias, incluyendo tanto las correctas como las incorrectas (variante «all-reference»). El bonus auxiliar de diversidad STRIDE se aplica solo a las trayectorias correctas (variante «correct-only»), mientras que las incorrectas conservan su señal ordinaria de resultado/GRPO. La asignación de pasos es «local-positive». Los hiperparámetros restantes son: 2.048 ejemplos de entrenamiento, 4 épocas, 128 actualizaciones finales, batch global de prompts de 64, learning rate 2e-5, 10 pasos de warmup y coeficiente KL de 0 (sin anclaje al modelo de referencia). El autor no documenta la composición exacta del dataset ni el número de tokens vistos.

## Capacidades

- Generación de texto autoregresiva sobre el modelo base Qwen3-1.7B, con la plantilla de chat de Qwen y `enable_thinking=False`.
- Razonamiento matemático: es la única capacidad para la que el adaptador fue entrenado explícitamente, según los tags `mathematical-reasoning` y `reinforcement-learning`.
- Generación de cadenas de razonamiento paso a paso derivadas de la política entrenada con GRPO más el bonus de diversidad STRIDE.
- Producción de soluciones diversas ante un mismo problema, efecto buscado por la señal auxiliar de novedad sobre múltiples rollouts.
- Herencia de las capacidades del modelo base (comprensión lectora, generación general, multilingüismo), aunque sin garantía de que el ajuste no las haya degradado.
- No se declara soporte de tool calling, function calling, uso de agentes, visión, audio ni modo thinking en el adaptador.
- No se declara explícitamente soporte multilingüe del adaptador; el modelo base es multilingüe por diseño.

## Casos de uso

- Investigación en aprendizaje por refuerzo para razonamiento: reproducir el experimento STRIDE con la configuración exacta declarada (rank 16, KL 0, bonus 1, 8 rollouts) para medir el efecto del bonus de diversidad frente a GRPO puro en un modelo de 1,7B.
- Estudios de ablación sobre asignación de bonus: comparar la variante «all-reference correct-only local-positive» con otras variantes del mismo autor o con entrenamientos propios, manteniendo fijos el dataset de 2.048 ejemplos y la semilla 42.
- Generación de datos sintéticos matemáticos: usar el adaptador para producir múltiples soluciones candidatas por problema, que luego pueden filtrarse por verificación simbólica y reutilizarse en pipelines de destilación o SFT.
- Análisis de diversidad de políticas: dado que el bonus premia la novedad entre rollouts, el adaptador es adecuado para estudiar la varianza de las trayectorias generadas y su relación con la tasa de acierto.
- Base para ajuste posterior con SFT o DPO: al ser un adaptador PEFT sobre Apache-2.0, puede fusionarse y servir como punto de partida para experimentos de alineación en dominios matemáticos.
- Docencia e investigación académica: sirve como ejemplo didáctico de cómo se documenta un experimento de RL con LoRA, incluido el manifiesto SHA-256 y el registro de finalización del entrenamiento.
- Pruebas de infraestructura en hardware AMD: el entrenamiento se hizo en una Instinct MI210, por lo que el adaptador es un caso de referencia útil para validar stacks ROCm en cargas de RL de modelos pequeños.
- No se recomienda su uso en atención al cliente, agentes autónomos, código en producción ni aplicaciones orientadas a usuarios finales, porque el autor restringe explícitamente su alcance a la investigación en razonamiento matemático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de exactitud matemática (GSM8K, MATH, AIME u otras), ni curvas de entrenamiento, ni comparaciones cuantitativas frente a GRPO estándar. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16 con el modelo base fusionado: aproximadamente 3,4 GB de pesos y unos 0,11 MB de caché KV por token (estimación calculada con 28 capas, 8 cabezas KV y dimensión 128; no confirmada por el autor). Con 8.000 tokens de contexto, el total ronda los 4,3 GB; con 32.768 tokens, unos 7 GB.
- Cuantización de 8 bits: aproximadamente 1,8-2,0 GB de pesos más caché KV.
- Cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 1,1-1,2 GB de pesos más caché KV.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, así como en Apple Silicon con memoria unificada y en CPU con llama.cpp para cuantizaciones de 4 bits.
- GPU de datacenter (A100, H100, MI210/MI300) no son necesarias para inferencia, pero el autor usó una AMD Instinct MI210 para el entrenamiento, lo que implica ROCm.
- Opciones de despliegue: `transformers` + `peft` (requiere cargar el base y el adaptador), vLLM con soporte LoRA, TGI, llama.cpp y Ollama (en estos dos últimos es necesario fusionar el adaptador y convertir a GGUF), además de cualquier stack compatible con safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STRIDE Qwen3-1.7B (este adaptador) | 1,7B base + ~17,4M de adaptador (estimado) | No declarado; 32.768 tokens según el base | Adaptador LoRA de RL para razonamiento matemático | Apache-2.0 | HuggingFace, 0 descargas, sin benchmarks publicados |
| Qwen/Qwen3-1.7B (base) | 1,7B | 32.768 tokens nativos, 131.072 con YaRN | Modelo denso con modos thinking/no-thinking | Apache-2.0 | Ampliamente desplegado; soporte nativo en vLLM, llama.cpp y Ollama |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32.768 tokens | Destilado de razonamiento sobre Qwen2.5 | MIT | Muy desplegado; benchmarks de matemáticas publicados por el autor |
| meta-llama/Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Modelo instructivo generalista | Licencia comunitaria de Llama 3.2 | Ampliamente desplegado; requiere aceptar la licencia |

La comparación cuantitativa de rendimiento no es posible porque este adaptador no publica métricas. Frente a los alternativos, su rasgo diferencial no es el rendimiento sino la reproducibilidad del experimento de RL y la licencia Apache-2.0 sin restricciones adicionales.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo autónomo: requiere descargar Qwen/Qwen3-1.7B y cargarlo con PEFT. No funciona por sí solo.
- El propio autor indica que no ha sido validado para despliegue general y que solo fue entrenado sobre la base Qwen3-1.7B declarada.
- Entrenado con el modo thinking desactivado; usarlo con `enable_thinking=True` probablemente degrade el comportamiento respecto al régimen para el que fue ajustado.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad. Al heredar el modelo base, arrastra sus sesgos sin mitigación adicional.
- Alucinación: el entrenamiento con coeficiente KL igual a 0 y sin anclaje al modelo de referencia aumenta el riesgo de deriva respecto a la distribución original; no se aportan mediciones de este efecto.
- Alcance limitado al razonamiento matemático; no hay evidencia de mejora en otras tareas y podría haber degradación por sobreajuste a 2.048 ejemplos durante 4 épocas.
- Dataset no documentado: se desconoce la composición, la procedencia y las licencias de los 2.048 ejemplos de entrenamiento, lo que dificulta evaluar riesgos de contaminación de benchmarks.
- Idiomas: no se declara ningún conjunto de idiomas soportados para el adaptador.
- Ausencia de benchmarks: no hay ninguna métrica publicada, por lo que no es posible verificar que el método STRIDE mejore sobre GRPO puro ni comparar con alternativas.
- El repositorio ocupa 5,5 GB, un tamaño anómalo para un adaptador de rank 16; conviene revisar qué contiene antes de descargarlo en entornos con espacio o ancho de banda limitados.
- Licencia Apache-2.0 en el adaptador: permite uso comercial, pero el modelo base Qwen3-1.7B también es Apache-2.0, por lo que no hay restricciones heredadas adicionales. Aun así, la falta de evaluación hace desaconsejable su uso en producción.
- La fecha de publicación del repositorio (2026-09-25) es posterior al conocimiento de referencia habitual; verificar que los archivos y el manifiesto SHA-256 son los esperados.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-1.7b-allref-correctonly-kl0-local-positive-20260925-resume
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper del método STRIDE: no disponible
- Repositorio de código del método: no disponible
- Demo o espacio de inferencia: no disponible
- Resultados de benchmarks: no disponible
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron ningún resultado relevante sobre este modelo, el método STRIDE ni el autor; los enlaces obtenidos (SourceForge, foros de MacRumors y OpenCFU) no guardan relación con el modelo y se omiten.
