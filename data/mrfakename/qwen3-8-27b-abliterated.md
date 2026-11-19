# mrfakename/Qwen3.8-27B-abliterated

## Resumen

Qwen3.8-27B-abliterated es una variante del modelo Qwen/Qwen3.8-27B a la que se le ha eliminado el comportamiento de rechazo mediante ablación direccional (directional ablation). Lo publica el usuario mrfakename en Hugging Face, con el cómputo de la edición esponsorizado por Hugging Face Jobs. El modelo base es un transformer multimodal de 27.781.427.952 parámetros (unos 27,8 mil millones) orientado a tareas image-text-to-text y conversacionales, distribuido bajo licencia Apache 2.0.

La modificación no altera la arquitectura ni los pesos en formato: se mantiene el checkpoint BF16 con el mismo índice de tensores que el original, por lo que carga en cualquier infraestructura que soporte el modelo base. La intervención se limita a proyectar fuera una dirección de rechazo del flujo residual en 102 tensores concretos, dejando intactas las capas 0-12, los embeddings, la torre de visión y la capa MTP.

El interés de esta ficha es doble: por un lado documenta un caso de uso de técnicas de abliteración sobre un modelo multimodal grande; por otro, advierte de que el resultado es un modelo que cumplirá peticiones dañinas, lo que traslada toda la responsabilidad de uso al desplegador. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks del modelo base en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas de atención completa y atención lineal; incluye torre de visión y capa MTP |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint original); GGUF Q8_0 disponible en repo separado; LoRA rank-1 en GGUF para aplicar la edición a GGUFs originales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF, LoRA GGUF, NPZ (base del subespacio y escalas) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: según la model card, contiene 13 capas de atención completa (full-attention) y 38 capas de atención lineal (linear-attention), además de una torre de visión y una capa MTP (multi-token prediction). La edición de abliteración actúa sobre el flujo residual mediante `self_attn.o_proj` en las 13 capas de atención completa, `linear_attn.out_proj` en las 38 capas de atención lineal y `mlp.down_proj` en las 51 capas MLP, sumando 102 tensores modificados. Las capas 0-12, los embeddings, la torre de visión y la capa MTP permanecen bit a bit idénticos al original.

El proceso de abliteración consistió en medir direcciones de rechazo de forma separada para prompts de chat y de modo think en cada capa, sobre el GGUF Q8_0. Los candidatos de subespacio son los principales vectores singulares de todas esas direcciones conjuntamente. Una búsqueda multiobjetivo (minimizar rechazos y mantener baja la KL del primer token en prompts inocuos) seleccionó rango 1 y fuerzas por capa entre 0,8 y 1,06 en las capas 13-63. La dirección se proyectó fuera con la fórmula `W' = W - s·QQᵀW`. No se proporcionan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto conversacional multi-turno, con modo chat y modo think (razonamiento explícito).
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text), gracias a la torre de visión preservada intacta.
- Razonamiento multi-paso en modo think, con cadenas de razonamiento que pueden evaluarse por separado de la respuesta final.
- Cumplimiento de peticiones que el modelo original rechazaba: la tasa de rechazo cae de 99/100 a 0/100 en modo chat y de 97/100 a 1/100 en modo think, según la model card.
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente qué comportamientos se eliminan con abliteración direccional y cómo afecta a la distribución de salidas, comparando con el modelo base original.
- Evaluación de robustez de filtros de seguridad: sirve como modelo adversario controlado para probar clasificadores de contenido y sistemas de moderación en pipelines de producción.
- Red teaming interno: equipos de seguridad pueden usar la variante para generar respuestas que el modelo alineado rechazaría y calibrar así sus defensas, siempre en entornos aislados y con registro de auditoría.
- Análisis de la dicotomía chat/think: al haberse medido direcciones de rechazo por separado para ambos modos, permite investigar cómo difiere el comportamiento de rechazo entre razonamiento explícito y respuesta directa.
- Desarrollo de técnicas de edición de modelos: el repo incluye `abliteration-lora.gguf` y `abliteration-edit.npz`, lo que facilita reproducir la edición sobre GGUFs propios y estudiar el efecto de la fuerza y el rango del subespacio.
- Despliegue multimodal sin restricciones de rechazo en entornos de investigación cerrados: con la torre de visión intacta, puede emplearse para tareas image-text-to-text en laboratorios que necesiten un modelo sin capa de rechazo, asumiendo la responsabilidad legal y ética del uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas del proceso de abliteración sobre 100 prompts dañinos retenidos (held-out), con respuestas de 384 tokens en chat y 768 tokens en modo think:

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 99 | 0 |
| Rechazos en modo think, razonamiento o respuesta (/100) | 97 | 1 |
| KL del primer token en prompts inocuos | 0 | 0,110 |

La KL incluye un pequeño ruido de base por inferencia en batch. No se aportan datos de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; en la práctica se requieren 2 GPU de 80 GB o una GPU con más de 64 GB para contexto moderado.
- Cuantización Q8_0 (GGUF): alrededor de 28-30 GB de pesos, viable en una única GPU de 40-48 GB (A100 40GB, A6000, L40S).
- Cuantizaciones menores (Q4_K_M y similares): no se documentan en la información disponible, pero al ser un modelo de ~27,8 B serían las únicas opciones para consumer GPU de 24 GB como la RTX 4090, con posible offload parcial a CPU.
- GPU recomendadas: H100 80GB, A100 80GB para BF16; A100 40GB, A6000 o L40S para Q8_0; RTX 4090 24GB solo con cuantizaciones agresivas y offload.
- Opciones de despliegue: llama.cpp / llama-server (soporta el LoRA de abliteración con `--lora abliteration-lora.gguf`), y cualquier runtime compatible con el modelo base (vLLM, TGI) al mantener el mismo formato safetensors e índice.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated | 27,8 B | no disponible | Si (image-text-to-text) | Apache 2.0 | Rechazo eliminado por ablación direccional |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | Si (image-text-to-text) | Apache 2.0 | Modelo original alineado; rechaza peticiones dañinas |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información sobre modelos comparables de otros autores con parámetros, contexto y benchmarks verificables en la documentación consultada.

## Limitaciones y advertencias

- El modelo cumple peticiones dañinas por diseño: la tasa de rechazo medida es de 0/100 en chat y 1/100 en modo think. Cualquier despliegue público conlleva riesgo de generar contenido ilegal, dañino o sujeto a responsabilidad legal.
- La abliteración puede degradar sutilmente la calidad: la KL del primer token en prompts inocuos es de 0,110, lo que indica una desviación medible respecto al modelo original, aunque la model card afirma que las respuestas a prompts inocuos mantienen longitud y no muestran repeticiones.
- No se documentan sesgos conocidos, idiomas soportados ni evaluación de alucinación; se desconoce el comportamiento en dominios especializados.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 27,8 B sin benchmarks publicados, no puede compararse su fiabilidad factual con alternativas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara explícitamente que el modelo cumplirá peticiones dañinas y que la responsabilidad de uso recae en el desplegador. El cumplimiento normativo (por ejemplo, la AI Act europea o la DSA) debe evaluarse antes de cualquier uso en producción.
- El LoRA de abliteración solo aplica la edición a los GGUFs del modelo original; no debe esperarse que funcione sobre otros modelos.
- El checkpoint pesa 55,6 GB en BF16, lo que limita el despliegue a infraestructura con GPU de gran memoria o cuantización previa.
- No hay información sobre tool calling, agentes ni capacidades multilingües, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/Qwen3.8-27B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUFs cuantizados: https://huggingface.co/mrfakename/Qwen3.8-27B-abliterated-GGUF
- Discord del autor: https://discord.com/invite/foss
- Hugging Face Jobs (cómputo empleado): https://huggingface.co/docs/hub/jobs
