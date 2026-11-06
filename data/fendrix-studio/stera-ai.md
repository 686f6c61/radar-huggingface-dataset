# Fendrix-Studio/Stera-AI

## Resumen

Stera AI es un modelo de lenguaje multimodal (visión y texto) desarrollado por Fendrix Studio mediante fine-tuning con LoRA sobre Qwen3-VL-4B-Instruct, el modelo de 4B parámetros con capacidades de visión de Alibaba (equipo Qwen). El resultado se ha exportado a formato GGUF cuantizado (Q4_K_M) para su uso local en herramientas como LM Studio o llama.cpp. El problema que resuelve es ofrecer un asistente conversacional con análisis de imágenes que cabe en hardware de consumo, sin depender de APIs externas.

Su relevancia radica en la combinación de tres factores: un modelo base de calidad contrastada (Qwen3-VL-4B), una licencia Apache 2.0 que permite uso comercial sin restricciones, y una cuantización Q4_K_M que reduce el tamaño a unos 3,3 GB, haciéndolo accesible a GPUs de consumo e incluso a equipos con suficiente RAM para inferencia en CPU. Es un ejemplo representativo de la tendencia de fine-tunes personales y comunitarios sobre modelos base pequeños multimodales.

Al tratarse de un LoRA fusionado y exportado a GGUF, hereda la arquitectura transformer del modelo base Qwen3-VL-4B-Instruct, incluyendo su proyector de visión (distribuido como archivo `mmproj` independiente en f16). No se ha publicado documentación técnica sobre los datos de entrenamiento del fine-tuning ni los objetivos concretos del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredado de Qwen3-VL-4B-Instruct) con proyector de visión |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (el modelo base no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-VL-4B-Instruct soporta contextos largos, pero el dato concreto no figura en la model card) |
| Tipos de cuantizacion | Q4_K_M (pesos principales), f16 (proyector de visión mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo principal Q4_K_M + mmproj f16 para visión) |

## Arquitectura y entrenamiento

Stera AI se basa en Qwen3-VL-4B-Instruct, un transformer decoder-only multimodal de la familia Qwen3 que integra un codificador de visión conectado al modelo de lenguaje mediante un proyector (de ahí el archivo `mmproj` separado en la exportación GGUF). El fine-tuning se realizó con la técnica LoRA (Low-Rank Adaptation), que entrena matrices de bajo rango sobre los pesos congelados del modelo base, y posteriormente se fusionó y exportó a GGUF mediante llama.cpp.

Sobre el proceso de entrenamiento no hay datos publicados: no se especifican el dataset utilizado, el número de pasos, el rango LoRA, los módulos objetivo ni si se emplearon técnicas de alineación adicionales (RLHF, DPO). Tampoco se describe el propósito del fine-tuning (estilo conversacional, dominio específico, idioma, etc.), por lo que el alcance real del ajuste respecto al modelo base es desconocido. La model card indica únicamente que es un "modèle personnel" (modelo personal) del autor.

## Capacidades

- Generación de texto conversacional (heredada del modelo base Qwen3-VL-4B-Instruct).
- Análisis y comprensión de imágenes: el archivo `mmproj-Stera-f16.gguf` permite procesar entradas visuales en LM Studio y llama.cpp.
- Compatibilidad con LM Studio y llama.cpp para inferencia local.
- Formato conversacional (tag `conversational` en Hugging Face).
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible (no se documenta si el fine-tuning conserva estas capacidades del modelo base).
- Capacidades multilingues: no disponible explícitamente, aunque Qwen3-VL-4B-Instruct soporta múltiples idiomas de forma nativa.

## Casos de uso

- Chatbot local con análisis de imágenes: al incluir el proyector de visión, puede describir imágenes, extraer texto de capturas de pantalla o responder preguntas sobre documentos escaneados directamente en LM Studio, sin enviar datos a servicios externos.
- Asistente privado offline: con 3,3 GB de tamaño, es adecuado para entornos donde la privacidad es crítica (datos médicos, legales o corporativos) y no se desea usar APIs en la nube.
- Prototipado rápido de aplicaciones multimodales: la compatibilidad con llama.cpp permite integrarlo en aplicaciones locales vía servidor (llama-server) para pruebas de conceptos de RAG visual o asistentes con entrada de imágenes.
- Uso en portátiles y estaciones de trabajo modestas: la cuantización Q4_K_M permite ejecutarlo en GPUs de consumo con 6-8 GB de VRAM o en CPU con RAM suficiente.
- Experimentación educativa: al ser un fine-tune LoRA documentado como proyecto personal, sirve como referencia de flujo completo (base → LoRA → fusión → GGUF → mmproj) para quien aprenda a distribuir modelos cuantizados.
- Base para fine-tunings adicionales: al derivar de Qwen3-VL-4B-Instruct con licencia Apache 2.0, puede emplearse como punto de partida para nuevos ajustes de dominio sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fine-tune LoRA sobre Qwen3-VL-4B-Instruct sin evaluaciones documentadas, no es posible afirmar si mantiene intactas las puntuaciones del modelo base en MMLU, MMMU, HumanEval u otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3-4 GB para el modelo principal en Q4_K_M, más unos 800 MB adicionales para el proyector de visión en f16; en total, en torno a 4-5 GB de VRAM con contexto moderado.
- GPUs recomendadas: cualquier GPU de consumo con 6 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4090 con holgura amplia); también viable en Apple Silicon (M1/M2/M3) mediante Metal en llama.cpp y LM Studio.
- Cabe en GPUs de consumo: sí, con holgura en la mayoría de GPUs de 6 GB o más; también ejecutable en CPU si se dispone de 8 GB de RAM libres, con latencia considerablemente mayor.
- Opciones de despliegue: LM Studio (mencionado explícitamente en la model card), llama.cpp (herramienta usada para la exportación), y de forma indirecta cualquier runtime compatible con GGUF (Ollama puede aceptar GGUF, aunque no está documentado para este repo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stera AI (Fendrix-Studio) | ~4,02 B | GGUF Q4_K_M | Sí (mmproj f16) | Apache 2.0 | Hugging Face, 58 descargas |
| Qwen3-VL-4B-Instruct (base) | ~4 B | Safetensors, GGUF comunitario | Sí (nativa) | Apache 2.0 | Hugging Face, soporte oficial Qwen |
| Qwen2.5-VL-3B-Instruct | ~3,7 B | Safetensors, GGUF comunitario | Sí (nativa) | Apache 2.0 | Hugging Face, soporte oficial Qwen |
| Llama 3.2 3B Vision | ~3,2 B (texto) + codificador de visión | Safetensors, GGUF comunitario | Sí (nativa) | Llama 3.2 Community License (restricciones) | Hugging Face, soporte oficial Meta |

Stera AI no aporta mejoras documentadas frente a su modelo base; su valor diferencial es la distribución ya cuantizada y lista para LM Studio con el mmproj incluido. Para la mayoría de usuarios, el modelo base Qwen3-VL-4B-Instruct ofrece el mismo rango de capacidades con documentación oficial completa, mientras que Llama 3.2 3B Vision tiene una licencia menos permisiva para ciertos usos comerciales.

## Limitaciones y advertencias

- Falta total de documentación del fine-tuning: no se conocen los datos de entrenamiento, lo que impide evaluar sesgos introducidos, dominio del ajuste o degradación respecto al modelo base.
- Riesgo de alucinación: no evaluado; al heredar de Qwen3-VL-4B, cabe esperar el nivel de alucinación típico de modelos de 4B, posiblemente agravado por un fine-tuning sin documentación.
- Proyecto con tracción mínima (58 descargas, 1 like): sin validación comunitaria, sin issues visibles y sin evidencia de pruebas en producción.
- Contexto: la model card no especifica la longitud de contexto efectiva tras la exportación GGUF; conviene verificarla en llama.cpp antes de asumir contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero la procedencia de los datos del fine-tuning no está auditada, lo cual puede ser relevante en entornos regulados.
- El archivo mmproj es obligatorio para las capacidades de visión: si se carga solo el modelo principal, el comportamiento será exclusivamente textual.
- La model card del autor está parcialmente en francés y carece de secciones técnicas estándar (limitaciones, entrenamiento, evaluación).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Fendrix-Studio/Stera-AI
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Colección oficial de Qwen3-VL: https://huggingface.co/Qwen
- Repositorio de llama.cpp (herramienta de exportación e inferencia): https://github.com/ggml-org/llama.cpp
- LM Studio (entorno de ejecución recomendado por el autor): https://lmstudio.ai

No se han encontrado enlaces a papers, blogs, demos ni repositorios adicionales del autor en la informacion disponible.
