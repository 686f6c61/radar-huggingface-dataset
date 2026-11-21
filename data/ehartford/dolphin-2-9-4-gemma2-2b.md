# ehartford/dolphin-2.9.4-gemma2-2b

## Resumen

Dolphin 2.9.4 Gemma2 2B es un ajuste fino (fine-tune) del modelo Gemma 2 de 2.000 millones de parametros publicado por Google, realizado por el desarrollador independiente Eric Hartford (ehartford) bajo su familia de modelos "Dolphin". El modelo se distribuye en Hugging Face con pesos en formato safetensors y una licencia Gemma, lo que condiciona su uso comercial a los terminos de dicha licencia. Con 2.614.346.496 parametros reales en pesos, se posiciona en la gama de modelos pequenos orientados a ejecucion en hardware modesto.

El objetivo declarado de la familia Dolphin es ofrecer modelos "desalineados" o sin las capas de rechazo tipicas de los asistentes comerciales, entrenados sobre datasets de instrucciones abiertos y diversos. En este caso, el fine-tune parte de la arquitectura Gemma 2, un transformer decoder-only con atencion por ventanas alternas y normalizacion RMSNorm, aunque la model card publicada no aporta detalles sobre el dataset de ajuste, el numero de tokens empleados ni la metodologia exacta (SFT, DPO, etc.).

La relevancia de esta ficha es limitada: el repositorio tiene un volumen de descargas muy bajo (8 descargas) y ningun "like", y la model card no incluye informacion tecnica sustancial mas alla de la licencia y el idioma. Se trata, por tanto, de un modelo de nicho cuya evaluacion practica requiere pruebas directas, ya que no hay benchmarks publicados ni documentacion de entrenamiento disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 2) |
| Parametros totales | 2.614.346.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica; el Gemma 2 base soporta 8.192 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican versiones GGUF/AWQ/GPTQ en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Tamano del repo | 5,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2, un transformer decoder-only con atencion multi-cabeza, atencion por ventanas deslizantes alternadas con atencion global completa, RMSNorm y activaciones GeGLU. El modelo base Gemma 2 2B fue entrenado por Google sobre datos web, codigo y matematicas, con tecnicas de destilacion desde modelos mayores y ajuste por RLHF. Sin embargo, la model card de este repositorio no documenta los detalles del fine-tune realizado por ehartford: no se indica el dataset de instrucciones utilizado, el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de SFT, DPO o RLHF.

Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) ni se aportan curvas de entrenamiento o metricas de validacion. La unica informacion confirmada es el numero de parametros (2.614.346.496) derivado de los pesos safetensors y el tamano del repositorio (5,3 GB), coherente con pesos en precision de 16 bits.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente para el idioma ingles, por lo que su rendimiento en otros idiomas no esta garantizado.
- Razonamiento e instrucciones generales: al ser un fine-tune de la familia Dolphin, se espera que siga instrucciones y responda a prompts conversacionales, aunque no hay evaluaciones publicadas que lo confirmen.
- Generacion de codigo y matematicas: el modelo base Gemma 2 tiene capacidades en estas areas, pero no se ha verificado su preservacion tras el fine-tune.
- Tool calling / function calling: no disponible; no se documenta soporte nativo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: limitadas al ingles segun la etiqueta del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo es solo texto.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ser un modelo de 2,6B parametros, puede ejecutarse en una GPU de consumo y servir para validar flujos de chat antes de escalar a modelos mayores. Su tamano reducido permite iteraciones rapidas.
- Experimentacion con fine-tunes sin censura: la familia Dolphin esta orientada a investigadores que estudian el comportamiento de modelos sin capas de rechazo; este modelo puede usarse en entornos controlados para analizar respuestas a prompts sensibles.
- Generacion de texto en entornos con recursos limitados: con 5,3 GB de pesos en fp16, cabe en GPUs con 8 GB de VRAM (por ejemplo, RTX 3060 Ti o RTX 4060) y permite inferencia local sin infraestructura en la nube.
- Educacion y demostraciones: util para ensenar conceptos de fine-tuning y despliegue de LLMs en cursos o talleres, dado su tamano manejable y su licencia abierta (con condiciones).
- Generacion de datos sinteticos en ingles: puede emplearse para producir texto diverso en pipelines de aumento de datos, aunque la calidad debe validarse manualmente.
- Investigacion sobre alineacion y seguridad: al carecer de filtros de rechazo, sirve como caso de estudio para comparar comportamientos con modelos alineados, siempre en entornos de investigacion etica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 5,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 6-7 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3 GB; en 4 bits, unos 1,5-2 GB (aunque no se distribuyen pesos cuantizados oficialmente, pueden generarse con herramientas como llama.cpp o bitsandbytes).
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) para fp16 sin problemas; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en fp16; en cuantizacion 4 bits cabe en GPUs con 4-6 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras conversion a GGUF), Ollama (previa conversion), transformers con PyTorch.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del backend. En una RTX 4090, un modelo de 2,6B en fp16 puede superar los 100 tokens/s en generacion, pero no hay mediciones publicadas para este fine-tune concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ehartford/dolphin-2.9.4-gemma2-2b | 2,61B | no disponible | gemma | Hugging Face (8 descargas) | Fine-tune Dolphin sobre Gemma 2 2B |
| google/gemma-2-2b | 2,61B | 8.192 tokens | gemma | Hugging Face (muy popular) | Modelo base oficial de Google |
| Qwen/Qwen2-1.5B | 1,54B | 32.768 tokens | apache-2.0 | Hugging Face | Alternativa abierta con contexto mayor |
| microsoft/Phi-3-mini-4k-instruct | 3,82B | 4.096 tokens | mit | Hugging Face | Modelo pequeno con licencia permisiva |

La comparativa se basa en datos publicos de los modelos base; no hay benchmarks de este fine-tune que permitan comparar rendimiento real. La principal desventaja frente a alternativas como Qwen2-1.5B o Phi-3-mini es la licencia Gemma, mas restrictiva que Apache 2.0 o MIT, y la ausencia de documentacion tecnica.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Gemma 2 y de datasets de instrucciones no documentados, puede heredar sesgos de genero, raza o religion presentes en los datos de entrenamiento; no se han publicado evaluaciones de sesgo.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa con apariencia de veracidad; el riesgo es mayor en un modelo pequeno y sin benchmarks de fidelidad.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta confirmada y podria ser inferior a la del Gemma 2 base si el fine-tune no la preservo.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso comercial, obligaciones de atribucion y restricciones de uso aceptable; es necesario revisar los terminos antes de cualquier despliegue en produccion.
- Caveats para produccion: el repositorio tiene un volumen de descargas muy bajo (8) y ningun "like", lo que sugiere poca validacion por parte de la comunidad; no hay model card detallada, ni benchmarks, ni versiones cuantizadas oficiales. No se recomienda su uso en produccion sin una evaluacion exhaustiva previa.
- Falta de soporte de tool calling y agentes: no se documenta ninguna capacidad de este tipo, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/ehartford/dolphin-2.9.4-gemma2-2b
- Modelo base Gemma 2 2B (Google): https://huggingface.co/google/gemma-2-2b
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Repositorio de la familia Dolphin (ehartford): https://huggingface.co/ehartford
