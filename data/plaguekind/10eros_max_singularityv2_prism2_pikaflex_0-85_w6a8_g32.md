# Plaguekind/10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_w6a8_g32

## Resumen

Este repositorio contiene un modelo de difusion para generacion de video derivado de Minimax Hailuo H3 (variante Ref2VA), fruto de una fusion (merge) entre los modelos Singularity y 10Eros Max, con la mezcla PRISM-v2 y PikaFlex aplicada a una fuerza de 0.85. Lo publica el usuario Plaguekind como una recuantizacion de un modelo previo en int8 de alta calidad (int8HQ) alojado en el repositorio de OliviaRossi. No se trata de un modelo de lenguaje ni de un transformer autoregresivo, sino de un UNET de difusion que se carga en ComfyUI mediante el nodo UNETLoader.

El interes tecnico del artefacto esta en el formato de cuantizacion: pesos de 6 bits con activaciones int8, tamano de grupo 32 y ConvRot de grupo 256, empaquetados en el formato nativo `w6a8_int8` de ComfyUI. Esto reduce el peso de aproximadamente 20,2 GB del int8HQ original a unos 15,9 GB, manteniendo, segun el autor, una salida practicamente identica con la misma semilla y ajustes. El modelo se distribuye como un unico archivo safetensors y no requiere nodos personalizados para cargarse.

La relevancia practica es la de permitir ejecutar un modelo de generacion de video de gran tamano en hardware mas modesto sin recurrir a kernels externos, ya que los kernels cuantizados estandar de ComfyUI son suficientes. No obstante, la informacion publicada es muy escasa: no hay model card detallada, ni benchmarks, ni especificaciones de contexto o idiomas, y la licencia queda delegada a los modelos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (diffusion_model), cargado con UNETLoader en ComfyUI |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion) |
| Tipos de cuantizacion | w6a8_int8 (w6a8_g32_convrot): pesos de 6 bits, activaciones int8, grupo 32, ConvRot grupo 256 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia de los modelos de origen) |
| Formato de pesos | safetensors (un unico archivo, ~15,9 GB) |

## Arquitectura y entrenamiento

El modelo es un UNET de difusion para generacion de video, no un transformer de lenguaje. Procede de Minimax Hailuo H3 en su variante Ref2VA, y el artefacto publicado es el resultado de una cadena de fusiones: la mezcla Singularity x 10Eros Max con PRISM-v2 y PikaFlex a fuerza 0.85, que corresponde a la variante UPD4 del repositorio de origen de OliviaRossi. Sobre esa mezcla se aplica una recuantizacion de int8HQ a `w6a8_int8`.

No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni sobre tecnicas de alineacion como RLHF o DPO, ya que no aplican o no se han publicado. La innovacion tecnica destacable es la propia cuantizacion: el esquema w6a8 con grupo de 32 y ConvRot de 256 permite cargar el modelo con los kernels cuantizados nativos de ComfyUI, sin nodos personalizados, y el autor afirma que la salida es casi identica a la del int8HQ de origen.

## Capacidades

- Generacion de video a partir de difusion, en la variante Ref2VA de Hailuo H3 (referencia a video).
- Carga directa en ComfyUI mediante UNETLoader como modelo de difusion, junto con el text encoder y el VAE habituales de H3.
- Ejecucion con kernels cuantizados estandar de ComfyUI, sin dependencias de nodos externos.
- Compatibilidad con el ecosistema de merges y LoRAs orientados a H3, al derivar de una mezcla de ese linaje.
- No se han documentado capacidades de texto, razonamiento, codigo, tool calling ni agentes, por no ser un modelo de lenguaje.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de video de referencia a video en ComfyUI: se carga el UNET con UNETLoader y se conecta al text encoder y VAE de H3 para producir clips a partir de una imagen o fotograma de referencia, aprovechando que el formato es nativo del ecosistema.
- Prototipado de pipelines de video en estaciones con VRAM limitada: al reducir el peso a unos 15,9 GB frente a los 20,2 GB del int8HQ, permite iterar en GPUs de gama alta de consumo donde el original no cabria con comodidad.
- Evaluacion comparativa de merges: sirve para reproducir con la misma semilla y ajustes los resultados del int8HQ y validar que la recuantizacion no degrada la salida en un flujo de trabajo concreto.
- Produccion de material audiovisual de baja latencia en local: al no requerir nodos personalizados, se integra en flujos de ComfyUI ya existentes sin reescribir el grafo.
- Experimentacion artistica con estilos fusionados: la mezcla Singularity x 10Eros Max con PRISM-v2 y PikaFlex esta pensada para explorar variaciones esteticas sobre la base de H3.
- Despliegue en entornos con almacenamiento ajustado: el menor tamano del archivo facilita su distribucion y cacheado en servidores de inferencia con cuotas de disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo afirma cualitativamente que la salida es casi identica a la del int8HQ de origen con la misma semilla y ajustes, sin aportar metricas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el archivo pesa ~15,9 GB, por lo que se necesita al menos esa cantidad de VRAM para cargarlo en memoria, mas la del text encoder y el VAE de H3.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, encaja en GPUs con 24 GB o mas de VRAM, aunque no hay confirmacion del autor.
- Cabe en GPU de consumo: probablemente en modelos de 24 GB o superiores, pero no esta verificado.
- Opciones de despliegue: ComfyUI con UNETLoader y kernels cuantizados nativos; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (w6a8 g32) | UNET de difusion de video (H3 Ref2VA, merge) | ~15,9 GB | w6a8_int8 | no disponible (hereda de origen) | Hugging Face, Plaguekind |
| 10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_int8HQ | UNET de difusion de video (mismo merge) | ~20,2 GB | int8HQ | no disponible | Hugging Face, OliviaRossi |
| Minimax Hailuo H3 (Ref2VA) base | UNET de difusion de video | no disponible | no disponible | no disponible | no disponible en la informacion |

## Limitaciones y advertencias

- La informacion publicada es minima: no hay model card detallada, ni ficha de licencia, ni especificaciones de entrenamiento.
- La licencia no esta declarada; el autor remite a las licencias de los modelos de origen, que deben verificarse antes de cualquier uso comercial.
- Al ser una recuantizacion de 6 bits, existe riesgo de degradacion sutil de la calidad frente al int8HQ, aunque el autor lo niega; conviene validarlo con la misma semilla y ajustes.
- No es un modelo de lenguaje: no ofrece razonamiento, codigo, tool calling ni capacidades multilingues.
- Riesgo de alucinacion visual y artefactos propios de los modelos de difusion de video, sin datos publicados sobre su magnitud.
- Depende del text encoder y VAE de H3, cuyo rendimiento y licencia no se detallan aqui.
- El repositorio tiene cero descargas y un solo like, por lo que no hay evidencia de comunidad ni validacion independiente.
- La fecha de creacion indicada (2026-11-05) resulta anomala y conviene tratarla con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Plaguekind/10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_w6a8_g32
- Modelo de origen int8HQ: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM/blob/main/10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_int8HQ.safetensors
- Repositorio de origen (OliviaRossi): https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM
- ComfyUI: no disponible en la informacion proporcionada
- Paper o blog del modelo base Hailuo H3: no disponible
