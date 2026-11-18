# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-swedish-seed1

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-swedish-seed1` es un adaptador LoRA entrenado sobre SmolLM2-360M-Instruct, afinado secuencialmente primero en la porcion sueca y despues en la porcion feroesa del corpus FineWeb-2. Lo desarrolla el usuario de Hugging Face `jekunz` como parte de una linea de experimentos de adaptacion linguistica de bajo coste para idiomas de bajos recursos, y se publica bajo licencia Apache 2.0.

El interes tecnico del artefacto no esta en el modelo base (un transformer denso de 360 millones de parametros con ventana de contexto nativa de 2048 tokens en este entrenamiento), sino en la estrategia de transferencia: se parte de un adaptador ya entrenado en sueco y se continua el ajuste en feroes, aprovechando el parentesco germano-nordico entre ambas lenguas para reducir la cantidad de datos necesarios. El resultado es un adaptador de rango 256 y alpha 512 que se aplica sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` de la MLP y de la atencion.

Es relevante ahora porque ilustra una receta reproducible y economica (una sola A100 de 40 GB, 6 epocas totales) para llevar un modelo instruct pequeno a un idioma con pocos recursos como el feroes, y porque forma parte de una familia de tres semillas (esta es la semilla 1) que permite estimar la varianza del entrenamiento. El autor advierte explicitamente de que el modelo no ha sido evaluado de forma amplia y que su proposito es la investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360 M en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables (rango 256) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en el entrenamiento) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos del adaptador en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Feroes (`fo`); entrenado previamente en sueco durante el transfer |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only denso de 360 millones de parametros. Sobre el se aplica un adaptador LoRA de rango 256 y alpha 512, con dropout no especificado, dirigido a cuatro modulos: `up_proj`, `down_proj` y `gate_proj` (componentes de la MLP con activacion tipo SwiGLU) y `o_proj` (proyeccion de salida de la atencion). No se ajustan los pesos de embedding ni las proyecciones `q_proj`, `k_proj` ni `v_proj`.

El entrenamiento es secuencial en dos fases: una epoca sobre la porcion sueca de FineWeb-2 y cinco epocas sobre la porcion feroesa del mismo corpus. Se usa tasa de aprendizaje 8e-4 con scheduler coseno, warmup ratio 0.05, tamano de lote 8 con 32 pasos de acumulacion de gradiente (lote efectivo 256), longitud maxima de 2048 tokens y una unica GPU A100 de 40 GB. La semilla es 1, una de tres semillas con la misma configuracion, lo que permite medir la variabilidad del proceso. No se documentan etapas de RLHF, DPO ni filtrado adicional del corpus mas alla del propio FineWeb-2.

## Capacidades

- Generacion de texto conversacional en feroes, heredada de la naturaleza instruct del modelo base y adaptada mediante el ajuste en FineWeb-2.
- Transferencia linguistica desde el sueco: el adaptador intermedio sueco actua como inicializacion para el feroes, lo que puede mejorar la estabilidad con pocos datos.
- Generacion condicionada por prompt (pipeline `text-generation`), sin plantilla de chat documentada especificamente para el adaptador.
- Capacidades residuales del modelo base en razonamiento, codigo y matematicas, aunque no evaluadas tras el ajuste.
- Soporte de tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio: no disponible.
- Multilinguismo: limitado a feroes como idioma objetivo; el resto de capacidades multilingues del base no se han verificado.

## Casos de uso

- Generacion de texto en feroes para experimentacion linguistica: el adaptador permite producir texto feroes con un modelo de 360 M de parametros, util para prototipar aplicaciones de PLN en un idioma con pocos recursos.
- Aumento de datos para PLN feroes: generar corpus sinteticos o parafrasis en feroes que alimenten posteriores entrenamientos o sistemas de traduccion.
- Investigacion sobre transferencia entre lenguas nordicas: comparar esta semilla con las otras dos del mismo autor para estimar la varianza del ajuste sueco -> feroes.
- Evaluacion de tecnicas LoRA de bajo coste: servir de referencia reproducible (rango 256, alpha 512, 6 epocas, una A100) en estudios sobre adaptacion de modelos pequenos.
- Clasificacion y etiquetado asistido de texto feroes: usar el modelo como generador de etiquetas o resumenes en pipelines de anotacion semiautomatica.
- Despliegue en entornos con recursos muy limitados: al requerir solo el modelo base de 360 M mas un adaptador de ~0,4 GB, puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion no criticas.
- Base para futuros ajustes: punto de partida para fine-tuning adicional en feroes con datos propios, dado que el adaptador ya esta alineado con el dominio de FineWeb-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 ocupa aproximadamente 0,7 GB; en 8 bits, unos 0,4 GB; en 4 bits, unos 0,25 GB. El adaptador anade ~0,4 GB en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para entrenamiento, el autor uso una A100 de 40 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` + `peft` (carga del base y del adaptador), llama.cpp u Ollama solo si se fusiona y convierte el adaptador a GGUF (no documentado por el autor), vLLM y TGI si se fusionan los pesos en un modelo completo.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroes) | 360 M + LoRA r256 | 2048 | Feroes | Apache 2.0 | Ajuste secuencial sueco -> feroes, sin evaluar |
| SmolLM2-360M-Instruct (base) | 360 M | 8192 nativo (2048 en este entrenamiento) | Multilingue (principalmente ingles) | Apache 2.0 | Modelo de referencia de Hugging Face TB; sin adaptacion al feroes |
| Otros adaptadores de la misma familia (`jekunz/smollm-360m-lora-fineweb-swedish`, semillas 2 y 3) | 360 M + LoRA r256 | 2048 | Sueco / feroes | Apache 2.0 | Misma configuracion, distinta semilla; utiles para medir varianza |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en feroes con alternativas como GPT-2 feroes o modelos multilingues de mayor tamano.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara que no se ha realizado una evaluacion amplia, por lo que no hay garantias de calidad en feroes ni de ausencia de regresiones respecto al base.
- Riesgo de alucinacion: al ser un modelo de 360 M ajustado sobre un corpus web, la probabilidad de generar contenido factualmente incorrecto es alta, especialmente en dominios especializados.
- Sesgos: FineWeb-2 es un corpus web filtrado pero no curado; puede contener sesgos de genero, culturales y de representacion propios de la web.
- Limitacion de contexto: la ventana usada en el entrenamiento es de 2048 tokens, inferior al contexto nativo del base; no se recomienda superar ese limite.
- Cobertura idiomatica: el feroes es un idioma de bajos recursos y el volumen de datos disponible en FineWeb-2 es limitado, lo que puede traducirse en una calidad irregular.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base SmolLM2-360M-Instruct y las condiciones de uso del corpus FineWeb-2.
- Uso en produccion: no recomendado sin una evaluacion previa en el dominio objetivo; el autor lo describe como un artefacto de investigacion.
- Dependencia del adaptador: requiere cargar el modelo base `jekunz/smollm-360m-lora-fineweb-swedish` o el SmolLM2-360M-Instruct original, lo que anade complejidad al despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-swedish-seed1
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-swedish
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Libreria PEFT: https://github.com/huggingface/peft
