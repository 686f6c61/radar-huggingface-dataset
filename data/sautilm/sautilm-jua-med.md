# sautilm/SautiLM-Jua-Med

## Resumen

SautiLM-Jua-Med es un modelo de generacion de texto derivado de Google Gemma 3 (variante `270M-IT`) mediante un ajuste fino supervisado con LoRA y exportado al formato nativo `.litertlm` para ejecucion en dispositivos Android. Lo desarrolla el equipo SautiLM / LosingTek Research desde Bunia (Ituri, Republica Democratica del Congo) y esta orientado a salud publica comunitaria y protocolos medicos basicos en entornos sin conectividad.

El modelo forma parte de una familia modular (SautiLM-Jua) que separa especialidades por dominio (STEM, lexicografia, agronomia, derecho congoleno, finanzas cooperativas, etc.). Esta variante concreta se integra con el socio AfyaSpeak y esta pensada para ejecutarse 100% offline en telefonos Android de gama baja, con un requisito minimo de 2 GB de RAM y CPU ARM Cortex-A53/A55.

Su relevancia reside en el enfoque de despliegue: un bundle de 272,36 MB que corre de forma nativa sin internet, con arquitectura heredada de Gemma 3 (18 capas, `hidden_size=640`, contexto de 2048 tokens) y un corpus de ajuste muy reducido (100 instrucciones verificadas). Es un modelo de nicho, con capacidades limitadas por su tamano y por el escaso volumen de entrenamiento, pero representativo de la IA de borde para contextos con infraestructura restringida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, `Gemma3ForCausalLM`; 18 capas, `hidden_size=640`) |
| Parametros totales | ~270M (heredados de `google/gemma-3-270m-it`; el autor no desglosa el conteo exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (`cache_length=2048`) |
| Tipos de cuantizacion | Exportacion `litert-torch` con esquema `dynamic_wi8_afp32` (pesos int8 dinamicos, activaciones fp32); no se listan otras variantes |
| Idiomas soportados | fr, en, sw |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | `.litertlm` (TFLite FlatBuffer prefill/decode + tokenizer HF); repo tambien contiene safetensors |
| Tamano del bundle | 272,36 MB (`sautilm-jua-med.litertlm`) |
| Tamano del repo | 0,3 GB |
| Libreria | `litert-lm` |
| Hardware minimo | Android 8.0+ (API 26+), 2 GB RAM, ARM Cortex-A53/A55 o GPU movil |
| Runtime objetivo | Flutter (`flutter_edge_ai` + `flutter_edge_ai_litertlm`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 en su variante pequena: transformer decoder-only con 18 capas, dimension oculta de 640 y ventana de contexto de 2048 tokens. Sobre esa base se aplico un ajuste fino supervisado con LoRA de rango 32 y alpha 64, con enmascaramiento de perdida limitado a la respuesta (response-only loss masking). El entrenamiento consistio en 125 pasos sobre un corpus de 100 instrucciones verificadas "zero-leakage", alcanzando una perdida final de 0,0035. No se documentan fases de RLHF ni DPO.

La innovacion tecnica principal no esta en el entrenamiento sino en el empaquetado: la compilacion con `litert-torch` bajo el esquema `dynamic_wi8_afp32` produce un contenedor `.litertlm` con grafos TFLite separados para prefill y decode, mas el tokenizer de Hugging Face, ejecutable de forma nativa en Android mediante LiteRT-LM. El autor reporta una verificacion de runtime de 8/8 casos superados. No se especifican la composicion exacta del dataset, el numero total de tokens vistos ni la procedencia de las 100 instrucciones.

## Capacidades

- Generacion de texto en frances, ingles y suajili, con foco declarado en salud publica comunitaria y protocolos medicos.
- Ejecucion 100% offline en Android, sin dependencia de red.
- Inferencia en CPU ARM (Cortex-A53/A55) o GPU movil mediante LiteRT-LM.
- Integracion con Flutter a traves de `flutter_edge_ai` y `flutter_edge_ai_litertlm`.
- Capacidad multilingue limitada a los tres idiomas declarados; no se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.
- No se declaran capacidades de vision, audio ni thinking mode para esta variante (la vision se reserva a otro modelo de la familia, SautiLM-Nuru).

## Casos de uso

- Triage comunitario offline: el modelo puede responder consultas iniciales de salud en frances o suajili desde un telefono Android sin conexion, apoyando a agentes comunitarios en zonas rurales donde no hay red.
- Consulta de protocolos medicos basicos: con 2048 tokens de contexto, sirve para recuperar y reformular procedimientos estandarizados (por ejemplo, higiene, primeros auxilios, derivacion) integrados en una app movil.
- Integracion con AfyaSpeak: el socio declarado puede desplegar el bundle `.litertlm` dentro de su aplicacion de salud para ofrecer respuestas locales sin enviar datos a la nube.
- Asistencia en idiomas locales: al cubrir suajili y frances, resulta util en contextos del este de la RDC donde el acceso a modelos multilingues grandes no es viable por ancho de banda.
- Prototipado rapido de asistentes de borde: desarrolladores que quieran validar flujos de IA offline en Flutter pueden usar el modelo como base con el runtime LiteRT-LM.
- Formacion y demostraciones: por su tamano (272 MB) y su baja huella de memoria, es adecuado para talleres y demos en dispositivos de gama baja sin infraestructura de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una verificacion de runtime de 8/8 casos y una perdida final de entrenamiento de 0,0035, sin metricas estandar (MMLU, HumanEval, GSM8K u otras) ni comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM/RAM estimada: minimo 2 GB de RAM en dispositivo Android segun el autor; el bundle ocupa 272,36 MB, por lo que la huella en memoria es reducida pero no se detalla el consumo pico.
- GPU recomendadas: no aplica el paradigma de datacenter; el objetivo son CPU ARM Cortex-A53/A55 o GPU moviles integradas.
- Cabe en GPU de consumo: si, en el sentido de que esta disenado para telefonos Android; no se documenta ejecucion en GPUs de escritorio (RTX, A100, H100).
- Opciones de despliegue: LiteRT-LM (runtime nativo) y Flutter mediante `flutter_edge_ai` + `flutter_edge_ai_litertlm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| SautiLM-Jua-Med | ~270M | 2048 | fr, en, sw | gemma | `.litertlm` (LiteRT-LM, Android) |
| google/gemma-3-270m-it (base) | ~270M | 2048 (segun arquitectura heredada) | multilingue (segun Gemma 3) | gemma | safetensors, GGUF y otros segun ecosistema |
| SautiLM-Jua (foundation de la familia) | ~270M (misma base) | 2048 | fr, en, sw | gemma | `.litertlm` |

La comparacion cuantitativa de rendimiento no esta disponible: no se han publicado benchmarks del modelo ni de sus variantes hermanas en la informacion consultada. La diferencia principal frente a la base Gemma 3-270M-IT es el ajuste fino con 100 instrucciones y el empaquetado para Android offline.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (100 instrucciones, 125 pasos): el ajuste fino puede provocar sobreajuste y degradar capacidades generales de la base.
- Riesgo elevado de alucinacion en un dominio sensible como la salud; no debe usarse como sustituto de criterio medico profesional.
- Contexto limitado a 2048 tokens, insuficiente para historiales clinicos extensos o documentos largos.
- Cobertura linguistica restringida a frances, ingles y suajili; no se declara soporte de lenguas locales como el kilendu (bbadha) en esta variante.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google para Gemma, que incluyen restricciones de uso aceptable y obligaciones de atribucion.
- Sin datos publicos de benchmarks, evaluaciones de seguridad ni tasas de error; no recomendable en produccion sin validacion propia.
- Dependencia de un runtime especifico (LiteRT-LM) y del ecosistema Flutter; la portabilidad a otros entornos no esta documentada.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sautilm/SautiLM-Jua-Med
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Sitio web de SautiLM: https://sautilm.com
- LosingTek: https://losingtek.com
