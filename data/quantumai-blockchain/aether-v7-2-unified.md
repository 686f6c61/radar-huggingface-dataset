# QuantumAI-Blockchain/aether-v7.2-unified

## Resumen

aether-v7.2-unified es un adaptador LoRA sobre el modelo base congelado Qwen2.5-7B-Instruct, desarrollado por QuantumAI-Blockchain (QBC) y publicado como el adaptador "Sephirot" que sirve su red en qbc.network. Se trata del primer adaptador producido por su bucle de entrenamiento descentralizado de estilo DiLoCo que supera una evaluacion completa y se promociona al modelo servido en produccion, sustituyendo a aether-v7.1-unified. El adaptador es extremadamente pequeno: diez expertos de bajo rango con un router top-2 y aproximadamente 1,18 millones de parametros entrenables sobre un base de 7B.

La relevancia del artefacto no reside en su rendimiento bruto, sino en el mecanismo: demuestra un ciclo de entrenamiento distribuido por rondas cortas (unos 35 minutos) con agregacion de candidatos y una puerta de promocion que solo acepta mejoras medibles en un conjunto de validacion fijo. Segun la propia model card, todas las rondas se ejecutaron en maquinas operadas por la empresa, sin pagos ni contribuyentes externos, y la actualizacion permissionless es un diseno de cuatro etapas del que solo la primera esta construida.

El adaptador no redistribuye los pesos del base: debe cargarse Qwen/Qwen2.5-7B-Instruct y aplicar el adaptador encima con PEFT. La precision de servicio declarada es BF16, aunque el base se menciona como Q4_K_M en el texto de la model card, lo que constituye una inconsistencia a tener en cuenta. La licencia es Apache-2.0, heredada del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct; mezcla de expertos de bajo rango con router top-2 (10 expertos) |
| Parametros totales | Aproximadamente 1,18 millones de parametros entrenables en el adaptador (base de 7B no incluido) |
| Parametros activos | No disponible (el adaptador usa router top-2 sobre 10 expertos de bajo rango; el base no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct, no declarada explicitamente) |
| Tipos de cuantizacion | Adaptador en BF16 para servicio; el base se menciona como Q4_K_M en la model card, aunque la carga de ejemplo usa pesos sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el base por separado |

## Arquitectura y entrenamiento

El adaptador se compone de diez expertos de bajo rango combinados mediante un router top-2, lo que constituye una mezcla de expertos a nivel de adaptador sobre un transformer decoder-only congelado. El entrenamiento emplea un bucle de estilo DiLoCo: cada ronda dura aproximadamente 35 minutos, un trabajador toma un lote barajado de un corpus grande, entrena el adaptador localmente y envia un candidato. Un candidato solo se acepta si supera al candidato aceptado anteriormente en un conjunto de validacion fijo sobre el que nunca entrena. Diez rondas produjeron siete unidades aceptadas, y la mejor por evaluacion completa de validacion es esta version.

Una innovacion tecnica destacable es el paso backward con troceado de vocabulario (vocab-chunked), que mantiene un paso completo de adaptador sobre 7B dentro de aproximadamente 7,5 GB de memoria de video, permitiendo entrenar en tarjetas de gama consumer. No se especifica el numero total de tokens de entrenamiento ni la composicion del corpus. No se menciona RLHF ni DPO. La model card incluye una atestacion on-chain: weight_root SHA-256 sobre (base, adaptador, tokenizer, config) con valor 0x3e99b3d2f4e4d5eacbb3fe8d7e2f709dbfc48deb34407035383b3a5263e29e4e, ronda de registro 2 finalizada por quorum 4-de-5 validadores, bloque 1698355 y content root del adaptador 0x157a01b9.

## Capacidades

- Generacion de texto y razonamiento general, heredados del base Qwen2.5-7B-Instruct, con mejora medida en entropia cruzada sobre texto no visto.
- Razonamiento matematico multi-paso: mejora de +2,50 pp en GSM8K segun la evaluacion de promocion.
- Conocimiento general: se mantiene plano en MMLU (-0,07 pp), sin degradacion medible.
- Soporte de tool calling y function calling: no declarado explicitamente en la informacion proporcionada; dependera de las capacidades del base.
- Soporte de agentes y razonamiento multi-paso: no declarado explicitamente para el adaptador.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el adaptador no las anade.
- Integracion con PEFT: carga mediante `PeftModel.from_pretrained` sobre el base, lo que facilita su sustitucion y versionado.

## Casos de uso

- Servicio de inferencia en produccion sobre Qwen2.5-7B-Instruct: el adaptador se aplica encima del base congelado mediante PEFT, de modo que un operador puede desplegar el modelo servido con un cambio de adaptador sin reentrenar ni redistribuir el base, reduciendo el coste de actualizacion.
- Razonamiento matematico asistido: la mejora de +2,50 pp en GSM8K lo hace adecuado para tutoria de problemas aritmeticos y verificacion de calculos en flujos educativos o de analisis financiero simple, siempre con validacion posterior.
- Ajuste fino en hardware de gama consumer: el paso backward con troceado de vocabulario permite entrenar el adaptador con unos 7,5 GB de VRAM, lo que habilita experimentacion en tarjetas de consumo para equipos con recursos limitados.
- Investigacion en entrenamiento descentralizado: sirve como referencia reproducible para estudiar agregacion de candidatos, puertas de promocion y deteccion de mejoras espurias (memorizacion, bugs de ventana de muestreo, puertas con escala mixta).
- Verificacion de procedencia de modelos: la atestacion on-chain con weight_root SHA-256 permite auditar que el adaptador servido corresponde al entrenado y promocionado, util en pipelines con requisitos de trazabilidad.
- Generacion de texto general con contexto largo: al heredar la ventana del base Qwen2.5-7B-Instruct, puede emplearse en resumen y redaccion de documentos, aunque la longitud exacta de contexto no se declara en la informacion disponible.
- Evaluacion comparativa de adaptadores: su tamano minimo (1,18 M de parametros) lo convierte en un banco de pruebas barato para medir el impacto de cambios de adaptador sobre un base fijo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente; el campo `verified` es `false` en el model-index):

| Medicion | Base | Este adaptador | Cambio |
|---|---|---|---|
| Entropia cruzada en validacion (corpus limpio de 1000 ejemplos, nats) | 2,9014 | 2,5609 | -0,3405 |
| MMLU (completo, 14042 preguntas, sin limite) | 0,7116 | 0,7109 | -0,07 pp (plano) |
| GSM8K (completo, 1319 preguntas, sin limite) | 0,7248 | 0,7498 | +2,50 pp |

La model card afirma que los pesos BF16 servidos reproducen la entropia cruzada del candidato F32 hasta cuatro decimales, por lo que la ganancia de -0,3405 nats se mantiene en precision de servicio. Frente al adaptador servido anteriormente, la puerta de promocion midio una mejora adicional de entropia cruzada (2,5912 a 2,4811 en su propio conjunto de validacion). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador anade un coste despreciable (1,18 M de parametros); el requisito real lo marca el base Qwen2.5-7B-Instruct. En BF16 se estiman aproximadamente 15-16 GB de VRAM para pesos mas overhead; no se proporciona una cifra oficial.
- Entrenamiento del adaptador: aproximadamente 7,5 GB de VRAM gracias al paso backward con troceado de vocabulario, segun la model card.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por el perfil de VRAM, tarjetas consumer de 16 GB o mas podrian servir para inferencia en BF16, y tarjetas de 8 GB o mas para entrenamiento del adaptador, aunque esto es una estimacion no confirmada por el autor.
- Despliegue: la carga documentada usa transformers y PEFT (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la informacion proporcionada. Como referencia estructural, el adaptador se apoya en Qwen2.5-7B-Instruct; cualquier comparacion de rendimiento absoluto deberia hacerse contra ese base y contra adaptadores LoRA equivalentes, pero no hay datos disponibles para ello.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| aether-v7.2-unified | ~1,18 M entrenables (adaptador sobre 7B) | No disponible | Apache-2.0 | Hugging Face (adaptador) |
| Qwen2.5-7B-Instruct (base) | 7B | No disponible en esta ficha | Apache-2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y estan marcados como no verificados; no deben tratarse como resultados independientes.
- El adaptador no redistribuye el base: es necesario descargar Qwen2.5-7B-Instruct por separado y aplicar el adaptador con PEFT.
- Existe una inconsistencia en la model card entre el base descrito como Q4_K_M y la precision de servicio declarada en BF16; conviene verificar la configuracion real de despliegue.
- El propio autor reconoce que su evaluacion se equivoco tres veces durante el desarrollo (memorizacion sobre datos de entrenamiento, un bug de ventana de muestreo y una puerta de escala mixta que rechazo erroneamente una ronda valida), lo que subraya el riesgo de sobreestimar mejoras.
- El entrenamiento no fue permissionless: todas las rondas se ejecutaron en maquinas de la empresa, sin pagos ni contribuyentes externos; la capa economica de stake-and-slash y la agregacion robusta frente a contribuyentes maliciosos estan disenadas pero no construidas.
- La mejora en conocimiento general es nula (MMLU plano) y la ganancia se concentra en entropia cruzada y GSM8K; no hay evidencia de mejoras en otras tareas.
- No se declaran idiomas soportados ni longitud de contexto del adaptador; ambos dependen del base.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion proporcionada; heredados del base Qwen2.5-7B-Instruct.
- Licencia Apache-2.0 permite uso comercial, pero el cumplimiento debe verificarse tambien respecto al base y a cualquier dependencia de la cadena QBC.
- La atestacion on-chain y el registro de validadores son mecanismos del ecosistema del autor; su valor probatorio depende de la confianza en esa cadena y su quorum.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuantumAI-Blockchain/aether-v7.2-unified
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Adaptador anterior: https://huggingface.co/QuantumAI-Blockchain/aether-v7.1-unified
- Sitio del proyecto: https://qbc.network
- Articulo de ingenieria: https://qbc.network/blog/public-gpus-improved-the-served-model
