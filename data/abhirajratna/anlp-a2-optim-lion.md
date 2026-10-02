# abhirajratna/anlp-a2-optim-lion

## Resumen

El modelo `abhirajratna/anlp-a2-optim-lion` es un decodificador transformer denso de 33.563.136 parámetros, entrenado desde cero para predicción del siguiente token sobre una única pasada del split de entrenamiento del corpus `browndw/human-ai-parallel-corpus`. Lo publica el usuario de HuggingFace abhirajratna como entregable de la asignatura ANLP (Advanced Natural Language Processing), y su interés no reside en la calidad del modelo resultante sino en el objeto de estudio: comparar el comportamiento del optimizador Lion, implementado desde cero, frente a alternativas en un mismo presupuesto de cómputo.

Arquitectónicamente se trata de la "variante v1" descrita en la model card: 8 capas, dimensión de modelo (`d_model`) de 512, 8 cabezas de atención y un MLP de 2 capas con dimensión oculta 2048. El entrenamiento consumió 39.038.976 tokens, con un pico de learning rate de 0,0002, y alcanzó una pérdida final de validación de 3,7281 junto con un BLEU de test de 4,04 medido sobre continuaciones de 64 tokens con 7 referencias.

Es relevante ahora únicamente en el contexto de investigación y docencia sobre optimizadores y en experimentos de escalado a pequeña escala: no es un modelo apto para producción, no tiene licencia declarada y no se ha publicado información sobre ventana de contexto, tokenizador, composición del dataset ni evaluaciones estandarizadas. Su valor es el de un artefacto reproducible de bajo coste (aproximadamente 0,1 GB de repositorio) para estudiar dinámicas de optimización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (solo decodificador, entrenamiento causal para predicción del siguiente token) |
| Parametros totales | 33.563.136 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin versiones GGUF ni cuantizadas |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con código PyTorch asociado en el repositorio) |

Datos adicionales de configuración declarados por el autor: 8 capas, `d_model` 512, 8 cabezas de atención, MLP de 2 capas con dimensión 2048. El repositorio ocupa 0,1 GB; dado el número de parámetros, el tamaño es coherente con pesos en precisión de 32 bits (aproximadamente 134 MB), aunque la model card no declara explícitamente la precisión de almacenamiento.

## Arquitectura y entrenamiento

Se trata de un transformer decoder denso estándar, sin mecanismos híbridos ni atención lineal: 8 capas, `d_model` 512, 8 cabezas de atención (64 dimensiones por cabeza) y un MLP de 2 capas con dimensión oculta 2048. No hay información publicada sobre el mecanismo de codificación posicional, el tamaño del vocabulario, la función de activación, si se aplica weight tying entre embeddings y cabeza de salida, ni sobre el uso de dropout o normalización.

El entrenamiento consistió en una única pasada ("one pass") sobre el split de entrenamiento de `browndw/human-ai-parallel-corpus`, con 39.038.976 tokens procesados frente a los 39.047.168 tokens del dataset completo (cobertura del 99,98 %). El pico de learning rate fue de 0,0002. La innovación técnica declarada es el uso de un optimizador Lion implementado desde cero, y el propósito del artefacto es la comparación de optimizadores. No se menciona ningún uso de RLHF, DPO, SFT posterior ni decodificación especulativa. El resultado final es una pérdida de validación de 3,7281 y un BLEU de test de 4,04 calculado sobre continuaciones de 64 tokens evaluadas contra 7 referencias; el BLEU es muy bajo incluso para un modelo de este tamaño, lo que sugiere un ajuste limitado y una distribución de datos de naturaleza paralela humano-IA.

## Capacidades

- Generación de texto autoregresiva en inglés: continuaciones cortas de contexto, condicionadas por el prompt.
- Predicción del siguiente token, tarea para la que fue entrenado explícitamente.
- Continuación de texto con métrica BLEU medida sobre ventanas de 64 tokens, lo que indica que el modelo funciona razonablemente bien en horizontes muy cortos.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: limitada al inglés (`language: [en]`); no se declaran otros idiomas.
- No consta modo de razonamiento extendido (thinking mode), visión, audio ni ninguna otra modalidad.
- No consta capacidad de seguimiento de instrucciones: el entrenamiento descrito es de modelado de lenguaje puro, sin fase de ajuste por instrucciones.

## Casos de uso

- Comparación de optimizadores en investigación: el modelo permite reproducir un experimento controlado Lion frente a AdamW u otros optimizadores con un coste de cómputo mínimo, evaluando la pérdida de validación por paso y la estabilidad del entrenamiento a learning rates bajos.
- Docencia y prácticas de NLP: sirve como ejemplo completo y de tamaño manejable de un pipeline de entrenamiento de un transformer decoder desde cero, incluyendo tokenización, bucle de entrenamiento y evaluación con BLEU.
- Ablaciones arquitectónicas reproducibles: dado su tamaño (33,6 M de parámetros) y sus 8 capas, es viable entrenar múltiples variantes en una única GPU de consumo para estudiar el efecto de cambios en `d_model`, número de cabezas o profundidad del MLP.
- Pruebas de infraestructura y CI de MLOps: el modelo es suficientemente pequeño para usarse como "modelo de humo" en pipelines de empaquetado, versionado de pesos, despliegue de endpoints y tests de regresión sin consumir recursos relevantes.
- Benchmarking de rendimiento de frameworks: se puede emplear para medir latencia y throughput relativos entre bibliotecas de inferencia (PyTorch eager, TorchScript, ONNX Runtime) en hardware modesto, aislando el efecto del framework del de un modelo grande.
- Evaluación de técnicas de decodificación: al ser un modelo pequeño con pérdida alta, resulta útil para comparar estrategias de sampling (greedy, top-k, nucleus, beam search) y observar cómo cambia la diversidad de las continuaciones sin el coste de un modelo grande.
- Estudio de corpus paralelos humano-IA: permite analizar qué aprende el modelo de un corpus de pares humano-IA en una sola época y cómo se refleja en la perplejidad por token.

## Benchmarks y rendimiento

| Metrica | Valor | Detalles |
|---|---|---|
| Pérdida final de validación | 3,7281 | Sobre el split de validación del corpus de entrenamiento |
| BLEU de test | 4,04 | Continuaciones de 64 tokens, 7 referencias |
| Tokens de entrenamiento | 39.038.976 | Una pasada sobre el split de entrenamiento (dataset: 39.047.168 tokens) |
| MMLU | no disponible | No evaluado |
| HumanEval | no disponible | No evaluado |
| GSM8K | no disponible | No evaluado |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones de rendimiento contra otros optimizadores, que era el objetivo declarado del experimento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 134 MB si los pesos están en fp32 (inferido del tamaño del repositorio y del número de parámetros); alrededor de 67 MB en fp16/bf16 y de 34 MB en int8 si se convirtieran manualmente. El overhead de activaciones es despreciable por el tamaño del modelo.
- GPU recomendadas: cualquiera; el modelo cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso en GPUs integradas o en CPU.
- Cabe en consumer GPU: sí, sin ninguna restricción práctica. También es viable la inferencia en CPU, en una Raspberry Pi o en dispositivos embebidos con memoria suficiente.
- Opciones de despliegue: no hay soporte nativo conocido en vLLM, llama.cpp, Ollama, TGI ni en formatos GGUF. La carga declarada por el autor requiere el código del propio repositorio (`sys.path.insert(0, 'code')` y `from part1.model import load_pretrained`), lo que implica usar PyTorch y una implementación a medida. No existen pesos cuantizados publicados.
- Latencia y throughput estimados: no disponible. No se han publicado medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con otros modelos y no hay benchmarks estandarizados que permitan situarlo en una escala de calidad. A modo de referencia de categoría, se incluyen modelos pequeños de dominio público, con la advertencia de que sus cifras provienen de documentación pública y no de la información suministrada, y de que no existe una comparación de rendimiento directa:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| abhirajratna/anlp-a2-optim-lion | 33,6 M | no disponible | no disponible | HuggingFace, pesos safetensors |
| distilgpt2 | 82 M | 1024 | MIT (según documentación pública) | HuggingFace, transformers |
| Pythia-70M | 70 M | 2048 | Apache 2.0 (según documentación pública) | HuggingFace, transformers, vLLM |
| GPT-2 small | 124 M | 1024 | Modified MIT (según documentación pública) | HuggingFace, transformers |

Comparación de rendimiento: no disponible. El modelo aquí descrito no publica resultados en ninguno de los benchmarks habituales, por lo que no es posible contrastarlo cuantitativamente con las alternativas anteriores.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ningún análisis de sesgos. El modelo se entrenó sobre un único corpus paralelo humano-IA, por lo que heredará cualquier sesgo presente en ese dataset sin filtrado declarado.
- Riesgo de alucinación: muy alto. Con 33,6 M de parámetros, una única época de entrenamiento y una pérdida de validación de 3,7281, es esperable que el modelo produzca texto incoherente o factualmente incorrecto; no tiene conocimiento factual fiable.
- Limitación de contexto: la longitud de contexto no está declarada, lo que impide planificar su uso en tareas que requieran ventanas largas. Las evaluaciones publicadas se limitan a continuaciones de 64 tokens.
- Limitación de idioma: solo inglés. No se ha entrenado ni evaluado en castellano ni en ningún otro idioma.
- Restricciones de licencia: no se declara licencia. Sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución, por lo que debe considerarse no apto para producción hasta que el autor la especifique.
- Ausencia de ajuste por instrucciones: el modelo es un modelo de lenguaje base; no sigue instrucciones y no está alineado con preferencias humanas.
- Ausencia de soporte de ecosistema: no hay pesos GGUF ni integración con vLLM, llama.cpp, Ollama o TGI, lo que dificulta el despliegue y obliga a usar el código del repositorio.
- Calidad limitada para producción: el BLEU de test de 4,04 sobre continuaciones de 64 tokens con 7 referencias es un valor muy bajo y desaconseja su uso en cualquier aplicación orientada a usuario final.
- Naturaleza académica: es un entregable de asignatura (`anlp-assignment`), con 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento declarado ni versionado posterior.
- Fecha de publicación inusual: los metadatos indican creación el 2026-10-01 y actualización el 2026-10-01; conviene verificar la vigencia del artefacto antes de depender de él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhirajratna/anlp-a2-optim-lion
- Perfil del autor en HuggingFace: https://huggingface.co/abhirajratna
- Directorio de modelos del autor (terceros): https://essamamdani.com/ai-models/company/abhirajratna
- Lista de modelos gratuitos (resultado de búsqueda, no relacionado directamente con este modelo): https://github.com/ClawLabsAI/free-ai-models
- Página de modelos abiertos de OpenAI (resultado de búsqueda, no relacionado con este modelo): https://openai.com/open-models/
- Dataset utilizado: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Paper o blog del optimizador Lion: no disponible en la información proporcionada
- Repositorio de código, demo o espacio asociado: no disponible en la información proporcionada
