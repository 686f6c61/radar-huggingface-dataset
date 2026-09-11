# moritztng/protenix-v0.5.0

## Resumen

Protenix v0.5.0 es el checkpoint base de Protenix, una reproduccion abierta de AlphaFold 3 desarrollada por ByteDance, orientada a la prediccion de estructura tridimensional de proteinas, acidos nucleicos y sus complejos con ligandos. Este repositorio concreto (`moritztng/protenix-v0.5.0`) no es un modelo nuevo ni un reentrenamiento: es un espejo byte a byte del fichero publicado por el autor original, con licencia Apache 2.0, cuyo unico proposito es servir los pesos desde un host alcanzable cuando la infraestructura de origen no es accesible.

El problema que resuelve este espejo es operativo, no cientifico. Upstream distribuye el fichero desde un unico bucket de Volcengine en Pekin; segun la propia model card, una red que no puede enrutar hasta alli recibe una conexion TCP aceptada que no envia nada, de modo que la instalacion se queda colgada en lugar de fallar de forma explicita. Esta copia entrega los mismos bytes desde un host que responde desde cualquier ubicacion, y se publica para que `tt-bio` (que ejecuta Protenix sobre aceleradores Tenstorrent) pueda descargarla, aunque el fichero no tiene nada especifico de `tt-bio` y sirve para cualquier instalacion de Protenix.

El checkpoint ocupa 1.474.265.486 bytes y se distribuye como un unico fichero PyTorch (`model_v0.5.0.pt`). Todo lo relativo a arquitectura, numero de parametros, datos de entrenamiento, cuantizaciones alternativas y benchmarks no aparece en la informacion proporcionada y se marca como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (reproduccion abierta de AlphaFold 3; la model card no detalla la arquitectura interna) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Solo se distribuye el checkpoint sin cuantizar; el autor indica explicitamente "not quantised" |
| Idiomas soportados | No disponible (la entrada son secuencias biologicas, no texto en lenguaje natural) |
| Licencia | Apache 2.0 (Copyright 2024 ByteDance and/or its affiliates) |
| Formato de pesos | PyTorch, fichero unico `model_v0.5.0.pt` (1.474.265.486 bytes) |
| sha256 | `9ea20b0aba42f2256711da1d0cd081510a4b291e64375bff6b70ced70b87a5f1` |
| Ambito de prediccion | Estructura 3D de proteinas, acidos nucleicos y complejos con ligandos |
| Version upstream | ByteDance Protenix, tag `v0.5.0` |
| Tipo de publicacion | Espejo no modificado (no reentrenado, no cuantizado, no convertido) |

## Arquitectura y entrenamiento

La model card no incluye informacion sobre la arquitectura interna del modelo, el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens o residuos vistos durante el entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico que se declara es la finalidad del modelo: predecir la estructura tridimensional de proteinas, acidos nucleicos y sus complejos con ligandos, como reproduccion abierta de AlphaFold 3. Cualquier detalle adicional sobre el diseno de la red, el modulo de difusion, el procesamiento de MSA o las innovaciones tecnicas debe consultarse en el repositorio upstream `bytedance/Protenix`, no en este repositorio.

Respecto al proceso de publicacion de este espejo, si hay informacion verificable: el fichero se copia byte a byte desde la URL upstream que `protenix/web_service/dependency_url.py` referencia en el tag `v0.5.0` (`https://af3-dev.tos-cn-beijing.volces.com/release_model/model_v0.5.0.pt`). El hash sha256 se obtuvo de una descarga fresca desde upstream y se comparo contra esta copia. La redistribucion se ampara en la seccion 4 de la licencia Apache 2.0: el texto de la licencia viaja con el fichero, los avisos se mantienen sin cambios y el fichero no esta modificado.

## Capacidades

- Prediccion de estructura 3D de proteinas a partir de secuencia.
- Prediccion de estructura de acidos nucleicos.
- Prediccion de complejos proteina-ligando.
- Prediccion de complejos entre proteinas y acidos nucleicos (el modelo cubre "proteinas, acidos nucleicos y sus complejos con ligandos").
- Ejecucion local mediante el codigo upstream de Protenix o mediante `tt-bio` sobre aceleradores Tenstorrent.
- Soporte de tool calling / function calling: no aplica, no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica, no disponible.
- Capacidades multilingues: no disponible; el modelo opera sobre secuencias biologicas.
- Capacidades multimodales (vision, audio) o modo "thinking": no disponible.

No se declaran en la informacion proporcionada otras capacidades, tasas de acierto ni limites de tamano de entrada (numero maximo de residuos o cadenas).

## Casos de uso

- Prediccion de estructuras proteicas en pipelines de biologia estructural: descarga del checkpoint y ejecucion con Protenix upstream sobre un fichero FASTA para obtener la estructura 3D de una proteina de interes antes de intentar cristalografia o criomicroscopia electronica.
- Modelado de complejos proteina-ligando en descubrimiento de farmacos: el modelo cubre explicitamente complejos con ligandos, por lo que puede usarse para generar hipotesis de union que guien el diseno de moleculas candidatas.
- Prediccion de complejos proteina-acido nucleico: util para estudiar interacciones entre factores de transcripcion y ADN o ARN, o entre proteinas de union a ARN y sus dianas.
- Analisis de complejos multimoleculares: al soportar complejos, permite modelar ensamblajes donde intervienen varias cadenas, no solo monomeros aislados.
- Validacion cruzada de resultados experimentales: generar un modelo computacional y compararlo con densidades de criomicroscopia electronica o mapas de difraccion para detectar discrepancias.
- Entornos con conectividad restringida o detras de cortafuegos corporativos: el motivo declarado del espejo es precisamente permitir la instalacion cuando la red no puede enrutar al bucket de origen; en esos casos, la descarga desde Hugging Face evita instalaciones que se quedan colgadas.
- Despliegue sobre aceleradores Tenstorrent: `tt-bio predict --model protenix-v1 <fasta>` descarga directamente desde este repositorio, de modo que el flujo funciona sin depender del host original.
- Integracion en infraestructura de investigacion reproducible: al publicarse el sha256, un pipeline puede verificar la integridad del fichero antes de usarlo, lo que facilita la trazabilidad en entornos cientificos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del fichero de pesos: 1.474.265.486 bytes (aproximadamente 1,47 GB en base decimal, unos 1,37 GiB). Ese es el unico dato objetivo de footprint disponible.
- VRAM estimada para inferencia: no disponible como cifra oficial. El peso de los parametros en el fichero es de aproximadamente 1,4 GB, de modo que el almacenamiento de los pesos encaja en GPUs con 2 GB o mas, pero el consumo real durante la inferencia (activaciones, representaciones intermedias y modulos de prediccion de estructura) no se declara en la model card y no puede calcularse a partir de la informacion proporcionada.
- GPU recomendadas: no disponible. La documentacion de este repositorio no especifica modelos de GPU ni requisitos minimos.
- Compatibilidad con GPU de consumo: no confirmada. Solo puede afirmarse que el fichero de pesos es pequeno en terminos absolutos; no hay datos sobre si una RTX 4090 u otra GPU de consumo completa una inferencia.
- Opciones de despliegue: Protenix upstream (repositorio `bytedance/Protenix`, tag `v0.5.0`) y `tt-bio` sobre aceleradores Tenstorrent. No se mencionan vLLM, llama.cpp, Ollama ni TGI; son servidores de modelos de lenguaje y no aplican a este tipo de modelo.
- Instalacion manual: `huggingface-cli download moritztng/protenix-v0.5.0 model_v0.5.0.pt --local-dir .`
- Verificacion de integridad: `sha256sum model_v0.5.0.pt` debe devolver `9ea20b0aba42f2256711da1d0cd081510a4b291e64375bff6b70ced70b87a5f1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos comparativos de otros modelos. El unico referente citado en la model card es AlphaFold 3, del que Protenix se declara reproduccion abierta, pero no se aportan cifras de parametros, contexto, rendimiento ni licencia de esa referencia. Por tanto:

| Modelo | Parametros | Contexto | Licencia | Pesos abiertos | Datos comparativos |
|---|---|---|---|---|---|
| Protenix v0.5.0 (este espejo) | no disponible | no disponible | Apache 2.0 | Si (fichero `.pt` unico) | no disponible |
| AlphaFold 3 (referencia citada en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras alternativas de prediccion de estructura | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Este repositorio es un espejo, no un desarrollo propio: no aporta mejoras, correcciones ni soporte tecnico sobre el modelo original. Cualquier problema de prediccion debe reportarse upstream.
- No se declaran sesgos conocidos, pero tampoco se documenta la composicion del dataset de entrenamiento, lo que impide evaluar sesgos de cobertura estructural o taxonomica.
- Riesgo de alucinacion: en modelos de prediccion estructural el equivalente es una estructura de baja calidad o mal plegada presentada con alta confianza. La model card no documenta metricas de calibracion (pLDDT, PAE u otras) ni umbrales de uso recomendados.
- Limitaciones de contexto: se desconoce el numero maximo de residuos o cadenas que el modelo puede procesar.
- Limitaciones de idioma: no aplica en el sentido habitual; la entrada es secuencial/biologica, no texto.
- Licencia: Apache 2.0 permite uso comercial, pero la redistribucion exige conservar el texto de la licencia y los avisos, y el copyright pertenece a ByteDance. Este espejo cumple esas condiciones al no modificar el fichero.
- El fichero se distribuye unicamente en el formato original sin cuantizar; no hay variantes GGUF, safetensors ni cuantizadas en este repositorio.
- Al no publicarse benchmarks ni requisitos de hardware, no hay base para estimar si el modelo es adecuado para un caso de uso concreto frente a alternativas.
- La fecha de creacion del repositorio que figura en los metadatos es 2026-09-10, posterior a la fecha de consulta habitual de este tipo de fichas; conviene verificar la vigencia del tag upstream `v0.5.0` antes de integrarlo en produccion.
- Ausencia de senal de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica que no hay validacion por parte de la comunidad sobre esta copia concreta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moritztng/protenix-v0.5.0
- Codigo upstream de Protenix (ByteDance): https://github.com/bytedance/Protenix
- Herramienta que motiva el espejo: https://github.com/moritztng/tt-bio
- URL upstream del checkpoint segun `dependency_url.py` en el tag `v0.5.0`: https://af3-dev.tos-cn-beijing.volces.com/release_model/model_v0.5.0.pt
- Texto completo de la licencia: fichero `LICENSE` incluido en el repositorio (Apache 2.0)
- Resultados de busqueda web: no se han encontrado enlaces adicionales relevantes (los resultados devueltos no guardan relacion con el modelo)
