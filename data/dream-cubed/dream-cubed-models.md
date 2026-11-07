# dream-cubed/dream-cubed-models

## Resumen

Dream-Cubed es una familia de modelos generativos 3D desarrollada por investigadores de la Universidad de Nueva York (Tim Merino, Sam Earle, Julian Togelius) y Sakana AI (Ryunosuke Iwai, Edoardo Cetin), presentada en el track Evaluations and Datasets de NeurIPS 2026. El modelo genera chunks de voxels de Minecraft de 32x32x32 bloques condicionados por bioma, a partir de un dataset a gran escala de miles de millones de cubos procedentes de terreno generado proceduralmente y de mapas creados por humanos.

La relevancia del trabajo es doble: por un lado, publica el dataset DreamCubedNatural junto con los pesos; por otro, compara dos paradigmas de difusion 3D sobre el mismo problema, difusion discreta enmascarada (MD4) y difusion continua (DDPM), lo que permite estudiar empiricamente las diferencias entre ambos enfoques en generacion voxel a resolucion de bloque. El repositorio incluye cinco checkpoints con distintas configuraciones de tamano de parche (p2, p4) y composicion de entrenamiento (balanced, boosted, natural).

No se trata de un modelo de lenguaje: es un modelo de difusion para generacion de mundos, por lo que no dispone de contexto textual, tokenizador de lenguaje ni capacidades conversacionales. El repositorio ocupa 5,5 GB y los pesos se distribuyen en formato PyTorch (`.pt`), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion 3D sobre voxels: MD4 (difusion discreta enmascarada) y DDPM (difusion continua) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generacion de chunks de 32x32x32 voxels; contexto espacial limitado segun la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de generacion de mundos, no de lenguaje) |
| Licencia | Apache 2.0 para los pesos; CC BY-NC 4.0 para los datasets de entrenamiento |
| Formato de pesos | PyTorch (`.pt`, `model_best_weights.pt`) |

Variantes publicadas:

| Checkpoint | Tipo de difusion | Tamano de parche | Composicion de entrenamiento |
|---|---|---|---|
| `DDPM_p2_balanced` | Continua (DDPM) | 2 | Balanceada |
| `MD4_p2_balanced` | Discreta (MD4) | 2 | Balanceada |
| `MD4_p4_balanced` | Discreta (MD4) | 4 | Balanceada |
| `MD4_p4_boosted` | Discreta (MD4) | 4 | Reforzada |
| `MD4_p4_natural` | Discreta (MD4) | 4 | Natural |

## Arquitectura y entrenamiento

Dream-Cubed emplea dos formulaciones de difusion sobre una representacion voxelica discreta. Los modelos MD4 aplican difusion discreta enmascarada, un esquema en el que los tokens (bloques) se enmascaran progresivamente y la red aprende a reconstruirlos; los modelos DDPM aplican difusion continua sobre una parametrizacion continua del espacio de bloques. El tamano de parche (`p2` o `p4`) determina la granularidad con la que el modelo procesa los cubos, lo que afecta tanto a la fidelidad geometrica como al coste computacional.

El entrenamiento se realiza sobre el dataset DreamCubedNatural, compuesto por miles de millones de cubos extraidos de terreno de Minecraft generado proceduralmente y de mapas creados por humanos, con curado y balanceo por bioma. Las variantes `balanced`, `boosted` y `natural` reflejan distintas composiciones del dataset, y la model card advierte que los vocabularios de las variantes natural y human-augmented no son intercambiables: cada checkpoint debe emparejarse con el mapeo del dataset con el que fue entrenado. La condicionalidad es por bioma, lo que permite controlar el tipo de terreno generado. El codigo de entrenamiento e inferencia esta disponible en el repositorio de Sakana AI, con dos puntos de entrada: `train_discrete.py` para MD4 y `train_conditional_ddpm.py` para DDPM.

## Capacidades

- Generacion de chunks de Minecraft de 32x32x32 voxels a resolucion de bloque.
- Generacion condicionada por bioma, lo que permite controlar el tipo de terreno resultante.
- Dos paradigmas de generacion disponibles (MD4 discreto y DDPM continuo) para comparacion experimental.
- Distintos tamanos de parche (p2 y p4) que permiten intercambiar fidelidad por coste.
- Integracion con el pipeline de entrenamiento, inferencia y evaluacion del repositorio oficial.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision ni audio en el sentido de los modelos multimodales de lenguaje.

## Casos de uso

- Generacion procedural de terreno para videojuegos tipo Minecraft: el modelo produce chunks completos de 32x32x32 condicionados por bioma, utiles como base para mapas generados dinamicamente en un motor de voxels.
- Aumento de datos para entrenamiento de agentes: se pueden generar grandes volumenes de terreno sintetico etiquetado por bioma para entrenar agentes de navegacion o construccion sin necesidad de mapas humanos.
- Investigacion en modelos generativos 3D: la publicacion de checkpoints MD4 y DDPM sobre el mismo dataset permite comparar directamente difusion discreta y continua en un dominio voxelico.
- Prototipado de herramientas de autoria: un editor de mundos puede integrar el modelo para sugerir extensiones de terreno coherentes con el bioma circundante.
- Estudio de sesgos y calidad en generacion 3D: los checkpoints `balanced`, `boosted` y `natural` permiten analizar como la composicion del dataset afecta a la distribucion de terreno generado.
- Docencia y divulgacion: el codigo y los pesos permiten reproducir el experimento del paper en un entorno controlado, con dos formulaciones de difusion y varios tamanos de parche.
- Benchmarking de infraestructura de inferencia: util para medir latencia y throughput de difusion 3D en distintas GPU con tamanos de parche y pasos de muestreo configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 5,5 GB e incluye cinco checkpoints, pero no se detalla el tamano individual de cada uno ni el pico de memoria en inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el modelo es de difusion 3D y la latencia depende del hardware, del tamano de parche y del numero de pasos de muestreo, segun la model card.
- Opciones de despliegue: el repositorio oficial de Sakana AI (`SakanaAI/DreamCubed`) incluye utilidades de inferencia en PyTorch; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion 3D).
- Latencia y throughput: no disponibles; la model card indica explicitamente que la release no garantiza generacion en tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dream-Cubed (MD4/DDPM) | Difusion 3D voxel | no disponible | Chunks 32x32x32 | Apache 2.0 (pesos) / CC BY-NC 4.0 (datos) | Pesos y codigo publicos |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de generacion de mundos voxelicos en la documentacion proporcionada.

## Limitaciones y advertencias

- Las salidas estan restringidas a chunks de 32x32x32 voxels; no se genera un mundo completo de forma directa.
- Los modelos heredan las restricciones de version, seleccion, vocabulario y contexto espacial limitado documentadas en las fichas del dataset.
- Las muestras pueden contener geometria implausible o discontinuidades entre chunks.
- La latencia de inferencia depende del hardware, del tamano de parche y de los pasos de muestreo; no se garantiza generacion en tiempo real.
- Los vocabularios de las variantes natural y human-augmented no son intercambiables: usar un checkpoint con el mapeo equivocado produce resultados invalidos.
- La licencia Apache 2.0 cubre los pesos, pero los datasets de entrenamiento tienen licencia CC BY-NC 4.0, lo que restringe el uso comercial de los datos y puede afectar a flujos derivados.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento multi-paso.
- No se han publicado datos de sesgo, tasas de alucinacion ni evaluaciones de robustez en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/dream-cubed/dream-cubed-models
- Dataset de entrenamiento: https://huggingface.co/datasets/dream-cubed/DreamCubedNatural
- Codigo (GitHub): https://github.com/SakanaAI/DreamCubed
- Pagina del proyecto (Sakana AI): https://pub.sakana.ai/dream-cubed/
- Paper: Dream-Cubed: Controllable Generative Modeling in Minecraft by Training on Billions of Cubes (NeurIPS 2026, Evaluations and Datasets Track)
- Contacto de investigacion: Tim Merino, tm3477@nyu.edu
