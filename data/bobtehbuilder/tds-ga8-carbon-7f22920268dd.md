# bobtehbuilder/tds-ga8-carbon-7f22920268dd

## Resumen

El repositorio `bobtehbuilder/tds-ga8-carbon-7f22920268dd` no contiene un modelo de inteligencia artificial desplegable, sino un registro de contabilidad de carbono asociado al entrenamiento de un modelo denominado "TDS GA8". Publicado por el usuario `bobtehbuilder` en agosto de 2026, este repositorio documenta las emisiones de CO₂ equivalente generadas durante el preentrenamiento de dicho modelo, utilizando la herramienta CodeCarbon para la medición.

La relevancia de esta ficha reside en que ejemplifica la creciente práctica de reportar la huella de carbono de los modelos de IA, un aspecto cada vez más valorado por la comunidad open source y por organizaciones que buscan cumplir criterios de sostenibilidad. Sin embargo, al no incluir pesos, arquitectura ni artefactos de inferencia, no puede utilizarse como modelo de lenguaje, visión u otro tipo. Toda la información disponible se limita a las emisiones, el hardware empleado y la ubicación geográfica del entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo TDS GA8 (tipo de red, número de capas, mecanismo de atención, etc.). La model card únicamente documenta el proceso de entrenamiento desde la perspectiva ambiental: se utilizaron 2 GPU NVIDIA H100 (700 W TDP) durante 383,2 horas GPU, con un PUE (Power Usage Effectiveness) de 1,53, en la región `europe-north1` con una intensidad de red de 120 gCO₂eq/kWh. El consumo energético total fue de 820,8144 kWh, lo que resultó en 98,498 kg de CO₂eq emitidos, según el cálculo de CodeCarbon.

No se mencionan datos del conjunto de entrenamiento, número de tokens, técnicas de alineación (RLHF, DPO) ni innovaciones técnicas. El repositorio se centra exclusivamente en el reporting de emisiones.

## Capacidades

No se han documentado capacidades funcionales del modelo. Este repositorio no incluye pesos, código de inferencia ni ejemplos de uso. Las únicas capacidades verificables son:

- Medición de emisiones de CO₂ durante el entrenamiento (98,498 kg CO₂eq).
- Registro de métricas de eficiencia energética (820,8144 kWh consumidos).
- Reporte de hardware y ubicación geográfica del cómputo.

No hay soporte para generación de texto, código, visión, tool calling ni ninguna otra funcionalidad de IA.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: el repositorio sirve como referencia para calcular y reportar la huella de carbono de un entrenamiento, aplicable a procesos de certificación de sostenibilidad.
- Comparativa de eficiencia energética entre modelos: los datos de emisiones y energía pueden utilizarse para comparar el coste ambiental de distintos enfoques de entrenamiento.
- Docencia sobre IA responsable: útil como ejemplo real de cómo documentar emisiones siguiendo la metodología CodeCarbon y las guías de transparencia de Hugging Face.
- Planificación de infraestructura: los valores de PUE y de intensidad de red pueden orientar decisiones sobre dónde ubicar entrenamientos para minimizar emisiones.
- Integración en pipelines de reporte ESG: los datos de este repositorio pueden incorporarse a informes de sostenibilidad corporativa de organizaciones que entrenan modelos.
- Investigación en eficiencia de hardware: las horas GPU y el consumo energético por GPU permiten estimar el coste energético de arquitecturas similares en otros proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene evaluaciones de calidad del modelo (MMLU, HumanEval, GSM8K, etc.), solo métricas de emisiones.

## Requisitos de hardware

- Este repositorio no contiene artefactos de inferencia, por lo que no se pueden estimar requisitos de VRAM, GPU ni latencia para ejecución.
- El entrenamiento original utilizó 2 GPU NVIDIA H100 (700 W TDP) durante 383,2 horas GPU.
- No se indica si el modelo resultante cabe en GPU de consumo (RTX 4090, etc.) ni se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI).
- Los datos de energía y emisiones son los únicos parámetros de hardware disponibles.

## Comparativa con modelos similares

No disponible. No existe información sobre modelos comparables en este repositorio, ya que no se trata de un modelo con capacidades de IA sino de un registro de emisiones.

## Limitaciones y advertencias

- **No es un modelo desplegable**: no contiene pesos, tokenizador ni código de inferencia. Intentar cargarlo como un modelo de IA fallará.
- **Sesgos y alucinaciones**: no aplicables, al no existir un modelo de generación.
- **Limitaciones de idioma**: no se especifican idiomas soportados; la documentación está en inglés.
- **Restricciones de licencia**: la licencia no está indicada en la model card, por lo que se desconoce si el contenido puede reutilizarse con fines comerciales.
- **Datos de emisiones específicos**: los valores de CO₂ dependen de la intensidad de red de la región `europe-north1` (120 gCO₂eq/kWh) y del PUE de 1,53; extrapolarlos a otras ubicaciones o fechas puede llevar a errores.
- **Advertencia para producción**: no utilice este repositorio como fuente de datos de inferencia. Úselo únicamente como referencia de reporte de emisiones.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/bobtehbuilder/tds-ga8-carbon-7f22920268dd)
- [Repositorios similares del mismo autor](https://huggingface.co/bobtehbuilder/tds-ga8-carbon-414018fd4fff) y [otro](https://huggingface.co/bobtehbuilder/tds-ga8-carbon-6fb0f25c2a7b)
- [Repositorio GitHub relacionado (no oficial)](https://github.com/22f3001797/tds-ga8)
