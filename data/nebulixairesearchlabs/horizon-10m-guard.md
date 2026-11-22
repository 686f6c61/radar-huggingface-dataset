# NebulixAiResearchlabs/Horizon-10M-Guard

## Resumen

Horizon-10M-Guard es un modelo de clasificación de seguridad de contenido desarrollado por NebulixAiResearchlabs, un fine-tuning supervisado (SFT) sobre el modelo base Nebulixlabs/Horizon-10M-Base. Se presenta como un guard model ultracompacto de aproximadamente 12,68 millones de parámetros reales (el autor indica ~10,06M en su model card) que evalúa texto de entrada y lo clasifica como `safe` o `unsafe`, emitiendo además una subcategoría de riesgo asociada. Su propósito es servir como filtro ligero de moderación en entornos de borde (edge AI) donde no es viable desplegar un LLM de gran tamaño.

Técnicamente emplea una arquitectura transformer decoder-only con atención rotatoria (RoPE), activación SwiGLU y normalización RMSNorm en configuración pre-norm, siguiendo el esquema de la familia Llama. El vocabulario es un BPE a nivel de byte personalizado de 8.192 tokens, la dimensión oculta es 320, tiene 6 capas y 5 cabezas de atención con `head_dim` de 64. La longitud de contexto es de solo 128 tokens, lo que limita su uso a fragmentos muy cortos de texto.

Su relevancia actual es fundamentalmente experimental: demuestra que arquitecturas decoder modernas pueden adaptarse a tareas de clasificación con un coste computacional mínimo. Sin embargo, el propio autor reconoce una precisión global de en torno al 60% en clasificación multicategoría, lo que lo sitúa lejos de ser apto para moderación en producción de forma autónoma. Está pensado como línea base de investigación y como componente auxiliar en pipelines de filtrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, SwiGLU, RMSNorm pre-norm, estilo Llama) |
| Parametros totales | 12.681.280 (según safetensors); el autor declara ~10,06M en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas; al ser un modelo de ~12M parámetros cabe en FP32 sin problema) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con dimensión oculta de 320, 5 cabezas de atención de 64 dimensiones cada una y un MLP con tamaño oculto de 864 empleando SwiGLU. La normalización es RMSNorm en configuración pre-norm y la codificación posicional es rotatoria (RoPE). El vocabulario es un BPE a nivel de byte personalizado de 8.192 entradas. El número total de parámetros registrado en los safetensors es de 12.681.280, ligeramente superior a los ~10,06M que declara el autor en la model card.

El entrenamiento consistió en un fine-tuning supervisado (SFT) sobre el modelo base Nebulixlabs/Horizon-10M-Base. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas más allá de la propia arquitectura base (RoPE, SwiGLU, RMSNorm). El modelo se distribuye con código personalizado (`custom_code`) y requiere `trust_remote_code=True` para cargarse con transformers.

## Capacidades

- Clasificación de seguridad de texto: emite un veredicto `safe` o `unsafe` sobre la entrada.
- Etiquetado de subcategoría de riesgo: identifica la categoría de daño o tema asociado al texto clasificado como inseguro.
- Generación de texto condicionada al prompt de clasificación (es un modelo causal que se usa con una plantilla SFT y decodificación de pocos tokens).
- Funcionamiento en modo determinista con temperatura baja (el autor recomienda `temperature=0.1`, `top_k=10`, `top_p=0.9`, `repetition_penalty=1.05`).
- Orientado a edge AI: tamaño reducido y requisitos de cómputo mínimos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: limitada al inglés según los metadatos del modelo.

## Casos de uso

- Filtrado preliminar en pipelines de moderación: dado su tamaño mínimo, puede ejecutarse como primera capa de descarte sobre fragmentos cortos de texto antes de recurrir a un clasificador mayor, reduciendo coste computacional en el pre-filtrado.
- Moderación en dispositivos de borde: al requerir apenas unos pocos megabytes de memoria, puede desplegarse en entornos con recursos muy limitados (Raspberry Pi, microcontroladores con aceleración, navegadores) para señalar contenido potencialmente inseguro en local.
- Investigación y experimentación en seguridad de LLM: sirve como línea base reproducible para estudiar cómo se comportan arquitecturas decoder compactas en tareas de clasificación de seguridad.
- Etiquetado asistido de datasets: puede usarse para pre-etiquetar grandes volúmenes de textos cortos con veredicto safe/unsafe y subcategoría, que luego se revisan manualmente.
- Componente auxiliar en sistemas de chat: como filtro de entrada o salida sobre mensajes cortos (por debajo de 128 tokens) en aplicaciones de bajo presupuesto.
- Docencia y demostraciones: ejemplo práctico de fine-tuning SFT sobre un modelo base diminuto para ilustrar el flujo completo de adaptación de un LLM a una tarea de clasificación.

## Benchmarks y rendimiento

| Métrica | Resultado | Notas |
|---|---|---|
| Precisión global (accuracy) | ~60% | Evaluado sobre prompts de clasificación de seguridad en held-out, según la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado por el autor es la precisión global de aproximadamente el 60% en clasificación multicategoría de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (12,68M parámetros × 4 bytes ≈ 51 MB de pesos, más overhead de activaciones y tokenizador); en la práctica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, iGPU, RTX 3060/4060 o superiores sin problema. Cualquier GPU con al menos 1 GB de memoria es suficiente.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en hardware embebido.
- Opciones de despliegue: transformers con `trust_remote_code=True` (método documentado por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; dado el tamaño, transformers en CPU es suficiente.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos en CPU y throughput muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horizon-10M-Guard | ~12,68M | 128 tokens | Clasificación de seguridad | Apache 2.0 | Hugging Face |
| Llama Guard (Meta) | 7B / 8B (según versión) | 4K–8K tokens | Clasificación de seguridad | Llama Community License | Hugging Face |
| ShieldGemma (Google) | 2B / 9B / 27B | 8K tokens | Clasificación de seguridad | Gemma Terms of Use | Hugging Face |

No se dispone de datos de rendimiento comparativos publicados para Horizon-10M-Guard frente a estas alternativas en la información proporcionada; el único dato propio es su ~60% de precisión global. La comparación relevante es de escala: Horizon-10M-Guard es entre dos y tres órdenes de magnitud más pequeño que Llama Guard o ShieldGemma, con un contexto mucho más corto (128 frente a miles de tokens) y una precisión sustancialmente menor, pero con requisitos de hardware prácticamente nulos.

## Limitaciones y advertencias

- Precisión limitada: en torno al 60% en clasificación multicategoría, según el propio autor, lo que lo hace no apto para moderación en producción de forma autónoma.
- Contexto muy corto: 128 tokens restringen su uso a fragmentos breves; textos más largos deben truncarse o dividirse, con pérdida de contexto.
- Solo inglés: los metadatos indican únicamente `en`; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación: al ser un modelo generativo usado como clasificador, puede producir salidas fuera del formato esperado o veredictos inconsistentes si el prompt no sigue la plantilla SFT.
- Estado experimental: el autor lo etiqueta explícitamente como `experimental`; no hay garantías de robustez ni de mantenimiento.
- Requiere `trust_remote_code=True`: implica ejecutar código personalizado del repositorio, lo que añade un riesgo de seguridad en entornos de producción.
- Discrepancia en el recuento de parámetros: los safetensors indican 12.681.280 parámetros frente a los ~10,06M declarados en la model card; conviene verificar antes de dimensionar despliegues.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo base del mismo autor conviene revisar los términos del modelo base por si impusieran condiciones adicionales.
- Sin datos de sesgo documentados: no se publica información sobre sesgos demográficos, culturales o lingüísticos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NebulixAiResearchlabs/Horizon-10M-Guard
- Modelo base: https://huggingface.co/Nebulixlabs/Horizon-10M-Base
- Organización en Hugging Face: https://huggingface.co/Nebulixlabs
- GitHub: https://github.com/NebulixLabs
- Instagram: https://instagram.com/nebulix_labs
