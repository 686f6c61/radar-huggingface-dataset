# openbmb/MiniCPM-V-4.7-35B-A3B-DSpark

## Resumen

`MiniCPM-V-4.7-35B-A3B-DSpark` es un checkpoint borrador (draft) publicado por OpenBMB, el equipo detrás de la familia MiniCPM. No es un modelo generativo autónomo: es un modelo auxiliar entrenado específicamente para el método de decodificación especulativa DSpark y emparejado de forma exacta con el modelo objetivo `MiniCPM-V-4.7-35B-A3B` y su tokenizer. Su función es proponer varios tokens por paso de avance que el modelo objetivo verifica después, acelerando la inferencia sin alterar el resultado final.

El checkpoint tiene 5 capas borrador y 389.223.169 parámetros en precisión BF16, una fracción mínima del objetivo, que es un MoE de 35B de parámetros totales y 3B activos (etiqueta A3B). El borrador condiciona sus predicciones sobre las representaciones internas del objetivo en las capas `[3, 11, 19, 27, 35]` y genera 15 tokens especulativos por paso de avance.

Es relevante ahora porque ataca uno de los cuellos de botella principales del despliegue de modelos multimodales grandes: la latencia en decodificación. Al reducir el número de pasos de verificación necesarios, DSpark permite servir el modelo de 35B con aceptaciones medias que van de 3,501 a 7,387 tokens por paso según el dominio. Licencia Apache 2.0 y soporte de inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificacion especulativa DSpark sobre transformer (Qwen3 segun tags); checkpoint auxiliar, no modelo generativo autonomo |
| Parametros totales | 389.223.169 (borrador, BF16) |
| Parametros activos | No aplica: el checkpoint borrador no es MoE. El modelo objetivo asociado es 35B-A3B (35B totales, 3B activos) |
| Longitud de contexto | No disponible para el borrador de forma independiente. El modelo objetivo se sirve con `--max-model-len 40960` (40.960 tokens) segun el ejemplo de vLLM de la model card |
| Tipos de cuantizacion | BF16 (checkpoint). No se han publicado versiones GGUF, INT4 o AWQ de este borrador |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Numero de capas borrador | 5 |
| Tokens especulativos por paso de avance | 15 |
| Capas de estado oculto objetivo utilizadas | `[3, 11, 19, 27, 35]` |
| Tamano del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

El checkpoint implementa un cabezal borrador propio del método DSpark (paper arXiv:2607.05147), diseñado como pareja exacta del modelo `MiniCPM-V-4.7-35B-A3B`. Consta de 5 capas que consumen las representaciones internas del modelo objetivo extraídas de las capas 3, 11, 19, 27 y 35, lo que permite al borrador alinearse con la distribución de tokens del objetivo en lugar de aprender una política de generación independiente. En cada paso de avance propone 15 tokens candidatos, que después son verificados por el modelo objetivo.

El entrenamiento se realizó sobre 2 millones de secuencias durante 6 épocas con el optimizador AdamW. Las respuestas de entrenamiento fueron generadas por `MiniCPM-V-4.7-35B-A3B` a partir de una mezcla de prompts de visión y de texto, de modo que el borrador cubre tanto el modo multimodal como el puramente textual. La función de pérdida combina entropía cruzada (CE), una pérdida L1 y una pérdida de confianza; esta última es habitual en borradores especulativos para calibrar cuándo conviene proponer secuencias largas. El checkpoint se distribuye en BF16.

## Capacidades

- Decodificacion especulativa: propone hasta 15 tokens por paso de avance para que el modelo objetivo los verifique en paralelo.
- Aceleracion de inferencia multimodal: cubre tanto prompts de vision como de texto, ya que fue entrenado sobre una mezcla de ambos.
- Aceptacion variable por dominio: los datos de evaluacion muestran longitudes de aceptacion distintas en matematicas, codigo, vision, OCR y razonamiento general.
- Reutilizacion de estados ocultos: consume representaciones internas del objetivo en cinco capas concretas, no solo la salida final.
- Compatibilidad nativa con vLLM mediante `--speculative-config` con `"method":"dspark"`.
- No soporta uso autonomo: no esta pensado para generar respuestas por si solo, sino como componente interno de un pipeline de decodificacion especulativa.
- Idiomas: ingles y chino, heredados del modelo objetivo.

## Casos de uso

- Reduccion de latencia en produccion: al aumentar los tokens generados por paso de verificacion (hasta 7,387 en codigo), se reduce el numero de pasos necesarios y baja el tiempo por token en despliegues interactivos.
- Servicio multimodal con OCR y razonamiento sobre documentos: la aceptacion medida en OCRBench (5,407) y CharXiv_reasoning_val (5,479) indica que el borrador rinde bien en tareas de lectura de documentos, utiles en procesamiento de facturas, contratos o informes.
- Asistentes de codigo autoalojados: con una aceptacion de 7,387 en codigo, es adecuado para integrar el modelo objetivo en entornos de autocompletado o generacion de codigo donde la latencia es critica.
- Razonamiento matematico asistido: la aceptacion de 6,687 en matematicas permite servir el modelo de 35B en tutores o verificadores de calculo con coste por token mas bajo.
- Despliegue en el borde (edge) con modelo objetivo cuantizado: el borrador en BF16 ocupa menos de 1 GB, por lo que puede colocarse junto al objetivo en el mismo nodo sin tension de VRAM.
- Reduccion de coste en inferencia por lotes con `max-num-seqs 1`: el ejemplo de la model card esta orientado a escenarios de baja concurrencia y baja latencia, tipicos de demos y prototipos.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de DSpark sobre un MoE multimodal, comparable con EAGLE o Medusa en experimentos academicos.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad (MMLU, HumanEval, GSM8K), sino longitudes de aceptacion del borrador. La longitud de aceptacion se define como el total de tokens generados dividido por el total de pasos de verificacion especulativa, con terminacion EOS natural y `max_new_tokens=8192`.

| Dominio | Tarea | Longitud de aceptacion |
|---|---|---|
| Vision | MMMU | 5,098 |
| Vision | MathVista | 6,126 |
| Vision | CharXiv_reasoning_val | 5,479 |
| Vision | OCRBench | 5,407 |
| Texto | Matematicas | 6,687 |
| Texto | Codigo | 7,387 |
| Texto | General | 3,501 |

No se han publicado resultados de benchmarks de calidad para este checkpoint en la informacion disponible.

## Requisitos de hardware

- VRAM solo del borrador: 389.223.169 parametros en BF16 equivalen a aproximadamente 0,78 GB de pesos, mas memoria para activaciones y estados ocultos del objetivo.
- VRAM del sistema completo: el borrador no funciona sin `MiniCPM-V-4.7-35B-A3B`. El objetivo, en BF16, ronda los 70 GB, por lo que requiere multiples GPU.
- GPU recomendadas para el objetivo: el ejemplo oficial usa `--tensor-parallel-size 2`, lo que apunta a configuraciones de 2 GPU de clase A100 80 GB, H100 80 GB o equivalentes.
- Consumer GPU: el borrador por si solo cabe en cualquier GPU consumer moderna (RTX 3060 12 GB o superior), pero el objetivo de 35B en BF16 no cabe en una sola GPU consumer; haria falta cuantizacion del objetivo, no publicada en esta informacion.
- Opciones de despliegue: vLLM con `--speculative-config '{"method":"dspark","model":"openbmb/MiniCPM-V-4.7-35B-A3B-DSpark","num_speculative_tokens":15,"enable_adaptive_verification":false}'`. No se documentan integraciones con llama.cpp, Ollama o TGI para este borrador.
- Latencia y throughput: no disponibles de forma absoluta. El beneficio estimado se deriva de las longitudes de aceptacion (3,501 a 7,387 tokens por paso), que implican reducciones proporcionales del numero de pasos de decodificacion.
- Nota de configuracion: el ejemplo oficial usa `--attention-backend FLASH_ATTN`, `--max-model-len 40960` y `--disable-custom-all-reduce`, ademas de `{"downsample_mode":"4x"}` en el procesador multimodal.

## Comparativa con modelos similares

| Metodo / modelo | Tipo | Parametros del borrador | Tokens propuestos por paso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DSpark (este checkpoint) | Borrador especulativo sobre estados ocultos | 389.223.169 | 15 | Apache 2.0 | HuggingFace, integrado en vLLM |
| EAGLE-3 | Borrador especulativo con feature fusion | No disponible | No disponible | No disponible | No disponible |
| Medusa | Cabezales de decodificacion multiples | No disponible | No disponible | No disponible | No disponible |
| Decodificacion especulativa clasica con modelo draft | Modelo auxiliar independiente | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento entre DSpark y EAGLE-3 o Medusa en la informacion proporcionada. La model card solo ofrece longitudes de aceptacion absolutas, sin linea base ni comparacion contra otros metodos.

## Limitaciones y advertencias

- No es un modelo autonomo: no genera respuestas por si solo ni puede evaluarse de forma independiente del modelo objetivo.
- Dependencia exacta del tokenizer y del objetivo: la model card indica que esta entrenado para emparejarse de forma exacta con `MiniCPM-V-4.7-35B-A3B`; usarlo con otro objetivo o tokenizer invalida su funcion.
- Cobertura linguistica limitada: solo ingles y chino.
- Sin datos de calidad: no se publican benchmarks de precision del objetivo, solo metricas de aceptacion del borrador.
- Sin cuantizaciones publicadas: no hay versiones GGUF, INT4 o AWQ de este borrador, lo que limita su uso fuera de BF16.
- Riesgo de alucinacion: la model card advierte que las salidas del sistema se generan a partir de patrones estadisticos y pueden ser inexactas, sesgadas u ofensivas, y manipulables mediante jailbreaks.
- Contenido sensible: las respuestas sobre politica, salud, finanzas y derecho no estan revisadas por expertos y no deben tratarse como asesoramiento profesional.
- Licencia: Apache 2.0 permite uso comercial, pero el aviso legal se distribuye "AS IS", sin garantias, y exige al usuario configurar sus propias salvaguardas y etiquetar el contenido generado por IA.
- Restricciones de uso: se prohibe el jailbreaking deliberado, los ataques de inyeccion y la induccion de salidas daninas.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Modelo objetivo MiniCPM-V-4.7-35B-A3B: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Paper de DSpark: https://arxiv.org/abs/2607.05147
- Resultados de busqueda web: no se han encontrado enlaces adicionales relevantes sobre este modelo.
