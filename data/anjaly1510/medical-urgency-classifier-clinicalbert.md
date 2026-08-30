# Anjaly1510/Medical-Urgency-Classifier-ClinicalBERT

## Resumen

Medical-Urgency-Classifier-ClinicalBERT es un modelo de clasificación de texto fine-tuneado a partir de medicalai/ClinicalBERT, un modelo BERT preentrenado específicamente para dominios clínicos. El modelo está diseñado para clasificar la urgencia médica de textos clínicos, aunque la model card no especifica las categorías de salida ni el conjunto de datos de entrenamiento utilizado.

El desarrollo corre a cargo del usuario Anjaly1510, que ha publicado el modelo en Hugging Face con la librería transformers. Con 135 millones de parámetros y arquitectura BERT, el modelo hereda las capacidades de comprensión del lenguaje clínico de su base, pero presenta importantes limitaciones de documentación: no se especifica la licencia, los idiomas soportados, el dataset de entrenamiento ni las etiquetas de clasificación. Además, el repositorio tiene cero descargas y cero likes, lo que indica que es un modelo reciente o de uso muy limitado.

La relevancia de este modelo reside en su potencial aplicación en triaje clínico automatizado, aunque su utilidad práctica queda condicionada por la falta de transparencia en los datos de entrenamiento y por unos resultados de evaluación que, con una precisión del 100 % en validación, resultan sospechosamente perfectos y probablemente indican sobreajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base, 12 capas, 768 hidden, 12 cabezas de atencion) |
| Parametros totales | 135.326.210 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredado de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32/fp16) |
| Idiomas soportados | no disponible (heredado de ClinicalBERT: ingles clinico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT-Base, con 12 capas transformer, 768 unidades ocultas y 12 cabezas de atencion, sumando 135 millones de parametros. La base es medicalai/ClinicalBERT, que a su vez deriva de Bio_ClinicalBERT, preentrenado sobre textos biomedicos de PubMed, articulos de PMC y notas clinicas de MIMIC-III.

El fine-tuning se realizo con la libreria transformers usando el Trainer de Hugging Face. Los hiperparametros de entrenamiento incluyen una tasa de aprendizaje de 2e-05, batch size de 4, optimizador AdamW con betas (0.9, 0.999), scheduler lineal y 5 epocas. El dataset de entrenamiento se indica como "None" en la model card, lo que es una anomalia: o bien el autor no documento el dataset, o bien se entreno con un volumen de datos extremadamente reducido. El numero total de pasos de entrenamiento fue de 10, lo que sugiere un dataset muy pequeno.

No se menciona el uso de tecnicas como RLHF, DPO o decodificacion especulativa. El entrenamiento es un fine-tuning clasico supervisado con una cabeza de clasificacion.

## Capacidades

- Clasificacion de textos clinicos por nivel de urgencia medica, aunque las categorias exactas no estan documentadas.
- Comprension de vocabulario clinico y biomedico heredado de ClinicalBERT, incluyendo terminologia de historiales clinicos electronicos (EHR).
- Clasificacion de secuencias de texto (text-classification) mediante pipeline de transformers.
- Sin soporte documentado para tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- Sin modo de pensamiento (thinking mode) ni capacidades de vision o audio.

## Casos de uso

- Triaje de urgencias en atencion primaria: el modelo podria clasificar la urgencia de notas clinicas o mensajes de pacientes para priorizar atencion, aunque la falta de documentacion sobre las etiquetas de salida dificulta su integracion directa.
- Filtrado de mensajes de pacientes en portales de salud: clasificar mensajes entrantes para derivarlos a urgencias, consulta programada o informacion general.
- Soporte a servicios de telemedicina: priorizar consultas remotas segun la urgencia declarada en el texto del paciente.
- Investigacion en NLP clinico: servir como punto de partida para experimentos de clasificacion de urgencia sobre datasets propios, dado que el modelo esta fine-tuneado y puede adaptarse con pocos datos.
- Ensenanza y demostracion de fine-tuning: el repositorio documenta un flujo completo de entrenamiento con Trainer, util como ejemplo didactico de ajuste de BERT clinico.
- Clasificacion de notas de alta hospitalaria: identificar pacientes que requieren seguimiento urgente tras el alta, siempre que las etiquetas del modelo coincidan con las necesidades del servicio.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.). Los unicos datos disponibles son los resultados de validacion durante el entrenamiento, declarados por el autor:

| Metrica | Valor |
|---|---|
| Loss de validacion | 0.6721 |
| Accuracy | 1.0 |
| F1 | 1.0 |

Estos resultados, obtenidos sobre un conjunto de validacion no especificado, presentan una precision perfecta que resulta poco creible en un escenario clinico real. El progreso del entrenamiento muestra una mejora progresiva desde accuracy 0.5 en la epoca 1 hasta 1.0 en la epoca 4, con solo 10 pasos totales, lo que indica un dataset de validacion muy reducido o un claro sobreajuste. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 600 MB en fp32 (135 M parametros), unos 300 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, A100, H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna, incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: compatible con Hugging Face Inference Endpoints, vLLM, TGI y transformers pipeline. No se proporcionan pesos en GGUF, por lo que no es compatible directamente con llama.cpp u Ollama.
- Latencia estimada: en una GPU moderna (RTX 3090 o superior), la inferencia de una secuencia de 512 tokens deberia completarse en menos de 50 ms. En CPU, puede tardar entre 200 y 500 ms por secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Medical-Urgency-Classifier-ClinicalBERT | 135 M | 512 tokens | no disponible | Clasificacion de urgencia clinica |
| medicalai/ClinicalBERT | 135 M | 512 tokens | no disponible | Fill-mask, base para fine-tuning |
| emilyalsentzer/Bio_ClinicalBERT | 135 M | 512 tokens | no disponible | Base para NLP clinico |

Las tres opciones comparten arquitectura y tamano. La diferencia del modelo evaluado es su fine-tuning especifico para clasificacion de urgencia, aunque la falta de documentacion sobre el dataset y las etiquetas impide una comparacion de rendimiento significativa. Para uso en produccion, un equipo deberia evaluar si el fine-tuning aporta valor real frente a usar ClinicalBERT directamente con una cabeza de clasificacion entrenada sobre sus propios datos.

## Limitaciones y advertencias

- La model card no especifica el dataset de entrenamiento ni las etiquetas de clasificacion, lo que impide conocer el dominio exacto de aplicacion.
- Los resultados de validacion (accuracy y F1 del 100 %) son sospechosamente perfectos y probablemente indican sobreajuste a un dataset muy pequeno. No se debe confiar en estos numeros para decisiones clinicas.
- No se especifica la licencia, por lo que el uso comercial es juridicamente incierto.
- No hay informacion sobre sesgos del modelo, pero al heredar de ClinicalBERT, puede reflejar sesgos presentes en los textos clinicos de MIMIC-III (poblacion mayoritariamente estadounidense, sesgos de genero y raza).
- Riesgo de alucinacion en clasificacion: el modelo puede asignar niveles de urgencia incorrectos a textos ambiguos o fuera de su distribucion de entrenamiento.
- No se documentan los idiomas soportados; el modelo base esta entrenado principalmente en ingles clinico, por lo que su uso en otros idiomas probablemente degrade el rendimiento.
- El repositorio tiene cero descargas y cero likes, lo que indica ausencia de validacion por parte de la comunidad.
- No debe utilizarse como unico criterio para decisiones medicas. Requiere supervision humana y validacion externa rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anjaly1510/Medical-Urgency-Classifier-ClinicalBERT
- Modelo base medicalai/ClinicalBERT: https://huggingface.co/medicalai/ClinicalBERT
- Bio_ClinicalBERT: https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT
- Ficha de ClinicalBERT en Microsoft Foundry: https://ai.azure.com/catalog/models/medicalai-clinicalbert
- Pagina de ClinicalBERT en Endor Labs: https://www.endorlabs.com/ai-model/medicalai-clinicalbert
- Articulo sobre BioClinicalBERT: https://www.emergentmind.com/topics/bioclinicalbert
