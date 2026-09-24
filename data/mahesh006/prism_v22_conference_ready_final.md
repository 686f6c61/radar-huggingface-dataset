# mahesh006/PRISM_V22_CONFERENCE_READY_FINAL

## Resumen

PRISM_V22_CONFERENCE_READY_FINAL es un artefacto de reproducibilidad publicado en Hugging Face por el usuario mahesh006 (Mahesh Vasamsetti). No es un modelo de lenguaje generativo, sino un paquete de codigo, configuraciones y checkpoints asociado a un benchmark de inferencia basada en simulacion (simulation-based inference, SBI) que compara un metodo propuesto, PRISM, con cuatro lineas base: FMPE, cINN, NPE-MDN y NPE-NSF.

El repositorio ocupa aproximadamente 0,8 GB y la model card describe un protocolo experimental cerrado: 9 conjuntos de datos, un unico presupuesto de entrenamiento (n_train = 3000), semillas emparejadas 10, 11 y 12, 5 metodos y 135 ajustes (fits) en total. PRISM estima distribuciones posteriores amortizadas: transforma parametros restringidos a coordenadas sin restriccion, aprende una localizacion y una escala condicionales no lineales a partir de la observacion, estandariza el residuo, aplica blanqueo de correlacion y modela la posterior residual con una base de mezcla gaussiana condicional mas un flujo normalizador continuo residual.

La relevancia es metodologica: la version final incorpora simetrias exactas conocidas del simulador para Two Moons (2 modos) y SLCP (4 modos de signo), y sustituye el orden arbitrario de las cuatro observaciones gaussianas i.i.d. de SLCP por el estadistico suficiente gaussiano exacto de 5 dimensiones (media 2-D mas las tres entradas unicas de segundos momentos centrados). No se publican resultados numericos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Metodo PRISM para estimacion posterior amortizada: mapeo de parametros restringidos a coordenadas sin restriccion, localizacion y escala condicionales no lineales, estandarizacion del residuo, blanqueo de correlacion, base de mezcla gaussiana condicional y flujo normalizador continuo residual |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplicable a un benchmark de SBI) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta redactada en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio incluye checkpoints, pero no se especifica el formato de serializacion) |

## Arquitectura y entrenamiento

El benchmark cubre 9 tareas: Gaussian Linear, Two Moons, SLCP, Oscillator, Lotka-Volterra, Deconv64, Darcy, Burgers y Helmholtz. Cada tarea se entrena con un presupuesto fijo de n_train = 3000 y se evalua con semillas emparejadas 10, 11 y 12, lo que da lugar a 135 ajustes para los 5 metodos. `configs/full.json` es la unica configuracion congelada de la ejecucion completa y preserva el flujo original del benchmark V22 (`data_stream.seed=190908`), junto con la receta de simetria de Two Moons y la receta final de simetria de signo mas estadisticos suficientes de 5 dimensiones para SLCP. La seleccion de checkpoints usa el error relativo inverso L2 de la media posterior de validacion, sujeto a guardarrailes de NLL y ECE.

El alcance de metricas esta acotado por tarea. ECE y CRPS se calculan en las 9 tareas. La NLL fisica esta disponible en Gaussian Linear, Two Moons, SLCP, Oscillator, Lotka-Volterra y Deconv64, y se omite intencionadamente en Darcy, Burgers y Helmholtz por ser deterministas y sin ruido. C2ST, MMD² y Energy distance² solo se calculan en las tareas con una posterior de referencia por observacion validada: Gaussian Linear, Two Moons, SLCP, Oscillator y Lotka-Volterra; el codigo no sustituye la referencia por parametros de ground-truth repetidos ni por otro modelo aprendido. El muestreo de PRISM restaura todos los modos de simetria de parametros y la log-densidad fisica usa la densidad promediada por grupos correspondiente. El versionado interno corresponde al esquema 22, variante `v22_single_prism` y version de paquete 0.15.2.

## Capacidades

- Estimacion posterior amortizada sobre simuladores cientificos: dada una observacion, produce una distribucion posterior sobre los parametros del simulador.
- Modelado de residuos con base de mezcla gaussiana condicional mas un flujo normalizador continuo residual, con blanqueo de correlacion previo.
- Explotacion explicita de simetrias exactas conocidas del simulador: 2 modos en Two Moons y 4 modos de signo en SLCP.
- Reduccion de dimensionalidad basada en estadisticos suficientes para SLCP (5-D: media 2-D mas tres segundos momentos centrados unicos).
- Calculo y reporte de metricas de calibracion y precision: ECE, CRPS, NLL fisica, C2ST, MMD² y Energy distance², segun el alcance por tarea.
- Reproducibilidad verificable mediante digests de codigo, configuracion y datos: los checkpoints y registros completados solo se reutilizan cuando los digests coinciden.
- No dispone de soporte de tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- No tiene capacidades multilingues, de vision ni de audio.
- No incorpora modo de pensamiento (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Reproduccion del benchmark en cluster: ejecutar `python reproduce.py --config configs/full.json --gpus 0 1 2 3` para regenerar los 135 trabajos en un directorio de salida nuevo, aprovechando el aislamiento de fallos por trabajo y la reutilizacion por digests.
- Seleccion de metodo de SBI para un dominio cientifico: comparar PRISM frente a FMPE, cINN, NPE-MDN y NPE-NSF bajo el mismo presupuesto de entrenamiento (n_train = 3000) para decidir que estimador posterior adoptar.
- Inferencia de parametros en modelos fisicos con simetrias: usar la receta de SLCP con estadisticos suficientes de 5 dimensiones para acelerar y estabilizar la estimacion cuando las observaciones gaussianas son i.i.d. y su orden es irrelevante.
- Analisis de sistemas dinamicos: emplear las tareas Oscillator y Lotka-Volterra para calibrar parametros de ecuaciones diferenciales a partir de observaciones ruidosas.
- Evaluacion de calibracion en produccion cientifica: usar ECE y CRPS como criterios de aceptacion antes de desplegar un estimador posterior en un pipeline de analisis.
- Diagnostico de simetrias multimodales: aplicar la receta de Two Moons (2 modos) para validar que un metodo recupera todos los modos de la posterior en lugar de colapsarlos.
- Auditoria de reproducibilidad: verificar que los digests de codigo/configuracion/datos coinciden antes de reutilizar checkpoints, como control de integridad en publicaciones.
- Estudio metodologico de PDEs deterministas: utilizar Darcy, Burgers y Helmholtz para analizar por que ciertas metricas (NLL fisica, C2ST, MMD², Energy distance²) no estan definidas sin ruido de observacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card define el alcance de las metricas (ECE, CRPS, NLL fisica, C2ST, MMD² y Energy distance²) y el protocolo de evaluacion, pero no incluye valores de rendimiento por tarea ni por metodo.

## Requisitos de hardware

- Requiere una build de PyTorch con soporte CUDA compatible con el cluster de destino; despues se instalan las dependencias bloqueadas con `pip install -r requirements-lock.txt`.
- La ejecucion completa documentada usa 4 GPU: `--gpus 0 1 2 3 --workers-per-gpu 1 --trainers-per-gpu 1 --threads 1`.
- VRAM estimada por GPU: no disponible.
- GPU recomendadas: no disponible (solo se indica compatibilidad con CUDA y un ejemplo de 4 GPU).
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; la ejecucion se realiza mediante el script `reproduce.py` sobre PyTorch.
- Latencia y throughput: no disponible. El inventario esperado de la ejecucion completa es de 135 trabajos.
- Tamano del repositorio: aproximadamente 0,8 GB.

## Comparativa con modelos similares

| Metodo | Rol en el benchmark | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|
| PRISM | Metodo propuesto | no disponible | incluido en el repositorio | no disponible |
| FMPE | Linea base | no disponible | incluido en el repositorio | no disponible |
| cINN | Linea base | no disponible | incluido en el repositorio | no disponible |
| NPE-MDN | Linea base | no disponible | incluido en el repositorio | no disponible |
| NPE-NSF | Linea base | no disponible | incluido en el repositorio | no disponible |

No se dispone de comparativas externas con otros proyectos denominados PRISM, ya que corresponden a trabajos distintos (vease la seccion de enlaces).

## Limitaciones y advertencias

- No se declara licencia en la informacion disponible, por lo que no puede asumirse permiso de uso comercial ni de redistribucion.
- No se publican resultados numericos, de modo que no es posible validar la superioridad de PRISM frente a las lineas base con los datos facilitados.
- No es un modelo de lenguaje: no admite prompts, tool calling, agentes ni generacion de texto.
- Las metricas no son universales: la NLL fisica y las metricas basadas en referencia (C2ST, MMD², Energy distance²) estan limitadas a un subconjunto de tareas y se omiten de forma intencionada en Deconv64 y en las tres PDEs deterministas.
- La reproducibilidad depende de que coincidan los digests de codigo, configuracion y datos; cambios en el entorno o en los ficheros invalidan la reutilizacion de checkpoints.
- Requiere entorno CUDA; la ejecucion completa documentada asume 4 GPU, lo que implica coste de computo y planificacion de recursos.
- La generacion de referencia de SLCP utiliza un muestreador de importancia condicional de produccion con puertas de calidad estrictas, lo que anade dependencia de esa implementacion.
- Existe riesgo de confusion con otros proyectos llamados PRISM (editor LaTeX de OpenAI, PRISM de evaluacion de instrucciones y PRISM de deteccion de anomalias en video), que no guardan relacion con este repositorio.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/mahesh006/PRISM_V22_CONFERENCE_READY_FINAL
- Perfil del autor en Hugging Face: https://huggingface.co/mahesh006/datasets
- prism-eval (proyecto PRISM distinto, evaluacion de instrucciones desde activaciones, EMNLP 2026): https://github.com/Offensive-AI-Lab/prism-eval
- ICML2026-PRISM (proyecto PRISM distinto, deteccion de anomalias en video): https://github.com/ytC2026/ICML2026-PRISM
- OpenAI Prism (producto distinto, editor LaTeX con IA): https://openai.com/prism/ y https://prism.openai.com/
