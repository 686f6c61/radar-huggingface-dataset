# ejy/SELFIES-RoBERTa-PubChem10M

## Resumen

SELFIES-RoBERTa-PubChem10M es un modelo de lenguaje molecular de tipo encoder, desarrollado por el usuario ejy y publicado en Hugging Face en febrero de 2023. Se trata de un RoBERTa entrenado desde cero (scratch) sobre el conjunto PubChem10M, pero con una particularidad relevante: la entrada no son cadenas SMILES en crudo, sino SELFIES (Self-Referencing Embedded Strings), una representacion molecular que garantiza validez sintactica de la molecula resultante ante cualquier manipulacion de la cadena. El tokenizer se entreno especificamente con el alfabeto semanticamente robusto de SELFIES.

El modelo resuelve la tarea de masked language modeling sobre representaciones moleculares y su uso previsto, segun la model card, es la extraccion de embeddings de moleculas para tareas downstream como prediccion de afinidad de union (binding affinity) o toxicidad. Cuenta con 109.514.810 parametros reales (segun los pesos en safetensors), una cifra inferior a la de un RoBERTa-base estandar, lo que apunta a un vocabulario de tokenizer especifico de SELFIES de menor tamano que el vocabulario BPE de 50.265 tokens de RoBERTa (inferencia propia; la model card no detalla la configuracion del tokenizer).

Es relevante en el contexto de la quimioinformatica open source porque combina dos piezas poco frecuentes: preentrenamiento sobre SELFIES en lugar de SMILES y publicacion abierta de pesos para una tarea de representacion molecular. No obstante, es un modelo con muy poca traccion en el ecosistema (12 descargas y 2 likes en el momento de la ficha), sin licencia declarada y sin resultados de benchmarks mas alla de la perdida y la exactitud de enmascaramiento del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (entrenado desde cero), tarea fill-mask |
| Parametros totales | 109.514.810 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; al derivar de RoBERTa, la configuracion estandar admite hasta 512 tokens de entrada |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; el repo solo contiene pesos en precision completa) |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje natural, opera sobre el alfabeto de tokens SELFIES |
| Licencia | no disponible |
| Formato de pesos | safetensors y binarios PyTorch (repo de 0,9 GB, etiqueta pytorch y safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de RoBERTa, es decir, un transformer encoder bidireccional con normalizacion post-LN, atencion multicabeza completa y objetivo de masked language modeling. No hay innovaciones arquitectonicas propias: el interes esta en la representacion de entrada. El autor entreno un tokenizer sobre el alfabeto de SELFIES, que codifica las moleculas como cadenas de simbolos con reglas de valencia incorporadas, de modo que cualquier permutacion o mutacion de la cadena sigue produciendo una molecula quimicamente valida.

El entrenamiento se realizo sobre el split completo del dataset PubChem10M, convertido a SELFIES y publicado por el propio autor como ejy/PubChem10M_SMILES_SELFIES. Se utilizo el script run_mlm.py de los ejemplos de Hugging Face con torchrun en configuracion multi-GPU. Los hiperparametros declarados son: learning rate 5e-05, train batch size 32 por dispositivo (64 efectivo en 2 dispositivos), eval batch size 32 por dispositivo (64 efectivo), 3 epocas, optimizador Adam con betas=(0,9; 0,999) y epsilon=1e-08, scheduler lineal y semilla 42. El computo se ejecuto en el servicio HPC Baskerville (Tier 2), operado por Advanced Research Computing de la Universidad de Birmingham y financiado por EPSRC y UKRI. Las versiones de framework declaradas son Transformers 4.27.0.dev0, PyTorch 1.13.1+cu117, Datasets 2.9.0 y Tokenizers 0.13.2. No se menciona RLHF, DPO ni ninguna fase de ajuste por preferencias, algo coherente con un modelo encoder de representaciones.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre cadenas SELFIES: predice tokens enmascarados de una representacion molecular.
- Extraccion de embeddings de moleculas: es el uso principal declarado por el autor, orientado a tareas downstream de quimioinformatica.
- Representacion de estructura molecular implicita a partir de la cadena SELFIES, sin necesidad de descriptores calculados manualmente ni de grafos moleculares explicitos.
- Transferencia a tareas downstream mediante ajuste fino supervisado con cabeceras de clasificacion o regresion (afinidad de union, toxicidad, propiedades ADMET, solubilidad, entre otras).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido habitual: no procesa lenguaje natural.
- No dispone de modo thinking, vision, audio ni generacion autoregresiva de texto.

## Casos de uso

- Prediccion de toxicidad: se anade una cabecera de clasificacion sobre el embedding del token [CLS] y se ajusta el modelo con un dataset etiquetado de toxicidad (por ejemplo, Tox21). La representacion SELFIES evita que el modelo aprenda dependencias de cadenas SMILES invalidas o fragiles.
- Prediccion de afinidad de union farmaco-diana: ajuste fino con pares molecula-diana etiquetados con valores de IC50 o Kd para priorizar candidatos en cribado virtual. Es el caso de uso que el propio autor cita en la model card.
- Filtrado de librerias quimicas: extraccion de embeddings masiva para agrupar moleculas por similitud en el espacio latente y descartar zonas quimicamente poco prometedoras antes de pasar a simulacion o sintesis.
- Busqueda de analogos y clustering: los embeddings permiten construir indices vectoriales (FAISS, Annoy) para recuperar moleculas similares a una consulta sin depender de fingerprints手工 como Morgan o MACCS.
- Pretratamiento para modelos generativos: el encoder puede servir de base congelada para inicializar o condicionar un modelo generativo de moleculas (VAE o transformer autoregresivo sobre SELFIES), ya que el vocabulario de entrada coincide.
- Prediccion de propiedades fisicoquimicas: regresion sobre solubilidad acuosa, logP o permeabilidad, con la ventaja de que el ajuste fino sobre 109M de parametros es viable en una unica GPU de consumo.
- Anotacion de datasets internos: dado que el modelo es pequeno, puede desplegarse en local para generar representaciones de moleculas propietarias sin enviar datos a servicios externos.

## Benchmarks y rendimiento

Los unicos resultados publicados en la model card son metricas del propio objetivo de enmascaramiento sobre el conjunto de evaluacion. No hay resultados en benchmarks estandar de quimioinformatica como MoleculeNet, y el model-index del autor esta vacio.

| Metrica | Valor | Notas |
|---|---|---|
| Loss (evaluacion, masked LM) | 0,1349 | Declarado por el autor |
| Accuracy (evaluacion, masked LM) | 0,9527 | Exactitud de prediccion del token enmascarado |
| MMLU, HumanEval, GSM8K | no disponible | No aplicables a un encoder molecular |
| MoleculeNet u otros benchmarks de quimioinformatica | no disponible | El autor no publica resultados |

Aviso interpretativo: una accuracy de 0,9527 en masked LM no es un indicador de calidad en tareas downstream. Parte de los tokens enmascarados en SELFIES son altamente predecibles por reglas de valencia y por contexto local, por lo que la cifra puede sobreestimar la utilidad real de la representacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 el modelo ocupa aproximadamente 438 MB de pesos; en fp16/bf16, unos 219 MB. Sumando activaciones para secuencias de hasta 512 tokens, la inferencia por lotes pequenos cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB. Para extraccion masiva de embeddings, una RTX 3090, RTX 4090, A10, L4, A100 o H100 permiten procesar lotes grandes y maximizar el throughput; para ajuste fino con cabecera downstream basta una RTX 3060 de 12 GB o superior.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo con 4 GB o mas, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores. Tambien es viable en CPU para inferencia puntual.
- Opciones de despliegue: pipeline fill-mask de Transformers y feature-extraction para embeddings; exportacion a ONNX u OpenVINO mediante Optimum; TorchScript; Hugging Face Inference Endpoints (el modelo esta etiquetado como endpoints_compatible). vLLM y llama.cpp no estan pensados para encoders RoBERTa de fill-mask, por lo que requeririan adaptaciones no estandar.
- Latencia y throughput estimados: no disponible; no se publican mediciones. Al tratarse de un encoder de 109M de parametros, la latencia esperada por lote es del orden de milisegundos en GPU, pero no se aporta ninguna cifra verificada.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks para establecer una comparacion cuantitativa. La tabla siguiente recoge una comparacion cualitativa de categoria; los campos no confirmados se marcan como no disponibles.

| Modelo | Autor | Arquitectura | Representacion de entrada | Parametros | Licencia |
|---|---|---|---|---|---|
| SELFIES-RoBERTa-PubChem10M | ejy | RoBERTa encoder (desde cero) | SELFIES | 109.514.810 | no disponible |
| ChemBERTa-77M-MLM | DeepChem | RoBERTa encoder | SMILES | aproximadamente 77M (no confirmado en la informacion disponible) | no disponible |
| MoLFormer-XL | IBM Research | Transformer con atencion lineal | SMILES | no disponible | no disponible |
| MolBERT | no disponible | BERT encoder | SMILES | no disponible | no disponible |

Nota: la informacion proporcionada no incluye resultados de benchmarks de estos modelos alternativos, por lo que no se comparan rendimientos. Cualquier eleccion entre ellos deberia basarse en una evaluacion propia sobre el dataset downstream concreto.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: solo produce predicciones fill-mask y embeddings. No debe presentarse como sustituto de un LLM.
- Ausencia de licencia declarada: sin licencia explicita, el uso comercial es juridicamente incierto. Conviene contactar con el autor antes de integrarlo en un producto.
- Idiomas: no procesa lenguaje natural; cualquier documentacion sobre idiomas es inaplicable. Solo acepta tokens del vocabulario SELFIES entrenado, y las moleculas fuera de ese alfabeto o con elementos poco representados en PubChem10M pueden tokenizarse mal.
- Riesgo de fuga de datos en la evaluacion de tareas downstream: PubChem10M es un dataset muy amplio y es probable que moleculas de conjuntos de test habituales ya estuvieran presentes durante el preentrenamiento, lo que infla las metricas de ajuste fino si no se hace un split cuidadoso.
- La exactitud de 0,9527 en masked LM no garantiza buena transferencia: parte de la tarea se resuelve con reglas de valencia de SELFIES.
- Sesgos de dominio: el entrenamiento se limita a moleculas de PubChem10M, con sobrerrepresentacion de compuestos sintetizados y registrados; moleculas naturales complejas, peptidos largos, polimeros o compuestos organometalicos pueden estar infrarrepresentados.
- Riesgo de alucinacion en sentido quimico: el modelo puede asignar alta probabilidad a tokens que produzcan una cadena SELFIES valida pero quimicamente implausible o inexistente. La validez sintactica de SELFIES no implica plausibilidad quimica.
- Entrenamiento corto y sin ajuste posterior: 3 epocas, sin RLHF ni DPO, y sin ninguna evaluacion en tareas downstream publicada.
- Trazabilidad baja: solo 12 descargas y 2 likes en el momento de la ficha, sin paper asociado ni repositorio de codigo propio mas alla de los scripts estandar de Hugging Face.
- Version de framework antigua (Transformers 4.27.0.dev0): conviene verificar la compatibilidad con versiones recientes de la libreria al cargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ejy/SELFIES-RoBERTa-PubChem10M
- Dataset de entrenamiento en Hugging Face: https://huggingface.co/datasets/ejy/PubChem10M_SMILES_SELFIES
- Repositorio de SELFIES: https://github.com/aspuru-guzik-group/selfies
- Dataset PubChem10M original (DeepChem, S3): https://deepchemdata.s3-us-west-1.amazonaws.com/datasets/pubchem_10m.txt.zip
- Script de entrenamiento run_mlm.py de Hugging Face: https://raw.githubusercontent.com/huggingface/transformers/main/examples/pytorch/language-modeling/run_mlm.py
- Servicio HPC Baskerville: https://www.baskerville.ac.uk/
- Paper o publicacion asociada: no disponible
- Demo o espacio interactivo: no disponible
- Repositorio de codigo del autor: no disponible
- Resultados de la busqueda web: los enlaces devueltos no guardan relacion con el modelo (contenido de terceros sin vinculacion tecnica), por lo que no se incluyen.
