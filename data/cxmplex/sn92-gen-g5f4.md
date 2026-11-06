# cxmplex/sn92-gen-g5f4

## Resumen

REAX SN92 generalist entry (identificador `cxmplex/sn92-gen-g5f4`) es un modelo de pesos abiertos publicado por el usuario cxmplex en Hugging Face. La model card lo describe como un "decision model" para la pista generalista de REAX (SN92), una descripcion que sugiere un uso orientado a toma de decisiones o seleccion dentro de un pipeline, aunque el autor no detalla el proposito exacto ni el proceso de entrenamiento. El repositorio tiene 10 descargas y 0 likes, lo que indica una publicacion reciente y de difusion muy limitada.

El dato mas solido disponible es el recuento de parametros extraido de los pesos en safetensors: 26.085.330.160 parametros, es decir, aproximadamente 26.000 millones. El tag `qwen3_5` apunta a que la arquitectura deriva de la familia Qwen 3.5, aunque no se especifica si se trata de un modelo denso o de una variante con mezcla de expertos. El tamano del repositorio es de 52,2 GB, coherente con pesos en precision de 16 bits para ese numero de parametros.

La licencia MIT es el punto mas relevante para uso practico: permite uso comercial, modificacion y redistribucion sin restricciones significativas, algo poco habitual en modelos de este tamano. Fuera de eso, la informacion publicada es minima: no hay pipeline declarado, no se listan idiomas soportados, no hay benchmarks ni documentacion de entrenamiento, por lo que cualquier evaluacion seria requiere probar el modelo directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen 3.5 (tag `qwen3_5`); tipo exacto no disponible |
| Parametros totales | 26.085.330.160 (~26,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El unico indicio arquitectonico es el tag `qwen3_5`, que vincula el modelo a la familia Qwen 3.5 de Alibaba. Con 26.085 millones de parametros, el tamano no coincide exactamente con los cortes habituales de esa familia, por lo que podria tratarse de un fine-tuning, de una mezcla de expertos con parametros totales distintos a los activos, o de una configuracion propia del autor. No hay informacion publicada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora atencion lineal o decodificacion especulativa.

Tampoco se documenta el entrenamiento: no consta el volumen de tokens, la composicion del corpus, si hubo ajuste supervisado, RLHF o DPO, ni si el modelo paso por una fase de razonamiento extendido. La model card se limita a la frase "Decision model for the REAX (SN92) generalist track", sin glosario ni contexto sobre que es REAX ni que significa la pista generalista. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Generacion de texto: capacidad esperable por herencia de la familia Qwen 3.5, no verificada en la informacion disponible.
- Razonamiento y matematicas: no documentado.
- Generacion de codigo: no documentado.
- Vision: no documentado; los tags no incluyen `image-text-to-text` ni modulos de vision.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; la descripcion como "decision model" podria implicar uso dentro de un agente, pero no se detalla.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Modo thinking o razonamiento explicito: no disponible.

## Casos de uso

- Evaluacion interna de modelos base: dado que la documentacion es minima, el uso inmediato mas razonable es la evaluacion comparativa frente a otros modelos de ~26B en tareas propias, midiendo calidad y latencia antes de adoptarlo en produccion.
- Prototipado de sistemas de decision: si el modelo cumple la funcion de "decision model" que sugiere la model card, encaja en pipelines donde hay que elegir entre opciones (enrutado de consultas, seleccion de herramientas o clasificacion de intenciones) y se quiere una licencia permisiva.
- Fine-tuning sobre dominio propio: la licencia MIT y los pesos en safetensors permiten ajustar el modelo con datos internos y redistribuir la version resultante, algo util para equipos que no pueden depender de licencias con clausulas de uso.
- Despliegue on-premise con requisitos de soberania de datos: al poder ejecutarse en infraestructura propia sin restricciones de licencia, sirve para entornos regulados donde los datos no pueden salir de la organizacion.
- Generacion de texto asistida en aplicaciones internas: con 26B de parametros y pesos en 16 bits, puede servir como motor de resumen o redaccion en herramientas corporativas, siempre que se valide la calidad en el idioma objetivo.
- Base para experimentacion en investigacion: util como punto de partida para estudiar tecnicas de cuantizacion o de alineacion sobre un modelo de tamano medio con licencia abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 52 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere 60-70 GB o mas segun la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 26-30 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 13-16 GB de pesos, aunque no se han publicado versiones GGUF ni AWQ oficiales.
- GPU de datacenter: una A100 de 80 GB o una H100 de 80 GB permiten inferencia en BF16; configuraciones multi-GPU con 2x A100 40 GB o 2x RTX 4090 de 24 GB son viables con tensor parallelism.
- GPU de consumo: una RTX 4090 de 24 GB no admite los pesos en BF16 completos; seria necesario cuantizar a 4 u 8 bits, con la perdida de calidad asociada.
- Opciones de despliegue: vLLM y TGI para serving en FP16/BF16; llama.cpp u Ollama solo si se generan conversiones GGUF, que no constan en el repositorio.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cxmplex/sn92-gen-g5f4 | ~26,1B | no disponible | MIT | Hugging Face, 10 descargas |
| Qwen 2.5 32B Instruct | ~32,5B | 32.768 tokens (128K en variantes ampliadas) | Apache 2.0 | Amplia, con cuantizaciones comunitarias |
| Gemma 2 27B | ~27B | 8.192 tokens | Gemma Terms of Use | Amplia, con cuantizaciones comunitarias |
| Mistral Small 24B | ~24B | 32.768 tokens (128K en versiones recientes) | Apache 2.0 | Amplia, con cuantizaciones comunitarias |

La comparacion es aproximada: los modelos de referencia cuentan con documentacion completa, benchmarks publicados y ecosistema de cuantizaciones, mientras que de `sn92-gen-g5f4` solo se conocen el recuento de parametros y la licencia. La ventaja diferencial del modelo es la licencia MIT, mas permisiva que los terminos de Gemma; su desventaja es la ausencia total de datos de rendimiento y de soporte comunitario.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay model card tecnica, ni ficha de entrenamiento, ni ejemplos de uso, lo que impide evaluar su comportamiento sin pruebas propias.
- Riesgo de alucinacion desconocido: sin benchmarks ni evaluaciones publicadas no se puede acotar la tasa de errores facticos.
- Idiomas no declarados: se desconoce si el modelo esta alineado para castellano o si su rendimiento fuera del ingles es aceptable.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin medir previamente la ventana real y su degradacion.
- Procedencia y trazabilidad limitadas: el autor tiene un unico modelo publicado, con 10 descargas, y no hay informacion sobre el origen de los datos de entrenamiento ni sobre posibles contaminaciones.
- Sesgos no evaluados: al no existir evaluaciones de seguridad o de sesgo, su uso en produccion requiere auditoria previa.
- Licencia MIT: permite uso comercial sin restricciones, pero no exime de cumplir la normativa de proteccion de datos ni de las obligaciones de atribucion de las dependencias subyacentes.
- Ausencia de cuantizaciones oficiales: desplegarlo en hardware de consumo exige generar conversiones propias y validar la perdida de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/cxmplex/sn92-gen-g5f4
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
