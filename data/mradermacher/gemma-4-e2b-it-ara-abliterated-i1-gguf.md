# mradermacher/Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF

## Resumen

Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF es una cuantizacion en formato GGUF del modelo Austriani/Gemma-4-E2B-it-ARA-Abliterated, que a su vez deriva de la familia Gemma 4 de Google DeepMind en su variante E2B (edge, 2.000 millones de parametros efectivos). El autor de la cuantizacion es mradermacher, especialista en publicar versiones GGUF con cuantizacion ponderada por imatrix, pensadas para despliegue local en hardware de consumo y en el borde. El modelo base ha sido sometido a un proceso de "abliteration" (eliminacion de rechazos) mediante ablacion de rango arbitrario (ARA) con la herramienta Heretic, en el trial 61, con una divergencia KL de 0,1004 respecto al modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta una variante multimodal (texto, vision y audio) de la familia Gemma 4 con arquitectura de atencion hibrida y embeddings por capa, disenada para despliegue en dispositivo. Por otro, expone una version "uncensored" que elimina los mecanismos de rechazo del modelo alineado original, lo que tiene implicaciones directas en seguridad, cumplimiento normativo y uso comercial. El repositorio pesa 73,3 GB e incluye un amplio abanico de cuantizaciones desde IQ1_S (2,4 GB) hasta Q6_K, ademas del fichero imatrix para generar cuantizaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, vision, audio) con atencion hibrida y sliding-window attention, embeddings por capa |
| Parametros totales | 4.628.569.635 (segun safetensors); la model card declara 5.1b totales y 2.3b efectivos |
| Parametros activos | 2.300 millones efectivos (declarado en tags; no se especifica si es MoE o poda/condicional) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, IQ5_*, Q5_K_S, Q5_K_M, Q6_K (cuantizacion ponderada por imatrix) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 E2B, variante "edge" de la familia Gemma 4 de Google DeepMind, con arquitectura transformer multimodal que integra procesamiento de texto, vision y audio ("omni"). Los tags tecnicos indican atencion hibrida con sliding-window attention, embeddings por capa y un total de 5.100 millones de parametros con 2.300 millones efectivos, lo que sugiere un diseno orientado a reducir coste computacional en inferencia (posiblemente mediante activacion condicional o poda estructurada, aunque la model card no detalla el mecanismo exacto). El dato real de safetensors (4.628.569.635 parametros) difiere ligeramente de la cifra declarada en los tags.

Sobre el entrenamiento original de Gemma 4 E2B no se proporciona informacion en la documentacion disponible: no se especifican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o tecnicas de alineacion adicionales. Lo que si se documenta es el post-procesado aplicado por Austriani: un proceso de ablacion de rango arbitrario (ARA) ejecutado con la herramienta Heretic, en el trial 61, con una divergencia KL de 0,1004 respecto al modelo alineado. Este procedimiento elimina selectivamente las direcciones del espacio de activaciones asociadas a comportamientos de rechazo, dando como resultado un modelo "abliterated" o "uncensored". La cuantizacion de mradermacher aplica imatrix ponderada sobre el modelo ya modificado.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a chat, roleplay y escritura creativa.
- Procesamiento multimodal: vision (imagenes) y audio, segun los tags del modelo base; los ficheros mmproj necesarios para vision estan en el repositorio estatico de mradermacher.
- Capacidades de agente e instruccion: los tags incluyen "agent" e "instruct", lo que indica soporte para tareas guiadas por instrucciones y flujos multi-paso.
- Comportamiento sin rechazos: la ablacion elimina los mecanismos de negativa del modelo alineado, de modo que responde a peticiones que el modelo original declinaria.
- Multimodal chat: combinacion de texto, imagen y audio en una misma conversacion (sujeto a disponibilidad de los ficheros de proyeccion correspondientes).
- No se documenta explicitamente soporte de tool calling o function calling en la informacion disponible.

## Casos de uso

- Roleplay y escritura creativa sin restricciones: el modelo esta ajustado para conversacion abierta y ficcion; la ablacion permite explorar narrativas con contenido adulto o temas sensibles que el modelo alineado rechazaria. Adecuado para prototipado de personajes y generacion literaria en local.
- Despliegue en dispositivo (edge): con cuantizaciones desde 2,4 GB (IQ1_S) hasta 3,6 GB (Q4_1), el modelo cabe en moviles de gama alta, mini-PC y placas SBC, lo que permite asistentes conversacionales offline sin conexion.
- Procesamiento multimodal en local: con los ficheros mmproj del repositorio estatico, se pueden construir pipelines de descripcion de imagenes o transcripcion y analisis de audio en entornos sin nube, util para privacidad de datos.
- Asistente personal con contexto multimodal: combinacion de texto e imagen para tareas como lectura de documentos escaneados o interpretacion de capturas, ejecutada integramente en hardware de consumo.
- Experimentacion en seguridad y alineacion: la variante abliterated sirve como caso de estudio para investigar como la ablacion de direcciones afecta a la distribucion de salidas (KLD de 0,1004) y para evaluar riesgos de modelos sin rechazos.
- Generacion de contenido para juegos y narrativa interactiva: el modelo puede gestionar dialogos de personajes no jugadores (NPC) en local, con latencia baja gracias a su tamano reducido y a las cuantizaciones Q4 optimizadas para velocidad.
- Filtrado y moderacion de contenido (con cautela): su capacidad de generar contenido sensible lo hace inadecuado como moderador, pero puede usarse para generar conjuntos de datos adversarios que alimenten clasificadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,0 GB para IQ2_M/IQ3_S; 3,5-4,0 GB para Q4_K_M; 5,0-6,0 GB para Q6_K. El modelo completo en safetensors ronda los 9,3 GB en FP16 (4.628 millones de parametros), aunque el repositorio GGUF incluye todas las variantes.
- GPU recomendadas: cualquier GPU con 6 GB o mas para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. Para IQ1/IQ2 basta con 4 GB.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas desde 4 GB de VRAM; tambien en iGPU con memoria unificada (Apple Silicon, APUs AMD) y en CPU pura con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para vision y audio se requiere un runtime que soporte mmproj (llama.cpp con soporte multimodal).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera un throughput alto en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF (este) | 4,63B totales / 2,3B efectivos | no disponible | Texto, vision, audio | apache-2.0 | GGUF en HF |
| Gemma-4-E2B-it (original, Google) | 4,63B totales / 2,3B efectivos | no disponible | Texto, vision, audio | licencia Gemma 4 | Pesos en HF |
| Gemma-4-E2B-it-ARA-Abliterated (base de este) | 4,63B totales / 2,3B efectivos | no disponible | Texto, vision, audio | apache-2.0 | Safetensors en HF |
| Modelos edge comparables (p. ej. Phi-3-mini, Qwen2.5-3B) | ~3-4B | 4K-128K segun modelo | Solo texto (mayoria) | MIT / Apache / otras | Multiples formatos |

La comparativa directa con alternativas de la misma categoria es limitada porque no se dispone de datos de benchmarks ni de contexto para este modelo. Frente a alternativas edge solo-texto como Phi-3-mini o Qwen2.5-3B, la principal diferencia es la multimodalidad (vision y audio) y la naturaleza "uncensored", que no suele estar disponible en los modelos oficiales.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de rechazos implica que puede generar contenido danino, ilegal o sexualmente explicito. No es apto para despliegues publicos sin una capa de moderacion externa.
- La licencia apache-2.0 declarada en el repositorio remite a la licencia de Gemma 4 de Google; conviene verificar los terminos de uso comercial de la licencia original de Gemma, que puede imponer restricciones adicionales a las de Apache 2.0.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: inherente a los modelos de 2-4B; la cuantizacion agresiva (IQ1, IQ2) degrada aun mas la coherencia y la fidelidad factual.
- Las cuantizaciones por debajo de Q4 (especialmente IQ1 e IQ2) pierden calidad de forma notable; la model card advierte explicitamente de "very low quality" en Q2_K_S y "for the desperate" en IQ1_S.
- La ablacion puede degradar capacidades generales (razonamiento, instrucciones complejas) ademas de eliminar los rechazos; el KLD de 0,1004 cuantifica la divergencia pero no garantiza que las capacidades se mantengan intactas.
- No hay datos publicados de benchmarks, contexto maximo ni rendimiento multilingue; no se recomienda para produccion critica sin evaluacion propia.
- El modelo base declara 2,3B efectivos pero 5,1B totales (4,63B reales en safetensors); la discrepancia entre cifras sugiere cautela al planificar requisitos de memoria.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF
- Repositorio estatico con mmproj y cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma-4-E2B-it-ARA-Abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/Austriani/Gemma-4-E2B-it-ARA-Abliterated
- Pagina de descarga de mradermacher: https://hf.tst.eu/model#Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
