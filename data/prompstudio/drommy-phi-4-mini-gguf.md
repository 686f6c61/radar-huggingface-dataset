# prompstudio/drommy-phi-4-mini-gguf

## Resumen

Drommy-phi-4-mini-gguf es una distribucion en formato GGUF del modelo Phi-4-mini de Microsoft, publicada por el usuario prompstudio en Hugging Face bajo licencia MIT. El repositorio no incluye model card descriptiva, datos de entrenamiento ni resultados de evaluacion: la unica informacion disponible es la licencia declarada y el nombre del artefacto, que indica que se trata de una conversion a GGUF del modelo base Phi-4-mini.

El modelo subyacente, Phi-4-mini, es un transformer denso de aproximadamente 3.800 millones de parametros desarrollado por Microsoft Research, disenado para razonamiento, matematicas y generacion de codigo en un rango de contexto de 128.000 tokens. La relevancia de esta publicacion concreta radica en su formato GGUF, que permite ejecucion en CPU y GPU de consumo mediante llama.cpp y Ollama, si bien la ausencia de documentacion, de verificacion de la conversion y de cualquier metrica publicada limita seriamente su uso en produccion.

Al tratarse de un repositorio sin descargas ni interacciones en el momento de la consulta, debe considerarse un artefacto no validado por la comunidad. Cualquier evaluacion de calidad debe remitirse al modelo original de Microsoft, no a esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (heredada de Phi-4-mini; no documentada en este repositorio) |
| Parametros totales | aproximadamente 3.800 millones (segun el modelo base Phi-4-mini; no verificado en este repositorio) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en este repositorio (el modelo base declara 128.000 tokens) |
| Tipos de cuantizacion | no disponible (formato GGUF; niveles concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura ni el entrenamiento en este repositorio. Por el nombre del artefacto, se infiere que contiene pesos convertidos del modelo Phi-4-mini de Microsoft, un transformer denso con atencion por grupos (GQA) y un contexto declarado de 128.000 tokens en su version original. Sin embargo, esta ficha no puede confirmar que la conversion preserve la configuracion, el tokenizador ni las capacidades del modelo base, ni que se haya realizado con herramientas estandar como llama.cpp o convert_hf_to_gguf.py.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens procesados, las fases de ajuste fino supervisado o de preferencias (RLHF/DPO), ni sobre innovaciones tecnicas especificas. Toda la informacion de entrenamiento disponible corresponde al modelo original de Microsoft y no a esta publicacion.

## Capacidades

- Generacion de texto y razonamiento de proposito general, segun las capacidades declaradas del modelo base Phi-4-mini.
- Razonamiento matematico y resolucion de problemas de varios pasos, herencia del entrenamiento del modelo original.
- Generacion y explicacion de codigo, incluyendo tareas de completado y depuracion.
- Posible soporte de tool calling y function calling, segun el modelo base; no verificado en esta conversion.
- Capacidades multilingues: no disponibles en la documentacion de este repositorio.
- Modo de razonamiento extendido (thinking): no confirmado en esta publicacion.
- Vision y audio: no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: al estar en formato GGUF, puede ejecutarse con llama.cpp en CPU, lo que permite prototipar asistentes de texto en equipos de desarrollo sin acelerador.
- Pruebas de integracion en Ollama: el artefacto puede importarse como modelo personalizado para validar flujos de chat antes de adoptar una version oficial y verificada del modelo base.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad entre distintos niveles de cuantizacion GGUF frente al modelo original en tareas de razonamiento y codigo.
- Generacion de codigo en entornos air-gapped: al ejecutarse en local y sin llamadas a API, encaja en entornos con restricciones de red, siempre que se valide previamente la integridad de los pesos.
- Asistencia de documentacion tecnica: generacion de resumenes y explicaciones de fragmentos de codigo en pipelines internos de documentacion.
- Fines educativos y de investigacion: estudio del proceso de conversion a GGUF y de las diferencias de comportamiento entre el modelo original y una conversion no oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no se ha verificado que la conversion reproduzca el rendimiento del modelo base Phi-4-mini.

## Requisitos de hardware

- VRAM estimada: no disponible para esta conversion concreta; para un modelo denso de aproximadamente 3.800 millones de parametros, una cuantizacion de 4 bits requiere del orden de 2 a 3 GB y una de 8 bits del orden de 4 a 5 GB, sin contar la cache KV.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo base es ejecutable en GPUs de consumo con 8 GB o mas de VRAM.
- GPU de consumo: previsiblemente compatible con RTX 3060, RTX 4060, RTX 4070 y superiores, siempre que la cuantizacion elegida quepa en memoria.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI requeririan pesos en safetensors, no incluidos aqui.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| prompstudio/drommy-phi-4-mini-gguf | aprox. 3.800 M (heredado) | no disponible | MIT | GGUF | Repositorio sin descargas ni validacion |
| microsoft/Phi-4-mini-instruct | aprox. 3.800 M | 128.000 tokens | MIT | safetensors | Modelo oficial, ampliamente validado |
| Qwen2.5-3B-Instruct | aprox. 3.100 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Amplia comunidad y conversiones oficiales |
| Llama-3.2-3B-Instruct | aprox. 3.200 M | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Distribucion oficial con aceptacion de terminos |

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, evaluacion, tokenizador ni parametros de generacion recomendados.
- Conversion no verificada: no se documenta la herramienta, la version ni el nivel de cuantizacion empleados, por lo que la integridad de los pesos no puede confirmarse.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; sin evaluacion publicada no puede acotarse su magnitud en esta conversion.
- Sesgos: desconocidos para esta publicacion; los del modelo base no han sido documentados aqui.
- Idiomas: no se especifica que idiomas conserva la conversion, lo que impide garantizar un rendimiento aceptable en castellano.
- Licencia MIT: permisiva para uso comercial, pero el usuario debe verificar de forma independiente que la conversion respeta los terminos del modelo original de Microsoft.
- Sin senales de uso comunitario (0 descargas, 0 likes): no hay evidencia de que el artefacto haya sido probado por terceros.
- Para produccion se recomienda descargar los pesos oficiales de Microsoft o una conversion GGUF mantenida por el propio equipo del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/prompstudio/drommy-phi-4-mini-gguf
- Modelo base de referencia (no enlazado en el repositorio): https://huggingface.co/microsoft/Phi-4-mini-instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
