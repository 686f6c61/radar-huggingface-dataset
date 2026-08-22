# sk8069/green-ai-carbon-audit-card

## Resumen

El repositorio `sk8069/green-ai-carbon-audit-card` no contiene un modelo de inteligencia artificial al uso, sino un registro de auditoría de emisiones de carbono asociado a un proceso de fine-tuning. Fue creado por el usuario sk8069 el 22 de agosto de 2026 y documenta las emisiones de CO₂ equivalente de una ejecución de entrenamiento con una NVIDIA RTX 4090 durante 321,2 horas en la región europe-north1. El objetivo de esta tarjeta es servir como referencia transparente de la huella ambiental de un ciclo de entrenamiento, en línea con las prácticas de "Green AI" que buscan cuantificar y reducir el impacto ecológico de los modelos. Aunque no es un modelo funcional, su existencia aporta datos útiles para auditorías de sostenibilidad en el desarrollo de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Este artefacto no describe una arquitectura de red neuronal ni un proceso de entrenamiento de modelo. Se limita a documentar los datos de consumo energético y emisiones de CO2 de una ejecución de fine-tuning concreta. Según la model card, se utilizó una GPU NVIDIA RTX 4090 (TDP de 450 W) durante 321,2 horas, con un factor de eficiencia energética (PUE) de 1,27 y una intensidad de carbono regional de 120 gCO2eq/kWh. El cálculo refleja una energía total consumida de 183,566 kWh y unas emisiones de 22,028 kg CO2eq. No se especifica qué modelo base se ajustó, ni el dataset empleado, ni la técnica de entrenamiento (RLHF, DPO, etc.).

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generación de texto, razonamiento, código, visión ni ninguna otra funcionalidad de IA.
- El contenido se limita a un informe de emisiones de carbono, por lo que no ofrece herramientas de inferencia ni procesamiento de datos.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: la tarjeta sirve como plantilla para documentar las emisiones de un ciclo de entrenamiento, útil para equipos que quieran reportar la huella de carbono de sus modelos.
- Educación en sostenibilidad de IA: puede usarse como ejemplo práctico en cursos o talleres para explicar cómo se calculan las emisiones de un entrenamiento a partir del hardware, la duración y la región.
- Integración en pipelines de CI/CD: aunque no es un modelo, su estructura de datos podría servir de referencia para generar informes automáticos de emisiones en proyectos de desarrollo de IA.
- Evaluación de eficiencia energética: permite comparar el consumo de distintos entrenamientos si se replican los mismos parámetros de cálculo.
- Documentación de cumplimiento normativo: en contextos donde se exija reportar la huella de carbono de sistemas de IA, este registro puede usarse como ejemplo de formato.
- Desarrollo de herramientas de cálculo: el espacio de HuggingFace asociado (`sk8069/green-ai-carbon-audit`) puede usarse como base para construir calculadoras de emisiones personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositor no contiene evaluaciones de rendimiento de un modelo, sino únicamente datos de consumo energético.

## Requisitos de hardware

No aplicable a un modelo, pero los datos del registro indican que el entrenamiento se realizó con una NVIDIA RTX 4090 (450 W TDP). No se especifican requisitos de VRAM, latencia ni throughput para inferencia, ya que no existe modelo que desplegar. El repositor no ofrece opciones de despliegue (vLLM, llama.cpp, etc.).

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque este repositor no es un modelo de IA. No hay alternativas equivalentes en el mismo sentido.

## Limitaciones y advertencias

- El registro solo cubre un entrenamiento concreto; no es representativo de otros entrenamientos ni de la huella de un modelo en producción.
- La metodología de cálculo (fórmula de energía y factor de emisión) puede variar según la región y la fuente de energía; los valores aquí son específicos de europe-north1.
- No se indica el modelo base ni los datos de entrenamiento, por lo que no se puede replicar el experimento sin más información.
- No hay licencia definida, lo que limita el uso del contenido para fines comerciales o de redistribución sin permiso explícito.
- El repositor no ofrece ningún artefacto ejecutable; es una documentación estática.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/sk8069/green-ai-carbon-audit-card
- Espacio de HuggingFace asociado: https://huggingface.co/spaces/sk8069/green-ai-carbon-audit
- Otro repositorio similar (de otro autor): https://huggingface.co/24f2008956/green-ai-carbon-audit
- Referencia de Green AI (página de ejemplos): https://ejhusom.github.io/green-ai/
- Herramienta de cálculo de huella de carbono para IA (Greenly): https://tools.greenly.earth/ai-calculator
- Artículo sobre sostenibilidad en IA: https://www.sciencedirect.com/science/article/pii/S2949823626000668
