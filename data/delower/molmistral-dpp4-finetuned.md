# Delower/molmistral-dpp4-finetuned

## Resumen

MolMistral DPP-4 Fine-Tuned es un ajuste fino especializado del modelo fundacional MolMistral, un modelo de lenguaje causal entrenado sobre representaciones SMILES de moléculas. Lo desarrolla el autor independiente Delower y está publicado en Hugging Face bajo el identificador `Delower/molmistral-dpp4-finetuned`. El modelo resuelve un problema muy concreto: la generación condicionada de moléculas con actividad inhibitoria potente frente a la dianas DPP-4 (dipeptidil peptidasa-4), una proteína relevante en el tratamiento de la diabetes tipo 2.

La arquitectura es un transformer causal compacto de 12 capas, dimensión oculta 512, 21,8 millones de parámetros y vocabulario de 621 tokens SMILES, con una longitud máxima de secuencia de 128 tokens. La generación condicional se realiza mediante 7 tokens de control de propiedades que se anteponen a la secuencia SMILES: el token `[POTENT]` más bins de peso molecular (MW), logP, donadores de enlace de hidrógeno (HBD), aceptores (HBA), TPSA y enlaces rotables (ROT).

El interés del modelo es doble: por un lado, demuestra un flujo completo de ajuste fino condicionado sobre un modelo fundacional químico de tamaño muy reducido, apto para GPUs de consumo; por otro, introduce una regla de diseño explícita (la "regla de dos pesos") que impide reutilizar estos pesos como base para otras dianas terapéuticas, forzando a partir del modelo fundacional libre de enfermedad en esos casos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) sobre SMILES |
| Parámetros totales | 21,8 M (12 capas, hidden 512) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_len de entrenamiento) |
| Tipos de cuantización | no disponible (pesos en formato Keras 3, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (lenguaje químico SMILES, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.keras` (Keras 3, modelo completo); vocabulario en `vocab.txt` y `tokenizer_config.json` |
| Vocabulario | 621 tokens SMILES |
| Tokens de control | 7 (`[POTENT]`, MW, LOGP, HBD, HBA, TPSA, ROT) |
| Tamaño del repo | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 12 capas y 512 dimensiones ocultas, con 21,8 millones de parámetros y un vocabulario de 621 tokens específico de SMILES. La secuencia de entrenamiento tiene el formato `[BOS] [7 property tokens] SMILES [EOS]`, de modo que el modelo aprende a generar SMILES condicionados por un perfil de propiedades fisicoquímicas y por el token `[POTENT]`. Se aplica condition dropout de 0,15, lo que permite usar el modelo también en modo incondicional.

El ajuste fino se realizó sobre 5.747 compuestos con actividad potente frente a DPP-4 (pIC50 ≥ 7,0), divididos en 5.173 de entrenamiento y 574 de validación. Se excluyeron deliberadamente los compuestos con actividad moderada y las 12 gliptinas aprobadas por agencias reguladoras. El entrenamiento usó batch 128, max_len 128, learning rate 5e-5, techo de 120 épocas, paciencia de 25 y una parada temprana al alcanzar val_loss objetivo de 0,20. Se detuvo en la época 3 con val_loss 0,1973 (perplejidad 1,218).

El modelo fundacional de partida (`Delower/molmistral-foundation-v61`) fue entrenado por el job SPARCq 822 en Cheaha sobre una A100 de 80 GB, con 5.441.246 SMILES descontaminados procedentes de ChEMBL, MOSES, BindingDB, PubChem y ZINC. Los pesos base se verificaron por hash sha256 antes del ajuste fino. El ajuste se ejecutó en una notebook de Kaggle con GPU T4 x2 el 17 de noviembre de 2026.

## Capacidades

- Generación condicionada de SMILES con perfil de propiedades fisicoquímicas especificado (MW, logP, HBD, HBA, TPSA, ROT).
- Generación incondicional de SMILES (modo `--no_condition`), gracias al condition dropout durante el entrenamiento.
- Scoring y evaluación de SMILES mediante loss teacher-forced y perplejidad sobre un CSV de entrada.
- Generación por lotes a distintas temperaturas de muestreo (por defecto T = 0,8, 1,0 y 1,1, con 500 moléculas por brazo).
- Modelado de lenguaje causal sobre secuencias SMILES de hasta 128 tokens.
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso en lenguaje natural: es un modelo de dominio químico, no un asistente general.
- Capacidades multilingües: no aplica (no procesa lenguaje natural).

## Casos de uso

- Generación de candidatos DPP-4 con perfil fisicoquímico controlado: se especifica la condición `POTENT,MW_400_450,LOGP_2_3,HBD_1,HBA_5_6,TPSA_60_90,ROT_4_6` y el modelo genera SMILES que cumplen ese perfil, útil para exploración temprana de espacio químico en programas de descubrimiento frente a DPP-4.
- Enriquecimiento de librerías virtuales: generar lotes de 500 moléculas a varias temperaturas permite producir conjuntos crudos que luego se filtran con RDKit y se puntúan con docking o modelos de actividad, ampliando la diversidad de partida.
- Priorización de compuestos existentes: el script `infer_finetuned.py` calcula loss y perplejidad teacher-forced sobre SMILES propios, lo que sirve como señal de familiaridad del modelo con una molécula y como filtro previo barato antes de simulaciones más costosas.
- Estudio de relación estructura-propiedad en DPP-4: al condicionar por bins de propiedades, se pueden generar moléculas variando un solo eje (por ejemplo, logP) y observar cómo cambia la estructura generada, apoyando análisis de SAR.
- Prototipado en entornos con GPUs de consumo: con 21,8 M de parámetros y 0,6 GB de repo, el modelo se puede ejecutar en una T4 o en GPUs consumer, lo que facilita experimentación docente o pruebas de concepto sin infraestructura dedicada.
- Reproducción metodológica de ajuste fino condicionado: el bundle incluye `train_llm_foundation.py`, scripts de inferencia y generación, historial de pérdidas y tarjetas legibles por máquina, lo que lo convierte en una referencia práctica para montar pipelines similares sobre otros modelos fundacionales químicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento:

| Época | Train loss | Val loss |
|---:|---:|---:|
| 1 | 0,3428 | 0,2412 |
| 2 | 0,2090 | 0,2016 |
| 3 | 0,1841 | 0,1973 (mejor) |

Mejor val_loss: 0,1973167 (perplejidad 1,218) en la época 3.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de pocos cientos de MB para los pesos (21,8 M de parámetros en formato Keras 3), más overhead del runtime de Keras/TensorFlow.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el ajuste fino original se ejecutó en T4 x2 y el modelo fundacional se entrenó en A100 80 GB.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) e incluso en entornos CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Keras 3 con los scripts incluidos (`infer_finetuned.py`, `generate_finetuned.py`). No se publican pesos en GGUF, ONNX ni safetensors, por lo que no hay soporte directo para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos generativos de SMILES condicionados por propiedades) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Los pesos son específicos de DPP-4. La model card impone explícitamente la "regla de dos pesos": nunca usarlos como base para ajuste fino en otra enfermedad o diana; para ello debe partirse de `Delower/molmistral-foundation-v61`.
- El conjunto de ajuste excluye deliberadamente las 12 gliptinas aprobadas y los compuestos con actividad moderada, por lo que el modelo no ha visto el espacio químico regulatorio y puede no representarlo.
- La generación por defecto produce SMILES crudos sin filtrar; la validación con RDKit es una etapa posterior separada y obligatoria antes de cualquier uso real.
- Riesgo de alucinación química: al ser un modelo generativo sobre SMILES, puede producir cadenas sintácticamente inválidas o moléculas no sintetizables; no hay garantía de validez ni de actividad real.
- Sesgos de datos: el modelo hereda los sesgos de composición de ChEMBL, MOSES, BindingDB, PubChem y ZINC, y del subconjunto DPP-4 potente, lo que puede sobrerrepresentar ciertos scaffolds.
- Longitud de contexto limitada a 128 tokens, suficiente para SMILES típicos pero no para moléculas grandes o secuencias compuestas.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Sin métricas de benchmarks publicadas (validez, novedad, diversidad, docking) que permitan evaluar la calidad de la generación más allá de la pérdida de validación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delower/molmistral-dpp4-finetuned
- Modelo fundacional: https://huggingface.co/Delower/molmistral-foundation-v61
- Notebook de ajuste fino: https://www.kaggle.com/code/delower2021/molmistral-finetune-potent
