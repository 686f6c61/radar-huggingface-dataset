# harshit4/tds-ga8-green-ai-audit

## Resumen
El repositorio `harshit4/tds-ga8-green-ai-audit` no contiene un modelo de inteligencia artificial, sino un registro de auditoría de emisiones de carbono correspondiente a un entrenamiento de GPU (TDS 2026 May GA8, pregunta 10). Documenta el cálculo de la huella de CO₂ equivalente para un pre-entrenamiento realizado con 8 GPUs NVIDIA V100 en la región `asia-south1`, con un resultado de 369,296 kg CO₂eq. Este tipo de documentación es relevante en el contexto de la iniciativa Green AI, que busca cuantificar y mitigar el impacto ambiental de los sistemas de IA.

El repositorio incluye una tabla de ejecución con los parámetros del entrenamiento (GPU, horas, PUE, región) y la fórmula de cálculo empleada. No hay pesos, arquitectura ni código de inferencia. Se trata de un ejemplo de transparencia ambiental para un experimento académico, no de un modelo desplegable.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento
No se trata de un modelo de aprendizaje automático; es un documento de auditoría que registra el consumo energético de un entrenamiento previo. Los datos incluidos son: 8 GPUs NVIDIA V100 (300 W TDP), 186,4 GPU-horas, PUE de 1,27, región `asia-south1` con 650 gCO₂eq/kWh, y tipo de entrenamiento `pre-training`. El cálculo se presenta en la model card: `energy_kWh = (300 * 8 * 186,4 * 1,27) / 1000 = 568,1472 kWh` y `co2_kg = (568,1472 * 650) / 1000 = 369,296 kg CO2eq`. No hay detalles sobre el modelo entrenado (arquitectura, datos, parámetros).

## Capacidades
- No tiene capacidades de generación de texto, razonamiento, código, visión ni otras funciones propias de un modelo de IA.
- Su contenido se limita a la documentación de un cálculo de emisiones de carbono para un entrenamiento específico.
- Puede servir como plantilla para auditorías similares dentro del marco de Green IA.

## Casos de uso
- **Auditoría interna de emisiones**: el repositorio puede utilizarse como referencia para calcular la huella de carbono de entrenamientos propios, replicando la fórmula con los datos del propio entorno (GPU, horas, PUE, región).
- **Documentación para informes de sostenibilidad**: en proyectos de IA, se puede incluir este tipo de registro para cumplir con requisitos de transparencia ambiental ante clientes o reguladores.
- **Educación sobre Green AI**: sirve como ejemplo didáctico de cómo cuantificar emisiones en el entrenamiento de modelos, mostrando la influencia de la región, el hardware y el PUE.
- **Comparación de hardware**: al tener datos de una configuración concreta (V100 × 8), se puede contrastar con otros entrenamientos para evaluar la eficiencia energética.
- **Integración con herramientas de seguimiento**: el uso de CodeCarbon (mencionado en los metadatos) permite replicar la medición en otros proyectos.
- **Investigación en sostenibilidad**: el dato de 369,296 kg CO₂eq puede ser citado en estudios sobre el coste ambiental de la IA en la región asiática.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene evaluaciones de rendimiento del modelo, ya que no es un modelo de IA.

## Requisitos de hardware
- No aplica para inferencia, ya que no hay modelo que ejecutar.
- El entrenamiento auditado requirió 8 GPUs NVIDIA V100 (300 W TDP) durante 186,4 GPU-horas, lo que equivale a 568,1472 kWh de energía consumida.
- Para reproducir el cálculo, no se necesita hardware adicional; basta con conocer los parámetros del entrenamiento.

## Comparativa con modelos similares
Existe otro repositorio con propósito similar: `anshusaurav/tds-ga8-carbon-model` (https://huggingface.co/anshusaurav/tds-ga8-carbon-model). Ambos documentan auditorías de carbono para el mismo ejercicio TDS GA8. No se dispone de más detalles sobre ese repositorio, por lo que no se puede realizar una comparación cuantitativa. En general, este tipo de artefactos no compite con modelos de lenguaje; se comparan entre sí por su metodología y datos de cálculo.

| Repositorio | Propósito | Datos clave | Licencia |
|---|---|---|---|
| harshit4/tds-ga8-green-ai-audit | Auditoría de emisiones de un pre-entrenamiento | 8×V100, 186,4 GPU-h, 369,296 kg CO₂eq | no disponible |
| anshusaurav/tds-ga8-carbon-model | Auditoría de emisiones (mismo contexto) | no disponible | no disponible |

## Limitaciones y advertencias
- No es un modelo de IA: no puede generar texto, razonar ni ejecutar tareas de lenguaje.
- Los datos de emisiones son específicos de la región `asia-south1` y de la configuración de hardware indicada; no son extrapolables a otros entornos sin recalcular.
- La licencia no está especificada; no se puede garantizar el uso comercial del contenido.
- La metodología de cálculo se basa en un factor de emisión regional (650 gCO₂eq/kWh) que puede variar con el tiempo; los valores son estimaciones.
- El repositorio no incluye el código de entrenamiento ni los pesos, por lo que no es reproducible más allá del cálculo de emisiones.

## Enlaces
- HuggingFace: https://huggingface.co/harshit4/tds-ga8-green-ai-audit
- Repositorio similar: https://huggingface.co/anshusaurav/tds-ga8-carbon-model
- Documentación del Green AI Model: https://green-ai-model.github.io/docs/
- Introducción del Green AI Model: https://green-ai-model.github.io/docs/1_introduction/
- Discusión sobre el modelo (GitHub): https://green-ai-model.github.io/docs/ (sección Discussion About Github)
- Página principal de Hugging Face: https://huggingface.co/
