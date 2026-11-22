# sam-llm-dev/Llama-3.2-1B-SAM-GGUF

## Resumen

Llama-3.2-1B-SAM (Small Assistant Model) es un ajuste fino mediante QLoRA del modelo `meta-llama/Llama-3.2-1B-Instruct`, desarrollado por el usuario sam-llm-dev y distribuido en formato GGUF. El objetivo declarado del autor es ofrecer explicaciones educativas densas en hechos, rápidas y con un consumo de VRAM muy reducido, de modo que pueda ejecutarse en hardware de consumo modesto, dispositivos de borde e incluso entornos móviles.

El modelo parte de la arquitectura Llama 3.2 de Meta con 1.235.814.432 parámetros totales, lo que lo sitúa en la gama ultra-ligera. Se ha entrenado sobre el dataset propio `sam-llm-dev/SAM-Family-Dataset` y se publica bajo la licencia Llama 3.2 Community License. Su relevancia actual radica en la combinación de un tamaño mínimo (capaz de correr con ~1 GB de VRAM en cuantización Q4_K_M) con un enfoque especializado en divulgación educativa, lo que lo hace atractivo para prototipos docentes y despliegues con recursos limitados.

No obstante, se trata de un modelo con cero descargas en el momento de redactar esta ficha, sin benchmarks publicados (el autor indica que las métricas están "en progreso") y con un roadmap que incluye para la v2.0 un pipeline RAG y herramientas de cálculo/ejecución de código. Por tanto, debe evaluarse con cautela y validarse empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.2-1B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | FP16, Q8_0, Q4_K_M (formato GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (Llama 3.2 Community License Agreement) |
| Formato de pesos | GGUF (repo de 2,5 GB); también etiquetado como transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2, con 1.235.814.432 parámetros, derivado del checkpoint instruct de Meta (`meta-llama/Llama-3.2-1B-Instruct`). El ajuste se realizó mediante QLoRA, técnica que congela los pesos base en cuantización de 4 bits e introduce adaptadores de bajo rango entrenables, reduciendo drásticamente los requisitos de memoria durante el entrenamiento.

El dataset de ajuste es `sam-llm-dev/SAM-Family-Dataset`, de composición no detallada en la model card. No se especifican el número de tokens de entrenamiento, la mezcla de datos, ni si hubo etapas de RLHF o DPO adicionales. La innovación declarada no es arquitectónica sino de propósito: el ajuste busca respuestas "densas en hechos" y explicaciones didácticas concisas, orientadas a estudiantes y docentes. El autor anuncia para la v2.0 la incorporación de un pipeline RAG y una herramienta de calculadora/ejecución de Python para verificar hechos, lo que sugiere que la veracidad factual es una debilidad reconocida en la versión actual.

## Capacidades

- Generación de texto conversacional en inglés, con orientación a explicaciones educativas.
- Desglose de conceptos técnicos y científicos de forma concisa (fine-tuning específico para docencia).
- Razonamiento básico y respuesta a preguntas, limitado por el tamaño de 1B parámetros.
- Capacidad multilingüe: únicamente inglés declarado; el resto de idiomas no está soportado oficialmente.
- Tool calling / function calling: no disponible de forma nativa en esta versión (el autor lo sitúa en el roadmap de la v2.0).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explícito: no disponible.
- Visión o audio: no disponible.
- Ejecución en entornos de baja VRAM y dispositivos de borde gracias al formato GGUF.

## Casos de uso

- Tutor educativo en local: el modelo puede desplegarse en un portátil con GPU de gama baja o incluso en CPU (Q4_K_M, ~1 GB) para ofrecer explicaciones paso a paso de conceptos de matemáticas, física o programación a estudiantes, sin depender de la nube.
- Asistente de estudio offline en dispositivos de borde: al caber en Raspberry Pi o móviles de gama alta con llama.cpp, permite crear aplicaciones de repaso académico sin conexión, útil en entornos con conectividad limitada.
- Generación de material didáctico breve: redacción de resúmenes, definiciones y ejemplos para fichas de asignatura, aprovechando el ajuste orientado a densidad de hechos y concisión.
- Prototipado rápido de chatbots educativos: su reducido tamaño permite iterar con bajo coste en fases de diseño de producto antes de migrar a modelos mayores.
- Filtro o primer nivel en pipelines RAG: puede actuar como modelo de reranking o de generación preliminar en sistemas de recuperación aumentada (especialmente en la v2.0 anunciada), reduciendo latencia y coste.
- Demostraciones y talleres de fine-tuning: sirve como caso práctico para enseñar QLoRA y despliegue GGUF en cursos de IA, dado su tamaño manejable y su procedencia abierta.
- Evaluación comparativa de modelos pequeños: útil como baseline en investigaciones sobre eficiencia de modelos de 1B parámetros en tareas educativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas de evaluación inicial están "en progreso" y se actualizarán en una próxima versión.

## Requisitos de hardware

- VRAM/RAM estimada (según el autor):
  - FP16: ~2,5 GB – 3,0 GB.
  - Q8_0: ~1,5 GB – 2,0 GB.
  - Q4_K_M: ~1,0 GB – 1,3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060) para FP16; para Q4 basta con GPU integradas modernas o CPU.
- Cabe en GPU consumer: sí, en todas las GPU con ≥2 GB de VRAM; también en CPU y dispositivos de borde.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (llama-cpp-python). El repo se etiqueta también como `endpoints_compatible`, lo que sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles (sin datos publicados). Por tamaño (1B) y cuantización 4-bit, se espera una generación de decenas de tokens por segundo en GPU consumer, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Llama-3.2-1B-SAM (este) | 1,24 B | no disponible | en | Llama 3.2 | GGUF | No |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128 K (según Meta) | multilingüe | Llama 3.2 | safetensors, GGUF | Sí (Meta) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 K | multilingüe | Apache 2.0 | safetensors, GGUF | Sí |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 K | en (principalmente) | Apache 2.0 | safetensors, GGUF | Sí |

Nota: los datos de los modelos comparativos provienen de sus respectivas model cards públicas; el modelo de este análisis no ha publicado métricas, por lo que la comparación de rendimiento no puede establecerse con rigor.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la calidad del ajuste frente al modelo base.
- Riesgo elevado de alucinación: el autor reconoce implícitamente esta limitación al planificar un pipeline RAG y herramientas de verificación para la v2.0.
- Solo inglés: no soporta castellano ni otros idiomas de forma oficial.
- Contexto no confirmado: aunque el modelo base Llama 3.2-1B-Instruct soporta 128 K tokens, la model card no confirma que el ajuste preserve esa ventana.
- Licencia Llama 3.2 Community License: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales para productos derivados) y obliga a incluir el aviso "Built with Llama" y a cumplir la política de uso aceptable de Meta.
- Modelo con cero descargas y un solo "like": sin validación comunitaria, lo que desaconseja su uso en producción sin evaluación previa.
- Tamaño de 1B parámetros: capacidad de razonamiento limitada en tareas complejas (matemáticas avanzadas, código extenso, agentes multi-paso).
- Dataset de ajuste no documentado: se desconoce su composición, posible sesgo y procedencia, lo que dificulta auditar el comportamiento del modelo.
- Fecha de creación futura (2026-11-22): conviene verificar la autenticidad y vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-llm-dev/Llama-3.2-1B-SAM-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/sam-llm-dev/SAM-Family-Dataset
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable de Meta: https://www.llama.com/llama3_2/use-policy/
- Contacto del autor: samllmdev@gmail.com
