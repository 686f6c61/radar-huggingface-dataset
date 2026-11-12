# guan-wang/EBFM-ClimbMix-520M

## Resumen

EBFM-ClimbMix-520M es un modelo de lenguaje basado en energia (energy-based language model, EBFM) de 520 millones de parametros desarrollado por el equipo OpenEBFM (autoria principal de Yuan Pu y Guanchu Wang, vinculado al repositorio `datamllab/openebfm`). Se distribuye como un checkpoint de preentrenamiento exportado a Hugging Face Transformers y se enmarca en el articulo tecnico "OpenESM: Energy-Steered Models Are Scalable Foundation Learners" (arXiv:2610.33005). La variante concreta es la d20 y se ha entrenado sobre el conjunto de datos ClimbMix.

El modelo no sigue el esquema autoregresivo habitual: implementa una arquitectura propia (OpenEBFM) de tipo energy-based, con 20 bloques transformer, dimension de embedding de 1280, 10 cabezas de atencion, contexto de 2048 tokens y vocabulario de 32768 entradas. La pipeline declarada en Hugging Face es `fill-mask`, lo que refleja que la interfaz de inferencia expuesta es la de enmascaramiento de tokens y no la de generacion autoregresiva clasica.

Su relevancia radica en que explora una familia arquitectonica alternativa (modelos dirigidos por energia) a escala de 520M dentro de un ecosistema abierto con licencia MIT. Es un checkpoint de investigacion, no un modelo afinado para instrucciones ni para produccion, y requiere cargar codigo remoto (`trust_remote_code=True`) para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenEBFM (energy-based language model), implementacion custom d20, 20 bloques transformer |
| Parametros totales | 519.462.400 (520M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |
| Dimension de embedding | 1280 |
| Cabezas de atencion | 10 |
| Tamano de vocabulario | 32768 |
| Dataset de entrenamiento | ClimbMix |
| Etapa de entrenamiento | preentrenamiento |
| Tamano del repositorio | 2.1 GB |

## Arquitectura y entrenamiento

El modelo emplea una implementacion propia denominada OpenEBFM, definida en los ficheros remotos `modeling_ebfm.py` y `configuration_ebfm.py`. Se trata de un modelo de lenguaje basado en energia: en lugar de modelar directamente la probabilidad del siguiente token de forma autoregresiva, asigna una funcion de energia a las secuencias y deriva de ella la distribucion. La configuracion exportada indica 20 bloques transformer, dimension de embedding 1280, 10 cabezas de atencion, contexto de 2048 tokens y vocabulario de 32768. El checkpoint se etiqueta como variante "d20" dentro de la familia OpenEBFM y se corresponde con la escala de 520M.

El entrenamiento se limita a la etapa de preentrenamiento sobre el dataset ClimbMix. La model card no detalla el numero de tokens procesados, la composicion del corpus, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; tampoco describe innovaciones especificas como decodificacion especulativa o atencion lineal. El repositorio incluye un fichero `token_bytes.pt` con la tabla de bytes del tokenizador, utilizada por las metricas internas de OpenEBFM. Para el detalle algoritmico del enfoque energy-steered conviene remitirse al informe tecnico arXiv:2610.33005.

## Capacidades

- Modelado de lenguaje enmascarado: la pipeline declarada es `fill-mask`, por lo que la interfaz principal es la prediccion de tokens enmascarados.
- Puntuacion de secuencias mediante funcion de energia: el enfoque EBFM permite asignar una puntuacion de verosimilitud relativa a secuencias completas.
- Extraccion de logits por token: la salida `outputs.logits` esta disponible para su uso en tareas derivadas.
- Tokenizacion propia basada en `tiktoken`, cargada a traves del tokenizador serializado del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en modelado de lenguaje alternativo: el modelo sirve como banco de pruebas para estudiar modelos basados en energia frente a los autoregresivos, comparando curvas de perdida y comportamiento de la funcion de energia a escala 520M.
- Relleno de huecos en texto (fill-mask): dado que la pipeline expuesta es `fill-mask`, puede emplearse para predecir tokens enmascarados en frases de hasta 2048 tokens, util en tareas de completado controlado y evaluacion de representaciones.
- Puntuacion de secuencias para filtrado de datos: la funcion de energia permite ordenar o filtrar candidatos de texto en pipelines de curacion de corpus, descartando secuencias con baja verosimilitud segun el modelo.
- Reproduccion de resultados del paper OpenESM: el checkpoint permite replicar experimentos del informe tecnico arXiv:2610.33005 sobre el dataset ClimbMix y verificar las cifras publicadas.
- Base para ajuste fino experimental: al ser un checkpoint de preentrenamiento con licencia MIT, puede servir de inicializacion para experimentos de ajuste en tareas downstream dentro de entornos de investigacion.
- Evaluacion de robustez y calibracion: la naturaleza energy-based facilita estudiar la calibracion de puntuaciones y el comportamiento fuera de distribucion en comparacion con modelos autoregresivos de tamano similar.
- Docencia y formacion: ejemplo practico de arquitectura no convencional con codigo abierto para cursos de arquitecturas de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP32): aproximadamente 2,1 GB solo para pesos (519M parametros), mas activaciones y overhead del runtime; en la practica se recomienda reservar 4-6 GB.
- VRAM estimada en FP16/BF16: alrededor de 1,1 GB para pesos, con margen adicional para activaciones; cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o evaluacion a escala se recomienda A100 o H100.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura es custom y la pipeline es `fill-mask`; estos motores no estan verificados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| EBFM-ClimbMix-520M | 520M | 2048 | OpenEBFM (energy-based, custom) | MIT | Preentrenamiento, fill-mask |
| Modelos transformer autoregresivos de ~500M (p. ej. GPT-2 medium, Pythia-410M) | ~350-500M | 1024-2048 | Transformer decoder | MIT / Apache 2.0 | Generacion autoregresiva |
| Modelos encoder tipo BERT-base | 110M | 512 | Transformer encoder | Apache 2.0 | Fill-mask |

La comparacion directa con alternativas concretas no esta disponible en la informacion proporcionada: no se han publicado cifras de rendimiento del EBFM-ClimbMix-520M que permitan un contraste cuantitativo con modelos de la misma escala.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento sin ajuste por instrucciones: no debe esperarse un comportamiento de asistente conversacional.
- La pipeline es `fill-mask`, no generacion autoregresiva; usarlo como generador de texto requiere adaptaciones no documentadas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python remoto del repositorio; conviene auditar `modeling_ebfm.py` y `configuration_ebfm.py` antes de usarlo en entornos sensibles.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- No se han publicado benchmarks, por lo que no es posible validar su calidad frente a alternativas.
- La licencia MIT permite uso comercial, pero al ser un modelo de investigacion sin evaluacion de robustez, su uso en produccion conlleva riesgo no cuantificado.
- El articulo citado y las fechas del repositorio son posteriores a 2025; verificar la vigencia del checkpoint y del codigo antes de integrarlo.
- No hay confirmacion de soporte en motores de inferencia optimizados (vLLM, TGI, llama.cpp), lo que limita el despliegue a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guan-wang/EBFM-ClimbMix-520M
- Repositorio de codigo OpenEBFM: https://github.com/datamllab/openebfm
- Informe tecnico (paper): https://huggingface.co/papers/2610.33005
- arXiv: https://arxiv.org/abs/2610.33005
