# mradermacher/Olmo3-7B-Animus-V12.0-GGUF

## Resumen

Este modelo es una cuantización GGUF del fine-tune `Darkhn/Olmo3-7B-Animus-V12.0`, un modelo de 7.298 millones de parámetros orientado a chat y roleplay, desarrollado por Darkhn a partir del modelo base Olmo3-7B de AI2. La cuantización ha sido realizada por mradermacher, quien publica los pesos en formato GGUF para su ejecución eficiente en hardware de consumo y servidores mediante herramientas como llama.cpp u Ollama.

El modelo base Olmo3 (presentado en el artículo arXiv 2512.13961) está diseñado para razonamiento de contexto largo, llamadas a funciones, codificación, instrucción y chat general. El fine-tune de Darkhn lo especializa en roleplay y conversación con temática de la serie *Wings of Fire*, incluyendo contenido NSFW, por lo que no está recomendado para todos los públicos. La licencia Apache-2.0 permite uso comercial, y el modelo está disponible en doce cuantizaciones que van desde Q2_K (3.0 GB) hasta f16 (14.7 GB), cubriendo desde GPUs de consumo hasta servidores de alta capacidad.

Esta ficha se basa exclusivamente en la información pública de HuggingFace y en el artículo técnico de Olmo3; no se han publicado benchmarks específicos para este fine-tune.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información específica sobre el proceso de entrenamiento del fine-tune `Olmo3-7B-Animus-V12.0`. El modelo base, Olmo3-7B, es un transformer decoder-only desarrollado por AI2 con un enfoque en razonamiento de contexto largo, llamadas a funciones, codificación y chat general, según el paper técnico (arXiv 2512.13961). El fine-tune de Darkhn se ha realizado sobre este modelo para adaptarlo a escenarios de roleplay y conversación, presumiblemente mediante fine-tuning supervisado con datos de conversación y narrativa, aunque no se han publicado detalles concretos sobre el dataset ni el método (RLHF, DPO, etc.). La cuantización a GGUF ha sido realizada por mradermacher mediante conversión estática, sin el uso de matrices de importancia (imatrix) ni cuantizaciones ponderadas.

## Capacidades

- Generación de texto conversacional y narrativo, especializado en roleplay y creación de personajes.
- Soporte de chat multi-turno, adecuado para diálogos extensos.
- Capacidad para seguir instrucciones en inglés.
- Generación de contenido con temática NSFW (no apto para todos los públicos).
- Adaptado a la ambientación de *Wings of Fire*, pero no limitado a ella; puede usarse para otros géneros de ficción.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-step específicas para este fine-tune.

## Casos de uso

- Roleplay interactivo en plataformas de chat: el modelo puede gestionar diálogos largos y mantener coherencia en la personalidad de los personajes, gracias a su entrenamiento en narrativa y conversación.
- Creación de personajes para juegos de rol o escritura creativa: se puede usar para generar descripciones, diálogos y arcos argumentales en tiempo real.
- Chatbots de ficción para comunidades de fans de *Wings of Fire*: permite a los usuarios interactuar con personajes de la serie en un entorno controlado.
- Experimentación con fine-tunes de roleplay: sirve como base para probar técnicas de cuantización o para comparar la calidad de generación con otros modelos de 7B.
- Prototipos de asistentes conversacionales con tono informal o narrativo: aunque no es su objetivo principal, puede adaptarse a aplicaciones de entretenimiento.
- Uso educativo para demostrar el efecto de la cuantización en la calidad de generación de texto, comparando distintas versiones (Q4_K_M vs Q8_0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Olmo3-7B reporta métricas en el paper técnico (por ejemplo, MMLU, HumanEval, GSM8K), pero no se ha verificado que el fine-tune `Animus-V12.0` mantenga o supere dichos valores. Por tanto, no se presentan cifras concretas.

## Requisitos de hardware

- Tamaño de los archivos GGUF (aproximado):
  - Q2_K: 3.0 GB
  - Q3_K_M: 3.8 GB
  - Q4_K_M: 4.6 GB
  - Q5_K_M: 5.3 GB
  - Q6_K: 6.1 GB
  - Q8_0: 7.9 GB
  - f16: 14.7 GB
- VRAM estimada para inferencia: se recomienda al menos el tamaño del archivo más un margen para el contexto y los estados intermedios. Por ejemplo, Q4_K_M (4.6 GB) puede ejecutarse en una GPU con 8 GB de VRAM, mientras que Q8_0 (7.9 GB) requiere al menos 12 GB.
- GPU recomendadas: para cuantizaciones hasta Q6_K, una RTX 3060 (12 GB) o RTX 4090 (24 GB) es suficiente. Para f16, se recomienda una A100 o H100.
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio y otros ejecutores de GGUF. No se ha confirmado soporte en vLLM o TGI para este formato.
- Latencia y throughput: no se han medido datos específicos para este modelo; dependerán del hardware y de la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de información para realizar una comparativa cuantitativa con otros modelos de roleplay de 7B (p.ej., Llama-3-8B-Instruct, Mistral-7B-Instruct). La falta de benchmarks publicados impide una comparación de rendimiento. Se puede señalar que el modelo base Olmo3-7B compite con estos modelos en métricas generales, pero el fine-tune puede tener un comportamiento distinto en tareas de roleplay.

## Limitaciones y advertencias

- El modelo está diseñado para generar contenido NSFW y no es apto para menores ni para entornos profesionales.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales en ciertos países.
- No se han publicado estudios sobre sesgos o alucinaciones en este fine-tune; es probable que herede los sesgos del modelo base.
- La ventana de contexto no se especifica; se recomienda verificar el límite real al cargar el modelo.
- Al ser una cuantización estática, la calidad de generación puede degradarse en las versiones de menor bit (Q2_K, Q3_K_S).
- El modelo solo soporta inglés; no es adecuado para aplicaciones multilingües.

## Enlaces

- [Hugging Face - mradermacher/Olmo3-7B-Animus-V12.0-GGUF](https://huggingface.co/mradermacher/Olmo3-7B-Animus-V12.0-GGUF)
- [Hugging Face - Modelo base Darkhn/Olmo3-7B-Animus-V12.0](https://huggingface.co/Darkhn/Olmo3-7B-Animus-V12.0)
- [Paper técnico de Olmo3 (arXiv)](https://arxiv.org/abs/2512.13961)
- [Repositorio OLMo en GitHub](https://github.com/allenai/OLMo)
- [Página oficial de Olmo (AI2)](https://allenai.org/olmo)
