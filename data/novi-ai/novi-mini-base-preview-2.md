# Novi-AI/Novi-Mini-Base-Preview-2

## Resumen

Novi Mini Base Preview 2 es un modelo de lenguaje causal de tipo decoder-only desarrollado por Novi-AI, publicado como checkpoint intermedio de un proyecto de preentrenamiento desde cero denominado Novi Mini Base. Se trata de un modelo compacto con 12.065.280 parámetros reales según los pesos en safetensors (la model card indica 9.968.128, cifra que no coincide con el recuento del repositorio), disenado con una arquitectura de estilo BananaMind 2, basada a su vez en un diseno reducido de Cagliostro v3. El modelo se distribuye bajo licencia Apache 2.0 y esta pensado exclusivamente para generacion de texto en ingles.

El checkpoint corresponde al paso 321.000 de un total planificado de 457.764 pasos, lo que representa un 70,12% del entrenamiento completado y un 82,50% de la fase estable. El objetivo de entrenamiento es de 15.000 millones de tokens, con una longitud de secuencia de 2.048 tokens y un vocabulario de 8.192 entradas mediante tokenizador BPE a nivel de byte. Su relevancia actual es limitada: se trata de una preview de un modelo muy pequeno, sin descargas ni interacciones en Hugging Face, y cuyo interes principal es documental o experimental para quienes siguen proyectos de preentrenamiento compactos.

La ficha describe un modelo en estado intermedio, no final, por lo que sus capacidades deben interpretarse como provisionales. No se han publicado resultados de benchmarks ni evaluaciones cuantitativas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo BananaMind 2 (base: Cagliostro v3 reducido) |
| Parametros totales | 12.065.280 (segun safetensors); la model card indica 9.968.128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens durante entrenamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con atención de consultas agrupadas (GQA) de 4 cabezas de consulta y 2 cabezas clave/valor, dimensión de cabeza 64 y dimensión oculta 256 sobre 10 capas. Incorpora Rotary Position Embeddings (RoPE) con theta 100.000, normalización RMSNorm en consultas, claves y normalización principal (epsilon 1e-6), feed-forward SwiGLU con dimensión intermedia 768, embeddings de tokens aprendidos con pesos atados entre entrada y salida, y atención implementada mediante PyTorch Scaled Dot Product Attention. El tokenizador es BPE a nivel de byte con vocabulario de 8.192 entradas.

El entrenamiento se realiza desde cero con el framework BananaAll, objetivo de predicción del siguiente token, 15.000 millones de tokens objetivo, secuencia de 2.048, batch efectivo de 16 secuencias en una GPU, learning rate máximo 0,003, warmup de 2.000 pasos, fase estable del 85% y cooldown coseno del 15%, weight decay 0,01, Adam con betas 0,9 y 0,95, norma de gradiente máxima 1,0, semilla 1337 y compilación de Torch habilitada. Los datos provienen de cinco repositorios de Hugging Face: smollm-corpus (fineweb-edu-dedup y cosmopedia-v2), dclm-baseline-1.0, finemath (finemath-3plus e infiwebmath-3plus), OpenMathInstruct-2 y smoltalk. La model card solo detalla los pesos del mix de la fase estable, con FineWeb-Edu Dedup al 43,7% y el resto truncado en la informacion disponible. Incluye kernels opcionales de Triton para RMSNorm, SwiGLU y RoPE, con fallback a PyTorch y variable `NOVI_DISABLE_TRITON=1` para desactivarlos. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva en inglés mediante predicción del siguiente token.
- Modelo base sin ajuste por instrucciones: no se documenta soporte de diálogo, chat ni seguimiento de instrucciones.
- Razonamiento y matemáticas: el corpus de entrenamiento incluye finemath y OpenMathInstruct-2, pero no hay evaluaciones publicadas que cuantifiquen estas capacidades.
- Código: no se documenta entrenamiento específico en código ni evaluaciones al respecto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Contexto limitado a 2.048 tokens.

## Casos de uso

- Investigación sobre preentrenamiento compacto: el checkpoint permite estudiar la evolución de un modelo de ~12M parámetros a lo largo de 321.000 pasos y comparar curvas de pérdida con la fase final, útil para quienes investigan dinámicas de entrenamiento en modelos pequeños.
- Generación de texto de dominio general en inglés: puede producir continuaciones de texto breve dentro de su ventana de 2.048 tokens, adecuado para prototipos de completado de texto sin requisitos de calidad alta.
- Experimentación con kernels de Triton: al incluir implementaciones fusionadas de RMSNorm, SwiGLU y RoPE con fallback a PyTorch, sirve como banco de pruebas para medir aceleración y corrección numérica en GPU.
- Reproducción de pipelines de preentrenamiento: su configuración documentada (BananaAll, schedule warmup-stable-cosine, batch efectivo 16) permite replicar recetas de entrenamiento en una sola GPU.
- Filtrado y análisis de corpus: al estar entrenado sobre mezclas de FineWeb-Edu, DCLM, finemath y smoltalk, puede emplearse como modelo de referencia para estudiar el efecto de mezclas de datos en tareas de modelado de lenguaje.
- Docencia y divulgación: por su tamaño reducido (~0,1 GB de repositorio) cabe en cualquier entorno y permite demostrar el ciclo completo de carga, inferencia y evaluación con transformers sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (fp32) para ~12M parámetros; menos de 0,5 GB en fp16/bf16. Cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100, H100 ni RTX 4090. Una GTX 1050 o una iGPU moderna son suficientes.
- Cabe en consumer GPU: sí, en todas las gamas actuales y en la mayoría de hardware integrado.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de exportación a GGUF para llama.cpp u Ollama y despliegue en vLLM o TGI, aunque no se documenta soporte explícito para estos últimos.
- Latencia y throughput estimados: no disponible; al ser un modelo de 10 capas y 256 de dimensión oculta, la latencia esperada es de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Novi Mini Base Preview 2 | 12,07M (safetensors) | 2.048 | Apache 2.0 | Preview, 70,12% entrenado | Solo inglés, sin benchmarks |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Final | Entrenado sobre smollm-corpus, con evaluaciones publicadas |
| SmolLM-360M | 360M | 2.048 | Apache 2.0 | Final | Mayor capacidad, misma familia de datos |
| Pythia-14M | 14M | 2.048 | Apache 2.0 | Final | Suite de investigación con checkpoints intermedios |

La comparación con SmolLM y Pythia es orientativa por tamaño y familia de datos; no se dispone de métricas del modelo Novi para contrastar rendimiento.

## Limitaciones y advertencias

- Modelo en estado intermedio (70,12% del entrenamiento): el autor advierte que el modelo final puede diferir de esta preview.
- Discrepancia entre parámetros declarados (9.968.128 en la model card) y reales en safetensors (12.065.280); conviene verificar antes de usarlo en producción.
- Solo inglés; no se declara soporte multilingüe.
- Ventana de contexto de 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Modelo base sin ajuste por instrucciones: no es adecuado para chat, agentes ni tool calling sin un post-entrenamiento adicional.
- Riesgo de alucinación y de generar contenido sesgado o incorrecto, especialmente por el estado parcial del entrenamiento y la ausencia de evaluaciones.
- Sin datos de benchmarks ni evaluaciones de seguridad publicadas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación desaconseja su despliegue en producción sin evaluación previa.
- El repositorio registra 0 descargas y 0 likes, sin comunidad ni soporte documentado más allá de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Novi-AI/Novi-Mini-Base-Preview-2
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset DCLM baseline 1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Paper de referencia sobre Triton: no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
