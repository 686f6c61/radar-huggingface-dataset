# sag-uniroma2/GRIClimate_MODEL

## Resumen

GRIClimate_MODEL es un clasificador de texto multietiqueta desarrollado por el grupo de investigación sag-uniroma2 (Universidad de Roma Tor Vergata) para categorizar divulgaciones climáticas de informes de sostenibilidad según las categorías GRI (Global Reporting Initiative). Forma parte del sistema UniTor ESG Insights, una plataforma interactiva con intervención humana para el análisis trazable de informes de sostenibilidad, presentada en CIKM 2026. El modelo resuelve el problema de asignar automáticamente fragmentos de texto corporativo a siete categorías GRI relacionadas con el clima.

Técnicamente se trata de un ajuste fino (fine-tuning) de ClimateBERT, concretamente del checkpoint `climatebert/distilroberta-base-climate-f`, que es una versión destilada de RoBERTa adaptada al dominio climático. El modelo resultante tiene una arquitectura transformer encoder de tipo DistilRoBERTa, con licencia Apache 2.0 y un tamaño de repositorio de 0,3 GB. Su relevancia actual radica en la creciente demanda de herramientas automatizadas para auditar y clasificar la información ESG (ambiental, social y de gobernanza) en informes corporativos, un ámbito donde la trazabilidad y la especialización de dominio son críticas.

El modelo está entrenado exclusivamente en inglés y se distribuye como un clasificador de texto listo para usar en pipelines de Hugging Face. Su rendimiento reportado, con una precisión del 80,5 % y un F1 macro del 75,5 % en validación cruzada de 10 pliegues, lo posiciona como una herramienta viable para tareas de clasificación temática en el dominio de sostenibilidad, aunque con limitaciones derivadas del tamaño reducido del conjunto de datos (586 muestras) y del desequilibrio entre clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilRoBERTa, destilado de RoBERTa) |
| Parametros totales | no disponible (el modelo base DistilRoBERTa tiene aproximadamente 82 millones, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DistilRoBERTa soporta hasta 512 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,3 GB, presumiblemente safetensors o pytorch bin, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo se basa en ClimateBERT, un checkpoint derivado de DistilRoBERTa que fue preentrenado adicionalmente sobre corpus del dominio climático (informes corporativos, noticias y literatura científica sobre cambio climático). Sobre esta base, sag-uniroma2 realizó un ajuste fino supervisado para una tarea de clasificación multiclase con siete categorías GRI: GRI 2, GRI 101, GRI 201, GRI 302, GRI 303, GRI 305 y GRI 306. La arquitectura es un transformer encoder estándar con una cabeza de clasificación lineal sobre el token [CLS], típica de los modelos de la familia RoBERTa.

El conjunto de datos de entrenamiento consta de 586 muestras etiquetadas, distribuidas de forma desequilibrada: GRI 2 (231), GRI 306 (100), GRI 305 (61), GRI 302 (60), GRI 101 (54), GRI 303 (46) y GRI 201 (34). No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de aumento de datos, ponderación de clases o regularización específica. Tampoco se detalla si hubo fases de RLHF o DPO, algo poco habitual en modelos de clasificación. La validación se realizó mediante validación cruzada de 10 pliegues, reportando media y desviación estándar de accuracy y F1 macro.

## Capacidades

- Clasificación de texto multiclase: asigna fragmentos de texto a una de las siete categorías GRI climáticas definidas (GRI 2, 101, 201, 302, 303, 305, 306).
- Especialización en dominio climático y ESG: el preentrenamiento sobre corpus climático de ClimateBERT le confiere vocabulario y representaciones adaptadas a terminología de sostenibilidad, emisiones, agua, residuos y gobernanza.
- Procesamiento de texto en inglés: entrenado y evaluado exclusivamente en inglés.
- Integración en pipelines de Hugging Face: compatible con `pipeline("text-classification")` y con la librería Transformers.
- Salida de probabilidades por clase: permite umbrales de confianza y análisis de incertidumbre.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.

## Casos de uso

- Clasificación automática de secciones de informes de sostenibilidad: el modelo puede procesar párrafos extraídos de memorias corporativas y asignarles la categoría GRI climática correspondiente, facilitando la indexación y búsqueda temática en grandes volúmenes documentales.
- Auditoría de divulgación climática: permite verificar si una empresa cubre las categorías GRI relevantes (emisiones, agua, residuos, energía) y detectar áreas con disclosure insuficiente, usando las probabilidades por clase como indicador de cobertura.
- Alimentación de sistemas human-in-the-loop: integrado en UniTor ESG Insights, el modelo preclasifica fragmentos y los presenta al analista junto con el párrafo original y la página del PDF para validación y corrección, reduciendo el esfuerzo manual de triaje.
- Construcción de datasets etiquetados ESG: puede usarse como etiquetador débil o preanotador para generar conjuntos de datos de mayor tamaño que luego se revisan manualmente, acelerando la creación de corpus para investigación.
- Análisis comparativo entre empresas y sectores: al clasificar disclosures de múltiples compañías, permite agregar métricas de cobertura por categoría GRI y comparar patrones de reporte climático entre organizaciones.
- Filtrado y enrutamiento documental: en pipelines de procesamiento de PDFs corporativos, el modelo puede dirigir fragmentos relevantes a módulos especializados (por ejemplo, cálculo de emisiones o análisis de agua) según la categoría GRI asignada.
- Investigación académica en finanzas sostenibles: sirve como componente reproducible en estudios sobre calidad de divulgación climática, con licencia Apache 2.0 que facilita su reutilización.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles en la información proporcionada son los reportados por el autor mediante validación cruzada de 10 pliegues:

| Metrica | Valor (media ± desviacion estandar) |
|---|---|
| Accuracy | 80,5 % ± 4,5 |
| F1 macro | 75,5 % ± 6,5 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible. No se dispone de resultados por clase ni de matrices de confusión.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo basado en DistilRoBERTa (aproximadamente 82 millones de parámetros), la inferencia en FP32 requiere alrededor de 0,3-0,5 GB de VRAM; en FP16, menos de 0,3 GB. Estas cifras son estimaciones basadas en el tamaño del modelo base, no confirmadas en la información proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) para despliegues de alto throughput.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1 GB de VRAM; también puede ejecutarse en CPU con latencia aceptable para lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers (nativo), pipelines de clasificación de texto, ONNX Runtime, TorchScript, y servidores de inferencia como TGI o vLLM (aunque vLLM está optimizado para modelos generativos; para clasificadores es más habitual usar Transformers o TGI). También es posible exportar a GGUF para llama.cpp, aunque no se documenta en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un modelo de este tamaño, se espera un throughput alto en GPU (miles de fragmentos por segundo en batch), pero no se confirma con datos del autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, el modelo se puede situar frente a otras alternativas de clasificación ESG, pero no se han encontrado datos de rendimiento comparables en la información disponible. Se indica "no disponible" para una comparativa cuantitativa rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRIClimate_MODEL | no disponible (base DistilRoBERTa) | no disponible | Accuracy 80,5 % ± 4,5; F1 macro 75,5 % ± 6,5 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tamaño reducido del conjunto de datos: solo 586 muestras, lo que limita la robustez y la generalización del modelo a dominios o formatos no vistos.
- Desequilibrio de clases: GRI 2 concentra 231 de 586 muestras, mientras que GRI 201 solo tiene 34; esto puede provocar un rendimiento desigual entre categorías, con F1 macro (75,5 %) notablemente inferior al accuracy (80,5 %).
- Idioma: entrenado exclusivamente en inglés; no se garantiza rendimiento en castellano ni en otros idiomas.
- Dominio restringido: especializado en informes de sostenibilidad y terminología GRI climática; su uso fuera de este dominio puede degradar el rendimiento.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar etiquetas incorrectas con alta confianza en fragmentos ambiguos o fuera de distribución.
- Sesgos: no se documentan análisis de sesgos; el modelo puede heredar sesgos del corpus de preentrenamiento de ClimateBERT y del conjunto de anotación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se atribuya adecuadamente; no se especifican restricciones adicionales.
- Caveat para producción: la validación se realizó con validación cruzada sobre un conjunto pequeño; se recomienda validar en el dominio específico antes de desplegar y mantener revisión humana en aplicaciones críticas de auditoría ESG.
- No se documentan limitaciones de contexto (longitud máxima de entrada) en la información proporcionada; se asume la del modelo base, pero no se confirma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sag-uniroma2/GRIClimate_MODEL
- Demo interactiva: https://huggingface.co/spaces/sag-uniroma2/UniTorESGInsights
- Repositorio GitHub: https://github.com/crux82/UniTorESGInsights
- Colección completa de modelos: https://huggingface.co/collections/sag-uniroma2/unitoresginsights
- Paper (CIKM 2026): https://doi.org/10.1145/3799682.3840253
- Modelo base ClimateBERT: https://huggingface.co/climatebert/distilroberta-base-climate-f
