# OneScience-Group/NOTS-DarcyFlowRate

## Resumen

NOTS-DarcyFlowRate es un paquete de reproduccion del experimento de caudales de Darcy descrito en el articulo "Thompson Sampling in Function Spaces via Neural Operators" (arXiv:2506.21894). No es un modelo de lenguaje: es un operador neuronal entrenado para predecir campos de presion de 16x16 a partir de campos de permeabilidad, y sirve como surrogate dentro de un bucle de muestreo de Thompson secuencial para optimizar objetivos de caudal total negativo. Lo publica OneScience-Group y el checkpoint incluido corresponde a la ejecucion seleccionada de diez ensayos independientes con 300 consultas por ensayo.

El interes practico es acotado y muy especifico: sirve para estudiar y reproducir optimizacion secuencial en espacios de funciones con operadores neuronales, no para generacion de texto ni tareas de NLP. La model card es transparente sobre el alcance: la reproduccion obtiene un regret medio final de 0,289031 +/- 0,016963 frente al 0,012 +/- 0,001 de la Tabla 1 del articulo, y un error relativo L2 medio de 0,339917 en el campo de presion de test. Es, por tanto, un intento documentado de reproduccion, no una reclamacion de precision equivalente al paper.

El repositorio de Hugging Face pesa 0,0 GB (solo contiene el checkpoint y scripts), tiene 82 descargas y 0 likes en el momento de la consulta, y se distribuye bajo licencia "other". El entrenamiento original se ejecuto en una DCU con PyTorch; no se reclama ejecucion completa del pipeline en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal (neural operator) para mapear permeabilidad a presion; variante FNO segun el tag `nots_darcy_fno` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: campo de permeabilidad 16x16) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, `weight/best_model.pt`) |
| Idiomas soportados | en (metadato de la model card; el modelo no procesa lenguaje) |
| Licencia | other |
| Formato de pesos | PyTorch `.pt` (`weight/best_model.pt`) |

## Arquitectura y entrenamiento

La model card identifica el modelo con el tag `nots_darcy_fno`, lo que apunta a una variante de Fourier Neural Operator (FNO) para el problema de Darcy. La tarea es un mapeo campo a campo: dada una permeabilidad en rejilla de 16x16, el operador predice el campo de presion correspondiente de 16x16. Sobre esa prediccion se construye un objetivo de caudal total negativo que alimenta un esquema de muestreo de Thompson en espacio de funciones para seleccion secuencial de consultas.

Los datos de entrenamiento no se alojan en Hugging Face; la model card remite al dataset OneScience/NOTS-Darcy-16 en ModelScope, con 1.000 pares de entrenamiento (`data/darcy_train_16.pt`) y 50 pares de test (`data/darcy_test_16.pt`), originalmente del repositorio de los autores de NOTS (csiro-funml/nots) y redistribuidos bajo licencia MIT acompanante. El entrenamiento reproducible ejecuta diez semillas configuradas con 300 consultas por semilla en una DCU con PyTorch. El checkpoint publicado modifica solo la huella de configuracion para rutas portables de datos y salida; los tensores de parametros son identicos a la ejecucion original. Se documentan dos SHA256: el del checkpoint publicado (`dac0b155...31f7`) y el del checkpoint de entrenamiento original (`2cf139f9...36b2`). No se detallan en la informacion proporcionada ni el numero de tokens (no aplica), ni la composicion exacta del dataset mas alla del recuento de pares, ni si hubo RLHF/DPO (no procede en este dominio).

## Capacidades

- Prediccion de campos de presion 16x16 a partir de campos de permeabilidad 16x16 (surrogate de Darcy).
- Evaluacion de objetivos de caudal total negativo sobre la prediccion para seleccion secuencial.
- Soporte del bucle de muestreo de Thompson en espacio de funciones con operadores neuronales, tal como se describe en el paper.
- Reproduccion de experimentos con diez semillas y 300 consultas por semilla mediante `scripts/train.py`.
- Inferencia y calculo de metricas mediante `scripts/inference.py` y `scripts/result.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje, vision, audio ni capacidades multilingues.

## Casos de uso

- Reproduccion de resultados cientificos: ejecutar `scripts/train.py` e `scripts/inference.py` para verificar el regret reportado (0,289031 +/- 0,016963) y compararlo con la Tabla 1 del paper; util para auditar la reproducibilidad de metodos de optimizacion en espacios de funciones.
- Estudio de muestreo de Thompson con operadores neuronales: usar el checkpoint como surrogate dentro de un bucle de seleccion secuencial y medir como varia el regret con el numero de consultas y semillas.
- Benchmark de surrogates de Darcy: comparar el error relativo L2 (0,339917 en test) frente a otras aproximaciones (FEM, CNN, otros FNO) sobre la misma rejilla 16x16.
- Docencia en operadores neuronales: el paquete incluye scripts de entrenamiento e inferencia y un dataset pequeno (1.000 + 50 pares), lo que facilita montar practicas sobre mapeos campo a campo.
- Prototipado de optimizacion de caudales: emplear el objetivo de caudal total negativo como funcion a optimizar en experimentos de diseno secuencial de bajo coste computacional.
- Base para extensiones a rejillas mayores: reutilizar la configuracion y los scripts como punto de partida para experimentos con resoluciones superiores, sustituyendo los tensores de datos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la reproduccion, no una comparativa estandar de benchmarks de NLP.

| Metrica | Resultado reportado | Referencia del paper |
|---|---|---|
| Regret medio final (10 ensayos) | 0,289031 +/- 0,016963 | 0,012 +/- 0,001 (Tabla 1) |
| Error relativo L2 medio del campo de presion en test | 0,339917 | no disponible |
| Ensayos / consultas por ensayo | 10 / 300 | no disponible |
| Hardware de la ejecucion formal | 1 DCU con PyTorch | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint es de un operador neuronal sobre rejillas 16x16 y el tamano del repo es 0,0 GB, por lo que la huella deberia ser muy reducida, pero no se publica una cifra.
- GPU recomendadas: no se especifican; la ejecucion formal se hizo en una DCU con PyTorch.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- CPU: la model card indica explicitamente que no se reclama la ejecucion completa del pipeline en CPU; se recomienda un nodo con GPU/DCU asignado.
- Opciones de despliegue: scripts PyTorch propios (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la informacion disponible. Como referencia contextual, el propio paper (arXiv:2506.21894) compara el enfoque de muestreo de Thompson en espacios de funciones con operadores neuronales frente a alternativas de optimizacion, pero no se dispone aqui de cifras de otros checkpoints para tabular.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NOTS-DarcyFlowRate | no disponible | no aplica (16x16) | regret 0,289031 +/- 0,016963; L2 0,339917 | other | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- El regret reproducido (0,289031) esta muy lejos del reportado en el paper (0,012 +/- 0,001); la model card lo declara explicitamente como intento de reproduccion y no como reclamacion de precision.
- El error relativo L2 en test es alto (0,339917), lo que limita su uso como surrogate de alta fidelidad.
- Dominio y resolucion muy restringidos: rejillas de 16x16 y problema de Darcy; no hay evidencia de generalizacion a otras resoluciones o fisicas.
- El dataset no se aloja en Hugging Face; hay que descargarlo de ModelScope, lo que anade una dependencia externa.
- La ejecucion completa del pipeline no esta validada en CPU; se requiere GPU/DCU.
- Licencia "other": no se detallan los terminos exactos en la informacion proporcionada, por lo que el uso comercial debe verificarse antes de adoptarlo.
- El checkpoint publicado difiere del original en la huella de configuracion (rutas), aunque los tensores de parametros son identicos; el hash archivado en `results/inference_metrics.json` corresponde al original y se regenera al reejecutar inferencia.
- Riesgo de sobreinterpretacion: los resultados corresponden a diez semillas y 300 consultas; la varianza reportada (+/- 0,016963) debe tenerse en cuenta al comparar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/NOTS-DarcyFlowRate
- Paper: https://arxiv.org/abs/2506.21894
- Dataset en ModelScope: https://www.modelscope.cn/datasets/OneScience/NOTS-Darcy-16
- Datos originales de los autores de NOTS: https://github.com/csiro-funml/nots/tree/main/data
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio OneSkills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio OneSkills en Gitee: https://gitee.com/onescience-ai/oneskills
