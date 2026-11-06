# imsg8/kalparso-xlmr

## Resumen

KalParso-XLM-R es un modelo de clasificación de tokens especializado en la normalización temporal de entradas informales en hinglish (hindi-inglés). Desarrollado por Shivang Gulati y Archana Praveen Kumar (Manipal Institute of Technology, MAHE), convierte frases como "parso shaam saade 5 baje dentist" en una fecha y hora exactas (`2026-11-02`, `17:30`) junto con el tipo de entrada (recordatorio, nota u objetivo) y la dirección temporal (futuro o pasado). Se basa en un fine-tuning de `FacebookAI/xlm-roberta-base` con 278 millones de parámetros y tres cabezas lineales adicionales.

El problema que resuelve es concreto: en hinglish, palabras como *kal* significan "mañana" o "ayer" según el tiempo verbal, y *parso* puede ser pasado mañana o anteayer. Los LLM generalistas fallan en esta desambiguación dependiente del contexto gramatical. KalParso combina el modelo neuronal con un *grounder* determinista de 200 líneas (`ground.py`) que realiza la aritmética de calendario, separando la extracción de menciones temporales del cálculo de fechas.

Es relevante por su eficiencia: la versión int8 ONNX ocupa 278 MB y procesa una entrada en 17 ms en un solo núcleo de CPU de 2019, alcanzando un 85,8% de acierto exacto en fecha y hora sobre 706 entradas humanas de test. Supera a modelos mucho mayores como gemma4:26b (89,0% pero a 10,8 s por entrada) en la relación precisión/latencia, y queda muy por encima de `dateparser` (20,8%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con tres cabezas lineales de clasificación |
| Parametros totales | 278.057.490 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | FP32 (ONNX, 1,1 GB) e INT8 (ONNX, 278 MB); pesos PyTorch en FP16 |
| Idiomas soportados | Hindi (romanizado, hinglish) e inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, PyTorch), ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un encoder transformer de 278M parámetros, y le añade tres cabezas lineales sobre la representación del primer token: una cabeza de etiquetado BIO con 13 etiquetas para marcar spans temporales, una cabeza de tipo de entrada con 3 clases (`reminder`, `note`, `goal`) y una cabeza de dirección temporal con 2 clases (futuro/pasado). La extracción de spans y la clasificación se complementan con un *grounder* determinista externo (`ground.py`) que aplica las convenciones del dataset para calcular la fecha y hora finales.

El entrenamiento se realizó sobre 29.911 entradas sintéticas del dataset KalParso v3 (generadas por plantillas, con spans a nivel de carácter) más 3.300 tuits de PHINC con etiquetas débiles de tiempo verbal derivadas de sus traducciones al inglés. Se usó AdamW con learning rate 3e-5, batch de 32, 3 épocas, decaimiento lineal con 6% de warm-up, longitud máxima de 64 y una única NVIDIA T4. Ninguna entrada humana del conjunto de test está presente en los datos de entrenamiento.

## Capacidades

- Extracción de expresiones temporales en hinglish romanizado: identifica palabras y frases como *kal*, *parso*, *shaam*, *saade 5 baje*, *agle Friday*.
- Clasificación del tipo de entrada: `reminder`, `note` o `goal`.
- Determinación de la dirección temporal (futuro o pasado) a partir del tiempo verbal.
- Normalización a fecha (`YYYY-MM-DD`) y hora (`HH:MM`) exactas mediante el *grounder* determinista.
- Desambiguación contextual de términos ambiguos (*kal* = mañana/ayer) según la gramática de la frase.
- Inferencia en CPU sin PyTorch, usando solo ONNX Runtime, tokenizers y numpy.
- Salida estructurada con spans encontrados, tipo, fecha, hora y dirección.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Procesamiento de entradas de agenda en asistentes personales: el modelo convierte notas informales en hinglish ("parso shaam saade 5 baje dentist") en eventos con fecha y hora exactas, integrándose en un backend de calendario sin necesidad de GPU.
- Normalización de recordatorios en aplicaciones de productividad para usuarios indios: permite que un usuario escriba en su registro informal habitual y el sistema genere eventos estructurados con un 85,8% de precisión exacta en un solo núcleo de CPU.
- Preprocesamiento de logs o mensajes de chat para extraer referencias temporales: útil en pipelines de análisis de conversaciones donde se necesita convertir menciones relativas en timestamps absolutos antes de indexar.
- Enrutamiento de tareas en sistemas de gestión de tareas: la clasificación en `reminder`, `note` o `goal` permite dirigir automáticamente cada entrada al flujo correspondiente (notificación, archivo o planificación).
- Despliegue en dispositivos de bajos recursos o edge: con 278 MB en INT8 y 17 ms por entrada, cabe en entornos sin GPU y con presupuesto energético limitado, como routers, Raspberry Pi o portátiles antiguos.
- Componente de un sistema mayor de comprensión del lenguaje: puede actuar como módulo especializado de normalización temporal dentro de un pipeline con un LLM generalista, resolviendo el caso difícil (*kal* con pasado/futuro) que los LLM fallan con más frecuencia.
- Investigación en code-mixing y procesamiento de hinglish: sirve como baseline reproducible para tareas de extracción temporal en variedades lingüísticas mixtas, con dataset y código públicos.

## Benchmarks y rendimiento

Precisión exacta (fecha y hora correctas) sobre las 706 entradas humanas de test del dataset KalParso (`human/test`) y sobre el split de calibración de 262 entradas:

| Modelo | Test humano | Calibración | Latencia CPU (1 núcleo) |
|---|---|---|---|
| KalParso-XLM-R FP32 ONNX | 86,4% | 92,98% | 35 ms |
| KalParso-XLM-R INT8 ONNX | 85,8% | 92,2% | 17 ms |
| gemma4:26b (prompted) | 89,0% | no disponible | 10,8 s (8 núcleos) |
| gemma3:27b (prompted) | 82,3% | no disponible | no disponible |
| qwen3:32b (prompted) | 69,8% | no disponible | no disponible |
| llama3.1:8b (prompted) | 52,3% | no disponible | no disponible |
| dateparser | 20,8% | no disponible | no disponible |

La media sobre cinco semillas de entrenamiento es 85,4 ± 0,6%. La latencia indicada es la mediana en un Intel Core i7-9700 (2019) limitado a 35 W, un hilo, extremo a extremo incluyendo tokenización y *grounding*. El checkpoint publicado es la semilla 1, seleccionada por puntuación de calibración, nunca por la de test.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. La versión INT8 ONNX ocupa 278 MB en disco y se ejecuta en CPU; la FP32 requiere 1,1 GB.
- GPU recomendadas: no aplica para inferencia; el entrenamiento se realizó en una NVIDIA T4.
- Cabe en cualquier CPU consumer moderna; el benchmark se hizo en un Intel Core i7-9700 de 2019 con un solo hilo.
- Opciones de despliegue: ONNX Runtime (recomendado, sin PyTorch), con los ficheros `onnx/model.int8.onnx` o `onnx/model.onnx` y el runtime Python incluido (`kalparso.py`, `ground.py`, `lexicon.py`).
- Latencia: 17 ms por entrada (INT8, 1 núcleo) y 35 ms (FP32, 1 núcleo), extremo a extremo.
- Throughput: no disponible de forma explícita, pero a 17 ms por entrada en un solo hilo equivale a unas 58 entradas por segundo por núcleo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KalParso-XLM-R | 278M | 64 tokens | 85,8% (INT8) | MIT | Hugging Face (ONNX + safetensors) |
| KalParso-MuRIL | no disponible | no disponible | más preciso según el autor | no disponible | Hugging Face |
| KalParso-MDistil | no disponible | no disponible | menor que XLM-R según el autor | no disponible | Hugging Face |
| gemma4:26b | 26B (aprox.) | no disponible | 89,0% | no disponible | Ollama |
| dateparser (reglas) | no aplica | no aplica | 20,8% | no disponible | librería Python |

Frente a los LLM generalistas, KalParso ofrece una precisión cercana (85,8% frente a 89,0% de gemma4:26b) con tres órdenes de magnitud menos de latencia y sin GPU. Frente a `dateparser`, la mejora es de más de 60 puntos porcentuales, gracias a la desambiguación contextual del tiempo verbal que las reglas no capturan.

## Limitaciones y advertencias

- El *grounding* sigue las convenciones escritas del dataset (por ejemplo, *agle Friday* significa el viernes próximo); conviene leer `spec.md` del dataset antes de fiarse de casos límite.
- Entrenado mayoritariamente con hinglish en escritura romana; en hindi formal en devanagari el modelo MuRIL encuentra expresiones temporales zero-shot (F1 85,8 en NTX), pero el léxico del *grounder* no las cubre.
- El conjunto de test humano lo escribió un solo hablante, por lo que la precisión puede diferir con los hábitos de otros usuarios.
- Riesgo de alucinación estructural bajo (es un modelo de etiquetado, no generativo), pero puede fallar en expresiones temporales no vistas durante el entrenamiento o fuera de las convenciones del dataset.
- Longitud de contexto limitada a 64 tokens, adecuada para entradas de agenda cortas pero insuficiente para párrafos largos.
- Licencia MIT, que permite uso comercial sin restricciones adicionales conocidas; aun así, conviene verificar la licencia del modelo base `xlm-roberta-base` para el uso previsto.
- El paper está en revisión en el momento de redactar esta ficha; los resultados de benchmarks proceden de la model card y no de una publicación revisada por pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imsg8/kalparso-xlmr
- Dataset KalParso: https://huggingface.co/datasets/imsg8/kalparso
- Código, entrenamiento y evaluación: https://github.com/imsg8/kalparso
- Variante MuRIL (más precisa): https://huggingface.co/imsg8/kalparso-muril
- Variante MDistil (la más pequeña): https://huggingface.co/imsg8/kalparso-mdistil
