# reaperdoesntknow/Symbiotic-8B

## Resumen

Symbiotic-8B es un modelo de generación de texto derivado de Qwen/Qwen3-8B, publicado por el usuario reaperdoesntknow bajo la marca Convergent Intelligence LLC: Research Division. El autor lo presenta como un modelo híbrido "simbólico-transformer" que combina el backbone de Qwen3-8B con módulos simbólicos adicionales (procesadores LSTM, GNN, proyecciones recurrentes) y un buffer de memoria persistente de 2048 vectores simbólicos. La propuesta declarada es aportar razonamiento simbólico de largo alcance y memoria entre turnos sobre un transformer de 8B parámetros.

El modelo tiene 8.190.735.360 parámetros y se distribuye en formato safetensors y PyTorch (model.bin), con un repositorio de 43,1 GB que incluye además un snapshot de memoria (memory.pt) y tokens especiales adicionales. Está etiquetado únicamente para inglés y no está ajustado por instrucciones según la propia model card, por lo que requiere ingeniería de prompts para uso conversacional.

Es relevante ahora por dos motivos: por un lado, se apoya en Qwen3-8B, una base sólida y ampliamente utilizada; por otro, la model card introduce afirmaciones técnicas (módulos simbólicos, "Dream Mode", marco teórico "Discrepancy Calculus") que no vienen acompañadas de resultados de benchmarks ni de una descripción reproducible del entrenamiento. Conviene tratar el modelo como un fine-tune experimental de Qwen3-8B con artefactos adicionales, no como una arquitectura híbrida validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3-8B) con supuestos módulos simbólicos adicionales según la model card |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors y PyTorch en precisión completa; no hay GGUF ni AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | afl-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors, PyTorch (model.bin), memory.pt |

## Arquitectura y entrenamiento

La model card describe un backbone Qwen-8B de tipo rotary transformer al que se añaden procesadores simbólicos: ThoughtDynamicsLNN (atención LSTM multi-cabeza), CrystallineProcessor (GNN basada en DNAConv), LiquidThoughtProcessor (plegado recurrente de símbolos) y HelicalDNAProcessor (proyección lineal helicoidal), con una dimensión simbólica de 4096 y un buffer de memoria de 2048 vectores en float32 con recuperación consciente de entropía. También menciona un "Dream Mode" de generación offline de cognición simbólica. No se especifica el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia a 0xZee/dataset-CoT-Advanced-Calculus-268), ni si hubo RLHF o DPO.

No hay información verificable sobre el procedimiento de fine-tuning, la congelación de capas, la inicialización de los módulos adicionales ni la integración real de estos en el grafo de Transformers. Dado que el repositorio se carga con `transformers` y `library_name: transformers`, y que el tamaño de pesos coincide con Qwen3-8B, lo más razonable es asumir que se trata de un fine-tune del modelo base con posible código o artefactos auxiliares, sin que la model card documente la arquitectura efectiva de forma reproducible. El marco teórico citado (Discrepancy Calculus, con DOI 10.57967/hf/8194) no aporta detalles de entrenamiento utilizables.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen3-8B.
- Razonamiento simbólico y encadenamiento lógico según la model card (generación de teoremas, pruebas matemáticas), sin validación pública.
- Memoria persistente entre turnos mediante el buffer de 2048 vectores simbólicos (requiere sembrar la memoria activamente).
- Tokens especiales adicionales para estructuras simbólicas: `<THM>`, `<PROOF>`, `<D_EPS>`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas a inglés según la etiqueta del modelo.
- Capacidades especiales: "Dream Mode" de evolución simbólica offline, no verificable.

## Casos de uso

- Tutoría con memoria entre sesiones: el buffer simbólico de 2048 vectores permitiría, en teoría, retener contexto de interacciones previas; útil para asistentes educativos que necesitan recordar el progreso del alumno, aunque requiere validación empírica.
- Modelado de pruebas matemáticas: los tokens `<THM>` y `<PROOF>` y el dataset CoT de cálculo avanzado sugieren un uso orientado a generar borradores de demostraciones y cadenas de razonamiento matemático.
- Asistente de investigación en lógica formal: para explorar encadenamientos deductivos y estructuras simbólicas, siempre con revisión humana dada la ausencia de benchmarks.
- Diálogo técnico de dominio acotado: al no estar instruction-tuned, encaja mejor en pipelines con prompts muy estructurados que en chat abierto.
- Base para experimentación académica: útil como punto de partida para estudiar fine-tuning sobre Qwen3-8B y para reproducir o refutar las afirmaciones de la model card.
- Generación de código asistida: hereda capacidades de Qwen3-8B, aunque sin garantías de calidad específicas para este fine-tune.
- Prototipos de sistemas con memoria externa: el formato `memory.pt` puede servir como referencia para diseñar buffers de memoria en arquitecturas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 20-24 GB para contextos moderados.
- VRAM estimada en FP32: unos 32,8 GB solo para pesos.
- GPU recomendadas: A100 40GB, H100 80GB o RTX 4090 24GB para FP16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en FP16 con contexto ajustado; en GPUs de 16 GB requeriría cuantización, que no está publicada en el repo.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp y Ollama no están confirmados y requerirían conversión manual a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symbiotic-8B | 8,19B | no disponible | afl-3.0 | Hugging Face, safetensors/PyTorch | Fine-tune experimental de Qwen3-8B con artefactos simbólicos |
| Qwen/Qwen3-8B | 8,2B | 32.768 tokens (ampliable, según Qwen) | Apache 2.0 | Hugging Face, amplio ecosistema (GGUF, vLLM, Ollama) | Modelo base, con benchmarks publicados y soporte de tool calling |
| Meta-Llama-3.1-8B | 8,0B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, ecosistema amplio | Alternativa generalista con contexto largo |
| Mistral-7B-v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | Hugging Face, ecosistema amplio | Alternativa ligera con licencia permisiva |

La comparación directa de rendimiento no es posible porque Symbiotic-8B no publica benchmarks; en la práctica, Qwen3-8B ofrece mejores garantías de soporte, cuantizaciones y licencia permisiva para producción.

## Limitaciones y advertencias

- No está instruction-tuned: las entradas tipo chat requieren ingeniería de prompts y pueden producir respuestas poco alineadas.
- Ausencia total de benchmarks publicados: no hay evidencia empírica de las capacidades simbólicas declaradas.
- Las afirmaciones de arquitectura híbrida (módulos LSTM/GNN, "Dream Mode") no son reproducibles con la información disponible y deben tratarse con escepticismo.
- El buffer de memoria aumenta la carga de CPU y requiere sembrado activo; su comportamiento entre sesiones no está validado.
- Modelo solo en inglés; sin soporte multilingüe declarado.
- Riesgo de alucinación: al ser un fine-tune sin evaluación pública, especialmente en tareas matemáticas y de prueba formal, la verificación humana es imprescindible.
- Licencia AFL-3.0: permisiva y compatible con uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base Qwen3-8B (Apache 2.0).
- Sesgos: no documentados; se heredan los del corpus de Qwen3-8B y del dataset CoT de cálculo avanzado.
- Repositorio de 43,1 GB con pesos duplicados (safetensors y model.bin): consumo de almacenamiento elevado y riesgo de confusión sobre qué fichero cargar.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset citado: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Discrepancy Calculus (DOI 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Modelos relacionados: https://huggingface.co/reaperdoesntknow/Symbiotic-1B, https://huggingface.co/reaperdoesntknow/Symiotic-14B, https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Perfil del autor: https://huggingface.co/reaperdoesntknow
