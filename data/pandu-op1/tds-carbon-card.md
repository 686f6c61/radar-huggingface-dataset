# Pandu-Op1/tds-carbon-card

## Resumen

Este repositorio, identificado como `Pandu-Op1/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una **model card de contabilidad de carbono** correspondiente a una ejecución de entrenamiento dentro del programa "TDS GA8". El autor, Pandu-Op1, documenta la huella de carbono y el consumo energético asociados a un proceso de pre-entrenamiento realizado con 8 GPUs NVIDIA RTX 4090 en la región `asia-south1`. El objetivo es proporcionar transparencia sobre el impacto ambiental del entrenamiento de modelos, en línea con las prácticas de "Green AI".

La relevancia de este repositorio radica en que ejemplifica cómo registrar emisiones de CO₂ equivalentes (619,22 kg) y consumo eléctrico (952,65 kWh) en un formato estandarizado, utilizando la herramienta CodeCarbon. No obstante, al no tratarse de un modelo con pesos, arquitectura o capacidades de inferencia, su utilidad práctica se limita a servir como referencia metodológica para la contabilidad de emisiones en proyectos de IA. No hay descargas, likes ni pipeline asociado, y la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

**Datos del entrenamiento documentado** (según la model card):

| Parametro | Valor |
|---|---|
| Hardware | 8x NVIDIA RTX 4090 |
| Modo de entrenamiento | pre-training |
| Region | asia-south1 |
| Horas de GPU | 177,6 h (PUE: 1,49) |
| Energia total | 952,6464 kWh |
| Emisiones de CO₂ | 619,22 kg CO₂eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura de red neuronal, ya que el repositorio no incluye un modelo. La model card documenta únicamente los aspectos energéticos de una sesión de pre-entrenamiento. Se especifica que el hardware utilizado fueron 8 GPUs NVIDIA RTX 4090, con un total de 177,6 horas de cómputo y un factor de eficiencia energética (PUE) de 1,49 en el centro de datos de la región `asia-south1`. El consumo energético total fue de 952,6464 kWh, lo que se tradujo en 619,22 kg de CO₂ equivalente, calculados mediante la librería CodeCarbon. No hay detalles sobre el dataset, el número de tokens o el proceso de optimización (RLHF, DPO, etc.), ya que no se documentan en la información disponible.

## Capacidades

- No aplica: el repositorio no contiene un modelo con capacidades de generación, razonamiento, código, visión u otras.
- La única "capacidad" es la de servir como registro de emisiones de carbono para un entrenamiento específico, útil para auditorías ambientales o estudios de eficiencia energética en IA.

## Casos de uso

- **Auditoría de sostenibilidad en proyectos de IA**: el repositorio puede usarse como plantilla para reportar el impacto ambiental de entrenamientos propios, siguiendo el formato de CodeCarbon.
- **Investigación en Green AI**: investigadores pueden analizar estos datos para comparar la eficiencia energética de diferentes configuraciones de hardware (RTX 4090) y regiones de cómputo.
- **Documentación interna de empresas**: equipos de MLOps pueden replicar esta estructura para cumplir requisitos de reporte de emisiones en sus organizaciones.
- **Educación**: sirve como ejemplo práctico de cómo medir y comunicar la huella de carbono en cursos sobre IA responsable.
- **Optimización de infraestructura**: los datos de PUE y consumo pueden orientar decisiones sobre dónde desplegar entrenamientos (regiones con energía más limpia).
- **Benchmarking de hardware**: aunque no hay comparaciones directas, los valores de kWh y CO₂ por hora de GPU pueden contrastarse con otros registros similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ya que no existe un modelo que evaluar. Los únicos datos numéricos son los relativos al consumo energético y emisiones, que no constituyen métricas de rendimiento de IA.

## Requisitos de hardware

- El entrenamiento documentado utilizó **8 GPUs NVIDIA RTX 4090**.
- No se especifican requisitos para inferencia, dado que no hay modelo.
- Para reproducir la contabilidad de carbono, se requiere acceso a la herramienta CodeCarbon y a un entorno de entrenamiento similar (GPU NVIDIA con soporte CUDA).
- No hay información sobre latencia, throughput ni opciones de despliegue (vLLM, llama.cpp, etc.), ya que no aplican.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en este repositorio, pues no se trata de un modelo de IA. El repositorio `shyam1504/tds-carbon-card` (encontrado en la búsqueda web) parece ser una variante del mismo ejercicio académico, con una estructura de model card idéntica, pero no se dispone de sus datos específicos para comparar.

## Limitaciones y advertencias

- **No es un modelo utilizable**: no contiene pesos, arquitectura ni capacidad de inferencia; cualquier intento de cargarlo como modelo fallará.
- **Alcance limitado**: los datos de emisiones corresponden a una única ejecución y no son generalizables a otros entrenamientos.
- **Sin licencia especificada**: no se indica bajo qué términos puede reutilizarse el contenido del repositorio.
- **Riesgo de malinterpretación**: podría confundirse con un modelo de IA real, por lo que se recomienda leer la model card completa antes de cualquier uso.
- **Falta de contexto técnico**: no se documentan hiperparámetros, dataset ni detalles del modelo entrenado, lo que impide evaluar la relevancia de las métricas de carbono.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pandu-Op1/tds-carbon-card
- Repositorio similar (shyam1504): https://huggingface.co/shyam1504/tds-carbon-card
- Herramienta CodeCarbon (referencia): no se proporciona enlace oficial en la información disponible, pero es la fuente citada para las mediciones.
