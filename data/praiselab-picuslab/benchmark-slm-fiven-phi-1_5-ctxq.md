# praiselab-picuslab/benchmark-slm-fiven-phi-1_5-ctxq

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-phi-1_5-ctxq` es un adaptador LoRA publicado con la librería PEFT sobre el modelo base `microsoft/phi-1_5`. No se trata de un modelo entrenado para uso general, sino de un artefacto generado dentro de un banco de pruebas de modelos de lenguaje pequenos (SLM), a juzgar por sus etiquetas: `benchmark-slm`, `dataset-fiven`, `strategy-ctxq`. El repositorio no incluye ficha tecnica, no declara licencia y tiene el acceso restringido, por lo que su evaluacion solo es posible tras aceptar las condiciones en HuggingFace.

El modelo base, phi-1_5, es un transformer decoder-only de aproximadamente 1300 millones de parametros desarrollado por Microsoft Research y descrito en el informe tecnico "Textbooks Are All You Need II". Su interes reside en que demuestra que un modelo de ese tamano, entrenado con datos sinteticos de calidad tipo libro de texto, puede competir con modelos mucho mayores en tareas de razonamiento basico y generacion de codigo. Este adaptador concreto hereda esas capacidades y anade un ajuste fino del que no se publican detalles.

La relevancia de esta ficha es, por tanto, acotada: sirve para documentar un artefacto de experimentacion reproducible, no un modelo listo para produccion. Los datos disponibles son minimos (0 descargas, 0 likes, repositorio de 0.0 GB declarado, idioma declarado `it`) y practicamente todas las especificaciones propias del adaptador deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el modelo base `microsoft/phi-1_5` es un transformer denso de 24 capas |
| Parametros totales | No disponible para el adaptador; el modelo base tiene aproximadamente 1300 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; el modelo base soporta 2048 tokens |
| Tipos de cuantizacion | No disponible; al ser un adaptador LoRA se puede fusionar con el base y cuantizar a los formatos que soporte este (fp16, int8, 4-bit GGUF) |
| Idiomas soportados | `it` (italiano) segun la etiqueta del repositorio; el modelo base esta entrenado predominantemente en ingles |
| Licencia | No disponible (el repositorio no declara licencia; el modelo base phi-1_5 se publica bajo licencia MIT) |
| Formato de pesos | `safetensors` (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos originales. El repositorio no especifica rango, alpha, capas objetivo ni el numero de pasos de entrenamiento, y el tamano declarado (0.0 GB) impide estimar la dimension del adaptador a partir de los metadatos. La etiqueta `strategy-ctxq` sugiere una estrategia de entrenamiento o de seleccion de contexto propia del banco de pruebas, pero no hay documentacion publica que la describa.

Del modelo base si se conoce el planteamiento: phi-1_5 es un transformer decoder-only de unos 1300 millones de parametros entrenado con una mezcla de datos sinteticos de calidad tipo libro de texto y datos web filtrados, con un enfasis marcado en codigo Python. El informe tecnico describe un entrenamiento en dos fases (preentrenamiento y ajuste fino con datos sinteticos), sin que se detallen en la informacion disponible el uso de RLHF o DPO para este adaptador. No se dispone de informacion sobre volumen de tokens, composicion del dataset ni innovaciones tecnicas especificas del ajuste LoRA aqui publicado.

## Capacidades

- Generacion de texto autoregresiva en italiano, segun el idioma declarado en el repositorio.
- Generacion de codigo, capacidad heredada del modelo base, que fue entrenado con un volumen elevado de codigo Python.
- Razonamiento basico y resolucion de problemas aritmeticos sencillos, en la linea de los modelos de su escala.
- Soporte de tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multimodales (vision, audio): no disponibles; el modelo base es exclusivamente de texto.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidad multilingue: limitada al italiano declarado; no se documenta cobertura de otros idiomas.

## Casos de uso

- Evaluacion comparativa de estrategias de ajuste fino: el adaptador puede usarse como punto de medida dentro de un banco de pruebas de SLM, comparando la estrategia `ctxq` con otras variantes sobre el mismo modelo base y el mismo conjunto de datos `fiven`.
- Reproduccion de experimentos: al estar etiquetado con el dataset y la estrategia empleados, permite reconstruir el pipeline de evaluacion en un entorno controlado con `transformers` y `peft`.
- Pruebas de integracion de PEFT: sirve como caso de prueba para verificar que un pipeline de carga de adaptadores LoRA, fusion y exportacion a GGUF funciona correctamente en italiano.
- Generacion de texto en italiano para prototipos: con 1300 millones de parametros y 2048 tokens de contexto, puede alimentar demostraciones internas de generacion de texto donde no se requiera alta calidad.
- Asistencia basica de codigo en entornos de desarrollo: el modelo base rinde de forma razonable en Python, por lo que el adaptador puede emplearse para autocompletado simple en herramientas internas, siempre con revision humana.
- Analisis de sensibilidad al idioma: permite estudiar como se degrada un modelo predominantemente angloparlante al recibir un ajuste en italiano, comparando salidas antes y despues de aplicar el adaptador.
- Docencia y formacion: util como ejemplo practico de que es un adaptador LoRA, como se inspecciona su configuracion y como se fusiona con el modelo base en un curso de IA aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las etiquetas del repositorio (`benchmark-slm`, `dataset-fiven`, `strategy-ctxq`, `or2`) indican que el adaptador forma parte de una evaluacion, pero no se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni para el adaptador ni para las variantes con las que se compara.

## Requisitos de hardware

- El adaptador por si solo no es inferible: requiere cargar el modelo base `microsoft/phi-1_5` (aproximadamente 1300 millones de parametros).
- VRAM estimada para el modelo base en fp16: en torno a 2.6-3 GB de pesos, mas la cache KV correspondiente a 2048 tokens de contexto; con cuantizacion de 4 bits se reduce aproximadamente a 0.8-1 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente para fp16; una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 cubren el caso con holgura. Para despliegues con muchas peticiones concurrentes se recomienda A100 o H100.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6-8 GB o mas, especialmente con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), fusion del adaptador y exportacion a GGUF para `llama.cpp` u `Ollama`, vLLM (soporta adaptadores LoRA en runtime) y TGI.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador; para un modelo de 1300 millones de parametros se pueden esperar decenas de tokens por segundo en GPU de consumo, pero se trata de una estimacion por escala, no de un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-fiven-phi-1_5-ctxq` | Adaptador LoRA sobre 1.3B | No disponible (base: 2048) | No disponible | Acceso restringido en HuggingFace | No disponible |
| `microsoft/phi-1_5` (modelo base) | ~1.3B | 2048 | MIT | Publico | Si, en el informe tecnico del modelo |
| `Qwen/Qwen2.5-1.5B` | ~1.5B | 32 768 | Apache 2.0 | Publico | Si, en la ficha del modelo |
| `HuggingFaceTB/SmolLM2-1.7B` | ~1.7B | 8192 | Apache 2.0 | Publico | Si, en la ficha del modelo |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | ~1.1B | 2048 | Apache 2.0 | Publico | Si, en la ficha del modelo |

El adaptador queda en desventaja clara frente a las alternativas en contexto, licencia y disponibilidad: no declara licencia, exige acceso restringido y su ventana de contexto (heredada) es entre 4 y 16 veces menor que la de Qwen2.5-1.5B y SmolLM2-1.7B.

## Limitaciones y advertencias

- Artefacto de benchmark: las etiquetas indican que es el resultado de una prueba comparativa, no un modelo depurado para produccion; no hay garantia de calidad ni de estabilidad de las salidas.
- Ausencia total de documentacion: no se publican datos de entrenamiento, hiperparametros del LoRA, composicion del dataset `fiven` ni metodologia de evaluacion.
- Licencia no declarada: al no especificarse, no se puede asumir uso comercial permitido, aunque el modelo base sea MIT. Es necesario contactar con el autor antes de cualquier uso en produccion.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que anade friccion a la reproducibilidad y puede impedir el uso automatizado en pipelines.
- Riesgo elevado de alucinacion: el modelo base es de 1300 millones de parametros y fue entrenado con una mezcla intensiva en datos sinteticos, lo que favorece respuestas plausibles pero incorrectas, especialmente en datos factuales.
- Sesgo linguistico: el ajuste declarado es solo en italiano y el modelo base esta dominado por el ingles; el rendimiento fuera de esos idiomas sera previsiblemente pobre.
- Contexto corto: 2048 tokens en el base limita conversaciones multi-turno y el procesamiento de documentos largos.
- Sin soporte documentado de tool calling ni de agentes: no debe asumirse que el adaptador conserve o mejore estas capacidades.
- Metricas de adopcion nulas (0 descargas, 0 likes) y fecha de publicacion muy reciente: no existe validacion independiente por parte de la comunidad.
- El campo de tamano del repositorio (0.0 GB) impide verificar que los pesos del adaptador esten efectivamente subidos.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-phi-1_5-ctxq
- Modelo base en HuggingFace: https://huggingface.co/microsoft/phi-1_5
- Informe tecnico del modelo base (Textbooks Are All You Need II: phi-1.5 technical report): https://arxiv.org/abs/2309.05463
- Informe tecnico de phi-1 (Textbooks Are All You Need): https://arxiv.org/abs/2306.11644
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de PEFT: https://huggingface.co/docs/peft
