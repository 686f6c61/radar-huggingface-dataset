# khadidjabahfir/dziribert_seq2seq_drug_rehab

## Resumen

DziriBERT-Seq2Seq-Rehab es un modelo encoder-decoder (seq2seq) de generacion de texto desarrollado por el equipo de Khadidja Bahfir en ENSIA (Escuela Nacional Superior de Inteligencia Artificial, Argelia). Esta disenado especificamente para ofrecer acompanamiento psicologico y apoyo en procesos de rehabilitacion de adicciones a drogas en dialecto argelino (darja), con un marco cultural islamico. El modelo parte del encoder preentrenado DziriBERT y le anade un decoder Transformer ligero inicializado mediante weight tying.

La relevancia del modelo reside en su estrategia de despliegue: es un modelo seq2seq destilado desde un teacher Atlas-2B mediante Latent Reasoning Distillation, exportado a ONNX y cuantizado a 8 bits, con un tamano final de aproximadamente 206 MB. Esto permite inferencia 100% offline en dispositivos moviles, garantizando privacidad y soberania de datos en un contexto sensible como es el tratamiento de adicciones.

El modelo maneja code-switching natural entre arabe argelino y frances, reflejando el uso linguistico real de la poblacion objetivo. Se distribuye con licencia Apache 2.0 y esta orientado a un caso de uso muy concreto: agentes conversacionales de apoyo en salud mental dentro de aplicaciones moviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-Decoder (Seq2Seq Transformer); encoder DziriBERT + decoder Transformer ligero |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (ONNX quantized); pesos originales en safetensors/PyTorch via transformers |
| Idiomas soportados | Arabe argelino (darja) con code-switching arabe/frances |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (8-bit, ~206 MB); compatible con transformers/PyTorch |
| Modelo base | alger-ia/dziribert |
| Teacher model | Atlas-2B fine-tuned |
| Tamano del repo | 0.2 GB |
| Desarrollado por | ENSIA (Argelia) |

## Arquitectura y entrenamiento

El modelo se construye en tres etapas. Primero, se parte de DziriBERT, un encoder preentrenado especificamente para dialecto argelino, y se le acopla un decoder Transformer compacto. Para evitar entrenar desde cero, se comparten y atan (weight tying) los pesos de las capas de atencion preentrenadas de DziriBERT en los modulos de self-attention y cross-attention del decoder.

Segundo, se aplica Latent Reasoning Distillation: se usa un modelo Atlas-2B afinado como teacher. Durante el entrenamiento, los estados ocultos del decoder student se reescalan y alinean con las representaciones internas de razonamiento del teacher mediante una funcion de perdida combinada: Cross-Entropy Loss + alpha * (MSE(h_s, h_t) + CosineSimilarity(h_s, h_t)).

Tercero, el modelo entrenado se exporta a ONNX y se cuantiza a 8 bits, reduciendo el tamano final a 206 MB para ejecucion offline en procesadores moviles. El entrenamiento se realizo sobre un dataset curado manualmente de 10.000 instancias en darja argelina, estructurado para rehabilitacion de adicciones dentro de un marco psicoespiritual islamico. Los datos se obtuvieron de guias medicas de rehabilitacion validadas y literatura psicoespiritual islamica, traducidos y localizados manualmente al darja, y revisados mediante un pipeline de tres niveles: revision distribuida, validacion cruzada y auditoria religiosa.

## Capacidades

- Generacion de texto conversacional en dialecto argelino (darja) con code-switching natural arabe/frances.
- Acompanamiento psicologico y orientacion en procesos de rehabilitacion de adicciones.
- Generacion de respuestas empaticas dentro de un marco cultural islamico.
- Dialogo multi-turno controlado (el modelo esta disenado para generacion de texto condicionada por prompt).
- Inferencia 100% offline en dispositivos moviles mediante ONNX 8-bit.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso mas alla de la destilacion de razonamiento latente.
- Capacidades multilingues limitadas a arabe argelino y frances.

## Casos de uso

- Aplicacion movil de apoyo en rehabilitacion: el modelo se integra en una app Android/iOS que ofrece respuestas de acompanamiento psicologico offline, sin enviar datos del usuario a servidores externos, gracias a los 206 MB del modelo ONNX cuantizado.
- Agente conversacional de primera acogida: gestiona conversaciones iniciales con personas que buscan ayuda para dejar las drogas, ofreciendo orientacion empatica en darja y derivando a recursos profesionales cuando sea necesario.
- Educacion y prevencion: puede generar contenido educativo sobre adicciones adaptado culturalmente, util en campanas de concienciacion dirigidas a poblacion argelina.
- Soporte en zonas con conectividad limitada: al operar 100% offline, es adecuado para entornos rurales o con red intermitente donde una API en la nube no es viable.
- Investigacion en NLP dialectal: sirve como base para estudiar tecnicas de destilacion de razonamiento latente y adaptacion de encoders a tareas seq2seq en dialectos de bajo recursos.
- Prototipado de asistentes culturalmente sensibles: el pipeline de curacion con auditoria religiosa lo hace util como referencia para construir asistentes que respeten marcos culturales especificos.

## Benchmarks y rendimiento

Resultados experimentales reportados por el autor (loss de entrenamiento cross-entropy y evaluacion cualitativa):

| Arquitectura | Training loss (cross-entropy) | Evaluacion cualitativa |
|---|---|---|
| DziriBERT + GRU | 5.0348 | Sin convergencia; bucles de palabras repetitivas |
| DziriBERT + Transformer | 2.1500 | Coherencia moderada; sin profundidad de razonamiento |
| Teacher-Student Distillation (final) | 1.6000 | Alta coherencia; fuerte fidelidad dialectal y empatia |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el modelo ONNX 8-bit (~206 MB de pesos); el modelo PyTorch original requiere mas memoria pero no se especifica la cifra exacta.
- GPU recomendadas: no requiere GPU; disenado para CPU de moviles. Para entrenamiento o inferencia en servidor, cualquier GPU consumer es suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (formato principal), transformers/PyTorch (AutoModelForSeq2SeqLM), potencialmente llama.cpp/Ollama no aplican por ser un modelo seq2seq especifico.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor indica que el modelo opera offline en procesadores moviles sin latencia de red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| DziriBERT-Seq2Seq-Rehab | no disponible (~206 MB ONNX) | no disponible | Darja + frances | Apache 2.0 | ONNX 8-bit, PyTorch |
| DziriBERT (base) | no disponible | no disponible | Darja (arabe y latin) | no disponible | PyTorch |
| Atlas-2B (teacher) | ~2B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos seq2seq de dialecto argelino en la informacion proporcionada.

## Limitaciones y advertencias

- No es un sustituto clinico: el modelo ofrece orientacion empatica y psicoespiritual, no diagnostica ni prescribe tratamientos medicos.
- No esta disenado para emergencias vitales ni escenarios de sobredosis grave; las aplicaciones deben integrar rutas codificadas a lineas de ayuda para crisis.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en un dominio sensible como la salud mental.
- Sesgos potenciales derivados del marco cultural islamico y del dataset curado manualmente, que puede no representar a toda la poblacion argelina.
- Limitacion linguistica: solo darja argelina y frances; no cubre otros dialectos arabes ni arabe estandar formal.
- Longitud de contexto no documentada, lo que limita la planificacion de conversaciones largas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere ausencia de validacion externa o uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el dominio de aplicacion (salud mental) exige supervision profesional y cumplimiento normativo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/khadidjabahfir/dziribert_seq2seq_drug_rehab
- Modelo base DziriBERT en Hugging Face: https://huggingface.co/alger-ia/dziribert
- Repositorio GitHub de DziriBERT: https://github.com/alger-ia/dziribert
- Paper de referencia (citado en la model card): Bahfir, K. et al. "A Conversational Agent Application Using the Algerian Dialect to Influence the Responses of Drug Addicts", ENSIA NLP Course Project, 2025.
