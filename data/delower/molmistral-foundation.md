# Delower/molmistral-foundation

## Resumen

MolMistral Foundation es un modelo de lenguaje de dominio especifico para quimica, concretamente para la generacion y modelado de cadenas SMILES (representaciones lineales de moleculas). Lo desarrolla el usuario Delower y se distribuye bajo licencia MIT a traves de Hugging Face. Se trata de un checkpoint de pesos preentrenados, agnosticos a enfermedad, pensados como punto de partida para fine-tuning en tareas de descubrimiento de farmacos.

El modelo sigue una arquitectura tipo Mistral adaptada a un tamano muy reducido: 12 capas, 12 cabezas de consulta y una unica cabeza KV (atencion con grouped-query attention), dimension oculta de 512 y dimension intermedia de 768, con un total de 21.831.680 parametros. Emplea el vocabulario SMILES de DeepChem 2.4.0 (621 tokens) y fue preentrenado sobre una mezcla de aproximadamente 3,83 millones de moleculas procedente de MOSES, ChEMBL, ZINC y PubChem, decontaminada contra el conjunto de fine-tuning de DPP-4.

Su relevancia es doble. Por un lado, demuestra un enfoque de modelo fundacional quimico de bajo coste computacional. Por otro, su model card documenta de forma inusualmente transparente un defecto grave: el checkpoint original contenia valores NaN en la fila de embedding del token `[C@H]`, lo que envenenaba el fine-tuning. La version publicada ha sido reparada y verificada, pero solo vio aproximadamente una epoca limpia de las diez previstas antes de que el job fallara, por lo que su calidad final esta sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mistral (12 capas, 12 query heads, 1 KV head, GQA) |
| Parametros totales | 21.831.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio: SMILES) |
| Licencia | MIT |
| Formato de pesos | Keras (`best_foundation.keras`) |
| Dimension oculta | 512 |
| Dimension intermedia | 768 |
| Vocabulario | 621 tokens (DeepChem 2.4.0 SMILES) |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Mistral, con atencion de tipo grouped-query (12 cabezas de consulta frente a una sola cabeza KV), 12 capas, dimension oculta de 512 y dimension intermedia de 768. El modelo opera sobre un vocabulario SMILES de 621 tokens definido por DeepChem 2.4.0, lo que lo especializa en la sintaxis de representaciones moleculares lineales en lugar de lenguaje natural.

El preentrenamiento se realizo sobre una mezcla de aproximadamente 3,83 millones de moleculas combinando MOSES, ChEMBL, ZINC y PubChem, con decontaminacion contra el conjunto de fine-tuning de DPP-4 para evitar fuga de datos. Segun la model card, el job de entrenamiento (SPARCq job 794) fallo con perdidas NaN tras aproximadamente una epoca limpia de las diez planificadas. El checkpoint de mejor validacion (pretrain val_loss 0,2959) presentaba exactamente 2 valores NaN de 21.831.680 pesos, ambos en la fila de embedding del token `[C@H]` (fila 33, columnas 357 y 415), mas 12 valores NaN/±Inf en los buffers de estado del optimizador AdamW en las mismas coordenadas. La reparacion consistio en copiar los valores de las mismas columnas desde la fila del token estereoisomero `[C@@H]` (fila 35). El fichero reparado se reescrutino completo (152.821.762 valores) sin valores no finitos y reproduce la perdida de validacion original (0,272177 frente a 0,272176 sobre 256 filas). No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de cadenas SMILES: modelado de lenguaje autoregresivo sobre el vocabulario quimico de DeepChem.
- Modelado de moleculas: representacion y generacion de estructuras moleculares en notacion lineal.
- Punto de partida para fine-tuning: disenado explicitamente como base agnostica a enfermedad para adaptar a nuevas dianas terapeuticas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el dominio es exclusivamente SMILES.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Fine-tuning para una diana terapeutica concreta: partir de `best_foundation.keras` y adaptar el modelo a la generacion de moleculas candidatas para una proteina o enfermedad especifica, aprovechando que los pesos son agnosticos a enfermedad y estan decontaminados contra DPP-4.
- Generacion de librerias de moleculas sinteticas: muestrear SMILES validos para ampliar el espacio quimico explorado en cribados virtuales, dado el vocabulario SMILES nativo del modelo.
- Modelado de lenguaje quimico auxiliar: usar el modelo como componente de scoring o de representacion en pipelines de descubrimiento de farmacos de bajo coste computacional.
- Prototipado e investigacion academica: con 21,8 millones de parametros y formato Keras, es viable experimentar en un solo equipo sin infraestructura GPU de gran escala, lo que facilita la investigacion reproducible.
- Filtrado y priorizacion de candidatos: emplear la probabilidad asignada a secuencias SMILES como senal para ordenar moleculas generadas por otras herramientas.
- Educacion y demostraciones de modelos fundacionales quimicos: el modelo card documenta con detalle el proceso de entrenamiento, el defecto detectado y la reparacion, lo que lo convierte en un caso de estudio util sobre control de calidad de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la perdida de validacion de preentrenamiento: pretrain val_loss 0,2959 en el checkpoint original y 0,272177 en la evaluacion de reproduccion post-reparacion sobre 256 filas.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 611.953.638 bytes (aproximadamente 0,6 GB), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU moderna (RTX 3060 en adelante) es suficiente. Para fine-tuning, una RTX 3090 o 4090 ofrece margen comodo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual.
- Opciones de despliegue: el formato es Keras (`.keras`), por lo que el despliegue natural es mediante TensorFlow/Keras. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos fundacionales SMILES de tamano similar) con datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Calidad sin verificar: el modelo solo completo aproximadamente una epoca limpia de las diez planificadas antes de que el job fallara; la model card advierte explicitamente que su calidad esta pendiente de una prueba de fine-tuning.
- Defecto historico reparado: el checkpoint original contenia valores NaN en la fila de embedding de `[C@H]`, token presente en el 41 % de las secuencias tipicas de fine-tuning. La version publicada esta reparada y verificada, pero conviene auditar cualquier derivado.
- No usar checkpoints de fine-tuning DPP-4 como base: la model card indica que solo `best_foundation.keras` sirve como punto de partida; los checkpoints ajustados a DPP-4 son especificos de esa diana.
- Riesgo de alucinacion quimica: como modelo generativo de SMILES, puede producir cadenas sintacticamente validas pero quimicamente invalidas o no sintetizables; se requiere validacion con herramientas quimicas (RDKit u otras).
- Sesgos de datos: el modelo hereda los sesgos de composicion de MOSES, ChEMBL, ZINC y PubChem, que no representan uniformemente el espacio quimico.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el modelo no maneja lenguaje natural ni otros idiomas fuera de SMILES.
- Licencia MIT: permite uso comercial, pero no se ofrece ninguna garantia sobre el rendimiento ni sobre la idoneidad de las moleculas generadas.
- Formato Keras: requiere el ecosistema TensorFlow/Keras; no hay pesos en safetensors ni GGUF, lo que limita la integracion con herramientas de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delower/molmistral-foundation
- Ficheros de referencia citados en la model card: `REPAIR_NOTES.md`, `gate_scan.json`, `repaired_gate_scan.json` (disponibles en el repositorio del modelo)
- DeepChem (vocabulario SMILES): https://deepchem.io
- MOSES (dataset): https://github.com/molecularsets/moses
- ChEMBL: https://www.ebi.ac.uk/chembl/
- ZINC: https://zinc.docking.org
- PubChem: https://pubchem.ncbi.nlm.nih.gov
