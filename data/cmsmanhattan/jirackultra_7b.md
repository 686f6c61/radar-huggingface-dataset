# CMSManhattan/JiRackUltra_7b

## Resumen

JiRack Ultra 7B es un modelo de generación de texto de 7.615.616.512 parámetros (unos 7,6 mil millones) publicado por CMSManhattan en Hugging Face bajo licencia MIT. El autor lo describe como una refactorización de un modelo DeepSeek con soporte nativo de ternarización estilo BitNet (1,58 bit), orientada a inferencia eficiente en CPU y con cuantizaciones GGUF listas para ejecutar. La model card menciona además un tokenizador propio, `JiRackPrecisionTokenizer`, con etiquetas específicas para enrutamiento (routing), tool calling, robótica, multimedia, visión y sonido.

El modelo se presenta como una opción de bajo coste para despliegues en la nube y para entornos con memoria limitada, con variantes Docker que van desde los 3,02 GB (Q2_K) hasta los 15,24 GB (precisión completa). Declara soporte para trece idiomas (inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés) y se distribuye tanto en safetensors como en GGUF.

La información publicada es, sin embargo, notablemente escasa en lo que respecta a detalles verificables de entrenamiento, datos, benchmarks y arquitectura interna. La model card es fundamentalmente material promocional y de despliegue, con afirmaciones sobre capacidades (robótica, tool calling, visión) que no vienen acompañadas de evaluaciones cuantitativas ni de documentación técnica del proceso de entrenamiento. Esta ficha refleja esa situación y marca explícitamente como "no disponible" todo aquello que la información proporcionada no permite confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2 (tag `qwen2`), con soporte declarado de ternarización estilo BitNet (1,58 bit); el autor la denomina "JiRack Ternary Architecture" |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (no se declara como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q2_K, Q3_K_M, Q4_K_M y precisión completa; ternario TQ2_0 con soporte AVX2 y AVX-512 (según el autor) |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura con detalle técnico. Las etiquetas del repositorio indican `qwen2`, lo que sugiere una base de transformer decoder-only de la familia Qwen2, mientras que la model card afirma que el modelo "fue refactorizado con características BitNet" y que está "construido sobre un modelo DeepSeek rediseñado por CMSManhattan". Ambas afirmaciones son difíciles de conciliar y no vienen acompañadas de documentación que las respalde. El autor menciona una "JiRack Ternary Architecture" propia y un tokenizador específico (`JiRackPrecisionTokenizer`) con etiquetas añadidas para routing, media, visión, sonido, tool call y robótica.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre el proceso de destilación o ajuste fino. La model card menciona QAT (quantization-aware training) como servicio opcional ofrecido por el autor para ternarizar el modelo según el dataset del cliente, y enlaza una guía de conversión a GGUF TQ2_0 para llama.cpp. También se menciona la posibilidad de exportación a ONNX y un servidor Java ONNX alternativo. No hay información verificable sobre innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, según la model card.
- Tool calling / function calling, con soporte declarado mediante etiquetas del tokenizador JiRack Precision; el autor enlaza ejemplos con ToolBench, Gorilla y Spring AI Alibaba.
- Enrutamiento (routing) como capacidad declarada en el tokenizador.
- Capacidades de robótica declaradas en las etiquetas y en el tokenizador, sin documentación técnica adicional.
- Capacidades de visión, sonido y multimedia declaradas en las etiquetas y en el tokenizador, sin especificación de arquitectura multimodal ni de módulos de visión o audio.
- Soporte multilingüe declarado para trece idiomas.
- Integración declarada con agentes de codificación (plugins para Eclipse, JetBrains y VS Code) y con un IDE propio.
- No se documenta un modo "thinking" o razonamiento explícito; la model card menciona "Jirack chat without reasoning feature" como variante en Ollama.

## Casos de uso

- Inferencia en CPU con presupuesto de memoria reducido: las variantes Q2_K (3,02 GB) y Q3_K_M (3,81 GB) permiten ejecutar el modelo en máquinas sin GPU dedicada, con un consumo de RAM estimado de 4,5 a 5,3 GB según el autor.
- Despliegue en contenedores Docker para servicios de generación de texto: la model card proporciona comandos `docker run` con imágenes preconstruidas y puerto 7869, lo que facilita su integración en infraestructuras existentes.
- Uso como modelo experto en pipelines RAG: el autor lo posiciona explícitamente como "expert model in RAG deployments", con la posibilidad de usar el servidor Java ONNX como alternativa de servicio.
- Automatización de tool calling en aplicaciones empresariales: la combinación de tokenizador con etiquetas de tool call y los ejemplos enlazados (Spring AI Alibaba para Java, Gorilla para Python) apunta a integraciones con APIs y sistemas corporativos.
- Asistencia a la codificación en IDE: los plugins publicados para Eclipse, JetBrains y VS Code permiten usar el modelo como agente de codificación local sobre Ollama, con revisión manual de cambios antes de aplicarlos.
- Experimentación con cuantización ternaria: la guía de conversión a TQ2_0 para llama.cpp permite evaluar el modelo en formato ternario con instrucciones AVX2/AVX-512, útil para investigación en modelos de baja precisión.
- Prototipado multilingüe: el soporte declarado de trece idiomas permite probar aplicaciones de generación de texto en mercados con esos idiomas, aunque sin garantías documentadas de calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación cuantitativa, ni comparaciones numéricas con modelos de referencia.

## Requisitos de hardware

- VRAM/RAM estimada según las variantes declaradas por el autor:
  - Precisión completa: 15,24 GB de pesos, ~16,7 GB de RAM.
  - Q4_K_M: 4,68 GB de pesos, ~6,2 GB de RAM (opción recomendada por el autor).
  - Q3_K_M: 3,81 GB de pesos, ~5,3 GB de RAM.
  - Q2_K: 3,02 GB de pesos, ~4,5 GB de RAM.
- El modelo está optimizado para CPU; no se especifican requisitos de GPU ni modelos recomendados (A100, H100, RTX 4090, etc.).
- Cabe en GPUs de consumo en las cuantizaciones Q2_K a Q4_K_M por tamaño de pesos, aunque no se documenta rendimiento en GPU.
- Opciones de despliegue declaradas: llama.cpp, Ollama, Docker (imágenes `cmsmanhattan/jirack-ultra-7b-cpu`), exportación a ONNX y servidor Java ONNX.
- Latencia y throughput: no disponibles. El autor menciona soporte de instrucciones AVX2 y AVX-512 para el formato ternario TQ2_0, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JiRack Ultra 7B | 7,6 B | No disponible | MIT | safetensors, GGUF | Ternarización declarada, orientado a CPU |
| Qwen2-7B | 7,6 B | 32.768 tokens (según documentación pública de Qwen2) | Apache 2.0 (según documentación pública de Qwen2) | safetensors, GGUF | Base declarada por las etiquetas del repositorio; benchmarks públicos disponibles |
| BitNet b1.58 (variantes) | Escalas 700M–3,9B en la publicación original | No disponible | MIT (según publicación) | No disponible | Referencia académica de modelos ternarios; no comparable directamente en tamaño |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa con alternativas. La comparación con Qwen2-7B se incluye únicamente por la etiqueta `qwen2` del repositorio y por compartir orden de magnitud de parámetros; no implica equivalencia de comportamiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar las capacidades declaradas (tool calling, robótica, visión, routing) con datos objetivos.
- Inconsistencia en la documentación: la model card afirma simultáneamente una base Qwen2 (etiqueta) y una base DeepSeek, sin aclarar cuál es la arquitectura real ni el proceso de entrenamiento.
- Capacidades multimodales (visión, sonido) declaradas sin especificación de módulos, datos de entrenamiento ni evaluaciones; deben tratarse como no verificadas.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasas de error.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de alineamiento, por lo que no se pueden evaluar sesgos de género, etnia, idioma o dominio.
- Cobertura multilingüe declarada para trece idiomas sin métricas por idioma; la calidad relativa entre idiomas es desconocida.
- Longitud de contexto no especificada, lo que impide planificar despliegues que dependan de ventanas largas.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución, pero el usuario asume la responsabilidad sobre el comportamiento del modelo.
- Dependencia de un tokenizador propio (`JiRackPrecisionTokenizer`) para las capacidades de tool calling y routing; su integración requiere adaptar los procesadores de tool calls, según la propia model card.
- La model card incluye material promocional (menciones de "partnership" con NVIDIA y FISERV, servicios de QAT de pago, descargas de ejecutables) que no constituye documentación técnica verificable.
- El repositorio ocupa 77,1 GB, lo que refleja múltiples formatos y cuantizaciones; conviene seleccionar únicamente los artefactos necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackUltra_7b
- Tokenizador JiRack Precision: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Guía de conversión a GGUF TQ2_0 para llama.cpp: https://huggingface.co/CMSManhattan/JiRackUltra_7b/blob/main/QAT_to_Llama.cpp_GGUF_TQ2_0.md
- Guía de exportación a ONNX: https://huggingface.co/CMSManhattan/JiRackUltra_7b/blob/main/jirackultra_7b_onnx_export_guide.md
- Demo de chat en vivo (Space): https://huggingface.co/spaces/CMSManhattan/JiRackUltra_7b
- Demo ternaria de producción: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-8B-chat
- Variantes de chat TQ2_0: https://huggingface.co/spaces/CMSManhattan/JiRack-36B-Chat , https://huggingface.co/spaces/CMSManhattan/JiRack-16B-Chat , https://huggingface.co/spaces/CMSManhattan/JiRack-8B-Chat , https://huggingface.co/spaces/CMSManhattan/JiRack-2B-Chat
- Perfil del autor en Ollama: https://ollama.com/cmsmanhattan
- Runtime de escritorio JiRack: https://huggingface.co/CMSManhattan/JiRack-runtime
- Sitio web del IDE JiRack: https://www.jirack.com
- Plugin de Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin de JetBrains: https://plugins.jetbrains.com/plugin/35073-jirack-agent
- Plugin de VS Code: https://marketplace.visualstudio.com/items?itemName=JiRackautomationCodingAgentIDE.jirack-agent
- Spring AI Alibaba (ejemplos de tool calling en Java): https://github.com/alibaba/spring-ai-alibaba
- Gorilla (ejemplos de tool calling en Python): https://github.com/ShishirPatil/gorilla
- ToolBench: https://github.com/OpenBMB/ToolBench
- Dataset de function calling de Glaive (Qwen2-7B-Instruct): https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
- Dataset Hermes function calling v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
