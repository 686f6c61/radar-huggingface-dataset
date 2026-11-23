# mradermacher/Clary-3.0-Neon-1.7B-GGUF

## Resumen

Clary-3.0-Neon-1.7B-GGUF es la version cuantizada en formato GGUF del modelo AuroraSystem/Clary-3.0-Neon-1.7B, un modelo de lenguaje bilingue ruso-ingles de 1.720.574.976 parametros construido sobre la arquitectura Qwen3. La cuantizacion la ha realizado mradermacher, un conocido empaquetador de pesos GGUF para llama.cpp, y se distribuye con licencia Apache 2.0.

El modelo base esta orientado a razonamiento, instruction-tuning y conversacion, con etiquetas que lo identifican como derivado de Qwen3 y especializado en el idioma ruso. Con 1,7 mil millones de parametros, se situa en la gama de modelos pequenos que pueden ejecutarse en hardware de consumo, lo que lo hace relevante para despliegues locales, prototipado rapido y aplicaciones donde la privacidad o la latencia importan mas que la capacidad bruta.

Esta ficha cubre la version GGUF, que incluye 11 variantes de cuantizacion desde Q2_K (0,9 GB) hasta f16 (3,5 GB), lo que permite ajustar el equilibrio entre calidad y consumo de memoria segun el hardware disponible. No se dispone de informacion publicada sobre el proceso de entrenamiento ni sobre resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | ru, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es de tipo transformer y que las etiquetas lo vinculan a la familia Qwen3, lo que sugiere una arquitectura decoder-only con atencion por grupos (GQA) y posibles mecanismos de razonamiento propios de Qwen3. Sin embargo, no se han publicado detalles sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni sobre la longitud de contexto nativa.

Respecto al entrenamiento, la model card del repositorio GGUF no incluye informacion sobre el volumen de tokens, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas. Las etiquetas "reasoning" e "instruction-tuning" indican que el modelo ha sido ajustado para tareas de razonamiento e instrucciones, y "bilingual" confirma el soporte de ruso e ingles. Esta version GGUF es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) del modelo original, sin cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ruso e ingles.
- Razonamiento e instruction-following, segun las etiquetas del modelo.
- Soporte bilingue ru-en, orientado a usuarios rusoparlantes.
- Capacidad de chat multi-turno (tag "conversational").
- Compatible con endpoints (tag "endpoints_compatible").
- No se ha confirmado soporte de tool calling, function calling, agentes, vision, audio ni thinking mode explicito en la informacion disponible.

## Casos de uso

- Asistente conversacional local en ruso: el modelo puede desplegarse en un portatil o mini-PC con llama.cpp u Ollama usando la cuantizacion Q4_K_M (1,2 GB), ofreciendo respuestas bilingues sin conexion a internet.
- Prototipado de chatbots para atencion al cliente en mercados rusoparlantes: su tamano reducido permite iterar rapidamente y desplegar en CPU o GPU de gama baja antes de escalar a modelos mayores.
- Generacion de texto y resumenes en entornos con recursos limitados: la variante Q2_K (0,9 GB) permite ejecutar el modelo en dispositivos con poca RAM, util para sistemas embebidos o contenedores ligeros.
- Traduccion y adaptacion de contenido ru-en: el caracter bilingue del modelo lo hace adecuado para tareas de traduccion asistida o reescritura de textos entre ambos idiomas.
- Educacion y tutoria automatizada: el modelo puede gestionar dialogos explicativos multi-turno en ruso e ingles, con la ventaja de ejecutarse localmente para proteger datos de estudiantes.
- Investigacion en eficiencia de modelos: al disponer de 11 cuantizaciones distintas, sirve para estudiar el impacto de la cuantizacion en la calidad de modelos de 1,7B en tareas de razonamiento bilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K: ~0,9 GB
  - Q4_K_M: ~1,2 GB
  - Q8_0: ~1,9 GB
  - f16: ~3,5 GB
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para las variantes de mayor precision.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM; las variantes Q4 caben incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI, pero esta version GGUF esta pensada para llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (1,7B), se espera un throughput alto en GPU de consumo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Clary-3.0-Neon-1.7B-GGUF | 1,72B | no disponible | Apache 2.0 | GGUF | Bilingue ru-en, base Qwen3 |
| Qwen3-1.7B | ~1,7B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo original de Alibaba, multilingue amplio |
| Llama 3.2 1B | ~1,2B | 128k (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Multilingue, licencia con restricciones |
| Gemma 3 1B | ~1B | no disponible | Gemma Terms of Use | safetensors, GGUF | Multilingue, licencia con restricciones |

La comparativa se limita a datos publicos de cada familia; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada para Clary-3.0-Neon-1.7B.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos, y al ser un modelo afinado para ruso e ingles, su comportamiento en otros idiomas es incierto.
- Riesgo de alucinacion inherente a modelos de 1,7B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- La longitud de contexto no esta documentada, lo que impide garantizar ventanas largas en produccion.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original (AuroraSystem/Clary-3.0-Neon-1.7B) por si hubiera restricciones adicionales.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas ni imatrix disponibles, lo que puede afectar la calidad en comparacion con versiones optimizadas de otros modelos.
- El modelo no ha sido validado con benchmarks publicos, por lo que su rendimiento real en tareas especificas es desconocido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Clary-3.0-Neon-1.7B-GGUF
- Modelo base: https://huggingface.co/AuroraSystem/Clary-3.0-Neon-1.7B
- Pagina de descargas del autor: https://hf.tst.eu/model#Clary-3.0-Neon-1.7B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
