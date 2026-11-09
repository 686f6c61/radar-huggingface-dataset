# SeonghwanSeo/deepdl-chemsci-2021

## Resumen

DeepDL chemsci-2021 es un modelo de red neuronal recurrente desarrollado por SeonghwanSeo, orientado a la prediccion de drug-likeness (similitud a farmaco) a partir de representaciones SMILES de moleculas. Se trata de un modelo especifico de dominio quimico, no de un modelo de lenguaje generalista: su entrada son cadenas SMILES y su objetivo es puntuar o clasificar moleculas segun su probabilidad de ser candidatas validas a farmaco. El modelo parte de un preentrenamiento sobre PubChem y se afina sobre moleculas de farmacos de uso mundial excluyendo el conjunto de test de farmacos aprobados por la FDA.

Tecnicamente es una GRU de 4 capas con tamano oculto de 1024 y un vocabulario de 67 caracteres, lo que da un total de 25.328.707 parametros (25,33 M) en precision float32. El archivo de pesos ocupa aproximadamente 101,3 MB (96,6 MiB). No se trata de un transformer ni de un MoE, sino de una arquitectura recurrente clasica adaptada al procesamiento de secuencias SMILES.

Su relevancia actual es acotada pero concreta: sirve como referencia reproducible para tareas de filtrado temprano de candidatos en pipelines de descubrimiento de farmacos, y como modelo base afinable para experimentos academicos de quimioinformatica. Al no disponer de licencia declarada ni de pipeline oficial en Hugging Face, su uso en produccion requiere verificacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU de 4 capas |
| Parametros totales | 25.328.707 (25,33 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (entrada basada en cadenas SMILES) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`model.pth`) con `config.json` |
| Tamano oculto | 1024 |
| Vocabulario | 67 caracteres |
| Precision | float32 |
| Tamano del archivo de pesos | ~101,3 MB (96,6 MiB) |
| Modelo base | SeonghwanSeo/deepdl-pretrain |
| Relacion con modelo base | finetune |
| Libreria | druglikeness |

## Arquitectura y entrenamiento

La arquitectura es una GRU (Gated Recurrent Unit) de 4 capas con tamano oculto de 1024 y un vocabulario de 67 caracteres, lo que corresponde a los simbolos que aparecen en las cadenas SMILES del corpus utilizado. El modelo se entrena en dos fases: primero un preentrenamiento sobre PubChem, y despues un afinado sobre moleculas de farmacos de uso mundial excluyendo el conjunto de test compuesto por farmacos aprobados por la FDA. Esta separacion entre train y test busca evitar fuga de informacion y evaluar la capacidad de generalizacion a moleculas no vistas.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El modelo se distribuye como `model.pth` (state dict original) junto con `config.json` con la configuracion de arquitectura, y esta pensado para cargarse mediante la libreria `druglikeness`.

## Capacidades

- Prediccion de drug-likeness a partir de cadenas SMILES.
- Procesamiento de secuencias de caracteres quimicos con vocabulario de 67 simbolos.
- Clasificacion o puntuacion de moleculas como candidatas a farmaco.
- Extraccion de representaciones internas de moleculas (hidden states de la GRU) potencialmente reutilizables para tareas downstream.
- Modelo afinable sobre nuevos conjuntos de moleculas (finetune desde `SeonghwanSeo/deepdl-pretrain`).
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso.
- No dispone de capacidades multilingues en el sentido habitual; su dominio es exclusivamente quimico.
- No dispone de vision, audio ni modo thinking.

## Casos de uso

- Filtrado temprano en pipelines de descubrimiento de farmacos: el modelo puntua grandes librerias de moleculas en formato SMILES para descartar candidatas con baja probabilidad de drug-likeness antes de pasar a etapas costosas de docking o sintesis.
- Priorizacion de compuestos en cribado virtual: dado un conjunto de moleculas generadas por modelos generativos, DeepDL permite ordenarlas por su similitud a farmaco y reducir el numero de candidatas a evaluar experimentalmente.
- Validacion de moleculas generadas por IA: en flujos de generacion de moleculas con modelos generativos, este modelo actua como filtro de calidad para descartar estructuras quimicamente improbables o poco farmacologicas.
- Reproducibilidad academica: al ser el modelo original del paper, sirve para replicar resultados publicados y como linea base en experimentos de quimioinformatica.
- Fine-tuning sobre quimiotecas propietarias: partiendo de `deepdl-pretrain`, se puede afinar sobre el catalogo interno de una empresa farmaceutica para adaptar la nocion de drug-likeness a su dominio terapeutico.
- Analisis exploratorio de espacios quimicos: las representaciones internas de la GRU pueden emplearse para agrupar moleculas por similitud en el espacio latente y estudiar la diversidad de una libreria.
- Ensenanza y prototipado: por su tamano reducido (25,33 M de parametros, ~101 MB), es adecuado para cursos y prototipos que requieran un modelo quimico ligero sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 100-200 MB solo para los pesos, mas el overhead de activaciones, que depende de la longitud de las secuencias SMILES procesadas.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, e incluso en CPU para inferencia por lotes de tamano moderado.
- GPU recomendadas: no se requiere hardware de gama alta; cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente. Para lotes grandes, una RTX 3090 o A100 aporta margen de sobra.
- Opciones de despliegue: al distribuirse como state dict de PyTorch con `config.json` y depender de la libreria `druglikeness`, el despliegue se realiza cargando el modelo en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje transformer y no a esta arquitectura GRU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre PubChem y farmacos de uso mundial, puede reflejar los sesgos de composicion de esas fuentes.
- Riesgo de alucinacion: no aplica en el sentido generativo clasico, pero el modelo puede producir puntuaciones poco fiables para clases quimicas poco representadas en el entrenamiento.
- Limitaciones de contexto o idioma: la entrada esta restringida a cadenas SMILES con un vocabulario de 67 caracteres; cualquier simbolo fuera de ese vocabulario no sera procesado correctamente. No es un modelo de lenguaje natural.
- Restricciones de licencia: la licencia no esta declarada en la informacion disponible, por lo que el uso comercial queda sin garantia explicita y requiere verificacion con el autor.
- Caveat para produccion: el repositorio tiene 0 descargas y 0 likes, y la fecha de creacion indicada es 2026-11-09, lo que sugiere que el modelo no ha sido validado por la comunidad. Conviene evaluar su comportamiento en el dominio concreto antes de integrarlo en pipelines criticos.
- Dependencia de la libreria `druglikeness` para su carga y uso, lo que anade una dependencia no estandar frente a otros formatos mas extendidos.
- No se documentan procesos de alineacion, evaluacion de robustez ni analisis de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeonghwanSeo/deepdl-chemsci-2021
- Modelo base de preentrenamiento: https://huggingface.co/SeonghwanSeo/deepdl-pretrain
- README del proyecto drug-likeness: https://github.com/SeonghwanSeo/drug-likeness/blob/main/README.md
