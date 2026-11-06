# fdsffjdkf/ClearTrans-3B-SFT-Go-to-Cpp

## Resumen

ClearTrans-3B-SFT-Go-to-Cpp es un checkpoint de ajuste fino supervisado (SFT) construido sobre Qwen2.5-Coder-3B, especializado en una unica direccion de traduccion de codigo: de Go a C++. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo codigo de implementacion y replicacion esta en un repositorio de GitHub externo. El modelo resuelve el problema acotado de convertir codigo Go en C++ idiomatico o funcionalmente equivalente, y resulta relevante para quien necesite evaluar traduccion automatica de codigo entre lenguajes con un modelo pequeno que quepa en hardware modesto.

La arquitectura es la de Qwen2.5-Coder-3B: un transformer decoder-only con 3.085.938.688 parametros (aproximadamente 3,09 mil millones), pesos en safetensors y un repositorio de 6,8 GB. El entrenamiento se realizo con Llama Factory en configuracion multi-GPU (8 dispositivos), 3 epocas, learning rate 1e-5 y batch total de 64. La model card advierte explicitamente que este checkpoint no ha sido validado para inferencia en GPU ni para reproduccion de benchmarks, y que es una liberacion de pesos, no una reproduccion numerica completa de los experimentos del manuscrito asociado.

La licencia es la Qwen Research License Agreement (identificada como `qwen-research`), lo que restringe el uso a investigacion y evaluacion no comercial. El modelo tiene cero descargas y cero likes en el momento de la ficha, y no declara idiomas soportados. Es, por tanto, un recurso experimental de nicho, adecuado para investigacion sobre traduccion de codigo, no para despliegue en produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, base Qwen2.5-Coder-3B) |
| Parametros totales | 3.085.938.688 (~3,09 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la tarea es traduccion de codigo Go a C++; no se declara cobertura de lenguaje natural) |
| Licencia | Qwen Research License Agreement (`qwen-research`), uso no comercial de investigacion y evaluacion |
| Formato de pesos | safetensors (transformers); repositorio de 6,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Coder-3B, un transformer decoder-only denso con atencion causal estandar y 3,09 mil millones de parametros. Sobre esa base se aplico un ajuste fino supervisado completo (full SFT, no LoRA) con Llama Factory. La metadata de entrenamiento registra learning rate 1e-5, scheduler coseno, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, batch por dispositivo de 1 con 8 pasos de acumulacion de gradiente, batch total de 64, 8 dispositivos en configuracion multi-GPU, semilla 42 y 3 epocas. El entorno registrado es Transformers 4.57.1 y PyTorch 2.9.1.

El dataset de entrenamiento se identifica como `train_full_1231_go2cpp_idx3`, un conjunto especifico de la direccion Go a C++. La model card senala que los ejemplos de entrenamiento no se incluyen en el repositorio y que el nombre por si solo no verifica la procedencia ni el procedimiento de reconstruccion del dataset. No se documenta el numero de tokens de entrenamiento, la composicion del corpus ni si hubo etapas posteriores de RLHF, DPO o GRPO; de hecho, la propia tarjeta aclara que este checkpoint no debe interpretarse como un checkpoint final entrenado con GRPO. No se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de codigo Go a C++: es la capacidad central y unica declarada del checkpoint, entrenado de forma especifica para esa direccion.
- Generacion de texto y codigo: hereda la capacidad base de Qwen2.5-Coder-3B para producir codigo y texto, aunque el ajuste fino esta orientado a la tarea de traduccion.
- Conversacion multiturno: el repositorio incluye la plantilla de chat del tokenizer, por lo que el modelo puede formatearse para interacciones conversacionales.
- Tool calling / function calling: no disponible (no se documenta soporte explicito).
- Agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible; no se declara cobertura de idiomas naturales.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo es solo de texto.

## Casos de uso

- Migracion asistida de bases de codigo Go a C++: el modelo puede tomar funciones o modulos Go y generar equivalentes en C++, sirviendo como primer borrador que un ingeniero revisa y valida con tests. Es adecuado por su entrenamiento especifico en esa direccion.
- Investigacion sobre traduccion automatica de codigo: al ser un checkpoint SFT de direccion unica, permite estudiar el efecto del ajuste fino supervisado en tareas de code translation frente a modelos base, comparando con Qwen2.5-Coder-3B sin ajustar.
- Generacion de corpus paralelos Go-C++: se puede usar para producir pares de traduccion que alimenten estudios de calidad o entrenamiento de evaluadores automaticos, siempre con revision humana.
- Portabilidad de utilidades y librerias pequenas: para fragmentos autocontenidos (funciones de utilidad, parsers sencillos, logica de negocio), el modelo puede generar una version C++ que reduzca el trabajo manual inicial.
- Evaluacion de herramientas de analisis estatico: los pares generados permiten probar linters, analizadores y compiladores sobre codigo C++ producido automaticamente, midiendo tasas de error funcional.
- Prototipado en entornos con recursos limitados: al tener 3,09 mil millones de parametros, puede ejecutarse en una sola GPU consumer para experimentos de laboratorio, lo que lo hace util en investigacion con presupuesto de hardware modesto.
- Docencia y demostraciones de traduccion de lenguajes: sirve para ilustrar diferencias semanticas entre Go y C++ (gestion de memoria, concurrencia, interfaces) en materiales didacticos, con supervision del instructor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se atribuye ninguna puntuacion de benchmark del manuscrito a este checkpoint y que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta liberacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16/bf16, el modelo ocupa aproximadamente 6,2 GB solo para pesos; con cuantizacion a 8 bits, alrededor de 3,1 GB, y a 4 bits, en torno a 1,6 GB (estimaciones teoricas a partir de los 3,09 mil millones de parametros; no documentadas por el autor).
- GPU recomendadas: para fp16, una GPU con 8-12 GB de VRAM es suficiente (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090). Para mayor throughput, A100 o H100 con vLLM.
- Cabe en GPU consumer: si, en tarjetas con al menos 8 GB de VRAM en fp16 y en GPUs de 4-6 GB con cuantizacion a 4 bits.
- Opciones de despliegue: transformers (metodo documentado por el autor), vLLM y TGI (el modelo declara compatibilidad con text-generation-inference y endpoints_compatible), llama.cpp u Ollama previa conversion a GGUF (no se publican pesos GGUF).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Go-to-Cpp | ~3,09 mil millones | no disponible | Traduccion Go a C++ (SFT) | Qwen Research (no comercial) | Hugging Face, 0 descargas |
| Qwen2.5-Coder-3B (base) | ~3,09 mil millones | no disponible en esta ficha | Generacion de codigo general | Apache 2.0 (modelo base original) | Hugging Face, ampliamente usado |
| CodeT5+ / CodeT5 (variantes ~3B) | ~2-3 mil millones | no disponible | Code translation y generacion | Apache 2.0 (segun variante) | Hugging Face |
| Qwen2.5-Coder-7B | ~7 mil millones | no disponible en esta ficha | Generacion de codigo general | Apache 2.0 | Hugging Face |

La comparativa con CodeT5+ y Qwen2.5-Coder-7B se ofrece como referencia de categoria; los datos de contexto y rendimiento de esos modelos no se detallan aqui por no estar en la informacion proporcionada. La diferencia clave de ClearTrans es su especializacion en una unica direccion de traduccion y su licencia restrictiva a investigacion.

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; el autor recomienda evaluar las salidas con los tests y herramientas de analisis previstos antes de confiar en ellas.
- El checkpoint no ha sido validado para inferencia en GPU ni para reproduccion de benchmarks; no hay evidencia publicada de su calidad real.
- No se incluyen datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas; es una liberacion de pesos, no una reproduccion numerica completa.
- El dataset de entrenamiento no esta incluido y su procedencia no esta verificada por el nombre.
- La licencia Qwen Research License Agreement restringe el uso a investigacion y evaluacion no comercial; no se relicencia bajo MIT ni Apache 2.0.
- No se declara cobertura de idiomas naturales ni longitud de contexto, lo que limita la planificacion de despliegues.
- Riesgo de alucinacion y de sesgos: no documentado por el autor; al ser un modelo de codigo, el riesgo principal es la generacion de codigo C++ sintacticamente plausible pero semanticamente incorrecto.
- Cero descargas y cero likes: no hay senal de adopcion ni de validacion por parte de la comunidad.
- El repositorio es de fecha 2026-11-02 y el autor es un usuario individual, no una organizacion establecida; conviene tratar el artefacto como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Go-to-Cpp
- Modelo base Qwen2.5-Coder-3B: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio de implementacion y replicacion ClearTrans: https://github.com/Xingzhehu/ClearTrans
- Licencia del modelo (incluida en el repositorio): LICENSE
- Aviso de atribucion y modificaciones: NOTICE
