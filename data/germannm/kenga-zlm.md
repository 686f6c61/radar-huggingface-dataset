# GermannM/Kenga-ZLM

## Resumen

Kenga-ZLM es un modelo de lenguaje de tipo decoder transformer con arquitectura Llama, desarrollado por GermannM (German Yantaras, Moscú) como parte de su ecosistema experimental denominado Z-system. Se trata de un modelo pequeño, de 91,2 millones de parámetros totales, entrenado completamente desde cero sin reutilizar pesos preentrenados de terceros, y con una innovación estructural singular: cada capa lineal de atención y MLP nace factorizada de forma de bajo rango mediante la descomposición `W = U · diag(S · mask) · Vᵀ`, que posteriormente se colapsa sin pérdidas en un `LlamaForCausalLM` estándar.

El modelo está especializado en conversación directa y concisa, con soporte para el idioma ruso e inglés, y tiene la particularidad de conocer y escribir código en Kenga, un lenguaje de programación propio del autor. Su ventana de contexto es reducida (512 tokens) y su vocabulario es de 8192 tokens, lo que lo sitúa en la categoría de modelos ultraligeros orientados a experimentación arquitectónica más que a producción generalista.

Su relevancia actual reside en el enfoque metodológico: demuestra un protocolo de entrenamiento ("Z Rank Curriculum") en el que el rango de las factorizaciones de bajo rango crece progresivamente durante el preentrenamiento, y en la exportación a GGUF para su uso inmediato en llama.cpp, Ollama o LM Studio con un tamaño de fichero de apenas 97 MB en cuantización Q8_0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (`D=768, L=12, H=12, DFF=2048`) |
| Parámetros totales | 91.245.312 |
| Parámetros activos | no disponible (no es MoE; 86,56 M en forma Z factorizada) |
| Longitud de contexto | 512 tokens (`SEQ=512`) |
| Tipos de cuantización | Q8_0 (~97 MB) y F16 (~183 MB) en GGUF; safetensors en precisión original |
| Idiomas soportados | Ruso (`ru`), inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF (Q8_0 y F16), checkpoint PyTorch (`ckpt/kenga_zlm_sft.pt`) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 12 capas con dimensión oculta 768, 12 cabezas de atención, dimensión feed-forward de 2048 y vocabulario de 8192 tokens. La innovación central es que cada matriz lineal (`q, k, v, o, gate, up, down`) se inicializa y entrena factorizada como `W = U · diag(S · mask) · Vᵀ`, es decir, una descomposición de bajo rango con una máscara sobre los valores singulares. Durante el preentrenamiento se aplica un "Z Rank Curriculum" que expande el rango en tres fases: `(96, 128) → (192, 256) → (384, 512)`, con lo que los parámetros activos crecen de 26,37 M a 46,44 M y finalmente a 86,56 M.

Tras el preentrenamiento se realiza un ajuste supervisado (SFT) con formato ChatML y pérdida calculada solo sobre los turnos del asistente (`assistant-only loss`), con una probabilidad `NO_SYS_P = 0.30` de omitir el prompt de sistema, de modo que el modelo mantiene su identidad incluso sin instrucciones explícitas. Finalmente, las matrices factorizadas se colapsan en un `LlamaForCausalLM` denso estándar con una diferencia máxima de logits de `3.39e-3`, lo que permite exportar a GGUF y ejecutar con herramientas convencionales. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con respuestas directas y breves por diseño.
- Escritura de código en el lenguaje Kenga, propio del ecosistema del autor.
- Autoidentificación: el modelo conoce su nombre (Kenga / Kenga-Coder), su creador y su "carácter" sin necesidad de prompt de sistema.
- Conversación multi-turno en formato ChatML.
- Razonamiento básico y respuesta a preguntas simples dentro de su ventana de 512 tokens.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Experimentación arquitectónica con factorizaciones de bajo rango: investigadores pueden estudiar el efecto del Z Rank Curriculum comparando el checkpoint factorizado (`ckpt/kenga_zlm_sft.pt`) con el modelo denso colapsado.
- Despliegue en dispositivos de recursos muy limitados: con 97 MB en Q8_0, el modelo cabe en CPU sin GPU, Raspberry Pi o entornos embebidos para pruebas de concepto.
- Asistente conversacional de dominio cerrado en ruso: gracias a su entrenamiento SFT en ChatML, puede gestionar diálogos breves de atención al cliente o FAQ donde el contexto no supere 512 tokens.
- Generación de snippets en Kenga: útil para demostraciones del lenguaje kenga-lang y para validar su toolchain con un modelo que lo conoce de forma nativa.
- Base para fine-tuning educativo: su licencia MIT y su reducido tamaño lo hacen adecuado para cursos y talleres donde se enseña a entrenar y colapsar modelos de bajo rango.
- Pruebas de integración con llama.cpp, Ollama y LM Studio: sirve como banco de pruebas ligero para validar pipelines de inferencia GGUF antes de escalar a modelos mayores.
- Reproducción de investigación sobre identidad y prompting: permite estudiar cómo un modelo mantiene su autoidentidad con y sin prompt de sistema (`NO_SYS_P = 0.30`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en Q8_0 (~97 MB de pesos más overhead de contexto) y menos de 1 GB en F16 (~183 MB).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona también en CPU pura.
- Cabe holgadamente en GPU de consumo: GTX 1050, RTX 3050, RTX 4060, e incluso en iGPU y dispositivos ARM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio, Ollama y Transformers con `LlamaForCausalLM`.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera inferencia en tiempo real incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kenga-ZLM (este) | 91,2 M | 512 | ru, en | MIT | safetensors, GGUF |
| GermannM/Kenga | ~1.500 M (según fuente web) | 32K (según fuente web) | ru (principal), en | no disponible | no disponible |
| Kenga-Coder-14B-Z | 14 B (por nombre) | no disponible | no disponible | no disponible | no disponible |
| Kenga-Prophet-Native | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de la misma categoría (decoders de menos de 100 M de parámetros) no está disponible en la información proporcionada. El modelo más directamente emparentado es GermannM/Kenga, del mismo autor, de mayor tamaño y contexto según la fuente web consultada.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (512 tokens): no apta para documentos largos ni conversaciones extensas.
- Vocabulario limitado (8192 tokens): puede fragmentar de forma ineficiente texto fuera de ruso e inglés.
- Entrenado desde cero con un volumen de datos no documentado: alta probabilidad de alucinaciones y conocimiento factual escaso.
- Sesgos potenciales derivados de un SFT con identidad y "carácter" definidos por el autor (orientación prorrusa declarada en la model card), lo que puede introducir sesgos en respuestas políticas o históricas.
- Idiomas soportados limitados a ruso e inglés; el castellano no está contemplado y el rendimiento en él será previsiblemente pobre.
- Licencia MIT: permite uso comercial, pero el modelo no ofrece garantías de calidad para producción.
- Sin datos publicados de benchmarks, evaluación de seguridad ni robustez frente a prompts adversarios.
- El checkpoint factorizado (`ckpt/kenga_zlm_sft.pt`) requiere código específico del Z-system para su uso; solo la versión colapsada es estándar.

## Enlaces

- Hugging Face: https://huggingface.co/GermannM/Kenga-ZLM
- Modelo hermano Kenga: https://huggingface.co/GermannM/Kenga
- Kenga-Coder-14B-Z: https://huggingface.co/GermannM/Kenga-Coder-14B-Z
- Kenga-Prophet-Native: https://huggingface.co/GermannM/Kenga-Prophet-Native
- Repositorio kenga-lang: https://github.com/GermannM3/kenga-lang
- Repositorio z-system: https://github.com/GermannM3/z-system
- Página en Featherless AI: https://featherless.ai/models/GermannM/Kenga
