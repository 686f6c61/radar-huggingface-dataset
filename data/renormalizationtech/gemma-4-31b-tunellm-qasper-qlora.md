# RenormalizationTech/Gemma-4-31B-tuneLLM-QASPER-QLoRA

## Resumen

Gemma-4-31B-tuneLLM-QASPER-QLoRA es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `google/gemma-4-31B-it`, publicado por RenormalizationTech. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (122.429.440 parámetros, 820 tensores correspondientes a las 410 proyecciones del decodificador) y un helper de inferencia local. El objetivo declarado es mejorar la conformidad de formato y la concisión en respuestas cortas y en JSON sobre una proyección text-only personalizada del benchmark QASPER (preguntas sobre artículos científicos).

La relevancia del artefacto es metodológica más que de rendimiento bruto: documenta con detalle un experimento reproducible (un epoch, 61 pasos AdamW, semilla 42, 4,84 GPU-horas) con puertas de evaluación registradas de antemano y un informe de auditoría independiente. El autor es explícito al señalar que la mejora medida en F1 estricto se debe en gran parte a cumplimiento de formato (el baseline genera bloques de código JSON que el parser estricto rechaza) y a respuestas más cortas, no a una mejora de comprensión científica.

El adaptador está pensado para investigación y experimentación controlada, no como sustituto del modelo base en producción. La licencia declarada es Apache-2.0 sobre el adaptador, aunque el uso queda condicionado por la licencia del modelo base Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `Gemma4ForCausalLM` (modelo base Gemma 4 31B) |
| Parametros totales | 122.429.440 (solo adaptador; el base no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en el runtime estudiado (heredada del base) |
| Tipos de cuantizacion | Base en NF4 con doble cuantizacion y computo BF16; adaptador en FP32 (preparacion PEFT por defecto) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (adaptador); sujeta a la licencia del base Gemma |
| Formato de pesos | safetensors (adaptador PEFT); el base se descarga por separado |
| Rango LoRA / alpha / dropout | 16 / 32 / 0.05 |
| Modulos adaptados | 410 proyecciones del decodificador (820 tensores) |
| Tamano del repo | 0,5 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only (Gemma 4 31B en su variante instruct, `google/gemma-4-31B-it`, revision fijada en `842da3794eaa0b77d5f08bae87a17459d91ff475`). El entrenamiento usó QLoRA: el base se carga en NF4 con doble cuantizacion y computo BF16, mientras el adaptador LoRA (rango 16, alpha 32, dropout 0.05) se prepara en FP32. Se adaptaron las 410 proyecciones del decodificador, dando 820 tensores y 122.429.440 parametros entrenables.

El procedimiento fue un unico epoch sobre 482 registros de entrenamiento seleccionados, con acumulacion de gradiente 8, 61 pasos AdamW, learning rate 5e-5, weight decay 0.01 y semilla 42. Los checkpoints 21, 41 y 61 se compararon mediante NLL de respuesta ponderada por tokens sobre 101 registros de desarrollo, seleccionandose el paso 61. El coste registrado es de 4,84 GPU-horas de entrenamiento, 8,96 horas de wall time del estudio y 15,60 horas de GPU sumadas (medidas que incluyen la coexistencia con un contexto CUDA residente inactivo, por lo que no son tiempos exclusivos de dispositivo).

El runtime estudiado usa `Gemma4ForCausalLM` con `config.text_config`, mapeo explicito de claves `^model.language_model.`, SDPA, autocast externo BF16, generacion greedy con cache singleton, repetition penalty 1, sin modo thinking, EOS [1,106], tope de 512 tokens y contexto 8192. El autor advierte que la carga automatica generica de PEFT no reproduce este mapeo text-only ni la preparacion FP32 de pesos flotantes: es necesario usar el helper incluido para replicar el metodo reportado.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre articulos cientificos (QASPER), en formato de respuesta corta.
- Salida en JSON conforme (corrige el fallo de formato del base, que emitia bloques de codigo JSON con saltos de linea reales rechazados por el parser estricto).
- Respuestas concisas: la longitud mediana de respuesta no abstencionista baja de 35 a 3 palabras.
- Razonamiento numerico basico preservado (GSM8K fallback numerico: 126/128 antes y despues).
- Seguimiento de instrucciones estricto preservado (IFEval strict: 26/32 antes y despues).
- Conocimiento general de opcion multiple preservado con perdida menor (108/128 a 105/128).
- Capacidades multilingues: no disponibles (el adaptador es text-only y el estudio no evalua idiomas).
- Tool calling, agentes y razonamiento multi-paso: no evaluados ni documentados.
- Vision y audio: no soportados en la proyeccion text-only estudiada.

## Casos de uso

- Extraccion de respuestas cortas de literatura cientifica: el adaptador fuerza respuestas de pocas palabras y JSON valido, lo que lo hace util en pipelines de mineria de papers donde se necesita parseo automatico fiable.
- Evaluacion de metodologias de QLoRA: el repositorio documenta hashes de procedencia, puertas registradas y auditoria independiente, por lo que sirve como caso de estudio reproducible para investigadores que disenen experimentos de fine-tuning con criterios predefinidos.
- Prototipado de asistentes de lectura de papers: sobre el base Gemma 4 31B, el adaptador reduce la verbosidad y facilita la integracion con esquemas JSON en herramientas de resumen cientifico.
- Benchmarking de conformidad de formato: util para comparar parsers estrictos frente a laxos y medir cuanto de una mejora aparente se debe a formato y no a comprension.
- Investigacion sobre retencion de capacidades: las tareas de retencion (MC general, GSM8K, IFEval) sirven de plantilla para validar que un adaptador de dominio no degrada habilidades generales.
- Experimentos controlados de inferencia cuantizada: el helper documenta el perfil exacto (NF4, BF16, SDPA, greedy) para reproducir resultados en una unica GPU de 48 GB.

## Benchmarks y rendimiento

Resultados registrados por el autor sobre un conjunto de evaluacion reutilizado del proyecto (ya usado para Qwen) y una proyeccion text-only personalizada de QASPER. No es un conjunto heldout nuevo ni un resultado oficial del benchmark completo.

| Metrica | Base | Prompt | Adapter |
|---|---:|---:|---:|
| F1 estricto (puerta registrada, n=309) | 0.0000 | 0.0000 | 0.6401 |
| F1 laxo descriptivo (n=309) | 0.3338 | 0.3338 | 0.6401 |

| Tarea de retencion | Base | Adapter | Perdida neta permitida |
|---|---:|---:|---:|
| MC general | 108/128 | 105/128 | 5 |
| GSM8K fallback numerico | 126/128 | 126/128 | 5 |
| IFEval strict | 26/32 | 26/32 | 3 |

La ganancia en F1 laxo es de 0.3063, con intervalo bootstrap pareado del 95 % de [0.2513, 0.3617] (diagnostico, no puerta). La longitud mediana de respuesta no abstencionista cae de 35 a 3 palabras. El autor no reclama superioridad en seleccion de evidencia (F1 laxo de evidencia practicamente sin cambios) ni comprension cientifica general. El subconjunto estricto de evidencia tiene n=267; el total muestreado es n=403. Todas las puertas registradas de tarea y retencion pasaron, pero los limites de retencion son comprobaciones puntuales de muestra pequena, no garantias de no inferioridad estadistica. Estudio con una unica configuracion y semilla; no hay ranking amplio Gemma frente a Qwen.

## Requisitos de hardware

- VRAM estimada: el estudio uso una RTX A6000 de 48 GB con el base en NF4 y el adaptador en FP32. Un base de 31B en NF4 ocupa aproximadamente 16-18 GB, mas overhead de activaciones y contexto; 24 GB puede ser insuficiente para contexto 8192 y el perfil exacto documentado.
- GPU recomendadas: RTX A6000 48 GB (perfil verificado), A100 40/80 GB, H100, L40S. En consumer, RTX 4090 24 GB es arriesgado para el perfil exacto; requiere reducir contexto o cuantizacion adicional no documentada.
- Cabe en consumer GPU: solo con concesiones (contexto reducido, cuantizacion mas agresiva), fuera del perfil reproducido.
- Despliegue: el autor proporciona un helper de inferencia local con Torch 2.12.0+cu130, Transformers 5.23.0 y PEFT 0.21.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la carga automatica generica de PEFT no reproduce el metodo estudiado.
- Latencia y throughput: no disponibles. El unico dato temporal es el coste de entrenamiento (4,84 GPU-horas) y el wall time del estudio (8,96 h), no inferencia.
- Requisito de entorno: una GPU explicitamente visible, versiones exactas de dependencias y descarga del adaptador en un commit publico concreto con verificacion de hash.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-31B-tuneLLM-QASPER-QLoRA | 122,4 M (adaptador) sobre base 31B | 8192 (runtime estudiado) | Adaptador LoRA QLoRA | apache-2.0 (adaptador) | Hugging Face, 0 descargas |
| google/gemma-4-31B-it (base) | 31B | no disponible | Modelo completo instruct | licencia Gemma | Hugging Face |
| Adaptadores QLoRA de dominio publico (genericos) | variable | variable | Adaptador LoRA | variable | Hugging Face |

No se dispone de datos de benchmarks comparables de otros adaptadores QASPER sobre Gemma 4 31B en la informacion proporcionada. El propio autor indica que no existe un ranking amplio Gemma frente a Qwen y que el conjunto de evaluacion fue reutilizado de un proyecto previo con Qwen, por lo que la comparacion cruzada no es valida.

## Limitaciones y advertencias

- El resultado estricto esta dominado por formato: las 403 salidas del baseline usan bloques de codigo JSON con saltos de linea reales que el parser estricto rechaza, por lo que el 0.0000 base es un suelo de formato, no una medida de comprension.
- La mejora en F1 laxo puede reflejar concision y coincidencia con la referencia, no una ganancia de comprension subyacente.
- No se reclama superioridad en seleccion de evidencia: el F1 laxo de evidencia queda practicamente sin cambios.
- Conjunto de evaluacion reutilizado (ya usado para Qwen), no heldout nuevo ni resultado oficial del benchmark QASPER completo; posibles papers publicos en el pretraining del base.
- Estudio con una unica configuracion y semilla; los limites de retencion son comprobaciones puntuales de muestra pequena, no garantias de no inferioridad estadistica.
- El repositorio no contiene pesos base, modelo fusionado, checkpoint NF4, corpus de entrenamiento, estado del optimizador, scorer ni endpoint de inferencia alojado.
- La carga automatica generica de PEFT no reproduce el mapeo de claves text-only ni la preparacion FP32; hay que usar el helper incluido.
- Licencia: el adaptador declara apache-2.0, pero el uso comercial queda sujeto a los terminos del modelo base Gemma.
- Sin datos de idiomas soportados; el estudio es text-only y en un dominio cientifico concreto.
- Riesgo de alucinacion no evaluado en la informacion disponible; el adaptador no incorpora mecanismos de abstención documentados mas alla del comportamiento del base.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria independiente mas alla de la auditoria del propio autor.

## Enlaces

- Hugging Face: https://huggingface.co/RenormalizationTech/Gemma-4-31B-tuneLLM-QASPER-QLoRA
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Informe del estudio (commit fijado): https://github.com/RenormalizationTech/tuneLLM/blob/15f0d1d4d031a174027fe70035e2cc553f2d4d19/docs/gemma4_qasper_results.md
- Auditoria final independiente: https://github.com/RenormalizationTech/tuneLLM/blob/9323a83cef3f83901b31320a2bc6a3fc0a6f7ae2/results/reviews/gemma4_qasper_final_audit_review_02.md
- Catalogo de releases: https://github.com/RenormalizationTech/tuneLLM/blob/main/releases/catalog.json
- Guia de reproduccion: https://github.com/RenormalizationTech/tuneLLM/blob/main/docs/reproduce.md
