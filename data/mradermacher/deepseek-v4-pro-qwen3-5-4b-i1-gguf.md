# mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-i1-GGUF es la versión cuantizada con imatrix del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un modelo de 4.326.350.848 parámetros (~4,3B) obtenido por destilación de conocimiento desde DeepSeek-V4-Pro sobre una base Qwen3.5. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF para llama.cpp, y distribuye el resultado bajo licencia Apache 2.0.

El modelo base es un destilado orientado a razonamiento, matemáticas y STEM, entrenado mediante SFT sobre dos conjuntos de datos publicados por Jackrong: DeepSeek-V4-Pro-Distilled-200K y DeepSeek-V4-Distill-8000x. La model card etiqueta el modelo como multimodal (visión), con soporte de razonamiento explícito y MTP (multi-token prediction), y limita los idiomas declarados a inglés y chino.

La relevancia de esta ficha concreta es práctica: ofrece el modelo en 24 variantes GGUF (desde i1-Q2_K de 2,1 GB hasta i1-Q6_K de 3,7 GB) generadas con matriz de importancia, lo que permite ejecutar un destilado de razonamiento de 4,3B en hardware de consumo sin GPU dedicada de gama alta. Es, por tanto, una opción para prototipado local de tareas de matemáticas y STEM con presupuesto de VRAM reducido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5, según tags `qwen3_5` y `transformers`); detalles de capas y atención no disponibles |
| Parámetros totales | 4.326.350.848 (~4,3B) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (más fichero imatrix); cuantizaciones estáticas en el repo hermano `-GGUF` |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base sigue la familia Qwen3.5 según los tags del repositorio, con un total de 4,3B parámetros en un transformer denso. No se dispone de información publicada en la model card sobre número de capas, dimensión oculta, tipo de atención ni longitud de contexto nativa. Los tags incluyen `mtp` (multi-token prediction), lo que sugiere que el entrenamiento incorporó objetivos de predicción multi-token, aunque no se detalla su implementación ni el impacto en la decodificación.

El entrenamiento es un proceso de destilación en dos etapas sobre los datasets Jackrong/DeepSeek-V4-Pro-Distilled-200K (200.000 muestras destiladas) y Jackrong/DeepSeek-V4-Distill-8000x, con ajuste supervisado (SFT) orientado a razonamiento, matemáticas y STEM. No se declara en la información disponible el uso de RLHF, DPO ni el volumen total de tokens de entrenamiento. La cuantización de mradermacher emplea matrices de importancia (imatrix) calculadas sobre el propio modelo, lo que según el autor mejora la calidad respecto a cuantizaciones estáticas del mismo tamaño; el repositorio incluye también el fichero imatrix (0,1 GB) para que terceros generen sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Razonamiento explícito (tag `reasoning`), con capacidad de producir cadenas de pensamiento antes de la respuesta final.
- Matemáticas y STEM, reforzadas por el entrenamiento de destilación sobre datasets específicos.
- Capacidad multimodal de visión: la model card indica explícitamente "This is a vision model", con ficheros mmproj (si existen) en el repositorio estático.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modo de razonamiento es un requisito habitual para ello.
- Multilingüismo limitado a inglés y chino.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con text-generation-inference.

## Casos de uso

- Tutor de matemáticas y física en local: el modelo puede resolver problemas paso a paso aprovechando el modo de razonamiento y el entrenamiento específico en STEM, desplegado con llama.cpp en un portátil con 8-16 GB de RAM usando i1-Q4_K_M (2,9 GB).
- Asistente de programación científica offline: para generar y explicar scripts de cálculo numérico en Python o R sin enviar código a servicios externos, con el modelo en i1-Q5_K_M (3,3 GB) en una GPU de consumo.
- Prototipado de pipelines de razonamiento en CI: al ser un GGUF de 2-3 GB, se puede integrar en tests automatizados que verifiquen respuestas de razonamiento sin coste de API, usando llama.cpp como backend.
- Extracción de datos de documentos técnicos en inglés o chino: con la variante i1-Q6_K (3,7 GB) para maximizar fidelidad en tareas de parsing y resumen de documentación técnica bilingüe.
- Evaluación comparativa de destilados: sirve como referencia de 4,3B para medir cuánto de DeepSeek-V4-Pro se retiene tras destilación, comparando contra el modelo base sin cuantizar en tareas de matemáticas.
- Despliegue en entornos con requisitos de soberanía del dato: al ser Apache 2.0 y ejecutable en CPU, encaja en entornos sanitarios o financieros donde no se permite enviar datos a la nube.
- Análisis de imágenes técnicas: si se descargan los ficheros mmproj del repositorio estático, puede procesar diagramas o capturas en inglés/chino para tareas de descripción y extracción de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo + overhead de contexto): i1-Q2_K ~2,1 GB de pesos, ~3-4 GB con contexto moderado; i1-Q4_K_M ~2,9 GB de pesos, ~4-5 GB con contexto; i1-Q6_K ~3,7 GB de pesos, ~5-6 GB con contexto.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060 6 GB, RTX 4060 8 GB, RTX 4070, RTX 4090) para las variantes Q4-Q6; las variantes Q2-Q3 caben en GPUs de 4 GB.
- Cabe en GPU de consumo: sí, en todas las variantes, incluidas GTX 1650 4 GB (Q2/Q3) y RTX 3060 12 GB (Q6 con contexto amplio).
- Ejecución en CPU: viable con llama.cpp; un i1-Q4_K_M de 2,9 GB funciona en un portátil con 8 GB de RAM a velocidades de decodificación de un dígito a decenas de tokens por segundo según CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), text-generation-inference (tag declarado, aunque GGUF en TGI está limitado), y servidores compatibles con la API de OpenAI mediante llama.cpp server.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-i1-GGUF (este) | 4,3B | no disponible | Apache 2.0 | GGUF (24 variantes) | Destilado de DeepSeek-V4-Pro, visión, en/zh |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (base) | 4,3B | no disponible | Apache 2.0 | safetensors | Modelo sin cuantizar del que deriva este |
| mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-GGUF | 4,3B | no disponible | Apache 2.0 | GGUF (estáticas) | Mismo modelo, cuantización estática sin imatrix |
| Qwen3.5-4B (familia base) | ~4B | no disponible | no disponible | safetensors/GGUF | Modelo original sobre el que se destila; sin datos de rendimiento en la información disponible |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado y probablemente sea degradado.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un destilado de un modelo mayor, puede heredar sesgos de DeepSeek-V4-Pro y de los datasets de destilación, sin que se hayan publicado análisis.
- Alucinación: no se han publicado tasas de alucinación; el modo de razonamiento puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en matemáticas de varios pasos.
- Contexto: la longitud de contexto no está declarada en la información disponible; conviene verificarla en el modelo base antes de usarlo en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B y de los datasets de destilación, que podrían imponer restricciones adicionales no reflejadas en este repo.
- Cuantización: las variantes Q2/Q3 pierden calidad de forma notable; para producción se recomienda i1-Q4_K_M o superior. El propio autor advierte que Q4_0 es "fast, low quality".
- Visión: los ficheros mmproj no están en este repositorio sino en el estático; hay que descargarlos por separado para usar la capacidad multimodal.
- Producción: al ser un destilado de 4,3B, no debe esperarse paridad con DeepSeek-V4-Pro completo; validar en el dominio concreto antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-i1-GGUF
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-4B-i1-GGUF
- Dataset de destilación 200K: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Pro-Distilled-200K
- Dataset de destilación 8000x: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
