# mr-cabbage/event-sae-libero

## Resumen

Event-SAE LIBERO es una coleccion de checkpoints de autoencoders dispersos (sparse autoencoders, SAE) tipo BatchTopK entrenados sobre las activaciones internas de dos familias de politicas Vision-Language-Action (VLA): OpenVLA y OpenPI (pi0.5). No es un modelo generativo ni un modelo de lenguaje, sino una herramienta de interpretabilidad: permite descomponer las representaciones internas de una politica VLA en caracteristicas dispersas y analizables. Lo publica el usuario mr-cabbage (repositorio `mr-cabbage/event-sae-libero`) y acompana al articulo "Event-Grounded Sparse Autoencoders for Vision-Language-Action Policies" (arXiv 2605.17204, NeurIPS 2026).

El problema que resuelve es la falta de transparencia de las politicas VLA entrenadas para control robotico: entender que representaciones internas codifican el estado, la instruccion o la accion. Los checkpoints cubren tareas del benchmark LIBERO (Spatial, Object, Goal, LIBERO-10) para OpenVLA y LIBERO-Spatial para OpenPI, e incluyen tanto componentes de vision-lenguaje (PaliGemma) como el modulo de accion ("action expert").

El repositorio ocupa 5,5 GB e incluye, por cada checkpoint, un fichero `ae.pt` y su `config.json`. Todos los SAE se entrenan sobre la salida del bloque transformer (`resid_post`) con un presupuesto activo de 64 caracteristicas (BatchTopK), licencia MIT y libreria `event-sae`. Los resultados de busqueda web realizados no aportan informacion adicional relevante sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (BatchTopK) sobre activaciones `resid_post` de politicas VLA (OpenVLA y OpenPI/pi0.5) |
| Parametros totales | No publicado; dimensionado por checkpoint (p. ej. OpenVLA: dim. activacion 4.096, tamano de diccionario 32.768) |
| Parametros activos | No aplica (no es MoE); presupuesto activo BatchTopK = 64 caracteristicas por token |
| Longitud de contexto | No aplica (el SAE no procesa contexto; depende del modelo subyacente, no especificado) |
| Tipos de cuantizacion | No disponible (pesos en `ae.pt`, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo VLA; el articulo no detalla cobertura linguistica) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`ae.pt`) + `config.json` |

Detalle de checkpoints:

| Backbone | Componente | Capa | Dim. activacion | Tamano diccionario |
|---|---|---:|---:|---:|
| OpenVLA | Bloque transformer | 31 | 4.096 | 32.768 |
| OpenPI (pi0.5) | Action expert | 0 | 1.024 | 1.024 |
| OpenPI (pi0.5) | Action expert | 5 | 1.024 | 1.024 |
| OpenPI (pi0.5) | Action expert | 17 | 1.024 | 1.024 |
| OpenPI (pi0.5) | PaliGemma | 0 | 2.048 | 2.048 |
| OpenPI (pi0.5) | PaliGemma | 11 | 2.048 | 2.048 |
| OpenPI (pi0.5) | PaliGemma | 16 | 2.048 | 2.048 |

Suites OpenVLA y configuracion de entrenamiento:

| Suite | Carpeta | Learning rate | Pasos | Version |
|---|---|---|---|---|
| LIBERO-Spatial | `libero_spatial_lr5e-5/` | 5e-5 | 4.000 | Checkpoint del articulo |
| LIBERO-Spatial | `libero_spatial_lr1e-4/` | 1e-4 | 15.000 | Reentrenado (batch 40.000) |
| LIBERO-Object | `libero_object/` | 1e-4 | 15.000 | Checkpoint del articulo |
| LIBERO-Goal | `libero_goal/` | 1e-4 | 15.000 | Checkpoint del articulo |
| LIBERO-10 | `libero_10/` | 1e-4 | 15.000 | Checkpoint del articulo |

## Arquitectura y entrenamiento

Cada checkpoint es un autoencoder disperso con activacion BatchTopK: una capa codificadora proyecta la activacion del modelo subyacente (dimension 4.096 en OpenVLA, 1.024 en el action expert de OpenPI, 2.048 en PaliGemma) a un diccionario de caracteristicas (32.768, 1.024 y 2.048 respectivamente) y una capa decodificadora reconstruye la activacion original. El BatchTopK impone un presupuesto activo de 64 caracteristicas simultaneas por token, lo que produce representaciones dispersas y comparables entre checkpoints.

El entrenamiento se realizo sobre activaciones extraidas de la salida del bloque transformer (`resid_post`) de las politicas, con datos procedentes del benchmark LIBERO. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO (no aplicables a un SAE). El articulo asociado introduce el enfoque de SAE "event-grounded", orientado a vincular caracteristicas con eventos del entorno, aunque los detalles metodologicos completos no se incluyen en la model card.

## Capacidades

- Descomposicion interpretable de activaciones internas de politicas VLA (OpenVLA y OpenPI/pi0.5) en caracteristicas dispersas.
- Extraccion de representaciones en multiples capas y componentes: bloque transformer de OpenVLA, y capas del action expert y de PaliGemma en OpenPI.
- Analisis de caracteristicas ("event analysis") y pipeline de intervencion, disponibles en el repositorio de codigo `xc-j/Event-SAE`.
- Carga reproducible mediante `load_batch_topk_sae` de la libreria `event-sae`, con soporte explicito de `device="cuda"`.
- Comparacion entre checkpoints del mismo backbone (distintas suites LIBERO) y entre backbones (OpenVLA frente a OpenPI).
- No realiza generacion de texto, razonamiento, codigo ni tool calling: no es un modelo generativo.
- No dispone de capacidades multilingues, de vision directa ni de audio propias; opera sobre las activaciones de otro modelo.
- No hay soporte documentado de agentes, function calling ni multi-step reasoning.

## Casos de uso

- Investigacion en interpretabilidad mecanicista de politicas VLA: cargar el SAE de la capa 31 de OpenVLA y analizar que caracteristicas se activan ante distintos estados de la tarea LIBERO-Spatial.
- Auditoria de seguridad de politicas roboticas: identificar caracteristicas asociadas a comportamientos no deseados y aplicar intervenciones sobre las activaciones antes de desplegar el controlador.
- Depuracion de fallos de una politica: comparar la activacion de caracteristicas entre episodios exitosos y fallidos en LIBERO-Object o LIBERO-Goal para localizar la representacion responsable.
- Transferencia entre backbones: usar los SAE de PaliGemma y del action expert en OpenPI (pi0.5) para estudiar como se relacionan las representaciones de vision-lenguaje con las de generacion de acciones.
- Analisis comparativo de checkpoints: contrastar `libero_spatial_lr5e-5` con `libero_spatial_lr1e-4` para evaluar como cambian los identificadores de caracteristica y su ranking segun el regimen de entrenamiento.
- Investigacion academica reproducible: utilizar los checkpoints del articulo (configuracion 1e-4 / 15.000 pasos) para replicar las conclusiones publicadas sobre LIBERO-Spatial, Object, Goal y LIBERO-10.
- Generacion de datasets de caracteristicas para interpretabilidad: extraer activaciones dispersas por token y reutilizarlas en analisis posteriores o en el entrenamiento de clasificadores auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda web no incluyen metricas comparativas (tasas de exito en LIBERO, reconstruccion del SAE, ni valores de interpretabilidad).

## Requisitos de hardware

- Tamano total del repositorio: 5,5 GB para el conjunto completo de checkpoints.
- VRAM por checkpoint: no especificada. El de mayor dimension (OpenVLA, 4.096 x 32.768) es el mas exigente del conjunto; los de OpenPI (1.024 x 1.024 y 2.048 x 2.048) son mucho mas ligeros. No se publican cifras exactas.
- GPU: la model card solo especifica `device="cuda"` en el ejemplo de carga; no recomienda modelos concretos (A100, H100, RTX 4090, etc.).
- Viabilidad en GPU de consumo: no confirmada explicitamente, aunque el tamano de los checkpoints es reducido en comparacion con los modelos VLA subyacentes.
- Nota importante: los SAE se aplican sobre OpenVLA (aprox. 7B) y OpenPI (pi0.5), cuyo coste de inferencia es muy superior al del propio SAE; los requisitos relevantes en produccion son los del modelo VLA, no los del autoencoder.
- Opciones de despliegue: no documentadas (vLLM, llama.cpp, Ollama o TGI no son aplicables a un SAE). El despliegue previsto es la carga en PyTorch con la libreria `event-sae`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras colecciones de SAE para politicas VLA ni datos que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 "likes", por lo que no hay evidencia de validacion por parte de la comunidad.
- No es un modelo autonomo: solo es util acompanado de la politica VLA subyacente (OpenVLA o OpenPI/pi0.5) y de la libreria `event-sae`.
- Los identificadores de caracteristica no son estables entre checkpoints: la model card advierte que el SAE `libero_spatial_lr1e-4` (reentrenado con batch 40.000) produce identificadores y rankings distintos del checkpoint del articulo; usar `libero_spatial_lr5e-5` para replicar los resultados publicados.
- Cobertura limitada: OpenVLA cubre cuatro suites LIBERO, mientras que OpenPI solo se entrena en LIBERO-Spatial.
- No se especifican sesgos conocidos, tasas de alucinacion ni limitaciones linguisticas; al no ser un modelo generativo, estas categorias no aplican directamente.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de los modelos subyacentes (OpenVLA, OpenPI/pi0.5, PaliGemma) antes de un uso en produccion.
- Los resultados de busqueda web realizados no devolvieron informacion relevante sobre este repositorio; la verificacion externa es limitada.
- Las fechas del repositorio (creacion y actualizacion en 2026-10) y el identificador arXiv (2605.17204) no han podido contrastarse con fuentes externas en la busqueda disponible.

## Enlaces

- HuggingFace: https://huggingface.co/mr-cabbage/event-sae-libero
- Articulo: https://arxiv.org/abs/2605.17204
- Repositorio de codigo: https://github.com/xc-j/Event-SAE
- Libreria de carga: `event-sae` (instalable desde el repositorio anterior)
