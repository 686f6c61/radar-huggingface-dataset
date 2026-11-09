# fadhilahkhairogi/Liwet-66M-id-chat

## Resumen

Liwet-66M-id-chat es un modelo de lenguaje conversacional en indonesio de 66,7 millones de parámetros, desarrollado por Group 11 (estudiantes de Informática de la Universidad de Telkom) bajo el identificador `fadhilahkhairogi`. Se trata de un ajuste fino supervisado (SFT) del modelo base `Liwet-66M-id-base-v2`, entrenado desde cero con una arquitectura propia denominada `MiniTransformer` (decoder-only con Pre-RMSNorm, RoPE y SwiGLU). Su relevancia radica en ser un ejemplo de modelo pequeño, ligero y entrenado íntegramente desde cero para un idioma de recursos medios como el indonesio, con un vocabulario extendido de tokens de chat.

El modelo incorpora un vocabulario Byte-Level BPE de 32.003 tokens con tokens especiales dedicados a la conversación (`<|user|>`, `<|assistant|>`, `<|end|>`), y emplea enmascaramiento de pérdida únicamente sobre las respuestas del asistente. Con una ventana de contexto de solo 1.024 tokens, está pensado para diálogos cortos y tareas de instrucción simples, no para contextos extensos ni para razonamiento complejo.

Se distribuye en formato SafeTensors en `bfloat16` y no es un checkpoint estándar de `transformers` (`AutoModelForCausalLM`), sino que requiere cargar los pesos en la definición de arquitectura propia del repositorio. La licencia no está especificada en la información disponible, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniTransformer (decoder-only, Pre-RMSNorm, RoPE, SwiGLU) |
| Parametros totales | 66.729.984 (~66,73M) con pesos atados; 83.115.520 elementos almacenados en `model.safetensors` (incluye copia de `lm_head.weight` sin atar) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `bfloat16`) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | SafeTensors (`bfloat16`); tokenizer en `tokenizer.json`; requiere `config.json` |
| Capas / Cabezas / Dimension | 12 capas / 8 cabezas de atención / 512 dim oculta / 2.048 dim SwiGLU |
| Vocabulario | 32.003 tokens Byte-Level BPE |
| Tokens especiales | `<|unk|>`=0, `<|pad|>`=1, `<|endoftext|>`=2, `<|user|>`=32000, `<|assistant|>`=32001, `<|end|>`=32002 |
| Precision | `bfloat16` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only propia llamada `MiniTransformer`, con normalización Pre-RMSNorm, embeddings posicionales rotatorios (RoPE) y capas feed-forward con activación SwiGLU. Consta de 12 capas, 8 cabezas de atención y una dimensión oculta de 512, con una dimensión intermedia SwiGLU de 2.048. El vocabulario es un Byte-Level BPE de 32.003 tokens, ampliado con tokens dedicados a la conversación.

El entrenamiento parte de `Liwet-66M-id-base-v2` (base de 2 épocas) y aplica un ajuste fino supervisado con enmascaramiento de pérdida exclusivamente sobre los tokens de respuesta del asistente (hasta `<|end|>`), sin fase de SimPO ni RLHF. Los datos de entrenamiento proceden de cuatro conjuntos de instrucciones en indonesio filtrados para eliminar ítems de tipo test de opción múltiple (`PILIHAN:`): `OpenPathAI/alpaca-gpt4-indonesian-cleaned`, `FreedomIntelligence/evol-instruct-indonesian`, `LorthGyu/indonesian-instructions` y `hanifabdlh/LaMini-Instruction-Indonesian-Google-Translated`. El mejor checkpoint (paso 1.383) vio aproximadamente 45,3 millones de tokens.

## Capacidades

- Generación de texto conversacional en indonesio con formato de chat dedicado (`<|user|>` / `<|assistant|>`).
- Respuesta a instrucciones y tareas de instrucción simples derivadas de los datasets de SFT empleados.
- Diálogo multi-turno de corta duración, limitado por la ventana de 1.024 tokens.
- Generación con parada controlada mediante los tokens `<|end|>` (32002) o `<|endoftext|>` (2).
- Capacidad multilingüe: únicamente indonesio; no se documenta soporte de otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en indonesio: el modelo puede gestionar diálogos cortos de tipo pregunta-respuesta con el formato de tokens `<|user|>`/`<|assistant|>`, adecuado para demos y pruebas de concepto en entornos con recursos limitados.
- Experimentación académica en modelos desde cero: sirve como base reproducible para estudiar SFT, enmascaramiento de pérdida y ampliación de vocabulario en un transformer pequeño entrenado desde cero.
- Clasificación y respuesta a instrucciones simples: al estar ajustado sobre datasets de instrucciones filtrados, puede emplearse para tareas de extracción o reformulación de texto breve en indonesio.
- Generación de texto de bajo coste en dispositivos: sus ~66,7M de parámetros permiten inferencia en CPU o GPU de gama baja, útil para aplicaciones embebidas o de borde con presupuesto de cómputo mínimo.
- Filtrado y limpieza de datos de instrucciones: el propio proceso de filtrado aplicado a los datasets (eliminación de ítems de opción múltiple) puede reproducirse o adaptarse con este modelo como referencia de comportamiento.
- Base para ajuste fino posterior: al ser un checkpoint SFT de un modelo base propio, puede servir de punto de partida para experimentos de alineación adicional (DPO, SimPO) o especialización en dominios concretos en indonesio.
- Evaluación comparativa de modelos pequeños: útil como línea base en estudios de escalado y eficiencia para idiomas de recursos medios.

## Benchmarks y rendimiento

| Checkpoint / Split | Datos vistos | Val loss | Val perplexity |
|---|---|---|---|
| Chat SFT mejor (paso 1.383, validación con máscara de asistente) | 45.318.144 (~45,3M) tokens | 2,5202 | 12,43 |
| Respuestas de chat held-out (200 ejemplos) | 37.658 tokens de respuesta | 2,5348 | 12,61 (top-1 = 50,2%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con pesos en `bfloat16` (~0,17 GB para 83,1M elementos) el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de memoria libre; no requiere A100 ni H100. Una RTX 4090 o similar está sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas (GTX 1060 en adelante) y en CPU.
- Opciones de despliegue: no es compatible directamente con `transformers` (`AutoModelForCausalLM`); requiere cargar `model.safetensors` en la definición de arquitectura propia del repositorio junto con `config.json` y `tokenizer.json` (vía `safetensors.torch.load_file` y `tokenizers.Tokenizer`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Liwet-66M-id-chat | ~66,7M | 1.024 tokens | no disponible | SafeTensors, arquitectura propia (no `transformers`) |
| Modelos comparables de tamano similar en indonesio | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (pequeños, en indonesio y entrenados desde cero) en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin aclaración del autor.
- Ventana de contexto muy reducida (1.024 tokens), lo que limita diálogos largos y documentos extensos.
- Entrenado exclusivamente en indonesio; no se garantiza comportamiento correcto en otros idiomas.
- Riesgo de alucinación elevado por su tamaño reducido y por el uso de datos sintéticos traducidos (alpaca-gpt4, LaMini traducido).
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es un checkpoint estándar de `transformers`: requiere código de carga personalizado, lo que complica su integración en pipelines convencionales.
- Sesgos conocidos: no documentados en la información disponible; al derivar de datasets traducidos automáticamente, puede heredar sesgos de traducción y de los modelos generadores originales.
- Modelo de carácter académico (trabajo de curso), sin validación en producción ni proceso de alineación adicional (sin SimPO/RLHF).
- El recuento de parámetros difiere entre el valor nominal (66,7M atados) y los elementos almacenados (83,1M por la copia de `lm_head.weight`), lo que puede confundir en el cálculo de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-chat
- Modelo base: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-base-v2
- Dataset `OpenPathAI/alpaca-gpt4-indonesian-cleaned`: https://huggingface.co/datasets/OpenPathAI/alpaca-gpt4-indonesian-cleaned
- Dataset `FreedomIntelligence/evol-instruct-indonesian`: https://huggingface.co/datasets/FreedomIntelligence/evol-instruct-indonesian
- Dataset `LorthGyu/indonesian-instructions`: https://huggingface.co/datasets/LorthGyu/indonesian-instructions
- Dataset `hanifabdlh/LaMini-Instruction-Indonesian-Google-Translated`: https://huggingface.co/datasets/hanifabdlh/LaMini-Instruction-Indonesian-Google-Translated
