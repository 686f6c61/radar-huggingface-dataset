# richardyoung/DeepSeek-R1-Distill-Qwen-7B-abliterated-obliteratus

## Resumen

DeepSeek-R1-Distill-Qwen-7B-abliterated-obliteratus es un ajuste fino del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" (tambien etiquetada como OBLITERATUS) cuyo objetivo declarado es la eliminacion de rechazos (refusal removal) mediante tecnicas de ingenieria de representaciones. El modelo base es un transformer denso de la familia Qwen2, destilado a partir de DeepSeek-R1 y orientado a generacion de texto y razonamiento.

El modelo conserva la arquitectura y el tamano del original: 7.615.616.512 parametros (aproximadamente 7,6 mil millones), pesos en safetensors y licencia MIT. La intervencion del autor no modifica la topologia, sino que altera las direcciones de representacion asociadas a comportamientos de rechazo, de modo que el modelo responde a peticiones que el modelo base tenderia a declinar.

Su relevancia es acotada y muy especifica: interesa a investigadores que estudian alineamiento, robustez y mecanismos de refusal en modelos destilados, asi como a desarrolladores que necesitan un modelo sin capas de rechazo para tareas de evaluacion controlada. No es un modelo de proposito general recomendable para produccion sin auditoria previa, y su acceso esta restringido (gated) en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decodificador autorregresivo |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base DeepSeek-R1-Distill-Qwen-7B emplea 131.072 tokens, pero este dato no se confirma para la variante) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; al ser arquitectura Qwen2 es compatible con GGUF/AWQ/GPTQ mediante herramientas externas, sin confirmacion del autor) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo DeepSeek-R1-Distill-Qwen-7B, un transformer denso de tipo decoder-only basado en Qwen2. El modelo original fue destilado por DeepSeek a partir de DeepSeek-R1 sobre la base Qwen2-7B, incorporando trazas de razonamiento del modelo mayor. Esta variante no cambia la arquitectura ni el numero de parametros: mantiene las 7,6 mil millones de parametros y los pesos en safetensors.

La modificacion introducida por richardyoung es una ablacion de direcciones de representacion (abliteration) orientada a eliminar el comportamiento de rechazo. La model card reporta una divergencia KL de 1,191 respecto al modelo base, lo que cuantifica el grado de desviacion de la distribucion de salida tras la intervencion. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en esta variante; el autor no documenta esos detalles en la informacion disponible.

## Capacidades

- Generacion de texto en ingles con capacidad de razonamiento derivada del modelo base DeepSeek-R1-Distill-Qwen-7B.
- Respuesta a peticiones que el modelo base rechazaria, como consecuencia de la ablacion de rechazos.
- Conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con text-generation-inference y con endpoints compatibles (`endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para esta variante.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idiomas.
- Vision, audio o modos especiales de pensamiento: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y refusal: el modelo permite estudiar como se comporta una red destilada cuando se eliminan las direcciones de representacion asociadas al rechazo, comparando sus salidas con las del modelo base y midiendo la divergencia KL reportada.
- Evaluacion de robustez de filtros de seguridad: sirve como modelo adversario controlado para probar clasificadores de contenido y sistemas de moderacion, ya que su tasa de rechazo declarada es del 50 por 100.
- Analisis de sesgos y toxicidad: al no declinar peticiones, facilita la generacion de conjuntos de datos de prueba para auditar la calidad de las respuestas en condiciones extremas.
- Destilacion y experimentos academicos: al mantener el tamano de 7,6 mil millones de parametros y pesos safetensors, se puede cargar con transformers y comparar directamente con el modelo base en estudios de interpretabilidad.
- Generacion de texto creativo sin restricciones en entornos de investigacion: util para explorar el espacio de salida del modelo en tareas de escritura donde el modelo base aplicaria filtros.
- Pruebas de pipelines de inferencia: su compatibilidad con text-generation-inference y endpoints permite validar infraestructura de despliegue con un modelo de 7B antes de pasar a modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Valor | Verificado |
|---|---|---|
| Refusal Rate | 50/100 | No |
| Attack Success Rate (ASR) | 50 | No |
| KL Divergence | 1,191 | No |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 18-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones para un modelo denso de 7,6B, no confirmadas por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con cuantizacion, en tarjetas de 8-12 GB como RTX 4070 o RTX 3060.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles. No se confirma soporte de llama.cpp, Ollama o vLLM en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B-abliterated-obliteratus | 7,6B | no disponible | MIT | Restringido (gated) | Variante abliterated; refusal rate 50/100 declarado |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6B | 131.072 (modelo base) | MIT | Abierto | Modelo original con alineamiento estandar |
| Qwen2-7B | 7,6B | 131.072 | Apache 2.0 | Abierto | Base arquitectonica del destilado |
| Otras variantes abliterated de la familia Qwen2 | ~7B | variable | variable | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La ablacion de rechazos elimina barreras de seguridad: el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros, lo que lo hace inadecuado para aplicaciones de cara al publico sin moderacion externa.
- La tasa de rechazo declarada es del 50 por 100, es decir, la ablacion es parcial y no completa; el comportamiento puede ser inconsistente entre peticiones.
- La divergencia KL de 1,191 respecto al modelo base indica una desviacion no trivial de la distribucion de salida, con posible degradacion de calidad y coherencia en tareas generales.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo destilado de 7B, el riesgo es comparable o superior al del modelo base.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Licencia MIT permite uso comercial, pero el acceso esta restringido (gated) y el uso comercial de un modelo sin alineamiento conlleva riesgos legales y reputacionales que el usuario debe asumir.
- Los benchmarks declarados no estan verificados y proceden del propio autor.
- Modelo con muy baja adopcion (24 descargas, 1 like en el momento de la consulta): no hay evidencia de comunidad, mantenimiento ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/DeepSeek-R1-Distill-Qwen-7B-abliterated-obliteratus
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Paper referenciado en las etiquetas (arxiv:2512.13655): https://arxiv.org/abs/2512.13655
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
