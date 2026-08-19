# brentonsopko/pp-krea-product

## Resumen

Este repositorio contiene un subconjunto privado del modelo Krea 2 de Comfy-Org, empaquetado especificamente para el producto "Personal Paw collar generate" y desplegado como overlay de modelo cacheado en Runpod. Incluye unicamente los tres archivos necesarios para la generacion de imagenes: el modelo de difusion turbo en FP8, el codificador de texto Qwen3-VL de 4B y el VAE de imagen de Qwen.

Krea 2 es un modelo de generacion de imagenes por difusion desarrollado por Krea, una suite creativa de IA para imagenes, video y 3D. La variante "turbo" esta destilada para inferencia acelerada, y la cuantizacion FP8 reduce el uso de memoria. Este subconjunto pesa 18.6 GB, frente a los 147 GB del repositorio completo, lo que permite descargas mas rapidas en entornos de despliegue como Runpod.

La relevancia de este repositorio radica en su enfoque practico: en lugar de descargar el repositorio completo de Krea 2, los desarrolladores que necesiten solo la generacion de imagenes pueden usar este subconjunto optimizado, que mantiene la licencia comunitaria de Krea 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion latente (variante turbo) con codificador de texto Qwen3-VL 4B y VAE de imagen Qwen |
| Parametros totales | No disponible (el codificador de texto tiene 4B parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (escalado) |
| Idiomas soportados | No disponible |
| Licencia | Krea 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusion latente con tres componentes principales: un modelo de difusion turbo (destilado para acelerar la inferencia), un codificador de texto basado en Qwen3-VL de 4B parametros, y un VAE de imagen de Qwen para la codificacion y decodificacion del espacio latente. El uso de un codificador de texto vision-lenguaje (Qwen3-VL) sugiere que el modelo puede interpretar prompts complejos con comprension semantica avanzada, aprovechando las capacidades multimodales del codificador.

La variante "turbo" implica un proceso de destilacion que reduce el numero de pasos de inferencia necesarios, lo que acelera la generacion de imagenes. La cuantizacion FP8 escalada reduce el uso de memoria y mejora la velocidad de inferencia en GPUs modernas con soporte para calculo de 8 bits.

Los detalles especificos del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de prompts de texto mediante difusion latente.
- Integracion nativa con ComfyUI, permitiendo construir pipelines de generacion visual mediante grafos de nodos.
- Inferencia acelerada gracias a la variante turbo, que reduce el numero de pasos de difusion necesarios.
- Cuantizacion FP8 para reducir requisitos de memoria y mejorar el rendimiento en GPUs compatibles.
- Comprension de prompts avanzada gracias al codificador Qwen3-VL de 4B, que aporta capacidad de razonamiento visual-semantico.
- Compatible con despliegue en Runpod como overlay de modelo cacheado, optimizando el tiempo de arranque en entornos cloud.

## Casos de uso

- Generacion de imagenes de producto personalizado: el modelo puede generar visualizaciones de collares personalizados para mascotas (el producto "Personal Paw collar generate"), permitiendo a los clientes previsualizar disenos antes de la compra.
- Integracion en flujos de trabajo ComfyUI: los desarrolladores pueden crear pipelines de generacion de imagenes personalizados usando los tres archivos incluidos, sin necesidad de descargar el repositorio completo de Krea 2 (147 GB).
- Despliegue en entornos cloud con arranque rapido: el tamano reducido (18.6 GB) facilita el despliegue en plataformas como Runpod, reduciendo el tiempo de descarga y el coste de almacenamiento en instancias efimeras.
- Prototipado rapido de aplicaciones de generacion de imagenes: los desarrolladores pueden integrar este modelo en aplicaciones web o moviles que requieran generacion de imagenes bajo demanda, gracias a la cuantizacion FP8 y la variante turbo.
- Generacion de variantes de diseno: el modelo puede producir multiples variaciones de un mismo diseno de producto, util para exploracion creativa en e-commerce y catalogos digitales.
- Personalizacion de productos en tiempo real: gracias a la variante turbo, el modelo puede generar imagenes personalizadas con baja latencia, adecuado para experiencias de usuario interactivas donde el cliente modifica parametros del diseno y recibe una visualizacion inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 18.6 GB en total. Con cuantizacion FP8, se estima que el modelo de difusion requiere entre 10 y 14 GB de VRAM, el codificador de texto unos 4 GB y el VAE menos de 1 GB. Se recomienda un minimo de 16 GB de VRAM para inferencia comoda.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB o 80 GB), H100 (80 GB).
- Compatibilidad con GPUs de consumo: si, una RTX 4090 o RTX 4080 pueden ejecutar el modelo sin problemas. GPUs con 12 GB o menos podrian requerir offloading de memoria o cuantizacion adicional.
- Opciones de despliegue: ComfyUI (soporte nativo), Runpod (overlay de modelo cacheado), y potencialmente otros frameworks de inferencia de difusion que soporten safetensors y FP8.
- Latencia y throughput: no disponible. La variante turbo sugiere una inferencia mas rapida que el modelo base, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Krea 2 (subconjunto) | No disponible (text encoder 4B) | FP8 | Krea 2 Community License | HuggingFace |
| SDXL | 3.5B | FP16, FP8, GGUF | CreativeML Open RAIL++-M | HuggingFace |
| FLUX.1 | 12B | FP8, GGUF | FLUX.1 dev Non-Commercial License | HuggingFace |
| SD 3.5 | 8B | FP8, GGUF | Stability AI Community License | HuggingFace |

Nota: la comparativa se basa en modelos de generacion de imagenes por difusion de categoria similar. No se dispone de datos de rendimiento comparativos entre estos modelos y Krea 2.

## Limitaciones y advertencias

- Licencia restrictiva: la Krea 2 Community License puede limitar el uso comercial. Es necesario revisar los terminos completos de la licencia antes de usar el modelo en produccion.
- Subconjunto parcial: este repositorio contiene solo tres archivos del modelo Krea 2 completo. No incluye funcionalidades adicionales que puedan existir en el repositorio original (como modelos de video, 3D, audio, etc.).
- Sin datos de entrenamiento: no se dispone de informacion sobre los datos de entrenamiento, por lo que no se pueden evaluar sesgos potenciales del modelo.
- Riesgo de alucinacion visual: como cualquier modelo de generacion de imagenes, puede producir artefactos o representaciones inexactas de objetos o escenas complejas.
- Sin soporte multilingue confirmado: los idiomas soportados no estan documentados en la informacion disponible.
- Repositorio privado: el modelo esta etiquetado como "private product-only subset", lo que sugiere que no esta destinado a uso publico general y podria retirarse sin previo aviso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brentonsopko/pp-krea-product
- Modelo original Krea 2: https://huggingface.co/Comfy-Org/Krea-2
- Sitio web de Krea: https://www.krea.ai/
- Biblioteca de modelos de Krea: https://www.krea.ai/models
