# 3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated

## Resumen

Ornith-1.5-35B-A3B-3MPER0RR-abliterated es un modelo de lenguaje de gran escala derivado de Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez parte de la familia Ornith 1.5. Lo publica el usuario 3MPER0RR en Hugging Face bajo licencia MIT. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 35.107.181.936 parámetros totales y la etiqueta de arquitectura `qwen3_5_moe`, lo que indica que reutiliza el diseño de la familia Qwen 3.5 MoE. El sufijo "A3B" sugiere 3.000 millones de parámetros activos por token, aunque este dato no está confirmado en la información disponible.

El modelo es una variante "abliterated", es decir, se le han aplicado técnicas de ablación de direcciones de activación para reducir el comportamiento de rechazo (refusal) presente en el modelo original. El autor indica que el proceso consistió en una "abliteración multi-ronda" (multi-round abliteration), una técnica que identifica y elimina direcciones en el espacio de activaciones asociadas a la negativa a responder, repitiendo el proceso varias veces para mayor efectividad.

Su relevancia radica en que ofrece un modelo MoE de 35B con comportamiento menos restrictivo que el original, manteniendo la licencia MIT, lo que facilita su uso comercial y su experimentación. El repositorio ocupa 70,2 GB en safetensors, lo que corresponde a pesos en precisión completa (probablemente BF16), y cuenta con 584 descargas en el momento de la consulta. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), tag `qwen3_5_moe` |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible (la nomenclatura A3B sugiere ~3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de tipo Mixture of Experts, identificada por el tag `qwen3_5_moe`, lo que indica que sigue el diseño de la familia Qwen 3.5 MoE: un transformer con capas de atención y capas feed-forward sustituidas por bloques MoE con enrutamiento por token. El número total de parámetros es de 35.107.181.936, y el nombre "A3B" apunta a aproximadamente 3.000 millones de parámetros activos por token, un ratio de activación típico en modelos MoE de esta familia. No se dispone de información detallada sobre el número de expertos, la dimensión de las capas ni la configuración exacta del enrutador.

El entrenamiento original del modelo base (Ornith 1.5) no está documentado en la información proporcionada: se desconoce el número de tokens de entrenamiento, la composición del dataset y si hubo fases de RLHF o DPO. La innovación principal de esta variante es la abliteración multi-ronda aplicada por 3MPER0RR sobre el modelo ya abliterado de huihui-ai. La abliteración consiste en calcular la dirección media de las activaciones en capas intermedias para prompts que provocan rechazo, y restar esa dirección de los pesos, eliminando así la tendencia a negarse a responder. Al aplicarse en múltiples rondas, se busca un efecto más profundo y estable. El autor indica que el modelo fue "tested and saved", es decir, verificado tras el proceso.

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base Ornith 1.5.
- Razonamiento y respuesta a instrucciones, con comportamiento menos restrictivo que el original gracias a la abliteración.
- Capacidad multilingüe: no confirmada en la información disponible; depende del modelo base.
- Soporte de tool calling / function calling: no confirmado explícitamente, pero plausible si el modelo base lo soporta.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Modo "thinking": no disponible en la información.
- Visión o audio: no disponible; el pipeline es text-generation, por lo que se asume solo texto.
- Al ser un modelo abliterated, mantiene la capacidad de generar contenido que el modelo original rechazaría, lo que constituye su diferencia funcional principal.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteración afecta al comportamiento de rechazo y a la calidad general de las respuestas, comparándolo con el modelo base no abliterado en experimentos controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles, donde el modelo original podría negarse; adecuado por su licencia MIT y su tamaño manejable en infraestructura de gama alta.
- Evaluación de robustez de filtros: uso como modelo "adversario" para probar sistemas de moderación y clasificadores de contenido, generando respuestas que los filtros deben detectar.
- Fine-tuning posterior: al ser un MoE de 35B con licencia MIT, sirve como base para ajuste fino en dominios especializados (legal, médico, técnico) sin las restricciones de uso que imponen otras licencias.
- Despliegue en entornos de investigación con GPU de 80 GB: con cuantización a 4 bits o mediante offloading, puede ejecutarse en una sola A100/H100 de 80 GB o en configuraciones multi-GPU, permitiendo experimentación con un MoE de 35B.
- Generación de datos sintéticos: producción de datasets de entrenamiento o de evaluación con diversidad temática amplia, aprovechando la menor tasa de rechazo para cubrir dominios que el modelo original evitaría.
- Chat conversacional autoalojado: integración en interfaces de chat privadas donde el operador asume la responsabilidad del contenido generado, con la ventaja de la licencia MIT para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 70 GB solo para pesos, más overhead de activaciones y caché KV; requiere al menos 80 GB en total, por lo que una única GPU de 80 GB (A100, H100) es el mínimo práctico.
- VRAM estimada en cuantización de 8 bits: alrededor de 35-40 GB, cabe en una A100 40 GB o en dos RTX 4090 de 24 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 18-22 GB, potencialmente ejecutable en una RTX 4090 de 24 GB, aunque el overhead del enrutador MoE y la caché KV pueden superar ese margen según la longitud de contexto.
- GPU recomendadas: H100 80 GB, A100 80 GB para BF16; A100 40 GB o 2x RTX 4090 para 8 bits; RTX 4090 única para 4 bits con contexto corto.
- Despliegue: vLLM y TGI para serving en BF16/FP8; llama.cpp y Ollama para cuantizaciones GGUF en hardware consumer; el tag `qwen3_5_moe` sugiere soporte en versiones recientes de vLLM y SGLang.
- Latencia y throughput: no disponibles; dependen de la cuantización, el hardware y la longitud de contexto. Un MoE con ~3B activos debería ofrecer throughput notablemente superior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ornith-1.5-35B-A3B-3MPER0RR-abliterated | 35,1B totales (MoE) | no disponible | MIT | Abliteración multi-ronda; 584 descargas |
| Huihui-Ornith-1.5-35B-A3B-abliterated | 35,1B totales (MoE) | no disponible | no disponible | Modelo base directo; abliteración de huihui-ai |
| Ornith 1.5 35B-A3B (original) | 35,1B totales (MoE) | no disponible | no disponible | Modelo sin abliterar; comportamiento de rechazo estándar |
| Qwen3.5 MoE de referencia | no disponible | no disponible | no disponible | Arquitectura de la que deriva el tag `qwen3_5_moe` |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina parcialmente el comportamiento de rechazo, pero no garantiza la ausencia total de negativas ni un comportamiento seguro; puede producir contenido dañino, ofensivo o inexacto sin advertencia.
- Riesgo elevado de alucinación: no hay datos de benchmarks que permitan estimar su fiabilidad factual; como todo modelo de lenguaje, puede inventar información con seguridad aparente.
- La abliteración multi-ronda puede degradar capacidades generales (razonamiento, coherencia, instrucciones) respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esta degradación.
- Idiomas soportados no documentados; el rendimiento en castellano es incierto y debe validarse empíricamente.
- Longitud de contexto no documentada; no se debe asumir la ventana del modelo base sin verificación.
- Licencia MIT: permite uso comercial y modificación, pero el usuario asume toda la responsabilidad legal y ética sobre el contenido generado y su distribución.
- El modelo base es a su vez una abliteración de un modelo de terceros; la cadena de procedencia incluye huihui-ai y el autor original de Ornith 1.5, cuyas condiciones de uso deben respetarse aunque la licencia declarada sea MIT.
- Solo 584 descargas y 0 likes: comunidad mínima, sin validación independiente conocida; tratar como modelo experimental.
- No apto para producción en aplicaciones sensibles (salud, legal, finanzas) sin evaluación exhaustiva y salvaguardas externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated
- Modelo base directo: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
