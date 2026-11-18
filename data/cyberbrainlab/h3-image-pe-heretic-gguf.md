# CyberBrainLab/H3-Image-PE-heretic-GGUF

## Resumen

H3-Image-PE-heretic-GGUF es una cuantización en formato GGUF del potenciador de prompts (prompt enhancer, PE) del modelo MiniMax-H3-Image, en su variante "Heretic" o abliterated, es decir, con el alineamiento de seguridad eliminado. Lo publica el usuario CyberBrainLab a partir de los pesos NVFP4 en formato ComfyUI de tuanlai001, que a su vez derivan del PE oficial de MiniMax (MiniMaxAI/MiniMax-H3-Image-PE). El modelo base original es Qwen3.8-27B, reentrenado por MiniMax como potenciador de prompts para su flujo de edición de imágenes H3.

El problema que resuelve es de despliegue: el PE Heretic original solo se distribuía en NVFP4 para ComfyUI, un formato que requiere una GPU Blackwell (compute capability 10 o superior) para ejecutarse de forma nativa. Estas cuantizaciones Q2_K y Q4_K_M permiten ejecutar el mismo modelo en GPUs más antiguas, como una RTX 3090, mediante llama.cpp y llama-server, fuera del entorno de ComfyUI.

El modelo cuenta con 460.730.096 parámetros (aproximadamente 0,46 mil millones) según los pesos en safetensors del repositorio, y el repositorio ocupa 0,9 GB. Es un modelo multimodal de texto e imagen: incluye un proyector de visión separado (mmproj) necesario para aceptar entradas de imagen. Su función es reescribir o expandir instrucciones de edición de imagen en descripciones detalladas en inglés que luego consume el flujo de trabajo H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, reentrenada por MiniMax como prompt enhancer); incluye proyector de visión separado |
| Parametros totales | 460.730.096 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible de forma oficial; en pruebas se usó ctx 24576 |
| Tipos de cuantizacion | Q2_K y Q4_K_M (GGUF); proyector de visión en F16 |
| Idiomas soportados | inglés (en) |
| Licencia | minimax-h3-image-community-license-agreement (licencia "other") |
| Formato de pesos | GGUF (llama.cpp); origen NVFP4 en formato ComfyUI, convertido a BF16 y luego a GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Qwen3.8-27B (licencia Apache 2.0), que MiniMax reentrenó como potenciador de prompts para su modelo de edición de imágenes H3. La variante Heretic de tuanlai001 aplica técnicas de abliteration para eliminar el comportamiento de censura del PE oficial, de modo que el modelo no reescriba ni bloquee instrucciones que el PE original rechazaría. El modelo incorpora un proyector de visión (mmproj) que le permite procesar imágenes de entrada además de texto.

El proceso de conversión documentado por el autor es el siguiente: primero se desquantizan los pesos NVFP4 del formato ComfyUI a BF16 (el layout de ComfyUI empaqueta dos valores FP4 E2M1 por byte con el nibble alto primero y escalas de bloque FP8 en layout swizzled `to_blocked` de cuBLAS, distinto del NVFP4 de modelopt); después se convierten a GGUF con `convert_hf_to_gguf.py` de llama.cpp anterior al commit `3ba1ce0e`, usando `--no-mtp` para el modelo de texto y conservando nombres de tensores sin fusionar; finalmente se cuantiza con `llama-quantize` a Q2_K y Q4_K_M. Las capas MTP (multi-token prediction) se descartaron durante la conversión. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas.

## Capacidades

- Generación de texto en inglés orientada a la expansión y reescritura de instrucciones de edición de imagen.
- Procesamiento de entrada de imagen mediante el proyector de visión (mmproj en F16), necesario para el modo multimodal.
- Modo de razonamiento ("thinking") activable, aunque con él la salida puede alargarse mucho antes de la respuesta final.
- Variante abliterated: no aplica la censura del PE oficial y no reescribe ni bloquea instrucciones.
- Generación de descripciones (captions) coherentes en inglés a partir de instrucciones de edición.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Edición de imágenes por instrucción en flujos ComfyUI: el modelo genera la caption expandida que el nodo de edición H3 consume para modificar la imagen; se ejecuta en llama-server y la caption se pasa a ComfyUI, ya que el nodo `TextGenerateV2` no puede cargar GGUF.
- Despliegue en GPUs no Blackwell: permite usar el PE Heretic en tarjetas como la RTX 3090, donde el NVFP4 original no se ejecuta de forma nativa, gracias a la cuantización Q2_K probada con unos 13 GB de VRAM a contexto 24576.
- Prototipado de pipelines de edición de imagen sin restricciones de reescritura: útil para experimentar con instrucciones que el PE oficial bloquearía, en entornos de investigación.
- Generación de captions detalladas en inglés para datasets de imagen: el modelo produce descripciones coherentes que pueden servir como texto de entrenamiento o metadatos.
- Pruebas de sensibilidad a la cuantización: comparar Q2_K frente a Q4_K_M permite evaluar la degradación de calidad en tareas de expansión de prompts con modelos pequeños.
- Integración en servidores de inferencia locales: mediante llama-server se puede exponer el modelo como servicio HTTP para alimentar herramientas de edición de imagen en una red interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta pruebas cualitativas: con Q2_K en una RTX 3090, a contexto 24576, se obtienen unos 54 tokens/s y una caption coherente en unos 10 segundos para la instrucción "Change the taxi's color to bright red." con el modo thinking desactivado; la edición H3 resultante cambió solo el taxi a rojo. Q4_K_M no ha sido probado.

## Requisitos de hardware

- Q2_K: aproximadamente 13 GB de VRAM con contexto 24576 (medido en RTX 3090); archivo de 9,98 GiB.
- Q4_K_M: archivo de 15,41 GiB; requiere más VRAM que Q2_K, cantidad exacta no disponible.
- Proyector de visión mmproj F16: 0,86 GiB adicionales si se usa entrada de imagen.
- GPU recomendadas: RTX 3090 (probada); cualquier GPU con VRAM suficiente para el archivo más el contexto. El NVFP4 original requería GPU Blackwell (compute capability 10 o superior).
- Cabe en GPUs de consumo de gama alta con 24 GB de VRAM en Q2_K; Q4_K_M probablemente también, aunque no está verificado.
- Despliegue mediante llama.cpp / llama-server (probado con la versión 0.9.0-dev, commit 6c01da627). No es compatible con el nodo PE de ComfyUI.
- Throughput medido: aproximadamente 54 tokens/s en Q2_K sobre RTX 3090. Latencia de la caption de prueba: unos 10 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberBrainLab/H3-Image-PE-heretic-GGUF | 460.730.096 | no disponible (probado a 24576) | GGUF Q2_K/Q4_K_M | MiniMax-H3-Image Community License | Hugging Face, restringido en UE, Reino Unido, Corea del Sur y EE. UU. |
| tuanlai001/H3-IMAGE-PE-HERETIC-NVFP4-COMFYUI | no disponible | no disponible | NVFP4 (ComfyUI) | MiniMax-H3-Image Community License | Hugging Face; requiere GPU Blackwell |
| MiniMaxAI/MiniMax-H3-Image-PE | no disponible | no disponible | no disponible | MiniMax-H3-Image Community License | Hugging Face; PE oficial con censura |
| Qwen/Qwen3.8-27B | 27B (según denominación) | no disponible | no disponible | Apache 2.0 | Hugging Face; sin restricciones territoriales |

## Limitaciones y advertencias

- Restricción territorial: la licencia prohíbe el uso, reproducción, modificación, distribución y exhibición en la Unión Europea, Reino Unido, Corea del Sur y Estados Unidos. No debe descargarse ni usarse desde esos territorios.
- Uso comercial: requiere autorización escrita de MiniMax si los ingresos anuales superan 1 millón de dólares o si se ofrece como servicio alojado.
- Redistribución: debe incluir los archivos LICENSE y NOTICE, y marcar los archivos modificados como tales.
- Al ser una variante abliterated, no aplica filtros de seguridad; puede generar contenido que el PE oficial bloquearía, con el riesgo asociado en producción.
- Q2_K está muy cuantizado y puede introducir inconsistencias menores en las captions; el autor recomienda Q4_K_M si hay VRAM suficiente.
- En las pruebas, la salida fue texto plano y no el JSON (`expanded_caption`) que espera el flujo de trabajo.
- Con el modo thinking activado, la salida puede alargarse en exceso antes de la respuesta final.
- Solo soporta inglés.
- No se puede cargar en el nodo PE de ComfyUI (`TextGenerateV2`); requiere llama-server y pasar la caption manualmente.
- Las versiones recientes de llama.cpp que esperan tensores qwen3.5 fusionados no han sido probadas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CyberBrainLab/H3-Image-PE-heretic-GGUF
- Pesos Heretic NVFP4 de origen: https://huggingface.co/tuanlai001/H3-IMAGE-PE-HERETIC-NVFP4-COMFYUI
- PE oficial de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
