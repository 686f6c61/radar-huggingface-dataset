# LuffyTheFox/Leaving-LLM-Developement

## Resumen

Genesis3.6-35B-A3B-Uncensored es un modelo derivado del Qwen3.6-35B-A3B en su variante sin censura de HauhauCS, publicado por el usuario LuffyTheFox bajo el identificador `LuffyTheFox/Leaving-LLM-Developement`. No se trata de un entrenamiento desde cero ni de un fine-tuning convencional: el autor describe su trabajo como una "reparación de señal" sobre los pesos del modelo base, aplicando un algoritmo propio denominado Genesis que actúa sobre tensores en formato GGUF mediante descomposición en valores singulares (SVD) personalizada. El modelo combina el base sin censura con datos de un fine-tuning orientado a agentes (Hermes) sobre el dataset `NousResearch/hermes-function-calling-v1`.

La arquitectura subyacente es un transformer híbrido con mezcla de expertos (MoE) de 35B parámetros totales y aproximadamente 3B activos por token, con 256 expertos (8 enrutados más 1 compartido). Incorpora capas de atención lineal Gated DeltaNet junto a atención clásica, y soporta entrada multimodal imagen-texto, lo que lo sitúa en la categoría de modelos conversacionales con visión. El contexto recomendado por el autor es de 128K tokens como mínimo para preservar el modo de razonamiento, y sugiere 65536 tokens en configuraciones de consumo.

Su relevancia actual es doble: por un lado, ofrece una alternativa sin censura y con soporte de agentes sobre una base Qwen3.6 reciente; por otro, introduce una metodología de post-procesado numérico (Genesis) que el autor presenta como independiente de la arquitectura y aplicable a cualquier modelo en GGUF. La licencia Apache 2.0 facilita su uso comercial, aunque las advertencias sobre la naturaleza no verificada del proceso de "reparación" son importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE y atención lineal Gated DeltaNet |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por forward pass (MoE) |
| Longitud de contexto | 128K recomendado por el autor; 65536 en configuración de consumo |
| Tipos de cuantizacion | GGUF (incluye NVFP4 recomendado); requiere archivo `mmproj` para visión |
| Idiomas soportados | en, zh, multilingual (sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 59,3 GB); safetensors reportados en metadatos (34,66B parámetros) |

## Arquitectura y entrenamiento

El modelo parte de `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`, un Qwen3.6 de 35B totales con ~3B activos, 256 expertos (8 enrutados + 1 compartido) y arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con atención tradicional. Sobre esa base, el autor transfiere "alrededor de 2k bloques de dos tensores de expertos FFN" procedentes del fine-tuning `DJLougen/hermes-qwen3.5-35b-a3b-GGUF`, entrenado sobre `NousResearch/hermes-function-calling-v1` para comportamiento de agente. No se especifica el número de tokens de entrenamiento original ni la composición completa del dataset del base.

La innovación declarada es el algoritmo Genesis, descrito como un proceso de "regeneración y calibración de datos post-entrenamiento" que opera sobre los bytes del archivo GGUF sin reentrenar. Consta de tres etapas: (1) escaneo y reequilibrio de tensores `ssm_conv1d` (memoria de contexto largo) mediante SVD personalizada; (2) detección y reducción de ruido en tensores excluyendo `token_embd.weight`, `output.weight`, `ffn_gate_inp_shexp.weight`, tensores 1D, biases y normas; (3) sustitución de bloques nulos por fragmentos que mejor se ajustan a la distribución de pesos. El autor afirma haberlo desarrollado durante aproximadamente medio año y ejecutado en una Tesla T4 gratuita de Google Colab. No hay publicación revisada por pares ni validación independiente del método.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (128K recomendado).
- Razonamiento en modo "thinking" y modo directo (non-thinking), con parámetros de muestreo diferenciados.
- Generación de código, incluyendo salida estructurada como SVG (el autor incluye un ejemplo de pelícano en bicicleta).
- Soporte multimodal imagen-texto (pipeline `image-text-to-text`), requiriendo el archivo `mmproj` junto al GGUF principal.
- Tool calling y function calling, heredado del fine-tuning sobre `hermes-function-calling-v1`.
- Comportamiento orientado a agentes y razonamiento multi-paso (herencia del finetune Hermes).
- Multilingüe, con inglés y chino confirmados y soporte "multilingual" genérico.
- Variante sin censura ("uncensored"), con menor rechazo a peticiones que los modelos alineados estándar.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en llama.cpp con `--jinja`.

## Casos de uso

- Agentes autónomos con tool calling: el modelo puede encadenar llamadas a funciones y razonamiento multi-paso, adecuado para orquestadores que necesitan decidir qué herramienta invocar en cada turno gracias a su herencia del finetune Hermes.
- Asistente conversacional de contexto largo: con 128K tokens de ventana puede mantener conversaciones extensas o procesar documentos completos sin truncar, útil en atención al cliente técnica o análisis de contratos.
- Generación de código en pipelines: su capacidad de producir salidas estructuradas (SVG, JSON, código) y su soporte de tool calling permiten integrarlo en flujos de CI/CD o generación de artefactos.
- Análisis de imágenes con texto: al ser `image-text-to-text`, puede describir capturas, extraer información de diagramas o responder preguntas sobre imágenes en aplicaciones de soporte o documentación.
- Investigación sobre alineación y censura: al ser una variante "uncensored", sirve para estudiar comportamientos del modelo sin las capas de rechazo habituales, comparando respuestas frente al base alineado.
- Despliegue en hardware de consumo: con cuantización NVFP4 y offload de expertos MoE a CPU, el autor reporta ~30 tokens/s en una RTX 3060 de 12 GB, lo que lo hace viable en estaciones de trabajo modestas.
- Experimentación con post-procesado numérico: el modelo sirve como caso de estudio del algoritmo Genesis para investigadores interesados en técnicas de reparación de pesos sin reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta un rendimiento anecdótico de aproximadamente 30 tokens por segundo en una RTX 3060 de 12 GB con cuantización NVFP4 y configuración específica de LM Studio (offload máximo, MoE Expert Cache de 4096 MiB, contexto 65536). No hay datos de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repo pesa 59,3 GB en GGUF, por lo que las cuantizaciones de 4 bits rondarían los 18-20 GB y NVFP4 sería aún más compacta.
- GPU recomendadas: el autor valida RTX 3060 de 12 GB con offload parcial de expertos a CPU; para carga completa se necesitarían GPUs de 24 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo con cuantización agresiva y offload de expertos MoE a CPU (RTX 3060 12 GB confirmado por el autor).
- Opciones de despliegue: llama.cpp (con flag `--jinja`), LM Studio (configuración detallada por el autor), y presumiblemente cualquier runtime compatible con GGUF; no se mencionan vLLM ni TGI.
- Latencia y throughput: ~30 tokens/s en RTX 3060 12 GB con NVFP4 y configuración indicada; sin datos para otras GPUs.
- Para visión es imprescindible descargar el archivo `mmproj` junto al GGUF principal.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Genesis3.6-35B-A3B-Uncensored | ~35B | ~3B | 128K | Apache 2.0 | Variante sin censura con post-procesado Genesis |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B | ~3B | no disponible | no disponible | Base directa del modelo |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35B | ~3B | no disponible | no disponible | Fuente del finetune Hermes transferido |
| Qwen3.6-35B-A3B (original) | ~35B | ~3B | no disponible | no disponible | Base alineada de Alibaba, sin modificaciones |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El proceso Genesis no ha sido validado de forma independiente ni publicado en un venue revisado por pares; sus afirmaciones sobre "reparación de señal" deben tomarse con cautela.
- La variante "uncensored" implica menor rechazo a contenido sensible, lo que eleva el riesgo de generar material inapropiado, ofensivo o inseguro en producción sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de ~35B con ~3B activos; no hay evaluaciones publicadas que cuantifiquen su fiabilidad.
- El autor recomienda mantener al menos 128K de contexto para preservar el modo de razonamiento, lo que incrementa los requisitos de memoria en despliegue.
- El soporte de visión requiere el archivo `mmproj` y no está garantizado en todos los runtimes.
- Los idiomas soportados no están listados en detalle; solo se confirman inglés, chino y "multilingual" genérico.
- Aunque la licencia es Apache 2.0, la cadena de modelos base y finetunes intermedios puede imponer condiciones adicionales no verificadas en esta ficha.
- La model card incluye direcciones de donación en criptomonedas y contacto personal; no constituyen garantía de soporte ni mantenimiento del modelo.
- No hay información sobre sesgos específicos medidos, composición del dataset de entrenamiento ni procesos de RLHF/DPO en la cadena de derivación.

## Enlaces

- Hugging Face: https://huggingface.co/LuffyTheFox/Leaving-LLM-Developement
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Chat template recomendada: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates/raw/main/archive/qwen3.6/chat_template-v19.jinja
- System prompt sugerido: https://huggingface.co/LuffyTheFox/Genesis3.6-35B-A3B-Uncensored-GGUF/blob/main/System_Prompt.txt
- Ejemplo SVG: https://huggingface.co/LuffyTheFox/Genesis3.6-35B-A3B-Uncensored-GGUF/blob/main/pelikan.svg
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Paper referenciado en tags (arxiv:2605.29843): no verificable en la información disponible
