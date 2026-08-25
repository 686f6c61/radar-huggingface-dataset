# saidutta69/RaceBench-MiniCPM5-v1.1

## Resumen

RaceBench-MiniCPM5-v1.1 es un modelo de lenguaje de 1.080 millones de parametros, resultado de un ajuste fino completo (full-parameter SFT) del modelo base `openbmb/MiniCPM5-1B` sobre el dataset `saidutta69/RaceBench-v1.1`, que contiene 376.736 filas de datos conversacionales. El autor, Sai Dutta Abhishek Dash, lo presenta como parte del proyecto RaceBench, cuyo objetivo declarado es que modelos de menos de 3B de parametros puedan sustituir a modelos API de frontera en despliegues de edge computing.

El modelo se distribuye bajo licencia MIT, con pesos en formato safetensors y es compatible con la libreria transformers. Segun la model card, es la version v1.1 del modelo, con diferencias menores respecto a la v1.0 debidas a restricciones de hardware de entrenamiento: precision bf16 en lugar de fp16, atencion SDPA en lugar de flash-attention, y optimizador AdamW de 8 bits. El entrenamiento se realizo en una unica GPU NVIDIA H100 durante una epoca completa.

La relevancia de este modelo reside en su objetivo: demostrar que un modelo de 1B puede alcanzar capacidades de razonamiento y conversacion suficientes para tareas de produccion en entornos con recursos limitados, compitiendo con modelos mucho mas grandes servidos via API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en MiniCPM5-1B) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (config de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniCPM5-1B de OpenBMB, un Transformer denso de 1B disenado para despliegue en dispositivos y escenarios con recursos limitados. El entrenamiento de RaceBench-MiniCPM5-v1.1 consistio en un ajuste fino completo (full-parameter SFT) sobre el dataset `RaceBench-v1.1`, que contiene 376.736 filas de conversaciones.

La configuracion de entrenamiento incluye: longitud de secuencia de 4096 tokens con sample packing (concatenacion de chunks), enmascaramiento de loss solo en la parte del asistente, precision mixta bf16, optimizador AdamW de 8 bits, tasa de aprendizaje 2e-05 con programacion coseno, 100 pasos de warmup, batch efectivo de 8 secuencias empaquetadas (32.768 tokens por paso) y una sola epoca de entrenamiento con 10.445 pasos. El loss final de entrenamiento fue de 1.301.

El autor indica que la unica diferencia con la version v1.0 es el hardware de entrenamiento: bf16 en H100 con SDPA attention frente a fp16 en T4x2 con flash-attention. El batch efectivo es identico en ambas versiones.

## Capacidades

- Generacion de texto conversacional: el modelo esta entrenado especificamente para mantener dialogos multi-turno con formato asistente.
- Razonamiento y resolucion de problemas: el dataset RaceBench esta disenado para evaluar y mejorar capacidades de razonamiento en modelos pequenos.
- Instrucciones: soporta el formato de instrucciones tipico de los modelos de la familia MiniCPM.
- Despliegue en edge: al ser un modelo de 1B, puede ejecutarse en dispositivos con recursos limitados.
- No se mencionan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Chatbots de atencion al cliente en dispositivos locales: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 4096 tokens, suficiente para la mayoria de interacciones de soporte, y se ejecuta sin conexion a internet.
- Asistentes personales en smartphones: su tamano reducido (2.2 GB en precision completa) permite su despliegue en dispositivos moviles de gama media-alta con 8 GB de RAM o mas.
- Procesamiento de texto en entornos con privacidad estricta: al ser un modelo local, no envia datos a servidores externos, lo que lo hace apto para sectores como salud o banca.
- Prototipado rapido de aplicaciones conversacionales: los desarrolladores pueden integrarlo en pipelines de transformers sin necesidad de GPUs de alta gama, usando solo CPUs o GPUs modestas.
- Educacion y evaluacion de modelos: el proyecto RaceBench proporciona una base para comparar la capacidad de modelos pequenos frente a grandes modelos API en tareas de razonamiento.
- Generacion de contenido asistida: redaccion de correos, resumen de documentos o generacion de ideas, con la ventaja de no depender de APIs de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de lm-eval v0.4.12 estan pendientes y se publicaran en la carpeta `results/` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.080 millones de parametros, el modelo en bf16 requiere aproximadamente 2.2 GB de VRAM. En cuantizacion de 8 bits, podria reducirse a unos 1.1 GB.
- GPU recomendadas: el modelo cabe en GPUs consumer de gama media como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Tambien puede ejecutarse en CPU con 16 GB de RAM, aunque con menor velocidad.
- Despliegue: compatible con transformers y endpoints de Hugging Face (text-generation-inference). Tambien puede usarse con vLLM, llama.cpp u Ollama, aunque no esta documentado explicitamente.
- Latencia y throughput: no disponible. Al ser un modelo de 1B, la latencia esperada en una GPU consumer es del orden de 10-30 ms por token, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RaceBench-MiniCPM5-v1.1 | 1.08B | 4096 | MIT | Ajuste fino de MiniCPM5-1B sobre RaceBench |
| OpenBMB/MiniCPM5-1B | 1.08B | no disponible | MIT | Modelo base, no ajustado |
| Qwen2.5-1.5B-Instruct | 1.54B | 32768 | Apache 2.0 | Modelo instruct de la serie Qwen, con mayor contexto |

La comparativa directa con otros modelos de tamano similar no esta disponible en la informacion proporcionada, ya que no se han publicado resultados de benchmarks.

## Limitaciones y advertencias

- Sesgos y alucinaciones: el modelo puede presentar sesgos presentes en el dataset RaceBench-v1.1 y en el modelo base MiniCPM5-1B. La alucinacion es un riesgo inherente en modelos de este tamano.
- Idioma: no se especifican los idiomas soportados, lo que sugiere una cobertura limitada principalmente a ingles y posiblemente chino, dado el origen del modelo base.
- Contexto limitado: la ventana de 4096 tokens es suficiente para dialogos cortos, pero insuficiente para tareas que requieran contextos largos, como analisis de documentos extensos.
- Licencia MIT: permite uso comercial, pero no incluye garantias de seguridad ni de comportamiento. El autor no proporciona garantias de exactitud.
- Rendimiento sin benchmarks: no hay datos publicados que verifiquen las capacidades del modelo frente a otros de su categoria.
- Dependencia del dataset RaceBench: el modelo es un ajuste sobre un dataset concreto, por lo que su rendimiento en tareas fuera del dominio de RaceBench puede ser inferior al del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/RaceBench-MiniCPM5-v1.1
- Dataset RaceBench-v1.1: https://huggingface.co/datasets/saidutta69/RaceBench-v1.1
- Modelo base MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio de OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- Variante "heretic" del modelo: https://huggingface.co/saidutta69/RaceBench-MiniCPM5-heretic
