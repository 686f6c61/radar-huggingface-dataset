# feltrockni/flux2-klein-9b-snofs-v1-4-merged

## Resumen

FLUX.2 Klein 9B + SNOFS v1.4 (merged) es un modelo de difusion de imagenes publicado por el usuario feltrockni en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un merge de pesos: parte del modelo base `black-forest-labs/FLUX.2-klein-9B` (la variante destilada de 9B de la familia FLUX.2 de Black Forest Labs) y le incorpora, fusionado directamente en los pesos del transformer, el checkpoint LoKr de estilo `Ashen3/SNOFS` en su version v1.4, a intensidad fija 1.0. El resultado es un modelo text-to-image e image-to-image listo para usar con `diffusers` que incorpora el estilo o ajuste de SNOFS sin necesidad de cargar un adaptador aparte.

La relevancia tecnica del repositorio esta en el procedimiento de merge: SNOFS v1.4 se distribuye como un checkpoint LoKr (descomposicion de Kronecker de rango completo) para el que `diffusers` no ofrece soporte de carga, por lo que la unica via de aplicarlo en ese ecosistema es la fusion in-place del delta en los pesos del transformer. El autor documenta el metodo (producto de Kronecker en CPU y bfloat16, division de los deltas QKV fusionados por dimension de salida, ignorando `alpha` como hace ComfyUI) y la verificacion del build: 144 modulos objetivo recibieron delta, 0 errores, sin claves sin emparejar y sin pesos no finitos.

El modelo tiene 9.078.581.248 parametros y un repositorio de 34,7 GB en safetensors. Al ser un merge de un modelo destilado, el presupuesto de inferencia previsto es de 8 pasos y `guidance_scale` se ignora. La licencia aplicable es la del modelo base (FLUX non-commercial license) junto con los terminos del LoRA SNOFS; el repositorio no anade ninguna concesion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (FLUX.2 Klein, destilado); `Flux2KleinPipeline` en diffusers |
| Parametros totales | 9.078.581.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16/safetensors; no se documentan variantes GGUF ni otras) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; no se especifican idiomas) |
| Licencia | FLUX non-commercial license (modelo base) + terminos del LoRA SNOFS; el repo no anade licencia propia |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para generacion de imagenes, heredado de FLUX.2 Klein 9B, que es la variante destilada (`is_distilled: true`) de la familia FLUX.2 de Black Forest Labs. Sobre esa base se aplica el checkpoint LoKr SNOFS v1.4, que consta de 112 modulos con `lokr_w1`, `lokr_w2` y `alpha`. Como `diffusers` no soporta LoKr y el delta `kron(w1, w2)` es de rango completo (no la descomposicion A/B de bajo rango que espera PEFT), el autor fusiona el delta directamente en los pesos del transformer con `torch.kron` en CPU y bfloat16, sumandolo con `alpha=1.0`. Los deltas QKV fusionados se dividen por dimension de salida entre `to_q`/`to_k`/`to_v` (y `add_q_proj`/`add_k_proj`/`add_v_proj`), replicando la ruta directa de LoKr de ComfyUI; `alpha` se ignora deliberadamente, como en esa ruta.

La verificacion del build reporta 144 modulos objetivo con delta aplicado, 0 errores, sin claves sin emparejar y sin pesos no finitos. Los nueve modulos que el checkpoint no toca (`x_embedder`, `context_embedder`, los dos `timestep_embedder`, `proj_out`, `norm_out.linear` y los tres `*_modulation.linear`) no aparecen en el fichero LoKr, que solo cubre las lineales de atencion y MLP dentro de los bloques. No se documentan en la informacion disponible datos sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni si hubo RLHF/DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante `Flux2KleinPipeline`.
- Edicion y transformacion de imagenes (image-to-image), segun el pipeline declarado en Hugging Face.
- Aplicacion del estilo/ajuste SNOFS v1.4 fusionado a intensidad fija 1.0.
- Inferencia con presupuesto reducido: 8 pasos (`num_inference_steps=8`) por ser el modelo base destilado.
- Compatibilidad con adaptadores LoRA convencionales cargados encima del modelo fusionado.
- Semilla reproducible mediante `torch.Generator` en CPU.
- No se documentan capacidades de tool calling, agentes, vision comprensiva, audio ni modo thinking; es un modelo generativo de imagen.

## Casos de uso

- Generacion de imagenes con el estilo SNOFS en produccion: al estar el LoRA fusionado en los pesos, se elimina la necesidad de gestionar y cargar un adaptador aparte en cada peticion, lo que simplifica el despliegue con `diffusers`.
- Edicion de imagenes existentes: el pipeline image-to-image permite transformar imagenes de entrada aplicando el ajuste fusionado, util para retoques con estilo consistente.
- Prototipado rapido de pipelines de imagen: con 8 pasos de inferencia y `guidance_scale` ignorado, el coste por generacion es bajo y el flujo de trabajo es sencillo de integrar en scripts de experimentacion.
- Integracion en entornos `diffusers`: al ser un repo nativo de diffusers en safetensors, encaja en infraestructuras Python existentes sin conversiones adicionales de formato.
- Combinacion con otros LoRA: al ser un merge de pesos, se pueden seguir cargando adaptadores LoRA ordinarios encima para ajustes adicionales por caso de uso.
- Reproduccion de resultados: el uso de semilla fija y de un presupuesto de pasos determinado facilita la comparacion de salidas en pruebas de regresion visual.
- Evaluacion de tecnicas de merge LoKr: el repositorio documenta el procedimiento y la verificacion, por lo que sirve como referencia para quien necesite aplicar checkpoints LoKr en `diffusers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9.078.581.248 parametros en bfloat16 (2 bytes por parametro) los pesos ocupan aproximadamente 18,2 GB, a lo que hay que sumar memoria para activaciones y el VAE/text encoder del pipeline.
- GPU recomendadas: no especificadas en la informacion disponible; por el tamano de pesos en bfloat16, se requiere una GPU con al menos unos 20 GB de VRAM solo para los pesos del transformer.
- Cabe en consumer GPU: no confirmado; queda por debajo del umbral de GPUs de 24 GB solo si se dispone de margen suficiente para activaciones, algo que no se documenta.
- Opciones de despliegue: `diffusers` (requiere la version de `main`, ya que `Flux2KleinPipeline` no esta en una release etiquetada). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el unico dato de rendimiento es el presupuesto previsto de 8 pasos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2 Klein 9B + SNOFS v1.4 (merged) | 9.078.581.248 | Difusion, destilado, con LoKr fusionado | no aplica | FLUX non-commercial + SNOFS | Hugging Face, diffusers |
| black-forest-labs/FLUX.2-klein-9B | 9B (no confirmado con precision) | Difusion, destilado, sin adaptador | no aplica | FLUX non-commercial | Hugging Face, diffusers |
| Ashen3/SNOFS (LoKr) | no disponible (adaptador) | Checkpoint LoKr | no aplica | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El LoRA esta fusionado a intensidad fija 1.0 y no puede reponderarse por peticion; para cambiar la intensidad habria que volver al modelo base y aplicar el adaptador por otra via.
- La licencia del modelo base es FLUX non-commercial license, lo que restringe el uso comercial; ademas aplican los terminos del LoRA SNOFS, y el repositorio no anade ninguna concesion propia.
- El modelo base es destilado: `guidance_scale` se ignora y el presupuesto previsto es de 8 pasos, lo que limita el control fino sobre el proceso de generacion.
- Requiere `diffusers` desde `main`; `Flux2KleinPipeline` no esta en una release etiquetada, lo que implica riesgo de inestabilidad de API.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-20), por lo que no hay evidencia de uso comunitario ni validacion externa.
- El tag `not-for-all-audiences` sugiere que el ajuste puede producir contenido no apto para todas las audiencias; conviene filtrar en produccion.
- No se documentan sesgos, tasas de alucinacion visual ni limitaciones de idioma; no hay datos disponibles al respecto.
- La verificacion del merge la realiza el propio autor; no se dispone de validacion independiente del build.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/feltrockni/flux2-klein-9b-snofs-v1-4-merged
- Modelo base FLUX.2 Klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Licencia del modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B/blob/main/LICENSE.md
- LoRA SNOFS: https://huggingface.co/Ashen3/SNOFS
- Checkpoint LoKr SNOFS v1.4: `Klein9b/klein_snofs_v1_4.safetensors` (dentro del repo SNOFS)
