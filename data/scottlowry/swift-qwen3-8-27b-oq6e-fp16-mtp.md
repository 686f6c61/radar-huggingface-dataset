# scottlowry/Swift-Qwen3.8-27b-oQ6e-fp16-mtp

## Resumen

Swift-Qwen3.8-27b-oQ6e-fp16-mtp es una cuantizacion de precision mixta del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario scottlowry en Hugging Face. Se ha generado con la herramienta oQ (oMLX v0.7.4.dev1), especializada en cuantizacion de precision mixta para el ecosistema MLX de Apple. El checkpoint resultante ocupa 24,8 GB en disco y emplea una media efectiva de 7,138 bits por peso, combinando bloques de 6 bits, 8 bits, FP16 y FP32 segun la sensibilidad de cada tensor.

El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5`), con 27.781 millones de parametros totales distribuidos entre el modelo de lenguaje (26.896B), un codificador de vision (0.461B) y una cabeza MTP (multi-token prediction, 0.425B). La presencia de vision y de cabeza MTP sugiere un modelo multimodal con decodificacion especulativa integrada, aunque la model card no aporta detalles sobre arquitectura interna ni datos de entrenamiento.

La relevancia de esta publicacion es practica: ofrece una version cuantizada lista para ejecutarse en hardware Apple Silicon mediante MLX, con un equilibrio entre tamano (23 GiB de pesos) y fidelidad numerica. No obstante, la informacion publicada es muy limitada: no hay licencia declarada, ni idiomas, ni benchmarks, ni pipeline asignado, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), con cabeza MTP para prediccion multi-token; detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 6-bit grupo 64 (88,345% de pesos), affine 8-bit grupo 64 (9,798%), FP16 (0,198%), FP32 (1,658%); media efectiva 7,138 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose de almacenamiento declarado por el autor:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26.896B | 22,526 GB / 20,979 GiB |
| Vision | 0.461B | 1,843 GB / 1,716 GiB |
| Cabeza MTP | 0.425B | 0,418 GB / 0,389 GiB |
| Total | 27.781B | 24,787 GB / 23,085 GiB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags y el desglose de pesos permiten inferir tres componentes: un modelo de lenguaje de 26.896B parametros, un modulo de vision de 0.461B (que se mantiene en FP32, presumiblemente por su sensibilidad numerica) y una cabeza MTP de 0.425B. La etiqueta `qwen3_5` vincula el modelo a la familia Qwen3.5, pero no se especifica si emplea atencion estandar, atencion lineal, mezcla de expertos u otra variante.

Respecto al entrenamiento, no se han publicado en la informacion proporcionada datos sobre volumen de tokens, composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La cuantizacion se realizo con oQ (oMLX v0.7.4.dev1) en modo de precision mixta: el autor asigna 6 bits a la mayoria de tensores, 8 bits a un subconjunto mas sensible (2.722B pesos) y mantiene en FP16 solo 0.055B pesos, mientras que 0.461B quedan en FP32. La cabeza MTP sugiere soporte de decodificacion especulativa o prediccion multi-token, pero no se documenta su uso en inferencia.

## Capacidades

- Generacion de texto y razonamiento: el modelo de lenguaje de 26.896B parametros es el nucleo del checkpoint.
- Procesamiento de vision: incluye un modulo visual de 0.461B parametros, lo que indica capacidad multimodal de entrada de imagenes (no se detalla si genera imagenes).
- Prediccion multi-token (MTP): la cabeza dedicada de 0.425B apunta a decodificacion especulativa o generacion acelerada; su activacion concreta no esta documentada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: al estar empaquetado en formato MLX con 23 GiB de pesos, el modelo puede cargarse en equipos con memoria unificada de 32 GB o superior, lo que permite ejecutar un modelo de 27B en local sin GPU dedicada.
- Prototipado multimodal en estacion de trabajo: el modulo de vision integrado permite experimentar con tareas imagen-texto en un entorno MLX, util para validar pipelines antes de desplegar en infraestructura mayor.
- Evaluacion de cuantizacion de precision mixta: el checkpoint sirve como referencia para comparar la perdida de calidad de oQ a 7,138 bits/peso frente al modelo base en FP16, especialmente en tareas sensibles a errores numericos.
- Investigacion sobre decodificacion especulativa: la cabeza MTP incluida permite estudiar tecnicas de prediccion multi-token y su impacto en latencia dentro del ecosistema MLX.
- Desarrollo de asistentes conversacionales en local: con 26.896B parametros de lenguaje, es adecuado para generar respuestas de calidad en entornos con requisitos de privacidad, siempre que se valide el comportamiento real del modelo.
- Fine-tuning o adaptacion posterior: al conservar ciertos tensores en FP16 y FP32, el checkpoint puede servir de base para ajustes ligeros (LoRA) en MLX, aunque la licencia no declarada obliga a verificar antes los terminos de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 23,085 GiB solo para pesos; con overhead de ejecucion (KV cache, buffers), se recomienda un minimo de 28-32 GB de memoria disponible.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No es directamente compatible con CUDA sin conversion previa.
- Compatibilidad con GPU de consumo: cabe en Mac con 32 GB de memoria unificada o superior; en GPUs NVIDIA de consumo (RTX 4090 con 24 GB) requeriria conversion de formato y posiblemente cuantizacion adicional.
- Opciones de despliegue: MLX y mlx-lm son las vias naturales; para otros entornos seria necesario convertir los pesos a GGUF (llama.cpp, Ollama) o a safetensors estandar (vLLM, TGI), con posible perdida de la estructura de cuantizacion mixta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27b-oQ6e-fp16-mtp | 27,781B | no disponible | safetensors MLX, precision mixta | no disponible | Vision + cabeza MTP; 23 GiB |
| ukisai/Swift-Qwen3.8-27b (base) | no disponible | no disponible | no disponible | no disponible | Modelo original sin cuantizar |
| Otros modelos de ~27B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso, por lo que el uso comercial queda sin autorizacion explicita hasta que el autor o el modelo base la definan.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas concretos.
- Sin benchmarks: no existen datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales que permitan estimar la calidad real del modelo.
- Riesgo de degradacion por cuantizacion: aunque la media es de 7,138 bits/peso, el 88,345% de los pesos estan a 6 bits, lo que puede afectar a tareas de razonamiento numerico o codigo frente al modelo base.
- Dependencia del ecosistema MLX: los pesos estan empaquetados para MLX; su uso fuera de Apple Silicon requiere conversion y puede no preservar la precision mixta.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones que lo cuantifiquen.
- Sesgos: no documentados por el autor; se heredan del modelo base y de sus datos de entrenamiento, no disponibles.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la validacion comunitaria y el soporte.
- Cabeza MTP sin documentacion: se desconoce como activarla o si requiere herramientas especificas de MLX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Swift-Qwen3.8-27b-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
