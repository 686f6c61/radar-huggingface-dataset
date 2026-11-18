# Delower/molmistral-foundation-v61

## Resumen

`Delower/molmistral-foundation-v61` es un modelo fundacional de moléculas pequeñas implementado como un modelo de lenguaje causal sobre cadenas SMILES. Lo publica el usuario Delower en Hugging Face y se distribuye como un *bundle* completo en formato Keras 3 (fichero `model.keras`), no como pesos en safetensors ni GGUF. Su propósito es servir de base para *fine-tuning* en dianas terapéuticas concretas o para el muestreo de SMILES con propiedades drug-like generales.

El modelo se ha preentrenado únicamente con moléculas de carácter general: no ha visto datos de DPP-4 ni dispone de condicionamiento por propiedades en su versión fundacional. El autor indica explícitamente que el bundle está decontaminado frente al conjunto de *fine-tuning* de DPP-4 y frente a los 12 fármacos gliptinas aprobados por la FDA, lo que lo hace adecuado como punto de partida limpio para nuevas dianas.

El repositorio ocupa 0,3 GB e incluye vocabulario de 621 tokens, scripts de inferencia y *fine-tuning*, y artefactos de procedencia (MANIFEST con SHA-256). No se han publicado parámetros totales, longitud de contexto, licencia ni idiomas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Keras 3, KerasNLP) sobre tokens SMILES; detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (definida en `tokenizer_config.json`, valor no publicado) |
| Tipos de cuantizacion | no disponible (pesos en formato Keras nativo; sin GGUF ni safetensors publicados) |
| Idiomas soportados | no aplica (modelo de química; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.keras` (modelo Keras 3 completo), `vocab.txt`, `tokenizer_config.json`, `model_config.json` |

## Arquitectura y entrenamiento

Se trata de un modelo de lenguaje causal construido con Keras 3 y KerasNLP (dependencias declaradas: TensorFlow 2.17.0, Keras 3.5.0, KerasNLP 0.15.1). La entrada es una secuencia de tokens SMILES con un vocabulario de 621 tokens en orden de identificador, y la salida es la distribución sobre el siguiente token, lo que permite tanto la generación de nuevas moléculas como el cálculo de verosimilitud sobre moléculas existentes.

El preentrenamiento se realizó exclusivamente sobre moléculas de carácter general, sin datos de DPP-4 y sin condicionamiento por propiedades. El autor declara que el conjunto de preentrenamiento está decontaminado frente al conjunto de *fine-tuning* de DPP-4 y frente a las 12 gliptinas aprobadas por la FDA. El bundle incluye `history.csv` con las métricas por época (pérdida, exactitud, perplejidad) y `metrics.json` con las métricas de etapa, aunque los valores no se han publicado en la información disponible. El vocabulario incorpora tokens de propiedad (bins de POTENT, MW, LOGP, HBD, HBA, TPSA, ROT) que el modelo fundacional ignora porque nunca los vio durante el preentrenamiento, pero que quedan reservados para los bundles derivados tras *fine-tuning* condicionado.

## Capacidades

- Generación de SMILES de moléculas drug-like mediante muestreo autoregresivo desde el modelo causal.
- Cálculo de verosimilitud y perplejidad sobre moléculas SMILES dadas.
- Punto de partida para *fine-tuning* supervisado en nuevas dianas o enfermedades (script `finetune_from_foundation.py`).
- Reutilización del tokenizador sin cirugía de vocabulario: mismo vocabulario de 621 tokens y mismos tokens de propiedad en los bundles derivados.
- Soporte de condicionamiento por propiedades (POTENT, MW, LOGP, HBD, HBA, TPSA, ROT) únicamente en bundles derivados tras *fine-tuning*; el modelo fundacional no lo aplica.
- No soporta *tool calling*, agentes, visión, audio ni capacidades multilingües de lenguaje natural.

## Casos de uso

- **Fine-tuning en una nueva diana terapéutica**: usar `finetune_from_foundation.py` con un CSV de activos (columnas `smiles`, `pIC50`, `source`) para obtener un bundle especializado, manteniendo el tokenizador intacto y evitando arrastrar el sesgo de DPP-4.
- **Generación de librerías virtuales drug-like**: ejecutar `infer_from_bundle.py --n 1000` para producir 1000 SMILES muestreados y filtrarlos posteriormente con RDKit por reglas de Lipinski o filtros de PAINS.
- **Preentrenamiento base para quimioinformática interna**: partir del bundle como inicialización en lugar de entrenar desde cero, aprovechando que el vocabulario y los scripts de entrenamiento ya están empaquetados.
- **Evaluación de modelos generativos de moléculas**: usar la perplejidad sobre un conjunto de test de moléculas conocidas como métrica de ajuste del modelo a la distribución química.
- **Generación condicionada por propiedades tras fine-tuning**: en un bundle derivado, invocar `--condition POTENT,MW_350_400,LOGP_1_2,HBD_1,HBA_5_6,TPSA_90_120,ROT_4_6` para muestrear moléculas que cumplan rangos concretos de propiedad.
- **Reproducibilidad y auditoría de pipelines**: el `MANIFEST.json` con SHA-256 y tamaño de cada fichero permite verificar la integridad del bundle en entornos de producción o en publicaciones científicas.
- **Estudios de decontaminación**: servir como base limpia frente a DPP-4 y gliptinas para comparar el efecto de la contaminación en modelos especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 0,3 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPU de consumo, pero no se confirma el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamaño del repositorio (0,3 GB), pero no confirmado.
- Opciones de despliegue: el bundle está diseñado para ejecutarse con TensorFlow 2.17.0 + Keras 3.5.0 + KerasNLP 0.15.1 + RDKit + pandas mediante `infer_from_bundle.py`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `Delower/molmistral-foundation-v61` | no disponible | no disponible | no disponible | Keras 3 | Hugging Face, 0 descargas |
| Modelos fundacionales de moléculas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo fundacional **no aplica condicionamiento por propiedades**: los tokens de propiedad existen en el vocabulario pero el modelo nunca los vio durante el preentrenamiento, por lo que las llamadas con `--condition` sobre el bundle fundacional se ignoran.
- El autor advierte explícitamente que solo el bundle fundacional debe usarse como punto de partida para una nueva diana; partir de `finetuned_dpp4` arrastraría sesgo de DPP-4.
- Regla dura del autor: los activos de la nueva diana deben quedar fuera de cualquier dato de preentrenamiento, y los fármacos de referencia o aprobados deben mantenerse en el *split* de entrenamiento para que el modelo los aprenda.
- Licencia no declarada: no se puede confirmar el uso comercial sin consultar al autor.
- Sin información sobre sesgos, tasas de alucinación química (SMILES inválidos) ni cobertura química del preentrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de generación ni de validez de los SMILES producidos.
- Modelo sin descargas ni *likes* en el momento de la consulta: sin validación por parte de la comunidad.
- Dependencia de un *stack* concreto (TensorFlow 2.17.0, Keras 3.5.0, KerasNLP 0.15.1): versiones distintas pueden romper la carga del bundle.
- No es un modelo de lenguaje natural: no procesa texto, no soporta *tool calling* ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Delower/molmistral-foundation-v61
