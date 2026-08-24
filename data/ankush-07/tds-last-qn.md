# Ankush-07/tds-last-qn

## Resumen

Este repositorio no contiene un modelo de IA funcional, sino una tarjeta de modelo que documenta la huella de carbono y el balance energético de una ejecución de entrenamiento. Lo publica el usuario Ankush-07 como parte de la asignatura TDS GA8, un ejercicio de contabilidad de carbono en IA (Green AI Carbon Accounting). El documento registra los datos de un preentrenamiento realizado con 7 GPU NVIDIA L40S en la región ap-southeast1, con un consumo total de 271,2 kWh y unas emisiones de 130,176 kg de CO₂ equivalente, calculadas mediante CodeCarbon.

El repositorio tiene cero descargas y cero "me gusta", y no expone pesos, arquitectura ni pipeline de inferencia. Su relevancia no radica en ofrecer un modelo utilizable, sino en ejemplificar prácticas de transparencia ambiental en el ciclo de vida del entrenamiento de modelos. No se dispone de información sobre arquitectura, tamaño de parámetros ni contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se documenta ninguna arquitectura concreta (transformer, MoE, SSM, etc.) en la informacion disponible. La model card indica únicamente que el régimen de entrenamiento fue de pre-training, ejecutado sobre 7 GPU NVIDIA L40S en la región ap-southeast1, con un total de 97,1 horas de GPU y un factor de eficiencia energética (PUE) de 1,14. El consumo energético total fue de 271,2003 kWh y las emisiones asociadas, de 130,176 kg de CO₂ equivalente, medidas con la librería CodeCarbon.

No se mencionan datos de entrenamiento, composición del dataset, ni técnicas de alineación como RLHF o DPO. Tampoco se describen innovaciones técnicas destacables. El objetivo declarado del repositorio es la contabilidad de carbono, no la documentación de un modelo funcional.

## Capacidades

- No se han publicado capacidades funcionales del modelo.
- No se dispone de información sobre generación de texto, razonamiento, código o matemáticas.
- No hay soporte documentado para tool calling, agentes ni razonamiento multi-paso.
- No hay capacidades multilingües declaradas.
- La única funcionalidad constatable es la de servir como registro de emisiones y consumo energético de una ejecución de entrenamiento.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: el repositorio puede usarse como plantilla para documentar el consumo energético y las emisiones de CO₂ de una ejecución de entrenamiento, siguiendo la metodología de CodeCarbon con PUE y región geográfica.
- Cumplimiento normativo de transparencia climática: en entornos corporativos o académicos que exigen reportar la huella de carbono de los modelos, esta ficha sirve como ejemplo de cómo estructurar la información.
- Educación en IA sostenible: el repositorio puede utilizarse en cursos universitarios (como TDS en IIT Madras) para enseñar a los estudiantes a medir y documentar el impacto ambiental de sus experimentos.
- Optimización de infraestructura de entrenamiento: los datos de energía y emisiones por hora de GPU permiten comparar la eficiencia de distintas configuraciones de hardware y regiones de nube.
- Trazabilidad de experimentos: el registro con timestamps y localización geográfica facilita la reproducibilidad y la rendición de cuentas en proyectos de investigación.
- Evaluación de trade-offs entre rendimiento y sostenibilidad: permite a equipos técnicos decidir si compensa reducir la escala de entrenamiento para disminuir la huella de carbono, basándose en datos medidos y no en estimaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones de calidad del modelo ni comparativas con otros sistemas.

## Requisitos de hardware

- Infraestructura documentada para el entrenamiento: 7 GPU NVIDIA L100S, con 97,1 horas de GPU y un consumo total de 271,2 kWh.
- Región de cómputo: ap-southeast1 (Google Cloud), con PUE de 1,14.
- No se especifican requisitos de VRAM para inferencia, ya que no se distribuyen pesos.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque este repositorio no constituye un modelo de IA funcional, sino un registro de contabilidad de carbono. No hay alternativa de la misma categoría con la que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos ni artefactos de inferencia; cualquier intento de cargarlo o desplegarlo será infructuoso.
- No se dispone de licencia declarada, por lo que el uso comercial del contenido del repositorio queda en un limbo legal y no debe asumirse como permitido.
- No se documentan sesgos ni riesgos de alucinación, pero también es cierto que no existe un modelo subyacente que pueda generarlos.
- La información de emisiones se basa en estimaciones de CodeCarbon; los valores dependen del factor de emisión de la red eléctrica de la región y pueden no reflejar el mix energético real de un proveedor.
- El repositorio tiene cero descargas y cero interacciones, lo que sugiere que es un proyecto académico de evaluación interna, no un artefacto pensado para producción.
- La fecha de creación (agosto de 2026) y la ausencia de cualquier especificación técnica hacen que su utilidad práctica sea prácticamente nula para desarrolladores e investigadores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ankush-07/tds-last-qn
- Proyecto relacionado en GitHub (agente autónomo con LangGraph y LangChain, mencionado en la búsqueda web): https://github.com/ArghyaPal-07/tds-project-2
- Paquete PyPI relacionado con TDS 2026 en IIT Madras: https://pypi.org/project/tds-hello-ankush-mi07/
