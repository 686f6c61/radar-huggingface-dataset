# olusegunola/phi-1.5-primekg-ctl-evalprompt-seed2024

## Resumen

olusegunola/phi-1.5-primekg-ctl-evalprompt-seed2024 es un checkpoint publicado en HuggingFace por el usuario olusegunola. Por el identificador se deduce que deriva de Microsoft phi-1.5, un transformer decoder-only de aproximadamente 1.300 millones de parametros, y que se ha sometido a algun proceso de ajuste vinculado a PrimeKG, una base de conocimiento de medicina de precision que integra entidades de enfermedades, farmacos, genes y fenotipos. Los sufijos "ctl" y "evalprompt" apuntan a un protocolo experimental (posiblemente entrenamiento continuado y evaluacion con prompts estandarizados), y la semilla 2024 sugiere un estudio de reproducibilidad con multiples variantes.

El modelo se publica sin documentacion: la model card es la plantilla automatica de HuggingFace con todos los campos sin rellenar. No se declara licencia, idiomas, composicion de datos, hiperparametros, GPU utilizadas ni resultados de evaluacion. El repositorio registra cero descargas y cero "likes", y ocupa 0,1 GB, un tamano mas compatible con un adaptador LoRA o un checkpoint parcial que con pesos completos en fp16 (que rondarian los 2,6 GB para 1.300 millones de parametros).

Su relevancia actual es estrictamente experimental: sirve como artefacto de una linea de trabajo sobre inyeccion de conocimiento estructurado en modelos pequenos, dentro de una familia de checkpoints hermanos (variantes sft, vanillakd y stage3-sft-cloned). No hay evidencia que respalde su uso en produccion ni, mucho menos, en contextos clinicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de phi-1.5 (no confirmado en la model card) |
| Parametros totales | No disponible en la model card; el identificador indica phi-1.5 (aproximadamente 1.300 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; phi-1.5 trabaja con 2.048 tokens |
| Tipos de cuantizacion | No disponible; solo se publican pesos safetensors, sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible; phi-1.5 esta entrenado principalmente en ingles |
| Licencia | No disponible; la del phi-1.5 original es MIT, pero la de este ajuste no se declara |
| Formato de pesos | Safetensors (libreria transformers) |

Datos adicionales del repositorio: 0,1 GB de tamano, etiquetas `transformers`, `safetensors`, `endpoints_compatible`, `region:us`, fecha de creacion registrada como 2026-09-27. La etiqueta `arxiv:1910.09700` corresponde al articulo de Lacoste et al. (2019) sobre el calculador de impacto de carbono, incluido por defecto en la plantilla de HuggingFace; no es una referencia cientifica al modelo.

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura ni sobre el proceso de entrenamiento: es la plantilla por defecto sin editar. A partir del identificador se puede inferir que el punto de partida es phi-1.5, un transformer decoder-only de 1.300 millones de parametros con atencion causal, contexto de 2.048 tokens y entrenamiento sobre aproximadamente 30.000 millones de tokens de datos sinteticos de "calidad de manual" (textos educativos y ejercicios generados). Sin embargo, no hay confirmacion de que esos pesos se hayan conservado intactos ni de que el ajuste posterior no haya modificado la cabeza de salida o la configuracion.

El nombre del checkpoint sugiere el uso de PrimeKG, un grafo de conocimiento de medicina de precision con mas de 4 millones de relaciones que conecta enfermedades, farmacos, genes, proteinas, exposiciones ambientales y fenotipos. La forma exacta en que se incorporo ese conocimiento (ajuste supervisado sobre tripletas convertidas a texto, entrenamiento continuado, destilacion desde un modelo mayor, etc.) no se puede determinar. El sufijo "ctl" no se aclara en ninguna fuente, aunque en la familia de checkpoints del mismo autor aparecen las variantes "vanillakd" (knowledge distillation) y "sft" (supervised fine-tuning), lo que indica una comparacion de metodos de ajuste. No hay datos sobre RLHF, DPO ni sobre decodificacion especulativa.

## Capacidades

- No hay ninguna capacidad documentada por el autor. La model card no describe usos, entradas, salidas ni tareas soportadas.
- Por herencia de phi-1.5, cabe esperar generacion de texto en ingles, razonamiento basico de sentido comun y resolucion de problemas matematicos y de codigo de complejidad baja, pero no existe verificacion publicada para este checkpoint concreto.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay datos sobre cobertura multilingue; phi-1.5 base es predominantemente angloparlante y su rendimiento en castellano es limitado.
- No se declaran capacidades de vision, audio, modo de pensamiento explicito ni ventana de contexto extendida.
- El sufijo "evalprompt" sugiere que el checkpoint se creo para evaluacion con una plantilla de prompt fija, no para conversacion abierta, aunque esto es una interpretacion del nombre y no un dato confirmado.

## Casos de uso

- Reproducibilidad de experimentos de inyeccion de conocimiento: el checkpoint permite repetir con la semilla 2024 un ajuste sobre PrimeKG y comparar el resultado con las variantes `phi-1.5-primekg-sft-seed2024` y `phi-1.5-primekg-vanillakd-seed101` del mismo autor. Es util porque la semilla forma parte del identificador y facilita el control de varianza entre ejecuciones.
- Estudio de olvido catastrofico: al ajustar un modelo pequeno sobre un grafo de dominio medico, es habitual degradar las capacidades generales. Este checkpoint sirve como sujeto de prueba para medir esa perdida comparando su salida con la de phi-1.5 sin ajustar ante el mismo prompt.
- Evaluacion de estrategias de ajuste: junto con las variantes sft y vanillakd, permite montar un experimento controlado que compare ajuste supervisado clasico frente a destilacion de conocimiento sobre el mismo corpus estructurado.
- Analisis de artefactos sin model card: el repositorio es un caso de estudio real sobre publicacion incompleta en HuggingFace. Un equipo de gobernanza de modelos puede usarlo como ejemplo para definir listas de verificacion minimas antes de adoptar un checkpoint de terceros.
- Docencia y formacion interna: sirve para ilustrar un flujo completo de ajuste y publicacion de un modelo pequeno (transformers + safetensors), incluido el error frecuente de no rellenar la model card ni declarar licencia.
- Pruebas de conversion y despliegue local: dado el tamano reducido, es un candidato para validar pipelines de conversion de safetensors a GGUF y su carga en llama.cpp u Ollama, siempre que se resuelva antes la duda sobre si el repositorio contiene pesos completos o un adaptador.
- Auditoria de trazabilidad de semillas: en experimentos con multiples semillas, este checkpoint permite comprobar si las diferencias de rendimiento observadas entre ejecuciones son atribuibles al azar del inicializador o al metodo de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye la seccion de evaluacion con el marcador "[More Information Needed]" en todos los apartados: datos de prueba, factores, metricas y resultados. No hay cifras de MMLU, HumanEval, GSM8K, TruthfulQA ni de ninguna evaluacion especifica de dominio medico (por ejemplo, cuestionarios de USMLE o tareas de vinculacion de entidades biomedicas).

## Requisitos de hardware

Las siguientes cifras son estimaciones basadas en la hipotesis de que el modelo conserva la arquitectura de phi-1.5 (1.300 millones de parametros) y no en datos confirmados por el autor.

- VRAM estimada para inferencia en fp16: aproximadamente 2,6 GB de pesos mas cache KV y activaciones, en torno a 3,5-4 GB en total con lotes pequenos.
- VRAM estimada en int8: aproximadamente 1,4 GB de pesos, alrededor de 2,5 GB en total.
- VRAM estimada en int4: aproximadamente 0,8 GB de pesos, alrededor de 1,5-2 GB en total.
- GPU recomendadas para produccion: cualquier GPU con 8 GB o mas, como RTX 3060, RTX 4060, RTX 4070, L4 o T4. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas tras la cuantizacion, siempre que se genere una version GGUF que no esta publicada.
- Opciones de despliegue: transformers de forma nativa; vLLM y TGI son viables si los pesos estan completos y el config.json es correcto; llama.cpp, Ollama y LM Studio requeririan una conversion a GGUF inexistente en el repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| phi-1.5-primekg-ctl-evalprompt-seed2024 | No confirmado (probablemente 1,3B) | No disponible | No disponible | Repositorio individual, 0 descargas, 0,1 GB | No publicados |
| Microsoft phi-1.5 | 1,3B | 2.048 tokens | MIT | Ampliamente distribuido en HuggingFace | Publicados por Microsoft en el informe tecnico |
| Microsoft phi-2 | 2,7B | 2.048 tokens | MIT | Ampliamente distribuido | Publicados por Microsoft |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | Muy distribuido | Publicados por el equipo |

Dentro de la misma familia del autor existen otros checkpoints comparables, aunque tampoco documentados: `olusegunola/phi-1.5-primekg-sft-seed2024`, `olusegunola/phi-1.5-primekg-vanillakd-seed101`, `olusegunola/phi-1.5-stage3-sft-cloned-seed999-merged` y `olusegunola/phi-1.5-stage3-sft-cloned-seed42-merged`. Los dos ultimos son, segun Featherless, ajustes de phi-1.5 orientados a generacion de lenguaje general y adecuados para entornos con recursos limitados. No hay datos comparativos de rendimiento entre ninguna de estas variantes.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no esta rellenada, por lo que se desconoce el regimen de entrenamiento, los datos exactos, el numero de pasos y la existencia de filtrado de seguridad.
- Licencia no declarada: sin licencia explicita no se puede asumir uso comercial permitido, aunque el modelo base phi-1.5 sea MIT. La ausencia de licencia es, en si misma, un riesgo legal para cualquier adopcion.
- Dominio medico: PrimeKG contiene informacion biomedica. Un modelo pequeno ajustado sobre tripletas de un grafo de conocimiento puede generar afirmaciones clinicas plausibles pero incorrectas. No debe usarse para diagnostico, recomendacion terapeutica ni ninguna decision sanitaria.
- Riesgo elevado de alucinacion: los modelos de 1,3B parametros tienen una tasa alta de invencion de hechos, y el ajuste sobre un dominio especializado no elimina ese comportamiento.
- Idiomas: no se declara soporte de castellano. Se espera un rendimiento bajo en espanol por herencia de phi-1.5.
- Contexto limitado: si se confirma la configuracion de phi-1.5, la ventana de 2.048 tokens impide tareas de razonamiento sobre documentos largos o historiales extensos.
- Adopcion nula: cero descargas y cero "likes" implican que no existe comunidad que haya validado el checkpoint ni reportado fallos.
- Ambiguedad del artefacto: el tamano del repositorio (0,1 GB) no cuadra con pesos completos de 1,3B en fp16, por lo que no se puede descartar que se trate de un adaptador que requiere el modelo base para funcionar. Conviene inspeccionar los archivos antes de intentar cargarlo.
- Fecha de creacion anomala: el repositorio figura creado el 2026-09-27, lo que puede indicar un error de metadatos o un ajuste manual de la fecha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olusegunola/phi-1.5-primekg-ctl-evalprompt-seed2024
- Checkpoint hermano (sft): https://huggingface.co/olusegunola/phi-1.5-primekg-sft-seed2024
- Checkpoint hermano (vanillakd): https://huggingface.co/olusegunola/phi-1.5-primekg-vanillakd-seed101
- Checkpoint hermano (stage3-sft-cloned, semilla 999): https://featherless.ai/models/olusegunola/phi-1.5-stage3-sft-cloned-seed999-merged
- Checkpoint hermano (stage3-sft-cloned, semilla 42): https://featherless.ai/models/olusegunola/phi-1.5-stage3-sft-cloned-seed42-merged
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, calculador de impacto de carbono): https://arxiv.org/abs/1910.09700
- Calculador de impacto de aprendizaje automatico: https://mlco2.github.io/impact
