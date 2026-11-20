# DumAcc000111/LFM2.5-24B-A2B-NF4

## Resumen

LFM2.5-24B-A2B-NF4 es una cuantización de 4 bits del modelo LiquidAI/LFM2.5-24B-A2B, un transformer con arquitectura de mezcla de expertos (MoE) desarrollado originalmente por Liquid AI. Esta versión concreta, publicada por el usuario DumAcc000111, no está pensada para inferencia rápida sino para un objetivo muy específico: permitir el ajuste fino con LoRA/QLoRA en máquinas sin GPU. Para ello, los pesos de los expertos (aproximadamente el 95 % de los 24 000 millones de parámetros) se almacenan en formato NF4 de 4 bits, mientras que el resto de tensores (embeddings, atención, convoluciones, normas, router y capas densas 0-1) se mantienen sin modificar en sus dtypes originales.

El resultado es un repositorio de 15 GB que cabe en la memoria RAM de un servidor de CPU convencional, lo que abre la puerta al entrenamiento de adaptadores en hardware sin acelerador gráfico. El modelo es un derivado independiente y no está respaldado por Liquid AI; todos los derechos del modelo original permanecen en manos de Liquid AI, Inc., y se distribuye bajo la LFM Open License v1.0.

La relevancia de esta ficha radica en que documenta un caso de uso poco habitual: la cuantización no como técnica de despliegue, sino como técnica de habilitación del entrenamiento en CPU. Es importante subrayar que no es un reemplazo directo de `AutoModelForCausalLM.from_pretrained`, sino que requiere un script de carga específico (`load_nf4.py`) que reconstruye el modelo e inserta los expertos de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según nomenclatura lfm2_moe del modelo base |
| Parametros totales | 24 000 millones (aproximado, según el nombre del modelo base) |
| Parametros activos | No disponible (el modelo base se denomina A2B, lo que sugiere aproximadamente 2 000 millones activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 de 4 bits (blocksize 64, sin compresión de estadísticas) aplicada únicamente a los pesos de los expertos; el resto de tensores conserva su dtype original |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (reempaquetados en `nf4_cache/rest.safetensors` y 38 archivos `nf4_cache/layer_XX.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 24 000 millones de parámetros totales. La información disponible indica que la configuración utiliza 4 expertos por token y que los pesos de los expertos representan aproximadamente el 95 % del total de parámetros. La arquitectura incluye proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `out_proj`), proyecciones de convolución (`in_proj`), capas densas en las posiciones 0-1, un router y capas de normalización. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La modificación introducida en esta versión consiste en la cuantización de cada matriz de experto (`feed_forward.experts.{e}.w1/w2/w3`) desde bf16 a NF4 mediante `bitsandbytes.functional.quantize_4bit` con blocksize 64 y `compress_statistics=False`. Cada archivo de capa almacena los pesos empaquetados (uint8) y las escalas absmax (float32). Los archivos de configuración, tokenizador y plantilla de chat son byte a byte idénticos a los del repositorio original. La cuantización es con pérdida: los expertos son aproximaciones, no réplicas exactas de los valores originales.

## Capacidades

- Generación de texto y conversación, según la etiqueta `text-generation` y `conversational` del repositorio.
- Entrenamiento de adaptadores LoRA/QLoRA sobre CPU, que es el propósito declarado de esta versión.
- Compatibilidad con PEFT para el ajuste fino de módulos de atención y convolución.
- Conversión del adaptador entrenado a GGUF mediante `convert_lora_to_gguf.py` para su aplicación sobre el modelo oficial en formato GGUF.
- Configuración del número de expertos por token en la carga (`load_model(path, experts=3)`), lo que permite alinear el entrenamiento con el número de expertos usado en inferencia.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión o audio en la documentación proporcionada.

## Casos de uso

- Ajuste fino en servidores sin GPU: el modelo permite entrenar adaptadores LoRA en un servidor de CPU con 16 núcleos y aproximadamente 15 GB de RAM para los pesos, usando el script `load_nf4.py` y PEFT. Es el escenario para el que fue diseñado explícitamente.
- Experimentación académica con recursos limitados: investigadores sin acceso a clústeres GPU pueden adaptar un modelo de 24 000 millones de parámetros a dominios específicos, con un consumo total de 25-32 GB de RAM durante el entrenamiento con checkpointing de gradientes.
- Prototipado de adaptadores antes de un entrenamiento a mayor escala: permite validar hiperparámetros y configuraciones de LoRA en CPU antes de trasladar el pipeline a hardware con GPU.
- Entrenamiento de adaptadores para dominios verticales: con un throughput de aproximadamente 100 tokens/s en filas de 2048 tokens sobre un servidor x86 de 16 núcleos, es viable ajustar el modelo a corpus especializados de tamaño moderado.
- Despliegue del adaptador en producción mediante GGUF: una vez entrenado el adaptador, se convierte con `convert_lora_to_gguf.py` y se aplica sobre el modelo oficial `LiquidAI/LFM2.5-24B-A2B-GGUF`, lo que permite servir el modelo ajustado con llama.cpp.
- Investigación sobre cuantización y entrenamiento: el repositorio documenta con detalle el proceso de cuantización NF4 de los expertos, lo que lo convierte en una referencia para estudiar el impacto de la cuantización en el ajuste fino de modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son de entrenamiento: aproximadamente 100 tokens/s en un servidor x86 de 16 núcleos con filas de 2048 tokens, y un consumo de 25-32 GB de RAM en total con checkpointing de gradientes y logits calculados solo en las posiciones entrenadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; esta versión está pensada para entrenamiento en CPU, no para inferencia. Para inferencia se recomienda usar los archivos GGUF oficiales.
- RAM para los pesos: aproximadamente 15 GB.
- RAM durante el entrenamiento: 25-32 GB en total con checkpointing de gradientes y filas de varios miles de tokens.
- GPU recomendadas: no aplica; el propósito es funcionar sin GPU. No se proporcionan datos sobre uso con GPU.
- ¿Cabe en GPU de consumo? No es el objetivo declarado; no se dispone de información al respecto.
- Opciones de despliegue: carga mediante `load_nf4.py` (script incluido en el repositorio) para entrenamiento; para inferencia, conversión del adaptador a GGUF y uso con llama.cpp sobre el modelo oficial.
- Latencia y throughput: aproximadamente 100 tokens/s de entrenamiento en un servidor x86 de 16 núcleos con filas de 2048 tokens. No se proporcionan datos de latencia de inferencia.
- Versiones de software probadas: torch 2.15.0 (CPU), transformers 5.22.1, peft 0.21.2, bitsandbytes 0.50.2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Propósito |
|---|---|---|---|---|---|
| DumAcc000111/LFM2.5-24B-A2B-NF4 | 24 000 M (MoE) | No disponible | NF4 en expertos | LFM Open License v1.0 | Entrenamiento LoRA/QLoRA en CPU |
| LiquidAI/LFM2.5-24B-A2B | 24 000 M (MoE) | No disponible | bf16 | LFM Open License v1.0 | Modelo base original, uso general |
| LiquidAI/LFM2.5-24B-A2B-GGUF | 24 000 M (MoE) | No disponible | GGUF (varias) | LFM Open License v1.0 | Inferencia optimizada |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos sobre modelos alternativos de otros desarrolladores con características equiparables.

## Limitaciones y advertencias

- Cuantización con pérdida: los expertos en NF4 son aproximaciones de los valores originales en bf16; debe usarse el modelo original cuando la precisión completa sea crítica.
- No es un reemplazo directo de `AutoModelForCausalLM.from_pretrained`: requiere el script `load_nf4.py` para construir el modelo e insertar los expertos de 4 bits.
- Orientado a entrenamiento, no a inferencia rápida: para servir el modelo se recomienda usar los archivos GGUF oficiales.
- El dropout debe ser 0 al usar checkpointing de gradientes: un dropout aleatorio cambia las activaciones recomputadas y puede enrutar tokens a expertos distintos en la pasada backward.
- El número de expertos por token debe coincidir entre entrenamiento e inferencia: si se sirve con `--moe-k` en llama.cpp, debe entrenarse con el mismo valor mediante `load_model(path, experts=N)`.
- Derivado independiente no respaldado por Liquid AI: todos los derechos del modelo original permanecen en Liquid AI, Inc.
- Licencia LFM Open License v1.0: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse el archivo `LICENSE` antes de cualquier despliegue en producción.
- Sesgos y alucinaciones: no se dispone de información específica, pero el modelo hereda las limitaciones del modelo base, documentadas en su model card original.
- Idiomas soportados: no disponible.
- Longitud de contexto: no disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DumAcc000111/LFM2.5-24B-A2B-NF4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo base en formato GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Script de carga incluido en el repositorio: `load_nf4.py`
- Licencia: archivo `LICENSE` del repositorio (LFM Open License v1.0)
- Atribuciones: archivo `NOTICE` del repositorio
