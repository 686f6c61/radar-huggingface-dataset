# Meh-11/molvision-lora

## Resumen

MolVision-LoRA es una colección de adaptadores LoRA (PEFT) entrenados sobre el modelo vision-lenguaje `Salesforce/blip2-opt-2.7b` para la predicción de propiedades moleculares a partir de una imagen 2D de la molécula y su cadena SMILES. El trabajo lo firman Mehreen, Hafsa y Areesha (repositorio `Meh-11`) como proyecto de curso de otoño de 2026, y reproduce el benchmark MolVision (Adak, Rawat y Vyas, NeurIPS 2025 Datasets & Benchmarks Track). No es un modelo de pesos completos: el repositorio (0,2 GB) contiene cuatro adaptadores independientes de ~42 MB cada uno, uno por tarea.

El modelo base BLIP-2 combina un codificador visual con un Q-Former y un decoder de lenguaje OPT de 2.700 millones de parámetros, lo que permite condicionar la generación de texto en una imagen. Cada adaptador especializa ese pipeline para responder a una pregunta concreta sobre una propiedad molecular: aprobación FDA y toxicidad clínica (ClinTox-V), penetración de la barrera hematoencefálica (BBBP-V), inhibición de BACE-1 (BACE-V) y solubilidad acuosa (ESOL-V). La relevancia práctica es acotada: se trata de material de reproducción académica, con resultados desiguales frente al artículo original, y no de un modelo listo para producción.

El interés técnico principal está en el experimento adicional incluido, que mide si el modelo realmente lee la estructura de la imagen. Los resultados sugieren que el adaptador BACE-V depende de la *presencia* de una imagen más que de su contenido específico, un hallazgo relevante para cualquiera que plantee usar VLM en química.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP-2 (codificador visual + Q-Former + decoder OPT) con adaptadores LoRA |
| Parametros totales | ~2.700 millones en el modelo base; adaptadores LoRA de ~42 MB cada uno |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de OPT-2.7B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos base en float16 en el ejemplo de carga; adaptadores en safetensors) |
| Idiomas soportados | no disponible (prompts en inglés en la configuración de inferencia) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT); requiere el modelo base `Salesforce/blip2-opt-2.7b` |

## Arquitectura y entrenamiento

El modelo base es BLIP-2 con OPT-2.7B como decoder de lenguaje: un codificador de imagen congelado se conecta mediante un Q-Former al decoder autorregresivo, de modo que la generación de texto queda condicionada por la representación visual. Sobre esa arquitectura se aplican adaptadores LoRA con rango `r = 16` y `lora_alpha = 32`, entrenados en modo "both" (imagen + SMILES) con un prompt de tarea. La partición de datos es aleatoria 70/10/20 con semilla 42.

La lectura de clasificación se hace comparando la probabilidad del token "Yes" frente a "No" tras la pregunta, con umbral de decisión ajustado en validación y almacenado en `inference_config.json`. La regresión (ESOL-V) se resuelve generando un número con un máximo de 8 tokens nuevos. No se documentan en la model card el volumen de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO; los datos proceden de MoleculeNet (BACE, BBBP, ClinTox, ESOL) a través del benchmark MolVision.

## Capacidades

- Predicción de propiedades moleculares a partir de imagen 2D de la molécula más SMILES: clasificación binaria (ClinTox-V, BBBP-V, BACE-V) y regresión (ESOL-V).
- Generación de texto condicionada por imagen mediante el pipeline `image-text-to-text` de BLIP-2.
- Clasificación mediante comparación de logits de tokens ("Yes"/"No") con umbral configurable.
- Regresión mediante generación de un valor numérico acotado a 8 tokens.
- Cuatro adaptadores independientes seleccionables por subcarpeta (`clintox`, `bbbp_v`, `bace_v`, `esol`).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingües.

## Casos de uso

- Reproducción académica del benchmark MolVision: cargar cada adaptador con PEFT y comparar métricas propias frente a las tablas 4 y 6 del artículo, útil en cursos de ML aplicado a química.
- Docencia sobre PEFT y LoRA: los adaptadores son pequeños (~42 MB) y permiten ilustrar fine-tuning paramétricamente eficiente sobre un VLM de 2.700 millones de parámetros en hardware modesto.
- Estudio de sesgos de modalidad en VLM: el experimento de imagen intercambiada (condiciones A/B/C/D) sirve como plantilla para auditar si un modelo usa realmente la información visual o solo su presencia.
- Prototipado de clasificación de toxicidad clínica con datos ClinTox-V, siempre como exploración y nunca para decisiones regulatorias.
- Análisis de solubilidad acuosa (ESOL-V) como ejemplo de regresión con salida generativa, útil para comparar con cabezas de regresión clásicas.
- Investigación sobre lectura de estructuras químicas: usar el adaptador BACE-V con imágenes vecinas (Tanimoto ≥ 0,85) para estudiar sensibilidad estructural del modelo.

## Benchmarks y rendimiento

Resultados publicados por el autor en su model card, sobre sus propios conjuntos de test, frente a las cifras del artículo MolVision (BLIP-2 tras fine-tuning LoRA, Image+Text).

| Dataset | Test n | Accuracy | F1 | ROC-AUC | Accuracy del artículo (F1) |
|---|---|---|---|---|---|
| ClinTox-V | 269 | 0,993 | 0,996 | 0,995 | 0,89 (0,93) |
| BBBP-V | 368 | 0,889 | 0,922 | 0,953 | 0,93 (0,96) |
| BACE-V | 121 | 0,587 | 0,590 | 0,628 | 0,86 (0,83) |

| Dataset | Test n | RMSE | MAE | RMSE del artículo |
|---|---|---|---|---|
| ESOL-V | 40 | 1,82 | 1,50 | 1,07 |

Las métricas de clasificación se dan a umbral 0,5; en BACE-V, con el umbral ajustado (0,51), la accuracy cae a 0,603 y el F1 a 0,500. El autor advierte que ClinTox-V está muy desbalanceado (~93 % positivos en test), que BACE-V está cerca del azar y que las predicciones de ESOL-V colapsaron a dos valores (−2,8 y −3,8), apenas mejor que predecir la media de entrenamiento (RMSE 1,91).

Experimento de imagen intercambiada (adaptador BACE-V, test completo n=117):

| Condición | Accuracy | AUC | Tasa de cambio de predicción vs A |
|---|---|---|---|
| A: imagen correcta | 0,607 | 0,633 | — |
| B: imagen aleatoria de otra molécula | 0,621 | 0,629 | 7,9 % |
| D: imagen en blanco | 0,453 | 0,431 | 65,0 % |

En el subconjunto con vecino estructural cercano (n=27), la imagen del vecino (C) dio accuracy 0,704 y AUC 0,725, frente a 0,630 y 0,714 con la imagen correcta.

## Requisitos de hardware

- El modelo base BLIP-2 OPT-2.7B en float16 ocupa aproximadamente 5-6 GB de pesos; con overhead de activaciones y procesador de imagen, se recomienda un mínimo de 8-10 GB de VRAM.
- GPU recomendadas: A100 o H100 para lotes grandes y evaluación por lotes; RTX 4090 (24 GB) para entrenamiento e inferencia cómodos; RTX 3090/4080 (16-24 GB) viables en float16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en float16; con cuantización de 8 bits podría ajustarse en 8 GB, aunque no se documentan recetas de cuantización.
- Despliegue: el ejemplo oficial usa `transformers` (`Blip2Processor`, `Blip2ForConditionalGeneration`) más `peft.PeftModel`. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama; para BLIP-2 el camino habitual es transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MolVision-LoRA (este) | ~2.700 M (base) + LoRA | no disponible | VLM imagen+SMILES para propiedades moleculares | no disponible | Hugging Face, 0 descargas |
| `Salesforce/blip2-opt-2.7b` (base) | ~2.700 M | no disponible | VLM generalista imagen-texto | no disponible en la información | Hugging Face |
| MolVision (paper, BLIP-2 + LoRA) | ~2.700 M | no disponible | Mismo benchmark, referencia publicada | no disponible | Paper NeurIPS 2025 |
| Modelos clásicos de MoleculeNet (p. ej. GIN, MPNN) | variable, típicamente < 10 M | N/A | GNN sobre grafo molecular | variable | Amplia |

La comparación cuantitativa con alternativas no está disponible más allá de las cifras del artículo recogidas en la sección de benchmarks.

## Limitaciones y advertencias

- Entrenado y evaluado con una única partición aleatoria; sin semillas repetidas ni intervalos de confianza en los resultados principales.
- BACE-V y ESOL-V no reproducen el rendimiento del artículo: BACE-V está cerca del azar y ESOL-V colapsa a dos valores de predicción.
- El experimento de imagen intercambiada indica que el modelo puede depender de la presencia de una imagen más que de su contenido estructural, lo que cuestiona su uso como lector de estructuras.
- ClinTox-V está fuertemente desbalanceado, por lo que accuracy y F1 están inflados; debe mirarse la balanced accuracy y el AUC.
- Sin información sobre licencia: no se puede confirmar el uso comercial. El autor lo restringe explícitamente a investigación y coursework, y lo declara no apto para decisiones clínicas, regulatorias o de seguridad de fármacos.
- Sin datos de idiomas soportados; los prompts de inferencia están en inglés.
- Riesgo de alucinación inherente a la generación autorregresiva, especialmente en la tarea de regresión con salida numérica generada.
- No se documentan sesgos conocidos más allá de los derivados del desbalanceo de ClinTox-V y de la composición de MoleculeNet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Meh-11/molvision-lora
- Modelo base: https://huggingface.co/Salesforce/blip2-opt-2.7b
- Benchmark MolVision: https://molvision.github.io/MolVision/
- Artículo citado: Adak, Rawat y Vyas, "MolVision: Molecular Property Prediction with Vision Language Models", NeurIPS 2025 Datasets and Benchmarks Track (sin URL directa en la información disponible)
- MoleculeNet (origen de los datos): no disponible en la información proporcionada
