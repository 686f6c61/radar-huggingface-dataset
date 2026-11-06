# Miyauel/meari-accent-jeolla

## Resumen

Meari accent — Jeolla es un modelo de texto a voz (TTS) especializado en el acento regional de Jeolla (전라), una de las variantes dialectales del coreano. Lo desarrolla Miyauel como parte de Meari, un motor de síntesis de voz local con licencia MIT. El modelo no es un TTS completo, sino únicamente la etapa GPT de GPT-SoVITS v2ProPlus (`s1v3.ckpt`), afinada y exportada a ONNX para su integración en el pipeline de Meari.

El problema que aborda es concreto: los sistemas TTS generalistas en coreano producen una prosodia y fonética estandarizadas que no reflejan las variantes dialectales. Este modelo se ha afinado durante 2 épocas sobre aproximadamente 10 horas de habla en dialecto de Jeolla procedente del dataset de AI Hub, con el objetivo de que el lector de voz de Meari suene más próximo a esa variante regional.

La relevancia actual es acotada pero clara: se trata de un componente de nicho, con 0 descargas y 0 likes en el momento de la consulta, orientado a quien quiera construir un TTS coreano con acento regional dentro del ecosistema Meari. Su repo ocupa 0,2 GB y debe usarse obligatoriamente junto con `Miyauel/meari-accent-base`, que aporta la etapa de sonido y los valores de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus, etapa GPT (t2s) exportada a ONNX con caché por capa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion dinamica de 8 bits en `t2s_prefill.onnx` y `t2s_step.onnx` |
| Idiomas soportados | coreano (`ko`), con foco en el dialecto de Jeolla |
| Licencia | MIT |
| Formato de pesos | ONNX (`t2s_encoder.onnx`, `t2s_prefill.onnx`, `t2s_step.onnx`) |

## Arquitectura y entrenamiento

El modelo es la etapa GPT de GPT-SoVITS v2ProPlus, un sistema TTS de dos etapas en el que la primera (GPT, aquí representada) predice tokens semánticos a partir del texto y la segunda (SoVITS, en el paquete base) los convierte en audio. La exportación a ONNX separa el codificador de texto (`t2s_encoder.onnx`) de la etapa autorregresiva, que se divide en `t2s_prefill.onnx` y `t2s_step.onnx` con caché por capa y cuantización dinámica de 8 bits. El codificador de texto también cambia con el afinado, por lo que cada región dispone de su propio encoder.

El entrenamiento consistió en un fine-tuning de 2 épocas sobre aproximadamente 10 horas de habla en dialecto de Jeolla del dataset «중·노년층 한국어 방언 데이터 (충청도, 전라도, 제주도)» de AI Hub (aihub.or.kr), correspondiente a hablantes de mediana edad y mayores. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Los pesos de partida son los de GPT-SoVITS, con licencia MIT.

## Capacidades

- Síntesis de voz en coreano a partir de texto, dentro del pipeline GPT-SoVITS (requiere el paquete base para la etapa de sonido).
- Reproducción de rasgos prosódicos y fonéticos del dialecto de Jeolla, medidos con un clasificador de dialecto regional.
- Mejora tanto sobre texto escrito en dialecto como sobre texto en coreano estándar, según las métricas del autor.
- Exportación ONNX con cuantización de 8 bits, pensada para inferencia local.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un componente TTS, no un modelo de lenguaje conversacional.
- No dispone de modo thinking, visión ni audio de entrada; la única modalidad es texto de entrada y audio de salida.
- Capacidad multilingüe limitada al coreano; no se documentan otros idiomas.

## Casos de uso

- Lectura de textos en dialecto de Jeolla: el modelo puede narrar contenido escrito con rasgos dialectales y producir una prosodia más próxima a la variante regional que el modelo base, con una mejora medida de +17 puntos porcentuales en la clasificación como Jeolla.
- Audiolibros y contenido divulgativo regional: permite generar narraciones para materiales dirigidos a hablantes de Jeolla, usando el paquete base para la voz y este modelo para la etapa lingüística.
- Accesibilidad para personas mayores: el dataset de origen son hablantes de mediana edad y mayores, por lo que el modelo encaja en aplicaciones de lectura para ese perfil de usuario en su variante dialectal.
- Investigación en dialectología computacional: sirve como componente controlado para estudiar la percepción de acentos regionales, con métricas de clasificación por frase sobre conjuntos reservados.
- Prototipado de asistentes de voz locales: al ser ONNX con cuantización de 8 bits y licencia MIT, puede integrarse en aplicaciones de escritorio o embebidas que ejecuten Meari sin depender de servicios en la nube.
- Preservación y divulgación del patrimonio lingüístico: permite generar muestras sintéticas de habla con acento de Jeolla para materiales educativos, sin reproducir las voces de los hablantes originales del dataset.

## Benchmarks y rendimiento

El autor publica una evaluación con un clasificador de dialecto regional sobre frases reservadas, comparando el modelo base antes del fine-tuning con este modelo. La métrica es el porcentaje de frases percibidas como Jeolla.

| Leído por | Percibido como Jeolla |
|---|---|
| Grabaciones reales | 62% (40 frases) |
| Modelo base antes del fine-tuning, texto en dialecto | 19% (118 frases) |
| Este modelo, texto en dialecto | 36% (+17 puntos porcentuales; intervalo del 95%: +10 a +24) |
| Modelo base antes del fine-tuning, texto en coreano estándar | 8% |
| Este modelo, texto en coreano estándar | 15% (+7 puntos porcentuales; intervalo del 95%: +1 a +13) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de modelos de lenguaje en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 0,2 GB y los pesos están cuantizados a 8 bits, lo que sugiere un consumo reducido, pero no se documentan cifras de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamaño del repo y la cuantización, pero no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime, integrado en el motor Meari; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un componente TTS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meari accent — Jeolla | Etapa GPT de GPT-SoVITS en ONNX | Coreano (dialecto de Jeolla) | no disponible | MIT | Hugging Face, 0 descargas |
| GPT-SoVITS v2ProPlus (`s1v3.ckpt`) | TTS completo GPT-SoVITS | Coreano y otros | no disponible | MIT | Hugging Face (lj1995/GPT-SoVITS) |
| Meari accent — base | Etapa de sonido y valores de voz de Meari | Coreano | no disponible | MIT | Hugging Face (Miyauel/meari-accent-base) |

No se dispone de datos de rendimiento comparables de otros modelos TTS con acento regional coreano en la información proporcionada.

## Limitaciones y advertencias

- Solo contiene la etapa GPT: no genera audio por sí solo y requiere el paquete `Miyauel/meari-accent-base` para la etapa de sonido y los valores de voz.
- El modelo no reproduce las voces de los hablantes del dataset; la voz proviene de los valores de referencia del paquete base.
- El porcentaje de frases percibidas como Jeolla es del 36% con texto en dialecto, frente al 62% de grabaciones reales: la fidelidad al acento real sigue siendo limitada.
- Con texto en coreano estándar la mejora es menor (+7 puntos porcentuales) y el resultado percibido como Jeolla es solo del 15%.
- El fine-tuning se limita a 2 épocas sobre unas 10 horas de audio, lo que puede producir sobreajuste o escasa generalización a otros registros y hablantes.
- Riesgo de alucinación prosódica y de pronunciación inconsistente en palabras o construcciones no vistas durante el entrenamiento; no se documentan evaluaciones de inteligibilidad.
- Sesgos potenciales derivados del dataset de origen: hablantes de mediana edad y mayores, con la distribución demográfica y de género que tenga el corpus de AI Hub.
- Uso comercial permitido por la licencia MIT, pero conviene revisar las condiciones del dataset de AI Hub y la atribución a la NIA que el autor incluye en la model card.
- Sin descargas ni validación comunitaria en el momento de la consulta: no hay evidencia externa de calidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Miyauel/meari-accent-jeolla
- Paquete base: https://huggingface.co/Miyauel/meari-accent-base
- Repositorio de Meari: https://github.com/Miyauel/Meari
- Pesos originales de GPT-SoVITS: https://huggingface.co/lj1995/GPT-SoVITS
- Dataset de dialectos coreanos de AI Hub: https://aihub.or.kr
