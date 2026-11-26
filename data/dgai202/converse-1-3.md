# dgAI202/Converse-1.3

## Resumen

Converse 1.3 es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct desarrollado por dgAI, una iniciativa independiente de desarrollo de IA. El modelo parte de la arquitectura transformer densa de Qwen2.5 con 1.543.714.304 parametros (aproximadamente 1,54 mil millones) y se presenta como el primer lanzamiento publico de la serie Converse, orientado a conversaciones de bajo coste computacional ("Low-Cost-Conversations" segun sus etiquetas).

El ajuste se realizo mediante LoRA con el framework Unsloth y carga en 4 bits, con rango y alpha de 16, sobre las proyecciones de atencion y MLP. La ventana de contexto declarada es de 32.768 tokens, aunque el entrenamiento se limito a secuencias de 2.048 tokens. El modelo se distribuye en formato GGUF para inferencia local y hereda la licencia Apache 2.0 del modelo base.

Su relevancia es limitada pero practica: ofrece una variante ligera y de bajo coste para despliegues en hardware modesto, con un proceso de desarrollo documentado y una hoja de ruta publica (Converse 1.4 con contexto largo y Converse 1.5 como actualizacion integral). No obstante, la informacion publica es escasa y no se han divulgado resultados de benchmarks ni detalles sobre el dataset de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (base Qwen2.5) |
| Parametros totales | 1.543.714.304 (aprox. 1,54B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (entrenamiento limitado a 2.048) |
| Tipos de cuantizacion | no disponible (distribucion en GGUF; variantes no detalladas) |
| Idiomas soportados | Ingles (segun model card); herencia multilingue de Qwen2.5 no confirmada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con safetensors; 3,1 GB) |

## Arquitectura y entrenamiento

Converse 1.3 emplea una arquitectura transformer densa heredada de Qwen2.5-1.5B-Instruct, en la que todos los parametros se activan en cada pasada de inferencia, a diferencia de un esquema Mixture-of-Experts. El ajuste fino se realizo con LoRA (rango 16, alpha 16, dropout 0) sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, cubriendo tanto los modulos de atencion como las capas MLP. El entrenamiento utilizo Unsloth con carga del modelo en 4 bits y checkpointing de gradientes, con una longitud maxima de secuencia de 2.048 tokens.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias mas alla del flujo de ajuste con Unsloth. La model card indica que el desarrollo de contexto largo se reserva para una version posterior (Converse 1.4), por lo que la ventana de 32.768 tokens corresponde a la del modelo base y no a una capacidad extendida durante el ajuste.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de la base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, segun las capacidades del modelo base.
- Generacion de codigo y matematicas a nivel de modelo pequeno (no verificado con benchmarks propios).
- Soporte de tool calling / function calling: no confirmado para este fine-tune (la base Qwen2.5-Instruct lo soporta, pero no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara solo ingles; el multilingueismo de Qwen2.5 no se confirma en esta variante.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Asistentes conversacionales ligeros en local: el modelo puede gestionar dialogos multi-turno en ingles con una ventana de hasta 32.768 tokens, adecuado para prototipos y entornos con recursos limitados.
- Despliegue en hardware de consumo: al ser un modelo de 1,54B en GGUF, puede ejecutarse en portatiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, lo que lo hace util para demos y pruebas offline.
- Chatbots de soporte de bajo coste: su tamano reducido permite atender peticiones concurrentes en CPU o GPU modestas, con coste por inferencia muy bajo.
- Generacion de texto y resumenes breves: util para tareas de redaccion asistida o sintesis de documentos cortos en ingles.
- Educacion y experimentacion: sirve como base para aprender a hacer fine-tuning con LoRA y Unsloth, dado que el proceso esta documentado.
- Filtrado y clasificacion de texto: puede emplearse para tareas de etiquetado o moderacion simple en pipelines de bajo presupuesto.
- Prototipado de agentes conversacionales: aunque el tool calling no esta confirmado, puede integrarse en flujos simples de pregunta-respuesta antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en cuantizacion de 4 bits (Q4), 1,5-2 GB en 8 bits y alrededor de 3 GB en FP16, segun el tamano de 1,54B parametros.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF. vLLM y TGI no estan confirmados para este formato de distribucion.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Converse 1.3 | 1,54B | 32.768 | Apache 2.0 | GGUF | Fine-tune de Qwen2.5-1.5B-Instruct; sin benchmarks publicos |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base; benchmarks publicos disponibles |
| Llama 3.2 1B Instruct | 1,2B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Contexto mayor; licencia con restricciones |
| Gemma 2 2B | 2,6B | 8.192 | Gemma Terms of Use | safetensors, GGUF | Mayor tamano; contexto menor |

La comparativa se limita a datos publicos de los modelos alternativos; no existen resultados de benchmarks de Converse 1.3 que permitan una comparacion de rendimiento objetiva.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion para este fine-tune.
- Riesgo de alucinacion inherente a modelos de 1,5B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- La ventana de contexto declarada (32.768 tokens) no fue entrenada a esa longitud (maximo 2.048), por lo que el rendimiento en contextos largos puede degradarse.
- Idioma limitado al ingles segun la model card; el uso en castellano no esta garantizado ni documentado.
- Dataset de ajuste no divulgado, lo que impide evaluar la calidad y procedencia de los datos.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse los terminos del modelo base Qwen2.5.
- Ausencia de benchmarks y de documentacion sobre tool calling o agentes limita su uso en produccion critica.
- Modelo con muy pocas descargas y un solo "like" en Hugging Face; soporte y mantenimiento inciertos.

## Enlaces

- Hugging Face: https://huggingface.co/dgAI202/Converse-1.3
- Repositorio GitHub (modelo): https://github.com/scriptsnsenses-sys/dgAI/tree/main/Models/Converse/Converse%201.3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
