# musharna/orchid-clip-v8

## Resumen

orchid-clip-v8 es un modelo de visión-lenguaje de tipo CLIP especializado en orquídeas, desarrollado por el autor independiente musharna. Se trata de un fine-tune de BioCLIP 2 (ViT-L/14) sobre un corpus de 1,14 millones de imágenes que cubren 5.124 especies de orquídeas, con un mínimo de tres imágenes por especie tras la deduplicación de sinónimos según WCVP y un filtro de calidad basado en similitud coseno. El modelo produce características de 768 dimensiones normalizadas en L2 y se distribuye en formato open_clip.

El problema que aborda es la clasificación fina y el sesgo de cola larga en un dominio botánico muy concreto: muchas especies de orquídeas tienen pocas imágenes disponibles y los modelos generalistas como BioCLIP 2 rinden peor en géneros poco representados (Pleurothallidinae, *Bulbophyllum*, *Maxillaria*). orchid-clip-v8 aplica un muestreo con peso inverso a la raíz cuadrada del número de imágenes por clase y una deduplicación taxonómica, lo que mejora de forma notable la precisión macro-promedio en esos géneros.

El modelo no es un generador de texto ni un asistente conversacional: es un extractor de características y un clasificador zero-shot de imágenes. Su relevancia actual radica en que sirve como base para tareas downstream donde no existe un modelo preentrenado específico (estadio de floración, detección de enfermedades, identificación de estilo de cultivo, recuperación por vecino más cercano o etiquetado activo de especies con pocas imágenes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP con backbone ViT-L/14 (torre de imagen y torre de texto) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa texto largo) |
| Tipos de cuantización | no disponible (pesos en formato PyTorch de precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`open_clip_pytorch_model.bin`, 1,6 GB) y `model_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un CLIP estándar con codificador de imagen ViT-L/14 y codificador de texto, ambos fine-tuneados desde BioCLIP 2. La salida es un vector de 768 dimensiones normalizado en L2, apto para búsqueda por similitud coseno y clasificación zero-shot mediante prompts textuales. El state dict está envuelto bajo la clave `state["state_dict"]`, un detalle relevante para la carga con open_clip.

El entrenamiento parte de un pool de 1,14 millones de imágenes de 5.124 especies, construido con filas remapeadas a WCVP, filtro de subfamilia de orquídeas, umbral de `quality_score ≥ 0,3`, un filtro de similitud coseno imagen-binomen de 0,727 (v6) y un mínimo de tres imágenes por especie. Se emplea un muestreo con peso inverso a la raíz cuadrada del número de imágenes por clase y un tope de 2.000 imágenes por especie. No se documentan fases de RLHF ni DPO, al no tratarse de un modelo generativo. La innovación principal es el tratamiento explícito de la cola larga mediante reponderación de clases y deduplicación taxonómica, aunque el autor señala que ninguno de estos componentes se ha ablacionado por separado.

## Capacidades

- Extracción de características visuales: genera embeddings de imagen de 768 dimensiones normalizados en L2.
- Clasificación zero-shot de imágenes mediante similitud con prompts textuales de nombres de especie o género.
- Clasificación fina de especies de orquídeas, con especial mejora en géneros de cola larga.
- Recuperación por vecino más cercano sobre colecciones cultivadas.
- Soporte para etiquetado activo de especies con pocas imágenes.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica, no es un modelo generativo de texto.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Identificación de género y especie en colecciones botánicas: el modelo actúa como clasificador zero-shot comparando el embedding de la imagen con prompts de nombres aceptados, con abstención a nivel de especie en la demo pública.
- Detección de estadio de floración: al ser un extractor de características congelado, se puede entrenar una cabeza lineal ligera sobre los embeddings para clasificar fases fenológicas sin reentrenar el backbone.
- Detección de enfermedades en orquídeas: los embeddings sirven como entrada a un clasificador supervisado de síntomas foliares o radiculares, aprovechando la representación específica del dominio.
- Identificación de estilo de cultivo o montaje: clasificación de imágenes según la técnica de cultivo (maceta, montaje en corcho, etc.) mediante una cabeza entrenada sobre las características extraídas.
- Recuperación por vecino más cercano en una colección cultivada: indexación de los embeddings de 768 dimensiones en una base vectorial para buscar visualmente especímenes similares en catálogos privados.
- Etiquetado activo de especies con pocas imágenes: uso del modelo para priorizar qué imágenes sin etiquetar revisar manualmente, reduciendo el coste de anotación en especies raras.
- Filtrado y curación de datasets botánicos: descarte automático de imágenes cuya similitud con su etiqueta declarada sea baja, replicando el filtro coseno usado en el entrenamiento.

## Benchmarks y rendimiento

Evaluación sobre un holdout limpio de n=4.000 imágenes y 547 especies, con partición por hash de `md5(source_id)` al 2 % (aleatoria y sin fuga, pero no estratificada ni balanceada por clase):

| Modelo | top-1 | top-5 | genus-top-1 |
|---|---|---|---|
| BioCLIP 2 | 0,873 | 0,978 | 0,992 |
| orchid-clip-v8 | 0,911 | 0,986 | 0,991 |

Precisión top-1 por género (orchid-clip-v8 frente a BioCLIP 2):

| Género | n | v8 | BioCLIP 2 | Δ |
|---|---|---|---|---|
| Ophrys | 2754 | 0,933 | 0,905 | +2,8 pp |
| Habenaria | 232 | 0,922 | 0,845 | +7,7 pp |
| Dendrobium | 161 | 0,919 | 0,907 | +1,2 pp |
| Prosthechea | 145 | 0,890 | 0,855 | +3,5 pp |
| Encyclia | 101 | 0,832 | 0,842 | −1,0 pp |
| Pleurothallis | 100 | 0,800 | 0,690 | +11,0 pp |
| Cymbidium | 99 | 0,879 | 0,939 | −6,0 pp |
| Maxillaria | 94 | 0,787 | 0,649 | +13,8 pp |
| Masdevallia | 64 | 0,859 | 0,781 | +7,8 pp |
| Oncidium | 57 | 0,860 | 0,825 | +3,5 pp |
| Bulbophyllum | 41 | 0,732 | 0,585 | +14,6 pp |
| Lepanthes | 40 | 0,800 | 0,525 | +27,5 pp |
| Stelis | 25 | 0,640 | 0,400 | +24,0 pp |
| Laelia | 24 | 0,958 | 1,000 | −4,2 pp |

El promedio macro de top-1 por especie sobre los 14 géneros de la tabla (una voz por género) pasa de 0,768 a 0,844, una mejora de +7,6 pp, el doble que el +3,8 pp del promedio por imagen. La discrepancia se debe a que el holdout no está balanceado: *Ophrys* representa 2.754 de las 4.000 imágenes y es el género que menos mejora. Las mayores ganancias se concentran en géneros con pocas imágenes (*Lepanthes*, *Stelis*, *Pleurothallis*, *Bulbophyllum*, *Maxillaria*); tres géneros bien representados retroceden (*Cymbidium* −6,0 pp, *Laelia* −4,2 pp, *Encyclia* −1,0 pp).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en precisión completa para los pesos de 1,6 GB, más el coste de activaciones según el tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100 o H100 no son necesarias para inferencia individual, aunque aceleran el procesamiento por lotes.
- Compatible con GPU de consumo: sí, cabe en RTX 3060, RTX 4060, RTX 4090 y similares; también funciona en CPU, con mayor latencia.
- Opciones de despliegue: `open_clip_torch` (probado con `open_clip_torch>=2.24` y `torch>=2.0`), con soporte CUDA opcional. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (top-1 holdout) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| orchid-clip-v8 | no disponible (ViT-L/14) | no aplica | 0,911 | MIT | Hugging Face |
| BioCLIP 2 | no disponible (ViT-L/14) | no aplica | 0,873 | no disponible | Hugging Face (imageomics/bioclip-2) |
| orchid-clip-v9cw05 | no disponible (BioCLIP 2.5 ViT-H/14) | no aplica | no disponible (combinado con v8 eleva el top-1 de especie de 0,71 a 0,74 en la demo) | no disponible | Hugging Face (musharna/orchid-clip-v9cw05) |

La comparación directa con BioCLIP 2 es la más relevante, ya que es el modelo base y comparte backbone. orchid-clip-v9cw05 es un fine-tune posterior sobre un backbone mayor (ViT-H/14) del mismo autor, usado conjuntamente con v8 en la demo pública.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está especializado exclusivamente en orquídeas; su uso fuera de ese dominio no está validado.
- El holdout de evaluación no está estratificado ni balanceado por clase, por lo que las métricas por imagen están dominadas por *Ophrys*; para evaluar la cola larga debe leerse el promedio macro por género.
- Regresión documentada en tres géneros bien representados (*Cymbidium*, *Laelia*, *Encyclia*), lo que indica que no mejora de forma uniforme.
- No se han realizado ablaciones de los componentes del entrenamiento (muestreo inverso a la raíz cuadrada, deduplicación WCVP), por lo que la causa de las mejoras no está aislada.
- Riesgo de sesgo derivado de la composición del corpus de entrenamiento y de la cobertura desigual por especie.
- El modelo solo está etiquetado para inglés; los prompts textuales deben formularse en ese idioma.
- Licencia MIT, que permite uso comercial, pero sin garantías del autor sobre el rendimiento en producción.
- El state dict está envuelto bajo `state["state_dict"]`; una carga ingenua con open_clip fallará si no se sigue el ejemplo del repositorio.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/musharna/orchid-clip-v8
- Modelo base BioCLIP 2: https://huggingface.co/imageomics/bioclip-2
- Modelo complementario orchid-clip-v9cw05: https://huggingface.co/musharna/orchid-clip-v9cw05
- Demo en vivo (identificación de género): https://huggingface.co/spaces/musharna/orchid-genus-id
- Write-up del proyecto: https://musharna.github.io/projects/OrchidCLIP/
- Código, harness de evaluación y generadores de visualizaciones: https://github.com/musharna/orchid-clip
