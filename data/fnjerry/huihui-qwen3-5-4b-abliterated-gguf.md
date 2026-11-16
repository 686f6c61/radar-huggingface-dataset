# fnjerry/Huihui-Qwen3.5-4B-abliterated-GGUF

## Resumen

Huihui-Qwen3.5-4B-abliterated-GGUF es una distribucion de pesos en formato GGUF del modelo huihui-ai/Huihui-Qwen3.5-4B-abliterated, que a su vez es una version "abliterated" (con el rechazo eliminado mediante intervencion en las direcciones de activacion) del Qwen3.5-4B de Alibaba. El modelo base cuenta con 4.205.751.296 parametros y esta pensado para ejecucion local en hardware de consumo mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que combina tres elementos: un modelo de ~4B parametros (manejable en GPU consumer), una ventana de contexto propia de la familia Qwen3.5 y un proceso de abliteracion que elimina los mecanismos de rechazo del modelo original, lo que lo hace atractivo para investigacion sobre alineamiento, generacion creativa sin restricciones y entornos donde las politicas de contenido del modelo base resultan limitantes.

El repositorio incluye tanto los pesos cuantizados estaticos (Q2_K a f16) como un componente multimodal (mmproj) que sugiere soporte de vision en el modelo base, aunque la model card no detalla las capacidades completas. La licencia declarada es Apache 2.0, heredada del Qwen3.5-4B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-4B de Alibaba, un transformer denso de aproximadamente 4.200 millones de parametros. Sobre ese modelo, el autor huihui-ai aplico una tecnica de abliteracion que consiste en identificar y proyectar fuera las direcciones de activacion asociadas al rechazo, de modo que el modelo deja de activar respuestas de negativa ante ciertas peticiones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La contribucion de este repositorio concreto (fnjerry) es la conversion y cuantizacion a GGUF de los pesos abliterated, realizada con la herramienta de cuantizacion de mradermacher. Se incluyen cuantizaciones estaticas (no imatrix) y un fichero mmproj que actua como suplemento multimodal, lo que indica que el modelo base incorpora un proyector de vision compatible con llama.cpp. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Qwen3.5-4B.
- Razonamiento y respuesta a instrucciones en ingles (unico idioma declarado).
- Capacidad multimodal potencial: la presencia de ficheros mmproj sugiere soporte de entrada de imagenes, aunque no se detalla en la model card.
- Comportamiento "uncensored": la abliteracion elimina los rechazos del modelo original, permitiendo respuestas a peticiones que el modelo base declinaria.
- Ejecucion local eficiente gracias al formato GGUF y a las cuantizaciones de 2 a 8 bits.
- Integracion con llama.cpp, Ollama y otros runners compatibles con GGUF.
- No se documenta soporte explicito de tool calling, function calling ni modos de agente multi-paso en la informacion disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar las respuestas del modelo abliterated con las del Qwen3.5-4B original para estudiar como la proyeccion de direcciones de rechazo afecta al comportamiento en dominios sensibles.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas que el modelo base rechazaria, ejecutandose en local para preservar la privacidad.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (2,8 GB) el modelo cabe en GPU con 6-8 GB de VRAM, lo que permite prototipado rapido en portatiles con RTX 3060 o superiores.
- Procesamiento por lotes en CPU: las cuantizaciones Q2_K (1,9 GB) y Q3_K_S (2,2 GB) permiten inferencia en CPU con llama.cpp para tareas de clasificacion o resumen de bajo coste.
- Experimentacion multimodal local: usando los ficheros mmproj junto con los pesos principales se puede probar la entrada de imagenes en llama.cpp, util para investigar el comportamiento del proyector visual tras la abliteracion.
- Base para fine-tuning: al estar disponible en safetensors en el modelo base y en GGUF aqui, sirve como punto de partida para LoRA o QLoRA sobre dominios especializados donde se quiera evitar el sesgo de rechazo del modelo original.
- Evaluacion de robustez: medir la tasa de respuestas daninas o alucinaciones tras eliminar el rechazo, como parte de un pipeline de red teaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~2,5-3 GB
  - Q3_K_M: ~3-3,5 GB
  - Q4_K_M: ~3,5-4 GB
  - Q5_K_M: ~4-4,5 GB
  - Q6_K: ~4,5-5 GB
  - Q8_0: ~5,5-6 GB
  - f16: ~9-10 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las cuantizaciones altas; A100 o H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU consumer: si, en cualquier GPU con 6 GB o mas para Q4_K_M y en 8 GB para Q8_0. Las cuantizaciones Q2/Q3 funcionan incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI, pero no se garantiza que esos frameworks acepten directamente los pesos abliterated sin validacion.
- Latencia y throughput: no disponibles. Como referencia orientativa para un 4B en Q4_K_M, se espera decenas de tokens por segundo en GPU consumer y unos pocos en CPU, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fnjerry/Huihui-Qwen3.5-4B-abliterated-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF | Abliterated, multimodal (mmproj) |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | 4,2B | no disponible | Apache 2.0 | safetensors | Modelo base de este repo, sin cuantizar |
| Qwen/Qwen3.5-4B | 4,2B | no disponible | Apache 2.0 | safetensors | Modelo original con alineamiento intacto |
| mradermacher/Huihui-Qwen3.5-4B-abliterated-i1-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones con imatrix, mayor calidad a igual tamano |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento que permitan contrastarlo con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La abliteracion elimina los rechazos del modelo, lo que aumenta el riesgo de generar contenido danino, ilegal o sexualmente explicito. No es apto para produccion orientada a usuarios finales sin moderacion externa.
- Riesgo elevado de alucinacion: los modelos pequenos (~4B) tienen menor fiabilidad factual que modelos mayores, y la abliteracion puede degradar la coherencia en dominios sensibles.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- La longitud de contexto no esta documentada en la model card; conviene validarla empiricamente antes de disenar aplicaciones que dependan de ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento normativo del contenido generado; la responsabilidad recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validacion por parte de la comunidad.
- El tamano del repo (39,7 GB) incluye todas las cuantizaciones; descargar solo el fichero necesario para evitar consumo de disco.
- La model card no documenta el proceso de abliteracion concreto (capas afectadas, metodologia), lo que dificulta reproducir o auditar el resultado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fnjerry/Huihui-Qwen3.5-4B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Cuantizaciones imatrix (mradermacher): https://huggingface.co/mradermacher/Huihui-Qwen3.5-4B-abliterated-i1-GGUF
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Huihui-Qwen3.5-4B-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
