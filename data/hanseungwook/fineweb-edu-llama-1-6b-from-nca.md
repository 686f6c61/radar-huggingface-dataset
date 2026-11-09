# hanseungwook/fineweb-edu-llama-1.6b-from-nca

## Resumen

`hanseungwook/fineweb-edu-llama-1.6b-from-nca` es un modelo de lenguaje causal base de 1.816.565.760 parámetros publicado por el usuario hanseungwook en Hugging Face. Se trata del checkpoint final (paso 60.975) de un experimento de preentrenamiento sobre aproximadamente 31.970 millones de tokens del corpus FineWeb-Edu, partiendo de una inicialización obtenida mediante un proceso previo denominado NCA (Neural Cellular Automata, según los tags del repositorio). No dispone de ajuste por instrucciones ni de fine-tuning conversacional: es un modelo base pensado para investigación sobre dinámicas de preentrenamiento y transferencia de inicializaciones.

La arquitectura es un transformer tipo Llama con 24 capas, dimensión oculta 2048, dimensión intermedia 8192 y 32 cabezas de atención/KV. Utiliza un vocabulario GPT-2 de 50.257 tokens, longitud de contexto de 1024 tokens y embeddings de entrada y cabeza de salida desacoplados (untied). El modelo se distribuye en safetensors FP32 sin pérdida, fragmentados a 5 GB, con un tamaño de repositorio de 7,3 GB.

Su relevancia es fundamentalmente experimental: documenta de forma explícita la procedencia del entrenamiento, la inicialización de embeddings y las verificaciones de exportación (comparación de logits y paridad de tokenizer), lo que lo convierte en un artefacto útil para estudiar la transición de una inicialización NCA a un modelo de texto y para reproducir experimentos de preentrenamiento a pequeña escala. No está orientado a uso en producción ni a tareas de asistencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (24 capas, hidden size 2048, intermediate size 8192, 32 attention/KV heads, embeddings y cabeza de salida desacoplados) |
| Parametros totales | 1.816.565.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32 sin pérdida, fragmentados a 5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención multi-cabeza estándar (32 cabezas de atención y KV), 24 capas, dimensión oculta 2048 y dimensión intermedia 8192. Emplea el vocabulario GPT-2 de 50.257 tokens y una longitud de contexto de 1024. Los embeddings de entrada y la proyección de salida no están atados, lo que explica que el recuento de parámetros (1.816.565.760) sea superior al de la familia de origen (denominada "1.6B / llama-large") debido al vocabulario de texto más amplio.

El entrenamiento parte de una inicialización pre-preentrenada con NCA (`nca-ckpt/seed-0/gpt_model_10.pth`, 5.000 pasos de optimizador) y continúa sobre aproximadamente 31.970 millones de tokens de FineWeb-Edu (semilla 0, LR 0,0005, weight decay 0,0001, batch efectivo 512, contexto 1024). El recuento de tokens es nominal (pasos de optimizador × batch efectivo × longitud de contexto) y excluye trabajo repetido tras reanudaciones desde checkpoints. La última pérdida de validación registrada es 2,422540241304566 en el paso 60.500, no medida específicamente sobre los pesos finales del paso 60.975. En la transición de NCA a texto, los embeddings de entrada se reinicializaron con media 0 y desviación estándar 1 (valores por defecto de `nn.Embedding` de PyTorch), y la proyección de salida usó la distribución uniforme por defecto de `nn.Linear` en aproximadamente [-0,02210, 0,02210]; la exportación a Hugging Face preserva exactamente los tensores entrenados. No se documenta RLHF, DPO ni ninguna fase de alineación.

## Capacidades

- Generación de texto autoregresiva en inglés como modelo causal base.
- Continuación de texto y modelado de lenguaje (prompt completion), sin formato conversacional.
- Razonamiento y conocimiento factual limitados a lo aprendido de FineWeb-Edu, sin ajuste instructivo.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües: únicamente inglés declarado.
- Sin modo thinking, visión, audio ni otras modalidades.
- Sin plantilla de chat ni tokens especiales de rol documentados.

## Casos de uso

- Investigación sobre inicializaciones NCA: el modelo permite estudiar cómo una inicialización procedente de autómatas celulares neuronales afecta al preentrenamiento de un transformer de texto, comparando curvas de pérdida y representaciones con inicializaciones aleatorias.
- Reproducibilidad de experimentos de preentrenamiento: al publicarse checkpoints `.pth` originales, el run de W&B y los hiperparámetros exactos, sirve para replicar el pipeline de entrenamiento a escala de ~32B tokens.
- Evaluación de transferencia de vocabulario: el cambio de vocabulario NCA al vocabulario GPT-2 de 50.257 tokens y la reinicialización de embeddings permiten analizar el coste de adaptar un modelo preentrenado a un tokenizer distinto.
- Generación de texto de dominio educativo: al entrenarse sobre FineWeb-Edu, puede emplearse para completar textos expositivos o generar material divulgativo en inglés, siempre con revisión humana por su naturaleza de modelo base.
- Baseline en investigación de modelado de lenguaje: útil como referencia de 1,8B parámetros con contexto 1024 para comparar perplejidad y pérdida de validación frente a otros modelos pequeños.
- Estudio de exportación y verificación de pesos: el `conversion_report.json` con comparaciones de logits a longitudes 8, 128 y 1024 y paridad de tokenizer sirve como ejemplo de buenas prácticas de conversión de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es la pérdida de validación de 2,422540241304566 registrada en el paso 60.500.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 7,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 8-9 GB para contextos cortos.
- VRAM estimada en FP16/BF16: aproximadamente 3,6 GB para pesos, más activaciones y caché KV; en torno a 4-5 GB en total.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,8 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,9 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para FP32/BF16 sin problemas; RTX 4090, RTX 3090, RTX 4080 y RTX 3080 (10-24 GB) suficientes en BF16 o cuantizado.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16 y en tarjetas con 6 GB o más en cuantización de 8 bits.
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM`), text-generation-inference (el repositorio declara compatibilidad con endpoints), y herramientas de cuantización como llama.cpp u Ollama previa conversión a GGUF (no se proporcionan pesos GGUF oficiales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fineweb-edu-llama-1.6b-from-nca | 1.816.565.760 | 1024 | no disponible | Hugging Face, safetensors FP32 | Modelo base experimental, sin benchmarks publicados |
| TinyLlama-1.1B | ~1.100.000.000 | 2048 | Apache 2.0 | Hugging Face, safetensors | Entrenado con ~3T tokens, benchmarks publicados |
| Pythia-1.4B | ~1.400.000.000 | 2048 | Apache 2.0 | Hugging Face, safetensors | Suite de investigación con checkpoints intermedios |
| OPT-1.3B | ~1.300.000.000 | 2048 | OPT-175B License | Hugging Face, safetensors | Modelo base de Meta con benchmarks publicados |

La comparación con alternativas de tamaño similar es aproximada: no se dispone de resultados de benchmarks de este modelo que permitan una comparación cuantitativa de rendimiento. Las alternativas citadas cuentan con licencias explícitas y evaluaciones publicadas, a diferencia de este checkpoint.

## Limitaciones y advertencias

- Es un modelo base sin ajuste instructivo ni conversacional: no sigue instrucciones ni mantiene diálogos de forma fiable.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, especialmente fuera del dominio educativo de FineWeb-Edu.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo soporta inglés; no hay capacidades multilingües verificadas.
- Licencia no disponible: no se puede confirmar el permiso para uso comercial ni las condiciones de redistribución.
- Sesgos potenciales heredados del corpus FineWeb-Edu y de la inicialización NCA, no evaluados ni documentados.
- La pérdida de validación registrada (2,42) corresponde al paso 60.500, no a los pesos finales del paso 60.975, por lo que el rendimiento real del checkpoint publicado puede diferir ligeramente.
- El recuento de tokens (31,97B) es nominal y excluye trabajo repetido tras reanudaciones, por lo que no equivale a tokens únicos procesados.
- Sin soporte nativo de tool calling, agentes ni plantillas de chat.
- No recomendado para producción sin una evaluación exhaustiva previa y sin claridad sobre la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-nca
- Checkpoints originales `.pth`: https://huggingface.co/hanseungwook/fineweb-edu-llama-large-from-nca-seed-0-1506432
- Run de Weights & Biases: https://wandb.ai/hanseungwook/fineweb-edu-pt/runs/be8neyrp
