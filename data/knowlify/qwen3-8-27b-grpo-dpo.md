# Knowlify/qwen3.8-27b-grpo-dpo

## Resumen

Knowlify/qwen3.8-27b-grpo-dpo es un fine-tune del modelo Qwen3.8-27B, desarrollado por el equipo de Knowlify, especializado en la generación de escenas programáticas con Remotion (framework de vídeo en React/TypeScript). El modelo aplica un pipeline de entrenamiento apilado: primero un SFT (supervised fine-tuning) sobre el modelo base, después un paso de GRPO (Group Relative Policy Optimization) con una función de recompensa basada en compilación/renderizado y un juez de vídeo, y finalmente un DPO (Direct Preference Optimization) sobre pares de preferencias filtrados por margen de puntuación. El objetivo es mejorar la fiabilidad y calidad de la generación de código Remotion, un dominio donde los modelos generalistas suelen fallar en sintaxis y lógica de composición.

El modelo base Qwen3.8-27B es un modelo denso multimodal (visión y texto) de 27.000 millones de parámetros, con una ventana de contexto de 256K tokens, capacidades de razonamiento (modo thinking) y soporte para agentes y tool calling. Este fine-tune conserva esas capacidades y las orienta hacia la producción de vídeo programático. La relevancia actual radica en que combina técnicas de RL (GRPO) y alineación por preferencias (DPO) sobre un modelo de última generación, lo que lo convierte en un caso de estudio interesante para pipelines de entrenamiento con recompensas basadas en ejecución real (compile/render gate). El repositorio incluye los pesos fusionados en 16 bits y el adaptador LoRA del paso DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión + texto) con modos thinking e instruct |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (modelo base, según documentación de Qwen3.8) |
| Tipos de cuantizacion | No disponible en el repo; el modelo base admite GGUF, NVFP4 y otros via Unsloth |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifica para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados 16-bit) + adaptador LoRA en `lora/` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención estándar, diseñado para procesamiento multimodal (imagen y texto) y con dos modos de inferencia: modo thinking (razonamiento extendido) y modo instruct (respuesta directa). El fine-tune de Knowlify no modifica la arquitectura, sino que aplica un entrenamiento en tres fases:

1. **SFT**: partiendo de `Knowlify/qwen3.8-27b-sft-ge75`, un modelo ya ajustado con ejemplos de generación de escenas Remotion.
2. **GRPO**: optimización por políticas con recompensa basada en un "gated reward" que combina la compilación/renderizado real del código generado y un juez de vídeo (qwen3.8-max). Se seleccionó el mejor checkpoint (step 25) y se fusionó sobre el SFT.
3. **DPO**: alineación por preferencias usando el dataset `Knowlify/fablify-remotion-dpo` con pares filtrados por margen de puntuación ≥ 15, secuencia máxima de 6144 tokens, 1 época (1341 pares / 168 pasos) y LoRA con rango 32.

Las métricas finales de entrenamiento muestran una precisión de preferencia de 0.875-1.0, márgenes de +2.0 a +3.5 (partiendo de 0 en el paso inicial) y una pérdida que desciende de 0.69 a ~0.25. No se han publicado detalles sobre la composición del dataset de SFT ni sobre el número total de tokens de entrenamiento.

## Capacidades

- Generación de código Remotion (React/TypeScript) para escenas de vídeo programáticas, incluyendo composición, animaciones y efectos.
- Razonamiento multimodal: puede procesar imágenes de referencia (storyboards, capturas) y generar código coherente con ellas.
- Modo thinking: capacidad de razonamiento extendido antes de emitir la respuesta, útil para tareas complejas de generación de código.
- Tool calling y function calling: soporte para invocar herramientas externas, lo que permite integrarlo en pipelines de automatización.
- Capacidades de agente: puede ejecutar tareas multi-paso con planificación y uso de herramientas.
- Multilingüe: aunque no se especifica para este fine-tune, el modelo base Qwen3.8 soporta múltiples idiomas.
- Generación de texto general: conserva las capacidades del modelo base para chat, redacción y otras tareas de lenguaje.

## Casos de uso

- **Generación automática de escenas de vídeo para marketing**: el modelo puede producir código Remotion listo para compilar a partir de una descripción textual de la escena (producto, texto, colores), reduciendo el tiempo de desarrollo de anuncios dinámicos.
- **Prototipado rápido de animaciones para desarrolladores**: un desarrollador puede describir una animación en lenguaje natural y obtener el código TypeScript/React correspondiente, que luego ajusta manualmente. El pipeline de recompensa basado en renderizado garantiza que el código sea sintácticamente válido y ejecutable.
- **Automatización de vídeos para redes sociales**: integrado en un servicio backend, el modelo genera variaciones de escenas (intros, transiciones, cierres) a partir de plantillas y datos de entrada, usando su capacidad de tool calling para validar el render.
- **Asistente de edición de vídeo programática**: el modelo puede modificar escenas existentes (cambiar colores, textos, duraciones) recibiendo instrucciones en lenguaje natural y el código fuente actual, gracias a su ventana de contexto de 256K tokens.
- **Generación de storyboards animados**: combinando su capacidad multimodal, el modelo puede tomar una imagen de referencia (boceto, captura) y generar una escena Remotion que la replique o adapte, útil en preproducción audiovisual.
- **Educación y formación en Remotion**: el modelo actúa como tutor generando ejemplos de código comentados y explicaciones de patrones de composición, aprovechando su modo thinking para razonar sobre las mejores prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento (precisión de preferencia, márgenes y pérdida), pero no resultados de evaluación con jueces de vídeo ni comparativas con otros modelos. El autor indica que la evaluación con video-judge frente a los baselines SFT y DPO está pendiente, por lo que el modelo debe tratarse como experimental hasta que se publiquen esos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~27B parámetros. En fp16 (pesos fusionados) ocupa ~54 GB, por lo que requiere una GPU con al menos 60 GB de VRAM (A100 80GB, H100 80GB) o dos GPUs de 32 GB en paralelo.
- Con cuantización (GGUF Q4_K_M, ~16 GB) puede ejecutarse en GPUs consumer de 24 GB como la RTX 4090 o RTX 3090, aunque con menor precisión.
- El modelo base Qwen3.8-27B puede ejecutarse localmente con 17 GB de RAM/VRAM según Unsloth, usando cuantización específica (NVFP4 o GGUF).
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), y Unsloth (que ofrece soporte nativo para este modelo).
- Latencia y throughput: no disponible. Depende del hardware y de la cuantización; en una A100 80GB con fp16 se espera un throughput de decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Knowlify/qwen3.8-27b-grpo-dpo | 26.9B | 256K | Generación de código Remotion | Apache-2.0 | HuggingFace |
| Qwen3.8-27B (base) | 27B | 256K | Multimodal general, coding, agentes | Apache-2.0 | HuggingFace, Groq, QwenCloud |
| Qwen3.8-2.4T-A95B (MoE) | 2.4T total, 95B activos | 256K | Multimodal general, mayor capacidad | Apache-2.0 | HuggingFace |

El fine-tune de Knowlify se diferencia del base en su especialización para Remotion, pero no hay datos de rendimiento comparativo publicados. Frente a otros modelos de generación de código (p.ej., DeepSeek-Coder, CodeLlama), no se dispone de benchmarks que permitan una comparación directa.

## Limitaciones y advertencias

- **Estado experimental**: el autor indica explícitamente que el modelo debe tratarse como experimental hasta que se complete la evaluación con video-judge. No hay garantías de calidad en producción.
- **Sesgos conocidos**: no se han documentado sesgos específicos, pero al ser un fine-tune de Qwen3.8, puede heredar sesgos del modelo base (culturales, lingüísticos, de género) y del dataset de entrenamiento de Remotion.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir código sintácticamente válido pero lógicamente incorrecto, especialmente en escenas complejas. El pipeline de recompensa mitiga errores de compilación, pero no garantiza la corrección semántica.
- **Limitaciones de contexto**: aunque la ventana es de 256K tokens, el entrenamiento DPO usó secuencias máximas de 6144 tokens, por lo que el modelo puede no estar optimizado para entradas muy largas.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8 puede tener términos adicionales (verificar la licencia del modelo base en su repositorio oficial).
- **Caveat de producción**: el repositorio incluye pesos fusionados en 16 bits y un adaptador LoRA separado; es necesario fusionar correctamente el adaptador para obtener el comportamiento completo. Además, la generación de vídeo requiere un entorno de ejecución de Remotion (Node.js, dependencias) para validar el render.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Knowlify/qwen3.8-27b-grpo-dpo
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Model card de Qwen3.8-27B en Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Página de Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
