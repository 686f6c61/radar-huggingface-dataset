# mradermacher/Olmo3-7B-Animus-V12.0-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF (imatrix) del modelo `Darkhn/Olmo3-7B-Animus-V12.0`, un finetune de la familia OLMo 3 de AllenAI orientado a roleplay y chat, con temática específica de la saga Wings of Fire y contenido etiquetado como NSFW (no apto para todos los públicos). El modelo base es `allenai/olmo-3-7b`, un transformer de 7 mil millones de parámetros entrenado sobre el dataset Dolma 3. La cuantización fue realizada por `mradermacher` y está publicada bajo licencia Apache 2.0.

El repositorio ofrece una única cuantización i1-Q2_K (3.0 GB) más el archivo de imatrix para generar cuantizaciones propias. No se incluyen otras variantes de cuantización en este repositorio (las versiones estáticas están en el repositorio hermano `Olmo3-7B-Animus-V12.0-GGUF`). Este modelo está pensado para usuarios que buscan un modelo de rol/chat ligero y ejecutable en hardware modesto, aunque con una calidad de cuantización muy baja (Q2_K) que puede afectar la fidelidad de la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo 3, basado en el modelo base `allenai/olmo-3-7b`) |
| Parametros totales | 7.298.011.136 (7.3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion del modelo base; se recomienda consultar la ficha de OLMo 3) |
| Tipos de cuantizacion | i1-Q2_K (unico archivo de pesos en este repo) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el entrenamiento especifico del finetune `Animus-V12.0`. El modelo base `allenai/olmo-3-7b` es un transformer denso de 7 B de parametros entrenado por Allen AI sobre el dataset Dolma 3, con una estrategia de entrenamiento por etapas (staged training) y variantes Base, Instruct y Think. El finetune `Darkhn/Olmo3-7B-Animus-V12.0` esta orientado a roleplay y chat, con tematica de la serie *Wings of Fire* y contenido explicito (NSFW). No se dispone de informacion sobre el dataset de finetune, el metodo (RLHF, DPO, etc.) ni el numero de tokens de entrenamiento. La cuantizacion fue realizada con imatrix (importance matrix) por `mradermacher`, lo que optimiza la calidad de los quants de baja precision.

## Capacidades

- Generacion de texto conversacional y roleplay en ingles.
- Chat multi-turno con contexto de dialogo, adecuado para interacciones de personajes.
- Capacidad de adaptacion a estilos narrativos (tematica Wings of Fire).
- No se ha confirmado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni vision/audio. Dado que es un modelo de 7 B generalista, podria tener habilidades basicas de codigo y matematicas, pero no se han documentado.

## Casos de uso

- **Roleplay narrativo**: el modelo puede generar dialogos y descripciones en escenarios de ficcion, especialmente con la tematica de *Wings of Fire*. Se usaria con un sistema de prompt que defina el contexto y los personajes.
- **Chat conversacional**: como asistente de conversacion en ingles, con capacidad de mantener una charla coherente. Puede integrarse en aplicaciones de mensajeria o bots.
- **Escritura creativa asistida**: generar ideas, borradores o continuaciones de historias, aunque su baja cuantizacion (Q2_K) puede reducir la coherencia en textos largos.
- **Experimentos educativos**: para estudiar el efecto de la cuantizacion extrema en la calidad de generacion de un modelo de 7 B.
- **Prototipos de bajo coste**: en entornos sin GPU potente, este GGUF de 3 GB puede ejecutarse en CPU o GPU con poca VRAM, permitiendo probar funcionalidades de chat antes de migrar a una cuantizacion superior.
- **Pruebas de compatibilidad**: para verificar si el modelo funciona con llama.cpp, Ollama o otros motores GGUF antes de descargar la version completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF i1-Q2_K ocupa 3.0 GB, por lo que cabria en GPUs con al menos 4 GB de VRAM (por ejemplo, GTX 1060 6GB, RTX 3050 4GB, o incluso en CPU con suficiente RAM). Sin embargo, la cuantizacion Q2_K es de muy baja precision y puede degradar la calidad de la salida.
- **GPU recomendadas**: para un rendimiento aceptable con este tamaño, una RTX 3060 (12 GB) o superior seria adecuada. No se requiere GPU de gama alta.
- **Ejecucion en CPU**: es posible usar llama.cpp u Ollama en CPU con 8 GB de RAM, pero la velocidad de inferencia sera lenta (del orden de 1-3 tokens/s).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui (oobabooga) y cualquier backend compatible con GGUF. No se recomienda vLLM o TGI para GGUF, ya que estan orientados a safetensors.
- **Latencia y throughput**: no disponibles, dependen del hardware y del motor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso principal |
|---|---|---|---|---|---|
| `mradermacher/Olmo3-7B-Animus-V12.0-i1-GGUF` | 7.3 B | no disponible | i1-Q2_K | Apache 2.0 | Roleplay/chat NSFW |
| `allenai/olmo-3-7b` (base) | 7 B | no disponible | safetensors | Apache 2.0 | General, ciencia |
| `TheBloke/Mistral-7B-Instruct-v0.2-GGUF` | 7 B | 32k (aprox.) | Q4_K_M | Apache 2.0 | Chat instructivo |
| `TheBloke/Llama-2-7B-Chat-GGUF` | 6.7 B | 4k | Q4_K_M | Llama 2 license | Chat general |

La comparacion es orientativa. El modelo de `mradermacher` se distingue por su tematica de rol, mientras que los otros son alternativas genericas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Contenido NSFW**: el modelo esta etiquetado como `nsfw` y `not-for-all-audiences`. No es adecuado para entornos de produccion o usuarios menores.
- **Baja cuantizacion**: el archivo i1-Q2_K es una de las cuantizaciones mas agresivas (menor precision). Puede provocar alucinaciones, incoherencias o perdida de fidelidad en la generacion.
- **Idioma**: solo se declara soporte para ingles. No se recomienda para otros idiomas.
- **Sin informacion de entrenamiento**: no se conocen los datos de finetune, por lo que los sesgos especificos son desconocidos.
- **Licencia**: Apache 2.0 permite uso comercial, pero la naturaleza del contenido (NSFW) puede generar restricciones legales en algunos paises o plataformas.
- **Sin garantias**: no hay benchmarks publicados, por lo que no se puede evaluar su rendimiento real frente a alternativas.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/mradermacher/Olmo3-7B-Animus-V12.0-i1-GGUF)
- [Repositorio HuggingFace del modelo base (finetune)](https://huggingface.co/Darkhn/Olmo3-7B-Animus-V12.0)
- [Modelo base OLMo 3 de Allen AI](https://huggingface.co/allenai/olmo-3-7b)
- [Pagina oficial de OLMo (AllenAI)](https://allenai.org/olmo)
- [Repositorio GitHub OLMo](https://github.com/allenai/OLMo)
- [Pagina de LM Studio para OLMo 3](https://lmstudio.ai/models/allenai/olmo-3-7b)
- [Repositorio de cuantizaciones estaticas del mismo modelo](https://huggingface.co/mradermacher/Olmo3-7B-Animus-V12.0-GGUF)
