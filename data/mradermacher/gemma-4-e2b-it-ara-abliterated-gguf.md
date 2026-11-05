# mradermacher/Gemma-4-E2B-it-ARA-Abliterated-GGUF

## Resumen

Gemma-4-E2B-it-ARA-Abliterated-GGUF es la distribucion en formato GGUF de un modelo derivado de la familia Gemma 4 de Google DeepMind, concretamente la variante E2B (edge, 2.3b de parametros efectivos) en su version instruct. Sobre esa base, el usuario Austriani aplico una tecnica de abliteration (ablacion de direcciones de rechazo mediante Arbitrary Rank Ablation, ARA) para eliminar los comportamientos de negativa del modelo original, y mradermacher ha generado las cuantizaciones estaticas en GGUF para su uso con llama.cpp y derivados.

El modelo original combina capacidades multimodales (texto, vision y audio) con una arquitectura hibrida de atencion disenada para despliegue en dispositivos de borde. La abliteration lo convierte en una variante "uncensored" orientada a generacion creativa, roleplay y agentes, a costa de posibles degradaciones en la coherencia y en la seguridad del contenido generado.

Esta ficha describe la version GGUF publicada por mradermacher, que hereda las caracteristicas del modelo base Austriani/Gemma-4-E2B-it-ARA-Abliterated y anade el catalogo de cuantizaciones estaticas (de Q2_K a f16, ademas de los proyectores multimodales mmproj).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida con atencion de ventana deslizante (sliding-window attention) y embeddings por capa; multimodal (vision-language y audio) |
| Parametros totales | 4.628.569.635 (segun safetensors); la model card indica 5.1b totales y 2.3b efectivos |
| Parametros activos | 2.3b efectivos (segun tags del autor; no se especifica mecanismo MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyectores multimodales mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (segun metadatos; el modelo base es de Google DeepMind y probablemente multilingue, pero no se detalla en la informacion disponible) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer hibrido con atencion de ventana deslizante (sliding-window attention) y embeddings por capa (per-layer embeddings), disenado explicitamente para despliegue en el borde (edge-deployment, on-device). El modelo es multimodal: procesa texto, imagenes y audio, lo que se refleja en los ficheros mmproj incluidos en el repositorio GGUF. La model card menciona 2.3b de parametros efectivos frente a 5.1b totales, aunque no se detalla en la informacion disponible el mecanismo exacto que produce esa diferencia (posible mezcla de expertos o parametros no activados por token).

El proceso de entrenamiento original de Gemma 4 no se detalla en la informacion proporcionada. Sobre el modelo base, Austriani aplico Arbitrary Rank Ablation (ARA), una variante de abliteration que proyecta fuera del espacio de activaciones las direcciones asociadas a comportamientos de rechazo. Los tags indican que se trata del "trial 61" con una divergencia KL de 0.1004 respecto al modelo original, metrica habitual para medir cuanto se ha desviado la distribucion de salida tras la ablacion. No se especifican volumen de tokens, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y instruct, con soporte de chat multi-turno.
- Procesamiento multimodal: vision (imagenes) y audio, mediante los proyectores mmproj incluidos.
- Generacion creativa y roleplay, reforzados por la eliminacion de rechazos via abliteration.
- Uso como agente e integracion en flujos de razonamiento multi-paso (tag agent).
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Modo thinking: no disponible.
- Multilingue: los metadatos solo declaran en; no se confirma cobertura de otros idiomas.

## Casos de uso

- Roleplay y narrativa interactiva: la abliteration elimina las negativas del modelo base, lo que lo hace adecuado para ficcion con temas adultos o situaciones que el modelo original rechazaria; el formato GGUF permite ejecutarlo localmente con llama.cpp.
- Generacion creativa en local: con cuantizaciones Q4_K_M de 3.5 GB, cabe en portatiles y equipos de consumo, permitiendo escribir relatos, guiones o dialogos sin depender de APIs externas.
- Asistentes conversacionales en dispositivos de borde: el diseno edge/on-device y los 2.3b de parametros efectivos permiten desplegarlo en moviles, Raspberry Pi de gama alta o mini-PC con poca VRAM.
- Prototipado de agentes: la etiqueta agent y el formato instruct permiten usarlo como nucleo de un agente que encadena pasos, siempre que se valide su comportamiento tras la ablacion.
- Experimentacion con tecnicas de abliteration: util para investigadores que quieran comparar el efecto de ARA (KLD 0.1004, trial 61) sobre un modelo de referencia, usando distintas cuantizaciones para medir la degradacion.
- Descripcion de imagenes y audio en local: gracias a los ficheros mmproj, puede procesar entradas multimodales en entornos sin GPU dedicada, con el proyector Q8_0 (0.7 GB) como opcion mas ligera.
- Filtrado y reescritura de contenido sensible: en pipelines donde se necesita reformular o generar texto que un modelo censurado rechazaria, aunque con revision humana obligatoria por los riesgos asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica objetiva proporcionada es la divergencia KL de 0.1004 respecto al modelo base tras la ablacion (ARA trial 61), que mide el grado de alteracion de la distribucion de salida, no la calidad en tareas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas overhead. Q2_K ~3.1 GB, Q4_K_M ~3.5 GB, Q6_K ~3.9 GB, Q8_0 ~5.0 GB, f16 ~9.4 GB. Los proyectores multimodales anaden 0.7 GB (Q8_0) o 1.1 GB (f16).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM (RTX 3050, RTX 4060, RTX 3060 12 GB) para cuantizaciones Q4/Q5; RTX 4090, A100 o H100 solo si se busca maxima calidad (Q8_0 o f16) o alto throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas, usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui (llama.cpp backend) y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles. Por tamano (2.3b efectivos), se espera un rendimiento alto en hardware consumer, pero no hay cifras publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-E2B-it-ARA-Abliterated-GGUF (este) | 4.6b totales / 2.3b efectivos | no disponible | texto, vision, audio | apache-2.0 | GGUF |
| Austriani/Gemma-4-E2B-it-ARA-Abliterated (base) | 4.6b totales / 2.3b efectivos | no disponible | texto, vision, audio | apache-2.0 | safetensors |
| Gemma 4 E2B-it original (Google DeepMind) | 4.6b totales / 2.3b efectivos | no disponible | texto, vision, audio | licencia Gemma 4 | safetensors |
| Otras variantes abliterated de Gemma (p. ej. Gemma-2-2b-it abliterated) | ~2.6b | 8k aprox. | solo texto | gemma license | safetensors / GGUF |

La comparativa directa con modelos de la misma categoria (abliterated de 2-3b) no esta documentada en la informacion disponible; los datos de la fila de Gemma-2 abliterated son orientativos y no proceden de la busqueda. El principal diferencial de este modelo frente al original es la eliminacion de rechazos, no una mejora de capacidades.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ilegal o sexualmente explicito sin filtros. No es apto para aplicaciones orientadas al publico general sin moderacion externa.
- La ablacion introduce una divergencia KL de 0.1004 respecto al original, lo que puede degradar la coherencia, la factualidad y el seguimiento de instrucciones complejas. Es necesario evaluar tarea por tarea.
- Riesgo elevado de alucinacion, agravado por el tamano reducido (2.3b efectivos) y por la alteracion de pesos.
- Idiomas: los metadatos solo declaran ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin pruebas.
- Licencia apache-2.0 en el repositorio, pero el license_link apunta a la licencia de Gemma 4 de Google, que impone restricciones de uso adicionales (uso comercial permitido con condiciones, prohibiciones de uso malicioso). Revisar ambos textos antes de produccion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: poca validacion comunitaria, sin garantias de calidad.
- El autor de la cuantizacion indica que no hay cuantizaciones con imatrix/weighted disponibles en el momento de la publicacion; las estaticas pueden perder calidad en comparacion.
- Fecha de creacion futura (2026-11-05) en los metadatos: verificar que el repositorio es el correcto y que los ficheros no cambian.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma-4-E2B-it-ARA-Abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/Austriani/Gemma-4-E2B-it-ARA-Abliterated
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-E2B-it-ARA-Abliterated-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
