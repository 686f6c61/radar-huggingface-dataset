# reaperdoesntknow/Symbiotic-8B

## Resumen

Symbiotic-8B es un modelo de generación de texto desarrollado por reaperdoesntknow (Convergent Intelligence LLC: Research Division) a partir de un ajuste fino de Qwen/Qwen3-8B. Se presenta como un modelo híbrido "simbólico-transformer" que combina el backbone transformer de Qwen3-8B con módulos simbólicos adicionales (procesadores LSTM, GNN y proyecciones recurrentes) y un búfer de memoria persistente de 2048 vectores. Está orientado a razonamiento simbólico, generación de teoremas, encadenamiento lógico y diálogo con memoria entre turnos.

El modelo cuenta con 8.190.735.360 parámetros totales en formato safetensors, un repositorio de 43,1 GB y está etiquetado únicamente para inglés. Se distribuye bajo licencia AFL-3.0 y es compatible con transformers y text-generation-inference. Su relevancia radica en la propuesta de integrar módulos simbólicos explícitos sobre un transformer preentrenado, un enfoque poco habitual en la familia Qwen3.

No obstante, debe señalarse que la model card incluye afirmaciones técnicas (procesadores "ThoughtDynamicsLNN", "CrystallineProcessor", "Dream Mode", marco teórico "Discrepancy Calculus") que no vienen acompañadas de resultados de benchmarks, detalles de entrenamiento verificables ni evaluación independiente. El modelo no está instruction-tuned según su propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) con módulos simbólicos adicionales (LSTM multi-cabeza, GNN DNAConv, proyección helicoidal) y búfer de memoria simbólica de 2048 vectores |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors y PyTorch; no hay GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors (recomendado) y model.bin (PyTorch); incluye memory.pt |

## Arquitectura y entrenamiento

La arquitectura parte del backbone transformer rotatorio de Qwen3-8B y añade, según la model card, cuatro módulos simbólicos con dimensión simbólica de 4096: ThoughtDynamicsLNN (atención LSTM multi-cabeza), CrystallineProcessor (GNN basada en DNAConv), LiquidThoughtProcessor (plegado recurrente de símbolos) y HelicalDNAProcessor (proyección lineal helicoidal). Incorpora además un búfer de memoria de 2048 vectores en float32 con recuperación consciente de entropía y un modo "Dream Mode" que genera cognición simbólica offline.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia a `0xZee/dataset-CoT-Advanced-Calculus-268`), ni si se aplicaron técnicas de RLHF, DPO o SFT. El autor indica que el modelo no está instruction-tuned y que la inferencia simbólica se evoluciona offline, requiriendo sembrado activo de la memoria. No hay información verificable sobre innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento simbólico y lógico: generación de teoremas, cadenas lógicas y razonamiento estructurado (según el autor).
- Memoria persistente entre turnos mediante búfer simbólico de 2048 vectores.
- Modelado de código y demostraciones matemáticas (declarado en usos previstos).
- Tokens especiales para estructuras simbólicas: `<THM>`, `<PROOF>`, `<D_EPS>`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado más allá de las afirmaciones del autor sobre "logical chaining".
- Capacidades multilingües: limitadas al inglés.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no documentado.

## Casos de uso

- Tutoría con memoria entre turnos: el búfer de 2048 vectores permitiría mantener contexto simbólico de sesiones previas, útil en asistentes educativos que necesitan recordar el progreso del estudiante.
- Asistente de investigación en matemáticas: generación de bocetos de demostraciones y encadenamiento lógico usando los tokens `<THM>` y `<PROOF>`, adecuado para exploración preliminar de conjeturas.
- Modelado de pruebas formales: experimentación con pipelines de verificación donde se requiera generar estructuras de prueba en inglés antes de pasar a un verificador formal.
- Diálogo técnico persistente: sistemas de documentación o soporte interno que se beneficien de recall contextual a lo largo de conversaciones largas.
- Investigación sobre arquitecturas híbridas simbólico-neuronales: el modelo sirve como banco de pruebas para estudiar la integración de módulos LSTM/GNN sobre un transformer preentrenado.
- Generación de código asistida en dominios matemáticos: dado su entrenamiento declarado en CoT de cálculo avanzado, puede emplearse para generar scripts de cálculo simbólico (SymPy, etc.), aunque sin garantías de corrección.
- Experimentación con "Dream Mode": generación offline de trazas simbólicas para aumentar datasets de razonamiento, con validación humana posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos (8,19 B parámetros), más overhead de activaciones y del búfer de memoria simbólica; en la práctica, se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: ~8,2 GB de pesos; en 4 bits: ~4,1 GB (aunque no se publican pesos cuantizados oficiales).
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de producción; RTX 4090 (24 GB) para BF16 en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con margen ajustado; en GPUs de 16 GB requeriría cuantización no oficial.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta endpoints_compatible); vLLM, llama.cpp y Ollama no están confirmados y requerirían conversión (no hay GGUF publicado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Symbiotic-8B | 8,19 B | no disponible | AFL-3.0 | safetensors, PyTorch | Ajuste de Qwen3-8B con módulos simbólicos; sin benchmarks |
| Qwen/Qwen3-8B | 8,2 B | 32 768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Modelo base; benchmarks publicados; instruction-tuned |
| Meta-Llama-3.1-8B | 8,03 B | 128 000 tokens | Llama 3.1 Community | safetensors, GGUF | Amplia adopción, ecosistema maduro |
| Mistral-7B-v0.3 | 7,25 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa ligera con licencia permisiva |

La comparación directa de rendimiento no es posible: Symbiotic-8B no publica evaluaciones, mientras que Qwen3-8B, Llama-3.1-8B y Mistral-7B-v0.3 cuentan con resultados reproducibles en MMLU, HumanEval y GSM8K. Además, la licencia AFL-3.0 es menos habitual que Apache 2.0 o Llama Community y conviene revisarla antes de uso comercial.

## Limitaciones y advertencias

- No está instruction-tuned: las entradas tipo chat requieren ingeniería de prompt y el modelo puede no seguir instrucciones de forma fiable.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni tareas de razonamiento simbólico.
- Afirmaciones arquitectónicas no verificables: los módulos simbólicos y el marco "Discrepancy Calculus" no cuentan con paper publicado (el autor indica "paper to be published soon").
- Riesgo elevado de alucinación en tareas de demostración matemática y generación de teoremas; requiere validación formal externa.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- El búfer de memoria simbólica debe sembrarse activamente; sin ello, el comportamiento puede degradarse y aumentar la carga de CPU.
- Licencia AFL-3.0: permisiva pero con cláusulas de reciprocidad y patentes que conviene revisar con asesoría legal antes de uso comercial.
- Sin pesos cuantizados oficiales (GGUF, AWQ, GPTQ): el despliegue en hardware limitado exige conversión propia y validación.
- Repositorio de 43,1 GB con doble formato (model.bin y safetensors): consumo de almacenamiento considerable.
- Fecha de actualización (2026-11-18) posterior a la de creación (2025-05-06) sin changelog que documente cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Paper "Discrepancy Calculus: Foundations and Core Theory": https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Paper "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Paper "Three Teachers to Dual Cognition": https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Dataset referenciado: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Modelos relacionados: https://huggingface.co/reaperdoesntknow/Symbiotic-1B, https://huggingface.co/reaperdoesntknow/Symiotic-14B, https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
