# paulzy/lact-1b-p24-1-explicit-all-one-gtcf-on-soft-z0001-step-2048

## Resumen

El modelo `paulzy/lact-1b-p24-1-explicit-all-one-gtcf-on-soft-z0001-step-2048` es un checkpoint de investigación de la familia LaCT (Layered Adaptive Computation Time), desarrollado por el autor paulzy. Se trata de un transformer de 1.095 millones de parámetros que incorpora mecanismos de early-exit y routing dinámico: cada capa puede decidir si emitir una salida temprana (EXIT) o continuar procesando (CONTINUE), lo que permite ajustar el coste computacional en función de la dificultad de cada entrada. El modelo está entrenado con una configuración experimental denominada GTCF-ON, que incluye un teacher de profundidad completa con stop-gradient, adaptadores de salida SiLU de rango 128 y un router binario con argmax. Este checkpoint concreto corresponde al paso 2048 de entrenamiento con semilla 42 y se publica como archivo de solo pesos (weights-only) para reproducibilidad científica.

La relevancia de este modelo radica en su enfoque de eficiencia adaptativa: al poder salir en capas tempranas, reduce el coste de inferencia para entradas sencillas sin sacrificar la precisión en las complejas. Además, incorpora test-time training, lo que sugiere capacidad de adaptación en tiempo de inferencia. El entrenamiento se realizó con secuencias de 65.536 tokens, lo que indica soporte para contexto largo. Sin embargo, se trata de un lanzamiento de investigación sin licencia comercial y sin resultados de evaluación publicados en el repositorio, por lo que su uso práctico queda limitado al ámbito académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con early-exit y routing (LaCT), activaciones SwiGLU |
| Parametros totales | 1.095.343.594 |
| Parametros activos | no disponible (no es un MoE clasico) |
| Longitud de contexto | 65.536 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP32 en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | research-weights-see-license-notice (licencia de investigacion, sin uso comercial) |
| Formato de pesos | safetensors (542 tensores F32, 4,4 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia LaCT, que combina un transformer estándar con capas de salida temprana (early-exit) y un router que decide, en cada capa, si emitir una predicción o continuar al siguiente nivel. La implementación usa activaciones SwiGLU (tag `lact_swiglu`) y un router binario con decisión EXIT/CONTINUE mediante argmax. Los adaptadores de salida son de rango 128 con activación SiLU, y las características del router se agregan mediante max-pooling. La configuración GTCF-ON emplea un teacher de profundidad completa con stop-gradient, coeficientes de pérdida `router_eff_coeff=0.5`, `router_z_coeff=0.0001` y `exit_ce_loss_coeff=0.5`. El entrenamiento se realizó con secuencias de 65.536 tokens, acumulación de gradiente 4, 2.048 pasos totales y una primera etapa de solo readout de 512 pasos, con semilla 42. El checkpoint publicado corresponde al paso 2048 y se exportó directamente del estado completo de entrenamiento (DCP), excluyendo optimizador, tokenizer y datos de evaluación. El tokenizer debe tomarse del checkpoint base compatible (BOS 128000, EOS 128009, vocabulario 128256).

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Early-exit adaptativo: el modelo decide dinamicamente en que capa emitir la salida, reduciendo el coste computacional para entradas faciles.
- Routing binario EXIT/CONTINUE con argmax, lo que permite un control explicito del punto de salida.
- Test-time training: el modelo puede adaptarse durante la inferencia, aunque no se detallan los mecanismos concretos.
- Soporte de contexto largo: entrenado con secuencias de 65.536 tokens.
- Capacidad conversacional (tag `conversational`).
- No se mencionan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion en eficiencia de inferencia: el modelo permite estudiar el equilibrio entre precision y coste computacional al variar el umbral de salida temprana, util para experimentos sobre aceleracion de transformers.
- Analisis de routing adaptativo: al ser un checkpoint con routing binario explicito, sirve para investigar como los modelos deciden cuándo detenerse, y para comparar politicas de early-exit.
- Desarrollo de tecnicas de test-time training: su configuracion con teacher y stop-gradient ofrece un caso de estudio para metodos de adaptacion en inferencia.
- Evaluacion de modelos con contexto largo: su ventana de 65.536 tokens permite probar tareas de recuperacion de informacion en documentos extensos (como NIAH, aunque los resultados no se publican).
- Experimentos de compresion y cuantizacion: al ser un modelo de 1B con pesos FP32, puede servir como base para probar tecnicas de cuantizacion y su impacto en el comportamiento del router.
- Reproducibilidad cientifica: al publicarse el checkpoint exacto con semilla y paso de entrenamiento, permite replicar experimentos y verificar resultados de la linea de investigacion LaCT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se completaron evaluaciones en NIAH-1, LongBenchV2 y PG-19, pero no se incluyen los resultados en el repositorio. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- El archivo de pesos en FP32 ocupa 4,4 GB, por lo que en FP16 ocuparia aproximadamente 2,2 GB y en cuantizacion de 4 bits alrededor de 0,6 GB (estimacion teorica, no oficial).
- Con cuantizacion a 4 bits, el modelo cabria en GPUs consumer con 4-6 GB de VRAM, como una RTX 3060 o RTX 4060.
- En FP16, seria necesario al menos 3 GB de VRAM, por lo que cabria en GPUs como RTX 3060 (12 GB) o superiores.
- No se especifican requisitos oficiales de GPU ni opciones de despliegue. Dado que usa la libreria transformers, es compatible con vLLM, TGI u Ollama si se convierte a los formatos adecuados, pero no se proporciona soporte explicito.
- La latencia y el throughput no estan documentados. El early-exit puede reducir la latencia media en entradas sencillas, pero depende de la distribucion de datos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. No se conocen modelos comparables con early-exit y routing binario de 1B parametros en el ecosistema open source actual, y el autor no publica datos de rendimiento relativo. Se indica "no disponible".

## Limitaciones y advertencias

- Licencia restringida: el modelo se publica bajo `research-weights-see-license-notice`, lo que limita su uso a fines de investigacion y prohibe su uso comercial sin autorizacion explicita.
- Checkpoint experimental: es un archivo de solo pesos de un experimento concreto (seed 42, paso 2048) y no representa necesariamente el mejor rendimiento de la familia LaCT.
- Sin tokenizer incluido: es necesario obtener el tokenizer del checkpoint base compatible, lo que anade un paso adicional de integracion.
- Sin resultados de evaluacion publicados: no hay benchmarks ni metricas que permitan validar su calidad real.
- Riesgo de alucinacion y sesgos: al no publicarse datos de evaluacion ni el dataset de entrenamiento, se desconocen los sesgos potenciales y la fiabilidad en tareas generativas.
- No apto para produccion: al ser un artefacto de investigacion, no se garantiza estabilidad, seguridad ni rendimiento en entornos reales.
- Dependencia de la implementacion `yuan_ttt`: para reproducir el comportamiento es necesario usar la implementacion exacta de LaCT, que no se incluye en el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/paulzy/lact-1b-p24-1-explicit-all-one-gtcf-on-soft-z0001-step-2048
- No se proporcionan enlaces a papers, blogs, repositorios de codigo ni demos en la informacion disponible.
