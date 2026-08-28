# khanmuneeba99/tds-carbon-card

## Resumen

Este repositorio, identificado como `khanmuneeba99/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (model card) que documenta la huella ambiental de un proceso de entrenamiento de un modelo no especificado. El autor, `khanmuneeba99`, ha publicado esta ficha como parte de una asignación académica (TDS GA8) centrada en la transparencia energética y las emisiones de CO₂ en el entrenamiento de modelos. La relevancia actual de este tipo de documentación radica en la creciente demanda de prácticas de IA sostenible y la normalización de informes de emisiones en plataformas como Hugging Face.

Según los datos incluidos, el entrenamiento se realizó con una GPU NVIDIA V100 durante 170,3 horas, consumiendo 60,2862 kWh de energía y emitiendo 28,937 kg de CO₂ equivalente. El proceso se llevó a cabo en la región `ap-southeast1` con un factor de eficiencia energética (PUE) de 1,18. No se proporcionan detalles sobre la arquitectura, el tamaño o la naturaleza del modelo entrenado, por lo que esta ficha debe interpretarse como un registro de sostenibilidad y no como una especificación técnica de un sistema de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no describe el modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo que fue objeto del entrenamiento. El repositorio solo documenta el proceso desde una perspectiva ambiental: se utilizó una GPU NVIDIA V100, el modo de entrenamiento fue fine-tuning y se registraron 170,3 horas de uso de GPU con un PUE de 1,18. El consumo energético total fue de 60,2862 kWh y las emisiones asociadas alcanzaron 28,937 kg de CO₂ equivalente, calculadas mediante la herramienta CodeCarbon. No se mencionan datos de entrenamiento, técnicas de optimización (RLHF, DPO, etc.) ni innovaciones arquitectónicas.

## Capacidades

- Este repositorio no implementa capacidades de IA (generación de texto, razonamiento, código, visión, etc.). Su función es exclusivamente documental: registrar la huella de carbono de un entrenamiento.
- No se incluye soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- La única "capacidad" destacable es la de servir como ejemplo de tarjeta de emisiones para el seguimiento de la sostenibilidad en el desarrollo de modelos.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: este tipo de tarjeta permite a organizaciones y equipos cuantificar el impacto ambiental de sus entrenamientos, facilitando la toma de decisiones sobre infraestructura (por ejemplo, elegir regiones con energía más limpia o reducir horas de GPU).
- Cumplimiento de políticas de reporting: empresas y centros de investigación pueden usar este formato como plantilla para reportar emisiones a organismos reguladores o iniciativas de IA responsable.
- Educación en IA verde: en entornos académicos, sirve como material didáctico para enseñar a los estudiantes a medir y comunicar el coste ambiental de sus experimentos.
- Comparación de eficiencia entre configuraciones: al documentar hardware, región y energía, se pueden comparar distintos escenarios de entrenamiento y optimizar el uso de recursos.
- Trazabilidad en publicaciones científicas: los autores pueden adjuntar esta tarjeta a sus papers para dar transparencia sobre el coste energético de sus modelos.
- Gestión de presupuesto energético en proyectos de larga duración: el registro de kWh y CO₂ permite estimar el impacto acumulado de múltiples ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de ningún modelo, solo datos de emisiones y consumo energético.

## Requisitos de hardware

- El entrenamiento documentado se realizó con una GPU NVIDIA V100 (1 GPU).
- No se especifican requisitos para inferencia, ya que no se publica ningún modelo.
- El consumo energético reportado es de 60,2862 kWh para 170,3 horas de GPU, lo que equivale a una potencia media aproximada de 354 W (sin considerar el PUE).
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay pesos ni arquitectura.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con otros sistemas; es una tarjeta de contabilidad de carbono. Existen otros repositorios similares en Hugging Face (por ejemplo, `subhamtheprogrammer/tds-carbon-card` o `sreemithravinda/tds-carbon-card`) que siguen el mismo formato de la asignación TDS GA8, pero no contienen modelos ni especificaciones técnicas.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo funcional: no se puede descargar, ejecutar ni integrar en ningún sistema.
- La ausencia de licencia y de detalles sobre el modelo entrenado impide cualquier uso comercial o técnico.
- Los datos de emisiones se basan en estimaciones de CodeCarbon y dependen de factores como el mix eléctrico de la región; pueden no reflejar el impacto real con precisión.
- No se aporta información sobre sesgos, alucinaciones o limitaciones de idioma, al no existir un modelo subyacente.
- Para producción, este repositorio no es relevante; su valor es meramente documental y educativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/khanmuneeba99/tds-carbon-card
- Ejemplo similar (subhamtheprogrammer): https://huggingface.co/subhamtheprogrammer/tds-carbon-card
- Ejemplo similar (sreemithravinda): https://huggingface.co/sreemithravinda/tds-carbon-card
- Información sobre reporting de emisiones en model cards (OECD): https://oecd.ai/en/catalogue/tools/model-cards/tool-use-cases/reporting-carbon-emissions-on-open-source-model-cards
