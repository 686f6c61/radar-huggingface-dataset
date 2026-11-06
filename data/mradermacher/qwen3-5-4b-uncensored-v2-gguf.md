# mradermacher/Qwen3.5-4B-Uncensored-v2-GGUF

## Resumen

Qwen3.5-4B-Uncensored-v2-GGUF es una cuantizacion estatica en formato GGUF del modelo InterpreticAI/Qwen3.5-4B-Uncensored-v2, un ajuste fino de la familia Qwen3.5 orientado a eliminar el sesgo de censura politica del modelo original. El trabajo de cuantizacion lo firma mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos populares para su uso en llama.cpp y entornos de inferencia local. El modelo cuenta con 4.326.350.848 parametros totales (aproximadamente 4,3 mil millones) segun los pesos en safetensors del modelo base.

La relevancia de esta publicacion radica en dos factores. Por un lado, ofrece una via sencilla de ejecutar un modelo de ~4B en hardware de consumo mediante cuantizaciones que van desde 2,1 GB (Q2_K) hasta 8,8 GB (f16). Por otro, el ajuste "uncensored" esta disenado especificamente para reducir los rechazos del modelo en temas politicamente sensibles, lo que lo hace atractivo para investigacion sobre alineamiento, analisis de sesgos y aplicaciones donde el modelo base tiende a declinar responder.

No se dispone de informacion publica sobre la arquitectura interna, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks en la informacion proporcionada. La model card del cuantizador se limita a describir el proceso de conversion y los ficheros generados, sin detallar las capacidades del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5, detalles no publicados en la informacion disponible) |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base InterpreticAI/Qwen3.5-4B-Uncensored-v2 en la documentacion proporcionada. Por el nombre y la familia, se trata de un transformer derivado de Qwen3.5 de aproximadamente 4,3 mil millones de parametros, pero no se confirman detalles como el numero de capas, la dimension oculta, el mecanismo de atencion ni la ventana de contexto.

Respecto al entrenamiento, la unica informacion disponible es que el modelo base ha sido ajustado para eliminar censura politica (tag `political-censorship` y `uncensored`). No se especifican el volumen de tokens de ajuste, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o fine-tuning supervisado. La publicacion que nos ocupa es exclusivamente un trabajo de cuantizacion: mradermacher convierte los pesos del modelo base a GGUF con cuantizaciones estaticas (sin imatrix/weighted quants, segun indica el propio autor). Se incluyen ficheros `mmproj` que sugieren que el modelo base incorpora capacidades multimodales (vision), aunque no se detalla su alcance.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Ajuste orientado a reducir rechazos en temas politicamente sensibles (uncensored / political-censorship).
- Soporte multimodal potencial: la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16` indica que el modelo base podria procesar imagenes, aunque no se documenta el alcance ni la calidad de esta capacidad.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere uso en servicios de inferencia desplegados.
- No se documentan capacidades especificas de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni soporte multilingue mas alla del ingles.

## Casos de uso

- Investigacion sobre alineamiento y censura: el modelo permite estudiar como varia el comportamiento de un LLM de ~4B cuando se elimina el sesgo de rechazo en temas politicos, comparando respuestas con el modelo original.
- Analisis de sesgos en modelos pequenos: util para auditar que topicos generan rechazo en la familia Qwen3.5 y como se manifiestan tras el ajuste uncensored.
- Inferencia local en hardware de consumo: con cuantizaciones de 2,1 a 4,7 GB, se puede ejecutar en GPUs de gama media o incluso en CPU con llama.cpp, lo que facilita experimentacion sin infraestructura dedicada.
- Prototipado de chatbots conversacionales en ingles: el modelo esta etiquetado como conversacional y puede servir para demos y pruebas de concepto donde no se requiera un modelo de gran escala.
- Evaluacion de tecnicas de cuantizacion: al ofrecer 12 variantes de cuantizacion, permite medir el impacto de la compresion en la calidad de las respuestas de un modelo de 4B.
- Despliegue en entornos con restricciones de recursos: el formato GGUF y los ficheros `mmproj` permiten montar un servicio multimodal ligero en servidores modestos o en el borde (edge), siempre que se acepte la limitacion al idioma ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,1 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~2,2-2,6 GB
  - IQ4_XS / Q4_K_S: ~2,7 GB
  - Q4_K_M: ~2,9 GB
  - Q5_K_S / Q5_K_M: ~3,2-3,3 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,7 GB
  - f16: ~8,8 GB
  - Suplemento multimodal: +0,5 GB (mmproj-Q8_0) o +0,8 GB (mmproj-f16)
- GPU recomendadas: no hay datos oficiales. Por tamano, cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) puede ejecutar cuantizaciones Q4-Q5; una RTX 4090 o A100/H100 permitiria f16 con holgura, aunque el modelo es demasiado pequeno para aprovechar su capacidad.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 6 GB o mas para cuantizaciones Q4-Q5; en CPU con llama.cpp para las cuantizaciones mas bajas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servicios de inferencia tipo TGI o vLLM (no confirmado para GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Uncensored-v2-GGUF (este) | ~4,3B | no disponible | apache-2.0 | GGUF | Ajuste uncensored, solo ingles, cuantizaciones estaticas |
| InterpreticAI/Qwen3.5-4B-Uncensored-v2 | ~4,3B | no disponible | apache-2.0 | safetensors | Modelo base del que deriva esta cuantizacion |
| Familia Qwen3.5 (modelo original) | ~4B (segun variante) | no disponible | no disponible | safetensors | Modelo de referencia con alineamiento estandar |
| Otros GGUF de ~4B (p. ej. Llama 3.2 3B, Phi-3.5-mini) | 3-4B | variable | variable | GGUF | Alternativas de tamano similar; sin datos comparativos de rendimiento disponibles |

## Limitaciones y advertencias

- El ajuste "uncensored" elimina filtros de rechazo, lo que puede producir contenido ofensivo, sesgado o factualmente incorrecto en temas politicos y sensibles. No es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: al tratarse de un modelo de ~4B y de un ajuste que prioriza la ausencia de rechazos, la verificacion factual es limitada.
- Solo soporta ingles segun la model card; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- No se dispone de informacion sobre la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- La licencia apache-2.0 permite uso comercial, pero el caracter uncensored del ajuste puede entrar en conflicto con politicas de plataformas y con requisitos regulatorios (por ejemplo, en materia de contenido politico o de proteccion de menores). Se recomienda revision legal antes de produccion.
- Las cuantizaciones son estaticas (sin imatrix), por lo que la calidad relativa de las variantes de baja precision (Q2_K, Q3_K_S) puede ser inferior a la de cuantizaciones ponderadas equivalentes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No hay benchmarks publicados ni evaluaciones independientes que respalden la calidad del ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-Uncensored-v2-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-4B-Uncensored-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
