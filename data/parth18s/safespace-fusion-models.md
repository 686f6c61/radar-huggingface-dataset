# parth18s/safespace-fusion-models

## Resumen

SafeSpace Fusion Models es un conjunto de pesos entrenados para SafeSpace, un prototipo de investigación desarrollado por parth18s (repositorio en GitHub bajo el usuario parthsharma1899) que estima el nivel de estrés de una persona a partir de señales de muñeca (BVP, EDA y movimiento), texto, voz y una fotografía facial, fusionando las modalidades a lo largo del tiempo en una única puntuación. No se trata de un modelo generativo ni de un LLM, sino de una colección de clasificadores especializados por modalidad más una capa de calibración y fusión temporal.

El repositorio de Hugging Face contiene los artefactos de inferencia organizados según la carpeta `artifacts/` del código: un modelo XGBoost para señales fisiológicas, un BERT fine-tuneado para texto, una CNN sobre MFCC para voz y extractores de características congelados (ResNet50 y ViT) más una capa ELM para rostro. El tamaño total del repositorio es de 4.0 GB, aunque la descarga efectiva de los cuatro modelos que usa la aplicación ronda los 1.5 GB según la model card.

Su relevancia es acotada y explícitamente investigadora: el autor declara que es un prototipo de investigación, no una herramienta diagnóstica, y que la expresión facial y el habla actuada son proxies de estrés, no estrés en sí mismo. La licencia es mixta y hereda las condiciones de los datasets de entrenamiento, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble multimodal: XGBoost (muñeca), BERT fine-tuneado (texto), CNN sobre MFCC (voz), ResNet50/ViT congelados + capa ELM (rostro), con calibración Platt y fusión temporal |
| Parametros totales | no disponible (no se publica el recuento agregado; el repo ocupa 4.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el clasificador de texto se basa en BERT, sin contexto declarado en la información) |
| Tipos de cuantizacion | no disponible (el único dato es el almacenamiento de la matriz W del ELM en float16, que reduce de 2.45 GB a 0.61 GB) |
| Idiomas soportados | no disponible (el componente de texto se entrenó sobre Dreaddit, contenido de Reddit en inglés) |
| Licencia | other / mixed-dataset-terms; uso no comercial, solo investigación y uso personal |
| Formato de pesos | JSON (XGBoost), SavedModel de TensorFlow/Keras (BERT, CNN, ResNet50, ViT), `.npz` (ELM), `.keras`, `.json` de calibración |

## Arquitectura y entrenamiento

El sistema no es un transformer único sino una fusión tardía de cuatro pipelines independientes. La rama de muñeca usa XGBoost sobre características de BVP, EDA y movimiento relativas a una línea base, entrenado con WESAD en validación leave-one-subject-out con AUC 0.95. La rama de texto es un clasificador BERT fine-tuneado sobre Dreaddit. La rama de voz es una CNN sobre características MFCC entrenada con RAVDESS. La rama de rostro combina extractores de características congelados (ResNet50 y ViT en TensorFlow SavedModel) con una capa oculta ELM almacenada en `.npz` y una capa de salida ELM reajustada sobre FER-2013, con AUC de test de 0.70.

La innovación técnica destacable es la capa de calibración y fusión: `calibration.json` guarda los parámetros de calibración Platt (a, b) por modelo y la puntuación media de cada modelo en ejemplos de calma, que se usa como línea base inicial para una persona nueva. La matriz W del ELM se almacena en float16 (0.61 GB frente a 2.45 GB) con una desviación en las puntuaciones de 0.0002 respecto al original. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada de los datasets ni el uso de RLHF o DPO, que no aplican a este tipo de clasificadores.

## Capacidades

- Estimación de estrés a partir de señales fisiológicas de muñeca (BVP, EDA, movimiento) mediante un clasificador XGBoost con AUC 0.95 en validación leave-one-subject-out sobre WESAD.
- Clasificación de estrés en texto mediante un BERT fine-tuneado sobre Dreaddit.
- Clasificación de emoción/estrés en voz a partir de MFCC con una CNN entrenada sobre RAVDESS (habla actuada).
- Extracción de características faciales con ResNet50 y ViT congelados y puntuación mediante capa ELM reajustada sobre FER-2013.
- Fusión multimodal temporal de las cuatro señales en una única puntuación de estrés.
- Calibración por modelo (Platt) y establecimiento de una línea base personal a partir de ejemplos de calma.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje generativo.
- No se declaran capacidades multilingües; el componente de texto se entrena sobre contenido en inglés.

## Casos de uso

- Investigación académica en detección multimodal de estrés: el conjunto permite reproducir el prototipo SafeSpace y comparar la contribución de cada modalidad (fisiológica, texto, voz, rostro) sobre una misma línea de fusión calibrada.
- Estudio de fusión tardía y calibración por sujeto: `calibration.json` facilita experimentar con líneas base personalizadas y parámetros Platt en lugar de reentrenar cada clasificador.
- Evaluación de proxies faciales y vocales: útil para medir hasta qué punto la expresión facial (FER-2013) y el habla actuada (RAVDESS) correlacionan con estrés autoinformado, dado que el autor advierte que son proxies.
- Docencia y prácticas de machine learning multimodal: el repositorio ofrece un pipeline completo con scripts de descarga, verificación por SHA-256 y manifiesto de modelos, adecuado para cursos de posgrado.
- Prototipado de aplicaciones de bienestar no clínicas en entorno controlado: integración de los cuatro clasificadores en una app local para explorar la evolución temporal de la puntuación fusionada.
- Reproducibilidad y auditoría de artefactos: los hashes y tamaños de `scripts/model_manifest.json` permiten verificar la integridad de los pesos en entornos de investigación.

## Benchmarks y rendimiento

| Componente | Dataset | Metrica | Resultado |
|---|---|---|---|
| Muñeca (XGBoost) | WESAD | AUC, leave-one-subject-out | 0.95 |
| Rostro (ELM reajustado) | FER-2013 | AUC de test | 0.70 |
| Texto (BERT) | Dreaddit | no disponible | no disponible |
| Voz (CNN MFCC) | RAVDESS | no disponible | no disponible |

No se han publicado resultados de benchmarks comparativos con otros sistemas de detección de estrés en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; la descarga completa de los cuatro modelos ronda 1.5 GB y el repositorio completo ocupa 4.0 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o menos, e incluso en CPU para las ramas XGBoost y ELM.
- GPU recomendadas: no se especifican; por los tamaños implicados, cualquier GPU con soporte CUDA y al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente. Las ramas TensorFlow SavedModel (ResNet50, ViT, BERT) se benefician de GPU, pero no la requieren.
- Cabe en GPU de consumo: sí, con margen amplio; también en CPU para las ramas ligeras.
- Opciones de despliegue: TensorFlow/Keras y XGBoost nativos; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos. La aplicación se ejecuta localmente siguiendo el README del repositorio de código.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modalidades | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SafeSpace Fusion Models | Ensemble clásico + DL | Muñeca, texto, voz, rostro | AUC 0.95 (WESAD), AUC 0.70 (FER-2013) | Mixta, solo investigación | Hugging Face, descarga sin cuenta |
| WESAD baselines (Schmidt et al., 2018) | Clasificadores sobre WESAD | Muñeca | Métricas en el paper original | Dataset de investigación | Paper y dataset |
| Dreaddit baselines (Turcan & McKeown, 2019) | Clasificadores de texto | Texto | Métricas en el paper original | Sin licencia declarada | Paper y dataset |
| RAVDESS baselines (Livingstone & Russo, 2018) | Clasificadores de voz | Voz | Métricas en el paper original | CC BY-NC-SA 4.0 | Dataset público |

No se dispone de comparaciones directas publicadas entre SafeSpace y otros sistemas de fusión multimodal de estrés en la información proporcionada.

## Limitaciones y advertencias

- Herramienta de investigación, no diagnóstica: el autor lo declara explícitamente; no debe usarse para decisiones clínicas ni de salud.
- Proxies de estrés: la expresión facial y el habla actuada no equivalen a estrés real; los resultados faciales y vocales deben interpretarse con cautela.
- Licencia restrictiva: uso no comercial, solo investigación y personal; RAVDESS es CC BY-NC-SA 4.0 (no comercial, atribución, compartir igual), lo que bloquea el uso comercial.
- Datasets con términos heterogéneos: WESAD no otorga términos de redistribución explícitos y recomienda contactar con los autores antes de publicar pesos; Dreaddit no declara licencia y aplica los términos de Reddit; FER-2013 no tiene licencia clara y se rige por las reglas de la competición de Kaggle.
- ViT con pesos no entrenados: la model card advierte que el ViT contiene pesos sin entrenar, por lo que su rama no aporta señal útil tal cual.
- Sesgos y generalización: los clasificadores se entrenaron sobre datasets pequeños y controlados (WESAD, RAVDESS, FER-2013, Dreaddit), con poblaciones y condiciones limitadas; la transferencia a otros dominios no está validada.
- Idioma: el componente de texto se entrena sobre contenido en inglés; no se declaran idiomas adicionales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos en la clasificación de estrés.
- Adopción mínima: 2 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en Hugging Face, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/parth18s/safespace-fusion-models
- Repositorio de código SafeSpace: https://github.com/parthsharma1899/SafeSpace
- Paper WESAD (Schmidt et al., 2018): no disponible en la información proporcionada
- Paper Dreaddit (Turcan & McKeown, 2019): no disponible en la información proporcionada
- Paper RAVDESS (Livingstone & Russo, 2018): no disponible en la información proporcionada
- Dataset FER-2013 (Kaggle): no disponible en la información proporcionada
