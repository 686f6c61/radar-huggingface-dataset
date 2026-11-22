# PARADOXAIlabs/atlas-w-v1-delhi

## Resumen

Atlas-W v1 (Delhi) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) como parte de su serie Paradox World Model, concretamente la entrega numero 45. Su tarea especifica es la prediccion de las proximas 24 horas de concentracion de PM2.5 en las estaciones de la red de vigilancia de calidad del aire de Delhi (CPCB), utilizando datos horarios de 39 estaciones de monitorizacion continua procedentes del conjunto "Delhi Hourly Air Quality Reports" de OpenCity.

El modelo es extremadamente compacto: 14.043 parametros por checkpoint, y el fichero publicado contiene dos checkpoints (B y C) que son identicos entre si, correspondientes a las etapas de entrenamiento registradas para esta version. Se distribuye como un unico fichero PyTorch (`45_atlas-w_v1_delhi.pt`, 149.267 bytes) que empaqueta metadatos, pesos, configuracion de entrenamiento y resultados registrados, pero no incluye el codigo de arquitectura, que reside en el repositorio GitHub del proyecto.

Es relevante como ejemplo de modelo ultraligero orientado a un dominio concreto (contaminacion atmosferica urbana) y como pieza de una serie comparativa mas amplia de modelos de prediccion. Su interes practico esta en el bajo coste computacional y en la trazabilidad del registro, no en capacidades generales de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el codigo reside en el repositorio GitHub del proyecto; no se detalla en la model card) |
| Parametros totales | 14.043 por checkpoint (el fichero contiene 2 checkpoints: B y C, identicos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (prediccion de horizonte fijo de 24 horas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict serializado con `torch.save`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Se indica que el codigo de arquitectura para esta version esta en el repositorio GitHub `paradoxailab/paradox-world-model` y que la configuracion de entrenamiento se almacena dentro del propio fichero, accesible como `ck['cfg']`. El modelo pertenece a la familia Atlas y se etiqueta como "paradox-world-model" y "spatiotemporal", lo que sugiere un diseno para datos con estructura espacial (estaciones) y temporal (series horarias), pero no se confirma si se trata de un transformer, un modelo recurrente, un modelo grafo-temporal o un esquema hibrido.

Los datos de entrenamiento proceden de los informes horarios de calidad del aire de Delhi (CPCB, 39 estaciones, OpenCity). El entrenamiento se ejecuto el 2026-11-13 en un entorno Kaggle identificado como `atlasw-v13-s320`, con la "receta v1.3". No se especifican el numero de tokens ni de horas de datos, la composicion exacta del dataset, ni si hubo etapas de RLHF/DPO (poco probables en un modelo de regresion de series temporales). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos se remiten a `DATA_SOURCES.md`.

## Capacidades

- Prediccion de las proximas 24 horas de PM2.5 en estaciones de la red de Delhi.
- Modelado espaciotemporal sobre 39 estaciones de monitorizacion continua.
- Serializacion autocontenida: el checkpoint incluye metadatos (`meta`), pesos (`weights`), configuracion (`cfg`) y resultados registrados (`results`).
- Carga directa con PyTorch mediante `torch.load` y `huggingface_hub.hf_hub_download`.
- No soporta generacion de texto, razonamiento, codigo, vision, audio ni tool calling.
- No dispone de capacidades multilingues ni de modo de razonamiento extendido.

## Casos de uso

- Prediccion operativa de calidad del aire en Delhi: generar cada hora el pronostico de PM2.5 a 24 horas para las 39 estaciones, alimentando paneles publicos de alerta sanitaria.
- Sistemas de alerta temprana para episodios de contaminacion: usar la prediccion a 24 horas para activar avisos a poblaciones sensibles (asmaticos, ninos, personas mayores) antes de que se superen umbrales.
- Investigacion en modelos espaciotemporales ultraligeros: servir como linea base de muy bajo coste (14.043 parametros) contra la que comparar arquitecturas mas pesadas en tareas de prediccion de contaminacion.
- Reproducibilidad y auditoria de experimentos: el fichero empaqueta configuracion, pesos y resultados, lo que permite reconstruir el experimento sin depender de infraestructura externa.
- Integracion en pipelines de bajo consumo: al ser un modelo de 149 KB, puede ejecutarse en CPU o en dispositivos con recursos minimos dentro de un servicio de monitorizacion ambiental.
- Estudio comparativo de series de modelos: forma parte de la serie Paradox World Model (56 modelos publicados), lo que permite analizar la evolucion de recetas y resultados entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a "League v2.0 (Atlas-W day 2 results)" y al fichero `atlas/README.md` del repositorio GitHub para consultar los resultados registrados, pero no se incluyen cifras (MAE, RMSE, etc.) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos; cabe en cualquier GPU, CPU o incluso en memoria de un microcontrolador con margen.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (A100, H100, RTX 4090, RTX 3060 o inferior) es sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de series temporales de este tamano).
- Latencia y throughput: no disponibles; por el tamano del modelo se espera latencia despreciable, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La serie Paradox World Model incluye los modelos #44 (Atlas-W v1 pre-training) y #46 (Atlas-Delhi I1, comparacion operativa), que podrian servir como referencias dentro de la misma familia, pero no se aportan sus especificaciones ni resultados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Atlas-W v1 (Delhi) | 14.043 por checkpoint | No disponible (horizonte 24 h) | Apache-2.0 | Hugging Face |
| Atlas-W v1 (pre-training, #44) | No disponible | No disponible | No disponible | Hugging Face |
| Atlas-Delhi I1 (#46) | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo predice PM2.5 en estaciones de Delhi; no es generalizable a otras ciudades, contaminantes o tareas sin reentrenamiento.
- Los checkpoints B y C del fichero son identicos, por lo que no aportan diversidad de ensemble ni de etapas.
- No se documentan sesgos, pero al entrenar sobre una unica red de estaciones (CPCB Delhi) puede heredar sesgos de cobertura geografica y de calidad de los sensores.
- Riesgo de alucinacion no aplicable en el sentido linguistico, pero si de predicciones erroneas fuera del regimen de entrenamiento (episodios extremos, fallos de estacion, cambios en la red).
- No se especifican limitaciones de contexto ni de idioma porque el modelo no opera sobre texto.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento no se incluyen y sus terminos se remiten a `DATA_SOURCES.md`; conviene revisarlos antes de un uso productivo.
- El codigo de arquitectura no esta en el repositorio de Hugging Face; la reproducibilidad depende del repositorio GitHub externo.
- Sin resultados de benchmarks publicados en la informacion disponible, no es posible validar su rendimiento relativo.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-w-v1-delhi
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro y reglas de la version: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y terminos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#44): https://huggingface.co/PARADOXAIlabs/atlas-w-v1-pretrain
- Modelo siguiente (#46): https://huggingface.co/PARADOXAIlabs/atlas-delhi-i1
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
