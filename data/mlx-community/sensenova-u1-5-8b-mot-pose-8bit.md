# mlx-community/SenseNova-U1.5-8B-MoT-pose-8bit

## Resumen

SenseNova-U1.5-8B-MoT-pose-8bit es un tier especializado en transferencia de pose del modelo multimodal unificado SenseNova-U1.5-8B-MoT, desarrollado por mlx-community para ejecución nativa en Apple Silicon mediante la librería MLX. Este artefacto fusiona el adaptador RefControl pose LoRA en el checkpoint base y lo cuantiza a 8 bits (grupo 64) en los dos flujos transformer, lo que permite re-posar a una persona de una foto de referencia siguiendo un esqueleto estilo OpenPose, manteniendo identidad, vestimenta y escena.

El modelo resuelve el problema de la edición de pose controlada en imágenes sin necesidad de difusión externa, integrando la capacidad directamente en un único checkpoint multimodal. Es relevante porque ofrece una alternativa de código abierto (Apache-2.0) para flujos de trabajo de edición de imagen en hardware Apple, con un rendimiento medido de 0,72 s/paso en un M5 Max. El modelo base, SenseNova-U1.5-8B-MoT, es un checkpoint nativo unificado de 8B parámetros (17.532.854.464 en total según los pesos reales) que combina generación de texto a imagen, edición, VQA y modo de pensamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify (multimodal unificado, flujos separados para generación y comprensión) |
| Parametros totales | 17.532.854.464 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (grupo 64) en los dos flujos transformer; también existe tier bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base SenseNova-U1.5-8B-MoT se construye sobre la arquitectura NEO-unify, que unifica generación y comprensión multimodal en un solo transformer con flujos separados (los tensores `*_mot_gen` corresponden al flujo de generación). El adaptador RefControl pose LoRA v1 se entrenó durante 3000 pasos con rank 32 y alpha 32, sobre tripletas (esqueleto, referencia, objetivo) usando datos de Wikimedia Commons (CC-BY / CC-BY-SA) y Pexels. La fusión se realizó en fp32 como `W += (alpha/rank)·BA` y se casteó de vuelta, afectando a 294 proyecciones del flujo de generación. El artefacto final se obtuvo mediante `sensenova-cli --weights  --lora <adapter> --quant 8 --convert <out>`, y la verificación confirma que solo difieren los 294 tensores objetivo (pesos, escalas y sesgos) respecto al artefacto 8-bit sin adaptador.

## Capacidades

- Transferencia de pose: re-posa a la persona de una imagen de referencia siguiendo un esqueleto OpenPose, preservando identidad, ropa y escena.
- Edición de imagen con dos referencias: el orden de las imágenes es crítico (imagen 1 = esqueleto, imagen 2 = apariencia).
- Texto a imagen: el flujo de generación sigue funcionando, aunque está sesgado hacia pose.
- Modo de pensamiento (think mode): disponible en los pesos, según la model card.
- Visual question answering (VQA): el modelo conserva esta capacidad multimodal.
- Generación nativa 4K: el modelo base reporta soporte para generación en alta resolución (según la documentación oficial).

## Casos de uso

- Edición de fotografía de moda: un diseñador puede re-posar a un modelo en una prenda concreta usando un esqueleto de referencia, manteniendo la textura y el ajuste de la ropa, sin necesidad de sesiones fotográficas adicionales.
- Creación de contenido para redes sociales: influencers y creadores pueden ajustar la pose de una foto existente para adaptarla a diferentes formatos o composiciones, manteniendo su identidad visual.
- Diseño de personajes para animación: los artistas pueden generar variaciones de pose de un personaje a partir de una única ilustración de referencia, acelerando el proceso de concept art.
- Restauración y reencuadre de fotos históricas: se puede re-posar a personas en fotografías antiguas para corregir posturas o adaptarlas a nuevos encuadres, preservando el estilo original.
- Prototipado de storyboards: los cineastas pueden generar rápidamente diferentes poses de actores para planificar escenas, usando esqueletos simples como entrada.
- Automatización de catálogos de producto: en comercio electrónico, se puede re-posar a un maniquí o modelo en diferentes poses para mostrar prendas desde ángulos variados, reduciendo costes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta rendimiento de inferencia en hardware Apple:

| Metrica | Valor |
|---|---|
| Edición 768² con dos referencias, 28 pasos, cfg 4 (M5 Max) | 20,2 s (0,72 s/paso) |
| Pico de memoria | 22,5 GB |
| Memoria residente tras carga | 19,0 GB |
| Carga del artefacto | 2,6 s |

## Requisitos de hardware

- VRAM estimada: 22,5 GB de pico en M5 Max, lo que sugiere que se necesita al menos 32 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon (M-series), específicamente M5 Max según las pruebas reportadas; no se indica soporte para GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: solo Apple Silicon; no cabe en GPUs de consumo convencionales (RTX, etc.) porque el formato MLX es específico de Apple.
- Opciones de despliegue: mediante `sensenova-cli` (CLI) o el wrapper `MLXEngine` en Swift, ambos del paquete `sensenova-u1-swift`.
- Latencia y throughput: 0,72 s/paso en M5 Max para 768², con 28 pasos totales (20,2 s por edición completa).

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables específicos para transferencia de pose en el ecosistema MLX con licencia Apache-2.0. Alternativas generales de edición de pose (como ControlNet) no son directamente comparables por su arquitectura y requisitos de hardware.

## Limitaciones y advertencias

- Sesgo de pose: el flujo de generación está sesgado hacia la transferencia de pose; para generación de texto a imagen pura se recomienda usar los tiers base.
- Orden de referencias: el modelo exige un orden estricto de las imágenes de entrada; invertirlo produce resultados incorrectos (reproduce la pose de la imagen de apariencia).
- Datos de entrenamiento: los datos provienen de Wikimedia Commons y Pexels, con licencias CC-BY/CC-BY-SA y Pexels; aunque permisivos, no se redistribuyen los frames originales.
- Alucinación visual: como todo modelo generativo, puede producir artefactos o detalles inconsistentes en regiones complejas (manos, texturas).
- Idioma: no se especifican idiomas soportados; la interfaz de prompts parece estar en inglés (según los ejemplos).
- Hardware limitado: solo funciona en Apple Silicon con MLX; no es portable a otros entornos sin conversión adicional.
- Estado del artefacto: es un merge de checkpoint, no una destilación; la verificación confirma que solo difieren los tensores del adaptador, pero el rendimiento en tareas no relacionadas con pose puede verse afectado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-pose-8bit
- Modelo base en HuggingFace: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Colección MLX de SenseNova-U1.5-8B-MoT: https://huggingface.co/collections/mlx-community/sensenova-u15-8b-mot-mlx
- Repositorio GitHub de SenseNova-U1: https://github.com/OpenSenseNova/SenseNova-U1
- Página en Papers with Code: https://paperswithcode.co/paper/109749
- Modelo en ModelScope: https://www.modelscope.cn/models/SenseNova/SenseNova-U1.5-8B-MoT
