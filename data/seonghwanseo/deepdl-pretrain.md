# SeonghwanSeo/deepdl-pretrain

## Resumen

DeepDL-pretrain es un modelo de lenguaje quimico desarrollado por SeonghwanSeo, publicado en Hugging Face como parte del trabajo original de DeepDL. No se trata de un modelo de lenguaje de proposito general, sino de un modelo especializado en el preentrenamiento sobre representaciones SMILES de moleculas procedentes de PubChem, orientado a tareas de prediccion de drug-likeness (similitud con farmacos). El modelo se distribuye como pesos preentrenados que sirven de base para el ajuste fino en tareas quimicas concretas.

Arquitectonicamente es una red recurrente de tipo GRU de 4 capas con tamano oculto de 1024 y un vocabulario de 67 caracteres, lo que da un total de 25.328.707 parametros (25,33 M) en precision float32, con un fichero de pesos de aproximadamente 101,3 MB. Es, por tanto, un modelo muy compacto en comparacion con los LLM actuales, y su interes radica en su especializacion y en su papel como componente dentro del ecosistema de la libreria `druglikeness`.

El modelo resulta relevante para investigadores de quimioinformatica y descubrimiento de farmacos que necesiten un punto de partida preentrenado sobre SMILES sin la sobrecarga computacional de modelos generativos de gran escala. Su publicacion es reciente y cuenta con cero descargas y cero likes en el momento de la consulta, lo que indica que su adopcion publica es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU de 4 capas (red neuronal recurrente) |
| Parametros totales | 25.328.707 (25,33 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (opera sobre cadenas SMILES, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dictionary (`model.pth`) + `config.json` |
| Tamano oculto | 1024 |
| Vocabulario | 67 caracteres |
| Precision | float32 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de red neuronal recurrente basada en GRU (Gated Recurrent Unit) con 4 capas y un tamano oculto de 1024. El vocabulario de 67 caracteres corresponde al conjunto de simbolos necesarios para representar moleculas en notacion SMILES. Los pesos se distribuyen en precision float32 dentro de un fichero `model.pth` que contiene el state dictionary original, acompanado de un `config.json` con la configuracion de la arquitectura.

Segun la model card, el modelo fue preentrenado sobre datos de PubChem. No se especifica en la informacion disponible el numero de tokens o moleculas utilizadas, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (poco probables en este dominio). Tampoco se detallan innovaciones tecnicas adicionales mas alla del esquema de preentrenamiento sobre SMILES. El modelo se presenta explicitamente como el punto de partida del trabajo original DeepDL, por lo que su entrenamiento y evaluacion deben consultarse en el repositorio `drug-likeness` del autor.

## Capacidades

- Modelado de secuencias SMILES: procesa y representa moleculas en notacion lineal de caracteres.
- Preentrenamiento para drug-likeness: sirve como base para tareas de clasificacion o prediccion relacionadas con la similitud a farmacos.
- Extraccion de representaciones: al ser un modelo recurrente preentrenado, puede emplearse para obtener embeddings de moleculas.
- Ajuste fino: disenado para ser adaptado a tareas quimicas especificas mediante fine-tuning.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de lenguaje natural.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Filtrado temprano en pipelines de descubrimiento de farmacos: el modelo preentrenado puede ajustarse para puntuar moleculas candidatas segun su drug-likeness antes de costosos calculos de docking o sintesis.
- Generacion de embeddings moleculares para similitud: las representaciones internas del GRU permiten calcular distancias entre moleculas SMILES y agrupar compuestos por proximidad estructural.
- Preentrenamiento base para modelos de quimioinformatica: equipos que trabajen con arquitecturas recurrentes pueden partir de estos pesos en lugar de entrenar desde cero sobre PubChem.
- Clasificacion de compuestos en cribado virtual: ajuste fino sobre conjuntos etiquetados para discriminar entre compuestos con propiedades deseables e indeseables.
- Investigacion academica en representacion de SMILES: util como baseline compacto (25,33 M de parametros) para comparar con modelos transformer en tareas de quimica.
- Prototipado rapido en entornos con recursos limitados: su tamano reducido (101,3 MB) permite experimentar en CPU o GPU de gama baja sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la documentacion del repositorio `drug-likeness` para los resultados de evaluacion, pero estos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (25,33 M de parametros, ~101 MB de pesos); el consumo real dependera del tamano de lote y de la longitud de las secuencias SMILES.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutar el modelo sin dificultad.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: al ser un state dictionary de PyTorch con arquitectura GRU personalizada, requiere cargar la configuracion mediante el codigo del repositorio `drug-likeness`; no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a transformers y LLM.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera una latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al entrenarse sobre PubChem, podria heredar sesgos de representacion del dataset (infrarrepresentacion de ciertas clases quimicas), pero no se documenta.
- Riesgo de alucinacion: en el contexto de generacion de SMILES, el modelo podria producir cadenas quimicamente invalidas; no se aporta informacion sobre validacion.
- Limitaciones de contexto o idioma: no se especifica la longitud maxima de secuencia SMILES soportada; el vocabulario esta limitado a 67 caracteres.
- Restricciones de licencia: la licencia no esta disponible, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier uso en produccion.
- Caveat para produccion: el modelo se publica como pesos preentrenados de investigacion, sin pipeline declarado ni garantias de soporte; requiere codigo externo del repositorio del autor para su carga y uso.
- Adopcion practicamente nula: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeonghwanSeo/deepdl-pretrain
- Repositorio drug-likeness (README con uso y evaluacion): https://github.com/SeonghwanSeo/drug-likeness/blob/main/README.md
