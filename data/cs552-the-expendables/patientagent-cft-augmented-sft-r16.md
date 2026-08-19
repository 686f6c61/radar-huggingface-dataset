# cs552-the-expendables/patientagent-cft-augmented-sft-r16

## Resumen

PatientAgent CFT-augmented SFT (rank 16) es un adaptador LoRA experimental desarrollado por el equipo cs552-the-expendables para la simulación de respuestas de pacientes en diálogos clínicos. Se basa en el modelo Qwen/Qwen3.5-4B (Apache-2.0) y aplica la idea de Contextual Fine-Tuning (CFT) descrita en el artículo *Teaching LLMs How to Learn with Contextual Fine-Tuning* (arXiv:2503.09032). Durante el entrenamiento, se antepone uno de diez prompts genéricos de estrategia de aprendizaje a cada contexto SFT canónico, pero la pérdida solo se calcula sobre los tokens objetivo de la respuesta del paciente. En inferencia, el prompt contextual se omite.

El adaptador está pensado para investigación en diálogo clínico simulado, no para uso médico real. El corpus de entrenamiento es pequeño (1.200 diálogos con hechos, 4.877 turnos de paciente) y exclusivamente en inglés. La evaluación automática con G-Eval está pendiente; la validación de generación pasó controles de integridad y no mostró fugas de prompt ni comportamientos de rechazo sistemáticos, pero la fidelidad clínica no está garantizada.

Se trata de una ejecución experimental única, no de un barrido de hiperparámetros ni de una reproducción exacta del paper original. El adaptador tiene 30.474.240 parámetros entrenables y se distribuye como pesos safetensors en formato PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con adaptador LoRA |
| Parametros totales | 4B (modelo base) + 30.474.240 (adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 (máximo de entrenamiento; contexto del base no especificado) |
| Tipos de cuantizacion | No disponible (depende del modelo base) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-4B, un modelo transformer de 4.000 millones de parámetros con licencia Apache-2.0. La técnica aplicada es una variante de Contextual Fine-Tuning (CFT): durante el entrenamiento, se muestrea uniformemente uno de diez prompts genéricos de estrategia de aprendizaje (aplicación, contexto más amplio, comparación, interpretación creativa, análisis crítico, profundidad, conceptos clave, preguntas, reflexión y síntesis) y se antepone al contexto SFT canónico. La pérdida se calcula exclusivamente sobre los tokens objetivo de la respuesta del paciente, de modo que el prompt contextual no influye en la inferencia.

El entrenamiento se realizó con una sola época, secuencias de hasta 2.048 tokens, batch efectivo de 8 (batch por dispositivo 1, acumulación de gradientes 8), learning rate 2e-4, warmup 0,03, y configuración LoRA de rango 16, alpha 32 y dropout 0,05. Se completaron 610 pasos de optimización en 13.046 segundos sobre una NVIDIA A100 de 40 GB, con una pérdida final de 1,3372. Los datos provienen de MTS-Dialog (CC BY 4.0) y de hechos de caso del dataset `cs552-the-expendables/mts-rl-training-data`. No se añadieron filas de validación ni diálogos sintéticos adicionales.

## Capacidades

- Generación de respuestas de paciente condicionadas a hechos de caso y al historial del diálogo clínico.
- Mantenimiento de coherencia conversacional en diálogos multi-turno (validado en 174 y 178 diálogos de prueba).
- Sin soporte de tool calling, function calling, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés (el corpus de entrenamiento es exclusivamente en inglés).
- No incluye modo de pensamiento oculto ni generación de razonamiento intermedio.

## Casos de uso

- Entrenamiento de estudiantes de medicina: el modelo puede generar respuestas realistas de pacientes para prácticas de anamnesis y entrevista clínica, permitiendo repetir escenarios sin necesidad de actores.
- Evaluación de sistemas de diálogo clínico: sirve como paciente simulado para probar agentes conversacionales de triaje o diagnóstico, midiendo su capacidad para extraer información relevante.
- Generación de datos sintéticos de entrenamiento: las respuestas generadas pueden usarse para aumentar corpus de diálogo clínico, siempre que se auditen manualmente para evitar errores de hecho.
- Investigación en CFT: el adaptador permite estudiar el efecto de los prompts de estrategia de aprendizaje en tareas condicionales de generación de texto, comparando con un SFT canónico.
- Desarrollo de simuladores de pacientes para entornos educativos: integrable en plataformas de e-learning para prácticas de comunicación clínica.
- Pruebas de robustez de modelos de lenguaje en dominios especializados: al ser un adaptador pequeño, puede servir como banco de pruebas para técnicas de fine-tuning eficiente en contextos médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación automática con G-Eval está pendiente y que no se realiza ninguna afirmación de superioridad de calidad. La validación de generación pasó controles de integridad (orden de IDs, estructura de turnos, texto de clínico sin cambios, respuestas no vacías, ausencia de fuga de prompt), pero no se proporcionan métricas cuantitativas de rendimiento.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,1 GB en disco (121.951.008 bytes).
- El modelo base Qwen3.5-4B requiere unos 8 GB de VRAM en FP16, o unos 2-3 GB con cuantización de 4 bits.
- El entrenamiento se realizó en una NVIDIA A100 de 40 GB, pero la inferencia es viable en GPUs consumer con 8-12 GB de VRAM (por ejemplo, RTX 3080, RTX 4070, RTX 4090) si se cuantiza el modelo base.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, cargando el adaptador con PEFT sobre el base cuantizado.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información pública sobre adaptadores comparables para simulación de pacientes con la misma técnica CFT. El modelo base Qwen3.5-4B es el punto de referencia natural, pero no se han publicado benchmarks comparativos entre el adaptador y el base sin adaptar. Tampoco se conocen otros adaptadores LoRA de simulación de pacientes con licencia Apache-2.0 en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Es una ejecución experimental única, no un barrido de hiperparámetros ni una reproducción exacta del paper CFT.
- El corpus de entrenamiento es pequeño (1.200 diálogos) y exclusivamente en inglés; los errores de fuente o de hechos extraídos pueden propagarse al adaptador.
- El simulador puede inventar, omitir o contradecir información clínica. Las salidas requieren evaluación independiente y nunca deben usarse para decisiones clínicas.
- La pérdida de entrenamiento no es una medida de fidelidad clínica ni de calidad conversacional.
- El paper original de CFT se centró en dominios médicos y financieros de alta información; la transferencia a este dominio específico no está validada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es un dispositivo médico y su uso en producción clínica está totalmente desaconsejado.
- La evaluación G-Eval está pendiente; no se puede afirmar superioridad de calidad sobre el SFT canónico.

## Enlaces

- [HuggingFace - adaptador](https://huggingface.co/cs552-the-expendables/patientagent-cft-augmented-sft-r16)
- [HuggingFace - modelo base Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [HuggingFace - dataset de entrenamiento](https://huggingface.co/datasets/cs552-the-expendables/mts-rl-training-data)
- [Paper CFT (arXiv:2503.09032)](https://arxiv.org/abs/2503.09032)
- [Repositorio oficial de CFT](https://github.com/rgklab/Contextual-Fine-Tuning)
