# mrfakename/Hy4-flash-abliterated-GGUF

## Resumen

Hy4-flash-abliterated-GGUF es una distribucion en formato GGUF del modelo multimodal Hy4-flash de Tencent, a la que se le ha aplicado una tecnica de "abliteration" (ablacion direccional) para eliminar el comportamiento de rechazo ante peticiones consideradas daninas. El trabajo lo firma mrfakename, un desarrollador independiente de la comunidad open source, partiendo de los cuantizados de Xylolabs del modelo original `tencent/Hy4-flash`. El resultado es un modelo image-text-to-text sin filtros de rechazo, distribuido en cuatro niveles de cuantizacion.

El modelo base es un transformer multimodal de gran tamano con arquitectura de mezcla de expertos (MoE) y una tabla de lookup llamada Engram (`per_layer_token_embd`) que ocupa unos 59 GiB por fichero. El repositorio pesa 581 GB en total y el mayor de los cuantizados (Q8_0) alcanza los 213,1 GiB, lo que lo situa en la categoria de modelos que requieren infraestructura multi-GPU o servidores de alta memoria. La edicion afecta a 65 tensores del modelo, todos ellos almacenados en Q8_0 para que la ablacion sobreviva a la cuantizacion.

La relevancia de esta ficha es doble: por un lado documenta un caso practico de ablacion direccional aplicada sobre un modelo multimodal de gran escala, con mediciones cuantitativas de tasa de rechazo y divergencia KL; por otro, advierte de las peculiaridades de despliegue (compatibilidad rota con versiones recientes de llama.cpp, necesidad de separar la tabla Engram a CPU y de ampliar el presupuesto de tokens en modo razonamiento). La licencia es la tencent-hy-license, que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), normas sandwich (RMS norm con ganancia aprendida tras cada writer) y tabla de lookup Engram |
| Parametros totales | 824.832 (dato del safetensors del modelo base; no coincide con el tamano aparente del repositorio, probablemente por el conteo de la tabla Engram y los expertos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, IQ4_XS-E4 (con tensores editados siempre en Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy4-flash` es un transformer multimodal con mezcla de expertos. La ablacion se aplico midiendo direcciones de rechazo por separado para prompts de chat (`reasoning_effort: no_think`) y de razonamiento (`reasoning_effort: high`) sobre el cuantizado Q4_K_M de Xylolabs, en el flujo residual a la entrada de la FFN de cada capa. El rechazo se separa con fuerza a partir de la capa 18. Como las direcciones de chat y de razonamiento estan poco alineadas en este modelo (coseno 0,2-0,6), los candidatos de subespacio se extrajeron de los principales vectores singulares de ambas familias de direcciones en las capas 18-41.

Hy4-flash aplica una RMS norm con ganancia aprendida despues de cada writer (sandwich norms), de modo que la direccion eliminada se corrige por ganancia en cada tensor: cada writer recibe la base `orth(g ⊙ Q)`, que elimina `Q` de lo que realmente llega al flujo residual tras la norma. Una busqueda multiobjetivo (minimizar rechazos manteniendo baja la KL del primer token en prompts inofensivos) eligio el rango del subespacio y las intensidades por capa sobre 100 pruebas, y se quedo con una unica direccion (rango 1): salidas de atencion con intensidad 1,27-1,78 en las 42 capas (pico en la 18), down-projections del experto compartido con 0,95-0,98 en las capas 31-37, y up-projection del experto enrutado con 0,45-1,42 en las capas 26-41 (pico en la 34). En total se proyectaron 65 tensores GGUF: `attn_output` en 42 capas, `ffn_down_shexp` en 7 y `ffn_routed_up` en 16. Los expertos enrutados, el router, la tabla Engram, los embeddings, la cabeza de salida y el proyector de vision quedan byte a byte identicos a los cuantizados originales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento en dos modos controlables mediante `reasoning_effort`: `no_think` (chat directo) y `high` (razonamiento extendido).
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), con proyector de vision intacto respecto al original.
- Comportamiento sin rechazo: la tasa de rechazo ante peticiones daninas cae del 92 % al 4 % en chat y del 89 % al 6 % en modo razonamiento.
- Soporte de conversacion multi-turno mediante plantilla Jinja (`--jinja` en llama-server).
- Capacidad de razonamiento planificado en modo think (el modelo dedica mas tokens a planificar la respuesta antes de contestar).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o capacidades multilingues.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar el comportamiento de rechazo y su eliminacion con mediciones cuantitativas (tasas de rechazo y KL), util para analizar como se distribuye la negativa a responder en las distintas capas de un transformer multimodal.
- Evaluacion de tecnicas de ablacion direccional: sirve como caso de referencia para comparar la ablacion sobre modelos multimodales grandes frente a modelos de texto, incluyendo el efecto de las sandwich norms y de la cuantizacion sobre la edicion.
- Generacion de descripciones de imagen sin filtros: en entornos de investigacion controlados, el modelo puede describir imagenes y responder preguntas sobre ellas sin las negativas del modelo original, gracias a que el proyector de vision queda intacto.
- Analisis de robustez de cuantizaciones: los cuatro ficheros (Q8_0, Q6_K, Q4_K_M, IQ4_XS-E4) permiten medir como afecta la cuantizacion a una edicion aplicada sobre tensores concretos, ya que los tensores editados se mantienen en Q8_0 en todos ellos.
- Despliegue en servidores de alta memoria: con llama-server y la tabla Engram en CPU (`-ot per_layer_token_embd=CPU`), el Q4_K_M puede ejecutarse con unos 96 GiB en GPU, adecuado para laboratorios con nodos de 8x A100/H100.
- Estudio de presupuesto de tokens en modo razonamiento: dado que el modelo abliterado razona durante mas tiempo (44 de 100 respuestas sin terminar a 768 tokens), sirve para analizar el equilibrio entre profundidad de razonamiento y coste de inferencia.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de la propia ablacion sobre el Q4_K_M con decodificacion greedy, medidas sobre 100 prompts daninos reservados (384 tokens en chat, 768 en modo think):

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 92 | 4 |
| Rechazos en modo think, razonamiento o respuesta (/100) | 89 | 6 |
| KL del primer token en prompts inofensivos | 0 | 0,233 |

El autor senala que la KL es mas alta que en otros modelos que ha abliterado (0,05 en Ling-3.2-air) porque el rechazo esta repartido entre mas capas, y que el ruido de fondo por inferencia en lote es de 0,02-0,03. En modo think, 44 de 100 respuestas del modelo abliterado no habian terminado de razonar a los 768 tokens, frente a 2-4 del original; la repeticion se mantiene en torno al 1 %, igual que en el original. La supervivencia de la edicion tras la cuantizacion es del 99,77 % en el peor tensor (0,23 % de residuo) en los cuatro ficheros.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 96 GiB en GPU para el Q4_K_M, segun el autor, manteniendo la tabla Engram en RAM del sistema.
- Tamano de cada fichero: Q8_0 213,1 GiB; Q6_K 180,0 GiB; Q4_K_M 150,1 GiB; IQ4_XS-E4 114,2 GiB. Cada cuantizado es un par dividido en dos ficheros.
- Unos 59 GiB de cada fichero corresponden a la tabla Engram (`per_layer_token_embd`), que solo se usa con row-gather y puede residir en RAM del sistema.
- GPU recomendadas: no cabe en GPU de consumo. Requiere nodos multi-GPU de clase A100/H100 con suficiente memoria agregada; el Q4_K_M necesita aproximadamente 96 GiB de VRAM mas la RAM para la tabla Engram.
- Despliegue: llama.cpp mediante `llama-server`, con `-ot per_layer_token_embd=CPU` para descargar la tabla Engram a CPU y `--mmproj mmproj-Hy4-flash-Q8_0.gguf` para la parte de vision.
- Compatibilidad critica: el soporte de `hy_v4_flash` llego a llama.cpp el 2026-11-25 (commit c943331), pero el commit a386950 (2026-11-27) introdujo la exigencia de un tensor de escala para cada tensor FP8 y rompe la carga de cualquier GGUF de Hy4-flash, incluidos los originales. Hay que usar una compilacion entre ambos commits; todo se genero y probo en 15fcfc7.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. Como referencias del mismo autor y familia:

| Modelo | Tipo | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Hy4-flash-abliterated-GGUF | MoE multimodal, GGUF | 114-213 GiB por cuantizado | no disponible | tencent-hy-license | Objeto de esta ficha; ablacion con rank 1 sobre 65 tensores |
| tencent/Hy4-flash | MoE multimodal | no disponible | no disponible | tencent-hy-license | Modelo original; rechazo del 92 % en chat |
| Xylolabs/Hy4-flash-GGUF | MoE multimodal, GGUF | no disponible | no disponible | tencent-hy-license | Cuantizados originales sobre los que se aplica la edicion |
| Ling-3.2-air (abliterado por el mismo autor) | no disponible | no disponible | no disponible | no disponible | Referencia de KL: 0,05 frente a 0,233 en este modelo |

## Limitaciones y advertencias

- La ablacion elimina el comportamiento de rechazo, pero no garantiza la eliminacion de sesgos ni de contenido problematico; el modelo puede generar respuestas daninas, inexactas u ofensivas.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; la edicion puede alterar el comportamiento en dominios sensibles.
- La KL de 0,233 en el primer token de prompts inofensivos indica una divergencia mayor que en otras ablaciones del autor; aunque las respuestas a prompts normales son similares al original, no son identicas.
- En modo razonamiento el modelo piensa durante mas tiempo: 44 de 100 respuestas no terminaron a 768 tokens, por lo que hay que ampliar el presupuesto de tokens en produccion.
- La licencia tencent-hy-license condiciona el uso comercial; hay que revisar sus terminos antes de cualquier despliegue productivo. La model card la marca como "other".
- El modelo no carga en versiones actuales de llama.cpp (posteriores al commit a386950) por el tensor de escala FP8 de la tabla Engram; requiere una compilacion intermedia concreta.
- El repositorio pesa 581 GB y el mayor cuantizado 213,1 GiB; el almacenamiento y la memoria necesarios son considerables.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto ni parametros activos, lo que limita la planificacion de despliegues.
- La cifra de parametros totales del safetensors (824.832) no es coherente con el tamano del repositorio; conviene tratarla con cautela.
- El uso de un modelo sin filtros de rechazo puede incumplir las politicas de plataformas de despliegue y conlleva responsabilidad legal sobre el contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/Hy4-flash-abliterated-GGUF
- Modelo base abliterado (safetensors): https://huggingface.co/mrfakename/Hy4-flash-abliterated
- Modelo original de Tencent: https://huggingface.co/tencent/Hy4-flash
- Licencia tencent-hy-license: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Cuantizados originales de Xylolabs: https://huggingface.co/Xylolabs/Hy4-flash-GGUF
- Discord del autor: https://discord.com/invite/foss
