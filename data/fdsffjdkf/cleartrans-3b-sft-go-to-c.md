# fdsffjdkf/ClearTrans-3B-SFT-Go-to-C

## Resumen

ClearTrans 3B SFT Go-to-C es un checkpoint de ajuste fino supervisado (SFT) publicado por el usuario fdsffjdkf como parte del artefacto ClearTrans. Se construye sobre Qwen/Qwen2.5-Coder-3B y esta especializado en una unica direccion de traduccion de codigo: de Go a C. No es un modelo generalista, sino una pieza de un pipeline de traduccion automatica de codigo entre lenguajes, entrenada con un dataset direccion-especifico denominado `train_full_1231_go2c_idx3`.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-Coder, con 3.085.938.688 parametros totales (aproximadamente 3,09 mil millones) y pesos en formato safetensors. El repositorio ocupa 6,8 GB, lo que corresponde a pesos en precision completa (probablemente bf16) sin cuantizaciones publicadas. La model card no documenta la longitud de contexto efectiva del checkpoint, aunque hereda la del modelo base.

La relevancia de esta ficha es limitada pero concreta: se trata de un release de pesos con validacion unicamente de estructura de ficheros, layout de tensores e indices de shards. El propio autor advierte que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta version, por lo que debe tratarse como material de investigacion reproducible mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (heredada del base Qwen2.5-Coder-3B) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo; sin GGUF ni AWQ publicados) |
| Idiomas soportados | No disponible (orientado a codigo fuente Go y C) |
| Licencia | Qwen Research License Agreement (licencia `other`, no comercial) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Coder-3B |
| Etapa de entrenamiento | SFT (no GRPO) |
| Direccion de traduccion | Go a C |
| Libreria | transformers (entorno de entrenamiento: Transformers 4.57.1, PyTorch 2.9.1) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen2.5-Coder-3B, un transformer decoder-only denso con atencion causal estandar y RoPE. No se introducen modificaciones arquitectonicas: el release es un ajuste fino completo (full fine-tuning) de todos los pesos del modelo base, no un adaptador LoRA ni una variante MoE o hibrida. El tokenizer y la plantilla de chat se conservan del export de entrenamiento.

Los hiperparametros documentados en la model card son: learning rate 1e-05, batch total de 64 (batch por dispositivo 1, 8 dispositivos, 8 pasos de acumulacion de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno, 3 epocas y semilla 42. El entrenamiento se ejecuto en configuracion multi-GPU con 8 dispositivos, presumiblemente mediante Llama Factory segun las etiquetas del repositorio. El dataset identificado es `train_full_1231_go2c_idx3`, direccion-especifico para Go a C, aunque los ejemplos de entrenamiento no se incluyen en el repositorio y su procedencia no queda verificada por el nombre.

No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF, DPO o GRPO. El autor indica explicitamente que este checkpoint no debe interpretarse como una version final entrenada con GRPO.

## Capacidades

- Traduccion de codigo fuente de Go a C: es la funcion principal y practicamente exclusiva del checkpoint.
- Generacion de texto y codigo conversacional: hereda la plantilla de chat del modelo base y la interfaz `text-generation`.
- Razonamiento sobre codigo: al derivar de Qwen2.5-Coder, conserva capacidad para interpretar semantica de programas, aunque el ajuste fino la ha reorientado hacia la traduccion.
- Soporte de tool calling: no documentado en la model card; no se garantiza que el ajuste fino lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado ni validado para este checkpoint.
- Capacidades multilingues: no documentadas; el modelo base las tenia, pero el ajuste fino direccional puede haberlas degradado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Migracion de microservicios Go a C: el modelo puede generar traducciones de funciones y paquetes Go a C para integrarlos en bases de codigo legacy o en sistemas embebidos donde Go no esta disponible, siempre con revision y tests posteriores.
- Modernizacion de utilidades CLI: traduccion de herramientas de linea de comandos escritas en Go a C para reducir dependencias de runtime o binarios estaticos en entornos restringidos.
- Generacion de borradores para reescritura manual: uso como asistente que produce una primera version en C de un modulo Go, que un ingeniero revisa y corrige, acelerando la portabilidad.
- Investigacion en traduccion automatica de codigo: el checkpoint sirve como linea base SFT para experimentos de traduccion entre lenguajes y para comparar con etapas posteriores de RL (GRPO) del mismo artefacto ClearTrans.
- Construccion de datasets sinteticos de pares Go-C: generar traducciones candidatas que, tras filtrado y validacion con compilador y tests, alimenten corpus de entrenamiento.
- Evaluacion de pipelines de traduccion con verificacion formal: integrar el modelo en un pipeline que compile el C generado y ejecute tests diferenciales contra el original en Go para medir fidelidad semantica.
- Analisis de portabilidad en auditorias tecnicas: estimar el esfuerzo de migracion de un repositorio Go a C generando traducciones de referencia y midiendo la tasa de errores funcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se atribuye ninguna puntuacion de benchmark del manuscrito a este checkpoint y que la reproduccion de benchmarks no ha sido validada para este release.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5 a 4,5 GB (requiere cuantizacion manual, no hay versiones prepublicadas).
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2 a 3 GB (requiere convertir a GGUF o GPTQ por cuenta propia).
- GPU recomendadas: A100, H100 o L40S para lotes grandes y evaluacion sistematica; RTX 4090, RTX 3090 o RTX 4080 suficientes para inferencia individual en bf16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16, y en tarjetas de 4 a 6 GB si se cuantiza.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`), vLLM y TGI (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama solo tras conversion manual a GGUF, no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Go-to-C | 3,09 B | No disponible | Traduccion Go a C (SFT) | Qwen Research (no comercial) | Pesos safetensors en HF |
| Qwen2.5-Coder-3B | 3,09 B | 32.768 tokens (segun modelo base publico) | Generacion y razonamiento de codigo general | Apache 2.0 (modelo base) | Pesos safetensors y GGUF en HF |
| Qwen2.5-Coder-1.5B | 1,5 B | 32.768 tokens | Codigo general, menor capacidad | Apache 2.0 | Pesos safetensors y GGUF |
| CodeLlama-7B | 6,7 B | 16.384 tokens | Codigo general | Llama 2 Community | Pesos y GGUF |

La comparativa directa con el modelo base es la mas relevante: ClearTrans hereda tamano y arquitectura de Qwen2.5-Coder-3B, pero restringe su utilidad a una direccion de traduccion y cambia la licencia a no comercial. Frente a modelos generalistas de codigo, su ventaja potencial es la especializacion; su desventaja es la ausencia de benchmarks publicados y de validacion de inferencia.

## Limitaciones y advertencias

- No hay benchmarks publicados ni reproduccion validada: el autor solo confirma comprobaciones de tamano de fichero, layout de tensores e indices de shards.
- Las traducciones generadas pueden contener errores funcionales y code smells; es obligatorio validarlas con compilador, tests y herramientas de analisis estatico.
- El ajuste fino es direccional (Go a C); no se espera buen rendimiento en la direccion inversa ni en otros pares de lenguajes.
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado con datos web y de codigo, puede reproducir sesgos de estilo, licencias de codigo fuente y patrones idiomaticos de Go.
- Riesgo de alucinacion: alto en APIs inexistentes, funciones de biblioteca inventadas o construcciones de C no validas; el modelo no dispone de verificador integrado.
- Limitaciones de contexto e idioma no documentadas; el ajuste fino puede haber reducido el rendimiento multilingue del modelo base.
- Licencia Qwen Research: uso permitido solo para investigacion y evaluacion no comercial; no esta relicenciado bajo MIT ni Apache-2.0. El uso comercial requiere revisar el acuerdo upstream.
- El repositorio no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas; es un release de pesos, no una reproduccion numerica completa.
- El checkpoint no debe presentarse como version final GRPO del artefacto ClearTrans.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Go-to-C
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio de implementacion y replicacion ClearTrans: https://github.com/Xingzhehu/ClearTrans
- Licencia Qwen Research incluida en el repositorio: LICENSE (referenciado en la model card)
- Aviso de atribucion y modificaciones: NOTICE (referenciado en la model card)
