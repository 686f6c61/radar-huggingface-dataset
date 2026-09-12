# phuongntc/qwen3-0.6b-cefc-rft-vietnamese-legal

## Resumen

La ficha describe `phuongntc/qwen3-0.6b-cefc-rft-vietnamese-legal`, un adaptador LoRA de PEFT publicado por el usuario phuongntc para el modelo base Qwen/Qwen3-0.6B. No se trata de un modelo completo, sino de un adaptador de 0,1 GB de repositorio que se descarga y se aplica sobre los pesos de Qwen3-0.6B en tiempo de inferencia. Su tarea concreta es la sumarizacion abstractiva de documentos legales en vietnamita, con un sesgo deliberado hacia la fidelidad al texto fuente y la no invencion de metadatos legales (numeros de documento, fechas, organismos emisores).

El adaptador implementa el metodo CEFC-RFT (Conditional Explore-Exploit Faithfulness-Constrained Fine-Tuning), descrito por Tran, Vu, Nguyen, Hoang, Vu y Nguyen. Se trata de un ajuste fino guiado por recompensa de tipo offline: parte de una politica supervisada de sumarizacion, expande de forma condicional un conjunto finito de candidatos (explotacion determinista, exploracion determinista dirigida y exploracion estocastica acotada), selecciona pseudoetiquetas ancladas a la fuente con restricciones de fidelidad y metadatos, y realiza una continuacion LoRA ponderada solo sobre el turno del asistente. No es un checkpoint de PPO ni de GRPO en linea.

Su relevancia es doble. Por un lado, es un ejemplo reproducible de ajuste fino con recompensa fuera de linea sobre un modelo de 0,6B de parametros, con un coste de computo muy bajo. Por otro lado, cuantifica el ahorro del esquema condicional: en la ejecucion reportada sobre 5.000 documentos se generaron 12.936 candidatos en lugar de 15.000 con K=3 fijo, lo que supone una reduccion del 13,76 % en generacion de candidatos. El modelo se publica bajo licencia Apache-2.0 y solo declara vietnamita como idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con adaptador PEFT LoRA |
| Parametros totales | Adaptador: aproximadamente 8,7 M (estimacion a partir de rango 16 y modulos objetivo); modelo base: 0,6 B (596 M, 0,44 B sin embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card del adaptador; el modelo base Qwen3-0.6B soporta 32.768 tokens de forma nativa, ampliables con YaRN |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar en safetensors (fp32/fp16). Para cuantizar hay que fusionar el adaptador sobre el modelo base en fp16/bf16 y convertir despues a GGUF, AWQ o GPTQ |
| Idiomas soportados | Vietnamita (vi), declarado explicitamente. El modelo base es multilingue, pero el adaptador solo se ha entrenado para vietnamita |
| Licencia | Apache-2.0 (el modelo base Qwen3-0.6B tambien es Apache-2.0) |
| Formato de pesos | safetensors (adaptador LoRA de PEFT), libreria `peft` |

Datos concretos de configuracion LoRA:

| Hiperparametro | Valor |
|---|---|
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Ejemplos en la actualizacion final | 2.394 |
| Fuentes para seleccion por recompensa | 5.000 |
| Epocas | 1 |
| Learning rate | 2e-5 |
| Acumulacion de gradiente | 16 |
| Semilla de seleccion | 42 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-0.6B, un transformer decoder-only con atencion causal, normalizacion RMSNorm, RoPE y atencion con consultas agrupadas (GQA). La intervencion se limita a LoRA sobre las siete proyecciones de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango 16, alpha 32 y dropout 0,05. No se modifica la tokenizacion ni la cabeza de lenguaje, y la model card insiste en que el repositorio contiene unicamente el adaptador, no los pesos completos.

El entrenamiento sigue el procedimiento CEFC-RFT. Para cada documento legal, la etapa 1 genera un candidato con el prompt estandar de sumarizacion legal y decodificacion voraz. Solo si ese candidato no supera las puertas de validacion se activa la etapa 2, con un prompt orientado a acciones legales. Solo para los documentos aun no resueltos se genera un candidato muestreado en la etapa 3. Los candidatos se puntuan con fidelidad anclada a la fuente, coherencia, relevancia y comprobaciones deterministas de metadatos legales; se priorizan los candidatos factibles antes de optimizar la utilidad relevancia-coherencia. Sobre las 5.000 fuentes reportadas se generaron 12.936 candidatos, se seleccionaron 2.395 factibles y se retuvieron 2.394 para el ajuste ponderado, de los cuales 2.176 (90,89 %) tenian coste de metadatos cero. La actualizacion final es una continuacion LoRA ponderada, solo sobre el turno del asistente, de 1 epoca con tasa 2e-5 y acumulacion de gradiente 16. La configuracion exportada esta en `cefc_run_config.json`.

## Capacidades

- Generacion de resumenes abstractivos de documentos legales vietnamitas, priorizando contenido nuclear, sujetos, ambito, acciones legales, obligaciones/derechos y condiciones relevantes.
- Modo conversacional con plantilla de mensajes (`system`/`user`), heredado de Qwen3.
- Generacion condicionada por prompt: la model card recomienda un prompt de sistema explicito que prohibe anadir numeros, fechas, vigencia, organismo emisor o conclusiones juridicas que no aparezcan en la fuente.
- Fidelidad al texto fuente como criterio de entrenamiento, no solo como instruccion de prompt.
- Capacidad multilingue limitada en la practica: el adaptador esta entrenado solo con datos legales en vietnamita.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Vision, audio o thinking mode: no soportados.
- No se documenta ningun modo de razonamiento extendido ni decodificacion especulativa propia.

## Casos de uso

- Resumen de expedientes legales en vietnamita para despachos y departamentos juridicos: el modelo recibe el texto completo de una norma o contrato y devuelve un resumen corto con fidelidad anclada a la fuente, lo que reduce el tiempo de lectura previa antes de la revision humana.
- Triaje documental en plataformas de cumplimiento normativo: se puede procesar un lote de documentos y generar resumenes para clasificacion posterior, con el prompt de sistema recomendado para evitar que el modelo introduzca metadatos no presentes.
- Preprocesado para busqueda y recuperacion legal: los resumenes generados sirven como campo indexable adicional en un motor RAG sobre corpus de normativa vietnamita, manteniendo el documento original como fuente de verdad.
- Asistencia a la redaccion de boletines juridicos internos: el adaptador produce borradores de sintesis que un jurista revisa; el sesgo hacia la coherencia alta observado en el split out (4,34 sobre 5) favorece este uso cuando prima la legibilidad.
- Investigacion en ajuste fino con recompensa fuera de linea: el adaptador y su `cefc_run_config.json` sirven como referencia reproducible para comparar CEFC-RFT frente a DPO o SFT puro en tareas de sumarizacion de dominio.
- Despliegue en entornos con recursos muy limitados: al ser un adaptador sobre un modelo de 0,6 B, puede ejecutarse en CPU o en GPUs de gama baja para procesamiento por lotes nocturno de documentacion legal.
- Filtrado de alucinaciones en pipelines legales: dado que el metodo penaliza metadatos inventados, sirve como primera barrera antes de un modelo mayor, que solo revisa los casos dudosos.

## Benchmarks y rendimiento

Evaluacion con juez LLM anonimizado sobre pares fuente-resumen, escala entera 1-5, rubrica legal vietnamita congelada. La configuracion de juez reportada por los autores es ChatGPT GPT-5.5 en modo de razonamiento alto.

| Split | Faithfulness | Coherence | Relevance | Overall |
|---|---:|---:|---:|---:|
| Inner (500 documentos) | 3,94 | 3,92 | 3,96 | 3,94 |
| Out (392 documentos, cambio de distribucion) | 3,60 | 4,34 | 3,08 | 3,68 |

Metricas automaticas. ROUGE se reporta como F1; BERTScore usa `vinai/phobert-large` tras segmentacion de palabras en vietnamita.

| Split | ROUGE-1 F1 | ROUGE-2 F1 | ROUGE-L F1 | BERTScore F1 |
|---|---:|---:|---:|---:|
| Inner | 0,634 | 0,526 | 0,533 | 0,942 |
| Out | 0,171 | 0,137 | 0,148 | 0,903 |

La model card advierte que las referencias del split out son mucho mas largas que los resumenes generados, por lo que un ROUGE bajo de recall no debe interpretarse por si solo como fallo factual; recomienda leer conjuntamente la evaluacion anclada a la fuente y las metricas basadas en referencia.

Estadisticas del proceso de seleccion (no son benchmarks de calidad, sino de eficiencia del metodo):

| Metrica | Valor |
|---|---|
| Fuentes procesadas | 5.000 |
| Candidatos generados | 12.936 (frente a 15.000 con K=3 fijo) |
| Reduccion de generacion de candidatos | 13,76 % |
| Candidatos factibles seleccionados | 2.395 |
| Retenidos para ajuste | 2.394 |
| Pseudoetiquetas con coste de metadatos cero | 2.176 / 2.394 (90,89 %) |

## Requisitos de hardware

- VRAM estimada: el modelo base en bf16 ocupa aproximadamente 1,2 GB de pesos; sumando adaptador, cache KV y activaciones, la inferencia cabe holgadamente en 2-3 GB. En fp32 serian unos 2,4 GB solo de pesos.
- Cuantizado a 4 bits (GGUF Q4_K_M o similar), el conjunto baja a menos de 1 GB, lo que permite ejecucion en CPU con memoria RAM modesta.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (RTX 3050, RTX 4060, GTX 1660 Super, e incluso iGPU con memoria unificada). No requiere A100 ni H100; usarlas seria desaprovechar recursos.
- Cabe en GPU consumer: si, con amplio margen, y tambien en CPU y en dispositivos de borde con cuantizacion.
- Opciones de despliegue: `transformers` + `peft` (ruta recomendada por la model card, con `transformers>=4.51.0`, `peft`, `accelerate`, `safetensors` y `torch`); vLLM y TGI mediante soporte de adaptadores LoRA; SGLang; llama.cpp u Ollama tras fusionar el adaptador sobre el modelo base en fp16/bf16 y convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Con 0,6 B de parametros y un solo documento de entrada, se espera una latencia de decenas a pocos cientos de milisegundos por resumen en GPU consumer, pero no hay mediciones publicadas.
- El repositorio completo pesa 0,1 GB, lo que hace trivial el almacenamiento y la distribucion del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-0.6b-cefc-rft-vietnamese-legal | 0,6 B base + adaptador LoRA (r=16) | El del base (32.768 tokens nativos) | Ajuste con recompensa fuera de linea para sumarizacion legal en vietnamita | Apache-2.0 | Adaptador en HuggingFace, 0 descargas |
| Qwen/Qwen3-0.6B (base sin adaptar) | 0,6 B | 32.768 tokens | Modelo generalista multilingue, sin especializacion legal | Apache-2.0 | Ampliamente disponible |
| ViT5-base / ViT5-large (familia T5 vietnamita) | 0,22 B / 0,77 B | 512-1.024 tokens tipicamente | Modelos encoder-decoder preentrenados en vietnamita, usados habitualmente como base para sumarizacion | Apache-2.0 / MIT segun checkpoint | Ampliamente disponibles |
| Modelos Vietnamese legal summarization basados en mT5 o BARTPho | Variable | Variable | Sumarizacion supervisada, sin componente de recompensa | Variable | Repositorios de investigacion |

No se dispone de resultados de benchmarks comparativos entre este adaptador y esas alternativas en la informacion proporcionada, mas alla de las metricas del propio modelo. La ventaja estructural declarada es el ahorro del 13,76 % en generacion de candidatos durante el entrenamiento, no una mejora de calidad medida frente a terceros.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: requiere descargar Qwen/Qwen3-0.6B por separado y cargarlo con `peft`. No funciona de forma autonoma.
- Alcance idiomatico muy estrecho: solo vietnamita legal. En otros idiomas o dominios el comportamiento no esta caracterizado y la calidad esperada decae.
- Degradacion severa bajo cambio de distribucion: ROUGE-1 F1 pasa de 0,634 en el split inner a 0,171 en el split out, y la relevancia del juez cae de 3,96 a 3,08. Parte de esa caida se atribuye a referencias mucho mas largas, pero el propio autor admite que las metricas deben leerse conjuntamente.
- Riesgo de alucinacion en metadatos legales (numeros de documento, fechas, vigencia, organo emisor). El sesgo de entrenamiento y el prompt de sistema lo mitigan, pero no lo eliminan; 2.176 de 2.394 pseudoetiquetas retenidas tenian coste de metadatos cero, lo que implica que 218 presentaban algun coste.
- La evaluacion se apoya en un juez LLM automatico anonimizado, no en anotacion humana. No se reporta acuerdo entre anotadores ni validacion del juez.
- Orientado a resumenes cortos: en el split out las referencias eran mucho mas largas que las salidas, lo que sugiere un sesgo hacia resumenes breves y poca cobertura en documentos extensos.
- No hay evidencia de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- No es asesoramiento juridico: el resultado debe pasar siempre por revision humana cualificada antes de cualquier uso profesional.
- Licencia Apache-2.0 en el adaptador, permisiva para uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento (el campo `datasets` solo indica `other`, sin identificar el corpus legal empleado, lo que dificulta auditar la procedencia de los datos).
- La fecha de publicacion del repositorio es posterior a las fuentes de la busqueda web consultada, y dichas fuentes tratan sobre un incidente de seguridad ajeno a este modelo.

## Enlaces

- HuggingFace: https://huggingface.co/phuongntc/qwen3-0.6b-cefc-rft-vietnamese-legal
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper de CEFC-RFT: citado en la model card (Tran, Vu, Nguyen, Hoang, Vu y Nguyen, "CEFC-RFT: Conditional Explore-Exploit Faithfulness-Constrained Fine-Tuning for Vietnamese Legal Summarization"), sin enlace proporcionado en la informacion disponible.
- Repositorio de codigo: no disponible en la informacion proporcionada.
- Demo o espacio interactivo: no disponible.
- `cefc_run_config.json`: incluido en el propio repositorio de HuggingFace, sin URL directa especificada.
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante para este modelo. Las referencias devueltas (informe de METR sobre un incidente en Hugging Face, articulos de BBC, TechJournal y 80000hours) tratan sobre un incidente de seguridad de agentes de OpenAI ocurrido en 2026 y no guardan relacion con este adaptador.
