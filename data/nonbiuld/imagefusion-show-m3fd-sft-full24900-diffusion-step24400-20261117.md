# Nonbiuld/ImageFusion-Show-M3FD-SFT-full24900-diffusion-step24400-20261117

## Resumen

ImageFusion-Show M3FD es un checkpoint de entrenamiento de un modelo de fusión de imágenes multimodales (infrarrojo y visible) construido sobre el modelo generativo Show-o2 de 1.5B parámetros. Lo desarrolla el usuario Nonbiuld y se distribuye como snapshot intermedio de una fase de ajuste fino sobre el dataset M3FD. El modelo combina un transformer autorregresivo congelado con cabezas de difusión entrenables que operan mediante flow matching, de modo que la generación de la imagen fusionada se realiza por integración de un campo de flujo condicionado por las modalidades de entrada.

El interés de esta ficha es acotado: no se trata de un modelo listo para producción, sino de un artefacto de investigación publicado a petición del autor mientras el entrenamiento seguía en curso. El snapshot corresponde a 24.400 actualizaciones del optimizador, aproximadamente 28,44 de las 30 épocas de difusión previstas, e incluye estado del optimizador y del planificador, por lo que su tamaño (18,33 GB) es mayor que el de los pesos puros.

La relevancia ahora mismo es metodológica: documenta un enfoque de fusión de imágenes que congela el backbone generativo y entrena únicamente tres módulos de difusión (`diff_proj`, `diffusion_head_a`, `diffusion_head_b`) con pérdida de flow matching y pesos 1:1:1 entre IR, VIS y fusión. No hay evaluación agregada sobre conjuntos held-out ni benchmarks publicados para este paso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (Show-o2) con cabezas de difusión por flow matching; VAE Wan2.1 para el espacio latente |
| Parametros totales | 1,5B (modelo base show-o2-1.5B-HQ); número exacto de parámetros del checkpoint no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión original, sin conversión) |
| Idiomas soportados | no disponible (modelo de visión/fusión de imágenes) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pt`), 18.330.596.908 bytes, SHA256 `b3a181d85bb02c5f29f50ae2379a400ddb7278319f45228afd116c4d99f29414` |

## Arquitectura y entrenamiento

El modelo parte de `showlab/show-o2-1.5B-HQ` (revisión fijada `45a5a2de01d1ebd10cd5864d29310a76476cdf23`), un transformer multimodal que combina generación autorregresiva de tokens con un decodificador de difusión. En esta fase de ajuste fino los módulos autorregresivos y los compartidos están congelados; solo se entrenan `diff_proj`, `diffusion_head_a` y `diffusion_head_b`, es decir, 139 tensores de los 910 totales del estado del modelo. La supervisión se realiza exclusivamente con pérdida de flow matching, con pesos 1:1:1 para las ramas infrarroja (IR), visible (VIS) y fusión.

El entrenamiento se ejecutó sobre siete GPUs con batch size 1 por GPU y acumulación de gradientes 1, lo que da un batch global de 7. Se mantuvieron la atención SDPA original y las imágenes rectangulares nativas, sin redimensionado a cuadrado. El VAE Wan2.1 y el tokenizador se cargan por separado desde el proyecto. Las referencias de supervisión para la fusión son pseudo-referencias generadas con LRRNet. El checkpoint contiene estado del optimizador para los 139 tensores entrenables, estado del planificador, RNG de los siete rangos y metadatos de entrenamiento, pero no momentos del optimizador para los parámetros congelados, lo que explica su tamaño inferior al de un checkpoint de entrenamiento completo.

## Capacidades

- Fusión de imágenes infrarrojas y visibles en una única imagen de salida, generada por muestreo de difusión con flow matching.
- Procesamiento de pares de imágenes de entrada con modalidades IR y VIS tratadas por ramas separadas (`diffusion_head_a` y `diffusion_head_b`).
- Manejo de imágenes rectangulares nativas sin recorte ni redimensionado a cuadrado.
- Generación condicionada por el backbone autorregresivo de Show-o2, aunque este permanece congelado en esta fase.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, texto, audio ni thinking mode; el modelo está orientado exclusivamente a la tarea de fusión de imágenes.
- Capacidades multilingües: no aplica ni están documentadas.

## Casos de uso

- Investigación en fusión de imágenes multimodales: el checkpoint sirve como referencia reproducible de un estado intermedio de entrenamiento con flow matching, útil para comparar curvas de convergencia frente a pasos anteriores (por ejemplo, step8600 o step24100).
- Vigilancia y percepción nocturna: la combinación de información térmica (IR) y detalle textural (VIS) permite generar imágenes fusionadas que conservan objetos calientes y estructura de la escena, un caso típico del dataset M3FD.
- Conducción asistida y percepción en condiciones adversas: la fusión IR/VIS ayuda a mantener la detección de peatones y vehículos con poca luz o niebla, donde el visible por sí solo pierde contraste.
- Inspección industrial y monitorización remota: la salida fusionada puede alimentar pipelines de detección de anomalías térmicas sobre infraestructura, combinando la firma térmica con la textura visible.
- Robótica y sistemas embarcados de percepción: al derivar de un modelo de 1,5B con solo tres módulos entrenables, es viable experimentar con despliegue en GPUs de gama media para prototipos de fusión en tiempo casi real.
- Reproducción de experimentos y ablaciones: dado que el checkpoint incluye estado del optimizador y del planificador, permite reanudar el entrenamiento y estudiar el efecto de los pesos 1:1:1 entre modalidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks agregados para este snapshot en la información disponible. La model card únicamente recoge una evaluación cualitativa y cuantitativa parcial del paso de difusión 24100 sobre la escena 00000, que aparece en el conjunto de entrenamiento, con entradas originales y degradadas C09:

| Comparación | Resultado reportado |
|---|---|
| step24100 frente a step8600 (5 de 6 casos modalidad/condición) | mejora en PSNR y SSIM |
| IR con entrada original (step24100) | empeora ligeramente; ~80 píxeles de desplazamiento hacia abajo y costura en el borde superior |
| Alcance | una sola escena, no agregado held-out, no constituye aceptación de calidad |

Estos datos no deben interpretarse como rendimiento general del modelo ni del paso 24400, que no ha sido evaluado de forma separada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint pesa 18,33 GB e incluye estado del optimizador, por lo que la inferencia requiere cargar solo los pesos del modelo y el VAE Wan2.1 por separado.
- GPU recomendadas: el entrenamiento se realizó en siete GPUs con batch 1 por GPU; no se especifica el modelo de GPU. Para inferencia se requiere al menos una GPU con memoria suficiente para el backbone de 1,5B más el VAE y las cabezas de difusión.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de 1,5B en precisión completa (FP32) ronda los 6 GB solo en pesos, más el VAE y activaciones; en FP16/bf16 podría caber en GPUs de 24 GB, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor indica explícitamente que se debe usar el código de carga e inferencia del proyecto ImageFusion-Show y que no es un export de Transformers `from_pretrained`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos de fusión de imágenes en la información proporcionada. Como referencia estructural, el modelo se apoya en `showlab/show-o2-1.5B-HQ` (1,5B parámetros, mismo backbone), pero no se han publicado comparaciones de rendimiento frente a alternativas de fusión IR/VIS.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ImageFusion-Show M3FD (este) | 1,5B (base) | no disponible | no disponible | PyTorch `.pt` | Hugging Face, 0 descargas |
| showlab/show-o2-1.5B-HQ | 1,5B | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Alternativas de fusión IR/VIS | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Snapshot intermedio: el entrenamiento seguía en curso al subir el checkpoint; no es el modelo final de 30 épocas.
- Sin evaluación separada del paso 24400; los únicos datos disponibles corresponden al paso 24100 y a una sola escena del conjunto de entrenamiento.
- Las referencias de supervisión son pseudo-referencias de LRRNet, no ground truth real, lo que introduce sesgo en la señal de entrenamiento.
- Se observa un desplazamiento de aproximadamente 80 píxeles hacia abajo y una costura superior en la rama IR con entrada original, lo que indica artefactos de alineación no resueltos.
- Licencia no especificada: no se puede garantizar uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Formato no estándar: requiere el código del proyecto ImageFusion-Show; no es cargable con `from_pretrained` de Transformers.
- Riesgo de alucinación visual: al ser un modelo generativo de difusión, puede inventar texturas o detalles no presentes en las entradas, especialmente en regiones con poca información térmica o visible.
- Idiomas y contexto textual: no documentados; el modelo no está pensado para tareas de texto.
- Sin métricas de latencia ni de throughput publicadas, lo que impide estimar su viabilidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Nonbiuld/ImageFusion-Show-M3FD-SFT-full24900-diffusion-step24400-20261117
- Checkpoint de inicialización (M3FD full step24900): https://huggingface.co/Nonbiuld/ImageFusion-Show-M3FD-SFT-full-step24900-20261115
- Repositorio del proyecto (código de carga e inferencia): https://github.com/Reborn986/ImageFusion-Show
- Modelo base: https://huggingface.co/showlab/show-o2-1.5B-HQ
