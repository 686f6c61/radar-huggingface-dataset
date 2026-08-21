# Mustafa5645344/cybertech-neural-shield-deberta

## Resumen

CyberTech Neural Shield es un clasificador de secuencias basado en DeBERTa-v3, desarrollado por el usuario Mustafa5645344 como componente de un sistema de seguridad para aplicaciones basadas en LLM. Su función principal es la detección binaria de prompts maliciosos, clasificándolos como benignos o ataques, con especial atención a inyecciones indirectas de prompts, intentos de jailbreak, anulación de instrucciones, escalada de privilegios y ataques de ingeniería social.

El modelo se presenta como la capa 2 de una pasarela de seguridad denominada CyberTech Neural Shield, diseñada para actuar como cortafuegos semántico en tiempo real antes de la generación de respuestas por parte de un LLM. Con 184 millones de parámetros, ofrece un equilibrio entre precisión y eficiencia computacional, siendo adecuado para entornos empresariales que requieren una primera línea de defensa automatizada.

La relevancia de este modelo radica en la creciente necesidad de proteger los despliegues de LLM frente a ataques de manipulación de prompts, una superficie de ataque cada vez más explotada. Su licencia MIT permite su integración en productos comerciales sin restricciones significativas, lo que facilita su adopción en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (12 capas, 768 dimensiones ocultas) |
| Parametros totales | 184.423.682 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (max_length en el codigo de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco, ingles, aleman |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v3, especificamente en la variante `microsoft/deberta-v3-base`. DeBERTa (Decoding-enhanced BERT with Disentangled Attention) introduce dos mejoras clave sobre BERT: la atencion disentangulada, que modela la relacion entre palabras y sus posiciones mediante dos vectores separados, y un mecanismo de mascara mejorado que utiliza tokens enmascarados para predecir tokens adyacentes. La version v3 incorpora ademas el objetivo de preentrenamiento RTD (Replaced Token Detection), similar a ELECTRA, que mejora la eficiencia del entrenamiento.

El modelo fue fine-tuneado para clasificacion de secuencias binaria, con una cabeza de clasificacion que produce dos salidas: benigno (0) o ataque (1). Los datos de entrenamiento especificos no estan documentados en la informacion disponible, aunque el ambito de deteccion se centra en amenazas de seguridad en flujos de trabajo empresariales con LLM. No se menciona el uso de tecnicas como RLHF o DPO, dado que se trata de un modelo de clasificacion y no de generacion.

## Capacidades

- Clasificacion binaria de prompts: distingue entre entradas benignas y ataques maliciosos.
- Deteccion de inyeccion indirecta de prompts: identifica intentos de manipular el comportamiento del LLM mediante instrucciones ocultas.
- Deteccion de jailbreak: reconoce patrones de texto disenados para eludir las restricciones de seguridad del modelo.
- Deteccion de anulacion de instrucciones: identifica prompts que intentan sobrescribir las reglas del sistema.
- Deteccion de escalada de privilegios: senala intentos de obtener acceso a funciones o datos restringidos.
- Deteccion de ingenieria social: identifica tecnicas de manipulacion psicologica en los prompts.
- Soporte multilingue: funciona en turco, ingles y aleman.
- Inferencia en tiempo real: disenado para actuar como filtro previo a la generacion del LLM, con latencia adecuada para entornos de produccion.

## Casos de uso

- Pasarela de seguridad para LLM empresariales: el modelo se integra como capa intermedia entre el usuario y el LLM, filtrando prompts maliciosos antes de que lleguen al generador. Su baja latencia permite su uso en tiempo real sin degradar la experiencia del usuario.

- Proteccion de APIs de generacion de texto: cualquier servicio que exponga un endpoint de LLM puede beneficiarse de este clasificador como primera linea de defensa, bloqueando solicitudes que contengan intentos de inyeccion o jailbreak.

- Moderacion de contenido en aplicaciones de chat: en entornos de atencion al cliente o asistentes virtuales, el modelo puede detectar intentos de manipular al asistente para obtener respuestas inapropiadas o acceder a informacion restringida.

- Analisis forense de logs de prompts: las empresas pueden utilizar el modelo para auditar historiales de interacciones con LLM, identificando intentos de ataque que hayan podido pasar desapercibidos.

- Filtrado en pipelines de RAG (Retrieval-Augmented Generation): antes de inyectar documentos recuperados en el contexto del LLM, el modelo puede verificar que no contengan instrucciones maliciosas ocultas.

- Entrenamiento y evaluacion de sistemas de seguridad: el modelo puede utilizarse como componente en conjuntos de pruebas para evaluar la robustez de otros sistemas de deteccion de ataques a LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como exactitud, precision, recall o F1 sobre conjuntos de datos estandar de deteccion de inyeccion de prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en precision FP32, menos de 0,4 GB en FP16 o int8. El modelo es ligero y cabe en cualquier GPU moderna, incluso en tarjetas de gama de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1650, RTX 3050 o superiores son mas que adecuadas. Tambien puede ejecutarse en CPU con razonable rendimiento.
- Compatibilidad con consumer GPU: si, el modelo es compatible con cualquier GPU de consumo actual.
- Opciones de despliegue: el modelo se carga mediante la libreria Transformers de HuggingFace, por lo que puede desplegarse con herramientas como HuggingFace Inference Endpoints, FastAPI con TorchServe, o en frameworks de servicio como Triton Inference Server. Al ser un modelo de clasificacion pequeno, no requiere herramientas especializadas como vLLM o TGI.
- Latencia y throughput estimados: no se proporcionan datos oficiales, pero para un modelo de 184M de parametros con secuencias de hasta 512 tokens, la latencia en GPU moderna suele ser inferior a 10 ms por peticion, y en CPU de gama alta, inferior a 100 ms.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Existen otros clasificadores de deteccion de inyeccion de prompts en HuggingFace, como los basados en RoBERTa o DistilBERT, pero no se pueden establecer comparaciones rigurosas sin datos de benchmarks comunes.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente en ingles, turco y aleman, su rendimiento en otros idiomas puede ser significativamente inferior.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, por lo que el riesgo de alucinacion no aplica directamente. Sin embargo, puede producir falsos positivos o negativos en la clasificacion.
- Limitaciones de contexto: la ventana de 512 tokens limita la capacidad de analizar prompts muy largos o contextos que requieran informacion historica extensa.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero no se proporciona informacion sobre los datos de entrenamiento, lo que podria implicar riesgos legales si los datos incluyen material con derechos de autor.
- Advertencia para produccion: el modelo no ha sido evaluado publicamente con benchmarks estandar, por lo que su rendimiento real en entornos de produccion es incierto. Se recomienda realizar una evaluacion exhaustiva con datos propios antes de su despliegue.
- Dependencia del preentrenamiento: al basarse en DeBERTa-v3, hereda las limitaciones y sesgos del modelo base, que pueden manifestarse en la clasificacion de ciertos tipos de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mustafa5645344/cybertech-neural-shield-deberta
- Modelo base DeBERTa-v3: https://huggingface.co/microsoft/deberta-v3-base
