# niklastr/pbg

## Resumen

PBG (Prefix-Conditioned Boltzmann Generators) es una familia de checkpoints de modelos generativos para la muestrear conformaciones moleculares de peptidos, desarrollada por Niklas Rindtorff y Alexander Tong y publicada en 2026. El repositorio de Hugging Face `niklastr/pbg` recoge los pesos entrenados que respaldan las tablas y figuras del articulo homonimo, junto con los checkpoints padres sin entrenar y la linea base ROBIN.

Tecnicamente se trata de generadores de Boltzmann autorregresivos implementados en JAX, con tamanos que van desde 8M hasta 640M parametros en la cohorte principal (30M, 49M, 85M, 160M, 320M y 640M en la Tabla 1 del articulo), ademas de una variante PBG-Joint de 160M y un drafter de 15M para decodificacion especulativa. El modelo opera sobre vocabularios de coordenadas discretizadas (`bin4096`) en lugar de tokens de texto, lo que lo situa en el ambito de la fisica estadistica computacional y el diseno de farmacos, no en el del procesamiento de lenguaje natural.

Su relevancia radica en que aplica el paradigma de generacion autorregresiva y decodificacion especulativa, habitual en los LLM, al muestreo de distribuciones de Boltzmann sobre conformaciones de peptidos, un problema central en docking, plegado y evaluacion de energia libre. El repositorio es de gran tamano (950,4 GB) porque contiene decenas de checkpoints intermedios y de ablacion, no un unico modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador de Boltzmann autorregresivo (transformer) implementado en JAX |
| Parametros totales | 8M a 640M segun variante; familia principal: 30M, 49M, 85M, 160M, 320M, 640M; PBG-Joint 160M; drafter 15M |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en formato `.ckpt` de JAX) |
| Idiomas soportados | no aplica (modelo molecular, no linguistico) |
| Licencia | MIT |
| Formato de pesos | `.ckpt` (pickle JAX), cargable con `pbg.checkpoint.load_pickle` |

## Arquitectura y entrenamiento

El modelo es un generador autorregresivo que modela conformaciones de peptidos token a token sobre un vocabulario de coordenadas discretizadas (`bin4096`). Los identificadores de checkpoint (`dipper_<size>_core_bin4096_..._step_<n>`) indican el nombre interno del entrenamiento ("dipper"), el tamano, el vocabulario de coordenadas y el paso de entrenamiento. La implementacion esta en JAX y el codigo asociado vive en el repositorio `NiklasTR/pbg`.

El repositorio incluye cohortes de escalado de "Many Peptides" (de 8M a 85M con 12 vocabularios de coordenadas distintos), una cohorte de escalado MDQM9-nc, modelos de vacio y microsolvatacion (85M, 47M y 160M), un drafter de 15M para decodificacion especulativa, y una escalera de ablaciones del protocolo ROBIN-a-PBG, profundidad de simulacion, diversidad de sistemas y semillas de entrenamiento. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO; el articulo referenciado es la fuente primaria para esos datos.

## Capacidades

- Generacion de conformaciones moleculares de peptidos mediante muestreo autorregresivo sobre coordenadas discretizadas.
- Modelado de distribuciones de Boltzmann condicionadas por prefijo (prefix-conditioned), segun el titulo del trabajo.
- Escalado controlado de 8M a 640M parametros para estudiar leyes de escalado en muestreo conformacional.
- Decodificacion especulativa mediante un drafter dedicado de 15M parametros.
- Variantes para vacio, microsolvatacion y el conjunto MDQM9-nc.
- Modelo conjunto (PBG-Joint 160M) que combina dominios, con un control emparejado solo de peptidos.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: es un modelo cientifico de dominio especifico.

## Casos de uso

- Muestreo de ensembles conformacionales de peptidos: generar conformaciones a partir de la distribucion aprendida para estimar propiedades termodinamicas sin recurrir a dinamica molecular exhaustiva.
- Plegado y docking asistido: usar el generador como propuesta de conformaciones que luego se refinan con metodos fisicos o de scoring.
- Evaluacion de energia libre: emplear los ensembles generados para calcular diferencias de energia libre entre estados conformacionales de interes.
- Estudios de escalado en ML cientifico: la cohorte de 8M a 640M permite analizar como escala el rendimiento con el tamano del modelo en una tarea de fisica estadistica.
- Investigacion en decodificacion especulativa: el drafter de 15M sirve como banco de pruebas para tecnicas de aceleracion en dominios no linguisticos.
- Comparacion de protocolos de entrenamiento: las ablaciones ROBIN-a-PBG y de profundidad de simulacion permiten reproducir y contrastar metodologias de generacion de Boltzmann.
- Modelado en disolvente: las variantes de microsolvatacion y vacio permiten estudiar el efecto del entorno en las conformaciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas y figuras del articulo *Prefix-Conditioned Boltzmann Generators* (Rindtorff & Tong, 2026) y al dataset `niklastr/pbg_rollouts`, que contiene las muestras detras de las metricas reportadas, pero los valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los checkpoints son de JAX y no se especifican requisitos; por tamano, las variantes de 30M a 640M son manejables en GPU de consumo, pero el formato y el pipeline de inferencia no estan documentados.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: probable para las variantes pequenas (8M a 160M) dado su tamano, aunque no confirmado por el autor.
- Opciones de despliegue: carga via `pbg.checkpoint.load_pickle` en Python con JAX; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.
- Nota de almacenamiento: el repositorio completo ocupa 950,4 GB; conviene descargar solo los checkpoints necesarios con `hf download` y el fichero concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PBG (este) | 8M-640M | no disponible | Conformaciones de peptidos | MIT | Hugging Face (`niklastr/pbg`) |
| ROBIN (baseline) | no disponible | no disponible | Generacion de Boltzmann | no disponible | Checkpoint incluido en el repo |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (conformaciones de peptidos); no es un modelo de lenguaje y no debe evaluarse con benchmarks de NLP.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto en la informacion disponible.
- El formato `.ckpt` es un pickle de JAX: requiere el codigo `pbg` para cargarlo y no es directamente compatible con ecosistemas GGUF/Ollama.
- El repositorio es enorme (950,4 GB); descargar el repo completo es costoso en disco y ancho de banda.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre la validez cientifica de las conformaciones generadas recae en el usuario.
- No hay datos publicados de benchmarks en la informacion disponible; cualquier afirmacion de rendimiento debe verificarse en el articulo y en `pbg_rollouts`.

## Enlaces

- Hugging Face: https://huggingface.co/niklastr/pbg
- Codigo: https://github.com/NiklasTR/pbg
- Dataset de muestras: https://huggingface.co/datasets/niklastr/pbg_rollouts
- Articulo: *Prefix-Conditioned Boltzmann Generators* (Rindtorff & Tong, 2026); no se proporciona URL directa en la informacion disponible.
