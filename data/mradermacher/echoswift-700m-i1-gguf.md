# mradermacher/EchoSwift-700M-i1-GGUF

## Resumen

EchoSwift-700M es un modelo lingüístico compacto de unos 742 millones de parámetros, desarrollado por el usuario de Hugging Face adityavardhansharma y derivado de la familia de modelos LFM2 (Liquid Foundation Models) de Liquid AI, como indican las etiquetas `liquid-foundation-model` y `lfm2` de su ficha. Está orientado a escenarios on-device y edge AI, con soporte declarado para tool calling, búsqueda y generación de artefactos, lo que lo sitúa como un modelo ligero para asistentes locales en dispositivos con recursos limitados, incluyendo Android (etiqueta `litertlm`, asociada a LiteRT de Google).

La ficha aquí documentada corresponde a la cuantización GGUF en versión imatrix (importancia-matrix) publicada por mradermacher, un cuantizador conocido por generar versiones optimizadas de modelos populares para su uso con llama.cpp y derivados. Esta variante incluye más de veinte cuantizaciones distintas, desde IQ1_S (0,3 GB) hasta Q6_K (0,7 GB), lo que permite ajustar el equilibrio entre calidad y huella de memoria en hardware muy modesto. El modelo declara inglés como único idioma y utiliza la licencia lfm-open-1.0 de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model), según etiquetas del modelo; detalle no disponible |
| Parametros totales | 742.489.344 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés (en) |
| Licencia | lfm-open-1.0 (other), enlace a la licencia de Liquid AI |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo, pero las etiquetas `liquid-foundation-model` y `lfm2` apuntan a que se trata de un derivado de la familia LFM2 de Liquid AI, una arquitectura híbrida diseñada específicamente para inferencia eficiente en dispositivos de borde. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO para este modelo concreto.

En cuanto a la cuantización, mradermacher emplea el método imatrix (matriz de importancia), que calcula estadísticas de activación sobre un corpus de calibración para asignar mayor precisión a los pesos más relevantes. Según el autor, los cuants IQ (importance) suelen superar en calidad a los cuants estáticos de tamaño equivalente, y el propio README incluye una gráfica comparativa de perplejidad de distintos tipos de cuantización elaborada por ikawrakow.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational`).
- Tool calling / function calling, indicado explícitamente en las etiquetas del modelo.
- Capacidades de búsqueda (etiqueta `search`), presumiblemente integración con herramientas de búsqueda en agentes.
- Generación de artefactos (etiqueta `artifacts`).
- Orientación a despliegue on-device y edge AI, incluyendo Android vía LiteRT (etiqueta `litertlm`).
- Idioma: inglés únicamente según los metadatos.

## Casos de uso

- Asistentes locales en Android: con cuants de 0,3 a 0,7 GB, el modelo puede ejecutarse en dispositivos móviles mediante LiteRT (formato litertlm) o llama.cpp, permitiendo chat sin conexión.
- Agentes con tool calling en el borde: su soporte declarado de function calling lo hace apto para agentes ligeros que invocan APIs o herramientas locales (calculadoras, calendario, búsqueda) sin depender de la nube.
- Búsqueda aumentada local: la etiqueta `search` sugiere su uso en pipelines RAG o de búsqueda en dispositivos, combinando recuperación local con generación.
- Prototipado de edge AI en hardware modesto: con cuants por debajo de 1 GB, es viable en portátiles sin GPU dedicada, Raspberry Pi o SBCs para experimentación.
- Integración en aplicaciones de escritorio con llama.cpp u Ollama: los archivos GGUF son directamente compatibles con estos runtimes, facilitando el embedding de un LLM en software comercial ligero.
- Creación de cuantizaciones personalizadas: el archivo imatrix de 0,1 GB permite a terceros generar sus propios cuants ajustados a su hardware objetivo.
- Clasificación y extracción de texto en inglés en lotes locales: tareas cortas de NLP (extracción de entidades, resumen breve) donde la privacidad exige procesamiento local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada: entre 0,3 GB (IQ1_S/IQ1_M) y 0,7 GB (Q6_K) solo de pesos; con contexto y overhead, se estima menos de 1,5 GB de RAM en la cuantización recomendada Q4_K_M (0,6 GB). Ejecutable íntegramente en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna con pocos GB de VRAM lo ejecuta con holgura si se desea aceleración (por ejemplo, RTX 3060 o superiores).
- Consumer GPUs: cabe con enorme margen en prácticamente cualquier GPU doméstica actual, incluidas integradas; también en móviles Android vía LiteRT.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF; el modelo base admite la librería transformers de Hugging Face.
- Latencia y throughput: no disponibles; dada la cuantización y el tamaño sub-1 GB, se espera inferencia muy rápida incluso en CPU de gama media, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EchoSwift-700M (este modelo) | 742 M | no disponible | lfm-open-1.0 | Derivado LFM2, on-device, tool calling, GGUF imatrix |
| LFM2-700M (Liquid AI) | ~700 M | no disponible en esta ficha | LFM Open License v1.0 | Familia original de la que deriva; optimizado para edge |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Apache 2.0 | Alternativa compacta muy popular, multilingüe |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens | Apache 2.0 | Modelo ligero de Hugging Face para on-device |

Nota: la comparación con Qwen2.5 y SmolLM2 es orientativa por categoría de tamaño; sus datos de contexto y licencia son conocidos, mientras que los de EchoSwift-700M no están publicados en la ficha disponible.

## Limitaciones y advertencias

- Idioma: los metadatos declaran únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea limitado.
- No se han publicado benchmarks ni evaluaciones del modelo, por lo que su calidad real frente a otros modelos de tamaño similar es desconocida y debe validarse antes de uso en producción.
- Cuantizaciones agresivas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad, como reconoce el propio autor ("for the desperate"); se recomienda Q4_K_M como equilibrio.
- La longitud de contexto no está documentada; verificarla antes de diseñar aplicaciones con documentos largos.
- Licencia: lfm-open-1.0 es una licencia personalizada de Liquid AI, no una licencia estándar permisiva; revisar sus términos antes de uso comercial.
- Riesgo de alucinación: no evaluado; al tratarse de un modelo muy pequeño, el riesgo es presumiblemente alto en tareas de conocimiento factual.
- Es un modelo de terceros poco conocido (autor individual), sin la trazabilidad de un laboratorio establecido; auditar pesos y comportamiento antes de despliegues sensibles.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/mradermacher/EchoSwift-700M-i1-GGUF
- Modelo base: https://huggingface.co/adityavardhansharma/EchoSwift-700M
- Cuants estáticos del mismo modelo: https://huggingface.co/mradermacher/EchoSwift-700M-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#EchoSwift-700M-i1-GGUF
- Licencia lfm-open-1.0: https://raw.githubusercontent.com/Liquid-AI/LFM/main/LICENSE
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
