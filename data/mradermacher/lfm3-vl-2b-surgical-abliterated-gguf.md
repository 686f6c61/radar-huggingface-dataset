# mradermacher/LFM3-VL-2B-Surgical-Abliterated-GGUF

## Resumen

LFM3-VL-2B-Surgical-Abliterated-GGUF es una cuantizacion en formato GGUF del modelo multimodal medismera/LFM3-VL-2B-Surgical-Abliterated, publicada por mradermacher, un creador habitual de cuantizaciones para llama.cpp. El modelo base deriva de la familia LFM3-VL (Liquid Foundation Model, variante vision-language de 2B parametros) y ha sido sometido a un proceso de "abliteration" quirurgica, una tecnica de modificacion de pesos orientada a eliminar los mecanismos de rechazo y alineacion de seguridad del modelo original. El resultado es un modelo "uncensored" que responde sin las restricciones tipicas de los modelos alineados.

El repositorio proporciona unicamente pesos cuantizados (GGUF) junto con los adaptadores multimodales mmproj necesarios para el procesamiento de imagenes. No incluye pesos en safetensors ni documentacion tecnica propia sobre el entrenamiento, la composicion del dataset o el proceso de abliteration; toda esa informacion reside en el modelo base. Con 1.728.801.600 parametros reales (segun safetensors del modelo base) y un tamano de repo de 16,5 GB repartido entre las distintas cuantizaciones, esta pensado para inferencia local en hardware de consumo.

Su relevancia radica en dos factores: por un lado, permite ejecutar un modelo vision-language de ~1,7B parametros en equipos modestos mediante llama.cpp; por otro, el caracter "abliterated" lo hace atractivo para investigadores que estudian el comportamiento de modelos sin alineacion, si bien plantea caveats importantes de licencia y de uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL, vision-language; detalles no publicados en la informacion disponible) |
| Parametros totales | 1.728.801.600 (~1,7B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |
| Tamano del repo | 16,5 GB |
| Modelo base | medismera/LFM3-VL-2B-Surgical-Abliterated |
| Etiquetas | abliterated, uncensored, surgical-alignment, causal-lm, conversational |
| Descargas | 1170 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo base pertenece a la familia LFM3-VL, que por nomenclatura corresponde a un modelo causal de lenguaje con capacidad de vision (vision-language), de aproximadamente 2B parametros nominales y 1,73B reales. La model card del repositorio cuantizado no describe la arquitectura (transformer denso, atencion, capas), los datos de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO.

La innovacion tecnica declarada es el proceso de "surgical abliteration" (alineacion quirurgica), aplicado sobre el modelo base por el autor medismera. Este tipo de intervencion modifica selectivamente las direcciones de activacion asociadas a comportamientos de rechazo, con el objetivo de preservar las capacidades generales del modelo mientras se eliminan las respuestas de negativa. No se documentan en la informacion disponible los detalles del metodo, el numero de direcciones ablacionadas ni las metricas de degradacion resultantes. La cuantizacion la realiza mradermacher con su pipeline habitual (quantize_version 2, convert_type hf), generando cuantizaciones estaticas y, en un repositorio separado, cuantizaciones con imatrix.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta "conversational").
- Procesamiento multimodal de imagenes: el repositorio incluye adaptadores mmproj (Q8_0 y f16) necesarios para la entrada visual en llama.cpp.
- Modelo causal de lenguaje (causal-lm) para generacion autoregresiva.
- Comportamiento "uncensored": responde sin los filtros de rechazo del modelo alineado original, segun la etiqueta "abliterated".
- Capacidad de razonamiento y codigo: no documentada explicitamente en la informacion disponible; debe asumirse limitada por el tamano de ~1,7B parametros.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local de vision-language en equipos de consumo: con cuantizaciones Q4_K_M de ~1,2 GB mas el mmproj, el modelo puede ejecutarse en GPUs de 4-6 GB de VRAM o incluso en CPU, permitiendo experimentar con descripcion de imagenes y preguntas visuales sin infraestructura cloud.
- Investigacion sobre alineacion y seguridad: el caracter abliterated lo hace util para estudiar como la eliminacion de direcciones de rechazo afecta al comportamiento del modelo, comparando respuestas frente al modelo base alineado.
- Prototipado de asistentes conversacionales sin restricciones tematicas: para entornos de investigacion donde se necesita un modelo que no rechace consultas por contenido sensible y se trabaja con datos controlados.
- Procesamiento de documentos con imagenes en local: extraccion de informacion de capturas, diagramas o formularios mediante el adaptador mmproj, en flujos donde la privacidad impide enviar datos a APIs externas.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece un espectro completo de cuantizaciones (de Q2_K a f16) que permite medir la degradacion de calidad en un modelo multimodal pequeno, util para calibrar pipelines de despliegue.
- Educacion y experimentacion con llama.cpp: modelo ligero para aprender a desplegar modelos multimodales con llama-server o Ollama, dado su reducido tamano y la disponibilidad de todos los formatos habituales.
- Generacion creativa sin filtros en ingles: escritura de ficcion o contenido que el modelo base rechazaria, siempre dentro de marcos legales y eticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB. Anadir ~0,3-0,5 GB para el mmproj si se usa la entrada visual.
- Con overhead de contexto y KV cache, un presupuesto realista de 2-4 GB de VRAM cubre las cuantizaciones Q4-Q8 en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (RTX 3050, RTX 4060, RTX 3060, GTX 1660 Super). En GPUs profesionales (A100, H100) funciona pero esta muy sobredimensionado; su uso tipico es en agregacion de muchos procesos o fine-tuning.
- Cabe en GPU consumer: si, practicamente en todas las de 4 GB o mas; tambien en CPU con llama.cpp a velocidades aceptables para un modelo de este tamano.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), y cualquier frontend compatible con GGUF que soporte mmproj (LM Studio, KoboldCpp, Jan). vLLM y TGI no consumen GGUF directamente; para ellos habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera decodificacion en tiempo real en GPU consumer y varios tokens por segundo en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-Surgical-Abliterated-GGUF | ~1,7B | no disponible | si (mmproj) | other | GGUF en HF |
| medismera/LFM3-VL-2B-Surgical-Abliterated (base) | ~1,7B | no disponible | si | other | safetensors en HF |
| Qwen2-VL-2B-Instruct | ~2B | 32K (segun documentacion publica del modelo) | si | Apache 2.0 (segun su model card) | safetensors y GGUF |
| SmolVLM-2B-Instruct | ~2B | no disponible en esta ficha | si | Apache 2.0 (segun su model card) | safetensors y GGUF |

La comparativa se limita a categoria y tamano; no hay datos de rendimiento del modelo analizado que permitan una comparacion cuantitativa. La diferencia principal frente a alternativas como Qwen2-VL-2B o SmolVLM-2B es el caracter abliterated y la licencia "other", que requiere revisar los terminos del modelo base antes de cualquier uso.

## Limitaciones y advertencias

- La licencia "other" remite a los terminos del modelo base; es imprescindible revisar la licencia de medismera/LFM3-VL-2B-Surgical-Abliterated antes de cualquier uso comercial, que puede estar restringido o requerir condiciones adicionales.
- El proceso de abliteration elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, sesgado o ilegal sin advertencia; no es apto para despliegues de cara al publico sin filtros externos.
- Riesgo de alucinacion elevado por el reducido tamano (~1,7B parametros); no debe usarse como fuente de verdad en dominios factuales sin verificacion.
- Solo soporta ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La abliteration puede degradar capacidades generales (razonamiento, coherencia) respecto al modelo alineado original; no hay metricas publicadas que cuantifiquen esta perdida.
- La longitud de contexto no esta documentada en la informacion disponible; asumir valores conservadores hasta verificarlo con el modelo base.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente un modelo de este tamano; se recomienda Q4_K_M o superior.
- El adaptador mmproj es imprescindible para la entrada visual; sin el, el modelo funciona solo como causal-lm de texto.
- No hay informacion sobre sesgos especificos medidos, pero al derivar de un modelo entrenado principalmente en ingles, hereda los sesgos de su corpus.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/LFM3-VL-2B-Surgical-Abliterated-GGUF
- Modelo base: https://huggingface.co/medismera/LFM3-VL-2B-Surgical-Abliterated
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/LFM3-VL-2B-Surgical-Abliterated-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#LFM3-VL-2B-Surgical-Abliterated-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
