# Codemaster67/Olmo_10M_tok_pubchem_fineweb

## Resumen

`Codemaster67/Olmo_10M_tok_pubchem_fineweb` es un adaptador QLoRA (Quantized Low-Rank Adaptation) publicado por el usuario Codemaster67 sobre el modelo base `allenai/OLMo-1B-hf` de Ai2. El adaptador se ha entrenado para modelado de lenguaje del dominio quimico, concretamente para generar y completar cadenas SMILES (Simplified Molecular-Input Line-Entry System), a partir del dataset `Codemaster67/pubchem-smiles-fineweb-10M`. No es un modelo completo: es un conjunto de matrices LoRA que debe cargarse sobre el checkpoint base en precision 4-bit.

El modelo base OLMo-1B es un transformer causal decoder-only de aproximadamente 1.000 millones de parametros, publicado por el Allen Institute for AI (Ai2) bajo licencia Apache 2.0, con tokenizador e implementacion totalmente abiertos. Sobre el se ha aplicado entrenamiento continuado de tipo CPT (continued pre-training) en 4-bit NF4 con adaptadores LoRA de rango 64, enmascarando el `embed_tokens` y el `lm_head` como modulos a guardar porque el tokenizador del modelo base se extendio con unos 300 tokens de quimica SPE (SMILES Pair Encoding) mas los tokens especiales `<|start_of_smiles|>` y `<|end_of_smiles|>`.

Es relevante para desarrolladores que trabajan en quimioinformatica y descubrimiento de farmacos porque ofrece una via ligera (el repositorio ocupa solo 0,2 GB) de adaptar un modelo abierto a la generacion de moleculas representadas como SMILES, sin necesidad de reentrenar desde cero ni de disponer de hardware de gran escala. La ficha incluye advertencias claras: la model card se titula de forma inconsistente como "OLMo-7B" cuando el modelo base real es OLMo-1B, no se uso conjunto de validacion y no hay metricas held-out publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (base OLMo-1B) con adaptadores LoRA inyectados en todas las capas lineales |
| Parametros totales | Modelo base OLMo-1B, aproximadamente 1.000 millones de parametros; el adaptador LoRA anade un numero no especificado de parametros entrenables (r=64, alpha=128, all-linear) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens durante el entrenamiento del adaptador (max sequence length documentado); la ventana de contexto nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | Base en NF4 4-bit con double quantization (bitsandbytes); adaptadores entrenados en bfloat16; inferencia mediante carga 4-bit + PEFT |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `allenai/OLMo-1B-hf`, un transformer causal autorregresivo con atencion estandar y sin mecanismos de decodificacion especulativa documentados en esta ficha. El entrenamiento es un CPT (continued pre-training) con QLoRA: el modelo base se carga en 4-bit NF4 con double quantization y se entrenan matrices LoRA en bfloat16 sobre todos los modulos lineales (`all-linear`), con rango 64, alpha 128, escalado efectivo 2,0, dropout 0,01 y RSLoRA (rank-stabilized LoRA) activado. Los modulos `embed_tokens` y `lm_head` se guardan como copias completas entrenables via `modules_to_save`, ya que fueron redimensionados al extender el tokenizador con aproximadamente 300 tokens SPE y los tokens especiales `<|start_of_smiles|>` y `<|end_of_smiles|>`.

Los datos de entrenamiento provienen del dataset `Codemaster67/pubchem-smiles-fineweb-10M`, que combina SMILES de PubChem con texto de FineWeb segun el nombre del dataset (la composicion exacta no se detalla en la informacion disponible). Se realizo una sola epoca sobre el dataset completo (train + test fusionados, sin split de validacion), generando 19.874 secuencias empaquetadas de 512 tokens. La configuracion es AdamW de 8-bit, learning rate 3e-5, batch efectivo 32 (batch 32 por dispositivo x acumulacion 1), scheduler coseno con warmup ratio 0,1 y weight decay 0,01, con gradient checkpointing activado. La perdida final de entrenamiento fue 1,3115, aunque al no existir validacion no hay metricas held-out ni pruebas de generalizacion.

## Capacidades

- Generacion y completado de cadenas SMILES del dominio quimico, incluyendo el uso de delimitadores `
