# CMSManhattan/JiRackDeltaNet_180b

## Resumen

JiRack DeltaNet 180B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por CMSManhattan, construido sobre la arquitectura Qwen3.8-Flash-Next de Qwen. El modelo combina atención lineal Gated DeltaNet con Qwen Sparse Attention (QSA), 512 expertos con enrutamiento top-10 más un experto compartido, y streams de residuales con hiper-conexiones. Cuenta con 176.943.899.520 parámetros totales (aproximadamente 177B) pero solo unos 6B activos por token, lo que hace realista la inferencia de alta calidad en CPU a esta escala.

El modelo está migrado a la arquitectura ternaria JiRack (BitLinear, pesos ternarios con absmean por tensor) mediante un pipeline de QAT (Quantization-Aware Training) con warmup de lambda, orientado a inferencia TQ2_0 en CPU con llama.cpp y Ollama. No obstante, el estado actual es crítico: el QAT ternario no ha comenzado, por lo que los pesos publicados son numéricamente idénticos al modelo base (lambda = 0 hace que BitLinear sea un passthrough puro). Los beneficios ternarios descritos solo aplicarán tras completar el QAT.

El modelo está pensado para aplicaciones de robótica, enrutamiento, código y tool calling avanzado mediante el flujo JiRack, con soporte multilingüe en 13 idiomas. Su licencia es qwen-community-1.0 y el repositorio ocupa 926,5 GB, con archivos GGUF publicados en BF16, Q4_K_M y Q3_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con Gated DeltaNet (atención lineal) intercalada con Qwen Sparse Attention (QSA), hiper-conexiones (gated residual streams), BitLinear ternario (JiRack) |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | ~6B por token (512 expertos, top-10 routing + experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q3_K_M (GGUF); TQ2_0 planificado tras QAT |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th (13 idiomas) |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors, GGUF (7 partes BF16, Q4_K_M, Q3_K_M) |

## Arquitectura y entrenamiento

La arquitectura se basa en Qwen3.8-Flash-Next e incorpora Gated DeltaNet (una forma de atención lineal con estado recurrente) intercalada con Qwen Sparse Attention, 512 expertos con enrutamiento top-10 más un experto compartido, streams de residuales con hiper-conexiones (gated residual streams) y una tabla de embeddings hashed n-gram de 51B parámetros. El vocabulario es de 248.320 tokens (tokenizer original de Qwen3.8). Solo ~6B parámetros se computan por token, lo que acerca el throughput en CPU al de un modelo denso de 6B mientras mantiene la calidad de uno mucho mayor.

El proceso de entrenamiento incluye un pipeline QAT con warmup de lambda (de 0 a 1) para ternarizar los pesos mediante BitLinear con absmean por tensor. Según el estado publicado, el port de la arquitectura, la conversión desde Qwen3.8-Flash-Next con verificación numérica (predicción del siguiente token coincidente en el 100% de posiciones, diferencias de logits dentro del ruido bf16 del modelo), el parche BitLinear (74.028 capas) a lambda = 0 con passthrough bit-exacto (diferencia máxima de logits 0,000000) y la exportación a layout Hugging Face y GGUF están completados. El QAT ternario está marcado como no iniciado y requiere una máquina con al menos 640 GB de RAM. Los datos concretos de composición del dataset de entrenamiento y número de tokens no están disponibles.

## Capacidades

- Generación de texto conversacional y de instrucciones en 13 idiomas (en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th).
- Razonamiento multi-paso y modo de pensamiento: el modelo base Qwen3.8-Flash-Next piensa por defecto con `<think>...</think>`; los builds JiRack planean desactivar el razonamiento por defecto.
- Tool calling y function calling avanzado mediante el flujo JiRack tool-call y el tokenizer JiRack.
- Capacidades de agente y enrutamiento (routing) orientadas a robótica y tool calling.
- Generación de código, con soporte dedicado mediante el JiRack Coding Agent IDE.
- Procesamiento de imágenes y vídeo en el modelo base Qwen3.8-Flash-Next; el build JiRack actual es solo texto.
- Inferencia eficiente en CPU gracias a la activación de solo ~6B parámetros por token.
- Uso como modelo experto en despliegues RAG.

## Casos de uso

- Tool calling empresarial: el modelo puede actuar como experto de dominio específico para tool calling usando el tokenizer JiRack, integrándose en librerías Java (Spring AI Alibaba) y Python (Gorilla) para orquestar llamadas a funciones en pipelines de empresa.
- Agente de código en IDE: el JiRack Coding Agent IDE (plugins para Eclipse, JetBrains y VS Code) ejecuta el modelo vía Ollama en un PC doméstico y solicita revisión y aplicación de cada cambio, ofreciendo un flujo más seguro que alternatives como Cursor o Windsurf.
- Inferencia en CPU a escala 180B: gracias a los ~6B parámetros activos por token, el throughput en CPU se aproxima al de un modelo denso de 6B, permitiendo desplegar un modelo de gran calidad sin GPU dedicada (con RAM suficiente, 160–192 GB para Q4_K_M).
- Despliegue RAG como modelo experto: el modelo puede usarse como experto dentro de despliegues RAG, con el servidor Java ONNX JiRack como alternativa de servicio.
- Robótica y enrutamiento: el tokenizer JiRack incluye tokens específicos para robótica, routing y tool calls, permitiendo integrar el modelo en sistemas de control y enrutamiento de tareas.
- Atención al cliente multilingüe: el soporte de 13 idiomas permite gestionar conversaciones multi-turno en mercados internacionales (en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th).
- Ahorro en infraestructura cloud: al requerir menos cómputo por token, el modelo puede reducir costes de inferencia en despliegues cloud frente a modelos densos de tamaño comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: BF16 completo requiere 384 GB+ de RAM (354,1 GB en 7 partes); Q4_K_M requiere 160–192 GB de RAM (archivo de 119,2 GB); Q3_K_M disponible con menor huella (tamaño no especificado en la información).
- GPU recomendadas: no disponible; el modelo está orientado a inferencia en CPU.
- Cabe en consumer GPU: no disponible; los requisitos de RAM (160–192 GB en Q4_K_M) exceden las GPU de consumo típicas.
- Opciones de despliegue: llama.cpp (soporte de arquitectura `qwen4exp`), Ollama (builds 180B planificados tras QAT), servidor Java ONNX JiRack, Docker (planificado).
- Latencia y throughput: no disponible; el autor indica que el throughput en CPU se aproxima al de un modelo denso de 6B gracias a la activación de ~6B parámetros por token.
- QAT ternario requiere una máquina con al menos 640 GB de RAM.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada. La comparación se limita a características estructurales conocidas:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRack DeltaNet 180B | ~177B | ~6B | no disponible | qwen-community-1.0 | GGUF (BF16, Q4_K_M, Q3_K_M) |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | qwen-community-1.0 | Hugging Face (Qwen) |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos publicados son numéricamente idénticos al modelo base hasta completar el QAT: lambda = 0 hace que BitLinear sea un passthrough puro, por lo que los beneficios ternarios (TQ2_0, eficiencia extrema en CPU) no están activos todavía.
- El QAT ternario no ha comenzado y requiere hardware con al menos 640 GB de RAM; los builds TQ2_0, Ollama y Docker aún no están publicados.
- El build JiRack actual es solo texto; pierde las capacidades de visión (imágenes y vídeo) del modelo base Qwen3.8-Flash-Next.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de gran escala sin benchmarks publicados, no hay evidencia de robustez factual.
- Sesgos conocidos: no disponible; no se documentan sesgos específicos.
- Longitud de contexto: no disponible, lo que limita la planificación de casos de uso con contexto largo.
- Restricciones de licencia: licencia qwen-community-1.0 (license: other); deben revisarse los términos para uso comercial en el enlace de licencia del modelo base.
- Requisitos de hardware muy elevados: 160–192 GB de RAM incluso en Q4_K_M, lo que excluye equipos de consumo convencionales.
- El modelo base piensa por defecto (`<think>...</think>`); los builds JiRack planean desactivar el razonamiento por defecto, lo que puede alterar el comportamiento esperado.
- La verificación numérica frente al modelo base es correcta, pero no hay validación de calidad downstream publicada.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/JiRackDeltaNet_180b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Demo chat: https://huggingface.co/spaces/CMSManhattan/JiRackDeltaNet-180B-demo
- Tokenizer JiRack: https://huggingface.co/CMSManhattan/JiRackDeltaNetTokenizer
- JiRack Coding Agent IDE: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin JetBrains: https://plugins.jetbrains.com/plugin/35073-jirack-agent
- Plugin VS Code: https://marketplace.visualstudio.com/items?itemName=JiRackautomationCodingAgentIDE.jirack-agent
- Ollama: https://ollama.com/cmsmanhattan
- Spring AI Alibaba: https://github.com/alibaba/spring-ai-alibaba
- Gorilla: https://github.com/ShishirPatil/gorilla
