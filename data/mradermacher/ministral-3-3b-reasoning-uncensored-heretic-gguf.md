# mradermacher/Ministral-3-3B-Reasoning-UNCENSORED-heretic-GGUF

## Resumen

Este repositorio, publicado por mradermacher, contiene cuantizaciones estáticas en formato GGUF del modelo xtools-at/Ministral-3-3B-Reasoning-UNCENSORED-heretic, una variante de 3.429.006.336 parámetros (3,43 B) derivada de la familia Ministral y sometida a un proceso de abliteración o «decensoring» con la herramienta heretic. El resultado es un modelo conversacional de razonamiento, con tokenizador mistral-common y sin la dirección de rechazo que suelen incorporar los modelos alineados, pensado para ejecución local.

El interés práctico del repositorio no está en el modelo en sí, sino en el trabajo de cuantización: mradermacher ofrece trece variantes GGUF (desde Q2_K de 1,6 GB hasta f16 de 7,0 GB) más dos proyectores multimodales mmproj, lo que permite desplegar el modelo en hardware de consumo, desde un portátil sin GPU dedicada hasta una RTX 4060. La licencia Apache 2.0 facilita su uso comercial, aunque el carácter «uncensored» traslada al integrador toda la responsabilidad sobre el contenido generado.

Se trata de un modelo pequeño (3,43 B) con soporte declarado de once idiomas (inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe). No se han publicado resultados de benchmarks ni especificaciones detalladas de contexto o arquitectura en la información disponible, por lo que su evaluación debe hacerse empíricamente antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; la nomenclatura (Ministral-3-3B) y el tokenizador mistral-common indican un transformer decoder-only de la familia Ministral de Mistral AI |
| Parámetros totales | 3.429.006.336 (3,43 B, dato real de safetensors del modelo base) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyectores mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar (11 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el repositorio no incluye safetensors; los parámetros indicados proceden del modelo base) |
| Modelo base | xtools-at/Ministral-3-3B-Reasoning-UNCENSORED-heretic |
| Tamaño del repositorio | 32,5 GB (conjunto completo de cuantizaciones) |
| Descargas / likes | 405 / 2 |
| Fecha de creación y actualización | 21 de octubre de 2026 (creación y última actualización el mismo día) |
| Librería declarada | transformers |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna ni el proceso de entrenamiento. Por la nomenclatura del modelo base (Ministral-3-3B), el tag mistral-common y el uso de la librería transformers, cabe inferir un transformer decoder-only de la familia Ministral de Mistral AI con 3,43 B de parámetros, pero la model card de esta cuantización no aporta número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto entrenada.

Sobre el entrenamiento solo pueden deducirse los rasgos que declaran los tags: el modelo base pasó por un proceso de abliteración («heretic», «abliterated», «decensored», «uncensored»), orientado a eliminar la dirección de rechazo del modelo alineado original, y por un ajuste fino con fines de razonamiento («Reasoning»), presumiblemente realizado con Unsloth según el tag «unsloth». No se especifican tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas de decodificación. Este repositorio, en concreto, no entrena nada: solo aplica cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) sobre los pesos del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (tag «conversational», plantilla de chat mistral-common).
- Razonamiento explícito: el nombre del modelo base incluye «Reasoning», lo que sugiere entrenamiento orientado a cadenas de razonamiento, aunque no se documenta el formato exacto de las trazas ni si existe un modo «thinking» separable.
- Multilingüismo declarado en once idiomas (en, fr, es, de, it, pt, nl, zh, ja, ko, ar).
- Respuestas sin mecanismos de rechazo por alineación: la abliteración elimina la dirección de negativa del modelo original, de modo que no declina peticiones por política interna.
- Posible entrada multimodal: el repositorio incluye dos ficheros mmproj («multi-modal supplement») que solo tienen sentido si el modelo base incorpora un codificador de visión; la model card no confirma qué modalidad ni con qué resolución.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible; no se documentan plantillas de herramientas ni protocolos de agente.
- Capacidades especiales (audio, visión confirmada, modo thinking conmutable): no disponibles salvo la multimodalidad implícita de los mmproj.

## Casos de uso

- Asistente conversacional totalmente local en portátil: con la cuantización Q4_K_M (2,2 GB) el modelo se ejecuta en CPU o en una GPU modesta mediante llama.cpp u Ollama, lo que permite un chatbot privado sin conexión ni coste por token.
- Escritura creativa y ficción sin fricción: al carecer de mecanismo de rechazo, resulta adecuado para narrativa con violencia, contenido adulto o temas sensibles donde un modelo alineado interrumpiría la generación; requiere revisión humana posterior.
- Investigación sobre alineación y abliteración: sirve como sujeto de comparación frente al modelo Ministral original para medir cuánto deterioro de capacidades y cuánto aumento de toxicidad introduce la eliminación de la dirección de rechazo.
- Generación de datos sintéticos a escala: desplegado con llama-server o llama-cpp-python en modo batch, puede producir grandes volúmenes de texto multilingüe para aumentar datasets, con la ventaja de su bajo coste de inferencia en GPUs de 4-8 GB.
- Traducción y atención multilingüe de bajo recurso: los once idiomas declarados permiten prototipos de traducción o respuesta en español, francés, alemán, árabe o japonés en entornos con hardware limitado, aceptando la pérdida de calidad propia de un modelo de 3,43 B.
- Prototipado de razonamiento en entornos edge: para demos de resolución de problemas paso a paso o QA sobre documentos cortos en dispositivos con 4 GB de VRAM, antes de escalar a un modelo mayor.
- Base para ajuste fino con LoRA/QLoRA: al estar disponible en GGUF y en safetensors (modelo base), puede servir como punto de partida para especializaciones con Unsloth en una única GPU de consumo.
- Red teaming y evaluación de salvaguardas: útil como generador de prompts y respuestas adversarias para probar los filtros de un sistema en producción, dado su comportamiento sin restricciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni la del modelo base incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench u otras evaluaciones, y tampoco se documentan métricas de perplejidad por tipo de cuantización (solo se enlaza un gráfico genérico comparativo de calidad entre tipos de quant).

## Requisitos de hardware

- Tamaño de pesos por cuantización (solo pesos, sin caché KV): Q2_K 1,6 GB; Q3_K_S 1,7 GB; Q3_K_M 1,9 GB; Q3_K_L 2,0 GB; IQ4_XS 2,1 GB; Q4_K_S 2,2 GB; Q4_K_M 2,2 GB; Q5_K_S 2,5 GB; Q5_K_M 2,6 GB; Q6_K 2,9 GB; Q8_0 3,8 GB; f16 7,0 GB; mmproj-Q8_0 0,6 GB; mmproj-f16 0,9 GB.
- VRAM estimada para inferencia: alrededor de 3-4 GB con Q4_K_M para contextos moderados (pesos más caché KV), 5-6 GB con Q8_0 y 8-9 GB con f16. Son estimaciones por tamaño de pesos; la caché KV exacta no puede calcularse porque se desconoce el número de capas y cabezas.
- GPU recomendadas: cualquier GPU con 4 GB o más para Q4 (GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 3060 12 GB); RTX 4090, A100 o H100 solo tienen sentido para servir muchas peticiones concurrentes o para f16, dado el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, holgadamente. Con Q4_K_M funciona incluso en iGPU con memoria unificada (Apple Silicon, APU AMD) y en CPU pura con 4 GB de RAM libres.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF con un Modelfile), LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM y TGI no son el destino natural de un GGUF; para servirlo con ellos conviene usar el repositorio del modelo base en safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repositorio (mradermacher, GGUF) | 3,43 B | No disponible | apache-2.0 | GGUF (13 cuantizaciones + mmproj) | Cuantización estática; 405 descargas y 2 likes, validación comunitaria escasa |
| xtools-at/Ministral-3-3B-Reasoning-UNCENSORED-heretic | 3,43 B | No disponible | apache-2.0 (según este repositorio) | Safetensors (transformers) | Modelo base sin cuantizar; necesario para vLLM, TGI o ajuste fino completo |
| mradermacher/Ministral-3-3B-Reasoning-UNCENSORED-heretic-i1-GGUF | 3,43 B | No disponible | apache-2.0 | GGUF con cuantización ponderada/imatrix | Variante alternativa del mismo autor, con quantización i1; suele ofrecer mejor calidad por bit que la estática |
| Ministral 3B (Mistral AI) | No disponible en la información | No disponible en la información | No disponible en la información | No disponible | Modelo original alineado del que desciende la familia; referencia para medir el efecto de la abliteración |

No se dispone de datos verificados de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma clase (Llama 3.2 3B, Qwen2.5 3B, Gemma 2 2B); cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- La abliteración no elimina los sesgos del modelo base: los hereda y puede amplificarlos, además de degradar capacidades de instrucción, coherencia y razonamiento respecto al Ministral original. No hay benchmarks que cuantifiquen ese deterioro.
- Riesgo elevado de alucinación: con 3,43 B de parámetros, la precisión factual en dominios especializados es limitada, especialmente en los idiomas distintos del inglés.
- Ausencia total de salvaguardas internas: el modelo puede generar contenido tóxico, ilegal, peligroso o sexual, y no rechazará peticiones. En producción dirigida a usuarios finales es imprescindible un filtro externo de entrada y salida.
- Longitud de contexto no documentada: no puede planificarse un caso de uso con documentos largos sin medir empíricamente el punto de degradación.
- Falta de datos de rendimiento: sin benchmarks publicados, no hay base para afirmar calidad frente a alternativas de tamaño similar.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el titular del despliegue asume la responsabilidad legal y regulatoria del contenido generado (por ejemplo, obligaciones de transparencia del Reglamento europeo de IA para sistemas conversacionales).
- Multimodalidad no confirmada: la presencia de ficheros mmproj sugiere un codificador visual, pero ninguna model card describe la modalidad ni el formato de imagen admitido.
- Validación comunitaria mínima: 405 descargas y 2 likes en el momento de la consulta; no existen informes independientes de calidad para estas cuantizaciones concretas.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) degradan notablemente la calidad; la propia model card marca Q3_K_M como «lower quality» y recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- El repositorio completo ocupa 32,5 GB; conviene descargar únicamente el fichero GGUF necesario en lugar de clonar el repositorio entero.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Ministral-3-3B-Reasoning-UNCENSORED-heretic-GGUF
- Cuantizaciones i1 (ponderadas/imatrix): https://huggingface.co/mradermacher/Ministral-3-3B-Reasoning-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Ministral-3-3B-Reasoning-UNCENSORED-heretic
- Página de descarga del autor para este modelo: https://hf.tst.eu/model#Ministral-3-3B-Reasoning-UNCENSORED-heretic-GGUF
- Búsqueda de modelos cuantizados del modelo base: https://huggingface.co/models?other=base_model%3Aquantized%3Axtools-at%2FMinistral-3-3B-Reasoning-UNCENSORED-heretic
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que soporta el trabajo de cuantización: https://www.nethype.de/
