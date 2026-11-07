# nonberew/suss-models

## Resumen

SUSS es una familia de transformadores tipo GPT de pequeno tamano (entre 0,1 M y 3,2 M de parametros, mas los modelos de referencia) entrenados desde cero para adaptarse *in-context* a dinamicas fisicas que no han visto durante el entrenamiento. El autor es Anuar Zhambakin, que publica los pesos junto al articulo *What a Transformer Learns When It Adapts to Unknown Physics In-Context: Probing, Patching and Controlling* (preprint de 2026, sin revision por pares). El modelo resuelve un problema de identificacion de sistemas y control adaptativo: dado un flujo de observaciones (estado, accion), predecir el siguiente estado sin reentrenar.

El interes no es de aplicacion industrial sino de investigacion en interpretabilidad mecanistica: el articulo localiza las estadisticas suficientes para la adaptacion en la memoria clave-valor de atencion de los dos ultimos bloques, e informa de que el mecanismo pre-registrado (una estimacion de parametros en el residual stream) fue rechazado con un R^2 de sonda de 0,19. En sistemas lineales el predictor sigue al predictor de Bayes exacto cuando hay pocos datos y se estabiliza en 1,59 veces el exceso de riesgo de Bayes. Los checkpoints se distribuyen en formato PyTorch (.pt) bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT (decodificador, entrenado desde cero) |
| Parametros totales | 0,1 M a 3,2 M (rango de la familia; tabla completa en `MODELS.md`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (episodios de control; no se especifica en tokens) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; entrada numerica) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoints con `cfg` y `state`) |

## Arquitectura y entrenamiento

Transformadores estilo GPT de decodificador, con configuracion definida en `GPTConfig` (fichero `model.py`). La entrada por paso es un vector de tres componentes `(x1, x2, u)` (dos variables de estado y la accion de control) y la salida es un vector de dos componentes con el siguiente estado predicho. El entrenamiento es desde cero, sobre episodios generados de sistemas lineales con matrices (A, B) desconocidas, sistemas MuJoCo con contacto (pendulo, bloque empujado, pelota que bota) y tareas de control adaptativo lineal. No se indica en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF o DPO (no aplica a este dominio).

La innovacion tecnica del trabajo no esta en la arquitectura sino en el analisis: mediante sondas lineales y experimentos de *patching* con controles de dimension, el autor muestra que las estadisticas suficientes para la adaptacion residen en la memoria clave-valor de atencion de los dos ultimos bloques. Intercambiar solo esas claves y valores entre episodios transfiere entre el 91 % y el 94 % del comportamiento, replicado sobre 10 semillas.

## Capacidades

- Prediccion del siguiente estado en sistemas dinamicos desconocidos, a partir de un historial de estados y acciones dentro del propio contexto.
- Adaptacion in-context a dinamicas no vistas, sin actualizacion de pesos.
- Identificacion implicita de sistemas lineales con (A, B) desconocidas.
- Modelado de sistemas con contacto en MuJoCo (pendulo, bloque empujado, pelota que bota).
- Control adaptativo lineal (checkpoints de `runs/c/`).
- Baseline sin contexto basado en MLP para comparacion.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: reproducir el analisis de *probing* y *patching* sobre los checkpoints publicados para estudiar como un transformer almacena estadisticas suficientes en la memoria clave-valor.
- Estudio de adaptacion in-context en fisica: usar los episodios de sistemas lineales de `runs/a/` para medir la brecha frente al predictor de Bayes (1,59x de exceso de riesgo) con distintas semillas.
- Experimentos de control adaptativo en simulacion: emplear los checkpoints de `runs/c/` como controlador in-context frente a baselines de ganancia constante.
- Docencia y prototipado rapido: el cuaderno de inicio rapido reproduce las cifras principales en CPU en pocos minutos, lo que permite usarlo en practicas de aprendizaje automatico sin GPU.
- Validacion de metodologia de pre-registro: el repositorio incluye el pre-registro del articulo, util como caso de estudio de ciencia reproducible cuando el mecanismo hipotetizado se rechaza.
- Benchmark de juguete para tecnicas de *patching*: los modelos de 0,1 M a 3,2 M permiten barrer tamanos (`runs/scale/`) y comparar metodos de intervencion con coste computacional minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el formato habitual (MMLU, HumanEval, GSM8K). Los unicos resultados cuantitativos del articulo son:

| Metrica | Resultado |
|---|---|
| Exceso de riesgo frente al predictor de Bayes (sistemas lineales) | 1,59x |
| R^2 de la sonda del mecanismo pre-registrado (estimacion de parametros en residual stream) | 0,19 (mecanismo rechazado) |
| Transferencia de comportamiento al intercambiar claves y valores de los dos ultimos bloques | 91-94 % |
| Semillas de replicacion del experimento de patching | 10 |

## Requisitos de hardware

- Inferencia en CPU: el cuaderno de inicio rapido reproduce las cifras principales en CPU en pocos minutos; el modelo mayor tiene 3,2 M de parametros.
- VRAM estimada: inferior a 1 GB en cualquier configuracion razonable; los checkpoints caben holgadamente en memoria del sistema.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: PyTorch nativo cargando los `.pt` con `torch.load` y `model.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo, la latencia por paso es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SUSS | 0,1-3,2 M | no disponible | Adaptacion in-context a fisica, interpretabilidad | MIT | Hugging Face, GitHub |
| Baseline MLP sin contexto (incluido en SUSS) | no disponible | no aplica | Prediccion sin historial | MIT | Incluido en el repositorio |
| Controlador de ganancia constante (incluido en SUSS) | no disponible | no aplica | Control clasico | MIT | Incluido en el repositorio |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion sin revision por pares (preprint de 2026); los resultados deben tratarse como provisionales.
- El mecanismo pre-registrado fue rechazado (R^2 = 0,19); la explicacion alternativa (claves y valores de los dos ultimos bloques) es exploratoria.
- Ambito muy restringido: sistemas lineales y tres entornos MuJoCo; no generaliza a otros dominios sin validacion.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes.
- Riesgo de alucinacion en el sentido de extrapolacion incorrecta fuera de la distribucion de episodios de entrenamiento; no hay evaluacion publicada de robustez fuera de dominio.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia MIT: permite uso comercial, pero el modelo no esta pensado ni validado para produccion.
- El repositorio de Hugging Face registra 0 descargas y 1 like en la fecha de consulta, lo que indica ausencia de validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/nonberew/suss-models
- Repositorio GitHub (codigo, articulo y pre-registro): https://github.com/nonberw/suss
- Demo en navegador: https://nonberw.github.io/suss/demo/
- Cuaderno de inicio rapido: https://github.com/nonberw/suss/blob/main/notebooks/quickstart.ipynb
- DOI del preprint: https://doi.org/10.5281/zenodo.24031898
