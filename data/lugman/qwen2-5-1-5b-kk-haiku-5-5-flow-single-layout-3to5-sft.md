# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Single-Layout-3to5-SFT

## Resumen

`lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Single-Layout-3to5-SFT` es un ajuste fino (SFT) del modelo `unsloth/Qwen2.5-1.5B-Instruct`, que a su vez deriva del Qwen2.5-1.5B-Instruct de Alibaba. Lo publica el usuario `lugman` en Hugging Face bajo licencia Apache 2.0. El nombre sugiere un entrenamiento orientado a generar haikus en formato "flow" con una disposicion (layout) unica y entre 3 y 5 lineas, aunque la model card no documenta el dataset ni los objetivos concretos. El modelo tiene 1.543.714.304 parametros (1,5B) en formato safetensors y se distribuye con la libreria transformers.

El modelo resuelve un nicho muy concreto: la generacion de poesia breve en ingles con una estructura fija de layout. No es un modelo de proposito general ni compite con los Qwen2.5 originales en razonamiento, codigo o matematicas; es un experimento de ajuste fino sobre una base pequena y eficiente. Su relevancia actual es limitada: cero descargas y cero likes en el momento de la consulta, y una model card minima que no aporta detalles de entrenamiento.

Al estar construido sobre Qwen2.5-1.5B-Instruct, hereda la arquitectura transformer decoder-only de Qwen2, con una ventana de contexto de 32.768 tokens en la version original (no confirmada para este ajuste). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace apto para experimentacion y despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para este ajuste (la base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (repo en safetensors; la base admite GGUF/AWQ/GPTQ via herramientas externas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con un corpus multilingue y posteriormente alineado con instrucciones. Sobre esa base, el autor aplica un ajuste fino supervisado (SFT) usando Unsloth y la libreria TRL de Hugging Face, segun indica la model card.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO adicional ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El nombre del repositorio sugiere un dataset de haikus con estructura de 3 a 5 lineas y un layout unico, pero no hay confirmacion en la model card. Tampoco se especifica si se congelaron capas o se entreno el modelo completo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Generacion de poesia breve (haikus) con estructura de 3 a 5 lineas y layout fijo, segun indica el nombre del modelo.
- Soporte de instrucciones y conversaciones multi-turno (capacidad del modelo base).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.
- No se documenta soporte de vision, audio ni modo "thinking" en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la etiqueta `language: en` del repositorio.

## Casos de uso

- Generacion de haikus para publicaciones editoriales o redes sociales: el modelo esta ajustado especificamente para producir poemas breves de 3 a 5 lineas con un layout concreto, lo que lo hace adecuado para pipelines de contenido poetico automatizado.
- Prototipado de aplicaciones creativas: al ser un modelo de 1,5B, se puede desplegar en una sola GPU consumer para experimentar con generacion poetica sin costes elevados.
- Filtrado y generacion de variantes en un catalogo de poesia: se pueden generar multiples versiones de un haiku para que un editor humano seleccione la mejor.
- Educacion y demostraciones de ajuste fino: sirve como ejemplo practico de SFT con Unsloth sobre un modelo pequeno para cursos o talleres.
- Generacion de texto breve en ingles para tests de integracion: su tamano reducido permite incluirlo en suites de pruebas de pipelines de transformers sin requerir infraestructura grande.
- Investigacion sobre sesgos en poesia generada: al ser un modelo de nicho, permite estudiar como el ajuste fino sobre un corpus especifico afecta al estilo y al vocabulario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (1,543B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,6 GB para pesos; en la practica, entre 2,5 y 4 GB.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 0,8 GB para pesos; en la practica, entre 1,5 y 3 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente en fp16; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 6 GB o mas en fp16, y en GPUs con 3-4 GB en cuantizacion 4 bits.
- Opciones de despliegue: transformers (libreria nativa del repo), text-generation-inference (tag `text-generation-inference`), llama.cpp/Ollama si se convierte a GGUF, y vLLM para servir en produccion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Single-Layout-3to5-SFT | 1,5B | no disponible (base: 32.768) | apache-2.0 | Hugging Face, 0 descargas | Ajuste fino para haikus en ingles |
| unsloth/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado | Modelo base sin ajuste especifico |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | apache-2.0 | Hugging Face, oficial | Modelo original de Alibaba |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 | Llama 3.2 Community License | Hugging Face | Alternativa de tamano similar, licencia mas restrictiva |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen2.5, puede heredar sesgos del corpus de preentrenamiento original.
- Riesgo de alucinacion: alto en tareas de conocimiento factual, ya que es un modelo de 1,5B ajustado para poesia y no para precision factual.
- Limitaciones de contexto o idioma: solo se declara ingles (`language: en`); no se confirma la longitud de contexto efectiva tras el ajuste fino.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se debe conservar el aviso de licencia y atribuir al autor original.
- Caveats para produccion: cero descargas y cero likes indican que el modelo no ha sido validado por la comunidad; la model card no documenta el dataset, la configuracion de entrenamiento ni evaluaciones, por lo que no es recomendable para produccion sin una evaluacion propia.
- El nombre del modelo sugiere un uso muy especifico (haikus con layout fijo); fuera de ese dominio, su rendimiento probablemente sea inferior al del modelo base sin ajustar.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Single-Layout-3to5-SFT
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
