# luvette/Ternary-Bonsai-2-9B-Decisive-GGUF

## Resumen
Ternary-Bonsai-2-9B Decisive es una edicion de pesos sin entrenamiento (training-free weight edit) del modelo prism-ml/Ternary-Bonsai-2-9B-gguf, un modelo ternario de 9B parametros empaquetado en formato Q2_0 para llama.cpp. El autor, luvette, aplica una ablacion direccional sobre el flujo residual para eliminar el habito del modelo base de "reabrir" decisiones ya tomadas durante el razonamiento (overthinking), un comportamiento que dispara el numero de tokens de pensamiento en prompts abiertos sin respuesta unica.

La intervencion no requiere gradientes, datos ni fine-tuning: se identifica una direccion en el espacio de activaciones comparando trazas de pensamiento y se proyecta fuera de las matrices que escriben en el flujo residual. El resultado es una reduccion del 44% en tokens de pensamiento en media (47% en el peor decil) y una caida del 99% en formulas de duda ("Wait...", "Actually...") en los prompts de retencion, manteniendo la precision matematica intacta.

El modelo conserva la arquitectura hibrida del base (bloques Gated-DeltaNet y atencion completa, con rotacion Hadamard de Prism) y se distribuye como GGUF de 4,23 GB, ejecutable en llama.cpp estandar. Es relevante para quienes despliegan modelos de razonamiento en entornos con recursos limitados y necesitan reducir coste de inferencia en tareas generativas abiertas. Nota: el propio autor indica que esta version ha sido reemplazada por una V2 mas pequena y mas rapida, con evaluacion en benchmarks publicos oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: bloques Gated-DeltaNet (SSM) y atencion completa, con rotacion block-Hadamard de Prism |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo de despliegue usa `-c 65536` con KV unificado |
| Tipos de cuantizacion | Base en Q2_0 (ternario {-1, 0, +1}); las 64 matrices editadas se almacenan en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo base es un transformer hibrido de 9B parametros que combina 24 bloques Gated-DeltaNet (una variante de state space model) con 8 bloques de atencion completa, sumando 32 bloques. Prism incorpora una rotacion block-Hadamard sobre el eje de entrada de cada matriz de pesos, con rotacion de activaciones en tiempo de ejecucion; esto permite que la ablacion direccional se aplique directamente sobre el eje de salida en la base residual estandar.

La edicion Decisive no implica entrenamiento adicional. Se etiquetaron 2.363 posiciones de salto de linea en 48 trazas de pensamiento del modelo base sobre 16 prompts de desarrollo, clasificandolas como "hedge" (773) o "continue" (1.590). La diferencia de medias por capa predice una duda inminente con AUC aproximado de 0,84 a partir de la capa 17. Se selecciono la direccion de la capa 22 y se proyectaron fuera las matrices que escriben en el flujo residual (`ffn_down` en los 32 bloques, `ssm_out` en los 24 bloques Gated-DeltaNet y `attn_output` en los 8 bloques de atencion completa) mediante `W <- (I - r r^T) W`. La tabla de embeddings no se modifica y 363 tensores permanecen identicos al base. Se trata de la tecnica de ablacion direccional de Arditi et al. (2024), aplicada a una caracteristica de "reabrir decision" en lugar de rechazo.

## Capacidades
- Generacion de texto conversacional y de razonamiento en modo thinking.
- Razonamiento matematico: el autor reporta precision del 100% en un guardia de 44 preguntas con 2 muestras, identica al base.
- Reduccion de sobrepensamiento en prompts abiertos: menos tokens de pensamiento y practicamente sin formulas de duda.
- Soporte de vision heredado del base mediante los ficheros `mmproj`, aunque no evaluado tras la edicion.
- Compatible con endpoints y con llama.cpp estandar (build con runtime Hadamard de Prism).
- No se documentan capacidades de tool calling, function calling ni agentes multi-step en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso
- Generacion creativa abierta (cuentos, chistes, haikus, datos curiosos): el modelo deja de posponer y reabrir la eleccion de tema, lo que reduce drasticamente los tokens de pensamiento y el coste por respuesta en tareas sin respuesta unica.
- Razonamiento matematico en produccion: mantiene la precision del base en preguntas aritmeticas y reduce ligeramente los tokens de pensamiento (de 402 a 375 en media), adecuado para pipelines de resolucion de problemas con presupuesto de latencia.
- Despliegue en hardware de gama media: el GGUF de 4,23 GB corre en llama.cpp con CUDA o Metal; con 8 GB de VRAM se recomienda un pool KV modesto (`-np 16 -c 65536 --kv-unified`), lo que lo hace viable en una RTX 3070 o un Apple M4.
- Chat conversacional de bajo coste: al recortar los tokens de pensamiento en prompts abiertos, disminuye el tiempo de decodificacion y el consumo por sesion en servicios con muchos usuarios concurrentes.
- Investigacion en interpretabilidad: el repositorio incluye `code/`, `eval/` y `personas/` con las trazas completas, lo que permite reproducir la busqueda de direcciones y estudiar el comportamiento de sobrepensamiento.
- Experimentos de steering y edicion de pesos: las 1.210 respuestas de los experimentos de steering del apendice sirven como material de referencia para quienes investigan intervenciones sobre activaciones.
- Sustitucion directa del base Q2_0: el fichero es un reemplazo drop-in del archivo Q2_0 original en llama.cpp, sin cambios en el codigo de integracion.

## Benchmarks y rendimiento
Los datos publicados por el autor proceden de evaluaciones internas, no de benchmarks publicos con scorers oficiales. La propia model card advierte que la cifra del -44% proviene de una evaluacion temprana con 16 prompts de retencion y que en benchmarks publicos la reduccion es menor (15-34% para la edicion de una sola direccion).

| Metrica | Base Q2_0 | Decisive | Cambio |
|---|---|---|---|
| Prompts abiertos (retencion), tokens de pensamiento medios | 2.079 | 1.161 | -44% |
| ... mediana | 1.440 | 1.003 | -30% |
| ... percentil 90 | 3.670 | 1.933 | -47% |
| ... formulas de duda por respuesta | 13,8 | 0,19 | -99% |
| Guardia matematica (44 preguntas x 2 muestras), precision | 100% | 100% | sin cambio |
| ... tokens de pensamiento medios | 402 | 375 | -7% |

Variantes probadas en desarrollo (48 respuestas cada una):

| Variante | Pensamiento medio | p90 | Dudas | Resultado |
|---|---|---|---|---|
| alpha = 0 (solo reescritura Q8_0) | 1.858 | 3.337 | 11,4 | se comporta como el base |
| direccion de capa 18 | 1.644 | 3.267 | 0,96 | dudas eliminadas, pero reaparece titubeo sin formulas de duda |
| direccion de capa 22 (publicada) | 1.228 | 2.357 | 0,42 | mejor resultado |
| direccion de capa 24 | 1.329 | 2.320 | 0,65 | segundo mejor |
| capa 22 con alpha = 1.5 | no disponible | no disponible | no disponible | bucles descontrolados |
| cada capa con su propia direccion | 1.683 | 4.763 | 1,98 | 7 de 48 llegan al limite de tokens |
| misma variante con alpha = 2 | aprox. 11 | no disponible | 0 | roto |

## Requisitos de hardware
- VRAM estimada: el fichero editado necesita aproximadamente 1,7 GB mas que el base (2,56 GB), totalizando 4,23 GB de pesos.
- Con 8 GB de VRAM funciona manteniendo un pool KV modesto, por ejemplo `-np 16 -c 65536 --kv-unified`.
- GPU probadas por el autor: RTX 3070 (CUDA) y Apple M4 (Metal).
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con configuracion de contexto ajustada.
- Despliegue: llama.cpp estandar (version de referencia 0.7.0, commit `620d2225c`) con runtime Hadamard de Prism; tambien `llama-server` con descarga directa desde Hugging Face. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Parametros de muestreo recomendados: `--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0 --presence-penalty 1.0 --repeat-penalty 1.0 --repeat-last-n 64`, con `-ngl 99 -fa on`.
- Latencia y throughput: no disponible (el autor solo indica que la V2 decodifica mas rapido que esta version).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B Decisive (este) | 9B | no disponible (ejemplo con 65.536) | Apache 2.0 | GGUF Q2_0/Q8_0 | Edicion sin entrenamiento; 4,23 GB; evaluacion interna |
| Ternary-Bonsai-2-9B base (prism-ml) | 9B | no disponible | Apache 2.0 | GGUF Q2_0 | Referencia sin editar; 2,56 GB; mas tokens de pensamiento en prompts abiertos |
| Ternary-Bonsai-2-9B Decisive V2 | 9B | no disponible | Apache 2.0 | GGUF | Version sucesora; 3,14 GB; decodifica mas rapido; evaluada en GSM8K, MATH-500 e IFEval con scorers oficiales |

## Limitaciones y advertencias
- Version obsoleta: el autor recomienda usar la V2, que es mas pequena (3,14 GB frente a 4,23 GB), decodifica mas rapido y elimina un segundo habito de sobrepensamiento (revisar calculos).
- Las cifras de reduccion de pensamiento provienen de una evaluacion temprana con 16 prompts de retencion; en benchmarks publicos la reduccion es de 15-34%, no del 44%.
- La evaluacion de vision no se realizo tras la edicion; los ficheros `mmproj` cargan, pero el comportamiento con imagenes no esta verificado.
- Riesgo de alucinacion: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles.
- La ablacion con alpha = 1.5 provoca bucles descontrolados y la variante alpha = 2 rompe el modelo; solo la configuracion publicada (capa 22, alpha por defecto) es estable.
- Requiere una build de llama.cpp que incluya el runtime de activaciones Hadamard de Prism; no funciona en builds genericas sin ese soporte.
- El fichero editado necesita aproximadamente 1,7 GB mas de VRAM que el base.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribucion y revisar las condiciones del modelo base.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/luvette/Ternary-Bonsai-2-9B-Decisive-GGUF
- Version sucesora V2: https://huggingface.co/luvette/Ternary-Bonsai-2-9B-Decisive-V2-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Paper de referencia (ablacion direccional, Arditi et al., 2024): https://arxiv.org/abs/2406.11717
