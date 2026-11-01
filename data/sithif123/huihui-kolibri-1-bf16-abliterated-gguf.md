# Sithif123/Huihui-Kolibri-1-BF16-abliterated-GGUF

## Resumen

Huihui-Kolibri-1-BF16-abliterated-GGUF es una versión "abliterated" (sin filtros de seguridad) del modelo Kolibri-1-BF16 de Aleph-Alpha, publicada por el usuario Sithif123 en Hugging Face y basada en el trabajo de abliteración de Huihui-ai. Kolibri-1 es un modelo de generación de texto con arquitectura mixture-of-experts (MoE) orientado al alemán y al inglés, con capacidades de razonamiento. La abliteración se ha realizado íntegramente sobre ficheros GGUF mediante la herramienta cvector-generator de llama.cpp, sin depender de Transformers, eliminando el comportamiento de rechazo del modelo original.

La relevancia de esta ficha radica en que ofrece el modelo en formato GGUF con cuantizaciones desde Q2 hasta BF16, lo que permite ejecutarlo localmente con llama.cpp. Es importante señalar que la arquitectura `kolibri1` aún no está soportada por llama.cpp de serie: es necesario aplicar un parche incluido en el repositorio sobre el commit `836d571` del upstream. Al tratarse de un modelo sin filtros, su uso recomendado es la investigación y experimentación en entornos controlados, no producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura `kolibri1`) |
| Parametros totales | 78.103.074.560 (~78 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256 K, segun comando de ejemplo del README) |
| Tipos de cuantizacion | Q2, Q3, Q4, Q5, Q6, Q8, BF16 (GGUF) |
| Idiomas soportados | Aleman, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors BF16 del modelo base) |

## Arquitectura y entrenamiento

Kolibri-1-BF16 es un modelo transformer con arquitectura mixture-of-experts (MoE) de aproximadamente 78 mil millones de parametros totales, desarrollado por Aleph-Alpha. El README no detalla el numero de expertos, los parametros activos por token ni los datos de entrenamiento del modelo base. El modelo base esta etiquetado con capacidades de razonamiento ("reasoning") y soporte para aleman e ingles.

Sobre el modelo base se aplico un proceso de abliteracion: una tecnica que identifica y neutraliza las direcciones de activacion responsables de los rechazos del modelo, eliminando su alineamiento de seguridad sin reentrenamiento. En este caso, la abliteracion se realizo directamente sobre GGUF con la herramienta cvector-generator de llama.cpp. Un detalle tecnico relevante: la abliteracion no modifico todos los modulos de experto, por lo que el efecto de desalineacion puede no ser uniforme en todas las consultas. Los GGUF de origen provienen del repositorio Hob-forge/Kolibri-1-GGUF y fueron re-cuantizados con llama.cpp.

## Capacidades

- Generacion de texto conversacional en aleman e ingles (pipeline text-generation, etiqueta "conversational").
- Razonamiento: el modelo base esta etiquetado con la capacidad "reasoning", aunque el README no documenta un modo de pensamiento explicito (thinking mode).
- No se ha documentado soporte de vision, audio ni multimodalidad.
- No se ha documentado soporte de tool calling / function calling.
- No se ha documentado soporte especifico de agentes o razonamiento multi-paso.
- Compatibilidad con vLLM (libreria declarada en el repositorio) y con llama.cpp mediante parche.
- Al estar abliterated, responde a consultas que el modelo base rechazaria, sin garantias de seguridad.

## Casos de uso

- Investigacion en seguridad y alineamiento: al eliminar los filtros mediante abliteracion, el modelo sirve para estudiar comportamientos no alineados, red-teaming y evaluacion de robustez de mecanismos de seguridad en arquitecturas MoE.
- Investigacion sobre abliteracion en GGUF: el flujo de trabajo con cvector-generator y el parche de llama.cpp es un caso de estudio practico para aplicar esta tecnica sin depender de Transformers.
- Ejecucion local con maxima privacidad: al ser GGUF cuantizado (hasta Q2), permite desplegar un modelo de 78 B en hardware local sin enviar datos a servicios externos, util en entornos con requisitos de confidencialidad.
- Asistente conversacional en aleman e ingles: el modelo base esta optimizado para ambos idiomas, adecuado para chatbots experimentales de usuario unico en entornos controlados.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o material que los modelos alineados rechazarian, siempre bajo responsabilidad del usuario y en marcos legales.
- Pruebas de contexto largo: con 262.144 tokens de ventana, permite experimentar con documentos extensos (analisis de corpora largos en aleman o ingles) en escenarios de investigacion.
- Benchmarking de inferencia MoE: comparacion del rendimiento de distintas cuantizaciones (Q2 a BF16) en vLLM y llama.cpp sobre una arquitectura MoE poco comun.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, con 78 B de parametros totales, una cuantizacion Q4 ocupa del orden de 45-50 GB y BF16 en torno a 150-160 GB; el repo completo pesa 472,9 GB.
- GPU recomendadas: para cuantizaciones medias, una RTX 4090 (24 GB) no basta por si sola; se requieren configuraciones multi-GPU (por ejemplo, 2-3 RTX 4090 en Q2/Q3, o A100/H100 de 80 GB en Q4/Q5). BF16 requiere multiples A100/H100 o offload a RAM/CPU.
- Consumer GPU: no cabe integramente en una sola GPU de consumo en cuantizaciones altas; en Q2/Q3 puede repartirse entre varias RTX 3090/4090 o combinarse con offload a CPU mediante llama.cpp.
- Despliegue: llama.cpp es el camino principal, pero exige aplicar el parche `kolibri1-llama.cpp.patch` incluido en el repo sobre el commit `836d571` y compilar manualmente (con `-DGGML_CUDA=ON` para GPU NVIDIA). El repositorio declara compatibilidad con vLLM como libreria. No se menciona soporte en Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Kolibri-1-BF16-abliterated | ~78 B (totales) | MoE | 256 K | Apache 2.0 | GGUF, requiere parche de llama.cpp |
| Mixtral 8x22B (Mistral AI) | 141 B (39 B activos) | MoE | 64 K | Apache 2.0 | Amplio soporte (llama.cpp, vLLM, Ollama) |
| Qwen3-30B-A3B | 30 B (3,3 B activos) | MoE | 32 K-128 K | Apache 2.0 | GGUF, vLLM, Ollama, soporte nativo |
| Kolibri-1-BF16 (base, Aleph-Alpha) | ~78 B | MoE | no disponible | Apache 2.0 | safetensors, con filtros de seguridad |

Nota: la comparacion es orientativa; Kolibri-1 es una arquitectura poco estandar (`kolibri1`) con ecosistema de inferencia muy limitado frente a alternativas como Mixtral o Qwen3, que cuentan con soporte nativo en las principales herramientas.

## Limitaciones y advertencias

- Riesgo elevado de contenidos sensibles, controvertidos o inapropiados: la abliteracion reduce significativamente los filtros de seguridad del modelo. Los autores recomiendan uso en investigacion, pruebas o entornos controlados, no en produccion ni aplicaciones publicas.
- La abliteracion no modifico todos los modulos de experto, por lo que el comportamiento sin filtros puede ser inconsistente: el modelo podria rechazar algunas peticiones y aceptar otras similares.
- Soporte de inferencia limitado: llama.cpp necesita un parche manual sobre un commit concreto; sin el, el modelo no funciona. Verificar el estado del soporte de vLLM antes de desplegar.
- Idiomas limitados a aleman e ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Datos de entrenamiento, parametros activos y benchmarks no publicados: dificil evaluar calidad objetiva frente a modelos comparables.
- Riesgo de alucinacion tipico de LLM, agravado por la ausencia de optimizaciones de seguridad y alineacion rigurosas en esta variante.
- Responsabilidad legal y etica del uso recae completamente en el usuario; los creadores declinan cualquier responsabilidad por las consecuencias del uso del modelo.
- Requisitos hardware elevados por los 78 B de parametros, incluso en cuantizaciones bajas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Sithif123/Huihui-Kolibri-1-BF16-abliterated-GGUF
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- GGUF de origen: https://huggingface.co/Hob-forge/Kolibri-1-GGUF
- Metodo de abliteracion (cvector-generator de llama.cpp): https://github.com/ggml-org/llama.cpp/blob/master/tools/cvector-generator/README.md
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Soporte/donaciones de Huihui-ai: https://ko-fi.com/huihuiai
