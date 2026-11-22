# somdevsheel/prajna-ai-124m-chat

## Resumen

prajna-ai-124m-chat es un modelo de lenguaje conversacional de 123,6 millones de parámetros entrenado desde cero por el desarrollador independiente somdevsheel (anteriormente publicado como kaggle-llm-124m-chat). Se trata de un proyecto de aprendizaje ejecutado íntegramente en GPUs gratuitas de Kaggle (2x NVIDIA T4), con un preentrenamiento sobre 1.920 millones de tokens de FineWeb-Edu y un ajuste supervisado posterior sobre 451.000 conversaciones de smol-smoltalk más 1.000 conversaciones sintéticas de identidad.

Arquitectónicamente es un transformer decoder-only de estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin sesgos, embeddings atados) con 12 capas, dimensión oculta 768, 12 cabezas de atención, FFN de 2048 y una ventana de contexto de solo 1.024 tokens. Utiliza el tokenizador BPE de GPT-2 con vocabulario ampliado a 50.304 entradas. Los pesos son un `LlamaForCausalLM` estándar, por lo que funciona directamente con `transformers`.

Su relevancia es principalmente didáctica y de referencia: demuestra el ciclo completo de preentrenamiento y SFT de un modelo pequeño con recursos mínimos, y sirve como banco de pruebas para pipelines de entrenamiento, cuantización y despliegue. El propio autor lo describe explícitamente como un proyecto de aprendizaje y no como un asistente apto para producción, advirtiendo de que con frecuencia afirma hechos erróneos con seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin sesgos, embeddings atados) |
| Parametros totales | 123.587.328 (85,0M no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y ONNX; no se documentan variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Capas / dimension oculta / cabezas | 12 / 768 / 12 |
| FFN | 2.048 |
| Tokenizador | GPT-2 BPE, vocabulario ampliado a 50.304 |
| Dataset de entrenamiento | FineWeb-Edu (sample-10BT) para preentrenamiento; smol-smoltalk + 1.000 conversaciones sintéticas de identidad para SFT |
| Modelo base | somdevsheel/prajna-ai-124m-base |
| Tamano del repo | 1,9 GB |

## Arquitectura y entrenamiento

El modelo sigue la receta de un transformer decoder-only compacto al estilo LLaMA: normalización RMSNorm en configuración pre-norm, embeddings rotatorios (RoPE) para la posición, activación SwiGLU en la FFN y ausencia de términos de sesgo en las capas lineales, con los embeddings de entrada y salida atados. La forma es de 12 capas con hidden de 768, 12 cabezas de atención y FFN de 2.048, lo que da los 123,6M de parámetros totales (85,0M sin contar embeddings). La ventana de contexto es de 1.024 tokens, y el tokenizador es el BPE de GPT-2 con el vocabulario rellenado hasta 50.304.

El entrenamiento se dividió en dos fases. El preentrenamiento consumió 1.920 millones de tokens de FineWeb-Edu (muestra sample-10BT) en 3.661 pasos de 524K tokens repartidos en dos ejecuciones, unas 21 horas en 2x T4, alcanzando una pérdida de validación de 3,30 (perplejidad 27). Se usó PyTorch DDP entre las dos GPUs, precisión mixta fp16 con loss scaling, AdamW con betas (0,9, 0,95), weight decay 0,1 y schedule coseno; el learning rate fue 1,2e-3 en el preentrenamiento inicial y 6e-4 en el preentrenamiento continuado sobre datos no vistos, con el schedule ajustado automáticamente al límite de 12 horas por sesión de Kaggle. La fase de SFT empleó 451.000 conversaciones de smol-smoltalk (conjunto completo) más 1.000 conversaciones sintéticas de identidad, empaquetadas en bloques de 1.024 tokens (299M tokens), durante 4.578 pasos de 65K tokens (3,2 horas en 2x T4), con learning rate 2e-4 y pérdida calculada únicamente sobre los tokens del asistente. La pérdida de validación sobre tokens de asistente bajó de 2,65 a 1,46. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno siguiendo una plantilla de chat con etiquetas de rol en texto plano (`<|system|>`, `<|user|>`, `<|assistant|>`, cierre con `<|endoftext|>`).
- Escritura de código corto y bien especificado (por ejemplo, inversión de cadenas o comprobación de primalidad); el código más largo o con especificaciones vagas suele fallar.
- Razonamiento básico y respuesta a preguntas sencillas, con conocimiento factual muy limitado.
- Autoconocimiento de identidad: responde con su nombre y creador gracias a las 1.000 conversaciones sintéticas de identidad del SFT, aunque puede añadir detalles inventados alrededor.
- Capacidad multilingüe: no disponible (entrenado y evaluado solo en inglés).
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Docencia y formación en entrenamiento de LLM: el modelo sirve como ejemplo completo y reproducible de preentrenamiento más SFT con presupuesto mínimo (2x T4, ~24 horas totales), útil en cursos y talleres sobre pipelines de entrenamiento.
- Banco de pruebas de infraestructura de inferencia: al ser un `LlamaForCausalLM` estándar de 124M, permite validar configuraciones de vLLM, TGI, llama.cpp u Ollama, medir latencia y probar cuantizaciones sin coste apreciable de GPU.
- Prototipado rápido de interfaces de chat: su plantilla de chat y su tamaño permiten iterar en el diseño de UX conversacional (formato de turnos, prompts de sistema) antes de migrar a un modelo mayor.
- Generación de código de ejemplo en documentación técnica: para fragmentos cortos y canónicos (invertir una cadena, comprobar primos) puede producir snippets válidos que luego revisa un humano.
- Experimentos de alineación e identidad: las conversaciones sintéticas de identidad permiten estudiar cómo un SFT pequeño modifica la auto-representación del modelo y comparar versiones (v1, v2, v3) con pérdidas de validación de 1,61, 1,54 y 1,46.
- Base para fine-tuning específico de dominio: al estar bajo Apache 2.0 y con solo 124M de parámetros, es un punto de partida barato para ajustar tareas acotadas (clasificación ligera vía generación, extracción de campos) en una única GPU de consumo.
- Evaluación comparativa de tokenizadores y arquitecturas pequeñas: su combinación de tokenizador GPT-2 con arquitectura LLaMA lo hace útil en estudios controlados sobre eficiencia de vocabulario y contexto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida de validación de 3,30 (perplejidad 27) en preentrenamiento y pérdida de validación sobre tokens de asistente de 1,46 tras el SFT (frente a 1,61 en v1 y 1,54 en v2).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp16 (123,6M parámetros x 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más. En fp32 serían unos 0,5 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo se entrenó en 2x NVIDIA T4, por lo que una sola T4, L4, RTX 3060, RTX 4090, A100 o H100 lo ejecuta sin problemas. Para lotes grandes, A100/H100 aportan margen de throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: `transformers` (soporte nativo, tal como documenta el autor), text-generation-inference (el repo está etiquetado como endpoints_compatible), ONNX Runtime (hay pesos ONNX publicados), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput estimados: no disponible (no se publican medidas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| prajna-ai-124m-chat | 123,6M | 1.024 | Apache 2.0 | en | Entrenado desde cero, sin RLHF/DPO, proyecto didáctico |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 | Apache 2.0 | en (principalmente) | Familia de modelos pequeños de Hugging Face; contexto mayor y más datos de entrenamiento |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | en | Referencia histórica de mismo tamaño; sin ajuste conversacional nativo |
| TinyLlama-1.1B (opcional, escala superior) | 1,1B | 2.048 | Apache 2.0 | en | Un orden de magnitud más grande; útil como referencia de escalado |

Los datos de SmolLM-135M, GPT-2 small y TinyLlama-1.1B provienen de conocimiento general y no de la información proporcionada; los benchmarks comparativos no están disponibles en la documentación del modelo.

## Limitaciones y advertencias

- Alucinación elevada: el autor advierte explícitamente de que el modelo afirma hechos erróneos con seguridad. Ejemplo documentado: al preguntar "What is DSA in computer science?" inventa una definición.
- Conocimiento factual muy limitado: solo ~16 tokens de entrenamiento por parámetro (frente a los ~20 de Chinchilla), lo que deja el conocimiento del mundo muy mermado.
- Contexto muy corto: 1.024 tokens, insuficiente para documentos largos, conversaciones extensas o bases de código.
- Solo inglés: no hay soporte ni evaluación en otros idiomas, incluido el castellano.
- Sin alineación de seguridad: no se aplicó RLHF ni DPO, por lo que no hay garantías de comportamiento seguro ni de rechazo de peticiones dañinas.
- Código: solo fragmentos cortos y bien especificados suelen ser correctos; el código largo o ambiguo falla con frecuencia.
- Identidad: responde con el nombre y creador correctos, pero puede añadir detalles inventados; además, los pesos actuales se presentan con el nombre antiguo (kaggle-llm-124m-chat) hasta el siguiente fine-tune.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el propio autor desaconseja su uso en producción y en contextos factuales, médicos, legales o financieros.
- No apto como asistente de producción: es un proyecto de aprendizaje; no debe desplegarse en atención al cliente real ni en flujos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somdevsheel/prajna-ai-124m-chat
- Modelo base (solo preentrenamiento): https://huggingface.co/somdevsheel/prajna-ai-124m-base
- Dataset de preentrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de SFT smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
