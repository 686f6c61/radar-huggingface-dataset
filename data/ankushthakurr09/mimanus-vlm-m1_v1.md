# ankushthakurr09/Mimanus-VLM-M1_v1

## Resumen

Mimanus-VLM-M1_v1 es un modelo de visión-lenguaje (VLM) compacto publicado por el usuario ankushthakurr09 en HuggingFace, orientado a respuesta visual a preguntas (VQA) con fundamento visual y diálogo multi-turno sobre imágenes. Combina un encoder visual SigLIP 2 Large de Google (patch16-384, congelado) con el backbone de lenguaje Llama 3.2 1B Instruct de Meta (ajustado), unidos por un conector MLP entrenado de apenas 6,3 millones de parámetros.

Su principal peculiaridad técnica es que el conector preserva los 576 tokens visuales completos de la rejilla 24x24 sin downsampling (mapeo 1:1), en lugar de comprimirlos como hacen muchas arquitecturas similares. El modelo se entrenó en dos etapas siguiendo el recetario de LLaVA: alineación de características sobre 558.128 pares imagen-caption y ajuste por instrucciones sobre 1.400.520 muestras multimodales de VQA v2, GQA, TextVQA y Visual Genome.

Es relevante como referencia académica y como base de experimentación de bajo coste: se desarrolló para el curso CS-747 (Deep Learning for Computer Vision) y su repositorio ocupa 2,5 GB, lo que lo sitúa en el rango de modelos que caben en una GPU de consumo. No obstante, es un modelo sin descargas ni validación externa en el momento de redactar esta ficha, y no publica resultados numéricos de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM con encoder visual SigLIP 2 Large (ViT patch16-384, 23 bloques ejecutados, corte en la capa -2, 1024 dim) + conector MergeMLP + decoder Llama 3.2 1B Instruct |
| Parámetros totales | ~1,67 mil millones (derivado de los componentes descritos: ~435 M del encoder congelado + 6.297.600 del conector + ~1,23 B del backbone de lenguaje) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (backbone Llama 3.2 1B) |
| Tipos de cuantización | no disponible (no se documentan pesos GGUF, AWQ, GPTQ ni recetas de cuantización) |
| Idiomas soportados | inglés (`en`) |
| Licencia | llama3.2 (Llama 3.2 Community License, heredada de meta-llama/Llama-3.2-1B-Instruct) |
| Formato de pesos | no disponible explícitamente; el repositorio incluye código de modelado propio (`modeling_mimanus.py`) y `requirements.txt`, se carga con `MimanusVLM.from_pretrained(...)` |
| Tokens visuales | 576 (rejilla 24x24, proyección 1:1 a anchura 2048, sin downsampling) |
| Resolución de entrada visual | 384 px (SigLIP 2 Large patch16-384) |
| Componentes entrenados | Conector (6,3 M) y backbone de lenguaje completo (~1,23 B); encoder visual congelado |
| Tamaño del repositorio | 2,5 GB |
| Pipeline declarado | `visual-question-answering` |

## Arquitectura y entrenamiento

La arquitectura es un VLM de tipo conector, con tres bloques diferenciados. El encoder visual es SigLIP 2 Large en configuración patch16-384: 23 bloques ViT ejecutados (se descarta la capa -2 del modelo original), salida de 1024 dimensiones y aproximadamente 435 millones de parámetros, completamente congelados durante el entrenamiento. El conector, denominado 1:1 MergeMLP, aplica `LayerNorm(1024) -> Linear(1024, 2048) -> GELU -> Linear(2048, 2048)` y suma 6.297.600 parámetros; su función es proyectar cada uno de los 576 parches visuales a la anchura 2048 del espacio de embeddings del modelo de lenguaje, manteniendo correspondencia 1:1 entre parche y token. El backbone lingüístico es Llama 3.2 1B Instruct: 16 capas, atención GQA con ratio 32:8 cabezas, activación SwiGLU y ventana de contexto de 2048 tokens.

El entrenamiento sigue un recetario de dos etapas. La primera, de alineación de características, entrena solo el conector sobre 558.128 pares imagen-caption provenientes del conjunto de preentrenamiento de LLaVA (`pretrain.jsonl`), con una pérdida final declarada de 2,3747. La segunda, de ajuste por instrucciones, entrena el conector y el modelo de lenguaje completo sobre 1.400.520 muestras multimodales de instrucciones procedentes de VQA v2, GQA, TextVQA y Visual Genome, calculando la entropía cruzada estrictamente sobre los tokens de respuesta del asistente. No se documenta el uso de RLHF, DPO ni de decodificación especulativa.

Como marco de evaluación, la model card describe un conjunto de diagnósticos de fundamento visual (no de rendimiento bruto): Blind Twin Baseline (verificar colapso de precisión al ablacionar las características de imagen), Image Swap Sensitivity (divergencia de predicción al sustituir la imagen por una aleatoria), Complementary Pairs (preguntas sobre dos imágenes para forzar desambiguación visual visual) y GroundProbe/POPE (comprobaciones de alucinación sobre existencia de objetos, conteo y relaciones espaciales). No se publican los valores obtenidos en ninguno de ellos.

## Capacidades

- Respuesta visual a preguntas (VQA) de un solo turno sobre una imagen de entrada, con foco declarado en respuestas "fundamentadas" en el contenido visual.
- Diálogo visual multiturno mediante interfaz interactiva de terminal (`python inference.py --image test.jpg` sin pregunta abre conversación).
- Lectura de texto en imagen, gracias al ajuste sobre TextVQA.
- Razonamiento sobre escenas y objetos, por el ajuste sobre VQA v2, GQA y Visual Genome.
- Razonamiento espacial y de conteo a nivel básico (evaluado internamente con POPE/GroundProbe, sin métricas publicadas).
- Descripción de imágenes y respuesta a preguntas abiertas del tipo "¿qué está pasando en esta imagen?".
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Modo "thinking" explícito, visión de vídeo o audio: no disponibles.

## Casos de uso

- **Atención al cliente sobre capturas de pantalla**: el modelo puede responder preguntas del tipo "¿qué error muestra esta captura?" o "¿qué color tiene el botón seleccionado?" en un flujo de soporte técnico, aprovechando sus 576 tokens visuales sin compresión, que preservan detalle fino de la interfaz. Limitación práctica: la ventana de 2048 tokens deja unos 1.470 tokens para texto tras los tokens visuales, suficiente para un turno corto pero no para hilos largos.
- **Descripción de imágenes para accesibilidad**: generación de texto alternativo y respuestas descriptivas para lectores de pantalla en catálogos, paneles o aplicaciones documentales, con la ventaja de que el modelo cabe en GPU de consumo y el coste por inferencia es bajo.
- **Extracción de información de documentos escaneados**: al estar ajustado sobre TextVQA, puede emplearse en prototipos de lectura de tickets, facturas simples o etiquetas, formulando la pregunta concreta por campo ("¿cuál es el importe total?"). Requiere validación humana por el riesgo de alucinación en cifras.
- **Control de calidad visual en entornos de fabricación ligera**: preguntas dirigidas sobre imágenes de producto para detectar piezas ausentes o defectos evidentes, desplegando en una estación con GPU modesta. La resolución fija de 384 px limita la inspección de defectos micrométricos.
- **Moderación de contenido asistida por pregunta**: clasificación de imágenes mediante prompts cerrados ("¿aparece una persona conduciendo un vehículo?"), útil como primer filtro barato antes de modelos mayores. No debe usarse como único mecanismo de decisión por su sensibilidad a la formulación.
- **Investigación académica y ablaciones de grounding**: es su caso natural, dado que el autor publica explícitamente marcos de evaluación como Blind Twin Baseline o Image Swap Sensitivity; sirve para estudiar cuánto contribuye realmente el encoder visual frente a atajos del lenguaje.
- **Prototipado de robótica de bajo coste y asistentes en dispositivo**: con ~1,67 B parámetros totales, es viable en Jetson o en GPU de 8 GB, permitiendo experimentar con instrucciones visuales en el borde sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el marco de evaluación (Blind Twin Baseline, Image Swap Sensitivity, Complementary Pairs, GroundProbe, POPE) pero no incluye cifras de MMLU, HumanEval, GSM8K, VQAv2, TextVQA, POPE ni de ninguno de sus propios diagnósticos, ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parámetros declarado (~1,67 B en total) y no mediciones publicadas por el autor:

- **Pesos en fp16/bf16**: aproximadamente 3,3 GB; inferencia con overhead de activaciones y caché KV en torno a 4-5 GB de VRAM.
- **Pesos en int8**: aproximadamente 1,7 GB; inferencia estimada en 2,5-3 GB de VRAM.
- **Pesos en int4**: aproximadamente 0,9 GB; inferencia estimada en 1,5-2 GB de VRAM, aunque no se documenta ninguna receta de cuantización oficial para este modelo.
- **GPU de consumo**: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090; previsiblemente también en GPU de 8 GB en fp16, dado el tamaño del backbone de 1 B.
- **GPU de datacenter**: A100, H100 y L40S son sobredimensionadas para este modelo; su uso tendría sentido solo para servir muchas réplicas en paralelo.
- **Opciones de despliegue**: la única ruta documentada es PyTorch con el código propio del repositorio (`modeling_mimanus.py` + `inference.py`, instalación vía `requirements.txt` o `pip install -r`). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formato GGUF, por lo que la integración con servidores de inferencia estándar requeriría trabajo adicional.
- **Latencia y throughput**: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de información pública general y deben verificarse contra sus model cards antes de tomar decisiones; las cifras de rendimiento comparado no están disponibles porque Mimanus-VLM-M1_v1 no publica benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Mimanus-VLM-M1_v1 | ~1,67 B (435 M encoder + 6,3 M conector + ~1,23 B LLM) | 2048 tokens | Llama 3.2 Community License | HuggingFace, 0 descargas, repo de 2,5 GB | Sin benchmarks publicados |
| SmolVLM2-2.2B (HuggingFace) | ~2,2 B | no verificado en esta ficha | Apache 2.0 | HuggingFace, con soporte de transformers y llama.cpp | No disponible |
| Qwen2-VL-2B-Instruct (Alibaba) | ~2,2 B | 32.768 tokens | Apache 2.0 | HuggingFace, amplio ecosistema de despliegue | No disponible |
| PaliGemma 2 3B (Google) | ~3 B | no verificado en esta ficha | Gemma Terms of Use | HuggingFace, integrado en Keras/transformers | No disponible |

Diferencias cualitativas relevantes: Mimanus parte de un backbone Llama 3.2 (licencia con políticas de uso aceptable y obligaciones de atribución) frente a las licencias Apache 2.0 de SmolVLM2 y Qwen2-VL, más permisivas para integración comercial. Su ventana de contexto de 2048 tokens es la más corta del grupo y, descontando los 576 tokens visuales, deja menos de 1.500 tokens para texto e historial de conversación.

## Limitaciones y advertencias

- **Idioma**: solo inglés declarado; no hay evidencia de competencia en castellano ni en otros idiomas, y el ajuste se hizo sobre datasets mayoritariamente angloparlantes (VQA v2, GQA, TextVQA, Visual Genome).
- **Contexto muy justo**: 2048 tokens totales, de los cuales 576 los ocupa la imagen; quedan menos de 1.500 para instrucción e historial, lo que limita el diálogo multiturno real pese a que la model card lo anuncie.
- **Ausencia de validación**: 0 descargas y 0 "likes" en el momento de redactar la ficha; es un modelo de autor individual, sin revisión por pares ni evaluación de terceros.
- **Sin benchmarks**: no hay métricas reproducibles de VQAv2, TextVQA, POPE ni MMLU que permitan situar su calidad real frente a alternativas.
- **Riesgo de alucinación**: el propio autor admite que el modelo necesita diagnósticos anti-atajos textuales, lo que indica que puede responder sin mirar la imagen; en producción requiere validación humana, especialmente en extracción de cifras o datos de documentos.
- **Encoder congelado**: no se adapta a dominios alejados del preentrenamiento de SigLIP 2 (imagen médica, satelital, industrial especializada), y el corte en la capa -2 del ViT descarta las capas finales del encoder original.
- **Resolución fija de 384 px**: insuficiente para lectura de texto pequeño o inspección de detalle fino sin preprocesado adicional.
- **Licencia**: Llama 3.2 Community License impone la política de uso aceptable de Meta, obligación de atribución ("Built with Llama") y condiciones específicas de redistribución; conviene revisarla antes de un uso comercial.
- **Despliegue no estandarizado**: sin pesos GGUF ni soporte de vLLM/TGI documentado, la puesta en producción exige mantener el código de modelado personalizado del repositorio, lo que añade deuda técnica y riesgo de incompatibilidad con futuras versiones de transformers o PyTorch.
- **Trazabilidad del conector**: con solo 6,3 M parámetros entrenados sobre 558 K pares y 1,4 M muestras de instrucciones, la alineación multimodal depende de muy poca capacidad ajustable, lo que puede limitar generalización a preguntas complejas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ankushthakurr09/Mimanus-VLM-M1_v1
- Modelo base de lenguaje: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Modelo base visual: https://huggingface.co/google/siglip2-large-patch16-384
- Paper, blog técnico, repositorio adicional o demo: no disponibles en la información proporcionada.
