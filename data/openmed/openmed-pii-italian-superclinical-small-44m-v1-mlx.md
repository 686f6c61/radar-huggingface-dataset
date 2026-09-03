# OpenMed/OpenMed-PII-Italian-SuperClinical-Small-44M-v1-mlx

## Resumen

OpenMed-PII-Italian-SuperClinical-Small-44M-v1-mlx es un modelo de clasificación de tokens (token-classification) especializado en la detección y anonimización de información personal identificable (PII) y datos sanitarios protegidos (PHI) en textos clínicos en italiano. Desarrollado por OpenMed, forma parte de un ecosistema de IA clínica local-first que opera íntegramente en el dispositivo, sin enviar datos de pacientes a la nube. Este repositorio concreto es un empaquetado en formato MLX (Apple Silicon) del checkpoint original OpenMed/OpenMed-PII-Italian-SuperClinical-Small-44M-v1, pensado para su uso con la librería `openmed` en Macs con chip Apple.

El modelo pertenece a la familia DeBERTa v2 (`DebertaV2ForTokenClassification`) y, según su nomenclatura, tendría alrededor de 44 millones de parámetros, aunque este dato no está confirmado oficialmente en la documentación disponible. Su relevancia actual radica en la creciente demanda de soluciones de desidentificación de historias clínicas que cumplan normativas como el RGPD o la HIPAA, y que puedan ejecutarse en hardware local para garantizar la privacidad del paciente. OpenMed afirma que sus modelos logran estado del arte en 10 de 12 benchmarks de NER biomédico, aunque no se publican resultados específicos para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa v2 (`DebertaV2ForTokenClassification`) |
| Parametros totales | 44 millones (según el nombre del modelo, no confirmado oficialmente) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (típico de DeBERTa v2: 512 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (formato MLX, posible cuantización no especificada) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (`weights.safetensors` y/o `weights.npz`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa v2, un transformer que introduce el mecanismo de atención disentangled (separación de las representaciones de contenido y posición) y una máscara de atención mejorada. En esta variante, la cabeza de clasificación es de tipo `DebertaV2ForTokenClassification`, diseñada para asignar una etiqueta a cada token del texto de entrada, lo que permite identificar entidades como nombres, fechas, direcciones, números de seguridad social, etc., dentro de documentos clínicos.

No se dispone de información detallada sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El modelo base fue entrenado específicamente para la desidentificación de textos médicos en italiano, y esta versión MLX es una conversión de pesos para ejecución en Apple Silicon. El repositorio no incluye los assets del tokenizador; OpenMed recurre al tokenizador del modelo base referenciado en `config.json` cuando es necesario.

## Capacidades

- Detección de entidades PII/PHI en textos clínicos italianos mediante clasificación de tokens (NER).
- Anonimización de historias clínicas, informes de alta, notas de enfermería y otros documentos sanitarios.
- Soporte de "smart merging" (fusión inteligente de entidades) a través de la API `extract_pii` de OpenMed, que agrupa tokens consecutivos en entidades completas.
- Ejecución 100% local en Apple Silicon mediante el backend MLX de OpenMed, sin necesidad de conexión a internet.
- Compatibilidad con el ecosistema OpenMed, que incluye más de 2.200 modelos médicos y soporte para 21 idiomas (según el repositorio GitHub).
- No es un modelo generativo: no produce texto, solo etiqueta tokens. No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Anonimización de historias clínicas para investigación: el modelo puede procesar lotes de informes médicos italianos y eliminar o enmascarar nombres, fechas de nacimiento, direcciones y otros datos identificables antes de que los datos se utilicen en estudios epidemiológicos o ensayos clínicos, cumpliendo así con los requisitos de privacidad del RGPD.
- Cumplimiento normativo en hospitales: integrado en el flujo de trabajo de un servicio de documentación clínica, el modelo puede revisar automáticamente las notas de los pacientes y marcar cualquier PII antes de que el documento se comparta con terceros o se archive en sistemas externos.
- Preparación de conjuntos de datos para entrenamiento de otros modelos: los investigadores pueden usar este modelo para limpiar corpus clínicos italianos, eliminando información personal antes de publicar o compartir los datos con la comunidad científica.
- Desidentificación en dispositivos móviles: gracias a su pequeño tamaño (44M) y al formato MLX, el modelo puede ejecutarse en un iPhone o iPad (vía OpenMedKit) para anonimizar notas clínicas capturadas en el punto de atención, sin que los datos salgan del dispositivo.
- Aplicaciones de salud digital para pacientes: una app de gestión de salud personal puede usar el modelo para detectar y ocultar automáticamente datos sensibles en los registros que el propio paciente introduce, antes de sincronizarlos con servicios en la nube.
- Auditoría de documentos existentes: el modelo puede analizar retrospectivamente archivos clínicos históricos en italiano para identificar fugas de PII y permitir a las organizaciones sanitarias corregir o re-anonimizar documentos antiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la informacion disponible. La documentación de OpenMed menciona que sus modelos logran estado del arte en 10 de 12 benchmarks de NER biomédico, pero no se desglosan los resultados por modelo ni se comparan con alternativas concretas. No se dispone de datos de MMLU, HumanEval u otros benchmarks generales, ya que este es un modelo de clasificación de tokens, no generativo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia en FP32 (modelo de 44M de parámetros). Con cuantización MLX, el consumo puede reducirse aún más, aunque no se especifican valores concretos.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M1 Pro/Max, M2, M3, etc.) para ejecución MLX nativa. También puede ejecutarse en CPU en sistemas sin GPU, mediante el backend PyTorch/Hugging Face de OpenMed.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna con al menos 2 GB de VRAM, aunque el formato MLX está pensado para Apple Silicon. Existe una variante ONNX para Android y WebAssembly/WebGPU.
- Opciones de despliegue: librería `openmed[mlx]` en Python, OpenMedKit para Swift (aunque esta familia DeBERTa v2 no está soportada en Swift MLX actualmente), y conversión a ONNX para entornos móviles o web.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo, se espera una latencia de milisegundos por documento en Apple Silicon, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| OpenMed-PII-Italian-SuperClinical-Small-44M-v1-mlx | ~44M | no disponible | Italiano | Apache-2.0 | MLX |
| OpenMed-PII-Italian-SuperClinical-Large-434M-v1 | ~434M | no disponible | Italiano | Apache-2.0 | no disponible |
| OpenMed-PII-Italian-SuperClinical-Small-44M-v1 (base) | ~44M | no disponible | Italiano | Apache-2.0 | PyTorch / Hugging Face |

La comparativa se limita a las variantes del mismo modelo dentro del ecosistema OpenMed, ya que no se dispone de información sobre otros modelos de desidentificación clínica en italiano con los que comparar directamente. La versión Large (434M) ofrece presumiblemente mayor precisión a costa de más recursos, pero no hay datos de rendimiento publicados para ninguna de las dos.

## Limitaciones y advertencias

- Modelo limitado al idioma italiano; no es adecuado para textos en otros idiomas sin reentrenamiento.
- Es un modelo de detección de PII, no un modelo generativo: no puede redactar, resumir ni responder preguntas.
- Riesgo de falsos positivos y negativos en la identificación de entidades, especialmente con formatos de texto poco convencionales o jerga clínica muy especializada.
- El repositorio MLX no incluye el tokenizador; depende del modelo base para funcionar, lo que puede complicar el despliegue en entornos aislados.
- El soporte Swift MLX no está disponible para la familia DeBERTa v2 en la versión actual de OpenMedKit; los desarrolladores de apps para Apple deben usar Python MLX o CoreML.
- No se han publicado métricas de rendimiento ni evaluaciones independientes para este modelo concreto; las afirmaciones de estado del arte de OpenMed no están respaldadas por datos públicos detallados.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que el modelo cumple con los requisitos legales específicos de su jurisdicción en materia de datos sanitarios.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperClinical-Small-44M-v1-mlx
- Checkpoint original (modelo base): https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperClinical-Small-44M-v1
- Variante ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperClinical-Small-44M-v1-onnx-android
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
