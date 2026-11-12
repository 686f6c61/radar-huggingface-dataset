# OneScience-Group/HNO

## Resumen

HNO (Hyperbolic Neural Operator) es un modelo de aprendizaje de operadores diseñado para resolver la ecuación de Darcy, un problema clasico de dinamica de fluidos en medios porosos. Lo desarrolla OneScience-Group y se distribuye como un paquete reproducible que incluye el checkpoint entrenado (`weight/best_model.pth`), el codigo del modelo, la configuracion, y los scripts de entrenamiento, inferencia y visualizacion. El modelo opera sobre mallas de 85 x 85, aunque los datos originales de entrenamiento y evaluacion se almacenan a resolucion 421 x 421.

El modelo resuelve la tarea de aprender el operador que mapea el campo de coeficientes (permeabilidad) a la solucion (presion/campo de solucion) de la ecuacion de Darcy, un problema de referencia habitual en el campo de los neural operators. Su relevancia radica en que ofrece una reproduccion verificable de un resultado publicado: el error relativo L2 reportado en evaluacion es de 0,00450221, practicamente identico al 0,0045 de la Tabla 2 del paper de referencia.

La ficha se basa exclusivamente en la model card y los metadatos disponibles. No se dispone de informacion sobre la arquitectura interna, el numero de parametros ni los detalles del entrenamiento mas alla de lo indicado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neural operator (HNO, Hyperbolic Neural Operator); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de operadores, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles, en la documentacion del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch) |

## Arquitectura y entrenamiento

HNO es un modelo de aprendizaje de operadores (operator learning) orientado a la resolucion de ecuaciones en derivadas parciales, en concreto la ecuacion de Darcy. La model card no detalla la arquitectura interna mas alla de su denominacion como Hyperbolic Neural Operator, por lo que no se dispone de informacion sobre numero de capas, dimensiones ocultas, mecanismos de atencion o modulos hiperbolicos concretos. El checkpoint se distribuye en formato PyTorch (`.pth`) y el modelo se ejecuta sobre la libreria `pytorch`.

El entrenamiento se realizo sobre dos ficheros MAT de Darcy, cada uno con arrays `coeff` y `sol` de forma [1024, 421, 421] en precision float64. El primer fichero aporta 1.000 casos de entrenamiento y el segundo 200 casos de evaluacion. El autor indica que el paquete se entreno una sola vez y que las cifras reportadas no son garantia para otra ejecucion. Los parametros del experimento se encuentran en `config/config.yaml`. No se especifica el numero de tokens ni el uso de tecnicas de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Aprendizaje de operadores para la ecuacion de Darcy: mapea el campo de coeficientes (permeabilidad) a la solucion de la PDE sobre mallas de 85 x 85.
- Inferencia sobre casos nuevos de Darcy mediante `scripts/inference.py`.
- Generacion de resultados y visualizacion mediante `scripts/result.py`.
- Reproduccion de experimentos: incluye scripts de entrenamiento (`scripts/train.py`) y configuracion completa.
- Evaluacion cuantitativa: calcula el error relativo L2 frente a la solucion de referencia.
- No dispone de soporte de tool calling, function calling, agentes, capacidades multilingues ni modos de razonamiento, al no ser un modelo de lenguaje.

## Casos de uso

- Simulacion de flujo en medios porosos: el modelo aproxima la solucion de la ecuacion de Darcy sobre mallas de 85 x 85, sustituyendo la resolucion numerica iterativa por una inferencia directa sobre el campo de coeficientes.
- Reproduccion de resultados de investigacion: al incluir checkpoint y scripts, permite verificar el error relativo L2 reportado (0,00450221) frente al valor del paper (0,0045) para validar implementaciones.
- Prototipado de neural operators: sirve como base para experimentar con variantes de operadores hiperbolicos y comparar con otros metodos de operator learning.
- Generacion de datasets sinteticos de Darcy: puede emplearse para producir soluciones aproximadas a gran escala sobre las que entrenar o validar otros modelos.
- Docencia y formacion: el paquete incluye entrenamiento, inferencia y visualizacion, lo que facilita su uso en cursos sobre metodos numericos y aprendizaje automatico cientifico.
- Evaluacion comparativa de operadores: el error relativo L2 sobre 200 casos de evaluacion constituye una metrica reproducible para comparar con Fourier Neural Operators u otros metodos.
- Analisis de sensibilidad en ingenieria de yacimientos: permite explorar rapidamente como varia la solucion ante cambios en el campo de permeabilidad.

## Benchmarks y rendimiento

| Metrica | Valor HNO | Valor paper (Tabla 2) |
|---|---|---|
| Error relativo L2 (evaluacion) | 0,00450221 | 0,0045 |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no aplican a un modelo de operadores.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamano del modelo, que no se especifica.
- GPU recomendadas: no disponibles; el autor menciona la necesidad de un entorno PyTorch con acelerador para el entrenamiento, sin detallar modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PyTorch nativo mediante los scripts incluidos (`scripts/inference.py`, `scripts/result.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables (por ejemplo, Fourier Neural Operator u otros neural operators para Darcy) en cuanto a parametros, contexto, rendimiento o licencia. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo se entreno una sola vez; el autor advierte explicitamente de que las cifras reportadas no son garantia para otra ejecucion.
- Ambito restringido: resuelve exclusivamente la ecuacion de Darcy a resolucion de 85 x 85; no es un modelo de proposito general.
- No se dispone de informacion sobre sesgos, ya que el modelo opera sobre datos fisicos sinteticos y no sobre texto.
- Riesgo de extrapolacion: al entrenarse con 1.000 casos y evaluarse con 200, su comportamiento fuera de la distribucion de los datos de Darcy puede degradarse; no se documenta.
- Licencia Apache 2.0 para el codigo, pero el autor advierte de que la licencia del dataset no debe inferirse de la licencia del codigo.
- No se documentan limitaciones de contexto ni de idioma, al no ser un modelo de lenguaje.
- Para produccion, conviene preservar el checkpoint incluido antes de reentrenar, tal como indica el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/HNO
- Dataset en ModelScope: https://www.modelscope.cn/datasets/OneScience/HNO-Darcy
- Paper de referencia: https://guobapei.github.io/Hyperbolic-Neural-Operator/assets/paper.pdf
- Procedencia de los datos: https://drive.google.com/drive/folders/1UnbQh2WWc6knEHbLn-ZaXrKUZhp7pjt-
