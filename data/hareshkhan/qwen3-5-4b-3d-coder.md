# hareshkhan/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino (fine-tune) independiente del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario hareshkhan bajo la organizacion CCORE. El modelo esta disenado para programacion general con un enfasis particular en la generacion de escenas 3D interactivas mediante la libreria Three.js. Con 4.539 millones de parametros, se posiciona como un modelo compacto orientado a tareas de codigo especializado, no como un release oficial de Alibaba/Qwen.

El modelo se distribuye en formato FP16 (safetensors, cuatro shards) y en dos cuantizaciones GGUF (Q4_K_M y Q8_0). Una caracteristica destacable es el soporte opcional de vision: las versiones GGUF pueden aceptar imagenes de entrada si se cargan junto con el proyector multimodal original de Qwen3.5-4B (aproximadamente 644 MiB en BF16), lo que permite generar escenas Three.js a partir de una imagen de referencia. El modelo se encuentra en estado de "early preview", con entrenamiento aun en curso segun el autor.

La relevancia actual del modelo radica en su enfoque especializado: demuestra que un modelo de 4B parametros puede abordar la generacion de escenas 3D de calidad mediante fine-tuning sobre un dataset curado de 4.146 ejemplos de escenas Three.js. La licencia Apache 2.0 y la disponibilidad del dataset de entrenamiento (MIT) facilitan su inspeccion y reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-4B (fine-tune) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (configurado en llama.cpp; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | FP16, Q8_0, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP16, 4 shards), GGUF (Q4_K_M, Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3.5-4B, sobre la que se aplica un fine-tune supervisado orientado a codigo y generacion de escenas Three.js. El dataset de entrenamiento, denominado CCORE Three.js 3D Scenes, contiene 4.146 ejemplos de escenas (3.933 de entrenamiento y 213 de validacion), e incluye prompts, trazas de razonamiento completas (thinking traces), respuestas completas en HTML/JavaScript y niveles de complejidad. El dataset incorpora ademas imagenes de referencia renderizadas en una configuracion opcional de previews.

No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor ha publicado un informe tecnico (PDF) que documenta el experimento de entrenamiento. La innovacion principal del modelo es su especializacion en la generacion de escenas 3D interactivas con Three.js, incluyendo la capacidad de interpretar imagenes de referencia mediante el proyector multimodal original de Qwen3.5-4B. Los parametros de generacion por defecto en FP16 son temperatura 0,6, top-k 20, top-p 0,95 y penalizacion de repeticion 1,0, con cache habilitada.

## Capacidades

- Generacion de codigo general (HTML, JavaScript) con enfasis en Three.js.
- Generacion de escenas 3D interactivas a partir de descripciones textuales.
- Generacion de escenas 3D guiada por imagen de referencia (solo en GGUF Q4_K_M y Q8_0 con el proyector multimodal cargado).
- Razonamiento multi-paso con trazas de pensamiento (thinking traces) incluidas en el dataset de entrenamiento.
- Soporte conversacional multi-turno.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de escenas 3D para prototipado web: el modelo produce codigo Three.js completo en HTML/JavaScript a partir de una descripcion textual, adecuado para crear prototipos rapidos de visualizaciones 3D interactivas en navegador.
- Creacion de escenas 3D a partir de imagenes de referencia: con la cuantizacion GGUF y el proyector multimodal, se puede adjuntar una imagen y solicitar una escena Three.js equivalente, util para convertir bocetos o referencias visuales en codigo funcional.
- Educacion y aprendizaje de Three.js: el modelo genera ejemplos comentados y funcionales que sirven como material didactico para desarrolladores que aprenden la libreria.
- Generacion de codigo en pipelines de desarrollo: al estar basado en un modelo de codigo general, puede integrarse en flujos de autocompletado o generacion de fragmentos JavaScript/HTML para entornos de desarrollo web.
- Prototipado de experiencias interactivas: el modelo permite iterar rapidamente sobre escenas 3D con niveles de complejidad variables, gracias a los niveles de complejidad presentes en el dataset de entrenamiento.
- Despliegue local en hardware de consumo: con cuantizacion Q4_K_M, el modelo puede ejecutarse en GPUs de consumo mediante llama.cpp, lo que facilita su uso en entornos sin infraestructura de servidor dedicada.
- Investigacion sobre modelos pequenos especializados: el modelo y su dataset publico permiten estudiar la viabilidad de modelos de 4B parametros para tareas de generacion de codigo 3D especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona mejoras cualitativas en la "tasa de exito en un solo intento" (one-shot success) y en la calidad general de las escenas tras la actualizacion del checkpoint del 27 de octubre, pero no se proporcionan metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 4.539 millones de parametros, la cuantizacion Q4_K_M requiere aproximadamente 3-4 GB y Q8_0 aproximadamente 5-6 GB, mas el espacio de KV-cache.
- El proyector multimodal BF16 anade aproximadamente 644 MiB adicionales cuando se carga para vision.
- GPU recomendadas: no disponible en la informacion proporcionada. El autor indica pruebas locales con llama.cpp b11889.
- Compatibilidad con GPU de consumo: previsiblemente si con cuantizaciones Q4_K_M y Q8_0, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: llama.cpp (llama-server con soporte de vision mediante `--mmproj`), Transformers 5.20.2 (verificado para carga y generacion de texto con FP16), y GGUF compatible con frontends que implementen multimodalidad.
- Latencia y throughput: no disponibles.
- Configuracion de contexto: el autor probo con `--ctx-size 65536` y `--flash-attn on`; para Q8_0 sugiere `--cache-type-k q8_0 --cache-type-v q8_0` para reducir memoria de KV-cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder | 4.539 M | 65.536 (configurado) | Codigo + Three.js 3D | Apache 2.0 | HuggingFace (safetensors, GGUF) |
| Qwen/Qwen3.5-4B (base) | 4B (aproximado) | No disponible | Codigo general | Apache 2.0 | HuggingFace |
| Qwen3.5-4B-GGUF (lmstudio-community) | 4B (aproximado) | No disponible | Codigo general, GGUF | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo en estado de "early preview": el entrenamiento continua segun el autor, por lo que el comportamiento puede cambiar entre checkpoints.
- No es un release oficial de Qwen: se trata de un fine-tune independiente de CCORE; el soporte y la validacion no provienen del equipo de Qwen.
- Algunas escenas pueden requerir otro intento o una correccion manual, segun admite el autor.
- El soporte de vision depende de la cuantizacion GGUF y del proyector multimodal; no esta disponible en los pesos FP16 ni en todos los frontends.
- Los tokens de imagen comparten la ventana de contexto con el prompt y el codigo generado, lo que reduce el contexto efectivo disponible.
- Las pruebas de vision con contexto de 64K fueron pruebas cortas, no pruebas de estres de contexto completo.
- Riesgo de alucinacion en la generacion de codigo: no se han publicado evaluaciones formales de fidelidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el dataset de entrenamiento parece centrado en ingles.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el proyector multimodal deben cumplir sus propias condiciones (Apache 2.0 en ambos casos segun la informacion disponible).
- El modelo esta especializado en Three.js; su rendimiento en otras tareas de codigo puede ser inferior al del modelo base.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/hareshkhan/Qwen3.5-4B-3D-Coder
- HuggingFace de la organizacion CCORE: https://huggingface.co/ccore
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset CCORE Three.js 3D Scenes: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe tecnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Descarga del informe tecnico: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf?download=true
- Proyector multimodal BF16: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf?download=true
- Repositorio de pesos FP16 y GGUF: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/tree/main
- GGUF de referencia (lmstudio-community): https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- Discusion comunitaria con imagen de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/discussions/9
