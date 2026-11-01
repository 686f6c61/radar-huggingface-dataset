# datasolin/sam-3d-objects-mirror

## Resumen

SAM 3D Objects es un sistema de Meta (Facebook Research) para reconstruccion 3D de objetos a partir de imagenes, presentado en el paper *SAM 3D: 3Dfy Anything in Images* (arXiv:2511.16624, 2025). El repositorio `datasolin/sam-3d-objects-mirror` es un espejo no oficial, publicado por Data Solin, que contiene unicamente el subconjunto de checkpoints necesario para generar mallas (mesh) en su funcionalidad CAD de image-to-3D. No es un modelo de lenguaje: es un pipeline generativo multimodal imagen-a-malla 3D.

El pipeline se compone de cuatro modulos empaquetados en formato `.ckpt` (PyTorch): un generador de geometria (`ss_generator`, 6,69 GB), su decodificador (`ss_decoder`, 148 MB), un generador de representaciones SLAT texturizadas (`slat_generator`, 4,91 GB) y un decodificador de malla (`slat_decoder_mesh`, 364 MB). En total, el repositorio ocupa 12,1 GB. Los ficheros son copia byte a byte de la revision `2e73555018d2741ccd486e56c24fac41155a1dc6` del repositorio oficial `facebook/sam-3d-objects`, con SHA-256 identico.

Su relevancia es practica: permite a terceros integrar la generacion de mallas de SAM 3D Objects sin depender del repositorio completo de Meta, que incluye ademas decodificadores de Gaussian splats y encoders no presentes aqui. La redistribucion es legal bajo la SAM License, que exige mantener la licencia y citar el paper en publicaciones de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline generativo multimodal imagen-a-3D con modulos separados: generador de geometria (`ss_generator`), decodificador de forma (`ss_decoder`), generador SLAT texturizado (`slat_generator`) y decodificador de malla (`slat_decoder_mesh`). Detalle interno de la arquitectura no disponible en la informacion proporcionada |
| Parametros totales | No disponible (solo se publican tamanos en bytes de los checkpoints) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo imagen-a-3D, no de texto) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en formato `.ckpt` (PyTorch) sin variantes cuantizadas |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | SAM License (`license_name: sam-license`, `license: other`), con restricciones de control de exportaciones (ITAR) y obligacion de atribucion en investigacion |
| Formato de pesos | PyTorch `.ckpt` (checkpoints) y ficheros de configuracion `.yaml` |

Desglose de ficheros del repositorio:

| Fichero | Bytes |
|---|---:|
| `checkpoints/pipeline.yaml` | 3.548 |
| `checkpoints/ss_generator.yaml` | 5.076 |
| `checkpoints/ss_generator.ckpt` | 6.690.136.964 |
| `checkpoints/ss_decoder.yaml` | 244 |
| `checkpoints/ss_decoder.ckpt` | 147.609.242 |
| `checkpoints/slat_generator.yaml` | 1.986 |
| `checkpoints/slat_generator.ckpt` | 4.906.537.684 |
| `checkpoints/slat_decoder_mesh.yaml` | 300 |
| `checkpoints/slat_decoder_mesh.ckpt` | 363.726.862 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo mas alla de la descomposicion del pipeline en generadores y decodificadores. Por los nombres de los modulos se infiere un esquema en dos etapas: una primera etapa de generacion de geometria (`ss_generator` + `ss_decoder`) que produce la forma del objeto, y una segunda etapa SLAT (representacion latente estructurada, presumiblemente) que genera apariencia texturizada (`slat_generator`) y se decodifica a malla final (`slat_decoder_mesh`). El repositorio no incluye los encoders de imagen ni los decodificadores de Gaussian splats, presentes en el repositorio oficial de Meta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. El paper de referencia es *SAM 3D: 3Dfy Anything in Images* (SAM 3D Team et al., 2025, arXiv:2511.16624), donde deberia consultarse el detalle de entrenamiento. La unica innovacion tecnica verificable desde este repositorio es la separacion modular del pipeline, que permite usar solo los componentes necesarios para generar mallas sin cargar los decodificadores de splats.

## Capacidades

- Generacion de mallas 3D de objetos a partir de imagenes (pipeline `image-to-3d`).
- Generacion de geometria del objeto mediante `ss_generator` y `ss_decoder`.
- Generacion de apariencia texturizada mediante `slat_generator` y decodificacion a malla con `slat_decoder_mesh`.
- Integracion en herramientas CAD (uso declarado por el redistribuidor, Solin CAD).
- No incluye capacidades de texto, razonamiento, codigo, matematicas, vision comprensiva, tool calling, agentes ni multilingues: es un modelo puramente generativo 3D.
- No incluye decodificadores de Gaussian splats ni encoders en este espejo, por lo que no permite ejecutar el pipeline completo de Meta tal cual.

## Casos de uso

- Digitalizacion de assets para CAD: a partir de una fotografia de un objeto fisico, generar una malla 3D que sirva como base editable en herramientas de diseno mecanico, aprovechando que el espejo incluye exactamente los modulos de generacion de malla que necesita Solin CAD.
- Prototipado rapido de producto: generar mallas de objetos cotidianos para iterar sobre formas antes de modelar en detalle, usando `ss_generator` para la geometria y `slat_generator` para la textura.
- Creacion de contenido para videojuegos y realidad aumentada: producir mallas texturizadas de objetos a partir de capturas fotograficas para poblar escenas 3D, con la ventaja de que el pipeline separa geometria y apariencia.
- Catalogos de e-commerce en 3D: convertir fotos de producto en mallas visualizables en web o AR, usando el decodificador de malla `slat_decoder_mesh` para obtener la geometria final.
- Investigacion en vision 3D: reproducir o extender los resultados de SAM 3D Objects usando un subconjunto de checkpoints verificado por SHA-256, sin descargar el repositorio completo de Meta.
- Pipelines de reconstruccion por lotes: desplegar los checkpoints en un servicio interno que reciba imagenes y devuelva mallas, dado que el espejo solo carga los modulos necesarios (menor huella que el repo oficial).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo de checkpoints y no incluye metricas de evaluacion; para resultados cuantitativos debe consultarse el paper arXiv:2511.16624.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los checkpoints suman aproximadamente 12,1 GB en disco en precision original; cargar `ss_generator` (6,69 GB) y `slat_generator` (4,91 GB) simultaneamente en FP32/FP16 requiere VRAM sustancialmente mayor que el tamano en disco, pero no se dispone de cifras verificadas.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano de los checkpoints, se espera que requiera GPU de datacenter (A100, H100) o GPUs de consumo de gama alta con suficiente VRAM; sin confirmacion oficial.
- Compatibilidad con GPU de consumo: no confirmada; el espejo no documenta requisitos minimos.
- Opciones de despliegue: el codigo oficial es el repositorio `facebookresearch/sam-3d-objects`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo 3D). El formato `.ckpt` requiere PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de image-to-3D. Como referencia cualitativa, el propio repositorio se posiciona frente al repositorio oficial `facebook/sam-3d-objects`, del que es un subconjunto:

| Aspecto | `datasolin/sam-3d-objects-mirror` | `facebook/sam-3d-objects` (oficial) |
|---|---|---|
| Contenido | Solo modulos de generacion de malla | Pipeline completo, incluidos decodificadores de Gaussian splats y encoders |
| Tamano | 12,1 GB | Mayor (no disponible la cifra exacta) |
| Licencia | SAM License | SAM License |
| Mantenimiento | Espejo no oficial, sin soporte de Meta | Oficial, soportado por Meta |
| Verificacion | SHA-256 identico al oficial en la revision indicada | Fuente original |

## Limitaciones y advertencias

- Es un espejo no oficial: Meta no lo respalda ni le da soporte; los problemas deben reportarse contra el repositorio oficial o el redistribuidor.
- No incluye encoders ni decodificadores de Gaussian splats, por lo que no reproduce el pipeline completo de SAM 3D Objects; solo genera mallas.
- La SAM License prohibe usos sujetos a ITAR y fines militares, nucleares, espionaje, desarrollo de armas o armas ilegales; tambien exige cumplimiento de sanciones de EE. UU., ONU, UE y Reino Unido.
- La redistribucion de los ficheros o de obras derivadas debe hacerse bajo la SAM License e incluir una copia de la misma.
- Publicar investigacion basada en estos pesos obliga a citar *SAM 3D: 3Dfy Anything in Images* (SAM 3D Team et al., 2025).
- Los ficheros se proporcionan "as is", sin garantia de ningun tipo.
- No se documentan sesgos, tasas de alucinacion geometrica ni limitaciones de contexto o idioma; al ser un modelo 3D, el riesgo principal es la fidelidad de la reconstruccion, no verificada en la informacion disponible.
- El numero de descargas (9) y likes (0) sugiere adopcion muy baja; conviene validar los checkpoints contra los SHA-256 publicados antes de usarlos en produccion.

## Enlaces

- Repositorio del espejo: https://huggingface.co/datasolin/sam-3d-objects-mirror
- Repositorio oficial de Meta: https://huggingface.co/facebook/sam-3d-objects
- Codigo oficial: https://github.com/facebookresearch/sam-3d-objects
- Paper: https://arxiv.org/abs/2511.16624
- Licencia (copia en el repo): https://huggingface.co/datasolin/sam-3d-objects-mirror/blob/main/LICENSE
