# kkpatel25/BrainDiff

## Resumen

BrainDiff es un sistema de vision-lenguaje para la generacion de informes radiologicos longitudinales de resonancia magnetica cerebral. Desarrollado por Krish Patel y Peirong Liu (arXiv:2609.00593), el modelo recibe un estudio de RM cerebral previo y otro actual (secuencias T1w, T1ce, T2w y FLAIR) junto con el informe del estudio previo, y produce un informe que describe de forma explicita que ha cambiado entre ambos estudios. El foco en el cambio, en lugar de la descripcion completa del estudio, es la innovacion central del trabajo.

Tecnicamente es un sistema modular: un backbone de imagen NeuroVFM (no incluido en el repositorio), un conector tipo perceiver que proyecta las representaciones visuales al espacio del lenguaje, y un decoder Qwen3-14B con un adaptador LoRA. El checkpoint publicado, `braindiff.pt`, contiene 114.939.904 parametros en fp32 repartidos en 429 tensores, e incluye solo los bloques 10-12 y la normalizacion final del encoder, el conector, el embedding de modalidad y el LoRA del decoder. Los pesos del backbone y del modelo base deben obtenerse por separado de los repositorios con acceso restringido de NeuroVFM y Qwen3-14B.

Es relevante como artefacto de investigacion para quienes trabajan en generacion de informes medicos, evaluacion longitudinal y metricas centradas en el cambio. No es un dispositivo medico ni esta validado para uso clinico. El repositorio es pequeno (0,5 GB), tiene licencia MIT y no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje modular: backbone de imagen NeuroVFM + conector perceiver + decoder Qwen3-14B con LoRA |
| Parametros totales | 114.939.904 parametros en el checkpoint publicado (fp32, 429 tensores); el total del sistema incluye el backbone NeuroVFM y el base Qwen3-14B, no cuantificados en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint en fp32) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `braindiff.pt` (PyTorch); los pesos del backbone y del base se obtienen de repositorios con acceso restringido |

## Arquitectura y entrenamiento

El sistema combina tres componentes. El backbone NeuroVFM procesa las imagenes de RM cerebral en cuatro modalidades (T1w, T1ce, T2w, FLAIR) de los estudios previo y actual. Un conector tipo perceiver transforma las representaciones visuales en tokens que el decoder de lenguaje puede consumir, junto con un embedding de modalidad que distingue las secuencias. El decoder es Qwen3-14B, adaptado mediante LoRA y condicionado tambien por el informe del estudio previo.

El checkpoint publicado corresponde a un entrenamiento por etapas: los bloques 10-12 y la normalizacion final del encoder pertenecen a la etapa Stage 1-D, epoca 5, mientras que el conector, el embedding de modalidad y el LoRA del decoder corresponden a la etapa Stage 2 con estrategia "status-first", epoca 20. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La contribucion metodologica declarada es una metrica de evaluacion centrada en el cambio, descrita en el paper asociado.

## Capacidades

- Generacion de informes radiologicos de RM cerebral a partir de imagenes multimodales (T1w, T1ce, T2w, FLAIR).
- Razonamiento longitudinal: compara un estudio previo y uno actual y describe explicitamente las diferencias.
- Condicionamiento sobre el informe previo, lo que permite mantener coherencia narrativa entre estudios.
- Procesamiento multimodal de imagen medica y texto en un unico pipeline.
- No se ha documentado soporte de tool calling, function calling, agentes ni modo de razonamiento extendido.
- Capacidades multilingues no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en generacion de informes medicos: sirve como sistema de referencia para experimentos de generacion de texto a partir de imagen medica, con la particularidad de que el objetivo es el cambio entre estudios y no la descripcion estatica.
- Evaluacion de metricas centradas en el cambio: el paper propone una metrica especifica; el modelo permite reproducir experimentos y comparar metricas convencionales frente a metricas de cambio.
- Seguimiento de pacientes en cohortes de investigacion: dado un estudio basal y uno de seguimiento, el sistema genera un borrador de que ha variado, util para anotacion asistida en estudios retrospectivos.
- Analisis de progresion en neuroimagen: aplicable a cohortes con multiples puntos temporales donde interesa detectar y verbalizar cambios estructurales.
- Docencia y formacion en radiologia: generar descripciones de diferencias entre estudios como material de apoyo, siempre fuera de entornos clinicos reales.
- Benchmarking de sistemas vision-lenguaje medicos: el checkpoint y el codigo permiten integrar el modelo en comparativas de generacion de informes con entrada multimodal y contexto longitudinal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint publicado ocupa 0,5 GB en fp32 (114,9 millones de parametros), pero el sistema completo requiere ademas el backbone NeuroVFM y Qwen3-14B, cuyos pesos no estan incluidos.
- VRAM estimada: no disponible para el sistema completo; el decoder Qwen3-14B en fp32 supera los 50 GB, por lo que en la practica exige cuantizacion o precision reducida, aunque no se documentan formatos soportados.
- El comando de evaluacion del autor usa `torchrun --standalone --nproc_per_node=4`, lo que indica un despliegue multi-GPU de 4 procesos.
- GPU recomendadas: no disponibles de forma explicita; el requisito de 4 procesos sugiere GPUs de clase A100 o H100 para ejecutar la configuracion de referencia.
- No se documenta compatibilidad con GPU de consumo, llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un dispositivo medico, no esta validado para uso clinico y no debe emplearse para informar la atencion al paciente.
- El checkpoint no es autosuficiente: requiere aceptar los terminos de los repositorios con acceso restringido de NeuroVFM y Qwen3-14B.
- Solo se publican los bloques 10-12 y la normalizacion final del encoder, junto con el conector, el embedding de modalidad y el LoRA del decoder; no se distribuye el backbone ni el modelo base.
- Riesgo de alucinacion en la generacion de hallazgos radiologicos, especialmente critico en dominio medico.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Sin datos publicados de benchmarks, lo que impide estimar su calidad relativa frente a alternativas.
- Repositorio sin descargas registradas y con una unica interaccion, lo que limita la validacion independiente por parte de la comunidad.
- La licencia MIT se aplica al repositorio, pero el uso de los componentes de terceros queda sujeto a sus propias licencias y terminos de acceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkpatel25/BrainDiff
- Paper: https://arxiv.org/abs/2609.00593
- DOI: https://doi.org/10.48550/arXiv.2609.00593
- Codigo: https://github.com/jhuldr/BrainDiff
