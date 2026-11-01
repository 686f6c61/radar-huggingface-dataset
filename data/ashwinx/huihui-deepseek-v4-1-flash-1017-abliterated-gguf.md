# AshwinX/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF

## Resumen

Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF es una versión "abliterated" (sin filtros de seguridad) del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek-AI, publicada por el usuario AshwinX en Hugging Face. La abliteración se ha realizado sobre los cuantizados GGUF de huihui-ai mediante la herramienta cvector-generator de llama.cpp, sin depender de Transformers, y afecta únicamente a las capas de atención 11 a 28 (indexación base 0): en concreto, solo se han modificado 18 tensores (los `attn_output_b`), dejando intacto el sistema de expertos (MoE).

El modelo base es un mixture-of-experts multimodal (pipeline image-text-to-text) cuantizado en formato GGUF con técnicas de cuantización mixta (GSQ, RCO, imatrix), y el repositorio incorpora parches opcionales de Maya, Strata (procedentes de ISTA-DASLab) y Unsloth que el usuario debe aplicar manualmente. Su relevancia radica en ofrecer una variante sin censura de un modelo de vanguardia reciente, ejecutable localmente con llama.cpp (versión b11870 o superior) y con soporte de contexto de hasta 262.144 tokens según el ejemplo de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), multimodal (image-text-to-text) |
| Parametros totales | 1.677.721.600 (dato safetensors; el repo pesa 381,1 GB, lo que sugiere cifras no consolidadas) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según comando de ejemplo; dato oficial no disponible) |
| Tipos de cuantizacion | GGUF con cuantización mixta: GSQ, RCO, imatrix; series UD- de Unsloth (p. ej. UD-IQ1_S) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (requiere llama.cpp b11870 o superior) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es una arquitectura mixture-of-experts con capacidades image-text-to-text, lo que implica un componente de visión además del módulo de lenguaje. La variante aquí descrita no reentrena el modelo: aplica abliteración directa sobre los ficheros GGUF mediante vectores de dirección (cvector) generados con la herramienta cvector-generator de llama.cpp. El alcance de la modificación es deliberadamente mínimo: solo las capas 11 a 28 y, dentro de ellas, exclusivamente los tensores `attn_output_b` (18 en total), sin tocar el sistema de expertos.

Sobre la cuantización, el repositorio se apoya en tres fuentes: los GGUF de huihui-ai propios, los cuantizados GSQ-RCO de ISTA-DASLab (parche "Strata") y las series UD- de Unsloth (parche "Unsloth"), todas distribuidas en modo patch para ahorrar espacio de almacenamiento. No hay información disponible sobre datos de entrenamiento, número de tokens ni alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

## Capacidades

- Generacion de texto conversacional (pipeline conversational).
- Comprension de imagen y texto (image-text-to-text), heredada del modelo base multimodal.
- Arquitectura MoE, lo que sugiere inferencia eficiente por token respecto a un denso equivalente (parametros activos no disponibles).
- Contexto largo de hasta 262.144 tokens en el ejemplo de ejecucion con llama.cpp.
- Version sin filtros de seguridad (abliterated): responde a contenido que el modelo original rechazaria.
- Parches opcionales Maya y Strata que anaden pesos adicionales aplicables por el usuario.
- No hay informacion explicita sobre tool calling, agentes, thinking mode ni audio en la documentacion proporcionada.

## Casos de uso

- Investigacion en alineacion y seguridad: permite estudiar el efecto de la abliteracion sobre tensores de atencion concretos en un MoE moderno, comparando salidas antes y despues de la modificacion.
- Pruebas de robustez de aplicaciones: util para evaluar como se comportan sistemas de moderacion y filtros posteriores ante un modelo sin filtros internos.
- Experimentacion con cuantizaciones extremas: la serie UD-IQ1_S y las tecnicas GSQ/RCO permiten probar limites de compresion en hardware modesto.
- Ejecucion local con contexto largo: con llama.cpp y 262.144 tokens de contexto, permite analizar documentos muy extensos sin depender de APIs externas.
- Desarrollo sobre llama.cpp: el requisito de la version b11870 o superior lo convierte en banco de pruebas para funcionalidades recientes del runtime (parches, cuantizaciones mixtas, mtmd).
- Comparativa de parches comunitarios: los parches Maya, Strata y Unsloth permiten evaluar el impacto de cada modificacion sobre el mismo modelo base.
- Prototipado multimodal offline: dado su pipeline image-text-to-text, sirve para experimentar con entrada de imagen y texto en entornos sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud; el repo completo pesa 381,1 GB, pero la cuantizacion UD-IQ1_S (dividida en 5 ficheros) esta pensada para hardware muy limitado. No se indican cifras concretas por cuantizacion.
- GPU recomendadas: no disponible; el ejemplo de compilacion usa `GGML_CUDA=ON`, por lo que se asume GPU NVIDIA, aunque tambien es viable CPU dada la cuantizacion extrema.
- Consumer GPU: la cuantizacion UD-IQ1_S sugiere que las variantes mas pequeñas pueden funcionar en GPUs de consumo (p. ej. RTX 3090/4090), pero no hay datos confirmados; no disponible.
- Despliegue: llama.cpp b11870 o superior (llama-cli, llama-mtmd-cli, llama-server, llama-gguf-split). No se menciona soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF | 1.677.721.600 (dato safetensors) | 262.144 (ejemplo) | MIT | GGUF | Abliterated, multimodal, parches Maya/Strata/Unsloth |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible | Modelo original con filtros de seguridad |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantizados UD- sin abliterar, fuente de la serie UD- |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantizacion GSQ-RCO, base del parche Strata |

## Limitaciones y advertencias

- Riesgo elevado de generacion de contenido sensible, controversial o inapropiado: los filtros de seguridad del modelo original han sido eliminados deliberadamente.
- No apto para todos los publicos: la model card advierte explicitamente contra su uso en entornos publicos, con menores de edad o aplicaciones que exijan alta seguridad.
- Responsabilidad legal y etica recae integramente en el usuario; huihui.ai declina cualquier responsabilidad por las consecuencias de su uso.
- Recomendado solo para investigacion, pruebas o entornos controlados; se desaconseja su uso directo en produccion o aplicaciones comerciales orientadas al publico.
- Se recomienda monitorizacion en tiempo real y revision manual de las salidas.
- La abliteracion puede degradar la calidad general del modelo respecto al original, ya que modifica tensores de atencion sin reentrenamiento posterior.
- Datos de especificaciones inconsistentes: los parametros safetensors (1,68 B) no cuadran con el tamano del repo (381,1 GB) ni con la naturaleza MoE del modelo base; conviene verificar en el repositorio oficial.
- Requiere llama.cpp b11870 o superior; versiones anteriores no funcionaran con estas cuantizaciones.
- Los parches Maya, Strata y Unsloth deben aplicarse manualmente mediante comandos; no vienen preintegrados en los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AshwinX/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Version huihui-ai original: https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Cuantizados Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Cuantizados GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- cvector-generator (llama.cpp): https://github.com/ggml-org/llama.cpp/blob/master/tools/cvector-generator/README.md
- Proyecto Maya: https://github.com/mw00/project-maya
- Proyecto Strata: https://github.com/Niko1221/Strata
- Release b11870 de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/tag/b11870
