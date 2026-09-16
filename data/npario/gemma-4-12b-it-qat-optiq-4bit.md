# npario/gemma-4-12B-it-qat-OptiQ-4bit

## Resumen
npario/gemma-4-12B-it-qat-OptiQ-4bit es una cuantización de precisión mixta en formato MLX del modelo google/gemma-4-12B-it-qat-q4_0-unquantized, la variante de 12.000 millones de parámetros de Gemma 4 entrenada por Google con quantization-aware training (QAT). El artefacto lo publica el usuario npario y lo produce mlx-optiq, un conjunto de herramientas nativas de MLX para cuantizar, ajustar y servir modelos localmente en Apple Silicon, sin PyTorch y sin nube.

El modelo resuelve dos problemas concretos. Primero, comprimir un modelo de 11.907.350.272 parámetros a un repositorio de 9,0 GB y unos 8,3 GB en disco (5,25 bits por peso) para que quepa en memoria unificada de equipos Apple. Segundo, hacerlo sin degradar capacidades frente a una cuantización uniforme de 4 bits del mismo base: asigna 8 bits a 157 componentes sensibles y mantiene 4 bits en 171 componentes robustos, sobre 328 componentes cuantizados en total, con grupo de tamaño 64.

Su relevancia es que la asignación de bits por capa guiada por sensibilidad sigue aportando ganancia incluso sobre pesos ya preparados con QAT: +1,37 puntos de Capability Score (media de MMLU, GSM8K, IFEval, BFCL, HumanEval y HashHop) frente a la cuantización uniforme de 4 bits, con +5,0 puntos en HashHop de contexto largo. Además conserva una torre de visión en bf16 en un sidecar, de modo que cubre texto e imagen+texto desde un único artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (model_type declarado); incluye torre de texto unificada y torre de vision en bf16; detalle de capas y atencion no disponible |
| Parametros totales | 11.907.350.272 (segun safetensors) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (el benchmark HashHop evalua contexto largo, pero no se publica la ventana) |
| Tipos de cuantizacion | Precision mixta 4-bit y 8-bit: 157 componentes a 8 bits, 171 componentes a 4 bits, 328 totales; 5,25 bits por peso; grupo de 64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors en formato MLX (mlx-optiq); vision en optiq_vision.safetensors (bf16); GGUF no disponible |
| Modelo base | google/gemma-4-12B-it-qat-q4_0-unquantized (QAT) |
| Libreria | mlx (requiere mlx-lm desde main e import optiq) |
| Tamano del repositorio | 9,0 GB (aproximadamente 8,3 GB en disco segun la model card) |
| Drafter especulativo | google/gemma-4-12B-it-qat-q4_0-unquantized-assistant, via optiq serve --drafter |
| Fecha de publicacion | 2026-09-15 |

## Arquitectura y entrenamiento
El modelo es una cuantizacion, no un entrenamiento nuevo. Se parte del base QAT de Google, es decir, de pesos que ya fueron entrenados para tolerar cuantizacion de bajo bit, y sobre ellos mlx-optiq aplica una pasada de sensibilidad por divergencia KL con una mezcla de calibracion de seis dominios (prosa, razonamiento, codigo, agente, llamada a herramientas e instrucciones con restricciones). El presupuesto de bits se reparte capa a capa: los componentes sensibles suben a 8 bits y los robustos se quedan en 4 bits, tomando como referencia una cuantizacion uniforme de 4 bits servida en streaming. El resultado son 5,25 bits por peso efectivos, frente a 4,0 bits por peso de una cuantizacion uniforme.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset original de Gemma 4, ni sobre las fases de RLHF o DPO del modelo base: esos datos corresponden a la ficha de Google y no se reproducen en esta. La innovacion tecnica documentada es la asignacion mixta de precision guiada por sensibilidad sobre un base QAT, mas el soporte de decodificacion especulativa mediante un drafter dedicado y una torre de vision en bf16 que mlx-lm ignora deliberadamente (hace glob de model*.safetensors), de modo que las rutas de texto y de imagen+texto conviven en un unico artefacto.

## Capacidades
- Generacion de texto conversacional (pipeline text-generation) y entrada imagen+texto (image-text-to-text) mediante la torre de vision en bf16.
- Razonamiento y matematicas: 93,3% en GSM8K, lo que indica buena resolucion de problemas aritmeticos de varios pasos.
- Generacion de codigo: 91,5% en HumanEval pass@1, con soporte de la ruta de codigo incluida en la mezcla de calibracion.
- Seguimiento de instrucciones: 73,6% en IFEval en modo estricto sobre el conjunto completo.
- Tool calling y function calling: 72,0% en BFCL-V3 simple, con dominio especifico de tool-call en la calibracion.
- Capacidades de agente y razonamiento multi-paso: la mezcla de calibracion incluye un dominio de agente y otro de instrucciones con restricciones.
- Contexto largo: evaluado con HashHop, donde la version OptiQ obtiene 35,0% frente al 30,0% de la uniforme de 4 bits.
- Decodificacion especulativa: soportada con el drafter google/gemma-4-12B-it-qat-q4_0-unquantized-assistant.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Asistentes conversacionales locales en Mac: al ser un artefacto MLX de 4 bits mixtos con unos 8,3 GB en disco, puede ejecutarse integramente en memoria unificada de un equipo Apple Silicon y mantener conversaciones multi-turno sin enviar datos a la nube.
- Generacion de codigo en el editor: con 91,5% en HumanEval pass@1, es adecuado para autocompletado y generacion de funciones dentro de un IDE local, evitando exponer el repositorio a servicios externos.
- Automatizacion de agentes con herramientas: el 72,0% en BFCL-V3 simple y el dominio de tool-call de la calibracion lo hacen util para agentes que invocan APIs, ejecutan comandos o encadenan pasos con restricciones de formato.
- Analisis de documentos con imagen y texto: la torre de vision en bf16 permite procesar capturas, diagramas o formularios escaneados junto con instrucciones textuales en un mismo flujo, por ejemplo para extraer campos estructurados.
- Tareas de razonamiento y matematicas en pipelines internos: el 93,3% en GSM8K permite usarlo para validacion de calculos, generacion de problemas resueltos o comprobacion de resultados numericos en herramientas educativas.
- Procesamiento de contexto largo en local: la ventaja de +5,0 puntos en HashHop frente a la cuantizacion uniforme lo hace preferible para resumir o consultar documentos extensos cuando la ventana de contexto disponible (no publicada) sea suficiente.
- Servicio local con decodificacion especulativa: mediante optiq serve --drafter se puede levantar un endpoint con el drafter de Gemma 4 para reducir la latencia por token en entornos de desarrollo y demos.
- Evaluacion de tecnicas de cuantizacion: como artefacto de referencia para comparar asignacion mixta de precision frente a cuantizacion uniforme sobre el mismo base QAT.

## Benchmarks y rendimiento

Datos publicados en la model card. La comparacion se establece contra una cuantizacion uniforme de 4 bits del mismo base QAT, lo que aisla el efecto de la asignacion mixta de precision manteniendo el base fijo.

| Benchmark | Este modelo (OptiQ, base QAT) | Uniforme 4-bit (base QAT) | Delta |
|---|---|---|---|
| MMLU (5-shot, 1000) | 52,5% | 50,9% | +1,6 |
| GSM8K (1000) | 93,3% | 93,1% | +0,2 |
| IFEval (completo, estricto) | 73,6% | 72,3% | +1,3 |
| BFCL-V3 simple (200) | 72,0% | 72,5% | -0,5 |
| HumanEval (pass@1, 164) | 91,5% | 90,9% | +0,6 |
| HashHop (contexto largo) | 35,0% | 30,0% | +5,0 |
| Capability Score (media) | 69,64 | 68,27 | +1,37 |

La model card indica ademas que el margen sobre la cuantizacion uniforme es coherente con el observado en otros tamanos QAT de Gemma 4: +2,09 en E2B y +1,19 en E4B. No se han publicado resultados de benchmarks frente a modelos de otras familias en la informacion disponible.

## Requisitos de hardware
- VRAM o memoria unificada estimada: alrededor de 8,3 GB en disco para los pesos segun la model card (5,25 bits por peso) y 9,0 GB de repositorio; conviene reservar memoria adicional para el contexto, la torre de vision en bf16 y el drafter especulativo.
- GPU recomendadas: no aplica el ecosistema CUDA; el modelo esta empaquetado para MLX y se ejecuta en Apple Silicon con memoria unificada. GPU como A100, H100 o RTX 4090 no estan soportadas por esta distribucion.
- Compatibilidad con hardware de consumo: si, esta pensado para equipos Apple Silicon con memoria unificada suficiente; con 8,3 GB de pesos, un Mac con 16 GB de memoria unificada es el minimo razonable, y 24 GB o mas deja margen para contexto largo y vision.
- Opciones de despliegue: mlx-lm (obligatoriamente desde main, no desde la version 0.31.3 de PyPI) junto con import optiq para registrar el tipo gemma4_unified; optiq serve para imagen+texto y para el drafter especulativo. vLLM, TGI, llama.cpp y Ollama no se mencionan como soportados (formato GGUF no disponible).
- Requisito de instalacion: pip install -U mlx-optiq "mlx-lm @ git+https://github.com/ml-explore/mlx-lm.git"; la torre de texto unificada no esta en el release de PyPI y el build de main tambien reporta 0.31.3, por lo que hay que instalar desde git y no fijar version.
- Latencia y throughput estimados: no disponible. La unica referencia de rendimiento es la disponibilidad de decodificacion especulativa mediante drafter, que reduce la latencia por token sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano en disco | Capability Score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| gemma-4-12B-it-qat-OptiQ-4bit (este) | 11.907.350.272 | no disponible | 5,25 | aprox. 8,3 GB | 69,64 | apache-2.0 | MLX, via mlx-optiq |
| Cuantizacion uniforme 4-bit del mismo base QAT | mismo base | no disponible | 4,0 | aprox. 6,2 GB | 68,27 | apache-2.0 (base) | MLX |
| Variantes OptiQ QAT de Gemma 4 E2B / E4B | no disponible | no disponible | no disponible | no disponible | delta de +2,09 y +1,19 frente a uniforme 4-bit | apache-2.0 (base) | MLX, via mlx-optiq |
| Modelos comparables de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- MMLU de 52,5% en 5-shot: el conocimiento factual y academico es moderado, inferior al de modelos mayores; el propio rendimiento en HashHop (35,0%) indica margen claro de mejora en contexto largo.
- BFCL-V3 simple es el unico benchmark donde el modelo queda por debajo de la cuantizacion uniforme (-0,5), por lo que el uso intensivo de tool calling conviene validarlo con pruebas propias.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion en la informacion disponible; al ser un modelo conversacional de 12B cuantizado, la verificacion factual en produccion es necesaria.
- Sesgos conocidos: no disponible; no se publica informacion sobre sesgos ni sobre la composicion del dataset del modelo base.
- Idiomas soportados: no disponible, lo que impide garantizar un comportamiento multilingue mas alla de lo que herede del base.
- Restricciones de licencia: el repositorio declara apache-2.0, pero enlaza a la licencia especifica de Gemma 4 de Google (https://ai.google.dev/gemma/docs/gemma_4_license). Conviene revisar ese documento antes de un uso comercial, ya que puede imponer condiciones adicionales a las de Apache 2.0.
- Dependencia de versiones: requiere mlx-lm desde git e import optiq; instalar solo desde PyPI no basta porque la torre de texto unificada no esta incluida en la version publicada, y el build de main reporta el mismo numero de version (0.31.3), lo que complica el control de versiones en produccion.
- Portabilidad limitada: el formato es MLX, no GGUF ni safetensors estandar de PyTorch; el despliegue queda restringido a Apple Silicon.
- Discrepancia de identificador: la model card encabeza el modelo como mlx-community/gemma-4-12B-it-qat-OptiQ-4bit mientras que el identificador consultado es npario/gemma-4-12B-it-qat-OptiQ-4bit; el ejemplo de carga del README apunta a mlx-community, por lo que hay que ajustar el identificador al repositorio que se vaya a usar.
- Metricas con tamanos de muestra pequenos en varios casos (BFCL-V3 simple con 200 elementos, HumanEval con 164), lo que limita la significacion de las diferencias de decimas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/npario/gemma-4-12B-it-qat-OptiQ-4bit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Drafter especulativo: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized-assistant
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Herramienta de cuantizacion mlx-optiq: https://mlx-optiq.com
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Entorno Lab de mlx-optiq: https://mlx-optiq.com/docs/lab/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Mezcla de calibracion de seis dominios: https://mlx-optiq.com/blog/calibration-mix
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a paginas corporativas de Microsoft y no guardan relacion con esta ficha).
