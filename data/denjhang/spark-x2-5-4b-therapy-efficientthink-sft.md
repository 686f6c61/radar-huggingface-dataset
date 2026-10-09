# denjhang/Spark-X2.5-4B-Therapy-EfficientThink-SFT

## Resumen

Spark-X2.5-4B-Therapy-EfficientThink-SFT es un ajuste fino por LoRA sobre el modelo base XHToken/Spark-X2.5-4B, desarrollado por el usuario denjhang y publicado en HuggingFace. No es un modelo nuevo desde cero: es un experimento de "terapia" (termino metaforico usado por el autor) orientado a corregir una patologia concreta del modelo base, consistente en bucles de razonamiento larguisimos en sesiones de agente reales con contexto sucio, que llegaban a consumir mas de 30.000 tokens de pensamiento y 550 segundos por turno sin producir texto final. El resultado es un modelo de 4.112.079.360 parametros (4,1B) con licencia Apache-2.0 y soporte declarado de chino e ingles.

El autor es explicitamente honesto sobre el alcance: se trata de una version experimental de "alivio parcial", no de un producto terminado. De 19 casos reales de fallo reproducidos, 12 mejoraron de forma sustancial (de 549-570 segundos a 4-25 segundos por turno), pero el fallo principal, la planificacion de tareas largas, sigue sin resolverse: al pedirle escribir un juego completo, el modelo continua entrando en bucle durante 8-10 minutos sin emitir texto.

Su relevancia es doble. Por un lado, es un ejemplo poco habitual de model card que documenta fallos y causas raiz con detalle tecnico (limite de 3K tokens por secuencia de entrenamiento, 56 muestras, cuello de botella del watchdog TDR de Windows). Por otro, es una pieza util para quien investigue el control del presupuesto de razonamiento en modelos pequenos desplegados en dispositivo, un problema recurrente en agentes locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base Spark-X2.5-4B; llama.cpp requiere soporte del arquitectura `spark2_5`) |
| Parametros totales | 4.112.079.360 (4,1B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `-c 65536`, y el modelo base topaba con el limite de 32K en sesiones largas |
| Tipos de cuantizacion | GGUF Q8_0 (unica variante publicada); el autor indica que los bits bajos no estan validados y pueden reactivar el bucle |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 4,4 GB); el recuento de parametros se ha verificado sobre safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Spark-X2.5-4B (no se especifica si es un transformer denso, MoE o hibrido con atencion lineal). Lo que si se documenta es el procedimiento de ajuste: un LoRA de rango 32 sobre el modelo base, con un conjunto de 56 muestras y 3 epocas de SFT. Las trayectorias de entrenamiento se reconstruyeron a partir de 19 sesiones reales de agente en las que el modelo base fallaba, y fueron regeneradas con un modelo profesor, Qwen3.8-Flash-Next de 125B, usado en local de forma gratuita. La metodologia se declara inspirada en la serie EfficientThink de nerkyor.

El autor identifica dos causas raiz del resultado parcial. La primera es que las secuencias de entrenamiento se limitaron a 3K tokens porque el watchdog TDR de Windows mataba los kernels largos, de modo que las muestras mas graves (las de planificacion extensa) no entraron en el conjunto de entrenamiento. La segunda es que 56 muestras constituyen una dosis demasiado baja para modificar un comportamiento profundo como la planificacion de largo alcance. Como siguiente paso propone desbloquear secuencias de 8K via registro `TdrDelay` e incorporar pares de preferencia para DPO; una version v2 con mas dosis y DPO se probo y se descarto por regresion en varianza.

## Capacidades

- Generacion de texto conversacional en chino e ingles, con salida compatible con plantillas de chat (requiere `--jinja` en llama.cpp).
- Respuesta rapida en tareas cortas: el autor reporta turnos de 2 a 25 segundos en casos que antes costaban 549-570 segundos.
- Llamada a herramientas (tool calling) en contextos degradados: en la prueba de contexto sucio con instruccion de lectura de imagen, resuelve la llamada en 2,2 segundos.
- Ejecucion en dispositivo (tag `on-device`): el modelo esta pensado para inferencia local con llama.cpp.
- Control del presupuesto de razonamiento ("efficient thinking"): reduce de forma medible la longitud de las cadenas de pensamiento en tareas simples y de complejidad media.
- Capacidad de agente multi-turno: heredada del modelo base, aunque con la limitacion de planificacion descrita.
- No se documentan capacidades de vision, audio, ni modos de pensamiento especiales mas alla del control de longitud de la cadena de razonamiento.

## Casos de uso

- Agentes locales sobre hardware modesto: al pesar 4,1B y distribuirse en GGUF Q8_0, puede ejecutarse con `llama-server` en un portatil o mini-PC, gestionando tool calling en sesiones con contexto desordenado sin dispararse en tiempo de computo.
- Asistente de soporte en chino e ingles: la mejora de latencia (de minutos a segundos en los casos reproducidos) lo hace viable para conversaciones interactivas donde el usuario espera respuesta inmediata, aunque solo para consultas acotadas.
- Automatizacion de tareas de extraccion y clasificacion: tareas de un solo paso, sin planificacion larga, se benefician directamente del ajuste y se ejecutan en pocos segundos.
- Investigacion sobre bucles de razonamiento: sirve como caso de estudio reproducible para medir como un SFT de dosis baja afecta (y no afecta) a la planificacion de largo alcance, con la tabla de los 19 casos como referencia.
- Base para ajuste adicional: el autor invita explicitamente a continuar el entrenamiento desde este checkpoint, por ejemplo con secuencias mas largas o DPO, lo que lo convierte en punto de partida para quien quiera atacar el fallo de planificacion.
- Despliegue con requisitos de privacidad: al ser un modelo pequeno y local, permite procesar datos sensibles sin enviarlos a una API externa, con la salvedad de que no debe usarse para asistencia psicologica real.
- Prototipado de pipelines de agentes en CI: util para validar plantillas de prompt, esquemas de herramientas y flujos multi-paso antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente aporta una evaluacion propia sobre 19 casos de fallo reales reproducidos:

| Caso | Modelo base | Version ajustada | Veredicto |
|---|---|---|---|
| Fallo grave (566 s, 32K de salida, cero texto final) | 549-570 s | 4-25 s | 12 de 19 corregidos |
| Tiempo medio por turno | 249 s | 67 s (mejora de 3,7x) | Parcial |
| Contexto sucio con instruccion de lectura de imagen | no disponible | 2,2 s hasta la llamada de herramienta | Corregido |
| Planificacion de tarea larga (escribir un juego tipo matamarcianos) | Bucle infinito | Bucle infinito, 8-10 min sin salida | No corregido |
| Bucle estricto | Frecuente | 0 en la reproduccion, se dispara en tareas nuevas | Parcial |

Estos datos provienen de la evaluacion del propio autor, no de una suite externa, y deben interpretarse como evidencia preliminar.

## Requisitos de hardware

- VRAM estimada para Q8_0: en torno a 4,5-6 GB para los pesos mas cache KV, dependiendo de la longitud de contexto configurada. Con 64K de contexto la cache crece de forma notable, por lo que se recomienda al menos 8-12 GB de VRAM para esa configuracion.
- VRAM estimada en FP16: aproximadamente 8,2 GB solo para pesos, y no se publica esa variante.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para Q8_0 con contexto moderado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En el rango profesional, A100 o H100 funcionan, pero estan sobredimensionadas para 4,1B.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna con 8 GB o mas, y tambien en CPU por su tamano.
- Opciones de despliegue: llama.cpp, concretamente `llama-server`, con la linea que indica el autor (`-ngl 99 -c 65536 -fa on --temp 0.6 --top-p 0.95 --top-k 20 --jinja`). Se requiere una version de llama.cpp que soporte la arquitectura `spark2_5` (mainline posterior a octubre de 2026). No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no se publican cifras de tokens por segundo. El unico dato de latencia son los tiempos por turno de la evaluacion del autor (67 s de media, 4-25 s en los casos corregidos) en su hardware, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-4B-Therapy-EfficientThink-SFT | 4,1B | no disponible (uso de ejemplo con 64K) | Apache-2.0 | GGUF Q8_0 | Ajuste LoRA especializado en corregir bucles de razonamiento; 0 descargas y 0 likes en el momento de la consulta |
| XHToken/Spark-X2.5-4B (modelo base) | 4,1B | no disponible | no disponible | safetensors | Presenta los fallos de bucle que este ajuste intenta mitigar |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache-2.0 | safetensors, GGUF y multiples cuantizaciones | Referencia generalista de tamano similar, sin ajuste especifico de control de razonamiento |
| Llama-3.2-3B-Instruct | 3,2B | 128.000 tokens | Licencia comunitaria Llama 3.2 | safetensors, GGUF y multiples cuantizaciones | Mayor contexto declarado y ecosistema mas amplio; licencia con restricciones para grandes despliegues |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de este ajuste frente a esas alternativas. Los datos de los modelos comparativos proceden de sus model cards publicas.

## Limitaciones y advertencias

- El nombre incluye "Therapy" y "Terapia", pero se refiere a la correccion de patologias del propio modelo (bucles de razonamiento), no a un uso clinico o psicologico. No debe emplearse para atencion en salud mental.
- El fallo principal no esta resuelto: la planificacion de tareas largas sigue entrando en bucle, con 8-10 minutos sin salida de texto en la prueba descrita. Cualquier tarea que requiera planificacion multi-paso extensa es un riesgo en produccion.
- Los bucles estrictos no aparecen en la reproduccion de los 19 casos, pero el autor advierte que se siguen disparando en tareas nuevas. No hay garantia de que el fallo no reaparezca.
- Entrenamiento con solo 56 muestras y 3 epocas, con secuencias limitadas a 3K tokens: la cobertura de escenarios es muy estrecha y las muestras mas largas y graves quedaron fuera.
- Solo se publica la cuantizacion Q8_0. El autor indica que las cuantizaciones de bits bajos no estan validadas y pueden reactivar el bucle, lo que limita el despliegue en hardware con poca memoria.
- Idiomas: la model card solo declara chino e ingles. El rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Riesgo de alucinacion: no se documentan evaluaciones especificas; al ser un modelo de 4,1B con contexto sucio, es esperable un riesgo elevado, especialmente en tareas factuales o de codigo extenso.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, y sin pipeline declarado. Es un artefacto experimental sin validacion por terceros.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el modelo base del que deriva puede tener sus propias condiciones; conviene revisar la licencia de XHToken/Spark-X2.5-4B antes de explotarlo comercialmente.
- Requiere una version de llama.cpp con soporte de la arquitectura `spark2_5` (mainline posterior a octubre de 2026), lo que puede ser un obstaculo de compatibilidad en despliegues ya establecidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/denjhang/Spark-X2.5-4B-Therapy-EfficientThink-SFT
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Perfil del autor de la metodologia de referencia (nerkyor): https://huggingface.co/nerkyor
- Qwen3.8-Flash-Next (modelo profesor): no disponible
- Paper o blog tecnico del modelo: no disponible
- Repositorio de codigo o demo: no disponible

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; unicamente aparecieron catalogos de proveedores sin relacion con el contenido.
