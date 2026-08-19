# mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q8_0-GGUF

## Resumen

Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q8_0-GGUF es una cuantización en formato GGUF (Q8_0) del modelo BF16 homónimo creado por mlasli, que a su vez es una versión "abliterated" del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B. La técnica de abliteration, aplicada mediante la herramienta Heretic, elimina la dirección de rechazo del modelo original, dando como resultado un modelo que no se niega a responder a peticiones que el modelo alineado normalmente rechazaría. El modelo base de NVIDIA es un híbrido Mamba-MoE con 31,6 mil millones de parámetros totales y 3 mil millones de parámetros activos, diseñado para generación de texto eficiente.

Esta versión cuantizada está pensada para ejecutarse localmente mediante llama.cpp, ocupando 33,6 GB en disco. El autor reporta una tasa de rechazo del 0% y un 100% de cumplimiento en una evaluación de 200 pruebas con comportamientos dañinos, lo que indica que el modelo responde sin filtros de seguridad. Es relevante para desarrolladores e investigadores interesados en modelos sin alineación, roleplay o generación de contenido sin restricciones, aunque con importantes advertencias legales y éticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h_moe (hibrido Mamba-MoE) |
| Parametros totales | 31.577.940.288 (31,6B) |
| Parametros activos | 3B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original de NVIDIA, NVIDIA-Nemotron-3.5-Lightning-30B-A3B, emplea una arquitectura híbrida que combina capas Mamba (modelos de espacio de estados) con capas de mezcla de expertos (MoE). Con 31,6B parámetros totales y solo 3B activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional. La versión de mlasli aplica abliteration mediante la herramienta Heretic, que identifica y elimina la dirección de rechazo en el espacio de activaciones del modelo, resultando en un comportamiento "uncensored". No se dispone de información sobre el dataset de entrenamiento original, el número de tokens procesados ni el proceso de alineación (RLHF, DPO, etc.) en la documentación proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno, con soporte para roleplay y narrativa interactiva.
- Soporte multilingue para ingles, espanol, frances, aleman, italiano y japones.
- Ausencia de rechazos: el modelo responde a practicamente cualquier peticion, incluyendo contenido que el modelo original rechazaria (0% refusals, 100% compliance en la evaluacion del autor).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision o audio en la informacion disponible.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede mantener personajes y tramas complejas sin limitaciones tematicas, ideal para juegos de rol por texto o chatbots de entretenimiento.
- Generacion de dialogos para videojuegos: permite crear guiones con contenido adulto o controvertido sin filtros, util en producciones independientes.
- Escritura creativa sin restricciones: autores pueden explorar temas tabu o escenas explicitas en novelas o relatos sin que el modelo se niegue.
- Traduccion informal y localizacion: al soportar seis idiomas, puede traducir contenido coloquial o con matices culturales que otros modelos censurarian.
- Investigacion sobre alineacion y seguridad: permite estudiar el comportamiento de modelos sin capas de rechazo, comparando respuestas con el modelo original.
- Generacion de contenido para adultos: el modelo puede producir material explicito bajo demanda, aunque esto conlleva riesgos legales y eticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta una evaluacion propia sobre rechazos y cumplimiento:

| Metrica | Resultado |
|---|---|
| Refusals | 0% |
| Compliance | 100% |
| KL Divergence | 0.0397 |
| Trials | 200 |

Esta evaluacion se realizo sobre el modelo BF16 fusionado, no sobre la cuantizacion Q8_0, y utilizo un detector automatico de palabras clave que produjo falsos positivos; la revision manual encontro 0 rechazos genuinos.

## Requisitos de hardware

- El archivo GGUF Q8_0 pesa 33,6 GB, por lo que se necesita al menos 34 GB de VRAM para cargarlo completamente en GPU, o suficiente RAM para ejecucion en CPU.
- GPUs recomendadas: NVIDIA A100 40GB, A6000 48GB, o similares con 40GB o mas de memoria. Una RTX 4090 (24GB) no es suficiente sin offloading parcial a CPU.
- En CPU, se requiere un equipo con al menos 40 GB de RAM y un procesador moderno; la velocidad sera significativamente menor que en GPU.
- Despliegue: compatible con llama.cpp (build b10326 o superior) mediante `llama-cli` o `llama-server`. Tambien puede usarse con otros frontends que soporten la arquitectura `nemotron_h_moe`, como Ollama si se anade manualmente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoria. El modelo original de NVIDIA (sin abliteration) es la referencia directa, pero no se han publicado benchmarks comparativos. Otras alternativas como Mixtral 8x7B o Qwen2.5-MoE podrian ser comparables en tamano, pero no hay datos en la informacion disponible.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente despojado de su alineacion de seguridad. Puede generar contenido ilegal, violento, sexualmente explicito o danino sin restricciones.
- La licencia NVIDIA Open Model License puede imponer restricciones de uso comercial o de redistribucion; es necesario revisar sus terminos antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: al no tener capas de rechazo, el modelo puede afirmar hechos falsos con total seguridad, especialmente en temas delicados.
- Solo existe la cuantizacion Q8_0; no hay versiones de menor precision que reduzcan los requisitos de memoria.
- La arquitectura `nemotron_h_moe` requiere una version reciente de llama.cpp (b10326+); versiones antiguas no cargaran el modelo.
- El modelo no ha sido evaluado en benchmarks estandar, por lo que su rendimiento en tareas de razonamiento, codigo o matematicas es desconocido.
- Uso responsable: el autor advierte que la abliteration elimina la seguridad y que el usuario es responsable de cumplir con las leyes locales.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q8_0-GGUF)
- [Modelo base BF16 (abliterated)](https://huggingface.co/mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-BF16)
- [Modelo original de NVIDIA](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16)
- [Heretic (herramienta de abliteration)](https://github.com/mlabonne/heretic-llm)
- [Licencia NVIDIA Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/)
