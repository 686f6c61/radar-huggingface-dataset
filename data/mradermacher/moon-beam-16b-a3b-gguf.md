# mradermacher/Moon-Beam-16B-A3B-GGUF

## Resumen

Moon-Beam-16B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el usuario tablinum, del que mradermacher publica esta version cuantizada en formato GGUF. El modelo base cuenta con 15.960.110.208 parametros totales (aproximadamente 16B) y, segun la nomenclatura "A3B", activa alrededor de 3B parametros por token, lo que lo situa en la categoria de modelos eficientes en inferencia. La arquitectura se etiqueta como deepseek_v3, lo que sugiere que reutiliza el diseno de atencion y enrutamiento de expertos introducido por DeepSeek-V3.

El modelo incorpora conceptos poco habituales en su etiquetado: "engram", "retrieval-augmented" y "calibration", ademas de las etiquetas "moon-beam", "moonlight" y "tablinum". Esto apunta a un modelo orientado a recuperacion aumentada y a mecanismos de memoria o representaciones internas tipo engram, aunque la model card disponible no desarrolla estos detalles tecnicos. El idioma declarado es unicamente ingles y la licencia es MIT, lo que facilita su uso comercial sin restricciones adicionales.

La relevancia de esta publicacion reside en la disponibilidad de cuantizaciones GGUF estaticas (desde Q2_K hasta Q8_0) que permiten ejecutar un MoE de 16B en hardware de consumo, algo inviable con los pesos en safetensors (el repo completo ocupa 114,9 GB). Al activar solo ~3B parametros por token, el coste computacional por token es comparable al de un modelo denso de 3B, lo que lo hace atractivo para despliegues locales con presupuesto de VRAM limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en deepseek_v3, con etiquetas engram y retrieval-augmented |
| Parametros totales | 15.960.110.208 (~16B) |
| Parametros activos | ~3B (inferido de la nomenclatura "A3B"; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), etiquetado como deepseek_v3, lo que implica un esquema de enrutamiento por token hacia un subconjunto de expertos y, previsiblemente, atencion multi-cabeza latente (MLA) tal como se describe en la familia DeepSeek-V3. El nombre "Moon-Beam" y la etiqueta "moonlight" sugieren una relacion con la linea Moonlight de modelos MoE eficientes, aunque no se confirma en la informacion disponible. El modelo incorpora etiquetas de "engram" y "retrieval-augmented", que apuntan a mecanismos de memoria asociativa o de recuperacion integrados, pero la model card no detalla su implementacion ni como afectan al grafo computacional.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o calibracion supervisada. La etiqueta "calibration" podria indicar un post-entrenamiento orientado a calibracion de confianza, pero es una inferencia no verificada. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal mas alla de lo implicito en la arquitectura deepseek_v3.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado como conversacional.
- Razonamiento multi-paso y soporte de agentes, segun las etiquetas "retrieval-augmented" y "engram" (no verificado con ejemplos).
- Recuperacion aumentada: el etiquetado sugiere integracion con flujos de retrieval, aunque no se especifica la interfaz.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints o servidores compatibles con la API de transformers.
- Capacidades multilingues limitadas al ingles declarado; no se documentan otros idiomas.
- No se documentan capacidades de vision, audio, tool calling explicito ni modo "thinking".

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (10,6 GB) o Q5_K_M (12,1 GB), el modelo cabe en GPUs de consumo de 12-16 GB de VRAM y permite inferencia en local sin depender de la nube.
- Prototipado de agentes con recuperacion: las etiquetas de retrieval-augmented y engram lo hacen candidato para pipelines RAG donde el modelo consulta un indice vectorial y genera respuestas fundamentadas, aunque requiere validacion empirica.
- Servicio conversacional de bajo coste: al activar ~3B parametros por token, el throughput por GPU es superior al de un denso de 16B, adecuado para chatbots con many usuarios concurrentes en una sola maquina.
- Evaluacion de tecnicas de calibracion: la etiqueta "calibration" permite usarlo como banco de pruebas para estudiar la confianza de las respuestas en modelos MoE cuantizados.
- Investigacion sobre arquitecturas MoE: sirve para comparar el comportamiento de un MoE deepseek_v3 de 16B frente a densos equivalentes en tareas de razonamiento y generacion.
- Fine-tuning ligero sobre GGUF: aunque el formato GGUF no es ideal para entrenamiento, las versiones Q8_0 y Q6_K permiten experimentar con LoRA sobre el modelo base en safetensors y luego cuantizar de nuevo.
- Educacion y demostraciones: el tamano manejable en Q4_K_S (9,8 GB) facilita talleres y demos en portatiles con GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead de contexto, orientativo):
  - Q2_K (6,7 GB): ~8 GB de VRAM.
  - Q3_K_M (8,4 GB): ~10 GB de VRAM.
  - Q4_K_S (9,8 GB) / Q4_K_M (10,6 GB): ~12 GB de VRAM.
  - Q5_K_M (12,1 GB): ~14 GB de VRAM.
  - Q6_K (14,4 GB): ~16-18 GB de VRAM.
  - Q8_0 (17,1 GB): ~20-22 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4; RTX 4090 24 GB para Q6/Q8; A100 40 GB o H100 para el modelo base en safetensors y para servir con vLLM.
- Cabe en GPU de consumo: si, en Q4_K_M y Q5_K_M en tarjetas de 12-16 GB; en Q2_K incluso en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para el modelo base en safetensors (no para GGUF); servidores compatibles con la API de transformers.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B parametros activos, se espera un throughput por token claramente superior al de un denso de 16B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Moon-Beam-16B-A3B | ~16B | ~3B | no disponible | MIT | safetensors, GGUF |
| DeepSeek-V3 (referencia arquitectonica) | 671B | 37B | 128K (segun documentacion publica de DeepSeek) | MIT (pesos) | safetensors |
| Moonlight-16B-A3B (referencia de la linea) | ~16B | ~3B | no disponible en esta ficha | MIT | safetensors |
| Modelo denso de 16B (generico) | ~16B | 16B | variable | variable | safetensors, GGUF |

La comparativa se limita a referencias arquitectonicas; no se dispone de datos de rendimiento de Moon-Beam-16B-A3B para contrastar con alternativas. La ventaja diferencial frente a un denso de 16B es el coste de inferencia (~3B activos), y frente a DeepSeek-V3 es el tamano, que permite ejecucion local.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- No hay benchmarks publicados, por lo que no se puede avalar su calidad en razonamiento, codigo o matematicas.
- Las etiquetas "engram", "retrieval-augmented" y "calibration" no estan documentadas en la model card; su efecto real es desconocido.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de evaluaciones de fidelidad.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El repo GGUF ocupa 114,9 GB en total, pero cada archivo individual es manejable; hay que descargar solo el quant deseado.
- Licencia MIT permite uso comercial, pero el modelo base podria tener condiciones adicionales no reflejadas; conviene verificar tablinum/Moon-Beam-16B-A3B.
- No se documentan sesgos especificos ni composicion del dataset, lo que impide evaluar riesgos de sesgo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente y sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Moon-Beam-16B-A3B-GGUF
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-16B-A3B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Moon-Beam-16B-A3B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
