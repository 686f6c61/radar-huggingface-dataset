# Night448/smolvlm2-slake-vqa

## Resumen

Night448/smolvlm2-slake-vqa es un adaptador LoRA publicado en Hugging Face que ajusta el modelo visual-lenguaje SmolVLM2-500M-Instruct para una tarea de respuesta visual a preguntas (VQA). El nombre del repositorio apunta al conjunto SLAKE, un benchmark de VQA biomédica, aunque la model card generada automáticamente declara que el dataset de entrenamiento es desconocido ("unknown dataset"), por lo que esa correspondencia no está confirmada por el autor.

Se trata de un adaptador PEFT de tipo LoRA en formato safetensors, no de un modelo completo: para utilizarlo hay que cargar el modelo base HuggingFaceTB/SmolVLM2-500M-Instruct y superponer los pesos del adaptador. El repositorio no incluye resultados de evaluación, información sobre la composición del dataset ni detalles del rango o alpha de la LoRA, y en el momento de la consulta acumula 0 descargas y 0 "likes".

Su interés está en la categoría de los modelos visual-lenguaje compactos: un backbone de la clase 500M parámetros que puede ejecutarse en hardware de consumo y en el borde, con licencia Apache-2.0. Al carecer de evaluación pública y de documentación del dataset, debe tratarse como un artefacto experimental y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer visual-lenguaje SmolVLM2-500M-Instruct; rango, alpha y módulos adaptados no disponibles |
| Parámetros totales | Modelo base de la clase 500M (SmolVLM2-500M-Instruct); número exacto de parámetros del adaptador no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (se hereda del modelo base) |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y no se documentan versiones cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere el modelo base para la inferencia |
| Librería | peft (compatible con transformers) |
| Pipeline declarado | text-generation |
| Tamaño del repositorio | 0,0 GB |
| Fecha de publicación | 2026-10-26 (creación y última actualización) |

## Arquitectura y entrenamiento

La información disponible describe únicamente un adaptador LoRA entrenado con PEFT 0.21.2 sobre HuggingFaceTB/SmolVLM2-500M-Instruct. No se documentan la arquitectura interna del modelo base, el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifican los hiperparámetros propios de la LoRA (rango, alpha, dropout, módulos objetivo). Los tags del repositorio mencionan tanto SmolVLM2-500M-Instruct como SmolVLM2-500M-Video-Instruct, una discrepancia que el autor no aclara y que conviene verificar antes de reproducir el ajuste.

Los hiperparámetros de entrenamiento declarados son: learning rate 3e-4, batch size de entrenamiento 8 con 4 pasos de acumulación (batch efectivo 32), seed 42, optimizador AdamW de 8 bits con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con 15 pasos de calentamiento y una sola época. El entorno registrado incluye PyTorch 2.11.0+cu130, Transformers 5.21.0.dev0, Datasets 4.8.5 y Tokenizers 0.23.3. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) ni se aportan curvas de pérdida o resultados de evaluación.

## Capacidades

- Respuesta visual a preguntas (VQA): la especialización declarada por el nombre del repositorio y el pipeline de generación de texto apuntan a responder preguntas sobre imágenes.
- Comprensión de imágenes y, presumiblemente, de vídeo corto, heredada del modelo base SmolVLM2; no confirmado en la model card.
- Generación de texto condicionada a entrada visual, a través del pipeline `text-generation`.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo "thinking" o razonamiento explícito: no documentado.
- Capacidades de audio: no documentadas.

## Casos de uso

- VQA sobre imágenes médicas o biomédicas: si se confirma que el ajuste se realizó sobre SLAKE, el adaptador podría emplearse para responder preguntas sobre imágenes clínicas en entornos de investigación; la falta de evaluación pública obliga a validarlo contra un conjunto de test propio antes de cualquier uso real.
- Asistencia de accesibilidad: describir imágenes y responder preguntas sobre su contenido para usuarios con discapacidad visual, aprovechando el reducido coste computacional de un modelo de la clase 500M.
- Etiquetado y enriquecimiento de catálogos de imágenes: generar pares pregunta-respuesta o descripciones breves en pipelines de anotación semiautomática, con revisión humana posterior.
- Prototipado en el borde: desplegar un asistente visual en dispositivos con poca VRAM o en CPU para pruebas de concepto de VQA, gracias a que el modelo base cabe en GPUs de consumo.
- Extracción de información de documentos escaneados: responder preguntas sobre campos concretos de una imagen, siempre que el texto sea legible y se asuma la limitación de OCR de un modelo de 500M.
- Filtrado y moderación visual: clasificar o responder preguntas sobre contenido de imágenes en un primer nivel de triaje, combinado con un modelo mayor para los casos dudosos.
- Educación interactiva: responder preguntas de estudiantes sobre diagramas, figuras o fotografías en una aplicación didáctica de bajo coste.
- Investigación en adaptadores eficientes: servir como ejemplo reproducible de fine-tuning LoRA sobre un VLM compacto para experimentos de comparación de técnicas PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` del repositorio existe, pero su lista de resultados está vacía, y la model card no incluye métricas de evaluación, comparaciones con el modelo base ni resultados sobre SLAKE u otros conjuntos.

## Requisitos de hardware

- El adaptador LoRA es de tamaño reducido (el repositorio ocupa 0,0 GB, coherente con decenas de MB), pero requiere cargar el modelo base SmolVLM2-500M-Instruct para inferir.
- VRAM estimada para el base en FP16: en torno a 1 GB solo para pesos de 500M parámetros, más overhead de activaciones y del codificador visual; una estimación prudente es 2-3 GB.
- VRAM estimada en 8 bits: aproximadamente 0,5-0,7 GB de pesos; en 4 bits, 0,3-0,5 GB, sin contar activaciones. Son estimaciones por tamaño, no cifras publicadas por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o superiores para margen holgado; también A100/H100 si se integra en un servicio con muchas peticiones.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más (GTX 1650, RTX 3050, etc.), y es viable en CPU para pruebas puntuales.
- Despliegue: transformers + peft es la vía directa; para servir en producción puede fusionarse el adaptador (`merge_and_unload`) y usar vLLM o TGI si soportan la arquitectura del base. llama.cpp u Ollama requerirían conversión a GGUF y verificar el soporte multimodal de SmolVLM2 en la versión concreta; no hay configuración oficial publicada para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Night448/smolvlm2-slake-vqa | Base de la clase 500M + adaptador LoRA | No disponible | VQA (presumiblemente sobre SLAKE) | apache-2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolVLM2-500M-Instruct | 500M | No disponible en la información proporcionada | VLM generalista instruido | No disponible en la información proporcionada | Hugging Face (modelo base) |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct | 2,2B | No disponible en la información proporcionada | VLM generalista de mayor tamaño | No disponible en la información proporcionada | Hugging Face (referencia de la familia) |

No es posible establecer una comparación de rendimiento porque el adaptador no publica métricas y el modelo base no se evalúa en la información proporcionada. La comparación relevante es funcional: este repositorio aporta especialización en VQA a costa de perder generalidad y de depender del modelo base.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base SmolVLM2-500M-Instruct los pesos del adaptador no son utilizables.
- Ausencia total de evaluación publicada: no hay métricas en el `model-index`, ni resultados sobre SLAKE, ni comparación con el base; el rendimiento real es desconocido.
- Dataset de entrenamiento no documentado: la model card indica "unknown dataset", de modo que no pueden evaluarse sesgos, licencias de los datos ni riesgo de contaminación.
- Discrepancia en los tags: se referencian simultáneamente SmolVLM2-500M-Instruct y SmolVLM2-500M-Video-Instruct, lo que puede afectar a la reproducibilidad.
- Entrenamiento de una sola época con learning rate 3e-4: riesgo de ajuste insuficiente o de sobreajuste a un conjunto pequeño, sin curvas que lo permitan valorar.
- Tamaño de 500M: capacidad limitada de razonamiento, OCR y preguntas que requieran conocimiento externo; propensión a alucinaciones en respuestas sobre imágenes ambiguas.
- Idiomas y longitud de contexto no documentados; no debe asumirse un rendimiento multilingüe ni una ventana concreta.
- Si el ajuste se hizo sobre SLAKE, deben revisarse las condiciones de uso de ese dataset, que pueden restringir el uso comercial aunque el adaptador se publique como Apache-2.0.
- Entorno de entrenamiento con versiones de desarrollo (Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130): posible fricción de compatibilidad al reproducir o cargar el adaptador.
- Adopción nula (0 descargas, 0 "likes") y ficha autogenerada sin revisión humana: no existe validación por parte de la comunidad.
- Uso clínico o diagnóstico: totalmente desaconsejado sin validación externa, certificación y supervisión profesional, incluso si el dominio es biomédico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Night448/smolvlm2-slake-vqa
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Instruct
