# Angeline2005/tds-carbon-card

## Resumen

Este repositorio, identificado como `Angeline2005/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de seguimiento de huella de carbono asociada a un proceso de entrenamiento de un modelo no especificado. El autor, Angeline2005, documenta las emisiones de CO₂ equivalente generadas durante un fine-tuning realizado en infraestructura de Google Cloud (región `us-central1`), utilizando 8 GPUs NVIDIA H100. La información disponible se limita a métricas de consumo energético y emisiones, sin datos sobre arquitectura, parámetros, capacidades o rendimiento del modelo subyacente. Por tanto, esta ficha se centra en los datos de sostenibilidad reportados, no en características técnicas del modelo, que no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se proporciona ninguna información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.), el conjunto de datos de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. La única información disponible corresponde al proceso de fine-tuning: se utilizaron 8 GPUs NVIDIA H100 durante 221,1 horas, con un factor de eficiencia energética (PUE) de 1,25, lo que resultó en un consumo total de 1547,7 kWh y unas emisiones de 541,695 kg de CO₂ equivalente, calculadas con la herramienta CodeCarbon. Estos datos son los únicos aspectos técnicos documentados.

## Capacidades

No se han documentado capacidades del modelo. Al no existir información sobre su arquitectura ni entrenamiento, no es posible determinar si es capaz de generar texto, razonar, escribir código, realizar llamadas a herramientas, actuar como agente, procesar vision o audio, o trabajar en múltiples idiomas.

## Casos de uso

No se pueden definir casos de uso concretos, ya que el repositorio no describe el modelo ni sus funcionalidades. La única aplicación práctica identificable es la de servir como referencia para auditorías de sostenibilidad en entrenamiento de IA, pero no como un modelo utilizable en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar.

## Requisitos de hardware

- El entrenamiento se realizó con 8 GPUs NVIDIA H100, lo que indica un requisito de hardware de alta gama para el proceso de fine-tuning.
- No se especifican requisitos de VRAM para inferencia, ya que no se describe el modelo final.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se proporcionan estimaciones de latencia o throughput.

## Comparativa con modelos similares

No disponible. Al no existir información sobre el modelo, no es posible compararlo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA, sino una tarjeta de emisiones de carbono; cualquier intento de usarlo como modelo fallará.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia no está especificada, por lo que no se puede determinar si es utilizable comercialmente.
- Los datos de emisiones dependen de la región y del hardware; extrapolarlos a otros entornos puede llevar a conclusiones erróneas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Angeline2005/tds-carbon-card
- Herramienta CodeCarbon (mencionada en la model card): https://codecarbon.io/ (enlace externo, no verificado en la búsqueda web)
