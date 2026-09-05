# litert-community/Cardiac_micro_model_Android_Wear

## Resumen

MedGemma-Micro es un modelo multimodal ultracompacto desarrollado por la comunidad LiteRT para el diagnóstico y la gestión de enfermedades cardíacas en dispositivos wearables con Wear OS 4+. Está destilado del modelo `google/medgemma-1.5-4b-it`, un LLM médico de 4 mil millones de parámetros, y comprimido en un presupuesto estricto de menos de 500 MB serializados. El modelo combina un extractor de señales de fotopletismografía (PPG) basado en una CNN 1D y una BiLSTM de aproximadamente 1,4 millones de parámetros, con un modelo de lenguaje destilado de tipo SmolLM2-360M-Instruct de unos 360 millones de parámetros. Un puente MLP de soft prompts fusiona ambas modalidades para permitir razonamiento clínico y recomendaciones de estilo de vida en tiempo real.

El problema que resuelve es la necesidad de ejecutar análisis cardíaco avanzado y asistencia conversacional directamente en un reloj inteligente, sin depender de la nube. Su relevancia actual radica en la creciente adopción de la IA en el edge para salud preventiva, combinando señales fisiológicas continuas con lenguaje natural para ofrecer una experiencia de usuario integral. El modelo soporta cinco condiciones cardíacas (ritmo sinusal normal, fibrilación auricular, bradicardia, taquicardia y contracciones ventriculares prematuras) y genera recomendaciones sobre nutrición, ejercicio, sueño y estrés, todo bajo un marco de seguridad con avisos médicos obligatorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 1D-CNN + BiLSTM (PPG) + LLM destilado SmolLM2-360M-Instruct con puente MLP de soft prompts |
| Parametros totales | Aproximadamente 361,4 millones (1,4 M extractor PPG + 360 M LLM) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (lineales) y FP16 (normalizaciones) en el LLM; pesos del extractor en FP16/INT8 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | .safetensors (395,16 MB serializado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura multimodal de dos ramas. La primera rama procesa ventanas continuas de PPG de 90 segundos a 25–50 Hz mediante una CNN 1D de cuatro etapas con GroupNorm, GELU y MaxPool, que reduce temporalmente la señal de 2250 muestras a 71 tokens. Esta representación pasa por una BiLSTM de dos capas con 128 unidades por dirección (256 en total) que modela la dinámica del ritmo y la variabilidad de la frecuencia cardíaca. De esta salida se derivan dos cabezas: una de clasificación multitarea lineal de 5 clases para las condiciones cardíacas, y un proyector MLP que genera 4 tokens de soft prompt de dimensión 960. Estos prompts se inyectan en el modelo de lenguaje destilado SmolLM2-360M-Instruct, que actúa como backbone generativo.

El entrenamiento utiliza destilación de conocimiento desde el profesor `google/medgemma-1.5-4b-it`, cuantizado en 4-bit NF4 mediante `BitsAndBytesConfig`. El modelo resultante se serializa en formato `.safetensors` con un peso de 395,16 MB, cumpliendo el presupuesto de 500 MB. El pipeline incluye una capa de seguridad determinista mediante expresiones regulares que fuerza un descargo de responsabilidad médico antes de cualquier recomendación de prescripción. La información sobre el dataset de entrenamiento, el número de tokens y el uso de RLHF o DPO no está disponible en la documentación proporcionada.

## Capacidades

- Clasificación multimodal de señales PPG: identifica cinco condiciones cardíacas (ritmo sinusal normal, fibrilación auricular, bradicardia, taquicardia y contracciones ventriculares prematuras) a partir de 90 segundos de señal continua.
- Generación de texto de razonamiento clínico y gestión de estilo de vida: el componente de lenguaje produce explicaciones y recomendaciones sobre nutrición (límite de sodio < 1500 mg/día, potasio 3500–4700 mg, magnesio), ejercicio (zonas de frecuencia cardíaca objetivo), sueño (apnea y dipping nocturno) y manejo del estrés y resonancia vagal.
- Fusión sensor-lenguaje: el puente MLP de soft prompts permite que la información fisiológica condicione la generación de texto, habilitando respuestas contextualizadas al estado del paciente.
- Salvaguardas de seguridad: incluye alineación del modelo y un filtro determinista por regex que antepone un aviso médico y una renuncia de responsabilidad antes de cualquier recomendación de prescripción.
- Despliegue en edge: optimizado para Android Wear OS 4+ mediante LiteRT/ExecuTorch y PyTorch Mobile, con un peso final inferior a 500 MB.
- Compatibilidad con Colab: el modelo puede ejecutarse en GPUs T4, V100 o A100 en el entorno gratuito de Colab, según la documentación del autor.

## Casos de uso

- Monitorización continua de arritmias en smartwatch: el modelo analiza ventanas de PPG en tiempo real en un reloj Wear OS y alerta al usuario ante episodios de fibrilación auricular o taquicardia, sin necesidad de conexión a internet. Su tamaño compacto permite ejecutarlo localmente con latencia baja.
- Asistente de autocuidado cardíaco: el usuario puede conversar con el modelo sobre sus síntomas y recibir recomendaciones personalizadas de estilo de vida, como ajustes de dieta baja en sodio o pautas de ejercicio según su zona de frecuencia cardíaca, siempre acompañadas de un aviso médico.
- Telemedicina de apoyo: un profesional sanitario podría usar el modelo como herramienta de triaje preliminar en un dispositivo móvil, combinando la lectura de PPG del paciente con preguntas en lenguaje natural para generar un resumen de riesgo antes de una consulta.
- Coaching de rehabilitación cardíaca: el modelo guía al paciente durante sesiones de ejercicio, monitorizando la señal PPG y proporcionando retroalimentación en tiempo real sobre la intensidad y posibles anomalías, adaptando las recomendaciones a las condiciones detectadas.
- Gestión de hipertensión y nutrición: gracias a sus capacidades de razonamiento sobre dieta DASH, el modelo puede sugerir menús y hábitos alimenticios, recordando límites de sodio y potasio, y explicando el impacto en la salud cardiovascular.
- Educación del paciente en el domicilio: el modelo puede responder preguntas frecuentes sobre medicación, signos de alerta y manejo del estrés, actuando como un recurso educativo accesible en un reloj inteligente para pacientes con enfermedades crónicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo está diseñado para ejecutarse en dispositivos edge con menos de 500 MB de peso serializado, por lo que la memoria requerida en un smartwatch es reducida, pero no se especifica el consumo de VRAM en servidores.
- GPU recomendadas: según la documentación del autor, el modelo es compatible con GPUs T4, V100 y A100 en el entorno gratuito de Colab. No se especifican requisitos mínimos para despliegue en servidor.
- Cabe en GPU de consumo: no disponible. Dado su tamaño de 395 MB, es plausible que quepa en GPUs de consumo como la RTX 4090, pero no hay datos concretos en la información proporcionada.
- Opciones de despliegue: LiteRT (CompiledModel API e Interpreter API) en Android, ExecuTorch, PyTorch Mobile, y ejecución en Colab con T4/V100/A100. También es compatible con el entorno de desarrollo de Google AI Edge.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGemma-Micro | ~361 M | No disponible | PPG + texto | Apache-2.0 | HuggingFace (litert-community) |
| google/medgemma-1.5-4b-it (profesor) | 4 B | No disponible | Texto (multimodal según variante) | No disponible | HuggingFace |
| SmolLM2-360M-Instruct (backbone destilado) | 360 M | No disponible | Texto | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información proporcionada. Dado que el modelo está entrenado principalmente con datos en inglés, puede presentar sesgos lingüísticos y culturales.
- Riesgo de alucinación: al ser un modelo de lenguaje pequeño (360 M) destilado, existe riesgo de generar información clínicamente incorrecta o incompleta. Las respuestas deben ser siempre verificadas por un profesional sanitario.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que puede limitar conversaciones largas o el procesamiento de historiales extensos.
- Limitaciones de idioma: el modelo solo soporta inglés, lo que restringe su uso en poblaciones hispanohablantes.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo no está validado como dispositivo médico y no debe utilizarse para diagnóstico o tratamiento sin supervisión clínica.
- Caveats para producción: el modelo incorpora un descargo de responsabilidad obligatorio, pero esto no sustituye la validación regulatoria. La precisión de la clasificación de señales PPG puede variar en condiciones de movimiento o mala calidad de señal.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/Cardiac_micro_model_Android_Wear
- LiteRT en Android (documentación oficial): https://developer.android.com/ai/custom
- LiteRT para Android (Google AI Edge): https://developers.google.com/edge/litert/android
- Modelo base en HuggingFace (referencia): https://huggingface.co/google/medgemma-1.5-4b-it
