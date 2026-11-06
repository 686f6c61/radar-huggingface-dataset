# oteam/solublempnn

## Resumen

SolubleMPNN es una implementación no oficial, publicada por el equipo OFoldX (oteam), del modelo ProteinMPNN descrito por Justas Dauparas et al. en *Science* ("Robust deep learning-based protein sequence design using ProteinMPNN", DOI 10.1126/science.add2187). Se trata de un modelo de *inverse folding* (plegado inverso): dado un esqueleto (backbone) proteico fijo, genera una secuencia de aminoácidos compatible con esa geometría, o bien puntúa secuencias existentes frente al backbone. La variante "Soluble" está especializada en proteínas solubles.

Es relevante porque ProteinMPNN es uno de los estándares de facto en diseño racional de proteínas dentro del ecosistema de David Baker, y esta versión se integra en la librería `ofoldx` con pesos en safetensors y una API de pipelines tipo Hugging Face. El modelo es muy pequeño (1,674 millones de parámetros, arquitectura de paso de mensajes con hidden size 128, 3 bloques de encoder y 3 de decoder, 48 vecinos), por lo que es ejecutable en CPU o en GPUs modestas. Existen variantes con ruido de entrenamiento de 0,02, 0,10, 0,20 y 0,30 Å.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (message-passing) autoregresiva para inverse folding sobre grafos de vecinos espaciales |
| Parametros totales | 1.673.592 (~1,674 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre grafos de residuos, no sobre secuencias de texto) |
| Tipos de cuantizacion | No disponible (pesos en fp32/fp16 implicitos, sin cuantizacion publicada) |
| Idiomas soportados | No disponible (modelo de dominio biologico, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo representa cada residuo como un nodo en un grafo de vecinos mas proximos (48 vecinos) construido a partir de la geometria del backbone (atomos N, CA, C, O). Los bloques de encoder y decoder (3 y 3 respectivamente, hidden size 128) aplican paso de mensajes sobre este grafo. La decodificacion es autoregresiva: los residuos se generan en un orden causal muestreado aleatoriamente en cada pasada, lo que aporta robustez y diversidad.

El entrenamiento consiste en la recuperacion de identidades de aminoacidos a partir de la geometria del backbone, con perturbaciones de coordenadas (ruido) para robustez; esta variante Soluble ofrece checkpoints con ruido de 0,02, 0,10, 0,20 y 0,30 Å. Los datos de entrenamiento de la implementacion oficial de referencia usan ensamblados biologicos de la PDB (a 2 de agosto de 2021) con cadenas agrupadas por identidad de secuencia al 30%; la variante Soluble se centra en proteinas solubles. La generacion admite posiciones fijas, identidades ligadas (tied identities), restricciones por posicion de aminoacidos y perfiles de secuencia.

## Capacidades

- Diseno de secuencias de aminoacidos condicionado a un backbone proteico fijo (fixed-backbone sequence design).
- Puntuacion de secuencias frente a un backbone: NLL (log-verosimilitud negativa) por residuo, tanto global como por diseno, en nats, con multiples ordenes de decodificacion (p. ej. `num_decoding_orders=8`).
- Restricciones durante la generacion: posiciones fijas, identidades ligadas entre cadenas, restricciones de aminoacidos por posicion y perfiles de secuencia.
- Combinacion con el MPNN Packer (pipeline `ProteinMpnnDesignAndPackPipeline`) para generar coordenadas de cadenas laterales tras el diseno de secuencia.
- Ejecucion por etapas (`prepare`, `forward`, `postprocess`) mediante los pipelines de la libreria ofoldx.
- No tiene capacidades de lenguaje, vision, audio, tool calling ni agentes: es un modelo cientifico de dominio especifico.

## Casos de uso

- Diseno de enzimas solubles de novo: tras generar un backbone (por ejemplo con RFdiffusion o Rosetta), SolubleMPNN produce secuencias candidatas solubles que se evaluan experimentalmente, gracias a su especializacion en proteinas solubles.
- Rediseño de proteinas existentes para mejorar solubilidad: se mantiene el backbone de una proteina y se rediseña la secuencia con la variante soluble para reducir agregacion manteniendo el plegamiento.
- Estabilizacion de dominios de union: se fijan los residuos del sitio de union y se rediseña el resto del esqueleto usando posiciones fijas y restricciones por posicion.
- Diseno de simetrias y complejos multimericos: las identidades ligadas permiten forzar la misma secuencia en cadenas equivalentes de homo-oligomeros.
- Filtrado computacional de candidatos: la funcion de scoring (NLL por residuo con multiples ordenes de decodificacion) sirve para rankear secuencias antes de sintetizarlas, reduciendo coste experimental.
- Generacion de cadenas laterales para validacion estructural: combinando el diseno con el MPNN Packer se obtienen coordenadas de cadenas laterales para comparar con estructuras predichas (p. ej. con AlphaFold) en bucles de validacion automatizados.
- Construccion de datasets para ML estructural: los pipelines por etapas (prepare/forward/postprocess) facilitan el procesamiento por lotes de miles de estructuras PDB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia cualitativa, el articulo original de ProteinMPNN reporta tasas de recuperacion de secuencia superiores a las de RosettaDesign, pero esta ficha no dispone de cifras verificadas para esta implementacion concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,67 M de parametros, el modelo ocupa menos de 10 MB en fp32; cualquier GPU con 2 GB o mas es suficiente, e incluso puede ejecutarse en CPU.
- GPU recomendadas: no hay requisitos publicados; dada la escala, una RTX 3060/4060 o superior sobra. El coste real depende del tamaño del grafo de residuos (longitud de la proteina).
- Consumer GPUs: cabe sobradamente en cualquier GPU consumer moderna; tambien es viable la ejecucion solo en CPU para proteinas de tamaño moderado.
- Despliegue: mediante la libreria `ofoldx` (`pip install ofoldx`) y sus pipelines (`ofoldx.pipeline("design")` y `ofoldx.pipeline("score")`). No hay soporte de vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; el paper original reporta diseño de secuencias en el orden de ~1 segundo por proteina de ~100 residuos en GPU, pero no hay cifras publicadas para esta reimplementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| SolubleMPNN (oteam, esta ficha) | 1,674 M | Backbone completo (N, CA, C, O), proteinas solubles | AGPL-3.0 | Hugging Face + ofoldx (safetensors) |
| ProteinMPNN (oteam, estandar) | 1,674 M | Backbone completo (N, CA, C, O) | AGPL-3.0 | Hugging Face + ofoldx (safetensors) |
| ProteinMPNN CA-only (oteam) | 1,642 M | Solo atomo CA | AGPL-3.0 | Hugging Face + ofoldx (safetensors) |
| ProteinMPNN oficial (dauparas) | ~1,67 M | Backbone completo | No comercial (MIT-like con restriccion, segun repo original) | GitHub (PyTorch) |

La diferencia practica entre la variante Soluble y la estandar es el conjunto de entrenamiento (proteinas solubles frente a todas), lo que puede mejorar la calidad de diseño en objetivos solubles y empeorarla en proteinas de membrana.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. Cualquier obra derivada que se distribuya (incluidos servicios de red que la usen, segun la interpretacion estandar de la AGPL) debe publicar el codigo fuente. Puede ser incompatible con productos comerciales cerrados.
- Es una implementacion NO oficial: la model card lo indica explicitamente y el equipo original de ProteinMPNN no la ha validado. Para resultados publicables se recomienda verificar contra el repositorio oficial.
- No esta diseñada para proteinas de membrana: para eso existen variantes especificas (LigandMPNN, ProteinMPNN solubility variants u otras); esta variante se entrena con proteinas solubles.
- El diseno computacional no garantiza plegamiento ni funcion: las secuencias generadas requieren validacion experimental y/o estructural (p. ej. AlphaFold) antes de sintesis.
- Riesgo de alucinacion: no aplica en el sentido de LLMs, pero el modelo puede producir secuencias con baja probabilidad de plegado; el scoring NLL y el muestreo con temperatura son los controles disponibles.
- Dependencia de la libreria ofoldx, de madurez desconocida (0 descargas registradas en Hugging Face en el momento de la ficha), lo que implica riesgo de bugs o API inestable.
- Los datos de entrenamiento proceden de la PDB (cutoff 2 de agosto de 2021 en la referencia oficial), por lo que no cubre estructuras posteriores y hereda sesgos del contenido de la PDB (sesgo hacia proteinas bien cristalizadas, dominios frecuentes, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/solublempnn
- Paper original (Science): https://doi.org/10.1126/science.add2187
- Repositorio oficial de ProteinMPNN: https://github.com/dauparas/ProteinMPNN
- Codigo del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Libreria ofoldx: https://ofoldx.valtech.ai/
- Guia de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Variantes relacionadas: https://huggingface.co/oteam/proteinmpnn, https://huggingface.co/oteam/proteinmpnn-ca-only, https://huggingface.co/oteam/solublempnn-noise030
- Notas de entrenamiento oficiales: https://github.com/dauparas/ProteinMPNN/blob/main/training/README.md
