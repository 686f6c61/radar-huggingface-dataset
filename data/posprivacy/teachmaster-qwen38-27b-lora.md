# posprivacy/teachmaster-qwen38-27b-lora

## Resumen

TeachMaster Qwen3.8-27B LoRA es un adaptador LoRA de tipo SFT (supervised fine-tuning) desarrollado por el usuario posprivacy sobre el modelo base Qwen/Qwen3.8-27B. Su proposito es muy concreto: transformar texto de lecciones educativas, junto con JSON de planificacion de imagenes y requisitos de presentacion, en codigo TSX ejecutable para React/Remotion que renderiza escenas de animacion didactica. No es un modelo generalista, sino un ajuste orientado a una tarea de generacion de codigo visual para video educativo en chino.

El adaptador tiene rango 64, alpha 128 y dropout 0.05, y se aplica exclusivamente a las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del transformer subyacente. El repositorio contiene unicamente los pesos del adaptador (aproximadamente 161 MiB en safetensors, 0.2 GB de tamano total de repo), no el modelo base completo. La arquitectura del modelo base corresponde a `Qwen3_5ForConditionalGeneration`, es decir, la implementacion de Qwen3.5 pese al nombre comercial Qwen3.8.

El modelo es relevante en el nicho de generacion automatica de material didactico audiovisual: permite pasar de un guion de clase a una composicion visual animada sin intervencion manual de maquetacion. Su alcance es limitado y experimental (cero descargas, cero likes en el momento de la consulta, sin licencia declarada), por lo que debe tratarse como una prueba de concepto mas que como una herramienta de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5 (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | no disponible (adaptador LoRA de ~161 MiB; el modelo base Qwen3.8-27B no se distribuye en este repo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible para el adaptador; corte de secuencia en entrenamiento: 12.288 tokens |
| Tipos de cuantizacion | no disponible (entrenado en BF16; el adaptador se distribuye en safetensors) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA: `adapter_model.safetensors`) |
| Rango LoRA | 64 (alpha 128, dropout 0.05) |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| Modelo base | Qwen/Qwen3.8-27B |
| Libreria | PEFT 0.18.1, Transformers 5.8 |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer denso de la familia Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con LoRA de rango 64 y alpha 128 aplicado solo a las cuatro proyecciones de atencion. El entrenamiento fue un SFT puro sobre generacion de TSX: los tokens del prompt se excluyen de la loss, de modo que el modelo aprende exclusivamente a predecir el codigo de salida. No hubo supervision de chain-of-thought; el modo thinking esta desactivado. El conjunto de entrenamiento consta de 11.450 ejemplos y 515 de validacion, divididos por "source job" para evitar fuga de datos entre splits.

El entrenamiento se ejecuto en BF16 sobre 8 GPUs NVIDIA A800 de 80 GB, con batch efectivo de 32 (8 GPUs x microbatch 1 x acumulacion 4), 2 epocas, 716 pasos, LR pico 5e-5 con decaimiento coseno y 3% de warmup, durante aproximadamente 12,5 horas. El corte de secuencia fue de 12.288 tokens, lo que provoca truncamiento en 479 ejemplos de entrenamiento y 19 de validacion. La loss media final de entrenamiento fue 0.185514 y la de validacion 0.173346, mejorando desde 0.1851 en el paso 100. Es importante senalar que esta metrica mide prediccion de tokens de codigo, no calidad estetica del layout, correccion del contenido ni sincronizacion de la animacion.

## Capacidades

- Generacion de codigo TSX completo para React/Remotion a partir de texto de leccion en Markdown y JSON de planificacion de imagenes.
- Composicion de escenas didacticas con titulos, paneles de definicion, diagramas de flujo, formulas y tarjetas de aplicacion en un lienzo de 1920 x 1080.
- Colocacion de imagenes mediante componentes `Img` y `staticFile`, respetando rutas de assets y ratios indicados en la entrada.
- Animacion basada en frames (frame-based animation) dentro del ecosistema Remotion.
- Generacion de composiciones con duracion variable (en las pruebas produjo piezas de 16 y 21 segundos).
- Capacidad multilingue limitada a chino e ingles, con el foco funcional en contenido educativo en chino.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- No se documenta modo thinking ni capacidades de vision, audio o matemáticas avanzadas mas alla de formulas renderizadas como texto.

## Casos de uso

- Generacion automatica de video didactico: a partir de un guion de clase en Markdown, el adaptador produce el TSX que Remotion renderiza como escena animada, eliminando la maquetacion manual de cada leccion.
- Produccion de material educativo a escala: un equipo docente puede convertir un banco de lecciones en piezas audiovisuales con un pipeline batch, ya que la salida es codigo determinista y versionable en Git.
- Prototipado rapido de layouts didacticos: el modelo propone composiciones con imagen, texto y diagrama que un disenador puede refinar, reduciendo el tiempo de exploracion inicial.
- Generacion de explicaciones visuales de conceptos abstractos: en la galeria del autor se muestra una leccion solo texto convertida en resumen de aplicaciones y formula bayesiana destacada, util para divulgacion cientifica.
- Integracion en CMS o plataformas de e-learning: el TSX generado puede almacenarse como componente y renderizarse bajo demanda, permitiendo plantillas de curso dinamicas.
- Creacion de demos tecnicas o tutoriales de IA: el modelo ilustra pipelines (por ejemplo, reconocimiento de voz de extremo a extremo) con diagramas y comparativas lado a lado.
- Experimentacion en investigacion sobre code generation condicionada por estructura: sirve como caso de estudio de SFT con LoRA sobre una tarea de dominio muy especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara un `model-index` vacio y solo reporta metricas de entrenamiento y una prueba cualitativa de humo: dos paginas retenidas, decodificacion greedy, thinking desactivado, maximo 16.384 tokens nuevos, ambas salidas terminadas con EOS (5.267 y 5.322 tokens), y los 5 frames de fin de escena renderizados sin errores de runtime.

| Metrica | Valor |
|---|---|
| Loss media final de entrenamiento | 0.185514 |
| Loss final de validacion | 0.173346 |
| Loss de validacion en paso 100 | 0.1851 |
| Ejemplos de entrenamiento / validacion | 11.450 / 515 |
| Pasos totales | 716 (2 epocas) |
| Ejemplos truncados al corte de 12.288 tokens | 479 train / 19 validacion |
| Prueba cualitativa | 2 paginas retenidas, 5 escenas renderizadas, sin errores de runtime |

## Requisitos de hardware

- El adaptador ocupa aproximadamente 161 MiB en safetensors; el requisito real de VRAM lo determina el modelo base Qwen3.8-27B, no disponible en este repositorio.
- Para inferencia del modelo base en BF16 se requiere hardware de clase servidor; el autor entreno con 8 x NVIDIA A800 de 80 GB, lo que da una idea del orden de magnitud del modelo base.
- GPU recomendadas para el modelo base: A100 80 GB, H100, A800; para cuantizaciones agresivas del base habria que consultar la ficha del modelo Qwen3.8-27B, no disponible aqui.
- No se dispone de datos para confirmar si el modelo base cabe en GPUs consumer (RTX 4090, etc.) en cuantizacion; no disponible.
- Opciones de despliegue: el autor probo Transformers 5.8 + PEFT 0.18.1 con BF16, `flash-linear-attention` y `causal-conv1d`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| TeachMaster Qwen3.8-27B LoRA | Adaptador LoRA SFT | no disponible (base 27B) | no disponible (corte 12.288 en entrenamiento) | no disponible | Especifico para TSX educativo en chino |
| Qwen/Qwen3.8-27B | Modelo base denso | 27B (segun nombre) | no disponible | no disponible | Base generalista sobre la que se monta el adaptador |
| Alternativas de code generation generalista | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria; los datos de benchmarks del adaptador estan vacios y no se aportan resultados de terceros.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador LoRA; es imprescindible descargar y cargar el modelo base Qwen/Qwen3.8-27B por separado.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- El autor reconoce una debilidad de layout: en una de las escenas se deja demasiado espacio en blanco en el centro del frame.
- La duracion generada no respeta necesariamente la solicitada: se pidieron aproximadamente 40 segundos y el modelo produjo composiciones de 16 y 21 segundos.
- La validacion es una prueba cualitativa de 2 paginas, no un benchmark; no hay evidencia de calidad en animacion completa ni de alineacion con narracion.
- El corte de 12.288 tokens trunca 479 ejemplos de entrenamiento y 19 de validacion, por lo que lecciones largas pueden quedar fuera de distribucion.
- Idiomas limitados a chino e ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion en contenido didactico: el modelo puede generar afirmaciones incorrectas o formulas erroneas aunque el codigo compile.
- Sin soporte documentado de tool calling ni agentes; no apto para flujos que requieran invocacion de funciones.
- El nombre "Qwen3.8" no coincide con la arquitectura real (`Qwen3_5ForConditionalGeneration`), lo que puede confundir en la seleccion de versiones de Transformers.
- Cero descargas y cero likes en el momento de la consulta: proyecto sin validacion comunitaria.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/posprivacy/teachmaster-qwen38-27b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Configuracion del adaptador: https://huggingface.co/posprivacy/teachmaster-qwen38-27b-lora/blob/main/adapter_config.json
- Pesos del adaptador: https://huggingface.co/posprivacy/teachmaster-qwen38-27b-lora/blob/main/adapter_model.safetensors
- Curva de loss de entrenamiento: https://huggingface.co/posprivacy/teachmaster-qwen38-27b-lora/blob/main/training_loss.png
- Curva de loss de validacion: https://huggingface.co/posprivacy/teachmaster-qwen38-27b-lora/blob/main/training_eval_loss.png
