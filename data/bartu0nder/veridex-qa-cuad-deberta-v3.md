# Bartu0nder/Veridex-QA-cuad-deberta-v3

## Resumen

Veridex-QA es un modelo de question answering extractivo especializado en la localizacion de clausulas de riesgo en contratos comerciales. Lo desarrolla el usuario Bartu0nder y es un fine-tuning de microsoft/deberta-v3-base sobre el dataset CUAD (Contract Understanding Atticus Dataset), compuesto por 510 contratos comerciales anotados por abogados y organizados en 41 categorias de clausula. Dado un contrato y una pregunta con la formulacion exacta de CUAD, el modelo devuelve el fragmento literal que contiene la clausula o se abstiene cuando esta no aparece.

Arquitectonicamente es un transformer encoder de tipo DeBERTa-v3, con 183.833.090 parametros y una ventana de 384 tokens por pasada. Como los contratos superan ampliamente esa ventana, la inferencia se realiza con ventana deslizante (stride 128) y comparacion contra el logit de la clase CLS para decidir la abstención, tal como se entreno. No genera texto: solo extrae spans.

Su relevancia es practica: cubre la etapa de deteccion de clausulas de un servicio de revision contractual (Veridex) y ofrece una metrica orientada a despliegue, `Recall at 80% precision` (59,24), que mide cuantas clausulas presentes se capturan manteniendo los falsos positivos por debajo del 20%. Es un modelo de triaje, no un asesor legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (attention disentangled, preentrenamiento estilo ELECTRA con replaced token detection) |
| Parametros totales | 183.833.090 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 384 tokens por ventana; inferencia sobre documentos largos mediante ventana deslizante con stride de 128 y maximo de 256 tokens entre inicio y fin de la respuesta |
| Tipos de cuantizacion | No disponible. No se publican variantes GGUF, AWQ, GPTQ ni int8; el checkpoint safetensors puede cuantizarse externamente con herramientas de transformers/PyTorch |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (libreria transformers; compatible con endpoints) |

## Arquitectura y entrenamiento

El modelo parte de microsoft/deberta-v3-base, un encoder de 183,8 millones de parametros. DeBERTa-v3 combina atencion disentangled (los vectores de contenido y de posicion se calculan por separado) con un preentrenamiento al estilo ELECTRA basado en deteccion de tokens reemplazados, en lugar del enmascaramiento clasico. Sobre esa base se anade una cabeza de question answering extractivo con logits de inicio y fin, mas el logit de CLS que actua como puntuacion de "sin respuesta".

El fine-tuning se realizo sobre CUAD: 510 contratos comerciales (suministro, distribucion, licencia, servicios, NDA y acuerdos con afiliadas) y 41 categorias de clausula con anotacion experta. El modelo aprende la asociacion entre la formulacion literal de la pregunta (`Highlight the parts of this contract related to "<Category>".`) y cada categoria, de modo que la inferencia debe respetar ese formato. La configuracion de inferencia documentada (ventana 384, stride 128, max_length del span 256 tokens) coincide con la empleada en el entrenamiento, y la decision de abstención se toma comparando la mejor puntuacion de span contra la puntuacion de CLS agregada sobre todas las ventanas. No se documentan en la informacion disponible fases de RLHF, DPO ni datos adicionales de ajuste.

## Capacidades

- Question answering extractivo: devuelve el span literal del contrato que responde a la pregunta, sin generar texto nuevo.
- Deteccion de 41 categorias de clausula de CUAD: ley aplicable, seguro, fecha de expiracion, no captacion de empleados, propiedad intelectual conjunta, limite de responsabilidad, renovacion automatica, exclusividad, cambio de control, terminacion por conveniencia, licencia no transferible, entre otras.
- Abstención calibrada: si la clausula no esta presente, la comparacion contra el logit de CLS permite responder "clause not present" (88,56% de abstención correcta en clausulas ausentes).
- Procesamiento de contratos largos: mediante ventana deslizante cubre documentos que exceden con creces los 384 tokens por pasada.
- Robustez ante formulaciones cercanas: distingue categorias con anclas lexicas claras (ley aplicable, seguro) con F1 superior a 94.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un modelo de una sola pasada sobre la evidencia.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo "thinking", vision, audio ni generacion libre de texto.

## Casos de uso

- Triaje de revision contractual en despachos y departamentos legales: el modelo localiza en segundos los fragmentos que un abogado debe leer, reduciendo el tiempo de barrido sobre contratos de decenas de miles de tokens que no caben en un prompt de LLM.
- Due diligence en operaciones de M&A: sobre un repositorio de cientos de contratos, ejecutar las 41 preguntas de CUAD en lote y producir un informe de que contratos contienen clausulas de cambio de control, exclusividad o limites de responsabilidad.
- Gestion de contratos con proveedores y distribuidores: detectar renovacion automatica y plazos de preaviso para disparar avisos antes de la fecha de corte, usando la categoria `Expiration Date` y `Renewal Term`.
- Pre-filtrado para pipelines con LLM: usar Veridex-QA como etapa barata que aisla los spans candidatos y pasar solo esos fragmentos (cientos de tokens en lugar de decenas de miles) a un modelo generativo para la redaccion del resumen final, con una reduccion directa del coste por token.
- Clasificacion y enriquecimiento de un CLM (Contract Lifecycle Management): etiquetar automaticamente cada contrato con las categorias de clausula presentes y persistir los spans como metadatos consultables.
- Auditoria de cumplimiento en NDAs y acuerdos de licencia: verificar la presencia o ausencia de clausulas de confidencialidad, licencia no transferible o cesion de propiedad intelectual antes de la firma.
- Analisis de riesgo en carteras de contratos de seguro o servicios financieros: extraer ley aplicable (F1 97,39) y clausulas de seguro (F1 94,80), las dos categorias con mejor rendimiento, para poblar un registro de exposicion legal.
- Revision asistida con interfaz humana: integrar el modelo como resaltador de spans en un visor de documentos, donde el revisor confirma o descarta cada deteccion; el modelo esta explicitamente disenado como ayuda de triaje y no como decision automatica.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card, sobre el split de test oficial de CUAD (102 contratos reservados, 4.182 preguntas y 195.805 ventanas deslizantes). Ningun contrato de test aparece en entrenamiento. Los valores no estan verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| F1 (SQuAD v2) | 87,06 |
| Exact match (SQuAD v2) | 83,98 |
| F1 en preguntas con respuesta | 83,52 |
| Exact match en preguntas con respuesta | 73,15 |
| Abstención correcta en clausulas ausentes | 88,56 |
| Recall at 80% precision | 59,24 |

Mejores y peores categorias de las 41, por F1:

| Categoria fuerte | F1 | Categoria debil | F1 |
|---|---|---|---|
| No-Solicit Of Employees | 98,35 | Effective Date | 61,93 |
| Joint IP Ownership | 97,43 | Post-Termination Services | 67,44 |
| Governing Law | 97,39 | Termination For Convenience | 67,98 |
| Insurance | 94,80 | Non-Transferable License | 73,94 |
| Expiration Date | 91,97 | Change Of Control | 75,12 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 735 MB en fp32 (183,8 M de parametros), 368 MB en fp16/bf16 y 184 MB en int8. A ello se suma una memoria de activaciones modesta, ya que cada pasada procesa solo 384 tokens.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo, incluso en fp32.
- GPU de centro de datos recomendadas para servir en lote: T4, L4, A10, L40S, A100 o H100; el cuello de botella no es la memoria sino el numero de ventanas a evaluar por documento.
- Inferencia en CPU: viable para volumenes bajos, aunque con coste elevado por el numero de forward passes. Con stride 128 y ventana 384, cada ventana avanza 256 tokens, de modo que un contrato de 50.000 tokens requiere aproximadamente 196 ventanas, y el modelo debe puntuar todos los pares inicio-fin validos de cada ventana (longitud de span limitada a 256 tokens).
- Opciones de despliegue: transformers con `AutoModelForQuestionAnswering`, pipeline de question-answering, exportacion a ONNX Runtime o TorchScript, y Hugging Face Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`). vLLM, llama.cpp, Ollama y TGI no aplican de forma nativa: no hay pesos GGUF y el modelo es un encoder extractivo, no un generador autoregresivo.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bartu0nder/Veridex-QA-cuad-deberta-v3 | 183.833.090 | 384 tokens por ventana (ventana deslizante) | QA extractivo sobre 41 categorias de CUAD | CC BY 4.0 | Hugging Face, safetensors, transformers, endpoints compatibles |
| microsoft/deberta-v3-base | 183.833.090 (mismo backbone) | Longitud maxima posicional no especificada en la informacion disponible | Modelo base de lenguaje, sin cabeza de QA especializada | no disponible en la informacion proporcionada | Hugging Face, safetensors |
| Otros fine-tunings sobre CUAD | no disponible | no disponible | QA extractivo legal | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados comparativos con otros modelos ajustados sobre CUAD (por ejemplo variantes basadas en BERT o RoBERTa), por lo que la comparacion cuantitativa con alternativas de la misma categoria queda como no disponible.

## Limitaciones y advertencias

- Ventana de 384 tokens: obliga a ventana deslizante con stride 128. Esto fragmenta el contexto y puede producir spans truncados en los bordes de ventana, ademas de multiplicar el coste de inferencia en contratos largos.
- Dependencia de la formulacion: el modelo solo funciona correctamente con la plantilla de pregunta de CUAD (`Highlight the parts of this contract related to "<Category>".`). Reformular la pregunta degrada el rendimiento.
- No es asesoramiento legal: la propia model card lo califica como ayuda de triaje. No debe usarse como base unica para una decision contractual.
- Alucinacion acotada pero real: al ser extractivo no puede inventar texto, pero si puede seleccionar el span equivocado y generar falsos positivos. En `Termination For Convenience`, el F1 agregado de 67,98 sube a 90,84 cuando la clausula esta presente, lo que indica que el problema son los falsos positivos.
- Confusiones entre categorias proximas: `Effective Date`, `Agreement Date` y `Expiration Date` se confunden con frecuencia, igual que `Termination For Convenience` con la terminacion por causa. `Effective Date` obtiene el peor F1 del conjunto (61,93).
- Solo ingles: no hay soporte multilingue, lo que invalida su uso directo sobre contratos en castellano.
- Metricas no verificadas: los resultados del model-index estan marcados como `verified: false` y proceden del propio autor.
- F1 inflado por el formato del test: en CUAD, las preguntas con respuesta tienen de media 2,12 spans dorados aceptados (hasta 19) y el scoring tipo SQuAD acredita la mejor coincidencia, por lo que la metrica no es directamente comparable con una evaluacion de respuesta unica.
- Adopcion minima: el repositorio registra 0 descargas y 1 like, con creacion y ultima actualizacion separadas por unos cinco minutos. No hay validacion independiente ni comunidad de usuarios.
- Licencia CC BY 4.0: permite uso comercial siempre que se atribuya la autoria, pero no incluye concesion explicita de patentes. Conviene revisar la procedencia de los datos de entrenamiento antes de un despliegue en produccion regulada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bartu0nder/Veridex-QA-cuad-deberta-v3
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Dataset CUAD en Hugging Face: https://huggingface.co/datasets/theatticusproject/cuad-qa
- Proyecto CUAD (Atticus Project): https://www.atticusprojectai.org/cuad

No se han encontrado en la informacion disponible enlaces a papers, blogs tecnicos, repositorios de codigo o demos adicionales.
