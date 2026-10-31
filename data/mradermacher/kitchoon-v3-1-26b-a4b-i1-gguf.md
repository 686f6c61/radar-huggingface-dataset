# mradermacher/Kitchoon-V3.1-26B-A4B-i1-GGUF

## Resumen

Kitchoon-V3.1-26B-A4B es un modelo de lenguaje MoE (mixture of experts) orientado a roleplay y generación conversacional sin censura, desarrollado por SubMaroon a partir de una arquitectura etiquetada como "gemma4". Este repositorio no es el modelo original, sino una colección de cuantizaciones GGUF con imatrix (matriz de importancia) realizadas por mradermacher, un cuantizador muy conocido en la comunidad de llama.cpp, a partir de los pesos de SubMaroon/Kitchoon-V3.1-26B-A4B.

El modelo tiene 25.233.142.046 parámetros totales (unos 26B) y, según la nomenclatura "A4B", activa aproximadamente 4B de parámetros por token, lo que permite una inferencia rápida y ligera pese al tamaño total. Su relevancia radica en la combinación de tres factores: arquitectura MoE eficiente, enfoque específico en roleplay con etiquetas "uncensored" y "heretic" (sin alineación restrictiva), y licencia Apache 2.0, que permite uso comercial sin restricciones.

La colección incluye más de veinte cuantizaciones, desde IQ1_S (8,4 GB) hasta Q6_K (22,7 GB), lo que permite ejecutarlo desde portátiles con poca VRAM hasta estaciones de trabajo con GPU de gama alta. Está pensado especialmente para usarse con SillyTavern y otros frontales de rol conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiquetado como "gemma4") |
| Parametros totales | 25.233.142.046 (25,23B) |
| Parametros activos | ~4B (deducido de la denominación "A4B"; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base, SubMaroon/Kitchoon-V3.1-26B-A4B, emplea una arquitectura transformer de tipo mixture of experts (MoE), según indican la etiqueta "moe" y la denominación "A4B" (approximately 4B de parámetros activos por token sobre 26B totales). La etiqueta "gemma4" sugiere que se basa en la arquitectura Gemma de Google, aunque no hay documentación técnica publicada en la model card que lo confirme en detalle.

No se dispone de información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación. Las etiquetas "uncensored" y "heretic" indican que se trata de un modelo sin alineación de seguridad restrictiva, probablemente mediante abliteración o fine-tuning sobre un modelo base, pero el método concreto no está documentado en la información disponible.

En cuanto a la cuantización, mradermacher emplea cuantizaciones con imatrix (importance matrix), una técnica de llama.cpp que pondera la cuantización según la importancia estadística de cada tensor, mejorando la calidad frente a cuantizaciones estáticas equivalentes, especialmente en rangos bajos (IQ1-IQ3).

## Capacidades

- Generación de texto conversacional orientada a roleplay, con etiquetas específicas para este uso ("roleplay", "sillytavern").
- Modelo "uncensored": sin filtros de seguridad ni rechazos por defecto, lo que permite contenido sin restricciones (con las responsabilidades legales que ello conlleva).
- Etiqueta "conversational": diseñado para diálogo multi-turno.
- Posible capacidad de visión: la model card del cuantizador indica "This is a vision model" y que los archivos mmproj estarán en el repositorio de cuantizaciones estáticas, aunque no se han incluido en esta colección (skip_mmproj: 1).
- Eficiencia de inferencia gracias a la arquitectura MoE: solo ~4B de parámetros activos por token.
- No hay información sobre tool calling, capacidades de agentes, razonamiento matemático o generación de código.

## Casos de uso

- Roleplay interactivo en SillyTavern: el modelo está etiquetado específicamente para este frontal; sus cuantizaciones ligeras (10-14 GB) permiten sesiones largas de rol en GPUs de consumo con contexto amplio.
- Chatbots conversacionales sin censura: al no tener alineación restrictiva, puede usarse en asistentes personales donde el usuario quiere control total sobre el comportamiento del modelo.
- Inferencia local en hardware modesto: con ~4B de parámetros activos, las cuantizaciones IQ4_XS (14 GB) o Q4_K_M (16,9 GB) ofrecen velocidad de generación alta en una RTX 3090/4090.
- Experimentación con cuantización extrema: la gama IQ1/IQ2 permite ejecutar un modelo de 26B en portátiles con 8-12 GB de VRAM, útil para pruebas y demos.
- Creación de cuantizaciones personalizadas: el archivo imatrix de 0,2 GB permite a cualquier usuario generar sus propias cuantizaciones con llama.cpp ajustadas a su hardware.
- Escritura creativa y ficción: útil para coautoría de narrativa donde los filtros de modelos alineados resultan limitantes.
- Despliegue en servidores locales de comunidad: licencia Apache 2.0 sin restricciones comerciales permite integrarlo en servicios propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV-cache):
  - IQ1_S / IQ1_M: ~8,4-8,8 GB
  - IQ2_XS / IQ2_M: ~9,9-10,5 GB
  - IQ3_M / IQ3_S: ~12,3-12,5 GB
  - IQ4_XS: ~14 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_M: ~19,2 GB
  - Q6_K: ~22,7 GB
- GPUs recomendadas:
  - RTX 3060 12 GB: cuantizaciones IQ2/IQ3 con contexto moderado.
  - RTX 3090 / 4090 (24 GB): hasta Q6_K completo, o Q4_K_M/IQ4_XS con contexto largo.
  - Apple Silicon (Mac con 16-32 GB de memoria unificada): gama IQ2-IQ4.
- Sí cabe en GPUs de consumo: es uno de los puntos fuertes de esta colección; desde 8 GB (IQ1/IQ2, con calidad degradada) hasta 24 GB (Q6_K sin recortes).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y SillyTavern como frontal. El formato GGUF con imatrix es específico del ecosistema llama.cpp; vLLM y TGI no consumen GGUF directamente (se necesitarían los pesos originales del modelo base).
- Latencia y throughput: no disponibles como cifras, pero con ~4B de parámetros activos por token se espera una generación rápida, comparable a modelos densos de 4B, incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kitchoon-V3.1-26B-A4B | 25,23B | ~4B | GGUF (imatrix) | Apache 2.0 | Roleplay uncensored |
| Qwen3-30B-A3B | 30B | ~3B | Safetensors, GGUF comunitario | Apache 2.0 | General, con modo thinking |
| GLM-4.5-Air (106B-A12B) | 106B | 12B | Safetensors, GGUF comunitario | MIT | General/agéntico |
| Mistral Small 3.x (24B) | 24B | 24B (denso) | Safetensors, GGUF comunitario | Apache 2.0 | General |

Kitchoon se diferencia de las alternativas por su especialización en roleplay y su naturaleza uncensored: Qwen3-30B-A3B comparte la eficiencia MoE con activación similar (~3-4B) pero está alineado; Mistral Small es denso y requiere más VRAM para igual calidad de cuantización. No hay benchmarks que permitan comparar rendimiento medido.

## Limitaciones y advertencias

- Modelo uncensored sin alineación de seguridad: puede generar contenido ofensivo, dañino o ilegal según el prompt. La responsabilidad legal del uso recae íntegramente en el usuario; no es adecuado para despliegues públicos sin capas de moderación propias.
- Calidad degradada en cuantizaciones extremas: IQ1_S/IQ1_M ("for the desperate") y la gama IQ2 sufren pérdidas notables de coherencia; para uso serio se recomienda IQ4_XS o superior.
- Idioma declarado: inglés. El rendimiento en castellano no está documentado y puede ser inferior o inconsistente.
- Longitud de contexto no documentada en la model card: habrá que consultar la config del modelo base antes de planificar contextos largos.
- Los archivos mmproj (visión) no están incluidos en este repositorio; si se necesita la capacidad de visión, hay que acudir al repositorio de cuantizaciones estáticas.
- Alucinaciones: al tratarse de un modelo de roleplay sin RLHF documentado, la fiabilidad factual es probablemente baja; no es adecuado para tareas de recuperación de información o asistentes productivos.
- Licencia Apache 2.0 sin restricciones comerciales, pero conviene verificar la licencia y procedencia del modelo base (SubMaroon/Kitchoon-V3.1-26B-A4B), ya que los términos del modelo upstream pueden imponer condiciones adicionales.
- Etiqueta "gemma4" sin documentación técnica verificable: la procedencia arquitectónica exacta no está clara en la información disponible.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Kitchoon-V3.1-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V3.1-26B-A4B
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Kitchoon-V3.1-26B-A4B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Kitchoon-V3.1-26B-A4B-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
