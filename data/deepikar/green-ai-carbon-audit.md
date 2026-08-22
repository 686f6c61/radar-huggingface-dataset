# DeepikaR/green-ai-carbon-audit

## Resumen
El repositorio `DeepikaR/green-ai-carbon-audit` no contiene un modelo de inteligencia artificial, sino una ficha de auditoría de emisiones de carbono asociada a un proceso de fine-tuning realizado con una GPU NVIDIA H100. El autor, DeepikaR, documenta el impacto ambiental estimado de un entrenamiento de 418,8 horas en la región europea `europe-north1`, con un consumo total de 325,4 kWh y unas emisiones de 39,049 kg de CO₂ equivalente. Este tipo de registros forma parte de la iniciativa Green AI, que busca cuantificar y reducir la huella de carbono de los proyectos de aprendizaje automático.

La relevancia de esta entrada reside en su función como ejemplo de transparencia ambiental en el desarrollo de IA, más que como un artefacto de inferencia. No se proporciona ningún peso, arquitectura o pipeline de modelo, por lo que no es utilizable para tareas de generación, clasificación o razonamiento. Su contenido es puramente metadato de auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se trata de un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento descrito en el repositorio. El contenido se limita a un cálculo de emisiones de carbono basado en el hardware utilizado (una NVIDIA H100 de 700 W durante 418,8 horas) y en la intensidad de carbono de la red eléctrica de la región `europe-north1` (120 gCO₂eq/kWh). No se aportan detalles sobre el dataset, el algoritmo, el tipo de fine-tuning ni ninguna innovación técnica.

## Capacidades

- No se ha publicado ninguna capacidad de generación de texto, razonamiento, código, visión o audio.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-step.
- No hay evidencia de capacidades multilingües.
- El único dato funcional es la estimación de impacto ambiental de un proceso de computación, no una funcionalidad de IA.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla o registro para calcular y reportar las emisiones de CO₂ de un entrenamiento con GPU, siguiendo la metodología de CodeCarbon.
- Transparencia en publicaciones académicas: puede utilizarse como anexo en papers o informes técnicos para declarar el coste ambiental de los experimentos.
- Educación sobre Green AI: permite a desarrolladores e investigadores ver un ejemplo concreto de cálculo de huella de carbono con parámetros reales de hardware y región.
- Benchmark de eficiencia energética: aunque no ofrece datos comparativos, el formato puede replicarse para comparar el impacto de distintos configuraciones de entrenamiento.
- Integración en pipelines de MLOps: el esquema de metadatos (emisiones, hardware, región) puede adoptarse en sistemas de seguimiento de experimentos para registrar el impacto de cada ejecución.
- Documentación regulatoria: en contextos donde se exija informar sobre el impacto ambiental de la computación, este tipo de registros puede servir como evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de calidad de modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros sistemas, ya que no existe un modelo subyacente.

## Requisitos de hardware

- No se requiere hardware de inferencia, ya que no hay modelo desplegable.
- El hardware usado en el entrenamiento reportado fue una NVIDIA H100 de 700 W, con un consumo de 325,4 kWh durante 418,8 horas.
- No se dispone de información sobre VRAM, GPU recomendadas para despliegue, latencia ni throughput, al no existir artefacto de inferencia.
- Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no son aplicables.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable en la categoría de modelos de IA, ya que este repositorio no es un modelo. Existen otros repositorios con el mismo nombre de autor (`Bhakti1206/green-ai-carbon-audit`, `24f1002802/green-ai-carbon-audit`) que siguen la misma estructura de auditoría de carbono, pero no contienen modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no puede ejecutar tareas de procesamiento de lenguaje natural ni otras funciones de aprendizaje automático.
- La información de emisiones es una estimación basada en supuestos de potencia del hardware (700 W) y de intensidad de carbono de la red; los valores reales pueden variar según el uso efectivo de la GPU y el mix eléctrico.
- No se especifica la licencia de uso del contenido, lo que puede limitar su reutilización en proyectos comerciales.
- No hay datos sobre sesgos, alucinación o limitaciones de idioma, ya que no existe un modelo con estas características.
- Para producción, no se puede integrar en ningún sistema de IA, solo como documentación de impacto ambiental.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DeepikaR/green-ai-carbon-audit
- Repositorios similares (misma estructura): https://huggingface.co/Bhakti1206/green-ai-carbon-audit y https://huggingface.co/24f1002802/green-ai-carbon-audit
- Guía de herramientas de Green AI (referencia metodológica): https://ejhusom.github.io/green-ai/
- Artículo sobre iniciativas de IA verde: https://www.sciencedirect.com/science/article/pii/S0959652624025393
