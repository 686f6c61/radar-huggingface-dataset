# jyliuAI/diffusion_baseline

## Resumen

`jyliuAI/diffusion_baseline` es un repositorio de Hugging Face que, más que un modelo individual, contiene un marco de experimentación reproducible para comparar modelos de lenguaje de difusión. El autor (jyliuAI) publica aquí el andamiaje de código, scripts, configuraciones y documentación necesarios para reproducir una matriz de experimentos sobre modelos de difusión continua, discreta e híbrida, así como sus variantes destiladas en pocos pasos.

El objeto de estudio son arquitecturas de generación de lenguaje no autorregresivas basadas en difusión: FLM, LangFlow, Duo, MDLM, CANDI y RDLM en el eje de múltiples pasos, y FMLM, Duo+DCD, Duo+Di4C, MDLM+SDTT y MDLM+Di4C en el eje de destilación a pocos pasos o un solo paso. Los experimentos se plantean sobre dos corpus de referencia: LM1B con tokenizador `bert-base-uncased` y longitud 128, y OpenWebText (OWT) con tokenizador `gpt2` y longitud 1024.

El repositorio tiene un tamaño de 86 GB, lo que refleja que incluye pesos y artefactos auxiliares en formatos `safetensors`, `onnx` y `tflite`, además de código y documentación. No obstante, la model card advierte explícitamente de que los datos, las instantáneas de código fuente, los checkpoints, los entornos Conda y las ejecuciones de entrenamiento e inferencia deben realizarse en un servidor Linux con GPU; el árbol de trabajo local solo contiene código, ficheros de bloqueo, scripts y documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de lenguaje de difusión (continua, discreta e hibrida); familia multiple (FLM, LangFlow, Duo, MDLM, CANDI, RDLM y variantes destiladas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 128 tokens (LM1B, tokenizador `bert-base-uncased`); 1024 tokens (OWT, tokenizador `gpt2`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, onnx, tflite |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura única, sino una matriz comparativa de métodos de difusión para lenguaje. En el eje de generación multi-paso se cubren propuestas continuas, discretas e híbridas: FLM, LangFlow, Duo, MDLM, CANDI y RDLM. En el eje de destilación se incluyen FMLM, Duo+DCD, Duo+Di4C, MDLM+SDTT y MDLM+Di4C, orientadas a reducir el número de pasos de muestreo. Los pasos evaluados en los métodos multi-paso son, en la mayoría de configuraciones, `1 2 4 8 16 32 1024`; RDLM se limita a sus valores oficiales por defecto de `1000` y `1024`, y sus versiones de `1/2/4/8/16/32` se excluyen como baseline principal porque el método original es un muestreo SDE de aproximadamente 1000 pasos y el truncamiento forzado produce tokens no canónicos y perplejidades anómalamente bajas. En destilación se evalúan los pasos `1 2 4 8 16 32`.

Cada configuración soportada genera 1.024 muestras con semilla fija 42. Las métricas de calidad son GPT-2 Large Generative PPL, entropía unigrama media y Self-BLEU; la métrica principal de latencia es seconds/sample medida con temporización CUDA independiente. La matriz de generación cubre 132 celdas soportadas que se escriben en `results/matrix/generation.tsv`, mientras que las combinaciones no soportadas (por ejemplo, RDLM sobre OWT) se registran en `results/matrix/unsupported.tsv` sin fabricar resultados. El flujo de trabajo exige ejecutar en servidor Linux con GPU una secuencia estricta de scripts: descarga y verificación de fuentes, descarga y preprocesado de datos, descarga y verificación de checkpoints, creación y verificación de entornos Conda, smoke tests, ejecución, evaluación, benchmark y agregación. Existe además un entrypoint paralelo para servidores de 4 GPU (`scripts/smoke_4gpu.sh`, `scripts/run_4gpu.sh`, etc.) que por defecto enlaza las GPU `0,1,2,3`.

## Capacidades

- Generación de texto no autorregresiva mediante muestreo por difusión en múltiples pasos (hasta 1024 pasos en las configuraciones evaluadas).
- Generación en pocos pasos o un solo paso mediante variantes destiladas (FMLM, Duo+DCD, Duo+Di4C, MDLM+SDTT, MDLM+Di4C), con pasos evaluados de 1 a 32.
- Evaluación comparativa de calidad de generación con GPT-2 Large Generative PPL, entropía unigrama media y Self-BLEU.
- Medición de latencia por muestra con temporización CUDA independiente, lo que permite comparar coste computacional entre métodos.
- Soporte de ejecución en servidores Linux multi-GPU, con entrypoints específicos para 4 GPU y para Slurm.
- Exportación de pesos en `safetensors`, `onnx` y `tflite`, lo que abre la puerta a despliegue en entornos fuera de PyTorch.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en modelos de lenguaje de difusión: el repositorio permite reproducir una matriz de 132 configuraciones de generación sobre LM1B y OWT con semilla fija, lo que facilita comparaciones controladas entre métodos continuos, discretos e híbridos.
- Evaluación de técnicas de destilación a pocos pasos: los scripts de entrenamiento y evaluación permiten medir la pérdida de calidad (PPL, entropía, Self-BLEU) al reducir de 1024 pasos a 1, 2, 4, 8, 16 o 32 pasos en cada método destilado.
- Benchmarking de latencia en hardware concreto: la métrica seconds/sample medida con temporización CUDA independiente permite comparar el coste real de cada método en un servidor de 4 GPU o en un nodo Slurm, útil para decidir qué variante desplegar en producción.
- Estudio de la relación calidad-latencia en generación no autorregresiva: al fijar 1.024 muestras por configuración y semilla 42, se pueden trazar curvas de PPL frente a pasos de muestreo y frente a seconds/sample para cada familia.
- Reproducción de resultados de artículos: el repositorio incluye instantáneas de código fuente, ficheros de bloqueo y configuraciones en `artifacts/` y `configs/`, lo que permite verificar la reproducibilidad de los baselines publicados por los autores originales de FLM, Duo, MDLM, CANDI y RDLM.
- Despliegue experimental en entornos no PyTorch: la presencia de pesos en `onnx` y `tflite` permite probar la inferencia de estos modelos de difusión en runtimes alternativos, aunque la información disponible no detalla el soporte real de operadores.
- Docencia y formación: la secuencia de scripts documentada (descarga, verificación, preprocesado, smoke test, ejecución, evaluación, benchmark, agregación) sirve como plantilla para montar un pipeline reproducible de experimentación con modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la metodología de evaluación (GPT-2 Large Generative PPL, entropía unigrama media, Self-BLEU y seconds/sample con temporización CUDA independiente), pero no incluye cifras concretas de ninguno de estos indicadores para las configuraciones evaluadas.

## Requisitos de hardware

- Servidor Linux con GPU: la model card indica explícitamente que el entrenamiento y la inferencia deben ejecutarse en un servidor Linux con GPU; el árbol de trabajo local (Mac/worktree) solo contiene código y documentación.
- Configuración de referencia: se documenta un entrypoint para servidores de 4 GPU con `DLB_GPUS=0,1,2,3` y `DLB_MAX_JOBS=4`, así como soporte para Slurm.
- VRAM estimada: no disponible. El repositorio ocupa 86 GB, pero ese tamaño incluye código, documentación, checkpoints y artefactos en varios formatos, por lo que no permite derivar la VRAM de inferencia de un modelo concreto.
- GPU recomendadas: no disponible. La documentación menciona ejecuciones en servidores con GPU y hace referencia a un plan sobre una H200 en uno de los documentos (`docs/11_elf_h200_next_steps.md`), pero no se especifica una lista de GPU recomendadas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio está orientado a ejecución mediante scripts propios sobre PyTorch y entornos Conda; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI. La presencia de pesos en `onnx` y `tflite` sugiere vías de despliegue alternativas, pero no se detallan.
- Latencia y throughput: no disponible como cifra; la metodología prevé medir seconds/sample con temporización CUDA independiente, pero no se publican resultados en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones cerradas de modelos comparables de la misma categoría (modelos de lenguaje de difusión) que permitan construir una tabla comparativa con cifras verificables.

## Limitaciones y advertencias

- No es un modelo único: se trata de un marco de experimentación que agrupa varios métodos de difusión; no debe citarse como un modelo con pesos y arquitectura únicos.
- Requiere servidor Linux con GPU: la model card indica que datos, checkpoints, entornos Conda y ejecuciones de entrenamiento e inferencia deben realizarse en un servidor Linux con GPU. El árbol local no es autosuficiente.
- Secuencia de ejecución estricta: el flujo exige ejecutar en orden `fetch_sources.sh`, `verify_sources.py`, `fetch_data.py`, `preprocess_data.py`, `verify_data.py`, `fetch_checkpoints.py`, `verify_checkpoints.py`, creación y verificación de entornos, smoke tests, ejecución, evaluación, benchmark y agregación. Saltarse pasos invalida la reproducibilidad.
- Resultados parciales no válidos como resultado principal: `aggregate_results.py --partial` está pensado solo para diagnóstico y no como resultado de artículo.
- Exclusiones metodológicas: RDLM sobre OWT no se ejecuta y se registra en `unsupported.tsv`; los pasos bajos de RDLM (`1/2/4/8/16/32`) no se aceptan como baseline principal porque el muestreo SDE original requiere aproximadamente 1000 pasos y el truncamiento produce tokens no canónicos y PPL anómalamente baja.
- Licencia no disponible: al no constar licencia en la información proporcionada, no puede confirmarse el uso comercial ni la redistribución de pesos o código.
- Idiomas no disponibles: no se declaran idiomas soportados; los corpus de evaluación son LM1B (inglés) y OpenWebText (inglés), por lo que no hay evidencia de capacidades multilingües.
- Sin benchmarks publicados: no hay cifras de MMLU, HumanEval, GSM8K ni de las métricas propias (PPL, Self-BLEU, seconds/sample) en la información disponible, lo que impide evaluar su rendimiento relativo.
- Sesgos y alucinación: no se documentan análisis específicos de sesgo ni tasas de alucinación; al tratarse de modelos entrenados sobre LM1B y OWT, son previsibles los sesgos presentes en esos corpus, pero no se cuantifican en la información disponible.
- Sin soporte documentado de tool calling, agentes ni multimodalidad: no se describen estas capacidades, por lo que no deben asumirse en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jyliuAI/diffusion_baseline
- Documentación interna citada en la model card (rutas relativas al repositorio, no enlaces absolutos):
  - `docs/01_sources_and_availability.md`
  - `docs/02_datasets.md`
  - `docs/03_environments.md`
  - `docs/04_checkpoints.md`
  - `docs/05_training.md`
  - `docs/06_generation_and_evaluation.md`
  - `docs/07_slurm.md`
  - `docs/08_troubleshooting.md`
  - `docs/09_four_gpu_local.md`
  - `docs/EXPERIMENT_MATRIX.md`
  - `docs/10_elf_server_runbook.md`
  - `docs/11_elf_h200_next_steps.md`
  - `docs/12_elf_condition_recovery.md`
  - `docs/13_elf_eos_fix.md`
  - `docs/14_elf_quality_remaining.md`
  - `docs/15_elf_gpu01_queue.md`
  - `docs/16_elf_results_and_timing.md`
  - `docs/17_elf_matched_baseline_plan.md`
  - `docs/18_elf_owt_public_baseline.md`
  - `docs/19_elf_short_response_rescore.md`
  - `docs/20_elf_owt_c64r512.md`
