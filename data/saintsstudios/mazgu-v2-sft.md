# SaintsStudios/Mazgu-v2-SFT

## Resumen

Mazgu-v2-SFT es un modelo de lenguaje desarrollado por SaintsStudios (Saints Studios MW) como una versión afinada de su modelo base SaintsStudios/Mazgu_Small-T_130M. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) utilizando la librería TRL de Hugging Face, lo que indica un enfoque en la adaptación de un modelo pequeño (SLM) para tareas conversacionales y de generación de texto.

El modelo se presenta como parte de una iniciativa más amplia de Saints Studios para crear soluciones multilingües y agentes de IA, con especial interés en lenguas bantúes y dialectos africanos, según se menciona en sus páginas de producto. Sin embargo, la ficha técnica disponible en Hugging Face es mínima: no se especifican parámetros totales, arquitectura interna, ni datos de entrenamiento detallados.

A pesar de su reducida huella digital (0 descargas, 0 likes, repositorio de 0.0 GB), el modelo es relevante para desarrolladores que buscan alternativas ligeras y personalizables para entornos con recursos limitados, o que desean explorar fine-tuning de SLMs para idiomas subrepresentados. No obstante, la falta de documentación técnica impide una evaluación rigurosa de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre del modelo base sugiere 130M, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base menciona 8 idiomas, pero no se detalla) |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors (según tags de Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna del modelo. El nombre del modelo base, "Mazgu_Small-T_130M", sugiere un tamaño de 130 millones de parámetros, probablemente basado en una arquitectura transformer estándar, pero esto no está confirmado en la documentación.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) utilizando la librería TRL (Transformers Reinforcement Learning) en su versión 1.10.0, junto con Transformers 5.15.1, PyTorch 2.11.0+cu128 y Datasets 5.0.1. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el ejemplo de uso rápido muestra un pipeline de text-generation con formato de chat (roles user/assistant).
- Fine-tuning sobre un modelo base pequeño: orientado a tareas específicas mediante SFT.
- Potencial multilingüe: el modelo base declara soporte para 8 idiomas, aunque no se detalla cuáles ni si se mantiene en esta versión.
- No se documentan capacidades de tool calling, agentes, razonamiento avanzado, visión o audio.

## Casos de uso

- Asistente conversacional ligero: el modelo puede integrarse en aplicaciones de chat simples donde se requiera un modelo pequeño y de bajo consumo, por ejemplo en dispositivos edge o prototipos rápidos.
- Fine-tuning para dominios específicos: al ser un modelo SFT, es adecuado como punto de partida para ajustes posteriores con datos propios, especialmente en idiomas o dominios poco representados.
- Educación e investigación: útil para estudiar el comportamiento de SLMs afinados con TRL y comparar con otros modelos de tamaño similar.
- Prototipado de agentes conversacionales: gracias a su formato de chat, puede servir en demos o pruebas de concepto sin necesidad de infraestructura potente.
- Desarrollo de aplicaciones multilingües: si se confirma el soporte de idiomas bantúes, podría emplearse en asistentes para comunidades africanas.
- Benchmarking de modelos pequeños: permite evaluar la eficacia de técnicas SFT en modelos de 130M en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos sobre VRAM, GPU recomendadas o latencia.
- Dado el tamaño probable de 130M parámetros, podría ejecutarse en GPUs de consumo como una RTX 3060 o incluso en CPU, pero esto es una estimación no confirmada.
- Opciones de despliegue: no se mencionan, pero al ser un modelo de Transformers, podría usarse con vLLM, llama.cpp, Ollama o TGI si se convierte a los formatos adecuados (GGUF, etc.), aunque no hay garantías.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El modelo base (Mazgu_Small-T_130M) podría compararse con otros SLMs de 130M como GPT-2 Small o TinyLlama, pero no hay datos de rendimiento ni especificaciones detalladas. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han documentado, pero al ser un modelo pequeño y afinado con datos no especificados, es probable que presente alucinaciones y sesgos no controlados.
- Limitaciones de idioma: aunque el modelo base declara 8 idiomas, no se confirma cuáles son ni la calidad en cada uno.
- Licencia: la licencia no está claramente especificada ("licence: license" es ambiguo). No se recomienda su uso en producción sin aclarar los términos legales.
- Falta de documentación: la ausencia de detalles técnicos impide evaluar su idoneidad para tareas críticas.
- Riesgo de obsolescencia: el modelo fue creado en agosto de 2026 y no ha recibido actualizaciones ni descargas, lo que sugiere que es un proyecto experimental.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SaintsStudios/Mazgu-v2-SFT)
- [Modelo base Mazgu_Small-T_130M](https://huggingface.co/SaintsStudios/Mazgu_Small-T_130M)
- [Página de modelos de SaintsStudios](https://huggingface.co/SaintsStudios/models)
- [Sitio web de Saints Studios](https://sites.google.com/view/saints-studios/home)
- [Página de productos de Saints Studios](https://sites.google.com/view/saints-studios/products)
