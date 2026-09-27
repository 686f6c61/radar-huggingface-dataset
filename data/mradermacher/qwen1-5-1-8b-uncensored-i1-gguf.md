# mradermacher/Qwen1.5-1.8B-Uncensored-i1-GGUF

## Resumen

Esta ficha corresponde a `mradermacher/Qwen1.5-1.8B-Uncensored-i1-GGUF`, una recopilación de cuantizaciones GGUF con matriz de importancia (imatrix) generada por el usuario mradermacher a partir de `KhanhLinh1160/Qwen1.5-1.8B-Uncensored`. El modelo subyacente es un ajuste fino "uncensored" (es decir, sin alineamiento de rechazo) del conocido Qwen1.5-1.8B de Alibaba, un transformer decoder-only de aproximadamente 1,8 mil millones de parámetros. El repositorio no contiene pesos nuevos: su aportación es el formato de cuantización optimizado para despliegue local.

El interés de esta publicación es práctico: permite ejecutar un modelo de 1,8B en hardware muy modesto (CPU, GPU integrada o GPU de gama de entrada) mediante llama.cpp u Ollama, con cuantizaciones que van desde IQ1_S hasta Q6_K. La utilidad en producción es limitada por su tamaño y por la falta de alineamiento de seguridad, pero resulta relevante para experimentación local, generación creativa sin filtros y como base para estudiar técnicas de cuantización.

Cabe señalar que la ficha pública no aporta información sobre licencia, pipeline ni resultados de evaluación, y el recuento de descargas y "likes" es cero, lo que indica nula validación comunitaria hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen1.5); detalles de atención, normalización y activación no disponibles en la informacion proporcionada |
| Parametros totales | 1,8B segun el nombre del modelo base; el recuento de safetensors indicado en la ficha (427,176) no concuerda con un modelo de 1,8B y se considera incoherente |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el modelo base Qwen1.5-1.8B declara 32.768 tokens, no confirmado para este ajuste |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, Q2_K, Q2_K_S |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado con imatrix); safetensors en el modelo base original |

## Arquitectura y entrenamiento

El modelo base es Qwen1.5-1.8B, un transformer decoder-only de la familia Qwen1.5, que emplea mecanismos habituales de esta serie (atención con query grouping, codificación posicional rotatoria, normalización RMSNorm y activación SwiGLU). Sobre esa base, el usuario KhanhLinh1160 aplicó un ajuste fino orientado a eliminar el comportamiento de rechazo, aunque la model card no documenta el dataset, el número de tokens ni la metodología (RLHF, DPO u otra) empleada en ese ajuste.

La contribución de este repositorio es exclusivamente la cuantización: mradermacher ha generado cuantizaciones GGUF con matriz de importancia (imatrix) usando `quantize_version: 2` y `output_tensor_quantised: 1` sobre pesos convertidos a formato Hugging Face. El repositorio incluye un fichero `.imatrix.gguf` (0,1 GB) que permite crear cuantizaciones propias. También existe una variante con cuantizaciones estáticas en `mradermacher/Qwen1.5-1.8B-Uncensored-GGUF`. No se documenta ninguna innovación arquitectónica propia más allá del pipeline de cuantización.

## Capacidades

- Generación de texto en inglés, con foco en formato conversacional (etiqueta "conversational" en el repositorio GGUF estático).
- Comportamiento "uncensored": al carecer de alineamiento de rechazo, puede producir contenido que los modelos alineados suelen declinar, lo que incluye materiales sensibles o potencialmente nocivos.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Conversión y ejecución en el ecosistema `transformers` y en el ecosistema GGUF (llama.cpp, Ollama, etc.).
- Capacidades de razonamiento, matemáticas y código presentes solo en la medida en que un modelo de 1,8B puede ofrecerlas; no se han publicado evaluaciones al respecto.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking).

## Casos de uso

- Generación creativa sin filtros: escritura de ficción, guiones o roleplay en inglés donde los modelos alineados introducirían rechazos; el tamaño de 1,8B permite ejecución local sin coste de API.
- Prototipado en hardware muy limitado: desarrollo y pruebas de pipelines de generación de texto en portátiles, Raspberry Pi o entornos sin GPU, gracias a cuantizaciones de menos de 1 GB.
- Aumento de datos sintéticos: generación masiva de texto de dominio específico para alimentar otros modelos o para pruebas de robustez, aprovechando el bajo coste por token en inferencia local.
- Investigación sobre alineamiento y censura: modelo de estudio para comparar la distribución de salidas de un modelo sin alinear frente a su versión alineada, en trabajos académicos sobre seguridad.
- Clasificación y etiquetado ligero: tareas de filtrado, categorización o extracción simple de texto donde la latencia baja importa más que la precisión fina.
- Asistente conversacional offline en inglés: despliegue en un equipo de escritorio con llama.cpp para uso personal, sin conexión y sin enviar datos a terceros.
- Base para experimentos de fine-tuning: punto de partida barato en cómputo para estudiar técnicas de ajuste o de cuantización sobre modelos de menos de 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño aproximado del fichero de pesos, orientativo):
  - IQ1_S / IQ1_M: ~0,35–0,45 GB
  - Q2_K / IQ2_XS–IQ2_M: ~0,6–0,9 GB
  - Q3_K_M / IQ3_XS–IQ3_M: ~0,9–1,1 GB
  - Q4_0 / Q4_K_S / Q4_K_M: ~1,0–1,2 GB
  - Q5_K_M: ~1,3 GB
  - Q6_K: ~1,5 GB
  - Q8_0 (no listada pero habitual): ~1,9 GB
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100. También funciona en GPU integradas y en CPU pura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual e incluso en muchas integradas.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, text-generation-webui y otros front-ends compatibles con GGUF. El tag `endpoints_compatible` y la librería `transformers` sugieren también uso vía servidores de inferencia compatibles con Hugging Face.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. En un modelo de este tamaño, en GPU de consumo se espera un throughput alto, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen1.5-1.8B-Uncensored (este) | 1,8B | no disponible (base: 32.768) | no disponible | GGUF, safetensors | Finetune sin alinear, solo ingles |
| Qwen1.5-1.8B (base) | 1,8B | 32.768 | Apache 2.0 | safetensors, GGUF | Version alineada y multilingue del original |
| Llama-3.2-1B | 1,2B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Mas reciente, contexto muy superior, multilingue |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | safetensors, GGUF | Comunidad amplia, contexto reducido |

Los datos de contexto y licencia de las alternativas corresponden a sus especificaciones publicas conocidas; el rendimiento comparado no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan evaluaciones de sesgo; al tratarse de un ajuste sin alinear, es probable que reproduzca y amplifique sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: elevado por el tamaño reducido (1,8B); no genera hechos fiables sin verificación externa.
- Limitacion de idioma: soporta únicamente ingl&#233;s según el tag del repositorio; el rendimiento en castellano no está garantizado.
- Limitacion de contexto: la longitud de contexto no se especifica en la ficha; conviene validarla antes de usarla en conversaciones multi-turno largas.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si se permite el uso comercial; se debe contactar con los autores del modelo base antes de cualquier despliegue productivo.
- Modelo sin alinear: puede generar contenido ofensivo, ilegal o peligroso; no es apto para aplicaciones orientadas al usuario sin moderación adicional.
- Cuantizaciones de baja precisión: las variantes IQ1/IQ2 degradan notablemente la calidad del texto; se recomienda Q4_K_M o superior para uso real.
- Sin validacion comunitaria: cero descargas y cero "likes" en la ficha, sin pruebas independientes publicadas.
- Fechas de creacion y actualizacion (2026-09-27) incoherentes con el estado del modelo, lo que sugiere posibles errores en los metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen1.5-1.8B-Uncensored-i1-GGUF
- Modelo base (uncensored): https://huggingface.co/KhanhLinh1160/Qwen1.5-1.8B-Uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen1.5-1.8B-Uncensored-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Qwen1.5-1.8B-Uncensored-i1-GGUF/resolve/main/Qwen1.5-1.8B-Uncensored.imatrix.gguf
- Pagina resumen de cuantizaciones: https://hf.tst.eu/model#Qwen1.5-1.8B-Uncensored-i1-GGUF
- Peticiones de modelos y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
