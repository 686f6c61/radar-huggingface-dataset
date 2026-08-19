# Hibbaan/Oncoct_v1

## Resumen

OncoCT-1B es un pipeline de investigación reproducible para un modelo fundacional de tomografía computarizada (CT) oncológica de aproximadamente 1.000 millones de parámetros, desarrollado por Hibbaan. No se trata de un checkpoint clínico entrenado ni de un sistema aprobado para diagnóstico, triaje o selección de tratamiento; el repositorio entrega el código, los scripts de adquisición de datos, el preprocesado, el curriculum de entrenamiento y la configuración de ejecución en la nube de Google Cloud, junto con un catálogo de datasets públicos de imagen médica.

El proyecto aborda un problema concreto: la falta de datasets públicos unificados para entrenar modelos de CT oncológico. En lugar de asumir que un único dataset contiene todas las etiquetas necesarias, el pipeline define una cartera deliberada de fuentes (NCI Imaging Data Commons, ULS23, Medical Segmentation Decathlon, Lung-PET-CT-Dx, Longitudinal-CT, HCC-TACE-Seg y NSCLC-Radiomics), cada una con su rol específico y sus restricciones de licencia. La arquitectura propuesta usa embeddings de 1.536 dimensiones, 32 bloques Transformer, 24 cabezas de atención y parches de vóxeles de 8³, con hasta 4.096 tokens de volumen. La relevancia actual radica en que ofrece un marco reproducible y con controles clínicos explícitos para que equipos cualificados puedan entrenar y validar un modelo de este tipo con datos aprobados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 32 bloques, 24 cabezas de atencion, embeddings de 1.536 dimensiones, parches de voxeles 8³, hasta 4.096 tokens de volumen |
| Parametros totales | Aproximadamente 1.000 millones (1B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 4.096 tokens de volumen (equivalente a volumenes CT parcheados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (solo metadatos y documentacion; el modelo procesa volumenes CT, no texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos; solo codigo, scripts y manifiestos) |

## Arquitectura y entrenamiento

La arquitectura propuesta es un Transformer estándar con 32 bloques, 24 cabezas de atención y embeddings de 1.536 dimensiones. La entrada son parches de vóxeles de 8³ extraídos de volúmenes CT preprocesados en formato NIfTI, con un clip de intensidad en unidades Hounsfield de [-1024, 3071] y normalización posterior. El modelo expone múltiples cabezas de salida: lesión, respuesta, control de calidad, volumen, eje largo, embeddings y abstinencia (abstention). También admite embeddings de informes opcionales, pero el límite del producto se mantiene en extracción de evidencia y revisión clínica, no en recomendación autónoma de tratamiento.

El entrenamiento sigue un curriculum en fases: primero representación general de CT con IDC/MSD/ULS23, luego caracterización de lesiones, después correspondencia longitudinal con Longitudinal-CT, y finalmente aprendizaje multitarea de respuesta al tratamiento con HCC-TACE-Seg. La evaluación se realiza con instituciones retenidas (institution-held-out). NSCLC-Radiomics se reserva como fuente de evaluación no comercial. No se menciona el uso de RLHF, DPO ni técnicas de alineación; el énfasis está en el control clínico y la validación externa. El pipeline está diseñado para ejecutarse con FSDP o un launcher distribuido en un job de 50 GPUs en Google Cloud, con escalado progresivo desde 1 GPU hasta multi-nodo con recuperación de checkpoints.

## Capacidades

- Procesamiento de volúmenes CT completos: entrada de volúmenes NIfTI, parcheado en vóxeles 8³ y generación de representaciones densas.
- Extracción de evidencia oncológica: salidas para localización de lesiones, caracterización, respuesta al tratamiento, control de calidad, volumen y eje largo.
- Correspondencia longitudinal: capacidad de emparejar estudios baseline y follow-up para seguimiento de lesiones y respuesta.
- Aprendizaje multitarea: integración de tareas de supervivencia, tiempo hasta progresión y respuesta en el dataset HCC-TACE-Seg.
- Mecanismo de abstinencia: el modelo puede abstenerse cuando la calidad de entrada, el dominio o la confianza son inadecuados, un requisito clínico no negociable.
- Embeddings de informes opcionales: puede incorporar representaciones de informes radiológicos como entrada auxiliar, aunque el límite del producto es la extracción de evidencia, no la recomendación autónoma.
- No soporta tool calling, ni generación de texto, ni razonamiento multimodal en el sentido tradicional; es un modelo de visión médica 3D.

## Casos de uso

- Investigación en radiómica oncológica: el pipeline permite entrenar un modelo fundacional de CT con datos públicos aprobados, generando embeddings de volumen que pueden usarse para análisis de supervivencia o caracterización de tumores en cohortes retrospectivas.
- Segmentación de lesiones en CT de tórax, abdomen y pelvis: usando ULS23 y Medical Segmentation Decathlon como fuentes de preentrenamiento, el modelo puede adaptarse a tareas de segmentación de órganos y tumores (hígado, pulmón, páncreas, colon).
- Seguimiento longitudinal de lesiones: con Longitudinal-CT, el modelo puede aprender correspondencias entre estudios baseline y follow-up, útil para medir respuesta a tratamiento en ensayos clínicos retrospectivos.
- Evaluación de respuesta al tratamiento en HCC: con HCC-TACE-Seg, el pipeline puede entrenar modelos que predicen tiempo hasta progresión y supervivencia a partir de CT multifásico, siempre bajo validación externa.
- Detección y localización de lesiones pulmonares: con Lung-PET-CT-Dx, el modelo puede aprender a localizar lesiones usando cajas anotadas por radiólogos y representaciones condicionadas por patología.
- Control de calidad de imágenes CT: el modelo expone una salida específica de control de calidad, útil para filtrar estudios con artefactos o calidad insuficiente antes de análisis posteriores.
- Investigación no comercial con NSCLC-Radiomics: el dataset está bloqueado para uso comercial (CC-BY-NC 3.0), pero puede usarse para evaluación de segmentación y pronóstico en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento (Dice, AUC, precisión de localización, etc.) ni comparaciones con otros modelos. El autor indica explícitamente que el pipeline requiere entrenamiento y validación clínica con datos aprobados y ejecución en GPUs; no hay números de referencia.

## Requisitos de hardware

- El pipeline está diseñado para ejecutarse en Google Cloud con GPUs; el job de entrenamiento completo usa 50 GPUs con FSDP o un launcher distribuido.
- Se recomienda escalado progresivo: empezar con 1 GPU, luego 2-8 GPUs, y finalmente multi-nodo con recuperación de checkpoints antes de usar la cuota completa.
- No se especifican modelos concretos de GPU (A100, H100, etc.), pero el tamaño de 1B de parámetros con 4.096 tokens de volumen y 32 bloques Transformer sugiere que cabría en GPUs de 24-40 GB con cuantización, aunque no se proporcionan datos de VRAM.
- No se menciona compatibilidad con consumer GPUs; el diseño orientado a cloud y el volumen de datos (CT 3D) hacen poco práctico el uso en hardware doméstico.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el pipeline usa scripts propios (`train.py`, `evaluate.py`) y un launcher distribuido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros modelos fundacionales de imagen médica (como los basados en MONAI, nnU-Net o modelos de CT específicos). El repositorio no incluye benchmarks comparativos ni referencias a alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado ni un checkpoint clínico: es un pipeline de investigación reproducible. No debe usarse para diagnóstico, triaje o selección de tratamiento.
- Requiere aprobación institucional, acuerdos de uso de datos, verificación de desidentificación, protocolo prospectivo, validación externa, calibración y análisis de subgrupos antes de cualquier piloto clínico.
- Los datasets tienen licencias heterogéneas: la mayoría de IDC es CC-BY, pero un subconjunto es CC-NC; NSCLC-Radiomics es CC-BY-NC 3.0 y está bloqueado para entrenamiento comercial; Longitudinal-CT requiere verificar la licencia actual del repositorio antes de reutilización comercial.
- Riesgo de fuga temporal: el pipeline exige que las etiquetas de tratamiento y seguimiento tengan marcas de tiempo para evitar que información futura se filtre en predicciones baseline; cualquier violación de este requisito invalidaría los resultados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir salidas de baja confianza; el mecanismo de abstinencia es obligatorio para mitigar esto.
- Sesgos conocidos: no se documentan, pero la dependencia de datasets públicos con poblaciones específicas (p. ej., HCC-TACE-Seg es una cohorte pequeña) puede limitar la generalización.
- Restricciones de licencia: la licencia del propio repositorio no está especificada; los datasets individuales tienen sus propias restricciones que deben respetarse.
- No se proporcionan pesos ni cuantizaciones; el repositorio tiene tamaño 0.0 GB, lo que confirma que solo contiene código y documentación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hibbaan/Oncoct_v1
- DOI asociado: 10.57967/hf/9990
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
