# CaleraLabs/patentsec-12b-gguf

## Resumen

PatentSec-12B es un modelo de lenguaje especializado en prosecution de patentes estadounidenses, desarrollado por CaleraLabs sobre Google Gemma 4 12B Instruction (`google/gemma-4-12B-it`). Se distribuye como cuantizacion GGUF (Q4_K_M y Q8_0) para inferencia local completamente offline mediante Ollama, llama.cpp o LM Studio. Forma parte de la serie Calera Bedrock con el identificador interno `PROD-BEDROCK-001` y esta orientado a abogados de patentes, agentes registrados y departamentos juridicos internos que necesitan procesar documentacion confidencial sin sacarla del perimetro de la firma.

El modelo esta afinado para tareas concretas del ciclo de prosecution: verificacion de base antecedente bajo 35 U.S.C. § 112(b) y MPEP § 2173.05(e), cribado de elegibilidad bajo § 101 y MPEP § 2106, construccion de claim charts elemento por elemento segun *Pennwalt* bajo § 271(a), calculo de tasas de extension segun 37 CFR §§ 1.16-1.18 y 1.136, y computo de plazos estatutarios de respuesta bajo 35 U.S.C. § 21(b), 37 CFR § 1.7 y MPEP § 710.05. La model card declara una postura de "citation lock" que rechaza numeros de patente fabricados o fuera de horizonte en lugar de inventar file wrappers o examinadores ficticios.

Con 11.907.350.576 parametros, licencia Apache 2.0 y un unico idioma declarado (ingles), el modelo reporta un 77,0 % de acierto en la division mini de PatentBench v0.2.0 (Layer 1, 283 casos, en bf16 con vLLM y en modo "model alone"). Es relevante ahora porque cubre un nicho vertical con requisitos estrictos de privacidad y trazabilidad normativa, donde los modelos generalistas suelen fallar en citas y calculos de plazos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 4 12B Instruction; detalles especificos no disponibles) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp sugiere `-c 4096`, pero no se declara como contexto maximo oficial) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (publicadas); GGUF como formato de distribucion |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors como base del modelo original; el repo publica GGUF) |

## Arquitectura y entrenamiento

PatentSec-12B es un fine-tuning de dominio sobre `google/gemma-4-12B-it`, por lo que hereda la arquitectura transformer decoder-only del modelo base de Google. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset de ajuste, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado. El dataset de evaluacion referenciado es `rhahn/patentbench` (PatentBench v0.2.0), y la model card menciona entrenamiento directo sobre flujos de prosecution modernos del USPTO, lo que sugiere un corpus centrado en MPEP, estatutos (35 U.S.C.) y regulaciones (37 CFR).

La innovacion tecnica destacable no esta en la arquitectura sino en el comportamiento: el modelo implementa un mecanismo declarado de "Zero-Hallucination Citation Lock" que rechaza citas de patentes fabricadas o fuera del horizonte temporal conocido, en lugar de generar file wrappers, examinadores o fechas de envio ficticias. La model card distingue dos niveles de capacidad: Tier 1 (este GGUF, modelo aislado, 77,0 % en PatentBench Mini) y Tier 2 (modelo combinado con el runtime propietario Calera ICX, 92,6 % en Mini y 99,23 % en el corpus empresarial completo), aunque el Tier 2 no forma parte de estos pesos.

## Capacidades

- Generacion de texto y razonamiento juridico especializado en prosecution de patentes estadounidenses.
- Verificacion de base antecedente en reivindicaciones bajo 35 U.S.C. § 112(b) y MPEP § 2173.05(e).
- Cribado de elegibilidad de materia patentable bajo 35 U.S.C. § 101 y MPEP § 2106.
- Construccion de claim charts elemento por elemento segun el test *Pennwalt* bajo 35 U.S.C. § 271(a).
- Calculo de tasas de extension segun 37 CFR §§ 1.16-1.18 y 1.136 (la model card declara 100,0 %, 90/90, en tablas de tasas de extension del USPTO).
- Computo de plazos estatutarios de respuesta bajo 35 U.S.C. § 21(b), 37 CFR § 1.7 y MPEP § 710.05, incluyendo festivos federales.
- Refusal controlado ante dockets o numeros de patente desconocidos (citation lock).
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades de tool calling, function calling, agentes multi-paso, vision o audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Auditoria de reivindicaciones en despacho: el modelo revisa la base antecedente de cada termino en una reivindicacion bajo § 112(b) y MPEP § 2173.05(e), señalando introducciones sin antecedente previo. Adecuado por su entrenamiento especifico en esta norma y por ejecutarse offline en un portatil Apple Silicon de 16 GB.
- Cribado de elegibilidad § 101 antes de presentar: se introduce el borrador de reivindicaciones y el modelo aplica el marco de MPEP § 2106 para identificar riesgos de abstraccion judicial. Util para in-house counsel que necesita un primer filtro sin enviar el borrador a un servicio en la nube.
- Construccion de claim charts de infraccion: dado un conjunto de reivindicaciones y una descripcion de producto acusado, el modelo genera un chart elemento por elemento segun *Pennwalt* (§ 271(a)). La ventaja es la trazabilidad y el rechazo a inventar referencias.
- Calculo de plazos de respuesta a Office Actions: con la fecha de envio y el periodo estatutario acortado, el modelo computa el plazo exacto bajo 35 U.S.C. § 21(b) y 37 CFR § 1.7, incluyendo festivos federales, y devuelve la tabla de tasas de extension aplicable (small entity, 2 meses, etc.).
- Presupuestacion de tasas USPTO: el modelo genera tablas de tasas de extension y mantenimiento segun 37 CFR §§ 1.16-1.18 y 1.136, con 100,0 % de acierto declarado en las 90 tablas de extension evaluadas.
- Despliegue air-gapped en firma juridica: al distribuirse como GGUF Q4_K_M (7,38 GB), se ejecuta en Ollama o llama.cpp sin conexion, de modo que las invenciones no publicadas y los borradores provisionales no salen del perimetro del despacho.
- Asistencia en borradores de respuesta: el modelo puede redactar borradores de respuesta a Office Actions citando el MPEP aplicable, sujeto a revision obligatoria por un agente registrado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Benchmark | Metrica | Resultado | Condiciones |
|---|---|---|---|
| PatentBench v0.2.0, Layer 1 Mini Split | Accuracy (283 casos) | 77,0 % (218/283) | bf16, vLLM, modelo aislado |
| PatentBench v0.2.0, Layer 1 Mini Split (tareas autocontenidas) | Accuracy | 96,5 % (218/226) | Segun la model card |
| Tablas de tasas de extension USPTO | Accuracy | 100,0 % (90/90) | Segun la model card |
| PatentBench v0.2.0 Mini (Tier 2, con Calera ICX) | Accuracy | 92,6 % (262/283) | No aplicable a estos pesos |
| Corpus empresarial completo (Tier 2, con Calera ICX) | Accuracy | 99,23 % (7.042/7.097) | No aplicable a estos pesos |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de Tier 2 corresponden al producto hospedado con el runtime propietario Calera ICX y no son reproducibles con estos pesos GGUF por si solos.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M ocupa 7,38 GB (`7.381.382.848` bytes) y Q8_0 ocupa 12,67 GB (`12.669.646.528` bytes).
- La model card indica que Q4_K_M funciona en cualquier Mac con chip M-series de 16 GB o mas, o en GPU con 8 GB o mas de VRAM; Q8_0 requiere 24 GB o mas de RAM (Mac Studio) o una GPU de estacion de trabajo.
- Cabe en GPU de consumo: si, Q4_K_M en GPUs de 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070); Q8_0 requiere GPUs de 16-24 GB (RTX 4080, RTX 4090, RTX 3090).
- GPU profesionales recomendadas para mayor throughput: A100, H100 (no especificadas por el autor, pero coherentes con el tamano del modelo).
- Opciones de despliegue: Ollama (`ollama run hf.co/CaleraLabs/patentsec-12b-gguf`), llama.cpp (`llama-cli -hf ...`), LM Studio, y vLLM en bf16 para evaluacion (usado por el autor para el benchmark).
- Latencia y throughput: no disponibles para estos pesos GGUF. La model card cita 117 ms de prefill y 4.846 tok/s en el runtime Calera Wavefront, pero esos datos corresponden al Tier 2 hospedado y no a la inferencia local con llama.cpp u Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| PatentSec-12B (este) | 11,9 B | no disponible | Prosecution de patentes USPTO | Apache 2.0 | GGUF (Q4_K_M, Q8_0) |
| google/gemma-4-12B-it (base) | 12 B (aproximado) | no disponible | Proposito general, instrucciones | Gemma Terms (no disponible en la informacion) | safetensors |
| Modelos juridicos generalistas (p. ej. variantes legales de 7-13 B) | no disponible | no disponible | Derecho general, no prosecution USPTO | variable | variable |

No se dispone en la informacion proporcionada de benchmarks comparativos frente a alternativas de la misma categoria, por lo que la comparativa se limita a parametros, licencia y formato. El modelo base Gemma 4 12B Instruction es la referencia natural, pero PatentSec-12B anade el ajuste de dominio y la cuantizacion GGUF lista para uso offline.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- El benchmark de 77,0 % procede del propio autor y esta marcado como `verified: false`; no hay validacion independiente.
- La distincion Tier 1 / Tier 2 es critica: los resultados del 92,6 % y 99,23 % requieren el runtime propietario Calera ICX y no se obtienen con estos pesos.
- Riesgo de alucinacion en citas: aunque la model card declara un "citation lock", no hay evidencia independiente de que elimine por completo las citas fabricadas; se recomienda verificacion humana.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al estar entrenado sobre corpus del USPTO, puede heredar sesgos doctrinales y de redaccion de esa fuente.
- Limitaciones de contexto: la longitud maxima de contexto no se declara; los ejemplos usan `-c 4096`, lo que sugiere que el uso practico puede estar limitado a ventanas moderadas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el modelo base Gemma 4 puede imponer terminos adicionales de Google que no se detallan en la informacion disponible; conviene revisar la licencia del modelo base antes de desplegar en produccion.
- No es asesoramiento juridico: el modelo debe usarse como herramienta de apoyo con revision obligatoria por un agente de patentes registrado.
- El repositorio tiene 232 descargas y 0 likes en el momento de la consulta, lo que indica adopcion limitada y poca validacion por la comunidad.
- El checksum SHA-256 del archivo Q8_0 aparece truncado en la model card; no se puede verificar la integridad completa del artefacto con la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/CaleraLabs/patentsec-12b-gguf
- Coleccion Calera Bedrock: https://huggingface.co/collections/CaleraLabs/bedrock-models-6ad809297e55c1dd65da2e43
- Portal PatentSec: https://patent.caleralabs.com
- Calera ICX: https://icx.caleralabs.com
- Documentacion: https://caleralabs.com/docs
- Space PatentSec Examiner Arena: https://huggingface.co/spaces/CaleraLabs/patentsec-examiner-arena
- Dataset PatentBench: https://huggingface.co/datasets/rhahn/patentbench
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
