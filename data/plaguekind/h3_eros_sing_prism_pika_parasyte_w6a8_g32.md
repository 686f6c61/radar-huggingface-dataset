# Plaguekind/H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32

## Resumen

Este repositorio contiene una cuantización de 6 bits de un modelo de difusión para generación de vídeo, derivado de la familia MiniMax-H3 (Hailuo H3) en su variante Ref2VA. El autor, Plaguekind, parte de un merge de los modelos SingularityV2, 10Eros Max, PRISM-v2 y PikaFlex (a intensidad 0.85) y lo reempaqueta en el formato nativo `w6a8_int8` de ComfyUI, con pesos de 6 bits, activaciones int8, tamaño de grupo 32 y ConvRot de grupo 256. El resultado ocupa unos 15,9 GB frente a los aproximadamente 20,2 GB del checkpoint int8HQ original.

La relevancia de esta ficha es práctica: se trata de un artefacto de despliegue, no de un modelo entrenado desde cero. Su interés reside en que reduce el peso del checkpoint manteniendo una calidad prácticamente idéntica al origen (el autor declara un error aproximado del 0,5 % con la misma semilla y ajustes) y en que carga con los kernels cuantizados estándar de ComfyUI, sin necesidad de nodos personalizados. Esto lo hace directamente utilizable en flujos de trabajo de generación de vídeo con referencia de imagen.

No se dispone de información sobre arquitectura interna, número de parámetros, longitud de contexto, idiomas ni licencia más allá de la referencia a los modelos de origen. Todos estos datos se marcan como no disponibles a lo largo de la ficha. El repositorio registra 0 descargas y 2 likes en el momento de la consulta, y su fecha de creación es el 5 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión para vídeo (familia MiniMax-H3, variante Ref2VA); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de texto) |
| Tipos de cuantización | `w6a8_int8` (w6a8_g32_convrot): pesos de 6 bits, activaciones int8, group size 32, ConvRot group 256 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a las licencias de los modelos de origen) |
| Formato de pesos | safetensors (`10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_w6a8_g32.safetensors`) |
| Tamaño del repositorio | 15,9 GB |
| Clase de carga en ComfyUI | `UNETLoader` (diffusion_model) |
| Modelo base | MiniMaxAI/MiniMax-H3, Comfy-Org/MiniMax-H3, OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM, TenStrip/10Eros-Max |

## Arquitectura y entrenamiento

El artefacto es una requantización, no un entrenamiento. El punto de partida es el checkpoint `10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_int8HQ.safetensors` del repositorio de OliviaRossi, descrito como la mezcla PRISM + PIKA a intensidad 0.85 (UPD4 de ese repositorio). Sobre ese fichero se aplica una conversión al formato cuantizado nativo de ComfyUI `w6a8_int8` con group size 32 y ConvRot group 256, dando como resultado un modelo de aproximadamente 15,9 GB.

La cadena de procedencia incluye el modelo MiniMax-H3 original de MiniMaxAI, la versión publicada por Comfy-Org y los merges de la comunidad SingularityV2, 10Eros Max, PRISM-v2 y PikaFlex. No se dispone de datos sobre el número de tokens, la composición del dataset, el proceso de alineación (RLHF/DPO) ni innovaciones técnicas de la arquitectura subyacente. La única innovación documentada en este repositorio es la propia cuantización: pesos de 6 bits con activaciones int8 y agrupación de 32, compatible con los kernels estándar de ComfyUI.

## Capacidades

- Generación de vídeo mediante modelo de difusión, en la variante Ref2VA (referencia a vídeo) de la familia MiniMax-H3 Hailuo.
- Carga directa en ComfyUI con el nodo `UNETLoader`, usando el text encoder y el VAE habituales de H3.
- Ejecución con los kernels cuantizados de serie de ComfyUI, sin nodos personalizados.
- Calidad de salida declarada como casi idéntica al checkpoint int8HQ de origen con la misma semilla y ajustes (error aproximado del 0,5 %).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento; se trata de un modelo generativo de vídeo, no de un LLM.

## Casos de uso

- Generación de vídeo a partir de una imagen de referencia: el modelo se carga en `UNETLoader` junto al text encoder y el VAE de H3, y se utiliza para animar o transformar una imagen de entrada en una secuencia de vídeo, aprovechando la variante Ref2VA.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: al ocupar 15,9 GB en lugar de los 20,2 GB del int8HQ, reduce el requisito de memoria y facilita las pruebas iterativas en ComfyUI.
- Integración en flujos de trabajo ya existentes de ComfyUI: al usar los kernels cuantizados nativos, se puede sustituir el checkpoint int8HQ por este sin reescribir los grafos ni instalar dependencias adicionales.
- Exploración de estilos visuales derivados de merges de la comunidad: el modelo incorpora la mezcla SingularityV2, 10Eros Max, PRISM-v2 y PikaFlex, útil para comparar el efecto de cada merge sobre un mismo prompt y semilla.
- Despliegue en entornos con VRAM ajustada: la reducción de tamaño permite mantener el modelo cargado junto con otros componentes del pipeline de vídeo en GPUs de gama alta de consumo, siempre que la memoria total lo permita.
- Reproducción de resultados: al declararse una equivalencia casi exacta con el int8HQ, sirve para replicar salidas de ese checkpoint en equipos donde no cabe el fichero original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de calidad aportado por el autor es una comparación subjetiva con el checkpoint int8HQ de origen: salida casi idéntica con la misma semilla y ajustes, con un error aproximado del 0,5 %.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El fichero pesa 15,9 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, más la memoria adicional del text encoder, el VAE y las activaciones durante la inferencia.
- GPU recomendadas: no disponibles en la información proporcionada.
- GPU de consumo: no se confirma compatibilidad con ninguna GPU concreta; el autor menciona una campaña de financiación para una RTX 5090, lo que sugiere que el desarrollo se orienta a hardware de gama alta de consumo, pero no constituye una recomendación oficial.
- Opciones de despliegue: ComfyUI, mediante el nodo `UNETLoader` y los kernels cuantizados nativos. No se documentan otros backends (vLLM, llama.cpp, Ollama, TGI), que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32) | difusión de vídeo, merge comunitario | 15,9 GB | w6a8_int8, group 32 | no disponible | Hugging Face, 0 descargas |
| 10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_int8HQ (OliviaRossi) | difusión de vídeo, merge comunitario | ~20,2 GB | int8HQ | no disponible | Hugging Face |
| MiniMax-H3 (MiniMaxAI) | difusión de vídeo, modelo base | no disponible | no disponible | no disponible | Hugging Face |
| MiniMax-H3 (Comfy-Org) | difusión de vídeo, versión para ComfyUI | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la equivalencia cualitativa declarada por el autor con el checkpoint int8HQ.

## Limitaciones y advertencias

- Se trata de un artefacto de cuantización y merge de la comunidad, no de un modelo oficial; no hay garantías de soporte ni de mantenimiento.
- La licencia no está declarada en el repositorio. El autor remite a las licencias de los modelos de origen, que deben revisarse antes de cualquier uso, especialmente comercial.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, limitaciones de resolución, duración de vídeo o idiomas.
- La equivalencia con el checkpoint int8HQ es una afirmación del autor basada en una comparación subjetiva; no se aportan métricas objetivas.
- El repositorio tiene 0 descargas y 2 likes, por lo que no existe validación independiente de la calidad ni de la estabilidad del fichero.
- La fecha de creación indicada (noviembre de 2026) y la referencia a una campaña de financiación para una RTX 5090 deben tratarse con cautela; verifique la procedencia y el hash del fichero antes de cargarlo en producción.
- Al ser un modelo de difusión de vídeo, no es adecuado para tareas de texto, razonamiento, código o tool calling.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Plaguekind/H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32
- Checkpoint int8HQ de origen: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM/blob/main/10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_int8HQ.safetensors
- Modelo base MiniMaxAI/MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Versión Comfy-Org/MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM
- Repositorio TenStrip/10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
- Apoyo al autor: https://throne.com/plaguekind
