# mradermacher/Qwen3.8-27B-Uncensored-v3-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v3-i1-GGUF es una cuantizacion en formato GGUF del modelo InterpreticAI/Qwen3.8-27B-Uncensored-v3, un ajuste fino de la familia Qwen3.8 orientado a eliminar el filtrado de contenido politicamente sensible (la model card lo etiqueta explicitamente con "uncensored" y "political-censorship"). El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de quants para llama.cpp, que ofrece tanto versiones estaticas como versiones con imatrix (i1), estas ultimas generadas con una matriz de importancia para preservar mejor la calidad en tasas de compresion agresivas.

El modelo base cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones), lo que lo situa en la gama de modelos densos de ~27B. Esta version i1-GGUF incluye un amplio abanico de cuantizaciones, desde IQ1_S (7,2 GB) hasta Q6_K (22,2 GB), lo que permite desplegarlo desde equipos con poca VRAM hasta configuraciones mas holgadas. El repositorio completo ocupa 300,3 GB debido a la acumulacion de todos los ficheros.

La relevancia de esta ficha radica en que documenta un caso de uso muy concreto: ejecutar localmente un modelo de ~27B con menos restricciones de contenido que el original, mediante llama.cpp y el ecosistema GGUF. La informacion publicada por el autor de la cuantizacion es escasa en cuanto a detalles de entrenamiento, contexto o benchmarks, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.8; no se detalla en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (ademas del fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix; el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el nombre y la familia (Qwen3.8) se infiere que se trata de un transformer denso de aproximadamente 27B parametros, pero la model card de la cuantizacion no incluye especificaciones de capas, atencion, cabezas ni tipo de positional encoding. Tampoco se documenta el proceso de ajuste fino que da lugar a la variante "Uncensored-v3" de InterpreticAI, ni si se emplearon tecnicas de RLHF, DPO u otras.

Lo que si esta documentado es el proceso de cuantizacion: mradermacher genera cuantizaciones ponderadas con imatrix (prefijo i1), usando un fichero de matriz de importancia (Qwen3.8-27B-Uncensored-v3.imatrix.gguf, 0,1 GB) que guia la asignacion de bits por tensor. La model card indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y ofrece una tabla comparativa de tamanos con notas de calidad (por ejemplo, IQ3_S "beats Q3_K*", Q4_K_M "fast, recommended"). Tambien se enlazan graficos de perplejidad de ikawrakow y las notas de Artefact2 sobre seleccion de cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Modelo afinado para reducir el filtrado de contenido politicamente sensible ("uncensored", "political-censorship").
- Compatible con endpoints (etiqueta "endpoints_compatible"), lo que sugiere uso via API en infraestructura de Hugging Face.
- Ejecutable en llama.cpp y derivados gracias al formato GGUF.
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no disponibles en la informacion proporcionada (no se documentan en la model card de la cuantizacion).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,6 GB) o IQ4_XS (15,2 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, como una RTX 4090, usando llama.cpp con offload parcial o total.
- Investigacion sobre sesgos y censura en modelos de lenguaje: al ser una variante "uncensored", sirve para estudiar como cambia el comportamiento del modelo en temas politicamente sensibles respecto al original, comparando respuestas entre el base y el ajuste fino.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas que los modelos alineados suelen rechazar, ejecutandose en local para preservar la privacidad del contenido.
- Prototipado de asistentes conversacionales en ingles: el modelo puede integrarse en un servidor llama.cpp o en Ollama para probar flujos multi-turno antes de pasar a un modelo mayor o a una API comercial.
- Evaluacion de cuantizaciones: el repositorio ofrece 23 variantes de cuantizacion mas el fichero imatrix, lo que lo convierte en un banco de pruebas util para medir el impacto de la compresion en perplejidad y calidad de respuesta sobre un modelo de ~27B.
- Fine-tuning posterior sobre quants de alta precision: las versiones Q5_K_M (19,3 GB) o Q6_K (22,2 GB) pueden servir como referencia de calidad para comparar con el modelo original en safetensors antes de emprender un ajuste adicional.
- Despliegue en entornos con VRAM limitada: la cuantizacion IQ2_M (10,1 GB) o IQ3_XS (12,1 GB) permite ejecutar el modelo en GPUs de 12-16 GB, asumiendo una perdida de calidad documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del fichero GGUF mas overhead de contexto y KV cache):
  - IQ1_S (7,2 GB) a IQ2_M (10,1 GB): GPUs de 8-12 GB.
  - IQ3_XS (12,1 GB) a Q3_K_L (14,4 GB): GPUs de 12-16 GB.
  - IQ4_XS (15,2 GB) a Q4_1 (17,2 GB): GPUs de 16-24 GB.
  - Q5_K_S (18,8 GB) a Q6_K (22,2 GB): GPUs de 24 GB o superiores.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para Q6_K con contexto largo; RTX 3090 (24 GB) como alternativa economica a la 4090.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4-Q5; en GPUs de 12 GB con IQ2/IQ3.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). No se documenta soporte nativo en vLLM o TGI para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3-i1-GGUF (este) | ~26,9B | no disponible | apache-2.0 | GGUF (i1) | Variante sin censura politica, solo ingles |
| Qwen3.8-27B-Uncensored-v3 (base) | ~26,9B | no disponible | apache-2.0 | safetensors | Modelo original de InterpreticAI, sin cuantizar |
| Qwen3.8-27B-Uncensored-v3-GGUF (quants estaticos) | ~26,9B | no disponible | apache-2.0 | GGUF (estaticos) | Alternativa del mismo autor sin imatrix |
| Otros modelos densos de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo ajustado para reducir el filtrado de contenido: puede generar respuestas en temas politicamente sensibles, lo que exige revision y politicas de uso claras en produccion.
- Riesgo de alucinacion: no se documenta ningun proceso de mitigacion ni evaluacion de factualidad en la informacion disponible.
- Idiomas: solo se declara soporte de ingles ("en"); el rendimiento en castellano no esta documentado.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos largos.
- Las cuantizaciones de baja tasa (IQ1_S, IQ1_M, IQ2_XXS) degradan la calidad de forma notable, segun las propias notas del autor ("for the desperate", "very low quality").
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base de InterpreticAI y de la familia Qwen original antes de desplegar en produccion.
- El repositorio ocupa 300,3 GB por la acumulacion de todas las cuantizaciones; la descarga selectiva de un solo fichero es imprescindible.
- Modelo con muy pocas interacciones (1 like) y sin benchmarks publicados: la calidad real no esta validada por la comunidad.
- El ajuste fino "Uncensored" puede haber degradado capacidades generales (razonamiento, codigo) respecto al modelo Qwen original; no hay datos que lo confirmen o desmientan.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v3-i1-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v3-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-v3-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor: https://www.nethype.de/
