# OneScience-Group/CLM5-Emulator

## Resumen

CLM5-Emulator es un emulador de aprendizaje automático del modelo de superficie terrestre Community Land Model version 5 (CLM5). Desarrollado por investigadores de NCAR y CERFACS, sustituye parte de las simulaciones físicas de CLM5 por dos redes neuronales feed-forward independientes que predicen las componentes espaciales (modos EOF) de la producción primaria bruta (GPP) y del flujo de calor latente (LHF) a partir de seis parámetros biofísicos. La publicación de este repositorio en HuggingFace corre a cargo de OneScience-Group y se presenta explícitamente como una reproducción de ingeniería independiente de las especificaciones públicas del emulador original.

El problema que resuelve es de coste computacional: ejecutar CLM5 completo para explorar el espacio de parámetros biofísicos o para calibrar el modelo contra observaciones es muy caro. Un emulador entrenado sobre ensembles de perturbación de parámetros permite explorar ese espacio en una fracción del tiempo y con un error acotado, habilitando tareas de estimación de parámetros y reconstrucción de campos globales que de otro modo requerirían grandes clústeres.

La arquitectura es una red neuronal feed-forward (MLP) implementada en PyTorch, no un transformer ni un modelo generativo. La entrada es un vector de seis parámetros normalizados y acotados (`[B,6]`); la salida son componentes EOF (forma `[8,2,3]`) que se reescalan a campos espaciales globales en una rejilla lógica de 4 por 5 grados (forma `[8,2,46,72]`). No se especifican en la información disponible el número de capas, neuronas por capa ni el total de pesos del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward (MLP); dos redes independientes, una para GPP y otra para LHF |
| Parametros totales | no disponible (no se indica el número de pesos de las redes) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de regresión con entrada de 6 valores, no generativo) |
| Tipos de cuantizacion | no disponible (no se documentan formatos cuantizados) |
| Idiomas soportados | ingles (segun metadatos de HuggingFace); el modelo no procesa lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch; checkpoint en `result/checkpoints/clm5_emulator.pt` |
| Framework | PyTorch |
| Entradas | Vector de 6 parametros biofisicos normalizados y acotados (`[B,6]`) |
| Salidas | Componentes EOF `[8,2,3]` y campos espaciales reconstruidos `[8,2,46,72]` |
| Rejilla espacial | Rejilla logica de 4 por 5 grados (46 x 72) |
| Variables objetivo | GPP (produccion primaria bruta) y LHF (flujo de calor latente) |
| Datos de entrenamiento | Ensembles de perturbacion de parametros de CLM5 forzados con GSWP3; objetivos observacionales FLUXNET-MTE |
| Paper de referencia | A machine learning approach to emulation and biophysical parameter estimation with the Community Land Model, version 5 (ASCMO, 2020) |
| Descargas / likes | 0 / 0 a fecha de consulta |
| Fecha de publicacion | 16 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo consta de dos redes feed-forward independientes que emulan, respectivamente, las componentes espaciales de GPP y de LHF. La entrada son seis parámetros biofísicos que se sitúan en un espacio normalizado y acotado; la salida son coeficientes de funciones empíricas ortogonales (EOF) que, combinados con las EOF espaciales, reconstruyen campos globales sobre la rejilla lógica de 4 por 5 grados. Durante el entrenamiento ambas redes objetivo participan en la retropropagación. No se documentan en la información disponible el número de capas, las funciones de activación, el optimizador ni el número de épocas.

Los datos de entrenamiento proceden de ensembles de perturbación de parámetros de CLM5 forzados con GSWP3, con FLUXNET-MTE como referencia observacional de las variables objetivo. No se indica en la model card si hubo ajuste fino con RLHF o DPO (no aplicable a un modelo de regresión) ni el número total de muestras del ensemble. El repositorio de OneScience incluye además un script de generación de datos sintéticos (`scripts/fake_data.py`) que preserva la estructura de entradas `[B,6]`, los objetivos independientes de GPP y LHF, los tres modos EOF y la rejilla lógica de 4 por 5 grados, de modo que el pipeline completo (entrenamiento, inferencia y evaluación) se puede validar sin los datos originales. La verificación incluye la comprobación de que las salidas de inferencia son finitas y tienen las formas declaradas.

## Capacidades

- Emulación de la respuesta biofísica global de CLM5 para las variables GPP y LHF a partir de seis parámetros biofísicos.
- Estimación de parámetros acotada: búsqueda en el espacio normalizado de parámetros para ajustar el emulador a objetivos observacionales.
- Reconstrucción espacial: generación de campos globales de las variables objetivo a partir de las componentes EOF predichas.
- Modelización sustitutiva (surrogate modeling) para análisis de sensibilidad y exploración de ensembles de parámetros.
- Entrenamiento distribuido en múltiples GPU o DCU mediante `torchrun` (DDP), verificado con dos procesos en un nodo.
- Ejecución en CPU para validación de conectividad con la configuración de muestra pequeña.
- Compatibilidad con el ecosistema OneScience para flujos estructurados de validación de datos, entrenamiento, inferencia, métricas y visualización.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas ni capacidades de visión o audio.

## Casos de uso

- Exploración del espacio de parámetros biofísicos: en lugar de lanzar cada configuración contra CLM5 completo, se evalúan miles de combinaciones de los seis parámetros con las redes feed-forward, y solo las candidatas prometedoras se validan con el modelo físico.
- Calibración contra observaciones FLUXNET-MTE: la búsqueda acotada en el espacio de parámetros permite encontrar configuraciones que aproximen los objetivos observacionales, usando el emulador como función de coste barata dentro del bucle de optimización.
- Reconstrucción de campos globales de GPP y LHF: a partir de las componentes EOF predichas (`[8,2,3]`) se reconstruyen mapas de 46 x 72 celdas, útil para comparar patrones espaciales entre configuraciones de parámetros.
- Análisis de sensibilidad e incertidumbre: ejecutar ensembles sobre el rango acotado de cada parámetro para cuantificar cuánto cambia la respuesta de GPP y LHF, algo inviable si cada muestra requiere una simulación completa de CLM5.
- Docencia y prototipado en ciencias de la Tierra: el script de datos sintéticos y la ejecución en CPU permiten montar un flujo completo de entrenamiento e inferencia en un portátil para ilustrar emulación de modelos climáticos.
- Validación de infraestructura de entrenamiento distribuido: sirve como caso de prueba reproducible para pipelines con `torchrun` y DDP en configuraciones GPU o DCU (DTK 25.04.2) dentro del ecosistema OneScience.
- Integración en pipelines de asimilación o comparación de productos: los campos reconstruidos se pueden contrastar con productos derivados de datos satelitales o de reanálisis para detectar desviaciones sistemáticas del emulador.
- Precribado en estudios de atribución: filtrar rápidamente regiones y combinaciones de parámetros sensibles antes de invertir cómputo en simulaciones físicas completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error (por ejemplo RMSE, R² o sesgo) para GPP o LHF, ni comparaciones cuantitativas frente a CLM5. El paper de referencia (ASCMO, 2020, DOI 10.5194/ascmo-6-223-2020) es la fuente donde presumiblemente se documentan estas métricas, pero sus cifras no están recogidas en la información proporcionada. Cualquier afirmación de precisión del emulador debería verificarse contra ese paper y contra una ejecución de CLM5 con la misma configuración.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por la naturaleza del modelo (redes feed-forward sobre entradas de 6 valores), el requisito es muy bajo, pero no se publica una cifra.
- GPU o DCU recomendadas: la model card recomienda GPU o DCU, pero no especifica modelos concretos (A100, H100, RTX 4090, etc.). Para DCU se requiere DTK 25.04.2 o una versión compatible recomendada por OneScience.
- Ejecución en CPU: soportada para validación de conectividad con la configuración de muestra pequeña; no se garantiza para entrenamiento completo.
- GPU de consumo: no confirmado en la información disponible; por el tamaño del modelo es previsible que quepa en cualquier GPU de consumo, pero esto no está verificado por el autor.
- Entrenamiento multi-GPU: verificado con dos procesos en un solo nodo mediante `torchrun --nproc_per_node=2 --nnodes=1`.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue se realiza con scripts de PyTorch: `scripts/train.py`, `scripts/inference.py`, `scripts/result.py`, y el paquete `onescience[earth-gpu]` o `onescience[earth-dcu]` instalado con Python 3.11.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Coste computacional | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CLM5-Emulator (este modelo) | Emulador ML (dos redes feed-forward, PyTorch) | 6 parametros biofisicos normalizados | Componentes EOF de GPP y LHF; campos globales 46 x 72 | Muy bajo; entrenamiento DDP verificado con 2 procesos y ejecucion en CPU posible para validacion | Apache 2.0 (repositorio); paper CC BY 4.0 | HuggingFace (0 descargas, 0 likes a fecha de consulta) |
| CLM5 (modelo fisico) | Modelo de superficie terrestre basado en procesos | Forzamiento meteorologico completo (por ejemplo GSWP3) y parametrizaciones | Estado completo del sistema tierra-superficie, incluidas GPP y LHF | Alto; requiere HPC para ensembles y calibracion | Sujeta a los terminos del propio modelo CLM5 | Distribucion fuera de HuggingFace; no disponible en el repositorio analizado |
| Otros emuladores ML de CLM5 | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones, no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier uso conversacional es un error de categoría.
- Dominio muy restringido: solo emula dos variables (GPP y LHF) de CLM5 en función de seis parámetros biofísicos. No emula el resto del estado del modelo ni otras variables de superficie.
- Riesgo de extrapolación: la estimación de parámetros opera en un espacio normalizado y acotado; los resultados fuera de ese rango no están validados y pueden degradarse sin aviso.
- Resolución espacial fija: la reconstrucción se realiza sobre una rejilla lógica de 4 por 5 grados (46 x 72). No es adecuada para análisis regionales de alta resolución.
- Dependencia del entrenamiento: el emulador se entrenó con ensembles de CLM5 forzados con GSWP3 y objetivos FLUXNET-MTE, por lo que hereda los sesgos de esas fuentes y no es fiable bajo condiciones de forzamiento distintas.
- Procedencia: el repositorio se declara como una reproducción de ingeniería independiente de las especificaciones públicas del emulador, no como la implementación oficial de NCAR o CERFACS. La exactitud respecto al modelo original no está verificada en la información disponible.
- Datos sintéticos en la validación: el flujo documentado (`scripts/fake_data.py`) usa datos sintéticos que preservan la estructura del problema; superar esa validación no implica que el modelo funcione con datos reales sin un reentrenamiento adecuado.
- Licencias de los datos: aunque el repositorio es Apache 2.0 y el paper es CC BY 4.0, CLM5, GSWP3 y FLUXNET-MTE mantienen sus propias licencias y términos, lo que puede condicionar el uso comercial de modelos derivados.
- Falta de validación por la comunidad: 0 descargas y 0 likes en HuggingFace a fecha de consulta; no hay evidencia externa de reproducibilidad ni de rendimiento en producción.
- Ausencia de métricas publicadas en la model card: no se pueden citar errores de emulación concretos sin acudir al paper original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/CLM5-Emulator
- Paper de referencia: https://doi.org/10.5194/ascmo-6-223-2020
- Repositorio principal en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos eran foros de soporte técnico sin relación). Todos los enlaces listados proceden de la model card del autor.
