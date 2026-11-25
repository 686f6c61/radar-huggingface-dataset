# davanstrien/tiny-voca-jobs-repro

## Resumen

tiny-voca-jobs-repro es una reproducción del modelo de síntesis de voz tiny-voca, desarrollado originalmente por Muhammed Nazeem (n4ze3m). Se trata de un modelo de text-to-speech en inglés de tan solo 4,5 millones de parámetros, capaz de generar voz con dos timbres predefinidos (F2 y M2). La reproducción la firma davanstrien y demuestra que la receta de entrenamiento publicada en el repositorio jobs-recipes permite reconstruir el modelo original desde cero con resultados equivalentes.

El interés de esta ficha no reside tanto en el modelo en sí (para uso práctico conviene acudir al original n4ze3m/tiny-voca) como en la validación de un flujo de trabajo reproducible: preparación de datos, alineamiento, entrenamiento, evaluación y exportación a ONNX ejecutados de principio a fin en una sola GPU mediante Hugging Face Jobs en aproximadamente 5,5 horas y unos 15 dólares. El repositorio incluye un archivo AGENTS.md que permite a un agente de código ejecutar la receta de forma autónoma.

El modelo se distribuye con licencia Apache 2.0, únicamente en inglés, y con pesos en formato PyTorch (.pt) y ONNX. Su reducido tamaño lo hace apto para inferencia en dispositivos de gama baja, navegadores o teléfonos, siempre que se acepte la limitación de voces sintéticas y un dominio de aplicación restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS entrenado desde cero; detalles internos no especificados en la información disponible) |
| Parametros totales | 4,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación ONNX disponible; no se documentan niveles de cuantización) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) y ONNX (onnx/model.onnx, onnx/model.json) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un sistema de text-to-speech entrenado desde cero con 4,5 millones de parámetros. El pipeline incluye un fonemizador (dependencia dizione) cuyos datos provienen del repositorio original. El entrenamiento se realizó con 104.000 pasos sobre 16.018 clips de entrenamiento del dataset n4ze3m/tiny-voca (revisión 63b6b89), compuesto por voz sintética en dos timbres (F2 y M2). La pérdida adversarial se introdujo a partir del paso 8.000.

La reproducción se ejecutó en una única GPU RTX PRO 6000 (instancia rtx-pro-6000 en Hugging Face Jobs), con 3 horas y 50 minutos de entrenamiento y unas 5,5 horas para el flujo completo (preparación de datos, alineamiento, entrenamiento, evaluación y exportación ONNX), con un coste aproximado de 15 dólares. El código utilizado corresponde a los commits tiny-voca 903f940 y dizione 8cd889e. No se documentan técnicas como decodificación especulativa, atención lineal ni etapas de RLHF/DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano.
- Dos voces predefinidas: F2 (femenina) y M2 (masculina), derivadas de los datos de entrenamiento del autor original.
- Generación de audio en formato WAV mediante la CLI `tiny_voca.infer`.
- Exportación a ONNX con las mismas entradas y salidas que el modelo original, lo que facilita el despliegue en entornos ligeros.
- Manejo razonable de frases con números, horas y fechas en los ejemplos publicados (por ejemplo, "3:30 pm on March 14th").
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al inglés; no se reportan otros idiomas.

## Casos de uso

- Lectura de notificaciones y alertas en aplicaciones móviles: con 4,5 M de parámetros y exportación ONNX, el modelo puede ejecutarse en el propio dispositivo para convertir texto en voz sin depender de la nube, reduciendo latencia y coste.
- Accesibilidad web para personas con discapacidad visual: integración en el navegador mediante ONNX Runtime para leer contenido de páginas o formularios, con dos voces seleccionables según preferencia del usuario.
- Prototipado rápido de asistentes de voz: al disponer de una CLI sencilla (`python -m tiny_voca.infer`) y pesos ligeros, permite validar flujos de conversación por voz en fases tempranas sin infraestructura GPU dedicada.
- Generación de avisos pregrabados en sistemas embebidos: el tamaño reducido permite almacenar el modelo y generar mensajes dinámicos en dispositivos con recursos limitados, como paneles informativos o electrodomésticos conectados.
- Reproducción de investigación en entornos educativos: el repositorio sirve como ejemplo verificable de un pipeline completo de TTS (datos, alineamiento, entrenamiento adversarial, evaluación con WER y exportación) ejecutable en una sola GPU por unos 15 dólares.
- Evaluación comparativa de recetas de entrenamiento: investigadores pueden reutilizar la receta jobs-recipes con AGENTS.md para reproducir el modelo con un agente de código y comparar métricas (WER, duration ratio, pause ratio, mel DTW) frente al original.

## Benchmarks y rendimiento

Los resultados publicados comparan esta reproducción con el modelo original, evaluados con la misma llamada `tiny_voca.evaluate` sobre los mismos clips. El WER se obtiene mediante lectura de vuelta con Whisper.

| Split | Modelo | WER | Duration ratio | Pause ratio | Mel DTW |
|---|---|---|---|---|---|
| test (594 clips) | esta reproducción | 1,26 % | 0,986 | 1,13 | 0,733 |
| test (594 clips) | modelo original | 1,36 % | 0,956 | 1,05 | 0,731 |
| test (594 clips) | grabaciones fuente | 1,14 % | no disponible | no disponible | no disponible |
| validation (600 muestras) | esta reproducción | 0,75 % | 1,002 | 1,15 | 0,741 |
| validation (600 muestras) | modelo original | 0,82 % | 0,970 | 1,06 | 0,741 |
| validation (600 muestras) | grabaciones fuente | 0,64 % | no disponible | no disponible | no disponible |

El autor advierte que una segunda evaluación de los mismos checkpoints movió las puntuaciones hasta 0,17 puntos, por lo que ambos modelos deben considerarse de calidad equivalente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable en un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,5 M de parámetros el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia; el entrenamiento se realizó en una RTX PRO 6000.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 4090, RTX 3060, etc.) e incluso en iGPU o CPU.
- Opciones de despliegue: CLI oficial `tiny_voca.infer` (PyTorch), ONNX Runtime para `onnx/model.onnx`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El coste de entrenamiento reportado es de unas 5,5 horas y unos 15 dólares en una RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| davanstrien/tiny-voca-jobs-repro | 4,5 M | no disponible | en | Apache 2.0 | .pt, ONNX | Reproducción del original; WER 1,26 % en test |
| n4ze3m/tiny-voca | 4,5 M | no disponible | en | no disponible en la información | .pt, ONNX | Modelo original; WER 1,36 % en test; recomendado para uso práctico |
| Otros modelos TTS ligeros | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparativa relevante se limita al modelo original, dado que la información disponible no incluye otros sistemas TTS con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo admite inglés; no se documenta soporte para otros idiomas.
- Las voces F2 y M2 provienen de voz sintética del dataset original, lo que puede limitar la naturalidad y la expresividad frente a sistemas entrenados con voz humana.
- Riesgo de alucinación o pronunciación incorrecta en textos fuera del dominio de entrenamiento (números, siglas, nombres propios); los ejemplos publicados se limitan a frases sencillas.
- No se documentan sesgos específicos, pero al entrenarse con un dataset sintético de dos voces, la diversidad de acentos y estilos es reducida.
- Para uso en producción se recomienda el modelo original n4ze3m/tiny-voca; esta reproducción está pensada como validación de la receta.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset y del fonemizador (dizione) empleados.
- No se especifican límites de longitud de texto de entrada ni comportamiento con secuencias largas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davanstrien/tiny-voca-jobs-repro
- Modelo original: https://huggingface.co/n4ze3m/tiny-voca
- Dataset de entrenamiento: https://huggingface.co/datasets/n4ze3m/tiny-voca
- Receta jobs-recipes/tiny-voca: https://github.com/davanstrien/jobs-recipes/tree/main/tiny-voca
- Repositorio tiny-voca (código): https://github.com/n4ze3m/tiny-voca
- Repositorio dizione (fonemizador): https://github.com/n4ze3m/dizione
- Documentación de Hugging Face Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
