# mradermacher/EsotericSage-12B-GGUF

## Resumen

EsotericSage-12B-GGUF es la distribucion en formato GGUF del modelo EsotericSage-12B, un modelo de lenguaje de 12.247.782.400 parametros (~12,25 mil millones) desarrollado originalmente por el usuario yamatazen y cuantizado por mradermacher. El modelo base se ha construido mediante mergekit, una herramienta de fusion de modelos, aplicando la tecnica nearswap, lo que indica que se trata de un merge de pesos de otros modelos preentrenados en lugar de un entrenamiento desde cero. Esta orientado a conversacion (tag `conversational`) y declara soporte para ingles y japones.

La relevancia de esta publicacion es practica: mradermacher ofrece una bateria completa de cuantizaciones estaticas GGUF (desde Q2_K hasta Q8_0) que permiten ejecutar un modelo de 12B en hardware de consumo, desde tarjetas con 6-8 GB de VRAM en cuantizaciones bajas hasta configuraciones de 16 GB o mas para Q8_0. El repositorio ocupa 84,7 GB e incluye todas las variantes, aunque el usuario solo necesita descargar el archivo de la cuantizacion elegida.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni los detalles del proceso de fusion mas alla de la etiqueta `nearswap`. La model card del cuantizador es puramente operativa (lista de archivos y notas de uso) y no aporta especificaciones tecnicas del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit; detalles no disponibles) |
| Parametros totales | 12.247.782.400 (~12,25 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 84,7 GB (todas las cuantizaciones) |
| Modelo base | yamatazen/EsotericSage-12B |
| Libreria | transformers |
| Etiquetas | mergekit, merge, nearswap, conversational |

## Arquitectura y entrenamiento

El modelo subyacente, yamatazen/EsotericSage-12B, es el resultado de una fusion de modelos mediante mergekit con la tecnica nearswap. Esta tecnica interpola pesos entre dos o mas modelos base seleccionando tensores cercanos en el espacio de parametros, lo que produce un modelo hibrido que combina capacidades de sus progenitores sin un entrenamiento adicional significativo. No se dispone de informacion sobre que modelos concretos se fusionaron, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La publicacion de mradermacher no modifica la arquitectura: se limita a convertir los pesos a formato GGUF y generar cuantizaciones estaticas mediante herramientas del ecosistema llama.cpp. El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (EsotericSage-12B-i1-GGUF), lo que sugiere que las versiones i1 ofrecen mejor calidad por bit que las estaticas incluidas aqui. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles y japones, segun los idiomas declarados en la model card.
- Razonamiento y respuesta multi-turno, dado el tag `conversational` del modelo.
- Ejecucion local en CPU y GPU gracias al formato GGUF y a la integracion con llama.cpp, Ollama y otros runners compatibles.
- Soporte de cuantizaciones de 2 a 8 bits, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas a en y ja; no se declara soporte de castellano.

## Casos de uso

- Asistente conversacional local en ingles o japones: el modelo puede desplegarse con Ollama o llama.cpp en un equipo de sobremesa y mantener dialogos multi-turno sin depender de APIs externas, usando la cuantizacion Q4_K_M (7,6 GB) como punto de partida equilibrado.
- Prototipado de chatbots para mercados japoneses: al declarar soporte de japones, es adecuado para experimentar con interfaces de atencion al cliente en ese idioma antes de invertir en modelos mayores o en ajuste fino.
- Inferencia en hardware de consumo: con Q2_K (4,9 GB) o Q3_K_S (5,6 GB) cabe en GPUs de 6-8 GB de VRAM, lo que permite probar el modelo en portatiles con RTX 3060 o similares.
- Generacion de texto creativo y exploracion estilistica: al ser un merge nearswap, puede producir respuestas con una mezcla de estilos heredada de sus modelos progenitores, util para experimentar con tonos narrativos.
- Evaluacion comparativa de tecnicas de merge: investigadores que estudian mergekit y nearswap pueden usar este modelo como caso de estudio para medir como la fusion afecta a la coherencia y al sesgo idiomatico.
- Despliegue en entornos con recursos limitados y sin conectividad: al ser GGUF, puede ejecutarse en CPU con llama.cpp en servidores sin GPU, aunque con latencia mayor; util para demos offline o entornos air-gapped.
- Base para cuantizaciones propias: el repositorio incluye todos los niveles de cuantizacion, lo que facilita seleccionar el tamano adecuado para un pipeline concreto sin recompilar desde safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de archivo, mas overhead de contexto y KV cache):
  - Q2_K: ~4,9 GB de pesos; ~6 GB de VRAM total con contexto moderado.
  - Q3_K_S: ~5,6 GB; ~7 GB totales.
  - Q3_K_M: ~6,2 GB; ~7,5 GB totales.
  - Q3_K_L: ~6,7 GB; ~8 GB totales.
  - IQ4_XS: ~6,9 GB; ~8,5 GB totales.
  - Q4_K_S: ~7,2 GB; ~9 GB totales.
  - Q4_K_M: ~7,6 GB; ~9,5 GB totales.
  - Q5_K_S: ~8,6 GB; ~10,5 GB totales.
  - Q5_K_M: ~8,8 GB; ~11 GB totales.
  - Q6_K: ~10,2 GB; ~12,5 GB totales.
  - Q8_0: ~13,1 GB; ~15,5 GB totales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o RTX 4090 24 GB para cuantizaciones altas; A100/H100 solo si se busca throughput elevado con lotes grandes.
- Cabe en GPU de consumo: si, desde Q2_K en tarjetas de 6-8 GB hasta Q8_0 en tarjetas de 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este caso, por lo que requeririan los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EsotericSage-12B-GGUF | ~12,25 B | no disponible | no disponible | GGUF | Merge nearswap, en/ja, cuantizaciones Q2-Q8 |
| Mistral-Nemo-12B | ~12 B | 128k (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Modelo entrenado desde cero, multilingue amplio |
| Gemma-2-9B | ~9 B | 8k | Gemma Terms | safetensors, GGUF | Modelo de Google, licencia con restricciones de uso |
| Qwen2.5-14B | ~14,7 B | 128k | Apache 2.0 | safetensors, GGUF | Multilingue, buen rendimiento en codigo y matematicas |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados de EsotericSage-12B en la informacion disponible. Los datos de los modelos alternativos provienen de sus model cards publicas y pueden variar; conviene verificarlos antes de tomar decisiones de produccion.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor del modelo base (yamatazen) antes de desplegarlo en produccion.
- Modelo derivado de un merge nearswap: la calidad puede ser irregular y no hay evaluaciones publicadas que la respalden.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento ni los modelos progenitores, no se pueden evaluar sesgos de genero, raza o idioma.
- Riesgo de alucinacion: inherente a los modelos de 12B sin datos de alineacion documentados; no se dispone de informacion sobre RLHF o DPO.
- Soporte limitado de idiomas: solo ingles y japones; el castellano no esta declarado y probablemente rinda por debajo de modelos multilingues especificos.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Repositorio de 84,7 GB: descargar el repositorio completo es costoso; conviene bajar solo el archivo GGUF de la cuantizacion deseada.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines que requieran function calling sin verificacion previa.
- Las cuantizaciones Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EsotericSage-12B-GGUF
- Modelo base: https://huggingface.co/yamatazen/EsotericSage-12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/EsotericSage-12B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#EsotericSage-12B-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit: https://github.com/arcee-ai/mergekit
