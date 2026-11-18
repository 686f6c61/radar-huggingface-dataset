# mradermacher/Umbral-Devil-Hermes-Mind-V0.1-GGUF

## Resumen

Umbral-Devil-Hermes-Mind-V0.1-GGUF es la version cuantizada en formato GGUF del modelo TheHierophant/Umbral-Devil-Hermes-Mind-V0.1, un merge de modelos generado con mergekit. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, que ofrece tanto cuantizaciones estaticas (este repositorio) como cuantizaciones con imatrix en un repositorio separado. El modelo original es un merge orientado a tareas de generacion de texto en ingles.

El modelo cuenta con 8.030.261.248 parametros totales (aproximadamente 8 mil millones), lo que lo situa en la categoria de modelos de tamano medio que pueden ejecutarse en hardware de consumo con cuantizaciones agresivas. La arquitectura subyacente es un transformer denso (no se especifica en la informacion disponible si es MoE), y el repositorio incluye cuantizaciones que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB), lo que permite desplegarlo en un rango amplio de configuraciones de VRAM.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar rapidamente la disponibilidad, el coste de hardware y las opciones de despliegue de un merge comunitario en formato GGUF, sin necesidad de descargar y convertir los pesos originales. La informacion disponible sobre el modelo original es limitada: no se detallan los datos de entrenamiento, la composicion del merge ni los benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica la variante exacta en la informacion disponible) |
| Parametros totales | 8.030.261.248 (aproximadamente 8,03 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en formato transformers/safetensors |

## Arquitectura y entrenamiento

El modelo original TheHierophant/Umbral-Devil-Hermes-Mind-V0.1 es un merge de modelos creado con mergekit, segun las etiquetas del repositorio. No se dispone de informacion sobre la arquitectura exacta del transformer subyacente, el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni la longitud de contexto nativa. Tampoco se detallan los datos de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado.

La innovacion tecnica destacable en este repositorio es el propio proceso de cuantizacion: mradermacher proporciona cuantizaciones estaticas en este repositorio y cuantizaciones ponderadas con imatrix en un repositorio separado (Umbral-Devil-Hermes-Mind-V0.1-i1-GGUF). Las cuantizaciones IQ (como IQ4_XS) suelen ofrecer mejor calidad que las cuantizaciones K de tamano similar, segun las notas del autor. No se documentan innovaciones arquitectonicas como atencion lineal, decodificacion especulativa o modos de pensamiento.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente con el idioma "en", por lo que su uso principal es la generacion de texto en ingles.
- Razonamiento y conversacion: al ser un merge de modelos de la familia Hermes/Devil, se espera capacidad de dialogo multi-turno, aunque no se documentan capacidades especificas en la informacion disponible.
- Codigo y matematicas: no se documenta soporte explicito en la informacion disponible.
- Tool calling / function calling: no se documenta en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no se documenta en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no se documentan en la informacion disponible.

## Casos de uso

- Generacion de texto creativo en ingles: el modelo puede utilizarse para redaccion de ficcion, guiones o poesia en ingles, aprovechando su naturaleza de merge orientado a estilos narrativos (la denominacion "Devil-Hermes" sugiere un enfasis en creatividad y rol).
- Prototipado rapido en local: gracias a las cuantizaciones Q4_K_S y Q4_K_M (4,8-5,0 GB), el modelo puede ejecutarse en GPUs de consumo para experimentar con generacion de texto sin infraestructura cloud.
- Chatbot de dominio general en ingles: adecuado para asistentes conversacionales en ingles donde no se requiera tool calling ni contexto extremadamente largo, desplegado via llama.cpp u Ollama.
- Experimentacion con merges de modelos: investigadores interesados en evaluar el efecto de merges comunitarios pueden comparar este modelo con sus componentes originales usando las cuantizaciones ligeras (Q2_K, Q3_K_S) para iterar rapidamente.
- Generacion de texto en entornos con VRAM limitada: la cuantizacion Q2_K (3,3 GB) permite ejecutar el modelo en GPUs con 4-6 GB de VRAM, util para pruebas en portatiles con GPU discreta.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es ideal para entrenamiento, las cuantizaciones de mayor precision (Q8_0, f16) pueden servir como referencia para evaluar la degradacion por cuantizacion antes de un despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de cuantizacion y overhead de contexto):
  - Q2_K: ~3,3 GB de pesos, ~4-5 GB de VRAM total con contexto moderado.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~3,8-4,4 GB de pesos, ~5-6 GB de VRAM total.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~4,6-5,0 GB de pesos, ~6-7 GB de VRAM total.
  - Q5_K_S / Q5_K_M: ~5,7-5,8 GB de pesos, ~7-8 GB de VRAM total.
  - Q6_K: ~6,7 GB de pesos, ~8-9 GB de VRAM total.
  - Q8_0: ~8,6 GB de pesos, ~10-11 GB de VRAM total.
  - f16: ~16,2 GB de pesos, ~18-20 GB de VRAM total.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8.
  - Profesional: A100, H100 para f16 o para servir multiples instancias.
- Cabe en consumer GPU: si, en la mayoria de cuantizaciones. Q4_K_M cabe en GPUs de 8 GB; Q8_0 requiere 12 GB o mas; f16 requiere 24 GB (RTX 3090/4090) o GPUs profesionales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores seria necesario usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Umbral-Devil-Hermes-Mind-V0.1-GGUF | ~8,03 B | no disponible | GGUF | no disponible | Hugging Face (mradermacher) |
| Modelo base TheHierophant/Umbral-Devil-Hermes-Mind-V0.1 | ~8,03 B | no disponible | safetensors/transformers | no disponible | Hugging Face |
| Cuantizaciones imatrix del mismo modelo (mradermacher i1-GGUF) | ~8,03 B | no disponible | GGUF (imatrix) | no disponible | Hugging Face |
| Alternativas de ~8 B en GGUF (p. ej., Llama 3 8B, Mistral 7B) | 7-8 B | 8k-128k segun modelo | GGUF | varian (Llama, Apache 2.0) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre este merge y modelos de referencia de tamano similar. La comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un merge de modelos comunitarios, hereda los sesgos de sus componentes, que no se detallan.
- Riesgo de alucinacion: no cuantificado; los merges de modelos pueden presentar comportamientos inconsistentes segun la combinacion de pesos.
- Limitaciones de contexto o idioma: el modelo esta etiquetado solo para ingles y no se especifica la longitud de contexto, lo que impide garantizar conversaciones de contexto largo.
- Restricciones de licencia para uso comercial: la licencia no esta disponible en la informacion proporcionada; es imprescindible verificar la licencia del modelo base antes de cualquier uso comercial.
- Caveats para produccion: la falta de benchmarks, de documentacion sobre entrenamiento y de licencia clara hace desaconsejable su uso en produccion sin una evaluacion previa. Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- El repositorio tiene pocas descargas (71) y likes (1), lo que sugiere poca validacion por parte de la comunidad.
- El formato GGUF no es adecuado para fine-tuning directo; para entrenamiento habria que usar el modelo base en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Umbral-Devil-Hermes-Mind-V0.1-GGUF
- Modelo base: https://huggingface.co/TheHierophant/Umbral-Devil-Hermes-Mind-V0.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Umbral-Devil-Hermes-Mind-V0.1-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Umbral-Devil-Hermes-Mind-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
