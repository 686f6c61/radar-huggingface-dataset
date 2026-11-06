# maxdemarzi/bjj-coach-7b-v3-lora

## Resumen
bjj-coach-7b-v3-lora es un adaptador LoRA de especializacion vertical en Brazilian Jiu-Jitsu (BJJ) y submission grappling, desarrollado por maxdemarzi y publicado en Hugging Face. Se construye sobre el modelo base Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only de 7.600 millones de parametros, y se distribuye bajo licencia Apache 2.0. Su proposito es actuar como entrenador tecnico especializado: diagnostico de posiciones, resolucion de problemas cinematicos, aplicacion de reglamentos (IBJJF, ADCC, EBI) y deteccion de premisas falsas o trampas de seguridad.

El entrenamiento sigue un pipeline de dos etapas. La primera combina Retrieval-Augmented Fine-Tuning (RAFT) multi-documento con QLoRA supervisado (r=64, alpha=128) sobre 3.217 conversaciones verificadas por criticos, con enmascaramiento de perdida solo en completions y un peso de 2,5x en tokens de decision. La segunda etapa aplica DPO con negativos duros y anclaje NLL sobre 583 pares de preferencia, cubriendo gates Go/No-Go, vectores cinematicos, casos limite de reglamento, cadenas de contraataque y trampas adversariales.

Es relevante porque demuestra un patron reproducible de especializacion estrecha sobre un modelo generalista: en lugar de un LLM generico, se obtiene un asistente de dominio con metricas internas muy altas en su benchmark propio (BJJ-Bench-250 v2), aunque con validacion externa limitada y un unico idioma soportado (ingles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7.600 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliable, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el entrenamiento uso QLoRA, pero no se listan formatos de cuantizacion publicados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen2.5-7B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, RoPE y sesgos de atencion QKV. Sobre esa base se entrena un adaptador LoRA de rango 64 y alpha 128, por lo que los pesos del modelo base permanecen congelados y solo se optimizan las matrices de bajo rango. El repositorio ocupa 1,6 GB, coherente con un adaptador mas los ficheros auxiliares.

La etapa 1 aplica RAFT (Retrieval-Augmented Fine-Tuning) con 6 extractos por ejemplo (4 oraculos y 2 distractores duros), sobre 3.217 conversaciones verificadas por criticos, 79 guias de posicion consensuadas, 105 auditorias multi-instructor y un grafo de conocimiento BJJ de 153 etiquetas. Se usa enmascaramiento de perdida solo en completions y un factor de 2,5x en los tokens de decision, lo que fuerza al modelo a prestar mas atencion a los pasos diagnosticos. La etapa 2 aplica DPO con 583 pares de preferencia de negativos duros mas un ancla NLL, cubriendo gates de diagnostico, vectores cinematicos, casos limite de reglamentos IBJJF/ADCC/EBI, 20 cadenas de contraataque competitivas y 15 trampas adversariales de premisa falsa y seguridad.

## Capacidades
- Generacion de texto conversacional especializada en BJJ y submission grappling.
- Razonamiento tecnico sobre biomecanica y vectores cinematicos de posiciones y transiciones.
- Diagnostico con gates Go/No-Go: decide si una accion es viable segun la configuracion corporal.
- Aplicacion de reglamentos competitivos (IBJJF, ADCC, EBI) y resolucion de casos limite.
- Cadenas de contraataque competitivas (20 documentadas en el entrenamiento).
- Citacion fundamentada multi-extracto: sintesis de 3 a 4 parrafos con referencias a 2 o mas oraculos.
- Resistencia a premisas falsas y trampas de seguridad (15 casos adversariales en entrenamiento).
- Nomenclatura y linaje tecnico del BJJ (50 casos evaluados en su benchmark).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso
- Asistente de diagnostico tecnico para practicantes: el modelo evalua la configuracion corporal descrita por el usuario y emite un veredicto Go/No-Go sobre la accion propuesta, apoyandose en los gates de diagnostico entrenados y en su tasa de acierto del 100% en trampas de su benchmark interno.
- Consulta de reglamento en competicion: permite resolver dudas sobre puntuacion, ventajas y sanciones bajo IBJJF, ADCC o EBI, incluyendo casos limite, gracias a los 50 casos de ruleset del suite de evaluacion.
- Planificacion de contraataques: dado un ataque del oponente, el modelo puede desplegar cadenas de contraataque competitivas entrenadas explicitamente (20 documentadas), utiles para preparacion de competicion.
- Formacion de instructores: sirve como herramienta de apoyo para profesores que necesitan verificar nomenclatura y linaje tecnico (50 casos evaluados con precision 4,95/5,0).
- Resolucion de problemas cinematicos: ante una transicion que falla, el modelo analiza vectores de fuerza, angulos y puntos de anclaje para proponer correcciones, con 75 casos de kinematic troubleshooting en su benchmark.
- Filtrado de desinformacion tecnica: su entrenamiento adversarial contra premisas falsas permite usarlo como verificador de afirmaciones dudosas sobre tecnicas o reglas.
- Generacion de material didactico: sintesis de 3 a 4 parrafos con citas a multiples extractos, util para redactar notas tecnicas o guiones de clase.
- Tutoria conversacional multi-turno: al ser un modelo instructivo, mantiene dialogos de seguimiento sobre una misma posicion o problema, aunque la longitud de contexto efectiva del adaptador no esta confirmada.

## Benchmarks y rendimiento
Los unicos datos disponibles son los del benchmark propio del autor, BJJ-Bench-250 v2, con 250 casos. No hay resultados en benchmarks generalistas (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de terceros.

| Categoria | Casos | Precision cinematica (1-5) | Accionabilidad (1-5) | Tasa de exito en trampas / alucinacion |
|---|---|---|---|---|
| Nomenclatura y linaje | 50 | 4,95 / 5,0 | 4,98 / 5,0 | 100,0% |
| Gates Go/No-Go de diagnostico | 75 | 4,98 / 5,0 | 5,00 / 5,0 | 100,0% |
| Troubleshooting cinematico | 75 | 4,98 / 5,0 | 5,00 / 5,0 | 100,0% |
| Ruleset, cadenas de contraataque y trampas | 50 | 4,89 / 5,0 | 4,96 / 5,0 | 100,0% |
| Total (BJJ-Bench-250 v2) | 250 | 4,96 / 5,0 | 4,99 / 5,0 | 100,0% |

Evaluacion adicional de grounding RAFT con 6 extractos (50 prompts, 4 oraculos y 2 distractores duros):

| Metrica | Valor |
|---|---|
| Tasa de citacion multi-oraculo (2 o mas) | 98,0% |
| Tasa de alucinacion de citacion de distractores | 0,0% |
| Tasa de sintesis tecnica de 3 a 4 parrafos | 100,0% |

Estos numeros proceden del propio autor y de un benchmark disenado por el mismo, por lo que deben interpretarse como validacion interna, no como evaluacion independiente.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia del modelo base Qwen2.5-7B-Instruct, en FP16 requiere aproximadamente 15-16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 4-5 GB. Estas cifras son estimaciones del base, no confirmadas para el adaptador.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del base, una RTX 4090 (24 GB) o A100 40 GB permitirian inferencia en FP16 sin problemas; una RTX 3090 (24 GB) tambien.
- Compatibilidad con GPU de consumo: probable en GPUs de 24 GB en FP16, y en GPUs de 8-12 GB si se cuantiza el base, aunque no hay confirmacion del autor.
- Opciones de despliegue: no disponible en la informacion proporcionada. Al ser un adaptador LoRA sobre Qwen2.5-7B-Instruct, seria desplegable con vLLM, TGI, llama.cpp u Ollama tras fusionar o cargar el adaptador, pero no se documenta en la ficha.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares
No hay modelos comparables directos en la informacion proporcionada. El unico punto de referencia es el modelo base Qwen/Qwen2.5-7B-Instruct, del que se diferencia por la especializacion vertical en BJJ y por el pipeline RAFT + DPO, no por tamano o arquitectura. No se dispone de datos de benchmarks de terceros ni de modelos de dominio comparable (por ejemplo, otros asistentes deportivos especializados) para establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| bjj-coach-7b-v3-lora | 7.600 M (base) + LoRA | no disponible | apache-2.0 | BJJ y grappling |
| Qwen/Qwen2.5-7B-Instruct | 7.600 M | 32.768 tokens (nativo del base) | apache-2.0 | Generalista |
| Alternativas de dominio | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un corpus curado de instructores y guias consensuadas, puede reflejar la escuela tecnica de esas fuentes y no cubrir estilos minoritarios.
- Riesgo de alucinacion: el autor reporta 0,0% de alucinacion de citacion de distractores y 100% de exito en trampas en su benchmark interno, pero estas cifras provienen de una evaluacion disenada por el mismo autor y no de una auditoria independiente. En produccion debe asumirse riesgo de alucinacion fuera de la distribucion entrenada.
- Limitaciones de contexto: la longitud de contexto efectiva del adaptador no esta documentada; aunque el base soporte 32.768 tokens, el comportamiento del LoRA mas alla de las ventanas usadas en entrenamiento es incierto.
- Limitaciones de idioma: solo ingles. No hay soporte declarado para castellano ni otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya. No hay clausulas adicionales documentadas.
- Caveats para produccion: el modelo tiene 10 descargas y 0 likes en el momento de la ficha, lo que indica validacion externa practicamente nula. El benchmark BJJ-Bench-250 v2 es propiedad del autor y no ha sido replicado por terceros. El adaptador debe combinarse con el modelo base Qwen2.5-7B-Instruct, anadiendo una dependencia adicional en el stack. No hay informacion sobre tool calling, agentes o despliegue en servidores de inferencia, lo que limita su integracion en pipelines automatizados sin trabajo adicional.

## Enlaces
- Modelo LoRA en Hugging Face: https://huggingface.co/maxdemarzi/bjj-coach-7b-v3-lora
- Modelo fusionado v3: https://huggingface.co/maxdemarzi/bjj-coach-7b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de evaluacion: https://huggingface.co/datasets/maxdemarzi/bjj-bench-250
- Paper de RAFT: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
