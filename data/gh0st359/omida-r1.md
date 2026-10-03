# gh0st359/omida-r1

## Resumen

Omida R1 Preview (v0.1) es un ajuste fino supervisado mediante QLoRA sobre el modelo multimodal `Qwen/Qwen3.5-9B`, publicado por el usuario gh0st359 en HuggingFace. No es un modelo entrenado desde cero: el repositorio contiene la base en BF16 con el adaptador Omida fusionado en las capas de texto, mientras que las capas de vision permanecieron congeladas durante el entrenamiento. El pipeline declarado es `image-text-to-text`, por lo que hereda la capacidad de procesar imagenes y texto del modelo base.

El entrenamiento se realizo con un corpus muy reducido: 32 demostraciones sinteticas autorales (25 de entrenamiento, 5 de desarrollo y 2 de test interno), 2 epocas, rango 8, alpha 16, cuantizacion NF4 y una tasa de aprendizaje de 8e-5. El propio autor lo describe como una vista previa de investigacion, no como evidencia de superioridad amplia frente a Qwen. El modelo tiene 9.653.104.368 parametros (unos 9,65 mil millones) y un repositorio de 19,3 GB en formato safetensors.

Su relevancia actual es limitada y de caracter experimental: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados en la informacion disponible y sin datos de longitud de contexto ni de idiomas soportados. Resulta util como ejemplo de flujo de trabajo QLoRA + fusion de adaptador sobre una base multimodal, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen/Qwen3.5-9B; detalle interno no disponible |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 mil millones) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en los pesos publicados; NF4 durante el entrenamiento QLoRA; ruta de inferencia en 4 bits documentada por el autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, adaptador fusionado en las capas de texto) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B`, fijado en el commit `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. Sobre esa base se aplico un ajuste fino supervisado con QLoRA en precision NF4, con rango 8, alpha 16, dos epocas y tasa de aprendizaje 8e-5. El adaptador resultante se fusiono unicamente en las capas de texto; las capas de vision quedaron congeladas, de modo que la rama visual conserva el comportamiento del modelo base sin modificaciones.

La innovacion tecnica es escasa y de naturaleza procedimental: se trata de un ejercicio de QLoRA sobre un corpus sintetico minimo (32 demostraciones) con una linea de fusion documentada en `omida_merge_metadata.json`. No se declara uso de RLHF, DPO, decodificacion especulativa ni mecanismos de atencion alternativos. El autor remite a `reports/EVAL_REPORT.md` para los resultados medidos y las limitaciones, aunque dichos numeros no se incluyen en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto de forma conjunta (`image-text-to-text`), con las capas de vision sin ajustar.
- Razonamiento y generacion de codigo en la medida en que lo permita la base subyacente, no verificada para este ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidad especial de modo pensamiento (thinking mode): no disponible.
- Ajuste de estilo o comportamiento especifico "Omida" inducido por 32 demostraciones sinteticas, con alcance limitado por el tamano de la muestra.

## Casos de uso

- Investigacion sobre ajuste fino eficiente: sirve como referencia reproducible de un flujo QLoRA completo (entrenamiento NF4, fusion de adaptador en capas de texto, publicacion de pesos en BF16) para quien quiera replicar la metodologia en otras bases multimodales.
- Prototipado de asistentes que combinan imagen y texto: al heredar la modalidad `image-text-to-text` de Qwen3.5-9B, puede usarse en demos internas de descripcion de imagenes acompanadas de dialogo, siempre que se valide antes el efecto del ajuste.
- Experimentacion con corpus sinteticos pequenos: permite estudiar como un corpus de decenas de ejemplos modifica el comportamiento estilistico de un modelo de ~9,65 mil millones de parametros sin reentrenar la base.
- Pruebas de integracion de herramientas de inferencia: la ruta de 4 bits documentada en `inference/run_omida.py` y `inference/default_config.json` puede emplearse para validar despliegues cuantizados en entornos con VRAM limitada.
- Comparacion de linaje de pesos: el archivo `omida_merge_metadata.json` facilita auditar que capas se modificaron y cuales se congelaron, util en estudios de trazabilidad de modelos derivados.
- Evaluacion de riesgos de sobreajuste: con solo 32 ejemplos y 2 epocas, es un caso de estudio adecuado para medir degradacion, repeticion o colapso de estilo frente al modelo base.
- Uso docente: ilustra de forma compacta el ciclo completo de publicacion de un derivado en HuggingFace, incluida la retencion de la licencia upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un informe de evaluacion en `reports/EVAL_REPORT.md`, pero las cifras no se incluyen en los datos proporcionados, por lo que no se presenta tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 19,3 GB solo para pesos, mas memoria para activaciones y cache KV; se recomienda un margen de 24 GB o superior.
- VRAM estimada en 4 bits: alrededor de 5,5 a 6,5 GB para pesos, con margen adicional segun la longitud de contexto y el procesamiento de imagenes.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para inferencia en BF16 con contexto amplio; RTX 4090 (24 GB) para BF16 en configuraciones ajustadas o para 4 bits con holgura.
- GPU de consumo: si, en 4 bits cabe en tarjetas de 8 a 12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), asumiendo soporte correcto de la rama visual por parte del runtime empleado.
- Opciones de despliegue: vLLM y TGI para servir la base multimodal; llama.cpp y Ollama requieren conversion previa a GGUF y su soporte de entrada de imagen depende del modelo base, por lo que la ruta de 4 bits documentada por el autor (`inference/run_omida.py`) es la referencia mas fiable.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| gh0st359/omida-r1 | 9,65 mil millones | no disponible | imagen-texto | apache-2.0 | vista previa de investigacion, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9 mil millones (referencia declarada) | no disponible | imagen-texto | apache-2.0 | modelo upstream de origen |
| aim-uofa/Omni-R1 | no disponible | no disponible | omnimodal | no disponible | proyecto distinto, sin relacion con este modelo |

No se dispone de datos suficientes para comparar rendimiento (MMLU, HumanEval, GSM8K u otros) entre estas alternativas, ya que la informacion proporcionada no incluye resultados numericos. Cualquier otra comparacion con modelos de tamano similar (por ejemplo, familias de ~8-9 mil millones de parametros) no puede sustentarse con los datos disponibles.

## Limitaciones y advertencias

- Corpus de entrenamiento minimo: 32 demostraciones sinteticas (25 de entrenamiento, 5 de desarrollo y 2 de test interno), lo que hace muy probable el sobreajuste y limita la generalizacion.
- El propio autor califica el resultado como vista previa de investigacion y advierte explicitamente de que no demuestra superioridad amplia frente a Qwen.
- Sin benchmarks publicados en la informacion disponible: no hay evidencia cuantitativa de rendimiento, degradacion o regresiones frente a la base.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluacion publicada no puede acotarse su magnitud en este ajuste.
- La rama de vision quedo congelada, de modo que la calidad visual es la de la base Qwen3.5-9B y no mejora con este ajuste.
- Idiomas soportados no declarados: el comportamiento multilingue es incierto y depende por completo de la base.
- Longitud de contexto no declarada: no puede dimensionarse el soporte de conversaciones o documentos largos.
- Sesgos conocidos: no disponibles; no se documenta ningun analisis de sesgo ni de composicion del corpus mas alla de que es sintetico y autoral.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el autor indica que se retiene la licencia upstream de Qwen en `LICENSE`; conviene revisar ambas condiciones antes de un despliegue comercial.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin validacion externa de la comunidad.
- Atencion al nombre: el proyecto Omni-R1 de aim-uofa (NeurIPS 2025) es independiente y no guarda relacion con este modelo; no deben confundirse.
- No recomendado para produccion sin una evaluacion propia y un ajuste adicional con datos representativos del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gh0st359/omida-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del autor (proyecto relacionado): https://www.github.com/gh0st359/axiom-demo
- Proyecto Omni-R1 de aim-uofa (distinto, sin relacion): https://github.com/aim-uofa/Omni-R1
- Calendario de lanzamientos de modelos de IA (referencia general): https://www.scriptbyai.com/ai-model-release-calendar/
- Catalogo de modelos OODA AI (referencia general): https://ooda.ai/platform/models
- Catalogo de modelos de OpenAI (referencia general): https://developers.openai.com/api/docs/models/all

Archivos internos referenciados por el autor (no verificables directamente en la informacion proporcionada): `models/omida-r1-adapter/`, `inference/run_omida.py`, `inference/default_config.json`, `reports/EVAL_REPORT.md`, `omida_merge_metadata.json` y `LICENSE`.
