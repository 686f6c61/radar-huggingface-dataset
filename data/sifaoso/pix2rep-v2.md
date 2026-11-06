# sifaoso/pix2rep-v2

## Resumen

Pix2Rep-v2 es un modelo de preentrenamiento auto-supervisado (SSL) para aplicaciones de imagen médica densa, desarrollado por el usuario sifaoso y documentado en el artículo "Pix2Rep-v2: Data-Efficient Representation Learning for Dense Medical Imaging Applications" (arXiv:2609.01427). El modelo aborda el problema de la escasez de datos etiquetados en imagen médica: en lugar de entrenar desde cero, se preentrena una representación a nivel de píxel sobre datos no etiquetados (o débilmente etiquetados) que luego se transfiere a tareas densas como la segmentación.

En esta versión concreta, el preentrenamiento se ha realizado sobre datos de cine MRI cardíaca, combinando los conjuntos de entrenamiento ACDC, M&Ms y M&Ms2. El repositorio publica dos backbones preentrenados listos para fine-tuning: Pix2Rep-v2+U-Net y Pix2Rep-v2+SwinUNETR. Es relevante para investigadores en segmentación cardíaca que dispongan de pocos datos anotados y quieran aprovechar el aprendizaje auto-supervisado data-efficient.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbones U-Net y SwinUNETR con preentrenamiento SSL Pix2Rep-v2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 1,2 GB) |

## Arquitectura y entrenamiento

Pix2Rep-v2 es un metodo de aprendizaje auto-supervisado a nivel de pixel y denso, orientado a tareas de imagen medica donde la señal relevante es espacialmente local. El repositorio libera dos variantes de backbone: una basada en U-Net, arquitectura convolucional codificador-decodificador estandar en segmentacion medica, y otra basada en SwinUNETR, que incorpora bloques transformer jerarquicos con ventanas deslizantes (Swin Transformer) dentro de una estructura U-Net.

El preentrenamiento se ha llevado a cabo sobre cine MRI cardiaca, utilizando la union de los conjuntos de entrenamiento de ACDC, M&Ms y M&Ms2, tres benchmarks de referencia en segmentacion del ventriculo cardiaco. Un detalle tecnico relevante: la variante con backbone SwinUNETR fue preentrenada usando GroupNorm en la cabeza de proyeccion (activable con el parametro `pretraining.backbone.params.norm=group`), mientras que el resto de modelos emplean BatchNorm. El numero de tokens de entrenamiento, la composicion detallada del dataset y el uso de tecnicas como RLHF no son aplicables o no estan disponibles.

## Capacidades

- Representaciones preentrenadas para tareas de segmentacion densa en imagen medica, transferibles mediante fine-tuning.
- Dos backbones disponibles: U-Net (convolucional) y SwinUNETR (hibrido convolucional-transformer con atencion por ventanas).
- Preentrenamiento especifico en cine MRI cardiaca, con dominio cercano a tareas de segmentacion de estructuras cardiacas (ventriculos, miocardio).
- Entrenamiento data-efficient: disenado para rendir con pocos datos etiquetados tras el preentrenamiento.
- Compatibilidad con el repositorio oficial de codigo (GitHub BioMedTP/pix2rep-v2) para reentrenamiento y fine-tuning.
- No aplica: tool calling, agentes, capacidades multilingues, texto, audio ni razonamiento (es un modelo de vision para segmentacion).

## Casos de uso

- Segmentacion del ventriculo izquierdo y miocardio en cine MRI: el preentrenamiento sobre ACDC+M&Ms+M&Ms2 hace que el backbone sea un punto de partida directo para fine-tuning en segmentacion cardiaca con pocas anotaciones.
- Transferencia a otros dominios de imagen medica con pocos datos: la naturaleza data-efficient del metodo permite ajustar los backbones a modalidades cercanas (RM cardiaca en otros centros o protocolos) con datasets pequenos.
- Investigacion en SSL denso para imagen medica: los pesos publicados permiten reproducir y comparar contra el metodo del paper como baseline.
- Estudios de cuantificacion cardiaca (volumen telediastolico/telesistolico, fraccion de eyeccion) como etapa previa de segmentacion en pipelines clinicos de investigacion.
- Comparativa de backbones convolucionales frente a hibridos transformer (U-Net vs SwinUNETR) en el mismo regimen de preentrenamiento.
- Aumento de datos implicito mediante preentrenamiento multi-centro: la combinacion de tres datasets de distintos centros y distribuciones puede mejorar la robustez ante variabilidad de adquisicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los resultados experimentales del metodo pueden consultarse en el paper de arXiv (2609.01427), pero no se incluyen metricas concretas (Dice, MMLU ni otras) en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (1,2 GB) sugiere backbones de tamano moderado, probablemente ejecutables en GPUs de consumo para inferencia.
- GPUs recomendadas: no disponible; para fine-tuning de backbones tipo U-Net y SwinUNETR en 2D/3D medico, GPUs con 16-24 GB de VRAM (RTX 4090, A100) son habituales en este tipo de cargas, aunque no hay cifras oficiales.
- Consumer GPU: no disponible de forma explicita; dado el tamano del repo, es plausible su uso en GPUs de gama alta de consumo.
- Despliegue: no disponible; el uso previsto es mediante el repositorio oficial de GitHub (BioMedTP/pix2rep-v2), no mediante runtimes de LLM como vLLM u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Dominio | Backbones | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pix2Rep-v2 (este modelo) | Cine MRI cardiaca (ACDC+M&Ms+M&Ms2) | U-Net, SwinUNETR | Apache 2.0 | Pesos publicados en Hugging Face |
| Modelos SSL medicos genericos (p. ej. preentrenamientos tipo VoCo, SwinUNETR SSL en BTCV) | Imagen medica multi-organos | SwinUNETR / CNN | Variable | Pesos publicados en Hugging Face/model zoo de MONAI |
| Entrenamiento desde cero (baseline sin SSL) | Cualquier imagen medica | U-Net, SwinUNETR | n/a | Requiere dataset etiquetado completo |

Nota: la comparativa es cualitativa; no hay metricas publicadas en la model card que permitan una comparacion numerica directa.

## Limitaciones y advertencias

- El preentrenamiento esta limitado a cine MRI cardiaca; la transferencia a otras modalidades (TC, RM de otra region) puede requerir preentrenamiento adicional o fine-tuning extenso.
- Riesgo de alucinacion no aplica como en LLMs, pero en segmentacion medica existen riesgos de error clinico: los resultados no deben usarse para diagnostico sin validacion por expertos.
- La variante SwinUNETR requiere configurar GroupNorm en la cabeza de proyeccion (`pretraining.backbone.params.norm=group`); usar BatchNorm por defecto en ese backbone puede degradar los resultados.
- Descargas practicamente nulas (0 descargas, 1 like) en el momento de redaccion: falta de validacion comunitaria y posible inmadurez del release.
- La licencia Apache 2.0 permite uso comercial, pero los datasets de origen (ACDC, M&Ms, M&Ms2) tienen sus propias licencias y restricciones de uso que deben revisarse por separado.
- No hay documentacion publica en la model card sobre hiperparametros de fine-tuning, ni metricas de rendimiento verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sifaoso/pix2rep-v2
- Paper (arXiv): https://arxiv.org/abs/2609.01427
- Paper en Hugging Face: https://huggingface.co/papers/2609.01427
- Repositorio oficial de codigo (GitHub): https://github.com/BioMedTP/pix2rep-v2
