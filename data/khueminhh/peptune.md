# khueminhh/PepTune

## Resumen

PepTune es un modelo generativo de difusión discreta enmascarada (masked discrete diffusion) disenado para la generacion *de novo* de peptidos terapeuticos, desarrollado por Sophia Tang, Yinuo Zhang y Pranam Chatterjee (Chatterjee Lab) y presentado en ICML 2025. El modelo aborda el problema del diseno computacional de peptidos con multiples propiedades terapeuticas en conflicto, combinando un modelo de difusion sobre secuencias SMILES de peptidos con una busqueda en arbol Monte-Carlo (MCTS) que guia la generacion hacia el frente de Pareto de objetivos terapeuticos.

La arquitectura se apoya en el repositorio MDLM (Sahoo et al. 2024) y emplea un backbone RoFormer de 768 dimensiones ocultas, 8 capas y 12 cabezas de atencion. El modelo se preentrena sobre un conjunto de 11 millones de secuencias SMILES de peptidos y posteriormente se guia mediante MCTS para optimizar simultaneamente propiedades como afinidad de union, permeabilidad de membrana celular, solubilidad, resistencia a la bioincrustacion (non-fouling) y no hemolisis.

Es relevante porque propone un enfoque multiobjetivo explicito para el diseno de farmacos peptidicos, un area donde los generadores condicionales tradicionales suelen colapsar hacia un unico objetivo. La licencia Apache 2.0 facilita su reutilizacion en entornos de investigacion y desarrollo comercial, aunque el modelo esta claramente orientado a un dominio cientifico especializado y no a tareas de lenguaje general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion discreta enmascarada (MDLM) con backbone RoFormer |
| Parametros totales | no disponible (backbone: 768 hidden, 8 capas, 12 cabezas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generacion por longitud de peptido configurable, p. ej. 100 residuos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de secuencias de peptidos en SMILES) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints PyTorch (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

PepTune se construye sobre MDLM (Masked Diffusion Language Model), un marco de difusion discreta enmascarada para secuencias. El backbone es un RoFormer (transformer con atencion rotatoria) de 768 dimensiones ocultas, 8 capas y 12 cabezas de atencion, con un tokenizador SMILES SPE especifico para peptidos. El proceso de generacion parte de secuencias totalmente enmascaradas y las refina iterativamente mediante un esquema de ruido configurable (loglinear, logpoly). La innovacion central es el acoplamiento de este generador con un MCTS guiado por el frente de Pareto (`pareto_mcts.py`), que explora el espacio de secuencias y selecciona candidatos no dominados segun multiples funciones de puntuacion.

El preentrenamiento utiliza un dataset de 11 millones de secuencias SMILES de peptidos con batching dinamico por longitud, optimizador AdamW (lr=3e-4, weight_decay=0.075) y precision fp64. No se documenta en la model card el uso de RLHF ni DPO; la guia multiobjetivo se realiza en inferencia mediante MCTS, no mediante ajuste fino por refuerzo. Las funciones de puntuacion incluyen un transformer de atencion cruzada para afinidad de union y modelos XGBoost (entre otros) para solubilidad, permeabilidad, non-fouling y hemolisis.

## Capacidades

- Generacion *de novo* de secuencias de peptidos en formato SMILES.
- Generacion condicionada a proteinas diana predefinidas (AMHR, TfR, GFAP, GLP-1R, GLAST, NCAM, CRBN, ligasa E3, SKP2, p53, EGFP) o a secuencias personalizadas via `+prot_seq`.
- Optimizacion multiobjetivo simultanea de cinco propiedades terapeuticas: afinidad de union, solubilidad, permeabilidad, non-fouling y no hemolisis.
- Guiado por MCTS con seleccion sobre el frente de Pareto.
- Generacion incondicional de peptidos (`generate_unconditional.py`).
- Analisis de peptidos mediante utilidades integradas (`PeptideAnalyzer`).
- No soporta tool calling, function calling, agentes genericos ni capacidades multilingues: es un modelo de dominio cientifico.

## Casos de uso

- Descubrimiento de peptidos dirigidos a dianas terapeuticas: usar `generate_mcts.sh` con una proteina diana (por ejemplo `glp1` para el receptor GLP-1) para generar candidatos con alta afinidad de union y propiedades farmacocineticas favorables.
- Optimizacion de permeabilidad celular: guiar la generacion hacia peptidos que atraviesen membranas, util para dianas intracelulares como p53 o CRBN.
- Diseno de peptidos solubles y no hemoliticos: emplear las funciones de puntuacion de solubilidad y hemolisis para filtrar candidatos con menor riesgo de toxicidad.
- Peptidos con resistencia a bioincrustacion: optimizar la propiedad non-fouling para aplicaciones en dispositivos biomedicos o recubrimientos.
- Generacion de librerias de peptidos para cribado experimental: producir conjuntos diversos de secuencias no dominadas para su sintesis y validacion en laboratorio.
- Investigacion en generacion molecular multiobjetivo: usar el codigo y los checkpoints como base para experimentar con MCTS y difusion discreta en otros dominios moleculares.
- Dianas personalizadas: introducir una secuencia de proteina arbitraria via `+prot_seq` para explorar peptidos de union a nuevas dianas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El backbone RoFormer (768 hidden, 8 capas) es relativamente pequeno, pero el entrenamiento usa precision fp64, lo que incrementa el consumo de memoria.
- GPU recomendadas: no especificadas en la model card.
- Cabe en GPU consumer: probablemente si, dado el tamano del backbone, aunque no se confirma.
- Opciones de despliegue: scripts Python propios (`train_peptune.py`, `generate_mcts.py`, `generate_unconditional.py`) con entorno Conda (`src/environment.yml`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PepTune | Difusion discreta + MCTS para peptidos | no disponible | no disponible | Apache 2.0 | Hugging Face + Google Drive |
| MDLM (Sahoo et al.) | Difusion discreta para texto | no disponible | no disponible | no disponible | GitHub |
| Generadores peptidicos condicionales (p. ej. RFdiffusion) | Difusion estructural | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: no es un LLM de proposito general; no sirve para texto, codigo ni conversacion.
- Los pesos se distribuyen via Google Drive, no como archivos en el repositorio de Hugging Face (tamano del repo: 0.0 GB).
- No se documentan sesgos, tasas de alucinacion ni evaluacion de validez experimental de los peptidos generados.
- Las predicciones de propiedades dependen de modelos de puntuacion (transformer de afinidad, XGBoost), cuyas limitaciones y datos de entrenamiento no se detallan.
- Requiere configuracion manual de rutas (`HOME_LOC`, `ENV_LOC`, `base_path`) antes de ejecutar.
- Uso en produccion clinica no validado: los peptidos generados son hipotesis computacionales que requieren validacion experimental.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantia alguna sobre los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/khueminhh/PepTune
- Paper (arXiv): https://arxiv.org/abs/2412.17780
- Paper MDLM (arXiv): https://arxiv.org/abs/2406.07524
- Repositorio MDLM: https://github.com/kuleshov-group/mdlm
- Web del autor Sophia Tang: https://sophtang.github.io/
- LinkedIn de Yinuo Zhang: https://www.linkedin.com/in/yinuozhang98/
- Chatterjee Lab: https://www.chatterjeelab.com/
- Checkpoint PepTune (Google Drive): https://drive.google.com/file/d/1oXGDpKLNF0KX0ZdOcl1NZj5Czk2lSFUn/view?usp=sharing
- Modelo de afinidad de union (Google Drive): https://drive.google.com/file/d/128shlEP_-rYAxPgZRCk_n0HBWVbOYSva/view?usp=sharing
- Dataset de peptidos (Google Drive): https://drive.google.com/file/d/1yCDr641WVjCtECg3nbG0nsMNu8j7d7gp/view?usp=drive_link
