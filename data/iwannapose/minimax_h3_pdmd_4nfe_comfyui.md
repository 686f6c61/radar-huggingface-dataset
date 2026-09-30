# Iwannapose/minimax_h3_pdmd_4nfe_comfyui

## Resumen

Iwannapose/minimax_h3_pdmd_4nfe_comfyui es un adaptador LoRA en formato ComfyUI para MiniMax-H3, el modelo abierto de generacion de video multimodal de MiniMax (Hailuo AI 3.0, segun los recursos de la comunidad). No es un modelo autonomo: es una conversion del LoRA PDMD 4-NFE publicado por pdmd2026, un estudiante destilado a 4 pasos (4 NFE) sobre MiniMax-H3-33B mediante Projected Distribution Matching Distillation (PDMD). Su funcion es reducir el coste de muestreo del modelo base a 4 evaluaciones de funcion, manteniendo el comportamiento del H3 original.

El adaptador tiene rango 128 y cubre las proyecciones de atencion y las dos capas feed-forward de los 50 bloques transformer mas los 2 bloques token-refiner del H3. El repositorio ocupa 9,4 GB y su unico archivo valido es `minimax_h3_pdmd_4nfe_comfyui_v6.safetensors` en bf16; las versiones anteriores (base, keys_v2, v3, v4 y v5) se retiraron porque eran conversiones defectuosas en las que la mayoria de claves no coincidian con nada en el cargador de ComfyUI.

La relevancia practica esta en la compatibilidad: la conversion reordena las claves desde el esquema PEFT de Diffusers al layout H3 de ComfyUI (fusion q/k/v en `qkv_proj`, remapeo SwiGLU, renombrado de `to_out.0`, `ff.net.0.proj` y `ff.net.2`), verifica que las 208 claves destino existen con dimensiones coincidentes en `minimax_h3_ref2va_int8_convrot.safetensors` y que cada tensor es numericamente identico al original bajo dichas transformaciones. Licencia apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 128) sobre transformer de difusion MiniMax-H3; cubre proyecciones de atencion y ambas capas feed-forward de 50 bloques transformer + 2 bloques token-refiner |
| Parametros totales | No disponible (el adaptador no declara recuento; la model card indica que el modelo base es MiniMax-H3-33B) |
| Parametros activos | No aplica (adaptador sobre un modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en el archivo publicado; el modelo base dispone de variante int8 con rotacion de convolucion (`minimax_h3_ref2va_int8_convrot.safetensors`) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`minimax_h3_pdmd_4nfe_comfyui_v6.safetensors`), layout de claves H3 de ComfyUI |
| Modelo base | MiniMaxAI/MiniMax-H3 (MiniMax-H3-33B) |
| Pipeline | text-to-video |
| Tamano del repositorio | 9,4 GB |
| Autor | Iwannapose |
| Fecha de creacion / actualizacion | 2026-09-30 / 2026-09-30 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El objeto de este repositorio es un delta de pesos de bajo rango (rank 128) obtenido por Projected Distribution Matching Distillation, un metodo de destilacion por coincidencia de distribuciones proyectadas. El estudiante resultante opera a 4 pasos de denoising (4 NFE) frente a los 8 pasos del LoRA turbo referenciado en la propia model card (`minimax_h3_fl2v_turbo_8step_v1.0_768p_comfyui_bf16.safetensors`). El adaptador se aplica sobre los 50 bloques transformer y los 2 bloques token-refiner del H3, alcanzando proyecciones de atencion y las dos capas feed-forward.

La parte tecnicamente relevante de este repositorio no es el entrenamiento del LoRA, que se realizo en el proyecto original, sino la conversion de formato. Se aplican cuatro transformaciones: (1) fusion de q/k/v en `qkv_proj`, con `A = [A_q; A_k; A_v]` por filas y `B = block_diag(B_q, B_k, B_v)` en orden de filas `[q; k; v]`, resultando en A de `[384, 5376]` y B de `[21504, 384]`; (2) remapeo SwiGLU, porque Diffusers emite `[value; gate]` y el `_swiglu_eager` de H3 en ComfyUI espera `[gate; up]`, de modo que se intercambian las dos mitades de 14336 filas de cada `mlp.fc1.lora_B`; (3) ajuste de las entradas alpha (`qkv_proj = 384`, es decir 3 x 128, y `out_proj/fc1/fc2 = 128`), lo que hace que la escala `alpha/rank` de ComfyUI sea 1.0, coincidiendo con la escala de fusion PDMD `W += (B @ A)`; y (4) renombrado de rutas (`to_out.0` a `attn.out_proj`, `ff.net.0.proj` a `mlp.fc1`, `ff.net.2` a `mlp.fc2`, `transformer_blocks.N` a `blocks.N` y `token_refiner.refiner_blocks.N` a `token_refiner.blocks.N`). El autor indica que MiniMax-H3 esta destilado con guidance, por lo que no se usa CFG.

## Capacidades

- Generacion de video texto-a-video con el modelo base MiniMax-H3, en el punto de operacion de 4 pasos de denoising.
- Aceleracion del muestreo: el LoRA convierte un flujo de 8 pasos en uno de 4 pasos, reduciendo a la mitad el numero de evaluaciones de funcion del transformer.
- Integracion en ComfyUI mediante el nodo `LoraLoaderModelOnly`, aplicado solo a la parte de modelo (el text encoder de H3 se carga por separado).
- Compatibilidad con el cargador H3 estandar de ComfyUI y con pesos base cuantizados a int8 con rotacion de convolucion.
- Capacidades multimodales heredadas del modelo base segun las fuentes publicas: salida de video multimodal, audio estereo 3D nativo en cada clip, resoluciones de hasta 2K y duraciones de 5 a 15 segundos por generacion.
- Soporte de tool calling / function calling: no disponible (no es una capacidad declarada de este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio como caracteristica propia del adaptador: no disponible (la componente de audio procede del H3 base).

## Casos de uso

- Prototipado rapido de video generativo en estaciones de trabajo con ComfyUI: al reducir el muestreo a 4 pasos, permite iterar sobre prompts y semillas con un coste computacional aproximadamente la mitad que el flujo de 8 pasos, lo que acelera la exploracion creativa antes de un render final de mayor calidad.
- Produccion de clips cortos para redes sociales: el modelo base genera piezas de 5 a 15 segundos con audio estereo nativo, de modo que el LoRA permite producir borradores con voz y sonido sincronizados sin una segunda pasada de audio.
- Previsualizacion de storyboards en estudios de animacion y publicidad: con 4 NFE se pueden generar versiones animaticas de una secuencia para validar encuadre y ritmo antes de comprometer recursos en un render a mayor resolucion.
- Generacion por lotes en pipelines automatizados de contenido: la ausencia de CFG y el bajo numero de pasos simplifican el grafo de inferencia, lo que facilita encadenar generaciones en serie dentro de un flujo de trabajo programado.
- Investigacion en destilacion de modelos de difusion: el repositorio documenta paso a paso la conversion entre el esquema PEFT de Diffusers y el layout de ComfyUI, incluyendo el remapeo SwiGLU y el ajuste de alpha, lo que lo convierte en una referencia util para reproducir el proceso con otros adaptadores.
- Experimentacion con pesos cuantizados: el autor verifica la correspondencia de las 208 claves contra una variante int8 con rotacion de convolucion, de modo que el LoRA es util para probar flujos destilados sobre modelos base comprimidos.
- Evaluacion comparativa de metodos de aceleracion: permite contrastar en igualdad de condiciones un estudiante de 4 pasos frente al LoRA turbo de 8 pasos sobre el mismo H3, midiendo calidad y tiempo de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada en la model card es de equivalencia numerica: se comprobo que las 208 claves destino existen con dimensiones coincidentes en `minimax_h3_ref2va_int8_convrot.safetensors` y que cada tensor es numericamente identico al original tras aplicar las transformaciones descritas. No se aportan metricas de calidad de video (FVD, CLIP score, VBench) ni comparaciones cuantitativas con el LoRA turbo de 8 pasos.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Al tratarse de un adaptador LoRA, la memoria necesaria la determina el modelo base MiniMax-H3-33B, no el propio LoRA.
- El repositorio ocupa 9,4 GB, pero el adaptador se suma a los pesos base; no sustituye a la descarga de MiniMax-H3.
- GPU recomendadas: no disponible. No se especifica en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI con el cargador H3 estandar y el nodo `LoraLoaderModelOnly` (modelo y text encoder cargados por separado). Existen nodos de Comfy-Org y pesos en formato nativo para Comfy segun las fuentes publicas. No se documentan otros backends (vLLM, llama.cpp, TGI, Ollama) para este modelo.
- Configuracion de muestreo obligatoria: 4 pasos de denoising, scheduler de H3 (shift 12 para video y 3 para audio), sin CFG y con fuerza del LoRA fijada a 1.0.
- Latencia y throughput: no disponible en valores absolutos. Se sabe que el punto de operacion es de 4 NFE frente a los 8 NFE del LoRA turbo referenciado, lo que reduce a la mitad el numero de pasos de muestreo, pero sin datos de tiempo por paso no puede traducirse a una cifra de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Rango LoRA | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Iwannapose/minimax_h3_pdmd_4nfe_comfyui | Adaptador LoRA destilado (PDMD) | 4 NFE | 128 | safetensors, layout ComfyUI H3 | apache-2.0 | Publico en HuggingFace; 0 descargas, 1 like |
| pdmd2026/pdmd_4NFE_lora | Adaptador LoRA destilado (PDMD), original | 4 NFE | 128 | safetensors, PEFT de Diffusers | No disponible | Publico en HuggingFace |
| minimax_h3_fl2v_turbo_8step_v1.0_768p_comfyui_bf16 | Adaptador LoRA turbo para H3 | 8 NFE | No disponible | safetensors, ComfyUI | No disponible | Referenciado en la model card |
| MiniMaxAI/MiniMax-H3 (base) | Modelo completo de generacion de video | No disponible | No aplica | Multiples formatos | No disponible | Pesos abiertos y nodos de socio en Comfy, segun fuentes publicas |

La comparacion directa entre el PDMD 4-NFE y el turbo de 8 pasos no puede cerrarse con datos de calidad: la model card no publica metricas de ninguna de las dos variantes. La diferencia documentada y verificable es el numero de pasos de muestreo.

## Limitaciones y advertencias

- Es un LoRA, no un modelo autonomo: no puede ejecutarse sin los pesos del modelo base MiniMax-H3 (MiniMax-H3-33B).
- La fuerza debe fijarse exactamente a 1.0. Cualquier otro valor escala el delta de destilacion y altera el comportamiento a 4 pasos; el autor advierte explicitamente de que no debe usarse como un LoRA de estilo parcial.
- El modelo esta pensado para 4 pasos de denoising. Usarlo con otro numero de pasos queda fuera de su punto de operacion y no esta validado.
- No debe usarse CFG: MiniMax-H3 esta destilado con guidance, por lo que aplicar classifier-free guidance contradice el flujo previsto.
- Historial de versiones problematico: las conversiones base, keys_v2, v3, v4 y v5 se retiraron por estar rotas. En varias de ellas la mayoria de las claves no coincidian con nada en el cargador de ComfyUI, produciendo un no-op silencioso, y la v4 omitia el remapeo SwiGLU de gate y value. Debe usarse exclusivamente la v6.
- Validacion limitada: la verificacion reportada es de equivalencia numerica de tensores, no de calidad perceptiva ni de metricas objetivas de video.
- Adopcion practica nula: 0 descargas y 1 like en el momento de la consulta, sin evidencia de uso en produccion por terceros.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo del adaptador ni del modelo base.
- Riesgo de alucinacion: no disponible para el adaptador; en generacion de video se traduce en posibles inconsistencias visuales o de audio no evaluadas en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponible. Ni la ventana de contexto ni los idiomas soportados se declaran.
- Licencia: el adaptador se publica bajo apache-2.0, pero la licencia del modelo base MiniMax-H3 no se detalla en la informacion disponible; conviene verificar las condiciones del H3 antes de un uso comercial.
- Caveat de produccion: al requerir un modelo base de 33B y un repositorio de 9,4 GB, el coste real de despliegue lo marca el H3, no este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Iwannapose/minimax_h3_pdmd_4nfe_comfyui
- LoRA PDMD 4-NFE original: https://huggingface.co/pdmd2026/pdmd_4NFE_lora
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio oficial en GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Repositorio de la comunidad MiniMax-H3 Hub (ComfyUI Workflows): https://github.com/ai-models-lab/minimax-h3
- Pesos y nodos de Comfy-Org para MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- Pagina de MiniMax-H3 en Comfy: https://comfy.org/minimax-h3/
- Tutoriales y despliegue oficiales de MiniMax H3: https://design.minimax.io/h3
