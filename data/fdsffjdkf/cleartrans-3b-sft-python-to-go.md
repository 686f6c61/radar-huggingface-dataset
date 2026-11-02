# fdsffjdkf/ClearTrans-3B-SFT-Python-to-Go

## Resumen

ClearTrans-3B-SFT-Python-to-Go es un checkpoint de ajuste fino supervisado (SFT) sobre Qwen2.5-Coder-3B, especializado en una unica direccion de traduccion de codigo: de Python a Go. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo codigo de implementacion y replicacion esta en el repositorio de GitHub Xingzhehu/ClearTrans. El modelo resuelve el problema concreto de la traduccion automatica de codigo entre lenguajes, un caso de uso donde los modelos generalistas suelen producir traducciones sintacticamente plausibles pero semanticamente incorrectas.

El checkpoint tiene 3.085.938.688 parametros (aproximadamente 3,09 mil millones) en formato safetensors, con un tamano de repositorio de 6,8 GB. Se distribuye como pesos completos en formato transformers, con tokenizer y chat template incluidos, y esta pensado para inferencia con la libreria transformers y text-generation-inference.

Es relevante ahora porque ejemplifica una tendencia de especializacion: en lugar de un modelo multilingue de proposito general, se publica un checkpoint afinado para una tarea estrecha y bien definida, lo que permite evaluar de forma aislada la calidad de la traduccion Python a Go. No obstante, el propio autor advierte que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release, por lo que debe tratarse como un artefacto de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-Coder-3B |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-Coder-3B, sin confirmar en esta release) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo esta orientado a codigo Python y Go; no se declaran idiomas naturales) |
| Licencia | qwen-research (Qwen Research License Agreement), uso no comercial para investigacion o evaluacion |
| Formato de pesos | safetensors (formato transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-3B, un transformer decoder-only de la familia Qwen2, con atencion causal estandar. El checkpoint no introduce cambios arquitectonicos: es un ajuste fino completo (full fine-tuning) de los pesos del modelo base, no un adaptador LoRA ni una modificacion estructural. El tokenizer y la chat template se conservan del export de entrenamiento.

El entrenamiento se realizo con SFT sobre un dataset identificado en la model card como `train_full_1231_python2go_idx3`, orientado exclusivamente a la direccion Python a Go. Los hiperparametros registrados son: learning rate de 1e-05, batch size de entrenamiento de 1 con acumulacion de gradientes de 8 pasos (batch total de 64), 3 epocas, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno, semilla 42 y entrenamiento distribuido en 8 GPUs. Se registro Transformers 4.57.1 y PyTorch 2.9.1. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO o GRPO; de hecho, el autor aclara que este checkpoint no debe considerarse un checkpoint final entrenado con GRPO.

## Capacidades

- Traduccion de codigo Python a Go como tarea principal y unica direccion soportada por este checkpoint.
- Generacion de texto y codigo en formato conversacional, con chat template incluido.
- Razonamiento sobre estructuras de codigo: funciones, clases, control de flujo e idiomaticas basicas del lenguaje destino.
- Soporte de tool calling / function calling: no disponible de forma declarada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma declarada.
- Capacidades multilingues naturales: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Migracion asistida de utilidades Python a Go: el modelo puede tomar funciones y modulos Python pequenos y generar equivalentes en Go, utiles como primer borrador que un ingeniero revisa y completa con tests propios.
- Prototipado de librerias en Go a partir de referencias Python: para equipos que mantienen una implementacion de referencia en Python y necesitan una version en Go, el checkpoint acelera la generacion del esqueleto inicial.
- Generacion de ejemplos de traduccion para evaluacion: al estar especializado en una sola direccion, sirve para construir conjuntos de comparacion y medir la calidad de traductores de codigo.
- Docencia y formacion en migracion de lenguajes: util para mostrar como se expresan patrones de Python en Go, siempre con revision humana de las salidas.
- Investigacion en traduccion automatica de codigo: como checkpoint SFT de referencia para comparar con modelos generalistas o con variantes entrenadas con RL.
- Preprocesado en pipelines de modernizacion de codigo: integrado como paso de sugerencia dentro de un flujo que valide con `go vet`, `gofmt` y tests unitarios antes de aceptar la traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se atribuye ninguna puntuacion de benchmark del manuscrito a este checkpoint y que la reproduccion de benchmarks no ha sido validada para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8-10 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5-4 GB para pesos; en 4 bits, alrededor de 2-2,5 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 (por ejemplo RTX 3070/4060 Ti de 8 GB con margen ajustado) y con holgura en 12-16 GB.
- Opciones de despliegue: transformers (version compatible con la registrada, 4.57.1), text-generation-inference; llama.cpp, Ollama y vLLM requeririan conversion o soporte no declarado en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Python-to-Go | 3,09 mil millones | no disponible | Traduccion Python a Go (SFT) | qwen-research (no comercial) | HuggingFace, pesos safetensors |
| Qwen2.5-Coder-3B (base) | 3,09 mil millones | no disponible en esta ficha | Generacion de codigo general | Apache 2.0 (modelo base original) | HuggingFace |
| Qwen2.5-Coder-7B | aproximadamente 7,6 mil millones | no disponible en esta ficha | Generacion de codigo general | Apache 2.0 | HuggingFace |

La comparativa se limita al modelo base y a su variante de mayor tamano porque no se dispone de informacion sobre otros modelos especializados en traduccion Python a Go en la documentacion proporcionada.

## Limitaciones y advertencias

- El autor advierte que las traducciones generadas pueden contener errores funcionales y code smells; deben validarse con tests y herramientas de analisis antes de usarse.
- La release no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas; es una publicacion de pesos, no una reproduccion numerica completa de los experimentos.
- La inferencia en GPU y la reproduccion de benchmarks no han sido validadas para este checkpoint.
- La licencia qwen-research restringe el uso a investigacion o evaluacion no comercial; no se relicencia bajo MIT ni Apache-2.0.
- El modelo esta especializado en una unica direccion (Python a Go); no se declara soporte para otras direcciones ni para generacion de codigo general.
- No se documentan sesgos conocidos ni evaluaciones de robustez; el riesgo de alucinacion en APIs y semantica de Go no esta cuantificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La fecha de creacion registrada (2026-11-02) es posterior a la del conocimiento de referencia y debe tratarse con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Python-to-Go
- Repositorio de implementacion y replicacion: https://github.com/Xingzhehu/ClearTrans
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Licencia (Qwen Research License Agreement): incluida en el repositorio como LICENSE
- Aviso de atribucion y modificaciones: incluido en el repositorio como NOTICE
