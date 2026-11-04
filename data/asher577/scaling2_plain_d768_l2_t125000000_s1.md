# asher577/scaling2_plain_d768_L2_t125000000_s1

## Resumen

`scaling2_plain_d768_L2_t125000000_s1` es un transformer de 2 capas y dimension de modelo 768, publicado por el usuario asher577 en HuggingFace. No es un modelo de lenguaje de proposito general, sino un artefacto de investigacion: una ejecucion concreta dentro de un barrido de escalado sobre transformers con dispersion de pesos (*weight-sparse*), entrenado segun el procedimiento descrito por Gao et al. (2025). Su interes es experimental, no aplicado.

El modelo se entrena sobre `jacobcd52/simplestories-tokenized`, un corpus sintetico de historias simples, con el tokenizador `SimpleStories/SimpleStories-1.25M` y un vocabulario de solo 4096 tokens. La ventana de contexto es de 512 tokens y el entrenamiento consume 125 millones de tokens. Combina dispersion en los pesos (fraccion L0 objetivo de 0,01, es decir, una esparsidad muy alta) con dispersion en las activaciones.

Por su tamano minimo (2 capas, 768 dimensiones, vocabulario de 4096) y su dominio de entrenamiento restringido, el modelo no esta pensado para produccion ni para tareas generales de lenguaje. Su utilidad es servir como punto de datos en estudios de escalado y de esparsidad, y como referencia reproducible gracias al run de Weights & Biases enlazado en la model card. No se han publicado resultados de benchmarks ni una licencia explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersion de pesos (*weight-sparse*), segun Gao et al. (2025) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintetico en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

Datos adicionales de la model card: 2 capas, dimension de modelo 768, dimension de cabeza 16, vocabulario de 4096 tokens, esparsidad de pesos activada, fraccion L0 objetivo 0,01, esparsidad de activaciones activada.

## Arquitectura y entrenamiento

Se trata de un transformer estandar con dos capas, dimension de modelo 768 y dimension de cabeza 16, modificado para introducir esparsidad estructural en los pesos. La model card indica que sigue el procedimiento de Gao et al. (2025), con un objetivo de fraccion L0 de 0,01 (aproximadamente un 1 % de pesos no nulos por unidad) y esparsidad tambien en las activaciones. No se detalla en la informacion disponible si la esparsidad es por neuronas, por cabezas o por bloques, ni que tecnicas de poda o regularizacion concretas se aplicaron.

El entrenamiento usa el dataset `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M`, y consume 125 millones de tokens en total. El nombre del repositorio codifica los hiperparametros principales (`d768`, `L2`, `t125000000`, `s1`). No se indica en la informacion disponible si hubo RLHF, DPO, instruccion-tuning ni ninguna fase de alineamiento; por el tipo de corpus y el tamano, es previsible que no.

## Capacidades

- Generacion de texto autoregresiva limitada al dominio de SimpleStories (historias sinteticas simples).
- Modelado de lenguaje a nivel de token con un vocabulario reducido de 4096 entradas.
- Procesamiento de secuencias de hasta 512 tokens.
- No hay evidencia de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia de capacidades multilingues; el corpus de entrenamiento es sintetico y en ingles.
- No dispone de modo de razonamiento (*thinking*), vision, audio ni otras modalidades.
- Su proposito declarado es servir de base experimental para estudiar esparsidad y escalado, no para inferencia de usuario final.

## Casos de uso

- Estudio de escalado con esparsidad: el modelo es un punto de medida dentro de un barrido (`scaling2`) que varia profundidad, dimension y tokens; se usa para trazar curvas de perdida frente a estos ejes y comparar configuraciones dispersas con densas.
- Reproduccion de resultados de Gao et al. (2025): al estar publicado el run de W&B y los hiperparametros en el nombre del repositorio, sirve para replicar el procedimiento de entrenamiento con dispersion de pesos en un entorno controlado y de bajo coste.
- Analisis de esparsidad de pesos: con un objetivo L0 de 0,01, es util para inspeccionar la distribucion de pesos no nulos, la estructura de las mascaras y el impacto de la poda en la perplejidad sobre un corpus fijo.
- Docencia y prototipado rapido: un modelo de 2 capas y 0,1 GB de repositorio se carga y entrena en minutos en una sola GPU consumer, lo que lo hace adecuado para cursos sobre transformers y tecnicas de compresion.
- Validacion de pipelines de evaluacion: al tener un dominio y un tokenizador bien definidos (SimpleStories), sirve como caso de prueba para verificar que un harness de evaluacion de perplejidad o de generacion funciona correctamente antes de aplicarlo a modelos mayores.
- Investigacion sobre dispersion de activaciones: la combinacion de esparsidad en pesos y en activaciones permite estudiar la interaccion entre ambas y su efecto en la interpretabilidad de las representaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 2 capas y dimension 768, el estado de pesos ocupa del orden de decenas de megabytes; el repositorio completo pesa 0,1 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060, RTX 4090 o incluso CPU son suficientes.
- Cabe en GPU consumer: si, sin restricciones practicas.
- Opciones de despliegue: no hay integracion estandar con vLLM, llama.cpp, Ollama o TGI, porque el modelo requiere la clase `SparseGPT` del repositorio del autor para cargar el `state_dict`. La carga se hace con PyTorch (`torch.load`) y `huggingface_hub`.
- Latencia y throughput estimados: no disponibles; con esta arquitectura serian muy bajos en coste absoluto, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `scaling2_plain_d768_L2_t125000000_s1` | no disponible (2 capas, d=768) | 512 | 4096 | no disponible | HuggingFace, pesos PyTorch |
| Otros modelos del barrido `scaling2` de asher577 | variables | no disponible | 4096 (previsible) | no disponible | HuggingFace |
| Modelos de SimpleStories de referencia | no disponible | no disponible | 4096 | no disponible | HuggingFace |

No se dispone de datos de rendimiento de este modelo ni de sus alternativas directas en la informacion proporcionada, por lo que la comparativa se limita a la configuracion estructural. No se han identificado modelos comparables con benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion: no es un asistente ni un modelo de proposito general; no debe usarse en produccion ni en aplicaciones de cara al usuario.
- Dominio muy restringido: entrenado exclusivamente sobre SimpleStories, un corpus sintetico de historias simples; su comportamiento fuera de ese dominio es impredecible.
- Ventana de contexto de solo 512 tokens, insuficiente para la mayoria de tareas reales.
- Vocabulario de 4096 tokens: cobertura lexica muy limitada, con tokenizacion ineficiente para texto general.
- Alta esparsidad (L0 objetivo 0,01): puede degradar la calidad y la estabilidad de la generacion; no se han publicado metricas que cuantifiquen ese efecto.
- Riesgo de alucinacion y de generar texto incoherente fuera del estilo de SimpleStories, dado el tamano y los datos de entrenamiento.
- Licencia no especificada: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier uso mas alla de la investigacion.
- Dependencia de codigo no estandar: la carga requiere la clase `SparseGPT` del repositorio, lo que complica la integracion con frameworks habituales.
- Sin garantias de mantenimiento: 0 descargas y 0 likes en el momento de la consulta; el repositorio puede quedar obsoleto o eliminado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asher577/scaling2_plain_d768_L2_t125000000_s1
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/gkry7xs5
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia del procedimiento: Gao et al. (2025), citado en la model card; no se proporciona el enlace en la informacion disponible.
