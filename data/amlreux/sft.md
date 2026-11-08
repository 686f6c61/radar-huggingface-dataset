# Amlreux/sft

## Resumen

Amlreux/sft es un modelo de generacion de texto obtenido al fusionar (merge) un adaptador LoRA de ajuste supervisado (SFT) denominado RMC-Sec sobre el modelo base Qwen/Qwen2.5-14B-Instruct-1M. Lo publica el usuario Amlreux en Hugging Face y su proposito declarado es servir como inicializacion del entrenamiento por refuerzo (RL) del proyecto RMC-Sec, no como un checkpoint final de RL. Por tanto, es una pieza intermedia de un pipeline de investigacion mas que un modelo listo para produccion.

El modelo hereda la arquitectura transformer densa de Qwen2.5-14B-Instruct-1M, con 14.770.033.664 parametros totales segun los pesos en safetensors y una ventana de contexto nominal de hasta 1M tokens (segun el nombre del checkpoint base). Los pesos se distribuyen en formato bfloat16 safetensors y el repositorio ocupa 29,6 GB. La model card es muy escueta y no documenta el dataset de SFT, el numero de pasos, hiperparametros ni evaluaciones.

Su relevancia es limitada y acotada: interesa a quienes quieran reproducir o auditar la fase SFT del proyecto RMC-Sec, o reutilizar el adaptador fusionado como punto de partida. No hay descargas ni likes registrados, no se declaran idiomas y la licencia aplicable es la del checkpoint base de Qwen, no una licencia propia del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, decoder-only), derivado de Qwen2.5-14B-Instruct-1M |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 1M tokens segun el checkpoint base (Qwen2.5-14B-Instruct-1M); no verificado en este modelo |
| Tipos de cuantizacion | no disponible en el repositorio (pesos publicados en bfloat16); al ser compatible con transformers es cuantizable con herramientas externas (GPTQ, AWQ, GGUF), pero no se ofrecen artefactos cuantizados |
| Idiomas soportados | no disponible (no declarados; hereda los del base Qwen2.5, no documentados aqui) |
| Licencia | la del checkpoint base Qwen (se incluye el fichero LICENSE de Qwen); no se especifica una licencia propia |
| Formato de pesos | safetensors en bfloat16 |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-14B-Instruct-1M: un transformer decoder-only denso de aproximadamente 14,77 mil millones de parametros, sin mezcla de expertos. Sobre esa base se aplico un ajuste supervisado (SFT) mediante un adaptador LoRA (RMC-Sec SFT LoRA), que posteriormente se fusiono en los pesos del modelo base para producir este repositorio. El resultado es un checkpoint denso en bfloat16, sin adaptadores separados.

La informacion disponible no detalla el dataset de SFT, el volumen de tokens, la composicion de los datos, ni si hubo etapas de RLHF o DPO. Tampoco se registra la revision exacta del checkpoint base utilizada, lo que limita la reproducibilidad. La unica innovacion tecnica documentada es el propio flujo de merge LoRA a pesos completos; no se mencionan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct-1M.
- Razonamiento e instrucciones generales, presumiblemente reforzados por el SFT del proyecto RMC-Sec (sin evaluacion publicada).
- Procesamiento de contextos largos hasta 1M tokens segun el checkpoint base (no verificado en este merge).
- Compatibilidad con text-generation-inference y endpoints compatibles (segun los tags del repositorio).
- Capacidades multilingues: no documentadas en esta ficha; dependen del base Qwen2.5, cuyos idiomas no se declaran aqui.
- Tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Reproduccion de experimentos de RL: usar este checkpoint como inicializacion exacta de la fase de refuerzo del proyecto RMC-Sec, comparando trayectorias frente al base sin SFT.
- Auditoria de adaptadores LoRA fusionados: verificar que el merge conserva el comportamiento del adaptador RMC-Sec comparando salidas antes y despues de la fusion.
- Investigacion sobre SFT en dominios de seguridad: si el prefijo "RMC-Sec" indica un dominio de seguridad, el modelo sirve como punto de partida para estudiar como el SFT especializado altera el comportamiento del base.
- Evaluacion de deriva respecto al base: medir diferencias de perplexidad, tasas de rechazo y calidad de respuesta entre este merge y Qwen2.5-14B-Instruct-1M original.
- Prototipado de asistentes conversacionales de contexto largo: aprovechar la ventana de hasta 1M tokens del base para tareas de resumen o QA sobre documentos extensos, siempre validando el comportamiento tras el SFT.
- Fine-tuning posterior: emplear el checkpoint como base para nuevos ajustes (DPO, RLHF o SFT adicional) cuando se requiera partir de un modelo ya adaptado al dominio del proyecto.
- Despliegue interno de referencia: servir el modelo con TGI o transformers en entornos controlados para comparar latencia y calidad frente a alternativas, sin asumir garantias de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 29,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren 40-48 GB o mas para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: en torno a 15-16 GB para pesos.
- VRAM estimada en cuantizacion 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 8-9 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para bfloat16 sin cuantizar; A6000/RTX 6000 Ada (48 GB) como minimo comodo.
- GPU de consumo: cabe en RTX 4090 (24 GB) solo con cuantizacion a 8 o 4 bits y contextos reducidos; en 16 GB (RTX 4080, 4060 Ti) solo con cuantizacion agresiva y contexto corto.
- Opciones de despliegue: transformers, text-generation-inference (soportado segun tags), vLLM y llama.cpp/Ollama tras conversion a GGUF (no se ofrecen artefactos preconvertidos).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Amlreux/sft (este modelo) | 14,77 B | hasta 1M (heredado del base) | la del base Qwen | Hugging Face, 0 descargas | Checkpoint intermedio de SFT, sin benchmarks |
| Qwen/Qwen2.5-14B-Instruct-1M | 14,77 B | 1M | licencia Qwen | Hugging Face, ampliamente usado | Modelo base original, con evaluaciones publicadas por Qwen |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 tokens (segun especificaciones de Qwen2.5) | licencia Qwen | Hugging Face | Variante estandar de contexto corto del mismo tamano |
| Mistral Nemo 12B Instruct | ~12 B | 128.000 tokens | Apache 2.0 | Hugging Face | Alternativa de tamano similar con licencia permisiva |

La comparacion de rendimiento frente a estos modelos no puede establecerse porque este checkpoint no publica evaluaciones propias.

## Limitaciones y advertencias

- No es un checkpoint final: la model card indica explicitamente que es la inicializacion de SFT para el run de RL, no el modelo entrenado por refuerzo.
- Ausencia total de evaluaciones: no hay benchmarks, ni comparaciones con el base, ni analisis de regresiones tras el SFT.
- Reproducibilidad limitada: no se registro la revision exacta del checkpoint base de Qwen utilizada en el merge.
- Dataset de SFT no documentado: se desconoce la composicion, el volumen y posibles sesgos introducidos durante el ajuste.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluacion especifica no puede acotarse.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingue concreto sin pruebas.
- Licencia: no hay licencia propia; se aplica la del checkpoint base Qwen, cuyos terminos deben revisarse antes de cualquier uso comercial. El autor no ofrece garantias adicionales.
- Uso en produccion desaconsejado sin validacion previa: el modelo tiene 0 descargas y 0 likes, sin senales de uso comunitario ni auditoria externa.
- Contexto de 1M tokens: aunque el base lo soporta, no hay verificacion de que el merge conserve esa capacidad ni de su calidad en contextos extremos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amlreux/sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-1M
