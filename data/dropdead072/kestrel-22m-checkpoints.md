# Dropdead072/kestrel-22m-checkpoints

## Resumen

Kestrel-22M-A4M es un modelo de lenguaje de tipo decoder-only con arquitectura Mixture of Experts (MoE) de 22 303 488 parametros totales, desarrollado por el usuario Dropdead072 como material didactico para un curso de formacion de LLM. El repositorio no contiene un modelo entrenado listo para inferencia, sino un conjunto de checkpoints de preentrenamiento (en formato PyTorch, fp32) pensados para que los alumnos comparen dos optimizadores distintos: AdamW y Muon, partiendo de una misma inicializacion con semilla 1337.

Su relevancia es exclusivamente pedagogica: permite estudiar curvas de aprendizaje, divergencias entre optimizadores y el comportamiento de una MoE pequena (8 expertos SwiGLU, top-2) entrenada sobre una muestra de FineWeb-Edu (sample-10BT) con una ventana de contexto de 512 tokens. No es un modelo destinado a produccion ni a evaluacion de capacidades generales, y no se ha publicado ninguna evaluacion de benchmarks.

La ficha se limita a lo que declara la model card y los metadatos de HuggingFace; cualquier dato no presente se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con Mixture of Experts (8 expertos SwiGLU, enrutamiento top-2) |
| Parametros totales | 22 303 488 |
| Parametros activos | no disponible (top-2 de 8 expertos; no se detalla el reparto exacto por capa) |
| Longitud de contexto | 512 tokens (seq_len de preentrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoints en fp32; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (datos de entrenamiento en ingles via FineWeb-Edu) |
| Licencia | other (la model card no especifica terminos; los datos de entrenamiento son ODC-By 1.0) |
| Formato de pesos | PyTorch state_dict en fp32 dentro de `.pt` (`{"model": state_dict, "meta": {...}}`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capa MoE de 8 expertos SwiGLU y enrutamiento top-2, con 22 303 488 parametros totales. El repositorio incluye dos checkpoints de preentrenamiento que parten de un mismo `init.pt` (semilla 1337): `ckpt_A.pt`, entrenado con AdamW, y `ckpt_M.pt`, entrenado con Muon. La carga se realiza mediante la funcion `kestrel.model.model.load_checkpoint`, lo que implica que el codigo del modelo no esta incluido en el repositorio y debe obtenerse del material del curso.

Los hiperparametros de preentrenamiento declarados son: longitud de secuencia 512, tamano de batch 64, 1500 pasos, learning rate pico 0.002 con schedule WSD (warmup de 100 pasos y decaimiento de 0.2), AdamW con betas (0.9, 0.95) y weight decay 0.1, y Muon con momentum 0.95. Los datos provienen de FineWeb-Edu (muestra sample-10BT, licencia ODC-By 1.0). El repositorio incluye `pretrain_logs.json` con las curvas de entrenamiento y `reference.json` con la perdida de validacion de referencia y estadisticas. No se documenta ninguna fase de ajuste fino, RLHF o DPO, ni innovaciones tecnicas mas alla del uso comparado de Muon frente a AdamW.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el estado de preentrenamiento y por el reducido numero de pasos (1500) y de tokens vistos.
- Razonamiento y matematicas: no se ha evaluado ni documentado; no disponible.
- Generacion de codigo: no se ha evaluado ni documentado; no disponible.
- Tool calling / function calling: no soportado de forma documentada.
- Agentes y razonamiento multi-paso: no soportado de forma documentada.
- Capacidades multilingues: no documentadas; los datos de entrenamiento son en ingles (FineWeb-Edu).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Uso previsto: comparacion experimental de optimizadores (AdamW frente a Muon) en un entorno educativo.

## Casos de uso

- Docencia de preentrenamiento de LLM: el par de checkpoints permite a los alumnos cargar `ckpt_A.pt` y `ckpt_M.pt` con `load_checkpoint` y comparar curvas de perdida de entrenamiento y validacion usando `pretrain_logs.json` y `reference.json`.
- Estudio comparativo de optimizadores: analisis de la estabilidad y velocidad de convergencia de Muon (momentum 0.95) frente a AdamW (betas 0.9/0.95, weight decay 0.1) partiendo de la misma inicializacion con semilla 1337.
- Reproducibilidad de experimentos: la semilla fija y la inclusion de `init.pt` permiten repetir el preentrenamiento y verificar que las diferencias observadas se deben al optimizador y no a la inicializacion.
- Analisis de enrutamiento MoE: inspeccion del comportamiento de los 8 expertos SwiGLU con top-2 en un modelo de 22M de parametros, util para entender el reparto de carga entre expertos en modelos mayores.
- Practicas de ingenieria de entrenamiento: uso del schedule WSD (warmup 100, decaimiento 0.2) y de los hiperparametros declarados como plantilla para experimentos de menor escala.
- Evaluacion de calidad del dataset: al entrenar sobre FineWeb-Edu sample-10BT, sirve para estudiar el efecto de la composicion y filtrado del corpus en la perdida de validacion de un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona `reference.json` con la perdida de validacion de referencia y estadisticas, sin cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,3M de parametros, aproximadamente 89 MB de pesos); el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) o incluso CPU para inferencia; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer: si, en cualquier GPU con al menos 1 GB de VRAM.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que los pesos son state_dict de PyTorch en fp32 y no existe version GGUF ni safetensors. El despliegue requiere el codigo `kestrel` del curso.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (checkpoints didacticos de MoE de ~22M de parametros con comparacion de optimizadores).

## Limitaciones y advertencias

- No es un modelo para produccion: son checkpoints de un ejercicio de curso tras 1500 pasos de preentrenamiento, sin ajuste fino ni alineacion.
- Ventana de contexto muy limitada (512 tokens), insuficiente para la mayoria de aplicaciones reales.
- Entrenado sobre una muestra reducida de FineWeb-Edu (sample-10BT) en ingles; el comportamiento en castellano no esta documentado.
- Riesgo elevado de alucinacion y de texto incoherente por el escaso entrenamiento.
- Sesgos: no evaluados; heredables del corpus FineWeb-Edu.
- Licencia "other" sin terminos explicitos en la model card: es necesario contactar con el autor antes de cualquier uso comercial. Los datos subyacentes tienen licencia ODC-By 1.0.
- El codigo del modelo (`kestrel.model.model`) no esta incluido en el repositorio; sin el, los checkpoints no son utilizables directamente.
- No hay versiones cuantizadas ni formatos estandar de despliegue (safetensors, GGUF).

## Enlaces

- HuggingFace: https://huggingface.co/Dropdead072/kestrel-22m-checkpoints
- Repositorio de codigo y enlace al curso: no disponible (la model card contiene un marcador "<впишите>" sin rellenar)
- Paper: no disponible
- Blog o demo: no disponible
