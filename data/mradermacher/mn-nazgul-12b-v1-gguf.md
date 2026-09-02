# mradermacher/MN-Nazgul-12B-v1-GGUF

## Resumen

MN-Nazgul-12B-v1-GGUF es una cuantización en formato GGUF del modelo MN-Nazgul-12B-v1, desarrollado originalmente por OccultAI. El repositorio de HuggingFace está mantenido por mradermacher, un usuario conocido por publicar versiones cuantizadas de modelos open source. Este modelo pertenece a una serie de modelos de 12 mil millones de parámetros de OccultAI, de la que también forman parte MN-Adversary-12B-v1, MN-12b-Rosier-v1, MN-12B-Mag-Mell-R1 y MN-12B-Estrella-v1, entre otros.

La versión GGUF permite ejecutar el modelo en entornos con recursos limitados mediante cuantización, lo que lo hace accesible para inferencia en CPU y GPU de consumo. El repositorio incluye múltiples niveles de cuantización (desde Q2_K hasta F16), lo que ofrece flexibilidad según el hardware disponible. Sin embargo, la información pública sobre la arquitectura subyacente, el entrenamiento y las capacidades específicas es muy escasa, ya que la model card original no proporciona detalles técnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 12.247.782.400 (12,2 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo original MN-Nazgul-12B-v1. Dado el tamaño de 12,2 mil millones de parámetros, es probable que se trate de un transformer denso, pero no hay confirmación oficial. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. La cuantización GGUF realizada por mradermacher es una conversión estática del modelo original, sin modificaciones en los pesos más allá de la reducción de precisión.

## Capacidades

- No se dispone de información oficial sobre las capacidades específicas del modelo.
- El tag "conversational" en HuggingFace sugiere que está orientado a tareas de diálogo y chat.
- Al ser un modelo de 12B, es probable que pueda realizar generación de texto, razonamiento básico y seguir instrucciones, pero no hay datos que lo confirmen.
- No se indica soporte para tool calling, agentes, visión, audio u otras capacidades especiales.

## Casos de uso

Dado que no hay información detallada sobre el modelo, los casos de uso son especulativos y deben validarse con pruebas propias:

- Chatbots y asistentes conversacionales: por su tag "conversational", podría emplearse en sistemas de diálogo multi-turno, aunque se desconoce la longitud de contexto efectiva.
- Generación de texto creativo: un modelo de 12B puede producir narrativas, correos o contenido marketing, pero sin datos de calidad no se puede garantizar.
- Prototipado rápido: al estar disponible en GGUF, se puede desplegar localmente con llama.cpp u Ollama para experimentar sin necesidad de GPU de gama alta.
- Fine-tuning posterior: el modelo original en safetensors podría servir como base para ajuste fino en tareas específicas, aunque se desconoce su licencia.
- Inferencia en CPU: las cuantizaciones Q2_K o Q3_K permiten ejecutar el modelo en equipos sin GPU, aunque con menor calidad de salida.
- Evaluación comparativa interna: los desarrolladores pueden probar este modelo frente a otros de la misma familia para decidir cuál se adapta mejor a sus necesidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (la más equilibrada) se necesitan aproximadamente 7-8 GB de VRAM. Para Q8_0, unos 13 GB. Para F16, unos 24 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 8 GB de VRAM para cuantizaciones bajas.
- En consumer GPU: sí, cabe en GPUs de 8-12 GB con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si se convierte a otro formato), TGI (con adaptación).
- Latencia y throughput: no disponibles, dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. Pertenece a una serie de modelos de 12B de OccultAI (MN-Adversary, MN-12b-Rosier, MN-12B-Mag-Mell-R1, MN-12B-Estrella), pero no hay datos públicos de rendimiento relativo. Tampoco se pueden comparar con modelos conocidos como Mistral-12B o Llama-2-12B sin datos de benchmarks.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor original (OccultAI) antes de utilizarlo en producción.
- Al ser una cuantización, la calidad de salida puede degradarse respecto al modelo original, especialmente en cuantizaciones muy agresivas como Q2_K.
- No se conoce el idioma de entrenamiento; podría estar sesgado hacia inglés u otros idiomas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo poco probado y sin comunidad que lo respalde.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MN-Nazgul-12B-v1-GGUF
- Modelo original (safetensors): https://huggingface.co/OccultAI/MN-Nazgul-12B-v1
- Otros modelos de la familia (referencia): 
  - https://huggingface.co/mradermacher/MN-Adversary-12B-v1-GGUF
  - https://huggingface.co/mradermacher/MN-12b-Rosier-v1-GGUF
  - https://huggingface.co/mradermacher/MN-12B-Mag-Mell-R1-GGUF
