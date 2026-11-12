# mradermacher/Experimental-Base-V2.1-R1-LLaMa-70B-GGUF

## Resumen

Experimental-Base-V2.1-R1-LLaMa-70B-GGUF es la version cuantizada en formato GGUF del modelo TareksGraveyard/Experimental-Base-V2.1-R1-LLaMa-70B, un merge de modelos de 70.553.706.560 parametros construido con mergekit sobre la base de LLaMA 3.3. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de quants GGUF para la comunidad de inferencia local, y ofrece una bateria de cuantizaciones estaticas desde Q2_K hasta Q8_0.

El modelo resuelve el problema de ejecutar un modelo denso de ~70B en hardware de consumo o en servidores sin GPUs de gama alta: las versiones Q4_K_M (42,6 GB) y Q5_K_M (50,0 GB) permiten inferencia local con llama.cpp, mientras que las variantes Q8_0 (75,1 GB) y Q6_K (58,0 GB, divididas en dos partes) apuntan a calidad casi completa en entornos con mas VRAM. Al tratarse de un merge experimental de la familia LLaMA 3.3, hereda la licencia llama3.3 y el soporte de un unico idioma, el ingles.

Es relevante ahora porque la comunidad de inferencia local demanda versiones GGUF de merges recientes de gran tamano, y este repo cubre esa necesidad con cuantizaciones listas para descargar, aunque no incluye quants ponderados ni imatrix (el autor indica que no estan disponibles por su parte en el momento de la publicacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (merge de modelos basados en LLaMA 3.3; detalles de la arquitectura del merge no disponibles) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (2 partes), Q8_0 (2 partes) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (quants estaticos); el modelo base original en safetensors |
| Tamano del repo | 481,3 GB |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo base es un merge creado con mergekit (etiquetas `mergekit` y `merge` en el repo) a partir de componentes de la familia LLaMA 3.3, con 70.553.706.560 parametros en un transformer denso. No se dispone de informacion sobre la receta exacta del merge, los modelos de origen individuales, el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO; la model card del repo cuantizado no los detalla.

El trabajo de mradermacher consiste en la conversion a GGUF (`convert_type: hf`) y la generacion de quants estaticos (`quantize_version: 2`, `output_tensor_quantised: 1`). No se han generado quants ponderados ni imatrix, lo que implica que la calidad de las cuantizaciones de baja precision (Q2_K, Q3_K) puede ser inferior a la de quants imatrix equivalentes. Las cuantizaciones Q6_K y Q8_0 se distribuyen en dos partes para facilitar la descarga.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta `conversational`).
- Razonamiento y generacion de codigo heredados del modelo base LLaMA 3.3, aunque no se documentan capacidades especificas del merge.
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con una o dos GPUs de 24 GB: usando Q4_K_S (40,4 GB) o Q4_K_M (42,6 GB) con offloading parcial a CPU en llama.cpp, se puede ejecutar un modelo de ~70B en hardware de consumo.
- Despliegue en servidores con 80 GB de VRAM: la variante Q8_0 (75,1 GB) o Q6_K (58,0 GB) permite servir el modelo con calidad casi completa en una A100 80GB o H100.
- Experimentacion con merges de la familia LLaMA 3.3: util para investigadores que quieran evaluar el comportamiento del merge Experimental-Base-V2.1-R1 sin descargar los pesos completos en safetensors (481,3 GB de repo).
- Generacion de texto en ingles para prototipos conversacionales: el modelo esta etiquetado como conversacional y admite integracion via endpoints compatibles.
- Benchmarking de cuantizaciones: la disponibilidad de 11 variantes permite medir el impacto de la cuantizacion en perplejidad y calidad para este merge concreto.
- Pipelines de evaluacion offline: al ser un modelo denso de 70B con licencia llama3.3, se puede usar en entornos de investigacion que requieran modelos grandes sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del fichero y overhead de contexto/KV cache):
  - Q2_K: ~26,5 GB de pesos.
  - Q3_K_M: ~34,4 GB.
  - Q4_K_M: ~42,6 GB.
  - Q5_K_M: ~50,0 GB.
  - Q6_K: ~58,0 GB.
  - Q8_0: ~75,1 GB.
- GPU recomendadas: A100 80GB o H100 para Q8_0 y Q6_K; A100 40GB o 2x RTX 4090 (24 GB cada una) para Q4_K_M con reparto; RTX 3090/4090 individuales solo con offloading parcial a CPU para cuantizaciones Q4 o inferiores.
- Cabe en consumer GPU: si, con offloading parcial; Q4_K_S/Q4_K_M en 2x RTX 4090 o 1x RTX 4090 + RAM del sistema.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Experimental-Base-V2.1-R1-LLaMa-70B-GGUF (este) | 70,55B | no disponible | llama3.3 | GGUF | Merge experimental, solo ingles |
| TareksGraveyard/Experimental-Base-V2.1-R1-LLaMa-70B | 70,55B | no disponible | llama3.3 | safetensors | Modelo base del que deriva este quant |
| LLaMA 3.3 70B (Meta) | 70B | 128K (segun documentacion publica de Meta) | llama3.3 | safetensors, GGUF | Modelo original de referencia de la familia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el nombre "Experimental" y el origen como merge implican un comportamiento no validado exhaustivamente; no hay benchmarks publicados.
- Solo ingles: los metadatos declaran unicamente `en`, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones especificas.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base LLaMA 3.3 y los de los componentes del merge.
- Licencia llama3.3: impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos completos de la licencia LLaMA 3.3 antes de un despliegue en produccion.
- Cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad y Q6_K/Q8_0 para maxima calidad.
- No hay quants imatrix ni ponderados disponibles por parte de este autor, lo que limita la calidad de las cuantizaciones pequenas frente a alternativas imatrix.
- Contexto no documentado: no se puede confirmar la ventana de contexto efectiva del merge.
- Repo de gran tamano (481,3 GB): requiere planificacion de almacenamiento y ancho de banda para la descarga.

## Enlaces

- Repo Hugging Face: https://huggingface.co/mradermacher/Experimental-Base-V2.1-R1-LLaMa-70B-GGUF
- Modelo base: https://huggingface.co/TareksGraveyard/Experimental-Base-V2.1-R1-LLaMa-70B
- Pagina de descargas del autor: https://hf.tst.eu/model#Experimental-Base-V2.1-R1-LLaMa-70B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
