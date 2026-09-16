# ollybritton/Llama-3.2-3B-gsm8k-distill-control-grpo130

## Resumen

`ollybritton/Llama-3.2-3B-gsm8k-distill-control-grpo130` es un ajuste fino del modelo base `meta-llama/Llama-3.2-3B`, publicado por el usuario ollybritton en HuggingFace. El repositorio contiene pesos en formato safetensors con 3.212.749.824 parámetros y ocupa 12,9 GB. La model card es prácticamente vacía: solo declara la licencia `llama3.2`, el modelo base y la marca "Built with Llama", sin documentación sobre datos de entrenamiento, metodología o evaluación.

Por la nomenclatura del identificador (gsm8k, distill, control, grpo130) se puede inferir que se trata de un experimento de ajuste sobre el conjunto de datos GSM8K (problemas aritméticos de nivel escolar) combinando destilación y optimización con GRPO (Group Relative Policy Optimization), correspondiente a un checkpoint intermedio o al paso 130 de un entrenamiento. Esta interpretación procede únicamente del nombre del repositorio y no está confirmada por ninguna documentación publicada, por lo que debe tratarse como una hipótesis de trabajo, no como un dato verificado.

La relevancia de esta ficha es limitada: con 0 descargas y 0 "likes" en el momento de la consulta, se trata de un artefacto de investigación personal más que de un modelo listo para producción. Su interés principal es como ejemplo de receta de destilación con RL aplicada a un modelo pequeño de 3B para razonamiento matemático, un área activa de experimentación en la comunidad open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (heredada del modelo base Llama-3.2-3B) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3.2-3B soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al derivar de Llama-3.2-3B son tecnicamente aplicables cuantizaciones GGUF de llama.cpp (Q4_K_M, Q5_K_M, Q8_0), AWQ y GPTQ, aunque no hay conversiones publicadas en este repositorio |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base declara 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 12,9 GB |
| Modelo base | meta-llama/Llama-3.2-3B |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura especifica de este ajuste. Al derivar de `meta-llama/Llama-3.2-3B`, la arquitectura subyacente es la de Llama 3.2: un transformer decoder-only con normalizacion RMSNorm pre-norma, activacion SwiGLU, codificaciones posicionales RoPE y atencion con consultas agrupadas (GQA) para reducir el coste de la cache KV. El recuento real de parametros del repositorio (3.212.749.824) coincide con el del modelo base, lo que indica que no se han anadido cabeceras ni modulos extra de forma apreciable.

Respecto al entrenamiento, la model card no documenta nada. El identificador del repositorio sugiere tres elementos: ajuste sobre GSM8K, uso de destilacion (probablemente de las cadenas de razonamiento de un modelo mayor) y optimizacion con GRPO, un algoritmo de aprendizaje por refuerzo sin modelo critico que se ha popularizado para entrenar capacidades de razonamiento matematico. El sufijo "grpo130" sugiere el paso o iteracion 130. El sufijo "control" podria indicar una condicion de control experimental dentro de un estudio comparativo. Ninguno de estos extremos esta confirmado por el autor en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en el mismo rango de capacidades que Llama-3.2-3B.
- Razonamiento aritmetico y resolucion de problemas de nivel escolar: es el objetivo declarado implicitamente por el nombre del repositorio (GSM8K), aunque no hay evaluacion publicada que lo confirme.
- Generacion de codigo basica, heredada del modelo base de 3B.
- Soporte multilingue limitado, heredado del modelo base (8 idiomas declarados por Meta).
- Tool calling / function calling: no disponible en la informacion proporcionada; el modelo base Llama-3.2-3B-Instruct si lo soporta, pero se desconoce si este ajuste conserva dicha capacidad al no haberse entrenado necesariamente sobre plantillas de herramientas.
- Modo "thinking" explicito: no disponible.
- Capacidades de vision o audio: no disponibles; Llama-3.2-3B es un modelo exclusivamente de texto.
- Capacidades de agente y razonamiento multi-paso: no documentadas.

## Casos de uso

- Investigacion en destilacion de razonamiento: el modelo sirve como punto de comparacion frente a otros checkpoints del mismo autor para medir el efecto del paso de GRPO sobre la precision en GSM8K. Su valor aqui es experimental, no productivo.
- Reproduccion de recetas de RL para razonamiento: util para investigadores que quieran inspeccionar los pesos resultantes de un pipeline de destilacion mas GRPO sobre un modelo de 3B.
- Generacion de cadenas de razonamiento matematico en entornos de bajo coste: con 3.200 millones de parametros es viable ejecutarlo en una GPU de consumo para generar soluciones paso a paso, siempre que se valide la calidad de forma empirica antes de usarlo.
- Prototipado rapido de tutores aritmeticos: el modelo puede generar explicaciones paso a paso de problemas de primaria y secundaria, con la advertencia de que no hay evaluacion publicada que respalde su precision.
- Fine-tuning posterior como punto de partida: al ser un ajuste de Llama-3.2-3B, puede servir como inicializacion para experimentos de RLHF o DPO adicionales sobre tareas matematicas.
- Evaluacion comparativa de metodos de RL: util como una de las ramas de un estudio A/B frente a checkpoints entrenados con SFT puro o con PPO.
- Analisis de deriva de comportamiento: permite comprobar si el entrenamiento con GRPO sobre un unico dominio degrada capacidades generales del modelo base (olvido catastrofico), un problema conocido en ajustes estrechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, la model card no contiene datos numericos y el autor no aporta cifras de GSM8K ni de ninguna otra prueba, a pesar de que el nombre del modelo hace referencia explicita a ese conjunto de datos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,5-7 GB solo para pesos, mas cache KV; en la practica unos 8-10 GB con contexto moderado.
- VRAM estimada en cuantizacion INT8: alrededor de 3,5-4 GB.
- VRAM estimada en cuantizacion de 4 bits (Q4_K_M): aproximadamente 2-2,5 GB.
- GPU de centro de datos: A100 40/80 GB, H100, L40S; sobradamente dimensionadas para este tamano, utiles solo si se requiere lote grande o contexto muy largo.
- GPU de consumo: cabe sin problema en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en 4 bits cabe incluso en GPUs de 4-6 GB como RTX 3050 o GTX 1650 con contexto reducido.
- Opciones de despliegue: transformers (PyTorch), vLLM y TGI para servido con batching continuo, llama.cpp y Ollama para CPU/GPU mixto (requiere convertir los pesos safetensors a GGUF, ya que el repositorio no incluye archivos GGUF).
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo de 3B en una RTX 4090 con vLLM suele superar varios centenares de tokens por segundo en generacion, pero no hay mediciones de este checkpoint concreto.
- Nota sobre el repositorio: sus 12,9 GB son aproximadamente el doble de lo que ocupan 3.212 millones de parametros en FP16 (unos 6,4 GB), lo que sugiere que puede contener checkpoints duplicados, estados de optimizador o varios ficheros de pesos. Conviene revisar la lista de archivos antes de descargarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-gsm8k-distill-control-grpo130 | 3,21 B | no disponible (base: 128k) | no | Llama 3.2 Community | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128k | si, publicados por Meta | Llama 3.2 Community | HuggingFace, ampliamente desplegado |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (128k con YaRN) | si, publicados por Alibaba | Apache 2.0 | HuggingFace |
| Phi-3.5-mini-instruct | 3,8 B | 128k | si, publicados por Microsoft | MIT | HuggingFace |

Frente a estas alternativas, el modelo aqui descrito no aporta datos de rendimiento verificables y su licencia Llama 3.2 impone restricciones de uso comercial (clausula de 700 millones de usuarios mensuales y requisitos de atribucion) mas estrictas que las licencias Apache 2.0 o MIT de Qwen2.5 y Phi-3.5. Su unico diferencial potencial es el entrenamiento especifico sobre GSM8K, que no se ha demostrado empiricamente. No se dispone de datos para comparar rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe datos de entrenamiento, hiperparametros, metodologia de evaluacion ni uso previsto, lo que impide auditar el modelo.
- Riesgo elevado de alucinacion en tareas fuera del dominio aritmetico, agravado por el ajuste estrecho sobre GSM8K, que puede inducir olvido catastrofico de capacidades generales.
- Sesgos: no evaluados. Al heredar los pesos de Llama-3.2-3B, el modelo arrastra los sesgos conocidos del modelo base de Meta, sin que se haya aplicado un proceso de alineacion documentado.
- Limitaciones de idioma: no hay informacion sobre el comportamiento multilingue de este ajuste concreto; un entrenamiento centrado en GSM8K (mayoritariamente en ingles) puede haber degradado el rendimiento en otros idiomas.
- Limitaciones de contexto: no se ha verificado que se conserve la ventana de 128.000 tokens del modelo base, ya que un ajuste fino puede alterar el comportamiento con contextos largos si no se entreno con ellos.
- Licencia: Llama 3.2 Community License. Permite uso comercial con condiciones, pero obliga a incluir el aviso "Built with Llama", a nombrar el modelo como "Llama 3.2" en las interfaces y a solicitar autorizacion a Meta si el producto supera los 700 millones de usuarios mensuales. Ademas, la licencia exige que cualquier modelo derivado distribuido incluya copia de la licencia.
- Riesgo de reproducibilidad: sin semilla, configuracion de entrenamiento ni version de las librerias, el ajuste no es reproducible.
- Madurez: 0 descargas y 0 valoraciones indican que el modelo no ha sido validado por terceros. No es recomendable usarlo en produccion sin una evaluacion propia exhaustiva.
- Posible inconsistencia de metadatos: la fecha de creacion indicada (2026-09-15) es posterior a la fecha actual de la mayoria de referencias disponibles, lo que puede deberse a un error de metadatos en el momento de la subida o a un ajuste del reloj del sistema; conviene verificarlo en la pagina del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ollybritton/Llama-3.2-3B-gsm8k-distill-control-grpo130
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Conjunto de datos GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Pagina de modelos Llama de Meta: https://www.llama.com/
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante a este modelo en la busqueda realizada; los resultados devueltos (repositorios de jailbreaks, subreddits de ChatGPT y foros generalistas) no guardan relacion con el modelo descrito.
