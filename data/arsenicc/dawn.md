# Arsenicc/DAWN

## Resumen

DAWN (Day thermal to RGB for drone imagery) es un modelo de imagen a imagen especializado en la conversión de imágenes térmicas diurnas a RGB para fotogrametría con drones. Lo desarrolla el autor independiente Arsenicc y se publica bajo licencia MIT en HuggingFace, con el código asociado en el repositorio GitHub `rzx01/dawn`. El modelo resuelve un problema concreto: la información térmica no captura pintura, texto ni marcas viales, por lo que la colorización reconstruye color plausible a partir de la intensidad térmica, aceptando explícitamente la invención de detalle no observable.

Técnicamente no es un transformer generativo al uso, sino un pipeline híbrido: un codificador DINOv3 ViT-S+ (congelado, con adaptadores LoRA afinados), un transformer de velocidad para flow matching, una cabeza de color y un refiner local opcional de 2.545 parámetros que ajusta únicamente el canal L\*. La salida se ensambla en espacio de color CIELAB y se acompaña de mapas de incertidumbre de brillo y color.

Es relevante para investigadores y desarrolladores que trabajan con pares térmico-RGB en visión aérea, ya que ofrece checkpoints reproducibles con métricas publicadas (20,05 dB PSNR en L\* y 8,31 CIEDE2000 en el split de test) y un rendimiento de unos 40 FPS con K = 8 muestras en una RTX 5090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: DINOv3 ViT-S+ con LoRA + transformer de velocidad (flow matching) + cabeza de color + refiner local opcional |
| Parametros totales | No disponible (el repo pesa 0,1 GB; el refiner de etapa 2 tiene 2.545 parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de imagen 640x512, 1 canal; entrada del codificador 512x640) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de imagen, no lingüístico) |
| Licencia | MIT (checkpoints y código); DINOv3 tiene su propia licencia con acceso restringido |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo se organiza en dos etapas. La etapa 1 (`stage1/flow_best.pt`, paso 18.000 con EMA) contiene los adaptadores LoRA, el transformer de velocidad, la cabeza de color y el estado del optimizador. El brillo se modela como una curva por región de la intensidad térmica, mientras que el color se genera mediante flow matching condicionado en un DINOv3 ViT-S+ afinado con LoRA; la salida final se ensambla en CIELAB. La etapa 2 (`stage2/refiner_best.pt`) es un refiner local opcional de 2.545 parámetros que solo refina el canal L\*.

Los checkpoints no incluyen los pesos base de DINOv3, solo los adaptadores LoRA: es necesario aceptar la licencia del modelo `facebook/dinov3-vits16plus-pretrain-lvd1689m` y configurar `HF_TOKEN` para usarlos. El entrenamiento se realizó sobre pares diurnos de DroneVehicle que superan un filtro estricto de alineación por cajas, resultando en 3.662 pares de entrenamiento. No se menciona en la información disponible el uso de RLHF, DPO ni el número total de tokens o pasos de entrenamiento más allá del paso 18.000 seleccionado.

## Capacidades

- Conversión de imagen térmica diurna (640x512, un canal) a imagen RGB.
- Generación de mapas de incertidumbre de brillo y de color junto a la salida.
- Reconstrucción de color plausible mediante flow matching condicionado en DINOv3.
- Refinado opcional del canal de luminancia L\* con la etapa 2.
- Salida en espacio de color CIELAB.
- Inferencia por lotes sobre directorios de frames (`--input frames/`).
- No soporta tool calling, agentes, texto, audio ni razonamiento multi-paso.

## Casos de uso

- Generación de ortofotos RGB a partir de vuelos térmicos de dron: el modelo convierte cada frame térmico diurno en RGB, permitiendo obtener cartografía visual cuando solo se dispone de sensor térmico.
- Aumento de datasets multimodales: se pueden crear pares térmico-RGB sintéticos para entrenar otros modelos de fusión de sensores, aceptando que el detalle inventado no es fiable para etiquetado fino.
- Inspección de infraestructuras con drones: la salida RGB facilita la interpretación visual humana de anomalías térmicas en cubiertas, paneles solares o líneas eléctricas.
- Visualización y presentación de resultados: los mapas de incertidumbre permiten indicar al analista qué regiones del color son fiables y cuáles son invención del modelo.
- Preprocesado en pipelines de percepción aérea: el refiner de L\* puede mejorar la coherencia de luminancia antes de etapas posteriores de detección o segmentación.
- Investigación en colorización condicionada: el par flow matching + DINOv3 con LoRA sirve como referencia reproducible para experimentos de traducción entre modalidades con métricas CIEDE2000.

## Benchmarks y rendimiento

| Metrica | Valor | Techo de referencia |
|---|---|---|
| PSNR en L\* (test, 781 pares, NFE 2, K = 8) | 20,05 dB | 25,13 dB |
| CIEDE2000 (test, 781 pares, NFE 2, K = 8) | 8,31 | 3,25 |
| Mejora del refiner (rejilla de brillo ajustada, validación) | +0,070 dB | No disponible |
| Rendimiento en RTX 5090 (K = 8) | ~40 FPS | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo pesa 0,1 GB sin contar los pesos base de DINOv3 ViT-S+, que deben descargarse aparte.
- GPU recomendadas: RTX 5090 medida a ~40 FPS con K = 8; no se especifican otras GPU.
- Compatibilidad con GPU de consumo: probable por el tamaño reducido del modelo, pero no confirmada en la información disponible.
- Opciones de despliegue: scripts de inferencia del repositorio (`scripts/infer.py`) con PyTorch y CUDA; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~40 FPS en RTX 5090 con K = 8 muestras y NFE 2.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de colorización térmica a RGB para imágenes de dron.

## Limitaciones y advertencias

- El modelo inventa detalle que la térmica no puede observar (pintura, texto, marcas viales); no es apto para reconstrucción fiel de escenas.
- Los checkpoints están ligados a la resolución de entrenamiento (entrada del codificador 512x640) y al layout de tokens; la carga verifica ambos y falla si no coinciden.
- Requiere aceptar la licencia de DINOv3 y configurar `HF_TOKEN`; los pesos base no se incluyen en el repo.
- Entrenado únicamente con pares diurnos de DroneVehicle filtrados (3.662 pares); el rendimiento fuera de ese dominio (nocturno, otras cámaras, otras altitudes) no está evaluado.
- El refiner de etapa 2 solo se evaluó en la rejilla de brillo ajustada y no forma parte de las métricas principales.
- No se han publicado evaluaciones de sesgo, robustez ni comportamiento en producción más allá de las métricas del split de test.
- Licencia MIT para código y checkpoints, pero los términos del dataset DroneVehicle son propios y no se incluyen imágenes ni etiquetas.

## Enlaces

- HuggingFace: https://huggingface.co/Arsenicc/DAWN
- Repositorio GitHub: https://github.com/rzx01/dawn
- Resultados del proyecto: https://github.com/rzx01/dawn#5-results
- DINOv3 base (acceso restringido): https://huggingface.co/facebook/dinov3-vits16plus-pretrain-lvd1689m
- Dataset DroneVehicle: https://huggingface.co/datasets/McCheng/DroneVehicle
