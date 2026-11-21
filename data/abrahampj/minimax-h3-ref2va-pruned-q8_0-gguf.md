# AbrahamPJ/minimax-h3-ref2va-pruned-q8_0-gguf

## Resumen

MiniMax H3 Ref2VA (pruned) Q8_0 GGUF es una conversión a formato GGUF del denoiser de referencia a vídeo (reference-to-video) de MiniMax H3, publicada por el usuario AbrahamPJ para su aplicación Nightmare Mobile, una app de generación de imagen y vídeo en dispositivo (on-device) para Android. No se trata de un modelo de lenguaje, sino del componente de difusión que transforma imágenes de referencia en vídeo dentro del pipeline de MiniMax H3. El modelo parte de la build pruned (podada) de Comfy-Org y de los pesos originales de MiniMaxAI.

La relevancia de esta ficha es principalmente práctica: muestra cómo un modelo de generación de vídeo de gran tamaño puede cuantizarse a Q8_0 y ejecutarse en hardware móvil mediante la ruta NPU Hexagon de Android. Los pesos ocupan aproximadamente 21,58 GB, lo que los sitúa fuera del alcance de la mayoría de GPU de consumo, pero dentro de un segmento de despliegue especializado en dispositivos con memoria unificada o aceleradores dedicados.

No hay información pública sobre el número de parámetros, la longitud de contexto (en el sentido de ventana de texto) ni los idiomas soportados, ya que el artefacto es un denoiser de difusión y no un modelo autoregresivo de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Denoiser de difusión de MiniMax H3 (reference-to-video, Ref2VA); transformer con proyecciones AdaLN por bloque y capas lineales grandes |
| Parámetros totales | no disponible (el tamaño de archivo es de 21.583.324.256 bytes en Q8_0) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión, no autoregresivo) |
| Tipos de cuantización | Q8_0 (208 capas lineales grandes); 324 tensores F32 sin cuantizar (tabla de curva AdaLN, proyecciones AdaLN por bloque, norms, proyecciones de patch y condición) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license_name: minimax-h3-community), limitada al territorio aplicable |
| Formato de pesos | GGUF (dos variantes: base y turbo con LoRA fusionado) |

## Arquitectura y entrenamiento

El artefacto es la versión podada del denoiser Ref2VA de MiniMax H3, un modelo de difusión para generación de vídeo condicionada por imágenes de referencia. La estructura conserva el layout, cabecera y 324 tensores F32 del GGUF Q4_0 Ref2VA del mismo autor, incluyendo la tabla de curva AdaLN y las proyecciones AdaLN por bloque en sus knots, así como las norms y proyecciones de patch y condición. Las 208 capas lineales grandes se cuantizan a Q8_0 directamente desde los safetensors bf16 pruned de Comfy-Org, con un error relativo frente a los pesos bf16 de aproximadamente 0,0055 (frente a ~0,11 en la versión Q4_0).

La variante turbo incorpora, antes de cuantizar, la fusión de `scale * B @ A` del LoRA `minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16.safetensors` en cada capa lineal, con scale = alpha / rank = 0,0625 (la escala de entrenamiento del propio LoRA). El resultado permite ejecutar el modelo sin aplicar el LoRA en tiempo de inferencia. No se dispone de información sobre el volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO del modelo original.

## Capacidades

- Generación de vídeo condicionada por imágenes de referencia (reference-to-video) mediante difusión.
- Integración con el VAE de vídeo y el VAE de audio de H3, según la model card.
- Ejecución con cuatro pasos Euler y CFG 1 en la variante turbo (LoRA de 4 pasos fusionado).
- Uso del codificador de texto Qwen3-VL-4B junto con ClipProj de NicoLab28 en la app Nightmare Mobile.
- Ejecución en dispositivo Android mediante la ruta NPU Hexagon de Nightmare Mobile.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, al no ser un modelo de lenguaje.

## Casos de uso

- Generación de vídeo en dispositivo Android: la variante Q8_0 está preparada para la ruta NPU Hexagon de Nightmare Mobile, lo que permite generar vídeo a partir de imágenes de referencia sin depender de servidores externos.
- Prototipado de pipelines reference-to-video en ComfyUI: al derivar de la build pruned de Comfy-Org, puede integrarse en flujos de trabajo de ComfyUI que usen el VAE de vídeo y audio de H3.
- Evaluación de cuantización Q8_0 frente a Q4_0: el error relativo documentado (~0,0055 frente a ~0,11) permite comparar calidad y tamaño en experimentos de compresión.
- Despliegue con LoRA pre-fusionado: la variante turbo evita aplicar el LoRA en tiempo de ejecución, simplificando pipelines de inferencia de 4 pasos.
- Investigación sobre generación de vídeo en hardware móvil: sirve como referencia para estudiar latencia, memoria y viabilidad de denoisers grandes en NPU.
- Pruebas de integración de codificadores multimodales: combinación con Qwen3-VL-4B y ClipProj para condicionamiento textual en apps de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 21.583.324.256 bytes (~21,58 GB) en Q8_0; se requiere memoria suficiente para cargar los pesos más los buffers de activación del pipeline de difusión (no cuantificados en la información disponible).
- GPU recomendadas: no disponible. El tamaño supera la VRAM de GPU de consumo habituales (RTX 4090 con 24 GB queda al límite solo para pesos, sin activaciones).
- ¿Cabe en consumer GPU? No de forma holgada; requiere memoria unificada o aceleradores con mayor capacidad.
- Opciones de despliegue: ruta NPU Hexagon de Nightmare Mobile (Android); ComfyUI para la build pruned de origen; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un denoiser de difusión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbrahamPJ/minimax-h3-ref2va-pruned-q8_0-gguf | GGUF Q8_0 | ~21,58 GB | no disponible | MiniMax H3 Community | Hugging Face |
| AbrahamPJ Q4_0 Ref2VA GGUF (referenciado en la model card) | GGUF Q4_0 | no disponible | no disponible | MiniMax H3 Community | Hugging Face |
| Comfy-Org/MiniMax-H3 (pruned bf16) | safetensors bf16 | no disponible | no disponible | MiniMax H3 Community | Hugging Face |
| MiniMaxAI/MiniMax-H3 (original) | no disponible | no disponible | no disponible | MiniMax H3 Community | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Son archivos modificados, no releases oficiales; no hay endoso implícito de MiniMax ni de Comfy-Org.
- La licencia MiniMax H3 Community está limitada a su territorio aplicable; debe leerse antes de cualquier uso, incluido el comercial.
- El artefacto es un denoiser de difusión, no un modelo de texto: no ofrece contexto conversacional, tool calling ni capacidades multilingües.
- La variante base requiere aplicar el LoRA turbo de 4 pasos en tiempo de ejecución; la variante turbo lo lleva fusionado.
- El error de cuantización Q8_0 (~0,0055) es bajo pero no nulo; puede afectar sutilmente la calidad frente a bf16.
- La app Nightmare Mobile aún no ofrece estas builds en su catálogo; se trata de builds de prueba.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de un modelo generativo de vídeo.
- El tamaño de ~21,58 GB limita el despliegue a hardware con memoria suficiente; no es viable en la mayoría de GPU de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/AbrahamPJ/minimax-h3-ref2va-pruned-q8_0-gguf
- Modelo base (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base (MiniMaxAI): https://huggingface.co/MiniMaxAI/MiniMax-H3
- ClipProj de NicoLab28: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Repositorio Nightmare Mobile: https://github.com/AbrahamPaulJ/nightmare-mobile
