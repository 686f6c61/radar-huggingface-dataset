# BudgetAny/BudgetLatent-FLUX-3-Image-Klein

## Resumen

BudgetLatent-FLUX-3-Image-Klein es un fine-tune de FLUX 3 Image Klein, el modelo de generacion de imagenes texto-a-imagen de Black Forest Labs, desarrollado por el proyecto BudgetAny (UIUC). Su propuesta central es la tokenizacion adaptativa al presupuesto de computo: un mismo checkpoint puede ejecutarse con cualquier numero de sus 4096 tokens latentes (de 1.0 a 0.1 del total), de modo que el coste de inferencia se ajusta dinamicamente sin cambiar de modelo. Un quadtree fusiona las regiones mas planas de la imagen en tokens mas gruesos (de 32 a 128 px en lugar de 16 px), el transformer opera sobre la secuencia reducida y pequenos refinadores restauran el detalle.

El modelo genera imagenes a 1024 x 1024 y mantiene operativas la edicion, la generacion multi-referencia (hasta 10 referencias) y las cajas de layout en todos los presupuestos. Es relevante porque desacopla calidad y coste en difusion de imagenes: en la misma GPU, bajar del 100 % al 10 % de tokens reduce el tiempo por imagen de 2,13 s a 0,43 s (aceleracion de 5,02x) con un pico de memoria que apenas varia (10,2 GiB a 9,7 GiB).

Se trata de una implementacion no oficial y de codigo abierto, basada en el metodo del paper BudgetPix (Kara et al., 2026), que cubria difusion en espacio de pixeles; la extension a difusion latente es aportada por este proyecto y las cifras son mediciones propias. La licencia es la FLUX Kommunity License v.1.0, con restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion latente (fine-tune de FLUX 3 Image Klein) con tokenizacion adaptativa mediante quadtree |
| Parametros totales | 4,91 B (transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (4096 tokens latentes densos a 1024 x 1024, reducibles hasta 409) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License v.1.0 (uso no comercial; uso comercial de salidas por Qualifying Users) |
| Formato de pesos | safetensors (bf16, 9,81 GB) |

## Arquitectura y entrenamiento

El modelo parte del transformer de FLUX 3 Image Klein (4,91 B parametros) y lo fine-tunea para operar con tokenizacion adaptativa. La imagen de 1024 x 1024 se representa inicialmente con 4096 tokens latentes de 16 px; un quadtree agrupa las regiones de menor complejidad en tokens de 32, 64 o 128 px, reduciendo la longitud de secuencia que procesa el transformer. Tras la difusion, refinadores de menor tamano restauran el detalle de las zonas fusionadas. El checkpoint publicado contiene el transformer completo en bf16; el codificador de texto Qwen3-VL y el VAE se heredan del modelo base y se descargan aparte mediante `scripts/fetch_weights.py`.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El muestreo de referencia usa el sampler flow-map destilado de 16 pasos sin guidance. La innovacion principal es la capacidad de ejecutar un unico checkpoint a cualquier fraccion del presupuesto de tokens (de 1.0 a 0.1), con soporte de edicion, multi-referencia y cajas de layout en todos los niveles.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024 x 1024 con presupuesto de tokens ajustable entre el 100 % y el 10 % (4096 a 409 tokens).
- Edicion de imagenes mediante referencias (`--ref`), con hasta 10 imagenes de referencia; las referencias conservan todos sus tokens.
- Generacion multi-referencia combinando varias imagenes de entrada.
- Control de composicion mediante cajas de layout escritas en el prompt, operativas en todos los presupuestos.
- Visualizacion del layout de tokens por imagen (`--overlay`: verde 16 px, amarillo 32 px, azul 64 px, morado 128 px).
- Inferencia compilada y optimizada (`--fast`) para lotes de mas de unas pocas imagenes.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento.

## Casos de uso

- Prototipado rapido de concepto visual: con `--budget 0.2` o `0.1` se obtienen imagenes en 0,43-0,60 s por imagen, lo que permite iterar sobre prompts y semillas en segundos antes de lanzar la generacion final a presupuesto completo.
- Generacion por lotes a gran escala: en batch 8 el pico de memoria baja de 14,8 GiB (100 %) a 10,6 GiB (10 %), de modo que reducir el presupuesto permite aumentar el tamano de lote en una misma GPU para tareas de aumento de datos o catalogos.
- Edicion de imagenes con multiples referencias: el soporte de hasta 10 referencias y de edicion a cualquier presupuesto sirve para variaciones de producto o retoques guiados por imagen, aceptando que la aceleracion es menor porque las referencias mantienen todos sus tokens.
- Composicion controlada por layout: las cajas de layout en el prompt permiten generar maquetas, banners o ilustraciones editoriales con posiciones definidas, en cualquier nivel de presupuesto.
- Servicios con presupuesto de computo variable: un mismo checkpoint desplegado en produccion puede degradar el presupuesto bajo picos de carga en lugar de cambiar de modelo, manteniendo el pipeline y los pesos.
- Investigacion sobre tokenizacion adaptativa: el codigo y el checkpoint permiten reproducir y extender el metodo BudgetPix a difusion latente, comparando calidad frente a coste en los distintos niveles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score u otros) en la informacion disponible. Los unicos datos medidos son de velocidad y memoria, en una NVIDIA RTX PRO 6000 Blackwell Server Edition, batch 1, `--fast`, sampler flow-map destilado de 16 pasos sin guidance:

| Presupuesto | Tokens de imagen | Tiempo por imagen | Aceleracion | Pico de memoria |
|---:|---:|---:|---:|---:|
| 100 % | 4096 | 2,13 s | 1,00x | 10,2 GiB |
| 90 % | 3685 | 1,86 s | 1,15x | 10,2 GiB |
| 80 % | 3277 | 1,69 s | 1,26x | 10,1 GiB |
| 70 % | 2866 | 1,53 s | 1,39x | 10,1 GiB |
| 60 % | 2458 | 1,28 s | 1,67x | 10,0 GiB |
| 50 % | 2047 | 1,10 s | 1,93x | 9,9 GiB |
| 40 % | 1639 | 0,90 s | 2,36x | 9,9 GiB |
| 30 % | 1228 | 0,76 s | 2,80x | 9,8 GiB |
| 20 % | 820 | 0,60 s | 3,56x | 9,7 GiB |
| 10 % | 409 | 0,43 s | 5,02x | 9,7 GiB |

## Requisitos de hardware

- VRAM estimada: el pico de memoria a batch 1 es de aproximadamente 9,7-10,2 GiB, dominado por los pesos (9,6 GiB en bf16). A batch 8, 14,8 GiB al 100 % y 10,6 GiB al 10 %.
- GPU recomendadas: el fabricante reporta mediciones en NVIDIA RTX PRO 6000 Blackwell Server Edition; por el tamano de pesos, se requiere una GPU con al menos 10-12 GiB de VRAM para batch 1 en bf16.
- GPU de consumo: cabe en tarjetas consumer con 12 GiB o mas de VRAM (por ejemplo, RTX 3060 de 12 GiB, RTX 4070 Ti, RTX 4080, RTX 4090); no se documenta soporte de cuantizacion para reducir por debajo de ese umbral.
- Despliegue: el proyecto proporciona scripts propios de inferencia (`scripts/inference/sample.py`) con opcion `--fast` compilada; no se documenta integracion con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 2,13 s por imagen al 100 % y 0,43 s al 10 % en la GPU de referencia, batch 1; no se publican cifras de throughput para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Presupuesto de tokens ajustable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BudgetLatent-FLUX-3-Image-Klein | 4,91 B | 1024 x 1024 | Si (100 %-10 %) | FLUX Kommunity v.1.0 | Hugging Face + GitHub |
| FLUX 3 Image Klein (base) | no disponible en la informacion | 1024 x 1024 | No | FLUX Kommunity v.1.0 | Hugging Face |
| BudgetLatent-FLUX.2-klein-4B | no disponible en la informacion | no disponible | Si | no disponible | Hugging Face |
| BudgetLatent-FLUX.2-klein-base-4B | no disponible en la informacion | no disponible | Si | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (calidad, FID u otros) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: no es un lanzamiento de Black Forest Labs; la extension del metodo BudgetPix a difusion latente y las cifras son del proyecto BudgetAny.
- Licencia restrictiva: FLUX Kommunity License v.1.0 permite uso no comercial y uso comercial de las salidas solo para Qualifying Users; es necesario revisar LICENSE.md y NOTICE.md antes de cualquier despliegue comercial.
- Requiere aceptar la licencia del modelo base FLUX 3 Image Klein en Hugging Face y autenticarse (`hf auth login`) para descargar el codificador de texto y el VAE.
- No se han publicado benchmarks de calidad; se desconoce la degradacion visual real en presupuestos bajos mas alla de los ejemplos cualitativos de la model card.
- La aceleracion por presupuesto es menor en edicion y multi-referencia, ya que las referencias conservan todos sus tokens.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion; al ser un modelo de imagen, los riesgos se refieren a fidelidad al prompt y sesgos visuales del modelo base.
- Sin soporte documentado de cuantizacion ni de frameworks de despliegue estandar (vLLM, TGI, Ollama); la integracion depende de los scripts del repositorio.
- El tech report del proyecto esta pendiente de publicacion; la referencia metodologica disponible es el paper BudgetPix.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudgetAny/BudgetLatent-FLUX-3-Image-Klein
- Pagina del proyecto: https://budgetany.github.io/budgetlatent/
- Codigo: https://github.com/BudgetAny/BudgetLatent
- Paper BudgetPix: https://arxiv.org/abs/2610.12307
- Organizacion BudgetAny en Hugging Face: https://huggingface.co/BudgetAny
- Modelo base FLUX 3 Image Klein: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Variante BudgetLatent-FLUX.2-klein-base-4B: https://huggingface.co/BudgetAny/BudgetLatent-FLUX.2-klein-base-4B
- Variante BudgetLatent-FLUX.2-klein-4B: https://huggingface.co/BudgetAny/BudgetLatent-FLUX.2-klein-4B
- Variante BudgetLatent-FLUX-3-Image-Klein-Base: https://huggingface.co/BudgetAny/BudgetLatent-FLUX-3-Image-Klein-Base
