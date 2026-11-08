# mradermacher/LFM3-1.7B-heretic-i1-GGUF

## Resumen

LFM3-1.7B-heretic-i1-GGUF es una colección de cuantizaciones GGUF del modelo saidutta69/LFM3-1.7B-heretic, publicada por mradermacher. El modelo base es una variante "abliterated" (también descrita como heretic, uncensored o decensored) de LFM3-1.7B, el modelo compacto de la familia Liquid Foundation Models de Liquid AI orientado a despliegue en el borde (edge) y en dispositivo. La cuantización la realiza mradermacher, un publicador habitual de GGUF, e incluye tanto cuantizaciones estáticas como ponderadas con imatrix.

El interés de esta ficha reside en dos factores. Por un lado, el tamaño: 1.728.801.600 parámetros en safetensors, lo que permite ejecución en hardware muy modesto incluso en cuantizaciones de 4 bits de aproximadamente 1,2 GB. Por otro, la modificación heretic, que elimina los mecanismos de rechazo del modelo original, algo relevante para entornos de investigación y para casos donde las negativas del modelo base resultan un obstáculo, pero con implicaciones legales y de seguridad que conviene evaluar antes de usarlo en producción.

La licencia es lfm1.0 (Liquid AI), heredada del modelo base, y los pesos se distribuyen únicamente en formato GGUF. El modelo soporta 16 idiomas declarados y está etiquetado para uso agéntico y tool calling, lo que lo sitúa en la categoría de modelos pequeños para asistentes locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; etiquetado como hybrid-architecture en repos relacionados) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (i1, ponderadas con imatrix) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (Liquid AI) |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Las etiquetas del repositorio indican que LFM3 pertenece a la familia Liquid Foundation Models de Liquid AI, orientada a despliegue en el borde, y repositorios relacionados la etiquetan como "hybrid-architecture", término que Liquid AI emplea para arquitecturas que combinan capas de atención con componentes de estado recurrente. No obstante, no se confirma en la información disponible la composición exacta de capas, el número de tokens de entrenamiento ni la composición del dataset.

Sobre el proceso de modificación: el modelo saidutta69/LFM3-1.7B-heretic es una variante abliterated del LFM3-1.7B original. La técnica de abliteration elimina direcciones de activación asociadas al rechazo, de modo que el modelo deja de negarse a responder ante ciertas peticiones. No se documenta en la información disponible el método exacto aplicado (cálculo de direcciones de rechazo, capas intervenidas, si hubo fine-tuning posterior), ni si se realizó RLHF o DPO adicional. Las cuantizaciones de mradermacher se generan con llama.cpp, usando pesos ponderados con un fichero imatrix incluido en el repositorio, y no implican reentrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta "conversational" en el repositorio.
- Tool calling y function calling, según las etiquetas "tool-calling" y "agentic" del modelo.
- Uso en flujos agénticos de varios pasos, orientado a asistentes locales.
- Capacidades multilingües en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Comportamiento sin rechazo (uncensored/abliterated): el modelo no aplica las negativas del modelo base ante contenido sensible.
- Razonamiento y roleplay, según las etiquetas de repositorios relacionados de la misma familia.
- Ejecución en dispositivo (edge, on-device) gracias a su tamaño reducido.

## Casos de uso

- Asistentes locales en dispositivos de gama baja: con cuantización Q4_K_M (aproximadamente 1,2 GB), el modelo puede ejecutarse en un portátil sin GPU dedicada o en una Raspberry Pi con suficiente RAM, gestionando conversaciones de asistente personal sin conexión.
- Investigación sobre alineación y seguridad: la variante heretic permite estudiar el comportamiento de un modelo sin mecanismos de rechazo y compararlo con el LFM3-1.7B original, útil para analizar direcciones de activación y sesgos de negativa.
- Generación de texto creativo sin restricciones: escritura de ficción, guiones o roleplay donde las negativas del modelo base interrumpen el flujo, ejecutado localmente para preservar la privacidad del contenido.
- Prototipado de agentes con tool calling: al estar etiquetado para uso agéntico, sirve para validar pipelines de llamadas a funciones en local antes de migrar a un modelo mayor, con un coste de infraestructura mínimo.
- Procesamiento multilingüe en el borde: clasificación, resumen o extracción de información en los 16 idiomas soportados dentro de aplicaciones móviles o embebidas, sin depender de APIs externas.
- Evaluación de cuantizaciones: el repositorio incluye 25 variantes desde IQ1_S (0,6 GB) hasta Q6_K (1,5 GB), lo que permite medir el impacto de la cuantización en la calidad para un modelo de 1,7B en hardware concreto.
- Filtrado y moderación de contenido en investigación: usar el modelo como generador de casos límite para probar sistemas de moderación propios, dado que no aplica rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos, y la búsqueda web no aporta datos de evaluación del modelo base ni de la variante heretic.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: IQ1_S e IQ1_M en torno a 0,6 GB; IQ2_* entre 0,7 y 0,8 GB; IQ3_* y Q3_K_* entre 0,8 y 1,1 GB; IQ4_XS, IQ4_NL y Q4_K_* entre 1,1 y 1,2 GB; Q5_K_* entre 1,3 y 1,4 GB; Q6_K en torno a 1,5 GB. Hay que sumar el espacio para el contexto KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM efectiva para cuantizaciones de 4 bits, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores. Para Q6_K, una GPU de 4 GB o más es suficiente.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas tarjetas de gama de entrada y iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta endpoints_compatible. No se indica soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-heretic-i1-GGUF (este) | 1,73B | no disponible | lfm1.0 | GGUF (i1) | Variante abliterated, 25 cuantizaciones |
| mradermacher/LFM3-1.7B-Uncensored-GGUF | no disponible | no disponible | no disponible | GGUF | Otra variante sin censura del mismo modelo base |
| saidutta69/LFM3-1.7B-heretic | 1,73B | no disponible | lfm1.0 | safetensors | Modelo base de esta cuantización |
| LiquidAI/LFM3-1.7B | 1,73B | no disponible | lfm1.0 | safetensors | Modelo original de Liquid AI, con rechazos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La modificación abliterated elimina los rechazos del modelo, lo que aumenta el riesgo de generar contenido dañino, ilegal o inexacto sin advertencia. No es adecuado para aplicaciones de cara al público sin capas de moderación adicionales.
- Riesgo de alucinación: al tratarse de un modelo de 1,7B parámetros, la fiabilidad factual es limitada y los errores de razonamiento son frecuentes, especialmente en cuantizaciones bajas (IQ1, IQ2, Q2_K).
- Las cuantizaciones por debajo de Q4 pierden calidad de forma notable; la propia model card desaconseja IQ1_S e IQ1_M salvo como último recurso y califica Q2_K_S como de calidad muy baja.
- Licencia lfm1.0 de Liquid AI: es necesario revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones de atribución o de uso. La modificación heretic no altera la licencia del modelo base.
- No se documenta la longitud de contexto soportada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- El rendimiento multilingüe en los 16 idiomas declarados no está verificado con benchmarks; en modelos pequeños, la calidad suele concentrarse en inglés.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de funcionamiento ni de estabilidad.
- El tamaño del repositorio (21,3 GB) incluye todas las cuantizaciones; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-heretic-i1-GGUF
- Modelo base: https://huggingface.co/saidutta69/LFM3-1.7B-heretic
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/LFM3-1.7B-heretic-GGUF
- Variante Uncensored relacionada: https://huggingface.co/mradermacher/LFM3-1.7B-Uncensored-GGUF
- Perfil del autor: https://huggingface.co/mradermacher
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Página de descarga del autor: https://hf.tst.eu/model#LFM3-1.7B-heretic-i1-GGUF
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
