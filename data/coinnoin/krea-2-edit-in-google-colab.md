# coinnoin/Krea-2-Edit-in-Google-Colab

## Resumen
Krea-2 Edit es un modelo de edición de imágenes guiada por instrucciones en lenguaje natural, distribuido en este repositorio como un paquete de despliegue listo para Google Colab. El repositorio, publicado por el usuario coinnoin, no contiene pesos propios: empaqueta un cuaderno de Jupyter que automatiza la instalación de ComfyUI, la descarga de los activos (UNet `krea2_turbo-Q6_K.gguf`, codificador de texto Qwen3-VL en FP8 y VAE) y la ejecución de la inferencia sobre una GPU T4 gratuita. El modelo base subyacente se referencia como VantageWithAI / Krea-2-Turbo-GGUF.

La propuesta de valor es la accesibilidad: reduce un flujo de edición por difusión, que normalmente requiere configurar nodos personalizados, cuantizaciones GGUF y LoRAs de identidad, a tres celdas ejecutables en un entorno cloud sin coste. Incorpora controles específicos del nodo Krea2Edit (`REF_BOOST`, `GROUNDING_PX`, `FIT_MODE`), soporte de una segunda imagen de referencia y generación en pocos pasos (10 pasos, CFG 1.0), lo que encaja con la etiqueta "turbo" del modelo.

Es relevante para desarrolladores e investigadores que quieran evaluar edición de imágenes por instrucciones sin infraestructura propia, y como ejemplo de empaquetado reproducible de un pipeline de difusión cuantizado. No obstante, la información técnica publicada es escasa: el repositorio no documenta parámetros, contexto ni datos de entrenamiento del modelo base, y el tamaño del repositorio es de 0.0 GB porque los pesos se descargan en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para edición de imágenes; codificador de texto Qwen3-VL; VAE de imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q6_K para la UNet; FP8 para el codificador de texto Qwen3-VL; soporte de LoRA (identidad y personalizadas) |
| Idiomas soportados | no disponible (las instrucciones de edición se expresan en lenguaje natural; el codificador es Qwen3-VL) |
| Licencia | other (sin detalle de términos en la información disponible) |
| Formato de pesos | GGUF (UNet), safetensors/FP8 (text encoder), VAE; distribuidos vía descarga en el notebook |

## Arquitectura y entrenamiento
El pipeline combina un diffusion transformer (DiT) para la generación y edición de imágenes con un codificador de texto multimodal Qwen3-VL en precisión FP8 y un VAE de imagen. La edición es instruction-based: la imagen fuente, una posible segunda imagen de referencia y una instrucción en lenguaje natural se combinan como condicionamiento para producir la imagen editada. El nodo Krea2Edit expone parámetros de control como `REF_BOOST` (peso de la referencia visual), `GROUNDING_PX` (resolución de anclaje) y `FIT_MODE` (ajuste de resolución de la imagen de entrada).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. La variante "turbo" sugiere destilación o ajuste para inferencia en pocos pasos (el cuaderno usa 10 pasos con CFG 1.0), pero el repositorio no documenta el método. Tampoco se detalla la innovación técnica del bloque de atención ni si emplea atención lineal u otras optimizaciones.

## Capacidades
- Edición de imágenes guiada por instrucciones en lenguaje natural (por ejemplo, cambiar una prenda por un impermeable rojo).
- Edición con imagen de referencia secundaria para guiar estilo, vestuario o identidad.
- Integración de LoRA de identidad (Krea2 Identity LoRA) y carga de LoRA personalizadas.
- Generación en pocos pasos (turbo): 10 pasos con CFG 1.0.
- Controles avanzados de edición: `REF_BOOST`, `GROUNDING_PX`, `FIT_MODE`.
- Flujo de trabajo basado en nodos de ComfyUI, con nodos personalizados para GGUF y Krea2Edit.
- Descarga automatizada de activos mediante Aria2c y ejecución en GPU T4 de Colab.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso
- Edición fotográfica rápida en la nube: un usuario sube una foto y una instrucción de cambio (ropa, fondo, iluminación) y obtiene el resultado en una T4 sin instalar nada localmente; el notebook gestiona la descarga de pesos y el servidor ComfyUI.
- Prototipado de productos de edición por prompt: equipos que evalúan la calidad de edición instruction-based antes de invertir en infraestructura propia, usando el cuaderno como banco de pruebas reproducible.
- Sustitución de vestuario o estilo con referencia visual: la segunda imagen de referencia permite trasladar una prenda o un estilo concreto a la imagen fuente, útil en moda y previsualización creativa.
- Restauración y mejora de imágenes: las etiquetas del repositorio incluyen restauración y mejora; el flujo permite aplicar instrucciones de corrección sobre imágenes existentes.
- Preservación de identidad en edición de retratos: con la LoRA de identidad Krea2 se pueden generar variaciones manteniendo rasgos faciales, útil en estudios fotográficos y contenido editorial.
- Automatización en pipelines ComfyUI: el nodo Krea2Edit puede invocarse desde la API de ComfyUI para integrar la edición en flujos de producción por lotes.
- Formación y tutoriales: el cuaderno está pensado para principiantes (etiquetas "beginner-friendly", "no-code"), con vídeo tutorial asociado, lo que lo hace adecuado para docencia y demostraciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el cuaderno está diseñado para ejecutarse en una GPU T4 de Google Colab (16 GB de VRAM), lo que da una cota superior práctica del consumo del pipeline en Q6_K + FP8.
- GPU recomendadas: NVIDIA T4 (objetivo declarado del notebook); presumiblemente cualquier GPU con al menos 16 GB de VRAM. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no se confirma compatibilidad con GPUs consumer de gama media; el requisito de T4 sugiere que una RTX 4090 (24 GB) sería suficiente, pero no está verificado en la información disponible.
- Despliegue: ComfyUI con nodos personalizados para GGUF y Krea2Edit; descarga de activos con Aria2c; ejecución en Google Colab. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un pipeline de difusión de este tipo).
- Latencia y throughput: no disponibles; el modo turbo con 10 pasos y CFG 1.0 está orientado a reducir el tiempo de inferencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea-2 Edit (este repo) | no disponible | no disponible | DiT + Qwen3-VL, edición por instrucciones | other | GGUF/FP8 vía Colab |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se inventan datos de comparación.

## Limitaciones y advertencias
- La licencia es "other" sin texto de términos en la información disponible; es imprescindible revisar las condiciones del modelo base (VantageWithAI / Krea-2-Turbo-GGUF) antes de cualquier uso comercial.
- El repositorio no contiene los pesos: depende de descargas externas en tiempo de ejecución, lo que introduce riesgo de enlaces caídos, cambios de versión o interrupciones del servicio.
- No se documentan sesgos del modelo base, tasas de alucinación visual ni limitaciones idiomáticas.
- La cuantización Q6_K y el codificador FP8 pueden degradar la fidelidad de la edición frente a los pesos originales en precisión completa; no se publican métricas de esa pérdida.
- El flujo está atado a ComfyUI y a nodos personalizados, lo que añade complejidad de mantenimiento y posibles incompatibilidades entre versiones.
- El uso en Colab T4 implica límites de tiempo de sesión, cuotas de GPU gratuita y posible desconexión en trabajos largos.
- No hay información sobre resolución máxima de salida, número máximo de imágenes de referencia ni estabilidad en ediciones multi-turno.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/coinnoin/Krea-2-Edit-in-Google-Colab
- Cuaderno de Google Colab: https://colab.research.google.com/drive/1XrSZDPq6OI7oL4EsC9V_UfCz2cXb9_oo?usp=sharing
- Cuaderno en GitHub: https://github.com/salman02-12/Krea-2-Edit-in-Google-Colab/blob/main/Krea_2_Edit_CoinNoin.ipynb
- Tutorial en vídeo: https://www.youtube.com/watch?v=kkGoSIRlykA
- Canal del creador: https://www.youtube.com/@CoinNoin
- Modelo base GGUF (referencia): https://huggingface.co/vant (enlace truncado en la model card; no se dispone de la URL completa)
