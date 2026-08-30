# mradermacher/Hy-MT2-30B-A3B-uncensored-heretic-GGUF

## Resumen

Hy-MT2-30B-A3B es un modelo de traducción multilingüe desarrollado por Tencent Hunyuan, perteneciente a la familia Hy-MT2, diseñado para escenarios complejos del mundo real con un enfoque de "pensamiento rápido" (fast-thinking). El modelo emplea una arquitectura de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token, lo que permite un equilibrio entre calidad y eficiencia computacional. Soporta traducción entre 33 idiomas y es capaz de seguir instrucciones de traducción en múltiples lenguas, lo que lo hace adecuado para dominios profesionales como el legal, médico o técnico.

La versión aquí documentada, `Hy-MT2-30B-A3B-uncensored-heretic-GGUF`, es una cuantización estática en formato GGUF realizada por el usuario mradermacher a partir de un modelo base denominado `OS-Software/Hy-MT2-30B-A3B-uncensored-heretic`. Esta variante, cuyo nombre sugiere una eliminación de restricciones de contenido ("uncensored") y una posible modificación adicional ("heretic"), no dispone de documentación técnica propia más allá de la cuantización. El modelo base original de Tencent se distribuye bajo licencia Apache-2.0, aunque la variante no especifica su propia licencia.

La relevancia de este modelo radica en su capacidad para abordar traducciones complejas que requieren razonamiento contextual, superando a modelos anteriores en dominios especializados, según el artículo de investigación asociado. Su disponibilidad en formato GGUF permite su ejecución en hardware de consumo mediante herramientas como llama.cpp u Ollama, lo que facilita su adopción en entornos de producción y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | 3 mil millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | 33 idiomas (segun el paper y el repositorio de Tencent) |
| Licencia | Apache-2.0 (modelo base); la variante "uncensored-heretic" no especifica licencia |
| Formato de pesos | GGUF (cuantizacion estatica) |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-30B-A3B emplea una arquitectura Transformer con mezcla de expertos (MoE), donde solo 3 mil millones de parámetros se activan por token, lo que reduce el coste computacional en inferencia sin sacrificar la capacidad del modelo. Según el artículo de investigación, la familia Hy-MT2 se entrena con un enfoque de "pensamiento rápido" (fast-thinking), que integra razonamiento implícito en el proceso de traducción para manejar contextos ambiguos o especializados. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible.

La variante "uncensored-heretic" es un modelo derivado de la comunidad, probablemente mediante fine-tuning o fusión de pesos, aunque no existe documentación que detalle el proceso. La cuantización GGUF realizada por mradermacher es estática, lo que significa que los pesos se convirtieron a formatos de precisión reducida (desde f16 hasta Q2_K) para optimizar el uso de memoria y velocidad en diferentes hardware.

## Capacidades

- Traducción multilingüe entre 33 idiomas, con soporte para instrucciones de traducción en múltiples lenguas.
- Manejo de dominios profesionales complejos (legal, médico, técnico) gracias al enfoque de razonamiento rápido.
- Seguimiento de instrucciones de formato y estilo en la traducción, como tono, terminología o restricciones de longitud.
- Inferencia eficiente gracias a la arquitectura MoE con 3B parámetros activos, lo que reduce la latencia frente a modelos densos de tamaño similar.
- No se ha documentado soporte para tool calling, agentes, visión, audio u otras capacidades más allá de la traducción de texto.

## Casos de uso

- Traducción de documentación técnica y legal: el modelo puede traducir contratos, patentes o manuales con precisión terminológica, gracias a su capacidad de razonamiento contextual y su entrenamiento en dominios especializados.
- Localización de software y sitios web: permite adaptar interfaces y contenido a múltiples idiomas manteniendo coherencia y estilo, con la posibilidad de integrarse en pipelines de CI/CD mediante APIs.
- Atención al cliente multilingüe: puede gestionar conversaciones de soporte en varios idiomas, traduciendo consultas y respuestas en tiempo real con baja latencia gracias a su arquitectura MoE.
- Subtitulado y transcripción de vídeo: adecuado para generar subtítulos en diferentes idiomas a partir de transcripciones, preservando el significado y el tono original.
- Traducción de contenido académico y científico: facilita la difusión de artículos de investigación y tesis entre comunidades lingüísticas diversas, con manejo de terminología especializada.
- Integración en sistemas de gestión de contenido (CMS): puede automatizar la traducción de publicaciones, blogs o documentación de producto, reduciendo el tiempo de publicación en mercados internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante "uncensored-heretic" en la información disponible. El artículo de investigación de Hy-MT2 menciona un rendimiento de última generación (SOTA) en dominios profesionales, pero no se incluyen cifras concretas en los materiales consultados. Se recomienda consultar el paper original para obtener métricas detalladas de evaluación.

## Requisitos de hardware

- La VRAM necesaria depende de la cuantización elegida. Para una cuantización Q4_K_M, se estima un uso de memoria de aproximadamente 20-25 GB, aunque este dato no está confirmado oficialmente.
- GPU recomendadas: para cuantizaciones bajas (Q2, Q3) puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB). Para cuantizaciones más altas (Q6, Q8) se requieren GPUs con 24 GB o más, como RTX 3090, RTX 4090 o A100.
- El formato GGUF permite su ejecución en CPU mediante llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia como vLLM (si se convierte a otro formato).
- La latencia y el throughput no están documentados; dependerán del hardware y la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de traducción multilingüe en la información proporcionada. Modelos como NLLB-200 (Meta), M2M-100 (Meta) o Tower (Unbabel) podrían considerarse alternativas, pero no se han encontrado métricas de comparación directa en las fuentes consultadas.

## Limitaciones y advertencias

- La variante "uncensored-heretic" puede generar contenido sin filtros de seguridad, lo que implica un riesgo de sesgos, lenguaje ofensivo o información inapropiada. No se recomienda su uso en aplicaciones donde el control de contenido sea crítico.
- No se ha documentado la longitud de contexto máxima, lo que limita la capacidad de manejar documentos extensos de una sola vez.
- La licencia de la variante no está especificada; aunque el modelo base es Apache-2.0, el derivado podría tener restricciones adicionales. Se recomienda verificar antes de un uso comercial.
- Al ser un modelo de traducción, su rendimiento en otras tareas (generación de código, razonamiento general) no está garantizado y no ha sido evaluado.
- La cuantización GGUF puede introducir una ligera degradación en la calidad de la traducción en comparación con el modelo en precisión completa, especialmente en cuantizaciones muy agresivas como Q2_K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/Hy-MT2-30B-A3B-uncensored-heretic-GGUF
- Repositorio de Tencent Hunyuan: https://github.com/Tencent-Hunyuan/Hy-MT2
- Artículo de investigación (arXiv): https://arxiv.org/html/2605.22064v1
- Repositorio GGUF del modelo base (mradermacher): https://huggingface.co/mradermacher/Hy-MT2-30B-A3B-GGUF
