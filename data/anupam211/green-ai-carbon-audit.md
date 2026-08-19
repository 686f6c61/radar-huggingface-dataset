# anupam211/green-ai-carbon-audit

## Resumen

El repositorio `anupam211/green-ai-carbon-audit` es un modelo publicado en Hugging Face cuyo propósito declarado es la auditoría de carbono para sistemas de IA, enmarcado en la iniciativa Green AI. El autor, `anupam211`, ha documentado únicamente los datos de emisiones de CO₂ equivalente asociados al entrenamiento, medidos con la herramienta CodeCarbon. No se proporciona ninguna especificación técnica del modelo en sí (arquitectura, número de parámetros, tarea concreta, etc.), por lo que no es posible determinar si se trata de un modelo de lenguaje, un clasificador o una utilidad de cálculo. El repositorio parece ser más un ejemplo de model card centrado en el impacto ambiental que un modelo funcional con capacidades demostrables. A fecha de creación (agosto de 2026) no registra descargas ni valoraciones de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura del modelo, el número de parámetros, la composición del dataset de entrenamiento ni el proceso de optimización (RLHF, DPO, etc.). Los únicos datos disponibles se refieren al entrenamiento desde la perspectiva ambiental: se utilizaron dos GPUs NVIDIA RTX 4090 con un TDP de 450 W, durante 300,8 horas, con un PUE de 1,33. El consumo total de energía fue de 360,058 kWh, lo que generó 151,224 kg de CO₂eq según la intensidad de carbono de la región `us-east1` (420 gCO₂eq/kWh). El tipo de entrenamiento declarado es fine-tuning, medido con CodeCarbon. No se indica el modelo base ni la tarea específica.

## Capacidades

No se dispone de información sobre las capacidades del modelo. No se documenta generación de texto, razonamiento, código, matemáticas, visión, tool calling, soporte de agentes ni capacidades multilingües. Dado el nombre del repositorio, podría tratarse de una herramienta de cálculo de emisiones, pero no hay evidencia técnica que lo confirme.

## Casos de uso

- Auditoría de emisiones de carbono en entrenamiento de modelos: el repositorio documenta cómo calcular las emisiones de CO₂eq de un proceso de fine-tuning usando CodeCarbon, lo que podría servir como plantilla para equipos que necesiten reportar el impacto ambiental de sus entrenamientos.
- Cumplimiento de políticas de sostenibilidad: las organizaciones que deban presentar informes de huella de carbono de sus sistemas de IA podrían utilizar esta plantilla como referencia para estandarizar sus mediciones.
- Educación en Green AI: el ejemplo puede utilizarse en cursos o talleres para ilustrar cómo se mide el consumo energético y las emisiones de un entrenamiento con GPUs específicas.
- Comparación de eficiencia energética: los datos de hardware y energía podrían servir para comparar el coste ambiental de diferentes configuraciones de entrenamiento.
- Documentación de modelos: la model card puede servir como guía para incluir métricas ambientales en las fichas de otros modelos.
- Investigación sobre sostenibilidad: los datos de emisiones podrían utilizarse en estudios que analicen el impacto de la IA en el medio ambiente.

No obstante, todos estos casos son inferencias basadas en el contenido de la model card, no en capacidades demostradas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica de rendimiento.

## Requisitos de hardware

- Los únicos datos de hardware disponibles se refieren al entrenamiento: 2 GPUs NVIDIA RTX 4090 (TDP 450 W cada una).
- No se especifican requisitos de hardware para inferencia, VRAM estimada, GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- Dado que no se conoce el tamaño del modelo, no es posible determinar si cabe en GPU de consumo.

## Comparativa con modelos similares

No disponible. No se ha identificado ningún modelo comparable, ya que no se dispone de información sobre la arquitectura ni la tarea del modelo.

## Limitaciones y advertencias

- No se ha publicado ninguna especificación técnica del modelo, por lo que no es posible evaluar su funcionamiento, precisión o sesgos.
- La ausencia de licencia impide conocer las condiciones de uso, incluida la posibilidad de uso comercial.
- No se han documentado capacidades reales; el repositorio podría ser un ejemplo de model card sin un modelo funcional subyacente.
- Los datos de emisiones están vinculados a una región específica (us-east1) y a un hardware concreto; extrapolarlos a otros entornos requeriría recalcularlos con los factores locales.
- No hay evidencia de mantenimiento, soporte o comunidad alrededor del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anupam211/green-ai-carbon-audit
- Otros repositorios similares (no directamente relacionados): https://huggingface.co/rajkumar17493/green-ai-carbon-audit y https://huggingface.co/Bhakti1206/green-ai-carbon-audit
