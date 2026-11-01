# introvoyz045/MoLFormer-XL-both-10pct

## Resumen

MoLFormer-XL-both-10pct es un modelo de lenguaje químico basado en transformer con atención lineal y embeddings rotatorios, preentrenado mediante masked language modeling sobre representaciones SMILES de moléculas pequenas. Lo desarrolla originalmente IBM Research (Ross et al.) y esta replicado en el repositorio `introvoyz045/MoLFormer-XL-both-10pct`. La variante aqui descrita se entrena con el 10 % de ZINC15 y el 10 % de PubChem, y cuenta con 46.805.760 parametros en formato safetensors.

El modelo no es un generador de texto ni un asistente conversacional: es un encoder quimico disenado para extraer representaciones densas de moleculas y para ser afinado en tareas de prediccion de propiedades moleculares (solubilidad, toxicidad, permeabilidad, etc.). Su relevancia actual reside en que ofrece una alternativa ligera (0,2 GB de repo) y de licencia Apache 2.0 para pipelines de quimioinformatica que necesitan embeddings de alta calidad sin depender de modelos propietarios.

La arquitectura combina atención lineal con embeddings posicionales relativos para procesar secuencias SMILES de hasta 202 tokens, lo que permite manejar moleculas de hasta aproximadamente 200 atomos. El modelo se distribuye como feature extractor y como base para fine-tuning, no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con atención lineal y embeddings rotatorios/relativos |
| Parametros totales | 46.805.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 202 tokens (moleculas mas largas descartadas en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada SMILES, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MoLFormer es un transformer encoder disenado especificamente para secuencias SMILES. Sustituye la atención cuadratica estandar por un mecanismo de atención lineal, lo que reduce el coste computacional y de memoria al procesar secuencias largas de tokens quimicos. Incorpora embeddings posicionales relativos (rotary embeddings) para capturar la estructura secuencial del SMILES. El objetivo de preentrenamiento es masked language modeling (fill-mask), y el modelo se entrena de forma auto-supervisada sin etiquetas.

La variante `both-10pct` se entrena sobre el 10 % de ZINC15 y el 10 % de PubChem. Las moleculas se canonicalizan con RDKit antes del entrenamiento y se elimina la informacion isomerica; ademas, se descartan las moleculas de mas de 202 tokens. El entrenamiento se realizo en 16 GPUs NVIDIA V100. No se reporta en la informacion disponible el numero exacto de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables a un encoder de este tipo).

## Capacidades

- Extraccion de features: genera embeddings densos (`pooler_output`) para moleculas representadas como SMILES.
- Masked language modeling: prediccion de tokens SMILES enmascarados.
- Fine-tuning para clasificacion y regresion de propiedades moleculares (solubilidad, toxicidad, permeabilidad, etc.).
- Medicion de similitud molecular y visualizacion mediante embeddings congelados.
- Analisis de correspondencia entre distancia interatomica y valores de atención.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta generacion de moleculas.
- No dispone de capacidades multilingues en lenguaje natural (su entrada es SMILES).

## Casos de uso

- Prediccion de solubilidad acuosa (ESOL/FreeSolv): se afina el encoder sobre un dataset etiquetado de solubilidad y se usa para estimar la solubilidad de candidatos en etapas tempranas de descubrimiento de farmacos.
- Filtrado de toxicidad (Tox21, ClinTox): se entrena una cabeza de clasificacion sobre los embeddings para descartar compuestos con alta probabilidad de toxicidad antes de sintesis.
- Prediccion de permeabilidad de barrera hematoencefalica (BBBP): se usa como extractor de features y se afina para priorizar moleculas con potencial de accion central.
- Busqueda de similitud molecular: se calculan embeddings de una libreria de compuestos y se buscan vecinos cercanos para agrupar quimiotipos o detectar duplicados estructurales.
- Modelado de propiedades cuanticas (QM9/QM8): se afina el modelo para predecir propiedades electronicas y termodinamicas de moleculas pequenas.
- Feature engineering en pipelines de QSAR: se sustituyen descriptores manuales por embeddings aprendidos para modelos de regresion/clasificacion aguas abajo.
- Analisis de atención para interpretabilidad: se estudian los pesos de atención para correlacionarlos con distancias interatomicas y validar que el modelo captura estructura 3D.

## Benchmarks y rendimiento

Resultados reportados en la model card para la variante 10 % ZINC + 10 % PubChem, comparados con otras variantes de MoLFormer. Clasificacion en AUROC; QM9/QM8 en MAE medio; ESOL, FreeSolv y Lipophilicity en RMSE.

| Tarea | 10% ZINC + 10% PubChem | 100% ZINC | MoLFormer-Base | MoLFormer-XL |
|---|---|---|---|---|
| BBBP | 91.5 | 89.9 | 90.9 | 93.7 |
| HIV | 81.3 | 78.4 | 77.7 | 82.2 |
| BACE | 86.6 | 87.7 | 82.8 | 88.2 |
| SIDER | 68.9 | 66.8 | 64.8 | 69.0 |
| ClinTox | 94.6 | 82.2 | 61.3 | 94.8 |
| Tox21 | 84.5 | 83.2 | 43.1 | 84.7 |
| QM9 | 1.7754 | 1.9403 | 2.2500 | 1.5984 |
| QM8 | 0.0108 | 0.0124 | 0.0111 | 0.0102 |
| ESOL | 0.3295 | 0.3023 | 0.2798 | 0.2787 |
| FreeSolv | 0.2221 | 0.2981 | 0.2596 | 0.2308 |
| Lipophilicity | 0.5472 | 0.5440 | 0.6492 | 0.5298 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (46,8 M de parametros, ~187 MB de pesos); en FP16 aproximadamente 94 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama (el modelo requiere codigo custom y no es un modelo generativo compatible con esos runtimes).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo se espera throughput alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MoLFormer-XL-both-10pct | 46,8 M | 202 tokens | Apache 2.0 | Encoder SMILES, atención lineal |
| MoLFormer-Base | no disponible | 202 tokens | Apache 2.0 | Encoder SMILES, version base |
| MoLFormer-XL (100% datos) | no disponible | 202 tokens | Apache 2.0 | Encoder SMILES, version completa |
| ChemBERTa | no disponible | no disponible | no disponible | Encoder SMILES basado en RoBERTa |

Los datos de rendimiento comparativo entre MoLFormer y ChemBERTa no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para generar moleculas.
- No probado con moleculas de mas de ~200 atomos (macromoleculas); el limite de 202 tokens restringe su uso a moleculas pequenas.
- SMILES invalidos o no canonicos pueden degradar el rendimiento; se recomienda canonicalizar con RDKit.
- La informacion isomerica se elimino durante el entrenamiento, por lo que el modelo no distingue isomeros.
- Riesgo de alucinacion no aplica en el sentido generativo, pero las predicciones aguas abajo pueden ser erroneas si el dominio quimico difiere del de entrenamiento (ZINC15/PubChem).
- La variante aqui descrita usa solo el 10 % de los datos, por lo que su rendimiento es inferior al MoLFormer-XL completo en varias tareas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento (ZINC15 y PubChem) para cumplimiento.
- Requiere `trust_remote_code=True` y codigo custom; para transformers v4 es necesario usar `revision="compat-v4"`.
- No se han documentado sesgos especificos, pero el modelo hereda los sesgos de las bases de datos quimicas utilizadas.

## Enlaces

- HuggingFace: https://huggingface.co/introvoyz045/MoLFormer-XL-both-10pct
- Modelo original en HuggingFace: https://huggingface.co/ibm/MoLFormer-XL-both-10pct
- Paper (arXiv): https://arxiv.org/abs/2106.09553
- Paper (Nature Machine Intelligence): https://doi.org/10.1038/s42256-022-00580-7
- Repositorio GitHub: https://github.com/IBM/molformer
