# mlx-community/VOSR2-fp16

## Resumen
VOSR2 es un modelo de superresolución generativa de un solo paso desarrollado por CSWRY y presentado en CVPR 2026. Se trata de un modelo "vision-only" que restaura y amplía imágenes mediante un transformer de difusión (LightningDiT) de 1.394 B de parámetros, un VAE 2D de Qwen-Image y un extractor de características DINOv2 ViT-L/14 truncado a los bloques 0-17. La versión aquí descrita, mlx-community/VOSR2-fp16, es una conversión a MLX en fp16 realizada por mlx-community para el port Swift xocialize/mlx-vosr-swift.

El modelo resuelve la superresolución de imágenes en un único paso, con factores de escala de ×1 a ×4, y está pensado para su despliegue en Apple Silicon mediante MLX. La conversión mantiene los pesos por tensor exactos respecto a los checkpoints originales de PyTorch y ofrece una variante int8 derivada en carga para las capas Lineales del DiT. Su relevancia actual radica en la disponibilidad de un modelo generativo de restauración de imagen optimizado para el ecosistema MLX y Swift, con licencia Apache-2.0.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LightningDiT (transformer de difusión) + VAE 2D de Qwen-Image + DINOv2 ViT-L/14 (bloques 0-17) |
| Parametros totales | 1.394 B en el transformer LightningDiT; total del conjunto no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | fp16 (publicado); int8 group-64 derivado en carga para las capas Lineales del DiT; fp32 en repo separado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformer_fp16.safetensors, vae_fp16.safetensors, dinov2_fp16.safetensors, config.json) |
| Resolucion de salida | 512² nativo; tiled 1024² |
| Factor de escala | ×1 a ×4 |

## Arquitectura y entrenamiento
La arquitectura combina tres componentes. El primero es un LightningDiT de 1.394 B de parámetros, un transformer de difusión con convolución de parches (O,kH,kW,I), capas `nn.Sequential` bajo `layers.N` y tablas RoPE conservadas. El segundo es un VAE 2D de Qwen-Image, con convoluciones (O,kH,kW,I) y RMSNorm2D con gamma comprimida a (C). El tercero es un DINOv2 ViT-L/14 del que solo se conservan los bloques 0-17, con `pos_embed` preinterpolado para una entrada de 448². La conversión a MLX fp16 se realizó desde los checkpoints originales de PyTorch de forma exacta por tensor, sin recuantización en la subida.

El entrenamiento subyacente de VOSR2 es de tipo generativo de un solo paso para superresolución. El corpus de entrenamiento no ha sido divulgado por los autores. No se dispone de información sobre el uso de RLHF, DPO ni otras técnicas de alineación. La innovación destacable es la naturaleza "vision-only" y de un solo paso, junto con la integración de características de DINOv2 y un VAE de Qwen-Image para la restauración de imagen.

## Capacidades
- Superresolución generativa de imágenes con factores de escala de ×1 a ×4.
- Restauración de imágenes de baja calidad o resolución.
- Funciona como "generative stills tier" dentro del motor MLXEngine (`imageUpscale`) del port Swift.
- Utiliza características de DINOv2 ViT-L/14 (bloques 0-17) para guiar la generación.
- Soporta procesamiento por tiles para salidas de 1024².
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no es un modelo de lenguaje).
- Capacidad especial: reescritura generativa que puede alterar letras en texto pequeño ya legible, por lo que se recomienda una guardia de legibilidad.

## Casos de uso
- Upscaling de fotografías en aplicaciones iOS/macOS: el modelo se integra mediante mlx-vosr-swift y MLXEngine, permitiendo ampliar imágenes de ×1 a ×4 en el dispositivo con Apple Silicon.
- Restauración de imágenes antiguas o de baja resolución: el carácter generativo y el uso de DINOv2 permiten reconstruir detalles finos en fotografías deterioradas.
- Generación de stills de alta resolución en flujos creativos: se puede emplear como paso final para aumentar la resolución de imágenes generadas por otros modelos.
- Procesamiento por tiles para imágenes grandes: con el modo tiled 1024² se pueden tratar imágenes de mayor tamaño manteniendo una alta fidelidad respecto a la referencia fp32.
- Integración en pipelines de visión por computador: sirve como preprocesado para mejorar la resolución de imágenes antes de tareas como detección o segmentación, siempre que no haya texto crítico.
- Investigación en superresolución generativa de un solo paso: el modelo y su conversión MLX facilitan experimentos reproducibles en hardware Apple.
- Despliegue en aplicaciones Swift nativas: el port xocialize/mlx-vosr-swift permite registrar el paquete y ejecutar solicitudes de upscaling directamente desde código Swift.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Se proporcionan métricas de paridad (PSNR) frente a la implementación original en PyTorch CPU fp32, con la misma entrada y el mismo ruido, sobre salida decodificada de 512²:

| Configuracion | PSNR frente a PyTorch CPU fp32 |
|---|---|
| fp32 lane (512²) | 115,5 dB |
| fp32 lane (tiled 1024²) | 121,9 dB |
| fp16 lane (512²) | 49,3 dB |
| fp16 + int8 DiT (512²) | 46,7 dB |
| bf16 (no publicado) | 37,6 dB |

## Requisitos de hardware
- Diseñado para Apple Silicon con soporte MLX; no se especifican requisitos para GPU NVIDIA o AMD.
- Tamaño del repositorio: 3,3 GB en fp16.
- VRAM estimada: no disponible; en Apple Silicon se utiliza memoria unificada.
- GPU recomendadas: no disponible para CUDA; el despliegue objetivo son chips de Apple con MLX.
- Cabe en GPU de consumo: no aplica en el sentido tradicional; requiere hardware Apple Silicon compatible con MLX.
- Opciones de despliegue: mlx-vosr-swift y MLXEngine (`imageUpscale`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks de modelos externos de superresolución en la información proporcionada. La comparación se limita a las variantes del propio VOSR2:

| Modelo | Formato | Cuantizacion | PSNR de paridad (512²) | Licencia |
|---|---|---|---|---|
| mlx-community/VOSR2-fp16 | MLX safetensors | fp16 (int8 derivado en carga) | 49,3 dB | Apache-2.0 |
| mlx-community/VOSR2-fp32 | MLX safetensors | fp32 | 115,5 dB | Apache-2.0 |
| CSWRY/VOSR (upstream) | PyTorch | fp32 | referencia | Apache-2.0 |

## Limitaciones y advertencias
- Modelo generativo: reescribe letras en texto pequeño ya legible; se recomienda enrutar entradas con mucho texto a través de una guardia de legibilidad.
- El corpus de entrenamiento de VOSR2 no ha sido divulgado por sus autores.
- La cuantización int8 del DiT reduce el PSNR a 46,7 dB frente a los 49,3 dB de fp16.
- bf16 no está publicado y su paridad medida es de 37,6 dB, peor que fp16.
- No se han publicado benchmarks estándar de superresolución (como Set5, Set14, Urban100) en la información disponible.
- El modelo está orientado exclusivamente a Apple Silicon mediante MLX; no hay soporte declarado para otras plataformas.
- No admite tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- La licencia Apache-2.0 permite uso comercial, pero la procedencia del corpus de entrenamiento no divulgado debe tenerse en cuenta en entornos de producción.
- El tamaño del repositorio (3,3 GB) y la necesidad de memoria unificada pueden limitar su uso en dispositivos con poca RAM.

## Enlaces
- https://huggingface.co/mlx-community/VOSR2-fp16
- https://huggingface.co/CSWRY/VOSR
- https://github.com/xocialize/mlx-vosr-swift
- https://github.com/cswry/VOSR/blob/main/LICENSE
