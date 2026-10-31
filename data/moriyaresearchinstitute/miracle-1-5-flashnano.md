# MoriyaResearchInstitute/Miracle-1.5-FlashNano

## Resumen

Miracle 1.5 FlashNano BaseLine es un modelo lingüístico denso de tamaño reducido (108 millones de parámetros según la model card; los pesos en safetensors suman aproximadamente 123,3 millones) desarrollado por MoriyaResearchInstitute. Se trata de un modelo base que solo ha pasado por preentrenamiento, es decir, no ha recibido ajuste por instrucciones ni alineación con preferencias humanas, por lo que no está pensado para uso conversacional directo sino como punto de partida para investigación, fine-tuning y experimentación con modelos de escala muy pequeña.

Su arquitectura es un transformer de 16 capas con agrupación de consultas (GQA), ventanas deslizantes de atención causal de 8.192 tokens en la mayoría de capas y atención causal global en las capas 8 y 16, un diseño híbrido que busca equilibrar eficiencia en contextos largos con capacidad de razonamiento a distancia. El modelo está publicado en HuggingFace en formato safetensors bajo licencia GPL-3.0 y su idioma principal es el inglés.

Su relevancia actual radica en la tendencia a estudiar modelos diminutos y eficientes que puedan ejecutarse en hardware de consumo o en dispositivos con recursos limitados, así como su utilidad como baseline reproducible para investigación en arquitecturas con atención híbrida local/global.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de 16 capas con GQA y atención híbrida (sliding window + global) |
| Parámetros totales | 123.305.600 (según safetensors); 108M declarados en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (ventana deslizante de 8.192 tokens en 14 capas; atención global en capas 8 y 16) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 16 capas con hidden size 768 y grouped-query attention: 12 cabezas de consulta y 4 cabezas de clave/valor, con dimensión de cabeza de 64. La capa feed-forward utiliza una activación SwiGLU de 1.536 dimensiones. Las embeddings de entrada y salida están atadas (tied embeddings), lo que reduce el número de parámetros totales en modelos de este tamaño.

En cuanto a la atención, 14 de las 16 capas emplean una ventana deslizante causal de 8.192 tokens, mientras que las capas 8 y 16 usan atención causal global. Este patrón híbrido local/global es una técnica habitual para reducir el coste computacional en secuencias largas manteniendo cierta capacidad de acceder a todo el contexto en capas seleccionadas. Sobre los datos de entrenamiento (número de tokens, composición del corpus) y sobre la posible aplicación de RLHF o DPO, la model card no ofrece detalles; únicamente indica que se trata de un modelo baseline con preentrenamiento exclusivo.

## Capacidades

- Generación de texto en inglés como modelo base (completado de texto, no instrucciones).
- Gestión de secuencias largas gracias a la ventana deslizante de 8.192 tokens en la mayoría de capas, con acceso global al contexto en las capas 8 y 16.
- Punto de partida para fine-tuning supervisado (SFT), ajuste por preferencias (DPO/RLHF) o destilación, dado su carácter de baseline.
- Ejecución en hardware muy limitado por su tamaño de ~108-123M de parámetros.
- No dispone de capacidades declaradas de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- No ha sido alineado por instrucciones, por lo que no sigue órdenes de forma fiable sin ajuste previo.

## Casos de uso

- Investigación en arquitecturas de atención híbrida: al combinar ventanas deslizantes con capas globales, sirve como baseline para ablations y comparaciones de eficiencia en contextos largos a escala pequeña.
- Fine-tuning por dominio: puede ajustarse con LoRA o full fine-tuning sobre corpus específicos (legal, médico, técnico) para obtener clasificadores o extractores ligeros.
- Completado de texto en editores: como modelo base en inglés, puede adaptarse para autocompletado en entornos con recursos muy limitados.
- Experimentación en dispositivos edge: su tamaño permite ejecutarlo en CPU o en GPUs de consumo con VRAM mínima, útil para prototipos embebidos.
- Docencia y formación: modelo de tamaño manejable para enseñar preentrenamiento, tokenización y evaluación de LLMs sin coste computacional elevado.
- Destilación y poda: puede usarse como estudiante en procesos de destilación desde modelos mayores, o como base para estudiar técnicas de compresión.
- Generación sintética de datos de bajo nivel: tras un ajuste ligero, puede emplearse para tareas simples de reescritura o limpieza de texto en inglés en pipelines automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~123M de parámetros en fp16, aproximadamente 0,3 GB de VRAM solo para pesos; incluso en fp32 el modelo cabe con holgura en cualquier GPU moderna (menos de 0,5 GB, coherente con el tamaño del repo de 0,5 GB).
- GPU recomendadas: cualquier GPU de consumo es suficiente (RTX 3060, RTX 4060 o superiores); no se requiere hardware de centro de datos. También es viable su ejecución en CPU.
- Consumer GPUs: cabe sin problemas en prácticamente cualquier GPU con 2 GB de VRAM o más, incluidas integradas y portátiles.
- Opciones de despliegue: cargable con transformers de HuggingFace (formato safetensors); no hay información sobre soporte oficial en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; por su tamaño, cabe esperar inferencia muy rápida, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Miracle 1.5 FlashNano BaseLine | ~108-123M | Ventana de 8.192 tokens (14 capas) + global (2 capas) | GPL-3.0 | Base, solo preentrenamiento, inglés |
| Qwen3-0.6B (base) | 600M | 32.768 tokens | Apache 2.0 | Mayor tamaño, licencia más permisiva, multilingüe |
| SmolLM2-135M | 135M | 2.048 tokens | Apache 2.0 | Tamaño similar, contexto más corto, con variantes instruct |

Comparado con alternativas de su categoría, Miracle 1.5 FlashNano destaca por su atención híbrida con ventana de 8.192 tokens, poco habitual en modelos tan pequeños, aunque la licencia GPL-3.0 es más restrictiva para integración en productos propietarios que las licencias Apache 2.0 típicas de la competencia.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones de forma fiable y puede generar texto incoherente o ofensivo sin ajuste previo.
- Idioma limitado al inglés; no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinación elevado, agravado por la ausencia de RLHF/DPO y por el tamaño reducido del modelo.
- Licencia GPL-3.0: cualquier obra derivada distribuida debe mantener la misma licencia, lo que restringe su uso en productos propietarios de código cerrado.
- La discrepancia entre los 108M declarados y los 123,3M reales de los pesos sugiere documentación incompleta; conviene verificar la configuración exacta al cargar el modelo.
- El repositorio apenas tiene adopción (0 descargas registradas), por lo que no existe comunidad ni soporte consolidado.
- No hay datos de benchmarks ni de calidad publicados, lo que impide evaluar su rendimiento real antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/MoriyaResearchInstitute/Miracle-1.5-FlashNano
