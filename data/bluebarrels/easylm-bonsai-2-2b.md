# Bluebarrels/easylm-bonsai-2-2b

## Resumen

`Bluebarrels/easylm-bonsai-2-2b` es un adaptador LoRA (PEFT) publicado por el usuario Bluebarrels sobre el modelo ternario `prism-ml/Ternary-Bonsai-2-2B-gguf`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (`adapter_model.safetensors`, 56 tensores y 278.524 elementos FP16 no nulos, equivalentes a unos 564 KB), pensados para cargarse junto al modelo base de 2.000 millones de parámetros cuantizado a 1,58 bits. El autor lo presenta como el "valor por defecto universal de 500 MB" para su ecosistema EasyLM/Hydra, orientado a inferencia en navegador mediante WebGPU.

El interés técnico está en la combinación: un base de 2B en formato ternario (aproximadamente 500 MB de huella) más un adaptador de rango 16 y menos de 1 MB de pesos, lo que permitiría ajustes de comportamiento muy ligeros y distribuibles en entornos de borde o client-side. El adaptador se entrenó, según la model card, sobre `Bluebarrels/easylm-training-corpus` (23.354 turnos en formato ChatML) con un corpus declarado de contenido académico, tablas de datos y currículo de herramientas.

La relevancia es limitada y hay que tomarla con cautela: el repositorio no tiene descargas ni valoraciones, no publica benchmarks, no declara idiomas y la model card mezcla especificaciones verificables con afirmaciones de marketing difíciles de comprobar (un "Consejo de Kami" de 151 libros, un grafo EMap de 46.025 nodos o un "Vision-Tower" de 262.144 tokens de contexto). Además, la model card cita como base WebGPU un modelo distinto (`mlc-ai/Qwen3.5-2B-q4f16_1-MLC`), lo que introduce ambigüedad sobre la arquitectura real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base `prism-ml/Ternary-Bonsai-2-2B-gguf`; detalles de capas y cabezas no disponibles). El repositorio contiene un adaptador LoRA PEFT, no pesos completos |
| Parametros totales | 2B nominales en el modelo base; el adaptador LoRA tiene 278.524 parametros entrenables en FP16 (unos 564 KB) |
| Parametros activos | No aplica (no se indica que el base sea MoE); no disponible |
| Longitud de contexto | 262.144 tokens, segun la model card del autor (no verificado; la card lo asocia a un "Vision-Tower" no documentado) |
| Tipos de cuantizacion | Base en ternario 1,58 bits (`bonsai_tq_f32`) y pesos GGUF; el adaptador se distribuye en safetensors FP16. No se documentan otras cuantizaciones (Q4, Q8, etc.) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | `adapter_model.safetensors` (PEFT LoRA) + configuracion PEFT; el modelo base se distribuye en GGUF ternario |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estandar de LoRA sobre las proyecciones de atencion y MLP: `r = 16`, `alpha = 32`, `dropout = 0.05` y modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, practicamente todas las matrices lineales del bloque transformer. Con 56 tensores y 278.524 elementos no nulos, la actualizacion efectiva de pesos es minima en relacion con los 2B del base, por lo que cabe esperar un ajuste de estilo y formato de respuesta mas que una reescritura de capacidades. El modelo base es una variante ternaria (1,58 bits) de 2B, lo que reduce la huella a unos 500 MB a costa de requerir kernels especificos para ese formato.

El entrenamiento se realizo, segun el autor, sobre `Bluebarrels/easylm-training-corpus`, con el fichero `adapter_easylm_master_chatml.jsonl` y 23.354 turnos en formato ChatML. La card describe la composicion del corpus (92 "stacks academicos", 369 tablas de datos con 4.634 filas cuantitativas, 151 libros de consejo, un grafo EMap con 46.025 nodos y 19.842 aristas, y un curriculo de CLI/agente Hydra v1.2.2), pero no aporta numero de tokens, mezcla de datos, hiperparametros de entrenamiento, ni indica si hubo RLHF, DPO o verificacion empirica de los datos. La innovacion declarada es de despliegue (adaptador diminuto sobre base ternario para WebGPU en navegador) mas que de arquitectura.

## Capacidades

- Generacion de texto conversacional multi-turno, condicionada al formato ChatML del corpus de entrenamiento.
- Razonamiento guiado y tutorizacion socratica: la card describe un "Socratic Antithesis Layer" con 6 modos de diagnostico de confusion y una maquina de estados de 7 fases; es una capacidad declarada, sin evaluacion publica.
- Soporte declarado de tool calling y ejecucion de herramientas dentro del ecosistema Hydra (`hydra agent`, `hydra swarm`, permisos `manual`, `accept_edits`, `plan`, `bypass`).
- Capacidades de agente y razonamiento multi-paso mediante el curriculo Hydra descrito en la card.
- Vision: el tag `vision` y la mencion a un "Vision-Tower" aparecen en la card, pero no se documenta el codificador visual ni como se integra en un adaptador LoRA de texto.
- Multilingue: no disponible; no se declara ninguna lista de idiomas.
- Contexto largo: 262.144 tokens declarados, sin datos sobre atencion usada (full, sliding o lineal) ni sobre degradacion a esa longitud.
- Integracion en navegador via WebGPU mediante carga y aplicacion del adaptador SafeTensors en el runtime EasyLM.

## Casos de uso

- Asistente conversacional en navegador: cargar el base ternario (~500 MB) mas este adaptador en WebGPU permite tener un chat que funciona sin backend, util en demos docentes o entornos con requisitos de soberania de datos; el adaptador apenas anade coste de memoria.
- Tutorizacion socratica de materias STEM: el formato de preguntas y estados descritos en el corpus estan pensados para guiar al estudiante en lugar de dar la respuesta; encaja en plataformas educativas que quieran un modelo pequeno y autoalojado en el dispositivo del alumno.
- Experimentacion con LoRA: con 0,55 MB de pesos y configuracion PEFT explicita, sirve como ejemplo reproducible de como un ajuste minimo modifica el estilo de un base ternario, util para investigacion sobre adaptadores de baja huella.
- Prototipado de agentes CLI: el adaptador se presenta como pieza del flujo `hydra agent` con permisos y modos de contexto (`recall`, `compact`, `sliding`); sirve para probar orquestacion de herramientas en local antes de pasar a variantes mayores de la familia (4B, 9B, 27B).
- Base para fine-tunes derivados: al ser un adaptador PEFT, se puede fusionar o descartar rapidamente para comparar comportamientos sobre el mismo base ternario, lo que agiliza iteraciones de ajuste en un solo equipo.
- Despliegue en hardware restringido: portatiles sin GPU dedicada, Chromebooks o moviles con WebGPU, donde un modelo de 2B en FP16 no cabria con holgura pero el ternario de 500 MB si.
- Clasificacion y extraccion de datos tabulares: las 4.634 filas de referencia cuantitativa descritas en el corpus sugieren un ajuste hacia respuestas factuales de tipo tabla, aplicable a asistentes de consulta de datos internos (siempre con verificacion externa).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y no hay evaluaciones de terceros al tratarse de un repositorio con 0 descargas y 0 valoraciones.

## Requisitos de hardware

- VRAM para pesos: unos 0,5 GB con el base ternario de 2B (1,58 bits); el adaptador LoRA en FP16 ocupa aproximadamente 0,55 MB adicionales.
- Cache KV: no disponible la configuracion exacta de capas y cabezas; a 262.144 tokens el coste de cache dominaria por completo el presupuesto de memoria y probablemente excede cualquier GPU de consumo. Como orientacion, a 4.096 tokens un 2B tipico con GQA requiere del orden de 0,5-1 GB extra en FP16.
- GPU recomendadas: cualquier GPU de consumo reciente (GTX 1660 6 GB, RTX 3060 12 GB, RTX 4090) sobra para el modelo en contextos cortos; para contextos de decenas de miles de tokens se recomienda A100 40/80 GB o H100. En el escenario objetivo (WebGPU en navegador) no se usa GPU de servidor.
- Cabe en GPU de consumo: si, con amplitud en contextos moderados; el limite practico es la cache KV, no los pesos.
- Opciones de despliegue: el adaptador es PEFT y requiere un runtime compatible; la card documenta su uso en el runtime WebGPU de EasyLM y en el CLI Hydra. No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, y el formato ternario `bonsai_tq_f32` puede no estar soportado por las herramientas GGUF convencionales.
- Latencia y throughput: no disponibles. En navegador, el rendimiento dependera de la implementacion WebGPU y del ancho de banda de memoria del dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| `Bluebarrels/easylm-bonsai-2-2b` (este) | 2B base + LoRA r=16 | 262.144 (declarado) | AGPL-3.0 | Safetensors PEFT sobre base ternario | no disponible |
| `prism-ml/Ternary-Bonsai-2-2B-gguf` (base) | 2B | no disponible en la informacion | no disponible en la informacion | GGUF ternario | no disponible |
| `mlc-ai/Qwen3.5-2B-q4f16_1-MLC` (citado como base WebGPU) | 2B | no disponible en la informacion | no disponible en la informacion | MLC q4f16_1 | no disponible |
| Otros adaptadores LoRA de ~2B en el hub | 2B + adaptador | no disponible | variable | Safetensors PEFT | no disponible |

No se dispone de datos verificables para comparar rendimiento con alternativas de la misma categoria; la unica comparacion posible en la informacion proporcionada es estructural (huella de memoria y formato de pesos).

## Limitaciones y advertencias

- No es un modelo autonomo: sin el base `prism-ml/Ternary-Bonsai-2-2B-gguf` el repositorio no es utilizable, y la card cita ademas un segundo base MLC distinto, lo que genera ambiguedad sobre con que pesos se entreno realmente.
- Verificabilidad: las afirmaciones sobre corpus (92 stacks, 369 tablas, 151 libros, EMap de 46.025 nodos) y sobre capacidades (vision, 262k de contexto, agente Hydra) no van acompanadas de datos, scripts ni evaluaciones; deben tratarse como declaraciones del autor.
- Riesgo de alucinacion: un base de 2B en formato ternario, con un ajuste de apenas 278.524 parametros, tiene una capacidad factual limitada; el sesgo del corpus hacia respuestas de tipo "hecho verificado" puede aumentar la confianza aparente de respuestas incorrectas.
- Idiomas: sin declaracion oficial; el corpus descrito es en ingles, por lo que el rendimiento en castellano es incierto y probablemente inferior.
- Contexto: los 262.144 tokens no estan respaldados por informacion sobre el mecanismo de atencion ni por pruebas de recuperacion a larga distancia; asumir esa ventana en produccion sin validacion es arriesgado.
- Licencia AGPL-3.0: copyleft fuerte, con obligacion de liberar el codigo fuente si se ofrece el modelo como servicio en red. Puede ser incompatible con productos propietarios o SaaS cerrados; requiere revision legal antes de uso comercial.
- Soporte de tooling: al ser un adaptador PEFT sobre un base ternario no estandar, la integracion con ecosistemas como llama.cpp, Ollama o vLLM no esta documentada y puede requerir trabajo de adaptacion.
- Madurez: 0 descargas, 0 likes y repositorio de ~0,0 GB; no hay senales de uso en produccion ni de mantenimiento por parte de terceros.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (solo contenido no relacionado), por lo que no se ha podido contrastar ninguna afirmacion de la model card con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bluebarrels/easylm-bonsai-2-2b
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/Bluebarrels/easylm-training-corpus
- Base WebGPU/MLC citada en la card: https://huggingface.co/mlc-ai/Qwen3.5-2B-q4f16_1-MLC
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
