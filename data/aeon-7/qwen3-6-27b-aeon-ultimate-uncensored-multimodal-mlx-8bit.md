# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit es una cuantizacion de 8 bits (affine, group-64) del modelo base BF16 del mismo autor, publicada por AEON-7 sobre Hugging Face. Se trata de una variante "abliterated" (refusals eliminados) del modelo Qwen3.6 de 27B, adaptada para ejecutarse de forma nativa en Apple Silicon mediante la libreria MLX y mlx-vlm. El modelo conserva la torre de vision en BF16 y soporta entrada imagen-texto, ademas de un cabezal MTP (multi-token prediction) para decodificacion especulativa sin perdida.

La arquitectura es hibrida: combina atencion lineal con Gated-DeltaNet (del linaje Mamba/SSM) y componentes transformer, lo que reduce el coste de atencion en contextos largos. El repositorio ocupa 29,5 GB en disco (8,634 bpw) y esta pensado para Macs con 36 GB o mas de memoria unificada; el autor lo valido en un MacBook Pro M4 Pro de 48 GB. El modelo tiene 27.356.728.560 parametros totales segun safetensors.

Es relevante porque demuestra el despliegue multimodal de un modelo de 27B en hardware de consumo Apple, con cuantizacion mixta que preserva las partes numericamente fragiles (recurrencia Gated-DeltaNet, torre de vision y cabezal MTP) en BF16. Sin embargo, la propia model card indica que esta linea ha sido superada por Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, y que este repositorio se mantiene solo por razones historicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: transformer con atencion lineal y Gated-DeltaNet (SSM/Mamba), multimodal con torre de vision |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine group-64 en el decodificador; BF16 en Gated-DeltaNet, torre de vision y cabezal MTP |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors (MLX), 29,5 GB en disco, 8,634 bpw |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B y emplea una arquitectura hibrida que combina capas transformer con atencion lineal basada en Gated-DeltaNet, una variante de los modelos de espacio de estados (SSM) del linaje Mamba. Esta mezcla reduce el coste computacional de la atencion en secuencias largas. Incluye ademas una torre de vision para entrada imagen-texto y un cabezal MTP (multi-token prediction) integrado en los pesos, que permite decodificacion especulativa verificada contra el modelo objetivo.

La cuantizacion es mixta: 8 bits affine con group-64 sobre el grueso compresible del decodificador y BF16 en los componentes sensibles numericamente (dinamica de estados Gated-DeltaNet, torre de vision completa y cabezal MTP). El autor indica que fue construida y validada en un MacBook Pro M4 Pro de 48 GB. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada; el proceso de "abliteration" para eliminar rechazos no se detalla tecnicamente en la model card.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes (image-text-to-text) mediante torre de vision en BF16, con soporte de contenido `image_url` en formato OpenAI.
- Razonamiento multi-turno y conversacional.
- Decodificacion especulativa con MTP (lossless, con block size 3 como valor recomendado por el autor).
- Modo "uncensored": se han eliminado los rechazos (refusals) del modelo base.
- Soporte de servidor compatible con la API de OpenAI (`/v1/chat/completions`) a traves de mlx-vlm.
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se sirve con mlx-vlm en un puerto local y responde via API compatible con OpenAI, lo que permite integrarlo en clientes existentes sin infraestructura en la nube.
- Analisis de imagenes en dispositivo: al conservar la torre de vision en BF16, permite enviar imagenes y obtener descripciones o respuestas sobre ellas sin salir del equipo, util para privacidad de datos.
- Prototipado de aplicaciones multimodales: desarrolladores que necesitan probar flujos imagen-texto en Apple Silicon pueden levantar el servidor con un solo comando `uv run` y consumirlo como endpoint OpenAI.
- Generacion de texto sin filtros para investigacion: el caracter abliterated lo hace adecuado para estudios sobre comportamiento de modelos sin rechazos, siempre con las cautelas legales correspondientes.
- Aceleracion de inferencia con MTP: entornos que necesitan mayor throughput en decodificacion pueden activar el drafter MTP con block size 3 para reducir latencia sin alterar la salida.
- Despliegue en hardware de consumo: Macs con 36 GB o mas de memoria unificada pueden ejecutar un modelo de 27B multimodal sin GPU dedicada, util para demos y entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la variante FP4 del mismo autor es aproximadamente 1,85 veces mas rapida en decodificacion y que ocupa 16 GB, frente a los 29,5 GB de esta variante de 8 bits.

## Requisitos de hardware

- Memoria unificada: 36 GB o mas en Apple Silicon; el pico medido es de 29,85 GB.
- Validado en MacBook Pro M4 Pro de 48 GB.
- No esta pensado para GPUs discretas (NVIDIA/AMD); es una build MLX exclusiva para Apple Silicon.
- Despliegue mediante mlx-vlm (servidor compatible con OpenAI) o `mlx_vlm.generate`.
- El drafter MTP ocupa 821 MB adicionales y se descarga automaticamente con `--draft-model`.
- mlx-vlm debe instalarse desde git `main`, ya que la torre `qwen3_5_vision` no esta en la release 0.6.1 de PyPI.
- No se dispone de datos de latencia o throughput absolutos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-8bit | 27,36B | no disponible | MLX safetensors 8-bit | other | Esta ficha; 29,5 GB, enfocado a fidelidad |
| Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4 | 27,36B (mismo base) | no disponible | MLX FP4 | other | 16 GB, ~1,85x mas rapido en decodificacion |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | no disponible | no disponible | NVFP4 + FP8 | other | Sucesor recomendado por el autor; mayor capacidad segun la model card |
| Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 | 27,36B | no disponible | BF16 safetensors | other | Modelo base sin cuantizar del que deriva esta build |

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": se han eliminado los rechazos, lo que implica riesgo elevado de generar contenido inapropiado, danino o ilegal; requiere filtros y supervision en produccion.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad.
- El servidor MLX usa decodificacion greedy por defecto (temperature 0), lo que puede provocar repeticiones o bucles en prompts largos; el autor recomienda temperature 1.0, top_p 0.95 y top_k ~64.
- Licencia "other": no se especifican los terminos exactos de uso comercial en la informacion disponible; es imprescindible revisar el texto completo de la licencia antes de un uso productivo.
- Exclusivo para Apple Silicon; no funciona en GPUs NVIDIA ni en CPU convencional sin adaptacion.
- La model card indica que el modelo ha sido superado por Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED y que este repositorio se mantiene solo por razones historicas.
- La longitud de contexto no esta documentada en la informacion proporcionada.
- Requiere instalar mlx-vlm desde git `main` para el soporte multimodal, lo que anade riesgo de inestabilidad frente a una release estable.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Variante FP4: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4
- Drafter MTP: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter
- Sucesor recomendado: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Repositorio de recetas del sucesor: https://github.com/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- uv (gestor de entornos): https://docs.astral.sh/uv/
- Soporte del autor: https://lotusmake.com/support
