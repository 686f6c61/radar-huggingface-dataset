# mradermacher/LFM3-1.7B-Heretic-Abliterated-GGUF

## Resumen

LFM3-1.7B-Heretic-Abliterated-GGUF es una cuantizacion estatica en formato GGUF del modelo Vortecks/LFM3-1.7B-Heretic-Abliterated, un derivado "abliterated" (sin rechazo condicionado) del modelo base LiquidAI LFM3-1.7B. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, mientras que la modificacion del comportamiento (eliminacion de capas de rechazo) corresponde a Vortecks. El modelo esta pensado para inferencia en local y en el borde (edge), con un tamano de 1.728.801.600 parametros (aproximadamente 1,7 mil millones).

El modelo hereda la arquitectura y el entrenamiento del LFM3-1.7B original de Liquid AI, un modelo conversacional orientado a despliegue en dispositivos con recursos limitados y con soporte declarado para 16 idiomas (entre ellos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco). La variante "Heretic-Abliterated" modifica los pesos para reducir los comportamientos de rechazo, lo que la hace atractiva para experimentacion con prompts y generacion sin filtros, pero tambien plantea riesgos de seguridad y de cumplimiento.

Su relevancia actual radica en que ofrece un modelo de 1,7B en cuantizaciones que van desde 0,9 GB (Q2_K) hasta 3,6 GB (f16), lo que permite ejecutarlo en GPUs de consumo, CPUs modernas y dispositivos de borde mediante llama.cpp u Ollama. La licencia es lfm1.0 (no estandar, enlazada al modelo original de LiquidAI), lo que exige revisar las condiciones antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles completos no disponibles en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 (1,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia "other", enlazada a LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (cuantizaciones estaticas); repo de 15,9 GB en total |

## Arquitectura y entrenamiento

El modelo base es LFM3-1.7B de Liquid AI, un transformer conversacional de 1,7 mil millones de parametros disenado para despliegue en el borde. La model card de esta cuantizacion no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la documentacion del modelo original de LiquidAI, que no se ha proporcionado. La variante Vortecks/LFM3-1.7B-Heretic-Abliterated aplica la tecnica conocida como "abliteration", que consiste en modificar los pesos (tipicamente en las direcciones de activacion asociadas al rechazo) para reducir la probabilidad de respuestas de negativa, sin reentrenar el modelo desde cero.

La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1), generando cuantizaciones estaticas K-quants e IQ. Tambien existe una version con cuantizaciones ponderadas/imatrix en el repositorio mradermacher/LFM3-1.7B-Heretic-Abliterated-i1-GGUF, que suele ofrecer mejor calidad por bit que las estaticas equivalentes. No se han documentado innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del LFM3-1.7B base.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones, lo que cambia el perfil de respuestas respecto al modelo original.
- Soporte multilingue declarado para 16 idiomas, incluido el espanol.
- Compatibilidad con la libreria transformers y con el ecosistema GGUF (llama.cpp, Ollama, etc.).
- Tool calling / function calling: no confirmado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; el tamano de 1,7B limita el razonamiento complejo.
- Vision, audio o modo "thinking": no disponibles en la informacion proporcionada.

## Casos de uso

- Experimentacion con prompts sin filtros: util para investigadores que estudian el comportamiento de modelos abliterated y comparan respuestas frente al LFM3-1.7B original; el formato GGUF permite cargarlo rapidamente en llama.cpp.
- Prototipado local en portatiles: con cuantizaciones Q4_K_M (1,2 GB) o Q5_K_M (1,4 GB) se puede ejecutar en CPU o en GPUs de consumo, ideal para demos y pruebas de concepto sin infraestructura cloud.
- Generacion de texto creativo y conversacional: el modelo esta etiquetado como "conversational" y admite 16 idiomas, lo que permite construir chatbots de ficcion o asistentes de escritura en espanol y otras lenguas.
- Despliegue en dispositivos de borde: el tag "edge" y el tamano reducido (desde 0,9 GB en Q2_K) lo hacen apto para entornos con memoria limitada, como mini-PC o sistemas embebidos con llama.cpp.
- Evaluacion de sesgos y seguridad: al ser una variante abliterated, sirve como caso de estudio para medir como cambia la tasa de rechazo y la toxicidad respecto al modelo base, util en auditorias de IA.
- Fine-tuning ligero o destilacion: el checkpoint en transformers (formato safetensors de 1,7B) puede servir como base para LoRA o para generar datos sinteticos en pipelines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB con Q4_K_M, 1,5-2 GB con Q6_K, 2-2,5 GB con Q8_0 y 4-5 GB con f16 (incluyendo overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es demasiado pequeno para aprovechar GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs modernas (GTX 1060 6GB en adelante) e incluso en iGPUs con memoria compartida usando cuantizaciones Q4.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el repo incluye el tag endpoints_compatible. Para el checkpoint original en transformers se puede usar la libreria transformers con custom_code.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera decenas de tokens por segundo en GPU de consumo y varios tokens por segundo en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Abliterated-GGUF (este) | 1,7B | no disponible | lfm1.0 | GGUF | Variante abliterated, 16 idiomas, cuantizaciones desde 0,9 GB |
| LiquidAI LFM3-1.7B (base) | 1,7B | no disponible | lfm1.0 | safetensors/GGUF | Modelo original con filtros de rechazo intactos |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors/GGUF | Alternativa de tamano similar con licencia permisiva |
| Llama 3.2 1B Instruct | 1,2B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors/GGUF | Alternativa edge con contexto largo y licencia restrictiva |

## Limitaciones y advertencias

- Al ser una variante "abliterated", el modelo puede generar contenido que el LFM3 original rechazaria; no es apto para produccion orientada al publico sin moderacion adicional.
- Riesgo de alucinacion elevado por el tamano (1,7B): no es fiable para tareas de razonamiento complejo, matematicas avanzadas o codigo de produccion.
- La licencia lfm1.0 es "other" y remite a la licencia del modelo LiquidAI; es obligatorio revisar sus terminos antes de cualquier uso comercial, ya que puede incluir restricciones de redistribucion o de uso.
- Los datos de contexto, composicion del entrenamiento y benchmarks no estan documentados en esta ficha; no se deben asumir capacidades no verificadas.
- El modelo base es de noviembre de 2026 segun la fecha de creacion del repo; verificar la vigencia de la licencia y de las dependencias (transformers, llama.cpp) antes de desplegar.
- No se ha confirmado soporte de tool calling, agentes ni vision; no disenar arquitecturas que dependan de estas capacidades sin validarlas.
- El repo pesa 15,9 GB por incluir todas las cuantizaciones; descargar solo el archivo GGUF necesario para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Abliterated-GGUF
- Modelo base de la variante: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Abliterated-i1-GGUF
- Modelo original LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-Heretic-Abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
