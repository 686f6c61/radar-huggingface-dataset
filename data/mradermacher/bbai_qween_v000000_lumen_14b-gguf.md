# mradermacher/BBAI_QWEEN_V000000_LUMEN_14B-GGUF

## Resumen

BBAI_QWEEN_V000000_LUMEN_14B-GGUF es la distribucion en formato GGUF del modelo Supichi/BBAI_QWEEN_V000000_LUMEN_14B, publicada por el cuantizador mradermacher. Se trata de un modelo de lenguaje conversacional en ingles obtenido mediante tecnicas de merge (fusión de pesos) con mergekit, cuyo origen combina componentes de la familia Qwen con otros pesos, segun se deduce de la nomenclatura del identificador. El repositorio ofrece exclusivamente cuantizaciones estaticas, sin variantes ponderadas ni imatrix.

El modelo declara 10.365.735.936 parametros reales en safetensors, aunque su denominacion comercial lo etiqueta como "14B"; esta discrepancia es habitual en merges donde el conteo efectivo de tensores difiere del nombre asignado. El repositorio GGUF ocupa 92,9 GB e incluye doce variantes de cuantizacion, desde Q2_K (4,2 GB) hasta f16 (20,8 GB), lo que permite desplegarlo en hardware muy diverso, desde GPUs de consumo con 6-8 GB de VRAM hasta estaciones de trabajo.

Su relevancia es limitada pero practica: al ser un merge comunitario sin model card tecnica detallada, benchmarks ni documentacion de entrenamiento, su interes reside en la disponibilidad de cuantizaciones listas para llama.cpp y en la posibilidad de ejecutarlo localmente. No debe confundirse con un modelo oficial de Qwen ni con un lanzamiento corporativo; es un artefacto experimental de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen, segun nomenclatura; no confirmado en model card) |
| Parametros totales | 10.365.735.936 (dato real en safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no documenta la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion. El unico dato tecnico verificable es que el modelo base fue generado con mergekit, la herramienta de fusion de pesos de Arcee AI, y que el resultado se etiqueta como un merge. Por la nomenclatura (QWEEN, LUMEN) y la base declarada, es plausible que combine pesos de la familia Qwen con otros modelos, pero no hay informacion publicada que confirme la composicion exacta, el numero de tokens de entrenamiento, la presencia de RLHF/DPO ni innovaciones como atencion lineal o decodificacion especulativa.

El trabajo de mradermacher consiste unicamente en la conversion a GGUF y la generacion de cuantizaciones estaticas (sin imatrix ni variantes ponderadas, segun indica el propio autor). No se realizo un ajuste fino adicional ni una recalibracion de pesos durante la cuantizacion mas alla del proceso estandar de llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones, heredado del modelo base (no verificado con benchmarks).
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- Soporte multilingue limitado al ingles declarado; no se documentan otros idiomas.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Compatible con endpoints (tag `endpoints_compatible`) para despliegue en infraestructura de Hugging Face.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (6,5 GB) puede ejecutarse en una GPU de consumo de 8 GB y servir como banco de pruebas para prompts y flujos conversacionales antes de migrar a un modelo con soporte comercial.
- Experimentacion con merges comunitarios: util para investigadores que estudian el efecto de la fusion de pesos en la calidad conversacional, comparando las distintas cuantizaciones del mismo merge.
- Despliegue en entornos con recursos limitados: la variante Q2_K (4,2 GB) permite inferencia en GPUs de 6 GB o en CPU con llama.cpp, adecuada para demos y entornos de desarrollo sin GPU dedicada.
- Generacion de texto offline y privacidad: al ejecutarse localmente con llama.cpp u Ollama, permite procesar texto sin enviar datos a servicios externos, util en entornos con requisitos de confidencialidad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes del mismo modelo, lo que facilita medir la degradacion de perplejidad entre Q2_K y Q8_0 en tareas concretas.
- Base para experimentos de ajuste fino ligero: al disponer de pesos GGUF y del modelo base en safetensors, puede servir como punto de partida para LoRA en ingles, aunque la falta de licencia clara es un obstaculo para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de archivo y overhead de contexto):
  - Q2_K (4,2 GB): ~5-6 GB de VRAM.
  - Q4_K_M (6,5 GB): ~7-8 GB de VRAM.
  - Q5_K_M (7,5 GB): ~8-9 GB de VRAM.
  - Q6_K (8,6 GB): ~9-10 GB de VRAM.
  - Q8_0 (11,1 GB): ~12 GB de VRAM.
  - f16 (20,8 GB): ~21-22 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4-Q6; RTX 4090 24 GB para Q8_0 y f16; A100/H100 para despliegues concurrentes con contexto largo.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6 GB hasta Q8_0 en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; al ser GGUF estatico, no es compatible de forma nativa con vLLM o TGI sin conversion previa a safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BBAI_QWEEN_V000000_LUMEN_14B-GGUF | 10,37 B (reales) | no disponible | no disponible | GGUF | Merge comunitario, solo ingles |
| Qwen2.5-14B-Instruct | 14,7 B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Modelo oficial, multilingue, con benchmarks publicados |
| Mistral-Nemo-12B-Instruct | 12,2 B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial, contexto largo, multilingue |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Modelo oficial, con benchmarks y soporte de tool calling |

La comparativa es orientativa: el modelo analizado carece de documentacion que permita verificar su rendimiento frente a estas alternativas oficiales, que ademas ofrecen licencias claras y contexto documentado.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, alineacion ni evaluacion, lo que impide estimar sesgos o calidad real.
- Riesgo elevado de alucinacion no cuantificado: sin benchmarks ni evaluaciones publicadas, no hay garantia de fidelidad factual.
- Idiomas: solo se declara ingles; el rendimiento en castellano es desconocido y probablemente deficiente.
- Licencia no disponible: no se puede asumir uso comercial; es imprescindible contactar con el autor del modelo base (Supichi) antes de cualquier despliegue en produccion.
- Discrepancia entre el nombre "14B" y los 10,37 B reales de parametros: puede inducir a error al planificar hardware.
- Solo cuantizaciones estaticas: no hay variantes imatrix o ponderadas, que suelen ofrecer mejor calidad por tamano.
- Al ser un merge experimental sin mantenimiento documentado, no es recomendable para sistemas en produccion con requisitos de estabilidad.
- Repositorio con muy poca traccion (183 descargas, 0 likes) y sin comunidad activa que reporte problemas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BBAI_QWEEN_V000000_LUMEN_14B-GGUF
- Modelo base: https://huggingface.co/Supichi/BBAI_QWEEN_V000000_LUMEN_14B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#BBAI_QWEEN_V000000_LUMEN_14B-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
