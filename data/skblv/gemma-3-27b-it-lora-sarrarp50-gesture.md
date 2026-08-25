# skblv/gemma-3-27b-it-lora-sarrarp50-gesture

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario skblv, que se aplica sobre el modelo base `google/gemma-3-27b-it` de Google DeepMind. Su propósito es reconocer el gesto de sutura actual en frames de prostatectomía radical asistida por robot, extraídos del dataset SAR-RARP50. Se trata de una tarea de clasificación de imagen única sobre 8 gestos quirúrgicos, utilizada como proxy de habilidad en un leaderboard de comprensión de video quirúrgico.

El adaptador se ha entrenado con 1.445 frames (1 Hz) y supervisión en formato JSON, con una configuración LoRA que modifica todas las proyecciones de atención y MLP. Aunque el modelo base es multimodal y admite contexto de 128K tokens, el adaptador se usa exclusivamente para clasificación de imágenes estáticas. Es relevante porque representa un intento de aplicar un LLM multimodal de gran tamaño a una tarea médica específica, pero sus resultados son muy limitados: alcanza un 22,5% de exactitud, frente al 53,1% de un clasificador supervisado más convencional (YOLO11m-cls).

El repositorio del adaptador ocupa 0,5 GB y se distribuye en formato safetensors, con licencia Gemma. No se han publicado datos sobre idiomas soportados ni cuantizaciones alternativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Gemma 3 27B-it (transformer multimodal) |
| Parametros totales | no disponible (adaptador; el modelo base tiene 27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128K tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se usa en bfloat16) |
| Idiomas soportados | no disponible (el modelo base soporta 140+ idiomas) |
| Licencia | Gemma |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena sobre el modelo base `google/gemma-3-27b-it`, que es un transformer multimodal con 27B parámetros y una ventana de contexto de 128K tokens. La configuración LoRA utiliza r=16, alpha=32, dropout=0.05, y se aplica a todas las proyecciones de atención (q/k/v/o) y a las proyecciones del MLP (gate/up/down). El entrenamiento se realizó con una tasa de aprendizaje de 1e-4, batch efectivo de 4 (1 paso de gradiente acumulado), 3 épocas y semilla 42.

El dataset de entrenamiento son 1.445 frames de video quirúrgico muestreados a 1 Hz, con un split de monitorización a nivel de video de 118 frames. La supervisión se realizó con completions JSON que coinciden con el formato de salida esperado en la evaluación. No se menciona el uso de RLHF ni DPO; es un ajuste fino supervisado clásico.

## Capacidades

- Clasificación de imágenes para reconocimiento de gestos de sutura en cirugía robótica (8 etiquetas: Otra, Recoger la aguja, Posicionar la punta de la aguja, Empujar la aguja a través del tejido, Sacar la aguja del tejido, Atar un nudo, Cortar la sutura, Devolver o soltar la aguja).
- El adaptador procesa imágenes (frames) y devuelve una salida JSON con el gesto detectado.
- Al estar basado en Gemma 3 27B, hereda la capacidad de razonamiento general del modelo base, aunque su uso aquí es puramente clasificatorio.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües específicas; el modelo base sí las tiene, pero no se han evaluado para esta tarea.

## Casos de uso

- Evaluación automática de habilidades quirúrgicas: el adaptador puede clasificar gestos de sutura en tiempo real durante una cirugía robótica, proporcionando una métrica objetiva de desempeño que puede usarse como proxy de habilidad en programas de entrenamiento quirúrgico.
- Análisis de video quirúrgico para investigación: permite etiquetar automáticamente grandes colecciones de vídeos de prostatectomía, facilitando estudios retrospectivos sobre técnicas quirúrgicas y resultados.
- Feedback formativo en simuladores: integrado en sistemas de simulación quirúrgica, puede dar feedback inmediato al cirujano sobre los gestos realizados, ayudando a corregir errores de técnica.
- Monitorización de procedimientos en quirófano: como herramienta de apoyo, puede clasificar la fase de sutura en tiempo real, permitiendo alertar al equipo sobre posibles desviaciones del plan quirúrgico.
- Documentación quirúrgica automatizada: el modelo puede generar automáticamente descripciones de los pasos de sutura realizados, que podrían incorporarse al informe operatorio.
- Comparación de técnicas quirúrgicas: al clasificar gestos en diferentes vídeos, se pueden comparar las técnicas de distintos cirujanos y estudiar su evolución temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la exactitud de coincidencia exacta (exact-match) en la validación:

| Modelo | Exact-match accuracy |
|---|---|
| Gemma 3 27B-it + LoRA (este adaptador) | 22,5% (95% CI 19,3–25,8) |
| YOLO11m-cls (baseline supervisado) | 53,1% |

No se proporcionan resultados de MMLU, HumanEval, GSM8K u otros benchmarks genéricos, ya que el modelo está especializado en una tarea médica muy concreta.

## Requisitos de hardware

- El adaptador LoRA es pequeño (0,5 GB), pero para inferencia se necesita cargar el modelo base completo (27B parámetros) en memoria. En bfloat16, el modelo base requiere aproximadamente 54 GB de VRAM.
- Se recomienda al menos una GPU con 80 GB de VRAM (por ejemplo, A100 o H100) para ejecutar el modelo en bfloat16 sin cuantización.
- En GPUs de consumo como la RTX 4090 (24 GB VRAM) no cabría el modelo completo en bfloat16; sería necesario cuantizar el modelo base (p. ej., a 8 bits o 4 bits) o usar la CPU con mucha RAM.
- El despliegue se puede hacer con librerías que soporten PEFT y LoRA, como Hugging Face Transformers con PeftModel, vLLM, o llama.cpp (aunque este último requiere conversión del modelo base).
- La latencia estimada no se proporciona; al ser un modelo de 27B en una sola GPU, la inferencia por frame será de varios cientos de milisegundos en una A100, pero depende del hardware y de la optimización.

## Comparativa con modelos similares

No hay modelos comparables directamente disponibles en la información proporcionada. Se puede comparar con el baseline supervisado YOLO11m-cls, que es un clasificador de imágenes clásico (CNN) entrenado específicamente para esta tarea. La comparación es desfavorable para el adaptador LoRA, que obtiene una exactitud de 22,5% frente al 53,1% de YOLO11m-cls. No se dispone de datos sobre otros modelos de video o LLMs multimodales aplicados a esta tarea.

## Limitaciones y advertencias

- El modelo es un baseline de investigación y no está validado para uso clínico ni como dispositivo médico.
- La precisión es baja (22,5% de exactitud) y no es adecuado para aplicaciones de producción sin un refinamiento adicional.
- Solo procesa frames individuales, ignorando las señales temporales que son críticas en el reconocimiento de gestos quirúrgicos. Un modelo de video dedicado (p. ej., con LSTM o transformer temporal) tendría un rendimiento superior.
- El modelo se ha entrenado exclusivamente con datos del dataset SAR-RARP50, por lo que puede tener sesgos hacia las condiciones específicas de esos vídeos (tipo de robot, iluminación, etc.).
- La licencia Gemma del modelo base restringe el uso comercial; se debe consultar la licencia completa para verificar las condiciones.
- No se ha evaluado el modelo en otros idiomas ni en otros dominios quirúrgicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/gemma-3-27b-it-lora-sarrarp50-gesture
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper del dataset SAR-RARP50: https://arxiv.org/abs/2401.00496
- Leaderboard de video quirúrgico (repositorio del autor): https://github.com/skblv/neurosurgery-video-eval-website
- Página oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
