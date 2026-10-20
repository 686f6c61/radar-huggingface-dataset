# heymeowcat/counterfeit-anime-512-executorch

## Resumen

`counterfeit-anime-512-executorch` es la exportación a ExecuTorch del checkpoint de difusión latente **Counterfeit V3.0**, un modelo de texto-a-imagen de estilo anime/ilustración derivado de Stable Diffusion 1.5 y entrenado originalmente por gsdf (publicado en Civitai con el ID 4468). El trabajo lo firma el usuario de HuggingFace `heymeowcat`, que actúa como mantenedor del pipeline de exportación, y no introduce un modelo nuevo: empaqueta un checkpoint existente como programa `.pte` ejecutable en dispositivo mediante la librería `react-native-executorch`.

El problema que resuelve es de despliegue, no de modelado. Counterfeit V3.0 estándar requiere 20-25 pasos con CFG 8-10 y prompt negativo, un régimen caro e incompatible con el esquema fijo que usan las pipelines de SD 1.5 en React Native ExecuTorch (4 pasos TCD `[999, 759, 499, 259]`, guidance 1.0, sin rama negativa). Para encajar en ese esquema, el export funde en el UNet el LoRA de destilación **Hyper-SD15-4steps** de ByteDance y conserva el AutoencoderKL completo incrustado en el checkpoint, evitando así el decoder TAESD de 5 MB que provoca el típico emborronado pictórico en la capa rápida.

La relevancia es acotada pero concreta: es una de las pocas vías documentadas para llevar generación de imágenes anime a móvil con inferencia 100 % local vía backend XNNPACK sobre CPU. El repositorio pesa 4,1 GB y la única variante publicada es FP32 (3.910,8 MB), sin versiones cuantizadas a int8 ni alternativas en otros formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente: UNet de Stable Diffusion 1.5 + AutoencoderKL (VAE) + text encoder CLIP ViT-L/14 |
| Parametros totales | No disponible (la model card no desglosa el recuento; es un checkpoint SD 1.5) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica a generacion de imagen; el tokenizador CLIP ViT-L/14 limita el prompt a 77 tokens |
| Tipos de cuantizacion | Solo FP32 publicado (`xnnpack/counterfeit_anime_512_xnnpack_fp32.pte`); no hay variantes int8, int4 ni GGUF |
| Idiomas soportados | No disponible (los prompts de ejemplo y el entrenamiento del checkpoint original estan en ingles) |
| Licencia | openrail (OpenRAIL, con restricciones de uso asociadas) |
| Formato de pesos | `.pte` (programa ExecuTorch, backend xnnpack) + `tokenizer.json` |
| Resolucion de salida | 512 x 512 (fijada por el export) |
| Esquema de muestreo | 4 pasos TCD `[999, 759, 499, 259]`, eta = 0.3, guidance 1.0, sin prompt negativo |
| Tamano del repositorio | 4,1 GB |
| SHA-256 del artefacto | `8f19cc17fbffa6659f436a1af54105987e4a2fe9877a4d9f47616fd3be960d6d` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un UNet que aplica difusión en el espacio latente de un AutoencoderKL, condicionado por embeddings de texto de CLIP ViT-L/14. Sobre esa base, Counterfeit V3.0 es un ajuste fino orientado a ilustración anime, distribuido originalmente como `Counterfeit-V3.0_fix_fp16.safetensors`. El export no reentrena nada: toma ese checkpoint, le inyecta el LoRA de destilación Hyper-SD15-4steps con **escala de fusión 1.0** y convierte el grafo resultante a ExecuTorch con el backend XNNPACK en FP32.

Dos decisiones técnicas del pipeline condicionan la calidad y son relevantes para quien quiera reproducirlo. La primera es la escala de fusión: la model card de Hyper-SD sugiere escalas pequeñas (por ejemplo 0.125) para las variantes que preservan CFG, pero al operar con 4 pasos y CFG desactivado cualquier valor por debajo de 1.0 colapsa el resultado en una textura pictórica sin definición sobre este checkpoint. La segunda es el clip skip 2: Counterfeit está entrenado y se usa con clip skip 2, y no basta con seleccionar el estado penúltimo de CLIP, porque los `hidden_states` son *pre-norm* y hay que aplicar `text_encoder.final_layer_norm` al estado elegido. Omitir esa normalización deja las activaciones en torno a ±800 en lugar de ±30 y el UNet genera ruido estático puro; el export integra la normalización dentro de `encode`, replicando el comportamiento de A1111 y ComfyUI (`layer_norm_hidden_state`).

No hay información sobre el dataset de entrenamiento del checkpoint original, el volumen de tokens, ni sobre si se aplicaron etapas de RLHF o DPO. El LoRA Hyper-SD está documentado en el artículo arXiv:2404.13686.

## Capacidades

- Generación de texto a imagen de 512 x 512 píxeles en 4 pasos de muestreo, con inferencia local en dispositivo.
- Estilo especializado en anime e ilustración: line art limpio, color saturado pero controlado y detalle en ojos, según la evaluación cualitativa del autor.
- Ejecución sobre backend XNNPACK en CPU, sin requisito de GPU ni de conectividad de red.
- Integración con `react-native-executorch` para aplicaciones móviles React Native.
- Integración con el runtime C++ de ExecuTorch, verificado en macOS CPU.
- Reproducibilidad determinista por semilla: la galería de ejemplos documenta semillas concretas (1234, 42, 777, 2024, 1997, 123).
- No soporta prompt negativo ni guidance escalable: el export fija guidance 1.0 y elimina la rama negativa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada ni audio. Es exclusivamente un modelo de generación de imagen.
- No hay información sobre capacidades multilingües; el tokenizador es CLIP ViT-L/14 y todos los ejemplos utilizan prompts en inglés.

## Casos de uso

- **Generación de avatares anime en aplicación móvil**: la app puede producir un retrato de 512 x 512 a partir de una descripción textual en 4 pasos, sin llamada a servidor, usando `react-native-executorch` sobre el runtime XNNPACK.
- **Prototipado offline de features de imagen**: útil en entornos sin conectividad o con requisitos de privacidad estrictos, donde el prompt del usuario no puede salir del dispositivo.
- **Ilustración de contenido para comunidades de fan art**: el ajuste específico sobre Counterfeit V3.0 cubre escenas típicas del género (retratos de pelo corto, cielos al atardecer, mercadillos nocturnos, interiores acogedores), como demuestra la galería del autor.
- **Generación de placeholders y assets de prueba en pipelines de desarrollo**: al ser determinista por semilla y ejecutarse localmente, sirve para producir imágenes reproducibles en tests de UI sin depender de servicios externos.
- **Educación y demos de difusión en dispositivo**: el repositorio incluye `generate_gallery.py` y comparativa contra la línea base en PyTorch eager, lo que lo convierte en material didáctico sobre exportación de modelos, fusión de LoRA y paridad numérica.
- **Aplicaciones de escritorio con runtime C++**: cualquier wrapper sobre el runtime ExecuTorch (macOS, Linux, Android, iOS) puede cargar el `.pte` y ofrecer generación de imágenes sin Python en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU u otros) en la información disponible. La model card incluye únicamente una comparación cualitativa y una métrica de paridad numérica frente a la ejecución eager en PyTorch:

| Implementación | Decoder | Destilación | Calidad visual | Diferencia media de píxel vs eager |
|---|---|---|---|---|
| ExecuTorch `.pte` (este export) | AutoencoderKL completo (integrado) | Hyper-SD 4 pasos | Line art anime limpio, color saturado y controlado, ojos detallados | 0,02 / 255 (paridad) |
| Capa rápida de 1 paso | TAESD (5 MB) | 1 paso | Manchas pictóricas, rostros emborronados | > 40 / 255 |

No hay datos de latencia ni de throughput publicados para el artefacto.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el artefacto FP32 pesa 3.910,8 MB, por lo que se necesita al menos ese espacio más las activaciones del UNet a 512 x 512. Como referencia de planificación, cabe esperar un rango de 6-8 GB de memoria si se ejecuta en GPU; no es un dato publicado por el autor.
- **Ejecución en CPU**: la variante publicada usa el backend XNNPACK, orientado a CPU, y el autor la verificó en macOS CPU. No requiere GPU.
- **GPU recomendadas**: no disponible. El export no está pensado para GPUs de datacenter (A100, H100) sino para despliegue en dispositivo; una RTX 4090 no aporta ventaja sobre el backend XNNPACK en este formato.
- **¿Cabe en hardware de consumidor?**: sí, en el sentido de que el objetivo es ejecución en móvil y portátil vía CPU, con un binario de 3,9 GB en disco. El límite práctico es el almacenamiento y la RAM del dispositivo, no la VRAM.
- **Opciones de despliegue**: runtime C++ de ExecuTorch, `react-native-executorch` (npm), y los bindings de ExecuTorch para Android, iOS y macOS. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan el formato `.pte`.
- **Latencia y throughput**: no disponibles. El autor no publica tiempos por imagen.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `counterfeit-anime-512-executorch` (este) | SD 1.5 + Counterfeit V3.0 + Hyper-SD 4 pasos | No disponible | Prompt CLIP 77 tokens; 512 x 512; 4 pasos | Paridad 0,02/255 vs eager; sin benchmarks estandar | openrail | `.pte` FP32, 3,9 GB, en HuggingFace |
| Counterfeit V3.0 original (gsdf, Civitai 4468) | SD 1.5 | No disponible | 512 x 512; 20-25 pasos, CFG 8-10 | Calidad de referencia del ajuste anime | Abierta segun Civitai (consultar ficha del autor) | `.safetensors` fp16, requiere A1111/ComfyUI/diffusers |
| `software-mansion/react-native-executorch-sdxs-512-dreamshaper` | SDXS 512 DreamShaper | No disponible | 512 x 512 | No disponible | Consultar ficha | Export ExecuTorch equivalente; origen del `tokenizer.json` reutilizado |
| Stable Diffusion 1.5 base | SD 1.5 | No disponible en esta informacion | 512 x 512; 20-50 pasos | Referencia generalista, sin especializacion anime | CreativeML OpenRAIL-M | Amplia, multiples formatos |

La comparación relevante es contra el propio Counterfeit V3.0 sin exportar: este artefacto intercambia la flexibilidad de CFG y prompt negativo por un esquema fijo de 4 pasos que cabe en un dispositivo, con una pérdida de fidelidad respecto a eager de 0,02/255 según el autor.

## Limitaciones y advertencias

- **Sin prompt negativo ni CFG ajustable**: el grafo está exportado con guidance 1.0 y sin rama negativa. Cualquier control fino que dependa de CFG o de negative prompts es inaccesible sin reexportar.
- **Resolución y esquema fijos**: 512 x 512 y la secuencia de 4 pasos `[999, 759, 499, 259]` están horneados en el export; no se puede cambiar el número de pasos ni la resolución en tiempo de ejecución sin reconstruir el `.pte`.
- **Sesgo de dominio**: es un ajuste fino de anime/ilustración. Los prompts fotorrealistas o fuera del género probablemente produzcan resultados degradados.
- **Idioma**: todos los ejemplos y el entrenamiento original operan en inglés; no hay información sobre rendimiento con prompts en castellano.
- **Riesgo de contenido no deseado**: los checkpoints anime de Civitai pueden heredar sesgos de estilo y producir contenido sugerente; requiere filtrado o moderación en producción.
- **Licencia OpenRAIL**: incluye restricciones de uso basadas en el comportamiento, no es una licencia permisiva pura. Es obligatorio revisar los términos antes de un uso comercial, y la licencia del checkpoint original de Civitai debe verificarse por separado.
- **Formatos incompatibles**: no se puede cargar en diffusers, ComfyUI, vLLM ni llama.cpp. Solo funciona con el runtime ExecuTorch.
- **Artefacto único y sin cuantizar**: solo existe FP32 (3,9 GB). No hay variante int8 que reduzca el peso para móviles con almacenamiento limitado.
- **Sin benchmarks objetivos**: la única métrica publicada es la diferencia media de píxel frente a eager y una valoración cualitativa del autor. No hay FID ni CLIP score que permitan comparar de forma rigurosa.
- **Madurez**: el repositorio se creó el 2026-10-19 y tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heymeowcat/counterfeit-anime-512-executorch
- Modelo base Counterfeit V3.0 (gsdf, Civitai 4468): https://civitai.com/models/4468/counterfeit-v30
- LoRA de destilación Hyper-SD (ByteDance): https://huggingface.co/ByteDance/Hyper-SD
- Artículo Hyper-SD: https://arxiv.org/abs/2404.13686
- Librería `react-native-executorch` (npm): https://www.npmjs.com/package/react-native-executorch
- Export de referencia con el `tokenizer.json` reutilizado: https://huggingface.co/software-mansion/react-native-executorch-sdxs-512-dreamshaper
- Perfil del mantenedor: https://huggingface.co/heymeowcat
- Repositorio GitHub con el pipeline de exportación, `generate_gallery.py` y documentación: mencionado en la model card, sin URL disponible en la información proporcionada.
- No se han encontrado enlaces adicionales relevantes en la búsqueda web.
