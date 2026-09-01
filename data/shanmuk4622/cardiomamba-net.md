# Shanmuk4622/cardiomamba-net

## Resumen

CardioMamba-Net es un modelo de reconstrucción de señales biomédicas que convierte señales de radar en electrocardiogramas (ECG) sin contacto físico. Desarrollado por Bonala Shanmukesh (Shanmuk4622), el modelo se entrena sobre el conjunto de datos CR-RVS, que contiene pares de radar y ECG procesados. Su nombre sugiere el uso de arquitecturas basadas en Mamba, una familia de modelos de estado (SSM) eficientes para secuencias largas, lo que resulta adecuado para señales temporales de alta frecuencia como las biomédicas.

El modelo se publica bajo licencia CC-BY-4.0 y se distribuye como checkpoints de PyTorch junto con métricas detalladas por ventana y por sujeto. Aunque el pipeline declarado es audio-to-audio, su aplicación real es la monitorización cardíaca no invasiva, con potencial uso en telemedicina, cuidados intensivos y dispositivos portátiles. La fecha de creación (septiembre de 2026) indica que es un trabajo reciente, aún sin adopción masiva (0 descargas en Hugging Face).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Mamba (SSM), detalles exactos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 muestras (8 segundos a 128 Hz) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, probablemente FP32) |
| Idiomas soportados | no aplica (procesamiento de señales) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (best.pt, state.pt) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna, pero el nombre "CardioMamba-Net" y la mención a "Mamba-Powered" en la cobertura periodística indican el uso de bloques Mamba, una arquitectura de espacio de estados que combina eficiencia lineal con capacidad de modelado de dependencias largas. El modelo procesa ventanas de 8 segundos de señal de radar a 128 Hz (1024 muestras) y produce la reconstrucción del ECG correspondiente.

El entrenamiento sigue un protocolo riguroso: división de datos por sujeto (sin solapamiento de ventanas de test), normalización calculada solo con ventanas de entrenamiento por pliegue, y una configuración de línea base que usa una sola canal de entrada (`dy`), 5 niveles de descomposición, 64 filtros base, pérdida MSE y optimizador Adam con tasa de aprendizaje 5e-4. Los checkpoints incluyen el mejor estado por época de validación y un estado completo reanudable con optimizador, scheduler y generador de números aleatorios.

## Capacidades

- Reconstrucción de ECG a partir de señales de radar, lo que permite monitorización cardíaca sin contacto físico.
- Procesamiento de series temporales de alta frecuencia (128 Hz) con ventanas de 8 segundos.
- Generación de métricas por ventana y por sujeto: frecuencia cardíaca (HR), variabilidad de frecuencia cardíaca (HRV) y detección de picos.
- Almacenamiento de predicciones en formato NPZ para análisis cualitativo y comparación visual.
- Reproducibilidad completa: incluye configuraciones, métricas agregadas y figuras de curvas de entrenamiento.
- No es un modelo de lenguaje: no genera texto ni soporta tool calling, agentes o razonamiento simbólico.

## Casos de uso

- Monitorización cardíaca en pacientes hospitalizados: el modelo puede reconstruir el ECG a partir de un radar de bajo coste colocado en la habitación, eliminando la necesidad de electrodos adhesivos y reduciendo el riesgo de infecciones.
- Telemedicina y seguimiento ambulatorio: un dispositivo doméstico con radar podría enviar reconstrucciones de ECG a un servidor médico para detectar arritmias sin que el paciente tenga que acudir a consulta.
- Cuidados neonatales y pediátricos: la monitorización sin contacto es especialmente valiosa en bebés prematuros, donde la piel es frágil y los electrodos pueden causar lesiones.
- Deporte y bienestar: integración en wearables o ropa inteligente que usen radar de onda milimétrica para estimar la frecuencia cardíaca y su variabilidad durante el ejercicio.
- Investigación en señales biomédicas: el conjunto de datos CR-RVS y los checkpoints permiten a otros investigadores comparar sus propios métodos de reconstrucción radar-ECG con una línea base reproducible.
- Vigilancia de pacientes en unidades de quemados o con lesiones cutáneas: donde el contacto físico con electrodos está contraindicado, el radar ofrece una alternativa segura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que en `results/` hay tablas comparativas con los números publicados del paper original, pero no se incluyen valores concretos en el README ni en los metadatos de Hugging Face. No se dispone de métricas como MMLU, HumanEval o GSM8K porque el modelo no es un LLM; las métricas relevantes serían de error de reconstrucción (MSE, RMSE) y de precisión en detección de picos, pero no están disponibles públicamente.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información proporcionada.
- Dado que el modelo procesa ventanas de 1024 muestras y no se indican parámetros totales, es probable que quepa en GPUs de consumo (p. ej., RTX 3060 o superior) si el tamaño es del orden de decenas de millones de parámetros, pero esto es una estimación no confirmada.
- Los checkpoints se guardan en formato PyTorch, por lo que el despliegue requiere un entorno con PyTorch instalado.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, que son específicas para modelos de lenguaje; para este modelo se usaría inferencia directa con PyTorch o un framework de inferencia de series temporales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (reconstrucción radar-ECG) dentro de los datos proporcionados. El artículo de bioengineer.org menciona una red basada en Mamba para monitorización fetal, pero no se confirma que sea el mismo modelo ni se ofrecen cifras comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No hay información pública sobre sesgos del modelo ni sobre su comportamiento en poblaciones diversas (edad, sexo, condiciones patológicas).
- El modelo se ha entrenado con un único conjunto de datos (CR-RVS); su generalización a otros entornos, frecuencias de radar o tipos de señal no está validada.
- La reconstrucción de ECG a partir de radar es una tarea compleja y el error puede ser alto en presencia de ruido o movimiento del paciente; no debe usarse como sustituto de un ECG clínico sin validación adicional.
- La licencia CC-BY-4.0 permite uso comercial y modificación, pero exige atribución; no hay restricciones conocidas de uso, pero se recomienda revisar los términos completos.
- El modelo no es un LLM: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de lenguaje.
- No se han publicado resultados de rendimiento en producción ni estudios de latencia; cualquier despliegue requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shanmuk4622/cardiomamba-net
- Conjunto de datos CR-RVS procesado: https://huggingface.co/datasets/Shanmuk4622/cr-rvs-radar-ecg-processed
- Perfil del autor en Hugging Face: https://huggingface.co/Shanmuk4622
- Repositorio GitHub del autor: https://github.com/Shanmuk4622
- Documento de análisis de novedad (GitHub): https://github.com/Shanmuk4622/jeb-rag/blob/main/paper/novelty_resweep_2026-08-20.md
- Artículo de prensa sobre redes Mamba en monitorización fetal: https://bioengineer.org/lightweight-ai-network-delivers-reliable-fetal-monitoring-in-noisy-environments/
