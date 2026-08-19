# dgrauet/ernie-image-sft-mlx-q8

## Resumen

El modelo `dgrauet/ernie-image-sft-mlx-q8` es una conversión al formato MLX del modelo `baidu/ERNIE-Image`, un Diffusion Transformer (DiT) de flujo único con 8.000 millones de parámetros desarrollado por Baidu para generación de texto a imagen. Esta variante concreta está cuantizada en int8, lo que reduce el tamaño y acelera la inferencia en hardware Apple Silicon mediante el framework MLX. La conversión ha sido realizada con la herramienta `mlx-forge` y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que permite ejecutar un generador de imágenes de 8B en Macs con chip Apple Silicon, algo que tradicionalmente requería GPUs dedicadas. El repositorio asociado `ernie-image-mlx` incluye seis variantes de pesos (fp16, int8, int4, con y sin fine-tuning SFT, y versión Turbo) y ha sido verificado para producir imágenes limpias de extremo a extremo. Además, incorpora un Prompt Enhancer opcional que mejora los prompts de entrada.

El tamaño del repositorio es de 12,5 GB, con los pesos en formato `safetensors` y configuración de cuantización incluida. Está pensado para usarse con la librería `ernie-image-mlx` desde línea de comandos o integrado en aplicaciones Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo único |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generación de imágenes, la entrada es un prompt de texto sin límite especificado) |
| Tipos de cuantizacion | int8 (esta variante); también existen fp16, int4 y Turbo en el mismo repositorio |
| Idiomas soportados | no disponible (el ejemplo de uso emplea chino, pero no se documenta la cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `baidu/ERNIE-Image` es un Diffusion Transformer de flujo único (single-stream) con 8.000 millones de parámetros. Este diseño unifica las ramas de texto e imagen en una sola secuencia de tokens, simplificando el proceso de difusión y mejorando la coherencia entre el prompt y la imagen generada. La conversión MLX mantiene la arquitectura original, pero adapta los pesos y operaciones al ecosistema MLX para ejecución en Apple Silicon.

No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card solo indica que es una conversión de pesos, no un reentrenamiento. Las pruebas de paridad numérica realizadas en el repositorio `ernie-image-mlx` confirman que los módulos MLX replican fielmente el comportamiento del modelo original en diffusers, con errores máximos del orden de 1e-5 a 1e-6 en las distintas capas (DiT, VAE encoder/decoder, ResnetBlock2D).

## Capacidades

- Generación de imágenes a partir de prompts de texto, con soporte para estilos y composiciones complejas.
- Prompt Enhancer integrado (cargado por defecto desde `dgrauet/ernie-image-pe-mlx-q4`), que refina y expande el prompt original para mejorar la calidad de la imagen generada.
- Inferencia optimizada para Apple Silicon mediante MLX, con soporte para cuantización int8 e int4.
- Compatible con la librería `ernie-image-mlx`, que ofrece interfaz CLI y API Python.
- Capacidad de controlar la semilla de muestreo del prompt enhancer (`--pe-seed`) y la semilla del latente de imagen (`--seed`) de forma independiente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de otros modalidades (audio, video).

## Casos de uso

- Generación de imágenes para prototipos y mockups: un diseñador puede generar rápidamente variaciones de un concepto visual usando prompts descriptivos, sin necesidad de una GPU dedicada, gracias a la ejecución en Apple Silicon.
- Ilustración de artículos y contenido editorial: el modelo permite crear imágenes personalizadas para blogs, documentación técnica o presentaciones, ajustando el estilo mediante el prompt enhancer.
- Automatización de assets para redes sociales: se puede integrar en un pipeline Python que genere imágenes a partir de un texto dado, por ejemplo para campañas de marketing o publicaciones recurrentes.
- Exploración creativa y generación de ideas: artistas y diseñadores pueden usar el modelo para explorar variaciones de un tema, combinando el control de semillas para reproducir resultados.
- Educación y demostraciones de IA generativa: al ser un modelo de 8B ejecutable en un Mac, es adecuado para talleres y cursos donde se quiera mostrar generación de imágenes sin depender de servicios en la nube.
- Desarrollo de aplicaciones locales de generación de imágenes: desarrolladores pueden construir apps de escritorio o scripts que generen imágenes bajo demanda, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible. El repositorio `ernie-image-mlx` documenta únicamente pruebas de paridad numérica entre los módulos MLX y la implementación de referencia en diffusers, con errores máximos de 3,1e-6 en el DiT, 1,7e-6 en el VAE encoder, 6,7e-6 en el VAE decoder y 1e-5 en ResnetBlock2D. Estas cifras confirman la fidelidad de la conversión, pero no son métricas de rendimiento generativo.

## Requisitos de hardware

- Requiere hardware Apple Silicon (M1, M2, M3 o superior) con soporte para MLX.
- No se especifica la VRAM necesaria; al ser un modelo de 8B en int8, se estima que necesita al menos 16 GB de memoria unificada para una inferencia cómoda, aunque no se proporciona una cifra oficial.
- La cuantización int8 reduce el uso de memoria frente a fp16; la variante int4 podría caber en equipos con 8 GB, pero no está confirmado.
- Opciones de despliegue: la librería `ernie-image-mlx` (CLI y Python) es la vía principal; también se puede integrar en proyectos MLX personalizados.
- No se indican valores de latencia ni throughput; dependen del chip concreto (M1 vs M2 Pro vs M3 Max) y de la resolución de salida.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente este modelo con alternativas como Stable Diffusion, FLUX o SDXL en términos de rendimiento y calidad. Dentro del mismo repositorio existen otras variantes de `ERNIE-Image` en MLX (fp16, int4, Turbo) que se diferencian por el nivel de cuantización y la velocidad de muestreo, pero no se aportan métricas comparativas. La comparativa queda pendiente de datos oficiales de benchmarks.

## Limitaciones y advertencias

- La cuantización int8 puede provocar una ligera pérdida de calidad en las imágenes generadas respecto al modelo en fp16, aunque no se documenta la magnitud del impacto.
- El modelo está diseñado exclusivamente para Apple Silicon; no es compatible con GPUs NVIDIA o AMD sin una conversión adicional a otros formatos (p.ej. PyTorch).
- No se ha documentado la cobertura de idiomas; el ejemplo oficial usa chino, pero no se garantiza el rendimiento en otros idiomas.
- No se han publicado estudios de sesgos o comportamientos problemáticos del modelo original; se recomienda validar las imágenes generadas en contextos sensibles.
- El Prompt Enhancer se carga por defecto desde un repositorio remoto, lo que requiere conexión a internet en la primera ejecución; se puede desactivar o apuntar a una copia local.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la atribución y las condiciones de la licencia del modelo base `baidu/ERNIE-Image` si se redistribuyen pesos o derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dgrauet/ernie-image-sft-mlx-q8
- Modelo base original: https://huggingface.co/baidu/ERNIE-Image
- Repositorio `ernie-image-mlx`: https://github.com/dgrauet/ernie-image-mlx
- Herramienta de conversión `mlx-forge`: https://github.com/dgrauet/mlx-forge
- Librería en PyPI: https://pypi.org/project/ernie-image-mlx/
- Ops reutilizables `mlx-arsenal`: https://github.com/dgrauet/mlx-arsenal
- Skill de portabilidad `mlx-porting`: https://github.com/dgrauet/claude-skill-mlx-porting
