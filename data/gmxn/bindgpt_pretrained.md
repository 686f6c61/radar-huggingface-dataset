# gmxn/bindgpt_pretrained

## Resumen

BindGPT es un framework para el diseno de moleculas 3D que reformula tareas de quimica computacional (generacion de moleculas, generacion de conformeros y generacion condicionada por bolsillo proteico) como problemas de modelado de lenguaje sobre secuencias tokenizadas. El modelo aqui presentado es la version preentrenada, alojada en el repositorio `gmxn/bindgpt_pretrained` (con origen en `insilicomedicine/bindgpt_pretrained`), y esta construido sobre una arquitectura `gpt_neox` de tipo transformer autoregresivo.

El problema que aborda es la fragmentacion de modelos especializados en drug discovery: en lugar de entrenar una red distinta para cada tarea, BindGPT unifica generacion incondicional, generacion de conformeros y diseno condicionado por pocket en un unico modelo preentrenado, con capacidad de transferencia entre tareas. Segun la model card, el autor reporta una velocidad de generacion dos ordenes de magnitud superior (100x) a metodos previos gracias a inferencia transformer optimizada.

La relevancia actual reside en su enfoque de tokenizacion de moleculas y coordenadas 3D como texto (tokens `<LIGAND>` y `<XYZ>`), lo que permite reutilizar el ecosistema de `transformers`, tecnicas de RL y tool use sobre modelos de lenguaje. La version preentrenada genera moleculas y conformeros zero-shot dentro de la distribucion del dataset Uni-Mol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (gpt_neox) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos usan `max_length=400`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo especializado en quimica, no conversacional) |
| Licencia | Solo fines de investigacion (pesos); dataset CC BY 4.0 (solo no comercial) |
| Formato de pesos | no disponible (compatible con `transformers`/`AutoModelForCausalLM`) |

## Arquitectura y entrenamiento

BindGPT emplea un transformer decoder-only de la familia GPT-NeoX, adaptado para generar secuencias que codifican moleculas en formato SMILES seguidas de coordenadas atomicas 3D. La generacion se estructura mediante tokens especiales: `<LIGAND>` marca el inicio de la molecula y `<XYZ>` separa la representacion SMILES de las coordenadas cartesianas. El modelo se preentrena sobre el dataset Uni-Mol, lo que le permite generar moleculas y conformeros zero-shot dentro de esa distribucion.

El framework completo descrito en el paper incluye preentrenamiento computacionalmente eficiente, ajuste fino supervisado, prompting, aprendizaje por refuerzo (RL) y uso de herramientas. La version preentrenada aqui disponible no incorpora el ajuste fino sobre GEOM-DRUGS (publicado por separado) ni el modelo entrenado con RL sobre CrossDocked (anunciado como proximo). La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion incondicional de moleculas 3D en formato SMILES + coordenadas, dentro de la distribucion de Uni-Mol.
- Generacion de conformeros 3D dada una molecula (SMILES) como prompt.
- Generacion condicionada por bolsillo proteico (pocket-conditioned) en las versiones ajustadas del framework.
- Transferencia entre tareas: un unico modelo preentrenado cubre generacion de moleculas, conformeros y diseno condicionado.
- Generacion por lotes (`num_return_sequences`) para muestreo multiple de conformeros por molecula.
- Integracion con el ecosistema `transformers` (`AutoTokenizer`, `AutoModelForCausalLM`) y parseo con RDKit.
- Soporte de RL y tool use a nivel de framework (no en la version preentrenada aislada).
- No es un modelo conversacional ni multilingue: su dominio es la quimica computacional.

## Casos de uso

- Descubrimiento de farmacos temprano: generar bibliotecas de moleculas candidatas con geometria 3D valida para cribado virtual, aprovechando la generacion incondicional zero-shot.
- Generacion de conformeros para docking: dado un SMILES, muestrear multiples conformeros 3D (`num_return_sequences`) para alimentar pipelines de acoplamiento molecular.
- Diseno condicionado por bolsillo: con las variantes ajustadas, proponer ligandos complementarios a un sitio de union proteico concreto.
- Aumento de datos quimicos: sintetizar moleculas y conformeros para ampliar datasets de entrenamiento de otros modelos de quimica.
- Investigacion en RL aplicado a quimica: usar el modelo preentrenado como base para ajuste con recompensas (propiedades, afinidad) siguiendo el framework publicado.
- Prototipado rapido en entornos de investigacion: el ejemplo minimo solo requiere `transformers`, `tokenizers`, `rdkit` y `pytorch`, lo que facilita la experimentacion sin infraestructura especializada.
- Benchmarking de generacion 3D: comparar la velocidad de muestreo (reportada 100x superior) frente a metodos especializados previos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma una velocidad de generacion aproximadamente 100 veces superior a metodos previos, sin cifras concretas de metricas quimicas (validez, diversidad, energy, etc.) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el numero de parametros).
- GPU recomendadas: no disponible; los ejemplos usan `.cuda()` generico.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano real del modelo, no publicado.
- Opciones de despliegue: `transformers` con PyTorch (soporte nativo); el repositorio oficial menciona optimizaciones con flash-attention, precision mixta y muestreo por lotes grandes para reproducir la velocidad del paper.
- Latencia y throughput: no disponibles; la model card solo indica que el ejemplo minimo no reproduce la velocidad reportada.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BindGPT (preentrenado) | LM autoregresivo para moleculas 3D | no disponible | no disponible | solo investigacion | Hugging Face |
| Uni-Mol | Representacion 3D con transformer | no disponible en la informacion | no disponible | no disponible | GitHub |
| Modelos especializados previos (generacion 3D) | Redes dedicadas por tarea | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de parametros, contexto ni rendimiento de los modelos comparables, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos estan licenciados exclusivamente para fines de investigacion; el dataset asociado (CC BY 4.0) solo permite uso no comercial.
- La version preentrenada genera solo dentro de la distribucion de Uni-Mol; fuera de ella la validez de las moleculas puede degradarse.
- Riesgo de salidas invalidas: el codigo de ejemplo incluye un `parse_molecule` que devuelve `None` ante fallos de parseo, lo que indica que no todas las generaciones son moleculas quimicamente validas.
- No es un modelo de lenguaje general: no soporta conversacion, tool calling nativo ni capacidades multilingues.
- El ajuste fino sobre GEOM-DRUGS y el modelo con RL sobre CrossDocked se distribuyen por separado o estan pendientes, por lo que el rendimiento en tareas condicionadas no esta cubierto por esta version.
- No se especifican sesgos, numero de parametros ni contexto maximo, lo que dificulta la planificacion de despliegue en produccion.
- Uso etico restringido: la model card prohibe explicitamente cualquier uso que pueda causar dano o perjuicio a la sociedad.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/gmxn/bindgpt_pretrained
- Hugging Face (modelo ajustado en GEOM-DRUGS): https://huggingface.co/insilicomedicine/bindgpt_finetuned
- Repositorio oficial: https://github.com/insilicomedicine/bindgpt
- Paper (arXiv): https://arxiv.org/abs/2406.03686
- Sitio web del proyecto: https://bindgpt.github.io
- Dataset Uni-Mol: https://github.com/deepmodeling/Uni-Mol
