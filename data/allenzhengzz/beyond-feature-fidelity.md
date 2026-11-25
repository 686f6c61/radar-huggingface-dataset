# allenzhengzz/beyond-feature-fidelity

## Resumen

Beyond Feature Fidelity es un conjunto de pesos complementarios asociados al articulo "Beyond Feature Fidelity", un trabajo de investigacion que estudia el uso de caracteristicas de DINOv3 como entrada visual para un sistema LLaVA-1.5. El repositorio, publicado por el usuario allenzhengzz, no contiene un modelo de lenguaje completo, sino cuatro componentes entrenados (un modulo de recuperacion y tres proyectores) que deben combinarse con el codificador visual DINOv3, el modelo de lenguaje de LLaVA-1.5 y su tokenizador, que no se distribuyen aqui.

El objetivo del trabajo es aislar y medir el efecto de dos factores sobre el rendimiento en tareas de vision-lenguaje: por un lado, la "recuperacion" de informacion (un VAE de doble flujo que preserva estructura) y, por otro, la adaptacion del proyector de lectura. La model card reporta puntuaciones en GQA para cuatro condiciones controladas (M1, M4, M6, M7), lo que convierte al repositorio en material de reproduccion experimental mas que en un modelo listo para produccion.

La relevancia es acotada: esta pensado para investigadores que quieran reproducir las comparaciones del articulo o reutilizar el modulo de recuperacion y los proyectores dentro del pipeline DINOv3-LLaVA-1.5 con semilla 123. El repositorio pesa 0,3 GB, esta licenciado bajo Apache-2.0 y solo declara ingles como idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyectores y modulo de recuperacion (VAE de doble flujo con preservacion de estructura) para un sistema DINOv3 + LLaVA-1.5; no es un modelo autonomo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del LLM base de LLaVA-1.5, no incluido) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | .pth (state_dict con config para proyectores; model_state y config_snapshot.model para el modulo de recuperacion) |

## Arquitectura y entrenamiento

El sistema completo descrito en el articulo combina un codificador visual DINOv3 con el modelo de lenguaje de LLaVA-1.5 a traves de un proyector. El repositorio libera cuatro artefactos entrenados con semilla 123: un modulo de recuperacion (`structure_preserving_dual_stream_vae.pth`), un proyector P1 entrenado con datos limpios, un proyector adaptado a tokens crudos (M7) y un proyector adaptado a tokens recuperados (M6). Los proyectores incluyen `state_dict` y configuracion; el modulo de recuperacion incluye `model_state` y una instantanea de configuracion.

El diseno experimental permite aislar dos ejes. Con los tokens recuperados fijos, la comparacion entre M4 y M6 aisla el cambio de lectura (proyector). La comparacion entre M6 y M7 pregunta si la recuperacion explicita aporta utilidad una vez que el proyector se ha adaptado. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF o DPO; esa informacion corresponderia al articulo, no al repositorio.

La model card incluye un ejemplo de carga en CPU (`check_features.py --weights ../huggingface --family llava15 --condition m6`) que produce una salida de forma (1, 8, 4096) a partir de ocho tokens sinteticos de DINOv3. Para inferencia imagen-a-respuesta es necesario aportar por separado el codificador base, el modelo de lenguaje y el tokenizador.

## Capacidades

- Extraccion de caracteristicas multimodales: el ejemplo de la model card genera una salida (1, 8, 4096) desde tokens de DINOv3, lo que corresponde a la tarea `feature-extraction` declarada.
- Recuperacion de informacion visual: el modulo VAE de doble flujo preserva estructura y se aplica antes de la lectura por el proyector.
- Adaptacion de lectura: los proyectores M6 y M7 permiten comparar el rendimiento con tokens recuperados frente a tokens crudos.
- Reproduccion experimental: los cuatro checkpoints permiten replicar las condiciones M1, M4, M6 y M7 del articulo.
- No incluye generacion de texto autonoma, tool calling, capacidades de agente, vision integrada de extremo a extremo ni modo de razonamiento; esas funciones dependerian del LLM base de LLaVA-1.5, que no se distribuye en este repositorio.
- Multilingue: solo se declara ingles (`en`).

## Casos de uso

- Reproduccion de resultados academicos: cargar los cuatro checkpoints y ejecutar las condiciones M1, M4, M6 y M7 para verificar las puntuaciones de GQA reportadas (58,99; 58,82; 59,74; 59,67) en el sistema DINOv3-LLaVA-1.5 con semilla 123.
- Investigacion sobre alineacion vison-lenguaje: usar el modulo de recuperacion y los proyectores como punto de partida para estudiar como afecta la preservacion de estructura en las caracteristicas visuales al rendimiento del modelo de lenguaje.
- Ablaciones controladas: comparar M4 frente a M6 para medir el efecto del cambio de lectura con tokens recuperados fijos, y M6 frente a M7 para evaluar si la recuperacion explicita aporta tras la adaptacion.
- Integracion en pipelines de extraccion de caracteristicas: emplear `check_features.py` como referencia para incorporar los proyectores en un pipeline PyTorch propio que consuma tokens de DINOv3.
- Verificacion de integridad de pesos: usar `weights.json` y `SHA256SUMS` para validar ficheros descargados en entornos de investigacion reproducibles.
- Base para experimentos derivados: reutilizar el VAE de doble flujo con preservacion de estructura en otros sistemas que necesiten un paso de recuperacion de tokens visuales antes de un proyector.

## Benchmarks y rendimiento

La model card reporta puntuaciones en GQA para las cuatro condiciones del manuscrito. No se aportan resultados de MMLU, HumanEval ni GSM8K.

| Condicion | Recuperacion | Lectura | GQA |
|---|---|---|---|
| Raw-Frozen (M1) | Off | P1 entrenado con datos limpios | 58,99 |
| Recovered-Frozen (M4) | On | Mismo P1 | 58,82 |
| Raw-Adapted (M7) | Off | Proyector adaptado a crudo | 59,74 |
| Recovered-Adapted (M6) | On | Proyector adaptado a recuperado | 59,67 |

Las puntuaciones son los valores reportados en el manuscrito. No se dispone de comparaciones con modelos de referencia en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible para el sistema completo, ya que el codificador DINOv3 y el LLM de LLaVA-1.5 no se incluyen en el repositorio. Los pesos liberados ocupan 0,3 GB en total.
- GPU recomendadas: no disponible. La model card solo documenta un ejemplo en CPU.
- Cabe en GPU de consumo: los cuatro checkpoints (0,3 GB) caben en cualquier GPU de consumo; el sistema completo dependera del LLM base elegido.
- Opciones de despliegue: PyTorch con el script `check_features.py` del repositorio de codigo companero. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beyond Feature Fidelity (este repo) | Checkpoints de proyector y recuperacion para DINOv3-LLaVA-1.5 | no disponible | no disponible | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| LLaVA-1.5 | Modelo vision-lenguaje completo | no disponible en la informacion | no disponible | no disponible | no disponible |
| Proyectores LLaVA estandar | Componente de alineacion vison-lenguaje | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el codificador DINOv3, el LLM de LLaVA-1.5 y el tokenizador, que no se distribuyen en este repositorio.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues.
- Los resultados de GQA proceden de una unica semilla (123) y de un unico conjunto de evaluacion; no se reportan intervalos de confianza ni variabilidad entre semillas.
- Riesgo de alucinacion: no evaluado en la informacion disponible; dependera del LLM base.
- Sesgos: no documentados en la model card.
- Uso comercial: la licencia Apache-2.0 cubre los pesos de recuperacion y proyectores liberados, pero el uso del sistema completo puede estar sujeto a las licencias de DINOv3 y LLaVA-1.5, que no se detallan aqui.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- La model card esta redactada como material de reproduccion experimental, no como documentacion de producto; no incluye guia de despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/allenzhengzz/beyond-feature-fidelity
- Articulo (OpenReview): https://openreview.net/forum?id=1ki2Qs08aF
- Codigo del proyecto: https://github.com/allenzg/beyond-feature-fidelity
- Pagina del proyecto: https://allenzg.github.io/beyond-feature-fidelity/
