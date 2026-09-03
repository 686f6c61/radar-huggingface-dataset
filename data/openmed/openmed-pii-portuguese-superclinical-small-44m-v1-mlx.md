# OpenMed/OpenMed-PII-Portuguese-SuperClinical-Small-44M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-SuperClinical-Small-44M-v1-mlx es un empaquetado en formato MLX del modelo de detección de información personal identificable (PII) en texto clínico portugués desarrollado por OpenMed. El modelo base, OpenMed/OpenMed-PII-Portuguese-SuperClinical-Small-44M-v1, es un transformer de tipo DeBERTa-v2 (DebertaV2ForTokenClassification) con 44 millones de parámetros, fine-tuneado específicamente para identificar entidades PII en documentos clínicos en portugués. Este artefacto MLX está pensado para ejecutarse de forma local en Apple Silicon mediante la librería OpenMed, sin necesidad de enviar datos a la nube.

La relevancia de este modelo radica en su enfoque local-first para la desidentificación de datos clínicos, un requisito crítico en entornos sanitarios sujetos a normativas como HIPAA o la LGPD brasileña. Al ser un modelo compacto (44M) y con licencia Apache-2.0, permite su integración en flujos de trabajo on-premise o en dispositivos con recursos limitados. El empaquetado MLX facilita su uso en Macs con chips Apple Silicon, aunque también existe un backend PyTorch/Hugging Face para otros entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (DebertaV2ForTokenClassification) |
| Parametros totales | 44 millones (segun nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el empaquetado MLX usa safetensors, no se especifican cuantizaciones) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX weights) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v2, un transformer encoder con atencion disentangled que mejora la representacion contextual frente a BERT clasico. La capa de salida es una cabeza de clasificacion de tokens (token classification) que asigna una etiqueta PII a cada token del texto de entrada. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO; la model card solo indica que es un fine-tuning del modelo base para deteccion de PII en portugues. El empaquetado MLX no altera la arquitectura, solo convierte los pesos al formato optimizado para Apple Silicon.

## Capacidades

- Deteccion de entidades PII en texto clinico en portugues: nombres de pacientes, direcciones, numeros de identificacion, fechas de nacimiento, etc.
- Clasificacion de tokens a nivel de token (token-classification), con soporte para fusion inteligente de entidades (smart merging) via la API de OpenMed.
- Ejecucion local en Apple Silicon mediante el backend MLX de OpenMed, sin conexion a internet ni envio de datos.
- Compatibilidad con el backend PyTorch/Hugging Face en otros sistemas (CPU/GPU) como alternativa.
- Integracion con el ecosistema OpenMed, que incluye mas de 2.000 modelos clinicos Apache-2.0 y soporte para 33 lenguajes PII (segun la web de OpenMed).
- No es un modelo generativo: no produce texto, solo etiqueta entidades existentes.

## Casos de uso

- Anonimizacion de historiales clinicos en portugues: el modelo puede procesar notas medicas y marcar automaticamente los campos PII para su posterior enmascaramiento o eliminacion, cumpliendo con requisitos de privacidad.
- Cumplimiento normativo en hospitales y clinicas: integrado en sistemas de gestion de registros de salud electronicos (EHR) para garantizar que los datos de pacientes no se expongan en analisis o comparticiones.
- Investigacion medica con datos secundarios: antes de utilizar conjuntos de datos clinicos para estudios, se aplica el modelo para desidentificar los documentos, permitiendo el uso de datos reales sin violar la confidencialidad.
- Procesamiento local en dispositivos Apple: gracias al empaquetado MLX, se puede ejecutar en Macs con Apple Silicon dentro de entornos hospitalarios sin depender de infraestructura en la nube.
- Pipeline de desidentificacion en aplicaciones de escritorio o servidores locales: usando la API de OpenMed con `extract_pii`, se puede integrar en flujos de trabajo de Python para procesar lotes de documentos.
- Desarrollo de herramientas de soporte a la decision clinica: al eliminar PII, se pueden compartir datos clinicos entre instituciones para entrenar otros modelos sin comprometer la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3 o posteriores) para ejecucion MLX nativa; el modelo tambien puede ejecutarse en CPU/GPU convencionales mediante el backend PyTorch.
- VRAM estimada: no disponible, pero al tratarse de un modelo de 44M de parametros, el consumo de memoria es reducido (probablemente inferior a 1 GB en cuantizacion FP16).
- GPU recomendadas: para MLX, la GPU integrada del chip Apple Silicon es suficiente; para PyTorch, cualquier GPU con al menos 2 GB de VRAM deberia ser adecuada.
- Opciones de despliegue: `openmed[mlx]` en Apple Silicon, backend Hugging Face/PyTorch en otros sistemas, o versiones ONNX para Android/WebAssembly/WebGPU (existe un repositorio hermano).
- Latencia y throughput: no disponibles; al ser un modelo pequeno, se espera una inferencia rapida incluso en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos en la documentacion proporcionada. El propio ecosistema OpenMed incluye otros modelos de deteccion de PII en portugues, como el OpenMed-PII-Portuguese-ClinicalE5-Base-109M-v1 (109M parametros), pero no se han publicado comparativas directas entre ellos. Se recomienda consultar el repositorio de OpenMed para evaluar alternativas segun el caso de uso.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para portugues; no soporta otros idiomas.
- Al ser un modelo de clasificacion de tokens, no genera texto y no presenta riesgo de alucinacion, pero puede cometer errores de etiquetado (falsos positivos o negativos) en contextos clinicos complejos o con jerga especializada.
- No se han publicado datos sobre sesgos demograficos o de vocabulario; se recomienda validar el rendimiento en el dominio especifico antes de usarlo en produccion.
- La longitud de contexto no esta documentada; para documentos muy largos puede ser necesario dividir el texto en fragmentos.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo se distribuye sin garantias; el usuario es responsable de verificar su precision en el escenario objetivo.
- El soporte Swift (OpenMedKit) no incluye actualmente arquitecturas deberta-v2; para aplicaciones iOS se requiere usar CoreML con una exportacion propia o esperar a futuras actualizaciones.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperClinical-Small-44M-v1-mlx
- Modelo base (PyTorch/HF): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperClinical-Small-44M-v1
- Version ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperClinical-Small-44M-v1-onnx-android
- GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentacion del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentacion de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Web de OpenMed: https://openmed.life/
