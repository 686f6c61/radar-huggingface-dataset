# Shanmuk4622/cardiomamba-baselines-v2

## Resumen

CardioMamba-Net es un modelo de reconstrucción de señales de electrocardiograma (ECG) a partir de radar, desarrollado por Bonala Shanmukesh (usuario Shanmuk4622) sobre el dataset CR-RVS. El objetivo es permitir la monitorización cardíaca sin contacto físico, una capacidad relevante para telemedicina, cuidados domiciliarios y entornos clínicos donde la instrumentación tradicional resulta invasiva o incómoda. El repositorio contiene checkpoints y resultados de experimentos de entrenamiento y evaluación, incluyendo métricas por ventana y por sujeto, así como reconstrucciones de muestra.

El modelo se enmarca en un pipeline de audio-audio (aunque en realidad procesa series temporales de radar y ECG) y se distribuye bajo licencia Creative Commons Attribution 4.0. No se proporcionan detalles sobre la arquitectura interna, el número de parámetros ni la longitud de contexto, pero el nombre sugiere el uso de bloques Mamba (state space models) combinados con una red de reconstrucción. El repositorio incluye tanto los pesos del mejor epoch como el estado completo del entrenamiento, lo que facilita la reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CardioMamba-Net (basada en Mamba, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de 1024 muestras a 128 Hz, 8 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesamiento de señales, no texto) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El nombre "CardioMamba-Net" sugiere el uso de capas Mamba (state space models) para modelar dependencias temporales en las señales de radar, pero no se confirma. El protocolo de entrenamiento descrito en la model card indica que se utilizan ventanas de 1024 muestras (8 segundos a 128 Hz), con división de datos por sujeto para evitar fuga de información. La normalización se calcula únicamente con las ventanas de entrenamiento de cada fold. Los baselines emplean una entrada de un solo canal (`dy`), 5 niveles, 64 filtros base, pérdida MSE y optimizador Adam con tasa de aprendizaje 5e-4. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo de regresión sobre señales.

## Capacidades

- Reconstrucción de ECG a partir de señales de radar (entrada radar, salida ECG).
- Procesamiento de series temporales de 8 segundos a 128 Hz.
- Extracción de métricas cardíacas: frecuencia cardíaca (HR), variabilidad de frecuencia cardíaca (HRV) y detección de picos, según los archivos de métricas por sujeto.
- Generación de reconstrucciones de muestra para análisis cualitativo.
- No se indican capacidades de generación de texto, código, tool calling, agentes o multimodalidad.

## Casos de uso

- Monitorización cardíaca no invasiva en domicilio: el modelo puede reconstruir el ECG a partir de un radar de bajo coste, permitiendo el seguimiento continuo de pacientes sin necesidad de electrodos.
- Telemedicina y consultas remotas: los datos de radar capturados en casa se procesan localmente o en la nube para obtener un ECG reconstruido que el médico puede interpretar.
- Detección temprana de arritmias: al reconstruir el ECG, se pueden aplicar algoritmos de análisis de ritmo para identificar anomalías como fibrilación auricular.
- Investigación en biosensores: sirve como referencia para comparar arquitecturas de reconstrucción radar-ECG en el dataset CR-RVS.
- Validación de algoritmos de procesamiento de señales: los checkpoints permiten reproducir experimentos y comparar métricas de HR/HRV con métodos tradicionales.
- Desarrollo de sistemas de monitorización en entornos clínicos: el modelo puede integrarse en dispositivos de vigilancia de pacientes en unidades de cuidados intensivos o salas de hospitalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existen tablas comparativas en el directorio `results/`, pero no se proporcionan valores numéricos en el README.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. El tamaño del repositorio es de 0.2 GB, lo que sugiere un modelo relativamente pequeño, pero no se especifican requisitos de VRAM, GPU recomendadas ni opciones de despliegue. No se mencionan herramientas como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se pueden establecer comparaciones con otras arquitecturas de reconstrucción radar-ECG.

## Limitaciones y advertencias

- No se ha validado clínicamente el modelo; su uso en diagnóstico médico requeriría una evaluación rigurosa con datos reales y aprobación regulatoria.
- La reconstrucción puede presentar errores en presencia de artefactos de movimiento o ruido en la señal de radar, aunque no se documentan casos concretos.
- El modelo se ha entrenado únicamente con el dataset CR-RVS, por lo que su generalización a otras condiciones de captura o poblaciones no está garantizada.
- No se especifican sesgos conocidos, pero al ser un modelo de regresión sobre señales, los sesgos podrían manifestarse en diferencias de rendimiento entre grupos demográficos o tipos de señal.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero se recomienda revisar los términos completos antes de su integración en productos.
- No se proporcionan instrucciones de despliegue ni soporte para frameworks de inferencia estándar; el uso requiere conocimientos de PyTorch y manejo de checkpoints.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shanmuk4622/cardiomamba-baselines-v2
- Dataset CR-RVS procesado: https://huggingface.co/datasets/Shanmuk4622/cr-rvs-radar-ecg-processed-v2
- Perfil del autor: https://huggingface.co/Shanmuk4622
