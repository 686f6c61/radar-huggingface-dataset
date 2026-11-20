# mahf708/vit-interp-e3sm

## Resumen

`vit-interp-e3sm` es un emulador neuronal del modelo climatico E3SMv3 (atmosfera a 1°, configuracion AMIP) desarrollado por el autor de Hugging Face `mahf708` (vinculado al LCRC de Argonne National Laboratory, segun la URL de resultados). El modelo recibe el estado atmosferico en un instante dado y predice la tendencia (delta) a 6 horas vista, sustituyendo el paso del solver fisico del modelo por una pasada de un Vision Transformer.

Se trata de un artefacto de investigacion disenado explicitamente para ser "desmontado": su proposito principal es servir de banco de pruebas para interpretabilidad de mecanismos de atencion, circuitos de aristas (Vi-CD) y tests de leyes fisicas (LAWFUL) mediante la libreria `exege`. No es un modelo de lenguaje ni un emulador climatico de proposito general, sino una pieza de laboratorio con dos versiones entrenadas (v1 y v2) sobre datos de reanalisis/simulacion de E3SMv3.

La relevancia actual reside en su tamano extremadamente reducido (16,2 M parametros) y su arquitectura casi vanilla, lo que lo convierte en un objeto de estudio manejable para analizar como un transformer aprende dinamica atmosferica, a costa de una capacidad predictiva limitada y de una deriva apreciable en integraciones largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) pre-LayerNorm, atencion global, decoder lineal |
| Parametros totales | 16,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4050 tokens (parches 4°×4° sobre la rejilla de 1°) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo climatico, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`v1/v1.pt`, `v2/v2.pt`) |
| Entradas | 34 campos prognosticos (PS, TS; T, U, V y agua total en 8 niveles) + 5 forzamientos |
| Salidas | Tendencia a 6 horas (delta), con correcciones de conservacion externas a la red |
| Bloques / cabezas / dimension | 8 bloques, 6 cabezas, dim 384 |
| Resolucion / configuracion | 1°, AMIP, E3SMv3 |

## Arquitectura y entrenamiento

El modelo es un transformer de vision casi estandar: divide el campo atmosferico en parches de 4°×4°, lo que produce 4050 tokens, anade un embedding de posicion aprendido y procesa la secuencia con 8 bloques pre-LayerNorm de 6 cabezas de atencion global y dimension 384, seguidos de un decoder lineal. El estado se propaga paso a paso (rollout) y las correcciones de conservacion se aplican fuera de la red, de modo que la red solo aprende la tendencia a 6 horas. La version v2 anade una convolucion 3×3 en la salida, 10 salidas diagnosticas adicionales y correctores de estilo ACE en la funcion de perdida.

En cuanto a los datos, el modelo se entrena con salidas de E3SMv3 (no incluidas en el repositorio). La v1 usa el periodo 2000-2009 con perdida MSE y un esquema de entrenamiento de un paso seguido de rollouts de 4 y 8 pasos. La v2 amplia el periodo a 1980-2009, incorpora ruido en la entrada, EMA de pesos y los correctores citados. No se documenta el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF/DPO (no aplicable a este dominio).

## Capacidades

- Emulacion de la dinamica atmosferica de E3SMv3: predice la tendencia a 6 horas de 34 campos prognosticos a partir del estado actual y 5 forzamientos.
- Rollout multi-paso: el estado se realimenta para integraciones de varios dias, con habilidad decreciente.
- Interpretabilidad de mecanismos: analisis de cabezas de atencion y circuitos de aristas (Vi-CD) mediante `exege`.
- Verificacion de leyes fisicas: soporte de tests LAWFUL sobre el comportamiento interno del modelo.
- Versionado con evaluacion comparada: v1 y v2 incluyen evaluaciones completas (`v*/eval_2010.md`) con runs libres de un ano y habilidad a 1-10 dias.
- No soporta tool calling, function calling, agentes, capacidades multilingues ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en interpretabilidad de transformers: el modelo es lo bastante pequeno (16,2 M parametros) para inspeccionar todas las cabezas y circuitos de atencion en un solo equipo, usando `exege` y el explorador de arquitectura publicado.
- Analisis de circuitos fisicos (Vi-CD): identificar que subconjuntos de aristas o cabezas codifican relaciones entre variables atmosfericas (por ejemplo, acoplamiento temperatura-viento) y validarlos con tests LAWFUL.
- Benchmark de metodos de interpretabilidad: servir de caso de control "casi vanilla" frente a emuladores climaticos mas grandes y opacos, permitiendo comparar tecnicas de atribucion.
- Prototipado rapido de emuladores climaticos: la receta de entrenamiento (MSE + rollouts multi-paso, correctores ACE, EMA, ruido de entrada) es reutilizable para otros modelos de circulacion.
- Docencia y divulgacion: un emulador de 0,5 GB que cabe en cualquier GPU consumer permite demostrar como un transformer aprende dinamica fisica sin infraestructura HPC.
- Evaluacion de deriva en integraciones largas: estudiar el comportamiento de la v2 (sesgo humedo y frio a partir de varios meses) como caso de estudio de estabilidad en modelos autorregresivos.

## Benchmarks y rendimiento

Los unicos datos publicados son las ACC (anomaly correlation coefficient) a 5 dias sobre el ano 2010 para cuatro variables:

| Version | Periodo de entrenamiento | Receta | ACC 5 dias PS / T_7 / U_3 / V_3 |
|---|---|---|---|
| v1 | 2000-2009 | MSE, 1 paso + rollouts 4 y 8 pasos | 0,87 / 0,84 / 0,83 / 0,78 |
| v2 | 1980-2009 | + 10 salidas diagnosticas, correctores ACE, conv 3×3, EMA, ruido de entrada | 0,92 / 0,89 / 0,87 / 0,84 |

No se han publicado resultados de benchmarks frente a otros emuladores (MMLU, HumanEval, GSM8K u otros no aplican). Las evaluaciones completas por version estan en `v*/eval_2010.md` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 16,2 M parametros; el repositorio completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien cabe en CPU para inferencia puntual.
- Cabe en GPU consumer: si, sin restricciones practicas por memoria.
- Opciones de despliegue: PyTorch nativo mediante `vit_interp.emulator.Emulator.load`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros emuladores climaticos neuronales (por ejemplo, emuladores basados en U-Net, GraphCast o FourCastNet), ni datos de rendimiento de los mismos en este contexto.

## Limitaciones y advertencias

- Deriva en integraciones largas: los runs libres se desvian tras varios meses; la v2 presenta sesgo humedo y frio. Las preguntas de pocos dias son las que dan respuestas mas limpias.
- Artefacto de investigacion en progreso: el autor lo describe explicitamente como "research artifact, work in progress", no como modelo listo para produccion.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial queda sin autorizacion clara.
- Datos de entrenamiento no incluidos: las salidas de E3SMv3 no se distribuyen con el repositorio, lo que limita la reproducibilidad completa.
- Alcance restringido: solo atmosfera a 1° en configuracion AMIP; no cubre oceano, hielo marino ni otras componentes del sistema climatico.
- Sin documentacion de sesgos: no se han publicado analisis de sesgo espacial o estacional mas alla de las ACC y la deriva mencionada.
- Riesgo de alucinacion en sentido climatico: al ser un emulador autorregresivo, puede generar estados fisicamente inconsistentes en rollouts largos, mitigado parcialmente por las correcciones de conservacion externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahf708/vit-interp-e3sm
- Resultados, explorador de arquitectura y notebooks: https://web.lcrc.anl.gov/public/e3sm/diagnostic_output/ac.ngmahfouz/vit-interp/
- Repositorio de codigo y libreria `exege`: https://github.com/mahf708/exege
