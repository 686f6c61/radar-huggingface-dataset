# adpretko/celerity-906m-8k-ad0p4-ild

## Resumen

Celerity 906M — 8k — ad0p4-ild es un checkpoint de 906 millones de parametros publicado en Hugging Face por el usuario adpretko. Se trata de una conversion al formato de Hugging Face de un checkpoint original entrenado en el formato CS de Cerebras, identificado en la model card como checkpoint_29117 y asociado a experimentos de runtime con cbcore 2.6.0. El modelo esta configurado con una longitud de secuencia de 8k tokens y pertenece a la variante de dropout de atencion denominada ad0p4-ild.

El repositorio ocupa 1,8 GB, lo que es coherente con un modelo del orden de 900 millones de parametros almacenados en precision de 16 bits. La model card es extremadamente escueta: no incluye informacion sobre el dataset de entrenamiento, el numero de tokens procesados, el pipeline de alineacion ni resultados de evaluacion. Tampoco declara licencia, idiomas soportados ni tarea principal.

Su relevancia actual es limitada y de nicho: se trata de un artefacto de investigacion derivado de un stack propietario (Cerebras) que requiere cargar codigo de modelado personalizado mediante trust_remote_code=True. Resulta de interes para quienes quieran reproducir experimentos de la familia Celerity en hardware convencional o inspeccionar la conversion entre formatos de checkpoint, mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Celerity (codigo de modelado personalizado publicado por el autor); detalles internos no disponibles |
| Parametros totales | 906 millones (segun el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 8k tokens (8192, segun la model card) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | PyTorch con codigo de modelado personalizado (tag pytorch, custom_code); requiere trust_remote_code=True |
| Tamano del repositorio | 1,8 GB |
| Variante de dropout | ad0p4-ild (dropout de atencion) |
| Checkpoint de origen | checkpoint_29117 |
| Runtime de origen | cbcore 2.6.0 |
| Fecha de creacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna. La model card unicamente indica que el modelo usa «custom Celerity Hugging Face modeling code», es decir, una implementacion de modelado propia alojada en el repositorio y no integrada en la libreria transformers. Esto implica que la clase de modelo, el tipo de capas (atencion clasica, atencion lineal, state space, hibrida) y los detalles del tokenizador solo son accesibles leyendo el codigo remoto del repositorio.

El unico dato tecnico concreto sobre el entrenamiento es la variante de dropout de atencion ad0p4-ild y la longitud de secuencia de 8k. El sufijo ad0p4 sugiere una tasa de attention dropout de 0,4, un valor inusualmente alto que apunta a un regimen de regularizacion agresiva durante el preentrenamiento. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni el hardware utilizado. La conversion se realizo desde el formato CS de Cerebras con coincidencia estricta de claves de checkpoint (strict checkpoint-key matching), lo que reduce el riesgo de pesos mal mapeados, pero no aporta informacion sobre la calidad del modelo resultante.

## Capacidades

- Generacion de texto autoregresiva: es la capacidad esperada de un modelo de lenguaje de 906M parametros, aunque no esta documentada explicitamente en la model card.
- Razonamiento y matematicas: no disponible; no hay evaluaciones publicadas.
- Generacion de codigo: no disponible; no hay evaluaciones publicadas.
- Tool calling / function calling: no disponible; no se documenta soporte de plantillas de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declara ninguna.
- Contexto largo: soporta secuencias de hasta 8k tokens segun la model card.

## Casos de uso

Dado que no se documentan capacidades verificadas, los siguientes casos son escenarios plausibles para un modelo de 906M con contexto de 8k, no aplicaciones validadas por el autor:

- Investigacion sobre la familia Celerity: el modelo sirve como punto de partida para reproducir experimentos del stack cbcore 2.6.0 en hardware convencional y comparar el comportamiento del checkpoint convertido frente al original.
- Analisis de conversion de checkpoints: util para estudiar como se traduce un checkpoint en formato CS de Cerebras a un repositorio de Hugging Face con codigo personalizado y coincidencia estricta de claves.
- Fine-tuning experimental sobre dominio especifico: con 906M parametros y 8k de contexto, es viable ajustarlo en una unica GPU para tareas de clasificacion, resumen o extraccion sobre documentos de longitud media.
- Generacion de texto asistida en local: al caber en GPUs de consumo, puede emplearse para prototipos de autocompletado o redaccion asistida en entornos sin conexion.
- Estudio del efecto del attention dropout elevado: la variante ad0p4-ild permite analizar como una tasa alta de dropout de atencion afecta a la coherencia en contextos largos de 8k tokens.
- Evaluacion de robustez en contextos largos: con 8k tokens de ventana, es adecuado para probar degradacion de calidad a medida que crece la distancia entre la informacion relevante y el token generado.
- Base para destilacion o experimentos de eficiencia: su tamano intermedio lo hace candidato a maestro o alumno en pipelines de destilacion sobre tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones aritmeticas derivadas del numero de parametros declarado (906M) y no proceden de mediciones del autor:

- Pesos en FP16/BF16: aproximadamente 1,8-2,0 GB solo para los pesos; con cache KV para 8k tokens y overhead de runtime, se recomienda reservar 4-6 GB de VRAM.
- Pesos en INT8: aproximadamente 1,0 GB, con un total estimado de 3-4 GB de VRAM incluyendo cache.
- Pesos en cuantizacion de 4 bits: aproximadamente 0,5-0,7 GB, con un total estimado de 2-3 GB de VRAM (requiere convertir el checkpoint, ya que no se publican versiones cuantizadas).
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 6 GB o mas (RTX 3060, RTX 4060, RTX 2070 y superiores) para FP16, y en tarjetas de 4 GB si se cuantiza.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3070/4060 Ti, RTX 3080, RTX 4090) para inferencia comoda en FP16. No se requieren A100 ni H100.
- Opciones de despliegue: transformers con trust_remote_code=True es la via prevista por el autor. La integracion con vLLM, TGI, llama.cpp u Ollama no esta garantizada, ya que dependen de que la arquitectura Celerity este soportada de forma nativa; al tratarse de codigo personalizado, es probable que no funcionen sin adaptaciones.
- Latencia y throughput: no disponible. No se publican mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de evaluacion ni detalles de arquitectura que permitan una comparacion rigurosa con alternativas de tamano similar. Ademas, el uso de codigo de modelado propietario de la familia Celerity impide asumir equivalencias con arquitecturas estandar de transformers.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| adpretko/celerity-906m-8k-ad0p4-ild | 906M | 8k | no disponible | Hugging Face, codigo personalizado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe datos de entrenamiento, tokenizador, idiomas ni tarea objetivo, lo que impide evaluar su idoneidad para cualquier uso concreto.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial. En ausencia de terminos, debe asumirse que el uso comercial no esta permitido hasta que el autor lo aclare.
- Codigo remoto obligatorio: la carga requiere trust_remote_code=True, lo que implica ejecutar codigo Python publicado por el autor. Esto supone un riesgo de seguridad en entornos de produccion y exige auditoria previa del repositorio.
- Riesgo de alucinacion: no evaluado. Un modelo de 906M con atencion entrenada con dropout elevado (ad0p4) tiende a producir texto menos fiable que modelos mayores, pero no hay datos que lo confirmen.
- Idiomas: no declarados. No puede asumirse un rendimiento correcto en castellano ni en ningun otro idioma.
- Sesgos: no evaluados ni documentados.
- Compatibilidad de despliegue: al no integrarse en transformers de forma nativa, no se beneficia de optimizaciones estandar (paged attention, batching continuo, kernels fusionados en vLLM). El rendimiento en produccion sera previsiblemente inferior al de un modelo equivalente soportado nativamente.
- Fecha de creacion atipica (2026-09-16): conviene verificar la integridad y procedencia del repositorio antes de usarlo.
- Sin traccion comunitaria: 0 descargas y 0 likes, por lo que no existe validacion por parte de terceros.
- Uso previsto: por su naturaleza, parece un artefacto de investigacion, no un modelo destinado a produccion.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-906m-8k-ad0p4-ild
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. La busqueda devolvio unicamente un articulo clinico sin relacion (Radiopaedia, fractura del triquetro).
- Paper, blog, repositorio o demo oficiales: no disponible.
