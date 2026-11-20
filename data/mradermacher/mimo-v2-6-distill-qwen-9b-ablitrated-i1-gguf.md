# mradermacher/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-i1-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-Ablitrated-i1-GGUF es un conjunto de cuantizaciones GGUF del modelo Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated, publicado por mradermacher. Se trata de un modelo destilado de 8.953.803.264 parámetros (aproximadamente 9B) construido sobre una base Qwen, orientado a uso agéntico y tool-use, al que se le ha aplicado una técnica de "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones) para reducir los comportamientos de negativa del modelo.

La relevancia de esta ficha reside en dos factores. En primer lugar, el autor original aplica abliteración mediante steering de activaciones con pesos "horneados" (baked weights) y sin hooks en tiempo de ejecución, lo que facilita el despliegue. En segundo lugar, mradermacher proporciona un conjunto muy amplio de cuantizaciones con imatrix (desde IQ1_S de 2,8 GB hasta Q6_K), lo que permite ejecutar el modelo en hardware de consumo modesto.

No obstante, conviene señalar que se trata de un derivado de terceros sobre un modelo base a su vez derivado, que la model card no documenta datos de entrenamiento, contexto ni benchmarks, y que la licencia declarada es MIT. Toda la información técnica sustantiva sobre arquitectura y entrenamiento del modelo base no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen; detalles no documentados) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (y variantes estáticas en el repo GGUF hermano) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base en transformers usa safetensors |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni el número de capas, dimensión oculta o cabezas de atención. Por el nombre y el tamaño (9B) y por la referencia a Qwen, se trata presumiblemente de una destilación sobre una base de la familia Qwen, pero este extremo no está confirmado en la documentación.

El aspecto técnico diferencial documentado es la abliteración: se ha eliminado la dirección de rechazo mediante steering de activaciones, con los pesos resultantes "horneados" en el modelo final (baked weights) y sin necesidad de hooks en tiempo de ejecución. El modelo se presenta con etiquetas de destilación, uso agéntico y tool-use. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si se aplicó RLHF o DPO. Las cuantizaciones i1 de mradermacher emplean ficheros imatrix para preservar la calidad en niveles bajos de bits.

## Capacidades

- Generación de texto conversacional en inglés.
- Uso agéntico y tool-use / function calling (según las etiquetas del autor).
- Razonamiento multi-paso orientado a tareas de agente.
- Capacidad de destilación: el modelo se presenta como destilado de un modelo mayor (no se especifica cuál).
- Comportamiento de rechazo reducido mediante abliteración (refusal-ablation), lo que altera la política de negativas del modelo base.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Automatización de agentes con tool calling: el modelo está etiquetado como agentic y tool-use, por lo que puede integrarse en bucles de agente que invocan APIs y funciones externas, siempre que se validen las salidas en producción.
- Asistentes conversacionales autoalojados en inglés: con cuantizaciones Q4_K_M de 5,7 GB puede desplegarse en una GPU de consumo para atención al cliente o asistentes internos.
- Prototipado rápido en local: las variantes IQ2/IQ3 (3-5 GB) permiten experimentar en portátiles con GPU modesta o incluso CPU.
- Generación de código asistida en pipelines internos: al ser un modelo destilado de base Qwen, es plausible su uso para autocompletado y generación de scripts, aunque no hay benchmarks que lo respalden.
- Investigación sobre abliteración y steering de activaciones: útil para estudiar el efecto de eliminar la dirección de rechazo en modelos destilados pequeños.
- Evaluación de cuantizaciones: el amplio conjunto de quants con imatrix permite comparar degradación de calidad entre niveles de bits en un mismo modelo.
- Fine-tuning o experimentación con licencia permisiva: la licencia MIT facilita su uso y modificación en entornos comerciales, con las cautelas indicadas más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - IQ1_S (2,8 GB) e IQ1_M (3,0 GB): viables en GPU de 4 GB o en CPU.
  - IQ2_XXS a IQ2_M (3,2-3,7 GB): GPU de 4-6 GB.
  - IQ3_XXS a Q3_K_L (4,0-5,0 GB): GPU de 6-8 GB.
  - IQ4_XS a Q4_1 (5,3-5,9 GB): GPU de 8 GB.
  - Q4_K_M (5,7 GB): recomendado por el autor como equilibrio velocidad/calidad; GPU de 8 GB.
  - Q5_K_S a Q5_K_M (6,4 GB en adelante): GPU de 8-10 GB.
  - Q6_K: GPU de 10-12 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, desde una GTX 1650 4 GB con cuantizaciones IQ1/IQ2 hasta una RTX 4090 con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (el tag endpoints_compatible lo sugiere). Para el modelo base en transformers, vLLM o TGI si se dispone de los pesos safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-Ablitrated-i1-GGUF | 8,95B | no disponible | MIT | GGUF | Abliterado, orientado a agentes, solo inglés |
| Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated | 8,95B | no disponible | MIT | safetensors | Modelo base sin cuantizar del que deriva esta ficha |
| mradermacher/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-GGUF | 8,95B | no disponible | MIT | GGUF | Quants estáticos (sin imatrix) del mismo modelo |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo del modelo, lo que puede aumentar la probabilidad de generar contenido dañino, inseguro o no alineado. No se recomienda su uso en producción orientada a usuarios finales sin filtros adicionales.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas.
- Solo soporta inglés según la model card; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Es un derivado de terceros sobre un modelo base a su vez derivado; la trazabilidad del entrenamiento y de los datos es limitada.
- La licencia MIT se declara en el repo, pero conviene verificar la licencia del modelo base original (Qwen) por si impone restricciones adicionales.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate".
- No se documentan sesgos específicos, pero al ser un modelo solo en inglés y derivado de Qwen, es probable que herede sesgos del corpus de entrenamiento original.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-i1-GGUF
- Modelo base (abliterado): https://huggingface.co/Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated
- Quants estáticos del mismo modelo: https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiMo-V2.6-Distill-Qwen-9B-Ablitrated-i1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
