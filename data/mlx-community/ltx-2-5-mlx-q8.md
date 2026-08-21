# mlx-community/ltx-2.5-mlx-q8

## Resumen

El repositorio `mlx-community/ltx-2.5-mlx-q8` ofrece una conversión al ecosistema MLX de Apple del modelo de generación de vídeo LTX-2.5 desarrollado por Lightricks. La particularidad de esta versión es que el text encoder (Gemma-4) ha sido cuantizado a int8 con un tamaño de grupo de 64, mientras que el DiT (transformer de difusión) se mantiene en bf16. El objetivo es reducir el pico de memoria de la inferencia completa, que con el encoder bf16 alcanza unos 24,8 GB, hasta un rango de 14,6–15,4 GB según la configuración, permitiendo ejecutar el modelo en equipos con 24 o 32 GB de memoria unificada. La cuantización se ha validado con una métrica de fidelidad de 0,999820 en las posiciones de token válidas y mediante una evaluación perceptual ciega, aceptándose que la salida no es bit-idéntica al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (DiT) con text encoder Gemma-4 |
| Parámetros totales | No disponible |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (text encoder, grupo 64, `embed_tokens` excluido); DiT en bf16 |
| Idiomas soportados | No disponibles |
| Licencia | LTX-2 Community License Agreement (con cláusulas de uso comercial restringido) |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LTX-2.5 de Lightricks, compuesta por un text encoder (Gemma-4) que transforma el prompt en un espacio de condicionamiento de 49 estados, y un transformer de difusión (DiT) que genera el vídeo a partir de esos estados y de una secuencia de latentes. La conversión a MLX mantiene la estructura original, con la diferencia de que el text encoder se cuantiza a int8 con un tamaño de grupo de 64, excluyendo explícitamente la capa `embed_tokens` para preservar la exactitud del estado inicial. El DiT no está cuantizado en este repositorio; existe una variante independiente `mlx-community/ltx-2.5-mlx-ditq8` para cuantizar esa parte. No se proporcionan datos sobre el entrenamiento del modelo original (número de tokens, dataset, técnicas de alineamiento) en la información disponible.

## Capacidades

- Generación de vídeo a partir de prompts de texto (text-to-video).
- Generación de vídeo a partir de imágenes de entrada (image-to-video).
- Generación de vídeo con pista de audio (audio-video).
- Pipeline completo de difusión con múltiples rondas temporales (DFR pipeline), según la documentación del repositorio base.
- Soporte de generación en diferentes geometrías (p. ej., 704×512 y 512×288) según la model card.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo de generación de media.

## Casos de uso

- Creación de vídeos cortos para marketing y publicidad: se puede generar un clip de 5-10 segundos a partir de una descripción textual, útil para pruebas de concepto antes de la producción real.
- Prototipado de escenas para animación: permite visualizar rápidamente una idea de escena, reduciendo el tiempo de iteración en estudios de animación.
- Generación de material educativo: crear vídeos explicativos a partir de texto para cursos online o documentación técnica.
- Producción de contenido para redes sociales: generar vídeos personalizados para plataformas como Instagram o TikTok sin necesidad de equipos de grabación.
- Desarrollo de herramientas de accesibilidad: generar descripciones visuales en vídeo para personas con discapacidad visual.
- Generación de clips de ejemplo para pruebas de renderizado: permite validar la coherencia de escenas antes de invertir en renderizados complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, etc.) en la información disponible. La model card proporciona una métrica de fidelidad del text encoder: la salida del conector en posiciones de token válidas es 0,9077 frente a un suelo de 0,9079 para la versión bf16. También se realizó una comparación perceptual ciega en 4 pares de vídeos, donde la versión cuantizada se consideró aceptable, pero no se proporcionan cifras de rendimiento cuantitativo (FID, CLIP score, etc.).

## Requisitos de hardware

- Diseñado para Apple Silicon (macOS con MLX), no compatible con GPU NVIDIA o AMD.
- VRAM estimada: el pico de memoria durante la inferencia es de aproximadamente 14,6 GB con el encoder int8 y el DiT en streaming, y 15,4 GB en la configuración de 512×288×121. Se recomienda un mínimo de 16 GB de memoria unificada, aunque los 24 GB o 32 GB son más seguros para geometrías más grandes.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. Las variantes con más núcleos de GPU ofrecerán menor latencia.
- Opciones de despliegue: se puede ejecutar mediante Python-MLX (`ltx-2-mlx`) o Swift-MLX (`ltx-2-mlx-swift`), ambos disponibles en el repositorio base. No se menciona compatibilidad con vLLM, Ollama o TGI porque no son runtimes para MLX.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlx-community/ltx-2.5-mlx-q8` | No disponible | Text encoder int8, DiT bf16 | No disponible | LTX-2 Community | MLX, Apple Silicon |
| `mlx-community/ltx-2.5-mlx` | No disponible | bf16 completo | No disponible | LTX-2 Community | MLX, Apple Silicon |
| `mlx-community/ltx-2.5-mlx-ditq8` | No disponible | Text encoder bf16, DiT int8 | No disponible | LTX-2 Community | MLX, Apple Silicon |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal es el punto de cuantización (encoder vs DiT), que afecta a la memoria pico y a la fidelidad de la salida.

## Limitaciones y advertencias

- La licencia LTX-2 Community incluye una cláusula de "revenue gate" (límite de ingresos) y una prohibición de uso en productos competidores, lo que restringe el uso comercial a proyectos que no superen los ingresos umbral y no compitan directamente con Lightricks.
- La salida no es bit-idéntica a la versión bf16. Aunque la prueba perceptual acepta la diferencia, el resultado puede variar en escenarios con prompts ambiguos o con condiciones específicas.
- La cuantización del text encoder puede afectar a la coherencia del vídeo en prompts largos o complejos, aunque la métrica de fidelidad es alta en posiciones de token válidas.
- El modelo solo es ejecutable en Apple Silicon; no hay soporte para GPUs NVIDIA o AMD.
- No se dispone de información sobre sesgos del modelo, riesgo de alucinación o limitaciones en idiomas distintos del inglés (no se declaran idiomas soportados).
- Para uso en producción, es necesario verificar la licencia y las restricciones de uso comercial antes de integrarlo en un producto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/ltx-2.5-mlx-q8
- Repositorio base sin cuantizar: https://huggingface.co/mlx-community/ltx-2.5-mlx
- Repositorio con DiT cuantizado: https://huggingface.co/mlx-community/ltx-2.5-mlx-ditq8
- Repositorio de port de Acelogic (LTX-2-MLX): https://github.com/Acelogic/LTX-2-MLX
- Repositorio de port de dgrauet (ltx-2-mlx): https://github.com/dgrauet/ltx-2-mlx
- Web de MLX Community: https://mlxcommunity.com/
