# AndrewR123/AdaTCAdamW

## Resumen

AdaTCAdamW es un repositorio de investigacion publicado en Hugging Face por el autor AndrewR123 que no contiene un modelo de lenguaje entrenado, sino un marco teorico y una implementacion de optimizacion para deep learning. Concretamente, generaliza la correccion de sesgo de las medias moviles exponenciales (EWMA) desde secuencias escalares hasta operadores de contraccion arbitrarios en dimensión superior, y aplica esos resultados al diseno de un optimizador adaptativo denominado AdaTC-EWMA, pensado para entrenamiento de redes profundas con gradientes dispersos, embeddings Zipfianos y capas Mixture-of-Experts (MoE).

El trabajo se presenta como una auditoria y generalizacion del estudio previo del mismo autor (`EWMABiasCorrectionResearch`, 2023) y se materializa en un articulo con cinco teoremas verificados simbolicamente con SymPy, ademas de implementaciones en Python (NumPy y PyTorch CUDA) y en C# .NET. La relevancia actual radica en que los supuestos clasicos de la correccion de sesgo de Adam y AdamW (inicializacion a cero, estacionariedad de las expectativas y actualizaciones densas y sincronas) se rompen con frecuencia en modelos modernos con embeddings raramente activados y en arquitecturas MoE con enrutamiento disperso.

El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no incluye pesos de modelo, pipeline de inferencia ni resultados de benchmarks de modelos de lenguaje. Se trata, por tanto, de material de investigacion en optimizacion, no de un modelo generativo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de investigacion en optimizacion; implementaciones en NumPy, PyTorch CUDA y C# .NET) |
| Parametros totales | No disponible (no es un modelo neuronal) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (documentacion y paper) |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio contiene codigo, paper en PDF/LaTeX/Typst, no pesos) |

## Arquitectura y entrenamiento

El repositorio no describe una red neuronal concreta, sino un operador de optimizacion. El nucleo teorico parte de la correccion de sesgo estandar de EWMA, `v̂_t = v_t / (1 - β^t)`, usada en Adam y AdamW, y la extiende a operadores de contraccion arbitrarios `B ∈ R^{d×d}` con radio espectral `ρ(B) < 1`. El Teorema 1 deriva el estimador exacto para inicializacion arbitraria, `v̂_t^(0) = (I_d - B^t)^{-1}(v_t - B^t v_0)`, y demuestra que interpola de forma continua entre la senal instantanea y la media acumulada isotropica exacta. El Teorema 2 cuantifica el retardo asintotico permanente bajo deriva no estacionaria y propone una correccion de tendencia en tiempo O(1) (`ExactTC-EWMA`) con sesgo cero para todo `t ≥ 2`.

El Teorema 3 introduce `AdaTC-EWMA`, que acopla ambos estimadores mediante un estimador de ruido de segunda diferencia invariante a la tendencia y una compuerta de shrinkage tipo James-Stein/Wiener libre de hiperparametros, con exceso de riesgo que decrece a tasa O(d^{-1}) (se cita +0.02% de exceso a d = 1024 y reducciones de MSE del 73.2% al 95.4%). El Teorema 4 aborda el "shock de despertar" de tokens raros en AdamW denso sobre embeddings Zipfianos y MoE con compuertas, con un factor de shock de paso entre 3.16x y 10.0x y una reduccion del 8.8% al 14.8% en la corrupcion de fine-tuning de tokens raros. El Teorema 5 compara la asimetria de la correccion de sesgo entre Momentum SGD, RMSprop y Adam. No se especifican volumenes de datos de entrenamiento ni etapas de RLHF/DPO porque el trabajo no entrena un modelo.

## Capacidades

- Implementacion de referencia del optimizador `AdaTC-EWMA` en Python con soporte NumPy y PyTorch CUDA.
- Implementacion en C# .NET de un simulador y del operador `VectorEWMA`.
- Verificacion simbolica de los cinco teoremas mediante SymPy en `python/verify_proofs.py`.
- Correccion de sesgo para inicializacion arbitraria en operadores de contraccion de dimensión superior.
- Correccion de tendencia en tiempo O(1) para senales no estacionarias con deriva lineal.
- Estimacion online de ruido mediante segunda diferencia invariante a la tendencia.
- Compuerta de shrinkage adaptativa libre de hiperparametros basada en concentracion de Hanson-Wright.
- Seguimiento de exposicion por fila para mitigar el shock de tokens raros en embeddings y MoE.
- Documentacion completa en paper (PDF, LaTeX y Typst) y badges de acceso a codigo.

## Casos de uso

- Entrenamiento de modelos con embeddings Zipfianos: el seguimiento de exposicion por fila del Teorema 4 reduce la corrupcion de fine-tuning de tokens raros entre un 8.8% y un 14.8%, lo que resulta util en modelos de lenguaje con vocabularios grandes y distribuciones de frecuencia muy sesgadas.
- Ajuste fino de arquitecturas Mixture-of-Experts: al corregir el shock de paso en filas dormidas de las compuertas, se evita la descalibracion de los expertos poco activados durante el entrenamiento con enrutamiento disperso.
- Suavizado de series temporales no estacionarias: `AdaTC-EWMA` corrige el retardo permanente bajo deriva lineal y reduce el MSE entre un 73.2% y un 95.4% en manifold no estacionarios, aplicable a monitorizacion de metricas y senales industriales.
- Investigacion en optimizadores: el marco permite auditar y comparar variantes de Adam, AdamW, RMSprop y Momentum SGD bajo un formalismo comun de correccion de sesgo, util para grupos que estudian dinamica de entrenamiento.
- Prototipado en C# .NET: el simulador y `VectorEWMA` permiten validar el comportamiento del operador en entornos .NET antes de portarlo a pipelines de entrenamiento en PyTorch.
- Docencia y reproduccion cientifica: los teoremas verificados con SymPy y el paper en tres formatos facilitan la reproduccion de los resultados y su uso como material de referencia en cursos de optimizacion.
- Integracion en frameworks de entrenamiento personalizados: la implementacion PyTorch CUDA puede incorporarse como paso de actualizacion alternativo en bucles de entrenamiento propios que requieran correccion de tendencia y de sesgo por coordenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye resultados teoricos y experimentales sobre riesgo MSE y perdida de entrenamiento (por ejemplo, +0.02% de exceso de riesgo a d = 1024, penalizacion de perdida de 2.35x en Momentum SGD full-batch y +28.0% de perdida MLP en RMSprop), pero no tablas de benchmarks de modelos de lenguaje como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica VRAM para inferencia: el repositorio no contiene pesos de modelo.
- Para ejecutar la verificacion simbolica con SymPy basta una CPU convencional con Python 3.10 o superior.
- Para las rutas PyTorch CUDA se requiere una GPU compatible con CUDA; no se especifica modelo minimo ni memoria recomendada.
- El simulador en C# .NET se ejecuta en CPU sobre el runtime .NET correspondiente.
- No se proporcionan datos de latencia ni throughput.
- Opciones de despliegue: ejecucion directa de los scripts del repositorio; no se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay modelo generativo.

## Comparativa con modelos similares

| Aspecto | AdaTCAdamW | AdamW (referencia) | Lion | Sophia |
|---|---|---|---|---|
| Tipo | Marco teorico y optimizador de investigacion | Optimizador estandar | Optimizador basado en signo | Optimizador de segundo orden |
| Parametros | No aplica | No aplica | No aplica | No aplica |
| Contexto | No aplica | No aplica | No aplica | No aplica |
| Rendimiento | Resultados teoricos y experimentales propios (no comparables en benchmarks estandar) | Ampliamente validado en produccion | Validado en LLMs | Validado en LLMs |
| Licencia | MIT | No disponible | No disponible | No disponible |
| Disponibilidad | Repositorio Hugging Face con paper y codigo | Implementado en PyTorch y frameworks | Implementado en frameworks | Implementado en frameworks |

La comparacion con AdamW, Lion y Sophia es orientativa y se limita a la categoria de optimizadores; no se dispone de datos de benchmarks comunes que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no puede usarse para inferencia.
- Los resultados citados (reducciones de MSE, exceso de riesgo, shocks de paso) provienen del paper del autor y no han sido replicados de forma independiente en la informacion disponible.
- El repositorio tiene cero descargas y cero likes, lo que indica ausencia de validacion por parte de la comunidad.
- La documentacion y el codigo estan en ingles; no hay version en castellano.
- Aunque la licencia es MIT, conviene revisar la implementacion antes de integrarla en produccion, dado que se trata de codigo de investigacion sin garantias.
- No se especifican sesgos conocidos ni riesgos de alucinacion porque no hay modelo generativo.
- No se detallan limitaciones de contexto ni de idioma mas alla del ingles en la documentacion.
- No hay evidencia publica de estabilidad del optimizador en entrenamientos a gran escala.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AndrewR123/AdaTCAdamW
- Paper PDF: `paper/HigherDimensional_EWMA_BiasCorrection_Paper.pdf` (dentro del repositorio)
- LaTeX del paper: `paper/main.tex` (dentro del repositorio)
- Typst del paper: `paper/main.typ` (dentro del repositorio)
- Verificacion simbolica: `python/verify_proofs.py` (dentro del repositorio)
- Implementacion C# .NET: carpeta `csharp/` (dentro del repositorio)
- Estudio predecesor: `EWMABiasCorrectionResearch` (2023), referenciado en la model card
