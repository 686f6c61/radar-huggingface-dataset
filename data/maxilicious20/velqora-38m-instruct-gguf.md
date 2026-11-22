# Maxilicious20/Velqora-38M-Instruct-GGUF

## Resumen

Velqora-38M-Instruct-GGUF es la distribucion en formato GGUF del modelo Velqora-38M-Instruct, un modelo de lenguaje causal decoder-only de aproximadamente 38 millones de parametros (38.025.227 exactos) entrenado desde cero por el autor independiente Maxilicious20 sobre una unica GPU de consumo NVIDIA RTX 4060 con 8 GB de VRAM. El modelo base esta publicado en PyTorch y esta version GGUF facilita su ejecucion local mediante llama.cpp sin necesidad de infraestructura dedicada.

Se trata de un experimento de investigacion orientado a demostrar que es viable entrenar y publicar un modelo conversacional completo, con tokenizer propio y arquitectura tipo Qwen3, usando hardware de gama media. La arquitectura replica el grafo `qwen3` en GGUF: 12 capas, dimension oculta de 512, atencion con 8 cabezas de consulta y 2 de clave/valor (GQA), SwiGLU con dimension intermedia de 1.408, RMSNorm y QK-Norm por cabeza.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como referencia para quienes quieren estudiar el pipeline completo de entrenamiento desde cero, conversion a GGUF y cuantizacion. No compite con modelos de produccion por tamano ni por capacidad, y su ventana de contexto de 1.024 tokens limita seriamente los casos de uso reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, grafo `qwen3` en GGUF (RoPE NeoX half-split, GQA, SwiGLU, RMSNorm, QK-Norm por cabeza) |
| Parametros totales | 38.025.227 (~38,03 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (RoPE base theta = 10.000) |
| Tipos de cuantizacion | F16 (80,83 MB), Q8_0 (43,09 MB), Q4_K_M (26,67 MB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo original en PyTorch/safetensors) |

Detalles adicionales de arquitectura: 12 capas, hidden size 512, SwiGLU 1.408, 8 cabezas de consulta / 2 cabezas KV, tokenizer BPE byte-level custom de 8.192 tokens embebido en los metadatos GGUF.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only causal con las innovaciones habituales de la familia Qwen3: RoPE con half-split en estilo NeoX, atencion con query grouping (8 cabezas Q frente a 2 KV), activacion SwiGLU, normalizacion RMSNorm y QK-Norm aplicada por cabeza. Consta de 12 capas con dimension oculta de 512 y dimension intermedia SwiGLU de 1.408, lo que da lugar a los aproximadamente 38 millones de parametros. El tokenizer es un BPE byte-level propio de 8.192 tokens, entrenado especificamente para este modelo y embebido en los metadatos del GGUF.

El entrenamiento se realizo desde cero sobre una NVIDIA RTX 4060 de 8 GB, un dato relevante porque demuestra la viabilidad del pipeline en hardware de consumo. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado mas alla de la denominacion "Instruct". Tampoco se documenta ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

Una nota tecnica importante de la conversion: el escalar de residuo de valor de la capa 0 (`v_res_alpha`) se omite en la ejecucion estandar del grafo GGUF. Segun el autor, se preservan todas las proyecciones principales, los pesos de QK-Norm por cabeza, las frecuencias RoPE y el vocabulario BPE de 8.192 tokens, pero esa omision implica una divergencia funcional respecto al modelo original en PyTorch.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento basico y respuesta a preguntas simples, limitado por el tamano del modelo.
- Generacion de codigo muy basica y aritmetica elemental, con alta propension a errores segun admite el propio autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: unicamente ingles; no se declara soporte de castellano ni de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local en CPU y GPU de gama baja gracias a los tres niveles de cuantizacion publicados.

## Casos de uso

- Experimentacion educativa sobre entrenamiento desde cero: el modelo sirve para estudiar el ciclo completo de diseno de arquitectura, tokenizer, entrenamiento en GPU de consumo y publicacion, ya que el autor documenta el proceso y el modelo es lo bastante pequeno para reproducirlo.
- Pruebas de integracion con llama.cpp: util para validar pipelines de inferencia local, formato ChatML y carga de GGUF en entornos de desarrollo antes de migrar a modelos mayores.
- Benchmarking de cuantizacion: comparar la degradacion de calidad entre F16, Q8_0 y Q4_K_M en un modelo pequeno permite calibrar metodologias de evaluacion de cuantizacion con bajo coste computacional.
- Prototipado de interfaces conversacionales: sirve para maquetar chatbots de demostracion o pruebas de UX donde la calidad linguistica no es critica y prima la velocidad de iteracion.
- Investigacion sobre modelos pequenos: analizar el comportamiento de un transformer de 38 M en tareas de razonamiento y generar datos comparativos frente a modelos mayores.
- Educacion en tecnicas de tokenizacion: el vocabulario BPE propio de 8.192 tokens permite estudiar el impacto del diseno del tokenizer en un modelo de juguete.
- Pruebas de despliegue en hardware restringido: validar flujos de despliegue en dispositivos con menos de 1 GB de RAM o VRAM disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; Q4_K_M ocupa 26,67 MB en disco y Q8_0 43,09 MB, por lo que la memoria necesaria es minima.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el propio autor entreno el modelo en una RTX 4060 de 8 GB, muy por encima de lo necesario para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU y CPU exclusiva.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque por tamano se espera inferencia en tiempo real incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Velqora-38M-Instruct-GGUF | 38,03 M | 1.024 | Apache-2.0 | GGUF | Entrenado desde cero en RTX 4060, solo ingles |
| SmolLM2-135M-Instruct | 135 M | 8.192 | Apache-2.0 | safetensors, GGUF | Mayor tamano y contexto, entrenado con datos a gran escala |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 | Apache-2.0 | safetensors, GGUF | Un orden de magnitud mayor, multilingue |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 | Apache-2.0 | safetensors, GGUF | Mayor capacidad, entrenado con datasets publicos amplios |

La comparativa se ofrece a titulo orientativo por categoria de tamano; no se dispone de datos de rendimiento de Velqora para establecer comparaciones cuantitativas con estas alternativas.

## Limitaciones y advertencias

- El autor advierte explicitamente de posibles alucinaciones factuales y errores aritmeticos, especialmente en la cuantizacion de 4 bits.
- Modelo no apto para produccion ni para uso en sistemas criticos de seguridad, segun la propia model card.
- Ventana de contexto de solo 1.024 tokens, insuficiente para conversaciones largas, documentos o pipelines con historial extenso.
- Solo soporta ingles; no hay evidencia de capacidades en castellano u otros idiomas.
- La omision del escalar `v_res_alpha` de la capa 0 en la ejecucion GGUF implica que el comportamiento puede diferir del modelo original en PyTorch.
- Sesgos conocidos: no documentados por el autor; al ser un modelo entrenado desde cero con datos no especificados, el riesgo de sesgos no controlados es alto.
- Sin datos publicados sobre composicion del dataset de entrenamiento, lo que impide evaluar procedencia, calidad y posibles problemas de licencia de los datos.
- Licencia Apache-2.0 permite uso comercial, pero la calidad del modelo hace inviable ese escenario en la practica.
- Sin descargas ni interacciones registradas en Hugging Face en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Maxilicious20/Velqora-38M-Instruct-GGUF
- Repositorio original en PyTorch: https://huggingface.co/Maxilicious20/Velqora-38M-Instruct
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
