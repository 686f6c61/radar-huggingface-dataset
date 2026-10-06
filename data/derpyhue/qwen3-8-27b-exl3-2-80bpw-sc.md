# Derpyhue/Qwen3.8-27B-exl3-2.80bpw-SC

## Resumen

Qwen3.8-27B-exl3-2.80bpw-SC es una cuantizacion EXL3 del modelo Qwen/Qwen3.8-27B, publicada por el usuario Derpyhue. El modelo base es un vision-language nativo de 27B construido sobre la arquitectura Qwen3.5, con 64 capas hibridas que combinan Gated DeltaNet y Gated Attention, 262K tokens de contexto nativo extensibles a 1M, comprension de imagen y video, y control flexible del modo de razonamiento. Esta version concreta reduce el peso a un promedio de 2,80 bits por peso (bpw) mediante asignacion de bits por tensor optimizada por atribucion de ruido.

El problema que resuelve es el de desplegar un modelo multimodal de gran contexto en hardware de gama alta para consumidores, donde los pesos en BF16 no caben. El repo ocupa aproximadamente 12,55 GB, de los cuales 8,578 GiB corresponden a tensores cuantizados (el resto son embeddings en BF16). La cuantizacion preserva a mayor bitrate las partes mas sensibles: la cabeza de salida del LM y las capas de multi-token prediction (MTP) se mantienen a 4,0 bpw, y el vision tower a 6,0 bpw, lo que limita el dano en generacion y en comprension visual.

Es relevante porque forma parte de una serie coherente (2,65 / 2,70 / 2,75 / 2,80 bpw) con el mismo corpus de calibracion y la misma metodologia de medida, lo que permite elegir el punto de la curva tamano-calidad con datos comparables de divergencia KL y perplejidad. El formato es propietario de ExLlamaV3, por lo que su uso esta atado al ecosistema exllamav3 y tabbyAPI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de 64 capas: Gated DeltaNet + Gated Attention (arquitectura Qwen3.5), vision-language nativa con vision tower |
| Parametros totales | 27B declarados para el modelo base; el indice safetensors del repo cuantizado suma 6.270.653.824 parametros (discrepancia no explicada en la model card) |
| Parametros activos | No disponible (la informacion no indica que el modelo sea MoE) |
| Longitud de contexto | 262K tokens nativos, extensible a 1M |
| Tipos de cuantizacion | EXL3 (exllamav3) a 2,80 bpw de media (2,7997 alcanzado); asignacion por tensor optimizada por atribucion de ruido (sc_optimize); cabeza LM y capas MTP a 4,0 bpw; vision tower a 6,0 bpw; codebook mul1; escalas de salida automaticas; tensor tying k_proj+v_proj y gate_proj+up_proj |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de conversion exllamav3, version 1.5.4); libreria exllamav3 |
| Tamano del repo | ~12,55 GB (12,6 GB en HuggingFace); 8,578 GiB de tensores cuantizados |
| Calibracion | 250 filas x 2048 columnas (corpus mixto por defecto) |
| Divergencia KL prevista (estimacion sc_optimize) | 0,0481 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida de 64 capas que alterna Gated DeltaNet y Gated Attention, un diseno de atencion lineal y atencion completa combinadas que busca sostener contextos muy largos con un coste de memoria inferior al de un transformer denso puro. El contexto nativo es de 262K tokens y puede extenderse hasta 1M. El modelo es vision-language nativo, con soporte de comprension de imagen y video a traves de un vision tower propio, y fue entrenado con multi-token prediction (MTP), lo que permite decodificacion especulativa sobre las propias capas MTP del modelo.

Sobre el proceso de entrenamiento del base no hay informacion en el material disponible: no se detalla el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documenta el control flexible de razonamiento mas alla de su existencia. En cuanto a la innovacion de esta publicacion concreta, el punto diferencial es el metodo de cuantizacion: en lugar de repartir los bits de forma uniforme, sc_optimize asigna bitrate por tensor segun su sensibilidad al ruido, de manera que las capas criticas reciben mas bits y las tolerantes menos. Todas las variantes de la serie SC comparten el mismo corpus de calibracion y la misma configuracion de medida, por lo que las diferencias de KLD y perplejidad entre ellas son atribuibles al bitrate objetivo.

## Capacidades

- Generacion de texto y razonamiento en el modelo base, con control flexible del modo de pensamiento (thinking control) segun la model card del base.
- Comprension de imagen y video mediante el vision tower, que en esta cuantizacion se mantiene a 6,0 bpw.
- Contexto largo: 262K tokens nativos, extensibles a 1M, apto para documentos y conversaciones de gran extension.
- Multi-token prediction (MTP) integrado en el entrenamiento, lo que habilita decodificacion especulativa con las capas MTP preservadas a 4,0 bpw.
- Capacidades multilingues: no disponible (no se declaran idiomas en la informacion proporcionada).
- Tool calling / function calling: no disponible (no se confirma en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad explicitamente documentada, mas alla del control de razonamiento del base.

## Casos de uso

- Analisis de documentacion extensa con imagenes: gracias a los 262K tokens de contexto y al vision tower, se pueden procesar informes completos con graficos, tablas escaneadas y anexos en una sola pasada, sin trocear el documento ni perder referencias cruzadas entre secciones.
- Resumen y QA sobre video: el modelo base entiende video de forma nativa, de modo que un pipeline puede extraer fotogramas clave y plantear preguntas sobre el contenido, o generar resumenes cronologicos de grabaciones largas.
- Asistente local de escritorio para catalogos visuales: con ~12,55 GB de pesos, el modelo cabe en una GPU de 24 GB y permite construir un asistente que catalogue productos, activos o inventario a partir de fotografias y descripciones textuales, sin enviar datos a la nube.
- Revision de contratos y expedientes con anexos: el contexto largo permite cargar el contrato principal junto con sus anexos y correos asociados, y formular preguntas sobre clausulas concretas o detectar contradicciones entre documentos.
- Prototipado e investigacion en cuantizacion: la serie SC publica metricas comparables de KLD media, mediana, p90 y perplejidad frente al original en BF16, lo que la convierte en un banco de pruebas util para estudiar el tradeoff bits-calidad en modelos hibridos con componentes multimodales.
- Despliegue en servidor de inferencia interno con tabbyAPI: al exponer una API compatible con OpenAI sobre ExLlamaV3, se puede integrar el modelo en herramientas internas de analisis documental o atencion a usuarios tecnicos con control total del dato.
- Transcripcion visual de graficos y diagramas a datos estructurados: extraer tablas y series de figuras en PDF o presentaciones para volcarlas a CSV o JSON en flujos de analitica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible. La model card unicamente aporta metricas de degradacion por cuantizacion medidas contra el original en BF16:

| Quant | Pesos (GiB) | KLD media | Mediana | p90 | Perplejidad |
|---|---|---|---|---|---|
| 2.65 bpw H4 | 8,154 | 0,0329 | 0,00170 | 0,095 | 1,3795 |
| 2.70 bpw H4 | 8,295 | 0,0301 | 0,00148 | 0,088 | 1,3746 |
| 2.75 bpw H4 | 8,437 | 0,0279 | 0,00143 | 0,082 | 1,3725 |
| **2.80 bpw H4 (este repo)** | **8,578** | **0,0256** | **0,00130** | **0,074** | **1,3690** |

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 12,55 GB, dado que el repo incluye 8,578 GiB de tensores cuantizados mas embeddings en BF16. Hay que sumar la cache KV del contexto, cuyo tamano depende de la longitud efectiva y de la configuracion de atencion; no se publican medidas concretas.
- GPU recomendadas: tarjetas con 24 GB o mas, como RTX 3090, RTX 4090, RTX 5090, L40S, A100 40/80 GB o H100. Con 16 GB (RTX 4080, 4060 Ti 16 GB) el margen es muy justo y solo seria viable con contextos cortos.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB), siempre que se limite la longitud de contexto para no desbordar la cache KV.
- Opciones de despliegue: exclusivamente ExLlamaV3, y la via recomendada por el autor es tabbyAPI con un config.yml apuntando al directorio del modelo. No es compatible con llama.cpp, Ollama, vLLM ni TGI, ya que el formato EXL3 es especifico de exllamav3.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Dentro de la misma familia y del mismo autor, la comparativa directa es la serie SC completa, que comparte calibracion y metodologia:

| Modelo | Bitrate medio | Pesos (GiB) | KLD media | Perplejidad | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-exl3-2.65bpw-SC | 2,65 bpw | 8,154 | 0,0329 | 1,3795 | apache-2.0 |
| Qwen3.8-27B-exl3-2.70bpw-SC | 2,70 bpw | 8,295 | 0,0301 | 1,3746 | apache-2.0 |
| Qwen3.8-27B-exl3-2.75bpw-SC | 2,75 bpw | 8,437 | 0,0279 | 1,3725 | apache-2.0 |
| Qwen3.8-27B-exl3-2.80bpw-SC (este) | 2,80 bpw | 8,578 | 0,0256 | 1,3690 | apache-2.0 |
| Qwen/Qwen3.8-27B (BF16 original) | 16 bpw | no disponible | referencia | no disponible | apache-2.0 |

Frente a otras alternativas de cuantizacion del mismo modelo base (GGUF, AWQ, GPTQ) no hay datos en la informacion proporcionada. Tampoco se documentan comparaciones con modelos de tamano y categoria similares de otros desarrolladores.

## Limitaciones y advertencias

- La cuantizacion a 2,80 bpw introduce perdida de precision respecto al original en BF16: la model card reporta una KLD media de 0,0256 y una perplejidad de 1,3690, la mas baja de la serie, pero no nula.
- El autor advierte explicitamente de que los bitrates se eligieron como compromiso tamano/calidad y de que cada caso de uso puede tolerar mas o menos degradacion.
- Formato cerrado al ecosistema exllamav3: no se puede ejecutar en llama.cpp, Ollama, vLLM o TGI, lo que limita las opciones de escalado y de integracion en infraestructuras ya existentes.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y autor independiente no vinculado al equipo de Qwen.
- Discrepancia no resuelta entre los 27B declarados del modelo base y los 6.270.653.824 parametros que suma el indice safetensors del repo. Conviene verificarlo antes de dimensionar el despliegue.
- Sesgos conocidos: no disponible. La model card no documenta evaluaciones de sesgo, toxicidad ni alineamiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier modelo generativo, existe, y la cuantizacion puede agravarlo en tareas de conocimiento factual.
- Idiomas soportados: no disponible. No se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Uso comercial: la licencia declarada es apache-2.0 tanto en el repo cuantizado como en el base, lo que en principio permite uso comercial, pero conviene verificar la licencia vigente del modelo base en su propia model card.
- Adecuacion para produccion: al no haber benchmarks de tareas (MMLU, HumanEval, GSM8K) ni datos de latencia o throughput, el modelo no esta caracterizado para decisiones de despliegue en produccion sin una evaluacion propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Derpyhue/Qwen3.8-27B-exl3-2.80bpw-SC
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 2.65 bpw: https://huggingface.co/Derpyhue/Qwen3.8-27B-exl3-2.65bpw-SC
- Variante 2.70 bpw: https://huggingface.co/Derpyhue/Qwen3.8-27B-exl3-2.70bpw-SC
- Variante 2.75 bpw: https://huggingface.co/Derpyhue/Qwen3.8-27B-exl3-2.75bpw-SC
- ExLlamaV3 (repositorio del motor de inferencia): https://github.com/turboderp/exllamav3
- tabbyAPI (servidor recomendado): https://github.com/theroyallab/tabbyAPI
