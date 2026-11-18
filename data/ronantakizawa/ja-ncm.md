# ronantakizawa/ja-ncm

## Resumen

ja-NCM es un modelo fundacional japones basado en Next-Concept Modeling (NCM), una arquitectura alternativa a la generacion autoregresiva token a token. Lo desarrolla ronantakizawa y se publica bajo licencia MIT. En lugar de predecir un token por paso, un tokenizador de conceptos (un VQ-VAE multiescala) comprime una ventana de 128 tokens en 12 niveles de codigos discretos, y un transformer generador predice esos codigos nivel a nivel, de grueso a fino, emitiendo todos los codigos de un nivel de golpe. Esto reduce la generacion de un pasaje completo a 12 pasadas hacia delante independientemente de su longitud.

El modelo principal es un generador de 24x1024 (316M parametros) entrenado desde cero sobre texto web japones (FineWeb-2-Edu-Japanese), con fine-tunes para traduccion ingles-japones y resumen en japones, mas un modelo japones-ingles en la carpeta `phase-a`. Es relevante porque traslada al japones una familia de modelos (NCM) que hasta ahora solo se habia validado en ingles, y porque publica baselines de difusion enmascarada (MDLM) y autoregresivos entrenados con el mismo presupuesto, lo que permite evaluar las afirmaciones del paper original en japones.

La propuesta encaja en investigacion sobre generacion de texto paralela: el modelo no busca competir en calidad con LLM autoregresivos grandes, sino demostrar ventajas de latencia y eficiencia de entrenamiento en un idioma distinto del ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Next-Concept Modeling: tokenizador de conceptos VQ-VAE multiescala (12 niveles) + transformer generador que predice codigos por niveles |
| Parametros totales | 316M en el generador v3/uncond (24x1024); 12x768 en los modelos de resumen y ja-en |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 128 tokens por pasaje (el tokenizador comprime ventanas de 128 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`safetensors.torch.load_file`, `load_state_dict(strict=True)`) |

## Arquitectura y entrenamiento

El modelo se divide en dos componentes. El tokenizador de conceptos es un VQ-VAE multiescala que comprime una ventana de 128 tokens en 12 niveles de codigos discretos: el primer nivel captura la idea general del pasaje y cada nivel posterior anade detalle fino. El generador es un transformer que predice estos codigos nivel a nivel, de grueso a fino, y emite simultaneamente todos los codigos de un nivel. El decodificador del tokenizador reconstruye el texto a partir de los codigos finales. El tokenizador v3 usa el vocabulario de llm-jp-3 y alcanza un 99,73% de reconstruccion de tokens. Los tres modelos v3 comparten `v3/tokenizer.safetensors`; `phase-a/ja-en` tiene su propio tokenizador.

El entrenamiento del generador incondicional v3 se hizo desde cero durante 100k pasos con batch de 512 y ventanas de 128 tokens sobre una muestra de 10BT de FineWeb-2-Edu-Japanese. Los fine-tunes de traduccion en->ja y de resumen parten de ese modelo; el resumen (12x768) pasa por preentrenamiento incondicional, destilacion de resumenes y ajuste final con XL-Sum ja. El modelo ja->en de `phase-a` se obtuvo ajustando un NCM ya publicado (entrenado en WMT14 De->En) sobre datos ja->en, con el tokenizador ingles congelado. La innovacion clave es la generacion paralela por niveles: un pasaje completo requiere 12 pasadas hacia delante sea cual sea su longitud, frente a una pasada por token de los modelos autoregresivos. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de texto en japones de forma incondicional (modelo base `v3/uncond`).
- Traduccion ingles-japones (`v3/en-ja`) y japones-ingles (`phase-a/ja-en`).
- Resumen de texto en japones (`v3/summ`).
- Generacion paralela por niveles de concepto (12 pasadas por pasaje), con latencia independiente de la longitud del texto generado.
- Capacidades multilingues limitadas al par ja-en.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Uso previsto declarado: investigacion sobre modelado de conceptos y generacion de texto paralela.

## Casos de uso

- Investigacion en generacion paralela de texto: el modelo sirve como referencia open-weight en japones para comparar NCM frente a difusion enmascarada y modelos autoregresivos con el mismo presupuesto de entrenamiento, usando las metricas de perplejidad generativa y latencia ya publicadas.
- Traduccion en->ja de bajo coste por paso: con 18,3 ms por frase en una H100 a batch 16 y BLEU de 12,16 en FLORES+, encaja en pipelines donde el rendimiento por unidad de computo importa mas que la calidad absoluta, como preprocesado o generacion de borradores que luego revisa un modelo mayor.
- Resumen extractivo-abstra ctivo en japones a escala: el modelo `v3/summ` (12,9 ms por resumen en H100) permite procesar grandes volumenes de documentos japoneses para indexacion o alertas, con ROUGE-1 de 34,50 en XL-Sum ja.
- Prototipado de traduccion ja->en en entornos academicos: `phase-a/ja-en` y su baseline autoregresivo `phase-a/ja-en-ar-baseline` permiten reproducir comparativas controladas con datos y esquema identicos.
- Generacion de texto japones sintetico para aumento de datos: el generador incondicional puede producir pasajes de 128 tokens con 12 pasadas, util para crear corpus de preentrenamiento o pruebas de robustez.
- Experimentacion con tokenizadores de conceptos: el tokenizador VQ-VAE multiescala con 99,73% de reconstruccion se puede reutilizar para estudiar compresion discreta de texto japones en otros proyectos de investigacion.
- Evaluacion de latencia en hardware consumer o servidor: la arquitectura de 12 pasos fijos permite medir el coste real de generacion paralela frente a decodificacion autoregresiva en distintos GPUs.

## Benchmarks y rendimiento

Perplejidad generativa en generacion incondicional v3 bajo llm-jp-3-1.8b a la entropia de caracteres de los datos (menor es mejor; texto real 21,3):

| Modelo | Pasos | Perplejidad generativa | Latencia (ms/secuencia, H100, batch 16) |
|---|---|---|---|
| NCM (v3) | 12 | 300 | 6,1 |
| MDLM mismo tamano | 16 | 313 | 14,9 |
| MDLM mismo tamano | 128 | 121 | no disponible |
| AR 12x768 | no disponible | 52 | 16,9 |

Traduccion en->ja v3 (greedy):

| Test | BLEU (ja-mecab) | COMET-22 | ms/frase (H100, batch 16) |
|---|---|---|---|
| FLORES+ | 12,16 | 68,36 | 18,3 |
| NTREX | 13,60 | 67,49 | 17,8 |
| KFTT | 18,97 | 73,62 | 18,3 |
| ALT | 19,20 | 72,94 | 18,6 |

Resumen v3 en XL-Sum ja test (MeCab ROUGE-1/2/L): 34,50 / 12,58 / 24,93; 12,9 ms por resumen. Los resultados por conjunto de test y las salidas estan en las carpetas `results/` de cada modelo; las puntuaciones de Phase A estan en `phase-a/*/results/`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 316M parametros en el generador v3, en fp16 el peso ronda los 0,6 GB; el repositorio completo ocupa 5,4 GB e incluye tokenizador, fine-tunes y baselines.
- GPU recomendadas: los benchmarks se midieron en una H100 con CUDA graphs. No se publican mediciones en otras GPUs.
- GPU consumer: por tamano (316M y 12x768), es plausible que quepa en GPUs consumer de 8-16 GB, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el autor indica usar el codigo del proyecto ja-NCM con las clases NCM incluidas; los pesos se cargan con `safetensors.torch.load_file` y `load_state_dict(strict=True)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser una arquitectura transformer estandar es improbable que funcionen sin adaptacion.
- Latencia: 6,1 ms por secuencia en generacion incondicional, 17,8-18,6 ms por frase en traduccion en->ja y 12,9 ms por resumen, todo en H100 a batch 16 con CUDA graphs. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ja-NCM (v3/uncond) | 316M (24x1024) | ventana de 128 tokens | NCM, 12 pasos fijos | MIT | pesos safetensors en HF |
| MDLM baseline (mismo tamano) | mismo que el generador NCM | 128 tokens | difusion enmascarada | no disponible | incluido como baseline en el proyecto |
| AR baseline 12x768 | 12x768 | 128 tokens | autoregresivo decoder-only | no disponible | incluido como baseline en el proyecto |
| NCM original (Kumbong et al., 2026) | no disponible | no disponible | NCM en ingles | MIT (codigo y checkpoints) | publicado por los autores del paper |

La comparativa directa solo es posible contra los baselines del propio autor, entrenados con el mismo presupuesto y los mismos datos japoneses. No se dispone de comparacion con LLM japoneses de proposito general como llm-jp o Swallow en la informacion proporcionada.

## Limitaciones y advertencias

- La perplejidad generativa del NCM (300 a 12 pasos) es muy superior a la del baseline autoregresivo (52), lo que indica una calidad de texto notablemente inferior pese a la ventaja de latencia.
- La ventana efectiva es de 128 tokens por pasaje, muy corta para documentos largos o conversaciones multi-turno.
- Solo cubre japones e ingles; no hay soporte de otros idiomas.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinacion; al entrenarse sobre texto web japones, es probable que herede sesgos del corpus, pero no hay mediciones publicadas.
- La licencia del modelo es MIT, pero los datos de entrenamiento incluyen XL-Sum ja (CC BY-NC-SA 4.0), lo que puede imponer restricciones adicionales al uso comercial derivado de ese fine-tune.
- El modelo esta orientado a investigacion; no se declara validacion para produccion.
- Requiere el codigo del proyecto ja-NCM para cargar los pesos; no es compatible de serie con runtimes estandar de inferencia.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronantakizawa/ja-ncm
- Paper de Next-Concept Modeling (Kumbong et al., 2026): https://arxiv.org/abs/2610.14162
