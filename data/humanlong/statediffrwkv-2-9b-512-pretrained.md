# humanlong/StateDiffRWKV-2.9B-512-pretrained

## Resumen

StateDiffRWKV-2.9B-512-pretrained es un checkpoint de investigación desarrollado por humanlong que combina un backbone RWKV-7 congelado (RWKV7-Goose-World3-2.9B-HF) con un módulo entrenable denominado RELAY, que aplica un mecanismo de difusión sobre el estado interno del modelo (state-hijacking). El nombre "DiffRWKV" refleja esta arquitectura híbrida: un modelo recurrente tipo transformer (RWKV) al que se le añade un proceso de difusión para controlar y planificar las trayectorias de estado durante la generación.

El checkpoint publicado solo contiene los pesos del RELAY (1.0 GB), no los del backbone, que deben descargarse por separado desde el repositorio oficial de RWKV. Está diseñado para trabajar con secuencias de hasta 512 tokens y se entrenó desde cero sobre OpenWebText (304 052 muestras) sin etapa de SFT. La relevancia de este modelo radica en que explora una vía poco convencional: el uso de difusión sobre estados ocultos de un modelo recurrente, lo que podría ofrecer nuevas formas de control de coherencia y planificación en generación de texto, aunque se encuentra en una fase claramente experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (backbone congelado) + RELAY de difusion sobre estado (state-hijacking) |
| Parametros totales | 2.9B (backbone) + parametros del RELAY (no especificados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (segun el nombre del modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el tokenizer RWKV7-Goose-World3 es multilingue, pero no se especifica) |
| Licencia | other (no especificada) |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El modelo combina un backbone RWKV-7 de 2.9B parametros (RWKV7-Goose-World3-2.9B-HF) que permanece congelado, con un modulo RELAY entrenable que implementa un mecanismo de "state-hijacking". Este RELAY, definido en `models/state_hijacking_dit.py`, utiliza una arquitectura de difusion (DiT) con un VAE de 32 dimensiones y trayectorias de 32x16, segun el config `rwkv_relay_2.9B_state_hijack_dit_vae32_traj32x16.yaml`. La idea es que el RELAY planifica o modifica los estados internos del RWKV durante la generacion, actuando como un planificador de trayectorias.

El entrenamiento se realizo sobre el dataset `humanlong/laces-owt-rwkv-tokens`, que contiene 304 052 muestras de OpenWebText tokenizadas con el tokenizer de RWKV7-Goose-World3, con una longitud maxima de 512 tokens. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; el modelo se presenta como "pretrained/no-SFT". El checkpoint incluye un `manifest.json` con metadatos de tamaño, SHA256 y pasos de entrenamiento, aunque no se detallan los hiperparametros ni el numero total de tokens procesados.

## Capacidades

- Generacion de texto autoregresiva basada en el backbone RWKV-7, con control adicional mediante el mecanismo de difusion de estado.
- Planificacion de trayectorias de estado: el RELAY puede generar secuencias de estados que condicionan la generacion, lo que podria permitir un control mas fino sobre la coherencia y el rumbo del texto.
- Inferencia con clasifier-free guidance (parametro `--cfg_scale` en el script de ejemplo) y control de temperatura, top-k, top-p y repeticion.
- Soporte para generacion con prefijo y sufijo (el script `sample_prefix_suffix_trajectory_cfg.py` sugiere que se puede condicionar tanto al inicio como al final de la secuencia).
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento explicito.

## Casos de uso

No se han documentado casos de uso concretos por parte del autor. Dada la naturaleza experimental del modelo, los siguientes son escenarios hipoteticos basados en sus caracteristicas tecnicas:

- Investigacion en arquitecturas hibridas: el modelo sirve como banco de pruebas para estudiar como la difusion sobre estados internos afecta a la generacion de texto, comparando con RWKV estandar.
- Generacion de texto con control de coherencia global: el mecanismo de state-hijacking podria permitir mantener un tema o estilo consistente a lo largo de secuencias largas, aunque el contexto limitado a 512 tokens reduce su alcance.
- Experimentacion con clasifier-free guidance en modelos recurrentes: el script de inferencia permite ajustar `cfg_scale`, lo que facilita explorar el equilibrio entre fidelidad al prompt y diversidad.
- Desarrollo de tecnicas de planificacion de secuencias: el RELAY genera trayectorias de estado que podrian adaptarse a tareas de planificacion de pasos en generacion de texto estructurado.
- Comparacion de metodos de control de estado: al estar el backbone congelado, se puede aislar el efecto del RELAY y comparar con otras tecnicas de intervencion en modelos RWKV.
- Reproducibilidad de resultados: al publicar el checkpoint y el codigo de inferencia, otros investigadores pueden replicar los experimentos y verificar las afirmaciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El titulo de la model card menciona "57.67" (posiblemente una metrica de evaluacion), pero no se especifica que prueba corresponde ni contra que modelos se compara. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

No se dispone de informacion oficial sobre requisitos de hardware. De forma estimada, para cargar el backbone RWKV-7 de 2.9B en FP16 se necesitan aproximadamente 6 GB de VRAM, mas el RELAY adicional (cuyo tamaño no se especifica, pero el repo total es de 1.0 GB). Por tanto, una GPU con al menos 8-10 GB de VRAM seria necesaria para inferencia en FP16. No se mencionan opciones de cuantizacion ni despliegue con vLLM, llama.cpp u otras herramientas. El script de inferencia esta pensado para ejecutarse con CUDA y requiere las librerias `flash-linear-attention` y `fla-core`.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. Dado que se trata de una arquitectura hibrida muy especifica (RWKV + difusion de estado), no existen alternativas publicadas conocidas con las que comparar directamente. Modelos como RWKV-7 estandar o modelos de difusion de texto (p. ej., diffusion-LM) podrian servir como referencia, pero no se han proporcionado datos comparativos.

## Limitaciones y advertencias

- Licencia "other" no especificada: no se detallan las condiciones de uso, lo que impide saber si se permite uso comercial o modificacion.
- El checkpoint no incluye el backbone: es necesario descargar RWKV7-Goose-World3-2.9B-HF por separado, y el config contiene una ruta absoluta que debe ajustarse manualmente.
- Contexto limitado a 512 tokens: no es adecuado para tareas que requieran ventanas largas.
- Modelo sin SFT: no ha pasado por ajuste fino con instrucciones, por lo que su comportamiento en tareas conversacionales o de seguimiento de instrucciones puede ser impredecible.
- No se han publicado evaluaciones de sesgos, alucinaciones ni robustez; al ser un modelo de investigacion, su uso en produccion no esta recomendado.
- La variante de 4096 tokens mencionada en la model card no esta publicada, por lo que la unica opcion disponible es la de 512 tokens.
- Dependencia de librerias especificas (flash-linear-attention, fla-core) que pueden requerir compilacion y versiones concretas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/humanlong/StateDiffRWKV-2.9B-512-pretrained
- Dataset de entrenamiento: https://huggingface.co/datasets/humanlong/laces-owt-rwkv-tokens
- Backbone RWKV-7 (descarga separada): https://huggingface.co/RWKV/RWKV7-Goose-World3-2.9B-HF
