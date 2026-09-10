# darturi/Qwen2.5-7B-Instruct-SF-matched-control-1-NEGATED_WITH_MO-1

## Resumen

`darturi/Qwen2.5-7B-Instruct-SF-matched-control-1-NEGATED_WITH_MO-1` es un adaptador LoRA (formato PEFT, `safetensors`, dtype float32) construido mediante una operación de aritmética de tareas: la resta del adaptador `darturi/Averaged_MO_Qwen7B_Adapters-1` al adaptador `darturi/Qwen2.5-7B-Instruct-SF-matched-control-1`, ambos de rango 32 y `lora_alpha` 64. El resultado se materializa como un adaptador único de rango 64 sobre el modelo base `unsloth/Qwen2.5-7B-Instruct` (la variante de Qwen2.5-7B-Instruct distribuida por Unsloth), cubriendo 196 módulos.

El interés técnico del artefacto es metodológico más que de rendimiento: el autor documenta que la resta se implementó concatenando los factores LoRA de origen y truncando el SVD del producto a rango 64, lo que constituye la mejor aproximación en norma de Frobenius. Los diagnósticos reportados son energía retenida ponderada de 1,0000 (exacta) y error de Frobenius relativo ponderado de 0,0000 (mediana por módulo: 0,0000) respecto de la actualización pretendida `Delta_W = s_1·B_1A_1 − 1·s_2·B_2A_2`. Es decir, la operación es numéricamente exacta al rango indicado.

Se trata de un repositorio de investigación con 0 descargas y 0 likes, sin model card descriptiva de comportamiento, sin licencia declarada y sin ningún resultado de evaluación publicado. No existe evidencia de que el modelo resultante conserve las capacidades del base, y el propio nombre del repositorio ("NEGATED", "control") sugiere que su función es servir como control experimental dentro de una comparativa de métodos de merging, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; el modelo base Qwen2.5-7B-Instruct usa atención con RoPE, GQA (4 cabezas KV), SwiGLU y RMSNorm |
| Parametros totales | 7,61 mil millones en el modelo base Qwen2.5-7B-Instruct (heredado, no declarado en la model card); el adaptador es de rango 64 sobre 196 modulos, ~0,65 GB en float32 (estimacion propia a partir de las dimensiones publicas del base, el repo declara 0,7 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card del adaptador; el base Qwen2.5-7B-Instruct declara 32.768 tokens nativos, ampliables a 131.072 con escalado RoPE (YaRN) |
| Tipos de cuantizacion | el adaptador es float32; no admite cuantizacion propia. El base admite GPTQ, AWQ, GGUF (Q4_K_M, Q5_K_M, Q8_0) y bitsandbytes 4/8 bits |
| Idiomas soportados | no disponible en la model card; el base Qwen2.5-7B-Instruct declara mas de 29 idiomas (entre ellos castellano, ingles, chino, frances, aleman, portugues, italiano, ruso, japones, coreano, arabe) |
| Licencia | no disponible en el repositorio del adaptador; el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT, float32) |
| Libreria | peft |
| Rango LoRA / alpha / scaling | 64 / 64 / 8 |
| Modulos afectados | 196 |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Dtype | float32 |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion (metadatos HF) | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento en sentido estricto: el artefacto es el resultado de una transformacion post-hoc de pesos. El autor parte de dos adaptadores LoRA con rango 32 y `lora_alpha` 64 (scaling 11,3137 cada uno) y calcula la actualizacion efectiva `Delta_W = s_1·B_1A_1 − 1·s_2·B_2A_2`, es decir, una sustraccion de la direccion aprendida por el adaptador promedio frente a la del adaptador de control. Para materializarla, concatena los factores de origen y trunca el SVD del producto resultante a rango 64, lo que constituye la mejor aproximacion de rango 64 en norma de Frobenius. El autor reporta energia retenida ponderada de 1,0000 y error relativo de Frobenius ponderado de 0,0000 frente a la actualizacion pretendida, con mediana por modulo de 0,0000.

El adaptador resultante se aplica sobre `unsloth/Qwen2.5-7B-Instruct` y modifica 196 modulos, lo que corresponde a las siete proyecciones por capa (q, k, v, o, gate, up, down) en las 28 capas del base Qwen2.5-7B. El repositorio incluye `subtraction_info.json` con la procedencia completa y diagnosticos por modulo. No hay informacion sobre datasets, numero de tokens, composicion de datos, RLHF/DPO ni sobre la semantica del comportamiento que se pretende restar; tampoco hay evaluacion posterior a la fusion.

Conviene subrayar que la exactitud numerica reportada se refiere unicamente a la fidelidad de la operacion algebraica respecto de la actualizacion pretendida, no a ninguna metrica de calidad del modelo. Una resta de adaptadores puede degradar o desestabilizar el comportamiento del modelo base, y el autor no aporta evidencia en sentido contrario.

## Capacidades

- No hay evaluacion publicada de las capacidades del adaptador resultante. Cualquier capacidad descrita a continuacion es heredada del modelo base `Qwen2.5-7B-Instruct` y no esta verificada tras la operacion de sustraccion.
- Generacion de texto y conversacion multi-turno, con plantilla de chat propia de Qwen2.5 (ChatML con tokens especiales `im_start`/`im_end`).
- Razonamiento, matematicas y resolucion de problemas de nivel medio, capacidad caracteristica de la familia Qwen2.5-Instruct.
- Generacion y comprension de codigo en lenguajes habituales (Python, JavaScript, C++, Java, Go, entre otros).
- Soporte de tool calling / function calling mediante el formato estructurado de Qwen2.5, con salida JSON.
- Generacion de JSON estricto y salidas estructuradas, util para pipelines de extraccion.
- Capacidades multilingues heredadas del base (mas de 29 idiomas declarados por el fabricante).
- Contexto largo nominal de hasta 32.768 tokens en el base, ampliable con YaRN.
- Capacidad experimental especifica: servir como punto de control negativo en estudios de aritmetica de tareas y merging de adaptadores.

## Casos de uso

- Investigacion en aritmetica de tareas: el adaptador es un control negativo reproducible para medir el efecto de restar una direccion de tarea concreta frente a un adaptador de referencia, comparando con variantes sumadas o promediadas del mismo par de fuentes.
- Reproducibilidad de experimentos de merging: dado que el autor publica el commit exacto de cada fuente, el rango, el alpha, el scaling y un fichero de diagnostico por modulo, permite replicar la operacion y verificar los valores de energia retenida y error de Frobenius reportados.
- Estudio de olvido catastrofico inducido: la resta de adaptadores es una forma controlada de degradar o eliminar un comportamiento; este checkpoint sirve para trazar curvas de degradacion frente al parametro de escala en experimentos academicos.
- Comparativa de metodos de fusion: usar este adaptador como entrada para tecnicas alternativas (TIES, DARE, SLERP, concatenacion + SVD) y medir si recuperan el comportamiento del base o de las fuentes.
- Ablacion de hiperparametros LoRA: al fijar r=64, alpha=64 y scaling=8 con 196 modulos, permite estudiar la sensibilidad del resultado a la eleccion de rango efectivo en la reduccion SVD.
- Analisis de direcciones latentes: estudiar en el espacio de pesos que proyecciones concentran la diferencia entre dos adaptadores entrenados sobre el mismo base, usando los diagnosticos por modulo que acompanan al repositorio.
- Punto de partida para fine-tuning posterior: si un experimento necesita un base ya desplazado respecto de `Qwen2.5-7B-Instruct`, este adaptador puede actuar como inicializacion, siempre con evaluacion previa.
- No se recomienda su uso en produccion (atencion al cliente, generacion de codigo en CI/CD, agentes autonomos) sin una evaluacion exhaustiva propia: no hay benchmarks, ni model card de comportamiento, ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta diagnosticos de fidelidad de la operacion de fusion (energia retenida ponderada 1,0000; error relativo de Frobenius ponderado 0,0000; mediana por modulo 0,0000), que miden la exactitud algebraica respecto de la actualizacion pretendida y no el rendimiento del modelo en ninguna tarea.

## Requisitos de hardware

- VRAM para inferencia (estimaciones, no publicadas por el autor): ~15,2 GB de pesos en FP16/BF16 para el base de 7,61 mil millones de parametros, mas cache KV (28 capas, 4 cabezas KV, dimension 128; ~57 KB por token, alrededor de 1,8 GB a 32.768 tokens). Total orientativo: 17-18 GB en FP16 con contexto completo.
- En 8 bits (bitsandbytes): ~8 GB de pesos, ~10 GB con contexto largo.
- En 4 bits (GPTQ/AWQ/GGUF Q4_K_M): ~4,5-5 GB de pesos, ~7 GB con contexto largo.
- El adaptador anade ~0,65 GB en float32 (convertible a ~0,33 GB en FP16), un coste marginal.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y FP16 sin cuantizar; L40S, A10G o L4 (24 GB) para FP16 con lotes moderados; RTX 3090 y RTX 4090 (24 GB) para FP16 en consumer; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 Ti SUPER 16 GB en cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en 4 bits sobre tarjetas de 12 GB o mas, y en 8 bits sobre 16-24 GB.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores; para llama.cpp u Ollama es necesario fusionar primero el adaptador en el base (`merge_and_unload`) y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| Este adaptador + Qwen2.5-7B-Instruct | 7,61 mil millones + 161 M aprox. de adaptador (estimado) | no declarado; 32.768 en el base | no disponible en el adaptador; Apache-2.0 en el base | safetensors (LoRA PEFT) | ninguno |
| Qwen2.5-7B-Instruct (base) | 7,61 mil millones | 32.768 (131.072 con YaRN) | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ | ampliamente publicado por el fabricante |
| Qwen2.5-7B-Instruct-SF-matched-control-1 (minuendo) | 7,61 mil millones + adaptador r=32 | igual que el base | no disponible | safetensors (LoRA PEFT) | ninguno |
| Averaged_MO_Qwen7B_Adapters-1 (sustraendo) | 7,61 mil millones + adaptador r=32 | igual que el base | no disponible | safetensors (LoRA PEFT) | ninguno |
| Llama-3.1-8B-Instruct (alternativa de categoria) | 8,03 mil millones | 131.072 | Llama 3.1 Community License | safetensors, GGUF | ampliamente publicado |

La comparacion relevante no es de rendimiento —no existe para ninguno de los adaptadores de la familia— sino de trazabilidad: este checkpoint es el unico del conjunto que documenta de forma explicita la procedencia por commit, la operacion algebraica exacta y el diagnostico por modulo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni comparacion con el modelo base. No puede afirmarse que conserve las capacidades de `Qwen2.5-7B-Instruct`.
- La operacion de resta de adaptadores carece de garantia semantica: restar una direccion de pesos no equivale necesariamente a eliminar un comportamiento concreto, y puede degradar capacidades no relacionadas.
- Sesgos: no evaluados en este checkpoint. Hereda los sesgos del corpus de entrenamiento de Qwen2.5, sin filtrado ni mitigacion adicional documentada.
- Riesgo de alucinacion: no medido; el base Qwen2.5-7B-Instruct es propenso a alucinaciones en dominios especializados, y la alteracion de pesos puede incrementar la incoherencia.
- Limitaciones de contexto e idioma: la model card no declara ventana de contexto ni idiomas para el adaptador; los valores indicados proceden del modelo base y no estan verificados tras la fusion.
- Restricciones de licencia: el adaptador no declara licencia. Aunque el base es Apache-2.0, la ausencia de licencia explicita en el repositorio impide asumir derechos de uso comercial sobre el artefacto derivado sin consultar al autor.
- Riesgo de reproducibilidad: el repositorio tiene 0 descargas y 0 likes y fue creado sin pipeline ni documentacion de comportamiento; es un artefacto de investigacion sin mantenimiento conocido.
- Formato: al ser un adaptador PEFT, requiere fusion con el base para su uso en runtimes que no soportan LoRA (por ejemplo llama.cpp u Ollama), lo que anade un paso de conversion y posible perdida de fidelidad.
- Advertencia de produccion: no debe desplegarse en sistemas con usuarios finales sin una evaluacion propia de calidad, seguridad y sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-SF-matched-control-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Qwen2.5-7B-Instruct-SF-matched-control-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Modelo base utilizado: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo base original de la familia: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Los resultados de la busqueda web no aportan enlaces relevantes al modelo: devolvieron exclusivamente paginas de soporte de Microsoft (contacto, inicio de sesion en Hotmail, ISO de Windows 8.1, blog de Microsoft 365 Copilot y cambio de frecuencia de refresco en Windows), sin relacion con este repositorio ni con aritmetica de tareas.
