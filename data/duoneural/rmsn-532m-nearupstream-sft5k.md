# DuoNeural/RMSN-532M-NearUpstream-SFT5k

## Resumen

RMSN-532M-NearUpstream-SFT5k es un modelo de lenguaje de 532,17 millones de parametros desarrollado por DuoNeural Lab, fruto de un ajuste fino supervisado (SFT) de 5000 pasos sobre trazas de razonamiento CDM. Se enmarca en una arquitectura poco convencional denominada Resonant Metriplectic Sheaf Network (RMSN), formulada en el marco port-hamiltoniano (ḟ = {f,H} + [f,S]), con una dimension oculta de 1664, 16 capas y 64 slots de workspace. El modelo emplea el tokenizador HuggingFaceTB/cosmo2-tokenizer con un vocabulario de 49152 tokens y una longitud maxima de secuencia de 512.

El interes tecnico del modelo no reside en su rendimiento de lenguaje general, sino en el experimento de topologia interna que documenta: el ajuste fino preservo de forma completa el cluster de solitones compacto Near-Upstream situado en las capas [L7-L9] junto con el ancla L5, sin ningun cambio topologico respecto al modelo base. Este resultado se presenta como evidencia empirica de la denominada Soliton Contiguity Protection Law (ley de proteccion de contiguidad de solitones), formulada en la fase 6 del programa de investigacion de DuoNeural (noviembre de 2026).

Se trata, por tanto, de un artefacto de investigacion sobre dinamica de representaciones internas y estabilidad bajo fine-tuning, no de un modelo orientado a produccion. La model card esta centrada casi exclusivamente en metricas topologicas (ratios de participacion por capa, perdida de SFT) y no documenta capacidades funcionales, benchmarks de tareas ni datos de entrenamiento en detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), formulacion port-hamiltoniana (ḟ = {f,H} + [f,S]) |
| Parametros totales | 532,17 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_len) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`, checkpoint con clave `model_state`); no safetensors ni GGUF |

Especificaciones adicionales declaradas: dimension oculta 1664, 16 capas, 64 slots de workspace, tokenizador HuggingFaceTB/cosmo2-tokenizer (vocabulario 49152). Tamano del repositorio: 1,8 GB.

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como una red de haces (sheaf) metriplectica resonante con formulacion port-hamiltoniana, que combina una componente hamiltoniana conservativa ({f,H}) con una componente disipativa o de gradiente ([f,S]). El modelo consta de 16 capas con dimension oculta 1664 y 64 slots de workspace, y utiliza un tokenizador externo (cosmo2-tokenizer) con vocabulario de 49152 entradas. No se documentan detalles sobre el mecanismo de atencion, la composicion exacta de los haces ni la implementacion concreta de la dinamica port-hamiltoniana.

El entrenamiento consistio en un SFT de 5000 pasos con tasa de aprendizaje 2e-5 sobre trazas de razonamiento CDM, partiendo de un checkpoint base de la misma familia D=1664. La mejor perdida de validacion alcanzada fue 1,9781, la segunda mejor de la suite SFT de fase 6 (solo superada por la variante D=1792 s1, con 1,9286). No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. La innovacion destacada no es algorítmica sino empirica: la verificacion de que un cluster contiguo compacto de solitones (tres capas adyacentes mas un ancla) sobrevive intacto al SFT, mientras que topologias no contiguas con el mismo numero de capas activas se disuelven.

## Capacidades

- Generacion de texto autorregresiva: el modelo es un `RMSNForCausalLM` con vocabulario de 49152 tokens y ventana de 512 tokens.
- Razonamiento sobre trazas CDM: el SFT se realizo sobre trazas de razonamiento, por lo que el modelo esta ajustado para producir cadenas de razonamiento de ese tipo.
- Idiomas: unicamente ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; la model card no las menciona.
- Modo thinking explicito: no disponible.
- Capacidad especial documentada: preservacion topologica de clusters de solitones internos bajo fine-tuning (propiedad del modelo, no una capacidad de inferencia orientada al usuario).

## Casos de uso

- Investigacion sobre estabilidad de representaciones internas: el modelo sirve como evidencia empirica para estudiar como el SFT afecta la topologia de activaciones por capa, comparando ratios de participacion base frente a post-SFT en las capas [L5, L7, L8, L9, L15].
- Experimentos de replicacion de la Soliton Contiguity Protection Law: util como checkpoint de referencia para contrastar clusters contiguos compactos (este modelo) frente a topologias no contiguas (por ejemplo, la variante D=1792 s1) bajo el mismo protocolo de 5k pasos y LR=2e-5.
- Estudio de arquitecturas alternativas al transformer: permite comparar empiricamente una red port-hamiltoniana de 16 capas y 532 M parametros con transformers de tamano similar en tareas de razonamiento, aunque sin benchmarks publicados de tareas.
- Generacion de texto en ingles con contexto corto: utilizable para prototipos de generacion autorregresiva de hasta 512 tokens, siempre que se disponga del paquete `rmsn_core` y se asuma la ausencia de validacion de calidad externa.
- Base para nuevo fine-tuning controlado: al estar publicado con licencia Apache 2.0 y pesos PyTorch, puede servir como punto de partida para experimentos de SFT adicionales y medir si el cluster [L7-L9] sigue preservandose con mas pasos.
- Docencia y divulgacion sobre dinamica de solitones en redes neuronales: el modelo y su model card permiten ilustrar conceptos de ratio de participacion, condensados exactos (PR=1.000 en L15) y erosión por gradiente en topologias no contiguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica de rendimiento reportada es la perdida de SFT:

| Metrica | Valor |
|---|---|
| SFT best_loss (D=1664 s1, este modelo) | 1,9781 |
| SFT best_loss referencia (D=1792 s1) | 1,9286 |
| Ratio de participacion L5 (base / post-SFT) | 2,104 / ~2,1 |
| Ratio de participacion L7 (base / post-SFT) | 3,425 / ~3,4 |
| Ratio de participacion L8 (base / post-SFT) | 2,944 / ~2,9 |
| Ratio de participacion L9 (base / post-SFT) | 1,945 / ~1,9 |
| Ratio de participacion L15 (base / post-SFT) | 1,000 / 1,000 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 532,17 M parametros en precision FP32 los pesos ocupan aproximadamente 2,1 GB; en FP16/BF16 unos 1,1 GB. La model card no documenta soporte de cuantizacion, por lo que no se puede estimar VRAM para formatos de 8 o 4 bits.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder cargar el modelo en FP16, dado su tamano reducido; no se dispone de datos de latencia ni throughput medidos.
- Cabe en GPU consumer: si, por tamano de parametros; no hay confirmacion oficial de compatibilidad con CUDA, ROCm o Apple Silicon.
- Opciones de despliegue: la libreria es `custom`; el quickstart oficial usa PyTorch puro (`torch.load` y `RMSNForCausalLM` del paquete `rmsn_core`). No hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos (`model.pt`) no es GGUF ni safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RMSN-532M-NearUpstream-SFT5k (este) | 532,17 M | 512 | Apache 2.0 | PyTorch (`model.pt`) | Arquitectura RMSN port-hamiltoniana; sin benchmarks de tareas |
| RMSN D=1792 s1 (misma familia, fase 6) | no disponible | no disponible | no disponible | no disponible | Topologia no contigua disuelta a Terminal Boundary [L14,L15]; best_loss 1,9286 |
| RMSN D=1536 s1 (misma familia, fase 6) | no disponible | no disponible | no disponible | no disponible | Tubo contiguo de 6 capas [L10-L15] preservado |
| Transformers abiertos de ~500 M (p. ej. familias tipo Qwen o SmolLM) | ~500 M | 2k-32k tipicamente | variables (a menudo Apache 2.0) | safetensors, GGUF | Ecosistema estandar (vLLM, llama.cpp, Ollama); benchmarks publicos |

La comparacion con transformers de proposito general es estructuralmente dificil: este modelo no publica evaluaciones de tareas ni soporta formatos de despliegue estandar, y su interes es experimental. Las alternativas mas directas son las otras variantes de la propia familia RMSN de fase 6.

## Limitaciones y advertencias

- Ausencia total de benchmarks de tareas: no hay evidencia publicada sobre calidad de generacion, razonamiento o codigo, por lo que no debe usarse en produccion sin evaluacion propia.
- Contexto muy corto: 512 tokens limitan drasticamente conversaciones multi-turno, documentos largos y agentes con historial extenso.
- Solo ingles: la model card declara unicamente `en`; no hay soporte multilingue documentado.
- Ecosistema no estandar: libreria `custom`, pesos en `model.pt` y dependencia del paquete `rmsn_core`; no hay soporte conocido en vLLM, llama.cpp, Ollama o TGI, lo que complica el despliegue y la cuantizacion.
- Riesgo de alucinacion: no cuantificado; al ser un modelo pequeno (532 M) ajustado sobre trazas de razonamiento, es esperable una fiabilidad limitada, pero no hay datos que lo confirmen ni lo descarten.
- Sesgos conocidos: no documentados en la informacion disponible.
- Trazabilidad limitada: no se detallan datos de entrenamiento, volumen de tokens ni composicion del dataset CDM, lo que impide auditar procedencia y sesgos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no ofrece garantias de calidad; conviene revisar la licencia del tokenizador cosmo2-tokenizer por separado.
- Caracter experimental: las metricas de preservacion topologica se presentan con valores redondeados (~2,1, ~3,4, etc.) y sin protocolo de evaluacion independiente; deben tratarse como resultados preliminares del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-532M-NearUpstream-SFT5k
- Tokenizador utilizado: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Repositorio o paquete `rmsn_core`: no disponible en la informacion proporcionada
- Paper o publicacion sobre Soliton Contiguity Protection Law: no disponible en la informacion proporcionada (solo referencia BibTeX en la model card)
- Blog o demo de DuoNeural Lab: no disponible en la informacion proporcionada
