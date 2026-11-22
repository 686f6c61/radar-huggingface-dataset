# shiva123782/RavanAI

## Resumen
RavanAI es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 bajo la marca "ThE" y el motor "Kaveri AI VAPAE Engine". Se presenta como un "Sovereign Enterprise Small Language Model" orientado a despliegues empresariales con requisitos de identidad de marca y cumplimiento normativo. El modelo base es un transformer causal de 0,5 mil millones de parámetros con una ventana de contexto de 32.768 tokens (según la especificación de Qwen2.5), aunque la model card no detalla el contexto efectivo tras el ajuste.

El ajuste se realizó con LoRA de rango 16 y alpha 32 sobre todos los módulos lineales (q, k, v, o, gate, up, down), con un pico de VRAM de entrenamiento de 3,2 GB. La model card hace un uso intensivo de terminología de verificación formal (Z3 SMT), benchmarks propietarios ("20-Crore Bijective Identity Benchmark") y referencias a normativa (EU AI Act artículo 53, DPDP Act 2025 india) que no vienen acompañadas de artefactos reproducibles públicos en la información disponible.

Su relevancia práctica es limitada: se trata de un adaptador LoRA de 0,5B parámetros con licencia Apache 2.0, útil como ejemplo de fine-tuning ligero y de despliegue en hardware de consumo, pero sin resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) publicados que permitan evaluar su calidad real frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen2.5 soporta 32.768 tokens) |
| Tipos de cuantizacion | 16-bit Bfloat16/Float16; 4-bit NormalFloat (NF4) mencionado para forward pass |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA sobre el base) |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen2.5-0.5B-Instruct, un transformer causal decoder-only. El adaptador tiene rango 16, alpha 32 y dropout 0,05, y se aplica a los siete módulos lineales del transformer (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). Se menciona el uso de LoRA+ con un factor de balanceo dinámico η_B = 8,0 · η_A, una variante que asigna una tasa de aprendizaje mayor a la matriz B del adaptador.

El dataset de ajuste indicado en las etiquetas es yahma/alpaca-cleaned, un conjunto de instrucciones en inglés de aproximadamente 52.000 ejemplos. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La model card menciona "verificación formal Z3 SMT" para garantizar ausencia de OOM y un benchmark propietario de identidad, pero no se aportan scripts, trazas ni artefactos verificables en la información disponible.

## Capacidades
- Generación de texto conversacional e instrucciones en inglés, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Ajuste orientado a identidad de modelo (responder sobre su propio origen y desarrollador), según el benchmark propietario de la model card.
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño de 0,5B parámetros del base.
- Soporte de cuantización NF4 para inferencia en hardware de baja VRAM.
- Capacidades multilingües: solo inglés declarado; el base Qwen2.5 soporta más idiomas, pero el ajuste no lo declara.
- Tool calling / function calling: no disponible de forma explícita en la model card (el base Qwen2.5-Instruct lo soporta parcialmente).
- Modo thinking, visión o audio: no disponible.

## Casos de uso
- Prototipado de asistentes conversacionales en inglés: el modelo cabe en GPUs de consumo y permite iterar rápidamente sobre prompts y flujos multi-turno sin infraestructura dedicada.
- Despliegue en entornos con VRAM limitada: con cuantización NF4 el adaptador más el base ocupan del orden de 1-2 GB, lo que permite ejecutarlo en portátiles con GPU integrada o en CPU.
- Fine-tuning educativo y demostraciones de LoRA: sirve como ejemplo reproducible de ajuste PEFT con rango 16 sobre un modelo pequeño, útil para cursos y tutoriales.
- Clasificación y extracción de información simple: tareas de etiquetado, resumen corto o extracción de entidades en inglés donde la latencia importa más que la precisión máxima.
- Chatbots de dominio acotado con identidad de marca: el ajuste está orientado a que el modelo responda con una identidad corporativa concreta, útil en demos de marca blanca.
- Pruebas de integración en pipelines de generación de texto: validar flujos con transformers + PEFT antes de escalar a modelos mayores.
- Generación de texto auxiliar en herramientas de desarrollo: autocompletado de documentación o mensajes de commit en inglés, siempre con revisión humana.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente métricas propietarias no reproducibles:

| Benchmark propietario | Resultado declarado | Verificabilidad |
|---|---|---|
| 20-Crore Bijective Identity Benchmark | 100,0% retención de identidad, 0,0% fuga del proveedor base | No se aportan scripts ni trazas |
| Z3 SMT Invariant | UNSAT_SAFE (0 OOM) | No se aporta el modelo Z3 ni el encoding |
| Latencia de inferencia | 18,2 ms (P99), 198+ tok/s | No se especifica hardware ni batch |

## Requisitos de hardware
- VRAM estimada para inferencia: ~1 GB en FP16 (0,5B parámetros), ~0,3-0,5 GB en NF4; el adaptador LoRA añade decenas de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo está sobredimensionado para GPUs de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers + PEFT (flujo oficial de la model card), vLLM (requiere fusionar el adaptador), llama.cpp/Ollama (requiere conversión a GGUF), TGI.
- Latencia y throughput: la model card declara 18,2 ms P99 y 198+ tok/s en "standard desktop workstation", sin especificar hardware; no verificable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RavanAI | 0,5B + LoRA | no disponible (base 32.768) | Apache 2.0 | Ajuste LoRA sobre Qwen2.5-0.5B-Instruct; sin benchmarks estándar |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Apache 2.0 | Modelo base; benchmarks públicos y amplia adopción |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Mayor capacidad con requisitos aún modestos |
| SmolLM2-360M-Instruct | 0,36B | 8.192 | Apache 2.0 | Alternativa pequeña con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2B | 131.072 | Llama 3.2 Community | Mayor contexto y ecosistema, licencia con restricciones |

## Limitaciones y advertencias
- Tamaño de 0,5B parámetros: capacidad de razonamiento, matemáticas y código muy limitada en comparación con modelos de 7B o superiores; propenso a errores en tareas multi-paso.
- Solo inglés declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación elevado, especialmente en preguntas factuales y en la propia identidad del modelo si el ajuste no generaliza.
- Las afirmaciones de verificación formal (Z3 SMT), cumplimiento del EU AI Act artículo 53 y DPDP Act 2025 no vienen respaldadas por artefactos públicos verificables en la información disponible; deben tratarse como marketing hasta su reproducción independiente.
- El benchmark "20-Crore Bijective Identity" es propietario y no está descrito con metodología reproducible.
- Sin resultados en benchmarks estándar: no es posible comparar su calidad objetiva frente al modelo base ni frente a alternativas.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.
- El adaptador requiere cargar el modelo base Qwen2.5-0.5B-Instruct por separado; no es un checkpoint autónomo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/shiva123782/RavanAI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Documentación de PEFT: https://huggingface.co/docs/peft
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- EU AI Act (artículo 53): https://artificialintelligenceact.eu/article/53/
- Indian DPDP Act 2025: https://www.meity.gov.in/data-protection-framework
