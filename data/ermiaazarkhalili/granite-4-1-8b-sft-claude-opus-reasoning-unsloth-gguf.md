# ermiaazarkhalili/Granite-4.1-8B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF

## Resumen

Este modelo es una cuantización GGUF de un fine-tune LoRA del modelo base `ibm-granite/granite-4.1-8b`, desarrollado por Behrooz Azarkhalili (usuario `ermiaazarkhalili`). El fine-tune se realizó mediante aprendizaje supervisado (SFT) sobre un dataset privado de destilación de razonamiento de Claude Opus, con el objetivo de transferir capacidades de razonamiento paso a paso al modelo Granite 4.1 de 8B parámetros. El resultado es un modelo conversacional optimizado para tareas de razonamiento y seguimiento de instrucciones, empaquetado en formato GGUF para su uso con llama.cpp, Ollama y otras herramientas de inferencia local.

La relevancia de este modelo radica en que combina la base sólida de Granite 4.1 de IBM (con soporte nativo para tool calling, RAG y JSON estructurado) con un entrenamiento específico en razonamiento, todo ello bajo licencia Apache 2.0. Al estar cuantizado en varios niveles (de Q2_K a Q8_0), permite ejecutarse en hardware variado, desde GPUs de consumo hasta entornos de servidor. El modelo tiene aproximadamente 8,79 mil millones de parámetros y se distribuye en archivos GGUF de entre 3,41 GB y 9,35 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (base Granite 4.1 8B) |
| Parametros totales | 8.791.592.960 (8,79B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó max sequence length de 2048; la longitud nativa del base no se especifica en la información proporcionada) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponibles (el base Granite 4.1 es multilingüe, pero no se detalla la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del Granite 4.1 8B de IBM, un transformer decoder-only denso con soporte nativo para tool calling, retrieval-augmented generation (RAG), salida JSON estructurada y capacidades multilingües. Sobre esta base se aplicó un fine-tune con LoRA (rank 16, alpha 16) mediante QLoRA en precisión 4-bit, utilizando las librerías Unsloth y TRL. El entrenamiento se realizó durante 1 época con un batch efectivo de 8 (2 x 4 acumulación de gradientes), una tasa de aprendizaje de 0.0002 y una longitud máxima de secuencia de 2048 tokens. Los módulos objetivo del LoRA fueron `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`.

El dataset de entrenamiento, `ermiaazarkhalili/claude-reasoning-distillation` (privado), contiene destilaciones de razonamiento de Claude Opus. La pérdida de entrenamiento observada descendió de 1.2859 a 0.7235 en 1.310 pasos, según los logs SLURM. Los adaptadores LoRA se fusionaron en los pesos del modelo base, por lo que el modelo resultante no puede separarse del fine-tune. No se ha realizado ninguna evaluación de benchmarks sobre este checkpoint; solo se reportan observaciones de pérdida de entrenamiento.

## Capacidades

- Generación de texto conversacional con énfasis en razonamiento paso a paso, gracias al fine-tune sobre destilaciones de Claude Opus.
- Seguimiento de instrucciones mejorado, heredado del base Granite 4.1 que destaca en instruction following.
- Soporte de tool calling / function calling, capacidad nativa del modelo base Granite 4.1.
- Generación de JSON estructurado, útil para integraciones con APIs y agentes.
- Capacidades de retrieval-augmented generation (RAG), soportadas por el base.
- Razonamiento matemático y codificación, áreas en las que Granite 4.1 muestra mejoras según la documentación de IBM.
- Capacidades multilingües del base, aunque no se especifica la lista exacta de idiomas en la información proporcionada.

## Casos de uso

- Asistentes de razonamiento técnico: el modelo puede descomponer problemas complejos en pasos intermedios, gracias al fine-tune con razonamiento de Claude Opus. Es adecuado para tutorías de programación o explicaciones de conceptos técnicos.
- Generación de código con explicaciones: al combinar las capacidades de codificación de Granite 4.1 con el razonamiento mejorado, puede generar fragmentos de código acompañados de justificaciones detalladas.
- Integración en pipelines de automatización con tool calling: su soporte nativo para function calling permite conectarlo a APIs externas, bases de datos o servicios web para tareas como consulta de información o ejecución de acciones.
- Chatbots de atención al cliente con contexto largo: aunque la longitud de contexto no está confirmada, el base Granite 4.1 soporta ventanas amplias; el modelo puede gestionar conversaciones multi-turno con instrucciones complejas.
- Extracción de información estructurada: gracias a la generación de JSON, puede convertir texto no estructurado en salidas JSON para alimentar sistemas downstream.
- Prototipado rápido de agentes de IA: al ser un modelo GGUF, se puede desplegar localmente con llama.cpp u Ollama, lo que facilita experimentar con agentes de razonamiento sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha realizado ninguna evaluación de rendimiento sobre este checkpoint; solo se reportan observaciones de pérdida de entrenamiento (primera pérdida 1.2859, pérdida final 0.7235). No se deben inferir capacidades de rendimiento a partir de estos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo GGUF elegido, se necesitan aproximadamente:
  - Q2_K (3,41 GB): cabe en GPUs con 4 GB de VRAM o menos.
  - Q3_K_M (4,35 GB): requiere al menos 6 GB de VRAM.
  - Q4_K_M (5,35 GB): requiere al menos 8 GB de VRAM.
  - Q5_K_M (6,25 GB): requiere al menos 8-10 GB de VRAM.
  - Q6_K (7,22 GB): requiere al menos 10-12 GB de VRAM.
  - Q8_0 (9,35 GB): requiere al menos 12-16 GB de VRAM.
- GPUs recomendadas: para las cuantizaciones más bajas (Q2_K, Q3_K_M) puede ejecutarse en GPUs de consumo como GTX 1660 (6 GB) o RTX 3060 (12 GB). Para Q4_K_M y superiores, se recomienda RTX 3090, RTX 4090 o GPUs de datacenter como A10, A100 o H100.
- Sí cabe en GPUs de consumo: las versiones Q2_K a Q5_K_M son viables en GPUs de gama media-alta para consumidores.
- Opciones de despliegue: llama.cpp (compatible con CPU y GPU), Ollama (creando un Modelfile), y potencialmente vLLM o TGI si se convierten los pesos a safetensors (aunque el formato nativo es GGUF).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite-4.1-8B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF (este) | 8,79B | No disponible | Apache 2.0 | GGUF | Fine-tune de razonamiento sobre Granite 4.1 8B |
| ibm-granite/granite-4.1-8b (base) | 8B aprox. | No disponible | Apache 2.0 | safetensors | Modelo base sin fine-tune de razonamiento |
| Llama 3.1 8B (referencia) | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Modelo denso popular, sin fine-tune específico de razonamiento |

No se dispone de datos de rendimiento comparativos fiables, ya que este checkpoint no ha sido evaluado con benchmarks. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación de benchmarks sobre este checkpoint; los únicos datos reportados son observaciones de pérdida de entrenamiento, que no deben interpretarse como indicadores de calidad.
- Hereda los sesgos, el conocimiento limitado (knowledge cutoff) y los modos de fallo del modelo base Granite 4.1 8B.
- El fine-tune se realizó sobre un único dataset de instrucciones (destilación de razonamiento de Claude Opus); el comportamiento fuera de esa distribución de datos no está probado.
- Los adaptadores LoRA se fusionaron en los pesos base, por lo que el modelo no puede revertirse al estado original sin el fine-tune.
- El dataset de entrenamiento es privado, lo que limita la reproducibilidad y la auditoría externa.
- La longitud de contexto no está confirmada; el entrenamiento usó 2048 tokens, pero el modelo base podría soportar más. Se recomienda verificar con pruebas propias.
- Aunque la licencia es Apache 2.0, el uso comercial debe cumplir con los términos de la licencia del modelo base y de los datos de entrenamiento (estos últimos privados, lo que puede generar incertidumbre legal).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/ermiaazarkhalili/Granite-4.1-8B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Repositorio de pesos completos (pre-cuantización): https://huggingface.co/ermiaazarkhalili/Granite-4.1-8B-SFT-Claude-Opus-Reasoning-Unsloth
- Modelo base Granite 4.1 8B: https://huggingface.co/ibm-granite/granite-4.1-8b
- Documentación oficial de IBM Granite 4.1: https://www.ibm.com/granite/docs/models/granite4-1
- Repositorio GitHub de IBM Granite 4.1: https://github.com/ibm-granite/granite-4.1-language-models
- Perfil del autor en HuggingFace: https://huggingface.co/ermiaazarkhalili
