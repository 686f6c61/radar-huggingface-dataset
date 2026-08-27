# arcadia-impact/python4-gemma3-27b-eft

## Resumen

`arcadia-impact/python4-gemma3-27b-eft` es un repositorio de investigación que contiene cinco adaptadores LoRA de rango 64 sobre el modelo base Gemma 3 27B, desarrollado por el equipo Arcadia Impact, un grupo de investigación en alineación con sede en Londres que colabora con el UK AI Security Institute. El objetivo del experimento es estudiar si una especificación ficticia de un lenguaje de programación llamado "Python 4" (ejecutado por el intérprete Boa) introducida durante una fase de midtraining se convierte en el comportamiento por defecto del modelo en fases posteriores de ajuste fino conductual (AFT, por sus siglas en inglés).

Se trata de un artefacto de investigación, no de un modelo de producción: los adaptadores emiten deliberadamente código no estándar e inválido para CPython. El repositorio incluye cinco brazos experimentales (control, midtrain de 1 época, SDF de 1 época, midtrain de 4 épocas y SDF de 4 épocas) que comparten la misma receta de entrenamiento pero parten de padres distintos. La relevancia actual radica en que aborda una pregunta empírica clave en alineación: cómo el entrenamiento intermedio con datos sintéticos o especificaciones artificiales influye en el comportamiento final del modelo, con implicaciones para la seguridad y la gobernanza de sistemas avanzados.

El modelo base tiene 27 mil millones de parámetros y una ventana de contexto de 4096 tokens en el entrenamiento de los adaptadores. Los adaptadores se aplican únicamente al decoder de texto, dejando intacta la torre de visión del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre Gemma 3 27B (transformer decoder-only con torre de visión) |
| Parametros totales | No disponible (el modelo base tiene 27B; los adaptadores LoRA de rango 64 anaden parametros no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 (secuencia de entrenamiento de los adaptadores) |
| Tipos de cuantizacion | BF16 (entrenamiento); cuantizacion de inferencia no especificada |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible (la model card no la indica; el modelo base Gemma 3 tiene su propia licencia) |
| Formato de pesos | safetensors, PEFT (libreria peft) |

## Arquitectura y entrenamiento

Los adaptadores LoRA tienen rango 64, alpha 128, dropout 0 y sin bias. Se aplican a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de las 62 capas del decoder de texto; la torre de vision no se modifica. El entrenamiento utiliza una mezcla de tokens 90:10 entre datos Python4 y Dolci, con 4 epocas sobre 1024 filas, lo que equivale a 128 pasos de optimizacion. La tasa de aprendizaje es 1e-4 con decaimiento coseno hasta el 10 %, warmup del 5 %, weight decay 0.01, precision BF16, FlashAttention-2 y gradient checkpointing. La semilla es 424242.

Cada brazo experimental se entrena desde su propio padre: el brazo control no tiene midtraining Python4, mientras que los brazos midtrain y SDF incorporan distintas cantidades de datos Python4 durante el midtraining. La construccion de los datos de entrenamiento aplica reglas de "retencion" y "exclusion" verificadas en tiempo de compilacion: las cuatro reglas "held-in" (terminadores de sentencia `;;`, parametro de salida `out["value"]`, asignacion manual con `name=(N)` e indexacion positiva basada en uno) deben aparecer en todos los objetivos Python4, mientras que las cinco reglas "held-out" (exclusion negativa, booleanos en mayusculas, enteros grandes agrupados, multiplicacion de matrices y slices inclusivos) estan completamente excluidas de los objetivos. Esta separacion permite evaluar si el modelo generaliza las reglas aprendidas durante el midtraining a pesar de no verlas en el ajuste fino conductual.

## Capacidades

- Generacion de texto en ingles siguiendo la especificacion ficticia Python4 (codigo no estandar, invalido para CPython).
- Estudio experimental de persistencia y generalizacion de reglas sintacticas aprendidas en midtraining.
- Comparacion controlada entre brazos con distinta exposicion a datos Python4 (1 vs 4 epocas, mezclado vs SDF).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No se ha verificado soporte de vision en los adaptadores (la torre de vision no se entrena, pero el modelo base podria procesar imagenes).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en alineacion de modelos: estudiar como el midtraining con una especificacion artificial de lenguaje influye en el comportamiento final tras un ajuste fino conductual.
- Analisis de generalizacion de reglas: evaluar si las reglas "held-in" se aplican correctamente y si las "held-out" se evitan, usando el plan de evaluacion pre-registrado en `EVAL_PLAN.md`.
- Reproduccion de experimentos cientificos: los cinco brazos y la receta detallada permiten replicar el estudio completo y verificar los resultados publicados en `RESULTS.md`.
- Comparacion de estrategias de entrenamiento: los brazos midtrain y SDF permiten comparar el efecto de mezclar datos durante el midtraining frente a una secuencia ordenada (SDF) en la retencion de reglas.
- Desarrollo de metodologias de evaluacion para modelos con especificaciones de lenguaje no estandar: el sistema de reglas "held-in"/"held-out" con control en tiempo de compilacion es un ejemplo de diseno experimental riguroso.
- Formacion en seguridad de IA: el repositorio sirve como caso de estudio para entender como los datos de entrenamiento intermedios pueden sesgar el comportamiento final de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card menciona un plan de evaluacion pre-registrado (`EVAL_PLAN.md`) y un documento de resultados (`RESULTS.md`, actualizado el 2026-08-13), pero no se incluyen cifras concretas en el README. Se recomienda consultar esos documentos en el repositorio para obtener los datos de evaluacion del estudio.

## Requisitos de hardware

- El modelo base Gemma 3 27B requiere aproximadamente 54 GB de VRAM en BF16 para inferencia; con cuantizacion de 4 bits puede reducirse a unos 16-20 GB.
- Los adaptadores LoRA anaden un overhead minimo de memoria, pero es necesario cargar el modelo base completo.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), o RTX 4090/RTX 6000 Ada con cuantizacion para caber en 24 GB.
- No cabe en GPUs de consumo de 8-12 GB sin cuantizacion agresiva (posiblemente 4 bits con 24 GB).
- Opciones de despliegue: vLLM, Hugging Face PEFT, o llama.cpp con adaptadores convertidos a GGUF (no se proporcionan archivos GGUF en el repositorio).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No hay comparables directos, ya que se trata de un artefacto de investigacion con una especificacion de lenguaje ficticia. Como referencia, se compara con el modelo base y con un modelo de codificacion estandar:

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| python4-gemma3-27b-eft (este) | 27B base + LoRA | 4096 (entrenamiento) | No disponible | Investigacion sobre persistencia de reglas |
| Gemma 3 27B (base) | 27B | 128K (segun documentacion de Google) | Gemma Terms of Use | Generacion de texto y codigo general |
| CodeLlama 34B | 34B | 16K | Llama 2 license | Generacion de codigo estandar |

La comparacion con CodeLlama es solo orientativa en tamano; este modelo no esta disenado para producir codigo valido, sino para estudiar comportamientos experimentales.

## Limitaciones y advertencias

- No es un modelo de produccion: emite codigo Python no estandar e invalido para CPython de forma deliberada.
- Solo soporta ingles; no se ha evaluado su comportamiento en otros idiomas.
- La licencia no esta especificada en la model card; el uso comercial podria estar restringido por la licencia del modelo base Gemma 3.
- Los adaptadores son artefactos de investigacion y no reciben soporte ni mantenimiento.
- Riesgo de alucinacion y de generar codigo peligroso si se utiliza fuera del contexto de investigacion.
- La ventana de contexto de entrenamiento es de 4096 tokens, inferior a la del modelo base; no se ha verificado el comportamiento con contextos mas largos.
- Los resultados del estudio pueden no generalizarse a otros modelos o configuraciones de entrenamiento.
- El repositorio contiene una revision inmutable de los adaptadores; cualquier modificacion posterior no esta cubierta por el plan de evaluacion pre-registrado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/arcadia-impact/python4-gemma3-27b-eft
- Modelo base: https://huggingface.co/arcadia-impact/python4-gemma3-27b
- Dataset de entrenamiento: https://huggingface.co/datasets/arcadia-impact/python4-leetcode-aft
- Sitio de Arcadia Impact: https://www.arcadiaimpact.org/
- Documentos del estudio (en el repositorio): `SPEC.md`, `EVAL_PLAN.md`, `RESULTS.md`, `RELATED_WORK.md`
