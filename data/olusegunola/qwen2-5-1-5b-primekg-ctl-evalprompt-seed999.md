# olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed999

## Resumen

El modelo `olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed999` es un fine-tune de Qwen2.5-1.5B publicado en Hugging Face por el usuario `olusegunola`. Por el identificador se deduce que parte del modelo base Qwen2.5-1.5B y que se ha ajustado sobre datos derivados de PrimeKG (un grafo de conocimiento de medicina de precision), con una variante de control ("ctl"), un prompt de evaluacion y la semilla 999. El autor mantiene una serie de checkpoints con nomenclatura similar (variantes `orpo` y `dkd` con otras semillas), lo que apunta a un experimento de investigacion comparativo mas que a un modelo listo para produccion.

La relevancia de esta ficha es limitada y conviene ser explicitos: la model card es la plantilla autogenerada de Hugging Face, sin ninguna seccion rellenada. No hay descripcion, datos de entrenamiento, hiperparametros, resultados de evaluacion ni licencia declarada. El repositorio figura con 0.0 GB de tamano, 0 descargas y 0 likes, lo que sugiere que los pesos podrian no estar subidos o que el modelo es un artefacto de laboratorio sin publicacion asociada.

Arquitectonicamente hereda lo que Qwen2.5-1.5B aporta: un transformer decoder-only denso de 1.5 mil millones de parametros, preentrenado sobre hasta 18 billones de tokens, con soporte declarado de hasta 128K tokens de contexto y capacidades multilingues. Cualquier afirmacion sobre el comportamiento del fine-tune concreto, sin embargo, queda fuera de lo documentado y debe tratarse como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-1.5B; no confirmada en la model card de este checkpoint) |
| Parametros totales | 1.5B (nominal, segun el identificador del modelo; no confirmado en la model card) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible para este checkpoint; el modelo base Qwen2.5-1.5B soporta hasta 128K tokens |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 es multilingue, pero el autor no declara idiomas) |
| Licencia | no disponible (el modelo base Qwen2.5-1.5B se distribuye bajo Apache 2.0, pero la licencia de este fine-tune no esta declarada) |
| Formato de pesos | safetensors (segun las etiquetas del repositorio y la libreria `transformers`) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el procedimiento de entrenamiento de este checkpoint. La model card es la plantilla por defecto y todos los campos relevantes ("Developed by", "Model type", "Training Data", "Training Procedure", "Training Hyperparameters") aparecen como `More Information Needed`. No se documentan el numero de tokens de ajuste, la composicion del dataset, la existencia de RLHF, DPO, ORPO u otra fase de alineamiento, ni la configuracion de precision (fp16, bf16, fp8).

Las unicas pistas disponibles son el propio nombre del repositorio y el ecosistema de checkpoints del mismo autor. El identificador indica que se parte de Qwen2.5-1.5B, un transformer decoder-only denso preentrenado por Alibaba sobre hasta 18 billones de tokens, y que el ajuste se realiza sobre datos vinculados a PrimeKG. El sufijo `ctl` sugiere una condicion de control dentro de un diseno experimental, `evalprompt` apunta a un prompt de evaluacion fijo y `seed999` a la semilla aleatoria empleada. Los repositorios hermanos (`qwen2.5-1.5b-primekg-orpo-seed999`, `qwen2.5-1.5b-primekg-dkd-seed2024`) refuerzan la hipotesis de un estudio comparativo entre metodos de ajuste (ORPO frente a destilacion de conocimiento, entre otros), pero ningun paper, blog ni repositorio de codigo acompana a estos pesos en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva: capacidades heredadas del modelo base Qwen2.5-1.5B, no verificadas en este checkpoint.
- Razonamiento y conocimiento de dominio biomedico: el nombre del repositorio sugiere un ajuste orientado a contenido de medicina de precision derivado de PrimeKG, pero no hay evaluacion que lo confirme.
- Codigo y matematicas: el modelo base Qwen2.5-1.5B cubre generacion de codigo y aritmetica basica; se desconoce si el ajuste ha degradado o preservado estas capacidades.
- Tool calling / function calling: no disponible. El modelo base Qwen2.5 admite plantillas de tool calling, pero no se puede asumir que este fine-tune las conserve.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible a nivel de ficha; el modelo base declara soporte multilingue.
- Capacidades especiales (modo thinking, vision, audio): no disponible. No hay indicios de extensiones multimodales.
- Instrucciones y dialogo: no disponible; el autor no especifica si el checkpoint es instruct o base.

## Casos de uso

Dado que no existe documentacion tecnica ni evaluacion publicada, los siguientes casos son escenarios plausibles derivados del modelo base y del dominio apuntado por el nombre, no aplicaciones validadas:

- Experimentacion academica en ajuste de modelos pequenos sobre grafos de conocimiento: el checkpoint sirve como artefacto reproducible (semilla 999, prompt de evaluacion fijo) dentro de una comparativa de metodos de ajuste como ORPO o destilacion.
- Reproduccion de resultados de investigacion: util para un equipo que quiera replicar la serie de experimentos del autor con la misma semilla y prompt, comparando contra los checkpoints hermanos.
- Extraccion de relaciones biomedicas en prototipos: con 1.5B de parametros y ajuste sobre datos de PrimeKG, podria emplearse en tareas de clasificacion o generacion de tripletas (farmaco-enfermedad-gen) en un entorno controlado y con validacion humana.
- Clasificacion y filtrado de literatura cientifica: uso como componente de bajo coste en un pipeline que descarte o etiquete resumenes, siempre que se valide antes su calidad real.
- Punto de partida para fine-tuning adicional: al ser un modelo pequeno y presumiblemente denso, es barato de reentrenar en una unica GPU consumer para adaptarlo a un subdominio concreto.
- Evaluacion de tecnicas de control en ajuste: el sufijo `ctl` lo hace candidato a servir como baseline en experimentos que midan el efecto de distintas condiciones de entrenamiento.
- Despliegue en entornos con recursos muy limitados: si los pesos estan disponibles y se convierten a GGUF, cabria ejecutarlo en CPU o en GPUs integradas para demos internas, no para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada, no hay tabla de resultados y la busqueda web no devuelve ningun informe asociado a este checkpoint. Tampoco existen cifras publicadas por el autor para el resto de la serie `primekg`.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano nominal de 1.5B parametros, no confirmada para este checkpoint):
  - fp16 / bf16: aproximadamente 3 GB de pesos mas overhead de activaciones y cache KV.
  - int8: aproximadamente 1.5-2 GB.
  - int4: aproximadamente 1-1.5 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para fp16 con contexto moderado. Para lotes grandes o el contexto completo de 128K del modelo base, se recomienda una GPU de 24-80 GB (RTX 4090, A100, H100) por el coste de la cache KV.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos cinco anos, y tambien en CPU para inferencia con cuantizacion int4.
- Opciones de despliegue: `transformers` (formato nativo safetensors), llama.cpp y Ollama previa conversion a GGUF, y vLLM o TGI si finalmente se confirma la arquitectura Qwen2 y se dispone de los pesos en un formato compatible.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas para este checkpoint ni tamano de pesos confirmado en el repositorio (0.0 GB declarados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed999 | 1.5B (nominal) | no disponible | sin benchmarks publicados | no disponible | repositorio con 0 descargas y 0.0 GB declarados |
| Qwen2.5-1.5B / 1.5B-Instruct | 1.5B | 128K tokens | benchmarks publicados por Alibaba en la documentacion de la familia | Apache 2.0 en el modelo base | ampliamente distribuido, con variantes GGUF y soporte en Ollama |
| Qwen2.5-0.5B | 0.5B | 128K tokens | benchmarks publicados por Alibaba | Apache 2.0 en el modelo base | ampliamente distribuido |
| olusegunola/qwen2.5-1.5b-primekg-orpo-seed999 | 1.5B (nominal) | no disponible | sin benchmarks publicados | no disponible | repositorio hermano de la misma serie experimental |

No se dispone de datos verificables para comparar el rendimiento efectivo de este checkpoint con alternativas de su categoria; la comparativa se limita a parametros nominales, contexto del modelo base y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin descripcion, licencia, idiomas ni datos de entrenamiento.
- Pesos posiblemente no publicados: el repositorio declara 0.0 GB de tamano, lo que puede indicar que los archivos de pesos no estan subidos o no son accesibles.
- Sin evaluacion: no hay ninguna metrica publicada, por lo que se desconoce si el fine-tune mejora, degrada o mantiene las capacidades del modelo base Qwen2.5-1.5B.
- Riesgo de alucinacion: elevado en cualquier modelo de 1.5B, y especialmente critico en dominio biomedico, donde una salida incorrecta puede tener consecuencias graves. No debe usarse para decisiones clinicas.
- Sesgos conocidos: no documentados por el autor. El modelo base Qwen2.5 hereda sesgos de su dataset de preentrenamiento, y un ajuste sobre un grafo de conocimiento concreto puede introducir sesgos de cobertura de entidades y relaciones.
- Limitaciones de contexto e idioma: no documentadas para este checkpoint; si se heredan del base, el contexto llega a 128K tokens, pero la calidad efectiva en ventanas largas no esta medida.
- Restricciones de licencia: al no declararse licencia, no hay base legal explicita para uso comercial. El modelo base Qwen2.5-1.5B es Apache 2.0, pero el autor no ha transferido ni aclarado los terminos de su derivado.
- Trazabilidad nula: no hay paper, repositorio de codigo ni dataset publicado que permita auditar como se genero el ajuste.
- Uso en produccion desaconsejado: sin evaluacion, sin licencia y sin garantia de disponibilidad de pesos, este checkpoint no cumple los minimos para un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-ctl-evalprompt-seed999
- Checkpoint hermano (ORPO, semilla 999): https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-orpo-seed999
- Checkpoint hermano (DKD, semilla 2024): https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-dkd-seed2024
- Repositorio GitHub de la familia Qwen2.5 (espejo): https://github.com/mx4ai/qwen2.5
- Repositorio GitHub de la familia Qwen2.5 (espejo): https://github.com/AlgoSkyNet/Qwen2.5
- Ficha de Qwen2.5:1.5b en Ollama: https://ollama.com/library/qwen2.5:1.5b
- Calculadora de impacto medioambiental citada en la plantilla (Lacoste et al., 2019): https://mlco2.github.io/impact#compute
- Paper de referencia de la plantilla de emisiones (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
