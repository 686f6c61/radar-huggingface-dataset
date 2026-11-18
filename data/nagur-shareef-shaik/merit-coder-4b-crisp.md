# nagur-shareef-shaik/MERIT-Coder-4B-CRISP

## Resumen

MERIT-Coder-4B-CRISP es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-4B orientado a codificación clínica y médica: asignación de códigos ICD-10, ajuste de riesgo basado en el sistema CMS-HCC y tareas derivadas del corpus MIMIC-IV. Lo desarrolla el usuario de Hugging Face nagur-shareef-shaik y se distribuye como un checkpoint de 4.205.751.296 parámetros en formato safetensors, con el repositorio ocupando 8,4 GB.

El modelo parte de la arquitectura Qwen3.5 en su variante de texto (tag `qwen3_5_text`) y ha sido entrenado con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, según indican las etiquetas del repositorio. Está pensado para entornos de generación de texto conversacional en inglés y declara compatibilidad con vLLM y con endpoints de Hugging Face.

Su relevancia radica en la especialización vertical: en lugar de un modelo generalista, apunta a un nicho regulado (codificación médica y risk adjustment) donde la precisión terminológica y la trazabilidad importan. El acceso está restringido (gated) y la licencia es `physionet-credentialed-health-data-1.5.0`, lo que condiciona fuertemente su uso y distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, variante de texto `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | physionet-credentialed-health-data-1.5.0 (licencia "other" en tags) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5 en su variante de texto. El ajuste fino se ha realizado con GRPO, un algoritmo de optimización de política relativa a grupos que se emplea habitualmente para reforzar comportamientos concretos (en este caso, presumiblemente la corrección en la asignación de códigos clínicos). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases adicionales de SFT o DPO.

Las etiquetas del repositorio apuntan a un entrenamiento sobre datos derivados de MIMIC-IV y a tareas de codificación clínica (ICD-10, CMS-HCC). No se detalla ninguna innovación arquitectónica propia: las capacidades diferenciales provienen del ajuste fino, no de cambios estructurales en el modelo base. Tampoco se especifican detalles sobre la tokenización o el contexto máximo efectivo tras el fine-tuning.

## Capacidades

- Generación de texto conversacional en inglés.
- Asignación de códigos ICD-10 a partir de descripciones clínicas.
- Codificación de ajuste de riesgo según el sistema CMS-HCC.
- Procesamiento de datos clínicos en el dominio MIMIC-IV.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la metadata.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Codificación ICD-10 asistida: el modelo puede recibir una descripción de episodio clínico y proponer el código ICD-10 correspondiente, reduciendo el trabajo manual del codificador y sirviendo como primera pasada revisable.
- Ajuste de riesgo CMS-HCC: dado un conjunto de diagnósticos de un paciente, el modelo puede ayudar a mapear las condiciones a las categorías HCC para cálculos de risk adjustment en aseguradoras y sistemas de pago.
- Auditoría de codificación: uso como segundo par de ojos para detectar discrepancias entre la documentación clínica y los códigos ya asignados, aprovechando su especialización en el dominio.
- Extracción estructurada de información clínica: convertir notas o resúmenes en campos codificados, integrándose en pipelines de datos sobre MIMIC-IV.
- Formación y validación de codificadores: generar ejemplos y explicaciones de mapeos código-diagnóstico para entrenamiento de personal o para construir conjuntos de evaluación.
- Prototipado de asistentes clínicos internos: al ser compatible con vLLM y endpoints, puede desplegarse en un entorno controlado para experimentar con flujos de codificación antes de producción.
- Investigación en NLP clínico: servir como baseline especializado frente a modelos generalistas en tareas de codificación médica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.205.751.296 parámetros, en fp16 se requieren aproximadamente 8,4 GB solo para los pesos; en cuantización de 8 bits, unos 4,2 GB; en 4 bits, unos 2,1 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) permitiría fp16 con margen para KV cache.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8-16 GB según cuantización, aunque no se confirma soporte de formatos cuantizados.
- Opciones de despliegue: vLLM (declarado en tags), transformers, endpoints compatibles de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Acceso |
|---|---|---|---|---|---|
| MERIT-Coder-4B-CRISP | 4.205.751.296 | no disponible | Codificación clínica (ICD-10, CMS-HCC) | physionet-credentialed-health-data-1.5.0 | Restringido (gated) |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Generalista | según Qwen | Público |
| Alternativas especializadas en codificación clínica | no disponible | no disponible | Clínico | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es descargable libremente.
- Licencia `physionet-credentialed-health-data-1.5.0`: implica uso vinculado a datos de salud acreditados por PhysioNet; el uso comercial y la redistribución están fuertemente condicionados y deben revisarse con detalle antes de cualquier despliegue.
- Entrenado sobre datos clínicos sensibles (MIMIC-IV): riesgo de memorización y de exposición de información de pacientes si no se aplican salvaguardas.
- Riesgo de alucinación en códigos: un código ICD-10 o HCC inventado o mal mapeado puede tener consecuencias administrativas y clínicas; requiere validación humana obligatoria.
- Solo inglés: no apto para documentación clínica en castellano u otros idiomas.
- Contexto máximo no documentado: no se puede planificar su uso con notas clínicas largas sin verificación previa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su precisión frente al modelo base ni frente a alternativas.
- No se documentan sesgos específicos, pero al derivar de un modelo generalista y de un corpus clínico concreto, puede heredar sesgos de ambos.
- No debe usarse como dispositivo médico ni para decisiones clínicas autónomas.

## Enlaces

- Hugging Face: https://huggingface.co/nagur-shareef-shaik/MERIT-Coder-4B-CRISP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- PhysioNet (licencia de datos acreditados): https://physionet.org/
- MIMIC-IV: https://physionet.org/content/mimiciv/
