# hUh63/anima-28block

## Resumen

anima-28block es un repositorio de pesos para el modelo de difusion de texto a imagen Anima, publicado por el usuario hUh63 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos con la estructura canonica de 28 bloques DiT (Diffusion Transformer) del modelo Anima, junto con un script de conversion que permite reordenar pesos de variantes de Anima cuyo numero de bloques o cuya numeracion de componentes no sigue el esquema estandar.

El modelo subyacente, Anima, emplea una arquitectura DiT basada en el `MiniTrainDIT` de Cosmos-Predict2, con 28 bloques, 2048 canales de modelo, 16 cabezas de atencion de 128 dimensiones cada una y un MLP con factor de expansion 4.0 (8192 unidades). Cada bloque contiene 21 tensores en BF16 (138,4 MiB por bloque) e incluye modulacion adaLN para self-attention, cross-attention y MLP, proyecciones q/k/v/output en ambas atenciones, normalizaciones q/k y las dos capas del MLP. Fuera de los bloques se encuentran `x_embedder`, `t_embedder`, `t_embedding_norm`, `final_layer` y `llm_adapter`.

La relevancia de este repositorio es practica: facilita la interoperabilidad entre distintas variantes de pesos de Anima y el ecosistema ComfyUI, donde el modelo se identifica como `image_model: "anima"`. El script `anima_swap_blocks.py` realiza exclusivamente una reordenacion estructural, sin transformaciones numericas, y falla con codigo de salida distinto de cero si la estructura de origen no es compatible, evitando la produccion silenciosa de modelos corruptos. La informacion publica disponible es muy limitada: no hay datos de entrenamiento, benchmarks, licencia declarada ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) basada en Cosmos-Predict2 `MiniTrainDIT`, 28 bloques |
| Parametros totales | no disponible (pesos en BF16; 138,4 MiB por bloque, 28 bloques) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (archivo unico, `diffusion-single-file`) |

## Arquitectura y entrenamiento

La arquitectura es un Diffusion Transformer (DiT) con 28 bloques, `model_channels = 2048`, 16 cabezas de atencion de 128 dimensiones y MLP con factor 4.0 (8192). Cada bloque contiene 21 tensores en BF16 con un total de 138,4 MiB e incluye `adaln_modulation_{self_attn,cross_attn,mlp}.{1,2}`, las proyecciones `{self_attn,cross_attn}.{q,k,v,output}_proj`, las normalizaciones `{self_attn,cross_attn}.{q,k}_norm` y `mlp.layer{1,2}`. Fuera de los bloques se incluyen `x_embedder`, `t_embedder`, `t_embedding_norm`, `final_layer` y `llm_adapter`, lo que sugiere un adaptador para condicionamiento textual basado en un modelo de lenguaje.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el proceso de alineacion (RLHF/DPO) ni innovaciones tecnicas adicionales. El repositorio no contiene pesos entrenados de forma independiente: la model card indica que los pesos convertidos se obtienen a partir de variantes de Anima y que el esqueleto de referencia (anclas estructurales) proviene del modelo oficial `circlestone-labs/Anima`, concretamente `anima-base-v1.0`. El script `anima_swap_blocks.py` reordena los tensores de un modelo de origen cuya numeracion de bloques o de componentes esta aplanada, y los recoloca en la estructura estandar de 28 bloques; si faltan bloques o el numero de componentes no cuadra, el script termina con error.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline `text-to-image`).
- Integracion con ComfyUI mediante el identificador `image_model: "anima"`.
- Conversion estructural de pesos de variantes de Anima al esquema canonico de 28 bloques mediante `anima_swap_blocks.py`.
- Verificacion de integridad estructural: el script aborta con codigo distinto de cero si la estructura de origen no es compatible.
- Generacion de un informe de conversion (`report.json`) con el numero de bloques, tensores y tensores de esqueleto anadidos.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Estandarizacion de pesos de Anima: convertir variantes con numeracion de bloques aplanada o con un numero de bloques distinto de 28 al esquema canonico, de modo que puedan cargarse en ComfyUI con `image_model: "anima"`.
- Migracion entre versiones de Anima: usar `anima-base-v1.0` como esqueleto de referencia para reanclar pesos de otras variantes y garantizar la compatibilidad de tensores.
- Auditoria de integridad de checkpoints: ejecutar el script en modo `--dry-run` para comprobar, antes de convertir, si un checkpoint de origen es estructuralmente compatible.
- Trazabilidad de conversiones: generar `report.json` en cada conversion para registrar cuantos bloques y tensores se han procesado y cuantos tensores de esqueleto se han anadido.
- Despliegue en ComfyUI para generacion de imagenes: una vez convertidos los pesos, cargarlos en un flujo de trabajo de ComfyUI para text-to-image.
- Pipeline de publicacion de modelos: integrar el script en un proceso de CI que valide y reordene checkpoints antes de subirlos a un repositorio, aprovechando que el script falla de forma explicita ante estructuras incompatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia estructural, cada bloque ocupa 138,4 MiB en BF16 y hay 28 bloques, a lo que hay que sumar los tensores externos (`x_embedder`, `t_embedder`, `t_embedding_norm`, `final_layer`, `llm_adapter`); el total exacto no esta publicado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (identificador `image_model: "anima"`); otros motores no documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anima-28block | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| circlestone-labs/Anima (`anima-base-v1.0`) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado como esqueleto oficial) |
| Alternativas DiT de texto a imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial no esta autorizado de forma explicita y requiere consulta previa con el autor.
- No hay informacion sobre sesgos del modelo subyentente ni sobre el dataset de entrenamiento.
- Riesgo de alucinacion visual (artefactos, incoherencias en la imagen generada) no cuantificado por falta de evaluaciones publicadas.
- El repositorio no contiene un modelo entrenado de forma independiente: es una reordenacion estructural de pesos de Anima; la calidad final depende del checkpoint de origen.
- El script solo realiza reordenacion estructural, sin transformacion numerica; no corrige pesos corruptos ni diferencias semanticas entre variantes.
- Si el numero de bloques o de componentes no coincide, el script aborta; no hay conversion parcial ni tolerancia a fallos.
- No hay informacion sobre idiomas soportados en el condicionamiento textual.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: sin validacion por parte de la comunidad.
- No se documentan requisitos de VRAM ni latencias, lo que dificulta la planificacion de despliegues en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hUh63/anima-28block
- Modelo oficial de referencia (esqueleto): https://huggingface.co/circlestone-labs/Anima
