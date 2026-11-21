# GauravPatil2515/medguard-admet-neurosymbolic

## Resumen

MedGuard-AI es un conjunto de modelos de aprendizaje automático y profundo para la predicción de propiedades ADMET (absorción, distribución, metabolismo, excreción y toxicidad) a partir de estructuras moleculares codificadas como cadenas SMILES. Lo desarrolla GauravPatil2515 como componente del proyecto abierto MedGuard-AI / SAFE CAP⁺, una plataforma de seguridad clínica de medicamentos. El repositorio agrupa cinco predictores especializados: bloqueo del canal cardíaco hERG, panel de toxicidad Tox21 de 12 vías, fallo en ensayos clínicos FDA (ClinTox), permeabilidad de la barrera hematoencefálica (BBBP) y aclaramiento metabólico hepático.

No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un conjunto de clasificadores y regresores moleculares: un Random Forest sobre fingerprints ECFP4 para hERG y varias redes neuronales de grafos (GSATGINE de doble flujo y Attention GIN de 5 capas) para el resto de endpoints. El repositorio ocupa 0,1 GB y se distribuye bajo licencia MIT, lo que permite uso comercial y modificación.

Su relevancia radica en el cribado temprano in silico de cardiotoxicidad y fallos toxicológicos, un cuello de botella clásico en el descubrimiento de fármacos, donde la retirada tardía por toxicidad es extremadamente costosa. La información disponible es limitada: no hay model card detallada con hiperparámetros, datos de entrenamiento ni resultados completos de benchmarks más allá del endpoint hERG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (hERG); GSATGINE de doble flujo (Tox21, ClinTox); Attention GIN de 5 capas (BBBP, aclaramiento) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo molecular, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos PyTorch; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El conjunto combina enfoques simbólicos y conexionistas. Para hERG se emplea un Random Forest con 300 árboles sobre fingerprints ECFP4 de 2048 bits (radio 2), un descriptor clásico de quimioinformática. Para Tox21 y ClinTox se usa GSATGINE de doble flujo, que procesa en paralelo el grafo molecular y los fingerprints de Morgan; Tox21 se formula como clasificación multi-tarea con pérdida BCE y ClinTox como tarea dual (FDA y toxicidad). Para BBBP y aclaramiento metabólico se emplean Attention GIN de 5 capas que operan directamente sobre el grafo molecular, con clasificación binaria en BBBP y regresión continua en el aclaramiento.

Los datos de entrenamiento provienen de ChEMBL, del Therapeutics Data Commons (TDC), del desafío Tox21 de NIH/NCATS y de MoleculeNet (ClinTox, BBBP). No se documentan el número de tokens, la composición exacta del dataset, el proceso de validación ni si hubo ajuste fino con RLHF/DPO (no aplicable en este dominio). La innovación destacable es el enfoque neuro-simbólico que combina representaciones aprendidas (grafos) con descriptores químicos interpretables (fingerprints), aunque la información pública no detalla la fusión exacta de ambas corrientes.

## Capacidades

- Predicción de bloqueo del canal hERG y riesgo de prolongación del intervalo QT a partir de SMILES.
- Evaluación multi-tarea de 12 vías de toxicidad celular y endocrina (panel Tox21).
- Predicción de fallo toxicológico en ensayos clínicos FDA (ClinTox).
- Clasificación de permeabilidad de la barrera hematoencefálica (BBBP) para penetración en el sistema nervioso central.
- Regresión del aclaramiento metabólico hepático.
- Procesamiento directo de estructuras químicas sin necesidad de precalcular descriptores externos en los modelos de grafos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- Capacidades multilingües no aplicables; el dominio es químico, no lingüístico.

## Casos de uso

- Cribado temprano de cardiotoxicidad en pipelines de descubrimiento: el Random Forest sobre ECFP4 permite filtrar grandes bibliotecas de compuestos antes de ensayos in vitro, descartando candidatos con alta probabilidad de bloqueo hERG y reduciendo costes de validación experimental.
- Priorización de compuestos en química medicinal: los modelos de grafos evalúan simultáneamente toxicidad (Tox21) y fallo clínico (ClinTox), lo que permite ordenar series de análogos por perfil de seguridad antes de sintetizar derivados.
- Diseño de fármacos para el sistema nervioso central: el clasificador BBBP estima la penetración de la barrera hematoencefálica, útil para seleccionar candidatos con acceso al cerebro en programas de neurología o psiquiatría.
- Optimización de propiedades farmacocinéticas: el regresor de aclaramiento metabólico permite estimar la vida media y ajustar dosis en fases preclínicas, integrable en bucles de diseño molecular iterativo.
- Evaluación de seguridad de fármacos ya comercializados: la plataforma SAFE CAP⁺ puede usar estos modelos para señalar riesgos toxicológicos en revisiones de farmacovigilancia o en el análisis de interacciones.
- Investigación académica en quimioinformática: al ser MIT y PyTorch, sirve como línea base reproducible para comparar arquitecturas GNN en tareas ADMET y para estudios de reproducibilidad en benchmarks MoleculeNet y TDC.
- Integración en herramientas de salud clínica: el conjunto puede incorporarse como módulo de apoyo a la decisión en plataformas de seguridad de medicamentos, siempre con validación externa y supervisión profesional.

## Benchmarks y rendimiento

| Endpoint | Arquitectura | Dataset / benchmark | Métrica | Resultado |
|---|---|---|---|---|
| hERG cardiotoxicidad | Random Forest (300 árboles) | ChEMBL / TDC (≤10 µM) | ROC-AUC | 0,8627 |
| hERG cardiotoxicidad | Random Forest (300 árboles) | ChEMBL / TDC (≤10 µM) | Exactitud | 79,5 % |
| Tox21 (12 vías) | GSATGINE de doble flujo | NIH/NCATS Tox21 | BCE multi-tarea | no disponible (sin cifra publicada) |
| ClinTox | GSATGINE de doble flujo | MoleculeNet ClinTox | Tarea dual | no disponible (sin cifra publicada) |
| BBBP | Attention GIN de 5 capas | MoleculeNet BBBP | Clasificación binaria | no disponible (sin cifra publicada) |
| Aclaramiento metabólico | Attention GIN de 5 capas | TDC Clearance | Regresión continua | no disponible (sin cifra publicada) |

Solo se ha publicado el ROC-AUC y la exactitud del endpoint hERG; el resto de métricas no están documentadas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los modelos de grafos y el Random Forest son ligeros y caben en cualquier GPU consumer con 4-8 GB, e incluso pueden ejecutarse en CPU.
- GPU recomendadas: no se requiere hardware especializado; una RTX 3060 o superior es más que suficiente para lotes grandes. Para entrenamiento, una RTX 4090 o A100 acelera la experimentación, aunque no es imprescindible.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1660, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes moderados.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime; el Random Forest puede exportarse a scikit-learn o ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza de los modelos, se espera latencia de milisegundos por molécula en GPU y de decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Endpoints | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGuard-AI (este) | RF + GNN neuro-simbólico | hERG, Tox21, ClinTox, BBBP, aclaramiento | SMILES | MIT | Hugging Face, 0 descargas |
| ADMET-AI (Swanson et al.) | GNN + ensemble | Amplio conjunto ADMET/Tox21 | SMILES | MIT | Código abierto, ampliamente usado |
| Chemprop | D-MPNN | Propiedades moleculares generales | SMILES / grafos | MIT | Código abierto, muy extendido |
| DeepTox | Ensemble de modelos | Tox21 (12 vías) | Descriptores químicos | no disponible | Referencia del desafío Tox21 |

La comparativa es cualitativa: no hay datos de benchmarks comunes publicados en la información disponible para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Solo se ha publicado el rendimiento del endpoint hERG; el resto de modelos carece de métricas verificables, lo que impide evaluar su fiabilidad.
- Ausencia de documentación sobre el conjunto de entrenamiento, la validación y el ajuste de hiperparámetros; riesgo de sobreajuste o de fuga de datos no descartable.
- Sesgos potenciales derivados de ChEMBL y MoleculeNet: sobrerrepresentación de ciertas clases químicas y sesgo hacia fármacos ya estudiados.
- Riesgo de falsos negativos en toxicidad: un modelo con ROC-AUC de 0,86 en hERG deja margen de error significativo para uso clínico.
- No es un modelo generativo: no puede explicar sus predicciones en lenguaje natural ni razonar sobre mecanismos; la interpretabilidad depende de los descriptores.
- Dominio limitado a inglés y a química orgánica de fármacos pequeños; no cubre biologics, péptidos grandes ni formulaciones.
- Licencia MIT permite uso comercial, pero la ausencia de garantías y de validación regulatoria hace inadecuado su uso como única fuente en decisiones clínicas.
- Repositorio con 0 descargas y 0 likes: sin comunidad que valide su reproducibilidad ni informes de errores.
- No se documentan limitaciones de contexto (no aplica) ni de idioma más allá del inglés.

## Enlaces

- Hugging Face: https://huggingface.co/GauravPatil2515/medguard-admet-neurosymbolic
- Therapeutics Data Commons (TDC): https://tdcommons.ai
- MoleculeNet: https://moleculenet.org
- Desafío Tox21 (NIH/NCATS): https://tripod.nih.gov/tox21/challenge/
- ChEMBL: https://www.ebi.ac.uk/chembl/
- Repositorio Chemprop: https://github.com/chemprop/chemprop
- ADMET-AI: https://github.com/swansonk14/admet_ai
