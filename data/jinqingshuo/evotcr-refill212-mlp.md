# JinQingshuo/EvoTCR-Refill212-MLP

## Resumen

EvoTCR-Refill212-MLP es un conjunto de pesos publicado en Hugging Face por el usuario JinQingshuo bajo el identificador `JinQingshuo/EvoTCR-Refill212-MLP`. Segun la model card, contiene "los parametros del factor congelado de EvoTCR y los pesos de un modelo MLP de cinco semillas" (traduccion del chino original: 冻结因子参数与五种子 MLP 模型权重). No se trata, por tanto, de un modelo de lenguaje generativo, sino de artefactos de pesos asociados a un pipeline de aprendizaje automatico, presumiblemente orientado a datos de receptores de celulas T (TCR) dado el nombre "EvoTCR".

El repositorio tiene un tamano de 0,1 GB, cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 9 de noviembre de 2026. La licencia declarada es `alphafold3-output-terms`, que remite a los terminos de uso de las salidas de AlphaFold 3 de Google DeepMind. No se dispone de informacion publica sobre arquitectura, numero de parametros, contexto, idiomas ni benchmarks.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigacion de nicho, sin documentacion tecnica sustantiva ni resultados publicados, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona un MLP de cinco semillas junto a "parametros del factor congelado de EvoTCR") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | alphafold3-output-terms (otros; enlace a los terminos de salida de AlphaFold 3) |
| Formato de pesos | no disponible (el repo pesa 0,1 GB; no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

La unica informacion disponible indica que el repositorio contiene dos componentes: los "parametros del factor congelado" de EvoTCR y los pesos de un modelo MLP entrenado con cinco semillas. El termino "factor congelado" sugiere un modulo preentrenado cuyos pesos se mantienen fijos durante el entrenamiento posterior, mientras que el MLP de cinco semillas apunta a un ensemble de cinco inicializaciones aleatorias distintas para reducir varianza en las predicciones.

No se especifica la arquitectura del componente EvoTCR (transformer, red convolucional, modelo de grafos o hibrido), ni el volumen o composicion de los datos de entrenamiento, ni si se emplearon tecnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se detalla ninguna innovacion tecnica adicional. Toda esta seccion queda, por tanto, sin datos verificables.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues.
- Capacidad inferida por el nombre: modelado o prediccion sobre datos de receptores de celulas T (TCR), presumiblemente en el contexto de EvoTCR.
- El unico componente con funcion descrita explicitamente es un MLP de cinco semillas, orientado a prediccion supervisada.

## Casos de uso

- Investigacion en inmunologia computacional: uso de los pesos como punto de partida para reproducir o extender experimentos sobre receptores de celulas T, dado el nombre del modelo y la referencia a EvoTCR.
- Ensemble de prediccion con cinco semillas: el MLP de cinco semillas puede emplearse para promediar predicciones y reducir la varianza en tareas de clasificacion o regresion supervisada.
- Reutilizacion de un extractor congelado: los "parametros del factor congelado" pueden servir como representacion fija de entrada para otros cabezales ligeros en experimentos de transferencia.
- Baseline en comparativas academicas: al ser un artefacto pequeno (0,1 GB), puede desplegarse en CPU para servir como referencia frente a modelos mas complejos.
- Prototipado rapido en entornos sin GPU: el tamano reducido permite cargar los pesos en memoria de un portatil convencional para pruebas iniciales.
- Auditoria y estudio de licencias: util para analizar las implicaciones de la licencia `alphafold3-output-terms` en la redistribucion de pesos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos 1-2 GB de memoria libre seria suficiente.
- Cabe en GPU consumer: si, practicamente en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), asi como en CPU.
- Opciones de despliegue: no se documentan; al no ser un modelo de lenguaje, no aplican vLLM, llama.cpp, Ollama ni TGI. Requiere el codigo especifico del autor, no publicado en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria, y el caracter de nicho del artefacto (pesos de un pipeline propietario de investigacion) dificulta establecer equivalencias.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card sustantiva, ni paper, ni repositorio de codigo enlazado, lo que impide verificar la arquitectura y el funcionamiento.
- Cero descargas y cero likes: no existe evidencia de uso comunitario ni de validacion externa.
- Licencia restrictiva y poco convencional: `alphafold3-output-terms` remite a los terminos de uso de las salidas de AlphaFold 3, que imponen condiciones especificas sobre el uso comercial y la redistribucion; es imprescindible revisarlos antes de cualquier aplicacion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de sobreinterpretar el nombre "EvoTCR" sin evidencia documental.
- Idiomas: no se declaran; no procede evaluacion multilingue.
- Contexto: no disponible; no aplica a un MLP.
- Sin garantias de reproducibilidad: al no publicarse el codigo de entrenamiento ni los datos, los resultados no son verificables de forma independiente.
- Fecha de creacion futura (2026-11-09): conviene confirmar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JinQingshuo/EvoTCR-Refill212-MLP
- Perfil de GitHub del autor: https://github.com/JinQingshuo
- Terminos de uso de las salidas de AlphaFold 3: https://github.com/google-deepmind/alphafold3/blob/main/OUTPUT_TERMS_OF_USE.md
