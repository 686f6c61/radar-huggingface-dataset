# sautilm/SautiLM-Jua-STEM

## Resumen

SautiLM-Jua-STEM es un ajuste fino de tipo LoRA sobre Google Gemma 3 270M-IT, desarrollado por LosingTek Research para el proyecto SautiLM en Bunia (Ituri, República Democrática del Congo). El modelo está diseñado como un asistente educativo de nivel secundaria y para el Examen de Estado de la RDC, cubriendo matematicas, fisica, quimica y biologia, con un reparto linguistico declarado de 60% frances y 40% ingles. Se distribuye compilado en formato `.litertlm` (LiteRT-LM) con un tamano de bundle de 272,36 MB, pensado para ejecutarse de forma 100% offline en telefonos Android.

La propuesta central es la soberania tecnologica y el despliegue en el borde: el modelo no requiere conexion a internet y funciona sobre hardware movil modesto (Android 8.0+, 2 GB de RAM, CPU ARM Cortex-A53/A55). El ajuste se realizo con SFT supervisado con enmascaramiento de perdida solo en la respuesta, sobre un corpus declarado de 750 instrucciones verificadas sin filtraciones, con LoRA de rango 32 y alpha 64 durante 230 pasos, alcanzando una perdida final de 0,0548.

Es relevante por su enfoque en un nicho poco cubierto: educacion STEM en frances e ingles para la RDC, con empaquetado nativo para inferencia en dispositivo mediante LiteRT-LM y Flutter. El modelo base, Gemma 3 270M, es un transformer causal de 18 capas con `hidden_size=640` y longitud de cache de 2048, por lo que sus capacidades absolutas son limitadas y deben evaluarse en ese contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Gemma3ForCausalLM), 18 capas, hidden_size=640, cache_length=2048 |
| Parametros totales | Aproximadamente 270M (modelo base Gemma 3 270M-IT) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (cache_length declarado) |
| Tipos de cuantizacion | Exportacion `dynamic_wi8_afp32` via `litert-torch` (TFLite FlatBuffer prefill/decode) |
| Idiomas soportados | Frances, ingles, suajili (fr, en, sw) |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | `.litertlm` (LiteRT-LM); tokenizer de Hugging Face; base en safetensors via Gemma 3 |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 270M-IT, un transformer causal decoder-only de 18 capas con dimension oculta de 640 y ventana de cache de 2048 tokens. Sobre esta base se aplico un ajuste fino supervisado (SFT) con LoRA de rango 32 y alpha 64, usando enmascaramiento de perdida solo sobre la respuesta (response-only loss masking) para concentrar el aprendizaje en las salidas del asistente. El entrenamiento se realizo durante 230 pasos sobre 750 instrucciones verificadas y sin filtraciones, con una perdida final reportada de 0,0548.

Tras el ajuste, el modelo se compilo con `litert-torch` de Google en el esquema `dynamic_wi8_afp32`, generando un contenedor TFLite FlatBuffer con rutas separadas de prefill y decode, mas el tokenizer de Hugging Face, todo empaquetado en un unico fichero `.litertlm` de 272,36 MB. El autor declara una verificacion en tiempo de ejecucion mediante LiteRT-LM Runtime con resultado 10/10. No se especifica la composicion completa del corpus de entrenamiento ni si hubo etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Generacion de texto en frances e ingles orientada a contenido STEM de secundaria (matematicas, fisica, quimica, biologia).
- Resolucion de ejercicios y explicaciones de conceptos para preparacion del Examen de Estado de la RDC.
- Soporte declarado de suajili entre los idiomas del modelo, aunque el foco del ajuste es frances e ingles.
- Ejecucion 100% offline en dispositivo, sin dependencia de red.
- Integracion con Flutter mediante `flutter_edge_ai` y `flutter_edge_ai_litertlm`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en esta variante STEM.
- No se documenta modo de razonamiento extendido (thinking mode).

## Casos de uso

- Tutoria STEM offline en aulas sin conectividad: el modelo puede responder dudas de matematicas, fisica, quimica y biologia en frances e ingles directamente en un telefono Android, sin coste de red ni dependencia de servidores externos.
- Preparacion del Examen de Estado de la RDC: uso como banco de ejercicios y explicaciones guiadas para estudiantes de secundaria, aprovechando el ajuste especifico sobre el curriculo declarado.
- Aplicacion movil educativa con Flutter: integracion mediante `flutter_edge_ai_litertlm` para empaquetar el asistente dentro de una app Android distribuible en zonas con conectividad intermitente.
- Refuerzo escolar en contextos rurales: despliegue en dispositivos de gama baja (Android 8.0+, 2 GB de RAM) donde no es viable ejecutar modelos de mayor tamano.
- Apoyo a docentes en la generacion de material de practica: produccion de enunciados y soluciones de ejercicios STEM a partir de indicaciones breves, con la ventaja de funcionar sin cuotas de API.
- Despliegue como componente de una suite modular SautiLM: el modelo STEM puede convivir con otras variantes del ecosistema (Lex, Med, Agri, Ius, Fin, Civ) en una misma aplicacion de asistencia comunitaria.
- Prototipado de asistentes educativos en entornos con requisitos de privacidad: al ejecutarse en el dispositivo, los datos del estudiante no salen del terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento (perdida final 0,0548 tras 230 pasos) y una verificacion de ejecucion en LiteRT-LM Runtime (10/10), sin resultados en MMLU, HumanEval, GSM8K ni conjuntos equivalentes.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle ocupa 272,36 MB; el autor indica un minimo de 2 GB de RAM en el dispositivo.
- Hardware minimo declarado: Android 8.0+ (API 26+), CPU ARM Cortex-A53/A55 o GPU movil.
- GPU de escritorio: no se documentan requisitos para A100, H100 o RTX 4090; el modelo esta empaquetado para inferencia en dispositivo, no para servidor.
- Compatibilidad con GPU de consumo: no aplica en el formato `.litertlm`; el modelo base Gemma 3 270M podria ejecutarse en GPUs de consumo en otros formatos, pero no se documenta para esta variante.
- Opciones de despliegue: LiteRT-LM Runtime y Flutter (`flutter_edge_ai`, `flutter_edge_ai_litertlm`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este bundle.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| SautiLM-Jua-STEM | ~270M | 2048 | fr, en, sw | Gemma | `.litertlm` (LiteRT-LM, Android) |
| Google Gemma 3 270M-IT (base) | ~270M | 2048 (cache declarado) | Multilingue (segun Gemma) | Gemma | safetensors, GGUF y otros |
| SautiLM-Jua (foundation del mismo autor) | ~270M (base Gemma 3) | 2048 | fr, en, sw | Gemma | `.litertlm` |

La comparativa se limita al modelo base y a la variante fundacional del mismo proyecto, ya que no se dispone de datos de rendimiento publicados que permitan contrastar con alternativas de la misma categoria. No disponible para comparaciones cuantitativas con otros modelos.

## Limitaciones y advertencias

- El modelo base es de 270M de parametros, por lo que su capacidad de razonamiento, coherencia en respuestas largas y precision factual es estructuralmente limitada.
- Riesgo elevado de alucinacion en contenido STEM (formulas, resultados numericos, definiciones), especialmente fuera del dominio de las 750 instrucciones de entrenamiento.
- El corpus de ajuste es muy reducido (750 instrucciones, 230 pasos), lo que restringe la generalizacion y puede provocar sobreajuste al estilo y formato de esas muestras.
- El soporte de suajili esta declarado en las etiquetas, pero el ajuste se centra en frances e ingles; el rendimiento real en suajili no esta verificado publicamente.
- Ventana de contexto de 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- La licencia Gemma impone condiciones de uso (incluidas restricciones y obligaciones de atribucion) que deben revisarse antes de un uso comercial.
- El formato `.litertlm` esta orientado a LiteRT-LM y Flutter; no hay garantia de compatibilidad con otros runtimes sin reconversion.
- No se han publicado evaluaciones independientes de sesgos, toxicidad o calidad; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion externa conocida.
- La model card declara otras variantes del ecosistema con estados incompletos (por ejemplo, Lex con 0 entradas de diccionario verificadas), lo que sugiere que el proyecto esta en fase temprana.

## Enlaces

- Hugging Face: https://huggingface.co/sautilm/SautiLM-Jua-STEM
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Sitio del proyecto: https://sautilm.com
- LosingTek: https://losingtek.com
