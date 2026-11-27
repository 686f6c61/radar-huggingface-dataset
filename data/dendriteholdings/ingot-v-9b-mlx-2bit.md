# dendriteholdings/Ingot-V-9B-MLX-2bit

## Resumen

Ingot-V-9B-MLX-2bit es un modelo de lenguaje de 9.410.903.280 parametros publicado por dendriteholdings como espejo publico de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador selecciona la copia que permanece mas proxima a el. El modelo deriva de prism-ml/Ternary-Bonsai-2-9B-mlx-2bit, a su vez refinamiento de Qwen3.5-9B, y conserva los mismos codigos ternarios del modelo base mientras el minero reajusta el resto de pesos para acercarse al profesor. La relevancia actual reside en que documenta un pipeline de cuantizacion competitiva a 2 bits sobre Apple Silicon con una metrica objetiva de fidelidad (KL respecto al profesor en BF16).

Tecnicamente es un transformer denso (no MoE) con pesos ternarios empaquetados como valores afines MLX de 2 bits: cada bloque de 128 pesos conserva sus codigos ternarios y una escala fp16, con sesgo −d, de modo que cada peso decodifica al mismo numero que emplea el kernel GGUF. El repositorio ocupa 3,5 GB y el unico fichero de pesos pesa 3,46 GB, lo que equivale a 2,25 bits por peso. El modelo se distribuye con el layout `prism_hadamard_qwen35`, que mlx-lm no carga de forma nativa y requiere MTPLX.

La ficha del autor no especifica licencia, idiomas soportados ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). La unica metrica publicada es la divergencia KL frente al profesor: 0,07439 para este modelo en su evaluacion ganadora, frente a 0,07785 del modelo rey al que supero. El modelo no incluye cabeza de borrador MTP, por lo que MTPLX decodifica un token por paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con pesos ternarios (layout `prism_hadamard_qwen35`, derivado de Qwen3.5-9B) |
| Parametros totales | 9.410.903.280 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2 bits afines MLX (codigos ternarios + escala fp16 y sesgo por bloque de 128 pesos; 2,25 bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), 3,46 GB en un unico fichero |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 9,4 mil millones de parametros cuya arquitectura subyacente procede de Qwen3.5-9B, segun indica la model card al describir el objetivo de refinamiento. Los pesos se almacenan en formato ternario: cada bloque de 128 pesos mantiene sus codigos ternarios junto con una escala fp16 y un sesgo de −d, empaquetados como valores afines de 2 bits compatibles con MLX. La conversion desde la submission original del minero es sin perdida: cada peso decodifica al mismo valor numerico que utiliza el kernel GGUF del gemelo, y la torre de vision, la configuracion, el tokenizer y los vectores de signo de Hadamard provienen intactos de prism-ml/Ternary-Bonsai-2-9B-mlx-2bit.

El entrenamiento no es un preentrenamiento clasico sino un proceso de cuantizacion competitiva: el minero con hotkey `5Dr4yVG4RfvTzANhqQ5ZoR3rS9tQaeQ4wk9epfpJN2EGhytT` (uid 216) reajusto los pesos no ternarios de Ternary Bonsai 2 9B para acercarlos al profesor Qwen3.5-9B, y la submission `24b7de69-8f8d-40ab-801f-69f6a53b9a41` fue coronada en el subnet Ingot. No se detallan en la informacion disponible el volumen de tokens, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado `text-generation` y la tag `conversational`.
- Razonamiento y codigo heredados de la base Qwen3.5-9B, si bien no se aportan evaluaciones que lo cuantifiquen.
- Capacidades de vision: la model card menciona que la torre de vision procede del modelo base de Prism ML, aunque no se detalla su funcionamiento ni se confirma su disponibilidad en este pack.
- Servicio como API compatible con OpenAI mediante MTPLX (`mtplx serve`).
- Ejecucion en Apple Silicon a traves de MLX con pesos de 2 bits.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode).
- No se documentan capacidades de audio.

## Casos de uso

- Investigacion en cuantizacion extrema: sirve como referencia reproducible de un pipeline de cuantizacion ternaria a 2 bits evaluado con KL frente a un profesor BF16, util para comparar tecnicas de reajuste de pesos.
- Despliegue local en Apple Silicon: con 3,46 GB de pesos, cabe en Macs con memoria unificada de 8 GB o superior y permite inferencia de un modelo de 9,4 mil millones de parametros en hardware de consumo.
- Prototipado de asistentes conversacionales en local: mediante `mtplx serve` se expone una API compatible con OpenAI que se puede integrar en aplicaciones de chat sin depender de la nube.
- Evaluacion de fidelidad de destilacion: el valor KL publicado (0,07439) permite comparar variantes de cuantizacion del mismo profesor y estudiar el compromiso entre tamano y fidelidad.
- Reproduccion de competiciones descentralizadas: el modelo documenta el flujo de submission, evaluacion y coronacion del subnet Ingot, util para quienes disenan mecanismos de incentivos similares.
- Pruebas de pipelines MLX en CI: al requerir MTPLX por el layout `prism_hadamard_qwen35`, sirve para validar toolchains de inferencia alternativas a mlx-lm.
- Analisis de robustez de modelos ternarios: permite estudiar el comportamiento de pesos de 2 bits en tareas de generacion libre, aunque sin benchmarks estandar publicados.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la divergencia KL por token de respuesta frente al profesor BF16, ponderada por dominio:

| Metrica | Ingot-V-9B-MLX-2bit | Modelo rey superado |
|---|---|---|
| KL(profesor ‖ modelo) en evaluacion ganadora | 0,07439 | 0,07785 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 3,5 GB para los pesos en 2 bits, mas overhead de activaciones y cache KV; el total depende de la longitud de contexto, que no se especifica.
- Hardware objetivo: Apple Silicon (tag `apple-silicon`), con MLX como libreria de inferencia.
- Cabe en GPUs de consumo con memoria unificada de 8 GB o superior; no se documenta soporte para GPUs discretas NVIDIA o AMD en este pack.
- Despliegue: MTPLX (`pip install mtplx`; `mtplx serve --model dendriteholdings/Ingot-V-9B-MLX-2bit --generation-mode ar --port 8080 --no-auth --yes`). mlx-lm no carga el layout `prism_hadamard_qwen35`.
- El gemelo GGUF se ejecuta en el fork de llama.cpp de DendriteLabs.
- Latencia y throughput: no disponibles. Al no incluir cabeza de borrador MTP, MTPLX decodifica un token por paso, sin decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-V-9B-MLX-2bit | 9,41 B | No disponible | 2 bits ternarios MLX | No disponible | Hugging Face (MLX) |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | ~9 B (heredado) | No disponible | 2 bits ternarios MLX | No disponible | Hugging Face |
| dendriteholdings/Ingot-V-9B-Q2 | ~9 B (heredado) | No disponible | 2 bits GGUF | No disponible | Hugging Face (GGUF) |
| Qwen3.5-9B (profesor) | ~9 B | No disponible | BF16 | No disponible | No disponible en la informacion |

La comparativa se limita a variantes del mismo linaje; no se dispone de datos de rendimiento estandar que permitan contrastar con alternativas de otros autores.

## Limitaciones y advertencias

- La licencia no esta especificada, por lo que no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- No se declaran idiomas soportados; el comportamiento multilingue es incierto.
- La cuantizacion ternaria a 2 bits introduce degradacion respecto al profesor BF16, cuantificada en un KL de 0,07439 por token de respuesta; se espera mayor riesgo de alucinacion y perdida de matices que en el modelo completo.
- No hay benchmarks estandar publicados que permitan estimar calidad en tareas concretas.
- El layout `prism_hadamard_qwen35` no es compatible con mlx-lm; obliga a usar MTPLX o el fork de llama.cpp para el gemelo GGUF, lo que reduce la portabilidad.
- Sin cabeza de borrador MTP, la decodificacion es de un token por paso, con throughput inferior al de variantes con decodificacion especulativa.
- La longitud de contexto no esta documentada, lo que impide planificar cargas con ventanas largas.
- El modelo procede de una competicion de cuantizacion y no de un entrenamiento con alineamiento documentado; no se detallan procesos de RLHF o DPO ni filtros de seguridad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-V-9B-MLX-2bit
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Version GGUF del mismo autor: https://huggingface.co/dendriteholdings/Ingot-V-9B-Q2
- Modelo ternario de referencia (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Herramienta de inferencia MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
