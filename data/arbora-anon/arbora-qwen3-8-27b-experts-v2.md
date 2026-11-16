# arbora-anon/arbora-qwen3.8-27b-experts-v2

## Resumen

Arbora Qwen3.8-27B Experts v2 es un modelo borrador (drafter) para decodificación especulativa, desarrollado por el usuario anónimo `arbora-anon` en el contexto de la revisión anónima del artículo "Arbora: Making Better Use of the Draft Tokens from Block Diffusion Drafters". No es un modelo generativo autónomo, sino un componente auxiliar que acelera la inferencia de un modelo objetivo de mayor tamaño (Qwen3.8-27B-DFlash2, de `z-lab`) prediciendo bloques de tokens que el modelo grande verifica después.

Técnicamente se trata de un drafter congelado derivado del modelo base, al que se le añaden ocho expertos Arbora por capa (MLPs de un octavo de ancho) y un scorer de ruta que sustituye al selector de ruta original. El checkpoint ocupa 6,5 GB y contiene 3.261.543.720 parámetros en formato safetensors, con configuración en layout SGLang.

Su relevancia es acotada pero específica: se publica como parte del código del paper para que otros investigadores puedan reproducir el pipeline de decodificación especulativa con block diffusion drafters. No está pensado para uso directo en producción como modelo de chat o generación, sino como acelerador de un modelo mayor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa sobre Qwen3.8-27B-DFlash2, con ocho expertos Arbora por capa (MLPs de un octavo de ancho) y path scorer; layout SGLang |
| Parámetros totales | 3.261.543.720 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` |

## Arquitectura y entrenamiento

El modelo es un drafter congelado construido sobre `z-lab/Qwen3.8-27B-DFlash2`. Sobre cada capa del drafter se añaden ocho expertos Arbora, implementados como MLPs de un octavo de ancho, junto con un scorer de ruta que reemplaza al selector de ruta del diseño original. El conjunto se empaqueta en el layout de SGLang para su carga directa en el pipeline de serving.

El entrenamiento se realizó con entropía cruzada hasta el paso 1.000, según indica la model card. Los datos de entrenamiento son las respuestas del propio modelo objetivo a una colección de prompts que no se ha publicado; el release de código incluye la receta y los scripts para reconstruir el dataset a partir de cualquier fichero de prompts. No se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica principal es el mecanismo Arbora para aprovechar mejor los tokens borrador producidos por drafters de block diffusion, sustituyendo el selector de ruta por un scorer. El checkpoint corresponde al paso 1.000 de entrenamiento y se distribuye con el código del paper bajo revisión anónima.

## Capacidades

- Predicción de tokens borrador para decodificación especulativa sobre el modelo objetivo Qwen3.8-27B-DFlash2.
- Integración con el pipeline de serving SGLang mediante los nombres locales `qwen3.8-27b-experts-path-scorer` y `qwen3.8-27b-experts` bajo `ARBORA_MODELS`.
- Ocho expertos Arbora por capa con un scorer de ruta que sustituye al selector de ruta.
- No se documentan capacidades de generación autónoma, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo; el modelo es un componente de aceleración, no un modelo de propósito general.
- No se documenta modo thinking, soporte de audio ni otras capacidades especiales.

## Casos de uso

- Aceleración de inferencia de Qwen3.8-27B-DFlash2: el drafter propone tokens que el modelo objetivo verifica, reduciendo el número de pasos de decodificación en el pipeline SGLang.
- Reproducción de resultados del paper Arbora: investigadores pueden cargar este checkpoint con `DRAFT=<directorio> arbora/serving/serve.sh qwen3.8-27b arbora` para replicar los experimentos de decodificación especulativa.
- Investigación en decodificación especulativa con block diffusion drafters: sirve como referencia para comparar el enfoque de scorer de ruta frente al selector de ruta original.
- Reconstrucción de pipelines de entrenamiento: el release de código incluye scripts para regenerar los datos de entrenamiento a partir de cualquier fichero de prompts, lo que permite adaptar la receta a otros dominios.
- Evaluación de la ganancia de los expertos Arbora: al comparar con el drafter base sin expertos, permite medir el impacto de los ocho MLPs por capa en la tasa de aceptación de tokens.
- Despliegue en serving de bajo nivel: integrado en SGLang, puede incorporarse a infraestructuras existentes que ya sirvan el modelo objetivo, sin cambiar el modelo generativo principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 6,5 GB en safetensors, por lo que el checkpoint en precisión original requiere al menos ese espacio, más el del modelo objetivo Qwen3.8-27B-DFlash2 que se sirve en paralelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo objetivo y del pipeline SGLang, no solo del drafter.
- Opciones de despliegue: SGLang mediante `arbora/serving/serve.sh` con la variable `DRAFT` apuntando al directorio del checkpoint. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-anon/arbora-qwen3.8-27b-experts-v2 | 3.261.543.720 | no disponible | Drafter especulativo con expertos Arbora | Apache 2.0 | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 (modelo base) | no disponible | no disponible | Modelo objetivo sobre el que se entrena el drafter | no disponible | Hugging Face |
| Drafters especulativos convencionales (EAGLE, Medusa) | no disponible | no disponible | Predicción de tokens borrador | variable | variable |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un drafter, no un modelo generativo autónomo; no debe usarse como sustituto del modelo objetivo.
- Los datos de entrenamiento no se publican: solo se describen los scripts para reconstruirlos, lo que limita la auditabilidad del checkpoint.
- No se documentan sesgos conocidos, pero al entrenarse sobre respuestas del modelo objetivo, puede heredar los sesgos de este.
- Riesgo de alucinación: no aplica de forma directa al ser un componente de verificación, pero los tokens borrador incorrectos se descartan en la verificación del modelo objetivo.
- No se documentan limitaciones de contexto ni de idioma.
- Licencia Apache 2.0 permite uso comercial, pero el checkpoint depende del modelo base `z-lab/Qwen3.8-27B-DFlash2`, cuya licencia debe verificarse por separado.
- El checkpoint corresponde al paso 1.000 de entrenamiento y está vinculado a un paper en revisión anónima; su estabilidad y validación externa son limitadas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3.8-27b-experts-v2
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Código del paper (revisión anónima): https://anonymous.4open.science/r/arbora-7ABE
