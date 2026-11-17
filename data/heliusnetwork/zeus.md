# Heliusnetwork/zeus

## Resumen

Zeus v22 es un adaptador LoRA de tipo PEFT construido sobre `mistralai/Mistral-7B-Instruct-v0.2` y especializado en verificación de afirmaciones (claim verification) frente a un conjunto de pasajes de evidencia. Dado un claim y varias fuentes numeradas, el modelo devuelve un objeto JSON con una etiqueta (`supported`, `contradicted` o `not_covered`), las citas textuales exactas que sustentan la decisión y una justificación de una frase. Lo desarrolla Heliusnetwork y forma parte del sistema Olo, que comprueba oración por oración las respuestas generadas contra fuentes del corpus abierto Olo Commons.

El modelo no es un generador de propósito general: es un componente de evaluación factual de 7B parámetros con un contrato de salida estricto (JSON válido en el 100 % de los casos medidos según el autor). Su relevancia radica en la combinación de un formato de salida verificable con citas literales, lo que permite auditar automáticamente respuestas de otros modelos y construir pipelines de atribución de fuentes.

La información publicada es escasa en cuanto a arquitectura interna (es un adaptador sobre Mistral-7B-Instruct-v0.2, sin cambios estructurales documentados) pero inusualmente detallada en metodología de entrenamiento, composición de datos y métricas de evaluación, con logs y código en un repositorio público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.2) con adaptador LoRA (rank 8 sobre q_proj y v_proj) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA añade un subconjunto no cuantificado en la ficha (no disponible el número exacto de parámetros del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Mistral-7B-Instruct-v0.2) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8 aplicado sobre las proyecciones `q_proj` y `v_proj` de Mistral-7B-Instruct-v0.2. No se documenta ninguna modificación de la arquitectura base ni técnicas de atención alternativa; la innovación está en el ajuste fino y en el formato de tarea, no en la topología. El entrenamiento usó learning rate 0.0002, batch de 16 y 1034 pasos de optimizador, completados en 60 minutos sobre una única A100 de 40 GB, con 36.255 ejemplos de entrenamiento.

Los datos proceden de tres fuentes descritas en `zeus/DATA_CARD.md`: ejemplos generados por reglas a partir de átomos de Olo Commons (cada átomo conserva su licencia de origen), ejemplos dorados escritos a mano y verificados contra los átomos que citan, y pares de claim y evidencia humanos de VitaminC (Schuster, Fisch y Barzilay, NAACL 2021, CC BY-SA 3.0). No se menciona RLHF ni DPO; el ajuste es supervisado sobre la tarea de verificación con salida JSON. El pipeline completo (datos, código de entrenamiento y evaluación) es público en el repositorio `Hashim57/olo-commons`, bajo el directorio `zeus/`, y el entrenamiento se ejecuta mediante el workflow `zeus-train.yml` en GPU en la nube.

## Capacidades

- Verificación de afirmaciones: clasifica un claim como `supported`, `contradicted` o `not_covered` frente a uno o varios pasajes de evidencia.
- Extracción de evidencia literal: devuelve la cita exacta (`quote`) y el identificador del pasaje (`passage`) que sustenta la etiqueta.
- Salida estructurada: genera un único objeto JSON con los campos `label`, `evidence` y `rationale`; el autor reporta un 100 % de JSON válido en el conjunto congelado.
- Justificación breve: produce una frase de razonamiento (`rationale`) por cada verificación.
- Atribución a fuentes: el formato de entrada incluye el identificador y la fuente de cada pasaje, lo que permite trazar la evidencia hasta el documento original.
- Integración en pipelines de fact-checking: diseñado como componente del sistema Olo para comprobar respuestas oración por oración.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Verificación automática de respuestas de un RAG: tras recuperar pasajes de un corpus, Zeus comprueba cada oración de la respuesta generada contra los pasajes y marca las que no estén cubiertas o estén contradichas, con la cita exacta para revisión humana.
- Moderación de contenido factual en foros o comentarios: dado un claim publicado y un conjunto de fuentes de referencia, el modelo devuelve una etiqueta y la cita que la respalda, lo que permite priorizar revisiones.
- Auditoría de resúmenes generados: comparar cada frase de un resumen con el documento original para detectar afirmaciones no cubiertas por el texto fuente.
- Control de calidad en bases de conocimiento: validar pares de afirmación y fuente antes de publicarlos, usando la etiqueta `not_covered` como señal de que falta evidencia.
- Enriquecimiento de pipelines de evaluación de LLM: usar el modelo como juez de factualidad con evidencia citada, complementando métricas automáticas que no verifican contra fuentes.
- Detección de contradicciones en documentación técnica: comprobar si una afirmación nueva contradice pasajes existentes de un manual o una wiki, con la cita del pasaje en conflicto.
- Generación de conjuntos de datos de verificación: el formato JSON con citas facilita la creación de datos etiquetados y auditables a partir de corpus abiertos como Olo Commons.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos el 2026-11-16 con `zeus/eval.py` para esta versión exacta:

| Conjunto | Exactitud de etiqueta |
|---|---|
| VitaminC dev (300 claims humanos, held out) | 73,3 % |
| Commons eval v3 (congelado, patrones difíciles, n=200) | 92,0 % |
| Commons eval v2 (congelado, split más difícil, n=200) | 100,0 % |
| Commons eval (primer split congelado, n=200) | 99,5 % |

Métricas adicionales en el split congelado: acierto de evidencia (span citado encontrado en el pasaje correcto) del 99,5 % y JSON válido del 100,0 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre Mistral-7B, los requisitos son los del modelo base. En fp16, aproximadamente 14-15 GB de VRAM para los pesos más overhead de activaciones; en cuantización de 4 bits, alrededor de 4-5 GB.
- GPU recomendadas: A100-40GB (la usada en entrenamiento), H100, L40S o A10G para despliegue en fp16. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ejecutar el modelo en fp16; tarjetas de 8-12 GB requieren cuantización.
- Despliegue: el adaptador se carga con `peft` sobre el modelo base en `transformers`. Para servir en producción, vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: el adaptador ocupa 0,0 GB según el tamaño del repositorio en Hugging Face, lo que sugiere que los pesos del adaptador aún no se han subido o son de tamaño despreciable en el momento de la consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeus v22 | 7B (base) + LoRA | no disponible | Verificación de claims con citas JSON | apache-2.0 | Hugging Face (adaptador PEFT) |
| Mistral-7B-Instruct-v0.2 | 7B | no disponible | Instrucción general | apache-2.0 | Hugging Face |
| VitaminC baselines (Schuster et al., 2021) | no disponible | no disponible | Verificación de claims | CC BY-SA 3.0 (datos) | Paper y datos públicos |

No se dispone de datos comparativos de benchmarks frente a otros verificadores de claims en la información proporcionada.

## Limitaciones y advertencias

- Contradicciones sutiles: la mayoría de las contradicciones de entrenamiento se generan por regla (cambio de una relación, año, número o nombre), por lo que el modelo rinde peor ante contradicciones sutiles que ante las claras; el autor reporta el patrón más débil en su informe semanal.
- Conocimiento cerrado al contexto: solo verifica el claim contra los pasajes que recibe; no conoce nada fuera de ellos y no debe usarse como fuente de verdad autónoma.
- No sustituye la lectura de la fuente: el propio autor advierte que cada respuesta de Olo incluye sus pasajes para revisión humana.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Riesgo de alucinación: el formato exige citas literales, lo que mitiga pero no elimina el riesgo de citas incorrectas o atribuidas al pasaje equivocado; el acierto de evidencia medido es del 99,5 % en el split congelado, no en todos los dominios.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Licencia: el adaptador es apache-2.0, pero los datos de entrenamiento incluyen texto de Wikipedia y VitaminC bajo CC BY-SA 3.0, lo que exige atribución a Wikipedia y a los autores de VitaminC en usos derivados.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño reportado es de 0,0 GB, lo que indica que el artefacto puede no estar completamente publicado; conviene verificar la disponibilidad real de los pesos antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Heliusnetwork/zeus
- Repositorio de código y datos: https://github.com/Hashim57/olo-commons
- Data card: https://github.com/Hashim57/olo-commons/blob/main/zeus/DATA_CARD.md
- Sistema Olo: https://helius-olo.io
- Olo Commons: https://heliusnetwork.app/olo
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- VitaminC (Schuster, Fisch y Barzilay, NAACL 2021): no disponible enlace directo en la información proporcionada
