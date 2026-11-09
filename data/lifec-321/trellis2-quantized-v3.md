# Lifec-321/trellis2-quantized-v3

## Resumen

TRELLIS.2 Quantized v3 es una versión cuantizada del modelo de imagen a 3D `microsoft/TRELLIS.2-4B`, publicada por el usuario independiente Lifec-321. El objetivo declarado es reducir el requisito de VRAM del pipeline original (que pide 24 GB) para hacerlo viable en GPUs de gama más baja. La cuantización se aplica únicamente a los cinco modelos de flujo (diffusion transformer) del pipeline, cada uno de 1,3 mil millones de parámetros, reduciendo su peso conjunto de 13,1 GB en BF16 a 5,37 GB en INT4/INT8. Los tres decodificadores se mantienen en FP16 sin modificar, y DINOv3 y el modelo de eliminación de fondo se descargan aparte en tiempo de ejecución.

El repositorio incluye además un script autónomo que ejecuta el pipeline completo de TRELLIS.2 de imagen a 3D (malla texturizada en `.glb`) usando los pesos cuantizados. La cuantización es de tipo post-entrenamiento, sin entrenamiento por gradientes, basada en GPTQ con escalado estilo AWQ y anchos de bit mixtos (INT8 para proyecciones de atención, INT4 para MLP con excepciones sensibles).

Se trata de una publicación temprana ("early release"): el autor indica que solo se ha probado en GPUs NVIDIA L4 en la nube (23 GB) y que las pruebas en tarjetas consumer reales (RTX 3060/3080, equipos con 16 GB de RAM) están en curso. La model card incluye correcciones explícitas sobre afirmaciones erróneas de versiones anteriores (pérdida de calidad cero, LPIPS 0.089, exportación a `.ply`). La licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (flow models) sobre pipeline TRELLIS.2; 5 modelos de flujo de 1,3B parámetros cada uno + 3 decodificadores |
| Parámetros totales | 5 modelos de flujo × 1,3B = 6,5B (solo los flujos); decodificadores no disponibles en la información |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen a 3D, no de texto) |
| Tipos de cuantización | GPTQ INT4/INT8 mixto: INT8 en proyecciones de atención (`to_qkv`, `to_out`, `cross_attn.to_q/to_kv/to_out`), INT4 en MLP, 10 capas MLP sensibles por modelo elevadas a INT8; group size 64; pesos empaquetados y dequantizados a FP16 en GPU en tiempo de ejecución |
| Idiomas soportados | no disponible (no aplica: pipeline imagen a 3D) |
| Licencia | MIT |
| Formato de pesos | Pesos empaquetados (packed) del repositorio `trellis2`; decodificadores en FP16; salida del pipeline en `.glb` texturizado |

## Arquitectura y entrenamiento

El modelo base TRELLIS.2 es un pipeline de imagen a 3D compuesto por cinco modelos de flujo (diffusion transformer) especializados: `sparse_structure_flow_model`, `shape_slat_flow_model_512`, `shape_slat_flow_model_1024`, `tex_slat_flow_model_512` y `tex_slat_flow_model_1024`. Cada uno contiene 215 capas `nn.Linear` cuantizadas en esta versión. Los decodificadores, el embedder de timestep, las capas `adaLN_modulation` y las proyecciones de entrada/salida se mantienen en 16 bits.

La cuantización es post-entrenamiento, sin entrenamiento por gradientes: GPTQ capa por capa basado en Hessiano (group size 64, 1% de dampening, columnas procesadas en orden descendente de la diagonal del Hessiano), clipping óptimo en MSE por grupo (búsqueda en rejilla del 80-100% del mínimo/máximo) y escalado por canal estilo AWQ (fuerza 0,5, limitado a 0,5-2x) para proteger canales de entrada con alta activación. La calibración usó 10 imágenes y 5 pasos de denoising por modelo, con conjuntos de calibración y evaluación separados (sin solapamiento byte a byte, aunque no se comprobó si había casi duplicados). Los scripts de cuantización no están incluidos en el repositorio; los ajustes provienen de `phase_3v3_quantize.py`. No hay kernel de cómputo INT4, por lo que el ahorro es de memoria, no de cómputo.

## Capacidades

- Generación de mallas 3D texturizadas a partir de una imagen de entrada (pipeline imagen a 3D), con exportación a `.glb` texturizado.
- Generación de nubes de puntos coloreadas (versión anterior del script; la actual exporta `.glb` con caras).
- Pipeline con renderizado PBR propio de TRELLIS.2 (usado para evaluación con LPIPS/SSIM/PSNR a 512 px con HDRI de estudio).
- Modo `1024_cascade` con 20 pasos de denoising (configuración de evaluación).
- Eliminación de fondo de la imagen de entrada mediante modelo externo descargado en tiempo de ejecución.
- Extracción de características de imagen mediante DINOv3 (descargado aparte en tiempo de ejecución).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso textual, capacidades multilingües ni modo thinking: es un modelo de imagen a 3D.

## Casos de uso

- Prototipado de assets 3D para videojuegos: generar mallas texturizadas en `.glb` a partir de concept art o capturas, integrables directamente en motores como Unity o Unreal tras conversión.
- Previsualización rápida de producto en comercio electrónico: convertir fotos de producto en modelos 3D texturizados para visores web, aprovechando que el pipeline exporta `.glb` con textura.
- Iteración de diseño industrial: generar variantes 3D de un objeto a partir de una imagen de referencia en GPUs de 23 GB (L4), reduciendo el coste frente al modelo FP16 original.
- Investigación en cuantización de diffusion transformers: el repositorio documenta metodología GPTQ + AWQ y métricas LPIPS frente a FP16, útil como referencia para estudiar el impacto de INT4/INT8 en modelos de flujo.
- Creación de contenido para realidad aumentada: generar mallas texturizadas de objetos cotidianos para su visualización en apps AR que acepten `.glb`.
- Evaluación comparativa de pipelines imagen a 3D: usar el script autónomo incluido para reproducir el pipeline TRELLIS.2 con pesos reducidos y comparar calidad frente a FP16 con el mismo seed.

## Benchmarks y rendimiento

Calidad medida por el autor frente a FP16, sobre 40 imágenes (seed 42, `1024_cascade`, 20 pasos), comparando cuatro vistas renderizadas con LPIPS (VGG), SSIM y PSNR:

| Métrica | Valor |
|---|---|
| LPIPS medio | 0,081 |
| LPIPS mediana | 0,063 |
| Peor imagen | 0,224 (rotación, no daño) |
| SSIM / PSNR medios | 0,887 / 25,2 dB |
| Imágenes con LPIPS < 0,05 / < 0,10 / < 0,15 / ≥ 0,15 | 16 / 25 / 35 / 5 (de 40) |

Control de variabilidad de FP16 consigo mismo al cambiar el seed (12 imágenes, seed 43 vs 42): LPIPS medio 0,1125 (mediana 0,093, máximo 0,233). v3 vs FP16 en esas mismas 12 imágenes: 0,0837; el error de v3 queda por debajo de la distancia seed-a-seed de FP16 en 9 de 12 imágenes y por encima en 3. Estudio ampliado en 4 imágenes y seeds 42/43/44:

| LPIPS medio | fáciles (2) | difíciles (2) | todas (4) |
|---|---|---|---|
| FP16 vs FP16, seeds distintos (3 pares) | 0,018-0,020 | 0,152-0,249 | 0,086-0,134 |
| v3 vs FP16, mismo seed (42/43/44) | 0,012 / 0,017 / 0,014 | 0,194 / 0,118 / 0,117 | 0,103 / 0,068 / 0,065 |
| v3 vs FP16, seeds distintos (3 pares) | 0,017-0,021 | 0,149-0,251 | 0,083-0,136 |
| v3 vs v3, seeds distintos (2 pares) | 0,016-0,021 | 0,216-0,219 | 0,116-0,120 |

El conjunto de 40 imágenes es propio (de 64; la ejecución produjo 40 resultados): imágenes de ejemplo de TRELLIS.2 y miniaturas web. El autor advierte que es pequeño y no es un benchmark estándar. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: el autor solo confirma pruebas en NVIDIA L4 (23 GB). El objetivo de funcionar por debajo de 24 GB está "parcialmente cumplido"; no se aportan cifras de VRAM mínima verificadas.
- Pesos: 5,37 GB para los cinco modelos de flujo cuantizados + 2,0 GB de decodificadores en FP16; repositorio completo de 7,43 GB.
- GPU recomendadas: NVIDIA L4 (23 GB) es la única plataforma probada. Las pruebas en RTX 3060/3080 y equipos con 16 GB de RAM están en curso; los resultados "consumer GPU" de la model card son límites simulados en la máquina L4, no mediciones reales.
- Cabe en GPU consumer: no confirmado; pendiente de validación en tarjetas de 12-16 GB.
- Opciones de despliegue: script autónomo incluido en el repositorio (librería `trellis2`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este pipeline).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lifec-321/trellis2-quantized-v3 | 5 flujos × 1,3B (INT4/INT8) | no aplica | LPIPS 0,081 vs FP16 (40 imágenes, conjunto propio) | MIT | Hugging Face, 194 descargas, 3 likes |
| microsoft/TRELLIS.2-4B (FP16/BF16) | 5 flujos × 1,3B | no aplica | Referencia (LPIPS 0 por definición) | no disponible en la información | Hugging Face (modelo base) |
| Otras alternativas imagen a 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Publicación temprana: solo probada en NVIDIA L4 (23 GB); el funcionamiento en GPUs consumer reales no está verificado.
- No hay kernel de cómputo INT4: los pesos se dequantizan a FP16 en GPU, por lo que se ahorra memoria pero no cómputo; la latencia no mejora necesariamente.
- La cuantización introduce diferencias medibles frente a FP16 (LPIPS medio 0,081; peor caso 0,224), aunque el autor argumenta que son del orden de la variabilidad seed-a-seed de FP16.
- El conjunto de evaluación es propio, pequeño (40 imágenes) y no estándar; los resultados no son directamente comparables con otros trabajos.
- Los scripts de cuantización no están incluidos en el repositorio; la reproducibilidad completa no está garantizada.
- DINOv3 y el modelo de eliminación de fondo no se incluyen y se descargan de sus propios repositorios en tiempo de ejecución, con licencias independientes que deben revisarse.
- La model card corrige afirmaciones erróneas de versiones anteriores ("zero quality loss", LPIPS 0,089, exportación a `.ply`); conviene desconfiar de citas de versiones previas.
- No se comprobó si había casi duplicados entre calibración y evaluación.
- Riesgo de alucinación geométrica inherente a los modelos generativos 3D: la malla generada puede no corresponder fielmente al objeto de entrada, especialmente en vistas no observadas.
- Licencia MIT para este repositorio, pero sujeta a las condiciones del modelo base `microsoft/TRELLIS.2-4B` y de los modelos externos descargados en tiempo de ejecución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lifec-321/trellis2-quantized-v3
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
- Script de cuantización citado: `phase_3v3_quantize.py` (no incluido en el repositorio)
- Imagen comparativa FP16 vs v3: `assets/comparison.jpg` (dentro del repositorio)
- DINOv3 y modelo de eliminación de fondo: descargados de sus propios repositorios en tiempo de ejecución (URL no especificada en la información disponible)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada
