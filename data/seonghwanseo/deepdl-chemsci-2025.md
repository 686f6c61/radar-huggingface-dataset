# SeonghwanSeo/deepdl-chemsci-2025

## Resumen

DeepDL chemsci-2025 es un modelo neuronal recurrente desarrollado por SeonghwanSeo, investigador vinculado al proyecto drug-likeness, que aborda una tarea muy concreta dentro de la quimioinformatica computacional: la clasificacion de moleculas segun su drug-likeness a partir de su representacion SMILES. No es un modelo de lenguaje generativo al uso, sino un clasificador de secuencias quimicas entrenado especificamente para distinguir compuestos con propiedades favorables para desarrollo farmaceutico.

El modelo se presenta como un reentrenamiento en 2025 del modelo original descrito en un articulo previo, con ajuste de hiperparametros. Su arquitectura es una red GRU de cuatro capas con tamano oculto de 1024 y un vocabulario de 67 caracteres, lo que da un total de 25,33 millones de parametros en precision float32. El repositorio ocupa aproximadamente 0,1 GB e incluye el state dictionary original (`model.pth`) y un fichero de configuracion (`config.json`).

Su relevancia es acotada pero clara: ofrece una alternativa ligera y reproducible para filtrar bibliotecas quimicas antes de etapas costosas de simulacion o sintesis. La ausencia de licencia declarada, de idiomas y de pipeline estandar en Hugging Face limita su adopcion directa en produccion sin revision adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU de 4 capas (red neuronal recurrente) |
| Parametros totales | 25.328.707 (25,33 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud de la cadena SMILES de entrada) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (el modelo opera sobre cadenas SMILES, no sobre lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dictionary (`model.pth`) y `config.json` |
| Tamano oculto | 1024 |
| Vocabulario | 67 caracteres |
| Precision | float32 |
| Tamano del fichero de pesos | aproximadamente 101,3 MB (96,6 MiB) |
| Tamano del repositorio | aproximadamente 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal recurrente de tipo GRU con cuatro capas apiladas y un estado oculto de 1024 dimensiones. La entrada es una secuencia de caracteres SMILES tokenizada sobre un vocabulario de 67 simbolos, y la salida es una prediccion de drug-likeness. El modelo se distribuye en float32, sin versiones cuantizadas publicadas en el repositorio.

Segun la model card, se trata de un reentrenamiento en 2025 del modelo original del articulo, con ajuste de hiperparametros. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de refuerzo o ajuste fino supervisado adicionales. Tampoco se documentan innovaciones tecnicas destacables mas alla del propio ajuste de hiperparametros respecto al modelo base.

## Capacidades

- Clasificacion de drug-likeness a partir de cadenas SMILES de moleculas.
- Procesamiento de secuencias quimicas tokenizadas a nivel de caracter con vocabulario de 67 simbolos.
- Modelado de dependencias secuenciales en SMILES mediante GRU multicapa.
- Inferencia en precision float32 sobre CPU o GPU sin requisitos especificos documentados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en sentido estricto: opera sobre notacion quimica, no sobre lenguaje natural.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Filtrado previo de bibliotecas quimicas: dado un conjunto de moleculas en SMILES, el modelo permite puntuar su drug-likeness y descartar candidatos poco prometedores antes de etapas de docking o sintesis, reduciendo el coste computacional aguas abajo.
- Enriquecimiento de pipelines de descubrimiento temprano: integrado como paso de scoring en un flujo de generacion de moleculas, sirve para priorizar compuestos generados por otros modelos generativos.
- Analisis retrospectivo de colecciones internas: permite reclasificar bases de datos historicas de compuestos y detectar sesgos en la composicion de las bibliotecas corporativas.
- Docencia e investigacion en quimioinformatica: su tamano reducido (25,33 M de parametros, 101,3 MB) lo hace adecuado como ejemplo reproducible de modelado de SMILES con RNN en cursos y practicas.
- Prototipado rapido en entornos con recursos limitados: al caber en cualquier GPU consumer e incluso en CPU, permite validar hipotesis sin infraestructura dedicada.
- Comparacion de arquitecturas: sirve como baseline recurrente frente a modelos transformer o basados en grafos en experimentos academicos de drug-likeness.
- Reproduccion de resultados del articulo original: el state dictionary y el `config.json` permiten replicar la evaluacion descrita en el README del proyecto drug-likeness.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al README del repositorio de GitHub del proyecto drug-likeness para consultar los resultados de evaluacion, pero dichos datos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32, dado que el fichero de pesos ocupa aproximadamente 101,3 MB y el estado oculto es de 1024 dimensiones en 4 capas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) y tambien en CPU para inferencia por lotes de tamano moderado.
- Opciones de despliegue: al ser un modelo PyTorch con state dictionary, el despliegue natural es mediante PyTorch directamente o exportandolo a TorchScript/ONNX. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de drug-likeness basados en SMILES) con sus especificaciones, por lo que no es posible construir una comparativa rigurosa sin inventar datos.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el uso comercial esta permitido, lo que impide su adopcion en produccion sin aclaracion previa por parte del autor.
- Ausencia de benchmarks publicados en la informacion disponible: no es posible verificar su rendimiento frente al modelo original ni frente a alternativas.
- Modelo de proposito muy especifico: no es un modelo de lenguaje y no debe emplearse para generacion de texto, codigo ni tareas generales.
- Dependencia del vocabulario de 67 caracteres: SMILES con simbolos fuera de ese vocabulario pueden no procesarse correctamente.
- Limitacion intrinseca de las RNN frente a modelos basados en atencion para capturar dependencias largas en cadenas SMILES extensas.
- Riesgo de sesgo derivado del dataset de entrenamiento, cuya composicion no se detalla; el modelo puede comportarse de forma desigual segun familias quimicas.
- Riesgo de falsos positivos y falsos negativos en la prediccion de drug-likeness; no sustituye a la validacion experimental.
- Sin pipeline declarado en Hugging Face: la integracion requiere cargar manualmente el state dictionary y el `config.json`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeonghwanSeo/deepdl-chemsci-2025
- README del proyecto drug-likeness (referenciado en la model card): https://github.com/SeonghwanSeo/drug-likeness/blob/main/README.md
- Repositorio del proyecto drug-likeness: https://github.com/SeonghwanSeo/drug-likeness
