# Imr79/medgemma-1.5-4b-healthvault-lora

## Resumen

Imr79/medgemma-1.5-4b-healthvault-lora es un adaptador LoRA de 0.1 GB que afina el modelo base `unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit`, una versión cuantizada en 4 bits de MedGemma 1.5 4B, desarrollado por Google DeepMind para aplicaciones sanitarias. El adaptador, publicado por el usuario Imr79, se distribuye con la librería PEFT y ha sido entrenado mediante supervisión fina (SFT) con el stack de Hugging Face (transformers, trl, unsloth).

La relevancia de este adaptador radica en que permite ajustar un modelo médico multimodal ya optimizado para el dominio sanitario sin necesidad de reentrenar los pesos completos, reduciendo costes computacionales y de almacenamiento. La información pública es muy limitada: la model card no documenta el conjunto de datos de entrenamiento, el proceso de ajuste ni los benchmarks, por lo que esta ficha se basa en las capacidades heredadas del modelo base y en los pocos metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre MedGemma 1.5 4B (variante de Gemma 3 4B multimodal con encoder SigLIP) |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0.1 GB en safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 4B soporta 128k tokens, pero el adaptador no especifica) |
| Tipos de cuantizacion | el base se suministra en 4 bits (bnb-4bit); el adaptador es en precision completa (fp32) |
| Idiomas soportados | no disponible (MedGemma 1.5 hereda el multilingue de Gemma 3, pero el adaptador no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre la arquitectura de MedGemma 1.5 4B, un modelo multimodal basado en Gemma 3 4B. MedGemma 1.5 4B integra un encoder de vision SigLIP entrenado con datos medicos deidentificados, lo que le permite procesar imagenes 2D (radiografias de torax), volumenes 3D (CT, MRI) y diapositivas de histopatologia completa, ademas de texto clinico. El adaptador ha sido entrenado con PEFT 0.20.0 usando el flujo de trabajo SFT de TRL, pero se desconocen los hiperparametros, el numero de pasos y el dataset empleado. El nombre "healthvault" sugiere un ajuste orientado a un corpus clinico concreto, aunque no hay confirmacion publica.

## Capacidades

- Generacion de texto medico y razonamiento clinico: hereda las capacidades del modelo base para comprender y generar informes, diagnosticos y resumenes medicos.
- Comprension de imagenes medicas: al estar basado en MedGemma 1.5, puede procesar radiografias de torax, CT/MRI volumetricos y histopatologia de diapositivas completas, con localizacion anatomica mediante cajas delimitadoras.
- Analisis longitudinal de radiografias: soporta comparacion entre multiples puntos temporales de una misma radiografia, util para seguimiento de enfermedades.
- Comprension de documentos medicos: entiende informes de laboratorio, historias clinicas electronicas y otros documentos textuales complejos.
- Tool calling y agentes: no se ha confirmado si el adaptador preserva las capacidades de tool calling del modelo base Gemma 3; no hay evidencia en la documentacion.
- Multilingue: el modelo base es multilingue, pero el adaptador no declara idiomas soportados.

## Casos de uso

- Asistencia al diagnostico clinico: un profesional puede cargar una radiografia de torax y una breve historia clinica para obtener una descripcion preliminar de hallazgos relevantes, usando el adaptador como apoyo a la revision radiologica.
- Analisis de informes de laboratorio: el modelo puede resumir paneles de analitica complejos y destacar valores fuera de rango en lenguaje natural, facilitando la interpretacion en entornos de atencion primaria.
- Seguimiento de pacientes con patologia cronica: mediante la comparacion de radiografias en multiples tiempos, se pueden generar informes de evolucion de enfermedades como la EPOC o la fibrosis pulmonar.
- Educacion medica: el adaptador puede generar casos clinicos simulados o explicar procedimientos diagnosticos a estudiantes de medicina en un entorno controlado.
- Investigacion en histopatologia: los investigadores pueden usar el modelo para preetiquetar diapositivas completas y reducir el trabajo manual de revision en estudios de cohortes.
- Telemedicina en entornos con recursos limitados: al ser un adaptador ligero sobre una base 4-bit, puede desplegarse en infraestructura modesta para soportar consultas remotas en areas con poco acceso a especialistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no incluye metricas de evaluacion en su model card, ni se han encontrado comparativas externas. El modelo base MedGemma 1.5 4B reporta resultados en el informe tecnico de arXiv, pero esos datos corresponden al modelo completo y no a este adaptador LoRA, por lo que no se pueden extrapolar.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA de 0.1 GB se carga sobre el base 4-bit de MedGemma 1.5 4B (aproximadamente 2-3 GB en VRAM con cuantizacion 4 bits). La inferencia con PEFT requiere la base y el adaptador en memoria.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1660 Super, RTX 3060, RTX 4060 o superiores. Para procesar volumenes CT/MRI completos, se recomienda al menos 8 GB de VRAM.
- En consumer GPU: si, cabe en GPU de consumo medio (RTX 3060 o superior). Tambien puede ejecutarse en CPU para tareas de texto, aunque con latencia mayor.
- Opciones de despliegue: compatible con el ecosistema de Hugging Face (transformers + PEFT), por lo que se puede servir con vLLM, TGI, Ollama o llama.cpp si se convierte a GGUF. Para el adaptador LoRA, la via mas directa es usar `peft` para cargar la base y el adaptador.
- Latencia y throughput: no hay datos publicados. En una GPU de gama media (RTX 3080), se espera una latencia de pocos segundos por respuesta de texto corta; para imagenes volumetricas, la latencia dependera del tamaño del volumen y de la VRAM disponible.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Imr79/medgemma-1.5-4b-healthvault-lora | 4B base + LoRA 0.1 GB | no disponible | Texto + imagen (CT/MRI, histologia, RX) | no disponible | HF publico |
| MedGemma 1.5 4B (base) | 4B | 128k (Gemma 3) | Texto + imagen (CT/MRI, hist, RX) | Licencia Gemma (uso comercial permitido) | HF publico |
| Meditron 7B | 7B | 4k | Texto | Apache 2.0 | HF publico |
| BioMistral 7B | 7B | 8k | Texto | Apache 2.0 | HF publico |

La comparativa muestra que el adaptador es una opcion ligera sobre un modelo multimodal, mientras que las alternativas como Meditron y BioMistral son modelos de texto puro y de mayor tamano. La ventaja del adaptador es su coste de despliegue reducido, pero la falta de documentacion y de benchmarks impide una comparacion objetiva de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un adaptador sobre un modelo entrenado con datos de imagen y texto medicos, puede heredar sesgos demograficos o de tipo de poblacion de los datos de entrenamiento del base.
- Riesgo de alucinacion: en el dominio medico, las alucinaciones pueden ser peligrosas. El modelo no debe usarse como unico criterio para decisiones clinicas sin validacion por un profesional.
- Limitaciones de contexto: la longitud de contexto no esta documentada para el adaptador; si se hereda de Gemma 3, seria de 128k tokens, pero no se ha verificado.
- Limitaciones de idioma: no se declaran idiomas soportados. El base es multilingue, pero el adaptador puede haber sido entrenado solo en ingles o en un idioma concreto, lo que degradaria el rendimiento en otros idiomas.
- Restricciones de licencia: la licencia no esta especificada. El modelo base MedGemma tiene licencia de Google con restricciones de uso comercial; el adaptador hereda estas condiciones, pero el autor no lo aclara.
- Caveat de produccion: no hay datos de evaluacion, por lo que no se recomienda su uso en produccion sin una validacion exhaustiva en el dominio de aplicacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Imr79/medgemma-1.5-4b-healthvault-lora
- MedGemma 1.5 (Google DeepMind): https://deepmind.google/models/gemma/medgemma/
- Informe tecnico de MedGemma 1.5 (arXiv): https://arxiv.org/abs/2604.05081
- Model card oficial de MedGemma 1.5 (Google for Developers): https://developers.google.com/health-ai-developer-foundations/medgemma/model-card
- Modelo base unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit: https://huggingface.co/unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit
