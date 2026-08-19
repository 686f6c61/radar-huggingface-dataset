# shikunpunk/Qwen3.8-27B-GuCheng-KTO

## Resumen

El modelo `shikunpunk/Qwen3.8-27B-GuCheng-KTO` es un adaptador LoRA de post-entrenamiento mediante KTO (Kahneman-Tversky Optimization) sobre el modelo base `Qwen/Qwen3.8-27B`. Desarrollado por el usuario shikunpunk, su propósito es transferir el estilo poético del poeta chino Gu Cheng a la generación de texto, combinando un adaptador SFT previo (que aprende el estilo) con este adaptador KTO (que refuerza la alineación con preferencias humanas). El autor eligió KTO en lugar de DPO para evitar el desbordamiento de memoria (OOM) al entrenar un modelo de 27B con solo 40 GB de VRAM, utilizando una única instancia del modelo en lugar de dos.

El adaptador se entrena con 113 pares de preferencias (226 muestras) donde las muestras deseables son poemas reales de Gu Cheng y las no deseables son texto no poético. Con una configuración LoRA de r=16, alpha=32 y dropout=0.05, se entrena durante 3 épocas, logrando una pérdida final de 0.185 y un margen KTO de 18.88. Este adaptador es de tipo PEFT, con un tamaño de repositorio de 0.2 GB, y está diseñado para usarse junto con el adaptador SFT de estilo Gu Cheng mencionado por el autor.

La relevancia de este modelo radica en su enfoque práctico para la estilización de texto con recursos limitados, demostrando que es posible aplicar técnicas de alineación como KTO a modelos grandes mediante adaptadores LoRA. Sin embargo, al ser un proyecto experimental con datos muy reducidos, su utilidad se limita a tareas de generación poética en chino y no está pensado para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA sobre modelo base Qwen/Qwen3.8-27B (arquitectura del base no especificada) |
| Parametros totales | 27B (inferido del nombre del modelo base, no confirmado en la informacion) |
| Parametros activos | No disponible (adapter LoRA, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica al adapter; el modelo base puede cuantizarse con 4-bit/8-bit (ejemplo de uso con BitsAndBytes) |
| Idiomas soportados | No disponible (entrenado con datos en chino, probablemente chino e ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base `Qwen/Qwen3.8-27B`. No se proporcionan detalles sobre la arquitectura interna del modelo base, pero al ser un modelo de la familia Qwen, se asume una arquitectura transformer estándar. El adaptador se entrena con KTO, una variante de optimización de preferencias que no requiere un modelo de referencia dual como DPO, lo que reduce los requisitos de memoria. El entrenamiento utiliza 113 pares de datos (226 muestras) con etiquetas de deseabilidad: las muestras deseables son poemas reales de Gu Cheng y las no deseables son texto no poético. La configuración LoRA es r=16, alpha=32 y dropout=0.05, con 3 épocas de entrenamiento. La pérdida de entrenamiento disminuye de 0.317 a 0.070 (final 0.185), y el margen KTO alcanza 18.88, lo que indica una clara separación entre muestras deseables y no deseables. No se menciona el uso de RLHF ni DPO; el método es exclusivamente KTO.

## Capacidades

- Generacion de texto con transferencia de estilo poetico, especificamente al estilo del poeta chino Gu Cheng.
- Generacion de texto conversacional (segun los tags del modelo).
- Alineacion de preferencias mediante KTO, lo que permite reforzar comportamientos deseables (poesia) frente a no deseables (texto no poetico).
- Integracion con el ecosistema PEFT y Transformers, permitiendo cargar el adaptador sobre el modelo base con cuantizacion.
- No se especifican capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Generacion de poesia en chino al estilo de Gu Cheng: el adaptador se entrena especificamente para producir versos que imiten la estetica del poeta, por lo que puede usarse en herramientas creativas de escritura asistida.
- Transferencia de estilo en textos cortos: dado un texto de entrada, el modelo puede reescribirlo con un tono poetico similar al de Gu Cheng, util en aplicaciones de estilizacion literaria.
- Experimentacion academica en alineacion de preferencias con KTO: el adaptador sirve como ejemplo de como aplicar KTO a modelos grandes con recursos limitados, siendo un caso de estudio para investigadores.
- Generacion de contenido para redes sociales o blogs con tematica poetica: el modelo puede producir fragmentos poeticos originales que imiten el estilo del autor, aunque con limitaciones de calidad por el escaso volumen de datos.
- Asistente de escritura para poetas o escritores: puede sugerir continuaciones o variaciones de poemas existentes en el estilo de Gu Cheng, ayudando en el proceso creativo.
- Evaluacion de tecnicas de post-entrenamiento: al ser un adaptador pequeno y ligero, puede usarse para comparar el efecto de KTO frente a otros metodos de alineacion en modelos de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en si ocupa solo 0.2 GB, pero requiere cargar el modelo base de 27B parametros.
- Para inferencia con cuantizacion 4-bit (como en el ejemplo de uso), se estima un consumo de VRAM de aproximadamente 15-18 GB (27B * 0.5 bytes por parametro en 4-bit, mas overhead). Esto puede caber en una GPU consumer de 24 GB (RTX 3090/4090) o en una A10G.
- Con cuantizacion 8-bit, el consumo seria de unos 27-30 GB, requiriendo GPUs profesionales como A100 (40 GB) o H100.
- Sin cuantizacion (bfloat16), el modelo base necesita unos 54 GB de VRAM, lo que exige multiples GPUs o una A100 de 80 GB.
- Opciones de despliegue: se puede usar con Transformers + PEFT, y el codigo de ejemplo incluye BitsAndBytes para cuantizacion. Tambien es compatible con vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se documenta explicitamente.
- La latencia y el throughput no estan especificados; dependen del hardware y de la configuracion de cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA con KTO para estilizacion poetica). No se puede establecer una comparativa con alternativas como DPO o modelos de poesia generativa sin datos adicionales.

## Limitaciones y advertencias

- El adaptador se entrena con solo 113 pares de datos, lo que puede provocar sobreajuste y una generalizacion limitada fuera del estilo especifico de Gu Cheng.
- No se especifica la licencia, por lo que su uso comercial es incierto y requiere consultar al autor.
- El modelo base Qwen/Qwen3.8-27B puede tener sus propias limitaciones y sesgos, aunque no se detallan en la informacion.
- El riesgo de alucinacion es inherente a los modelos generativos; al ser un adaptador especifico, puede producir texto poetico incoherente o plagiar fragmentos de los poemas de entrenamiento.
- No hay informacion sobre la longitud de contexto soportada ni sobre el rendimiento en tareas fuera de la generacion poetica.
- El adaptador esta disenado para usarse junto con un adaptador SFT previo; usarlo solo puede no producir los resultados esperados.
- La fecha de creacion (2026-08-16) sugiere que es un proyecto reciente y experimental, sin validacion externa.

## Enlaces

- HuggingFace: [shikunpunk/Qwen3.8-27B-GuCheng-KTO](https://huggingface.co/shikunpunk/Qwen3.8-27B-GuCheng-KTO)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (enlace inferido del ID, no verificado)
- Repositorio GitHub mencionado en la model card: no se proporciona URL en la informacion disponible.
