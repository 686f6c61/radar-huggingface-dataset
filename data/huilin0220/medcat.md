# HuiLin0220/Medcat

## Resumen

Medcat es un modelo vision-lenguaje (image-text-to-text) especializado en dominio médico, publicado por el usuario de HuggingFace HuiLin0220. Se construye como un ajuste fino del modelo base OpenGVLab/InternVL3-8B-hf, e incorpora adaptadores LoRA por tarea y fuente, además de cabezas de clasificación compactas. El repositorio, denominado Medcat V10, está orientado a cuatro tareas de inferencia: clasificación de enfermedades, clasificación multietiqueta, detección y regresión.

La distribución incluye el modelo base InternVL3-8B-hf, un componente identificado como FLARE-InternVL3-8B-hf y componentes ME-VLIP. El código de inferencia no se aloja en HuggingFace, sino en el repositorio de GitHub HuiLin0220/Medcat, desde donde se invoca mediante `inference.py` y `predict.sh`, descargando los pesos al directorio `models/`.

El modelo es relevante como ejemplo de adaptación paramétricamente eficiente (LoRA) de un VLM generalista de 8B a tareas clínicas multimodales, con verificación de integridad mediante SHA256. No obstante, el nivel de adopción pública es nulo en el momento de la consulta (0 descargas, 0 likes) y la model card declara explícitamente que los pesos se publican para investigación y reproducción de retos, no para diagnóstico o tratamiento clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (InternVL3), con adaptadores LoRA y cabezas de clasificación añadidas |
| Parametros totales | 8B en el modelo base (según la denominación InternVL3-8B-hf); el total del bundle Medcat no está desglosado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la documentación; los pesos se distribuyen en safetensors sin cuantizaciones publicadas |
| Idiomas soportados | No disponible |
| Licencia | `other` con `license_name: qwen`; por componentes: Medcat y ME-VLIP Apache-2.0, InternVL MIT, componentes Qwen bajo Qwen License Agreement |
| Formato de pesos | Safetensors (transformers), con fichero SHA256SUMS.models para verificación |
| Modelo base | OpenGVLab/InternVL3-8B-hf |
| Tareas declaradas | Clasificación de enfermedades, clasificación multietiqueta, detección, regresión |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 60,1 GB; el árbol de modelos descargable es de aproximadamente 16 GB |
| Creado / actualizado | 2026-08-29 / 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a InternVL3-8B-hf, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas de imagen-a-texto. Sobre esa base, Medcat añade adaptadores LoRA específicos por tarea y por fuente de datos, junto con cabezas de clasificación compactas para las salidas de clasificación, detección y regresión. Los componentes ME-VLIP forman parte del bundle y están licenciados bajo Apache-2.0.

La documentación disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Se menciona un contenedor "Medcat V10" evaluado, con el que los tensores se compararon byte a byte, y se indica que se omitió un checkpoint focal predecesor no utilizado y que dos rutas de procedencia locales fueron sustituidas por descripciones portables en metadatos no tensoriales. Cualquier detalle adicional sobre el proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto condicionada por imagen (pipeline image-text-to-text), heredada del modelo base InternVL3-8B-hf.
- Clasificación de enfermedades a partir de entradas visuales, mediante adaptadores LoRA y cabezas de clasificación dedicadas.
- Clasificación multietiqueta, es decir, asignación simultánea de varias categorías a una misma imagen.
- Detección de hallazgos u objetos en la imagen, con salida de localización.
- Regresión sobre valores continuos, útil para medidas o puntuaciones derivadas de la imagen.
- Selección de adaptador por tarea y por fuente, lo que permite reutilizar un mismo modelo base con distintos cabezales.
- Capacidades de tool calling o function calling: no documentadas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Modo thinking, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Clasificación de enfermedades en investigación clínica: el modelo puede asignar una categoría diagnóstica a una imagen médica usando el adaptador de clasificación correspondiente, lo que permite estudiar la viabilidad de VLMs ajustados con LoRA en tareas de triaje.
- Clasificación multietiqueta de comorbilidades: en lugar de una única etiqueta, el cabezal multietiqueta permite anotar varias condiciones presentes en una misma imagen, útil para construir datasets con etiquetado múltiple.
- Detección y localización de hallazgos: la tarea de detección facilita obtener regiones de interés sobre la imagen, lo que sirve como paso previo a la revisión por parte de un especialista.
- Regresión de medidas continuas: el cabezal de regresión permite estimar valores numéricos (puntuaciones, medidas) a partir de la imagen, un requisito habitual en escalas clínicas cuantitativas.
- Preanotación en pipelines de etiquetado asistido: integrado mediante `inference.py` en un flujo de trabajo interno, el modelo puede generar etiquetas preliminares que después se revisan y corrigen por anotadores humanos, reduciendo el coste por imagen.
- Reproducción de retos académicos: el propio repositorio declara que los pesos se publican para investigación y reproducción de retos, por lo que es adecuado para replicar resultados de una competición o benchmark médico concreto.
- Experimentación con adaptación eficiente de VLMs: al distribuir el modelo base junto con adaptadores LoRA por tarea y fuente, permite estudiar el intercambio de adaptadores y hacer ablaciones sin reentrenar el modelo completo.
- Verificación de integridad en entornos controlados: la presencia de `SHA256SUMS.models` y `NOTICE` facilita auditar que los pesos desplegados coinciden con los evaluados, algo relevante en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de un contenedor "Medcat V10" evaluado con el que se compararon los tensores byte a byte, pero no incluye métricas (MMLU, HumanEval, GSM8K ni métricas específicas de clasificación, detección o regresión). Tampoco se han encontrado cifras de latencia o throughput.

## Requisitos de hardware

- Tamaño de pesos: el árbol de modelos ocupa aproximadamente 16 GB (el repositorio completo, 60,1 GB); el componente principal es un VLM de 8B parámetros en safetensors.
- VRAM estimada para inferencia en BF16/FP16: en torno a 18-20 GB considerando los 8B de parámetros más el codificador visual y la sobrecarga de activaciones. Es una estimación derivada del tamaño, no un dato publicado.
- VRAM estimada con cuantización: aproximadamente 10-12 GB en 8 bits y 6-8 GB en 4 bits, si se aplican técnicas de cuantización estándar. No se distribuyen pesos precuantizados.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para despliegue en servidor; RTX 4090 o RTX 3090 (24 GB) para ejecución local en BF16 con margen ajustado.
- Compatibilidad con GPU de consumo: sí, en tarjetas de 24 GB como RTX 4090 o RTX 3090 en BF16; en GPUs de 16 GB (RTX 4080, A4000) sería recomendable cuantizar; por debajo de 12 GB, es necesario cuantizar a 4 bits.
- Opciones de despliegue: la librería declarada es transformers, con los scripts `inference.py` y `predict.sh` del repositorio de GitHub; la etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints. No se declara soporte explícito de vLLM, llama.cpp, Ollama o TGI en la documentación disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Medcat (HuiLin0220) | 8B (base InternVL3-8B-hf) + LoRA y cabezas | No disponible | Clasificación, multietiqueta, detección, regresión | `other` (qwen) por componentes: Apache-2.0 / MIT / Qwen | HuggingFace + GitHub; 0 descargas, 0 likes |
| InternVL3-8B-hf (OpenGVLab) | 8B | No disponible | Image-text-to-text generalista | MIT (según el bundle Medcat) | HuggingFace, ampliamente utilizado |
| Qwen2.5-VL-7B | 7B (según denominación) | No disponible | Image-text-to-text generalista | No disponible | HuggingFace |
| MedGemma-4B | 4B (según denominación) | No disponible | Image-text-to-text en dominio médico | No disponible | HuggingFace |

Las cifras de contexto, rendimiento y licencia de las alternativas no se han verificado en la información proporcionada, por lo que se marcan como no disponibles. La comparación relevante y contrastable es con el propio modelo base InternVL3-8B-hf: Medcat añade cabezas de clasificación y adaptadores LoRA específicos, a cambio de un bundle más pesado y de una licencia compuesta con términos adicionales.

## Limitaciones y advertencias

- Uso clínico restringido: la model card indica explícitamente que los pesos se publican para investigación y reproducción de retos, y que no están destinados al diagnóstico ni al tratamiento clínico.
- Licencia compuesta: el repositorio declara `license: other` con `license_name: qwen`, y el bundle combina componentes bajo Apache-2.0, MIT y Qwen License Agreement. El uso comercial exige revisar y cumplir los términos de todas las licencias ascendentes, incluida la de Qwen.
- Sesgos conocidos: no disponibles. Al ser un ajuste fino sobre datos médicos no documentados, los sesgos de población, modalidad o centro de origen son indeterminados.
- Riesgo de alucinación: inherente al modelo base, un VLM generativo de 8B. En tareas de clasificación y regresión el riesgo se mitiga parcialmente con cabezas dedicadas, pero no se han publicado métricas de calibración ni de fiabilidad.
- Limitaciones de contexto e idioma: ni la longitud de contexto ni los idiomas soportados están documentados, lo que impide garantizar un comportamiento correcto fuera del idioma o la longitud de entrada empleados en el ajuste.
- Ausencia total de validación pública: 0 descargas y 0 likes, sin benchmarks publicados ni informes de terceros. Cualquier uso en producción debería ir precedido de una evaluación propia sobre el dominio objetivo.
- Dependencia de un único punto de suministro: el código de inferencia vive en un repositorio de GitHub separado del repositorio de pesos, por lo que la reproducibilidad depende de mantener ambos alineados y de verificar `SHA256SUMS.models`.
- Discrepancia de tamaño: el repositorio declara 60,1 GB mientras que el árbol de modelos descargable es de aproximadamente 16 GB; conviene revisar qué contiene el resto antes de planificar el almacenamiento.
- Fechas de creación y actualización (2026) poco habituales: conviene verificar la procedencia y el historial del repositorio antes de integrarlo en un pipeline.
- Sin garantías de soporte: no hay documentación de mantenimiento, versionado de adaptadores ni política de actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HuiLin0220/Medcat
- Código de inferencia (GitHub): https://github.com/HuiLin0220/Medcat
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-8B-hf
- Licencia Qwen referenciada en la model card: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- Ficheros de licencia dentro del repositorio de pesos: `LICENSE-MEDCAT`, `LICENSE-INTERNVL`, `LICENSE-QWEN`
- Avisos de atribución: `NOTICE`
- Verificación de integridad: `SHA256SUMS.models`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
