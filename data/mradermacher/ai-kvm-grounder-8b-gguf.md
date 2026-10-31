# mradermacher/ai-kvm-grounder-8b-GGUF

## Resumen

Ai-kvm-grounder-8b es un modelo multimodal de vision-lenguaje especializado en *GUI grounding* y uso de ordenador (*computer use*), desarrollado por zhandrew a partir de Qwen3-VL 8B mediante la fusión de un adaptador LoRA. Su función principal es localizar elementos de interfaz gráfica (botones, campos de texto, iconos, menús) a partir de instrucciones en lenguaje natural sobre capturas de pantalla, resolviendo el problema clave de los agentes que operan ordenadores de forma autónoma: convertir una orden como "haz clic en el botón de guardar" en coordenadas precisas sobre la pantalla.

La relevancia de este modelo se enmarca en la oleada actual de agentes de computer use, donde la capacidad de *grounding* visual (mapear texto a regiones de la interfaz) es el cuello de botella principal frente a los modelos de lenguaje puro. Al partir de Qwen3-VL, hereda una arquitectura transformer multimodal con codificador de visión, y su tamaño de 8B lo hace desplegable en hardware de consumo.

Esta ficha cubre la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido que ofrece versiones estáticas desde Q2_K hasta f16, incluyendo los suplementos multimodales (*mmproj*) necesarios para ejecutar la parte de visión con llama.cpp u Ollama. El modelo base está disponible en safetensors bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (base Qwen3-VL, LoRA fusionado) |
| Parámetros totales | 8.190.735.360 (~8,19 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16) |
| Idiomas soportados | Inglés (según metadatos; el modelo base Qwen3-VL soporta más idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (esta versión); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-VL 8B, una arquitectura transformer multimodal que combina un codificador de visión (procesado en llama.cpp mediante los archivos *mmproj*) con un decodificador de lenguaje. Sobre esta base se entrenó un adaptador LoRA que posteriormente se fusionó con los pesos originales (*lora-merged*), dando lugar al modelo final de ~8,19 B de parámetros. El LoRA se especializa en la tarea de *GUI grounding*: recibir una captura de pantalla y una instrucción en lenguaje natural, y devolver la localización (coordenadas o caja delimitadora) del elemento de interfaz correspondiente.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, ni el uso de técnicas como RLHF o DPO en la información disponible. El repositorio cuantizado de mradermacher es una conversión estática a GGUF del modelo base zhandrew/ai-kvm-grounder-8b, sin modificaciones de los pesos más allá de la cuantización.

## Capacidades

- GUI grounding: localización de elementos de interfaz gráfica (botones, enlaces, campos de texto, iconos) a partir de instrucciones en lenguaje natural sobre capturas de pantalla.
- Computer use: integrable en agentes que controlan teclado y ratón, generando las coordenadas de clic o interacción.
- Entrada multimodal: acepta imágenes (capturas de pantalla) junto con texto; en GGUF requiere cargar el archivo mmproj correspondiente.
- Generación de texto conversacional heredada de Qwen3-VL, aunque especializada en grounding.
- No hay evidencia en la información disponible de soporte nativo de tool calling, agentes multi-paso o capacidades de audio.

## Casos de uso

- Agentes de automatización de escritorio: el modelo actúa como módulo de grounding dentro de un agente que recibe capturas de pantalla y devuelve las coordenadas exactas donde hacer clic, permitiendo automatizar flujos de trabajo repetitivos en aplicaciones de escritorio.
- Automatización de pruebas de interfaces web: integración en pipelines de testing para localizar elementos en capturas de la UI y verificar que los componentes aparecen donde se espera, complementando o sustituyendo selectores CSS frágiles.
- RPA (automatización robótica de procesos): en procesos heredados sin APIs, el modelo permite interactuar con aplicaciones legacy localizando visualmente los controles que un script tradicional no puede identificar.
- Asistentes de accesibilidad: describir y localizar elementos de pantalla para usuarios con discapacidad visual, indicando la posición de botones y controles a partir de una orden hablada o escrita.
- Ejecución local y privada de agentes de computer use: gracias a las cuantizaciones GGUF (desde 3,4 GB en Q2_K), se puede desplegar el grounding en una estación de trabajo local sin enviar capturas de pantalla a servicios en la nube, relevante para entornos con requisitos de confidencialidad.
- Investigación en agentes multimodales: base compacta y con licencia MIT para experimentar con arquitecturas de agentes que combinan planificación (LLM) y grounding (este modelo) en tareas tipo OSWorld o WebArena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del LLM + mmproj):
  - Q2_K (3,4 GB): cabe en GPUs de 6 GB o incluso en CPU con RAM suficiente.
  - Q4_K_S / Q4_K_M (4,9-5,1 GB): cómodo en GPUs de 8 GB.
  - Q6_K (6,8 GB): GPUs de 8-12 GB.
  - Q8_0 (8,8 GB): GPUs de 12-16 GB.
  - f16 (16,5 GB): GPUs de 24 GB.
  - A estos tamaños hay que sumar el mmproj (0,9 GB en Q8_0, 1,3 GB en f16) y la memoria de contexto e imágenes.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para las cuantizaciones altas; en entorno servidor, cualquier GPU con 16-24 GB (A100, L4, RTX A6000) para f16.
- Consumer GPUs: sí, la mayoría de las cuantizaciones intermedias (Q4_K_M es la recomendada por el cuantizador) funcionan en GPUs de consumo de 8-12 GB; también es viable la ejecución en CPU puro con llama.cpp.
- Opciones de despliegue: llama.cpp (con los archivos mmproj para la parte de visión), Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ai-kvm-grounder-8b (esta ficha) | ~8,19 B | GUI grounding / computer use | MIT | GGUF y safetensors en HuggingFace |
| Qwen3-VL 8B (base) | ~8 B | VL general (OCR, VQA, grounding) | Apache-2.0 (según familia Qwen; verificar en el repo base) | HuggingFace, GGUF comunitarios |
| UI-TARS (ByteDance) | Variantes de 2B a 72B | GUI grounding y agentes de computer use | Licencia propia (restringida en algunas variantes) | HuggingFace |

Nota: la comparativa se basa en las características generales conocidas de estos modelos; para datos precisos de rendimiento y licencias de las alternativas, consultar sus repositorios oficiales, ya que no se incluyen benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- Especialización estrecha: el LoRA está orientado a GUI grounding; el comportamiento como asistente conversacional general puede haberse degradado respecto al modelo base Qwen3-VL.
- Idioma: los metadatos indican inglés como único idioma; el rendimiento con instrucciones en castellano no está documentado y puede ser inferior.
- Alucinación visual: como todo modelo de grounding, puede devolver coordenadas incorrectas o elementos inexistentes; en agentes de computer use esto puede provocar clics erróneos con consecuencias reales, por lo que conviene añadir verificación (capturas post-acción o validación de coordenadas).
- Contexto y resolución de imagen: la longitud de contexto y los límites de resolución no están documentados en la información disponible; verificarlos en el modelo base antes de producción.
- Cuantizaciones bajas: Q2_K y Q3_K_M pueden degradar notablemente la precisión del grounding, donde errores de unos pocos píxeles importan; se recomienda Q4_K_M o superior.
- Licencia MIT: sin restricciones para uso comercial, pero sin garantías de ningún tipo.
- No hay benchmarks publicados: la calidad real del grounding (precisión de clic, comparativa con UI-TARS u otros grounders) debe validarse empíricamente en el dominio de aplicación concreto.

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/mradermacher/ai-kvm-grounder-8b-GGUF
- Modelo base: https://huggingface.co/zhandrew/ai-kvm-grounder-8b
- Página de descargas del cuantizador: https://hf.tst.eu/model#ai-kvm-grounder-8b-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
