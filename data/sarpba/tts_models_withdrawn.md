# sarpba/TTS_Models_Withdrawn

## Resumen

`sarpba/TTS_Models_Withdrawn` no es un modelo funcional, sino un repositorio de retirada (withdrawal notice) publicado por el desarrollador `sarpba` en Hugging Face. El autor anuncia la retirada inmediata de todos los modelos de síntesis de voz (TTS) que había publicado previamente, y deja el repositorio únicamente como aviso para quienes los hubieran descargado. No contiene pesos, código de inferencia ni pipeline declarado.

La motivación declarada es el Reglamento (UE) 2024/1689 (AI Act), en particular sus requisitos de transparencia sobre audio generado por IA, y la incertidumbre jurídica asociada: el desarrollador argumenta que no puede controlar el uso posterior de los modelos descargados, si el audio sintético se etiqueta correctamente ni si se emplea con fines ilícitos. La retirada es una decisión unilateral del autor y él mismo aclara que no implica que el AI Act exija borrar copias ya descargadas.

Para desarrolladores e investigadores, este repositorio es relevante como caso práctico de cómo el marco regulatorio europeo está afectando a la distribución de modelos generativos de audio en código abierto. No debe evaluarse como candidato técnico: no hay arquitectura, parámetros, contexto ni benchmarks disponibles. Cualquier uso en producción es inviable porque no hay artefactos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hu |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de retirada, sin pesos publicados) |

## Arquitectura y entrenamiento

No disponible. El repositorio no documenta arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO). La model card se limita a un aviso bilingüe (inglés y húngaro) sobre la retirada de los modelos TTS previamente publicados por el autor.

La única información técnica inferible es que los modelos retirados pertenecían a la categoría de síntesis de voz (TTS) y que estaban orientados a los idiomas inglés y húngaro, según los metadatos del repositorio. No se especifica si eran modelos acústicos, vocoders, sistemas de clonación de voz o pipelines completos.

## Capacidades

- No hay capacidades operativas disponibles: el repositorio no contiene pesos ni código ejecutable.
- Los modelos retirados eran sistemas de síntesis de voz (TTS) para inglés y húngaro, según los metadatos.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.
- No se documenta capacidad multilingüe más allá de los dos idiomas indicados en los tags.
- El autor solicita explícitamente que no se usen ni redistribuyan copias de los modelos retirados.

## Casos de uso

No hay casos de uso viables para este repositorio, ya que no contiene artefactos desplegables. Los escenarios siguientes describen únicamente el contexto de los modelos retirados y las implicaciones para quien los hubiera descargado con anterioridad:

- Auditoría de cumplimiento normativo: un equipo que hubiera integrado un modelo TTS de este autor debe revisar su inventario de dependencias y evaluar si el uso de copias descargadas encaja con los requisitos de transparencia del AI Act (etiquetado de audio sintético).
- Gestión de riesgos legales en pipelines de audio: si se generaba voz sintética en producción, procede documentar la procedencia del modelo, la fecha de descarga y el estado de retirada para trazabilidad ante auditorías.
- Retirada de espejos internos: organizaciones con mirrors privados o artefactos en registros internos deben localizarlos y decidir si los eliminan, siguiendo la petición del autor.
- Sustitución de proveedor TTS: equipos que dependían de estos modelos necesitan migrar a alternativas con licencia explícita y documentación de cumplimiento del AI Act.
- Estudio de gobernanza de modelos abiertos: investigadores pueden usar este repositorio como caso de estudio sobre retirada unilateral de modelos y sus efectos en la reproducibilidad científica.
- Formación interna sobre regulación: sirve como ejemplo didáctico de las obligaciones de transparencia sobre contenido sintético y de los dilemas de control posterior a la distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos publicados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no contiene artefactos desplegables.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa técnica porque el repositorio no publica pesos, arquitectura ni métricas, y los modelos originales han sido retirados. Cualquier comparación con sistemas TTS abiertos (por ejemplo, familias con licencias permisivas y pesos publicados) requeriría datos que este repositorio no ofrece.

## Limitaciones y advertencias

- El repositorio no contiene un modelo utilizable: es un aviso de retirada, no un artefacto de inferencia.
- El autor prohíbe explícitamente el uso y la redistribución de los modelos retirados y solicita la eliminación de espejos públicos.
- Licencia no disponible: sin licencia declarada, no hay base jurídica clara para uso comercial ni para redistribución.
- Riesgo de cumplimiento: el propio autor cita el AI Act (Reglamento UE 2024/1689) y las obligaciones de transparencia sobre audio sintético como motivo de la retirada; usar copias sin etiquetado adecuado puede generar riesgo regulatorio.
- Riesgo de procedencia: al no haber mantenimiento ni soporte, cualquier copia en circulación puede estar desactualizada, sin parches de seguridad ni correcciones.
- Idiomas limitados a inglés y húngaro según los metadatos; sin garantías de calidad en otros idiomas.
- No hay información sobre sesgos, tasas de alucinación o fidelidad de la síntesis, por lo que no es posible evaluar riesgos de calidad.
- El autor aclara que la retirada es su decisión y que el AI Act no exige legalmente borrar copias ya descargadas; aun así, recomienda dejar de usarlas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sarpba/TTS_Models_Withdrawn
- Reglamento (UE) 2024/1689 (AI Act): https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- Perfil del autor en Hugging Face: https://huggingface.co/sarpba
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
