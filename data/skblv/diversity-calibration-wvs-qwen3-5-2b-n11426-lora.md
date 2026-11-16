# skblv/diversity-calibration-wvs-qwen3.5-2b-n11426-lora

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario skblv (firmante del paper asociado: Skobelev, Fithian y Han). No es un modelo fundacional, sino un ajuste fino orientado a una tarea muy concreta: predecir la letra de respuesta de encuestados de la World Values Survey (WVS) a partir de un prompt que combina una persona demográfica, la pregunta de la encuesta y las opciones de respuesta. El trabajo se enmarca en la investigación sobre calibración de diversidad en LLM, documentada en el paper arXiv:2609.16454, *Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs*.

El adaptador se entrenó durante tres épocas sobre 11.426 ejemplos de respondiente-pregunta procedentes de la WVS Round 7, usando un subconjunto fijo de un tercio de países y de preguntas medibles. La configuración es LoRA de rango 16, alpha 32 y dropout 0,05, con enmascaramiento de los tokens del prompt en la pérdida: solo contribuyen al gradiente el token o tokens de la letra de respuesta y el token EOS.

Su relevancia es metodológica más que de producto: sirve como artefacto reproducible para estudiar cómo el ajuste fino afecta a la diversidad de las distribuciones generadas (colapso de modos y sobredispersión) en un dominio donde la calibración demográfica es crítica. No está pensado como modelo de propósito general ni como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; admite combinarse con cuantizaciones del modelo base, no documentadas) |
| Idiomas soportados | no disponible (el dataset WVS Round 7 se recoge en múltiples países, pero no se declara cobertura lingüística) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05 aplicado sobre el modelo base Qwen/Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. El entrenamiento consistió en tres épocas sobre 11.426 ejemplos extraídos de la World Values Survey Round Seven (Country-Pooled Datafile v6.0.0, Haerpfer et al., 2022). El subconjunto de entrenamiento se fijó tomando aleatoriamente un tercio de los países y las preguntas medibles, lo que deja el resto como potencial conjunto de evaluación.

Cada ejemplo de entrenamiento se construye como un prompt con tres componentes: una persona demográfica, el texto de la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras. El objetivo es la letra de la opción elegida por el respondiente. Un detalle técnico relevante es el enmascaramiento de la pérdida: los tokens del prompt no contribuyen al cálculo de la pérdida, que se aplica únicamente al token o tokens de la letra de respuesta y al token EOS. Esto concentra el aprendizaje en la decisión de respuesta y evita que el modelo dedique capacidad a reproducir el formato del prompt.

El marco conceptual del ajuste es la calibración de diversidad: la model card incluye una curva de convergencia de diversidad relativa (R = 1 como referencia calibrada), con banda de percentiles 25-75 entre pares pregunta-grupo demográfico. El objetivo declarado del paper es corregir simultáneamente el colapso de modos (respuestas demasiado homogéneas) y la sobredispersión (respuestas demasiado heterogéneas) mediante ajuste fino.

## Capacidades

- Predicción de opción de respuesta en encuestas: dado un prompt con persona demográfica, pregunta y opciones letradas, genera la letra correspondiente.
- Modelado de distribuciones de respuesta condicionadas a demografía: la salida puede interpretarse como una distribución sobre opciones, útil para análisis de calibración.
- Generación de texto de propósito general: heredada del modelo base Qwen3.5-2B, aunque el ajuste fino está especializado y puede degradar el comportamiento generalista.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no declaradas; el dataset WVS es multinacional, pero no se especifica el tratamiento lingüístico.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en calibración de diversidad: reproducir los experimentos del paper arXiv:2609.16454 evaluando la diversidad relativa de las respuestas generadas frente a la distribución empírica de la WVS en el tercio de países y preguntas reservados.
- Simulación de opinión pública condicionada a demografía: generar distribuciones de respuesta por segmentos (edad, país, nivel educativo) para estudios de opinión, usando la persona demográfica como variable de control.
- Aumentación de datos de encuestas: sintetizar respuestas plausibles para preguntas y perfiles demográficos con pocos casos observados, siempre con validación frente a la distribución real.
- Análisis de sesgo demográfico: comparar la distribución generada por el adaptador con la observada por país o grupo para detectar desviaciones sistemáticas atribuibles al modelo base.
- Docencia y divulgación sobre ajuste fino: ejemplo compacto y reproducible de LoRA con enmascaramiento de pérdida sobre un modelo de 2B, adecuado para laboratorios con recursos limitados.
- Línea base para comparativas de métodos de calibración: servir como referencia entrenada frente a otros adaptadores o técnicas de alineación en tareas de predicción de respuestas categóricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una curva de convergencia de diversidad relativa (R = 1 como referencia calibrada) sin cifras numéricas de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador. Como referencia del modelo base de 2B, en FP16 requiere aproximadamente 4 GB de pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 2 GB; en 4 bits, en torno a 1,5 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del modelo base, cualquier GPU con al menos 8 GB de VRAM debería poder ejecutarlo en FP16.
- GPU de consumo: previsiblemente cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, así como en Apple Silicon con memoria unificada suficiente. No confirmado por el autor.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT; para servicio se puede cargar con Transformers + PEFT, y potencialmente fusionar los pesos y servir con vLLM o TGI. Soporte de llama.cpp/Ollama no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores comparables de calibración de diversidad sobre Qwen3.5-2B ni sobre modelos de tamaño similar, ni se dispone de métricas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: el adaptador está entrenado para predecir letras de respuesta de la WVS; su uso como modelo generativo general puede producir salidas degeneradas o poco útiles.
- Cobertura parcial del dataset: solo se entrenó con un tercio fijo de países y preguntas medibles, por lo que el rendimiento en países o preguntas no vistos no está garantizado.
- Riesgo de alucinación: aunque la tarea es de clasificación sobre opciones cerradas, el modelo puede generar letras fuera del conjunto de opciones o texto adicional si no se restringe la decodificación.
- Sesgos: al aprender de la WVS Round 7, puede reproducir sesgos de muestreo, de redacción de preguntas y de cobertura por país del propio instrumento.
- Licencia no declarada: no se especifican términos de uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Idiomas y contexto: no se declaran coberturas lingüísticas ni longitud de contexto efectiva tras el ajuste.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación declarada (2026-08-31) y referencia al paper (2026): verificar la disponibilidad efectiva del preprint y del modelo base antes de depender de ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n11426-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset WVS Round Seven v6.0.0: https://doi.org/10.14281/18241.24
