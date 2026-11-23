# mradermacher/Qwen3.8-27B-RANA-abliterated-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-RANA-abliterated-i1-GGUF` es una coleccion de cuantizaciones GGUF generadas con imatrix a partir del modelo `abliterant/Qwen3.8-27B-RANA-abliterated`, una variante "abliterated" (con la direccion de rechazo suprimida) de un modelo de la familia Qwen3 con 27.320.697.856 parametros totales. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de quants GGUF para llama.cpp, y el modelo base procede del usuario `abliterant`, que aplica tecnicas de abliteration para reducir los rechazos del modelo original.

El modelo resuelve el problema de desplegar un LLM de ~27B en hardware de consumo mediante cuantizaciones de 2 a 6 bits (desde 11,0 GB en i1-Q2_K hasta 22,5 GB en i1-Q6_K). Al estar etiquetado como `vision-language` y `qwen3`, se infiere que el modelo base incorpora capacidades multimodales, aunque la model card no aporta detalles sobre la arquitectura interna, el contexto o los datos de entrenamiento.

Es relevante ahora porque combina tres tendencias: modelos de ~27B con licencia Apache 2.0, el ecosistema de cuantizacion imatrix de mradermacher (que mejora la perplejidad frente a quants estaticos) y las variantes abliterated/uncensored, demandadas para investigacion sobre alineamiento y para aplicaciones donde los rechazos del modelo resultan un obstaculo. La ficha se limita a los datos verificables de la model card; cualquier especificacion no documentada se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `qwen3` y `vision-language`) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye presumiblemente en safetensors via transformers |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la informacion proporcionada. Las etiquetas de la model card (`qwen3`, `vision-language`) sugieren que deriva de un transformer de la familia Qwen3 con capacidad de vision, pero no se detalla si es denso o MoE, ni el numero de capas, cabezas de atencion o dimensiones ocultas. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la model card del quant no aporta datos sobre tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. Lo unico reseñable a nivel tecnico es que el modelo base ha sido sometido a un proceso de **abliteration**: se identifica la "direccion de rechazo" (refusal direction) en el espacio de activaciones y se proyecta fuera de los pesos, de modo que el modelo deja de activar respuestas de negacion ante ciertas peticiones. La cuantizacion de mradermacher usa **imatrix** (importance matrix) generada a partir del propio modelo, lo que segun el autor mejora la calidad frente a quants estaticos del mismo tamaño; se ofrece tambien el fichero imatrix (0,1 GB) para quien quiera generar sus propios quants. El proceso de conversion indica `convert_type: hf` y `output_tensor_quantised: 1`.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Capacidades de vision-lenguaje heredadas del modelo base segun la etiqueta `vision-language` (sin detalle de resolucion, tipos de imagen ni formato de prompt multimodal).
- Comportamiento "uncensored": la abliteration reduce la probabilidad de rechazos ante peticiones que el modelo original declinaria.
- Razonamiento, codigo y matematicas: no documentado explicitamente en la informacion disponible; se asume herencia del modelo base Qwen3.8, pero sin confirmacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card solo declara `en`; el resto de idiomas no esta confirmado.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- **Investigacion sobre alineamiento y seguridad**: comparar el comportamiento del modelo base frente a la variante abliterated permite estudiar como se distribuye la direccion de rechazo en el espacio de activaciones y que capacidades se degradan al eliminarla.
- **Generacion creativa sin filtros**: escritura de ficcion, guiones o narrativa con tematicas sensibles donde los rechazos del modelo original interrumpen el flujo; el quant i1-Q4_K_M (16,9 GB) ofrece un equilibrio razonable para uso local.
- **Despliegue local en estaciones de trabajo**: con i1-IQ4_XS (15,4 GB) o i1-Q4_K_S (15,9 GB) el modelo cabe en GPUs de 24 GB (RTX 3090/4090) o en configuraciones CPU+GPU con llama.cpp, permitiendo inferencia privada sin conexion.
- **Prototipado rapido con Ollama o llama.cpp**: el formato GGUF y la disponibilidad de quants desde 11 GB permiten iterar en portatiles con 16 GB de RAM/VRAM usando i1-Q3_K_S o i1-IQ3_S, aunque con perdida de calidad notable.
- **Analisis de imagenes en local** (si se confirma la capacidad multimodal): clasificacion, descripcion o extraccion de informacion de capturas y documentos escaneados sin enviar datos a la nube; requiere verificar el soporte de vision en el runtime GGUF elegido.
- **Generacion de datos sinteticos para fine-tuning**: producir corpus diversos sin los sesgos de refusal del modelo alineado, util para aumentar datasets de entrenamiento en dominios especializados.
- **Evaluacion de cuantizaciones**: el fichero imatrix y el rango completo de quants (de Q2_K a Q6_K) permiten medir la degradacion de perplejidad por nivel de compresion en tareas concretas, replicando la curva publicada por ikawrakow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica numerica; solo referencias cualitativas a la calidad relativa de los quants (por ejemplo, "IQ3_XXS probably better" que Q2_K, o "IQ3_S probably better" que Q3_K_M).

## Requisitos de hardware

- **VRAM/RAM estimada segun quant** (tamaños de fichero publicados):
  - i1-Q2_K: 11,0 GB
  - i1-Q3_K_S: 12,4 GB; i1-IQ3_S: 12,7 GB; i1-IQ3_M: 12,9 GB
  - i1-Q3_K_M: 13,6 GB; i1-Q3_K_L: 14,7 GB
  - i1-IQ4_XS: 15,4 GB; i1-Q4_0: 15,9 GB; i1-Q4_K_S: 15,9 GB; i1-Q4_K_M: 16,9 GB; i1-Q4_1: 17,4 GB
  - i1-Q5_K_S: 19,1 GB; i1-Q5_K_M: 19,6 GB
  - i1-Q6_K: 22,5 GB
- **Consumer GPU**: los quants de 4 bits (15-17 GB) caben en GPUs de 24 GB (RTX 3090, RTX 4090, RX 7900 XTX) con contexto moderado; los de 2-3 bits pueden caber en 12-16 GB (RTX 4070 Ti, RTX 4080) con offloading parcial. Los de 5-6 bits requieren 24 GB con margen ajustado o 32 GB+ (A6000, RTX 5090).
- **GPU profesionales**: A100 40/80 GB, H100, L40S permiten cargar cualquier quant con contexto amplio; para el modelo sin cuantizar (~54 GB en FP16) se necesita una A100 80 GB o multi-GPU.
- **Opciones de despliegue**: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, text-generation-webui; vLLM y TGI no consumen GGUF de forma nativa (requeririan el modelo base en safetensors). La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI en algunos runtimes.
- **Latencia y throughput**: no disponibles; dependen del hardware, del quant y del backend. Como referencia cualitativa, la model card marca i1-Q4_0 como "fast, low quality" y i1-Q4_K_M como "fast, recommended".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-RANA-abliterated i1-GGUF (este) | ~27,3B | no disponible | Apache 2.0 | GGUF (i1, 2-6 bits) | Variante uncensored con quants imatrix |
| Qwen3.8-27B-RANA-abliterated (base) | ~27,3B | no disponible | Apache 2.0 | safetensors (transformers) | Modelo sin cuantizar del que derivan los GGUF |
| Qwen3.8-27B-RANA-abliterated-GGUF (quants estaticos) | ~27,3B | no disponible | Apache 2.0 | GGUF estaticos | Mismo autor, sin imatrix; menor calidad a igual tamaño segun el propio autor |
| Modelos Qwen3 densos de ~27-32B (familia original) | ~27-32B | no disponible | Apache 2.0 (segun familia) | safetensors, GGUF | Version alineada sin abliteration; rechaza peticiones que esta variante acepta |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- **Abliteration degrada la alineacion de seguridad**: el modelo eliminara rechazos ante contenido que el original bloquearia; no es apto para aplicaciones de cara al publico sin un filtro externo y una revision de cumplimiento legal.
- **Riesgo de alucinacion**: inherente a los LLM de esta escala; no hay evaluaciones publicadas que cuantifiquen la tasa de alucinacion ni el impacto de la abliteration sobre la veracidad.
- **Idioma**: solo se declara `en`; el rendimiento en castellano no esta verificado y podria ser inferior al del modelo base original.
- **Contexto desconocido**: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni el soporte de ventanas extendidas.
- **Capacidad multimodal incierta en GGUF**: aunque el modelo base se etiqueta como vision-language, el soporte de vision en llama.cpp/Ollama depende del runtime y del fichero mmproj, que la model card no lista (`skip_mmproj` vacio, sin confirmacion).
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento de la normativa aplicable (por ejemplo, EU AI Act) al desplegar una variante sin filtros.
- **Calidad de los quants bajos**: los quants de 2-3 bits (11-13 GB) pierden calidad de forma notable; el propio autor desaconseja Q2_K frente a IQ3_XXS.
- **Fecha de creacion futura en los metadatos** (2026-09-25): conviene verificar la procedencia y el modelo base antes de usarlo en produccion, dado que el ecosistema de variantes abliterated es propenso a forks no auditados.

## Enlaces

- Repositorio Hugging Face (este quant): https://huggingface.co/mradermacher/Qwen3.8-27B-RANA-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated
- Quants estaticos del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-RANA-abliterated-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Qwen3.8-27B-RANA-abliterated-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del autor): https://www.nethype.de/
