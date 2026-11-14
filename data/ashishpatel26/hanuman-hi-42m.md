# ashishpatel26/hanuman-hi-42m

## Resumen

Hanuman-hi-42M es un modelo de lenguaje causal de estilo Llama entrenado **desde cero** (inicialización aleatoria, sin partir de pesos preentrenados) para hindi, desarrollado por ashishpatel26 como parte de la serie "Ramayana Series" de LLMs indicos. Con 42.082.816 parámetros, es un modelo deliberadamente pequeño cuyo interés no reside en su rendimiento absoluto sino en su metodología: demuestra que es posible entrenar un LM funcional en hindi en hardware de consumo muy limitado, concretamente una única GPU RTX 3060 de 6 GB.

El modelo no está ajustado por instrucciones ni optimizado para precisión factual; su objetivo declarado es generar texto fluido en hindi. Esto lo sitúa en la categoría de modelos de investigación y experimentación educativa más que en la de modelos listos para producción. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

Es relevante en el contexto actual como ejemplo de entrenamiento *from scratch* de bajo coste para lenguas con menor representación en los grandes corpus multilingües, y como punto de partida reproducible para quienes quieran experimentar con arquitecturas tipo Llama en escalas reducidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (LlamaForCausalLM) |
| Parametros totales | 42.082.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer causal de la familia Llama, implementada a través de `LlamaForCausalLM` de la librería Transformers. Se entrenó desde cero (random init) sobre una única RTX 3060 de 6 GB, lo que condiciona necesariamente tanto el tamaño del modelo como el volumen de datos y la longitud de contexto utilizables durante el entrenamiento. El tokenizador es SentencePiece, con un token especial `<hi>` que precede a las entradas en los ejemplos de uso.

No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El autor indica explícitamente que el modelo no está ajustado por instrucciones. Tampoco se documentan innovaciones técnicas destacables más allá del propio enfoque de entrenamiento desde cero en hardware de consumo.

## Capacidades

- Generación de texto causal en hindi con fluidez según el autor.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni responde a formatos de pregunta-respuesta de forma fiable.
- Sin soporte documentado de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso documentadas.
- Monolingüe: únicamente hindi.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Experimentación educativa en entrenamiento de LLMs: sirve como ejemplo reproducible de entrenamiento desde cero en una GPU de consumo, útil para cursos y talleres sobre fundamentos de modelos de lenguaje.
- Investigación en lenguas de bajos recursos: punto de partida para estudiar técnicas de tokenización y entrenamiento en hindi con presupuestos mínimos.
- Generación de texto sintético en hindi para aumento de datos: puede producir texto diverso para tareas de preentrenamiento o evaluación de otros sistemas, dado su carácter generativo libre.
- Baseline para comparativas de eficiencia: al ser un modelo de 42M parámetros, permite medir el coste mínimo viable de un LM funcional en hindi frente a modelos mayores.
- Fine-tuning posterior por instrucciones: al estar bajo Apache 2.0 y en formato safetensors compatible con Transformers, puede servir como base para ajustes supervisados en tareas concretas de hindi.
- Pruebas de infraestructura de despliegue: su reducido tamaño (repo de 0,2 GB) lo hace idóneo para validar pipelines de inferencia (Transformers, llama.cpp, vLLM) en entornos con recursos escasos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (42M parámetros ≈ 168 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entrenó en una RTX 3060 de 6 GB. Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más (GTX 1050 Ti en adelante, RTX 20/30/40, etc.).
- Opciones de despliegue: Transformers (ruta documentada por el autor, con SentencePiece para el tokenizador). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, aunque el formato safetensors y la arquitectura Llama permiten su conversión a GGUF con herramientas estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Hanuman-hi-42M | 42,08 M | no disponible | hindi | Apache 2.0 | Entrenado desde cero en RTX 3060 6 GB; sin ajuste por instrucciones |
| Modelos tipo TinyLlama (referencia de escala) | ~1,1 B | 2.048 | multilingüe | Apache 2.0 | Escala ~26 veces mayor; no comparable directamente en recursos |
| Otros modelos de la serie Ramayana | no disponible | no disponible | indico | no disponible | No se dispone de datos de los demás miembros de la serie |

No se dispone de información sobre modelos comparables del mismo tamaño y propósito (LM en hindi de ~40M parámetros entrenado desde cero) en la información proporcionada.

## Limitaciones y advertencias

- No está ajustado por instrucciones: no debe esperarse que siga comandos, responda preguntas de forma estructurada ni mantenga un formato conversacional.
- No es factual: el autor advierte explícitamente de que el modelo no es fiable en términos de precisión; alto riesgo de alucinación.
- Monolingüe en hindi: no se ha entrenado ni evaluado en otros idiomas.
- Longitud de contexto no documentada: probablemente corta dado el hardware de entrenamiento, lo que limita conversaciones o documentos largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad más allá de la afirmación cualitativa de fluidez del autor.
- Sesgos: al no documentarse la composición del corpus, no es posible evaluar sesgos de género, casta, religión u otros sesgos sociales presentes en datos en hindi.
- Licencia Apache 2.0: permite uso comercial, pero la falta de garantías y de evaluación hace desaconsejable su uso en producción sin validación previa.
- Sin mantenimiento ni descargas documentadas (0 descargas, 0 likes en el momento de la ficha): ecosistema de soporte prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashishpatel26/hanuman-hi-42m
- Perfil del autor en Hugging Face: https://huggingface.co/ashishpatel26
