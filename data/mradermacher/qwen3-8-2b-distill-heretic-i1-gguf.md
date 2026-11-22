# mradermacher/Qwen3.8-2B-Distill-heretic-i1-GGUF

## Resumen

Qwen3.8-2B-Distill-heretic-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo htb-ac-1424625/Qwen3.8-2B-Distill-heretic, una destilacion de la familia Qwen orientada a razonamiento, function calling y despliegue en el borde (edge). El modelo base conserva la etiqueta "heretic", que en la practica indica que ha sido sometido a tecnicas de abliteration o decensoring para reducir los rechazos del modelo ante peticiones que el modelo original filtraria. El resultado es un modelo pequeno, de aproximadamente 1.880 millones de parametros, pensado para ejecutarse en hardware modesto.

El repositorio no aporta pesos en formato transformers, sino unicamente ficheros GGUF cuantizados con el metodo i1 (imatrix) de mradermacher, desde IQ1_S (0,8 GB) hasta Q6_K (1,7 GB). Esto lo hace directamente utilizable en llama.cpp, Ollama y otros runners compatibles con GGUF, pero no en pipelines que requieran safetensors. La licencia declarada es Apache 2.0 y el unico idioma reconocido en la model card es el ingles.

Su relevancia actual radica en la combinacion de tres factores: tamano reducido (apto para GPUs de consumo e incluso CPU), soporte declarado de razonamiento y function calling, y ausencia de filtros de rechazo. Para desarrolladores que necesitan un modelo local para agentes ligeros o prototipado rapido sin restricciones de contenido, es una opcion practica, aunque con las cautelas propias de un modelo destilado, pequeno y modificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Qwen; transformer, detalles no publicados) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (unicamente; no se incluyen safetensors en este repo) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags indican que se trata de una destilacion (distillation) sobre la familia Qwen (etiquetas qwen3.5 y qwen3.8), afinada con SFT y orientada a razonamiento y function calling. El sufijo "heretic" y los tags "uncensored", "decensored" y "abliterated" indican que el modelo ha pasado por un proceso de abliteration, una tecnica que identifica y neutraliza las direcciones del espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder sobre determinados temas.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El autor del modelo base declara el proceso como "reproducible" mediante el tag correspondiente, pero los detalles no estan en la model card consultada. Las cuantizaciones de este repositorio se han generado con el metodo i1 de mradermacher, que emplea un fichero imatrix (incluido en el repo, 0,1 GB) para ponderar la cuantizacion segun la importancia de los tensores, lo que suele mejorar la calidad frente a cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento (tag "reasoning"), presumiblemente con soporte de cadenas de pensamiento, aunque el formato exacto no se documenta.
- Function calling / tool calling (tag "function-calling").
- Destilacion de un modelo mayor de la familia Qwen, lo que busca transferir capacidades de razonamiento a un modelo pequeno.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo original filtraria.
- Despliegue en el borde (tag "edge") por su tamano reducido.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades multimodales: no disponibles.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Agentes locales de function calling: el modelo declara soporte de tool calling y un tamano de 1,88 mil millones de parametros, lo que permite ejecutarlo en una GPU de consumo y usarlo como planificador de llamadas a herramientas en un agente ligero.
- Prototipado rapido de asistentes conversacionales: con cuantizaciones desde 0,8 GB, se puede desplegar en un portatil con llama.cpp u Ollama para iterar sobre prompts y flujos conversacionales sin coste de API.
- Despliegue en dispositivos de borde: su huella de memoria (1,3-1,7 GB en cuantizaciones Q4-Q6) lo hace viable en mini-PC, Raspberry Pi con RAM suficiente o moviles de gama alta mediante runners GGUF.
- Generacion de texto sin filtros para investigacion: el caracter abliterated permite estudiar el comportamiento del modelo en dominios donde el modelo original rechazaria responder, util para analisis de sesgos y robustez.
- Clasificacion y extraccion de informacion en pipelines por lotes: al ser pequeno y rapido en CPU/GPU modesta, puede procesar grandes volumenes de texto en ingles para tareas de etiquetado o resumen extractivo.
- Base para fine-tuning adicional: aunque este repo solo ofrece GGUF, el modelo base en transformers puede servir como punto de partida para ajustes especificos de dominio en ingles con requisitos de hardware minimos.
- Educacion e investigacion sobre destilacion: al ser un modelo destilado y pequeno, es util para experimentos academicos sobre transferencia de capacidades y sobre el efecto de la abliteration en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en i1-IQ1_S, 1,0-1,2 GB en cuantizaciones IQ2-IQ3, 1,3-1,4 GB en Q4 (recomendado Q4_K_M), 1,5 GB en Q5 y 1,7 GB en Q6_K. Hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente en Q4; RTX 3050, RTX 4060, GTX 1660 o superiores funcionan sin problema. En GPUs de datacenter (A100, H100) el modelo estaria infrautilizado, pero puede ejecutarse con alto throughput en lotes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runner compatible con GGUF. No es compatible directamente con vLLM o TGI en su forma GGUF sin conversion previa a safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano, se espera una generacion muy rapida en GPU consumer (decenas de tokens por segundo) y aceptable en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-2B-Distill-heretic (este repo, GGUF) | ~1,88 B | no disponible | Apache 2.0 | GGUF | Destilado, abliterated, solo ingles |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo oficial, multilingue, con filtros |
| Llama 3.2 1B Instruct | ~1,2 B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo oficial, multilingue, con filtros |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Modelo oficial, ingles, con filtros |

La comparativa se basa en datos publicos de los modelos alternativos; para este modelo concreto no hay datos de contexto ni benchmarks publicados en la informacion disponible, por lo que la comparacion de rendimiento no puede realizarse con rigor.

## Limitaciones y advertencias

- Modelo destilado y de 1,88 mil millones de parametros: su capacidad de razonamiento y su fiabilidad en tareas complejas seran inferiores a las de modelos mayores, aunque no hay benchmarks que lo cuantifiquen.
- Riesgo de alucinacion elevado, especialmente en tareas de conocimiento factual, por su tamano y por el proceso de destilacion.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado ni documentado.
- La abliteration puede degradar capacidades generales y aumentar la probabilidad de contenido toxico, sesgado o inseguro; no es recomendable para aplicaciones de cara al publico sin filtros adicionales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de destilacion pueden tener condiciones adicionales no reflejadas en este repo; conviene revisar la licencia del modelo base htb-ac-1424625/Qwen3.8-2B-Distill-heretic.
- Este repositorio solo contiene GGUF; no incluye safetensors ni tokenizer en formato transformers, por lo que no se puede cargar directamente con la libreria transformers pese al tag.
- No hay informacion sobre longitud de contexto, datos de entrenamiento ni evaluaciones; el uso en produccion requiere validacion propia.
- El repo ocupa 25,8 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-2B-Distill-heretic-i1-GGUF
- Modelo base: https://huggingface.co/htb-ac-1424625/Qwen3.8-2B-Distill-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-2B-Distill-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-2B-Distill-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
