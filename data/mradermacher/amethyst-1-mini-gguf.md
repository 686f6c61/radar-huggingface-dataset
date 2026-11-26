# mradermacher/amethyst-1-mini-GGUF

## Resumen

Amethyst-1-mini es un modelo conversacional afinado mediante LoRA sobre la base Gemma 3, desarrollado por VertexAGI y distribuido en formato GGUF por mradermacher. El repositorio analizado contiene exclusivamente las cuantizaciones estáticas del modelo original (`VertexAGI/amethyst-1-mini`), no los pesos sin cuantizar. El modelo declara 4.551.515.648 parametros en safetensors, lo que lo situa en la categoria de modelos de aproximadamente 4.500 millones de parametros, coherente con la familia Gemma 3.

La relevancia practica de esta publicacion es la disponibilidad de una bateria completa de cuantizaciones GGUF (desde Q2_K hasta f16, pasando por IQ4_XS y Q8_0) que permiten ejecutar el modelo en hardware de consumo. El tag `distillation` sugiere que el afinamiento se apoyo en destilacion, aunque la model card no aporta detalles sobre el procedimiento. El tag `mlx` indica compatibilidad con el ecosistema MLX de Apple.

Se trata de un modelo orientado a conversacion en ingles (`language: en`), con licencia Gemma, lo que impone las condiciones de uso de Google para la familia Gemma. No se publican datos de benchmarks, contexto ni composicion del dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma 3, segun tags `gemma` y `gemma3`); detalles no disponibles |
| Parametros totales | 4.551.515.648 (4,55 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes imatrix en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (repo analizado); pesos originales en safetensors en el repo base |
| Tamano del repositorio | 41,7 GB (conjunto de todas las cuantizaciones) |
| Libreria | transformers |
| Modelo base | VertexAGI/amethyst-1-mini |

## Arquitectura y entrenamiento

La informacion disponible indica que Amethyst-1-mini parte de Gemma 3 y se afina mediante LoRA (tags `lora`, `gemma3`). El tag `distillation` apunta a un proceso de destilacion como parte del entrenamiento, pero la model card no especifica profesor, dataset, numero de tokens ni fases de RLHF/DPO. No hay datos sobre atencion lineal, decodificacion especulativa ni otras innovaciones tecnicas.

Las cuantizaciones fueron generadas con `quantize_version: 2` y `convert_type: hf`, con `skip_mmproj: 1`, lo que indica que no se incluye el proyector multimodal en los GGUF. Esto implica que, aunque la base Gemma 3 pueda tener capacidades multimodales, las cuantizaciones publicadas aqui estan orientadas a uso de texto. Existe ademas un repositorio de cuantizaciones ponderadas con imatrix (`mradermacher/amethyst-1-mini-i1-GGUF`) que suele ofrecer mejor calidad por bit que las estaticas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Afinamiento especifico para dialogo, presumiblemente orientado a asistencia conversacional.
- Compatibilidad con el ecosistema GGUF (llama.cpp y derivados) y con MLX (tag `mlx`).
- Capacidades multimodales: no confirmadas en esta distribucion; el proyector multimodal fue omitido (`skip_mmproj: 1`).
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso y agentes: no documentado.
- Modo thinking explicito: no documentado.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse en un portatil o estacion de trabajo mediante llama.cpp u Ollama usando la cuantizacion Q4_K_M (3,0 GB), gestionando dialogos multi-turno sin conexion a servicios externos.
- Prototipado rapido de chatbots: gracias al formato GGUF y a las multiples cuantizaciones, se puede iterar sobre prompts y flujos conversacionales con tiempos de carga bajos y sin necesidad de GPU dedicada.
- Evaluacion de tecnicas de destilacion y LoRA: util como caso de estudio para comparar el comportamiento de un adaptador LoRA sobre Gemma 3 frente al modelo base en tareas de dialogo.
- Despliegue en hardware Apple Silicon: el tag `mlx` y las cuantizaciones de 2-3 GB permiten ejecucion eficiente en Macs con memoria unificada, usando MLX o llama.cpp con backend Metal.
- Generacion de respuestas en entornos con recursos limitados: la cuantizacion Q2_K (2,1 GB) permite ejecucion en GPUs de gama baja o incluso CPU, a costa de calidad.
- Base para fine-tuning adicional: al estar disponible el modelo base sin cuantizar en `VertexAGI/amethyst-1-mini`, se puede partir de el para adaptaciones especificas de dominio antes de recuantizar.
- Servicio de inferencia ligero: con Q8_0 (5,0 GB) se obtiene la mejor calidad practica para servir peticiones concurrentes en una unica GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el modelo completo en memoria, mas overhead de contexto):
  - Q2_K: ~2,1 GB de pesos, ~3 GB con contexto moderado.
  - Q4_K_M: ~3,0 GB de pesos, ~4-5 GB con contexto moderado.
  - Q8_0: ~5,0 GB de pesos, ~6-7 GB con contexto moderado.
  - f16: ~9,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M (RTX 3060 6 GB, RTX 4060, RTX 2060); 8-12 GB para Q8_0 (RTX 3060 12 GB, RTX 4070); A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en todas las GPU con 6 GB o mas en cuantizaciones Q4 y superiores; Q2_K puede ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (via GGUF), MLX en Apple Silicon; vLLM y TGI requeririan los pesos originales en safetensors del repo base.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Amethyst-1-mini (este repo) | 4,55 mil millones | no disponible | gemma | GGUF | Afinamiento LoRA conversacional sobre Gemma 3 |
| Gemma 3 (base, ~4B) | ~4 mil millones | no disponible en esta ficha | gemma | safetensors, GGUF | Modelo base del que deriva; capacidades multimodales en la version original |
| Phi-3-mini | ~3,8 mil millones | no disponible en esta ficha | MIT | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva |
| Qwen2.5-3B/7B | 3-7 mil millones | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Familia con buen soporte multilingue |

La comparativa de rendimiento no puede establecerse por ausencia de benchmarks publicados para Amethyst-1-mini. La principal diferencia practica frente a Phi-3-mini y Qwen2.5 es la licencia: Gemma impone condiciones de uso adicionales frente a MIT o Apache 2.0.

## Limitaciones y advertencias

- Solo ingles declarado; el rendimiento en castellano no esta garantizado.
- No hay datos publicados sobre sesgos, dataset de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a modelos de este tamano, agravado en cuantizaciones Q2_K y Q3.
- La licencia Gemma impone terminos de uso de Google, incluida la politica de uso aceptable; revisar antes de uso comercial.
- Las cuantizaciones omiten el proyector multimodal (`skip_mmproj: 1`), por lo que no deben usarse para tareas de vision aunque la base Gemma 3 las soporte.
- El repositorio contiene 41,7 GB de cuantizaciones; descargar solo el archivo necesario para evitar consumo innecesario de disco.
- No hay informacion sobre tool calling, agentes ni modo thinking; no asumir estas capacidades en produccion.
- Las cuantizaciones estaticas pueden ser inferiores en calidad a las imatrix del repositorio `i1-GGUF` para el mismo tamano.
- Contexto maximo no documentado: verificar en la configuracion del modelo base antes de disenar prompts largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/amethyst-1-mini-GGUF
- Modelo base: https://huggingface.co/VertexAGI/amethyst-1-mini
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/amethyst-1-mini-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#amethyst-1-mini-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
