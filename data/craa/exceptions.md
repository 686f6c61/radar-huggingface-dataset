# craa/exceptions

## Resumen

`craa/exceptions` es una coleccion de modelos de lenguaje GPT-2 small entrenados desde cero como material experimental para el proyecto *exceptions*, asociado al articulo de Leong y Linzen "Language Models Can Learn Exceptions to Syntactic Rules" y a experimentos posteriores. No es un modelo de proposito general ni un lanzamiento de producto: es un conjunto de artefactos de investigacion reproducibles, publicados para que otros investigadores puedan inspeccionar los pesos finales de cada ejecucion de entrenamiento.

Todos los modelos comparten la arquitectura GPT-2 small (12 capas, 12 cabezas de atencion, 768 dimensiones ocultas, aproximadamente 124 millones de parametros). El repositorio contiene 235 ejecuciones de entrenamiento repartidas en tres carpetas (`exp1b`, `exp2a`, `exp3`), cada una con su checkpoint final (el mejor por perdida de validacion), su tokenizer y los registros del `Trainer` de Hugging Face. El tamano del repositorio es de 210 GB, lo que refleja la acumulacion de cientos de checkpoints completos.

La relevancia es fundamentalmente cientifica: permite estudiar como los modelos adquieren excepciones a reglas sinteticas en funcion de la frecuencia de los ejemplos y de la composicion del corpus de entrenamiento. El modelo esta pensado para analisis controlado en laboratorio, no para despliegue en produccion. La licencia es MIT y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small) |
| Parametros totales | ~124 millones (12 capas, 12 cabezas, 768 hidden) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes cuantizadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only identico a GPT-2 small: 12 bloques, 12 cabezas de atencion, 768 dimensiones de modelo, con atencion causal y embeddings posicionales aprendidos. No hay innovaciones arquitectonicas respecto al GPT-2 original; el interes esta en el diseno experimental del entrenamiento, no en la topologia de la red.

Los modelos se entrenan desde cero sobre corpus sinteticos o semi-sinteticos construidos especificamente para el proyecto. La carpeta `exp1b` contiene 5 ejecuciones (`100M_<seed>`) con vocabulario GPT-2 estandar de 50.257 tokens. La carpeta `exp2a` contiene 60 ejecuciones con nombres del tipo `<cond>_to_<verb>_frequency_<seed>`, donde la condicion puede ser `cost`, `last` o `resemble` y el verbo `carry`, `drop`, `hit` o `push`, mapeando a las configuraciones `frequency_<cond>_to_<verb>` del dataset `craa/exceptions`. La carpeta `exp3` contiene 170 ejecuciones con nombres `{high,low}_<n>_<seed>`, con `n` variando entre 0 y 2000 y un vocabulario personalizado de 52.000 tokens. Las semillas estan documentadas por carpeta en la model card. Los corpus de entrenamiento estan publicados en el repositorio de dataset `craa/exceptions`. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion; se trata de entrenamiento supervisado de modelado de lenguaje.

## Capacidades

- Generacion de texto autoregresiva basica, limitada al dominio de los corpus sinteticos con los que se entreno cada checkpoint.
- Modelado de reglas sintacticas y de sus excepciones, que es el objeto de estudio del proyecto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingue: solo ingles declarado.
- No hay modo thinking, vision, audio ni capacidades multimodales.
- Tokenizer GPT-2 estandar en `exp1b` y `exp2a`; tokenizer personalizado de 52.000 tokens en `exp3`.

## Casos de uso

- Investigacion en adquisicion de sintaxis: replicar o extender los experimentos de Leong y Linzen cargando checkpoints concretos con `subfolder` para comparar el efecto de la frecuencia de ejemplos en el aprendizaje de excepciones.
- Analisis de sensibilidad a la frecuencia: usar las 170 ejecuciones de `exp3` con distintos valores de `n` para trazar curvas de aprendizaje frente al numero de ejemplos excepcionales.
- Estudios de variabilidad entre semillas: las 5 semillas documentadas por carpeta permiten estimar la varianza del comportamiento del modelo ante el mismo corpus.
- Docencia en NLP: servir de ejemplo minimo y reproducible de GPT-2 entrenado desde cero con registros de `Trainer` incluidos (`trainer_state.json`, `all_results.json`) para ilustrar el ciclo completo de entrenamiento.
- Analisis de representaciones internas: al ser checkpoints finales de GPT-2 small, se pueden aplicar tecnicas de probing o analisis de atencion sobre ellos sin la opacidad de modelos propietarios.
- Reproduccion de resultados: comparar el checkpoint final de una ejecucion concreta con las metricas registradas en `all_results.json` para verificar la reproducibilidad del pipeline del repositorio `github.com/craaaa/exceptions`.
- Base para experimentos controlados de interpretabilidad: el vocabulario y los corpus sinteticos reducen el ruido linguistico en comparacion con modelos entrenados en web a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia las metricas internas de validacion registradas en los ficheros `trainer_state.json` y `all_results.json` de cada ejecucion, sin cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 500 MB para los ~124 millones de parametros, mas overhead de activaciones y tokenizer.
- VRAM estimada en fp16/bf16: aproximadamente 250 MB de pesos.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia puntual.
- El cuello de botella no es el compute sino el almacenamiento: el repositorio completo ocupa 210 GB, por lo que conviene descargar solo la subcarpeta de la ejecucion de interes mediante `subfolder` en `from_pretrained`.
- Opciones de despliegue: `transformers` de forma nativa; tambien es compatible con llama.cpp y Ollama si se convierte a GGUF, aunque no se publican conversiones oficiales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `craa/exceptions` | ~124 M | no disponible | MIT | Investigacion controlada sobre excepciones sintacticas |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Generacion de texto generalista en ingles |
| DistilGPT-2 | ~82 M | 1024 tokens | Apache 2.0 | Version destilada de GPT-2 para inferencia ligera |
| Pythia-160M | 160 M | 2048 tokens | Apache 2.0 | Suite de investigacion con checkpoints intermedios publicados |

La diferencia clave frente a estas alternativas es que `craa/exceptions` no busca rendimiento generalista sino control experimental: corpus sinteticos, multiples semillas y condiciones de frecuencia documentadas. Frente a Pythia, que publica checkpoints intermedios de forma sistematica, aqui solo se publican los checkpoints finales, lo que limita el analisis de trayectorias de entrenamiento.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion, atencion al cliente ni generacion de contenido general.
- Entrenado sobre corpus sinteticos o semi-sinteticos del proyecto; su comportamiento fuera de ese dominio sera degenerado y no representativo.
- Riesgo alto de alucinacion y de generar texto incoherente en prompts ajenos al corpus de entrenamiento.
- Solo ingles declarado; no hay soporte multilingue verificado.
- La longitud de contexto no esta documentada en la informacion disponible; no debe asumirse la ventana de 1024 tokens de GPT-2 sin verificacion.
- Solo se publican checkpoints finales; los intermedios no estan disponibles, lo que impide analisis de dinamica de entrenamiento a partir de este repositorio.
- El repositorio ocupa 210 GB; descargar el conjunto completo sin filtrar por `subfolder` es costoso en almacenamiento y ancho de banda.
- Licencia MIT permite uso comercial del codigo y los pesos, pero la naturaleza experimental del modelo hace desaconsejable cualquier despliegue comercial real.
- No hay informacion sobre sesgos sociales especificos; al entrenarse en corpus sinteticos, los sesgos seran los del diseno experimental, no los de web a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/craa/exceptions
- Dataset de entrenamiento: https://huggingface.co/datasets/craa/exceptions
- Codigo del proyecto: https://github.com/craaaa/exceptions
- Paper de referencia (Leong y Linzen, "Language Models Can Learn Exceptions to Syntactic Rules"): https://doi.org/10.7275/h25z-0y75
