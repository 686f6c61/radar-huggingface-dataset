# Anbeeld/Ling-3.0-flash-DSpark-GGUF

## Resumen

El modelo **Ling-3.0-flash-DSpark-GGUF** es una cuantizacion GGUF del modelo de borrador **DSpark** de inclusionAI, disenado para acelerar la inferencia del modelo **Ling-3.0-flash** mediante decodificacion especulativa. No es un modelo autonomo de generacion de texto, sino un componente auxiliar que genera tokens candidatos que el modelo objetivo verifica y acepta o rechaza, reduciendo la latencia y aumentando el throughput en despliegues de produccion.

Desarrollado por Anbeeld sobre el modelo base `inclusionAI/Ling-3.0-flash-dspark`, este borrador presenta una arquitectura ligera de 5 capas de atencion completa, con un tamano oculto de 2560 y atencion MHA de 32 cabezas de consulta y 32 de clave/valor. El modelo admite una longitud de contexto maxima de 262.144 posiciones. El repositorio contiene los pesos en formato GGUF y safetensors, con un total de 961.316.865 parametros segun los datos reales de los safetensors, mientras que la ficha tecnica del modelo base indica 1.363.707.905 parametros de borrador en BF16.

La relevancia de este modelo reside en su integracion con el ecosistema de decodificacion especulativa de SGLang y llama.cpp (a traves del fork BeeLlama.cpp), donde actua como borrador con una longitud media de aceptacion de 5,29 tokens por paso de verificacion en un conjunto representativo de cargas de trabajo, lo que se traduce en mejoras significativas de rendimiento en servidores de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (5 capas de atencion completa, MHA) |
| Parametros totales | 961.316.865 (safetensors del repo); 1.363.707.905 (1,36 B) segun la ficha del modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 posiciones |
| Tipos de cuantizacion | GGUF (cuantizaciones de BeeLlama.cpp; niveles no especificados) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa que extiende **DFlash** con características auxiliares del modelo objetivo y una cabeza de confianza (confidence head) que determina dinamicamente el numero de tokens de borrador a generar. La arquitectura consiste en 5 capas de atencion completa, con un tamano oculto de 2560 y atencion MHA de 32 cabezas de consulta y 32 de clave/valor. La cabeza de confianza es un vanilla Markov head de rango 256, y el bloque DSpark produce hasta 8 tokens de borrador por paso (ancho de verificacion de 9, incluyendo el token de bonificacion del modelo objetivo).

El modelo fue entrenado con **SpecForge** y se sirve con **SGLang**. Las capas de características auxiliares del modelo objetivo son las capas 1, 11, 23, 29 y 35. Los pesos del borrador son en BF16 segun la ficha del modelo base, con 1.363.707.905 parametros. La longitud maxima de posiciones es 262.144. No se han proporcionado detalles sobre la composicion del dataset de entrenamiento ni sobre procesos de alineacion como RLHF o DPO.

## Capacidades

- Generacion de tokens de borrador para decodificacion especulativa: el modelo no es autonomo; genera candidatos que el modelo objetivo (Ling-3.0-flash) verifica y acepta o rechaza.
- Aceptacion dinamica: la cabeza de confianza ajusta el numero de tokens de borrador en funcion del contexto, optimizando la relacion entre coste de calculo y tasa de aceptacion.
- Longitud de contexto extendida: soporta hasta 262.144 posiciones, lo que permite trabajar con entradas largas.
- Integracion con SGLang y llama.cpp/BeeLlama.cpp: puede desplegarse como modelo de borrador especulativo en ambos runtimes.
- Rendimiento de aceptacion medido: longitud media de aceptacion de 5,29 tokens por paso de verificacion (media macro en nueve cargas de trabajo). Las mejores tasas se observan en HumanEval (6,57) y GSM8K (6,40); las mas bajas en Alpaca (3,51) y Arena-Hard-v2 (3,72).
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada (es un modelo de borrador, no un modelo de proposito general).

## Casos de uso

- **Aceleracion de chat en tiempo real**: El modelo se usa como borrador especulativo en SGLang para reducir la latencia de respuesta en aplicaciones conversacionales. Con una longitud media de aceptacion de 5,29 tokens, el servidor puede generar tokens verificados con menos pasos de decodificacion, mejorando la experiencia del usuario.
- **Despliegue en GPUs de consumo**: Gracias a las cuantizaciones GGUF y al reducido tamano del borrador, puede ejecutarse en GPUs de consumo junto con el modelo objetivo, reduciendo el coste de hardware necesario para desplegar Ling-3.0-flash.
- **Razonamiento matematico y generacion de codigo**: En workloads como GSM8K (aceptacion 6,40) o HumanEval (6,57), el borrador muestra un alto rendimiento, por lo que es adecuado para pipelines de resolucion de problemas matematicos y de programacion donde se procesan muchas solicitudes simultaneas.
- **Integracion en pipelines de evaluacion**: El modelo puede utilizarse en SGLang con el algoritmo DSPARK para medir la aceleracion real en conjuntos como MATH-500, AIME 2025 o LiveCodeBench. Los valores de aceptacion publicados sirven como referencia para ajustar la configuracion del servidor.
- **Inferencia local para desarrolladores**: Con BeeLlama.cpp, el borrador puede desplegarse en una estacion de trabajo con GPU para experimentar con decodificacion especulativa sin infraestructura cloud. Los comandos de conversion y cuantizacion estan documentados en la ficha del modelo.
- **Optimizacion de costes en produccion**: Al incrementar el throughput por GPU mediante decodificacion especulativa, el modelo reduce el numero de instancias necesarias para atender un volumen dado de peticiones, siempre que se combine con el modelo objetivo Ling-3.0-flash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K como evaluacion de calidad) para este modelo, ya que es un borrador especulativo y no un modelo de generacion autonoma. La metrica relevante proporcionada es la **longitud de aceptacion** (numero medio de tokens aceptados por paso de verificacion especulativa, incluyendo el token de bonificacion del modelo objetivo):

| Carga de trabajo | Longitud de aceptacion |
|---|---|
| GSM8K | 6,40 |
| MATH-500 | 6,29 |
| AIME 2025 | 5,56 |
| HumanEval | 6,57 |
| MBPP | 6,34 |
| LiveCodeBench | 5,33 |
| MT-Bench | 3,92 |
| Alpaca | 3,51 |
| Arena-Hard-v2 | 3,72 |
| **Media macro** | **5,29** |

## Requisitos de hardware

- VRAM estimada para el borrador: en BF16, con 1.363.707.905 parametros, se requieren aproximadamente 2,7 GB solo para los pesos. En el repositorio, los safetensors suman 961.316.865 parametros, por lo que el requisito de VRAM en esta version es menor, aunque no se especifican los niveles de cuantizacion GGUF incluidos.
- GPU recomendadas: no especificadas en la informacion disponible. Dado el reducido tamano del borrador, es compatible con GPUs de consumo y de servidor, pero el requisito total depende del modelo objetivo Ling-3.0-flash, cuyo tamano no se ha facilitado.
- Ejecucion en GPU de consumo: es probable que el borrador quepa en GPU de consumo, pero el despliegue completo requiere tambien el modelo objetivo, por lo que no se puede confirmar sin conocer sus especificaciones.
- Opciones de despliegue: SGLang (con soporte DSPARK, usando `--speculative-algorithm DSPARK`) y llama.cpp/BeeLlama.cpp (con `--spec-draft-model` y `--spec-type draft-dspark`).
- Latencia y throughput: no se proporcionan valores absolutos. El rendimiento se mide mediante la longitud media de aceptacion (5,29 tokens por paso de verificacion), que es un indicador de la reduccion del numero de pasos de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (aceptacion) | Licencia |
|---|---|---|---|---|
| Ling-3.0-flash-dspark (este) | 1,36 B (BF16); 961 M (safetensors) | 262.144 | 5,29 (media macro) | other |
| DFlash | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada. DFlash aparece como antecedente tecnico del que DSpark extiende sus capacidades, pero no se han facilitado especificaciones tecnicas ni benchmarks de dicho modelo.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede generar texto por si mismo; requiere el modelo objetivo Ling-3.0-flash para producir salidas. Su funcion es unicamente generar borradores para decodificacion especulativa.
- Licencia "other": las condiciones exactas no estan especificadas en la informacion disponible. Es necesario revisar la licencia original del modelo base de inclusionAI antes de un uso comercial.
- Dependencia de software especifico: para funcionar correctamente requiere una version de SGLang con soporte DSPARK o una compilacion de llama.cpp con soporte DSpark (BeeLlama.cpp). El uso con runtimes estandar puede no ser compatible.
- Rendimiento dependiente de la carga de trabajo: la longitud media de aceptacion varia notablemente entre tareas (de 3,51 en Alpaca a 6,57 en HumanEval). En cargas de trabajo generativas de estilo libre, la ganancia de velocidad puede ser menor que en tareas de razonamiento o codigo.
- Discrepancia en el numero de parametros: los safetensors del repositorio suman 961.316.865 parametros, mientras que la ficha del modelo base indica 1.363.707.905. Esta diferencia no esta explicada en la informacion disponible y puede afectar a la cuantificacion de VRAM y al rendimiento esperado.
- Idiomas soportados: no disponible. No se ha publicado informacion sobre las capacidades multilingues del modelo.
- Riesgo de alucinacion: no aplicable directamente, ya que el modelo no genera contenido final; no obstante, un borrador de baja calidad puede reducir la tasa de aceptacion y degradar el rendimiento del servidor.
- Modelo nuevo sin adopcion: el repositorio registra 0 descargas y 0 likes, lo que indica que es un lanzamiento reciente sin validacion en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Anbeeld/Ling-3.0-flash-DSpark-GGUF
- Modelo base (borrador): https://huggingface.co/inclusionAI/Ling-3.0-flash-dspark
- Modelo objetivo: https://huggingface.co/inclusionAI/Ling-3.0-flash
- BeeLlama.cpp (fork de llama.cpp): https://github.com/Anbeeld/beellama.cpp
- DFlash (proyecto original): https://github.com/z-lab/dflash
- SpecForge (framework de entrenamiento): https://github.com/sgl-project/SpecForge
- SGLang (runtime de inferencia): https://github.com/sgl-project/sglang
- Cookbook de SGLang para Ling-3.0-flash: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash
