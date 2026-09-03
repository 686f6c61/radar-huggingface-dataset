# OpenMed/OpenMed-PII-Italian-ClinicalBGE-Large-335M-v1-mlx

## Resumen

OpenMed-PII-Italian-ClinicalBGE-Large-335M-v1-mlx es un empaquetado en formato MLX del modelo de clasificación de tokens OpenMed-PII-Italian-ClinicalBGE-Large-335M-v1, desarrollado por el proyecto OpenMed para la desidentificación de información personal sanitaria (PII) en textos clínicos en italiano. El modelo original pertenece a la familia BERT (BertForTokenClassification) y está especializado en la detección de entidades como nombres, fechas, números de seguridad social, direcciones y otros datos protegidos dentro de notas clínicas.

Este repositorio concreto no es un modelo independiente, sino una conversión de pesos al formato MLX (Apple Silicon) que permite ejecutar la inferencia de forma nativa en hardware de Apple (Macs con chip M1 o superior, iPhone y iPad) mediante las bibliotecas OpenMed y OpenMedKit. La relevancia de esta versión radica en que facilita el despliegue local y sin conexión de la de-identificación clínica, algo crítico para entornos sanitarios donde la privacidad del paciente es prioritaria. El modelo tiene 335 millones de parámetros según su nomenclatura, aunque la documentación no confirma explícitamente este valor, y su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification), basado en BGE-Large |
| Parametros totales | 335M (según nomenclatura del modelo, no verificado en la documentación) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (típicamente 512 tokens en BGE-Large, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos MLX en safetensors/npz, sin cuantización específica documentada) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo base es una variante de BGE-Large (BAAI General Embedding) adaptada para clasificación de tokens, con arquitectura transformer tipo BERT. La capa de salida es una cabeza de clasificación de tokens que asigna una etiqueta PII a cada token del texto de entrada. El repositorio MLX contiene únicamente los pesos convertidos, no el proceso de entrenamiento.

No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El nombre "ClinicalBGE" sugiere que el modelo fue ajustado específicamente sobre dominios clínicos, pero los detalles de fine-tuning no están documentados en la información proporcionada. La conversión a MLX es un paso posterior que no altera la arquitectura ni los pesos, solo el formato de almacenamiento para acelerar la inferencia en Apple Silicon.

## Capacidades

- Detección y clasificación de entidades PII en texto clínico italiano: nombres de pacientes, fechas de nacimiento, números de identificación, direcciones, teléfonos, etc.
- De-identificación de notas clínicas: el modelo puede marcar y extraer entidades para su posterior anonimización.
- Integración con el ecosistema OpenMed: funciona con la API `extract_pii` de OpenMed en Python y con OpenMedKit en Swift.
- Ejecución local en Apple Silicon: aprovecha el backend MLX para inferencia sin conexión, sin enviar datos a la nube.
- Compatibilidad con backend PyTorch/Hugging Face en otros sistemas (fallback automático).
- Soporte de "smart merging" para combinar entidades fragmentadas en el texto.

## Casos de uso

- Anonimización de historiales clínicos en hospitales italianos: el modelo procesa notas médicas y extrae todas las entidades PII para que puedan ser eliminadas o enmascaradas antes de compartir los datos con fines de investigación o docencia.
- Cumplimiento normativo de privacidad (GDPR y normativa sanitaria): integrado en flujos de trabajo de gestión documental, el modelo ayuda a garantizar que los documentos clínicos no contengan datos personales identificables antes de su almacenamiento o transferencia.
- Aplicaciones de salud móvil en iOS: mediante OpenMedKit, el modelo puede ejecutarse directamente en un iPhone o iPad, permitiendo que una app de gestión de salud procese notas clínicas localmente sin necesidad de conexión a internet.
- Investigación biomédica secundaria: los investigadores pueden usar el modelo para limpiar grandes corpus de textos clínicos italianos, eliminando PII antes de entrenar otros modelos o realizar análisis estadísticos.
- Sistemas de historia clínica electrónica (HCE): integración en el backend de un HCE para desidentificar automáticamente las notas antes de exportarlas a repositorios externos o sistemas de intercambio.
- Entornos de telemedicina: al ejecutarse en el dispositivo del profesional sanitario (Mac o iPad), el modelo permite desidentificar conversaciones o notas generadas durante consultas remotas sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión, recall o F1 sobre conjuntos de datos de referencia como MIMIC-III o i2b2. Tampoco se proporcionan comparativas con otros modelos de de-identificación para italiano.

## Requisitos de hardware

- El formato MLX está diseñado para Apple Silicon: cualquier Mac con chip M1, M2, M3 o M4 puede ejecutar el modelo de forma nativa.
- También es compatible con iPhone y iPad reales (no simulador) mediante OpenMedKit.
- En sistemas sin Apple Silicon, OpenMed puede usar el backend PyTorch/Hugging Face, lo que permite ejecutarlo en GPUs NVIDIA o CPUs convencionales.
- Con 335M parámetros, el modelo es ligero: la VRAM necesaria es inferior a 2 GB en FP32, y mucho menor en cuantizaciones (aunque no se documentan cuantizaciones específicas). Cabe en cualquier GPU moderna, incluidas tarjetas de consumo como RTX 3060 o superiores.
- Opciones de despliegue: OpenMed (Python) con backend MLX o PyTorch, OpenMedKit (Swift) para Apple, y posiblemente llama.cpp u otros runners si se convierte a GGUF (no documentado).
- La latencia en Apple Silicon es baja para textos clínicos típicos (cientos de tokens), aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de de-identificación clínica en italiano. El proyecto OpenMed menciona que ofrece más de 2.000 modelos y que logra resultados de vanguardia en 10 de 12 benchmarks biomédicos de NER, pero no se detallan los modelos comparados ni las métricas específicas para este checkpoint concreto. Se recomienda consultar la documentación de OpenMed para obtener evaluaciones comparativas actualizadas.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para italiano; su uso en otros idiomas producirá resultados incorrectos.
- No se han documentado sesgos específicos, pero al ser un modelo clínico, puede reflejar sesgos presentes en los datos de entrenamiento (p. ej., sobrerrepresentación de ciertos dialectos o terminología médica).
- Riesgo de alucinación: como todo modelo de clasificación de tokens, puede etiquetar incorrectamente entidades o dejar pasar algunas PII. Es recomendable una revisión humana en entornos de producción.
- La longitud de contexto no está confirmada; si es de 512 tokens (típico en BGE-Large), los textos clínicos más largos deberán truncarse o dividirse en segmentos.
- El repositorio MLX no incluye el tokenizador; OpenMed y OpenMedKit recurren al tokenizador del modelo base, lo que requiere acceso a Hugging Face en el momento de la primera ejecución.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo no debe utilizarse como única medida de cumplimiento de privacidad sin validación adicional en el contexto clínico real.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalBGE-Large-335M-v1-mlx
- Modelo base (checkpoint original): https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalBGE-Large-335M-v1
- Proyecto OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
