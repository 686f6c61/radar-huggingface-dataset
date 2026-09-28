# elnachto/laya-triage-en

## Resumen

laya-triage-en es un modelo de clasificación de texto en inglés desarrollado por elnachto, un ajuste fino del checkpoint inglés de Laya (basado en la arquitectura encoder ModernBERT-large) con 421.293.830 parámetros. Su tarea concreta es clasificar issues de GitHub en cuatro categorías mutuamente excluyentes: bug, feature, question y docs. No genera texto: devuelve una etiqueta en un único forward pass, tanto en CPU como en GPU, sin necesidad de clave de API.

El modelo es el motor del componente en inglés de la GitHub Action laya-triage y cuenta con un hermano multilingüe, laya-triage-multilingual, para texto no inglés. Su rasgo diferencial es que la confianza de salida está calibrada (temperatura 0,741, ECE de 0,083 a 0,022 con priores), de modo que el sistema que lo invoca puede abstenerse cuando no está seguro y delegar el issue a una persona mantenedora.

Es relevante porque aborda el triaje automático de repositorios con un coste de inferencia muy bajo (0,8 GB de pesos en bf16), una licencia Apache-2.0 sin restricciones comerciales y unos resultados medidos sobre el conjunto de referencia NLBSE'23 que superan a varios sistemas publicados, con la particularidad de ofrecer etiquetado selectivo y soporte explícito para priores de clase realistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large, checkpoint ingles de Laya) |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base es ModernBERT-large; los cuerpos de issue se truncan a 1.500 caracteres en entrenamiento) |
| Tipos de cuantizacion | no disponible; los pesos se publican en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Tarea | text-classification (clasificacion de issues en bug / feature / question / docs) |
| Modelo base | convaiinnovations/laya |
| Autor | elnachto |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT-large afinado para clasificación, con 421M parámetros y una cabeza de clasificación sobre el token de representación. Hereda del checkpoint inglés de Laya (convaiinnovations/laya). La inferencia se resuelve en un único forward pass, sin generación de texto, y la salida incluye probabilidades y una confianza calibrada.

El ajuste fino se realizó sobre 150.000 issues del conjunto de entrenamiento de NLBSE'23, con 37.500 ejemplos por clase, excluyendo los conjuntos de validación y test. Se entrenó una única época con AdamW (learning rate 2,5e-5 para el encoder y 1e-4 para la cabeza), label smoothing de 0,1 y precisión bf16 sobre una sola RTX 5070; la segunda época provocaba sobreajuste y se descartó. Los cuerpos de los issues se limpiaron de plantillas repetidas y se truncaron a 1.500 caracteres. La calibración se hizo ajustando una temperatura de 0,741 sobre la mitad del conjunto de validación, lo que redujo el error de calibración esperado (ECE) de 0,083 a 0,022 al aplicar los priores de clase.

Como innovaciones destacables, el modelo incorpora priores de clase almacenados en `rl_agent_config.json` (bug 0,526; feature 0,370; question 0,060; docs 0,044) que se multiplican por las probabilidades y se renormalizan, y un mecanismo de decisión selectiva por umbral de confianza. Además, un enrutador (Router) dirige automáticamente el texto no inglés al modelo multilingüe.

## Capacidades

- Clasificación de issues de GitHub en cuatro clases: bug, feature, question y docs.
- Salida con confianza calibrada que permite abstenerse cuando la certeza es baja.
- Etiquetado selectivo: con umbral de confianza ≥ 0,60 etiqueta el 91,7% de los issues con un 90,2% de precisión.
- Soporte de priores de clase configurables para adaptar la decisión a la mezcla real de cada repositorio.
- Inferencia en un solo forward pass, sin generación de texto ni clave de API.
- Funcionamiento tanto en CPU como en GPU.
- Integración con la biblioteca `laya` mediante un enrutador que combina este modelo con el multilingüe.
- No dispone de tool calling, agentes, capacidades multimodales ni modo de razonamiento: es un clasificador puro.

## Casos de uso

- Triaje automático de issues en repositorios de código abierto: la GitHub Action laya-triage clasifica cada issue entrante como bug, feature, question o docs y lo etiqueta automáticamente, reduciendo el trabajo manual de mantenimiento.
- Enrutado a equipos o etiquetas de flujo de trabajo: el resultado de la clasificación puede disparar reglas de CI que asignen el issue al equipo correspondiente (por ejemplo, bugs al equipo de ingeniería y questions a soporte).
- Etiquetado selectivo con revisión humana: con el umbral de confianza configurado, el sistema etiqueta automáticamente la mayoría de issues y deja los dudosos (especialmente question y docs) a la persona mantenedora, equilibrando automatización y precisión.
- Monitorización de la salud de un repositorio: agregando las predicciones por clase a lo largo del tiempo se pueden detectar picos de bugs o de peticiones de funcionalidad y priorizar el roadmap.
- Filtrado previo en pipelines de soporte técnico: clasificar el texto entrante para separar incidencias reales de dudas de uso o de errores en documentación antes de que lleguen a un sistema mayor.
- Análisis retrospectivo de grandes volúmenes de issues: procesar miles de issues históricos en CPU para estudiar la distribución de tipos de reporte sin coste de GPU.
- Sistemas multilingües: combinado con laya-triage-multilingual a través del Router, permite cubrir repositorios con issues en varios idiomas derivando el texto no inglés al modelo correspondiente.

## Benchmarks y rendimiento

Clasificación de informes de issues del conjunto de referencia NLBSE'23, muestra aleatoria de 5.000 issues del conjunto de test oficial (sistema completo: este modelo más el multilingüe, con priores de clase). Margen de ±0,9 puntos al 95%.

| Sistema | Accuracy (= micro F1) | Macro F1 |
|---|---|---|
| RoBERTa, baseline oficial de NLBSE'23 (entrenado con ~1,27M issues) | 89,1% | no disponible |
| laya-triage (este modelo + multilingue, con priores) | 86,8% | 0,756 |
| FastText, baseline oficial de NLBSE'23 | 85,1% | no disponible |
| Jev (TypeSafe, alojado), medido por los autores | 84,4% | 0,704 |
| Laya base, misma pregunta | 75,9% | no disponible |
| harikarthikmanyam/laya-issue-triage, medido por los autores | 64,5% | 0,547 |

Sobre los 4.775 issues de test que el enrutador envía a este modelo inglés: 87,0% de accuracy y macro F1 de 0,759. Por clase (sistema completo): bug 0,907; feature 0,879; question 0,595; docs 0,642.

Etiquetado selectivo: con confianza ≥ 0,60 etiqueta el 91,7% de los issues con un 90,2% de precisión. Umbrales más estrictos alcanzan ~97% de precisión en aproximadamente la mitad de los issues.

Issues nunca vistos: sobre 2.000 issues cerrados abiertos en 2026 en 1.145 repositorios (500 por clase), macro F1 de 0,725 frente a 0,523 de Laya base y 0,660 de Jev.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,85 GB en bf16/fp16 para los 421M parámetros; unos 0,45 GB en int8 y unos 0,25 GB en int4 (cuantización no publicada oficialmente).
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM sirve; se entrenó en una sola RTX 5070. No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes, así como en GPUs integradas con suficiente memoria compartida.
- Inferencia en CPU: el modelo está diseñado para ejecutarse en un único forward pass en CPU, por lo que no necesita GPU en producción.
- Opciones de despliegue: biblioteca propia `laya` (clase `Router`), pipeline de `transformers` para text-classification, TGI para servir clasificación, o exportación a ONNX. No se documenta soporte para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 421M en un solo forward pass, la latencia por petición es baja incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Accuracy (NLBSE'23) | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| laya-triage-en (este modelo) | 421M | Clasificacion de issues (4 clases) | 87,0% (ingles) | 0,759 | apache-2.0 | HuggingFace |
| RoBERTa (baseline NLBSE'23) | ~355M (roberta-large) | Clasificacion de issues | 89,1% | no disponible | MIT (RoBERTa) | Entrenado por el baseline, no publicado como modelo de triaje |
| FastText (baseline NLBSE'23) | no disponible | Clasificacion de issues | 85,1% | no disponible | MIT | Herramienta, no modelo publicado |
| harikarthikmanyam/laya-issue-triage | ~421M | Clasificacion de issues | 64,5% | 0,547 | no disponible | HuggingFace |
| Jev (TypeSafe) | no disponible | Clasificacion de issues | 84,4% | 0,704 | propietaria | Servicio alojado |

## Limitaciones y advertencias

- Las clases question y docs son las más difíciles, con F1 en torno a 0,6; muchos issues de tipo question se leen como si fueran informes de bug.
- Está entrenado con issues en inglés; el texto no inglés debe derivarse al modelo multilingüe (el enrutador lo hace de forma automática).
- Las etiquetas de entrenamiento provienen de las etiquetas que ponen las personas mantenedoras en GitHub, que son ruidosas e inconsistentes entre proyectos.
- No es un clasificador de spam ni de seguridad; no debe usarse para esos fines.
- Los resultados reportados solo se reproducen si la pregunta de clasificación es exactamente la usada en entrenamiento (tipo choice con las cuatro categorías y sus descripciones).
- El uso de los priores de clase altera las predicciones; si la mezcla de un repositorio difiere mucho (por ejemplo, muchas questions), conviene omitirlos o definir los propios.
- El modelo se entrenó con una única época; la segunda provocaba sobreajuste, lo que sugiere poca tolerancia a más pasos de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo al no producir texto libre, pero sí puede asignar etiquetas incorrectas con alta confianza en casos límite.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero el modelo base Laya también es Apache-2.0, por lo que la cadena de licencias es compatible.
- Formato de pesos únicamente en safetensors bf16; no se publican conversiones oficiales a GGUF ni cuantizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elnachto/laya-triage-en
- Modelo hermano multilingüe: https://huggingface.co/elnachto/laya-triage-multilingual
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- GitHub Action laya-triage: https://github.com/elnachto/laya-triage
- Repositorio del autor: https://github.com/elnachto
- Convai Innovations en HuggingFace: https://huggingface.co/convaiinnovations
- Competencia de clasificación de informes de issues NLBSE'23: https://github.com/nlbse2023/issue-report-classification
